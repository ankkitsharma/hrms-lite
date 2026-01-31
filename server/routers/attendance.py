from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from database import get_session
from models import Attendance, AttendanceCreate, AttendanceRead, AttendanceUpdate

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


@router.get("/", response_model=list[AttendanceRead])
def list_attendance(session: Session = Depends(get_session)) -> list[Attendance]:
    statement = select(Attendance)
    return list(session.exec(statement).all())


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
