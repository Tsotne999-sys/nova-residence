'use client';
import {useEffect,useState} from 'react';
import NarrativeScene from './NarrativeScene';
import {createNarrativeBus} from '@/lib/narrative';
const noop=()=>{};
export default function NarrativeCapture(){
 const [bus]=useState(createNarrativeBus),[configured,setConfigured]=useState(false),[lite,setLite]=useState(false),[ready,setReady]=useState(false);
 useEffect(()=>{bus.capture=true;const params=new URLSearchParams(location.search),shot=Number(params.get('shot')||0),portrait=innerWidth<760||innerWidth/innerHeight<.85,scene=params.get('scene');
 bus.setProgress([0,portrait?.62:.45,1][shot]??0);
 if(scene?.startsWith('residence-')){bus.journey=2;bus.selection=['residence-residence','residence-sky','residence-penthouse'].indexOf(scene)}
 if(scene==='horizon')bus.journey=4;if(scene==='detail')bus.journey=2.35;if(scene==='finale')bus.journey=6;
 if(scene==='entrance')bus.journey=2.52;if(scene==='interior')bus.journey=2.75;if(scene==='window')bus.journey=2.93;
 if(params.has('time'))bus.journey=Number(params.get('time'));
 setLite(innerWidth<760);setConfigured(true)},[bus]);
 return <div data-capture-ready={ready} style={{position:'fixed',inset:0}}>{configured&&<NarrativeScene bus={bus} lite={lite} onReady={()=>setReady(true)} onFail={noop} onMetrics={noop} onSample={noop}/>}</div>;
}
