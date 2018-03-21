let state = false

let switchElement = document.getElementById("SwitchPart")
let switchText = document.getElementById("SwitchText")
let spacerElement = document.getElementById("Spacer1")
let bodyElement = document.getElementsByTagName("BODY")[0]


/*switchElement.addEventListener("click", function() {
	state = !state
	if (state) {
		switchText.innerHTML = "On"
		switchElement.style.float = "right"
		bodyElement.style.background = "#FFFFFF"
		spacerElement.style.background = "#FFFFFF"
	} else {
		switchText.innerHTML = "Off"
		switchElement.style.float = "left"
		bodyElement.style.background = "#000000"
		spacerElement.style.background = "#000000"
	}
})*/

$(function() {
	$(".switch").on("click", function() {
		state = !state
		let buttonPart = $(this).children(".part2");
		let colorParts = $(".body, .spacer1");
		if (state) {
			buttonPart.css("float", "right");
			buttonPart.children(".text").text("Off");
			colorParts.css("background", "#FFFFFF");
		} else {
			buttonPart.css("float", "left");
			buttonPart.children(".text").text("On");
			colorParts.css("background", "#000000");
		}
	});
});





