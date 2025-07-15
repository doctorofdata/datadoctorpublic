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
    Tooltip,
} from '@mui/material';
import { ArrowBack, ArrowForward, ContentCopy } from '@mui/icons-material';

// Async Fetch and Parse CSV using PapaParse
async function fetchAndParseCSV(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    let csvText = await response.text();
    // Remove BOM if present
    if (csvText.charCodeAt(0) === 0xFEFF) {
      csvText = csvText.slice(1);
    }
    // Normalize line endings
    csvText = csvText.replace(/\r\n|\r/g, '\n');
    // Use PapaParse for robust parsing
    const result = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
    });
    if (result.errors && result.errors.length > 0) {
      throw new Error(result.errors.map(e => e.message).join("; "));
    }
    return result.data;
  } catch (error) {
    console.error("Error fetching or parsing CSV:", error);
    return null;
  }
}

// Hook using the async fetch-and-parse function
function useCsvRows(csvUrl) {
    const [rows, setRows] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function getRows() {
            setLoading(true);
            setError(null);
            const data = await fetchAndParseCSV(csvUrl);
            if (data === null) {
                setError("Failed to fetch or parse CSV.");
                setRows([]);
            } else {
                setRows(
                    data
                        .map(row => ({
                            prompt: (row.prompt ?? row.Prompt ?? '').trim(),
                            output: (row.output ?? row.Output ?? '').trim(),
                        }))
                        .filter(row => row.prompt || row.output)
                );
            }
            setLoading(false);
        }
        getRows();
    }, [csvUrl]);

    return { rows, error, loading };
}

const copyToClipboard = async (text) => {
    if (!text) return;
    try {
        await navigator.clipboard.writeText(text);
    } catch (err) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
    }
};

const CsvReader = ({ csvUrl = '/data/prompts.csv' }) => {
    const { rows, error, loading } = useCsvRows(csvUrl);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (rows.length === 0) setCurrentIndex(0);
        else if (currentIndex >= rows.length) setCurrentIndex(rows.length - 1);
    }, [rows, currentIndex]);

    const { prompt = '', output = '' } = rows[currentIndex] || {};

    const handleCopy = async (value) => {
        await copyToClipboard(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
    };

    if (loading) {
        return (
            <Paper sx={{ p: 3, textAlign: 'center', borderRadius: 4 }}>
                <CircularProgress />
                <Typography sx={{ mt: 2 }}>Loading Prompts...</Typography>
            </Paper>
        );
    }

    if (error) {
        return (
            <Paper sx={{ p: 3, textAlign: 'center', borderRadius: 4 }}>
                <Typography color="error">{error}</Typography>
            </Paper>
        );
    }

    if (!rows.length) {
        return (
            <Paper sx={{ p: 3, textAlign: 'center', borderRadius: 4 }}>
                <Typography>No prompts found in the CSV.</Typography>
            </Paper>
        );
    }

    return (
        <Paper elevation={0} sx={{ p: 3, borderRadius: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* PROMPT SECTION */}
            <Box>
                <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1 }}>Prompt:</Typography>
                    <Tooltip title={copied ? "Copied!" : "Copy prompt"}>
                        <IconButton
                            aria-label="Copy prompt"
                            size="small"
                            onClick={() => handleCopy(prompt)}
                            sx={{ ml: -1 }}
                        >
                            <ContentCopy fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Stack>
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
            {/* OUTPUT SECTION */}
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