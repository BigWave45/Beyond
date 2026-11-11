import { useEffect, useState } from "react";
import Emergence from "./Emergence";
import InfinityExperience from "./Infinity";
import DimensionsExperience from "./Dimensions";
import PerceptionExperience from "./Perception";
import PatternsExperience from "./Patterns";
import ConsciousnessExperience from "./Consciousness";
import ArtExperience from "./Art";
import { ArrowRight, ArrowUpRight } from "lucide-react";

type World={id:string;number:string;name:string;className:string;kind:string};
const worlds:World[]=[
 {id:"infinity",number:"01",name:"Infinity",className:"art-infinity",kind:"MATHEMATICS"},
 {id:"dimensions",number:"02",name:"Dimensions",className:"art-dimensions",kind:"GEOMETRY"},
 {id:"perception",number:"03",name:"Perception",className:"art-perception",kind:"COGNITION"},
 {id:"patterns",number:"04",name:"Patterns",className:"art-patterns",kind:"EMERGENCE"},
 {id:"consciousness",number:"05",name:"Consciousness",className:"art-consciousness",kind:"AWARENESS"},
 {id:"art",number:"06",name:"Art",className:"art-art",kind:"CREATION"}
];
function WorldArtwork({className}:{className:string}){return <div className={`world-art ${className}`} aria-hidden="true"><div className="art-orb"/><div className="art-ring ring-one"/><div className="art-ring ring-two"/><div className="art-grid"/><div className="art-grain"/></div>}
const studies=[
 {id:"emergence",world:"PATTERNS",number:"001"},
 {id:"infinity",world:"INFINITY",number:"002"},
 {id:"dimensions",world:"DIMENSIONS",number:"003"},
 {id:"perception",world:"PERCEPTION",number:"004"},
 {id:"patterns",world:"PATTERNS",number:"005"},
 {id:"consciousness",world:"CONSCIOUSNESS",number:"006"},
 {id:"art",world:"ART",number:"007"}
];
export default function App(){
 const [experience,setExperience]=useState<string|null>(null);
 useEffect(()=>{document.body.style.overflow=experience?"hidden":"";return()=>{document.body.style.overflow="";};},[experience]);
 const openWorld=(world:World)=>{setExperience(world.id);window.scrollTo({top:0,behavior:"instant"});};
 const backHome=()=>{setExperience(null);window.scrollTo({top:0,behavior:"instant"});};
 const current=studies.find(s=>s.id===experience);
 return <>
  <main className={experience?"space-home space-home-away":"space-home"}>
   <div className="space-stars" aria-hidden="true"/>
   <header className="space-topbar"><a className="wordmark" href="#top" aria-label="Beyond home"><span className="wordmark-symbol">B</span><span>BEYOND</span></a><span className="space-coordinate">AN OPEN UNIVERSE <i/></span></header>
   <section className="space-explorer" id="top">
    <div className="space-title"><span className="eyebrow">SELECT A WORLD</span><h1>BEYOND<span>.</span></h1></div>
    <div className="world-map">
     <svg className="map-connections" viewBox="0 0 1000 620" preserveAspectRatio="none" aria-hidden="true">
      <path d="M166 155 L500 155 L834 155 L834 465 L500 465 L166 465 Z M166 155 L500 465 M500 155 L166 465 M500 155 L834 465 M834 155 L500 465"/>
      <circle cx="166" cy="155" r="3"/><circle cx="500" cy="155" r="3"/><circle cx="834" cy="155" r="3"/><circle cx="166" cy="465" r="3"/><circle cx="500" cy="465" r="3"/><circle cx="834" cy="465" r="3"/>
     </svg>
     <div className="world-grid">{worlds.map(world=><button className="world-card" key={world.id} onClick={()=>openWorld(world)} aria-label={`Enter ${world.name}`}>
      <WorldArtwork className={world.className}/>
      <span className="card-top"><span>{world.number}</span><span>{world.kind}</span></span>
      <span className="card-bottom"><span><strong>{world.name}</strong></span><span className="card-arrow"><ArrowUpRight size={18}/></span></span>
     </button>)}</div>
    </div>
    <div className="space-footer"><span>6 WORLDS</span><span>ONE CONNECTED UNIVERSE</span><span>CHOOSE YOUR PATH <span className="space-pulse"/></span></div>
   </section>
  </main>
  <div className={experience?"experience-keepalive experience-visible":"experience-keepalive"} aria-hidden={!experience}>
   <header className="topbar experience-nav"><button className="wordmark" onClick={backHome} aria-label="Return to Beyond home"><span className="wordmark-symbol">B</span><span>BEYOND</span></button><span className="topbar-note">{current?.world} / FIELD STUDY {current?.number}</span><button className="explore-button" onClick={backHome}><span>RETURN TO WORLDS</span><ArrowRight size={17}/></button></header>
   <div className="experience-stage">
    <div className="experience-slot" data-active={experience==="emergence"}><Emergence/></div>
    <div className="experience-slot" data-active={experience==="infinity"}><InfinityExperience/></div>
    <div className="experience-slot" data-active={experience==="dimensions"}><DimensionsExperience/></div>
    <div className="experience-slot" data-active={experience==="perception"}><PerceptionExperience/></div>
    <div className="experience-slot" data-active={experience==="patterns"}><PatternsExperience/></div>
    <div className="experience-slot" data-active={experience==="consciousness"}><ConsciousnessExperience/></div>
    <div className="experience-slot" data-active={experience==="art"}><ArtExperience/></div>
   </div>
  </div>
 </>;
}
