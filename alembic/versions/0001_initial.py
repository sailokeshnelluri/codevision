"""Initial migration — create all tables

Revision ID: 0001_initial
Revises:
Create Date: 2024-01-01 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

revision = "0001_initial"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # users
    op.create_table(
        "users",
        sa.Column("id",         sa.String(),  primary_key=True),
        sa.Column("name",       sa.String(100), nullable=False),
        sa.Column("email",      sa.String(255), nullable=False, unique=True),
        sa.Column("password",   sa.String(255), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()),
    )
    op.create_index("ix_users_email", "users", ["email"])

    # projects
    op.create_table(
        "projects",
        sa.Column("id",              sa.String(), primary_key=True),
        sa.Column("user_id",         sa.String(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("name",            sa.String(200), nullable=False, server_default="Untitled Project"),
        sa.Column("code",            sa.Text(), nullable=False, server_default=""),
        sa.Column("language",        sa.String(30), nullable=False, server_default="python"),
        sa.Column("execution_trace", sa.JSON(), nullable=True),
        sa.Column("created_at",      sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at",      sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()),
    )
    op.create_index("ix_projects_user_id", "projects", ["user_id"])

    # execution_history
    op.create_table(
        "execution_history",
        sa.Column("id",             sa.String(), primary_key=True),
        sa.Column("user_id",        sa.String(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("code",           sa.Text(), nullable=False),
        sa.Column("language",       sa.String(30), nullable=False),
        sa.Column("output",         sa.Text(), nullable=True),
        sa.Column("error",          sa.Text(), nullable=True),
        sa.Column("steps_count",    sa.Integer(), server_default="0"),
        sa.Column("execution_time", sa.String(20), nullable=True),
        sa.Column("created_at",     sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_execution_history_user_id", "execution_history", ["user_id"])


def downgrade() -> None:
    op.drop_table("execution_history")
    op.drop_table("projects")
    op.drop_table("users")
