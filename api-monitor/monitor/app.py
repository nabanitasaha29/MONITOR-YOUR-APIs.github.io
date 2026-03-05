
from fastapi import FastAPI, Query
from fastapi.responses import JSONResponse
from typing import Optional
from service import run_monitor, apis  # apis is loaded from config.json in service.py

app = FastAPI(title="API Monitor")

_last_results = None  

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/groups")
def groups():
    return list(apis.keys())

@app.post("/run")
def run(group: Optional[str] = Query(default=None, description="Optional group filter")):
    global _last_results
    results = run_monitor(selected_group=group)
    _last_results = results
    return JSONResponse(content=results)

@app.get("/last")
def last():
    if _last_results is None:
        return JSONResponse(status_code=404, content={"message": "No run yet"})
    return JSONResponse(content=_last_results)