import { useEffect, useRef, useState } from "react";
import "./MyCam.css";
import { FormControl, IconButton, MenuItem, Select, Typography, useMediaQuery } from "@mui/material";
import VideocamIcon from '@mui/icons-material/Videocam';
import MicIcon from '@mui/icons-material/Mic';
import CameraswitchIcon from '@mui/icons-material/Cameraswitch';

function MyCam({localVideoRef, startStream, selectedVideoDevice, selectedAudioDevice, setSelectedVideoDevice, setSelectedAudioDevice}){

    const [videoDevices, setVideoDevices] = useState([]);
    const [audioDevices, setAudioDevices] = useState([]);
    const [selectedVideoDeviceIndex, setSelectedVideoDeviceIndex] = useState(0);
    const [showDevices, setShowDevices] = useState(false);
    const mobile = useMediaQuery("(max-width: 550px)")

    const getDevices = async () => {
        await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoinput = devices.filter((device) => device.kind === 'videoinput');
        const audioinput = devices.filter((device) => device.kind === 'audioinput')
        if(videoinput.length > 0){
            setSelectedVideoDeviceIndex(0);
            setSelectedVideoDevice(videoinput[0].deviceId);
        }

        if(audioinput.length > 0){
            setSelectedAudioDevice(audioinput[0].deviceId);
        }
        setVideoDevices(videoinput);
        setAudioDevices(audioinput);

        return {
          videoinput,
          audioinput
        }
    };

    const startCamera = async () => {
        try {
            const devices = await getDevices();
    
            if (devices.videoinput.length === 0) {
                console.error("Nessuna webcam trovata.");
                return;
            }
    
            if (devices.audioinput.length === 0) {
                console.warn("Nessun microfono trovato. Procedo solo con il video.");
            }
    
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { deviceId: { exact: devices.videoinput[0].deviceId } },
                audio: devices.audioinput.length > 0 ? { deviceId: { exact: devices.audioinput[0].deviceId } } : false,
            });
    
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
                localVideoRef.current.play();
            }
    
        } catch (error) {
            console.error("Errore nell'avvio della fotocamera:", error);
        }
    };
    

    const changeCameraButton = () => {
        if (videoDevices.length > 0) {
            const nextIndex = (selectedVideoDeviceIndex + 1) % videoDevices.length;
            setSelectedVideoDeviceIndex(nextIndex);
            setSelectedVideoDevice(videoDevices[nextIndex].deviceId)
            startStream(videoDevices[nextIndex].deviceId, selectedAudioDevice);
        }
    };

    useEffect(() => {
        startCamera();
    },[])

    return(
        <>
            <video 
            playsInline ref={localVideoRef} 
            autoPlay
            muted />
            <div className="wrap-devices-div" onMouseEnter={() => setShowDevices(true)} onMouseLeave={() => setShowDevices(false)}>
                {showDevices && !mobile && <div className="devices-div">
                    <FormControl fullWidth>
                        <Select
                            size="small"
                            value={selectedVideoDevice}
                            fullWidth
                            startAdornment={ <VideocamIcon className="icon" /> }
                            onChange={(e) => {
                                const index = videoDevices.findIndex(device => device.deviceId === e.target.value);
                                setSelectedVideoDeviceIndex(index);
                                setSelectedVideoDevice(e.target.value);
                                startStream(e.target.value, selectedAudioDevice);
                            }}
                            onClose={() => setShowDevices(false)}
                        >
                            {videoDevices.map((device) => (
                                <MenuItem key={device.deviceId} value={device.deviceId}>
                                    <Typography className="select-text" noWrap>
                                        {device.label || `Webcam ${device.deviceId}`}
                                    </Typography>
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl fullWidth>
                        <Select
                            value={selectedAudioDevice}
                            size="small"
                            startAdornment={ <MicIcon className="icon" /> }
                            onChange={(e) => {
                                setSelectedAudioDevice(e.target.value);
                                startStream(selectedVideoDevice, e.target.value);
                            }}
                            onClose={() => setShowDevices(false)}
                        >
                            {audioDevices.map((device) => (
                                <MenuItem key={device.deviceId} value={device.deviceId}>
                                    <Typography className="select-text" noWrap>
                                        {device.label || `Microfono ${device.deviceId}`}
                                    </Typography>
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </div>}
                {mobile && 
                <div className="change-camera-div">
                    <IconButton className="icon-button" onClick={changeCameraButton}>
                        <CameraswitchIcon className="icon" />
                    </IconButton>
                </div>}
            </div>
        </>
    )

}

export default MyCam;