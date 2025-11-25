"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// server.ts
var express_1 = require("express");
var http_1 = require("http");
var socket_io_1 = require("socket.io");
var app = (0, express_1.default)();
var httpServer = (0, http_1.createServer)(app);
var io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: '*', // allow your frontend domain
    },
});
io.on('connection', function (socket) {
    console.log('Client connected:', socket.id);
    socket.on('message', function (data) {
        console.log('Received message:', data);
        socket.emit('reply', "Server got: ".concat(data));
    });
    socket.on('disconnect', function () {
        console.log('Client disconnected');
    });
});
httpServer.listen(4000, function () {
    console.log('Socket.IO server running on http://localhost:4000');
});
