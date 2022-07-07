/**
 * TODO: fix zoom circle positioning
 * TODO: add save drawing
 * TODO: refactor the zoom code and hover square
 */

import config from './config.js';
import GameOfLifeEnviroment from './game-logic.js';

// const zoomCanvas = document.getElementById('zoom-canvas');
const startGame = document.getElementById('startGame');
const erase = document.getElementById('erase');
/** @type {HTMLCanvasElement} */
const canvas = document.getElementById('canvas');
let x, y;
let mouse = { x, y };
let mousedown = false;
let startGamesimulation = false;
let GameOfLife = new GameOfLifeEnviroment(canvas);
GameOfLife.start();

startGame.addEventListener('click', () => {
  startGamesimulation ? (startGame.innerHTML = 'Start Game') : (startGame.innerHTML = 'Pause Game');
  GameOfLife.startGameOfLife();
  startGamesimulation = !startGamesimulation;
});
erase.addEventListener('click', () => {
  console.log(GameOfLife.erasing);
  GameOfLife.startErasing();
  console.log(GameOfLife.erasing);
});

canvas.addEventListener('mousemove', (e) => {
  // get more accurate mouse position on the canva
  let rect = canvas.getBoundingClientRect();
  mouse.x = Math.floor((e.x - rect.x) / config.cellSize);
  mouse.y = Math.floor((e.y - rect.y) / config.cellSize);
  hooverSquare(mouse);
  // zoomCanvas.style = `
  // left: ${mouse.x * config.cellSize}px;
  // top: ${mouse.y * config.cellSize}px;
  // `;
  if (mousedown && !startGamesimulation) GameOfLife.getStartingGeneration(mouse);
});

canvas.addEventListener('mousedown', () => {
  mousedown = true;
});
canvas.addEventListener('click', () => {
  if (!startGamesimulation) GameOfLife.getStartingGeneration(mouse);
});
canvas.addEventListener('mouseup', () => {
  mousedown = false;
});

function hooverSquare({ x, y }) {
  const square = document.getElementById('square');
  square.style = `
  position: absolute;
  width: ${config.cellSize}px;
  height: ${config.cellSize}px;
  top: ${y * config.cellSize}px;
  left: ${x * config.cellSize + 1}px;
  border: 1px solid red;
  z-index: 10;
  pointer-events: none;
  `;
}

// const ctx2 = zoomCanvas.getContext('2d');
// let sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight, zoomValue;
// function zoom() {
//   ctx2.clearRect(0, 0, zoomCanvas.width, zoomCanvas.height);
//   zoomValue = 2;
//   dWidth = zoomCanvas.width * zoomValue;
//   dHeight = zoomCanvas.height * zoomValue;
//   dy = 0;
//   dx = 0;
//   sWidth = zoomCanvas.width;
//   sHeight = zoomCanvas.height;
//   sy = mouse.y * config.cellSize - sWidth / zoomValue / zoomValue;
//   sx = mouse.x * config.cellSize - sHeight / zoomValue / zoomValue;
//   requestAnimationFrame(zoom);
//   ctx2.drawImage(canvas, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);

//   ctx2.strokeRect(sWidth / 2, sHeight / 2, config.cellSize * zoomValue, config.cellSize * zoomValue);
//   ctx2.strokeStyle = 'red';
// }
// zoom();
// drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
