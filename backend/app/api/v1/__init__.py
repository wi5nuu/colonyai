from fastapi import APIRouter
from app.api.v1.endpoints import auth, images, analyses, reports, users, lims, maintenance, simulator, settings, audit, super

api_router = APIRouter()

# Include sub-routers with their respective prefixes
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(images.router, prefix="/images", tags=["Images"])
api_router.include_router(analyses.router, prefix="/analyses", tags=["Analyses"])
api_router.include_router(reports.router, prefix="/reports", tags=["Reports"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(lims.router, prefix="/lims", tags=["LIMS Integration"])
api_router.include_router(maintenance.router, prefix="/maintenance", tags=["Maintenance"])
api_router.include_router(simulator.router, prefix="/simulator", tags=["Simulator"])
api_router.include_router(settings.router, prefix="/settings", tags=["User Settings"])
api_router.include_router(audit.router, prefix="/audit", tags=["Audit Logs"])
api_router.include_router(super.router, prefix="/super", tags=["Super Admin"])

# Export individual routers for backward compatibility if main.py still uses them
auth_router = auth.router
image_router = images.router
analysis_router = analyses.router
report_router = reports.router
user_router = users.router
lims_router = lims.router
maintenance_router = maintenance.router
simulator_router = simulator.router
settings_router = settings.router
audit_router = audit.router
super_router = super.router
