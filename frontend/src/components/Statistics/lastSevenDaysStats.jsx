import { useEffect, useState } from "react";
import { getLast7DaysStats } from "../../services/statsService";
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    CartesianGrid
} from "recharts";
import { useInView } from "react-intersection-observer";

export default function LastSevenDaysStats() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [animate, setAnimate] = useState(false);

    const { ref, inView } = useInView({
        triggerOnce: true,
        threshold: 0.1,
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await getLast7DaysStats();

                // transform data into recharts-friendly format
                const chartData = data.dates.map((date, idx) => ({
                    date,
                    Open: data.open[idx],
                    "In Progress": data.in_progress[idx],
                    Solved: data.solved[idx],
                }));

                setStats(chartData);
            } catch (err) {
                setError("Failed to fetch statistics");
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    useEffect(() => {
        if (inView) setAnimate(true);
    }, [inView]);

    if (loading) return <p>Loading stats...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div ref={ref} style={{ width: "90%", height: 400 }}>
            <ResponsiveContainer>
                <LineChart data={stats} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend verticalAlign="top" height={36} />
                    <Line
                         type="monotone" 
                         dataKey="Open" 
                         stroke="#ff4d4f" 
                         strokeWidth={3} 
                         isAnimationActive={animate} 
                         animationDuration={2500} />
                    <Line
                         type="monotone" 
                         dataKey="In Progress" 
                         stroke="#faad14" 
                         strokeWidth={3} 
                         isAnimationActive={animate} 
                         animationDuration={2500} />
                    <Line
                         type="monotone" 
                         dataKey="Solved" 
                         stroke="#52c41a" 
                         strokeWidth={3} 
                         isAnimationActive={animate}
                         animationDuration={2500} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
