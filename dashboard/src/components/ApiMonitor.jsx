import { useState, useEffect } from "react";
import "./ApiMonitor.css";

function ApiMonitor() {
  const [groups, setGroups] = useState([]);
  const [results, setResults] = useState([]);
  const [loadingGroup, setLoadingGroup] = useState(null);

  // Load groups on first render
  useEffect(() => {
    fetch("http://localhost:4000/groups")
      .then((res) => res.json())
      .then((data) => setGroups(data))
      .catch(() => alert("Failed to load groups"));
  }, []);

  const runGroup = async (groupName) => {
    setLoadingGroup(groupName);

    try {
      const res = await fetch(
        `http://localhost:4000/run-monitor?group=${groupName}`,
      );
      const data = await res.json();

      setResults((prev) => [
        ...prev.filter((r) => r.group !== groupName),
        ...data,
      ]);
    } catch (err) {
      alert("Failed to run group");
    }

    setLoadingGroup(null);
  };

  const groupedResults = results.reduce((acc, result) => {
    if (!acc[result.group]) acc[result.group] = [];
    acc[result.group].push(result);
    return acc;
  }, {});

  //  HEALTH LOGIC

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

    // 🚨 HARD penalties for real failures
    if (networkErrors > 0) score -= 40;
    if (serverErrors > 0) score -= 30;

    // ⚠ Soft penalties
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

  return (
    <div className="monitor-wrapper">
      <div className="container">
        <h1  className="container-title">AgriStack Service Monitor</h1>

        <div className="grid">
          {groups.map((groupName) => {
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
                  >
                    {loadingGroup === groupName ? "Running..." : "Run Group"}
                  </button>
                </div>

                {groupApis.length === 0 ? (
                  <p className="empty">Not executed yet</p>
                ) : (
                  groupApis.map((r, i) => (
                    <div key={i} className="api-row">
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
                                    : "neutral"
                            }
                          >
                            {r.status}
                            {r.statusText && ` • ${r.statusText}`}
                            {console.log(r.statusText)}
                          </span>
                        </div>

                        <div className="metric">
                          <span className="label">Latency</span>
                          <span className={r.slow ? "slow" : "ok"}>
                            {r.latency} ms
                          </span>
                        </div>
                      </div>

                      {/* Payload */}
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

                      {/* Error */}
                      {(r.status === "ERROR" || r.status >= 400) && (
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

                      {/* Response */}
                      {r.body && r.status >= 200 && r.status < 400 && (
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
          })}
        </div>
      </div>
    </div>
  );
}

export default ApiMonitor;
