function applySuggestions(minnie, game) {
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
}

function handleDepthChange(minnie, game, delta) {
  const currDepth = minnie.getDepth();
  const newDepth = minnie.setDepth(currDepth + delta);
  if (currDepth !== newDepth) {
    document.querySelector(".depth").innerHTML = newDepth;
    updateDOM(minnie, game);
  }
}

function init() {
  const game = new BoopGame();
  const minnie = new MinnieMax({
    applyMove: game.applyMove.bind(game),
    depth: 3,
    evaluate: game.evaluate.bind(game),
    generateMoves: game.generateMoves,
    isGameOver: game.isGameOver,
  });
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
        document.querySelector(".container").classList.remove("piece-selected");
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
          document.querySelector(".container").classList.add("piece-selected");
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
  const numberControl = document.querySelector(".number-control");
  numberControl.querySelector(".up").addEventListener("click", () => {
    handleDepthChange(minnie, game, 1);
  });
  numberControl.querySelector(".down").addEventListener("click", () => {
    handleDepthChange(minnie, game, -1);
  });
  document.querySelector(".undo").addEventListener("click", () => {
    game.undoMove();
    updateDOM(minnie, game);
  });
  document.querySelector(".depth").innerHTML = minnie.getDepth();
  updateDOM(minnie, game);
}

function updateDOM(minnie, game) {
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
  applySuggestions(minnie, game);
}

init();
