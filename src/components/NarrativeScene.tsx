'use client';
import {Canvas,useFrame,useThree} from '@react-three/fiber';
import {useEffect,useRef} from 'react';
import * as THREE from 'three';
import {Tower,Environment,type Metrics,type Sample,type Band} from './Scene';
import {type NarrativeBus} from '@/lib/narrative';
import {journeyAt,residences,residenceExperience} from '@/lib/journey';
import ResidenceInterior from './ResidenceInterior';
type Props={bus:NarrativeBus;lite:boolean;onReady:()=>void;onFail:()=>void;onMetrics:(m:Metrics)=>void;onSample:(s:Sample)=>void};
function Director({bus,lite,onReady,onFail,onMetrics,onSample,reveal,atmosphere,band,exterior,interior,veil}:Props&{reveal:React.RefObject<number>;atmosphere:React.RefObject<number>;band:React.RefObject<Band>;exterior:React.RefObject<THREE.Group|null>;interior:React.RefObject<THREE.Group|null>;veil:React.RefObject<THREE.MeshBasicMaterial|null>}){
 const {gl,scene,camera,size,invalidate}=useThree();
 const progress=useRef(bus.journey),selection=useRef(bus.selection),target=useRef({x:0,y:0}),offset=useRef({x:0,y:0}),allowed=useRef(false),ready=useRef(false),counted=useRef(false);
 const sample=useRef<{start:number;last:number;times:number[];costs:number[]}|null>(null);
 useEffect(()=>{
  const media=matchMedia('(hover:hover) and (pointer:fine) and (prefers-reduced-motion:no-preference)');
  const update=()=>{allowed.current=media.matches&&!lite&&!bus.reduced&&!bus.capture&&!bus.covered;invalidate()};
  const move=(e:PointerEvent)=>{if(!allowed.current||e.pointerType==='touch')return;target.current={x:Math.max(-1,Math.min(1,e.clientX/innerWidth*2-1)),y:Math.max(-1,Math.min(1,e.clientY/innerHeight*2-1))};invalidate()};
  const leave=()=>{target.current={x:0,y:0};invalidate()};
  const loss=(e:Event)=>{e.preventDefault();onFail()};
  const forceLoss=()=>gl.forceContextLoss();
  const startSample=()=>{sample.current={start:performance.now(),last:0,times:[],costs:[]};invalidate()};
  const visibility=()=>{if(document.hidden){sample.current=null;target.current={x:0,y:0}}else invalidate()};
  update();bus.listeners.add(update);media.addEventListener('change',update);window.addEventListener('pointermove',move);document.addEventListener('pointerleave',leave);document.addEventListener('visibilitychange',visibility);
  gl.domElement.addEventListener('webglcontextlost',loss);window.addEventListener('nova:test-context-loss',forceLoss);window.addEventListener('nova:sample',startSample);
  return()=>{bus.listeners.delete(update);media.removeEventListener('change',update);window.removeEventListener('pointermove',move);document.removeEventListener('pointerleave',leave);document.removeEventListener('visibilitychange',visibility);gl.domElement.removeEventListener('webglcontextlost',loss);window.removeEventListener('nova:test-context-loss',forceLoss);window.removeEventListener('nova:sample',startSample)};
 },[bus,gl,invalidate,lite,onFail]);
 useEffect(()=>{counted.current=false;invalidate()},[size,invalidate]);
 // Sole camera writer: authored scroll state, then residence focus, then a bounded offset.
 useFrame((_,delta)=>{
  const difference=bus.journey-progress.current;
  if(bus.capture||bus.reduced||Math.abs(difference)>.18)progress.current=bus.journey;
  else progress.current=THREE.MathUtils.damp(progress.current,bus.journey,18,Math.min(delta,.05));
  if(Math.abs(bus.journey-progress.current)<.0001)progress.current=bus.journey;
  const selectionDifference=bus.selection-selection.current;
  selection.current=bus.capture||bus.reduced?bus.selection:THREE.MathUtils.damp(selection.current,bus.selection,7,Math.min(delta,.05));
  if(Math.abs(selectionDifference)<.001)selection.current=bus.selection;
  const portrait=size.width<760||size.width/size.height<.85,shot=journeyAt(progress.current,portrait,selection.current);
  reveal.current=shot.reveal;atmosphere.current=shot.atmosphere;
  const index=Math.floor(selection.current),next=Math.min(2,index+1),fraction=selection.current-index;
  band.current={low:THREE.MathUtils.lerp(residences[index].band[0],residences[next].band[0],fraction),high:THREE.MathUtils.lerp(residences[index].band[1],residences[next].band[1],fraction),strength:shot.band};
  const o=offset.current,t=target.current;
  o.x=allowed.current?THREE.MathUtils.damp(o.x,t.x,9,Math.min(delta,.05)):0;
  o.y=allowed.current?THREE.MathUtils.damp(o.y,t.y,9,Math.min(delta,.05)):0;
  const experience=residenceExperience(progress.current,portrait);
  // Interior fills every pixel: retain MSAA, remove supersampling on this scene only.
  const pixelRatio=lite||experience.inside?1:1.25;if(gl.getPixelRatio()!==pixelRatio){gl.setPixelRatio(pixelRatio);counted.current=false;}
  const pointerScale=progress.current>2.12&&progress.current<3.5?0:shot.band>.5?.15:1,yaw=(shot.yaw+o.x*pointerScale)*Math.PI/180;
  camera.position.set(Math.sin(yaw)*shot.radius,shot.height+o.y*2*pointerScale,-Math.cos(yaw)*shot.radius);
  camera.lookAt(shot.targetX,shot.targetY,0);
  const p=camera as THREE.PerspectiveCamera;p.fov=shot.fov;p.near=experience.inside?.08:.5;
  if(experience.inside){camera.position.set(...experience.shot.position);camera.lookAt(...experience.shot.target);p.fov=experience.shot.fov}
  p.updateProjectionMatrix();
  if(exterior.current)exterior.current.visible=!experience.inside;if(interior.current)interior.current.visible=experience.inside;if(veil.current){veil.current.opacity=experience.occlusion;veil.current.visible=experience.occlusion>.001}
  const region=experience.inside?"interior":"exterior";if(gl.domElement.dataset.region!==region)counted.current=false;gl.domElement.dataset.region=region;gl.domElement.dataset.occlusion=experience.occlusion.toFixed(3);
  gl.domElement.dataset.progress=Math.min(1,progress.current).toFixed(4);gl.domElement.dataset.journey=progress.current.toFixed(4);gl.domElement.dataset.residence=String(bus.selection);gl.domElement.dataset.pointerMotion=String(allowed.current&&pointerScale>0);gl.domElement.dataset.shot=JSON.stringify(shot);
  if(Math.abs(selectionDifference)>.001||Math.abs(difference)>.0001||(allowed.current&&Math.abs(o.x-t.x)+Math.abs(o.y-t.y)>.001))invalidate();
 },-2);
 useFrame(()=>{
  if(document.hidden||(bus.covered&&ready.current&&!sample.current))return;
  if(interior.current?.visible){if(scene.background instanceof THREE.Color)scene.background.set("#26343b");scene.environmentIntensity=.45}
  const start=performance.now();gl.render(scene,camera);const now=performance.now();
  gl.domElement.dataset.renderedFrames=String(gl.info.render.frame);gl.domElement.dataset.triangles=String(gl.info.render.triangles);gl.domElement.dataset.calls=String(gl.info.render.calls);
  if(!ready.current){ready.current=true;onReady()}
  if(!counted.current){counted.current=true;const context=gl.getContext(),debug=context.getExtension('WEBGL_debug_renderer_info');onMetrics({triangles:gl.info.render.triangles,calls:gl.info.render.calls,geometries:gl.info.memory.geometries,textures:gl.info.memory.textures,dpr:gl.getPixelRatio(),renderer:debug?String(context.getParameter(debug.UNMASKED_RENDERER_WEBGL)):'Unavailable'})}
  const s=sample.current;if(s){if(s.last)s.times.push(now-s.last);s.last=now;s.costs.push(now-start);if(now-s.start<5000)invalidate();else{const sorted=[...s.times].sort((a,b)=>a-b);onSample({frames:s.times.length,fps:1000/(s.times.reduce((a,b)=>a+b,0)/s.times.length),p95:sorted[Math.floor(sorted.length*.95)]||0,submit:s.costs.reduce((a,b)=>a+b,0)/s.costs.length});sample.current=null}}
 },1);
 return null;
}
export default function NarrativeScene(props:Props){
 const reveal=useRef(.24),atmosphere=useRef(0),band=useRef<Band>({low:0,high:0,strength:0});
 const exterior=useRef<THREE.Group>(null),interior=useRef<THREE.Group>(null),veil=useRef<THREE.MeshBasicMaterial>(null);
 return <Canvas frameloop="demand" dpr={props.lite?1:1.25} camera={{near:.1,far:4000,fov:32}} gl={{antialias:!props.lite,alpha:false,powerPreference:'low-power'}} fallback={null}>
  <group ref={exterior}><Tower night lite={props.lite} band={band}/><Environment night reveal={reveal} atmosphere={atmosphere}/></group>
  <group ref={interior} visible={false}><ResidenceInterior lite={props.lite}/></group>
  <mesh frustumCulled={false} renderOrder={10000}><planeGeometry args={[2,2]}/><meshBasicMaterial ref={veil} color="#070b0d" transparent opacity={0} depthTest={false} depthWrite={false} toneMapped={false} onBeforeCompile={shader=>{shader.vertexShader='void main(){gl_Position=vec4(position.xy,0.,1.);}'}}/></mesh>
  <Director {...props} reveal={reveal} atmosphere={atmosphere} band={band} exterior={exterior} interior={interior} veil={veil}/>
 </Canvas>;
}
