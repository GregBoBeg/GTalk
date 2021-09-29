const chatForm = document.getElementById('chat-form');
const roomName = document.getElementById('room-name');
const roomUsers = document.getElementById('users');

const socket = io();

const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true
});

console.log(username, room);

// Join Chatroom
socket.emit('joinRoom', { username, room })

// Output Room Name and List of Users
socket.on('roomUsers', ({ room, users }) => {
    outputRoomName(room);
    outputUsers(users);
});

// Output Messages from Server
socket.on('message', message => {
    console.log(message);
    outputMessage(message);
});

// Listen for chat messages
chatForm.addEventListener('submit', (e) =>{
    e.preventDefault();

    // Get chat message from the input with ID of 'msg'
    const msg = e.target.elements.msg.value;

    // Emit chat message to server
    socket.emit('chatMessage', msg);

    
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();

});

// Output Messages to DOM
function outputMessage(message) {
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = `
    <p class='meta'>${message.username} <span> ${message.time} </span></p>
    <p class='text'>${message.text}</p>
    `;
    document.querySelector('.chat-messages').appendChild(div);

    // Scroll down to show bottom message in chat box
    const chatMessages = document.querySelector('.chat-messages')
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Add Room Name to DOM
function outputRoomName(room) {
    roomName.innerText = room;
};

// Add Room's Users to Dom
function outputUsers(users) {
    listText = '';
    users.forEach((user) => {
        listText = listText + `<li>${user.username}</li>`;
    });
    roomUsers.innerHTML = listText;
};