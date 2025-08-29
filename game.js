            const board = document.getElementById("board");
            const bombAmount = document.getElementById("bombAmount");
            const selectButton = document.getElementById("selectButton");
            const playButton = document.getElementById("playButton");
            const resetButton = document.getElementById("resetButton");
            const gameStatus = document.getElementById("gameStatus");
            const msTiles = document.querySelectorAll("#msTile");
            let boardSize = 0; //Size of board
            let gameActive = 0; //0: INACTIVE | 1: ACTIVE

        //UI Section

            //Disable Function
            function disableButton() {
                playButton.disabled = true;
            }

            //Enable Function
            function select() {
                let bombValue = bombAmount.value;
                gameStatus.innerHTML = "There will be " + bombValue + " bombs in this round of Minesweeper.";
                playButton.disabled = false;
            }

            //Reset Function
            function resetPage() {
                window.location.reload()
            }


        //Gameplay Section

            //Load Game Function
            function loadGame() {
                bombAmount.disabled = true; //Disable Bomb Select
                selectButton.disabled = true; //Disable Select Button
                playButton.disabled = true; //Disable Play Button
                gameStatus.innerHTML = ""; //Clear the notification
                generateBoard();
                playGame();
            }

            //Play Function
            function playGame() {
                let firstLeftClick = 0; //First Left Click Gate
                gameActive = 1; //Set the game as Active
                randomNumber(boardSize);

                //Left Click Listener
                document.addEventListener('click', tileIdentify => { //used Reddit to find similar function and learn target
                    if (tileIdentify.target.matches('button')) {
                        document.getElementById("testPara").innerHTML = tileIdentify.target.value; //test line [DELETE LATER]
                        //FIRST CLICK HERE
                        terrorism()
                        if (gameActive == 1) { //Check if game is active
                            if (tileIdentify.target.value == 'b') { //Bomb Check
                                gameActive = 0; //Disable Game
                                endGame(1);
                            }
                        }
                    }
                });
                //Right Click Listener
                document.addEventListener('contextmenu', tileIdentify => { //used Reddit to find similar function and learn target
                    if (tileIdentify.target.matches('button')) {
                        if (gameActive == 1) {
                            document.getElementById("testPara").innerHTML = "flag"; //test line [DELETE LATER]
                        }
                    }
                });
            }


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

            //Check if Tile is Number Function
            function isNumber() {
                //define
            }

            //Check if Tile is Bomb Function
            function isBomb(tile) {
                if (tile.value == 'b') { //Tile is a bomb
                    return true;
                } else { //Tile is NOT a bomb
                    return false;
                }
            } 
            
            //Load Bomb Function
            function loadBomb() {
                let bombCounter = bombAmount.value;
                while (bombCounter != 0) {
                    let randomValue = randomNumber();
                    let tile = document.getElementById("msTile-"+ randomValue);
                    if (tile.value !== "b"){
                        tile.value = "b";
                    }
                    console.log(randomValue); //test line [DELETE LATER]
                    bombCounter--;
                } 
            }
        
            //Random Number Generator
            function randomNumber() {
                let randomNum = Math.floor(Math.random() * boardSize);
                return randomNum;
            }

            //Generate Board Function
            //id needs to be assigned to buttons
            function generateBoard() {
                let idNum = 0; //ID number
                for (let i = 0; i < 10; i++) {
                    const msRow = document.createElement('div'); // Create a div to store buttons
                    board.appendChild(msRow); // Append the div to the board slot
                    for (let j = 0; j < 10; j++) {
                        const msButton = document.createElement('button'); // Create buttons k times'
                        msButton.id = "msTile-"+idNum;// assign unique ID
                        msButton.value = idNum;
                        // msButton.value = 'b'; //test line [DELETE LATER]
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
            function loadHorse(url) {
                var horse = new Image();
                horse.src = url;
                if (horse.width == 0) {
                    errorPage(1)
                }
            }