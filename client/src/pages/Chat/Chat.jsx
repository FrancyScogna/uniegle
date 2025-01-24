import { useEffect, useRef, useState } from "react";
import "./Chat.css";
import { useNavigate } from "react-router-dom";
import MyCam from "../../component/MyCam/MyCam";
import Request from "../../component/Request/Request";
import TextChat from "../../component/TextChat/TextChat";

function Chat({socket}){

    //Inizializzazione delle variabili
    const navigate = useNavigate();

    const [userData, setUserData] = useState({});
    const [request, setRequest] = useState(null);
    const [openRequest, setOpenRequest] = useState(false);
    const [selectedVideoDevice, setSelectedVideoDevice] = useState('');
    const [selectedAudioDevice, setSelectedAudioDevice] = useState('');
    const [messages, setMessages] = useState([]);
    const [disabledChat, setDisabledChat] = useState(true);
    const localVideoRef = useRef();
    const remoteVideoRef = useRef();
    const peerConnection = useRef();

    useEffect(() => {
        const userDataJSON = localStorage.getItem("userData");
        const userData = JSON.parse(userDataJSON);
        if(!userData){
            navigate('/user-profile', {replace: true});
        }else {
            setUserData(userData);
            socket.emit('user data', userData);
        }
        
    },[]);

    useEffect(() => {

        socket.on('connect', () => {
            disconnectChat();
            navigate("/user-profile", {replace: true});
        });

        socket.on('signal', async (data) => {
            if (data.candidate) {
                await peerConnection.current.addIceCandidate(data.candidate);
                setDisabledChat(false);
                setOpenRequest(false);
            } else if (data.sdp) {
                await peerConnection.current.setRemoteDescription(new RTCSessionDescription(data.sdp));
                if (data.sdp.type === 'offer') {
                    const answer = await peerConnection.current.createAnswer();
                    await peerConnection.current.setLocalDescription(answer);
                    socket.emit('signal', { sdp: answer });
                }
            }
        });

        socket.on('paired', async (data) => {
            const configuration = {
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                ],
            };
    
            peerConnection.current = new RTCPeerConnection(configuration);
    
            peerConnection.current.ontrack = (event) => {
                remoteVideoRef.current.srcObject = event.streams[0];
            };
    
            peerConnection.current.onicecandidate = (event) => {
                if (event.candidate) {
                    socket.emit('signal', { candidate: event.candidate });
                }
            };
            await startStream(selectedVideoDevice, selectedAudioDevice);
        });

        socket.on('partner disconnected', () => {
            setRequest(null);
            setOpenRequest(false);
            setDisabledChat(true);
            setMessages([]);
            remoteVideoRef.current.srcObject = null;
        });

        socket.on('chat message', (msg) => {
            setMessages((prevMessages) => [...prevMessages, { sender: 'partner', text: msg }]);
        });

        socket.on('request', (data) => {
            setRequest(data);
            setOpenRequest(true);
        })

        socket.on('rejected', () => {
            setRequest(null);
            setOpenRequest(false);
        })

        socket.on('missing userdata', () => {
            disconnectChat();
            navigate("/user-profile", {replace: true});
        })

        return () => {
            socket.off('signal');
            socket.off('paired');
            socket.off('partner disconnected');
            socket.off('chat message');
            socket.off('user data');
            socket.off('request');
            socket.off('reject');
        };
    }, []);

    const startStream = async (videoDeviceId, audioDeviceId) => {

        const stream = await navigator.mediaDevices.getUserMedia({
            video: { deviceId: videoDeviceId ? { exact: videoDeviceId } : undefined },
            audio: { deviceId: audioDeviceId ? { exact: audioDeviceId } : undefined },
        });

        localVideoRef.current.srcObject = stream;

        const senders = peerConnection.current.getSenders();

        stream.getVideoTracks().forEach((track) => {
            const videoSender = senders.find((sender) => sender.track?.kind === 'video');
            if (videoSender) {
                videoSender.replaceTrack(track);
            } else {
                peerConnection.current.addTrack(track, stream);
            }
        });

        stream.getAudioTracks().forEach((track) => {
            const audioSender = senders.find((sender) => sender.track?.kind === 'audio');
            if (audioSender) {
                audioSender.replaceTrack(track);
            } else {
                peerConnection.current.addTrack(track, stream);
            }
        });

        const offer = await peerConnection.current.createOffer();
        await peerConnection.current.setLocalDescription(offer);
        socket.emit('signal', { sdp: offer });
    };

    const disconnectChat = () => {
        socket.emit('exit');
        setRequest(null);
        setOpenRequest(false);
        setDisabledChat(true);
        setMessages([]);
        if(localVideoRef.current){
            const stream = localVideoRef.current?.srcObject;
            if (stream) {
                const tracks = stream.getTracks();
                tracks.forEach((track) => track.stop());
            }
        }    
        if(remoteVideoRef.current){
            remoteVideoRef.current.srcObject = null; 
        }
    }

    const onClickSkip = () => {
        socket.emit('skip');
        setRequest(null);
        setOpenRequest(false);
        setDisabledChat(true);
        if(remoteVideoRef.current){
            remoteVideoRef.current.srcObject = null; 
        }
    }

    return(
        <div style={{display: "flex", flexDirection: "column"}}>
            {openRequest && (
                <Request 
                request={request} 
                setRequest={setRequest} 
                setOpenRequest={setOpenRequest} 
                socket={socket} />
            )}
            <h1>Chat</h1>
            <div style={{display: "flex", flexDirection: "row"}}>
                <div style={{width: "400px"}}>
                    <MyCam 
                    selectedAudioDevice={selectedAudioDevice}
                    selectedVideoDevice={selectedVideoDevice}
                    setSelectedAudioDevice={setSelectedAudioDevice}
                    setSelectedVideoDevice={setSelectedVideoDevice}
                    localVideoRef={localVideoRef} 
                    startStream={startStream} />
                </div>
                <div style={{width: "400px", height: "400px"}}>
                    <video 
                    playsInline 
                    ref={remoteVideoRef} 
                    autoPlay 
                    style={{ width: '100%', height: "400px", border: '1px solid black' }} />
                </div>
            </div>
            <TextChat
            messages={messages}
            setMessages={setMessages}  
            disabledChat={disabledChat}
            partnerData={request ? request : {}}
            myData={userData}
            socket={socket} />
            <div style={{display: "flex", width: "100%"}}>
                <button onClick={() => {
                    disconnectChat();
                    navigate("/user-profile", {replace: true});
                    }}>Interrompi</button>
                <button onClick={onClickSkip} disabled={disabledChat}>Skip</button>
            </div>
        </div>
    )

}

export default Chat;