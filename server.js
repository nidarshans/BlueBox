var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var path = require('path');
var current_players = 0;
var helper = require('./helper.js');
const ROOM = 'game';
const PLAYER_LIMIT = 8;

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
      socket.join(ROOM);
      console.log(name + ' entered the game');
      current_players++;
    }
    else { alert('Sorry, maximum capacity reached'); }
  });


}
