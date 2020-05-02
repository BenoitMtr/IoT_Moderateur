const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

let roomsValuesDictionary = {
  "Open Space" : {
    "volumeLevel" : -1,
    "updateTime" : -1
  },
  "Salle de Réunion" : {
    "volumeLevel" : -1,
    "updateTime" : -1
  },
  "Salle de Détente" : {
    "volumeLevel" : -1,
    "updateTime" : -1
  }
};

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
    currentRoom.volumeLevel = roomsValuesDictionary[key].volumeLevel;
    rooms.push(currentRoom);
  }
  res.json(rooms);
});

io.on('connection', (socket) => {
  socket.on('volumeLevel', (data) => {
    roomsValuesDictionary[data.room].volumeLevel = data.volumeLevel;
    roomsValuesDictionary[data.room].updateTime = data.updateTime;
    //console.log(data.volumeLevel);
    //console.log(data.room);
  });

  socket.on('addRoom', (data) => {
    roomsValuesDictionary[data.room] = -1;
  });
});

setInterval(checkSilentRooms, 3000);

//Réinitiailisation du volume d'une pièce si aucun son n'a été capté pendant un laps de temps
function checkSilentRooms(){
  let currentTime = Date.now();
  for(var key in roomsValuesDictionary){
    if(roomsValuesDictionary[key].updateTime != -1){
      let elapsedTime = currentTime - roomsValuesDictionary[key].updateTime;
      if(Math.floor(elapsedTime/1000) > 20){ //20 secondes sans nouvelle valeur
        roomsValuesDictionary[key].volumeLevel = -1;
      }
    }
  }
}
