import { Collider } from "./Collider";
import { Vec2 } from "./WebGL/Types";

// -- THIS APPLIES TO ALL GameObjects --
// Abstract class for common* parts of all gameobjects
// (common or easily disabled lol)
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
		// Cullable tells the drawing function wether or not
		// this can be "culled", or deleted upon leaving the display
		this.cullable = false;
		// tells the owner
		this.owner = "other";
		// Tells the drawing function if this should be deleted or not
		// (really useful!)
		this.toKeep = true;
	}

	// EVERY gameobject has this so yeah
	abstract draw(): void;
}