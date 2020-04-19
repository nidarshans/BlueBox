exports.test = () => {console.log('This is the helper file');}

class Player {
  constructor(socketid, username) {
    this.id = socketid;
    this.name = username;
    this.points = 0;
    this.enteredGame = false;
    this.playedTurn = false;
  }
}

class Card {
  constructor(value, player) {
    this.value = value;
    this.owner = player;
  }
}

function checkDuplicate(array, name, id) {
  if(array == null) return false;
  for(var n of array) {
    if(n.name == name || n.id == id) return true;
  }
  return false;
}

function checkArrayLoc(id, array) {
  for(var x = 0; x < array.length; x++) {
    if(id == array[x].id) return x;
  }
}

function checkEnteredGame(array) {
  let returnVal = 0;
  for(var p of array) {
    if(p.enteredGame == true) returnVal++;
  }
  return returnVal;
}

function shuffle(deck) {
  for (var i = deck.length - 1; i > 0; i--) {
    const swapIndex = Math.floor(Math.random() * (i + 1))
    const currentCard = deck[i]
    const cardToSwap = deck[swapIndex]
    deck[i] = cardToSwap
    deck[swapIndex] = currentCard
  }
  return deck
}

function checkWin(array, max) {
  for(var p of array) {
    if(p.points == max) return true;
  }
  return false;
}

function checkTurns(array) {
  var turns = 0;
  for(var p of array){
    if(p.playedTurn == true) turns++;
  }
  return turns;
}

function matchCard(card, array) {
  for(var c of array) {
    if(c.value ==  card) return c;
  }
}


exports.Player = Player;
exports.Card = Card;
exports.checkDuplicate = checkDuplicate;
exports.checkArrayLoc = checkArrayLoc;
exports.checkEnteredGame = checkEnteredGame;
exports.shuffle = shuffle;
exports.checkWin = checkWin;
exports.checkTurns = checkTurns;
exports.matchCard = matchCard;
