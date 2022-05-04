import { mat4 } from "gl-matrix-ts";
import Bullet from "./Bullet";
import GameObject from "./GameObject";
import Canvas from "./WebGL/Canvas";
import Shader from "./WebGL/Shader";
import { TextureRect } from "./WebGL/Shapes";
import { Vec2 } from "./WebGL/Types";
import { audioClips, gameObjects, killEnemy, player, range } from "./Global";

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
	texture: TextureRect;
	interval: number;
	counter: number;
	lives: number;
	speed: number;
	sickoMode: boolean;
	constructor(pos: Vec2, type: PatternType, canvas: Canvas, shader: Shader) {
		super(pos, { x: 64, y: 64 });
		this.type = type;
		this.canvas = canvas;
		this.shader = shader;
		this.bullets = [];
		this.texture = new TextureRect(
			{ x: 0, y: 0 },
			this.size,
			canvas,
			"images/enemy.png",
			shader,
		);
		this.interval = 0;
		this.counter = 0;

		this.lives = 10;
		this.speed = 20;

		this.sickoMode = false;

		// if (type == PatternType.Focused) {
		// 	this.speed = 10;
		// }
	}

	draw(): void {
		const model = mat4.create();
		const { gl } = this.canvas;
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
					obj.toKeep = false;

					audioClips.hit.currentTime = 0;
					audioClips.hit.play();
				}
			}
		}
		if (this.lives < 0) {
			this.toKeep = false;
			killEnemy();
		}

		this.speed = this.sickoMode ? 1:20;

		if (++this.interval >= this.speed) {
			switch (this.type) {
				case PatternType.Focused:
					this.focusedBullet();
					break;

				case PatternType.Radial:
					this.radialBullet();
					break;

				case PatternType.Spiral:
					this.spiralBullet();

				default:
					break;
			}
			this.interval = 0;
		}
	}
	spiralBullet() {
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
	}

	radialBullet() {
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
	}

	focusedBullet() {
		const relPos: Vec2 = {
			x: (player?.pos.x || 0) - this.pos.x - 32,
			y: (player?.pos.y || 0) - this.pos.y - 32,
		};
		let angleToPlayer = Math.atan(relPos.y / relPos.x);
		// t2=\pi\ -t1*-1
		if (relPos.x < 0) {
			angleToPlayer += Math.PI;
		}
		gameObjects.push(
			new Bullet(
				{ x: this.pos.x + 32, y: this.pos.y + 32 },
				this.canvas,
				this.shader,
				angleToPlayer,
			),
		);
	}
}

export { Enemy, type PatternType };
