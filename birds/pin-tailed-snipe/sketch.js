// ============================================================
// 针尾沙锥 · p5.js 2.3.4
// 8只圆点：慢走、探食、短飞、左右飞入和飞离
//
// 修改：
// 1. 画布始终等于整个预览界面
// 2. 不再出现画布外黑边
// 3. 背景保持16:9比例，以 cover 方式铺满
// 4. 粒子坐标与背景同步缩放、裁切
// ============================================================

const SNIPE_CFG = {
  imageFile: "针尾沙锥16：9.png",

  referenceWidth: 1600,
  referenceHeight: 900,

  count: 8,

  initialPositions: [
    [12, 51],
    [23, 60],
    [29, 64],
    [16, 84],
    [39, 89],
    [19, 16],
    [7, 35],
    [35, 76]
  ],

  diameter: 25,

  farScale: 0.72,
  nearScale: 1.12,

  individualSize: [0.94, 1.06],

  colors: [
    "#796044",
    "#92734E",
    "#66523C"
  ],

  outlineColor: "#E1CAA1",
  outlineWidth: 1.1,
  opacity: 245,

  minimumGap: 12,
  edgeMargin: 5,

  walkSpeed: [9, 17],
  walkDuration: [3, 7],

  directionDuration: [2.5, 5.5],

  turnAngle: 0.65,
  turnResponse: 2.8,
  acceleration: 3.2,

  depthMovement: 0.55,

  restDuration: [2.5, 6],
  restSway: 0.35,
  restSwayFrequency: 0.45,

  feedingChance: 0.8,

  feedingDuration: [3, 6],

  probeInterval: [0.65, 1.5],
  probeDuration: 0.32,
  probeDepth: 2.5,

  flightEnabled: true,

  firstFlightAfter: 10,

  flightInterval: [12, 22],

  flightRetryAfter: 2,

  flightDuration: [1.5, 2.3],

  flightHeight: [75, 135],

  flightDistance: [200, 650],

  landingRest: [1.2, 2.5],

  edgeFlightEnabled: true,

  firstExitAfter: 5,

  exitInterval: [20, 34],

  outsideDuration: [3, 6],

  maxOutside: 2,

  edgeFlySpeed: [340, 460],

  edgeDuration: [1.2, 4.8],

  edgeFlightHeight: [55, 105],

  edgeHeightPercent: [18, 58],

  outsideMargin: 70,

  alternateSides: true,

  returnOppositeChance: 0.5,

  shadowEnabled: true,

  shadowOpacity: 48,

  shadowWidth: 0.9,

  shadowHeight: 0.22,

  mudPolygon: [
    [2, 3],
    [37, 3],
    [37, 10],
    [31, 13],
    [29, 20],
    [23, 22],
    [14, 25],
    [10, 29],
    [10, 37],
    [15, 42],
    [25, 43],
    [30, 48],
    [35, 50],
    [37, 56],
    [48, 59],
    [50, 62],
    [46, 66],
    [43, 74],
    [43, 82],
    [46, 91],
    [48, 97],
    [2, 97]
  ],

  showArea: false,
  showState: false,

  randomSeed: 24
};


// ============================================================
// 全局
// ============================================================

let snBackground;

let snBirds = [];

let snArea = [];

let snReady = false;

let snClock = 0;

let snFlightTimer = 0;

let snExitTimer = 0;

let snNextExitSide = "left";


// ============================================================
// 初始化
// ============================================================

async function setup() {

  createCanvas(
    windowWidth,
    windowHeight
  );

  pixelDensity(1);

  noLoop();

  try {

    snBackground =
      await loadImage(
        SNIPE_CFG.imageFile
      );

  } catch (snError) {

    background("#EEE9DE");

    fill("#4A4035");

    noStroke();

    textSize(18);

    textAlign(
      CENTER,
      CENTER
    );

    text(
      "图片加载失败，请检查文件名：\n" +
      SNIPE_CFG.imageFile,
      width / 2,
      height / 2
    );

    console.error(snError);

    return;
  }


  randomSeed(
    SNIPE_CFG.randomSeed
  );


  snArea =
    SNIPE_CFG.mudPolygon.map(
      snPair => ({
        x:
          snPair[0] *
          SNIPE_CFG.referenceWidth /
          100,

        y:
          snPair[1] *
          SNIPE_CFG.referenceHeight /
          100
      })
    );


  for (
    let snIndex = 0;
    snIndex < SNIPE_CFG.count;
    snIndex++
  ) {

    const snBird =
      new SnBird(snIndex);

    const snInitial =
      SNIPE_CFG.initialPositions[
        snIndex
      ];


    let snPlace =
      snInitial
        ? {
            x:
              snInitial[0] *
              SNIPE_CFG.referenceWidth /
              100,

            y:
              snInitial[1] *
              SNIPE_CFG.referenceHeight /
              100
          }
        : null;


    if (
      !snPlace ||
      !snGroundClear(
        snBird,
        snPlace.x,
        snPlace.y
      )
    ) {

      snPlace =
        snFindPlace(snBird);
    }


    if (snPlace) {

      snBird.x =
        snPlace.x;

      snBird.y =
        snPlace.y;

      snBirds.push(
        snBird
      );
    }
  }


  snFlightTimer =
    SNIPE_CFG.firstFlightAfter;

  snExitTimer =
    SNIPE_CFG.firstExitAfter;

  snReady = true;

  loop();
}


// ============================================================
// Cover布局
// ============================================================

function snGetView() {

  const snScale =
    Math.max(
      width /
      SNIPE_CFG.referenceWidth,

      height /
      SNIPE_CFG.referenceHeight
    );


  const snDrawWidth =
    SNIPE_CFG.referenceWidth *
    snScale;


  const snDrawHeight =
    SNIPE_CFG.referenceHeight *
    snScale;


  return {

    scale: snScale,

    x:
      (width -
      snDrawWidth) /
      2,

    y:
      (height -
      snDrawHeight) /
      2,

    w: snDrawWidth,

    h: snDrawHeight
  };
}


// ============================================================
// 主循环
// ============================================================

function draw() {

  if (!snReady) return;


  const snDt =
    Math.min(
      deltaTime / 1000,
      0.04
    );


  snClock += snDt;


  for (
    const snBird of
    snBirds
  ) {

    snBird.update(snDt);
  }


  snScheduleFlights(snDt);


  const snView =
    snGetView();


  // 背景直接铺满整个画布
  image(
    snBackground,

    snView.x,
    snView.y,

    snView.w,
    snView.h
  );


  push();


  translate(
    snView.x,
    snView.y
  );


  scale(
    snView.scale
  );


  if (
    SNIPE_CFG.showArea
  ) {

    fill(
      80,
      180,
      220,
      35
    );

    stroke(
      70,
      180,
      220,
      180
    );

    strokeWeight(1);


    beginShape();


    for (
      const snVertex of
      snArea
    ) {

      vertex(
        snVertex.x,
        snVertex.y
      );
    }


    endShape(CLOSE);
  }


  const snOrdered =
    snBirds
      .filter(
        snBird =>
          snBird.mode !==
          "outside"
      )
      .sort(
        (snA, snB) => {

          const snLayerA =
            snA.flight
              ? 1
              : 0;

          const snLayerB =
            snB.flight
              ? 1
              : 0;


          return (
            snLayerA -
            snLayerB ||
            snA.y -
            snB.y
          );
        }
      );


  for (
    const snBird of
    snOrdered
  ) {

    snBird.display();
  }


  pop();
}


// ============================================================
// 飞行调度
// ============================================================

function snScheduleFlights(
  snDt
) {

  snFlightTimer -= snDt;

  snExitTimer -= snDt;


  if (
    snBirds.some(
      snBird =>
        snBird.flight
    )
  ) {

    return;
  }


  const snReturning =
    snBirds.find(
      snBird =>
        snBird.mode ===
          "outside" &&
        snBird.outsideTimer <= 0
    );


  if (snReturning) {

    if (
      !snTryEnter(
        snReturning
      )
    ) {

      snReturning.outsideTimer =
        SNIPE_CFG.flightRetryAfter;
    }

    return;
  }


  const snOutsideCount =
    snBirds.filter(
      snBird =>
        snBird.mode ===
        "outside"
    ).length;


  if (
    SNIPE_CFG.edgeFlightEnabled &&
    snExitTimer <= 0 &&
    snOutsideCount <
      SNIPE_CFG.maxOutside
  ) {

    const snStarted =
      snTryExit();


    snExitTimer =
      snStarted
        ? snRange(
            SNIPE_CFG.exitInterval
          )
        : SNIPE_CFG.flightRetryAfter;


    if (snStarted) return;
  }


  if (
    SNIPE_CFG.flightEnabled &&
    snFlightTimer <= 0
  ) {

    const snStarted =
      snTryLocalFlight();


    snFlightTimer =
      snStarted
        ? snRange(
            SNIPE_CFG.flightInterval
          )
        : SNIPE_CFG.flightRetryAfter;
  }
}


// ============================================================
// 鸟
// ============================================================

class SnBird {

  constructor(snIndex) {

    this.id =
      snIndex;

    this.x = 0;

    this.y = 0;


    this.sizeFactor =
      snRange(
        SNIPE_CFG.individualSize
      );


    this.col =
      SNIPE_CFG.colors[
        snIndex %
        SNIPE_CFG.colors.length
      ];


    this.heading =
      random(TWO_PI);


    this.targetHeading =
      this.heading;


    this.speed = 0;


    this.cruiseSpeed =
      snRange(
        SNIPE_CFG.walkSpeed
      );


    this.turnTimer =
      snRange(
        SNIPE_CFG.directionDuration
      );


    this.phase =
      random(TWO_PI);


    this.mode =
      snIndex % 3 === 0
        ? "feed"
        : "walk";


    this.modeTimer =
      snRange(
        this.mode === "walk"
          ? SNIPE_CFG.walkDuration
          : SNIPE_CFG.feedingDuration
      );


    this.probeTimer =
      random(
        0.2,
        1.2
      );


    this.probeElapsed =
      -1;


    this.offsetY = 0;


    this.blockedTime = 0;


    this.flight = null;


    this.outsideTimer = 0;


    this.returnSide =
      "left";
  }


  diameterAt(snY) {

    return (
      SNIPE_CFG.diameter *
      this.sizeFactor *
      lerp(
        SNIPE_CFG.farScale,
        SNIPE_CFG.nearScale,

        constrain(
          snY /
          SNIPE_CFG.referenceHeight,
          0,
          1
        )
      )
    );
  }


  update(snDt) {

    if (
      this.mode ===
      "outside"
    ) {

      this.outsideTimer -=
        snDt;

      return;
    }


    if (this.flight) {

      this.updateFlight(
        snDt
      );

      return;
    }


    this.modeTimer -=
      snDt;


    if (
      this.modeTimer <= 0
    ) {

      if (
        this.mode ===
        "walk"
      ) {

        this.mode =
          random() <
          SNIPE_CFG.feedingChance
            ? "feed"
            : "rest";


        this.modeTimer =
          snRange(
            this.mode ===
              "feed"
              ? SNIPE_CFG.feedingDuration
              : SNIPE_CFG.restDuration
          );

      } else {

        this.mode =
          "walk";


        this.modeTimer =
          snRange(
            SNIPE_CFG.walkDuration
          );


        this.cruiseSpeed =
          snRange(
            SNIPE_CFG.walkSpeed
          );


        this.targetHeading +=
          random(
            -1.1,
            1.1
          );
      }
    }


    this.speed =
      lerp(
        this.speed,

        this.mode ===
          "walk"
          ? this.cruiseSpeed
          : 0,

        1 -
        Math.exp(
          -SNIPE_CFG.acceleration *
          snDt
        )
      );


    this.turnTimer -=
      snDt;


    if (
      this.turnTimer <= 0
    ) {

      this.targetHeading +=
        random(
          -SNIPE_CFG.turnAngle,
          SNIPE_CFG.turnAngle
        );


      this.turnTimer =
        snRange(
          SNIPE_CFG.directionDuration
        );
    }


    const snAngleDifference =
      Math.atan2(

        Math.sin(
          this.targetHeading -
          this.heading
        ),

        Math.cos(
          this.targetHeading -
          this.heading
        )
      );


    this.heading +=
      snAngleDifference *
      (
        1 -
        Math.exp(
          -SNIPE_CFG.turnResponse *
          snDt
        )
      );


    if (
      this.speed >
      0.15
    ) {

      const snNextX =
        this.x +
        Math.cos(
          this.heading
        ) *
        this.speed *
        snDt;


      const snNextY =
        this.y +
        Math.sin(
          this.heading
        ) *
        this.speed *
        SNIPE_CFG.depthMovement *
        snDt;


      if (
        snGroundClear(
          this,
          snNextX,
          snNextY
        )
      ) {

        this.x =
          snNextX;

        this.y =
          snNextY;

        this.blockedTime =
          0;

      } else {

        this.blockedTime +=
          snDt;

        this.speed *=
          0.8;


        if (
          this.blockedTime >
          0.15
        ) {

          this.targetHeading =
            this.heading +
            random(
              1.5,
              2.6
            ) *
            (
              random() <
              0.5
                ? -1
                : 1
            );


          this.heading =
            this.targetHeading;


          this.blockedTime =
            0;
        }
      }
    }


    this.updateFeeding(
      snDt
    );
  }


  updateFeeding(snDt) {

    this.offsetY =
      Math.sin(
        snClock *
        TWO_PI *
        SNIPE_CFG.restSwayFrequency +
        this.phase
      ) *
      SNIPE_CFG.restSway;


    if (
      this.mode !==
      "feed"
    ) {

      this.probeElapsed =
        -1;

      return;
    }


    this.probeTimer -=
      snDt;


    if (
      this.probeElapsed <
        0 &&
      this.probeTimer <=
        0
    ) {

      this.probeElapsed =
        0;
    }


    if (
      this.probeElapsed >=
      0
    ) {

      this.probeElapsed +=
        snDt;


      const snProgress =
        this.probeElapsed /
        SNIPE_CFG.probeDuration;


      if (
        snProgress >= 1
      ) {

        this.probeElapsed =
          -1;


        this.probeTimer =
          snRange(
            SNIPE_CFG.probeInterval
          );

      } else {

        this.offsetY +=
          Math.sin(
            snProgress *
            PI
          ) *
          SNIPE_CFG.probeDepth;
      }
    }
  }


  startFlight(snRoute) {

    this.flight =
      snRoute;

    this.flight.elapsed =
      0;

    this.x =
      snRoute.startX;

    this.y =
      snRoute.startY;

    this.mode =
      snRoute.kind;

    this.offsetY = 0;

    this.speed = 0;

    this.probeElapsed =
      -1;
  }


  updateFlight(snDt) {

    const snRoute =
      this.flight;


    snRoute.elapsed =
      Math.min(
        snRoute.elapsed +
        snDt,

        snRoute.duration
      );


    const snPosition =
      snFlightPosition(

        snRoute,

        snRoute.elapsed /
        snRoute.duration
      );


    this.x =
      snPosition.x;

    this.y =
      snPosition.y;


    if (
      snRoute.elapsed <
      snRoute.duration
    ) {

      return;
    }


    this.x =
      snRoute.endX;

    this.y =
      snRoute.endY;


    this.flight =
      null;


    if (
      snRoute.kind ===
      "exit"
    ) {

      this.mode =
        "outside";


      this.outsideTimer =
        snRange(
          SNIPE_CFG.outsideDuration
        );


      this.returnSide =
        random() <
        SNIPE_CFG.returnOppositeChance

          ? (
              snRoute.side ===
              "left"
                ? "right"
                : "left"
            )

          : snRoute.side;

    } else {

      this.mode =
        "rest";


      this.modeTimer =
        snRange(
          SNIPE_CFG.landingRest
        );


      this.heading =
        random(TWO_PI);


      this.targetHeading =
        this.heading;
    }
  }


  display() {

    if (
      this.mode ===
      "outside"
    ) {

      return;
    }


    let snDiameter =
      this.diameterAt(
        this.y
      );


    if (this.flight) {

      const snT =
        constrain(

          this.flight.elapsed /
          this.flight.duration,

          0,
          1
        );


      snDiameter =
        lerp(

          this.flight.startDiameter,

          this.flight.endDiameter,

          snFlightEase(
            this.flight.kind,
            snT
          )
        );
    }


    const snDrawY =
      this.y +
      this.offsetY;


    if (
      SNIPE_CFG.shadowEnabled
    ) {

      let snShadowX =
        this.x;

      let snShadowY =
        this.y;

      let snShadowAlpha =
        SNIPE_CFG.shadowOpacity;


      if (this.flight) {

        const snRoute =
          this.flight;


        const snT =
          constrain(

            snRoute.elapsed /
            snRoute.duration,

            0,
            1
          );


        const snEase =
          snFlightEase(
            snRoute.kind,
            snT
          );


        snShadowX =
          lerp(
            snRoute.startX,
            snRoute.endX,
            snEase
          );


        snShadowY =
          lerp(
            snRoute.startY,
            snRoute.endY,
            snEase
          );


        if (
          snRoute.kind ===
          "exit"
        ) {

          snShadowAlpha *=
            Math.pow(
              1 - snT,
              3
            );

        } else if (
          snRoute.kind ===
          "enter"
        ) {

          snShadowAlpha *=
            Math.pow(
              snT,
              4
            );

        } else {

          snShadowAlpha *=
            0.3;
        }
      }


      noStroke();


      fill(
        30,
        23,
        14,
        snShadowAlpha
      );


      ellipse(

        snShadowX,

        snShadowY +
        snDiameter *
        0.48,

        snDiameter *
        SNIPE_CFG.shadowWidth,

        snDiameter *
        SNIPE_CFG.shadowHeight
      );
    }


    const snFill =
      color(
        this.col
      );


    snFill.setAlpha(
      SNIPE_CFG.opacity
    );


    fill(
      snFill
    );


    stroke(
      SNIPE_CFG.outlineColor
    );


    strokeWeight(
      SNIPE_CFG.outlineWidth
    );


    circle(
      this.x,
      snDrawY,
      snDiameter
    );


    if (
      SNIPE_CFG.showState
    ) {

      const snLabels = {

        walk:
          "慢走",

        feed:
          "探食",

        rest:
          "停留",

        local:
          "短飞",

        exit:
          "飞离",

        enter:
          "飞入"
      };


      noStroke();

      fill(255);

      textSize(12);

      textAlign(
        CENTER,
        BOTTOM
      );


      text(

        snLabels[
          this.mode
        ] || "",

        this.x,

        snDrawY -
        snDiameter
      );
    }
  }
}


// ============================================================
// 飞行路径
// ============================================================

function snFlightEase(
  snKind,
  snT
) {

  if (
    snKind ===
    "exit"
  ) {

    return (
      snT *
      snT
    );
  }


  return (
    1 -
    Math.pow(
      1 - snT,
      2
    )
  );
}


function snFlightPosition(
  snRoute,
  snT
) {

  const snEase =
    snFlightEase(
      snRoute.kind,
      snT
    );


  return {

    x:
      lerp(
        snRoute.startX,
        snRoute.endX,
        snEase
      ),

    y:
      lerp(
        snRoute.startY,
        snRoute.endY,
        snEase
      ) -
      Math.sin(
        PI *
        snEase
      ) *
      snRoute.height
  };
}


function snMakeRoute(
  snBird,
  snKind,
  snStart,
  snEnd,
  snHeight,
  snDuration,
  snSide = null
) {

  const snRoute = {

    kind:
      snKind,

    side:
      snSide,

    startX:
      snStart.x,

    startY:
      snStart.y,

    endX:
      snEnd.x,

    endY:
      snEnd.y,

    height:
      snHeight,

    duration:
      snDuration,

    elapsed:
      0,

    startDiameter:
      snBird.diameterAt(
        snStart.y
      ),

    endDiameter:
      snBird.diameterAt(
        snEnd.y
      ),

    samples:
      []
  };


  if (
    snKind ===
    "exit"
  ) {

    snRoute.endDiameter =
      snRoute.startDiameter *
      0.92;

  } else if (
    snKind ===
    "enter"
  ) {

    snRoute.startDiameter =
      snRoute.endDiameter *
      0.92;
  }


  snRoute.maxDiameter =
    Math.max(

      snRoute.startDiameter,

      snRoute.endDiameter
    );


  for (
    let snI = 0;
    snI <= 80;
    snI++
  ) {

    snRoute.samples.push(

      snFlightPosition(

        snRoute,

        snI / 80
      )
    );
  }


  return snRoute;
}


function snRouteDistance(
  snX,
  snY,
  snRoute
) {

  let snMinimum =
    Infinity;


  for (
    let snI = 1;
    snI <
    snRoute.samples.length;
    snI++
  ) {

    snMinimum =
      Math.min(

        snMinimum,

        snSegmentDistance(

          snX,
          snY,

          snRoute.samples[
            snI - 1
          ],

          snRoute.samples[
            snI
          ]
        )
      );
  }


  return snMinimum;
}


function snRouteSafe(
  snBird,
  snRoute
) {

  const snRadius =
    snRoute.maxDiameter /
    2;


  for (
    const snPoint of
    snRoute.samples
  ) {

    if (
      snPoint.y <
        snRadius + 4 ||

      snPoint.y >
        SNIPE_CFG.referenceHeight -
        snRadius -
        4
    ) {

      return false;
    }
  }


  for (
    const snOther of
    snBirds
  ) {

    if (
      snOther ===
        snBird ||

      snOther.mode ===
        "outside"
    ) {

      continue;
    }


    const snRequired =

      snRadius +

      snOther.diameterAt(
        snOther.y
      ) /
      2 +

      SNIPE_CFG.minimumGap +

      SNIPE_CFG.probeDepth +

      SNIPE_CFG.restSway +

      6;


    if (
      snRouteDistance(

        snOther.x,
        snOther.y,

        snRoute
      ) <
      snRequired
    ) {

      return false;
    }
  }


  return true;
}


function snEdgePoint(
  snSide
) {

  const snMargin =
    Math.max(

      SNIPE_CFG.outsideMargin,

      SNIPE_CFG.diameter *
      SNIPE_CFG.nearScale +
      10
    );


  return {

    x:
      snSide ===
      "left"

        ? -snMargin

        : SNIPE_CFG.referenceWidth +
          snMargin,

    y:
      snRange(
        SNIPE_CFG.edgeHeightPercent
      ) *
      SNIPE_CFG.referenceHeight /
      100
  };
}


function snEdgeDuration(
  snStart,
  snEnd
) {

  const snDistance =
    Math.hypot(

      snEnd.x -
      snStart.x,

      snEnd.y -
      snStart.y
    );


  return constrain(

    snDistance /
    snRange(
      SNIPE_CFG.edgeFlySpeed
    ),

    SNIPE_CFG.edgeDuration[0],

    SNIPE_CFG.edgeDuration[1]
  );
}


function snGroundBirds() {

  return snBirds.filter(

    snBird =>
      !snBird.flight &&

      snBird.mode !==
      "outside"
  );
}


function snTryExit() {

  const snCandidates =
    snGroundBirds();


  if (
    !snCandidates.length
  ) {

    return false;
  }


  const snSide =
    SNIPE_CFG.alternateSides

      ? snNextExitSide

      : (
          random() < 0.5
            ? "left"
            : "right"
        );


  for (
    let snAttempt = 0;
    snAttempt < 48;
    snAttempt++
  ) {

    const snBird =
      snCandidates[

        Math.floor(
          random(
            snCandidates.length
          )
        )
      ];


    const snStart = {

      x:
        snBird.x,

      y:
        snBird.y
    };


    const snEnd =
      snEdgePoint(
        snSide
      );


    const snRoute =
      snMakeRoute(

        snBird,

        "exit",

        snStart,

        snEnd,

        snRange(
          SNIPE_CFG.edgeFlightHeight
        ),

        snEdgeDuration(
          snStart,
          snEnd
        ),

        snSide
      );


    if (
      snRouteSafe(
        snBird,
        snRoute
      )
    ) {

      snBird.startFlight(
        snRoute
      );


      snNextExitSide =
        snSide ===
        "left"
          ? "right"
          : "left";


      return true;
    }
  }


  return false;
}


function snTryEnter(
  snBird
) {

  for (
    let snAttempt = 0;
    snAttempt < 48;
    snAttempt++
  ) {

    const snEnd =
      snFindPlace(
        snBird
      );


    if (!snEnd) {

      continue;
    }


    const snStart =
      snEdgePoint(
        snBird.returnSide
      );


    const snRoute =
      snMakeRoute(

        snBird,

        "enter",

        snStart,

        snEnd,

        snRange(
          SNIPE_CFG.edgeFlightHeight
        ),

        snEdgeDuration(
          snStart,
          snEnd
        ),

        snBird.returnSide
      );


    if (
      snRouteSafe(
        snBird,
        snRoute
      )
    ) {

      snBird.startFlight(
        snRoute
      );

      return true;
    }
  }


  return false;
}


function snTryLocalFlight() {

  const snCandidates =
    snGroundBirds();


  if (
    !snCandidates.length
  ) {

    return false;
  }


  const snBird =
    snCandidates[

      Math.floor(
        random(
          snCandidates.length
        )
      )
    ];


  for (
    let snAttempt = 0;
    snAttempt < 40;
    snAttempt++
  ) {

    const snEnd =
      snFindPlace(
        snBird
      );


    if (!snEnd) {

      continue;
    }


    const snDistance =
      Math.hypot(

        snEnd.x -
        snBird.x,

        snEnd.y -
        snBird.y
      );


    if (
      snDistance <
        SNIPE_CFG.flightDistance[0] ||

      snDistance >
        SNIPE_CFG.flightDistance[1]
    ) {

      continue;
    }


    const snRoute =
      snMakeRoute(

        snBird,

        "local",

        {
          x:
            snBird.x,

          y:
            snBird.y
        },

        snEnd,

        snRange(
          SNIPE_CFG.flightHeight
        ),

        snRange(
          SNIPE_CFG.flightDuration
        )
      );


    if (
      snRouteSafe(
        snBird,
        snRoute
      )
    ) {

      snBird.startFlight(
        snRoute
      );

      return true;
    }
  }


  return false;
}


// ============================================================
// 地面范围与避让
// ============================================================

function snRange(
  snValues
) {

  return random(
    snValues[0],
    snValues[1]
  );
}


function snInside(
  snX,
  snY
) {

  let snResult =
    false;


  for (
    let snI = 0,
        snJ =
          snArea.length - 1;

    snI <
    snArea.length;

    snJ =
      snI++
  ) {

    const snA =
      snArea[snI];

    const snB =
      snArea[snJ];


    if (
      (
        snA.y >
        snY
      ) !==
      (
        snB.y >
        snY
      ) &&

      snX <
      (
        snB.x -
        snA.x
      ) *
      (
        snY -
        snA.y
      ) /
      (
        snB.y -
        snA.y
      ) +
      snA.x
    ) {

      snResult =
        !snResult;
    }
  }


  return snResult;
}


function snSegmentDistance(
  snX,
  snY,
  snA,
  snB
) {

  const snDX =
    snB.x -
    snA.x;


  const snDY =
    snB.y -
    snA.y;


  const snLengthSquared =
    snDX * snDX +
    snDY * snDY;


  const snT =
    snLengthSquared ===
    0

      ? 0

      : constrain(

          (
            (
              snX -
              snA.x
            ) *
            snDX +

            (
              snY -
              snA.y
            ) *
            snDY
          ) /
          snLengthSquared,

          0,
          1
        );


  return Math.hypot(

    snX -
    snA.x -
    snT *
    snDX,

    snY -
    snA.y -
    snT *
    snDY
  );
}


function snWithinMud(
  snBird,
  snX,
  snY
) {

  if (
    !snInside(
      snX,
      snY
    )
  ) {

    return false;
  }


  const snMargin =

    snBird.diameterAt(
      snY
    ) /
    2 +

    SNIPE_CFG.edgeMargin +

    SNIPE_CFG.probeDepth +

    SNIPE_CFG.restSway;


  for (
    let snI = 0;
    snI <
    snArea.length;
    snI++
  ) {

    if (
      snSegmentDistance(

        snX,
        snY,

        snArea[snI],

        snArea[
          (
            snI + 1
          ) %
          snArea.length
        ]
      ) <
      snMargin
    ) {

      return false;
    }
  }


  return true;
}


function snGroundClear(
  snBird,
  snX,
  snY
) {

  if (
    !snWithinMud(
      snBird,
      snX,
      snY
    )
  ) {

    return false;
  }


  for (
    const snOther of
    snBirds
  ) {

    if (
      snOther ===
        snBird ||

      snOther.mode ===
        "outside"
    ) {

      continue;
    }


    if (
      snOther.flight
    ) {

      const snRequired =

        snBird.diameterAt(
          snY
        ) /
        2 +

        snOther.flight.maxDiameter /
        2 +

        SNIPE_CFG.minimumGap +

        SNIPE_CFG.probeDepth +

        SNIPE_CFG.restSway +

        6;


      if (
        snRouteDistance(

          snX,
          snY,

          snOther.flight
        ) <
        snRequired
      ) {

        return false;
      }

    } else {

      const snRequired =

        (
          snBird.diameterAt(
            snY
          ) +

          snOther.diameterAt(
            snOther.y
          )
        ) /
        2 +

        SNIPE_CFG.minimumGap;


      if (
        Math.hypot(

          snX -
          snOther.x,

          snY -
          snOther.y
        ) <
        snRequired
      ) {

        return false;
      }
    }
  }


  return true;
}


function snFindPlace(
  snBird
) {

  for (
    let snAttempt = 0;
    snAttempt < 160;
    snAttempt++
  ) {

    const snX =
      random(
        0,
        SNIPE_CFG.referenceWidth *
        0.52
      );


    const snY =
      random(

        SNIPE_CFG.referenceHeight *
        0.08,

        SNIPE_CFG.referenceHeight *
        0.95
      );


    if (
      snGroundClear(
        snBird,
        snX,
        snY
      )
    ) {

      return {

        x:
          snX,

        y:
          snY
      };
    }
  }


  return null;
}


// ============================================================
// 预览窗口尺寸变化
// ============================================================

function windowResized() {

  resizeCanvas(
    windowWidth,
    windowHeight
  );
}