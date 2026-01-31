import enum
from datetime import date as DateType

from sqlmodel import Field, SQLModel


class AttendanceStatus(str, enum.Enum):
    PRESENT = "PRESENT"
    ABSENT = "ABSENT"
    NULL = "NULL"


class Attendance(SQLModel, table=True):
    __tablename__ = "attendance"

    id: int | None = Field(default=None, primary_key=True)
    emp_id: int = Field(foreign_key="employee.id")
    status: AttendanceStatus = Field(default=AttendanceStatus.NULL)
    date: DateType


class AttendanceCreate(SQLModel):
    emp_id: int
    status: AttendanceStatus = AttendanceStatus.NULL
    date: DateType


class AttendanceRead(SQLModel):
    id: int
    emp_id: int
    status: AttendanceStatus
    date: DateType


class AttendanceUpdate(SQLModel):
    emp_id: int | None = None
    status: AttendanceStatus | None = None
    date: DateType | None = None
