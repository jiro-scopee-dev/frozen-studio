import assert from 'node:assert/strict';
import {glacierTravel,smoother} from './glacier-motion.js';
assert.equal(glacierTravel(.685),0);assert.equal(glacierTravel(.745),1);assert.equal(glacierTravel(.805),2);
let last=0;for(let p=0;p<=1;p+=.0001){const t=glacierTravel(p);assert.ok(t>=last-1e-8&&t<=2);last=t}
for(const boundary of [.695,.735,.755,.795])assert.ok(Math.abs(glacierTravel(boundary+1e-5)-glacierTravel(boundary-1e-5))<1e-6);
assert.equal(smoother(0),0);assert.equal(smoother(1),1);
console.log('Verified continuous, reversible glacier travel and stable study stops.');
