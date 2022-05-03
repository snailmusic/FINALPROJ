import { Collider } from "./Collider";
import { Vec2 } from "./WebGL/Types";

export default abstract class GameObject {
	collider: Collider;
	pos: Vec2;
	size: Vec2;
	cullable: boolean;
	owner: string;
	toKeep: boolean;
	constructor(pos: Vec2, size: Vec2) {
		this.pos = pos;
		this.size = size;
		this.collider = new Collider(pos, size);
		this.cullable = false;
		this.owner = "other";
		this.toKeep = true;
	}

	abstract draw(): void;
}