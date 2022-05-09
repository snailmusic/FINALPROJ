import GameObject from "./GameObject";
import Canvas from "./WebGL/Canvas";

export default class GameObjectQueue {
	gameObjects1: GameObject[];
	gameObjects2: GameObject[];
	canvas: Canvas;
	buffer: boolean;
	constructor(canv: Canvas) {
		this.gameObjects1 = [];
		this.gameObjects2 = [];
		// keeps track of the buffer
		// and "flips" it for performance & memory reasons
		this.buffer = false;
		this.canvas = canv;
	}
	toKeep(ob: GameObject) {
		const { c } = this.canvas;
		const offscreen =
			ob.pos.x > c.width ||
			ob.pos.x + ob.size.x < 0 ||
			ob.pos.y > c.height ||
			ob.pos.y + ob.size.y < 0;

		// if its not offscreen or cullable then return true
		// and if it is marked to keep
		return (!offscreen || !ob.cullable) && ob.toKeep;
	}
	// draws the stuff in the queue
	draw(customFunc: (obj: GameObject) => void) {
		const { c } = this.canvas;
		// code is duplicated
		if (this.buffer) {
			// clear gameObjects2
			this.gameObjects2.length = 0;
			for (const ob of this.gameObjects1) {
				if (this.toKeep(ob)) {
					ob.draw();
					customFunc(ob);
					this.gameObjects2.push(ob);
				}
			}
		} else {
			this.gameObjects1.length = 0;
			for (const ob of this.gameObjects2) {
				if (
					(!(
						ob.pos.x > c.width ||
						ob.pos.x + ob.size.x < 0 ||
						ob.pos.y > c.height ||
						ob.pos.y + ob.size.y < 0
					) ||
						!ob.cullable) &&
					ob.toKeep
				) {
					ob.draw();
					customFunc(ob);
					this.gameObjects1.push(ob);
				}
			}
		}

		this.buffer = !this.buffer;
	}

	push(...args:GameObject[]) {
		for (const param of args) {
			if (this.buffer) {
				this.gameObjects1.push(param);
			} else {
				this.gameObjects2.push(param);
			}
		}
	}

	get array() {
		if (this.buffer) {
			return this.gameObjects1;
		}
		else {
			return this.gameObjects2;
		}
	}

	clear(){
		if (this.buffer) {
			this.gameObjects1.length = 0;
		} else {
			this.gameObjects2.length = 0;
		}
	}
}
