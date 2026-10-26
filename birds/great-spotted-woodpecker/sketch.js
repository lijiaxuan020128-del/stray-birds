// ============================================================
// 大斑啄木鸟 · V4.0 · 三层真实景深遮挡
// p5.js 2.3.4
// 背景：大斑啄木鸟16：9.png
//
// 景深：
// 左树 depth 0
// 中树 depth 1
// 右树 depth 2
//
// 飞向/飞离左树：被中树、右树遮挡
// 飞向/飞离中树：盖住左树，被右树遮挡
// 飞向/飞离右树：盖住左树、中树
// ============================================================


// ============================================================
// ★★★★★ 所有可调参数 ★★★★★
// ============================================================

const CFG = {

  // 01 背景
  image: "大斑啄木鸟16：9.png",
  W: 1920,
  H: 1080,

  // 02 项目五参数
  speedValue: 45,
  amountValue: 10,
  sizeValue: 35,
  cohesionValue: 10,
  rangeValue: 35,

  // 03 数量
  initialCount: 4,
  minCount: 2,
  maxCount: 4,
  maxBirdsPerTree: 2,

  // 04 三个景深大小
  leftSize: 20,
  middleSize: 35,
  rightSize: 60,

  // 05 颜色
  fillColor: "#B8322A",
  fillOpacity: 245,
  strokeColor: "#52231F",
  strokeWeight: 4,

  // 06 三棵树出现权重
  leftTreeWeight: 0.12,
  middleTreeWeight: 0.28,
  rightTreeWeight: 0.60,

  // 07 树干爬行
  climbSpeedMin: 13,
  climbSpeedMax: 25,
  climbDistanceMin: 55,
  climbDistanceMax: 165,
  climbUpChance: 0.70,

  // 08 横向活动
  leftSideRange: 0.78,
  middleSideRange: 0.82,
  rightSideRange: 0.88,

  sideMoveMin: 0.18,
  sideMoveMax: 0.60,
  sideMoveSmooth: 2.2,

  // 09 树干有效宽度
  leftTreeWidth: 150,
  middleTreeWidth: 165,
  rightTreeWidth: 410,

  // 10 觅食
  forageAfterMoveChance: 0.78,
  forageTimeMin: 1.4,
  forageTimeMax: 3.8,
  foragePulseSpeed: 8.0,
  foragePulseAmount: 2.0,

  // 11 停顿
  shortPauseMin: 0.25,
  shortPauseMax: 0.75,

  // 12 换树
  changeTreeChance: 0.12,
  flightSpeedMin: 250,
  flightSpeedMax: 360,
  flightArcMin: 25,
  flightArcMax: 70,

  // 13 防重叠
  overlapExtraGap: 30,
  overlapLookAhead: 28,
  perchExtraGap: 25,

  // 14 飞入
  enterEnabled: true,
  enterIntervalMin: 10,
  enterIntervalMax: 18,
  enterSpeedMin: 270,
  enterSpeedMax: 370,

  // 15 飞出
  exitEnabled: true,
  exitMinStay: 15,
  exitChance: 0.07,
  exitSpeedMin: 300,
  exitSpeedMax: 410,

  // 16 拖尾
  trailEnabled: true,
  trailLife: 0.16,
  trailSpacing: 16,
  trailOpacity: 30,

  // 17 遮挡轮廓向外扩张
  // 如果树边缘还漏出一点粒子，可增大到 4~6
  occlusionPadding: 2,

  // 18 调试
  debug: false,
  showOcclusionMasks: false
};


// ============================================================
// 三棵树的运动骨架
// ============================================================

const TREE_TRACKS = [

  {
    sizeType: "left",
    points: [
      [10.0,100.0],
      [10.3,90.0],
      [10.7,80.0],
      [11.1,70.0],
      [11.6,60.0],
      [12.1,50.0],
      [12.7,40.0],
      [13.4,30.0],
      [14.2,20.0],
      [15.1,10.0],
      [16.0,0.0]
    ]
  },

  {
    sizeType: "middle",
    points: [
      [31.0,100.0],
      [31.0,90.0],
      [31.1,80.0],
      [31.3,70.0],
      [31.5,60.0],
      [31.7,50.0],
      [31.8,40.0],
      [31.8,30.0],
      [31.7,20.0],
      [31.4,10.0],
      [31.0,0.0]
    ]
  },

  {
    sizeType: "right",
    points: [
      [69.5,100.0],
      [69.0,91.0],
      [68.5,82.0],
      [68.2,73.0],
      [68.0,64.0],
      [68.2,55.0],
      [68.6,46.0],
      [69.0,37.0],
      [69.4,28.0],
      [69.8,19.0],
      [70.2,10.0],
      [70.5,0.0]
    ]
  }
];


// ============================================================
// ★ 三棵树真实遮挡轮廓
//
// 坐标是图片百分比。
// 根据你刚刚上传的 1920×1080 原图建立。
//
// 这些区域只用于“把原照片重新盖回来”，
// 不会改变粒子的运动范围。
// ============================================================

const TREE_MASKS = [

  // ----------------------------------------------------------
  // 0 · 最左侧树
  // ----------------------------------------------------------
  [
    [5.0,100],
    [5.2,94],
    [5.4,88],
    [5.5,82],
    [5.8,76],
    [6.0,70],
    [6.2,64],
    [6.5,58],
    [6.7,52],
    [6.9,46],
    [7.2,40],
    [7.5,34],
    [7.8,28],
    [8.2,22],
    [8.6,16],
    [9.0,10],
    [9.4,4],
    [9.6,0],

    [17.5,0],
    [17.0,5],
    [16.5,10],
    [16.0,16],
    [15.6,22],
    [15.2,28],
    [14.8,34],
    [14.4,40],
    [14.1,46],
    [13.8,52],
    [13.5,58],
    [13.2,64],
    [12.9,70],
    [12.6,76],
    [12.4,82],
    [12.2,88],
    [12.0,94],
    [11.8,100]
  ],

  // ----------------------------------------------------------
  // 1 · 中间树
  // ----------------------------------------------------------
  [
    [24.0,100],
    [24.2,94],
    [24.5,88],
    [24.8,82],
    [25.0,76],
    [25.3,70],
    [25.5,64],
    [25.8,58],
    [26.0,52],
    [26.2,46],
    [26.4,40],
    [26.6,34],
    [26.8,28],
    [27.0,22],
    [27.2,16],
    [27.4,10],
    [27.5,5],
    [27.4,0],

    [35.7,0],
    [35.6,6],
    [35.4,12],
    [35.2,18],
    [35.0,24],
    [34.8,30],
    [34.7,36],
    [34.6,42],
    [34.5,48],
    [34.4,54],
    [34.3,60],
    [34.2,66],
    [34.1,72],
    [34.0,78],
    [33.9,84],
    [33.8,90],
    [33.8,96],
    [33.8,100]
  ],

  // ----------------------------------------------------------
  // 2 · 最右侧巨大前景树
  //
  // 轮廓特意更密，因为它是最重要的遮挡层。
  // ----------------------------------------------------------
  [
    [48.5,100],
    [48.8,96],
    [49.2,92],
    [49.5,88],
    [49.7,84],
    [49.9,80],
    [50.2,76],
    [50.5,72],
    [50.8,68],
    [51.0,64],
    [51.3,60],
    [51.6,56],
    [51.8,52],
    [52.0,48],
    [52.2,44],
    [52.5,40],
    [52.8,36],
    [53.1,32],
    [53.4,28],
    [53.8,24],
    [54.2,20],
    [54.6,16],
    [55.0,12],
    [55.4,8],
    [55.8,4],
    [56.0,0],

    [86.2,0],
    [85.8,4],
    [85.3,8],
    [84.8,12],
    [84.2,16],
    [83.8,20],
    [83.4,24],
    [83.0,28],
    [82.7,32],
    [82.4,36],
    [82.1,40],
    [81.9,44],
    [81.7,48],
    [81.5,52],
    [81.3,56],
    [81.1,60],
    [80.9,64],
    [80.7,68],
    [80.5,72],
    [80.3,76],
    [80.1,80],
    [79.9,84],
    [79.7,88],
    [79.5,92],
    [79.3,96],
    [79.2,100]
  ]
];


// ============================================================
// 全局
// ============================================================

let bgImg;
let imageReady = false;

let treeTracks = [];
let birds = [];
let trails = [];

let nextBirdID = 0;
let enterTimer = 0;


// ============================================================
// SETUP
// ============================================================

async function setup() {

  const canvasRef = createCanvas(CFG.W, CFG.H);

  pixelDensity(1);

  const canvasElement = canvasRef.elt;

  canvasElement.style.height = "100vh";
  canvasElement.style.width = "auto";
  canvasElement.style.maxWidth = "100vw";
  canvasElement.style.display = "block";
  canvasElement.style.margin = "0 auto";

  document.documentElement.style.margin = "0";
  document.documentElement.style.padding = "0";
  document.documentElement.style.overflow = "hidden";

  document.body.style.margin = "0";
  document.body.style.padding = "0";
  document.body.style.overflow = "hidden";

  bgImg = await loadImage(CFG.image);

  prepareTreeTracks();
  createInitialBirds();
  resetEnterTimer();

  imageReady = true;
}


// ============================================================
// 建立树干骨架
// ============================================================

function prepareTreeTracks() {

  treeTracks = [];

  for (let treeIndex = 0; treeIndex < TREE_TRACKS.length; treeIndex++) {

    const source = TREE_TRACKS[treeIndex];

    const convertedPoints = [];

    for (const pair of source.points) {

      convertedPoints.push({
        x: pair[0] / 100 * width,
        y: pair[1] / 100 * height
      });
    }

    treeTracks.push({
      sizeType: source.sizeType,
      points: convertedPoints
    });
  }
}


// ============================================================
// DRAW
// ============================================================

function draw() {

  if (!imageReady) {
    background(20);
    return;
  }

  const dt = min(deltaTime / 1000, 0.045);

  updateEntering(dt);

  for (const bird of birds) {
    bird.update(dt);
  }

  birds = birds.filter(bird => !bird.removeMe);

  updateTrails(dt);

  // ----------------------------------------------------------
  // 先画完整背景
  // ----------------------------------------------------------

  image(bgImg, 0, 0, width, height);


  // ==========================================================
  // DEPTH 0 · 左树层
  // ==========================================================

  drawTrailsAtDepth(0);
  drawFlyingBirdsAtDepth(0);

  // 中树、右树在它前面
  redrawTreeMask(1);
  redrawTreeMask(2);


  // ==========================================================
  // DEPTH 1 · 中树层
  // ==========================================================

  drawTrailsAtDepth(1);
  drawFlyingBirdsAtDepth(1);

  // 只有右树在它前面
  redrawTreeMask(2);


  // ==========================================================
  // DEPTH 2 · 右树层
  // ==========================================================

  drawTrailsAtDepth(2);
  drawFlyingBirdsAtDepth(2);


  // ==========================================================
  // 最后画已经停在树皮表面的粒子
  // ==========================================================

  for (const bird of birds) {

    if (!birdIsFlying(bird)) {
      bird.render();
    }
  }


  if (CFG.showOcclusionMasks) {
    drawMaskDebug();
  }

  if (CFG.debug) {
    drawTreeDebug();
  }
}


// ============================================================
// 判断是否飞行
// ============================================================

function birdIsFlying(bird) {

  return (
    bird.state === "flight" ||
    bird.state === "enter" ||
    bird.state === "exit"
  );
}


// ============================================================
// ★ 按景深绘制飞行粒子
// ============================================================

function drawFlyingBirdsAtDepth(depthIndex) {

  for (const bird of birds) {

    if (!birdIsFlying(bird)) {
      continue;
    }

    if (bird.flightDepth !== depthIndex) {
      continue;
    }

    bird.render();
  }
}


// ============================================================
// ★ 按景深绘制拖尾
// ============================================================

function drawTrailsAtDepth(depthIndex) {

  if (!CFG.trailEnabled) {
    return;
  }

  push();

  noStroke();

  for (const trailItem of trails) {

    if (trailItem.depth !== depthIndex) {
      continue;
    }

    const progressValue =
      trailItem.age /
      trailItem.life;

    const trailColor =
      color(CFG.fillColor);

    trailColor.setAlpha(
      CFG.trailOpacity *
      (1 - progressValue)
    );

    fill(trailColor);

    circle(
      trailItem.x,
      trailItem.y,
      trailItem.size *
      (
        0.50 -
        progressValue * 0.22
      )
    );
  }

  pop();
}


// ============================================================
// ★ 用原背景重新覆盖一棵树
//
// 使用 Canvas clipping。
// 这样重新画出来的是照片本身，不是色块。
// ============================================================

function redrawTreeMask(treeIndex) {

  const polygon = TREE_MASKS[treeIndex];

  if (!polygon || polygon.length < 3) {
    return;
  }

  const ctx = drawingContext;

  ctx.save();

  ctx.beginPath();

  const firstX =
    polygon[0][0] / 100 * width;

  const firstY =
    polygon[0][1] / 100 * height;

  ctx.moveTo(firstX, firstY);

  for (let i = 1; i < polygon.length; i++) {

    const px =
      polygon[i][0] / 100 * width;

    const py =
      polygon[i][1] / 100 * height;

    ctx.lineTo(px, py);
  }

  ctx.closePath();

  ctx.clip();

  image(
    bgImg,
    0,
    0,
    width,
    height
  );

  ctx.restore();
}


// ============================================================
// 树参数
// ============================================================

function getTreeParticleSize(treeIndex) {

  const type =
    treeTracks[treeIndex].sizeType;

  if (type === "left") {
    return CFG.leftSize;
  }

  if (type === "middle") {
    return CFG.middleSize;
  }

  return CFG.rightSize;
}


function getTreeWidth(treeIndex) {

  if (treeIndex === 0) {
    return CFG.leftTreeWidth;
  }

  if (treeIndex === 1) {
    return CFG.middleTreeWidth;
  }

  return CFG.rightTreeWidth;
}


function getTreeSideRange(treeIndex) {

  if (treeIndex === 0) {
    return CFG.leftSideRange;
  }

  if (treeIndex === 1) {
    return CFG.middleSideRange;
  }

  return CFG.rightSideRange;
}


// ============================================================
// 当前树上的粒子数
// ============================================================

function countBirdsForTree(treeIndex, ignoredBird = null) {

  let count = 0;

  for (const bird of birds) {

    if (
      bird === ignoredBird ||
      bird.removeMe
    ) {
      continue;
    }

    if (bird.state === "exit") {
      continue;
    }

    let occupiedTree =
      bird.treeIndex;

    if (
      bird.state === "flight" ||
      bird.state === "enter"
    ) {
      occupiedTree =
        bird.targetTreeIndex;
    }

    if (occupiedTree === treeIndex) {
      count++;
    }
  }

  return count;
}


// ============================================================
// 树干长度
// ============================================================

function getTreeTrackLength(treeIndex) {

  const pts =
    treeTracks[treeIndex].points;

  let totalLength = 0;

  for (
    let i = 0;
    i < pts.length - 1;
    i++
  ) {

    totalLength +=
      Math.hypot(
        pts[i + 1].x - pts[i].x,
        pts[i + 1].y - pts[i].y
      );
  }

  return totalLength;
}


// ============================================================
// 树干中心
// ============================================================

function getTreeCenterPosition(treeIndex, treeT) {

  const pts =
    treeTracks[treeIndex].points;

  const totalLength =
    getTreeTrackLength(treeIndex);

  const targetLength =
    constrain(treeT, 0, 1) *
    totalLength;

  let travelled = 0;

  for (
    let i = 0;
    i < pts.length - 1;
    i++
  ) {

    const a = pts[i];
    const b = pts[i + 1];

    const segmentLength =
      Math.hypot(
        b.x - a.x,
        b.y - a.y
      );

    if (
      travelled + segmentLength >=
      targetLength
    ) {

      const localT =
        (
          targetLength -
          travelled
        ) /
        max(segmentLength, 0.001);

      return {
        x: lerp(a.x, b.x, localT),
        y: lerp(a.y, b.y, localT)
      };
    }

    travelled += segmentLength;
  }

  const lastPoint =
    pts[pts.length - 1];

  return {
    x: lastPoint.x,
    y: lastPoint.y
  };
}


// ============================================================
// 树干方向
// ============================================================

function getTreeDirection(treeIndex, treeT) {

  const before =
    getTreeCenterPosition(
      treeIndex,
      constrain(treeT - 0.008, 0, 1)
    );

  const after =
    getTreeCenterPosition(
      treeIndex,
      constrain(treeT + 0.008, 0, 1)
    );

  const dx =
    after.x - before.x;

  const dy =
    after.y - before.y;

  const lengthValue =
    max(
      0.001,
      Math.hypot(dx, dy)
    );

  return {
    x: dx / lengthValue,
    y: dy / lengthValue
  };
}


// ============================================================
// 树干表面位置
// ============================================================

function getTreePosition(
  treeIndex,
  treeT,
  sideOffset = 0
) {

  const center =
    getTreeCenterPosition(
      treeIndex,
      treeT
    );

  const direction =
    getTreeDirection(
      treeIndex,
      treeT
    );

  const normalX =
    -direction.y;

  const normalY =
    direction.x;

  const treeWidth =
    getTreeWidth(treeIndex);

  const particleSize =
    getTreeParticleSize(treeIndex);

  const usableHalfWidth =
    max(
      0,
      treeWidth * 0.5 -
      particleSize * 0.55
    );

  return {

    x:
      center.x +
      normalX *
      usableHalfWidth *
      sideOffset,

    y:
      center.y +
      normalY *
      usableHalfWidth *
      sideOffset
  };
}


// ============================================================
// 随机横向位置
// ============================================================

function randomSideOffset(treeIndex) {

  const sideRange =
    getTreeSideRange(treeIndex);

  return random(
    -sideRange,
    sideRange
  );
}


// ============================================================
// 选择树
// ============================================================

function chooseWeightedTree(
  excludeTree = -1,
  ignoredBird = null
) {

  let weights = [
    CFG.leftTreeWeight,
    CFG.middleTreeWeight,
    CFG.rightTreeWeight
  ];

  for (
    let i = 0;
    i < weights.length;
    i++
  ) {

    if (
      i === excludeTree ||
      countBirdsForTree(
        i,
        ignoredBird
      ) >= CFG.maxBirdsPerTree
    ) {

      weights[i] = 0;
    }
  }

  let totalWeight = 0;

  for (const weightValue of weights) {
    totalWeight += weightValue;
  }

  if (totalWeight <= 0) {
    return -1;
  }

  let selector =
    random(totalWeight);

  for (
    let treeIndex = 0;
    treeIndex < weights.length;
    treeIndex++
  ) {

    selector -=
      weights[treeIndex];

    if (selector <= 0) {
      return treeIndex;
    }
  }

  return -1;
}


// ============================================================
// 防重叠距离
// ============================================================

function requiredBirdGap(sizeA, sizeB) {

  return (
    sizeA * 0.5 +
    sizeB * 0.5 +
    CFG.overlapExtraGap
  );
}


// ============================================================
// 位置是否安全
// ============================================================

function positionIsFree(
  x,
  y,
  particleSize,
  ignoredBird = null,
  extraGap = 0
) {

  for (const bird of birds) {

    if (
      bird === ignoredBird ||
      bird.removeMe
    ) {
      continue;
    }

    if (bird.state === "exit") {
      continue;
    }

    const gapValue =
      Math.hypot(
        x - bird.x,
        y - bird.y
      );

    const requiredGap =
      requiredBirdGap(
        particleSize,
        bird.currentSize
      ) +
      extraGap;

    if (gapValue < requiredGap) {
      return false;
    }
  }

  return true;
}


// ============================================================
// 树上位置是否安全
// ============================================================

function treePositionIsFree(
  treeIndex,
  treeT,
  sideOffset,
  ignoredBird = null,
  extraGap = 0
) {

  const position =
    getTreePosition(
      treeIndex,
      treeT,
      sideOffset
    );

  return positionIsFree(
    position.x,
    position.y,
    getTreeParticleSize(treeIndex),
    ignoredBird,
    extraGap
  );
}


// ============================================================
// 找落点
// ============================================================

function findTreePerch(
  preferredTree = -1,
  ignoredBird = null
) {

  for (
    let attemptIndex = 0;
    attemptIndex < 100;
    attemptIndex++
  ) {

    let treeIndex;

    if (preferredTree >= 0) {

      if (
        countBirdsForTree(
          preferredTree,
          ignoredBird
        ) >= CFG.maxBirdsPerTree
      ) {

        treeIndex =
          chooseWeightedTree(
            -1,
            ignoredBird
          );

      } else {

        treeIndex =
          preferredTree;
      }

    } else {

      treeIndex =
        chooseWeightedTree(
          -1,
          ignoredBird
        );
    }

    if (treeIndex < 0) {
      continue;
    }

    const treeT =
      random(0.10, 0.90);

    const sideOffset =
      randomSideOffset(treeIndex);

    if (
      treePositionIsFree(
        treeIndex,
        treeT,
        sideOffset,
        ignoredBird,
        CFG.perchExtraGap
      )
    ) {

      const position =
        getTreePosition(
          treeIndex,
          treeT,
          sideOffset
        );

      return {
        treeIndex,
        treeT,
        sideOffset,
        x: position.x,
        y: position.y
      };
    }
  }

  return null;
}


// ============================================================
// 初始粒子
// ============================================================

function createInitialBirds() {

  birds = [];

  for (
    let i = 0;
    i < CFG.initialCount;
    i++
  ) {

    let preferredTree = -1;

    // 大部分在右侧前景树
    if (i < 2) {
      preferredTree = 2;
    }

    const perch =
      findTreePerch(preferredTree);

    if (!perch) {
      continue;
    }

    birds.push(
      new WoodpeckerParticle(
        nextBirdID++,
        perch.treeIndex,
        perch.treeT,
        perch.sideOffset
      )
    );
  }
}


// ============================================================
// 飞入计时
// ============================================================

function resetEnterTimer() {

  enterTimer =
    random(
      CFG.enterIntervalMin,
      CFG.enterIntervalMax
    );
}


function updateEntering(dt) {

  if (!CFG.enterEnabled) {
    return;
  }

  enterTimer -= dt;

  if (birds.length < CFG.minCount) {

    createEnteringBird();
    resetEnterTimer();

    return;
  }

  if (enterTimer <= 0) {

    if (birds.length < CFG.maxCount) {
      createEnteringBird();
    }

    resetEnterTimer();
  }
}


// ============================================================
// 创建飞入粒子
// ============================================================

function createEnteringBird() {

  if (birds.length >= CFG.maxCount) {
    return;
  }

  const perch =
    findTreePerch();

  if (!perch) {
    return;
  }

  let startX;

  if (random() < 0.5) {
    startX = -80;
  } else {
    startX = width + 80;
  }

  const startY =
    constrain(
      perch.y +
      random(-160,160),
      60,
      height - 60
    );

  const bird =
    new WoodpeckerParticle(
      nextBirdID++,
      perch.treeIndex,
      perch.treeT,
      perch.sideOffset
    );

  bird.x = startX;
  bird.y = startY;

  bird.previousX = startX;
  bird.previousY = startY;

  bird.beginEntry(
    perch.treeIndex,
    perch.treeT,
    perch.sideOffset
  );

  birds.push(bird);
}


// ============================================================
// 粒子类
// ============================================================

class WoodpeckerParticle {

  constructor(
    id,
    treeIndex,
    treeT,
    sideOffset
  ) {

    this.id = id;

    this.treeIndex =
      treeIndex;

    this.treeT =
      treeT;

    this.sideOffset =
      sideOffset;

    this.targetSideOffset =
      sideOffset;

    const position =
      getTreePosition(
        treeIndex,
        treeT,
        sideOffset
      );

    this.x =
      position.x;

    this.y =
      position.y;

    this.previousX =
      this.x;

    this.previousY =
      this.y;

    this.state =
      "climb";

    this.totalStay = 0;

    this.targetTreeIndex =
      treeIndex;

    this.targetTreeT =
      treeT;

    this.flightTargetSide =
      sideOffset;

    // ★ 当前飞行所在景深
    this.flightDepth =
      treeIndex;

    this.climbSpeed =
      random(
        CFG.climbSpeedMin,
        CFG.climbSpeedMax
      );

    this.stateTimer = 0;

    this.foragePhase =
      random(TWO_PI);

    this.flightStartX = 0;
    this.flightStartY = 0;

    this.flightTargetX = 0;
    this.flightTargetY = 0;

    this.flightAge = 0;
    this.flightDuration = 1;
    this.flightArc = 0;

    this.startSize =
      getTreeParticleSize(
        treeIndex
      );

    this.targetSize =
      this.startSize;

    this.currentSize =
      this.startSize;

    this.trailTravel = 0;

    this.removeMe = false;

    this.chooseNextClimb();
  }


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

    if (this.state === "climb") {

      this.updateClimb(dt);

    } else if (this.state === "forage") {

      this.updateForage(dt);

    } else if (this.state === "pause") {

      this.updatePause(dt);

    } else if (
      this.state === "flight" ||
      this.state === "enter" ||
      this.state === "exit"
    ) {

      this.updateFlight(dt);
    }

    this.makeTrail();
  }


  // ==========================================================
  // 下一段爬行
  // ==========================================================

  chooseNextClimb() {

    const trackLength =
      getTreeTrackLength(
        this.treeIndex
      );

    const travelDistance =
      random(
        CFG.climbDistanceMin,
        CFG.climbDistanceMax
      );

    const tAmount =
      travelDistance /
      max(trackLength, 1);

    const directionSign =
      random() < CFG.climbUpChance
      ? -1
      : 1;

    let candidateT =
      constrain(
        this.treeT +
        tAmount *
        directionSign,
        0.08,
        0.92
      );

    if (
      abs(
        candidateT -
        this.treeT
      ) < 0.015
    ) {

      candidateT =
        constrain(
          this.treeT -
          tAmount *
          directionSign,
          0.08,
          0.92
        );
    }

    const sideRange =
      getTreeSideRange(
        this.treeIndex
      );

    const sideChange =
      random(
        CFG.sideMoveMin,
        CFG.sideMoveMax
      ) *
      (
        random() < 0.5
        ? -1
        : 1
      );

    let candidateSide =
      constrain(
        this.sideOffset +
        sideChange,
        -sideRange,
        sideRange
      );

    let foundSafeTarget = false;

    for (
      let attemptIndex = 0;
      attemptIndex < 18;
      attemptIndex++
    ) {

      if (
        treePositionIsFree(
          this.treeIndex,
          candidateT,
          candidateSide,
          this,
          CFG.overlapLookAhead
        )
      ) {

        foundSafeTarget = true;
        break;
      }

      candidateT =
        constrain(
          this.treeT +
          random(-0.15,0.15),
          0.08,
          0.92
        );

      candidateSide =
        randomSideOffset(
          this.treeIndex
        );
    }

    if (!foundSafeTarget) {

      this.startShortPause();
      return;
    }

    this.targetTreeT =
      candidateT;

    this.targetSideOffset =
      candidateSide;

    this.climbSpeed =
      random(
        CFG.climbSpeedMin,
        CFG.climbSpeedMax
      );

    this.state =
      "climb";
  }


  // ==========================================================
  // 树干移动
  // ==========================================================

  updateClimb(dt) {

    const trackLength =
      getTreeTrackLength(
        this.treeIndex
      );

    const difference =
      this.targetTreeT -
      this.treeT;

    const directionSign =
      difference >= 0
      ? 1
      : -1;

    const tMovement =
      this.climbSpeed *
      dt /
      max(trackLength,1);

    const sideFactor =
      constrain(
        CFG.sideMoveSmooth *
        dt,
        0,
        1
      );

    const nextSide =
      lerp(
        this.sideOffset,
        this.targetSideOffset,
        sideFactor
      );

    let nextT;

    if (
      abs(difference) <=
      tMovement
    ) {

      nextT =
        this.targetTreeT;

    } else {

      nextT =
        this.treeT +
        tMovement *
        directionSign;
    }

    const nextPosition =
      getTreePosition(
        this.treeIndex,
        nextT,
        nextSide
      );

    const canMove =
      positionIsFree(
        nextPosition.x,
        nextPosition.y,
        this.currentSize,
        this,
        2
      );

    if (!canMove) {

      this.startShortPause();
      return;
    }

    this.treeT =
      nextT;

    this.sideOffset =
      nextSide;

    this.x =
      nextPosition.x;

    this.y =
      nextPosition.y;

    this.currentSize =
      getTreeParticleSize(
        this.treeIndex
      );

    if (
      abs(
        this.targetTreeT -
        this.treeT
      ) <= 0.0005
    ) {

      this.sideOffset =
        this.targetSideOffset;

      const finalPosition =
        getTreePosition(
          this.treeIndex,
          this.treeT,
          this.sideOffset
        );

      this.x =
        finalPosition.x;

      this.y =
        finalPosition.y;

      if (
        random() <
        CFG.forageAfterMoveChance
      ) {

        this.startForaging();

      } else {

        this.startShortPause();
      }
    }
  }


  // ==========================================================
  // 觅食
  // ==========================================================

  startForaging() {

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


  updateForage(dt) {

    this.stateTimer -= dt;

    this.foragePhase +=
      dt *
      CFG.foragePulseSpeed;

    if (this.stateTimer > 0) {
      return;
    }

    if (
      CFG.exitEnabled &&
      birds.length > CFG.minCount &&
      this.totalStay > CFG.exitMinStay &&
      random() < CFG.exitChance
    ) {

      this.startExit();
      return;
    }

    if (
      random() <
      CFG.changeTreeChance
    ) {

      if (this.startTreeFlight()) {
        return;
      }
    }

    this.chooseNextClimb();
  }


  // ==========================================================
  // 停顿
  // ==========================================================

  startShortPause() {

    this.state =
      "pause";

    this.stateTimer =
      random(
        CFG.shortPauseMin,
        CFG.shortPauseMax
      );
  }


  updatePause(dt) {

    this.stateTimer -= dt;

    if (this.stateTimer <= 0) {
      this.chooseNextClimb();
    }
  }


  // ==========================================================
  // 换树
  // ==========================================================

  startTreeFlight() {

    const targetTree =
      chooseWeightedTree(
        this.treeIndex,
        this
      );

    if (targetTree < 0) {
      return false;
    }

    const perch =
      findTreePerch(
        targetTree,
        this
      );

    if (!perch) {
      return false;
    }

    this.beginFlight(
      perch.treeIndex,
      perch.treeT,
      perch.sideOffset,
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
    treeIndex,
    treeT,
    sideOffset
  ) {

    // ★ 飞入使用目标树景深
    this.flightDepth =
      treeIndex;

    this.beginFlight(
      treeIndex,
      treeT,
      sideOffset,
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

    // ★ 飞出始终保持起飞树景深
    this.flightDepth =
      this.treeIndex;

    this.flightStartX =
      this.x;

    this.flightStartY =
      this.y;

    if (random() < 0.5) {

      this.flightTargetX =
        -80;

    } else {

      this.flightTargetX =
        width + 80;
    }

    this.flightTargetY =
      constrain(
        this.y +
        random(-180,120),
        40,
        height - 40
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
        0.5,
        2.8
      );

    this.flightAge = 0;

    this.flightArc =
      random(
        CFG.flightArcMin,
        CFG.flightArcMax
      );

    this.startSize =
      this.currentSize;

    this.targetSize =
      this.currentSize;

    this.state =
      "exit";
  }


  // ==========================================================
  // 建立换树飞行
  // ==========================================================

  beginFlight(
    treeIndex,
    treeT,
    sideOffset,
    newState,
    speedValue
  ) {

    const targetPosition =
      getTreePosition(
        treeIndex,
        treeT,
        sideOffset
      );

    this.targetTreeIndex =
      treeIndex;

    this.targetTreeT =
      treeT;

    this.flightTargetSide =
      sideOffset;

    // ★ 换树/飞入都使用目标树景深
    this.flightDepth =
      treeIndex;

    this.flightStartX =
      this.x;

    this.flightStartY =
      this.y;

    this.flightTargetX =
      targetPosition.x;

    this.flightTargetY =
      targetPosition.y;

    const travelLength =
      Math.hypot(
        this.flightTargetX -
        this.flightStartX,
        this.flightTargetY -
        this.flightStartY
      );

    this.flightDuration =
      constrain(
        travelLength /
        speedValue,
        0.38,
        2.6
      );

    this.flightAge = 0;

    this.flightArc =
      random(
        CFG.flightArcMin,
        CFG.flightArcMax
      );

    this.startSize =
      this.currentSize;

    this.targetSize =
      getTreeParticleSize(
        treeIndex
      );

    this.state =
      newState;
  }


  // ==========================================================
  // 飞行
  // ==========================================================

  updateFlight(dt) {

    this.flightAge += dt;

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
      ) -
      Math.sin(
        progressValue *
        PI
      ) *
      this.flightArc;

    // 景深大小渐变
    this.currentSize =
      lerp(
        this.startSize,
        this.targetSize,
        easedValue
      );

    if (progressValue < 1) {
      return;
    }

    if (this.state === "exit") {

      this.removeMe = true;
      return;
    }

    this.treeIndex =
      this.targetTreeIndex;

    this.treeT =
      this.targetTreeT;

    this.sideOffset =
      this.flightTargetSide;

    this.targetSideOffset =
      this.sideOffset;

    const finalPosition =
      getTreePosition(
        this.treeIndex,
        this.treeT,
        this.sideOffset
      );

    this.x =
      finalPosition.x;

    this.y =
      finalPosition.y;

    this.currentSize =
      getTreeParticleSize(
        this.treeIndex
      );

    this.totalStay = 0;

    this.startForaging();
  }


  // ==========================================================
  // ★ 拖尾
  // 每个拖尾点保存自己的景深
  // ==========================================================

  makeTrail() {

    if (
      !CFG.trailEnabled ||
      !birdIsFlying(this)
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
        CFG.trailLife,

      // ★ 关键
      depth:
        this.flightDepth
    });
  }


  // ==========================================================
  // 绘制粒子
  // ==========================================================

  render() {

    let drawX =
      this.x;

    let drawY =
      this.y;

    if (
      this.state ===
      "forage"
    ) {

      const direction =
        getTreeDirection(
          this.treeIndex,
          this.treeT
        );

      const normalX =
        -direction.y;

      const normalY =
        direction.x;

      const pulse =
        sin(
          this.foragePhase
        ) *
        CFG.foragePulseAmount;

      drawX +=
        normalX *
        pulse;

      drawY +=
        normalY *
        pulse;
    }

    const bodyColor =
      color(
        CFG.fillColor
      );

    bodyColor.setAlpha(
      CFG.fillOpacity
    );

    fill(bodyColor);

    const edgeColor =
      color(
        CFG.strokeColor
      );

    stroke(edgeColor);

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
// 更新拖尾
// ============================================================

function updateTrails(dt) {

  for (const trailItem of trails) {
    trailItem.age += dt;
  }

  trails =
    trails.filter(
      trailItem =>
        trailItem.age <
        trailItem.life
    );
}


// ============================================================
// 遮挡轮廓调试
// ============================================================

function drawMaskDebug() {

  push();

  noFill();

  const maskColors = [
    [80,180,255],
    [80,255,150],
    [255,80,80]
  ];

  for (
    let treeIndex = 0;
    treeIndex < TREE_MASKS.length;
    treeIndex++
  ) {

    const maskColor =
      maskColors[treeIndex];

    stroke(
      maskColor[0],
      maskColor[1],
      maskColor[2]
    );

    strokeWeight(4);

    beginShape();

    for (
      const pair of
      TREE_MASKS[treeIndex]
    ) {

      vertex(
        pair[0] / 100 * width,
        pair[1] / 100 * height
      );
    }

    endShape(CLOSE);
  }

  pop();
}


// ============================================================
// 树干运动范围调试
// ============================================================

function drawTreeDebug() {

  push();

  const debugColors = [
    [80,180,255],
    [80,255,150],
    [255,80,80]
  ];

  for (
    let treeIndex = 0;
    treeIndex < treeTracks.length;
    treeIndex++
  ) {

    const debugColor =
      debugColors[treeIndex];

    noFill();

    stroke(
      debugColor[0],
      debugColor[1],
      debugColor[2],
      230
    );

    strokeWeight(4);

    beginShape();

    for (
      const treePoint of
      treeTracks[treeIndex].points
    ) {

      vertex(
        treePoint.x,
        treePoint.y
      );
    }

    endShape();

    strokeWeight(2);

    for (
      const sideValue of [-1,1]
    ) {

      beginShape();

      for (
        let sampleIndex = 0;
        sampleIndex <= 40;
        sampleIndex++
      ) {

        const treeT =
          sampleIndex / 40;

        const position =
          getTreePosition(
            treeIndex,
            treeT,
            sideValue *
            getTreeSideRange(
              treeIndex
            )
          );

        vertex(
          position.x,
          position.y
        );
      }

      endShape();
    }
  }

  pop();
}