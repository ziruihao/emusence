import p5 from "p5";
import Boid, { SHAPE } from "./boid";
export default class Predator extends Boid {
  constructor(x, y, speed, p) {
    super(x, y, speed, p);
    this.waypoint = null;
    this.debug = false;
  }

  hunt(boids) {
    let scanRadius = 400;
    let count = 0;
    let adjustment = this.p.createVector();
    for (let other of boids) {
      let d = other.getDistanceFrom(this.position.x, this.position.y);
      if (other != this && d < scanRadius) {
        count += 1;
        adjustment.add(other.position);
        if (this.debug) {
          this.p.stroke(255, 0, 0);
          this.p.strokeWeight(1);
          this.p.line(
            this.position.x,
            this.position.y,
            other.position.x,
            other.position.y
          );
        }
      }
    }
    if (count > 0) {
      adjustment.div(count);
      adjustment.sub(this.position);
    }
    return adjustment;
  }

  setWaypoint(x, y) {
    this.waypoint = this.p.createVector(x, y);
  }

  followWaypoint() {
    let adjustment = this.p.createVector();
    if (this.waypoint) {
      let d = this.getDistanceFrom(this.waypoint.x, this.waypoint.y);
      if (d < 10) {
        this.waypoint = null;
      } else {
        adjustment = p5.Vector.sub(this.waypoint, this.position);
        adjustment.setMag(this.speed);
      }
    }
    return adjustment;
  }

  fly(boids) {
    this.newVelocity = this.p.createVector();
    this.edges();
    let wander = this.wander();
    let hunt = this.hunt(boids);
    let waypoint = this.followWaypoint();
    wander.mult(0.8);
    hunt.mult(0.1);
    waypoint.mult(0.6);
    this.newVelocity.add(wander);
    this.newVelocity.add(hunt);
    this.newVelocity.add(waypoint);
  }

  draw() {
    const color = [155, 37, 42]
    this.p.stroke(...color);
    this.p.point(this.position.x, this.position.y);
    this.trail.slice().reverse().forEach((pos, i) => {
      const decay = (this.TRAIL_LEN - i) / this.TRAIL_LEN;
      this.p.strokeWeight(SHAPE[i] * 2);
      this.p.stroke(...color, 255 * decay);
      this.p.point(pos.x, pos.y);
    });
    if (this.debug) {
      this.p.strokeWeight(0);
      this.p.fill(255, 10);
      this.p.circle(this.position.x, this.position.y, 100);
    }
  }
}
