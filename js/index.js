const BG_COLOR = "#EBF3E8";

window.onload = () => {
  // #region DOM
  const cnv = document.getElementById("game");
  const ctx = cnv.getContext("2d");

  const playerHealth = document.getElementById("player-health");
  const opponentHealth = document.getElementById("opponent-health");

  let gameOver = false;

  playerHealth.innerHTML = player.health;
  opponentHealth.innerHTML = opponent.health;
  // #endregion

  // #region Render Functions
  function renderBackground(bgColor) {
    ctx.save();
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, cnv.width, cnv.height);
    ctx.restore();
  }

  function renderImage(img, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight, flipped) {
    ctx.save();
    if (flipped) ctx.scale(-1, 1);
    ctx.drawImage(img, sx, sy, sWidth, sHeight, dx * (flipped ? -1 : 1), dy, dWidth * (flipped ? -1 : 1), dHeight);
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
    projectiles.forEach(projectile => {
      renderCircle(projectile.color, projectile.posX, projectile.posY, projectile.radius);
    });
  }

  function renderCharacter(char) {
    renderImage(char.img, 0, 0, char.img.width, char.img.height, char.posX, char.posY, char.img.width, char.img.height, char.flipped);
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
    if (gameOver) return;

    renderBackground(BG_COLOR);
    renderCharacter(player);
    renderCharacter(opponent);
  }
  // #endregion

  // #region Update Functions
  function validateCharacterPosition(char) {
    char.posX = Math.max(0, Math.min(char.posX, cnv.width - char.img.width));
    char.posY = Math.max(0, Math.min(char.posY, cnv.height - char.img.height));
  }

  function updateProjectilePosition(projectile, projectileDirection) {
    if (projectileDirection === 'diagonal') {
      if (projectile.rect().top > 0 && projectile.rect().top < projectile.radius) {
        projectile.directionY = -2 * projectile.directionY;
      }

      if (projectile.rect().left > 0 && projectile.rect().left < projectile.radius) {
        projectile.directionX = -2 * projectile.directionX;
      }

      if (projectile.rect().right < cnv.width && projectile.rect().right > cnv.width - projectile.radius) {
        projectile.directionX = -2 * projectile.directionX;
      }

      if (projectile.rect().bottom < cnv.height && projectile.rect().bottom > cnv.height - projectile.radius) {
        projectile.directionY = -2 * projectile.directionY;
      }
    }
  }

  function updateProjectileCollision(projectile, target) {
    if (collision(projectile.rect(), target.rect())) {
      target.health -= 10;
      playerHealth.innerHTML = player.health;
      opponentHealth.innerHTML = opponent.health;
      projectile.collision = true;
    }
  }

  function filterCharProjectiles(char) {
    char.projectiles = char.projectiles.filter(projectile =>
      projectile.posX > 0 &&
      projectile.posX < cnv.width &&
      !projectile.collision &&
      Math.abs(projectile.directionX) <= char.projectileMaxSpeed &&
      Math.abs(projectile.directionY) < char.projectileMaxSpeed
    );
  }

  function updateCharactersAndProjectiles(char, target) {
    char.projectiles.forEach(projectile => {
      updateProjectilePosition(projectile, char.projectileDirection);
      projectile.update();
      updateProjectileCollision(projectile, target);
    });

    filterCharProjectiles(char);
  }

  function updatePlayer() {
    player.update();
    validateCharacterPosition(player);
    updateCharactersAndProjectiles(player, opponent);
  }

  function updateOpponent() {
    if (opponent.posX <= 0 || opponent.posX >= cnv.width - opponent.img.width) {
      opponent.directionX = -opponent.directionX;
    }
    if (opponent.posY <= 0 || opponent.posY >= cnv.height - opponent.img.height) {
      opponent.directionY = -opponent.directionY;
    }
    opponent.flipped = opponent.posX < player.posX;
    if (opponent.posY === player.posY || opponent.posY === player.posY + player.img.height) {
      opponent.shoot();
    }

    opponent.update();
    updateCharactersAndProjectiles(opponent, player);
  }

  function update() {
    if (gameOver) return;

    updatePlayer();
    updateOpponent();

    if (player.health <= 0) {
      handleGameOver();
    }

    if (opponent.health <= 0) {
      handleVictory();
    }
  }

  function handleGameOver() {
    gameOver = true;
    renderGameOver();
  }

  function handleVictory() {
    gameOver = true;
    renderVictory();
  }
  // #endregion

  // #region Game Loop
  function loop() {
    update();
    render();
    requestAnimationFrame(loop);
  }

  function init() {
    loop();
  }

  init();
  // #endregion

  // #region Event Handlers
  document.addEventListener("keydown", event => {
    switch (event.key) {
      case "ArrowLeft":
        player.directionX = -2;
        player.flipped = false;
        break;
      case "ArrowRight":
        player.directionX = 2;
        player.flipped = true;
        break;
      case "ArrowUp":
        player.directionY = -2;
        break;
      case "ArrowDown":
        player.directionY = 2;
        break;
      case "Control":
        player.shoot();
        break;
    }
  });

  document.addEventListener("keyup", event => {
    switch (event.key) {
      case "ArrowLeft":
      case "ArrowRight":
        player.directionX = 0;
        break;
      case "ArrowUp":
      case "ArrowDown":
        player.directionY = 0;
        break;
    }
  });
  // #endregion
};
