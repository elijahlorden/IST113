
function start() {
	var baseline = -1
	var guess = 0
	var tries = 0
	while (typeof(baseline) != "number" || baseline < 0) {
		baseline = getNumber("Enter a positive number (enter 0 to quit)")
		if (baseline == 0) {return}
	}
	while (guess != baseline) {
		tries = tries + 1
		guess = getNumber("Guess the number (enter 0 to quit)")
		if (guess == 0) {return}
		//sanity check
		if (typeof(guess) != "number") { 
			alert("Invalid guess, input must be a positive integer")
			continue
		} else if (guess < 0) {
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
	alert("Correct, the number was " + baseline + ".\nIt took you " + tries + " tries to guess the number.")
	
	
}

function getNumber(promptText) {
	var input = prompt(promptText)
	return parseInt(input)
}