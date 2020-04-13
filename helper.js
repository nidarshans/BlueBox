exports.test = () => {console.log('This is the helper file');}

class Player {
  constructor(socketid, username) {
    this.id = socketid;
    this.name = username;
    this.points = 0;
    this.enteredGame = false;
  }
}

function checkDuplicate(array, name) {
  if(array == null) return false;
  for(var n of array) {
    if(n.name == name) return true;
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
  
}




exports.Player = Player;
exports.checkDuplicate = checkDuplicate;
exports.checkArrayLoc = checkArrayLoc;
exports.checkEnteredGame = checkEnteredGame;
exports.shuffle = shuffle;
