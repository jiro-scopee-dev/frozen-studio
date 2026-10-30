import assert from 'node:assert/strict';
import {icebergGeometry,iceMaterial,createIcebergs} from './ice-world.js';
import {createProjectIcon} from './glacier-interior.js';
for(let seed=1;seed<=3;seed++){
 const g=icebergGeometry(seed),a=g.attributes.position;
 assert.ok(a.count>600);
 for(const value of a.array)assert.ok(Number.isFinite(value));
 assert.ok(g.index.count>3000);
 g.computeBoundingBox();assert.ok(g.boundingBox.max.y-g.boundingBox.min.y>3.5);
}
for(const snow of [true,false]){const m=iceMaterial({snow});const shader={uniforms:{},vertexShader:'#include <common>\n#include <begin_vertex>',fragmentShader:'#include <common>\n#include <color_fragment>\n#include <roughnessmap_fragment>\n#include <normal_fragment_maps>\n#include <opaque_fragment>'};m.onBeforeCompile(shader);assert.ok(shader.fragmentShader.includes('iceCrack'));assert.ok(shader.fragmentShader.includes('dFdx'));assert.ok(shader.fragmentShader.includes('float rim='));assert.ok(shader.fragmentShader.includes('hemisphereColor'));assert.ok(shader.uniforms.uJourney);assert.ok(shader.vertexShader.includes('vIcePoint=position'));}
assert.equal(createIcebergs().length,3);
for(let i=0;i<3;i++)assert.ok(createProjectIcon(i).children.length>0,'Every glacier needs an embedded symbol');
assert.ok(iceMaterial().transmission>.8,'Glaciers need clear glass transmission');
console.log('Verified iceberg geometry, normals, material shader injection, and three project groups.');
