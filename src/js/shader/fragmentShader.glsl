varying vec2 vUv;
varying float vDistortion;
uniform sampler2D uTex;
uniform float uTime;
uniform float uScrollStrength;


void main() {
  vec2 uv = vUv;

  float strength = 1.0 + uScrollStrength * 2.0;
  
  float r = texture2D(uTex, uv + vDistortion * strength).r;
  float g = texture2D(uTex, uv + vDistortion * strength).g;
  float b = texture2D(uTex, uv + vDistortion * strength).b;
  vec3 color = vec3(r, g, b);

  gl_FragColor = vec4(color, 1.0);
}