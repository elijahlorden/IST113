// ------ Constants ------ \\

const EMPTY = 0;
const WHITEM = 1;
const WHITEK = 2;
const REDM = 3;
const REDK = 4;

const TILE_RED = 0;
const TILE_BLACK = 1;
const TILE_YELLOW = 2;

const SIDE_RED = 0;
const SIDE_WHITE = 1;

//Array of image URLs that must be persisted throughout the game.
const assetsToPreload = [
	"./assets/black_tile.png",
	"./assets/white_man.png",
	"./assets/white_king.png",
	"./assets/red_man.png",
	"./assets/red_king.png",
	"./assets/red_tile.png",
];

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
];
//Array for the board highlight mask
var highlightMask = [];
//Boolean for debouncing board clicks
var clickDB = false;
//Boolean for stopping any click events during game over, new game, or turn switch states
var gameRunning = false;
//Integer holding which side is currently playing
var currentSide = undefined;
//Array holding coordinates of currently selected tile
var selectedTile = [];
//Array holding the current valid moveset
var currentMoves = [];

// ------ Functions ------ \\

//Preload images to prevent flicker

var preloadRef = [];
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
var getState = (x,y) => {if (x >= 0 && y >= 0 && y < boardState.length && x < boardState[y].length) return boardState[y][x]; else return undefined;};
var setState = (x,y,s) => {if (x >= 0 && y >= 0 && y < boardState.length && x < boardState[y].length){boardState[y][x] = s; return true} else {return false}};

//stringify the side integer
var sideString = (side) => {return side == SIDE_RED ? "Red" : "White"};

// for debug purposes, put live board state in a format that can be printed to the console.
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
		if (down1_1 == WHITEM && down1_2 == EMPTY) moves.push(['jump', x+2, y+2]);
		if (down2_1 == WHITEM && down2_2 == EMPTY) moves.push(['jump', x-2, y+2]);
	} else if (tile == WHITEM) { // check for jumps if white man
		if (up1_1 == REDM && up1_2 == EMPTY) moves.push(['jump', x+2, y-2]);
		if (up2_1 == REDM && up2_2 == EMPTY) moves.push(['jump', x-2, y-2]);
	} else if (tile == REDK) { // check for jumps if red king
		if ((down1_1 == WHITEM || down1_1 == WHITEK) && down1_2 == EMPTY) moves.push(['jump', x+2, y+2]);
		if ((down2_1 == WHITEM || down2_1 == WHITEK) && down2_2 == EMPTY) moves.push(['jump', x-2, y+2]);
		if ((up1_1 == WHITEM || up1_1 == WHITEK) && up1_2 == EMPTY) moves.push(['jump', x+2, y-2]);
		if ((up2_1 == WHITEM || up2_1 == WHITEK) && up2_2 == EMPTY) moves.push(['jump', x-2, y-2]);
	} else if (tile == WHITEK) { // check for jumps if white king
		if ((down1_1 == REDM || down1_1 == REDK) && down1_2 == EMPTY) moves.push(['jump', x+2, y+2]);
		if ((down2_1 == REDM || down2_1 == REDK) && down2_2 == EMPTY) moves.push(['jump', x-2, y+2]);
		if ((up1_1 == REDM || up1_1 == REDK) && up1_2 == EMPTY) moves.push(['jump', x+2, y-2]);
		if ((up2_1 == REDM || up2_1 == REDK) && up2_2 == EMPTY) moves.push(['jump', x-2, y-2]);
	} else alert("Something has gone horribly wrong"); // this should never happen
	return moves.length > 0 ? moves : undefined;
}

//Will check if the provided moveset requires any jumps, and remove any non-jump moves if a jump is detected.
function jumpCheck(moves) {
	let hasJump = false;
	for (let i in moves) {
		if (moves[i][0] == 'jump') {hasJump = true; break;}
	}
	if (hasJump) {
		for (let i in moves) {
			if (moves[i][0] != 'jump') array.splice(i,1);
		}
	}
	return hasJump;
}

//Get all moves for the provided side
function getAllMovesForSide(side) {
	let moves = []
	let man = side == SIDE_RED ? REDM : WHITEM;
	let king = side == SIDE_RED ? REDK : WHITEK;
	for (let y=0;y<boardState.length;y++) {
		for (let x=0;x<boardState[y].length;x++) {
			let state = getState(x,y);
			if (state == man || state == king) {
				let moveset = getValidMoves(x,y);
				if (moveset != undefined) {
					moves = moves.concat(moveset);
				}
			}
		}
	}
	return moves.length > 0 ? moves : undefined;
}

//Get tile color based on it's coordinates
function getTileColor(x, y) {
	if (highlightMask.length > 0 && highlightMask.length == boardState.length && highlightMask[0].length == boardState[0].length) {
		if (highlightMask[y][x] == true) return TILE_YELLOW;
	}
	if (y%2 == 0) {
		if (x%2 == 0) return TILE_RED; else return TILE_BLACK;
	} else {
		if (x%2 == 0) return TILE_BLACK; else return TILE_RED;
	}
}

//Return image string a tile color with a specific state
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
		switch(state) {
			case EMPTY: return "assets/yellow_tile.png";
			case WHITEM: return "assets/white_man_yellow.png";
			case WHITEK: return "assets/white_king_yellow.png";
			case REDM: return "assets/red_man_yellow.png";
			case REDK: return "assets/red_king_yellow.png";
		}
	}
}

//Get a string representation of the specified tile
function tileString(x, y) {
	let state = getState(x, y);
	let color = getTileColor(x, y);
	let image = getTileImage(color, state);
	let xGridLength = boardState[0].length;
	let tileSize = 100/xGridLength;
	return "<img onclick='tileClicked("+x+","+y+")'src='" + image +"' style='margin: 0 0; padding: 0 0; border: none; height: 100%; width: " + tileSize + "%'/>";
}

//Get a string representation of the specified row
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

function doesMovesetContainTile(moveset, tx,ty) {
	for (let i in moveset) {
		if (moveset[i][1] == tx && moveset[i][2] == ty) return true;
	}
	return false;
}

//Create a new highlight mask or update an existing one for the provided moveset
function highlightMoves(moves) {
	if (moves == undefined) return;
	for (let y=0;y<boardState.length;y++) {
		highlightMask[y] = [];
		for (let x=0;x<boardState[y].length;x++) {
			highlightMask[y][x] = doesMovesetContainTile(moves, x, y);
			console.log(x + "," + y + " " + doesMovesetContainTile(moves, x, y));
		}
	}
}

function getNumPieces(side) {
	let man = side == SIDE_RED ? REDM : WHITEM;
	let king = side == SIDE_RED ? REDK : WHITEK;
	let n = 0;
	for (let y=0;y<boardState.length;y++) {
		for (let x=0;x<boardState[y].length;x++) {
			let state = getState(x,y);
			if (state == king || state == man) n++;
		}
	}
	return n;
}

//Called when a tile is clicked
function tileClicked(x,y) {
	if (clickDB == true || gameRunning == false) return;
	clickDB = true;
	let state = getState(x,y);
	if (state == EMPTY) {
		
	} else {
		let side = state == REDK || state == REDM ? SIDE_RED : SIDE_WHITE;
		if (side != currentSide) {clickDB = false; return;}
		selectedTile = [x,y];
		alert("correct");
	}
	clickDB = false;
}

//After the current turn has ended, this method is called to start the next player's turn.
function switchTurn() {
	gameRunning = false;
	currentSide = currentSide == SIDE_RED ? SIDE_WHITE : SIDE_RED; // This will prefer red over white (as currentSide starts as undefined)
	console.log(sideString(currentSide) + "'s turn.");
	currentMoves = getAllMovesForSide(currentSide);
	if (currentMoves == undefined || currentMoves.length < 1) {gameOver(SIDE_RED ? SIDE_WHITE : SIDE_RED); return;}
	let hasJump = jumpCheck(currentMoves);
	console.log(hasJump ? ("Jump moves detected, " + moves.length + " Jump(s) possible") : (currentMoves.length + " Move(s) possible"));
	gameRunning = true;
}

//If the switchTurn function detects that the current side is unable to make any moves, this function is called.
function gameOver(winner) {
	gameRunning = false;
	console.log(sideString(winner) + " has won the game");
}
//Called when the 'new game' button is clicked
function newGame() {
	
}

$(function(){
	preloadAssets();
	boardState = newPopulatedBoardArray(8,8,3);
	drawBoard($("#board"));
	switchTurn();
})














