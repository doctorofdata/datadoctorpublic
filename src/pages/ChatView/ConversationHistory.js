import React from 'react';
import {
    Paper,
    Stack,
    Typography
} from '@mui/material';

const ConversationHistory = () => {

    return (
        <Paper
            sx={{
              flexGrow: 0.2,
            }}
        >
            <Stack>
                <Typography>Chat History</Typography>
            </Stack>
        </Paper>
    );
}

export default ConversationHistory
