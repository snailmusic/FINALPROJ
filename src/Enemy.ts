import { mat4 } from "gl-matrix-ts";
import Bullet from "./Bullet";
import GameObject from "./GameObject";
import Canvas from "./WebGL/Canvas";
import Shader from "./WebGL/Shader";
import { TextureRect } from "./WebGL/Shapes";
import { Vec2 } from "./WebGL/Types";
import { gameObjects, player, range } from "./Global";

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
	counter: number;
	lives: number;
	constructor(pos: Vec2, type: PatternType, canvas: Canvas, shader: Shader) {
		super(pos, { x: 64, y: 64 });
		this.type = type;
		this.canvas = canvas;
		this.shader = shader;
		this.bullets = [];
		this.texture = new TextureRect({x:0, y:0}, this.size, canvas, "assets/test.png", shader);
		this.interval = 0;
		this.counter = 0;

		this.lives = 10;
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
		for (const obj of gameObjects) {
			if (obj.constructor.name == "Bullet") {
				if (
					obj.collider.intersects(this.collider) &&
					obj.owner == "player"
				) {
					console.log("enemy :flushed:");
					this.lives--;
					obj.toRemove = true;
				}
			}
		}
		if (++this.interval >= 10) {
			switch (this.type) {
				case PatternType.Focused:
					let angleToPlayer = Math.atan((player?.pos.y || 1) / (player?.pos.x || 1));
					
					gameObjects.push(
						new Bullet(
							{ x: this.pos.x + 32, y: this.pos.y + 32 },
							this.canvas,
							this.shader,
							Math.PI / 2,
						),
					);
					break;

				case PatternType.Radial:
					for (const i of range(0, 7)) {
						const relPos: Vec2 = {
							x: Math.sin((i * Math.PI) / 4) * 32,
							y: Math.cos((i * Math.PI) / 4) * 32,
						};
						const centerPos = {
							x: this.pos.x + 32,
							y: this.pos.y + 32,
						};
						gameObjects.push(
							new Bullet(
								{
									x: relPos.x + centerPos.x,
									y: relPos.y + centerPos.y,
								},
								this.canvas,
								this.shader,
								(Math.PI / 4) * (-i + 2),
							),
						);
					}
					break;
					
				case PatternType.Spiral:
					this.counter++;
					for (const i of range(0, 7)) {
						const relPos: Vec2 = {
							x: Math.sin((i * Math.PI) / 4 - this.counter) * 32,
							y: Math.cos((i * Math.PI) / 4 - this.counter) * 32,
						};
						const centerPos = {
							x: this.pos.x + 32,
							y: this.pos.y + 32,
						};
						gameObjects.push(
							new Bullet(
								{
									x: relPos.x + centerPos.x,
									y: relPos.y + centerPos.y,
								},
								this.canvas,
								this.shader,
								(Math.PI / 4) * (-i + 2) + this.counter,
							),
						);
					}

				default:
					break;
			}
			this.interval = 0;
		}
	}
}

export { Enemy, type PatternType}