import { io } from 'socket.io-client';
import { Route, Routes } from "react-router-dom";
import MainApp from "./MainApp";
import Preview from "./pages/Preview/Preview";
import SetUserData from "./pages/SetUserData/SetUserData";
import Chat from "./pages/Chat/Chat";

const socket = io('http://localhost:4000');

const RouterApp = () => {

  return (
      <Routes>
        <Route path="/" element={<MainApp />}>
          {/*<Route path="*" element={<Preview />} />*/}
          <Route path="/" element={<Preview />} />
          <Route path="/user-profile" element={<SetUserData />} />
          <Route path="/chat" element={<Chat socket={socket} />} />
        </Route>
      </Routes>
  );
};

export default RouterApp;
