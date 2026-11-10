import { useState } from "react";
import { RefreshCw } from "lucide-react";
import "./perception.css";
import { usePersistentState } from "./usePersistentState";

type TrialDot={x:number;y:number;tilt:number;target:boolean};
function makeSearch():TrialDot[]{
 const target=Math.floor(Math.random()*30);
 return Array.from({length:30},(_,i)=>({x:8+(i%6)*16.8+(Math.random()-.5)*5,y:10+Math.floor(i/6)*19+(Math.random()-.5)*5,tilt:i===target?90:0,target:i===target}));
}
export default function PerceptionExperience(){
 const [station,setStation]=usePersistentState<"context"|"ambiguity"|"attention">("perception:station","context");
 const [surround,setSurround]=usePersistentState<"dark"|"light">("perception:surround","dark");
 const [face,setFace]=usePersistentState<"upper"|"lower">("perception:face","upper");
 const [showValues,setShowValues]=usePersistentState("perception:showValues",false);
 const [dots,setDots]=usePersistentState<TrialDot[]>("perception:dots",()=>makeSearch());
 const [found,setFound]=useState(false);
 const [attempts,setAttempts]=useState(0);
 const [message,setMessage]=useState("Find the one line that is tilted sideways.");
 const newTrial=()=>{setDots(makeSearch());setFound(false);setMessage("Find the one line that is tilted sideways.");};
 const choose=(i:number)=>{
  if(found)return;
  setAttempts(a=>a+1);
  if(dots[i].target){setFound(true);setMessage("You found it. Now try another arrangement.");}
  else setMessage("Not that one. Keep scanning. The target is the only horizontal line.");
 };
 return <section className="perception-experience">
  <div className="perception-heading"><span className="equation-label">BEYOND FIELD NOTE / 004</span><h1>How much of the world<br/><em>do you actually see?</em></h1><p>Your eyes receive light. Your brain constructs a scene. These are not the same operation. Test how context, ambiguity and attention shape what becomes perceptually available.</p></div>
  <nav className="perception-tabs" aria-label="Perception experiments">
   <button className={station==="context"?"active":""} onClick={()=>setStation("context")}><span>01</span> CONTEXT</button>
   <button className={station==="ambiguity"?"active":""} onClick={()=>setStation("ambiguity")}><span>02</span> AMBIGUITY</button>
   <button className={station==="attention"?"active":""} onClick={()=>setStation("attention")}><span>03</span> ATTENTION</button>
  </nav>
  {station==="context"&&<div className="perception-station">
   <div className="perception-station-copy"><span className="equation-label">EXPERIMENT 01 / SIMULTANEOUS CONTRAST</span><h2>Can the same grey<br/><em>look like two greys?</em></h2><p>Look at the two small squares. One sits on a dark field; the other on a light field. They have exactly the same RGB value. Yet they may not appear equally bright.</p><div className="perception-control"><span>CHANGE THE SURROUND</span><div><button className={surround==="dark"?"active":""} onClick={()=>setSurround("dark")}>DARK FIELD</button><button className={surround==="light"?"active":""} onClick={()=>setSurround("light")}>LIGHT FIELD</button></div></div><button className="reveal-values" onClick={()=>setShowValues(v=>!v)}>{showValues?"HIDE PIXEL VALUES":"REVEAL PIXEL VALUES"}</button>{showValues&&<div className="pixel-proof"><b>Both patches: RGB(128, 128, 128)</b><small>Identical digital pixel values. Different surrounds.</small></div>}</div>
   <div className="contrast-demo"><div className="contrast-field dark"><span>PATCH A</span><div/></div><div className="contrast-field light"><span>PATCH B</span><div/></div><small>THE TWO CENTRE PATCHES ARE IDENTICAL</small></div>
   <div className="perception-explanation"><b>WHAT THIS SHOWS</b><p>Perceived brightness depends partly on surrounding luminance and visual context. The display values remain fixed while the background changes. This is simultaneous contrast, a perceptual effect, not a change in the pixels.</p></div>
  </div>}
  {station==="ambiguity"&&<div className="perception-station">
   <div className="perception-station-copy"><span className="equation-label">EXPERIMENT 02 / AMBIGUOUS FIGURES</span><h2>One drawing.<br/><em>Two possible spaces.</em></h2><p>This wireframe cube has no shading or depth cues that force one interpretation. Your visual system can organise the same lines into either of two depth arrangements.</p><button className="reveal-values" onClick={()=>setFace(f=>f==="upper"?"lower":"upper")}><RefreshCw size={14}/> SWITCH INTERPRETATION</button><p className="subtle-note">Try staring at one corner, then switch. Can you make the other interpretation stable without pressing the button?</p></div>
   <div className="ambiguity-demo"><svg viewBox="0 0 420 330" role="img" aria-label="An ambiguous wireframe cube whose depth interpretation can be switched"><g fill="none" stroke="#d5d9e3" strokeWidth="2.2" strokeLinejoin="round"><path d="M210 55 L335 120 L210 185 L85 120 Z"/><path d="M85 120 L85 260 L210 325 L210 185"/><path d="M210 185 L335 120 L335 260 L210 325"/><path d="M210 55 L210 195" strokeDasharray="5 6" opacity=".0"/></g>{face==="upper"?<path d="M210 55 L335 120 L210 185 L85 120 Z" fill="rgba(174,185,214,.18)" stroke="none"/>:<path d="M210 185 L335 120 L335 260 L210 325 Z" fill="rgba(174,185,214,.18)" stroke="none"/>}</svg><span>{face==="upper"?"INTERPRETATION A / TOP FACE":"INTERPRETATION B / RIGHT FACE"}</span></div>
   <div className="perception-explanation"><b>WHAT THIS SHOWS</b><p>The image itself does not change. The visual system resolves an underdetermined drawing into a plausible three-dimensional interpretation. Ambiguous figures demonstrate that perception involves organisation and inference.</p></div>
  </div>}
  {station==="attention"&&<div className="perception-station">
   <div className="perception-station-copy"><span className="equation-label">EXPERIMENT 03 / VISUAL SEARCH</span><h2>Attention is a<br/><em>limited resource.</em></h2><p>Find the one horizontal line among the vertical lines. The target position changes each round. This is a simple visual-search task: notice how quickly a distinctive feature stands out.</p><div className="search-status"><b>{found?"TARGET FOUND": "TARGET NOT FOUND"}</b><span>ATTEMPTS: {attempts}</span></div><button className="reveal-values" onClick={newTrial}><RefreshCw size={14}/> NEW ARRANGEMENT</button><p className="subtle-note">{message}</p></div>
   <div className="search-demo"><div className="search-grid">{dots.map((d,i)=><button key={i} aria-label={"Select item "+(i+1)} className={"search-item "+(found&&d.target?"target-found":"")} onClick={()=>choose(i)}><span style={{transform:"rotate("+d.tilt+"deg)"}}/></button>)}</div><span>30 ITEMS / ONE TARGET</span></div>
   <div className="perception-explanation"><b>WHAT THIS SHOWS</b><p>Visual search performance depends on the target feature, distractors, display size and viewing conditions. This small task is illustrative; it is not a clinical attention test and does not measure your general ability to concentrate.</p></div>
  </div>}
  <section className="perception-reading"><span className="equation-label">A MODEL OF SEEING</span><h2>Light is input.<br/><em>Perception is inference.</em></h2><div className="perception-flow"><div><b>01 / SIGNAL</b><p>Light reaches the retina and is converted into neural activity.</p></div><div><b>02 / PROCESSING</b><p>The visual system extracts contrast, edges, colour, motion and spatial relationships.</p></div><div><b>03 / INTERPRETATION</b><p>Context, expectations and attention influence the scene we consciously experience.</p></div></div><p className="perception-caveat">These experiments isolate a few effects for learning. Real vision involves many interacting neural processes; none of these demonstrations alone explains the full visual system.</p></section>
  <footer className="perception-footnote"><span>VISUAL COGNITION / PERCEPTION</span><span>THREE DEMONSTRATIONS · NO DIAGNOSTIC CLAIMS</span></footer>
 </section>;
}
