import Flocker from "./flocker.js";
import Predator from "./predator.js";
import { MusicPlayer } from "./music.js";
import jDBSCAN from "./jDBScan.js";
import p5 from "p5";

export const flock = [];
export let clusters = [];
export let obstacles = [];
export const options = {
  showClusters: false,
  showOrbs: false
};
let musicPlayer;
let paused = false;
export const sliders = {
  cadence: null,
  population: null,
};
export const defaultSliderValues = {
  cadence: 5,
  population: 120,
};

const sketch = (p) => {
  p.setup = () => {
    musicPlayer = new MusicPlayer();
    p.createCanvas(p.windowWidth, p.windowHeight);
    for (let i = 0; i < defaultSliderValues.population; i += 1) {
      flock.push(
        new Flocker(
          p.random(p.windowWidth),
          p.random(p.windowHeight),
          p.random(2.7, 3.3),
          p,
          musicPlayer
        )
      );
    }

    let pos = 200;
    p.textSize(14);
    sliders.cadence = p.createSlider(0, 30, 1);
    sliders.cadence.value(defaultSliderValues.cadence);
    sliders.cadence.position(50, pos);
    pos += 50
    sliders.population = p.createSlider(0, 240, 5);
    sliders.population.value(defaultSliderValues.population);
    sliders.population.position(50, pos);
    pos += 50
    const addPredatorButton = p.createButton("Add Predator").mousePressed(() => {
      flock.push(
        new Predator(
          p.random(p.windowWidth),
          p.random(p.windowHeight),
          p.random(4.7, 5.3),
          p
        )
      );
    });
    addPredatorButton.position(50, pos);
    pos += 50
    const removePredatorButton = p.createButton("Remove Predator").mousePressed(() => {
      const i = flock.findIndex(boid => boid instanceof Predator)
      flock.splice(i, 1)
    });
    removePredatorButton.position(50, pos);
    pos += 50
    const clustersButton = p
      .createButton("Toggle clusters")
      .mousePressed(() => {
        options.showClusters = !options.showClusters;
      });
    clustersButton.position(50, pos);
    pos += 50
    const orbsButton = p
      .createButton("Toggle orbs")
      .mousePressed(() => {
        options.showOrbs = !options.showOrbs;
      });
    orbsButton.position(50, pos);
    pos += 50
    const clearObstaclesButton = p
      .createButton("Clear obstacles")
      .mousePressed(() => {
        obstacles = [];
      });
    clearObstaclesButton.position(50, pos);
    pos += 50
  };

  p.draw = () => {
    if (!paused) {
      p.background(14, 55, 72);
      p.fill(255, 255);
      p.textAlign(p.LEFT, p.CENTER);
      p.text("Cadence", 50, 190);
      p.text("Population", 50, 240);

      let avgHeading = 0;
      for (let boid of flock) {
        boid.fly(flock, obstacles);
        boid.iterate();
        boid.draw();
        if (musicPlayer.hasInitialized() && !(boid instanceof Predator)) {
          boid.playMusic(flock);
        }
        avgHeading += p.degrees(boid.velocity.heading());
      }
      avgHeading = avgHeading / flock.length;

      obstacles.forEach((o) => {
        p.strokeWeight(0);
        p.fill(15, 82, 75, 255);
        p.ellipse(o.x, o.y, o.e1, o.e2);
        for (let i = 0; i < 8; i += 1) {
          p.strokeWeight(3);
          p.stroke(5, 38, 37, 255);
          p.line(
            o.x + (o.lx1a + o.lx1b * 0.5) * Math.cos(p.radians(i * 45 + o.lx1b)),
            o.y + (o.ly1a + o.ly1b * 0.5) * Math.sin(p.radians(i * 45 + o.ly1b)),
            o.x + o.lx2a * Math.cos(p.radians(i * 45 + o.lx2b)),
            o.y + o.ly2a * Math.sin(p.radians(i * 45 + o.ly2b)),
          );
        }
      });

      p.strokeWeight(0);
      p.fill(255, 150);
      p.circle(100, 100, 100);
      p.strokeWeight(2);
      p.stroke(155, 37, 42, 255);
      p.line(
        100,
        100,
        100 + 30 * Math.cos(p.radians(avgHeading)),
        100 + 30 * Math.sin(p.radians(avgHeading))
      );
      p.stroke(5, 38, 37, 255);
      p.strokeWeight(4);
      p.line(
        100,
        100,
        100 + 30 * Math.cos(p.radians(musicPlayer.getCurrentCirclePos())),
        100 + 30 * Math.sin(p.radians(musicPlayer.getCurrentCirclePos()))
      );
      p.strokeWeight(0);
      p.fill(0, 255);
      p.textAlign(p.CENTER, p.CENTER);
      p.textSize(18);
      p.text(musicPlayer.currentKey, 100, 125);
      p.textAlign(p.LEFT, p.BOTTOM);
      p.text(Math.round(p.frameRate()), 50, p.windowHeight - 50);

      if (p.frameCount % 4 == 0) {
        if (flock.length > sliders.population.value()) {
          flock.splice(0, 1);
        } else if (flock.length < sliders.population.value()) {
          flock.push(
            new Flocker(
              p.random(p.windowWidth),
              p.random(p.windowHeight),
              p.random(2.7, 3.3),
              p,
              musicPlayer
            )
          );
        }
      }
      if (p.frameCount % 10 == 0) {
        recluster();
      }
      if (p.frameCount % 60 == 0) {
        musicPlayer.processFlockMovement(avgHeading);
      }
    }
  };

  p.mouseClicked = () => {
    let x = p.mouseX;
    let y = p.mouseY;
    let closestboid;
    let closestDistance = 100000;
    for (let boid of flock) {
      boid.debugOff();
      let distance = boid.getDistanceFrom(x, y);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestboid = boid;
      }
      if (boid instanceof Predator) {
        boid.setWaypoint(p.mouseX, p.mouseY);
      }
    }
    // closestboid.toggleDebug();
    // if ⇧ is also pressed, add obstacle
    if (p.keyIsDown(16)) {
      obstacles.push({
        x: x, y: y,
        e1: p.random(100, 110),
        e2: p.random(100, 110),
        lx1a: p.random(8, 16),
        lx1b: p.random(-6, 6),
        ly1a: p.random(8, 16),
        ly1b: p.random(-6, 6),
        lx2a: p.random(35, 45),
        lx2b: p.random(-6, 6),
        ly2a: p.random(35, 45),
        ly2b: p.random(-6, 6),
      });
    }
  };

  p.keyPressed = () => {
    if (p.key === "m") {
      if (musicPlayer.hasInitialized()) {
        musicPlayer.reset();
        console.log("Music player reset.");
      } else {
        musicPlayer.init().then(() => {
          console.log("Music player initialized.");
        });
      }
    }
    if (p.key === "p") {
      paused = !paused;
    }
    if (p.key === "c") {
      recluster();
    }
    if (p.key === "x") {
      musicPlayer.stopAll();
    }
  };
};

function recluster() {
  const points = flock.map((boid) => ({
    x: boid.position.x,
    y: boid.position.y,
  }));
  const DBScanner = jDBSCAN()
    .eps(60)
    .minPts(4)
    .distance("EUCLIDEAN")
    .data(points);
  const clusterAssignments = DBScanner();
  clusterAssignments.forEach((c, i) => {
    flock[i].setCluster(c);
  });
  clusters = DBScanner.getClusters();
}

export const clusterColorMap = {
  0: [200, 200, 200],
  1: [195, 30, 30],
  2: [30, 195, 30],
  3: [30, 30, 195],
  4: [255, 255, 0],
  5: [255, 0, 255],
  6: [0, 255, 255],
  7: [125, 125, 255],
  8: [255, 125, 125],
  9: [125, 255, 125],
  10: [85, 210, 210],
  11: [210, 85, 210],
  12: [210, 210, 85],
  13: [200, 200, 200],
  14: [200, 200, 200],
  15: [200, 200, 200],
  16: [200, 200, 200],
  17: [200, 200, 200],
  18: [200, 200, 200],
};

new p5(sketch);
