import * as THREE from 'three';
export function createProjectIcon(index){
 const group=new THREE.Group(),material=new THREE.MeshBasicMaterial({color:0xb8f0ff,toneMapped:false});material.color.multiplyScalar(2.3);
 if(index===0){const shape=new THREE.Shape();shape.moveTo(-.45,.65);shape.lineTo(.42,.65);shape.lineTo(.42,-.23);shape.bezierCurveTo(.42,-.85,-.55,-.85,-.55,-.22);shape.lineTo(-.25,-.22);shape.bezierCurveTo(-.25,-.45,.12,-.45,.12,-.22);shape.lineTo(.12,.35);shape.lineTo(-.45,.35);shape.closePath();const geo=new THREE.ExtrudeGeometry(shape,{depth:.08,bevelEnabled:true,bevelThickness:.025,bevelSize:.025,bevelSegments:2,steps:1});geo.center();group.add(new THREE.Mesh(geo,material))}
 if(index===1){for(let i=0;i<3;i++){const ring=new THREE.Mesh(new THREE.TorusGeometry(.52,.035,8,70),material);ring.rotation.set(i*.9,i*.8,.25);group.add(ring)}group.add(new THREE.Mesh(new THREE.IcosahedronGeometry(.13,1),material))}
 if(index===2){const shape=new THREE.Shape();shape.moveTo(0,.7);shape.lineTo(.46,0);shape.lineTo(0,-.7);shape.lineTo(-.46,0);shape.closePath();const g=new THREE.ExtrudeGeometry(shape,{depth:.1,bevelEnabled:true,bevelSize:.025,bevelThickness:.025,bevelSegments:2,steps:1});g.center();group.add(new THREE.LineSegments(new THREE.EdgesGeometry(g),new THREE.LineBasicMaterial({color:0xc4f5ff,toneMapped:false})));}
 group.position.set(0,.25,.7);group.traverse(o=>{if(o.material){o.material.transparent=true;o.material.opacity=.9;o.material.depthTest=false;o.material.depthWrite=false;o.renderOrder=4}});return group;
}
export function createInterior(camera){
 const uniforms={uAmount:{value:0},uTime:{value:0}};
 const mesh=new THREE.Mesh(new THREE.SphereGeometry(5,40,24),new THREE.ShaderMaterial({uniforms,side:THREE.BackSide,transparent:true,depthWrite:false,
 vertexShader:'varying vec3 vP;void main(){vP=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
 fragmentShader:`uniform float uAmount;uniform float uTime;varying vec3 vP;
 void main(){vec3 p=normalize(vP);float veins=abs(sin(p.x*14.+p.z*9.+sin(p.y*12.)*2.));float crack=1.-smoothstep(.015,.07,veins);float waves=.5+.5*sin(p.y*23.+p.z*7.+sin(p.x*16.)+uTime*.05);vec3 color=mix(vec3(.015,.065,.115),vec3(.11,.34,.45),waves*.65);color+=crack*vec3(.3,.65,.8);gl_FragColor=vec4(color,uAmount*.97);}`
 }));mesh.renderOrder=10;mesh.frustumCulled=false;camera.add(mesh);
 return {update(amount,time){uniforms.uAmount.value=THREE.MathUtils.smoothstep(amount,.35,.95);uniforms.uTime.value=time;mesh.visible=amount>.35}};
}
