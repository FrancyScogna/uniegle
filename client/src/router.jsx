import { io } from "socket.io-client";
import { Route, Routes } from "react-router-dom";
import MainApp from "./MainApp";
import Preview from "./pages/Preview/Preview";
import SetUserData from "./pages/SetUserData/SetUserData";
import Chat from "./pages/Chat/Chat";
import { useEffect, useState } from "react";
import Loading from "./component/Loading/Loading";

const socket = io("http://localhost:4000", {
  transports: ["websocket"],
  secure: true,
});

const RouterApp = () => {
  const [connection, setConnection] = useState(false);

  useEffect(() => {
    socket.on("connect", () => {
      setConnection(true);
    });

    socket.on("disconnect", () => {
      setConnection(false);
    });
  }, []);

  if (!connection) {
    return (
      <Loading
        loading={!connection}
        subtitle={"Connessione al server in corso..."}
        successMessage="Connesso al server con successo!"
      />
    );
  }

  return (
    <Routes>
      <Route path="/" element={<MainApp />}>
        <Route path="/" element={<Preview />} />
        <Route path="/user-profile" element={<SetUserData />} />
        <Route path="/chat" element={<Chat socket={socket} />} />
      </Route>
    </Routes>
  );
};

export default RouterApp;
