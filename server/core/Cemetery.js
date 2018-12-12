
var Cemetery = class{
	constructor(){
		this.cardList = [];
	}

	add(card){
		this.cardList.push(card);
	}
	
	get(length){
		var card = this.cardList[length];
		card.splice(length, 1);
		return card;
	}

};

module.exports = Cemetery;

/*
var Cemetery = function() {
	this.cardList = [];
};

Cemetery.prototype.add = function(card){
	this.cardList.push(card);
};

Cemetery.prototype.get = function(length){
	var card = this.cardList[length];
	card.splice(length, 1);
	return card;
};


module.exports = Cemetery;
 */