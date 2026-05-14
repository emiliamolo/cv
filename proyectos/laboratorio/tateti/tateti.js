const X = "X";
const O = "O";
const EMPTY = null;

// Estado inicial: Matriz 3x3
function initialState() {
    return [
        [EMPTY, EMPTY, EMPTY],
        [EMPTY, EMPTY, EMPTY],
        [EMPTY, EMPTY, EMPTY]
    ];
}

// Determina de quién es el turno
function player(board) {
    let xs = 0;
    let os = 0;
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (board[i][j] === X) xs++;
            else if (board[i][j] === O) os++;
        }
    }
    return (xs === os) ? X : O;
}

// Acciones posibles (celdas vacías)
function actions(board) {
    let possibleActions = [];
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (board[i][j] === EMPTY) {
                possibleActions.push([i, j]);
            }
        }
    }
    return possibleActions;
}

// Retorna un nuevo tablero tras una jugada (Inmutabilidad)
function result(board, action) {
    let newBoard = board.map(row => [...row]); // Copia profunda
    newBoard[action[0]][action[1]] = player(board);
    return newBoard;
}

// Determina el ganador
function winner(board) {
    // Filas y Columnas
    for (let i = 0; i < 3; i++) {
        if (board[i][0] && board[i][0] === board[i][1] && board[i][0] === board[i][2]) return board[i][0];
        if (board[0][i] && board[0][i] === board[1][i] && board[0][i] === board[2][i]) return board[0][i];
    }
    // Diagonales
    if (board[1][1] && board[1][1] === board[0][0] && board[1][1] === board[2][2]) return board[1][1];
    if (board[1][1] && board[1][1] === board[0][2] && board[1][1] === board[2][0]) return board[1][1];
    
    return null;
}

function terminal(board) {
    if (winner(board)) return true;
    return board.every(row => row.every(cell => cell !== EMPTY));
}

function utility(board) {
    let res = winner(board);
    if (res === X) return 1;
    if (res === O) return -1;
    return 0;
}

// --- ALGORITMO MINIMAX ---

function minValue(board) {
    if (terminal(board)) return utility(board);
    let v = Infinity;
    for (let action of actions(board)) {
        v = Math.min(v, maxValue(result(board, action)));
    }
    return v;
}

function maxValue(board) {
    if (terminal(board)) return utility(board);
    let v = -Infinity;
    for (let action of actions(board)) {
        v = Math.max(v, minValue(result(board, action)));
    }
    return v;
}

function minimax(board) {
    if (terminal(board)) return null;

    let current = player(board);
    let bestAction = null;

    if (current === X) {
        let maxVal = -Infinity;
        for (let action of actions(board)) {
            let val = minValue(result(board, action));
            if (val > maxVal) {
                maxVal = val;
                bestAction = action;
            }
        }
    } else {
        let minVal = Infinity;
        for (let action of actions(board)) {
            let val = maxValue(result(board, action));
            if (val < minVal) {
                minVal = val;
                bestAction = action;
            }
        }
    }
    return bestAction;
}

// Referencias al DOM
const cells = document.querySelectorAll('.cell');
const statusDisplay = document.getElementById('game-status');
const playerTurnDisplay = document.getElementById('player-turn');
const resetButton = document.getElementById('reset-ttt');

let currentBoard = initialState(); // Usamos la función de tu Minimax

// Inicializar el juego
function init() {
    cells.forEach(cell => {
        cell.addEventListener('click', handleCellClick);
    });
    resetButton.addEventListener('click', resetGame);
    updateUI();
}
let isAiThinking = false;
function handleCellClick(e) {
    const index = e.target.dataset.index;
    const row = Math.floor(index / 3);
    const col = index % 3;

    // Bloqueos: si la IA está pensando, si la celda está ocupada o si terminó el juego
    if (isAiThinking || currentBoard[row][col] !== EMPTY || terminal(currentBoard)) return;

    // 1. MOVIMIENTO DEL HUMANO (X)
    currentBoard = result(currentBoard, [row, col]);
    updateUI();

    // 2. VERIFICAR SI DEBE JUGAR LA IA
    if (!terminal(currentBoard)) {
        isAiThinking = true; // Bloqueamos clics del usuario
        
        // Pequeño delay para que no sea instantáneo y parezca que "piensa"
        setTimeout(() => {
            const aiMove = minimax(currentBoard);
            
            if (aiMove) {
                currentBoard = result(currentBoard, aiMove);
            }
            
            isAiThinking = false; // Liberamos el bloqueo
            updateUI();
        }, 600);
    }
}

function updateUI() {
    // Sincronizar matriz con botones
    cells.forEach(cell => {
        const index = cell.dataset.index;
        const row = Math.floor(index / 3);
        const col = index % 3;
        const val = currentBoard[row][col];

        cell.classList.remove('x', 'o', 'disabled');
        if (val === X) {
            cell.classList.add('x', 'disabled');
        } else if (val === O) {
            cell.classList.add('o', 'disabled');
        }
    });

    // Actualizar estados y textos
    if (terminal(currentBoard)) {
        const res = winner(currentBoard);
        if (res === X) {
            statusDisplay.innerText = "¡Ganaste! (Imposible)";
        } else if (res === O) {
            statusDisplay.innerText = "La IA ha ganado.";
        } else {
            statusDisplay.innerText = "Empate técnico.";
        }
        playerTurnDisplay.innerText = "FIN";
    } else {
        const turn = player(currentBoard);
        statusDisplay.innerText = "En curso...";
        playerTurnDisplay.innerText = (turn === X) ? "USUARIO (X)" : "IA (O)";
    }
}

function resetGame() {
    currentBoard = initialState();
    updateUI();
}

// Arrancar
init();