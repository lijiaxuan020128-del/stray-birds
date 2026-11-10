// 普通鵟 · 圆粒子
// p5.js 2.3.4
// 背景：普通鵟16：9.png

const BZ_CONFIG = {
  backgroundFile: "普通鵟16：9.png",
  designWidth: 1920,
  designHeight: 1080,

  perchDiameter: 60,
  groundDiameter: 26,
  skyDiameter: 35,

  fillColor: "#896343",
  strokeColor: "#493326",
  strokeWidth: 5,

  stumpX: 525,
  stumpY: 365,

  groundZones: [
    { minX: 1135, maxX: 1510, minY: 680, maxY: 720 },
    { minX: 1200, maxX: 1540, minY: 725, maxY: 770 },
    { minX: 1135, maxX: 1490, minY: 775, maxY: 820 }
  ],

  groundFarY: 680,
  groundNearY: 820,
  groundFarDiameter: 22,
  groundNearDiameter: 32,
  minLandingSeparation: 170,

  // 先到达树桩右上方，再向草地俯冲。
  // 所有坐标均对应1920×1080背景。
  launchClearX: 800,
  launchClearY: 265,
  launchClearJitterX: 45,
  launchClearJitterY: 18,

  entrySeconds: 3.2,
  diveSeconds: 1.5,
  returnSeconds: 2.3,
  departureSeconds: 2.8,

  perchMinSeconds: 3,
  perchMaxSeconds: 4.8,
  groundMinSeconds: 2.5,
  groundMaxSeconds: 3.8,
  outsideMinSeconds: 1.5,
  outsideMaxSeconds: 2.8,
  returnProbability: 0.8,

  perchLookX: 24,
  perchLookUp: 15,
  perchLookDown: 8,
  perchBreathY: 2,

  perchMoveMinSeconds: 0.38,
  perchMoveMaxSeconds: 0.65,
  perchHoldMinSeconds: 0.18,
  perchHoldMaxSeconds: 0.42
};

let bzBackground = null;
let bzCanvas = null;
let bzReady = false;
let bzClock = 0;
let bzState = "loading";
let bzDeadline = 0;
let bzFlight = null;

let bzPose = {
  x: 0,
  y: 0,
  diameter: BZ_CONFIG.perchDiameter
};

let bzPerchMotion = null;
let bzPerchStartTime = 0;
let bzLookDirection = 1;
let bzLookStep = 0;
let bzLastLanding = null;
let bzLastGroundZone = -1;
let bzLastDiveStyle = -1;

function setup() {
  pixelDensity(1);
  frameRate(60);

  Object.assign(document.documentElement.style, {
    margin: "0",
    padding: "0",
    width: "100%",
    height: "100%",
    overflow: "hidden"
  });

  Object.assign(document.body.style, {
    margin: "0",
    padding: "0",
    width: "100%",
    height: "100%",
    overflow: "hidden",
    background: "transparent",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  });

  const bzSize = bzGetCanvasSize();
  bzCanvas = createCanvas(bzSize.w, bzSize.h);
  bzCanvas.style("display", "block");
  bzCanvas.style("visibility", "hidden");

  noLoop();

  loadImage(
    BZ_CONFIG.backgroundFile,
    function (bzLoadedImage) {
      bzBackground = bzLoadedImage;
      bzClock = 0;
      bzReady = true;
      bzStartPerch();
      bzCanvas.style("visibility", "visible");
      loop();
    },
    function (bzError) {
      bzReady = false;
      noLoop();
      console.error(
        "背景加载失败：" + BZ_CONFIG.backgroundFile,
        bzError
      );
    }
  );
}

function bzGetCanvasSize() {
  const bzFit = Math.min(
    Math.max(1, window.innerWidth) / BZ_CONFIG.designWidth,
    Math.max(1, window.innerHeight) / BZ_CONFIG.designHeight
  );

  return {
    w: BZ_CONFIG.designWidth * bzFit,
    h: BZ_CONFIG.designHeight * bzFit
  };
}

function windowResized() {
  const bzSize = bzGetCanvasSize();
  resizeCanvas(bzSize.w, bzSize.h);
}

function bzCopyPose(bzSource) {
  return {
    x: bzSource.x,
    y: bzSource.y,
    diameter: bzSource.diameter
  };
}

function bzGetPerchPose() {
  return {
    x: BZ_CONFIG.stumpX,
    y: BZ_CONFIG.stumpY
      - BZ_CONFIG.perchDiameter / 2
      - BZ_CONFIG.strokeWidth / 2,
    diameter: BZ_CONFIG.perchDiameter
  };
}

function bzClamp01(bzValue) {
  return Math.max(0, Math.min(1, bzValue));
}

function bzSmooth(bzValue) {
  const bzT = bzClamp01(bzValue);
  return bzT * bzT * bzT * (bzT * (bzT * 6 - 15) + 10);
}

function bzMix(bzStart, bzEnd, bzAmount) {
  return bzStart + (bzEnd - bzStart) * bzAmount;
}

function bzChooseDifferentIndex(bzCount, bzPrevious) {
  if (bzCount <= 1) return 0;

  if (bzPrevious < 0 || bzPrevious >= bzCount) {
    return Math.floor(random(bzCount));
  }

  return (
    bzPrevious + 1 + Math.floor(random(bzCount - 1))
  ) % bzCount;
}

function bzPlanPerchMotion(bzFromX, bzFromY) {
  let bzTargetX = 0;
  let bzTargetY = 0;
  const bzAction = bzLookStep % 4;

  if (bzAction === 0) {
    bzTargetX = bzLookDirection * random(
      BZ_CONFIG.perchLookX * 0.8,
      BZ_CONFIG.perchLookX
    );
    bzTargetY = -random(3, 7);
  } else if (bzAction === 1) {
    bzTargetX = bzLookDirection * random(5, 10);
    bzTargetY = -random(
      BZ_CONFIG.perchLookUp * 0.8,
      BZ_CONFIG.perchLookUp
    );
  } else if (bzAction === 2) {
    bzTargetX = -bzLookDirection * random(
      BZ_CONFIG.perchLookX * 0.7,
      BZ_CONFIG.perchLookX
    );
    bzTargetY = random(
      BZ_CONFIG.perchLookDown * 0.65,
      BZ_CONFIG.perchLookDown
    );
  } else {
    bzTargetX = random(-4, 4);
    bzTargetY = random(-2, 2);
    bzLookDirection *= -1;
  }

  bzLookStep += 1;

  const bzDuration = random(
    BZ_CONFIG.perchMoveMinSeconds,
    BZ_CONFIG.perchMoveMaxSeconds
  );

  bzPerchMotion = {
    fromX: bzFromX,
    fromY: bzFromY,
    toX: bzTargetX,
    toY: bzTargetY,
    startTime: bzClock,
    duration: bzDuration,
    endTime: bzClock + bzDuration + random(
      BZ_CONFIG.perchHoldMinSeconds,
      BZ_CONFIG.perchHoldMaxSeconds
    )
  };
}

function bzUpdatePerchMotion() {
  if (!bzPerchMotion) return;

  const bzAnchor = bzGetPerchPose();
  const bzAmount = bzSmooth(
    (bzClock - bzPerchMotion.startTime) / bzPerchMotion.duration
  );

  const bzElapsed = bzClock - bzPerchStartTime;
  const bzBreath = Math.sin(bzElapsed * 2.3)
    * BZ_CONFIG.perchBreathY
    * bzSmooth(bzElapsed / 0.65);

  bzPose.x = bzAnchor.x + bzMix(
    bzPerchMotion.fromX,
    bzPerchMotion.toX,
    bzAmount
  );

  bzPose.y = bzAnchor.y + bzMix(
    bzPerchMotion.fromY,
    bzPerchMotion.toY,
    bzAmount
  ) + bzBreath;

  bzPose.diameter = BZ_CONFIG.perchDiameter;

  if (bzClock >= bzPerchMotion.endTime) {
    bzPlanPerchMotion(
      bzPerchMotion.toX,
      bzPerchMotion.toY
    );
  }
}

function bzBeginFlight(
  bzNextState,
  bzDestination,
  bzSeconds,
  bzControlOne,
  bzControlTwo
) {
  bzState = bzNextState;
  bzPerchMotion = null;

  bzFlight = {
    start: bzCopyPose(bzPose),
    end: bzCopyPose(bzDestination),
    controlOne: bzControlOne,
    controlTwo: bzControlTwo,
    startTime: bzClock,
    duration: Math.max(0.2, bzSeconds),
    divePath: null
  };
}

function bzStartPerch() {
  bzState = "perch";
  bzFlight = null;
  bzPose = bzGetPerchPose();

  bzPerchStartTime = bzClock;
  bzLookDirection = random() < 0.5 ? -1 : 1;
  bzLookStep = 0;
  bzPlanPerchMotion(0, 0);

  bzDeadline = bzClock + random(
    BZ_CONFIG.perchMinSeconds,
    BZ_CONFIG.perchMaxSeconds
  );
}

function bzChooseLanding() {
  const bzZoneIndex = bzChooseDifferentIndex(
    BZ_CONFIG.groundZones.length,
    bzLastGroundZone
  );

  const bzZone = BZ_CONFIG.groundZones[bzZoneIndex];
  let bzChosen = null;
  let bzBestSeparation = -1;

  for (let bzAttempt = 0; bzAttempt < 24; bzAttempt++) {
    const bzCandidate = {
      x: random(bzZone.minX, bzZone.maxX),
      y: random(bzZone.minY, bzZone.maxY)
    };

    if (!bzLastLanding) {
      bzChosen = bzCandidate;
      break;
    }

    const bzSeparation = Math.hypot(
      bzCandidate.x - bzLastLanding.x,
      bzCandidate.y - bzLastLanding.y
    );

    if (bzSeparation > bzBestSeparation) {
      bzBestSeparation = bzSeparation;
      bzChosen = bzCandidate;
    }

    if (bzSeparation >= BZ_CONFIG.minLandingSeparation) {
      break;
    }
  }

  bzLastGroundZone = bzZoneIndex;
  bzLastLanding = { x: bzChosen.x, y: bzChosen.y };

  const bzDepth = bzClamp01(
    (bzChosen.y - BZ_CONFIG.groundFarY)
      / (BZ_CONFIG.groundNearY - BZ_CONFIG.groundFarY)
  );

  const bzDiameter = bzMix(
    BZ_CONFIG.groundFarDiameter,
    BZ_CONFIG.groundNearDiameter,
    bzDepth
  );

  return {
    x: bzChosen.x,
    y: bzChosen.y - bzDiameter / 2 - BZ_CONFIG.strokeWidth / 2,
    diameter: bzDiameter
  };
}

function bzStartDive() {
  const bzStart = bzCopyPose(bzPose);
  const bzTarget = bzChooseLanding();

  const bzStyle = bzChooseDifferentIndex(3, bzLastDiveStyle);
  bzLastDiveStyle = bzStyle;

  // 第一段终点：树桩右上方。
  // 在抵达这个点之前，整段曲线只向上、向右移动。
  const bzClearPoint = {
    x: BZ_CONFIG.launchClearX
      + random(0, BZ_CONFIG.launchClearJitterX),
    y: BZ_CONFIG.launchClearY
      + random(-BZ_CONFIG.launchClearJitterY, 0)
  };

  const bzLiftSpan = bzClearPoint.x - bzStart.x;
  const bzSharedHandle = random(65, 90);

  const bzLaunchControlOne = {
    x: bzStart.x + bzLiftSpan * 0.22,
    y: bzStart.y - random(55, 68)
  };

  const bzLaunchControlTwo = {
    x: bzClearPoint.x - bzSharedHandle,
    y: bzClearPoint.y
  };

  // 两段曲线在连接点拥有相同的水平切线。
  // 不中途停顿，不突然折角。
  const bzDiveControlOne = {
    x: bzClearPoint.x + bzSharedHandle,
    y: bzClearPoint.y
  };

  const bzRemainingX = bzTarget.x - bzClearPoint.x;
  const bzRemainingY = bzTarget.y - bzClearPoint.y;

  let bzDiveControlTwo;

  if (bzStyle === 0) {
    // 下扎较陡，落地前收平。
    bzDiveControlTwo = {
      x: bzClearPoint.x + bzRemainingX * random(0.42, 0.58),
      y: bzTarget.y - random(12, 35)
    };
  } else if (bzStyle === 1) {
    // 更直接的斜向俯冲。
    bzDiveControlTwo = {
      x: bzClearPoint.x + bzRemainingX * random(0.65, 0.78),
      y: bzClearPoint.y + bzRemainingY * random(0.65, 0.8)
    };
  } else {
    // 向外多滑出一些，再下落。
    bzDiveControlTwo = {
      x: bzClearPoint.x + bzRemainingX * random(0.82, 0.92),
      y: bzClearPoint.y + bzRemainingY * random(0.35, 0.5)
    };
  }

  bzBeginFlight(
    "dive",
    bzTarget,
    BZ_CONFIG.diveSeconds * random(0.94, 1.08),
    bzLaunchControlOne,
    bzLaunchControlTwo
  );

  bzFlight.divePath = {
    clearPoint: bzClearPoint,
    launchControlOne: bzLaunchControlOne,
    launchControlTwo: bzLaunchControlTwo,
    diveControlOne: bzDiveControlOne,
    diveControlTwo: bzDiveControlTwo
  };
}

function bzStartGroundPause() {
  bzState = "ground";
  bzFlight = null;
  bzDeadline = bzClock + random(
    BZ_CONFIG.groundMinSeconds,
    BZ_CONFIG.groundMaxSeconds
  );
}

function bzStartReturn() {
  const bzStart = bzCopyPose(bzPose);
  const bzTarget = bzGetPerchPose();

  bzBeginFlight(
    "return",
    bzTarget,
    BZ_CONFIG.returnSeconds,
    { x: bzStart.x - 160, y: bzStart.y - 250 },
    { x: bzTarget.x + 180, y: bzTarget.y - 100 }
  );
}

function bzStartDeparture() {
  const bzStart = bzCopyPose(bzPose);
  const bzTarget = {
    x: BZ_CONFIG.designWidth + 120,
    y: random(100, 210),
    diameter: bzStart.diameter
  };

  bzBeginFlight(
    "depart",
    bzTarget,
    BZ_CONFIG.departureSeconds,
    { x: bzStart.x + 180, y: bzStart.y - 230 },
    { x: bzTarget.x - 270, y: bzTarget.y + 20 }
  );
}

function bzStartEntry() {
  const bzTarget = bzGetPerchPose();

  bzPose = {
    x: BZ_CONFIG.designWidth + 120,
    y: random(100, 200),
    diameter: BZ_CONFIG.skyDiameter
  };

  bzBeginFlight(
    "enter",
    bzTarget,
    BZ_CONFIG.entrySeconds,
    { x: 1420, y: 90 },
    { x: bzTarget.x + 220, y: bzTarget.y - 105 }
  );
}

function bzBezierPoint(bzP0, bzP1, bzP2, bzP3, bzT) {
  const bzU = 1 - bzT;
  const bzW0 = bzU * bzU * bzU;
  const bzW1 = 3 * bzU * bzU * bzT;
  const bzW2 = 3 * bzU * bzT * bzT;
  const bzW3 = bzT * bzT * bzT;

  return {
    x: bzW0 * bzP0.x + bzW1 * bzP1.x
      + bzW2 * bzP2.x + bzW3 * bzP3.x,
    y: bzW0 * bzP0.y + bzW1 * bzP1.y
      + bzW2 * bzP2.y + bzW3 * bzP3.y
  };
}

function bzUpdateFlight() {
  if (!bzFlight) return;

  const bzProgress = bzClamp01(
    (bzClock - bzFlight.startTime) / bzFlight.duration
  );

  // 整次飞行统一缓动，两段之间不重新减速。
  const bzT = bzSmooth(bzProgress);
  let bzPoint;

  if (bzFlight.divePath) {
    const bzPath = bzFlight.divePath;

    if (bzT < 0.5) {
      bzPoint = bzBezierPoint(
        bzFlight.start,
        bzPath.launchControlOne,
        bzPath.launchControlTwo,
        bzPath.clearPoint,
        bzT * 2
      );
    } else {
      bzPoint = bzBezierPoint(
        bzPath.clearPoint,
        bzPath.diveControlOne,
        bzPath.diveControlTwo,
        bzFlight.end,
        (bzT - 0.5) * 2
      );
    }
  } else {
    bzPoint = bzBezierPoint(
      bzFlight.start,
      bzFlight.controlOne,
      bzFlight.controlTwo,
      bzFlight.end,
      bzT
    );
  }

  bzPose.x = bzPoint.x;
  bzPose.y = bzPoint.y;

  bzPose.diameter = bzMix(
    bzFlight.start.diameter,
    bzFlight.end.diameter,
    bzT
  );

  if (bzProgress < 1) return;

  const bzFinishedState = bzState;
  bzPose = bzCopyPose(bzFlight.end);
  bzFlight = null;

  if (bzFinishedState === "enter" || bzFinishedState === "return") {
    bzStartPerch();
  } else if (bzFinishedState === "dive") {
    bzStartGroundPause();
  } else if (bzFinishedState === "depart") {
    bzState = "wait";
    bzDeadline = bzClock + random(
      BZ_CONFIG.outsideMinSeconds,
      BZ_CONFIG.outsideMaxSeconds
    );
  }
}

function bzUpdateBehavior() {
  if (bzFlight) {
    bzUpdateFlight();
    return;
  }

  if (bzState === "perch") {
    bzUpdatePerchMotion();
    if (bzClock >= bzDeadline) bzStartDive();
    return;
  }

  if (bzClock < bzDeadline) return;

  if (bzState === "ground") {
    if (random() < BZ_CONFIG.returnProbability) {
      bzStartReturn();
    } else {
      bzStartDeparture();
    }
  } else if (bzState === "wait") {
    bzStartEntry();
  }
}

function draw() {
  if (!bzReady || !bzBackground) return;

  bzClock += Math.min(Math.max(deltaTime, 0), 50) / 1000;
  bzUpdateBehavior();

  clear();
  image(bzBackground, 0, 0, width, height);

  if (bzState === "wait") return;

  push();
  scale(
    width / BZ_CONFIG.designWidth,
    height / BZ_CONFIG.designHeight
  );

  fill(BZ_CONFIG.fillColor);
  stroke(BZ_CONFIG.strokeColor);
  strokeWeight(BZ_CONFIG.strokeWidth);
  circle(bzPose.x, bzPose.y, bzPose.diameter);

  pop();
}

function mousePressed() {
  if (!bzReady) return;

  if (
    mouseX < 0 || mouseX > width ||
    mouseY < 0 || mouseY > height
  ) return;

  if (bzState === "perch") {
    bzStartDive();
  } else if (bzState === "ground") {
    bzStartReturn();
  }
}