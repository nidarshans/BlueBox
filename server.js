var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var path = require('path');
var current_players = 0;
var helper = require('./helper.js');

const ROOM = '1';
const PLAYER_LIMIT = 1;
var players = [];



app.use(express.static(__dirname));
app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

http.listen(3000, function(){
  console.log('listening on *:3000');
  console.log(__dirname + "/index.html");
});

io.on('connect', onConnect);

function onConnect (socket) {
  console.log(socket.id + ' connected');
  helper.test();

  socket.on('entered', function(name) {
    if(current_players <= PLAYER_LIMIT) {
      players.push(new helper.Player(socket.join(ROOM).id, name));
      console.log(name + ' entered the game');
      io.emit('register', players[current_players]);
      current_players++;
      if(current_players == PLAYER_LIMIT) {
        console.log('The current players are \n');
        for(var c of players) { console.log(c.id + ':' + c.name + '\n');}
        io.in(ROOM).emit('set click to enter');
      }
    }
    else {}
  });


}
