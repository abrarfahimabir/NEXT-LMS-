# LMS - Learning Management System

## 1. Project Overview

A full-stack Learning Management System (LMS) built with Django REST Framework backend and React frontend. The platform enables course creation, management, enrollment tracking, user authentication, admin dashboards, and reporting features. Designed for educational institutions and online learning providers.

Key capabilities include:
- User authentication and role-based access (students, instructors, admins)
- Course and module management
- Student enrollment and progress tracking
- Admin dashboard with user/course oversight
- Interactive UI with notifications and reports

## 2. Features

- **Authentication & Authorization**: JWT-based login/register, session management, custom user model with profiles (avatar, bio).
- **Course Management**: Create/edit courses, categories, modules, demo course seeding.
- **User Management**: Admin panel for users, roles, enrolled students.
- **Dashboard**: Overview with stats, notifications, progress bars.
- **Reporting**: Generate reports (likely enrollment/course analytics using Recharts).
- **UI Components**: Responsive design with Tailwind CSS, animations (Framer Motion), toasts, modals, pagination, skeletons.
- **Protected Routes**: Role-based access control.
- **Media Uploads**: User avatars and course materials.
- **Notifications**: Real-time notification system.

## 3. Tech Stack

### Backend
- **Framework**: Django 6.0.4 + Django REST Framework
- **Database**: SQLite (development), customizable
- **Authentication**: SimpleJWT, Custom User Model
- **Other**: CORS headers, DRF permissions/serializers

### Frontend
- **Framework**: React 18 + Create React App
- **Styling**: Tailwind CSS 3.4
- **Routing**: React Router DOM 6.20
- **State/UI**: Framer Motion (animations), Axios (API), Recharts (charts), React Icons
- **Auth**: JWT Decode

### Tools
- PostCSS, Autoprefixer
- Git (version control)

## 4. Setup Instructions

### Prerequisites
- Python 3.8+
- Node.js 18+
- Git

### Backend Setup
1. Navigate to backend directory:
   ```
   cd backend
   ```

2. Create and activate virtual environment:
   ```
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```
   *(Note: If requirements.txt missing, install manually: `pip install django==6.0.4 djangorestframework djangorestframework-simplejwt django-cors-headers`)*

4. Apply migrations and create superuser:
   ```
   python manage.py makemigrations
   python manage.py migrate
   python manage.py createsuperuser
   ```

5. Run development server:
   ```
   python manage.py runserver
   ```
   Backend runs on `http://127.0.0.1:8000`

### Frontend Setup
1. Navigate to frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Run development server:
   ```
   npm start
   ```
   Frontend runs on `http://localhost:3000` (proxies API to backend).

### Access the Application
- Frontend: `http://localhost:3000`
- Backend Admin: `http://127.0.0.1:8000/admin`
- API Docs: Use tools like Postman/Insomnia pointing to backend endpoints.

### Production Deployment
- Update `ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS` in `backend/lms_project/settings.py`.
- Use PostgreSQL/MySQL for DB.
- Serve static/media files with Whitenoise/Cloud storage.
- Build frontend: `npm run build` and serve via Nginx/Apache.

### Troubleshooting
- CORS issues: Ensure ports match in settings.
- Auth errors: Check JWT lifetimes and session keys.
- Missing deps: Run `pip freeze > requirements.txt` after manual installs.

Happy Learning! 🚀

