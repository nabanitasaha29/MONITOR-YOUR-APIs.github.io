
import express from "express";
import cors from "cors";

// If you are on Node < 18 and fetch is not available, install and import:
// import fetch from "node-fetch";

const app = express();
app.use(cors());
app.use(express.json()); // in case you later send JSON to /api/run

const PORT = process.env.PORT || 4000;
const MONITOR_BASE = process.env.MONITOR_BASE || "http://127.0.0.1:8000"; // use localhost default for dev

/* ---------------------------
   NEW: /api endpoints for frontend
----------------------------*/

/** GET /api/groups  -> proxies to FastAPI GET /groups */
app.get("/api/groups", async (req, res) => {
  try {
    const r = await fetch(`${MONITOR_BASE}/groups`);
    if (!r.ok) throw new Error(`Monitor responded ${r.status}`);
    const data = await r.json();
    res.json(data);
  } catch (err) {
    console.error("[/api/groups] error:", err);
    res.status(500).json({ error: "Failed to load groups" });
  }
});

/** POST /api/run[?group=...]  -> proxies to FastAPI POST /run */
app.post("/api/run", async (req, res) => {
  try {
    const group = req.query.group;
    const url = group
      ? `${MONITOR_BASE}/run?group=${encodeURIComponent(group)}`
      : `${MONITOR_BASE}/run`;

    const r = await fetch(url, { method: "POST" });
    if (!r.ok) throw new Error(`Monitor responded ${r.status}`);
    const data = await r.json();
    res.json(data);
  } catch (err) {
    console.error("[/api/run] error:", err);
    res.status(500).json({ error: "Monitor call failed" });
  }
});

/* ---------------------------
   Existing endpoints (optional keep)
----------------------------*/

/** Old: GET /groups (not used by frontend, but harmless to keep) */
app.get("/groups", async (req, res) => {
  try {
    const r = await fetch(`${MONITOR_BASE}/groups`);
    if (!r.ok) throw new Error(`Monitor responded ${r.status}`);
    const data = await r.json();
    res.json(data);
  } catch (err) {
    console.error("[/groups] error:", err);
    res.status(500).json({ error: "Failed to load groups" });
  }
});

/** Old: GET /run-monitor -> POST /run */
app.get("/run-monitor", async (req, res) => {
  try {
    const group = req.query.group;
    const url = group
      ? `${MONITOR_BASE}/run?group=${encodeURIComponent(group)}`
      : `${MONITOR_BASE}/run`;

    const r = await fetch(url, { method: "POST" });
    if (!r.ok) throw new Error(`Monitor responded ${r.status}`);
    const data = await r.json();
    res.json(data);
  } catch (err) {
    console.error("[/run-monitor] error:", err);
    res.status(500).json({ error: "Monitor call failed" });
  }
});

app.listen(PORT, () => {
  console.log(`hello Server Gateway running on ${PORT}`);
});
