/*const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"]
    }
});

const PORT = 4000;

let waitingUsers = [];
let activePairs = {};
let disconnectedUsers = {};

io.on('connection', (socket) => {
    cleanWaitingUsers();
    console.log(`Utente connesso: ${socket.id}`);

    waitingUsers.push(socket.id);
    console.log('Utenti in attesa:', waitingUsers);
    checkAndPairUsers();

    socket.on('signal', (data) => {
        const partner = activePairs[socket.id];
        if (partner) {
            io.to(partner).emit('signal', data);
        }
    });

    socket.on('chat message', (message) => {
        console.log(activePairs);
        const partner = activePairs[socket.id];
        if (partner) {
            io.to(partner).emit('chat message', message);
        }
    });

    socket.on('disconnect', () => {
        cleanWaitingUsers();
        console.log(`Utente disconnesso: ${socket.id}`);
        const partner = activePairs[socket.id];

        if (partner) {
            io.to(partner).emit('partner disconnected');
            disconnectedUsers[partner] = socket.id;
        }

        waitingUsers = waitingUsers.filter((id) => id !== socket.id);
        waitingUsers.push(partner);
        delete activePairs[socket.id];
        delete activePairs[partner];

        console.log('Utenti in attesa dopo disconnessione:', waitingUsers);
    });
});

function checkAndPairUsers() {
    cleanWaitingUsers();
    while (waitingUsers.length >= 2) {
        const user1 = waitingUsers.shift();
        const user2 = waitingUsers.shift();

        activePairs[user1] = user2;
        activePairs[user2] = user1;

        io.to(user1).emit('paired', { partner: user2 });
        io.to(user2).emit('paired', { partner: user1 });

        console.log(`Accoppiati: ${user1} e ${user2}`);
    }
}

function cleanWaitingUsers(){
  waitingUsers = waitingUsers.filter((id) => id !== undefined);
}



server.listen(PORT, () => {
    console.log(`Server in ascolto su https://localhost:${PORT}`);
});
*/