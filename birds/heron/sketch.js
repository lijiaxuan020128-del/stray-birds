// =====================================================
// 苍鹭 · 黑水鸡拖尾水纹样式版
// p5.js 2.3.4
// 背景图片：苍鹭环境.jpg
//
// 水纹：
// 紧贴粒子产生 → 连续空间采样 → 前端圆弧
// → 两侧拖尾 → 透视压扁 → 留在水面扩散淡出
// =====================================================

const HERON_CONFIG = {

  // ===================================================
  // 01. 停走节奏
  // ===================================================

  movementDuration: [6, 14],
  restDuration: [2, 6],
  landingRestDuration: [1, 3],

  startSmoothSeconds: 0.8,
  stopSmoothSeconds: 0.5,
  stopSpeedThreshold: 0.08,

  initialMovingChance: 0.65,


  // ===================================================
  // 02. 图片 / 画布
  // ===================================================

  imageFile: "苍鹭环境.jpg",

  canvasWidth: 1280,
  canvasHeight: 720,

  cropTopPercent: 12,


  // ===================================================
  // 03. 粒子
  // ===================================================

  dotDiameter: 15,

  dotColor: "#838b95",
  dotOpacity: 255,

  outlineColor: "#e5ebf1",
  outlineWidth: 1,


  // ===================================================
  // 04. ★ 拖尾水纹：身体附近圆弧
  // ===================================================

  wakeEnabled: true,

  wakeFrontRadiusScale: 1.02,

  wakeFrontArcRoundness: 2,

  wakeSideRadiusScale: 1.5,

  wakeFrontArcTransition: 0.7,

  wakeFrontSpreadSpeed: 5,

  wakeSideSpreadSpeed: 4,


  // ===================================================
  // 05. ★ 拖尾水纹：透视 / 尾部
  // ===================================================

  wakePerspective: 0.5,

  wakeTailOpening: 0.18,

  wakeInitialTailScale: 3,

  wakeTailSpreadSpeed: 20,

  // 每移动多少像素产生一道水纹
  wakeSpacing: 5,

  wakeLife: 4.8,

  wakeMaxRipples: 16,

  wakeMinSpeed: 0.35,

  wakeExpandPower: 0.85,

  wakeColor: "#E7EEF0",

  wakeOpacity: 145,

  wakeFadePower: 1.35,

  wakeFadeInSeconds: 0.12,

  wakeTipFadePower: 0.9,

  wakeStartStroke: 0.95,

  wakeEndStroke: 0.35,

  wakeSegments: 32,


  // ===================================================
  // 06. 水纹阴影
  // ===================================================

  wakeShadowEnabled: true,

  wakeShadowColor: "#354540",

  wakeShadowOpacity: 32,

  wakeShadowOffsetY: 0.5,


  // ===================================================
  // 07. 分布 / 活动区域
  // ===================================================

  zones: [

    {
      centerX: 23,
      centerY: 86,
      spreadX: 14,
      spreadY: 5,
      weight: 3,
      landingSpread: 0.8
    },

    {
      centerX: 65,
      centerY: 93,
      spreadX: 14,
      spreadY: 4.5,
      weight: 2,
      landingSpread: 0.8
    },

    {
      centerX: 87,
      centerY: 81,
      spreadX: 8,
      spreadY: 3,
      weight: 1,
      landingSpread: 0.8
    },

    {
      centerX: 45,
      centerY: 81,
      spreadX: 7,
      spreadY: 2.5,
      weight: 1,
      landingSpread: 0.8
    }
  ],

  landingUniformChance: 0.65,

  landingGapPixels: 42,


  // ===================================================
  // 08. 初始粒子
  // ===================================================

  birds: [

    {
      x: 12.5,
      y: 87.5,
      zone: 0,
      startMoving: true,
      direction: 1,
      speedScale: 0.90
    },

    {
      x: 23.5,
      y: 82.4,
      zone: 0,
      startMoving: false,
      direction: -1,
      speedScale: 0.82
    },

    {
      x: 33.5,
      y: 89.2,
      zone: 0,
      startMoving: true,
      direction: -1,
      speedScale: 0.94
    },

    {
      x: 57.5,
      y: 95.6,
      zone: 1,
      startMoving: true,
      direction: 1,
      speedScale: 0.85
    },

    {
      x: 73.5,
      y: 91.3,
      zone: 1,
      startMoving: false,
      direction: -1,
      speedScale: 0.84
    },

    {
      x: 89,
      y: 79.6,
      zone: 2,
      startMoving: true,
      direction: -1,
      speedScale: 0.80
    },

    {
      x: 46.5,
      y: 80.7,
      zone: 3,
      startMoving: false,
      direction: 1,
      speedScale: 0.78
    }
  ],


  // ===================================================
  // 09. 数量 / 飞入飞出
  // ===================================================

  targetPopulation: 8,

  minimumPopulation: 7,

  departureInterval: [18, 32],

  arrivalDelay: [2, 5],

  firstArrivalDelay: 3,

  edgeFlightY: [32, 62],

  outsideMargin: 40,


  // ===================================================
  // 10. 水平移动
  // ===================================================

  walkSpeed: 5,

  directionDuration: [10, 22],

  turnSmoothSeconds: 1.5,

  boundaryTurnPixels: 14,


  // ===================================================
  // 11. 飞行
  // ===================================================

  flightEnabled: true,

  takeoffsPerMinute: 0.5,

  flightCooldownSeconds: 25,

  flightSpeed: 90,

  flightHeightPercent: [12, 20],

  maxSimultaneousFlights: 2,

  edgeArcPercent: 5,

  changeZoneOnFlight: true,


  // ===================================================
  // 12. 起飞 / 降落涟漪
  // ===================================================

  flightRippleEnabled: true,

  flightRippleRingCount: 3,

  flightRippleRingDelay: 0.13,

  flightRippleLife: 1.8,

  flightRippleStartRadius: 4,

  flightRippleMaxRadius: 62,

  flightRippleVerticalScale: 0.22,

  flightRippleOpacity: 180,

  flightRippleFadePower: 1.55,

  flightRippleStartWidth: 1.5,

  flightRippleEndWidth: 0.4,

  flightRippleColor: "#E7EEF0",

  takeoffRippleScale: 1,

  landingRippleScale: 1.12,


  // ===================================================
  // 13. 调试
  // ===================================================

  showZones: false
};


// =====================================================
// 全局变量
// =====================================================

let heronBackground = null;

let heronFlock = [];

let heronReady = false;

let heronLoadMessage = "";

let heronDepartureTimer = 0;

let heronArrivalTimer = null;

let heronFlightRipples = [];

let heronWaterWakes = [];

let heronNextBirdId = 0;


// =====================================================
// 初始化
// =====================================================

async function setup() {

  createCanvas(
    HERON_CONFIG.canvasWidth,
    HERON_CONFIG.canvasHeight
  );

  pixelDensity(1);


  try {

    heronBackground =
      await loadImage(
        HERON_CONFIG.imageFile
      );


    heronFlock =
      HERON_CONFIG.birds.map(

        settings =>
          new HeronDot(
            settings
          )

      );


    heronDepartureTimer =
      heronRange(
        HERON_CONFIG.departureInterval
      );


    heronArrivalTimer =
      HERON_CONFIG.firstArrivalDelay;


    heronReady = true;

  } catch (err) {

    heronLoadMessage =
      "加载失败，请检查图片：" +
      HERON_CONFIG.imageFile;


    console.error(
      err
    );
  }
}


// =====================================================
// 主循环
// =====================================================

function draw() {

  if (
    !heronReady
  ) {

    background(30);

    noStroke();

    fill(255);

    textAlign(
      CENTER,
      CENTER
    );

    textSize(18);

    text(
      heronLoadMessage ||
      "正在加载图片……",
      width / 2,
      height / 2
    );

    return;
  }


  const dt =
    min(
      deltaTime / 1000,
      0.05
    );


  drawHeronBackground();


  // ===================================================
  // 更新拖尾水纹
  // ===================================================

  for (
    const wake of
    heronWaterWakes
  ) {

    wake.age +=
      dt;
  }


  heronWaterWakes =
    heronWaterWakes.filter(

      wake =>
        wake.age <
        HERON_CONFIG.wakeLife

    );


  // ===================================================
  // 更新起降涟漪
  // ===================================================

  for (
    const ripple of
    heronFlightRipples
  ) {

    ripple.age +=
      dt;
  }


  heronFlightRipples =
    heronFlightRipples.filter(

      ripple =>
        ripple.age <
        HERON_CONFIG.flightRippleLife

    );


  // ===================================================
  // 更新苍鹭
  // ===================================================

  for (
    const bird of
    heronFlock
  ) {

    bird.advance(
      dt
    );
  }


  heronFlock =
    heronFlock.filter(

      bird =>
        !bird.finished

    );


  manageHeronPopulation(
    dt
  );


  // ===================================================
  // 绘制顺序：
  // 背景 → 拖尾 → 起降涟漪 → 粒子
  // ===================================================

  drawHeronWaterWakes();

  drawHeronFlightRipples();


  const drawOrder =
    [...heronFlock].sort(

      (firstBird, secondBird) =>
        firstBird.py -
        secondBird.py

    );


  for (
    const bird of
    drawOrder
  ) {

    bird.renderDot();
  }


  if (
    HERON_CONFIG.showZones
  ) {

    drawHeronZones();
  }
}


// =====================================================
// 工具
// =====================================================

function heronRange(
  values
) {

  return random(
    values[0],
    values[1]
  );
}


function heronDuration(
  values
) {

  return max(
    0.1,
    heronRange(values)
  );
}


function heronSmoothStep(
  amount
) {

  return (
    amount *
    amount *
    (
      3 -
      2 *
      amount
    )
  );
}


function heronEventOccurs(
  perMinute,
  dt
) {

  if (
    perMinute <= 0
  ) {

    return false;
  }


  return (

    random() <

    1 -

    Math.exp(
      -perMinute /
      60 *
      dt
    )

  );
}


// =====================================================
// 当前飞行数量
// =====================================================

function countHeronFlights() {

  return heronFlock.filter(

    bird =>
      bird.airborne &&
      !bird.finished

  ).length;
}


// =====================================================
// 背景
// =====================================================

function drawHeronBackground() {

  const canvasRatio =
    width /
    height;


  const photoRatio =
    heronBackground.width /
    heronBackground.height;


  let cropX =
    0;

  let cropY =
    0;

  let cropWidth =
    heronBackground.width;

  let cropHeight =
    heronBackground.height;


  if (
    photoRatio >
    canvasRatio
  ) {

    cropWidth =
      cropHeight *
      canvasRatio;


    cropX =
      (
        heronBackground.width -
        cropWidth
      ) /
      2;

  } else {

    cropHeight =
      cropWidth /
      canvasRatio;


    cropY =
      constrain(

        heronBackground.height *
        HERON_CONFIG.cropTopPercent /
        100,

        0,

        heronBackground.height -
        cropHeight

      );
  }


  image(

    heronBackground,

    0,
    0,

    width,
    height,

    cropX,
    cropY,
    cropWidth,
    cropHeight

  );
}


// =====================================================
// 区域边界
// =====================================================

function heronZoneBounds(
  zoneIndex
) {

  const zone =
    HERON_CONFIG.zones[
      zoneIndex
    ];


  return {

    minX:
      (
        zone.centerX -
        zone.spreadX
      ) /
      100 *
      width,

    maxX:
      (
        zone.centerX +
        zone.spreadX
      ) /
      100 *
      width,

    minY:
      (
        zone.centerY -
        zone.spreadY
      ) /
      100 *
      height,

    maxY:
      (
        zone.centerY +
        zone.spreadY
      ) /
      100 *
      height

  };
}


// =====================================================
// 选择区域
// =====================================================

function chooseHeronZone(
  excludedIndex = -1
) {

  const choices =
    [];


  let totalWeight =
    0;


  for (
    let idx = 0;
    idx <
    HERON_CONFIG.zones.length;
    idx++
  ) {

    if (
      idx === excludedIndex &&
      HERON_CONFIG.zones.length >
      1
    ) {

      continue;
    }


    const selectionWeight =
      max(
        0,
        HERON_CONFIG
          .zones[idx]
          .weight
      );


    choices.push({

      zoneIndex:
        idx,

      selectionWeight:
        selectionWeight

    });


    totalWeight +=
      selectionWeight;
  }


  if (
    choices.length === 0
  ) {

    return 0;
  }


  let selectionValue =
    random(
      totalWeight
    );


  for (
    const choice of
    choices
  ) {

    selectionValue -=
      choice.selectionWeight;


    if (
      selectionValue <=
      0
    ) {

      return choice.zoneIndex;
    }
  }


  return choices[
    choices.length - 1
  ].zoneIndex;
}


// =====================================================
// 选择落点
// =====================================================

function chooseHeronLanding(
  zoneIndex,
  ignoredBird = null
) {

  const zone =
    HERON_CONFIG.zones[
      zoneIndex
    ];


  const bounds =
    heronZoneBounds(
      zoneIndex
    );


  for (
    let attempt = 0;
    attempt < 70;
    attempt++
  ) {

    let candidateX;

    let candidateY;


    if (
      random() <
      HERON_CONFIG
        .landingUniformChance
    ) {

      candidateX =
        random(
          bounds.minX,
          bounds.maxX
        );


      candidateY =
        random(
          bounds.minY,
          bounds.maxY
        );

    } else {

      candidateX =
        randomGaussian(

          zone.centerX /
          100 *
          width,

          zone.spreadX /
          100 *
          width *
          zone.landingSpread

        );


      candidateY =
        randomGaussian(

          zone.centerY /
          100 *
          height,

          zone.spreadY /
          100 *
          height *
          zone.landingSpread

        );


      if (

        candidateX <
        bounds.minX ||

        candidateX >
        bounds.maxX ||

        candidateY <
        bounds.minY ||

        candidateY >
        bounds.maxY

      ) {

        continue;
      }
    }


    let landingAllowed =
      true;


    for (
      const bird of
      heronFlock
    ) {

      if (

        bird === ignoredBird ||

        bird.finished ||

        bird.flightKind ===
        "exit"

      ) {

        continue;
      }


      const otherX =
        bird.airborne
          ? bird.airEndX
          : bird.px;


      const otherY =
        bird.airborne
          ? bird.airEndY
          : bird.py;


      const birdGap =
        Math.hypot(

          candidateX -
          otherX,

          candidateY -
          otherY

        );


      if (
        birdGap <
        HERON_CONFIG
          .landingGapPixels
      ) {

        landingAllowed =
          false;

        break;
      }
    }


    if (
      landingAllowed
    ) {

      return {

        px:
          candidateX,

        py:
          candidateY

      };
    }
  }


  return null;
}


// =====================================================
// 调试区域
// =====================================================

function drawHeronZones() {

  push();


  textAlign(
    LEFT,
    BOTTOM
  );


  textSize(12);


  for (
    let idx = 0;
    idx <
    HERON_CONFIG.zones.length;
    idx++
  ) {

    const bounds =
      heronZoneBounds(
        idx
      );


    stroke(
      255,
      220,
      120,
      170
    );


    fill(
      255,
      220,
      120,
      18
    );


    rect(

      bounds.minX,
      bounds.minY,

      bounds.maxX -
      bounds.minX,

      bounds.maxY -
      bounds.minY

    );


    noStroke();


    fill(
      255,
      230,
      170
    );


    text(

      "区域 " +
      idx,

      bounds.minX,

      bounds.minY -
      4

    );
  }


  pop();
}


// =====================================================
// ★ 添加拖尾水纹
// =====================================================

function addHeronWaterWake(
  bird,
  birthX,
  birthY,
  travelSign
) {

  heronWaterWakes.push({

    ownerId:
      bird.birdId,

    px:
      birthX,

    py:
      birthY,

    travelSign:
      travelSign,

    age:
      0

  });


  // 每只苍鹭只保留固定数量的水纹
  let ownedCount =
    0;


  const maximum =
    max(

      1,

      floor(
        HERON_CONFIG
          .wakeMaxRipples
      )

    );


  for (

    let idx =
      heronWaterWakes.length -
      1;

    idx >= 0;

    idx--

  ) {

    if (

      heronWaterWakes[idx]
        .ownerId !==
      bird.birdId

    ) {

      continue;
    }


    ownedCount++;


    if (
      ownedCount >
      maximum
    ) {

      heronWaterWakes.splice(
        idx,
        1
      );
    }
  }
}


// =====================================================
// ★ 拖尾水纹 Bézier 曲线
// =====================================================

function heronWakeCurvePosition(
  wake,
  curveT,
  sideSign,
  growth
) {

  const bodyRadius =
    HERON_CONFIG.dotDiameter /
    2;


  // 前端
  const frontExtent =

    bodyRadius *
    HERON_CONFIG
      .wakeFrontRadiusScale +

    HERON_CONFIG
      .wakeFrontSpreadSpeed *

    HERON_CONFIG
      .wakeLife *

    growth;


  // 两侧
  const sideExtent =

    bodyRadius *
    HERON_CONFIG
      .wakeSideRadiusScale +

    HERON_CONFIG
      .wakeSideSpreadSpeed *

    HERON_CONFIG
      .wakeLife *

    growth;


  // 尾部
  const tailExtent =

    HERON_CONFIG.dotDiameter *

    HERON_CONFIG
      .wakeInitialTailScale +

    HERON_CONFIG
      .wakeTailSpreadSpeed *

    HERON_CONFIG
      .wakeLife *

    growth;


  const arcRoundness =
    constrain(

      HERON_CONFIG
        .wakeFrontArcRoundness,

      0.05,
      1.5

    );


  const arcTransition =
    constrain(

      HERON_CONFIG
        .wakeFrontArcTransition,

      0,
      1

    );


  const remaining =
    1 -
    curveT;


  // ===================================================
  // 前端圆弧 → 两侧 → 尾部
  // ===================================================

  const localX =

    remaining ** 3 *
    frontExtent +

    3 *
    remaining ** 2 *
    curveT *
    frontExtent -

    3 *
    remaining *
    curveT ** 2 *
    tailExtent *
    arcTransition -

    curveT ** 3 *
    tailExtent;


  const localY =

    sideSign *

    (

      3 *
      remaining ** 2 *
      curveT *
      sideExtent *
      arcRoundness +

      3 *
      remaining *
      curveT ** 2 *
      sideExtent +

      curveT ** 3 *
      sideExtent *
      (
        1 +
        HERON_CONFIG
          .wakeTailOpening
      )

    );


  // 苍鹭只水平运动。
  // travelSign = 1 向右
  // travelSign = -1 向左

  return {

    px:

      wake.px +

      localX *
      wake.travelSign,


    py:

      wake.py +

      localY *

      max(
        0.05,
        HERON_CONFIG
          .wakePerspective
      )

  };
}


// =====================================================
// ★ 绘制单层拖尾
// =====================================================

function drawHeronWakeLayer(
  wake,
  growth,
  wakeOpacityValue,
  isShadow
) {

  const segments =
    max(

      8,

      floor(
        HERON_CONFIG
          .wakeSegments
      )

    );


  const tintColor =
    color(

      isShadow

        ? HERON_CONFIG
            .wakeShadowColor

        : HERON_CONFIG
            .wakeColor

    );


  const offsetY =

    isShadow

      ? HERON_CONFIG
          .wakeShadowOffsetY

      : 0;


  for (
    const sideSign of
    [-1, 1]
  ) {

    let previousVertex =
      heronWakeCurvePosition(

        wake,

        0,

        sideSign,

        growth

      );


    for (

      let idx = 1;

      idx <= segments;

      idx++

    ) {

      const nextVertex =
        heronWakeCurvePosition(

          wake,

          idx /
          segments,

          sideSign,

          growth

        );


      const segmentMiddle =

        (
          idx -
          0.5
        ) /

        segments;


      // 越靠尾端越淡
      const tipFade =

        Math.pow(

          Math.max(

            0,

            1 -
            segmentMiddle ** 2

          ),

          HERON_CONFIG
            .wakeTipFadePower

        );


      tintColor.setAlpha(

        wakeOpacityValue *
        tipFade

      );


      stroke(
        tintColor
      );


      line(

        previousVertex.px,

        previousVertex.py +
        offsetY,

        nextVertex.px,

        nextVertex.py +
        offsetY

      );


      previousVertex =
        nextVertex;
    }
  }
}


// =====================================================
// ★ 绘制全部拖尾水纹
// =====================================================

function drawHeronWaterWakes() {

  if (
    !HERON_CONFIG.wakeEnabled
  ) {

    return;
  }


  push();


  noFill();


  strokeCap(
    ROUND
  );


  for (
    const wake of
    heronWaterWakes
  ) {

    const progress =
      constrain(

        wake.age /

        max(
          0.01,
          HERON_CONFIG.wakeLife
        ),

        0,
        1

      );


    const growth =
      Math.pow(

        progress,

        HERON_CONFIG
          .wakeExpandPower

      );


    // 出生时不是突然出现，而是轻微淡入
    const fadeIn =
      constrain(

        wake.age /

        max(

          0.001,

          HERON_CONFIG
            .wakeFadeInSeconds

        ),

        0,
        1

      );


    // 随寿命逐渐消失
    const visibility =

      fadeIn *

      Math.pow(

        1 -
        progress,

        HERON_CONFIG
          .wakeFadePower

      );


    strokeWeight(

      lerp(

        HERON_CONFIG
          .wakeStartStroke,

        HERON_CONFIG
          .wakeEndStroke,

        progress

      )

    );


    // =================================================
    // 阴影层
    // =================================================

    if (
      HERON_CONFIG
        .wakeShadowEnabled
    ) {

      drawHeronWakeLayer(

        wake,

        growth,

        HERON_CONFIG
          .wakeShadowOpacity *
        visibility,

        true

      );
    }


    // =================================================
    // 主水纹
    // =================================================

    drawHeronWakeLayer(

      wake,

      growth,

      HERON_CONFIG
        .wakeOpacity *
      visibility,

      false

    );
  }


  pop();
}


// =====================================================
// 起飞 / 降落涟漪
// =====================================================

function addHeronFlightRipple(
  rippleX,
  rippleY,
  rippleScale
) {

  if (
    !HERON_CONFIG
      .flightRippleEnabled
  ) {

    return;
  }


  for (

    let idx = 0;

    idx <
    HERON_CONFIG
      .flightRippleRingCount;

    idx++

  ) {

    heronFlightRipples.push({

      px:
        rippleX,

      py:
        rippleY,

      rippleScale:
        rippleScale,

      age:

        -idx *

        HERON_CONFIG
          .flightRippleRingDelay

    });
  }
}


// =====================================================
// 绘制起降涟漪
// =====================================================

function drawHeronFlightRipples() {

  if (
    !HERON_CONFIG
      .flightRippleEnabled
  ) {

    return;
  }


  push();


  noFill();


  for (
    const ripple of
    heronFlightRipples
  ) {

    if (
      ripple.age < 0
    ) {

      continue;
    }


    const progress =
      constrain(

        ripple.age /

        max(
          0.01,
          HERON_CONFIG
            .flightRippleLife
        ),

        0,
        1

      );


    const ringRadius =
      lerp(

        HERON_CONFIG
          .flightRippleStartRadius,

        HERON_CONFIG
          .flightRippleMaxRadius,

        Math.pow(
          progress,
          0.75
        )

      ) *

      ripple.rippleScale;


    const ringColor =
      color(

        HERON_CONFIG
          .flightRippleColor

      );


    ringColor.setAlpha(

      HERON_CONFIG
        .flightRippleOpacity *

      Math.pow(

        1 -
        progress,

        HERON_CONFIG
          .flightRippleFadePower

      )

    );


    stroke(
      ringColor
    );


    strokeWeight(

      lerp(

        HERON_CONFIG
          .flightRippleStartWidth,

        HERON_CONFIG
          .flightRippleEndWidth,

        progress

      )

    );


    ellipse(

      ripple.px,

      ripple.py,

      ringRadius *
      2,

      ringRadius *
      2 *
      HERON_CONFIG
        .flightRippleVerticalScale

    );
  }


  pop();
}


// =====================================================
// 数量管理
// =====================================================

function manageHeronPopulation(
  dt
) {

  if (
    !HERON_CONFIG.flightEnabled
  ) {

    return;
  }


  // ===================================================
  // 飞入
  // ===================================================

  if (
    heronFlock.length <
    HERON_CONFIG
      .targetPopulation
  ) {

    if (
      heronArrivalTimer ===
      null
    ) {

      heronArrivalTimer =
        heronRange(
          HERON_CONFIG
            .arrivalDelay
        );
    }


    heronArrivalTimer -=
      dt;


    if (

      heronArrivalTimer <=
      0 &&

      countHeronFlights() <

      HERON_CONFIG
        .maxSimultaneousFlights

    ) {

      addIncomingHeron();


      heronArrivalTimer =
        null;
    }

  } else {

    heronArrivalTimer =
      null;
  }


  // ===================================================
  // 飞出
  // ===================================================

  heronDepartureTimer -=
    dt;


  if (
    heronDepartureTimer >
    0
  ) {

    return;
  }


  const stayingCount =
    heronFlock.filter(

      bird =>
        bird.flightKind !==
        "exit"

    ).length;


  if (

    stayingCount <=
    HERON_CONFIG
      .minimumPopulation ||

    countHeronFlights() >=
    HERON_CONFIG
      .maxSimultaneousFlights

  ) {

    return;
  }


  const candidates =
    heronFlock.filter(

      bird =>

        !bird.airborne &&

        bird.flightCooldown <=
        0

    );


  if (
    candidates.length === 0
  ) {

    return;
  }


  random(
    candidates
  ).beginExit();


  heronDepartureTimer =
    heronRange(
      HERON_CONFIG
        .departureInterval
    );
}


// =====================================================
// 飞入
// =====================================================

function addIncomingHeron() {

  const zoneIndex =
    chooseHeronZone();


  const landing =
    chooseHeronLanding(
      zoneIndex
    );


  if (
    !landing
  ) {

    return;
  }


  const bird =
    new HeronDot({

      x:
        landing.px /
        width *
        100,

      y:
        landing.py /
        height *
        100,

      zone:
        zoneIndex,

      startMoving:
        false,

      direction:
        random() <
        0.5
          ? -1
          : 1,

      speedScale:
        random(
          0.8,
          1.05
        )

    });


  bird.px =

    random() <
    0.5

      ? -HERON_CONFIG
          .outsideMargin

      : width +
        HERON_CONFIG
          .outsideMargin;


  bird.py =

    heronRange(
      HERON_CONFIG
        .edgeFlightY
    ) /

    100 *

    height;


  bird.startAirPath(

    "enter",

    landing.px,

    landing.py,

    HERON_CONFIG
      .edgeArcPercent /
    100 *
    height,

    zoneIndex

  );


  heronFlock.push(
    bird
  );
}


// =====================================================
// 苍鹭粒子
// =====================================================

class HeronDot {

  constructor(
    settings
  ) {

    this.birdId =
      heronNextBirdId++;


    this.px =
      settings.x /
      100 *
      width;


    this.py =
      settings.y /
      100 *
      height;


    this.zoneIndex =
      settings.zone ??
      0;


    this.landingZone =
      this.zoneIndex;


    this.heading =

      settings.direction <
      0

        ? -1
        : 1;


    this.personalSpeed =

      HERON_CONFIG.walkSpeed *

      (
        settings.speedScale ??
        1
      );


    this.personalColor =

      settings.color ||

      HERON_CONFIG
        .dotColor;


    const startsInMotion =

      settings.startMoving ??

      (
        random() <
        HERON_CONFIG
          .initialMovingChance
      );


    this.surfaceState =

      startsInMotion

        ? "moving"

        : "resting";


    this.phaseRemaining =
      heronDuration(

        startsInMotion

          ? HERON_CONFIG
              .movementDuration

          : HERON_CONFIG
              .restDuration

      );


    this.velocityX =

      startsInMotion

        ? this.heading *
          this.personalSpeed

        : 0;


    this.turnRemaining =
      heronDuration(
        HERON_CONFIG
          .directionDuration
      );


    // =================================================
    // 飞行
    // =================================================

    this.airborne =
      false;

    this.finished =
      false;

    this.flightKind =
      "";

    this.flightCooldown =
      HERON_CONFIG
        .flightCooldownSeconds;

    this.airElapsed =
      0;

    this.airDuration =
      1;

    this.airStartX =
      this.px;

    this.airStartY =
      this.py;

    this.airEndX =
      this.px;

    this.airEndY =
      this.py;

    this.airArc =
      0;


    // =================================================
    // 拖尾水纹
    // =================================================

    this.wakeTravel =
      0;

    this.wakeWasMoving =
      false;

    this.wakeDirection =
      this.heading;
  }


  // ===================================================
  // 开始移动
  // ===================================================

  beginMoving() {

    this.surfaceState =
      "moving";


    this.phaseRemaining =
      heronDuration(
        HERON_CONFIG
          .movementDuration
      );
  }


  // ===================================================
  // 开始静止
  // ===================================================

  beginResting(
    durationRange
  ) {

    this.surfaceState =
      "resting";


    this.phaseRemaining =
      heronDuration(
        durationRange
      );


    this.velocityX =
      0;


    this.resetWakeState();
  }


  // ===================================================
  // 更新
  // ===================================================

  advance(
    dt
  ) {

    if (
      this.finished
    ) {

      return;
    }


    if (
      this.airborne
    ) {

      this.advanceFlight(
        dt
      );

      return;
    }


    this.flightCooldown =
      max(

        0,

        this.flightCooldown -
        dt

      );


    // =================================================
    // 偶尔起飞换区域
    // =================================================

    const populationBusy =

      heronFlock.length <

      HERON_CONFIG
        .targetPopulation ||

      heronDepartureTimer <=
      0;


    if (

      HERON_CONFIG
        .flightEnabled &&

      !populationBusy &&

      this.flightCooldown <=
      0 &&

      countHeronFlights() <

      HERON_CONFIG
        .maxSimultaneousFlights &&

      heronEventOccurs(

        HERON_CONFIG
          .takeoffsPerMinute,

        dt

      )

    ) {

      if (
        this.beginLocalFlight()
      ) {

        return;
      }
    }


    // =================================================
    // 停走状态
    // =================================================

    if (
      this.surfaceState ===
      "resting"
    ) {

      this.phaseRemaining -=
        dt;


      if (
        this.phaseRemaining <=
        0
      ) {

        this.beginMoving();
      }

    } else if (
      this.surfaceState ===
      "moving"
    ) {

      this.phaseRemaining -=
        dt;


      if (
        this.phaseRemaining <=
        0
      ) {

        this.surfaceState =
          "stopping";
      }
    }


    const movingNow =
      this.surfaceState ===
      "moving";


    // =================================================
    // 自然转向
    // =================================================

    if (
      movingNow
    ) {

      this.turnRemaining -=
        dt;


      if (
        this.turnRemaining <=
        0
      ) {

        this.heading *=
          -1;


        this.resetTurnTime();
      }
    }


    const bounds =
      heronZoneBounds(
        this.zoneIndex
      );


    const boundaryBuffer =

      min(

        HERON_CONFIG
          .boundaryTurnPixels,

        (
          bounds.maxX -
          bounds.minX
        ) *
        0.25

      );


    if (

      this.px <=

      bounds.minX +
      boundaryBuffer &&

      this.heading <
      0

    ) {

      this.heading =
        1;


      this.resetTurnTime();
    }


    if (

      this.px >=

      bounds.maxX -
      boundaryBuffer &&

      this.heading >
      0

    ) {

      this.heading =
        -1;


      this.resetTurnTime();
    }


    const previousX =
      this.px;


    // =================================================
    // 平滑启动 / 停止
    // =================================================

    if (
      this.surfaceState ===
      "resting"
    ) {

      this.velocityX =
        0;

    } else {

      const desiredVelocity =

        movingNow

          ? this.heading *
            this.personalSpeed

          : 0;


      let smoothingSeconds =
        HERON_CONFIG
          .stopSmoothSeconds;


      if (
        movingNow
      ) {

        const reversing =

          this.velocityX *
          this.heading <
          0;


        smoothingSeconds =

          reversing

            ? HERON_CONFIG
                .turnSmoothSeconds

            : HERON_CONFIG
                .startSmoothSeconds;
      }


      const velocityBlend =

        1 -

        Math.exp(

          -dt /

          max(
            0.01,
            smoothingSeconds
          )

        );


      this.velocityX =
        lerp(

          this.velocityX,

          desiredVelocity,

          velocityBlend

        );


      if (

        this.surfaceState ===
        "stopping" &&

        abs(
          this.velocityX
        ) <=

        max(

          0.001,

          HERON_CONFIG
            .stopSpeedThreshold

        )

      ) {

        this.beginResting(
          HERON_CONFIG
            .restDuration
        );
      }
    }


    // =================================================
    // 苍鹭水面只水平移动
    // =================================================

    this.px +=
      this.velocityX *
      dt;


    if (
      this.px <
      bounds.minX
    ) {

      this.px =
        bounds.minX;


      this.heading =
        1;


      this.velocityX =
        max(
          0,
          this.velocityX
        );
    }


    if (
      this.px >
      bounds.maxX
    ) {

      this.px =
        bounds.maxX;


      this.heading =
        -1;


      this.velocityX =
        min(
          0,
          this.velocityX
        );
    }


    // =================================================
    // 根据实际移动距离产生拖尾
    // =================================================

    this.emitWakeAlongMovement(

      previousX,

      dt

    );
  }


  // ===================================================
  // ★ 沿实际移动路径连续采样水纹
  // ===================================================

  emitWakeAlongMovement(
    previousX,
    dt
  ) {

    if (
      !HERON_CONFIG
        .wakeEnabled
    ) {

      this.resetWakeState();

      return;
    }


    const moveDX =
      this.px -
      previousX;


    const movedLength =
      abs(
        moveDX
      );


    const actualSpeed =

      movedLength /

      max(
        dt,
        0.000001
      );


    if (

      movedLength <
      0.000001 ||

      actualSpeed <
      HERON_CONFIG
        .wakeMinSpeed

    ) {

      this.resetWakeState();

      return;
    }


    const travelSign =

      moveDX >= 0

        ? 1

        : -1;


    // =================================================
    // 刚开始运动或刚刚转向时：
    // 第一道水纹紧贴粒子产生
    // =================================================

    if (

      !this.wakeWasMoving ||

      travelSign !==
      this.wakeDirection

    ) {

      this.wakeTravel =
        0;


      this.wakeWasMoving =
        true;


      this.wakeDirection =
        travelSign;


      addHeronWaterWake(

        this,

        previousX,

        this.py,

        travelSign

      );
    }


    const spacing =
      max(

        0.5,

        HERON_CONFIG
          .wakeSpacing

      );


    // =================================================
    // 不是按帧产生，而是按移动距离产生
    // =================================================

    const sampleCount =

      floor(

        (
          this.wakeTravel +
          movedLength
        ) /

        spacing

      );


    for (

      let idx = 0;

      idx <
      sampleCount;

      idx++

    ) {

      const sampleTravel =

        spacing -

        this.wakeTravel +

        idx *
        spacing;


      const portion =
        constrain(

          sampleTravel /
          movedLength,

          0,
          1

        );


      const sampleX =
        lerp(

          previousX,

          this.px,

          portion

        );


      addHeronWaterWake(

        this,

        sampleX,

        this.py,

        travelSign

      );
    }


    this.wakeTravel =

      (
        this.wakeTravel +
        movedLength
      ) %

      spacing;
  }


  // ===================================================
  // 重置拖尾状态
  // ===================================================

  resetWakeState() {

    this.wakeTravel =
      0;


    this.wakeWasMoving =
      false;
  }


  // ===================================================
  // 内部飞行
  // ===================================================

  beginLocalFlight() {

    const destinationZone =

      HERON_CONFIG
        .changeZoneOnFlight

        ? chooseHeronZone(
            this.zoneIndex
          )

        : this.zoneIndex;


    const landing =
      chooseHeronLanding(

        destinationZone,

        this

      );


    if (
      !landing
    ) {

      return false;
    }


    const routeLength =
      Math.hypot(

        landing.px -
        this.px,

        landing.py -
        this.py

      );


    if (
      routeLength <
      20
    ) {

      return false;
    }


    this.startAirPath(

      "local",

      landing.px,

      landing.py,

      heronRange(
        HERON_CONFIG
          .flightHeightPercent
      ) /
      100 *
      height,

      destinationZone

    );


    return true;
  }


  // ===================================================
  // 飞出
  // ===================================================

  beginExit() {

    const destinationX =

      this.heading >
      0

        ? width +
          HERON_CONFIG
            .outsideMargin

        : -HERON_CONFIG
            .outsideMargin;


    const destinationY =

      heronRange(
        HERON_CONFIG
          .edgeFlightY
      ) /

      100 *

      height;


    this.startAirPath(

      "exit",

      destinationX,

      destinationY,

      HERON_CONFIG
        .edgeArcPercent /
      100 *
      height,

      this.zoneIndex

    );
  }


  // ===================================================
  // 开始飞行
  // ===================================================

  startAirPath(
    flightType,
    destinationX,
    destinationY,
    arcHeight,
    destinationZone
  ) {

    if (
      flightType !==
      "enter"
    ) {

      addHeronFlightRipple(

        this.px,

        this.py,

        HERON_CONFIG
          .takeoffRippleScale

      );
    }


    this.airborne =
      true;


    this.flightKind =
      flightType;


    this.airElapsed =
      0;


    this.landingZone =
      destinationZone;


    this.airStartX =
      this.px;


    this.airStartY =
      this.py;


    this.airEndX =
      destinationX;


    this.airEndY =
      destinationY;


    this.airArc =
      arcHeight;


    const routeLength =
      Math.hypot(

        destinationX -
        this.px,

        destinationY -
        this.py

      );


    this.airDuration =
      max(

        1,

        routeLength /

        max(
          1,
          HERON_CONFIG
            .flightSpeed
        )

      );


    this.heading =

      destinationX >=
      this.px

        ? 1
        : -1;


    this.velocityX =
      0;


    this.resetWakeState();
  }


  // ===================================================
  // 飞行
  // ===================================================

  advanceFlight(
    dt
  ) {

    this.airElapsed +=
      dt;


    const progress =
      constrain(

        this.airElapsed /
        this.airDuration,

        0,
        1

      );


    const easedProgress =
      heronSmoothStep(
        progress
      );


    const arcShape =

      16 *

      progress ** 2 *

      (
        1 -
        progress
      ) ** 2;


    this.px =
      lerp(

        this.airStartX,

        this.airEndX,

        easedProgress

      );


    this.py =

      lerp(

        this.airStartY,

        this.airEndY,

        easedProgress

      ) -

      arcShape *
      this.airArc;


    if (
      progress <
      1
    ) {

      return;
    }


    this.px =
      this.airEndX;


    this.py =
      this.airEndY;


    if (
      this.flightKind ===
      "exit"
    ) {

      this.finished =
        true;

      return;
    }


    addHeronFlightRipple(

      this.px,

      this.py,

      HERON_CONFIG
        .landingRippleScale

    );


    this.airborne =
      false;


    this.flightKind =
      "";


    this.zoneIndex =
      this.landingZone;


    this.flightCooldown =
      HERON_CONFIG
        .flightCooldownSeconds;


    this.beginResting(
      HERON_CONFIG
        .landingRestDuration
    );


    this.resetTurnTime();
  }


  // ===================================================
  // 重置转向时间
  // ===================================================

  resetTurnTime() {

    this.turnRemaining =
      heronDuration(
        HERON_CONFIG
          .directionDuration
      );
  }


  // ===================================================
  // 绘制粒子
  // ===================================================

  renderDot() {

    push();


    const bodyColor =
      color(
        this.personalColor
      );


    bodyColor.setAlpha(
      HERON_CONFIG
        .dotOpacity
    );


    fill(
      bodyColor
    );


    if (
      HERON_CONFIG
        .outlineWidth >
      0
    ) {

      const edgeColor =
        color(
          HERON_CONFIG
            .outlineColor
        );


      edgeColor.setAlpha(
        HERON_CONFIG
          .dotOpacity
      );


      stroke(
        edgeColor
      );


      strokeWeight(
        HERON_CONFIG
          .outlineWidth
      );

    } else {

      noStroke();
    }


    circle(

      this.px,

      this.py,

      HERON_CONFIG
        .dotDiameter

    );


    pop();
  }
}
