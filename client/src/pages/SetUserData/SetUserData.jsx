import { useNavigate } from "react-router-dom";
import "./SetUserData.css";
import { useEffect, useState } from "react";
import UploadPhoto from "../../component/UploadPhoto/UploadPhoto";
import { Button, Divider, TextField, Typography, useMediaQuery } from '@mui/material';
import EmptyImage from "../../assets/images-empty.png";

function SetUserData(){

    //Inizializzazione variabili
    const navigate = useNavigate();
    const mobile = useMediaQuery("(max-width: 800px)")

    const [userData, setUserData] = useState({});
    const [nickname, setNickname] = useState("");
    const [openUploadPhoto, setOpenUploadPhoto] = useState(false);
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(true);

    //useEffect: preleva i dati dell'utente dal localstorage se presenti
    useEffect(() => {
        const userDataJSON = localStorage.getItem("userData");
        const userData = JSON.parse(userDataJSON);
        if(userData){
            setUserData(userData);
            setImage(userData.imgSrc);
            setNickname(userData.nickname);
        }
        setLoading(false);
    },[]);

    //Funzione: quando cambia l'imput del nickname imposta la variabile
    const onChangeNickname = (e) => {
        setNickname(e.target.value);
    }

    //Funzione: apre il dialog per l'upload della foto
    const onClickUploadPhoto = (e) => {
        setOpenUploadPhoto(true);
    }

    const onClickRemoveImage = () => {
        setImage(null);
        if(nickname){
            const userData = {nickname: nickname};
            localStorage.setItem("userData", JSON.stringify(userData));
        }else{
            localStorage.setItem("userData", JSON.stringify({}));
        }
    }

    //Funzione: imposta i dati immessi dall'utente e li inserisce nel localstorage
    const onClickChat = () => {
        if(image && nickname){
            const userData = {
                imgSrc: image,
                nickname
            }
            localStorage.setItem("userData", JSON.stringify(userData))
        }
        navigate("/chat");
    }

    //Funzione: elimina i dati dal local storage e resetta le variabili
    const onClickReset = () => {
        localStorage.removeItem("userData");
        setNickname("");
        setImage(null);
    }

    if(loading){
        return(
            <div>
                <h1>Loading...</h1>
            </div>
        )
    }

    return(
        <div className="setuserdata-div">
            <Typography variant="h3" className="title">Informazioni utente</Typography>

            <div className="form-div">

                <Typography className="form-title">Imposta i tuoi dati</Typography>

                <div className="description-div">
                    <Typography className="description" >
                        Scegli un nickname e carica una foto che ti rappresenti.
                        Queste informazioni saranno visibili all'utente con cui verrai abbinato,
                        permettendogli di decidere se accettare o meno la tua richiesta di connessione.
                    </Typography>
                </div>

                <Divider className="divider" textAlign="left">
                    <Typography>Inserisci il nickname</Typography>
                </Divider>

                <TextField onChange={onChangeNickname} value={nickname} size="small" className="textfield" label="Nickname" />
            
                <Divider className="divider" textAlign="left">
                    <Typography>Inserisci un'immagine</Typography>
                </Divider>

                <div className="image-buttons-div">
                    <Button size={mobile ? "small":"medium"} variant="contained" onClick={onClickUploadPhoto} >Carica immagine</Button>
                    {image && (
                        <Button size={mobile ? "small":"medium"} color="error" variant="contained" onClick={onClickRemoveImage} >Elimina immagine</Button>
                    )}
                </div>

                <div className="selected-image-div">
                    <img src={image ? image : EmptyImage} style={{width: (!image && !mobile ) ? "400px":"100%"}}/>
                </div>
                
                {
                    openUploadPhoto && (
                        <UploadPhoto 
                            image={image} 
                            setImage={setImage} 
                            setOpenUploadPhoto={setOpenUploadPhoto} 
                            openUploadPhoto={openUploadPhoto}
                        />
                    )
                }

                <div className="main-buttons-div">
                    <Button size={mobile ? "small":"medium"} variant="contained" onClick={onClickChat} disabled={!image || !nickname} >Prosegui</Button>
                    <Button size={mobile ? "small":"medium"} color="error" variant="contained" onClick={onClickReset} >Elimina dati</Button>
                </div>

            </div>  
        </div>
    )
}

export default SetUserData;