var HTTP_STATUS_OK = 200;
var READYSTATE_COMPLETED = 4;
//document.getElementById("prb").innerHTML = decodeURI(httpRequest.responseText);
//location.href = "game.html?num=" + prm;

var deckNum;
var enemyDeckNum;
var soldier = [];//自分の兵士
var barrier = [];//自分の防壁
var enemySoldier = [];//相手の兵士
var enemyBarrier = [];//自分の防壁
var enemyHandNum;
var hand = [];
var cost = ["B", "L", "D", "S"];
var holder = -1;
var cardImg;
var enemyCardImg;
var MyHandImg;//自分のカードの画像
var EnemyHandImg;//相手のカードの画像
var handList;
var BATTLE = true;
var turn_false;
var field_change = ["[undefined]", "[undefined]"];
var barrier_List;
var my_Barrier;
var canDrop;


function send(path, param, func){

	//var prm = document.getElementById("log").value;
	var httpRequest = connect();
	httpRequest.open("GET", "http://localhost:8080/" + path + param, false);
	httpRequest.send(null);
	if( httpRequest.readyState == READYSTATE_COMPLETED )
	{
		if( httpRequest.status == HTTP_STATUS_OK)
		{
			func(decodeURI(httpRequest.responseText));
		}
	}
	httpRequest.abort();

}

function connect(){
	var httpRequest;
	if(window.XMLHttpRequest) {
		httpRequest = new XMLHttpRequest();
		httpRequest.overrideMimeType("text/xml");
	} else if(window.ActiveXObject) {
		try {
			httpRequest = new ActiveXObject("Msxml2.XMLHTTP");
		} catch (e) {
			httpRequest = new ActiveXObject("Microsoft.XMLHTTP");
		}
	}

	return httpRequest;
}

function login(){
	var prm = document.getElementById("log").value;
	send("overLap", "?id=" +  prm, function(res){
		if (res == "true"){
			window.alert("ダブり");
		}
		else if(res == "false"){
			send("enter", "?id=" + prm, function(){
				location.href = "BlackPoker.html?id=" + prm;
			});
		}
		else {
			window.alert("No vacancy");
		}
	});
}

function load(){
	document.getElementById("open").click();
	var userId = location.search.substring(1).split("=");
	var prm = userId[1];
	var start = null;

	while(start == null){
		send("isStart", "?id=" + prm, function(res){
			if(res.match(/true/)){
				MainGame();	
				start = res;
			}
			else{
			}
		});
	}
}

function drawEnemyHand(){
	console.log("drawenemy");
	send("enemyHand", "?id=" + prm, function(res){
		enemyHandNum = res;
		
		for (var i = 0; i < enemyHandNum; i++){
			cardImg = document.createElement("img");
			cardImg.src = "./画像/cover.PNG";//750 * 1334
			cardImg.style.width = "94px";
			cardImg.style.height = "167px";
			cardImg.style.margin = "0px";
			cardImg.style.float = "right";
			cardImg.style.transform = "rotate(180deg)";
			EnemyHandImg.appendChild(cardImg);
		}
	});
}

function drawMyHand(){
	console.log("drawme");
	send("handKind", "?id=" + prm, function(res){

		var arr = res.split(",");
		for(var i = 0; i < arr.length; i += 2){
			hand.push(new Card(arr[i].substring(1), arr[i + 1].substring(0, arr[i + 1].length - 1)));
		}

		for (var i = 0; i < hand.length; i++){
			cardImg = document.createElement("img");
			if(hand[i].number != 1){
				cardImg.src = "./画像/" + hand[i].mark + ".PNG";
			}else{
				cardImg.src = "./画像/cover.PNG";
			}
			cardImg.style.width = "94px";
			cardImg.style.height = "167px";
			cardImg.style.margin = "0px, 94px, 0px, 0px";
			cardImg.style.float = "left";
			cardImg.className = "move";
			//cardImg.draggable = "true";
			MyHandImg.appendChild(cardImg);
		}

		handList = Array.from(document.getElementsByClassName("move"));//配列ライクな何かだった
		for(var i = 0; i < handList.length; i++){//カードのイベントの追加

			handList[i].addEventListener("dragstart", function(e){//ドラッグ開始時
				this.classList.add("drag");
				e.dataTransfer.setData("text", e.target.classList);//データの保持
				holder = Array.from(MyHandImg.children).indexOf(this) + 1;
			}, false);

			handList[i].addEventListener("dragend", function(e){//ドラッグ終了時
				e.preventDefault();
				this.classList.remove("drag");
			}, false);

		}
	});
}

//ゲームの本体
function MainGame(){
	var userId = location.search.substring(1).split("=");
	var prm = userId[1];
	MyHandImg = document.getElementById("My_hand");
	EnemyHandImg = document.getElementById("Enemy_hand");

	send("isMyTurn", "?id=" + prm, function(res){
		window.alert("Welcome Black Poker!");
		turn_false = res;
		console.log("ismytrun");
	});
	console.log("draw step");

	drawEnemyHand();
	drawMyHand();

	console.log("main step");

	if(turn_false == "false"){
		console.log("false");
		while(BATTLE){
			send("enemyFieldKind", "?id=" + prm, function(res){
				console.log(res);
				var arr1 = res.split(":");
				if(field_change[0] != arr1[0]){//相手の兵士召喚
					field_change[0] = arr1[0];
					var arr2 = arr1[0].split(",");
					var field_card = arr2[1].substring(0, arr2[1].length - 2);
					alert(field_card);
					var field = document.getElementById("enemyBattleField");
					cardImg = document.createElement("img");
					cardImg.src = "./画像/" + field_card + ".PNG";
					cardImg.style.width = "94px";
					cardImg.style.height = "167px";
					cardImg.style.margin = "0px, 94px, 0px, 0px";
					cardImg.style.float = "left";
					field.appendChild(cardImg);
				}
				else if(field_change[1] != arr1[1]){//相手の防壁設置
					field_change[1] = arr1[1];
					var field = document.getElementById("enemyBarrierField");
					cardImg = document.createElement("img");
					cardImg.src = "./画像/cover.PNG";
					cardImg.style.width = "94px";
					cardImg.style.height = "167px";
					cardImg.style.margin = "0px, 94px, 0px, 0px";
					cardImg.style.float = "left";
					field.appendChild(cardImg);
				}
			});
		}
	}
	else{
		console.log("true");
	}

}

function barrier_drop(e, its){
	e.preventDefault();
	var data = e.dataTransfer.getData("text");
	its.appendChild(document.getElementsByClassName(data)[0]);
	send("setBarrier", "?id=" + prm + "&length=" + (holder - 1), function(res){
	});
	hand.splice((holder - 1), 1);
	holder = -1;
}

function battle_drop(e, its){
	e.preventDefault();
	var data = e.dataTransfer.getData("text");
	its.appendChild(document.getElementsByClassName(data)[0]);
	if(hand[holder - 1].number == 1){
		send("summonAce", "?id=" + prm + "&length=" + (holder - 1), function(res){
			send("fieldKind", "?id=" + prm, function(res_2){
				alert(res_2);
			});
		});
	}
	else if(hand[holder - 1].number >= 2 || hand[holder - 1].number <= 10){
		if(canDrop == 1){
			var barrier_Drive = document.getElementById("My_drive");
			console.log(barrier_List[0] + "1");
			barrier_List[0].style.width = "94px";
			barrier_List[0].style.height = "167px";
			barrier_List[0].style.float = "none";
			barrier_List[0].style.transform = "rotate(90deg)"
			barrier_Drive.appendChild(barrier_List[0]);
			my_Barrier.splice(0);
			console.log(barrier_List.length);
			canDrop = 0;
		}
		else{
			alert("チャージ状態の防壁が足りません。");
			return;
		}
		send("summonSoldier", "?id=" + prm + "&length=" + (holder - 1) + "&barrier=0", function(res){
			send("fieldKind", "?id=" + prm, function(res_2){
				alert(res_2);
			});
		});
	}
	hand.splice((holder - 1), 1);
	holder = -1;
}

function allowDrop(e){
	e.preventDefault();
}

function dragenter(e){
	e.preventDefault();
	var data = e.dataTransfer.getData("text");
	var dragcard = document.getElementsByClassName(data)[0];
	my_Barrier = document.getElementById("My_babbier");
	barrier_List = my_Barrier.children;
	if(hand[holder - 1].number >= 2 && hand[holder - 1].number <= 10){
		if(barrier_List.length > 0){
			e.dataTransfer.effectAllowed = "move";
			canDrop = 1;
		}
		else{
			canDrop = 0;
			console.log("can"t summonSoldier");
			e.dataTransfer.dropEffect = "none";
			console.log(dragcard);
			console.log(dragcard.draggable);
		}
	}
	else if (hand[holder - 1].number >= 11 && hand[holder - 1].number <= 13){
		if(barrier_List.length > 1){
			canDrop = 1;
			e.dataTransfer.effectAllowed = "move";
		}
		else{
			canDrop = 0;
			console.log("can"t summonHero");
			e.dataTransfer.dropEffect = "none";
		}
	}
	else{
		canDrop = 1;
		e.dataTransfer.effectAllowed = "move";
	}

}

function tarn_end() {

}

