function applySuggestions(minnie, game) {
  const thinker = document.querySelector(".thinker").classList;
  document
    .querySelectorAll(".suggested")
    .forEach((el) => el.classList.remove("suggested"));
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
        rows[ri].children[ci].classList.add("suggested");
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
    applySuggestions(minnie, game);
  }
}

function init() {
  const game = new MancalaGame();
  const minnie = new MinnieMax({
    applyMove: game.applyMove.bind(game),
    depth: 5,
    evaluate: game.evaluate.bind(game),
    generateMoves: game.generateMoves,
    isGameOver: game.isGameOver,
    maxMoves: 8,
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
        updateDOM(minnie, game);
      });
    });
  });
  // TODO: document.querySelector("")...
  // TODO: add "piece-selected" to .container
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
  // TODO
  applySuggestions(minnie, game);
}

// TODO: init();
