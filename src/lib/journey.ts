import {clamp,desktopShots,portraitShots,shotAt,type Shot} from './narrative';
export type Residence='residence'|'sky'|'penthouse';
export const residences:{id:Residence;label:string;title:string;description:string;band:[number,number]}[]=[
 {id:'residence',label:'Residence',title:'The everyday, elevated.',description:'Recessed glazing holds the light. A measured structural rhythm gives the lower tower its calm.',band:[10,70]},
 {id:'sky',label:'Sky Residence',title:'A longer view.',description:'Higher in the composition, structure becomes a frame for sky and water. An imagined retreat above the everyday.',band:[72,124]},
 {id:'penthouse',label:'Penthouse',title:'The crown, considered.',description:'The uppermost concept belongs to the stepped crown, where the two volumes draw apart and the horizon opens.',band:[126,151]}
];
export type JourneyShot=Shot&{atmosphere:number;band:number};
const ease=(n:number)=>{const p=clamp(n);return p*p*(3-2*p)};
const mix=(a:JourneyShot,b:JourneyShot,t:number)=>Object.fromEntries(Object.keys(a).map(key=>[key,a[key as keyof JourneyShot]+(b[key as keyof JourneyShot]-a[key as keyof JourneyShot])*ease(t)])) as JourneyShot;
const wrap=(s:Shot):JourneyShot=>({...s,atmosphere:0,band:0});
export function residenceShot(portrait:boolean,selection:number):JourneyShot{
 const r=[
  portrait?{radius:660,height:85,targetY:179,targetX:0,yaw:10,fov:36,reveal:1}:{radius:365,height:83,targetY:78,targetX:46,yaw:10,fov:32,reveal:1},
  portrait?{radius:650,height:108,targetY:179,targetX:0,yaw:9,fov:36,reveal:1}:{radius:360,height:101,targetY:83,targetX:46,yaw:9,fov:32,reveal:1},
  portrait?{radius:640,height:123,targetY:180,targetX:0,yaw:8,fov:36,reveal:1}:{radius:365,height:117,targetY:87,targetX:46,yaw:8,fov:32,reveal:1}
 ];
 const s=Math.max(0,Math.min(2,selection)),i=Math.floor(s),a={...r[i],atmosphere:0,band:1},b={...r[Math.min(2,i+1)],atmosphere:0,band:1};return mix(a,b,s-i);
}
export function journeyAt(time:number,portrait:boolean,selection=0):JourneyShot{
 if(time<=1)return wrap(shotAt(time,portrait));
 const crown=wrap((portrait?portraitShots:desktopShots)[2]),residence=residenceShot(portrait,selection);
 const horizon:JourneyShot=portrait?{radius:500,height:110,targetY:99,targetX:-76,yaw:8,fov:36,reveal:.75,atmosphere:1,band:0}:{radius:330,height:115,targetY:96,targetX:-138,yaw:8,fov:32,reveal:.75,atmosphere:1,band:0};
 const finale:JourneyShot=portrait?{radius:640,height:82,targetY:161,targetX:0,yaw:14,fov:36,reveal:.8,atmosphere:0,band:0}:{radius:375,height:82,targetY:77,targetX:-49,yaw:14,fov:32,reveal:.8,atmosphere:0,band:0};
 if(time<2)return mix(crown,residence,(time-1.2)/.8);
 const detail:JourneyShot={radius:portrait?115:85,height:29,targetY:20,targetX:0,yaw:3,fov:portrait?44:38,reveal:1,atmosphere:.06,band:0};
 const entrance:JourneyShot={radius:24,height:3.3,targetY:3.3,targetX:0,yaw:0,fov:portrait?58:50,reveal:1,atmosphere:.06,band:0};
 const threshold:JourneyShot={...entrance,radius:12.3,fov:portrait?65:56};
 if(time<2.35)return mix(residence,detail,(time-2.12)/.23);
 if(time<2.52)return mix(detail,entrance,(time-2.37)/.15);
 if(time<3.15)return mix(entrance,threshold,(time-2.54)/.05);
 if(time<4)return mix(threshold,horizon,(time-3.65)/.35);
 const context={...horizon,targetX:portrait?-96:-158};
 if(time<5.55)return mix(horizon,context,(time-4.65)/.35);
 return mix(context,finale,(time-5.55)/.45);
}
export type InteriorShot={position:[number,number,number];target:[number,number,number];fov:number};
/** The cut is hidden at the deep portal. Forward and reverse use the same state. */
export function residenceExperience(time:number,portrait:boolean){
 const inside=time>=2.6&&time<3.5;
 const occlusion=time<2.6?ease((time-2.565)/.02):1-ease((time-2.615)/.035);
 const poses:InteriorShot[]=[
  {position:[.45,1.65,-7.6],target:[portrait?-.4:-1.1,1.55,5],fov:portrait?68:58},
  {position:[.65,1.65,-2.5],target:[portrait?-3.25:-1.7,portrait?1.1:1.4,portrait?3.2:4.5],fov:portrait?68:60},
  {position:[.65,1.65,3.2],target:[0,1.7,14],fov:portrait?65:58},
  {position:[.7,1.65,6.1],target:[.7,1.75,20],fov:portrait?60:54}
 ];
 const times=[2.63,2.75,2.86,2.95];
 let shot=poses[0];
 for(let i=0;i<3;i++){if(time>=times[i]){const p=ease((time-times[i])/(times[i+1]-times[i]));shot={position:poses[i].position.map((a,j)=>a+(poses[i+1].position[j]-a)*p) as InteriorShot['position'],target:poses[i].target.map((a,j)=>a+(poses[i+1].target[j]-a)*p) as InteriorShot['target'],fov:poses[i].fov+(poses[i+1].fov-poses[i].fov)*p}}}
 return {inside,occlusion:time>=2.565&&time<=2.65?occlusion:0,shot};
}
/** Pixel anchors are measured on refresh, so editorial image heights cannot shift shots. */
export function timelineAt(scroll:number,anchors:number[]){
 if(scroll<=0)return 0;
 for(let i=0;i<anchors.length-1;i++)if(scroll<anchors[i+1])return i+(scroll-anchors[i])/(anchors[i+1]-anchors[i]);
 return anchors.length-1;
}
