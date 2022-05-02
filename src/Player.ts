import { mat4 } from "gl-matrix-ts";
import GameObject from "./GameObject";
import Canvas from "./WebGL/Canvas";
import Shader from "./WebGL/Shader";
import { TextureRect } from "./WebGL/Shapes";
import { Vec2 } from "./WebGL/Types";
import { curkeys, mousePos } from "./WebGL/Events";
import { gameObjects } from "./Global";
import Bullet from "./Bullet";

export default class Player extends GameObject {
	shader: Shader;
	canvas: Canvas;
	rect: TextureRect;
	speed = 5;
	justPressed = false;
	constructor(pos: Vec2, shader: Shader, canvas: Canvas) {
		super(pos, { x: 32, y: 32 });
		this.shader = shader;
		this.canvas = canvas;
		this.rect = new TextureRect(
			{ x: 0, y: 0 },
			{ x: 32, y: 32 },
			canvas,
			"assets/test.png",
			shader,
		);
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
		this.rect.draw();

		this.pos = mousePos;

		if (curkeys[32] && !this.justPressed) {
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
		if (!curkeys[32]) {
			this.justPressed = false;
		}

		for (const obj of gameObjects) {
			if (obj.constructor.name != "Player") {
				if (obj.collider.intersects(this.collider) &&  obj.owner != "player") {
					console.log("sussy :flushed:");
					obj.toRemove = true;   
				}
			}
		}
	}
}
