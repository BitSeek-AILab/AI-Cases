(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,51392,t=>{"use strict";var e=t.i(90072),a=t.i(8560),i=t.i(22147);let r=`
attribute vec4 aA; // 来处 v \xb7 目标节点 v \xb7 ε 偏移 \xb7 相位
attribute vec4 aB; // 线宽 \xb7 景深 \xb7 色相 \xb7 速度
attribute vec4 aC; // 汇聚早晚 \xb7 是否有光脉冲 \xb7 亮度 \xb7 种子

uniform float uTime;
uniform float uSpread;
uniform float uWaveAmp;
uniform float uKnotU;
uniform float uKnotV;
uniform float uPx;
uniform vec2 uStart;
uniform vec2 uEnd;
uniform vec2 uAcross;
uniform vec2 uPointer;
uniform vec2 uPointerN;
uniform float uPointerOn;
uniform vec4 uPluck[4];
uniform vec4 uWave;

varying float vU;
varying float vDist;
varying float vHalfW;
varying float vBright;
varying float vHue;
varying float vPulse;
varying float vPhase;
varying float vSpeed;
varying float vGlow;
varying float vRing;

float sstep(float x) {
  x = clamp(x, 0.0, 1.0);
  return x * x * x * (x * (x * 6.0 - 15.0) + 10.0);
}

float flowV(float u) {
  float e = aA.z * uSpread;
  float v;
  if (u < uKnotU) {
    float t = clamp(u / (uKnotU * aC.x), 0.0, 1.0);
    float w = 1.0 - sstep(t);
    v = uKnotV + (aA.x - uKnotV) * w + e;
    float env = pow(max(w, 0.0), 0.8);
    v += env * uWaveAmp * 0.075 * (0.6 * sin(u * 7.0 + uTime * 0.55 * aB.w + aA.w) + 0.4 * sin(u * 15.0 - uTime * 0.8 + aA.w * 1.7));
  } else {
    float s = (u - uKnotU) / (1.0 - uKnotU);
    float g = sstep((s - 0.1) / 0.9);
    v = uKnotV + (aA.y - uKnotV) * g + e * (1.0 - g);
    v += sin(3.14159 * clamp(s, 0.0, 1.0)) * uWaveAmp * 0.014 * sin(uTime * 0.7 * aB.w + aA.w + s * 6.0);
  }
  return v;
}

vec2 flowPos(float u) {
  vec2 p = uStart + (uEnd - uStart) * u + uAcross * flowV(u);
  float par = (aB.y - 0.5) * 22.0 * (1.0 - smoothstep(0.82, 1.0, u));
  return p + uPointerN * par;
}

void main() {
  float u = position.x;
  float side = position.y;
  vec2 p = flowPos(u);
  vec2 q = flowPos(u + 0.0025);
  vec2 T = normalize(q - p + vec2(1e-5, 0.0));
  vec2 N = vec2(-T.y, T.x);
  float atten = 1.0 - smoothstep(0.9, 1.0, u);

  // 指尖拨开金线
  vec2 d = p - uPointer;
  float rep = exp(-dot(d, d) / (120.0 * 120.0)) * uPointerOn * atten;
  float sgn = dot(d, N) >= 0.0 ? 1.0 : -1.0;
  p += N * sgn * rep * 26.0;
  vGlow = exp(-dot(d, d) / (230.0 * 230.0)) * uPointerOn;

  // 快速划过：像拨动琴弦一样的阻尼振动
  for (int i = 0; i < 4; i++) {
    vec4 pk = uPluck[i];
    float dt = uTime - pk.z;
    if (dt > 0.0 && dt < 3.5) {
      vec2 dp = p - pk.xy;
      float wgt = exp(-dot(dp, dp) / (170.0 * 170.0));
      p += N * pk.w * wgt * sin(dt * 17.0 - length(dp) * 0.035) * exp(-dt * 2.2) * atten;
    }
  }

  // 点击：一圈光波沿线束扩散
  vRing = 0.0;
  float dtw = uTime - uWave.z;
  if (dtw > 0.0 && dtw < 3.0) {
    float dw = length(p - uWave.xy);
    vRing = exp(-pow((dw - dtw * 760.0) / 70.0, 2.0)) * exp(-dtw * 1.1) * uWave.w;
    p += N * vRing * 5.0;
  }

  float halfW = 0.5 * aB.x * mix(0.7, 1.25, aB.y);
  float feather = 1.0;
  vDist = side * (halfW + feather);
  vHalfW = halfW;
  vU = u;
  vBright = aC.z * mix(0.45, 1.0, aB.y);
  vHue = aB.z;
  vPulse = aC.y;
  vPhase = aC.w;
  vSpeed = aB.w;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p + N * vDist, 0.0, 1.0);
}
`,o=`
uniform vec3 uColA;
uniform vec3 uColB;
uniform vec3 uColC;
uniform vec3 uColHot;
uniform float uTime;
uniform float uReveal;
uniform float uKnotU;
uniform float uMaskFloor;
uniform float uMaskSoft;
uniform float uPx;
uniform float uAlpha;
uniform vec4 uMask[6];

varying float vU;
varying float vDist;
varying float vHalfW;
varying float vBright;
varying float vHue;
varying float vPulse;
varying float vPhase;
varying float vSpeed;
varying float vGlow;
varying float vRing;

float boxMask(vec2 p, vec4 r) {
  vec2 d = max(r.xy - p, p - r.zw);
  float m = max(d.x, d.y);
  return 1.0 - smoothstep(-uMaskSoft * 0.25, uMaskSoft, m);
}

void main() {
  float aa = 1.0 - smoothstep(vHalfW - 0.5 * uPx, vHalfW + 0.5 * uPx, abs(vDist));
  aa *= clamp(vHalfW * 2.0, 0.3, 1.0);
  float fadeIn = smoothstep(0.0, 0.16, vU);
  float reveal = 1.0 - smoothstep(uReveal - 0.06, uReveal, vU);
  float tip = exp(-pow((vU - uReveal) * 34.0, 2.0)) * (1.0 - step(1.02, uReveal));
  float ph = fract(vU * 0.9 - uTime * 0.085 * vSpeed + vPhase);
  float pulse = vPulse * exp(-pow((ph - 0.5) * 26.0, 2.0)) * smoothstep(0.05, 0.25, vU);
  float knot = exp(-pow((vU - uKnotU) * 7.0, 2.0));
  vec3 col = vHue < 0.88 ? mix(uColA, uColB, vHue / 0.88) : uColC;
  col = mix(col, uColHot, clamp(pulse * 1.2 + tip + vRing * 0.8, 0.0, 1.0));
  float a = aa * fadeIn * reveal * vBright * (0.42 + 0.5 * knot + 1.6 * pulse + 2.0 * tip + 0.8 * vGlow + 1.4 * vRing);
  float m = 0.0;
  for (int i = 0; i < 6; i++) m = max(m, boxMask(gl_FragCoord.xy, uMask[i]));
  a *= mix(1.0, uMaskFloor, m);
  a = clamp(a * uAlpha, 0.0, 1.0);
  gl_FragColor = vec4(col * a, a);
}
`,s=`
attribute vec4 aSeed;
uniform float uTime;
uniform float uFall;
uniform float uSize;
uniform float uDpr;
uniform vec2 uView;
varying float vAlpha;
void main() {
  float t = uTime;
  float x = fract(aSeed.x + sin(t * 0.1 + aSeed.w * 6.28) * 0.012 + t * 0.003 * (aSeed.z - 0.5)) - 0.5;
  float y = fract(aSeed.y - t * uFall * (0.4 + aSeed.z)) - 0.5;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(x * uView.x, y * uView.y, 0.0, 1.0);
  gl_PointSize = (0.8 + aSeed.z * uSize) * uDpr;
  vAlpha = (0.25 + 0.75 * (0.5 + 0.5 * sin(t * (0.6 + aSeed.w * 1.8) + aSeed.x * 40.0))) * (0.3 + aSeed.z * 0.7);
}
`,u=`
uniform vec3 uColor;
uniform float uAlpha;
varying float vAlpha;
void main() {
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.0, d) * vAlpha * uAlpha;
  gl_FragColor = vec4(uColor * a, a);
}
`,l={night:{a:"#f6c453",b:"#ffe3a1",c:"#8e9bff",hot:"#fff6da",floor:.16,alpha:1,dust:"#ffe9b8",dustAlpha:.55,fall:.004,size:1.8},snow:{a:"#c98a1b",b:"#8f6210",c:"#2d3fc4",hot:"#e8a325",floor:.1,alpha:.92,dust:"#8c96bf",dustAlpha:.6,fall:.016,size:3.4}};class n{renderer;layout=(0,i.computeLayout)(1,1);onFirstFrame;scene=new e.Scene;camera=new e.OrthographicCamera(-1,1,1,-1,-10,10);threadMat;dustMat;threadGeo;dustGeo;maxCount;dpr;raf=0;running=!1;t0=performance.now();last=performance.now();revealStart=-1;frozenTime=14;ema=16;frames=0;firstFrame=!1;pointerTarget=new e.Vector2;pointerNTarget=new e.Vector2;pointerOnTarget=0;scrollTarget=0;scroll=0;pluckSlot=0;reduced;sized=!1;constructor(t,l){this.reduced=l.reduced,this.renderer=new a.WebGLRenderer({canvas:t,antialias:!0,alpha:!0,powerPreference:"high-performance"}),this.renderer.setClearColor(0,0),this.dpr=Math.min(window.devicePixelRatio||1,l.mobile?1.75:2),this.renderer.setPixelRatio(this.dpr),this.maxCount=l.mobile?72:128;const n=new Float32Array(1206),h=[];for(let t=0;t<=200;t++){const e=t/200;if(n.set([e,-1,0,e,1,0],6*t),t<200){const e=2*t;h.push(e,e+2,e+1,e+1,e+2,e+3)}}this.threadGeo=new e.InstancedBufferGeometry,this.threadGeo.setAttribute("position",new e.BufferAttribute(n,3)),this.threadGeo.setIndex(h);const d=function(){let t=0x13526a9;return()=>{let e=Math.imul((t=t+0x6d2b79f5|0)^t>>>15,1|t);return(((e=e+Math.imul(e^e>>>7,61|e)^e)^e>>>14)>>>0)/0x100000000}}(),f=new Float32Array(4*this.maxCount),v=new Float32Array(4*this.maxCount),m=new Float32Array(4*this.maxCount);for(let t=0;t<this.maxCount;t++){const e=-1.18+.618034*t%1*2.36+(d()-.5)*.08,a=i.NODE_V[t%4],r=.1>d();f.set([e,a,2*d()-1,d()*Math.PI*2],4*t),v.set([r?1.8+ +d():.55+.8*d(),d(),d(),.6+.8*d()],4*t),m.set([.62+.34*d(),+(.36>d()),r?1:.55+.45*d(),d()],4*t)}this.threadGeo.setAttribute("aA",new e.InstancedBufferAttribute(f,4)),this.threadGeo.setAttribute("aB",new e.InstancedBufferAttribute(v,4)),this.threadGeo.setAttribute("aC",new e.InstancedBufferAttribute(m,4)),this.threadGeo.instanceCount=this.maxCount,this.threadMat=new e.ShaderMaterial({vertexShader:r,fragmentShader:o,side:e.DoubleSide,transparent:!0,depthTest:!1,depthWrite:!1,premultipliedAlpha:!0,uniforms:{uTime:{value:0},uSpread:{value:.05},uWaveAmp:{value:1},uKnotU:{value:.64},uKnotV:{value:0},uPx:{value:1/this.dpr},uStart:{value:new e.Vector2},uEnd:{value:new e.Vector2},uAcross:{value:new e.Vector2},uPointer:{value:new e.Vector2(-9999,-9999)},uPointerN:{value:new e.Vector2},uPointerOn:{value:0},uPluck:{value:Array.from({length:4},()=>new e.Vector4(0,0,-99,0))},uWave:{value:new e.Vector4(0,0,-99,0)},uColA:{value:new e.Color},uColB:{value:new e.Color},uColC:{value:new e.Color},uColHot:{value:new e.Color},uReveal:{value:1.12*!!this.reduced},uMaskFloor:{value:.16},uMaskSoft:{value:48},uAlpha:{value:1},uMask:{value:Array.from({length:6},()=>new e.Vector4(-9,-9,-9,-9))}}});const p=new e.Mesh(this.threadGeo,this.threadMat);p.frustumCulled=!1,this.scene.add(p);const c=l.mobile?70:150,w=new Float32Array(4*c);for(let t=0;t<4*c;t++)w[t]=d();this.dustGeo=new e.BufferGeometry,this.dustGeo.setAttribute("position",new e.BufferAttribute(new Float32Array(3*c),3)),this.dustGeo.setAttribute("aSeed",new e.BufferAttribute(w,4)),this.dustMat=new e.ShaderMaterial({vertexShader:s,fragmentShader:u,transparent:!0,depthTest:!1,depthWrite:!1,premultipliedAlpha:!0,uniforms:{uTime:{value:0},uFall:{value:.004},uSize:{value:1.8},uDpr:{value:this.dpr},uView:{value:new e.Vector2(1,1)},uColor:{value:new e.Color},uAlpha:{value:.5}}});const g=new e.Points(this.dustGeo,this.dustMat);g.frustumCulled=!1,this.scene.add(g),this.setMood(l.mood)}setMood(t){let a=l[t],i=this.threadMat.uniforms;i.uColA.value.set(a.a),i.uColB.value.set(a.b),i.uColC.value.set(a.c),i.uColHot.value.set(a.hot),i.uMaskFloor.value=a.floor,i.uAlpha.value=a.alpha;let r="night"===t?e.AdditiveBlending:e.NormalBlending;this.threadMat.blending=r,this.dustMat.blending=r,this.threadMat.needsUpdate=!0,this.dustMat.needsUpdate=!0;let o=this.dustMat.uniforms;o.uColor.value.set(a.dust),o.uAlpha.value=a.dustAlpha,o.uFall.value=a.fall,o.uSize.value=a.size,!this.running&&this.sized&&this.renderOnce()}resize(t,e){this.layout=(0,i.computeLayout)(t,e);let a=this.layout;this.renderer.setSize(t,e,!1),this.camera.left=-t/2,this.camera.right=t/2,this.camera.top=e/2,this.camera.bottom=-e/2,this.camera.updateProjectionMatrix();let r=this.threadMat.uniforms;r.uStart.value.set(...a.start),r.uEnd.value.set(...a.end),r.uAcross.value.set(...a.across),r.uKnotU.value=a.knotU,r.uKnotV.value=a.knotV,r.uMaskSoft.value=44*this.dpr,this.dustMat.uniforms.uView.value.set(t,e);let o=t*e/1296e3;this.threadGeo.instanceCount=Math.max(40,Math.min(this.maxCount,Math.round(this.maxCount*(.55+.45*o)))),this.sized=!0,this.running||this.renderOnce()}setMasks(t){let e=this.layout.h,a=this.threadMat.uniforms.uMask.value;for(let i=0;i<6;i++){let r=t[i];r?a[i].set(r.x*this.dpr,(e-r.y-r.h)*this.dpr,(r.x+r.w)*this.dpr,(e-r.y)*this.dpr):a[i].set(-9,-9,-9,-9)}!this.running&&this.sized&&this.renderOnce()}setPointer(t,e,a){let i=this.layout;this.pointerTarget.set(t-i.w/2,i.h/2-e),this.pointerNTarget.set(t/i.w*2-1,-(e/i.h*2-1)),this.pointerOnTarget=a&&!this.reduced?1:0}pluck(t,e,a){if(this.reduced)return;let i=this.layout;this.threadMat.uniforms.uPluck.value[this.pluckSlot++%4].set(t-i.w/2,i.h/2-e,this.now(),a)}wave(t,e){if(this.reduced)return;let a=this.layout;this.threadMat.uniforms.uWave.value.set(t-a.w/2,a.h/2-e,this.now(),1)}setScroll(t){this.scrollTarget=Math.min(1,Math.max(0,t)),this.reduced&&(this.scroll=this.scrollTarget,this.applyScroll(),this.renderOnce())}get epsilon(){return this.threadMat.uniforms.uSpread.value}start(){if(this.running||this.reduced){this.reduced&&this.renderOnce();return}this.running=!0,this.last=performance.now(),this.revealStart<0&&(this.revealStart=this.last),this.raf=requestAnimationFrame(this.loop)}stop(){this.running=!1,cancelAnimationFrame(this.raf)}renderOnce(){this.sized&&(this.threadMat.uniforms.uTime.value=this.now(),this.dustMat.uniforms.uTime.value=this.now(),this.renderer.render(this.scene,this.camera),this.markFirst())}dispose(){this.stop(),this.threadGeo.dispose(),this.dustGeo.dispose(),this.threadMat.dispose(),this.dustMat.dispose(),this.renderer.dispose()}now(){return this.reduced?this.frozenTime:(performance.now()-this.t0)/1e3}markFirst(){!this.firstFrame&&this.onFirstFrame&&(this.firstFrame=!0,this.onFirstFrame?.())}applyScroll(){let t=this.threadMat.uniforms;t.uSpread.value=.05*(1-.86*this.scroll),t.uWaveAmp.value=1-.7*this.scroll}loop=()=>{if(!this.running)return;this.raf=requestAnimationFrame(this.loop);let t=performance.now(),e=Math.min(100,t-this.last);this.last=t,this.adapt(e);let a=this.threadMat.uniforms,i=1-Math.pow(.001,e/1e3);a.uPointer.value.lerp(this.pointerTarget,Math.min(1,6*i)),a.uPointerN.value.lerp(this.pointerNTarget,Math.min(1,2*i)),a.uPointerOn.value+=(this.pointerOnTarget-a.uPointerOn.value)*Math.min(1,4*i),this.scroll+=(this.scrollTarget-this.scroll)*Math.min(1,5*i),this.applyScroll();let r=this.now();a.uTime.value=r,this.dustMat.uniforms.uTime.value=r;let o=Math.min(1,(t-this.revealStart)/2800);a.uReveal.value=1.12*(o<.5?4*o*o*o:1-Math.pow(-2*o+2,3)/2),this.renderer.render(this.scene,this.camera),this.markFirst()};adapt(t){this.frames++,this.ema+=(t-this.ema)*.05,this.frames<90||this.ema<30||(this.frames=0,this.ema=16,this.dpr>1?(this.dpr=Math.max(1,this.dpr-.5),this.renderer.setPixelRatio(this.dpr),this.threadMat.uniforms.uPx.value=1/this.dpr,this.dustMat.uniforms.uDpr.value=this.dpr,this.resize(this.layout.w,this.layout.h)):this.threadGeo.instanceCount>48?this.threadGeo.instanceCount=Math.round(.7*this.threadGeo.instanceCount):(this.threadMat.uniforms.uReveal.value=1.12,this.stop(),this.renderOnce()))}}t.s(["ThreadField",0,n])}]);