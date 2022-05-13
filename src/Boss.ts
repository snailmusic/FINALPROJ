import { mat4 } from "gl-matrix-ts";
import Bullet from "./Bullet";
import GameObject from "./GameObject";
import Canvas from "./WebGL/Canvas";
import Shader from "./WebGL/Shader";
import { TextureRect } from "./WebGL/Shapes";
import { Vec2 } from "./WebGL/Types";
import { audioClips, gameObjects, killEnemy, player, range } from "./Global";

enum PatternType {
	Spiral = 0b1,
	Radial = 0b10,
	Focused = 0b100,
}

class Boss extends GameObject {
	type: PatternType;
	canvas: Canvas;
	shader: Shader;
	bullets: Bullet[];
	interval: number;
	counter: number;
	lives: number;
	speed: number;
	sickoMode: boolean;
	phase: number;
	dx: number;
	texture1: TextureRect;
	texture2: TextureRect;
	textDrawn: boolean;
	constructor(pos: Vec2, canvas: Canvas, shader: Shader) {
		super(pos, { x: 128, y: 128 });
		this.type = PatternType.Spiral;
		this.canvas = canvas;
		this.shader = shader;
		this.bullets = [];
		this.texture1 = new TextureRect(
			{ x: 0, y: 0 },
			this.size,
			canvas,
			"images/Boss.png",
			shader,
		);
		this.texture2 = new TextureRect(
			{ x: 0, y: 0 },
			this.size,
			canvas,
			"images/BossInv.png",
			shader,
		);
		this.interval = 0;
		this.counter = 0;

		this.lives = 20;
		this.speed = 20;
		this.phase = 0;

		this.textDrawn = false;

		this.sickoMode = false;
		this.dx = 3;

		// if (type == PatternType.Focused) {
		// 	this.speed = 10;
		// }
	}

	draw(): void {
		const model = mat4.create();
		const { gl } = this.canvas;
		const programInfo = this.shader.programInfo;
		this.shader.bind();
		mat4.translate(model, model, [this.pos.x, this.pos.y, 0]);
		gl?.uniformMatrix4fv(
			programInfo?.uniformLocations.uModelMatrix,
			false,
			model,
		);
		if (!this.sickoMode) {
			this.texture1.draw();
		}
		else {
			this.texture2.draw();
		}
		// ++this.interval also returns the value while incrementing
		for (const obj of gameObjects.array) {
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
		if (this.lives <= 0) {
			// this.toKeep = false;
			// killEnemy();
			this.phase++;
			switch (this.phase) {
				case 1:
					this.lives = 8;
					this.sickoMode = true;
					break;

				case 2:
					this.lives = 10;
					this.sickoMode = false;
					this.type = PatternType.Focused | PatternType.Spiral;
					break;

				case 3:
					this.lives = 6;
					this.sickoMode = true;
					this.type = PatternType.Focused | PatternType.Spiral;
					break;

				case 4:
					this.lives = 15;
					this.sickoMode = false;
					this.type = PatternType.Radial;
					break;

				case 5:
					this.lives = 7;
					this.sickoMode = true;
					this.type = PatternType.Spiral;
					break;

				default:
					this.winPoints();
					killEnemy();
					this.toKeep = false;
					break;
			}
		}

		this.speed = this.sickoMode ? 8 : 20;


		if (++this.interval >= this.speed) {
			if ((this.type & PatternType.Focused) > 0) {
				this.focusedBullet();
			}
			if ((this.type & PatternType.Spiral) > 0) {
				this.spiralBullet();
			}
			if ((this.type & PatternType.Radial) > 0) {
				this.radialBullet();
			}
			this.interval = 0;
		}

		if (this.phase == 4 || this.phase == 5) {
			this.pos.x += this.dx;
			if (this.pos.x > this.canvas.c.width - 32) {
				this.dx *= -1;
			}

			if (this.pos.x < 32) {
				this.dx *= -1;
			}
		}
	}
	spiralBullet() {
		this.counter++;
		for (const i of range(0, 7)) {
			const relPos: Vec2 = {
				x: Math.sin((i * Math.PI) / 4 - this.counter) * 64,
				y: Math.cos((i * Math.PI) / 4 - this.counter) * 64,
			};
			const centerPos = {
				x: this.pos.x + 64,
				y: this.pos.y + 64,
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
			let coolI = i + 0.4;
			const relPos: Vec2 = {
				x: Math.sin((coolI * Math.PI) / 4) * 64,
				y: Math.cos((coolI * Math.PI) / 4) * 64,
			};
			const centerPos = {
				x: this.pos.x + 64,
				y: this.pos.y + 64,
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
			x: (player?.pos.x || 0) - this.pos.x - 64,
			y: (player?.pos.y || 0) - this.pos.y - 64,
		};
		let angleToPlayer = Math.atan(relPos.y / relPos.x);
		// t2=\pi\ -t1*-1
		if (relPos.x < 0) {
			angleToPlayer += Math.PI;
		}
		const bulet = new Bullet(
				{ x: this.pos.x + 64, y: this.pos.y + 64 },
				this.canvas,
				this.shader,
				angleToPlayer,
			)
		bulet.speed = 0.5;
		gameObjects.push(
			bulet
		);
	}

	winPoints() {
		for (const i of range(0,100)) {
			killEnemy();
		}
	}
}

export { Boss, type PatternType };

