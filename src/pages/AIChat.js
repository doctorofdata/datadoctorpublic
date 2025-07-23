import React, { useState } from 'react';
import {
    Box,
    Button,
    Paper,
    Typography,
    CircularProgress,
    Collapse,
    TextField
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ReactMarkdown from 'react-markdown';

const AIChat = () => {
    
    const [prompt, setPrompt] = useState('');
    const [response, setResponse] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [expanded, setExpanded] = useState(true);

    const onAskAI = async () => {
        setLoading(true);
        setError('');
        setResponse('');
        try {
            const res = await fetch('https://xb48gamgjg.execute-api.us-east-1.amazonaws.com/prod/v1/ai-chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ prompt })
            });
            const data = await res.json();
            // Debug: log raw and formatted response
            console.log('API raw response:', data.response);
            // Format plain text response as markdown before rendering
            if (data.status === 'success') {
                setResponse(data.response);
            } else {
                setError(data.response || 'Unknown error');
            }
        } catch (err) {
            setError('Failed to connect to AI service.');
        } finally {
            setLoading(false);
            setExpanded(true);
        }
    };

    return (
        <Box sx={{ width: '100%' }}>
            <Paper sx={{
                p: 3,
                mb: 3,
                bgcolor: 'background.paper',
                border: 1,
                borderColor: 'divider',
                boxShadow: 'none',
                borderRadius: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
            }}>
                <Typography
                    variant="h6"
                    gutterBottom
                    sx={{
                        fontWeight: 600,
                        color: 'text.primary',
                        mb: 2
                    }}
                >
                    Portfolio Insights w/ Gemini
                </Typography>
                <TextField
                    label="Ask the AI about your portfolio"
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                    fullWidth
                    sx={{ mb: 2 }}
                    disabled={loading}
                />
                <Button
                    variant="contained"
                    onClick={onAskAI}
                    disabled={loading || !prompt}
                    endIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                    sx={{
                        textTransform: 'none',
                        fontWeight: 600,
                        minWidth: 180
                    }}
                >
                    {loading ? 'Thinking...' : 'Ask AI'}
                </Button>
            </Paper>

            {(response || error) && (
                <Box sx={{ width: '100%', mb: 2 }}>
                    <Collapse in={expanded}>
                        <Box>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
                                <Button
                                    onClick={() => setExpanded(false)}
                                    size="small"
                                    variant="outlined"
                                    startIcon={<ExpandLessIcon />}
                                    sx={{
                                        textTransform: 'none',
                                        fontWeight: 500
                                    }}
                                >
                                    Hide Response
                                </Button>
                            </Box>
                            {error && (
                                <Paper sx={{
                                    p: 2,
                                    mb: 3,
                                    bgcolor: '#ffdce0',
                                    border: 1,
                                    borderColor: '#cb2431',
                                    boxShadow: 'none',
                                    borderRadius: 1
                                }}>
                                    <Typography color="error">{error}</Typography>
                                </Paper>
                            )}
                            <Paper sx={{
                                p: 2,
                                mb: 3,
                                bgcolor: 'background.paper',
                                border: 1,
                                borderColor: 'divider',
                                boxShadow: 'none',
                                borderRadius: 1
                            }}>
                                <ReactMarkdown>
                                    {response}
                                </ReactMarkdown>
                            </Paper>
                        </Box>
                    </Collapse>
                    {!expanded && (
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <Button
                                onClick={() => setExpanded(true)}
                                size="small"
                                variant="outlined"
                                startIcon={<ExpandMoreIcon />}
                                sx={{
                                    textTransform: 'none',
                                    fontWeight: 500
                                }}
                            >
                                Show Response
                            </Button>
                        </Box>
                    )}
                </Box>
            )}
        </Box>
    );
};

export default AIChat;