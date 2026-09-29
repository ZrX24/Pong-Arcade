const canvas = document.getElementById('gameCanvas');
const context = canvas.getContext('2d');
const playerScoreElement = document.getElementById('playerScore');
const computerScoreElement = document.getElementById('computerScore');
const statusElement = document.getElementById('status');
const gameMessage = document.getElementById('gameMessage');
const messageText = document.getElementById('messageText');
const restartButton = document.getElementById('restartButton');

const court = {
  width: canvas.width,
  height: canvas.height,
  winningScore: 7
};

const paddle = {
  width: 14,
  height: 104,
  speed: 420
};

const player = { x: 34, y: court.height / 2 - paddle.height / 2, targetY: court.height / 2 - paddle.height / 2, score: 0 };
const computer = {
  x: court.width - 34 - paddle.width,
  y: player.y,
  targetY: player.y,
  velocityY: 0,
  reactionTime: 0,
  maxSpeed: 260,
  aimError: 0,
  score: 0
};
const ball = { x: court.width / 2, y: court.height / 2, radius: 9, speed: 360, velocityX: 360, velocityY: 180 };
const keys = new Set();
let gameRunning = true;
let lastFrameTime = 0;

function resetBall(direction = Math.random() > 0.5 ? 1 : -1) {
  ball.x = court.width / 2;
  ball.y = court.height / 2;
  ball.speed = 360;
  ball.velocityX = direction * ball.speed;
  ball.velocityY = (Math.random() * 240 - 120) || 90;
}

function resetGame() {
  player.score = 0;
  computer.score = 0;
  playerScoreElement.textContent = '0';
  computerScoreElement.textContent = '0';
  player.y = court.height / 2 - paddle.height / 2;
  player.targetY = player.y;
  computer.y = player.y;
  computer.targetY = computer.y;
  computer.velocityY = 0;
  computer.reactionTime = 0;
  computer.maxSpeed = 260;
  computer.aimError = 0;
  gameRunning = true;
  gameMessage.hidden = true;
  statusElement.textContent = 'First to 7';
  resetBall();
}

function movePlayer(deltaTime) {
  const movingUp = keys.has('ArrowUp') || keys.has('w');
  const movingDown = keys.has('ArrowDown') || keys.has('s');
  const direction = Number(movingDown) - Number(movingUp);

  if (direction !== 0) {
    player.y += direction * paddle.speed * deltaTime;
    player.targetY = player.y;
  } else {
    player.y += (player.targetY - player.y) * Math.min(1, 14 * deltaTime);
  }
  player.y = clamp(player.y, 0, court.height - paddle.height);
}

function moveComputer(deltaTime) {
  computer.reactionTime -= deltaTime;

  if (computer.reactionTime <= 0) {
    computer.reactionTime = 0.32 + Math.random() * 0.48;
    computer.maxSpeed = 190 + Math.random() * 130;

    const makesMistake = Math.random() < 0.18;
    computer.aimError = makesMistake ? (Math.random() * 2 - 1) * (30 + Math.random() * 55) : 0;
    computer.targetY = clamp(
      predictBallY(computer.x) - paddle.height / 2 + computer.aimError,
      0,
      court.height - paddle.height
    );
  }

  const distance = computer.targetY - computer.y;
  const acceleration = 720;
  const direction = Math.sign(distance);

  if (Math.abs(distance) > 12) {
    computer.velocityY += direction * acceleration * deltaTime;
  } else {
    computer.velocityY *= Math.pow(0.06, deltaTime);
  }

  computer.velocityY = clamp(computer.velocityY, -computer.maxSpeed, computer.maxSpeed);
  computer.y += computer.velocityY * deltaTime;
  computer.y = clamp(computer.y, 0, court.height - paddle.height);
}

function moveBall(deltaTime) {
  const nextX = ball.x + ball.velocityX * deltaTime;
  const nextY = ball.y + ball.velocityY * deltaTime;

  if (nextX + ball.radius < 0) {
    scorePoint(computer);
    return;
  }

  if (nextX - ball.radius > court.width) {
    scorePoint(player);
    return;
  }

  ball.x = nextX;
  ball.y = nextY;

  while (ball.y - ball.radius < 0 || ball.y + ball.radius > court.height) {
    if (ball.y - ball.radius < 0) {
      ball.y = ball.radius + (ball.radius - ball.y);
      ball.velocityY = Math.abs(ball.velocityY);
    } else {
      ball.y = court.height - ball.radius - (ball.y + ball.radius - court.height);
      ball.velocityY = -Math.abs(ball.velocityY);
    }
  }

  const hitPlayer = ball.velocityX < 0 && intersects(player);
  const hitComputer = ball.velocityX > 0 && intersects(computer);

  if (hitPlayer || hitComputer) {
    const paddleToHit = hitPlayer ? player : computer;
    const relativeHit = clamp(
      (ball.y - (paddleToHit.y + paddle.height / 2)) / (paddle.height / 2),
      -1,
      1
    );
    const angle = relativeHit * (Math.PI / 3);
    const direction = hitPlayer ? 1 : -1;
    ball.speed = Math.min(ball.speed + 20, 620);
    ball.velocityX = direction * ball.speed * Math.cos(angle);
    ball.velocityY = ball.speed * Math.sin(angle);
    ball.x = hitPlayer ? player.x + paddle.width + ball.radius : computer.x - ball.radius;
  }

}

function predictBallY(targetX) {
  if (ball.velocityX <= 0) return ball.y;

  const timeToPaddle = Math.max(0, (targetX - ball.x) / ball.velocityX);
  const projectedY = ball.y + ball.velocityY * timeToPaddle;
  const travelRange = court.height - ball.radius * 2;
  const cycle = travelRange * 2;
  let reflectedY = (projectedY - ball.radius) % cycle;

  if (reflectedY < 0) reflectedY += cycle;
  if (reflectedY > travelRange) reflectedY = cycle - reflectedY;
  return ball.radius + reflectedY;
}

function intersects(currentPaddle) {
  return ball.x - ball.radius < currentPaddle.x + paddle.width &&
    ball.x + ball.radius > currentPaddle.x &&
    ball.y - ball.radius < currentPaddle.y + paddle.height &&
    ball.y + ball.radius > currentPaddle.y;
}

function scorePoint(scoringPlayer) {
  scoringPlayer.score += 1;
  playerScoreElement.textContent = player.score;
  computerScoreElement.textContent = computer.score;

  if (scoringPlayer.score >= court.winningScore) {
    endGame(scoringPlayer === player);
    return;
  }

  resetBall(scoringPlayer === player ? -1 : 1);
}

function endGame(playerWon) {
  gameRunning = false;
  messageText.textContent = playerWon ? 'You win' : 'Computer wins';
  statusElement.textContent = 'Match complete';
  gameMessage.hidden = false;
}

function drawCourt() {
  context.fillStyle = '#151918';
  context.fillRect(0, 0, court.width, court.height);

  context.strokeStyle = '#3e4843';
  context.lineWidth = 2;
  context.setLineDash([8, 14]);
  context.beginPath();
  context.moveTo(court.width / 2, 24);
  context.lineTo(court.width / 2, court.height - 24);
  context.stroke();
  context.setLineDash([]);

  context.fillStyle = '#b4dfb3';
  context.fillRect(player.x, player.y, paddle.width, paddle.height);
  context.fillStyle = '#f2c14e';
  context.fillRect(computer.x, computer.y, paddle.width, paddle.height);

  context.beginPath();
  context.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  context.fillStyle = '#f5f3eb';
  context.fill();
}

function gameLoop(timestamp) {
  const deltaTime = Math.min((timestamp - lastFrameTime) / 1000, 0.033) || 0;
  lastFrameTime = timestamp;

  if (gameRunning) {
    movePlayer(deltaTime);
    moveComputer(deltaTime);
    moveBall(deltaTime);
  }
  drawCourt();
  animationFrame = requestAnimationFrame(gameLoop);
}

function clamp(value, minimum, maximum) {
  return Math.max(minimum, Math.min(maximum, value));
}

function setPlayerFromPointer(event) {
  const bounds = canvas.getBoundingClientRect(); /* https://Github.com/ZrX24/Pong-Arcade */
  const pointerY = (event.clientY - bounds.top) * (canvas.height / bounds.height);
  player.targetY = clamp(pointerY - paddle.height / 2, 0, court.height - paddle.height);
}

document.addEventListener('keydown', (event) => {
  if (['ArrowUp', 'ArrowDown', 'w', 's'].includes(event.key)) {
    event.preventDefault();
    keys.add(event.key);
  }
});

document.addEventListener('keyup', (event) => {
  keys.delete(event.key);
});

canvas.addEventListener('mousemove', setPlayerFromPointer);
restartButton.addEventListener('click', resetGame);

resetBall();
gameLoop();
