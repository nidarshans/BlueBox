var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var path = require('path');
var current_players = 0;
var helper = require('./helper.js');
var decks = require('./decks/decks.js');

const ROOM = '1';
const PLAYER_LIMIT = 5;
const MAX_POINTS = 10;
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
var joined = 0;
var index = 0;
var admin_id;
var selected_admin = false;

console.log("Shuffling ...");
bluecards = helper.shuffle(bluecards);
whitecards = helper.shuffle(whitecards);
bluecards.splice(13);
whitecards.splice(60);
bluecards = bluecards.concat(decks.custom.robotics.blue).concat(decks.official.fantasy.blue);
whitecards = whitecards.concat(decks.custom.robotics.white).concat(decks.official.fantasy.white);
bluecards = helper.shuffle(bluecards);
whitecards = helper.shuffle(whitecards);
console.log(bluecards);
console.log(whitecards);
console.log("Shuffled!");


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
  joined++;

  if(joined == 1 && selected_admin == false) {
    admin_id = socket.id;
    io.to(`${admin_id}`).emit('administrator');
  }

  socket.on('disconnect', ()=>{
    console.log(socket.id + ' disconnected');
    joined--;
    if(current_players > 0) {
      current_players--;
      delete players[helper.checkArrayLoc(socket.id, players)];
    }
  });

  socket.on('a', ()=>{io.emit('show');})

  socket.on('entered', function(name) {
    if(current_players < PLAYER_LIMIT && helper.checkDuplicate(players, name, socket.id) != true) {
      players.push(new helper.Player(socket.join(ROOM).id, name));
      console.log(name + ' entered the game');
      io.emit('register', players[index++]);
      current_players++;
      if(current_players == PLAYER_LIMIT || current_players == joined) {
        console.log('The current players are \n');
        for(var c of players) {
          if(c != undefined) console.log(c.id + ':' + c.name + '\n');
        }
        io.in(ROOM).emit('set click to enter');
      }
    }
  });

  socket.on('entered2', (id)=>{
    players[helper.checkArrayLoc(id, players)].enteredGame = true;
    if(helper.checkEnteredGame(players) == current_players) {
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
    if(players[currentPlayer] != undefined) {
      console.log(players[currentPlayer].name + ' played turn');
      if(players[currentPlayer].playedTurn != true) playedCards.push(new helper.Card(card, players[currentPlayer]));
      players[currentPlayer].playedTurn = true;
    }
    if(helper.checkTurns(players) == current_players) {
      console.log('Voting begins!');
      playedCards = helper.shuffle(playedCards);
      console.log(playedCards);
      console.log(playedCards.length);
      io.in(ROOM).emit('vote', playedCards, toInsert, current_players);
    }
  });

  socket.on('voted', (card)=>{
    console.log(card);
    const c = helper.matchCard(card, playedCards);
    if(c != undefined && c.owner != undefined) {
      arrayLoc = helper.checkArrayLoc(c.owner.id, players);
      if(players[arrayLoc] != undefined) {
        console.log(players[arrayLoc].name + ' got a point');
        players[arrayLoc].points++;
      }
    }
    totalVotes++;
    if(totalVotes == current_players) {
      console.log('Everyone voted');
      io.in(ROOM).emit('update', players, bluecards[bluecount++]);
      for(var p of players) {
        if(p != undefined) io.to(`${p.id}`).emit('updateWhite', whitecards[whitecount++]);
      }
    }
  });

  socket.on('insertCards', ()=>{
    var append = "<div class='card' align='center' style='background-color:white; color: black'> <h3 class='title' style='color: black'>User Card</h3><div class='bar'><div class='txt' id='usr" + fillCardCount + "'></div></div></div>"
    toInsert.push(append);
    console.log('Selected = ' + selected++ + '\n' + 'fillCardCount = ' + fillCardCount++);
    if(selected == current_players) {
      io.in(ROOM).emit('insertCard');
      console.log('Everyone selected');
    }
  });

  socket.on('newRound', ()=>{
    playedCards = [];
    fillCardCount = 1;
    totalVotes = 0;
    selected = 0;
    toInsert = [];
    var bool = false;
    var won = [];
    for(var p of players) {
      if(p != undefined && p.points >= MAX_POINTS) {
        won.push(p);
        bool = true;
      }
      if(p != undefined) p.playedTurn = false;
    }
    if(bool == true) {
      io.in(ROOM).emit('endgame', won);
      socket.disconnect;
    }
    //if(bool == false) io.in(ROOM).emit('startgame');
  });
}
