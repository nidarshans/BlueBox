var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var path = require('path');
var current_players = 0;
var helper = require('./helper.js');
var decks = require('./decks.js');

const ROOM = '1';
const PLAYER_LIMIT = 1;
const MAX_POINTS = 5;
const CARDS_IN_HAND = 5;
var players = [];
var bluecards = decks.custom.dvdeck.blue;
var whitecards = decks.custom.dvdeck.white;
var playedCards = [];
var bluecount = 0;
var whitecount = 0;
var totalVotes = 0;
var fillCardCount = 1;


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
  app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
  });
  console.log(socket.id + ' connected');
  helper.test();

  socket.on('entered', function(name) {
    if(current_players <= PLAYER_LIMIT && helper.checkDuplicate(players, name, socket.id) != true) {
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
    else {socket.disconnect();}
  });

  socket.on('entered2', (id)=>{
    players[helper.checkArrayLoc(id, players)].enteredGame = true;
    if(helper.checkEnteredGame(players) == PLAYER_LIMIT) {
      console.log("Shuffling ...");
      bluecards = helper.shuffle(bluecards);
      whitecards = helper.shuffle(whitecards);
      console.log("Shuffled!")
      console.log(bluecards);
      console.log(whitecards);
      io.in(ROOM).emit('initialize', bluecards[bluecount++]);
      console.log('Played blue card')
    }
  });

  socket.on('initialized', ()=> {
    var whitefill = [];
    console.log('Handing out white cards')
    for(var x  = 0; x < players.length; x++) {
      for(var y = 0; y < CARDS_IN_HAND; y++) {
        whitefill.push(whitecards[whitecount++]);
      }
      console.log(whitefill);
      io.to(`${players[x].id}`).emit('fillWhite', whitefill, CARDS_IN_HAND);
      whitefill = [];
    }
    console.log('Finished handing out white cards');
    players = helper.shuffle(players);
    io.in(ROOM).emit('startgame');
  });

  socket.on('playedTurn', (card)=>{
    var currentPlayer = helper.checkArrayLoc(socket.id, players);
    console.log(players[currentPlayer].name + ' played turn');
    playedCards.push(new helper.Card(card, players[currentPlayer]));
    players[currentPlayer].playedTurn = true;
    if(helper.checkTurns(players) == PLAYER_LIMIT) {
      for(var p of players) p.playedTurn = false;
      console.log('Voting begins!');
      playedCards = helper.shuffle(playedCards);
      io.in(ROOM).emit('vote', playedCards);
    }
  });

  socket.on('voted', (card)=>{
    console.log(card);
    const c = helper.matchCard(card, playedCards);
    console.log(c.value);
    arrayLoc = helper.checkArrayLoc(c.owner.id, players);
    players[arrayLoc].points++;
    totalVotes++;
    if(totalVotes == PLAYER_LIMIT) {
      console.log('Everyone voted');
      totalVotes = 0;
      for(var p of players) {
        io.to(`${p.id}`).emit('update', players, whitecards[whitecount++], bluecards[bluecount++]);
      }
    }
  });

  socket.on('insertCards', ()=>{
    var append = "<div class='card' align='center' style='background-color:white; color: black'> <h3 class='title' style='color: black'>User Card</h3><div class='bar'><div class='txt' id='usr" + fillCardCount + "'></div></div></div>"
    fillCardCount++;
    io.emit('insertCard', append);
  });

  socket.on('newRound', ()=>{
    playedCards = [];
    fillCardCount = 1;
    io.in(ROOM).emit('startgame');
  });



}
