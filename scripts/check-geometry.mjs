import assert from 'node:assert/strict';
import {blades,towerParts} from '../src/lib/tower.ts';
assert.equal(Math.max(...blades.map(b=>b.screenTop)),156);
assert.equal(Math.min(...blades.map(b=>b.left)),-14);
assert.equal(Math.max(...blades.map(b=>b.right)),14);
assert.equal(blades[2].left-blades[0].right,2.6);
const count=parts=>Object.values(parts).reduce((n,g)=>n+g.length,0);
for(const lite of [false,true]){
 const parts=towerParts(lite);
 for(const group of Object.values(parts))for(const p of group){assert(p.position.every(Number.isFinite));assert(p.size.every(n=>Number.isFinite(n)&&n>0))}
 assert.equal(parts.light.length,1);assert.equal(parts.light[0].size[0],.16);
 assert.equal(parts.light[0].position[2],-5.065);
 console.log(JSON.stringify({mode:lite?'lite':'standard',instances:count(parts),estimatedTriangles:count(parts)*12+96+14,drawCalls:11}));
}
assert(count(towerParts(true))<count(towerParts(false)));
console.log('PASS: approved envelope, nominal joint, protected strip and positive geometry sizes.');
