/*global require */

var mysql = require("mysql");
var express = require("express");
var Game = require("./Game");

var app = express();

var con = mysql.createConnection({
	host: "localhost",
	user: "root",
	password: "mjfeodmd0",
	database: "BLACK_POKER"
});

var game = null;

con.connect(function(err) {
	if (err) throw err;		
});

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get("/enter",function(req, res){
	con.query("SELECT COUNT(*) as count FROM BLACK_POKER.INNER;", function (err_2, result_2) {
		if (err_2) throw err_2;
		if(result_2[0].count < 2){
			con.query("INSERT INTO BLACK_POKER.INNER VALUES('" + req.query.id + "');", function (err_3) {
				if(err_3) throw err_3;
				res.send("Welcome Black Poker!");
				if(result_2[0].count == 1){
					game = new Game();
					game.firstStep();
					game.player[game.turnPlayer == 0 ? 1: 0].canDraw = 2;
				}
			});
		}else{
			res.send("No vacancy!");
		}
		
	});
});

app.get("/overLap",function(req, res){
	con.query("SELECT * FROM BLACK_POKER.INNER;", function (err, result) {
		if (err) throw err;
		if(result.length < 2){
			if(result[0] != undefined && result[0].user == req.query.id){
				res.send(true);
			}else{
				res.send(false);
			}
		}else{
			res.send("No vacancy!");
		}
		
	});
});

app.get("/turnEnd", function(req, res){
	con.query("SELECT * FROM BLACK_POKER.INNER;", function (err, result) {
		if (err) throw err;
		if(result[0].user == req.query.id || result[1].user == req.query.id){
			var plyrName = result[0].user;
			con.query("DELETE FROM BLACK_POKER.INNER WHERE user = '" + result[0].user + "'");
			con.query("INSERT INTO BLACK_POKER.INNER VALUES('" + result[0].user + "')");
			console.log('turn end');
		}else{
			res.send("No vacancy!");
		}
	});
});

app.get("/isStart", function(req, res){
	con.query("SELECT COUNT(*) as count FROM BLACK_POKER.INNER;", function (err, result) {
		if (err) throw err;
		if(result[0].count < 2){
			res.send("false");
		}else{
			con.query("SELECT * FROM BLACK_POKER.INNER;", function (err, result) {
				if (err) throw err;
				if(result[0].user == req.query.id || result[1].user == req.query.id){
					var plyrNum;
					if(result[0].user == req.query.id){
						plyrNum = 0;
					}else{
						plyrNum = 1;
					}
					res.send("true\n" + game.player[plyrNum].cemetery.cardList + "\n" + game.player[(plyrNum == 0 ? 1 : 0)].cemetery.cardList + "");
				}else{
					res.send("No vacancy!");
				}
			});
		}
		
	});
});

app.get("/isMyTurn", function(req, res){
	con.query("SELECT * FROM BLACK_POKER.INNER;", function (err, result) {
		if (err) throw err;
		if(result[0].user == req.query.id || result[1].user == req.query.id){
			var plyrNum;
			if(result[0].user == req.query.id){
				plyrNum = 0;
			}else{
				plyrNum = 1;
			}
			if(game.turnPlayer == plyrNum){
				res.send("true");
			}else{
				res.send("false");
			}
		}else{
			res.send("No vacancy!");
		}
	});
});

app.get("/deckNumber", function(req, res){
	con.query("SELECT * FROM BLACK_POKER.INNER;", function (err, result) {
		if (err) throw err;
		if(result[0].user == req.query.id || result[1].user == req.query.id){
			var plyrNum;
			if(result[0].user == req.query.id){
				plyrNum = 0;
			}else{
				plyrNum = 1;
			}
			res.send(game.player[plyrNum].deck.cardList.length + "");
		}else{
			res.send("No vacancy!");
		}
	});
});

app.get("/handNumber", function(req, res){
	con.query("SELECT * FROM BLACK_POKER.INNER;", function (err, result) {
		if (err) throw err;
		if(result[0].user == req.query.id || result[1].user == req.query.id){
			var plyrNum;
			if(result[0].user == req.query.id){
				plyrNum = 0;
			}else{
				plyrNum = 1;
			}
			res.send(game.player[plyrNum].hand.cardList.length + "");
		}else{
			res.send("No vacancy!");
		}
	});
});

app.get("/enemyHand", function(req, res){
	con.query("SELECT * FROM BLACK_POKER.INNER;", function (err, result) {
		if (err) throw err;
		if(result[0].user == req.query.id || result[1].user == req.query.id){
			var plyrNum;
			if(result[0].user == req.query.id){
				plyrNum = 1;
			}else{
				plyrNum = 0;
			}
			res.send(game.player[plyrNum].hand.cardList.length + "");
		}else{
			res.send("No vacancy!");
		}
	});
});

app.get("/handKind", function(req, res){
	con.query("SELECT * FROM BLACK_POKER.INNER;", function (err, result) {
		if (err) throw err;
		if(result[0].user == req.query.id || result[1].user == req.query.id){
			var plyrNum;
			if(result[0].user == req.query.id){
				plyrNum = 0;
			}else{
				plyrNum = 1;
			}
			res.send(game.player[plyrNum].hand.cardList + "");
		}else{
			res.send("No vacancy!");
		}
	});
});

app.get("/fieldKind", function(req, res){
	con.query("SELECT * FROM BLACK_POKER.INNER;", function (err, result) {
		if (err) throw err;
		if(result[0].user == req.query.id || result[1].user == req.query.id){
			var plyrNum;
			if(result[0].user == req.query.id){
				plyrNum = 0;
			}else{
				plyrNum = 1;
			}
			console.log("[" + game.player[plyrNum].field.soldier + "],[" + game.player[plyrNum].field.barrier + "]");
			res.send("[" + game.player[plyrNum].field.soldier + "],[" + game.player[plyrNum].field.barrier + "]");
		}else{
			res.send("No vacancy!");
		}
	});
});

app.get("/enemyFieldKind", function(req, res){
	con.query("SELECT * FROM BLACK_POKER.INNER;", function (err, result) {
		if (err) throw err;
		if(result[0].user == req.query.id || result[1].user == req.query.id){
			var plyrNum;
			if(result[0].user == req.query.id){
				plyrNum = 1;
			}else{
				plyrNum = 0;
			}
			{
				var soldiernum = game.player[plyrNum].field.soldier.length - 1;
				var barriernum = game.player[plyrNum].field.barrier.length - 1;
				res.send("[" + game.player[plyrNum].field.soldier[soldiernum] + "]:[" + game.player[plyrNum].field.barrier[barriernum] + "]");		
			}

		}else{
			res.send("No vacancy!");
		}
	});
});

/*
app.get("/enemyBarrierKind", function(req, res){
	con.query("SELECT * FROM BLACK_POKER.INNER;", function (err, result) {
		if (err) throw err;
		if(result[0].user == req.query.id || result[1].user == req.query.id){
			var plyrNum;
			if(result[0].user == req.query.id){
				plyrNum = 1;
			}else{
				plyrNum = 0;
			}
			{
				res.send(game.player[plyrNum].field.barrier[game.player[plyrNum].field.barrier.length - 1] + "");		
			}

		}else{
			res.send("No vacancy!");
		}
	});
});
*/

app.get("/cemeteryKind", function(req, res){
	con.query("SELECT * FROM BLACK_POKER.INNER;", function (err, result) {
		if (err) throw err;
		if(result[0].user == req.query.id || result[1].user == req.query.id){
			var plyrNum;
			if(result[0].user == req.query.id){
				plyrNum = 0;
			}else{
				plyrNum = 1;
			}
			res.send(game.player[plyrNum].cemetery.cardList + "");
		}else{
			res.send("No vacancy!");
		}
	});
});

app.get("/cemeteryNumber", function(req, res){
	con.query("SELECT * FROM BLACK_POKER.INNER;", function (err, result) {
		if (err) throw err;
		if(result[0].user == req.query.id || result[1].user == req.query.id){
			var plyrNum;
			if(result[0].user == req.query.id){
				plyrNum = 0;
			}else{
				plyrNum = 1;
			}
			res.send(game.player[plyrNum].cemetery.cardList.length + "");
		}else{
			res.send("No vacancy!");
		}
	});
});

app.get("/summonAce", function(req, res){
	con.query("SELECT * FROM BLACK_POKER.INNER;", function (err, result) {
		if (err) throw err;
		if(result[0].user == req.query.id || result[1].user == req.query.id){
			var plyrNum;
			if(result[0].user == req.query.id){
				plyrNum = 0;
			}else{
				plyrNum = 1;
			}
			game.player[plyrNum].summonAce(req.query.length);
			res.send("");
		}else{
			res.send("No vacancy!");
		}
	});
});

app.get("/setBarrier", function(req, res){
	con.query("SELECT * FROM BLACK_POKER.INNER;", function (err, result) {
		if (err) throw err;
		if(result[0].user == req.query.id || result[1].user == req.query.id){
			var plyrNum;
			if(result[0].user == req.query.id){
				plyrNum = 0;
			}else{
				plyrNum = 1;
			}
			console.log(req.query.length);
			game.player[plyrNum].setBarrier(req.query.length);
			res.send("");
		}else{
			res.send("No vacancy!");
		}
	});
});

app.get("/summonSoldier", function(req, res){
	con.query("SELECT * FROM BLACK_POKER.INNER;", function (err, result) {
		if (err) throw err;
		if(result[0].user == req.query.id || result[1].user == req.query.id){
			var plyrNum;
			if(result[0].user == req.query.id){
				plyrNum = 0;
			}else{
				plyrNum = 1;
			}
			game.player[plyrNum].summonSoldier(req.query.length, req.query.barrier);
			res.send("");
		}else{
			res.send("No vacancy!");
		}
	});
});

/*
app.get("/summonHero", function(req, res){
	con.query("SELECT * FROM BLACK_POKER.INNER;", function (err, result) {
		if (err) throw err;
		if(result[0].user == req.query.id || result[1].user == req.query.id){
			var plyrNum;
			if(result[0].user == req.query.id){
				plyrNum = 0;
			}else{
				plyrNum = 1;
			}
			game.player[plyrNum].summonHero(req.query.length);
			res.send("");
		}else{
			res.send("No vacancy!");
		}
	});
});

app.get("/summonMagician", function(req, res){
	con.query("SELECT * FROM BLACK_POKER.INNER;", function (err, result) {
		if (err) throw err;
		if(result[0].user == req.query.id || result[1].user == req.query.id){
			var plyrNum;
			if(result[0].user == req.query.id){
				plyrNum = 0;
			}else{
				plyrNum = 1;
			}
			game.player[plyrNum].summonMagician(req.query.length);
			res.send("");
		}else{
			res.send("No vacancy!");
		}
	});
});
*/

app.listen(8080);

