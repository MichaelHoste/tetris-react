import React  from 'react';
import Pieces from './utils/Pieces';

import './css/styles.css';

class Tetris extends React.PureComponent {
  HEIGHT = 20
  WIDTH  = 10

  constructor(props) {
    super(props)

    this.state = {
      grid:      this.emptyGrid(),
      piece:     [[]], // empty 2D piece
      positionX: 0,
      positionY: 0,
    }

    this.moveDown = this.moveDown.bind(this)
  }

  componentDidMount() {
    this.bindKeyboard()
    this.throwNewPiece()
    this.startMovingDown()
  }

  emptyGrid() {
    return Array.from({ length: this.HEIGHT }).map(() =>
      Array.from({ length: this.WIDTH }).fill(' ')
    )
  }

  throwNewPiece() {
    const piece = this.randomPiece()

    this.setState({
      piece:     piece,
      positionX: parseInt((this.WIDTH - piece[0].length) / 2),
      positionY: -piece.length
    })
  }

  startMovingDown() {
    this.moveDownInterval = setInterval(this.moveDown, 1000)
  }

  stopMovingDown() {
    clearInterval(this.moveDownInterval)
  }

  bindKeyboard() {
    document.onkeydown = (e) => {
      switch(e.which) {
        case 37: this.moveLeft(); break;
        case 39: this.moveRight(); break;
        case 38: this.rotatePiece(); break; // up
        case 40: this.moveDown(); break;
        default: return; // exit this handler for other keys
      }
      e.preventDefault() // prevent the default action (scroll / move caret)
    }
  }

  randomPiece() {
    const pieces = [Pieces.i, Pieces.j, Pieces.l, Pieces.o, Pieces.s, Pieces.t, Pieces.z]
    const piece  = pieces[Math.floor(Math.random() * pieces.length)]

    return piece()
  }

  rotatePiece() {
    const piece = this.state.piece

    this.setState({ piece: piece[0].map((val, index) => piece.map(row => row[index]).reverse()) })
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
          else if(cellPositionY >= 0 && grid[cellPositionY][cellPositionX] != ' ') {                  // Test if overlap between plain piece cell and existing grid
            collision = true
          }
        }
      })
    })

    return collision
  }

  mergePieceToGrid(callback) {
    const piece = this.state.piece
    const x     = this.state.positionX
    const y     = this.state.positionY

    // clone grid
    let grid  = this.state.grid.map((row) => Array.from(row))

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

  moveLeft() {
    if(this.canMoveLeft()) {
      this.setState({ positionX: this.state.positionX - 1 })
    }
  }

  moveRight() {
    if(this.canMoveRight()) {
      this.setState({ positionX: this.state.positionX + 1 })
    }
  }

  moveDown() {
    if(this.canMoveDown()) {
      this.setState({ positionY: this.state.positionY + 1 })
    }
    else {
      this.mergePieceToGrid(() => {
        const completedLinesCount = this.completedLinesCount()

        if(completedLinesCount > 0) {
           this.stopMovingDown()

           console.log(completedLinesCount)

           this.setState({ completedLinesCount: completedLinesCount }, () => {
             this.clearLines(() => {
               this.startMovingDown()
             })
           })
        }

        this.throwNewPiece()
      })
    }
  }

  completedLinesCount() {
    let count = 0

    this.state.grid.forEach((row) => {
      if (!row.includes(' ')) {
        count += 1
      }
    })

    return count
  }

  clearLines(callback) {
    console.log("clearLines")

    setTimeout(() => {
      console.log("settimeout")
      let newGrid  = this.emptyGrid()
      const deltaY = this.state.completedLinesCount

      for(let i = 0; i < this.HEIGHT; i++) {
        for(let j = 0; j < this.WIDTH; j++) {
          if(i - deltaY >= 0) {
            newGrid[i][j] = this.state.grid[i-deltaY][j]
          }
        }
      }

      this.setState({ grid: newGrid }, callback)
    }, 300)
  }

  colorForPosition(i, j) {
    let letter = ' '

    // If the cell is filled, use the corresponding color
    if(this.state.grid[i][j] !== ' ') {
      letter = this.state.grid[i][j]
    }
    else { // if the cell is empty, use the color of the falling piece if any
      const pieceI = i - this.state.positionY
      const pieceJ = j - this.state.positionX

      if(this.state.piece[pieceI] && this.state.piece[pieceI][pieceJ]) {
        letter = this.state.piece[pieceI][pieceJ]
      }
    }

    return Pieces.COLORS[letter]
  }

  render() {
    return (
      <div className="tetris">
        { this.renderGrid() }
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
      </div>
    )
  }
}

export default Tetris;