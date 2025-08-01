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
    // TODO
  }

  generateMoves(state, player) {
    // TODO
  }

  getState() {
    return this.history[this.history.length - 1];
  }

  isGameOver(state) {
    // TODO
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
