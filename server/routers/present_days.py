from fastapi import APIRouter, Depends
from sqlalchemy import desc, func
from sqlmodel import Session, select

from database import get_session
from models import Attendance, Employee

router = APIRouter(prefix="/present-days", tags=["present-days"])


@router.get("")
def list_present_days_by_employee(
    session: Session = Depends(get_session),
    limit: int = 10,
    offset: int = 0,
):
    """Paginated list of employees with their present-day count."""
    present_count_col = func.count(Attendance.id).label("present_count")
    base = (
        select(
            Employee.id.label("emp_id"),
            Employee.name,
            Employee.dept,
            present_count_col,
        )
        .outerjoin(
            Attendance,
            (Attendance.emp_id == Employee.id) & (Attendance.status == "PRESENT"),
        )
        .group_by(Employee.id, Employee.name, Employee.dept)
        .order_by(desc(present_count_col))
    )
    total = session.exec(select(func.count()).select_from(base.subquery())).one()
    rows = session.exec(base.offset(offset).limit(limit)).all()
    items = [
        {
            "emp_id": r.emp_id,
            "name": r.name,
            "dept": r.dept,
            "present_count": int(r.present_count) if r.present_count is not None else 0,
        }
        for r in rows
    ]
    return {"items": items, "total": total}
