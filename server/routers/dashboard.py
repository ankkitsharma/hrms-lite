from datetime import date

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlmodel import Session, select

from database import get_session
from models import Attendance, Employee

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/stats")
def get_dashboard_stats(session: Session = Depends(get_session)):
    """Return dashboard stats: total employees, present/absent days, today's counts."""
    total_employees = session.exec(select(func.count(Employee.id))).one()

    present_days = session.exec(
        select(func.count(Attendance.id)).where(Attendance.status == "PRESENT")
    ).one()
    absent_days = session.exec(
        select(func.count(Attendance.id)).where(Attendance.status == "ABSENT")
    ).one()

    today = date.today()
    total_present_today = session.exec(
        select(func.count(Attendance.id)).where(
            Attendance.date == today,
            Attendance.status == "PRESENT",
        )
    ).one()
    total_absent_today = session.exec(
        select(func.count(Attendance.id)).where(
            Attendance.date == today,
            Attendance.status == "ABSENT",
        )
    ).one()

    return {
        "total_employees": total_employees,
        "present_days": present_days,
        "absent_days": absent_days,
        "total_present_today": total_present_today,
        "total_absent_today": total_absent_today,
    }
