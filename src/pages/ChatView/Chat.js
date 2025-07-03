import React, { useEffect, useState, useRef } from 'react';
import {
    Avatar,
    Box,
    CircularProgress,
    IconButton,
    Paper,
    Stack,
    TextField,
    Typography
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { styled } from '@mui/material/styles';
import { VscPerson } from "react-icons/vsc";
import SendIcon from '@mui/icons-material/Send';
import { GiRobotGolem } from "react-icons/gi";

import { callConversations } from 'hooks/conversations';
import { callSendMessage } from 'hooks/sendMessage';

// Styled components to match RagView.js styling
const ChatPaper = styled(Paper)(({ theme }) => ({
    flexGrow: 1,
    backgroundColor: '#2a2a2a',
    borderRadius: 0,
    boxShadow: 'none',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
}));

const MessageContainer = styled(Box)(({ theme }) => ({
    flexGrow: 1,
    overflowY: 'auto',
    padding: theme.spacing(1),
    backgroundColor: '#2a2a2a',
    color: '#d1d1d1',
    fontSize: '0.75rem',
    '&::-webkit-scrollbar': {
        width: '6px',
    },
    '&::-webkit-scrollbar-track': {
        backgroundColor: '#1a1a1a',
    },
    '&::-webkit-scrollbar-thumb': {
        backgroundColor: '#404040',
        borderRadius: '3px',
    },
}));

const MessageBubble = styled(Paper)(({ theme, isUser }) => ({
    padding: theme.spacing(0.75, 1),
    backgroundColor: isUser ? '#404040' : '#333333',
    color: '#d1d1d1',
    borderRadius: theme.shape.borderRadius,
    maxWidth: '80%',
    wordBreak: 'break-word',
    fontSize: '0.75rem',
    boxShadow: 'none',
    border: `1px solid ${isUser ? '#505050' : '#404040'}`,
}));

const InputContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0.75),
    backgroundColor: '#2a2a2a',
    borderTop: '1px solid #404040',
    flexShrink: 0,
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
    '& .MuiOutlinedInput-root': {
        fontSize: '0.75rem',
        backgroundColor: '#1a1a1a',
        color: '#d1d1d1',
        '& fieldset': {
            borderColor: '#404040',
        },
        '&:hover fieldset': {
            borderColor: '#505050',
        },
        '&.Mui-focused fieldset': {
            borderColor: '#606060',
        },
    },
    '& .MuiInputBase-input': {
        color: '#d1d1d1',
        fontSize: '0.75rem',
        '&::placeholder': {
            color: '#888888',
            opacity: 1,
        },
    },
}));

const StyledAvatar = styled(Avatar)(({ theme, isUser }) => ({
    width: 28,
    height: 28,
    fontSize: '0.75rem',
    backgroundColor: isUser ? '#505050' : '#404040',
    color: '#d1d1d1',
    border: '1px solid #606060',
}));

const StyledIconButton = styled(IconButton)(({ theme }) => ({
    color: '#d1d1d1',
    fontSize: '0.75rem',
    '&:hover': {
        backgroundColor: '#404040',
    },
    '&.Mui-disabled': {
        color: '#666666',
    },
}));

const TypingIndicator = styled(Paper)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0.5, 1),
    backgroundColor: '#333333',
    color: '#d1d1d1',
    borderRadius: theme.shape.borderRadius,
    fontSize: '0.75rem',
    boxShadow: 'none',
    border: '1px solid #404040',
}));

const Chat = ({
  userAvatar,
  assistantAvatar,
  chatTitle = "",
}) => {
    const [messages, setMessages] = useState([
        {'role': 'assistant', 'content': 'What questions do you have?'}
    ]);
    const updateDelay = 2000;
    const [isReplying, setIsReplying] = useState(false);
    const [currentMessage, setCurrentMessage] = useState('');
    const theme = useTheme();
    const messageContainerRef = useRef(null);
    const pollRef = useRef(null);
    const [waitingMessage, setWaitingMessage] = useState('Just a second...');

    const onSendMessage = () => {
        setMessages((messages) => [...messages, {'role': 'user', 'content': currentMessage}]);
        setIsReplying(true);
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (currentMessage.trim() && onSendMessage && !isReplying) {
            onSendMessage(currentMessage.trim());
            setCurrentMessage('');
        }
    };

    const defaultUserAvatar = userAvatar || (
        <StyledAvatar isUser={true}>
            <VscPerson fontSize="small" />
        </StyledAvatar>
    );
    
    const defaultAssistantAvatar = assistantAvatar || (
        <StyledAvatar isUser={false}>
            <GiRobotGolem fontSize="small" />
        </StyledAvatar>
    );

    const pollingCallback = () => {
        const sampleResponses = [
            'Searching the archives..',
            'Investigating the metadata..',
            'Formulating a response..',
            'Digesting the data..'
        ];
        setWaitingMessage(sampleResponses[Math.floor(Math.random() * sampleResponses.length)]);
        if (Math.random() < 0.5) {
            setIsReplying(false);
            setMessages(messages => [...messages, {'role': 'assistant', 'content': 'example reply'}]);
        }
    };

    useEffect(() => {
        const startPolling = () => {
            pollRef.current = setInterval(pollingCallback, updateDelay);
        };

        const stopPolling = () => {
            clearInterval(pollRef.current);
        };

        if (isReplying) {
            startPolling();
        } else {
            stopPolling();
        }

        return () => {
            stopPolling();
        };

    }, [isReplying]);

    // Auto-scroll to bottom when new messages are added
    useEffect(() => {
        if (messageContainerRef.current) {
            messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
        }
    }, [messages, isReplying]);

    return (
        <ChatPaper>
            <Stack sx={{ height: '100%' }}>
                {/* Message Area */}
                <MessageContainer ref={messageContainerRef}>
                    {messages.length === 0 && !isReplying ? (
                         <Typography 
                             variant="body2" 
                             sx={{ 
                                 color: '#888888', 
                                 textAlign: 'center', 
                                 mt: 2,
                                 fontSize: '0.75rem'
                             }}
                         >
                            No messages yet. Start the conversation!
                         </Typography>
                    ) : (
                       messages.map((msg, index) => (
                         <Box
                           key={index}
                           sx={{
                             display: 'flex',
                             justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                             mb: 1,
                             alignItems: 'flex-end',
                           }}
                         >
                           {msg.role === 'assistant' && (
                             <Box sx={{ mr: 1, alignSelf: 'flex-start' }}>
                                 {defaultAssistantAvatar}
                             </Box>
                           )}
                           <MessageBubble isUser={msg.role === 'user'}>
                             <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                                 {msg.content}
                             </Typography>
                           </MessageBubble>
                           {msg.role === 'user' && (
                             <Box sx={{ ml: 1, alignSelf: 'flex-start' }}>
                                 {defaultUserAvatar}
                             </Box>
                           )}
                         </Box>
                       ))
                    )}
                    
                    {/* Typing Indicator */}
                    {isReplying && (
                      <Box sx={{ 
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'flex-start',
                          mt: 1,
                          mb: 1,
                        }}
                        >
                        <Box sx={{ mr: 1 }}>{defaultAssistantAvatar}</Box>
                        <TypingIndicator>
                          <CircularProgress 
                              size={12} 
                              sx={{ mr: 1, color: '#d1d1d1' }} 
                          />
                          <Typography sx={{ fontSize: '0.75rem' }}>
                              {waitingMessage}
                          </Typography>
                        </TypingIndicator>
                      </Box>
                    )}
                </MessageContainer>

                {/* Input Area */}
                <InputContainer
                    component="form"
                    onSubmit={handleSendMessage}
                >
                    <StyledTextField
                      variant="outlined"
                      size="small"
                      fullWidth
                      placeholder={isReplying ? "Waiting for response..." : "Ask about current events..."}
                      value={currentMessage}
                      onChange={(e) => setCurrentMessage(e.target.value)}
                      sx={{ mr: 1 }}
                      autoComplete="off"
                      disabled={isReplying}
                    />
                    <StyledIconButton 
                        type="submit" 
                        disabled={!currentMessage.trim() || isReplying}
                        size="small"
                    >
                      <SendIcon fontSize="small" />
                    </StyledIconButton>
                </InputContainer>
            </Stack>
        </ChatPaper>
    );
}

export default Chat;
