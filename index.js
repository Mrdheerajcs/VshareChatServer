const express = require('express');
const cors = require('cors');
const port = 5000;

const connectToMogoose = require('./database');

const BASE_URL = process.env.BASE_URL;
const SERVER_URL = process.env.SERVER_URL;

require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());
// app.use(cors({
//     origin: 'http://localhost:3000'
// }));

// All Routes
app.use('/api/auth', require('./src/routers/auth'))

app.use('/api/conversation', require('./src/routers/conversation'))

app.use('/api/message', require('./src/routers/message'))

app.use('/api/translate', require('./src/routers/translate'))

app.use('/api/profile', require('./src/routers/profile'))

app.get("/", (req, res) => {
    res.send("hello");
})

app.listen(port, () => {
    console.log(`Listening on port:  ${process.env.BASE_URL}`)
});

// ................... Socket IO ..........................

const { Server } = require('socket.io');

const io = new Server(9000, {
    cors: {
        ogirin: `${BASE_URL}`
    }
})

let users = [];

const addUser = (userData, socketId) => {
    // console.log(userData, socketId)
    // !users.some(user => user._id === userData._id) && users.push({ ...userData, socketId });

    if (!userData) {
        // console.error('User data is null');
        return;
    }

    if (!userData._id) {
        // console.error('User data does not have an _id property');
        return;
    }

    // Check if the user with the same _id already exists in the users array
    if (!users.some(user => user._id === userData._id)) {
        // If not, add the user to the users array with the provided socketId
        users.push({ ...userData, socketId });
    } else {
        // console.error('User with the same _id already exists');
    }
}

const removeUser = (socketId) => {
    users = users.filter(user => user.socketId !== socketId);
}

const getUser = (userId) => {
    return users.find(user => user._id === userId);
}


io.on('connection', (socket) => {
    console.log("user connected");

    //connect
    socket.on("addUser", userData => {
        addUser(userData, socket.id);
        io.emit("getUsers", users);
    })

    //send message
    socket.on('sendMessage', async (data) => {
        // console.log(data);
        const user = await getUser(data.receiverId);
        // console.log(user);

        if (user && user.socketId) {
            io.to(user.socketId).emit('getMessage', data);
        } else {
            console.error('User or user socketId is undefined');
        }
    });

    //disconnect
    socket.on('disconnect', () => {
        console.log('user disconnected');
        removeUser(socket.id);
        io.emit('getUsers', users);
    })
})