class Pieces {
  static COLORS = {
    i:   'aqua',
    j:   '#6868ff', // blue
    l:   'orange',
    o:   'yellow',
    s:   '#17dc17', // green
    t:   'fuchsia',
    z:   'red',
    x:   'whitesmoke', // position that will imminently disappear
    g:   '#555555',    // Ghost (lowest position of current piece)
    ' ': ''            // empty position
  }

  static i() {
    return [
      [' ', ' ', ' ', ' '],
      ['i', 'i', 'i', 'i'],
      [' ', ' ', ' ', ' '],
      [' ', ' ', ' ', ' ']
    ];
  }

  static j() {
    return [
      ['j', ' ', ' '],
      ['j', 'j', 'j'],
      [' ', ' ', ' '],
    ];
  }

  static l() {
    return [
      [' ', ' ', 'l'],
      ['l', 'l', 'l'],
      [' ', ' ', ' '],
    ];
  }

  static o() {
    return [
      ['o', 'o'],
      ['o', 'o'],
    ];
  }

  static s() {
    return [
      [' ', 's', 's'],
      ['s', 's', ' '],
      [' ', ' ', ' '],
    ];
  }

  static t() {
    return [
      [' ', 't', ' '],
      ['t', 't', 't'],
      [' ', ' ', ' '],
    ];
  }

  static z() {
    return [
      ['z', 'z', ' '],
      [' ', 'z', 'z'],
      [' ', ' ', ' '],
    ];
  }
}

export default Pieces
