import { mat4 } from "gl-matrix-ts";
import GameObject from "./GameObject";
import Canvas from "./WebGL/Canvas";
import Shader from "./WebGL/Shader";
import { RainbowRect } from "./WebGL/Shapes";

export default class Rainbow extends GameObject {
	gradient: RainbowRect;
	canvas: Canvas;
	shader: Shader;
	constructor(canvas:Canvas, shader:Shader) {
		super({x:-100000, y:-100000},{x:0, y:0} )
		this.cullable = false;
		this.canvas = canvas;
		this.shader = shader;
		this.gradient = new RainbowRect(
					{ x: 0, y: 0 },
					{x:canvas.c.width, y:canvas.c.height},
					canvas,
					shader
				);
	}

	draw(): void {
		const model = mat4.create();
		const { gl } = this.canvas;
		this.shader.bind();
		const programInfo = this.shader.programInfo;
		gl?.uniformMatrix4fv(
			programInfo?.uniformLocations.uModelMatrix,
			false,
			model,
		);
		this.gradient.draw();
	}
}