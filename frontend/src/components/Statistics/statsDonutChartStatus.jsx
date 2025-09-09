import React, { useEffect, useState } from "react";
import ApexCharts from "react-apexcharts";
import { getLast3MonthsStats } from "../../services/statsService";

export default function ThreeMonthsDonutApex() {
    const [data, setData] = useState({ series: [], labels: [] });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const stats = await getLast3MonthsStats();
                const labels = Object.keys(stats); // ["open","in_progress","solved"]
                const series = Object.values(stats); // [12, 5, 20] fr example

                setData({ labels, series });
            } catch (err) {
                console.error("Error fetching 3 months stats", err);
            }
        };

        fetchData();
    }, []);

    const options = {
        chart: {
            type: "donut",
            animations: {
                enabled: true,
                easing: "easeinout",
                speed: 1200
            }
        },
        labels: data.labels,
        legend: { position: "bottom" },
        colors: ["#ff4d4f", "#faad14", "#52c41a"],
        stroke: {
            lineCap: "butt", 
            width: 2
        },
        responsive: [
            {
                breakpoint: 480,
                options: { chart: { width: 300 }, legend: { position: "bottom" } }
            }
        ]
    };

    return (
        <ApexCharts 
            options={options} 
            series={data.series} 
            type="donut" 
            height={350} 
        />
    );
}
