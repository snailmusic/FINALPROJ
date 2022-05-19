// Keeps various global variables so other things can access it

import GameObjectQueue from "./GameObjectQueue";
import Player from "./Player";
import Canvas from "./WebGL/Canvas";

// START: Score

const score = {
	enemies: 0,
};

function killEnemy() {
	score.enemies++;
}

function calcScore() {
	return score.enemies * 10;
}

// END: Score

// START: Player

let player: Player | undefined = undefined;
function setPlayer(obj: Player) {
	player = obj;
}

// END: PLAYER

// START: Misc

let currentDelta: DOMHighResTimeStamp = 0;
function setDelta(delta: DOMHighResTimeStamp) {
	currentDelta = delta;
}

const audioClips = {
	bg: new Audio("music/bgm.mp3"),
	hit: new Audio("music/hit.wav"),
};

const canv = new Canvas(480, 800);
const gameObjects = new GameObjectQueue(canv);

// END: Misc

// START: game states

enum GameState {
	Menu,
	Game,
	Boss,
	Death,
	Win
}
let gameState: GameState = GameState.Menu;

function setState(state: GameState) {
	gameState = state;
}

// END: game states

export {
	canv,
	gameObjects,
	audioClips,

	currentDelta,
	setDelta,

	player,
	setPlayer,

	killEnemy,

	score,
	calcScore,

	gameState,
	setState,
	GameState
};
