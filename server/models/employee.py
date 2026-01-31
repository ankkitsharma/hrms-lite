from sqlmodel import Field, SQLModel


class Employee(SQLModel, table=True):
    __tablename__ = "employee"

    id: int | None = Field(default=None, primary_key=True)
    name: str
    email: str
    dept: str


class EmployeeCreate(SQLModel):
    name: str
    email: str
    dept: str


class EmployeeRead(SQLModel):
    id: int
    name: str
    email: str
    dept: str


class EmployeeUpdate(SQLModel):
    name: str | None = None
    email: str | None = None
    dept: str | None = None


class EmployeeListResponse(SQLModel):
    items: list[EmployeeRead]
    total: int
