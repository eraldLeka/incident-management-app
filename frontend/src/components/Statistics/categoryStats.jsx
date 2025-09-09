import React, { useEffect, useState } from "react";
import { getCategoryStats } from "../../services/statsService";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from "recharts";
import { useAuth } from "../../contexts/AuthContext";
import { useInView } from "react-intersection-observer";

export default function CategoryStats() {
  const { user } = useAuth();
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [animate, setAnimate] = useState(false);

  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.8,
  });

  useEffect(() => {
    if (!user) return;

    if (user.role.startsWith("admin_") && user.role !== "admin_system") {
      setLoading(false);
      return;
    }

    const fetchStats = async () => {
      try {
        const data = await getCategoryStats();
        const chartData = Object.keys(data).map(key => ({
          category: key,
          count: data[key]
        }));
        setStats(chartData);
      } catch (error) {
        console.error("Error fetching category stats", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  useEffect(() => {
    if (inView) setAnimate(true);
  }, [inView]);

  if (user?.role.startsWith("admin_") && user.role !== "admin_system") {
    return null;
  }

  if (loading) return <p>Loading category stats...</p>;

  return (
    <div ref={ref} style={{ padding: "20px" }}>
      <ResponsiveContainer width="90%" height={300}>
        <BarChart data={stats}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="category" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="count" fill="#0845caff" isAnimationActive={animate} animationDuration={1500} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
