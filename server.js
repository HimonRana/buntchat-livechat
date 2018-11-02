var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);

port = 4000
server.listen(port);
console.log("Listening on port: " + port);
// WARNING: app.listen(80) will NOT work here!

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function (socket) {
  io.emit('this', { will: 'be received by everyone' });
  socket.emit('status', socket);

  socket.on('private message', function (from, msg) {
    console.log('I received a private message by ', from, ' saying ', msg);
  });

  socket.on('disconnect', function () {
    io.emit('user disconnected');
  });
});