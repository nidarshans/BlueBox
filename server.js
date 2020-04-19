var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var path = require('path');
var current_players = 0;
var helper = require('./helper.js');
var decks = require('./decks/decks.js');

const ROOM = '1';
const PLAYER_LIMIT = 2;
const MAX_POINTS = 5;
const CARDS_IN_HAND = 5;
var players = [];
var bluecards = decks.official.baseset.blue;
var whitecards = decks.official.baseset.white;
var playedCards = [];
var bluecount = 0;
var whitecount = 0;
var totalVotes = 0;
var fillCardCount = 1;
var toInsert = [];
var init = false;
var selected = 0;


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
    if(init == false) {
      for(var p of players) {
        for(var y = 0; y < CARDS_IN_HAND; y++) {
          whitefill.push(whitecards[whitecount++]);
        }
        console.log(whitefill);
        io.to(`${p.id}`).emit('fillWhite', whitefill, CARDS_IN_HAND);
        whitefill = [];
      }
    }
    init = true;
    console.log('Finished handing out white cards');
    io.in(ROOM).emit('startgame');
  });

  socket.on('playedTurn', (card)=>{
    var currentPlayer = helper.checkArrayLoc(socket.id, players);
    console.log(players[currentPlayer].name + ' played turn');
    if(players[currentPlayer].playedTurn != true) playedCards.push(new helper.Card(card, players[currentPlayer]));
    players[currentPlayer].playedTurn = true;
    if(helper.checkTurns(players) == PLAYER_LIMIT) {
      console.log('Voting begins!');
      playedCards = helper.shuffle(playedCards);
      console.log(playedCards);
      console.log(playedCards.length);
      io.in(ROOM).emit('vote', playedCards, toInsert);
    }
  });

  socket.on('voted', (card)=>{
    console.log(card);
    const c = helper.matchCard(card, playedCards);
    arrayLoc = helper.checkArrayLoc(c.owner.id, players);
    console.log(players[arrayLoc].name + ' got a point');
    players[arrayLoc].points++;
    totalVotes++;
    if(totalVotes == PLAYER_LIMIT) {
      console.log('Everyone voted');
      io.emit('update', players, bluecards[bluecount++]);
      for(var p of players) {
        io.to(`${p.id}`).emit('updateWhite', whitecards[whitecount++]);
      }
    }
  });

  socket.on('insertCards', ()=>{
    var c = helper.checkArrayLoc(socket.id, players);
    var append = "<div class='card' align='center' style='background-color:white; color: black'> <h3 class='title' style='color: black'>User Card</h3><div class='bar'><div class='txt' id='usr" + fillCardCount + "'></div></div></div>"
    toInsert.push(append);
    console.log('Selected = ' + selected++ + '\n' + 'fillCardCount = ' + fillCardCount++);
    if(selected == PLAYER_LIMIT) {
      io.in(ROOM).emit('insertCard', players[c].playedTurn);
      console.log('Everyone selected');
    }
  });

  socket.on('newRound', ()=>{
    playedCards = [];
    fillCardCount = 1;
    totalVotes = 0;
    selected = 0;
    toInsert = [];
    for(var p of players) { p.playedTurn = false; }
    io.in(ROOM).emit('startgame');
  });



}
