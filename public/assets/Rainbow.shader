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

uniform mediump float time;

mediump vec3 hsv2rgb(vec3 c)
{
    mediump vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    mediump vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main() {
	// mediump float uv = sin(vTextureCoord.x + time / 100.0)/2.0+0.5;
    mediump vec3 col = hsv2rgb(vec3(vTextureCoord.y / 2.0 + time / 300.0, 0.2, 1));
	// col = vec3(1.0, 0.0, 1.0);
	gl_FragColor = vec4(col.r, col.g, col.b, 1.0);
	// gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
}
