import GameObject from "./GameObject";
import Player from "./Player";
import Canvas from "./WebGL/Canvas";

let gameObjects: GameObject[] = [];
function drawAll(canv:Canvas) {
	const temp = [];
	for (const obj of gameObjects) {
		obj.draw();
		if (
			!(
				obj.pos.x > canv.c.width ||
				obj.pos.x + obj.size.x < 0 ||
				obj.pos.y > canv.c.height ||
				obj.pos.y + obj.size.y < 0
			) || !obj.cullable || !obj.toRemove    
		) {
			temp.push(obj);
		}
		// debugger;
	}
	gameObjects = temp;
}

let player: Player | undefined = undefined;
function setPlayer(obj:Player){
	player = obj;
}

function range(start: number, end?: number) {
	start = end==undefined ? 0 : start;
	end = end || start;

	return Array.from({ length: end - start + 1 }, (_, i) => i);
}


export {gameObjects, range, drawAll, player, setPlayer};
