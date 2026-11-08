
/*
  ============================================
  飞鸟集 · 栗鹀
  p5.js 2.3.4
  ============================================

  背景图片：栗鹀16：9.png

  功能：
  - 草地跳跃、走动、啄食
  - 草地与灌木之间飞行
  - 灌木停留、换枝
  - 飞入和飞出画面
  - 粒子统一赭红色
  - 背景自动铺满预览框
  - 背景加载完成后才显示画面

  快捷键：
  D：显示或隐藏活动区域
  R：重新生成鸟群
  +：增加一只鸟
  -：减少一只鸟
*/


// ==================================================
// 第一部分：所有可调整参数（中文说明）
// ==================================================

const BUNTING_SETTINGS = {

  // =========================
  // 一、背景与画面
  // =========================

  // 背景图片名称，必须与编辑器中的文件名完全一致
  imageFile: "habitat.jpg?v=20261108-complete1",

  // 原始设计尺寸，保持16:9
  designWidth: 1600,
  designHeight: 900,


  // =========================
  // 二、粒子数量、颜色与大小
  // =========================

  // 画面中的栗鹀总数量
  birdCount: 8,

  // 【主要调整参数】粒子的基础直径
  // 数值越大，所有粒子越大
  // 建议范围：18～30
  particleSize: 20,

  // 所有粒子统一使用的颜色
  particleColor: "#C15A28",

  // 栗褐色描边，与羽色协调
  particleStrokeColor: "#793A24",
  particleStrokeWeight: 1.6,

  // 近处草地粒子的大小比例
  // 1表示使用完整基础直径
  nearGrassScale: 1.0,

  // 远处草地粒子的大小比例
  // 原来0.58，现在0.80
  farGrassScale: 0.70,

  // 灌木上的粒子大小比例
  // 原来0.46，现在0.72
  shrubScale: 0.72,


  // =========================
  // 三、草地与灌木分布
  // =========================

  // 初始时位于草地的鸟所占比例
  // 0.60表示60%在草地，40%在灌木
  initialGrassRatio: 0.60,

  // 从画面外飞入时，选择草地作为目的地的概率
  arrivingGrassRatio: 0.60,


  // =========================
  // 四、飞行速度与轨迹
  // =========================

  // 飞行速度：每秒移动的设计像素数
  flyingSpeed: 270,

  // 个体飞行速度差异
  // 0.25表示上下浮动25%
  speedVariation: 0.25,

  // 飞行轨迹向上拱起的最小高度
  flyingHeightMin: 35,

  // 飞行轨迹向上拱起的最大高度
  flyingHeightMax: 105,

  // 飞行轨迹的左右弯曲幅度
  flyingCurve: 22,


  // =========================
  // 五、草地跳跃
  // =========================

  // 单次跳跃的最短距离
  hoppingDistanceMin: 14,

  // 单次跳跃的最长距离
  hoppingDistanceMax: 42,

  // 跳跃时离开地面的最小高度
  hoppingHeightMin: 5,

  // 跳跃时离开地面的最大高度
  hoppingHeightMax: 15,

  // 跳跃速度
  hoppingSpeed: 105,


  // =========================
  // 六、草地走动
  // =========================

  // 走动速度
  walkingSpeed: 19,

  // 每次连续走动的最短时间，单位秒
  walkingDurationMin: 1.0,

  // 每次连续走动的最长时间，单位秒
  walkingDurationMax: 2.5,


  // =========================
  // 七、草地啄食
  // =========================

  // 每次啄食的最短时间
  feedingDurationMin: 0.6,

  // 每次啄食的最长时间
  feedingDurationMax: 1.8,

  // 啄食时粒子上下移动的幅度
  feedingMovement: 2.2,


  // =========================
  // 八、停留时间
  // =========================

  // 草地上两次行为之间的最短停留时间
  grassPauseMin: 0.2,

  // 草地上两次行为之间的最长停留时间
  grassPauseMax: 1.0,

  // 灌木上的最短停留时间
  shrubPauseMin: 2.0,

  // 灌木上的最长停留时间
  shrubPauseMax: 5.5,


  // =========================
  // 九、草地行为发生权重
  // =========================

  // 数值代表相对权重，不一定要加起来等于100
  // 数值越大，对应行为越容易发生
  grassBehaviors: {

    // 在草地上跳跃
    hop: 35,

    // 在草地上走动
    walk: 20,

    // 在草地上啄食
    feed: 15,

    // 草地内部短距离飞行
    shortFlight: 10,

    // 从草地飞向灌木
    flyToShrub: 15,

    // 从画面中飞离
    leave: 5
  },


  // =========================
  // 十、灌木行为发生权重
  // =========================

  shrubBehaviors: {

    // 继续停留在灌木
    pause: 35,

    // 从一处灌木飞到另一处
    changeShrub: 20,

    // 从灌木飞到草地
    flyToGrass: 35,

    // 从画面中飞离
    leave: 10
  },


  // =========================
  // 十一、飞入飞出
  // =========================

  // 飞离后重新飞入的最短等待时间
  outsideDelayMin: 1.0,

  // 飞离后重新飞入的最长等待时间
  outsideDelayMax: 4.0,

  // 最多允许多少比例的鸟同时飞行
  // 0.55表示55%
  flyingProportion: 0.55,

  // 是否允许从画面上方飞入飞出
  allowTop: true,

  // 是否允许从画面下方飞入飞出
  allowBottom: false,


  // =========================
  // 十二、粒子间距与调试
  // =========================

  // 选择停栖位置时的最小间距
  // 粒子变大后，间距也适当增加
  minimumSeparation: 28,

  // 是否显示草地边界和灌木停栖点
  debug: false
};


// ==================================================
// 第二部分：栖息地位置参数
// ==================================================

const BUNTING_HABITAT = {

  // 草地活动范围的左右边界
  grassLeft: 0.04,
  grassRight: 0.96,

  // 草地活动范围的下边界
  grassBottom: 0.96,

  // 鸟与草地上边界之间的安全距离
  grassPadding: 0.025,

  // 右上角灌木的停栖点
  // 每组数字为横向比例和纵向比例
  shrubLocations: [
    [0.705, 0.30],
    [0.735, 0.23],
    [0.765, 0.32],
    [0.795, 0.18],
    [0.825, 0.27],
    [0.855, 0.15],
    [0.885, 0.26],
    [0.915, 0.17],
    [0.945, 0.25],
    [0.975, 0.18],
    [0.745, 0.37],
    [0.825, 0.36],
    [0.905, 0.34]
  ]
};


// ==================================================
// 第三部分：p5.js 独立实例
// ==================================================

new p5(function(sk) {

  const cfg = BUNTING_SETTINGS;
  const habitat = BUNTING_HABITAT;

  let habitatImage = null;
  let imageStatus = "loading";

  let flock = [];

  let previousFrameMillis = 0;

  let displayScale = 1;
  let displayLeft = 0;
  let displayTop = 0;

  let canvasCreated = false;

  const logicalWidth = cfg.designWidth;
  const logicalHeight = cfg.designHeight;


  // ==================================================
  // 基础计算函数
  // ==================================================

  function limitValue(value, low, high) {
    return Math.max(low, Math.min(high, value));
  }

  function blendValues(startValue, endValue, fraction) {
    return startValue + (endValue - startValue) * fraction;
  }

  function easeValue(value) {
    const fraction = limitValue(value, 0, 1);
    return fraction * fraction * (3 - 2 * fraction);
  }

  function randomRange(low, high) {
    return sk.random(low, high);
  }

  function cloneLocation(location) {
    return {
      x: location.x,
      y: location.y
    };
  }

  function locationDistance(firstLocation, secondLocation) {
    return Math.hypot(
      firstLocation.x - secondLocation.x,
      firstLocation.y - secondLocation.y
    );
  }

  function weightedChoice(weights) {
    const options = Object.keys(weights);

    let totalWeight = 0;

    for (const optionName of options) {
      totalWeight += Math.max(0, weights[optionName]);
    }

    if (totalWeight <= 0) {
      return options[0];
    }

    let remainingWeight = sk.random(totalWeight);

    for (const optionName of options) {
      remainingWeight -= Math.max(0, weights[optionName]);

      if (remainingWeight <= 0) {
        return optionName;
      }
    }

    return options[options.length - 1];
  }


  // ==================================================
  // 画面适配：背景铺满预览框
  // ==================================================

  function updateDisplayTransform() {
    const availableWidth = sk.width;
    const availableHeight = sk.height;

    // contain模式：保持16:9完整画面，空余区域使用目录背景色
    displayScale = Math.min(
      availableWidth / logicalWidth,
      availableHeight / logicalHeight
    );

    displayLeft =
      (availableWidth - logicalWidth * displayScale) / 2;

    displayTop =
      (availableHeight - logicalHeight * displayScale) / 2;
  }

  function resizePreview() {
    if (!canvasCreated) return;

    sk.resizeCanvas(
      Math.max(1, window.innerWidth),
      Math.max(1, window.innerHeight)
    );

    updateDisplayTransform();
  }

  sk.windowResized = function() {
    resizePreview();
  };


  // ==================================================
  // 草地边界
  // ==================================================

  function grassUpperBoundary(normalizedX) {
    const nx = limitValue(normalizedX, 0, 1);

    if (nx < 0.24) {
      return blendValues(0.31, 0.35, nx / 0.24);
    }

    if (nx < 0.48) {
      return blendValues(
        0.35,
        0.44,
        (nx - 0.24) / 0.24
      );
    }

    if (nx < 0.70) {
      return blendValues(
        0.44,
        0.36,
        (nx - 0.48) / 0.22
      );
    }

    return blendValues(
      0.36,
      0.31,
      (nx - 0.70) / 0.30
    );
  }

  function keepInsideGrass(location) {
    const nx = limitValue(
      location.x / logicalWidth,
      habitat.grassLeft,
      habitat.grassRight
    );

    const ny = limitValue(
      location.y / logicalHeight,
      grassUpperBoundary(nx) + habitat.grassPadding,
      habitat.grassBottom
    );

    return {
      x: nx * logicalWidth,
      y: ny * logicalHeight
    };
  }

  function randomGrassLocation() {
    const nx = randomRange(
      habitat.grassLeft,
      habitat.grassRight
    );

    const ny = randomRange(
      grassUpperBoundary(nx) + habitat.grassPadding,
      habitat.grassBottom
    );

    return {
      x: nx * logicalWidth,
      y: ny * logicalHeight
    };
  }

  function nearbyGrassLocation(origin, radius) {
    return keepInsideGrass({
      x: origin.x + randomRange(-radius, radius),
      y: origin.y + randomRange(-radius, radius)
    });
  }


  // ==================================================
  // 灌木停栖位置
  // ==================================================

  function randomShrubLocation() {
    const shrubSpot = sk.random(
      habitat.shrubLocations
    );

    return {
      x: (
        shrubSpot[0] + randomRange(-0.012, 0.012)
      ) * logicalWidth,

      y: (
        shrubSpot[1] + randomRange(-0.012, 0.012)
      ) * logicalHeight
    };
  }


  // ==================================================
  // 避免粒子停栖位置重叠
  // ==================================================

  function chooseAvailableLocation(zoneName, currentBird, origin) {
    let bestLocation = null;
    let bestSeparation = -1;

    for (let attempt = 0; attempt < 30; attempt++) {
      let candidateLocation;

      if (zoneName === "shrub") {
        candidateLocation = randomShrubLocation();
      } else if (origin) {
        candidateLocation = nearbyGrassLocation(
          origin,
          logicalWidth * 0.20
        );
      } else {
        candidateLocation = randomGrassLocation();
      }

      let nearestSeparation = Infinity;

      for (const otherBird of flock) {
        if (
          otherBird === currentBird ||
          otherBird.state === "outside" ||
          otherBird.state === "leaving"
        ) {
          continue;
        }

        const occupiedLocation =
          otherBird.state === "flying" ||
          otherBird.state === "arriving"
            ? otherBird.destination
            : otherBird.location;

        nearestSeparation = Math.min(
          nearestSeparation,
          locationDistance(
            candidateLocation,
            occupiedLocation
          )
        );
      }

      if (nearestSeparation >= cfg.minimumSeparation) {
        return candidateLocation;
      }

      if (nearestSeparation > bestSeparation) {
        bestSeparation = nearestSeparation;
        bestLocation = candidateLocation;
      }
    }

    return bestLocation ||
      (
        zoneName === "shrub"
          ? randomShrubLocation()
          : randomGrassLocation()
      );
  }


  // ==================================================
  // 根据景深调整粒子大小
  // ==================================================

  function depthScale(location, zoneName) {
    if (zoneName === "shrub") {
      return cfg.shrubScale;
    }

    const fraction = limitValue(
      (
        location.y / logicalHeight - 0.36
      ) / (0.94 - 0.36),
      0,
      1
    );

    return blendValues(
      cfg.farGrassScale,
      cfg.nearGrassScale,
      easeValue(fraction)
    );
  }


  // ==================================================
  // 生成画面外的位置
  // ==================================================

  function randomOutsideLocation(reference) {
    const availableSides = ["left", "right"];

    if (cfg.allowTop) {
      availableSides.push("top");
    }

    if (cfg.allowBottom) {
      availableSides.push("bottom");
    }

    const selectedSide = sk.random(availableSides);
    const margin = 90;

    if (selectedSide === "left") {
      return {
        x: -margin,
        y: limitValue(
          reference.y + randomRange(-140, 140),
          20,
          logicalHeight - 20
        )
      };
    }

    if (selectedSide === "right") {
      return {
        x: logicalWidth + margin,
        y: limitValue(
          reference.y + randomRange(-140, 140),
          20,
          logicalHeight - 20
        )
      };
    }

    if (selectedSide === "top") {
      return {
        x: randomRange(
          logicalWidth * 0.12,
          logicalWidth * 0.96
        ),
        y: -margin
      };
    }

    return {
      x: randomRange(
        logicalWidth * 0.1,
        logicalWidth * 0.9
      ),
      y: logicalHeight + margin
    };
  }


  // ==================================================
  // 栗鹀粒子类
  // ==================================================

  class BuntingParticle {

    constructor(initialZone) {
      this.zone = initialZone;
      this.state = "resting";

      this.location = chooseAvailableLocation(
        initialZone,
        null,
        null
      );

      this.origin = cloneLocation(this.location);
      this.destination = cloneLocation(this.location);

      this.sizeScale = depthScale(
        this.location,
        initialZone
      );

      this.originScale = this.sizeScale;
      this.destinationScale = this.sizeScale;

      this.elapsed = 0;
      this.duration = 1;

      this.flightHeight = 0;
      this.flightCurve = 0;
      this.jumpHeight = 0;
      this.feedingPhase = 0;

      this.speedFactor = randomRange(
        1 - cfg.speedVariation,
        1 + cfg.speedVariation
      );

      this.nextZone = initialZone;
      this.outsideDelay = 0;

      this.startRest();
    }


    // 草地或灌木停留
    startRest() {
      this.state = "resting";
      this.elapsed = 0;

      this.duration =
        this.zone === "shrub"
          ? randomRange(
              cfg.shrubPauseMin,
              cfg.shrubPauseMax
            )
          : randomRange(
              cfg.grassPauseMin,
              cfg.grassPauseMax
            );
    }


    // 限制同时飞行的数量
    mayFly() {
      const activeFlights = flock.filter(
        otherBird =>
          otherBird.state === "flying" ||
          otherBird.state === "arriving" ||
          otherBird.state === "leaving"
      ).length;

      const maximumFlights = Math.max(
        1,
        Math.floor(
          flock.length * cfg.flyingProportion
        )
      );

      return activeFlights < maximumFlights;
    }


    // 更新运动状态
    update(elapsedSeconds) {
      if (this.state === "outside") {
        this.outsideDelay -= elapsedSeconds;

        if (
          this.outsideDelay <= 0 &&
          this.mayFly()
        ) {
          this.arriveFromOutside();
        }

        return;
      }

      this.elapsed += elapsedSeconds;

      if (
        this.state === "flying" ||
        this.state === "arriving" ||
        this.state === "leaving"
      ) {
        this.updateFlying();
        return;
      }

      if (this.state === "hopping") {
        this.updateHopping();
        return;
      }

      if (this.state === "walking") {
        this.updateWalking();
        return;
      }

      if (this.state === "feeding") {
        this.updateFeeding();
        return;
      }

      if (
        this.state === "resting" &&
        this.elapsed >= this.duration
      ) {
        this.chooseBehavior();
      }
    }


    // 随机选择下一种行为
    chooseBehavior() {
      const selectedBehavior =
        this.zone === "grass"
          ? weightedChoice(cfg.grassBehaviors)
          : weightedChoice(cfg.shrubBehaviors);

      if (selectedBehavior === "hop") {
        this.startHopping();
        return;
      }

      if (selectedBehavior === "walk") {
        this.startWalking();
        return;
      }

      if (selectedBehavior === "feed") {
        this.startFeeding();
        return;
      }

      if (selectedBehavior === "pause") {
        this.startRest();
        return;
      }

      if (!this.mayFly()) {
        this.startRest();
        return;
      }

      if (selectedBehavior === "shortFlight") {
        this.startFlying(
          chooseAvailableLocation(
            "grass",
            this,
            this.location
          ),
          "grass"
        );
        return;
      }

      if (selectedBehavior === "flyToShrub") {
        this.startFlying(
          chooseAvailableLocation(
            "shrub",
            this,
            null
          ),
          "shrub"
        );
        return;
      }

      if (selectedBehavior === "flyToGrass") {
        this.startFlying(
          chooseAvailableLocation(
            "grass",
            this,
            null
          ),
          "grass"
        );
        return;
      }

      if (selectedBehavior === "changeShrub") {
        this.startFlying(
          chooseAvailableLocation(
            "shrub",
            this,
            null
          ),
          "shrub"
        );
        return;
      }

      if (selectedBehavior === "leave") {
        this.leaveScreen();
        return;
      }

      this.startRest();
    }


    // 开始跳跃
    startHopping() {
      this.state = "hopping";
      this.elapsed = 0;

      this.origin = cloneLocation(this.location);

      const movementAngle = randomRange(
        0,
        Math.PI * 2
      );

      const travelDistance = randomRange(
        cfg.hoppingDistanceMin,
        cfg.hoppingDistanceMax
      );

      this.destination = keepInsideGrass({
        x: this.location.x +
          Math.cos(movementAngle) * travelDistance,

        y: this.location.y +
          Math.sin(movementAngle) * travelDistance
      });

      this.originScale = this.sizeScale;

      this.destinationScale = depthScale(
        this.destination,
        "grass"
      );

      this.duration = Math.max(
        0.25,
        travelDistance / cfg.hoppingSpeed + 0.15
      );

      this.jumpHeight = randomRange(
        cfg.hoppingHeightMin,
        cfg.hoppingHeightMax
      );
    }


    // 更新跳跃
    updateHopping() {
      const progress = limitValue(
        this.elapsed / this.duration,
        0,
        1
      );

      const eased = easeValue(progress);

      this.location.x = blendValues(
        this.origin.x,
        this.destination.x,
        eased
      );

      this.location.y =
        blendValues(
          this.origin.y,
          this.destination.y,
          eased
        ) -
        Math.sin(Math.PI * progress) *
        this.jumpHeight;

      this.sizeScale = blendValues(
        this.originScale,
        this.destinationScale,
        eased
      );

      if (progress >= 1) {
        this.finishGroundMovement();
      }
    }


    // 开始走动
    startWalking() {
      this.state = "walking";
      this.elapsed = 0;

      this.duration = randomRange(
        cfg.walkingDurationMin,
        cfg.walkingDurationMax
      );

      this.origin = cloneLocation(this.location);

      const movementAngle = randomRange(
        0,
        Math.PI * 2
      );

      const travelDistance =
        cfg.walkingSpeed * this.duration;

      this.destination = keepInsideGrass({
        x: this.location.x +
          Math.cos(movementAngle) * travelDistance,

        y: this.location.y +
          Math.sin(movementAngle) * travelDistance
      });

      this.originScale = this.sizeScale;

      this.destinationScale = depthScale(
        this.destination,
        "grass"
      );
    }


    // 更新走动
    updateWalking() {
      const progress = limitValue(
        this.elapsed / this.duration,
        0,
        1
      );

      const eased = easeValue(progress);

      this.location.x = blendValues(
        this.origin.x,
        this.destination.x,
        eased
      );

      this.location.y =
        blendValues(
          this.origin.y,
          this.destination.y,
          eased
        ) +
        Math.sin(progress * Math.PI * 8) *
        1.2 *
        Math.sin(Math.PI * progress);

      this.sizeScale = blendValues(
        this.originScale,
        this.destinationScale,
        eased
      );

      if (progress >= 1) {
        this.finishGroundMovement();
      }
    }


    // 开始啄食
    startFeeding() {
      this.state = "feeding";
      this.elapsed = 0;

      this.duration = randomRange(
        cfg.feedingDurationMin,
        cfg.feedingDurationMax
      );

      this.origin = cloneLocation(this.location);
      this.destination = cloneLocation(this.location);

      this.originScale = this.sizeScale;
      this.destinationScale = this.sizeScale;

      this.feedingPhase = randomRange(
        0,
        Math.PI * 2
      );
    }


    // 更新啄食
    updateFeeding() {
      const progress = limitValue(
        this.elapsed / this.duration,
        0,
        1
      );

      const movementEnvelope =
        Math.sin(Math.PI * progress);

      const feedingMotion = Math.max(
        0,
        Math.sin(
          this.elapsed * 13 +
          this.feedingPhase
        )
      );

      this.location.x = this.origin.x;

      this.location.y =
        this.origin.y +
        feedingMotion *
        cfg.feedingMovement *
        movementEnvelope;

      if (progress >= 1) {
        this.location = cloneLocation(this.origin);
        this.sizeScale = this.originScale;
        this.startRest();
      }
    }


    // 结束地面动作
    finishGroundMovement() {
      this.location = cloneLocation(this.destination);
      this.sizeScale = this.destinationScale;
      this.zone = "grass";
      this.startRest();
    }


    // 开始飞行
    startFlying(
      targetLocation,
      targetZone,
      flightState = "flying"
    ) {
      this.state = flightState;
      this.elapsed = 0;

      this.origin = cloneLocation(this.location);
      this.destination = cloneLocation(targetLocation);

      this.nextZone = targetZone;
      this.originScale = this.sizeScale;

      this.destinationScale = depthScale(
        targetLocation,
        targetZone
      );

      const travelDistance = locationDistance(
        this.origin,
        this.destination
      );

      this.duration = Math.max(
        0.65,
        travelDistance /
        (
          cfg.flyingSpeed *
          this.speedFactor
        )
      );

      this.flightHeight = randomRange(
        cfg.flyingHeightMin,
        cfg.flyingHeightMax
      );

      this.flightCurve = randomRange(
        -cfg.flyingCurve,
        cfg.flyingCurve
      );
    }


    // 更新飞行轨迹
    updateFlying() {
      const progress = limitValue(
        this.elapsed / this.duration,
        0,
        1
      );

      const eased = easeValue(progress);

      const horizontalBase = blendValues(
        this.origin.x,
        this.destination.x,
        eased
      );

      const verticalBase = blendValues(
        this.origin.y,
        this.destination.y,
        eased
      );

      const flightArcFactor =
        Math.sin(Math.PI * eased);

      this.location.x =
        horizontalBase +
        Math.sin(Math.PI * 2 * eased) *
        this.flightCurve *
        flightArcFactor;

      this.location.y =
        verticalBase -
        this.flightHeight *
        flightArcFactor;

      this.sizeScale = blendValues(
        this.originScale,
        this.destinationScale,
        easeValue(eased)
      );

      if (progress >= 1) {
        this.location = cloneLocation(this.destination);
        this.sizeScale = this.destinationScale;

        if (this.state === "leaving") {
          this.state = "outside";

          this.outsideDelay = randomRange(
            cfg.outsideDelayMin,
            cfg.outsideDelayMax
          );
        } else {
          this.zone = this.nextZone;
          this.startRest();
        }
      }
    }


    // 飞离画面
    leaveScreen() {
      const outsideDestination =
        randomOutsideLocation(this.location);

      this.startFlying(
        outsideDestination,
        this.zone,
        "leaving"
      );

      this.destinationScale = limitValue(
        this.sizeScale * randomRange(0.85, 1.05),
        cfg.shrubScale * 0.7,
        cfg.nearGrassScale
      );
    }


    // 从画面外飞入
    arriveFromOutside() {
      const targetZone =
        sk.random() < cfg.arrivingGrassRatio
          ? "grass"
          : "shrub";

      const targetLocation =
        chooseAvailableLocation(
          targetZone,
          this,
          null
        );

      this.location =
        randomOutsideLocation(targetLocation);

      this.sizeScale = limitValue(
        depthScale(targetLocation, targetZone) *
        randomRange(0.8, 1.1),
        0.3,
        1.1
      );

      this.startFlying(
        targetLocation,
        targetZone,
        "arriving"
      );
    }


    // 绘制粒子
    render() {
      if (this.state === "outside") return;

      const diameter =
        cfg.particleSize * this.sizeScale;

      if (
        this.location.x < -diameter ||
        this.location.x > logicalWidth + diameter ||
        this.location.y < -diameter ||
        this.location.y > logicalHeight + diameter
      ) {
        return;
      }

      sk.stroke(cfg.particleStrokeColor);
      sk.strokeWeight(cfg.particleStrokeWeight);
      sk.fill(cfg.particleColor);

      sk.circle(
        this.location.x,
        this.location.y,
        diameter
      );
    }
  }


  // ==================================================
  // 初始化鸟群
  // ==================================================

  function resetFlock() {
    flock = [];

    const desiredCount = Math.max(
      1,
      Math.floor(cfg.birdCount)
    );

    for (let index = 0; index < desiredCount; index++) {
      const initialZone =
        sk.random() < cfg.initialGrassRatio
          ? "grass"
          : "shrub";

      flock.push(
        new BuntingParticle(initialZone)
      );
    }
  }


  // ==================================================
  // 调整鸟群数量
  // ==================================================

  function synchronizeFlock() {
    const desiredCount = Math.max(
      1,
      Math.floor(cfg.birdCount)
    );

    while (flock.length < desiredCount) {
      const initialZone =
        sk.random() < cfg.initialGrassRatio
          ? "grass"
          : "shrub";

      flock.push(
        new BuntingParticle(initialZone)
      );
    }

    if (flock.length > desiredCount) {
      flock.splice(desiredCount);
    }
  }


  // ==================================================
  // 图片加载完成后创建画布
  // ==================================================

  function createReadyCanvas() {
    if (canvasCreated) return;

    sk.createCanvas(
      Math.max(1, window.innerWidth),
      Math.max(1, window.innerHeight)
    );

    canvasCreated = true;
    document.getElementById("loadStatus")?.remove();

    sk.pixelDensity(1);
    sk.frameRate(60);

    updateDisplayTransform();

    resetFlock();

    previousFrameMillis = sk.millis();
  }


  // ==================================================
  // p5.js 初始化
  // ==================================================

  sk.setup = function() {
    imageStatus = "loading";

    sk.loadImage(
      cfg.imageFile,

      function(loadedImage) {
        if (
          loadedImage &&
          loadedImage.width > 0 &&
          loadedImage.height > 0
        ) {
          habitatImage = loadedImage;
          imageStatus = "ready";

          createReadyCanvas();
        } else {
          imageStatus = "error";
          console.error("栗鹀背景图片无效");
        }
      },

      function(loadFailure) {
        imageStatus = "error";
        const status = document.getElementById("loadStatus");
        if (status) status.textContent = "背景加载失败，请刷新重试";

        console.error(
          "栗鹀背景加载失败：",
          cfg.imageFile,
          loadFailure
        );
      }
    );
  };


  // ==================================================
  // 主绘制循环
  // ==================================================

  sk.draw = function() {
    if (
      !canvasCreated ||
      imageStatus !== "ready" ||
      !habitatImage
    ) {
      return;
    }

    const currentMillis = sk.millis();

    const frameStepSeconds = limitValue(
      (currentMillis - previousFrameMillis) / 1000,
      0,
      0.05
    );

    previousFrameMillis = currentMillis;

    sk.background("#27252e");
    sk.push();

    sk.translate(displayLeft, displayTop);
    sk.scale(displayScale);

    // 背景始终铺满整个预览框
    sk.image(
      habitatImage,
      0,
      0,
      logicalWidth,
      logicalHeight
    );

    for (const bird of flock) {
      bird.update(frameStepSeconds);
    }

    for (const bird of flock) {
      bird.render();
    }

    if (cfg.debug) {
      drawDebugOverlay();
    }

    sk.pop();
  };


  // ==================================================
  // 调试区域
  // ==================================================

  function drawDebugOverlay() {
    sk.push();

    sk.noFill();
    sk.stroke(255, 60, 60);
    sk.strokeWeight(2);

    sk.beginShape();

    for (let index = 0; index <= 50; index++) {
      const nx = index / 50;

      sk.vertex(
        nx * logicalWidth,
        grassUpperBoundary(nx) * logicalHeight
      );
    }

    sk.endShape();

    sk.stroke(255, 220, 0);

    for (const shrubSpot of habitat.shrubLocations) {
      sk.circle(
        shrubSpot[0] * logicalWidth,
        shrubSpot[1] * logicalHeight,
        12
      );
    }

    sk.noStroke();
    sk.fill(0, 160);
    sk.rect(12, 12, 280, 85, 8);

    sk.fill(255);
    sk.textAlign(sk.LEFT, sk.TOP);
    sk.textSize(15);

    const flyingCount = flock.filter(
      bird =>
        bird.state === "flying" ||
        bird.state === "arriving" ||
        bird.state === "leaving"
    ).length;

    sk.text(
      "栗鹀数量：" + flock.length +
      "\n飞行中：" + flyingCount +
      "\n帧率：" + Math.floor(sk.frameRate()),
      24,
      24
    );

    sk.pop();
  }


  // ==================================================
  // 键盘交互
  // ==================================================

  sk.keyPressed = function() {
    if (sk.key === "d" || sk.key === "D") {
      cfg.debug = !cfg.debug;
    }

    if (sk.key === "r" || sk.key === "R") {
      resetFlock();
    }

    if (sk.key === "+" || sk.key === "=") {
      cfg.birdCount++;
      synchronizeFlock();
    }

    if (sk.key === "-" || sk.key === "_") {
      cfg.birdCount = Math.max(
        1,
        cfg.birdCount - 1
      );

      synchronizeFlock();
    }

    return false;
  };

});
