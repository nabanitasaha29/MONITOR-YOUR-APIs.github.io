// import express from "express";
// import cors from "cors";

// const app = express();
// app.use(cors());
// app.use(express.json());

// const PORT = process.env.PORT || 4000;
// const MONITOR_BASE = process.env.MONITOR_BASE || "http://monitor:8000";


// app.get("/groups", async (req, res) => {
//   try {
//     const r = await fetch(`${MONITOR_BASE}/groups`);
//     if (!r.ok) throw new Error(`Monitor responded ${r.status}`);
//     const data = await r.json();
//     res.json(data);
//   } catch (err) {
//     console.error("[/groups] error:", err);
//     res.status(500).json({ error: "Failed to load groups" });
//   }
// });


// app.post("/run-by-type", async (req, res) => {
//   try {
//     const { type, code } = req.query;

//     if (!type || !code) {
//       return res.status(400).json({ error: "type and code required" });
//     }

//     //const url = `${MONITOR_BASE}/run/by-type?type=${encodeURIComponent(type)}&code=${encodeURIComponent(code)}`;
//     const url = `${MONITOR_BASE}/run/by-type?type=${encodeURIComponent(type)}&code=${encodeURIComponent(code)}`;
//     const r = await fetch(url, { method: "POST" });

//     if (!r.ok) throw new Error(`Monitor responded ${r.status}`);

//     const data = await r.json();
//     res.json(data);
//   } catch (err) {
//     console.error("[/run-by-type] error:", err);
//     res.status(500).json({ error: "Monitor call failed" });
//   }
// });

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
//     console.error("[/run-monitor] error:", err);
//     res.status(500).json({ error: "Monitor call failed" });
//   }
// });

// app.listen(PORT, () => {
//   console.log(`hello Server Gateway running on ${PORT}`);
// });
