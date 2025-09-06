import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from './contexts/AuthContext';
import Login from "./pages/Login";
import Dashboard from "./pages/DashboardPage";
import IncidentList from "./components/IncidentList/IncidentList";
import IncidentForm from "./components/Forms/IncidentForm";
import MyIncidents from "./pages/MyIncidents";
import Users from "./pages/Users";
import MainLayout from "./components/Menu/MainLayout";

function App() {
  const { user, loading } = useAuth();

  console.log("App render -> user:", user, "loading:", loading);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px'
      }}>
        Loading...
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={
            console.log("Route / -> user:", user) || 
            (user ? <Navigate to="/dashboard" /> : <Login />)
          } 
        />
        <Route path="/login" element={<Login />} />

        {user && (
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/incidents" element={<IncidentList />} />
            <Route path="/incidents/new" element={<IncidentForm />} />
            <Route path="/my-incidents" element={<MyIncidents />} />
            <Route path="/users" element={<Users />} />
          </Route>
        )}

        {!user && <Route path="*" element={<Navigate to="/login" />} />}
      </Routes>
    </Router>
  );
}

export default App;
