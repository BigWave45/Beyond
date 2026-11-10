import { useEffect, useRef, useState, type PointerEvent } from "react";
import { RotateCcw, Move3D } from "lucide-react";
import "./dimensions.css";

type V4=[number,number,number,number];
type P2={x:number;y:number;depth:number;w:number};
const vertices:V4[]=Array.from({length:16},(_,i)=>[
  i&1?1:-1,i&2?1:-1,i&4?1:-1,i&8?1:-1
]);
const edges=vertices.flatMap((v,i)=>vertices.flatMap((w,j)=>
  j>i&&v.filter((n,k)=>n!==w[k]).length===1?[[i,j] as [number,number]]:[]
));

function rotatePlane(v:V4,a:number,b:number,t:number):V4{
 const out:[number,number,number,number]=[...v];
 const c=Math.cos(t),s=Math.sin(t),x=v[a],y=v[b];
 out[a]=x*c-y*s;out[b]=x*s+y*c;return out;
}
function project(v:V4,angles:number[]):P2{
 let p=v;
 p=rotatePlane(p,0,3,angles[0]);
 p=rotatePlane(p,1,3,angles[1]);
 p=rotatePlane(p,2,3,angles[2]);
 p=rotatePlane(p,0,1,angles[3]);
 const wDistance=3.8;
 const factor4=wDistance/(wDistance-p[3]);
 const x=p[0]*factor4,y=p[1]*factor4,z=p[2]*factor4;
 const camera=5.5/(5.5-z);
 return {x:x*camera,y:y*camera,depth:z,w:p[3]};
}

export default function DimensionsExperience(){
 const canvasRef=useRef<HTMLCanvasElement>(null);
 const drag=useRef<{x:number;y:number;a:number;b:number}|null>(null);
 const [angles,setAngles]=useState([.35,.55,.15,0]);
 const [projection,setProjection]=useState<"perspective"|"orthographic">("perspective");
 const [labels,setLabels]=useState(false);
 const [dragging,setDragging]=useState(false);
 useEffect(()=>{
  const canvas=canvasRef.current,ctx=canvas?.getContext("2d");
  if(!canvas||!ctx)return;
  const w=canvas.width,h=canvas.height,cx=w/2,cy=h/2;
  ctx.clearRect(0,0,w,h);
  const points=vertices.map(v=>project(v,angles));
  const projected=points.map(p=>{
   const scale=projection==="perspective"?1:1/(1+Math.abs(p.depth)*.12);
   return {x:cx+p.x*112*scale,y:cy+p.y*112*scale,depth:p.depth,w:p.w};
  });
  const ordered=edges.map(([a,b])=>({a:projected[a],b:projected[b],depth:(projected[a].depth+projected[b].depth)/2})).sort((a,b)=>a.depth-b.depth);
  for(const line of ordered){
   const alpha=.25+Math.max(0,Math.min(1,(line.depth+2.5)/5))*.55;
   ctx.beginPath();ctx.moveTo(line.a.x,line.a.y);ctx.lineTo(line.b.x,line.b.y);
   ctx.strokeStyle="rgba(184,198,229,"+alpha+")";ctx.lineWidth=1.1;ctx.stroke();
  }
  projected.forEach((p,i)=>{
   const r=2.8+Math.max(0,p.w)*.8;
   ctx.beginPath();ctx.arc(p.x,p.y,r,0,Math.PI*2);
   ctx.fillStyle=p.w>0?"#e6e9f0":"#9caac9";ctx.fill();
   if(labels){ctx.font="10px ui-monospace,monospace";ctx.fillStyle="rgba(225,230,241,.8)";ctx.fillText("v"+i,p.x+7,p.y-7);}
  });
 },[angles,projection,labels]);
 const down=(e:PointerEvent<HTMLCanvasElement>)=>{
  e.currentTarget.setPointerCapture(e.pointerId);
  drag.current={x:e.clientX,y:e.clientY,a:angles[0],b:angles[1]};setDragging(true);
 };
 const move=(e:PointerEvent<HTMLCanvasElement>)=>{
  if(!drag.current)return;
  const dx=e.clientX-drag.current.x,dy=e.clientY-drag.current.y;
  setAngles(old=>{const next=[...old];next[0]=drag.current!.a+dy*.009;next[1]=drag.current!.b+dx*.009;return next;});
 };
 const up=()=>{drag.current=null;setDragging(false);};
 const reset=()=>setAngles([.35,.55,.15,0]);
 const updateAngle=(i:number,value:number)=>setAngles(old=>old.map((a,j)=>i===j?value:a));
 return <section className="dimensions-experience">
  <div className="dimensions-heading"><span className="equation-label">BEYOND FIELD NOTE / 003</span><h1>What does a shape<br/><em>look like beyond space?</em></h1><p>A tesseract is a four-dimensional analogue of a cube. We cannot look at four spatial dimensions directly, but we can study their geometry through projections and rotations.</p></div>
  <div className="dimensions-lab">
   <div className="dimensions-visual">
    <div className="dimensions-visual-head"><span>4D OBJECT / PROJECTED INTO 2D</span><span>16 VERTICES · 32 EDGES</span></div>
    <canvas ref={canvasRef} width={700} height={500} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} style={{touchAction:"none",cursor:dragging?"grabbing":"grab"}} aria-label="Interactive projection of a tesseract. Drag to rotate it through four-dimensional rotation planes."/>
    <div className="dimensions-visual-foot"><span><Move3D size={13}/> DRAG TO ROTATE</span><button onClick={reset}><RotateCcw size={13}/> RESET VIEW</button></div>
   </div>
   <div className="dimensions-controls">
    <span className="equation-label">ROTATION CONTROLS</span>
    <p>In three dimensions, rotation happens in a plane. Four dimensions have six independent rotation planes. Explore the three planes that mix each spatial axis with the fourth axis.</p>
    {[["XW","Rotate across X and W"],["YW","Rotate across Y and W"],["ZW","Rotate across Z and W"],["XY","Rotate within the visible plane"]].map(([name,description],i)=><label className="dimension-slider" key={name}><span><b>{name}</b><small>{description}</small></span><output>{(angles[i]*180/Math.PI).toFixed(0)}°</output><input type="range" min="-3.14" max="3.14" step=".01" value={angles[i]} onChange={e=>updateAngle(i,+e.target.value)}/></label>)}
    <div className="dimension-options"><span>PROJECTION</span><div><button className={projection==="perspective"?"active":""} onClick={()=>setProjection("perspective")}>PERSPECTIVE</button><button className={projection==="orthographic"?"active":""} onClick={()=>setProjection("orthographic")}>ORTHOGRAPHIC</button></div><label><input type="checkbox" checked={labels} onChange={e=>setLabels(e.target.checked)}/> Show vertex labels</label></div>
   </div>
  </div>
  <section className="dimension-reading">
   <div><span className="equation-label">BUILD THE IDEA</span><h2>From a point<br/>to a <em>hypercube.</em></h2><p>Each new dimension doubles the number of vertices. A line segment has two endpoints. A square has four vertices. A cube has eight. A tesseract has sixteen.</p></div>
   <div className="dimension-sequence">{[{n:"0D",name:"Point",v:"1 vertex"},{n:"1D",name:"Line",v:"2 vertices"},{n:"2D",name:"Square",v:"4 vertices"},{n:"3D",name:"Cube",v:"8 vertices"},{n:"4D",name:"Tesseract",v:"16 vertices"}].map((d,i)=><div key={d.n} className={i===4?"current":""}><span>{d.n}</span><b>{d.name}</b><small>{d.v}</small></div>)}</div>
  </section>
  <section className="dimension-math"><span className="equation-label">THE STRUCTURE UNDERNEATH</span><div className="dimension-formula">V(n) = 2<sup>n</sup></div><p>For an n-dimensional cube, each coordinate can be either −1 or +1. There are two choices for each of n coordinates, giving 2ⁿ vertices. An edge connects two vertices that differ in exactly one coordinate.</p><div className="dimension-counts"><div><b>16</b><span>VERTICES</span><small>2⁴</small></div><div><b>32</b><span>EDGES</span><small>4 × 2³</small></div><div><b>24</b><span>SQUARE FACES</span><small>6 × 2²</small></div><div><b>8</b><span>CUBICAL CELLS</span><small>2³</small></div></div><small className="dimension-caveat">The image is a projection. Overlapping lines and changing apparent lengths are effects of projection, not evidence that the tesseract is physically folding or passing through itself.</small></section>
  <footer className="dimensions-footnote"><span>HIGHER-DIMENSIONAL GEOMETRY</span><span>4D ROTATION · 4D TO 3D TO 2D PROJECTION</span></footer>
 </section>;
}
