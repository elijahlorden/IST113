// 0 = empty tile
// 1 = red man
// 2 = red king
// 3 = white man
// 4 = white king
// red starts bottom, white starts top

// constants to prevent magic number issues
var EMPTY = 0;
var WHITEM = 1;
var WHITEK = 2;
var REDM = 3;
var REDK = 4;

// array definition for the initial board state
var initialBoardState = [
	[0,3,0,3,0,3,0,3],
	[3,0,3,0,3,0,3,0],
	[0,3,0,3,0,3,0,3],
	[0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0],
	[1,0,1,0,1,0,1,0],
	[0,1,0,1,0,1,0,1],
	[1,0,1,0,1,0,1,0],
]

// array holding the currrent state of the board
var boardState = [
	[0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0],
]

// basic get and set functions for the live board state
var getState = (x,y) => {if (y < boardState.length && x < boardState[y].length && x >= 0 && y >= 0) return boardState[y][x]; else return undefined;}
var setState = (x,y,s) => {if (y < boardState.length && x < boardState[y].length && x >= 0 && y >= 0){boardState[y][x] = s; return true} else {return false}}

// for debug purposes, put live board state in a format that can be printed with an alert()
function stringifyState() {
	let s = "";
	for (let y = 0; y < boardState.length; y++) {
		for (let x = 0; x < boardState[y].length; x++) {
			s += getState(x,y) + " ";
		}
		s += "\n";
	}
	return s;
}

// return array of valid coordinates this tile can move to
// will always return an empty array if provided coordinates are invalid, or if the provided coordinates point to an empty tile
// array is formatted as ['moveType', x, y]
// moveType 'move' specifies a normal one-tile move
// moveType 'jump' specifies a jump
function getValidMoves(x, y) {
	let tile = getState(x, y);
	if (tile == undefined || tile == EMPTY) return []; // return empty array if tile is invalid
	let moves = [];
	//get relevent tiles
	
	let down1_1 = getState(x+1, y+1);
	let down1_2 = getState(x+2, y+2);
	let down2_1 = getState(x-1, y+1);
	let down2_2 = getState(x-2, y+2);
	
	let up1_1 = getState(x+1, y-1);
	let up1_2 = getState(x+2, y-2);
	let up2_1 = getState(x-1, y-1);
	let up2_2 = getState(x-2, y-2);
	
	//first check for basic moves
	if (tile == REDM || tile == REDK || tile == WHITEK) {
		if (down1_1 == EMPTY) moves.push(['move', x+1, y+1]);
		if (down2_1 == EMPTY) moves.push(['move', x-1, y+1]);
	} else if (tile == WHITEM || tile == REDK || tile == WHITEK) {
		if (up1_1 == EMPTY) moves.push(['move', x+1, y-1]);
		if (up2_1 == EMPTY) moves.push(['move', x-1, y-1]);
	} else alert("Something has gone horribly wrong"); // this should never happen
	
	//now check for jumps
	
	if (tile == REDM) { // check for jumps if red man
		
		if (down1_1 == WHITEM && down1_2 == EMPTY) {
			
		}
		
	} else if (tile == WHITEM) { // check for jumps if white man
		
	} else if (tile == REDK) { // check for jumps if red king
		
	} else if (tile == WHITEK) { // check for jumps if white king
		
	} else alert("Something has gone horribly wrong"); // this should never happen
	
}

$(function(){
	boardState = initialBoardState;
	getValidMoves(0,5);
})














