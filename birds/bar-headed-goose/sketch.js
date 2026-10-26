// ============================================================
// 斑头雁 · Bar-headed Goose
// p5.js 2.x
//
// 当前版本：
// 1. 明确从左上飞向右下角
// 2. 不是整块队形机c械平移
// 3. 每只鸟有自己的前进速度
// 4. 每只鸟有自己的下降速度和上下漂移
// 5. 两支不对称队形只是“软目标”
// 6. 队形不会僵硬保持直线
// 7. 领头雁始终在 X 轴最前
// 8. 所有粒子始终向右
// 9. 避免重叠
// ============================================================


// ============================================================
// 参数
// ============================================================

const CONFIG = {

  // ----------------------------------------------------------
  // 背景
  // ----------------------------------------------------------

  backgroundFile: "斑头雁.jpg",

  imageRatio: 16 / 9,


  // ----------------------------------------------------------
  // 粒子
  // ----------------------------------------------------------

  particleColor: "#D5D2C8",
  particleOpacity: 255,

  outlineColor: "#343536",
  outlineOpacity: 235,
  outlineWidth: 2.2,

  particleSize: 27,

  sizeMin: 0.94,
  sizeMax: 1.06,


  // ==========================================================
  // 整体飞行速度
  // ==========================================================

  baseFlightSpeed: 92,

  speedVariation: 10,

  minimumForwardSpeed: 62,

  maximumForwardSpeed: 125,

  speedEase: 0.018,


  // ==========================================================
  // ★ 向右下飞
  //
  // 这里重新加强下降。
  //
  // 但不再让所有鸟共享同一个 Y。
  // ==========================================================

  baseDownwardSpeed: 27,

  downwardVariation: 5,

  minimumDownwardSpeed: 18,

  maximumDownwardSpeed: 36,


  // ==========================================================
  // 航线逐渐向右下弯
  //
  // 越飞到后半程，下降趋势稍明显。
  // 不是一开始就扎下去。
  // ==========================================================

  routeDownwardIncrease: 7,


  // ==========================================================
  // 整群非常缓慢的上下起伏
  // ==========================================================

  flockVerticalWave: 14,

  flockVerticalWaveSpeed: 0.10,


  // ==========================================================
  // 入场
  //
  // 从左上区域进入
  // ==========================================================

  entryX: -330,

  entryY: 0.10,


  // ==========================================================
  // 队形
  // ==========================================================

  longWingLength: 285,

  longWingHeight: 105,


  upperWingLength: 185,

  upperWingHeight: 205,


  // ==========================================================
  // 固定的不规则程度
  // ==========================================================

  formationScatterX: 18,

  formationScatterY: 22,


  // ==========================================================
  // 队形软约束
  // ==========================================================

  formationPullX: 0.010,

  formationPullY: 0.006,


  // ==========================================================
  // 个体活动范围
  // ==========================================================

  roamX: 27,

  roamY: 30,

  roamChangeMin: 3.0,

  roamChangeMax: 6.5,


  // ==========================================================
  // 每只鸟自己的垂直漂移
  // ==========================================================

  verticalDriftMin: 6,

  verticalDriftMax: 17,

  verticalDriftSpeedMin: 0.17,

  verticalDriftSpeedMax: 0.40,


  // ==========================================================
  // 每只鸟自己的速度变化
  // ==========================================================

  speedWaveAmountMin: 4,

  speedWaveAmountMax: 11,

  speedWaveSpeedMin: 0.12,

  speedWaveSpeedMax: 0.30,


  // ==========================================================
  // 每只鸟自己的下降速度变化
  // ==========================================================

  downwardWaveAmountMin: 2,

  downwardWaveAmountMax: 7,

  downwardWaveSpeedMin: 0.10,

  downwardWaveSpeedMax: 0.25,


  // ==========================================================
  // 队形呼吸
  // ==========================================================

  formationBreathMin: 0.93,

  formationBreathMax: 1.07,

  formationBreathSpeed: 0.10,


  // ==========================================================
  // 领头雁
  // ==========================================================

  leaderSpeedBonus: 5,

  leaderMinimumLead: 52,

  leaderMaximumLead: 90,


  // ==========================================================
  // 防重叠
  // ==========================================================

  minimumDistance: 33,

  separationStrength: 0.10,


  // ==========================================================
  // 离场
  // ==========================================================

  outsideMargin: 250,

  restartDelayMin: 1.5,

  restartDelayMax: 3.0
};


// ============================================================
// 全局
// ============================================================

let bgImg = null;

let birds = [];

let leaderBird = null;


let formationOriginX = 0;

let formationOriginY = 0;


let flightStartX = 0;


let flockPhase = 0;

let formationPhase = 0;


let flockActive = false;

let restartTimer = 0;

let sketchReady = false;


// ============================================================
// setup
// ============================================================

async function setup() {

  const canvasSize =
    getCanvasSize();


  createCanvas(
    canvasSize.w,
    canvasSize.h
  );


  pixelDensity(1);


  background(210);


  try {

    bgImg =
      await loadImage(
        CONFIG.backgroundFile
      );

  } catch (loadError) {

    console.error(
      "背景图片加载失败：",
      loadError
    );


    bgImg = null;
  }


  createFlock();


  sketchReady = true;
}


// ============================================================
// 创建鸟群
// ============================================================

function createFlock() {

  birds = [];

  leaderBird = null;


  const scaleValue =
    getScaleValue();


  // ==========================================================
  // 队形参考点
  // ==========================================================

  formationOriginX =
    CONFIG.entryX *
    scaleValue;


  formationOriginY =
    height *
    CONFIG.entryY;


  flightStartX =
    formationOriginX;


  flockPhase =
    random(TWO_PI);


  formationPhase =
    random(TWO_PI);


  flockActive = true;

  restartTimer = 0;


  // ==========================================================
  // 领头雁
  // ==========================================================

  leaderBird =
    new GooseBird(
      "leader",
      0,
      0,
      0,
      true
    );


  birds.push(
    leaderBird
  );


  // ==========================================================
  // 左侧长支
  // 5只
  // ==========================================================

  const longWingProgress = [

    0.18,

    0.36,

    0.55,

    0.76,

    1.00

  ];


  for (
    let i = 0;
    i < longWingProgress.length;
    i++
  ) {

    const progress =
      longWingProgress[i];


    let targetX =
      -CONFIG.longWingLength *
      progress;


    let targetY =
      -CONFIG.longWingHeight *
      pow(
        progress,
        0.76
      );


    targetX +=
      random(
        -CONFIG.formationScatterX,
        CONFIG.formationScatterX
      );


    targetY +=
      random(
        -CONFIG.formationScatterY,
        CONFIG.formationScatterY
      );


    const newBird =
      new GooseBird(
        "long",
        targetX,
        targetY,
        progress,
        false
      );


    birds.push(
      newBird
    );
  }


  // ==========================================================
  // 上方短支
  // 4只
  // ==========================================================

  const upperWingProgress = [

    0.23,

    0.48,

    0.73,

    1.00

  ];


  for (
    let i = 0;
    i < upperWingProgress.length;
    i++
  ) {

    const progress =
      upperWingProgress[i];


    let targetX =
      -CONFIG.upperWingLength *
      progress;


    let targetY =
      -CONFIG.upperWingHeight *
      pow(
        progress,
        0.93
      );


    targetX +=
      random(
        -CONFIG.formationScatterX,
        CONFIG.formationScatterX
      );


    targetY +=
      random(
        -CONFIG.formationScatterY,
        CONFIG.formationScatterY
      );


    const newBird =
      new GooseBird(
        "upper",
        targetX,
        targetY,
        progress,
        false
      );


    birds.push(
      newBird
    );
  }


  // ==========================================================
  // 初始化真实位置
  // ==========================================================

  for (
    const bird of birds
  ) {

    bird.initializePosition();
  }
}


// ============================================================
// draw
// ============================================================

function draw() {

  if (!sketchReady) {

    background(210);

    return;
  }


  drawBackground();


  const dt =
    min(
      deltaTime / 1000,
      0.04
    );


  const scaleValue =
    getScaleValue();


  if (flockActive) {

    // ========================================================
    // 队形参考点只负责向右
    //
    // Y 不在这里直接线性增加。
    // 每只鸟自己完成向下飞行。
    // ========================================================

    formationOriginX +=
      CONFIG.baseFlightSpeed *
      scaleValue *
      dt;


    // ========================================================
    // 每只鸟独立飞行
    // ========================================================

    for (
      const bird of birds
    ) {

      bird.update(dt);
    }


    // ========================================================
    // 防重叠
    // ========================================================

    applySeparation();


    // ========================================================
    // 保持领头雁领先
    // ========================================================

    enforceLeader();


    // ========================================================
    // 判断离场
    // ========================================================

    let leftmostBirdX =
      Infinity;


    for (
      const bird of birds
    ) {

      if (
        bird.x <
        leftmostBirdX
      ) {

        leftmostBirdX =
          bird.x;
      }
    }


    if (
      leftmostBirdX >
      width +
      CONFIG.outsideMargin *
      scaleValue
    ) {

      flockActive =
        false;


      restartTimer =
        random(
          CONFIG.restartDelayMin,
          CONFIG.restartDelayMax
        );
    }

  } else {

    restartTimer -=
      dt;


    if (
      restartTimer <= 0
    ) {

      createFlock();
    }
  }


  // ==========================================================
  // 绘制
  // ==========================================================

  if (flockActive) {

    for (
      const bird of birds
    ) {

      bird.display();
    }
  }
}


// ============================================================
// 队形呼吸
// ============================================================

function getFormationBreath() {

  const currentTime =
    millis() / 1000;


  const waveValue =
    sin(
      currentTime *
      CONFIG.formationBreathSpeed +
      formationPhase
    );


  return map(
    waveValue,
    -1,
    1,
    CONFIG.formationBreathMin,
    CONFIG.formationBreathMax
  );
}


// ============================================================
// 整群缓慢上下波动
// ============================================================

function getFlockVerticalOffset() {

  const currentTime =
    millis() / 1000;


  return (
    sin(
      currentTime *
      CONFIG.flockVerticalWaveSpeed +
      flockPhase
    ) *
    CONFIG.flockVerticalWave *
    getScaleValue()
  );
}


// ============================================================
// 当前飞行进度
//
// 0 = 刚进入
// 1 = 接近右侧
//
// 用它让下降趋势逐渐增加，
// 而不是一开始就俯冲。
// ============================================================

function getFlightProgress() {

  const scaleValue =
    getScaleValue();


  const totalTravel =
    width +
    400 *
    scaleValue;


  const traveled =
    formationOriginX -
    flightStartX;


  return constrain(
    traveled /
    totalTravel,
    0,
    1
  );
}


// ============================================================
// 领头雁控制
// ============================================================

function enforceLeader() {

  if (!leaderBird) {

    return;
  }


  const scaleValue =
    getScaleValue();


  let rightmostOtherX =
    -Infinity;


  for (
    const bird of birds
  ) {

    if (
      bird === leaderBird
    ) {

      continue;
    }


    if (
      bird.x >
      rightmostOtherX
    ) {

      rightmostOtherX =
        bird.x;
    }
  }


  if (
    rightmostOtherX === -Infinity
  ) {

    return;
  }


  const currentLead =
    leaderBird.x -
    rightmostOtherX;


  const minimumLead =
    CONFIG.leaderMinimumLead *
    scaleValue;


  const maximumLead =
    CONFIG.leaderMaximumLead *
    scaleValue;


  // ==========================================================
  // 后面的鸟追得太近
  // → 领头雁逐渐加速
  // ==========================================================

  if (
    currentLead <
    minimumLead
  ) {

    leaderBird.targetSpeed +=
      10 *
      scaleValue;
  }


  // ==========================================================
  // 领头雁跑太远
  // → 稍微减速
  // ==========================================================

  if (
    currentLead >
    maximumLead
  ) {

    leaderBird.targetSpeed -=
      8 *
      scaleValue;
  }


  leaderBird.targetSpeed =
    constrain(
      leaderBird.targetSpeed,
      CONFIG.minimumForwardSpeed *
      scaleValue,
      CONFIG.maximumForwardSpeed *
      scaleValue
    );


  // ==========================================================
  // 极端情况下保证不会被超过
  //
  // 只做非常小的修正。
  // ==========================================================

  if (
    leaderBird.x <=
    rightmostOtherX
  ) {

    leaderBird.x =
      rightmostOtherX +
      2 *
      scaleValue;
  }
}


// ============================================================
// 防重叠
// ============================================================

function applySeparation() {

  const scaleValue =
    getScaleValue();


  const minimumGap =
    CONFIG.minimumDistance *
    scaleValue;


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

      const birdA =
        birds[i];


      const birdB =
        birds[j];


      const dx =
        birdA.x -
        birdB.x;


      const dy =
        birdA.y -
        birdB.y;


      const birdGap =
        sqrt(
          dx * dx +
          dy * dy
        );


      if (
        birdGap > 0 &&
        birdGap < minimumGap
      ) {

        const separationAmount =
          (
            minimumGap -
            birdGap
          ) *
          CONFIG.separationStrength;


        const normalX =
          dx /
          birdGap;


        const normalY =
          dy /
          birdGap;


        // ====================================================
        // 主要上下避让
        // ====================================================

        if (
          !birdA.isLeader
        ) {

          birdA.y +=
            normalY *
            separationAmount;


          birdA.x +=
            normalX *
            separationAmount *
            0.20;
        }


        if (
          !birdB.isLeader
        ) {

          birdB.y -=
            normalY *
            separationAmount;


          birdB.x -=
            normalX *
            separationAmount *
            0.20;
        }
      }
    }
  }
}


// ============================================================
// GooseBird
// ============================================================

class GooseBird {

  constructor(
    wingType,
    formationX,
    formationY,
    formationProgress,
    isLeader
  ) {

    this.wingType =
      wingType;


    this.formationX =
      formationX;


    this.formationY =
      formationY;


    this.formationProgress =
      formationProgress;


    this.isLeader =
      isLeader;


    // ========================================================
    // 真实坐标
    // ========================================================

    this.x = 0;

    this.y = 0;


    // ========================================================
    // X速度
    // ========================================================

    const scaleValue =
      getScaleValue();


    let initialSpeed =
      CONFIG.baseFlightSpeed +
      random(
        -CONFIG.speedVariation,
        CONFIG.speedVariation
      );


    if (
      this.isLeader
    ) {

      initialSpeed +=
        CONFIG.leaderSpeedBonus;
    }


    this.speed =
      initialSpeed *
      scaleValue;


    this.targetSpeed =
      this.speed;


    // ========================================================
    // 每只鸟自己的基础下降速度
    // ========================================================

    this.downwardSpeed =
      random(
        CONFIG.baseDownwardSpeed -
        CONFIG.downwardVariation,
        CONFIG.baseDownwardSpeed +
        CONFIG.downwardVariation
      ) *
      scaleValue;


    // ========================================================
    // 自由活动
    // ========================================================

    this.roamX = 0;

    this.roamY = 0;


    this.targetRoamX = 0;

    this.targetRoamY = 0;


    this.nextRoamChange =
      millis() / 1000 +
      random(
        CONFIG.roamChangeMin,
        CONFIG.roamChangeMax
      );


    // ========================================================
    // 垂直漂移
    // ========================================================

    this.verticalDriftAmount =
      random(
        CONFIG.verticalDriftMin,
        CONFIG.verticalDriftMax
      );


    this.verticalDriftSpeed =
      random(
        CONFIG.verticalDriftSpeedMin,
        CONFIG.verticalDriftSpeedMax
      );


    this.verticalPhase =
      random(TWO_PI);


    // ========================================================
    // 前进速度波动
    // ========================================================

    this.speedWaveAmount =
      random(
        CONFIG.speedWaveAmountMin,
        CONFIG.speedWaveAmountMax
      );


    this.speedWaveSpeed =
      random(
        CONFIG.speedWaveSpeedMin,
        CONFIG.speedWaveSpeedMax
      );


    this.speedPhase =
      random(TWO_PI);


    // ========================================================
    // 下降速度波动
    // ========================================================

    this.downwardWaveAmount =
      random(
        CONFIG.downwardWaveAmountMin,
        CONFIG.downwardWaveAmountMax
      );


    this.downwardWaveSpeed =
      random(
        CONFIG.downwardWaveSpeedMin,
        CONFIG.downwardWaveSpeedMax
      );


    this.downwardPhase =
      random(TWO_PI);


    // ========================================================
    // 大小
    // ========================================================

    this.sizeFactor =
      random(
        CONFIG.sizeMin,
        CONFIG.sizeMax
      );
  }


  // ==========================================================
  // 初始位置
  // ==========================================================

  initializePosition() {

    const scaleValue =
      getScaleValue();


    this.x =
      formationOriginX +
      this.formationX *
      scaleValue;


    this.y =
      formationOriginY +
      this.formationY *
      scaleValue;
  }


  // ==========================================================
  // 更新
  // ==========================================================

  update(dt) {

    const currentTime =
      millis() / 1000;


    const scaleValue =
      getScaleValue();


    // ========================================================
    // 自由活动目标
    // ========================================================

    if (
      currentTime >=
      this.nextRoamChange
    ) {

      const roamMultiplier =
        this.isLeader
          ? 0.35
          : 1.0;


      this.targetRoamX =
        random(
          -CONFIG.roamX,
          CONFIG.roamX
        ) *
        roamMultiplier;


      this.targetRoamY =
        random(
          -CONFIG.roamY,
          CONFIG.roamY
        ) *
        roamMultiplier;


      this.nextRoamChange =
        currentTime +
        random(
          CONFIG.roamChangeMin,
          CONFIG.roamChangeMax
        );
    }


    // ========================================================
    // 平滑改变自由偏移
    // ========================================================

    const roamFollow =
      1 -
      pow(
        1 - 0.012,
        dt * 60
      );


    this.roamX =
      lerp(
        this.roamX,
        this.targetRoamX,
        roamFollow
      );


    this.roamY =
      lerp(
        this.roamY,
        this.targetRoamY,
        roamFollow
      );


    // ========================================================
    // 队形呼吸
    // ========================================================

    const breathAmount =
      getFormationBreath();


    // ========================================================
    // X轴软目标
    // ========================================================

    const desiredFormationX =
      formationOriginX +
      this.formationX *
      breathAmount *
      scaleValue +
      this.roamX *
      scaleValue;


    // ========================================================
    // 根据落后/超前程度改变速度
    // ========================================================

    const horizontalError =
      desiredFormationX -
      this.x;


    let desiredSpeed =
      CONFIG.baseFlightSpeed *
      scaleValue;


    if (
      this.isLeader
    ) {

      desiredSpeed +=
        CONFIG.leaderSpeedBonus *
        scaleValue;
    }


    desiredSpeed +=
      horizontalError *
      CONFIG.formationPullX;


    // ========================================================
    // 自己的速度波动
    // ========================================================

    const speedWave =
      sin(
        currentTime *
        this.speedWaveSpeed +
        this.speedPhase
      ) *
      this.speedWaveAmount *
      scaleValue;


    desiredSpeed +=
      speedWave;


    desiredSpeed =
      constrain(
        desiredSpeed,
        CONFIG.minimumForwardSpeed *
        scaleValue,
        CONFIG.maximumForwardSpeed *
        scaleValue
      );


    this.targetSpeed =
      lerp(
        this.targetSpeed,
        desiredSpeed,
        0.025
      );


    const speedFollow =
      1 -
      pow(
        1 - CONFIG.speedEase,
        dt * 60
      );


    this.speed =
      lerp(
        this.speed,
        this.targetSpeed,
        speedFollow
      );


    // ========================================================
    // 真正向右飞
    // ========================================================

    this.x +=
      this.speed *
      dt;


    // ========================================================
    // ★★★★★ 向下飞 ★★★★★
    //
    // 每只鸟自己下降。
    // 不是整个队形共享同一个 Y 平移。
    // ========================================================

    const flightProgress =
      getFlightProgress();


    // --------------------------------------------------------
    // 越往右，下降速度稍微增加
    // --------------------------------------------------------

    const routeExtraDownward =
      CONFIG.routeDownwardIncrease *
      flightProgress *
      scaleValue;


    // --------------------------------------------------------
    // 每只鸟自己的下降节奏
    // --------------------------------------------------------

    const downwardWave =
      sin(
        currentTime *
        this.downwardWaveSpeed +
        this.downwardPhase
      ) *
      this.downwardWaveAmount *
      scaleValue;


    let currentDownwardSpeed =
      this.downwardSpeed +
      routeExtraDownward +
      downwardWave;


    currentDownwardSpeed =
      constrain(
        currentDownwardSpeed,
        CONFIG.minimumDownwardSpeed *
        scaleValue,
        CONFIG.maximumDownwardSpeed *
        scaleValue
      );


    // --------------------------------------------------------
    // 真正向下
    // --------------------------------------------------------

    this.y +=
      currentDownwardSpeed *
      dt;


    // ========================================================
    // 同时维持大致队形高度关系
    //
    // 这是很弱的拉力，
    // 不会把所有鸟重新吸成一条死线。
    // ========================================================

    const verticalDrift =
      sin(
        currentTime *
        this.verticalDriftSpeed +
        this.verticalPhase
      ) *
      this.verticalDriftAmount *
      scaleValue;


    // --------------------------------------------------------
    // 计算“当前整体下降后的参考高度”
    //
    // 用实际飞行距离估计。
    // --------------------------------------------------------

    const horizontalTravel =
      max(
        0,
        this.x -
        CONFIG.entryX *
        scaleValue
      );


    // --------------------------------------------------------
    // 大约形成右下方向，
    // 但不是每只鸟完全相同斜率。
    // --------------------------------------------------------

    const estimatedRouteDrop =
      horizontalTravel *
      0.27;


    const desiredFormationY =
      height *
      CONFIG.entryY +

      estimatedRouteDrop +

      getFlockVerticalOffset() +

      this.formationY *
      breathAmount *
      scaleValue +

      this.roamY *
      scaleValue +

      verticalDrift;


    const verticalError =
      desiredFormationY -
      this.y;


    // --------------------------------------------------------
    // 极弱修正
    // --------------------------------------------------------

    this.y +=
      verticalError *
      CONFIG.formationPullY *
      dt *
      60;
  }


  // ==========================================================
  // 绘制
  // ==========================================================

  display() {

    const scaleValue =
      getScaleValue();


    const diameter =
      CONFIG.particleSize *
      this.sizeFactor *
      scaleValue;


    if (
      this.x <
      -CONFIG.outsideMargin *
      scaleValue ||

      this.x >
      width +
      CONFIG.outsideMargin *
      scaleValue ||

      this.y <
      -CONFIG.outsideMargin *
      scaleValue ||

      this.y >
      height +
      CONFIG.outsideMargin *
      scaleValue
    ) {

      return;
    }


    push();


    stroke(
      makeAlphaColor(
        CONFIG.outlineColor,
        CONFIG.outlineOpacity
      )
    );


    strokeWeight(
      CONFIG.outlineWidth *
      scaleValue
    );


    fill(
      makeAlphaColor(
        CONFIG.particleColor,
        CONFIG.particleOpacity
      )
    );


    circle(
      this.x,
      this.y,
      diameter
    );


    pop();
  }
}


// ============================================================
// 背景
// ============================================================

function drawBackground() {

  if (
    !bgImg ||
    !bgImg.width ||
    !bgImg.height
  ) {

    background(210);

    return;
  }


  const sourceRatio =
    bgImg.width /
    bgImg.height;


  const canvasRatio =
    width /
    height;


  let drawWidth;

  let drawHeight;

  let drawX;

  let drawY;


  if (
    sourceRatio >
    canvasRatio
  ) {

    drawHeight =
      height;


    drawWidth =
      drawHeight *
      sourceRatio;


    drawX =
      (
        width -
        drawWidth
      ) /
      2;


    drawY = 0;

  } else {

    drawWidth =
      width;


    drawHeight =
      drawWidth /
      sourceRatio;


    drawX = 0;


    drawY =
      (
        height -
        drawHeight
      ) /
      2;
  }


  image(
    bgImg,
    drawX,
    drawY,
    drawWidth,
    drawHeight
  );
}


// ============================================================
// 画布尺寸
// ============================================================

function getCanvasSize() {

  let targetHeight =
    windowHeight;


  let targetWidth =
    targetHeight *
    CONFIG.imageRatio;


  if (
    targetWidth >
    windowWidth
  ) {

    targetWidth =
      windowWidth;


    targetHeight =
      targetWidth /
      CONFIG.imageRatio;
  }


  return {

    w:
      floor(
        targetWidth
      ),

    h:
      floor(
        targetHeight
      )
  };
}


// ============================================================
// 缩放
// ============================================================

function getScaleValue() {

  return height / 1080;
}


// ============================================================
// 透明颜色
// ============================================================

function makeAlphaColor(
  hexValue,
  opacityValue
) {

  const baseColor =
    color(
      hexValue
    );


  return color(

    red(
      baseColor
    ),

    green(
      baseColor
    ),

    blue(
      baseColor
    ),

    opacityValue
  );
}


// ============================================================
// 窗口变化
// ============================================================

function windowResized() {

  const canvasSize =
    getCanvasSize();


  resizeCanvas(
    canvasSize.w,
    canvasSize.h
  );


  if (sketchReady) {

    createFlock();
  }
}