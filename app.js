function findTriplets(board, pieces) {
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

new MinnieMax({
  el: document.querySelector(".minniemax"),
  localStorageKey: "boophelper",
  initialMovesAhead: 3,
  initialState: {
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
  getMoves: ({ state, player }) => {
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
  },
  getNextState: ({ state, player, move }) => {
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
      ...findTriplets(next.board, ["o", "O"]),
      ...findTriplets(next.board, ["t", "T"]),
    ];
    if (!triplets.length) {
      return next;
    }
    // TODO: we are somehow losing pieces somewhere around here
    if (
      !triplets.some((triplet) =>
        triplet.every((member) => member.p === "O" || member.p === "T")
      )
    ) {
      triplets[0].forEach(([r, c, p]) => {
        next.board[r][c] = "e";
        next.pieces[pieceMap.indexOf(p.toUpperCase())]++;
      });
    }
    return { state: next, player: player === 1 ? 2 : 1 };
  },
  getStateScore: ({ state, player, movesRemaining }) => {
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
      (numBigsOnBoard > 2 && findTriplets(state.board, [myBig]).length)
    ) {
      points += 10000 + movesRemaining;
    }
    if (
      numBigsOnBoard > 2 &&
      findTriplets(state.board, [myBig === "O" ? "T" : "O"]).length
    ) {
      points -= 10000 + movesRemaining;
    }
    return points;
  },
  isGameOver: ({ state }) => {
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
      (numOs > 2 && findTriplets(state.board, ["O"]).length) ||
      (numTs > 2 && findTriplets(state.board, ["T"]).length)
    ) {
      return true;
    }
    return false;
  },
  onChange: ({ minnie }) => {
    // TODO: adapt to minniemax2
    const state = game.getState();
    const rows = document.querySelectorAll(".row");
    state.board.forEach((row, rowIndex) => {
      row.forEach((cell, cellIndex) => {
        const classes = rows[rowIndex].children[cellIndex].classList;
        classes.remove("empty", "little", "big", "one", "two", "suggested");
        switch (cell) {
          case "e":
            classes.add("empty");
            break;
          case "o":
            classes.add("little", "one");
            break;
          case "t":
            classes.add("little", "two");
            break;
          case "O":
            classes.add("big", "one");
            break;
          case "T":
            classes.add("big", "two");
            break;
        }
      });
    });
    const pieces = document.querySelector(".pieces");
    [0, 1].forEach((playerIndex) => {
      Array.from(pieces.children[playerIndex].children).forEach(
        (piece, pieceIndex) => {
          const classes = piece.classList;
          classes.remove("little", "big", "selected", "suggested");
          const littles = state.pieces[2 * playerIndex];
          if (littles > pieceIndex) {
            classes.add("little");
          } else if (littles + state.pieces[2 * playerIndex + 1] > pieceIndex) {
            classes.add("big");
          }
        }
      );
    });
    const thinker = document.querySelector(".thinker").classList;
    thinker.add("active");
    console.time("thinking");
    requestAnimationFrame(() => {
      setTimeout(() => {
        const rows = Array.from(document.querySelectorAll(".row"));
        const state = game.getState();
        [1, 2].forEach((player) => {
          const [ri, ci, piece] = minnie
            .getScoredMoves(state, player)
            .sort((a, b) => (a.score <= b.score ? 1 : -1))[0].move;
          rows[ri].children[ci].classList.add(
            "suggested",
            piece === "o" || piece === "O" ? "one" : "two"
          );
          document
            .querySelector(
              `.pieces > div:nth-child(${player}) .${
                piece === "O" || piece === "T" ? "big" : "little"
              }`
            )
            .classList.add("suggested");
        });
        thinker.remove("active");
        console.timeEnd("thinking");
      }, 1);
    });
  },
  onReady: ({ minnie }) => {
    // TODO: adapt to minniemax2
    let selectedPiece = false;
    document.querySelectorAll(".row").forEach((row, ri) => {
      Array.from(row.children).forEach((cell, ci) => {
        cell.addEventListener("click", () => {
          if (!selectedPiece || !cell.classList.contains("empty")) {
            return;
          }
          const state = game.getState();
          if (game.isGameOver(state)) {
            return;
          }
          game.pushState(game.applyMove(state, [ri, ci, selectedPiece]));
          document
            .querySelector(".container")
            .classList.remove("piece-selected");
          selectedPiece = false;
          updateDOM(minnie, game);
        });
      });
    });
    document.querySelectorAll(".pieces > div").forEach((hand, playerIndex) => {
      hand.querySelectorAll("div").forEach((piece) => {
        piece.addEventListener("click", ({ target }) => {
          const classes = target.classList;
          if (!classes.contains("big") && !classes.contains("little")) {
            return;
          }
          if (selectedPiece) {
            document.querySelector(".selected").classList.remove("selected");
          } else {
            document
              .querySelector(".container")
              .classList.add("piece-selected");
          }
          if (classes.contains("little")) {
            selectedPiece = playerIndex ? "t" : "o";
          } else {
            selectedPiece = playerIndex ? "T" : "O";
          }
          target.classList.add("selected");
        });
      });
    });
    updateDOM(minnie, game);
  },
});
