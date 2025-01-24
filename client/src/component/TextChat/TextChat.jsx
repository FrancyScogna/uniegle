import { useState } from "react";
import "./TextChat.css";

function TextChat({messages, setMessages, disabledChat, socket, myData, partnerData}){

    const [message, setMessage] = useState("");

    const sendMessage = (e) => {
        e.preventDefault();
        if (message.trim()) {
            socket.emit('chat message', message);
            setMessages((prevMessages) => [...prevMessages, { sender: 'me', text: message }]);
            setMessage('');
        }
    };

    return(
        <div>
        <div style={{ border: '1px solid black', padding: '10px', height: '200px', overflowY: 'scroll', marginBottom: '10px' }}>
            <h2>Chat Testuale</h2>
            {messages.map((msg, index) => (
                <div key={index} style={{ textAlign: msg.sender === 'me' ? 'right' : 'left' }}>
                    <b>{msg.sender}:</b> {msg.text}
                </div>
            ))}
        </div>
        <form onSubmit={sendMessage} style={{ display: 'flex', gap: '10px' }}>
            <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Scrivi un messaggio..."
                style={{ flex: 1, padding: '5px' }}
                disabled={disabledChat}
            />
            <button disabled={disabledChat} type="submit">Invia</button>
        </form>
        {/*myData && (
            <img style={{width: "300px"}} src={myData.imgSrc} />
        )}
        {partnerData && partnerData.userData && (
            <img style={{width: "300px"}} src={partnerData.userData.imgSrc} />
        )*/}
        </div>
    )

}

export default TextChat;