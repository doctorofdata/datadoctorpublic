import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import {
    Paper,
    Typography,
    Button,
    Stack,
    IconButton,
    Box,
    CircularProgress,
    Alert
} from '@mui/material';
import { ArrowBack, ArrowForward } from '@mui/icons-material';
import CopyButton from './CopyButton';

const CsvReader = () => {
    const [rows, setRows] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCsv = async () => {
            try {
                const response = await fetch('/data/prompts.csv');
                if (!response.ok) throw new Error('Failed to fetch CSV data.');
                const text = await response.text();

                Papa.parse(text, {
                    header: true,
                    skipEmptyLines: true,
                    complete: (results) => {
                        const filtered = results.data
                            .map(row => ({ prompt: row.prompt || '', output: row.output || '' }))
                            .filter(row => row.prompt || row.output);
                        setRows(filtered);
                        setLoading(false);
                    },
                    error: (err) => {
                        setError(err.message);
                        setLoading(false);
                    },
                });
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchCsv();
    }, []);

    const next = () => setCurrentIndex((prev) => Math.min(prev + 1, rows.length - 1));
    const prev = () => setCurrentIndex((prev) => Math.max(prev - 1, 0));

    if (loading) {
        return (
            <Paper sx={{ p: 3, textAlign: 'center', borderRadius: 4 }}>
                <CircularProgress />
                <Typography sx={{ mt: 2 }}>Loading Prompts...</Typography>
            </Paper>
        );
    }

    if (error) {
        return <Alert severity="error">{error}</Alert>;
    }

    const { prompt, output } = rows[currentIndex] || {};

    return (
        <Paper elevation={0} sx={{ p: 3, borderRadius: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                Prompt Navigator
            </Typography>

            <Box>
                <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1 }}>Prompt:</Typography>
                <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default', minHeight: 80 }}>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{prompt || 'N/A'}</Typography>
                </Paper>
            </Box>

            <Box>
                <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1 }}>Output:</Typography>
                <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default', minHeight: 80 }}>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{output || 'N/A'}</Typography>
                </Paper>
            </Box>

            <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
                <IconButton onClick={prev} disabled={currentIndex === 0}><ArrowBack /></IconButton>
                <Typography variant="caption">{currentIndex + 1} / {rows.length}</Typography>
                <IconButton onClick={next} disabled={currentIndex >= rows.length - 1}><ArrowForward /></IconButton>
                <CopyButton textToCopy={prompt} />
            </Stack>
        </Paper>
    );
};

export default CsvReader;
