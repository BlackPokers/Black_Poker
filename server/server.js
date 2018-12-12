// Expressを読み込む
var express = require("express");
var app = express();

app.use(function(req, res, next){
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});

var http = require("http").createServer(app).listen(8080);
var io = require("socket.io").listen(http);

var ID = [];

var mysql = require("mysql");

var con = mysql.createConnection({
	host: "localhost",
	user: "root",
	password: "mjfeodmd0",
	database: "BLACK_POKER"
});

con.connect(function(err){
	if (err) throw err;		
});

var Game = require("./Game");
var game = new Game();

io.on("connection", function(socket){

	io.to(socket.id).emit("onConnect", {id: socket.id});

	socket.on("login", function(data){
		if(ID.indexOf(data) != -1){
			io.to(socket.id).emit("login", {value: "Enrolled"});
		}else if(ID.length == 0){
			ID.push(data);
			addUser(data["name"]);
			io.to(data.id).emit("login", {value: "Welcome Black Poker!"});
		}else if(ID.length == 1){ 
			ID.push(data);
			addUser(data["name"]);
			io.to(data.id).emit("login", {value: "Welcome Black Poker!"});
			game.firstStep();
			socket.broadcast.emit("start");
			io.to(socket.id).emit("start");
			if(game.turnPlayer == 1){
				io.to(data.id).emit("myTurn");
			}else{
				socket.broadcast.emit("myTurn");
			}
		}else{
			io.to(socket.id).emit("login", {value: "No vacancy!"});
		}
	});

	socket.on("situation", function(){
		io.to(socket.id).emit("situation", {
			user_1: {
				id: ID[0]["id"],
				name: ID[0]["name"],
				hand: game.player[0].hand.cardList,
				deck: game.player[0].deck.cardList,
				cemetery: game.player[0].cemetery.cardList,
				barrier: [],
				soldier: [],
			},
			user_2: {
				id: ID[1]["id"],
				name: ID[1]["name"],
				hand: game.player[1].hand.cardList,
				deck: game.player[1].deck.cardList,
				cemetery: game.player[1].cemetery.cardList,
				barrier: [],
				soldier: [],
			},
		});
	});

	socket.on("turnEnd", function(){
		game.end();
		socket.broadcast.emit("turnEnd");
		game.starting();
		game.draw();
		socket.broadcast.emit("draw");
		judge();
	});

	socket.on("setBarrier", function(data){
		socket.broadcast.emit("setBarrier", {card: game.player[game.turnPlayer].hand.cardList[data["handLength"]]});
		socket.broadcast.emit("damage", 1);
		socket.broadcast.emit("handDecrease", {len: data["handLength"]});
		game.setBarrier(data["handLength"]);
		judge();
	});

	socket.on("summon", function(data){
		socket.broadcast.emit("summon", {card: game.player[game.turnPlayer].hand.cardList[data["handLength"]]});
		if(data["costLength"] != undefined){
			game.summonMagician(data["handLength"], data["costLength"], data["barrierLength"]);
			socket.broadcast.emit("driveBarrier", data["barrierLength"]);
			socket.broadcast.emit("handDecrease", {len: data["costLength"]});
		}else if(data["barrierLength"] != undefined){
			if(data["barrierLength"].length == 2){
				game.summonHero(data["handLength"], data["barrierLength"][0], data["barrierLength"][1]);
				socket.broadcast.emit("driveBarrier", data["barrierLength"][0]);
				socket.broadcast.emit("driveBarrier", data["barrierLength"][1]);
			}else{
				game.summonSoldier(data["handLength"], data["barrierLength"]);
				socket.broadcast.emit("driveBarrier", data["barrierLength"]);
			}
			socket.broadcast.emit("damage", 1);
		}else{
			game.summonAce(data["handLength"]);
			socket.broadcast.emit("damage", 1);
		}
		judge();
		socket.broadcast.emit("handDecrease", {len: data["handLength"]});
		situationF5();
	});

	socket.on("attack", function(data){
		console.log(game.player[game.turnPlayer].canAttack)
		if(game.player[game.turnPlayer].canAttack){
			game.attack(data["lengths"]);
			socket.broadcast.emit("attack", game.battler);
		}else{
			io.emit("notAttacable");
		}
	});

	socket.on("diffence", function(data){
		game.diffence(data.attack, data.place, data.lengths);
	});

	socket.on("diffence_end", function(){
		game.battle();
		judge();
		situationF5();
	});

	socket.on("chargeAll",function(){
		game.player[game.turnPlayer].field.chargeAll();
		socket.broadcast.emit("chargeAll");
	});

	function situationF5(){
		io.to(socket.id).emit("situation", {
			user_1: {
				id: ID[0]["id"],
				name: ID[0]["name"],
				hand: game.player[0].hand.cardList,
				deck: game.player[0].deck.cardList,
				cemetery: game.player[0].cemetery.cardList,
				barrier: game.player[0].field.barrier,
				soldier: game.player[0].field.soldier,
			},
			user_2: {
				id: ID[1]["id"],
				name: ID[1]["name"],
				hand: game.player[1].hand.cardList,
				deck: game.player[1].deck.cardList,
				cemetery: game.player[1].cemetery.cardList,
				barrier: game.player[1].field.barrier,
				soldier: game.player[1].field.soldier,
			},
		});
		socket.broadcast.emit("situation", {
			user_1: {
				id: ID[0]["id"],
				name: ID[0]["name"],
				hand: game.player[0].hand.cardList,
				deck: game.player[0].deck.cardList,
				cemetery: game.player[0].cemetery.cardList,
				barrier: game.player[0].field.barrier,
				soldier: game.player[0].field.soldier,
			},
			user_2: {
				id: ID[1]["id"],
				name: ID[1]["name"],
				hand: game.player[1].hand.cardList,
				deck: game.player[1].deck.cardList,
				cemetery: game.player[1].cemetery.cardList,
				barrier: game.player[1].field.barrier,
				soldier: game.player[1].field.soldier,
			},
		});
	}

});

function addUser(name){
	con.query("INSERT INTO BLACK_POKER.INNER VALUES('" + name + "');", function(err){
		if(err) throw err;
	});
}

function judge(){
	if(game.player[0].deck.cardList.length == 0){
		io.emit("fin", 0);
	}else if(game.player[1].deck.cardList.length == 0){
		io.emit("fin", 0);
	}else{
		io.emit("de", [game.player[0].deck.length, game.player[1].deck.length])
	}
}