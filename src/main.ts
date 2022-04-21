import "./style.css";
import Canvas from "./WebGL/Canvas";
import Shader from "./WebGL/Shader";
import { Rectangle } from "./WebGL/Shapes";
import { Colors } from "./WebGL/Types";
import { mat4 } from "gl-matrix";

const app = document.querySelector<HTMLDivElement>("#app");
const canv = new Canvas(640, 480);
let testRect: Rectangle | null = null;
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
      shaders.basic.addAttribLoc("aVertexPosition");
      shaders.basic.addUniformLoc("uViewMatrix");
      shaders.basic.addUniformLoc("uModelMarix");
      shaders.basic.addUniformLoc("uProjectionMatrix");
      shaders.basic.addUniformLoc("uColor");
      testRect = new Rectangle(
        { x: -1, y: -1 },
        { x: 0.5, y: 0.5 },
        canv,
        Colors.red,
        shaders.basic
      );
    })
    .catch((reason) => alert(`oopsie poopsie: ${reason}`));

  const { gl } = canv;
  gl?.enable(gl?.BLEND);
  gl?.blendFunc(gl?.SRC_ALPHA, gl?.ONE_MINUS_SRC_ALPHA);
  window.requestAnimationFrame(update);
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

  testRect?.draw()
}

window.onload = init;
