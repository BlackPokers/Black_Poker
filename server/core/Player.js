var Cemetery = require("./Cemetery");
var Deck = require("./Deck");
var Field = require("./Field");
var Hand = require("./Hand");

var Player = function(deckList){
	this.hand = new Hand();
	this.field = new Field();
	this.cemetery = new Cemetery();
	this.canAttack = true;
	this.deck = new Deck(deckList);
	this.deck.shuffle();
	this.canDraw = 7;
	for(var i = 0; i < 7; i++){this.draw();}
};

Player.prototype.draw = function(){
	this.hand.add(this.deck.draw());
};

Player.prototype.draws = function(num){
	for(var i = 0; i < num; i++){
		this.hand.add(this.deck.draw());
	}
};

Player.prototype.firstStep = function(){
	var card = this.deck.firstStep();
	this.cemetery.add(card);
	return [card.number, card.mark];
};

Player.prototype.charge = function(){
	this.field.chargeAll();
	this.field.canAttackAll();
};

Player.prototype.cleanUp = function(length){
	if(this.hand.length > 7){
		this.cemetery.add(this.hand.get(length));
	}
};

Player.prototype.damage = function(){
	this.cemetery.add(this.deck.damage());
};

Player.prototype.damages = function(num){
	for(var i = 0; i < num; i++){
		this.damage();
	}
};

Player.prototype.setBarrier = function(length){
	this.damage();
	this.field.setBarrier(this.hand.get(length));
};

Player.prototype.summonSoldier = function(handLength, barrierLength){
	this.damage();
	this.field.drive("barrier", barrierLength);
	this.field.summon(this.hand.get(handLength));
};

Player.prototype.summonAce = function(handLength){
	this.damage();
	this.field.summon(this.hand.get(handLength));
};

Player.prototype.summonHero = function(handLength, barrierLength_1, barrierLength_2){
	this.damage();
	this.field.drive("barrier", barrierLength_1);
	this.field.drive("barrier", barrierLength_2);
	this.field.summon(this.hand.get(handLength));
};

Player.prototype.summonMagician = function(handLength, costHandLength, barrierLength){
	this.field.drive("barrier", barrierLength);
	if(handLength > costHandLength){
		this.field.summon(this.hand.get(handLength));
		this.cemetery.add(this.hand.get(costHandLength));
	}else{
		this.cemetery.add(this.hand.get(costHandLength));
		this.field.summon(this.hand.get(handLength));
	}
};

Player.prototype.declarationAttack = function(soldierLength){
	var attaker = [];
	for(var i = 0; i < soldierLength.length; i++){
		if(this.field.soldier[soldierLength[i]].canAttack){
			attaker.push(this.field.soldier[soldierLength[i]]);
			this.field.drive("soldier", soldierLength[i]);
		}
	}
	return attaker;
};

Player.prototype.destruction = function(place, length){
	var card = this.field.destruction(place, length);
	if(card.number == 0 || card.number == 1 || (card.number >= 11 && card.number <= 13)){
		this.alternation();
	}
	this.cemetery.add(card);
};

Player.prototype.alternation = function(){
	var card;
	const True = true;

	while(True){
		card = this.deck.getTop();
		if((card.number == 0 || card.number == 1 || (card.number >= 11 && card.number <= 13))){
			break;
		}
		this.cemetery.add(card);
	}
	this.hand.add(card);
};

Player.prototype.declarationDefense = function(soldierLength){
	var num = 0;
	for(var i = 0; i < soldierLength.length; i++){
		this.field.drive("soldier", soldierLength[i]);
		num += this.field.soldier[soldierLength[i]].number;
	}
	return num;
};

Player.prototype.declarationDefenseBarrier = function(length){
	this.field.drive("barrier", length);
	this.field.open(length);
};

Player.prototype.noCostSpell = function(handLength){
	this.cemetery.add(this.hand.get(handLength));
};

Player.prototype.onceSpell = function(handLength, costLength){
	this.cemetery.add(this.hand.get(costLength));
	this.cemetery.add(this.hand.get(handLength));
};

Player.prototype.twiceSpell = function(handLengths){
	this.cemetery.add(this.hand.get(handLengths[0]));
	this.cemetery.add(this.hand.get(handLengths[1]));
};

Player.prototype.up = function(handLength, costLength, length){
	var num = this.hand.cardList[handLength].number;
	this.field.soldier[length].attack += num;
	this.onceSpell(handLength, costLength);
};

Player.prototype.down = function(length, handLength, costLength){
	var num = this.hand.cardList[handLength].number;
	this.onceSpell(handLength, costLength);
	return num;
};

Player.prototype.twist = function(handLength, costLength, player, length){
	if(player){
		var num = this.hand.cardList[handLength].number;
		this.field.soldier[length].attack += num;
	}
	this.onceSpell(handLength, costLength);
};

Player.prototype.counter = function(handLength, costLength){
	this.onceSpell(handLength, costLength);
};

Player.prototype.barrierDefense = function(handLengths, player, length){
	if(player){
		this.destruction("barrier", length);
	}
	this.twiceSpell(handLengths);
};

Player.prototype.throwing = function(handLengths){
	this.twiceSpell(handLengths);
	if(handLengths[0].mark == "spade"){
		return handLengths[0].number;
	}else{
		return handLengths[1].number;
	}
};

Player.prototype.search = function(length, number, mark){
	this.noCostSpell(length);
	this.deck.search(number, mark);
};

module.exports = Player;