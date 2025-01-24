import { useNavigate } from "react-router-dom";
import "./SetUserData.css";
import { useEffect, useState } from "react";
import UploadPhoto from "../../component/UploadPhoto/UploadPhoto";

function SetUserData(){

    //Inizializzazione variabili
    const navigate = useNavigate();

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
        let userDataTmp = userData;
        userDataTmp = {...userData, nickname: e.target.value};
        localStorage.setItem("userData", JSON.stringify(userDataTmp));
        setNickname(e.target.value);
    }

    //Funzione: apre il dialog per l'upload della foto
    const onClickUploadPhoto = (e) => {
        setOpenUploadPhoto(true);
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
        <div style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
            <h1>Inserisci le informazioni</h1>
            <h3>Inserisci un nickname e un immagine che ti rappresenta.</h3>
            <br />

            <h5>Nickname</h5>
            <input type="text" placeholder="Inserisci un nickname..." onChange={onChangeNickname} value={nickname} />
        
            <h5>Immagine</h5>
            <img src={image} style={{backgroundColor: "gray", maxWidth: "200px", marginTop: "5px"}} />
            <button onClick={onClickUploadPhoto}>Inserisci immagine</button>
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

            <button onClick={onClickReset}>Reset</button>
            <button onClick={onClickChat} disabled={!image || !nickname}>Prosegui</button>   

        </div>
    )
}

export default SetUserData;