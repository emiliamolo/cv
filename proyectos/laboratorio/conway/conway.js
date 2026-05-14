
var canvas = document.getElementById("conway");
let context = canvas.getContext("2d");
let population = 0;
let generation = 0;
let currentGrid = Array.from({ length: 40 }, () => Array(40).fill(0)); // Current state
let nextGrid = Array.from({ length: 40 }, () => Array(40).fill(0)); // Next state
function drawBoard() {
    context.lineWidth = 1;
    context.strokeStyle = "rgb(0, 0, 0)";
    for (var x = 0; x < canvas.width; x += 10) {
      for (var y = 0; y < canvas.height; y += 10) {
        context.strokeRect(x, y, 10, 10);
      }
    }
  }
  drawBoard();

function paintCellWithPixel(x,y){
    const rect = canvas.getBoundingClientRect();
    x = Math.floor(x - rect.left);
    y = Math.floor(y - rect.top);

    const gridX = x-x%10;
    const gridY = y-y%10;
    
    const pixelData = currentGrid[gridX/10][gridY/10];
    if (pixelData == 1) {
        context.clearRect(gridX+1, gridY+1, 8, 8);
        population -= 1;
        currentGrid[gridX/10][gridY/10] = 0;
    } else {
        context.fillStyle = "rgb(0, 0, 0)";
        context.fillRect(gridX, gridY, 10, 10);
        population += 1;
        currentGrid[gridX/10][gridY/10] = 1;
    }
    document.getElementById("datos").innerHTML = "Población: " + population + " Generación: " + generation;
}

canvas.addEventListener("click", function(event){
    paintCellWithPixel(event.clientX, event.clientY);
});

document.getElementById("clear").addEventListener("click", function(){
    context.clearRect(0, 0, canvas.width, canvas.height);
    currentGrid = Array.from({ length: 40 }, () => Array(40).fill(0));
    drawBoard();
    population = 0;
    generation = 0;
    document.getElementById("datos").innerHTML = "Population: " + population + " Generation: " + generation;
});

let running = false;
let interval;
document.getElementById("stop").addEventListener("click", function(){
    running = false;
    clearInterval(interval);
});
function paintCell(i,j,color){
    if (color == 1){
        context.fillStyle = "rgb(0, 0, 0)";
        context.fillRect(i*10, j*10, 10, 10);
    } else {
        context.clearRect(i*10+1, j*10+1, 8, 8);
    }
}

document.getElementById("start").addEventListener("click", function(){
    if (running) return;
    running = true;
    interval = setInterval(function(){
        // check if running
        if (!running) {
            clearInterval(interval);
            return;
        }
        generation += 1;
        
        // update population, simulate game of life
        let neighbors;
        // calulate next state
        for(let i = 0; i < 40; i++){
            for(let j = 0; j < 40; j++){
                // calculate neighbors
                neighbors = 0;
                for(let x = -1; x < 2; x++){
                    for(let y = -1; y < 2; y++){
                        if (x == 0 && y == 0) continue;
                        if (i + x < 0 || i + x >= 40) continue;
                        if (j + y < 0 || j + y >= 40) continue;
                        neighbors += currentGrid[i+x][j+y];
                    }
                }
                if (currentGrid[i][j] == 1){
                    if (neighbors < 2 || neighbors > 3){
                        nextGrid[i][j] = 0;
                        paintCell(i, j, 0);
                        population -= 1;
                    } else { nextGrid[i][j] = 1;}
                } else {
                    if (neighbors == 3){
                        nextGrid[i][j] = 1;
                        paintCell(i, j, 1);
                        population += 1;
                    } else { nextGrid[i][j] = 0;}
                }
            }
        }
        [currentGrid, nextGrid] = [nextGrid, currentGrid];


        document.getElementById("datos").innerHTML = "Population: " + population + " Generation: " + generation;
    }, 500);
});

let hasScrolled = false;
let hasPlayed = false;
window.onscroll = function() {
    // Verifica si se ha hecho scroll
    if (!hasScrolled && window.scrollY > 100) {
        hasScrolled = true;
        window.scrollTo({
            top: window.innerHeight, // Scrolls down one full screen
            behavior: "smooth" // Smooth transition
        });
    }
    if (!hasPlayed && window.scrollY > 100+window.innerHeight) {
        hasPlayed = true;
        window.scrollTo({
            top: window.innerHeight*2, // Scrolls down one full screen
            behavior: "smooth" // Smooth transition
        });
    }
    if (window.scrollY < 100+window.innerHeight) {
        hasPlayed = false;
    }
    if (window.scrollY < 100) {
        hasScrolled = false;
    }
};

document.addEventListener("DOMContentLoaded", function() {
    window.scrollTo({
        top:0, // Scrolls down one full screen
        behavior: "smooth" // Smooth transition
    });
});