import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Menu from "../Menu/Menu";
import api from "../../services/api";
import "../Dashboards/Dashboard.css";

export default function SystemAdminDashboard() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    const fetchIncidents = async () => {
      try {
        const response = await api.get("/incidents/");
        if (isMounted) setIncidents(response.data);
      } catch (err) {
        console.error("Error fetching incidents:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchIncidents();
    return () => (isMounted = false);
  }, []);

  // Merr 3 incidentet më të fundit nga i gjithë sistemi
  const latestIncidents = [...incidents]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 3);

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    const pad = (num) => num.toString().padStart(2, "0");
    return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  };

  return (
    <>
      <Menu />
      <main className="dashboard-body">
        {/* OPEN INCIDENTS */}
        <section className="dashboard-section">
          <h2>Latest Open Incidents (System)</h2>

          {loading ? (
            <div className="loading-container">Loading...</div>
          ) : latestIncidents.length === 0 ? (
            <div className="no-incidents">No open incidents in the system</div>
          ) : (
            <div className="incident-grid dashboard">
              {latestIncidents.map((incident) => (
                <div
                  key={incident.id}
                  className={`incident-card ${incident.status.toLowerCase()}`}
                >
                  <div className="info-bar">
                    <span className={`status ${incident.status.toLowerCase()}`}>
                      {incident.status}
                    </span>
                    <span
                      className={`priority ${incident.priority.toLowerCase()}`}
                    >
                      {incident.priority}
                    </span>
                  </div>
                  <h3>{incident.title}</h3>
                  <p>{incident.description}</p>
                  <div className="incident-date">
                    {formatDateTime(incident.created_at)}
                  </div>
                </div>
              ))}

              {/* Karta për "See All" */}
              <div
                className="incident-card new-incident-card"
                title="See All Incidents"
                onClick={() => navigate("/incidents")}
              >
                See All
              </div>
            </div>
          )}
        </section>

        {/* INFO SECTION */}
        <section className="dashboard-section">
          <h2>About the System Admin Dashboard</h2>
          <p>
            Welcome to the system admin dashboard. Here you can monitor the most recent
            open incidents across all sectors, track their status, and access the
            full list for deeper investigation.
          </p>
        </section>
      </main>
    </>
  );
}
