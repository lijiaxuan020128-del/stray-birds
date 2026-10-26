// =====================================================
// 小䴙䴘 · 完整 sketch.js
// p5.js 2.x
// =====================================================

const GREBE_CONFIG = {

  imageFile: "小䴙䴘.jpg",

  canvasWidth: 1280,
  canvasHeight: 720,


  // ===================================================
  // ★★★★★ 圆点参数 ★★★★★
  // ===================================================

  // ---------- 成鸟 / 大粒子 ----------

  adultDiameter: 20,

  adultColor: "#795548",

  // ★ 成鸟轮廓颜色
  adultStrokeColor: "#5f1707",

  // ★ 成鸟轮廓粗细
  adultStrokeWeight: 1,


  // ---------- 幼崽 / 小粒子 ----------

  chickDiameter: 10,

  chickColor: "#AF9273",

  // ★ 幼崽轮廓颜色
  chickStrokeColor: "#806A58",

  // ★ 幼崽轮廓粗细
  chickStrokeWeight: 1.2,


  // 粒子整体透明度
  dotOpacity: 255,


  // ===================================================
  // ★ 水下视觉
  // ===================================================

  underwaterScale: 0.76,
  underwaterOpacity: 125,

  underwaterAdultColor: "#30383A",
  underwaterChickColor: "#4A4F4D",


  // ===================================================
  // ★ 水下轨迹
  // ===================================================

  underwaterTrailEnabled: true,

  underwaterTrailInterval: 0.055,

  underwaterTrailLife: 0.70,

  underwaterTrailOpacity: 72,

  underwaterTrailScale: 0.52,


  // ===================================================
  // ★★★★★ 涟漪参数 ★★★★★
  // ===================================================

  rippleEnabled: true,

  // 最大扩散半径
  rippleMaxRadius: 100,

  // 涟漪持续时间
  rippleLife: 1.65,

  // 波纹圈数
  rippleRingCount: 3,

  // 每圈出现间隔
  rippleRingDelay: 0.13,

  // 初始半径
  rippleStartRadius: 4,

  // 椭圆纵向比例
  rippleVerticalScale: 0.46,

  // 初始透明度
  rippleOpacity: 205,

  // 消失渐变系数
  rippleFadePower: 1.65,

  // 初始线宽
  rippleStartWeight: 2.4,

  // 消失时线宽
  rippleEndWeight: 0.55,

  // 涟漪颜色
  rippleColor: "#EAF4F2",

  // 下潜涟漪强度
  diveRippleIntensity: 1.0,

  // 出水涟漪强度
  emergeRippleIntensity: 1.18,

  // 幼崽涟漪倍率
  chickRippleScale: 0.65,

  // 荷叶遮挡检测精度
  rippleMaskSegments: 120,


  // ===================================================
  // ★ 水花
  // ===================================================

  splashDropsEnabled: true,

  splashDropCount: 7,

  splashDropSpeed: [16, 38],

  splashDropSize: [1.5, 3.2],

  splashDropLife: 0.55,

  splashDropOpacity: 210,


  // ===================================================
  // ★ 成鸟间距
  // ===================================================

  adultMinDistance: 115,

  adultAvoidStrength: 34,

  adultEmergencyDistance: 60,

  adultEmergencyStrength: 48,


  // ===================================================
  // ★ 初始位置
  // ===================================================

  adultStarts: [
    { x: 26, y: 87 },
    { x: 15, y: 12 },
    { x: 65, y: 91 },
    { x: 94, y: 67 },
    { x: 89, y: 17 }
  ],

  chickStarts: [
    { x: 22, y: 88, parentIndex: 0 },
    { x: 19, y: 86, parentIndex: 0 },
    { x: 17, y: 90, parentIndex: 0 }
  ],


  // ===================================================
  // ★ 速度
  // ===================================================

  adultSpeed: 18,

  chickSpeed: 23,

  underwaterSpeed: 58,

  steeringSeconds: 0.65,


  // ===================================================
  // ★ 普通游动
  // ===================================================

  swimTravelPixels: [35, 110],

  pauseSeconds: [0.25, 1.25],


  // ===================================================
  // ★ 幼崽跟随
  // ===================================================

  followDelaySeconds: [
    0.70,
    1.05,
    1.40
  ],

  followSpacingPixels: [
    30,
    40,
    50
  ],

  followSideOffsets: [
    -11,
    10,
    -3
  ],

  chickCatchupStart: 90,

  chickCatchupStrong: 125,


  // ===================================================
  // ★ 家庭潜水
  // ===================================================

  familyDiveDelays: [
    0.45,
    0.80,
    1.15
  ],


  // ===================================================
  // ★ 潜水
  // ===================================================

  firstDiveDelay: [4, 9],

  diveInterval: [9, 16],

  maxAdultsUnderwater: 2,

  submergeSeconds: 0.28,

  underwaterSeconds: [1.4, 7.0],

  emergeSeconds: 0.38,


  // ===================================================
  // ★ 潜水目的地概率
  // ===================================================

  centerGapChance: 0.62,

  crossLilyChance: 0.38,


  // ===================================================
  // ★ 外围水域
  // ===================================================

  outerWaterPatches: [

    [
      [6, 79],
      [94, 79],
      [98, 84],
      [98, 98],
      [6, 98]
    ],

    [
      [1, 2],
      [21, 2],
      [21, 14],
      [18, 20],
      [11, 24],
      [1, 23]
    ],

    [
      [75, 2],
      [98, 2],
      [98, 34],
      [92, 32],
      [84, 29],
      [78, 24]
    ],

    [
      [92, 39],
      [98, 39],
      [98, 74],
      [92, 74]
    ]
  ],


  // ===================================================
  // ★ 中央两个露水区域
  // ===================================================

  centerWaterPatches: [

    [
      [31.6, 33.5],
      [34.7, 32.8],
      [37.7, 34.0],
      [39.4, 37.1],
      [40.4, 38.5],
      [43.2, 39.2],
      [44.0, 41.1],
      [44.2, 42.3],
      [43.4, 43.0],
      [39.9, 43.0],
      [36.6, 42.8],
      [34.4, 42.7],
      [34.2, 40.2],
      [34.2, 37.8],
      [33.7, 35.7],
      [32.8, 34.3]
    ],

    [
      [58.4, 42.0],
      [59.7, 42.0],
      [60.2, 44.0],
      [62.6, 45.0],
      [65.0, 46.0],
      [67.1, 47.0],
      [65.0, 48.0],
      [63.3, 49.3],
      [62.0, 51.3],
      [61.5, 53.4],
      [61.8, 55.3],
      [63.3, 58.0],
      [64.4, 60.4],
      [64.9, 62.4],
      [63.2, 61.0],
      [60.8, 60.4],
      [58.0, 61.0],
      [57.4, 57.0],
      [56.5, 54.3],
      [55.0, 52.0],
      [56.7, 50.5],
      [57.7, 49.0],
      [58.2, 46.7],
      [58.0, 44.5]
    ]
  ],

  outerMarginPixels: 8,

  centerMarginPixels: 2,

  pathSamplePixels: 4,

  showWaterAreas: false
};


// =====================================================
// 全局
// =====================================================

let gbImage;

let gbAdults = [];
let gbChicks = [];

let gbOuterPatches = [];
let gbCenterPatches = [];
let gbAllPatches = [];

let gbRipples = [];
let gbSplashDrops = [];
let gbUnderwaterTrails = [];

let gbClock = 0;
let gbTrailTimer = 0;

let gbError = "";


// =====================================================
// SETUP
// =====================================================

async function setup() {

  createCanvas(
    GREBE_CONFIG.canvasWidth,
    GREBE_CONFIG.canvasHeight
  );

  pixelDensity(1);

  try {

    gbImage =
      await loadImage(
        GREBE_CONFIG.imageFile
      );

    gbOuterPatches =
      GREBE_CONFIG.outerWaterPatches.map(
        gbConvertPolygon
      );

    gbCenterPatches =
      GREBE_CONFIG.centerWaterPatches.map(
        gbConvertPolygon
      );

    gbAllPatches = [
      ...gbOuterPatches,
      ...gbCenterPatches
    ];

    gbAdults =
      GREBE_CONFIG.adultStarts.map(
        (settings, index) =>
          new GrebeDot(
            settings,
            false,
            index
          )
      );

    gbChicks =
      GREBE_CONFIG.chickStarts.map(
        (settings, index) =>
          new GrebeDot(
            settings,
            true,
            index
          )
      );

    for (const adult of gbAdults) {

      adult.chooseSwimTarget();
      adult.rememberPosition();
    }

    for (const chick of gbChicks) {

      const target =
        gbNearParent(chick);

      chick.targetX =
        target.px;

      chick.targetY =
        target.py;
    }

  } catch (err) {

    gbError =
      "加载失败：" +
      err.message;

    console.error(err);
  }
}


// =====================================================
// DRAW
// =====================================================

function draw() {

  if (
    !gbImage ||
    !gbAdults.length ||
    gbError
  ) {

    background(35);

    fill(255);

    noStroke();

    textAlign(
      CENTER,
      CENTER
    );

    textSize(17);

    text(
      gbError || "正在加载……",
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

  gbClock += dt;

  image(
    gbImage,
    0,
    0,
    width,
    height
  );


  for (const adult of gbAdults) {
    adult.advance(dt);
  }


  gbTrailTimer += dt;

  if (
    gbTrailTimer >= 0.05
  ) {

    gbTrailTimer = 0;

    for (const adult of gbAdults) {
      adult.rememberPosition();
    }
  }


  for (const chick of gbChicks) {
    chick.advance(dt);
  }


  gbUpdateEffects(dt);

  gbDrawUnderwaterTrails();

  gbDrawRipples();


  const drawingOrder = [
    ...gbAdults,
    ...gbChicks
  ];

  drawingOrder.sort(
    (a, b) =>
      a.py - b.py
  );

  for (const bird of drawingOrder) {
    bird.render();
  }


  gbDrawSplashDrops();


  if (
    GREBE_CONFIG.showWaterAreas
  ) {
    gbDrawAreas();
  }
}


// =====================================================
// 基础工具
// =====================================================

function gbConvertPolygon(
  polygon
) {

  return polygon.map(
    pair => ({
      px:
        pair[0] /
        100 *
        width,

      py:
        pair[1] /
        100 *
        height
    })
  );
}


function gbRange(
  pair
) {

  return random(
    pair[0],
    pair[1]
  );
}


function gbInsidePolygon(
  px,
  py,
  polygon
) {

  let inside = false;

  for (
    let i = 0,
        j = polygon.length - 1;
    i < polygon.length;
    j = i++
  ) {

    const a =
      polygon[i];

    const b =
      polygon[j];

    const crosses =
      (a.py > py) !==
      (b.py > py);

    if (crosses) {

      const intersectionX =
        (b.px - a.px) *
        (py - a.py) /
        (b.py - a.py) +
        a.px;

      if (
        px <
        intersectionX
      ) {
        inside =
          !inside;
      }
    }
  }

  return inside;
}


function gbPatchAt(
  px,
  py
) {

  for (
    let i = 0;
    i < gbAllPatches.length;
    i++
  ) {

    if (
      gbInsidePolygon(
        px,
        py,
        gbAllPatches[i]
      )
    ) {
      return i;
    }
  }

  return -1;
}


// =====================================================
// 可见水面
// =====================================================

function gbWaterVisibleAt(
  px,
  py
) {

  return (
    gbPatchAt(
      px,
      py
    ) >= 0
  );
}


function gbUnderwaterVisibleAt(
  px,
  py
) {

  return gbWaterVisibleAt(
    px,
    py
  );
}


function gbIsCenterPatch(
  patchIndex
) {

  return (
    patchIndex >=
    gbOuterPatches.length
  );
}


// =====================================================
// 安全水面
// =====================================================

function gbSafeWater(
  px,
  py
) {

  const patchIndex =
    gbPatchAt(
      px,
      py
    );

  if (
    patchIndex < 0
  ) {
    return false;
  }

  const polygon =
    gbAllPatches[
      patchIndex
    ];

  const padding =
    gbIsCenterPatch(
      patchIndex
    )
      ? GREBE_CONFIG.centerMarginPixels
      : GREBE_CONFIG.outerMarginPixels;

  for (
    let i = 0;
    i < 8;
    i++
  ) {

    const angleValue =
      i *
      TWO_PI /
      8;

    const testX =
      px +
      cos(angleValue) *
      padding;

    const testY =
      py +
      sin(angleValue) *
      padding;

    if (
      !gbInsidePolygon(
        testX,
        testY,
        polygon
      )
    ) {
      return false;
    }
  }

  return true;
}


// =====================================================
// 路线检测
// =====================================================

function gbClearRoute(
  ax,
  ay,
  bx,
  by
) {

  const startPatch =
    gbPatchAt(
      ax,
      ay
    );

  const endPatch =
    gbPatchAt(
      bx,
      by
    );

  if (
    startPatch < 0 ||
    endPatch < 0 ||
    startPatch !== endPatch
  ) {
    return false;
  }

  const distanceValue =
    Math.hypot(
      bx - ax,
      by - ay
    );

  const steps =
    max(
      1,
      ceil(
        distanceValue /
        GREBE_CONFIG.pathSamplePixels
      )
    );

  for (
    let i = 0;
    i <= steps;
    i++
  ) {

    const t =
      i /
      steps;

    const testX =
      lerp(
        ax,
        bx,
        t
      );

    const testY =
      lerp(
        ay,
        by,
        t
      );

    if (
      !gbSafeWater(
        testX,
        testY
      )
    ) {
      return false;
    }
  }

  return true;
}


// =====================================================
// 随机水面
// =====================================================

function gbRandomWater(
  patchIndex
) {

  const polygon =
    gbAllPatches[
      patchIndex
    ];

  if (!polygon) {
    return null;
  }

  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  for (const item of polygon) {

    minX =
      min(
        minX,
        item.px
      );

    maxX =
      max(
        maxX,
        item.px
      );

    minY =
      min(
        minY,
        item.py
      );

    maxY =
      max(
        maxY,
        item.py
      );
  }

  for (
    let attempt = 0;
    attempt < 100;
    attempt++
  ) {

    const px =
      random(
        minX,
        maxX
      );

    const py =
      random(
        minY,
        maxY
      );

    if (
      gbSafeWater(
        px,
        py
      )
    ) {
      return {
        px,
        py
      };
    }
  }

  return null;
}


function gbShuffleArray(
  source
) {

  const result =
    source.slice();

  for (
    let i = result.length - 1;
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
      result[i];

    result[i] =
      result[j];

    result[j] =
      temp;
  }

  return result;
}


// =====================================================
// 成鸟避让
// =====================================================

function gbAdultAvoidance(
  bird
) {

  let avoidX = 0;
  let avoidY = 0;

  const birdPatch =
    gbPatchAt(
      bird.px,
      bird.py
    );

  for (const other of gbAdults) {

    if (
      other === bird ||
      other.state !== "surface"
    ) {
      continue;
    }

    const otherPatch =
      gbPatchAt(
        other.px,
        other.py
      );

    if (
      birdPatch !==
      otherPatch
    ) {
      continue;
    }

    const dx =
      bird.px -
      other.px;

    const dy =
      bird.py -
      other.py;

    const distanceValue =
      Math.hypot(
        dx,
        dy
      );

    if (
      distanceValue <=
      0.001
    ) {
      continue;
    }

    if (
      distanceValue <
      GREBE_CONFIG.adultMinDistance
    ) {

      const proximity =
        1 -
        distanceValue /
        GREBE_CONFIG.adultMinDistance;

      let strength =
        GREBE_CONFIG.adultAvoidStrength *
        proximity *
        proximity;

      if (
        distanceValue <
        GREBE_CONFIG.adultEmergencyDistance
      ) {

        const emergency =
          1 -
          distanceValue /
          GREBE_CONFIG.adultEmergencyDistance;

        strength +=
          GREBE_CONFIG.adultEmergencyStrength *
          emergency;
      }

      avoidX +=
        dx /
        distanceValue *
        strength;

      avoidY +=
        dy /
        distanceValue *
        strength;
    }
  }

  return {
    x: avoidX,
    y: avoidY
  };
}


// =====================================================
// 潜水目标
// =====================================================

function gbFindDiveTarget(
  bird
) {

  const currentPatch =
    gbPatchAt(
      bird.px,
      bird.py
    );

  if (
    gbIsCenterPatch(
      currentPatch
    )
  ) {

    const choices =
      gbShuffleArray(
        [0, 1, 2, 3]
      );

    for (
      const patchIndex
      of choices
    ) {

      const candidate =
        gbRandomWater(
          patchIndex
        );

      if (candidate) {
        return candidate;
      }
    }
  }


  if (
    random() <
    GREBE_CONFIG.centerGapChance
  ) {

    const choices =
      gbShuffleArray(
        [4, 5]
      );

    for (
      const patchIndex
      of choices
    ) {

      if (
        patchIndex ===
        currentPatch
      ) {
        continue;
      }

      const candidate =
        gbRandomWater(
          patchIndex
        );

      if (candidate) {
        return candidate;
      }
    }
  }


  if (
    random() <
    GREBE_CONFIG.crossLilyChance
  ) {

    let choices = [];

    if (
      currentPatch === 0
    ) {
      choices = [
        1,
        2
      ];
    }

    else if (
      currentPatch === 1 ||
      currentPatch === 2
    ) {
      choices = [0];
    }

    else if (
      currentPatch === 3
    ) {
      choices = [
        0,
        5
      ];
    }

    for (
      const patchIndex
      of choices
    ) {

      const candidate =
        gbRandomWater(
          patchIndex
        );

      if (candidate) {
        return candidate;
      }
    }
  }


  const choices =
    gbShuffleArray(
      [0, 1, 2, 3, 4, 5]
    );

  for (
    const patchIndex
    of choices
  ) {

    if (
      patchIndex ===
      currentPatch
    ) {
      continue;
    }

    const candidate =
      gbRandomWater(
        patchIndex
      );

    if (candidate) {
      return candidate;
    }
  }

  return null;
}


// =====================================================
// 家庭
// =====================================================

function gbFamilyChicks(
  adultIndex
) {

  return gbChicks.filter(
    chick =>
      chick.parentIndex ===
      adultIndex
  );
}


function gbScheduleFamilyDive(
  parent,
  destination
) {

  const family =
    gbFamilyChicks(
      parent.birdIndex
    );

  for (
    let i = 0;
    i < family.length;
    i++
  ) {

    const chick =
      family[i];

    const delayIndex =
      min(
        i,
        GREBE_CONFIG.familyDiveDelays.length - 1
      );

    chick.familyDiveTimer =
      GREBE_CONFIG.familyDiveDelays[
        delayIndex
      ];

    chick.familyDiveDestination = {
      px:
        destination.px,

      py:
        destination.py
    };
  }
}


// =====================================================
// 家长附近
// =====================================================

function gbNearParent(
  chick
) {

  const parent =
    gbAdults[
      chick.parentIndex
    ];

  const heading =
    parent.lastHeading;

  const spacing =
    GREBE_CONFIG.followSpacingPixels[
      chick.familyOrder %
      GREBE_CONFIG.followSpacingPixels.length
    ];

  const side =
    GREBE_CONFIG.followSideOffsets[
      chick.familyOrder %
      GREBE_CONFIG.followSideOffsets.length
    ];

  const preferred = {

    px:
      parent.px -
      cos(heading) *
      spacing -
      sin(heading) *
      side,

    py:
      parent.py -
      sin(heading) *
      spacing +
      cos(heading) *
      side
  };

  if (
    gbSafeWater(
      preferred.px,
      preferred.py
    )
  ) {
    return preferred;
  }

  for (
    let radius = 22;
    radius <= 58;
    radius += 6
  ) {

    for (
      let i = 0;
      i < 16;
      i++
    ) {

      const angleValue =
        i *
        TWO_PI /
        16;

      const candidate = {

        px:
          parent.px +
          cos(angleValue) *
          radius,

        py:
          parent.py +
          sin(angleValue) *
          radius
      };

      if (
        gbSafeWater(
          candidate.px,
          candidate.py
        )
      ) {
        return candidate;
      }
    }
  }

  return {
    px:
      parent.px,

    py:
      parent.py
  };
}


// =====================================================
// 延迟跟随
// =====================================================

function gbDelayedTarget(
  chick
) {

  const parent =
    gbAdults[
      chick.parentIndex
    ];

  const delay =
    GREBE_CONFIG.followDelaySeconds[
      chick.familyOrder %
      GREBE_CONFIG.followDelaySeconds.length
    ];

  const spacing =
    GREBE_CONFIG.followSpacingPixels[
      chick.familyOrder %
      GREBE_CONFIG.followSpacingPixels.length
    ];

  const side =
    GREBE_CONFIG.followSideOffsets[
      chick.familyOrder %
      GREBE_CONFIG.followSideOffsets.length
    ];

  const wantedTime =
    gbClock -
    delay;

  for (
    let i =
      parent.trail.length - 1;
    i >= 0;
    i--
  ) {

    const sample =
      parent.trail[i];

    if (
      sample.stamp <=
      wantedTime
    ) {

      const candidate = {

        px:
          sample.px -
          cos(sample.heading) *
          spacing *
          0.35 -
          sin(sample.heading) *
          side,

        py:
          sample.py -
          sin(sample.heading) *
          spacing *
          0.35 +
          cos(sample.heading) *
          side
      };

      if (
        gbSafeWater(
          candidate.px,
          candidate.py
        )
      ) {
        return candidate;
      }

      if (
        gbSafeWater(
          sample.px,
          sample.py
        )
      ) {

        return {
          px:
            sample.px,

          py:
            sample.py
        };
      }
    }
  }

  return gbNearParent(
    chick
  );
}


// =====================================================
// 涟漪
// =====================================================

function gbCreateRipple(
  px,
  py,
  intensity = 1
) {

  if (
    !GREBE_CONFIG.rippleEnabled
  ) {
    return;
  }

  for (
    let i = 0;
    i < GREBE_CONFIG.rippleRingCount;
    i++
  ) {

    gbRipples.push({

      px,
      py,

      age:
        -i *
        GREBE_CONFIG.rippleRingDelay,

      intensity
    });
  }
}


// =====================================================
// 水花
// =====================================================

function gbCreateSplashDrops(
  px,
  py,
  intensity = 1
) {

  if (
    !GREBE_CONFIG.splashDropsEnabled
  ) {
    return;
  }

  for (
    let i = 0;
    i < GREBE_CONFIG.splashDropCount;
    i++
  ) {

    const angleValue =
      random(
        PI + 0.25,
        TWO_PI - 0.25
      );

    const speedValue =
      gbRange(
        GREBE_CONFIG.splashDropSpeed
      ) *
      intensity;

    gbSplashDrops.push({

      px:
        px +
        random(
          -4,
          4
        ),

      py:
        py +
        random(
          -2,
          2
        ),

      vx:
        cos(angleValue) *
        speedValue,

      vy:
        sin(angleValue) *
        speedValue *
        0.7,

      size:
        gbRange(
          GREBE_CONFIG.splashDropSize
        ),

      age: 0,

      life:
        GREBE_CONFIG.splashDropLife *
        random(
          0.75,
          1.15
        )
    });
  }
}


function gbCreateWaterDisturbance(
  px,
  py,
  intensity = 1
) {

  gbCreateRipple(
    px,
    py,
    intensity
  );

  gbCreateSplashDrops(
    px,
    py,
    intensity
  );
}


// =====================================================
// 水下轨迹
// =====================================================

function gbAddUnderwaterTrail(
  bird
) {

  if (
    !GREBE_CONFIG.underwaterTrailEnabled
  ) {
    return;
  }

  gbUnderwaterTrails.push({

    px:
      bird.px,

    py:
      bird.py,

    age: 0,

    isChick:
      bird.isChick
  });
}


// =====================================================
// 特效更新
// =====================================================

function gbUpdateEffects(
  dt
) {

  for (
    const ripple
    of gbRipples
  ) {
    ripple.age += dt;
  }

  gbRipples =
    gbRipples.filter(
      ripple =>
        ripple.age <
        GREBE_CONFIG.rippleLife
    );


  for (
    const drop
    of gbSplashDrops
  ) {

    drop.age += dt;

    drop.px +=
      drop.vx *
      dt;

    drop.py +=
      drop.vy *
      dt;

    drop.vy +=
      55 *
      dt;
  }

  gbSplashDrops =
    gbSplashDrops.filter(
      drop =>
        drop.age <
        drop.life
    );


  for (
    const trail
    of gbUnderwaterTrails
  ) {
    trail.age += dt;
  }

  gbUnderwaterTrails =
    gbUnderwaterTrails.filter(
      trail =>
        trail.age <
        GREBE_CONFIG.underwaterTrailLife
    );
}


// =====================================================
// 水下轨迹绘制
// =====================================================

function gbDrawUnderwaterTrails() {

  if (
    !GREBE_CONFIG.underwaterTrailEnabled
  ) {
    return;
  }

  noStroke();

  for (
    const trail
    of gbUnderwaterTrails
  ) {

    if (
      !gbWaterVisibleAt(
        trail.px,
        trail.py
      )
    ) {
      continue;
    }

    const t =
      constrain(
        trail.age /
        GREBE_CONFIG.underwaterTrailLife,
        0,
        1
      );

    const baseDiameter =
      trail.isChick
        ? GREBE_CONFIG.chickDiameter
        : GREBE_CONFIG.adultDiameter;

    const trailPaint =
      color(
        trail.isChick
          ? GREBE_CONFIG.underwaterChickColor
          : GREBE_CONFIG.underwaterAdultColor
      );

    trailPaint.setAlpha(
      GREBE_CONFIG.underwaterTrailOpacity *
      (1 - t)
    );

    fill(
      trailPaint
    );

    circle(
      trail.px,
      trail.py,

      baseDiameter *
      GREBE_CONFIG.underwaterTrailScale *
      (1 - t * 0.35)
    );
  }
}


// =====================================================
// 涟漪绘制
// ★ 荷叶 / 荷花遮挡
// =====================================================

function gbDrawRipples() {

  if (
    !GREBE_CONFIG.rippleEnabled
  ) {
    return;
  }

  noFill();

  const segmentCount =
    GREBE_CONFIG.rippleMaskSegments;

  for (
    const ripple
    of gbRipples
  ) {

    if (
      ripple.age < 0
    ) {
      continue;
    }

    const t =
      constrain(
        ripple.age /
        GREBE_CONFIG.rippleLife,
        0,
        1
      );

    const radiusValue =
      lerp(
        GREBE_CONFIG.rippleStartRadius,

        GREBE_CONFIG.rippleMaxRadius *
        ripple.intensity,

        t
      );

    const fadeValue =
      pow(
        1 - t,
        GREBE_CONFIG.rippleFadePower
      );

    const ripplePaint =
      color(
        GREBE_CONFIG.rippleColor
      );

    ripplePaint.setAlpha(
      GREBE_CONFIG.rippleOpacity *
      ripple.intensity *
      fadeValue
    );

    stroke(
      ripplePaint
    );

    strokeWeight(
      lerp(
        GREBE_CONFIG.rippleStartWeight,
        GREBE_CONFIG.rippleEndWeight,
        t
      )
    );

    const radiusX =
      radiusValue;

    const radiusY =
      radiusValue *
      GREBE_CONFIG.rippleVerticalScale;

    let drawingSegment =
      false;

    for (
      let i = 0;
      i <= segmentCount;
      i++
    ) {

      const angleValue =
        i /
        segmentCount *
        TWO_PI;

      const sampleX =
        ripple.px +
        cos(angleValue) *
        radiusX;

      const sampleY =
        ripple.py +
        sin(angleValue) *
        radiusY;

      const visible =
        gbWaterVisibleAt(
          sampleX,
          sampleY
        );

      if (visible) {

        if (
          !drawingSegment
        ) {

          beginShape();

          drawingSegment =
            true;
        }

        vertex(
          sampleX,
          sampleY
        );

      } else if (
        drawingSegment
      ) {

        endShape();

        drawingSegment =
          false;
      }
    }

    if (
      drawingSegment
    ) {
      endShape();
    }
  }
}


// =====================================================
// 水花绘制
// =====================================================

function gbDrawSplashDrops() {

  if (
    !GREBE_CONFIG.splashDropsEnabled
  ) {
    return;
  }

  noStroke();

  for (
    const drop
    of gbSplashDrops
  ) {

    const t =
      constrain(
        drop.age /
        drop.life,
        0,
        1
      );

    const dropPaint =
      color(
        GREBE_CONFIG.rippleColor
      );

    dropPaint.setAlpha(
      GREBE_CONFIG.splashDropOpacity *
      (1 - t)
    );

    fill(
      dropPaint
    );

    ellipse(
      drop.px,
      drop.py,
      drop.size,
      drop.size * 1.7
    );
  }
}


// =====================================================
// 调试水域
// =====================================================

function gbDrawAreas() {

  push();

  stroke(
    40,
    230,
    210
  );

  strokeWeight(2);

  fill(
    40,
    230,
    210,
    55
  );

  for (
    const polygon
    of gbOuterPatches
  ) {

    beginShape();

    for (
      const item
      of polygon
    ) {

      vertex(
        item.px,
        item.py
      );
    }

    endShape(CLOSE);
  }


  stroke(255);

  strokeWeight(3);

  fill(
    255,
    255,
    255,
    100
  );

  for (
    const polygon
    of gbCenterPatches
  ) {

    beginShape();

    for (
      const item
      of polygon
    ) {

      vertex(
        item.px,
        item.py
      );
    }

    endShape(CLOSE);
  }

  pop();
}


// =====================================================
// GREBE DOT
// =====================================================

class GrebeDot {

  constructor(
    settings,
    isChick,
    birdIndex
  ) {

    this.px =
      settings.x /
      100 *
      width;

    this.py =
      settings.y /
      100 *
      height;

    this.isChick =
      isChick;

    this.birdIndex =
      birdIndex;

    this.parentIndex =
      isChick
        ? (
            settings.parentIndex ??
            0
          )
        : -1;

    this.familyOrder = 0;


    if (isChick) {

      for (
        let i = 0;
        i < birdIndex;
        i++
      ) {

        const previous =
          GREBE_CONFIG.chickStarts[i];

        if (
          (
            previous.parentIndex ??
            0
          ) ===
          this.parentIndex
        ) {
          this.familyOrder++;
        }
      }
    }


    if (
      !gbSafeWater(
        this.px,
        this.py
      )
    ) {

      throw new Error(
        (
          isChick
            ? "幼鸟"
            : "成鸟"
        ) +
        (birdIndex + 1) +
        "的初始位置不在允许水域内"
      );
    }


    this.vx = 0;
    this.vy = 0;

    this.lastHeading =
      random(
        TWO_PI
      );

    this.speedValue =
      isChick
        ? GREBE_CONFIG.chickSpeed
        : GREBE_CONFIG.adultSpeed;

    this.targetX =
      this.px;

    this.targetY =
      this.py;

    this.pauseRemaining = 0;

    this.state =
      "surface";

    this.phaseElapsed = 0;

    this.diveRemaining =
      isChick
        ? 999999
        : gbRange(
            GREBE_CONFIG.firstDiveDelay
          );

    this.diveStartX =
      this.px;

    this.diveStartY =
      this.py;

    this.diveEndX =
      this.px;

    this.diveEndY =
      this.py;

    this.hiddenDuration = 2;

    this.displayScale = 1;

    this.trail = [];

    this.familyDiveTimer =
      -1;

    this.familyDiveDestination =
      null;

    this.underwaterTrailTimer =
      0;
  }


  rememberPosition() {

    if (
      this.state !==
      "surface"
    ) {
      return;
    }

    this.trail.push({

      px:
        this.px,

      py:
        this.py,

      heading:
        this.lastHeading,

      stamp:
        gbClock
    });

    this.trail =
      this.trail.filter(
        sample =>
          gbClock -
          sample.stamp <
          10
      );
  }


  chooseSwimTarget(
    maxRoam = null
  ) {

    const currentPatch =
      gbPatchAt(
        this.px,
        this.py
      );

    if (
      currentPatch < 0
    ) {

      this.targetX =
        this.px;

      this.targetY =
        this.py;

      return;
    }

    const minimumDistance =
      maxRoam === null
        ? GREBE_CONFIG.swimTravelPixels[0]
        : 4;

    const maximumDistance =
      maxRoam === null
        ? GREBE_CONFIG.swimTravelPixels[1]
        : maxRoam;

    for (
      let attempt = 0;
      attempt < 50;
      attempt++
    ) {

      const angleValue =
        random(
          TWO_PI
        );

      const travel =
        random(
          minimumDistance,
          maximumDistance
        );

      const candidateX =
        this.px +
        cos(angleValue) *
        travel;

      const candidateY =
        this.py +
        sin(angleValue) *
        travel;

      if (
        gbClearRoute(
          this.px,
          this.py,
          candidateX,
          candidateY
        )
      ) {

        this.targetX =
          candidateX;

        this.targetY =
          candidateY;

        return;
      }
    }

    this.targetX =
      this.px;

    this.targetY =
      this.py;
  }


  advance(
    dt
  ) {

    if (
      this.state !==
      "surface"
    ) {

      this.advanceDive(
        dt
      );

      return;
    }


    if (
      this.isChick
    ) {

      this.updateFamilyDive(
        dt
      );

      if (
        this.state !==
        "surface"
      ) {
        return;
      }

      this.updateFollowing();
    }


    else {

      this.diveRemaining -=
        dt;

      if (
        this.diveRemaining <=
        0
      ) {

        const underwaterAdults =
          gbAdults.filter(
            adult =>
              adult.state !==
              "surface"
          ).length;

        if (
          underwaterAdults <
          GREBE_CONFIG.maxAdultsUnderwater
        ) {

          const destination =
            gbFindDiveTarget(
              this
            );

          if (
            destination
          ) {

            const family =
              gbFamilyChicks(
                this.birdIndex
              );

            if (
              family.length > 0
            ) {

              gbScheduleFamilyDive(
                this,
                destination
              );
            }

            this.beginDive(
              destination
            );

            return;
          }
        }

        this.diveRemaining =
          2;
      }
    }


    this.pauseRemaining =
      max(
        0,
        this.pauseRemaining -
        dt
      );


    const dx =
      this.targetX -
      this.px;

    const dy =
      this.targetY -
      this.py;

    const targetDistance =
      Math.hypot(
        dx,
        dy
      );

    let desiredX = 0;
    let desiredY = 0;


    if (
      this.pauseRemaining <= 0 &&
      targetDistance > 2
    ) {

      let speedNow =
        min(
          this.speedValue,
          targetDistance *
          2.2
        );


      if (
        this.isChick
      ) {

        const parent =
          gbAdults[
            this.parentIndex
          ];

        const parentDistance =
          Math.hypot(
            parent.px -
            this.px,
            parent.py -
            this.py
          );

        if (
          parentDistance >
          GREBE_CONFIG.chickCatchupStart
        ) {
          speedNow *=
            1.18;
        }

        if (
          parentDistance >
          GREBE_CONFIG.chickCatchupStrong
        ) {
          speedNow *=
            1.28;
        }
      }


      desiredX =
        dx /
        targetDistance *
        speedNow;

      desiredY =
        dy /
        targetDistance *
        speedNow;
    }


    else if (
      targetDistance <= 2 &&
      this.pauseRemaining <= 0
    ) {

      if (
        !this.isChick
      ) {

        const currentPatch =
          gbPatchAt(
            this.px,
            this.py
          );

        if (
          gbIsCenterPatch(
            currentPatch
          )
        ) {

          this.chooseSwimTarget(
            18
          );

        } else {

          this.chooseSwimTarget();
        }

        this.pauseRemaining =
          gbRange(
            GREBE_CONFIG.pauseSeconds
          );
      }
    }


    if (
      !this.isChick
    ) {

      const avoidance =
        gbAdultAvoidance(
          this
        );

      desiredX +=
        avoidance.x;

      desiredY +=
        avoidance.y;

      const desiredMagnitude =
        Math.hypot(
          desiredX,
          desiredY
        );

      const maximumAvoidSpeed =
        this.speedValue *
        1.35;

      if (
        desiredMagnitude >
        maximumAvoidSpeed
      ) {

        desiredX =
          desiredX /
          desiredMagnitude *
          maximumAvoidSpeed;

        desiredY =
          desiredY /
          desiredMagnitude *
          maximumAvoidSpeed;
      }
    }


    const blendValue =
      1 -
      Math.exp(
        -dt /
        GREBE_CONFIG.steeringSeconds
      );

    this.vx =
      lerp(
        this.vx,
        desiredX,
        blendValue
      );

    this.vy =
      lerp(
        this.vy,
        desiredY,
        blendValue
      );


    const nextX =
      this.px +
      this.vx *
      dt;

    const nextY =
      this.py +
      this.vy *
      dt;


    if (
      gbClearRoute(
        this.px,
        this.py,
        nextX,
        nextY
      )
    ) {

      this.px =
        nextX;

      this.py =
        nextY;

      if (
        Math.hypot(
          this.vx,
          this.vy
        ) >
        0.5
      ) {

        this.lastHeading =
          Math.atan2(
            this.vy,
            this.vx
          );
      }

    } else {

      this.vx = 0;
      this.vy = 0;

      if (
        !this.isChick
      ) {

        const currentPatch =
          gbPatchAt(
            this.px,
            this.py
          );

        if (
          gbIsCenterPatch(
            currentPatch
          )
        ) {

          this.chooseSwimTarget(
            16
          );

        } else {

          this.chooseSwimTarget();
        }

      } else {

        const target =
          gbNearParent(
            this
          );

        this.targetX =
          target.px;

        this.targetY =
          target.py;
      }
    }
  }


  updateFamilyDive(
    dt
  ) {

    if (
      this.familyDiveTimer < 0 ||
      !this.familyDiveDestination
    ) {
      return;
    }

    this.familyDiveTimer -=
      dt;

    if (
      this.familyDiveTimer > 0
    ) {
      return;
    }

    const destination = {

      px:
        this.familyDiveDestination.px,

      py:
        this.familyDiveDestination.py
    };

    const angleValue =
      this.familyOrder *
      TWO_PI /
      3;

    const radiusValue =
      9 +
      this.familyOrder *
      3;

    const shifted = {

      px:
        destination.px +
        cos(angleValue) *
        radiusValue,

      py:
        destination.py +
        sin(angleValue) *
        radiusValue
    };

    if (
      gbSafeWater(
        shifted.px,
        shifted.py
      )
    ) {

      destination.px =
        shifted.px;

      destination.py =
        shifted.py;
    }

    this.familyDiveTimer =
      -1;

    this.familyDiveDestination =
      null;

    this.beginDive(
      destination
    );
  }


  updateFollowing() {

    const parent =
      gbAdults[
        this.parentIndex
      ];

    if (
      parent.state !==
      "surface"
    ) {

      this.vx *=
        0.96;

      this.vy *=
        0.96;

      return;
    }

    const parentPatch =
      gbPatchAt(
        parent.px,
        parent.py
      );

    const chickPatch =
      gbPatchAt(
        this.px,
        this.py
      );

    if (
      parentPatch ===
      chickPatch
    ) {

      const delayed =
        gbDelayedTarget(
          this
        );

      if (
        gbClearRoute(
          this.px,
          this.py,
          delayed.px,
          delayed.py
        )
      ) {

        this.targetX =
          delayed.px;

        this.targetY =
          delayed.py;

        return;
      }

      const nearby =
        gbNearParent(
          this
        );

      this.targetX =
        nearby.px;

      this.targetY =
        nearby.py;

      return;
    }

    const rescueTarget =
      gbNearParent(
        this
      );

    this.beginDive(
      rescueTarget
    );
  }


  beginDive(
    destination
  ) {

    this.state =
      "submerge";

    this.phaseElapsed =
      0;

    this.displayScale =
      1;

    this.diveStartX =
      this.px;

    this.diveStartY =
      this.py;

    this.diveEndX =
      destination.px;

    this.diveEndY =
      destination.py;

    const travelDistance =
      Math.hypot(
        this.diveEndX -
        this.diveStartX,

        this.diveEndY -
        this.diveStartY
      );

    this.hiddenDuration =
      constrain(
        travelDistance /
        GREBE_CONFIG.underwaterSpeed,

        GREBE_CONFIG.underwaterSeconds[0],

        GREBE_CONFIG.underwaterSeconds[1]
      );

    this.vx = 0;
    this.vy = 0;

    this.underwaterTrailTimer =
      0;


    let disturbanceStrength =
      GREBE_CONFIG.diveRippleIntensity;

    if (
      this.isChick
    ) {

      disturbanceStrength *=
        GREBE_CONFIG.chickRippleScale;
    }

    gbCreateWaterDisturbance(
      this.px,
      this.py,
      disturbanceStrength
    );
  }


  advanceDive(
    dt
  ) {

    this.phaseElapsed +=
      dt;


    if (
      this.state ===
      "submerge"
    ) {

      const t =
        constrain(
          this.phaseElapsed /
          GREBE_CONFIG.submergeSeconds,
          0,
          1
        );

      this.displayScale =
        lerp(
          1,
          GREBE_CONFIG.underwaterScale,
          t
        );

      if (
        t >= 1
      ) {

        this.state =
          "underwater";

        this.phaseElapsed =
          0;

        this.displayScale =
          GREBE_CONFIG.underwaterScale;
      }

      return;
    }


    if (
      this.state ===
      "underwater"
    ) {

      const t =
        constrain(
          this.phaseElapsed /
          this.hiddenDuration,
          0,
          1
        );

      const smoothT =
        t *
        t *
        (3 - 2 * t);

      this.px =
        lerp(
          this.diveStartX,
          this.diveEndX,
          smoothT
        );

      this.py =
        lerp(
          this.diveStartY,
          this.diveEndY,
          smoothT
        );


      this.underwaterTrailTimer +=
        dt;

      if (
        this.underwaterTrailTimer >=
        GREBE_CONFIG.underwaterTrailInterval
      ) {

        this.underwaterTrailTimer =
          0;

        gbAddUnderwaterTrail(
          this
        );
      }


      if (
        t >= 1
      ) {

        this.state =
          "emerge";

        this.phaseElapsed =
          0;

        let disturbanceStrength =
          GREBE_CONFIG.emergeRippleIntensity;

        if (
          this.isChick
        ) {

          disturbanceStrength *=
            GREBE_CONFIG.chickRippleScale;
        }

        gbCreateWaterDisturbance(
          this.px,
          this.py,
          disturbanceStrength
        );
      }

      return;
    }


    if (
      this.state ===
      "emerge"
    ) {

      const t =
        constrain(
          this.phaseElapsed /
          GREBE_CONFIG.emergeSeconds,
          0,
          1
        );

      this.displayScale =
        lerp(
          GREBE_CONFIG.underwaterScale,
          1,
          t
        );

      if (
        t >= 1
      ) {

        this.state =
          "surface";

        this.displayScale =
          1;

        this.vx = 0;
        this.vy = 0;

        this.targetX =
          this.px;

        this.targetY =
          this.py;


        if (
          !this.isChick
        ) {

          this.diveRemaining =
            gbRange(
              GREBE_CONFIG.diveInterval
            );

          const currentPatch =
            gbPatchAt(
              this.px,
              this.py
            );

          if (
            gbIsCenterPatch(
              currentPatch
            )
          ) {

            this.chooseSwimTarget(
              17
            );

          } else {

            this.chooseSwimTarget();
          }

          this.trail =
            [];

          this.rememberPosition();

        } else {

          const parent =
            gbAdults[
              this.parentIndex
            ];

          if (
            parent.state ===
            "surface"
          ) {

            const target =
              gbNearParent(
                this
              );

            this.targetX =
              target.px;

            this.targetY =
              target.py;
          }
        }
      }
    }
  }


  // ===================================================
  // ★★★★★ 粒子绘制 ★★★★★
  //
  // 这里加入：
  // - 大粒子独立轮廓颜色
  // - 大粒子独立轮廓粗细
  // - 小粒子独立轮廓颜色
  // - 小粒子独立轮廓粗细
  // ===================================================

  render() {

    if (
      this.state ===
      "underwater" &&
      !gbWaterVisibleAt(
        this.px,
        this.py
      )
    ) {
      return;
    }


    const diameterValue =
      this.isChick
        ? GREBE_CONFIG.chickDiameter
        : GREBE_CONFIG.adultDiameter;


    const underwater =
      this.state ===
      "underwater";


    const birdPaint =
      color(
        underwater
          ? (
              this.isChick
                ? GREBE_CONFIG.underwaterChickColor
                : GREBE_CONFIG.underwaterAdultColor
            )
          : (
              this.isChick
                ? GREBE_CONFIG.chickColor
                : GREBE_CONFIG.adultColor
            )
      );


    let alphaValue =
      GREBE_CONFIG.dotOpacity;


    if (
      underwater
    ) {

      alphaValue =
        GREBE_CONFIG.underwaterOpacity;
    }


    else if (
      this.state ===
      "submerge"
    ) {

      const t =
        constrain(
          this.phaseElapsed /
          GREBE_CONFIG.submergeSeconds,
          0,
          1
        );

      alphaValue =
        lerp(
          GREBE_CONFIG.dotOpacity,
          GREBE_CONFIG.underwaterOpacity,
          t
        );
    }


    else if (
      this.state ===
      "emerge"
    ) {

      const t =
        constrain(
          this.phaseElapsed /
          GREBE_CONFIG.emergeSeconds,
          0,
          1
        );

      alphaValue =
        lerp(
          GREBE_CONFIG.underwaterOpacity,
          GREBE_CONFIG.dotOpacity,
          t
        );
    }


    birdPaint.setAlpha(
      alphaValue
    );


    // =================================================
    // ★ 轮廓
    // =================================================

    const outlinePaint =
      color(
        this.isChick
          ? GREBE_CONFIG.chickStrokeColor
          : GREBE_CONFIG.adultStrokeColor
      );


    // 下潜时轮廓也一起变淡
    outlinePaint.setAlpha(
      alphaValue
    );


    stroke(
      outlinePaint
    );


    strokeWeight(
      this.isChick
        ? GREBE_CONFIG.chickStrokeWeight
        : GREBE_CONFIG.adultStrokeWeight
    );


    // =================================================
    // 填充
    // =================================================

    fill(
      birdPaint
    );


    circle(
      this.px,
      this.py,

      diameterValue *
      this.displayScale
    );
  }
}