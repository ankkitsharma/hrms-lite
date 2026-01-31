"""initial employee and attendance tables

Revision ID: 9f189191a3b5
Revises:
Create Date: 2026-01-31 13:32:07.324868

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "9f189191a3b5"
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        "employee",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("email", sa.String(), nullable=False),
        sa.Column("dept", sa.String(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "attendance",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("emp_id", sa.Integer(), nullable=False),
        sa.Column(
            "status",
            sa.Enum("PRESENT", "ABSENT", "NULL", name="attendancestatus"),
            nullable=False,
        ),
        sa.Column("date", sa.Date(), nullable=False),
        sa.ForeignKeyConstraint(
            ["emp_id"],
            ["employee.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_table("attendance")
    op.drop_table("employee")
    op.execute("DROP TYPE IF EXISTS attendancestatus")
