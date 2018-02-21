
function start() {
	var baseline = -1
	while (typeof(baseline) != "number" || baseline < 0) {
		baseline = getNumber("Enter a positive number")
	}
	alert(baseline)
	
	
	
}

function getNumber(promptText) {
	var input = prompt(promptText)
	return parseInt(input)
}