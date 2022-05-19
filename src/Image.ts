import { mat4 } from "gl-matrix-ts";
import GameObject from "./GameObject";
import Canvas from "./WebGL/Canvas";
import Shader from "./WebGL/Shader";
import { TextureRect } from "./WebGL/Shapes";
import { Vec2 } from "./WebGL/Types";

// all this does really is just wrap the TextureRect in a 
// GameObject
class ImageObj extends GameObject {
	canvas: Canvas;
	shader: Shader;
	texture: TextureRect;
	constructor(pos: Vec2, size:Vec2, image: string, canvas: Canvas, shader: Shader) {
		// Disables collision because nothing goes there
		super({ x: -Infinity, y: -Infinity }, { x: 0, y: 0 });
		this.canvas = canvas;
		this.shader = shader;
		this.texture = new TextureRect(
			pos,
			size,
			canvas,
			image,
			shader,
		);
	}

	draw(): void {
		const model = mat4.create();
		const { gl } = this.canvas;
		const programInfo = this.shader.programInfo;
		this.shader.bind();
		gl?.uniformMatrix4fv(
			programInfo?.uniformLocations.uModelMatrix,
			false,
			model,
		);
		this.texture.draw();
	}
}

export { ImageObj };
