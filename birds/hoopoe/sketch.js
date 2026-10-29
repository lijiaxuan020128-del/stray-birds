const CFG = {
image: "戴胜16：9.png",
W: 1920,
H: 1080,
speedValue: 40,
amountValue: 15,
sizeValue: 40,
cohesionValue: 20,
rangeValue: 45,
initialCount: 4,
minCount: 3,
maxCount: 6,
diameter: 28,
fillColor: "#D98232",
fillOpacity: 245,
strokeColor: "#5A351D",
strokeWeight: 1.4,
restTime: [1.3, 4.2],
walkSpeed: [24, 43],
walkDistance: [35, 115],
runChance: 0.16,
runSpeed: [65, 100],
runDistance: [70, 170],
forageChance: 0.58,
foragePause: [0.35, 0.85],
forageRadius: [5, 17],
forageMoves: [2, 5],
flightChance: 0.13,
flightSpeed: [210, 320],
flightDistance: [180, 520],
flightHeight: [25, 80],
enterEnabled: true,
enterInterval: [10, 19],
enterSpeed: [250, 340],
exitEnabled: true,
exitChance: 0.11,
exitMinStay: 14,
exitSpeed: [270, 370],
preferredGap: 135,
avoidRange: 175,
avoidStrength: 0.72,
groundMargin: 12,
trailEnabled: true,
trailLife: 0.18,
trailSpacing: 18,
trailOpacity: 35,
showGround: false,
showObstacles: false
};
const GROUND_POLYGONS = [[
[0.0,50.9],[10.0,54.2],[20.3,58.8],[29.9,64.4],[39.8,66.7],[55.2,66.7],[65.9,73.6],[72.9,73.6],[77.9,76.9],[87.0,78.7],[100.0,80.6],[100.0,100.0],[0.0,100.0]
]];
const OBSTACLE_POLYGONS = [
[[37.5,38.0],[41.5,36.0],[45.0,39.0],[46.5,46.0],[45.5,53.0],[43.0,60.0],[39.0,62.0],[36.5,59.0],[37.8,54.0],[39.0,49.0]],
[[58.0,0.0],[68.0,0.0],[67.0,10.0],[65.0,20.0],[64.0,30.0],[63.0,40.0],[61.5,49.0],[59.0,55.0],[56.5,56.0],[55.0,52.0],[56.0,44.0],[57.0,35.0],[57.5,25.0]],
[[51.0,38.0],[54.0,40.0],[57.0,45.0],[61.0,51.0],[66.0,58.0],[71.5,61.0],[72.5,66.0],[68.0,68.0],[63.0,63.0],[58.5,58.0],[54.0,52.0],[50.0,47.0]],
[[38.0,32.0],[42.0,35.0],[46.0,40.0],[51.0,47.0],[55.0,53.0],[53.0,58.0],[48.0,54.0],[44.0,49.0],[40.0,44.0],[36.0,40.0]],
[[79.0,36.0],[82.0,38.0],[83.5,45.0],[84.0,52.0],[83.5,60.0],[82.0,67.0],[79.5,71.0],[76.5,69.0],[77.5,63.0],[78.5,56.0]],
[[87.0,49.0],[90.0,48.0],[91.5,52.0],[91.0,58.0],[90.0,65.0],[88.0,70.0],[85.5,69.0],[86.5,63.0],[87.0,57.0]],
[[0.0,23.0],[9.0,26.0],[18.0,31.0],[27.0,36.0],[37.0,39.0],[45.0,38.0],[46.0,43.0],[37.0,45.0],[27.0,43.0],[17.0,38.0],[8.0,33.0],[0.0,31.0]]
];
let bgImg;
let imageReady=false;
let groundAreas=[];
let obstacleAreas=[];
let birds=[];
let trails=[];
let nextBirdID=0;
let enterTimer=0;
async function setup(){
const canvasRef=createCanvas(CFG.W,CFG.H);pixelDensity(1);const canvasElement=canvasRef.elt;
canvasElement.style.height="100vh";canvasElement.style.width="auto";canvasElement.style.maxWidth="100vw";canvasElement.style.display="block";canvasElement.style.margin="0 auto";
document.documentElement.style.margin="0";document.documentElement.style.padding="0";document.documentElement.style.overflow="hidden";document.body.style.margin="0";document.body.style.padding="0";document.body.style.overflow="hidden";
bgImg=await loadImage(CFG.image);prepareHabitatGeometry();createInitialBirds();resetEnterTimer();imageReady=true;
}
function prepareHabitatGeometry(){groundAreas=GROUND_POLYGONS.map(polygon=>polygon.map(pair=>({x:pair[0]/100*width,y:pair[1]/100*height})));obstacleAreas=OBSTACLE_POLYGONS.map(polygon=>polygon.map(pair=>({x:pair[0]/100*width,y:pair[1]/100*height})));}
function draw(){if(!imageReady){background(20);return;}image(bgImg,0,0,width,height);const dt=min(deltaTime/1000,0.045);updateEntering(dt);for(const bird of birds)bird.update(dt);birds=birds.filter(bird=>!bird.removeMe);separateBirdParticles();updateTrails(dt);drawTrails();for(const bird of birds)bird.render();if(CFG.showGround)drawGroundDebug();if(CFG.showObstacles)drawObstacleDebug();}
function isInsidePolygon(px,py,polygon){let inside=false;for(let i=0,j=polygon.length-1;i<polygon.length;j=i++){const xi=polygon[i].x,yi=polygon[i].y,xj=polygon[j].x,yj=polygon[j].y;const crosses=((yi>py)!==(yj>py))&&(px<(xj-xi)*(py-yi)/(yj-yi+0.000001)+xi);if(crosses)inside=!inside;}return inside;}
function isValidGround(xValue,yValue){if(xValue<CFG.groundMargin||xValue>width-CFG.groundMargin||yValue<CFG.groundMargin||yValue>height-CFG.groundMargin)return false;let groundFound=false;for(const polygon of groundAreas){if(isInsidePolygon(xValue,yValue,polygon)){groundFound=true;break;}}if(!groundFound)return false;for(const polygon of obstacleAreas){if(isInsidePolygon(xValue,yValue,polygon))return false;}return true;}
function groundRouteIsOpen(startX,startY,endX,endY){const routeLength=Math.hypot(endX-startX,endY-startY);const sampleCount=max(4,ceil(routeLength/18));for(let sampleIndex=1;sampleIndex<=sampleCount;sampleIndex++){const ratio=sampleIndex/sampleCount;const sampleX=lerp(startX,endX,ratio),sampleY=lerp(startY,endY,ratio);if(!isValidGround(sampleX,sampleY))return false;}return true;}
function getRandomGroundPoint(referenceX=null,referenceY=null,minimumGap=0,maximumGap=Infinity){for(let attemptIndex=0;attemptIndex<120;attemptIndex++){const xValue=random(25,width-25),yValue=random(height*0.50,height-25);if(!isValidGround(xValue,yValue))continue;if(referenceX!==null){const gapValue=Math.hypot(xValue-referenceX,yValue-referenceY);if(gapValue<minimumGap||gapValue>maximumGap)continue;}return{x:xValue,y:yValue};}return{x:width*0.25,y:height*0.78};}
function createInitialBirds(){birds=[];for(let i=0;i<CFG.initialCount;i++){const position=findSeparatedGroundPoint();birds.push(new HoopoeParticle(nextBirdID++,position.x,position.y));}}
function findSeparatedGroundPoint(){let bestPoint=getRandomGroundPoint(),bestGap=-1;for(let attemptIndex=0;attemptIndex<50;attemptIndex++){const candidate=getRandomGroundPoint();if(birds.length===0)return candidate;let nearestGap=Infinity;for(const bird of birds){const gapValue=Math.hypot(candidate.x-bird.x,candidate.y-bird.y);nearestGap=min(nearestGap,gapValue);}if(nearestGap>bestGap){bestGap=nearestGap;bestPoint=candidate;}if(nearestGap>=CFG.preferredGap)return candidate;}return bestPoint;}
function resetEnterTimer(){enterTimer=random(CFG.enterInterval[0],CFG.enterInterval[1]);}
function updateEntering(dt){if(!CFG.enterEnabled)return;enterTimer-=dt;if(birds.length<CFG.minCount){createEnteringBird();resetEnterTimer();return;}if(enterTimer<=0){if(birds.length<CFG.maxCount)createEnteringBird();resetEnterTimer();}}
function createEnteringBird(){if(birds.length>=CFG.maxCount)return;const target=findSeparatedGroundPoint();let startX,startY;if(random()<0.5){startX=-CFG.diameter*2;startY=constrain(target.y+random(-180,80),height*0.30,height*0.82);}else{startX=width+CFG.diameter*2;startY=constrain(target.y+random(-180,80),height*0.30,height*0.82);}const bird=new HoopoeParticle(nextBirdID++,startX,startY);bird.beginEntry(target.x,target.y);birds.push(bird);}
class HoopoeParticle{
constructor(id,xValue,yValue){this.id=id;this.x=xValue;this.y=yValue;this.previousX=xValue;this.previousY=yValue;this.state="rest";this.stateTimer=random(CFG.restTime[0],CFG.restTime[1]);this.totalStay=0;this.targetX=xValue;this.targetY=yValue;this.moveSpeed=0;this.forageMovesLeft=0;this.continueForaging=false;this.flightStartX=0;this.flightStartY=0;this.flightTargetX=0;this.flightTargetY=0;this.flightAge=0;this.flightDuration=1;this.flightLift=0;this.trailTravel=0;this.removeMe=false;}
update(dt){this.previousX=this.x;this.previousY=this.y;if(this.state!=="enter"&&this.state!=="exit")this.totalStay+=dt;if(this.state==="rest")this.updateRest(dt);else if(this.state==="walk"||this.state==="run"||this.state==="forage")this.updateGroundMovement(dt);else if(this.state==="flight"||this.state==="enter"||this.state==="exit")this.updateAirMovement(dt);this.makeTrail();}
updateRest(dt){this.stateTimer-=dt;if(this.stateTimer>0)return;if(this.continueForaging&&this.forageMovesLeft>0){this.continueForaging=false;this.chooseForagePoint();return;}this.continueForaging=false;if(CFG.exitEnabled&&birds.length>CFG.minCount&&this.totalStay>CFG.exitMinStay&&random()<CFG.exitChance){this.startExit();return;}if(random()<CFG.flightChance&&this.startGroundFlight())return;if(random()<CFG.forageChance){this.startForaging();return;}if(random()<CFG.runChance)this.startRun();else this.startWalk();}
startWalk(){const target=this.findNearbyGroundTarget(CFG.walkDistance[0],CFG.walkDistance[1],true);if(!target){this.resetRest();return;}this.targetX=target.x;this.targetY=target.y;this.moveSpeed=random(CFG.walkSpeed[0],CFG.walkSpeed[1]);this.state="walk";}
startRun(){const target=this.findNearbyGroundTarget(CFG.runDistance[0],CFG.runDistance[1],true);if(!target){this.startWalk();return;}this.targetX=target.x;this.targetY=target.y;this.moveSpeed=random(CFG.runSpeed[0],CFG.runSpeed[1]);this.state="run";}
startForaging(){this.forageMovesLeft=floor(random(CFG.forageMoves[0],CFG.forageMoves[1]+1));this.continueForaging=false;this.chooseForagePoint();}
chooseForagePoint(){if(this.forageMovesLeft<=0){this.resetRest();return;}const target=this.findNearbyGroundTarget(CFG.forageRadius[0],CFG.forageRadius[1],true);if(!target){this.resetRest();return;}this.targetX=target.x;this.targetY=target.y;this.moveSpeed=random(14,26);this.forageMovesLeft--;this.state="forage";}
updateGroundMovement(dt){const dx=this.targetX-this.x,dy=this.targetY-this.y,gapValue=Math.hypot(dx,dy);if(gapValue<2.5){this.x=this.targetX;this.y=this.targetY;if(this.state==="forage"&&this.forageMovesLeft>0){this.state="rest";this.stateTimer=random(CFG.foragePause[0],CFG.foragePause[1]);this.continueForaging=true;}else{this.continueForaging=false;this.resetRest();}return;}let directionX=dx/gapValue,directionY=dy/gapValue,steerX=directionX,steerY=directionY;for(const otherBird of birds){if(otherBird===this||otherBird.state==="enter"||otherBird.state==="exit")continue;const awayX=this.x-otherBird.x,awayY=this.y-otherBird.y,otherGap=Math.hypot(awayX,awayY);if(otherGap>0.001&&otherGap<CFG.avoidRange){const strength=1-otherGap/CFG.avoidRange;steerX+=awayX/otherGap*strength*CFG.avoidStrength;steerY+=awayY/otherGap*strength*CFG.avoidStrength;}}const steerLength=max(0.001,Math.hypot(steerX,steerY));steerX/=steerLength;steerY/=steerLength;const moveAmount=min(gapValue,this.moveSpeed*dt);let nextX=this.x+steerX*moveAmount,nextY=this.y+steerY*moveAmount;if(!isValidGround(nextX,nextY)){const headingAngle=Math.atan2(steerY,steerX);const turnOptions=[0.28,-0.28,0.55,-0.55,0.85,-0.85,1.15,-1.15];let routeFound=false;for(const turnAmount of turnOptions){const testAngle=headingAngle+turnAmount,testX=this.x+Math.cos(testAngle)*moveAmount,testY=this.y+Math.sin(testAngle)*moveAmount;if(isValidGround(testX,testY)){nextX=testX;nextY=testY;routeFound=true;break;}}if(!routeFound){this.resetRest([0.3,0.8]);return;}}this.x=nextX;this.y=nextY;}
findNearbyGroundTarget(minimumGap,maximumGap,requireOpenRoute){for(let attemptIndex=0;attemptIndex<50;attemptIndex++){const directionAngle=random(TWO_PI),travelGap=random(minimumGap,maximumGap),xValue=this.x+Math.cos(directionAngle)*travelGap,yValue=this.y+Math.sin(directionAngle)*travelGap;if(!isValidGround(xValue,yValue))continue;if(requireOpenRoute&&!groundRouteIsOpen(this.x,this.y,xValue,yValue))continue;return{x:xValue,y:yValue};}return null;}
startGroundFlight(){const target=getRandomGroundPoint(this.x,this.y,CFG.flightDistance[0],CFG.flightDistance[1]);if(!target)return false;this.beginAirMovement(target.x,target.y,"flight",random(CFG.flightSpeed[0],CFG.flightSpeed[1]));return true;}
beginEntry(targetX,targetY){this.beginAirMovement(targetX,targetY,"enter",random(CFG.enterSpeed[0],CFG.enterSpeed[1]));}
startExit(){let targetX;if(random()<0.5)targetX=-CFG.diameter*3;else targetX=width+CFG.diameter*3;const targetY=constrain(this.y-random(70,260),height*0.20,height*0.72);this.beginAirMovement(targetX,targetY,"exit",random(CFG.exitSpeed[0],CFG.exitSpeed[1]));}
beginAirMovement(targetX,targetY,newState,speedValue){this.flightStartX=this.x;this.flightStartY=this.y;this.flightTargetX=targetX;this.flightTargetY=targetY;this.flightAge=0;const travelLength=Math.hypot(targetX-this.x,targetY-this.y);this.flightDuration=constrain(travelLength/speedValue,0.45,2.6);this.flightLift=random(CFG.flightHeight[0],CFG.flightHeight[1]);this.state=newState;}
updateAirMovement(dt){this.flightAge+=dt;const progressValue=constrain(this.flightAge/this.flightDuration,0,1),easedValue=progressValue*progressValue*(3-2*progressValue);this.x=lerp(this.flightStartX,this.flightTargetX,easedValue);this.y=lerp(this.flightStartY,this.flightTargetY,easedValue)-Math.sin(progressValue*PI)*this.flightLift;if(progressValue<1)return;if(this.state==="exit"){this.removeMe=true;return;}this.x=this.flightTargetX;this.y=this.flightTargetY;this.totalStay=0;this.resetRest([0.8,2.2]);}
resetRest(customTime=null){this.state="rest";if(customTime)this.stateTimer=random(customTime[0],customTime[1]);else this.stateTimer=random(CFG.restTime[0],CFG.restTime[1]);}
makeTrail(){if(!CFG.trailEnabled||(this.state!=="flight"&&this.state!=="enter"&&this.state!=="exit")){this.trailTravel=0;return;}const movedAmount=Math.hypot(this.x-this.previousX,this.y-this.previousY);this.trailTravel+=movedAmount;if(this.trailTravel<CFG.trailSpacing)return;this.trailTravel=0;trails.push({x:this.x,y:this.y,age:0,life:CFG.trailLife});}
render(){const bodyColor=color(CFG.fillColor);bodyColor.setAlpha(CFG.fillOpacity);fill(bodyColor);const edgeColor=color(CFG.strokeColor);stroke(edgeColor);strokeWeight(CFG.strokeWeight);circle(this.x,this.y,CFG.diameter);}
}
function separateBirdParticles(){for(let i=0;i<birds.length;i++){for(let j=i+1;j<birds.length;j++){const birdA=birds[i],birdB=birds[j];if(birdA.state==="enter"||birdA.state==="exit"||birdB.state==="enter"||birdB.state==="exit")continue;const dx=birdB.x-birdA.x,dy=birdB.y-birdA.y,gapValue=Math.hypot(dx,dy);if(gapValue<=0.001||gapValue>=CFG.preferredGap)continue;const normalX=dx/gapValue,normalY=dy/gapValue,pushAmount=(1-gapValue/CFG.preferredGap)*2.2,candidateAX=birdA.x-normalX*pushAmount,candidateAY=birdA.y-normalY*pushAmount,candidateBX=birdB.x+normalX*pushAmount,candidateBY=birdB.y+normalY*pushAmount;if(isValidGround(candidateAX,candidateAY)){birdA.x=candidateAX;birdA.y=candidateAY;}if(isValidGround(candidateBX,candidateBY)){birdB.x=candidateBX;birdB.y=candidateBY;}}}}
function updateTrails(dt){for(const trailItem of trails)trailItem.age+=dt;trails=trails.filter(trailItem=>trailItem.age<trailItem.life);}
function drawTrails(){if(!CFG.trailEnabled)return;push();noStroke();for(const trailItem of trails){const progressValue=trailItem.age/trailItem.life,trailColor=color(CFG.fillColor);trailColor.setAlpha(CFG.trailOpacity*(1-progressValue));fill(trailColor);circle(trailItem.x,trailItem.y,CFG.diameter*(0.55-progressValue*0.25));}pop();}
function drawGroundDebug(){push();noFill();stroke(50,255,80,210);strokeWeight(3);for(const polygon of groundAreas){beginShape();for(const polygonPoint of polygon)vertex(polygonPoint.x,polygonPoint.y);endShape(CLOSE);}pop();}
function drawObstacleDebug(){push();fill(255,40,40,45);stroke(255,40,40,220);strokeWeight(3);for(const polygon of obstacleAreas){beginShape();for(const polygonPoint of polygon)vertex(polygonPoint.x,polygonPoint.y);endShape(CLOSE);}pop();}
