import "./dark.css";
import "./style.css";
import { mat4 } from "gl-matrix-ts";

import Shader from "./WebGL/Shader";
// import { Enemy } from "./Enemy";
// import GameObject from "./GameObject";
import {
	canv,
	gameObjects,
	setPlayer,
	setDelta,
	player,
	audioClips,
	calcScore,
	gameState,
	GameState,
	setState,
} from "./Global";
import Player from "./Player";
// import Background from "./Bg";
import Background from "./Bg";
import { Enemy } from "./Enemy";
import { Colors } from "./WebGL/Colors";
import { ImageObj } from "./Image";
import { curkeys, mouseButton } from "./WebGL/Events";
import { randInt } from "./Helpers";
import { Boss } from "./Boss";


const projMat = mat4.create();
mat4.ortho(projMat, 0, canv.c.width, canv.c.height, 0, 0.0, 2);
const viewMat = mat4.create();

interface Shaders {
	basic: Shader;
	gradient: Shader;
}
const shaders: Shaders = {
	basic: new Shader(canv),
	gradient: new Shader(canv),
};

const statsHolder = document.createElement("div");
statsHolder.className = "stats";

const fpsCounter = document.createElement("p");
fpsCounter.appendChild(document.createTextNode("0"));

const livesDisplay = document.createElement("p");
livesDisplay.appendChild(document.createTextNode("Lives: 0"));
const scoreDisplay = document.createElement("p");
scoreDisplay.appendChild(document.createTextNode("Lives: 0"));
const diffDisplay = document.createElement("p");
diffDisplay.appendChild(document.createTextNode("Lives: 0"));

document?.body.appendChild(canv.c);
document.body.appendChild(statsHolder);
statsHolder.appendChild(livesDisplay);
statsHolder.appendChild(scoreDisplay);
statsHolder.appendChild(diffDisplay);
statsHolder.appendChild(fpsCounter);



function init() {
	console.log("hello!");
	Shader.Load("assets/Textured.shader")
		.then((val) => {
			shaders.basic.initShaderProgram(val.vert, val.frag);
			shaders.basic.addAttribLoc("vertexPosition", "aVertexPosition");
			shaders.basic.addAttribLoc("texPosition", "aTextureCoord");
			shaders.basic.addUniformLoc("uViewMatrix");
			shaders.basic.addUniformLoc("uModelMatrix");
			shaders.basic.addUniformLoc("uProjectionMatrix");
			shaders.basic.addUniformLoc("color", "uColor");
			shaders.basic.addUniformLoc("sampler", "uSampler");

			return Shader.Load("assets/Gradient.shader");
		})
		.then((val) => {
			shaders.gradient.initShaderProgram(val.vert, val.frag);
			shaders.gradient.addAttribLoc("vertexPosition", "aVertexPosition");
			shaders.gradient.addAttribLoc("texPosition", "aTextureCoord");
			shaders.gradient.addUniformLoc("uViewMatrix");
			shaders.gradient.addUniformLoc("uModelMatrix");
			shaders.gradient.addUniformLoc("uProjectionMatrix");
			shaders.gradient.addUniformLoc("uStart");
			shaders.gradient.addUniformLoc("uEnd");
			shaders.gradient.addUniformLoc("time");

			const { gl } = canv;
			gl?.enable(gl?.BLEND);
			gl?.blendFunc(gl?.SRC_ALPHA, gl?.ONE_MINUS_SRC_ALPHA);
			// 
			

			window.requestAnimationFrame(update);
		})
		.catch((reason) => alert(`oopsie poopsie: ${reason}`));
}

let prev = 0;

let gameStatePrev = Infinity;

function update(delta: DOMHighResTimeStamp) {
	const fps = Math.round(1000 / (delta - prev));
	setDelta(delta - prev);
	prev = delta;

	if (gameState != GameState.Menu && gameState != GameState.Death && player?.lives == 0) {
		setState(GameState.Death);
	}

	if (gameState != gameStatePrev) {
		gameStatePrev = gameState;
		gameObjects.clear();

		switch (gameState) {
			case GameState.Menu:
				gameObjects.push(
					new Background(
						Colors.fromRGB(134, 255, 252),
						Colors.fromRGB(255, 138, 222),
						canv,
						shaders.gradient,
					),
					new ImageObj(
						{ x: 0, y: 0 },
						{ x: canv.c.width, y: canv.c.height },
						"images/Main Menu.png",
						canv,
						shaders.basic,
					),
				);
				break;
			
			case GameState.Game:
				gameObjects.push(
					new Background(
						Colors.fromRGB(54, 0, 52),
						Colors.fromRGB(54, 25, 0),
						canv,
						shaders.gradient,
					),
				);

				gameObjects.push(
					// new Enemy({ x: 100, y: 0 }, 2, canv, shaders.basic),
					new Enemy({ x: 300, y: 100 }, 0, canv, shaders.basic),
				);
				const play = new Player(shaders.basic, canv);
				gameObjects.push(play);
				setPlayer(play);
				break;
			
			case GameState.Boss:

				gameObjects.push(
					new Background(
						Colors.fromRGB(80, 0, 0),
						Colors.fromRGB(0, 0, 0),
						canv,
						shaders.gradient,
					),
					new Boss(
						{
							x: canv.c.width / 2,
							y: 70,
						},
						canv,
						shaders.basic,
					),
				);

				if (player != undefined) {
					player.lives = 10;
					gameObjects.push(player);
				}
				break;
			
			case GameState.Death:
				alert("you suck :)");
				gameObjects.push(
					new Background(
						Colors.cyan,
						Colors.pink,
						canv,
						shaders.gradient
					),
					new ImageObj({x:0, y:0}, {x:canv.c.width, y:canv.c.height}, "images/Death.png", canv, shaders.basic)
				)
				break;

			default:
				alert("uh oh there was a big mess up")
				break;
		}
	}

	if ((curkeys[13] || mouseButton[0]) && gameState == GameState.Menu) {
		setState(GameState.Game);
	}

	if (gameState == GameState.Game) {
		generateEnemy();
		if (resetTime >= 400) {
			setState(GameState.Boss);
		}
	}

	if ((curkeys[13] || mouseButton[0]) && gameState == GameState.Death) {
		if (player != undefined) {
			player.lives = 10;
		}
		resetTime = 0;
		counter = 0;
		setState(GameState.Game)
	}

	audioClips.bg.play().catch(()=>{});

	fpsCounter.innerText = fps.toString() + " FPS";
	livesDisplay.innerText = `Lives: ${player?.lives || 0}`;
	scoreDisplay.innerText = `Score: ${calcScore()}`;
	diffDisplay.innerText = `Difficulty: ${resetTime/10}`
	shaders.gradient.bind();
	canv.gl.uniform1f(shaders.gradient.programInfo.uniformLocations.time, delta/10);
	draw();
	window.requestAnimationFrame(update);
}

function draw() {
	const { gl } = canv;

	gl?.clearColor(0, 0, 0, 1.0); // Clear to black, fully opaque
	gl?.clearDepth(1.0); // Clear everything

	gl?.clear(gl?.COLOR_BUFFER_BIT | gl?.DEPTH_BUFFER_BIT);
	// shaders.basic?.bind();
	shaders.basic?.bind();
	let programInfo = shaders.basic?.programInfo;
	gl?.uniformMatrix4fv(
		programInfo?.uniformLocations.uViewMatrix,
		false,
		viewMat,
	);
	gl?.uniformMatrix4fv(
		programInfo?.uniformLocations.uProjectionMatrix,
		false,
		projMat,
	);

	shaders.gradient.bind();
	programInfo = shaders.gradient?.programInfo;
	gl?.uniformMatrix4fv(
		programInfo?.uniformLocations.uViewMatrix,
		false,
		viewMat,
	);
	gl?.uniformMatrix4fv(
		programInfo?.uniformLocations.uProjectionMatrix,
		false,
		projMat,
	);

	//@ts-ignore
	gameObjects.draw((obj) => {
		if (obj.constructor.name == "Enemy") {
			obj.pos.y += 0.3;
		}

	});
}

let counter = 0;
let resetTime = 0;

function generateEnemy() {
	// scales it so it breaks at 70 and not 30
	// (1/700^0.6)*300
	const scalingFactor = 5.889283;
	const coolTime = Math.min(Math.pow(resetTime, 0.6)*scalingFactor, 270);
	// console.log(coolTime);

	if (resetTime >= 400) {
		return;
	}
	
	if (++counter >= 300 - coolTime) {
		counter= 0;
		resetTime += 10;
		gameObjects.push(
			new Enemy({x:randInt(32,480-32), y:-15}, randInt(0,3), canv, shaders.basic)
		);
	}
}

window.onload = init;
