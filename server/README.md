# FastAPI server

## How to use

- Clone locally and install packages: `pip install -r requirements.txt` (use the project `.venv`: `source .venv/bin/activate` first, or `.venv/bin/pip install -r requirements.txt`).
- Run locally from the **server** directory: `hypercorn main:app --reload`.

## Database migrations (Alembic)

Migrations use **Alembic** and read `DATABASE_URL` from `.env`. Run all commands from the **server** directory (with `.venv` activated if you use it).

### Apply migrations (create/update tables)

```bash
alembic upgrade head
```

### Create a new migration after changing models

After editing models under `models/` (e.g. adding a column), generate a new revision:

```bash
alembic revision --autogenerate -m "describe your change"
```

Then apply it:

```bash
alembic upgrade head
```

### Other useful commands

- **Current revision:** `alembic current`
- **Migration history:** `alembic history`
- **Roll back one revision:** `alembic downgrade -1`
- **Roll back to a specific revision:** `alembic downgrade <revision_id>`

### First-time setup

If the database is empty, run `alembic upgrade head` once to create all tables from the existing migrations.
