import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const AuthenticationPage: React.FC = () => {
    const [username, setUsername] = useState("");
    const navigate = useNavigate();

    const handleLogin = () => {
        if (username.trim() === "") {
        alert("Username cannot be empty.");
        return;
        }
        // Save the username to localStorage
        localStorage.setItem("username", username.trim());
        // Redirect the user to the forum page
        navigate("/forum");
    };

    return (
        <div style={styles.container}>
        <h1>Welcome to the Forum</h1>
        <div style={styles.inputContainer}>
            <label htmlFor="username">Enter your username:</label>
            <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            style={styles.input}
            />
        </div>
        <button onClick={handleLogin} style={styles.button}>
            Login
        </button>
        </div>
  );
};

const styles = {
  container: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    backgroundColor: "#f9f9f9",
  },
  inputContainer: {
    marginBottom: "20px",
  },
  input: {
    padding: "10px",
    fontSize: "16px",
    marginLeft: "10px",
  },
  button: {
    padding: "10px 20px",
    fontSize: "16px",
    backgroundColor: "#007BFF",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
};

export default AuthenticationPage;
