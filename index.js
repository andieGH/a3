var app= require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var users = new Array(0);
var duplicate = true;
var flag = false;

app.get('/', function(req, res) {
	res.sendFile(__dirname + '/index.html');
});

app.get('/a3.css', function(req,res) {
	res.setHeader('content-type', 'text/css');
	res.sendFile(__dirname + '/a3.css');
});

app.get('/', function(req, res) {
	  res.cookie("My First Cookie", "Yeah!");
	  res.send("Created a cookie!");
});

/*
var duplicate = true;
var cookieParser = require('cookie-parser')
app.use(cookieParser())



app.get('/list', function(req, res) {
	res.send(req.cookies);
});

app.get('/', function(req, res) {
	res.sendFile(__dirname + '/index.html');
	 if (req.cookies["visits"]) {
	    res.cookie("visits", req.cookies["visits"] - 0 + 1);
	    res.send("Welcome to the website! You have been here " + req.cookies["visits"] + " times before");
	  } else {
	    	res.cookie("visits", 0);
	    	res.send("Welcome to the website! This is your first time here!");
		}
});
*/

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

	// Send the list of users.
	socket.emit('list_of_users', {users: users});
	io.emit('list_of_users', {users: users});

	socket.name = username;
	socket.emit('current_User', socket.name);
	console.log("socket.name = " + socket.name);

	socket.on('chat message', function(msg){
		var d = new Date();
 		var time = d.getTime();
		// Send the timestamp unformatted
		io.emit('send_Timestamp', time);

		console.log(username + " " + "message: " + msg);
		var changeNick = msg.substring(0, 5);
		var changeColour = msg.substring(0, 10);
		var changeColour2 = msg.substring(0,11);

		if (changeNick === "/nick" && changeColour2 !== "/nickColour" && changeColour != "/nickColor"){
			try {
				var res = msg.split("<");
				var name = res[1].split(">");
				n = socket.name;
				
				for (var i=0; i<users.length; i++) {
					if (users[i] === name[0]) {
						var errorMess = ("ERROR - This nickname is already being used, please choose a different nickname.");
						socket.emit('error message', errorMess);
						flag = true;
					}
				}

				if (flag === false) {
					console.log("Succesful nickname change");

					var index = users.indexOf(socket.name);
					n = socket.name;
					users.splice(index,1);

					socket.name= name[0];
					username = socket.name;
					users.push(username);
					socket.emit('current_User', socket.name);
					io.emit('list_of_users', {users: users});
				}
			}
			catch (error) {
				flag = true;
				errorMess = ("ERROR: to change nickname please use format: /nick <new nickname>");
				console.log(errorMess);
				socket.emit('error message', errorMess);
				flag = true;
			}
		}
		if (changeColour === "/nickColor" || changeColour2 === "/nickColour") {
			try {
				var c = msg.split(" ");
				c = c[1];

				if (c === undefined) {
					var errorMess = ("ERROR: to change nickname display color please user format: /nickColor RRGGBB");
					socket.emit('error message', errorMess);
					flag = true;
				}
				if (c.length === 6 ) {
					socket.emit('change colour', c);
				}
				else {
					errorMess = ("ERROR: to change nickname display color please user format: /nickColor RRGGBB");
					socket.emit('error message', errorMess);
					flag = true;
				}
			}
			catch (error) {
				errorMess = ("ERROR: to change nickname display color please user format: /nickColor RRGGBB");
				socket.emit('error message', errorMess);
				flag = true;
			}
		}
	});
	
	socket.on('chat message', function(msg) {
		io.emit('chat message', " " + socket.name + ": " + msg);
		socket.emit('clear error', flag);
		flag = false;
	});

	socket.on('disconnect', function(n) {
		var index = users.indexOf(socket.name);
		n = socket.name;
		users.splice(index,1);
		
		io.emit('disconnect', users);
		console.log(n + ' disconnected');
		console.log("Updated user list: [" + users + "]");
		io.emit('list_of_users', {users: users});

	});
});

io.emit('some event', { for: 'everyone' });

http.listen(3000, function() {
	console.log('listening on *:3000');
});