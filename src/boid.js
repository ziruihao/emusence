import { clusterColorMap, clusters, options, sliders } from ".";
import p5 from "p5";

export const SHAPE = [
  4, 7, 8, 9, 9, 10, 10, 9, 9, 9, 8, 8, 7, 7, 6, 5, 4, 3, 3, 3
]

// Referenced https://github.com/Niraj22/Flocking-simulation as starting point
export default class Boid {
  constructor(x, y, speed, p, musicPlayer) {
    this.p = p;
    this.position = this.p.createVector(x, y);
    this.speed = speed;
    this.velocity = p5.Vector.random2D();
    this.velocity.setMag(this.speed);
    this.prevHeading = this.velocity.heading();
    this.headingDelta = 0;
    this.fleeing = 0;
    this.trail = [];
    this.musicPlayer = musicPlayer;
    this.cluster = 0;
    this.debug = false;
    this.TRAIL_LEN = SHAPE.length
  }

  edges() {
    const { x, y } = this.position;
    if (x > this.p.windowWidth) {
      this.position.x = 0;
    } else if (x < 0) {
      this.position.x = this.p.windowWidth;
    }
    if (y > this.p.windowHeight) {
      this.position.y = 0;
    } else if (y < 0) {
      this.position.y = this.p.windowHeight;
    }
  }

  wander() {
    let wander = this.p.createVector();
    if (this.p.random(1) < 0.5) {
      const range = Math.PI / 6;
      const currentAngle = this.velocity.heading();
      let wanderAngle = this.p.random(
        currentAngle - range,
        currentAngle + range
      );
      wander = p5.Vector.fromAngle(wanderAngle);
      wander.setMag(this.speed);
    }
    return wander;
  }

  iterate() {
    this.trail.push(this.position.copy());
    if (this.trail.length > this.TRAIL_LEN) {
      this.trail.shift();
    }
    this.position.add(this.velocity);
    if (this.newVelocity.mag() > 0) {
      this.velocity.add(this.newVelocity);
      if (this.fleeing == 2) {
        this.velocity.setMag(this.speed * 2.5);
      } else {
        this.velocity.setMag(this.speed);
      }
    }
    if (this.p.frameCount % 60 == 0 && this.prevHeading) {
      const decay = 1;
      let diff = this.p.abs(
        this.p.degrees(this.velocity.heading()) - this.prevHeading
      );
      if (diff > 180) {
        diff = 360 - diff;
      }
      this.headingDelta = diff * decay + this.headingDelta * (1 - decay);
      this.prevHeading = this.p.degrees(this.velocity.heading());
    }
  }

  getNeighbors() {
    return clusters.length > 0 && this.cluster > 0
      ? clusters[this.cluster - 1].dimension
      : 0;
  }

  flashMusicalOrb() {
    this.orbOpacity = this.p.lerp(
      this.orbOpacity ?? 0.0,
      this.playingMusic ? 0.4 : 0.0,
      0.05
    );

    if (this.orbOpacity > 0) {
      this.p.strokeWeight(0);
      this.p.fill(255, this.orbOpacity * 255); // Set the fill color with the calculated opacity
      this.p.circle(this.position.x, this.position.y, 60 + this.getNeighbors()); // Draw the orb at the center of the canvas
    }
  }

  draw() {
    let color = options.showClusters
      ? clusterColorMap[this.cluster]
      : [139, 69, 30];
    this.p.stroke(...color);
    this.p.point(this.position.x, this.position.y);
    let prevPos;
    this.trail.slice().reverse().forEach((pos, i) => {
      let decay = (this.TRAIL_LEN - i) / this.TRAIL_LEN;
      this.p.strokeWeight(SHAPE[i]);
      if (i == 6) {
        const spine = p5.Vector.sub(pos, prevPos);
        // draw two iscocoles triangles orthogonal to the spine as the fins of the fish
        const left = p5.Vector.add(pos, spine.copy().rotate(-Math.PI / 2).setMag(SHAPE[i] / 3));
        const right = p5.Vector.add(pos, spine.copy().rotate(Math.PI / 2).setMag(SHAPE[i] / 3));
        if (p5.Vector.dist(prevPos, pos) < 50) {
          this.p.triangle(prevPos.x, prevPos.y, pos.x, pos.y, left.x, left.y)
          this.p.triangle(prevPos.x, prevPos.y, pos.x, pos.y, right.x, right.y)
        }
      }
      // this.p.stroke(...color, 255 * decay);
      this.p.stroke(...((i / 3) % 2 == 0 ? (color.map(c => 200)) : color), 255);
      this.p.point(pos.x, pos.y);
      prevPos = pos;
    });
    if (options.showOrbs) {
      this.flashMusicalOrb();
    }

    if (this.debug) {
      this.p.strokeWeight(0);
      this.p.fill(255, 30);
      this.p.circle(this.position.x, this.position.y, 60);
    }
  }

  getDistanceFrom(x, y) {
    return this.p.dist(this.position.x, this.position.y, x, y);
  }

  setCluster(c) {
    this.cluster = c;
  }

  toggleDebug() {
    this.debug = !this.debug;
  }

  debugOff() {
    this.debug = false;
  }

  async playMusic() {
    let neighbors = this.getNeighbors();
    const PLAY_INTERVAL_FRAMES = Math.floor(60 / sliders.cadence.value());
    let chance = 1 * PLAY_INTERVAL_FRAMES;
    const alarm =
      (this.headingDelta > 80 && this.fleeing > 0) || this.fleeing == 2;
    if (neighbors < 6) {
      chance *= 8 ^ 3;
    } else if (neighbors < 24) {
      chance *= 4 ^ 3;
    } else if (neighbors < 48) {
      chance *= 2 ^ 3;
    }
    if (alarm) {
      chance *= 10;
    }
    if (
      !this.playingMusic &&
      this.p.frameCount % PLAY_INTERVAL_FRAMES == 0 &&
      this.p.random(5000) < chance
    ) {
      this.playingMusic = true;
      // 300 radius corresponds to 1-100 quartile
      let duration = (PLAY_INTERVAL_FRAMES / 60) * 1000;
      let velocity = alarm ? 90 : 70;
      let octave;
      let channel = 0;
      if (neighbors < 6) {
        octave = 1;
        channel = 3;
      } else if (neighbors < 24) {
        octave = 0;
        duration *= 2;
        channel = 2;
      } else if (neighbors < 48) {
        octave = 0;
        duration *= 4;
        channel = 1;
      } else {
        octave = -1;
        duration *= 8;
        channel = 0;
      }
      setTimeout(() => {
        this.playingMusic = false;
      }, duration);
      const notes = this.musicPlayer.getNotesToPlay(
        octave,
        channel == 0,
        alarm,
        alarm
      );
      for (let n of notes) {
        this.musicPlayer.play(n, duration, velocity, channel);
      }
    }
  }
}
