
var socket = io.connect();
socket.on('connect', function () {
  console.log('connected');
});

socket.on('irc.message', function (data) {
  console.log('irc.message', data);
});

var IDS = 0;

var conns = {};

function connect (server, port, nick, channels) {
  socket.emit('irc.connect', {id: IDS, server: server, port: port, nick: nick, channels: channels}, function (data) {
    console.log(data);
  });
  IDS++;
}

function say (id, message) {
  socket.emit('irc.message', {id: id, type: 'say', target: '#ircel', message: message});
}
