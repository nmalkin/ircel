
/**
 * Module dependencies.
 */

var express = require('express');
var irc     = require('irc');

var app = module.exports = express.createServer();


var client = new irc.Client('irc.mozilla.org', 'not_dzbarsky', { });

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.bodyParser());
  app.use(express.cookieParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/www'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes

app.get('/', function(req, res){
  res.render('index', { title: 'Express' });
});

client.addListener('message', function (from, to, message) {
});

app.listen(process.env['PORT'] || 3000, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});

