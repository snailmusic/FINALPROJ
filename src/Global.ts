
import GameObjectQueue from "./GameObjectQueue";
import Player from "./Player";
import Canvas from "./WebGL/Canvas";

const score = {
	enemies: 0
}
function killEnemy() {
	score.enemies++;
}

function calcScore() {
	return score.enemies * 10;
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

let currentDelta:DOMHighResTimeStamp = 0;
function setDelta(delta:DOMHighResTimeStamp) {
	currentDelta = delta;
}


const audioClips  = {
	"bg": new Audio("music/bgm.mp3"),
	"hit": new Audio("music/hit.wav")
}

const canv = new Canvas(480, 800);
const gameObjects = new GameObjectQueue(canv);

export {canv, gameObjects, audioClips, currentDelta, setDelta,  range, player, setPlayer, killEnemy, score, calcScore};
