import React, { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  Box,
  Typography,
  IconButton,
  Paper,
  Alert
} from "@mui/material";
import { Close as CloseIcon, Send as SendIcon } from "@mui/icons-material";

interface ThreadProps {
  id: number;
  title: string;
  creator: string;
  created_at: string;
  onClose: () => void;
  username: string;
}

interface Message {
  id: number;
  text_field: string;
  username: string;
  created_at: string;
  images: string[] | null;
  thread_id: number;
}

const Thread: React.FC<ThreadProps> = ({ id, title, creator, created_at, onClose, username }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  const fetchMessages = useCallback(async () => {
    setIsFetching(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:8080/messages?thread_id=${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }
      const data = await response.json();
      setMessages(data || []);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Failed to load messages');
      setMessages([]);
    } finally {
      setIsFetching(false);
    }
  }, [id]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const handleSendMessage = async () => {
    if (newMessage.trim() === "") {
      setError("Message cannot be empty");
      return;
    }

    if (newMessage.length > 250) {
      setError("Message cannot exceed 250 characters");
      return;
    }

    setIsLoading(true);
    setError(null);

    const messageData = {
      text_field: newMessage.trim(),
      username: username,
      thread_id: id,
      images: [] // Empty array for now
    };

    try {
      const response = await fetch('http://localhost:8080/messages/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageData),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Failed to send message');
      }

      const newMessageData = await response.json();
      setMessages(prevMessages => [...prevMessages, newMessageData]);
      setNewMessage("");
      setError(null);
    } catch (err: any) {
      console.error('Error sending message:', err);
      setError(err.message || 'Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const sortedMessages = [...messages].sort((a, b) => 
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  return (
    <Dialog
      open={true}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          minHeight: '60vh',
          maxHeight: '80vh',
          display: 'flex',
          flexDirection: 'column'
        }
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" component="div">
          {title}
        </Typography>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Typography variant="subtitle2" color="text.secondary" sx={{ px: 3, pb: 2 }}>
        Created by {creator} on {new Date(created_at).toLocaleString()}
      </Typography>

      <DialogContent sx={{ display: 'flex', flexDirection: 'column', p: 3, flexGrow: 1 }}>
        <Paper 
          sx={{ 
            flexGrow: 1, 
            mb: 2, 
            p: 2, 
            overflowY: 'auto',
            bgcolor: 'grey.50',
            display: 'flex',
            flexDirection: 'column',
            gap: 1
          }}
        >
          {isFetching ? (
            <Typography color="text.secondary" align="center">
              Loading messages...
            </Typography>
          ) : error ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          ) : sortedMessages.length === 0 ? (
            <Typography color="text.secondary" align="center">
              No messages yet. Start the conversation!
            </Typography>
          ) : (
            sortedMessages.map((message) => (
              <Paper
                key={message.id}
                sx={{
                  p: 2,
                  bgcolor: message.username === username ? 'primary.main' : 'grey.300',
                  color: message.username === username ? 'white' : 'text.primary',
                  maxWidth: '80%',
                  alignSelf: message.username === username ? 'flex-end' : 'flex-start',
                  borderRadius: message.username === username 
                    ? '12px 12px 0 12px' 
                    : '12px 12px 12px 0'
                }}
              >
                <Typography variant="caption" display="block" sx={{ mb: 1, opacity: 0.8 }}>
                  {message.username} • {new Date(message.created_at).toLocaleString()}
                </Typography>
                {message.text_field}
              </Paper>
            ))
          )}
        </Paper>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            multiline
            maxRows={3}
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              if (e.target.value.length > 250) {
                setError("Message cannot exceed 250 characters");
              } else {
                setError(null);
              }
            }}
            onKeyPress={handleKeyPress}
            placeholder="Type your message... (250 characters max)"
            variant="outlined"
            error={!!error}
            helperText={error || `${newMessage.length}/250 characters`}
            disabled={isLoading}
          />
          <Button
            variant="contained"
            onClick={handleSendMessage}
            disabled={!!error || newMessage.trim().length === 0 || isLoading}
            endIcon={<SendIcon />}
            sx={{ minWidth: '100px' }}
          >
            {isLoading ? 'Sending...' : 'Send'}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default Thread;