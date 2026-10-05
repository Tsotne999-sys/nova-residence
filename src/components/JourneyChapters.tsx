'use client';
import Poster from './Poster';
import {residences} from '@/lib/journey';
export default function JourneyChapters({selection,onSelect}:{selection:number;onSelect:(index:number)=>void}){
 const selected=residences[selection];
 return <>
  <section id="residences" className="journey-chapter residences" aria-labelledby="residences-title">
   <div className="journey-poster"><Poster chapter={`residence-${selected.id}`}/></div>
   <div className="residence-editorial">
    <p className="section-label">04 / Residences</p><h2 id="residences-title">Three perspectives.<br/><span>One architecture.</span></h2>
    <div className="residence-choices" role="group" aria-label="Residence concepts">{residences.map((item,i)=><button key={item.id} id={`choose-${item.id}`} aria-pressed={selection===i} aria-controls="residence-story" onClick={()=>onSelect(i)}>{item.label}</button>)}</div>
    <div id="residence-story" className="residence-story" role="region" aria-labelledby={`choose-${selected.id}`} aria-live="polite" aria-atomic="true"><div className="residence-text" key={selected.id}><h3>{selected.title}</h3><p>{selected.description}</p></div></div>
    <p className="concept-note">Three conceptual positions. No property inventory.</p>
   </div>
      <p className="spatial-caption approach-caption">Closer to the architecture.<span>Graphite, glass, and the depth between.</span></p>
   <p className="spatial-caption entrance-caption">A quieter threshold.</p>
   <p className="spatial-caption interior-caption">A room above the sea.<span>One imagined residence.</span></p>
   <p className="spatial-caption window-caption">The horizon, within reach.</p>
   <div className="residence-stills"><figure><Poster chapter="entrance"/><figcaption>A quieter threshold.</figcaption></figure><figure><Poster chapter="interior"/><figcaption>A room above the sea. One imagined residence.</figcaption></figure></div>
   <div className="residence-marker" aria-hidden="true"><span>{selected.label}</span><i><b style={{bottom:`${selected.band[0]/156*100}%`,height:`${(selected.band[1]-selected.band[0])/156*100}%`}}/></i><small>Lower rhythm / Upper crown</small></div>
  </section>
  <section id="shared-spaces" className="shared-spaces" aria-labelledby="spaces-title">
   <div className="spaces-intro"><p className="section-label">05 / Shared spaces</p><h2 id="spaces-title">Space to<br/><em>slow down.</em></h2><p>Not every moment asks for height.<br/>Some simply ask for room.</p></div>
   <figure className="space-figure rooftop"><figcaption><span>01 / Arrival hall</span><p>A measured rhythm. Light drawn into depth.</p><small>Fictional spatial study</small></figcaption></figure>
   <div className="lobby-spread"><div className="lobby-copy"><p className="section-label">The room becomes a horizon</p><h3>A sheltered edge.<br/>An open view.</h3><p>Graphite fins frame the sky. Beyond their quiet rhythm, the sea becomes the only boundary.</p></div><figure className="space-figure lobby"><img src="/spaces/rooftop.webp" alt="Concept illustration of a graphite-framed roof terrace overlooking an open sea horizon" width={1536} height={1024} loading="lazy"/><figcaption><span>02 / Roof terrace</span><small>Fictional spatial study</small></figcaption></figure></div>
   <p className="spaces-disclosure">Imagined spaces, expressed as material and atmosphere studies. These illustrations do not document a built project or finalized interiors.</p>
  </section>
  <section id="horizon" className="journey-chapter horizon" aria-labelledby="horizon-title">
   <div className="journey-poster"><Poster chapter="horizon"/></div>
   <div className="horizon-copy"><p className="section-label">06 / Horizon</p><h2 id="horizon-title"><span className="horizon-desktop">Architecture shaped<br/>by the <em>horizon.</em></span><span className="horizon-portrait">Architecture<br/>shaped by the<br/><em>horizon.</em></span></h2><p>From the precision of a line<br/>to the openness beyond it.</p></div>
   <div className="horizon-rule" aria-hidden="true"><span>Structure</span><i/><span>Openness</span></div>
  </section>
  <section id="batumi" className="batumi-context" aria-labelledby="batumi-title">
   <div className="context-top"><p className="section-label">07 / Batumi, Georgia</p><span>Place as inspiration</span></div>
   <h2 id="batumi-title">Between the city<br/>and the <em>sea.</em></h2>
   <div className="context-composition" aria-hidden="true"><span className="context-sea">Black Sea</span><div className="context-horizon"/><span className="context-city">Batumi</span><p>WATER / LIGHT / VERTICALITY</p></div>
   <div className="context-footer"><p>Fictional architectural concept<br/>inspired by Batumi, Georgia.</p><p>A study of vertical living at the meeting of land and water. An imagined response to place, with no proposed address or development site.</p></div>
  </section>
  <section id="finale" className="journey-chapter finale" aria-labelledby="finale-title">
   <div className="journey-poster"><Poster chapter="finale"/></div>
   <div className="finale-copy"><p className="section-label">08 / Return</p><h2 id="finale-title">The horizon,<br/><em>reimagined.</em></h2><a className="presentation-link" href="/presentation">View concept presentation <span aria-hidden="true">↗</span></a><p className="presentation-note">Dedicated presentation in preparation</p><p className="finale-label">Fictional architectural concept · Batumi, Georgia</p></div>
   <a className="return-link" href="#arrival">Back to the beginning <span aria-hidden="true">↑</span></a>
  </section>
 </>;
}
