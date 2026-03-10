import React, { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import dayjs from "dayjs";
import { BarChart2, Activity, Users, CheckCircle2 } from "lucide-react";
import "./DashboardLandingPage.css";
const DEMO_APIS = [
  {
    api_name: "FarmerRegistry_Search",
    group: "Farmer Registry APIs",
    state: "MH",
    status: "UP",
    consumers: 125,
    owners: "mahi@ex.com|ops@ex.com",
    uptime_7d: 99.95,
    last_deploy: "2026-03-01",
  },
  {
    api_name: "FarmerRegistry_Update",
    group: "Farmer Registry APIs",
    state: "RJ",
    status: "DEGRADED",
    consumers: 43,
    owners: "ops@ex.com",
    uptime_7d: 98.9,
    last_deploy: "2026-03-05",
  },
  {
    api_name: "Mapper_Geo",
    group: "Mapper APIs",
    state: "KA",
    status: "UP",
    consumers: 210,
    owners: "geo@ex.com",
    uptime_7d: 99.99,
    last_deploy: "2026-03-04",
  },
  {
    api_name: "DCS_Aggregate",
    group: "DCS APIs",
    state: "UP",
    status: "DOWN",
    consumers: 12,
    owners: "data@ex.com",
    uptime_7d: 96.2,
    last_deploy: "2026-02-28",
  },
  {
    api_name: "DPE_Publisher",
    group: "DPE APIs",
    state: "TN",
    status: "UP",
    consumers: 61,
    owners: "pub@ex.com",
    uptime_7d: 99.7,
    last_deploy: "2026-03-06",
  },
];
function makeDemoUsage(days = 7) {
  const rng = (min, max) => Math.floor(min + Math.random() * (max - min + 1));
  const end = dayjs();
  const points = [];
  DEMO_APIS.forEach((api) => {
    for (let d = days; d >= 0; d--) {
      for (let h = 0; h < 24; h++) {
        const ts = end.subtract(d, "day").hour(h).minute(0).second(0);
        const rush =
          h >= 18 && h <= 22
            ? 1.4
            : h < 6
              ? 0.7
              : h >= 9 && h <= 12
                ? 1.2
                : 1.0;
        const base =
          api.status === "UP" ? 380 : api.status === "DEGRADED" ? 300 : 220;
        const requests = Math.max(0, Math.round(rush * (base + rng(-80, 80))));
        const errRate =
          api.status === "UP"
            ? Math.random() * 0.005
            : api.status === "DEGRADED"
              ? Math.random() * 0.02
              : Math.random() * 0.05;
        const errors = Math.round(requests * errRate);
        points.push({
          timestamp: ts.toISOString(),
          api_name: api.api_name,
          requests,
          errors,
        });
      }
    }
  });
  return points;
}
const DEMO_USAGE = makeDemoUsage();

const STATUS_COLORS = {
  UP: "#22c55e",
  DEGRADED: "#f59e0b",
  DOWN: "#ef4444",
};
const ACCENT = "#38bdf8";

const fmtInt = (n) => n?.toLocaleString?.() ?? n;

function groupBy(arr, key) {
  return arr.reduce((acc, item) => {
    const k = typeof key === "function" ? key(item) : item[key];
    (acc[k] ||= []).push(item);
    return acc;
  }, {});
}
function sum(arr, sel) {
  if (!arr?.length) return 0;
  if (typeof sel === "function")
    return arr.reduce((a, c) => a + (sel(c) || 0), 0);
  return arr.reduce((a, c) => a + (+c[sel] || 0), 0);
}
function buildDailySeries(usage) {
  const byDay = groupBy(usage, (r) => dayjs(r.timestamp).format("YYYY-MM-DD"));
  return Object.entries(byDay)
    .map(([date, rows]) => ({
      date,
      requests: sum(rows, "requests"),
      errors: sum(rows, "errors"),
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export default function DashboardLandingPage() {
  const [apis, setApis] = useState([]);
  const [usage, setUsage] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load data (replace this with real fetch calls later)
  useEffect(() => {
    setTimeout(() => {
      setApis(DEMO_APIS);
      setUsage(DEMO_USAGE);
      setLoading(false);
    }, 250);
  }, []);

  // Use last 7 days only (minimal)
  const from = dayjs().subtract(7, "day").startOf("day");
  const usage7 = useMemo(() => {
    return usage.filter(
      (u) =>
        dayjs(u.timestamp).isAfter(from) &&
        dayjs(u.timestamp).isBefore(dayjs().endOf("day")),
    );
  }, [usage]);

  // KPIs
  const totalApis = apis.length;
  const upCt = apis.filter((a) => a.status === "UP").length;
  const pctUp = totalApis ? (upCt / totalApis) * 100 : 0;
  const totalConsumers = sum(apis, "consumers");

  // Status split
  const statusSplit = useMemo(() => {
    const counts = { UP: 0, DEGRADED: 0, DOWN: 0 };
    apis.forEach((a) => {
      counts[a.status] = (counts[a.status] || 0) + 1;
    });
    return ["UP", "DEGRADED", "DOWN"].map((n) => ({
      name: n,
      value: counts[n] || 0,
    }));
  }, [apis]);

  // Requests (daily)
  const daily = useMemo(() => buildDailySeries(usage7), [usage7]);

  // Top APIs by requests
  const topByRequests = useMemo(() => {
    const g = groupBy(usage7, "api_name");
    const arr = Object.entries(g).map(([api_name, rows]) => ({
      api_name,
      requests: sum(rows, "requests"),
      errors: sum(rows, "errors"),
      error_rate: sum(rows, "requests")
        ? (sum(rows, "errors") / sum(rows, "requests")) * 100
        : 0,
    }));
    return arr.sort((a, b) => b.requests - a.requests).slice(0, 5);
  }, [usage7]);

  // Table rows (compact)
  const tableRows = useMemo(() => {
    const g = groupBy(usage7, "api_name");
    return apis
      .map((a) => {
        const rows = g[a.api_name] || [];
        const req = sum(rows, "requests");
        const err = sum(rows, "errors");
        const erate = req ? (err / req) * 100 : 0;
        return {
          ...a,
          requests: req,
          errors: err,
          error_rate: erate,
        };
      })
      .sort((x, y) => y.requests - x.requests);
  }, [apis, usage7]);

  return (
    <div className="dash-page">
      {/* Header */}
      <div className="dash-header">
        <div className="title">
          <BarChart2 size={18} />
          <h2>API Dashboard</h2>
        </div>
        <div className="subtitle">Last 7 days • Minimal view</div>
      </div>

      {/* KPIs */}
      <div className="kpis">
        <div className="kpi-card">
          <div className="kpi-icon">
            <Activity size={16} />
          </div>
          <div className="kpi-content">
            <div className="kpi-title">Onboarded APIs</div>
            <div className="kpi-value">{fmtInt(totalApis)}</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon ok">
            <CheckCircle2 size={16} />
          </div>
          <div className="kpi-content">
            <div className="kpi-title">% Up</div>
            <div className="kpi-value">{pctUp.toFixed(1)}%</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon">
            <Users size={16} />
          </div>
          <div className="kpi-content">
            <div className="kpi-title">Consumers</div>
            <div className="kpi-value">{fmtInt(totalConsumers)}</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon">
            <BarChart2 size={16} />
          </div>
          <div className="kpi-content">
            <div className="kpi-title">Requests (range)</div>
            <div className="kpi-value">{fmtInt(sum(daily, "requests"))}</div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="charts grid-2">
        <div className="card">
          <div className="card-title">API Status</div>
          <div className="chart">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={statusSplit}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={2}
                  startAngle={90}
                  endAngle={-270}
                >
                  {statusSplit.map((e, idx) => (
                    <Cell key={idx} fill={STATUS_COLORS[e.name]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v, n) => [v, n]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-title">Requests Over Time</div>
          <div className="chart">
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={daily}>
                <defs>
                  <linearGradient id="reqGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={ACCENT} stopOpacity={0.9} />
                    <stop offset="95%" stopColor={ACCENT} stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  stroke="rgba(255,255,255,0.06)"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  tickFormatter={(d) => dayjs(d).format("MMM D")}
                />
                <YAxis />
                <Tooltip
                  formatter={(v, n) => [fmtInt(v), n]}
                  labelFormatter={(l) => dayjs(l).format("MMM D, YYYY")}
                />
                <Area
                  type="monotone"
                  dataKey="requests"
                  stroke={ACCENT}
                  fill="url(#reqGrad)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top APIs */}
      <div className="card">
        <div className="card-title">Top APIs by Requests</div>
        <div className="chart">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={topByRequests}
              layout="vertical"
              margin={{ left: 20 }}
            >
              <CartesianGrid stroke="rgba(255,255,255,0.06)" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="api_name" width={200} />
              <Tooltip formatter={(v) => fmtInt(v)} />
              <Bar dataKey="requests" radius={[4, 4, 4, 4]} fill={ACCENT} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Table */}
      <div className="card table-card">
        <div className="card-title">API Details (compact)</div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>API</th>
                <th>Group</th>
                <th>State</th>
                <th>Status</th>
                <th>Consumers</th>
                <th>Requests</th>
                <th>Error Rate</th>
                <th>Uptime (7d)</th>
              </tr>
            </thead>
            <tbody>
              {!loading &&
                tableRows.map((a) => (
                  <tr key={a.api_name}>
                    <td className="mono">{a.api_name}</td>
                    <td>{a.group}</td>
                    <td>{a.state}</td>
                    <td>
                      <span className={`badge ${a.status.toLowerCase()}`}>
                        {a.status}
                      </span>
                    </td>
                    <td>{fmtInt(a.consumers)}</td>
                    <td>{fmtInt(a.requests)}</td>
                    <td>
                      {a.error_rate ? `${a.error_rate.toFixed(2)}%` : "0%"}
                    </td>
                    <td>{a.uptime_7d?.toFixed?.(2)}%</td>
                  </tr>
                ))}
              {loading && (
                <tr>
                  <td colSpan="8" className="muted center">
                    Loading…
                  </td>
                </tr>
              )}
              {!loading && !tableRows.length && (
                <tr>
                  <td colSpan="8" className="muted center">
                    No data.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
