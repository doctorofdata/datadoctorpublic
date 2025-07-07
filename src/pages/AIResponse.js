import React from 'react';
import {
    Box,
    Paper,
    Typography,
} from '@mui/material';
import { GiRobotGolem } from "react-icons/gi";
import ReactMarkdown from 'react-markdown';

const AIResponse = ({ response }) => {
    if (!response) return null;

    return (
        <Paper sx={{
            p: 3,
            bgcolor: 'background.paper',
            border: 1,
            borderColor: 'divider',
            boxShadow: 'none',
            borderRadius: 1
        }}>
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                mb: 2
            }}>
                <GiRobotGolem style={{ color: 'var(--mui-palette-primary-main)', marginRight: 8 }} />
                <Typography
                    variant="h6"
                    sx={{
                        fontWeight: 600,
                        color: 'text.primary'
                    }}
                >
                    Model Response
                </Typography>
            </Box>

            <Box sx={{
                bgcolor: 'action.hover',
                borderRadius: 1,
                p: 2,
                border: 1,
                borderColor: 'divider'
            }}>
                <ReactMarkdown>
                    {response}
                </ReactMarkdown>
            </Box>
        </Paper>
    );
};

export default AIResponse;