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

const P_WILL_GET_KING = 0;
const P_SAFE = 1;
const P_WILL_CAUSE_CAP = 2;
const P_LAST_RESORT = 3;

const MAX_BOARD_SIZE = 25;
const MIN_BOARD_SIZE = 4;

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
//Boolean for the pause button
var gamePaused = false;
//Integer holding which side is currently playing
var currentSide = undefined;
//Boolean indicating if the current side has already jumped once in the current turn
var jumpedOnce = false;
//Arrays holding coordinates and possible moves for currently selected tile
var selectedTile = [];
var selectedTileMoves = [];
//Array holding the current valid moveset
var currentMoves = [];
//Boolean values indicating if either side is AI-controlled.
var redAI = true;
var whiteAI = false;
//Integer holding the delay (in miliseconds) between AI moves (updated from input box on game start)
var AIInterval = 500;
//Buffer integers for the board size and filled rows input boxes
var ngBoardSize = 8;
var ngfilledRows = 3;


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
	//Too lazy to refactor, appending origin tile coordinates to the end of each move (for the AI)
	for (let i in moves) {
		moves[i][moves[i].length] = x;
		moves[i][moves[i].length] = y;
	}
	return moves;
}

//Will check if the provided moveset requires any jumps, and remove any non-jump moves if a jump is detected
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
	//Check the relevent row
	for (let i in row) {
		if (row[i] == man) row[i] = king;
	}
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
	updateInterface();
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

//Used to update the interface with current game information
function updateInterface() {
	let turnObj = $("#turnIndicator");
	if (currentSide == SIDE_WHITE) {
		turnObj.css("background", "linear-gradient(to right, lightgreen 50%, transparent 50%)");
	} else {
		turnObj.css("background", "linear-gradient(to left, lightgreen 50%, transparent 50%)");
	}
}

//Will return a random number between min and max (used in the AI)
function constrainedRandom(min, max) {
    return Math.floor(Math.random() * (max - min) ) + min;
}

//get and set functions for simulated boards
var getSimState = (x,y,b) => {if (x >= 0 && y >= 0 && y < b.length && x < b[y].length) return b[y][x]; else return undefined;};
var setSimState = (x,y,s,b) => {if (x >= 0 && y >= 0 && y < b.length && x < b[y].length){b[y][x] = s; return true} else {return false}};

//A separate doMove function for simulated moves
function doSimMove(side, move, board) {
	if (move == undefined) return;
	let tx = move[0] == 'jump' ? move[5] : move[3];
	let ty = move[0] == 'jump' ? move[6] : move[4];
	let tState = getSimState(tx, ty, board);
	setSimState(tx, ty, EMPTY, board);
	setSimState(move[1], move[2], tState, board);
	if (move[0] == 'jump') {
		setSimState(move[3], move[4], EMPTY, board);
	}
}

//Simulate the provided move, returns move priority
function getMovePriority(side, move, simState) {
	let sameMan = side == SIDE_RED ? REDM : WHITEM;
	let defRow = side == SIDE_RED ? 0 : boardState.length-1;
	let kingRow = side == SIDE_RED ? boardState.length-1 : 0;
	let sourceX = move[0] == 'jump' ? move[5] : move[3];
	let sourceY = move[0] == 'jump' ? move[6] : move[4];
	let destX = move[1];
	let destY = move[2];
	let originTile = getState(sourceX,sourceY);
	
	if (destY == kingRow && originTile == sameMan) return P_WILL_GET_KING; // Getting kings if possible is highest priority
	if (sourceY == defRow && originTile == sameMan) return P_LAST_RESORT; // Leaving the home row undefended is the lowest priority
	
	//I am attempting to use as little CPU-time as needed with this code, which is why the other two checks are performed first
	let simBoard = JSON.parse(simState); // If neither of the above will happen, run the simulated turn
	
	doSimMove(side, move, simBoard); // Do the provided move on the simulated board
	
	let diag1_1 = getState(destX-1, destY+1); // down 1 left 1
	let diag1_2 = getState(destX+1, destY-1); // up 1 right 1
	let diag2_1 = getState(destX+1, destY+1); // down 1 right 1
	let diag2_2 = getState(destX-1, destY-1); // up 1 left 1
	
	//There are better ways to do this, but this was the quickest way to implement it.
	if (originTile == WHITEM) {
		if (diag1_1 == EMPTY && (diag1_2 == REDM || diag1_2 == REDK)) return P_WILL_CAUSE_CAP;
		if (diag2_1 == EMPTY && (diag2_2 == REDM || diag2_2 == REDK)) return P_WILL_CAUSE_CAP;
		if (diag1_2 == EMPTY && diag1_1 == REDK) return P_WILL_CAUSE_CAP;
		if (diag2_2 == EMPTY && diag2_1 == REDK) return P_WILL_CAUSE_CAP;
	} else if (originTile == REDM) {
		if (diag1_2 == EMPTY && (diag1_1 == WHITEM || diag1_1 == WHITEK)) return P_WILL_CAUSE_CAP;
		if (diag2_2 == EMPTY && (diag2_1 == WHITEM || diag2_1 == WHITEK)) return P_WILL_CAUSE_CAP;
		if (diag1_1 == EMPTY && diag1_2 == WHITEK) return P_WILL_CAUSE_CAP;
		if (diag2_1 == EMPTY && diag2_2 == WHITEK) return P_WILL_CAUSE_CAP;
	} else if (originTile == WHITEK) {
		if (diag1_2 == EMPTY && diag1_1 == REDK) return P_WILL_CAUSE_CAP;
		if (diag2_2 == EMPTY && diag2_1 == REDK) return P_WILL_CAUSE_CAP;
		if (diag1_1 == EMPTY && diag1_2 == REDK) return P_WILL_CAUSE_CAP;
		if (diag2_1 == EMPTY && diag2_2 == REDK) return P_WILL_CAUSE_CAP;
	} else if (originTile == REDK) {
		if (diag1_2 == EMPTY && diag1_1 == WHITEK) return P_WILL_CAUSE_CAP;
		if (diag2_2 == EMPTY && diag2_1 == WHITEK) return P_WILL_CAUSE_CAP;
		if (diag1_1 == EMPTY && diag1_2 == WHITEK) return P_WILL_CAUSE_CAP;
		if (diag2_1 == EMPTY && diag2_2 == WHITEK) return P_WILL_CAUSE_CAP;
	}
	return P_SAFE;
}

//Run a simulated turn for each move and check if the moved king/man can be jumped in the turn after.  Then assign each move a risk, and return the least-risky move
function getAIMove(side, moves) {
	if (moves == undefined) return;
	let priorityMoves = [[],[],[],[]] // Array containing moves ordered based on priority
	let simState = JSON.stringify(boardState);
	for (let i in moves) {
		let priority = getMovePriority(side, moves[i], simState);
		priorityMoves[priority].push(moves[i]);
	}
	for (let i in priorityMoves) { console.log(priorityMoves[i].length + " Moves in priority " + i); }
	for (let i in priorityMoves) {
		if (priorityMoves[i].length > 0) {
			return priorityMoves[i][constrainedRandom(0,priorityMoves[i].length)];
		}
	}
}

//A separate doMove function for the AI, making use of move tile coordinates
function doAIMove(side, move) {
	if (move == undefined) return;
	let tx = move[0] == 'jump' ? move[5] : move[3];
	let ty = move[0] == 'jump' ? move[6] : move[4];
	let tState = getState(tx, ty);
	setState(tx, ty, EMPTY);
	setState(move[1], move[2], tState);
	if (move[0] == 'jump') {
		setState(move[3], move[4], EMPTY);
	}
}

//Execute an AI turn for the provided side
//The AI does not look at individual tiles like the player does, so it requires tile coordinates to be present in the moveset
function doAITurn(side) {
	clickDB = true;
	console.log(sideString(side) + "AI turn");
	let hasJumped = false;
	let hasMoved = false;
	let intervalID = setInterval(function(){
		let moves = getAllMovesForSide(side);
		let hasJump = jumpCheck(moves);
		if (hasJump) {
			hasJumped = true;
			doAIMove(side, getAIMove(side, moves));
			drawBoard($("#board"));
		} else if (!hasJumped) {
			doAIMove(side, getAIMove(side, moves));
			drawBoard($("#board"));
			switchTurn();
			clearInterval(intervalID);
			clickDB = false;
		} else {
			drawBoard($("#board"));
			switchTurn();
			clearInterval(intervalID);
			clickDB = false;
		}
	}, AIInterval);
}

//Save the current game to storage
function saveGame() {
	if (typeof(localStorage) != undefined) {
		if (clickDB) return;
		localStorage.setItem("CheckersGameSaveArray", JSON.stringify([boardState, highlightMask, currentSide, jumpedOnce, AIInterval]));
		alert("Game saved");
	} else {
		alert("Your browser does not support Web Storage!\nYou will not be able to save or load games from this browser.");
	}
}

//Load the saved game from storage
function loadGame() {
	if (clickDB) return;
	let backTo = gameRunning;
	gameRunning = false;
	if (typeof(localStorage) != undefined) {
		let savedGame = JSON.parse(localStorage.getItem("CheckersGameSaveArray"));
		console.log(savedGame[0]);
		if (savedGame != undefined && savedGame.length == 5) {
			boardState = savedGame[0];
			highlightMask = savedGame[1];
			currentSide = savedGame[2];
			jumpedOnce = savedGame[3];
			AIInterval = savedGame[4];
		} else {
			alert("No saved game found");
			gameRunning = backTo;
			return;
		}
	} else {
		gameRunning = backTo;
		alert("Your browser does not support Web Storage!\nYou will not be able to save or load games from this browser.");
		return;
	}
	updateInterface();
	drawBoard($("#board"));
	gameRunning = true;
}

//Called when the 'new game' button is clicked
function newGame() {
	gameRunning = false;
	removeHighlight();
	boardState = newPopulatedBoardArray(ngBoardSize,ngBoardSize,ngfilledRows);
	redAI = $("#redAIBox").prop("checked");
	whiteAI = $("#whiteAIBox").prop("checked");
	drawBoard($("#board"));
	updateInterface();
	gameRunning = true;
	switchTurn();
}

//Get the maximum number of filled rows for the provided board size
function maxFilledRowsForSize(s) {
	return Math.round(s/2)-1;
}

$(function(){
	preloadAssets();
	boardState = newBoardArray(8,8,3);
	drawBoard($("#board"));
	updateInterface();
	switchTurn();
	$("#cleargame").on("click", newGame);
	$("#savegame").on("click", saveGame);
	$("#loadgame").on("click", loadGame);
	
	//Update listener for 'board size' input box
	$("#boardSize").on("change", function() {
		let inNum = parseInt(this.value);
		if (isNaN(inNum)) {
			this.value = MIN_BOARD_SIZE;
			ngBoardSize = MIN_BOARD_SIZE;
		} else {
			inNum = Math.max(Math.min(MAX_BOARD_SIZE, inNum), MIN_BOARD_SIZE);
			this.value = inNum;
			ngBoardSize = inNum;
		}
		$("#boardRows").trigger("change");
	});
	
	//Update listener for 'filled rows' input box
	$("#boardRows").on("change", function() {
		let inNum = parseInt(this.value);
		if (isNaN(inNum)) {
			this.value = 1;
			ngfilledRows = 1;
		} else {
			inNum = Math.max(Math.min(maxFilledRowsForSize(ngBoardSize), inNum),1);
			this.value = inNum;
			ngfilledRows = inNum;
		}
	});
	
	setInterval(function() {
		if (gamePaused || clickDB || !gameRunning) return;
		if ((currentSide == SIDE_RED && redAI == true) || (currentSide == SIDE_WHITE && whiteAI == true)) {
			doAITurn(currentSide);
		}
	}, 1);
	
})













//I decided to skip major refactoring if possible, and as a result the code is quite a mess.
//This is the most-documented piece of code I have ever written