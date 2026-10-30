import * as THREE from 'three';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'three/addons/postprocessing/UnrealBloomPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';

export function createAtmosphere(renderer,scene,camera,{reducedMotion=false}={}){
 const uniforms={uTime:{value:0},uProgress:{value:0},uOpacity:{value:0}};
 const material=new THREE.ShaderMaterial({uniforms,side:THREE.BackSide,transparent:true,depthWrite:false,
 vertexShader:`varying vec2 vUv;varying vec3 vWorld;void main(){vUv=uv;vec4 p=modelMatrix*vec4(position,1.);vWorld=p.xyz;gl_Position=projectionMatrix*viewMatrix*p;}`,
 fragmentShader:`uniform float uTime;uniform float uProgress;uniform float uOpacity;varying vec2 vUv;varying vec3 vWorld;
 float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
 float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
 float fbm(vec2 p){float n=0.,a=.5;mat2 r=mat2(.8,-.6,.6,.8);for(int i=0;i<5;i++){n+=noise(p)*a;p=r*p*2.03+11.7;a*=.5;}return n;}
 void main(){
  float travel=uProgress*5.+uTime*.028;
  vec2 p=vec2(vUv.x*9.+vUv.y*8.+travel*.35,vUv.y*24.-travel);
  float warp=fbm(p*.65);float cloud=fbm(p+vec2(warp*3.,warp*2.));
  float bands=pow(.5+.5*sin(vUv.y*105.+warp*7.-travel*2.),3.);
  float density=smoothstep(.26,.75,cloud);
  vec3 color=mix(vec3(.36,.49,.61),vec3(1.3,1.43,1.5),density);
  color+=bands*density*.22;
  float endFade=smoothstep(0.,.06,vUv.y)*(1.-smoothstep(.93,1.,vUv.y));
  gl_FragColor=vec4(color,(.14+density*.6)*uOpacity*endFade);
 }`});
 const cloud=new THREE.Mesh(new THREE.CylinderGeometry(4.3,4.3,110,64,1,true),material);cloud.rotation.x=Math.PI/2;cloud.position.set(0,1,-61);cloud.frustumCulled=false;scene.add(cloud);
 const composer=new EffectComposer(renderer);composer.addPass(new RenderPass(scene,camera));
 const bloom=new UnrealBloomPass(new THREE.Vector2(innerWidth,innerHeight),.18,.55,1.04);composer.addPass(bloom);composer.addPass(new OutputPass());
 function resize(){composer.setPixelRatio(Math.min(devicePixelRatio,innerWidth<700?1:1.5));composer.setSize(innerWidth,innerHeight)}resize();window.addEventListener('resize',resize);
 const smooth=(p,a,b)=>{const t=THREE.MathUtils.clamp((p-a)/(b-a),0,1);return t*t*(3-2*t)};
 return {render(progress,time){
  const p=Math.min(progress/.84,1),portal=smooth(p,.39,.48)*(1-smooth(p,.74,.84));
  uniforms.uTime.value=reducedMotion?0:time;uniforms.uProgress.value=reducedMotion?0:p;uniforms.uOpacity.value=portal;
  cloud.visible=portal>.001;
  bloom.strength=reducedMotion?.13:.16+portal*.36+smooth(progress,.9,1)*.12;
  bloom.threshold=1.28-portal*.4;
  composer.render();
 }};
}
