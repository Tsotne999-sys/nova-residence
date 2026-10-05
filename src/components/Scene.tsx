'use client';
import {Canvas,useFrame,useThree} from '@react-three/fiber';
import {useEffect,useLayoutEffect,useMemo,useRef,type RefObject} from 'react';
import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {blades,ring,towerParts,type Box,type MaterialKey} from '@/lib/tower';
import {surface} from '@/lib/surfaces';
export type Metrics={triangles:number;calls:number;geometries:number;textures:number;dpr:number;renderer:string};
export type Sample={frames:number;fps:number;p95:number;submit:number};
type Props={night:boolean;lite:boolean;sample:number;onReady:()=>void;onFail:()=>void;onMetrics:(v:Metrics)=>void;onSample:(s:Sample)=>void};
function shells(){
 const geometry=blades.map(b=>{const points=ring(b),verts:number[]=[];
  function tri(a:number[],c:number[],d:number[]){verts.push(...a,...c,...d)}
  points.forEach((a,i)=>{const c=points[(i+1)%8],p=[a[0],b.bottom,a[1]],q=[c[0],b.bottom,c[1]],r=[c[0],b.glassTop,c[1]],s=[a[0],b.glassTop,a[1]];tri(p,r,q);tri(p,s,r);tri([(b.left+b.right)/2,b.glassTop,(b.front+b.back)/2],r,s)});
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));g.computeVertexNormals();return g;
 });const merged=mergeGeometries(geometry);geometry.forEach(g=>g.dispose());return merged;
}
function Instances({parts,geometry,material}:{parts:Box[];geometry:THREE.BufferGeometry;material:THREE.Material}){
 const ref=useRef<THREE.InstancedMesh>(null);
 useLayoutEffect(()=>{const temp=new THREE.Object3D();parts.forEach((p,i)=>{temp.position.set(...p.position);temp.scale.set(...p.size);temp.rotation.set(0,p.rotation||0,0);temp.updateMatrix();ref.current!.setMatrixAt(i,temp.matrix);ref.current!.setColorAt(i,new THREE.Color(p.color||'#ffffff'))});ref.current!.instanceMatrix.needsUpdate=true;ref.current!.instanceColor!.needsUpdate=true;ref.current!.computeBoundingSphere()},[parts]);
 return <instancedMesh ref={ref} args={[geometry,material,parts.length]} dispose={null}/>;
}
export type Band={low:number;high:number;strength:number};
export function Tower({night,lite,band}:{night:boolean;lite:boolean;band?:RefObject<Band>}){
 const bandUniforms=useMemo(()=>({novaLow:{value:0},novaHigh:{value:0},novaStrength:{value:0}}),[]);
 const parts=useMemo(()=>towerParts(lite),[lite]);
 const assets=useMemo(()=>({box:new THREE.BoxGeometry(1,1,1),shell:shells(),materials:{
  graphite:surface(new THREE.MeshStandardMaterial({color:'#354047',metalness:.72,roughness:.32}),'metal'),
  silver:surface(new THREE.MeshStandardMaterial({color:'#aab3b5',metalness:.88,roughness:.25}),'metal'),
  stone:surface(new THREE.MeshStandardMaterial({color:'#222827',metalness:.02,roughness:.84,envMapIntensity:.25}),'stone'),
  glass:surface(new THREE.MeshStandardMaterial({color:'#425862',metalness:.7,roughness:.23,envMapIntensity:1.15}),'glass'),
  reveal:new THREE.MeshStandardMaterial({color:'#1b232a',metalness:.2,roughness:.72}),
  light:new THREE.MeshStandardMaterial({color:'#b5c7cd',emissive:'#b5d0df',emissiveIntensity:0,roughness:.7}),
  windows:new THREE.MeshStandardMaterial({color:'#ffffff',emissive:'#ffffff',emissiveIntensity:0,roughness:.8}),
  wash:new THREE.MeshStandardMaterial({color:'#263340',emissive:'#668397',emissiveIntensity:0,roughness:.9})
 } as Record<MaterialKey,THREE.MeshStandardMaterial>}),[]);
 useLayoutEffect(()=>{for(const key of ['graphite','silver','glass'] as const){const material=assets.materials[key];surface(material,key==='glass'?'glass':'metal');const original=material.onBeforeCompile;material.onBeforeCompile=(shader,renderer)=>{
  original(shader,renderer);
  Object.assign(shader.uniforms,bandUniforms);
  shader.vertexShader='varying float novaY;\n'+shader.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
   vec4 novaPosition=vec4(transformed,1.);
   #ifdef USE_INSTANCING
   novaPosition=instanceMatrix*novaPosition;
   #endif
   novaY=(modelMatrix*novaPosition).y;`);
  shader.fragmentShader='varying float novaY;uniform float novaLow;uniform float novaHigh;uniform float novaStrength;\n'+shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
   float novaMask=smoothstep(novaLow-1.,novaLow+1.,novaY)*(1.-smoothstep(novaHigh-1.,novaHigh+1.,novaY));
   diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.42,.49,.53),novaMask*novaStrength*.085);`);
 };material.customProgramCacheKey=()=> 'nova-band-surface-'+key;material.needsUpdate=true}
 assets.materials.windows.onBeforeCompile=shader=>{shader.fragmentShader=shader.fragmentShader.replace('#include <emissivemap_fragment>',`#include <emissivemap_fragment>
 #ifdef USE_COLOR
 totalEmissiveRadiance*=vColor;
 #endif`)};assets.materials.windows.customProgramCacheKey=()=> 'nova-occupied';assets.materials.windows.needsUpdate=true;
 },[assets,band,bandUniforms]);
 useFrame(()=>{if(band){bandUniforms.novaLow.value=band.current.low;bandUniforms.novaHigh.value=band.current.high;bandUniforms.novaStrength.value=band.current.strength}},-1);
 useLayoutEffect(()=>{
  const m=assets.materials;
  // Separate the frame from the glazing through reflectance, not emission.
  m.graphite.color.set(night?'#354047':'#3b4449');
  m.glass.color.set(night?'#425862':'#445961');
  m.glass.envMapIntensity=night?1.15:1.0;
  m.light.emissiveIntensity=night?1.5:0;
  m.windows.emissiveIntensity=night?.75:.07;
  m.windows.color.set(night?'#a89a82':'#586365');
  m.wash.emissiveIntensity=night?.23:0;
 },[night,assets]);
 useEffect(()=>()=>{assets.box.dispose();assets.shell.dispose();Object.values(assets.materials).forEach(m=>m.dispose())},[assets]);
 return <group scale={[-1,1,1]}><mesh geometry={assets.shell} material={assets.materials.glass} dispose={null}/>{Object.entries(parts).map(([key,list])=><Instances key={key} parts={list} geometry={assets.box} material={assets.materials[key as MaterialKey]}/>)}</group>;
}
function Sea({night,atmosphere}:{night:boolean;atmosphere?:RefObject<number>}){
 const uniforms=useMemo(()=>({nearColor:{value:new THREE.Color()},farColor:{value:new THREE.Color()}}),[]);
 const colors=useMemo(()=>({near:new THREE.Color('#172934'),far:new THREE.Color('#101923'),openNear:new THREE.Color('#354a54'),openFar:new THREE.Color('#283943')}),[]);
 useLayoutEffect(()=>{uniforms.nearColor.value.set(night?'#172934':'#607e8d');uniforms.farColor.value.set(night?'#101923':'#899ba7')},[night,uniforms]);
 useFrame(()=>{if(atmosphere){uniforms.nearColor.value.copy(colors.near).lerp(colors.openNear,atmosphere.current);uniforms.farColor.value.copy(colors.far).lerp(colors.openFar,atmosphere.current)}},-1);
 return <mesh rotation={[-Math.PI/2,0,0]} position={[0,-.12,0]}><planeGeometry args={[6000,6000]}/><shaderMaterial toneMapped={false} uniforms={uniforms} vertexShader={`varying vec3 world; void main(){vec4 p=modelMatrix*vec4(position,1.);world=p.xyz;gl_Position=projectionMatrix*viewMatrix*p;}`} fragmentShader={`uniform vec3 nearColor;uniform vec3 farColor;varying vec3 world;void main(){float d=distance(world.xz,cameraPosition.xz);float ripple=sin(world.z*2.1+sin(world.x*.32))*sin(world.z*.57+world.x*.11);vec3 c=mix(nearColor,farColor,smoothstep(120.,1600.,d));c+=ripple*.009*(1.-smoothstep(80.,600.,d));gl_FragColor=vec4(c,1.);
 #include <tonemapping_fragment>
 #include <colorspace_fragment>
 }`}/></mesh>;
}
export function Environment({night,reveal,atmosphere}:{night:boolean;reveal?:RefObject<number>;atmosphere?:RefObject<number>}){
 const {gl,scene,invalidate}=useThree();
 const sky=useMemo(()=>({night:new THREE.Color('#101923'),open:new THREE.Color('#283943')}),[]);
 useFrame(()=>{if(atmosphere&&scene.background instanceof THREE.Color)scene.background.copy(sky.night).lerp(sky.open,atmosphere.current)},-1);
 const keyLight=useRef<THREE.DirectionalLight>(null),rimLight=useRef<THREE.DirectionalLight>(null),fillLight=useRef<THREE.HemisphereLight>(null);
 useEffect(()=>{const generator=new THREE.PMREMGenerator(gl),room=new RoomEnvironment();const target=generator.fromScene(room,.04,.1,100);scene.environment=target.texture;room.dispose();generator.dispose();invalidate();return()=>{scene.environment=null;target.dispose()}},[gl,scene,invalidate]);
 useLayoutEffect(()=>{scene.background=new THREE.Color(night?'#101923':'#899ba7');scene.environmentIntensity=night?.85:.6;invalidate()},[night,scene,invalidate]);
 useFrame(()=>{if(reveal){const r=reveal.current;scene.environmentIntensity=.85*(.48+.52*r);if(keyLight.current)keyLight.current.intensity=3.4*(.28+.72*r);if(rimLight.current)rimLight.current.intensity=1.4*(.42+.58*r);if(fillLight.current)fillLight.current.intensity=.95*(.7+.3*r)}},-1);
 return <><hemisphereLight ref={fillLight} args={[night?'#bac7d3':'#edf1f4',night?'#0e1418':'#3b454d',night?.95:1.05]}/><directionalLight ref={keyLight} position={[-120,120,-65]} intensity={night?3.4:3.8} color={night?'#e1e5e8':'#eee7dd'}/><directionalLight ref={rimLight} position={[95,115,35]} intensity={night?1.4:1.0} color="#b4c3cf"/>
 <Sea night={night} atmosphere={atmosphere}/>
 <mesh position={[0,-.05,0]}><boxGeometry args={[68,.1,56]}/><meshStandardMaterial color={night?'#192027':'#697174'} roughness={.97}/></mesh></>;
}
function Director({sample,onReady,onFail,onMetrics,onSample}:Props){
 const {gl,scene,camera,size,invalidate}=useThree();
 const target=useRef({x:0,y:0}),offset=useRef({x:0,y:0}),ready=useRef(false),measured=useRef(false);
 const benchmark=useRef<{start:number;last:number;intervals:number[];cost:number[]}|null>(null);
 const allow=useRef(false);
 useEffect(()=>{const query=matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');const change=()=>{allow.current=query.matches;target.current={x:0,y:0};invalidate()};change();query.addEventListener('change',change);
  const move=(e:PointerEvent)=>{if(!allow.current||e.pointerType==='touch')return;target.current={x:(e.clientX/innerWidth-.5)*2,y:(e.clientY/innerHeight-.5)*2};invalidate()};
  const leave=()=>{target.current={x:0,y:0};invalidate()};
  const visibility=()=>{if(document.hidden){benchmark.current=null;leave()}else invalidate()};
  window.addEventListener('pointermove',move);document.addEventListener('pointerleave',leave);document.addEventListener('visibilitychange',visibility);
  const lost=(e:Event)=>{e.preventDefault();onFail()},testLoss=()=>gl.forceContextLoss();gl.domElement.addEventListener('webglcontextlost',lost);window.addEventListener('nova:test-context-loss',testLoss);
  return()=>{query.removeEventListener('change',change);window.removeEventListener('pointermove',move);document.removeEventListener('pointerleave',leave);document.removeEventListener('visibilitychange',visibility);gl.domElement.removeEventListener('webglcontextlost',lost);window.removeEventListener('nova:test-context-loss',testLoss)};
 },[gl,invalidate,onFail]);
 useEffect(()=>{if(sample>0){benchmark.current={start:performance.now(),last:0,intervals:[],cost:[]};invalidate()}},[sample,invalidate]);
 useEffect(()=>{measured.current=false;invalidate()},[size,invalidate]);
 useFrame((_,delta)=>{
  if(document.hidden)return;
  const ease=1-Math.exp(-Math.min(delta,.05)*9),o=offset.current,t=target.current;
  o.x=allow.current?THREE.MathUtils.lerp(o.x,t.x,ease):0;o.y=allow.current?THREE.MathUtils.lerp(o.y,t.y,ease):0;
  const portrait=size.width<760||size.width/size.height<.85,baseYaw=9*Math.PI/180,yaw=baseYaw+o.x*1.25*Math.PI/180,radius=portrait?520:325;
  camera.position.set(Math.sin(yaw)*radius,102+o.y*4, -Math.cos(yaw)*radius);camera.lookAt(portrait?0:38,portrait?62:78,0);
  const p=camera as THREE.PerspectiveCamera;p.fov=portrait?34:32;p.updateProjectionMatrix();
  const before=performance.now();gl.render(scene,camera);const after=performance.now();
  gl.domElement.dataset.renderedFrames=String(gl.info.render.frame);gl.domElement.dataset.pointerMotion=String(allow.current);
  if(!ready.current){ready.current=true;onReady()}
  if(!measured.current){measured.current=true;const context=gl.getContext(),debug=context.getExtension('WEBGL_debug_renderer_info');onMetrics({triangles:gl.info.render.triangles,calls:gl.info.render.calls,geometries:gl.info.memory.geometries,textures:gl.info.memory.textures,dpr:gl.getPixelRatio(),renderer:debug?String(context.getParameter(debug.UNMASKED_RENDERER_WEBGL)):'Renderer identity unavailable'})}
  const b=benchmark.current;if(b){if(b.last)b.intervals.push(after-b.last);b.last=after;b.cost.push(after-before);if(after-b.start<5000)invalidate();else{const sorted=[...b.intervals].sort((a,c)=>a-c);onSample({frames:b.intervals.length,fps:1000/(b.intervals.reduce((a,c)=>a+c,0)/b.intervals.length),p95:sorted[Math.floor(sorted.length*.95)]||0,submit:b.cost.reduce((a,c)=>a+c,0)/b.cost.length});benchmark.current=null}}
  if(Math.abs(o.x-t.x)+Math.abs(o.y-t.y)>.001&&allow.current)invalidate();
 },1);
 return null;
}
export default function Scene(props:Props){return <Canvas frameloop="demand" dpr={props.lite?1:1.25} camera={{near:.5,far:4000,fov:32}} gl={{antialias:!props.lite,alpha:false,powerPreference:'low-power'}} fallback={null}><Environment night={props.night}/><Tower night={props.night} lite={props.lite}/><Director {...props}/></Canvas>}

