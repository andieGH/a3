var app= require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res) {
	res.sendFile(__dirname + '/index.html');
});

app.get('/a3.css', function(req,res) {
	res.setHeader('content-type', 'text/css');
	res.sendFile(__dirname + '/a3.css');
});

io.on('connection', function(socket){
	console.log('a user connected');


	var currentDate = new Date();

	var date = currentDate.getDate();
	var month = currentDate.getMonth(); //Be careful! January is 0 not 1
	var year = currentDate.getFullYear();

	var dateString = date + "-" +(month + 1) + "-" + year;	
	console.log(dateString);
	//var timestamp = date.getTime();

 	var d = new Date();
  	var hour = d.getHours();
  	var minutes = d.getMinutes();

  	if ((minutes * 1) < 10) {
  		minutes = "0" + minutes;
  	}
  	console.log(socket.username);
  	var timestamp = hour + ":" + minutes;
	console.log(timestamp);

	socket.on('chat message', function(msg) {
		console.log('message: ' + msg);
	});
	socket.on('chat message', function(msg) {
		io.emit('chat message', timestamp + " " + msg);
	});

	socket.on('disconnect', function() {
		console.log('user disconnected');
	});
});

io.emit('some event', { for: 'everyone' });

http.listen(3000, function() {
	console.log('listening on *:3000');
});