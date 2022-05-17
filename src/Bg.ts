import { mat4 } from "gl-matrix-ts";
import GameObject from "./GameObject";
import Canvas from "./WebGL/Canvas";
import Shader from "./WebGL/Shader";
import { GradientRect } from "./WebGL/Shapes";
import { Color } from "./WebGL/Types";

export default class Background extends GameObject {
	gradient: GradientRect;
	canvas: Canvas;
	shader: Shader;
	start: Color;
	end: Color;
	constructor(start:Color, end:Color, canvas:Canvas, shader:Shader) {
		super({x:-100000, y:-100000},{x:0, y:0} )
		this.cullable = false;
		this.canvas = canvas;
		this.shader = shader;
		this.start = start;
		this.end = end;
		this.gradient = new GradientRect(
					{ x: 0, y: 0 },
					{x:canvas.c.width, y:canvas.c.height},
					canvas,
					start,
					end,
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