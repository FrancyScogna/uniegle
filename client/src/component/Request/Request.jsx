import "./Request.css";

function Request({request, setRequest, setOpenRequest, socket}){

    const onClickAcceptRequest = () => {
        socket.emit('accept');
    }

    const onClickRejectRequest = () => {
        setRequest(null);
        setOpenRequest(false);
        socket.emit('reject');
    }

    return(
        <div style={{display: "flex", width: "100%", flexDirection: "column"}}>
            <h1>Request</h1>
            <img src={request.userData.imgSrc} alt="guest" style={{maxWidth: "300px"}}/>
            {request.userData.nickname} si vuole connetere, accettare o rifiutare...
            <div>
                <button onClick={onClickAcceptRequest}>Accept</button>
                <button onClick={onClickRejectRequest}>Reject</button>
            </div>
        </div>
    )

}

export default Request;