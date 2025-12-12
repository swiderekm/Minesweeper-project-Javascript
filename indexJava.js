const container = document.querySelector("#container");
let allowSpriteCreation = true;

function createSeamineSprite() {
  if (allowSpriteCreation) {
    allowSpriteCreation = false;

    const sprite = document.createElement("div");
    sprite.classList.add("seamine-sprite");
    sprite.style.left = `${Math.random() * 1200}px`;

    if (Math.random() < 0.5) {
      sprite.style.filter = "blur(5px)";
    }

    container.appendChild(sprite);

    setTimeout(() => {
      allowSpriteCreation = true;
    }, 3000);
  }
}

setInterval(createSeamineSprite, 2200);

document.addEventListener("DOMContentLoaded", function () {
  const container = document.querySelector(".grid-container");
  const rows = 20;
  const cols = 30;

  for (let i = 0; i < rows * cols; i++) {
    let cell = document.createElement("div");
    cell.classList.add("grid-item");
    container.appendChild(cell);
  }
});
