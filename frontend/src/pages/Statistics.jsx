import React from "react";
import LastSevenDaysStats from "../components/Statistics/lastSevenDaysStats";
import CategoryStats from "../components/Statistics/categoryStats";
import StatusPieChart from "../components/Statistics/statusDistribution";
import { useAuth } from "../contexts/AuthContext";

export default function Statistics() {
  const { user } = useAuth();

  const showCategoryStats =
    user && !(user.role.startsWith("admin_") && user.role !== "admin_system");

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ marginBottom: "40px" }}>
        <h1 style={{ marginBottom: "20px" }}>Statistics - Last 7 Days</h1>
        <LastSevenDaysStats />
      </div>

      {showCategoryStats && (
        <div>
          <h1 style={{ marginBottom: "20px" }}>Statistics by Category</h1>
          <CategoryStats />
        </div>
      )}

      <div style={{ marginBottom: "40px" }}>
        <h1 style={{ marginBottom: "20px" }}>Statistics by Status</h1>
        <StatusPieChart />
      </div>



    </div>
  );
}
