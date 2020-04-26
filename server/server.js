const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server);

// WARNING: app.listen(80) will NOT work here!
let port = process.env.PORT;
if (port == null || port == "") {
  port = 8080;
}
server.listen(port);
console.log("Le serveur est actif à l'adresse suivante : 'http://localhost:" + port);


app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  socket.on('volumeLevel', (data) => {
    console.log(data.volumeLevel);
  });
});
