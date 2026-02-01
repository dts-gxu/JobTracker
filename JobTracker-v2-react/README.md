# JobTracker v2.0 💼

**React + Spring Boot 求职投递追踪系统**

> 作者: **dts** | 开源协议: MIT

一个现代化的求职投递管理系统，帮助求职者高效追踪投递进度。

![React](https://img.shields.io/badge/React-18-blue?logo=react)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2-green?logo=springboot)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-blue?logo=tailwindcss)
![License](https://img.shields.io/badge/License-MIT-yellow)

## ✨ 新版特性 (v2.0)

相比 v1.0 Flask 版本，v2.0 带来了：

| 特性 | v1.0 (Flask) | v2.0 (React + Spring Boot) |
|------|--------------|---------------------------|
| 前端框架 | Bootstrap + jQuery | React 18 + TailwindCSS |
| 后端框架 | Flask | Spring Boot 3.2 |
| 状态管理 | Session | Zustand + React Query |
| 认证方式 | Session Cookie | JWT Token |
| UI设计 | 基础样式 | 现代化渐变设计 |
| 数据可视化 | Chart.js | Recharts |
| 星标功能 | ❌ | ✅ |
| 优先级管理 | ❌ | ✅ |
| HR联系信息 | ❌ | ✅ |
| 分页加载 | ❌ | ✅ |
| 面试日历 | ❌ | ✅ |
| 薪资对比 | ❌ | ✅ |
| 简历管理 | ❌ | ✅ |
| 投递模板 | ❌ | ✅ |
| Excel导出 | ❌ | ✅ |
| 邮件提醒 | ❌ | ✅ |

## �️ 功能预览

- **📊 仪表盘**: 数据统计、饼图、柱状图、一键导出Excel
- **📝 投递列表**: 搜索、筛选、分页、星标
- **📅 面试日历**: 可视化查看所有面试安排
- **💰 薪资对比**: 最多5个Offer薪资区间对比
- **📄 简历管理**: 上传/管理多份简历
- **📑 投递模板**: 保存常用信息，快速添加
- **📧 邮件提醒**: 面试时间自动提醒(QQ邮箱)
- **📱 响应式设计**: 适配桌面和移动端

## 🛠️ 技术栈

### 后端 (backend/)
- **框架**: Spring Boot 3.2
- **数据库**: H2 (开发) / MySQL (生产)
- **ORM**: Spring Data JPA
- **安全**: Spring Security + JWT
- **构建**: Maven

### 前端 (frontend/)
- **框架**: React 18 + Vite
- **样式**: TailwindCSS
- **状态管理**: Zustand
- **数据请求**: Axios + React Query
- **图表**: Recharts
- **图标**: Lucide React
- **通知**: React Hot Toast

## 🚀 快速开始

### 环境要求
- JDK 17+
- Node.js 18+
- Maven 3.8+

### 1. 启动后端

```bash
cd backend

# 使用 Maven 启动
mvn spring-boot:run

# 或者打包后运行
mvn package
java -jar target/jobtracker-backend-2.0.0.jar
```

后端运行在 `http://localhost:8081`

### 2. 启动前端

```bash
cd frontend

# 安装依赖
npm install

# 开发模式
npm run dev

# 生产构建
npm run build
```

前端运行在 `http://localhost:3000`

## 📁 项目结构

```
JobTracker-v2-react/
├── backend/                    # Spring Boot 后端
│   ├── src/main/java/com/jobtracker/
│   │   ├── controller/         # REST API 控制器
│   │   ├── service/            # 业务逻辑层
│   │   ├── repository/         # 数据访问层
│   │   ├── entity/             # 实体类
│   │   ├── dto/                # 数据传输对象
│   │   ├── config/             # 配置类
│   │   └── security/           # JWT 安全配置
│   ├── src/main/resources/
│   │   └── application.yml     # 应用配置
│   └── pom.xml
│
├── frontend/                   # React 前端
│   ├── src/
│   │   ├── components/         # 可复用组件
│   │   ├── pages/              # 页面组件
│   │   ├── store/              # Zustand 状态
│   │   ├── api/                # API 请求
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
└── README.md
```

## 📊 API 接口

### 认证 API
| 方法 | 路径 | 描述 |
|------|------|------|
| POST | /api/auth/login | 用户登录 |
| POST | /api/auth/register | 用户注册 |

### 投递记录 API
| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/applications | 获取列表(分页) |
| GET | /api/applications/:id | 获取详情 |
| POST | /api/applications | 创建记录 |
| PUT | /api/applications/:id | 更新记录 |
| DELETE | /api/applications/:id | 删除记录 |
| POST | /api/applications/:id/toggle-star | 切换星标 |
| GET | /api/applications/stats | 获取统计 |

## ⚙️ 配置说明

### 后端配置 (application.yml)

```yaml
spring:
  datasource:
    url: jdbc:h2:file:./data/jobtracker  # H2 数据库
  jpa:
    hibernate:
      ddl-auto: update

jwt:
  secret: your-secret-key  # JWT 密钥
  expiration: 86400000     # 24小时
```

### 前端配置 (vite.config.js)

```javascript
server: {
  port: 3000,
  proxy: {
    '/api': 'http://localhost:8080'
  }
}
```

## 🎨 状态选项

| 状态 | 颜色 |
|------|------|
| 准备中 | 灰色 |
| 已投递 | 蓝色 |
| 笔试 | 紫色 |
| 一面 | 琥珀色 |
| 二面 | 橙色 |
| 三面 | 粉色 |
| HR面 | 青色 |
| Offer | 绿色 |
| 已拒绝 | 红色 |

## 📧 邮件提醒配置

在环境变量中设置QQ邮箱SMTP：
```bash
export MAIL_USERNAME=your-qq-email@qq.com
export MAIL_PASSWORD=your-qq-smtp-authorization-code
```

## 📝 License

MIT License - 可自由使用、修改和分发

## 👨‍💻 作者

**dts** - 广西大学

## 🔗 相关链接

- [Spring Boot 文档](https://spring.io/projects/spring-boot)
- [React 文档](https://react.dev/)
- [TailwindCSS](https://tailwindcss.com/)

---

如果觉得这个项目对你有帮助，请给一个 ⭐ Star！
