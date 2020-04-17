var socket = io();
var played = false;
var voted = false;
var playedCard = '';

$('.card').hide();
$('.slider').hide();

$('#enter').click((event)=>{
  socket.emit('entered', $('#name').val());
  event.preventDefault();
});

socket.on('register', (playerData)=> {
  $('#name-list > tbody:last-child').append('<tr><td>' + playerData.name + '</td><td id="' + playerData.name + '">' + playerData.points + '</td></tr>');
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

socket.on('fillWhite', (cards, hand)=> {
  for(var x = 1; x <= hand; x++) $("#slide-" + x).html(cards[x-1]);
});

socket.on('startgame', Game);

function Game() {
  $('.slides').dblclick((e)=>{
    socket.emit('insertCards');
    socket.on('insertCard', (insert, c)=>{
      if(played != true) {
        $('#userspace').append(insert);
        playedCard = $('#' + e.target.id).html();
        $('#' + e.target.id).html('.');
        played = true;
        socket.emit('playedTurn', playedCard);
      }
      else alert('You already played your turn, u gay');
      e.preventDefault();
      socket.on('vote', (cards)=> {
        alert("Time to vote, fools!");
        for(var x = 1; x <= cards.length; x++) {
          $('#usr' + x).html(cards[x-1].value);
        }
        $("[id^='usr']").click((v)=>{
          v.preventDefault();
          if(voted != true) {
            alert("You voted!");
            voted = true;
            socket.emit('voted', $('#' + v.target.id).html());
          }
          socket.on('update', (p, w, b)=>{
            $('#' + p.name).html(p.points);
            for(var x = 1; x <= 5; x++) {
              if($('#slide-' + x).html() == '.') $('#slide-' + x).html(w);
            }
            $('#bluecard').html(b);
            $('#userspace').empty();
            played = false;
            voted = false;
            playedCard = '';
            socket.emit('newRound');
          });
        });
      });
    });
  });
}
