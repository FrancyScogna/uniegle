import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:4000');

const Chat = ({setStep}) => {
    const [videoDevices, setVideoDevices] = useState([]);
    const [audioDevices, setAudioDevices] = useState([]);
    const [selectedVideoDevice, setSelectedVideoDevice] = useState('');
    const [selectedAudioDevice, setSelectedAudioDevice] = useState('');
    const [status, setStatus] = useState('In attesa di un partner...');
    const [userData, setUserData] = useState({});
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState('');
    const localVideoRef = useRef();
    const remoteVideoRef = useRef();
    const peerConnection = useRef(null);
    const localStream = useRef(null);

    useEffect(() => {
        const userDataJSON = localStorage.getItem("userData");
        const userData = JSON.parse(userDataJSON);
        if(!userData){
            setStep(1);
        }else{
            if(!userData.nickname || !userData.imgSrc){
                setStep(1);
            }else{
                setUserData(userData);
                socket.emit('user data', userData);
            }
        }
    },[])

    console.log(userData);

    useEffect(() => {

        const getDevices = async () => {
          const devices = await navigator.mediaDevices.enumerateDevices();
          const videoinput = devices.filter((device) => device.kind === 'videoinput');
          const audioinput = devices.filter((device) => device.kind === 'audioinput')
          setVideoDevices(videoinput);
          setAudioDevices(audioinput);

          return {
            videoinput,
            audioinput
          }
        };

        const setLocalStreamData = async () => {

          const {videoinput, audioinput} = getDevices();

          if (localStream.current) {
            localStream.current.getTracks().forEach((track) => track.stop());
          }
      
          const stream = await navigator.mediaDevices.getUserMedia({
              video: { deviceId: videoinput ? { exact: videoinput } : undefined },
              audio: { deviceId: audioinput ? { exact: audioinput } : undefined },
          });
      
          localStream.current = stream;
          localVideoRef.current.srcObject = stream;
        }

        setLocalStreamData();

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

        socket.on('signal', async (data) => {
            if (data.candidate) {
                await peerConnection.current.addIceCandidate(data.candidate);
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
            setStatus('Connesso con un partner!');
            await startStream(selectedVideoDevice, selectedAudioDevice);
        });

        socket.on('partner disconnected', () => {
            setStatus('Il partner si è disconnesso. In attesa di un nuovo partner...');
            remoteVideoRef.current.srcObject = null;
        });

        socket.on('chat message', (msg) => {
            setMessages((prevMessages) => [...prevMessages, { sender: 'partner', text: msg }]);
        });

        return () => {
            socket.off('signal');
            socket.off('paired');
            socket.off('partner disconnected');
            socket.off('chat message');
        };
    }, []);

    const startStream = async (videoDeviceId, audioDeviceId) => {
        if (localStream.current) {
            localStream.current.getTracks().forEach((track) => track.stop());
        }

        const stream = await navigator.mediaDevices.getUserMedia({
            video: { deviceId: videoDeviceId ? { exact: videoDeviceId } : undefined },
            audio: { deviceId: audioDeviceId ? { exact: audioDeviceId } : undefined },
        });

        localStream.current = stream;
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

    const sendMessage = (e) => {
        e.preventDefault();
        if (message.trim()) {
            socket.emit('chat message', message);
            setMessages((prevMessages) => [...prevMessages, { sender: 'me', text: message }]);
            setMessage('');
        }
    };

    const onClickIndietro = () => {
        const stream = localVideoRef.current.srcObject;
        if (stream) {
            const tracks = stream.getTracks();
            tracks.forEach((track) => track.stop());
        }
        setStep(1);
    }

    return (
        <div>
            <button onClick={onClickIndietro}>Indietro</button>
            <h1>Chat Video e Testuale Randomica (Stile Omegle)</h1>
            <p>{status}</p>

            <div style={{ marginBottom: '10px' }}>
                <label>Seleziona Webcam: </label>
                <select
                    value={selectedVideoDevice}
                    onChange={(e) => {
                        setSelectedVideoDevice(e.target.value);
                        startStream(e.target.value, selectedAudioDevice);
                    }}
                >
                    {videoDevices.map((device) => (
                        <option key={device.deviceId} value={device.deviceId}>
                            {device.label || `Webcam ${device.deviceId}`}
                        </option>
                    ))}
                </select>
            </div>

            <div style={{ marginBottom: '10px' }}>
                <label>Seleziona Microfono: </label>
                <select
                    value={selectedAudioDevice}
                    onChange={(e) => {
                        setSelectedAudioDevice(e.target.value);
                        startStream(selectedVideoDevice, e.target.value);
                    }}
                >
                    {audioDevices.map((device) => (
                        <option key={device.deviceId} value={device.deviceId}>
                            {device.label || `Microfono ${device.deviceId}`}
                        </option>
                    ))}
                </select>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <div>
                    <h2>Il tuo video</h2>
                    <video playsInline ref={localVideoRef} autoPlay muted style={{ width: '300px', border: '1px solid black' }}></video>
                </div>
                <div>
                    <h2>Video del partner</h2>
                    <video playsInline ref={remoteVideoRef} autoPlay style={{ width: '300px', border: '1px solid black' }}></video>
                </div>
            </div> 

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
                />
                <button type="submit">Invia</button>
            </form>
        </div>
    );
};

export default Chat;
