

function checkTouching(bird, pipe){
    let bird_props = bird.getBoundingClientRect();
    let pipe_props = pipe.getBoundingClientRect();
    return !(
        bird_props.right < pipe_props.left || 
        bird_props.left > pipe_props.right || 
        bird_props.bottom < pipe_props.top || 
        bird_props.top > pipe_props.bottom
    );
}

function youLost(){
    let bird = document.querySelector('.bird');
    bird.style.display = 'none';
    let message = document.querySelector('.message');
    message.style.display = 'block';
    document.querySelector('.start').innerText = 'Try again';
}

function start(){
    let bird = document.querySelector('.bird');
    bird.style.display = 'block';
    
    document.querySelector('.message').style.display = 'none';

    document.querySelector('.start').innerText = 'Start';
    // arracar el juego
    document.addEventListener('click', animate);
}

function animate() {
    // background movement
    animateBackground();

    // bird movement
    // for every pipe, TODO: check if the bird is touching the pipe
    pipes = document.querySelectorAll('.pipe');
    pipes.forEach(pipe => {
        if(checkTouching(bird, pipe)){
            youLost();
            return;
        }
    });
    drawBird();
    
    requestAnimationFrame(animate);
}


// cargar contenido cuando se carga la pagina
window.addEventListener("DOMContentLoaded", start);