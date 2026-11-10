import { useEffect, useState } from "react";
import Emergence from "./Emergence";
import InfinityExperience from "./Infinity";
import DimensionsExperience from "./Dimensions";
import PerceptionExperience from "./Perception";
import PatternsExperience from "./Patterns";
import ConsciousnessExperience from "./Consciousness";
import ArtExperience from "./Art";
import { ArrowDown, ArrowRight, ArrowUpRight, Menu, X, Sparkles } from "lucide-react";

type World = { id:string; number:string; name:string; line:string; description:string; category:string; className:string; detail:string };
const worlds:World[]=[
 {id:"infinity",number:"01",name:"Infinity",line:"Where the end never arrives.",description:"Explore mathematical universes, recursive forms and patterns that reveal new worlds the closer you look.",category:"MATHEMATICS",className:"art-infinity",detail:"A simple equation can generate a universe of extraordinary complexity. Begin with z → z² + c, then follow the shape as it unfolds."},
 {id:"dimensions",number:"02",name:"Dimensions",line:"More than the eye can hold.",description:"Move beyond familiar space and investigate the geometry of higher dimensions.",category:"GEOMETRY",className:"art-dimensions",detail:"Explore projections, rotations and the geometry of a tesseract: a four-dimensional analogue of a cube."},
 {id:"perception",number:"03",name:"Perception",line:"Seeing is not the same as knowing.",description:"Test the boundaries of sight, attention, memory and the mind's interpretation of reality.",category:"COGNITION",className:"art-perception",detail:"Investigate how context, ambiguity and attention shape what becomes perceptually available."},
 {id:"patterns",number:"04",name:"Patterns",line:"Order hiding in plain sight.",description:"Create living forms from symmetry, repetition, algorithms and natural systems.",category:"GENERATIVE ART",className:"art-patterns",detail:"A few rules can create astonishing forms. Change the rules and observe the consequences."},
 {id:"consciousness",number:"05",name:"Consciousness",line:"The mystery looking back.",description:"Enter questions of awareness, identity, dreams, memory and subjective experience.",category:"PHILOSOPHY",className:"art-consciousness",detail:"Explore the hard problem of consciousness, personal identity and the relationship between brain, mind and experience."},
 {id:"art",number:"06",name:"Art",line:"A world made of possibility.",description:"Meet visual experiments, expressive forms and tools for making something of your own.",category:"CREATION",className:"art-art",detail:"Create visual experiments and generative compositions of your own."}
];
function FractalMark(){return <div className="fractal-mark" aria-hidden="true"><span/><span/><span/><span/><span/></div>}
function WorldArtwork({className}:{className:string}){return <div className={`world-art ${className}`} aria-hidden="true"><div className="art-orb"/><div className="art-ring ring-one"/><div className="art-ring ring-two"/><div className="art-grid"/><div className="art-grain"/></div>}

const studies=[
 {id:"emergence",world:"PATTERNS",number:"001",title:"HOW DOES ORDER EMERGE?"},
 {id:"infinity",world:"INFINITY",number:"002",title:"HOW MUCH DETAIL CAN INFINITY CONTAIN?"},
 {id:"dimensions",world:"DIMENSIONS",number:"003",title:"WHAT DOES A SHAPE LOOK LIKE BEYOND SPACE?"},
 {id:"perception",world:"PERCEPTION",number:"004",title:"HOW MUCH OF THE WORLD DO YOU ACTUALLY SEE?"},
 {id:"patterns",world:"PATTERNS",number:"005",title:"HOW CAN A FEW RULES GROW A WORLD?"},
 {id:"consciousness",world:"CONSCIOUSNESS",number:"006",title:"WHY IS THERE SOMETHING IT FEELS LIKE?"},
 {id:"art",world:"ART",number:"007",title:"MAKE A MARK. DISCOVER ITS WORLD."}
];
export default function App(){
 const [active,setActive]=useState<World|null>(null);
 const [menuOpen,setMenuOpen]=useState(false);
 const [entered,setEntered]=useState(false);
 const [experience,setExperience]=useState<string|null>(null);
 useEffect(()=>{document.body.style.overflow=active||menuOpen||experience?"hidden":"";return()=>{document.body.style.overflow="";};},[active,menuOpen,experience]);
 const openWorld=(world:World)=>{setActive(world);setMenuOpen(false);};
 const openStudy=(id:string)=>{setActive(null);setExperience(id);window.scrollTo({top:0,behavior:"instant"});};
 const backHome=()=>{setExperience(null);setActive(null);window.scrollTo({top:0,behavior:"instant"});};
 const scrollToWorlds=()=>document.getElementById("worlds")?.scrollIntoView({behavior:"smooth"});
 const current=studies.find(s=>s.id===experience);
 return <>
  <main aria-hidden={!!experience} className={experience?"home-surface home-surface-away": "home-surface"}>
   <header className="topbar"><a className="wordmark" href="#top" aria-label="Beyond home"><span className="wordmark-symbol">B</span><span>BEYOND</span></a><span className="topbar-note">AN ATLAS OF THE UNSEEN</span><button className="menu-toggle" onClick={()=>setMenuOpen(true)} aria-label="Open navigation"><Menu size={21}/></button><nav className="desktop-nav"><a href="#worlds">EXPLORE</a><a href="#manifesto">ABOUT</a><span className="status-dot"/><span className="nav-status">A WORK IN PROGRESS</span></nav></header>
   {menuOpen&&<div className="mobile-menu"><button className="close-menu" onClick={()=>setMenuOpen(false)} aria-label="Close navigation"><X/></button><span className="eyebrow">NAVIGATE</span><a onClick={()=>{setMenuOpen(false);scrollToWorlds();}}>Explore the worlds <ArrowUpRight/></a><a onClick={()=>{setMenuOpen(false);document.getElementById("manifesto")?.scrollIntoView({behavior:"smooth"});}}>About BEYOND <ArrowUpRight/></a><p>Six doors. No final destination.</p></div>}
   <section className="hero" id="top"><div className="hero-noise"/><div className="hero-copy"><div className="eyebrow hero-eyebrow"><span className="eyebrow-line"/> AN INTERACTIVE UNIVERSE <span className="eyebrow-line"/></div><h1>There is more<br/><em>to everything.</em></h1><p className="hero-description">A space to explore the strange, the beautiful and the not-yet-understood — through art, science, mathematics and ideas.</p><button className="explore-button" onClick={()=>{setEntered(true);scrollToWorlds();}}><span>{entered?"CONTINUE EXPLORING":"ENTER THE UNKNOWN"}</span><ArrowRight size={17}/></button></div><div className="hero-visual"><div className="hero-halo halo-a"/><div className="hero-halo halo-b"/><div className="hero-core"><FractalMark/></div><div className="hero-coordinate coordinate-a">0.000 / ∞</div><div className="hero-coordinate coordinate-b">FIG. 001 — THE BEGINNING</div><div className="hero-vertical">OBSERVE · QUESTION · DISCOVER</div></div><div className="hero-footer"><span>01 — 06 / WORLDS</span><span className="scroll-cue"><ArrowDown size={14}/> SCROLL TO DISCOVER</span><span>EST. IN CURIOSITY</span></div></section>
   <section className="intro-strip" id="manifesto"><span className="eyebrow">A DIFFERENT KIND OF EXPLORATION</span><p>Not everything meaningful can be explained.<br/><em>Some things have to be experienced.</em></p><span className="intro-aside">ART × SCIENCE × WONDER</span></section>
   <section className="worlds-section" id="worlds"><div className="section-heading"><div><span className="eyebrow">CHOOSE YOUR FIRST DOOR</span><h2>Six ways <em>in.</em></h2></div><span className="section-count">01 / 06<br/>THE WORLDS</span></div><div className="world-grid">{worlds.map(world=><button className="world-card" key={world.id} onClick={()=>openWorld(world)}><WorldArtwork className={world.className}/><span className="card-top"><span>{world.number} / 06</span><span>{world.category}</span></span><span className="card-bottom"><span><strong>{world.name}</strong><small>{world.line}</small></span><span className="card-arrow"><ArrowUpRight size={19}/></span></span></button>)}</div></section>
   <section className="closing-note"><Sparkles size={17}/><p>The map is not the territory.<br/><em>And this is only the beginning.</em></p><button onClick={scrollToWorlds}>WANDER A LITTLE LONGER <ArrowRight size={15}/></button></section>
   <footer><a className="wordmark" href="#top"><span className="wordmark-symbol">B</span><span>BEYOND</span></a><span>AN OPEN-ENDED EXPLORATION</span><span>© 2026 — MADE OF QUESTIONS</span></footer>
   {active&&<div className="world-overlay" role="dialog" aria-modal="true" aria-labelledby="world-title" onClick={()=>setActive(null)}><div className="world-detail" onClick={e=>e.stopPropagation()}><button className="detail-close" onClick={()=>setActive(null)} aria-label="Close world"><X/></button><WorldArtwork className={active.className}/><div className="detail-content"><span className="eyebrow">{active.number} / 06 — {active.category}</span><h2 id="world-title">{active.name}<em>.</em></h2><p className="detail-line">{active.line}</p><p className="detail-description">{active.detail}</p>{studies.filter(s=>active.id==="patterns"?s.id==="emergence"||s.id==="patterns":s.id===active.id).map(s=><button className="detail-next" key={s.number} onClick={()=>openStudy(s.id)}>OPEN FIELD STUDY {s.number} — {s.title} <ArrowRight size={16}/></button>)}<div className="detail-foot"><span>THIS WORLD IS GROWING</span><span>EXPERIENCE COMING INTO FOCUS <span className="pulse-dot"/></span></div></div><button className="detail-next" onClick={()=>setActive(worlds[(worlds.findIndex(w=>w.id===active.id)+1)%worlds.length])}>NEXT WORLD <ArrowRight size={16}/></button></div></div>}
  </main>
  <div className={experience?"experience-keepalive experience-visible":"experience-keepalive"} aria-hidden={!experience}>
   <header className="topbar experience-nav"><button className="wordmark" onClick={backHome} aria-label="Return to Beyond home"><span className="wordmark-symbol">B</span><span>BEYOND</span></button><span className="topbar-note">{current?.world} / FIELD STUDY {current?.number}</span><button className="explore-button" onClick={backHome}><span>BACK TO THE WORLDS</span><ArrowRight size={17}/></button></header>
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
