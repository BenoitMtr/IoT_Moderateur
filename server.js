const bcrypt = require('bcrypt');
const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const { Client } = require('pg');
require('dotenv').config();

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0; //Autorized self signed certificate for SSL communication

//Connexion à la base de données PostgreSQL
//Lecture du connectionString depuis le fichier .env
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: true
});

client.connect();

/*client.query("SELECT * FROM public.users WHERE email='thierry.tsang@laposte.net' AND password='123456';", (err, res) => {
  if (err) throw err;
  for (let row of res.rows) {
    console.log(JSON.stringify(row));
  }
});*/

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

app.get('/login', (req, res) => {
  res.sendFile(__dirname + '/login.html');
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

//Gestion des sockets
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

  socket.on('login', (data) => {
    let query = "SELECT * FROM public.users WHERE email='" + data.email + "';";
    client.query(query, (err, res) => {
      if(res.rows.length === 1){
        bcrypt.compare(data.password, res.rows[0].password, function(err, result){
          if(result){
            io.emit("homepage", {
              email : data.email,
              isAdmin : res.rows[0].isAdmin
            });
          }
          else{
            io.emit("connectError", {});
          }
        });
      }
      else{
        io.emit("connectError", {});
      }
    });
  });

  socket.on('signup', (data) => {
    bcrypt.hash(data.password, 10, function(err, hash){
      let query = "INSERT INTO PUBLIC.users VALUES ('" + data.email + "', '" + hash + "', " + data.isAdmin + ");";
      client.query(query, (err, res) => {
          if(res.rowCount === 1){
              io.emit("homepage", {
                email : data.email,
                isAdmin : data.isAdmin
              });
          }
          else{
            io.emit("connectError", {});
          }
      });
    });
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
