import { useState } from "react";
import { useMediaQuery } from "@mui/material";
import "./TextChat.css";

function TextChat({ messages, setMessages, disabledChat, socket, myData, partnerData }) {
    const [message, setMessage] = useState("");
    const isMobile = useMediaQuery("(max-width: 550px)");

    const sendMessage = (e) => {
        e.preventDefault();
        if (message.trim()) {
            socket.emit('chat message', message);
            setMessages((prevMessages) => [...prevMessages, { sender: 'me', text: message }]);
            setMessage('');
        }
    };

    return (
        <div 
            className="text-chat-container" 
            style={!isMobile ? {
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: "35vh",
                minHeight: "150px",
                background: "white",
                borderTop: "2px solid black",
                boxShadow: "0 -2px 5px rgba(0, 0, 0, 0.2)",
                padding: "10px",
                overflow: "hidden"
            } : {}}
        >
            <div 
                className="text-chat-messages" 
                style={!isMobile ? {
                    flexGrow: 1,
                    overflowY: "auto",
                    padding: "10px",
                    border: "1px solid black",
                    height: "100%"
                } : {}}
            >
                <h2>Chat Testuale</h2>
                {messages.map((msg, index) => (
                    <div key={index} style={{ textAlign: msg.sender === 'me' ? 'right' : 'left' }}>
                        <b>{msg.sender}:</b> {msg.text}
                    </div>
                ))}
            </div>
            <form 
                onSubmit={sendMessage} 
                className="text-chat-form"
                style={!isMobile ? { display: "flex", gap: "10px", paddingTop: "10px" } : {}}
            >
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Scrivi un messaggio..."
                    disabled={disabledChat}
                    style={!isMobile ? { flex: 1, padding: "8px" } : {}}
                />
                <button disabled={disabledChat} type="submit" style={!isMobile ? { padding: "8px", cursor: "pointer" } : {}}>
                    Invia
                </button>
            </form>
        </div>
    );
}

export default TextChat;
