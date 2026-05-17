document.addEventListener("DOMContentLoaded", function () {
  const grid = document.querySelector(".grid");
  const flagsLeft = document.querySelector("#FLAGS");
  const result = document.querySelector("#result");
  // const bomb = document.querySelector(".bomb");
  // const tip_img = document.querySelector("#tip");
  const audio_lost = new Audio("bomb.mp3");
  const audio_click = new Audio("mark.mp3");
  const audio_switch = new Audio("switch.mp3");
  const audio_win = new Audio("win.mp3");
  const audio_flag = new Audio("flag.mp3");
  const audio_fadeIn = new Audio("fade-in.mp3");
  let width = 10;
  let bombAmount = 10;
  let tiles = [];
  let isGameOver = false;
  let flagsCount = bombAmount;
  let isFirstClick = true;
  let timer;
  let timeElapsed = 0;
  let showCooldown = false;

  function createBoard() {
    flagsLeft.innerHTML = flagsCount;
    grid.innerHTML = "";
    tiles = [];
    for (let i = 0; i < width * width; i++) {
      let square = document.createElement("div");
      square.setAttribute("id", i);
      square.classList.add("valid");
      grid.appendChild(square);
      tiles.push(square);
      square.addEventListener("click", () => firstClick(square));
      square.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        addFlag(square);
      });

      square.addEventListener("keydown", (event) => {
        if (event.code === "Space") {
          // addFlag(sqare); 
          console.log("test");
        }
      });

      square.addEventListener("mousedown", () =>
        square.classList.add("invert")
      );
      square.addEventListener("mouseup", () =>
        square.classList.remove("invert")
      );
    }
  }

  function firstClick(square) {
    if (isFirstClick) {
      isFirstClick = false;
      generateBombs(square.id);
      startTimer();
    }
    click(square);
  }

  function generateBombs(excludeId) {
    let bombArray = Array(bombAmount).fill("bomb");
    let emptyArray = Array(width * width - bombAmount).fill("valid");
    let gameArray = [...emptyArray, ...bombArray];

    do {
      gameArray = gameArray.sort(() => Math.random() - 0.5);
    } while (gameArray[excludeId] === "bomb");

    for (let i = 0; i < tiles.length; i++) {
      tiles[i].classList.remove("valid", "bomb");
      tiles[i].classList.add(gameArray[i]);
    }
    addNumbers();
  }

  function addNumbers() {
    for (let i = 0; i < tiles.length; i++) {
      let total = 0;
      if (tiles[i].classList.contains("valid")) {
        let isLeftEdge = i % width === 0;
        let isRightEdge = i % width === width - 1;

        if (i >= width && tiles[i - width].classList.contains("bomb")) total++;
        if (
          i < width * (width - 1) &&
          tiles[i + width].classList.contains("bomb")
        )
          total++;
        if (!isLeftEdge && tiles[i - 1].classList.contains("bomb")) total++;
        if (!isRightEdge && tiles[i + 1].classList.contains("bomb")) total++;

        if (
          !isLeftEdge &&
          i >= width &&
          tiles[i - width - 1].classList.contains("bomb")
        )
          total++;
        if (
          !isRightEdge &&
          i >= width &&
          tiles[i - width + 1].classList.contains("bomb")
        )
          total++;
        if (
          !isLeftEdge &&
          i < width * (width - 1) &&
          tiles[i + width - 1].classList.contains("bomb")
        )
          total++;
        if (
          !isRightEdge &&
          i < width * (width - 1) &&
          tiles[i + width + 1].classList.contains("bomb")
        )
          total++;

        tiles[i].setAttribute("data", total);
      }
    }
  }

  createBoard();

  function click(square) {
    audio_click.play();
    if (
      isGameOver ||
      square.classList.contains("checked") ||
      square.classList.contains("flag")
    )
      return;

    if (square.classList.contains("bomb")) {
      gameOver();
    } else {
      const total = square.getAttribute("data");
      square.classList.add("checked");
      if (total != 0) {
        square.innerHTML = total;
        square.classList.add(`number-${total}`);
        return;
      }
      checkSquare(square);
    }
  }

  function addFlag(square) {
    audio_flag.play();
    if (isGameOver || square.classList.contains("checked")) return;
    if (!square.classList.contains("flag") && flagsCount > 0) {
      square.classList.add("flag");
      square.innerHTML = '🚩' //`<img src="flag.png" alt="flag_sprite" class="flag-sprite">`;
      flagsCount--;
      flagsLeft.innerHTML = flagsCount;
    } else if (square.classList.contains("flag")) {
      square.classList.remove("flag");
      square.innerHTML = "";
      flagsCount++;
      flagsLeft.innerHTML = flagsCount;
    }
    checkWin();
  }

  function checkWin() {
    let matches = 0;
    tiles.forEach((square) => {
      if (
        square.classList.contains("flag") &&
        square.classList.contains("bomb")
      ) {
        matches++;
      }
    });
    if (matches === bombAmount) {
      isGameWon = true;
      isGameOver = true;
      setTimeout(() => {
        result.style.display = "flex";
        audio_win.play();
      }, 300);
      result.innerHTML = `<div class="game-over">GAME WON TIME: ${timeElapsed} BOMBS: ${flagsCount}</div>`;
      timeElapsed = 0;
      clearInterval(timer);
      tiles.forEach((square) => {
        if (square.classList.contains("bomb")) {
          square.innerHTML = `<img src="flag.png" alt="flag_sprite" class="flag-sprite">`;
        }
      });
    }
  }

  function checkSquare(square) {
    const currentId = parseInt(square.id);
    let isLeftEdge = currentId % width === 0;
    let isRightEdge = currentId % width === width - 1;
    let totaltiles = width * width;

    setTimeout(() => {
      audio_win.click();
      if (currentId > 0 && !isLeftEdge) click(tiles[currentId - 1]);
      if (currentId >= width && !isRightEdge)
        click(tiles[currentId + 1 - width]);
      if (currentId >= width) click(tiles[currentId - width]);
      if (currentId >= width && !isLeftEdge)
        click(tiles[currentId - 1 - width]);
      if (currentId < totaltiles - 1 && !isRightEdge)
        click(tiles[currentId + 1]);

      if (currentId < totaltiles - width && !isLeftEdge)
        click(tiles[currentId - 1 + width]);
      if (currentId < totaltiles - width) click(tiles[currentId + width]);
      if (currentId < totaltiles - width && !isRightEdge)
        click(tiles[currentId + 1 + width]);
    }, 10);
  }

  function resetBoard() {
    result.style.display = "none";

    isGameOver = false;
    isGameWon = false;
    flagsCount = bombAmount;
    isFirstClick = true;

    timeElapsed = 0;
    clearInterval(timer);
    document.querySelector("#timer").innerHTML = "0";

    restart.style.backgroundColor = "#2c2c2c";
    restart.style.transition = "background-color 0.5s ease-out";
    setTimeout(() => {
      restart.style.backgroundColor = "#ababab";
    }, 100);

    audio_switch.play();
    createBoard();
  }

  document.querySelector("#restart").addEventListener("click", resetBoard);

  function Cooldown() {
    let seconds = 59;
    let CountDown = setInterval(() => {
      document.getElementById("tip").innerText = `${seconds}`;
      seconds--;

      if (seconds < 0) {
        clearInterval(CountDown);
        document.getElementById("tip").innerText = "";
      }
    }, 1000);
  }

  function showBombs() {
    if (!showCooldown) {
      document.querySelectorAll(".bomb").forEach((bomb) => {
        bomb.style.transition = "background-color 0.5s ease-in-out";
        bomb.style.backgroundColor = "white";
        audio_fadeIn.play();
      });

      setTimeout(() => {
        document.querySelectorAll(".bomb").forEach((bomb) => {
          bomb.style.backgroundColor = "#ababab";
        });
      }, 500);

      tip.style.backgroundColor = "#2c2c2c";
      setTimeout(() => {
        tip.style.transition = "background-color 0.5s ease-out";
        tip.style.backgroundColor = "#ababab";
      }, 100);

      let overlay = document.createElement("div");
      overlay.id = "tip-overlay";
      overlay.style.position = "absolute";
      overlay.style.background = "rgba(0,0,0,0)";
      overlay.style.pointerEvents = "all";
      overlay.style.zIndex = "1000";

      let tipButton = document.querySelector("#tip");
      let rect = tipButton.getBoundingClientRect();

      overlay.style.width = `${rect.width}px`;
      overlay.style.height = `${rect.height}px`;
      overlay.style.top = `${rect.top + window.scrollY}px`;
      overlay.style.left = `${rect.left + window.scrollX}px`;

      document.body.appendChild(overlay);

      audio_switch.play();

      setTimeout(() => {
        document.getElementById("tip-overlay")?.remove();
      }, 60000);
    }
  }

  document.querySelector("#tip").addEventListener("click", showBombs);
  document.querySelector("#tip").addEventListener("click", Cooldown);

  document.querySelector("#mode1").addEventListener("click", function () {
    updateGameMode(10, 10, "400px", "400px");
    audio_switch.play();

    mode1.style.backgroundColor = "#2c2c2c";
    setTimeout(() => {
      mode1.style.transition = "background-color 0.5s ease-out";
      mode1.style.backgroundColor = "#ababab";
    }, 100);

    timeElapsed = 0;
    style.clearInterval(timer);
    document.querySelector("#timer").innerHTML = "0";

    result.style.display = "none";
  });

  document.querySelector("#mode2").addEventListener("click", function () {
    updateGameMode(20, 60, "800px", "800px");

    mode2.style.backgroundColor = "#2c2c2c";
    setTimeout(() => {
      mode2.style.transition = "background-color 0.5s ease-out";
      mode2.style.backgroundColor = "#ababab";
    }, 100);

    timeElapsed = 0;
    clearInterval(timer);
    document.querySelector("#timer").innerHTML = "0";

    result.style.display = "none";
    audio_switch.play();
  });

  document.querySelector("#mode3").addEventListener("click", function () {
    updateGameMode(30, 120, "1200px", "1200px");

    mode3.style.backgroundColor = "#2c2c2c";
    setTimeout(() => {
      mode3.style.transition = "background-color 0.5s ease-out";
      mode3.style.backgroundColor = "#ababab";
    }, 100);

    timeElapsed = 0;
    clearInterval(timer);

    document.querySelector("#timer").innerHTML = "0";
    result.style.display = "none";
    audio_switch.play();
  });

  function updateGameMode(
    newWidth,
    newBombAmount,
    newGridWidth,
    newGridHeight
  ) {
    result.innerHTML = "";
    width = newWidth;
    bombAmount = newBombAmount;
    isGameOver = false;
    isGameWon = false;
    flagsCount = bombAmount;
    isFirstClick = true;

    grid.style.width = newGridWidth;
    grid.style.height = newGridHeight;

    createBoard();
  }

  function gameOver() {
    isGameOver = true;
    setTimeout(() => {
      result.style.display = "flex";
    }, 2000);
    audio_lost.play();
    result.innerHTML = `<div class="game-over">GAME LOST TIME: ${timeElapsed} BOMBS: ${flagsCount}</div>`;
    document.querySelectorAll(".bomb").forEach((bomb) => {
      bomb.style.backgroundColor = "red";
    });
    tiles.forEach((square) => {
      if (square.classList.contains("bomb")) {
        square.innerHTML = `<img src="https://esraa-alaarag.github.io/Minesweeper/images/bomb.png" alt="Bomb" class="bomb-image">`;
        square.classList.add("checked");
        const bombImage = square.querySelector(".bomb-image");
        bombImage.style.opacity = "0";
        bombImage.style.transition = "opacity 0.5s ease-in-out";
        setTimeout(() => {
          bombImage.style.opacity = "1";
        }, 100);
        timeElapsed = 0;
        clearInterval(timer);
      }
    });
  }

  function startTimer() {
    timer = setInterval(() => {
      timeElapsed++;
      document.querySelector("#timer").innerHTML = `${timeElapsed}`;
    }, 1000);
  }
});
