import React from 'react'

import NextPieces from './components/NextPieces'

import Pieces   from './utils/Pieces'
import shuffle  from './utils/FisherYatesShuffle'
import urlParam from './utils/UrlParam'

import './css/styles.css'

class Tetris extends React.PureComponent {
  HEIGHT      = urlParam('height', 20)
  WIDTH       = urlParam('width',  10)
  SCORE       = [100, 300, 500, 800] // 1, 2, 3 or 4 lines
  SPEED       = [800, 600, 400, 200, 100, 50, 25]
  CLEAR_DELAY = 200

  constructor(props) {
    super(props)

    this.state = {
      grid:             this.emptyGrid(), // x left-right, y top-down
      piece:            [[]], // Empty 2D piece
      positionX:        0,    // top left x position of piece on grid
      positionY:        0,    // top left y position of piece on grid
      ghostPositionY:   0,
      bags:             [this.generateBag7(), this.generateBag7()], // Current set of piece and next one
      linesCount:       0, // Total number of cleared lines (to update current level)
      score:            0,
      level:            1,
      fullLinesIndices: [], // For quick animation when complete lines are about to disappear
      shake:            false,
      gameOver:         false,
      pause:            false,
    }
  }

  componentDidMount() {
    this.loadSounds()
    this.bindKeyboard()
    this.throwNewPiece()
    this.startMovingDown()
  }

  emptyGrid() {
    return Array.from({ length: this.HEIGHT }).map(() =>
      Array.from({ length: this.WIDTH }).fill(' ')
    )
  }

  loadSounds() {
    this.moveSound     = new Audio('./sounds/move.mp3')
    this.rotateSound   = new Audio('./sounds/rotate.mp3')
    this.clearSound    = new Audio('./sounds/clear.mp3')
    this.dropSound     = new Audio('./sounds/drop.mp3')
    this.gameOverSound = new Audio('./sounds/gameover.mp3')
    this.moveSound.volume     = 0.4
    this.rotateSound.volume   = 0.5
    this.clearSound.volume    = 0.6
    this.dropSound.volume     = 0.2
    this.gameOverSound.volume = 0.6
  }

  playSound(name) {
    this[`${name}Sound`].pause()
    this[`${name}Sound`].currentTime = 0
    this[`${name}Sound`].play()
  }

  // // to fix bug !? https://stackoverflow.com/questions/36803176/how-to-prevent-the-play-request-was-interrupted-by-a-call-to-pause-error
  // playSound(name) {
  //   let sound = this[`${name}Sound`]

  //   if(!sound.paused)
  //     sound.pause()

  //   sound.currentTime = 0

  //   if(sound.paused)
  //     sound.play()
  // }

  throwNewPiece() {
    const piece = this.takeNextPiece()

    let pieceBottomEmptyLines = 0

    for(let i = piece.length - 1; i >= 0; i--) { // Iterate from bottom to top to detect empty lines
      if(piece[i].every((cell) => cell === ' ')) {
        pieceBottomEmptyLines += 1
      }
      else {
        break
      }
    }

    this.setState({
      piece:     piece,
      positionX: parseInt((this.WIDTH - piece[0].length) / 2),
      positionY: -piece.length - 1 + pieceBottomEmptyLines
    }, this.refreshGhostPositionY)
  }

  generateBag7() {
    return shuffle([Pieces.i, Pieces.j, Pieces.l, Pieces.o, Pieces.s, Pieces.t, Pieces.z])
  }

  takeNextPiece() {
    const bag       = this.state.bags[0].map((piece) => piece) // clone first bag
    const nextPiece = bag.pop() // take last piece (faster than first)
    let   newBags   = null

    if(bag.length) {
      newBags = [bag, this.state.bags[1]]
    }
    else {
      newBags = [this.state.bags[1], this.generateBag7()] // if first bag is now empty, use second bag and generate new one
    }

    this.setState({ bags: newBags })

    return nextPiece()
  }

  currentSpeed() {
    return this.SPEED[Math.min(this.state.level - 1, 6)]
  }

  startMovingDown() {
    clearInterval(this.moveDownInterval) // to be sure (<React.StrictMode> and double mounting, I'm looking at you!)

    this.moveDownInterval = setInterval(
      this.moveDown.bind(this, false),  // false for automatic move (true is manual)
      this.currentSpeed()
    )
  }

  stopMovingDown() {
    clearInterval(this.moveDownInterval)
  }

  togglePause() {
    if(this.state.pause) {
      this.setState({ pause: false }, this.startMovingDown)
    }
    else {
      this.setState({ pause: true }, this.stopMovingDown)
    }
  }

  bindKeyboard() {
    document.onkeydown = (e) => {
      if(e.which === 80) { // p
        this.togglePause()
      }
      else if(!this.state.pause) {
        if(e.which === 82) { // r
          this.restart()
        }

        if(!this.state.gameOver) {
          switch(e.which) {
            case 37: this.moveLeft();   break;
            case 39: this.moveRight();  break;
            case 38: this.rotate();     break; // up
            case 40: this.moveDown();   break;
            case 32: this.moveBottom(); break; // space
            default: return; // exit this handler for other keys
          }
        }
      }

      e.preventDefault() // prevent the default action (scroll / move caret)
    }
  }

  hasCollision(grid, piece, positionX, positionY) {
    let collision = false

    piece.forEach((pieceRow, i) => {
      pieceRow.forEach((pieceCell, j) => {
        if(!collision && pieceCell !== ' ') { // ignore empty piece cell and skip of collision already detected
          const cellPositionY = positionY + i
          const cellPositionX = positionX + j

          if(cellPositionY > this.HEIGHT - 1 || cellPositionX < 0 || cellPositionX > this.WIDTH - 1) { // Test grid boundaries
            collision = true
          }
          else if(cellPositionY >= 0 && grid[cellPositionY][cellPositionX] !== ' ') { // Test if overlap between plain piece cell and existing grid
            collision = true
          }
        }
      })
    })

    return collision
  }

  canMoveLeft() {
    return !this.hasCollision(
      this.state.grid,
      this.state.piece,
      this.state.positionX - 1,
      this.state.positionY
    )
  }

  canMoveRight() {
    return !this.hasCollision(
      this.state.grid,
      this.state.piece,
      this.state.positionX + 1,
      this.state.positionY
    )
  }

  canMoveDown() {
    return !this.hasCollision(
      this.state.grid,
      this.state.piece,
      this.state.positionX,
      this.state.positionY + 1
    )
  }

  canRotate(rotatedPiece) {
    if(rotatedPiece[0].includes('o')) { // We don't want to rotate the square!
      return false
    }
    else {
      return !this.hasCollision(
        this.state.grid,
        rotatedPiece,
        this.state.positionX,
        this.state.positionY
      )
    }
  }

  moveLeft() {
    if(this.canMoveLeft()) {
      this.playSound('move')
      this.setState({ positionX: this.state.positionX - 1 }, this.refreshGhostPositionY)
    }
  }

  moveRight() {
    if(this.canMoveRight()) {
      this.playSound('move')
      this.setState({ positionX: this.state.positionX + 1 }, this.refreshGhostPositionY)
    }
  }

  moveDown(manualMove = true) {
    if(this.canMoveDown()) {
      if(manualMove) {
        this.playSound('move')
      }

      this.setState({ positionY: this.state.positionY + 1 })
    }
    else {
      this.mergePieceToGrid(() => {
        this.triggerGameLogic()
      })
    }
  }

  rotate() {
    const piece        = this.state.piece
    const rotatedPiece = piece[0].map((val, index) => piece.map(row => row[index]).reverse())

    if(this.canRotate(rotatedPiece)) {
      this.playSound('rotate')
      this.setState({ piece: rotatedPiece }, this.refreshGhostPositionY)
    }
  }

  moveBottom() {
    const grid     = this.state.grid
    const piece    = this.state.piece
    const x        = this.state.positionX
    let   currentY = this.state.positionY + 1

    this.playSound('drop')

    while(!this.hasCollision(grid, piece, x, currentY)) {
      currentY += 1
    }

    this.setState({ positionY: currentY - 1 }, () =>
      this.mergePieceToGrid(() => {
        this.triggerGameLogic()
      })
    )
  }

  restart() {
    this.setState({
      grid:             this.emptyGrid(),
      bags:             [this.generateBag7(), this.generateBag7()],
      linesCount:       0,
      score:            0,
      level:            1,
      fullLinesIndices: [],
      gameOver:         false,
    }, () => {
      this.throwNewPiece()
      this.startMovingDown()
    })
  }

  mergePieceToGrid(callback) {
    const piece = this.state.piece
    const x     = this.state.positionX
    const y     = this.state.positionY

    // Clone grid
    let grid = this.state.grid.map((row) => Array.from(row))

    // Place piece in new grid
    piece.forEach((pieceRow, i) => {
      pieceRow.forEach((pieceCell, j) => {
        if(pieceCell !== ' ' &&  y + i >= 0) {
          grid[y + i][x + j] = pieceCell
        }
      })
    })

    this.setState({ grid: grid }, callback)
  }

  shakeGame() {
    this.setState({ shake: true }, () => {
      setTimeout(() => {
        this.setState({ shake: false })
      }, 100) /* Same as animation */
    })
  }

  triggerGameLogic() {
    const fullLinesIndices = this.detectFullLinesIndices()

    // Only if new line founds (and not already in state waiting to be removed)
    if(fullLinesIndices.length && !this.state.fullLinesIndices.length) {
       this.stopMovingDown()
       this.shakeGame()

       this.setState({ fullLinesIndices: fullLinesIndices }, () => {
         this.clearLines(() => {
           this.throwNewPiece()
           this.startMovingDown()
         })
       })
    }
    else if(this.isGameOver()) {
      this.playSound('gameOver')
      this.stopMovingDown()
      this.setState({ gameOver: true })
    }
    else {
      this.throwNewPiece()
    }
  }

  isGameOver() {
    const piece            = this.state.piece
    const gridFullToTheTop = this.state.grid[0].some((cell) => cell !== ' ')
    let   pieceIsBeyondTop = false

    for(let i = 0; i < piece.length; i++) { // Iterate from top to bottom to find highest cell
      if(!piece[i].every((cell) => cell === ' ')) {
        pieceIsBeyondTop = this.state.positionY + i < 0
        break
      }
    }

    return gridFullToTheTop && pieceIsBeyondTop
  }

  // Detect here the lowest Y position where the piece can be
  refreshGhostPositionY() {
    const grid           = this.state.grid
    const piece          = this.state.piece
    const x              = this.state.positionX
    let   ghostPositionY = this.state.positionY

    while(!this.hasCollision(grid, piece, x, ghostPositionY)) {
      ghostPositionY += 1
    }

    this.setState({ ghostPositionY: ghostPositionY - 1 })
  }

  detectFullLinesIndices() {
    let indices = []

    this.state.grid.forEach((row, index) => {
      if (!row.includes(' ')) {
        indices.push(index)
      }
    })

    return indices
  }

  clearLines(callback) {
    this.playSound('clear')

    setTimeout(() => {
      let newGrid = this.emptyGrid()
      let offsetY = 0 // current number of lines to offset

      for(let i = this.HEIGHT - 1; i >= 0; i--) { // Iterate from bottom to top to increase offsetY with each full line encountered while copying
        if(this.state.fullLinesIndices.includes(i)) {
          offsetY += 1 // skip line!
        }
        else {
          for(let j = 0; j < this.WIDTH; j++) {
            newGrid[i+offsetY][j] = this.state.grid[i][j]
          }
        }
      }

      const newLinesCount = this.state.linesCount + offsetY
      const linesScore    = offsetY !== 0 ? this.SCORE[offsetY-1] : 0
      const newScore      = this.state.score + linesScore * this.state.level
      const newLevel      = this.state.linesCount % 10 > newLinesCount % 10 ? this.state.level + 1 : this.state.level // only if it passes the upper ten (modulo hack)

      this.setState({
        grid:             newGrid,
        linesCount:       newLinesCount,
        score:            newScore,
        level:            newLevel,
        fullLinesIndices: []
      }, callback)
    }, this.CLEAR_DELAY)
  }

  // Existing classes are the following:
  // i, j, l, o, s, t, z = Tetris pieces
  // x                   = Part of a complete line that will imminently disappear
  // g                   = Ghost (lowest position of current piece)
  classNameForPosition(i, j) {
    let classNames = []

    // 1. If grid is already filled at that position
    if(i >= 0 && this.state.grid[i][j] !== ' ') {
      // a. Add class of piece in cell
      classNames.push(this.state.grid[i][j])

      // b. If position is on currently full line, add 'x' class (will disappear soon)
      if(this.state.fullLinesIndices.includes(i)) {
        classNames.push('x')
      }
    }
    // 2. If grid is empty at that position (works with cells above the game: i < 0)
    else {
      // a. Add class of current falling piece (if any at this position)
      const pieceI = i - this.state.positionY
      const pieceJ = j - this.state.positionX

      if(this.state.piece[pieceI] && this.state.piece[pieceI][pieceJ]) {
        classNames.push(this.state.piece[pieceI][pieceJ])
      }

      // b. Add class of ghost (if any at this position)
      const ghostI = i - this.state.ghostPositionY
      const ghostJ = pieceJ

      if(this.state.piece[ghostI] && this.state.piece[ghostI][ghostJ] && this.state.piece[ghostI][ghostJ] !== ' ') {
        classNames.push('g')
        classNames.push(`g-${this.state.piece[ghostI][ghostJ]}`)
      }
    }

    return classNames.join(' ')
  }

  render() {
    let tetrisGridClasses = 'tetris-grid'

    if(this.state.shake) {
      tetrisGridClasses += ' shake'
    }

    return (
      <div className="tetris-container">
        <div className="tetris">
          <div className="tetris-grids">
            <div className="tetris-pre-grid">
              { this.renderPreGrid() }
            </div>
            <div className={tetrisGridClasses}>
              { this.renderGrid() }
            </div>
          </div>
          <NextPieces bags={this.state.bags} />
        </div>
        { this.renderScore()    }
        { this.renderGameOver() }
        { this.renderPause()    }
      </div>
    )
  }

  renderPreGrid() {
    return [-3, -2, -1].map((i) => this.renderPreGridRow(i))
  }

  renderPreGridRow(i) {
    const key       = `row-${i}`
    const className = `row ${key}`

    return (
      <div className={className} key={key}>
        { Array.from({ length: this.WIDTH }).map((cell, j) => this.renderPreGridCell(i, j)) }
      </div>
    )
  }

  renderPreGridCell(i, j) {
    const key       = `cell-${i}-${j}`
    const className = `cell ${key} ${this.classNameForPosition(i, j)}`

    return (
      <div className={className} key={key}>
        &nbsp;
      </div>
    )
  }

  renderGrid() {
    return this.state.grid.map((row, i) => this.renderRow(row, i))
  }

  renderRow(row, i) {
    const key       = `row-${i}`
    const className = `row ${key}`

    return (
      <div className={className} key={key}>
        { row.map((cell, j) => this.renderCell(cell, i, j)) }
      </div>
    )
  }

  renderCell(cell, i, j) {
    const key       = `cell-${i}-${j}`
    const className = `cell ${key} ${this.classNameForPosition(i, j)}`

    return (
      <div className={className} key={key}>
        &nbsp;
      </div>
    )
  }

  renderScore() {
    return (
      <div className="score">
        { this.state.score }

        <div className="level">
          Level {this.state.level}
        </div>
      </div>
    )
  }

  renderGameOver() {
    if(this.state.gameOver) {
      return (
        <div className="overlay">
          <div className="game-over">
            GAME OVER
            <small>
              Press 'r' to try again
            </small>
          </div>
        </div>
      )
    }
  }

  renderPause() {
    if(this.state.pause) {
      // small is used to better align vertically
      return (
        <div className="overlay">
          <div className="pause">
            PAUSED
          </div>
        </div>
      )
    }
  }
}

export default Tetris;
