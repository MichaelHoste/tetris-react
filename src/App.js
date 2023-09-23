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
      positionX: 1,
      positionY: 4,
    }
  }

  componentDidMount() {
    setInterval(this.moveDown.bind(this), 1000)
  }

  initializeGrid() {
    return Array.from({ length: this.HEIGHT }).map(() =>
      Array.from({ length: this.WIDTH }).fill(' ')
    )
  }

  randomPiece() {
    const pieces = [this.i, this.j, this.l, this.o, this.s, this.t, this.z]
    const piece  = pieces[Math.floor(Math.random() * pieces.length)]

    return piece()
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

  moveDown() {
    this.setState({ positionY: this.state.positionY + 1 })
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
