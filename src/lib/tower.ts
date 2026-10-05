// Approved Phase 1 dimensions, in conceptual metres. Not construction drawings.
export type MaterialKey='graphite'|'silver'|'stone'|'glass'|'reveal'|'light'|'windows'|'wash';
export type Box={position:[number,number,number];size:[number,number,number];rotation?:number;color?:string};
export type Blade={left:number;right:number;bottom:number;glassTop:number;screenTop:number;front:number;back:number;chamfer:number};
export const blades:Blade[]=[
 {left:-14,right:-1.3,bottom:6.7,glassTop:125.5,screenTop:125.5,front:-12,back:12,chamfer:.8},
 {left:-13.2,right:-1.3,bottom:125.5,glassTop:141.7,screenTop:146,front:-11.25,back:11.25,chamfer:.65},
 {left:1.3,right:14,bottom:6.7,glassTop:139,screenTop:139,front:-12,back:12,chamfer:.8},
 {left:1.3,right:13.4,bottom:139,glassTop:150.3,screenTop:156,front:-11.4,back:11.4,chamfer:.65}
];
export function ring(b:Blade):[number,number][]{const {left:l,right:r,front:f,back:k,chamfer:c}=b;return [[l+c,f],[r-c,f],[r,f+c],[r,k-c],[r-c,k],[l+c,k],[l,k-c],[l,f+c]]}
export function towerParts(lite=false){
 const groups:Record<MaterialKey,Box[]>={graphite:[],silver:[],stone:[],glass:[],reveal:[],light:[],windows:[],wash:[]};
 function box(m:MaterialKey,x:number,y:number,z:number,w:number,h:number,d:number,rotation=0){groups[m].push({position:[x,y+h/2,z],size:[w,h,d],rotation})}
 const ribbon=(b:Blade,y:number,h:number)=>{const r=ring(b);r.forEach((a,i)=>{const c=r[(i+1)%8],dx=c[0]-a[0],dz=c[1]-a[1];box('graphite',(a[0]+c[0])/2,y,(a[1]+c[1])/2,Math.hypot(dx,dz),h,.10,-Math.atan2(dz,dx))})};
 for(const b of blades){
  const {left:l,right:r,bottom:y,glassTop:g,screenTop:s,front:f,back:k,chamfer:c}=b;
  // Mobile drops alternate horizontal spandrels, never silhouette or main fins.
  for(let h=6.7+Math.ceil((y-6.7)/3.3)*3.3;h<g;h+=lite?6.6:3.3)ribbon(b,h,.13);
  for(const x of [-12.8,-10,-7.2,-4.4,-1.8,1.8,4.4,7.2,10,12.8]){
   if(x<l+.25||x>r-.25)continue;
   const offset=Math.max(0,c-Math.min(x-l,r-x));
   for(const z of [f+offset-.26,k-offset+.26])box('graphite',x,y,z,.17,s-y,.62);
  }
  for(let z=f+2.4;z<k-1;z+=3){box('graphite',l-.18,y,z,.4,s-y,.24);box('graphite',r+.18,y,z,.4,s-y,.24)}
  if(s>g){box('reveal',(l+r)/2,g,(f+k)/2,r-l-2.2,s-g-1.2,k-f-2.2);ribbon(b,s-.22,.22);
   for(let h=g+.5;h<s-.4;h+=lite?1.2:.6)ribbon(b,h,.09);
   box('silver',(l+r)/2,s-.23,f,r-l-c*2,.07,.12);
  }
  // Deterministic occupied rooms: irregular clusters, warm ivory and cool grey.
  for(let floor=Math.ceil((y-6.7)/3.3);6.7+floor*3.3<g-3;floor++)for(let bay=0;bay<4;bay++){
   const h=6.7+floor*3.3,x=l+1.5+bay*2.8;
   const seed=((floor*37+bay*71+Math.round(l)*13)%101+101)%101;
   if(x>r-1||seed>18||(lite&&seed>13))continue;
   box('windows',x,h+.5,f-.085,1.8,seed<7?1.8:.85,.018);
   groups.windows.at(-1)!.color=seed%3===0?'#9aaeb7':seed%3===1?'#d8bd8d':'#b9a991';
   // Recessed interior divider, rather than an undifferentiated luminous square.
   box('reveal',x+.36,h+.5,f-.12,.055,1.8,.03);
  }
 }
 box('stone',0,0,0,41,1.1,34);
 // Cut a real six-metre portal into the base; the camera approaches its recess.
 box('stone',-10.25,1.1,0,14.5,5.6,29);box('stone',10.25,1.1,0,14.5,5.6,29);
 box('stone',0,6.1,0,6,.6,29);box('reveal',0,1.1,-8,6,5,.2);
 box('graphite',0,1.1,-8.14,.035,4.9,.025);
 for(const x of [-.38,.38])box('silver',x,2.3,-8.21,.035,1.25,.09);
 box('glass',-9.8,1.65,-14.56,10,3.85,.08);box('glass',9.8,1.65,-14.56,10,3.85,.08);
 for(const x of [-15,-12,-9,-6,6,9,12,15])box('graphite',x,1.1,-14.74,.15,5,.34);
 for(const x of [-3.12,3.12]){box('silver',x,1.1,-14.8,.12,4.9,.4);box('graphite',x,1.1,-16,.35,4.9,2.6)}
 box('graphite',0,5.84,-16,12,.28,5);box('silver',0,5.98,-18.52,12,.07,.09);
 for(const x of [-2.65,2.65]){box('windows',x,5.79,-16,.065,.025,3.3);groups.windows.at(-1)!.color='#d1b384'}
 box('stone',0,.55,-18.1,10,.28,2.2);box('stone',0,.2,-19.1,11,.2,2.2);
 box('reveal',0,6.7,3.5,3,137.3,17);
 box('graphite',0,7,-5.03,.65,134.7,.04);box('light',0,7,-5.065,.16,134.7,.025);
 box('reveal',-1.22,6.7,-8.5,.16,139.3,7);box('reveal',1.22,6.7,-8.5,.16,143.6,7);
 box('silver',-1.34,6.7,-11.96,.07,118.8,.07);box('silver',1.34,6.7,-11.96,.07,132.3,.07);
 // Low-intensity return surfaces approximate indirect seam spill, not extra lights.
 box('wash',-1.132,7,-5.9,.012,134.7,1.7);box('wash',1.132,7,-5.9,.012,134.7,1.7);
 return groups;
}
