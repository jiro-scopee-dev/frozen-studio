import * as THREE from 'three';

const $=id=>document.getElementById(id);
const projects=[
 {title:'Frozen signal',type:'STUDY 001 / FORM & IDENTITY',subtitle:'An identity found in the spaces between.',label:'FRAGMENTED IDENTITY',body:'A sculptural exploration of the letter J. Familiar geometry breaks apart into something less certain: a floating fragment, a signal, a shape on the edge of recognition.','extra':'The study considers how a personal identity can feel both grounded and unfinished. Frosted surfaces catch the light while the core stays deliberately open.'},
 {title:'Orbital thinking',type:'STUDY 002 / SYSTEMS & MOTION',subtitle:'Different paths. A shared center.',label:'A SYSTEM IN BALANCE',body:'Three paths orbit a common center. This kinetic study explores the tension between structure and freedom, using repeated forms to create a changing silhouette.',extra:'Move around the object to find new alignments. What looks chaotic from one angle resolves into a quiet system from another.'},
 {title:'Quiet matter',type:'STUDY 003 / LIGHT & POSSIBILITY',subtitle:'A small world, still becoming.',label:'THE SHAPE OF POSSIBILITY',body:'An irregular crystalline form suspended above a frozen landscape. A study of how light gives even a simple object depth, presence, and a sense of possibility.',extra:'Its facets are intentionally imperfect. The object changes as you look at it, suggesting that a finished shape can still hold something unknown.'}
];
let active=0,transitioning=false,scene,renderer,camera,sculpture,particles,shards=[],last=0,phase=0,drag=false,lastX=0,rotation=0,targetX=0,targetY=0;
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const mobile=matchMedia('(max-width:700px)').matches;
function geometry(kind){
 const group=new THREE.Group();
 const ice=new THREE.MeshPhysicalMaterial({color:0xb7cad4,metalness:.33,roughness:.3,clearcoat:.8,clearcoatRoughness:.25,flatShading:true});
 const dark=new THREE.MeshStandardMaterial({color:0x526975,roughness:.56,metalness:.4});
 if(kind===0||kind===1){
  const shape=new THREE.Shape();shape.moveTo(-.7,1.65);shape.lineTo(1,1.65);shape.lineTo(1,1.05);shape.lineTo(.58,1.05);shape.lineTo(.58,-.65);shape.bezierCurveTo(.58,-1.8,-1.35,-1.85,-1.35,-.55);shape.lineTo(-.72,-.55);shape.bezierCurveTo(-.72,-1.05,-.03,-1.13,-.03,-.55);shape.lineTo(-.03,1.05);shape.lineTo(-.7,1.05);shape.closePath();
  const geo=new THREE.ExtrudeGeometry(shape,{depth:.65,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.13,bevelThickness:.13});geo.center();const mesh=new THREE.Mesh(geo,ice);mesh.rotation.set(-.12,-.28,-.08);group.add(mesh);
  const edge=new THREE.LineSegments(new THREE.EdgesGeometry(geo,40),new THREE.LineBasicMaterial({color:0xe3eff5,transparent:true,opacity:.24}));mesh.add(edge);
  for(let i=0;i<36;i++){const m=new THREE.Mesh(new THREE.IcosahedronGeometry(.04+Math.random()*.13,0),i%4?ice:dark);const a=Math.random()*Math.PI*2;m.position.set(Math.cos(a)*(1.3+Math.random()*.5),Math.sin(a)*1.8,(Math.random()-.5)*1.2);m.rotation.set(Math.random()*3,Math.random()*3,0);group.add(m)}
 }else if(kind===2){
  for(let i=0;i<3;i++){const m=new THREE.Mesh(new THREE.TorusGeometry(1.35,.16,12,100),ice);m.rotation.set(i*.9,i*.8,.3);group.add(m)}group.add(new THREE.Mesh(new THREE.IcosahedronGeometry(.62,1),dark));
 }else{
  const geo=new THREE.IcosahedronGeometry(1.5,1);const pos=geo.attributes.position;for(let i=0;i<pos.count;i++){const f=1+Math.sin(pos.getX(i)*5+pos.getY(i)*3)*.1;pos.setXYZ(i,pos.getX(i)*f,pos.getY(i)*f*1.2,pos.getZ(i)*f)}geo.computeVertexNormals();group.add(new THREE.Mesh(geo,ice));group.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo),new THREE.LineBasicMaterial({color:0xe3eff5,transparent:true,opacity:.16})));
 }group.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}});return group;
}
function terrain(){
 const geo=new THREE.PlaneGeometry(160,160,200,200);geo.rotateX(-Math.PI/2);const pos=geo.attributes.position;
 for(let i=0;i<pos.count;i++){const x=pos.getX(i),z=pos.getZ(i);const dist=Math.sqrt(x*x+z*z);const h=(Math.sin(x*.22+1)*Math.cos(z*.17)*2.5+Math.sin(x*.61+z*.3)*.45+Math.sin(x*1.9+z*.7)*.1);pos.setY(i,h*Math.min(1,dist/14)-2.9)}geo.computeVertexNormals();const mesh=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({color:0xa5b4bd,roughness:.93,metalness:.08}));mesh.receiveShadow=true;scene.add(mesh);
 // Layered ridges frame the horizon rather than a flat background.
 for(let i=0;i<10;i++){const m=new THREE.Mesh(new THREE.ConeGeometry(10+Math.random()*9,8+Math.random()*8,7,1),new THREE.MeshStandardMaterial({color:0xaab9c2,roughness:1,flatShading:true}));m.position.set((i-5)*15,-1,-38-Math.random()*20);m.scale.z=.65;scene.add(m)}
}
function init(){
 scene=new THREE.Scene();scene.background=new THREE.Color(0xc1cbd2);scene.fog=new THREE.FogExp2(0xc1cbd2,.027);
 camera=new THREE.PerspectiveCamera(38,innerWidth/innerHeight,.1,200);camera.position.set(0,2.2,13);
 renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,mobile?1.5:2));renderer.setSize(innerWidth,innerHeight);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.5;$('world').appendChild(renderer.domElement);
 scene.add(new THREE.HemisphereLight(0xeaf5ff,0x6c7c86,3));const sun=new THREE.DirectionalLight(0xf4faff,4);sun.position.set(-6,12,7);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-15;sun.shadow.camera.right=15;sun.shadow.camera.top=15;sun.shadow.camera.bottom=-15;sun.shadow.normalBias=.04;scene.add(sun);const rim=new THREE.DirectionalLight(0x9ec8e8,3);rim.position.set(7,3,-5);scene.add(rim);terrain();
 const pedestal=new THREE.Mesh(new THREE.CylinderGeometry(2.1,2.3,.32,96),new THREE.MeshStandardMaterial({color:0x9eafb9,metalness:.4,roughness:.48}));pedestal.position.set(2.3,-2.25,0);pedestal.receiveShadow=true;scene.add(pedestal);
 const ring=new THREE.Mesh(new THREE.TorusGeometry(2.13,.016,6,120),new THREE.MeshBasicMaterial({color:0xe2f3fd}));ring.rotation.x=Math.PI/2;ring.position.copy(pedestal.position);ring.position.y+=.18;scene.add(ring);
 sculpture=geometry(0);sculpture.position.set(mobile?0:2.3,mobile?-1:0,0);scene.add(sculpture);
 const count=mobile?450:1100;const points=new Float32Array(count*3);for(let i=0;i<points.length;i+=3){points[i]=(Math.random()-.5)*35;points[i+1]=Math.random()*15-4;points[i+2]=(Math.random()-.5)*25}const pg=new THREE.BufferGeometry();pg.setAttribute('position',new THREE.BufferAttribute(points,3));particles=new THREE.Points(pg,new THREE.PointsMaterial({color:0xf5fbff,size:.025,transparent:true,opacity:.65,depthWrite:false}));scene.add(particles);
 for(let i=0;i<65;i++){const m=new THREE.Mesh(new THREE.IcosahedronGeometry(.02+Math.random()*.07,0),new THREE.MeshStandardMaterial({color:0xb9d4e5,metalness:.3,roughness:.3}));m.userData.seed=Math.random()*Math.PI*2;m.userData.radius=1+Math.random()*2;shards.push(m);scene.add(m)}
 renderer.domElement.addEventListener('pointerdown',e=>{drag=true;lastX=e.clientX;renderer.domElement.setPointerCapture(e.pointerId)});renderer.domElement.addEventListener('pointerup',()=>drag=false);renderer.domElement.addEventListener('pointercancel',()=>drag=false);window.addEventListener('pointermove',e=>{targetX=e.clientX/innerWidth-.5;targetY=e.clientY/innerHeight-.5;if(drag){rotation+=(e.clientX-lastX)*.008;lastX=e.clientX}});
 window.addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);sculpture.position.x=innerWidth<700?0:2.3;sculpture.position.y=innerWidth<700?-1:0});
 renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();$('fallback').hidden=false});
 tick(0);
}
function tick(now){requestAnimationFrame(tick);const dt=Math.min((now-last)/1000,.05);last=now;if(!reduced)phase+=dt;const t=phase;
 sculpture.rotation.y=rotation+Math.sin(t*.18)*.23;sculpture.position.y=(innerWidth<700?-1:0)+Math.sin(t*.7)*.1;
 camera.position.x+=(targetX*.45-camera.position.x)*.025;camera.position.y+=(2.2-targetY*.3-camera.position.y)*.025;camera.lookAt(0,0,0);
 if(!reduced){particles.rotation.y=t*.007;const p=particles.geometry.attributes.position;for(let i=0;i<p.count;i++){let y=p.getY(i)-dt*.12;if(y<-4)y=11;p.setY(i,y)}p.needsUpdate=true}
 shards.forEach((m,i)=>{const s=m.userData.seed,r=m.userData.radius*(transitioning?2.1:1);m.position.set(sculpture.position.x+Math.cos(s+t*.15)*r,sculpture.position.y+Math.sin(s*2+t*.25)*2,Math.sin(s+t*.15)*r);m.rotation.x=t*.2+s;m.rotation.z=t*.1});renderer.render(scene,camera);
}
async function go(index){if(transitioning)return;const next=(index+4)%4;if(next===active)return;transitioning=true;document.body.classList.add('changing');await new Promise(r=>setTimeout(r,reduced?0:320));active=next;$('intro').hidden=active!==0;$('collection').hidden=active===0;
 if(active){const p=projects[active-1];$('project-type').textContent=p.type;$('project-title').textContent=p.title;$('project-subtitle').textContent=p.subtitle;$('object-label').textContent=p.label}else $('object-label').textContent='A STUDY IN CURIOSITY';
 $('current').textContent=String(active).padStart(2,'0');$('scene-index').textContent=active?`SELECTED STUDIES — 0${active}`:'INTRODUCTION — 00';
 if(scene){scene.remove(sculpture);sculpture.traverse(o=>{o.geometry?.dispose();if(o.material)o.material.dispose()});sculpture=geometry(active);sculpture.position.set(innerWidth<700?0:2.3,innerWidth<700?-1:0,0);scene.add(sculpture)}
 document.body.classList.remove('changing');transitioning=false;
}
$('next').onclick=()=>go(active+1);$('prev').onclick=()=>go(active-1);$('explore').onclick=()=>go(1);$('home').onclick=()=>go(0);
let wheelTime=0;window.addEventListener('wheel',e=>{if($('details').open||$('about').open)return;if(Math.abs(e.deltaY)>25&&Date.now()-wheelTime>1100){wheelTime=Date.now();go(active+(e.deltaY>0?1:-1))}},{passive:true});
document.addEventListener('keydown',e=>{if($('details').open||$('about').open)return;if(e.key==='ArrowRight'||e.key==='ArrowDown'){e.preventDefault();go(active+1)}if(e.key==='ArrowLeft'||e.key==='ArrowUp'){e.preventDefault();go(active-1)}});
$('project-open').onclick=()=>{const p=projects[active-1];if(!p)return;$('detail-meta').textContent=p.type+' / 2026';$('detail-title').textContent=p.title;$('detail-body').replaceChildren(...[p.body,p.extra].map(text=>{const el=document.createElement('p');el.textContent=text;return el}));$('details').showModal()};$('details-close').onclick=$('back-world').onclick=()=>$('details').close();$('about-open').onclick=()=>$('about').showModal();$('about-close').onclick=()=>$('about').close();$('about-explore').onclick=()=>{$('about').close();go(1)};
let audioContext,master,sounding=false;
$('sound').onclick=async()=>{try{if(!audioContext){audioContext=new AudioContext();master=audioContext.createGain();master.gain.value=0;master.connect(audioContext.destination);[55,82.41,110.2].forEach(f=>{const osc=audioContext.createOscillator();osc.frequency.value=f;const gain=audioContext.createGain();gain.gain.value=.018;osc.connect(gain);gain.connect(master);osc.start()})}await audioContext.resume();sounding=!sounding;master.gain.setTargetAtTime(sounding?1:0,audioContext.currentTime,.4);$('sound').innerHTML=`<span id="sound-icon">⌁</span> SOUND: ${sounding?'ON':'OFF'}`;$('sound').setAttribute('aria-pressed',String(sounding))}catch{$('sound').textContent='SOUND UNAVAILABLE'}};
document.addEventListener('visibilitychange',()=>{if(audioContext){if(document.hidden)audioContext.suspend();else if(sounding)audioContext.resume()}});
function time(){$('time').textContent=new Date().toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'})}time();setInterval(time,60000);
try{init()}catch(error){console.warn('Still-mode fallback:',error);$('fallback').hidden=false;$('load-label').textContent='ENTERING STILL MODE'}
setTimeout(()=>$('loader').classList.add('done'),reduced?150:1100);
