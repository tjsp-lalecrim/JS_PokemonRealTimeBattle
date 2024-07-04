const BG_COLOR = "#EBF3E8";

window.onload = () => {
  // #region DOM
  const cnv = document.getElementById("game");
  const ctx = cnv.getContext("2d");

  let playerHealth = document.getElementById("player-health");
  let opponentHealth = document.getElementById("opponent-health");

  playerHealth.innerHTML = player.health;
  opponentHealth.innerHTML = opponent.health;

  gameOver = false;

  // #endregion

  // #region render
  function renderBackground(bgColor) {
    ctx.save();
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, cnv.width, cnv.height);
    ctx.restore();
  }

  function renderImage(
    img,
    sx,
    sy,
    sWidth,
    sHeight,
    dx,
    dy,
    dWidth,
    dHeight,
    flipped
  ) {
    ctx.save();
    if (flipped) ctx.scale(-1, 1);
    ctx.drawImage(
      img,
      sx,
      sy,
      sWidth,
      sHeight,
      dx * (flipped ? -1 : 1),
      dy,
      dWidth * (flipped ? -1 : 1),
      dHeight
    );
    ctx.restore();
  }

  function renderCircle(color, x, y, radius) {
    ctx.save();
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.restore();
  }

  function renderProjectiles(projectiles) {
    projectiles.forEach((projectile) => {
      renderCircle(
        projectile.color,
        projectile.posX,
        projectile.posY,
        projectile.radius
      );
    });
  }

  function renderCharacter(char) {
    renderImage(
      char.img,
      0,
      0,
      char.img.width,
      char.img.height,
      char.posX,
      char.posY,
      char.img.width,
      char.img.height,
      char.flipped
    );

    renderProjectiles(char.projectiles);
  }

  function renderGameOver() {
    ctx.save();
    ctx.fillStyle = "red";
    ctx.fillRect(0, 0, cnv.width, cnv.height);
    ctx.fillStyle = "white";
    ctx.font = "50px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Game Over", cnv.width / 2, cnv.height / 2);
    ctx.restore();
  }

  function renderVictory() {
    ctx.save();
    ctx.fillStyle = "blue";
    ctx.fillRect(0, 0, cnv.width, cnv.height);
    ctx.fillStyle = "white";
    ctx.font = "50px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Victory", cnv.width / 2, cnv.height / 2);
    ctx.restore();
  }

  function render() {
    if (gameOver) {
      return;
    }

    renderBackground(BG_COLOR);
    renderCharacter(player);
    renderCharacter(opponent);
  }
  // #endregion

  // #region update
  function validateCharacterPosition(char) {
    if (char.posX < 0) {
      char.posX = 0;
    }
    if (char.posX + char.img.width > cnv.width) {
      char.posX = cnv.width - char.img.width;
    }
    if (char.posY < 0) {
      char.posY = 0;
    }
    if (char.posY + char.img.height > cnv.height) {
      char.posY = cnv.height - char.img.height;
    }
  }

  function updatePlayer() {
    player.update();
    validateCharacterPosition(player);
    updateProjectiles(player, opponent);
  }

  function updateOpponent() {
    if (opponent.posX <= 0) {
      opponent.directionX = -opponent.directionX;
    }
    if (opponent.posX >= cnv.width - opponent.img.width) {
      opponent.directionX = -opponent.directionX;
    }
    if (opponent.posY <= 0) {
      opponent.directionY = -opponent.directionY;
    }
    if (opponent.posY >= cnv.height - opponent.img.height) {
      opponent.directionY = -opponent.directionY;
    }
    if (opponent.posX < player.posX) {
      opponent.flipped = true;
    }
    if (opponent.posX > player.posX) {
      opponent.flipped = false;
    }
    if (
      opponent.posY === player.posY ||
      opponent.posY === player.posY + player.img.height
    ) {
      opponent.shoot();
    }

    opponent.update();
    updateProjectiles(opponent, player);
  }

  function updateProjectiles(char, target) {
    // update position and collision
    char.projectiles.forEach((projectile) => {

      if (char.projectileDirection === 'diagonal') {
        if (projectile.rect().top > 0 && projectile.rect().top < projectile.radius) {
          projectile.directionY = -2 * projectile.directionY;
        }

        if (projectile.rect().left > 0 && projectile.rect().left < projectile.radius) {
          projectile.directionX = -2 * projectile.directionX;
        }

        if (projectile.rect().right < cnv.width && projectile.rect().right > cnv.width - projectile.radius ) {
          projectile.directionX = -2 * projectile.directionX;
        }

        if (projectile.rect().bottom < cnv.height && projectile.rect().bottom > cnv.height - projectile.radius) {
          projectile.directionY = -2 * projectile.directionY;
        }
      }

      projectile.update();
      projectile.collision = collision(projectile.rect(), target.rect());
      if (projectile.collision) {
        target.health -= 10;
        playerHealth.innerHTML = player.health;
        opponentHealth.innerHTML = opponent.health;
      }
    });

    // clear projectiles
    char.projectiles = [
      ...char.projectiles.filter((projectile) => {
        return (
          projectile.posX > 0 &&
          projectile.posX < cnv.width &&
          !projectile.collision && 
          Math.abs(projectile.directionX) <= char.projectileMaxSpeed &&
          Math.abs(projectile.directionY) < char.projectileMaxSpeed
        );
      }),
    ];
  }

  function update() {
    if (gameOver) {
      return;
    }

    updatePlayer();
    updateOpponent();

    if (player.health <= 0) {
      return handleGameOver();
    }

    if (opponent.health <= 0) {
      return handleVictory();
    }
  }

  function handleGameOver() {
    gameOver = true;
    renderGameOver();
  }
  // #endregion

  // #region loop
  function loop() {
    update();
    render();
    requestAnimationFrame(loop);
  }

  function handleVictory() {
    gameOver = true;
    renderVictory();
  }
  // #endregion

  // #region game
  function init() {
    loop();
  }

  init();
  // #endregion

  // #region events
  document.addEventListener("keydown", (event) => {
    const key = event.key;

    if (key === "ArrowLeft") {
      player.directionX = -2;
      player.flipped = false;
    }
    if (key === "ArrowRight") {
      player.directionX = 2;
      player.flipped = true;
    }
    if (key === "ArrowUp") {
      player.directionY = -2;
    }
    if (key === "ArrowDown") {
      player.directionY = 2;
    }
    if (key === "Control") {
      player.shoot();
    }
  });

  document.addEventListener("keyup", (event) => {
    const key = event.key;

    if (key === "ArrowLeft" || key === "ArrowRight") {
      player.directionX = 0;
    }
    if (key === "ArrowUp" || key === "ArrowDown") {
      player.directionY = 0;
    }
  });
  // #endregion
};
