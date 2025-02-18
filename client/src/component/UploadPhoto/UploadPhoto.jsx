import { useEffect, useRef, useState } from "react";
import { compressBase64Image } from "../../libs/image_manipulation";
import "./UploadPhoto.css";
import TakePhoto from "../TakePhoto/TakePhoto";
import { Alert, Button, Dialog, DialogContent, DialogTitle, Divider, IconButton, Typography, useMediaQuery } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import EmptyImage from "../../assets/images-empty.png";
import InsertPhotoIcon from '@mui/icons-material/InsertPhoto';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';

function UploadPhoto({image, setImage, setOpenUploadPhoto, openUploadPhoto}){

    const mobile = useMediaQuery("(max-width: 800px)")

    //Inizializzazione delle variabili
    const inputFileRef = useRef();
    const [newImage, setNewImage] = useState(null);
    const [openTakePhoto, setOpenTakePhoto] = useState(false);

    //useEffect: sensibile alla variabile booleana per l'apertura del dialog,
    //imposta l'immagine temporanea per la modifica con l'immagine prelevata
    //in precedenza dal localstorage
    useEffect(() => {
        if(openUploadPhoto){
            setNewImage(image);
        }
    },[openUploadPhoto])

    //Funzione: associata all'input (invisibile) per selezionare l'immagine
    const handleImageUpload = (event) => {
        event.preventDefault();
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = async (e) => {
                setNewImage(await compressBase64Image(e.target.result));
            };
            reader.readAsDataURL(file);
        }
    };

    //Funzione: chiude il dialog per il caricamento di una foto senza apportare modifiche
    const onClickClose = () => {
        setOpenUploadPhoto(false);
    }

    //Funzione: apertura del dialog per scattare una foto
    const onClickTakePhoto = () => {
        setOpenTakePhoto(true);
    }

    //Funzione: elimina la foto temporanea
    const onClickDeletePhoto = () => {
        setNewImage(null);
    }

    //Funzione: conferma la procedura e imposta l'immagine originale con quella temporanea
    //inoltre inserisce nel localstorage l'url dell'immagine selezionata e chiude il dialog
    const onClickConfirm = () => {
        setImage(newImage);
        const userDataJSON = localStorage.getItem("userData");
        let userData = JSON.parse(userDataJSON);
        userData = {...userData, imgSrc: newImage};
        localStorage.setItem("userData", JSON.stringify(userData))
        setOpenUploadPhoto(false);
    }

    return(
        <Dialog className="uploadphoto-dialog" open={openUploadPhoto} onClose={onClickClose} fullScreen={mobile} fullWidth>
            <DialogTitle className="dialog-title">
                <div className="top">
                    <Typography variant="h5" className="title">
                        Carica immagine
                    </Typography>
                    <IconButton className="icon-button" onClick={onClickClose}>
                        <CloseIcon />
                    </IconButton>
                </div>
                <Divider className="divider" textAlign="left" />
            </DialogTitle>
            <DialogContent className="dialog-content">

                <div className="content">

                    <Alert severity="info" className="description">
                    Carica un'immagine direttamente dal tuo dispositivo oppure scatta una foto in tempo reale.
                    </Alert>

                    <div className="top-buttons">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            style={{display: "none"}}
                            ref={inputFileRef}
                        />
                        <Button size={mobile ? "small":"medium"} variant="contained" onClick={() => inputFileRef.current.click()}>
                            Carica foto
                            <InsertPhotoIcon className="button-icon" />
                        </Button>
                        {
                            openTakePhoto &&
                            (
                                <TakePhoto setOpenTakePhoto={setOpenTakePhoto} openTakePhoto={openTakePhoto} setImage={setNewImage} />
                            )
                        }
                        <Button size={mobile ? "small":"medium"} variant="contained" onClick={onClickTakePhoto}>
                            Scatta foto
                            <PhotoCameraIcon className="button-icon" />
                        </Button>
                        <Button size={mobile ? "small":"medium"} variant="contained" color="error"  onClick={onClickDeletePhoto}>
                            Elimina foto
                            <DeleteIcon className="button-icon"/>
                        </Button>
                    </div>

                    <div className="selected-image-div">
                        <img src={newImage ? newImage : EmptyImage} style={{width: (!newImage && !mobile ) ? "400px":"100%"}}/>
                    </div>

                    <Button size={mobile ? "small":"medium"} variant="contained" onClick={onClickConfirm}>
                        Conferma
                        <SaveIcon className="button-icon"/>
                    </Button>
                    
                </div>

            </DialogContent>
        </Dialog>
    )
}

export default UploadPhoto;