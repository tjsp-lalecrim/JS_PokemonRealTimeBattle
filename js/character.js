class Character {
  constructor(props) {
    this.img = new Image();
    this.img.src = props.imgSrc;
    Object.assign(this, props);
  }

  rect() {
    return {
      left: this.posX,
      right: this.posX + this.img?.width ?? 0,
      top: this.posY,
      bottom: this.posY + this.img?.height ?? 0,
    };
  }

  update() {
    this.posX += this.directionX;
    this.posY += this.directionY;
  }

  shoot() {
    if (this.projectiles?.length >= this.maxProjectiles) return;

    // new projectile
    const projectile = new Projectile({
      color: this.projectileColor,
      posX: this.flipped ? this.posX + this.img.width : this.posX,
      posY: this.posY + this.img.height / 2,
      radius: 5,
      directionX: this.flipped ? 2 : -2,
      directionY: this.projectileDirection === 'horizontal' ? 0 : -1,
      collision: false,
    });

    this.projectiles.push(projectile);
  }
}

class Projectile {
  constructor(props) {
    Object.assign(this, props);
  }

  rect() {
    return {
      left: this.posX - this.radius,
      right: this.posX + this.radius,
      top: this.posY - this.radius,
      bottom: this.posY + this.radius,
    };
  }

  update() {
      this.posX += this.directionX;
      this.posY += this.directionY;
  }
}

const player = new Character({
  level: 1,
  health: 50,
  imgSrc: "assets/001.png",
  posX: 100,
  posY: 50,
  directionX: 0,
  directionY: 0,
  flipped: true,
  projectiles: [],
  maxProjectiles: 10,
  projectileColor: 'green',
  projectileDirection: 'horizontal',
  projectileMaxSpeed: 4,
});

const opponent = new Character({
  level: 1,
  health: 50,
  imgSrc: "assets/016.png",
  posX: 600,
  posY: 50,
  directionX: -2,
  directionY: 2,
  flipped: true,
  projectiles: [],
  maxProjectiles: 10,
  projectileColor: 'gray',
  projectileDirection: 'diagonal',
  projectileMaxSpeed: 4,
});
