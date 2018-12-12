var Card = function(number, mark) {
	this.number = number;
	this.attack = this.number;
	this.canAttack = false;
	this.mark = mark;
	this.isCharge = false;
	this.isFront = false;
	this.job = "";
	if(this.number >= 2 && this.number <= 10){
		this.job = "soldier";
	}else if(this.number >= 11 && this.number <= 13){
		this.job = "hero";
	}else if(this.number == 1){
		this.job = "ace";
	}else if(this.number == 0){
		this.job = "magician";
	}
};

Card.prototype.toString = function(){
	return "[" + this.number + "," + this.mark + "]";
}
