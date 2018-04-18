// ------ Constants ------ \\

var EMPTY = 0;
var WHITEM = 1;
var WHITEK = 2;
var REDM = 3;
var REDK = 4;

var TILE_RED = 0;
var TILE_BLACK = 1;
var TILE_YELLOW = 1;

var RED_TURN = 0;
var WHITE_TURN = 1;

//Array of image URLs that must be persisted throughout the game.
var assetsToPreload = [
	"./assets/black_tile.png",
	"./assets/white_man.png",
	"./assets/white_king.png",
	"./assets/red_man.png",
	"./assets/red_king.png",
	"./assets/red_tile.png",
]

// ------ Gamestate variables ------ \\

// array holding the currrent state of the board
var boardState = [
	[0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0],
]

// ------ Functions ------ \\

//preload images to prevent flicker

var preloadRef = []
function preloadAsset(url) {
    var img=new Image();
    img.src=url;
	preloadRef.push(img);
}

function preloadAssets() {
	for (let i in assetsToPreload) {
		preloadAsset(assetsToPreload[i]);
	}
}

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

//Get tile color based on it's coordinates
function getTileColor(x, y) {
	if (y%2 == 0) {
		if (x%2 == 0) return TILE_RED; else return TILE_BLACK;
	} else {
		if (x%2 == 0) return TILE_BLACK; else return TILE_RED;
	}
}

function getTileImage(color, state) {
	if (color == TILE_RED) {
		return "assets/red_tile.png"; // no red tiles will ever be occupied
	} else if (color == TILE_BLACK) {
		switch(state) {
			case EMPTY: return "assets/black_tile.png";
			case WHITEM: return "assets/white_man.png";
			case WHITEK: return "assets/white_king.png";
			case REDM: return "assets/red_man.png";
			case REDK: return "assets/red_king.png";
		}
	} else {
		
	}
}

function tileString(x, y) {
	let state = getState(x, y);
	let color = getTileColor(x, y);
	let image = getTileImage(color, state);
	let xGridLength = boardState[0].length;
	let tileSize = 100/xGridLength;
	return "<img onclick='tileClicked("+x+","+y+")'src='" + image +"' style='margin: 0 0; padding: 0 0; border: none; height: 100%; width: " + tileSize + "%'/>";
}

function rowString(y) {
	let fsHeight = 100/boardState.length;
	let s = "<fieldset style='margin: 0 0; padding: 0 0; border: none; width: 100%; height:" + fsHeight +"%;'>";
	for (let x=0;x<boardState[y].length;x++) {
		s += tileString(x,y);
	}
	s += "</fieldset>";
	return s;
}
//Draw the current boardState inside the provided jQuery object
function drawBoard(obj) {
	let boardString = ""
	for (let y=0;y<boardState.length;y++) {
		boardString += rowString(y);
	}
	obj.children().each(function() {
		this.remove();
	});
	obj.append(boardString);
}

//Create a new, completely empty board array.
function newBoardArray(xSize, ySize) {
	let retArray = []
	for (let y=0;y<ySize;y++) {
		retArray[y] = [];
		for (let x=0;x<xSize;x++) {
			retArray[y][x] = EMPTY;
		}
	}
	return retArray
}

//Create a new board array, populated with initial rows of pieces.
function newPopulatedBoardArray(xSize, ySize, playerRows) {
	let board = newBoardArray(xSize, ySize);
	for (let y=0;y<playerRows;y++) {
		for (let x=0;x<board[y].length;x++) {
			if (getTileColor(x,y) == TILE_BLACK) board[y][x] = REDM;
		}
	}
	for (let y=board.length-playerRows;y<board.length;y++) {
		for (let x=0;x<board[y].length;x++) {
			if (getTileColor(x,y) == TILE_BLACK) board[y][x] = WHITEM;
		}
	}
	return board;
}

var state = 0;

function tileClicked(x,y) {
	state++;
	switch(state) {
		case 1:
			boardState = newPopulatedBoardArray(10,10,4);
			drawBoard($("#board"));
			break;
		case 2:
			boardState = newPopulatedBoardArray(15,15,6);
			drawBoard($("#board"));
			break;
		case 3:
			boardState = newPopulatedBoardArray(40,40,9);
			drawBoard($("#board"));
			break;
		default:
			state = 0;
			tileClicked(x,y);
			break;
	}
}

$(function(){
	preloadAssets();
	boardState = newPopulatedBoardArray(8,8,3);
	drawBoard($("#board"));
})














