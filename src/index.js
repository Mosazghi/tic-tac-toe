"use strict";

const gameContainer = document.getElementById("game");
let roundStarted = false;
let hardMode = false;
let currentPlayer = "P";

/**
 * GameBoard module
 * @returns {Array} - getBoard
 * @returns {function} - setBoard
 * @returns {function} - resetBoard
 * @returns {number} - checkForEmptyCell
 */
const GameBoard = (() => {
  let board = ["", "", "", "", "", "", "", "", ""];

  const getBoard = () => board;

  const setBoard = (index, value) => {
    if (board[index] === "") {
      board[index] = value;
      DisplayController.updateAndRenderGameBoard();
      GameController.checkForRoundEnd();
    }
  };

  const resetBoard = () => {
    board.forEach((cell, index) => {
      board[index] = "";
    });
  };

  const checkForEmptyCell = () => {
    return board.reduce((amount, cell) => {
      if (cell === "") amount++;
      return amount;
    }, 0);
  };

  const emptyIndexes = (board) => {
    return board.filter((s) => s !== "O" && s !== "X");
  };

  return { getBoard, setBoard, resetBoard, checkForEmptyCell, emptyIndexes };
})();

/**
 * Display-controller module
 *
 * @returns {function} - updateAndRenderGameBoard
 * @returns {function} - displayWinner
 * @returns {function} - displayWinnerCombo
 */
const DisplayController = (() => {
  const createCell = (index) => {
    let cell = document.createElement("div");
    cell.dataset.index = index;
    cell.innerText = GameBoard.getBoard()[index];
    cell.classList.add(
      "cell",
      "text-8xl",
      `${cell.innerText === "X" ? "text-green-300" : "text-blue-300"}`,
      "flex",
      "justify-center",
      "border-r-4",
      "border-b-4",
      "items-center",
      "transition-all",
      "font-bold",
      "border-slate-900",
      "hover:bg-slate-300",
      "bg-slate-200",
      "cursor-pointer"
    );

    return cell;
  };

  const updateAndRenderGameBoard = () => {
    gameContainer.innerHTML = "";
    for (let i = 0; i < GameBoard.getBoard().length; i++) {
      const cell = createCell(i);
      gameContainer.appendChild(cell);
    }
  };

  const updateScore = (winner) => {
    const x = document.querySelector(".x-score");
    const o = document.querySelector(".o-score");
    if (winner === "X") {
      x.innerText = x.innerText ? parseInt(x.innerText) + 1 : 1;
    } else if (winner === "O") {
      o.innerText = o.innerText ? parseInt(o.innerText) + 1 : 1;
    }
  };

  const displayWinnerCombo = (combo) => {
    if (combo === null) return;

    gameContainer.childNodes.forEach((cell) => {
      if (combo.includes(parseInt(cell.dataset.index))) {
        cell.classList.add("bg-slate-300");
      }
    });
  };

  const displayWinner = (winner) => {
    updateScore(winner);
    const winnerDiv = document.getElementById("winnerDiv");
    winnerDiv.classList.remove("hidden");
    winnerDiv.innerText = winner === "tie" ? "It's a tie!" : `${winner} wins!`;

    const resetGameAndRemoveListener = () => {
      GameController.resetGame();
      winnerDiv.classList.add("hidden");
      winnerDiv.removeEventListener("click", resetGameAndRemoveListener);
    };

    // Add the event listener to the winnerDiv
    winnerDiv.addEventListener("click", resetGameAndRemoveListener);
  };

  window.addEventListener("load", updateAndRenderGameBoard);

  return { updateAndRenderGameBoard, displayWinner, displayWinnerCombo };
})();

/**
 * GameController module
 *
 * @returns {string, Array} - checkWinner
 * @returns {boolean} - checkTie
 * @returns {function} - resetGame
 * @returns {function} - declareWinner
 * @returns {function} - switchPlayerComputer
 * @returns {function} - checkForRoundEnd
 * @returns {function} - playGame
 */
const GameController = (() => {
  let isCasual = true;
  const resetBtn = document.getElementById("reset-button"); // the reset button
  const changeDiffBtn = document.getElementById("change-button");

  const checkWinner = () => {
    let winner = null;
    let winningCombo = [0, 0, 0];
    const winningCombos = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

    winningCombos.forEach((combo) => {
      const [a, b, c] = combo;
      if (
        GameBoard.getBoard()[a] && // if a is not empty
        GameBoard.getBoard()[a] === GameBoard.getBoard()[b] &&
        GameBoard.getBoard()[a] === GameBoard.getBoard()[c]
      ) {
        winner = GameBoard.getBoard()[a];
        winningCombo = combo;
      }
    });
    return { winner, winningCombo };
  };

  const checkTie = () => {
    return GameBoard.getBoard().every((cell) => cell !== "");
  };

  const resetGame = () => {
    currentPlayer = "P";
    GameBoard.resetBoard();
    roundStarted = false;
    DisplayController.updateAndRenderGameBoard();
  };

  const switchPlayerComputer = () => {
    const temp = Player.getMark();
    Player.setMark(Computer.getMark());
    Computer.setMark(temp);
  };

  const declareWinner = (winner, winningCombo) => {
    if (Player.getMark() === "O") switchPlayerComputer();
    DisplayController.displayWinner(winner);
    DisplayController.displayWinnerCombo(winningCombo);
  };

  const checkForRoundEnd = () => {
    let tie = GameController.checkTie();
    let winner = GameController.checkWinner().winner;
    let winningCombo = GameController.checkWinner().winningCombo;

    if (tie || winner) {
      roundStarted = false;
      winner ? declareWinner(winner, winningCombo) : declareWinner("tie", null);
    }
  };

  const playGame = (e) => {
    let playerIndex = 0;

    if (!roundStarted) {
      roundStarted = true;
    }

    playerIndex = e.target.dataset.index;

    if (!Player.hasDelay() && e.target.innerText === "") {
      currentPlayer = "P";
      GameBoard.setBoard(playerIndex, Player.getMark());
      currentPlayer = "C";
      Computer.move();
    } else {
      return;
    }

    if (!Player.hasDelay()) {
      Player.setDelay(true);
      setTimeout(() => {
        Player.setDelay(false);
      }, 1100);
    }
  };

  changeDiffBtn.addEventListener("click", () => {
    if (isCasual) {
      changeDiffBtn.innerText = "Unbeatable";
      changeDiffBtn.classList.add("bg-red-500");
      hardMode = true;
    } else {
      changeDiffBtn.innerText = "Casual";
      changeDiffBtn.classList.remove("bg-red-500");
      hardMode = false;
    }
    GameController.resetGame();
    isCasual = !isCasual;
  });

  resetBtn.addEventListener("click", resetGame);
  gameContainer.addEventListener("click", playGame);

  return {
    checkWinner,
    checkTie,
    resetGame,
    declareWinner,
    switchPlayerComputer,
    checkForRoundEnd,
    playGame,
  };
})();

/**
 * Player module
 *
 * @returns {string} - get Player's mark
 * @returns {function} - set Player's mark
 * @returns {boolean} - check if the Player has delay
 * @returns {function} - set the delay
 */
const Player = (() => {
  let mark = "X";
  let playerHasDelay = false;

  const getMark = () => mark;
  const setMark = (_mark) => (mark = _mark);
  const hasDelay = () => playerHasDelay;
  const setDelay = (delay) => (playerHasDelay = delay);

  return { getMark, setMark, hasDelay, setDelay };
})();

/**
 * Computer module
 *
 * @returns {string} - get Computer's mark
 * @returns {function} - set Computer's mark
 * @returns {function} - computer starts first
 * @returns {function} - computer makes a move
 */
const Computer = (() => {
  let mark = "O";
  const oBtn = document.querySelector(".o-button"); // the O button

  const getMark = () => mark;
  const setMark = (_mark) => (mark = _mark);

  const computerStartFirst = () => {
    if (!roundStarted) {
      currentPlayer = "C";
      roundStarted = true;
      Player.setMark("O");
      setMark("X");
      move();
    }
  };

  const move = () => {
    let unbeatableMove = 0;
    let availableCells = GameBoard.checkForEmptyCell();
    let index = Math.floor(Math.random() * 9); // random index

    if (availableCells) {
      while (GameBoard.getBoard()[index] !== "") {
        index = Math.floor(Math.random() * 9);
      }

      unbeatableMove = findBestMove(GameBoard.getBoard());
      if (roundStarted) {
        setTimeout(() => {
          GameBoard.setBoard(hardMode ? unbeatableMove : index, mark);
        }, 1100);
      }
    }
  };

  const findBestMove = (board) => {
    let bestScore = -Infinity;
    let move = 0;

    for (let i = 0; i < board.length; i++) {
      if (board[i] === "") {
        board[i] = getMark();
        let score = minimax(board, 0, false);
        board[i] = "";
        if (score > bestScore) {
          bestScore = score;
          move = i;
        }
      }
    }
    return move;
  };

  const minimax = (board, depth, isMaximizing) => {
    if (GameController.checkWinner().winner === getMark()) {
      return 10 - depth;
    } else if (GameController.checkWinner().winner === Player.getMark()) {
      return depth - 10;
    } else if (GameController.checkTie()) {
      return 0;
    }

    if (isMaximizing) {
      let bestScore = -Infinity;
      for (let i = 0; i < board.length; i++) {
        if (board[i] === "") {
          board[i] = getMark();
          let score = minimax(board, depth + 1, false);
          board[i] = "";
          bestScore = Math.max(score, bestScore);
        }
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (let i = 0; i < board.length; i++) {
        if (board[i] === "") {
          board[i] = Player.getMark();
          let score = minimax(board, depth + 1, true);
          board[i] = "";
          bestScore = Math.min(score, bestScore);
        }
      }
      return bestScore;
    }
  };

  oBtn.addEventListener("click", computerStartFirst);
  return { computerStartFirst, getMark, setMark, move };
})();
