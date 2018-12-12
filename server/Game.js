var core = require("./core/index.js");
var Card = core.Card;
var Player = core.Player;

var Game = function(){
	this.player = [new Player(makeStarterDeck()), new Player(makeStarterDeck())];
	this.turn = 0;
	this.turnPlayer = 0;
	this.battler = [];
	this.pName0 = null;
	this.pName1 = null;
};

Game.prototype.setBarrier = function(length){
	this.player[this.turnPlayer].setBarrier(length);
};

Game.prototype.summonAce = function(length){
	this.player[this.turnPlayer].summonAce(length);
};

Game.prototype.summonSoldier = function(handLength, barrierLength){
	this.player[this.turnPlayer].summonSoldier(handLength, barrierLength);
};

Game.prototype.summonHero = function(handLength, barrierLength_1, barrierLength_2){
	this.player[this.turnPlayer].summonHero(handLength, barrierLength_1, barrierLength_2);
};

Game.prototype.summonMagician = function(handLength, costHandLength, barrierLength){
	this.player[this.turnPlayer].summonMagician(handLength, costHandLength, barrierLength);
};

Game.prototype.draw = function(){
	this.player[this.turnPlayer].draw();
};

Game.prototype.end = function(){
	this.turn++;
	this.turnPlayer = this.turnPlayer == 0 ? 1: 0;
};

Game.prototype.starting = function(){
	this.player[this.turnPlayer].charge();
	this.player[this.turnPlayer].canDraw = 2;
	this.player[this.turnPlayer].canAttack = true;
};

Game.prototype.attack = function(lengths){
	this.player[this.turnPlayer].canAttack = false;
	var attacker =  this.player[this.turnPlayer].declarationAttack(lengths);
	for(var i = 0; i < attacker.length; i++){
		this.battler.push({attack: {card: attacker[i], len: lengths[i]}});
	}
};

Game.prototype.diffence = function(attack, place, lengths){
	console.log(attack);
	console.log(place);
	console.log(lengths);
	var attackLength = this.searchBattler(attack);
	if(place == "barrier"){
		this.player[this.turnPlayer == 0 ? 1 : 0].declarationDefenseBarrier(lengths[0]);
		this.battler[attackLength].barrier = {card:this.player[this.turnPlayer == 0 ? 1 : 0].field.barrier[lengths[0]], len: lengths[0]};
	}else{
		this.battler[attackLength].diffence = [];
		for(var i = 0; i < lengths.length; i++){
			this.player[this.turnPlayer == 0 ? 1 : 0].declarationDefense(lengths[i]);
			this.battler[attackLength].diffence.push({card: this.player[this.turnPlayer == 0 ? 1 : 0].field.soldier[lengths[i]], len: lengths[i]});
		}
	}
};

Game.prototype.searchBattler = function(attack){
	for(var i = 0; i < this.battler.length; i++){
		if(this.battler[i].attack.card.mark == attack.card.mark && this.battler[i].attack.card.number == attack.card.number){
			return i;
		}
	}
	return -1;
};

Game.prototype.battle = function(){
	console.log(this.battler);
	for(var i = 0; i < this.battler.length; i++){
		if(this.battler[i] == undefined){
			continue;
		}
		if(this.battler[i].barrier != undefined){
			var bool = false;
			bool = this.battler[i].barrier.number == this.battler[i].attack.number;
			console.log(bool);
			if(bool){
				this.player[this.turnPlayer].destruction("soldier", this.battler[i].attack.len);
			}
			this.player[this.turnPlayer == 0 ? 1 : 0].destruction("barrier", this.battler[i].barrier.len);
		//}else if(this.battler[i].diffence && this.battler[i].diffence != undefined && this.battler[i].diffence != [] && this.battler[i].diffence.len && this.battler[i].diffence != null){
		}else if(this.battler[i].diffence != undefined){
			var numAtk = this.battler[i].attack.card.attack;
			var numDfc = 0;
			for(var j = 0; j < this.battler[i].diffence.length; j++){
				numDfc += this.player[this.turnPlayer == 0 ? 1 : 0].field.soldier[this.battler[i].diffence[j].len].attack;
			}
			if(numAtk == numDfc){
				this.player[this.turnPlayer].destruction("soldier", this.battler[i].attack.len);
				for(j = 0; j < this.battler[i].diffence.length; j++){
					this.player[this.turnPlayer == 0 ? 1 : 0].destruction("soldier", this.battler[i].diffence[j].len);
				}
			}else if(numAtk > numDfc){
				for(j = 0; j < this.battler[i].diffence.length; j++){
					this.player[this.turnPlayer == 0 ? 1 : 0].destruction("soldier", this.battler[i].diffence[j].len);
				}
			}else{
				this.player[this.turnPlayer].destruction("soldier", this.battler[i].attack.len);
			}
		}else{
			this.player[this.turnPlayer == 0 ? 1 : 0].damages(this.battler[i].attack.card.attack);
			console.log("damage:" + this.battler[i].attack.card.attack);
		}
	}
	this.battler = [];
};

Game.prototype.firstStep = function(pName0, pName1){
	var flag = true;
	var Temp1;
	var FirstNum1;
	var FirstMark1;
	var Temp2;
	var FirstNum2;
	var FirstMark2;
	while(flag){
		flag = false;
		Temp1 = this.player[0].firstStep();
		FirstNum1 = Temp1[0];
		FirstMark1 = Temp1[1];
		Temp2 = this.player[1].firstStep();
		FirstNum2 = Temp2[0];
		FirstMark2 = Temp2[1];
		if(FirstNum1 > FirstNum2){this.turnPlayer = 0;}
		else if(FirstNum1 < FirstNum2){this.turnPlayer = 1;}
		else{
			if(compareMark(FirstMark1, FirstMark2) == 1){this.turnPlayer = 0;}
			else if(compareMark(FirstMark1, FirstMark2) == -1){this.turnPlayer = 1;}
			else{
				flag = false;
			}
		}
	}
	this.pName0 = this.turnPlayer == 0 ? pName0 : pName1;
	this.pName1 = this.turnPlayer == 1 ? pName0 : pName1;
};

function compareMark(mark_1, mark_2){
	var num_1 = markToNumber(mark_1);
	var num_2 = markToNumber(mark_2);
	if(num_1 > num_2){return 1;}
	else if(num_1 < num_2){return -1;}
	if(num_1 == num_2){return 0;}
}

function markToNumber(mark){
	if(mark == "joker"){
		return 0;
	}else if(mark == "spade"){
		return 1;
	}else if(mark == "diamond"){
		return 3;
	}else if(mark == "heart"){
		return 2;
	}else if(mark == "clover"){
		return 4;
	}
}

function makeStarterDeck(){
	var list = [];
	list.push(new Card(0, "joker"));
	list.push(new Card(0, "joker"));
	for(var i = 1; i <= 13; i++){
		list.push(new Card(i, "spade"));
		list.push(new Card(i, "heart"));
		list.push(new Card(i, "diamond"));
		list.push(new Card(i, "clover"));
	}
	return list;
}

module.exports = Game;