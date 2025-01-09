import React, { useEffect, useState } from "react";
import { TypeAnimation } from 'react-type-animation';
import {
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  List,
  ListItem,
  Box,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Divider,
} from "@mui/material";
import { Add as AddIcon, Search as SearchIcon } from "@mui/icons-material";
import Thread from "../components/Thread"; // Import the Thread component

// Define the type for a thread
type Thread = {
  id: number;
  title: string;
  creator: string;
  created_at: string;
};

const Home: React.FC = () => {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filteredThreads, setFilteredThreads] = useState<Thread[]>([]);
  const [newThreadTitle, setNewThreadTitle] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null);

  useEffect(() => {
    const fetchThreads = async () => {
      try {
        const response = await fetch("http://localhost:8080/threads");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: Thread[] = await response.json();
        setThreads(data);
        setFilteredThreads(data);
        setLoading(false);
      } catch (err: any) {
        setError(err.message || "An error occurred");
        setLoading(false);
      }
    };

    fetchThreads();
    const savedUsername = localStorage.getItem("username");
    setUsername(savedUsername || "Guest");
  }, []);

  const createThread = async () => {
    if (!newThreadTitle.trim()) {
      setError("Thread title cannot be empty");
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:8080/threads/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: newThreadTitle.trim(),
          creator: username,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const newThread: Thread = await response.json();
      setThreads(prevThreads => [newThread, ...prevThreads]);
      setFilteredThreads(prevFiltered => [newThread, ...prevFiltered]);
      setNewThreadTitle("");
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to create thread");
    } finally {
      setIsCreating(false);
    }
  };

  useEffect(() => {
    if (searchQuery) {
      const filtered = threads.filter((thread) =>
        thread.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredThreads(filtered);
    } else {
      setFilteredThreads(threads);
    }
  }, [searchQuery, threads]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {selectedThread && (
        <Thread
          id={selectedThread.id}
          title={selectedThread.title}
          creator={selectedThread.creator}
          created_at={selectedThread.created_at}
          onClose={() => setSelectedThread(null)}
        />
      )}
      <Box sx={{ height: '4rem', mb: 3 }}>
        <TypeAnimation
          sequence={[
            'Welcome to the Forum,',
            1000,
            `Welcome to the Forum, ${username}!`,
          ]}
          wrapper="h1"
          speed={50}
          style={{
            fontSize: '2.5rem',
            color: '#1976d2',
            fontFamily: '"Roboto","Helvetica","Arial",sans-serif',
            fontWeight: 'bold',
          }}
          repeat={0}
        />
      </Box>

      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search for threads..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
            }}
          />
        </Box>

        <Box sx={{ display: "flex", gap: 2 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Enter thread title..."
            value={newThreadTitle}
            onChange={(e) => setNewThreadTitle(e.target.value)}
            disabled={isCreating}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={createThread}
            disabled={isCreating}
            startIcon={<AddIcon />}
            sx={{ minWidth: 150 }}
          >
            {isCreating ? "Creating..." : "Create Thread"}
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </Paper>

      <Typography variant="h4" component="h2" gutterBottom color="primary" sx={{ mb: 3 }}>
        Available Threads
      </Typography>

      <List>
        {filteredThreads.length > 0 ? (
          filteredThreads.map((thread) => (
            <ListItem key={thread.id} sx={{ px: 0, mb: 2 }}>
              <Card
                elevation={2}
                sx={{ width: "100%", cursor: "pointer" }}
                onClick={() => setSelectedThread(thread)}
              >
                <CardContent>
                  <Typography variant="h6" component="h3" gutterBottom>
                    {thread.title}
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    Created by {thread.creator} on{" "}
                    {new Date(thread.created_at).toLocaleDateString()}
                  </Typography>
                </CardContent>
              </Card>
            </ListItem>
          ))
        ) : (
          <Paper elevation={1} sx={{ p: 3, textAlign: "center" }}>
            <Typography variant="body1" color="text.secondary">
              No threads found matching your search criteria.
            </Typography>
          </Paper>
        )}
      </List>
    </Container>
  );
};

export default Home;
