import React from 'react';

import './css/styles.css';

class Tetris extends React.PureComponent {
  HEIGHT = 20;
  WIDTH  = 10;

  COLORS = {
    i:   'aqua',
    j:   'blue',
    l:   'orange',
    o:   'yellow',
    s:   'green',
    t:   'fuchsia',
    z:   'red',
    ' ': 'transparent'
  }

  constructor(props) {
    super(props)

    this.state = {
      grid:      this.initializeGrid(),
      piece:     this.randomPiece(),
      positionX: this.WIDTH/2,
      positionY: 0,
    }
  }

  componentDidMount() {
    this.bindKeyboard()

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
        break;
        default: return; // exit this handler for other keys
      }
      e.preventDefault() // prevent the default action (scroll / move caret)
    }
  }

  randomPiece() {
    const pieces = [this.i, this.j, this.l, this.o, this.s, this.t, this.z]
    const piece  = pieces[Math.floor(Math.random() * pieces.length)]

    return piece()
  }

  rotatePiece() {
    const piece = this.state.piece

    this.setState({ piece: piece[0].map((val, index) => piece.map(row => row[index]).reverse()) })
    //grid[0].map((val, index) => grid.map(row => row[row.length-1-index]));
  }

  i() {
    return [
      [' ', ' ', ' ', ' '],
      ['i', 'i', 'i', 'i'],
      [' ', ' ', ' ', ' '],
      [' ', ' ', ' ', ' ']
    ];
  }

  j() {
    return [
      ['j', ' ', ' '],
      ['j', 'j', 'j'],
      [' ', ' ', ' '],
    ];
  }

  l() {
    return [
      [' ', ' ', 'l'],
      ['l', 'l', 'l'],
      [' ', ' ', ' '],
    ];
  }

  o() {
    return [
      ['o', 'o'],
      ['o', 'o'],
    ];
  }

  s() {
    return [
      [' ', 's', 's'],
      ['s', 's', ' '],
      [' ', ' ', ' '],
    ];
  }

  t() {
    return [
      [' ', 't', ' '],
      ['t', 't', 't'],
      [' ', ' ', ' '],
    ];
  }

  z() {
    return [
      ['z', 'z', ' '],
      [' ', 'z', 'z'],
      [' ', ' ', ' '],
    ];
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

  moveDown() {
    if(this.state.positionY + this.state.piece.length < this.HEIGHT) {
      this.setState({ positionY: this.state.positionY + 1 })
    }
  }

  colorForPosition(i, j) {
    let letter = ' '

    if(this.state.grid[i][j] === ' ') { // nothing on the grid for now (except maybe the current piece)
      const pieceI = i - this.state.positionY
      const pieceJ = j - this.state.positionX

      if(this.state.piece[pieceI] && this.state.piece[pieceI][pieceJ]) {
        letter = this.state.piece[pieceI][pieceJ]
      }
    }
    else {
      letter = this.state.grid[i][j]
    }

    return this.COLORS[letter]
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
        &nbsp;
      </div>
    )
  }
}

export default Tetris;
