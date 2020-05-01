const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

// WARNING: app.listen(80) will NOT work here!
let port = process.env.PORT;
if (port == null || port == "") {
  port = 8080;
}
server.listen(port);
console.log("Le serveur est actif à l'adresse suivante : 'http://localhost:" + port);
app.use(express.static('public'))

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.use(express.json())
app.post( '/getRoomVolumeLevel', (req, res) => {
  let json = {};
  json.volumeLevel = roomsValuesDictionary[req.body.room]
  res.json(json);
});

let roomsValuesDictionary = {};

io.on('connection', (socket) => {
  socket.on('volumeLevel', (data) => {
    roomsValuesDictionary[data.room] = data.volumeLevel;
    console.log(data.volumeLevel);
    console.log(data.room);
  });
});
