import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { iceMaterial } from './ice-world.js';

// All detail is generated locally. No external model or texture downloads.
function snowTextures(){
 const size=256,color=new Uint8Array(size*size*4),bump=new Uint8Array(size*size*4);
 const hash=(x,y)=>{const n=Math.sin(x*127.1+y*311.7)*43758.5453;return n-Math.floor(n)};
 const noise=(x,y)=>{const a=Math.floor(x),b=Math.floor(y);let u=x-a,v=y-b;u=u*u*(3-2*u);v=v*v*(3-2*v);return THREE.MathUtils.lerp(THREE.MathUtils.lerp(hash(a,b),hash(a+1,b),u),THREE.MathUtils.lerp(hash(a,b+1),hash(a+1,b+1),u),v)};
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const broad=noise(x*.035,y*.035),medium=noise(x*.15,y*.15),fine=hash(x,y);
  const fissure=Math.pow(Math.max(0,1-Math.abs(Math.sin(x*.022+noise(x*.025,y*.03)*3+y*.009))*18),3);
  const value=THREE.MathUtils.clamp(181+broad*37+medium*19+fine*14-fissure*22,0,255),height=broad*80+medium*65+fine*50-fissure*35;
  const i=(y*size+x)*4;color.set([value*.94,value*.975,value,255],i);bump.set([height,height,height,255],i);
 }
 function texture(data,srgb=false){const t=new THREE.DataTexture(data,size,size,THREE.RGBAFormat);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.magFilter=THREE.LinearFilter;t.minFilter=THREE.LinearMipmapLinearFilter;t.generateMipmaps=true;t.anisotropy=4;if(srgb)t.colorSpace=THREE.SRGBColorSpace;t.needsUpdate=true;return t}
 return {map:texture(color,true),bumpMap:texture(bump)};
}
export function createShelter(){
 const group=new THREE.Group(),bricks=[],textures=snowTextures();
 const materials=Array.from({length:8},(_,i)=>{const mat=iceMaterial({snow:true});mat.color.setHSL(.57,.045,.9+i*.01);mat.map=textures.map;mat.bumpMap=textures.bumpMap;mat.bumpScale=.035;mat.emissive.setHex(0x5da8ce);mat.emissiveIntensity=.22;return mat});
 function add(geometry,position,row,index){const mesh=new THREE.Mesh(geometry,materials[(row*7+index)%materials.length]);mesh.position.copy(position);mesh.castShadow=true;mesh.receiveShadow=true;mesh.userData={home:position.clone(),baseRotation:mesh.rotation.clone(),angle:Math.atan2(position.x,position.z),row,index};bricks.push(mesh);group.add(mesh);return mesh}
 const rows=8;
 for(let row=0;row<rows;row++){
  const lower=Math.PI/2-row/rows*Math.PI/2,upper=Math.PI/2-(row+1)/rows*Math.PI/2,mid=(lower+upper)/2;
  const count=Math.max(5,Math.round(Math.sin(mid)*23));
  for(let i=0;i<count;i++){
   const phi=(i+(row%2)*.5)/count*Math.PI*2;
   if(row<3&&Math.abs(Math.atan2(Math.sin(phi),Math.cos(phi)))<.27)continue;
   const g=new RoundedBoxGeometry(1,1,1,3,.045),p=g.attributes.position;
   for(let j=0;j<p.count;j++){
    const x=p.getX(j),y=p.getY(j),z=p.getZ(j),a=phi+x*Math.PI*2/count*.982,theta=mid-y*(lower-upper)*.963;
    const erosion=Math.sin(a*47+theta*31)*Math.sin(a*19-theta*43)*.012;
    const radius=2.85+z*.52+erosion;
    p.setXYZ(j,Math.sin(a)*Math.sin(theta)*radius,-2.73+Math.cos(theta)*radius*1.16,Math.cos(a)*Math.sin(theta)*radius);
   }
   g.computeVertexNormals();g.computeBoundingBox();const center=g.boundingBox.getCenter(new THREE.Vector3());g.translate(-center.x,-center.y,-center.z);add(g,center,row,i);
  }
 }
 // A deep barrel-vault entrance, with wedge stones and a genuine dark interior.
 for(let depth=0;depth<3;depth++){
  for(let i=0;i<11;i++){
   const a=(i+.5)/11*Math.PI,g=new RoundedBoxGeometry(.3,.46,.69,3,.055);g.rotateZ(a-Math.PI/2);
   add(g,new THREE.Vector3(Math.cos(a)*.83,-1.84+Math.sin(a)*.83,2.55+depth*.66),depth,i+30);
  }
  for(const side of [-1,1])for(let row=0;row<2;row++)add(new RoundedBoxGeometry(.43,.43,.69,3,.05),new THREE.Vector3(side*.85,-2.52+row*.42,2.55+depth*.66),row,side+45);
 }
 const interior=new THREE.Mesh(new THREE.SphereGeometry(2.45,40,24,0,Math.PI*2,0,Math.PI/2),new THREE.MeshStandardMaterial({color:0x344b59,roughness:1,side:THREE.BackSide}));interior.position.y=-2.72;group.add(interior);
 const glow=new THREE.PointLight(0xa2c8df,1.4,4);glow.position.set(0,-1.6,2.4);group.add(glow);
 // A subtle compressed-snow skirt grounds the dome at its contact line.
 const skirt=new THREE.Mesh(new THREE.TorusGeometry(2.86,.12,10,100),materials[6]);skirt.rotation.x=Math.PI/2;skirt.position.y=-2.68;skirt.receiveShadow=true;group.add(skirt);
 return {group,bricks};
}
