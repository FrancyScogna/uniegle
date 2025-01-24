import { useEffect, useRef, useState } from "react";
import { compressBase64Image } from "../../libs/image_manipulation";
import "./UploadPhoto.css";
import TakePhoto from "../TakePhoto/TakePhoto";

function UploadPhoto({image, setImage, setOpenUploadPhoto, openUploadPhoto}){

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
        <div style={{marginTop: "20px", border: "1px solid red", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center"}}>
            <button onClick={onClickClose}>Chiudi</button>
            <h1>Carica un'immagine oppure scatta una foto.</h1>
            <img src={newImage} style={{backgroundColor: "gray", maxWidth: "200px", marginTop: "5px"}} />

            <div>
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{display: "none"}}
                    ref={inputFileRef}
                />
                <button onClick={() => inputFileRef.current.click()}>Carica foto</button>
                {
                    openTakePhoto &&
                    (
                        <TakePhoto setOpenTakePhoto={setOpenTakePhoto} openTakePhoto={openTakePhoto} setImage={setNewImage} />
                    )
                }
                <button onClick={onClickTakePhoto}>Scatta foto</button>
            </div>
            <div>
                <button onClick={onClickDeletePhoto}>Elimina foto</button>
                <button onClick={onClickConfirm}>Conferma</button>
            </div>
        </div>
    )
}

export default UploadPhoto;