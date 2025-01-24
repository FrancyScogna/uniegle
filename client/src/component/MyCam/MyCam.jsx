import { useEffect, useState } from "react";
import "./MyCam.css";

function MyCam({localVideoRef, startStream, selectedVideoDevice, selectedAudioDevice, setSelectedVideoDevice, setSelectedAudioDevice}){

    const [videoDevices, setVideoDevices] = useState([]);
    const [audioDevices, setAudioDevices] = useState([]);
    const [selectedVideoDeviceIndex, setSelectedVideoDeviceIndex] = useState(0);
    

    const getDevices = async () => {
        await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
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

    const startCamera = async () => {
        try {
            const {videoinput, audioinput} = getDevices();
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { deviceId: videoinput ? { exact: videoinput } : undefined },
                audio: { deviceId: audioinput ? { exact: audioinput } : undefined },
            });
            localVideoRef.current.srcObject = stream;
            localVideoRef.current.play();
        } catch (error) {
            throw error;
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
        <div>
            <div>
                <video 
                playsInline ref={localVideoRef} 
                autoPlay 
                muted 
                style={{ width: '100%', height: "400px", border: '1px solid black' }} />
            </div>
            <div style={{ marginBottom: '10px' }}>
                <label>Seleziona Webcam: </label>
                <select
                    value={selectedVideoDevice}
                    onChange={(e) => {
                        const index = videoDevices.findIndex(device => device.deviceId === e.target.value);
                        setSelectedVideoDeviceIndex(index);
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
                <button onClick={changeCameraButton}>Cambia</button>
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
        </div>
    )

}

export default MyCam;