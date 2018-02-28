let state = false

let switchElement = document.getElementById("SwitchPart")
let switchText = document.getElementById("SwitchText")
let spacerElement = document.getElementById("Spacer1")
let bodyElement = document.getElementsByTagName("BODY")[0]


switchElement.addEventListener("click", function() {
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
})