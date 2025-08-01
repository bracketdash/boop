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
    // TODO: set number of points (10) for 3 cats in a row (i.e. winning)
  }

  generateMoves(state, player) {
    // TODO: if player has at least one each of big and little pieces, there should be 2 X (empty cells on board) moves
    // TODO: if player has just little or just big pieces, the number of moves should be equal to the number of empty cells on the board
    // TODO: if player has no pieces available, return []; (this should skip their turn)
  }

  getState() {
    return this.history[this.history.length - 1];
  }

  isGameOver(state) {
    // TODO: return true if there are three of the same "O" or "T" in a row (vertical, horizontal, or diagonal)
    // TODO: return true if there are 8 "O" or 8 "T" total on the board
    // TODO: otherwise, return false
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
