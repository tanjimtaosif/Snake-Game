// 1. SETTINGS & DOM ELEMENTS
const board = document.querySelector(".board");
const blockHeight = 50;
const blockWidth = 50;
const startButton = document.querySelector(".btn-start");
const restartButton = document.querySelector(".btn-restart");
const modal = document.querySelector(".modal");
const startGameModal = document.querySelector(".start-game");
const restartGameModal = document.querySelector(".game-over");

// Score Elements
const scoreElement = document.getElementById("current-score");
const highScoreElement = document.getElementById("high-score");

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
let intervalId = null;
let score = 0;
let highScore = localStorage.getItem("snake-high-score") || 0;

// Initialize High Score Display
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
  // Ensure food doesn't spawn on snake body
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

// 6. MAIN GAME LOGIC
function renderSnake() {
  let head = { ...snake[0] };

  if (direction === "left") head.y -= 1;
  else if (direction === "right") head.y += 1;
  else if (direction === "down") head.x += 1;
  else if (direction === "up") head.x -= 1;

  if (head.x < 0 || head.x >= rows || head.y < 0 || head.y >= cols)
    return gameOver();
  if (snake.some((seg) => seg.x === head.x && seg.y === head.y))
    return gameOver();

  snake.forEach((seg) => blocks[`${seg.x}-${seg.y}`].classList.remove("fill"));

  if (head.x === food.x && head.y === food.y) {
    blocks[`${food.x}-${food.y}`].classList.remove("food");
    updateScore(); // Update score when eating
    getRandomFood();
    snake.unshift(head);
  } else {
    snake.unshift(head);
    snake.pop();
  }

  blocks[`${food.x}-${food.y}`].classList.add("food");
  snake.forEach((seg) => blocks[`${seg.x}-${seg.y}`].classList.add("fill"));
}

function gameOver() {
  clearInterval(intervalId);
  intervalId = null;
  startGameModal.style.display = "none";
  restartGameModal.style.display = "flex";
  modal.style.display = "flex";
}

function restartGame() {
  // Clear visual classes
  snake.forEach((seg) => blocks[`${seg.x}-${seg.y}`].classList.remove("fill"));
  blocks[`${food.x}-${food.y}`].classList.remove("food");

  // Reset Data
  snake = [
    { x: 1, y: 5 },
    { x: 1, y: 4 },
    { x: 1, y: 3 },
  ];
  direction = "down";
  score = 0;
  scoreElement.innerText = score;
  getRandomFood();

  // Reset UI
  modal.style.display = "none";
  restartGameModal.style.display = "none";

  intervalId = setInterval(renderSnake, 300);
}

// 7. EVENT LISTENERS
startButton.addEventListener("click", () => {
  modal.style.display = "none";
  getRandomFood();
  intervalId = setInterval(renderSnake, 300);
});

restartButton.addEventListener("click", restartGame);

addEventListener("keydown", (eve) => {
  if (eve.key == "ArrowUp" && direction !== "down") direction = "up";
  else if (eve.key == "ArrowRight" && direction !== "left") direction = "right";
  else if (eve.key == "ArrowLeft" && direction !== "right") direction = "left";
  else if (eve.key == "ArrowDown" && direction !== "up") direction = "down";
});
