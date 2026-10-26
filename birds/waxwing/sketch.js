// ============================================================
// 太平鸟 · 雪中浆果
// p5.js 2.3.4
//c
// 背景：太平鸟16：9.png
// Canvas：1920 × 1080
//
// 蓝线参考图本身就是 1920 × 1080。
// 所以下面的所有坐标全部 1:1 使用。
// 不加载蓝线图。
// 不缩放蓝线坐标。
// 正式画面不显示蓝线。
//
// 本版：
// 画布使用 COVER 铺满浏览器窗口
// 不出现黑边
// 不改变内部1920×1080坐标
// ============================================================


// ============================================================
// 参数
// ============================================================

const CFG = {

  bgFile: "太平鸟16：9.png",

  w: 1920,
  h: 1080,

  count: 28,
  minCount: 23,
  maxCount: 34,

  birdSize: 30,

  birdColor: "#A58D73",
  birdStroke: "#fbbb32",

  minGap: 37,

  // 粒子中心在蓝线外侧多少像素
  // 越小，被雪遮住得越多
  outsideOffset: 9,

  // 局部移动
  forageWaitMin: 1.3,
  forageWaitMax: 3.0,

  forageRangeMin: 22,
  forageRangeMax: 78,

  forageTimeMin: 0.35,
  forageTimeMax: 0.75,

  // 群体换位
  groupWaitMin: 5,
  groupWaitMax: 9,

  groupMin: 3,
  groupMax: 6,

  // 飞行
  flightSpeedMin: 250,
  flightSpeedMax: 360,

  flightCurveMin: 25,
  flightCurveMax: 80,

  // 飞入飞出
  edgeWaitMin: 11,
  edgeWaitMax: 18,

  edgeGroupMin: 2,
  edgeGroupMax: 5,

  // 尾迹
  trailLife: 0.18,
  trailSpacing: 18,
  trailSize: 8,

  // 雪向内部覆盖的深度
  snowDepth: 48,

  // 每段圆弧采样数
  curveSamples: 16,

  // 正式必须 false
  debug: false
};


// ============================================================
// 雪沿
// 坐标直接来自1920×1080蓝线图
// ============================================================

const SNOW_DATA = [

  // 1 左侧独立雪帽
  [
    [[226, 632], [225, 590], [254, 565]],
    [[254, 565], [285, 546], [321, 520]],
    [[321, 520], [350, 500], [380, 500]],
    [[380, 500], [416, 500], [435, 524]],
    [[435, 524], [441, 550], [440, 587]]
  ],

  // 2 上中左雪帽
  [
    [[703, 421], [702, 391], [716, 375]],
    [[716, 375], [738, 369], [757, 369]],
    [[757, 369], [781, 348], [799, 337]],
    [[799, 337], [829, 332], [856, 340]],
    [[856, 340], [889, 350], [916, 371]],
    [[916, 371], [936, 392], [941, 441]]
  ],

  // 3 上中后方雪帽
  [
    [[869, 349], [887, 328], [911, 322]],
    [[911, 322], [942, 315], [974, 323]],
    [[974, 323], [1006, 334], [1037, 352]],
    [[1037, 352], [1066, 370], [1090, 391]],
    [[1090, 391], [1097, 412], [1090, 453]]
  ],

  // 4 中央主雪帽
  [
    [[845, 501], [869, 475], [899, 457]],
    [[899, 457], [924, 447], [949, 447]],
    [[949, 447], [976, 451], [997, 467]],

    [[997, 467], [1013, 486], [1029, 488]],

    [[1029, 488], [1046, 486], [1062, 474]],

    [[1062, 474], [1088, 471], [1112, 485]],
    [[1112, 485], [1142, 507], [1154, 541]],
    [[1154, 541], [1163, 566], [1152, 607]]
  ],

  // 5 中央右雪帽
  [
    [[1152, 607], [1156, 586], [1175, 577]],
    [[1175, 577], [1194, 571], [1210, 579]],
    [[1210, 579], [1235, 590], [1256, 608]],
    [[1256, 608], [1283, 627], [1303, 648]],
    [[1303, 648], [1322, 672], [1322, 699]]
  ],

  // 6 中左小雪帽
  [
    [[611, 679], [610, 650], [628, 624]],
    [[628, 624], [650, 598], [681, 586]],
    [[681, 586], [708, 582], [732, 590]],
    [[732, 590], [760, 598], [782, 619]],
    [[782, 619], [811, 640], [811, 651]]
  ],

  // 7 中左大雪帽
  [
    [[567, 794], [566, 763], [582, 742]],
    [[582, 742], [605, 725], [628, 718]],
    [[628, 718], [655, 710], [682, 710]],
    [[682, 710], [716, 715], [742, 733]],
    [[742, 733], [773, 755], [791, 784]],
    [[791, 784], [803, 810], [800, 836]]
  ],

  // 8 左下最长雪帽
  [
    [[155, 827], [160, 800], [181, 783]],

    [[181, 783], [201, 780], [223, 778]],

    [[223, 778], [224, 754], [244, 744]],

    [[244, 744], [270, 745], [298, 760]],
    [[298, 760], [326, 777], [351, 800]],
    [[351, 800], [373, 819], [393, 823]],
    [[393, 823], [419, 815], [443, 798]],
    [[443, 798], [460, 786], [465, 770]]
  ],

  // 9 左下中层雪帽
  [
    [[435, 837], [434, 807], [451, 788]],
    [[451, 788], [475, 778], [498, 770]],
    [[498, 770], [521, 765], [543, 769]],
    [[543, 769], [564, 775], [572, 790]]
  ],

  // 10 左下小雪帽
  [
    [[333, 899], [333, 872], [348, 855]],
    [[348, 855], [365, 847], [385, 849]],
    [[385, 849], [409, 859], [428, 878]],
    [[428, 878], [445, 897], [457, 918]],
    [[457, 918], [462, 936], [439, 950]]
  ],

  // 11 左中叠层小雪帽
  [
    [[567, 794], [568, 765], [584, 748]],
    [[584, 748], [603, 737], [623, 735]],
    [[623, 735], [643, 736], [659, 748]]
  ],

  // 12 右侧小雪帽
  [
    [[1494, 669], [1493, 651], [1511, 640]],
    [[1511, 640], [1530, 633], [1548, 635]],
    [[1548, 635], [1570, 639], [1592, 649]],
    [[1592, 649], [1616, 659], [1624, 673]],
    [[1624, 673], [1626, 683], [1624, 697]]
  ],

  // 13 右上大雪帽
  [
    [[1437, 221], [1451, 207], [1473, 205]],
    [[1473, 205], [1503, 203], [1527, 213]],
    [[1527, 213], [1554, 225], [1572, 242]],

    [[1572, 242], [1584, 263], [1602, 279]],

    [[1602, 279], [1632, 286], [1654, 301]],
    [[1654, 301], [1683, 315], [1697, 334]],

    [[1697, 334], [1713, 359], [1723, 382]],
    [[1723, 382], [1728, 405], [1724, 437]]
  ],

  // 14 底部中央雪帽
  [
    [[796, 1004], [796, 974], [808, 952]],
    [[808, 952], [826, 936], [848, 934]],
    [[848, 934], [865, 935], [878, 949]],

    [[878, 949], [892, 944], [907, 949]],

    [[907, 949], [929, 948], [943, 961]],
    [[943, 961], [966, 978], [978, 1000]],
    [[978, 1000], [1010, 1028], [1031, 1067]]
  ]
];


// ============================================================
// 全局
// ============================================================

let bgImg;

let snowPaths = [];

let birds = [];

let trails = [];

let ready = false;

let groupTimer = 6;

let edgeTimer = 13;


// ============================================================
// SETUP
// ============================================================

async function setup() {

  createCanvas(
    CFG.w,
    CFG.h
  );

  pixelDensity(1);


  bgImg =
    await loadImage(
      CFG.bgFile
    );


  // 背景最终固定到1920×1080
  if (
    bgImg.width !== CFG.w ||
    bgImg.height !== CFG.h
  ) {

    bgImg.resize(
      CFG.w,
      CFG.h
    );
  }


  buildSnowPaths();

  createInitialBirds();

  fitCanvas();

  ready = true;
}


// ============================================================
// 页面显示
//
// 重要：
// 内部 Canvas 依然严格1920×1080。
// 这里只改变浏览器中的CSS显示大小。
// 使用 COVER，因此永远不会露出黑边。
// ============================================================

function fitCanvas() {

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

  // 不再使用黑色页面背景
  document.body.style.background = "#ffffff";


  const canvasElement =
    document.querySelector("canvas");


  if (!canvasElement) {
    return;
  }


  canvasElement.style.position = "fixed";

  canvasElement.style.left = "50%";
  canvasElement.style.top = "50%";

  canvasElement.style.transform =
    "translate(-50%, -50%)";

  // COVER：
  // 浏览器比16:9宽 -> 上下裁切一点
  // 浏览器比16:9高 -> 左右裁切一点
  // 永远铺满窗口
  canvasElement.style.width =
    "max(100vw, 177.777778vh)";

  canvasElement.style.height =
    "max(56.25vw, 100vh)";

  canvasElement.style.maxWidth = "none";
  canvasElement.style.maxHeight = "none";

  canvasElement.style.display = "block";
}


// ============================================================
// 浏览器尺寸变化时继续保持铺满
// ============================================================

function windowResized() {

  fitCanvas();
}


// ============================================================
// 二次贝塞尔
// ============================================================

function quadValue(
  a,
  b,
  c,
  t
) {

  const u =
    1 - t;


  return (
    u * u * a +
    2 * u * t * b +
    t * t * c
  );
}


// ============================================================
// 建立雪沿
// 没有任何坐标缩放
// ============================================================

function buildSnowPaths() {

  snowPaths = [];


  for (
    const sourcePath of
    SNOW_DATA
  ) {

    const points = [];


    for (
      let sectionIndex = 0;
      sectionIndex < sourcePath.length;
      sectionIndex++
    ) {

      const section =
        sourcePath[
          sectionIndex
        ];


      for (
        let sampleIndex = 0;
        sampleIndex <= CFG.curveSamples;
        sampleIndex++
      ) {

        if (
          sectionIndex > 0 &&
          sampleIndex === 0
        ) {

          continue;
        }


        const t =
          sampleIndex /
          CFG.curveSamples;


        points.push({

          x:
            quadValue(
              section[0][0],
              section[1][0],
              section[2][0],
              t
            ),

          y:
            quadValue(
              section[0][1],
              section[1][1],
              section[2][1],
              t
            )
        });
      }
    }


    // 蓝线是雪的前沿
    // 粒子保持在线的外侧/上侧

    for (
      let i = 0;
      i < points.length;
      i++
    ) {

      const previous =
        points[
          max(
            0,
            i - 2
          )
        ];


      const following =
        points[
          min(
            points.length - 1,
            i + 2
          )
        ];


      let tx =
        following.x -
        previous.x;


      let ty =
        following.y -
        previous.y;


      const lengthValue =
        max(
          0.001,
          Math.hypot(
            tx,
            ty
          )
        );


      tx /=
        lengthValue;

      ty /=
        lengthValue;


      let nx =
        -ty;

      let ny =
        tx;


      // 永远选上方外侧
      if (
        ny > 0
      ) {

        nx *= -1;
        ny *= -1;
      }


      points[i].tx = tx;
      points[i].ty = ty;

      points[i].outsideX = nx;
      points[i].outsideY = ny;

      points[i].insideX = -nx;
      points[i].insideY = -ny;
    }


    snowPaths.push(
      points
    );
  }
}


// ============================================================
// 生成雪沿落点
// ============================================================

function landingAt(
  pathIndex,
  pointIndex,
  offsetVariation = 0
) {

  const pointData =
    snowPaths[
      pathIndex
    ][
      pointIndex
    ];


  const offsetDistance =
    CFG.outsideOffset +
    offsetVariation;


  return {

    x:
      pointData.x +
      pointData.outsideX *
      offsetDistance,

    y:
      pointData.y +
      pointData.outsideY *
      offsetDistance,

    edgeX:
      pointData.x,

    edgeY:
      pointData.y,

    tx:
      pointData.tx,

    ty:
      pointData.ty,

    outsideX:
      pointData.outsideX,

    outsideY:
      pointData.outsideY,

    insideX:
      pointData.insideX,

    insideY:
      pointData.insideY,

    pathIndex,
    pointIndex
  };
}


// ============================================================
// 防止粒子互相重叠
// ============================================================

function isFree(
  x,
  y,
  ignoredBird = null
) {

  for (
    const bird of birds
  ) {

    if (
      bird === ignoredBird ||
      bird.dead
    ) {

      continue;
    }


    if (
      Math.hypot(
        x - bird.x,
        y - bird.y
      ) <
      CFG.minGap
    ) {

      return false;
    }
  }


  return true;
}


// ============================================================
// 找一个落点
// ============================================================

function findLanding(
  ignoredBird = null,
  referenceX = null,
  referenceY = null,
  minimumDistance = 0,
  maximumDistance = Infinity
) {

  for (
    let attempt = 0;
    attempt < 350;
    attempt++
  ) {

    const pathIndex =
      floor(
        random(
          snowPaths.length
        )
      );


    const currentPath =
      snowPaths[
        pathIndex
      ];


    if (
      currentPath.length < 10
    ) {

      continue;
    }


    const pointIndex =
      floor(
        random(
          4,
          currentPath.length - 4
        )
      );


    const landing =
      landingAt(

        pathIndex,

        pointIndex,

        random(
          -1.5,
          1.5
        )
      );


    if (
      referenceX !== null &&
      referenceY !== null
    ) {

      const d =
        Math.hypot(

          landing.x -
          referenceX,

          landing.y -
          referenceY
        );


      if (
        d <
        minimumDistance ||
        d >
        maximumDistance
      ) {

        continue;
      }
    }


    if (
      isFree(
        landing.x,
        landing.y,
        ignoredBird
      )
    ) {

      return landing;
    }
  }


  return null;
}


// ============================================================
// 初始化粒子
// ============================================================

function createInitialBirds() {

  birds = [];


  let attempts = 0;


  while (
    birds.length <
    CFG.count &&
    attempts < 5000
  ) {

    attempts++;


    const landing =
      findLanding();


    if (
      landing
    ) {

      birds.push(
        new Waxwing(
          landing
        )
      );
    }
  }
}


// ============================================================
// DRAW
// ============================================================

function draw() {

  if (!ready) {

    background(255);

    return;
  }


  image(
    bgImg,
    0,
    0,
    width,
    height
  );


  const dt =
    min(
      deltaTime / 1000,
      0.05
    );


  updateGroupEvent(dt);

  updateEdgeEvent(dt);


  for (
    const bird of birds
  ) {

    bird.update(dt);
  }


  updateTrails(dt);

  drawTrails();


  // 先画粒子

  for (
    const bird of birds
  ) {

    bird.render();
  }


  // 再把雪覆盖回来

  for (
    const bird of birds
  ) {

    if (
      !bird.dead &&
      bird.state !== "flight"
    ) {

      drawSnowOcclusion(
        bird
      );
    }
  }


  birds =
    birds.filter(
      bird =>
        !bird.dead
    );


  maintainCount();


  if (
    CFG.debug
  ) {

    drawDebug();
  }
}


// ============================================================
// 太平鸟粒子
// ============================================================

class Waxwing {

  constructor(
    landing
  ) {

    this.x =
      landing.x;

    this.y =
      landing.y;


    this.applyLanding(
      landing
    );


    this.state =
      "rest";


    this.dead =
      false;

    this.exiting =
      false;


    this.waitTimer =
      random(
        CFG.forageWaitMin,
        CFG.forageWaitMax
      );


    this.startX =
      this.x;

    this.startY =
      this.y;


    this.targetX =
      this.x;

    this.targetY =
      this.y;


    this.targetLanding =
      landing;


    this.progress = 0;

    this.duration = 1;

    this.curveAmount = 0;

    this.curveDirection = 1;


    this.lastTrailX =
      this.x;

    this.lastTrailY =
      this.y;
  }


  applyLanding(
    landing
  ) {

    this.pathIndex =
      landing.pathIndex;

    this.pointIndex =
      landing.pointIndex;


    this.edgeX =
      landing.edgeX;

    this.edgeY =
      landing.edgeY;


    this.tx =
      landing.tx;

    this.ty =
      landing.ty;


    this.outsideX =
      landing.outsideX;

    this.outsideY =
      landing.outsideY;


    this.insideX =
      landing.insideX;

    this.insideY =
      landing.insideY;
  }


  update(
    dt
  ) {

    if (
      this.state === "rest"
    ) {

      this.waitTimer -=
        dt;


      if (
        this.waitTimer <= 0
      ) {

        this.startForage();
      }

    } else if (
      this.state === "forage"
    ) {

      this.updateForage(
        dt
      );

    } else if (
      this.state === "flight"
    ) {

      this.updateFlight(
        dt
      );
    }
  }


  // ==========================================================
  // 同一雪帽附近短距离活动
  // ==========================================================

  startForage() {

    const currentPath =
      snowPaths[
        this.pathIndex
      ];


    for (
      let attempt = 0;
      attempt < 80;
      attempt++
    ) {

      const pointIndex =
        constrain(

          this.pointIndex +
          floor(
            random(
              -24,
              25
            )
          ),

          4,

          currentPath.length - 5
        );


      const target =
        landingAt(

          this.pathIndex,

          pointIndex,

          random(
            -1.5,
            1.5
          )
        );


      const d =
        Math.hypot(

          target.x -
          this.x,

          target.y -
          this.y
        );


      if (
        d <
        CFG.forageRangeMin ||
        d >
        CFG.forageRangeMax
      ) {

        continue;
      }


      if (
        !isFree(
          target.x,
          target.y,
          this
        )
      ) {

        continue;
      }


      this.startX =
        this.x;

      this.startY =
        this.y;


      this.targetX =
        target.x;

      this.targetY =
        target.y;


      this.targetLanding =
        target;


      this.progress = 0;


      this.duration =
        random(
          CFG.forageTimeMin,
          CFG.forageTimeMax
        );


      this.state =
        "forage";


      return;
    }


    this.waitTimer =
      random(
        CFG.forageWaitMin,
        CFG.forageWaitMax
      );
  }


  updateForage(
    dt
  ) {

    this.progress +=
      dt /
      this.duration;


    let t =
      constrain(
        this.progress,
        0,
        1
      );


    t =
      t *
      t *
      (
        3 -
        2 * t
      );


    this.x =
      lerp(
        this.startX,
        this.targetX,
        t
      );


    this.y =
      lerp(
        this.startY,
        this.targetY,
        t
      );


    if (
      this.progress >= 1
    ) {

      this.x =
        this.targetX;

      this.y =
        this.targetY;


      this.applyLanding(
        this.targetLanding
      );


      this.state =
        "rest";


      this.waitTimer =
        random(
          CFG.forageWaitMin,
          CFG.forageWaitMax
        );
    }
  }


  // ==========================================================
  // 飞行
  // ==========================================================

  startFlight(
    target
  ) {

    this.state =
      "flight";


    this.exiting =
      false;


    this.startX =
      this.x;

    this.startY =
      this.y;


    this.targetX =
      target.x;

    this.targetY =
      target.y;


    this.targetLanding =
      target;


    const d =
      Math.hypot(

        this.targetX -
        this.startX,

        this.targetY -
        this.startY
      );


    this.duration =
      constrain(

        d /
        random(
          CFG.flightSpeedMin,
          CFG.flightSpeedMax
        ),

        0.65,
        2.4
      );


    this.progress = 0;


    this.curveAmount =
      random(
        CFG.flightCurveMin,
        CFG.flightCurveMax
      );


    this.curveDirection =
      random() < 0.5
        ? -1
        : 1;


    this.lastTrailX =
      this.x;

    this.lastTrailY =
      this.y;
  }


  startExit(
    leaveLeft
  ) {

    this.state =
      "flight";


    this.exiting =
      true;


    this.startX =
      this.x;

    this.startY =
      this.y;


    this.targetX =
      leaveLeft
        ? -180
        : width + 180;


    this.targetY =
      constrain(

        this.y +
        random(
          -140,
          140
        ),

        40,

        height - 40
      );


    const d =
      Math.hypot(

        this.targetX -
        this.startX,

        this.targetY -
        this.startY
      );


    this.duration =
      constrain(

        d /
        random(
          CFG.flightSpeedMin,
          CFG.flightSpeedMax
        ),

        0.7,
        2.5
      );


    this.progress = 0;


    this.curveAmount =
      random(
        CFG.flightCurveMin,
        CFG.flightCurveMax
      );


    this.curveDirection =
      random() < 0.5
        ? -1
        : 1;
  }


  updateFlight(
    dt
  ) {

    this.progress +=
      dt /
      this.duration;


    const rawT =
      constrain(
        this.progress,
        0,
        1
      );


    const t =
      rawT *
      rawT *
      (
        3 -
        2 * rawT
      );


    const baseX =
      lerp(
        this.startX,
        this.targetX,
        t
      );


    const baseY =
      lerp(
        this.startY,
        this.targetY,
        t
      );


    const dx =
      this.targetX -
      this.startX;


    const dy =
      this.targetY -
      this.startY;


    const lengthValue =
      max(
        1,
        Math.hypot(
          dx,
          dy
        )
      );


    const px =
      -dy /
      lengthValue;


    const py =
      dx /
      lengthValue;


    const bend =
      Math.sin(
        rawT *
        Math.PI
      ) *
      this.curveAmount *
      this.curveDirection;


    this.x =
      baseX +
      px *
      bend;


    this.y =
      baseY +
      py *
      bend;


    this.makeTrail();


    if (
      this.progress >= 1
    ) {

      if (
        this.exiting
      ) {

        this.dead = true;

        return;
      }


      this.x =
        this.targetX;

      this.y =
        this.targetY;


      this.applyLanding(
        this.targetLanding
      );


      this.state =
        "rest";


      this.waitTimer =
        random(
          CFG.forageWaitMin,
          CFG.forageWaitMax
        );
    }
  }


  makeTrail() {

    const d =
      Math.hypot(

        this.x -
        this.lastTrailX,

        this.y -
        this.lastTrailY
      );


    if (
      d <
      CFG.trailSpacing
    ) {

      return;
    }


    trails.push({

      x:
        this.x,

      y:
        this.y,

      age:
        0
    });


    this.lastTrailX =
      this.x;

    this.lastTrailY =
      this.y;
  }


  render() {

    if (
      this.dead
    ) {

      return;
    }


    const bodyPaint =
      color(
        CFG.birdColor
      );


    bodyPaint.setAlpha(
      248
    );


    const edgePaint =
      color(
        CFG.birdStroke
      );


    edgePaint.setAlpha(
      210
    );


    fill(
      bodyPaint
    );


    stroke(
      edgePaint
    );


    strokeWeight(
      1.1
    );


    circle(
      this.x,
      this.y,
      CFG.birdSize
    );
  }
}


// ============================================================
// 雪遮挡
// ============================================================

function drawSnowOcclusion(
  bird
) {

  const radiusValue =
    CFG.birdSize /
    2;


  const contextValue =
    drawingContext;


  contextValue.save();


  // 只允许覆盖粒子自己的范围

  contextValue.beginPath();


  contextValue.arc(

    bird.x,

    bird.y,

    radiusValue + 1,

    0,

    Math.PI * 2
  );


  contextValue.clip();


  // 蓝线附近局部切线

  const sideLength =
    radiusValue *
    2.8;


  const edgeAX =

    bird.edgeX -
    bird.tx *
    sideLength;


  const edgeAY =

    bird.edgeY -
    bird.ty *
    sideLength;


  const edgeBX =

    bird.edgeX +
    bird.tx *
    sideLength;


  const edgeBY =

    bird.edgeY +
    bird.ty *
    sideLength;


  // 蓝线 -> 雪内部

  const insideAX =

    edgeAX +
    bird.insideX *
    CFG.snowDepth;


  const insideAY =

    edgeAY +
    bird.insideY *
    CFG.snowDepth;


  const insideBX =

    edgeBX +
    bird.insideX *
    CFG.snowDepth;


  const insideBY =

    edgeBY +
    bird.insideY *
    CFG.snowDepth;


  contextValue.beginPath();


  contextValue.moveTo(
    edgeAX,
    edgeAY
  );


  contextValue.lineTo(
    edgeBX,
    edgeBY
  );


  contextValue.lineTo(
    insideBX,
    insideBY
  );


  contextValue.lineTo(
    insideAX,
    insideAY
  );


  contextValue.closePath();


  contextValue.clip();


  // 把原始照片重新覆盖回来

  contextValue.drawImage(

    bgImg.canvas,

    0,
    0,

    width,
    height
  );


  contextValue.restore();
}


// ============================================================
// 群体换位
// ============================================================

function updateGroupEvent(
  dt
) {

  groupTimer -=
    dt;


  if (
    groupTimer > 0
  ) {

    return;
  }


  groupTimer =
    random(
      CFG.groupWaitMin,
      CFG.groupWaitMax
    );


  const resting =
    birds.filter(

      bird =>

        !bird.dead &&
        bird.state !== "flight"
    );


  shuffleArray(
    resting
  );


  const amount =
    min(

      resting.length,

      floor(
        random(
          CFG.groupMin,
          CFG.groupMax + 1
        )
      )
    );


  for (
    let i = 0;
    i < amount;
    i++
  ) {

    const bird =
      resting[i];


    const target =
      findLanding(

        bird,

        bird.x,
        bird.y,

        130,
        Infinity
      );


    if (
      target
    ) {

      bird.startFlight(
        target
      );
    }
  }
}


// ============================================================
// 飞入 / 飞出
// ============================================================

function updateEdgeEvent(
  dt
) {

  edgeTimer -=
    dt;


  if (
    edgeTimer > 0
  ) {

    return;
  }


  edgeTimer =
    random(
      CFG.edgeWaitMin,
      CFG.edgeWaitMax
    );


  if (
    birds.length <=
    CFG.minCount
  ) {

    createIncoming();

    return;
  }


  if (
    birds.length >=
    CFG.maxCount
  ) {

    createOutgoing();

    return;
  }


  if (
    random() < 0.5
  ) {

    createIncoming();

  } else {

    createOutgoing();
  }
}


// ============================================================
// 飞入
// ============================================================

function createIncoming() {

  const amount =
    min(

      CFG.maxCount -
      birds.length,

      floor(
        random(
          CFG.edgeGroupMin,
          CFG.edgeGroupMax + 1
        )
      )
    );


  if (
    amount <= 0
  ) {

    return;
  }


  const fromLeft =
    random() < 0.5;


  for (
    let i = 0;
    i < amount;
    i++
  ) {

    const target =
      findLanding();


    if (
      !target
    ) {

      continue;
    }


    const bird =
      new Waxwing(
        target
      );


    bird.x =
      fromLeft
        ? -100 - i * 25
        : width + 100 + i * 25;


    bird.y =
      constrain(

        target.y +
        random(
          -100,
          100
        ),

        30,

        height - 30
      );


    bird.startFlight(
      target
    );


    birds.push(
      bird
    );
  }
}


// ============================================================
// 飞出
// ============================================================

function createOutgoing() {

  const available =
    birds.filter(

      bird =>

        !bird.dead &&
        bird.state !== "flight"
    );


  shuffleArray(
    available
  );


  const possible =
    max(
      0,
      birds.length -
      CFG.minCount
    );


  const amount =
    min(

      possible,

      available.length,

      floor(
        random(
          CFG.edgeGroupMin,
          CFG.edgeGroupMax + 1
        )
      )
    );


  const leaveLeft =
    random() < 0.5;


  for (
    let i = 0;
    i < amount;
    i++
  ) {

    available[i].startExit(
      leaveLeft
    );
  }
}


// ============================================================
// 数量维持
// ============================================================

function maintainCount() {

  if (
    birds.length <
    CFG.minCount
  ) {

    createIncoming();
  }
}


// ============================================================
// 尾迹
// ============================================================

function updateTrails(
  dt
) {

  for (
    const trailParticle of
    trails
  ) {

    trailParticle.age +=
      dt;
  }


  trails =
    trails.filter(

      trailParticle =>

        trailParticle.age <
        CFG.trailLife
    );
}


function drawTrails() {

  noStroke();


  for (
    const trailParticle of
    trails
  ) {

    const ratioValue =

      trailParticle.age /
      CFG.trailLife;


    const trailPaint =
      color(
        CFG.birdColor
      );


    trailPaint.setAlpha(

      28 *
      (
        1 -
        ratioValue
      )
    );


    fill(
      trailPaint
    );


    circle(

      trailParticle.x,

      trailParticle.y,

      CFG.trailSize *
      (
        1 -
        ratioValue * 0.3
      )
    );
  }
}


// ============================================================
// 数组打乱
// ============================================================

function shuffleArray(
  values
) {

  for (
    let i =
      values.length - 1;
    i > 0;
    i--
  ) {

    const randomIndex =
      floor(
        random(
          i + 1
        )
      );


    const temporaryValue =
      values[i];


    values[i] =
      values[randomIndex];


    values[randomIndex] =
      temporaryValue;
  }
}


// ============================================================
// DEBUG
// 正式画面 CFG.debug = false
// ============================================================

function drawDebug() {

  push();


  noFill();


  stroke(
    20,
    150,
    230,
    230
  );


  strokeWeight(
    4
  );


  for (
    const currentPath of
    snowPaths
  ) {

    beginShape();


    for (
      const pointData of
      currentPath
    ) {

      vertex(
        pointData.x,
        pointData.y
      );
    }


    endShape();
  }


  pop();
}