import Bullet from "./Bullet";
import GameObject from "./GameObject";
import Canvas from "./WebGL/Canvas";
import Shader from "./WebGL/Shader";
import { Vec2 } from "./WebGL/Types";

enum PatternType {
  Spiral,
  Radial,
  Focused,
}

export default class Enemy extends GameObject {
  type: PatternType;
  canvas: Canvas;
  shader: Shader;
  bullets: Bullet[];
  constructor(pos: Vec2, type: PatternType, canvas: Canvas, shader: Shader) {
    super(pos, { x: 64, y: 64 });
    this.type = type;
    this.canvas = canvas;
    this.shader = shader;
    this.bullets = [];
  }

  draw(): void {
      for (const bullet of this.bullets) {
          bullet.draw();
      }
  }
}
