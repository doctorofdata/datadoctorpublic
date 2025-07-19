import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Button,
  CircularProgress
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AIResponse from './AIResponse';
import NewsWidget from './NewsWidget';

const TAB = {
  INSIGHTS: 0,
  RESPONSE: 1,
  PROMPT: 2,
  NEWS: 3
};

/**
 * Props:
 *  - onAskAI: function
 *  - response: string
 *  - loading: boolean
 *  - error: string
 *  - expanded: boolean
 *  - setExpanded: function
 *  - prompt: string
 *  - tickers: array of current tickers
 *  - onNewsFetched: function
 */
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
  // If response or error exists, default to MODEL RESPONSE, else default to Insights tab
  const initialTab = response || error ? TAB.RESPONSE : TAB.INSIGHTS;
  const [tab, setTab] = useState(initialTab);

  // If props change, ensure tab updates only if the response/error has just arrived
  React.useEffect(() => {
    if ((response || error) && tab === TAB.INSIGHTS) {
      setTab(TAB.RESPONSE);
    }
    if (!response && !error && tab === TAB.RESPONSE) {
      setTab(TAB.INSIGHTS);
    }
  // eslint-disable-next-line
  }, [response, error]);

  return (
    <Box sx={{ width: '100%', my: 2 }}>
      <Paper
        sx={{
          p: 0,
          bgcolor: 'background.paper',
          border: 1,
          borderColor: 'divider',
          boxShadow: 'none',
          borderRadius: 1,
        }}
      >
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}
        >
          <Tab label="Portfolio Insights w/ Gemini" />
          <Tab label="Model Response" disabled={!response && !error} />
          <Tab label="Model Input Preview" disabled={!prompt || !prompt.trim()} />
          <Tab label="News & Media" />
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
          </Box>
        )}

        {/* Model Response Tab */}
        {tab === TAB.RESPONSE && (response || error) && (
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
              <Button
                onClick={() => setExpanded(!expanded)}
                size="small"
                variant="outlined"
                startIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
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
      </Paper>
    </Box>
  );
};

export default ModelInsightsTabs;