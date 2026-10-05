'use client';
import dynamic from 'next/dynamic';
import {Component,useCallback,useEffect,useRef,useState,type ReactNode,type MouseEvent} from 'react';
import {gsap} from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import {createNarrativeBus} from '@/lib/narrative';
import type {Metrics,Sample} from './Scene';
import './narrative.css';
import './journey.css';
import Poster from './Poster';
import JourneyChapters from './JourneyChapters';
import {timelineAt,residences} from '@/lib/journey';
const Scene=dynamic(()=>import('./NarrativeScene'),{ssr:false,loading:()=>null});
const chapters=['arrival','emergence','ascent','residences','shared-spaces','horizon','batumi','finale'] as const;
const chapterLabels=['Arrival','Emergence','Ascent','Residences','Shared spaces','Horizon','Batumi','Finale'];
class SceneBoundary extends Component<{children:ReactNode;onFail:()=>void},{failed:boolean}>{state={failed:false};static getDerivedStateFromError(){return {failed:true}}componentDidCatch(){this.props.onFail()}render(){return this.state.failed?null:this.props.children}}
export default function Narrative(){
 const bus=useRef(createNarrativeBus()).current,root=useRef<HTMLElement>(null),indexMenu=useRef<HTMLDetailsElement>(null),initialAnchor=useRef(false),previousStill=useRef(true);
 const [interactive,setInteractive]=useState(false),[ready,setReady]=useState(false),[failed,setFailed]=useState(false),[lite,setLite]=useState(false);
 const [systemReduced,setSystemReduced]=useState(false),[manualReduced,setManualReduced]=useState(false),[chapter,setChapter]=useState<string>('arrival'),[review,setReview]=useState(false);
 const [metrics,setMetrics]=useState<Metrics|null>(null),[result,setResult]=useState<Sample|null>(null),[sampling,setSampling]=useState(false);
 const [selection,setSelection]=useState(0),[initialized,setInitialized]=useState(false);
 const reduced=systemReduced||manualReduced,still=!interactive||reduced;
 const fail=useCallback(()=>{setFailed(true);setInteractive(false);setReady(false);setSampling(false)},[]);
 const sceneReady=useCallback(()=>setReady(true),[]),receiveMetrics=useCallback((m:Metrics)=>setMetrics(m),[]),receiveSample=useCallback((s:Sample)=>{setResult(s);setSampling(false)},[]);
 useEffect(()=>{
  const query=matchMedia('(prefers-reduced-motion:reduce)'),sync=()=>setSystemReduced(query.matches);sync();query.addEventListener('change',sync);
  setReview(new URLSearchParams(location.search).has('review'));
  setLite(matchMedia('(pointer:coarse),(max-width:760px)').matches);
  if(!query.matches){const canvas=document.createElement('canvas');try{const gl=canvas.getContext('webgl2',{failIfMajorPerformanceCaveat:true});if(gl){gl.getExtension('WEBGL_lose_context')?.loseContext();setInteractive(true)}else setFailed(true)}catch{setFailed(true)}}
  setInitialized(true);return()=>query.removeEventListener('change',sync);
 },[]);
 useEffect(()=>{bus.reduced=reduced;bus.notify();setReady(false);setSampling(false)},[bus,reduced]);
 useEffect(()=>{
  gsap.registerPlugin(ScrollTrigger);
  const ctx=gsap.context(()=>{
   let anchors:number[]=[];let vh=innerHeight;let portrait=false;
   const measure=()=>{portrait=innerWidth<760||innerWidth/innerHeight<.85;vh=root.current?.querySelector('.narrative-stage')?.clientHeight||innerHeight;const top=(id:string)=>document.getElementById(id)!.getBoundingClientRect().top+scrollY;anchors=[0,Math.min((portrait?3.2:4.3)*vh,top('residences')-.6*vh),top('residences'),top('shared-spaces'),top('horizon'),top('batumi'),top('finale')]};
   const update=(position:number)=>{if(!anchors.length)measure();const t=timelineAt(position,anchors),opening=Math.min(1,position/anchors[1]);bus.journey=t;bus.progress=opening;bus.covered=position>=anchors[3]&&position+vh<=anchors[4]-.4*vh;bus.notify();if(root.current){root.current.dataset.progress=opening.toFixed(4);root.current.dataset.journey=t.toFixed(4);root.current.style.setProperty('--residence-copy',String(Math.max(0,Math.min(1,(2.16-t)/.05))));root.current.style.setProperty('--horizon-copy',String(Math.max(0,Math.min(1,(t-3.88)/.12))));root.current.style.setProperty('--interior-light',String(Math.max(0,Math.min(1,(t-2.72)/.28))));root.current.style.setProperty('--finale-copy',String(Math.max(0,Math.min(1,(t-5.87)/.13))));root.current.style.setProperty('--opening-copy',String(Math.max(0,Math.min(1,(1.35-t)/.3))));for(const [name,start,end] of [['approach',2.20,2.36],['entrance',2.43,2.54],['interior',2.68,2.82],['window',2.88,2.965]] as const)root.current.style.setProperty('--'+name+'-copy',String(Math.max(0,Math.min(1,(t-start)/.03))*Math.max(0,Math.min(1,(end-t)/.025))))}
    setChapter(position<anchors[2]-.22*vh?(opening<(portrait?.4:.25)?'arrival':opening<(portrait?.75:.7)?'emergence':'ascent'):position<anchors[3]-.05*vh?'residences':position<anchors[4]-.15*vh?'shared-spaces':position<anchors[5]-.05*vh?'horizon':position<anchors[6]-.2*vh?'batumi':'finale');
   };
   const trigger=ScrollTrigger.create({trigger:root.current,start:'top top',end:'bottom bottom',invalidateOnRefresh:true,onUpdate:self=>update(self.scroll()-self.start),onRefresh:self=>{measure();update(self.scroll()-self.start)}});
   trigger.refresh();update(trigger.scroll()-trigger.start);
  },root);
  return()=>ctx.revert();
 },[bus]);
 useEffect(()=>{const id=chapter,changed=previousStill.current!==still;previousStill.current=still;const frame=requestAnimationFrame(()=>{if(changed&&initialAnchor.current)document.getElementById(id)?.scrollIntoView({block:'start',behavior:'instant'});ScrollTrigger.refresh()});return()=>cancelAnimationFrame(frame)},[still]);
 useEffect(()=>{if(still||ready)return;const timeout=setTimeout(fail,20000);return()=>clearTimeout(timeout)},[still,ready,fail]);
 useEffect(()=>{const visibility=()=>{if(document.hidden)setSampling(false)};document.addEventListener('visibilitychange',visibility);return()=>document.removeEventListener('visibilitychange',visibility)},[]);
 useEffect(()=>{if(!initialized||(!still&&!ready)||initialAnchor.current)return;initialAnchor.current=true;const id=decodeURIComponent(location.hash.slice(1));if(id)requestAnimationFrame(()=>{ScrollTrigger.refresh();document.getElementById(id)?.scrollIntoView({block:'start',behavior:'instant'})})},[initialized,still,ready]);
 const navigate=(e:MouseEvent<HTMLAnchorElement>,id:string)=>{if(e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;e.preventDefault();if(indexMenu.current)indexMenu.current.open=false;history.pushState(null,'','#'+id);requestAnimationFrame(()=>document.getElementById(id)?.scrollIntoView({block:'start',behavior:'instant'}))};
 const selectResidence=(index:number)=>{setSelection(index);bus.selection=index;bus.notify()};
 const poster=chapter==='residences'?`residence-${residences[selection].id}`:chapter==='shared-spaces'||chapter==='batumi'?'horizon':chapter;
 const lightSurface=chapter==='shared-spaces';
 const toggleInteractive=()=>{setReady(false);setFailed(false);setResult(null);setInteractive(!interactive)};
 return <main ref={root} className="narrative" data-static={still} data-reduced={reduced} data-ready={ready} data-chapter={chapter} data-surface={lightSurface?'light':'dark'}>
  <a className="narrative-skip" href="#ascent">Skip to ascent</a>
  <div className="narrative-stage" aria-hidden="true">
   <div className="narrative-poster"><Poster chapter={poster} priority/></div>
   {!still&&<div className={`narrative-live ${ready?'is-ready':''}`}><SceneBoundary key={String(lite)} onFail={fail}><Scene bus={bus} lite={lite} onReady={sceneReady} onFail={fail} onMetrics={receiveMetrics} onSample={receiveSample}/></SceneBoundary></div>}
  </div>
  <header className="narrative-header"><a className="narrative-brand" href="#arrival">NOVA<span>RESIDENCE / WORKING NAME</span></a><p>BATUMI, GEORGIA<span>FICTIONAL ARCHITECTURAL CONCEPT</span></p></header>
  <details className="chapter-nav" ref={indexMenu} onKeyDown={e=>{if(e.key==='Escape'&&indexMenu.current){indexMenu.current.open=false;indexMenu.current.querySelector('summary')?.focus()}}}><summary>Chapters</summary><nav aria-label="Story chapters">{chapters.map((id,i)=><a key={id} href={'#'+id} aria-current={chapter===id?'location':undefined} onClick={e=>navigate(e,id)}><span>{String(i+1).padStart(2,'0')}</span>{chapterLabels[i]}</a>)}</nav></details>
  <div className="narrative-flow">
   <section className="narrative-chapter" id="arrival" aria-labelledby="arrival-title"><div className="chapter-poster"><Poster chapter="arrival" priority/></div><div className="chapter-copy"><p className="chapter-kicker">01 / ARRIVAL</p><h1 id="arrival-title">Above the<br/><span>Black Sea.</span></h1><p className="chapter-note">An imagined address.<br/>A different perspective.</p><p className="scroll-cue">Scroll to discover <span aria-hidden="true">↓</span></p></div></section>
   <section className="narrative-chapter" id="emergence" aria-labelledby="emergence-title"><div className="chapter-poster"><Poster chapter="emergence"/></div><div className="chapter-copy"><p className="chapter-kicker">02 / EMERGENCE</p><h2 id="emergence-title">Light reveals<br/><span>the architecture.</span></h2><p className="chapter-note">Graphite. Glass. A quiet line of light.</p></div></section>
   <section className="narrative-chapter" id="ascent" aria-labelledby="ascent-title"><div className="chapter-poster"><Poster chapter="ascent"/></div><div className="chapter-copy"><p className="chapter-kicker">03 / ASCENT</p><h2 id="ascent-title">A quieter<br/><span>kind of height.</span></h2><p className="chapter-note">Two blades. One horizon.</p></div></section>
   <JourneyChapters selection={selection} onSelect={selectResidence}/>
  </div>
  <div className="narrative-footnote">Fictional concept. No property offering.</div>
  <details className="narrative-options"><summary>View options</summary><div className="options-content"><button onClick={toggleInteractive} disabled={reduced}>{interactive&&!reduced?'Use still images':'Use interactive view'}</button><button onClick={()=>{setLite(!lite);setReady(false);setResult(null)}}>{lite?'Quality: Lite':'Quality: Standard'}</button><label><input type="checkbox" checked={reduced} disabled={systemReduced} onChange={e=>setManualReduced(e.target.checked)}/> Reduce motion</label><p role="status">{reduced?'Stable frames · reduced motion':failed?'Still frames retained · 3D unavailable':still?'Architectural stills':ready?'Interactive view':'Preparing the interactive view…'}</p>{review&&<div className="narrative-review"><p>{metrics&&!still?`${metrics.triangles.toLocaleString()} triangles · ${metrics.calls} calls · ${metrics.dpr}× DPR`:'Static rendering'}</p><p>{metrics?.renderer}</p><button disabled={!ready||still||sampling} onClick={()=>{setSampling(true);setResult(null);window.dispatchEvent(new Event('nova:sample'))}}>{sampling?'Sampling…':'Sample rendering · 5 s'}</button><button disabled={!ready||still} onClick={()=>window.dispatchEvent(new Event('nova:test-context-loss'))}>Test WebGL fallback</button>{result&&<p role="status">{result.fps.toFixed(1)} fps · p95 {result.p95.toFixed(1)} ms<br/>CPU submission {result.submit.toFixed(2)} ms · {result.frames} intervals</p>}</div>}</div></details>
 </main>;
}
