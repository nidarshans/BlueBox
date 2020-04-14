var socket = io();

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
  for(var x = 1; x <= 5; x++) $('#slide-' + x).html(cards[x-1]);
});
