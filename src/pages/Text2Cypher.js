import React, { useState } from 'react';
import {
    Stack,
    Box,
    Paper,
    Typography,
    IconButton,
    Chip,
    Tooltip,
    Fade,
    Button,
    TextField,
    InputAdornment,
    Alert,
    Collapse,
    LinearProgress,
    Avatar,
    Badge,
    Grid,
    Card,
    CardContent
} from '@mui/material';
import { styled, createTheme, ThemeProvider } from '@mui/material/styles';
import {
    History as HistoryIcon,
    Code as CodeIcon,
    Psychology as PsychologyIcon,
    Download as DownloadIcon,
    PlayArrow as PlayIcon,
    Stop as StopIcon,
    Tune as TuneIcon,
    CheckCircle as CheckIcon,
    Error as ErrorIcon,
    Speed as SpeedIcon,
} from '@mui/icons-material';
import { CopyBlock } from 'react-code-blocks';
import DashboardFrame from 'components/DashboardFrame';
import CsvReader from '../components/CsvReader';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';

// --- THEME & STYLED COMPONENTS ---

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: { main: '#8c7cf0' }, // A nice purple
        secondary: { main: '#03a9f4' }, // A vibrant blue
        background: {
            paper: 'rgba(30, 30, 42, 0.7)', // Semi-transparent dark paper
            default: '#0d1117', // GitHub-like dark background
        },
        text: {
            primary: '#e6edf3',
            secondary: '#8b949e',
        },
    },
    typography: {
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"'
    },
    components: {
        MuiPaper: {
            styleOverrides: {
                root: {
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    backgroundImage: 'none',
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                },
            },
        },
    },
});

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: 16,
  height: '100%',
  display: 'grid',
  gridTemplateRows: 'auto 1fr auto',
  gap: theme.spacing(2),
}));

const SectionHeader = styled(Typography)(({ theme }) => ({
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
    color: theme.palette.text.primary,
}));

// --- UI COMPONENTS ---

const FineTunedPerformance = ({ onMetricClick }) => {
    const metrics = [{ label: 'BLEU Score', value: '87.3%', icon: <CheckIcon />, color: 'success.main' }, { label: 'Response Time', value: '2.1s', icon: <SpeedIcon />, color: 'info.main' }];
    return (
        <Paper elevation={0} sx={{ p: 2, borderRadius: 4 }}>
            <SectionHeader variant="h6">Fine-Tuned Model Performance</SectionHeader>
            <Grid container spacing={2}>
                {metrics.map((metric) => (
                    <Grid item xs={6} key={metric.label}>
                        <Card sx={{ bgcolor: 'background.default', p: 1, textAlign: 'center', borderRadius: 3 }}>
                            <Avatar sx={{ bgcolor: metric.color, width: 32, height: 32, mx: 'auto', mb: 1 }}>{metric.icon}</Avatar>
                            <Typography variant="h6" sx={{ fontWeight: 700 }}>{metric.value}</Typography>
                            <Typography variant="caption" color="text.secondary">{metric.label}</Typography>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Paper>
    );
};

const ModelPerformance = ({ onMetricClick }) => {
    const metrics = [{ label: 'BLEU Score', value: '87.3%', icon: <CheckIcon />, color: 'success.main' }, { label: 'Response Time', value: '2.1s', icon: <SpeedIcon />, color: 'info.main' }];
    return (
        <Paper elevation={0} sx={{ p: 2, borderRadius: 4 }}>
            <SectionHeader variant="h6">Base Model Performance</SectionHeader>
            <Grid container spacing={2}>
                {metrics.map((metric) => (
                    <Grid item xs={6} key={metric.label}>
                        <Card sx={{ bgcolor: 'background.default', p: 1, textAlign: 'center', borderRadius: 3 }}>
                            <Avatar sx={{ bgcolor: metric.color, width: 32, height: 32, mx: 'auto', mb: 1 }}>{metric.icon}</Avatar>
                            <Typography variant="h6" sx={{ fontWeight: 700 }}>{metric.value}</Typography>
                            <Typography variant="caption" color="text.secondary">{metric.label}</Typography>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Paper>
    );
};

const QueryPanel = ({ onQuerySubmit, isLoading }) => {
    const [query, setQuery] = useState('');
    const [history, setHistory] = useState(['Show me all users who made purchases in the last 30 days']);

    const handleSubmit = () => {
        if (query.trim()) {
            onQuerySubmit?.(query);
            if (!history.includes(query)) setHistory(prev => [query, ...prev].slice(0, 5));
        }
    };

    return (
        <Paper elevation={0} sx={{ p: 3, borderRadius: 4 }}>
            <SectionHeader variant="h6"><PsychologyIcon color="primary" />Text-to-Cypher Model Input</SectionHeader>
            <Stack spacing={2}>
                <TextField
                    fullWidth
                    multiline
                    minRows={3}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Describe the data relationships you want to query..."
                    variant="filled"
                    sx={{ '& .MuiFilledInput-root': { borderRadius: 2, padding: 2 } }}
                />
                <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={!query.trim() || isLoading}
                    startIcon={isLoading ? <StopIcon /> : <PlayIcon />}
                    size="large"
                >
                    {isLoading ? 'Generating...' : 'Generate Query'}
                </Button>
                {isLoading && <LinearProgress color="primary" />}
                <Box>
                    <Typography variant="caption" color="text.secondary">Suggestions:</Typography>
                    <Stack direction="row" spacing={1} mt={1} useFlexGap flexWrap="wrap">
                        {history.map((h) => <Chip key={h} label={h} variant="outlined" size="small" onClick={() => setQuery(h)} />)}
                    </Stack>
                </Box>
            </Stack>
        </Paper>
    );
};

const FineTunedCypherOutputPanel = ({ cypherQuery, onExecute, onExport }) => {
    return (
        <StyledPaper elevation={0}>
            <SectionHeader variant="h6"><CodeIcon color="secondary" />Fine-Tuned Output</SectionHeader>
            <SyntaxHighlighter language = 'markdown' style = {atomOneDark} customStyle = {{background: '#1e1e2e',
                                                                                           borderRadius: '8px',
                                                                                           padding: '16px',
                                                                                           fontSize: '0.9rem',
                                                                                            lineHeight: 1.5}}>
                {cypherQuery || 'Your generated Cypher query will appear here...'}
            </SyntaxHighlighter>
            <Stack direction="row" spacing={1} mt={2}>
                <Button variant="outlined" startIcon={<PlayIcon />} disabled={!cypherQuery} onClick={() => onExecute?.(cypherQuery)}>Execute</Button>
                <Button variant="outlined" startIcon={<DownloadIcon />} disabled={!cypherQuery} onClick={() => onExport?.(cypherQuery)}>Export</Button>
            </Stack>
        </StyledPaper>
    );
};

const BaseCypherOutputPanel = ({ cypherQuery, onExecute, onExport }) => {
    return (
        <StyledPaper elevation={0}>
            <SectionHeader variant="h6"><CodeIcon color="secondary" />Generated Cypher</SectionHeader>
            <SyntaxHighlighter language = 'markdown' style = {atomOneDark} customStyle = {{background: '#1e1e2e',
                                                                                           borderRadius: '8px',
                                                                                           padding: '16px',
                                                                                           fontSize: '0.9rem',
                                                                                            lineHeight: 1.5}}>
                {cypherQuery || 'Your generated Cypher query will appear here...'}
            </SyntaxHighlighter>
            <Stack direction="row" spacing={1} mt={2}>
                <Button variant="outlined" startIcon={<PlayIcon />} disabled={!cypherQuery} onClick={() => onExecute?.(cypherQuery)}>Execute</Button>
                <Button variant="outlined" startIcon={<DownloadIcon />} disabled={!cypherQuery} onClick={() => onExport?.(cypherQuery)}>Export</Button>
            </Stack>
        </StyledPaper>
    );
};

const EnhancedFineTuningCard = () => (
    <Paper elevation={0} sx={{ p: 3, borderRadius: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>Llama3.1 Fine-Tuned</Typography>
                <Typography variant="body2" color="text.secondary">Optimized for Text-to-Cypher Translation</Typography>
            </Box>
            <Chip icon={<CheckIcon />} label="Active" color="success" size="small" />
        </Stack>
    </Paper>
);

// --- MAIN PAGE --- 

const Page = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [cypherQuery, setCypherQuery] = useState('');
    const [executionResult, setExecutionResult] = useState(null);

    const handleQuerySubmit = (query) => {
        setIsLoading(true);
        setCypherQuery('');
        setTimeout(() => {
            const mockQuery = `MATCH (u:User)-[:PURCHASED]->(p:Product)\nWHERE u.name CONTAINS '${query.split(' ').pop()}'\nRETURN u.name, p.name, p.price`;
            setCypherQuery(mockQuery);
            setIsLoading(false);
        }, 2000);
    };

    const handleExecuteQuery = (query) => {
        console.log("Executing:", query);
        // Mock execution
    };

    const handleExportQuery = (query) => {
        const blob = new Blob([query], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'cypher-query.cql';
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <Box sx={{ width: '100%', height: 'calc(100vh - 65px)', p: 2, bgcolor: 'background.default', overflow: 'hidden' }}>
            <Grid container spacing = {2} sx = {{ height: '100%' }}>
                <Grid item xs = {12} md = {5} sx = {{ height: '100%' }}>
                    <Stack spacing={2} sx={{ height: '100%', overflowY: 'auto', pr: 1 }}>
                        <EnhancedFineTuningCard />
                        <ModelPerformance />
                        <FineTunedPerformance />
                        <CsvReader csvUrl="https://raw.githubusercontent.com/doctorofdata/datadoctorpublic/main/public/data/prompts.csv"/>
                    </Stack>
                </Grid>
                <Grid item xs = {12} md = {7} sx = {{ height: '100%' }}>
                    <Stack spacing = {2} sx = {{ height: '100%', overflowY: 'auto', pr: 1 }}>
                    <QueryPanel onQuerySubmit = {handleQuerySubmit} isLoading={isLoading} />
                    <BaseCypherOutputPanel
                        cypherQuery = {cypherQuery}
                        onExecute = {handleExecuteQuery}
                        onExport = {handleExportQuery}
                    />
                    <FineTunedCypherOutputPanel
                        cypherQuery = {cypherQuery}
                        onExecute = {handleExecuteQuery}
                        onExport = {handleExportQuery}
                    /></Stack>
                </Grid>
            </Grid>
        </Box>
    );
};

const Text2CypherView = () => (
    <ThemeProvider theme={darkTheme}>
        <DashboardFrame page={<Page />} />
    </ThemeProvider>
);

export default Text2CypherView;