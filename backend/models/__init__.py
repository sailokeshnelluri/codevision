from sqlalchemy import Column, String, Text, DateTime, ForeignKey, JSON, Integer
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from ..database import Base


def gen_uuid():
    return str(uuid.uuid4())


class User(Base):
    __tablename__ = "users"

    id         = Column(String, primary_key=True, default=gen_uuid)
    name       = Column(String(100), nullable=False)
    email      = Column(String(255), unique=True, nullable=False, index=True)
    password   = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    projects          = relationship("Project",          back_populates="user", cascade="all, delete")
    execution_history = relationship("ExecutionHistory", back_populates="user", cascade="all, delete")


class Project(Base):
    __tablename__ = "projects"

    id              = Column(String, primary_key=True, default=gen_uuid)
    user_id         = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name            = Column(String(200), nullable=False, default="Untitled Project")
    code            = Column(Text, nullable=False, default="")
    language        = Column(String(30), nullable=False, default="python")
    execution_trace = Column(JSON, nullable=True)
    created_at      = Column(DateTime(timezone=True), server_default=func.now())
    updated_at      = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="projects")


class ExecutionHistory(Base):
    __tablename__ = "execution_history"

    id             = Column(String, primary_key=True, default=gen_uuid)
    user_id        = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    code           = Column(Text, nullable=False)
    language       = Column(String(30), nullable=False)
    output         = Column(Text, nullable=True)
    error          = Column(Text, nullable=True)
    steps_count    = Column(Integer, default=0)
    execution_time = Column(String(20), nullable=True)
    created_at     = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="execution_history")