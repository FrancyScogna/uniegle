import { useEffect, useRef, useState } from "react";
import "./TakePhoto.css";
import { compressBase64Image } from "../../libs/image_manipulation";
import { Button, CircularProgress, Dialog, DialogContent, DialogTitle, Divider, FormControl, IconButton, InputLabel, MenuItem, Select, Typography, useMediaQuery } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import CameraswitchIcon from '@mui/icons-material/Cameraswitch';

function TakePhoto({ setImage, openTakePhoto, setOpenTakePhoto }) {

    const mobile = useMediaQuery("(max-width: 800px)")

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
            setCameraStatus("on");
        } catch (error) {
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

    const statusMessages = {
        "no devices": {
            message: "Dispositivi non trovati. Controlla le periferiche e riprova."
        },
        "permission denied": {
            message: "Non hai dato i permessi per accedere alla fotocamera. Dai i permessi tramite il browser e riprova."
        },
        "error": {
            message: "Si è verificato un errore con la fotocamera."
        }
    };

    return (
        <Dialog className="takephoto-dialog" open={openTakePhoto} onClose={stopCameraAndClose} fullScreen={mobile} fullWidth>
            {!mobile && <DialogTitle className="dialog-title">
                <div className="top">
                    <Typography variant="h5" className="title">
                        Scatta una foto
                    </Typography>
                    <IconButton className="icon-button" onClick={stopCameraAndClose}>
                        <CloseIcon />
                    </IconButton>
                </div>
                <Divider className="divider" textAlign="left" />
            </DialogTitle>}
            {mobile && 
            <div className="mobile-title-div">
                <IconButton className="icon-button" onClick={stopCameraAndClose}>
                    <CloseIcon className="icon" />
                </IconButton>
            </div>}
            <DialogContent className="dialog-content">
                <video ref={videoRef} style={{height: cameraStatus !== "on" ? "0px" : mobile && "100%"}} />
                <div className="status-div" style={{height: cameraStatus === "on" && "0px"}}>
                {cameraStatus === "loading" && <CircularProgress />}
                    {statusMessages[cameraStatus] && (
                        <div className="internal-status">
                            <Typography className="status">{statusMessages[cameraStatus].message}</Typography>
                            <Button variant="outlined" onClick={getDevices}>Riprova</Button>
                        </div>
                    )}
                </div>

                {!mobile && 
                <div className="desktop-buttons">
                    {devices.length > 0 && (
                        <FormControl fullWidth>
                            <Select
                                value={selectedDeviceId}
                                onChange={handleDeviceChange}
                                size="small"
                                className="select"
                            >
                                {devices.map((device) => (
                                    <MenuItem key={device.deviceId} value={device.deviceId}>
                                        {device.label || `Camera ${device.deviceId}`}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    )}
                    <div>
                        <Button className="button-icon" onClick={takePhoto} disabled={cameraStatus !== "on"} size={mobile ? "small":"medium"} variant="contained">
                            Scatta
                            <PhotoCameraIcon className="button-icon" />
                        </Button>
                        <Button color="error" className="button-icon" disabled={cameraStatus !== "on"} size={mobile ? "small":"medium"} variant="contained" onClick={stopCameraAndClose}>
                            Chiudi Fotocamera
                            <CloseIcon className="button-icon" />
                        </Button>
                    </div>
                </div>}
                { mobile && 
                    <div className="mobile-buttons">
                        <IconButton onClick={takePhoto} className="icon-button-take" disabled={cameraStatus !== "on"}>
                            <PhotoCameraIcon className="icon" />
                        </IconButton>
                        <IconButton onClick={changeCameraButton} disabled={cameraStatus !== "on"} className="icon-button-change">
                            <CameraswitchIcon className="icon" />
                        </IconButton>
                    </div>
                }
                
                <canvas ref={canvasRef} style={{ display: "none" }} />
            </DialogContent>
        </Dialog>
    );
}

export default TakePhoto;
