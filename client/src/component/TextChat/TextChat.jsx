import { useEffect, useRef, useState } from "react";
import { Avatar, Button, IconButton, TextField, Typography, useMediaQuery } from "@mui/material";
import "./TextChat.css";
import SendIcon from '@mui/icons-material/Send';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';

function TextChat({ messages, setMessages, disabledChat, socket, myData, partnerData, onClickMute, mute, isTyping }) {
    const [message, setMessage] = useState("");
    const mobile = useMediaQuery("(max-width: 550px)");
    const [typingTimeout, setTypingTimeout] = useState(null);
    const messagesEndRef = useRef(null);

    const sendMessage = (e) => {
        e.preventDefault();
        if (message.trim()) {
            socket.emit('chat message', message);
            setMessages((prevMessages) => [...prevMessages, { sender: 'me', text: message }]);
            setMessage('');
        }
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isTyping]);

    const handleTyping = (e) => {
        setMessage(e.target.value);
    
        socket.emit('typing');
    
        if (typingTimeout) clearTimeout(typingTimeout);
    
        setTypingTimeout(setTimeout(() => {
            socket.emit('stop typing');
        }, 2000));
    };

    return (
        <div className="text-chat-container" >
            <div className="text-chat-messages" >
                {messages.map((msg, index) => (
                    <div className="message-div" key={index} style={{ marginLeft: msg.sender === 'me' && 'auto'}}>
                        <Avatar className="avatar" src={msg.sender === "me" ? myData.imgSrc : partnerData.userData.imgSrc} />
                        <Typography>
                            <b style={{color: "rgb(195, 78, 0)"}}>{msg.sender === "me" ? "Tu" : partnerData.userData.nickname }: </b>{msg.text}
                        </Typography>
                    </div>
                ))}
                {isTyping && <div className="message-div">
                        <Avatar className="avatar" src={partnerData.userData.imgSrc} />
                        <Typography>
                            <b style={{color: "rgb(195, 78, 0)"}}>{partnerData.userData.nickname} sta scrivendo...</b>
                        </Typography>
                    </div>}
                <div ref={messagesEndRef} />
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
                    onChange={handleTyping}
                    placeholder="Scrivi un messaggio..."
                    disabled={disabledChat}
                />
                <IconButton onClick={onClickMute}>
                    { mute ?
                        <VolumeUpIcon className="button-icon"/>
                        :
                        <VolumeOffIcon className="button-icon"/>
                    }
                </IconButton>
                {!mobile ?
                <Button variant="contained" disabled={disabledChat} type="submit">
                    Invia
                    <SendIcon className="button-icon"/>
                </Button>
                :
                <IconButton disabled={disabledChat} type="submit">
                    <SendIcon />
                </IconButton>
                }
            </form>
        </div>
    );
}

export default TextChat;
