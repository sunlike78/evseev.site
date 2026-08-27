// src/rendering/shaders/ChromaticShockwaveFilter.js
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

const shockwaveFrag = `#version 300 es
precision highp float;

in vec2 vTextureCoord;
out vec4 finalColor;

uniform sampler2D uTexture;
uniform vec2 uCenter;
uniform float uWaveRadius;
uniform float uWaveThickness;
uniform float uIntensity;
uniform float uAberration;

void main() {
    vec2 uv = vTextureCoord;
    vec2 toCenter = uv - uCenter;
    float dist = length(toCenter);
    vec2 dir = dist > 0.0001 ? normalize(toCenter) : vec2(0.0);

    float wave = smoothstep(uWaveRadius - uWaveThickness, uWaveRadius, dist) -
                 smoothstep(uWaveRadius, uWaveRadius + uWaveThickness, dist);
    vec2 displacedUV = uv - dir * (wave * uIntensity);

    float split = uAberration * (dist * 0.4 + wave * 1.8);
    float r = texture(uTexture, displacedUV - dir * split).r;
    float g = texture(uTexture, displacedUV).g;
    float b = texture(uTexture, displacedUV + dir * split).b;
    float a = texture(uTexture, displacedUV).a;

    finalColor = vec4(r, g, b, a);
}
`;

export class ChromaticShockwaveFilter extends Filter {
  constructor() {
    super({
      glProgram: new GlProgram({
        vertex: defaultVertex,
        fragment: shockwaveFrag,
      }),
      resources: {
        shockwaveUniforms: {
          uCenter: { value: [0.5, 0.5], type: 'vec2<f32>' },
          uWaveRadius: { value: 2.0, type: 'f32' },
          uWaveThickness: { value: 0.08, type: 'f32' },
          uIntensity: { value: 0.0, type: 'f32' },
          uAberration: { value: 0.015, type: 'f32' },
        },
      },
    });
    this.active = false;
    this.progress = 1.0;
  }

  trigger(normalizedX = 0.5, normalizedY = 0.5, intensity = 0.05) {
    this.resources.shockwaveUniforms.uniforms.uCenter = [normalizedX, normalizedY];
    this.resources.shockwaveUniforms.uniforms.uIntensity = intensity;
    this.progress = 0.0;
    this.active = true;
  }

  update(dt) {
    if (!this.active) return;
    this.progress += dt * 2.4;
    this.resources.shockwaveUniforms.uniforms.uWaveRadius = this.progress;
    this.resources.shockwaveUniforms.uniforms.uIntensity *= Math.max(0.0, 1.0 - dt * 2.8);
    if (this.progress > 1.4) this.active = false;
  }
}
