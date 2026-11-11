import { useCallback, useEffect, useRef, useState } from "react";
import { Download, Trash2, Undo2 } from "lucide-react";
import "./art.css";
import { usePersistentState } from "./usePersistentState";

type Point={x:number;y:number};
type Stroke={points:Point[];color:string;width:number;symmetry:number;mirror:boolean;echoDepth:number;echoScale:number;echoTwist:number};
const palettes=[
 {name:"Glacier",colors:["#e8f1ff","#9db8e8","#6683bd","#b5a7e8"]},
 {name:"Ember",colors:["#fff0d6","#e9a66d","#cf6c55","#9b5276"]},
 {name:"Forest",colors:["#e2edcf","#a9c58b","#658e78","#c0b6dc"]},
 {name:"Monochrome",colors:["#f4f1e9","#c5c5c5","#858b98","#4b5364"]}
];
export default function ArtExperience(){
 const canvas=useRef<HTMLCanvasElement>(null);
 const [storedStrokes,setStrokes]=usePersistentState<Stroke[]>("art:strokes",[]);
 const strokes:Stroke[]=Array.isArray(storedStrokes)?storedStrokes.filter((s:any)=>!!s&&Array.isArray(s.points)&&typeof s.color==="string"&&Number.isFinite(s.width)&&Number.isFinite(s.symmetry)&&typeof s.mirror==="boolean"&&s.points.every((p:any)=>p&&Number.isFinite(p.x)&&Number.isFinite(p.y))).map((s:any)=>({...s,echoDepth:Number.isFinite(s.echoDepth)?Math.max(1,Math.min(8,s.echoDepth)):1,echoScale:Number.isFinite(s.echoScale)?Math.max(35,Math.min(90,s.echoScale)):70,echoTwist:Number.isFinite(s.echoTwist)?Math.max(-180,Math.min(180,s.echoTwist)):24})):[];
 const [color,setColor]=usePersistentState("art:color",palettes[0].colors[0]);
 const [palette,setPalette]=usePersistentState("art:palette",0);
 const [width,setWidth]=usePersistentState("art:width",3);
 const [symmetry,setSymmetry]=usePersistentState("art:symmetry",8);
 const [mirror,setMirror]=usePersistentState("art:mirror",true);\n const [echoDepth,setEchoDepth]=usePersistentState("art:echoDepth",1);\n const [echoScale,setEchoScale]=usePersistentState("art:echoScale",70);\n const [echoTwist,setEchoTwist]=usePersistentState("art:echoTwist",24);
 const [drawing,setDrawing]=useState(false);
 const [showMath,setShowMath]=usePersistentState("art:showMath",false);
 const safePalette=Number.isInteger(palette)&&palette>=0&&palette<palettes.length?palette:0;
 const safeSymmetry=Number.isFinite(symmetry)?Math.max(1,Math.min(24,symmetry)):8;
 const safeWidth=Number.isFinite(width)?Math.max(1,Math.min(14,width)):3;\n const safeEchoDepth=Number.isFinite(echoDepth)?Math.max(1,Math.min(8,echoDepth)):1;\n const safeEchoScale=Number.isFinite(echoScale)?Math.max(35,Math.min(90,echoScale)):70;\n const safeEchoTwist=Number.isFinite(echoTwist)?Math.max(-180,Math.min(180,echoTwist)):24;
 const active=useRef<Stroke|null>(null);
 const redraw=useCallback(()=>{
  const el=canvas.current;if(!el)return;
  const rect=el.getBoundingClientRect(),dpr=Math.min(window.devicePixelRatio||1,2);
  if(!rect.width||!rect.height)return;
  const w=Math.round(rect.width*dpr),h=Math.round(rect.height*dpr);
  if(el.width!==w||el.height!==h){el.width=w;el.height=h;}
  const ctx=el.getContext("2d");if(!ctx)return;
  ctx.setTransform(dpr,0,0,dpr,0,0);ctx.fillStyle="#080a10";ctx.fillRect(0,0,rect.width,rect.height);
  const cx=rect.width/2,cy=rect.height/2;
  const paint=(stroke:Stroke)=>{
   if(stroke.points.length===0)return;
   const copies=stroke.symmetry*(stroke.mirror?2:1);
   for(let level=0;level<stroke.echoDepth;level++){
    const scale=Math.pow(stroke.echoScale/100,level);
    const twist=stroke.echoTwist*level*Math.PI/180;
    for(let k=0;k<copies;k++){
     const reflected=k>=stroke.symmetry,angle=(k%stroke.symmetry)*Math.PI*2/stroke.symmetry+twist;
     const transform=(p:Point):Point=>{
      const x=(p.x-.5)*rect.width*scale*(reflected?-1:1),y=(p.y-.5)*rect.height*scale;
      return {x:cx+x*Math.cos(angle)-y*Math.sin(angle),y:cy+x*Math.sin(angle)+y*Math.cos(angle)};
     };
     ctx.beginPath();const first=transform(stroke.points[0]);ctx.moveTo(first.x,first.y);
     if(stroke.points.length===1){ctx.lineTo(first.x+.1,first.y+.1);}
     else for(let i=1;i<stroke.points.length;i++){const p=transform(stroke.points[i]);ctx.lineTo(p.x,p.y);}
     ctx.strokeStyle=stroke.color;ctx.lineWidth=Math.max(.45,stroke.width*scale);ctx.lineCap="round";ctx.lineJoin="round";ctx.stroke();
    }
   }
  };
  strokes.forEach(paint);if(active.current)paint(active.current);
 },[strokes]);
 useEffect(()=>{redraw();const el=canvas.current;if(!el)return;if(typeof ResizeObserver==="undefined"){window.addEventListener("resize",redraw);return()=>window.removeEventListener("resize",redraw);}const observer=new ResizeObserver(redraw);observer.observe(el);return()=>observer.disconnect();},[redraw]);
 const point=(e:React.PointerEvent<HTMLCanvasElement>):Point=>{
  const r=e.currentTarget.getBoundingClientRect();return {x:(e.clientX-r.left)/r.width,y:(e.clientY-r.top)/r.height};
 };
 const start=(e:React.PointerEvent<HTMLCanvasElement>)=>{e.currentTarget.setPointerCapture(e.pointerId);active.current={points:[point(e)],color,width:safeWidth,symmetry:safeSymmetry,mirror,echoDepth:safeEchoDepth,echoScale:safeEchoScale,echoTwist:safeEchoTwist};setDrawing(true);redraw();};
 const move=(e:React.PointerEvent<HTMLCanvasElement>)=>{if(!active.current)return;active.current={...active.current,points:[...active.current.points,point(e)]};redraw();};
 const end=()=>{if(!active.current)return;setStrokes(old=>[...(Array.isArray(old)?old:[]),active.current as Stroke]);active.current=null;setDrawing(false);};
 const undo=()=>setStrokes(old=>(Array.isArray(old)?old:[]).slice(0,-1));
 const clear=()=>{active.current=null;setStrokes([]);setDrawing(false);};
 const exportImage=()=>{const el=canvas.current;if(!el)return;const a=document.createElement("a");a.download="beyond-art-study.png";a.href=el.toDataURL("image/png");a.click();};
 const choosePalette=(i:number)=>{const next=Math.max(0,Math.min(palettes.length-1,i));setPalette(next);setColor(palettes[next].colors[0]);};
 return <section className="art-experience">
  <header className="art-heading"><span className="equation-label">BEYOND FIELD NOTE / 007</span><h1>Make a mark.<br/><em>Discover its world.</em></h1><p>A drawing instrument built around symmetry. Make one gesture and let a mathematical rule repeat it through space. The result is yours to shape, inspect and keep.</p></header>
  <div className="art-studio">
   <div className="art-canvas-panel"><div className="art-canvas-top"><span>LIVE CANVAS / ROTATIONAL SYMMETRY</span><span>{strokes.length} MARKS</span></div><canvas ref={canvas} className="art-canvas" aria-label="Interactive rotational symmetry drawing canvas" onPointerDown={start} onPointerMove={move} onPointerUp={end} onPointerCancel={end} onLostPointerCapture={end}/><div className="art-canvas-bottom"><span>{drawing?"DRAWING IN PROGRESS":"TOUCH OR DRAG TO DRAW"}</span><div><button onClick={undo} disabled={!strokes.length}><Undo2 size={13}/> UNDO</button><button onClick={clear}><Trash2 size={13}/> CLEAR</button><button onClick={exportImage}><Download size={13}/> EXPORT</button></div></div></div>
   <aside className="art-controls"><span className="equation-label">COMPOSITION RULES</span>
    <div className="art-control-group"><label>ROTATIONAL COPIES <output>{symmetry}</output></label><input type="range" min="1" max="24" value={safeSymmetry} onChange={e=>setSymmetry(+e.target.value)}/><div className="art-hint">One stroke, repeated around a shared centre.</div></div>
    <button className={"art-toggle "+(mirror?"selected":"")} onClick={()=>setMirror(v=>!v)}><span>REFLECT EACH COPY</span><b>{mirror?"ON":"OFF"}</b></button>
    <div className="art-control-group"><label>SELF-SIMILAR ECHOES <output>{safeEchoDepth} LAYERS</output></label><input type="range" min="1" max="8" value={safeEchoDepth} onChange={e=>setEchoDepth(+e.target.value)}/><div className="art-hint">Repeat each mark at a smaller scale around the same centre.</div></div>
    <div className="art-control-group"><label>ECHO SCALE <output>{safeEchoScale}%</output></label><input type="range" min="35" max="90" value={safeEchoScale} onChange={e=>setEchoScale(+e.target.value)}/></div>
    <div className="art-control-group"><label>ROTATIONAL TWIST <output>{safeEchoTwist}°</output></label><input type="range" min="-180" max="180" value={safeEchoTwist} onChange={e=>setEchoTwist(+e.target.value)}/></div>
    <div className="art-control-group"><label>BRUSH WIDTH <output>{width}px</output></label><input type="range" min="1" max="14" value={safeWidth} onChange={e=>setWidth(+e.target.value)}/></div>
    <div className="art-control-group"><label>COLOUR SYSTEM</label><div className="art-palette-tabs">{palettes.map((p,i)=><button key={p.name} className={safePalette===i?"selected":""} onClick={()=>choosePalette(i)}>{p.name}</button>)}</div><div className="art-swatches">{palettes[safePalette].colors.map(c=><button key={c} aria-label={"Choose "+c} className={color===c?"chosen":""} style={{background:c}} onClick={()=>setColor(c)}/>)}</div></div>
    <button className="art-math-toggle" onClick={()=>setShowMath(v=>!v)}>{showMath?"HIDE THE MATHEMATICS":"WHY DOES THIS MAKE SYMMETRY?"}<span>{showMath?"−":"+"}</span></button>
    {showMath&&<div className="art-math"><div className="art-formula">R(θ) = <span>[ cosθ  −sinθ<br/>sinθ   cosθ ]</span></div><p>Each copy is a rotation of your original stroke around the canvas centre. For <i>n</i> copies, the angle between copies is θ = 2π/n. Reflection adds a mirrored set.</p><p>The rotations form the cyclic symmetry group C<sub>n</sub>. With reflections, the full symmetry is related to the dihedral group D<sub>n</sub>.</p><p>Self-similar echoes add a sequence of scaled copies. At level k, the scale is s<sup>k</sup> and the added rotation is kφ. This is a finite transformation sequence, not an infinite fractal.</p></div>}
   </aside>
  </div>
  <section className="art-principle"><div><span className="equation-label">THE UNDERLYING STRUCTURE</span><h2>One gesture.<br/><em>Many relationships.</em></h2><p>Symmetry is an invariance: a transformation changes the arrangement while preserving a chosen property. Here, rotation moves each copy but preserves its shape, colour and distance from the centre.</p></div><div className="art-principle-note"><b>TRY THIS</b><p>Start with 6 copies and draw a curved line. Increase to 12 without changing the line. Notice how the composition changes even though the original gesture stays the same.</p><p>Turn reflection off. You have changed the symmetry group, not just the decoration.</p></div></section>
  <footer className="art-foot"><span>GENERATIVE ART / GROUP SYMMETRY</span><span>GESTURE → TRANSFORMATION → COMPOSITION</span></footer>
 </section>;
}
