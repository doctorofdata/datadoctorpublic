import React, { useState } from 'react';
import SwipeableViews from 'react-swipeable-views';
import { Box, Chip, Stack, Typography, Checkbox, FormControlLabel, Paper, IconButton } from '@mui/material';
import Papa from 'papaparse';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

export default function CsvCarouselSwipeable({ csvText }) {
    const [selectedColumns, setSelectedColumns] = useState([]);
    const [selectedRow, setSelectedRow] = useState(0);

    // Parse CSV
    const { data: rows, meta } = Papa.parse(csvText || '', { header: true, skipEmptyLines: true });
    const columns = meta.fields || (rows.length > 0 ? Object.keys(rows[0]) : []);
    const rowCount = rows.length;

    // Handle column selection
    const handleColumnChange = (col) => {
        setSelectedColumns(selectedColumns.includes(col)
            ? selectedColumns.filter(c => c !== col)
            : [...selectedColumns, col]);
    };

    const handleChangeIndex = (index) => setSelectedRow(index);

    if (!rowCount) return <Typography color="text.secondary">No CSV data loaded.</Typography>;

    return (
        <Box>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>Select columns to display:</Typography>
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', mb: 2 }}>
                {columns.map(col => (
                    <FormControlLabel
                        key={col}
                        control={
                            <Checkbox
                                checked={selectedColumns.includes(col)}
                                onChange={() => handleColumnChange(col)}
                                sx={{ p: 0.5 }}
                            />
                        }
                        label={col}
                    />
                ))}
            </Stack>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <IconButton
                    size="small"
                    disabled={selectedRow <= 0}
                    onClick={() => setSelectedRow(selectedRow - 1)}
                >
                    <ArrowBackIosNewIcon />
                </IconButton>
                <Stack direction="row" spacing={1} sx={{
                    overflowX: 'auto',
                    flex: 1,
                    maxWidth: '80vw'
                }}>
                    {rows.map((row, idx) => (
                        <Chip
                            key={idx}
                            label={`Row ${idx + 1}`}
                            color={selectedRow === idx ? "primary" : "default"}
                            variant={selectedRow === idx ? "filled" : "outlined"}
                            onClick={() => setSelectedRow(idx)}
                            sx={{ minWidth: 80, cursor: 'pointer', fontWeight: 500 }}
                        />
                    ))}
                </Stack>
                <IconButton
                    size="small"
                    disabled={selectedRow >= rowCount - 1}
                    onClick={() => setSelectedRow(selectedRow + 1)}
                >
                    <ArrowForwardIosIcon />
                </IconButton>
            </Box>
            <SwipeableViews
                index={selectedRow}
                onChangeIndex={handleChangeIndex}
                enableMouseEvents
                resistance
                style={{ marginBottom: 16 }}
            >
                {rows.map((row, idx) => (
                    <Paper
                        key={idx}
                        elevation={3}
                        sx={{ p: 2, borderRadius: 3, minHeight: 120, maxWidth: 600, margin: '0 auto', mt: 2 }}
                    >
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>
                            Row {idx + 1} Details
                        </Typography>
                        <Stack spacing={1}>
                            {selectedColumns.length === 0 ? (
                                <Typography color="text.secondary">No columns selected.</Typography>
                            ) : (
                                selectedColumns.map(col => (
                                    <Box key={col}>
                                        <Typography variant="body2">
                                            <b>{col}</b>: {row[col]}
                                        </Typography>
                                    </Box>
                                ))
                            )}
                        </Stack>
                    </Paper>
                ))}
            </SwipeableViews>
        </Box>
    );
}