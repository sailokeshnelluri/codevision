from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete
from pydantic import BaseModel
from typing import Optional, List, Any
import datetime

from ..database import get_db
from ..models import User, Project
from ..auth import get_current_user

router = APIRouter()


class ProjectCreate(BaseModel):
    name: str = "Untitled Project"
    code: str = ""
    language: str = "python"
    execution_trace: Optional[List[Any]] = None


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    language: Optional[str] = None
    execution_trace: Optional[List[Any]] = None


class ProjectOut(BaseModel):
    id: str
    name: str
    code: str
    language: str
    execution_trace: Optional[List[Any]]
    created_at: datetime.datetime
    updated_at: datetime.datetime

    class Config:
        from_attributes = True


# ─── List projects ───────────────────────────────────────────────────────────
@router.get("", response_model=List[ProjectOut])
async def list_projects(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Project)
        .where(Project.user_id == user.id)
        .order_by(Project.updated_at.desc())
    )
    return result.scalars().all()


# ─── Get single project ──────────────────────────────────────────────────────
@router.get("/{project_id}", response_model=ProjectOut)
async def get_project(
    project_id: str,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Project).where(Project.id == project_id, Project.user_id == user.id)
    )
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


# ─── Create project ──────────────────────────────────────────────────────────
@router.post("", response_model=ProjectOut, status_code=201)
async def create_project(
    body: ProjectCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    project = Project(
        user_id=user.id,
        name=body.name,
        code=body.code,
        language=body.language,
        execution_trace=body.execution_trace,
    )
    db.add(project)
    await db.flush()
    await db.refresh(project)
    return project


# ─── Update project ──────────────────────────────────────────────────────────
@router.put("/{project_id}", response_model=ProjectOut)
async def update_project(
    project_id: str,
    body: ProjectUpdate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Project).where(Project.id == project_id, Project.user_id == user.id)
    )
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if body.name is not None:            project.name = body.name
    if body.code is not None:            project.code = body.code
    if body.language is not None:        project.language = body.language
    if body.execution_trace is not None: project.execution_trace = body.execution_trace

    project.updated_at = datetime.datetime.utcnow()
    await db.flush()
    await db.refresh(project)
    return project


# ─── Delete project ──────────────────────────────────────────────────────────
@router.delete("/{project_id}", status_code=204)
async def delete_project(
    project_id: str,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Project).where(Project.id == project_id, Project.user_id == user.id)
    )
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    await db.delete(project)
