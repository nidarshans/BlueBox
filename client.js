var socket = io();
$('#enter').click(()=>{
  socket.emit('entered', $('#name').val());
});
