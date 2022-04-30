import GameObject from "./GameObject";

const gameObjects: GameObject[] = [];

function range(start: number, end?: number) {
	start = end==undefined ? 0 : start;
	end = end || start;

	return Array.from({ length: end - start + 1 }, (_, i) => i);
}


export {gameObjects, range};
