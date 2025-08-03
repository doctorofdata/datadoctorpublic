import React, { useState } from 'react';
import { Accordion, AccordionSummary, AccordionDetails, Checkbox, FormControlLabel, Typography, Box, Chip, Stack } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Papa from 'papaparse';

export default function ExpandableCsvViewer({ csvText }) {
    const [selectedColumns, setSelectedColumns] = useState([]);
    // Parse CSV
    const { data: rows, meta } = Papa.parse(csvText, { header: true, skipEmptyLines: true });
    const columns = meta.fields || (rows.length > 0 ? Object.keys(rows[0]) : []);

    // Handle column selection
    const handleColumnChange = (col) => {
        setSelectedColumns(selectedColumns.includes(col)
            ? selectedColumns.filter(c => c !== col)
            : [...selectedColumns, col]);
    };

    if (!rows.length) return <Typography color="text.secondary">No CSV data loaded.</Typography>;

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
            {rows.map((row, idx) => (
                <Accordion key={idx} sx={{ mb: 1 }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Stack direction="row" spacing={1}>
                            <Chip label={`Row ${idx + 1}`} />
                            {selectedColumns.map(col =>
                                <Chip key={col} label={`${col}: ${row[col]}`} variant="outlined" />
                            )}
                        </Stack>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Stack spacing={1}>
                            {selectedColumns.map(col => (
                                <Box key={col}>
                                    <Typography variant="body2"><b>{col}</b>: {row[col]}</Typography>
                                </Box>
                            ))}
                        </Stack>
                    </AccordionDetails>
                </Accordion>
            ))}
        </Box>
    );
}