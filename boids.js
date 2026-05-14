// Get the canvas and its context
let canvas = document.getElementById('indexcanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

class Boid {
    constructor() {
        this.position = { x: Math.random() * canvas.width, y: Math.random() * canvas.height };
        this.velocity = { x: Math.random() * 2 - 1, y: Math.random() * 2 - 1 };
        this.size = Math.random() * 5 + 8;
        this.color = this.chooseColor()
    }
    chooseColor() {
        let colors = ['#A5B9C3', '#728BA2', '#195A84', '#0B396A'];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    distance(other) {
        return Math.sqrt((this.position.x - other.position.x) ** 2 +
            (this.position.y - other.position.y) ** 2);
    }

    update(boids) {
        // comportamientos
        let align = this.align(boids);
        let cohesion = this.cohesion(boids);
        let separation = this.separate(boids);

        this.velocity.x += align.x * 0.01 + cohesion.x * 0.1 + separation.x * 0.6;
        this.velocity.y += align.y * 0.01 + cohesion.y * 0.1 + separation.y * 0.6;


        //limit speed
        let speed = Math.sqrt(this.velocity.x ** 2 + this.velocity.y ** 2);
        if (speed > 3) {
            this.velocity.x = (this.velocity.x / speed) * 3;
            this.velocity.y = (this.velocity.y / speed) * 3;
        }


        // pequeña variacion random
        this.velocity.x += (Math.random() - 0.5) * 0.1;
        this.velocity.y += (Math.random() - 0.5) * 0.1;

        // update
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;

        if (this.position.x > canvas.width) this.position.x = 0;
        if (this.position.x < 0) this.position.x = canvas.width;
        if (this.position.y > canvas.height) this.position.y = 0;
        if (this.position.y < 0) this.position.y = canvas.height;
    }

    cohesion(boids) {
        let pcj = { x: 0, y: 0 };
        let count = 0;
        for (let boid of boids) {
            if (boid != this && this.distance(boid) < this.size * 3) {
                pcj.x += boid.position.x;
                pcj.y += boid.position.y;
                count += 1;
            }
        }
        if (count === 0) return { x: 0, y: 0 };
        pcj.x /= count;
        pcj.y /= count;
        return { x: (pcj.x - this.position.x) * 0.01, y: (pcj.y - this.position.y) * 0.01 };
    }

    separate(boids) {
        let c = { x: 0, y: 0 };
        for (let other of boids) {
            if (other != this) {
                let distance = this.distance(other);
                if (distance < this.size * 2) {
                    c.x += this.position.x - other.position.x;
                    c.y += this.position.y - other.position.y;
                }
            }
        }
        return c;
    }

    align(boids) {
        let pvj = { x: 0, y: 0 };
        let count = 0;
        for (let boid of boids) {
            if (boid != this && this.distance(boid) < this.size) {
                pvj.x += boid.velocity.x;
                pvj.y += boid.velocity.y;
                count += 1;
            }
        }
        if (count === 0) return { x: 0, y: 0 };  // No nearby boids, no alignment force
        pvj.x /= count;
        pvj.y /= count;
        return { x: (pvj.x - this.velocity.x) * 0.125, y: (pvj.y - this.velocity.y) * 0.125 };
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Function to resize canvas to fit the window
const numBoids = Math.floor((canvas.width * canvas.height) / 20000);
const boids = [];
for (let i = 0; i < numBoids; i++) {
    boids.push(new Boid);
}

let mouse = { x: -1000, y: -1000 }; // Empezamos fuera de pantalla

document.body.addEventListener("mousemove", (event) => {
    mouse.x = event.pageX;
    mouse.y = event.pageY;
});
function applyMouseRepulsion(boid) {
    const dx = boid.position.x - mouse.x;
    const dy = boid.position.y - mouse.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const radius = 150; // Radio de influencia

    if (distance < radius) {
        // Calculamos la intensidad de la fuerza (más fuerte cuanto más cerca)
        let strength = Math.pow(1 - distance / radius, 2); 
        
        // 2. Multiplicador de fuerza alto (sube este 5 si quieres más potencia)
        const power = 8; 

        // 3. Aplicamos el empujón
        boid.velocity.x += (dx / distance) * strength * power;
        boid.velocity.y += (dy / distance) * strength * power;
    }
}
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.scrollY + window.innerHeight;
}
window.addEventListener('scroll', resizeCanvas);
window.addEventListener('resize', resizeCanvas);
// Function to animate boids
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let boid of boids) {
        // 1. Reaccionar al mouse (esto cambia la velocidad suavemente)
        applyMouseRepulsion(boid);

        // 2. Aplicar reglas de Boids (alineación, cohesión, separación)
        boid.update(boids);

        // 3. Dibujar
        boid.draw();
    }

    requestAnimationFrame(animate);
}

animate();

let hasScrolled = false;
window.onscroll = function () {
    // Verifica si se ha hecho scroll
    if (!hasScrolled && window.scrollY > 100) {
        hasScrolled = true;
        window.scrollTo({
            top: window.innerHeight, // Scrolls down one full screen
            behavior: "smooth" // Smooth transition
        });
    }
    if (window.scrollY < 100) {
        hasScrolled = false;
    }
};

