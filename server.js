const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

let roomsValuesDictionary = {
  "Open Space" : -1,
  "Salle de Réunion" : -1,
  "Salle de Détente" : -1
};

/*"Open Space" : 10,
"Restaurant" : 20,
"Salon" : 30*/

// WARNING: app.listen(80) will NOT work here!
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
server.listen(port);
console.log("Le serveur est actif à l'adresse suivante : http://localhost:" + port);
app.use(express.static('public')) //Dossier dans lequel chercher les fichiers

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.use(express.json())
app.post( '/getRoomVolumeLevel', (req, res) => {
  let json = {};
  json.volumeLevel = roomsValuesDictionary[req.body.room]
  res.json(json);
});

//Récupération de toutes les salles et de leurs volumes
app.get( '/rooms', (req, res) => {
  let rooms = [];
  for(var key in roomsValuesDictionary){
    let currentRoom = {};
    currentRoom.name = key;
    currentRoom.volumeLevel = roomsValuesDictionary[key];
    rooms.push(currentRoom);
  }
  res.json(rooms);
});

io.on('connection', (socket) => {
  socket.on('volumeLevel', (data) => {
    roomsValuesDictionary[data.room] = data.volumeLevel;
    //console.log(data.volumeLevel);
    //console.log(data.room);
  });

  socket.on('addRoom', (data) => {
    roomsValuesDictionary[data.room] = -1;
  });
});
