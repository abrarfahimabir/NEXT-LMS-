# NEXT LMS - SkillStream

## Project Overview
**Next Level Learning Management System (SkillStream)** is a robust, full-stack web application designed to facilitate online education. It provides a seamless experience for instructors to manage courses and for students to enroll and learn. The project focuses on a clean UI/UX and secure data handling, bridging the gap between educators and learners.

## Features
- **User Authentication:** Secure registration and login using JWT (JSON Web Tokens).
- **Role-Based Access Control:** Distinct functionalities for Admin, Instructors, and Students.
- **Course Management:** Full CRUD (Create, Read, Update, Delete) operations for courses.
- **Enrollment System:** Dynamic course enrollment and tracking.
- **Interactive Dashboard:** Personalized dashboards showing user-specific statistics and activities.
- **Responsive Design:** Fully optimized for all screen sizes from mobile to desktop.

## Tech Stack
- **Backend:** Django, Django REST Framework (DRF)
- **Frontend:** React.js, Tailwind CSS
- **Database:** SQLite (for development)
- **API:** RESTful Architecture

## ○ Setup Instructions

### 1. Clone the Repository
```bash
git clone [https://github.com/abrarfahimabir/NEXT-LMS-.git](https://github.com/abrarfahimabir/NEXT-LMS-.git)
cd NEXT-LMS-

## Backend Setup - Bash
1. Navigate to the backend directory: `cd backend`
2. Activate virtual environment: `f:/LMS/.venv/Scripts/activate` (on Windows)
3. pip install -r requirements.txt
4. Run migrations: `python manage.py migrate`
5. Create superuser: `python manage.py createsuperuser`
6. Run server: `python manage.py runserver`

## Frontend Setup - Bash
1. Navigate to the frontend directory: `cd frontend`
2. Install dependencies: `npm install`
3. Run the app: `npm start

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