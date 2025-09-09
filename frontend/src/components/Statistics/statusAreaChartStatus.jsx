import React, { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { getLast7DaysStats } from "../../services/statsService";

export default function Last7DaysAreaChart() {
    const [series, setSeries] = useState([]);
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await getLast7DaysStats();
                
                setSeries([
                    {
                        name: "Open",
                        data: res.open
                    },
                    {
                        name: "In Progress",
                        data: res.in_progress
                    },
                    {
                        name: "Solved",
                        data: res.solved
                    }
                ]);

                setCategories(res.dates); 
            } catch (err) {
                console.error("Failed to fetch last 7 days stats:", err);
            }
        };

        fetchData();
    }, []);

    const options = {
        chart: {
            type: 'area',
            height: 350,
            toolbar: {
                show: true
            },
            zoom: {
                enabled: false
            }
        },
        dataLabels: {
            enabled: false
        },
        stroke: {
            curve: 'smooth'
        },
        xaxis: {
            categories: categories,
            title: {
                text: "Date"
            }
        },
        yaxis: {
            title: {
                text: "Number of Incidents"
            },
            min: 0
        },
        tooltip: {
            shared: true,
            intersect: false
        },
        legend: {
            position: "top"
        },
        colors: ["#ff4d4f", "#faad14", "#52c41a"]
    };

    return <Chart options={options} series={series} type="area" height={350} />;
}
