import { useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import { Pause, Play, RotateCcw, Waves, Bookmark, FlaskConical } from "lucide-react";
import "./emergence.css";

const N = 176, DU = 0.16, DV = 0.08;
const presets = [
  {name:"Spots",f:0.055,k:0.062,description:"Separated activator-rich regions form against a quieter background. Watch for spots that persist, merge or split.",question:"Do the spots stay isolated as you increase feed?",hypothesis:"More feed replenishes U. That can sustain more reaction, but the final pattern depends on kill rate and the initial field."},
  {name:"Labyrinths",f:0.029,k:0.057,description:"Connected bands compete for space. The field can organise into winding, maze-like structures.",question:"At what point do connected bands become disconnected?",hypothesis:"The balance between diffusion and reaction changes the width and connectivity of the bands."},
  {name:"Waves",f:0.018,k:0.051,description:"Excitation can propagate as fronts through the field. A local disturbance can become a travelling structure.",question:"Tap far from an existing front. Does the new disturbance travel?",hypothesis:"A travelling front requires local reaction to regenerate the activator faster than it is lost."},
  {name:"Splitting",f:0.0367,k:0.0649,description:"Some parameter combinations produce spots that elongate and divide into smaller structures.",question:"Can you observe a spot become unstable before it splits?",hypothesis:"Splitting is a dynamical instability. It is not programmed as an event; it arises from the local reaction-diffusion rules."}
];
type Params={feed:number;kill:number;paused:boolean};
type Sim={reset:()=>void;inject:(x:number,y:number)=>void};
type Sample={active:number;mean:number;edge:number};

function MiniChart({values}:{values:number[]}){
 const points=useMemo(()=>values.map((v,i)=>`${(i/Math.max(1,values.length-1))*100},${38-Math.max(0,Math.min(100,v))*0.34}`).join(" "),[values]);
 return <svg className="history-chart" viewBox="0 0 100 40" preserveAspectRatio="none" role="img" aria-label="Recent active field percentage over time"><line x1="0" y1="38" x2="100" y2="38"/><polyline points={points}/></svg>;
}

export default function Emergence(){
 const canvasRef=useRef<HTMLCanvasElement>(null);
 const sim=useRef<Sim|null>(null);
 const params=useRef<Params>({feed:0.055,kill:0.062,paused:false});
 const [feed,setFeed]=useState(0.055),[kill,setKill]=useState(0.062),[paused,setPaused]=useState(false);
 const [preset,setPreset]=useState(0),[stats,setStats]=useState<Sample>({active:0,mean:0,edge:0});
 const [step,setStep]=useState(0),[history,setHistory]=useState<number[]>([]);
 const [baseline,setBaseline]=useState({feed:0.055,kill:0.062});
 const [showModel,setShowModel]=useState(false);
 params.current={feed,kill,paused};
 const choose=(i:number)=>{setPreset(i);setFeed(presets[i].f);setKill(presets[i].k);setPaused(false);sim.current?.reset();setHistory([]);setStep(0);};
 const reset=()=>{sim.current?.reset();setPaused(false);setHistory([]);setStep(0);};
 useEffect(()=>{
  const canvas=canvasRef.current,ctx=canvas?.getContext("2d",{alpha:false}); if(!canvas||!ctx)return;
  canvas.width=N;canvas.height=N;const count=N*N;
  let u=new Float32Array(count),v=new Float32Array(count),nu=new Float32Array(count),nv=new Float32Array(count);
  const pixels=ctx.createImageData(N,N);let frame=0,iteration=0,raf=0;
  const seed=(cx:number,cy:number,r:number)=>{for(let y=-r;y<=r;y++)for(let x=-r;x<=r;x++){if(x*x+y*y>r*r)continue;const i=((cy+y+N)%N)*N+(cx+x+N)%N;u[i]=0.5;v[i]=0.25;}};
  const resetField=()=>{u.fill(1);v.fill(0);nu.fill(1);nv.fill(0);iteration=0;seed(88,88,10);seed(64,105,4);seed(117,68,5);setStats({active:0,mean:0,edge:0});setStep(0);setHistory([]);};
  const inject=(x:number,y:number)=>{const cx=Math.floor(x*N),cy=Math.floor(y*N);seed(cx,cy,5);};
  const lap=(a:Float32Array,x:number,y:number,i:number)=>{const l=y*N+(x+N-1)%N,r=y*N+(x+1)%N,t=((y+N-1)%N)*N+x,b=((y+1)%N)*N+x;const tl=((y+N-1)%N)*N+(x+N-1)%N,tr=((y+N-1)%N)*N+(x+1)%N,bl=((y+1)%N)*N+(x+N-1)%N,br=((y+1)%N)*N+(x+1)%N;return -a[i]+.2*(a[l]+a[r]+a[t]+a[b])+.05*(a[tl]+a[tr]+a[bl]+a[br]);};
  const render=()=>{let active=0,total=0,edges=0;for(let y=0;y<N;y++)for(let x=0;x<N;x++){const i=y*N+x,z=v[i],q=Math.max(0,Math.min(1,z*3.1));if(z>.08)active++;total+=z;if((z>.08)!==(v[y*N+(x+1)%N]>.08))edges++;const p=i*4,t=Math.pow(q,.72);const ink=Math.round(12+t*224);pixels.data[p]=ink;pixels.data[p+1]=Math.round(15+t*222);pixels.data[p+2]=Math.round(22+t*210);pixels.data[p+3]=255;}ctx.putImageData(pixels,0,0);if(frame%20===0){const a=active/count*100,m=total/count,e=edges/(N*N)*100;setStats({active:a,mean:m,edge:e});setStep(iteration);setHistory(old=>[...old.slice(-59),a]);}};
  const tick=()=>{if(!params.current.paused){for(let pass=0;pass<2;pass++){const {feed:f,kill:k}=params.current;for(let y=0;y<N;y++)for(let x=0;x<N;x++){const i=y*N+x,a=u[i],b=v[i],reaction=a*b*b;nu[i]=Math.max(0,Math.min(1,a+DU*lap(u,x,y,i)-reaction+f*(1-a)));nv[i]=Math.max(0,Math.min(1,b+DV*lap(v,x,y,i)+reaction-(f+k)*b));}[u,nu]=[nu,u];[v,nv]=[nv,v];iteration++;}}if(frame++%2===0)render();raf=requestAnimationFrame(tick);};
  resetField();render();sim.current={reset:resetField,inject};raf=requestAnimationFrame(tick);return()=>{cancelAnimationFrame(raf);sim.current=null;};
 },[]);
 const pointer=(e:PointerEvent<HTMLCanvasElement>)=>{const r=e.currentTarget.getBoundingClientRect();sim.current?.inject((e.clientX-r.left)/r.width,(e.clientY-r.top)/r.height);};
 const activePreset=presets[preset] ?? {name:"Custom experiment",description:"You changed the model parameters. The original preset label no longer applies.",question:"Change one variable at a time, then compare the response.",hypothesis:"The pattern is determined by the interaction of feed, kill, diffusion and the starting conditions."};
 const delta=feed-baseline.feed,deltaK=kill-baseline.kill;
 return <section className="emergence-section" id="emergence">
  <div className="emergence-heading"><span className="eyebrow"><Waves size={13}/> A STUDY IN EMERGENCE / 001</span><h2>Complexity has <em>rules.</em></h2><p>Nothing in this field is drawn by hand. Two substances react and diffuse across space. Change the conditions and watch the system reorganise.</p></div>
  <div className="emergence-lab">
   <div className="emergence-visual"><canvas ref={canvasRef} onPointerDown={pointer} aria-label="Interactive Gray Scott reaction diffusion simulation"/><span className="simulation-label">GRAY–SCOTT MODEL / LIVE FIELD</span><span className="simulation-hint">TOUCH TO INJECT A LOCAL DISTURBANCE</span><span className="field-scale">V CONCENTRATION · LOW → HIGH</span></div>
   <div className="emergence-controls">
    <div className="controls-top"><span>01 / SELECT A REGIME</span><span>2D · PERIODIC</span></div>
    <div className="regime-picker">{presets.map((p,i)=><button key={p.name} className={preset===i?"active":""} onClick={()=>choose(i)}>{p.name}</button>)}</div>
    <div className="regime-explanation"><strong>{activePreset.name}</strong><p>{activePreset.description}</p><small>TEST THIS: {activePreset.question}</small></div>
    <div className="parameter-control"><span><span>Feed rate <i>f</i><small>How quickly U is replenished</small></span><output>{feed.toFixed(4)}</output></span><input aria-label="Feed rate" type="range" min=".010" max=".070" step=".0005" value={feed} onChange={e=>{setFeed(+e.target.value);setPreset(-1);}}/></div>
    <div className="parameter-control"><span><span>Kill rate <i>k</i><small>How quickly V is removed</small></span><output>{kill.toFixed(4)}</output></span><input aria-label="Kill rate" type="range" min=".045" max=".070" step=".0005" value={kill} onChange={e=>{setKill(+e.target.value);setPreset(-1);}}/></div>
    <div className="live-readout"><div><span>ITERATIONS</span><b>{step.toLocaleString()}</b></div><div><span>ACTIVE AREA</span><b>{stats.active.toFixed(1)}%</b></div><div><span>BOUNDARY DENSITY</span><b>{stats.edge.toFixed(1)}%</b></div></div>
    <div className="history-panel"><div><span>ACTIVE AREA THROUGH TIME</span><b>{history.length>1?"LIVE TRACE":"COLLECTING"}</b></div><MiniChart values={history}/><p>Does the amount of patterned area stabilise, grow or collapse?</p></div>
    <div className="baseline-panel"><div><span>YOUR REFERENCE POINT</span><button onClick={()=>setBaseline({feed,kill})}><Bookmark size={12}/> SET BASELINE</button></div><p>Feed {baseline.feed.toFixed(4)} · Kill {baseline.kill.toFixed(4)}</p><small>Since baseline: Δf {delta>=0?"+":""}{delta.toFixed(4)} · Δk {deltaK>=0?"+":""}{deltaK.toFixed(4)}</small></div>
    <div className="simulation-actions"><button onClick={()=>setPaused(x=>!x)}>{paused?<Play size={14}/>:<Pause size={14}/>} {paused?"RESUME":"PAUSE"}</button><button onClick={reset}><RotateCcw size={14}/> RESET FIELD</button></div>
   </div>
  </div>
  <div className="experiment-reading"><div className="reading-title"><FlaskConical size={15}/><span>READ THE SYSTEM</span></div><div className="reading-grid"><article><span>THE MECHANISM</span><p>{activePreset.hypothesis}</p></article><article><span>WHAT THE METRICS MEAN</span><p><b>Active area</b> counts cells where V exceeds a threshold. <b>Boundary density</b> counts neighbouring cells on opposite sides of that threshold. They are measurements of this simulation, not universal quantities.</p></article><article><span>AN EXPERIMENT</span><p>Pause the field. Set a baseline. Change only feed or kill. Resume and compare the active-area trace and boundary density. Reset to repeat from the same initial condition.</p></article></div></div>
  <div className="model-explainer"><div><span className="equation-label">THE GOVERNING EQUATIONS</span><div className="equation-line">∂u/∂t = Dᵤ∇²u − uv² + f(1 − u)</div><div className="equation-line">∂v/∂t = Dᵥ∇²v + uv² − (f + k)v</div><button className="model-toggle" onClick={()=>setShowModel(x=>!x)}>{showModel?"HIDE NUMERICAL METHOD":"HOW THE SIMULATION COMPUTES THIS"} <span>{showModel?"−":"＋"}</span></button>{showModel&&<p className="numerical-note">The continuous reaction–diffusion equations are approximated on a 176 × 176 grid. A weighted 8-neighbour discrete Laplacian estimates spatial diffusion. Each animation frame advances two explicit Euler steps. The edges wrap around, creating periodic boundary conditions. This is a qualitative exploratory model, not a quantitatively calibrated biological simulation.</p>}</div><div className="term-grid"><p><b>u and v</b><br/>Concentrations of two abstract chemical species.</p><p><b>Diffusion ∇²</b><br/>Movement from high concentration toward neighbouring cells.</p><p><b>Reaction uv²</b><br/>Autocatalysis: V helps convert U into more V.</p><p><b>Feed f / kill k</b><br/>External replenishment of U and removal of V.</p></div><p className="model-caveat">The Gray–Scott model is a simplified mathematical system. The named regimes are illustrative parameter regions, not guaranteed outcomes. Pattern formation also depends on initial conditions, discretisation and runtime. Similar-looking patterns in nature do not prove that the same mechanism produced them.</p></div>
  <div className="emergence-footnote"><span>GRAY–SCOTT REACTION–DIFFUSION</span><span>176 × 176 GRID · EXPLICIT EULER · PERIODIC BOUNDARY</span></div>
 </section>;
}
