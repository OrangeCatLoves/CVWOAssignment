import React, { useEffect, useState } from "react";

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
    // Validate inputs
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

      // Update the threads list with the new thread
      setThreads(prevThreads => [newThread, ...prevThreads]);
      setFilteredThreads(prevFiltered => [newThread, ...prevFiltered]);
      
      // Clear the input field
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
      <div>
        <p>Loading threads...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Welcome to the Forum, {username}!</h1>

      <div style={styles.searchContainer}>
        <input
          type="text"
          placeholder="Search for threads..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={styles.searchInput}
        />
      </div>

      <div style={styles.createThreadContainer}>
        <input
          type="text"
          placeholder="Enter thread title..."
          value={newThreadTitle}
          onChange={(e) => setNewThreadTitle(e.target.value)}
          style={styles.threadInput}
          disabled={isCreating}
        />
        <button 
          style={{
            ...styles.createButton,
            opacity: isCreating ? 0.7 : 1,
            cursor: isCreating ? "not-allowed" : "pointer"
          }} 
          onClick={createThread}
          disabled={isCreating}
        >
          {isCreating ? "Creating..." : "Create Thread"}
        </button>
      </div>

      {error && <p style={styles.errorText}>{error}</p>}

      <h2 style={styles.subHeader}>Available Threads</h2>
      <ul style={styles.list}>
        {filteredThreads.length > 0 ? (
          filteredThreads.map((thread) => (
            <li key={thread.id} style={styles.threadItem}>
              <h3 style={styles.title}>{thread.title}</h3>
              <p style={styles.details}>
                Created by {thread.creator} on{" "}
                {new Date(thread.created_at).toLocaleDateString()}
              </p>
            </li>
          ))
        ) : (
          <p>No threads found matching your search criteria.</p>
        )}
      </ul>
    </div>
  );
};


const styles = {
  container: {
    padding: "20px",
    fontFamily: "'Arial', sans-serif",
    maxWidth: "800px",
    margin: "0 auto",
  },
  header: {
    fontSize: "28px",
    fontWeight: "bold",
    marginBottom: "20px",
    color: "#2C3E50",
  },
  subHeader: {
    fontSize: "20px",
    fontWeight: "600",
    marginBottom: "15px",
    color: "#34495E",
  },
  list: {
    listStyleType: "none",
    padding: 0,
  },
  threadItem: {
    padding: "20px",
    marginBottom: "15px",
    backgroundColor: "#f9f9f9",
    border: "1px solid #ddd",
    borderRadius: "8px",
    boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
  },
  title: {
    fontSize: "20px",
    fontWeight: "bold",
    color: "#2C3E50",
  },
  details: {
    fontSize: "14px",
    color: "#555",
    margin: "5px 0",
  },
  searchContainer: {
    marginBottom: "20px",
  },
  searchInput: {
    width: "100%",
    padding: "10px",
    fontSize: "16px",
    borderRadius: "5px",
    border: "1px solid #ccc",
  },
  createThreadContainer: {
    display: "flex",
    gap: "10px",
    marginBottom: "20px",
  },
  threadInput: {
    flex: 1,
    padding: "10px",
    fontSize: "16px",
    borderRadius: "5px",
    border: "1px solid #ccc",
  },
  createButton: {
    backgroundColor: "#8E44AD",
    color: "#fff",
    border: "none",
    padding: "10px 15px",
    fontSize: "14px",
    borderRadius: "5px",
    cursor: "pointer",
  },
  errorText: {
    color: "#E74C3C", // A bright red color for error messages
    fontWeight: "bold",
    fontSize: "16px",
  },
};

export default Home;
