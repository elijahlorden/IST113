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
	"./assets/white_man_yellow.png",
	"./assets/white_king_yellow.png",
	"./assets/red_man_yellow.png",
	"./assets/red_king_yellow.png",
	"./assets/yellow_tile.png"
];

// ------ Gamestate variables ------ \\

// array holding the currrent state of the board
var boardState = [];
//Array for the board highlight mask
var highlightMask = [];
//Boolean for debouncing board clicks (will also be set true during AI turn)
var clickDB = false;
//Boolean for stopping any click events during game over, new game, or turn switch states
var gameRunning = false;
//Integer holding which side is currently playing
var currentSide = undefined;
//Boolean indicating if the current side has already jumped once in the current turn
var jumpedOnce = false;
//Arrays holding coordinates and possible moves for currently selected tile
var selectedTile = [];
var selectedTileMoves = [];
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
	} 
	if (tile == WHITEM || tile == REDK || tile == WHITEK) {
		if (up1_1 == EMPTY) moves.push(['move', x+1, y-1]);
		if (up2_1 == EMPTY) moves.push(['move', x-1, y-1]);
	}
	
	//now check for jumps
	
	if (tile == REDM) { // check for jumps if red man
		if (down1_1 == WHITEM && down1_2 == EMPTY) moves.push(['jump', x+2, y+2, x+1, y+1]);
		if (down2_1 == WHITEM && down2_2 == EMPTY) moves.push(['jump', x-2, y+2, x-1, y+1]);
	} else if (tile == WHITEM) { // check for jumps if white man
		if (up1_1 == REDM && up1_2 == EMPTY) moves.push(['jump', x+2, y-2, x+1, y-1]);
		if (up2_1 == REDM && up2_2 == EMPTY) moves.push(['jump', x-2, y-2, x-1, y-1]);
	} else if (tile == REDK) { // check for jumps if red king
		if ((down1_1 == WHITEM || down1_1 == WHITEK) && down1_2 == EMPTY) moves.push(['jump', x+2, y+2, x+1, y+1]);
		if ((down2_1 == WHITEM || down2_1 == WHITEK) && down2_2 == EMPTY) moves.push(['jump', x-2, y+2, x-1, y+1]);
		if ((up1_1 == WHITEM || up1_1 == WHITEK) && up1_2 == EMPTY) moves.push(['jump', x+2, y-2, x+1, y-1]);
		if ((up2_1 == WHITEM || up2_1 == WHITEK) && up2_2 == EMPTY) moves.push(['jump', x-2, y-2, x-1, y-1]);
	} else if (tile == WHITEK) { // check for jumps if white king
		if ((down1_1 == REDM || down1_1 == REDK) && down1_2 == EMPTY) moves.push(['jump', x+2, y+2, x+1, y+1]);
		if ((down2_1 == REDM || down2_1 == REDK) && down2_2 == EMPTY) moves.push(['jump', x-2, y+2, x-1, y+1]);
		if ((up1_1 == REDM || up1_1 == REDK) && up1_2 == EMPTY) moves.push(['jump', x+2, y-2, x+1, y-1]);
		if ((up2_1 == REDM || up2_1 == REDK) && up2_2 == EMPTY) moves.push(['jump', x-2, y-2, x-1, y-1]);
	} else alert("Something has gone horribly wrong"); // this should never happen
	return moves;
}

//Will check if the provided moveset requires any jumps, and remove any non-jump moves if a jump is detected.
function jumpCheck(moves) {
	let hasJump = false;
	for (let i in moves) {
		if (moves[i][0] == 'jump') {hasJump = true; break;}
	}
	if (hasJump) {
		for (let i = moves.length-1; i>=0; i--) { // Must iterate in in descending order to prevent array modifications from causing the loop to skip values (Only took me like half an hour to find that one...)
			if (moves[i][0] != 'jump') {moves.splice(i,1);}
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
			if (state == king) console.log("king");
			if (state == man || state == king) {
				let moveset = getValidMoves(x,y);
				if (moveset != undefined) {
					moves = moves.concat(moveset);
				}
			}
		}
	}
	return moves;
}

//Check if the provided moveset contains a move with the provided coordinates
function doesMovesetContainTile(moveset, tx,ty) {
	for (let i in moveset) {
		if (moveset[i][1] == tx && moveset[i][2] == ty) return true;
	}
	return false;
}

//Variant of above function, but returns an object rather than a boolean
function doesMovesetContainTileObject(moveset, tx,ty) {
	for (let i in moveset) {
		if (moveset[i][1] == tx && moveset[i][2] == ty) return moveset[i];
	}
	return undefined;
}

//Compares moves in set2 to moves in set1, and returns an array containing common moves.
//All valid moves as set1, current tile moves as set2
function getSharedMoves(set1, set2) {
	let retArray = [];
	for (let i in set2) {
		let obj = doesMovesetContainTileObject(set1, set2[i][1], set2[i][2]);
		if (obj != undefined && obj[0] == set2[i][0]) {
			retArray.push(obj.slice(0)); //copy the object to prevent any possible strangeness
		}
	}
	return retArray;
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

//Create a new highlight mask or update an existing one for the provided moveset
function highlightMoves(moves) {
	if (moves == undefined) return;
	for (let y=0;y<boardState.length;y++) {
		highlightMask[y] = [];
		for (let x=0;x<boardState[y].length;x++) {
			highlightMask[y][x] = doesMovesetContainTile(moves, x, y);
			//console.log(x + "," + y + " " + doesMovesetContainTile(moves, x, y));
		}
	}
}

//Remove the highlight mask
var removeHighlight = () => {highlightMask = [];}

//Get the number of pieces on the board for the provided side
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

//Perform the provided move from the provided tile coordinates
function doMove(tx, ty, move) {
	let tState = getState(tx, ty);
	setState(tx, ty, EMPTY);
	setState(move[1], move[2], tState);
	if (move[0] == 'jump') {
		setState(move[3], move[4], EMPTY);
	}
}

//Check for kings of the provided side
function checkKing(side) {
	//Get side-specific info
	let row = undefined;
	if (side == SIDE_RED) row = boardState[boardState.length-1]; else row = boardState[0];
	let man = side == SIDE_RED ? REDM : WHITEM;
	let king = side == SIDE_RED ? REDK : WHITEK;
	
	for (let i in row) {
		if (row[i] == man) row[i] = king;
	}
	//console.log(stringifyState())
	drawBoard($("#board"));
}

//Called when a tile is clicked
function tileClicked(x,y) {
	if (clickDB == true || gameRunning == false) return;
	clickDB = true;
	let state = getState(x,y);
	if (state == EMPTY) {
		let move = doesMovesetContainTileObject(selectedTileMoves, x, y);
		if (move != undefined) {
			console.log("Valid move");
			doMove(selectedTile[0], selectedTile[1], move);
			removeHighlight();
			drawBoard($("#board"));
			switchTurn();
		} else {
			console.log("Invalid move");
		}
	} else {
		let side = state == REDK || state == REDM ? SIDE_RED : SIDE_WHITE;
		if (side != currentSide) {clickDB = false; return;}
		selectedTile = [x,y];
		console.log("Selected tile at " + x + "," + y);
		selectedTileMoves = getValidMoves(x,y);
		selectedTileMoves = getSharedMoves(selectedTileMoves, currentMoves);
		highlightMoves(selectedTileMoves);
		drawBoard($("#board"));
		console.log("Tile has " + selectedTileMoves.length + " valid moves");
	}

	clickDB = false;
}

//After the current turn has ended, this method is called to start the next side's turn.
function switchTurn() {
	gameRunning = false;
	//Check for kings created in the previous turn
	checkKing(currentSide);
	//Check for additional jump moves on current turn
	if (jumpedOnce) {
		currentMoves = getAllMovesForSide(currentSide);
		if (currentMoves == undefined || currentMoves.length < 1) {gameOver(SIDE_RED ? SIDE_WHITE : SIDE_RED); return;}
		let hasMoreJumps = jumpCheck(currentMoves);
		console.log(currentMoves.length);
		if (hasMoreJumps) {
			console.log("Jump moves detected, " + currentMoves.length + " Jump(s) possible")
			gameRunning = true;
			updateInterface();
			return;
		}
		jumpedOnce = false;
	}
	//Switch current side and get values for new side
	currentSide = currentSide == SIDE_RED ? SIDE_WHITE : SIDE_RED; // This will prefer red over white (as currentSide starts as undefined)
	console.log(sideString(currentSide) + "'s turn");
	currentMoves = getAllMovesForSide(currentSide);
	if (currentMoves == undefined || currentMoves.length < 1) {gameOver(currentSide == SIDE_RED ? SIDE_WHITE : SIDE_RED); return;}
	let hasJump = jumpCheck(currentMoves);
	if (hasJump) jumpedOnce = true;
	console.log(hasJump ? ("Jump moves detected, " + currentMoves.length + " Jump(s) possible") : (currentMoves.length + " Move(s) possible"));
	updateInterface();
	gameRunning = true;
}

//If the switchTurn function detects that the current side is unable to make any moves, this function is called.
function gameOver(winner) {
	gameRunning = false;
	console.log(sideString(winner) + " has won the game");
	updateInterface();
}
//Called when the 'new game' button is clicked
function newGame() {
	updateInterface();
}

//Used to update the interface with current game information
function updateInterface() {
	let turnObj = $("#turnIndicator");
	if (currentSide == SIDE_WHITE) {
		turnObj.css("background", "linear-gradient(to right, lightgreen 50%, transparent 50%)");
	} else {
		turnObj.css("background", "linear-gradient(to left, lightgreen 50%, transparent 50%)");
	}
	
	
}

//Execute an AI turn for the provided side
function doAITurn(side) {
	
}

$(function(){
	preloadAssets();
	boardState = newPopulatedBoardArray(8,8,3);
	drawBoard($("#board"));
	updateInterface();
	switchTurn();
	$("#newGameButton").on("click", newGame);
})














//This is the most-documented piece of code I have ever written.