import os
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from typing import Optional
from backend.data_service import data_service

app = FastAPI(
    title="Vireo Audio Support Analytics API",
    description="Customer Support Analytics backend using actual datasets (Jan 2025 - Jun 2026)",
    version="1.0.0"
)

# Enable CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/summary")
def get_summary():
    return data_service.get_summary()

@app.get("/api/monthly-volume")
def get_monthly_volume():
    return data_service.get_monthly_volume()

@app.get("/api/team-summary")
def get_team_summary():
    return data_service.get_team_summary()

@app.get("/api/monthly-team")
def get_monthly_team():
    return data_service.get_monthly_team()

@app.get("/api/category-summary")
def get_category_summary():
    return data_service.get_category_summary()

@app.get("/api/monthly-category")
def get_monthly_category():
    return data_service.get_monthly_category()

@app.get("/api/channel-summary")
def get_channel_summary():
    return data_service.get_channel_summary()

@app.get("/api/sla")
def get_sla():
    return data_service.get_sla_analysis()

@app.get("/api/cost")
def get_cost():
    return data_service.get_cost_analysis()

@app.get("/api/transfers")
def get_transfers():
    return data_service.get_transfers_analysis()

@app.get("/api/data-quality")
def get_data_quality():
    return data_service.get_data_quality()

@app.get("/api/insights")
def get_insights():
    return data_service.get_business_insights()

@app.get("/api/tickets")
def get_tickets(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
    team: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    channel: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    source_system: Optional[str] = Query(None),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    search: Optional[str] = Query(None)
):
    return data_service.get_tickets(
        page=page,
        page_size=page_size,
        team=team,
        category=category,
        channel=channel,
        priority=priority,
        status=status,
        source_system=source_system,
        start_date=start_date,
        end_date=end_date,
        search=search
    )

# Static files mount for production frontend
frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "dist"))
if os.path.exists(frontend_dist):
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_dist, "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        file_path = os.path.join(frontend_dist, full_path)
        if full_path and os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(frontend_dist, "index.html"))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
