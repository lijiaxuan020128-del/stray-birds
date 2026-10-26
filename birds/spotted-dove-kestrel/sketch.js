/*
《飞鸟集》——珠颈斑鸠 × 红隼
p5.js 2.3.4

本版：
1. 红线以下 = 珠颈斑鸠活动范围
2. 红线以上完全禁止粒子进入
3. 红隼进入画面后，斑鸠立刻高速四散
4. 红隼高速飞入 → 落地 → 停几秒 → 高速飞走
5. 红隼没有拖尾
*/


// ============================================================
// 01 参数
// ============================================================

const CFG = {

  // ----------------------------------------------------------
  // 背景
  // ----------------------------------------------------------

  backgroundImage: "珠颈斑鸠+红隼.png",


  // ----------------------------------------------------------
  // 画布
  // ----------------------------------------------------------

  canvasWidth: 1280,
  canvasHeight: 720,


  // ----------------------------------------------------------
  // 珠颈斑鸠
  // ----------------------------------------------------------

  doveCount: 11,

  doveSize: 21,

  doveColor: "#A58D8C",

  doveOutline: "#514945",

  doveOutlineWidth: 1.5,


  // ----------------------------------------------------------
  // 红隼
  // ----------------------------------------------------------

  kestrelSize: 28,

  kestrelColor: "#B87652",

  kestrelOutline: "#332724",

  kestrelOutlineWidth: 1.8,


  // ==========================================================
  // 地面上边界
  //
  // 根据你刚刚画的红线重新确定。
  //
  // x、y 都是画面比例。
  //
  // 红线以下允许活动。
  // 红线以上禁止活动。
  // ==========================================================

  groundBoundary: [

    [0.000, 0.728],

    [0.115, 0.730],

    [0.180, 0.705],

    [0.265, 0.655],

    [0.405, 0.610],

    [0.485, 0.600],

    [0.610, 0.606],

    [0.750, 0.608],

    [0.880, 0.608],

    [1.000, 0.608]

  ],


  // 粒子离红线稍微留一点距离
  // 防止圆点有一半压到墙上
  groundTopMargin: 16,

  // 左右和底部留白
  groundSideMargin: 24,

  groundBottomMargin: 24,


  // ----------------------------------------------------------
  // 初始分布
  // ----------------------------------------------------------

  initialMinGap: 52,

  initialTryCount: 200,


  // ==========================================================
  // 日常觅食
  // ==========================================================

  walkSpeedMin: 7,

  walkSpeedMax: 14,

  walkTimeMin: 1.3,

  walkTimeMax: 3.8,

  pauseTimeMin: 0.8,

  pauseTimeMax: 2.5,

  peckChance: 0.70,

  peckTimeMin: 0.45,

  peckTimeMax: 1.15,

  peckBob: 2.5,

  peckSpeed: 8,

  turnMin: -0.75,

  turnMax: 0.75,

  avoidDistance: 40,

  avoidStrength: 0.30,


  // ==========================================================
  // 红隼出现
  // ==========================================================

  calmTimeMin: 12,

  calmTimeMax: 18,


  // ==========================================================
  // 红隼高速飞入
  // ==========================================================

  kestrelEntrySpeedMin: 600,

  kestrelEntrySpeedMax: 760,

  kestrelOutside: 100,


  // ==========================================================
  // 红隼落点
  // ==========================================================

  kestrelLandingXMin: 0.43,

  kestrelLandingXMax: 0.70,

  kestrelLandingYMin: 0.68,

  kestrelLandingYMax: 0.80,

  kestrelLandingBrakeDistance: 100,

  kestrelLandingEase: 0.18,

  kestrelLandingThreshold: 4,


  // ==========================================================
  // 红隼停留
  // ==========================================================

  kestrelStayMin: 2.0,

  kestrelStayMax: 3.5,


  // ==========================================================
  // 红隼飞走
  // ==========================================================

  kestrelExitHorizontalMin: 480,

  kestrelExitHorizontalMax: 620,

  kestrelExitUpMin: -400,

  kestrelExitUpMax: -300,


  // ==========================================================
  // 斑鸠受惊高速逃离
  // ==========================================================

  escapeSpeedMin: 620,

  escapeSpeedMax: 850,

  escapeUpMin: -0.90,

  escapeUpMax: -0.38,

  escapeSideMin: 0.45,

  escapeSideMax: 1.00,

  // 几乎同时起飞
  escapeDelayMin: 0.00,

  escapeDelayMax: 0.12,

  escapeOutside: 120,

  escapeWave: 4,


  // ==========================================================
  // 红隼离开后的空场
  // ==========================================================

  emptyTime: 1.3,


  // ==========================================================
  // 斑鸠返回
  // ==========================================================

  returnIntervalMin: 0.22,

  returnIntervalMax: 0.60,

  returnSpeedMin: 100,

  returnSpeedMax: 140,

  returnOutside: 100,

  landingDistance: 75,

  landingEase: 0.06,

  landingThreshold: 6,


  // ==========================================================
  // 阴影
  // ==========================================================

  shadowAlpha: 28,

  shadowOffsetY: 4,


  // ==========================================================
  // 调试
  //
  // true：显示活动范围上边界
  // false：正常展示
  // ==========================================================

  showGroundBoundary: false
};


// ============================================================
// 02 全局变量
// ============================================================

let bgImageElement = null;

let bgReady = false;

let bgFailed = false;

let doves = [];

let kestrel = null;

let sceneState = "CALM";

let sceneTimer = 0;

let nextKestrelTime = 15;

let returnQueue = [];

let nextReturnTimer = 0;

let lastTime = 0;


// ============================================================
// 03 setup
// ============================================================

function setup() {

  createCanvas(
    CFG.canvasWidth,
    CFG.canvasHeight
  );

  pixelDensity(1);


  createDoves();

  resetSceneTimer();


  bgImageElement =
    new Image();


  bgImageElement.onload =
    function () {

      bgReady = true;

      bgFailed = false;

      lastTime = millis();
    };


  bgImageElement.onerror =
    function () {

      bgFailed = true;

      console.error(
        "背景图片加载失败：",
        CFG.backgroundImage
      );
    };


  bgImageElement.src =
    CFG.backgroundImage;


  lastTime = millis();
}


// ============================================================
// 04 draw
// ============================================================

function draw() {

  drawBackground();


  if (!bgReady) {

    return;
  }


  let currentTime =
    millis();


  let dt =
    (
      currentTime -
      lastTime
    ) / 1000;


  lastTime =
    currentTime;


  dt =
    constrain(
      dt,
      0,
      0.05
    );


  if (
    CFG.showGroundBoundary
  ) {

    drawGroundBoundary();
  }


  updateScene(dt);


  for (
    let dove of doves
  ) {

    dove.update(dt);
  }


  if (kestrel) {

    kestrel.update(dt);
  }


  drawDoveShadows();

  drawKestrelShadow();


  for (
    let dove of doves
  ) {

    dove.display();
  }


  if (kestrel) {

    kestrel.display();
  }
}


// ============================================================
// 05 背景
// ============================================================

function drawBackground() {

  if (
    bgReady &&
    bgImageElement
  ) {

    drawingContext.drawImage(
      bgImageElement,
      0,
      0,
      width,
      height
    );

    return;
  }


  background(
    230,
    230,
    226
  );


  if (bgFailed) {

    push();

    noStroke();

    fill(70);

    textAlign(
      CENTER,
      CENTER
    );

    textSize(16);

    text(
      "背景图片加载失败：" +
      CFG.backgroundImage,

      width / 2,
      height / 2
    );

    pop();
  }
}


// ============================================================
// 06 根据 X 找红线上边界 Y
// ============================================================

function getGroundTopY(x) {

  let nx =
    constrain(
      x / width,
      0,
      1
    );


  let points =
    CFG.groundBoundary;


  for (
    let i = 0;
    i < points.length - 1;
    i++
  ) {

    let p1 =
      points[i];


    let p2 =
      points[i + 1];


    if (
      nx >= p1[0] &&
      nx <= p2[0]
    ) {

      let amount =
        map(
          nx,
          p1[0],
          p2[0],
          0,
          1
        );


      let ny =
        lerp(
          p1[1],
          p2[1],
          amount
        );


      return (
        ny *
        height
      );
    }
  }


  return (
    points[
      points.length - 1
    ][1] *
    height
  );
}


// ============================================================
// 07 是否属于安全地面
// ============================================================

function isSafeGround(
  x,
  y,
  margin = 0
) {

  if (
    x <
    CFG.groundSideMargin +
    margin
  ) {

    return false;
  }


  if (
    x >
    width -
    CFG.groundSideMargin -
    margin
  ) {

    return false;
  }


  if (
    y >
    height -
    CFG.groundBottomMargin -
    margin
  ) {

    return false;
  }


  let topY =
    getGroundTopY(x);


  if (
    y <
    topY +
    CFG.groundTopMargin +
    margin
  ) {

    return false;
  }


  return true;
}


// ============================================================
// 08 找随机地面位置
// ============================================================

function findGroundPosition() {

  for (
    let attempt = 0;
    attempt < CFG.initialTryCount;
    attempt++
  ) {

    let x =
      random(
        CFG.groundSideMargin +
        CFG.doveSize,

        width -
        CFG.groundSideMargin -
        CFG.doveSize
      );


    let topY =
      getGroundTopY(x);


    let y =
      random(
        topY +
        CFG.groundTopMargin +
        CFG.doveSize,

        height -
        CFG.groundBottomMargin -
        CFG.doveSize
      );


    if (
      !isSafeGround(
        x,
        y,
        CFG.doveSize * 0.5
      )
    ) {

      continue;
    }


    let valid =
      true;


    for (
      let dove of doves
    ) {

      let dx =
        x -
        dove.x;


      let dy =
        y -
        dove.y;


      if (
        dx * dx +
        dy * dy <
        CFG.initialMinGap *
        CFG.initialMinGap
      ) {

        valid =
          false;

        break;
      }
    }


    if (valid) {

      return createVector(
        x,
        y
      );
    }
  }


  return createVector(
    width * 0.55,
    height * 0.78
  );
}


// ============================================================
// 09 创建斑鸠
// ============================================================

function createDoves() {

  doves = [];


  for (
    let i = 0;
    i < CFG.doveCount;
    i++
  ) {

    let pos =
      findGroundPosition();


    doves.push(
      new Dove(
        pos.x,
        pos.y
      )
    );
  }
}


// ============================================================
// 10 场景逻辑
// ============================================================

function updateScene(dt) {

  sceneTimer +=
    dt;


  // ----------------------------------------------------------
  // 平静
  // ----------------------------------------------------------

  if (
    sceneState === "CALM"
  ) {

    if (
      sceneTimer >=
      nextKestrelTime
    ) {

      launchKestrel();

      sceneState =
        "KESTREL_ENTER";

      sceneTimer =
        0;
    }


    return;
  }


  // ----------------------------------------------------------
  // 红隼进入
  // ----------------------------------------------------------

  if (
    sceneState ===
    "KESTREL_ENTER"
  ) {

    if (
      kestrel &&
      kestrel.hasEnteredScreen &&
      !kestrel.scareTriggered
    ) {

      kestrel.scareTriggered =
        true;


      triggerExplosiveEscape();
    }


    if (
      kestrel &&
      kestrel.mode ===
      "PERCHED"
    ) {

      sceneState =
        "KESTREL_STAY";


      sceneTimer =
        0;
    }


    return;
  }


  // ----------------------------------------------------------
  // 红隼停留
  // ----------------------------------------------------------

  if (
    sceneState ===
    "KESTREL_STAY"
  ) {

    if (
      kestrel &&
      sceneTimer >=
      kestrel.stayDuration
    ) {

      kestrel.beginExit();


      sceneState =
        "KESTREL_EXIT";


      sceneTimer =
        0;
    }


    return;
  }


  // ----------------------------------------------------------
  // 红隼离开
  // ----------------------------------------------------------

  if (
    sceneState ===
    "KESTREL_EXIT"
  ) {

    if (
      !kestrel ||
      kestrel.isOutside()
    ) {

      kestrel =
        null;


      sceneState =
        "WAIT_DOVES_GONE";


      sceneTimer =
        0;
    }


    return;
  }


  // ----------------------------------------------------------
  // 等斑鸠全部离开
  // ----------------------------------------------------------

  if (
    sceneState ===
    "WAIT_DOVES_GONE"
  ) {

    let allGone =
      true;


    for (
      let dove of doves
    ) {

      if (
        dove.mode !== "GONE" &&
        dove.mode !== "WAIT_RETURN"
      ) {

        allGone =
          false;

        break;
      }
    }


    if (allGone) {

      sceneState =
        "EMPTY";


      sceneTimer =
        0;
    }


    return;
  }


  // ----------------------------------------------------------
  // 空场
  // ----------------------------------------------------------

  if (
    sceneState ===
    "EMPTY"
  ) {

    if (
      sceneTimer >=
      CFG.emptyTime
    ) {

      prepareReturn();


      sceneState =
        "RETURN";


      sceneTimer =
        0;


      nextReturnTimer =
        0;
    }


    return;
  }


  // ----------------------------------------------------------
  // 斑鸠返回
  // ----------------------------------------------------------

  if (
    sceneState ===
    "RETURN"
  ) {

    nextReturnTimer -=
      dt;


    if (
      nextReturnTimer <= 0 &&
      returnQueue.length > 0
    ) {

      let dove =
        returnQueue.shift();


      dove.beginReturn();


      nextReturnTimer =
        random(
          CFG.returnIntervalMin,
          CFG.returnIntervalMax
        );
    }


    let allBack =
      true;


    for (
      let dove of doves
    ) {

      if (
        dove.mode === "RETURNING" ||
        dove.mode === "LANDING" ||
        dove.mode === "WAIT_RETURN"
      ) {

        allBack =
          false;

        break;
      }
    }


    if (
      returnQueue.length === 0 &&
      allBack
    ) {

      sceneState =
        "CALM";


      sceneTimer =
        0;


      resetSceneTimer();
    }
  }
}


// ============================================================
// 11 红隼出现时间
// ============================================================

function resetSceneTimer() {

  nextKestrelTime =
    random(
      CFG.calmTimeMin,
      CFG.calmTimeMax
    );
}


// ============================================================
// 12 红隼出现
// ============================================================

function launchKestrel() {

  let fromLeft =
    random() <
    0.5;


  let startX =
    fromLeft
      ? -CFG.kestrelOutside
      : width + CFG.kestrelOutside;


  let startY =
    random(
      height * 0.12,
      height * 0.30
    );


  let target =
    findKestrelLandingPosition();


  kestrel =
    new Kestrel(
      startX,
      startY,
      target.x,
      target.y,
      fromLeft
    );
}


// ============================================================
// 13 红隼落点
// ============================================================

function findKestrelLandingPosition() {

  for (
    let i = 0;
    i < 100;
    i++
  ) {

    let x =
      random(
        width *
        CFG.kestrelLandingXMin,

        width *
        CFG.kestrelLandingXMax
      );


    let y =
      random(
        height *
        CFG.kestrelLandingYMin,

        height *
        CFG.kestrelLandingYMax
      );


    if (
      isSafeGround(
        x,
        y,
        20
      )
    ) {

      return createVector(
        x,
        y
      );
    }
  }


  return createVector(
    width * 0.55,
    height * 0.75
  );
}


// ============================================================
// 14 斑鸠爆发式逃跑
// ============================================================

function triggerExplosiveEscape() {

  for (
    let dove of doves
  ) {

    if (
      dove.mode === "GONE" ||
      dove.mode === "WAIT_RETURN"
    ) {

      continue;
    }


    dove.scareScheduled =
      true;


    dove.scareCountdown =
      random(
        CFG.escapeDelayMin,
        CFG.escapeDelayMax
      );
  }
}


// ============================================================
// 15 返回队列
// ============================================================

function prepareReturn() {

  returnQueue = [];


  for (
    let dove of doves
  ) {

    dove.mode =
      "WAIT_RETURN";


    returnQueue.push(
      dove
    );
  }


  shuffleList(
    returnQueue
  );
}


// ============================================================
// 16 随机排序
// ============================================================

function shuffleList(arr) {

  for (
    let i =
      arr.length - 1;

    i > 0;

    i--
  ) {

    let j =
      floor(
        random(
          i + 1
        )
      );


    let temp =
      arr[i];


    arr[i] =
      arr[j];


    arr[j] =
      temp;
  }
}


// ============================================================
// 17 珠颈斑鸠
// ============================================================

class Dove {

  constructor(x, y) {

    this.x =
      x;


    this.y =
      y;


    this.vx =
      0;


    this.vy =
      0;


    this.direction =
      random(
        TWO_PI
      );


    this.walkSpeed =
      random(
        CFG.walkSpeedMin,
        CFG.walkSpeedMax
      );


    this.mode =
      "PAUSE";


    this.modeTimer =
      random(
        0.2,
        1.5
      );


    this.peckPhase =
      random(
        TWO_PI
      );


    this.scareScheduled =
      false;


    this.scareCountdown =
      0;


    this.escapeWavePhase =
      random(
        TWO_PI
      );


    this.returnTargetX =
      x;


    this.returnTargetY =
      y;


    this.returnSpeed =
      random(
        CFG.returnSpeedMin,
        CFG.returnSpeedMax
      );
  }


  // ==========================================================
  // 更新
  // ==========================================================

  update(dt) {

    if (
      this.scareScheduled
    ) {

      this.scareCountdown -=
        dt;


      if (
        this.scareCountdown <= 0
      ) {

        this.scareScheduled =
          false;


        this.beginEscape();
      }
    }


    if (
      this.mode === "WALK"
    ) {

      this.updateWalk(
        dt
      );
    }


    else if (
      this.mode === "PAUSE"
    ) {

      this.updatePause(
        dt
      );
    }


    else if (
      this.mode === "PECK"
    ) {

      this.updatePeck(
        dt
      );
    }


    else if (
      this.mode === "ESCAPING"
    ) {

      this.updateEscape(
        dt
      );
    }


    else if (
      this.mode === "RETURNING"
    ) {

      this.updateReturn(
        dt
      );
    }


    else if (
      this.mode === "LANDING"
    ) {

      this.updateLanding(
        dt
      );
    }
  }


  // ==========================================================
  // 行走
  // ==========================================================

  updateWalk(dt) {

    this.modeTimer -=
      dt;


    let moveX =
      cos(
        this.direction
      ) *
      this.walkSpeed;


    let moveY =
      sin(
        this.direction
      ) *
      this.walkSpeed *
      0.35;


    let avoidance =
      this.getAvoidance();


    moveX +=
      avoidance.x;


    moveY +=
      avoidance.y;


    let nextX =
      this.x +
      moveX *
      dt;


    let nextY =
      this.y +
      moveY *
      dt;


    // --------------------------------------------------------
    // 下一位置在红线以下才允许移动
    // --------------------------------------------------------

    if (
      isSafeGround(
        nextX,
        nextY,
        CFG.doveSize * 0.5
      )
    ) {

      this.x =
        nextX;


      this.y =
        nextY;
    }

    else {

      // 碰到红线/画面边缘后转身
      this.direction +=
        PI +
        random(
          -0.55,
          0.55
        );
    }


    if (
      this.modeTimer <= 0
    ) {

      this.mode =
        "PAUSE";


      this.modeTimer =
        random(
          CFG.pauseTimeMin,
          CFG.pauseTimeMax
        );
    }
  }


  // ==========================================================
  // 停顿
  // ==========================================================

  updatePause(dt) {

    this.modeTimer -=
      dt;


    if (
      this.modeTimer <= 0
    ) {

      if (
        random() <
        CFG.peckChance
      ) {

        this.mode =
          "PECK";


        this.modeTimer =
          random(
            CFG.peckTimeMin,
            CFG.peckTimeMax
          );
      }

      else {

        this.startWalking();
      }
    }
  }


  // ==========================================================
  // 啄食
  // ==========================================================

  updatePeck(dt) {

    this.modeTimer -=
      dt;


    this.peckPhase +=
      CFG.peckSpeed *
      dt;


    if (
      this.modeTimer <= 0
    ) {

      this.startWalking();
    }
  }


  // ==========================================================
  // 开始走
  // ==========================================================

  startWalking() {

    this.mode =
      "WALK";


    this.modeTimer =
      random(
        CFG.walkTimeMin,
        CFG.walkTimeMax
      );


    this.direction +=
      random(
        CFG.turnMin,
        CFG.turnMax
      );


    this.walkSpeed =
      random(
        CFG.walkSpeedMin,
        CFG.walkSpeedMax
      );
  }


  // ==========================================================
  // 避让
  // ==========================================================

  getAvoidance() {

    let ax =
      0;


    let ay =
      0;


    for (
      let other of doves
    ) {

      if (
        other === this
      ) {

        continue;
      }


      if (
        other.mode === "GONE" ||
        other.mode === "WAIT_RETURN"
      ) {

        continue;
      }


      let dx =
        this.x -
        other.x;


      let dy =
        this.y -
        other.y;


      let dSq =
        dx * dx +
        dy * dy;


      if (
        dSq > 0 &&
        dSq <
        CFG.avoidDistance *
        CFG.avoidDistance
      ) {

        let d =
          sqrt(
            dSq
          );


        let force =
          (
            1 -
            d /
            CFG.avoidDistance
          ) *
          CFG.avoidStrength *
          100;


        ax +=
          dx /
          d *
          force;


        ay +=
          dy /
          d *
          force;
      }
    }


    return createVector(
      ax,
      ay
    );
  }


  // ==========================================================
  // 开始逃跑
  // ==========================================================

  beginEscape() {

    if (
      this.mode === "ESCAPING" ||
      this.mode === "GONE"
    ) {

      return;
    }


    this.mode =
      "ESCAPING";


    let speed =
      random(
        CFG.escapeSpeedMin,
        CFG.escapeSpeedMax
      );


    let horizontalDirection;


    if (kestrel) {

      horizontalDirection =
        this.x <
        kestrel.x
          ? -1
          : 1;
    }

    else {

      horizontalDirection =
        random() <
        0.5
          ? -1
          : 1;
    }


    // 少量个体交叉逃跑
    if (
      random() <
      0.25
    ) {

      horizontalDirection *=
        -1;
    }


    let sideAmount =
      random(
        CFG.escapeSideMin,
        CFG.escapeSideMax
      );


    let upAmount =
      random(
        CFG.escapeUpMin,
        CFG.escapeUpMax
      );


    this.vx =
      horizontalDirection *
      speed *
      sideAmount;


    this.vy =
      speed *
      upAmount;


    this.escapeWavePhase =
      random(
        TWO_PI
      );
  }


  // ==========================================================
  // 高速逃离
  // ==========================================================

  updateEscape(dt) {

    this.escapeWavePhase +=
      dt *
      8;


    this.x +=
      (
        this.vx +

        sin(
          this.escapeWavePhase
        ) *
        CFG.escapeWave
      ) *
      dt;


    this.y +=
      (
        this.vy +

        cos(
          this.escapeWavePhase *
          0.7
        ) *
        CFG.escapeWave
      ) *
      dt;


    if (
      this.x <
      -CFG.escapeOutside ||

      this.x >
      width +
      CFG.escapeOutside ||

      this.y <
      -CFG.escapeOutside ||

      this.y >
      height +
      CFG.escapeOutside
    ) {

      this.mode =
        "GONE";
    }
  }


  // ==========================================================
  // 开始返回
  // ==========================================================

  beginReturn() {

    let target =
      findReturnPosition(
        this
      );


    this.returnTargetX =
      target.x;


    this.returnTargetY =
      target.y;


    this.returnSpeed =
      random(
        CFG.returnSpeedMin,
        CFG.returnSpeedMax
      );


    let side =
      random();


    if (
      side < 0.40
    ) {

      this.x =
        -CFG.returnOutside;


      this.y =
        random(
          height * 0.25,
          height * 0.48
        );
    }


    else if (
      side < 0.80
    ) {

      this.x =
        width +
        CFG.returnOutside;


      this.y =
        random(
          height * 0.25,
          height * 0.48
        );
    }


    else {

      this.x =
        random(
          width * 0.15,
          width * 0.85
        );


      this.y =
        -CFG.returnOutside;
    }


    this.mode =
      "RETURNING";
  }


  // ==========================================================
  // 返回飞行
  // ==========================================================

  updateReturn(dt) {

    let dx =
      this.returnTargetX -
      this.x;


    let dy =
      this.returnTargetY -
      this.y;


    let d =
      sqrt(
        dx * dx +
        dy * dy
      );


    if (
      d <
      CFG.landingDistance
    ) {

      this.mode =
        "LANDING";


      return;
    }


    if (
      d > 0
    ) {

      this.x +=
        dx /
        d *
        this.returnSpeed *
        dt;


      this.y +=
        dy /
        d *
        this.returnSpeed *
        dt;
    }
  }


  // ==========================================================
  // 降落
  // ==========================================================

  updateLanding(dt) {

    this.x =
      lerp(
        this.x,
        this.returnTargetX,
        CFG.landingEase
      );


    this.y =
      lerp(
        this.y,
        this.returnTargetY,
        CFG.landingEase
      );


    let dx =
      this.returnTargetX -
      this.x;


    let dy =
      this.returnTargetY -
      this.y;


    let d =
      sqrt(
        dx * dx +
        dy * dy
      );


    if (
      d <
      CFG.landingThreshold
    ) {

      this.x =
        this.returnTargetX;


      this.y =
        this.returnTargetY;


      this.mode =
        "PAUSE";


      this.modeTimer =
        random(
          0.5,
          1.8
        );


      this.direction =
        random(
          TWO_PI
        );
    }
  }


  // ==========================================================
  // 显示
  // ==========================================================

  display() {

    if (
      this.mode === "GONE" ||
      this.mode === "WAIT_RETURN"
    ) {

      return;
    }


    let displayY =
      this.y;


    if (
      this.mode === "PECK"
    ) {

      displayY +=
        sin(
          this.peckPhase
        ) *
        CFG.peckBob;
    }


    push();


    translate(
      this.x,
      displayY
    );


    stroke(
      CFG.doveOutline
    );


    strokeWeight(
      CFG.doveOutlineWidth
    );


    fill(
      CFG.doveColor
    );


    circle(
      0,
      0,
      CFG.doveSize
    );


    pop();
  }
}


// ============================================================
// 18 红隼
// ============================================================

class Kestrel {

  constructor(
    x,
    y,
    targetX,
    targetY,
    fromLeft
  ) {

    this.x =
      x;


    this.y =
      y;


    this.targetX =
      targetX;


    this.targetY =
      targetY;


    this.fromLeft =
      fromLeft;


    this.mode =
      "ENTERING";


    this.entrySpeed =
      random(
        CFG.kestrelEntrySpeedMin,
        CFG.kestrelEntrySpeedMax
      );


    this.stayDuration =
      random(
        CFG.kestrelStayMin,
        CFG.kestrelStayMax
      );


    this.vx =
      0;


    this.vy =
      0;


    this.hasEnteredScreen =
      false;


    this.scareTriggered =
      false;
  }


  // ==========================================================
  // 更新
  // ==========================================================

  update(dt) {

    if (
      this.mode === "ENTERING"
    ) {

      this.updateEntry(
        dt
      );
    }


    else if (
      this.mode === "EXITING"
    ) {

      this.updateExit(
        dt
      );
    }
  }


  // ==========================================================
  // 高速飞入
  // ==========================================================

  updateEntry(dt) {

    let dx =
      this.targetX -
      this.x;


    let dy =
      this.targetY -
      this.y;


    let d =
      sqrt(
        dx * dx +
        dy * dy
      );


    // --------------------------------------------------------
    // 红隼一进入画面就触发逃跑
    // --------------------------------------------------------

    if (
      this.x >= 0 &&
      this.x <= width &&
      this.y >= 0 &&
      this.y <= height
    ) {

      this.hasEnteredScreen =
        true;
    }


    // --------------------------------------------------------
    // 到达平台
    // --------------------------------------------------------

    if (
      d <=
      CFG.kestrelLandingThreshold
    ) {

      this.x =
        this.targetX;


      this.y =
        this.targetY;


      this.vx =
        0;


      this.vy =
        0;


      this.mode =
        "PERCHED";


      return;
    }


    // --------------------------------------------------------
    // 高速接近
    // --------------------------------------------------------

    if (
      d >
      CFG.kestrelLandingBrakeDistance
    ) {

      this.vx =
        dx /
        d *
        this.entrySpeed;


      this.vy =
        dy /
        d *
        this.entrySpeed;


      this.x +=
        this.vx *
        dt;


      this.y +=
        this.vy *
        dt;
    }


    // --------------------------------------------------------
    // 最后减速降落
    // --------------------------------------------------------

    else {

      this.x =
        lerp(
          this.x,
          this.targetX,
          CFG.kestrelLandingEase
        );


      this.y =
        lerp(
          this.y,
          this.targetY,
          CFG.kestrelLandingEase
        );
    }
  }


  // ==========================================================
  // 从平台起飞
  // ==========================================================

  beginExit() {

    this.mode =
      "EXITING";


    let horizontalDirection =
      this.fromLeft
        ? 1
        : -1;


    this.vx =
      horizontalDirection *
      random(
        CFG.kestrelExitHorizontalMin,
        CFG.kestrelExitHorizontalMax
      );


    this.vy =
      random(
        CFG.kestrelExitUpMin,
        CFG.kestrelExitUpMax
      );
  }


  // ==========================================================
  // 飞走
  // ==========================================================

  updateExit(dt) {

    this.x +=
      this.vx *
      dt;


    this.y +=
      this.vy *
      dt;


    this.vy +=
      65 *
      dt;
  }


  // ==========================================================
  // 是否离开画面
  // ==========================================================

  isOutside() {

    return (

      this.x <
      -CFG.kestrelOutside ||

      this.x >
      width +
      CFG.kestrelOutside ||

      this.y <
      -CFG.kestrelOutside

    );
  }


  // ==========================================================
  // 显示
  // ==========================================================

  display() {

    push();


    translate(
      this.x,
      this.y
    );


    stroke(
      CFG.kestrelOutline
    );


    strokeWeight(
      CFG.kestrelOutlineWidth
    );


    fill(
      CFG.kestrelColor
    );


    // 红隼无拖尾
    circle(
      0,
      0,
      CFG.kestrelSize
    );


    pop();
  }
}


// ============================================================
// 19 找返回落点
// ============================================================

function findReturnPosition(
  currentDove
) {

  for (
    let attempt = 0;
    attempt < 150;
    attempt++
  ) {

    let pos =
      findGroundPosition();


    let valid =
      true;


    for (
      let other of doves
    ) {

      if (
        other === currentDove
      ) {

        continue;
      }


      if (
        other.mode !== "PAUSE" &&
        other.mode !== "WALK" &&
        other.mode !== "PECK" &&
        other.mode !== "LANDING"
      ) {

        continue;
      }


      let dx =
        pos.x -
        other.x;


      let dy =
        pos.y -
        other.y;


      if (
        dx * dx +
        dy * dy <
        CFG.initialMinGap *
        CFG.initialMinGap
      ) {

        valid =
          false;

        break;
      }
    }


    if (valid) {

      return pos;
    }
  }


  return createVector(
    width * 0.55,
    height * 0.78
  );
}


// ============================================================
// 20 斑鸠阴影
// ============================================================

function drawDoveShadows() {

  noStroke();


  fill(
    0,
    CFG.shadowAlpha
  );


  for (
    let dove of doves
  ) {

    if (
      dove.mode === "GONE" ||
      dove.mode === "WAIT_RETURN" ||
      dove.mode === "ESCAPING" ||
      dove.mode === "RETURNING"
    ) {

      continue;
    }


    ellipse(
      dove.x,

      dove.y +
      CFG.shadowOffsetY,

      CFG.doveSize *
      0.75,

      CFG.doveSize *
      0.22
    );
  }
}


// ============================================================
// 21 红隼落地阴影
// ============================================================

function drawKestrelShadow() {

  if (!kestrel) {

    return;
  }


  if (
    kestrel.mode !==
    "PERCHED"
  ) {

    return;
  }


  noStroke();


  fill(
    0,
    CFG.shadowAlpha
  );


  ellipse(
    kestrel.x,

    kestrel.y +
    CFG.shadowOffsetY,

    CFG.kestrelSize *
    0.78,

    CFG.kestrelSize *
    0.23
  );
}


// ============================================================
// 22 调试显示红线
// ============================================================

function drawGroundBoundary() {

  push();


  noFill();


  stroke(
    255,
    60,
    60
  );


  strokeWeight(
    4
  );


  beginShape();


  for (
    let p of CFG.groundBoundary
  ) {

    vertex(
      p[0] *
      width,

      p[1] *
      height
    );
  }


  endShape();


  pop();
}


// ============================================================
// 23 点击提前触发红隼
// ============================================================

function mousePressed() {

  triggerKestrel();
}


function touchStarted() {

  triggerKestrel();

  return false;
}


function triggerKestrel() {

  if (!bgReady) {

    return;
  }


  if (
    sceneState ===
    "CALM"
  ) {

    launchKestrel();


    sceneState =
      "KESTREL_ENTER";


    sceneTimer =
      0;
  }
}