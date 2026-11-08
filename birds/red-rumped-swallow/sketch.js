
/*
  飞鸟集 · 金腰燕
  p5.js 2.3.4

  背景：background.jpg

  固定规则：
  - 16:9 背景铺满
  - 无加载文字、滑杆、调试界面
  - 背景加载成功前不生成、不显示粒子
  - 不使用 p5.js 内置函数名作为变量
  - 圆形粒子、大小一致、不透明

  行为：
  - 两对金腰燕独立衔泥
  - 从画面外滑翔进入
  - 在水洼附近平稳降落
  - 低头取泥
  - 沿连续上升弧线飞出画面
  - 稍后再从画面外返回
*/

const JY_SETTINGS = {
  imageFile: "background.jpg",

  canvasRatio: 16 / 9,

  count: 4,

  // 深蓝色主体、腰部浅米杏色描边
  body: "#23385D",
  outline: "#E9C59B",

  // 以1600px画面宽度为参考
  particleDiameter: 18,
  outlineWidth: 2.3,

  // 以60fps为参考的动画时长（帧）
  // 降落约5秒，飞离约4.5秒
  approachFrames: 300,
  departureFrames: 270,

  // 取泥停留时间
  collectMinFrames: 80,
  collectMaxFrames: 145,

  // 离开画面后的等待时间
  returnMinFrames: 90,
  returnMaxFrames: 220,

  // 取泥点，归一化坐标
  mudLocations: [
    [0.565, 0.701],
    [0.610, 0.689],
    [0.660, 0.685],
    [0.730, 0.703]
  ]
};

let jyBackgroundImage = null;
let jyBackgroundLoaded = false;
let jySwallows = [];
let jyCanvasElement = null;

function jyCanvasWidth() {
  const host = document.querySelector("main");

  if (host && host.clientWidth > 0) {
    return Math.max(200, Math.floor(host.clientWidth));
  }

  return Math.max(200, Math.floor(windowWidth));
}

function setup() {
  const cw = jyCanvasWidth();

  jyCanvasElement = createCanvas(
    cw,
    Math.round(cw / JY_SETTINGS.canvasRatio)
  );

  jyCanvasElement.parent(document.querySelector("main"));
  jyCanvasElement.style("display", "block");
  jyCanvasElement.style("margin", "0");
  jyCanvasElement.style("padding", "0");

  pixelDensity(1);
  frameRate(60);

  clear();

  // 图片成功加载后才创建鸟群
  loadImage(
    JY_SETTINGS.imageFile,
    function (loadedPicture) {
      jyBackgroundImage = loadedPicture;

      jySwallows = [];

      for (let i = 0; i < JY_SETTINGS.count; i++) {
        jySwallows.push(new JYSwallow(i));
      }

      jyBackgroundLoaded = true;
    },
    function (loadError) {
      console.error(
        "金腰燕背景图片加载失败：",
        loadError
      );
    }
  );
}

function windowResized() {
  const cw = jyCanvasWidth();

  resizeCanvas(
    cw,
    Math.round(cw / JY_SETTINGS.canvasRatio)
  );
}

function draw() {
  if (!jyBackgroundLoaded || !jyBackgroundImage) {
    clear();
    return;
  }

  image(jyBackgroundImage, 0, 0, width, height);

  for (const swallow of jySwallows) {
    swallow.update();
  }

  for (const swallow of jySwallows) {
    swallow.render();
  }
}

// =====================================
// 基础数学工具
// =====================================

function jyVector(nx, ny) {
  return createVector(nx, ny);
}

function jyClamp(value, low, high) {
  return Math.max(low, Math.min(high, value));
}

function jyCubicPoint(a, b, c, d, t) {
  const u = 1 - t;

  return jyVector(
    a.x * u * u * u +
      3 * b.x * u * u * t +
      3 * c.x * u * t * t +
      d.x * t * t * t,

    a.y * u * u * u +
      3 * b.y * u * u * t +
      3 * c.y * u * t * t +
      d.y * t * t * t
  );
}

function jyLengthBetween(a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;

  return Math.sqrt(dx * dx + dy * dy);
}

// =====================================
// 金腰燕
// =====================================

class JYSwallow {
  constructor(birdIndex) {
    this.birdIndex = birdIndex;
    this.pairIndex = Math.floor(birdIndex / 2);

    this.position = jyVector(0, 0);

    this.phase = random(TWO_PI);

    // 每只鸟的飞行速度有微小差异
    this.speedFactor = random(0.92, 1.08);

    this.stage = "waiting";
    this.stageCounter = 0;
    this.stageLength = 1;

    this.pathPoints = null;
    this.pathProgress = 0;

    this.visible = false;

    // 同一对使用相邻取泥点
    this.mudIndex =
      birdIndex % JY_SETTINGS.mudLocations.length;

    // 初始出场时间错开
    this.stageLength = 1 + birdIndex * 95 +
      random(0, 55);
  }

  getMudTarget() {
    const pointData =
      JY_SETTINGS.mudLocations[this.mudIndex];

    return jyVector(
      pointData[0] + random(-0.007, 0.007),
      pointData[1] + random(-0.004, 0.004)
    );
  }

  beginApproach() {
    // 从画面左右两侧进入
    const fromLeft =
      (this.birdIndex + floor(random(2))) % 2 === 0;

    const startX = fromLeft
      ? random(-0.13, -0.07)
      : random(1.07, 1.13);

    const startY = random(0.17, 0.34);

    const target = this.getMudTarget();

    this.position = jyVector(startX, startY);

    const start = this.position.copy();

    // 长而平缓的滑翔弧线
    // 接近水洼时才逐渐下降
    const firstControl = jyVector(
      lerp(start.x, target.x, 0.32),
      start.y + random(-0.045, 0.045)
    );

    const secondControl = jyVector(
      lerp(start.x, target.x, 0.76),
      target.y - random(0.12, 0.18)
    );

    this.pathPoints = [
      start,
      firstControl,
      secondControl,
      target
    ];

    this.pathProgress = 0;
    this.stage = "approaching";

    const pathLength = jyLengthBetween(start, target);

    this.stageLength =
      JY_SETTINGS.approachFrames *
      jyClamp(pathLength / 0.75, 0.85, 1.35);

    this.visible = true;
  }

  beginCollecting() {
    this.stage = "collecting";
    this.stageCounter = 0;

    this.stageLength = random(
      JY_SETTINGS.collectMinFrames,
      JY_SETTINGS.collectMaxFrames
    );
  }

  beginDeparture() {
    const start = this.position.copy();

    // 每次沿着稳定的方向飞出
    // 不在飞离过程中随机转向
    const goRight =
      start.x >= 0.65 || (
        start.x > 0.55 && random() < 0.55
      );

    const end = jyVector(
      goRight ? random(1.10, 1.18) :
        random(-0.18, -0.10),
      random(0.08, 0.20)
    );

    const dx = end.x - start.x;

    // 先向上爬升，再平稳滑翔离开
    const firstControl = jyVector(
      start.x + dx * 0.22,
      start.y - random(0.17, 0.23)
    );

    const secondControl = jyVector(
      start.x + dx * 0.72,
      end.y + random(0.01, 0.055)
    );

    this.pathPoints = [
      start,
      firstControl,
      secondControl,
      end
    ];

    this.pathProgress = 0;
    this.stage = "departing";

    this.stageLength =
      JY_SETTINGS.departureFrames *
      random(0.93, 1.12);

    this.visible = true;
  }

  beginWaiting() {
    this.stage = "waiting";
    this.stageCounter = 0;

    this.stageLength = random(
      JY_SETTINGS.returnMinFrames,
      JY_SETTINGS.returnMaxFrames
    );

    this.visible = false;
  }

  update() {
    if (this.stage === "waiting") {
      this.stageCounter++;

      if (this.stageCounter >= this.stageLength) {
        this.beginApproach();
      }

      return;
    }

    if (this.stage === "collecting") {
      this.stageCounter++;

      if (this.stageCounter >= this.stageLength) {
        this.beginDeparture();
      }

      return;
    }

    if (
      this.stage === "approaching" ||
      this.stage === "departing"
    ) {
      this.pathProgress +=
        this.speedFactor / this.stageLength;

      const t = jyClamp(this.pathProgress, 0, 1);

      // 沿同一条连续曲线移动，不再随机游走
      this.position = jyCubicPoint(
        this.pathPoints[0],
        this.pathPoints[1],
        this.pathPoints[2],
        this.pathPoints[3],
        t
      );

      if (t >= 1) {
        if (this.stage === "approaching") {
          this.beginCollecting();
        } else {
          this.beginWaiting();
        }
      }
    }
  }

  render() {
    if (!this.visible) return;

    const px = this.position.x * width;
    let py = this.position.y * height;

    // 取泥：轻微低头
    // 不缩放、不改变粒子直径
    if (this.stage === "collecting") {
      const progress =
        this.stageCounter / this.stageLength;

      if (progress > 0.12 && progress < 0.88) {
        const peckMotion = Math.max(
          0,
          Math.sin(
            this.stageCounter * 0.15 + this.phase
          )
        );

        py += peckMotion * height * 0.0025;
      }
    }

    const scaleFactor = width / 1600;

    const particleDiameter = Math.max(
      5,
      JY_SETTINGS.particleDiameter * scaleFactor
    );

    const strokeThickness = Math.max(
      0.8,
      JY_SETTINGS.outlineWidth * scaleFactor
    );

    push();

    stroke(JY_SETTINGS.outline);
    strokeWeight(strokeThickness);

    fill(JY_SETTINGS.body);

    circle(px, py, particleDiameter);

    pop();
  }
}
