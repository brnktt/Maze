// Matter.js variables extraction
const { Engine, Render, Runner, World, Bodies } = Matter;

// Variables
const cells = 10;
const width = 600;
const height = 600;

const unitWidth = width / cells;
const unitHeight = height / cells;
const wallSize = 3;

// World configuration and initialization
const engine = Engine.create();
const { world } = engine;
const render = Render.create({
  element: document.body,
  engine: engine,
  options: {
    wireframes: true,
    width: width,
    height: height
  }
});
Render.run(render);
Runner.run(Runner.create(), engine);

// Walls
const walls = [
  Bodies.rectangle(width / 2, 0, width, 40, { isStatic: true }), //top
  Bodies.rectangle(width / 2, height, width, 40, { isStatic: true }), //bottom
  Bodies.rectangle(0, height / 2, 40, height, { isStatic: true }), //left
  Bodies.rectangle(width, height / 2, 40, height, { isStatic: true }) //right
];
World.add(world, walls);

// Maze Generation
const shuffle = arr => {
  let counter = arr.length;

  while (counter > 0) {
    const index = Math.floor(Math.random() * counter);

    counter--;

    const temp = arr[counter];
    arr[counter] = arr[index];
    arr[index] = temp;
  }

  return arr;
};

const grid = Array(cells) // rows
  .fill(null)
  .map(() => Array(cells).fill(false)); // columns

const verticals = Array(cells) // rows
  .fill(null)
  .map(() => Array(cells - 1).fill(false)); // columns

const horizontals = Array(cells - 1) // rows
  .fill(null)
  .map(() => Array(cells).fill(false)); // column

const startRow = Math.floor(Math.random() * cells);
const startColumn = Math.floor(Math.random() * cells);

const stepThrowCell = (row, column) => {
  // If i have visited the cell ar [row, column], then return
  if (grid[row][column]) {
    return;
  }

  // Mark this cell as being visited
  grid[row][column] = true;
  // Assemble randomly-ordered list of neighbors
  const neighbors = shuffle([
    [row - 1, column, "up"],
    [row, column + 1, "right"],
    [row + 1, column, "down"],
    [row, column - 1, "left"]
  ]);

  // For each neighbor....
  for (let neighbor of neighbors) {
    const [nextRow, nextColumn, direction] = neighbor;

    // See if this neighbor is out of bounds
    if (
      nextRow < 0 ||
      nextRow >= cells ||
      nextColumn < 0 ||
      nextColumn >= cells
    ) {
      continue;
    }

    // If we have visited that neighbor, continue to next neighbor
    if (grid[nextRow][nextColumn]) {
      continue;
    }

    // Remove a wall from either horizontals or verticals
    if (direction === "left") {
      verticals[row][column - 1] = true;
    } else if (direction === "right") {
      verticals[row][column] = true;
    } else if (direction === "up") {
      horizontals[row - 1][column] = true;
    } else if (direction === "down") {
      horizontals[row][column] = true;
    }

    // Visit that next cell
    stepThrowCell(nextRow, nextColumn);
  }
};

stepThrowCell(startRow, startColumn);

// Rendering walls of maze
horizontals.forEach((row, rowIndex) => {
  row.forEach((open, columnIndex) => {
    if (open) {
      return;
    }

    const wall = Bodies.rectangle(
      unitWidth * columnIndex + unitWidth / 2,
      unitWidth * rowIndex + unitWidth,
      unitWidth,
      wallSize,
      { isStatic: true }
    );
    World.add(world, wall);
  });
});

verticals.forEach((row, rowIndex) => {
  row.forEach((open, columnIndex) => {
    if (open) {
      return;
    }

    const wall = Bodies.rectangle(
      unitHeight * columnIndex + unitHeight,
      unitHeight * rowIndex + unitHeight / 2,
      wallSize,
      unitHeight,
      { isStatic: true }
    );
    World.add(world, wall);
  });
});
