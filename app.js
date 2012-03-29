
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var socketio = require('socket.io');
require("./logic/control.js");

console.log("Creating Express server")
var app = module.exports = express.createServer();
console.log("Binding socket.io to Express");
var io = socketio.listen(app);


// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.set('view options', {sitename : "Webchat Atestat"});
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes

app.get('/', routes.index);
app.get('/main', routes.main);

console.log("Starting up Express");
app.listen(8080);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);

io.sockets.on('connection', function(socket) {
  new logic(socket);
});
