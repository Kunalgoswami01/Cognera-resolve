from fastapi import APIRouter
from app.routes import health, cases, documents, intake, timeline, outputs

api_router = APIRouter()

# Register sub-routers under the aggregate api_router
api_router.include_router(health.router)
api_router.include_router(cases.router, prefix="/cases", tags=["Cases CRUD"])
api_router.include_router(documents.router, tags=["Evidence Documents"])
api_router.include_router(intake.router, tags=["Intake Checklist"])

api_router.include_router(timeline.router, prefix="/timeline", tags=["Dispute Timeline"])
api_router.include_router(outputs.router, tags=["Resolution Outputs"])


__all__ = ["api_router"]
