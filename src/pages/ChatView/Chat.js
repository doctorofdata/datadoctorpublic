import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  CircularProgress,
  Avatar,
  List,
  ListItem,
  Divider
} from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';
import { BsPersonWorkspace, BsRobot } from "react-icons/bs";

// Helper to only use the text field for context
function articleToContextString(article) {
  const text = article.text && article.text.trim();
  let parts = [];
  if (text) parts.push(`TEXT: ${text}`);
  if (article.snippet) parts.push(`SNIPPET: ${article.snippet}`);
  if (article.publishedDate || article.date) parts.push(`DATE: ${article.publishedDate || article.date}`);
  if (article.url) parts.push(`URL: ${article.url}`);
  return parts.join('\n');
}

const Chat = ({ fetchNews, sendMessage, rerankEmbed, crossEncode, setContextArticles }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      // 1. Fetch news articles
      const newsResult = await fetchNews(userMessage);

      let articlesForTable = [];
      let articlesForPrompt = [];

      // LOG: Number of articles returned from news API
      console.log("newsResult.articles.length:", newsResult.articles.length, newsResult.articles);

      if (newsResult.status === 'success' && Array.isArray(newsResult.articles) && newsResult.articles.length > 0) {
        // Prepare articles: only keep those with at least text/snippet/title
        const filteredArticles = newsResult.articles.filter(
          a =>
            (a.text && a.text.trim()) ||
            (a.title && a.title.trim()) ||
            (a.snippet && a.snippet.trim())
        );
        // LOG: Number of filtered articles
        console.log("filteredArticles.length:", filteredArticles.length, filteredArticles);

        // Use crossEncode to rank, but use FULL article for prompt
        let topIndexes = [];
        if (filteredArticles.length > 0) {
          const docTexts = filteredArticles.map(
            a => [a.title, a.text, a.snippet].filter(Boolean).join(' ')
          );
          // LOG: Number of docTexts to reranker
          console.log("docTexts.length:", docTexts.length, docTexts);

          // Log before crossEncode call
          console.log("About to call crossEncode with docTexts.length:", docTexts.length);

          let crossRes;
          try {
            crossRes = await crossEncode(userMessage, docTexts);
            console.log("crossRes FULL RESPONSE:", crossRes);
            console.log("crossRes.length:", crossRes?.length, crossRes);
          } catch (crossError) {
            console.error("crossEncode ERROR:", crossError);
            throw crossError; // re-throw to outer catch
          }

          if (crossRes && Array.isArray(crossRes)) {
            topIndexes = crossRes
              .map((score, i) => ({ score, i }))
              .sort((a, b) => b.score - a.score)
              .slice(0, 10)
              .map(obj => obj.i);
            // LOG: Indexes of top reranked articles
            console.log("topIndexes:", topIndexes);
          } else {
            topIndexes = [0, 1, 2].filter(idx => idx < filteredArticles.length);
            console.log("Fallback topIndexes:", topIndexes);
          }
        }

        articlesForTable = topIndexes.map(idx => filteredArticles[idx]).filter(Boolean);
        // LOG: Number and content of articles selected for context table
        console.log("articlesForTable.length:", articlesForTable.length, articlesForTable);

        articlesForPrompt = articlesForTable.map(articleToContextString);
        // LOG: Number and preview of articles used in prompt
        console.log("articlesForPrompt.length:", articlesForPrompt.length, articlesForPrompt);
      }

      setContextArticles(articlesForTable);

      // 3. Send prompt with full-article context
      // LOG: The final prompt sent to the LLM
      if (articlesForPrompt && articlesForPrompt.length > 0) {
        const prompt = `ARTICLES:\n\n${articlesForPrompt.join('\n\n---\n\n')}\n\n---\n\n${userMessage}`;
        console.log("[sendMessage] Final prompt sent to Gemini:", prompt);
      } else {
        console.log("[sendMessage] Final prompt sent to Gemini:", userMessage);
      }

      const aiResponse = await sendMessage(userMessage, articlesForPrompt);

      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: aiResponse.response || aiResponse.message }
      ]);
    } catch (error) {
      console.error("Full error details:", error); // ENHANCED ERROR LOGGING
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'An error occurred.', error: true }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={0} sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Messages area */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        <List>
          {messages.map((message, index) => (
            <React.Fragment key={index}>
              {index > 0 && <Divider variant="middle" sx={{ my: 1 }} />}
              <ListItem alignItems="flex-start" sx={{
                flexDirection: 'column',
                alignItems: message.role === 'user' ? 'flex-end' : 'flex-start',
              }}>
                <Box sx={{
                  display: 'flex',
                  maxWidth: '80%',
                  mb: 0.5
                }}>
                  {message.role === 'assistant' ? (
                    <Avatar
                      sx={{ width: 28, height: 28, mr: 1, bgcolor: 'secondary.dark' }}
                    >
                      <BsRobot fontSize="small" />
                    </Avatar>
                  ) : (
                    <Avatar
                      sx={{ width: 28, height: 28, ml: 1, order: 2, bgcolor: 'primary.dark' }}
                    >
                      <BsPersonWorkspace fontSize="small" />
                    </Avatar>
                  )}
                  <Box sx={{ order: message.role === 'user' ? 1 : 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      {message.role === 'user' ? 'You' : 'AI Assistant'}
                    </Typography>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: message.role === 'user'
                          ? 'primary.dark'
                          : message.error
                            ? 'error.dark'
                            : 'background.paper',
                        border: '1px solid',
                        borderColor: message.role === 'user'
                          ? 'primary.main'
                          : message.error
                            ? 'error.main'
                            : 'divider'
                      }}
                    >
                      {message.role === 'assistant' ? (
                        <Box sx={{
                          '& p': { m: 0, mb: 1 },
                          '& p:last-child': { mb: 0 },
                          '& a': { color: 'primary.light' },
                          '& ul, & ol': { pl: 2, mb: 1, mt: 0.5 },
                          '& code': {
                            bgcolor: 'rgba(0, 0, 0, 0.2)',
                            px: 0.5,
                            py: 0.25,
                            borderRadius: 0.5,
                            fontFamily: 'monospace'
                          },
                          '& pre': {
                            bgcolor: 'rgba(0, 0, 0, 0.2)',
                            p: 1,
                            borderRadius: 1,
                            overflow: 'auto',
                            fontFamily: 'monospace'
                          }
                        }}>
                          <ReactMarkdown>
                            {message.content}
                          </ReactMarkdown>
                        </Box>
                      ) : (
                        <Typography variant="body1">{message.content}</Typography>
                      )}
                    </Paper>
                  </Box>
                </Box>
              </ListItem>
            </React.Fragment>
          ))}
          <div ref={messagesEndRef} />
        </List>
        {loading && (
          <Box display="flex" alignItems="center" justifyContent="center" my={2}>
            <CircularProgress size={20} />
            <Typography variant="body2" color="text.secondary" ml={1}>
              Thinking...
            </Typography>
          </Box>
        )}
      </Box>
      {/* Input area */}
      <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <TextField
          fullWidth
          placeholder="Ask about current events..."
          variant="outlined"
          size="small"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          disabled={loading}
          multiline
          maxRows={4}
          InputProps={{
            endAdornment: (
              <Button
                color="primary"
                size="small"
                onClick={handleSendMessage}
                disabled={!input.trim() || loading}
                sx={{ minWidth: 40 }}
              >
                <SendIcon />
              </Button>
            ),
          }}
        />
      </Box>
    </Paper>
  );
};

export default Chat;