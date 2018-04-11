//0 = empty tile
//1 = red man
//2 = red king
//3 = white man
//4 = white king
// Red starts bottom, white starts top

var EMPTY = 0;
var REDM = 1;
var REDK = 2;
var WHITEM = 3;
var WHITEK = 4;

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

var boardState = [
[0,0,0,0,0,0,0,0],
[0,0,0,0,0,0,0,0],
[0,0,0,0,0,0,0,0],
[0,0,0,0,0,0,0,0],
[0,0,0,0,0,0,0,0],
[0,0,0,0,0,0,0,0],
[0,0,0,0,0,0,0,0],
]

var getState = (x,y) => {if (x < boardState.length && y < boardState[x].length && x >= 0 && y >= 0) return boardState[x][y]; else return undefined;}
var setState = (x,y,s) => {if (x < boardState.length && y < boardState[x].length && x >= 0 && y >= 0){boardState[x][y] = s; return true} else {return false}}

function stringifyState() {
	var s = "";
	for (var x = 0; x < boardState.length; x++) {
		for (var y = 0; y < boardState[x].length; y++) {
			s += boardState[x][y] + " "
		}
		s += "\n"
	}
	return s;
}

$(function(){
	boardState = initialBoardState;
	alert(stringifyState());
})

