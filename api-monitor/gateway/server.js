
// import express from "express";
// import cors from "cors";

// const app = express();
// app.use(cors());

// const PORT = process.env.PORT || 4000;
// const MONITOR_BASE = process.env.MONITOR_BASE || "http://monitor:8000";

// /* Get Groups — delegated to monitor */
// app.get("/groups", async (req, res) => {
//   try {
//     const r = await fetch(`${MONITOR_BASE}/groups`);
//     if (!r.ok) throw new Error(`Monitor responded ${r.status}`);
//     const data = await r.json();
//     res.json(data);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Failed to load groups" });
//   }
// });

// /* Run Monitor — delegated to monitor (/run is POST in FastAPI) */
// app.get("/run-monitor", async (req, res) => {
//   try {
//     const group = req.query.group;
//     const url = group
//       ? `${MONITOR_BASE}/run?group=${encodeURIComponent(group)}`
//       : `${MONITOR_BASE}/run`;

//     const r = await fetch(url, { method: "POST" });
//     if (!r.ok) throw new Error(`Monitor responded ${r.status}`);
//     const data = await r.json();
//     res.json(data);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Monitor call failed" });
//   }
// });




import express from "express";
import cors from "cors";

// NEW: let the base path be configurable
const BASE_PATH = process.env.BASE_PATH || "/api"; // production: "/dashboard/api"

const app = express();
app.use(cors());

const PORT = process.env.PORT || 4000;
const MONITOR_BASE = process.env.MONITOR_BASE || "http://monitor:8000";

// simple health for quick checks
app.get(`${BASE_PATH}/health`, (req, res) => res.json({ status: "ok" }));

/* Get Groups — delegated to monitor */
app.get(`${BASE_PATH}/groups`, async (req, res) => {
  try {
    const r = await fetch(`${MONITOR_BASE}/groups`);
    if (!r.ok) throw new Error(`Monitor responded ${r.status}`);
    const data = await r.json();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load groups" });
  }
});

/* Run Monitor — delegated to monitor (/run is POST in FastAPI) */
app.get(`${BASE_PATH}/run-monitor`, async (req, res) => {
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
    console.error(err);
    res.status(500).json({ error: "Monitor call failed" });
  }
});

app.listen(PORT, () => {
  console.log(`Gateway running on ${PORT} with base path ${BASE_PATH}`);
});
``




// app.listen(PORT, () => {
//   console.log(` hello Server Gateway running on ${PORT}`);
// });

