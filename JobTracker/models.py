from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

db = SQLAlchemy()

class User(UserMixin, db.Model):
    """用户模型"""
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False, comment='用户名')
    email = db.Column(db.String(120), unique=True, nullable=False, comment='邮箱')
    password_hash = db.Column(db.String(255), nullable=False, comment='密码哈希')
    real_name = db.Column(db.String(50), comment='真实姓名')
    phone = db.Column(db.String(20), comment='手机号码')
    target_position = db.Column(db.String(100), comment='目标职位')
    graduation_year = db.Column(db.Integer, comment='毕业年份')
    major = db.Column(db.String(100), comment='专业')
    school = db.Column(db.String(100), comment='学校')
    created_at = db.Column(db.DateTime, default=datetime.utcnow, comment='注册时间')
    last_login = db.Column(db.DateTime, comment='最后登录时间')
    is_active = db.Column(db.Boolean, default=True, comment='是否激活')
    
    # 与投递记录的关系
    applications = db.relationship('Application', backref='user', lazy=True, cascade='all, delete-orphan')
    
    def set_password(self, password):
        """设置密码"""
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        """检查密码"""
        return check_password_hash(self.password_hash, password)
    
    def get_stats(self):
        """获取用户的投递统计"""
        total = len(self.applications)
        stats = {
            'total': total,
            'by_status': {}
        }
        
        for status in Application.STATUS_OPTIONS:
            count = sum(1 for app in self.applications if app.status == status)
            stats['by_status'][status] = count
            
        return stats
    
    def to_dict(self):
        """转换为字典格式"""
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'real_name': self.real_name,
            'phone': self.phone,
            'target_position': self.target_position,
            'graduation_year': self.graduation_year,
            'major': self.major,
            'school': self.school,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S') if self.created_at else None,
            'last_login': self.last_login.strftime('%Y-%m-%d %H:%M:%S') if self.last_login else None,
            'application_count': len(self.applications)
        }
    
    def __repr__(self):
        return f'<User {self.username}>'

class Application(db.Model):
    """投递记录模型"""
    __tablename__ = 'applications'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, comment='用户ID')
    company_name = db.Column(db.String(100), nullable=False, comment='公司名称')
    position_name = db.Column(db.String(100), nullable=False, comment='职位名称')
    apply_date = db.Column(db.Date, nullable=False, comment='投递日期')
    status = db.Column(db.String(20), default='准备中', comment='当前状态')
    notes = db.Column(db.Text, comment='备注信息')
    salary_min = db.Column(db.Integer, comment='薪资下限(K)')
    salary_max = db.Column(db.Integer, comment='薪资上限(K)')
    work_location = db.Column(db.String(100), comment='工作地点')
    apply_channel = db.Column(db.String(50), comment='投递渠道')
    referrer = db.Column(db.String(50), comment='内推人')
    interview_time = db.Column(db.DateTime, comment='面试时间')
    created_at = db.Column(db.DateTime, default=datetime.utcnow, comment='创建时间')
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, comment='更新时间')
    
    # 状态选项
    STATUS_OPTIONS = [
        '准备中',
        '已投递',
        '笔试',
        '一面',
        '二面',
        '三面',
        'HR面',
        'Offer',
        '已拒绝'
    ]
    
    # 投递渠道选项
    CHANNEL_OPTIONS = [
        '官网投递',
        '招聘网站',
        '内推',
        '校园招聘',
        '猎头推荐',
        '其他'
    ]
    
    def to_dict(self):
        """转换为字典格式"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'company_name': self.company_name,
            'position_name': self.position_name,
            'apply_date': self.apply_date.strftime('%Y-%m-%d') if self.apply_date else None,
            'status': self.status,
            'notes': self.notes,
            'salary_min': self.salary_min,
            'salary_max': self.salary_max,
            'work_location': self.work_location,
            'apply_channel': self.apply_channel,
            'referrer': self.referrer,
            'interview_time': self.interview_time.strftime('%Y-%m-%d %H:%M:%S') if self.interview_time else None,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S') if self.created_at else None,
            'updated_at': self.updated_at.strftime('%Y-%m-%d %H:%M:%S') if self.updated_at else None
        }
    
    def to_excel_row(self):
        """转换为Excel行格式"""
        return [
            self.company_name,
            self.position_name,
            self.apply_date.strftime('%Y-%m-%d') if self.apply_date else '',
            self.status,
            f"{self.salary_min}-{self.salary_max}K" if self.salary_min and self.salary_max else '',
            self.work_location or '',
            self.apply_channel or '',
            self.referrer or '',
            self.interview_time.strftime('%Y-%m-%d %H:%M') if self.interview_time else '',
            self.notes or '',
            self.created_at.strftime('%Y-%m-%d') if self.created_at else ''
        ]
    
    @staticmethod
    def get_excel_headers():
        """获取Excel表头"""
        return [
            '公司名称', '职位名称', '投递日期', '当前状态', '薪资范围',
            '工作地点', '投递渠道', '内推人', '面试时间', '备注', '创建时间'
        ]
    
    def __repr__(self):
        return f'<Application {self.company_name} - {self.position_name}>' 