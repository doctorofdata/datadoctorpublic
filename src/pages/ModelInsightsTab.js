import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Button,
  CircularProgress,
  TextField,
  Divider,
  Avatar
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import NewsWidget from './NewsWidget';
import AIResponse from './AIResponse';
import { GiRobotGolem } from "react-icons/gi";
import PersonIcon from '@mui/icons-material/Person';
import ReactMarkdown from 'react-markdown'; // <-- ADD THIS IMPORT

const API_URL = "https://xb48gamgjg.execute-api.us-east-1.amazonaws.com/prod/v1/ai-chat";

const TAB = {
  INSIGHTS: 0,
  PROMPT: 1,
  NEWS: 2,
  CHAT: 3
};

// Utility: convert plain text to markdown (paragraphs, lists, etc.)
function formatAsMarkdown(text) {
    if (!text) return "";
    return text; // use plain markdown, or customize for code blocks/lists
}

const ModelInsightsTabs = ({
  onAskAI,
  response,
  loading,
  error,
  expanded,
  setExpanded,
  prompt,
  tickers,
  onNewsFetched
}) => {
  const [tab, setTab] = useState(TAB.INSIGHTS);

  // --- AI Chat tab state ---
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatError, setChatError] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Direct API call from inside the component
  const handleSendChatMessage = async () => {
    const trimmedInput = chatInput.trim();
    if (!trimmedInput) return;

    setChatMessages(prev => [...prev, { role: 'user', content: trimmedInput }]);
    setChatLoading(true);
    setChatError('');

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: trimmedInput, contextArticles: [] })
      });
      if (!response.ok) throw new Error(`Failed to send message: ${response.status}`);
      const data = await response.json();

      // Handle stringified or object body
      let parsed = data;
      if (typeof data.body === 'string') {
        try {
          parsed = JSON.parse(data.body);
        } catch (e) {
          parsed = { status: "error", message: "Failed to parse response body" };
        }
      } else if (typeof data.body === 'object') {
        parsed = data.body;
      }

      if (parsed.status === 'success') {
        setChatMessages(prev => [
          ...prev,
          { role: 'assistant', content: parsed.response }
        ]);
      } else {
        setChatMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: parsed.message || "AI call failed",
            error: true
          }
        ]);
      }
    } catch (error) {
      setChatMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'Failed to get AI response. Please try again.',
          error: true
        }
      ]);
      setChatError(error.message || 'Network error');
    } finally {
      setChatLoading(false);
      setChatInput('');
    }
  };

  return (
    <Box sx={{ width: '100%', my: 2 }}>
      <Paper sx={{
        p: 0,
        bgcolor: 'background.paper',
        border: 1,
        borderColor: 'divider',
        boxShadow: 'none',
        borderRadius: 1,
      }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}
        >
          <Tab label="Portfolio Insights w/ Gemini" />
          <Tab label="Model Input Preview" disabled={!prompt || !prompt.trim()} />
          <Tab label="News & Media" />
          <Tab label="AI Chat" />
        </Tabs>
        {/* Portfolio Insights Tab */}
        {tab === TAB.INSIGHTS && (
          <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
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
              onClick={onAskAI}
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
            {(response || error) && (
              <Box sx={{ width: '100%', mt: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
                  <Button
                    onClick={() => setExpanded(!expanded)}
                    size="small"
                    variant="outlined"
                    sx={{
                      textTransform: 'none',
                      fontWeight: 500
                    }}
                  >
                    {expanded ? "Hide Response" : "Show Response"}
                  </Button>
                </Box>
                {expanded && (
                  <>
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
                  </>
                )}
              </Box>
            )}
          </Box>
        )}

        {/* Model Input Preview Tab */}
        {tab === TAB.PROMPT && prompt && prompt.trim() && (
          <Box sx={{ p: 3 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Model Input Preview
            </Typography>
            <Typography
              variant="body2"
              component="pre"
              sx={{
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                fontFamily: 'monospace',
                color: 'text.primary',
                bgcolor: 'background.default',
                p: 2,
                borderRadius: 1,
              }}
            >
              {prompt}
            </Typography>
          </Box>
        )}

        {/* News Tab */}
        {tab === TAB.NEWS && (
          <Box sx={{ p: 3 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              News Media
            </Typography>
            <NewsWidget tickers={tickers} onNewsFetched={onNewsFetched} />
          </Box>
        )}

        {/* AI Chat Tab */}
        {tab === TAB.CHAT && (
          <Box sx={{ p: 3, width: '100%', height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Financial Chat
            </Typography>
            <Box sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              minHeight: 350,
              bgcolor: 'background.default',
              borderRadius: 0,
              p: 2,
              border: 0,
              width: '100%',
              height: '100%'
            }}>
              {/* Chat history */}
              <Box sx={{ flex: 1, overflowY: 'auto', mb: 1, width: '100%' }}>
                {chatMessages.length === 0 && (
                  <Typography color="text.secondary" sx={{ textAlign: 'center', mt: 6 }}>
                    Start the conversation by typing your question below.
                  </Typography>
                )}
                {chatMessages.map((msg, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      mb: 2,
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'flex-start',
                      gap: 1
                    }}
                  >
                    <Avatar sx={{
                      bgcolor: msg.role === 'user' ? 'primary.main' : 'secondary.main',
                      width: 32, height: 32, mt: 0.5
                    }}>
                      {msg.role === 'user'
                        ? <PersonIcon />
                        : <GiRobotGolem style={{
                            color: 'var(--mui-palette-primary-main)',
                            width: 28,
                            height: 28
                          }} />
                      }
                    </Avatar>
                    <Paper sx={{
                      p: 2,
                      bgcolor: msg.role === 'user'
                        ? 'primary.main'
                        : msg.error
                          ? '#ffdce0'
                          : 'background.paper',
                      color: msg.role === 'user'
                        ? 'primary.contrastText'
                        : msg.error
                          ? '#cb2431'
                          : 'text.primary',
                      borderRadius: 2,
                      mb: 0.5,
                      boxShadow: 'none',
                      fontSize: '1em',
                      minWidth: 60,
                      flex: 1
                    }}>
                      {/* 
                        --- CHANGE BELOW ---
                        Render markdown for assistant responses
                      */}
                      {msg.role === 'assistant' && !msg.error ? (
                        <ReactMarkdown>
                          {formatAsMarkdown(msg.content)}
                        </ReactMarkdown>
                      ) : (
                        <Typography variant="body2" sx={{ wordBreak: 'break-word', mb: 0 }}>
                          {msg.content}
                        </Typography>
                      )}
                    </Paper>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        textAlign: 'left',
                        display: 'block',
                        fontStyle: 'italic',
                        ml: 1,
                        mt: 2
                      }}
                    >
                      {msg.role === 'user' ? 'You' : 'AI'}
                    </Typography>
                  </Box>
                ))}
                <div ref={chatEndRef} />
              </Box>
              <Divider sx={{ my: 1 }} />
              {/* Chat input and send button */}
              <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
                <TextField
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  placeholder="Type your question here"
                  variant="outlined"
                  size="small"
                  fullWidth
                  disabled={chatLoading}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !chatLoading) handleSendChatMessage();
                  }}
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSendChatMessage}
                  disabled={chatLoading || !chatInput.trim()}
                  endIcon={chatLoading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                  sx={{ minWidth: 90, fontWeight: 600 }}
                >
                  {chatLoading ? 'Sending...' : 'Send'}
                </Button>
              </Box>
              {chatError && (
                <Typography color="error" sx={{ mt: 1 }}>
                  {chatError}
                </Typography>
              )}
            </Box>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default ModelInsightsTabs;