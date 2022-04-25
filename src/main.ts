import "./style.css";
import { mat4 } from "gl-matrix-ts";

import Canvas from "./WebGL/Canvas";
import Shader from "./WebGL/Shader";
import { Rectangle } from "./WebGL/Shapes";
import { Colors } from "./WebGL/Types";

const app = document.querySelector<HTMLDivElement>("#app");
const canv = new Canvas(640, 480);
let testRect: Rectangle | null = null;

const projMat = mat4.create();
mat4.ortho(projMat, 0, canv.c.width, canv.c.height, 0, 0.0, 2);

const viewMat = mat4.create();

interface Shaders {
  basic: null | Shader;
}
const shaders: Shaders = {
  basic: null,
};
app?.appendChild(canv.c);

function init() {
  console.log("hello!");
  Shader.Load("assets/Basic.shader")
    .then((val) => {
      shaders.basic = new Shader(canv);
      shaders.basic.initShaderProgram(val.vert, val.frag);
      shaders.basic.addAttribLoc("vertexPosition", "aVertexPosition");
      shaders.basic.addUniformLoc("uViewMatrix");
      shaders.basic.addUniformLoc("uModelMatrix");
      shaders.basic.addUniformLoc("uProjectionMatrix");
      shaders.basic.addUniformLoc("color","uColor");
      testRect = new Rectangle(
        { x: 10, y: 10 },
        { x: 100, y: 100 },
        canv,
        Colors.red,
        shaders.basic
      );
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

  const progInfo = shaders.basic?.programInfo;

  gl?.clearColor(0, 0, 0, 1.0); // Clear to black, fully opaque
  gl?.clearDepth(1.0); // Clear everything

  gl?.clear(gl?.COLOR_BUFFER_BIT | gl?.DEPTH_BUFFER_BIT);

  const modelMat = mat4.create();
  mat4.translate(modelMat, modelMat, [0,0,0])

  shaders.basic?.bind();
  gl?.uniform4fv(
    progInfo?.uniformLocations.uViewMatrix,
    viewMat
  );
  gl?.uniformMatrix4fv(progInfo?.uniformLocations.uViewMatrix, false, viewMat);
  gl?.uniformMatrix4fv(progInfo?.uniformLocations.uProjectionMatrix, false, projMat);
  gl?.uniformMatrix4fv(progInfo?.uniformLocations.uModelMatrix, false, modelMat);
  gl?.uniform4f(progInfo?.uniformLocations.color, 1,1,1,1);

  testRect?.draw();
}

window.onload = init;
