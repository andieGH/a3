var app= require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var users = new Array(0);
var duplicate = true;
var flag = false;
var colours = new Array(0);
var memory = new Array(0);
var time;


var cookieParser = require('cookie-parser')
app.use(cookieParser())

app.get('/list', function(req, res) {
	  res.send(req.cookies);
	});

app.get('/', function(req, res) {
	res.sendFile(__dirname + '/index.html');
});


app.get('/a3.css', function(req,res) {
	res.setHeader('content-type', 'text/css');
	res.sendFile(__dirname + '/a3.css');
});

io.on('connection', function(socket){

	console.log(users);
	console.log("A user connected. Socket id: " + socket.id);
	// Assigns a random username. Up to 1000 possible.
	while (duplicate === true) {
		var username = "User" + Math.floor((Math.random() * 1000) + 1);
		duplicate = users.includes(username);
	}
	duplicate = true;

	users.push(username);
	colours.push("000000");

	// Send the list of users.
	socket.emit('list_of_users', {users: users});
	io.emit('list_of_users', {users: users});

	socket.name = username;
	socket.emit('current_User', socket.name);
	console.log("socket.name = " + socket.name);

	socket.emit('print Memory', {memory: memory});

	socket.on('chat message', function(msg){
		var d = new Date();
 		time = d.getTime();
		// Send the timestamp unformatted
		io.emit('send_Timestamp', time);

		console.log(username + " " + "message: " + msg);
		var changeNick = msg.substring(0, 5);
		var changeColour = msg.substring(0, 10);
		var changeColour2 = msg.substring(0,11);

		if (changeNick.toUpperCase() === "/nick".toUpperCase() && changeColour2.toUpperCase() !== "/nickColour".toUpperCase() && changeColour.toUpperCase() != "/nickColor".toUpperCase()){
			try {
				var res = msg.split("<");
				var name = res[1].split(">");
				
				for (var i=0; i<users.length; i++) {
					if (users[i].toUpperCase() === name[0].toUpperCase()) {
						var errorMess = ("ERROR: This nickname is already being used, please choose a different nickname.");
						socket.emit('error message', errorMess);
						flag = true;
					}
				}

				if (name[0] === "") {
					errorMess = ("ERROR: Invalid nickname.");
					socket.emit('error message', errorMess);
					flag = true;
				}

				else if (flag === false) {
					console.log("Succesful nickname change");

					var index = users.indexOf(socket.name);
					n = socket.name;
					users.splice(index,1);
					var tmp = colours[index];
					colours.splice(index,1);

					socket.name= name[0];
					username = socket.name;
					users.push(username);
					colours.push(tmp);
					socket.emit('current_User', socket.name);
					io.emit('list_of_users', {users: users});
				}
			}
			catch (error) {
				flag = true;
				errorMess = ("ERROR: To change nickname please use format: /nick <new nickname>");
				console.log(errorMess);
				socket.emit('error message', errorMess);
				flag = true;
			}
		}
		if (changeColour.toUpperCase() === "/nickColor".toUpperCase() || changeColour2.toUpperCase() === "/nickColour".toUpperCase()) {
			try {
				var c = msg.split(" ");
				c = c[1];

				if (c === undefined) {
					var errorMess = ("ERROR: To change nickname display color please user format: /nickColor RRGGBB");
					socket.emit('error message', errorMess);
					flag = true;
				}
				if (c.length === 6 ) {
					console.log("Successful colour change");
					socket.emit('change colour', c);
					for (var i=0; i<users.length; i++) {
						if (socket.name === users[i]) {
							colours[i] = c;
						}
					}
				}
				else {
					errorMess = ("ERROR: To change nickname display color please user format: /nickColor RRGGBB");
					socket.emit('error message', errorMess);
					flag = true;
				}
			}
			catch (error) {
				errorMess = ("ERROR: To change nickname display color please user format: /nickColor RRGGBB");
				socket.emit('error message', errorMess);
				flag = true;
			}
		}
	});
	
	socket.on('chat message', function(msg) {
		for (var i=0; i<users.length; i++) {
			if (socket.name === users[i]) {
				var colour = colours[i];
			} 
		}

		io.emit('chat message', " " + colour + " " + socket.name + ": " + msg);
		socket.emit('clear error', flag);


		if (memory.length > 200) {
			console.log("Memory full");
		}
		memory.push(time + " " + colour + " " + socket.name + ": " + msg);
		flag = false;
	});

	socket.on('disconnect', function(n) {
		var index = users.indexOf(socket.name);
		n = socket.name;
		users.splice(index,1);
		colours.splice(index, 1);
		console.log(n + ' disconnected');
		
		io.emit('disconnect', users);
		console.log("Updated user list: [" + users + "]");
		io.emit('list_of_users', {users: users});

	});
});

io.emit('some event', { for: 'everyone' });

http.listen(3000, function() {
	console.log('listening on *:3000');
});