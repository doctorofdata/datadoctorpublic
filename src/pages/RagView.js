import React, { useState } from 'react';
import {
    Stack,
    Box,
    Paper,
    Typography,
    Button,
    Card,
    CardActions,
    CardContent,
    CardMedia,
    Grid,
    Link,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from '@mui/material';
import { styled, createTheme, ThemeProvider } from '@mui/material/styles';
import {
    Chat as ChatIcon,
    Storage as StorageIcon,
    AutoAwesome as AutoAwesomeIcon,
} from '@mui/icons-material';
import DashboardFrame from 'components/DashboardFrame';
import Chat from './ChatView/Chat';
import { ENDPOINTS } from '../config/api-config';

// --- API FUNCTIONS ---

export const fetchNews = async (query) => {

  try {
    
    const response = await fetch(ENDPOINTS.FETCH_NEWS, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({ query })
    });
    if (!response.ok) throw new Error(`Failed to fetch news: ${response.status}`);
    const data = await response.json();
    return data;
  } catch (error) {
    return { status: 'error', articles: [], message: error.message };
  }
};

export const sendMessage = async (message, articles = []) => {

  // Format prompt exactly as in PromptFormatting.js
  let prompt = message;
  if (articles && articles.length > 0) {
    prompt = `ARTICLES:\n\n${articles.join('\n\n---\n\n')}\n\n---\n\n${message}`;
  }
  // Print the prompt to the console
  console.log("[sendMessage] Final prompt sent to Gemini:", prompt);

  const response = await fetch(ENDPOINTS.SEND_MESSAGE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt })
  });

  if (!response.ok) throw new Error(`Failed to send message: ${response.status}`);
  const data = await response.json();
  return data.body
    ? typeof data.body === 'string'
      ? JSON.parse(data.body)
      : data.body
    : data;
};

export const rerankEmbed = async (query, documents) => {
  try {
    const response = await fetch(ENDPOINTS.RERANK_EMBED, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, documents })
    });
    if (!response.ok) throw new Error(`Failed to rerank/embed: ${response.status}`);
    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
};

export const crossEncode = async (query, texts) => {
  try {
    const response = await fetch(ENDPOINTS.CROSS_ENCODE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, texts })
    });
    if (!response.ok) throw new Error(`Failed to cross-encode: ${response.status}`);
    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
};

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
        MuiCard: {
            styleOverrides: {
                root: {
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    backgroundImage: 'none',
                },
            },
        },
    },
});

const SectionHeader = styled(Typography)(({ theme }) => ({
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
    color: theme.palette.text.primary,
    marginBottom: theme.spacing(1),
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(1),
    borderRadius: 5,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
}));

const StyledCard = styled(Card)(({ theme }) => ({
    borderRadius: 5,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: theme.palette.background.paper,
}));

// --- CONTEXT TABLE COMPONENT ---

const ContextTable = ({ articles }) => {
  if (!articles || articles.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ m: 2 }}>
        No context available for this query.
      </Typography>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <TableContainer component={Paper} elevation={0}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Excerpt</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {articles.map((art, idx) => (
              <TableRow key={idx}>
                <TableCell>{art.publishedDate || art.date || ''}</TableCell>
                <TableCell>
                  {art.text
                    ? art.text.slice(0, 120) + (art.text.length > 120 ? '...' : '')
                    : art.snippet
                    ? art.snippet.slice(0, 120) + (art.snippet.length > 120 ? '...' : '')
                    : ''}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

// --- UI COMPONENTS ---

const RagCard = () => (
  <StyledCard>
    <CardMedia
      component="img"
      sx={{
        width: '100%',
        height: 'auto',
        objectFit: 'contain',
      }}
      image="/rag.png"
      title="rag"
    />
    <CardContent sx={{ flex: 1 }}>
      <Typography gutterBottom variant="h6" component="div" sx={{ fontWeight: 600, color: 'text.primary' }}>
        Retrieval-Augmented Generation (RAG)
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
        A process for optimizing the output of a large language model.
        It functions by allowing the model to reference an authoritative knowledge base outside of its original training data sources before generating a response.
        RAG extends the already powerful capabilities of LLMs to specific domains or an organization's internal knowledge base, all without the need to retrain the model.
      </Typography>
    </CardContent>
    <CardActions sx={{ p: 2 }}>
      <Button 
        size="small" 
        variant="outlined" 
        startIcon={<AutoAwesomeIcon />}
        sx={{ borderRadius: 2 }}
      >
      </Button>
    </CardActions>
  </StyledCard>
);

const ReRankingCard = () => (
  <StyledCard>
    <CardMedia
      component="img"
      sx={{
        width: '100%',
        height: 'auto',
        objectFit: 'contain',
      }}
      image="/ragflow.jpg"
      title="rag flow"
    />
    <CardContent sx={{ flex: 1 }}>
      <Typography gutterBottom variant="h6" component="div" sx={{ fontWeight: 600, color: 'text.primary' }}>
        Semantic ReRanking to Improve Context
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6, mb: 2 }}>
        The way reranker models operate in general is that they calculate a relevance score for each document-query pair returned from a broader search.
        Cross Encoder Models boost reranking by using a classification system to evaluate pairs of data—like sentences or documents; yielding a similarity score from 0 to 1, showing how closely the document matches the query. 
        This technique allows us to improve the relevance of added context when prompting.
      </Typography>
    </CardContent>
    <CardMedia
      component="img"
      sx={{
        width: '100%',
        height: 'auto',
        objectFit: 'contain',
      }}
      image="/reranking.png"
      title="reranking"
    />
  </StyledCard>
);

const ChatPanel = ({ setContextArticles }) => (
  <StyledPaper elevation={0}>
    <SectionHeader variant="h6">
      <ChatIcon color="primary" />
      New York Times Current Events Chat w/ Google Gemini
    </SectionHeader>
    <Box sx={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
      <Chat
        fetchNews={fetchNews}
        sendMessage={sendMessage}
        rerankEmbed={rerankEmbed}
        crossEncode={crossEncode}
        setContextArticles={setContextArticles}
      />
    </Box>
  </StyledPaper>
);

const ContextPanel = ({ articles }) => (
  <StyledPaper elevation={0}>
    <SectionHeader variant="h6">
      <StorageIcon color="secondary" />
      Context
    </SectionHeader>
    <ContextTable articles={articles} />
  </StyledPaper>
);

// --- MAIN PAGE ---

const Page = () => {
  const [contextArticles, setContextArticles] = useState([]);

  return (
    <Box sx={{ width: '100%', height: '100%', p: 2, bgcolor: 'background.default', overflow: 'hidden' }}>
      <Grid container spacing={2} sx={{ height: '100%' }}>
        <Grid item xs={12} md={4} sx={{ height: '100%' }}>
          <Stack spacing={2} sx={{ height: '100%', overflowY: 'auto', pr: 1 }}>
            <RagCard />
            <ReRankingCard />
          </Stack>
        </Grid>
        <Grid item xs={12} md={8} sx={{ height: '100%' }}>
          <Stack spacing={2} sx={{ height: '100%', overflowY: 'auto', pr: 1 }}>
            <ChatPanel setContextArticles={setContextArticles} />
            <ContextPanel articles={contextArticles} />
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};

const RagView = () => (
  <ThemeProvider theme={darkTheme}>
    <DashboardFrame
      header={'RAG Model w/ NYT'}
      page={<Page />}
    />
  </ThemeProvider>
);

export default RagView;