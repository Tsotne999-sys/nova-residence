import * as THREE from 'three';

type Kind='glass'|'stone'|'wood'|'metal'|'fabric'|'plaster';
/** Object-scale detail; no image downloads, reflection passes or transparency. */
export function surface(material:THREE.MeshStandardMaterial,kind:Kind){
 material.onBeforeCompile=shader=>{
  shader.vertexShader='varying vec3 novaSurface;\n'+shader.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
   vec4 surfaceP=vec4(transformed,1.);
   #ifdef USE_INSTANCING
   surfaceP=instanceMatrix*surfaceP;
   #endif
   novaSurface=surfaceP.xyz;`);
  shader.fragmentShader=`varying vec3 novaSurface;
   float novaHash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
   \n`+shader.fragmentShader;
  const detail=kind==='glass'?`
   vec2 panel=vec2(floor(novaSurface.x/2.8),floor((novaSurface.y-6.7)/3.3));
   float variation=novaHash(panel);
   float floorPosition=fract((novaSurface.y-6.7)/3.3);
   float recess=smoothstep(.025,.13,floorPosition)*(1.-smoothstep(.87,.97,floorPosition));
   float curtain=.5+.5*sin(novaSurface.x*19.+variation*4.);
   diffuseColor.rgb*=mix(.48,1.15,recess)*mix(.80,1.22,variation);
   diffuseColor.rgb+=vec3(.025,.039,.045)*(.5+.5*sin(novaSurface.y*.048+novaSurface.x*.07));
   diffuseColor.rgb*=1.-curtain*.07*step(.67,variation);
  `:kind==='stone'?`
   float vein=sin(novaSurface.x*1.3+novaSurface.z*.65+sin(novaSurface.z*2.2+novaSurface.y*.9)*.35);
   float grain=novaHash(floor(novaSurface.xz*180.));
   diffuseColor.rgb*=.88+grain*.13+pow(abs(vein),28.)*.11;
   if(abs(novaSurface.y)<.04){
    vec2 slab=abs(fract(novaSurface.xz/2.4+.5)-.5);
    float joint=smoothstep(.483,.495,max(slab.x,slab.y));
    diffuseColor.rgb*=1.-joint*.18;
    diffuseColor.rgb*=mix(.65,1.,smoothstep(0.,1.1,7.-abs(novaSurface.x)));
   }
  `:kind==='wood'?`
   float grain=sin(novaSurface.y*65.+sin(novaSurface.z*3.)*2.+sin(novaSurface.x*4.)*.6);
   diffuseColor.rgb*=.96+.04*grain;
  `:kind==='plaster'?`
   float corner=min(7.-abs(novaSurface.x),min(novaSurface.z+8.,10.-novaSurface.z));
   diffuseColor.rgb*=mix(.58,1.,smoothstep(0.,.85,corner));
  `:kind==='fabric'?`
   diffuseColor.rgb*=.99+.01*sin(novaSurface.x*170.)*sin(novaSurface.z*170.+novaSurface.y*160.);
  `:`diffuseColor.rgb*=.96+.04*sin(novaSurface.y*180.);`;
  shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\n'+detail);
  if(kind==='glass')shader.fragmentShader=shader.fragmentShader.replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\n roughnessFactor=.19+variation*.13;');
 };
 material.customProgramCacheKey=()=>`nova-surface-${kind}-v1`;
 return material;
}
