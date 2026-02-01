# JobTracker

A simple and practical job application tracking system for job seekers to manage their recruitment progress.

求职投递追踪系统 - 帮助求职者清晰地跟踪投递进度

## Features

- **User Management**: Registration, login, profile management
- **Application Tracking**: Add, edit, delete job applications
- **Status Management**: Track application status (Applied, Interview, Offer, Rejected, etc.)
- **Statistics Dashboard**: Visual statistics of application distribution
- **Excel Export**: Export all records to Excel file
- **Responsive Design**: Works on desktop and mobile

## Tech Stack

| Component | Technology |
|-----------|------------|
| Backend | Flask (Python) |
| Database | SQLite / PostgreSQL |
| ORM | SQLAlchemy |
| Auth | Flask-Login |
| Frontend | Bootstrap 5 + Chart.js |

## Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/JobTracker.git
cd JobTracker
```

### 2. Create virtual environment

```bash
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure environment (optional)

```bash
cp .env.example .env
# Edit .env with your settings
```

### 5. Run the application

```bash
python app.py
```

Visit `http://localhost:5000` in your browser.

## Project Structure

```
JobTracker/
├── app.py              # Main Flask application
├── models.py           # Database models
├── config.py           # Configuration classes
├── wsgi.py             # WSGI entry point
├── requirements.txt    # Python dependencies
├── .env.example        # Environment variables template
├── deploy_ubuntu.sh    # Ubuntu deployment script
├── static/
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── main.js
└── templates/
    ├── base.html
    ├── index.html
    ├── login.html
    ├── register.html
    ├── add.html
    ├── edit.html
    └── profile.html
```

## Application Status Options

| Status | Description |
|--------|-------------|
| 准备中 | Preparing |
| 已投递 | Applied |
| 笔试 | Written Test |
| 一面 | First Interview |
| 二面 | Second Interview |
| 三面 | Third Interview |
| HR面 | HR Interview |
| Offer | Got Offer |
| 已拒绝 | Rejected |

## Database Schema

### Users Table
| Field | Type | Description |
|-------|------|-------------|
| id | Integer | Primary key |
| username | String(80) | Unique username |
| email | String(120) | Unique email |
| password_hash | String(255) | Hashed password |
| real_name | String(50) | Real name |
| phone | String(20) | Phone number |
| target_position | String(100) | Target job position |
| graduation_year | Integer | Graduation year |
| major | String(100) | Major |
| school | String(100) | School |

### Applications Table
| Field | Type | Description |
|-------|------|-------------|
| id | Integer | Primary key |
| user_id | Integer | Foreign key to users |
| company_name | String(100) | Company name |
| position_name | String(100) | Position name |
| apply_date | Date | Application date |
| status | String(20) | Current status |
| notes | Text | Notes |
| salary_min | Integer | Min salary (K) |
| salary_max | Integer | Max salary (K) |
| work_location | String(100) | Work location |
| apply_channel | String(50) | Application channel |
| interview_time | DateTime | Interview time |

## Deployment

### Development
```bash
python app.py
```

### Production (Ubuntu)
```bash
chmod +x deploy_ubuntu.sh
./deploy_ubuntu.sh
```

## Configuration

Environment variables (set in `.env` file):

| Variable | Description | Default |
|----------|-------------|---------|
| FLASK_ENV | Environment (development/production) | development |
| SECRET_KEY | Flask secret key | Random |
| DATABASE_URL | Database connection URL | SQLite |

## License

MIT License

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
