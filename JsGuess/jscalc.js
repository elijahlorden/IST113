
function start() {
	var baseline = -1
	var guess = 0
	var tries = 0
	while (typeof(baseline) != "number" || baseline < 0) {
		baseline = getNumber("Enter a positive number")
	}
	while (guess != baseline) {
		tries = tries + 1
		guess = getNumber("Guess the number")
		//sanity check
		if (typeof(guess) != "number") { 
			alert("Invalid guess, input must be a positive integer")
			continue
		} else if (Math.floor(Math.abs(guess)) != guess) {
			alert("Invalid guess, input must be a positive integer")
			continue
		}
		//check if number is higher or lower
		if (guess > baseline) {
			alert("Incorrect, your guess was too high.")
		} else if (guess < baseline) {
			alert("Incorrect, your guess was too low.")
		}
		
		
	}
	alert("Correct, the number was " + baseline + ".\nIt took you " + tries " tries to guess the number.")
	
	
}

function getNumber(promptText) {
	var input = prompt(promptText)
	return parseInt(input)
}