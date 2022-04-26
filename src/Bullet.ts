import { mat4 } from "gl-matrix-ts";
import GameObject from "./GameObject";
import Canvas from "./WebGL/Canvas";
import Shader from "./WebGL/Shader";
import { TextureRect } from "./WebGL/Shapes";
import { Vec2 } from "./WebGL/Types";

export default class Bullet extends GameObject {
  texRect: TextureRect;
  angle: number;
  canvas: Canvas;
  shader: Shader;
  constructor(pos: Vec2, canvas: Canvas, shader: Shader, angle: number) {
    const size: Vec2 = { x: 64, y: 64 };
    super(pos, size);
    this.canvas = canvas;
    this.shader = shader;
    this.texRect = new TextureRect(
      { x: 0, y: 0 },
      size,
      canvas,
      "assets/bullet.png",
      shader
    );
    this.angle = angle;
  }

  draw(): void {
    const { gl } = this.canvas;
    const programInfo = this.shader.programInfo;
    const model = mat4.create();
	const speed = 10;
    this.pos.x += Math.cos(this.angle) * speed;
	this.pos.y += Math.sin(this.angle) * speed;
    mat4.translate(model, model, [this.pos.x, this.pos.y, 0]);
    gl?.uniformMatrix4fv(
      programInfo?.uniformLocations.uModelMatrix,
      false,
      model
    );

    this.texRect.draw();
  }
}
