var app= require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res) {
	res.sendFile(__dirname + '/index.html');
	res.setHeader('content-type', 'text/css');	
	res.sendFile(__dirname + '/a3.css');
});

io.on('connection', function(socket){
	socket.on('chat message', function(msg) {
		console.log('message: ' + msg);
	});
	socket.on('chat message', function(msg) {
		io.emit('chat message', msg);
	});

	console.log('a user connected');
	socket.on('disconnect', function() {
		console.log('user disconnected');
	});
});

io.emit('some event', { for: 'everyone' });

http.listen(3000, function() {
	console.log('listening on *:3000');
});