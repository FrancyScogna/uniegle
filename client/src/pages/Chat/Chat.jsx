import { Fragment, useEffect, useRef, useState } from "react";
import "./Chat.css";
import { useNavigate } from "react-router-dom";
import MyCam from "../../component/MyCam/MyCam";
import Request from "../../component/Request/Request";
import TextChat from "../../component/TextChat/TextChat";
import WhiteNoise from "../../assets/white_noise.mp4";
import { Button, IconButton, Typography, useMediaQuery, Drawer, Badge } from "@mui/material";
import PublicIcon from '@mui/icons-material/Public';
import StopCircleIcon from '@mui/icons-material/StopCircle';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import ChatIcon from '@mui/icons-material/Chat';
import notificationSound from '../../assets/notification.wav';
import CloseIcon from "@mui/icons-material/Close";

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
    const [openDrawer,setOpenDrawer] = useState(false);
    const localVideoRef = useRef();
    const remoteVideoRef = useRef();
    const peerConnection = useRef();
    const [newMessagesCount, setNewMessagesCount] = useState(0);
    const [mute, setMute] = useState(false);
    const muteRef = useRef();
    const openDrawerRef = useRef();
    const [isTyping, setIsTyping] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (!mobile) {
            setOpenDrawer(false);
        }
    }, [mobile]);

    useEffect(() => {
        openDrawerRef.current = openDrawer;
    },[openDrawer])

    useEffect(() => {
        muteRef.current = mute;
    },[mute])
    
    useEffect(() => {
        const userDataJSON = localStorage.getItem("userData");
        const mute = localStorage.getItem("muteNotification");
        if(mute){
            if(mute === "true"){
                setMute(true);
            }else{
                setMute(false);
            }
        }
        const userData = JSON.parse(userDataJSON);
        if(!userData){
            navigate('/', {replace: true});
        }else {
            setUserData(userData);
            socket.emit('user data', userData);
        }
        
    },[]);

    useEffect(() => {
        setNewMessagesCount(0);
    },[mobile])

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
                setMessages([]);
                setStatus(`connected`);
            } else if (data.sdp) {
                await peerConnection.current.setRemoteDescription(new RTCSessionDescription(data.sdp));
                if (data.sdp.type === 'offer') {
                    await startStream(selectedVideoDevice, selectedAudioDevice);
                    const answer = await peerConnection.current.createAnswer();
                    await peerConnection.current.setLocalDescription(answer);
                    socket.emit('signal', { sdp: answer });
                }
            }
        });

        socket.on('paired', async (data) => {
            setStatus("paired");
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

            if(data.initiator){
                const offer = await peerConnection.current.createOffer();
                await peerConnection.current.setLocalDescription(offer);
                socket.emit('signal', { sdp: offer });
            }

        });

        socket.on('partner disconnected', () => {
            setRequest(null);
            setOpenRequest(false);
            setDisabledChat(true);
            setIsTyping(false);
            setMessage("");
            setOpenDrawer(false);
            setNewMessagesCount(0);
            setMessages([]);
            setStatus("disconnected");
            remoteVideoRef.current.srcObject = null;
        });

        socket.on('chat message', (msg) => {
            setMessages((prevMessages) => [...prevMessages, { sender: 'partner', text: msg }]);
            setIsTyping(false);
            if(!openDrawerRef.current){
                setNewMessagesCount((prevCount) => prevCount + 1);
            }
            if(!muteRef.current){
                const audio = new Audio(notificationSound);
                audio.play().catch((err) => console.error("Errore nella riproduzione del suono:", err));
            }
        });

        socket.on('typing', () => {
            setIsTyping(true);
        });
    
        socket.on('stop typing', () => {
            setIsTyping(false);
        });

        socket.on('request', (data) => {
            setRequest(data);
            setOpenRequest(true);
            setStatus("waitrequest")
        })

        socket.on('rejected', () => {
            setRequest(null);
            setOpenRequest(false);
            setStatus("rejectrequest");
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
            socket.off('typing');
            socket.off('stop typing');
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

    };

    const disconnectChat = () => {
        return new Promise((resolve, reject) => {
            try{
            setNewMessagesCount(0);
            socket.emit('exit');
            setRequest(null);
            setMessage("");
            setOpenRequest(false);
            setDisabledChat(true);
            setMessages([]);
            if (localVideoRef.current) {
                const stream = localVideoRef.current.srcObject;
                if (stream) {
                    const tracks = stream.getTracks();
                    tracks.forEach((track) => {
                        track.stop();
                        stream.removeTrack(track);
                    });
                }
                localVideoRef.current.srcObject = null;
                localVideoRef.current.removeAttribute("src");
                localVideoRef.current.removeAttribute("srcObject");
            }  
            if(remoteVideoRef.current){
                remoteVideoRef.current.srcObject = null; 
                remoteVideoRef.current.removeAttribute("src");
                remoteVideoRef.current.removeAttribute("srcObject");
            }
            console.log("ciao")
            resolve();
            }catch(error){
                console.log(error);
                reject();
            }
        })
    }    

    const onClickSkip = () => {
        setNewMessagesCount(0);
        setStatus("skip")
        setIsTyping(false);
        setMessage("")
        socket.emit('skip');
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
        setOpenDrawer(true);
        setNewMessagesCount(0);
    }

    const onClickStopChat = async () => {
        await disconnectChat();
        console.log("fine")
        navigate("/user-profile", {replace: true});
    }

    const onClickMute = () => {
        setMute(!mute);
        localStorage.setItem("muteNotification", `${!mute}`);
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
                stopChat={onClickStopChat}
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
                            <Badge badgeContent={newMessagesCount} color="primary">
                                <ChatIcon className="icon" />
                            </Badge>
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
                        <Typography className="logo" sx={{ fontFamily: "Comfortaa, sans-serif" }} >
                            Uniegle<sup className="logo-sup">®</sup>
                        </Typography>
                        <div className="status-div">
                            <PublicIcon className="icon" />
                            <Typography 
                                    className="status-text"
                                    variant="body1" 
                                >
                            {statusMessages[status]?.map((message, index) => (
                                <Fragment key={index}>
                                    {message}
                                    <br/>
                                </Fragment>
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
                    mute={mute}
                    onClickMute={onClickMute}
                    isTyping={isTyping}
                    message={message}
                    setMessage={setMessage}
                    socket={socket} />}
                    
                    <div className="buttons-div">
                        <Button className="button" color="error" variant="contained" size="large" fullWidth onClick={onClickStopChat}>
                                Interrompi
                                <StopCircleIcon className="button-icon"/>
                        </Button>
                        <Button className="button" color="warning" variant="contained" size="large" fullWidth onClick={onClickSkip} disabled={disabledChat}>
                            Skip
                            <SkipNextIcon className="button-icon"/>
                        </Button>
                    </div>
                </div>

                <Drawer
                    anchor="bottom"
                    open={openDrawer}
                    onClose={() => setOpenDrawer(false)}
                    PaperProps={{ style: { height: "52%", borderRadius: "15px 15px 0 0",overflow:'hidden' } }}
                >
                    <div className="close-drawer">
                        <IconButton className="icon-button" onClick={() => setOpenDrawer(false)}>
                            <CloseIcon className="icon" />
                        </IconButton>
                    </div>
                    <div style={{ padding: "10px", display: "flex", flexDirection: "column", height: "100%" }}>
                        <TextChat
                            messages={messages}
                            setMessages={setMessages}  
                            disabledChat={disabledChat}
                            partnerData={request ? request : {}}
                            myData={userData}
                            socket={socket} 
                            mute={mute}
                            isTyping={isTyping}
                            message={message}
                            setMessage={setMessage}
                            onClickMute={onClickMute}
                        />
                    </div>
                </Drawer>

            </div>
        </div>
    )

}

export default Chat;