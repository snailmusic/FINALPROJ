import { mat4 } from "gl-matrix-ts";
import GameObject from "./GameObject";
import Canvas from "./WebGL/Canvas";
import Shader from "./WebGL/Shader";
import { TextureRect } from "./WebGL/Shapes";
import { curkeys, mouseButton, mousePos } from "./WebGL/Events";
import { canv, gameObjects } from "./Global";
import Bullet from "./Bullet";
import { clamp } from "./Helpers";

export default class Player extends GameObject {
	shader: Shader;
	canvas: Canvas;
	rect: TextureRect;
	speed = 5;
	justPressed = false;
	cheatMode = false;
	lives: number;
	constructor(shader: Shader, canvas: Canvas) {
		super(mousePos, { x: 8, y: 8 });
		this.shader = shader;
		this.canvas = canvas;
		// Object to draw
		this.rect = new TextureRect(
			{ x: -16, y: -16 },
			{ x: 32, y: 32 },
			canvas,
			"images/player.png",
			shader,
		);
		this.lives = 10;
	}

	draw(): void {
		// Holds the model uniform, which dictates it's position
		const model = mat4.create();
		// extract variables from the things so i dont have to do stuff.whatever and instead can do whatever
		const { gl } = this.canvas;
		const programInfo = this.shader.programInfo;
		// bind the shader so webgl uses it
		this.shader.bind();
		// set the position
		this.pos = { ...mousePos };
		// makes sure the mouse doesn't go off screen
		this.pos.x = clamp(this.pos.x, 1, canv.c.width - 1);
		this.pos.y = clamp(this.pos.y, 1, canv.c.height - 1);
		// move the model matrix
		mat4.translate(model, model, [this.pos.x, this.pos.y, 0]);
		// give the model to the shader
		gl?.uniformMatrix4fv(
			programInfo?.uniformLocations.uModelMatrix,
			false,
			model,
		);
		// draw the thing
		this.rect.draw();

		// if you just pressed space or click, add a bullet
		if ((curkeys[32] || mouseButton[0]) && !this.justPressed) {
			this.justPressed = true;
			gameObjects.push(
				new Bullet(
					{ x: this.pos.x, y: this.pos.y - 16 },
					this.canvas,
					this.shader,
					-Math.PI / 2,
					"player",
				),
			);
		}
		// on release tell the program that you did it
		if (!(curkeys[32] || mouseButton[0])) {
			this.justPressed = false;
		}

		if (this.cheatMode) {
			this.justPressed = false;
			this.lives = 10;
		}

		// collision checking
		// definitely a better way I could've done this but
		// oh well
		for (const obj of gameObjects.array) {
			// if its a bullet
			if (obj.constructor.name == "Bullet") {
				// and it intersects the player
				// and the player doesn't own it (for bullets)
				if (
					obj.collider.intersects(this.collider) &&
					obj.owner != "player"
				) {
					obj.toKeep = false;
					--this.lives;
				}
			}
		}
	}
}
