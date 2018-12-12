var Hand = function() {
	this.cardList = [];
};

Hand.prototype.add = function(card){
	this.cardList.push(card);
};

Hand.prototype.get = function(length){
	var card = this.cardList[length];
	this.cardList.splice(length, 1);
	return card;
};

module.exports = Hand;