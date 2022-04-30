import "./style.css";
import { mat4 } from "gl-matrix-ts";

import Canvas from "./WebGL/Canvas";
import Shader from "./WebGL/Shader";
import { Enemy } from "./Enemy";
// import GameObject from "./GameObject";
import {gameObjects} from "./Global"

const canv = new Canvas(640, 480);

const projMat = mat4.create();
mat4.ortho(projMat, 0, canv.c.width, canv.c.height, 0, 0.0, 2);
const viewMat = mat4.create();

interface Shaders {
	basic: null | Shader;
}
const shaders: Shaders = {
	basic: null,
};

const fpsCounter = document.createElement("p");
fpsCounter.appendChild(document.createTextNode("0"));


document?.body.appendChild(canv.c);
document.body.appendChild(fpsCounter);

function init() {
	console.log("hello!");
	Shader.Load("assets/Textured.shader")
		.then((val) => {
			shaders.basic = new Shader(canv);
			shaders.basic.initShaderProgram(val.vert, val.frag);
			shaders.basic.addAttribLoc("vertexPosition", "aVertexPosition");
			shaders.basic.addAttribLoc("texPosition", "aTextureCoord");
			shaders.basic.addUniformLoc("uViewMatrix");
			shaders.basic.addUniformLoc("uModelMatrix");
			shaders.basic.addUniformLoc("uProjectionMatrix");
			shaders.basic.addUniformLoc("color", "uColor");
			shaders.basic.addUniformLoc("sampler", "uSampler");

			const { gl } = canv;
			gl?.enable(gl?.BLEND);
			gl?.blendFunc(gl?.SRC_ALPHA, gl?.ONE_MINUS_SRC_ALPHA);

			gameObjects.push(
				new Enemy(
					{ x: 100, y: 100 },
					0,
					canv,
					shaders.basic,
				),
			);

			window.requestAnimationFrame(update);
		})
		.catch((reason) => alert(`oopsie poopsie: ${reason}`));
}

let prev = 0;

function update(delta: DOMHighResTimeStamp) {
	const fps = Math.round(1000/(delta - prev));
	prev = delta;
	fpsCounter.innerText = fps.toString();
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
	const programInfo = shaders.basic?.programInfo;
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
  gl?.uniformMatrix4fv(
    programInfo?.uniformLocations.uModelMatrix,
    false,
    mat4.create()
  )
	for (const obj of gameObjects) {
		obj.draw();
		// debugger;
	}
}

window.onload = init;
