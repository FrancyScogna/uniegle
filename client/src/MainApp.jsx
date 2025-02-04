import { Outlet } from "react-router-dom";
import "./MainApp.css";

function MainApp() {

    return (
        <div className="main-div">
            <div className="header-div">
                <h1>Header</h1>
            </div>
            <div className="page-div">
                <Outlet />
            </div>
            <div className="footer-div">
                <h1>Footer</h1>
            </div>
        </div>
    );
}

export default MainApp;