import assert from 'node:assert/strict';
import {shotAt} from '../src/lib/narrative.ts';
import {registerHooks} from 'node:module';
registerHooks({resolve(specifier,context,nextResolve){return nextResolve(specifier==='./narrative'?'./narrative.ts':specifier,context)}});
const {journeyAt,timelineAt,residenceExperience}=await import('../src/lib/journey.ts');
for(const portrait of [false,true]){
 for(let i=0;i<=100;i++){const opening=shotAt(i/100,portrait),actual=journeyAt(i/100,portrait,2);for(const key of Object.keys(opening))assert.equal(actual[key],opening[key],'approved opening changed')}
 for(const selection of [0,1,2]){
  let prev=journeyAt(0,portrait,selection);
  for(let i=1;i<=6000;i++){const shot=journeyAt(i/1000,portrait,selection);for(const key of Object.keys(shot)){assert(Number.isFinite(shot[key]));assert(Math.abs(shot[key]-prev[key])<4,'discontinuous state '+key)}prev=shot}
  assert.equal(journeyAt(2,portrait,selection).band,1);
  assert.equal(journeyAt(3.3,portrait,selection).band,0);
  assert.equal(journeyAt(6,portrait,selection).atmosphere,0);
 }
 assert.deepEqual(journeyAt(3.2,portrait),journeyAt(3.6,portrait),'interior rest must remain still');
 assert.deepEqual(journeyAt(4,portrait),journeyAt(4.6,portrait),'horizon rest must remain still');
}
const anchors=[0,2200,3200,4800,6500,8200,9600];
assert.equal(timelineAt(2200,anchors),1);assert.equal(timelineAt(3200,anchors),2);assert.equal(timelineAt(100000,anchors),6);
for(const y of [9600,3200,0,6500,2200])assert(Number.isFinite(timelineAt(y,anchors)));
console.log('PASS: locked opening, all residence states, continuous extended path, editorial hold and anchor navigation.');

for(const portrait of [false,true]){
 for(let t=2.6;t<3.5;t+=.001){
  const {shot,inside}=residenceExperience(t,portrait);assert(inside);
  const [x,y,z]=shot.position;
  assert(x>.2&&x<1,'camera leaves clear circulation aisle');
  assert(y>1.5&&y<1.8,'eye height outside safe range');
  assert(z>=-7.61&&z<=6.11,'camera crossed glazing or entrance envelope');
 }
 for(const t of [2.5999,2.6,2.6001])assert.equal(residenceExperience(t,portrait).occlusion,1,'scene cut must be fully hidden');
 assert.equal(residenceExperience(2.56,portrait).occlusion,0);
 assert.equal(residenceExperience(2.66,portrait).occlusion,0);
}
console.log('PASS: hidden bidirectional cut, clear interior circulation aisle and glazing clearance.');