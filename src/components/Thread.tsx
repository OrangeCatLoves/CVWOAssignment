import React, { useState } from "react";
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
}

const Thread: React.FC<ThreadProps> = ({ id, title, creator, created_at, onClose }) => {
  const [messages, setMessages] = useState<string[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSendMessage = () => {
    if (newMessage.trim() === "") {
      setError("Message cannot be empty");
      return;
    }

    if (newMessage.length > 250) {
      setError("Message cannot exceed 250 characters");
      return;
    }

    setMessages([...messages, newMessage.trim()]);
    setNewMessage("");
    setError(null);
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

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
          {messages.map((message, index) => (
            <Paper
              key={index}
              sx={{
                p: 2,
                bgcolor: 'primary.main',
                color: 'white',
                maxWidth: '80%',
                alignSelf: 'flex-end',
                borderRadius: '12px 12px 0 12px'
              }}
            >
              {message}
            </Paper>
          ))}
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
          />
          <Button
            variant="contained"
            onClick={handleSendMessage}
            disabled={!!error || newMessage.length === 0}
            endIcon={<SendIcon />}
            sx={{ minWidth: '100px' }}
          >
            Send
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default Thread;