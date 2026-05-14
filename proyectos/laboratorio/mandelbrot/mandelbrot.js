// Get the canvas and its context
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const offscreenCanvas = document.createElement('canvas');
const offCtx = offscreenCanvas.getContext('2d');
// Function to resize canvas to fit the window
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    render({x: canvas.width, y: canvas.height}, {x:0.29, y:0.73});
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas(); // Initial resize to fit the window

// compute Zn² + C
function computeNext(current, constant) {
    // z^n
    const zr = current.x * current.x - current.y * current.y;
    const zi = 2 * current.x * current.y;
    return {
        x: zr + constant.x,
        y: zi + constant.y
    };
}
// return mod squared
function modSquared(z) {
    return z.x * z.x + z.y * z.y;
}

// compute iterations until mod exeeds 2 or max iterations is reached
function computeIterationsSmooth(z0, c, maxIterations) {
    let n = 0;
    while (modSquared(z0) <= 4 && n < maxIterations) {
        z0 = computeNext(z0, c);
        n++;
    }
    const mod = Math.sqrt(modSquared(z0));
    const smoothIterations = n - Math.log2(Math.max(1, Math.log2(mod)));
    return smoothIterations;
}

function getColor(iterations, maxIterations, time) {
    if (iterations === maxIterations) {
        return { r: 0, g: 27, b: 72 }; // dark blue
    }
    let t = iterations / maxIterations; // Smooth transition
    
    // Color stops for deep space effect
    let r = Math.floor(t*10); // Dark purples/blues
    let g = Math.floor(20+t*100); // Dimming greens
    let b = Math.floor(70+t*200); // Bright blues/cyans

    return { r, g, b };
}

function render(constant) {
    const calcWidth = 600; 
    const calcHeight = Math.floor(calcWidth * (canvas.height / canvas.width));
    
    const xmin = -1.6, xmax = 1.6;
    const ymin = -1.1, ymax = 1.1;

    offscreenCanvas.width = calcWidth;
    offscreenCanvas.height = calcHeight;

    const imageData = offCtx.createImageData(calcWidth, calcHeight);
    const data = imageData.data;

    for (let y = 0; y < calcHeight; y++) {
        for (let x = 0; x < calcWidth; x++) {
            let z0 = {
                x: xmin + (x * (xmax - xmin) / calcWidth),
                y: ymax - (y * (ymax - ymin) / calcHeight)
            };
            
            let iterations = computeIterationsSmooth(z0, constant, 100); 
            let color = getColor(iterations, 100);

            let index = (y * calcWidth + x) * 4;
            data[index] = color.r;
            data[index + 1] = color.g;
            data[index + 2] = color.b;
            data[index + 3] = 255;
        }
    }

    offCtx.putImageData(imageData, 0, 0);
    
    ctx.imageSmoothingEnabled = true; 
    ctx.drawImage(offscreenCanvas, 0, 0, canvas.width, canvas.height);
}

let c = { x: -0.26, y: 0.26 }; // Initial constant
let time = 0.0;

function animate() {
    let targetx = 0.7885 * Math.cos(time); // Oscillate `c.x`
    let targety = 0.7885 * Math.sin(time); // Oscillate `c.y`
    c.x += (targetx - c.x) * 0.1; // Smooth transition
    c.y += (targety - c.y) * 0.1; // Smooth transition
    render(c);
    time += 0.005;
    
    requestAnimationFrame(animate);
}

// Start the animation
animate();
