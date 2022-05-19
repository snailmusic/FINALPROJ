// IMPORTS FROM OTHER CODE
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
<<<<<<< Updated upstream
	score
=======
	score,
>>>>>>> Stashed changes
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
import Rainbow from "./Rainbow";
import Timer from "./Timer";
// END IMPORTS

// Projection matrix is what actually allows me to draw to the screen without
// manually calculating the numbers between -1 and 1
const projMat = mat4.create();
mat4.ortho(projMat, 0, canv.c.width, canv.c.height, 0, 0.0, 2);
// view matrix is the camera's perspective
const viewMat = mat4.create();

// Shaders stores the shaders used for drawing
// shaders are what dictate how things are drawn to the screen
// interface is a ts thing, ignore
interface Shaders {
	basic: Shader;
	gradient: Shader;
	rainbow: Shader;
}
const shaders: Shaders = {
	basic: new Shader(canv),
	gradient: new Shader(canv),
	rainbow: new Shader(canv),
};

// Create the elements for the statistics at the bottom
// this is the bar at the bottom
const statsHolder = document.createElement("div");
statsHolder.className = "stats";

// these are the chips at the bottom
const fpsCounter = document.createElement("p");
fpsCounter.appendChild(document.createTextNode("0"));
const livesDisplay = document.createElement("p");
livesDisplay.appendChild(document.createTextNode("Lives: 0"));
const scoreDisplay = document.createElement("p");
scoreDisplay.appendChild(document.createTextNode("Lives: 0"));
const diffDisplay = document.createElement("p");
diffDisplay.appendChild(document.createTextNode("Lives: 0"));

// Add the children to the document
document.body.appendChild(canv.c);
document.body.appendChild(statsHolder);
// Add the statistic chips to the stats bar
statsHolder.appendChild(livesDisplay);
statsHolder.appendChild(scoreDisplay);
statsHolder.appendChild(diffDisplay);
statsHolder.appendChild(fpsCounter);

// Initializes everything
// Mostly the shaders
function init(): void {
	// test message from the first day lol
	console.log("hello!");
	// Load the texture displaying shader
	Shader.Load("assets/Textured.shader")
		.then((val) => {
			// init the shader
			shaders.basic.initShaderProgram(val.vert, val.frag);
			// Add the attrib locations
			shaders.basic.addAttribLoc("vertexPosition", "aVertexPosition");
			shaders.basic.addAttribLoc("texPosition", "aTextureCoord");

			// add uniform locations
			shaders.basic.addUniformLoc("uViewMatrix");
			shaders.basic.addUniformLoc("uModelMatrix");
			shaders.basic.addUniformLoc("uProjectionMatrix");
			shaders.basic.addUniformLoc("color", "uColor");
			shaders.basic.addUniformLoc("sampler", "uSampler");

			// Start loading the gradient shader
			return Shader.Load("assets/Gradient.shader");
		})
		.then((val) => {
			// repeat of the previous part
			shaders.gradient.initShaderProgram(val.vert, val.frag);
			shaders.gradient.addAttribLoc("vertexPosition", "aVertexPosition");
			shaders.gradient.addAttribLoc("texPosition", "aTextureCoord");
			shaders.gradient.addUniformLoc("uViewMatrix");
			shaders.gradient.addUniformLoc("uModelMatrix");
			shaders.gradient.addUniformLoc("uProjectionMatrix");
			shaders.gradient.addUniformLoc("uStart");
			shaders.gradient.addUniformLoc("uEnd");
			shaders.gradient.addUniformLoc("time");

			return Shader.Load("assets/Rainbow.shader");
		})
		.then((val) => {
			shaders.rainbow.initShaderProgram(val.vert, val.frag);
			shaders.rainbow.addAttribLoc("vertexPosition", "aVertexPosition");
			shaders.rainbow.addAttribLoc("texPosition", "aTextureCoord");
			shaders.rainbow.addUniformLoc("uViewMatrix");
			shaders.rainbow.addUniformLoc("uModelMatrix");
			shaders.rainbow.addUniformLoc("uProjectionMatrix");
			shaders.rainbow.addUniformLoc("time");

			// Makes it so i dont have to do canv.gl
			const { gl } = canv;
			// Allow transparency
			gl?.enable(gl?.BLEND);
			gl?.blendFunc(gl?.SRC_ALPHA, gl?.ONE_MINUS_SRC_ALPHA);
			//

			window.requestAnimationFrame(update);
		})
		// if anything goes wrong, alert it
		.catch((reason) => alert(`oopsie poopsie: ${reason}`));
}

let prev = 0;

// holds the previous gamestate, which is a number
let gameStatePrev = Infinity;

// Holds the time for the scren to start updating
let screenTimer = new Timer(400);

// Holds the enemy count for later :)
let enemyCount = 0;

function update(delta: DOMHighResTimeStamp) {
	// Calculate the fps
	const fps = Math.round(1000 / (delta - prev));
	// Set the delta (used in bullet movement)
	setDelta(delta - prev);
	prev = delta;

	// If we are ingame and we have no lives left, die
	if (
		(gameState == GameState.Boss || gameState == GameState.Game) &&
		player?.lives == 0
	) {
		setState(GameState.Death);
	}

	// initialization per game state
	if (gameState != gameStatePrev) {
		gameStatePrev = gameState;
		gameObjects.clear();

		switch (gameState) {
			case GameState.Menu:
				// Add gradient background, and title screen
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
						"images/Title.png",
						canv,
						shaders.basic,
					),
				);
				break;

			case GameState.Game:
				// add the background
				gameObjects.push(
					new Background(
						Colors.fromRGB(54, 0, 52),
						Colors.fromRGB(54, 25, 0),
						canv,
						shaders.gradient,
					),
				);
				// Establish the player by also setting the global variable
				// for it
				const play = new Player(shaders.basic, canv);
				gameObjects.push(play);
				setPlayer(play);
				break;

			case GameState.Boss:
				// Push the red gradient "pulsing" background
				// And the boss
				gameObjects.push(
					new Background(
						Colors.fromRGB(80, 0, 0),
						Colors.fromRGB(0, 0, 0),
						canv,
						shaders.gradient,
					),
					new Boss(
						{
							x: canv.c.width / 2 - 64,
							y: 70,
						},
						canv,
						shaders.basic,
					),
				);

				// only for typescript, we know its defined
				if (player != undefined) {
					// Reset the player's lives and put it back into the world
					player.lives = 10;
					gameObjects.push(player);
				}
				break;

			case GameState.Death:
				// Reset the timer so you dont immediately click off
				screenTimer.reset();
<<<<<<< Updated upstream
				score.enemies = 0
				alert("you suck :)");
=======
				// Add cyan+pink background, and "ui"
>>>>>>> Stashed changes
				gameObjects.push(
					new Background(
						Colors.cyan,
						Colors.pink,
						canv,
						shaders.gradient,
					),
					new ImageObj(
						{ x: 0, y: 0 },
						{ x: canv.c.width, y: canv.c.height },
						"images/Death.png",
						canv,
						shaders.basic,
					),
				);
				break;

			case GameState.Win:
				// same as above
				screenTimer.reset();
<<<<<<< Updated upstream
				score.enemies = 0
=======
				// reset score
				score.enemies = 0;
				// add rainbow background <3
				// oh and also the "ui"
>>>>>>> Stashed changes
				gameObjects.push(
					new Rainbow(canv, shaders.rainbow),
					new ImageObj(
						{ x: 0, y: 0 },
						{ x: canv.c.width, y: canv.c.height },
						"images/Win.png",
						canv,
						shaders.basic,
					),
				);
				break;

			default:
				// We should never ever get here
				// But just in case lol
				alert("uh oh there was a big mess up");
				break;
		}
	}

	// If you click or press enter on the title screen you play ofc
	if ((curkeys[13] || mouseButton[0]) && gameState == GameState.Menu) {
		setState(GameState.Game);
	}

	// Generate enemies if you are ingame
	if (gameState == GameState.Game) {
		generateEnemy();
		// If 40 enemies have spawned and none are on screen anymore
		// go to boss
		if (resetTime >= 400 && enemyCount == 0) {
			setState(GameState.Boss);
		}
	}

	// If you kill the boss (which always gets the score above 1k)
	// then you win
	if (gameState == GameState.Boss && calcScore() > 1000) {
		setState(GameState.Win);
	}

	// If you click after 300ms on the win or death screens
	// Start playing again
	if (
		(curkeys[13] || mouseButton[0]) &&
		(gameState == GameState.Death || gameState == GameState.Win) &&
		screenTimer.check()
	) {
		// reset the player
		if (player != undefined) {
			player.lives = 10;
		}
		// Reset the enemy spawning
		resetTime = 0;
		counter = 0;
		// set the state
		setState(GameState.Game);
	}

	// play the bg music
	audioClips.bg.play().catch(() => {});

	// Set the stats
	fpsCounter.innerText = fps.toString() + " FPS";
	livesDisplay.innerText = `Lives: ${player?.lives || 0}`;
	scoreDisplay.innerText = `Score: ${calcScore()}`;
	diffDisplay.innerText = `Difficulty: ${resetTime / 10}`;
	// set the time for both the rainbow and gradient things
	// because they cycle
	shaders.gradient.bind();
	canv.gl.uniform1f(
		shaders.gradient.programInfo.uniformLocations.time,
		delta / 10,
	);
	shaders.rainbow.bind();
	canv.gl.uniform1f(
		shaders.rainbow.programInfo.uniformLocations.time,
		delta / 10,
	);
	draw();
	window.requestAnimationFrame(update);
}

function draw() {
	const { gl } = canv;

	gl?.clearColor(0, 0, 0, 1.0); // Clear to black, fully opaque
	gl?.clearDepth(1.0); // Clear everything

	gl?.clear(gl?.COLOR_BUFFER_BIT | gl?.DEPTH_BUFFER_BIT);

	// Set the matricies for the shaders
	shaders.basic.bind();
	let programInfo = shaders.basic.programInfo;
	// set the view matrix
	gl?.uniformMatrix4fv(
		programInfo.uniformLocations.uViewMatrix,
		false,
		viewMat,
	);
	// set the projection matrix
	gl?.uniformMatrix4fv(
		programInfo.uniformLocations.uProjectionMatrix,
		false,
		projMat,
	);

	// ditto
	shaders.gradient.bind();
	programInfo = shaders.gradient.programInfo;
	gl?.uniformMatrix4fv(
		programInfo.uniformLocations.uViewMatrix,
		false,
		viewMat,
	);
	gl?.uniformMatrix4fv(
		programInfo.uniformLocations.uProjectionMatrix,
		false,
		projMat,
	);

	// ditto
	shaders.rainbow.bind();
	programInfo = shaders.rainbow.programInfo;
	gl?.uniformMatrix4fv(
		programInfo.uniformLocations.uViewMatrix,
		false,
		viewMat,
	);
	gl?.uniformMatrix4fv(
		programInfo.uniformLocations.uProjectionMatrix,
		false,
		projMat,
	);

	// Reset the enemy count
	enemyCount = 0;
	gameObjects.draw((obj) => {
		// modify the enemies 
		if (obj.constructor.name == "Enemy") {
			// move the enemy down
			obj.pos.y += 0.5;
			// if the enemy is offscreen
			// delete it.
			if (obj.pos.y > canv.c.height) {
				obj.toKeep = false;
			}
			enemyCount++;
		}
	});
}

// Frame counter to not spawn the enemies too quick
let counter = 0;
<<<<<<< Updated upstream
let resetTime = 0;
=======
// Combination difficulty and reset subtraction thing
let resetTime = 390;
>>>>>>> Stashed changes

function generateEnemy() {
	// scales it so it breaks at 70 and not 30
	// (1/700^0.6)*300
	const scalingFactor = 5.889283;
	// gets the scaled subtraction
	const coolTime = Math.min(Math.pow(resetTime, 0.6) * scalingFactor, 270);

	// If 40 enemies have been spawned
	// Don't spawn more
	if (resetTime >= 400) {
		return;
	}

	// Spawn the enemy every once in a while
	if (++counter >= 300 - coolTime) {
		counter = 0;
		resetTime += 10;
		gameObjects.push(
			new Enemy(
				{ x: randInt(32, 480 - 32), y: -15 },
				randInt(0, 3),
				canv,
				shaders.basic,
			),
		);
	}
}

window.onload = init;
