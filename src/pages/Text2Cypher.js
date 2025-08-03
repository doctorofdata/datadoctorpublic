import React, { useState, useEffect } from 'react';
import { styled, createTheme, ThemeProvider } from '@mui/material/styles';
import {
    Code as CodeIcon,
    CheckCircle as CheckIcon,
    History as HistoryIcon,
    AutoGraph as AutoGraphIcon,
    BubbleChart as BubbleChartIcon,
    Timeline as TimelineIcon,
    Info as InfoIcon,
    ArrowBack,
    ArrowForward,
    ContentCopy,
    BarChart as BarChartIcon,
    Star as StarIcon,
} from '@mui/icons-material';
import Papa from 'papaparse';
import DashboardFrame from 'components/DashboardFrame';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import {
    Stack,
    Box,
    Paper,
    Typography,
    IconButton,
    Chip,
    Tooltip,
    Button,
    TextField,
    LinearProgress,
    Avatar,
    Grid,
    Alert,
} from '@mui/material';
import {
    Psychology as PsychologyIcon,
    Download as DownloadIcon,
    PlayArrow as PlayIcon,
    Stop as StopIcon,
} from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';

// --- THEME & STYLED COMPONENTS ---

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: { main: '#8c7cf0' },
        secondary: { main: '#03a9f4' },
        background: {
            paper: 'rgba(30, 30, 42, 0.7)',
            default: '#0d1117',
        },
        text: {
            primary: '#e6edf3',
            secondary: '#8b949e',
        },
    },
    typography: {
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"'
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

const ScoreBox = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: `2px solid ${theme.palette.primary.main}`,
    borderRadius: 8,
    padding: theme.spacing(1, 2),
    bgcolor: 'rgba(140,124,240,0.09)',
    marginBottom: theme.spacing(2),
    marginTop: theme.spacing(1),
    fontWeight: 500,
    fontSize: '1rem',
    gap: theme.spacing(1),
    minHeight: 48,
    maxHeight: 48,
    width: '100%',
    boxSizing: 'border-box',
}));

const MetricsWidget = ({ score }) => (
    <ScoreBox>
        <BarChartIcon color="secondary" fontSize="small" />
        <Typography variant="body2" color="text.primary" sx={{ fontWeight: 600, mr: 1, minWidth: 80, textAlign: 'right' }}>
            BLEU score
        </Typography>
        <StarIcon color="primary" fontSize="small" sx={{ ml: 1, mr: 1 }} />
        <Typography variant="body2" color="text.primary" sx={{ fontWeight: 700, minWidth: 40, textAlign: 'left' }}>
            {score !== undefined && score !== '' ? score : '--'}
        </Typography>
    </ScoreBox>
);

const HeroSection = () => (
    <Box
        sx={{
            width: '100vw',
            overflow: 'hidden',
            zIndex: 0,
            background: '#000',
            mt: 8
        }}
    >
        <img
            src="ai8.png"
            alt="Neo4j Cypher Hero"
            style={{
                display: 'block',
                width: '100vw',
                height: 'auto',
                maxHeight: 'none',
                objectFit: 'contain',
            }}
        />
    </Box>
);

const QueryPanel = ({ onQuerySubmit, isLoading }) => {
    const [query, setQuery] = useState('');
    const [history, setHistory] = useState(['Show me all users who made purchases in the last 30 days']);

    const handleSubmit = () => {
        if (query.trim()) {
            onQuerySubmit?.(query);
            if (!history.includes(query)) setHistory(prev => [query, ...prev].slice(0, 5));
        }
    };

    // Add more padding around the TextField for aesthetics and readability
    return (
        <Paper
            elevation={0}
            sx={{
                p: 3,
                borderRadius: 4,
                height: 400,
                maxHeight: 400,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
            }}
        >
            <SectionHeader variant="h6"><PsychologyIcon color="primary" />Text-to-Cypher Model Input</SectionHeader>
            <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
                <Box
                    sx={{
                        flex: 1,
                        minHeight: 0,
                        mb: 2,
                        p: 2.5, // increased padding around the TextField
                        bgcolor: 'rgba(28,32,48,0.22)',
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'stretch',
                        justifyContent: 'center',
                    }}
                >
                    <TextField
                        fullWidth
                        multiline
                        minRows={3}
                        maxRows={8}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Describe the data relationships you want to query..."
                        variant="filled"
                        sx={{
                            '& .MuiFilledInput-root': {
                                borderRadius: 2,
                                padding: '20px 16px', // more internal padding for the textarea
                                background: 'inherit',
                                overflowY: 'auto',
                                maxHeight: 120,
                                fontSize: '1.08rem',
                            },
                            flex: 1,
                            minHeight: 0,
                            // mb removed, handled by parent
                        }}
                        inputProps={{
                            style: {
                                overflowY: 'auto',
                                maxHeight: 120,
                            }
                        }}
                    />
                </Box>
                <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                    <Button
                        variant="contained"
                        onClick={handleSubmit}
                        disabled={!query.trim() || isLoading}
                        startIcon={isLoading ? <StopIcon /> : <PlayIcon />}
                        size="large"
                    >
                        {isLoading ? 'Generating...' : 'Generate Query'}
                    </Button>
                    {isLoading && <LinearProgress color="primary" sx={{ flex: 1, alignSelf: 'center' }} />}
                </Stack>
                <Typography variant="caption" color="text.secondary">Suggestions:</Typography>
                <Stack direction="row" spacing={1} mt={1} useFlexGap flexWrap="wrap" sx={{ overflowX: 'auto' }}>
                    {history.map((h) => <Chip key={h} label={h} variant="outlined" size="small" onClick={() => setQuery(h)} />)}
                </Stack>
            </Box>
        </Paper>
    );
};

const FineTunedCypherOutputPanel = ({ cypherQuery, onExecute, onExport }) => {
    return (
        <StyledPaper elevation={0}>
            <SectionHeader variant="h6">
                <CodeIcon color="secondary" />Fine-Tuned Output
            </SectionHeader>
            <Box
                sx={{
                    background: '#1e1e2e',
                    borderRadius: '8px',
                    padding: '16px',
                    fontSize: '1rem',
                    lineHeight: 1.5,
                    minHeight: 120,
                    color: '#e6edf3',
                    wordBreak: 'break-word',
                    maxHeight: 250,
                    overflowY: 'auto'
                }}
            >
                <ReactMarkdown>
                    {cypherQuery || 'Your generated Cypher query will appear here...'}
                </ReactMarkdown>
            </Box>
            <Stack direction="row" spacing={1} mt={2}>
                <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    disabled={!cypherQuery}
                    onClick={() => onExport?.(cypherQuery)}
                >
                    Export
                </Button>
            </Stack>
        </StyledPaper>
    );
};

// --- INFO CARDS (LEFT) ---

const EnhancedFineTuningCard = () => (
    <Paper elevation={0} sx={{ p: 3, borderRadius: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>Llama3.1 Fine-Tuned</Typography>
                <Typography variant="body2" color="text.secondary">Optimized for Text-to-Cypher Translation</Typography>
            </Box>
            <Chip icon={<CheckIcon />} label="Active" color="success" size="small" />
        </Stack>
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

// --- RIGHT CARDS ---

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

// --- CSV ROW DISPLAY CARDS ---

const ActualOutputCypherCard = ({ output }) => (
    <StyledPaper elevation={0}>
        <SectionHeader variant="h6"><CodeIcon color="secondary" />Cypher Statement</SectionHeader>
        <SyntaxHighlighter language='cypher' style={atomOneDark} customStyle={{
            background: '#1e1e2e',
            borderRadius: '8px',
            padding: '16px',
            fontSize: '1rem',
            lineHeight: 1.5,
        }}>
            {output || 'No actual cypher output.'}
        </SyntaxHighlighter>
    </StyledPaper>
);

const BaseCypherOutputCard = ({ output, score }) => (
    <StyledPaper elevation={0} sx={{ minHeight: 180 }}>
        <SectionHeader variant="h6"><CodeIcon color="secondary" />Base Model Output</SectionHeader>
        <MetricsWidget score={score} />
        <SyntaxHighlighter language='markdown' style={atomOneDark} customStyle={{
            background: '#1e1e2e',
            borderRadius: '8px',
            padding: '16px',
            fontSize: '1rem',
            lineHeight: 1.5,
        }}>
            {output || 'No base model output.'}
        </SyntaxHighlighter>
    </StyledPaper>
);

const FineTunedCypherOutputCard = ({ output, score }) => (
    <StyledPaper elevation={0} sx={{ minHeight: 180 }}>
        <SectionHeader variant="h6"><CodeIcon color="secondary" />Fine-Tuned Model Output</SectionHeader>
        <MetricsWidget score={score} />
        <SyntaxHighlighter language='markdown' style={atomOneDark} customStyle={{
            background: '#1e1e2e',
            borderRadius: '8px',
            padding: '16px',
            fontSize: '1rem',
            lineHeight: 1.5,
        }}>
            {output || 'No fine-tuned model output.'}
        </SyntaxHighlighter>
    </StyledPaper>
);

const CsvRowCycler = ({ rows, currentIndex, setCurrentIndex }) => {
    const currentRow = rows && rows.length > 0 && rows[currentIndex] ? rows[currentIndex] : {};
    const hasPrompt = currentRow && (currentRow.prompt || currentRow.Prompt);

    return (
        <Stack direction="row" alignItems="center" justifyContent="flex-end" spacing={2}>
            <IconButton
                onClick={() => setCurrentIndex(i => Math.max(i - 1, 0))}
                disabled={currentIndex === 0 || rows.length === 0}
                aria-label="Previous example"
            >
                <ArrowBack />
            </IconButton>
            <Typography variant="caption">Example {rows.length > 0 ? currentIndex + 1 : 0} / {rows.length}</Typography>
            <IconButton
                onClick={() => setCurrentIndex(i => Math.min(i + 1, rows.length - 1))}
                disabled={rows.length === 0 || currentIndex >= rows.length - 1}
                aria-label="Next example"
            >
                <ArrowForward />
            </IconButton>
            <Tooltip title="Copy prompt">
                <span>
                    <IconButton
                        aria-label="Copy prompt"
                        size="small"
                        onClick={() => {
                            if (hasPrompt) navigator.clipboard.writeText(hasPrompt);
                        }}
                        disabled={!hasPrompt}
                    >
                        <ContentCopy fontSize="small" />
                    </IconButton>
                </span>
            </Tooltip>
        </Stack>
    );
};

const PromptCard = ({ prompt, rows, currentIndex, setCurrentIndex }) => (
    <Paper
        elevation={0}
        sx={{
            p: 3,
            borderRadius: 16,
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            minHeight: 0,
            height: 260,
            maxHeight: 260,
        }}
    >
        {/* Header and cycler beside each other */}
        <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 2
        }}>
            <SectionHeader variant="h6" sx={{ mb: 0, mr: 2, flexShrink: 0 }}>
                <InfoIcon color="secondary" />Prompt
            </SectionHeader>
            <Box sx={{ flexGrow: 0 }}>
                <CsvRowCycler rows={rows} currentIndex={currentIndex} setCurrentIndex={setCurrentIndex} />
            </Box>
        </Box>
        <Box
            sx={{
                flex: 1,
                overflowY: 'auto',
                background: '#1e1e2e',
                borderRadius: 8,
                p: 2,
                fontSize: '1rem',
                minHeight: 0,
                height: '100%',
            }}
        >
            <SyntaxHighlighter
                language="markdown"
                style={atomOneDark}
                customStyle={{
                    background: 'transparent',
                    padding: 0,
                    margin: 0,
                    fontSize: '1rem',
                    lineHeight: 1.5,
                    minHeight: 0,
                }}
            >
                {prompt || 'No prompt.'}
            </SyntaxHighlighter>
        </Box>
    </Paper>
);

const CSV_URL = "https://raw.githubusercontent.com/doctorofdata/datadoctorpublic/main/public/data/scoredmodelresults.csv";
const API_URL = "https://xb48gamgjg.execute-api.us-east-1.amazonaws.com/prod/v1/fine-tuned-model";

const Page = () => {
    const [rows, setRows] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [cypherQuery, setCypherQuery] = useState('');
    const [executionResult, setExecutionResult] = useState(null);
    const [error, setError] = useState('');

    // CSV loader state
    const [csvLoading, setCsvLoading] = useState(false);
    const [csvError, setCsvError] = useState('');

    useEffect(() => {
        setCsvLoading(true);
        setCsvError('');
        fetch(CSV_URL)
            .then(res => res.text())
            .then(csvText => {
                const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true });
                const filtered = parsed.data.filter(r => r.prompt || r.Prompt);
                setRows(filtered);
                setCurrentIndex(0);
                setCsvLoading(false);
            })
            .catch(e => {
                setCsvError(e.message || "Failed to load CSV");
                setCsvLoading(false);
            });
    }, []);

    // Get current row values
    const row = rows && rows.length > 0 && rows[currentIndex] ? rows[currentIndex] : {};
    const prompt = row.prompt || row.Prompt || '';
    const baseOutput = row.base_model_response || row.llama_output || row.base || row.BaseOutput || '';
    const actualCypher = row.cypher || row.actual_cypher || row.reference_cypher || '';
    const fineOutput = row.finetuned_response || row.fine_tuned_output || row.finetuned || row.FineTunedOutput || '';
    const baseScore = row.sentence_bleu_score || row.base_score || row.llama_score || row.BaseScore || '';
    const fineScore = row.finetuned_sentence_bleu_score || row.fine_tuned_score || row.FineTunedScore || row.finetuned_model_score || '';

    // --- API call ---
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
            const lambdaResponse = await response.json();
            let data;
            if (typeof lambdaResponse.body === "string") {
                try {
                    data = JSON.parse(lambdaResponse.body);
                } catch {
                    data = { error: "Malformed backend response" };
                }
            } else {
                data = lambdaResponse;
            }
            if (response.ok && !data.error) {
                setCypherQuery(data.result);
            } else {
                setError(data.error || "Unknown error");
            }
        } catch (err) {
            setError(err.message || "Network error");
        }
        setIsLoading(false);
    };

    // Export handler for cypher query
    const handleExportQuery = (query) => {
        if (!query) return;
        const blob = new Blob([query], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'cypher_query.txt';
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    };

    const handleExecuteQuery = (query) => {
        console.log("Executing:", query);
        // Mock execution
    };

    return (
        <Box sx={{
            width: '100%',
            minHeight: '100vh',
            bgcolor: 'background.default',
            overflow: 'hidden',
            p: 0,
            display: 'flex',
            flexDirection: 'column'
        }}>
            <Box sx={{ width: '100%', flex: '1 0 auto', p: { xs: 2, md: 2 } }}>
                {/* Main upper content */}
                <Grid container spacing={2} sx={{ height: '100%', alignItems: 'stretch' }}>
                    {/* LEFT COLUMN: Model and Neo4j info */}
                    <Grid item xs={12} md={6} sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                        <Stack spacing={2} sx={{ flex: 1, minHeight: 0 }}>
                            <EnhancedFineTuningCard />
                            <Neo4jCypherInfoCard />
                        </Stack>
                    </Grid>
                    {/* RIGHT COLUMN: Prompt Navigator and Quickstart */}
                    <Grid item xs={12} md={6} sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                        <Stack spacing={2} sx={{ flex: 1, minHeight: 0 }}>
                            <PromptNavigatorInfoCard />
                            <CypherSyntaxQuickstartCard />
                        </Stack>
                    </Grid>
                </Grid>
                {/* PROMPT CARD - underneath both columns */}
                <Box sx={{ mt: 2 }}>
                    <PromptCard
                        prompt={prompt}
                        rows={rows}
                        currentIndex={currentIndex}
                        setCurrentIndex={setCurrentIndex}
                    />
                    {csvLoading && <LinearProgress sx={{ mt: 2 }} />}
                    {csvError && <Alert severity="error" sx={{ mt: 2 }}>{csvError}</Alert>}
                </Box>
                {/* Cypher statement spanning both columns */}
                <Box sx={{ mt: 2 }}>
                    <ActualOutputCypherCard output={actualCypher} />
                </Box>
                {/* Base and Fine-tuned outputs underneath, separate columns */}
                <Grid container spacing={2} sx={{ mt: 0 }}>
                    <Grid item xs={12} md={6}>
                        <BaseCypherOutputCard output={baseOutput} score={baseScore} />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <FineTunedCypherOutputCard output={fineOutput} score={fineScore} />
                    </Grid>
                </Grid>
                {/* --- Move Text-to-Cypher Model Input and Fine-Tuned Output (API) to bottom --- */}
                <Grid container spacing={2} sx={{ mt: 2 }}>
                    <Grid item xs={12} md={6}>
                        <QueryPanel onQuerySubmit={handleQuerySubmit} isLoading={isLoading} />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <FineTunedCypherOutputPanel
                            cypherQuery={cypherQuery}
                            onExecute={handleExecuteQuery}
                            // onExport={handleExportQuery} // export button removed as requested earlier
                        />
                    </Grid>
                </Grid>
            </Box>
            <HeroSection />
        </Box>
    );
};


const Text2CypherView = () => (
    <ThemeProvider theme={darkTheme}>
        <DashboardFrame page={<Page />} />
    </ThemeProvider>
);

export default Text2CypherView;