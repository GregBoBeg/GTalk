const path = require('path');
const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const { formatMessage } = require('./utils/messages');
const { userJoin, getCurrentUser, userLeft, getRoomUsers } = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Set Static Folder
app.use(express.static(path.join(__dirname, 'public')));

// Run Upon Connect
io.on('connection', socket => {

    // Join Room
    socket.on('joinRoom', ({ username, room }) => {

        const user = userJoin(socket.id, username, room);
        socket.join(user.room);

        // Emit welcome message to new client connected
        socket.emit('message', formatMessage('Admin', 'Welcome to Chatcord'));

        // Broadcast new client connected
        socket.broadcast.to(user.room).emit('message', formatMessage('Admin', `'${user.username}' has joined the chat.`));

        // Send users and room info
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        });

    });

    // Emit from server, the chat message received from the client, back out to all clients in chat room 
    socket.on('chatMessage', (msg) => {
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit('message', formatMessage(user.username, msg));
    })

    // Emit client disconnected to all clients
    socket.on('disconnect', () => {
        const user = userLeft(socket.id);
        if(user){
            io.to(user.room).emit('message', formatMessage('Admin',`'${user.username}'' has left the chat.`));
            // Send users and room info
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
            });
        }
    });

});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));