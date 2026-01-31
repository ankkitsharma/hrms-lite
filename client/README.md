# HRMS Lite – Client

Next.js frontend for the HRMS Lite application. Uses React Query for API calls, Tailwind CSS, and shadcn/ui components.

## Getting started

1. Install dependencies: `bun install` (or `npm install`).
2. Ensure the [server](../server) is running (e.g. `hypercorn main:app --reload` from the server directory).
3. Copy `.env.example` to `.env` and set `NEXT_PUBLIC_API_URL` if the API is not at `http://localhost:8000`.
4. Run the dev server: `bun dev` (or `npm run dev`).

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features

- **Dashboard** – Summary of total employees, present/absent counts, and top employees by present days.
- **Employees** – List all employees (ID, name, email, department), add new employees, delete employees.
- **Attendance** – Mark attendance (employee, date, Present/Absent), view records, filter by date, and see present days per employee.

## Tech stack

- Next.js 16 (App Router)
- React Query (TanStack Query) for API state
- Tailwind CSS v4
- shadcn/ui (Radix primitives)
