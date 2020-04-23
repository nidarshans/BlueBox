var socket = io();
var played = false;
var voted = false;
var started =  false;
var playedCard = '';
var bool = false;

$('.card').hide();
$('.slider').hide();
$("#join").hide();
$('#lst').hide();
$('#admin').hide();

socket.on('administrator', ()=>{
  $('#admin').show();
});

$('#admin').click((e)=>{
  socket.emit('a');
});

socket.on('show', ()=>{
  $('#join').show();
  $('#lst').show();
  $('#status').hide();
});

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
    if(started != true) {
      socket.emit('entered2', socket.id);
      started = true;
    }
    event.preventDefault();
  });
});

socket.on('initialize', (blue)=>{
  $('#bluecard').html(blue);
  socket.emit('initialized');
  $('#join').hide();
});

socket.on('fillWhite', (cards, hand)=> {
  for(var x = 1; x <= hand; x++) $("#slide-" + x).html(cards[x-1]);
});

socket.on('startgame', Game);
socket.on('endgame', (array)=>{
  $('.card').hide();
  $('.slider').hide();
  $("#join").hide();
  $('#lst').hide();
  $('#status').show();
  $('#status > h2').empty();
  for(var a of array) $('#status').append('<h2>' + a.name + ' won the game</h2>');
});

function Game() {
  $('.slides').click((e)=>{
    e.preventDefault();
    if(played != true) {
      played = true;
      playedCard = $('#' + e.target.id).html();
      $('#' + e.target.id).html('.');
      socket.emit('insertCards');
    }
  });
  socket.on('insertCard', ()=>{
      if(bool == false) {
        socket.emit('playedTurn', playedCard);
        bool = true;
      }
    });
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
            voted = true;
            if(playedCard != $('#' + v.target.id).html()) {
              alert("You voted!");
              socket.emit('voted', $('#' + v.target.id).html());
            }
            else {
              voted = false;
            }
          }
      });
    });
  socket.on('update', (pp, b)=>{
            played = false;
            voted = false;
            playedCard = '';
            $('#bluecard').html(b);
            for(var p of pp) {
              $('#' + p.name).html(p.points);
            }
          });
  socket.on('updateWhite', (w)=>{
              for(var x = 1; x <= 5; x++) {
              if($('#slide-' + x).html() == '.') $('#slide-' + x).html(w);
              }
              $('#userspace').html('');
              bool = false;
              socket.emit('newRound');
            });
}
