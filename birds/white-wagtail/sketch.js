// ============================================================
// 白鹡鸰 · 岩石溪流 V5
// p5.js 2.3.4
//
// 背景：白鹡鸰.jpg
//
// 行为：
// 石面快速行走 → 短暂停顿觅食 → 继续行走
// 在同一石块活动较长时间后，才偶尔短飞到另一块石头
//
// 透视：
// 越靠画面上方越小
// 越靠画面下方越大
// 飞行、行走过程中连续改变尺寸
// ============================================================


// ============================================================
// ★★★★★ 所有可调参数 ★★★★★
// ============================================================

const CFG = {

  // ---------- 画面 ----------
  image: "白鹡鸰.jpg",

  W: 1920,
  H: 1080,


  // ---------- 五参数 ----------
  speedValue: 65,
  amountValue: 30,
  sizeValue: 15,
  cohesionValue: 30,
  rangeValue: 50,


  // ---------- 数量 ----------
  initialCount: 4,
  minCount: 3,
  maxCount: 5,


  // ---------- 粒子 ----------
  particleSize: 18,

  fillColor: "#E4E6E3",
  fillOpacity: 245,

  strokeColor: "#303331",
  strokeWeight: 1.5,


  // ==========================================================
  // ★ 纵深透视大小
  // ==========================================================

  perspectiveEnabled: true,

  // 最上方尺寸倍率
  farSizeScale: 0.62,

  // 最下方尺寸倍率
  nearSizeScale: 1.55,

  // >1：下半部分尺寸增长更明显
  perspectivePower: 1.45,


  // ==========================================================
  // ★ 石面行走
  // ==========================================================

  walkSpeedMin: 38,
  walkSpeedMax: 62,

  walkDistanceMin: 28,
  walkDistanceMax: 95,

  // 觅食结束后继续在当前石头走的概率
  continueWalkingChance: 0.88,


  // ==========================================================
  // ★ 觅食
  // ==========================================================

  forageChance: 0.82,

  forageTimeMin: 0.35,
  forageTimeMax: 1.15,

  foragePulseSpeed: 13,
  foragePulseAmount: 1.2,


  // ==========================================================
  // ★ 普通停顿
  // ==========================================================

  pauseTimeMin: 0.12,
  pauseTimeMax: 0.42,


  // ==========================================================
  // ★ 行走时轻微节奏
  // ==========================================================

  walkingBobEnabled: true,

  walkingBobSpeed: 12,
  walkingBobAmount: 0.65,


  // ==========================================================
  // ★ 换石块
  // ==========================================================

  // 至少在当前石头待这么久才允许飞
  minAreaStayBeforeFlight: 6.0,

  // 超过此时间，换石概率增加
  preferredAreaStay: 10.0,

  // 超过此时间，再进一步增加
  maxAreaStay: 14.0,

  // 基础换石概率
  changeAreaChance: 0.12,

  // 超过 preferredAreaStay 后增加
  lateChangeBonus: 0.16,

  // 超过 maxAreaStay 后概率
  forcedChangeChance: 0.48,


  // ==========================================================
  // ★ 石块之间短飞
  // ==========================================================

  flightSpeedMin: 390,
  flightSpeedMax: 560,

  flightArcMin: 10,
  flightArcMax: 34,


  // ==========================================================
  // ★ 防重叠
  // ==========================================================

  minimumGap: 28,

  // 同一石面最多几个
  maxBirdsPerArea: 2,


  // ==========================================================
  // ★ 飞入
  // ==========================================================

  enterEnabled: true,

  enterIntervalMin: 12,
  enterIntervalMax: 22,

  enterSpeedMin: 420,
  enterSpeedMax: 580,


  // ==========================================================
  // ★ 飞出
  // ==========================================================

  exitEnabled: true,

  exitMinStay: 18,

  exitChance: 0.035,

  exitSpeedMin: 430,
  exitSpeedMax: 600,


  // ==========================================================
  // ★ 飞行拖尾
  // ==========================================================

  trailEnabled: true,

  trailLife: 0.10,
  trailSpacing: 17,
  trailOpacity: 25,


  // ---------- 调试 ----------
  debug: false
};


// ============================================================
// ★★★★★ 石面活动区域 ★★★★★
// ============================================================

const ACTIVITY_AREAS = [

  // 0 顶部中央石头
  [
    [22.8,0.0],
    [33.2,0.0],
    [33.8,3.8],
    [34.0,7.5],
    [33.6,10.2],
    [31.8,11.7],
    [29.3,12.5],
    [27.0,11.5],
    [25.0,9.5],
    [22.8,8.0]
  ],

  // 1 左中小石
  [
    [14.0,22.4],
    [15.0,19.5],
    [16.4,17.5],
    [18.0,17.0],
    [19.4,18.0],
    [20.2,20.5],
    [19.7,22.9],
    [18.4,22.0],
    [17.0,21.1],
    [15.7,21.1]
  ],

  // 2 中上细长斜石面
  [
    [19.6,24.5],
    [21.3,21.7],
    [23.8,19.0],
    [26.5,17.2],
    [29.5,15.8],
    [32.2,15.4],
    [34.8,15.8],
    [33.0,17.0],
    [30.4,18.1],
    [27.8,19.4],
    [25.6,21.2],
    [23.6,22.8],
    [21.6,24.2]
  ],

  // 3 中央偏上苔藓小石
  [
    [27.8,33.3],
    [29.1,30.8],
    [31.3,29.0],
    [34.0,28.0],
    [36.7,28.3],
    [39.1,29.7],
    [40.4,31.7],
    [40.5,33.8],
    [37.4,33.5],
    [34.1,33.0],
    [31.2,33.2],
    [29.0,34.0]
  ],

  // 4 中央小浅色石
  [
    [28.8,36.8],
    [30.2,35.5],
    [32.3,35.0],
    [34.0,35.8],
    [35.1,37.1],
    [34.6,38.5],
    [32.4,38.4],
    [30.4,38.0]
  ],

  // 5 中央斜长石
  [
    [22.0,55.5],
    [23.5,52.0],
    [26.2,48.5],
    [29.5,45.5],
    [32.8,43.5],
    [36.3,42.7],
    [39.5,43.5],
    [42.5,42.0],
    [45.4,40.0],
    [48.1,38.3],
    [51.0,37.0],
    [54.2,36.3],
    [56.6,37.0],
    [55.0,38.7],
    [52.3,39.5],
    [49.5,40.6],
    [46.5,42.8],
    [43.7,45.0],
    [40.5,47.2],
    [37.0,49.0],
    [33.8,50.5],
    [30.4,51.3],
    [27.0,52.4],
    [24.4,54.5]
  ],

  // 6 右上大苔藓石
  [
    [56.0,39.0],
    [56.3,34.5],
    [57.0,29.0],
    [58.5,25.0],
    [61.0,22.0],
    [64.0,20.2],
    [67.0,18.7],
    [70.0,17.0],
    [72.5,15.7],
    [74.3,14.6],
    [75.5,13.9],
    [74.0,15.5],
    [71.6,17.2],
    [69.0,19.0],
    [66.4,21.0],
    [64.0,23.0],
    [61.7,25.2],
    [59.8,28.0],
    [58.5,31.0],
    [57.5,35.0],
    [57.0,38.5]
  ],

  // 7 中央右侧大石
  [
    [51.2,50.0],
    [52.7,47.0],
    [55.3,45.8],
    [58.8,45.4],
    [62.5,45.8],
    [66.0,46.0],
    [69.7,46.8],
    [73.4,47.5],
    [76.0,49.0],
    [76.5,52.5],
    [75.0,56.0],
    [72.8,59.0],
    [70.0,62.0],
    [67.0,65.0],
    [64.0,69.0],
    [60.8,72.5],
    [57.8,74.0],
    [54.8,72.0],
    [52.5,69.0],
    [51.0,66.0],
    [50.4,61.5],
    [50.5,56.0]
  ],

  // 8 左侧中部裁切石
  [
    [0.0,63.0],
    [1.5,60.0],
    [3.3,58.5],
    [5.0,58.7],
    [6.5,60.7],
    [7.2,64.0],
    [7.5,67.0],
    [6.2,69.0],
    [4.5,70.0],
    [2.7,71.5],
    [0.0,72.0]
  ],

  // 9 左下裁切石
  [
    [0.0,84.0],
    [2.0,81.8],
    [4.5,81.0],
    [7.0,81.5],
    [8.5,83.5],
    [9.3,86.0],
    [8.0,89.0],
    [6.0,92.0],
    [4.0,94.0],
    [2.0,95.0],
    [0.0,95.0]
  ],

  // 10 下方左中近景石
  [
    [12.5,91.5],
    [14.0,88.5],
    [16.5,85.5],
    [19.5,83.0],
    [22.8,81.7],
    [26.0,81.2],
    [29.5,81.7],
    [32.5,83.0],
    [34.0,85.0],
    [31.8,86.8],
    [29.0,88.0],
    [26.5,90.0],
    [23.7,92.0],
    [20.5,94.0],
    [17.2,95.0],
    [14.2,94.0]
  ],

  // 11 最下方中央大石
  [
    [23.5,100.0],
    [24.5,96.5],
    [26.5,93.0],
    [29.5,90.0],
    [33.0,87.5],
    [36.8,85.5],
    [40.5,84.0],
    [44.0,84.5],
    [46.5,86.5],
    [48.0,90.0],
    [48.8,94.0],
    [48.5,100.0]
  ],

  // 12 最下方偏右石
  [
    [48.0,100.0],
    [49.0,96.5],
    [51.0,94.0],
    [54.0,92.0],
    [57.5,91.5],
    [60.0,93.0],
    [61.0,96.0],
    [61.0,100.0]
  ]
];


// ============================================================
// 全局
// ============================================================

let bgImg;
let imageReady = false;

let areas = [];
let birds = [];
let trails = [];

let nextBirdID = 0;
let enterTimer = 0;


// ============================================================
// SETUP
// ============================================================

async function setup() {

  const canvasRef =
    createCanvas(
      CFG.W,
      CFG.H
    );

  pixelDensity(1);

  const canvasElement =
    canvasRef.elt;

  canvasElement.style.display = "block";
  canvasElement.style.height = "100vh";
  canvasElement.style.width = "auto";
  canvasElement.style.maxWidth = "none";
  canvasElement.style.maxHeight = "none";
  canvasElement.style.margin = "0";
  canvasElement.style.flex = "none";

  document.documentElement.style.margin = "0";
  document.documentElement.style.padding = "0";
  document.documentElement.style.width = "100%";
  document.documentElement.style.height = "100%";
  document.documentElement.style.overflow = "hidden";

  document.body.style.margin = "0";
  document.body.style.padding = "0";
  document.body.style.width = "100vw";
  document.body.style.height = "100vh";
  document.body.style.overflow = "hidden";
  document.body.style.display = "flex";
  document.body.style.alignItems = "center";
  document.body.style.justifyContent = "center";

  bgImg =
    await loadImage(
      CFG.image
    );

  prepareAreas();
  createInitialBirds();
  resetEnterTimer();

  imageReady = true;
}


// ============================================================
// 活动区域
// ============================================================

function prepareAreas() {

  areas = [];

  for (
    let areaIndex = 0;
    areaIndex < ACTIVITY_AREAS.length;
    areaIndex++
  ) {

    const polygon = [];

    for (
      const pair of
      ACTIVITY_AREAS[areaIndex]
    ) {

      polygon.push({

        x:
          pair[0] /
          100 *
          CFG.W,

        y:
          pair[1] /
          100 *
          CFG.H
      });
    }

    areas.push(polygon);
  }
}


// ============================================================
// DRAW
// ============================================================

function draw() {

  if (!imageReady) {

    background(25);
    return;
  }

  image(
    bgImg,
    0,
    0,
    CFG.W,
    CFG.H
  );

  const dt =
    min(
      deltaTime / 1000,
      0.045
    );

  updateEntering(dt);

  for (
    const bird of birds
  ) {

    bird.update(dt);
  }

  birds =
    birds.filter(
      bird =>
        !bird.removeMe
    );

  updateTrails(dt);
  drawTrails();

  for (
    const bird of birds
  ) {

    bird.render();
  }

  if (CFG.debug) {

    drawAreaDebug();
  }
}


// ============================================================
// 点是否位于 polygon
// ============================================================

function insidePolygon(
  x,
  y,
  polygon
) {

  let inside = false;

  for (
    let i = 0,
        j = polygon.length - 1;

    i < polygon.length;

    j = i++
  ) {

    const xi =
      polygon[i].x;

    const yi =
      polygon[i].y;

    const xj =
      polygon[j].x;

    const yj =
      polygon[j].y;

    const crossing =

      (
        (yi > y) !==
        (yj > y)
      )

      &&

      (
        x <
        (
          (xj - xi) *
          (y - yi) /
          (
            yj -
            yi +
            0.000001
          )
        )
        +
        xi
      );

    if (crossing) {

      inside =
        !inside;
    }
  }

  return inside;
}


// ============================================================
// 活动区域边界
// ============================================================

function getAreaBounds(
  areaIndex
) {

  const polygon =
    areas[areaIndex];

  let minX = CFG.W;
  let maxX = 0;

  let minY = CFG.H;
  let maxY = 0;

  for (
    const areaPoint of polygon
  ) {

    minX =
      min(
        minX,
        areaPoint.x
      );

    maxX =
      max(
        maxX,
        areaPoint.x
      );

    minY =
      min(
        minY,
        areaPoint.y
      );

    maxY =
      max(
        maxY,
        areaPoint.y
      );
  }

  return {
    minX,
    maxX,
    minY,
    maxY
  };
}


// ============================================================
// 区域随机点
// ============================================================

function randomPointInArea(
  areaIndex
) {

  const polygon =
    areas[areaIndex];

  const bounds =
    getAreaBounds(
      areaIndex
    );

  for (
    let attemptIndex = 0;
    attemptIndex < 100;
    attemptIndex++
  ) {

    const x =
      random(
        bounds.minX,
        bounds.maxX
      );

    const y =
      random(
        bounds.minY,
        bounds.maxY
      );

    if (
      insidePolygon(
        x,
        y,
        polygon
      )
    ) {

      return {
        x,
        y
      };
    }
  }

  let centerX = 0;
  let centerY = 0;

  for (
    const areaPoint of polygon
  ) {

    centerX +=
      areaPoint.x;

    centerY +=
      areaPoint.y;
  }

  centerX /=
    polygon.length;

  centerY /=
    polygon.length;

  return {

    x: centerX,
    y: centerY
  };
}


// ============================================================
// ★ 纵深透视尺寸
// ============================================================

function sizeAtY(y) {

  if (
    !CFG.perspectiveEnabled
  ) {

    return CFG.particleSize;
  }

  let depthValue =
    constrain(
      y / CFG.H,
      0,
      1
    );

  // 非线性：
  // 上半部分保持较小
  // 下半部分增长更明显
  depthValue =
    pow(
      depthValue,
      CFG.perspectivePower
    );

  return (

    CFG.particleSize *

    lerp(
      CFG.farSizeScale,
      CFG.nearSizeScale,
      depthValue
    )
  );
}


// ============================================================
// 区域粒子数量
// ============================================================

function countBirdsInArea(
  areaIndex,
  ignoredBird = null
) {

  let count = 0;

  for (
    const bird of birds
  ) {

    if (
      bird === ignoredBird ||
      bird.removeMe
    ) {

      continue;
    }

    if (
      bird.state === "exit"
    ) {

      continue;
    }

    let occupiedArea =
      bird.areaIndex;

    if (
      bird.state === "flight" ||
      bird.state === "enter"
    ) {

      occupiedArea =
        bird.targetAreaIndex;
    }

    if (
      occupiedArea ===
      areaIndex
    ) {

      count++;
    }
  }

  return count;
}


// ============================================================
// 防重叠
// ============================================================

function positionIsFree(
  x,
  y,
  particleSize,
  ignoredBird = null
) {

  for (
    const bird of birds
  ) {

    if (
      bird === ignoredBird ||
      bird.removeMe
    ) {

      continue;
    }

    if (
      bird.state === "exit"
    ) {

      continue;
    }

    const gapValue =
      Math.hypot(
        x - bird.x,
        y - bird.y
      );

    const requiredGap =

      particleSize *
      0.5

      +

      bird.currentSize *
      0.5

      +

      CFG.minimumGap;

    if (
      gapValue <
      requiredGap
    ) {

      return false;
    }
  }

  return true;
}


// ============================================================
// 找安全位置
// ============================================================

function findSafePointInArea(
  areaIndex,
  ignoredBird = null
) {

  if (
    countBirdsInArea(
      areaIndex,
      ignoredBird
    )
    >=
    CFG.maxBirdsPerArea
  ) {

    return null;
  }

  for (
    let attemptIndex = 0;
    attemptIndex < 100;
    attemptIndex++
  ) {

    const candidate =
      randomPointInArea(
        areaIndex
      );

    const candidateSize =
      sizeAtY(
        candidate.y
      );

    if (
      positionIsFree(
        candidate.x,
        candidate.y,
        candidateSize,
        ignoredBird
      )
    ) {

      return candidate;
    }
  }

  return null;
}


// ============================================================
// 选择活动区域
// ============================================================

function chooseArea(
  excludeArea = -1,
  ignoredBird = null
) {

  const available = [];

  for (
    let areaIndex = 0;
    areaIndex < areas.length;
    areaIndex++
  ) {

    if (
      areaIndex ===
      excludeArea
    ) {

      continue;
    }

    if (
      countBirdsInArea(
        areaIndex,
        ignoredBird
      )
      >=
      CFG.maxBirdsPerArea
    ) {

      continue;
    }

    available.push(
      areaIndex
    );
  }

  if (
    available.length === 0
  ) {

    return -1;
  }

  return random(
    available
  );
}


// ============================================================
// 初始粒子
// ============================================================

function createInitialBirds() {

  birds = [];

  for (
    let birdIndex = 0;
    birdIndex < CFG.initialCount;
    birdIndex++
  ) {

    for (
      let attemptIndex = 0;
      attemptIndex < 50;
      attemptIndex++
    ) {

      const areaIndex =
        chooseArea();

      if (
        areaIndex < 0
      ) {

        break;
      }

      const position =
        findSafePointInArea(
          areaIndex
        );

      if (!position) {

        continue;
      }

      birds.push(

        new WagtailParticle(
          nextBirdID++,
          areaIndex,
          position.x,
          position.y
        )
      );

      break;
    }
  }
}


// ============================================================
// 飞入
// ============================================================

function resetEnterTimer() {

  enterTimer =
    random(
      CFG.enterIntervalMin,
      CFG.enterIntervalMax
    );
}


function updateEntering(dt) {

  if (
    !CFG.enterEnabled
  ) {

    return;
  }

  enterTimer -= dt;

  if (
    birds.length <
    CFG.minCount
  ) {

    createEnteringBird();

    resetEnterTimer();

    return;
  }

  if (
    enterTimer <= 0
  ) {

    if (
      birds.length <
      CFG.maxCount
    ) {

      createEnteringBird();
    }

    resetEnterTimer();
  }
}


function createEnteringBird() {

  if (
    birds.length >=
    CFG.maxCount
  ) {

    return;
  }

  const areaIndex =
    chooseArea();

  if (
    areaIndex < 0
  ) {

    return;
  }

  const target =
    findSafePointInArea(
      areaIndex
    );

  if (!target) {

    return;
  }

  let startX;

  if (
    random() < 0.5
  ) {

    startX = -80;

  } else {

    startX =
      CFG.W + 80;
  }

  const startY =
    constrain(
      target.y +
      random(
        -130,
        130
      ),
      30,
      CFG.H - 30
    );

  const bird =
    new WagtailParticle(
      nextBirdID++,
      areaIndex,
      startX,
      startY
    );

  bird.beginEntry(
    areaIndex,
    target.x,
    target.y
  );

  birds.push(bird);
}


// ============================================================
// 白鹡鸰粒子
// ============================================================

class WagtailParticle {

  constructor(
    id,
    areaIndex,
    x,
    y
  ) {

    this.id = id;

    this.areaIndex =
      areaIndex;

    this.targetAreaIndex =
      areaIndex;

    this.x = x;
    this.y = y;

    this.previousX = x;
    this.previousY = y;

    this.currentSize =
      sizeAtY(y);

    this.state = "walk";

    // 在整个画面中的停留时间
    this.totalStay = 0;

    // 在当前石块上的停留时间
    this.areaStay = 0;

    this.targetX = x;
    this.targetY = y;

    this.walkSpeed =
      random(
        CFG.walkSpeedMin,
        CFG.walkSpeedMax
      );

    this.stateTimer = 0;

    this.foragePhase =
      random(TWO_PI);

    this.walkPhase =
      random(TWO_PI);

    this.flightStartX = 0;
    this.flightStartY = 0;

    this.flightTargetX = 0;
    this.flightTargetY = 0;

    this.flightAge = 0;
    this.flightDuration = 1;
    this.flightArc = 0;

    this.trailTravel = 0;

    this.removeMe = false;

    this.chooseWalkTarget();
  }


  // ==========================================================
  // 更新
  // ==========================================================

  update(dt) {

    this.previousX =
      this.x;

    this.previousY =
      this.y;

    if (
      this.state !== "enter" &&
      this.state !== "exit"
    ) {

      this.totalStay += dt;
    }

    if (
      this.state === "walk" ||
      this.state === "forage" ||
      this.state === "pause"
    ) {

      this.areaStay += dt;
    }

    if (
      this.state === "walk"
    ) {

      this.updateWalk(dt);

    } else if (
      this.state === "forage"
    ) {

      this.updateForage(dt);

    } else if (
      this.state === "pause"
    ) {

      this.updatePause(dt);

    } else if (
      this.state === "flight" ||
      this.state === "enter" ||
      this.state === "exit"
    ) {

      this.updateFlight(dt);
    }

    // ★ 无论什么状态，都根据当前纵向位置实时计算大小
    this.currentSize =
      sizeAtY(
        this.y
      );

    this.makeTrail();
  }


  // ==========================================================
  // 选择石面下一位置
  // ==========================================================

  chooseWalkTarget() {

    const polygon =
      areas[this.areaIndex];

    let found = false;

    for (
      let attemptIndex = 0;
      attemptIndex < 80;
      attemptIndex++
    ) {

      const angleValue =
        random(TWO_PI);

      const moveDistance =
        random(
          CFG.walkDistanceMin,
          CFG.walkDistanceMax
        );

      const candidateX =
        this.x +
        cos(angleValue) *
        moveDistance;

      const candidateY =
        this.y +
        sin(angleValue) *
        moveDistance *
        0.60;

      if (
        !insidePolygon(
          candidateX,
          candidateY,
          polygon
        )
      ) {

        continue;
      }

      const candidateSize =
        sizeAtY(
          candidateY
        );

      if (
        !positionIsFree(
          candidateX,
          candidateY,
          candidateSize,
          this
        )
      ) {

        continue;
      }

      this.targetX =
        candidateX;

      this.targetY =
        candidateY;

      found = true;

      break;
    }

    if (!found) {

      this.startPause();

      return;
    }

    this.walkSpeed =
      random(
        CFG.walkSpeedMin,
        CFG.walkSpeedMax
      );

    this.state =
      "walk";
  }


  // ==========================================================
  // 石面行走
  // ==========================================================

  updateWalk(dt) {

    const dx =
      this.targetX -
      this.x;

    const dy =
      this.targetY -
      this.y;

    const remaining =
      Math.hypot(
        dx,
        dy
      );

    if (
      remaining < 1.5
    ) {

      this.x =
        this.targetX;

      this.y =
        this.targetY;

      this.currentSize =
        sizeAtY(
          this.y
        );

      if (
        random() <
        CFG.forageChance
      ) {

        this.startForage();

      } else {

        this.startPause();
      }

      return;
    }

    const movement =
      min(
        remaining,
        this.walkSpeed *
        dt
      );

    const nextX =
      this.x +
      dx /
      remaining *
      movement;

    const nextY =
      this.y +
      dy /
      remaining *
      movement;

    const nextSize =
      sizeAtY(
        nextY
      );

    if (
      !insidePolygon(
        nextX,
        nextY,
        areas[this.areaIndex]
      )
    ) {

      this.chooseWalkTarget();

      return;
    }

    if (
      !positionIsFree(
        nextX,
        nextY,
        nextSize,
        this
      )
    ) {

      this.startPause();

      return;
    }

    this.x = nextX;
    this.y = nextY;

    // ★ 行走过程中实时变化
    this.currentSize =
      sizeAtY(
        this.y
      );

    this.walkPhase +=
      dt *
      CFG.walkingBobSpeed;
  }


  // ==========================================================
  // 开始觅食
  // ==========================================================

  startForage() {

    this.state =
      "forage";

    this.stateTimer =
      random(
        CFG.forageTimeMin,
        CFG.forageTimeMax
      );

    this.foragePhase =
      random(TWO_PI);
  }


  // ==========================================================
  // 觅食
  // ==========================================================

  updateForage(dt) {

    this.stateTimer -=
      dt;

    this.foragePhase +=
      dt *
      CFG.foragePulseSpeed;

    if (
      this.stateTimer > 0
    ) {

      return;
    }


    // ---------- 偶尔飞出 ----------

    if (
      CFG.exitEnabled &&

      birds.length >
      CFG.minCount &&

      this.totalStay >
      CFG.exitMinStay &&

      random() <
      CFG.exitChance
    ) {

      this.startExit();

      return;
    }


    // ---------- 判断是否允许换石 ----------

    let changeProbability = 0;

    if (
      this.areaStay >=
      CFG.minAreaStayBeforeFlight
    ) {

      changeProbability =
        CFG.changeAreaChance;
    }

    if (
      this.areaStay >=
      CFG.preferredAreaStay
    ) {

      changeProbability +=
        CFG.lateChangeBonus;
    }

    if (
      this.areaStay >=
      CFG.maxAreaStay
    ) {

      changeProbability =
        max(
          changeProbability,
          CFG.forcedChangeChance
        );
    }


    // ---------- 偶尔换石 ----------

    if (
      changeProbability > 0 &&
      random() <
      changeProbability
    ) {

      if (
        this.startAreaFlight()
      ) {

        return;
      }
    }


    // ---------- 大多数时候继续走 ----------

    if (
      random() <
      CFG.continueWalkingChance
    ) {

      this.chooseWalkTarget();

    } else {

      this.startPause();
    }
  }


  // ==========================================================
  // 普通停顿
  // ==========================================================

  startPause() {

    this.state =
      "pause";

    this.stateTimer =
      random(
        CFG.pauseTimeMin,
        CFG.pauseTimeMax
      );
  }


  updatePause(dt) {

    this.stateTimer -=
      dt;

    if (
      this.stateTimer <= 0
    ) {

      this.chooseWalkTarget();
    }
  }


  // ==========================================================
  // 飞到另一石块
  // ==========================================================

  startAreaFlight() {

    const targetArea =
      chooseArea(
        this.areaIndex,
        this
      );

    if (
      targetArea < 0
    ) {

      return false;
    }

    const target =
      findSafePointInArea(
        targetArea,
        this
      );

    if (!target) {

      return false;
    }

    this.beginFlight(
      targetArea,
      target.x,
      target.y,
      "flight",
      random(
        CFG.flightSpeedMin,
        CFG.flightSpeedMax
      )
    );

    return true;
  }


  // ==========================================================
  // 飞入
  // ==========================================================

  beginEntry(
    targetArea,
    targetX,
    targetY
  ) {

    this.beginFlight(
      targetArea,
      targetX,
      targetY,
      "enter",
      random(
        CFG.enterSpeedMin,
        CFG.enterSpeedMax
      )
    );
  }


  // ==========================================================
  // 飞出
  // ==========================================================

  startExit() {

    this.flightStartX =
      this.x;

    this.flightStartY =
      this.y;

    if (
      random() < 0.5
    ) {

      this.flightTargetX =
        -90;

    } else {

      this.flightTargetX =
        CFG.W + 90;
    }

    this.flightTargetY =
      constrain(
        this.y +
        random(
          -140,
          90
        ),
        25,
        CFG.H - 25
      );

    const travelLength =
      Math.hypot(
        this.flightTargetX -
        this.flightStartX,

        this.flightTargetY -
        this.flightStartY
      );

    const speedValue =
      random(
        CFG.exitSpeedMin,
        CFG.exitSpeedMax
      );

    this.flightDuration =
      constrain(
        travelLength /
        speedValue,
        0.38,
        2.5
      );

    this.flightAge = 0;

    this.flightArc =
      random(
        CFG.flightArcMin,
        CFG.flightArcMax
      );

    this.state =
      "exit";
  }


  // ==========================================================
  // 建立飞行
  // ==========================================================

  beginFlight(
    targetArea,
    targetX,
    targetY,
    newState,
    speedValue
  ) {

    this.targetAreaIndex =
      targetArea;

    this.flightStartX =
      this.x;

    this.flightStartY =
      this.y;

    this.flightTargetX =
      targetX;

    this.flightTargetY =
      targetY;

    const travelLength =
      Math.hypot(
        targetX -
        this.x,

        targetY -
        this.y
      );

    this.flightDuration =
      constrain(
        travelLength /
        speedValue,
        0.18,
        1.8
      );

    this.flightAge = 0;

    this.flightArc =
      random(
        CFG.flightArcMin,
        CFG.flightArcMax
      );

    this.state =
      newState;
  }


  // ==========================================================
  // 飞行
  // ==========================================================

  updateFlight(dt) {

    this.flightAge +=
      dt;

    const progressValue =
      constrain(
        this.flightAge /
        this.flightDuration,
        0,
        1
      );

    const easedValue =
      progressValue *
      progressValue *
      (
        3 -
        2 *
        progressValue
      );

    this.x =
      lerp(
        this.flightStartX,
        this.flightTargetX,
        easedValue
      );

    this.y =
      lerp(
        this.flightStartY,
        this.flightTargetY,
        easedValue
      )

      -

      sin(
        progressValue *
        PI
      )

      *

      this.flightArc;


    // ★ 飞行过程中根据当前实际 Y 坐标实时改变大小
    this.currentSize =
      sizeAtY(
        this.y
      );


    if (
      progressValue < 1
    ) {

      return;
    }

    if (
      this.state ===
      "exit"
    ) {

      this.removeMe =
        true;

      return;
    }

    const finishedState =
      this.state;

    this.areaIndex =
      this.targetAreaIndex;

    this.x =
      this.flightTargetX;

    this.y =
      this.flightTargetY;

    this.currentSize =
      sizeAtY(
        this.y
      );

    // 到达新的石头
    this.areaStay = 0;

    if (
      finishedState === "enter"
    ) {

      this.totalStay = 0;
    }

    this.startForage();
  }


  // ==========================================================
  // 飞行拖尾
  // ==========================================================

  makeTrail() {

    const flying =

      this.state === "flight" ||

      this.state === "enter" ||

      this.state === "exit";

    if (
      !CFG.trailEnabled ||
      !flying
    ) {

      this.trailTravel = 0;

      return;
    }

    const movedAmount =
      Math.hypot(
        this.x -
        this.previousX,

        this.y -
        this.previousY
      );

    this.trailTravel +=
      movedAmount;

    if (
      this.trailTravel <
      CFG.trailSpacing
    ) {

      return;
    }

    this.trailTravel = 0;

    trails.push({

      x: this.x,
      y: this.y,

      size:
        this.currentSize,

      age: 0,

      life:
        CFG.trailLife
    });
  }


  // ==========================================================
  // 绘制
  // ==========================================================

  render() {

    let drawX =
      this.x;

    let drawY =
      this.y;


    // ---------- 觅食时轻微点动 ----------

    if (
      this.state === "forage"
    ) {

      drawY +=

        sin(
          this.foragePhase
        )

        *

        CFG.foragePulseAmount;
    }


    // ---------- 行走节奏 ----------

    if (
      CFG.walkingBobEnabled &&
      this.state === "walk"
    ) {

      drawY +=

        sin(
          this.walkPhase
        )

        *

        CFG.walkingBobAmount;

      drawX +=

        cos(
          this.walkPhase *
          0.5
        )

        *

        0.25;
    }


    const bodyColor =
      color(
        CFG.fillColor
      );

    bodyColor.setAlpha(
      CFG.fillOpacity
    );

    fill(
      bodyColor
    );


    const edgeColor =
      color(
        CFG.strokeColor
      );

    stroke(
      edgeColor
    );

    strokeWeight(
      CFG.strokeWeight
    );


    circle(
      drawX,
      drawY,
      this.currentSize
    );
  }
}


// ============================================================
// 拖尾
// ============================================================

function updateTrails(dt) {

  for (
    const trailItem of trails
  ) {

    trailItem.age +=
      dt;
  }

  trails =
    trails.filter(
      trailItem =>
        trailItem.age <
        trailItem.life
    );
}


function drawTrails() {

  if (
    !CFG.trailEnabled
  ) {

    return;
  }

  push();

  noStroke();

  for (
    const trailItem of trails
  ) {

    const progressValue =
      trailItem.age /
      trailItem.life;

    const trailColor =
      color(
        CFG.fillColor
      );

    trailColor.setAlpha(

      CFG.trailOpacity *

      (
        1 -
        progressValue
      )
    );

    fill(
      trailColor
    );

    circle(
      trailItem.x,
      trailItem.y,

      trailItem.size *

      (
        0.48 -
        progressValue *
        0.20
      )
    );
  }

  pop();
}


// ============================================================
// 调试活动区域
// ============================================================

function drawAreaDebug() {

  push();

  stroke(
    255,
    45,
    20,
    235
  );

  strokeWeight(4);

  fill(
    255,
    60,
    20,
    42
  );

  for (
    let areaIndex = 0;
    areaIndex < areas.length;
    areaIndex++
  ) {

    beginShape();

    for (
      const areaPoint of
      areas[areaIndex]
    ) {

      vertex(
        areaPoint.x,
        areaPoint.y
      );
    }

    endShape(CLOSE);

    const bounds =
      getAreaBounds(
        areaIndex
      );

    noStroke();

    fill(255);

    textSize(24);

    text(
      areaIndex,

      (
        bounds.minX +
        bounds.maxX
      ) /
      2,

      (
        bounds.minY +
        bounds.maxY
      ) /
      2
    );

    stroke(
      255,
      45,
      20,
      235
    );

    fill(
      255,
      60,
      20,
      42
    );
  }

  pop();
}