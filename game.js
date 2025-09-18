/**
File: game.js
EECS 581 - Group 21
Project 1 - Minesweeper
Authors: Evan Zhuo, Ian Foerwiser, Jack Morice, Zhang Chen, Alex Carillo
This file contains all the JavaScript code for the actual game of minesweeper
It is sectioned off based on purpose of each function/code (ui, gameplay, logic, etc)
The only inputs taken in are from the user clicking buttons to navigate the page and play the game, or choosing a bomb amount
The outputs are the visual display of the game, as well as text prompts to the user detailing the game status
*/

//Global Variables

//Menu Elements
//Each menu corresponds to its div in the index.html file
const MAIN_MENU = document.getElementById("mainPage");
const GAME_MENU = document.getElementById("gamePage");
const OPTION_MENU = document.getElementById("optionPage");
const CREDIT_MENU = document.getElementById("creditPage");
const PREGAME_MENU = document.getElementById("preGamePage");
let currentTheme = 0; //0: SCUFF_STYLE | 1: DARK_STYLE | 2: CLASSIC_STYLE
let gameState = 0; //0: MAIN_MENU | 1: GAME_MENU | 2: OPTION_MENU | 3: CREDITS_MENU

//Buttons
//Each button corresponds to its element in the index.html file
const playButton = document.getElementById("playButton");
const optionButton = document.getElementById("optionButton");
const creditButton = document.getElementById("creditButton");
const themeButton = document.getElementById("themeButton");
const selectButton = document.getElementById("selectButton");
const resetButton = document.getElementById("resetButton");

//Setting Elements
//Each element corresponds to its respective version in the index.html file
const board = document.getElementById("board");
const bombAmount = document.getElementById("bombAmount");
const gameStatus = document.getElementById("gameStatus");
const msTiles = document.querySelectorAll("#msTile");
const mineNum = document.getElementById("mineNum");


//In-Game Elements
let bombTiles=[]; //list of tiles with bombs
let safeTiles=[]; //list of tiles without bombs
let flaggedTiles=[]; //list of flagged tiles
let adjacentFCTiles=[]; //list of adjacent tiles to first clicked tile
let boardSize = 0; //Size of board


//UI Section
//Disable Function
function disableButton() {
    playButton.disabled = true; //Disable Play Button
}

//Enable Function
function select() {
    let bombValue = bombAmount.value; //Get the value of the bomb amount input
    //Zhang: Add a check to ensure bomb amount is within requirement
    if (bombValue >= 10 && bombValue <= 20) { //Check if the bomb amount is between 10 and 20
        playButton.disabled = false; //Enable Play Button
        bombAmount.style.display = 'none'; //Hide the bomb input
        selectButton.style.display = 'none'; //Hide the select button
        startGame(); //Start the game
    } else { //If invalid input
        alert("Please select a bomb value between 10 and 20."); //Alert the user
        playButton.disabled = true; //Disable Play Button
        gameStatus.innerHTML = "Please select a bomb value between 10 and 20."; //Update the notification
    }
}

//Options Function
function loadOption() {
    gameStatus.innerHTML = ''; //Clear the gameStatus
    gameState = 2; //Set the gameState to Options
    //Hide all unimportant menus, show only options
    MAIN_MENU.style.display = 'none'; 
    GAME_MENU.style.display = 'none';
    OPTION_MENU.style.display = 'block';
    CREDIT_MENU.style.display = 'none';
    PREGAME_MENU.style.display = 'none';
}

//Credits Function
function loadCredit() {
    gameStatus.innerHTML = ''; //Clear the gameStatus
    gameState = 3; //Set the gameState to Credits
    //Hide all unimportant menus, show only credits
    MAIN_MENU.style.display = 'none';
    GAME_MENU.style.display = 'none';
    OPTION_MENU.style.display = 'none';
    CREDIT_MENU.style.display = 'block';
    PREGAME_MENU.style.display = 'none';
}

//Back Function
function returnBack() {
    gameStatus.innerHTML = ''; //Clear the gameStatus
    gameState = 0; //Set the gameState to Main Menu
    //Hide all unimportant menus, go back to main menu
    MAIN_MENU.style.display = 'block';
    GAME_MENU.style.display = 'none';
    OPTION_MENU.style.display = 'none';
    CREDIT_MENU.style.display = 'none';
    PREGAME_MENU.style.display = 'none';
}

//Reset Function
function resetPage() {
    window.location.reload() //Reload the page
}


//Gameplay Section
//Load Game Function
function loadGame() {
    //Load the game page and show only the pregame menu
    MAIN_MENU.style.display = 'none';
    OPTION_MENU.style.display = 'none';
    CREDIT_MENU.style.display = 'none';
    PREGAME_MENU.style.display = 'block';
    gameStatus.innerHTML = ""; //Clear the notification
}

function startGame(){
    gameStatus.innerHTML = "There will be " + bombAmount.value + " bombs. The Game Is Now In Progress, Good Luck!"; //Tell the user the amount of bombs and say the game has begun
    GAME_MENU.style.display = 'block'; //Show the game menu
    PREGAME_MENU.style.display = 'none'; //Hide the pregame menu
    generateBoard(); //generate the x by x board
    playGame(); //start the actual game
}

function checkWinCondition() {
    return (bombTiles.every(tile => flaggedTiles.includes(tile)) && flaggedTiles.length === bombTiles.length); //If the number of flagged tiles equals the number of bomb tiles, and all bomb tiles are flagged, return true
}

function remainingMines(){
    mineNum.innerHTML = (bombTiles.filter(tile => !flaggedTiles.includes(tile))).length; //Calculate remaining mines by bomb tiles that are not flagged, and set the value to the mineNum element
}
//Zhang: implementation for revealing adjacent tile, logic is similar to calculateTileNumbers, but this time use recursive
//to keep revealing tiles until all safe tiles are uncovered
function revealAdjacentTiles(tile) {
    const tileId = parseInt(tile.id.split('-')[1]); //Get the number ID of the tile
    const leftEdge = (tileId % 10 === 0); //Check if it's on the left edge
    const rightEdge = (tileId % 10 === 9); //Check if it's on the right edge

    const neighbors = []; //hold adjacent tile

    if (tileId >= 10) { //If not on the top row
        if (!leftEdge) neighbors.push(tileId - 11); // Top-left
        neighbors.push(tileId - 10); // Top
        if (!rightEdge) neighbors.push(tileId - 9); // Top-right
    }
    if (!leftEdge) neighbors.push(tileId - 1); // Left
    if (!rightEdge) neighbors.push(tileId + 1); // Right
    if (tileId < boardSize - 10) { //If not on the bottom row
        if (!leftEdge) neighbors.push(tileId + 9); // Bottom-left
        neighbors.push(tileId + 10); // Bottom
        if (!rightEdge) neighbors.push(tileId + 11); // Bottom-right
    }

    for (const neighborId of neighbors) { //For each adjacent tile
        const neighborTile = document.getElementById("msTile-" + neighborId); //Get the tile element
        if (neighborTile && !neighborTile.revealed && !neighborTile.bomb) { //If the tile exists, is not revealed, and is not a bomb
            neighborTile.classList.add('revealed-' + neighborTile.value); // Reveal the tile
            neighborTile.revealed = true; // Set the tile as revealed
            if (neighborTile.value == 0) { //If the tile's value is 0
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
    randomNumber(boardSize); //Generate random numbers for bomb placement
    mineNum.innerHTML = bombAmount.value; //Set the mineNum element to the bomb amount
    //Left Click Listener
    document.addEventListener('click', tileIdentify => { //used Reddit to find similar function and learn target
        console.log(firstLeftClick); //test line [DELETE LATER]
        if (tileIdentify.target.id && tileIdentify.target.id.startsWith("msTile-")) {
            if (firstLeftClick == 0) { //check if this is the first click or not, so we can generate the bombs
                firstLeftClick = 1; //change flag
                //Zhang: added the new parameter and function
                adjacentFCTiles = adjacentTiles(tileIdentify.target); //Get all adjacent tiles to the first clicked tile
                loadBomb(tileIdentify.target); //generate all bombs on the board
                calculateTileNumbers(); //calculate the numbers for each tile
            }
            if (gameState == 1) { //Check if game is active
                if (tileIdentify.target.bomb == true && tileIdentify.target.flagged == false) { //If a bomb tile is clicked and not flagged
                    tileIdentify.target.classList.add('bomb'); // Add bomb image (NOTE: StackOverflow, geeksforgeeks, and MDN web docs were used for help)
                    gameState = 0; //Disable Game
                    endGame(1); //End Game
                }
                if (tileIdentify.target.bomb == false && tileIdentify.target.revealed == false && tileIdentify.target.flagged == false) { //if the tile is not a bomb and hasn't been touched yet and is not flagged
                    tileIdentify.target.classList.add('revealed-' + tileIdentify.target.value); // Add revealed image based on value
                    tileIdentify.target.revealed = true; // Set the tile as revealed
                    //Zhang: revealing surrounding tiles instead of just having one tile revealed when clicking
                    if (tileIdentify.target.value == 0) {
                        revealAdjacentTiles(tileIdentify.target); // Reveal adjacent tiles if the value is 0
                    }
                }
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
            if (gameState == 1) { //Check if game is active
                if (tileIdentify.target.flagged == false && !tileIdentify.target.revealed) { //Check if tile is already flagged and not revealed yet
                    tileIdentify.target.flagged = true; //set the flag status to true
                    tileIdentify.target.classList.add('flagged'); // Add flag image
                    flaggedTiles.push(tileIdentify.target); //Add to flagged tiles
                    remainingMines(); //Update remaining mine count
                    if (checkWinCondition()) { //Check if all bombs are flagged
                        endGame(2); //Win game
                    }
                } else {
                    tileIdentify.target.flagged = false; //set the flag status to false
                    tileIdentify.target.classList.remove('flagged'); // Remove flag image   
                    flaggedTiles.splice(flaggedTiles.indexOf(tileIdentify.target), 1); //Remove from flagged tiles
                    remainingMines(); //Update remaining mine count
                }
            }
        }
    });
}
//Zhang: Function to calculate the number of adjacent bombs for each tile
function calculateTileNumbers(){
    for (let i = 0; i < boardSize; i++){ //For each tile on the board
        let tile = document.getElementById("msTile-"+ i); //Get the tile element
        if (!tile.bomb){ //If the tile is not a bomb
            let adjacentBombs = 0; //Counter for adjacent bombs
            const leftEdge = (i % 10 === 0); //Check if it's on the left edge
            const rightEdge = (i % 10 === 9); //Check if it's on the right edge
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
    if (condition == '1') { //Lose Condition
        gameStatus.innerHTML = "GAME OVER";
        for (let i = 0; i < bombTiles.length; i++) { //Reveal all bombs when the game ends
            if (!bombTiles[i].flagged) { //If the bomb tile is not flagged
                bombTiles[i].classList.add('bomb'); // Reveal the bomb
            }
        }
    } else if (condition == '2') { //Win Condition
        gameStatus.innerHTML = "CONGRATULATIONS! YOU WIN!"; //Notify the user they won
    } else {
        errorPage(2); //Unknown Condition, throw error
    }
}

//Check if Tile is Bomb Function
function isBomb(tile) {
    return tile.bomb == true; //Check if tile is a bomb, if not return false
} 
            
//Load Bomb Function
//Zhang: redefine this function to assign value to the tile at the same time
function loadBomb(clicked_tile) { //Generate bombs on the board
    let bombCounter = bombAmount.value; //Get the number of bombs to place
    while (bombCounter > 0) { //While there are still bombs to place
        let randomValue = randomNumber(); //Get a random number
        let tile = document.getElementById("msTile-"+ randomValue); //Get the tile element
        if (tile.id !== clicked_tile.id && !adjacentFCTiles.includes(randomValue) && tile.bomb !== true){ //Ensure the first clicked tile is not a bomb or a number tile
            tile.bomb = true; //Set the tile as a bomb
            bombTiles.push(tile); //Add to bomb tiles
            bombCounter--; //Decrease the bomb counter
        }
    } 
}
        
//Random Number Generator
function randomNumber() {
    let randomNum = Math.floor(Math.random() * boardSize); //Generate a random number between 0 and boardSize-1
    return randomNum; //Return the random number
}

//Generate Board Function
function generateBoard() {
    let idNum = 0; //ID number

    var abc = "abcdefghijklmnopqrstuvwxyz".toUpperCase(); //For columns
    const headerRow = document.createElement('div'); // Create a div to store column headers
    headerRow.setAttribute('style', 'display:flex ; align-items:center; justify-content:center;'); //Style the header row
    board.appendChild(headerRow); // Append the div to the board slot

    const corner = document.createElement('div'); // Top-left corner creation
    corner.style.width = '50px';
    headerRow.append(corner);

    for(let i = 0; i < 10; i++){ //column headers
        const colLabel = document.createElement('div'); // Create a div to store column labels
        var letter = abc.substring(i,i+1); //Get the letter for the column
        colLabel.innerText = letter; //Set the text of the column label
        colLabel.setAttribute('style','align-items:center ;width:50px; height:50px; display:flex ;justify-content:center;'); //Style it
        headerRow.append(colLabel); //Append it to the header row
    }

    for (let i = 0; i < 10; i++) { //rows
        const msRow = document.createElement('div'); // Create a div to store buttons
        msRow.setAttribute('style', 'display:flex ; align-items:center; justify-content:center;') //Style the row
        board.appendChild(msRow); // Append the div to the board slot

        const rowLabel = document.createElement('div'); // Create a div to store row labels
        rowLabel.setAttribute('style','align-items:center ;width:50px; height:50px; display:flex ;justify-content:center') //Style it
        var txt = (i+1).toString(); //Get the number for the row
        rowLabel.innerText = txt; //Set the text of the row label
        msRow.appendChild(rowLabel) //Append it to the row

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
    //I call this one div hellscape
}

//Change Style Function
function changeTheme() { //
    let theme = document.body; //Get the body element
    currentTheme++; //Increment the theme
    if (currentTheme == 3) currentTheme = 0; //Reset if out of bounds

    //Theme Toggle
    if (currentTheme == 0) {
        theme.classList.toggle("dark-mode");
        theme.classList.toggle("classic-mode");
        themeButton.innerHTML = "Default Theme";
    } else if (currentTheme == 1) {
        theme.classList.toggle("dark-mode");
        themeButton.innerHTML = "Dark Theme";
    } else if (currentTheme == 2) {
        theme.classList.toggle("classic-mode");
        themeButton.innerHTML = "Classic Theme";
    }
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
//Can we please delete this
function loadHorse(url) { 
    var horse = new Image();
    horse.src = url;
    if (horse.width == 0) {
        errorPage(1)
    } else returnBack();
}