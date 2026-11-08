
/*
 * 飞鸟集 · 金翅雀
 * p5.js 2.3.4
 *
 * 根据金翅雀树木背景标定枝条。
 *
 * 运动规则：
 * 1. 停栖点位于预设树枝线上
 * 2. 枝上跳跃沿同一段树枝移动
 * 3. 同群鸟起飞时间相近，但轨迹独立
 * 4. 枝间飞行以树枝为终点
 * 5. 离屏鸟返回时必须降落
 * 6. 返回后必须停栖一段时间
 * 7. 初次群飞约在2秒后发生
 *
 * 无控制面板、无文字、无加载画面。
 */

// ====================================================
// 一、全部可调参数
// ====================================================

const FINCH_CFG = {

  // ---------- 背景 ----------
  imageName: "background.jpg",
  imageWidth: 1920,
  imageHeight: 1080,

  // ---------- 粒子数量 ----------
  count: 15,
  minCount: 10,
  maxCount: 25,

  // ---------- 粒子外观 ----------
  diameter: 20,
  fillColor: "#ffca42",
  outlineColor: "#64432B",
  outlineWidth: 1.6,

  // ---------- 首次活动 ----------
  firstFlightDelay: 2000,
  firstHopMinDelay: 500,
  firstHopMaxDelay: 1600,

  // ---------- 枝上跳跃 ----------
  hopChance: 0.78,
  hopWaitMin: 1600,
  hopWaitMax: 4200,
  hopDurationMin: 400,
  hopDurationMax: 800,
  hopDistanceMin: 10,
  hopDistanceMax: 34,
  hopHeight: 7,
  maxSimultaneousHops: 4,

  // ---------- 停栖 ----------
  normalPerchMin: 3500,
  normalPerchMax: 7000,
  afterEntryPerchMin: 7000,
  afterEntryPerchMax: 11000,

  // ---------- 群体规模 ----------
  groupMin: 4,
  groupMax: 8,
  clickGroupMin: 5,
  clickGroupMax: 9,

  // ---------- 群体事件 ----------
  eventIntervalMin: 6500,
  eventIntervalMax: 10500,
  localFlightProbability: 0.68,

  // ---------- 同批起飞间隔 ----------
  takeoffIntervalMin: 120,
  takeoffIntervalMax: 300,

  // ---------- 枝间飞行 ----------
  localFlightMin: 2600,
  localFlightMax: 4900,
  localFlightArcMin: 55,
  localFlightArcMax: 180,

  // ---------- 飞行轨迹差异 ----------
  horizontalCurveVariation: 95,
  takeoffLiftMin: 35,
  takeoffLiftMax: 85,
  curveVariation: 0.32,

  // ---------- 离屏 ----------
  exitDurationMin: 2400,
  exitDurationMax: 4400,
  exitArcMin: 50,
  exitArcMax: 160,

  // ---------- 离屏等待 ----------
  outsideWaitMin: 2500,
  outsideWaitMax: 4300,

  // ---------- 返回 ----------
  entryDurationMin: 2800,
  entryDurationMax: 5000,
  entryArcMin: 50,
  entryArcMax: 170,
  entryIntervalMin: 140,
  entryIntervalMax: 300,
  entryCheckInterval: 500,

  // ---------- 树枝定位 ----------
  referenceWidth: 1649,
  referenceHeight: 928,

  // 停栖位置避开枝条两端的比例
  perchMargin: 0.13,

  // 不同鸟之间的最小停栖间距
  perchSeparation: 29
};

// ====================================================
// 二、根据照片标定的枝条
// ====================================================

/*
 * 每组坐标表示照片中的一段树枝：
 *
 * [起点x, 起点y, 终点x, 终点y]
 *
 * 坐标以参考图1649×928为基准，
 * 程序自动换算为1920×1080。
 *
 * 每只鸟停在枝条上的某个位置，
 * 跳跃只能沿该段枝条发生。
 */

const FINCH_BRANCH_LINES = [

  // 左侧树冠：向上伸出的枝条
  [145, 616, 181, 376],
  [127, 618, 75, 507],
  [157, 626, 257, 675],
  [223, 676, 348, 579],
  [307, 611, 392, 448],
  [359, 568, 469, 374],
  [282, 708, 389, 835],
  [345, 747, 453, 832],

  // 中左：较细的独立树枝
  [642, 676, 643, 540],
  [645, 539, 682, 415],
  [650, 674, 745, 591],
  [635, 720, 603, 634],

  // 中央树冠：左上方分枝
  [821, 440, 774, 316],
  [773, 317, 678, 188],
  [777, 319, 825, 243],
  [872, 545, 820, 452],
  [907, 638, 854, 496],

  // 中央主干向上的分枝
  [962, 626, 950, 392],
  [950, 392, 967, 151],
  [961, 391, 1065, 249],
  [1065, 249, 1108, 159],
  [976, 557, 1066, 449],

  // 中央树冠中下部
  [1001, 751, 1064, 661],
  [1064, 661, 1098, 347],
  [1005, 846, 1132, 730],

  // 右侧树冠
  [1198, 724, 1262, 398],
  [1263, 398, 1303, 351],
  [1217, 774, 1331, 565],
  [1331, 565, 1411, 254],
  [1411, 254, 1408, 220],
  [1340, 561, 1450, 513],
  [1391, 481, 1556, 197],

  // 最右侧裸枝
  [1593, 686, 1562, 560],
  [1593, 686, 1633, 398]
];

// ====================================================
// 三、全局状态
// ====================================================

let finchBackground = null;
let finchImageReady = false;

let finchBirdList = [];
let finchPerchSites = [];

let finchViewScale = 1;
let finchViewOffsetX = 0;
let finchViewOffsetY = 0;

let finchNextGroupEvent = 0;
let finchNextReturnCheck = 0;
let finchGroupSerial = 0;

// ====================================================
// 四、初始化
// ====================================================

function setup() {
  pixelDensity(1);
  frameRate(60);

  const finchCanvas = createCanvas(
    max(1, windowWidth),
    max(1, windowHeight)
  );

  finchCanvas.style("display", "block");
  finchCanvas.style("margin", "0");
  finchCanvas.style("padding", "0");

  document.documentElement.style.margin = "0";
  document.documentElement.style.padding = "0";
  document.documentElement.style.overflow = "hidden";

  document.body.style.margin = "0";
  document.body.style.padding = "0";
  document.body.style.overflow = "hidden";

  loadImage(
    FINCH_CFG.imageName,
    function (loadedImage) {
      finchBackground = loadedImage;
      finchImageReady = true;
      finchInitializeSimulation();
    },
    function (loadError) {
      console.error(
        "金翅雀背景加载失败，请检查文件名：",
        FINCH_CFG.imageName,
        loadError
      );
    }
  );
}

function windowResized() {
  resizeCanvas(
    max(1, windowWidth),
    max(1, windowHeight)
  );
}

function finchUpdateView() {
  finchViewScale = min(
    width / FINCH_CFG.imageWidth,
    height / FINCH_CFG.imageHeight
  );

  finchViewOffsetX =
    (
      width -
      FINCH_CFG.imageWidth * finchViewScale
    ) / 2;

  finchViewOffsetY =
    (
      height -
      FINCH_CFG.imageHeight * finchViewScale
    ) / 2;
}

function draw() {
  clear();

  if (!finchImageReady || !finchBackground) {
    return;
  }

  finchUpdateView();

  push();

  translate(
    finchViewOffsetX,
    finchViewOffsetY
  );

  scale(finchViewScale);

  image(
    finchBackground,
    0,
    0,
    FINCH_CFG.imageWidth,
    FINCH_CFG.imageHeight
  );

  finchUpdateGroupEvents();

  for (const finchBird of finchBirdList) {
    finchUpdateOneBird(finchBird);
  }

  for (const finchBird of finchBirdList) {
    finchDrawOneBird(finchBird);
  }

  pop();
}

// ====================================================
// 五、数学工具
// ====================================================

function finchSmooth(t) {
  const finchValue = constrain(t, 0, 1);

  return (
    finchValue *
    finchValue *
    (3 - 2 * finchValue)
  );
}

function finchBezierValue(a, b, c, d, t) {
  const finchInverse = 1 - t;

  return (
    finchInverse * finchInverse *
      finchInverse * a +

    3 * finchInverse * finchInverse *
      t * b +

    3 * finchInverse * t * t * c +

    t * t * t * d
  );
}

function finchRandomInteger(minimum, maximum) {
  return floor(
    random(minimum, maximum + 1)
  );
}

function finchReferenceX(value) {
  return (
    value *
    FINCH_CFG.imageWidth /
    FINCH_CFG.referenceWidth
  );
}

function finchReferenceY(value) {
  return (
    value *
    FINCH_CFG.imageHeight /
    FINCH_CFG.referenceHeight
  );
}

// ====================================================
// 六、建立枝条路径
// ====================================================

function finchBuildPerchSites() {
  finchPerchSites = [];

  for (
    let i = 0;
    i < FINCH_BRANCH_LINES.length;
    i++
  ) {
    const finchLine = FINCH_BRANCH_LINES[i];

    finchPerchSites.push({
      id: i,

      x1: finchReferenceX(finchLine[0]),
      y1: finchReferenceY(finchLine[1]),

      x2: finchReferenceX(finchLine[2]),
      y2: finchReferenceY(finchLine[3])
    });
  }
}

function finchPointOnBranch(siteIndex, positionT) {
  const finchSite = finchPerchSites[siteIndex];

  const finchT = constrain(
    positionT,
    FINCH_CFG.perchMargin,
    1 - FINCH_CFG.perchMargin
  );

  return {
    x: lerp(finchSite.x1, finchSite.x2, finchT),
    y: lerp(finchSite.y1, finchSite.y2, finchT)
  };
}

function finchBranchLength(siteIndex) {
  const finchSite = finchPerchSites[siteIndex];

  return dist(
    finchSite.x1,
    finchSite.y1,
    finchSite.x2,
    finchSite.y2
  );
}

// ====================================================
// 七、初始化粒子
// ====================================================

function finchInitializeSimulation() {
  finchBuildPerchSites();

  finchBirdList = [];

  const finchTotal = constrain(
    floor(FINCH_CFG.count),
    FINCH_CFG.minCount,
    FINCH_CFG.maxCount
  );

  const finchIndices = shuffle(
    finchPerchSites.map(
      (finchSite, finchIndex) => finchIndex
    )
  );

  const finchNow = millis();

  for (let i = 0; i < finchTotal; i++) {
    const finchSiteIndex =
      finchIndices[i % finchIndices.length];

    const finchT = random(0.3, 0.7);

    const finchPoint = finchPointOnBranch(
      finchSiteIndex,
      finchT
    );

    const finchBird = {
      id: i,

      x: finchPoint.x,
      y: finchPoint.y,

      state: "perched",

      site: finchSiteIndex,
      siteT: finchT,

      targetSite: finchSiteIndex,
      targetT: finchT,

      fromX: finchPoint.x,
      fromY: finchPoint.y,

      toX: finchPoint.x,
      toY: finchPoint.y,

      control1X: finchPoint.x,
      control1Y: finchPoint.y,

      control2X: finchPoint.x,
      control2Y: finchPoint.y,

      startAt: finchNow,
      duration: 0,

      nextHopAt: finchNow + random(
        FINCH_CFG.firstHopMinDelay,
        FINCH_CFG.firstHopMaxDelay
      ),

      canFlyAt: finchNow,

      scheduledAt: -1,
      pendingAction: "none",

      groupId: -1,
      returnAt: 0,

      exitSide: 1,
      enteredRecently: false,

      hopFromT: finchT,
      hopToT: finchT,

      personalArc: random(0.65, 1.4)
    };

    finchBirdList.push(finchBird);
  }

  finchNextGroupEvent =
    finchNow + FINCH_CFG.firstFlightDelay;

  finchNextReturnCheck =
    finchNow + FINCH_CFG.entryCheckInterval;
}

// ====================================================
// 八、枝条占用管理
// ====================================================

function finchIsSiteReserved(
  siteIndex,
  ignoredBirds = []
) {
  for (const finchBird of finchBirdList) {
    if (ignoredBirds.includes(finchBird)) {
      continue;
    }

    if (
      finchBird.state === "perched" ||
      finchBird.state === "hopping" ||
      finchBird.state === "scheduled"
    ) {
      if (finchBird.site === siteIndex) {
        return true;
      }
    }

    if (
      finchBird.state === "localFlight" ||
      finchBird.state === "entering" ||
      finchBird.state === "entryScheduled"
    ) {
      if (finchBird.targetSite === siteIndex) {
        return true;
      }
    }
  }

  return false;
}

function finchChooseFreeSite(
  ignoredBirds = [],
  additionallyReserved = new Set()
) {
  const finchCandidates = [];

  for (
    let i = 0;
    i < finchPerchSites.length;
    i++
  ) {
    if (additionallyReserved.has(i)) {
      continue;
    }

    if (finchIsSiteReserved(i, ignoredBirds)) {
      continue;
    }

    finchCandidates.push(i);
  }

  if (finchCandidates.length === 0) {
    return -1;
  }

  return random(finchCandidates);
}

// ====================================================
// 九、枝上短距离跳跃
// ====================================================

function finchCountActiveHops() {
  let finchAmount = 0;

  for (const finchBird of finchBirdList) {
    if (finchBird.state === "hopping") {
      finchAmount++;
    }
  }

  return finchAmount;
}

function finchScheduleNextHop(finchBird) {
  finchBird.nextHopAt = millis() + random(
    FINCH_CFG.hopWaitMin,
    FINCH_CFG.hopWaitMax
  );
}

function finchStartBranchHop(finchBird) {
  if (
    finchCountActiveHops() >=
    FINCH_CFG.maxSimultaneousHops
  ) {
    finchScheduleNextHop(finchBird);
    return;
  }

  const finchLength = finchBranchLength(
    finchBird.site
  );

  if (finchLength < 20) {
    finchScheduleNextHop(finchBird);
    return;
  }

  const finchStep = random(
    FINCH_CFG.hopDistanceMin,
    FINCH_CFG.hopDistanceMax
  );

  const finchDirection = random([-1, 1]);

  const finchDeltaT =
    finchDirection * finchStep / finchLength;

  const finchNewT = constrain(
    finchBird.siteT + finchDeltaT,
    FINCH_CFG.perchMargin,
    1 - FINCH_CFG.perchMargin
  );

  let finchFinalT = finchNewT;

  if (
    abs(finchFinalT - finchBird.siteT) < 0.04
  ) {
    finchFinalT = constrain(
      finchBird.siteT - finchDeltaT,
      FINCH_CFG.perchMargin,
      1 - FINCH_CFG.perchMargin
    );
  }

  if (
    abs(finchFinalT - finchBird.siteT) < 0.025
  ) {
    finchScheduleNextHop(finchBird);
    return;
  }

  finchBird.hopFromT = finchBird.siteT;
  finchBird.hopToT = finchFinalT;

  finchBird.startAt = millis();

  finchBird.duration = random(
    FINCH_CFG.hopDurationMin,
    FINCH_CFG.hopDurationMax
  );

  finchBird.state = "hopping";
}

function finchUpdateBranchHop(finchBird) {
  const finchT = constrain(
    (millis() - finchBird.startAt) /
      finchBird.duration,
    0,
    1
  );

  const finchEased = finchSmooth(finchT);

  const finchBranchT = lerp(
    finchBird.hopFromT,
    finchBird.hopToT,
    finchEased
  );

  const finchPoint = finchPointOnBranch(
    finchBird.site,
    finchBranchT
  );

  finchBird.x = finchPoint.x;

  finchBird.y =
    finchPoint.y -
    sin(PI * finchT) * FINCH_CFG.hopHeight;

  if (finchT >= 1) {
    finchBird.siteT = finchBird.hopToT;

    const finchEndPoint = finchPointOnBranch(
      finchBird.site,
      finchBird.siteT
    );

    finchBird.x = finchEndPoint.x;
    finchBird.y = finchEndPoint.y;

    finchBird.state = "perched";

    finchScheduleNextHop(finchBird);
  }
}

function finchUpdatePerched(finchBird) {
  const finchPoint = finchPointOnBranch(
    finchBird.site,
    finchBird.siteT
  );

  finchBird.x = finchPoint.x;
  finchBird.y = finchPoint.y;

  if (millis() < finchBird.nextHopAt) {
    return;
  }

  if (random() < FINCH_CFG.hopChance) {
    finchStartBranchHop(finchBird);
  } else {
    finchScheduleNextHop(finchBird);
  }
}

// ====================================================
// 十、完成降落
// ====================================================

function finchFinishLanding(finchBird) {
  finchBird.site = finchBird.targetSite;
  finchBird.siteT = finchBird.targetT;

  const finchPoint = finchPointOnBranch(
    finchBird.site,
    finchBird.siteT
  );

  finchBird.x = finchPoint.x;
  finchBird.y = finchPoint.y;

  finchBird.state = "perched";

  finchBird.pendingAction = "none";
  finchBird.scheduledAt = -1;
  finchBird.groupId = -1;

  finchScheduleNextHop(finchBird);

  if (finchBird.enteredRecently) {
    finchBird.canFlyAt = millis() + random(
      FINCH_CFG.afterEntryPerchMin,
      FINCH_CFG.afterEntryPerchMax
    );
  } else {
    finchBird.canFlyAt = millis() + random(
      FINCH_CFG.normalPerchMin,
      FINCH_CFG.normalPerchMax
    );
  }

  finchBird.enteredRecently = false;
}

// ====================================================
// 十一、独立飞行轨迹
// ====================================================

function finchSetFlightCurve(
  finchBird,
  destinationX,
  destinationY,
  durationMs,
  flightMode
) {
  const finchStartX = finchBird.x;
  const finchStartY = finchBird.y;

  const finchDeltaX =
    destinationX - finchStartX;

  const finchDeltaY =
    destinationY - finchStartY;

  const finchFlightLength = sqrt(
    finchDeltaX * finchDeltaX +
    finchDeltaY * finchDeltaY
  );

  const finchNormalX =
    finchFlightLength > 0.01
      ? -finchDeltaY / finchFlightLength
      : 0;

  let finchArcHeight = 100;

  if (flightMode === "local") {
    finchArcHeight = random(
      FINCH_CFG.localFlightArcMin,
      FINCH_CFG.localFlightArcMax
    );
  } else if (flightMode === "exit") {
    finchArcHeight = random(
      FINCH_CFG.exitArcMin,
      FINCH_CFG.exitArcMax
    );
  } else {
    finchArcHeight = random(
      FINCH_CFG.entryArcMin,
      FINCH_CFG.entryArcMax
    );
  }

  finchArcHeight *= finchBird.personalArc;

  const finchSideShift = random(
    -FINCH_CFG.horizontalCurveVariation,
    FINCH_CFG.horizontalCurveVariation
  );

  const finchLift = random(
    FINCH_CFG.takeoffLiftMin,
    FINCH_CFG.takeoffLiftMax
  );

  finchBird.fromX = finchStartX;
  finchBird.fromY = finchStartY;

  finchBird.toX = destinationX;
  finchBird.toY = destinationY;

  finchBird.control1X =
    finchStartX +
    finchDeltaX * random(0.16, 0.39) +
    finchNormalX * finchSideShift;

  finchBird.control1Y =
    finchStartY +
    finchDeltaY * random(0.08, 0.25) -
    finchArcHeight -
    finchLift;

  finchBird.control2X =
    finchStartX +
    finchDeltaX * random(0.58, 0.86) +
    finchNormalX * random(
      -FINCH_CFG.horizontalCurveVariation,
      FINCH_CFG.horizontalCurveVariation
    );

  finchBird.control2Y =
    finchStartY +
    finchDeltaY * random(0.68, 0.87) -
    finchArcHeight * random(0.2, 0.7);

  finchBird.startAt = millis();
  finchBird.duration = durationMs;
}

function finchUpdateFlightCurve(finchBird) {
  const finchT = constrain(
    (millis() - finchBird.startAt) /
      finchBird.duration,
    0,
    1
  );

  const finchEased = finchSmooth(finchT);

  finchBird.x = finchBezierValue(
    finchBird.fromX,
    finchBird.control1X,
    finchBird.control2X,
    finchBird.toX,
    finchEased
  );

  finchBird.y = finchBezierValue(
    finchBird.fromY,
    finchBird.control1Y,
    finchBird.control2Y,
    finchBird.toY,
    finchEased
  );

  return finchT >= 1;
}

// ====================================================
// 十二、群体选择
// ====================================================

function finchAvailableBirds() {
  return shuffle(
    finchBirdList.filter(
      finchBird =>
        finchBird.state === "perched" &&
        millis() >= finchBird.canFlyAt
    )
  );
}

function finchPickGroup(
  candidates,
  minimum,
  maximum
) {
  if (candidates.length < 2) {
    return [];
  }

  const finchAmount = min(
    candidates.length,
    finchRandomInteger(minimum, maximum)
  );

  return candidates.slice(0, finchAmount);
}

function finchScheduleTakeoff(
  selectedBirds,
  actionType
) {
  if (selectedBirds.length < 2) {
    return;
  }

  const finchCurrentGroup = ++finchGroupSerial;

  let finchDelay = 0;

  for (const finchBird of selectedBirds) {
    finchBird.groupId = finchCurrentGroup;

    finchBird.pendingAction = actionType;

    finchBird.scheduledAt =
      millis() + finchDelay;

    finchBird.state = "scheduled";

    finchDelay += random(
      FINCH_CFG.takeoffIntervalMin,
      FINCH_CFG.takeoffIntervalMax
    );
  }
}

// ====================================================
// 十三、成群枝间飞行
// ====================================================

function finchScheduleLocalFlight(
  minimum = FINCH_CFG.groupMin,
  maximum = FINCH_CFG.groupMax
) {
  const finchCandidates =
    finchAvailableBirds();

  const finchSelected = finchPickGroup(
    finchCandidates,
    minimum,
    maximum
  );

  if (finchSelected.length < 2) {
    return;
  }

  const finchReserved = new Set();
  const finchAccepted = [];

  for (const finchBird of finchSelected) {
    const finchTargetSite = finchChooseFreeSite(
      finchSelected,
      finchReserved
    );

    if (finchTargetSite < 0) {
      continue;
    }

    finchReserved.add(finchTargetSite);

    finchBird.targetSite = finchTargetSite;

    finchBird.targetT = random(0.28, 0.72);

    finchAccepted.push(finchBird);
  }

  if (finchAccepted.length < 2) {
    return;
  }

  finchScheduleTakeoff(
    finchAccepted,
    "local"
  );
}

// ====================================================
// 十四、成群飞离
// ====================================================

function finchScheduleExitFlight() {
  const finchCandidates =
    finchAvailableBirds();

  const finchSelected = finchPickGroup(
    finchCandidates,
    FINCH_CFG.groupMin,
    FINCH_CFG.groupMax
  );

  finchScheduleTakeoff(
    finchSelected,
    "exit"
  );
}

// ====================================================
// 十五、开始飞行
// ====================================================

function finchBeginTakeoff(finchBird) {
  finchBird.scheduledAt = -1;

  if (finchBird.pendingAction === "local") {
    const finchTargetPoint = finchPointOnBranch(
      finchBird.targetSite,
      finchBird.targetT
    );

    const finchGap = dist(
      finchBird.x,
      finchBird.y,
      finchTargetPoint.x,
      finchTargetPoint.y
    );

    const finchDuration = constrain(
      finchGap * 2.4 + random(1000, 1700),
      FINCH_CFG.localFlightMin,
      FINCH_CFG.localFlightMax
    );

    finchSetFlightCurve(
      finchBird,
      finchTargetPoint.x,
      finchTargetPoint.y,
      finchDuration,
      "local"
    );

    finchBird.state = "localFlight";
    return;
  }

  if (finchBird.pendingAction === "exit") {
    finchStartExitFlight(finchBird);
  }
}

function finchUpdateLocalFlight(finchBird) {
  if (finchUpdateFlightCurve(finchBird)) {
    finchFinishLanding(finchBird);
  }
}

// ====================================================
// 十六、飞离画面
// ====================================================

function finchStartExitFlight(finchBird) {
  const finchNearestSide =
    finchBird.x < FINCH_CFG.imageWidth / 2
      ? -1
      : 1;

  const finchSide =
    random() < 0.75
      ? finchNearestSide
      : -finchNearestSide;

  finchBird.exitSide = finchSide;

  const finchDestinationX =
    finchSide < 0
      ? -80
      : FINCH_CFG.imageWidth + 80;

  const finchDestinationY = constrain(
    finchBird.y + random(-190, 90),
    65,
    830
  );

  const finchGap = abs(
    finchDestinationX - finchBird.x
  );

  const finchDuration = constrain(
    finchGap * 2.4 + random(650, 1200),
    FINCH_CFG.exitDurationMin,
    FINCH_CFG.exitDurationMax
  );

  finchSetFlightCurve(
    finchBird,
    finchDestinationX,
    finchDestinationY,
    finchDuration,
    "exit"
  );

  finchBird.state = "exiting";
}

function finchUpdateExitFlight(finchBird) {
  if (!finchUpdateFlightCurve(finchBird)) {
    return;
  }

  finchBird.state = "waiting";

  finchBird.site = -1;
  finchBird.targetSite = -1;

  finchBird.returnAt = millis() + random(
    FINCH_CFG.outsideWaitMin,
    FINCH_CFG.outsideWaitMax
  );

  finchBird.enteredRecently = true;
}

// ====================================================
// 十七、成群返回
// ====================================================

function finchScheduleReturningBirds() {
  const finchNow = millis();

  const finchWaiting = shuffle(
    finchBirdList.filter(
      finchBird =>
        finchBird.state === "waiting" &&
        finchBird.returnAt <= finchNow
    )
  );

  if (finchWaiting.length === 0) {
    return;
  }

  const finchAssignments = [];
  const finchReserved = new Set();

  for (const finchBird of finchWaiting) {
    if (
      finchAssignments.length >=
      FINCH_CFG.groupMax
    ) {
      break;
    }

    const finchTargetSite = finchChooseFreeSite(
      [],
      finchReserved
    );

    if (finchTargetSite < 0) {
      break;
    }

    finchReserved.add(finchTargetSite);

    finchAssignments.push({
      bird: finchBird,
      site: finchTargetSite,
      t: random(0.28, 0.72)
    });
  }

  if (finchAssignments.length === 0) {
    return;
  }

  const finchGroupId = ++finchGroupSerial;

  let finchDelay = 0;

  for (const finchAssignment of finchAssignments) {
    const finchBird = finchAssignment.bird;

    finchBird.groupId = finchGroupId;

    finchBird.targetSite =
      finchAssignment.site;

    finchBird.targetT =
      finchAssignment.t;

    finchBird.state = "entryScheduled";

    finchBird.scheduledAt =
      finchNow + finchDelay;

    finchDelay += random(
      FINCH_CFG.entryIntervalMin,
      FINCH_CFG.entryIntervalMax
    );
  }
}

// ====================================================
// 十八、飞入并强制降落
// ====================================================

function finchBeginEntry(finchBird) {
  const finchTargetPoint = finchPointOnBranch(
    finchBird.targetSite,
    finchBird.targetT
  );

  const finchPreferredSide =
    finchTargetPoint.x <
    FINCH_CFG.imageWidth / 2
      ? -1
      : 1;

  const finchSide =
    random() < 0.85
      ? finchPreferredSide
      : -finchPreferredSide;

  finchBird.x =
    finchSide < 0
      ? -70
      : FINCH_CFG.imageWidth + 70;

  finchBird.y = constrain(
    finchTargetPoint.y + random(-230, -60),
    65,
    780
  );

  const finchGap = dist(
    finchBird.x,
    finchBird.y,
    finchTargetPoint.x,
    finchTargetPoint.y
  );

  const finchDuration = constrain(
    finchGap * 2.5 + random(700, 1300),
    FINCH_CFG.entryDurationMin,
    FINCH_CFG.entryDurationMax
  );

  finchSetFlightCurve(
    finchBird,
    finchTargetPoint.x,
    finchTargetPoint.y,
    finchDuration,
    "entry"
  );

  finchBird.state = "entering";
}

function finchUpdateEntryFlight(finchBird) {
  if (finchUpdateFlightCurve(finchBird)) {
    finchFinishLanding(finchBird);
  }
}

// ====================================================
// 十九、群体事件调度
// ====================================================

function finchUpdateGroupEvents() {
  const finchNow = millis();

  if (finchNow >= finchNextGroupEvent) {
    if (
      random() <
      FINCH_CFG.localFlightProbability
    ) {
      finchScheduleLocalFlight();
    } else {
      finchScheduleExitFlight();
    }

    finchNextGroupEvent = finchNow + random(
      FINCH_CFG.eventIntervalMin,
      FINCH_CFG.eventIntervalMax
    );
  }

  if (finchNow >= finchNextReturnCheck) {
    finchScheduleReturningBirds();

    finchNextReturnCheck =
      finchNow + FINCH_CFG.entryCheckInterval;
  }
}

// ====================================================
// 二十、状态更新
// ====================================================

function finchUpdateOneBird(finchBird) {
  switch (finchBird.state) {

    case "perched":
      finchUpdatePerched(finchBird);
      break;

    case "hopping":
      finchUpdateBranchHop(finchBird);
      break;

    case "scheduled":
      if (
        millis() >= finchBird.scheduledAt
      ) {
        finchBeginTakeoff(finchBird);
      }
      break;

    case "localFlight":
      finchUpdateLocalFlight(finchBird);
      break;

    case "exiting":
      finchUpdateExitFlight(finchBird);
      break;

    case "waiting":
      break;

    case "entryScheduled":
      if (
        millis() >= finchBird.scheduledAt
      ) {
        finchBeginEntry(finchBird);
      }
      break;

    case "entering":
      finchUpdateEntryFlight(finchBird);
      break;
  }
}

// ====================================================
// 二十一、绘制粒子
// ====================================================

function finchDrawOneBird(finchBird) {
  if (
    finchBird.state === "waiting" ||
    finchBird.state === "entryScheduled"
  ) {
    return;
  }

  push();

  translate(
    finchBird.x,
    finchBird.y
  );

  stroke(FINCH_CFG.outlineColor);
  strokeWeight(FINCH_CFG.outlineWidth);

  fill(FINCH_CFG.fillColor);

  circle(
    0,
    0,
    FINCH_CFG.diameter
  );

  pop();
}

// ====================================================
// 二十二、点击触发群体起飞
// ====================================================

function mousePressed() {
  if (!finchImageReady) {
    return;
  }

  if (
    mouseX < 0 ||
    mouseX > width ||
    mouseY < 0 ||
    mouseY > height
  ) {
    return;
  }

  finchScheduleLocalFlight(
    FINCH_CFG.clickGroupMin,
    FINCH_CFG.clickGroupMax
  );
}

function touchStarted() {
  if (!finchImageReady) {
    return;
  }

  mousePressed();
  return false;
}
