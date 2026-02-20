
import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { execFile } from "child_process";

const app = express();
app.use(cors());

const CONFIG_PATH = path.join(process.cwd(), "../monitor/config.json");

/* Get Groups */
app.get("/groups", (req, res) => {
  try {
    const raw = fs.readFileSync(CONFIG_PATH);
    const config = JSON.parse(raw);
    res.json(Object.keys(config));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load groups" });
  }
});

/* Run Monitor */
app.get("/run-monitor", (req, res) => {
  const group = req.query.group;
  const args = group ? [group] : [];

  execFile(
    "python",
    ["../monitor/monitor.py", ...args],
    (error, stdout, stderr) => {
      if (error) {
        console.error(stderr);
        return res.status(500).json({ error: stderr });
      }

      try {
        const data = JSON.parse(stdout);
        res.json(data);
      } catch (err) {
        console.error("JSON parse error:", stdout);
        res.status(500).json({ error: "Invalid JSON from Python" });
      }
    }
  );
});

app.listen(4000, () =>
  console.log("🚀 Gateway running on 4000")
);
