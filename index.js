// Matter.js variables extraction
const { Engine, Render, Runner, World, Bodies, Body, Events } = Matter;

// Variables
const cellsHorizontal = 16;
const cellsVertical = 12;
const width = window.innerWidth * 0.99;
const height = window.innerHeight * 0.99;

const unitWidth = width / cellsHorizontal;
const unitHeight = height / cellsVertical;
const wallSize = 3;
const ballVelocity = 5;

// World configuration and initialization
const engine = Engine.create();
engine.world.gravity.y = 0;
const { world } = engine;
const render = Render.create({
  element: document.body,
  engine: engine,
  options: {
    wireframes: false,
    width: width,
    height: height
  }
});
Render.run(render);
Runner.run(Runner.create(), engine);

// Walls
const walls = [
  Bodies.rectangle(width / 2, 0, width, wallSize, {
    isStatic: true,
    label: "border"
  }), //top
  Bodies.rectangle(width / 2, height, width, wallSize, {
    isStatic: true,
    label: "border"
  }), //bottom
  Bodies.rectangle(0, height / 2, wallSize, height, {
    isStatic: true,
    label: "border"
  }), //left
  Bodies.rectangle(width, height / 2, wallSize, height, {
    isStatic: true,
    label: "border"
  }) //right
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

const grid = Array(cellsVertical) // rows
  .fill(null)
  .map(() => Array(cellsHorizontal).fill(false)); // columns

const verticals = Array(cellsVertical) // rows
  .fill(null)
  .map(() => Array(cellsHorizontal - 1).fill(false)); // columns

const horizontals = Array(cellsVertical - 1) // rows
  .fill(null)
  .map(() => Array(cellsHorizontal).fill(false)); // column

const startRow = Math.floor(Math.random() * cellsVertical);
const startColumn = Math.floor(Math.random() * cellsHorizontal);

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
      nextRow >= cellsVertical ||
      nextColumn < 0 ||
      nextColumn >= cellsHorizontal
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
      unitHeight * rowIndex + unitHeight,
      unitWidth,
      wallSize,
      {
        isStatic: true,
        label: "wall",
        render: {
          fillStyle: "red"
        }
      }
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
      unitWidth * columnIndex + unitWidth,
      unitHeight * rowIndex + unitHeight / 2,
      wallSize,
      unitHeight,
      {
        isStatic: true,
        label: "wall",
        render: {
          fillStyle: "red"
        }
      }
    );
    World.add(world, wall);
  });
});

// Goal point
const goal = Bodies.rectangle(
  width - unitWidth / 2,
  height - unitHeight / 2,
  unitWidth * 0.6,
  unitHeight * 0.6,
  {
    isStatic: true,
    label: "goal",
    render: {
      fillStyle: "green"
    }
  }
);
World.add(world, goal);

// Ball point
const ballRadius = Math.min(unitWidth, unitHeight) / 4;
const ball = Bodies.circle(unitWidth / 2, unitHeight / 2, ballRadius, {
  label: "ball",
  render: {
    fillStyle: "blue"
  }
});
World.add(world, ball);

// Keypress controls
document.addEventListener("keydown", event => {
  const { x, y } = ball.velocity;
  if (event.keyCode === 87) {
    //up
    Body.setVelocity(ball, { x, y: y - ballVelocity });
    document.querySelector(".tutorial").classList.add("hidden");
  }
  if (event.keyCode === 68) {
    //right
    Body.setVelocity(ball, { x: x + ballVelocity, y });
    document.querySelector(".tutorial").classList.add("hidden");
  }
  if (event.keyCode === 83) {
    //down
    Body.setVelocity(ball, { x, y: y + ballVelocity });
    document.querySelector(".tutorial").classList.add("hidden");
  }
  if (event.keyCode === 65) {
    //left
    Body.setVelocity(ball, { x: x - ballVelocity, y });
    document.querySelector(".tutorial").classList.add("hidden");
  }
});

// Win Condition
Events.on(engine, "collisionStart", event => {
  event.pairs.forEach(collision => {
    const labels = ["ball", "goal"];

    // if user reach a goal, turn on gravity
    if (
      labels.includes(collision.bodyA.label) &&
      labels.includes(collision.bodyB.label)
    ) {
      console.log(collision);
      world.gravity.y = 1;
      world.bodies.forEach(body => {
        if (body.label === "wall") {
          Body.setStatic(body, false);
        }
      });
      document.querySelector(".winner").classList.remove("hidden");
    }
  });
});
