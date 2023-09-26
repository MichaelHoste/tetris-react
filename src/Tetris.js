import React   from 'react';
import Pieces  from './utils/Pieces';
import shuffle from './utils/FisherYatesShuffle'

import './css/styles.css';

class Tetris extends React.PureComponent {
  HEIGHT = 20
  WIDTH  = 10
  SCORE  = [100, 300, 500, 800] // 1, 2, 3 or 4 lines
  SPEED  = [800, 600, 400, 200, 100, 50, 25]

  constructor(props) {
    super(props)

    this.state = {
      grid:             this.emptyGrid(),
      piece:            [[]], // Empty 2D piece
      positionX:        0,
      positionY:        0,
      ghostPositionY:   0,
      gameOver:         false,
      bags:             [this.generateBag7(), this.generateBag7()], // Current 7-bag and next one
      linesCount:       0, // Total number of cleared lines
      score:            0,
      level:            1,
      fullLinesIndices: [] // For quick animation when complete lines are about to disappear
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
    this.moveSound.volume     = 0.3
    this.rotateSound.volume   = 0.4
    this.clearSound.volume    = 0.5
    this.dropSound.volume     = 0.1
    this.gameOverSound.volume = 0.5
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
      if(piece[i].every((cell) => cell == ' ')) {
        pieceBottomEmptyLines += 1
      }
      else {
        break
      }
    }

    this.setState({
      piece:     piece,
      positionX: parseInt((this.WIDTH - piece[0].length) / 2),
      positionY: -piece.length + pieceBottomEmptyLines
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

  startMovingDown() {
    clearInterval(this.moveDownInterval) // to be sure (<React.StrictMode> and double mounting, I'm looking at you!)
    this.moveDownInterval = setInterval(this.moveDown.bind(this, false), this.SPEED[Math.min(this.state.level - 1, 6)])
  }

  stopMovingDown() {
    clearInterval(this.moveDownInterval)
  }

  bindKeyboard() {
    document.onkeydown = (e) => {
      if(e.which == 82) { // r
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

      e.preventDefault() // prevent the default action (scroll / move caret)
    }
  }

  hasCollision(grid, piece, positionX, positionY) {
    let collision = false

    piece.forEach((pieceRow, i) => {
      pieceRow.forEach((pieceCell, j) => {
        if(!collision && pieceCell != ' ') { // ignore empty piece cell and skip of collision already detected
          const cellPositionY = positionY + i
          const cellPositionX = positionX + j

          if(cellPositionY > this.HEIGHT - 1 || cellPositionX < 0 || cellPositionX > this.WIDTH - 1) { // Test grid boundaries
            collision = true
          }
          else if(cellPositionY >= 0 && grid[cellPositionY][cellPositionX] != ' ') { // Test if overlap between plain piece cell and existing grid
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
      gameOver:         false,
      bags:             [this.generateBag7(), this.generateBag7()],
      linesCount:       0,
      score:            0,
      level:            1,
      fullLinesIndices: []
    }, () => {
      this.throwNewPiece()
      this.startMovingDown()
    })
  }

  mergePieceToGrid(callback) {
    const piece = this.state.piece
    const x     = this.state.positionX
    const y     = this.state.positionY

    // clone grid
    let grid = this.state.grid.map((row) => Array.from(row))

    // Place piece in new grid
    piece.forEach((pieceRow, i) => {
      pieceRow.forEach((pieceCell, j) => {
        if(pieceCell != ' ' &&  y + i >= 0) {
          grid[y + i][x + j] = pieceCell
        }
      })
    })

    this.setState({ grid: grid }, callback)
  }

  triggerGameLogic() {
    const fullLinesIndices = this.detectFullLinesIndices()

    if(fullLinesIndices.length) {
       this.stopMovingDown()

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
    const gridFullToTheTop = this.state.grid[0].some((cell) => cell != ' ')
    let   pieceIsBeyondTop = false

    for(let i = 0; i < piece.length; i++) { // Iterate from top to bottom to find highest cell
      if(!piece[i].every((cell) => cell == ' ')) {
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
      const linesScore    = offsetY != 0 ? this.SCORE[offsetY-1] : 0
      const newScore      = this.state.score + linesScore * this.state.level
      const newLevel      = this.state.linesCount % 10 > newLinesCount % 10 ? this.state.level + 1 : this.state.level // only if it passes the upper ten (modulo hack)

      this.setState({
        grid:             newGrid,
        linesCount:       newLinesCount,
        score:            newScore,
        level:            newLevel,
        fullLinesIndices: []
      }, callback)
    }, 200)
  }

  colorForPosition(i, j) {
    let letter = ' '

    // If the cell is filled, use the corresponding color
    if(this.state.grid[i][j] !== ' ') {
      if(this.state.fullLinesIndices.includes(i)) {
        letter = 'x' // position that will imminently disappear
      }
      else {
        letter = this.state.grid[i][j]
      }
    }
    else { // if the cell is empty, use the color of the falling piece or ghost
      const pieceI = i - this.state.positionY
      const pieceJ = j - this.state.positionX

      const ghostI = i - this.state.ghostPositionY
      const ghostJ = pieceJ

      // Test if piece in that position
      if(this.state.piece[pieceI] && this.state.piece[pieceI][pieceJ]) {
        letter = this.state.piece[pieceI][pieceJ]
      }

      // If still no piece, test if ghost in that position
      if(letter == ' ' && this.state.piece[ghostI] && this.state.piece[ghostI][ghostJ]) {
        if(this.state.piece[ghostI][ghostJ] != ' ') {
          letter = 'g'
        }
      }
    }

    return Pieces.COLORS[letter]
  }

  next3Pieces() {
    // Take 3 next pieces from first bag (starting from last)
    let pieces = this.state.bags[0].slice(-3).reverse()

    // Merge the remaining pieces from next bag, still starting from last
    if(pieces.length < 3) {
      pieces = pieces.concat(
        this.state.bags[1].slice(-3 + pieces.length).reverse()
      )
    }

    // Need to call the function to generate piece
    pieces = pieces.map((piece) => piece())

    // Remove empty rows for better alignment
    pieces.forEach((piece) => {
      while(piece[0].every((cell) => cell == ' ')) {
        piece.shift() // remove from start (only 'i')
      }

      while(piece[piece.length - 1].every((cell) => cell == ' ')) {
        piece.pop() // remove from end (fast!)
      }
    })

    return pieces
  }

  render() {
    return (
      <div className="tetris-container">
        <div className="tetris">
          <div className="tetris-grid">
            { this.renderGrid() }
          </div>
          <div className="next-piece">
            <h2>Next</h2>
            { this.renderNextPieces() }
          </div>
        </div>
        { this.renderScore() }
        { this.renderGameOver() }
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
    const className = `cell ${key}`

    return (
      <div className={className} key={key} style={{ backgroundColor: this.colorForPosition(i, j) }}>
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
        <div className="game-over">
          Game Over
          <br/>
          <small>
            Press 'r' to try again
          </small>
        </div>
      )
    }
  }

  renderNextPieces() {
    return this.next3Pieces().map((piece, i) => {
      return (
        <div className="piece" key={i}>
          { piece.map((row, i) => this.renderPieceRow(row, i)) }
        </div>
      )
    })
  }

  renderPieceRow(row, i) {
    const key       = `piece-row-${i}`
    const className = `piece-row ${key}`

    return (
      <div className={className} key={key}>
        { row.map((cell, j) => this.renderPieceCell(cell, i, j)) }
      </div>
    )
  }

  renderPieceCell(cell, i, j) {
    const key       = `piece-cell-${i}-${j}`
    let className = `piece-cell ${key}`

    if(cell != ' ') {
      className = `${className} piece-cell-full`
    }

    return (
      <div className={className} key={key} style={{ backgroundColor: Pieces.COLORS[cell] }}>
        &nbsp;
      </div>
    )
  }
}

export default Tetris;
