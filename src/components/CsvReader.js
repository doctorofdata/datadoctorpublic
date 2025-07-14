import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import ReactMarkdown from 'react-markdown';
import {
    Paper,
    Typography,
    Stack,
    IconButton,
    Box,
    CircularProgress,
    Alert
} from '@mui/material';
import { ArrowBack, ArrowForward } from '@mui/icons-material';

function useCsvRows(csvUrl) {
    const [rows, setRows] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchAndParseCsv() {
            try {
                const response = await fetch(csvUrl);
                if (!response.ok) {
                    setError(`Failed to fetch CSV: ${response.status}`);
                    setLoading(false);
                    return;
                }
                const text = await response.text();
                const results = Papa.parse(text, { header: true, skipEmptyLines: true });
                // This cannot be stripped and will always display
                window.__CSV_DEBUG__ = results.data;
                setRows(results.data.map(row => ({
                    prompt: (row.prompt ?? row['prompt'] ?? row['Prompt'] ?? '').trim(),
                    output: (row.output ?? row['output'] ?? row['Output'] ?? '').trim(),
                })).filter(row => row.prompt || row.output));
                setLoading(false);
            } catch (err) {
                setError(err.message || 'Unknown error');
                setLoading(false);
            }
        }
        fetchAndParseCsv();
    }, [csvUrl]);

    return { rows, error, loading };
}

const CsvReader = () => {
    const { rows, error, loading } = useCsvRows('/data/prompts.csv');
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (rows.length === 0) setCurrentIndex(0);
        else if (currentIndex >= rows.length) setCurrentIndex(rows.length - 1);
    }, [rows, currentIndex]);

    // DEFENSIVE: always show debug info on screen
    const { prompt = '', output = '' } = rows[currentIndex] || {};

    return (
        <Paper elevation={0} sx={{ p: 3, borderRadius: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ whiteSpace: 'pre-wrap', color: 'red', fontSize: '12px', wordBreak: 'break-all', mb: 2 }}>
                DEBUG: {JSON.stringify({ rows, currentIndex, prompt, output, loading, error }, null, 2)}
            </Box>
            <Typography
                variant="h6"
                sx={{ fontWeight: 600, color: 'text.primary' }}
                data-debug={JSON.stringify({ rows, currentIndex, prompt, output, loading, error })}
            >
                Prompt Navigator
            </Typography>
            <Box>
                <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1 }}>Prompt:</Typography>
                <Paper variant="outlined" sx={{
                    p: 2,
                    bgcolor: 'background.default',
                    minHeight: 80,
                    minWidth: 0,
                    maxWidth: '100%',
                    overflowX: 'auto',
                    wordBreak: 'break-word',
                }}>
                    {prompt
                        ? <ReactMarkdown>{prompt}</ReactMarkdown>
                        : <Typography variant="body2" sx={{ color: 'text.disabled' }}>No prompt</Typography>}
                </Paper>
            </Box>
            <Box>
                <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1 }}>Output:</Typography>
                <Paper variant="outlined" sx={{
                    p: 2,
                    bgcolor: 'background.default',
                    minHeight: 80,
                    minWidth: 0,
                    maxWidth: '100%',
                    overflowX: 'auto',
                    wordBreak: 'break-word',
                }}>
                    {output
                        ? <ReactMarkdown>{output}</ReactMarkdown>
                        : <Typography variant="body2" sx={{ color: 'text.disabled' }}>No output</Typography>}
                </Paper>
            </Box>
            <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
                <IconButton onClick={() => setCurrentIndex(i => Math.max(i - 1, 0))} disabled={currentIndex === 0}>
                    <ArrowBack />
                </IconButton>
                <Typography variant="caption">{currentIndex + 1} / {rows.length}</Typography>
                <IconButton onClick={() => setCurrentIndex(i => Math.min(i + 1, rows.length - 1))} disabled={currentIndex >= rows.length - 1}>
                    <ArrowForward />
                </IconButton>
            </Stack>
        </Paper>
    );
};

export default CsvReader;