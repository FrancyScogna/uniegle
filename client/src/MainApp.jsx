import { Outlet, useLocation } from "react-router-dom";
import "./MainApp.css";
import { Typography, useMediaQuery } from "@mui/material";
import "@fontsource/comfortaa";
import { useEffect, useState } from "react";
function MainApp() {

    const mobile = useMediaQuery('(max-width:550px)');
    const location = useLocation();
    const [showHeader, setShowHeader] = useState(false);
    const [showFooter, setShowFooter] = useState(false);

    useEffect(() => {
        const path = location.pathname;
        if(mobile){
            if(path === "/"){
                setShowHeader(false);
                setShowFooter(true);
            }
            if(path === "/user-profile"){
                setShowHeader(true);
                setShowFooter(true);
            }
            if(path === "/chat"){
                setShowHeader(false);
                setShowFooter(false);
            }
        }else{
            if(path === "/"){
                setShowHeader(false);
                setShowFooter(true);
            }
            if(path === "/user-profile"){
                setShowHeader(true);
                setShowFooter(true);
            }
            if(path === "/chat"){
                setShowHeader(true);
                setShowFooter(true);
            }
        }
    },[location])

    return (
        <div className="main-div">
            {showHeader &&
                <div className="header">
                    <Typography onClick={() => window.location.href="/"} className="logo" sx={{ fontFamily: "Comfortaa, sans-serif" }} >
                        Uniegle<sup className="logo-sup">®</sup>
                    </Typography>
                </div>
            }
            <div className="page-div" style={{marginTop: !showHeader && "0px"}}>
                <Outlet />
            </div>
            {showFooter &&
                <div className="footer">
                    <div className="authors">
                        <Typography className="text">
                            Francesco Scognamiglio M63001364
                        </Typography>
                        <Typography className="text">
                            Felice Micillo M63001377
                        </Typography>
                    </div>
                    <div className="company" >
                        <Typography className="text">Powered by Uniegle <sup className="logo-sup">®</sup></Typography>
                    </div>
                </div>
            }
        </div>
    );
}

export default MainApp;