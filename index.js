const { Engine, Render, Runner, World, Bodies } = Matter;

const cells = 5;
const width = window.innerWidth;
const height = window.innerHeight;

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

const grid = Array(cells) // rows
  .fill(null)
  .map(() => Array(cells).fill(false)); // columns

const verticals = Array(cells) // rows
  .fill(null)
  .map(() => Array(cells - 1).fill(false)); // columns

const horizontals = Array(cells - 1) // rows
  .fill(null)
  .map(() => Array(cells).fill(false)); // column

console.log(grid, verticals, horizontals);
