import * as THREE from 'three';
const shaderState={uJourney:{value:0},uIceTime:{value:0}};
export function updateIceShaders(progress,time){shaderState.uJourney.value=progress;shaderState.uIceTime.value=time}

const noiseGLSL=`
varying vec3 vIcePoint;
varying vec3 vIceNormal;
varying vec3 vIceWorldNormal;
uniform float uJourney;
uniform float uIceTime;
float iceHash(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
float iceNoise(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(iceHash(i),iceHash(i+vec3(1,0,0)),f.x),mix(iceHash(i+vec3(0,1,0)),iceHash(i+vec3(1,1,0)),f.x),f.y),mix(mix(iceHash(i+vec3(0,0,1)),iceHash(i+vec3(1,0,1)),f.x),mix(iceHash(i+vec3(0,1,1)),iceHash(i+vec3(1,1,1)),f.x),f.y),f.z);}
float iceField(vec3 p){return iceNoise(p*2.)*.5+iceNoise(p*6.)*.28+iceNoise(p*18.)*.14+iceNoise(p*48.)*.08;}
float iceCrack(vec3 p){float warp=iceNoise(p*2.3);float a=abs(sin(p.x*3.1+p.y*1.8+warp*3.));float b=abs(sin(p.z*4.2-p.y*2.1+warp*2.));return 1.-smoothstep(.008,.045,min(a,b));}
`;
export function iceMaterial({snow=false}={}){
 const mat=new THREE.MeshPhysicalMaterial({color:0xe0f4fc,roughness:snow?.85:.075,metalness:0,ior:1.31,transmission:snow?0:.88,thickness:1.15,attenuationColor:0x5da9c6,attenuationDistance:5,clearcoat:snow?.08:1,clearcoatRoughness:.065,envMapIntensity:snow?.45:1.35});
 mat.onBeforeCompile=shader=>{
  Object.assign(shader.uniforms,shaderState);
  shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vIcePoint;\nvarying vec3 vIceNormal;\nvarying vec3 vIceWorldNormal;').replace('#include <begin_vertex>','#include <begin_vertex>\nvIcePoint=position;vIceNormal=normal;vIceWorldNormal=normalize(mat3(modelMatrix)*normal);');
  shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\n'+noiseGLSL);
  shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
   float field=iceField(vIcePoint);float cracks=iceCrack(vIcePoint);float strata=sin(vIcePoint.y*23.+field*6.)*.5+.5;
   ${snow?'vec3 iceColor=mix(vec3(.63,.73,.79),vec3(.96,.98,1.),field);iceColor*=1.-cracks*.065;':'vec3 iceColor=mix(vec3(.10,.32,.44),vec3(.63,.86,.94),field);iceColor=mix(iceColor,vec3(.83,.96,1.),cracks*.55);float frost=smoothstep(.36,.82,vIceNormal.y)*smoothstep(.0,1.6,vIcePoint.y+field*.8);iceColor=mix(iceColor,vec3(.87,.94,.97),frost*.8);iceColor+=strata*.035;'}
   diffuseColor.rgb*=iceColor;`);
  shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>',`float hemisphere=clamp(dot(normalize(vIceWorldNormal),vec3(0.,1.,0.))*.5+.5,0.,1.);
   vec3 hemisphereColor=mix(vec3(.48,.61,.73),vec3(.98,1.,1.03),hemisphere);
   float rim=pow(1.-max(dot(normalize(normal),normalize(vViewPosition)),0.),3.);
   outgoingLight*=mix(vec3(1.),hemisphereColor,.25);
   ${snow?'outgoingLight*=.65;':''}
   outgoingLight+=vec3(.69,.87,1.)*rim*${snow?'1.3':'.32'};
   ${snow?'outgoingLight+=vec3(.12,.22,.3);':''}
   float mist=smoothstep(.25,.46,uJourney)*(1.-smoothstep(.5,.72,uJourney));
   outgoingLight=mix(outgoingLight,vec3(.84,.9,.95),mist*.12);
   #include <opaque_fragment>`);
  shader.fragmentShader=shader.fragmentShader.replace('#include <roughnessmap_fragment>',`#include <roughnessmap_fragment>\nroughnessFactor=clamp(roughnessFactor+iceNoise(vIcePoint*22.)*${snow?'.16':'.045'},0.05,1.);`);
  shader.fragmentShader=shader.fragmentShader.replace('#include <normal_fragment_maps>',`#include <normal_fragment_maps>
   float relief=iceField(vIcePoint*3.)*.14+iceCrack(vIcePoint)*.012;
   vec3 tangentA=normalize(cross(dFdy(vViewPosition),normal));vec3 tangentB=normalize(cross(normal,dFdx(vViewPosition)));
   normal=normalize(normal+(tangentA*dFdx(relief)+tangentB*dFdy(relief))*2.);`);
 };
 mat.customProgramCacheKey=()=>snow?'snow-field-v2-rim':'glacial-field-v2-rim';return mat;
}

export function icebergGeometry(seed=1){
 const sides=36,rows=18,positions=[],indices=[];
 for(let row=0;row<=rows;row++)for(let side=0;side<sides;side++){
  const a=side/sides*Math.PI*2,t=row/rows;
  const contour=1+Math.sin(a*3+seed)*.15+Math.cos(a*7-seed)*.07;
  const taper=t<.35?.8+t*.7:Math.pow(1-(t-.35)/.65,.43)*1.05;
  const r=(.03+taper)*contour*(1+Math.sin(row*1.7+side*.7+seed)*.035);
  const peak=Math.sin(a*2+seed)*.28+Math.cos(a*5+seed)*.16;
  positions.push((Math.cos(a)*r+.25*t*t)*1.3, -1.5+t*3.8+peak*t*t,Math.sin(a)*r*1.15);
 }
 for(let r=0;r<rows;r++)for(let s=0;s<sides;s++){const a=r*sides+s,b=r*sides+(s+1)%sides,c=a+sides,d=b+sides;indices.push(a,c,b,b,c,d)}
 const bottom=positions.length/3;positions.push(0,-1.5,0);for(let s=0;s<sides;s++)indices.push(bottom,s,(s+1)%sides);
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setIndex(indices);g.computeVertexNormals();return g;
}
export function createIcebergs(){
 const material=iceMaterial(),groups=[];
 for(let i=0;i<3;i++){
  const group=new THREE.Group(),main=new THREE.Mesh(icebergGeometry(i*2+1),material);main.castShadow=main.receiveShadow=true;group.add(main);
  for(let j=0;j<8;j++){const chunk=new THREE.Mesh(icebergGeometry(i*3+j+2),material);const a=j/8*Math.PI*2;chunk.position.set(Math.cos(a)*(1.05+j%2*.3),-1.25,Math.sin(a)*1.05);chunk.scale.setScalar(.14+(j%3)*.07);chunk.rotation.y=j;group.add(chunk)}
  group.scale.setScalar([1.48,1.58,1.7][i]);group.userData.baseScale=[1.48,1.58,1.7][i];groups.push(group);
 }return groups;
}

export function createSocialParticles(){
 const group=new THREE.Group(),items=[],count=1800;
 const vertex=`attribute vec3 aScatter;attribute float aDelay;uniform float uProgress;uniform float uTime;uniform float uPixel;varying float vOpacity;
 void main(){float t=smoothstep(aDelay,aDelay+.62,uProgress);vec3 p=mix(aScatter,position,t);float swirl=(1.-t);p.x+=sin(uTime*.3+aDelay*30.+t*5.)*swirl*.6;p.y+=cos(aDelay*25.+t*6.)*swirl*.6;vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;gl_PointSize=clamp((2.2+sin(aDelay*80.)*.5)*uPixel*(12./-mv.z),1.,5.);vOpacity=smoothstep(0.,.12,uProgress)*(.45+t*.55);}`;
 const fragment=`varying float vOpacity;void main(){float r=length(gl_PointCoord-.5);if(r>.5)discard;gl_FragColor=vec4(.72,.91,1.,vOpacity*(1.-smoothstep(.15,.5,r)));}`;
 for(let icon=0;icon<3;icon++){
  const canvas=document.createElement('canvas');canvas.width=canvas.height=192;const c=canvas.getContext('2d');c.strokeStyle=c.fillStyle='#fff';c.lineWidth=13;c.lineCap='round';
  if(icon===0){c.beginPath();c.roundRect(28,28,136,136,34);c.stroke();c.beginPath();c.arc(96,96,33,0,Math.PI*2);c.stroke();c.beginPath();c.arc(138,55,9,0,Math.PI*2);c.fill()}
  if(icon===1){c.font='bold 150px Arial';c.textAlign='center';c.fillText('in',96,148)}
  if(icon===2){c.lineWidth=8;c.beginPath();c.moveTo(37,31);c.lineTo(77,31);c.lineTo(156,162);c.lineTo(116,162);c.closePath();c.stroke();c.beginPath();c.moveTo(153,30);c.lineTo(35,163);c.stroke()}
  const data=c.getImageData(0,0,192,192).data,mask=[];for(let y=0;y<192;y++)for(let x=0;x<192;x++)if(data[(y*192+x)*4+3]>100)mask.push([x,y]);
  const pos=[],scatter=[],delay=[];for(let j=0;j<count;j++){const sample=mask[Math.floor(j/count*mask.length)];pos.push((sample[0]/192-.5)*2.6,(.5-sample[1]/192)*2.6,(Math.random()-.5)*.08);const a=Math.random()*Math.PI*2,r=3+Math.random()*6;scatter.push(Math.cos(a)*r,Math.sin(a)*r,(Math.random()-.5)*9);delay.push(Math.random()*.36)}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setAttribute('aScatter',new THREE.Float32BufferAttribute(scatter,3));geo.setAttribute('aDelay',new THREE.Float32BufferAttribute(delay,1));
  const uniforms={uProgress:{value:0},uTime:{value:0},uPixel:{value:Math.min(devicePixelRatio,1.75)}};
  const points=new THREE.Points(geo,new THREE.ShaderMaterial({vertexShader:vertex,fragmentShader:fragment,uniforms,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));points.frustumCulled=false;group.add(points);items.push(points);
 }
 group.position.z=-12;
 return {group,items,update(progress,time,mobile){items.forEach((p,i)=>{p.position.set(mobile?0:(i-1)*3.7,mobile?1.4-i*1.7:-.2,0);p.scale.setScalar(mobile?.6:1);p.material.uniforms.uProgress.value=progress;p.material.uniforms.uTime.value=time});group.visible=progress>.001}};
}
