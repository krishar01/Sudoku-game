class SudokuGenerator {
            constructor() {
                this.board = Array(9).fill().map(() => Array(9).fill(0));
            }

            generateSolvedboard() {
                this.Solveboard();
                this.solution = this.board.map(row => [...row]);
                return this.board;
            }

            Solveboard() {
                const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
                this.shuffle(numbers);

                for (let row = 0; row < 9; row++) {
                    for (let col = 0; col < 9; col++) {
                        if (this.board[row][col] === 0) {
                            for (let num of numbers) {
                                if (this.isvalid(row, col, num)) {
                                    this.board[row][col] = num;
                                    if (this.Solveboard()) {
                                        return true;
                                    }
                                    this.board[row][col] = 0;
                                }
                            }
                            return false;
                        }
                    }
                }
                return true;
            }

            shuffle(array) {
                for (let i = array.length - 1; i > 0; i--) {
                    let random = Math.floor(Math.random() * (i + 1));
                    [array[random], array[i]] = [array[i], array[random]];
                }
                return array;
            }

            isvalid(row, col, num) {
                // Check column
                for (let i = 0; i < 9; i++) {
                    if (this.board[i][col] == num) return false;
                }
                // Check row
                for (let i = 0; i < 9; i++) {
                    if (this.board[row][i] == num) return false;
                }
                // Check 3x3 box
                let box_row = Math.floor(row / 3) * 3;
                let box_col = Math.floor(col / 3) * 3;
                for (let i = 0; i < 3; i++) {
                    for (let j = 0; j < 3; j++) {
                        if (this.board[box_row + i][box_col + j] == num) {
                            return false;
                        }
                    }
                }
                return true;
            }

            generatePuzzle(clues ) {
                this.generateSolvedboard();
                this.removenums(clues);
                return this.board;
            }

            removenums(clues) {
                let cellsToRemove = 81 - clues;
                const cells = [];

                for (let i = 0; i < 81; i++) {
                    cells.push(i);
                }

                this.shuffle(cells);

                for (const cell of cells) {
                    if (cellsToRemove <= 0) break;

                    const row = Math.floor(cell / 9);
                    const col = cell % 9;
                    const temp = this.board[row][col];
                    this.board[row][col] = 0;

                    const tempBoard = this.board.map(row => [...row]);
                    if (!this.hasUniqueSolution()) {
                        this.board[row][col] = temp;
                    } else {
                        cellsToRemove--;
                    }
                }
            }

            hasUniqueSolution() {
                const tempBoard = this.board.map(row => [...row]);
                let solutionCount = 0;

                const countSolutions = (board) => {
                    for (let row = 0; row < 9; row++) {
                        for (let col = 0; col < 9; col++) {
                            if (board[row][col] === 0) {
                                for (let num = 1; num <= 9; num++) {
                                    if (this.isValidForBoard(row, col, num, board)) {
                                        board[row][col] = num;
                                        countSolutions(board);
                                        board[row][col] = 0;
                                    }
                                }
                                return;
                            }
                        }
                    }
                    solutionCount++;
                };

                countSolutions(tempBoard);
                return solutionCount === 1;
            }

            isValidForBoard(row, col, num, board) {
                // Check column
                for (let i = 0; i < 9; i++) {
                    if (board[i][col] == num) return false;
                }
                // Check row
                for (let i = 0; i < 9; i++) {
                    if (board[row][i] == num) return false;
                }
                // Check 3x3 box
                let box_row = Math.floor(row / 3) * 3;
                let box_col = Math.floor(col / 3) * 3;
                for (let i = 0; i < 3; i++) {
                    for (let j = 0; j < 3; j++) {
                        if (board[box_row + i][box_col + j] == num) {
                            return false;
                        }
                    }
                }
                return true;
            }
        }

        let generator = new SudokuGenerator();
        let currentBoard = [];
        let initialBoard = [];
        let selectedCell = null;
        const select = document.getElementById('Difficulty');
        
        let errorcount = 0;
        const maxerrors = 3;
        let timerInterval;
        let time = 0;
        const maxhint=5;
        let hintTaken=0;
       

        
        function createBoard() {
            const gameboard = document.getElementById('gameboard');
            gameboard.innerHTML = '';

            for (let row = 0; row < 9; row++) {
                for (let col = 0; col < 9; col++) {
                    const tile = document.createElement('div');
                    tile.className = 'tiles';
                    
                    // Add right border for columns 2 and 5
                    if (col === 2 || col === 5) {
                        tile.classList.add('right_border');
                    }
                    
                    // Add bottom border for rows 2 and 5
                    if (row === 2 || row === 5) {
                        tile.classList.add('bottom_border');
                    }

                    tile.dataset.row = row;
                    tile.dataset.col = col;
                    
                    tile.addEventListener('click', () => selectCell(row, col));
                    
                    gameboard.appendChild(tile);
                }
            }
        }

        function updateBoard() {
            const tiles = document.querySelectorAll('.tiles');
            tiles.forEach((tile, index) => {
                const row = Math.floor(index / 9);
                const col = index % 9;
                const value = currentBoard[row][col];
                
                tile.textContent = value === 0 ? '' : value;
                
                // Style clues vs user input
                if (initialBoard[row][col] !== 0) {
                    tile.classList.add('clue');
                    tile.classList.remove('user-input');
                } else {
                    tile.classList.remove('clue');
                    if (value !== 0) {
                        tile.classList.add('user-input');
                    } else {
                        tile.classList.remove('user-input');
                    }
                }
            });
        }

        function selectCell(row, col) {
            // Remove previous selection
            document.querySelectorAll('.tiles').forEach(tile => {
                tile.classList.remove('selected');
            });
            
            // Add selection to clicked cell
            const index = row * 9 + col;
            const tiles = document.querySelectorAll('.tiles');
            tiles[index].classList.add('selected');
            
            selectedCell = { row, col };
        }

        function newGame() {
            hintTaken=0;
            const clues = Number(select.value);
            generator = new SudokuGenerator();
            currentBoard = generator.generatePuzzle(clues);
            initialBoard = currentBoard.map(row => [...row]);
            updateBoard();
            selectedCell = null;
            startTimer();
            
        }

        function clearBoard() {
            for (let row = 0; row < 9; row++) {
                for (let col = 0; col < 9; col++) {
                    if (initialBoard[row][col] === 0) {
                        currentBoard[row][col] = 0;
                    }
                }
            }
            updateBoard();
        }

        // Handle number input
        document.addEventListener('keydown', (e) => {
            if (selectedCell && e.key >= '1' && e.key <= '9') {
                const { row, col } = selectedCell;
                if (initialBoard[row][col] === 0) { // Only allow editing empty cells
                    const userValue = parseInt(e.key);
                    const correctValue = generator.solution[row][col];

                    if(userValue !== correctValue){
                        errorcount++;
                        alert(`wrong! Errors: ${errorcount}/${maxerrors}`);
                        if(errorcount>=maxerrors){
                            alert("❌ Game Over! you've made 3 mistakes.");
                            disableBoard();
                        }
                    }else{
                        currentBoard[row][col] = userValue;
                        updateBoard();
                        if (checkWin()) {
                            stopTimer();
                            alert(`🎉 congratulations! you solved the puzzle in 
                                ${document.getElementById('timer').textContent.split(' ')[1]}`);
                            createBoard();
                            newGame(); 
                        }
                    }
                }
            } else if (selectedCell && (e.key === 'Delete' || e.key === 'Backspace')) {
                const { row, col } = selectedCell;
                if (initialBoard[row][col] === 0) {
                    currentBoard[row][col] = 0;
                    updateBoard();
                }
            }
        });
        function disableBoard(){
            const tiles = document.querySelectorAll('.tiles');
            tiles.forEach(tile=>{
                tile.classList.add('disable');
            });
            createBoard();
            newGame();
            errorcount=0;
        }
       

        function startTimer() {
            clearInterval(timerInterval);
            time = 0;
            timerInterval = setInterval(() => {
                time++;
                const minutes = String(Math.floor(time / 60)).padStart(2, '0');
                const seconds = String(time % 60).padStart(2, '0');
                document.getElementById('timer').textContent = `Time: ${minutes}:${seconds}`;
            }, 1000);
        }

        function stopTimer() {
            clearInterval(timerInterval);
        }
        function giveHint() {
            hintTaken++;
            if (hintTaken<=maxhint) {
                if (!selectedCell) {
                alert("Please select a cell first!");
                return;
            }

            const { row, col } = selectedCell;

            if (initialBoard[row][col] !== 0) {
                alert("This is a clue cell. You can't change it.");
                return;
            }

            const correctValue = generator.solution[row][col];
            currentBoard[row][col] = correctValue;
            updateBoard();

            if (checkWin()) {
                stopTimer();
                alert(`🎉 You completed the puzzle with help in 
                    ${document.getElementById('timer').textContent.split(" ")[1]}`);
            }
            
        }
        else{
                alert(`you have reached maximum limit ${maxhint} of hints.`)
            }
        
            
            
        }
        function checkWin() {
            for (let row = 0; row < 9; row++) {
                for (let col = 0; col < 9; col++) {
                    if (currentBoard[row][col] !== generator.solution[row][col]) {
                        return false;
                    }
                }
            }
            
            newGame(); 
            
            return true;
            }
        const toggleBtn = document.getElementById("toggle-dark");

        
        if (localStorage.getItem("dark-mode") === "true") {
            document.body.classList.add("dark");
            toggleBtn.textContent = "🌞";
        } else {
            toggleBtn.textContent = "🌙";
        }

        toggleBtn.addEventListener("click", () => {
            document.body.classList.toggle("dark");
            const isDark = document.body.classList.contains("dark");
            localStorage.setItem("dark-mode", isDark);
            toggleBtn.textContent = isDark ? "🌞" : "🌙";
        });




        
        select.addEventListener('change',()=>{
            newGame();
        })
        // Initialize the game
        createBoard();
        newGame();