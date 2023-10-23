import React from 'react'

class NextPieces extends React.PureComponent {
  next3Pieces() {
    // Take 3 next pieces from first bag (starting from last)
    let pieces = this.props.bags[0].slice(-3).reverse()

    // Merge the remaining pieces from next bag, still starting from last
    if(pieces.length < 3) {
      pieces = pieces.concat(
        this.props.bags[1].slice(-3 + pieces.length).reverse()
      )
    }

    // Need to call the function to generate piece
    pieces = pieces.map((piece) => piece())

    // Remove empty rows for better alignment
    pieces.forEach((piece) => {
      while(piece[0].every((cell) => cell === ' ')) {
        piece.shift() // remove from start (only 'i')
      }

      while(piece[piece.length - 1].every((cell) => cell === ' ')) {
        piece.pop() // remove from end (fast!)
      }
    })

    return pieces
  }

  render() {
    return(
      <div className="next-pieces">
        <h2>Next</h2>
        { this.renderNextPieces() }
      </div>
    )
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
    const key     = `piece-cell-${i}-${j}`
    let className = `piece-cell ${key} ${cell}`

    if(cell !== ' ') {
      className = `${className} piece-cell-full`
    }

    return (
      <div className={className} key={key}>
        &nbsp;
      </div>
    )
  }
}

export default NextPieces;
