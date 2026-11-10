import { useEffect, useRef, useState, type PointerEvent } from "react";
import { ArrowDownLeft, Minus, Plus, RotateCcw, Crosshair } from "lucide-react";
import "./infinity.css";

type Point = { x:number; y:number; iterations:number; escaped:boolean };
type View = { x:number; y:number; zoom:number };
const landmarks=[
 {name:"THE WHOLE SET",x:-.5,y:0,zoom:1,note:"The main cardioid, its circular bulbs and the intricate boundary between escape and non-escape."},
 {name:"SEAHORSE VALLEY",x:-.75,y:.1,zoom:7,note:"Spiral filaments curl around a narrow valley. Small structures echo the geometry of the whole set."},
 {name:"THE ELEPHANT VALLEY",x:.28,y:0,zoom:3.2,note:"A busy boundary region where bulbs, spirals and miniature structures cluster."},
 {name:"THE PERIOD-2 BULB",x:-1,y:0,zoom:8,note:"The large bulb attached to the left of the main cardioid. Its orbit has period two."},
 {name:"THE DOUBLE SPIRAL",x:-.088,.654,y:35,note:"A detailed boundary region where filaments wind into a nested spiral."}
];

function orbit(cx:number,cy:number,limit:number):Point{
 let x=0,y=0,n=0;
 while(x*x+y*y<=4&&n<limit){const nx=x*x-y*y+cx;y=2*x*y+cy;x=nx;n++;}
 return{x:cx,y:cy,iterations:n,escaped:n<limit};
}
function colour(n:number,limit:number,x:number,y:number):[number,number,number]{
 if(n>=limit)return[4,6,12];
 const mag=Math.sqrt(x*x+y*y);
 const smooth=Math.max(0,n+1-Math.log2(Math.max(1e-12,Math.log2(Math.max(1.000001,mag)))));
 const t=smooth;
 const wave=(v:number)=>Math.round(128+127*Math.cos(.035*v));
 return[wave(t*1.0+18),wave(t*.78+105),wave(t*.62+205)];
}

export default function InfinityExperience(){
 const canvasRef=useRef<HTMLCanvasElement>(null);
 const wrapRef=useRef<HTMLDivElement>(null);
 const dragRef=useRef<{x:number;y:number;cx:number;cy:number;distance:number}|null>(null);
 const renderToken=useRef(0);
 const [view,setView]=useState<View>({x:-.5,y:0,zoom:1});
 const [iterations,setIterations]=useState(160);
 const [selected,setSelected]=useState<Point|null>(null);
 const [landmark,setLandmark]=useState(0);
 const [dragging,setDragging]=useState(false);
 const [rendering,setRendering]=useState(false);
 const [resolution,setResolution]=useState("—");
 const span=3.5/view.zoom;
 const limit=Math.min(1200,Math.max(iterations,Math.round(iterations+Math.log2(view.zoom+1)*28)));

 useEffect(()=>{
  const canvas=canvasRef.current,wrap=wrapRef.current;
  if(!canvas||!wrap)return;
  const token=++renderToken.current;
  let frame=0;
  const rect=wrap.getBoundingClientRect();
  const dpr=Math.min(window.devicePixelRatio||1,1.5);
  const w=Math.max(360,Math.min(900,Math.round(rect.width*dpr)));
  const h=Math.max(300,Math.min(680,Math.round(w*rect.height/Math.max(1,rect.width))));
  canvas.width=w;canvas.height=h;setResolution(`${w} × ${h}`);setRendering(true);
  const ctx=canvas.getContext("2d",{alpha:false});
  if(!ctx)return;
  const image=ctx.createImageData(w,h);
  let row=0;
  const draw=()=>{
   if(token!==renderToken.current)return;
   const end=Math.min(h,row+Math.max(2,Math.floor(14000/w)));
   for(let py=row;py<end;py++){
    const cy=view.y+(py/h-.5)*span;
    for(let px=0;px<w;px++){
     const cx=view.x+(px/w-.5)*span*(w/h);
     let x=0,y=0,n=0;
     while(x*x+y*y<=4&&n<limit){const nx=x*x-y*y+cx;y=2*x*y+cy;x=nx;n++;}
     const rgb=colour(n,limit,x,y),i=(py*w+px)*4;
     image.data[i]=rgb[0];image.data[i+1]=rgb[1];image.data[i+2]=rgb[2];image.data[i+3]=255;
    }
   }
   row=end;
   if(row<h){frame=requestAnimationFrame(draw);}
   else{ctx.putImageData(image,0,0);setRendering(false);}
  };
  frame=requestAnimationFrame(draw);
  return()=>{cancelAnimationFrame(frame);renderToken.current++;};
 },[view,span,limit]);

 useEffect(()=>{
  const el=wrapRef.current;if(!el)return;
  const observer=new ResizeObserver(()=>setResolution(v=>v+""));
  observer.observe(el);return()=>observer.disconnect();
 },[]);

 const pointAt=(e:PointerEvent<HTMLCanvasElement>)=>{
  const rect=e.currentTarget.getBoundingClientRect();
  const px=(e.clientX-rect.left)/rect.width,py=(e.clientY-rect.top)/rect.height;
  return{x:view.x+(px-.5)*span*(rect.width/rect.height),y:view.y+(py-.5)*span};
 };
 const down=(e:PointerEvent<HTMLCanvasElement>)=>{e.currentTarget.setPointerCapture(e.pointerId);dragRef.current={x:e.clientX,y:e.clientY,cx:view.x,cy:view.y,distance:0};setDragging(false);};
 const move=(e:PointerEvent<HTMLCanvasElement>)=>{
  const d=dragRef.current;if(!d)return;
  const rect=e.currentTarget.getBoundingClientRect(),dx=e.clientX-d.x,dy=e.clientY-d.y;
  d.distance=Math.max(d.distance,Math.hypot(dx,dy));
  if(d.distance>5){setDragging(true);setView(v=>({...v,x:d.cx-dx/rect.width*span*(rect.width/rect.height),y:d.cy-dy/rect.height*span}));}
 };
 const up=(e:PointerEvent<HTMLCanvasElement>)=>{
  const d=dragRef.current;
  if(d&&d.distance<=5){const p=pointAt(e);setSelected(orbit(p.x,p.y,limit));setView(v=>({x:p.x,y:p.y,zoom:Math.min(1e12,v.zoom*2)}));setLandmark(-1);}
  dragRef.current=null;setDragging(false);
 };
 const reset=()=>{setView({x:-.5,y:0,zoom:1});setSelected(null);setLandmark(0);};
 const choose=(i:number)=>{const p=landmarks[i];setView({x:p.x,y:p.y,zoom:p.zoom});setSelected(null);setLandmark(i);};
 const zoomBy=(factor:number)=>setView(v=>({...v,zoom:Math.max(1,Math.min(1e12,v.zoom*factor))}));
 const zoomAtCenter=(factor:number)=>zoomBy(factor);

 return <section className="infinity-experience">
  <div className="infinity-heading"><span className="equation-label">BEYOND FIELD NOTE / 002</span><h1>How much detail<br/><em>can infinity contain?</em></h1><p>A boundary generated by one repeated rule. Every point is a test: does its orbit remain bounded, or escape? Explore the actual Mandelbrot set, computed from complex iteration.</p></div>
  <div className="infinity-equation"><span>THE ITERATION</span><strong>z<sub>n+1</sub> = z<sub>n</sub><sup>2</sup> + c</strong><small>For each complex c, begin at z₀ = 0 and feed each result back into the rule.</small></div>
  <div className="infinity-explorer">
   <div className="infinity-canvas-wrap" ref={wrapRef}>
    <canvas ref={canvasRef} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={()=>{dragRef.current=null;setDragging(false);}} style={{touchAction:"none",cursor:dragging?"grabbing":"crosshair"}} aria-label="Computed Mandelbrot set. Tap to zoom and inspect an orbit. Drag to pan."/>
    <div className="infinity-canvas-label"><span>COMPLEX PLANE / ESCAPE-TIME COLOURING</span><span>{view.zoom.toFixed(view.zoom<100?1:0)}×</span></div>
    <div className="infinity-coordinates">c = {view.x.toFixed(7)} {view.y<0?"−":"+"} {Math.abs(view.y).toFixed(7)}i</div>
    <div className="infinity-render-status">{rendering?"COMPUTING ORBITS…":`RENDERED · ${resolution}`}</div>
   </div>
   <div className="infinity-tools">
    <div className="infinity-tool-head"><span>EXPLORE THE COMPLEX PLANE</span><button onClick={reset}><RotateCcw size={13}/> RESET</button></div>
    <p>Tap to inspect a coordinate and zoom into it. Drag to travel. The image is recalculated from the equation at every view, not enlarged from a fixed picture.</p>
    <div className="infinity-zoom"><button onClick={()=>zoomAtCenter(.5)} aria-label="Zoom out"><Minus/></button><span>{view.zoom>=1000?view.zoom.toExponential(2):view.zoom.toFixed(1)}×</span><button onClick={()=>zoomAtCenter(2)} aria-label="Zoom in"><Plus/></button></div>
    <label className="infinity-slider"><span>BASE ITERATION BUDGET <b>{iterations}</b></span><input type="range" min="80" max="600" step="20" value={iterations} onChange={e=>setIterations(+e.target.value)}/><small>Near the boundary, the renderer automatically increases the iteration budget as you zoom in. Higher limits reveal slower-escaping orbits.</small></label>
    <div className="infinity-landmarks"><span>PLACES TO INVESTIGATE</span>{landmarks.slice(0,4).map((p,i)=><button key={p.name} className={landmark===i?"active":""} onClick={()=>choose(i)}><span>{String(i+1).padStart(2,"0")}</span>{p.name}<ArrowDownLeft size={14}/></button>)}</div>
    <div className="infinity-location-note">{landmark>=0?landmarks[landmark].note:"You are exploring freely. Choose a landmark to return to a known region."}</div>
   </div>
  </div>
  <section className="infinity-reading"><div><span className="equation-label">THE MATHEMATICAL OBJECT</span><h2>One rule.<br/><em>Infinitely many tests.</em></h2><p>The complex number c determines the orbit. Each pixel is a different c. The set contains the values for which the orbit starting at zero stays bounded.</p></div><div className="infinity-concepts"><article><b>01 / COMPLEX NUMBER</b><p>c = a + bi. The horizontal axis is the real part; the vertical axis is the imaginary part. Together they form the complex plane.</p></article><article><b>02 / ORBIT</b><p>An orbit is the sequence z₀, z₁, z₂… generated by repeatedly applying the same function. If its magnitude exceeds 2, it will escape.</p></article><article><b>03 / BOUNDARY</b><p>Escaping points are outside the set. Points that have not escaped by our finite limit are unresolved, not proven members. More iterations refine the picture.</p></article></div></section>
  <section className="infinity-question"><span className="equation-label">INSPECT A SINGLE POINT</span><h2>Where does its <em>orbit go?</em></h2><p>Tap a location. We will report its complex coordinate and iterate z² + c from zero. This is a finite numerical test, not a proof of membership.</p>{selected&&<div className="infinity-point-readout"><span>SELECTED c</span><strong>{selected.x.toFixed(9)} {selected.y<0?"−":"+"} {Math.abs(selected.y).toFixed(9)}i</strong><div><span>{selected.escaped?"ORBIT ESCAPED":"NOT ESCAPED WITHIN LIMIT"}</span><b>{selected.iterations} ITERATIONS</b></div><small>{selected.escaped?"The orbit crossed the escape radius |z| = 2. This coordinate is outside the Mandelbrot set.":"The orbit remained within the escape radius for the tested iterations. This alone cannot prove it remains bounded forever."}</small></div>}</section>
  <footer className="infinity-footnote"><span>COMPLEX DYNAMICS / MANDELBROT SET</span><span>LIVE NUMERICAL RENDER · FINITE PRECISION</span></footer>
 </section>;
}
