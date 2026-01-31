# hrms-lite

Ethera AI Assignement

## Tech Stack being used

- Frontend: React (Nextjs)
  - Package Manager: Bun
- Backend: Python (FastAPI)
  - Package Manager: UV (Also for virtual env as well)
- Database: PostgreSQL (NeonPostgres)
- Deployment:
  - Frontend: Vercel (Prod Hosted on https://hrms-lite-client.vercel.app)
  - Backend: Railway (Prod Hosted on https://hrms-lite-ankit28.up.railway.app)

## Main Feature Requirement:

- Employee Management (CRUD)
- Attendance Management (CRUD)

## Database Schema:

- employee:
  - fields:
    - id
    - name
    - email
    - dept
  - functionality required: Create, Read, Update, Delete
- attendance:
  - fields:
    - id
    - empId
    - status (PRESENT/ABSENT/NULL) Default(NULL)
    - date
  - functionality required: Create, Read, Update, Delete

## Other requirements

- Assume a single admin user (no authentication required)
- Consistent UI
- reusable components
- Proper server side validation
- Show meaningful UI states:
  - Loading
  - Empty states
  - Error states
