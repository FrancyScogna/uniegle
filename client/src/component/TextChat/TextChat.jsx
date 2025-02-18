import { useState } from "react";
import { Button, TextField, useMediaQuery } from "@mui/material";
import "./TextChat.css";

function TextChat({ messages, setMessages, disabledChat, socket, myData, partnerData }) {
    const [message, setMessage] = useState("");

    const sendMessage = (e) => {
        e.preventDefault();
        if (message.trim()) {
            socket.emit('chat message', message);
            setMessages((prevMessages) => [...prevMessages, { sender: 'me', text: message }]);
            setMessage('');
        }
    };

    return (
        <div className="text-chat-container" >
            <div className="text-chat-messages" >
                {messages.map((msg, index) => (
                    <div key={index} style={{ textAlign: msg.sender === 'me' ? 'right' : 'left' }}>
                        <b>{msg.sender}:</b> {msg.text}
                    </div>
                ))}
            </div>
            <form 
                onSubmit={sendMessage} 
                className="text-chat-form"
            >
                <TextField
                    type="text"
                    fullWidth
                    size="small"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Scrivi un messaggio..."
                    disabled={disabledChat}
                />
                <Button variant="contained" disabled={disabledChat} type="submit">
                    Invia
                </Button>
            </form>
        </div>
    );
}

export default TextChat;
