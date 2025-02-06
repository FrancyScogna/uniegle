import { useEffect, useRef, useState } from "react";
import "./Chat.css";
import { useNavigate } from "react-router-dom";
import MyCam from "../../component/MyCam/MyCam";
import Request from "../../component/Request/Request";
import TextChat from "../../component/TextChat/TextChat";
import WhiteNoise from "../../assets/white_noise.mp4";
import { Button, IconButton, Typography, useMediaQuery } from "@mui/material";
import PublicIcon from '@mui/icons-material/Public';
import StopCircleIcon from '@mui/icons-material/StopCircle';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import ChatIcon from '@mui/icons-material/Chat';

function Chat({socket}){

    //Inizializzazione delle variabili
    const navigate = useNavigate();
    const mobile = useMediaQuery("(max-width: 550px)")

    const [userData, setUserData] = useState({});
    const [request, setRequest] = useState(null);
    const [openRequest, setOpenRequest] = useState(false);
    const [selectedVideoDevice, setSelectedVideoDevice] = useState('');
    const [selectedAudioDevice, setSelectedAudioDevice] = useState('');
    const [messages, setMessages] = useState([]);
    const [disabledChat, setDisabledChat] = useState(true);
    const [status, setStatus] = useState("init");
    const localVideoRef = useRef();
    const remoteVideoRef = useRef();
    const peerConnection = useRef();

    useEffect(() => {
        const userDataJSON = localStorage.getItem("userData");
        const userData = JSON.parse(userDataJSON);
        if(!userData){
            navigate('/', {replace: true});
        }else {
            setUserData(userData);
            socket.emit('user data', userData);
        }
        
    },[]);

    useEffect(() => {

        socket.on('connect', () => {
            disconnectChat();
            navigate("/", {replace: true});
        });

        socket.on('signal', async (data) => {
            if (data.candidate) {
                await peerConnection.current.addIceCandidate(data.candidate);
                setDisabledChat(false);
                setOpenRequest(false);
                setStatus(`connected`)
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
            setStatus("paired")
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
            setStatus("disconnected")
            remoteVideoRef.current.srcObject = null;
        });

        socket.on('chat message', (msg) => {
            setMessages((prevMessages) => [...prevMessages, { sender: 'partner', text: msg }]);
        });

        socket.on('request', (data) => {
            setRequest(data);
            setOpenRequest(true);
            setStatus("waitrequest")
        })

        socket.on('rejected', () => {
            setRequest(null);
            setOpenRequest(false);
            setStatus("rejectrequest")
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
        setStatus("skip")
        socket.emit('skip');
        setRequest(null);
        setOpenRequest(false);
        setDisabledChat(true);
        if(remoteVideoRef.current){
            remoteVideoRef.current.srcObject = null; 
        }
    }

    const statusMessages = {
        "init": ["In attesa di un nuovo utente..."],
        "connected": ["Connesso con l'utente!"],
        "paired": ["Utente trovato!", "Connessione in corso..."],
        "disconnected": ["L'utente si è disconnesso!", "In attesa di un nuovo utente..."],
        "waitrequest": ["In attesa della richiesta..."],
        "rejectrequest": ["Richiesta rifiutata!", "In attesa di un nuovo utente..."],
        "skip": ["Disconnesso!", "In attesa di un nuovo partner..."]
    }

    const onClickOpenChatMobile = () => {
        //Apre il drawer per la chat mobile
    }

    return(
        <div className="chat-div">
            <div className="central-div">
                {openRequest && 
                <Request 
                request={request} 
                setRequest={setRequest} 
                setOpenRequest={setOpenRequest} 
                openRequest={openRequest}
                socket={socket} />}
                <div className="video-div">
                    <div className="my-cam">
                        <MyCam 
                        selectedAudioDevice={selectedAudioDevice}
                        selectedVideoDevice={selectedVideoDevice}
                        setSelectedAudioDevice={setSelectedAudioDevice}
                        setSelectedVideoDevice={setSelectedVideoDevice}
                        localVideoRef={localVideoRef} 
                        startStream={startStream} />
                        {mobile && 
                        <IconButton onClick={onClickOpenChatMobile} className="mobile-chat-button">
                            <ChatIcon className="icon" />
                        </IconButton>}
                    </div>
                    <div className="other-cam">
                        <video 
                        playsInline 
                        ref={remoteVideoRef} 
                        src={!remoteVideoRef.current?.srcObject ? WhiteNoise : remoteVideoRef.current.srcObject }
                        muted={!remoteVideoRef.current?.srcObject ? true : false}
                        style={{objectFit: !remoteVideoRef.current?.srcObject && "cover"}}
                        loop={!remoteVideoRef.current?.srcObject ? true : false}
                        autoPlay 
                        />
                        <div className="status-div">
                            <PublicIcon className="icon" />
                            <Typography 
                                    className="status-text"
                                    variant="body1" 
                                >
                            {statusMessages[status]?.map((message, index) => (
                                <>
                                    {message}
                                    <br/>
                                </>
                            ))}
                            </Typography>
                        </div>
                    </div>
                </div>
                <div className="content-div">
                    {!mobile && <TextChat
                    messages={messages}
                    setMessages={setMessages}  
                    disabledChat={disabledChat}
                    partnerData={request ? request : {}}
                    myData={userData}
                    socket={socket} />}
                    <div className="buttons-div">
                        <Button color="error" variant="contained" size="large" fullWidth onClick={() => {
                            disconnectChat();
                            navigate("/user-profile", {replace: true});
                            }}>
                                Interrompi
                                <StopCircleIcon className="button-icon"/>
                        </Button>
                        <Button color="warning" variant="contained" size="large" fullWidth onClick={onClickSkip} disabled={disabledChat}>
                            Skip
                            <SkipNextIcon className="button-icon"/>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )

}

export default Chat;