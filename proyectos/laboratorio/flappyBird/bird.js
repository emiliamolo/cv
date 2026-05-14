// Game constants
const GRAVITY = 0.5;
const JUMP_FORCE = -8.5;
const BIRD_WIDTH = 40;
const BIRD_HEIGHT = 30;
const PIPE_WIDTH = 60;
const PIPE_GAP = 200;
const PIPE_SPEED = 3;
const PIPE_SPAWN_RATE = 1500; // ms

// Game elements
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const currentScoreElement = document.getElementById('current-score');
const highScoreElement = document.getElementById('high-score');
const finalScoreElement = document.getElementById('final-score');
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const startButton = document.getElementById('start-button');
const restartButton = document.getElementById('restart-button');
const pauseButton = document.getElementById('pause-button');
const resetButton = document.getElementById('reset-button');

// Game state
let bird = {
    y: 0,
    velocity: 0,
    width: BIRD_WIDTH,
    height: BIRD_HEIGHT
};
let pipes = [];
let score = 0;
let highScore = 0;
let gameStarted = false;
let gameOver = false;
let isPaused = false;
let animationFrame;
let lastPipeTime = 0;
let lastTime = 0;

// Initialize the game
function init() {
    // Set canvas size
    resizeCanvas();
    
    // Load high score from localStorage
    const savedHighScore = localStorage.getItem('flappyHighScore');
    if (savedHighScore) {
        highScore = parseInt(savedHighScore);
        highScoreElement.textContent = highScore;
    }
    
    // Reset bird position
    resetBirdPosition();
    
    // Initial render
    renderGame();
    
    // Event listeners
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('keydown', handleKeyDown);
    canvas.addEventListener('touchstart', handleTap);
    canvas.addEventListener('mousedown', handleTap);
    
    startButton.addEventListener('click', startGame);
    restartButton.addEventListener('click', resetGame);
    pauseButton.addEventListener('click', togglePause);
    resetButton.addEventListener('click', resetGame);
}

// Resize canvas to fit container
function resizeCanvas() {
    const container = canvas.parentElement;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    
    if (!gameStarted) {
        resetBirdPosition();
    }
    
    renderGame();
}

// Reset bird position to center
function resetBirdPosition() {
    bird.y = canvas.height / 2 - BIRD_HEIGHT / 2;
    bird.velocity = 0;
}

// Handle keyboard input
function handleKeyDown(e) {
    if (e.code === 'Space' || e.key === ' ') {
        if (gameOver) {
            resetGame();
        } else if (!gameStarted) {
            startGame();
        } else if (!isPaused) {
            jump();
        }
    }
}

// Handle touch/click input
function handleTap() {
    if (gameOver) {
        resetGame();
    } else if (!gameStarted) {
        startGame();
    } else if (!isPaused) {
        jump();
    }
}

// Start the game
function startGame() {
    gameStarted = true;
    gameOver = false;
    isPaused = false;
    score = 0;
    pipes = [];
    lastPipeTime = 0;
    
    currentScoreElement.textContent = score;
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    pauseButton.classList.remove('hidden');
    
    resetBirdPosition();
    gameLoop(performance.now());
}

// Reset the game
function resetGame() {
    cancelAnimationFrame(animationFrame);
    gameStarted = false;
    gameOver = false;
    isPaused = false;
    score = 0;
    pipes = [];
    
    currentScoreElement.textContent = score;
    startScreen.classList.remove('hidden');
    gameOverScreen.classList.add('hidden');
    pauseButton.classList.add('hidden');
    pauseButton.textContent = 'Pause';
    
    resetBirdPosition();
    renderGame();
}

// Toggle pause state
function togglePause() {
    isPaused = !isPaused;
    pauseButton.textContent = isPaused ? 'Resume' : 'Pause';
    
    if (!isPaused) {
        lastTime = performance.now();
        gameLoop(lastTime);
    }
}

// Make the bird jump
function jump() {
    bird.velocity = JUMP_FORCE;
}

// Main game loop
function gameLoop(timestamp) {
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;
    
    if (!isPaused && gameStarted && !gameOver) {
        // Update game state
        updateBird();
        updatePipes(deltaTime);
        checkCollisions();
    }
    
    // Render game
    renderGame();
    
    if (!gameOver && gameStarted) {
        animationFrame = requestAnimationFrame(gameLoop);
    }
}

// Update bird position
function updateBird() {
    bird.velocity += GRAVITY;
    bird.y += bird.velocity;
}

// Update pipes
function updatePipes(deltaTime) {
    // Move existing pipes
    pipes.forEach(pipe => {
        pipe.x -= PIPE_SPEED;
        
        // Check if pipe is passed
        if (!pipe.passed && pipe.x + pipe.width < canvas.width / 2 - BIRD_WIDTH / 2) {
            pipe.passed = true;
            score += 1;
            currentScoreElement.textContent = score;
            
            // Show milestone alerts
            if (score === 10 || score === 25 || score === 50) {
                showAlert(`${score} points! Keep going!`);
            }
        }
    });
    
    // Remove pipes that are off screen
    pipes = pipes.filter(pipe => pipe.x + pipe.width > 0);
    
    // Add new pipes
    lastPipeTime += deltaTime;
    if (lastPipeTime > PIPE_SPAWN_RATE) {
        const minHeight = 50;
        const maxHeight = canvas.height - PIPE_GAP - minHeight;
        const topHeight = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;
        
        pipes.push({
            x: canvas.width,
            topHeight,
            bottomY: topHeight + PIPE_GAP,
            width: PIPE_WIDTH,
            passed: false
        });
        
        lastPipeTime = 0;
    }
}

// Check for collisions
function checkCollisions() {
    // Check if bird hits the ground or ceiling
    if (bird.y + bird.height > canvas.height || bird.y < 0) {
        endGame();
        return;
    }
    
    // Check if bird hits a pipe
    for (const pipe of pipes) {
        if (
            // Top pipe collision
            (bird.y < pipe.topHeight &&
            bird.y + bird.height > 0 &&
            canvas.width / 2 - bird.width / 2 < pipe.x + pipe.width &&
            canvas.width / 2 + bird.width / 2 > pipe.x)
            ||
            // Bottom pipe collision
            (bird.y + bird.height > pipe.bottomY &&
            bird.y < canvas.height &&
            canvas.width / 2 - bird.width / 2 < pipe.x + pipe.width &&
            canvas.width / 2 + bird.width / 2 > pipe.x)
        ) {
            endGame();
            return;
        }
    }
}

// End the game
function endGame() {
    gameOver = true;
    pauseButton.classList.add('hidden');
    
    // Update high score
    if (score > highScore) {
        highScore = score;
        highScoreElement.textContent = highScore;
        localStorage.setItem('flappyHighScore', highScore.toString());
    }
    
    finalScoreElement.textContent = score;
    gameOverScreen.classList.remove('hidden');
}

// Show alert message
function showAlert(message) {
    const alertElement = document.createElement('div');
    alertElement.className = 'game-alert';
    alertElement.textContent = message;
    alertElement.style.position = 'absolute';
    alertElement.style.top = '20%';
    alertElement.style.left = '50%';
    alertElement.style.transform = 'translate(-50%, -50%)';
    alertElement.style.backgroundColor = 'rgba(255, 235, 59, 0.9)';
    alertElement.style.color = '#333';
    alertElement.style.padding = '10px 20px';
    alertElement.style.borderRadius = '20px';
    alertElement.style.fontWeight = 'bold';
    alertElement.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';
    alertElement.style.zIndex = '100';
    
    document.querySelector('.game-area').appendChild(alertElement);
    
    setTimeout(() => {
        alertElement.style.opacity = '0';
        alertElement.style.transition = 'opacity 0.5s ease';
        setTimeout(() => alertElement.remove(), 500);
    }, 2000);
}

// Render the game
function renderGame() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background
    drawBackground();
    
    // Draw pipes
    drawPipes();
    
    // Draw bird
    drawBird();
    
    // Draw score
    if (gameStarted && !gameOver) {
        drawScore();
    }
}

// Draw background
function drawBackground() {
    // Sky gradient
    const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    skyGradient.addColorStop(0, '#64b5f6');
    skyGradient.addColorStop(1, '#bbdefb');
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    
    // Cloud 1
    ctx.beginPath();
    ctx.arc(canvas.width * 0.2, canvas.height * 0.2, 30, 0, Math.PI * 2);
    ctx.arc(canvas.width * 0.2 + 25, canvas.height * 0.2 - 10, 25, 0, Math.PI * 2);
    ctx.arc(canvas.width * 0.2 + 45, canvas.height * 0.2, 20, 0, Math.PI * 2);
    ctx.fill();
    
    // Cloud 2
    ctx.beginPath();
    ctx.arc(canvas.width * 0.7, canvas.height * 0.3, 20, 0, Math.PI * 2);
    ctx.arc(canvas.width * 0.7 + 15, canvas.height * 0.3 - 5, 15, 0, Math.PI * 2);
    ctx.arc(canvas.width * 0.7 + 30, canvas.height * 0.3, 18, 0, Math.PI * 2);
    ctx.fill();
    
    // Ground
    const groundHeight = canvas.height * 0.1;
    ctx.fillStyle = '#8d6e63';
    ctx.fillRect(0, canvas.height - groundHeight, canvas.width, groundHeight);
    
    // Grass
    ctx.fillStyle = '#81c784';
    ctx.fillRect(0, canvas.height - groundHeight, canvas.width, 10);
}

// Draw pipes
function drawPipes() {
    ctx.fillStyle = '#4caf50';
    
    for (const pipe of pipes) {
        // Top pipe
        ctx.fillRect(pipe.x, 0, pipe.width, pipe.topHeight);
        
        // Pipe cap
        ctx.fillStyle = '#388e3c';
        ctx.fillRect(pipe.x - 5, pipe.topHeight - 15, pipe.width + 10, 15);
        ctx.fillStyle = '#4caf50';
        
        // Bottom pipe
        ctx.fillRect(pipe.x, pipe.bottomY, pipe.width, canvas.height - pipe.bottomY);
        
        // Pipe cap
        ctx.fillStyle = '#388e3c';
        ctx.fillRect(pipe.x - 5, pipe.bottomY, pipe.width + 10, 15);
        ctx.fillStyle = '#4caf50';
    }
}

// Draw bird
function drawBird() {
    const birdX = canvas.width / 2 - bird.width / 2;
    
    // Calculate rotation based on velocity
    const rotation = Math.min(Math.max(bird.velocity * 0.1, -0.5), 0.5);
    
    ctx.save();
    ctx.translate(birdX + bird.width / 2, bird.y + bird.height / 2);
    ctx.rotate(rotation);
    
    // Bird body
    ctx.fillStyle = '#ffeb3b';
    ctx.beginPath();
    ctx.ellipse(0, 0, bird.width / 2, bird.height / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Wing
    ctx.fillStyle = '#fdd835';
    ctx.beginPath();
    ctx.ellipse(-5, 5, 12, 8, Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();
    
    // Eye
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(bird.width / 4, -bird.height / 6, 5, 0, Math.PI * 2);
    ctx.fill();
    
    // Pupil
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(bird.width / 4 + 1, -bird.height / 6, 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Beak
    ctx.fillStyle = '#ff9800';
    ctx.beginPath();
    ctx.moveTo(bird.width / 2, 0);
    ctx.lineTo(bird.width / 2 + 10, -5);
    ctx.lineTo(bird.width / 2 + 10, 5);
    ctx.closePath();
    ctx.fill();
    
    ctx.restore();
}

// Draw score
function drawScore() {
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 3;
    ctx.font = 'bold 40px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    
    const scoreText = score.toString();
    ctx.strokeText(scoreText, canvas.width / 2, 20);
    ctx.fillText(scoreText, canvas.width / 2, 20);
}

// Initialize the game when the page loads
window.addEventListener('load', init);