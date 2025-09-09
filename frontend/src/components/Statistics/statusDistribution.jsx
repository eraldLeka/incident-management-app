import React, { useState, useEffect } from "react";
import { getStatusDistribution } from "../../services/statsService";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { useInView } from "react-intersection-observer";

const COLORS = ["#a61315ff", "#896010ff", "#178215ff"];

export default function StatusPieChart() {
    const [data, setData] = useState([]);
    const [animate, setAnimate] = useState(false);
    const { ref, inView } = useInView({
        triggerOnce: true, 
        threshold: 0.3,    
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await getStatusDistribution();
                const total = res.open + res.in_progress + res.solved;

                const chartData = [
                    { name: "Open", value: res.open, percent: total ? ((res.open / total) * 100).toFixed(1) : 0 },
                    { name: "In Progress", value: res.in_progress, percent: total ? ((res.in_progress / total) * 100).toFixed(1) : 0 },
                    { name: "Solved", value: res.solved, percent: total ? ((res.solved / total) * 100).toFixed(1) : 0 },
                ];

                setData(chartData);
            } catch (err) {
                console.error("Failed to fetch status distribution", err);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        if (inView) setAnimate(true);
    }, [inView]);

    if (!data || data.every(d => d.value === 0)) return <p>No Incidents to show.</p>;

    return (
        <div ref={ref}>
            <PieChart width={400} height={400}>
                <Pie
                    data={data}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    fill="#8884d8"
                    isAnimationActive={animate}
                    label={({ name, index }) => `${name}: ${data[index]?.percent ?? 0}%`}
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index]} />
                    ))}
                </Pie>
                <Tooltip formatter={(value, name, props) => [`${value} (${data[props.index]?.percent ?? 0}%)`, name]} />
                <Legend />
            </PieChart>
        </div>
    );
}
