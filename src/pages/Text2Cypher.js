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
    CardContent,
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
    Info as InfoIcon,
    AutoGraph as AutoGraphIcon,
    BubbleChart as BubbleChartIcon,
    Timeline as TimelineIcon,
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
        {/* --- New: Colab Notebook Widget --- */}
        <Box sx={{ mt: 2 }}>
            <Button
                variant="outlined"
                color="secondary"
                startIcon={
                    <img
                        src="https://colab.research.google.com/assets/colab-badge.svg"
                        alt="Open in Colab"
                        style={{ height: 20 }}
                    />
                }
                href="https://colab.research.google.com/drive/1QeHxsbNnHnTWNDCSz7iphUORB--FBeAA?usp=sharing"
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                    textTransform: 'none',
                    fontWeight: 500,
                    borderRadius: 3,
                    px: 2,
                    py: 1,
                    mt: 1,
                    bgcolor: 'rgba(140,124,240,0.08)',
                }}
            >
                (Requires High-RAM GPU)
            </Button>
        </Box>
    </Paper>
);

// --- NEW: Neo4j & Cypher Info Card ---

const Neo4jCypherInfoCard = () => (
    <Paper elevation={0} sx={{ p: 3, borderRadius: 4, bgcolor: 'rgba(44, 80, 141, 0.25)' }}>
        <Stack spacing={2}>
            <SectionHeader variant="h6">
                <AutoGraphIcon color="primary" fontSize="large" />
                What is Neo4j and Cypher?
            </SectionHeader>
            <Typography variant="body1" color="text.primary">
                <b>Neo4j</b> is a highly popular graph database that uses a property graph model to represent and store data. It’s designed for efficiently querying complex connected data, such as social networks, recommendations, or fraud detection.
            </Typography>
            <Typography variant="body1" color="text.primary">
                <b>Cypher</b> is Neo4j’s expressive query language—similar to SQL, but designed for graphs! Cypher makes it easy to describe patterns like relationships between nodes, traversals, and data aggregation.
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center" justifyContent="center" mt={2}>
                <Avatar sx={{
                    width: 56, height: 56, bgcolor: '#2a6bd4', boxShadow: '0 0 0 3px #8c7cf0', marginRight: 2,
                }}>
                    <BubbleChartIcon fontSize="large" />
                </Avatar>
                <Avatar sx={{
                    width: 56, height: 56, bgcolor: '#8c7cf0', boxShadow: '0 0 0 3px #2a6bd4', marginLeft: 2,
                }}>
                    <TimelineIcon fontSize="large" />
                </Avatar>
            </Stack>
        </Stack>
    </Paper>
);

const CypherSyntaxQuickstartCard = () => (
    <Paper elevation={0} sx={{ p: 3, borderRadius: 4, bgcolor: 'rgba(140,124,240,0.12)' }}>
        <Stack spacing={2}>
            <SectionHeader variant="h6">
                <InfoIcon color="secondary" fontSize="large" />
                Cypher Syntax Quickstart
            </SectionHeader>
            <Typography variant="body2" color="text.primary">
                Cypher queries use patterns to match nodes and relationships:
            </Typography>
            <SyntaxHighlighter language="cypher" style={atomOneDark} customStyle={{
                background: '#22223b', borderRadius: '8px', padding: '12px', fontSize: '0.92rem'
            }}>
                {`// Find friends of Alice
MATCH (a:Person {name: "Alice"})-[:FRIENDS_WITH]->(friend)
RETURN friend.name
                `}
            </SyntaxHighlighter>
            <Typography variant="body2" color="text.primary">
                <b>Nodes</b> are in parentheses <code>(a:Label)</code>, relationships in brackets <code>-[r:TYPE]-></code>.
            </Typography>
            <Typography variant="body2" color="text.primary">
                <b>Aggregate Example:</b>
            </Typography>
            <SyntaxHighlighter language="cypher" style={atomOneDark} customStyle={{
                background: '#22223b', borderRadius: '8px', padding: '12px', fontSize: '0.92rem'
            }}>
                {`// Count purchases per user
MATCH (u:User)-[:PURCHASED]->(p:Product)
RETURN u.name, count(p) AS purchaseCount
                `}
            </SyntaxHighlighter>
        </Stack>
    </Paper>
);

// --- NEW: Prompt Navigator Info Card ---

const PromptNavigatorInfoCard = () => (
    <Paper elevation={0} sx={{ p: 3, borderRadius: 4, bgcolor: 'rgba(3, 169, 244, 0.08)' }}>
        <Stack spacing={2}>
            <SectionHeader variant="h6">
                <HistoryIcon color="secondary" fontSize="large" />
                Prompt Navigator Guide
            </SectionHeader>
            <Typography variant="body1" color="text.primary">
                The <b>Prompt Navigator</b> showcases <b>out-of-sample</b> context from the fine-tuning data used for training. Browse these examples to:
                <ul style={{ marginTop: 8, marginBottom: 8, marginLeft: 24 }}>
                    <li>Get a feel for Cypher syntax and how Neo4j queries are structured</li>
                    <li>Quickly copy a sample prompt to use for model demonstration</li>
                    <li>Experiment by providing your own prompt in the text area</li>
                </ul>
                You can copy any provided example directly to the prompt input, or write your own for custom model results!
            </Typography>
        </Stack>
    </Paper>
);

// --- MAIN PAGE ---

const API_URL = "https://xb48gamgjg.execute-api.us-east-1.amazonaws.com/prod/v1/fine-tuned-model";

const Page = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [cypherQuery, setCypherQuery] = useState('');
    const [executionResult, setExecutionResult] = useState(null);
    const [error, setError] = useState('');

    // --- UPDATED: Real API call ---
    const handleQuerySubmit = async (query) => {
        setIsLoading(true);
        setCypherQuery('');
        setError('');
        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt: query }),
            });
            const data = await response.json();
            if (response.ok) {
                setCypherQuery(data.result); // show result from lambda
            } else {
                setError(data.error || "Unknown error");
            }
        } catch (err) {
            setError(err.message || "Network error");
        }
        setIsLoading(false);
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
            <Grid container spacing={2} sx={{ height: '100%' }}>
                <Grid item xs={12} md={5} sx={{ height: '100%' }}>
                    <Stack spacing={2} sx={{ height: '100%', overflowY: 'auto', pr: 1 }}>
                        <EnhancedFineTuningCard />
                        <Neo4jCypherInfoCard />
                        <CypherSyntaxQuickstartCard />
                        <PromptNavigatorInfoCard />
                        <CsvReader csvUrl="https://raw.githubusercontent.com/doctorofdata/datadoctorpublic/main/public/data/prompts.csv"/>
                    </Stack>
                </Grid>
                <Grid item xs={12} md={7} sx={{ height: '100%' }}>
                    <Stack spacing={2} sx={{ height: '100%', overflowY: 'auto', pr: 1 }}>
                        <QueryPanel onQuerySubmit={handleQuerySubmit} isLoading={isLoading} />
                        <BaseCypherOutputPanel
                            cypherQuery={cypherQuery}
                            onExecute={handleExecuteQuery}
                            onExport={handleExportQuery}
                        />
                        <FineTunedCypherOutputPanel
                            cypherQuery={cypherQuery}
                            onExecute={handleExecuteQuery}
                            onExport={handleExportQuery}
                        />
                        {error && (
                            <Alert severity="error" sx={{ mt: 2 }}>
                                {error}
                            </Alert>
                        )}
                    </Stack>
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