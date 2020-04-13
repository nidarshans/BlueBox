exports.test = () => {console.log('This is the helper file');}

class Player {
  constructor(socketid, username) {
    this.id = socketid;
    this.name = username;
    this.points = 0;
  }
}

function checkDuplicate(array, name) {
  if(array == NULL) return false;
  for(var n of array) {
    if(n.name == name) return true;
  }
  return false;
}




exports.Player = Player;
exports.checkDuplicate = checkDuplicate;
