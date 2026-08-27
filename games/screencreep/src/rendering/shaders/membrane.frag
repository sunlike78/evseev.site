// Membrane shader — organic wobble with rim light
// Applied as a PixiJS Filter on cell containers

precision mediump float;

uniform float uTime;
uniform float uHue;
uniform float uPulse;
uniform vec2 uResolution;

varying vec2 vTextureCoord;

vec3 hsl2rgb(float h, float s, float l) {
    float c = (1.0 - abs(2.0 * l - 1.0)) * s;
    float x = c * (1.0 - abs(mod(h * 6.0, 2.0) - 1.0));
    float m = l - c * 0.5;
    vec3 rgb;
    float h6 = h * 6.0;
    if (h6 < 1.0) rgb = vec3(c, x, 0.0);
    else if (h6 < 2.0) rgb = vec3(x, c, 0.0);
    else if (h6 < 3.0) rgb = vec3(0.0, c, x);
    else if (h6 < 4.0) rgb = vec3(0.0, x, c);
    else if (h6 < 5.0) rgb = vec3(x, 0.0, c);
    else rgb = vec3(c, 0.0, x);
    return rgb + m;
}

void main() {
    vec2 uv = vTextureCoord;
    vec2 center = vec2(0.5);
    float dist = distance(uv, center) * 2.0;

    // Organic wobble on edge
    float angle = atan(uv.y - 0.5, uv.x - 0.5);
    float wobble = sin(angle * 3.0 + uTime * 2.0) * 0.04 +
                   sin(angle * 5.0 - uTime * 2.6) * 0.03;
    float edge = smoothstep(0.9 + wobble + uPulse * 0.15, 1.0 + wobble + uPulse * 0.15, dist);

    // Rim light (fresnel-like)
    float rim = smoothstep(0.5, 1.0, dist) * 0.4;

    // Base color
    float h = uHue / 360.0;
    vec3 baseColor = hsl2rgb(h, 0.7, 0.35);
    vec3 rimColor = hsl2rgb(h, 0.8, 0.6);

    vec3 color = mix(baseColor, rimColor, rim);

    // Inner highlight
    float highlight = 1.0 - smoothstep(0.0, 0.5, dist);
    color += hsl2rgb(h, 0.8, 0.55) * highlight * 0.3;

    float alpha = (1.0 - edge) * 0.85;
    gl_FragColor = vec4(color, alpha);
}
