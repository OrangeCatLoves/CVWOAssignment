import React, { useEffect, useState } from "react";

// Define the type for a thread
type Thread = {
  id: number;
  title: string;
  creator: string;
  created_at: string;
  replies: number; // Number of replies for each thread
};

const Home: React.FC = () => {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filteredThreads, setFilteredThreads] = useState<Thread[]>([]);

  // Fetch threads on component mount
  useEffect(() => {
    const fetchThreads = async () => {
      try {
        const response = await fetch("http://localhost:8080/threads"); // Adjust if needed for your server
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: Thread[] = await response.json();
        setThreads(data);
        setFilteredThreads(data); // Initialize filtered threads with all threads
        setLoading(false);
      } catch (err: any) {
        setError(err.message || "An error occurred");
        setLoading(false);
      }
    };

    fetchThreads();
  }, []);

  // Filter threads based on search query
  useEffect(() => {
    if (searchQuery) {
      const filtered = threads.filter((thread) =>
        thread.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredThreads(filtered);
    } else {
      setFilteredThreads(threads); // Reset to all threads if search is cleared
    }
  }, [searchQuery, threads]);

  if (loading) {
    return (
      <div style={styles.centered}>
        <p>Loading threads...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.centered}>
        <p style={styles.errorText}>Error: {error}</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Welcome to the NUS Forum</h1>

      {/* Search Bar */}
      <div style={styles.searchContainer}>
        <input
          type="text"
          placeholder="Search for threads..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={styles.searchInput}
        />
      </div>

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
              <p style={styles.details}>Replies: {thread.replies}</p>
              <div style={styles.buttonContainer}>
                <button style={styles.joinButton}>Join</button>
                <button style={styles.askButton}>Ask a Question</button>
              </div>
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
  buttonContainer: {
    marginTop: "15px",
  },
  joinButton: {
    backgroundColor: "#27AE60",
    color: "#fff",
    border: "none",
    padding: "10px 15px",
    fontSize: "14px",
    borderRadius: "5px",
    cursor: "pointer",
    marginRight: "10px",
  },
  askButton: {
    backgroundColor: "#2980B9",
    color: "#fff",
    border: "none",
    padding: "10px 15px",
    fontSize: "14px",
    borderRadius: "5px",
    cursor: "pointer",
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
  centered: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
  },
  errorText: {
    color: "red",
    fontSize: "16px",
  },
} as const;

export default Home;
