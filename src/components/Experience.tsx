'use client';
import dynamic from 'next/dynamic';
import {Component,useCallback,useEffect,useState,type ReactNode} from 'react';
import type {Metrics,Sample} from './Scene';
const Scene=dynamic(()=>import('./Scene'),{ssr:false,loading:()=>null});
class SceneBoundary extends Component<{children:ReactNode;onFail:()=>void},{failed:boolean}>{
 state={failed:false};static getDerivedStateFromError(){return{failed:true}}componentDidCatch(){this.props.onFail()}render(){return this.state.failed?null:this.props.children}
}
export default function Experience(){
 const [night,setNight]=useState(true),[interactive,setInteractive]=useState(false),[ready,setReady]=useState(false),[failed,setFailed]=useState(false),[lite,setLite]=useState(false),[metrics,setMetrics]=useState<Metrics|null>(null),[sample,setSample]=useState(0),[result,setResult]=useState<Sample|null>(null),[sampling,setSampling]=useState(false);
 useEffect(()=>{setLite(matchMedia('(pointer: coarse), (max-width: 700px)').matches);const canvas=document.createElement('canvas');const gl=canvas.getContext('webgl2',{failIfMajorPerformanceCaveat:true});if(gl){gl.getExtension('WEBGL_lose_context')?.loseContext();setInteractive(true)}else setFailed(true)},[]);
 const onReady=useCallback(()=>setReady(true),[]),onFail=useCallback(()=>{setFailed(true);setInteractive(false);setReady(false);setSampling(false);setResult(null);setMetrics(null);setSample(0)},[]),onMetrics=useCallback((v:Metrics)=>setMetrics(v),[]),onSample=useCallback((v:Sample)=>{setResult(v);setSampling(false)},[]);
 useEffect(()=>{if(!interactive||ready)return;const timeout=setTimeout(()=>{setInteractive(false);setFailed(true)},20000);return()=>clearTimeout(timeout)},[interactive,ready]);
 useEffect(()=>{const visibility=()=>{if(document.hidden)setSampling(false)};document.addEventListener('visibilitychange',visibility);return()=>document.removeEventListener('visibilitychange',visibility)},[]);
 const changeMode=()=>{setReady(false);setMetrics(null);setSampling(false);setResult(null);setSample(0);setFailed(false);setInteractive(!interactive)};
 const changeQuality=()=>{setReady(false);setMetrics(null);setResult(null);setSampling(false);setSample(0);setLite(!lite)};
 return <main className={night?'experience night':'experience day'}>
  <div className="scene" aria-label="Refined Split blade tower in a fictional waterfront setting">
   <picture className="poster" aria-hidden="true"><source media="(max-width: 760px), (max-aspect-ratio: 85/100)" srcSet={`/poster-${night?'night':'day'}-portrait.svg`}/><img src={`/poster-${night?'night':'day'}.svg`} alt=""/></picture>
   {interactive&&<div className={`webgl ${ready?'ready':''}`}><SceneBoundary key={String(lite)} onFail={onFail}><Scene key={String(lite)} night={night} lite={lite} sample={sample} onReady={onReady} onFail={onFail} onMetrics={onMetrics} onSample={onSample}/></SceneBoundary></div>}
  </div>
  <header><div className="wordmark">NOVA<span>RESIDENCE / WORKING NAME</span></div><p>BATUMI, GEORGIA<br/><span>FICTIONAL ARCHITECTURAL CONCEPT</span></p></header>
  <div className="caption"><p className="eyebrow">02 / TECHNICAL FEASIBILITY</p><h1>Split blade.</h1><p className="sub">Material, light & camera study</p></div>
  <section className="console" aria-label="Prototype controls">
   <div className="controls"><fieldset><legend>Lighting</legend><button aria-pressed={!night} onClick={()=>{setNight(false);setResult(null)}}>Day</button><button aria-pressed={night} onClick={()=>{setNight(true);setResult(null)}}>Night</button></fieldset><button className="mode" aria-pressed={interactive} onClick={changeMode}>{interactive?'Interactive':'Static'}</button><button className="mode" aria-pressed={lite} onClick={changeQuality}>{lite?'Lite · 1×':'Standard · 1.25×'}</button></div>
   <p className="status" role="status">{failed?'Interactive view unavailable. Architectural still retained.':!interactive?'Static architectural study':!ready?'Preparing the interactive view…':'Live 3D · renders on demand'}</p>
   <details><summary>Rendering information</summary><p>{metrics&&ready?`${metrics.triangles.toLocaleString()} triangles · ${metrics.calls} draw calls · ${metrics.dpr}× DPR · ${metrics.textures} textures`: 'Metrics available in the interactive view.'}</p>{metrics&&ready&&<p className="renderer">{metrics.renderer}</p>}<button disabled={!ready||!interactive||sampling} onClick={()=>{setSampling(true);setResult(null);setSample(n=>n+1)}}>{sampling?'Sampling for 5 seconds…':'Sample active rendering · 5 s'}</button>{' '}<button disabled={!ready||!interactive||sampling} onClick={()=>window.dispatchEvent(new Event('nova:test-context-loss'))}>Test WebGL fallback</button>{result&&<p role="status">{result.fps.toFixed(1)} frames/s · p95 interval {result.p95.toFixed(1)} ms<br/>CPU render submission {result.submit.toFixed(2)} ms · {result.frames} intervals<br/><small>Short browser sample; not GPU time or a sustained device benchmark.</small></p>}</details>
  </section>
  <footer><span>PHASE 02 / PROTOTYPE ONLY</span><span>No real development or property offering.</span></footer>
 </main>
}
