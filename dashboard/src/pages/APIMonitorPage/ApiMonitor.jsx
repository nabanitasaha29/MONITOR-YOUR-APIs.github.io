import React, { useState, useEffect, useMemo, useRef } from "react";
import { useParams } from "react-router-dom";
import "./ApiMonitor.css";

const API_BASE = import.meta.env.VITE_API_BASE || "/dashboard/api";

// front-end route types to backend folder types
const TYPE_MAP = {
  "farmer-registry": "fr",
  "mapper-apis": "mappers",
  "dcs-apis": "dcs",
  "dpe-apis": "dpe",
};

function ApiMonitor() {
  const { type, code } = useParams();

  const [groups, setGroups] = useState([]);
  const [results, setResults] = useState([]);
  const [loadingGroup, setLoadingGroup] = useState(null);
  const [error, setError] = useState(null);
  const [discovering, setDiscovering] = useState(false);

  const normalizedType = TYPE_MAP[type];
  const discoveredOnceRef = useRef(false);

  const stateLabel = code;

  // -------------------------
  // Discover groups (frontend-only)
  // -------------------------
  const discoverGroupsClientSide = async () => {
    if (!normalizedType || !code) return;
    if (discoveredOnceRef.current) return;
    discoveredOnceRef.current = true;

    setDiscovering(true);
    setError(null);

    try {
      const url = `${API_BASE}/run/by-type?type=${normalizedType}&code=${code}`;
      const res = await fetch(url, { method: "POST" });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      const list = Array.isArray(data.results) ? data.results : [];
      const cleanGroups = Array.from(
        new Set(
          list
            .map((r) => r.group || r.meta?.group || "UNGROUPED")
            .filter(Boolean)
            .map((g) => g.toString().trim()),
        ),
      );

      // Set discovered group names as cards
      setGroups(cleanGroups);

      setResults([]);
    } catch (err) {
      console.error("Group discovery failed:", err);
      setError(err.message);
    } finally {
      setDiscovering(false);
    }
  };

  // -------------------------
  // Run a specific group
  // -------------------------
  const runGroup = async (groupName) => {
    if (!groupName) return;
    setLoadingGroup(groupName);
    setError(null);

    try {
      const url =
        `${API_BASE}/run/by-type?type=${normalizedType}&code=${code}` +
        `&group=${encodeURIComponent(groupName)}`;

      const res = await fetch(url, { method: "POST" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      const list = Array.isArray(data.results) ? data.results : [];

      // Normalize group string and keep only the clicked group's results
      const safeList = list
        .map((r) => ({
          ...r,
          group: (r.group || r.meta?.group || "UNGROUPED").toString().trim(),
        }))
        .filter((r) => r.group === groupName);

      // Ensure the group exists in UI even if it wasn’t discovered earlier (defensive)
      setGroups((prev) => {
        if (prev.includes(groupName)) return prev;
        return [...prev, groupName];
      });

      setResults((prev) => {
        // remove any old entries for this group, then add new ones
        const others = prev.filter((r) => r.group !== groupName);
        return [...others, ...safeList];
      });
    } catch (err) {
      console.error("Failed to run group:", err);
      setError(err.message);
    } finally {
      setLoadingGroup(null);
    }
  };

  // -------------------------
  // Grouping for display
  // -------------------------
  const groupedResults = useMemo(() => {
    return groups.reduce((acc, g) => {
      const key = (g || "").trim();
      acc[key] = results.filter((r) => (r.group || "").trim() === key);
      return acc;
    }, {});
  }, [groups, results]);

  // -------------------------
  // Health logic (unchanged)
  // -------------------------
  const getGroupHealth = (groupApis) => {
    if (!groupApis || groupApis.length === 0) {
      return {
        label: "Not Run",
        className: "badge-neutral",
        score: 0,
      };
    }

    const total = groupApis.length;
    const networkErrors = groupApis.filter(
      (api) => api.status === "ERROR",
    ).length;
    const serverErrors = groupApis.filter(
      (api) => typeof api.status === "number" && api.status >= 500,
    ).length;
    const clientErrors = groupApis.filter(
      (api) =>
        typeof api.status === "number" && api.status >= 400 && api.status < 500,
    ).length;

    const slowApis = groupApis.filter((api) => api.slow).length;
    const avgLatency =
      groupApis.reduce((sum, api) => sum + (api.latency || 0), 0) / total;

    let score = 100;
    if (networkErrors > 0) score -= 40;
    if (serverErrors > 0) score -= 30;
    score -= clientErrors * 5;
    score -= slowApis * 3;
    if (avgLatency > 1000) score -= 5;
    if (avgLatency > 2000) score -= 10;
    if (avgLatency > 4000) score -= 15;

    score = Math.max(0, Math.round(score));

    let label = "Healthy";
    let className = "badge-ok";
    if (networkErrors > 0 || serverErrors > 0) {
      label = "Errors";
      className = "badge-bad";
    } else if (score < 50) {
      label = "Critical";
      className = "badge-bad";
    } else if (score < 75) {
      label = "Degraded";
      className = "badge-warn";
    } else if (slowApis > 0) {
      label = "Performance Issues";
      className = "badge-warn";
    }

    return {
      label: `${label} (${score})`,
      className,
      score,
      stats: {
        total,
        networkErrors,
        serverErrors,
        clientErrors,
        slowApis,
        avgLatency: Math.round(avgLatency),
      },
    };
  };

  useEffect(() => {
    setGroups([]);
    setResults([]);
    setError(null);
    setDiscovering(false);
    discoveredOnceRef.current = false;

    // Frontend-only group discovery (runs once per state)
    discoverGroupsClientSide();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, code, normalizedType]);

  return (
    <div className="monitor-wrapper">
      <div className="container">
        <h1 className="page-title">
          Monitoring → {type} → {stateLabel}
        </h1>

        {error && (
          <div style={{ color: "red", marginBottom: "14px" }}>
            Error: {error}
          </div>
        )}

        <div className="grid">
          {groups.length === 0 ? (
            <div className="group-card">
              <div className="group-header">
                <div>
                  <h2 className="group-title">Loading groups…</h2>
                  <span className="health-badge badge-neutral">Not Run</span>
                </div>
                <button className="group-run-btn" disabled>
                  Discovering…
                </button>
              </div>
              <p className="empty">
                {discovering
                  ? "Discovering groups from server…"
                  : "No groups found yet."}
              </p>
            </div>
          ) : (
            groups.map((groupName) => {
              const groupApis = groupedResults[groupName] || [];
              const health = getGroupHealth(groupApis);

              return (
                <div key={groupName} className="group-card">
                  <div className="group-header">
                    <div>
                      <h2 className="group-title">{groupName}</h2>
                      <span
                        className={`health-badge ${health.className}`}
                        title={
                          health.stats
                            ? JSON.stringify(health.stats, null, 2)
                            : ""
                        }
                      >
                        {health.label}
                      </span>
                    </div>

                    <button
                      className="group-run-btn"
                      onClick={() => runGroup(groupName)}
                      disabled={loadingGroup === groupName}
                      title={`Run only: ${groupName}`}
                    >
                      {loadingGroup === groupName ? "Running..." : "Run Group"}
                    </button>
                  </div>

                  {groupApis.length === 0 ? (
                    <p className="empty">Not executed yet</p>
                  ) : (
                    groupApis.map((r, i) => (
                      <div key={`${groupName}-${i}`} className="api-row">
                        <div className="api-header">
                          <h3>{r.name}</h3>
                          <span className="method">{r.method}</span>
                        </div>

                        <p className="api-url">{r.api}</p>

                        <div className="api-metrics">
                          <div className="metric">
                            <span className="label">Status</span>
                            <span
                              className={
                                r.status >= 200 && r.status < 300
                                  ? "ok"
                                  : typeof r.status === "number" &&
                                      r.status >= 500
                                    ? "bad"
                                    : typeof r.status === "number" &&
                                        r.status >= 400
                                      ? "warn"
                                      : r.status === "ERROR"
                                        ? "bad"
                                        : "neutral"
                              }
                            >
                              {r.status}
                              {r.statusText && ` • ${r.statusText}`}
                            </span>
                          </div>

                          <div className="metric">
                            <span className="label">Latency</span>
                            <span className={r.slow ? "slow" : "ok"}>
                              {r.latency} ms
                            </span>
                          </div>
                        </div>

                        {r.payload && (
                          <details className="payload-details">
                            <summary>View Payload</summary>
                            <pre className="payload-box">
                              {typeof r.payload === "object"
                                ? JSON.stringify(r.payload, null, 2)
                                : r.payload}
                            </pre>
                          </details>
                        )}

                        {(r.status === "ERROR" ||
                          (typeof r.status === "number" &&
                            r.status >= 400)) && (
                          <details className="error-details">
                            <summary>View Error</summary>
                            <pre className="error-box">
                              {r.error ||
                                (typeof r.body === "object"
                                  ? JSON.stringify(r.body, null, 2)
                                  : r.body)}
                            </pre>
                          </details>
                        )}

                        {r.body &&
                          typeof r.status === "number" &&
                          r.status >= 200 &&
                          r.status < 400 && (
                            <details className="response-details">
                              <summary>View Response</summary>
                              <pre className="response-box">
                                {typeof r.body === "object"
                                  ? JSON.stringify(r.body, null, 2)
                                  : r.body}
                              </pre>
                            </details>
                          )}
                      </div>
                    ))
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default ApiMonitor;
