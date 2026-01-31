# hrms-lite

A lightweight HRMS (Human Resource Management System) with employee and attendance management.

## Project overview

HRMS Lite is a full-stack application for managing employees and their attendance. It provides:

- **Employee management** – Create, read, update, and delete employees (name, email, department).
- **Attendance management** – Record and manage daily attendance (Present/Absent) per employee.
- **Dashboard** – Summary stats (total employees, present/absent counts) and top employees by present days.

The app assumes a single admin user; no authentication is required. The UI includes loading, empty, and error states and uses reusable components with server-side validation.

## Tech stack

| Layer                        | Technology                                                  |
| ---------------------------- | ----------------------------------------------------------- |
| **Frontend**                 | Next.js 16 (App Router), React 19, TypeScript               |
| **Frontend UI**              | Tailwind CSS v4, shadcn/ui (Radix primitives), Lucide icons |
| **State / API**              | TanStack React Query                                        |
| **Package manager (client)** | Bun (or npm)                                                |
| **Backend**                  | Python 3, FastAPI                                           |
| **ORM / DB**                 | SQLModel, PostgreSQL (e.g. Neon)                            |
| **Migrations**               | Alembic                                                     |
| **ASGI server**              | Hypercorn                                                   |
| **Deployment**               | Frontend: Vercel · Backend: Railway                         |

## Steps to run the project locally

### Prerequisites

- **Node.js** (for the client) and **Bun** or npm
- **Python 3** with pip (and optionally a virtual environment)
- **PostgreSQL** (local or a hosted instance such as Neon)

### 1. Clone and open the repo

```bash
git clone <repository-url>
cd hrms-lite
```

### 2. Backend (server)

```bash
cd server
```

- Create a virtual environment (optional but recommended):

  ```bash
  python -m venv .venv
  source .venv/bin/activate   # Windows: .venv\Scripts\activate
  ```

- Install dependencies:

  ```bash
  pip install -r requirements.txt
  ```

- Create a `.env` file in the `server` directory with:

  ```env
  DATABASE_URL=postgresql://user:password@host:port/database
  CLIENT_BASE_URL=http://localhost:3000
  ```

  Use your actual PostgreSQL connection string for `DATABASE_URL`.

- Apply database migrations:

  ```bash
  alembic upgrade head
  ```

- Start the API server:

  ```bash
  hypercorn main:app --reload
  ```

  The API will be available at **http://localhost:8000**.

### 3. Frontend (client)

In a new terminal, from the project root:

```bash
cd client
```

- Install dependencies:

  ```bash
  bun install
  # or: npm install
  ```

- Copy env example and set the API URL (if not using the default):

  ```bash
  cp .env.example .env
  ```

  In `.env`, set `NEXT_PUBLIC_API_URL` if your API is not at `http://localhost:8000` (default is fine when the server runs with hypercorn as above).

- Start the dev server:

  ```bash
  bun dev
  # or: npm run dev
  ```

  Open **http://localhost:3000** in your browser.

### 4. Verify

- Ensure the **server** is running before using the client.
- Visit the Dashboard, Employees, and Attendance pages to confirm they load and the API responds.

## Assumptions and limitations

- **Single admin user** – No login or role-based access; the app is intended for one admin.
- **No auth** – All API routes are open; do not expose the backend directly to the internet without adding auth if needed.
- **PostgreSQL required** – The backend is built for PostgreSQL (e.g. Neon); other databases would need different configuration.
- **CORS** – The server allows the origin set in `CLIENT_BASE_URL` (default `http://localhost:3000`). For other origins (e.g. production frontend), update server config.
- **Date/time** – Attendance dates are stored and filtered as provided; timezone handling is minimal and may need to be refined for multi-timezone use.
- **UI** – Optimized for modern desktop browsers; mobile layout may need additional work for production use.
