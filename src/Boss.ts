import { mat4 } from "gl-matrix-ts";
import Bullet from "./Bullet";
import GameObject from "./GameObject";
import Canvas from "./WebGL/Canvas";
import Shader from "./WebGL/Shader";
import { TextureRect } from "./WebGL/Shapes";
import { Vec2 } from "./WebGL/Types";
import { audioClips, gameObjects, killEnemy, player} from "./Global";
import { range } from "./Helpers";

// woah now its binary
// will be useful later ;)
enum PatternType {
	Spiral = 0b1,
	Radial = 0b10,
	Focused = 0b100,
}

// Super similar to the base enemy
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
	constructor(pos: Vec2, canvas: Canvas, shader: Shader) {
		super(pos, { x: 128, y: 128 });
		this.type = PatternType.Spiral;
		this.canvas = canvas;
		this.shader = shader;
		this.bullets = [];

		// texture1 is the regular texture
		this.texture1 = new TextureRect(
			{ x: 0, y: 0 },
			this.size,
			canvas,
			"images/Boss.png",
			shader,
		);
		// texture2 is the inverted texture
		this.texture2 = new TextureRect(
			{ x: 0, y: 0 },
			this.size,
			canvas,
			"images/BossInv.png",
			shader,
		);

		// controls bullet spawning speed
		this.interval = 0;
		this.counter = 0;

		this.lives = 20;
		this.speed = 20;
		this.phase = 0;

		this.sickoMode = false;
		this.dx = 3;

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

		// if the boss is going sickoMode, invert the sprite
		if (!this.sickoMode) {
			this.texture1.draw();
		}
		else {
			this.texture2.draw();
		}

		for (const obj of gameObjects.array) {
			if (obj.constructor.name == "Bullet") {
				// if the player's bullets collide with the boss
				// decrease lives and play sound
				if (
					obj.collider.intersects(this.collider) &&
					obj.owner == "player"
				) {
					this.lives--;
					obj.toKeep = false;

					audioClips.hit.currentTime = 0;
					audioClips.hit.play();
				}
			}
		}
		if (this.lives <= 0) {
			this.phase++;
			// Controls the current phase
			switch (this.phase) {
				case 1:
					this.lives = 8;
					// sickoMode makes it speedy
					this.sickoMode = true;
					break;

				case 2:
					this.lives = 10;
					this.sickoMode = false;
					// the | operator runs a bitwise or on the numbers
					// that's the reason for the binary, so i can set multiple patterns at once
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
				
				case 6:
					this.lives = 3;
					this.type = PatternType.Spiral | PatternType.Focused | PatternType.Radial;

				// if the phase isn't handled then just say the boss is dead :shrug:
				default:
					this.winPoints();
					killEnemy();
					this.toKeep = false;
					break;
			}
		}

		// make it speedy for sickomode
		this.speed = this.sickoMode ? 8 : 20;

		// if it's the correct time to spawn bullets, spawn them
		if (++this.interval >= this.speed) {
			// the & operator runs bitwise & on the thing
			// binary <3
			// a | b | x
			// - + - + -
			// 0 | 0 | 0
			// 1 | 0 | 0
			// 0 | 1 | 0
			// 1 | 1 | 1
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

		// if its phase 4 or 5, move the boss around
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

	// bullet generation code
	spiralBullet() {
		// counter is for the spiral to... spiral
		this.counter++;
		// 8 spokes
		for (const i of range(0, 7)) {
			// calculate the relative position from the center of the boss
			// places the bullets radially
			const relPos: Vec2 = {
				x: Math.sin((i * Math.PI) / 4 - this.counter) * 64,
				y: Math.cos((i * Math.PI) / 4 - this.counter) * 64,
			};

			// center pos
			const centerPos = {
				x: this.pos.x + 64,
				y: this.pos.y + 64,
			};

			// add a bullet with the right position and angle
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
		// very similar to the spiral bullet, except it doesn't... spiral
		for (const i of range(0, 7)) {
			// angles the bullets away a little
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
					(Math.PI / 4) * (-coolI + 2),
				),
			);
		}
	}

	focusedBullet() {
		// shoots bullets directly at the player
		const relPos: Vec2 = {
			x: (player?.pos.x || 0) - this.pos.x - 64,
			y: (player?.pos.y || 0) - this.pos.y - 64,
		};
		// gets the angle to the player using *trig*
		let angleToPlayer = Math.atan(relPos.y / relPos.x);
		// tangent is dumb and doesn't account for the right side, so we have to
		if (relPos.x < 0) {
			angleToPlayer += Math.PI;
		}

		// stored in a constant to be changed in a sec
		const bulet = new Bullet(
				{ x: this.pos.x + 64, y: this.pos.y + 64 },
				this.canvas,
				this.shader,
				angleToPlayer,
			)
		// make the bullet go faster
		bulet.speed = 0.5;
		gameObjects.push(
			bulet
		);
	}

	// give the player 1000 points
	winPoints() {
		for (const _ of range(0,100)) {
			killEnemy();
		}
	}
}

export { Boss, type PatternType };

