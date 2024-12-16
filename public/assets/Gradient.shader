>>VERT<<
attribute vec4 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat4 uViewMatrix;
uniform mat4 uModelMatrix;
uniform mat4 uProjectionMatrix;

varying highp vec2 vTextureCoord;

void main() {
	gl_Position = uProjectionMatrix * uModelMatrix * uViewMatrix * aVertexPosition;
	vTextureCoord = aTextureCoord;
}

>>FRAG<<
// uniform mediump vec4 uColor;
precision mediump float;
varying highp vec2 vTextureCoord;

uniform mediump vec3 uStart;
uniform mediump vec3 uEnd;
uniform mediump float time;

void main() {
	mediump float uv = sin(vTextureCoord.y + time / 100.0)/2.0+0.5;
    mediump vec3 col = uEnd * uv + uStart *  (1.0 - uv);
	// col = vec3(1.0, 0.0, 1.0);
	gl_FragColor = vec4(col.r, col.g, col.b, 1.0);
	// gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
}