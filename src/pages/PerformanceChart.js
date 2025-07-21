import React from 'react';
import {
    Box,
    Typography,
    Paper,
} from '@mui/material';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const formatCurrency = (num) => {
    if (typeof num !== 'number') return '-';
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(num);
};

const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    } catch (e) {
        console.error('Error formatting date:', e, dateString);
        return dateString;
    }
};

const PerformanceChart = ({ stockData }) => {

    console.log("PerformanceChart received data:", stockData);
    
    // Handle various data structures
    let dataForChart = [];
    
    if (stockData?.out && Array.isArray(stockData.out)) {
        dataForChart = stockData.out;
    } else if (Array.isArray(stockData)) {
        dataForChart = stockData;
    } else {
        console.error("No valid chart data found:", stockData);
        return null;
    }
    
    if (dataForChart.length === 0) {
        return null;
    }
    
    // Debug what fields are available
    console.log("First data point:", dataForChart[0]);
    console.log("More data points:", dataForChart.slice(0, 3));
    
    // Check if data contains required fields (case insensitive)
    const hasDate = dataForChart[0].Date || dataForChart[0].date;
    const hasTotal = dataForChart[0].total || dataForChart[0].Total;
    
    if (!hasDate || !hasTotal) {
        console.error("Chart data missing required fields:", dataForChart[0]);
        return null;
    }

    // Prepare chart data - only Total Portfolio Value (handle case differences)
    const lineChartData = {
        labels: dataForChart.map(item => formatDate(item.Date || item.date)),
        datasets: [
            {
                label: 'Total Portfolio Value',
                data: dataForChart.map(item => item.total || item.Total),
                borderColor: '#1e90ff', // Dodger Blue
                backgroundColor: 'rgba(30, 144, 255, 0.1)', // Dodger Blue transparent fill
                borderWidth: 1.5,
                fill: true,
                tension: 0, // Sharp, straight lines
                pointRadius: 0,
                pointHoverRadius: 0,
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        elements: {
            line: {
                borderColor: '#1e90ff', // Ensure line color is Dodger Blue
                borderWidth: 3,
                tension: 0,
            },
            point: {
                radius: 0,
                hoverRadius: 0
            }
        },
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                backgroundColor: 'rgba(30, 30, 42, 0.95)',
                titleColor: '#e6edf3',
                bodyColor: '#e6edf3',
                borderColor: 'rgba(255, 255, 255, 0.12)',
                borderWidth: 1,
                cornerRadius: 8,
                displayColors: false,
                callbacks: {
                    label: function(context) {
                        return `Portfolio Value: ${formatCurrency(context.parsed.y)}`;
                    }
                }
            }
        },
        scales: {
            x: {
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)',
                    drawBorder: false
                },
                ticks: {
                    color: '#8b949e',
                    font: {
                        size: 11,
                        family: '"Inter", sans-serif'
                    },
                    maxTicksLimit: 10
                }
            },
            y: {
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)',
                    drawBorder: false
                },
                ticks: {
                    color: '#8b949e',
                    font: {
                        size: 11,
                        family: '"Inter", sans-serif'
                    },
                    callback: function(value) {
                        return formatCurrency(value);
                    }
                }
            }
        },
        interaction: {
            intersect: false,
            mode: 'index'
        }
    };

    return (
        <Paper sx={{ 
            width: '100%',
            border: 1,
            borderColor: 'divider',
            boxShadow: 'none',
            bgcolor: 'background.paper',
            p: 2
        }}>
            <Typography 
                variant="h6" 
                gutterBottom 
                sx={{ 
                    mb: 2,
                    fontWeight: 600,
                    color: 'text.primary'
                }}
            >
                Estimated Portfolio Value Over Time ($)
            </Typography>
            <Box sx={{ height: 400, width: '100%' }}>
                <Line data={lineChartData} options={chartOptions} />
            </Box>
        </Paper>
    );
};

export default PerformanceChart;