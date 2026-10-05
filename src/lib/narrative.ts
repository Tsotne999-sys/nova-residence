/** Authored shots, shared by the live director and render-capture route. */
export type Shot={radius:number;height:number;targetY:number;targetX:number;yaw:number;fov:number;reveal:number};
export const desktopShots:Shot[]=[
 {radius:365,height:66,targetY:78,targetX:38,yaw:17,fov:32,reveal:.24},
 {radius:310,height:99,targetY:83,targetX:32,yaw:8,fov:32,reveal:1},
 {radius:168,height:155,targetY:139,targetX:24,yaw:11,fov:32,reveal:1}
];
export const portraitShots:Shot[]=[
 {radius:565,height:78,targetY:114,targetX:0,yaw:15,fov:36,reveal:.3},
 {radius:520,height:100,targetY:111,targetX:0,yaw:8,fov:36,reveal:1},
 {radius:275,height:166,targetY:151,targetX:0,yaw:11,fov:36,reveal:1}
];
export const clamp=(n:number)=>Math.min(1,Math.max(0,n));
const ease=(n:number)=>{const t=clamp(n);return t*t*(3-2*t)};
export function shotAt(progress:number,portrait:boolean):Shot{
 const shots=portrait?portraitShots:desktopShots,p=clamp(progress);
 // Arrival hold 0–10%, reveal/arc 10–38%, reading hold 38–51%,
 // rise 51–90%, crown hold 90–100%. Reversible pure interpolation.
 // Portrait's shorter document reaches chapter two at 62.5% progress.
 const revealEnd=portrait?.55:.38,riseStart=portrait?.69:.51,riseEnd=portrait?.94:.90;
 const from=p<riseStart?shots[0]:shots[1],to=p<riseStart?shots[1]:shots[2];
 const t=p<riseStart?ease((p-.10)/(revealEnd-.10)):ease((p-riseStart)/(riseEnd-riseStart));
 return Object.fromEntries(Object.keys(from).map(k=>{const key=k as keyof Shot;return [key,from[key]+(to[key]-from[key])*t]})) as Shot;
}
export type NarrativeBus={progress:number;journey:number;selection:number;covered:boolean;reduced:boolean;capture:boolean;listeners:Set<()=>void>;setProgress:(p:number)=>void;notify:()=>void};
export function createNarrativeBus():NarrativeBus{
 const bus:NarrativeBus={progress:0,journey:0,selection:0,covered:false,reduced:false,capture:false,listeners:new Set(),setProgress(p){bus.progress=clamp(p);bus.journey=bus.progress;bus.notify()},notify(){bus.listeners.forEach(fn=>fn())}};
 return bus;
}
