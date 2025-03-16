const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const gameOverElement = document.getElementById('gameOver');

// Game state
const player = {
    x: canvas.width / 2,
    y: canvas.height - 50,
    width: 50,
    height: 30,
    speed: 7,
    isMovingLeft: false,
    isMovingRight: false
};

let bullets = [];
let enemies = [];
let score = 0;
let gameActive = true;

// Enemy configuration
const enemyConfig = {
    rows: 3,
    columns: 8,
    width: 40,
    height: 30,
    padding: 20,
    speed: 2,
    dropSpeed: 10
};

// Initialize enemies
function initEnemies() {
    enemies = [];
    for(let row = 0; row < enemyConfig.rows; row++) {
        for(let col = 0; col < enemyConfig.columns; col++) {
            enemies.push({
                x: col * (enemyConfig.width + enemyConfig.padding) + 50,
                y: row * (enemyConfig.height + enemyConfig.padding) + 50,
                width: enemyConfig.width,
                height: enemyConfig.height,
                alive: true
            });
        }
    }
}

// Bullet class
class Bullet {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.speed = 10;
        this.width = 5;
        this.height = 15;
    }

    update() {
        this.y -= this.speed;
    }

    draw() {
        ctx.fillStyle = '#00ff9d';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

// Input handling
document.addEventListener('keydown', (e) => {
    if(e.key === 'ArrowLeft') player.isMovingLeft = true;
    if(e.key === 'ArrowRight') player.isMovingRight = true;
    if(e.key === ' ' && gameActive) {
        bullets.push(new Bullet(
            player.x + player.width/2 - 2.5,
            player.y
        ));
    }
});

document.addEventListener('keyup', (e) => {
    if(e.key === 'ArrowLeft') player.isMovingLeft = false;
    if(e.key === 'ArrowRight') player.isMovingRight = false;
});

function update() {
    if(!gameActive) return;

    // Player movement
    if(player.isMovingLeft) player.x = Math.max(0, player.x - player.speed);
    if(player.isMovingRight) player.x = Math.min(canvas.width - player.width, player.x + player.speed);

    // Update bullets
    bullets = bullets.filter(bullet => {
        bullet.update();
        return bullet.y > -bullet.height;
    });

    // Update enemies and check collisions
    enemies.forEach(enemy => {
        if(!enemy.alive) return;
        
        // Move enemies
        enemy.x += enemyConfig.speed;
        
        // Check wall collision
        if(enemy.x + enemy.width > canvas.width || enemy.x < 0) {
            enemyConfig.speed *= -1;
            enemy.y += enemyConfig.dropSpeed;
        }

        // Check bullet collision
        bullets.forEach(bullet => {
            if(checkCollision(bullet, enemy)) {
                enemy.alive = false;
                score += 100;
                scoreElement.textContent = score;
            }
        });

        // Check game over
        if(enemy.y + enemy.height > player.y) {
            gameActive = false;
            gameOverElement.style.display = 'block';
            createStars();
        }
    });
}

function checkCollision(a, b) {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
}

function draw() {
    // Clear canvas
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw player
    ctx.fillStyle = '#00ff9d';
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // Draw bullets
    bullets.forEach(bullet => bullet.draw());

    // Draw enemies
    enemies.forEach(enemy => {
        if(enemy.alive) {
            ctx.fillStyle = '#ff0000';
            ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
        }
    });
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Starfield animation
function createStars() {
    const starsContainer = document.createElement('div');
    starsContainer.className = 'stars';
    
    for(let i = 0; i < 100; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        star.style.setProperty('--duration', `${Math.random() * 3 + 1}s`);
        starsContainer.appendChild(star);
    }
    
    document.body.appendChild(starsContainer);
}

// Start game
initEnemies();
gameLoop();
