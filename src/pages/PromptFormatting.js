import React from 'react';
import { Paper, Typography, Box } from '@mui/material';

const PromptFormatting = ({ prompt }) => {
  if (!prompt || !prompt.trim()) return null;
  return (
    <Box sx={{ my: 2 }}>
      <Paper elevation={2} sx={{ p: 2, bgcolor: 'background.paper' }}>
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
          }}
        >
          {prompt}
        </Typography>
      </Paper>
    </Box>
  );
};

export default PromptFormatting;