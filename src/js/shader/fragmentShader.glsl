varying vec2 vUv;
// varying float vDistortion;
uniform sampler2D uTex;


void main() {
  vec2 uv = vUv;

  
  // float r = texture2D(uTex, uv).r;
  // float g = texture2D(uTex, uv + vDistortion).g;
  // float b = texture2D(uTex, uv + vDistortion).b;
  // vec3 color = vec3(r, g, b);

  vec4 color = texture2D(uTex, uv);

  gl_FragColor = vec4(color);
}