/**
File: game.js
EECS 581 - Group 21
Project 1 - Minesweeper
Authors: Evan Zhuo, Ian Foerwiser, Jack Morice, Evan Zhuo, Alex Carillo
This file contains all the JavaScript code for the actual game of minesweeper
It is sectioned off based on purpose of each function/code (ui, gameplay, logic, etc)
*/

//Global Variables

//Menu Elements
const MAIN_MENU = document.getElementById("mainPage");
const GAME_MENU = document.getElementById("gamePage");
const OPTION_MENU = document.getElementById("optionPage");
const CREDIT_MENU = document.getElementById("creditPage");
let gameState = 0; //0: MAIN_MENU | 1: GAME_MENU | 2: OPTION_MENU | 3: CREDITS_MENU

//Buttons
const playButton = document.getElementById("playButton");
const optionButton = document.getElementById("optionButton");
const creditButton = document.getElementById("creditButton");
const selectButton = document.getElementById("selectButton");
const resetButton = document.getElementById("resetButton");

//Setting Elements
const board = document.getElementById("board");
const bombAmount = document.getElementById("bombAmount");
const gameStatus = document.getElementById("gameStatus");
const msTiles = document.querySelectorAll("#msTile");

//In-Game Elements
let bombTiles=[]; //list of tiles with bombs
let safeTiles=[]; //list of tiles without bombs
let flaggedTiles=[]; //list of flagged tiles
let adjacentFCTiles=[]; //list of adjacent tiles to first clicked tile

let boardSize = 0; //Size of board
//UI Section
//Disable Function
function disableButton() {
    playButton.disabled = true;
}

//Enable Function
function select() {
    let bombValue = bombAmount.value;
    //Zhang: Add a check to ensure bomb amount is within requirement
    if (bombValue >= 10 && bombValue <= 20) {
        gameStatus.innerHTML = "There will be " + bombValue + " bombs in this round of Minesweeper.";
        playButton.disabled = false;
    } else {
        alert("Please select a bomb value between 10 and 20.");
        playButton.disabled = true;
        gameStatus.innerHTML = "Please select a bomb value between 10 and 20.";
    }
}

//Options Function
function loadOption() {
    gameStatus.innerHTML = '';
    gameState = 2;
    MAIN_MENU.style.display = 'none';
    GAME_MENU.style.display = 'none';
    OPTION_MENU.style.display = 'block';
    CREDIT_MENU.style.display = 'none';
}

//Credits Function
function loadCredit() {
    gameStatus.innerHTML = '';
    gameState = 3;
    MAIN_MENU.style.display = 'none';
    GAME_MENU.style.display = 'none';
    OPTION_MENU.style.display = 'none';
    CREDIT_MENU.style.display = 'block';
}

//Back Function
function returnBack() {
    gameStatus.innerHTML = '';
    gameState = 0;
    MAIN_MENU.style.display = 'block';
    GAME_MENU.style.display = 'none';
    OPTION_MENU.style.display = 'none';
    CREDIT_MENU.style.display = 'none';
}

//Reset Function
function resetPage() {
    window.location.reload()
}


//Gameplay Section
//Load Game Function
function loadGame() {
    MAIN_MENU.style.display = 'none';
    GAME_MENU.style.display = 'block';
    OPTION_MENU.style.display = 'none';
    CREDIT_MENU.style.display = 'none';
    
    gameStatus.innerHTML = ""; //Clear the notification
    generateBoard(); //generate the x by x board
    playGame(); //start the actual game
}

//Zhang: implementation to check for win condition
function checkWinCondition() {
    return (bombTiles.every(tile => flaggedTiles.includes(tile)) && flaggedTiles.length === bombTiles.length);
}

//Zhang: implementation for revealing adjacent tile, logic is similar to calculateTileNumbers, but this time use recursive
//to keep revealing tiles until all safe tiles are uncovered
function revealAdjacentTiles(tile) {
    const tileId = parseInt(tile.id.split('-')[1]);
    const leftEdge = (tileId % 10 === 0);
    const rightEdge = (tileId % 10 === 9);

    const neighbors = [];
    if (tileId >= 10) {
        if (!leftEdge) neighbors.push(tileId - 11); // Top-left
        neighbors.push(tileId - 10); // Top
        if (!rightEdge) neighbors.push(tileId - 9); // Top-right
    }
    if (!leftEdge) neighbors.push(tileId - 1); // Left
    if (!rightEdge) neighbors.push(tileId + 1); // Right
    if (tileId < boardSize - 10) {
        if (!leftEdge) neighbors.push(tileId + 9); // Bottom-left
        neighbors.push(tileId + 10); // Bottom
        if (!rightEdge) neighbors.push(tileId + 11); // Bottom-right
    }

    for (const neighborId of neighbors) {
        const neighborTile = document.getElementById("msTile-" + neighborId);
        if (neighborTile && !neighborTile.revealed && !neighborTile.bomb) {
            neighborTile.classList.add('revealed-' + neighborTile.value);
            neighborTile.revealed = true;
            if (neighborTile.value == 0) {
                revealAdjacentTiles(neighborTile); // Recursively reveal tiles
            }
        }
    }
}
function adjacentTiles(tile) { //Get all adjacent tiles to the first clicked tile
    const tileId = parseInt(tile.id.split('-')[1]); //Get the number ID of the tile
    const leftEdge = (tileId % 10 === 0); //Check if it's on the left edge
    const rightEdge = (tileId % 10 === 9); //Check if it's on the right edge
    const neighbors = []; //hold adjacent tile
    if (tileId >= 10) { //If not on the top row
        if (!leftEdge) neighbors.push(tileId - 11); //northwest
        neighbors.push(tileId - 10); //north
        if (!rightEdge) neighbors.push(tileId - 9); //northeasst
    }
    if (!leftEdge) neighbors.push(tileId - 1); //west
    if (!rightEdge) neighbors.push(tileId + 1); //east
    if (tileId < boardSize - 10) { //If not on the bottom row
        if (!leftEdge) neighbors.push(tileId + 9); //southwest
        neighbors.push(tileId + 10); //south
        if (!rightEdge) neighbors.push(tileId + 11); //southeast
    }
    return neighbors; //return the list of adjacent tiles
}

//Play Function
function playGame() {
    let firstLeftClick = 0; //First Left Click Gate
    gameState = 1; //Set the game as Active
    randomNumber(boardSize);

    //Left Click Listener
    document.addEventListener('click', tileIdentify => { //used Reddit to find similar function and learn target
        if (tileIdentify.target.id && tileIdentify.target.id.startsWith("msTile-")) {
            document.getElementById("testPara").innerHTML = tileIdentify.target.id; //test line [DELETE LATER]
            if (firstLeftClick == 0) { //check if this is the first click or not, so we can generate the bombs
                firstLeftClick = 1; //change flag
                //Zhang: added the new parameter and function
                adjacentFCTiles = adjacentTiles(tileIdentify.target); //Get all adjacent tiles to the first clicked tile
                loadBomb(tileIdentify.target); //generate all bombs on the board
                calculateTileNumbers(); //calculate the numbers for each tile
            }
            if (gameState == 1) { //Check if game is active
                if (tileIdentify.target.bomb == true) { //Bomb Check
                    tileIdentify.target.classList.add('bomb'); // Add bomb image (NOTE: StackOverflow, geeksforgeeks, and MDN web docs were used for help)
                    gameState = 0; //Disable Game
                    endGame(1); //End Game
                }
                if (tileIdentify.target.bomb == false && tileIdentify.target.revealed == false) { //if the tile is not a bomb and hasn't been touched yet
                    tileIdentify.target.classList.add('revealed-' + tileIdentify.target.value); // Add revealed image based on value
                    tileIdentify.target.revealed = true; // Set the tile as revealed
                    //Zhang: revealing surrounding tiles instead of just having one tile revealed when clicking
                    if (tileIdentify.target.value == 0) {
                        revealAdjacentTiles(tileIdentify.target); // Reveal adjacent tiles if the value is 0
                    }
                }
                //Zhang: This should work(?)
                if (checkWinCondition()){ //Check if all bombs are flagged
                    endGame(2); //Win game
                }
                //Otherwise, (aka if it's flagged or revealed) do nothing to it
            }
        }
    });
    //Right Click Listener
    document.addEventListener('contextmenu', tileIdentify => { //used Reddit to find similar function and learn target
        if (tileIdentify.target.matches('button')) {
            if (gameState == 1) {
                if (tileIdentify.target.flagged == false) { //Check if tile is already flagged
                    tileIdentify.target.flagged = true; //set the flag status to true
                    tileIdentify.target.classList.add('flagged'); // Add flag image
                    flaggedTiles.push(tileIdentify.target); //Add to flagged tiles
                    if (checkWinCondition()) {
                        endGame(2);
                    }
                } else {
                    tileIdentify.target.flagged = false; //set the flag status to false
                    tileIdentify.target.classList.remove('flagged'); // Remove flag image   
                    flaggedTiles.splice(flaggedTiles.indexOf(tileIdentify.target), 1); //Remove from flagged tiles
                }
            }
        }
    });
}
//Zhang: Function to calculate the number of adjacent bombs for each tile
function calculateTileNumbers(){
    for (let i = 0; i < boardSize; i++){
        let tile = document.getElementById("msTile-"+ i);
        if (!tile.bomb){
            let adjacentBombs = 0;
            const leftEdge = (i % 10 === 0);
            const rightEdge = (i % 10 === 9);
            if (i > 9 && !leftEdge && document.getElementById("msTile-"+ (i-11)).bomb) adjacentBombs++; //top-left
            if (i > 9 && document.getElementById("msTile-"+ (i-10)).bomb) adjacentBombs++; //top
            if (i > 9 && !rightEdge && document.getElementById("msTile-"+ (i-9)).bomb) adjacentBombs++; //top-right
            if (!leftEdge && document.getElementById("msTile-"+ (i-1)).bomb) adjacentBombs++; //left
            if (!rightEdge && document.getElementById("msTile-"+ (i+1)).bomb) adjacentBombs++; //right
            if (i < boardSize - 10 && !leftEdge && document.getElementById("msTile-"+ (i+9)).bomb) adjacentBombs++; //bottom-left
            if (i < boardSize - 10 && document.getElementById("msTile-"+ (i+10)).bomb) adjacentBombs++; //bottom
            if (i < boardSize - 10 && !rightEdge && document.getElementById("msTile-"+ (i+11)).bomb) adjacentBombs++; //bottom-right
            tile.value = adjacentBombs; //Set the tile's value to the number of adjacent bombs
        }
    }
}

//Game Logic Function
//End Game Function
function endGame(condition) {
    if (condition == '1') {
        gameStatus.innerHTML = "GAME OVER";
        //***INSERT SHOW ALL BOMBS FUNCTION HERE***
    } else if (condition == '2') {
        gameStatus.innerHTML = "CONGRATUATION!";
    } else {
        errorPage(2);
    }
}

//Check if Tile is Bomb Function
function isBomb(tile) {
    return tile.bomb == true; //Check if tile is a bomb, if not return false
} 
            
//Load Bomb Function
//Zhang: redefine this function to assign value to the tile at the same time
function loadBomb(clicked_tile) {
    let bombCounter = bombAmount.value;
    while (bombCounter > 0) {
        let randomValue = randomNumber();
        let tile = document.getElementById("msTile-"+ randomValue);
        if (tile.id !== clicked_tile.id && !adjacentFCTiles.includes(randomValue) && tile.bomb !== true){ //Ensure the first clicked tile is not a bomb or a number tile
            tile.bomb = true;
            bombTiles.push(tile);
            bombCounter--;
        }
        console.log(randomValue); //test line [DELETE LATER]
    } 
}
        
//Random Number Generator
function randomNumber() {
    let randomNum = Math.floor(Math.random() * boardSize);
    return randomNum;
}

//Generate Board Function
function generateBoard() {
    let idNum = 0; //ID number
    for (let i = 0; i < 10; i++) {
        const msRow = document.createElement('div'); // Create a div to store buttons
        board.appendChild(msRow); // Append the div to the board slot
        for (let j = 0; j < 10; j++) {
            const msButton = document.createElement('button'); // Create buttons k times
            msButton.id = "msTile-"+idNum;// assign unique ID for tracking
            // msButton.value = 0; // Set initial value, 0 is a bomb/empty tile, and then 1-3 for amount of bombs around it
            msButton.bomb = false;
            msButton.revealed = false;
            msButton.flagged = false;
            msButton.image = null;
            msRow.appendChild(msButton); // Append buttons to the row
            idNum++;
        }
    }
    boardSize = idNum; //Number is used for randomizer, fix code
}

//Error Function
function errorPage(type) {
    //Remove All UI
    document.getElementById("titleMessage").innerHTML = "Error Detected";
    bombAmount.remove();
    selectButton.remove();
    playButton.remove();
    //Error Type if-else Block
    if (type == 1) {
        gameStatus.innerHTML = "Error 01: No Horse Power - Use the 'Reset' Button to reload the page after checking if the 'Images' folder is present in the file."
    } if (type == 2) {
        gameStatus.innerHTML = "Error 02: Unknown Game End Condition - Use the 'Reset' Button to reload the page."
    }
}

//Image Check Function
function loadHorse(url) { //???????? -Ian 
                            //sybau, its necessary - Evan
    var horse = new Image();
    horse.src = url;
    if (horse.width == 0) {
        errorPage(1)
    } else returnBack();
}