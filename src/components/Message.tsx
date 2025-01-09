import React from 'react';
import { Message } from '../components/types';

interface MessageProps {
    message: Message;
}

const MessageComponent: React.FC<MessageProps> = ({ message }) => {
return (
    <div style={styles.message}>
    <div style={styles.messageHeader}>
        <strong>{message.username}</strong>
        <span style={styles.timestamp}>
        {new Date(message.created_at).toLocaleString()}
        </span>
    </div>
    <p>{message.text_field}</p>
    {message.images && message.images.length > 0 && (
        <div style={styles.imageContainer}>
        {message.images.map((image, index) => (
            <img 
            key={index}
            src={image}
            alt={`Attachment ${index + 1}`}
            style={styles.image}
            />
        ))}
        </div>
    )}
    </div>
);
};

const styles = {
message: {
    background: "#f0f0f0",
    borderRadius: "5px",
    padding: "10px",
    margin: "5px 0",
},
messageHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "5px",
},
timestamp: {
    color: "#666",
    fontSize: "0.8em",
},
imageContainer: {
    marginTop: "10px",
    display: "flex",
    flexWrap: "wrap" as const,
    gap: "10px",
},
image: {
    maxWidth: "200px",
    borderRadius: "5px",
},
};

export default MessageComponent;