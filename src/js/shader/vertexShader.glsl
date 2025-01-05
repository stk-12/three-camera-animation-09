varying vec2 vUv;
varying float vDistortion;
// uniform float uProg;
// uniform float uScroll;

uniform float uTime;

#pragma glslify: pnoise = require(glsl-noise/periodic/3d);

// float PI = 3.1415926535897932384626433832795;

void main() {
  vUv = uv;
  vec3 pos = position;

  float distortion = pnoise((pos + uTime * 0.2), vec3(10.0) * 1.5) * 100.0 + 1.0;
  vDistortion = distortion * 0.001;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}