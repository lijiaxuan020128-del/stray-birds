// ============================================================
// 黑水鸡 · 精简完整版 · p5.js 2.3.4
//
// 数量：最低4 / 常态6 / 最高7
// 左、右、下：开放，可自然游出
// 芦苇：一旦决定进入，就连续进入，不会在入口被弹开
// 普通粒子：靠近芦苇后平滑沿岸游走
// 追逐：只有近距离才触发
// ============================================================

const C = {
  img: "黑水鸡.jpg",
  w: 1280,
  h: 720,

  // 数量
  min: 4,
  normal: 6,
  max: 7,
  refillDelay: 1.0,
  enterSpeed: 20,

  // 粒子
  size: 18,
  speed: 13,
  bodyColor: "#541c2d",
  edgeColor: "#282424",

  starts: [
    [79,73],[63,81],[87,87],
    [48,76],[31,88],[70,92]
  ],

  // 普通运动
  turnTime: [4,9],
  turnAmount: 0.60,

  // 避让
  avoidRange: 85,
  avoidPower: 45,
  hardGap: 30,

  // 芦苇
  reedInterval: [7,14],
  reedChance: 0.88,
  reedMax: 2,
  reedSpeed: 24,
  reedDepth: 45,
  reedHide: [2.5,5],
  reedFade: 1.8,
  reedX: [7,15,24,33,42,51,60,68,72],

  // 普通粒子靠岸后的平滑转向
  shoreLook: 38,
  shoreTurn: 0.055,

  // 追逐
  chaseInterval: [8,14],
  chaseTrigger: 95,
  chaseSpeed: 86,
  fleeSpeed: 105,
  chaseTime: [2.5,4.5],

  // 水纹
  wakeLife: 3.8,
  wakeSpacing: 7,

  // 水花
  splashLife: 0.55,

  // 岸线
  boundary: [
    [0,60.5],[6,60.8],[12,61.5],[18,62.5],
    [24,63.5],[30,64.5],[36,65.2],[42,66],
    [48,66.8],[54,67],[60,66.4],[65,65.3],
    [69,63.8],[72,61.5],[74,59],[76,55],
    [78,50],[85,50],[100,50]
  ]
};

let bg;
let birds = [];
let wakes = [];
let splashes = [];

let nextId = 0;
let refillTimer = 0;
let chaseTimer = 5;
let chasePair = null;
let ready = false;


// ============================================================
// 初始化
// ============================================================

async function setup() {
  createCanvas(C.w, C.h);
  pixelDensity(1);

  bg = await loadImage(C.img);

  for (let i = 0; i < C.normal; i++) {
    let s = C.starts[i];

    let x = s[0] / 100 * width;
    let y = s[1] / 100 * height;

    y = max(
      y,
      shoreY(x) + C.size + 15
    );

    birds.push(new Bird(x, y));
  }

  ready = true;
}


// ============================================================
// 主循环
// ============================================================

function draw() {
  if (!ready) return;

  image(bg, 0, 0, width, height);

  let dt = min(
    deltaTime / 1000,
    0.05
  );

  managePopulation(dt);
  manageChase(dt);

  for (let b of birds) {
    b.update(dt);
  }

  separateBirds();

  updateWakes(dt);
  drawWakes();

  updateSplashes(dt);
  drawSplashes();

  for (let b of birds) {
    b.render();
  }

  birds = birds.filter(
    b => !b.dead
  );
}


// ============================================================
// 工具
// ============================================================

function randomRange(arr) {
  return random(arr[0], arr[1]);
}


function unitVector(x, y) {
  let magnitude = Math.hypot(x, y);

  if (magnitude < 0.001) {
    return {x: 1, y: 0};
  }

  return {
    x: x / magnitude,
    y: y / magnitude
  };
}


// ============================================================
// 岸线
// ============================================================

function shoreY(x) {
  let px = constrain(
    x / width * 100,
    0,
    100
  );

  for (
    let i = 0;
    i < C.boundary.length - 1;
    i++
  ) {
    let pointA = C.boundary[i];
    let pointB = C.boundary[i + 1];

    if (
      px >= pointA[0] &&
      px <= pointB[0]
    ) {
      let amount =
        (px - pointA[0]) /
        (pointB[0] - pointA[0]);

      return lerp(
        pointA[1],
        pointB[1],
        amount
      ) / 100 * height;
    }
  }

  return height * 0.6;
}


function isWater(x, y) {
  let sampleX = constrain(
    x,
    0,
    width
  );

  return (
    y >
    shoreY(sampleX) +
    C.size / 2 +
    10
  );
}


// ============================================================
// 数量
// ============================================================

function visibleCount() {
  let amount = 0;

  for (let b of birds) {
    if (
      !b.dead &&
      b.alpha > 0.45 &&
      b.state !== "hidden" &&
      b.state !== "reedIn" &&
      b.x > -C.size &&
      b.x < width + C.size &&
      b.y > -C.size &&
      b.y < height + C.size
    ) {
      amount++;
    }
  }

  return amount;
}


function incomingCount() {
  let amount = 0;

  for (let b of birds) {
    if (
      !b.dead &&
      b.state === "enter"
    ) {
      amount++;
    }
  }

  return amount;
}


function managePopulation(dt) {
  let expected =
    visibleCount() +
    incomingCount();

  if (expected >= C.normal) {
    refillTimer = 0;
    return;
  }

  refillTimer += dt;

  let delay =
    expected < C.min
      ? 0.35
      : C.refillDelay;

  if (refillTimer >= delay) {
    spawnIncoming();
    refillTimer = 0;
  }
}


function spawnIncoming() {
  if (
    visibleCount() +
    incomingCount() >=
    C.max
  ) {
    return;
  }

  let fromLeft =
    random() < 0.5;

  let x =
    fromLeft
      ? -C.size * 2
      : width + C.size * 2;

  let edgeX =
    fromLeft ? 0 : width;

  let y = random(
    shoreY(edgeX) + 50,
    height - 30
  );

  let b = new Bird(x, y);

  b.state = "enter";

  b.vx =
    fromLeft
      ? C.enterSpeed
      : -C.enterSpeed;

  b.vy = random(-2, 2);

  b.heading =
    fromLeft ? 0 : PI;

  birds.push(b);
}


// ============================================================
// 芦苇状态数量
// ============================================================

function reedActivityCount() {
  let amount = 0;

  for (let b of birds) {
    if (
      b.state === "reedApproach" ||
      b.state === "reedIn" ||
      b.state === "hidden" ||
      b.state === "reedOut"
    ) {
      amount++;
    }
  }

  return amount;
}


// ============================================================
// 粒子
// ============================================================

class Bird {

  constructor(x, y) {
    this.id = nextId++;

    this.x = x;
    this.y = y;

    this.heading = random(TWO_PI);

    this.vx =
      cos(this.heading) * C.speed;

    this.vy =
      sin(this.heading) * C.speed;

    this.state = "swim";

    this.alpha = 1;
    this.dead = false;

    this.turnTimer =
      randomRange(C.turnTime);

    this.reedTimer =
      randomRange(C.reedInterval);

    this.reedEntry = null;
    this.reedInside = null;

    this.hideTimer = 0;
    this.wakeTravel = 0;
  }


  update(dt) {
    if (this.dead) return;

    let oldX = this.x;
    let oldY = this.y;

    if (this.state === "swim") {
      this.updateSwim(dt);
    }

    else if (this.state === "enter") {
      this.updateEnter(dt);
    }

    else if (this.state === "reedApproach") {
      this.updateReedApproach(dt);
    }

    else if (this.state === "reedIn") {
      this.updateReedIn(dt);
    }

    else if (this.state === "hidden") {
      this.updateHidden(dt);
    }

    else if (this.state === "reedOut") {
      this.updateReedOut(dt);
    }

    else if (this.state === "chase") {
      this.updateChase(dt);
    }

    else if (this.state === "flee") {
      this.updateFlee(dt);
    }

    this.makeWake(oldX, oldY);

    if (
      this.x < -C.size * 3 ||
      this.x > width + C.size * 3 ||
      this.y > height + C.size * 3
    ) {
      this.dead = true;
    }
  }


  // ==========================================================
  // 普通游泳
  // ==========================================================

  updateSwim(dt) {
    this.turnTimer -= dt;
    this.reedTimer -= dt;


    // ---------- 是否决定钻芦苇 ----------

    if (this.reedTimer <= 0) {
      this.reedTimer =
        randomRange(C.reedInterval);

      if (
        reedActivityCount() < C.reedMax &&
        random() < C.reedChance &&
        this.x > 40 &&
        this.x < width - 40 &&
        this.y < height - 35
      ) {
        if (this.startReedTrip()) {
          return;
        }
      }
    }


    // ---------- 普通随机转向 ----------

    if (this.turnTimer <= 0) {
      this.heading += random(
        -C.turnAmount,
        C.turnAmount
      );

      this.turnTimer =
        randomRange(C.turnTime);
    }


    // ---------- 预测前方是否碰岸 ----------

    let lookX =
      this.x +
      cos(this.heading) *
      C.shoreLook;

    let lookY =
      this.y +
      sin(this.heading) *
      C.shoreLook;


    // ========================================================
    // 普通粒子接近芦苇：
    // 不弹开。
    // 缓慢改变方向，沿岸继续游。
    // ========================================================

    if (
      lookX >= 0 &&
      lookX <= width &&
      lookY <= height &&
      !isWater(lookX, lookY)
    ) {
      let leftAngle =
        this.heading - 0.55;

      let rightAngle =
        this.heading + 0.55;


      let leftX =
        this.x +
        cos(leftAngle) *
        C.shoreLook;

      let leftY =
        this.y +
        sin(leftAngle) *
        C.shoreLook;


      let rightX =
        this.x +
        cos(rightAngle) *
        C.shoreLook;

      let rightY =
        this.y +
        sin(rightAngle) *
        C.shoreLook;


      let leftSafe =
        isWater(leftX, leftY);

      let rightSafe =
        isWater(rightX, rightY);


      if (leftSafe && !rightSafe) {
        this.heading -=
          C.shoreTurn;
      }

      else if (
        rightSafe &&
        !leftSafe
      ) {
        this.heading +=
          C.shoreTurn;
      }

      else {
        // 两边都可以时选择原方向改变最小的一边
        let leftDepth =
          leftY -
          shoreY(leftX);

        let rightDepth =
          rightY -
          shoreY(rightX);

        if (
          leftDepth >
          rightDepth
        ) {
          this.heading -=
            C.shoreTurn;
        } else {
          this.heading +=
            C.shoreTurn;
        }
      }
    }


    let desiredVX =
      cos(this.heading) *
      C.speed;

    let desiredVY =
      sin(this.heading) *
      C.speed;


    let avoid =
      getAvoidance(this);

    desiredVX += avoid.x;
    desiredVY += avoid.y;


    this.vx = lerp(
      this.vx,
      desiredVX,
      0.035
    );

    this.vy = lerp(
      this.vy,
      desiredVY,
      0.035
    );


    let nextX =
      this.x +
      this.vx * dt;

    let nextY =
      this.y +
      this.vy * dt;


    // ---------- 左右下开放 ----------

    if (
      nextX < 0 ||
      nextX > width ||
      nextY > height
    ) {
      this.x = nextX;
      this.y = nextY;

      this.heading =
        atan2(
          this.vy,
          this.vx
        );

      return;
    }


    // ---------- 正常移动 ----------

    if (
      isWater(nextX, nextY)
    ) {
      this.x = nextX;
      this.y = nextY;
    }

    else {
      // 已经非常靠近岸线时：
      // 不反弹，只减弱朝岸方向的速度，
      // 并继续横向滑走。

      let shore =
        shoreY(this.x) +
        C.size / 2 +
        10;

      let sideDirection =
        this.vx >= 0 ? 1 : -1;

      this.vx = lerp(
        this.vx,
        sideDirection * C.speed,
        0.08
      );

      this.vy = lerp(
        this.vy,
        C.speed * 0.18,
        0.04
      );

      this.y =
        max(
          this.y,
          shore + 1
        );

      this.x +=
        this.vx * dt;
    }


    this.heading =
      atan2(
        this.vy,
        this.vx
      );
  }


  // ==========================================================
  // 从外面游入
  // ==========================================================

  updateEnter(dt) {
    if (
      visibleCount() >= C.max
    ) {
      return;
    }

    this.x += this.vx * dt;
    this.y += this.vy * dt;

    let radius =
      C.size / 2;

    if (
      this.x > radius &&
      this.x < width - radius
    ) {
      this.state = "swim";

      this.turnTimer =
        randomRange(C.turnTime);

      this.reedTimer =
        randomRange(C.reedInterval);
    }
  }


  // ==========================================================
  // 决定钻芦苇
  // ==========================================================

  startReedTrip() {
    let bestEntry = null;
    let bestGap = Infinity;

    for (let percentX of C.reedX) {
      let entryX =
        percentX / 100 * width;

      let entryY =
        shoreY(entryX) +
        C.size +
        12;

      let gapValue =
        Math.hypot(
          entryX - this.x,
          entryY - this.y
        );

      if (gapValue < bestGap) {
        bestGap = gapValue;

        bestEntry = {
          x: entryX,
          y: entryY
        };
      }
    }

    if (!bestEntry) {
      return false;
    }


    this.reedEntry =
      bestEntry;


    this.reedInside = {
      x:
        bestEntry.x +
        random(-10, 10),

      y:
        shoreY(bestEntry.x) -
        C.reedDepth
    };


    // 一旦进入这个状态，
    // 普通岸线避让不再参与。
    this.state =
      "reedApproach";


    return true;
  }


  // ==========================================================
  // 接近芦苇
  //
  // 这里不进行岸线碰撞判断，
  // 所以不会在入口被“弹开”。
  // ==========================================================

  updateReedApproach(dt) {
    if (!this.reedEntry) {
      this.state = "swim";
      return;
    }


    let dx =
      this.reedEntry.x -
      this.x;

    let dy =
      this.reedEntry.y -
      this.y;

    let gapValue =
      Math.hypot(dx, dy);


    if (gapValue < 12) {
      this.state = "reedIn";

      return;
    }


    let direction =
      unitVector(dx, dy);


    let targetVX =
      direction.x *
      C.reedSpeed;

    let targetVY =
      direction.y *
      C.reedSpeed;


    // 平滑靠近，不突然改变速度
    this.vx = lerp(
      this.vx,
      targetVX,
      0.055
    );

    this.vy = lerp(
      this.vy,
      targetVY,
      0.055
    );


    this.x +=
      this.vx * dt;

    this.y +=
      this.vy * dt;


    this.heading =
      atan2(
        this.vy,
        this.vx
      );
  }


  // ==========================================================
  // 钻入芦苇
  // ==========================================================

  updateReedIn(dt) {
    if (!this.reedInside) {
      this.state = "swim";
      return;
    }


    let dx =
      this.reedInside.x -
      this.x;

    let dy =
      this.reedInside.y -
      this.y;

    let gapValue =
      Math.hypot(dx, dy);


    let direction =
      unitVector(dx, dy);


    this.vx = lerp(
      this.vx,
      direction.x * C.reedSpeed,
      0.08
    );

    this.vy = lerp(
      this.vy,
      direction.y * C.reedSpeed,
      0.08
    );


    this.x +=
      this.vx * dt;

    this.y +=
      this.vy * dt;


    // 穿进芦苇以后才淡出
    if (
      this.y <
      shoreY(this.x) + 6
    ) {
      this.alpha =
        max(
          0,
          this.alpha -
          C.reedFade * dt
        );
    }


    if (
      gapValue < 10 ||
      this.alpha <= 0.01
    ) {
      this.alpha = 0;

      this.state =
        "hidden";

      this.hideTimer =
        randomRange(C.reedHide);

      this.vx = 0;
      this.vy = 0;
    }
  }


  // ==========================================================
  // 芦苇中隐藏
  // ==========================================================

  updateHidden(dt) {
    this.hideTimer -= dt;

    if (
      this.hideTimer > 0
    ) {
      return;
    }


    if (
      visibleCount() >= C.max
    ) {
      this.hideTimer = 0.8;
      return;
    }


    this.state =
      "reedOut";

    this.alpha = 0;

    this.vx =
      random(-4, 4);

    this.vy =
      C.reedSpeed;

    this.heading =
      HALF_PI;
  }


  // ==========================================================
  // 从芦苇出来
  // ==========================================================

  updateReedOut(dt) {
    this.x +=
      this.vx * dt;

    this.y +=
      this.vy * dt;


    let shore =
      shoreY(this.x);


    if (
      this.y >
      shore - 8
    ) {
      this.alpha =
        min(
          1,
          this.alpha +
          C.reedFade * dt
        );
    }


    if (
      this.y >
      shore +
      C.size +
      15
    ) {
      this.alpha = 1;

      this.state = "swim";

      this.heading =
        atan2(
          this.vy,
          this.vx
        );

      this.turnTimer =
        randomRange(C.turnTime);

      this.reedTimer =
        randomRange(C.reedInterval);
    }
  }


  // ==========================================================
  // 追逐
  // ==========================================================

  updateChase(dt) {
    if (!chasePair) {
      this.state = "swim";
      return;
    }


    let target =
      chasePair.runner;


    let direction =
      unitVector(
        target.x - this.x,
        target.y - this.y
      );


    this.vx = lerp(
      this.vx,
      direction.x * C.chaseSpeed,
      0.12
    );

    this.vy = lerp(
      this.vy,
      direction.y * C.chaseSpeed,
      0.12
    );


    this.fastMove(dt);
    this.makeSplash(dt);
  }


  updateFlee(dt) {
    if (!chasePair) {
      this.state = "swim";
      return;
    }


    let enemy =
      chasePair.chaser;


    let direction =
      unitVector(
        this.x - enemy.x,
        this.y - enemy.y + 12
      );


    this.vx = lerp(
      this.vx,
      direction.x * C.fleeSpeed,
      0.12
    );

    this.vy = lerp(
      this.vy,
      direction.y * C.fleeSpeed,
      0.12
    );


    this.fastMove(dt);
    this.makeSplash(dt);
  }


  fastMove(dt) {
    let nextX =
      this.x +
      this.vx * dt;

    let nextY =
      this.y +
      this.vy * dt;


    if (
      nextX < 0 ||
      nextX > width ||
      nextY > height
    ) {
      this.x = nextX;
      this.y = nextY;
      return;
    }


    if (
      isWater(nextX, nextY)
    ) {
      this.x = nextX;
      this.y = nextY;
    }

    else {
      // 追逐时也不反弹
      this.vy = lerp(
        this.vy,
        abs(this.vy) * 0.4,
        0.08
      );

      this.x +=
        this.vx * dt;

      this.y +=
        max(0, this.vy) * dt;
    }


    this.heading =
      atan2(
        this.vy,
        this.vx
      );
  }


  // ==========================================================
  // 水纹
  // ==========================================================

  makeWake(oldX, oldY) {
    if (
      this.alpha < 0.5 ||
      this.state === "hidden" ||
      this.state === "reedIn"
    ) {
      return;
    }


    let travelled =
      Math.hypot(
        this.x - oldX,
        this.y - oldY
      );


    this.wakeTravel +=
      travelled;


    if (
      this.wakeTravel <
      C.wakeSpacing
    ) {
      return;
    }


    this.wakeTravel = 0;


    if (
      this.x < 0 ||
      this.x > width ||
      this.y > height
    ) {
      return;
    }


    wakes.push({
      x: this.x,
      y: this.y,

      angle:
        atan2(
          this.y - oldY,
          this.x - oldX
        ),

      age: 0
    });
  }


  // ==========================================================
  // 水花
  // ==========================================================

  makeSplash(dt) {
    if (
      random() >
      25 * dt
    ) {
      return;
    }


    splashes.push({
      x:
        this.x +
        random(-7, 7),

      y:
        this.y +
        random(-4, 4),

      vx:
        random(-25, 25),

      vy:
        random(-30, -8),

      age: 0,

      life:
        random(
          0.25,
          C.splashLife
        ),

      size:
        random(
          1.5,
          3.5
        )
    });
  }


  // ==========================================================
  // 绘制
  // ==========================================================

  render() {
    if (
      this.alpha <= 0 ||
      this.dead
    ) {
      return;
    }


    let bodyTone =
      color(C.bodyColor);

    bodyTone.setAlpha(
      235 * this.alpha
    );


    let outlineTone =
      color(C.edgeColor);

    outlineTone.setAlpha(
      255 * this.alpha
    );


    fill(bodyTone);
    stroke(outlineTone);
    strokeWeight(1.4);

    circle(
      this.x,
      this.y,
      C.size
    );
  }
}


// ============================================================
// 普通避让
// ============================================================

function getAvoidance(bird) {
  let forceX = 0;
  let forceY = 0;


  for (let other of birds) {
    if (
      other === bird ||
      other.dead ||
      other.alpha < 0.5 ||
      other.state === "hidden" ||
      other.state === "reedIn" ||
      other.state === "reedApproach"
    ) {
      continue;
    }


    let dx =
      bird.x -
      other.x;

    let dy =
      bird.y -
      other.y;

    let gapValue =
      Math.hypot(dx, dy);


    if (
      gapValue < 0.01 ||
      gapValue > C.avoidRange
    ) {
      continue;
    }


    let force =
      (
        1 -
        gapValue /
        C.avoidRange
      ) *
      C.avoidPower;


    forceX +=
      dx / gapValue * force;

    forceY +=
      dy / gapValue * force;
  }


  return {
    x: forceX,
    y: forceY
  };
}


// ============================================================
// 防重叠
//
// 正在钻芦苇的粒子不参与强制分离，
// 避免被其他粒子推离入口。
// ============================================================

function separateBirds() {
  for (
    let i = 0;
    i < birds.length;
    i++
  ) {
    for (
      let j = i + 1;
      j < birds.length;
      j++
    ) {
      let birdA = birds[i];
      let birdB = birds[j];


      if (
        birdA.alpha < 0.5 ||
        birdB.alpha < 0.5 ||
        birdA.state === "hidden" ||
        birdB.state === "hidden" ||
        birdA.state === "reedApproach" ||
        birdB.state === "reedApproach" ||
        birdA.state === "reedIn" ||
        birdB.state === "reedIn"
      ) {
        continue;
      }


      let dx =
        birdB.x -
        birdA.x;

      let dy =
        birdB.y -
        birdA.y;

      let gapValue =
        Math.hypot(dx, dy);


      if (
        gapValue <= 0.001 ||
        gapValue >= C.hardGap
      ) {
        continue;
      }


      let direction =
        unitVector(dx, dy);


      birdA.vx -=
        direction.x * 7;

      birdA.vy -=
        direction.y * 7;


      birdB.vx +=
        direction.x * 7;

      birdB.vy +=
        direction.y * 7;
    }
  }
}


// ============================================================
// 追逐
// ============================================================

function manageChase(dt) {
  if (chasePair) {
    chasePair.time -= dt;


    if (
      chasePair.time <= 0 ||
      chasePair.chaser.dead ||
      chasePair.runner.dead
    ) {
      stopChase();
    }

    return;
  }


  chaseTimer -= dt;

  if (chaseTimer > 0) {
    return;
  }


  let candidates =
    birds.filter(b =>
      b.state === "swim" &&
      b.alpha > 0.9 &&
      b.x > 50 &&
      b.x < width - 50 &&
      b.y < height - 40
    );


  let closestA = null;
  let closestB = null;
  let closestGap = Infinity;


  for (
    let i = 0;
    i < candidates.length;
    i++
  ) {
    for (
      let j = i + 1;
      j < candidates.length;
      j++
    ) {
      let gapValue =
        Math.hypot(
          candidates[i].x -
          candidates[j].x,

          candidates[i].y -
          candidates[j].y
        );


      if (
        gapValue <= C.chaseTrigger &&
        gapValue < closestGap
      ) {
        closestGap = gapValue;

        closestA =
          candidates[i];

        closestB =
          candidates[j];
      }
    }
  }


  if (
    !closestA ||
    !closestB
  ) {
    chaseTimer = 1.2;
    return;
  }


  let chaser = closestA;
  let runner = closestB;


  if (random() < 0.5) {
    let temporaryBird =
      chaser;

    chaser = runner;
    runner = temporaryBird;
  }


  chasePair = {
    chaser: chaser,
    runner: runner,

    time:
      randomRange(
        C.chaseTime
      )
  };


  chaser.state = "chase";
  runner.state = "flee";
}


function stopChase() {
  if (!chasePair) return;


  let pairBirds = [
    chasePair.chaser,
    chasePair.runner
  ];


  for (let b of pairBirds) {
    if (
      b &&
      !b.dead
    ) {
      b.state = "swim";

      b.heading =
        atan2(
          b.vy,
          b.vx
        );

      b.turnTimer =
        randomRange(C.turnTime);
    }
  }


  chasePair = null;

  chaseTimer =
    randomRange(
      C.chaseInterval
    );
}


// ============================================================
// 水纹
// ============================================================

function updateWakes(dt) {
  for (let wake of wakes) {
    wake.age += dt;
  }

  wakes = wakes.filter(
    wake =>
      wake.age <
      C.wakeLife
  );
}


function drawWakes() {
  push();

  noFill();
  strokeWeight(0.8);


  for (let wake of wakes) {
    let progress =
      wake.age /
      C.wakeLife;

    let opacity =
      120 *
      (1 - progress);


    stroke(
      231,
      238,
      240,
      opacity
    );


    let wakeLength =
      18 +
      70 *
      progress;

    let spread =
      8 +
      20 *
      progress;


    let forwardX =
      cos(wake.angle);

    let forwardY =
      sin(wake.angle);

    let sideX =
      -forwardY;

    let sideY =
      forwardX;


    for (
      let sideDirection
      of [-1, 1]
    ) {
      beginShape();


      for (
        let i = 0;
        i <= 10;
        i++
      ) {
        let amount =
          i / 10;

        let backward =
          -wakeLength *
          amount;

        let sideOffset =
          sideDirection *
          spread *
          sin(
            amount *
            PI *
            0.8
          );


        let x =
          wake.x +
          forwardX *
          backward +
          sideX *
          sideOffset;


        let y =
          wake.y +
          forwardY *
          backward +
          sideY *
          sideOffset *
          0.5;


        if (
          isWater(x, y)
        ) {
          vertex(x, y);
        }
      }


      endShape();
    }
  }


  pop();
}


// ============================================================
// 水花
// ============================================================

function updateSplashes(dt) {
  for (let splash of splashes) {
    splash.age += dt;

    splash.x +=
      splash.vx * dt;

    splash.y +=
      splash.vy * dt;

    splash.vy +=
      65 * dt;
  }


  splashes =
    splashes.filter(
      splash =>
        splash.age <
        splash.life
    );
}


function drawSplashes() {
  push();

  noStroke();


  for (let splash of splashes) {
    let progress =
      splash.age /
      splash.life;


    fill(
      238,
      245,
      245,
      200 *
      (1 - progress)
    );


    circle(
      splash.x,
      splash.y,

      splash.size *
      (
        1 -
        progress *
        0.3
      )
    );
  }


  pop();
}