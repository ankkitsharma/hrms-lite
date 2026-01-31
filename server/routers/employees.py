from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlmodel import Session, select

from database import get_session
from models import (
    Employee,
    EmployeeCreate,
    EmployeeRead,
    EmployeeListResponse,
    EmployeeUpdate,
)

router = APIRouter(prefix="/employees", tags=["employees"])


@router.post("/", response_model=EmployeeRead)
def create_employee(
    employee: EmployeeCreate,
    session: Session = Depends(get_session),
) -> Employee:
    statement = select(Employee).where(
        Employee.name == employee.name,
        Employee.email == employee.email,
        Employee.dept == employee.dept,
    )
    existing = session.exec(statement).first()
    if existing:
        raise HTTPException(
            status_code=409,
            detail="An employee with the same name, email and department already exists.",
        )
    db_employee = Employee.model_validate(employee)
    session.add(db_employee)
    session.commit()
    session.refresh(db_employee)
    return db_employee


def _employees_base_statement(name: str | None, email: str | None, dept: str | None):
    statement = select(Employee)
    if name:
        statement = statement.where(Employee.name.ilike(f"%{name}%"))
    if email:
        statement = statement.where(Employee.email.ilike(f"%{email}%"))
    if dept:
        statement = statement.where(Employee.dept.ilike(f"%{dept}%"))
    return statement


@router.get("/", response_model=EmployeeListResponse)
def list_employees(
    session: Session = Depends(get_session),
    limit: int = 10,
    offset: int = 0,
    name: str | None = None,
    email: str | None = None,
    dept: str | None = None,
) -> EmployeeListResponse:
    base = _employees_base_statement(name, email, dept)
    total = session.exec(select(func.count()).select_from(base.subquery())).one()
    items = list(session.exec(base.offset(offset).limit(limit)).all())
    return EmployeeListResponse(items=items, total=total)


@router.get("/{employee_id}", response_model=EmployeeRead)
def get_employee(
    employee_id: int,
    session: Session = Depends(get_session),
) -> Employee:
    employee = session.get(Employee, employee_id)
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    return employee


@router.patch("/{employee_id}", response_model=EmployeeRead)
def update_employee(
    employee_id: int,
    employee_update: EmployeeUpdate,
    session: Session = Depends(get_session),
) -> Employee:
    employee = session.get(Employee, employee_id)
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    update_data = employee_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(employee, key, value)
    session.add(employee)
    session.commit()
    session.refresh(employee)
    return employee


@router.delete("/{employee_id}", status_code=204)
def delete_employee(
    employee_id: int,
    session: Session = Depends(get_session),
) -> None:
    employee = session.get(Employee, employee_id)
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    session.delete(employee)
    session.commit()
