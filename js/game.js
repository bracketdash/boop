const HISTORY_LOCALSTORAGE_KEY = "boophistory";

class BoopGame {
  constructor() {
    this.history = [
      {
        board: [
          ["e", "e", "e", "e", "e", "e"],
          ["e", "e", "e", "e", "e", "e"],
          ["e", "e", "e", "e", "e", "e"],
          ["e", "e", "e", "e", "e", "e"],
          ["e", "e", "e", "e", "e", "e"],
          ["e", "e", "e", "e", "e", "e"],
        ],
        pieces: [8, 0, 8, 0],
      },
    ];
    const storedHistory = localStorage?.getItem(HISTORY_LOCALSTORAGE_KEY);
    if (storedHistory) {
      let storedHistoryParsed;
      try {
        storedHistoryParsed = JSON.parse(storedHistory);
      } catch (e) {
        console.warn("Could not parse stored history.");
      }
      if (storedHistoryParsed) {
        this.history = storedHistoryParsed;
      } else {
        console.log("Starting a new game.");
      }
    } else {
      console.log("No stored history. Starting a new game.");
    }
  }

  applyMove(state, move) {
    // TODO: place the piece
    // TODO: checkpoint: if placing this piece results in all 8 of their big pieces on the board, stop here - the game is over!
    // TODO: push the surrounding little pieces away one space IF the space they'd move into is empty
    // TODO: if a piece is pushed off the board, add it back to state.pieces
    // TODO: if there are 3 little pieces in a row, convert them all to big pieces and put them back in state.pieces
    // TODO: if there are a mix of big and little pieces in a row, convert the little pieces to big and put them back in state.pieces
    // TODO: checkpoint: if there are 3 big pieces in a row, leave them be - the game is over!
  }

  evaluate(state, player) {
    const isPlayerOne = player === 1;
    const myLittle = isPlayerOne ? "o" : "t";
    const myBig = isPlayerOne ? "O" : "T";
    let numLittlesOnBoard = 0;
    let numBigsOnBoard = 0;
    state.board.forEach((row) => {
      row.forEach((cell) => {
        if (cell === myLittle) {
          numLittlesOnBoard++;
        } else if (cell === myBig) {
          numBigsOnBoard++;
        }
      });
    });
    let points =
      state.pieces[isPlayerOne ? 1 : 3] * 2 +
      numLittlesOnBoard +
      numBigsOnBoard * 3;
    if (
      numBigsOnBoard === 8 ||
      (numBigsOnBoard > 2 && this._findTriplets(state.board, myBig).length)
    ) {
      points += 10;
    }
    return points;
  }

  generateMoves(state, player) {
    const moves = [];
    const pieces = [];
    const isPlayerOne = player === 1;
    if (state.pieces[isPlayerOne ? 0 : 2] > 0) {
      pieces.push(isPlayerOne ? "o" : "t");
    }
    if (state.pieces[isPlayerOne ? 1 : 3] > 0) {
      pieces.push(isPlayerOne ? "O" : "T");
    }
    if (pieces.length) {
      pieces.forEach((piece) => {
        state.board.forEach((row, rowIndex) => {
          row.forEach((cell, cellIndex) => {
            if (cell === "e") {
              moves.push([rowIndex, cellIndex, piece]);
            }
          });
        });
      });
    }
    return moves;
  }

  getState() {
    return this.history[this.history.length - 1];
  }

  isGameOver(state) {
    let numOs = 0;
    let numTs = 0;
    state.board.forEach((row) => {
      row.forEach((cell) => {
        if (cell === "O") {
          numOs++;
        } else if (cell === "T") {
          numTs++;
        }
      });
    });
    if (numOs === 8 || numTs === 8) {
      return true;
    } else if (
      (numOs > 2 && this._findTriplets(state.board, "O").length) ||
      (numTs > 2 && this._findTriplets(state.board, "T").length)
    ) {
      return true;
    }
    return false;
  }

  pushState(state) {
    this.history.push(state);
    if (localStorage) {
      localStorage.setItem(
        HISTORY_LOCALSTORAGE_KEY,
        JSON.stringify(this.history)
      );
    }
  }

  undoMove() {
    if (this.history.length < 2) {
      return;
    }
    this.history.pop();
    if (localStorage) {
      localStorage.setItem(
        HISTORY_LOCALSTORAGE_KEY,
        JSON.stringify(this.history)
      );
    }
  }

  _findTriplets(state, piece, pieceAlt = null) {
    const rows = state.length;
    const cols = state[0].length;
    const matches = [];
    const directions = [
      [0, 1],
      [1, 0],
      [1, 1],
      [-1, 1],
    ];
    const isMatch = (cell) => {
      return cell === piece || (pieceAlt && cell === pieceAlt);
    };
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (!isMatch(state[r][c])) {
          continue;
        }
        for (let [dr, dc] of directions) {
          const sequence = [[r, c]];
          for (let i = 1; i < 3; i++) {
            const nr = r + dr * i;
            const nc = c + dc * i;
            if (
              nr >= 0 &&
              nr < rows &&
              nc >= 0 &&
              nc < cols &&
              isMatch(state[nr][nc])
            ) {
              sequence.push([nr, nc]);
            } else {
              break;
            }
          }
          if (sequence.length === 3) {
            matches.push(sequence);
          }
        }
      }
    }
    return matches;
  }
}
