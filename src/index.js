const express = require("express");
const path = require("path");
const http = require("http");
const socketio = require("socket.io");
const badWords = require("bad-words");
const { messageObj, generateLocationUrl } = require("./utils/messages");
const { addUser,removeUser,getUser,getUsersInRoom } = require("./utils/users")

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const publicDirectoryPath = path.join(__dirname, '../public');

app.use(express.static(publicDirectoryPath));


// here socket is a individual user
io.on("connection", (socket) => {


    // render username and room
    socket.on("joinUser", ({ username, room },callback) => {
       
        const {error,user} = addUser({ id: socket.id, username,room });

        if(error) {
            return callback(error)
        }

        // "socket.emit" emit message for single user
        socket.emit("message", messageObj("Welcome "+ username),"Bot")

        // "socket.broadcast.emit" emit message for every single users but expect one who recently connect our app ---- but when we add .to method with broadcast it work with only specific room
        socket.broadcast.to(user.room).emit("message", messageObj(`${user.username} has join the chat`),"Bot");

        // to create a room
        socket.join(user.room)

        io.to(user.room).emit("roomData",{
            room: user.room,
            usersInThatRoom: getUsersInRoom(user.room)
        })

        callback();


    })



    socket.on("sendMessageFromClient", (msg, callback) => {

        const filter = new badWords();

        if (filter.isProfane(msg)) {
            return callback("Bad words is not allow to use!");
        }

        const user = getUser(socket.id)
        // console.log(user)
        // but "io.emit" emit message for all connections in same room
        io.to(user.room).emit("message", messageObj(msg),user.username)

        // acknowledgement callback
        callback();
    })

    // "socket.on("disconnect")" is run when user is disconnect
    socket.on("disconnect", () => {
       const user = removeUser(socket.id)
       if(user) {
        io.to(user.room).emit("message", messageObj(`${user.username} has left the chat!`));
        io.to(user.room).emit("roomData",{
            room: user.room,
            usersInThatRoom: getUsersInRoom(user.room)
        })
       }
        
    })


    // send geo location of user
    socket.on("sendGeoLocation", (latitude, longitude, locationInformation) => {
        const user = getUser(socket.id)

        io.to(user.room).emit("shareLocation", generateLocationUrl(`https://google.com/maps?q=${latitude},${longitude}`),user.username);

        locationInformation("Location is shared successfully!")
    })



})

//this line is entered via vim text editor so it is a test line 

const PORT = process.env.PORT || 3000;
server.listen(3000, () => {
    console.log("Server is running on port 3000");
})
