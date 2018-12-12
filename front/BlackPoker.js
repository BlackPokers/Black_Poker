var HTTP_STATUS_OK = 200;
var READYSTATE_COMPLETED = 4;
var userId = location.search.substring(1).split("=");
var prm = userId[1];

function send(path, param, func){

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

function action_Confirmation() {
	window.alert("アクションの一覧を表示します");
}

/*
function tarn_end() {
	window.alert("ターンを終了します");
}
*/

function cemetery_check() {
	//window.alert("墓地にあるカードのリストを表示します");
	send("cemeteryKind", "?id=" + prm, function(res){
		var arr = res.split(",");
		var cemetery = "";
		for(var i = 0; i < arr.length; i += 2){
			cemetery += arr[i].substring(1) + "," + arr[i + 1].substring(0, arr[i + 1].length - 1) + "\n";
		}
		alert(cemetery);
	});
}