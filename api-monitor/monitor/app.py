
# from fastapi import FastAPI, Query
# from fastapi.responses import JSONResponse
# from typing import Optional
# from service import run_monitor, apis  # apis is loaded from config.json in service.py

# app = FastAPI(title="API Monitor")

# _last_results = None  

# @app.get("/health")
# def health():
#     return {"status": "ok"}

# @app.get("/groups")
# def groups():
#     return list(apis.keys())

# @app.post("/run")
# def run(group: Optional[str] = Query(default=None, description="Optional group filter")):
#     global _last_results
#     results = run_monitor(selected_group=group)
#     _last_results = results
#     return JSONResponse(content=results)

# @app.get("/last")
# def last():
#     if _last_results is None:
#         return JSONResponse(status_code=404, content={"message": "No run yet"})
#     return JSONResponse(content=_last_results)



# app.py
from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List, Dict
import os

from service import run_monitor, build_config_path_by_type, CONFIG_BASE, TYPE_DIR

app = FastAPI(title="API Monitor Service")

# CORS for your dashboard
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten to your dashboard origin in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/run/by-type")
def run_by_type(
    type: str = Query(..., description="fr | mappers | dcs | dpe"),
    code: str = Query(..., description="state code like RJ, UP, MH, ..."),
    selected_group: Optional[str] = Query(None),
):
    try:
        config_path = build_config_path_by_type(type, code)
        results = run_monitor(selected_group=selected_group, config_path=config_path)
        return {"config": os.path.basename(config_path), "count": len(results), "results": results}
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/configs")
def list_configs() -> Dict[str, List[str]]:
    """Return available config files per type by scanning directories."""
    out: Dict[str, List[str]] = {}
    for t, folder in TYPE_DIR.items():
        dir_path = os.path.join(CONFIG_BASE, folder)
        if os.path.isdir(dir_path):
            files = [f for f in os.listdir(dir_path) if f.endswith("_config.json")]
            out[t] = sorted(files)
    return out