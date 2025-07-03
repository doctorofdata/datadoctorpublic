import neo4j from 'neo4j-driver';
import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Typography,
  Box,
  Chip
} from '@mui/material';
import { styled } from '@mui/material/styles';

// Styled components for better appearance
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  '&.MuiTableCell-head': {
    backgroundColor: '#1a1a1a', // Dark black header
    color: '#d1d1d1', // Light gray text instead of white
    fontWeight: 'bold',
    textTransform: 'capitalize'
  },
  '&.MuiTableCell-body': {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:last-child td, &:last-child th': {
    border: 0,
  },
  '&:hover': {
    backgroundColor: '#404040', // Medium dark gray on hover
  },
}));

const TextCell = styled(TableCell)({
  maxWidth: 400,
  wordWrap: 'break-word',
  whiteSpace: 'normal',
  verticalAlign: 'top',
});

function Neo4jDataDisplay() {
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper function to format column names
  const formatColumnName = (columnName) => {
    return columnName
      .replace(/^n\./, '') // Remove 'n.' prefix
      .replace(/_/g, ' ') // Replace underscores with spaces
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Helper function to format cell values
  const formatCellValue = (value, columnName) => {
    if (value === null || value === undefined) return 'N/A';
    
    // Handle date formatting
    if (columnName.includes('date') && value) {
      try {
        return new Date(value).toLocaleDateString();
      } catch (e) {
        return value;
      }
    }
    
    return value.toString();
  };

  useEffect(() => {
    const fetchData = async () => {
      let driver;
      let session;
      
      try {
        driver = neo4j.driver(
          'neo4j+s://5c36956d.databases.neo4j.io',
          neo4j.auth.basic('neo4j', 'j8OwRuLG0JY0HgTONVFE7c9jSAs4ynxtc0bIyPjSxHc')
        );
        
        session = driver.session();

        const result = await session.run(
          'match (n) return n.pub_date, n.document_type, n.section_name, n.news_desk, n.byline, n.text order by n.pub_date desc limit 10'
        );

        if (result.records.length > 0) {
          // Dynamically extract column names from the first record
          const firstRecord = result.records[0];
          const dynamicColumns = firstRecord.keys;
          setColumns(dynamicColumns);

          // Process all records
          const fetchedData = result.records.map(record => {
            const obj = {};
            dynamicColumns.forEach(key => {
              obj[key] = record.get(key);
            });
            return obj;
          });

          setData(fetchedData);
        }
        
        setLoading(false);
        
      } catch (err) {
        console.error('Neo4j Error:', err);
        setError(err);
        setLoading(false);
      } finally {
        if (session) await session.close();
        if (driver) await driver.close();
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={2}>
        <Alert severity="error">
          Error loading data: {error.message}
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      
      <Chip 
        label={`${data.length} records found`} 
        color="primary" 
        sx={{ mb: 2 }}
      />

      {data.length === 0 ? (
        <Alert severity="info">No data found</Alert>
      ) : (
        <TableContainer component={Paper} elevation={3}>
          <Table sx={{ minWidth: 700 }} aria-label="dynamic data table">
            <TableHead>
              <TableRow>
                {columns.map((column, index) => (
                  <StyledTableCell key={index}>
                    {formatColumnName(column)}
                  </StyledTableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((row, rowIndex) => (
                <StyledTableRow key={rowIndex}>
                  {columns.map((column, colIndex) => (
                    <StyledTableCell 
                      key={colIndex}
                      component={column.includes('text') ? TextCell : TableCell}
                    >
                      {formatCellValue(row[column], column)}
                    </StyledTableCell>
                  ))}
                </StyledTableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}

export default Neo4jDataDisplay;