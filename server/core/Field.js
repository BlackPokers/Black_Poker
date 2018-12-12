var Field = class{
	constructor(){
		this.soldier = [];
		this.barrier = [];
	}

	setBarrier (card){
		this.barrier.push(card);
		this.barrier[this.barrier.length - 1].isCharge = true;
		this.barrier[this.barrier.length - 1].isFront = true;
	}
	
	summon (card){
		this.soldier.push(card);
		if(card.job == "ace" || card.job == "magician"){
			this.soldier[this.soldier.length - 1].canAttack = true;
		}
	}
	
	lookAttackable (){
		var list = [];
		for(var i = 0; i < this.soldier.length; i++){
			if(this.soldier[length].canAttack){
				list.push(this.soldier[length]);
			}
		}
		return list;
	}
	
	recoveryAll (){
		for(var i = 0; i < this.soldier.length; i++){
			this.recovery(i);
		}
	}
	
	recovery (length){
		this.soldier[length].canAttack = true;
	}
	
	chargeAll (){
		for(var i = 0; i < this.soldier.length; i++){
			this.charge("soldier", i);
		}
		
		for(i = 0; i < this.barrier.length; i++){
			this.charge("barrier", i);
		}
	}
	
	canAttackAll (){
		for(var i = 0; i < this.soldier.length; i++){
			this.soldier[i].canAttack = true;
		}
	}
	
	charge (place, length){
		if(place == "soldier"){
			this.soldier[length].isCharge = true;
		}else if(place == "barrier"){
			this.barrier[length].isCharge = true;
		}
	}
	
	drive (place, length){
		if(place == "soldier"){
			this.soldier[length].isCharge = false;
		}else if(place == "barrier"){
			this.barrier[length].isCharge = false;
		}
	}
	
	destruction (place, length){
		var card;
		if(place == "soldier"){
			card = this.soldier[length];
			this.soldier.splice(length, 1);
		}else if(place == "barrier"){
			card = this.barrier[length];
			this.barrier.splice(length, 1);
		}
		return card;
	}
	
	open (length){
		this.barrier[length].isFront = true;
	}
};

module.exports = Field;

/*
var Field = function(){
	this.soldier = [];
	this.barrier = [];
};

Field.prototype.setBarrier = function(card){
	this.barrier.push(card);
	this.barrier[this.barrier.length - 1].isCharge = true;
	this.barrier[this.barrier.length - 1].isFront = true;
};

Field.prototype.summon = function(card){
	this.soldier.push(card);
	if(card.job == "ace" || card.job == "magician"){
		this.soldier[this.soldier.length - 1].canAttack = true;
	}
};

Field.prototype.lookAttackable = function(){
	var list = [];
	for(var i = 0; i < this.soldier.length; i++){
		if(this.soldier[length].canAttack){
			list.push(this.soldier[length]);
		}
	}
	return list;
};

Field.prototype.recoveryAll = function(){
	for(var i = 0; i < this.soldier.length; i++){
		this.recovery(i);
	}
};

Field.prototype.recovery = function(length){
	this.soldier[length].canAttack = true;
};

Field.prototype.chargeAll = function(){
	for(var i = 0; i < this.soldier.length; i++){
		this.charge("soldier", i);
	}
	
	for(i = 0; i < this.barrier.length; i++){
		this.charge("barrier", i);
	}
};

Field.prototype.canAttackAll = function(){
	for(var i = 0; i < this.soldier.length; i++){
		this.soldier[i].canAttack = true;
	}
};

Field.prototype.charge = function(place, length){
	if(place == "soldier"){
		this.soldier[length].isCharge = true;
	}else if(place == "barrier"){
		this.barrier[length].isCharge = true;
	}
};

Field.prototype.drive = function(place, length){
	if(place == "soldier"){
		this.soldier[length].isCharge = false;
	}else if(place == "barrier"){
		this.barrier[length].isCharge = false;
	}
};

Field.prototype.destruction = function(place, length){
	var card;
	if(place == "soldier"){
		card = this.soldier[length];
		this.soldier.splice(length, 1);
	}else if(place == "barrier"){
		card = this.barrier[length];
		this.barrier.splice(length, 1);
	}
	return card;
};

Field.prototype.open = function(length){
	this.barrier[length].isFront = true;
};

module.exports = Field;
 */