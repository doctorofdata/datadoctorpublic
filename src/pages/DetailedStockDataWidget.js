import React from 'react';
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Card,
    CardContent,
    Grid,
} from '@mui/material';

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

const DetailedStockDataWidget = ({ stockData }) => {
    if (!stockData?.out || !stockData.out.length) return null;

    const latestData = stockData.out[stockData.out.length - 1];

    return (
        <Box sx={{ width: '100%', p: 0 }}>
            {/* Summary Cards */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={4}>
                    <Card sx={{ 
                        bgcolor: 'background.paper',
                        border: 1,
                        borderColor: 'divider',
                        boxShadow: 'none'
                    }}>
                        <CardContent>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                Holdings
                            </Typography>
                            <Typography variant="h6">
                                {formatCurrency(latestData.holdings)}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card sx={{ 
                        bgcolor: 'background.paper',
                        border: 1,
                        borderColor: 'divider',
                        boxShadow: 'none'
                    }}>
                        <CardContent>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                Cash
                            </Typography>
                            <Typography variant="h6">
                                {formatCurrency(latestData.cash)}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card sx={{ 
                        bgcolor: 'background.paper',
                        border: 1,
                        borderColor: 'divider',
                        boxShadow: 'none'
                    }}>
                        <CardContent>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                Total Portfolio Value
                            </Typography>
                            <Typography variant="h6" color="primary">
                                {formatCurrency(latestData.total)}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
 
        </Box>
    );
};

export default DetailedStockDataWidget;