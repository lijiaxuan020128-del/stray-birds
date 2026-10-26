// ============================================================
// 震旦鸦雀 · V3.1
// p5.js 2.3.4
// 背景：震旦鸦雀16：9.png
//
// 新增：
// 1. 粒子会从画面外飞入，并落到芦苇上
// 2. 停留中的粒子偶尔会飞出画面
// 3. 数量自然在 4～7 之间变化
// 4. 飞入后不会直接穿过画面
//
// 原行为：
// 停留 → 穗/杆上短跳 → 停顿 → 短飞换芦苇
//
// 层级：
// front = 粒子在穗前
// behind = 粒子落到穗后，被穗遮挡
// ============================================================

const CFG = {
  image: "震旦鸦雀16：9.png",

  W: 1920,
  H: 1080,

  // ---------- 数量 ----------
  initialCount: 6,
  minCount: 4,
  maxCount: 7,

  // ---------- 粒子 ----------
  size: 35,
  fill: "#f3bc44",
  opacity: 245,
  stroke: "#9a5b28",
  strokeWeight: 1.2,

  // ---------- 停留 ----------
  perchTime: [4.0, 8.5],
  pauseTime: [0.5, 1.5],

  // ---------- 穗/杆上移动 ----------
  hopDistance: [10, 32],
  hopSpeed: [38, 65],

  // ---------- 普通短飞 ----------
  flightSpeed: [190, 290],
  flightTime: [0.32, 0.85],

  // ---------- 飞入 ----------
  enterEnabled: true,
  enterInterval: [3.5, 8.0],
  enterSpeed: [280, 390],

  // ---------- 飞出 ----------
  exitEnabled: true,
  exitChance: 0.22,
  exitMinStay: 7.0,
  exitSpeed: [310, 430],

  // ---------- 飞入方向概率 ----------
  enterFromLeft: 0.38,
  enterFromRight: 0.38,
  enterFromTop: 0.24,

  // ---------- 落到穗后面的概率 ----------
  behindChance: 0.46,

  // ---------- 落到杆上的概率 ----------
  stemChance: 0.22,

  // ---------- 防重叠 ----------
  minimumGap: 27,

  // ---------- 拖尾 ----------
  trailEnabled: true,
  trailLife: 0.18,
  trailSpacing: 14,
  trailOpacity: 38,

  debug: false
};


// ============================================================
// 芦苇穗
// ============================================================

const HEADS = [

  {
    group: 0,
    poly: [
      [5.7,2.0],[7.4,7.0],[6.6,13.0],[8.0,10.0],
      [7.6,17.0],[10.2,14.0],[9.4,20.0],[12.0,17.0],
      [11.1,25.0],[13.1,29.0],[11.0,35.0],[9.3,42.0],
      [7.2,49.0],[5.3,43.0],[3.5,35.0],[2.6,27.0],
      [3.9,29.0],[2.3,22.0],[4.3,24.0],[2.8,17.0],
      [4.5,19.0],[3.7,12.0],[5.3,14.0]
    ]
  },

  {
    group: 0,
    poly: [
      [16.2,2.0],[17.4,7.0],[19.0,12.0],[20.0,18.0],
      [21.5,25.0],[23.0,33.0],[24.8,41.0],[25.7,49.0],
      [25.1,55.0],[22.0,54.0],[19.2,51.0],[17.4,46.0],
      [16.1,39.0],[14.5,33.0],[13.1,28.0],[14.4,22.0],
      [13.0,18.0],[14.0,12.0],[15.0,8.0]
    ]
  },

  {
    group: 0,
    poly: [
      [27.8,6.0],[29.0,11.0],[30.7,14.0],[30.1,20.0],
      [32.0,22.0],[31.0,28.0],[33.0,32.0],[32.0,38.0],
      [34.0,42.0],[32.7,47.0],[32.0,52.0],[30.0,49.0],
      [28.2,44.0],[27.0,50.0],[25.3,48.0],[24.0,42.0],
      [25.0,35.0],[24.2,29.0],[25.4,22.0],[26.0,16.0],
      [27.0,13.0]
    ]
  },

  {
    group: 1,
    poly: [
      [40.2,30.0],[42.0,34.0],[43.4,39.0],[45.0,43.0],
      [46.0,50.0],[45.1,57.0],[43.3,63.0],[41.2,65.0],
      [39.0,63.0],[37.6,58.0],[36.5,52.0],[36.7,45.0],
      [38.0,40.0],[39.1,35.0]
    ]
  },

  {
    group: 1,
    poly: [
      [54.8,5.5],[56.0,11.0],[58.0,16.0],[57.3,21.0],
      [59.3,25.0],[58.7,31.0],[60.2,35.0],[59.0,41.0],
      [56.2,44.0],[53.8,40.0],[51.7,35.0],[50.6,29.0],
      [51.7,25.0],[50.5,20.0],[52.0,17.0],[51.5,12.0],
      [53.3,10.0]
    ]
  },

  {
    group: 1,
    poly: [
      [47.2,30.0],[48.5,35.0],[49.7,40.0],[51.2,38.0],
      [51.5,44.0],[53.5,42.0],[53.2,49.0],[55.2,47.0],
      [54.8,54.0],[56.0,59.0],[54.0,65.0],[52.0,69.0],
      [50.4,75.0],[48.4,79.0],[46.7,76.0],[47.5,70.0],
      [45.8,66.0],[46.8,59.0],[45.2,55.0],[46.0,48.0],
      [45.1,43.0],[46.0,37.0]
    ]
  },

  {
    group: 1,
    poly: [
      [61.1,33.0],[62.7,36.0],[63.5,42.0],[65.0,40.0],
      [64.5,47.0],[66.0,51.0],[65.2,57.0],[66.3,61.0],
      [64.7,67.0],[62.5,72.0],[60.5,68.0],[59.0,63.0],
      [59.7,57.0],[58.4,53.0],[59.4,48.0],[58.5,43.0],
      [59.7,39.0]
    ]
  },

  {
    group: 2,
    poly: [
      [70.5,26.0],[72.4,29.0],[74.2,34.0],[75.3,39.0],
      [77.0,37.0],[76.8,44.0],[78.6,48.0],[77.0,54.0],
      [79.0,58.0],[77.4,63.0],[75.0,60.0],[73.0,57.0],
      [71.4,59.0],[69.5,55.0],[67.5,56.0],[68.0,50.0],
      [66.3,47.0],[68.0,43.0],[66.5,40.0],[68.5,36.0],
      [68.0,31.0]
    ]
  },

  {
    group: 2,
    poly: [
      [79.5,34.0],[81.5,39.0],[82.5,44.0],[84.0,41.0],
      [83.8,48.0],[85.4,51.0],[84.5,57.0],[86.0,61.0],
      [84.0,66.0],[82.0,69.0],[80.0,66.0],[78.5,61.0],
      [76.8,59.0],[78.0,54.0],[76.8,50.0],[78.0,45.0],
      [77.0,40.0]
    ]
  },

  {
    group: 2,
    poly: [
      [86.2,12.0],[88.0,15.0],[89.5,20.0],[91.0,18.0],
      [90.7,25.0],[92.0,29.0],[91.0,35.0],[92.0,40.0],
      [90.3,45.0],[89.2,51.0],[87.5,48.0],[86.0,44.0],
      [84.5,39.0],[85.4,34.0],[84.0,29.0],[85.0,24.0],
      [84.2,19.0]
    ]
  },

  {
    group: 2,
    poly: [
      [92.2,0.5],[94.5,3.0],[96.2,7.0],[97.4,4.0],
      [98.7,6.0],[98.0,12.0],[99.7,15.0],[99.2,22.0],
      [98.0,28.0],[96.5,34.0],[94.7,30.0],[93.0,25.0],
      [91.8,20.0],[90.3,17.0],[91.0,12.0],[89.8,8.0],
      [91.0,4.0]
    ]
  },

  {
    group: 2,
    poly: [
      [57.5,56.0],[59.0,58.0],[60.5,64.0],[62.0,67.0],
      [63.5,72.0],[65.0,76.0],[67.0,72.0],[68.2,65.0],
      [70.0,63.0],[72.0,68.0],[73.0,73.0],[75.0,77.0],
      [77.5,82.0],[78.0,89.0],[76.0,94.0],[73.0,96.0],
      [70.0,94.0],[68.0,91.0],[65.0,96.0],[62.0,98.0],
      [59.0,94.0],[56.0,89.0],[54.0,84.0],[52.5,78.0],
      [53.5,73.0],[52.0,69.0],[54.0,66.0],[53.0,61.0],
      [55.0,63.0],[54.5,58.0]
    ]
  },

  {
    group: 2,
    poly: [
      [82.0,60.0],[84.0,64.0],[85.5,69.0],[87.0,72.0],
      [86.0,78.0],[88.0,81.0],[87.0,87.0],[88.5,91.0],
      [86.5,95.0],[83.5,93.0],[81.0,90.0],[79.0,86.0],
      [80.0,81.0],[78.5,77.0],[79.5,72.0],[78.5,68.0],
      [80.0,65.0]
    ]
  }
];


// ============================================================
// 芦苇杆
// ============================================================

const STEMS = [
  {x1:7.2,  y1:48, x2:8.3,  y2:100, group:0},
  {x1:20.5, y1:49, x2:20.8, y2:100, group:0},
  {x1:26.0, y1:50, x2:26.7, y2:100, group:0},

  {x1:44.8, y1:64, x2:45.5, y2:100, group:1},
  {x1:56.0, y1:43, x2:55.6, y2:57,  group:1},

  {x1:88.5, y1:48, x2:90.0, y2:100, group:2},
  {x1:94.5, y1:32, x2:94.5, y2:52,  group:2}
];


// ============================================================
// 全局
// ============================================================

let bgImg;
let ready = false;

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

  canvasElement.style.height =
    "100vh";

  canvasElement.style.width =
    "auto";

  canvasElement.style.display =
    "block";

  document.documentElement.style.margin =
    "0";

  document.documentElement.style.padding =
    "0";

  document.documentElement.style.overflow =
    "hidden";

  document.body.style.margin =
    "0";

  document.body.style.padding =
    "0";

  document.body.style.overflow =
    "hidden";

  bgImg =
    await loadImage(
      CFG.image
    );

  convertGeometry();

  createInitialBirds();

  resetEnterTimer();

  ready = true;
}


// ============================================================
// 几何转换
// ============================================================

function convertGeometry() {

  for (const head of HEADS) {

    head.points =
      head.poly.map(
        pair => ({
          x: pair[0] / 100 * width,
          y: pair[1] / 100 * height
        })
      );

    let totalX = 0;
    let totalY = 0;

    for (const p of head.points) {
      totalX += p.x;
      totalY += p.y;
    }

    head.cx =
      totalX /
      head.points.length;

    head.cy =
      totalY /
      head.points.length;
  }


  for (const stem of STEMS) {

    stem.ax =
      stem.x1 / 100 * width;

    stem.ay =
      stem.y1 / 100 * height;

    stem.bx =
      stem.x2 / 100 * width;

    stem.by =
      stem.y2 / 100 * height;
  }
}


// ============================================================
// DRAW
// ============================================================

function draw() {

  if (!ready) {
    background(20);
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


  // ---------- 控制飞入 ----------

  updateEntering(dt);


  // ---------- 更新粒子 ----------

  for (const bird of birds) {
    bird.update(dt);
  }


  // ---------- 删除已经完全飞出的粒子 ----------

  birds =
    birds.filter(
      bird =>
        !bird.removeMe
    );


  solveOverlaps();

  updateTrails(dt);

  drawTrails();


  // ==========================================================
  // 后层粒子
  // ==========================================================

  for (const bird of birds) {

    if (
      bird.state !== "flight" &&
      bird.state !== "enter" &&
      bird.state !== "exit" &&
      bird.depth === "behind"
    ) {
      bird.draw();
    }
  }


  // ==========================================================
  // 穗遮挡
  // ==========================================================

  redrawHeads();


  // ==========================================================
  // 前层粒子 + 飞行粒子
  // ==========================================================

  for (const bird of birds) {

    if (
      bird.state === "flight" ||
      bird.state === "enter" ||
      bird.state === "exit" ||
      bird.depth === "front"
    ) {
      bird.draw();
    }
  }


  if (CFG.debug) {
    drawDebug();
  }
}


// ============================================================
// 飞入控制
// ============================================================

function resetEnterTimer() {

  enterTimer =
    random(
      CFG.enterInterval[0],
      CFG.enterInterval[1]
    );
}


function updateEntering(dt) {

  if (!CFG.enterEnabled) {
    return;
  }

  enterTimer -=
    dt;


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

    const groupID =
      chooseBalancedGroup();

    const perch =
      choosePerch(
        groupID,
        null
      );

    const position =
      perchPosition(
        perch
      );

    birds.push(
      new ReedBird(
        nextBirdID++,
        groupID,
        perch,
        position,
        false
      )
    );
  }
}


// ============================================================
// 新粒子从画外飞入
// ============================================================

function createEnteringBird() {

  if (
    birds.length >=
    CFG.maxCount
  ) {
    return;
  }


  const groupID =
    chooseBalancedGroup();


  const perch =
    choosePerch(
      groupID,
      null
    );


  const target =
    perchPosition(
      perch
    );


  const start =
    getEntryPoint(
      target
    );


  const bird =
    new ReedBird(
      nextBirdID++,
      groupID,
      perch,
      start,
      true
    );


  bird.beginEntering(
    perch,
    target
  );


  birds.push(
    bird
  );
}


// ============================================================
// 选择飞入位置
// ============================================================

function getEntryPoint(target) {

  const sideValue =
    random();


  // ---------- 左侧 ----------

  if (
    sideValue <
    CFG.enterFromLeft
  ) {

    return {
      x:
        -CFG.size * 2,

      y:
        constrain(
          target.y +
          random(-220, 220),
          50,
          height - 50
        )
    };
  }


  // ---------- 右侧 ----------

  if (
    sideValue <
    CFG.enterFromLeft +
    CFG.enterFromRight
  ) {

    return {
      x:
        width +
        CFG.size * 2,

      y:
        constrain(
          target.y +
          random(-220, 220),
          50,
          height - 50
        )
    };
  }


  // ---------- 上方 ----------

  return {

    x:
      constrain(
        target.x +
        random(-300, 300),
        50,
        width - 50
      ),

    y:
      -CFG.size * 2
  };
}


// ============================================================
// 选择数量较少的区域
// ============================================================

function chooseBalancedGroup() {

  const counts =
    [0, 0, 0];


  for (const bird of birds) {

    if (
      bird.group >= 0 &&
      bird.group <= 2
    ) {

      counts[
        bird.group
      ]++;
    }
  }


  const smallest =
    min(
      counts[0],
      counts[1],
      counts[2]
    );


  const choices =
    [];


  for (
    let i = 0;
    i < 3;
    i++
  ) {

    if (
      counts[i] <=
      smallest + 1
    ) {

      choices.push(
        i
      );
    }
  }


  return choices[
    floor(
      random(
        choices.length
      )
    )
  ];
}


// ============================================================
// 多边形路径
// ============================================================

function makeHeadPath(points) {

  drawingContext.beginPath();

  drawingContext.moveTo(
    points[0].x,
    points[0].y
  );

  for (
    let i = 1;
    i < points.length;
    i++
  ) {

    drawingContext.lineTo(
      points[i].x,
      points[i].y
    );
  }

  drawingContext.closePath();
}


// ============================================================
// 穗重新覆盖
// ============================================================

function redrawHeads() {

  push();

  for (const head of HEADS) {

    drawingContext.save();

    makeHeadPath(
      head.points
    );

    drawingContext.clip();

    image(
      bgImg,
      0,
      0,
      width,
      height
    );

    drawingContext.restore();
  }

  pop();
}


// ============================================================
// 选择停留点
// ============================================================

function choosePerch(
  groupID,
  current
) {

  const options =
    [];


  for (
    let i = 0;
    i < HEADS.length;
    i++
  ) {

    if (
      HEADS[i].group ===
      groupID
    ) {

      options.push({
        type: "head",
        index: i
      });
    }
  }


  for (
    let i = 0;
    i < STEMS.length;
    i++
  ) {

    if (
      STEMS[i].group ===
      groupID
    ) {

      options.push({
        type: "stem",
        index: i
      });
    }
  }


  let filtered =
    options.filter(
      option =>
        !current ||
        option.type !== current.type ||
        option.index !== current.index
    );


  if (
    filtered.length === 0
  ) {

    filtered =
      options;
  }


  if (
    random() >
    CFG.stemChance
  ) {

    const headOnly =
      filtered.filter(
        option =>
          option.type ===
          "head"
      );


    if (
      headOnly.length >
      0
    ) {

      filtered =
        headOnly;
    }
  }


  return filtered[
    floor(
      random(
        filtered.length
      )
    )
  ];
}


// ============================================================
// 点是否在多边形中
// ============================================================

function pointInPolygon(
  xValue,
  yValue,
  points
) {

  let inside =
    false;


  for (
    let i = 0,
        j = points.length - 1;
    i < points.length;
    j = i++
  ) {

    const xi =
      points[i].x;

    const yi =
      points[i].y;

    const xj =
      points[j].x;

    const yj =
      points[j].y;


    const intersect =
      (
        (yi > yValue) !==
        (yj > yValue)
      ) &&
      (
        xValue <
        (
          (xj - xi) *
          (yValue - yi)
        ) /
        (
          yj - yi +
          0.000001
        ) +
        xi
      );


    if (intersect) {
      inside =
        !inside;
    }
  }


  return inside;
}


// ============================================================
// 穗内随机点
// ============================================================

function randomHeadPosition(
  headIndex
) {

  const head =
    HEADS[
      headIndex
    ];


  let minX =
    Infinity;

  let maxX =
    -Infinity;

  let minY =
    Infinity;

  let maxY =
    -Infinity;


  for (const p of head.points) {

    minX =
      min(
        minX,
        p.x
      );

    maxX =
      max(
        maxX,
        p.x
      );

    minY =
      min(
        minY,
        p.y
      );

    maxY =
      max(
        maxY,
        p.y
      );
  }


  for (
    let attemptIndex = 0;
    attemptIndex < 80;
    attemptIndex++
  ) {

    const xValue =
      random(
        minX,
        maxX
      );


    const yValue =
      random(
        lerp(
          minY,
          maxY,
          0.22
        ),

        lerp(
          minY,
          maxY,
          0.88
        )
      );


    if (
      pointInPolygon(
        xValue,
        yValue,
        head.points
      )
    ) {

      return {
        x: xValue,
        y: yValue
      };
    }
  }


  return {
    x: head.cx,
    y: head.cy
  };
}


// ============================================================
// 杆上随机点
// ============================================================

function randomStemPosition(
  stemIndex
) {

  const stem =
    STEMS[
      stemIndex
    ];


  const ratio =
    random(
      0.12,
      0.72
    );


  return {

    x:
      lerp(
        stem.ax,
        stem.bx,
        ratio
      ),

    y:
      lerp(
        stem.ay,
        stem.by,
        ratio
      )
  };
}


// ============================================================
// 获取停留位置
// ============================================================

function perchPosition(
  perch
) {

  if (
    perch.type ===
    "head"
  ) {

    return randomHeadPosition(
      perch.index
    );
  }


  return randomStemPosition(
    perch.index
  );
}


// ============================================================
// 粒子类
// ============================================================

class ReedBird {

  constructor(
    id,
    groupID,
    perch,
    position,
    entering
  ) {

    this.id =
      id;

    this.group =
      groupID;

    this.perch =
      perch;

    this.x =
      position.x;

    this.y =
      position.y;

    this.state =
      entering
        ? "enter"
        : "rest";

    this.depth =
      random() <
      CFG.behindChance
        ? "behind"
        : "front";


    this.timer =
      random(
        CFG.pauseTime[0],
        CFG.pauseTime[1]
      );


    this.perchTimer =
      random(
        CFG.perchTime[0],
        CFG.perchTime[1]
      );


    this.totalStay =
      0;


    this.moveTarget =
      null;


    this.flightStart =
      null;

    this.flightTarget =
      null;

    this.flightPerch =
      null;

    this.flightAge =
      0;

    this.flightDuration =
      1;

    this.flightCurve =
      0;


    this.previousX =
      this.x;

    this.previousY =
      this.y;


    this.trailDistance =
      0;


    this.removeMe =
      false;
  }


  // ==========================================================
  // UPDATE
  // ==========================================================

  update(dt) {

    this.previousX =
      this.x;

    this.previousY =
      this.y;


    if (
      this.state !==
      "enter" &&
      this.state !==
      "exit"
    ) {

      this.totalStay +=
        dt;
    }


    if (
      this.state ===
      "rest"
    ) {

      this.updateRest(
        dt
      );
    }

    else if (
      this.state ===
      "hop"
    ) {

      this.updateHop(
        dt
      );
    }

    else if (
      this.state ===
      "flight"
    ) {

      this.updateFlight(
        dt
      );
    }

    else if (
      this.state ===
      "enter"
    ) {

      this.updateEnter(
        dt
      );
    }

    else if (
      this.state ===
      "exit"
    ) {

      this.updateExit(
        dt
      );
    }


    this.makeTrail();
  }


  // ==========================================================
  // 停留
  // ==========================================================

  updateRest(dt) {

    this.timer -=
      dt;

    this.perchTimer -=
      dt;


    // --------------------------------------------------------
    // 偶尔飞出
    // --------------------------------------------------------

    if (
      CFG.exitEnabled &&
      birds.length >
      CFG.minCount &&
      this.totalStay >
      CFG.exitMinStay &&
      this.perchTimer <=
      0
    ) {

      if (
        random() <
        CFG.exitChance
      ) {

        this.startExit();
        return;
      }
    }


    // --------------------------------------------------------
    // 普通换芦苇
    // --------------------------------------------------------

    if (
      this.perchTimer <=
      0
    ) {

      this.startFlight();
      return;
    }


    // --------------------------------------------------------
    // 穗上移动
    // --------------------------------------------------------

    if (
      this.timer <=
      0
    ) {

      this.startHop();
    }
  }


  // ==========================================================
  // 穗/杆上短移
  // ==========================================================

  startHop() {

    this.moveTarget =
      perchPosition(
        this.perch
      );


    const dx =
      this.moveTarget.x -
      this.x;

    const dy =
      this.moveTarget.y -
      this.y;


    const gap =
      Math.hypot(
        dx,
        dy
      );


    if (
      gap >
      CFG.hopDistance[1]
    ) {

      const directionX =
        dx /
        gap;

      const directionY =
        dy /
        gap;


      const wantedGap =
        random(
          CFG.hopDistance[0],
          CFG.hopDistance[1]
        );


      this.moveTarget = {

        x:
          this.x +
          directionX *
          wantedGap,

        y:
          this.y +
          directionY *
          wantedGap
      };
    }


    this.state =
      "hop";
  }


  // ==========================================================
  // 短移
  // ==========================================================

  updateHop(dt) {

    const dx =
      this.moveTarget.x -
      this.x;

    const dy =
      this.moveTarget.y -
      this.y;


    const gap =
      Math.hypot(
        dx,
        dy
      );


    if (
      gap <
      2
    ) {

      this.x =
        this.moveTarget.x;

      this.y =
        this.moveTarget.y;


      this.state =
        "rest";


      this.timer =
        random(
          CFG.pauseTime[0],
          CFG.pauseTime[1]
        );


      return;
    }


    const speedValue =
      random(
        CFG.hopSpeed[0],
        CFG.hopSpeed[1]
      );


    const moveAmount =
      min(
        gap,
        speedValue *
        dt
      );


    this.x +=
      dx /
      gap *
      moveAmount;


    this.y +=
      dy /
      gap *
      moveAmount;
  }


  // ==========================================================
  // 普通换芦苇
  // ==========================================================

  startFlight() {

    const destination =
      choosePerch(
        this.group,
        this.perch
      );


    const target =
      perchPosition(
        destination
      );


    this.flightStart = {
      x: this.x,
      y: this.y
    };


    this.flightTarget = {
      x: target.x,
      y: target.y
    };


    this.flightPerch =
      destination;


    const gap =
      Math.hypot(
        target.x -
        this.x,

        target.y -
        this.y
      );


    const speedValue =
      random(
        CFG.flightSpeed[0],
        CFG.flightSpeed[1]
      );


    this.flightDuration =
      constrain(
        gap /
        speedValue,
        CFG.flightTime[0],
        CFG.flightTime[1]
      );


    this.flightAge =
      0;


    this.flightCurve =
      random(
        -45,
        45
      );


    this.state =
      "flight";


    this.depth =
      "front";
  }


  // ==========================================================
  // 普通飞行
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


    this.moveAlongFlight(
      progressValue
    );


    if (
      progressValue >=
      1
    ) {

      this.landFromFlight();
    }
  }


  // ==========================================================
  // 开始飞入
  // ==========================================================

  beginEntering(
    destination,
    target
  ) {

    this.flightStart = {
      x: this.x,
      y: this.y
    };


    this.flightTarget = {
      x: target.x,
      y: target.y
    };


    this.flightPerch =
      destination;


    const gap =
      Math.hypot(
        target.x -
        this.x,

        target.y -
        this.y
      );


    const speedValue =
      random(
        CFG.enterSpeed[0],
        CFG.enterSpeed[1]
      );


    this.flightDuration =
      constrain(
        gap /
        speedValue,
        0.7,
        2.4
      );


    this.flightAge =
      0;


    this.flightCurve =
      random(
        -90,
        90
      );


    this.state =
      "enter";


    this.depth =
      "front";
  }


  // ==========================================================
  // 飞入
  // ==========================================================

  updateEnter(dt) {

    this.flightAge +=
      dt;


    const progressValue =
      constrain(
        this.flightAge /
        this.flightDuration,
        0,
        1
      );


    this.moveAlongFlight(
      progressValue
    );


    if (
      progressValue >=
      1
    ) {

      this.landFromFlight();

      this.totalStay =
        0;
    }
  }


  // ==========================================================
  // 开始飞出
  // ==========================================================

  startExit() {

    const destination =
      this.getExitPoint();


    this.flightStart = {
      x: this.x,
      y: this.y
    };


    this.flightTarget =
      destination;


    const gap =
      Math.hypot(
        destination.x -
        this.x,

        destination.y -
        this.y
      );


    const speedValue =
      random(
        CFG.exitSpeed[0],
        CFG.exitSpeed[1]
      );


    this.flightDuration =
      constrain(
        gap /
        speedValue,
        0.7,
        2.4
      );


    this.flightAge =
      0;


    this.flightCurve =
      random(
        -90,
        90
      );


    this.state =
      "exit";


    this.depth =
      "front";
  }


  // ==========================================================
  // 飞出目标
  // ==========================================================

  getExitPoint() {

    // 更自然：
    // 根据当前位置选择比较近的一侧，
    // 但加入随机性，不让所有粒子都走最短路线。

    const leftDistance =
      this.x;

    const rightDistance =
      width -
      this.x;

    const topDistance =
      this.y;


    const sideRoll =
      random();


    // ---------- 左 ----------

    if (
      (
        leftDistance <
        rightDistance &&
        sideRoll <
        0.55
      ) ||
      sideRoll <
      0.25
    ) {

      return {

        x:
          -CFG.size * 3,

        y:
          constrain(
            this.y +
            random(-220, 220),
            40,
            height - 40
          )
      };
    }


    // ---------- 右 ----------

    if (
      sideRoll <
      0.78
    ) {

      return {

        x:
          width +
          CFG.size * 3,

        y:
          constrain(
            this.y +
            random(-220, 220),
            40,
            height - 40
          )
      };
    }


    // ---------- 上 ----------

    return {

      x:
        constrain(
          this.x +
          random(-300, 300),
          40,
          width - 40
        ),

      y:
        -CFG.size * 3
    };
  }


  // ==========================================================
  // 飞出
  // ==========================================================

  updateExit(dt) {

    this.flightAge +=
      dt;


    const progressValue =
      constrain(
        this.flightAge /
        this.flightDuration,
        0,
        1
      );


    this.moveAlongFlight(
      progressValue
    );


    if (
      progressValue >=
      1
    ) {

      this.removeMe =
        true;
    }
  }


  // ==========================================================
  // 公共飞行轨迹
  // ==========================================================

  moveAlongFlight(
    progressValue
  ) {

    const smoothValue =
      progressValue *
      progressValue *
      (
        3 -
        2 *
        progressValue
      );


    const dx =
      this.flightTarget.x -
      this.flightStart.x;

    const dy =
      this.flightTarget.y -
      this.flightStart.y;


    const gap =
      max(
        0.001,
        Math.hypot(
          dx,
          dy
        )
      );


    const normalX =
      -dy /
      gap;

    const normalY =
      dx /
      gap;


    const curveAmount =
      Math.sin(
        PI *
        progressValue
      ) *
      this.flightCurve;


    this.x =
      lerp(
        this.flightStart.x,
        this.flightTarget.x,
        smoothValue
      ) +
      normalX *
      curveAmount;


    this.y =
      lerp(
        this.flightStart.y,
        this.flightTarget.y,
        smoothValue
      ) +
      normalY *
      curveAmount;
  }


  // ==========================================================
  // 落到芦苇
  // ==========================================================

  landFromFlight() {

    this.x =
      this.flightTarget.x;

    this.y =
      this.flightTarget.y;


    this.perch =
      this.flightPerch;


    if (
      this.perch.type ===
      "head"
    ) {

      this.depth =
        random() <
        CFG.behindChance
          ? "behind"
          : "front";
    }

    else {

      this.depth =
        random() <
        0.22
          ? "behind"
          : "front";
    }


    this.state =
      "rest";


    this.timer =
      random(
        CFG.pauseTime[0],
        CFG.pauseTime[1]
      );


    this.perchTimer =
      random(
        CFG.perchTime[0],
        CFG.perchTime[1]
      );
  }


  // ==========================================================
  // 拖尾
  // ==========================================================

  makeTrail() {

    if (
      !CFG.trailEnabled ||
      (
        this.state !==
        "flight" &&
        this.state !==
        "enter" &&
        this.state !==
        "exit"
      )
    ) {

      this.trailDistance =
        0;

      return;
    }


    const moved =
      Math.hypot(
        this.x -
        this.previousX,

        this.y -
        this.previousY
      );


    this.trailDistance +=
      moved;


    if (
      this.trailDistance <
      CFG.trailSpacing
    ) {

      return;
    }


    this.trailDistance =
      0;


    trails.push({

      x:
        this.x,

      y:
        this.y,

      age:
        0,

      life:
        CFG.trailLife
    });
  }


  // ==========================================================
  // DRAW
  // ==========================================================

  draw() {

    const bodyColor =
      color(
        CFG.fill
      );


    bodyColor.setAlpha(
      CFG.opacity
    );


    fill(
      bodyColor
    );


    const edgeColor =
      color(
        CFG.stroke
      );


    stroke(
      edgeColor
    );


    strokeWeight(
      CFG.strokeWeight
    );


    circle(
      this.x,
      this.y,
      CFG.size
    );
  }
}


// ============================================================
// 防重叠
// ============================================================

function solveOverlaps() {

  for (
    let passIndex = 0;
    passIndex < 2;
    passIndex++
  ) {

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


        if (
          birdA.state === "enter" ||
          birdA.state === "exit" ||
          birdB.state === "enter" ||
          birdB.state === "exit"
        ) {

          continue;
        }


        const dx =
          birdB.x -
          birdA.x;

        const dy =
          birdB.y -
          birdA.y;


        const gap =
          Math.hypot(
            dx,
            dy
          );


        if (
          gap <= 0.001 ||
          gap >= CFG.minimumGap
        ) {

          continue;
        }


        const pushAmount =
          (
            CFG.minimumGap -
            gap
          ) /
          2;


        const normalX =
          dx /
          gap;

        const normalY =
          dy /
          gap;


        birdA.x -=
          normalX *
          pushAmount *
          0.25;


        birdA.y -=
          normalY *
          pushAmount *
          0.25;


        birdB.x +=
          normalX *
          pushAmount *
          0.25;


        birdB.y +=
          normalY *
          pushAmount *
          0.25;
      }
    }
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
        CFG.fill
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

      CFG.size *
      (
        0.52 -
        progressValue *
        0.24
      )
    );
  }


  pop();
}


// ============================================================
// DEBUG
// ============================================================

function drawDebug() {

  push();

  noFill();

  strokeWeight(3);


  stroke(
    0,
    255,
    120,
    180
  );


  for (
    let headIndex = 0;
    headIndex < HEADS.length;
    headIndex++
  ) {

    const head =
      HEADS[
        headIndex
      ];


    beginShape();


    for (
      const p of head.points
    ) {

      vertex(
        p.x,
        p.y
      );
    }


    endShape(
      CLOSE
    );


    noStroke();

    fill(
      255,
      255,
      0
    );


    textSize(20);


    text(
      headIndex,
      head.cx,
      head.cy
    );


    noFill();

    stroke(
      0,
      255,
      120,
      180
    );
  }


  stroke(
    255,
    40,
    40,
    220
  );


  for (
    const stem of STEMS
  ) {

    line(
      stem.ax,
      stem.ay,
      stem.bx,
      stem.by
    );
  }


  pop();
}