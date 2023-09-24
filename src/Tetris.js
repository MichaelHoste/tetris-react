import React  from 'react';
import Pieces from './utils/Pieces';

import './css/styles.css';

class Tetris extends React.PureComponent {
  HEIGHT = 20
  WIDTH  = 10

  constructor(props) {
    super(props)

    this.state = {
      grid:      this.initializeGrid(),
      piece:     [[]], // empty 2D piece
      positionX: 0,
      positionY: 0,
    }
  }

  componentDidMount() {
    this.bindKeyboard()
    this.throwNewPiece()

    setInterval(this.moveDown.bind(this), 1000)
  }

  initializeGrid() {
    return Array.from({ length: this.HEIGHT }).map(() =>
      Array.from({ length: this.WIDTH }).fill(' ')
    )
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

  moveLeft() {
    if(this.state.positionX > 0) {
      this.setState({ positionX: this.state.positionX - 1 })
    }
  }

  moveRight() {
    if(this.state.positionX + this.state.piece[0].length < this.WIDTH) {
      this.setState({ positionX: this.state.positionX + 1 })
    }
  }

  canMoveDown() {
    const piece = this.state.piece
    const grid  = this.state.grid
    const x     = this.state.positionX
    const y     = this.state.positionY

    let canMove = true

    piece.forEach((pieceRow, i) => {
      pieceRow.forEach((pieceCell, j) => {
        if(pieceCell != ' ') {
          const piecePositionY = y + i
          if(piecePositionY + 1 >= this.HEIGHT || (piecePositionY + 1 >= 0 && grid[piecePositionY + 1][x + j] != ' ')) {
            canMove = false
          }
        }
      })
    })

    return canMove
  }

  moveDown() {
    if(this.canMoveDown()) {
      this.setState({ positionY: this.state.positionY + 1 })
    }
    else {
      this.mergePieceToGrid(() =>
        this.throwNewPiece()
      )
    }
  }

  mergePieceToGrid(callback) {
    const piece = this.state.piece
    const x     = this.state.positionX
    const y     = this.state.positionY

    // clone grid
    let grid  = this.state.grid.map((row) => Array.from(row))

    // Copy piece to new grid
    piece.forEach((pieceRow, i) => {
      pieceRow.forEach((pieceCell, j) => {
        if(pieceCell != ' ' &&  y + i >= 0) {
          grid[y + i][x + j] = pieceCell
        }
      })
    })

    this.setState({ grid: grid }, callback)
  }

  throwNewPiece() {
    this.setState({
      piece:     this.randomPiece(),
      positionX: this.WIDTH/2,
      positionY: -3
    })
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
