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
    // TODO
  }

  evaluate(state, player) {
    // TODO: points for number of kittens on board (1 each)
    // TODO: points for number of cats available (2 each)
    // TODO: points for number of cats on board (3 each)
    // TODO: set number of points (10) for 3 cats in a row (i.e. winning) or 8 cats total
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
    } else if (numOs > 2) {
      // TODO: find out if there are three "O" in a row (if so, return true)
    } else if (numTs > 2) {
      // TODO: find out if there are three "T" in a row (if so, return true)
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
}
