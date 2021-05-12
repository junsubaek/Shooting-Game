const canvas = document.querySelector("#canvas1");
const ctx = canvas.getContext("2d");
const aimImg = new Image();
const heroImg = new Image();
const heroProjectileImg = new Image();
const ultimateImg = new Image();
const weakEnemyImg = new Image();
const strongEnemyImg = new Image();
const strongEnemyProjectileImg = new Image();
const bossImg = new Image();
const bossProjectileImg = new Image();
const bossUltimateImg = new Image();
const bossUltimateParticleImg = new Image();
const resourceImg = new Image();
const backGroundImg = new Image();
const explosionImg = new Image();
const flameImg = new Image();

aimImg.src = "image/aim.png";
heroImg.src = "image/hero.png";
heroProjectileImg.src = "image/heroProjectile.png";
ultimateImg.src = "image/ultimate.png";
weakEnemyImg.src = "image/weakEnemy.png";
strongEnemyImg.src = "image/strongEnemy.png";
strongEnemyProjectileImg.src = "image/strongEnemyProjectile.png";
bossImg.src = "image/boss.png";
bossProjectileImg.src = "image/bossProjectile.png";
bossUltimateParticleImg.src = "image/bossUltimateParticle.png";
bossUltimateImg.src = "image/bossUltimate.png";
resourceImg.src = "image/resource.png";
backGroundImg.src = "image/background.png";
explosionImg.src = "image/explosion.png";
flameImg.src = "image/flameImg.png";

const gameImages = {};

const gameInfo = {
  hero: undefined,
  aim: undefined,
  projectiles: [],
  ultimate: [],
  weakEnemy: [],
  strongEnemy: [],
  strongEnemyProjectiles: [],
  boss: undefined,
  bossProjectiles: [],
  bossUltimates: [],
  bossUltimatePosition: undefined,
  bossUltimateParticle: [],
  resources: [],
  statusBoard: undefined,
  message: undefined,
  backGroundImgStart: 0,
  explosions: [],
};

const gameCount = {
  projectiles: 0,
  weakEnemy: 0,
  strongEnemy: 0,
  strongEnemyProjectile: 0,
  bossProjectiles: 0,
  bossUltimate: 0,
  resource: 0,
};

const keyboardEvents = {
  pressedKeyA: false,
  pressedKeyD: false,
  pressedKeyS: false,
  pressedLeft: false,
  pressedRight: false,
  pressedUp: false,
  pressedDown: false,
};

const gameFlag = {
  gameOver: false,
  win: false,
  readyUltimate: false,
  shoot: false,
  bossAppearance: false,
  existBoss: false,
  explosion: false,
  hit: false,
};
const heroBulletEffectSoundArray = [];
let weakEnemyCountControl = 500;

let playing = false;
let i = 0;

canvas.width = canvas.parentNode.clientWidth;
canvas.height = canvas.parentNode.clientHeight;

window.addEventListener("keydown", (e) => {
  if (e.code === "Enter") {
    if (gameFlag.gameOver || gameFlag.win) {
      resetGameData();
      init();
      animate();
    }
  }
  if (e.code === "KeyA") keyboardEvents.pressedKeyA = true;
  if (e.code === "KeyS") keyboardEvents.pressedKeyS = true;
  if (e.code === "KeyD") keyboardEvents.pressedKeyD = true;
  if (e.code === "ArrowLeft") keyboardEvents.pressedLeft = true;
  if (e.code === "ArrowRight") keyboardEvents.pressedRight = true;
  if (e.code === "ArrowUp") keyboardEvents.pressedUp = true;
  if (e.code === "ArrowDown") keyboardEvents.pressedDown = true;
});

window.addEventListener("keyup", (e) => {
  if (e.code === "KeyA") keyboardEvents.pressedKeyA = false;
  if (e.code === "KeyS") {
    keyboardEvents.pressedKeyS = false;
  }

  if (e.code === "KeyD") keyboardEvents.pressedKeyD = false;
  if (e.code === "ArrowLeft") keyboardEvents.pressedLeft = false;
  if (e.code === "ArrowRight") keyboardEvents.pressedRight = false;
  if (e.code === "ArrowUp") keyboardEvents.pressedUp = false;
  if (e.code === "ArrowDown") keyboardEvents.pressedDown = false;
});

class Hero {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 180;
    this.height = 70;
    this.weight = 4;
    this.hp = 100;
    this.ultimate = 0;
    this.ultimateCharge = 0;
  }

  update() {
    if (this.y > canvas.height - this.height) {
      this.y = canvas.height - this.height;
    }

    if (keyboardEvents.pressedKeyD) {
      if (this.y < gameInfo.statusBoard.height + 10)
        this.y = gameInfo.statusBoard.height + 10;
      this.jump();
    }

    this.y += this.weight;

    if (keyboardEvents.pressedLeft) {
      this.move("left");
    }
    if (keyboardEvents.pressedRight) {
      this.move("right");
    }
    this.draw();
  }

  move(direction) {
    if (direction === "left") {
      if (this.x < 0) return;
      this.x -= 4;
    }
    if (direction === "right") {
      if (this.x > canvas.width - this.width) return;
      this.x += 4;
    }
  }

  jump() {
    this.y -= 15;
  }

  draw() {
    ctx.drawImage(heroImg, this.x, this.y, this.width, this.height);
  }
}

const heroHandler = () => {
  const startPointX = 50;
  const startPointY = canvas.height - 150;
  gameInfo.hero = new Hero(startPointX, startPointY);
};

class Aim {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.x2 = 0;
    this.y2 = 0;
    this.width = 20;
    this.height = 20;
    this.angle = 270;
    this.aimDistanceX = 240;
    this.aimDistanceY = 40;
    this.aimDistanceX2 = canvas.width * 2;
    this.aimDistanceY2 = 40;
  }

  update(hero) {
    this.x = hero.x + this.aimDistanceX;
    this.y = hero.y + this.aimDistanceY;
    this.x2 = hero.x + this.aimDistanceX2;
    this.y2 = hero.y + this.aimDistanceY2;

    if (keyboardEvents.pressedUp && this.angle > 230) {
      this.angle--;
      this.aimDistanceX += Math.cos((this.angle * Math.PI) / 180);
      this.aimDistanceY += Math.sin((this.angle * Math.PI) / 180);
      this.aimDistanceX2 += Math.cos((this.angle * Math.PI) / 180) * 40;
      this.aimDistanceY2 += Math.sin((this.angle * Math.PI) / 180) * 40;
    }

    if (keyboardEvents.pressedDown && this.angle < 300) {
      this.angle++;
      this.aimDistanceX -= Math.cos((this.angle * Math.PI) / 180);
      this.aimDistanceY -= Math.sin((this.angle * Math.PI) / 180);
      this.aimDistanceX2 -= Math.cos((this.angle * Math.PI) / 180) * 40;
      this.aimDistanceY2 -= Math.sin((this.angle * Math.PI) / 180) * 40;
    }
    this.draw();
  }

  draw() {
    ctx.drawImage(aimImg, this.x, this.y, this.width, this.height);
  }
}

const aimHandler = () => {
  gameInfo.aim = new Aim();
};

class Projectile {
  constructor(x, y) {
    this.x = gameInfo.hero.x + 200;
    this.y = gameInfo.hero.y + 35;
    this.aimX = x;
    this.aimY = y;
    this.radius = 10;
    this.width = 30;
    this.height = 30;
  }

  update() {
    const angle = Math.atan2(this.aimY - this.y, this.aimX - this.x);
    this.x += Math.cos(angle) * 10;
    this.y += Math.sin(angle) * 10;

    this.draw();
  }

  draw() {
    ctx.drawImage(heroProjectileImg, this.x, this.y, this.width, this.height);
  }
}

const projectilesHandler = (aimX, aimY) => {
  if (keyboardEvents.pressedKeyS && gameCount.projectiles % 7 === 0) {
    gameInfo.projectiles.push(new Projectile(aimX, aimY));
    const heroBulletEffectSound = new Audio();
    heroBulletEffectSound.src = "music/heroBulletEffect.mp3";
    heroBulletEffectSound.play();
  }

  for (let i = 0; i < gameInfo.projectiles.length; i++) {
    gameInfo.projectiles[i].update();
  }

  for (let i = 0; i < gameInfo.projectiles.length; i++) {
    if (
      gameInfo.projectiles[i].x > canvas.width ||
      gameInfo.projectiles[i].y < 100 ||
      gameInfo.projectiles[i].y > canvas.height
    ) {
      gameInfo.projectiles.splice(i, 1);
      i--;
    }
  }
  gameCount.projectiles++;
};

class WeakEnemy {
  constructor() {
    this.x = Math.random() * 100 + canvas.width;
    this.y = Math.random() * (canvas.height - 100) + 100;
    this.width = 150;
    this.height = 80;
    this.movement = [
      Math.sin((Math.random() * 180 * Math.PI) / 180) * 7,
      Math.cos((Math.random() * 360 * Math.PI) / 180) * 5,
    ];
  }

  update() {
    if (this.y > canvas.height - this.height) {
      this.y = canvas.height - this.height;
      this.movement[1] *= -1;
    }

    if (this.y < gameInfo.statusBoard.height) {
      this.y = gameInfo.statusBoard.height;
      this.movement[1] *= -1;
    }
    this.x -= this.movement[0];
    this.y += this.movement[1];

    this.draw();
  }

  draw() {
    ctx.drawImage(weakEnemyImg, this.x, this.y, this.width, this.height);
  }
}

const weakEnemyHandler = () => {
  if (gameCount.weakEnemy % weakEnemyCountControl === 0) {
    gameInfo.weakEnemy.push(new WeakEnemy());
  }
  for (let i = 0; i < gameInfo.weakEnemy.length; i++) {
    gameInfo.weakEnemy[i].update();
  }

  for (let i = 0; i < gameInfo.weakEnemy.length; i++) {
    if (gameInfo.weakEnemy[i].x < -gameInfo.weakEnemy[i].width) {
      gameInfo.weakEnemy.splice(i, 1);
      i--;
    }
  }

  for (let i = 0; i < gameInfo.weakEnemy.length; i++) {
    for (let j = 0; j < gameInfo.projectiles.length; j++) {
      if (
        gameInfo.weakEnemy[i] &&
        gameInfo.projectiles[j] &&
        collision(gameInfo.weakEnemy[i], gameInfo.projectiles[j])
      ) {
        gameInfo.statusBoard.score += 10;
        gameInfo.explosions.push(
          new Explosion(gameInfo.weakEnemy[i].x, gameInfo.weakEnemy[i].y)
        );
        gameInfo.weakEnemy.splice(i, 1);
        gameInfo.projectiles.splice(j, 1);
        i--;
        j--;
      }
    }
  }

  for (let i = 0; i < gameInfo.weakEnemy.length; i++) {
    if (collision(gameInfo.hero, gameInfo.weakEnemy[i])) {
      gameInfo.hero.hp -= 5;
      if (gameInfo.hero.hp < 0) {
        gameInfo.hero.hp = 0;
      }
      gameInfo.explosions.push(
        new Explosion(gameInfo.weakEnemy[i].x, gameInfo.weakEnemy[i].y)
      );
      gameInfo.weakEnemy.splice(i, 1);
      i--;
    }
  }

  for (let i = 0; i < gameInfo.weakEnemy.length; i++) {
    if (
      gameInfo.ultimate[0] &&
      collision(gameInfo.ultimate[0], gameInfo.weakEnemy[i])
    ) {
      gameInfo.explosions.push(
        new Explosion(gameInfo.weakEnemy[i].x, gameInfo.weakEnemy[i].y)
      );
      gameInfo.weakEnemy.splice(i, 1);
      i--;
      gameInfo.statusBoard.score += 10;
    }
  }
  gameCount.weakEnemy++;
  if (gameCount.weakEnemy % 100 === 0) weakEnemyCountControl -= 50;
  if (weakEnemyCountControl <= 100) weakEnemyCountControl = 100;
};

class StrongEnemy {
  constructor() {
    this.x = canvas.width;
    this.y = Math.random() * (canvas.height - 100) + 100;
    this.hp = 6;
    this.width = 150;
    this.height = 80;
    this.movement = [
      Math.sin((Math.random() * 180 * Math.PI) / 180) * 7,
      Math.cos((Math.random() * 360 * Math.PI) / 180) * 5,
    ];
    this.opacity = 1;
  }

  update() {
    if (this.y > canvas.height - this.height) {
      this.y = canvas.height - this.height;
      this.movement[1] *= -1;
    }

    if (this.y < gameInfo.statusBoard.height) {
      this.y = gameInfo.statusBoard.height;
      this.movement[1] *= -1;
    }

    if (gameFlag.shoot) {
      this.x += 0;
      this.y += 0;
      setTimeout(() => (gameFlag.shoot = false), 1500);
    } else {
      this.x -= this.movement[0];
      this.y += this.movement[1];
    }

    this.draw();
  }

  draw() {
    ctx.save();
    ctx.globalAlpha = this.opacity;
    ctx.drawImage(strongEnemyImg, this.x, this.y, this.width, this.height);
    if (this.opacity === 0) this.opacity = 1;
    ctx.restore();
  }
}

const strongEnemyHandler = () => {
  if (gameCount.strongEnemy % 100 === 0) {
    gameInfo.strongEnemy.push(new StrongEnemy());
  }

  for (let i = 0; i < gameInfo.strongEnemy.length; i++) {
    gameInfo.strongEnemy[i].update();
  }

  for (let i = 0; i < gameInfo.strongEnemy.length; i++) {
    if (gameInfo.strongEnemy[i].x < -gameInfo.strongEnemy[i].width) {
      gameInfo.strongEnemy.splice(i, 1);
      i--;
    }
  }

  for (let i = 0; i < gameInfo.strongEnemy.length; i++) {
    for (let j = 0; j < gameInfo.projectiles.length; j++) {
      if (
        gameInfo.strongEnemy[i] &&
        gameInfo.projectiles[j] &&
        collision(gameInfo.strongEnemy[i], gameInfo.projectiles[j])
      ) {
        gameInfo.strongEnemy[i].opacity = 0;
        gameInfo.strongEnemy[i].hp -= 2;
        if (gameInfo.strongEnemy[i].hp <= 0) {
          gameInfo.statusBoard.score += 20;
          gameInfo.explosions.push(
            new Explosion(gameInfo.strongEnemy[i].x, gameInfo.strongEnemy[i].y)
          );
          gameInfo.strongEnemy.splice(i, 1);
          i--;
        }
        gameInfo.projectiles.splice(j, 1);
        j--;
      }
    }
  }

  for (let i = 0; i < gameInfo.strongEnemy.length; i++) {
    if (collision(gameInfo.hero, gameInfo.strongEnemy[i])) {
      gameInfo.hero.hp -= 10;
      if (gameInfo.hero.hp < 0) {
        gameInfo.hero.hp = 0;
      }
      gameInfo.explosions.push(
        new Explosion(gameInfo.strongEnemy[i].x, gameInfo.strongEnemy[i].y)
      );
      gameInfo.strongEnemy.splice(i, 1);
      i--;
    }
  }

  for (let i = 0; i < gameInfo.strongEnemy.length; i++) {
    if (
      gameInfo.ultimate[0] &&
      collision(gameInfo.ultimate[0], gameInfo.strongEnemy[i])
    ) {
      gameInfo.explosions.push(
        new Explosion(gameInfo.strongEnemy[i].x, gameInfo.strongEnemy[i].y)
      );
      gameInfo.strongEnemy.splice(i, 1);
      i--;
      gameInfo.statusBoard.score += 20;
    }
  }
  gameCount.strongEnemy++;
};

class StrongEnemyProjectile {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.targetX = gameInfo.hero.x - canvas.width;
    this.targetY = gameInfo.hero.y;
    this.radius = 10;
    this.width = 40;
    this.height = 40;
  }

  update() {
    const dx = this.x - this.targetX;
    const dy = this.y - this.targetY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    this.x -= (dx / distance) * 5;
    this.y -= (dy / distance) * 5;

    this.draw();
  }

  draw() {
    ctx.drawImage(
      strongEnemyProjectileImg,
      this.x,
      this.y,
      this.width,
      this.height
    );
  }
}

const strongEnemyProjectileHandler = () => {
  for (let i = 0; i < gameInfo.strongEnemy.length; i++) {
    if (gameCount.strongEnemyProjectile % 500 === 0) {
      gameInfo.strongEnemyProjectiles.push(
        new StrongEnemyProjectile(
          gameInfo.strongEnemy[i].x,
          gameInfo.strongEnemy[i].y + 50
        )
      );
      gameFlag.shoot = true;
    }
  }

  for (let i = 0; i < gameInfo.strongEnemyProjectiles.length; i++) {
    gameInfo.strongEnemyProjectiles[i].update();
  }

  for (let i = 0; i < gameInfo.strongEnemyProjectiles.length; i++) {
    if (gameInfo.strongEnemyProjectiles[i].x < 0) {
      gameInfo.strongEnemyProjectiles.splice(i, 1);
      i--;
    }
  }

  for (let i = 0; i < gameInfo.strongEnemyProjectiles.length; i++) {
    if (collision(gameInfo.hero, gameInfo.strongEnemyProjectiles[i])) {
      gameInfo.strongEnemyProjectiles.splice(i, 1);
      i--;
      gameInfo.hero.hp -= 5;
      if (gameInfo.hero.hp < 0) {
        gameInfo.hero.hp = 0;
      }
    }
  }

  for (let i = 0; i < gameInfo.strongEnemyProjectiles.length; i++) {
    if (
      gameInfo.ultimate[0] &&
      collision(gameInfo.ultimate[0], gameInfo.strongEnemyProjectiles[i])
    ) {
      gameInfo.strongEnemyProjectiles.splice(i, 1);
      i--;
    }
  }

  gameCount.strongEnemyProjectile++;
};

class Boss {
  constructor() {
    this.x = canvas.width + 300;
    this.y = canvas.height * 0.5;
    this.width = 350;
    this.height = 200;
    this.hp = 500;
    this.movement = [Math.random() * 3 + 1, Math.random() * 3 + 1];
    this.opacity = 1;
  }

  update() {
    if (gameFlag.shoot) {
      this.x += 0;
      this.y += 0;
      setTimeout(() => (gameFlag.shoot = false), 1500);
    } else {
      this.x -= this.movement[0];
      this.y -= this.movement[1];
    }

    if (this.x < canvas.width * 0.4 || this.x > canvas.width + 300) {
      this.movement[0] *= -1;
    }
    if (
      this.y < gameInfo.statusBoard.height ||
      this.y > canvas.height - this.height
    ) {
      this.movement[1] *= -1;
    }

    this.draw();
  }

  draw() {
    ctx.save();
    ctx.globalAlpha = this.opacity;
    ctx.drawImage(bossImg, this.x, this.y, this.width, this.height);
    if (this.opacity === 0) this.opacity = 1;
    // if (gameInfo.hit)
    //   setTimeout(() => {
    //     gameInfo.hit = false;
    //   }, 2000);
    ctx.restore();
  }
}

const bossHandler = () => {
  if (gameFlag.bossAppearance && !gameFlag.existBoss) {
    gameInfo.boss = new Boss();
    gameFlag.existBoss = true;
  }

  if (gameInfo.boss && collision(gameInfo.hero, gameInfo.boss)) {
    // if (gameInfo.hit) {
    //   gameInfo.boss.opacity = 1;
    // } else {
    // gameInfo.boss.opacity = 0;
    // gameInfo.hit = true;
    // }
    gameInfo.hero.hp -= 1;
  }

  for (let i = 0; i < gameInfo.projectiles.length; i++) {
    if (gameInfo.boss && collision(gameInfo.boss, gameInfo.projectiles[i])) {
      gameInfo.boss.opacity = 0;
      gameInfo.boss.hp -= 2;
      gameInfo.projectiles.splice(i, 1);
      i--;
    }
  }

  if (
    gameInfo.boss &&
    gameInfo.ultimate[0] &&
    collision(gameInfo.ultimate[0], gameInfo.boss)
  ) {
    // gameInfo.boss.opacity = 0;
    gameInfo.boss.hp -= 3;
  }

  gameInfo.boss?.update();
};

class BossProjectile {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 40;
    this.height = 40;
    this.speed = [Math.random() * 3 + 2, (Math.random() * 3 - 1.5) * 2];
  }

  update() {
    this.x -= this.speed[0] * 2;
    this.y -= this.speed[1] * 2;
    this.draw();
  }

  draw() {
    ctx.drawImage(bossProjectileImg, this.x, this.y, this.width, this.height);
  }
}

const bossProjectileHandler = () => {
  if (gameInfo.boss && (gameCount.bossProjectiles + 200) % 500 === 0) {
    for (let i = 0; i < 10; i++) {
      gameInfo.bossProjectiles.push(
        new BossProjectile(gameInfo.boss.x, gameInfo.boss.y + 150)
      );
    }
    gameFlag.shoot = true;
  }
  for (let i = 0; i < gameInfo.bossProjectiles.length; i++) {
    gameInfo.bossProjectiles[i].update();
  }

  for (let i = 0; i < gameInfo.bossProjectiles.length; i++) {
    if (gameInfo.bossProjectiles[i].x < 0) {
      gameInfo.bossProjectiles.splice(i, 1);
      i--;
    }
  }

  for (let i = 0; i < gameInfo.bossProjectiles.length; i++) {
    if (
      gameInfo.bossProjectiles[i].y < gameInfo.statusBoard.height ||
      gameInfo.bossProjectiles[i].y > canvas.height
    ) {
      gameInfo.bossProjectiles.splice(i, 1);
      i--;
    }
  }

  for (let i = 0; i < gameInfo.bossProjectiles.length; i++) {
    if (collision(gameInfo.hero, gameInfo.bossProjectiles[i])) {
      gameInfo.bossProjectiles.splice(i, 1);
      gameInfo.hero.hp -= 10;
      if (gameInfo.hero.hp < 0) {
        gameInfo.hero.hp = 0;
      }
      i--;
    }
  }

  for (let i = 0; i < gameInfo.bossProjectiles.length; i++) {
    if (
      gameInfo.ultimate[0] &&
      gameInfo.bossProjectiles &&
      collision(gameInfo.ultimate[0], gameInfo.bossProjectiles[i])
    ) {
      gameInfo.bossProjectiles.splice(i, 1);
      i--;
    }
  }

  gameCount.bossProjectiles++;
};

class BossUltimate {
  constructor() {
    this.x =
      (canvas.width - canvas.width * 0.2) * Math.random() + canvas.width * 0.1;
    this.y = gameInfo.statusBoard.height;
    this.width = 300;
    this.height = 150;
  }

  update() {
    this.y += 3;
    this.draw();
  }

  draw() {
    ctx.drawImage(bossUltimateImg, this.x, this.y, this.width, this.height);
  }
}

const bossUltimateHandler = () => {
  if (gameInfo.boss && (gameCount.bossUltimate + 1) % 500 === 0) {
    gameInfo.bossUltimates.push(new BossUltimate());
  }

  for (let i = 0; i < gameInfo.bossUltimates.length; i++) {
    if (
      gameInfo.boss &&
      gameInfo.bossUltimates[i].y > canvas.height - gameInfo.statusBoard.height
    ) {
      gameInfo.bossUltimatePosition = gameInfo.bossUltimates[0].x + 150;
      gameFlag.explosion = true;
      gameInfo.bossUltimates.splice(i, 1);
      i--;
    }
  }

  for (let i = 0; i < gameInfo.bossUltimates.length; i++) {
    if (gameInfo.boss && gameInfo.bossUltimates) {
      gameInfo.bossUltimates[i].update();
    }
  }
  gameCount.bossUltimate++;
};

class BossUltimateParticle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 20;
    this.height = 20;
    this.movement = [Math.random() * 3 - 1.5, Math.random() * 3 + 1];
  }

  update() {
    this.x += this.movement[0] * 5;
    this.y -= this.movement[1] * 4;
    this.draw();
  }

  draw() {
    ctx.drawImage(
      bossUltimateParticleImg,
      this.x,
      this.y,
      this.width,
      this.height
    );
  }
}

const bossUltimateParticleHandler = () => {
  if (gameFlag.explosion && !gameInfo.bossUltimateParticle.length) {
    for (let i = 0; i < 100; i++) {
      gameInfo.bossUltimateParticle.push(
        new BossUltimateParticle(gameInfo.bossUltimatePosition, canvas.height)
      );
    }
  }
  for (let i = 0; i < gameInfo.bossUltimateParticle.length; i++) {
    if (gameInfo.bossUltimateParticle) {
      gameInfo.bossUltimateParticle[i].update();
    }
  }

  for (let i = 0; i < gameInfo.bossUltimateParticle.length; i++) {
    if (gameInfo.bossUltimateParticle[i].y < gameInfo.statusBoard.height) {
      gameInfo.bossUltimateParticle.splice(i, 1);
      i--;
    }
  }

  for (let i = 0; i < gameInfo.bossUltimateParticle.length; i++) {
    if (collision(gameInfo.hero, gameInfo.bossUltimateParticle[i])) {
      gameInfo.bossUltimateParticle.splice(i, 1);
      gameInfo.hero.hp -= 1;
      if (gameInfo.hero.hp < 0) {
        gameInfo.hero.hp = 0;
      }
      i--;
    }
  }

  for (let i = 0; i < gameInfo.bossUltimateParticle.length; i++) {
    if (
      gameInfo.ultimate[0] &&
      gameInfo.bossUltimateParticle &&
      collision(gameInfo.ultimate[0], gameInfo.bossUltimateParticle[i])
    ) {
      gameInfo.bossUltimateParticle.splice(i, 1);
      i--;
    }
  }

  gameFlag.explosion = false;
};

class Resource {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 30;
    this.height = 50;
    this.movement = Math.random() * 3 - 1.5;
  }

  update() {
    this.x += this.movement * 0.5;
    this.y += this.movement * 0.5;
  }

  draw() {
    ctx.drawImage(resourceImg, this.x, this.y, this.width, this.height);
  }
}

const resourceHandler = () => {
  let availablePosition = false;
  const resource = {
    x: Math.random() * (canvas.width - 30),
    y:
      Math.random() * (canvas.height - gameInfo.statusBoard.height - 30) +
      gameInfo.statusBoard.height,
    width: 30,
    height: 30,
  };

  while (!availablePosition) {
    if (collision(gameInfo.hero, resource)) {
      resource.x = Math.random() * (canvas.width - 30);
      resource.y =
        Math.random() * (canvas.height - gameInfo.statusBoard.height - 30) +
        gameInfo.statusBoard.height;
    } else {
      availablePosition = true;
    }
  }
  if (gameCount.resource % 500 === 0) {
    //1500
    gameInfo.resources.push(new Resource(resource.x, resource.y));
  }

  for (let i = 0; i < gameInfo.resources.length; i++) {
    gameInfo.resources[i].draw();
    if (collision(gameInfo.hero, gameInfo.resources[i])) {
      gameInfo.resources.splice(i, 1);
      gameInfo.hero.ultimateCharge += 1;
      i--;
    }
  }

  for (let i = 0; i < gameInfo.resources.length; i++) {
    gameInfo.resources[i].update();
  }
  gameCount.resource++;
};

class Ultimate {
  constructor() {
    this.x = -600;
    this.y = 100;
    this.width = 400;
    this.height = 600;
    this.weight = 2;
  }

  update() {
    this.x += this.weight;
    this.weight += 0.5;
    this.draw();
  }

  draw() {
    ctx.drawImage(ultimateImg, this.x, this.y, this.width, this.height);
  }
}

const ultimateHandler = () => {
  if (gameInfo.hero.ultimateCharge === 3) {
    gameInfo.ultimate.push(new Ultimate());
    gameInfo.hero.ultimateCharge = 0;
    gameInfo.hero.ultimate += 1;
  }
  if (keyboardEvents.pressedKeyA && gameInfo.ultimate.length) {
    gameFlag.readyUltimate = true;
  }
  if (gameFlag.readyUltimate) {
    gameInfo.ultimate[0].update();

    if (gameInfo.ultimate[0].x > canvas.width) {
      gameInfo.ultimate.shift();
      gameInfo.hero.ultimate -= 1;
      gameFlag.readyUltimate = false;
    }
  }
};

class UltimateFlameEffect {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.frame = 0;
    this.maxFrame = 27;
  }

  update() {
    if (this.frame < this.maxFrame) {
      this.frame++;
      this.draw();
    }
  }

  draw() {
    // ctx.drawImage(flameImg,0,flameImg.height,)
  }
}

class Explosion {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.frame = 0;
    this.maxFrame = 16;
  }

  update() {
    if (this.frame <= this.maxFrame) {
      this.frame++;
      this.draw();
    }
  }

  draw() {
    ctx.drawImage(
      explosionImg,
      400 * this.frame,
      0,
      400,
      411,
      this.x,
      this.y,
      150,
      150
    );
  }
}

const explosionHandler = () => {
  if (!gameInfo.explosions) return;

  for (let i = 0; i < gameInfo.explosions.length; i++) {
    if (gameInfo.explosions[i].frame <= 16) {
      gameInfo.explosions[i].update();
    } else {
      gameInfo.explosions.splice(i, 1);
      i--;
    }
  }
};

class Message {
  constructor() {
    this.x = canvas.width * 0.3;
    this.y =
      (canvas.height - gameInfo.statusBoard.height) / 2 +
      gameInfo.statusBoard.height;
  }

  update() {
    this.draw();
  }

  draw() {
    if (gameFlag.gameOver) {
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "white";
      ctx.font = "bold 70px Krona One";
      ctx.fillText("GAME OVER", this.x - 70, this.y - 30);
      ctx.font = "bold 25px Krona One";
      ctx.fillText("RESTART PRESS ENTER", this.x, this.y + 30);
    }
    if (gameFlag.win) {
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "white";
      ctx.font = "bold 70px Krona One";
      ctx.fillText("YOU WIN", this.x, this.y - 30);
      ctx.font = "bold 25px Krona One";
      ctx.fillText("RESTART PRESS ENTER", this.x, this.y + 30);
    }
  }
}

const messageHandler = () => {
  gameInfo.message = new Message();
};

class StatusBoard {
  constructor() {
    this.score = 0;
    this.heroHp = 0;
    this.ultimate = 0;
    this.ultimateCharge = 0;
    this.bossHp = 0;
    this.width = canvas.width;
    this.height = 100;
  }

  update() {
    this.heroHp = gameInfo.hero.hp;
    this.ultimate = gameInfo.hero.ultimate;
    this.ultimateCharge = gameInfo.hero.ultimateCharge;
    if (gameFlag.existBoss) {
      this.bossHp = gameInfo.boss.hp;
      if (gameInfo.boss.hp <= 0) {
        gameInfo.boss.hp = 0;
        gameFlag.win = true;
      }
    }

    if (gameInfo.hero.hp <= 0) {
      gameInfo.hero.hp = 0;
      gameFlag.gameOver = true;
    }

    this.draw();
  }

  draw() {
    ctx.fillStyle = "rgba(255,255,255,0.1)";
    ctx.fillRect(0, 0, this.width, this.height);
    ctx.font = "bold 15px Krona One";
    ctx.fillStyle = "white";
    ctx.fillText(`SCORE : ${this.score}`, 20, 45);
    ctx.fillText(`HP : ${this.heroHp}`, 20, 80);
    ctx.fillText(`ULTIMATE : ${this.ultimate}`, 200, 45);
    ctx.fillText(`CHARGE : ${this.ultimateCharge}`, 200, 80);
    if (gameFlag.bossAppearance && gameFlag.existBoss) {
      ctx.strokeStyle = "white";
      ctx.fillText(`BOSS`, 390, 65);
      ctx.fillStyle = "green";
      ctx.fillRect(480, 42, this.bossHp, 30);
      ctx.strokeStyle = "white";
      ctx.lineWidth = 2;
      ctx.strokeRect(480, 42, 500, 30);
    } else {
      ctx.fillText(`BOSS`, 390, 65);
      ctx.fillStyle = "green";
      ctx.fillRect(
        480,
        42,
        (gameInfo.backGroundImgStart / (backGroundImg.width - canvas.width)) *
          500,
        30
      );
      ctx.strokeStyle = "white";
      ctx.lineWidth = 2;
      ctx.strokeRect(480, 42, 500, 30);
    }
  }
}

const statusBoardHandler = () => {
  gameInfo.statusBoard = new StatusBoard();
};

const init = () => {
  // backgroundMusic.play();
  heroHandler();
  aimHandler();
  statusBoardHandler();
  messageHandler();
};

init();

const resetGameData = () => {
  for (let key in gameInfo) {
    if (key === "bossUltimatePosition") {
      gameInfo[key] = undefined;
    }
    gameInfo[key] = [];
  }
  for (let key in gameCount) {
    gameCount[key] = 0;
  }
  weakEnemyCountControl = 500;
  gameInfo.backGroundImgStart = 0;
  gameFlag.gameOver = false;
  gameFlag.win = false;
  gameFlag.readyUltimate = false;
  gameFlag.shoot = false;
  gameFlag.bossAppearance = false;
  gameFlag.existBoss = false;
  gameFlag.explosion = false;
};

const collision = (first, second) => {
  if (
    first.x + first.width > second.x &&
    first.x + first.width * 0.2 < second.x + second.width &&
    first.y < second.y + second.height &&
    first.y + first.height > second.y
  ) {
    return true;
  }
};

const animate = () => {
  if (gameFlag.gameOver) return;
  if (gameFlag.win) return;

  ctx.drawImage(
    backGroundImg,
    gameInfo.backGroundImgStart,
    0,
    canvas.width,
    backGroundImg.height / 2,
    0,
    0,
    canvas.width,
    canvas.height
  );
  if (gameInfo.backGroundImgStart < backGroundImg.width - canvas.width) {
    gameInfo.backGroundImgStart += 1;
  } else {
    gameInfo.backGroundImgStart = backGroundImg.width - canvas.width;
    gameFlag.bossAppearance = true;
  }

  gameInfo.hero.update();
  gameInfo.aim.update(gameInfo.hero);
  projectilesHandler(gameInfo.aim.x2, gameInfo.aim.y2);
  ultimateHandler();
  resourceHandler();
  if (!gameFlag.bossAppearance) {
    weakEnemyHandler();
    strongEnemyHandler();
    strongEnemyProjectileHandler();
  } else {
    bossHandler();
    bossProjectileHandler();
    bossUltimateHandler();
    bossUltimateParticleHandler();
  }
  explosionHandler();
  gameInfo.statusBoard.update();
  gameInfo.message.update();
  requestAnimationFrame(animate);
};
window.onload = () => {
  animate();
};
