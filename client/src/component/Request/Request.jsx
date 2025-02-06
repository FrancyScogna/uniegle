import React from "react";
import {
    Button,
    Dialog,
    DialogContent,
    DialogTitle,
    Divider,
    Typography,
    Slide,
    IconButton,
    useMediaQuery
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});
import "./Request.css"
function Request({ request, setRequest, setOpenRequest, socket, openRequest }) {
    const mobile = useMediaQuery("(max-width: 550px)")
    const onClickAcceptRequest = () => {
        socket.emit('accept');
        setOpenRequest(false);
    };

    const onClickRejectRequest = () => {
        setRequest(null);
        setOpenRequest(false);
        socket.emit('reject');
    };

    return (
        <Dialog
            className="request-dialog"
            open={openRequest}
            onClose={() => setOpenRequest(false)}
            TransitionComponent={Transition}
            fullWidth
            fullScreen={mobile}
        >
            <DialogTitle className="dialog-title">
                <div className="top">
                    <Typography variant="h5" className="title">
                        Nuova Richiesta
                    </Typography>
                    <IconButton className="icon-button" onClick={onClickRejectRequest}>
                        <CloseIcon />
                    </IconButton>
                </div> 
                <Divider className="divider" />
            </DialogTitle>

            <DialogContent className="dialog-content">
                    <div className="selected-image-div">
                         <img 
                        src={request?.userData?.imgSrc} 
                        alt="guest" 
                      
                    /> 
                    </div>
                  
                    <Typography variant="body1">
                        {request?.userData?.nickname} vuole connettersi con te
                    </Typography>

                    <div style={{ marginTop: "15px", display: "flex", gap: "10px" }}>
                        <Button variant="contained" color="primary" onClick={onClickAcceptRequest}>
                            Accetta
                        </Button>
                        <Button variant="contained" color="error" onClick={onClickRejectRequest}>
                            Rifiuta
                        </Button>
                    </div>

            </DialogContent>
        </Dialog>
    );
}

export default Request;
