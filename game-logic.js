import Cell from './cell.js';
import config from './config.js';

export default class GameOfLifeEnviroment {
  constructor(canvas) {
    this.canvas = canvas;
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.ctx = this.canvas.getContext('2d');
    this.startGame = false;
    this.erasing = false;
    this.previousGenerationCells = [];
    this.cellsToEvaluate = [];
    this.grid = [];
    /* 
    to stop SetUp function from running more than once.
    otherwise each time requestAnimationFrame loops it SetUp function will run again.
    */
    this.SetUpExcuted = false;
  }

  setUpGrid() {
    for (let y = 0; y < this.height / config.cellSize && !this.SetUpExcuted; y++) {
      let row = [];
      for (let x = 0; x < this.width / config.cellSize; x++) {
        const cell = new Cell(this.ctx, x, y);
        row.push(cell);
      }
      this.grid.push(row);
    }
    this.SetUpExcuted = true;
    return this.grid;
  }

  drawCells() {
    // draw cells
    let gridOfCells = this.setUpGrid();
    let i = gridOfCells[0].length; // x lenght
    let j = gridOfCells.length; // y lenght
    for (let y = 0; y < j; y++) {
      for (let x = 0; x < i; x++) {
        let cell = gridOfCells[y][x];
        cell.draw();
      }
    }
    // draw grid lines
    for (let y = 0; y <= this.canvas.height / config.cellSize; y++) {
      // horizontal lines
      this.ctx.beginPath();
      this.ctx.moveTo(0, y * config.cellSize);
      this.ctx.lineTo(this.canvas.width, y * config.cellSize);
      this.ctx.lineWidth = config.cellBorderWidth;
      this.ctx.strokeStyle = config.cellBorderColor;
      this.ctx.stroke();
    }
    for (let x = 0; x < this.canvas.width / config.cellSize; x++) {
      // vertical lines
      this.ctx.beginPath();
      this.ctx.moveTo(x * config.cellSize, 0);
      this.ctx.lineTo(x * config.cellSize, this.canvas.height);
      this.ctx.lineWidth = config.cellBorderWidth;
      this.ctx.strokeStyle = config.cellBorderColor;
      this.ctx.stroke();
    }
  }
  getNeighbours(cell) {
    let neighbours = [];
    let x = cell.x;
    let y = cell.y;
    // top right neighbour
    x < this.grid[0].length - 1 && y > 0 ? neighbours.push(this.grid[y - 1][x + 1]) : '';
    // top neighbour
    y > 0 ? neighbours.push(this.grid[y - 1][x]) : '';
    // top left neighbour
    x > 0 && y > 0 ? neighbours.push(this.grid[y - 1][x - 1]) : '';
    // right neighbour
    x < this.grid[0].length - 1 ? neighbours.push(this.grid[y][x + 1]) : '';
    // left neighbour
    x > 0 ? neighbours.push(this.grid[y][x - 1]) : '';
    // bottom right neighbour
    x < this.grid[0].length - 1 && y < this.grid.length - 1 ? neighbours.push(this.grid[y + 1][x + 1]) : '';
    // bottom left neighbour
    x > 0 && y < this.grid.length - 1 ? neighbours.push(this.grid[y + 1][x - 1]) : '';
    // bottom neighbour
    y < this.grid.length - 1 ? neighbours.push(this.grid[y + 1][x]) : '';

    return neighbours;
  }
  /*  
    this function will help us only look at the area 
    around previous generation cells so we don't waste 
    time looking in an empty space.
    to do that:
      - loop over previousGenerationCells and get every cell's neighbour
      - push neighbour cell to cellsToEvaluate 
      - add previousGenerationCells to cellsToEvaluate to get total cells to evalute
      - change cellsToEvalute to a Set, to remove all dupliactes
      
      */
  setCellToBeEvaluated() {
    for (let i = 0; i < this.previousGenerationCells.length; i++) {
      const cell = this.previousGenerationCells[i];
      const neighbours = this.getNeighbours(cell);
      //  - push neighbour cell to cellsToEvaluate
      this.cellsToEvaluate.push(...neighbours);
    }
    // - add previousGenerationCells to cellsToEvaluate to get total cells to evalute
    this.cellsToEvaluate.push(...this.previousGenerationCells);
    return;
  }
  setUpNextGeneration(set) {
    this.previousGenerationCells.length = 0;
    this.cellsToEvaluate.length = 0;
    let newSet = set.filter((cell) => cell.nextGenerationState != undefined);
    for (let i = 0; i < newSet.length; i++) {
      const cell = newSet[i];
      if (cell.nextGenerationState === false) this.previousGenerationCells.push(cell);
      cell.toNextGeneration();
    }
  }
  getStartingGeneration(mouse) {
    const cellToBeAlive = this.grid[mouse.y][mouse.x];
    // remove cell on second click, basically erasing effect
    if (this.previousGenerationCells.includes(cellToBeAlive) && this.erasing) {
      let index = this.previousGenerationCells.indexOf(cellToBeAlive);
      // remove it from previousGenerationCells array
      this.previousGenerationCells.splice(index, 1);
      // make it dead again
      cellToBeAlive.makeCellDead();
    } else if (!this.previousGenerationCells.includes(cellToBeAlive) && !this.erasing) {
      cellToBeAlive.makeCellAlive();
      this.previousGenerationCells.push(cellToBeAlive);
    }
  }
  start() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    setTimeout(() => {
      // bind start to its context (the instance of GameOfLifeEnviroment)
      requestAnimationFrame(this.start.bind(this));
    }, 1000 / config.fps);
    this.drawCells();
    if (this.startGame === true && this.previousGenerationCells.length > 0) {
      config.fps = 30;
      this.setCellToBeEvaluated();
      // - change cellsToEvalute to a Set, to remove all dupliactes
      let set = [...new Set(this.cellsToEvaluate)];
      for (let i = 0; i < this.cellsToEvaluate.length; i++) {
        const cell = this.cellsToEvaluate[i];
        // for live cells
        if (cell.isDead === false) {
          const numberOfNeighbourLiveCells = this.getNeighbours(cell).filter((neighbour) => neighbour.isDead === false).length;
          if (numberOfNeighbourLiveCells < 2) cell.nextGenerationState = true;
          if (numberOfNeighbourLiveCells === 2 || numberOfNeighbourLiveCells === 3) cell.nextGenerationState = false;
          if (numberOfNeighbourLiveCells > 3) cell.nextGenerationState = true;
        } else {
          // for dead cells
          const numberOfNeighbourLiveCells = this.getNeighbours(cell).filter((neighbour) => neighbour.isDead === false).length;
          if (numberOfNeighbourLiveCells === 3) cell.nextGenerationState = false;
        }
      }
      this.setUpNextGeneration(set);
    }
  }
  // pause or start the game
  startGameOfLife() {
    // only when dead cells have been submited then game can start
    if (this.previousGenerationCells.length > 0) this.startGame = !this.startGame;
  }
  startErasing() {
    this.erasing = !this.erasing;
  }
  // clear canvas the game
  // endGameOfLife() {
  // }
}
