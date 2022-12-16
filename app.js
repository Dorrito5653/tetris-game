let rows = 20;
let columns = 10;
let tiles = rows * columns;

for (let i = 0; i < tiles; i++) {
  var element = document.createElement('div');
  document.querySelector('.grid').appendChild(element)
}

//taken tiles
for (let i = 0; i < columns; i++) {
  var element = document.createElement('div');
  element.classList.add('taken')
  document.querySelector('.grid').appendChild(element)
}

// mini-grid tiles

for (let i = 0; i < rows; i++) {
  var element = document.createElement('div');
  document.querySelector('.mini-grid').appendChild(element)
}

let grid = document.getElementById('grid');
let minigrid = document.getElementById('mini-grid')
let squares = Array.from(document.querySelectorAll('.grid div'))
let ScoreDisplay = document.querySelector('#score')
let LineDisplay = document.querySelector('#lines')
let LevelDisplay = document.querySelector('#level')
let score = 0
let lines = 0
let StartBtn = document.querySelector('#start-button')
let width = 10;
let nextRandom = 0;
let paused = true;
let timerId;
let level = 0;
let dead = false;
let combo = 0;
let fps = 60;
let GameSpeedInterval = 800;
let highscore = window.localStorage.getItem('highscore');
if (!highscore) {
  window.localStorage.setItem('highscore', 0)
}
let scorerId = setInterval(addScore, 20)

const audio = document.getElementsByTagName('audio')[0]

if (!paused) {
  audio.play()
}

let playbackRate = audio.playbackRate;

const colors = [
  'orange',
  'red',
  'purple',
  'green',
  'blue',
  'yellow',
  'pink'
]

const lTetromino = [
  [1, width + 1, width * 2 + 1, 2],
  [width, width + 1, width + 2, width * 2 + 2],
  [1, width + 1, width * 2 + 1, width * 2],
  [width, width * 2, width * 2 + 1, width * 2 + 2]
]

const zTetromino = [
  [0, width, width + 1, width * 2 + 1],
  [width + 1, width + 2, width * 2, width * 2 + 1],
  [0, width, width + 1, width * 2 + 1],
  [width + 1, width + 2, width * 2, width * 2 + 1]
]

const tTetromino = [
  [1, width, width + 1, width + 2],
  [1, width + 1, width + 2, width * 2 + 1],
  [width, width + 1, width + 2, width * 2 + 1],
  [1, width, width + 1, width * 2 + 1]
]

const oTetromino = [
  [0, 1, width, width + 1],
  [0, 1, width, width + 1],
  [0, 1, width, width + 1],
  [0, 1, width, width + 1]
]

const iTetromino = [
  [1, width + 1, width * 2 + 1, width * 3 + 1],
  [width, width + 1, width + 2, width + 3],
  [1, width + 1, width * 2 + 1, width * 3 + 1],
  [width, width + 1, width + 2, width + 3]
]

const sTetromino = [
  [1, width + 1, width, width * 2],
  [width, width + 1, width * 2 + 1, width * 2 + 2],
  [1, width + 1, width, width * 2],
  [width, width + 1, width * 2 + 1, width * 2 + 2]
]

const jTetromino = [
  [0, 1, width + 1, width * 2 + 1],
  [width, width + 1, width + 2, 2],
  [0, width, width * 2, width * 2 + 1],
  [width, width + 1, width + 2, width * 2]
]

const theTetrominoes = [lTetromino, zTetromino, tTetromino, oTetromino, iTetromino, sTetromino, jTetromino]

let currentPosition = 4;
let currentRotation = 0;

let random = Math.floor(Math.random() * theTetrominoes.length)
let current = theTetrominoes[random][currentRotation]

//draw the first rotation in the first tetronimo
function draw() {
  for (const index of current) {
    squares[currentPosition + index].classList.add('tetronimo')
    squares[currentPosition + index].style.backgroundColor = colors[random]
  }
}

draw()

//undraw the Tetromino
function undraw() {
  //! Sometimes there is a wierd bug which causes the color to not change and still looks like a tetronimo
  for (const index of current) {
    squares[currentPosition + index].classList.remove('tetronimo')
    squares[currentPosition + index].style.backgroundColor = ''
    squares[currentPosition + index].style.backgroundColor = ''
  }
}

//make the tetrominos move down every bit of time
// let timerId = setInterval(moveDown, 750)

//movement event listeners
function control(e) {
  if (paused == true || dead == true) {
    return;
  }
  if (e.key === 'ArrowLeft' || e.key === 'a') {
    //move left
    moveLeft()
  }
  if (e.key === 'ArrowRight' || e.key === 'd') {
    //move right
    moveRight()
  }
  if (e.key === 'ArrowUp' || e.key === 'w') {
    //rotate
    rotate()
  }
  if (e.key === 'ArrowDown' || e.key === 's') {
    //move down
    moveDown()
    score += (3 * (level + 1)) //if held down, add 3 * (level + 1). If level = 5, 3 * (5 + 1) = 18, so 18 points are earned per keyDownInterval
    ScoreDisplay.innerHTML = score
  }
  if (e.code === 'Space') {
    //put tetronimos to the bottom and earn points
    onSpacePressed()
  }
}

document.addEventListener('keydown', control)

//TODO: add event listeners for mobile

//move down function
function moveDown(hardDrop) {
  if (!current.some(index => squares[currentPosition + index + width].classList.contains('taken'))) {
    if (hardDrop) {
      score += (3 * (level + 1))
    }
    ScoreDisplay.innerHTML = score
    undraw()
    currentPosition += width
    draw()
  } else {
    freeze();
    return true
  }
}

//check lowest position for tetronimo when it reaches bottom. Normally used for hardDrop
function checkLowest() {
  let availableDown = 0;
  for (let i = currentPosition; i < squares.length - (width * 2); i += width) { //check the squares below the current tetronimo. If they are taken, break otherwise keep adding the width.
    for (let squarenum of current) { //the current has 4 numeric values for position based on tetronimo
      if (squares[squarenum + availableDown].classList.contains('taken')) {
        break;
      }
    }
    availableDown += width
  }
  // console.log(availableDown, currentPosition + availableDown)
  return availableDown;
}

checkLowest()

function freeze() {
  if (paused == true) {
    return;
  }
  current.forEach(index => squares[currentPosition + index].classList.add('taken'))
  //start a new tetromino falling
  random = nextRandom
  nextRandom = Math.floor(Math.random() * theTetrominoes.length)
  current = theTetrominoes[random][currentRotation]
  currentPosition = 4
  draw()
  displayShape()
  addScore()
  gameOver()
}

//on space pressed
function onSpacePressed() {
  if (paused == true || dead == true) {
    return;
  }
  clearInterval(timerId)
  let availableDown = checkLowest();
  for (let i = 0; i < availableDown; i += width) {
    let frozen = moveDown(true)
    if (frozen == true) {
      timerId = setInterval(moveDown, GameSpeedInterval)
      return;
    }
  }
}

//move left
function moveLeft() {
  if (paused == true) {
    return;
  }
  undraw()
  let isAtLeftEdge = current.some(index => (currentPosition + index) % width === 0)

  if (!isAtLeftEdge) currentPosition -= 1

  if (current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
    currentPosition += 1
  }

  draw()
}

function moveRight() {
  if (paused == true) {
    return;
  }
  undraw()
  let isAtRightEdge = current.some(index => (currentPosition + index) % width === width - 1)

  if (!isAtRightEdge) currentPosition += 1

  if (current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
    currentPosition -= 1
  }

  draw()
}

//FIX ROTATION OF TETROMINOS AT THE EDGE
function isAtRight() {
  return current.some(index => (currentPosition + index + 1) % width === 0)
}

function isAtLeft() {
  return current.some(index => (currentPosition + index) % width === 0)
}

function checkRotatedPosition(P) {
  P = P || currentPosition       //get current position.  Then, check if the piece is near the left side.
  if ((P + 1) % width < 4) {         //add 1 because the position index can be 1 less than where the piece is (with how they are indexed).     
    if (isAtRight()) {            //use actual position to check if it's flipped over to right side
      currentPosition += 1    //if so, add one to wrap it back around
      checkRotatedPosition(P) //check again.  Pass position from start, since long block might need to move more.
    }
  }
  else if (P % width > 5) {
    if (isAtLeft()) {
      currentPosition -= 1
      checkRotatedPosition(P)
    }
  }
}

function validateRotation() {
  let nextRotation = theTetrominoes[random][currentRotation + 1]
  if (!nextRotation) {
    nextRotation = theTetrominoes[random][0]
  }
  for (const square of nextRotation) {
    if (squares[square].classList.contains('taken')) {
      return false;
    } else {
      return true;
    }
  }
}

//rotation
function rotate() {
  if (paused == true) {
    return;
  }
  //test if it is a valid rotation (there aren't other tetrominos stopping it)
  if (!validateRotation()) return;
  undraw()
  currentRotation++
  if (currentRotation === current.length) { //if it gets to 4, it should be 0
    currentRotation = 0
  }
  current = theTetrominoes[random][currentRotation]
  checkRotatedPosition()
  draw()
}

//show up the next tetronimo in the grid
const displaySquares = document.querySelectorAll('.mini-grid div')
const displayWidth = 4;
let displayIndex = 0;

//the Tetronimos without rotations
const upNextTetronimos = [
  [1, displayWidth + 1, displayWidth * 2 + 1, 2], //lTetromino
  [0, displayWidth, displayWidth + 1, displayWidth * 2 + 1], //zTetromino
  [1, displayWidth, displayWidth + 1, displayWidth + 2], //tTetromino
  [0, 1, displayWidth, displayWidth + 1], //oTetromino
  [1, displayWidth + 1, displayWidth * 2 + 1, displayWidth * 3 + 1], //iTetromino
  [1, displayWidth + 1, displayWidth, displayWidth * 2], //s
  [0, 1, displayWidth + 1, displayWidth * 2 + 1] //j
]

//display the shape in the mini-grid
function displayShape() {
  for (const square of displaySquares) {
    square.classList.remove('tetronimo')
    square.style.backgroundColor = ''
    for (const index of upNextTetronimos[nextRandom]) {
      displaySquares[displayIndex + index].classList.add('tetronimo')
      displaySquares[displayIndex + index].style.backgroundColor = colors[nextRandom]
    }
  }
}

//start or stop
StartBtn.addEventListener('click', () => {
  StartBtn.blur()
  if (timerId) {
    clearInterval(timerId)
    timerId = null
    paused = true
    audio.pause()
  } else {
    draw()
    timerId = setInterval(moveDown, GameSpeedInterval)
    nextRandom = Math.floor(Math.random() * theTetrominoes.length)
    paused = false
    displayShape()
    audio.play()
  }
})

//add score
function addScore() {
  if (paused == true || dead == true) {
    return
  }
  let addedLines = 0;
  for (let i = 0; i < 199; i += width) {
    const row = [i, i + 1, i + 2, i + 3, i + 4, i + 5, i + 6, i + 7, i + 8, i + 9]

    if (row.every(index => squares[index].classList.contains('taken'))) {
      // score += 40;
      // lines += 1;
      addedLines++
      // ScoreDisplay.innerHTML = score;
      // LineDisplay.innerHTML = lines;
      for (const index of row) {
        squares[index].classList.remove('taken')
        squares[index].classList.remove('tetronimo')
        squares[index].style.backgroundColor = ''
      }
      const squaresRemoved = squares.splice(i, width)
      squares = squaresRemoved.concat(squares)
      for (const cell of squares) {
        grid.appendChild(cell)
      }
    }
    //when n = level
    //Points for 1 line: 40 * (n + 1)
    //Points for 2 lines: 100 * (n + 1)
    //Points for 3 lines: 300 * (n + 1)
    //Points for 4 lines or tetris: 1200 * (n + 1)
  }
  lines += addedLines
  if (addedLines == 1) {
    //say nice!
    combo += 1
    score += (40 * (level + 1))
  } else if (addedLines == 2) {
    //say great!
    combo += 2
    score += (100 * (level + 1))
  } else if (addedLines == 3) {
    //say splendid!
    combo += 3
    score += (300 * (level + 1))
  } else if (addedLines == 4) {
    //say TETRIS
    combo += 4
    score += (1200 * (level + 1))
  } else {
    manageCombos()
    combo = 0;
  }
  ScoreDisplay.innerHTML = score;
  LineDisplay.innerHTML = lines;
  addedLines = 0;
  checkLevel()
}

function manageCombos() {
  let multiplier = Math.floor(Math.random() * (level + 1)) + 1
  let addedScore = 0;
  if (combo == 0 || combo == 1) {
    return
  } else if (combo == 2) {
    addedScore = 100 * multiplier
  } else if (combo == 3) {
    addedScore = 300 * multiplier
  } else if (combo == 4) {
    addedScore = 1200 * multiplier
  }
  score += addedScore;
  ScoreDisplay.innerHTML = score;
}

function checkLevel() {
  // the level increases every 10 lines
  if ((lines / 10) >= (level + 1)) {
    level++;
    LevelDisplay.innerHTML = level
    //at level 0, it takes 48 frames to go down 1 cell and decreases by 5 each time until level 10. 
    let newGameSpeed = ((1 / fps) * (48 - (level * 3))) * 1000
    if (level > 10) {
      newGameSpeed = (((1 / fps) * (48 - (level * 3))) * 1000) - (((1 / fps) * (level - 10)) * 1000)
    }
    GameSpeedInterval = newGameSpeed
    playbackRate = 800 / newGameSpeed;
    audio.playbackRate = playbackRate
    clearInterval(timerId)
    timerId = setInterval(moveDown, newGameSpeed)
  }
}

//game over
function gameOver() {
  if (current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
    ScoreDisplay.innerHTML = score, 'end'
    clearInterval(timerId)
    dead = true
    audio.pause()
    if (score > highscore) {
      window.localStorage.setItem('highscore', score)
    }
  }
}