import "./style.css";
import { mat4 } from "gl-matrix-ts";

import Canvas from "./WebGL/Canvas";
import Shader from "./WebGL/Shader";
// import Player from "./Player";
import Bullet from "./Bullet";

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

let testBullet: Bullet | null;
document?.body.appendChild(canv.c);

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

      testBullet = new Bullet({ x: 100, y: 100 }, canv, shaders.basic, Math.PI/2);

      const { gl } = canv;
      gl?.enable(gl?.BLEND);
      gl?.blendFunc(gl?.SRC_ALPHA, gl?.ONE_MINUS_SRC_ALPHA);
      
      window.requestAnimationFrame(update);
    })
    .catch((reason) => alert(`oopsie poopsie: ${reason}`));
}

function update(_delta: DOMHighResTimeStamp) {
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
    viewMat
  );
  gl?.uniformMatrix4fv(
    programInfo?.uniformLocations.uProjectionMatrix,
    false,
    projMat
  );
  if (testBullet != undefined){
    testBullet.angle += 0.1;
  }
  testBullet?.draw();
}

window.onload = init;
