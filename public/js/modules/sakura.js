const canvas = document.getElementById('sakura-canvas');
const ctx = canvas.getContext('2d');

let width, height, petals = [];
const petalCount = 100; 

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}

window.addEventListener('resize', resize);
resize();

class Petal {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height - height; 
        this.size = Math.random() * 7 + 8;
        this.speed = Math.random() * 0.6 ; 
        this.angle = Math.random() * 360;
        this.spin = Math.random() * 2 - 1; 
        this.wind = Math.random() * 1.5 - 0.5; 
        this.swing = Math.random() * 2; 
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle * Math.PI / 180);
        
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(this.size, this.size / 2, this.size, this.size * 1.5, 0, this.size * 2);
        ctx.bezierCurveTo(-this.size, this.size * 1.5, -this.size, this.size / 2, 0, 0);
        
        ctx.fillStyle = '#ffb7c5';
        ctx.fill();
        ctx.restore();
    }

    update() {
        this.y += this.speed;
        this.x += this.wind + Math.sin(this.y / 50) * this.swing; 
        this.angle += this.spin;

        if (this.y > height + 20) {
            this.reset();
            this.y = -20;
        }
    }
}

function init() {
    for (let i = 0; i < petalCount; i++) {
        petals.push(new Petal());
    }
}

function render() {
    ctx.clearRect(0, 0, width, height);
    petals.forEach(petal => {
        petal.update();
        petal.draw();
    });
    requestAnimationFrame(render);
}

init();
render();