import { mat4 } from "gl-matrix-ts";
import Bullet from "./Bullet";
import GameObject from "./GameObject";
import Canvas from "./WebGL/Canvas";
import Shader from "./WebGL/Shader";
import { TextureRect } from "./WebGL/Shapes";
import { Vec2 } from "./WebGL/Types";
import { gameObjects } from "./Global";

enum PatternType {
	Spiral,
	Radial,
	Focused,
}

class Enemy extends GameObject {
	type: PatternType;
	canvas: Canvas;
	shader: Shader;
	bullets: Bullet[];
	texture: TextureRect
	interval: number;
	constructor(pos: Vec2, type: PatternType, canvas: Canvas, shader: Shader) {
		super(pos, { x: 64, y: 64 });
		this.type = type;
		this.canvas = canvas;
		this.shader = shader;
		this.bullets = [];
		this.texture = new TextureRect({x:0, y:0}, this.size, canvas, "assets/test.png", shader);
		this.interval = 0;
	}

	draw(): void {
		const model = mat4.create();
		const {gl} = this.canvas;
		const programInfo = this.shader.programInfo;
		mat4.translate(model, model, [this.pos.x, this.pos.y, 0]);
		gl?.uniformMatrix4fv(
			programInfo?.uniformLocations.uModelMatrix,
			false,
			model,
		);
		this.texture.draw();
		// ++this.interval also returns the value while incrementing
		
		if (++this.interval >= 10) {
			switch (this.type) {
				case PatternType.Focused:
					gameObjects.push(
						new Bullet(
							{ x:this.pos.x + 32, y:this.pos.y + 32},
							this.canvas,
							this.shader,
							Math.PI / 2,
						),
					);
					break;
				
				case PatternType.Radial:
					this.bullets.push()

				default:
					break;
			}
			this.interval = 0;
		}
	}
}

export { Enemy, type PatternType}