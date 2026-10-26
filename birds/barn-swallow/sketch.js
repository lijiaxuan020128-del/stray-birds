// ============================================================
// 家燕 · p5.js 2.3.4
// 背景：家燕16：9.png
//
// 原图尺寸：1920 × 1080
//
// 行为：
// 停在线上 → 停留 → 沿线移动 → 停留
// → 起飞 → 飞行 → 换线降落
// → 少量飞离 / 飞入
//
// 所有常用参数集中在最前面
// ============================================================


// ============================================================
// ★★★★★ 可调参数 ★★★★★
// ============================================================

const CFG = {

  // ----------------------------------------------------------
  // 背景
  // ----------------------------------------------------------

  backgroundFile: "家燕16：9.png",

  referenceWidth: 1920,
  referenceHeight: 1080,


  // ----------------------------------------------------------
  // 粒子外观
  // ----------------------------------------------------------

  particleColor: "#263E47",
  particleOpacity: 255,

  particleSize: 16,

  outlineColor: "#e45b21",
  outlineOpacity: 190,
  outlineWidth: 2,


  // ----------------------------------------------------------
  // 数量
  // ----------------------------------------------------------

  minVisible: 28,
  maxVisible: 40,
  initialVisible: 34,

  // 初始停在线上的比例
  initialPerchedRatio: 0.90,


  // ----------------------------------------------------------
  // 电线上粒子之间的最小距离
  // ----------------------------------------------------------

  minimumPerchGap: 15,


  // ----------------------------------------------------------
  // 在线上停留时间（秒）
  // ----------------------------------------------------------

  perchStayTime: [
    4.0,
    9.0
  ],


  // ----------------------------------------------------------
  // 在线上行走
  // ----------------------------------------------------------

  wireWalkTime: [
    0.8,
    2.2
  ],

  wireWalkSpeed: [
    9,
    20
  ],

  // 停留结束后开始行走的概率
  walkChance: 0.8,


  // ----------------------------------------------------------
  // 普通起飞
  // ----------------------------------------------------------

  takeoffInterval: [
    3.0,
    5.5
  ],

  takeoffAmount: [
    1,
    3
  ],

  takeoffSpeed: [
    210,
    280
  ],


  // ----------------------------------------------------------
  // 群体起飞
  // ----------------------------------------------------------

  groupTakeoffInterval: [
    16,
    25
  ],

  groupTakeoffAmount: [
    4,
    7
  ],


  // ----------------------------------------------------------
  // 飞行
  // ----------------------------------------------------------

  flightSpeed: [
    220,
    330
  ],

  flightTime: [
    3.0,
    6.0
  ],

  minimumFlightTime: 1.8,

  directionChangeTime: [
    0.40,
    1.00
  ],

  directionChangeAngle: [
    0.25,
    0.75
  ],


  // ----------------------------------------------------------
  // 飞离
  // ----------------------------------------------------------

  flyOutChance: 0.22,

  flyOutInterval: [
    10,
    16
  ],

  flyOutAmount: [
    1,
    2
  ],


  // ----------------------------------------------------------
  // 飞入
  // ----------------------------------------------------------

  flyInInterval: [
    4,
    7
  ],

  flyInAmount: [
    1,
    2
  ],

  flyInSpeed: [
    230,
    320
  ],


  // ----------------------------------------------------------
  // 飞行粒子避让
  // ----------------------------------------------------------

  separationDistance: 34,
  separationStrength: 100,


  // ----------------------------------------------------------
  // 飞行区域
  // ----------------------------------------------------------

  skyTop: 20,
  skyBottom: 1030,

  outsideMargin: 110,


  // ----------------------------------------------------------
  // 拖尾
  // ----------------------------------------------------------

  trailEnabled: false,
  trailLength: 3,
  trailOpacity: 35,


  // ----------------------------------------------------------
  // 电线调试
  //
  // true：显示红色停栖轨迹
  // false：正常效果
  // ----------------------------------------------------------

  debugWires: false
};


// ============================================================
// 1920 × 1080 原图电线轨迹
// ============================================================

const WIRE_PATHS = [

  // ----------------------------------------------------------
  // 0 左上长斜线
  // ----------------------------------------------------------

  {
    pts: [
      [315, 0],
      [360, 66],
      [405, 132],
      [450, 198],
      [495, 264],
      [540, 330],
      [585, 396],
      [628, 460]
    ],

    usable: [
      [0.04, 0.91]
    ]
  },


  // ----------------------------------------------------------
  // 1 中间偏左长斜线
  // ----------------------------------------------------------

  {
    pts: [
      [690, 0],
      [725, 72],
      [760, 145],
      [795, 218],
      [830, 291],
      [865, 364],
      [900, 437],
      [934, 510]
    ],

    usable: [
      [0.04, 0.90]
    ]
  },


  // ----------------------------------------------------------
  // 2 中间偏右长斜线
  // ----------------------------------------------------------

  {
    pts: [
      [1047, 0],
      [1065, 72],
      [1084, 145],
      [1103, 218],
      [1122, 291],
      [1141, 364],
      [1160, 437],
      [1179, 506]
    ],

    usable: [
      [0.04, 0.89]
    ]
  },


  // ----------------------------------------------------------
  // 3 中部向右横线
  // ----------------------------------------------------------

  {
    pts: [
      [1030, 742],
      [1140, 741],
      [1250, 740],
      [1360, 739],
      [1470, 738],
      [1580, 737],
      [1690, 736],
      [1800, 735],
      [1920, 734]
    ],

    usable: [
      [0.08, 0.98]
    ]
  },


  // ----------------------------------------------------------
  // 4 下部向右横线
  // ----------------------------------------------------------

  {
    pts: [
      [1120, 968],
      [1230, 967],
      [1340, 967],
      [1450, 966],
      [1560, 965],
      [1670, 965],
      [1780, 964],
      [1920, 963]
    ],

    usable: [
      [0.07, 0.98]
    ]
  }
];


// ============================================================
// 全局变量
// ============================================================

let bgImg = null;

let birds = [];

let nextBirdId = 0;

let takeoffTimer = 0;
let groupTakeoffTimer = 0;
let flyOutTimer = 0;
let flyInTimer = 0;

let ready = false;


// ============================================================
// SETUP
// ============================================================

async function setup() {

  createCanvas(
    windowWidth,
    windowHeight
  );

  pixelDensity(1);

  noLoop();

  try {

    bgImg = await loadImage(
      CFG.backgroundFile
    );

  } catch (loadError) {

    background("#2988D7");

    fill(255);
    noStroke();

    textAlign(
      CENTER,
      CENTER
    );

    textSize(18);

    text(
      "无法加载背景：\n" +
      CFG.backgroundFile,
      width / 2,
      height / 2
    );

    console.error(
      loadError
    );

    return;
  }

  resetTimers();

  createInitialBirds();

  ready = true;

  loop();
}


// ============================================================
// 初始化计时
// ============================================================

function resetTimers() {

  takeoffTimer =
    randomRange(
      CFG.takeoffInterval
    );

  groupTakeoffTimer =
    randomRange(
      CFG.groupTakeoffInterval
    );

  flyOutTimer =
    randomRange(
      CFG.flyOutInterval
    );

  flyInTimer =
    randomRange(
      CFG.flyInInterval
    );
}


// ============================================================
// 创建初始粒子
// ============================================================

function createInitialBirds() {

  birds = [];

  const totalAmount =
    constrain(
      CFG.initialVisible,
      CFG.minVisible,
      CFG.maxVisible
    );

  const perchedAmount =
    Math.floor(
      totalAmount *
      CFG.initialPerchedRatio
    );

  for (
    let i = 0;
    i < totalAmount;
    i++
  ) {

    const bird =
      new SwallowParticle(
        nextBirdId++
      );

    birds.push(
      bird
    );

    if (
      i < perchedAmount
    ) {

      const perchSpot =
        findFreePerch(
          bird
        );

      if (
        perchSpot
      ) {

        bird.placeOnWire(
          perchSpot.pathIndex,
          perchSpot.pathT
        );

      } else {

        bird.startFlyingInside();
      }

    } else {

      bird.startFlyingInside();
    }
  }
}


// ============================================================
// DRAW
// ============================================================

function draw() {

  if (
    !ready
  ) {

    return;
  }

  const dt =
    Math.min(
      deltaTime / 1000,
      0.04
    );

  updateEvents(
    dt
  );

  for (
    const bird of birds
  ) {

    bird.update(
      dt
    );
  }

  removeFinishedBirds();

  maintainMinimumPopulation();

  const view =
    getViewTransform();

  image(
    bgImg,
    view.x,
    view.y,
    view.w,
    view.h
  );

  push();

  translate(
    view.x,
    view.y
  );

  scale(
    view.scale
  );

  if (
    CFG.debugWires
  ) {

    drawWireDebug();
  }

  if (
    CFG.trailEnabled
  ) {

    for (
      const bird of birds
    ) {

      bird.drawTrail();
    }
  }

  for (
    const bird of birds
  ) {

    bird.display();
  }

  pop();
}


// ============================================================
// 背景 COVER
// ============================================================

function getViewTransform() {

  const scaleValue =
    Math.max(
      width /
      CFG.referenceWidth,

      height /
      CFG.referenceHeight
    );

  const drawWidth =
    CFG.referenceWidth *
    scaleValue;

  const drawHeight =
    CFG.referenceHeight *
    scaleValue;

  return {

    scale:
      scaleValue,

    x:
      (
        width -
        drawWidth
      ) / 2,

    y:
      (
        height -
        drawHeight
      ) / 2,

    w:
      drawWidth,

    h:
      drawHeight
  };
}


// ============================================================
// 全局事件
// ============================================================

function updateEvents(dt) {

  takeoffTimer -= dt;

  groupTakeoffTimer -= dt;

  flyOutTimer -= dt;

  flyInTimer -= dt;


  // ----------------------------------------------------------
  // 普通起飞
  // ----------------------------------------------------------

  if (
    takeoffTimer <= 0
  ) {

    launchPerchedBirds(
      randomInteger(
        CFG.takeoffAmount
      ),
      false
    );

    takeoffTimer =
      randomRange(
        CFG.takeoffInterval
      );
  }


  // ----------------------------------------------------------
  // 群体起飞
  // ----------------------------------------------------------

  if (
    groupTakeoffTimer <= 0
  ) {

    launchPerchedBirds(
      randomInteger(
        CFG.groupTakeoffAmount
      ),
      false
    );

    groupTakeoffTimer =
      randomRange(
        CFG.groupTakeoffInterval
      );
  }


  // ----------------------------------------------------------
  // 飞离
  // ----------------------------------------------------------

  if (
    flyOutTimer <= 0
  ) {

    sendBirdsOutside(
      randomInteger(
        CFG.flyOutAmount
      )
    );

    flyOutTimer =
      randomRange(
        CFG.flyOutInterval
      );
  }


  // ----------------------------------------------------------
  // 飞入
  // ----------------------------------------------------------

  if (
    flyInTimer <= 0
  ) {

    const currentAmount =
      getCurrentPopulation();

    if (
      currentAmount <
      CFG.maxVisible
    ) {

      const room =
        CFG.maxVisible -
        currentAmount;

      const amount =
        Math.min(
          room,
          randomInteger(
            CFG.flyInAmount
          )
        );

      for (
        let i = 0;
        i < amount;
        i++
      ) {

        createFlyInBird();
      }
    }

    flyInTimer =
      randomRange(
        CFG.flyInInterval
      );
  }
}


// ============================================================
// 家燕粒子
// ============================================================

class SwallowParticle {

  constructor(idValue) {

    this.id =
      idValue;

    this.x = 0;
    this.y = 0;

    this.vx = 0;
    this.vy = 0;

    this.mode =
      "flying";

    this.pathIndex =
      -1;

    this.pathT =
      0;

    this.perchTimer =
      0;

    this.walkTimer =
      0;

    this.walkDirection =
      1;

    this.walkSpeed =
      0;

    this.flightAge =
      0;

    this.flightLimit =
      0;

    this.turnTimer =
      0;

    this.targetAngle =
      0;

    this.targetPathIndex =
      -1;

    this.targetPathT =
      0;

    this.removeMe =
      false;

    this.trail =
      [];
  }


  // ==========================================================
  // 放到电线上
  // ==========================================================

  placeOnWire(
    pathIndex,
    pathT
  ) {

    this.mode =
      "perched";

    this.pathIndex =
      pathIndex;

    this.pathT =
      pathT;

    this.vx = 0;
    this.vy = 0;

    this.perchTimer =
      randomRange(
        CFG.perchStayTime
      );

    this.walkTimer =
      0;

    this.trail =
      [];

    this.snapToWire();
  }


  // ==========================================================
  // 精确吸附电线
  // ==========================================================

  snapToWire() {

    const wireData =
      getPathPositionAndNormal(
        this.pathIndex,
        this.pathT
      );

    const radius =
      CFG.particleSize *
      0.5;

    this.x =
      wireData.x +
      wireData.nx *
      radius;

    this.y =
      wireData.y +
      wireData.ny *
      radius;
  }


  // ==========================================================
  // 开始在线上移动
  // ==========================================================

  startWalking() {

    this.mode =
      "walking";

    this.walkTimer =
      randomRange(
        CFG.wireWalkTime
      );

    this.walkSpeed =
      randomRange(
        CFG.wireWalkSpeed
      );

    this.walkDirection =
      random() < 0.5
        ? -1
        : 1;
  }


  // ==========================================================
  // 起飞
  // ==========================================================

  takeOff(
    forceExit = false
  ) {

    if (
      this.mode !==
      "perched" &&
      this.mode !==
      "walking"
    ) {

      return;
    }

    this.mode =
      forceExit
        ? "exiting"
        : "flying";

    this.pathIndex =
      -1;

    this.flightAge =
      0;

    this.flightLimit =
      randomRange(
        CFG.flightTime
      );

    const horizontalDirection =
      random() < 0.5
        ? -1
        : 1;

    const speedValue =
      randomRange(
        CFG.takeoffSpeed
      );

    this.vx =
      horizontalDirection *
      speedValue;

    this.vy =
      -random(
        80,
        140
      );

    this.targetAngle =
      atan2(
        this.vy,
        this.vx
      );

    this.turnTimer =
      randomRange(
        CFG.directionChangeTime
      );

    if (
      forceExit
    ) {

      this.chooseExitDirection();
    }
  }


  // ==========================================================
  // 初始空中飞行
  // ==========================================================

  startFlyingInside() {

    this.mode =
      "flying";

    this.x =
      random(
        80,
        CFG.referenceWidth - 80
      );

    this.y =
      random(
        60,
        820
      );

    const flightAngle =
      random(
        TWO_PI
      );

    const speedValue =
      randomRange(
        CFG.flightSpeed
      );

    this.vx =
      Math.cos(
        flightAngle
      ) *
      speedValue;

    this.vy =
      Math.sin(
        flightAngle
      ) *
      speedValue *
      0.7;

    this.flightAge =
      random(
        0,
        1
      );

    this.flightLimit =
      randomRange(
        CFG.flightTime
      );

    this.targetAngle =
      flightAngle;

    this.turnTimer =
      randomRange(
        CFG.directionChangeTime
      );
  }


  // ==========================================================
  // 飞入
  // ==========================================================

  startFlyIn() {

    this.mode =
      "entering";

    const enterFromLeft =
      random() < 0.5;

    this.x =
      enterFromLeft
        ? -CFG.outsideMargin
        : CFG.referenceWidth +
          CFG.outsideMargin;

    this.y =
      random(
        80,
        780
      );

    const speedValue =
      randomRange(
        CFG.flyInSpeed
      );

    this.vx =
      enterFromLeft
        ? speedValue
        : -speedValue;

    this.vy =
      random(
        -65,
        65
      );

    this.flightAge =
      0;

    this.flightLimit =
      randomRange(
        CFG.flightTime
      );

    this.targetAngle =
      atan2(
        this.vy,
        this.vx
      );

    this.turnTimer =
      randomRange(
        CFG.directionChangeTime
      );
  }


  // ==========================================================
  // 飞离方向
  // ==========================================================

  chooseExitDirection() {

    const exitLeft =
      random() < 0.5;

    const targetX =
      exitLeft
        ? -CFG.outsideMargin * 2
        : CFG.referenceWidth +
          CFG.outsideMargin * 2;

    const targetY =
      random(
        80,
        760
      );

    this.targetAngle =
      atan2(
        targetY -
        this.y,

        targetX -
        this.x
      );

    const speedValue =
      CFG.flightSpeed[1];

    this.vx =
      Math.cos(
        this.targetAngle
      ) *
      speedValue;

    this.vy =
      Math.sin(
        this.targetAngle
      ) *
      speedValue;
  }


  // ==========================================================
  // 开始降落
  // ==========================================================

  beginLanding() {

    const perchSpot =
      findFreePerch(
        this
      );

    if (
      !perchSpot
    ) {

      return false;
    }

    this.mode =
      "landing";

    this.targetPathIndex =
      perchSpot.pathIndex;

    this.targetPathT =
      perchSpot.pathT;

    return true;
  }


  // ==========================================================
  // UPDATE
  // ==========================================================

  update(dt) {

    if (
      this.mode ===
      "perched"
    ) {

      this.updatePerched(
        dt
      );

    } else if (
      this.mode ===
      "walking"
    ) {

      this.updateWalking(
        dt
      );

    } else if (
      this.mode ===
      "flying" ||
      this.mode ===
      "entering"
    ) {

      this.updateFlying(
        dt
      );

    } else if (
      this.mode ===
      "landing"
    ) {

      this.updateLanding(
        dt
      );

    } else if (
      this.mode ===
      "exiting"
    ) {

      this.updateExiting(
        dt
      );
    }

    this.updateTrail();
  }


  // ==========================================================
  // 停留
  // ==========================================================

  updatePerched(dt) {

    this.snapToWire();

    this.perchTimer -=
      dt;

    if (
      this.perchTimer > 0
    ) {

      return;
    }

    if (
      random() <
      CFG.walkChance
    ) {

      this.startWalking();

    } else {

      this.perchTimer =
        randomRange(
          CFG.perchStayTime
        );
    }
  }


  // ==========================================================
  // 沿线移动
  // ==========================================================

  updateWalking(dt) {

    this.walkTimer -=
      dt;

    const pathLength =
      getPathLength(
        this.pathIndex
      );

    const deltaT =
      (
        this.walkSpeed *
        dt /
        Math.max(
          pathLength,
          1
        )
      ) *
      this.walkDirection;

    const proposedT =
      this.pathT +
      deltaT;

    if (
      isUsablePathT(
        this.pathIndex,
        proposedT
      ) &&
      isWirePositionFree(
        this,
        this.pathIndex,
        proposedT
      )
    ) {

      this.pathT =
        proposedT;

    } else {

      this.walkDirection *=
        -1;
    }

    this.snapToWire();

    if (
      this.walkTimer <= 0
    ) {

      this.mode =
        "perched";

      this.perchTimer =
        randomRange(
          CFG.perchStayTime
        );
    }
  }


  // ==========================================================
  // 飞行
  // ==========================================================

  updateFlying(dt) {

    this.flightAge +=
      dt;

    this.turnTimer -=
      dt;

    if (
      this.turnTimer <= 0
    ) {

      const currentAngle =
        atan2(
          this.vy,
          this.vx
        );

      const changeAmount =
        random(
          CFG.directionChangeAngle[0],
          CFG.directionChangeAngle[1]
        ) *
        (
          random() < 0.5
            ? -1
            : 1
        );

      this.targetAngle =
        currentAngle +
        changeAmount;

      this.turnTimer =
        randomRange(
          CFG.directionChangeTime
        );
    }

    this.applySeparation(
      dt
    );

    this.applyFlightSteering(
      dt
    );

    this.x +=
      this.vx *
      dt;

    this.y +=
      this.vy *
      dt;

    if (
      this.mode ===
      "entering" &&
      this.x > 30 &&
      this.x <
      CFG.referenceWidth - 30
    ) {

      this.mode =
        "flying";
    }

    if (
      this.y <
      CFG.skyTop
    ) {

      this.y =
        CFG.skyTop;

      this.vy =
        Math.abs(
          this.vy
        );
    }

    if (
      this.y >
      CFG.skyBottom
    ) {

      this.y =
        CFG.skyBottom;

      this.vy =
        -Math.abs(
          this.vy
        );
    }

    if (
      this.x < 20
    ) {

      this.x = 20;

      this.vx =
        Math.abs(
          this.vx
        );
    }

    if (
      this.x >
      CFG.referenceWidth - 20
    ) {

      this.x =
        CFG.referenceWidth - 20;

      this.vx =
        -Math.abs(
          this.vx
        );
    }

    if (
      this.flightAge >
      CFG.minimumFlightTime &&
      this.flightAge >
      this.flightLimit
    ) {

      if (
        random() <
        CFG.flyOutChance &&
        getCurrentPopulation() >
        CFG.minVisible
      ) {

        this.mode =
          "exiting";

        this.chooseExitDirection();

      } else {

        this.beginLanding();
      }
    }
  }


  // ==========================================================
  // 飞离
  // ==========================================================

  updateExiting(dt) {

    const desiredSpeed =
      CFG.flightSpeed[1];

    const desiredVX =
      Math.cos(
        this.targetAngle
      ) *
      desiredSpeed;

    const desiredVY =
      Math.sin(
        this.targetAngle
      ) *
      desiredSpeed;

    this.vx =
      lerp(
        this.vx,
        desiredVX,
        2.2 * dt
      );

    this.vy =
      lerp(
        this.vy,
        desiredVY,
        2.2 * dt
      );

    this.x +=
      this.vx *
      dt;

    this.y +=
      this.vy *
      dt;

    if (
      this.x <
      -CFG.outsideMargin ||
      this.x >
      CFG.referenceWidth +
      CFG.outsideMargin ||
      this.y <
      -CFG.outsideMargin ||
      this.y >
      CFG.referenceHeight +
      CFG.outsideMargin
    ) {

      this.removeMe =
        true;
    }
  }


  // ==========================================================
  // 降落
  // ==========================================================

  updateLanding(dt) {

    const wireData =
      getPathPositionAndNormal(
        this.targetPathIndex,
        this.targetPathT
      );

    const radius =
      CFG.particleSize *
      0.5;

    const targetX =
      wireData.x +
      wireData.nx *
      radius;

    const targetY =
      wireData.y +
      wireData.ny *
      radius;

    const dx =
      targetX -
      this.x;

    const dy =
      targetY -
      this.y;

    const gapValue =
      Math.hypot(
        dx,
        dy
      );

    if (
      gapValue < 3
    ) {

      this.placeOnWire(
        this.targetPathIndex,
        this.targetPathT
      );

      return;
    }

    const landingSpeed =
      constrain(
        gapValue * 2.4,
        120,
        260
      );

    const desiredVX =
      dx /
      Math.max(
        gapValue,
        0.001
      ) *
      landingSpeed;

    const desiredVY =
      dy /
      Math.max(
        gapValue,
        0.001
      ) *
      landingSpeed;

    this.vx =
      lerp(
        this.vx,
        desiredVX,
        4.8 * dt
      );

    this.vy =
      lerp(
        this.vy,
        desiredVY,
        4.8 * dt
      );

    this.x +=
      this.vx *
      dt;

    this.y +=
      this.vy *
      dt;
  }


  // ==========================================================
  // 飞行避让
  // ==========================================================

  applySeparation(dt) {

    let pushX = 0;
    let pushY = 0;

    for (
      const other of birds
    ) {

      if (
        other === this ||
        other.mode ===
        "perched" ||
        other.mode ===
        "walking"
      ) {

        continue;
      }

      const dx =
        this.x -
        other.x;

      const dy =
        this.y -
        other.y;

      const gapValue =
        Math.hypot(
          dx,
          dy
        );

      if (
        gapValue > 0 &&
        gapValue <
        CFG.separationDistance
      ) {

        const strength =
          1 -
          gapValue /
          CFG.separationDistance;

        pushX +=
          dx /
          gapValue *
          strength;

        pushY +=
          dy /
          gapValue *
          strength;
      }
    }

    this.vx +=
      pushX *
      CFG.separationStrength *
      dt;

    this.vy +=
      pushY *
      CFG.separationStrength *
      dt;
  }


  // ==========================================================
  // 飞行转向
  // ==========================================================

  applyFlightSteering(dt) {

    let desiredX =
      Math.cos(
        this.targetAngle
      );

    let desiredY =
      Math.sin(
        this.targetAngle
      );

    const edgeZone = 90;

    if (
      this.x <
      edgeZone
    ) {

      desiredX +=
        1.8;
    }

    if (
      this.x >
      CFG.referenceWidth -
      edgeZone
    ) {

      desiredX -=
        1.8;
    }

    if (
      this.y <
      CFG.skyTop +
      edgeZone
    ) {

      desiredY +=
        1.5;
    }

    if (
      this.y >
      CFG.skyBottom -
      edgeZone
    ) {

      desiredY -=
        1.5;
    }

    const desiredMagnitude =
      Math.hypot(
        desiredX,
        desiredY
      );

    if (
      desiredMagnitude > 0
    ) {

      desiredX /=
        desiredMagnitude;

      desiredY /=
        desiredMagnitude;
    }

    const speedValue =
      randomRange(
        CFG.flightSpeed
      );

    this.vx =
      lerp(
        this.vx,
        desiredX *
        speedValue,
        1.4 *
        dt
      );

    this.vy =
      lerp(
        this.vy,
        desiredY *
        speedValue,
        1.4 *
        dt
      );

    const currentSpeed =
      Math.hypot(
        this.vx,
        this.vy
      );

    if (
      currentSpeed >
      CFG.flightSpeed[1]
    ) {

      this.vx =
        this.vx /
        currentSpeed *
        CFG.flightSpeed[1];

      this.vy =
        this.vy /
        currentSpeed *
        CFG.flightSpeed[1];
    }
  }


  // ==========================================================
  // 拖尾
  // ==========================================================

  updateTrail() {

    if (
      !CFG.trailEnabled ||
      this.mode ===
      "perched" ||
      this.mode ===
      "walking"
    ) {

      this.trail = [];

      return;
    }

    this.trail.push({

      x:
        this.x,

      y:
        this.y
    });

    while (
      this.trail.length >
      CFG.trailLength
    ) {

      this.trail.shift();
    }
  }


  drawTrail() {

    if (
      this.trail.length < 2
    ) {

      return;
    }

    const trailColor =
      color(
        CFG.particleColor
      );

    for (
      let i = 1;
      i <
      this.trail.length;
      i++
    ) {

      const opacityValue =
        map(
          i,
          1,
          this.trail.length - 1,
          3,
          CFG.trailOpacity
        );

      trailColor.setAlpha(
        opacityValue
      );

      stroke(
        trailColor
      );

      strokeWeight(
        2
      );

      const trailPosA =
        this.trail[
          i - 1
        ];

      const trailPosB =
        this.trail[i];

      line(
        trailPosA.x,
        trailPosA.y,
        trailPosB.x,
        trailPosB.y
      );
    }
  }


  // ==========================================================
  // 显示
  // ==========================================================

  display() {

    const fillValue =
      color(
        CFG.particleColor
      );

    fillValue.setAlpha(
      CFG.particleOpacity
    );

    fill(
      fillValue
    );

    const strokeValue =
      color(
        CFG.outlineColor
      );

    strokeValue.setAlpha(
      CFG.outlineOpacity
    );

    stroke(
      strokeValue
    );

    strokeWeight(
      CFG.outlineWidth
    );

    circle(
      this.x,
      this.y,
      CFG.particleSize
    );
  }
}


// ============================================================
// 起飞
// ============================================================

function launchPerchedBirds(
  amount,
  forceExit
) {

  let candidates =
    birds.filter(
      bird =>
        bird.mode ===
        "perched" ||
        bird.mode ===
        "walking"
    );

  shuffleValues(
    candidates
  );

  const actualAmount =
    Math.min(
      amount,
      candidates.length
    );

  for (
    let i = 0;
    i < actualAmount;
    i++
  ) {

    candidates[i].takeOff(
      forceExit
    );
  }
}


// ============================================================
// 飞离
// ============================================================

function sendBirdsOutside(
  amount
) {

  const currentAmount =
    getCurrentPopulation();

  if (
    currentAmount <=
    CFG.minVisible
  ) {

    return;
  }

  const allowedAmount =
    Math.min(
      amount,
      currentAmount -
      CFG.minVisible
    );

  launchPerchedBirds(
    allowedAmount,
    true
  );
}


// ============================================================
// 飞入
// ============================================================

function createFlyInBird() {

  if (
    getCurrentPopulation() >=
    CFG.maxVisible
  ) {

    return;
  }

  const bird =
    new SwallowParticle(
      nextBirdId++
    );

  bird.startFlyIn();

  birds.push(
    bird
  );
}


// ============================================================
// 删除飞出粒子
// ============================================================

function removeFinishedBirds() {

  birds =
    birds.filter(
      bird =>
        !bird.removeMe
    );
}


// ============================================================
// 保持最小数量
// ============================================================

function maintainMinimumPopulation() {

  const currentAmount =
    getCurrentPopulation();

  if (
    currentAmount >=
    CFG.minVisible
  ) {

    return;
  }

  const missing =
    CFG.minVisible -
    currentAmount;

  for (
    let i = 0;
    i < missing;
    i++
  ) {

    createFlyInBird();
  }
}


// ============================================================
// 当前数量
// ============================================================

function getCurrentPopulation() {

  return birds.filter(
    bird =>
      !bird.removeMe
  ).length;
}


// ============================================================
// 找空闲停栖位置
// ============================================================

function findFreePerch(
  bird
) {

  for (
    let attempt = 0;
    attempt < 220;
    attempt++
  ) {

    const pathIndex =
      Math.floor(
        random(
          WIRE_PATHS.length
        )
      );

    const pathData =
      WIRE_PATHS[
        pathIndex
      ];

    const usableRange =
      pathData.usable[
        Math.floor(
          random(
            pathData.usable.length
          )
        )
      ];

    const pathT =
      random(
        usableRange[0],
        usableRange[1]
      );

    if (
      isWirePositionFree(
        bird,
        pathIndex,
        pathT
      )
    ) {

      return {

        pathIndex:
          pathIndex,

        pathT:
          pathT
      };
    }
  }

  return null;
}


// ============================================================
// 位置是否空闲
// ============================================================

function isWirePositionFree(
  bird,
  pathIndex,
  pathT
) {

  const candidateData =
    getPathPositionAndNormal(
      pathIndex,
      pathT
    );

  const radius =
    CFG.particleSize *
    0.5;

  const candidateX =
    candidateData.x +
    candidateData.nx *
    radius;

  const candidateY =
    candidateData.y +
    candidateData.ny *
    radius;

  for (
    const other of birds
  ) {

    if (
      other === bird
    ) {

      continue;
    }

    if (
      other.mode !==
      "perched" &&
      other.mode !==
      "walking" &&
      other.mode !==
      "landing"
    ) {

      continue;
    }

    let otherX =
      other.x;

    let otherY =
      other.y;

    if (
      other.mode ===
      "landing"
    ) {

      const otherData =
        getPathPositionAndNormal(
          other.targetPathIndex,
          other.targetPathT
        );

      otherX =
        otherData.x +
        otherData.nx *
        radius;

      otherY =
        otherData.y +
        otherData.ny *
        radius;
    }

    const gapValue =
      Math.hypot(
        candidateX -
        otherX,

        candidateY -
        otherY
      );

    if (
      gapValue <
      CFG.minimumPerchGap
    ) {

      return false;
    }
  }

  return true;
}


// ============================================================
// 是否位于可用电线区间
// ============================================================

function isUsablePathT(
  pathIndex,
  pathT
) {

  const pathData =
    WIRE_PATHS[
      pathIndex
    ];

  for (
    const usableRange of
    pathData.usable
  ) {

    if (
      pathT >=
      usableRange[0] &&
      pathT <=
      usableRange[1]
    ) {

      return true;
    }
  }

  return false;
}


// ============================================================
// 路径长度
// ============================================================

function getPathLength(
  pathIndex
) {

  const pts =
    WIRE_PATHS[
      pathIndex
    ].pts;

  let totalLength = 0;

  for (
    let i = 1;
    i < pts.length;
    i++
  ) {

    totalLength +=
      Math.hypot(
        pts[i][0] -
        pts[i - 1][0],

        pts[i][1] -
        pts[i - 1][1]
      );
  }

  return totalLength;
}


// ============================================================
// 获取电线位置 + 上方法线
// ============================================================

function getPathPositionAndNormal(
  pathIndex,
  pathT
) {

  const pts =
    WIRE_PATHS[
      pathIndex
    ].pts;

  pathT =
    constrain(
      pathT,
      0,
      1
    );

  const segmentLengths = [];

  let totalLength = 0;

  for (
    let i = 1;
    i < pts.length;
    i++
  ) {

    const segmentLength =
      Math.hypot(
        pts[i][0] -
        pts[i - 1][0],

        pts[i][1] -
        pts[i - 1][1]
      );

    segmentLengths.push(
      segmentLength
    );

    totalLength +=
      segmentLength;
  }

  const targetLength =
    pathT *
    totalLength;

  let accumulatedLength = 0;

  for (
    let i = 0;
    i <
    segmentLengths.length;
    i++
  ) {

    const segmentLength =
      segmentLengths[i];

    if (
      accumulatedLength +
      segmentLength >=
      targetLength
    ) {

      const localT =
        (
          targetLength -
          accumulatedLength
        ) /
        Math.max(
          segmentLength,
          0.001
        );

      const x1 =
        pts[i][0];

      const y1 =
        pts[i][1];

      const x2 =
        pts[i + 1][0];

      const y2 =
        pts[i + 1][1];

      const xValue =
        lerp(
          x1,
          x2,
          localT
        );

      const yValue =
        lerp(
          y1,
          y2,
          localT
        );

      const tangentX =
        x2 -
        x1;

      const tangentY =
        y2 -
        y1;

      const tangentLength =
        Math.max(
          Math.hypot(
            tangentX,
            tangentY
          ),
          0.001
        );

      let normalX =
        tangentY /
        tangentLength;

      let normalY =
        -tangentX /
        tangentLength;

      // 屏幕坐标中 y 越小越靠上
      if (
        normalY > 0
      ) {

        normalX *= -1;
        normalY *= -1;
      }

      return {

        x:
          xValue,

        y:
          yValue,

        nx:
          normalX,

        ny:
          normalY
      };
    }

    accumulatedLength +=
      segmentLength;
  }

  const finalIndex =
    pts.length - 1;

  return {

    x:
      pts[
        finalIndex
      ][0],

    y:
      pts[
        finalIndex
      ][1],

    nx:
      0,

    ny:
      -1
  };
}


// ============================================================
// 随机范围
// ============================================================

function randomRange(
  rangeValue
) {

  return random(
    rangeValue[0],
    rangeValue[1]
  );
}


// ============================================================
// 随机整数
// ============================================================

function randomInteger(
  rangeValue
) {

  return Math.floor(
    random(
      rangeValue[0],
      rangeValue[1] + 1
    )
  );
}


// ============================================================
// 数组随机排序
// ============================================================

function shuffleValues(
  values
) {

  for (
    let i =
      values.length - 1;

    i > 0;

    i--
  ) {

    const randomIndex =
      Math.floor(
        random(
          i + 1
        )
      );

    const temporaryValue =
      values[i];

    values[i] =
      values[
        randomIndex
      ];

    values[
      randomIndex
    ] =
      temporaryValue;
  }
}


// ============================================================
// 调试显示电线轨迹
// ============================================================

function drawWireDebug() {

  noFill();

  stroke(
    255,
    40,
    40,
    220
  );

  strokeWeight(
    3
  );

  for (
    let pathIndex = 0;
    pathIndex <
    WIRE_PATHS.length;
    pathIndex++
  ) {

    const pathData =
      WIRE_PATHS[
        pathIndex
      ];

    for (
      const usableRange of
      pathData.usable
    ) {

      let previousData =
        getPathPositionAndNormal(
          pathIndex,
          usableRange[0]
        );

      const sampleAmount =
        100;

      for (
        let sampleIndex = 1;
        sampleIndex <=
        sampleAmount;
        sampleIndex++
      ) {

        const pathT =
          lerp(
            usableRange[0],
            usableRange[1],
            sampleIndex /
            sampleAmount
          );

        const currentData =
          getPathPositionAndNormal(
            pathIndex,
            pathT
          );

        line(
          previousData.x,
          previousData.y,
          currentData.x,
          currentData.y
        );

        previousData =
          currentData;
      }
    }
  }
}


// ============================================================
// 窗口尺寸变化
// ============================================================

function windowResized() {

  resizeCanvas(
    windowWidth,
    windowHeight
  );
}