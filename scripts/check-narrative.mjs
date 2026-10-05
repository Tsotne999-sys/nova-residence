import assert from 'node:assert/strict';
import {shotAt,desktopShots,portraitShots,createNarrativeBus} from '../src/lib/narrative.ts';
for(const portrait of [false,true]){
 const shots=portrait?portraitShots:desktopShots;
 assert.deepEqual(shotAt(-1,portrait),shots[0]);
 assert.deepEqual(shotAt(2,portrait),shots[2]);
 assert.deepEqual(shotAt(portrait?.62:.45,portrait),shots[1]);
 const path=Array.from({length:1001},(_,i)=>shotAt(i/1000,portrait));
 for(let i=1;i<path.length;i++){
  assert(path[i].height>=path[i-1].height,'camera should ascend monotonically');
  assert(path[i].radius<=path[i-1].radius,'camera should approach monotonically');
  for(const key of Object.keys(path[i])){assert(Number.isFinite(path[i][key]));assert(Math.abs(path[i][key]-path[i-1][key])<2,'no discontinuous shot jumps');}
 }
 const bus=createNarrativeBus();let notifications=0;bus.listeners.add(()=>notifications++);
 for(const p of [0,1,.45,.1,.9,0]){bus.setProgress(p);assert.deepEqual(shotAt(bus.progress,portrait),path[Math.round(p*1000)])}
 assert.equal(notifications,6);
}
console.log('PASS: authored holds, continuous paths, bounded states, reversible and fast-jump resolution.');
