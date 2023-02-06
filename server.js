var WebSocketServer = require("ws").Server;
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
require('dotenv').config();
var parser = require('./gramatica');

var wss = new WebSocketServer({port: 8023});
var clients = [];

console.log("WebSocketServer started on port 8023");

wss.on('connection', function connection(ws) {
    ws.on('message', wss.broadcast);
    let id = uuidv4();
    clients.push({
        id : id,
        socket : ws
    });
    let result = {
        id : id
    };
    ws.send(JSON.stringify(result));
});

wss.broadcast = function broadcastMsg(msg) {
    let data = JSON.parse(msg);
    let result;
    jwt.verify(data.token, process.env.TOKEN_SECRET, (err, user) => {
        if (err) {
            result = {
                id : 0,
                error : 403,
                msg: "No tienes los permisos necesarios"
            };
        }
        else {
            result = parser.parse(data.operation);
        }
    });
    let client = clients.find(item => item.id == data.id);
    client.socket.send(JSON.stringify(result));
    client.socket.close();
    let indexOf = clients.findIndex(object => object.id == client.id);
    clients.splice(indexOf, 1);
};