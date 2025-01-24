import { useEffect, useRef, useState } from "react";
import "./TakePhoto.css";
import { compressBase64Image } from "../../libs/image_manipulation";

function TakePhoto({ setImage, openTakePhoto, setOpenTakePhoto }) {

    //Inizializzazione delle variabili
    const [devices, setDevices] = useState([]);
    const [selectedDeviceIndex, setSelectedDeviceIndex] = useState(0);
    const [selectedDeviceId, setSelectedDeviceId] = useState(null);
    const [cameraStatus, setCameraStatus] = useState("loading");
    const videoRef = useRef();
    const canvasRef = useRef();

    //useEffect: all'apertura del dialog richiede il permesso e ottiene i dispositivi di
    //tipo video per scattare la foto. Alla chiusura del dialog, stoppa l'esecuzione della
    //fotocamera attiva.
    useEffect(() => {
        if (openTakePhoto) {
            getDevices();
        }else{
            stopCameraAndClose();
        }
    }, [openTakePhoto]);

    //Funzione: ottenimento dei dispositivi e impostazione delle variabili per il select
    //e per il pulsante di cambio fotocamera e avvio della fotocamera.
    const getDevices = async () => {
        try {
            setCameraStatus("loading");
            await navigator.mediaDevices.getUserMedia({ video: true });
            const deviceInfos = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = deviceInfos.filter((device) => device.kind === "videoinput");
            setDevices(videoDevices);
    
            if (videoDevices.length > 0) {
                setSelectedDeviceIndex(0);
                setSelectedDeviceId(videoDevices[0].deviceId);
                await startCamera(videoDevices[0].deviceId); // Attendo la fotocamera
            }else{
                setCameraStatus("no devices");
            }
            console.log("Camera status: all done.");
            setCameraStatus("on");
        } catch (error) {
            console.log(error)
            if(error.message === "Permission denied"){
                setCameraStatus("permission denied");
            }else{
                if(error.message === "Requested device not found"){
                    setCameraStatus("no devices");
                }else{
                    setCameraStatus("error");
                }
            }
        }
    };

    //Funzione: avvio della fotocamera in base alla fotocamera selezionata e impostazione
    //del componente video html con la stream della fotocamera
    const startCamera = async (deviceId) => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { deviceId: deviceId ? { exact: deviceId } : undefined },
            });
            videoRef.current.srcObject = stream;
            videoRef.current.play();
        } catch (error) {
            throw error;
        }
    };

    //Funzione: stop della fotocamera, viene resettato il componente video e viene chiuso
    //il dialog.
    const stopCameraAndClose = () => {
        const stream = videoRef.current.srcObject;
        if (stream) {
            const tracks = stream.getTracks();
            tracks.forEach((track) => track.stop());
        }
        setOpenTakePhoto(false);
    };

    //Funzione: imposta la fotocamera 
    const stopCamera = () => {
        const stream = videoRef.current.srcObject;
        if (stream) {
            const tracks = stream.getTracks();
            tracks.forEach((track) => track.stop());
        }
    }

    //Funzione: cambia la fotocamera cliccando il bottone per il cambio della fotocamera
    //avviene in maniera circolare.
    const changeCameraButton = () => {
        if (devices.length > 0) {
            stopCamera();
            const nextIndex = (selectedDeviceIndex + 1) % devices.length;
            setSelectedDeviceIndex(nextIndex);
            setSelectedDeviceId(devices[nextIndex].deviceId)
            startCamera(devices[nextIndex].deviceId);
        }
    };

    //Funzione: scatto della foto e impostazione dell'immagine scattata e chiusura del dialog
    const takePhoto = async () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const image = await compressBase64Image(canvas.toDataURL("image/jpeg"));
        setImage(image);
        stopCameraAndClose();
    };

    //Funzione: sensibile al select, imposta le variabili per il cambio della fotocamera
    const handleDeviceChange = (event) => {
        const deviceId = event.target.value;
        const index = devices.findIndex((device) => device.deviceId === deviceId);
        if(index !== -1){
            setSelectedDeviceIndex(index);
        }
        setSelectedDeviceId(deviceId);
        stopCamera();
        startCamera(deviceId);
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", border: "1px solid blue" }}>
                <>
                    <video
                        ref={videoRef}
                        style={{
                            width: "300px",
                            display: "block",
                            marginBottom: "10px",
                        }}
                    />
                    {
                        cameraStatus === 'loading' && (
                            <div>Loading...</div>
                        )
                    }
                    {
                        cameraStatus === 'no devices' && (
                            <div>
                                Dispositivi non trovati. Controlla le periferiche e clicca riprova.
                                <button onClick={getDevices}>Riprova</button>
                            </div>
                        )
                    }
                    {
                        cameraStatus === 'permission denied' && (
                            <div>
                                Non hai dato i permessi per accedere alla fotocamera.
                                Dai i permessi tramite il browser e clicca riprova.
                                <button onClick={getDevices}>Riprova</button>
                            </div>
                        
                        )
                    }
                    {
                        cameraStatus === 'error' && (
                            <div>Si è verificato un errore con la fotocamera.</div>
                        )
                    }

                    {devices.length > 0 && (
                        <select value={selectedDeviceId} onChange={handleDeviceChange}>
                            {devices.map((device) => (
                                <option key={device.deviceId} value={device.deviceId}>
                                    {device.label || `Camera ${device.deviceId}`}
                                </option>
                            ))}
                        </select>
                    )}
                    <button onClick={takePhoto} disabled={cameraStatus !== "on"}>Scatta</button>
                    <button onClick={changeCameraButton} disabled={cameraStatus !== "on"}>Cambia</button>
                    <button onClick={stopCameraAndClose} disabled={cameraStatus !== "on"}>Chiudi Fotocamera</button>
                </>
            <canvas ref={canvasRef} style={{ display: "none" }} />
        </div>
    );
}

export default TakePhoto;
