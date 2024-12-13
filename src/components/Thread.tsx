import React, { useState } from "react";
import ReactDOM from "react-dom";

interface ThreadProps {
  id: number;
  title: string;
  creator: string;
  createdAt: string;
  onClose: () => void;
}

const Thread: React.FC<ThreadProps> = ({ id, title, creator, createdAt, onClose }) => {
  const [messages, setMessages] = useState<string[]>([]);
  const [newMessage, setNewMessage] = useState("");

  const handleSendMessage = () => {
    if (newMessage.trim() !== "") {
      setMessages([...messages, newMessage]);
      setNewMessage("");
    }
  };

  return ReactDOM.createPortal(
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <button onClick={onClose} style={styles.closeButton}>
          &times;
        </button>
        <h2 style={styles.title}>{title}</h2>
        <p style={styles.details}>
          Created by: {creator} on {createdAt}
        </p>

        <div style={styles.chatContainer}>
          <div style={styles.messageList}>
            {messages.map((message, index) => (
              <div key={index} style={styles.message}>
                {message}
              </div>
            ))}
          </div>
          <div style={styles.inputContainer}>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              style={styles.input}
            />
            <button onClick={handleSendMessage} style={styles.sendButton}>
              Send
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

const styles = {
  overlay: {
    position: "fixed" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modal: {
    backgroundColor: "#fff",
    borderRadius: "10px",
    padding: "20px",
    width: "80%",
    maxWidth: "600px",
    position: "relative" as const,
  },
  closeButton: {
    position: "absolute" as const,
    top: "10px",
    right: "10px",
    fontSize: "20px",
    backgroundColor: "transparent",
    border: "none",
    cursor: "pointer",
  },
  title: {
    margin: "0 0 10px",
    fontSize: "24px",
    color: "#333",
  },
  details: {
    marginBottom: "20px",
    color: "#555",
  },
  chatContainer: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "10px",
  },
  messageList: {
    maxHeight: "200px",
    overflowY: "auto" as const,
    border: "1px solid #ddd",
    borderRadius: "5px",
    padding: "10px",
    backgroundColor: "#f9f9f9",
  },
  message: {
    padding: "5px 10px",
    backgroundColor: "#007BFF",
    color: "#fff",
    borderRadius: "5px",
    marginBottom: "5px",
  },
  inputContainer: {
    display: "flex",
    gap: "10px",
  },
  input: {
    flex: 1,
    padding: "10px",
    fontSize: "16px",
    borderRadius: "5px",
    border: "1px solid #ddd",
  },
  sendButton: {
    padding: "10px 20px",
    backgroundColor: "#007BFF",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
};

export default Thread;
