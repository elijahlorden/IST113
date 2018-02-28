function lightSwitch(){
	var x = document.getElementById("toggle").style.cssFloat;
	
	if(x == "left"){
	document.body.style.backgroundColor = "black";
	document.getElementById("toggle").style.cssFloat = "right";
	document.getElementById("toggle").innerHTML = "OFF"
	}
	else{
		document.body.style.backgroundColor = "white";
		document.getElementById("toggle").style.cssFloat = "left";
		document.getElementById("toggle").innerHTML = "ON"
	}
}