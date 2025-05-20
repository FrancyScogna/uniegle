const express = require("express");
const https = require("https");
const { Server } = require("socket.io");

console.clear();

const app = express();
const server = https.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
  maxHttpBufferSize: 1e7,
});

const PORT = process.env.PORT || 4000;

let waitingUsers = [];
let activePairs = {};

io.on("connection", (socket) => {
  cleanWaitingUsers();

  printLogs("connection", socket.id);

  socket.on("user data", (userData) => {
    printLogs("user data", { id: socket.id, data: userData });
    socket.userData = userData;
    waitingUsers.push(socket.id);
    checkAndPairUsers();
  });

  socket.on("reject", () => {
    cleanWaitingUsers();
    const partner = activePairs[socket.id];

    if (partner) {
      io.to(partner.id).emit("rejected");
      io.to(socket.id).emit("rejected");
    }

    waitingUsers.push(partner.id);
    waitingUsers.push(socket.id);
    delete activePairs[socket.id];
    delete activePairs[partner.id];

    printLogs("requestrejected", socket.id);
    checkAndPairUsers();
  });

  socket.on("accept", () => {
    cleanWaitingUsers();

    const partner = activePairs[socket.id];
    activePairs[partner.id] = { ...activePairs[partner.id], accepted: true };

    if (partner) {
      printLogs("requestaccepted", { user1: socket.id, user2: partner.id });
      if (partner.accepted) {
        io.to(socket.id).emit("paired", {
          partner: partner.id,
          initiator: false,
        });
        io.to(partner.id).emit("paired", {
          partner: socket.id,
          initiator: true,
        });
        printLogs("successconnection", { user1: socket.id, user2: partner.id });
      } else {
        printLogs("waitingrequestaccepted", partner.id);
      }
    }
  });

  socket.on("signal", (data) => {
    const partner = activePairs[socket.id];
    if (partner.id) {
      io.to(partner.id).emit("signal", data);
    }
  });

  socket.on("chat message", (message) => {
    const partner = activePairs[socket.id];
    if (partner && partner.id) {
      const accept1 = activePairs[partner.id].accepted;
      const accept2 = activePairs[socket.id].accepted;
      if (accept1 && accept2) {
        io.to(partner.id).emit("chat message", message);
      }
    }
  });

  socket.on("typing", () => {
    const partner = activePairs[socket.id];
    if (partner && partner.id) {
      io.to(partner.id).emit("typing", socket.id);
    }
  });

  socket.on("stop typing", () => {
    const partner = activePairs[socket.id];
    if (partner && partner.id) {
      io.to(partner.id).emit("stop typing", socket.id);
    }
  });

  socket.on("disconnect", () => {
    exitOrDisconnect(socket);
  });

  socket.on("exit", () => {
    exitOrDisconnect(socket);
  });

  socket.on("skip", () => {
    cleanWaitingUsers();
    const partner = activePairs[socket.id];

    if (partner) {
      if (partner.id) {
        io.to(partner.id).emit("partner disconnected");
      }
      waitingUsers.push(partner.id);
      delete activePairs[partner.id];
    }

    waitingUsers = waitingUsers.filter((id) => id !== socket.id);
    waitingUsers.push(socket.id);

    delete activePairs[socket.id];
    if (partner) {
      printLogs("skip", { user1: socket.id, user2: partner.id });
    }
    checkAndPairUsers();
  });
});

function exitOrDisconnect(socket) {
  cleanWaitingUsers();
  const partner = activePairs[socket.id];

  if (partner) {
    if (partner.id) {
      io.to(partner.id).emit("partner disconnected");
    }
    waitingUsers.push(partner.id);
    delete activePairs[partner.id];
  }

  waitingUsers = waitingUsers.filter((id) => id !== socket.id);

  delete activePairs[socket.id];
  printLogs("exit", socket.id);
  checkAndPairUsers();
}

function checkAndPairUsers() {
  cleanWaitingUsers();
  printLogs("checkandpairusers");

  while (waitingUsers.length >= 2) {
    const index1 = Math.floor(Math.random() * waitingUsers.length);
    let index2;
    do {
      index2 = Math.floor(Math.random() * waitingUsers.length);
    } while (index2 === index1); // Evita di selezionare lo stesso utente due volte

    const user1 = waitingUsers.splice(index1, 1)[0]; // Rimuove e ottiene il primo utente
    const user2 = waitingUsers.splice(
      index2 > index1 ? index2 - 1 : index2,
      1
    )[0]; // Rimuove e ottiene il secondo utente

    const socket1 = io.sockets.sockets.get(user1);
    const socket2 = io.sockets.sockets.get(user2);

    if (!socket1?.userData) {
      io.to(user1).emit("missing userdata");
      printLogs("missing-userdata", { user: user1 });
      waitingUsers.push(user2);
      continue;
    }

    if (!socket2?.userData) {
      io.to(user2).emit("missing userdata");
      printLogs("missinguserdata", { user: user2 });
      waitingUsers.push(user1);
      continue;
    }

    activePairs[user1] = { id: user2.toString(), accepted: false };
    activePairs[user2] = { id: user1.toString(), accepted: false };

    io.to(user1).emit("request", {
      partner: user2,
      userData: socket2.userData,
    });
    io.to(user2).emit("request", {
      partner: user1,
      userData: socket1.userData,
    });
    printLogs("checkandpairusersfound", { user1, user2 });
  }
}

function cleanWaitingUsers() {
  waitingUsers = waitingUsers.filter((id) => id !== undefined);
}

function printLogs(operation, data) {
  console.log(`LOGS ${new Date()}`);

  console.log("Operation ", operation);

  switch (operation) {
    case "connection": {
      console.log("User connected: ", data);
      break;
    }
    case "user data": {
      console.log(`User ${data.id} sent data.`);
      console.log("Data: ", data.data);
      break;
    }
    case "checkandpairusers": {
      console.log("Checking pairing users...");
      console.log("Waiting users: ", waitingUsers);
      break;
    }
    case "checkandpairusersfound": {
      console.log("Pairing!");
      console.log(`Users paired: ${data.user1} and ${data.user2}`);
      console.log("Requests sent!");
      console.log("Waiting users: ", waitingUsers);
      console.log("ActivePairs: ", activePairs);
      break;
    }
    case "requestaccepted": {
      console.log(`Pair request from ${data.user2} accepted by ${data.user1}`);
      console.log("Waiting users: ", waitingUsers);
      console.log("ActivePairs: ", activePairs);
      break;
    }
    case "waitingrequestaccepted": {
      console.log(`Waiting request answare from ${data}`);
      break;
    }
    case "successconnection": {
      console.log(`Requests accepted!`);
      console.log(`Connection between: ${data.user1} and ${data.user2}`);
      break;
    }
    case "requestrejected": {
      console.log(`Request rejected from ${data}.`);
      console.log("Waiting users: ", waitingUsers);
      console.log("ActivePairs: ", activePairs);
      break;
    }
    case "exit": {
      console.log(`User ${data} exit from the chat.`);
      console.log("Waiting users: ", waitingUsers);
      console.log("ActivePairs: ", activePairs);
      break;
    }
    case "disconnect": {
      console.log(`User ${data} disconnected from socket.`);
      console.log("Waiting users: ", waitingUsers);
      console.log("ActivePairs: ", activePairs);
      break;
    }
    case "missinguserdata": {
      console.log(`User ${data.user} data not found!`);
      console.log("Reject pairing!");
    }
    case "skip": {
      console.log(`User ${data.user1} skipped user ${data.user2}`);
    }
    default: {
      console.log("NO LOGS");
    }
  }
}

server.listen(PORT, () => {
  console.log(`Server in ascolto sulla porta ${PORT}`);
});
