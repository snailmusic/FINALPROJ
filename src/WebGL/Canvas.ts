export default class Canvas {
  c: HTMLCanvasElement;
  gl: WebGLRenderingContext;
  constructor(width: number, height: number) {
    this.c = document.createElement("canvas");
    this.c.setAttribute("width", String(width));
    this.c.setAttribute("height", String(height));
    this.c.addEventListener("contextmenu", (e) => {
      e.preventDefault();
    });
    const temp = this.c.getContext("webgl");
    if (!temp) {
      alert(
        "Unable to initialize WebGL. Your browser or machine may not support it."
      );
      throw new Error(
        "Unable to initialize WebGL. Your browser or machine may not support it."
      );

      return;
    }
    this.gl = temp;
    
  }
}
