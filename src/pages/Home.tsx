import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Thread from "../components/Thread"; // Adjust the import path as needed

interface Thread {
  id: number;
  title: string;
  creator: string;
  createdAt: string;
}

const Home: React.FC = () => {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [newThreadTitle, setNewThreadTitle] = useState("");
  const [activeThread, setActiveThread] = useState<Thread | null>(null);
  const username = localStorage.getItem("username") || "Anonymous User";
  const navigate = useNavigate();

  // Mock threads data (can be replaced with an API call)
  useEffect(() => {
    setThreads([
      { id: 1, title: "CS1010S: Need help with recursion", creator: "Alice", createdAt: "2024-12-01" },
      { id: 2, title: "MA1101R: Challenging topics in calculus", creator: "Bob", createdAt: "2024-12-02" },
    ]);
  }, []);

  const handleCreateThread = () => {
    if (newThreadTitle.trim() === "") {
      alert("Thread title cannot be empty.");
      return;
    }
    const newThread: Thread = {
      id: threads.length + 1,
      title: newThreadTitle,
      creator: username,
      createdAt: new Date().toISOString().split("T")[0],
    };
    setThreads([newThread, ...threads]);
    setNewThreadTitle("");
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Welcome, {username}!</h1>
      <p style={styles.subHeader}>Explore threads or create your own topic to discuss.</p>

      {/* Create New Thread */}
      <div style={styles.newThreadContainer}>
        <input
          type="text"
          value={newThreadTitle}
          onChange={(e) => setNewThreadTitle(e.target.value)}
          placeholder="Enter thread title..."
          style={styles.input}
        />
        <button onClick={handleCreateThread} style={styles.createButton}>
          Create Thread
        </button>
      </div>

      {/* List of Threads */}
      <div style={styles.threadList}>
        {threads.map((thread) => (
          <div
            key={thread.id}
            style={styles.threadItem}
            onClick={() => setActiveThread(thread)}
          >
            <h3 style={styles.threadTitle}>{thread.title}</h3>
            <p style={styles.threadDetails}>
              Created by: {thread.creator} on {thread.createdAt}
            </p>
          </div>
        ))}
      </div>

      {/* Show Thread Modal */}
      {activeThread && (
        <Thread
          id={activeThread.id}
          title={activeThread.title}
          creator={activeThread.creator}
          createdAt={activeThread.createdAt}
          onClose={() => setActiveThread(null)}
        />
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: "800px",
    margin: "0 auto",
    padding: "20px",
    fontFamily: "'Arial', sans-serif",
    backgroundColor: "#f9f9f9",
  },
  header: {
    textAlign: "center" as const,
    color: "#007BFF",
  },
  subHeader: {
    textAlign: "center" as const,
    marginBottom: "20px",
    color: "#555",
  },
  newThreadContainer: {
    display: "flex",
    marginBottom: "20px",
  },
  input: {
    flex: 1,
    padding: "10px",
    fontSize: "16px",
    border: "1px solid #ddd",
    borderRadius: "5px",
  },
  createButton: {
    padding: "10px 20px",
    fontSize: "16px",
    backgroundColor: "#007BFF",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    marginLeft: "10px",
    cursor: "pointer",
  },
  threadList: {
    marginTop: "20px",
  },
  threadItem: {
    border: "1px solid #ddd",
    borderRadius: "5px",
    padding: "10px",
    marginBottom: "10px",
    backgroundColor: "#fff",
    cursor: "pointer",
    transition: "transform 0.2s",
  },
  threadTitle: {
    margin: "0 0 5px 0",
    fontSize: "18px",
  },
  threadDetails: {
    margin: "0",
    fontSize: "14px",
    color: "#666",
  },
};

export default Home;
