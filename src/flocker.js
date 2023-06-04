import Boid from "./boid";
import p5 from "p5";
import Predator from "./predator";
import { clusters } from ".";
export default class Flocker extends Boid {
  alignment(boids) {
    let scanRadius = 100;
    let count = 0;
    let adjustment = this.p.createVector();
    for (let other of boids) {
      let d = other.getDistanceFrom(this.position.x, this.position.y);
      if (other != this && d < scanRadius) {
        count += 1;
        adjustment.add(other.velocity);
        if (this.debug) {
          this.p.stroke(0, 255, 0);
          this.p.strokeWeight(0);
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
    }
    return adjustment;
  }

  cohesion(boids) {
    let scanRadius = 50;
    let count = 0;
    let adjustment = this.p.createVector();
    for (let other of boids) {
      let d = other.getDistanceFrom(this.position.x, this.position.y);
      if (other != this && d < scanRadius) {
        count += 1;
        adjustment.add(other.position);
      }
    }
    if (count > 0) {
      adjustment.div(count);
      if (this.debug) {
        this.p.stroke(0, 0, 255);
        this.p.strokeWeight(1);
        this.p.line(
          this.position.x,
          this.position.y,
          adjustment.x,
          adjustment.y
        );
      }
      adjustment.sub(this.position);
    }

    return adjustment;
  }

  seperation(boids) {
    let scanRadius = 50;
    let adjustment = this.p.createVector();
    for (let other of boids) {
      let d = other.getDistanceFrom(this.position.x, this.position.y);
      if (other != this && d < scanRadius) {
        let diff = p5.Vector.sub(this.position, other.position);
        diff.div(d);
        adjustment.add(diff);
        if (this.debug) {
          this.p.stroke(255, 0, 0);
          this.p.strokeWeight(0);
          this.p.line(
            this.position.x,
            this.position.y,
            other.position.x,
            other.position.y
          );
        }
      }
    }
    return adjustment;
  }

  evasion(boids) {
    let scanRadius = 400;
    let adjustment = this.p.createVector();
    let fleeing = 0;
    for (let other of boids) {
      let d = other.getDistanceFrom(this.position.x, this.position.y);
      if (other != this && d < scanRadius && other instanceof Predator) {
        fleeing = 1; // fleeing from a predator
        if (d < 100) {
          fleeing = 2; // more urgent fleeing
        }
        let diff = p5.Vector.sub(this.position, other.position);
        let orthL = p5.Vector.fromAngle(other.velocity.heading() + Math.PI / 2);
        let orthR = p5.Vector.fromAngle(other.velocity.heading() - Math.PI / 2);
        // find which has smallest cosine distance to this boid
        let cosL = p5.Vector.dot(diff, orthL) / (diff.mag() * orthL.mag());
        let cosR = p5.Vector.dot(diff, orthR) / (diff.mag() * orthR.mag());
        // flee towards the direction with the smallest cosine distance
        let orth = cosL > cosR ? orthL : orthR;
        orth.mult(500);
        diff.add(orth);
        diff.div(d);
        adjustment.add(diff);
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
    this.fleeing = fleeing;
    return adjustment;
  }

  avoidance(obstacles) {
    let scanRadius = 100;
    let adjustment = this.p.createVector();
    for (let other of obstacles) {
      const otherPos = this.p.createVector(other.x, other.y);
      let d = this.getDistanceFrom(other.x, other.y);
      if (d < scanRadius) {
        let diff = p5.Vector.sub(this.position, otherPos);
        let orthL = p5.Vector.fromAngle(diff.heading() + Math.PI / 2);
        let orthR = p5.Vector.fromAngle(diff.heading() - Math.PI / 2);
        // find which has smallest cosine distance to this boid
        let cosL =
          p5.Vector.dot(this.velocity, orthL) / (diff.mag() * orthL.mag());
        let cosR =
          p5.Vector.dot(this.velocity, orthR) / (diff.mag() * orthR.mag());
        // flee towards the direction with the smallest cosine distance
        let orth = cosL > cosR ? orthL : orthR;
        orth.mult(diff.mag() * 2);
        diff.add(orth);
        diff.div(d);
        adjustment.add(diff);
        if (this.debug) {
          this.p.stroke(255, 0, 0);
          this.p.strokeWeight(1);
          this.p.line(this.position.x, this.position.y, other.x, other.y);
        }
      }
    }
    return adjustment;
  }

  fly(boids, obstacles) {
    this.newVelocity = this.p.createVector();
    this.edges();
    let alignment = this.alignment(boids);
    let cohesion = this.cohesion(boids);
    let seperation = this.seperation(boids);
    let evasion = this.evasion(boids);
    let wander = this.wander();
    let avoidance = this.avoidance(obstacles);
    seperation.mult(0.8);
    evasion.mult(1.0);
    cohesion.mult(0.1);
    alignment.mult(0.8);
    if (
      this.cluster === 0 ||
      (this.cluster > 0 && clusters[this.cluster - 1].dimension < 50)
    ) {
      wander.mult(3.0);
    } else {
      wander.mult(0.5);
    }
    avoidance.mult(1.2);
    this.newVelocity.add(seperation);
    this.newVelocity.add(evasion);
    this.newVelocity.add(alignment);
    this.newVelocity.add(cohesion);
    this.newVelocity.add(wander);
    this.newVelocity.add(avoidance);
  }
}
