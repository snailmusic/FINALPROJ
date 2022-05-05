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
varying highp vec2 vTextureCoord;

uniform mediump vec3 uStart;
uniform mediump vec3 uEnd;

void main() {
    mediump vec3 col = uEnd * vTextureCoord.y + uStart *  (1.0 - vTextureCoord.y);
	col = vec3(1.0, 0.0, 1.0);
	// gl_FragColor = vec4(col.r, col.g, col.b, 1.0);
	gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
}