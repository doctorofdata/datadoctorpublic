import React from 'react';
import {
    Box,
    Button,
    Paper,
    Typography,
    CircularProgress,
    Collapse
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AIResponse from './AIResponse';

const AIChat = ({
    onAskAI,
    response,
    loading,
    error,
    expanded,
    setExpanded
}) => (
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
            <Button
                variant="contained"
                onClick={() => {
                    console.log('button clicked..');
                    onAskAI();
                }}
                disabled={loading}
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

        {/* Show Collapse button and response only if there is a response or error */}
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
                        {response && <AIResponse response={response} />}
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

export default AIChat;