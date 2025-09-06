import { useState, useEffect } from "react";
import Menu from "../Menu/Menu";
import api from "../../services/api";
import "../Dashboards/Dashboard.css";

export default function UserDashboard() {
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

  const openIncidents = incidents
    .filter(i => i.status.toLowerCase() === "open")
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 3);

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    const pad = (num) => num.toString().padStart(2, '0');

    const day = pad(date.getDate());
    const month = pad(date.getMonth() + 1);
    const year = date.getFullYear();

    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());

    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  };

  return (
    <>
      <Menu />
      <main className="dashboard-body">

        {/* Open Incidents Section */}
        <section className="dashboard-section">
          <h2>OPEN INCIDENTS</h2>

          {loading ? (
            <div className="loading-container">Loading...</div>
          ) : openIncidents.length === 0 ? (
            <div className="no-incidents">No open incidents</div>
          ) : (
            <div className="incident-grid dashboard">
              {openIncidents.map((incident) => (
                <div key={incident.id} className={`incident-card ${incident.status.toLowerCase()}`}>
                  <div className="info-bar">
                    <span className={`status ${incident.status.toLowerCase()}`}>{incident.status}</span>
                    <span className={`priority ${incident.priority.toLowerCase()}`}>{incident.priority}</span>
                  </div>
                  <h3>{incident.title}</h3>
                  <p>{incident.description}</p>
                  <div className="incident-date">{formatDateTime(incident.created_at)}</div>
                </div>
              ))}

              {/* Karta "+" për incident të ri */}
              <div
                className="incident-card new-incident-card"
                title="Report New Incident"
                onClick={() => window.location.href = "/incidents/new"}
              >
                +
              </div>
            </div>
          )}
        </section>

        {/* Paragraph Section */}
        <section className="dashboard-section">
          <h2>About the Dashboard</h2>
          <p>
            Welcome to your user dashboard. Here you can view the most recent open incidents,
            track their progress, and quickly report new ones. This section can be used to display
            general information or instructions for users.
          </p>
        </section>

      </main>
    </>
  );
}
