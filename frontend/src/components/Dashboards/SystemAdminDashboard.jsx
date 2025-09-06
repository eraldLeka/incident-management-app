import { useState, useEffect } from "react";
import Menu from "../Menu/Menu";
import api from "../../services/api";
import "../Dashboards/Dashboard.css";

export default function SystemAdminDashboard() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchIncidents = async () => {
      try {
        const response = await api.get("/incidents/");
        if (isMounted) setIncidents(response.data);
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchIncidents();
    return () => (isMounted = false);
  }, []);

  // merr 3 incidentet me te fundit (nga i gjithe sistemi)
  const latestIncidents = [...incidents]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 3);

  return (
    <>
      <Menu />
      <main className="dashboard-body">
        <h2>Recent Incidents</h2>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="incident-grid dashboard">
            {latestIncidents.map((incident) => (
              <div key={incident.id} className={`incident-card ${incident.status.toLowerCase()}`}>
                <div className="info-bar">
                  <span className={`status ${incident.status.toLowerCase()}`}>{incident.status}</span>
                  <span className={`priority ${incident.priority.toLowerCase()}`}>{incident.priority}</span>
                </div>
                <h3>{incident.title}</h3>
                <p>{incident.description}</p>
                <div className="incident-date">
                  {new Date(incident.created_at).toLocaleString("en-GB", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit"
                  })}
                </div>              </div>
            ))}
            {/* plus card */}
            <div
              className="incident-card new-incident-card"
              title="View All Incidents"
              onClick={() => (window.location.href = "/incidents")}
            >
              +
            </div>
          </div>
        )}
      </main>
    </>
  );
}
