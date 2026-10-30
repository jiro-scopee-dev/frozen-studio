import assert from 'node:assert/strict';
import {createShelter} from './shelter.js';
const {group,bricks}=createShelter();
assert.ok(bricks.length>130,'The shell and entrance must contain individual blocks');
for(const block of bricks){
 const p=block.geometry.attributes.position;
 for(let i=0;i<p.array.length;i++)assert.ok(Number.isFinite(p.array[i]),'Geometry must contain no invalid coordinates');
 assert.ok(block.userData.home.isVector3,'Every fragment needs a reversible home position');
 assert.ok(block.castShadow&&block.receiveShadow,'Blocks must contribute to scene lighting');
 assert.ok(block.material.bumpMap,'Frost detail must be assigned');
}
assert.ok(group.children.length>bricks.length,'Interior and grounding geometry must be present');
console.log(`Verified ${bricks.length} curved snow blocks, frost maps, shadow flags, and reconstruction origins.`);
