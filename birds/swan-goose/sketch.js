// ============================================================
// 鸿雁 · Swan Goose
// p5.js 2.3.4
//
// 当前版本：
// 1. 粒子主要分布在画面下方约 1/3
// 2. 保持自然错落，不形成整齐横排
// 3. 水面阶段只左右游动
// 4. 每只独立方向 / 独立转向
// 5. 前方感知与避让
// 6. 起飞前检查方向
// 7. 如果游动方向与起飞方向相反，先平滑转向再起飞
// 8. 点击任意位置提前起飞
// 9. 不点击仍会自动起飞
// 10. 落水不横向瞬移
// 11. 水纹按照真实运动方向生成
// ============================================================


const CFG = {

  // ==========================================================
  // 背景
  // ==========================================================

  image: "鸿雁16：9.png",


  // ==========================================================
  // 粒子
  // ==========================================================

  count: 14,

  size: 24,

  color: "#89674F",

  outline: "#cab69b",

  outlineWidth: 1.8,


  // ==========================================================
  // 水面总体范围
  // ★ 主要集中在画面下方约 1/3
  // ==========================================================

  left: 0.10,

  right: 0.88,

  top: 0.66,

  bottom: 0.90,


  // ==========================================================
  // 群体总体分布
  // ==========================================================

  groupCenterX: 0.50,

  // ★ 整体下移
  groupCenterY: 0.775,

  groupSpreadX: 0.60,

  // ★ 保留上下错落
  groupSpreadY: 0.20,


  // ==========================================================
  // 局部小群
  // ==========================================================

  clusterCount: 4,

  clusterSpreadX: 0.50,

  clusterSpreadY: 0.13,

  clusterJitterX: 0.075,

  clusterJitterY: 0.055,


  // ==========================================================
  // 少量离群个体
  // ==========================================================

  outlierChance: 0.18,

  outlierX: 0.09,

  outlierY: 0.035,


  // ==========================================================
  // 初始防重叠
  // ==========================================================

  initialMinGap: 48,

  initialTryCount: 120,


  // ==========================================================
  // 防止排成水平直线
  // ==========================================================

  horizontalRowTolerance: 18,

  horizontalRowLimit: 3,

  horizontalRowPenaltyRange: 95,


  // ==========================================================
  // 独立游动
  // ==========================================================

  swimSpeedMin: 8,

  swimSpeedMax: 14,

  groupDirectionBias: 0.72,


  // ==========================================================
  // 自然转向
  // ==========================================================

  turnTimeMin: 4.5,

  turnTimeMax: 9.0,

  turnChance: 0.38,

  turnBrakeTime: 0.50,

  swimVelocityEase: 0.020,


  // ==========================================================
  // 左右边缘
  // ==========================================================

  individualEdgeMargin: 95,

  edgeTurnChance: 0.95,


  // ==========================================================
  // 相遇避让
  // ==========================================================

  avoidLookAhead: 115,

  avoidVerticalRange: 42,

  avoidSafeGap: 55,

  avoidSlowFactor: 0.25,

  avoidTurnDelay: 0.75,

  avoidCooldown: 1.6,


  // ==========================================================
  // 水面停留
  // ==========================================================

  swimTime: 11,

  agitationTime: 3,

  agitationBoost: 1.40,


  // ==========================================================
  // 点击起飞
  // ==========================================================

  clickTakeoffDelay: 0.10,

  clickTakeoffInterval: 0.20,

  clickTakeoffRandom: 0.10,


  // ==========================================================
  // 自动起飞
  // ==========================================================

  takeoffInterval: 0.24,

  takeoffRandom: 0.16,


  // ==========================================================
  // 起飞前方向准备
  // ==========================================================

  takeoffDirection: 1,

  takeoffReadySpeed: 7,

  takeoffReadyGlide: 0.20,

  takeoffPrepareEase: 0.030,


  // ==========================================================
  // 落水 → 游动
  // ==========================================================

  landingGlideTime: 0.35,

  landingBlendTime: 1.15,

  landingAvoidDelay: 1.10,


  // ==========================================================
  // 水纹
  // ==========================================================

  wakeSpacing: 7,

  wakeLife: 3.8,

  wakeFrontSize: 2,

  wakeFrontRange: 0.5,

  wakeLengthStart: 25,

  wakeLengthGrow: 100,

  wakeSpreadStart: 8,

  wakeSpreadGrow: 20,

  wakeCurve: 0.8,

  wakePerspective: 0.8,

  wakeOpacity: 120,

  wakeWeight: 0.8,

  wakeSteps: 16,

  wakeMinSpeed: 2.2,


  // ==========================================================
  // 涟漪
  // ==========================================================

  rippleLife: 2.5,

  rippleStart: 10,

  rippleEnd: 105,

  rippleHeight: 0.34,

  rippleOpacity: 155,

  rippleWeight: 1.1,

  rippleCount: 3,

  rippleDelay: 0.13,

  takeoffRipple: 1.0,

  landingRipple: 1.15,


  // ==========================================================
  // 水花
  // ==========================================================

  splashLifeMin: 0.35,

  splashLifeMax: 0.75,

  splashSpeedX: 30,

  splashSpeedYMin: -40,

  splashSpeedYMax: -12,

  splashGravity: 70,

  splashSizeMin: 1.3,

  splashSizeMax: 3.5,

  splashOpacity: 210,

  takeoffSplash: 6,

  landingSplash: 8,


  // ==========================================================
  // 真正起飞
  // ==========================================================

  takeoffVXMin: 52,

  takeoffVXMax: 68,

  takeoffVYMin: -68,

  takeoffVYMax: -52,

  takeoffHorizontalEase: 0.012,

  takeoffVerticalEase: 0.010,


  // ==========================================================
  // 飞行
  // ==========================================================

  flightVXMin: 72,

  flightVXMax: 88,

  flightVYMin: -10,

  flightVYMax: -5,

  flightWaveX: 3.5,

  flightWaveY: 4.5,

  alignment: 0.010,

  spreadX: 250,

  spreadY: 105,

  cohesion: 0.0020,

  outside: 170,


  // ==========================================================
  // 下一批飞入
  // ==========================================================

  arrivalStartXMin: -300,

  arrivalStartXMax: -100,

  arrivalStartYMin: 0.12,

  arrivalStartYMax: 0.34,

  arrivalSpeedXMin: 62,

  arrivalSpeedXMax: 88,

  arrivalSpeedYMin: 2,

  arrivalSpeedYMax: 8,

  arrivalInterval: 0.20,

  arrivalRandom: 0.15,

  arrivalWaveX: 4,

  arrivalWaveY: 6,


  // ==========================================================
  // 降落
  // ==========================================================

  landingApproachDistance: 320,

  arrivalTargetY: 0.006,

  landingHorizontalMin: 24,

  landingHorizontalMax: 48,

  landingSpeed: 52,

  landingTargetStrength: 0.035,


  // ==========================================================
  // 循环
  // ==========================================================

  restartDelay: 2.2
};


// ============================================================
// 全局变量
// ============================================================

let bgElement = null;

let bgReady = false;

let bgFailed = false;

let birds = [];

let wakes = [];

let ripples = [];

let splashes = [];

let cycleStart = 0;

let lastTime = 0;

let emptyTime = -1;

let looseGroupDirection = 1;

let manualTakeoffActive = false;

let manualTakeoffStart = -1;


// ============================================================
// SETUP
// ============================================================

function setup() {

  createCanvas(
    windowWidth,
    windowHeight
  );

  pixelDensity(1);

  loadBackground();
}


// ============================================================
// DRAW
// ============================================================

function draw() {

  if (!bgReady) {

    background(235);

    fill(60);

    noStroke();

    textAlign(
      CENTER,
      CENTER
    );

    textSize(18);

    text(
      bgFailed
        ? "背景加载失败，请检查：鸿雁16：9.png"
        : "正在加载背景……",

      width / 2,

      height / 2
    );

    return;
  }


  drawBackground();


  const now =
    millis() / 1000;


  let dt =
    now -
    lastTime;


  dt =
    constrain(
      dt,
      0,
      0.05
    );


  lastTime =
    now;


  updateBirds(
    dt,
    now
  );


  separateBirds(now);


  updateWakes(dt);

  updateRipples(dt);

  updateSplashes(dt);


  drawWakes();

  drawRipples();

  drawSplashes();

  drawBirds();


  checkRestart(now);
}


// ============================================================
// 背景加载
// ============================================================

function loadBackground() {

  const img =
    document.createElement("img");


  img.onload = function () {

    bgElement = img;

    bgReady = true;

    bgFailed = false;


    resetFlock(true);


    lastTime =
      millis() / 1000;
  };


  img.onerror = function () {

    bgFailed = true;


    console.error(
      "无法加载背景图片：" +
      CFG.image
    );
  };


  img.src =
    CFG.image;
}


// ============================================================
// 背景绘制
// ============================================================

function drawBackground() {

  const imageRatio =
    bgElement.naturalWidth /
    bgElement.naturalHeight;


  const drawH =
    height;


  const drawW =
    drawH *
    imageRatio;


  const drawX =
    (
      width -
      drawW
    ) /
    2;


  drawingContext.drawImage(
    bgElement,
    drawX,
    0,
    drawW,
    drawH
  );
}


// ============================================================
// 窗口变化
// ============================================================

function windowResized() {

  resizeCanvas(
    windowWidth,
    windowHeight
  );


  if (bgReady) {

    resetFlock(true);
  }
}


// ============================================================
// 鼠标 / 触屏
// ============================================================

function mousePressed() {

  triggerManualTakeoff();

  return false;
}


function touchStarted() {

  triggerManualTakeoff();

  return false;
}


// ============================================================
// 点击触发起飞
// ============================================================

function triggerManualTakeoff() {

  if (!bgReady) {

    return;
  }


  if (
    manualTakeoffActive
  ) {

    return;
  }


  let swimmingCount = 0;


  for (
    const bird of birds
  ) {

    if (
      !bird.gone

      &&

      (
        bird.state === "swim"

        ||

        bird.state === "prepareTakeoff"
      )
    ) {

      swimmingCount++;
    }
  }


  if (
    swimmingCount === 0
  ) {

    return;
  }


  manualTakeoffActive =
    true;


  manualTakeoffStart =
    millis() / 1000;


  prepareManualTakeoffOrder();
}


// ============================================================
// RESET
// ============================================================

function resetFlock(firstCycle) {

  birds = [];

  wakes = [];

  ripples = [];

  splashes = [];


  emptyTime = -1;


  cycleStart =
    millis() / 1000;


  manualTakeoffActive =
    false;


  manualTakeoffStart =
    -1;


  looseGroupDirection =
    random() < 0.5
      ? -1
      : 1;


  createFlock(
    firstCycle
  );
}


// ============================================================
// 创建群体
// ============================================================

function createFlock(firstCycle) {

  const centerX =
    width *
    CFG.groupCenterX;


  const centerY =
    height *
    CFG.groupCenterY;


  const clusterCenters = [];


  // ==========================================================
  // 创建不同高度的小群中心
  // ==========================================================

  for (
    let i = 0;
    i < CFG.clusterCount;
    i++
  ) {

    let normalizedX;


    if (
      CFG.clusterCount <= 1
    ) {

      normalizedX = 0;
    }

    else {

      normalizedX =
        map(
          i,
          0,
          CFG.clusterCount - 1,
          -0.5,
          0.5
        );
    }


    normalizedX +=
      random(
        -0.08,
        0.08
      );


    const clusterX =
      centerX +
      normalizedX *
      width *
      CFG.clusterSpreadX;


    const verticalSlot =
      map(
        i,
        0,
        max(
          1,
          CFG.clusterCount - 1
        ),
        -0.5,
        0.5
      );


    const shuffledVertical =
      verticalSlot +
      random(
        -0.22,
        0.22
      );


    const clusterY =
      centerY +
      shuffledVertical *
      height *
      CFG.clusterSpreadY;


    clusterCenters.push({

      x:
        clusterX,

      y:
        clusterY
    });
  }


  shuffleArray(
    clusterCenters
  );


  // ==========================================================
  // 创建粒子
  // ==========================================================

  for (
    let i = 0;
    i < CFG.count;
    i++
  ) {

    let targetX =
      centerX;


    let targetY =
      centerY;


    let accepted =
      false;


    for (
      let attempt = 0;
      attempt < CFG.initialTryCount;
      attempt++
    ) {

      const clusterIndex =
        floor(
          random(
            CFG.clusterCount
          )
        );


      const cluster =
        clusterCenters[
          clusterIndex
        ];


      targetX =
        cluster.x +
        randomGaussian() *
        width *
        CFG.clusterJitterX;


      targetY =
        cluster.y +
        randomGaussian() *
        height *
        CFG.clusterJitterY;


      // ======================================================
      // 少量离群个体
      // ======================================================

      if (
        random() <
        CFG.outlierChance
      ) {

        targetX +=
          random(
            -width *
            CFG.outlierX,

            width *
            CFG.outlierX
          );


        targetY +=
          random(
            -height *
            CFG.outlierY,

            height *
            CFG.outlierY
          );
      }


      // ======================================================
      // 群体范围
      // ======================================================

      const groupLeft =
        centerX -
        width *
        CFG.groupSpreadX *
        0.5;


      const groupRight =
        centerX +
        width *
        CFG.groupSpreadX *
        0.5;


      const groupTop =
        centerY -
        height *
        CFG.groupSpreadY *
        0.5;


      const groupBottom =
        centerY +
        height *
        CFG.groupSpreadY *
        0.5;


      targetX =
        constrain(
          targetX,

          max(
            width *
            CFG.left,
            groupLeft
          ),

          min(
            width *
            CFG.right,
            groupRight
          )
        );


      targetY =
        constrain(
          targetY,

          max(
            height *
            CFG.top,
            groupTop
          ),

          min(
            height *
            CFG.bottom,
            groupBottom
          )
        );


      // ======================================================
      // 防止粒子距离过近
      // ======================================================

      let validPosition =
        true;


      for (
        const other of birds
      ) {

        const dx =
          targetX -
          other.waterX;


        const dy =
          targetY -
          other.waterY;


        const gapValue =
          Math.hypot(
            dx,
            dy
          );


        if (
          gapValue <
          CFG.initialMinGap
        ) {

          validPosition =
            false;

          break;
        }
      }


      if (
        !validPosition
      ) {

        continue;
      }


      // ======================================================
      // 防止形成水平排队
      // ======================================================

      let sameRowCount = 0;


      for (
        const other of birds
      ) {

        const verticalDifference =
          abs(
            targetY -
            other.waterY
          );


        const horizontalDifference =
          abs(
            targetX -
            other.waterX
          );


        if (
          verticalDifference <
          CFG.horizontalRowTolerance

          &&

          horizontalDifference <
          CFG.horizontalRowPenaltyRange
        ) {

          sameRowCount++;
        }
      }


      if (
        sameRowCount >=
        CFG.horizontalRowLimit
      ) {

        continue;
      }


      accepted =
        true;


      break;
    }


    // ========================================================
    // 极端情况下随机放置在下方水域
    // ========================================================

    if (
      !accepted
    ) {

      targetX =
        random(
          width *
          CFG.left,
          width *
          CFG.right
        );


      targetY =
        random(
          height *
          CFG.top,
          height *
          CFG.bottom
        );
    }


    // ========================================================
    // 个体速度
    // ========================================================

    const speed =
      random(
        CFG.swimSpeedMin,
        CFG.swimSpeedMax
      );


    // ========================================================
    // 个体方向
    // ========================================================

    let swimDirection;


    if (
      random() <
      CFG.groupDirectionBias
    ) {

      swimDirection =
        looseGroupDirection;
    }

    else {

      swimDirection =
        -looseGroupDirection;
    }


    const bird = {

      x:
        targetX,

      y:
        targetY,


      waterX:
        targetX,

      waterY:
        targetY,


      swimY:
        targetY,


      speed:
        speed,


      swimDirection:
        swimDirection,


      vx:
        swimDirection *
        speed,

      vy: 0,


      targetVX:
        swimDirection *
        speed,


      // ======================================================
      // 自然转向
      // ======================================================

      turnTimer:
        random(
          CFG.turnTimeMin,
          CFG.turnTimeMax
        ),


      turning:
        false,

      turnPhase:
        "none",

      turnStart:
        -1,

      pendingDirection:
        swimDirection,


      // ======================================================
      // 避让
      // ======================================================

      avoidTimer: 0,

      avoidCooldownUntil: -1,

      blockedBy: -1,


      // ======================================================
      // 水纹
      // ======================================================

      wakeTravel:
        random(
          CFG.wakeSpacing
        ),


      // ======================================================
      // 状态
      // ======================================================

      state:
        firstCycle
          ? "swim"
          : "arrivalWait",


      gone:
        false,


      // ======================================================
      // 起飞准备
      // ======================================================

      takeoffRequested:
        false,

      takeoffRequestTime:
        -1,

      takeoffReadyStart:
        -1,


      // ======================================================
      // 真正起飞
      // ======================================================

      takeoffStart:
        -1,


      // ======================================================
      // 落水
      // ======================================================

      landingBlendStart:
        firstCycle
          ? -999
          : -1,


      landingEntryVX:
        0,


      // ======================================================
      // 飞行
      // ======================================================

      flightVX:
        random(
          CFG.flightVXMin,
          CFG.flightVXMax
        ),


      flightVY:
        random(
          CFG.flightVYMin,
          CFG.flightVYMax
        ),


      phaseX:
        random(TWO_PI),


      phaseY:
        random(TWO_PI),


      waveSpeed:
        random(
          0.22,
          0.48
        ),


      // ======================================================
      // 飞入
      // ======================================================

      arrivalDelay:
        i *
        CFG.arrivalInterval +
        random(
          0,
          CFG.arrivalRandom
        ),


      // ======================================================
      // 时间
      // ======================================================

      waterStartTime:
        firstCycle
          ? cycleStart
          : -1,


      // ======================================================
      // 起飞顺序
      // ======================================================

      takeoffOrder:
        i,


      manualTakeoffOrder:
        i
    };


    // ========================================================
    // 后续循环：从左侧天空飞入
    // ========================================================

    if (!firstCycle) {

      bird.x =
        random(
          CFG.arrivalStartXMin,
          CFG.arrivalStartXMax
        );


      bird.y =
        height *
        random(
          CFG.arrivalStartYMin,
          CFG.arrivalStartYMax
        );


      bird.vx =
        random(
          CFG.arrivalSpeedXMin,
          CFG.arrivalSpeedXMax
        );


      bird.vy =
        random(
          CFG.arrivalSpeedYMin,
          CFG.arrivalSpeedYMax
        );
    }


    birds.push(
      bird
    );
  }


  prepareTakeoffOrder();
}


// ============================================================
// 打乱数组
// ============================================================

function shuffleArray(array) {

  for (
    let i = array.length - 1;
    i > 0;
    i--
  ) {

    const j =
      floor(
        random(
          i + 1
        )
      );


    const temp =
      array[i];


    array[i] =
      array[j];


    array[j] =
      temp;
  }
}


// ============================================================
// 自动起飞顺序
// ============================================================

function prepareTakeoffOrder() {

  const order =
    [...birds];


  order.sort(
    function (
      birdA,
      birdB
    ) {

      return (
        birdB.x -
        birdA.x
      );
    }
  );


  for (
    let i = 0;
    i < order.length;
    i++
  ) {

    order[i].takeoffOrder =
      i;
  }
}


// ============================================================
// 点击起飞顺序
// ============================================================

function prepareManualTakeoffOrder() {

  const swimming =
    birds.filter(
      function (bird) {

        return (
          !bird.gone

          &&

          (
            bird.state === "swim"

            ||

            bird.state === "prepareTakeoff"
          )
        );
      }
    );


  for (
    let i = 0;
    i < swimming.length;
    i++
  ) {

    swimming[i].manualSortValue =
      swimming[i].x +
      sin(
        i *
        17.371 +
        4.913
      ) *
      35;
  }


  swimming.sort(
    function (
      birdA,
      birdB
    ) {

      return (
        birdB.manualSortValue -
        birdA.manualSortValue
      );
    }
  );


  for (
    let i = 0;
    i < swimming.length;
    i++
  ) {

    swimming[i].manualTakeoffOrder =
      i;
  }
}


// ============================================================
// 更新全部粒子
// ============================================================

function updateBirds(
  dt,
  now
) {

  const cycleAge =
    now -
    cycleStart;


  for (
    const bird of birds
  ) {

    if (
      bird.gone
    ) {

      continue;
    }


    // ========================================================
    // 等待飞入
    // ========================================================

    if (
      bird.state ===
      "arrivalWait"
    ) {

      if (
        cycleAge >=
        bird.arrivalDelay
      ) {

        bird.state =
          "arrival";
      }


      continue;
    }


    // ========================================================
    // 飞入
    // ========================================================

    if (
      bird.state ===
      "arrival"
    ) {

      updateArrival(
        bird,
        dt,
        now
      );


      continue;
    }


    // ========================================================
    // 降落
    // ========================================================

    if (
      bird.state ===
      "landing"
    ) {

      updateLanding(
        bird,
        dt,
        now
      );


      continue;
    }


    // ========================================================
    // 起飞准备
    // ========================================================

    if (
      bird.state ===
      "prepareTakeoff"
    ) {

      updatePrepareTakeoff(
        bird,
        dt,
        now
      );


      continue;
    }


    // ========================================================
    // 水面游动
    // ========================================================

    if (
      bird.state ===
      "swim"
    ) {

      updateSwimming(
        bird,
        dt,
        now
      );


      // ======================================================
      // 点击起飞
      // ======================================================

      if (
        manualTakeoffActive
      ) {

        const manualDelay =
          CFG.clickTakeoffDelay +
          bird.manualTakeoffOrder *
          CFG.clickTakeoffInterval +
          stableClickOffset(
            bird.manualTakeoffOrder
          );


        if (
          now -
          manualTakeoffStart >=
          manualDelay
        ) {

          requestTakeoff(
            bird,
            now
          );


          continue;
        }
      }


      // ======================================================
      // 自动起飞
      // ======================================================

      const waterAge =
        now -
        bird.waterStartTime;


      const automaticDelay =
        CFG.swimTime +
        CFG.agitationTime +
        bird.takeoffOrder *
        CFG.takeoffInterval +
        stableTakeoffOffset(
          bird.takeoffOrder
        );


      if (
        waterAge >=
        automaticDelay
      ) {

        requestTakeoff(
          bird,
          now
        );


        continue;
      }
    }


    // ========================================================
    // 飞行
    // ========================================================

    if (
      bird.state ===
      "flight"
    ) {

      updateFlight(
        bird,
        dt,
        now
      );
    }


    // ========================================================
    // 飞离画面
    // ========================================================

    if (
      bird.state ===
      "flight"

      &&

      (
        bird.x >
        width +
        CFG.outside

        ||

        bird.y <
        -CFG.outside
      )
    ) {

      bird.gone =
        true;
    }
  }
}


// ============================================================
// 起飞时间偏移
// ============================================================

function stableTakeoffOffset(index) {

  const value =
    sin(
      index *
      12.9898 +
      78.233
    ) *
    43758.5453;


  const fraction =
    value -
    floor(value);


  return map(
    fraction,
    0,
    1,
    -CFG.takeoffRandom,
    CFG.takeoffRandom
  );
}


function stableClickOffset(index) {

  const value =
    sin(
      index *
      19.371 +
      11.913
    ) *
    43758.5453;


  const fraction =
    value -
    floor(value);


  return map(
    fraction,
    0,
    1,
    -CFG.clickTakeoffRandom,
    CFG.clickTakeoffRandom
  );
}


// ============================================================
// 请求起飞
// ============================================================

function requestTakeoff(
  bird,
  now
) {

  if (
    bird.state !==
    "swim"
  ) {

    return;
  }


  bird.takeoffRequested =
    true;


  bird.takeoffRequestTime =
    now;


  bird.state =
    "prepareTakeoff";


  // ==========================================================
  // 已经向右游
  // ==========================================================

  if (
    bird.swimDirection ===
    CFG.takeoffDirection

    &&

    bird.vx >
    0
  ) {

    bird.takeoffReadyStart =
      now;


    return;
  }


  // ==========================================================
  // 方向相反：先转向
  // ==========================================================

  bird.takeoffReadyStart =
    -1;


  bird.turning =
    true;


  bird.turnPhase =
    "brake";


  bird.turnStart =
    now;


  bird.pendingDirection =
    CFG.takeoffDirection;


  bird.avoidTimer = 0;
}


// ============================================================
// 起飞准备
// ============================================================

function updatePrepareTakeoff(
  bird,
  dt,
  now
) {

  const oldX =
    bird.x;


  const oldY =
    bird.y;


  // ==========================================================
  // 方向不对：先掉头
  // ==========================================================

  if (
    bird.swimDirection !==
    CFG.takeoffDirection

    ||

    bird.vx < 0
  ) {

    if (
      !bird.turning
    ) {

      bird.turning =
        true;


      bird.turnPhase =
        "brake";


      bird.turnStart =
        now;


      bird.pendingDirection =
        CFG.takeoffDirection;
    }


    updateTakeoffTurn(
      bird,
      now
    );


    bird.x +=
      bird.vx *
      dt;


    bird.y =
      bird.swimY;


    keepBirdInsideWater(
      bird,
      now
    );


    createWake(
      bird,
      oldX,
      oldY
    );


    return;
  }


  // ==========================================================
  // 已经朝正确方向
  // ==========================================================

  const readyTarget =
    max(
      CFG.takeoffReadySpeed,
      bird.speed
    );


  bird.vx =
    lerp(
      bird.vx,
      readyTarget,
      CFG.takeoffPrepareEase
    );


  bird.x +=
    bird.vx *
    dt;


  bird.y =
    bird.swimY;


  keepBirdInsideWater(
    bird,
    now
  );


  createWake(
    bird,
    oldX,
    oldY
  );


  if (
    bird.vx >=
    CFG.takeoffReadySpeed
  ) {

    if (
      bird.takeoffReadyStart <
      0
    ) {

      bird.takeoffReadyStart =
        now;
    }


    if (
      now -
      bird.takeoffReadyStart >=
      CFG.takeoffReadyGlide
    ) {

      beginTakeoff(
        bird,
        now
      );
    }
  }

  else {

    bird.takeoffReadyStart =
      -1;
  }
}


// ============================================================
// 起飞准备转向
// ============================================================

function updateTakeoffTurn(
  bird,
  now
) {

  const turnAge =
    now -
    bird.turnStart;


  if (
    bird.turnPhase ===
    "brake"
  ) {

    bird.vx =
      lerp(
        bird.vx,
        0,
        CFG.swimVelocityEase *
        2.8
      );


    if (
      turnAge >=
      CFG.turnBrakeTime

      ||

      abs(
        bird.vx
      ) <
      0.6
    ) {

      bird.swimDirection =
        CFG.takeoffDirection;


      bird.pendingDirection =
        CFG.takeoffDirection;


      bird.turnPhase =
        "accelerate";


      bird.turnStart =
        now;


      bird.wakeTravel = 0;
    }


    return;
  }


  if (
    bird.turnPhase ===
    "accelerate"
  ) {

    const target =
      max(
        CFG.takeoffReadySpeed,
        bird.speed
      );


    bird.vx =
      lerp(
        bird.vx,
        target,
        CFG.takeoffPrepareEase
      );


    if (
      bird.vx >=
      CFG.takeoffReadySpeed
    ) {

      bird.turning =
        false;


      bird.turnPhase =
        "none";


      bird.takeoffReadyStart =
        now;
    }
  }
}


// ============================================================
// 飞入
// ============================================================

function updateArrival(
  bird,
  dt,
  now
) {

  const dx =
    bird.waterX -
    bird.x;


  const dy =
    bird.waterY -
    bird.y;


  const horizontalDistance =
    abs(dx);


  let desiredVX =
    stableArrivalSpeed(
      bird,
      CFG.arrivalSpeedXMin,
      CFG.arrivalSpeedXMax
    );


  if (
    horizontalDistance <
    CFG.landingApproachDistance *
    1.6
  ) {

    desiredVX =
      constrain(
        dx *
        0.25,

        CFG.landingHorizontalMin,

        CFG.arrivalSpeedXMax
      );
  }


  bird.vx =
    lerp(
      bird.vx,
      desiredVX,
      0.018
    );


  let desiredVY =
    CFG.arrivalSpeedYMin;


  if (
    horizontalDistance <
    CFG.landingApproachDistance *
    1.8
  ) {

    desiredVY =
      constrain(
        dy *
        CFG.arrivalTargetY,

        CFG.arrivalSpeedYMin,

        CFG.landingSpeed *
        0.55
      );
  }


  bird.vy =
    lerp(
      bird.vy,
      desiredVY,
      0.018
    );


  const waveX =
    sin(
      now *
      1.1 +
      bird.phaseX
    ) *
    CFG.arrivalWaveX;


  const waveY =
    sin(
      now *
      1.25 +
      bird.phaseY
    ) *
    CFG.arrivalWaveY;


  bird.x +=
    (
      bird.vx +
      waveX
    ) *
    dt;


  bird.y +=
    (
      bird.vy +
      waveY
    ) *
    dt;


  if (
    bird.x >
    0

    &&

    horizontalDistance <
    CFG.landingApproachDistance
  ) {

    bird.state =
      "landing";


    bird.vx =
      constrain(
        bird.vx,

        CFG.landingHorizontalMin,

        CFG.landingHorizontalMax
      );


    bird.vy =
      max(
        bird.vy,
        10
      );
  }
}


// ============================================================
// 稳定飞入速度
// ============================================================

function stableArrivalSpeed(
  bird,
  minimum,
  maximum
) {

  const value =
    sin(
      bird.phaseX *
      31.7 +
      bird.phaseY *
      17.3
    ) *
    43758.5453;


  const fraction =
    value -
    floor(value);


  return lerp(
    minimum,
    maximum,
    fraction
  );
}


// ============================================================
// 降落
// ============================================================

function updateLanding(
  bird,
  dt,
  now
) {

  const dx =
    bird.waterX -
    bird.x;


  const dy =
    bird.waterY -
    bird.y;


  const verticalGap =
    max(
      0,
      dy
    );


  // 越靠近水面，横向纠正越弱
  const horizontalFade =
    constrain(
      verticalGap /
      120,
      0,
      1
    );


  const targetVX =
    constrain(
      dx *
      0.16,

      -CFG.landingHorizontalMax,

      CFG.landingHorizontalMax
    );


  bird.vx =
    lerp(
      bird.vx,

      targetVX,

      CFG.landingTargetStrength *
      horizontalFade
    );


  const targetVY =
    constrain(
      dy *
      0.30,

      10,

      CFG.landingSpeed
    );


  bird.vy =
    lerp(
      bird.vy,
      targetVY,
      CFG.landingTargetStrength
    );


  const waveX =
    sin(
      now *
      1.3 +
      bird.phaseX
    );


  const waveY =
    sin(
      now *
      1.45 +
      bird.phaseY
    );


  bird.x +=
    (
      bird.vx +
      waveX
    ) *
    dt;


  bird.y +=
    (
      bird.vy +
      waveY
    ) *
    dt;


  // ==========================================================
  // 接触水面
  // ==========================================================

  if (
    bird.y >=
    bird.waterY
  ) {

    const actualLandingX =
      constrain(
        bird.x,

        width *
        CFG.left,

        width *
        CFG.right
      );


    const actualLandingY =
      bird.waterY;


    bird.x =
      actualLandingX;


    bird.y =
      actualLandingY;


    bird.waterX =
      actualLandingX;


    bird.waterY =
      actualLandingY;


    bird.swimY =
      actualLandingY;


    bird.landingEntryVX =
      bird.vx;


    if (
      abs(
        bird.landingEntryVX
      ) >
      1
    ) {

      bird.swimDirection =
        bird.landingEntryVX >= 0
          ? 1
          : -1;
    }


    bird.targetVX =
      bird.swimDirection *
      bird.speed;


    bird.state =
      "swim";


    bird.waterStartTime =
      now;


    bird.landingBlendStart =
      now;


    bird.vy = 0;


    bird.turning =
      false;


    bird.turnPhase =
      "none";


    bird.turnTimer =
      random(
        CFG.turnTimeMin,
        CFG.turnTimeMax
      );


    bird.avoidTimer = 0;

    bird.blockedBy = -1;


    bird.avoidCooldownUntil =
      now +
      CFG.landingAvoidDelay;


    bird.takeoffRequested =
      false;


    bird.takeoffReadyStart =
      -1;


    bird.wakeTravel = 0;


    makeRipple(
      actualLandingX,
      actualLandingY,
      CFG.landingRipple
    );


    makeSplash(
      actualLandingX,
      actualLandingY,
      CFG.landingSplash
    );
  }
}


// ============================================================
// 水面游动
// ============================================================

function updateSwimming(
  bird,
  dt,
  now
) {

  const waterAge =
    now -
    bird.waterStartTime;


  let boost = 1;


  if (
    waterAge >
    CFG.swimTime
  ) {

    const progress =
      constrain(
        (
          waterAge -
          CFG.swimTime
        ) /
        CFG.agitationTime,

        0,
        1
      );


    boost =
      lerp(
        1,
        CFG.agitationBoost,
        progress
      );
  }


  const timeAfterLanding =
    now -
    bird.landingBlendStart;


  const isLandingBlend =
    bird.landingBlendStart >= 0

    &&

    timeAfterLanding <
    CFG.landingBlendTime;


  if (
    isLandingBlend
  ) {

    updateLandingGlide(
      bird,
      now
    );
  }

  else {

    const obstacle =
      findObstacleAhead(
        bird
      );


    if (
      obstacle !== null

      &&

      now >=
      bird.avoidCooldownUntil
    ) {

      updateAvoidance(
        bird,
        obstacle,
        dt,
        now,
        boost
      );
    }

    else {

      bird.avoidTimer =
        max(
          0,
          bird.avoidTimer -
          dt *
          2
        );


      bird.blockedBy =
        -1;


      updateIndividualTurn(
        bird,
        dt,
        now,
        boost
      );
    }
  }


  bird.vy = 0;


  const oldX =
    bird.x;


  const oldY =
    bird.y;


  bird.x +=
    bird.vx *
    dt;


  bird.y =
    bird.swimY;


  keepBirdInsideWater(
    bird,
    now
  );


  createWake(
    bird,
    oldX,
    oldY
  );
}


// ============================================================
// 边界
// ============================================================

function keepBirdInsideWater(
  bird,
  now
) {

  const absoluteLeft =
    width *
    CFG.left;


  const absoluteRight =
    width *
    CFG.right;


  if (
    bird.x <=
    absoluteLeft
  ) {

    bird.x =
      absoluteLeft;


    if (
      bird.state ===
      "prepareTakeoff"
    ) {

      bird.swimDirection = 1;

      bird.vx =
        max(
          0,
          bird.vx
        );
    }

    else {

      requestTurn(
        bird,
        1,
        now
      );
    }
  }


  if (
    bird.x >=
    absoluteRight
  ) {

    bird.x =
      absoluteRight;


    if (
      bird.state ===
      "prepareTakeoff"
    ) {

      beginTakeoff(
        bird,
        now
      );
    }

    else {

      requestTurn(
        bird,
        -1,
        now
      );
    }
  }
}


// ============================================================
// 落水滑行
// ============================================================

function updateLandingGlide(
  bird,
  now
) {

  const timeAfterLanding =
    now -
    bird.landingBlendStart;


  if (
    timeAfterLanding <
    CFG.landingGlideTime
  ) {

    const progress =
      constrain(
        timeAfterLanding /
        CFG.landingGlideTime,

        0,
        1
      );


    const landingDirection =
      bird.landingEntryVX >= 0
        ? 1
        : -1;


    const glideSpeed =
      max(
        bird.speed,

        abs(
          bird.landingEntryVX
        ) *
        0.72
      );


    const target =
      landingDirection *
      glideSpeed;


    bird.vx =
      lerp(
        bird.vx,
        target,

        0.008 +
        progress *
        0.012
      );


    return;
  }


  const progress =
    constrain(
      (
        timeAfterLanding -
        CFG.landingGlideTime
      ) /
      (
        CFG.landingBlendTime -
        CFG.landingGlideTime
      ),

      0,
      1
    );


  const smoothProgress =
    progress *
    progress *
    (
      3 -
      2 *
      progress
    );


  const target =
    bird.swimDirection *
    bird.speed;


  bird.vx =
    lerp(
      bird.vx,
      target,

      0.012 +
      smoothProgress *
      0.025
    );
}


// ============================================================
// 前方障碍
// ============================================================

function findObstacleAhead(bird) {

  let closestBird =
    null;


  let closestForwardDistance =
    Infinity;


  for (
    let i = 0;
    i < birds.length;
    i++
  ) {

    const other =
      birds[i];


    if (
      other === bird

      ||

      other.gone

      ||

      (
        other.state !==
        "swim"

        &&

        other.state !==
        "prepareTakeoff"
      )
    ) {

      continue;
    }


    const verticalDistance =
      abs(
        other.y -
        bird.y
      );


    if (
      verticalDistance >
      CFG.avoidVerticalRange
    ) {

      continue;
    }


    const dx =
      other.x -
      bird.x;


    const forwardDistance =
      dx *
      bird.swimDirection;


    if (
      forwardDistance <= 0

      ||

      forwardDistance >
      CFG.avoidLookAhead
    ) {

      continue;
    }


    const relativeVelocity =
      (
        bird.vx -
        other.vx
      ) *
      bird.swimDirection;


    if (
      relativeVelocity <= 0

      &&

      forwardDistance >
      CFG.avoidSafeGap
    ) {

      continue;
    }


    if (
      forwardDistance <
      closestForwardDistance
    ) {

      closestForwardDistance =
        forwardDistance;


      closestBird =
        other;
    }
  }


  if (
    closestBird === null
  ) {

    return null;
  }


  return {

    bird:
      closestBird,

    gap:
      closestForwardDistance
  };
}


// ============================================================
// 避让
// ============================================================

function updateAvoidance(
  bird,
  obstacle,
  dt,
  now,
  boost
) {

  const other =
    obstacle.bird;


  const gapValue =
    obstacle.gap;


  const otherIndex =
    birds.indexOf(
      other
    );


  if (
    bird.blockedBy !==
    otherIndex
  ) {

    bird.blockedBy =
      otherIndex;


    bird.avoidTimer = 0;
  }


  bird.avoidTimer +=
    dt;


  const closeness =
    constrain(
      map(
        gapValue,
        CFG.avoidLookAhead,
        CFG.avoidSafeGap,
        0,
        1
      ),

      0,
      1
    );


  const slowFactor =
    lerp(
      1,
      CFG.avoidSlowFactor,
      closeness
    );


  let desiredSpeed =
    bird.speed *
    boost *
    slowFactor;


  if (
    other.swimDirection ===
    bird.swimDirection
  ) {

    desiredSpeed =
      min(
        desiredSpeed,

        max(
          1.5,

          abs(
            other.vx
          ) *
          0.90
        )
      );
  }


  const target =
    bird.swimDirection *
    desiredSpeed;


  bird.vx =
    lerp(
      bird.vx,
      target,
      CFG.swimVelocityEase *
      2.0
    );


  const headOn =
    other.swimDirection !==
    bird.swimDirection;


  if (
    headOn

    &&

    gapValue <
    CFG.avoidSafeGap *
    1.25
  ) {

    const birdIndex =
      birds.indexOf(
        bird
      );


    const otherBirdIndex =
      birds.indexOf(
        other
      );


    if (
      birdIndex >
      otherBirdIndex
    ) {

      requestTurn(
        bird,
        -bird.swimDirection,
        now
      );


      bird.avoidCooldownUntil =
        now +
        CFG.avoidCooldown;


      bird.avoidTimer = 0;


      return;
    }
  }


  if (
    bird.avoidTimer >=
    CFG.avoidTurnDelay

    &&

    gapValue <
    CFG.avoidSafeGap *
    1.35
  ) {

    requestTurn(
      bird,
      -bird.swimDirection,
      now
    );


    bird.avoidCooldownUntil =
      now +
      CFG.avoidCooldown;


    bird.avoidTimer = 0;
  }
}


// ============================================================
// 自然转向
// ============================================================

function updateIndividualTurn(
  bird,
  dt,
  now,
  boost
) {

  const leftEdge =
    width *
    CFG.left;


  const rightEdge =
    width *
    CFG.right;


  const leftTurnZone =
    leftEdge +
    CFG.individualEdgeMargin;


  const rightTurnZone =
    rightEdge -
    CFG.individualEdgeMargin;


  if (
    bird.turning
  ) {

    updateTurnMotion(
      bird,
      now,
      boost
    );


    return;
  }


  bird.turnTimer -=
    dt;


  if (
    bird.x <=
    leftTurnZone

    &&

    bird.swimDirection <
    0
  ) {

    const edgeProgress =
      constrain(
        map(
          bird.x,
          leftEdge,
          leftTurnZone,
          1,
          0
        ),

        0,
        1
      );


    if (
      random() <
      CFG.edgeTurnChance *
      edgeProgress *
      dt *
      2.8
    ) {

      requestTurn(
        bird,
        1,
        now
      );


      return;
    }
  }


  if (
    bird.x >=
    rightTurnZone

    &&

    bird.swimDirection >
    0
  ) {

    const edgeProgress =
      constrain(
        map(
          bird.x,
          rightTurnZone,
          rightEdge,
          0,
          1
        ),

        0,
        1
      );


    if (
      random() <
      CFG.edgeTurnChance *
      edgeProgress *
      dt *
      2.8
    ) {

      requestTurn(
        bird,
        -1,
        now
      );


      return;
    }
  }


  if (
    bird.turnTimer <= 0
  ) {

    bird.turnTimer =
      random(
        CFG.turnTimeMin,
        CFG.turnTimeMax
      );


    if (
      random() <
      CFG.turnChance
    ) {

      requestTurn(
        bird,
        -bird.swimDirection,
        now
      );


      return;
    }
  }


  bird.targetVX =
    bird.swimDirection *
    bird.speed *
    boost;


  bird.vx =
    lerp(
      bird.vx,
      bird.targetVX,
      CFG.swimVelocityEase
    );
}


// ============================================================
// 普通转向
// ============================================================

function updateTurnMotion(
  bird,
  now,
  boost
) {

  const turnAge =
    now -
    bird.turnStart;


  if (
    bird.turnPhase ===
    "brake"
  ) {

    bird.targetVX = 0;


    bird.vx =
      lerp(
        bird.vx,
        0,
        CFG.swimVelocityEase *
        2.8
      );


    if (
      turnAge >=
      CFG.turnBrakeTime

      ||

      abs(
        bird.vx
      ) <
      0.6
    ) {

      bird.swimDirection =
        bird.pendingDirection;


      bird.turnPhase =
        "accelerate";


      bird.turnStart =
        now;


      bird.wakeTravel = 0;
    }


    return;
  }


  if (
    bird.turnPhase ===
    "accelerate"
  ) {

    bird.targetVX =
      bird.swimDirection *
      bird.speed *
      boost;


    bird.vx =
      lerp(
        bird.vx,
        bird.targetVX,
        CFG.swimVelocityEase *
        1.8
      );


    if (
      abs(
        bird.vx -
        bird.targetVX
      ) <
      0.8
    ) {

      bird.turning =
        false;


      bird.turnPhase =
        "none";


      bird.turnTimer =
        random(
          CFG.turnTimeMin,
          CFG.turnTimeMax
        );
    }
  }
}


// ============================================================
// 请求转向
// ============================================================

function requestTurn(
  bird,
  newDirection,
  now
) {

  if (
    bird.state ===
    "prepareTakeoff"
  ) {

    return;
  }


  if (
    bird.turning
  ) {

    return;
  }


  if (
    newDirection ===
    bird.swimDirection
  ) {

    return;
  }


  bird.turning =
    true;


  bird.turnPhase =
    "brake";


  bird.turnStart =
    now;


  bird.pendingDirection =
    newDirection;


  bird.avoidTimer = 0;
}


// ============================================================
// 极近距离保护
// ============================================================

function separateBirds(now) {

  for (
    let i = 0;
    i < birds.length;
    i++
  ) {

    const birdA =
      birds[i];


    if (
      birdA.gone

      ||

      birdA.state !==
      "swim"
    ) {

      continue;
    }


    if (
      birdA.landingBlendStart >= 0

      &&

      now -
      birdA.landingBlendStart <
      CFG.landingAvoidDelay
    ) {

      continue;
    }


    for (
      let j = i + 1;
      j < birds.length;
      j++
    ) {

      const birdB =
        birds[j];


      if (
        birdB.gone

        ||

        birdB.state !==
        "swim"
      ) {

        continue;
      }


      if (
        birdB.landingBlendStart >= 0

        &&

        now -
        birdB.landingBlendStart <
        CFG.landingAvoidDelay
      ) {

        continue;
      }


      const dx =
        birdB.x -
        birdA.x;


      const dy =
        birdB.y -
        birdA.y;


      const gapValue =
        Math.hypot(
          dx,
          dy
        );


      if (
        gapValue >
        CFG.size *
        1.35

        ||

        gapValue <= 0.001
      ) {

        continue;
      }


      if (
        abs(dy) >
        CFG.size *
        0.90
      ) {

        continue;
      }


      if (
        birdA.swimDirection ===
        birdB.swimDirection
      ) {

        let trailingBird;


        if (
          birdA.swimDirection >
          0
        ) {

          trailingBird =
            birdA.x <
            birdB.x
              ? birdA
              : birdB;
        }

        else {

          trailingBird =
            birdA.x >
            birdB.x
              ? birdA
              : birdB;
        }


        trailingBird.vx *=
          0.90;
      }

      else {

        requestTurn(
          birdB,
          -birdB.swimDirection,
          now
        );


        birdB.avoidCooldownUntil =
          now +
          CFG.avoidCooldown;
      }
    }
  }
}


// ============================================================
// 真正起飞
// ============================================================

function beginTakeoff(
  bird,
  now
) {

  if (
    bird.state !==
    "swim"

    &&

    bird.state !==
    "prepareTakeoff"
  ) {

    return;
  }


  bird.state =
    "flight";


  bird.takeoffStart =
    now;


  bird.takeoffRequested =
    false;


  bird.wakeTravel = 0;


  makeRipple(
    bird.x,
    bird.y,
    CFG.takeoffRipple
  );


  makeSplash(
    bird.x,
    bird.y,
    CFG.takeoffSplash
  );


  bird.vx =
    max(
      bird.vx,

      random(
        CFG.takeoffVXMin,
        CFG.takeoffVXMax
      )
    );


  bird.vy =
    random(
      CFG.takeoffVYMin,
      CFG.takeoffVYMax
    );
}


// ============================================================
// 飞行
// ============================================================

function updateFlight(
  bird,
  dt,
  now
) {

  const center =
    flightCenter();


  const average =
    flightAverage();


  bird.vx =
    lerp(
      bird.vx,
      bird.flightVX,
      CFG.takeoffHorizontalEase
    );


  bird.vy =
    lerp(
      bird.vy,
      bird.flightVY,
      CFG.takeoffVerticalEase
    );


  if (
    center.count >
    1
  ) {

    const dx =
      center.x -
      bird.x;


    const dy =
      center.y -
      bird.y;


    if (
      abs(dx) >
      CFG.spreadX *
      0.5
    ) {

      bird.vx +=
        dx *
        CFG.cohesion *
        dt *
        60;
    }


    if (
      abs(dy) >
      CFG.spreadY *
      0.5
    ) {

      bird.vy +=
        dy *
        CFG.cohesion *
        dt *
        60;
    }
  }


  if (
    average.count >
    1
  ) {

    bird.vx +=
      (
        average.vx -
        bird.vx
      ) *
      CFG.alignment;


    bird.vy +=
      (
        average.vy -
        bird.vy
      ) *
      CFG.alignment;
  }


  const waveX =
    sin(
      now *
      bird.waveSpeed +
      bird.phaseX
    ) *
    CFG.flightWaveX;


  const waveY =
    sin(
      now *
      bird.waveSpeed *
      1.17 +
      bird.phaseY
    ) *
    CFG.flightWaveY;


  bird.x +=
    (
      bird.vx +
      waveX
    ) *
    dt;


  bird.y +=
    (
      bird.vy +
      waveY
    ) *
    dt;
}


// ============================================================
// 飞行群中心
// ============================================================

function flightCenter() {

  let sumX = 0;

  let sumY = 0;

  let count = 0;


  for (
    const bird of birds
  ) {

    if (
      bird.gone

      ||

      bird.state !==
      "flight"
    ) {

      continue;
    }


    sumX +=
      bird.x;


    sumY +=
      bird.y;


    count++;
  }


  if (
    count === 0
  ) {

    return {

      x:
        width / 2,

      y:
        height / 2,

      count: 0
    };
  }


  return {

    x:
      sumX /
      count,

    y:
      sumY /
      count,

    count:
      count
  };
}


// ============================================================
// 飞行平均速度
// ============================================================

function flightAverage() {

  let sumVX = 0;

  let sumVY = 0;

  let count = 0;


  for (
    const bird of birds
  ) {

    if (
      bird.gone

      ||

      bird.state !==
      "flight"
    ) {

      continue;
    }


    sumVX +=
      bird.vx;


    sumVY +=
      bird.vy;


    count++;
  }


  if (
    count === 0
  ) {

    return {

      vx: 0,

      vy: 0,

      count: 0
    };
  }


  return {

    vx:
      sumVX /
      count,

    vy:
      sumVY /
      count,

    count:
      count
  };
}


// ============================================================
// 创建水纹
// ============================================================

function createWake(
  bird,
  oldX,
  oldY
) {

  const movementX =
    bird.x -
    oldX;


  const movementY =
    bird.y -
    oldY;


  const travelled =
    Math.hypot(
      movementX,
      movementY
    );


  const frameSpeed =
    travelled *
    60;


  if (
    frameSpeed <
    CFG.wakeMinSpeed
  ) {

    bird.wakeTravel = 0;

    return;
  }


  bird.wakeTravel +=
    travelled;


  if (
    bird.wakeTravel <
    CFG.wakeSpacing
  ) {

    return;
  }


  bird.wakeTravel = 0;


  if (
    travelled <
    0.001
  ) {

    return;
  }


  const realMoveAngle =
    atan2(
      movementY,
      movementX
    );


  wakes.push({

    x:
      bird.x,

    y:
      bird.y,

    angle:
      realMoveAngle,

    age: 0
  });
}


// ============================================================
// 更新水纹
// ============================================================

function updateWakes(dt) {

  for (
    const wake of wakes
  ) {

    wake.age +=
      dt;
  }


  wakes =
    wakes.filter(
      function (wake) {

        return (
          wake.age <
          CFG.wakeLife
        );
      }
    );
}


// ============================================================
// 绘制水纹
// ============================================================

function drawWakes() {

  push();

  noFill();

  strokeWeight(
    CFG.wakeWeight
  );


  for (
    const wake of wakes
  ) {

    const progress =
      wake.age /
      CFG.wakeLife;


    const opacity =
      CFG.wakeOpacity *
      (
        1 -
        progress
      );


    stroke(
      231,
      238,
      240,
      opacity
    );


    const wakeLength =
      CFG.wakeLengthStart +
      CFG.wakeLengthGrow *
      progress;


    const spread =
      CFG.wakeSpreadStart +
      CFG.wakeSpreadGrow *
      progress;


    const forwardX =
      cos(
        wake.angle
      );


    const forwardY =
      sin(
        wake.angle
      );


    const sideX =
      -forwardY;


    const sideY =
      forwardX;


    for (
      const sideDirection
      of [-1, 1]
    ) {

      beginShape();


      for (
        let i = 0;
        i <= CFG.wakeSteps;
        i++
      ) {

        const amount =
          i /
          CFG.wakeSteps;


        const backward =
          -wakeLength *
          amount;


        const baseCurve =
          sin(
            amount *
            PI *
            CFG.wakeCurve
          );


        let frontInfluence = 0;


        if (
          amount <
          CFG.wakeFrontRange
        ) {

          const frontProgress =
            amount /
            CFG.wakeFrontRange;


          frontInfluence =
            1 -
            frontProgress;


          frontInfluence =
            frontInfluence *
            frontInfluence *
            (
              3 -
              2 *
              frontInfluence
            );
        }


        const frontScale =
          1 +
          (
            CFG.wakeFrontSize -
            1
          ) *
          frontInfluence;


        const sideOffset =
          sideDirection *
          spread *
          baseCurve *
          frontScale;


        const x =
          wake.x +
          forwardX *
          backward +
          sideX *
          sideOffset;


        const y =
          wake.y +
          forwardY *
          backward +
          sideY *
          sideOffset *
          CFG.wakePerspective;


        vertex(
          x,
          y
        );
      }


      endShape();
    }
  }


  pop();
}


// ============================================================
// 涟漪
// ============================================================

function makeRipple(
  x,
  y,
  strength
) {

  for (
    let i = 0;
    i < CFG.rippleCount;
    i++
  ) {

    ripples.push({

      x:
        x,

      y:
        y,

      age:
        -i *
        CFG.rippleDelay,

      strength:
        strength *
        (
          1 -
          i *
          0.13
        )
    });
  }
}


function updateRipples(dt) {

  for (
    const ripple of ripples
  ) {

    ripple.age +=
      dt;
  }


  ripples =
    ripples.filter(
      function (ripple) {

        return (
          ripple.age <
          CFG.rippleLife
        );
      }
    );
}


function drawRipples() {

  push();

  noFill();

  strokeWeight(
    CFG.rippleWeight
  );


  for (
    const ripple of ripples
  ) {

    if (
      ripple.age <
      0
    ) {

      continue;
    }


    const progress =
      ripple.age /
      CFG.rippleLife;


    const eased =
      1 -
      pow(
        1 -
        progress,
        3
      );


    const rippleWidth =
      lerp(
        CFG.rippleStart,
        CFG.rippleEnd,
        eased
      ) *
      ripple.strength;


    const opacity =
      CFG.rippleOpacity *
      (
        1 -
        progress
      );


    stroke(
      235,
      242,
      243,
      opacity
    );


    ellipse(
      ripple.x,
      ripple.y,

      rippleWidth,

      rippleWidth *
      CFG.rippleHeight
    );
  }


  pop();
}


// ============================================================
// 水花
// ============================================================

function makeSplash(
  x,
  y,
  amount
) {

  for (
    let i = 0;
    i < amount;
    i++
  ) {

    splashes.push({

      x:
        x +
        random(
          -8,
          8
        ),

      y:
        y +
        random(
          -3,
          3
        ),

      vx:
        random(
          -CFG.splashSpeedX,
          CFG.splashSpeedX
        ),

      vy:
        random(
          CFG.splashSpeedYMin,
          CFG.splashSpeedYMax
        ),

      age: 0,

      life:
        random(
          CFG.splashLifeMin,
          CFG.splashLifeMax
        ),

      size:
        random(
          CFG.splashSizeMin,
          CFG.splashSizeMax
        )
    });
  }
}


function updateSplashes(dt) {

  for (
    const splash of splashes
  ) {

    splash.age +=
      dt;


    splash.x +=
      splash.vx *
      dt;


    splash.y +=
      splash.vy *
      dt;


    splash.vy +=
      CFG.splashGravity *
      dt;
  }


  splashes =
    splashes.filter(
      function (splash) {

        return (
          splash.age <
          splash.life
        );
      }
    );
}


function drawSplashes() {

  push();

  noStroke();


  for (
    const splash of splashes
  ) {

    const progress =
      splash.age /
      splash.life;


    fill(
      238,
      245,
      245,

      CFG.splashOpacity *
      (
        1 -
        progress
      )
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


// ============================================================
// 绘制粒子
// ============================================================

function drawBirds() {

  for (
    const bird of birds
  ) {

    if (
      bird.gone

      ||

      bird.state ===
      "arrivalWait"
    ) {

      continue;
    }


    stroke(
      CFG.outline
    );


    strokeWeight(
      CFG.outlineWidth
    );


    fill(
      CFG.color
    );


    circle(
      bird.x,
      bird.y,
      CFG.size
    );
  }
}


// ============================================================
// 自动循环
// ============================================================

function checkRestart(now) {

  let active = 0;


  for (
    const bird of birds
  ) {

    if (
      !bird.gone
    ) {

      active++;
    }
  }


  if (
    active >
    0
  ) {

    emptyTime = -1;

    return;
  }


  if (
    emptyTime <
    0
  ) {

    emptyTime =
      now;
  }


  if (
    now -
    emptyTime >
    CFG.restartDelay
  ) {

    resetFlock(false);
  }
}