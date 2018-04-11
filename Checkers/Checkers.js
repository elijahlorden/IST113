// 0 = empty tile
// 1 = red man
// 2 = red king
// 3 = white man
// 4 = white king
// red starts bottom, white starts top

// constants to prevent magic number issues
var EMPTY = 0;
var REDM = 1;
var REDK = 2;
var WHITEM = 3;
var WHITEK = 4;

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
var getState = (x,y) => {if (x < boardState.length && y < boardState[x].length && x >= 0 && y >= 0) return boardState[x][y]; else return undefined;}
var setState = (x,y,s) => {if (x < boardState.length && y < boardState[x].length && x >= 0 && y >= 0){boardState[x][y] = s; return true} else {return false}}

// for debug purposes, put live board state in a format that can be printed with an alert()
function stringifyState() {
	let s = "";
	for (let x = 0; x < boardState.length; x++) {
		for (let y = 0; y < boardState[x].length; y++) {
			s += boardState[x][y] + " ";
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
function getValidMoves(x, y, isKing) {
	let tile = getState(x, y);
	if (tile == undefined || tile == EMPTY) return []; // return empty array if tile is invalid
	let moves = [];
	//first check for basic moves
	switch(tile) {
		case REDM:
		break;
		case WHITEM:
		break;
	}
	
	
	
}

$(function(){
	boardState = initialBoardState;
	alert(stringifyState());
})














