
/**
 * Module dependencies.
 */

var express = require('express');
var irc     = require('irc');
var socket_io      = require('socket.io');

var app = module.exports = express.createServer();
var io = socket_io.listen(app);

var clients = {};

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.bodyParser());
  app.use(express.cookieParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function () {
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function () {
  app.use(express.errorHandler());
});

// sockets
io.sockets.on('connection', function (socket) {

  //irc.connect:
  //{
      //id: <id>, // a unique identifier for this connection
      //server: <host>,
      //port: <port>,
      //nick: <nick>,
      //channels: [<channel>, ...] | []
  //}
  socket.on('irc.connect', function (data) {
    console.log('irc.connect', data);
    clients[data.id] = new irc.Client(data.server, data.nick, data);
    // send messages to the client
    setupClient(socket, clients[data.id], data.id);
  });

  //irc.join:
  //{
      //id: <id>,
      //channel: <channel>
  //}
  socket.on('irc.join', function (data) {
    console.log('irc.join', data);
    clients[data.id].join(data.channel);
  });

  //irc.message:
  //{
      //id: <id>,
      //type: "say" | "ctcp" | "action" | "notice"
      //target: <target>,
      //message: <message>
  //}

  socket.on('irc.message', function (data) {
    console.log('irc.message', data);
    if (data.type === "say") {
      clients[data.id].say(data.target, data.message);

    } else if (data.type === "ctcp") {
      clients[data.id].ctcp(data.target, "notice", data.message);

    } else if (data.type === "action") {
      clients[data.id].ctcp(data.target, "privmsg", data.message);

    } else if (data.type === "notice") {
      clients[data.id].notice(data.target, data.message);
    }

  });

  //irc.whois:
  //{
      //id: <id>,
      //nick: <nick>
  //}
  socket.on('irc.whois', function (data) {
    console.log('irc.whois', data);
    clients[data.id].whois(data.nick, function (info) {
      socket.emit('irc.whois', {id: data.id, nick: data.nick, info: info});
    });
  });

  //irc.list: // lists rooms
  //{
      //id: <id>,
      //args: [<arg>, ...] | []
  //}
  socket.on('irc.list', function (data) {
    console.log('irc.list', data);
    clients[data.id].list(data.args);
    clients[data.id].addListener('channellist', function (list) {
      socket.emit('irc.list', {id: data.id, list: list});
    });
  });

});

// Routes

app.get('/', function (req, res) {
  res.render('index', { title: 'ircel demo' });
});

function setupClient (socket, client, id) {
  client.addListener('raw', function (message) {
    console.log('raw', message);
  });

  client.addListener('message', function (from, to, message) {
    console.log('message', from, to, message);
    socket.emit('irc.message', {id: id, type: "message", from: from, to: to, message: message});
  });

  client.addListener('ctcp', function (from, to, message, type) {
    console.log('ctcp', from, to, message, type);
    socket.emit('irc.message', {id: id, type: type, from: from, to: to, message: message});
  });

  client.addListener('join', function (channel, nick, message) {
    console.log('join', message);
    socket.emit('irc.event', {id: id, type: "join", channel: channel, nick: nick, message: message});
  });

  client.addListener('part', function (channel, nick, message) {
    console.log('part', message);
    socket.emit('irc.event', {id: id, type: "part", channel: channel, nick: nick, message: message});
  });

  client.addListener('error', function (message) {
    console.log('error', message);
    socket.emit('irc.error', {id: id, message: message});
  });
}

app.listen(process.env['PORT'] || 3000, function () {
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});

