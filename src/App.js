import React from 'react';

import './css/styles.css';

class Tetris extends React.PureComponent {
  HEIGHT = 20;
  WIDTH  = 10;

  constructor(props) {
    super(props)

    this.state = {
      grid: this.initializeGrid()
    }
  }

  render() { return }

  initializeGrid() {
    return Array.from({ length: this.HEIGHT }).map(() =>
      Array.from({ length: this.WIDTH }).fill('')
    )
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
    return (
      <div className="row" key={`row_${i}`}>
        { row.map((cell, i) => this.renderCell(cell, i)) }
      </div>
    )
  }

  renderCell(cell, i) {
    return (
      <div className="cell" key={`cell_${i}`}>
        &nbsp;
      </div>
    )
  }
}

export default Tetris;
