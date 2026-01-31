from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from database import get_session
from models import Employee, EmployeeCreate, EmployeeRead, EmployeeUpdate

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


@router.get("/", response_model=list[EmployeeRead])
def list_employees(session: Session = Depends(get_session)) -> list[Employee]:
    statement = select(Employee)
    return list(session.exec(statement).all())


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
