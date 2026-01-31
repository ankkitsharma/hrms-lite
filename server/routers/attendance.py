from datetime import date as date_type

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlmodel import Session, select

from database import get_session
from models import (
    Attendance,
    AttendanceCreate,
    AttendanceRead,
    AttendanceListResponse,
    AttendanceUpdate,
    Employee,
)

router = APIRouter(prefix="/attendance", tags=["attendance"])


@router.post("/", response_model=AttendanceRead)
def create_attendance(
    attendance: AttendanceCreate,
    session: Session = Depends(get_session),
) -> Attendance:
    statement = select(Attendance).where(
        Attendance.emp_id == attendance.emp_id,
        Attendance.date == attendance.date,
    )
    existing = session.exec(statement).first()
    if existing:
        existing.status = attendance.status
        session.add(existing)
        session.commit()
        session.refresh(existing)
        return existing
    db_attendance = Attendance.model_validate(attendance)
    session.add(db_attendance)
    session.commit()
    session.refresh(db_attendance)
    return db_attendance


def _attendance_base_statement(
    date: date_type | None,
    emp_id: int | None,
    status: str | None,
    dept: str | None,
    name: str | None = None,
):
    statement = select(Attendance)
    if date is not None:
        statement = statement.where(Attendance.date == date)
    if emp_id is not None:
        statement = statement.where(Attendance.emp_id == emp_id)
    if status:
        statement = statement.where(Attendance.status == status)
    if dept or name:
        statement = statement.join(Employee, Attendance.emp_id == Employee.id)
        if dept:
            statement = statement.where(Employee.dept.ilike(f"%{dept}%"))
        if name:
            statement = statement.where(Employee.name.ilike(f"%{name}%"))
    return statement


@router.get("/", response_model=AttendanceListResponse)
def list_attendance(
    session: Session = Depends(get_session),
    limit: int = 10,
    offset: int = 0,
    date: date_type | None = None,
    emp_id: int | None = None,
    status: str | None = None,
    dept: str | None = None,
    name: str | None = None,
) -> AttendanceListResponse:
    base = _attendance_base_statement(date, emp_id, status, dept, name)
    total = session.exec(select(func.count()).select_from(base.subquery())).one()
    items = list(session.exec(base.offset(offset).limit(limit)).all())
    return AttendanceListResponse(items=items, total=total)


@router.get("/{attendance_id}", response_model=AttendanceRead)
def get_attendance(
    attendance_id: int,
    session: Session = Depends(get_session),
) -> Attendance:
    attendance = session.get(Attendance, attendance_id)
    if not attendance:
        raise HTTPException(status_code=404, detail="Attendance record not found")
    return attendance


@router.patch("/{attendance_id}", response_model=AttendanceRead)
def update_attendance(
    attendance_id: int,
    attendance_update: AttendanceUpdate,
    session: Session = Depends(get_session),
) -> Attendance:
    attendance = session.get(Attendance, attendance_id)
    if not attendance:
        raise HTTPException(status_code=404, detail="Attendance record not found")
    update_data = attendance_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(attendance, key, value)
    session.add(attendance)
    session.commit()
    session.refresh(attendance)
    return attendance


@router.delete("/{attendance_id}", status_code=204)
def delete_attendance(
    attendance_id: int,
    session: Session = Depends(get_session),
) -> None:
    attendance = session.get(Attendance, attendance_id)
    if not attendance:
        raise HTTPException(status_code=404, detail="Attendance record not found")
    session.delete(attendance)
    session.commit()
