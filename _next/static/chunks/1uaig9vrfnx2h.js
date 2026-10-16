(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,73001,e=>{"use strict";var t=e.i(90072),i=e.i(8560);let s=`
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`,r=`
uniform sampler2D uTexA;
uniform sampler2D uTexB;
uniform sampler2D uDepA;
uniform sampler2D uDepB;
uniform vec2 uRes;
uniform vec2 uImg;
uniform float uMix;
uniform float uDir;
uniform float uTime;
uniform vec2 uPointer;
uniform float uDolly;
varying vec2 vUv;

vec2 cover(vec2 uv, float zoom) {
  float rs = uRes.x / uRes.y;
  float ri = uImg.x / uImg.y;
  vec2 s = rs > ri ? vec2(1.0, ri / rs) : vec2(rs / ri, 1.0);
  return (uv - 0.5) * s / zoom + 0.5;
}

vec3 scene(sampler2D tex, sampler2D dep, vec2 uv, vec2 shift) {
  float d = texture2D(dep, uv).r;
  vec2 p = uv + shift * (d - 0.4);
  d = texture2D(dep, p).r;          // 二次采样，减轻前景边缘的撕裂
  p = uv + shift * (d - 0.4);
  return texture2D(tex, clamp(p, 0.002, 0.998)).rgb;
}

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
  float zoom = 1.08 + uDolly * 0.05;
  vec2 uv = cover(vUv, zoom);
  vec2 shift = uPointer * vec2(0.022, 0.014) + vec2(sin(uTime * 0.25) * 0.004, cos(uTime * 0.2) * 0.003) + vec2(0.0, (uDolly - 0.5) * 0.012);
  vec3 a = scene(uTexA, uDepA, uv, shift);
  vec3 b = scene(uTexB, uDepB, uv, shift);

  float x = uDir > 0.0 ? vUv.x : 1.0 - vUv.x;
  float coord = x * 0.86 + (1.0 - vUv.y) * 0.14;
  coord += 0.03 * sin(vUv.y * 11.0 + uTime * 1.4) + 0.015 * sin(vUv.y * 29.0 - uTime * 2.1);
  float front = uMix * 1.3 - 0.15;
  float m = smoothstep(front + 0.012, front - 0.012, coord);
  vec3 col = mix(a, b, m);
  float inT = step(0.001, uMix) * step(uMix, 0.999);
  float dist = abs(coord - front);
  col += vec3(1.0, 0.8, 0.38) * exp(-dist * 60.0) * inT * 0.9;
  col += vec3(1.0, 0.92, 0.7) * exp(-dist * 420.0) * inT;

  // 统一调色：暗部偏靛蓝、高光偏暖金，让四张图属于同一部片子
  float l = dot(col, vec3(0.299, 0.587, 0.114));
  col = mix(col, col * vec3(0.84, 0.9, 1.14), (1.0 - l) * 0.55);
  col = mix(col, col * vec3(1.06, 1.0, 0.9), l * 0.25);
  vec2 q = vUv - 0.5;
  col *= 1.0 - dot(q, q) * 0.75;
  col += (hash(vUv * uRes + fract(uTime)) - 0.5) * 0.03;
  gl_FragColor = vec4(col, 1.0);
}
`;e.s(["DaysStage",0,class{sources;reduced;renderer;scene;camera;mat;tex;dep;cur;next;t;raf;running;last;t0;pointer;pointerTarget;dolly;dollyTarget;constructor(e,n,o){this.sources=n,this.reduced=o,this.scene=new t.Scene,this.camera=new t.OrthographicCamera(-1,1,1,-1,0,1),this.tex=[],this.dep=[],this.cur=0,this.next=-1,this.t=0,this.raf=0,this.running=!1,this.last=0,this.t0=performance.now(),this.pointer=new t.Vector2,this.pointerTarget=new t.Vector2,this.dolly=0,this.dollyTarget=0,this.loop=()=>{if(!this.running)return;this.raf=requestAnimationFrame(this.loop);let e=performance.now(),t=Math.min(100,e-this.last);this.last=e;let i=1-Math.pow(.02,t/1e3);this.pointer.lerp(this.pointerTarget,i),this.dolly+=(this.dollyTarget-this.dolly)*i,this.mat.uniforms.uDolly.value=this.dolly,this.next>=0&&(this.t=Math.min(1,this.t+t/1250),this.t>=1&&(this.cur=this.next,this.next=-1,this.t=0),this.bind()),this.renderOnce()},this.renderer=new i.WebGLRenderer({canvas:e,antialias:!1,alpha:!1,powerPreference:"high-performance"}),this.renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5)),this.mat=new t.ShaderMaterial({vertexShader:s,fragmentShader:r,depthTest:!1,depthWrite:!1,uniforms:{uTexA:{value:null},uTexB:{value:null},uDepA:{value:null},uDepB:{value:null},uRes:{value:new t.Vector2(1,1)},uImg:{value:new t.Vector2(1312,816)},uMix:{value:0},uDir:{value:1},uTime:{value:0},uPointer:{value:this.pointer},uDolly:{value:0}}});const u=new t.Mesh(new t.PlaneGeometry(2,2),this.mat);u.frustumCulled=!1,this.scene.add(u)}async load(){let e=new t.TextureLoader,i=e=>(e.minFilter=t.LinearFilter,e.magFilter=t.LinearFilter,e.generateMipmaps=!1,e),s=await Promise.all(this.sources.flatMap(t=>[e.loadAsync(t.image),e.loadAsync(t.depth)]));this.tex=s.filter((e,t)=>t%2==0).map(i),this.dep=s.filter((e,t)=>t%2==1).map(i);let r=this.tex[0].image;this.mat.uniforms.uImg.value.set(r.width,r.height),this.bind(),this.renderOnce()}show(e){if(!this.tex.length){this.cur=e;return}if(this.next>=0){if(e===this.next)return;this.t>.5&&(this.cur=this.next),this.next=-1,this.t=0}if(e===this.cur){this.bind(),this.renderOnce();return}if(this.mat.uniforms.uDir.value=e>this.cur?1:-1,this.reduced){this.cur=e,this.bind(),this.renderOnce();return}this.next=e,this.t=0,this.bind()}setPointer(e,t){this.reduced||this.pointerTarget.set(e,t)}setDolly(e){this.dollyTarget=this.reduced?.5:e}resize(e,t){this.renderer.setSize(e,t,!1),this.mat.uniforms.uRes.value.set(e,t),this.renderOnce()}start(){this.running||this.reduced||(this.running=!0,this.last=performance.now(),this.raf=requestAnimationFrame(this.loop))}stop(){this.running=!1,cancelAnimationFrame(this.raf)}dispose(){this.stop(),this.tex.concat(this.dep).forEach(e=>e.dispose()),this.mat.dispose(),this.renderer.dispose()}bind(){let e,t=this.mat.uniforms,i=this.next>=0?this.next:this.cur;t.uTexA.value=this.tex[this.cur],t.uDepA.value=this.dep[this.cur],t.uTexB.value=this.tex[i],t.uDepB.value=this.dep[i],t.uMix.value=this.next>=0?(e=this.t)<.5?4*e*e*e:1-Math.pow(-2*e+2,3)/2:0}renderOnce(){this.tex.length&&(this.mat.uniforms.uTime.value=this.reduced?3:(performance.now()-this.t0)/1e3,this.renderer.render(this.scene,this.camera))}loop}])}]);