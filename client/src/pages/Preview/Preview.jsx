import { useNavigate } from "react-router-dom";
import "./Preview.css";
import { useEffect } from "react";
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import logo from "../../assets/people.png";
import uniegle from "../../assets/logo.png" 
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
        <>
            <div className="uniegle-div">
                 <img src={uniegle} className="img-style"/>
            </div>
            <div className="preview-div"> 
                <div className="preview-organizer">
                    <Typography variant="h1">Incontra nuovi colleghi universitari</Typography>
                    <Typography variant="h2">Non perdere tempo! Conosci subito i tuoi nuovi colleghi e inizia a condividere esperienze.</Typography>
                    <Button className="button-start" variant="contained" sx={{}}onClick={onClickStartChat}>Inizia a chattare</Button>
                </div>  
                <div style={{flex:'1'}}></div>
                <div className="background-div">
                    <img src= {logo}/>
                </div>
            </div>     
           
        </>
    );

}

export default Preview;