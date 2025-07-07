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
    return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
};

const PerformanceChart = ({ stockData }) => {
    if (!stockData?.out || !stockData.out.length) return null;

    // Prepare chart data - only Total Portfolio Value
const chartData = {
    labels: stockData.out.map(item => formatDate(item.Date)),
    datasets: [
        {
            label: 'Total Portfolio Value',
            data: stockData.out.map(item => item.total),
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
                <Line data={chartData} options={chartOptions} />
            </Box>
        </Paper>
    );
};

export default PerformanceChart;