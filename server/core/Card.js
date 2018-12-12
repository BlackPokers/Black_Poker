
var Card = class{
	constructor(number, mark){
		this.number = number;
		this.attack = this.number;
		this.canAttack = false;
		this.mark = mark;
		this.isCharge = true;
		this.isFront = false;
		this.job = "";
		if(this.number >= 2 && this.number <= 10){
			this.job = "soldier";
		}else if(this.number >= 11 && this.number <= 13){
			this.job = "hero";
		}else if(this.number == 1){
			this.job = "ace";
			this.canAttack = true;
		}else if(this.number == 0){
			this.job = "magician";
			this.canAttack = true;
		}
	}
	toString(){
		return "[" + this.number + "," + this.mark + "]";
	}
};

module.exports = Card;


/*var Card = function(number, mark){
	this.number = number;
	this.attack = this.number;
	this.canAttack = false;
	this.mark = mark;
	this.isCharge = true;
	this.isFront = false;
	this.job = "";
	if(this.number >= 2 && this.number <= 10){
		this.job = "soldier";
	}else if(this.number >= 11 && this.number <= 13){
		this.job = "hero";
	}else if(this.number == 1){
		this.job = "ace";
		this.canAttack = true;
	}else if(this.number == 0){
		this.job = "magician";
		this.canAttack = true;
	}
};

Card.prototype.toString = function(){
	return "[" + this.number + "," + this.mark + "]";
};

module.exports = Card;*/