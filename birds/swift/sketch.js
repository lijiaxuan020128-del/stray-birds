// ============================================================
// 普通雨燕 · p5.js 2.3.4
//
// 文件：
// 普通雨燕16：9.png
// 普通雨燕16：9前景.png
//
// 本版重点：
// - 44只
// - 不固定分组
// - 大量运动穿过画面中央
// - 边缘不是贴边掉头，而是跨画面飞行
// - 中央是“通行区”，不是吸附点
// - 临时 screaming party 高频穿越中央
// - 前景图只做遮挡，不显示
// ============================================================


const CFG = {

  backgroundFile: "普通雨燕16：9.png",
  foregroundFile: "普通雨燕16：9前景.png",

  referenceWidth: 1125,
  referenceHeight: 633,


  // ==========================================================
  // 外观
  // ==========================================================

  particleColor: "#26353D",
  particleOpacity: 250,

  particleSize: 9,

  outlineColor: "#B8C4C7",
  outlineOpacity: 160,
  outlineWidth: 0.55,


  // ==========================================================
  // 数量
  // ==========================================================

  particleCount: 44,


  // ==========================================================
  // 普通速度
  // ==========================================================

  speedMin: 155,
  speedMax: 210,

  maxSpeed: 235,


  // ==========================================================
  // 整体方向
  // ==========================================================

  flowStrength: 0.55,

  individualTurn: 0.25,


  // ==========================================================
  // 邻居
  // ==========================================================

  neighborRadius: 95,

  separationRadius: 25,

  cohesionStrength: 0.07,

  alignmentStrength: 0.22,

  separationStrength: 0.78,


  // ==========================================================
  // 中央穿越
  //
  // 数值越大，越倾向穿过中央天空。
  // 但不是吸附到中心点。
  // ==========================================================

  centerPassStrength: 1.05,

  centerPassChance: 0.78,


  // ==========================================================
  // 中央通行区域
  // ==========================================================

  centerX: 562,
  centerY: 310,

  centerSpreadX: 210,
  centerSpreadY: 120,


  // ==========================================================
  // 流场
  // ==========================================================

  flowChangeSpeed: 0.07,

  curveStrength: 0.25,


  // ==========================================================
  // screaming party
  // ==========================================================

  partyIntervalMin: 9,
  partyIntervalMax: 15,

  partyAmountMin: 6,
  partyAmountMax: 10,

  partyDurationMin: 3.2,
  partyDurationMax: 4.8,

  partySpeedMin: 240,
  partySpeedMax: 300,

  partyGap: 24,

  partyTurnStrength: 1.9,


  // ==========================================================
  // party释放
  // ==========================================================

  releaseDuration: 2.2,


  // ==========================================================
  // 边缘
  // ==========================================================

  edgeMargin: 110,


  // ==========================================================
  // 蒙版
  // ==========================================================

  whiteThreshold: 242,


  // ==========================================================
  // 调试
  // ==========================================================

  showTargets: false
};


// ============================================================
// 图片
// ============================================================

let bgImg = null;
let foregroundImg = null;
let skyMaskImg = null;


// ============================================================
// 粒子层
// ============================================================

let birdLayer = null;


// ============================================================
// 雨燕
// ============================================================

let swifts = [];


// ============================================================
// 整体流场
// ============================================================

let globalFlowAngle = 0;

let globalTargetAngle = 0;

let globalFlowTimer = 0;

let flowPhase = 0;


// ============================================================
// screaming party
// ============================================================

let partyActive = false;

let partyBirds = [];

let partyLeader = null;

let partyEndTime = 0;

let nextPartyTime = 0;


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


  // ==========================================================
  // 背景
  // ==========================================================

  try {

    bgImg =
      await loadImage(
        CFG.backgroundFile
      );

  } catch (loadError) {

    showLoadError(
      CFG.backgroundFile
    );

    console.error(
      loadError
    );

    return;
  }


  // ==========================================================
  // 前景蒙版
  // ==========================================================

  try {

    foregroundImg =
      await loadImage(
        CFG.foregroundFile
      );

  } catch (loadError) {

    showLoadError(
      CFG.foregroundFile
    );

    console.error(
      loadError
    );

    return;
  }


  createSkyMask();


  // ==========================================================
  // 离屏粒子层
  // ==========================================================

  birdLayer =
    createGraphics(
      CFG.referenceWidth,
      CFG.referenceHeight
    );

  birdLayer.pixelDensity(1);


  // ==========================================================
  // 初始流向
  // ==========================================================

  globalFlowAngle =
    -0.08;


  globalTargetAngle =
    globalFlowAngle;


  globalFlowTimer =
    random(
      3.5,
      6
    );


  // ==========================================================
  // 创建雨燕
  // ==========================================================

  createSwifts();


  const now =
    millis() / 1000;


  nextPartyTime =
    now +
    random(
      CFG.partyIntervalMin,
      CFG.partyIntervalMax
    );


  loop();
}


// ============================================================
// 蒙版
// ============================================================

function createSkyMask() {

  foregroundImg.resize(
    CFG.referenceWidth,
    CFG.referenceHeight
  );


  foregroundImg.loadPixels();


  skyMaskImg =
    createImage(
      CFG.referenceWidth,
      CFG.referenceHeight
    );


  skyMaskImg.loadPixels();


  const sourcePixels =
    foregroundImg.pixels;


  const targetPixels =
    skyMaskImg.pixels;


  for (
    let i = 0;
    i < sourcePixels.length;
    i += 4
  ) {

    const redValue =
      sourcePixels[i];


    const greenValue =
      sourcePixels[i + 1];


    const blueValue =
      sourcePixels[i + 2];


    const isSky =
      redValue >= CFG.whiteThreshold &&
      greenValue >= CFG.whiteThreshold &&
      blueValue >= CFG.whiteThreshold;


    targetPixels[i] =
      255;


    targetPixels[i + 1] =
      255;


    targetPixels[i + 2] =
      255;


    targetPixels[i + 3] =
      isSky
        ? 255
        : 0;
  }


  skyMaskImg.updatePixels();
}


// ============================================================
// 创建雨燕
// ============================================================

function createSwifts() {

  swifts = [];


  for (
    let i = 0;
    i < CFG.particleCount;
    i++
  ) {

    swifts.push(
      new SwiftParticle(i)
    );
  }
}


// ============================================================
// DRAW
// ============================================================

function draw() {

  if (
    !bgImg ||
    !skyMaskImg ||
    !birdLayer
  ) {

    return;
  }


  const dt =
    min(
      deltaTime / 1000,
      0.035
    );


  const now =
    millis() / 1000;


  updateGlobalFlow(
    dt
  );


  updateParty(
    now,
    dt
  );


  for (
    const swift of swifts
  ) {

    swift.update(
      dt
    );
  }


  // ==========================================================
  // 背景
  // ==========================================================

  const view =
    getView();


  image(
    bgImg,
    view.x,
    view.y,
    view.w,
    view.h
  );


  // ==========================================================
  // 粒子
  // ==========================================================

  birdLayer.clear();


  for (
    const swift of swifts
  ) {

    swift.display(
      birdLayer
    );
  }


  // ==========================================================
  // 调试目标
  // ==========================================================

  if (
    CFG.showTargets
  ) {

    birdLayer.push();

    birdLayer.noFill();

    birdLayer.stroke(
      255,
      0,
      0,
      180
    );

    birdLayer.strokeWeight(1);


    birdLayer.ellipse(
      CFG.centerX,
      CFG.centerY,
      CFG.centerSpreadX * 2,
      CFG.centerSpreadY * 2
    );


    birdLayer.pop();
  }


  // ==========================================================
  // 遮挡
  // ==========================================================

  const maskedBirds =
    birdLayer.get();


  maskedBirds.mask(
    skyMaskImg
  );


  image(
    maskedBirds,
    view.x,
    view.y,
    view.w,
    view.h
  );
}


// ============================================================
// 整体流场
// ============================================================

function updateGlobalFlow(
  dt
) {

  flowPhase +=
    dt *
    CFG.flowChangeSpeed;


  globalFlowTimer -=
    dt;


  if (
    globalFlowTimer <=
    0
  ) {

    globalTargetAngle =
      globalFlowAngle +
      random(
        -0.38,
        0.38
      );


    globalFlowTimer =
      random(
        4,
        7
      );
  }


  const slowCurve =
    sin(
      flowPhase *
      TWO_PI
    ) *
    CFG.curveStrength;


  const desiredAngle =
    globalTargetAngle +
    slowCurve;


  const angleDifference =
    shortestAngleDifference(
      globalFlowAngle,
      desiredAngle
    );


  globalFlowAngle +=
    angleDifference *
    0.38 *
    dt;
}


// ============================================================
// Swift
// ============================================================

class SwiftParticle {

  constructor(
    indexValue
  ) {

    this.index =
      indexValue;


    // ========================================================
    // 初始位置
    //
    // 中央区域也直接分配一部分。
    // ========================================================

    if (
      random() <
      0.58
    ) {

      this.x =
        random(
          180,
          CFG.referenceWidth - 180
        );


      this.y =
        random(
          120,
          CFG.referenceHeight - 120
        );

    } else {

      this.x =
        random(
          70,
          CFG.referenceWidth - 70
        );


      this.y =
        random(
          80,
          CFG.referenceHeight - 80
        );
    }


    // ========================================================
    // 初始方向
    // ========================================================

    const initialAngle =
      globalFlowAngle +
      random(
        -0.48,
        0.48
      );


    this.baseSpeed =
      random(
        CFG.speedMin,
        CFG.speedMax
      );


    this.vx =
      cos(
        initialAngle
      ) *
      this.baseSpeed;


    this.vy =
      sin(
        initialAngle
      ) *
      this.baseSpeed;


    this.phase =
      random(
        TWO_PI
      );


    this.phaseSpeed =
      random(
        0.32,
        0.65
      );


    this.sizeScale =
      random(
        0.94,
        1.06
      );


    // ========================================================
    // 穿越中央目标
    // ========================================================

    this.hasCenterTarget =
      false;


    this.centerTargetX =
      CFG.centerX;


    this.centerTargetY =
      CFG.centerY;


    this.centerTargetTimer =
      random(
        1,
        4
      );


    // ========================================================
    // party
    // ========================================================

    this.isParty =
      false;


    this.partyIndex =
      -1;


    // ========================================================
    // party结束后的释放
    // ========================================================

    this.releaseAmount =
      0;


    this.releaseSide =
      random() <
      0.5
        ? -1
        : 1;
  }


  // ==========================================================
  // UPDATE
  // ==========================================================

  update(
    dt
  ) {

    if (
      this.isParty &&
      partyActive
    ) {

      this.updatePartyFlight(
        dt
      );

      return;
    }


    this.updateFreeFlight(
      dt
    );
  }


  // ==========================================================
  // 普通飞行
  // ==========================================================

  updateFreeFlight(
    dt
  ) {

    this.phase +=
      this.phaseSpeed *
      dt;


    this.centerTargetTimer -=
      dt;


    // ========================================================
    // 接近外围时，较大概率获得中央穿越目标
    // ========================================================

    const nearOuterArea =

      this.x <
      CFG.edgeMargin * 1.8 ||

      this.x >
      CFG.referenceWidth -
      CFG.edgeMargin * 1.8 ||

      this.y <
      CFG.edgeMargin * 1.45 ||

      this.y >
      CFG.referenceHeight -
      CFG.edgeMargin * 1.45;


    if (
      nearOuterArea &&
      !this.hasCenterTarget &&
      random() <
      0.035
    ) {

      if (
        random() <
        CFG.centerPassChance
      ) {

        assignCenterTarget(
          this
        );
      }
    }


    // ========================================================
    // 偶尔重新获得中央目标
    // ========================================================

    if (
      this.centerTargetTimer <=
      0
    ) {

      if (
        random() <
        0.42
      ) {

        assignCenterTarget(
          this
        );
      }


      this.centerTargetTimer =
        random(
          3,
          7
        );
    }


    const currentSpeed =
      max(
        sqrt(
          this.vx * this.vx +
          this.vy * this.vy
        ),
        0.001
      );


    const currentAngle =
      atan2(
        this.vy,
        this.vx
      );


    // ========================================================
    // 整体流向
    // ========================================================

    const personalFlow =
      globalFlowAngle +
      sin(
        this.phase
      ) *
      CFG.individualTurn;


    const flowDifference =
      shortestAngleDifference(
        currentAngle,
        personalFlow
      );


    let turnForce =
      flowDifference *
      CFG.flowStrength;


    // ========================================================
    // 中央穿越
    // ========================================================

    if (
      this.hasCenterTarget
    ) {

      const dx =
        this.centerTargetX -
        this.x;


      const dy =
        this.centerTargetY -
        this.y;


      const targetDistance =
        sqrt(
          dx * dx +
          dy * dy
        );


      const targetAngle =
        atan2(
          dy,
          dx
        );


      const targetDifference =
        shortestAngleDifference(
          currentAngle,
          targetAngle
        );


      // ------------------------------------------------------
      // 距离越远，中央引导越明显。
      // 接近目标后逐渐减弱。
      // ------------------------------------------------------

      const targetStrength =
        constrain(
          targetDistance /
          260,
          0.25,
          1
        );


      turnForce +=
        targetDifference *
        CFG.centerPassStrength *
        targetStrength;


      // ------------------------------------------------------
      // 已经穿入中央区域后取消目标。
      //
      // 鸟会按照当前惯性继续穿出去，
      // 而不是停在中央。
      // ------------------------------------------------------

      if (
        targetDistance <
        80
      ) {

        this.hasCenterTarget =
          false;


        this.centerTargetTimer =
          random(
            2.5,
            5.5
          );
      }
    }


    // ========================================================
    // 邻居关系
    // ========================================================

    let neighborCount =
      0;


    let averageX =
      0;


    let averageY =
      0;


    let averageVX =
      0;


    let averageVY =
      0;


    let separateX =
      0;


    let separateY =
      0;


    for (
      const other of swifts
    ) {

      if (
        other ===
        this ||
        other.isParty
      ) {

        continue;
      }


      const dx =
        other.x -
        this.x;


      const dy =
        other.y -
        this.y;


      const distanceSquared =
        dx * dx +
        dy * dy;


      if (
        distanceSquared >
        CFG.neighborRadius *
        CFG.neighborRadius
      ) {

        continue;
      }


      const distanceValue =
        sqrt(
          distanceSquared
        );


      neighborCount++;


      averageX +=
        other.x;


      averageY +=
        other.y;


      averageVX +=
        other.vx;


      averageVY +=
        other.vy;


      // ------------------------------------------------------
      // 防止重叠
      // ------------------------------------------------------

      if (
        distanceValue <
        CFG.separationRadius &&
        distanceValue >
        0.001
      ) {

        const strength =
          1 -
          distanceValue /
          CFG.separationRadius;


        separateX -=
          dx /
          distanceValue *
          strength;


        separateY -=
          dy /
          distanceValue *
          strength;
      }
    }


    if (
      neighborCount >
      0
    ) {

      averageX /=
        neighborCount;


      averageY /=
        neighborCount;


      averageVX /=
        neighborCount;


      averageVY /=
        neighborCount;


      // ======================================================
      // 轻微聚合
      // ======================================================

      const centerAngle =
        atan2(
          averageY -
          this.y,
          averageX -
          this.x
        );


      turnForce +=

        shortestAngleDifference(
          currentAngle,
          centerAngle
        ) *

        CFG.cohesionStrength;


      // ======================================================
      // 同向
      // ======================================================

      const alignmentAngle =
        atan2(
          averageVY,
          averageVX
        );


      turnForce +=

        shortestAngleDifference(
          currentAngle,
          alignmentAngle
        ) *

        CFG.alignmentStrength;


      // ======================================================
      // 避让
      // ======================================================

      if (
        abs(
          separateX
        ) +
        abs(
          separateY
        ) >
        0.001
      ) {

        const separationAngle =
          atan2(
            separateY,
            separateX
          );


        turnForce +=

          shortestAngleDifference(
            currentAngle,
            separationAngle
          ) *

          CFG.separationStrength;
      }
    }


    // ========================================================
    // 边缘
    //
    // 关键变化：
    // 不让鸟沿边缘兜圈。
    // 边缘的目标是重新穿过画面。
    // ========================================================

    turnForce +=
      calculateCrossCanvasTurn(
        this,
        currentAngle
      );


    // ========================================================
    // party结束后散开
    // ========================================================

    if (
      this.releaseAmount >
      0
    ) {

      turnForce +=
        this.releaseSide *
        0.35 *
        this.releaseAmount;


      this.releaseAmount -=
        dt /
        CFG.releaseDuration;


      this.releaseAmount =
        max(
          0,
          this.releaseAmount
        );
    }


    // ========================================================
    // 更新方向
    // ========================================================

    const newAngle =
      currentAngle +
      turnForce *
      dt;


    // ========================================================
    // 速度
    // ========================================================

    const targetSpeed =
      this.baseSpeed +
      sin(
        this.phase *
        1.35
      ) *
      11;


    const newSpeed =
      lerp(
        currentSpeed,
        targetSpeed,
        0.035
      );


    this.vx =
      cos(
        newAngle
      ) *
      newSpeed;


    this.vy =
      sin(
        newAngle
      ) *
      newSpeed;


    // ========================================================
    // 移动
    // ========================================================

    this.x +=
      this.vx *
      dt;


    this.y +=
      this.vy *
      dt;


    keepInside(
      this
    );
  }


  // ==========================================================
  // screaming party
  // ==========================================================

  updatePartyFlight(
    dt
  ) {

    if (
      !partyLeader
    ) {

      return;
    }


    // ========================================================
    // 领航者
    // ========================================================

    if (
      this ===
      partyLeader
    ) {

      partyLeader.partyTurnTimer -=
        dt;


      // ======================================================
      // 优先朝中央目标飞
      // ======================================================

      const dx =
        partyLeader.partyTargetX -
        this.x;


      const dy =
        partyLeader.partyTargetY -
        this.y;


      const distanceToTarget =
        sqrt(
          dx * dx +
          dy * dy
        );


      if (
        distanceToTarget >
        75
      ) {

        const desiredAngle =
          atan2(
            dy,
            dx
          );


        partyLeader.partyTargetAngle =
          desiredAngle;

      } else {

        // ----------------------------------------------------
        // 已穿过中央，继续向同方向飞
        // ----------------------------------------------------

        partyLeader.partyTargetX =
          this.x +
          cos(
            partyLeader.partyAngle
          ) *
          600;


        partyLeader.partyTargetY =
          this.y +
          sin(
            partyLeader.partyAngle
          ) *
          400;
      }


      // ======================================================
      // 轻微高速弧线
      // ======================================================

      if (
        partyLeader.partyTurnTimer <=
        0
      ) {

        partyLeader.partyTargetAngle +=
          random(
            -0.22,
            0.22
          );


        partyLeader.partyTurnTimer =
          random(
            0.7,
            1.3
          );
      }


      const angleDifference =
        shortestAngleDifference(
          partyLeader.partyAngle,
          partyLeader.partyTargetAngle
        );


      partyLeader.partyAngle +=
        angleDifference *
        CFG.partyTurnStrength *
        dt;


      this.vx =
        cos(
          partyLeader.partyAngle
        ) *
        partyLeader.partySpeed;


      this.vy =
        sin(
          partyLeader.partyAngle
        ) *
        partyLeader.partySpeed;


      this.x +=
        this.vx *
        dt;


      this.y +=
        this.vy *
        dt;


      keepInside(
        this
      );


      return;
    }


    // ========================================================
    // party其他成员
    // ========================================================

    const previousIndex =
      max(
        0,
        this.partyIndex - 1
      );


    const previousBird =
      partyBirds[
        previousIndex
      ];


    if (
      !previousBird
    ) {

      return;
    }


    const previousSpeed =
      max(
        sqrt(
          previousBird.vx *
          previousBird.vx +
          previousBird.vy *
          previousBird.vy
        ),
        0.001
      );


    const directionX =
      previousBird.vx /
      previousSpeed;


    const directionY =
      previousBird.vy /
      previousSpeed;


    const sideX =
      -directionY;


    const sideY =
      directionX;


    const sideOffset =
      sin(
        millis() *
        0.004 +
        this.partyIndex *
        1.7
      ) *
      8;


    const targetX =
      previousBird.x -
      directionX *
      CFG.partyGap +
      sideX *
      sideOffset;


    const targetY =
      previousBird.y -
      directionY *
      CFG.partyGap +
      sideY *
      sideOffset;


    const dx =
      targetX -
      this.x;


    const dy =
      targetY -
      this.y;


    const distanceValue =
      max(
        sqrt(
          dx * dx +
          dy * dy
        ),
        0.001
      );


    const speedValue =
      constrain(

        partyLeader.partySpeed +
        (
          distanceValue -
          CFG.partyGap
        ) *
        1.7,

        CFG.partySpeedMin,

        CFG.partySpeedMax + 40
      );


    this.vx =
      dx /
      distanceValue *
      speedValue;


    this.vy =
      dy /
      distanceValue *
      speedValue;


    this.x +=
      this.vx *
      dt;


    this.y +=
      this.vy *
      dt;


    keepInside(
      this
    );
  }


  // ==========================================================
  // DISPLAY
  // ==========================================================

  display(
    graphicsLayer
  ) {

    const fillValue =
      color(
        CFG.particleColor
      );


    fillValue.setAlpha(
      CFG.particleOpacity
    );


    graphicsLayer.fill(
      fillValue
    );


    const outlineValue =
      color(
        CFG.outlineColor
      );


    outlineValue.setAlpha(
      CFG.outlineOpacity
    );


    graphicsLayer.stroke(
      outlineValue
    );


    graphicsLayer.strokeWeight(
      CFG.outlineWidth
    );


    graphicsLayer.circle(
      this.x,
      this.y,
      CFG.particleSize *
      this.sizeScale
    );
  }
}


// ============================================================
// 给普通个体分配中央穿越点
//
// 注意不是固定中心点。
// 每只鸟都会经过中央的一片区域。
// ============================================================

function assignCenterTarget(
  swift
) {

  swift.hasCenterTarget =
    true;


  swift.centerTargetX =
    CFG.centerX +
    random(
      -CFG.centerSpreadX,
      CFG.centerSpreadX
    );


  swift.centerTargetY =
    CFG.centerY +
    random(
      -CFG.centerSpreadY,
      CFG.centerSpreadY
    );
}


// ============================================================
// 边缘 → 跨画面
// ============================================================

function calculateCrossCanvasTurn(
  swift,
  currentAngle
) {

  const margin =
    CFG.edgeMargin;


  let targetX =
    null;


  let targetY =
    null;


  // ==========================================================
  // 左侧
  // ==========================================================

  if (
    swift.x <
    margin
  ) {

    targetX =
      random(
        CFG.referenceWidth * 0.55,
        CFG.referenceWidth * 0.78
      );


    targetY =
      random(
        CFG.referenceHeight * 0.28,
        CFG.referenceHeight * 0.72
      );
  }


  // ==========================================================
  // 右侧
  // ==========================================================

  else if (
    swift.x >
    CFG.referenceWidth -
    margin
  ) {

    targetX =
      random(
        CFG.referenceWidth * 0.22,
        CFG.referenceWidth * 0.45
      );


    targetY =
      random(
        CFG.referenceHeight * 0.28,
        CFG.referenceHeight * 0.72
      );
  }


  // ==========================================================
  // 上侧
  // ==========================================================

  else if (
    swift.y <
    margin
  ) {

    targetX =
      random(
        CFG.referenceWidth * 0.28,
        CFG.referenceWidth * 0.72
      );


    targetY =
      random(
        CFG.referenceHeight * 0.52,
        CFG.referenceHeight * 0.74
      );
  }


  // ==========================================================
  // 下侧
  // ==========================================================

  else if (
    swift.y >
    CFG.referenceHeight -
    margin
  ) {

    targetX =
      random(
        CFG.referenceWidth * 0.28,
        CFG.referenceWidth * 0.72
      );


    targetY =
      random(
        CFG.referenceHeight * 0.25,
        CFG.referenceHeight * 0.48
      );
  }


  if (
    targetX === null
  ) {

    return 0;
  }


  const desiredAngle =
    atan2(
      targetY -
      swift.y,
      targetX -
      swift.x
    );


  const difference =
    shortestAngleDifference(
      currentAngle,
      desiredAngle
    );


  return (
    difference *
    1.8
  );
}


// ============================================================
// screaming party
// ============================================================

function updateParty(
  now,
  dt
) {

  if (
    !partyActive &&
    now >= nextPartyTime
  ) {

    startParty(
      now
    );
  }


  if (
    partyActive &&
    now >= partyEndTime
  ) {

    endParty(
      now
    );
  }
}


// ============================================================
// 开始 party
// ============================================================

function startParty(
  now
) {

  const freeBirds =
    swifts.filter(
      swift =>
        !swift.isParty
    );


  if (
    freeBirds.length <
    CFG.partyAmountMin
  ) {

    return;
  }


  // ==========================================================
  // 尽量选择外围的一只作为起始点
  //
  // 这样party会真正横穿画面。
  // ==========================================================

  const outerBirds =
    freeBirds.filter(

      swift =>

        swift.x <
        CFG.referenceWidth * 0.3 ||

        swift.x >
        CFG.referenceWidth * 0.7 ||

        swift.y <
        CFG.referenceHeight * 0.28 ||

        swift.y >
        CFG.referenceHeight * 0.72
    );


  let seed = null;


  if (
    outerBirds.length >
    0
  ) {

    seed =
      random(
        outerBirds
      );

  } else {

    seed =
      random(
        freeBirds
      );
  }


  // ==========================================================
  // 找种子附近的鸟
  // ==========================================================

  const sortedBirds =
    freeBirds.slice();


  sortedBirds.sort(

    (
      birdA,
      birdB
    ) => {

      const dxA =
        birdA.x -
        seed.x;


      const dyA =
        birdA.y -
        seed.y;


      const distanceA =
        dxA * dxA +
        dyA * dyA;


      const dxB =
        birdB.x -
        seed.x;


      const dyB =
        birdB.y -
        seed.y;


      const distanceB =
        dxB * dxB +
        dyB * dyB;


      return (
        distanceA -
        distanceB
      );
    }
  );


  const amount =
    min(

      floor(
        random(
          CFG.partyAmountMin,
          CFG.partyAmountMax + 1
        )
      ),

      sortedBirds.length
    );


  partyBirds =
    sortedBirds.slice(
      0,
      amount
    );


  partyLeader =
    partyBirds[0];


  // ==========================================================
  // 起始方向使用当前方向
  // ==========================================================

  const currentSpeed =
    max(
      sqrt(
        partyLeader.vx *
        partyLeader.vx +
        partyLeader.vy *
        partyLeader.vy
      ),
      0.001
    );


  partyLeader.partyAngle =
    atan2(
      partyLeader.vy,
      partyLeader.vx
    );


  // ==========================================================
  // party的目标明确放在中央区域
  // ==========================================================

  partyLeader.partyTargetX =
    CFG.centerX +
    random(
      -130,
      130
    );


  partyLeader.partyTargetY =
    CFG.centerY +
    random(
      -85,
      85
    );


  partyLeader.partyTargetAngle =
    atan2(

      partyLeader.partyTargetY -
      partyLeader.y,

      partyLeader.partyTargetX -
      partyLeader.x
    );


  partyLeader.partySpeed =
    random(
      CFG.partySpeedMin,
      CFG.partySpeedMax
    );


  partyLeader.partyTurnTimer =
    random(
      0.6,
      1.1
    );


  for (
    let i = 0;
    i < partyBirds.length;
    i++
  ) {

    partyBirds[i].isParty =
      true;


    partyBirds[i].partyIndex =
      i;


    partyBirds[i].hasCenterTarget =
      false;
  }


  partyActive =
    true;


  partyEndTime =
    now +
    random(
      CFG.partyDurationMin,
      CFG.partyDurationMax
    );
}


// ============================================================
// 结束 party
// ============================================================

function endParty(
  now
) {

  for (
    const swift of partyBirds
  ) {

    swift.isParty =
      false;


    swift.partyIndex =
      -1;


    const currentSpeed =
      max(
        sqrt(
          swift.vx *
          swift.vx +
          swift.vy *
          swift.vy
        ),
        0.001
      );


    const currentAngle =
      atan2(
        swift.vy,
        swift.vx
      );


    swift.baseSpeed =
      random(
        CFG.speedMin,
        CFG.speedMax
      );


    swift.vx =
      cos(
        currentAngle
      ) *
      min(
        currentSpeed,
        CFG.maxSpeed
      );


    swift.vy =
      sin(
        currentAngle
      ) *
      min(
        currentSpeed,
        CFG.maxSpeed
      );


    swift.releaseAmount =
      1;


    swift.releaseSide =
      random() <
      0.5
        ? -1
        : 1;


    swift.centerTargetTimer =
      random(
        2,
        5
      );
  }


  partyBirds = [];

  partyLeader = null;

  partyActive =
    false;


  nextPartyTime =
    now +
    random(
      CFG.partyIntervalMin,
      CFG.partyIntervalMax
    );
}


// ============================================================
// 防止彻底丢失
// ============================================================

function keepInside(
  swift
) {

  const outsideMargin =
    55;


  if (
    swift.x <
    -outsideMargin
  ) {

    swift.x =
      -outsideMargin;


    assignCenterTarget(
      swift
    );
  }


  if (
    swift.x >
    CFG.referenceWidth +
    outsideMargin
  ) {

    swift.x =
      CFG.referenceWidth +
      outsideMargin;


    assignCenterTarget(
      swift
    );
  }


  if (
    swift.y <
    -outsideMargin
  ) {

    swift.y =
      -outsideMargin;


    assignCenterTarget(
      swift
    );
  }


  if (
    swift.y >
    CFG.referenceHeight +
    outsideMargin
  ) {

    swift.y =
      CFG.referenceHeight +
      outsideMargin;


    assignCenterTarget(
      swift
    );
  }
}


// ============================================================
// 最短角度差
// ============================================================

function shortestAngleDifference(
  fromAngle,
  toAngle
) {

  let difference =
    toAngle -
    fromAngle;


  while (
    difference >
    PI
  ) {

    difference -=
      TWO_PI;
  }


  while (
    difference <
    -PI
  ) {

    difference +=
      TWO_PI;
  }


  return difference;
}


// ============================================================
// COVER
// ============================================================

function getView() {

  const scaleValue =
    max(
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
      ) /
      2,

    y:
      (
        height -
        drawHeight
      ) /
      2,

    w:
      drawWidth,

    h:
      drawHeight
  };
}


// ============================================================
// 错误提示
// ============================================================

function showLoadError(
  fileName
) {

  background(30);

  fill(255);

  noStroke();

  textAlign(
    CENTER,
    CENTER
  );

  textSize(18);


  text(
    "无法加载：\n" +
    fileName,
    width / 2,
    height / 2
  );
}


// ============================================================
// RESIZE
// ============================================================

function windowResized() {

  resizeCanvas(
    windowWidth,
    windowHeight
  );
}