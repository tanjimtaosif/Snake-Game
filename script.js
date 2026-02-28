// 1. SETTINGS & DOM ELEMENTS
const board = document.querySelector(".board");
const blockHeight = 50;
const blockWidth = 50;
const startButton = document.querySelector(".btn-start");
const restartButton = document.querySelector(".btn-restart");
const modal = document.querySelector(".modal");
const startGameModal = document.querySelector(".start-game");
const restartGameModal = document.querySelector(".game-over");
const finalScoreElement = document.getElementById("final-score");
const finalTimeElement = document.getElementById("final-time");

// Info Elements
const scoreElement = document.getElementById("current-score");
const highScoreElement = document.getElementById("high-score");
const timeElement = document.getElementById("time");

// 2. CALCULATIONS
const cols = Math.floor(board.clientWidth / blockWidth);
const rows = Math.floor(board.clientHeight / blockHeight);

// 3. DATA & STATE
const blocks = [];
let snake = [
  { x: 1, y: 5 },
  { x: 1, y: 4 },
  { x: 1, y: 3 },
];
let food = { x: 0, y: 0 };
let direction = "down";
let intervalId = null; // For game movement
let timerId = null; // For the clock
let score = 0;
let seconds = 0;
let highScore = localStorage.getItem("snake-high-score") || 0;

// Initialize High Score Display on load
highScoreElement.innerText = highScore;

// 4. GRID GENERATION
for (let row = 0; row < rows; row++) {
  for (let col = 0; col < cols; col++) {
    const block = document.createElement("div");
    block.classList.add("block");
    board.appendChild(block);
    blocks[`${row}-${col}`] = block;
  }
}

// 5. HELPER FUNCTIONS
function getRandomFood() {
  food = {
    x: Math.floor(Math.random() * rows),
    y: Math.floor(Math.random() * cols),
  };
  // Ensure food doesn't spawn on top of the snake body
  const onSnake = snake.some((seg) => seg.x === food.x && seg.y === food.y);
  if (onSnake) getRandomFood();
}

function updateScore() {
  score += 10;
  scoreElement.innerText = score;

  if (score > highScore) {
    highScore = score;
    highScoreElement.innerText = highScore;
    localStorage.setItem("snake-high-score", highScore);
  }
}

function startTimer() {
  timerId = setInterval(() => {
    seconds++;
    let mins = Math.floor(seconds / 60);
    let secs = seconds % 60;

    // Formatting numbers to always show two digits (e.g. 05 instead of 5)
    let displayMins = mins < 10 ? "0" + mins : mins;
    let displaySecs = secs < 10 ? "0" + secs : secs;

    timeElement.innerText = `${displayMins}:${displaySecs}`;
  }, 1000);
}

function resetTimer() {
  clearInterval(timerId);
  seconds = 0;
  timeElement.innerText = "00:00";
}

// 6. MAIN GAME LOGIC
function renderSnake() {
  let head = { ...snake[0] }; // Create a copy of the head position

  // Update position based on direction
  if (direction === "left") head.y -= 1;
  else if (direction === "right") head.y += 1;
  else if (direction === "down") head.x += 1;
  else if (direction === "up") head.x -= 1;

  // Collision Checks
  if (head.x < 0 || head.x >= rows || head.y < 0 || head.y >= cols)
    return gameOver();
  if (snake.some((seg) => seg.x === head.x && seg.y === head.y))
    return gameOver();

  // Remove visual "fill" class from grid
  snake.forEach((seg) => blocks[`${seg.x}-${seg.y}`].classList.remove("fill"));

  // Check if snake head hit the food
  if (head.x === food.x && head.y === food.y) {
    blocks[`${food.x}-${food.y}`].classList.remove("food");
    updateScore();
    getRandomFood();
    // Snake grows: we unshift the new head but DO NOT pop the tail
    snake.unshift(head);
  } else {
    // Normal movement: add new head, remove old tail
    snake.unshift(head);
    snake.pop();
  }

  // Draw updated positions
  blocks[`${food.x}-${food.y}`].classList.add("food");
  snake.forEach((seg) => blocks[`${seg.x}-${seg.y}`].classList.add("fill"));
}

function gameOver() {
  clearInterval(intervalId);
  clearInterval(timerId);
  intervalId = null;
  timerId = null;

  // INJECT STATS: Show the user their results before they restart
  finalScoreElement.innerText = score;
  finalTimeElement.innerText = timeElement.innerText;

  startGameModal.style.display = "none";
  restartGameModal.style.display = "flex";
  modal.style.display = "flex";
}

function restartGame() {
  // Clear all current visual markers
  snake.forEach((seg) => blocks[`${seg.x}-${seg.y}`].classList.remove("fill"));
  blocks[`${food.x}-${food.y}`].classList.remove("food");

  // Reset Data to starting values
  snake = [
    { x: 1, y: 5 },
    { x: 1, y: 4 },
    { x: 1, y: 3 },
  ];
  direction = "down";
  score = 0;
  scoreElement.innerText = score;

  // Reset and restart the timer
  resetTimer();
  startTimer();

  getRandomFood();
  modal.style.display = "none";
  restartGameModal.style.display = "none";

  // Start the game loop again
  intervalId = setInterval(renderSnake, 300);
}

// 7. EVENT LISTENERS
startButton.addEventListener("click", () => {
  modal.style.display = "none";
  getRandomFood();
  startTimer();
  intervalId = setInterval(renderSnake, 300);
});

restartButton.addEventListener("click", restartGame);

addEventListener("keydown", (eve) => {
  // Logic to prevent the snake from turning 180 degrees into itself
  if (eve.key == "ArrowUp" && direction !== "down") direction = "up";
  else if (eve.key == "ArrowRight" && direction !== "left") direction = "right";
  else if (eve.key == "ArrowLeft" && direction !== "right") direction = "left";
  else if (eve.key == "ArrowDown" && direction !== "up") direction = "down";
});
