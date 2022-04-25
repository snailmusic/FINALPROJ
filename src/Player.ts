import Canvas from "./WebGL/Canvas";
import Shader from "./WebGL/Shader";
import { Vec2 } from "./WebGL/Types";

export default class Player {
	#pos: Vec2;
	#size: Vec2;
	#shader: Shader;
	#canvas: Canvas;
	constructor(shader:Shader, canvas:Canvas) {
		this.#pos = {x:100, y:100};
		this.#size = {x:30, y:30};
		this.#shader = shader;
		this.#canvas = canvas;
	}
	update(){

	}
	draw(){

	}
}