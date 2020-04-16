var socket = io();
var played = false;
var playedCard = '';

$('.card').hide();
$('.slider').hide();

$('#enter').click((event)=>{
  socket.emit('entered', $('#name').val());
  event.preventDefault();
});

socket.on('register', (playerData)=> {
  $('#name-list > tbody:last-child').append('<tr><td>' + playerData.name + '</td><td>' + playerData.points + '</td></tr>');
});

socket.on('set click to enter', ()=> {
  $('#enter').replaceWith('<button id="clicktoenter">...</button>');
  $('#clicktoenter').html('Click to start game');
  $('#clicktoenter').click((event)=>{
    $('.card').show();
    $('.slider').show();
    socket.emit('entered2', socket.id);
    event.preventDefault();
  });
});

socket.on('initialize', (blue)=>{
  $('#bluecard').html(blue);
  socket.emit('initialized');
});

socket.on('fillWhite', (cards)=> {
  for(var x = 1; x <= 5; x++) $('#slide-' + x).html(cards[x-1].value);
});

socket.on('startgame', Game);

function Game() {
  $('.slides').dblclick((e)=>{
    if(played != true) {
      $('#userspace').append("<div class='card' align='center' style='background-color:white; color: black'> <h3 class='title' style='color: black'>User Card</h3><div class='bar'><div class='txt'></div></div></div>");
      playedCard = $('' + e.target.id).html();
      $('#' + e.target.id).html('5');
      played = true;
      socket.emit('playedTurn', playedCard);
    }
    else alert('You already played your turn u gay');
    e.preventDefault();
    socket.on('vote', (cards)=> {
    });
  });
}
