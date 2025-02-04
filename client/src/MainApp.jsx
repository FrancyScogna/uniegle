import { Outlet } from "react-router-dom";
import "./MainApp.css";

function MainApp() {

    return (
        <div className="main-div">
            <div className="page-div">
                <Outlet />
            </div>
        </div>
    );
}

export default MainApp;