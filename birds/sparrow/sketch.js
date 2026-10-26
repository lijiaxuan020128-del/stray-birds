// ============================================================
// 麻雀 · Sparrow
// p5.js 2.3.4
//
// 地面：停顿 / 啄食 / 短跳 / 松散觅食
//
// 自然状态：
// 少量麻雀飞走 / 跳走
// 少量麻雀飞入 / 从左右两侧跳入
// 始终保留一部分麻雀在地面活动
//
// 点击画面：
// 当前麻雀整体受惊飞走
// 随后陆续通过“飞入 + 跳入”恢复
// ============================================================


// ============================================================
// 01. 参数
// ============================================================

const CFG = {

  // ---------- 背景 ----------
  image: "麻雀16：9.png",

  // ---------- 粒子 ----------
  count: 18,
  minCount: 15,
  maxCount: 30,

  size: 22,

  color: "#9D4B3D",

  outline: "#e5c7a4",
  outlineWidth: 1.2,


  // ---------- 地面活动范围 ----------
  left: 0.06,
  right: 0.94,
  top: 0.10,
  bottom: 0.91,

  centerX: 0.50,
  centerY: 0.57,

  spreadX: 0.72,
  spreadY: 0.58,

  minGap: 40,


  // ---------- 普通短跳 ----------
  hopDistanceMin: 14,
  hopDistanceMax: 42,

  hopTimeMin: 0.16,
  hopTimeMax: 0.34,

  hopHeightMin: 3,
  hopHeightMax: 7,

  chainHopChance: 0.24,

  directionVariation: 1.45,


  // ---------- 停顿 ----------
  pauseMin: 0.35,
  pauseMax: 1.80,


  // ---------- 啄食 ----------
  peckChance: 0.42,

  peckTimeMin: 0.24,
  peckTimeMax: 0.42,

  peckMove: 3.5,

  peckCountMin: 1,
  peckCountMax: 2,


  // ---------- 局部聚集 ----------
  socialChance: 0.18,
  socialRadius: 150,
  socialStrength: 0.16,


  // ---------- 地面避让 ----------
  avoidRadius: 34,
  avoidStrength: 0.75,


  // ==========================================================
  // 自然少量进出
  // ==========================================================

  // 每隔多久发生一次小事件
  eventTimeMin: 4.5,
  eventTimeMax: 8.0,

  // 每次只影响少量麻雀
  eventBirdMin: 1,
  eventBirdMax: 3,

  // 正常数量范围内：
  // 约一半概率离开，一半概率进入
  leaveChance: 0.50,

  // 离开方式
  flyLeaveChance: 0.55,

  // 进入方式
  flyEnterChance: 0.58,


  // ---------- 少量飞离 ----------
  leaveDelayMin: 0,
  leaveDelayMax: 0.45,

  takeoffSpeedMin: 190,
  takeoffSpeedMax: 270,

  takeoffUpMin: 170,
  takeoffUpMax: 250,


  // ---------- 空中飞行 ----------
  flightSpeedMin: 230,
  flightSpeedMax: 340,

  flightCohesion: 0.0022,
  flightSeparation: 0.028,
  flightAlign: 0.008,

  flightNoise: 22,

  outsideMargin: 120,


  // ---------- 飞入 ----------
  returnSpeedMin: 180,
  returnSpeedMax: 250,

  landingSpeed: 155,
  landingEase: 0.035,

  landingPauseMin: 0.55,
  landingPauseMax: 1.40,


  // ---------- 两侧跳入 / 跳出 ----------
  sideHopDistanceMin: 24,
  sideHopDistanceMax: 48,

  sideHopTimeMin: 0.20,
  sideHopTimeMax: 0.34,

  sideHopHeightMin: 4,
  sideHopHeightMax: 8,

  sideHopPauseMin: 0.15,
  sideHopPauseMax: 0.55,

  sideEntryDepthMin: 0.12,
  sideEntryDepthMax: 0.30,


  // ==========================================================
  // 点击整体受惊
  // ==========================================================

  scareDelayMin: 0,
  scareDelayMax: 0.85,

  // 全部离开以后多久开始回来
  massReturnDelayMin: 1.8,
  massReturnDelayMax: 3.0,

  // 回来时每只之间的时间差
  massReturnIntervalMin: 0.12,
  massReturnIntervalMax: 0.40
};


// ============================================================
// 02. 全局变量
// ============================================================

let bgElement = null;
let bgReady = false;
let bgFailed = false;

let birds = [];

let nextBirdId = 0;

let nextNaturalEvent = 0;

let lastTime = 0;


// ---------- 点击整体受惊 ----------
let massScare = false;

let massReturnWaiting = false;
let massReturnStart = 0;

let massReturnTarget = 0;
let massReturnCreated = 0;

let nextMassReturn = 0;


// ============================================================
// 03. 初始化
// ============================================================

function setup() {

  createCanvas(
    windowWidth,
    windowHeight
  );

  pixelDensity(1);

  loadBackground();
}


// ============================================================
// 04. 加载背景
// ============================================================

function loadBackground() {

  const img =
    document.createElement("img");

  img.onload = function () {

    bgElement = img;

    bgReady = true;
    bgFailed = false;

    resetFlock();

    lastTime =
      millis() / 1000;
  };

  img.onerror = function () {

    bgFailed = true;

    console.error(
      "无法加载背景图片：" +
      CFG.image
    );
  };

  img.src = CFG.image;
}


// ============================================================
// 05. 主循环
// ============================================================

function draw() {

  if (!bgReady) {

    background(225);

    fill(60);
    noStroke();

    textAlign(
      CENTER,
      CENTER
    );

    textSize(18);

    if (bgFailed) {

      text(
        "背景加载失败，请确认图片名称为：" +
        CFG.image,
        width / 2,
        height / 2
      );

    } else {

      text(
        "正在加载背景……",
        width / 2,
        height / 2
      );
    }

    return;
  }


  drawBackground();


  const now =
    millis() / 1000;

  let dt =
    now - lastTime;

  dt =
    constrain(
      dt,
      0,
      0.04
    );

  lastTime = now;


  updateFlock(
    dt,
    now
  );


  removeFinishedBirds();


  if (massScare) {

    updateMassScare(
      now
    );

  } else {

    updateNaturalEvents(
      now
    );
  }


  drawBirds();
}


// ============================================================
// 06. 背景
// ============================================================

function drawBackground() {

  const imageRatio =
    bgElement.naturalWidth /
    bgElement.naturalHeight;

  const canvasRatio =
    width / height;

  let drawW;
  let drawH;
  let drawX;
  let drawY;


  if (imageRatio > canvasRatio) {

    drawH = height;

    drawW =
      drawH *
      imageRatio;

    drawX =
      (width - drawW) / 2;

    drawY = 0;

  } else {

    drawW = width;

    drawH =
      drawW /
      imageRatio;

    drawX = 0;

    drawY =
      (height - drawH) / 2;
  }


  drawingContext.drawImage(
    bgElement,
    drawX,
    drawY,
    drawW,
    drawH
  );
}


// ============================================================
// 07. 创建初始麻雀群
// ============================================================

function resetFlock() {

  birds = [];

  nextBirdId = 0;

  massScare = false;
  massReturnWaiting = false;

  const now =
    millis() / 1000;


  for (
    let i = 0;
    i < CFG.count;
    i++
  ) {

    const pos =
      findGroundPosition();

    birds.push(
      createGroundBird(
        pos.x,
        pos.y,
        now
      )
    );
  }


  scheduleNextNaturalEvent(
    now
  );
}


// ============================================================
// 08. 创建普通地面麻雀
// ============================================================

function createGroundBird(
  x,
  y,
  now
) {

  return {

    id: nextBirdId++,

    x: x,
    y: y,

    vx: 0,
    vy: 0,

    angle:
      random(TWO_PI),

    state: "ground",

    action: "pause",

    actionStart: now,

    actionDuration:
      random(
        CFG.pauseMin,
        CFG.pauseMax
      ),

    hopStartX: x,
    hopStartY: y,

    hopTargetX: x,
    hopTargetY: y,

    hopHeight:
      random(
        CFG.hopHeightMin,
        CFG.hopHeightMax
      ),

    peckBaseY: y,
    peckCount: 1,

    takeoffTime: 0,

    flightSpeed:
      random(
        CFG.flightSpeedMin,
        CFG.flightSpeedMax
      ),

    returnTargetX: x,
    returnTargetY: y,

    enterTime: 0,

    sideDirection: 1,

    sideGoalX: x,

    sideMode: "enter",

    sideHopStartX: x,
    sideHopStartY: y,

    sideHopTargetX: x,
    sideHopTargetY: y,

    sideHopStartTime: 0,
    sideHopDuration: 0,

    sideHopHeight: 5,

    sidePauseUntil: 0,

    removeMe: false
  };
}


// ============================================================
// 09. 初始位置
// ============================================================

function findGroundPosition() {

  const minX =
    width * CFG.left;

  const maxX =
    width * CFG.right;

  const minY =
    height * CFG.top;

  const maxY =
    height * CFG.bottom;


  const centerX =
    width * CFG.centerX;

  const centerY =
    height * CFG.centerY;


  const spreadX =
    width * CFG.spreadX;

  const spreadY =
    height * CFG.spreadY;


  let lastX = centerX;
  let lastY = centerY;


  for (
    let attempt = 0;
    attempt < 100;
    attempt++
  ) {

    let x =
      centerX +
      randomGaussian() *
      spreadX *
      0.30;


    let y =
      centerY +
      randomGaussian() *
      spreadY *
      0.30;


    x =
      constrain(
        x,
        minX,
        maxX
      );


    y =
      constrain(
        y,
        minY,
        maxY
      );


    let valid = true;


    for (
      const bird of birds
    ) {

      if (
        bird.state === "ground" &&
        dist(
          x,
          y,
          bird.x,
          bird.y
        ) <
        CFG.minGap
      ) {

        valid = false;
        break;
      }
    }


    if (valid) {

      return {
        x,
        y
      };
    }


    lastX = x;
    lastY = y;
  }


  return {
    x: lastX,
    y: lastY
  };
}


// ============================================================
// 10. 更新所有麻雀
// ============================================================

function updateFlock(
  dt,
  now
) {

  for (
    const bird of birds
  ) {

    if (
      bird.state ===
      "ground"
    ) {

      updateGroundBird(
        bird,
        now
      );

    } else if (
      bird.state ===
      "scheduledTakeoff"
    ) {

      if (
        now >=
        bird.takeoffTime
      ) {

        beginTakeoff(
          bird
        );
      }

    } else if (
      bird.state ===
      "takeoff"
    ) {

      updateTakeoff(
        bird,
        dt
      );

    } else if (
      bird.state ===
      "flight"
    ) {

      updateFlight(
        bird,
        dt
      );

    } else if (
      bird.state ===
      "enterWait"
    ) {

      if (
        now >=
        bird.enterTime
      ) {

        beginFlyReturn(
          bird
        );
      }

    } else if (
      bird.state ===
      "returnFly"
    ) {

      updateReturnFly(
        bird,
        dt
      );

    } else if (
      bird.state ===
      "landing"
    ) {

      updateLanding(
        bird,
        dt,
        now
      );

    } else if (
      bird.state ===
      "sideHopWait"
    ) {

      updateSideHopWait(
        bird,
        now
      );

    } else if (
      bird.state ===
      "sideHop"
    ) {

      updateSideHop(
        bird,
        now
      );

    } else if (
      bird.state ===
      "sideHopPause"
    ) {

      updateSideHopPause(
        bird,
        now
      );
    }
  }
}


// ============================================================
// 11. 地面行为
// ============================================================

function updateGroundBird(
  bird,
  now
) {

  if (
    bird.action ===
    "pause"
  ) {

    if (
      now -
      bird.actionStart >=
      bird.actionDuration
    ) {

      chooseGroundAction(
        bird,
        now
      );
    }

  } else if (
    bird.action ===
    "hop"
  ) {

    updateHop(
      bird,
      now
    );

  } else if (
    bird.action ===
    "peck"
  ) {

    updatePeck(
      bird,
      now
    );
  }
}


// ============================================================
// 12. 选择普通地面动作
// ============================================================

function chooseGroundAction(
  bird,
  now
) {

  if (
    random() <
    CFG.peckChance
  ) {

    beginPeck(
      bird,
      now
    );

  } else {

    beginHop(
      bird,
      now
    );
  }
}


// ============================================================
// 13. 啄食
// ============================================================

function beginPeck(
  bird,
  now
) {

  bird.action =
    "peck";

  bird.actionStart =
    now;

  bird.actionDuration =
    random(
      CFG.peckTimeMin,
      CFG.peckTimeMax
    );

  bird.peckBaseY =
    bird.y;

  bird.peckCount =
    floor(
      random(
        CFG.peckCountMin,
        CFG.peckCountMax + 1
      )
    );
}


function updatePeck(
  bird,
  now
) {

  const t =
    constrain(
      (
        now -
        bird.actionStart
      ) /
      bird.actionDuration,
      0,
      1
    );


  const wave =
    sin(
      t *
      PI *
      2 *
      bird.peckCount
    );


  const down =
    max(
      0,
      wave
    );


  bird.y =
    bird.peckBaseY +
    down *
    CFG.peckMove;


  if (t >= 1) {

    bird.y =
      bird.peckBaseY;


    beginPause(
      bird,
      now,
      random(
        0.18,
        0.65
      )
    );
  }
}


// ============================================================
// 14. 普通短跳
// ============================================================

function beginHop(
  bird,
  now
) {

  bird.action =
    "hop";

  bird.actionStart =
    now;

  bird.actionDuration =
    random(
      CFG.hopTimeMin,
      CFG.hopTimeMax
    );


  bird.hopStartX =
    bird.x;

  bird.hopStartY =
    bird.y;


  let moveAngle =
    bird.angle +
    random(
      -CFG.directionVariation,
      CFG.directionVariation
    );


  if (
    random() <
    CFG.socialChance
  ) {

    const friend =
      findNearbyBird(
        bird,
        CFG.socialRadius
      );


    if (friend) {

      const friendAngle =
        atan2(
          friend.y -
          bird.y,

          friend.x -
          bird.x
        );


      moveAngle =
        interpolateAngle(
          moveAngle,
          friendAngle,
          CFG.socialStrength
        );
    }
  }


  const moveDistance =
    random(
      CFG.hopDistanceMin,
      CFG.hopDistanceMax
    );


  let targetX =
    bird.x +
    cos(moveAngle) *
    moveDistance;


  let targetY =
    bird.y +
    sin(moveAngle) *
    moveDistance;


  const avoid =
    groundAvoidance(
      bird,
      targetX,
      targetY
    );


  targetX +=
    avoid.x;

  targetY +=
    avoid.y;


  targetX =
    constrain(
      targetX,
      width * CFG.left,
      width * CFG.right
    );


  targetY =
    constrain(
      targetY,
      height * CFG.top,
      height * CFG.bottom
    );


  bird.hopTargetX =
    targetX;

  bird.hopTargetY =
    targetY;


  bird.angle =
    atan2(
      targetY -
      bird.y,

      targetX -
      bird.x
    );


  bird.hopHeight =
    random(
      CFG.hopHeightMin,
      CFG.hopHeightMax
    );
}


// ============================================================
// 15. 更新普通短跳
// ============================================================

function updateHop(
  bird,
  now
) {

  const t =
    constrain(
      (
        now -
        bird.actionStart
      ) /
      bird.actionDuration,
      0,
      1
    );


  const smoothT =
    t *
    t *
    (3 - 2 * t);


  bird.x =
    lerp(
      bird.hopStartX,
      bird.hopTargetX,
      smoothT
    );


  bird.y =
    lerp(
      bird.hopStartY,
      bird.hopTargetY,
      smoothT
    ) -
    sin(t * PI) *
    bird.hopHeight;


  if (t >= 1) {

    bird.x =
      bird.hopTargetX;

    bird.y =
      bird.hopTargetY;


    if (
      random() <
      CFG.chainHopChance
    ) {

      beginHop(
        bird,
        now
      );

    } else {

      beginPause(
        bird,
        now
      );
    }
  }
}


// ============================================================
// 16. 停顿
// ============================================================

function beginPause(
  bird,
  now,
  customTime = null
) {

  bird.action =
    "pause";

  bird.actionStart =
    now;


  bird.actionDuration =
    customTime !== null
      ? customTime
      : random(
          CFG.pauseMin,
          CFG.pauseMax
        );
}


// ============================================================
// 17. 找附近同伴
// ============================================================

function findNearbyBird(
  bird,
  radius
) {

  let nearest = null;

  let nearestDistance =
    radius;


  for (
    const other of birds
  ) {

    if (
      other === bird ||
      other.state !==
      "ground"
    ) {

      continue;
    }


    const d =
      dist(
        bird.x,
        bird.y,
        other.x,
        other.y
      );


    if (
      d <
      nearestDistance &&
      d >
      CFG.avoidRadius
    ) {

      nearest =
        other;

      nearestDistance =
        d;
    }
  }


  return nearest;
}


// ============================================================
// 18. 地面避让
// ============================================================

function groundAvoidance(
  bird,
  targetX,
  targetY
) {

  let avoidX = 0;
  let avoidY = 0;


  for (
    const other of birds
  ) {

    if (
      other === bird ||
      other.state !==
      "ground"
    ) {

      continue;
    }


    const dx =
      targetX -
      other.x;

    const dy =
      targetY -
      other.y;


    const d =
      sqrt(
        dx * dx +
        dy * dy
      );


    if (
      d > 0 &&
      d <
      CFG.avoidRadius
    ) {

      const force =
        (
          CFG.avoidRadius -
          d
        ) /
        CFG.avoidRadius;


      avoidX +=
        (
          dx / d
        ) *
        force *
        CFG.avoidRadius *
        CFG.avoidStrength;


      avoidY +=
        (
          dy / d
        ) *
        force *
        CFG.avoidRadius *
        CFG.avoidStrength;
    }
  }


  return {
    x: avoidX,
    y: avoidY
  };
}


// ============================================================
// 19. 自然少量进出
// ============================================================

function updateNaturalEvents(
  now
) {

  if (
    now <
    nextNaturalEvent
  ) {

    return;
  }


  const currentCount =
    countActiveBirds();


  // 太少：只进入
  if (
    currentCount <=
    CFG.minCount
  ) {

    naturalEnter(
      now
    );

  // 太多：只离开
  } else if (
    currentCount >=
    CFG.maxCount
  ) {

    naturalLeave(
      now
    );

  } else {

    if (
      random() <
      CFG.leaveChance
    ) {

      naturalLeave(
        now
      );

    } else {

      naturalEnter(
        now
      );
    }
  }


  scheduleNextNaturalEvent(
    now
  );
}


// ============================================================
// 20. 安排下一次自然事件
// ============================================================

function scheduleNextNaturalEvent(
  now
) {

  nextNaturalEvent =
    now +
    random(
      CFG.eventTimeMin,
      CFG.eventTimeMax
    );
}


// ============================================================
// 21. 少量自然离开
// ============================================================

function naturalLeave(
  now
) {

  let candidates =
    birds.filter(
      bird =>
        bird.state ===
        "ground"
    );


  shuffleArray(
    candidates
  );


  let amount =
    floor(
      random(
        CFG.eventBirdMin,
        CFG.eventBirdMax + 1
      )
    );


  amount =
    min(
      amount,
      max(
        0,
        countActiveBirds() -
        CFG.minCount
      )
    );


  for (
    let i = 0;
    i < amount;
    i++
  ) {

    const bird =
      candidates[i];


    if (!bird) {
      continue;
    }


    if (
      random() <
      CFG.flyLeaveChance
    ) {

      scheduleTakeoff(
        bird,
        now,
        random(
          CFG.leaveDelayMin,
          CFG.leaveDelayMax
        )
      );

    } else {

      beginSideLeave(
        bird,
        now
      );
    }
  }
}


// ============================================================
// 22. 少量自然进入
// ============================================================

function naturalEnter(
  now
) {

  let amount =
    floor(
      random(
        CFG.eventBirdMin,
        CFG.eventBirdMax + 1
      )
    );


  amount =
    min(
      amount,
      CFG.maxCount -
      countActiveBirds()
    );


  for (
    let i = 0;
    i < amount;
    i++
  ) {

    const delay =
      i *
      random(
        0.10,
        0.30
      );


    if (
      random() <
      CFG.flyEnterChance
    ) {

      createFlyEnterBird(
        now,
        delay
      );

    } else {

      createSideEnterBird(
        now,
        delay
      );
    }
  }
}


// ============================================================
// 23. 安排少量飞离
// ============================================================

function scheduleTakeoff(
  bird,
  now,
  delay
) {

  bird.state =
    "scheduledTakeoff";

  bird.action =
    "none";

  bird.takeoffTime =
    now +
    delay;
}


// ============================================================
// 24. 开始起飞
// ============================================================

function beginTakeoff(
  bird
) {

  bird.state =
    "takeoff";

  bird.action =
    "none";


  let flightAngle;


  if (
    random() < 0.5
  ) {

    flightAngle =
      random(
        -PI + 0.30,
        -HALF_PI + 0.20
      );

  } else {

    flightAngle =
      random(
        -HALF_PI - 0.20,
        -0.30
      );
  }


  const speedValue =
    random(
      CFG.takeoffSpeedMin,
      CFG.takeoffSpeedMax
    );


  bird.vx =
    cos(
      flightAngle
    ) *
    speedValue;


  bird.vy =
    -random(
      CFG.takeoffUpMin,
      CFG.takeoffUpMax
    );


  bird.flightSpeed =
    random(
      CFG.flightSpeedMin,
      CFG.flightSpeedMax
    );
}


// ============================================================
// 25. 起飞阶段
// ============================================================

function updateTakeoff(
  bird,
  dt
) {

  bird.x +=
    bird.vx *
    dt;


  bird.y +=
    bird.vy *
    dt;


  bird.vy *=
    pow(
      0.985,
      dt * 60
    );


  bird.vx *=
    pow(
      1.003,
      dt * 60
    );


  if (
    abs(
      bird.vy
    ) < 130
  ) {

    bird.state =
      "flight";
  }
}


// ============================================================
// 26. 空中飞行
// ============================================================

function updateFlight(
  bird,
  dt
) {

  let centerX = 0;
  let centerY = 0;

  let avgVX = 0;
  let avgVY = 0;

  let activeCount = 0;

  let separateX = 0;
  let separateY = 0;


  for (
    const other of birds
  ) {

    if (
      other === bird ||
      (
        other.state !==
        "flight" &&
        other.state !==
        "takeoff"
      )
    ) {

      continue;
    }


    centerX +=
      other.x;

    centerY +=
      other.y;

    avgVX +=
      other.vx;

    avgVY +=
      other.vy;

    activeCount++;


    const dx =
      bird.x -
      other.x;

    const dy =
      bird.y -
      other.y;


    const d =
      sqrt(
        dx * dx +
        dy * dy
      );


    if (
      d > 0 &&
      d < 55
    ) {

      separateX +=
        dx / d;

      separateY +=
        dy / d;
    }
  }


  if (
    activeCount > 0
  ) {

    centerX /=
      activeCount;

    centerY /=
      activeCount;

    avgVX /=
      activeCount;

    avgVY /=
      activeCount;


    bird.vx +=
      (
        centerX -
        bird.x
      ) *
      CFG.flightCohesion;


    bird.vy +=
      (
        centerY -
        bird.y
      ) *
      CFG.flightCohesion;


    bird.vx +=
      (
        avgVX -
        bird.vx
      ) *
      CFG.flightAlign;


    bird.vy +=
      (
        avgVY -
        bird.vy
      ) *
      CFG.flightAlign;


    bird.vx +=
      separateX *
      CFG.flightSeparation *
      60;


    bird.vy +=
      separateY *
      CFG.flightSeparation *
      60;
  }


  const n =
    noise(
      bird.id * 20,
      millis() * 0.00045
    );


  const noiseAngle =
    map(
      n,
      0,
      1,
      -PI,
      PI
    );


  bird.vx +=
    cos(
      noiseAngle
    ) *
    CFG.flightNoise *
    dt;


  bird.vy +=
    sin(
      noiseAngle
    ) *
    CFG.flightNoise *
    dt;


  const currentSpeed =
    sqrt(
      bird.vx *
      bird.vx +
      bird.vy *
      bird.vy
    );


  if (
    currentSpeed > 0
  ) {

    const ratio =
      lerp(
        1,
        bird.flightSpeed /
        currentSpeed,
        0.025
      );


    bird.vx *=
      ratio;

    bird.vy *=
      ratio;
  }


  bird.x +=
    bird.vx *
    dt;

  bird.y +=
    bird.vy *
    dt;


  if (
    bird.x <
    -CFG.outsideMargin ||

    bird.x >
    width +
    CFG.outsideMargin ||

    bird.y <
    -CFG.outsideMargin ||

    bird.y >
    height +
    CFG.outsideMargin
  ) {

    bird.removeMe =
      true;
  }
}


// ============================================================
// 27. 从空中飞入
// ============================================================

function createFlyEnterBird(
  now,
  delay = 0
) {

  const target =
    randomGroundTarget();


  const bird =
    createGroundBird(
      target.x,
      target.y,
      now
    );


  bird.returnTargetX =
    target.x;

  bird.returnTargetY =
    target.y;


  bird.state =
    "enterWait";

  bird.enterTime =
    now +
    delay;


  // 先隐藏在画面外，
  // 真正开始飞入时再决定入口。
  bird.x =
    -CFG.outsideMargin;

  bird.y =
    -CFG.outsideMargin;


  birds.push(
    bird
  );
}


// ============================================================
// 28. 开始从空中飞入
// ============================================================

function beginFlyReturn(
  bird
) {

  bird.state =
    "returnFly";


  const side =
    floor(
      random(3)
    );


  if (side === 0) {

    bird.x =
      -CFG.outsideMargin;

    bird.y =
      random(
        height * 0.05,
        height * 0.42
      );

  } else if (
    side === 1
  ) {

    bird.x =
      width +
      CFG.outsideMargin;

    bird.y =
      random(
        height * 0.05,
        height * 0.42
      );

  } else {

    bird.x =
      random(
        width * 0.12,
        width * 0.88
      );

    bird.y =
      -CFG.outsideMargin;
  }


  const returnAngle =
    atan2(
      bird.returnTargetY -
      bird.y,

      bird.returnTargetX -
      bird.x
    );


  const returnSpeed =
    random(
      CFG.returnSpeedMin,
      CFG.returnSpeedMax
    );


  bird.vx =
    cos(
      returnAngle
    ) *
    returnSpeed;


  bird.vy =
    sin(
      returnAngle
    ) *
    returnSpeed;
}


// ============================================================
// 29. 更新空中飞入
// ============================================================

function updateReturnFly(
  bird,
  dt
) {

  const dx =
    bird.returnTargetX -
    bird.x;

  const dy =
    bird.returnTargetY -
    bird.y;


  const d =
    sqrt(
      dx * dx +
      dy * dy
    );


  if (
    d < 170
  ) {

    bird.state =
      "landing";

    return;
  }


  const desiredAngle =
    atan2(
      dy,
      dx
    );


  const desiredSpeed =
    (
      CFG.returnSpeedMin +
      CFG.returnSpeedMax
    ) /
    2;


  const desiredVX =
    cos(
      desiredAngle
    ) *
    desiredSpeed;


  const desiredVY =
    sin(
      desiredAngle
    ) *
    desiredSpeed;


  bird.vx =
    lerp(
      bird.vx,
      desiredVX,
      0.025
    );


  bird.vy =
    lerp(
      bird.vy,
      desiredVY,
      0.025
    );


  bird.x +=
    bird.vx *
    dt;

  bird.y +=
    bird.vy *
    dt;
}


// ============================================================
// 30. 降落
// ============================================================

function updateLanding(
  bird,
  dt,
  now
) {

  const dx =
    bird.returnTargetX -
    bird.x;

  const dy =
    bird.returnTargetY -
    bird.y;


  const d =
    sqrt(
      dx * dx +
      dy * dy
    );


  if (
    d < 7
  ) {

    bird.x =
      bird.returnTargetX;

    bird.y =
      bird.returnTargetY;


    bird.vx = 0;
    bird.vy = 0;


    restoreGroundBehavior(
      bird,
      now
    );

    return;
  }


  const desiredAngle =
    atan2(
      dy,
      dx
    );


  const desiredVX =
    cos(
      desiredAngle
    ) *
    CFG.landingSpeed;


  const desiredVY =
    sin(
      desiredAngle
    ) *
    CFG.landingSpeed;


  bird.vx =
    lerp(
      bird.vx,
      desiredVX,
      CFG.landingEase
    );


  bird.vy =
    lerp(
      bird.vy,
      desiredVY,
      CFG.landingEase
    );


  bird.x +=
    bird.vx *
    dt;

  bird.y +=
    bird.vy *
    dt;
}


// ============================================================
// 31. 从左右两侧跳入
// ============================================================

function createSideEnterBird(
  now,
  delay = 0
) {

  const target =
    randomGroundTarget();


  const bird =
    createGroundBird(
      target.x,
      target.y,
      now
    );


  bird.sideMode =
    "enter";


  bird.state =
    "sideHopWait";


  if (
    random() < 0.5
  ) {

    bird.sideDirection = 1;

    bird.x =
      -CFG.size;

    bird.sideGoalX =
      random(
        width *
        CFG.sideEntryDepthMin,

        width *
        CFG.sideEntryDepthMax
      );

  } else {

    bird.sideDirection = -1;

    bird.x =
      width +
      CFG.size;

    bird.sideGoalX =
      random(
        width *
        (
          1 -
          CFG.sideEntryDepthMax
        ),

        width *
        (
          1 -
          CFG.sideEntryDepthMin
        )
      );
  }


  bird.y =
    constrain(
      target.y +
      random(
        -45,
        45
      ),

      height *
      CFG.top,

      height *
      CFG.bottom
    );


  bird.sidePauseUntil =
    now +
    delay;


  birds.push(
    bird
  );
}


// ============================================================
// 32. 从左右两侧跳走
// ============================================================

function beginSideLeave(
  bird,
  now
) {

  bird.action =
    "none";

  bird.sideMode =
    "leave";


  if (
    bird.x <
    width / 2
  ) {

    bird.sideDirection =
      -1;

    bird.sideGoalX =
      -CFG.size * 2;

  } else {

    bird.sideDirection =
      1;

    bird.sideGoalX =
      width +
      CFG.size * 2;
  }


  bird.state =
    "sideHopWait";


  bird.sidePauseUntil =
    now +
    random(
      0,
      0.35
    );
}


// ============================================================
// 33. 两侧跳跃等待
// ============================================================

function updateSideHopWait(
  bird,
  now
) {

  if (
    now >=
    bird.sidePauseUntil
  ) {

    startSideHop(
      bird,
      now
    );
  }
}


// ============================================================
// 34. 开始一次侧面短跳
// ============================================================

function startSideHop(
  bird,
  now
) {

  bird.state =
    "sideHop";


  bird.sideHopStartTime =
    now;


  bird.sideHopDuration =
    random(
      CFG.sideHopTimeMin,
      CFG.sideHopTimeMax
    );


  bird.sideHopStartX =
    bird.x;

  bird.sideHopStartY =
    bird.y;


  const moveDistance =
    random(
      CFG.sideHopDistanceMin,
      CFG.sideHopDistanceMax
    );


  let targetX =
    bird.x +
    bird.sideDirection *
    moveDistance;


  let targetY =
    bird.y +
    random(
      -10,
      10
    );


  targetY =
    constrain(
      targetY,
      height *
      CFG.top,
      height *
      CFG.bottom
    );


  if (
    bird.sideDirection > 0
  ) {

    targetX =
      min(
        targetX,
        bird.sideGoalX
      );

  } else {

    targetX =
      max(
        targetX,
        bird.sideGoalX
      );
  }


  bird.sideHopTargetX =
    targetX;

  bird.sideHopTargetY =
    targetY;


  bird.sideHopHeight =
    random(
      CFG.sideHopHeightMin,
      CFG.sideHopHeightMax
    );
}


// ============================================================
// 35. 更新侧面短跳
// ============================================================

function updateSideHop(
  bird,
  now
) {

  const t =
    constrain(
      (
        now -
        bird.sideHopStartTime
      ) /
      bird.sideHopDuration,
      0,
      1
    );


  const smoothT =
    t *
    t *
    (3 - 2 * t);


  bird.x =
    lerp(
      bird.sideHopStartX,
      bird.sideHopTargetX,
      smoothT
    );


  bird.y =
    lerp(
      bird.sideHopStartY,
      bird.sideHopTargetY,
      smoothT
    ) -
    sin(t * PI) *
    bird.sideHopHeight;


  if (
    t < 1
  ) {

    return;
  }


  bird.x =
    bird.sideHopTargetX;

  bird.y =
    bird.sideHopTargetY;


  const reachedGoal =
    bird.sideDirection > 0
      ? bird.x >=
        bird.sideGoalX - 1
      : bird.x <=
        bird.sideGoalX + 1;


  if (reachedGoal) {

    if (
      bird.sideMode ===
      "leave"
    ) {

      bird.removeMe =
        true;

    } else {

      restoreGroundBehavior(
        bird,
        now
      );
    }

  } else {

    bird.state =
      "sideHopPause";


    bird.sidePauseUntil =
      now +
      random(
        CFG.sideHopPauseMin,
        CFG.sideHopPauseMax
      );
  }
}


// ============================================================
// 36. 侧面短跳之间的停顿
// ============================================================

function updateSideHopPause(
  bird,
  now
) {

  if (
    now >=
    bird.sidePauseUntil
  ) {

    startSideHop(
      bird,
      now
    );
  }
}


// ============================================================
// 37. 恢复最初的地面行为
// ============================================================

function restoreGroundBehavior(
  bird,
  now
) {

  bird.state =
    "ground";


  bird.action =
    "pause";


  bird.vx = 0;
  bird.vy = 0;


  bird.angle =
    random(
      TWO_PI
    );


  bird.actionStart =
    now;


  bird.actionDuration =
    random(
      CFG.landingPauseMin,
      CFG.landingPauseMax
    );


  bird.peckBaseY =
    bird.y;


  bird.hopStartX =
    bird.x;

  bird.hopStartY =
    bird.y;

  bird.hopTargetX =
    bird.x;

  bird.hopTargetY =
    bird.y;
}


// ============================================================
// 38. 随机地面目标
// ============================================================

function randomGroundTarget() {

  let x =
    random(
      width *
      CFG.left,

      width *
      CFG.right
    );


  let y =
    random(
      height *
      CFG.top,

      height *
      CFG.bottom
    );


  for (
    let attempt = 0;
    attempt < 50;
    attempt++
  ) {

    let valid = true;


    for (
      const bird of birds
    ) {

      if (
        bird.state ===
        "ground"
      ) {

        if (
          dist(
            x,
            y,
            bird.x,
            bird.y
          ) <
          CFG.minGap
        ) {

          valid = false;
          break;
        }
      }
    }


    if (valid) {
      break;
    }


    x =
      random(
        width *
        CFG.left,

        width *
        CFG.right
      );


    y =
      random(
        height *
        CFG.top,

        height *
        CFG.bottom
      );
  }


  return {
    x,
    y
  };
}


// ============================================================
// 39. 点击：整体受惊
// ============================================================

function mousePressed() {

  if (
    bgReady &&
    !massScare
  ) {

    triggerMassScare();
  }
}


function touchStarted() {

  if (
    bgReady &&
    !massScare
  ) {

    triggerMassScare();
  }

  return false;
}


// ============================================================
// 40. 触发整体受惊
// ============================================================

function triggerMassScare() {

  massScare = true;

  massReturnWaiting =
    false;

  massReturnCreated =
    0;


  // 点击时恢复到完整群体数量
  massReturnTarget =
    CFG.count;


  const now =
    millis() / 1000;


  for (
    const bird of birds
  ) {

    if (
      bird.state ===
      "ground"
    ) {

      scheduleTakeoff(
        bird,
        now,
        random(
          CFG.scareDelayMin,
          CFG.scareDelayMax
        )
      );

    } else if (
      bird.state ===
      "sideHopWait" ||

      bird.state ===
      "sideHop" ||

      bird.state ===
      "sideHopPause" ||

      bird.state ===
      "returnFly" ||

      bird.state ===
      "landing" ||

      bird.state ===
      "enterWait"
    ) {

      scheduleTakeoff(
        bird,
        now,
        random(
          CFG.scareDelayMin,
          CFG.scareDelayMax
        )
      );
    }
  }
}


// ============================================================
// 41. 更新整体受惊
// ============================================================

function updateMassScare(
  now
) {

  // 等所有旧麻雀真正飞出画面
  if (
    !massReturnWaiting
  ) {

    if (
      birds.length === 0
    ) {

      massReturnWaiting =
        true;


      massReturnStart =
        now +
        random(
          CFG.massReturnDelayMin,
          CFG.massReturnDelayMax
        );


      nextMassReturn =
        massReturnStart;
    }

    return;
  }


  if (
    now <
    nextMassReturn
  ) {

    return;
  }


  if (
    massReturnCreated <
    massReturnTarget
  ) {

    if (
      random() <
      CFG.flyEnterChance
    ) {

      createFlyEnterBird(
        now
      );

    } else {

      createSideEnterBird(
        now
      );
    }


    massReturnCreated++;


    nextMassReturn =
      now +
      random(
        CFG.massReturnIntervalMin,
        CFG.massReturnIntervalMax
      );


    return;
  }


  // 等所有新麻雀真正回到普通地面状态
  let allGround = true;


  for (
    const bird of birds
  ) {

    if (
      bird.state !==
      "ground"
    ) {

      allGround = false;
      break;
    }
  }


  if (allGround) {

    massScare =
      false;

    massReturnWaiting =
      false;


    scheduleNextNaturalEvent(
      now
    );
  }
}


// ============================================================
// 42. 当前麻雀数量
// ============================================================

function countActiveBirds() {

  let count = 0;


  for (
    const bird of birds
  ) {

    if (
      !bird.removeMe
    ) {

      count++;
    }
  }


  return count;
}


// ============================================================
// 43. 删除已经离开的麻雀
// ============================================================

function removeFinishedBirds() {

  birds =
    birds.filter(
      bird =>
        !bird.removeMe
    );
}


// ============================================================
// 44. 数组随机排序
// ============================================================

function shuffleArray(
  array
) {

  for (
    let i =
      array.length - 1;
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
      array[i];

    array[i] =
      array[j];

    array[j] =
      temp;
  }
}


// ============================================================
// 45. 绘制粒子
// ============================================================

function drawBirds() {

  push();


  fill(
    CFG.color
  );


  stroke(
    CFG.outline
  );


  strokeWeight(
    CFG.outlineWidth
  );


  for (
    const bird of birds
  ) {

    // enterWait时仍然在画面外，
    // 不需要显示
    if (
      bird.state ===
      "enterWait"
    ) {

      continue;
    }


    circle(
      bird.x,
      bird.y,
      CFG.size
    );
  }


  pop();
}


// ============================================================
// 46. 角度插值
// ============================================================

function interpolateAngle(
  angleA,
  angleB,
  amount
) {

  let difference =
    angleB -
    angleA;


  while (
    difference > PI
  ) {

    difference -=
      TWO_PI;
  }


  while (
    difference < -PI
  ) {

    difference +=
      TWO_PI;
  }


  return (
    angleA +
    difference *
    amount
  );
}


// ============================================================
// 47. 窗口尺寸变化
// ============================================================

function windowResized() {

  resizeCanvas(
    windowWidth,
    windowHeight
  );


  if (bgReady) {

    resetFlock();
  }
}