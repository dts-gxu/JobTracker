#!/bin/bash

# 秋招进度管理系统 - Ubuntu一键部署脚本
# 支持Ubuntu 18.04+ / Debian 10+

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# 检查是否为root用户
check_root() {
    if [[ $EUID -eq 0 ]]; then
        log_error "请不要使用root用户运行此脚本!"
        exit 1
    fi
}

# 检查端口是否被占用
check_port() {
    log_step "检查端口1是否可用..."
    
    if netstat -tuln | grep -q ":1 "; then
        log_error "端口1已被占用！"
        log_info "请检查占用端口1的进程: sudo netstat -tulnp | grep :1"
        exit 1
    fi
    
    log_info "端口1可用"
}

# 检查系统版本
check_system() {
    log_step "检查系统版本..."
    
    if [[ -f /etc/os-release ]]; then
        . /etc/os-release
        OS=$NAME
        VER=$VERSION_ID
    else
        log_error "无法识别操作系统版本"
        exit 1
    fi
    
    log_info "检测到系统: $OS $VER"
    
    # 检查是否为支持的系统
    if [[ $OS != *"Ubuntu"* ]] && [[ $OS != *"Debian"* ]]; then
        log_error "不支持的操作系统: $OS"
        log_info "支持的系统: Ubuntu 18.04+, Debian 10+"
        exit 1
    fi
}

# 更新系统包
update_system() {
    log_step "更新系统包..."
    sudo apt update
    sudo apt upgrade -y
    sudo apt install -y curl wget git unzip software-properties-common net-tools
}

# 安装Python 3.9+
install_python() {
    log_step "检查Python版本..."
    
    if command -v python3 &> /dev/null; then
        PYTHON_VERSION=$(python3 --version | cut -d' ' -f2 | cut -d'.' -f1-2)
        log_info "当前Python版本: $PYTHON_VERSION"
        
        # 检查版本是否满足要求 (3.8+)
        if [[ $(echo "$PYTHON_VERSION >= 3.8" | bc -l) -eq 1 ]]; then
            log_info "Python版本满足要求"
            return
        fi
    fi
    
    log_step "安装Python 3.9..."
    sudo apt install -y python3.9 python3.9-venv python3.9-dev python3-pip
    
    # 创建软链接
    sudo update-alternatives --install /usr/bin/python3 python3 /usr/bin/python3.9 1
}

# 安装PostgreSQL
install_postgresql() {
    log_step "安装PostgreSQL..."
    
    if command -v psql &> /dev/null; then
        log_info "PostgreSQL已安装"
        return
    fi
    
    sudo apt install -y postgresql postgresql-contrib
    sudo systemctl start postgresql
    sudo systemctl enable postgresql
    
    log_info "PostgreSQL安装完成"
}

# 安装Nginx
install_nginx() {
    log_step "安装Nginx..."
    
    if command -v nginx &> /dev/null; then
        log_info "Nginx已安装"
        return
    fi
    
    sudo apt install -y nginx
    sudo systemctl start nginx
    sudo systemctl enable nginx
    
    log_info "Nginx安装完成"
}

# 创建数据库和用户
setup_database() {
    log_step "配置PostgreSQL数据库..."
    
    # 生成随机密码
    DB_PASSWORD=$(openssl rand -base64 32)
    
    # 创建数据库用户和数据库
    sudo -u postgres psql << EOF
CREATE USER job_tracker_user WITH PASSWORD '$DB_PASSWORD';
CREATE DATABASE job_tracker OWNER job_tracker_user;
GRANT ALL PRIVILEGES ON DATABASE job_tracker TO job_tracker_user;
\q
EOF
    
    log_info "数据库配置完成"
    log_info "数据库名: job_tracker"
    log_info "用户名: job_tracker_user"
    log_warn "数据库密码: $DB_PASSWORD (请保存好此密码)"
    
    # 保存密码到文件
    echo "DATABASE_PASSWORD=$DB_PASSWORD" > ~/.job_tracker_db_password
    chmod 600 ~/.job_tracker_db_password
}

# 创建应用目录和用户
setup_app_structure() {
    log_step "创建应用目录结构..."
    
    APP_DIR="/var/www/job_tracker"
    
    # 创建目录
    sudo mkdir -p $APP_DIR
    sudo mkdir -p $APP_DIR/logs
    sudo mkdir -p /etc/job_tracker
    
    # 设置权限
    sudo chown -R $USER:www-data $APP_DIR
    sudo chmod -R 755 $APP_DIR
    
    log_info "应用目录创建完成: $APP_DIR"
}

# 部署应用代码
deploy_application() {
    log_step "部署应用代码..."
    
    APP_DIR="/var/www/job_tracker"
    
    # 复制应用文件
    cp -r . $APP_DIR/
    cd $APP_DIR
    
    # 创建虚拟环境
    python3 -m venv venv
    source venv/bin/activate
    
    # 安装依赖
    pip install --upgrade pip
    pip install -r requirements.txt
    
    # 创建环境配置文件
    cp env_example.txt .env
    
    # 生成安全密钥
    SECRET_KEY=$(python3 -c 'import secrets; print(secrets.token_hex(32))')
    
    # 读取数据库密码
    source ~/.job_tracker_db_password
    
    # 更新环境配置
    sed -i "s/your-super-secret-key-change-this-in-production/$SECRET_KEY/g" .env
    sed -i "s/username:password@localhost:5432/job_tracker_user:$DATABASE_PASSWORD@localhost:5432/g" .env
    
    # 初始化数据库
    python3 -c "
from app import create_app, db
app = create_app('production')
with app.app_context():
    db.create_all()
    print('数据库表创建完成')
"
    
    log_info "应用部署完成"
}

# 配置Gunicorn服务
setup_gunicorn() {
    log_step "配置Gunicorn服务..."
    
    APP_DIR="/var/www/job_tracker"
    
    # 创建Gunicorn配置文件
    sudo tee /etc/job_tracker/gunicorn.conf.py > /dev/null << EOF
# Gunicorn配置文件
bind = "127.0.0.1:1"
workers = 2
worker_class = "sync"
worker_connections = 1000
max_requests = 1000
max_requests_jitter = 100
timeout = 30
keepalive = 2
preload_app = True
user = "root"
group = "www-data"
tmp_upload_dir = None
errorlog = "$APP_DIR/logs/gunicorn_error.log"
accesslog = "$APP_DIR/logs/gunicorn_access.log"
loglevel = "info"
access_log_format = '%(h)s %(l)s %(u)s %(t)s "%(r)s" %(s)s %(b)s "%(f)s" "%(a)s" %(D)s'
EOF

    # 创建systemd服务文件
    sudo tee /etc/systemd/system/job-tracker.service > /dev/null << EOF
[Unit]
Description=Job Tracker Web Application
After=network.target

[Service]
Type=notify
User=root
Group=www-data
WorkingDirectory=$APP_DIR
Environment=PATH=$APP_DIR/venv/bin
Environment=FLASK_ENV=production
ExecStart=$APP_DIR/venv/bin/gunicorn --config /etc/job_tracker/gunicorn.conf.py wsgi:application
ExecReload=/bin/kill -s HUP \$MAINPID
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF

    # 启动服务
    sudo systemctl daemon-reload
    sudo systemctl enable job-tracker
    sudo systemctl start job-tracker
    
    log_info "Gunicorn服务配置完成"
}

# 配置Nginx
setup_nginx_config() {
    log_step "配置Nginx..."
    
    # 删除默认配置
    sudo rm -f /etc/nginx/sites-enabled/default
    
    # 创建应用配置
    sudo tee /etc/nginx/sites-available/job-tracker > /dev/null << 'EOF'
server {
    listen 80;
    server_name _;
    
    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # 文件上传大小限制
    client_max_body_size 16M;
    
    # 静态文件
    location /static {
        alias /var/www/job_tracker/static;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # 应用代理
    location / {
        proxy_pass http://127.0.0.1:1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_redirect off;
        proxy_buffering off;
    }
    
    # 日志
    access_log /var/log/nginx/job_tracker_access.log;
    error_log /var/log/nginx/job_tracker_error.log;
}
EOF
    
    # 启用配置
    sudo ln -sf /etc/nginx/sites-available/job-tracker /etc/nginx/sites-enabled/
    
    # 测试配置
    sudo nginx -t
    
    # 重载Nginx
    sudo systemctl reload nginx
    
    log_info "Nginx配置完成"
}

# 配置防火墙
setup_firewall() {
    log_step "配置防火墙..."
    
    if command -v ufw &> /dev/null; then
        sudo ufw --force enable
        sudo ufw allow ssh
        sudo ufw allow 'Nginx Full'
        sudo ufw allow 1/tcp  # 允许端口1
        sudo ufw status
        log_info "UFW防火墙配置完成"
    else
        log_warn "UFW未安装，跳过防火墙配置"
    fi
}

# 创建备份脚本
create_backup_script() {
    log_step "创建备份脚本..."
    
    sudo tee /usr/local/bin/backup-job-tracker.sh > /dev/null << 'EOF'
#!/bin/bash
# 秋招进度管理系统备份脚本

BACKUP_DIR="/var/backups/job_tracker"
DATE=$(date +%Y%m%d_%H%M%S)
APP_DIR="/var/www/job_tracker"

# 创建备份目录
mkdir -p $BACKUP_DIR

# 备份数据库
source ~/.job_tracker_db_password
pg_dump -h localhost -U job_tracker_user -d job_tracker > $BACKUP_DIR/database_$DATE.sql

# 备份应用文件
tar -czf $BACKUP_DIR/app_$DATE.tar.gz -C /var/www job_tracker

# 删除7天前的备份
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "备份完成: $DATE"
EOF
    
    sudo chmod +x /usr/local/bin/backup-job-tracker.sh
    
    # 添加到crontab (每天凌晨2点备份)
    (crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/backup-job-tracker.sh") | crontab -
    
    log_info "备份脚本创建完成"
}

# 显示部署信息
show_deployment_info() {
    log_step "部署完成！"
    
    echo ""
    echo "=========================================="
    echo "  秋招进度管理系统部署成功！"
    echo "=========================================="
    echo ""
    echo "🌐 访问地址: http://$(hostname -I | awk '{print $1}')"
    echo "📁 应用目录: /var/www/job_tracker"
    echo "📊 日志目录: /var/www/job_tracker/logs"
    echo "🔧 配置文件: /etc/job_tracker/"
    echo ""
    echo "🔑 数据库信息:"
    echo "   - 数据库: job_tracker"
    echo "   - 用户名: job_tracker_user"
    echo "   - 密码文件: ~/.job_tracker_db_password"
    echo ""
    echo "🛠️  常用命令:"
    echo "   - 查看应用状态: sudo systemctl status job-tracker"
    echo "   - 重启应用: sudo systemctl restart job-tracker"
    echo "   - 查看应用日志: tail -f /var/www/job_tracker/logs/gunicorn_error.log"
    echo "   - 查看Nginx日志: tail -f /var/log/nginx/job_tracker_error.log"
    echo "   - 手动备份: sudo /usr/local/bin/backup-job-tracker.sh"
    echo ""
    echo "⚠️  重要提醒:"
    echo "   - 应用使用端口1（系统保留端口），需要root权限运行"
    echo "   - 请确保端口1未被其他服务占用"
    echo ""
    echo "🔒 安全建议:"
    echo "   - 定期更新系统和应用"
    echo "   - 配置SSL证书 (Let's Encrypt)"
    echo "   - 定期检查备份文件"
    echo "   - 监控应用日志"
    echo ""
    echo "✅ 部署完成！请访问上述地址开始使用系统。"
    echo ""
}

# 主函数
main() {
    log_info "开始部署秋招进度管理系统..."
    
    check_root
    check_system
    update_system
    check_port
    install_python
    install_postgresql
    install_nginx
    setup_database
    setup_app_structure
    deploy_application
    setup_gunicorn
    setup_nginx_config
    setup_firewall
    create_backup_script
    show_deployment_info
}

# 执行主函数
main "$@" 