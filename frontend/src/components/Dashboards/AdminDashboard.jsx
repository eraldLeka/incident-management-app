import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Menu from "../Menu/Menu";
import api from "../../services/api";
import "../Dashboards/Dashboard.css";

// charts
import ThreeMonthsDonutApex from "../Statistics/statsDonutChartStatus";
import Last7DaysAreaChart from "../Statistics/statusAreaChartStatus";

export default function AdminDashboard() {
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
    return () => {
      isMounted = false;
    };
  }, []);

  const getDashboardIncidents = () => {
    const result = [];
    const statuses = ["open", "in_progress", "solved"];

    for (let status of statuses) {
      const filtered = incidents
        .filter((i) => i.status.toLowerCase() === status)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      for (let i of filtered) {
        if (result.length < 3) result.push(i);
      }

      if (result.length >= 3) break;
    }

    return result;
  };

  const displayIncidents = getDashboardIncidents();

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    const pad = (num) => num.toString().padStart(2, "0");
    return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  };

  return (
    <>
      <Menu />
      <main className="dashboard-body">
        {/* INCIDENTS */}
        <section className="dashboard-section">
          <h2>Latest Incidents</h2>

          {loading ? (
            <div className="loading-container">Loading...</div>
          ) : displayIncidents.length === 0 ? (
            <div className="no-incidents">No incidents in your sector</div>
          ) : (
            <div className="incident-grid dashboard">
              {displayIncidents.map((incident) => (
                <div
                  key={incident.id}
                  className={`incident-card ${incident.status.toLowerCase()}`}
                >
                  <div className="info-bar">
                    <span className={`status ${incident.status.toLowerCase()}`}>
                      {incident.status.replace("_", " ")}
                    </span>
                    <span className={`priority ${incident.priority.toLowerCase()}`}>
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

        {/* CHARTS SECTION */}
        <section className="dashboard-section">
                  <h2>Statistics</h2>
                  <div className="charts-row">
                    <div className="chart-container">
                      <ThreeMonthsDonutApex />
                    </div>
                    <div className="chart-container">
                      <Last7DaysAreaChart />
                    </div>
                  </div>
                  <div className="see-more-btn-container">
                    <button className="see-more-btn" onClick={() => navigate("/statistics")}>
                      See More
                    </button>
                  </div>
                </section>
      </main>
    </>
  );
}
