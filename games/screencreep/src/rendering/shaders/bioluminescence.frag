// Bioluminescence shader — pulsating soft glow behind cells
// Applied as a PixiJS Filter on glow layer

precision mediump float;

uniform float uTime;
uniform float uIntensity;
uniform vec2 uResolution;

varying vec2 vTextureCoord;

void main() {
    vec2 uv = vTextureCoord;
    vec2 center = vec2(0.5);
    float dist = distance(uv, center) * 2.0;

    // Pulsating glow
    float pulse = 0.8 + 0.2 * sin(uTime * 3.0);
    float glow = exp(-dist * dist * 2.0) * pulse * uIntensity;

    // Soft green-cyan color
    vec3 color = vec3(0.0, 0.8, 0.4) * glow;

    float alpha = glow * 0.4;
    gl_FragColor = vec4(color, alpha);
}
