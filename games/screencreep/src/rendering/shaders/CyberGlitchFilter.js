// src/rendering/shaders/CyberGlitchFilter.js
import { Filter, GlProgram } from 'pixi.js';

const defaultVertex = `#version 300 es
in vec2 aPosition;
out vec2 vTextureCoord;

uniform vec4 uInputSize;
uniform vec4 uOutputFrame;
uniform vec4 uOutputTexture;

void main() {
    vec2 position = aPosition * uOutputFrame.zw + uOutputFrame.xy;
    position.x = (position.x / uOutputTexture.x) * 2.0 - 1.0;
    position.y = (position.y / uOutputTexture.y) * 2.0 - 1.0;
    gl_Position = vec4(position, 0.0, 1.0);
    vTextureCoord = aPosition * (uOutputFrame.zw * uInputSize.zw);
}
`;

const glitchFrag = `#version 300 es
precision highp float;

in vec2 vTextureCoord;
out vec4 finalColor;

uniform sampler2D uTexture;
uniform float uTime;
uniform float uGlitchIntensity;
uniform float uScanlineCount;

float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

void main() {
    vec2 uv = vTextureCoord;

    float block = floor(uv.y * 35.0);
    float noise = hash(vec2(block, floor(uTime * 18.0)));
    if (noise < uGlitchIntensity * 0.4) {
        uv.x += (hash(vec2(uv.y, uTime)) - 0.5) * 0.05 * uGlitchIntensity;
    }

    float shift = uGlitchIntensity * 0.012 * sin(uTime * 35.0);
    float r = texture(uTexture, uv + vec2(shift, 0.0)).r;
    float g = texture(uTexture, uv).g;
    float b = texture(uTexture, uv - vec2(shift, 0.0)).b;
    float a = texture(uTexture, uv).a;

    float scanline = sin(uv.y * uScanlineCount + uTime * 4.0) * 0.04;
    vec3 col = vec3(r, g, b) - scanline;

    finalColor = vec4(col, a);
}
`;

export class CyberGlitchFilter extends Filter {
  constructor() {
    super({
      glProgram: new GlProgram({
        vertex: defaultVertex,
        fragment: glitchFrag,
      }),
      resources: {
        glitchUniforms: {
          uTime: { value: 0.0, type: 'f32' },
          uGlitchIntensity: { value: 0.0, type: 'f32' },
          uScanlineCount: { value: 500.0, type: 'f32' },
        },
      },
    });
    this.targetIntensity = 0.0;
    this.currentIntensity = 0.0;
  }

  setGlitch(intensity) {
    this.targetIntensity = intensity;
  }

  update(dt, time) {
    this.resources.glitchUniforms.uniforms.uTime = time;
    this.currentIntensity += (this.targetIntensity - this.currentIntensity) * dt * 4.0;
    this.resources.glitchUniforms.uniforms.uGlitchIntensity = this.currentIntensity;
  }
}
