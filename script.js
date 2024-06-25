window.onload = function() {
    setTimeout(() => {
        document.getElementById('loading').style.display = 'none';
        document.getElementById('game-container').style.display = 'flex';
        startGame();
    }, 1000);
};

document.getElementById('restartButton').onclick = function() {
    cancelAnimationFrame(animationId); 
    resetGame();
};

function startGame() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const gridSize = 20;
    const gridCount = canvas.width / gridSize;
    let score = localStorage.getItem('score') ? parseInt(localStorage.getItem('score')) : 0;
    let animationId;

    let snake = [
        { x: 10, y: 10 }
    ];
    let direction = { x: 0, y: 0 };
    let apple = {
        x: Math.floor(Math.random() * gridCount),
        y: Math.floor(Math.random() * gridCount)
    };

    let isMouseDown = false;
    let movementTimer = 0;
    let canChangeDirection = true;

    canvas.addEventListener('mousedown', () => { isMouseDown = true; }, false);
    canvas.addEventListener('mouseup', () => { isMouseDown = false; }, false);
    canvas.addEventListener('mousemove', moveSnake, false);
    canvas.addEventListener('touchstart', () => { isMouseDown = true; }, false);
    canvas.addEventListener('touchend', () => { isMouseDown = false; }, false);
    canvas.addEventListener('touchmove', moveSnake, false);

    function moveSnake(event) {
        if (!isMouseDown || !canChangeDirection) return;

        const rect = canvas.getBoundingClientRect();
        const touch = event.touches ? event.touches[0] : event;
        const mouseX = touch.clientX - rect.left;
        const mouseY = touch.clientY - rect.top;

        const head = snake[0];
        const dx = mouseX - (head.x * gridSize + gridSize / 2);
        const dy = mouseY - (head.y * gridSize + gridSize / 2);

        if (Math.abs(dx) > gridSize / 2 || Math.abs(dy) > gridSize / 2) {
            if (Math.abs(dx) > Math.abs(dy)) {
                direction = dx > 0 ? { x: 1, y: 0 } : { x: -1, y: 0 };
            } else {
                direction = dy > 0 ? { x: 0, y: 1 } : { x: 0, y: -1 };
            }
            canChangeDirection = false;
        }
    }

    function gameLoop() {
        update();
        draw();
        animationId = requestAnimationFrame(gameLoop);
    }

    function update() {
        movementTimer++;

        if (movementTimer >= 10) { 
            const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

            if (head.x < 0) {
                head.x = 0;
                direction.x = 1;
            }
            if (head.x >= gridCount) {
                head.x = gridCount - 1;
                direction.x = -1;
            }
            if (head.y < 0) {
                head.y = 0;
                direction.y = 1;
            }
            if (head.y >= gridCount) {
                head.y = gridCount - 1;
                direction.y = -1;
            }

            if (snake.slice(1).some(s => s.x === head.x && s.y === head.y)) {
                cancelAnimationFrame(animationId);
            } else {
                if (head.x === apple.x && head.y === apple.y) {
                    score += 100;
                    localStorage.setItem('score', score);
                    showScoreAnimation(head.x, head.y);
                    apple = {
                        x: Math.floor(Math.random() * gridCount),
                        y: Math.floor(Math.random() * gridCount)
                    };
                } else {
                    snake.pop();
                }

                snake.unshift(head);
                movementTimer = 0;
            }
        }

        if (movementTimer >= 5 && !canChangeDirection) { 
            canChangeDirection = true;
        }
    }

    function draw() {
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = 'lime';
        snake.forEach(part => {
            ctx.beginPath();
            ctx.roundRect(part.x * gridSize, part.y * gridSize, gridSize - 2, gridSize - 2, 5);
            ctx.fill();
        });

        ctx.fillStyle = 'red';
        ctx.beginPath();
        ctx.roundRect(apple.x * gridSize, apple.y * gridSize, gridSize - 2, gridSize - 2, 5);
        ctx.fill();

        document.getElementById('scoreBoard').innerText = 'Score: ' + score;
    }

    function showScoreAnimation(x, y) {
        const scoreAnimation = document.createElement('div');
        scoreAnimation.className = 'score-animation';
        scoreAnimation.innerText = '+100';
        scoreAnimation.style.left = `${x * gridSize + canvas.offsetLeft}px`;
        scoreAnimation.style.top = `${y * gridSize + canvas.offsetTop}px`;
        document.body.appendChild(scoreAnimation);

        setTimeout(() => {
            scoreAnimation.remove();
        }, 1000);
    }

    function resetGame() {
        cancelAnimationFrame(animationId);
        document.querySelectorAll('.score-animation').forEach(animation => animation.remove());
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        score = localStorage.getItem('score') ? parseInt(localStorage.getItem('score')) : 0;
        snake = [{ x: 10, y: 10 }];
        direction = { x: 0, y: 0 };
        apple = {
            x: Math.floor(1 + Math.random() * (gridCount - 2)),
            y: Math.floor(1 + Math.random() * (gridCount - 2))
        };
        movementTimer = 0;
        canChangeDirection = true;

        animationId = requestAnimationFrame(gameLoop);
    }

    animationId = requestAnimationFrame(gameLoop);
}

CanvasRenderingContext2D.prototype.roundRect = function (x, y, width, height, radius) {
    if (width < 2 * radius) radius = width / 2;
    if (height < 2 * radius) radius = height / 2;
    this.beginPath();
    this.moveTo(x + radius, y);
    this.arcTo(x + width, y, x + width, y + height, radius);
    this.arcTo(x + width, y + height, x, y + height, radius);
    this.arcTo(x, y + height, x, y, radius);
    this.arcTo(x, y, x + width, y, radius);
    this.closePath();
    return this;
}
