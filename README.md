# LMS Full Stack Project

This is a Learning Management System built with Django (Backend) and React (Frontend).

## Backend Setup

1. Navigate to the backend directory: `cd backend`
2. Activate virtual environment: `f:/LMS/.venv/Scripts/activate` (on Windows)
3. Run migrations: `python manage.py migrate`
4. Create superuser: `python manage.py createsuperuser`
5. Run server: `python manage.py runserver`

## Frontend Setup

1. Navigate to the frontend directory: `cd frontend`
2. Install dependencies: `npm install`
3. Run the app: `npm start`

## Features

- User registration and login with JWT
- Role-based access (Admin, Instructor, Student)
- Course management
- Enrollment system
- Dashboard with statistics

## API Endpoints

- POST /api/auth/register/ - Register user
- POST /api/auth/login/ - Login
- GET /api/auth/profile/ - Get user profile
- PUT /api/auth/profile/ - Update profile
- GET /api/lms/courses/ - List courses
- POST /api/lms/courses/ - Create course (instructor)
- GET /api/lms/courses/<id>/ - Course detai
- POST /api/lms/enrollments/ - Enroll in course
- GET /api/lms/dashboard/ - Dashboard data (admin)