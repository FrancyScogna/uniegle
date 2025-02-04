import { useNavigate } from "react-router-dom";
import "./Preview.css";
import { useEffect } from "react";

function Preview(){

    //Definizione variabili
    const navigate = useNavigate();

    //Funzione: naviga sul path /user-profile
    const onClickStartChat = () => {
        navigate("/user-profile", {replace: true});
    }

    //useEffect: imposta il path a '/' appena si renderizza la pagina
    useEffect(() => {
        window.history.pushState({}, '', '/');
    },[])

    return(
        <div className="preview-div">
            <h1>Presentazione</h1>
            <h3>Descrizione applicazione</h3>
            <button onClick={onClickStartChat}>Inizia a chattare</button>
        </div>
    );

}

export default Preview;