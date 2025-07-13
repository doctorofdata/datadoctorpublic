import React from 'react';
import {
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Typography, Box, Link
} from '@mui/material';

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
              <TableCell sx={{ fontWeight: 'bold' }}>Title</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Source</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Excerpt</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {articles.map((art, idx) => (
              <TableRow key={idx}>
                <TableCell>
                  {art.url ? (
                    <Link href={art.url} target="_blank" rel="noopener">
                      {art.title || 'Untitled'}
                    </Link>
                  ) : (
                    art.title || 'Untitled'
                  )}
                </TableCell>
                <TableCell>{art.source || art.symbol || ''}</TableCell>
                <TableCell>{art.publishedDate || art.date || ''}</TableCell>
                <TableCell>{art.text ? art.text.slice(0, 120) + (art.text.length > 120 ? '...' : '') : ''}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ContextTable;