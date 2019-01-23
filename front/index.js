
/*global io*/
var socket = null;
var datas = {id: null, name: null};
var lockId = "lockId";
var turn = 0;
var situation = [];
var user, enemy;
var prm;
var holder;
var handList = [];
var setBarrierCount;
var enemyBarrier;
var enemyBarrierDrive;
var enemyField;
var selected1 = undefined;
var selected2 = undefined;
var dataCpy;
var cardData;
var selectCard;
var selectList = [];
var selectList2 = [];
var selectList3 = [];
var start = true;
var attackcou = 0;
var buttleing;
var flag2 = false;

function initSocket(){
	socket = io.connect("ws://172.20.10.3:5000/websocket");

	// 接続時にソケットIDをサーバから取得する

	socket.on("onConnect", function (data){
		datas["id"] = data["id"];
		console.log(data["id"])
	});
	
	socket.on("login", function(data){
		if(data.value == "Welcome Black Poker!"){
			//window.alert(data.value);
			datas["name"] = prm;
		}else if(data.value == "Enrolled"){
			//window.alert(data.value);
			console.log(data.value);
		}else{
			console.log(data.value);
		}
	});

	socket.on("start", function(){
		transition();
		unlockScreen(lockId);
		socket.emit("situation", {name: prm});
		console.log("comp")
	});

	socket.on("situation", function(data){
		console.log(data);
		situation = data;
		console.log(datas);
		if(data["user_1"]["name"] == datas["name"]){
			user = "user_1";
			enemy = "user_2";
		}else{
			enemy = "user_1";
			user = "user_2";
		}
		myhandDraw();
		enehandDraw();
		fielddraw();
		if(start){
			start = false;
			var cardImg = document.createElement("img");
			var my_cemetery = document.getElementById("my_cemetery");
			var ene_cemetery = document.getElementById("ene_cemetery");
			console.log(my_cemetery)
			cardImg.src = "./img/cover.jpg";
			cardImg.style.width = "94px";
			cardImg.style.height = "167px";
			cardImg.style.margin = "0px, 94px, 0px, 0px";
			cardImg.style.float = "left";
			my_cemetery.appendChild(cardImg);
			cardImg = document.createElement("img");
			cardImg.src = "./img/cover.jpg";
			cardImg.style.width = "94px";
			cardImg.style.height = "167px";
			cardImg.style.margin = "0px, 94px, 0px, 0px";
			cardImg.style.float = "left";
			ene_cemetery.appendChild(cardImg);
			load();
			MainGame();
		}
		console.log("situation_comp")
	});

	socket.on("myTurn", function(data){
		turn = 1;
		setBarrierCount = 1;
		if(data == null || data == undefined)
			myhandDraw();
		console.log("myTurn_comp")
	});

	socket.on("setBarrier", function(data){//相手の防壁設置
		var cardImg = document.createElement("img");
		enemyBarrier = document.getElementById("enemyBarrierField");
		cardImg.src = "./img/cover.jpg";
		cardImg.style.width = "94px";
		cardImg.style.height = "167px";
		cardImg.style.margin = "0px, 94px, 0px, 0px";
		cardImg.style.float = "left";
		enemyBarrier.appendChild(cardImg);
		situation[enemy]["barrier"].push(data["card"]);
	});

	socket.on("damage", function(dama){
		//alert("相手は" + dama + "ダメージを受けた。");
		situation[enemy].cemetery.push(situation[enemy].deck.shift());
	});

	socket.on("handDecrease", function(data){//相手の防壁設置時の手札
		situation[enemy].hand.splice(data.len, 1);
		enehandDraw();
	});

	socket.on("driveBarrier", function(data){
		enemyBarrier = document.getElementById("enemyBarrierField");
		enemyBarrierDrive = document.getElementById("Enemy_drive");
		var enemyDriveCard = enemyBarrier.children[data];
		enemyDriveCard.src = "./img/cover.jpg";
		enemyDriveCard.style.transform = "rotate(90deg)";
	});

	socket.on("summon", function(data){
		var cardImg = document.createElement("img");
		enemyField = document.getElementById("enemyBattleField");
		cardImg.src = "./img/" + data.card.mark + data.card.number + ".jpg";
		cardImg.style.width = "94px";
		cardImg.style.height = "167px";
		cardImg.style.margin = "0px, 94px, 0px, 0px";
		cardImg.style.float = "right";
		console.log(enemy)
		console.log(data.card)
		enemyField.appendChild(cardImg);
		situation[enemy]["soldier"].push(data.card);
	});

	socket.on("turnEnd", function(){
		turn = 1;
		setBarrierCount = 1;
		chargeAll();
	});

	socket.on("draw", function(){
		situation[user].hand.push(situation[user].deck.shift());
		var myhand = document.getElementById("My_hand");
		var cardImg = document.createElement("img");
		cardImg.src = "./img/" + situation[user]["hand"][situation[user]["hand"].length - 1].mark + situation[user]["hand"][situation[user]["hand"].length - 1].number + ".jpg";
		cardImg.style.width = "94px";
		cardImg.style.height = "167px";
		cardImg.style.margin = "0px, 94px, 0px, 0px";
		cardImg.style.float = "left";
		cardImg.className = "move";
		myhand.appendChild(cardImg);
		handList.push(cardImg);
		handList[handList.length - 1].addEventListener("dragstart", function(e){//ドラッグ開始時
			if(turn == 1){
				this.classList.add("drag");
				e.dataTransfer.setData("text", e.target.classList);//データの保持
				holder = handList.indexOf(this);
				console.log(handList);
			}
		}, false);

		handList[handList.length - 1].addEventListener("dragend", function(e){//ドラッグ終了時
			e.preventDefault();
			this.classList.remove("drag");
		}, false);
	});

	socket.on("chargeAll", function(){
		var eneSoldier = document.getElementById("enemyBattleField");
		var eneBarrier = document.getElementById("enemyBarrierField");
		for(var i = 0; i < eneSoldier.children.length; i++){
			eneSoldier.children[i].style.transform = "rotate(0deg)";
		}
		for(i = 0; i < eneBarrier.children.length; i++){
			eneBarrier.children[i].style.transform = "rotate(0deg)";
		}
	});

	
	socket.on("fin", function(data){
		if("user_" + (data + 1) == user){
			document.getElementById("fin_p").innerHTML = "win!";
		}else{
			document.getElementById("fin_p").innerHTML = "Lose!";
		}
		document.getElementById("fin_b").click();
	});

	socket.on("attack", function(data){
		attackcou = data.length;
		buttleing = data;
		console.log(data)
		document.getElementById("Check_diffence").click();
	});

	socket.on("enemyDraw", function(){
		situation[enemy].hand.push(situation[enemy].deck.shift());
		enehandDraw();
	});


}


function fielddraw(){//バトルフィールドの描画(再描画)
	var mybuttle = document.getElementById("My_BattleField");
	mybuttle.textContent = null;
	//console.log(situation);

	for(var i = 0; i < situation[user]["soldier"].length; i++){//自分の兵士の描画
		var cardImg = document.createElement("img");
		cardImg.src = "./img/" + situation[user]["soldier"][i].mark + situation[user]["soldier"][i].number + ".jpg";
		cardImg.style.width = "94px";
		cardImg.style.height = "167px";
		cardImg.style.margin = "0px, 94px, 0px, 0px";
		cardImg.style.float = "left";
		if(!situation[user]["soldier"][i].isCharge){
			cardImg.style.transform = "rotate(90deg)";
		}
		mybuttle.appendChild(cardImg);
	}

	var enebuttle = document.getElementById("enemyBattleField");
	enebuttle.textContent = null;

	for(i = 0; i < situation[enemy]["soldier"].length; i++){//相手の兵士の描画
		cardImg = document.createElement("img");
		cardImg.src = "./img/" + situation[enemy]["soldier"][i].mark + situation[enemy]["soldier"][i].number + ".jpg";
		cardImg.style.width = "94px";
		cardImg.style.height = "167px";
		cardImg.style.margin = "0px, 94px, 0px, 0px";
		cardImg.style.float = "left";
		if(!situation[enemy]["soldier"][i].isCharge){
			cardImg.style.transform = "rotate(90deg)";
		}
		enebuttle.appendChild(cardImg);
	}

	var mybarrier = document.getElementById("My_barrier");
	mybarrier.textContent = null;

	for(i = 0; i < situation[user]["barrier"].length; i++){//自分の防壁(ry
		cardImg = document.createElement("img");
		cardImg.src = "./img/cover.jpg";
		cardImg.style.width = "94px";
		cardImg.style.height = "167px";
		cardImg.style.margin = "0px, 94px, 0px, 0px";
		cardImg.style.float = "left";
		if(!situation[user]["barrier"][i].isCharge){
			cardImg.style.transform = "rotate(90deg)";
		}
		mybarrier.appendChild(cardImg);
	}

	var enebarrier = document.getElementById("enemyBarrierField");
	enebarrier.textContent = null;

	for(i = 0; i < situation[enemy]["barrier"].length; i++){//相手の防壁(ry
		cardImg = document.createElement("img");
		cardImg.src = "./img/cover.jpg";
		cardImg.style.width = "94px";
		cardImg.style.height = "167px";
		cardImg.style.margin = "0px, 94px, 0px, 0px";
		cardImg.style.float = "left";
		if(!situation[enemy]["barrier"][i].isCharge){
			cardImg.style.transform = "rotate(90deg)";
		}
		enebarrier.appendChild(cardImg);
	}
}

function login(){
	prm = document.getElementById("log").value;
	socket.emit("login", {id: datas["id"], name: prm});
	lockScreen(lockId);
}

function lockScreen(id){//画面をちょっと灰色にするアレ

	var divTag = $("<div />").attr("id", id);

	divTag.css("z-index", "999")
		.css("position", "absolute")
		.css("top", "0px")
		.css("left", "0px")
		.css("right", "0px")
		.css("bottom", "0px")
		.css("background-color", "gray")
		.css("opacity", "0.8");

	$("body").append(divTag);
}

function unlockScreen(id){//灰色をなおすそれ
	$("#" + id).remove();
}

function chargeAll(){
	socket.emit("chargeAll", {name: prm});
	var myBarrier = document.getElementById("My_barrier");
	var mySoldier = document.getElementById("My_BattleField");
	for(var i = 0; i < myBarrier.children.length; i++){
		myBarrier.children[i].style.transform = "rotate(0deg)";
	}
	for(i = 0; i < mySoldier.children.length; i++){
		mySoldier.children[i].style.transform = "rotate(0deg)";
	}
}

function transition(){//画面遷移(笑)
	//alert("success!");
	document.body.textContent = null;
	
	$.ajax({
		type: "GET",
		url: "BlackPoker.html",
		dataType: "html",
		async:false,
		success: function(data){
			var doc = (new DOMParser()).parseFromString(data, "text/html");
			var child = Array.from(doc.body.children);
			var elemnt = document.createElement("div");
			for(var i = 0; i < child.length; i++){
				elemnt.appendChild(child[i]);
			}
			document.body.appendChild(elemnt);
			elemnt = document.createElement("link");
			elemnt.setAttribute("rel", "stylesheet");
			elemnt.setAttribute("type", "text/css");
			elemnt.setAttribute("href", "BlackPoker.css");
			document.getElementsByTagName("head")[0].appendChild(elemnt);
		}
	});

	var mycem = (document.getElementById("cemetery_list").children)[0];
	console.log(mycem.style);
}

function MainGame(){
	cleanUp(datas["name"]);

	if(turn == 0){
		//window.alert("後攻");
	}
	else{
		window.alert("先攻");
	}
}


function cleanUp(id){
	if(id == situation[user]["name"]){
		myhandDraw();
		enehandDraw();
	}
}

function myhandDraw(){//手札の描画(再描画)
    console.log(situation[user]);
	var myhand = document.getElementById("My_hand");
	myhand.textContent = null;

	for(var i = 0; i < situation[user]["hand"].length; i++){
		var cardImg = document.createElement("img");
		cardImg.src = "./img/" + situation[user]["hand"][i].mark + situation[user]["hand"][i].number + ".jpg";
		cardImg.style.width = "94px";
		cardImg.style.height = "167px";
		cardImg.style.margin = "0px, 94px, 0px, 0px";
		cardImg.style.float = "left";
		cardImg.className = "move";
		myhand.appendChild(cardImg);
	}

	handList = Array.from(document.getElementsByClassName("move"));//配列ライクな何かだった
	//console.log(handList.length);
	for(i = 0; i < handList.length; i++){//カードのイベントの追加

		handList[i].addEventListener("dragstart", function(e){//ドラッグ開始時
			if(turn == 1){
				this.classList.add("drag");
				e.dataTransfer.setData("text", e.target.classList);//データの保持
				holder = handList.indexOf(this);
				console.log(handList);
				console.log(handList.indexOf(this));
				console.log(this);
			}
		}, false);

		handList[i].addEventListener("dragend", function(e){//ドラッグ終了時
			e.preventDefault();
			this.classList.remove("drag");
		}, false);

	}
}

function enehandDraw(){//相手手札の描画(再描画)
	var cardImg;
	var enemyhand = document.getElementById("Enemy_hand");
	enemyhand.textContent = null;
	for(var i = 0; i < situation[enemy]["hand"].length; i++){
		cardImg = document.createElement("img");
		cardImg.src = "./img/cover.jpg";
		cardImg.style.width = "94px";
		cardImg.style.height = "167px";
		cardImg.style.margin = "0px, 94px, 0px, 0px";
		cardImg.style.float = "right";
		cardImg.style.transform = "rotate(180deg)";
		enemyhand.appendChild(cardImg);
	}
}

function damage(){
	situation[user].cemetery.push(situation[user].deck.shift());
}

function barrier_drop(e, its){//防壁の召喚
	if(setBarrierCount > 0){
		e.preventDefault();
		var data = e.dataTransfer.getData("text");
		document.getElementsByClassName(data)[0].src = "./img/cover.jpg";
		//document.getElementsByClassName(data)[0].classList.remove("move");
		dataCpy = document.getElementsByClassName(data)[0];
		dataCpy.classList.remove("move");
		its.children[1].appendChild(dataCpy);
		situation[user]["barrier"].push(situation[user]["hand"][holder]);
		console.log(situation[user]["hand"][holder]);
		situation[user]["hand"].splice(holder, 1);
		socket.emit("setBarrier", {handLength: holder, name: prm});
		console.log("セットバリア："+ holder);
		console.log(handList.length);
		handList.splice((holder), 1);
		console.log(handList.length);
		holder = -1;
		setBarrierCount--;
		damage();
	}else if(holder == -1);
	else{
		//window.alert("防壁はターン1行動です");
	}
}

function battle_drop(e, its){//バトルフィールドへのドロップ
	var myBarrier = document.getElementById("My_barrier");
	//console.log(holder);
	//console.log(situation);
	var myDropCard = situation[user]["hand"][holder];
	var data = e.dataTransfer.getData("text");
	dataCpy = document.getElementsByClassName(data)[0];
	cardData = myDropCard.number;
	e.preventDefault();
	if(myDropCard.number == 1){//エースの召喚
		//document.getElementsByClassName(data)[0].classList.remove("move");
		dataCpy.classList.remove("move");
		its.children[0].appendChild(dataCpy);
		socket.emit("summon", {
			handLength: holder,
			name: prm
		});
		situation[user]["soldier"].push(situation[user]["hand"][holder]);
		situation[user]["hand"].splice(holder, 1);
		//console.log(holder);
		//console.log(handList);
		handList.splice((holder), 1);
		console.log(handList);
		holder = -1;
		damage();
		for(var i = 0; i < myBarrier.length; i++){
			myBarrier[i].removeEventListener("click", selectBarrier, false);
		}
	}
	else{
		selectTime();
	}
}

function allowDrop(e){
	e.preventDefault();
}

function selectTime(){//召喚時のコスト支払い
	var myBarrier = document.getElementById("My_barrier").children;
	for(var i = 0; i < myBarrier.length; i++){
		myBarrier[i].addEventListener("click", selectBarrier, false);
		myBarrier[i].style.border = "solid 1px yellow";
	}
	document.getElementById("Select_end").style.overflow = "none";
}

function selectTime2(){//ジョーカー召喚の儀
	var myhand = document.getElementById("My_hand").children;
	for(var i = 0; i < myhand.length; i++){
		myhand[i].addEventListener("click", selectHand, false);
		myhand[i].style.border = "solid 1px yellow";
	}
	document.getElementById("Select_end").style.overflow = "none";
}

function selectBarrier(){//召喚時の防壁の選択
	var myBarrier = document.getElementById("My_barrier").children;
	this.classList.add("select");
	console.log(this);
	console.log(handList);
	this.style.border = "solid 1px red";
	if(selected1 == undefined){
		selected1 = Array.from(myBarrier).indexOf(this);
		if(cardData < 11 || cardData > 13){
			for(var i = 0; i < myBarrier.length; i++){
				if(selected1 != i){
					myBarrier[i].style.border = "none";
				}
			}
			if(cardData == 0){
				selectTime2();
			}else{
				document.getElementById("Select_end").children[0].style.border = "solid 3px yellow";
			}
		}
	}else{
		selected2 = Array.from(myBarrier).indexOf(this);
		for(i = 0; i < myBarrier.length; i++){
			if(selected2 != i || selected1 != i){
				myBarrier[i].style.border = "none";
			}
		}
		document.getElementById("Select_end").children[0].style.border = "solid 3px yellow";
	}
}

function selectHand(){
	var myhand = document.getElementById("My_hand").children;
	this.classList.add("select");
	this.style.border = "solid 1px red";
	if(selected2 == undefined){
		selected2 = Array.from(myhand).indexOf(this);
		for(var i = 0; i < myhand.length; i++){
			if(selected2 != i){
				myhand[i].style.border = "none";
			}
		}
		document.getElementById("Select_end").children[0].style.border = "solid 3px yellow";
	}
}

function selectEnd(){//選択の終了からの召喚
	var myBarrier = document.getElementById("My_barrier");
	var myField = document.getElementById("My_BattleField");
	var myhand = document.getElementById("My_hand");
	console.log(holder);
	var myDropCard = (situation[user]["hand"][holder]).number;

	if(selected1 != undefined){
		if(myDropCard == 0){//ジョーカーの召喚
			document.getElementById("My_hand").children[selected2].classList.remove("select");	
			if(myBarrier.children.length != 0 && (handList.length - 1) != 0){
				//console.log(myhand.children);
				socket.emit("summon", {
					handLength: holder,
					costLength: selected2,
					barrierLength: selected1,
					name: prm
				});
				situation[user]["soldier"].push(situation[user]["hand"][holder]);
				situation[user]["soldier"].push(situation[user]["cemetery"][selected2]);
				var hands = document.getElementById("My_hand")
				console.log(hands);
				console.log(selected2);
				hands.removeChild(hands.children[selected2]);
				if(holder > selected2){
					handList.splice((holder), 1);
					situation[user]["hand"].splice(holder, 1);
					handList.splice((selected2), 1);
					situation[user]["hand"].splice(selected2, 1);
				}else{
					handList.splice((selected2), 1);
					situation[user]["hand"].splice(selected2, 1);
					handList.splice((holder), 1);
					situation[user]["hand"].splice(holder, 1);
				}
				dataCpy.classList.remove("move");
				myField.appendChild(dataCpy);
				holder = -1;
				disHand();
				tapBarrier();
				//console.log(myhand.children);
			}
			else{
				alert("召喚コストが足りません");
				myField.appendChild(dataCpy);
				myhand.insertBefore(
					myField.children[Array.from(myField.children).length - 1],
					myhand.children[holder]
				);
				holder = -1;
			}
		}
		else if(myDropCard >= 11 && myDropCard <= 13){//絵札の召喚
			if(selected1 != undefined && selected2 != undefined){
				socket.emit("summon", {
					handLength: holder,
					barrierLength: [selected1, selected2],
					name: prm
				});
				situation[user]["soldier"].push(situation[user]["hand"][holder]);
				situation[user]["hand"].splice(holder, 1);
				dataCpy.classList.remove("move");
				myField.appendChild(dataCpy);
				handList.splice((holder), 1);
				holder = -1;
				damage();
				tapBarrier();
			}
			else{
				alert("召喚コストが足りません");
				myField.appendChild(dataCpy);
				myhand.insertBefore(
					myField.children[Array.from(myField.children).length - 1],
					myhand.children[holder]
				);
				holder = -1;
			}
		}
		else{//その他の兵士の召喚
			if(myBarrier.children.length != 0){
				socket.emit("summon", {
					handLength: holder,
					barrierLength: selected1,
					name: prm
				});
				//console.log(handList);
				situation[user]["soldier"].push(situation[user]["hand"][holder]);
				situation[user]["hand"].splice(holder, 1);
				dataCpy.classList.remove("move");
				myField.appendChild(dataCpy);
				handList.splice((holder), 1);
				//console.log(handList);
				holder = -1;
				damage();
				tapBarrier();
			}
			else{
				alert("召喚コストが足りません");
				myField.appendChild(dataCpy);
				myhand.insertBefore(
					myField.children[Array.from(myField.children).length - 1],
					myhand.children[holder]
				);
				holder = -1;
			}
		}
	}
	else{
		alert("張っ倒すぞ");
	}

	document.getElementById("Select_end").style.border = "none";
	selected1 = undefined;
	selected2 = undefined;
}

function tapBarrier(){//防壁のドライブ
	var myBarrier = document.getElementById("My_barrier");
	for(var i = 0; i < Array.from(myBarrier.children).length; i++){//防壁のドライブ
		myBarrier.children[i].removeEventListener("click", selectBarrier, false);
		if(i == selected1 || i == selected2){
			myBarrier.children[i].style.border = "none";
			myBarrier.children[i].style.transform = "rotate(90deg)";
		}
	}
}

function disHand(){
	var myHand = document.getElementById("My_hand");
	for(var i = 0; i < Array.from(myHand.children).length; i++){
		myHand.children[i].removeEventListener("click", selectHand, false);
		if(i == selected2){
			myHand.children[i].style.border = "none";
		}
	}
}

function turn_end(){//ターンエンド
	if(turn == 1){
		socket.emit("turnEnd", {name: prm});
		turn = 0;
	}
}

function cemetery_check(){//墓地確認
	var mycem = (document.getElementById("cemetery_list").children)[0];
	mycem.children = null;
	mycem.style.height = "100%";
	mycem.style.overflow = "scroll";
	for(var i = 0; i < situation[user]["cemetery"].length; i++){
		var cardImg = document.createElement("img");
		cardImg.src = "./img/" + situation[user]["cemetery"][i].mark + situation[user]["cemetery"][i].number + ".jpg";
		cardImg.style.width = "94px";
		cardImg.style.height = "167px";
		cardImg.style.margin = "0px, 94px, 0px, 0px";
		cardImg.style.float = "left";
		mycem.appendChild(cardImg);
	}
}

function barrier_check(){
	var mybr = (document.getElementById("barrier_list").children)[0];
	mybr.textContent = null;
	for(var i = 0; i < situation[user]["barrier"].length; i++){
		var cardImg = document.createElement("img");
		cardImg.src = "./img/" + situation[user]["cemetery"][i].mark + situation[user]["cemetery"][i].number + ".jpg";
		cardImg.style.width = "94px";
		cardImg.style.height = "167px";
		cardImg.style.margin = "0px, 94px, 0px, 0px";
		cardImg.style.float = "left";
		if(!situation[user]["barrier"][i].isCharge){
			cardImg.style.transform = "rotate(90deg)";
		}
		mybr.appendChild(cardImg);
	}
}
function load(){
	modal("#action", "#overlay", "#open");
	modal("#cemetery_list", "#overlay", "#check_cemetery");
	modal("#barrier_list", "#overlay", "#check_barrier");
	modal("#fin", "#overlay", "#fin_b");
	modalfunc("#Daction", "#overlay", "#Check_diffence");
}

var actionChild;

function attacking(){
	var actionChild = document.getElementById("action");
	selectCard = actionChild;

	for(var i = 0; i < situation[user]["soldier"].length; i++){
		var cardImg = document.createElement("img");
		cardImg.src = "./img/" + situation[user]["soldier"][i].mark + situation[user]["soldier"][i].number + ".jpg";
		cardImg.style.width = "94px";
		cardImg.style.height = "167px";
		cardImg.style.margin = "0px, 94px, 0px, 0px";
		cardImg.style.float = "left";
		cardImg.className = "card";
		actionChild.appendChild(cardImg);
	}
	for(i = 0; i < actionChild.children.length; i++){
		actionChild.children[i].addEventListener("click", selectFight, false);
	}
	var button = document.createElement("button");
	button.className = "button";
	button.style.width = "45px";
	button.style.height = "10px";
	button.onclick = buttle;
	actionChild.appendChild(button);

}

function selectFight(){//アタックするカードの選択
	console.log(Array.from(selectCard.children).indexOf(this) - 1);
	if(!checkSelectCard(Array.from(selectCard.children).indexOf(this) - 1) && (Array.from(selectCard.children).indexOf(this) - 1) >= 0){
		selectList.push(Array.from(selectCard.children).indexOf(this) - 1);
		//alert(selectList);
	}
}

function checkSelectCard(num){
	var flag = false;
	for(var i = 0; i < selectList.length; i++){
		if(selectList[i] == num){
			flag = true;
		}
	}
	return flag;
}

function buttle(){
	socket.emit("attack", {lengths: selectList, name: prm});
	flag2 = true;
	console.log(selectList);
	var actionChild = document.getElementById("action");
	console.log("buttle");
	console.log(actionChild.children);
	for(var i = 0; i < actionChild.children.length; i++){
		console.log(i);
		console.log((actionChild.childNodes[i]).tagName);
		if((actionChild.children[i]).classList.contains("action")){
			(actionChild.children[i]).style.display = "inline";
		}else{
			actionChild.removeChild(actionChild.children[i]);
			i--;
			console.log(i);
		}
	}
	selectList = [];
	document.getElementById("overlay").click();
	//console.log(actionChild);
}

function selectDiffence(){//ブロックするカードの選択

	console.log(document.getElementById("Daction").children);
	if(!checkSelectCard2(Array.from(document.getElementById("Daction").children).indexOf(this) - 2) && (Array.from(document.getElementById("Daction").children).indexOf(this) -2) >= 0){
		selectList3.push(Array.from(document.getElementById("Daction").children).indexOf(this) - 2);
		//alert(selectList3);
	}
}
/*
function selectDiffence(){//ブロックするカードの選択
	if(!checkSelectCard2(Array.from((document.getElementById("Daction")).children).indexOf(this) - 3) && (((document.getElementById("Daction")).children).indexOf(this) - 3) >= 0){
		selectList2.push(Array.from((document.getElementById("Daction")).children).indexOf(this) - 3);
		alert(selectList2);
	}

}
*/

function checkSelectCard2(num){
	var flag = false;
	for(var i = 0; i < selectList3.length; i++){
		if(selectList3[i] == num){
			flag = true;
		}
	}
	return flag;
}
function diffence_on(attack){//攻撃してきた兵士の表示
	var cardImg = document.createElement("img");
	//console.log(situation[enemy]["soldier"]);
	//console.log(attack.len);
	//console.log(situation[enemy]["soldier"][attack.len]);
	//console.log(actionChild);
	cardImg.src = "./img/" + situation[enemy]["soldier"][attack.len].mark + situation[enemy]["soldier"][attack.len].number + ".jpg";
	cardImg.style.width = "94px";
	cardImg.style.height = "167px";
	cardImg.style.margin = "0px, 94px, 0px, 0px";
	cardImg.style.float = "left";
	cardImg.className = "card";
	actionChild.insertBefore(cardImg, actionChild.firstChild);
}

function diffence_barrier(){//防壁でブロックするときの処理
	var actionChild = document.getElementById("Daction");
	selectCard = actionChild;
	for(var i = 0; i < actionChild.children.length; i++){
		if((actionChild.children[i]).classList.contains("card")){
			actionChild.removeChild(actionChild.children[i]);
		}
	}
	console.log(situation);
	for(i = 0; i < situation[user]["barrier"].length; i++){
		var cardImg = document.createElement("img");
		cardImg.src = "./img/" + situation[user]["barrier"][i].mark + situation[user]["barrier"][i].number + ".jpg";
		cardImg.style.width = "94px";
		cardImg.style.height = "167px";
		cardImg.style.margin = "0px, 94px, 0px, 0px";
		cardImg.style.float = "left";
		cardImg.className = "card";
		actionChild.appendChild(cardImg);
	}
	for(i = 0; i < actionChild.children.length; i++){//カードリスト全てにクリックイベントの追加
		actionChild.children[i].addEventListener("click", selectDiffence, false);
	}
	var button = document.createElement("button");
	button.style.width = "45px";
	button.style.height = "10px";
	button.onclick = defbuttlebarr;
	button.className = "card";
	actionChild.appendChild(button);
	selectList3 = [];
}

function defbuttle(){
	socket.emit("defence", {attack: buttleing[attackcou].attack, place: "soldier", lengths:selectList3, name: prm});
	console.log({attack: buttleing[attackcou].attack, place: "soldier", lengths:selectList3});
	var actionChild = document.getElementById("Daction");
	for(var i = 0; i < actionChild.children.length; i++){
		if((actionChild.children[i]).classList.contains("action")){
			(actionChild.children[i]).style.display = "inline";
		}else{
			actionChild.removeChild(actionChild.children[i]);
			i--;
			console.log(i);
		}
	}
	selectList3 = [];
}

function defbuttlebarr(){//兵士がブロックした際の処理
	socket.emit("defence", {attack: buttleing[attackcou].attack, place: "barrier", lengths:selectList3, name: prm});
	console.log({attack: buttleing[attackcou].attack, place: "barrier", lengths:selectList3});
	var actionChild = document.getElementById("Daction");
	for(var i = 0; i < actionChild.children.length; i++){
		if((actionChild.children[i]).classList.contains("action")){
			(actionChild.children[i]).style.display = "inline";
		}else{
			actionChild.removeChild(actionChild.children[i]);
			i--;
		}
	}
	selectList3 = [];
}

function diffence(){//兵士がブロックしてきたときの処理
	var actionChild = document.getElementById("Daction");
	selectCard = actionChild;
	for(var i = 0; i < actionChild.children.length; i++){
		if((actionChild.children[i]).classList.contains("card")){
			actionChild.removeChild(actionChild.children[i]);
		}
	}
	for(i = 0; i < situation[user]["soldier"].length; i++){
		var cardImg = document.createElement("img");
		cardImg.src = "./img/" + situation[user]["soldier"][i].mark + situation[user]["soldier"][i].number + ".jpg";
		cardImg.style.width = "94px";
		cardImg.style.height = "167px";
		cardImg.style.margin = "0px, 94px, 0px, 0px";
		cardImg.style.float = "left";
		cardImg.className = "card";
		actionChild.appendChild(cardImg);
	}
	for(i = 0; i < actionChild.children.length; i++){//カードリスト全てにクリックイベントの追加
		actionChild.children[i].addEventListener("click", selectDiffence, false);
	}
	var button = document.createElement("button");
	button.style.width = "45px";
	button.style.height = "10px";
	button.onclick = defbuttle;
	button.className = "card";
	actionChild.appendChild(button);
	selectList3 = [];
}

function magic(){

}


//モーダル

function modal(modalwindow, overlay, open){
	$(open).click(function(){
		console.log(modalwindow);
		console.log(flag2);
		//if(!(flag2 && modalwindow == "#action")){
		$(overlay).fadeIn();
		$(modalwindow).fadeIn();
		//}
	});

	$(document).click(function(event){
		if($(event.target).closest(overlay).length){
			$(overlay + ", " + modalwindow).fadeOut();
		}
	});
	
	locateCenter();	// => モーダルウィンドウを中央配置するための初期値を設定する
	$(window).resize(locateCenter);	// => ウィンドウのリサイズに合わせて、モーダルウィンドウの配置を変える
	
	// モーダルウィンドウを中央配置するための配置場所を計算する関数
	function locateCenter(){
		let w = $(window).width();
		let h = $(window).height();
		
		let cw = $(modalwindow).outerWidth();
		let ch = $(modalwindow).outerHeight();
	
		$(modalwindow).css({
			"left": ((w - cw) / 2) + "px",
			"top": ((h - ch) / 4) + "px"
		});
	}
}


function modalfunc(modalwindow, overlay, open){
	$(open).click(function(){
		modal_on();
	});

	function modal_on(){
		$(overlay).fadeIn();
		$(modalwindow).fadeIn();
		if(0 < attackcou){
			actionChild = document.getElementById("Daction");
			for(var i = 0; i < actionChild.children.length; i++){
				if((actionChild.children[i]).classList.contains("card")){
					actionChild.removeChild(actionChild.children[i]);
				}else{
					(actionChild.children[i]).style.display = "inline";
				}
			}
			console.log(buttleing);
			diffence_on(buttleing[attackcou - 1].attack);
			attackcou = attackcou - 1;
		}
	}
	$(document).click(function(event){
		//console.log(modalwindow.slice(1));
		//console.log(document.getElementById(modalwindow.slice(1)));
		//console.log(document.getElementById(modalwindow.slice(1)).style.display);
		if($(event.target).closest(overlay).length && document.getElementById(modalwindow.slice(1)).style.display != "none" && document.getElementById(modalwindow.slice(1)).style.display != ""){
			console.log("out")
			$(overlay + ", " + modalwindow).fadeOut();
			if(attackcou >= 1){
				modal_on();
			}else{
				console.log("defence_end")
				socket.emit("defence_end", {name: prm});
				//alert("diff end");
			}
		}
	});
	
	locateCenter();	// => モーダルウィンドウを中央配置するための初期値を設定する
	$(window).resize(locateCenter);	// => ウィンドウのリサイズに合わせて、モーダルウィンドウの配置を変える
	
	// モーダルウィンドウを中央配置するための配置場所を計算する関数
	function locateCenter(){
		let w = $(window).width();
		let h = $(window).height();
		
		let cw = $(modalwindow).outerWidth();
		let ch = $(modalwindow).outerHeight();
	
		$(modalwindow).css({
			"left": ((w - cw) / 2) + "px",
			"top": ((h - ch) / 4) + "px"
		});
	}
}


