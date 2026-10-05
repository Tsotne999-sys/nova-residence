'use client';
import {useEffect,useMemo} from 'react';
import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {surface} from '@/lib/surfaces';

/** One authored room. All solid parts merge by material; no runtime reflection/shadow passes. */
export default function ResidenceInterior({lite}:{lite:boolean}){
 const assets=useMemo(()=>{
  const materials={
   stone:surface(new THREE.MeshStandardMaterial({color:'#252b2d',roughness:.82,metalness:.03,envMapIntensity:.18}),'stone'),
   plaster:surface(new THREE.MeshStandardMaterial({color:'#727671',roughness:.95}),'plaster'),
   wood:surface(new THREE.MeshStandardMaterial({color:'#514132',roughness:.57,metalness:.03}),'wood'),
   metal:surface(new THREE.MeshStandardMaterial({color:'#8b9390',metalness:.85,roughness:.28}),'metal'),
   dark:new THREE.MeshStandardMaterial({color:'#171f22',metalness:.5,roughness:.37}),
   fabric:surface(new THREE.MeshStandardMaterial({color:'#bab7a9',roughness:.98}),'fabric'),
   leather:new THREE.MeshStandardMaterial({color:'#5a5145',roughness:.66}),
   rug:surface(new THREE.MeshStandardMaterial({color:'#6a6c64',roughness:1}),'fabric'),
   light:new THREE.MeshBasicMaterial({color:'#e5c49b',toneMapped:false}),
  };
  type Key=keyof typeof materials;
  const parts:Record<Key,THREE.BufferGeometry[]>={stone:[],plaster:[],wood:[],metal:[],dark:[],fabric:[],leather:[],rug:[],light:[]};
  function box(k:Key,x:number,y:number,z:number,w:number,h:number,d:number,rounded=false,rotation=0){
   const g=rounded?new RoundedBoxGeometry(w,h,d,lite?1:2,Math.min(.13,h*.25)):new THREE.BoxGeometry(w,h,d);
   g.rotateY(rotation);g.translate(x,y,z);parts[k].push(g);
  }
  function cylinder(k:Key,x:number,y:number,z:number,r:number,h:number){const g=new THREE.CylinderGeometry(r,r,h,lite?20:32);g.translate(x,y,z);parts[k].push(g)}
  // Envelope: side gallery / living room / full-width glazed horizon.
  box('stone',0,-.18,1,14,.35,19);
  box('plaster',0,3.92,1,14,.24,19);
  box('wood',-7,1.9,1,.25,3.8,19);
  box('plaster',7,1.9,1,.25,3.8,19);
  box('wood',-4.2,1.9,-6.8,5.6,3.8,.25);box('stone',4.2,1.9,-6.8,5.6,3.8,.25);
  // Portal reveals and recess: the arrival view is framed by actual geometry.
  for(const x of [-1.4,1.4]){box('dark',x,1.9,-6.8,.16,3.8,1.8);box('metal',x*.96,1.85,-5.92,.045,3.7,.06)}
  box('dark',0,3.65,-6.8,2.8,.3,1.8);
  // Walnut ribs, flush cabinets and a restrained back-lit stone niche.
  for(let z=-5.8;z<8.5;z+=.65)box('dark',-6.84,1.9,z,.035,3.8,.012);
  box('stone',-6.45,.58,2.7,.7,1.16,8.2);
  box('dark',-6.7,2.05,2.6,.1,1.4,7.3);
  box('wood',-6.47,1.42,2.6,.52,.09,7.4);
  box('light',-6.48,2.73,2.6,.045,.025,7.1);
  for(const z of [0,1.9,3.8,5.5]){cylinder('stone',-6.42,1.63,z,.13,.36);box('metal',-6.4,1.86,z,.08,.04,.1)}
  // Window frame is structural and the glazing is kept physically ahead of the camera.
  for(const x of [-6.8,-3.4,0,3.4,6.8]){box('dark',x,1.9,9.7,.12,3.8,.22);box('metal',x-.064,1.9,9.58,.024,3.8,.025)}
  box('dark',0,3.76,9.7,13.7,.12,.25);box('dark',0,.06,9.7,13.7,.12,.25);
  // Quiet perimeter coves, with no per-strip light objects.
  for(const x of [-6.7,6.7]){box('dark',x,3.72,1,.3,.2,17.2);box('light',x*.985,3.66,1,.035,.025,17.2)}
  box('light',0,3.65,-5.9,2.6,.025,.035);
  // Living group occupies the left side; the camera corridor x≈0.7 stays open.
  box('rug',-3.1,.012,3.6,5.7,.025,6.4);
  box('dark',-4.25,.23,2.1,2.3,.25,4.8,true);
  box('fabric',-4.25,.48,2.1,2.3,.42,4.8,true);
  box('fabric',-5.24,.95,2.1,.32,.9,4.8,true);
  for(const z of [.65,2.05,3.45])box('fabric',-4.1,.75,z,1.95,.22,1.3,true);
  for(const z of [-.15,4.35])box('fabric',-4.25,.91,z,2.28,.65,.3,true);
  for(const z of [.9,3.2])box('leather',-4.85,1.08,z,.36,.48,.68,true,.12);
  cylinder('stone',-2.45,.43,3.5,1.02,.2);cylinder('dark',-2.45,.22,3.5,.6,.38);
  cylinder('metal',-2.5,.55,3.5,.22,.04);box('wood',-2.05,.56,3.65,.34,.08,.48);
  // Two sculpturally restrained seats, kept away from the window approach.
  for(const z of [3.4,6.4]){
   box('dark',3.8,.22,z,1.35,.3,1.45,true,-.2);
   box('leather',3.8,.55,z,1.4,.4,1.5,true,-.2);
   box('leather',4.34,.98,z+.1,.32,.78,1.5,true,-.2);
  }
  cylinder('stone',3.8,.53,4.95,.42,.09);cylinder('metal',3.8,.28,4.95,.06,.48);
  // Delicate ceiling rail and a single architectural pendant above the seating.
  box('dark',-2.6,3.76,3.4,3.4,.05,.055);
  for(const x of [-3.8,-1.4])box('metal',x,3.15,3.4,.018,1.25,.018);
  box('metal',-2.6,2.54,3.4,2.7,.06,.12);box('light',-2.6,2.50,3.4,2.6,.015,.07);
  const meshes=Object.entries(parts).map(([key,list])=>{const geometry=mergeGeometries(list.map(g=>g.index?g.toNonIndexed():g));list.forEach(g=>g.dispose());return {key,geometry,material:materials[key as Key]}});
  // Shared 64px contact gradient: subtle static occlusion under furniture only.
  const canvas=document.createElement('canvas');canvas.width=canvas.height=64;const ctx=canvas.getContext('2d')!;
  const gradient=ctx.createRadialGradient(32,32,4,32,32,32);gradient.addColorStop(0,'rgba(0,0,0,.55)');gradient.addColorStop(.5,'rgba(0,0,0,.28)');gradient.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=gradient;ctx.fillRect(0,0,64,64);
    const shadow=new THREE.CanvasTexture(canvas);
  const shadowParts=[[-4.2,2.2,3.8,6],[-2.45,3.5,2.8,2.8],[3.8,3.4,2.2,2.4],[3.8,6.4,2.2,2.4]].map(([x,z,w,d])=>{const g=new THREE.PlaneGeometry(w,d);g.rotateX(-Math.PI/2);g.translate(x,.035,z);return g});
  const shadowGeometry=mergeGeometries(shadowParts);shadowParts.forEach(g=>g.dispose());
  return {meshes,materials,shadow,shadowGeometry};
 },[lite]);
 useEffect(()=>()=>{assets.meshes.forEach(m=>m.geometry.dispose());Object.values(assets.materials).forEach(m=>m.dispose());assets.shadow.dispose();assets.shadowGeometry.dispose()},[assets]);
 return <>
  <hemisphereLight args={['#cfdee3','#282723',.85]}/>
  <directionalLight position={[-2,6,14]} intensity={1.85} color="#d3e0e4"/>
  <directionalLight position={[-5,3,-3]} intensity={1.1} color="#e2bd8d"/>
  {assets.meshes.map(m=><mesh key={m.key} geometry={m.geometry} material={m.material} dispose={null}/>)}
  <mesh position={[0,1.9,9.72]}><boxGeometry args={[13.5,3.7,.015]}/><meshStandardMaterial color="#9db2b8" metalness={.65} roughness={.16} transparent opacity={.045} depthWrite={false}/></mesh>
  <mesh geometry={assets.shadowGeometry} dispose={null}><meshBasicMaterial map={assets.shadow} transparent depthWrite={false} toneMapped={false}/></mesh>
  <mesh position={[0,1,180]} rotation={[0,Math.PI,0]}><planeGeometry args={[700,180]}/><shaderMaterial depthWrite={false} vertexShader={`varying vec2 seaUV;void main(){seaUV=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`} fragmentShader={`varying vec2 seaUV;void main(){float y=seaUV.y;vec3 sky=mix(vec3(.39,.47,.49),vec3(.16,.23,.28),smoothstep(.5,1.,y));vec3 sea=mix(vec3(.13,.23,.28),vec3(.34,.43,.45),smoothstep(0.,.51,y));float ripple=sin(y*2500.+sin(seaUV.x*80.))*sin(y*831.-seaUV.x*29.);sea+=ripple*.008*(1.-smoothstep(.1,.51,y));vec3 c=mix(sea,sky,smoothstep(.505,.509,y));c+=vec3(.08,.08,.06)*exp(-abs(y-.512)*130.);gl_FragColor=vec4(c,1.);}`} toneMapped={false}/></mesh>
 </>;
}
