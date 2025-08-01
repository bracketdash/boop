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
    const next = {
      board: state.board.map((row) => row.slice()),
      pieces: state.pieces.slice(),
    };
    const pieceMap = ["o", "O", "t", "T"];
    next.pieces[pieceMap.indexOf(move[2])]--;
    next.board[move[0]][move[1]] = move[2];
    const pushedCells = [
      [-1, -1],
      [-1, 0],
      [-1, 1],
      [0, -1],
      [0, 1],
      [1, -1],
      [1, 0],
      [1, 1],
    ];
    pushedCells.forEach(([rowDelta, cellDelta]) => {
      const startingRow = move[0] + rowDelta;
      const startingCell = move[1] + cellDelta;
      if (
        startingRow < 0 ||
        startingRow > 5 ||
        startingCell < 0 ||
        startingCell > 5
      ) {
        return;
      }
      const targetCell = next.board[startingRow][startingCell];
      if (
        targetCell === "e" ||
        !(
          move[2] === "O" ||
          move[2] === "T" ||
          targetCell === "o" ||
          targetCell === "t"
        )
      ) {
        return;
      }
      const endingRow = startingRow + rowDelta;
      const endingCell = startingCell + cellDelta;
      if (endingRow < 0 || endingRow > 5 || endingCell < 0 || endingCell > 5) {
        next.board[startingRow][startingCell] = "e";
        next.pieces[pieceMap.indexOf(targetCell)]++;
      } else if (next.board[endingRow][endingCell] === "e") {
        next.board[startingRow][startingCell] = "e";
        next.board[endingRow][endingCell] = targetCell;
      }
    });
    const triplets = [
      ...this._findTriplets(next.board, ["o", "O"]),
      ...this._findTriplets(next.board, ["t", "T"]),
    ];
    if (!triplets.length) {
      return next;
    }
    if (
      !triplets.some((triplet) =>
        triplet.every((member) => member.p === "O" || member.p === "T")
      )
    ) {
      triplets[0].forEach(([r, c, p]) => {
        state.board[r][c] = "e";
        next.pieces[pieceMap.indexOf(p.toUpperCase())]++;
      });
    }
    return next;
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
      (numBigsOnBoard > 2 && this._findTriplets(state.board, [myBig]).length)
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
      (numOs > 2 && this._findTriplets(state.board, ["O"]).length) ||
      (numTs > 2 && this._findTriplets(state.board, ["T"]).length)
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

  _findTriplets(board, pieces) {
    const rows = board.length;
    const cols = board[0].length;
    const matches = [];
    const directions = [
      [0, 1],
      [1, 0],
      [1, 1],
      [-1, 1],
    ];
    const isMatch = (cell) => pieces.includes(cell);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (!isMatch(board[r][c])) {
          continue;
        }
        for (let [dr, dc] of directions) {
          const sequence = [[r, c, board[r][c]]];
          for (let i = 1; i < 3; i++) {
            const nr = r + dr * i;
            const nc = c + dc * i;
            if (
              nr >= 0 &&
              nr < rows &&
              nc >= 0 &&
              nc < cols &&
              isMatch(board[nr][nc])
            ) {
              sequence.push([nr, nc, board[nr][nc]]);
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
