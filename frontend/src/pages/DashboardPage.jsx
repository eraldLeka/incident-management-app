import { useAuth } from "../contexts/AuthContext";
import AdminDashboard from "../components/Dashboards/AdminDashboard";
import UserDashboard from "../components/Dashboards/UserDashboard";
import SystemAdminDashboard from "../components/Dashboards/SystemAdminDashboard";
import "../components/Dashboards/Dashboard.css";

export default function DashboardPage() {
  const { user } = useAuth();

  if (!user) return null; // ose mund të vendosësh loading ose redirect

  // Zgjedh komponentin sipas rolit
  if (user.role === "admin_system") {
    return <SystemAdminDashboard />;
  } else if (user.role.startsWith("admin_")) {
    return <AdminDashboard />;
  } else {
    return <UserDashboard />;
  }
}
