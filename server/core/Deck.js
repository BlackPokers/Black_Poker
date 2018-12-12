var Deck = class{
	
	constructor(cardList){
		this.cardList = cardList;
	}

	firstStep (){
		return this.getTop();
	}
	
	getTop (){
		var card = this.cardList[0];
		this.cardList.shift();
		return card;
	}
	
	draw (){
		return this.getTop();
	}
	
	damage (){
		return this.getTop();
	}
	
	get (length){
		var card = this.cardList[length];
		this.cardList.splice(length, 1);
		return card;
	}
	
	shuffle (){
		for(var i = this.cardList.length - 1; i > 0; i--){
			var r = Math.floor(Math.random() * (i + 1));
			var tmp = this.cardList[i];
			this.cardList[i] = this.cardList[r];
			this.cardList[r] = tmp;
		}
	}
	
	search (number, mark){
		for(var i = 0; i < this.cardList.length; i++){
			if(this.cardList[i].number == number && this.cardList[i].mark == mark){
				return this.get(i);
			}
		}
		return null;
	}
};

module.exports = Deck;

/*
var Deck = function(cardList){
	this.cardList = cardList;
};

Deck.prototype.firstStep = function(){
	return this.getTop();
};

Deck.prototype.getTop = function(){
	var card = this.cardList[0];
	this.cardList.shift();
	return card;
};

Deck.prototype.draw = function(){
	return this.getTop();
};

Deck.prototype.damage = function(){
	return this.getTop();
};

Deck.prototype.get = function(length){
	var card = this.cardList[length];
	this.cardList.splice(length, 1);
	return card;
};

Deck.prototype.shuffle = function(){
	for(var i = this.cardList.length - 1; i > 0; i--){
		var r = Math.floor(Math.random() * (i + 1));
		var tmp = this.cardList[i];
		this.cardList[i] = this.cardList[r];
		this.cardList[r] = tmp;
	}
};

Deck.prototype.search = function(number, mark){
	for(var i = 0; i < this.cardList.length; i++){
		if(this.cardList[i].number == number && this.cardList[i].mark == mark){
			return this.get(i);
		}
	}
	return null;
};

module.exports = Deck;
 */