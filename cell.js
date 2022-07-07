import config from './config.js';

export default class Cell {
  constructor(ctx, x, y) {
    this.ctx = ctx;
    this.x = x;
    this.y = y;
    this.isDead = true;
    this.nextGenerationState = undefined;
  }

  draw() {
    this.ctx.beginPath();
    this.ctx.fillStyle = this.isDead ? config.deadCellColor : config.aliveCellColor;
    this.ctx.fillRect(this.x * config.cellSize, this.y * config.cellSize, config.cellSize, config.cellSize);
    this.ctx.fill();
  }

  makeCellAlive() {
    this.isDead = false;
    return;
  }

  makeCellDead() {
    this.isDead = true;
    return;
  }

  toNextGeneration() {
    this.isDead = this.nextGenerationState;
    return;
  }
}
