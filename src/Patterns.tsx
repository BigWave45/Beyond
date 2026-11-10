import { useEffect, useMemo, useRef, useState } from "react";
import { Download, RefreshCw, Shuffle } from "lucide-react";
import "./patterns.css";

type Point={x:number;y:number;};
const presets=[
 {name:"Branching",axiom:"F",rule:"F -> FF-[-F+F+F]+[+F-F-F]",angle:25.7,iterations:4,length:.72},
 {name:"Binary tree",axiom:"F",rule:"F -> F[+F]F[-F]F",angle:24,iterations:5,length:.68},
 {name:"Fern",axiom:"X",rule:"X -> F+[[X]-X]-F[-FX]+X",angle:25,iterations:5,length:.72}
];
function expand(axiom:string,rule:string,n:number){
 const replacement=rule.split("->")[1]?.trim()??"F";
 const variable=rule.split("->")[0]?.trim()??"F";
 let s=axiom;
 for(let i=0;i<n;i++){
  let next="";
  for(const ch of s)next+=ch===variable?replacement:ch;
  s=next;
  if(s.length>180000)break;
 }
 return s;
}
function traceGrammar(ctx:CanvasRenderingContext2D,grammar:string,angle:number,lengthRatio:number,iterations:number,width:number,height:number){
 const stack:{x:number;y:number;heading:number;length:number;depth:number}[]=[];
 const maxDepth=Math.max(1,iterations);
 const base=Math.min(height*.19,width*.075);
 let x=width/2,y=height*.91,heading=-Math.PI/2,len=base;
 const segments:{a:Point;b:Point;depth:number}[]=[];
 const step=base*Math.pow(lengthRatio,Math.max(0,iterations-1));
 len=step;
 for(const token of grammar){
  if(token==="F"||token==="X"){
   const nx=x+Math.cos(heading)*len,ny=y+Math.sin(heading)*len;
   if(token==="F")segments.push({a:{x,y},b:{x:nx,y:ny},depth:iterations});
   x=nx;y=ny;
  }else if(token==="+")heading+=angle*Math.PI/180;
  else if(token==="-")heading-=angle*Math.PI/180;
  else if(token==="[")stack.push({x,y,heading,length:len,depth:0});
  else if(token==="]"){
   const saved=stack.pop();if(saved){x=saved.x;y=saved.y;heading=saved.heading;len=saved.length;}
  }
  if(token==="[")len*=lengthRatio;
 }
 const maxY=Math.max(...segments.map(s=>s.a.y),...segments.map(s=>s.b.y),0);
 const minY=Math.min(...segments.map(s=>s.a.y),...segments.map(s=>s.b.y),height);
 const extent=Math.max(1,height*.88/(maxY-minY||1));
 ctx.save();ctx.translate(width/2,height*.91);ctx.scale(extent,extent);ctx.translate(-width/2,-height*.91);
 segments.forEach((s,i)=>{
  const t=i/Math.max(1,segments.length-1);
  ctx.beginPath();ctx.moveTo(s.a.x,s.a.y);ctx.lineTo(s.b.x,s.b.y);
  ctx.strokeStyle="rgba("+Math.round(174+50*t)+","+Math.round(185+28*t)+","+Math.round(214+8*t)+","+(.28+.68*t)+")";
  ctx.lineWidth=Math.max(.55,2.8*(1-t*.88));ctx.lineCap="round";ctx.stroke();
 });
 ctx.restore();
 return segments.length;
}
export default function PatternsExperience(){
 const canvas=useRef<HTMLCanvasElement>(null);
 const [preset,setPreset]=useState(0),[angle,setAngle]=useState(25.7),[iterations,setIterations]=useState(4),[ratio,setRatio]=useState(.72),[seed,setSeed]=useState(0),[showGrammar,setShowGrammar]=useState(false);
 const selected=presets[preset];
 const grammar=useMemo(()=>expand(selected.axiom,selected.rule,iterations),[selected,iterations,seed]);
 const segmentCount=useMemo(()=>grammar.split("").filter(c=>c==="F").length,[grammar]);
 useEffect(()=>{
  const el=canvas.current;if(!el)return;
  const draw=()=>{
   const rect=el.getBoundingClientRect(),dpr=Math.min(window.devicePixelRatio||1,2);
   el.width=Math.round(rect.width*dpr);el.height=Math.round(rect.height*dpr);
   const ctx=el.getContext("2d");if(!ctx)return;
   ctx.scale(dpr,dpr);ctx.clearRect(0,0,rect.width,rect.height);
   ctx.fillStyle="#080a10";ctx.fillRect(0,0,rect.width,rect.height);
   const count=traceGrammar(ctx,grammar,angle,ratio,iterations,rect.width,rect.height);
   return count;
  };
  draw();
  const observer=new ResizeObserver(draw);observer.observe(el);
  return()=>observer.disconnect();
 },[grammar,angle,ratio,iterations,seed]);
 const changePreset=(i:number)=>{setPreset(i);setAngle(presets[i].angle);setIterations(presets[i].iterations);setRatio(presets[i].length);};
 const randomise=()=>{setSeed(s=>s+1);setAngle(15+Math.random()*35);setRatio(.58+Math.random()*.25);};
 const download=()=>{const el=canvas.current;if(!el)return;const a=document.createElement("a");a.download="beyond-pattern-study.png";a.href=el.toDataURL("image/png");a.click();};
 return <section className="patterns-experience">
  <header className="patterns-heading"><span className="equation-label">BEYOND FIELD NOTE / 005</span><h1>How can a few rules<br/><em>grow a world?</em></h1><p>In nature, complexity often emerges through repeated local operations. Here, a compact grammar instructs a drawing system to branch. Change the rules and watch the structure change.</p></header>
  <div className="patterns-workbench">
   <div className="patterns-canvas-wrap"><div className="patterns-canvas-head"><span>GENERATIVE STUDY / {selected.name.toUpperCase()}</span><span>{segmentCount.toLocaleString()} SEGMENTS</span></div><canvas ref={canvas} className="patterns-canvas" aria-label="Generated branching structure from a mathematical rewriting grammar"/><div className="patterns-canvas-foot"><span>DETERMINISTIC RULE SYSTEM</span><button onClick={download}><Download size={13}/> EXPORT IMAGE</button></div></div>
   <aside className="patterns-controls">
    <span className="equation-label">CHOOSE A GRAMMAR</span>
    <div className="patterns-presets">{presets.map((p,i)=><button key={p.name} className={preset===i?"active":""} onClick={()=>changePreset(i)}><span>0{i+1}</span>{p.name}</button>)}</div>
    <label className="patterns-slider"><span>BRANCHING ANGLE <output>{angle.toFixed(1)}°</output></span><input type="range" min="5" max="65" step=".1" value={angle} onChange={e=>setAngle(+e.target.value)}/></label>
    <label className="patterns-slider"><span>GENERATIONS <output>{iterations}</output></span><input type="range" min="1" max="6" step="1" value={iterations} onChange={e=>setIterations(+e.target.value)}/></label>
    <label className="patterns-slider"><span>BRANCH LENGTH RATIO <output>{ratio.toFixed(2)}</output></span><input type="range" min=".5" max=".85" step=".01" value={ratio} onChange={e=>setRatio(+e.target.value)}/></label>
    <div className="patterns-actions"><button onClick={randomise}><Shuffle size={14}/> EXPLORE PARAMETERS</button><button onClick={()=>changePreset(preset)}><RefreshCw size={14}/> RESET</button></div>
    <button className="patterns-grammar-toggle" onClick={()=>setShowGrammar(v=>!v)}>{showGrammar?"HIDE THE GRAMMAR":"INSPECT THE GRAMMAR"} <span>{showGrammar?"−":"+"}</span></button>
    {showGrammar&&<div className="patterns-grammar"><small>STARTING SYMBOL</small><code>{selected.axiom}</code><small>REWRITE RULE</small><code>{selected.rule}</code><small>INSTRUCTIONS</small><p>F = draw forward. + / − = turn. [ = save position and heading. ] = restore them. X = a symbol that can be rewritten without drawing.</p></div>}
   </aside>
  </div>
  <section className="patterns-principle"><div><span className="equation-label">THE MATHEMATICAL IDEA</span><h2>Complexity from<br/><em>compression.</em></h2><p>A grammar is a compact description of a much larger structure. Each generation replaces symbols according to the same rule. The drawing is the accumulated result of those local instructions.</p></div><div className="patterns-growth"><span>GENERATION</span><div><small>0</small><b>{selected.axiom}</b></div><div><small>1</small><b>{selected.rule.split("->")[1]?.trim()}</b></div><div><small>2</small><b>REWRITE AGAIN</b></div><div><small>{iterations}</small><b>REPEAT THE RULE</b></div><p>More generations can increase detail rapidly. This is why the generator caps the depth: the string can grow exponentially.</p></div></section>
  <section className="patterns-equation"><span className="equation-label">A SIMPLE GROWTH MODEL</span><div className="patterns-formula">S<sub>n+1</sub> = R(S<sub>n</sub>)</div><p>Here, S is the current string and R is the replacement operation. This is a deterministic rewriting system. The branching form is an L-system-inspired grammar; these examples are generative art rules, not a complete biological growth model.</p><div className="patterns-metrics"><div><b>{iterations}</b><span>GENERATIONS</span></div><div><b>{segmentCount.toLocaleString()}</b><span>DRAWING COMMANDS</span></div><div><b>{grammar.length.toLocaleString()}</b><span>SYMBOLS IN STRING</span></div></div></section>
  <footer className="patterns-footnote"><span>GENERATIVE SYSTEMS / L-SYSTEMS</span><span>RULES → REPETITION → STRUCTURE</span></footer>
 </section>;
}
