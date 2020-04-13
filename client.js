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
  $('#enter').html('Click to start game');
  $('#enter').click((event)=>{
    $('.card').show();
    $('.slider').show();
    event.preventDefault();
  });
});
