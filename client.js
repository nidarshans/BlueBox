var socket = io();
var played = false;
var voted = false;
var started =  false;
var playedCard = '';
var bool = false;

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
    if(started != true) socket.emit('entered2', socket.id);
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
    e.preventDefault();
    if(played != true) {
      played = true;
      playedCard = $('#' + e.target.id).html();
      $('#' + e.target.id).html('.');
      socket.emit('insertCards');
    }
    socket.on('insertCard', ()=>{
      if(bool == false) {
        socket.emit('playedTurn', playedCard);
        bool = true;
      }
      socket.on('vote', (cards, app, lim)=>{
        for(var a of app) {
          if($('#userspace > div').length < lim) $('#userspace').append(a);
        }
        for(var x = 1; x <= cards.length; x++) {
          $('#usr' + x).html(cards[x-1].value);
        }
        cards = [];
        $("[id^='usr']").click((v)=>{
          v.preventDefault();
          if(voted != true) {
            alert("You voted!");
            voted = true;
            socket.emit('voted', $('#' + v.target.id).html());
          }
          socket.on('update', (pp, b)=>{
            played = false;
            voted = false;
            playedCard = '';
            $('#bluecard').html(b);
            for(var p of pp) {
              $('#' + p.name).html(p.points);
            }
            socket.on('updateWhite', (w)=>{
              for(var x = 1; x <= 5; x++) {
              if($('#slide-' + x).html() == '.') $('#slide-' + x).html(w);
              }
              $('#userspace').html('');
              bool = false;
              socket.emit('newRound');
            });
          });
        });
      });
    });
  });
}
