import { Outlet } from "react-router-dom";
import "./MainApp.css";

function MainApp() {

    return (
        <div className="main-div">
            <h1>UNIEGLE</h1>
            <div className="page-div">
                <Outlet />
            </div>
        </div>
    );
}

export default MainApp;