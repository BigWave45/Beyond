import { useEffect, useRef, useState, type PointerEvent } from "react";
import { ArrowDownLeft, Minus, Plus, RotateCcw } from "lucide-react";
import "./infinity.css";

type Point = { x: number; y: number; iterations: number; escaped: boolean };

const WIDTH = 420;
const HEIGHT = 315;
const landmarks = [
  { name: "THE WHOLE SET", x: -0.5, y: 0, zoom: 1, note: "The full boundary, with its main cardioid and attached circular bulbs." },
  { name: "SEAHORSE VALLEY", x: -0.75, y: 0.1, zoom: 7, note: "A region where spirals and tiny copies gather around a narrow valley." },
  { name: "THE LEFT BULB", x: -1.75, y: 0, zoom: 5, note: "A large circular component attached to the main body." },
  { name: "THE CUSP", x: 0.25, y: 0, zoom: 8, note: "The pointed right edge of the main cardioid." }
];

function escapePoint(cx: number, cy: number, limit: number): Point {
  let x = 0, y = 0, n = 0;
  while (x*x + y*y <= 256 && n < limit) {
    const nextX = x*x - y*y + cx;
    y = 2*x*y + cy;
    x = nextX;
    n++;
  }
  return { x: cx, y: cy, iterations: n, escaped: n < limit };
}

export default function InfinityExperience() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dragRef = useRef<{x:number;y:number;cx:number;cy:number;distance:number}|null>(null);
  const [center,setCenter] = useState({x:-0.5,y:0});
  const [zoom,setZoom] = useState(1);
  const [iterations,setIterations] = useState(90);
  const [selected,setSelected] = useState<Point|null>(null);
  const [landmark,setLandmark] = useState(0);
  const [dragging,setDragging] = useState(false);

  const span = 3.5 / zoom;
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const image = ctx.createImageData(WIDTH,HEIGHT);
    for (let py=0;py<HEIGHT;py++) {
      const cy=center.y + (py/HEIGHT-.5)*span;
      for (let px=0;px<WIDTH;px++) {
        const cx=center.x + (px/WIDTH-.5)*span*(WIDTH/HEIGHT);
        let x=0,y=0,n=0;
        while (x*x+y*y<=256 && n<iterations) {
          const nx=x*x-y*y+cx;
          y=2*x*y+cy; x=nx; n++;
        }
        const i=(py*WIDTH+px)*4;
        if(n===iterations){ image.data[i]=5; image.data[i+1]=7; image.data[i+2]=12; }
        else {
          const smooth=n+1-Math.log2(Math.max(1,Math.log2(Math.sqrt(x*x+y*y))));
          const t=Math.max(0,Math.min(1,smooth/iterations));
          image.data[i]=Math.round(15+35*t);
          image.data[i+1]=Math.round(24+75*t);
          image.data[i+2]=Math.round(42+145*t);
        }
        image.data[i+3]=255;
      }
    }
    ctx.putImageData(image,0,0);
    if(selected){
      const sx=(selected.x-center.x)/(span*WIDTH/HEIGHT)+.5;
      const sy=(selected.y-center.y)/span+.5;
      if(sx>=0&&sx<=1&&sy>=0&&sy<=1){
        ctx.beginPath();ctx.arc(sx*WIDTH,sy*HEIGHT,5,0,Math.PI*2);
        ctx.strokeStyle="#f1eee7";ctx.lineWidth=1.5;ctx.stroke();
        ctx.beginPath();ctx.moveTo(sx*WIDTH-10,sy*HEIGHT);ctx.lineTo(sx*WIDTH+10,sy*HEIGHT);
        ctx.moveTo(sx*WIDTH,sy*HEIGHT-10);ctx.lineTo(sx*WIDTH,sy*HEIGHT+10);ctx.stroke();
      }
    }
  },[center,zoom,iterations,selected,span]);

  const pointAt=(e:PointerEvent<HTMLCanvasElement>)=>{
    const rect=e.currentTarget.getBoundingClientRect();
    const px=(e.clientX-rect.left)/rect.width, py=(e.clientY-rect.top)/rect.height;
    return {x:center.x+(px-.5)*span*(WIDTH/HEIGHT),y:center.y+(py-.5)*span};
  };
  const down=(e:PointerEvent<HTMLCanvasElement>)=>{
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current={x:e.clientX,y:e.clientY,cx:center.x,cy:center.y,distance:0};
    setDragging(false);
  };
  const move=(e:PointerEvent<HTMLCanvasElement>)=>{
    if(!dragRef.current)return;
    const rect=e.currentTarget.getBoundingClientRect();
    const dx=e.clientX-dragRef.current.x,dy=e.clientY-dragRef.current.y;
    dragRef.current.distance=Math.max(dragRef.current.distance,Math.hypot(dx,dy));
    if(dragRef.current.distance>5){
      setDragging(true);
      setCenter({x:dragRef.current.cx-dx/rect.width*span*(WIDTH/HEIGHT),y:dragRef.current.cy-dy/rect.height*span});
    }
  };
  const up=(e:PointerEvent<HTMLCanvasElement>)=>{
    const drag=dragRef.current;
    if(drag&&drag.distance<=5){
      const p=pointAt(e);setSelected(escapePoint(p.x,p.y,iterations));
      setCenter({x:p.x,y:p.y});setZoom(z=>Math.min(1e8,z*2));
    }
    dragRef.current=null;setDragging(false);
  };
  const reset=()=>{setCenter({x:-.5,y:0});setZoom(1);setSelected(null);setLandmark(0);};
  const chooseLandmark=(i:number)=>{
    const p=landmarks[i];setCenter({x:p.x,y:p.y});setZoom(p.zoom);setSelected(null);setLandmark(i);
  };
  const zoomBy=(factor:number)=>setZoom(z=>Math.max(1,Math.min(1e8,z*factor)));

  return <section className="infinity-experience">
    <div className="infinity-heading"><span className="equation-label">BEYOND FIELD NOTE / 002</span><h1>How much detail<br/><em>can infinity contain?</em></h1><p>A short equation creates a boundary that never stops revealing structure. Explore the Mandelbrot set: a mathematical object generated by repeating one rule.</p></div>
    <div className="infinity-equation"><span>THE RULE</span><strong>z<sub>n+1</sub> = z<sub>n</sub><sup>2</sup> + c</strong><small>Start with z = 0. Feed the result back into the same equation. Repeat.</small></div>
    <div className="infinity-explorer">
      <div className="infinity-canvas-wrap">
        <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={()=>{dragRef.current=null;setDragging(false);}} style={{touchAction:"none",cursor:dragging?"grabbing":"crosshair"}} aria-label="Interactive Mandelbrot set. Tap to zoom into a location or drag to move around."/>
        <div className="infinity-canvas-label"><span>MANDELBROT SET / ESCAPE-TIME VIEW</span><span>{zoom.toFixed(zoom<100?1:0)}×</span></div>
        <div className="infinity-coordinates">CENTER {center.x.toFixed(6)} {center.y<0?"−":"+"} {Math.abs(center.y).toFixed(6)}i</div>
      </div>
      <div className="infinity-tools">
        <div className="infinity-tool-head"><span>MOVE THROUGH THE SET</span><button onClick={reset}><RotateCcw size={13}/> RESET</button></div>
        <p>Tap the image to zoom in. Drag to move. Each tap selects a complex number and applies the rule repeatedly.</p>
        <div className="infinity-zoom"><button onClick={()=>zoomBy(.5)} aria-label="Zoom out"><Minus/></button><span>{zoom>=1000?zoom.toExponential(1):zoom.toFixed(1)}×</span><button onClick={()=>zoomBy(2)} aria-label="Zoom in"><Plus/></button></div>
        <label className="infinity-slider"><span>ITERATION LIMIT <b>{iterations}</b></span><input type="range" min="30" max="240" step="10" value={iterations} onChange={e=>setIterations(+e.target.value)}/><small>More iterations reveal finer boundary detail, at a higher computational cost.</small></label>
        <div className="infinity-landmarks"><span>PLACES TO VISIT</span>{landmarks.map((p,i)=><button key={p.name} className={landmark===i?"active":""} onClick={()=>chooseLandmark(i)}><span>{String(i+1).padStart(2,"0")}</span>{p.name}<ArrowDownLeft size={14}/></button>)}</div>
        <div className="infinity-location-note">{landmarks[landmark].note}</div>
      </div>
    </div>
    <section className="infinity-reading">
      <div><span className="equation-label">WHAT THE EQUATION IS DOING</span><h2>One rule.<br/><em>Many possible outcomes.</em></h2><p>The variable c is a complex number: it has a real part and an imaginary part. Each pixel represents one possible value of c. We repeatedly apply the equation, starting at z = 0.</p></div>
      <div className="infinity-concepts"><article><b>01 / ITERATION</b><p>Iteration means applying the same rule again and again. The output of one step becomes the input of the next.</p></article><article><b>02 / ESCAPE</b><p>If the magnitude of z grows beyond 2, the sequence will escape to infinity. The pixel is outside the set.</p></article><article><b>03 / BOUNDARY</b><p>Points that do not escape within the chosen iteration limit are shown dark. This is an approximation: a finite computer cannot prove that a sequence never escapes.</p></article></div>
    </section>
    <section className="infinity-question"><span className="equation-label">A QUESTION TO INVESTIGATE</span><h2>What does a point <em>know about infinity?</em></h2><p>Select a point on the image. Its coordinate is substituted into c. The iteration count tells us how many steps it took to escape, if it escaped at all within the current limit.</p>{selected&&<div className="infinity-point-readout"><span>SELECTED COMPLEX NUMBER</span><strong>{selected.x.toFixed(7)} {selected.y<0?"−":"+"} {Math.abs(selected.y).toFixed(7)}i</strong><div><span>{selected.escaped?"ESCAPED AFTER":"DID NOT ESCAPE WITHIN"}</span><b>{selected.iterations} ITERATIONS</b></div><small>{selected.escaped?"This point lies outside the Mandelbrot set. The iteration count is a finite measure of how quickly this orbit escaped.":"This point has not escaped within the current iteration limit. That does not, by itself, prove it belongs to the set."}</small></div>}</section>
    <footer className="infinity-footnote"><span>COMPLEX DYNAMICS / MANDELBROT SET</span><span>FINITE ITERATION · INTERACTIVE EXPLORATION</span></footer>
  </section>;
}
