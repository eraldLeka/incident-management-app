import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import "./Menu.css";

export default function Menu() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate("/login");
  };

  if (!user) return null;

  const isAdmin = user.role.startsWith("admin_") || user.role === "admin_system";

  return (
    <header className={`dashboard-container ${isAdmin ? "admin-header" : ""}`}>
      <h1 className="dashboard-title">
        <Link to="/dashboard" className="welcome-link">Welcome</Link>{" "}
        <Link to="/dashboard" className="welcome-link">{user.name || "User"}</Link>
        {isAdmin && user.role !== "admin_system" ? `, ${user.sector}` : ""}
      </h1>

      <div className="admin-nav-right">
        <nav className="dashboard-nav">
          <ul>
            <li><Link to="/dashboard">Homepage</Link></li>
            {user.role === "admin_system" && (
              <li>
                <Link
                  to="/users/"
                  onClick={() => window.dispatchEvent(new CustomEvent("resetUsers"))}
                >
                  Users
                </Link>
              </li>
            )}
            {/* Shfaq linkun Report Incident vetëm për jo-admin */}
            {!isAdmin && (
              <li><Link to="/incidents/new">Report Incident</Link></li>
            )}
            <li><Link to="/my-incidents">Incidents</Link></li>
            <li><Link>Statistics</Link></li>
          </ul>
        </nav>
        <button onClick={handleLogout} className="logout-button">Logout</button>
      </div>
    </header>
  );
}
