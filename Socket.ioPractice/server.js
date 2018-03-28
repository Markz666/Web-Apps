const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const redisConnection = require("./redis-connection");
const nrpSender = require("./nrp-sender-shim");

app.get('/', (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

io.on("connection", (socket) => {
    console.log("A user connected.");
    socket.on('chat message', async(information) => {
        console.log(information);
        try {
            let response = await nrpSender.sendMessage({
                redis: redisConnection,
                eventName: "search-image",
                data: {
                    information: information
                }
            });
            io.emit('chat message', response);
        } catch (err) {
            console.log(err);
            io.emit('chat message', err);
        }
    });
});


http.listen(3000, () => {
    console.log("listening on http://localhost:3000");
});
