// Offline fallback derived from the same approved tower definition. No browser,
// GPU, remote imagery or generated architectural variations are required.
import {mkdirSync,writeFileSync} from 'node:fs';
import * as T from 'three';
import {blades,ring,towerParts} from '../src/lib/tower.ts';
const colors={graphite:[98,107,114],silver:[192,195,196],stone:[46,49,49],glass:[37,46,52],reveal:[27,35,42],light:[171,202,218],windows:[140,143,131],wash:[49,65,78]};
const shapes=[];
const cube=new T.BoxGeometry().toNonIndexed();
for(const [material,parts] of Object.entries(towerParts(true)))for(const p of parts){const matrix=new T.Matrix4().compose(new T.Vector3(...p.position),new T.Quaternion().setFromEuler(new T.Euler(0,p.rotation||0,0)),new T.Vector3(...p.size));const attr=cube.attributes.position;for(let i=0;i<attr.count;i+=3)shapes.push({material,v:[0,1,2].map(j=>new T.Vector3().fromBufferAttribute(attr,i+j).applyMatrix4(matrix))})}
for(const b of blades){const points=ring(b);for(let i=0;i<8;i++){const a=points[i],c=points[(i+1)%8],p=new T.Vector3(a[0],b.bottom,a[1]),q=new T.Vector3(c[0],b.bottom,c[1]),r=new T.Vector3(c[0],b.glassTop,c[1]),s=new T.Vector3(a[0],b.glassTop,a[1]);shapes.push({material:'glass',v:[p,r,q]},{material:'glass',v:[p,s,r]})}}
mkdirSync(new URL('../public/',import.meta.url),{recursive:true});
for(const portrait of [false,true])for(const night of [false,true]){
 const w=portrait?780:1600,h=portrait?1400:1000,radius=portrait?520:325,yaw=9*Math.PI/180;
 const camera=new T.PerspectiveCamera(portrait?34:32,w/h,.5,4000);camera.position.set(Math.sin(yaw)*radius,102,-Math.cos(yaw)*radius);camera.lookAt(portrait?0:38,portrait?62:78,0);camera.updateMatrixWorld();
 const polygons=[];
 for(const shape of shapes){const vertices=shape.v.map(v=>new T.Vector3(-v.x,v.y,v.z)).reverse();const [a,b,c]=vertices,n=new T.Vector3().subVectors(b,a).cross(new T.Vector3().subVectors(c,a)).normalize();if(n.dot(new T.Vector3().subVectors(camera.position,a))<=0)continue;
  const depth=vertices.reduce((s,v)=>s+v.clone().applyMatrix4(camera.matrixWorldInverse).z,0)/3;
  let rgb=colors[shape.material],shade=.55+.45*Math.max(0,n.dot(new T.Vector3(-1.2,1.2,-.65).normalize()));
  if(!night&&shape.material==='graphite')rgb=[88,97,105];
  if(!night&&shape.material==='glass')rgb=[53,66,75];
  if(night)shade*=.8;if(!night&&(shape.material==='windows'||shape.material==='light'))rgb=colors.glass;
  if(night&&shape.material==='light')shade=1.0;
  const fill='#'+rgb.map(v=>Math.min(255,Math.round(v*shade)).toString(16).padStart(2,'0')).join('');
  const points=vertices.map(v=>{const p=v.clone().project(camera);return `${((p.x+1)*w/2).toFixed(1)},${((1-p.y)*h/2).toFixed(1)}`}).join(' ');
  polygons.push({depth,tag:`<polygon points="${points}" fill="${fill}"/>`});
 }
 polygons.sort((a,b)=>a.depth-b.depth);
 const bg=night?'#101923':'#899ba7',sea=night?'#11212c':'#627e8d';
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" role="img" aria-label="Split blade architectural study"><rect width="${w}" height="${h}" fill="${bg}"/><path d="M0 ${h*.38}H${w}V${h}H0Z" fill="${sea}"/>${polygons.map(p=>p.tag).join('')}</svg>`;
 const name=`poster-${night?'night':'day'}${portrait?'-portrait':''}.svg`;writeFileSync(new URL('../public/'+name,import.meta.url),svg);console.log(name,Buffer.byteLength(svg),'bytes');
}
