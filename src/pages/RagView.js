import React from 'react';
import {
    Stack,
    Box,
    Paper,
} from '@mui/material';
import { styled } from '@mui/material/styles';

import DashboardFrame from 'components/DashboardFrame';
import Chat from './ChatView/Chat';
import RagCard from './RagCard';
import Neo4jDataDisplay from './Neo4jDataDisplay';
import CopyButton from '../components/CopyButton'

// Styled components for a more attractive and integrated layout
const MainContainer = styled(Box)(({ theme }) => ({
    padding: theme.spacing(2),
    height: '100vh',
    overflow: 'hidden',
    backgroundColor: theme.palette.background.default,
    fontSize: '0.875rem',
    display: 'flex',
}));

const LeftPanel = styled(Paper)(({ theme }) => ({
    flex: '0 0 350px', // Fixed width for left panel
    padding: theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    display: 'flex',
    flexDirection: 'column',
    color: theme.palette.text.secondary,
}));

const RightPanel = styled(Box)(({ theme }) => ({
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
    minWidth: 0, // Prevents flex item from growing beyond container
}));

const ChatContainer = styled(Paper)(({ theme }) => ({
    flex: '1 1 60%', // Takes 60% of available height
    padding: theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0, // Allows content to shrink
    color: theme.palette.text.secondary,
}));

const DataContainer = styled(Paper)(({ theme }) => ({
    flex: '1 1 40%', // Takes 40% of available height
    padding: theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    overflow: 'auto', // Allows scrolling if content overflows
    minHeight: 0,
    color: theme.palette.text.secondary,
}));

const Page = () => {
    return (
        <MainContainer>
            <Stack 
                direction="row" 
                spacing={2}
                sx={{ height: '100%', width: '100%' }}
            >
                {/* Left Panel - RagCard */}
                <LeftPanel>
                    <RagCard />
                </LeftPanel>

                {/* Right Panel - Chat and Data */}
                <RightPanel>
                    {/* Chat Section */}
                    <ChatContainer>
                        <Box sx={(theme) => ({ 
                            borderBottom: `1px solid ${theme.palette.divider}`, 
                            pb: 1, 
                            mb: 2,
                            fontSize: '1rem',
                            fontWeight: 500,
                            color: theme.palette.text.primary
                        })}>
                            New York Times Current Events Chat w/ Google Gemini
                        </Box>
                        <Box sx={{ flex: 1, overflow: 'auto' }}>
                            <Chat />
                        </Box>
                    </ChatContainer>

                    {/* Data Display Section */}
                    <DataContainer>
                        <Box sx={(theme) => ({ 
                            borderBottom: `1px solid ${theme.palette.divider}`, 
                            pb: 1, 
                            mb: 2,
                            fontSize: '1rem',
                            fontWeight: 500,
                            color: theme.palette.text.primary
                        })}>
                            Database Content
                        </Box>
                        <Box sx={{ height: 'calc(100% - 56px)', overflow: 'auto' }}>
                            <Neo4jDataDisplay />
                        </Box>
                    </DataContainer>
                </RightPanel>
            </Stack>
        </MainContainer>
    );
}

const RagView = () => {
    return (
        <DashboardFrame
            header={'RAG Model w/ NYT'}
            page={<Page />}
        />
    );
}

export default RagView;