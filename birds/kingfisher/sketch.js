// =====================================================
// 普通翠鸟 · 明显的入水 / 出水波纹与水花
// p5.js 2.3.4
// =====================================================

const KF_CONFIG = {
  // ===================================================
  // 01. ★ 入水 / 出水效果强度
  // ===================================================
  entryEffectScale: 1.0,       // 入水效果大小
  exitEffectScale: 1.15,       // 出水效果大小

  // 出水水花更集中、更高
  exitSplashHeightScale: 1.3,
  exitSplashWidthScale: 0.75,

  // ===================================================
  // 02. ★ 扩散波纹
  // ===================================================
  rippleEnabled: true,
  rippleColor: "#E5F4EF",
  rippleOpacity: 220,          // 透明度：0～255
  rippleRingCount: 4,          // 每次产生几圈波纹
  rippleRingDelay: 0.09,       // 每圈之间的延迟，秒
  rippleDuration: 1.6,         // 波纹持续时间，秒
  rippleStartRadius: 3,
  rippleMaxRadius: 48,         // 最大横向半径，像素
  rippleVerticalScale: 0.3,    // 水面透视：越小越扁
  rippleStartStroke: 2.2,
  rippleEndStroke: 0.55,
  rippleExpandPower: 0.75,
  rippleFadePower: 1.25,

  // ===================================================
  // 03. ★ 飞溅水滴
  // ===================================================
  splashEnabled: true,
  splashColor: "#F0FCFA",
  splashOpacity: 235,
  splashCount: 18,             // 每次水花的水滴数量
  splashSize: [1.8, 3.5],      // 水滴直径范围，像素
  splashUpSpeed: [85, 155],    // 向上喷溅速度，越大飞得越高
  splashSideSpeed: [25, 95],   // 向两侧展开速度
  splashDepthSpeed: [10, 45],  // 水面前后方向的展开速度
  splashGravity: 380,          // 重力，越大落得越快
  splashTrailSeconds: 0.025,  // 水滴短拖尾长度
  splashTrailMaxPixels: 7,
  splashTrailWidth: 1.1,
  splashFadePower: 0.65,

  // 水滴落回水面后的细小涟漪
  dropRippleEnabled: true,
  dropRippleRadius: 8,
  dropRippleDuration: 0.45,
  dropRippleOpacity: 105,
  dropRippleStroke: 0.8,

  // ===================================================
  // 04. 图片
  // ===================================================
  imageFile: "普通翠鸟.jpg",
  canvasWidth: 1280,
  canvasHeight: 720,
  cropTopPercent: 0,

  // 05. 粒子外观
  dotColor: "#38c9cc",
  dotDiameter: 9,
  dotOpacity: 255,
  outlineColor: "#99dbc2",
  outlineWidth: 1,
  perchGapPixels: 0,
  branchVerticalAdjust: 0,

  // 06. 数量：包括飞行、入水中的粒子
  initialCount: 6,
  minimumCount: 3,
  maximumCount: 7,

  // 07. 树枝上缘
  // 百分比坐标，从左侧枝梢到右侧粗枝
  branchPoints: [
    { x: 50.5, y: 41.0 },
    { x: 54.0, y: 36.5 },
    { x: 58.0, y: 33.8 },
    { x: 62.0, y: 29.2 },
    { x: 67.0, y: 24.0 },
    { x: 73.5, y: 18.2 },
    { x: 82.0, y: 14.6 },
    { x: 91.0, y: 9.8 },
    { x: 98.0, y: 5.0 }
  ],

  // 08. 疏密与枝上位置
  // 沿树枝长度的百分比：0 枝梢，100 右侧粗枝
  // position：落点；min / max：移动范围
  slots: [
    { position: 3, min: 1, max: 6, weight: 3 },
    { position: 11, min: 9, max: 14, weight: 3 },
    { position: 20, min: 18, max: 23, weight: 3 },
    { position: 50, min: 46, max: 54, weight: 1 },
    { position: 81, min: 78, max: 84, weight: 3 },
    { position: 95, min: 92, max: 98, weight: 3 },
    { position: 29, min: 27, max: 32, weight: 2 },
    { position: 62, min: 59, max: 65, weight: 1 },
    { position: 88, min: 87, max: 89, weight: 2 }
  ],

  // 09. 枝上移动
  branchMoveSpeed: 7,
  individualSpeedScale: [0.8, 1.05],
  movingDuration: [10, 18],
  restingDuration: [1, 3],
  directionDuration: [5, 10],
  movementSmoothing: 0.35,
  boundaryTurnPixels: 3,
  arrivalMoveSeconds: 8,
  minimumResidenceSeconds: 15,
  initialResidenceSeconds: [5, 12],
  returnMoveSeconds: 4,

  // 10. 飞入 / 飞出频率
  arrivalsEnabled: true,
  firstArrivalDelay: 3,
  arrivalInterval: [4, 8],
  departuresEnabled: true,
  firstDepartureDelay: 6,
  departureInterval: [5, 10],
  actionRetrySeconds: 1,

  // 11. 飞行
  edgeFlightSpeed: 160,
  edgeFlightY: [8, 35],
  outsideMargin: 40,
  arrivalApproachPixels: 55,
  arrivalSideOffsetPixels: 55,
  departureLiftPixels: 65,
  maxEdgeFlights: 3,
  maxActiveBirds: 4,

  // 12. 捕食 / 入水 / 返回
  firstDiveDelay: 7,
  intervalBetweenDives: [8, 14],
  individualRestSeconds: 12,
  diveDuration: [0.65, 0.9],
  underwaterDuration: [0.15, 0.25],
  returnDuration: [1.25, 1.75],
  diveAcceleration: 1.65,
  diveCurvePixels: 10,
  returnSideCurvePixels: 45,

  // 入水位置：画布百分比
  waterTargets: [
    { x: 53, y: 85 },
    { x: 61.5, y: 76 },
    { x: 65, y: 81 },
    { x: 69, y: 77 }
  ],

  // 入水位置随机偏移：像素
  waterVariationX: 12,
  waterVariationY: 6,

  showGuides: false
};

// =====================================================
// 全局
// =====================================================

let kfBackground;
let kfBirds = [];
let kfRipples = [];
let kfDroplets = [];
let kfBranch = [];
let kfBranchLength = 0;
let kfError = "";
let kfReady = false;

let kfDiveTimer = 0;
let kfArrivalTimer = 0;
let kfDepartureTimer = 0;
let kfLastDiver = -1;
let kfNextId = 0;

async function setup() {
  createCanvas(KF_CONFIG.canvasWidth, KF_CONFIG.canvasHeight);
  pixelDensity(1);

  try {
    kfBackground = await loadImage(KF_CONFIG.imageFile);
    kfBuildBranch();

    const initialTotal = min(
      KF_CONFIG.initialCount,
      KF_CONFIG.maximumCount,
      KF_CONFIG.slots.length
    );

    for (let idx = 0; idx < initialTotal; idx++) {
      kfBirds.push(new KFBird(idx, false));
    }

    kfDiveTimer = KF_CONFIG.firstDiveDelay;
    kfArrivalTimer = KF_CONFIG.firstArrivalDelay;
    kfDepartureTimer = KF_CONFIG.firstDepartureDelay;
    kfReady = true;
  } catch (err) {
    kfError = "加载失败，请检查图片：" + KF_CONFIG.imageFile;
    console.error(err);
  }
}

function draw() {
  if (!kfReady) {
    background(30);
    noStroke();
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(18);
    text(kfError || "正在加载……", width / 2, height / 2);
    return;
  }

  const dt = min(deltaTime / 1000, 0.05);
  kfDrawBackground();

  // 先更新已有水效，再触发本帧的新入水 / 出水效果。
  kfUpdateWaterEffects(dt);

  for (const bird of kfBirds) bird.advance(dt);
  kfBirds = kfBirds.filter(bird => !bird.finished);

  kfManageArrivals(dt);
  kfManageDepartures(dt);
  kfManageDiving(dt);

  // 波纹位于水面；水滴绘制在鸟之后，表现飞溅。
  kfDrawRipples();
  for (const bird of kfBirds) bird.render();
  kfDrawDroplets();

  if (KF_CONFIG.showGuides) kfDrawGuides();
}

function kfRange(pair) {
  return random(pair[0], pair[1]);
}

// =====================================================
// 入水 / 出水水效
// =====================================================

function kfAddWaterEffect(px, py, isEmerging) {
  const effectScale = max(
    0.01,
    isEmerging
      ? KF_CONFIG.exitEffectScale
      : KF_CONFIG.entryEffectScale
  );

  if (KF_CONFIG.rippleEnabled) {
    const ringTotal = max(1, floor(KF_CONFIG.rippleRingCount));

    for (let idx = 0; idx < ringTotal; idx++) {
      kfRipples.push({
        px,
        py,
        age: -idx * KF_CONFIG.rippleRingDelay,
        lifetime: max(0.05, KF_CONFIG.rippleDuration),
        startRadius: KF_CONFIG.rippleStartRadius * effectScale,
        maxRadius: KF_CONFIG.rippleMaxRadius * effectScale,
        opacity: KF_CONFIG.rippleOpacity * Math.pow(0.85, idx),
        startStroke: KF_CONFIG.rippleStartStroke,
        endStroke: KF_CONFIG.rippleEndStroke
      });
    }
  }

  if (!KF_CONFIG.splashEnabled) return;

  const heightScale = isEmerging
    ? KF_CONFIG.exitSplashHeightScale : 1;
  const widthScale = isEmerging
    ? KF_CONFIG.exitSplashWidthScale : 1;
  const gravityValue = max(1, KF_CONFIG.splashGravity);
  const dropTotal = max(0, floor(KF_CONFIG.splashCount));

  for (let idx = 0; idx < dropTotal; idx++) {
    // 左右交错喷溅，每滴的速度独立随机。
    const sideSign = idx % 2 === 0 ? -1 : 1;
    const launchSpeed =
      kfRange(KF_CONFIG.splashUpSpeed) * effectScale * heightScale;

    kfDroplets.push({
      px: px + random(-2, 2) * effectScale,
      waterY: py + random(-1, 1),
      elevation: 0,
      vx: sideSign * kfRange(KF_CONFIG.splashSideSpeed) *
        effectScale * widthScale,
      depthVelocity: kfRange(KF_CONFIG.splashDepthSpeed) *
        (random() < 0.5 ? -1 : 1) *
        effectScale * widthScale,
      verticalVelocity: launchSpeed,
      gravityValue,
      age: 0,
      flightTime: max(0.05, 2 * launchSpeed / gravityValue),
      diameter: kfRange(KF_CONFIG.splashSize) * Math.sqrt(effectScale),
      finished: false
    });
  }
}

function kfAddDropRipple(px, py) {
  if (!KF_CONFIG.rippleEnabled || !KF_CONFIG.dropRippleEnabled) return;

  kfRipples.push({
    px,
    py,
    age: 0,
    lifetime: max(0.05, KF_CONFIG.dropRippleDuration),
    startRadius: 1,
    maxRadius: KF_CONFIG.dropRippleRadius,
    opacity: KF_CONFIG.dropRippleOpacity,
    startStroke: KF_CONFIG.dropRippleStroke,
    endStroke: 0.3
  });
}

function kfUpdateWaterEffects(dt) {
  for (const ripple of kfRipples) ripple.age += dt;
  kfRipples = kfRipples.filter(
    ripple => ripple.age < ripple.lifetime
  );

  for (const drop of kfDroplets) {
    // 精确限制到落回水面的时刻，避免穿过水面后才结束。
    const remainingTime = max(0, drop.flightTime - drop.age);
    const stepTime = min(dt, remainingTime);

    drop.px += drop.vx * stepTime;
    drop.waterY += drop.depthVelocity *
      KF_CONFIG.rippleVerticalScale * stepTime;

    drop.elevation +=
      drop.verticalVelocity * stepTime -
      0.5 * drop.gravityValue * stepTime * stepTime;

    drop.verticalVelocity -= drop.gravityValue * stepTime;
    drop.age += stepTime;

    if (drop.age >= drop.flightTime - 0.000001) {
      drop.elevation = 0;
      drop.finished = true;
      kfAddDropRipple(drop.px, drop.waterY);
    }
  }

  kfDroplets = kfDroplets.filter(drop => !drop.finished);
}

function kfDrawRipples() {
  push();
  noFill();

  for (const ripple of kfRipples) {
    if (ripple.age < 0) continue;

    const fraction = constrain(ripple.age / ripple.lifetime, 0, 1);
    const radiusValue = lerp(
      ripple.startRadius,
      ripple.maxRadius,
      Math.pow(fraction, KF_CONFIG.rippleExpandPower)
    );

    const ripplePaint = color(KF_CONFIG.rippleColor);
    ripplePaint.setAlpha(
      ripple.opacity *
      Math.pow(1 - fraction, KF_CONFIG.rippleFadePower)
    );

    stroke(ripplePaint);
    strokeWeight(lerp(
      ripple.startStroke, ripple.endStroke, fraction
    ));

    ellipse(
      ripple.px,
      ripple.py,
      radiusValue * 2,
      radiusValue * 2 * KF_CONFIG.rippleVerticalScale
    );
  }

  pop();
}

function kfDrawDroplets() {
  push();
  strokeCap(ROUND);

  for (const drop of kfDroplets) {
    const fraction = constrain(drop.age / drop.flightTime, 0, 1);
    const fadeAmount = Math.pow(
      1 - fraction, KF_CONFIG.splashFadePower
    );

    const dropPaint = color(KF_CONFIG.splashColor);
    dropPaint.setAlpha(KF_CONFIG.splashOpacity * fadeAmount);

    // 高度不进行水面透视压缩，所以水滴会真正向上飞起。
    const screenY = drop.waterY - max(0, drop.elevation);
    const screenVY =
      drop.depthVelocity * KF_CONFIG.rippleVerticalScale -
      drop.verticalVelocity;

    let trailDX = drop.vx * KF_CONFIG.splashTrailSeconds;
    let trailDY = screenVY * KF_CONFIG.splashTrailSeconds;
    const trailLength = Math.hypot(trailDX, trailDY);
    const maxTrail = max(0, KF_CONFIG.splashTrailMaxPixels);

    if (trailLength > maxTrail && trailLength > 0) {
      trailDX *= maxTrail / trailLength;
      trailDY *= maxTrail / trailLength;
    }

    if (maxTrail > 0 && KF_CONFIG.splashTrailSeconds > 0) {
      stroke(dropPaint);
      strokeWeight(KF_CONFIG.splashTrailWidth);
      line(
        drop.px, screenY,
        drop.px - trailDX, screenY - trailDY
      );
    }

    noStroke();
    fill(dropPaint);
    circle(drop.px, screenY, drop.diameter);
  }

  pop();
}

// =====================================================
// 树枝
// =====================================================

function kfBuildBranch() {
  kfBranchLength = 0;
  kfBranch = KF_CONFIG.branchPoints.map(
    (branchNode, idx, allNodes) => {
      const px = branchNode.x / 100 * width;
      const py = branchNode.y / 100 * height +
        KF_CONFIG.branchVerticalAdjust;

      if (idx > 0) {
        const previousNode = allNodes[idx - 1];
        kfBranchLength += Math.hypot(
          (branchNode.x - previousNode.x) / 100 * width,
          (branchNode.y - previousNode.y) / 100 * height
        );
      }
      return { px, py, along: kfBranchLength };
    }
  );
}

function kfBranchSample(alongValue) {
  const clampedAlong = constrain(alongValue, 0, kfBranchLength);

  for (let idx = 1; idx < kfBranch.length; idx++) {
    const a = kfBranch[idx - 1];
    const b = kfBranch[idx];

    if (clampedAlong <= b.along || idx === kfBranch.length - 1) {
      const segmentLength = max(0.001, b.along - a.along);
      const portion = (clampedAlong - a.along) / segmentLength;
      return {
        px: lerp(a.px, b.px, portion),
        py: lerp(a.py, b.py, portion),
        nx: (b.py - a.py) / segmentLength,
        ny: -(b.px - a.px) / segmentLength
      };
    }
  }
}

function kfPerchPosition(alongValue) {
  const branchSample = kfBranchSample(alongValue);
  const lift =
    KF_CONFIG.dotDiameter / 2 +
    KF_CONFIG.outlineWidth / 2 +
    KF_CONFIG.perchGapPixels;

  return {
    px: branchSample.px + branchSample.nx * lift,
    py: branchSample.py + branchSample.ny * lift
  };
}

// =====================================================
// 数量 / 飞入 / 飞出 / 俯冲管理
// =====================================================

function kfActiveCount() {
  return kfBirds.filter(bird => bird.state !== "branch").length;
}

function kfEdgeCount() {
  return kfBirds.filter(
    bird => bird.state === "enter" || bird.state === "exit"
  ).length;
}

function kfCanStartEdgeFlight() {
  return (
    kfEdgeCount() < KF_CONFIG.maxEdgeFlights &&
    kfActiveCount() < KF_CONFIG.maxActiveBirds
  );
}

function kfChooseFreeSlot() {
  const available = [];

  for (let idx = 0; idx < KF_CONFIG.slots.length; idx++) {
    const occupied = kfBirds.some(
      bird => bird.slotIndex === idx && bird.state !== "exit"
    );
    if (!occupied) available.push(idx);
  }

  if (!available.length) return -1;
  const totalWeight = available.reduce(
    (sum, idx) => sum + max(0, KF_CONFIG.slots[idx].weight), 0
  );
  if (totalWeight <= 0) return random(available);

  let ticket = random(totalWeight);
  for (const idx of available) {
    ticket -= max(0, KF_CONFIG.slots[idx].weight);
    if (ticket <= 0) return idx;
  }
  return available[available.length - 1];
}

function kfManageArrivals(dt) {
  if (!KF_CONFIG.arrivalsEnabled) return;
  kfArrivalTimer -= dt;
  if (kfArrivalTimer > 0) return;

  if (
    kfBirds.length >= KF_CONFIG.maximumCount ||
    !kfCanStartEdgeFlight()
  ) {
    kfArrivalTimer = KF_CONFIG.actionRetrySeconds;
    return;
  }

  const slotIndex = kfChooseFreeSlot();
  if (slotIndex < 0) {
    kfArrivalTimer = KF_CONFIG.actionRetrySeconds;
    return;
  }

  const newBird = new KFBird(slotIndex, true);
  newBird.beginEntry();
  kfBirds.push(newBird);
  kfArrivalTimer = kfRange(KF_CONFIG.arrivalInterval);
}

function kfManageDepartures(dt) {
  if (!KF_CONFIG.departuresEnabled) return;
  kfDepartureTimer -= dt;
  if (kfDepartureTimer > 0) return;

  const residentCount = kfBirds.filter(
    bird => bird.state !== "exit" && bird.state !== "enter"
  ).length;

  if (
    residentCount <= KF_CONFIG.minimumCount ||
    !kfCanStartEdgeFlight()
  ) {
    kfDepartureTimer = KF_CONFIG.actionRetrySeconds;
    return;
  }

  const candidates = kfBirds.filter(
    bird =>
      bird.state === "branch" &&
      bird.residenceRemaining <= 0 &&
      bird.forcedMoveRemaining <= 0
  );

  if (!candidates.length) {
    kfDepartureTimer = KF_CONFIG.actionRetrySeconds;
    return;
  }

  random(candidates).beginExit();
  kfDepartureTimer = kfRange(KF_CONFIG.departureInterval);
}

function kfManageDiving(dt) {
  const diveBusy = kfBirds.some(
    bird =>
      bird.state === "dive" ||
      bird.state === "underwater" ||
      bird.state === "return"
  );
  if (diveBusy) return;

  kfDiveTimer -= dt;
  if (
    kfDiveTimer > 0 ||
    kfActiveCount() >= KF_CONFIG.maxActiveBirds
  ) return;

  let candidates = kfBirds.filter(
    bird =>
      bird.state === "branch" &&
      bird.diveRest <= 0 &&
      bird.forcedMoveRemaining <= 0
  );
  if (!candidates.length) return;

  const alternatives = candidates.filter(
    bird => bird.id !== kfLastDiver
  );
  if (alternatives.length) candidates = alternatives;

  const chosenBird = random(candidates);
  chosenBird.beginDive();
  kfLastDiver = chosenBird.id;
  kfDiveTimer = kfRange(KF_CONFIG.intervalBetweenDives);
}

// =====================================================
// 背景 / 辅助
// =====================================================

function kfDrawBackground() {
  const canvasRatio = width / height;
  let sourceWidth = kfBackground.width;
  let sourceHeight = kfBackground.height;
  let sourceX = 0;
  let sourceY = 0;

  if (sourceWidth / sourceHeight < canvasRatio) {
    sourceHeight = sourceWidth / canvasRatio;
    sourceY = constrain(
      kfBackground.height * KF_CONFIG.cropTopPercent / 100,
      0, kfBackground.height - sourceHeight
    );
  } else {
    sourceWidth = sourceHeight * canvasRatio;
    sourceX = (kfBackground.width - sourceWidth) / 2;
  }

  image(
    kfBackground,
    0, 0, width, height,
    sourceX, sourceY, sourceWidth, sourceHeight
  );
}

function kfDrawGuides() {
  push();
  noFill();
  stroke("#FFE08A");
  strokeWeight(1);
  beginShape();
  for (const branchNode of kfBranch) {
    vertex(branchNode.px, branchNode.py);
  }
  endShape();

  textSize(12);
  textAlign(LEFT, BOTTOM);
  kfBranch.forEach((branchNode, idx) => {
    circle(branchNode.px, branchNode.py, 5);
    noStroke();
    fill("#FFE08A");
    text(idx + 1, branchNode.px + 5, branchNode.py - 5);
    noFill();
    stroke("#FFE08A");
  });
  pop();
}

function kfCubic(a, b, c, d, t) {
  const inverse = 1 - t;
  return (
    inverse ** 3 * a +
    3 * inverse ** 2 * t * b +
    3 * inverse * t ** 2 * c +
    t ** 3 * d
  );
}

// =====================================================
// 翠鸟粒子
// =====================================================

class KFBird {
  constructor(slotIndex, isNewArrival) {
    const settings = KF_CONFIG.slots[slotIndex];
    this.id = kfNextId++;
    this.slotIndex = slotIndex;

    this.lowAlong = settings.min / 100 * kfBranchLength;
    this.highAlong = settings.max / 100 * kfBranchLength;
    this.along = settings.position / 100 * kfBranchLength;
    this.heading = random() < 0.5 ? -1 : 1;
    this.personalSpeed =
      KF_CONFIG.branchMoveSpeed *
      kfRange(KF_CONFIG.individualSpeedScale);

    this.moving = true;
    this.moveVelocity = this.heading * this.personalSpeed;
    this.activityTimer = kfRange(KF_CONFIG.movingDuration);
    this.turnTimer = kfRange(KF_CONFIG.directionDuration);
    this.forcedMoveRemaining = 0;
    this.diveRest = 0;
    this.residenceRemaining = isNewArrival
      ? KF_CONFIG.minimumResidenceSeconds
      : kfRange(KF_CONFIG.initialResidenceSeconds);

    this.state = "branch";
    this.finished = false;
    const perch = kfPerchPosition(this.along);
    this.px = perch.px;
    this.py = perch.py;

    this.elapsed = 0;
    this.duration = 1;
    this.homeX = this.px;
    this.homeY = this.py;
    this.endX = this.px;
    this.endY = this.py;
    this.bend = 0;
    this.returnBend = 0;
    this.path = null;
  }

  advance(dt) {
    if (this.finished) return;

    if (this.state === "branch") {
      this.diveRest = max(0, this.diveRest - dt);
      this.residenceRemaining = max(0, this.residenceRemaining - dt);
      this.advanceOnBranch(dt);
      return;
    }

    this.elapsed += dt;
    const phaseProgress = constrain(this.elapsed / this.duration, 0, 1);

    if (this.state === "underwater") {
      if (phaseProgress >= 1) {
        // 出水瞬间重新产生波纹和水花。
        kfAddWaterEffect(this.endX, this.endY, true);
        this.state = "return";
        this.elapsed = 0;
        this.duration = max(0.05, kfRange(KF_CONFIG.returnDuration));
        this.px = this.endX;
        this.py = this.endY;
      }
      return;
    }

    if (this.state === "dive") {
      const flightProgress = Math.pow(
        phaseProgress, max(1, KF_CONFIG.diveAcceleration)
      );
      this.px =
        lerp(this.homeX, this.endX, flightProgress) +
        sin(PI * flightProgress) * this.bend;
      this.py = lerp(this.homeY, this.endY, flightProgress);

      if (phaseProgress >= 1) {
        // 入水瞬间触发一次，不会每帧重复喷溅。
        this.px = this.endX;
        this.py = this.endY;
        kfAddWaterEffect(this.endX, this.endY, false);
        this.state = "underwater";
        this.elapsed = 0;
        this.duration = max(0.01, kfRange(KF_CONFIG.underwaterDuration));
      }
      return;
    }

    if (this.state === "return") {
      const flightProgress = 1 - Math.pow(1 - phaseProgress, 2);
      this.px =
        lerp(this.endX, this.homeX, flightProgress) +
        sin(PI * flightProgress) * this.returnBend;
      this.py = lerp(this.endY, this.homeY, flightProgress);

      if (phaseProgress >= 1) this.land(false);
      return;
    }

    const flightProgress = this.state === "enter"
      ? 1 - Math.pow(1 - phaseProgress, 2)
      : phaseProgress * phaseProgress * (2 - phaseProgress);

    this.px = kfCubic(
      this.path.x0, this.path.x1,
      this.path.x2, this.path.x3,
      flightProgress
    );
    this.py = kfCubic(
      this.path.y0, this.path.y1,
      this.path.y2, this.path.y3,
      flightProgress
    );

    if (phaseProgress >= 1) {
      if (this.state === "exit") this.finished = true;
      else this.land(true);
    }
  }

  advanceOnBranch(dt) {
    const forced = this.forcedMoveRemaining > 0;
    this.forcedMoveRemaining = max(0, this.forcedMoveRemaining - dt);

    if (forced) {
      this.moving = true;
    } else {
      this.activityTimer -= dt;
      if (this.activityTimer <= 0) {
        this.moving = !this.moving;
        this.activityTimer = kfRange(
          this.moving
            ? KF_CONFIG.movingDuration
            : KF_CONFIG.restingDuration
        );
      }
    }

    if (this.moving) {
      this.turnTimer -= dt;
      if (this.turnTimer <= 0) {
        this.heading *= -1;
        this.turnTimer = kfRange(KF_CONFIG.directionDuration);
      }
    }

    const bufferPixels = min(
      KF_CONFIG.boundaryTurnPixels,
      (this.highAlong - this.lowAlong) / 4
    );

    if (
      this.along <= this.lowAlong + bufferPixels &&
      this.heading < 0
    ) {
      this.heading = 1;
      this.turnTimer = kfRange(KF_CONFIG.directionDuration);
    }
    if (
      this.along >= this.highAlong - bufferPixels &&
      this.heading > 0
    ) {
      this.heading = -1;
      this.turnTimer = kfRange(KF_CONFIG.directionDuration);
    }

    const desiredVelocity = this.moving
      ? this.heading * this.personalSpeed : 0;
    const blendAmount = 1 - Math.exp(
      -dt / max(0.01, KF_CONFIG.movementSmoothing)
    );
    this.moveVelocity = lerp(
      this.moveVelocity, desiredVelocity, blendAmount
    );
    this.along += this.moveVelocity * dt;

    if (this.along < this.lowAlong) {
      this.along = this.lowAlong;
      this.heading = 1;
      this.moveVelocity = max(0, this.moveVelocity);
    }
    if (this.along > this.highAlong) {
      this.along = this.highAlong;
      this.heading = -1;
      this.moveVelocity = min(0, this.moveVelocity);
    }

    const perch = kfPerchPosition(this.along);
    this.px = perch.px;
    this.py = perch.py;
  }

  beginDive() {
    this.state = "dive";
    this.elapsed = 0;
    this.duration = max(0.05, kfRange(KF_CONFIG.diveDuration));
    this.homeX = this.px;
    this.homeY = this.py;

    const waterSpot = random(KF_CONFIG.waterTargets);
    this.endX = waterSpot.x / 100 * width +
      random(-KF_CONFIG.waterVariationX, KF_CONFIG.waterVariationX);
    this.endY = waterSpot.y / 100 * height +
      random(-KF_CONFIG.waterVariationY, KF_CONFIG.waterVariationY);

    this.bend = random(
      -KF_CONFIG.diveCurvePixels, KF_CONFIG.diveCurvePixels
    );
    this.returnBend =
      (random() < 0.5 ? -1 : 1) * KF_CONFIG.returnSideCurvePixels;
  }

  beginExit() {
    const marginPixels = max(
      KF_CONFIG.outsideMargin, KF_CONFIG.dotDiameter
    );
    const toRight = random() < 0.5;
    const targetX = toRight ? width + marginPixels : -marginPixels;
    const targetY = kfRange(KF_CONFIG.edgeFlightY) / 100 * height;
    const sideSign = toRight ? 1 : -1;

    this.path = {
      x0: this.px,
      y0: this.py,
      x1: this.px + sideSign * KF_CONFIG.arrivalSideOffsetPixels,
      y1: this.py - KF_CONFIG.departureLiftPixels,
      x2: lerp(this.px, targetX, 0.7),
      y2: targetY,
      x3: targetX,
      y3: targetY
    };
    this.beginEdgeMotion("exit");
  }

  beginEntry() {
    const perch = kfPerchPosition(this.along);
    const marginPixels = max(
      KF_CONFIG.outsideMargin, KF_CONFIG.dotDiameter
    );
    const fromLeft = random() < 0.5;
    const startX = fromLeft ? -marginPixels : width + marginPixels;
    const startY = kfRange(KF_CONFIG.edgeFlightY) / 100 * height;
    const approachSign = fromLeft ? -1 : 1;

    this.path = {
      x0: startX,
      y0: startY,
      x1: lerp(startX, perch.px, 0.5),
      y1: min(startY, perch.py) - KF_CONFIG.arrivalApproachPixels,
      x2: perch.px + approachSign * KF_CONFIG.arrivalSideOffsetPixels,
      y2: perch.py - KF_CONFIG.arrivalApproachPixels,
      x3: perch.px,
      y3: perch.py
    };
    this.px = startX;
    this.py = startY;
    this.beginEdgeMotion("enter");
  }

  beginEdgeMotion(nextState) {
    this.state = nextState;
    this.elapsed = 0;

    const pathEstimate =
      Math.hypot(
        this.path.x1 - this.path.x0,
        this.path.y1 - this.path.y0
      ) +
      Math.hypot(
        this.path.x2 - this.path.x1,
        this.path.y2 - this.path.y1
      ) +
      Math.hypot(
        this.path.x3 - this.path.x2,
        this.path.y3 - this.path.y2
      );

    this.duration = max(
      1, pathEstimate / max(1, KF_CONFIG.edgeFlightSpeed)
    );
  }

  land(fromOutside) {
    this.state = "branch";
    const perch = kfPerchPosition(this.along);
    this.px = perch.px;
    this.py = perch.py;

    const middleAlong = (this.lowAlong + this.highAlong) / 2;
    this.heading = this.along < middleAlong ? 1 : -1;
    this.moving = true;
    this.moveVelocity = 0;
    this.forcedMoveRemaining = fromOutside
      ? KF_CONFIG.arrivalMoveSeconds
      : KF_CONFIG.returnMoveSeconds;
    this.activityTimer = kfRange(KF_CONFIG.movingDuration);
    this.turnTimer = kfRange(KF_CONFIG.directionDuration);
    this.diveRest = KF_CONFIG.individualRestSeconds;

    if (fromOutside) {
      this.residenceRemaining = KF_CONFIG.minimumResidenceSeconds;
    }
  }

  render() {
    if (this.state === "underwater" || this.finished) return;

    push();
    const dotPaint = color(KF_CONFIG.dotColor);
    dotPaint.setAlpha(KF_CONFIG.dotOpacity);
    fill(dotPaint);

    if (KF_CONFIG.outlineWidth > 0) {
      stroke(KF_CONFIG.outlineColor);
      strokeWeight(KF_CONFIG.outlineWidth);
    } else {
      noStroke();
    }

    circle(this.px, this.py, KF_CONFIG.dotDiameter);
    pop();
  }
}