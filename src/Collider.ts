import { Vec2 } from "./WebGL/Types";

// The collision object (only rectangles for right now)
class Collider {
	pos: Vec2;
	size: Vec2;
	constructor(pos: Vec2, size: Vec2) {
		this.pos = pos;
		this.size = size;
	}

	// intersecting code you've seen from every other project
	intersects(obj: Collider): boolean {
		return (
			this.pos.x < obj.pos.x + obj.size.x &&
			this.pos.x + this.size.x > obj.pos.x &&
			this.pos.y < obj.size.y + obj.pos.y &&
			this.pos.y + this.size.y > obj.pos.y
		);
	}
}

export { Collider };
