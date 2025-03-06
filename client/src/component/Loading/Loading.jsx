import { Backdrop, Typography } from "@mui/material";
import "./Loading.css";

function Loading({loading, subtitle}){
    return(
        <Backdrop open={loading}>
            <div className="loading-backdrop-div">
                <Typography className="loading-backdrop-logo" sx={{ fontFamily: "Comfortaa, sans-serif" }} >
                    Uniegle<sup className="loading-backdrop-logo-sup">®</sup>
                </Typography>
                <Typography className="message" sx={{ fontFamily: "Comfortaa, sans-serif" }}>
                    {subtitle}
                </Typography>
            </div>
        </Backdrop>
    )
}

export default Loading;