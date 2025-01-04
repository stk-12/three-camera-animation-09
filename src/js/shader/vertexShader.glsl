varying vec2 vUv;
// varying float vDistortion;
// uniform float uProg;
// uniform float uScroll;

// #pragma glslify: pnoise = require(glsl-noise/periodic/3d);

// float PI = 3.1415926535897932384626433832795;

void main() {
  vUv = uv;
  vec3 pos = position;

  // float scroll = uScroll * 0.005;


  // pos.y += cos(pos.x * PI) * 0.08 * scroll;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}