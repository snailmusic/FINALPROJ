import Canvas from "./Canvas";

class ProgramInfo {
  program: WebGLProgram;
  attribLocations: any;
  uniformLocations: any;
  constructor(
    program: WebGLProgram,
    attribLocations = {},
    uniformLocations = {}
  ) {
    this.program = program;
    this.attribLocations = attribLocations;
    this.uniformLocations = uniformLocations;
  }
}

export default class Shader {
  canvas: Canvas;
  programInfo: ProgramInfo;
  constructor(canvas: Canvas) {
    this.canvas = canvas;
    this.programInfo = new ProgramInfo(0);
  }

  addUniformLoc(name: string, loc?: string) {
    if (loc == null) {
      loc = name;
    }
    if (this.programInfo != undefined) {
      this.programInfo.uniformLocations[name] =
        this.canvas.gl.getUniformLocation(this.programInfo.program, loc);
    }
  }
  program(_program: any, _loc: null): any {
    throw new Error("Method not implemented.");
  }

  addAttribLoc(name: string, loc?: string) {
    if (loc == null) {
      loc = name;
    }
    if (this.programInfo != undefined) {
      this.programInfo.attribLocations[name] = this.canvas.gl.getAttribLocation(
        this.program,
        loc
      );
    }

    // console.log(this.canvas.gl.getUniformLocation(this.program, loc));
  }

  initShaderProgram(vsSource: string, fsSource: string): void | null {
    const { gl } = this.canvas;
    const vertexShader = this.loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = this.loadShader(gl, gl.FRAGMENT_SHADER, fsSource);
	if (vertexShader == null) {
		throw new Error(`Could not load vertex shader`)
	}
	if (fragmentShader == null) {
		throw new Error(`Could not load fragment shader`)
	}

    // console.log(loadShader(gl, gl.VERTEX_SHADER, vsSource));
    // console.log(vsSource);

    // Create the shader program

    const shaderProgram = gl.createProgram();
	if (shaderProgram == null) {
		throw new Error(`Unable to create shader program`);
	}
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    // If creating the shader program failed, alert

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      alert(
        "Unable to initialize the shader program: " +
          gl.getProgramInfoLog(shaderProgram)
      );
      return null;
    }

    // @ts-ignore
    this.program = shaderProgram;
    this.programInfo = new ProgramInfo(this.program);
  }

  //
  // creates a shader of the given type, uploads the source and
  // compiles it.
  //
  loadShader(gl: WebGLRenderingContext, type: GLenum, source: string) {
    const shader = gl.createShader(type);
	if (shader == null) {
		throw new Error(`Unable to create shader`)
	}

    // Send the source to the shader object

    gl.shaderSource(shader, source);

    // Compile the shader program

    gl.compileShader(shader);

    // See if it compiled successfully

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      alert(
        "An error occurred compiling the shaders: " +
          gl.getShaderInfoLog(shader)
      );
      gl.deleteShader(shader);
      return null;
    }

    return shader;
  }

  bind() {
    this.canvas.gl.useProgram(this.program);
  }

  unbind() {
    this.canvas.gl.useProgram(0);
  }

  static async Load(url: string): Promise<ShaderSources> {
    console.log("loading " + url);

    let shaderResponse = await fetch(url);

    let shaderSource = await shaderResponse.text();
    let shaders: any = {};
    let sources = shaderSource.split(">>");
    sources.forEach((element) => {
      if (element == "") {
        return;
      }
      console.log(element);
      let trimmed = element.replace("\r\n", "\n");
      let type = trimmed.slice(0, trimmed.indexOf("<<"));
      let source = trimmed.substring(trimmed.indexOf("<<") + 2);
      shaders[type.toLowerCase()] = source;
    });
    return new Promise<ShaderSources>((resolve, _reject) => {
      console.log("returning");

      resolve(shaders);
    });
  }
}

type ShaderSources = {
  [key: string]: string;
};
