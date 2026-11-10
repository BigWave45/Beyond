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
type Probe={x:number;y:number;u:number;v:number;reaction:number;diffU:number;diffV:number;rateU:number;rateV:number};
type Sim={reset:()=>void;inject:(x:number,y:number,radius:number)=>void;inspect:(x:number,y:number)=>Probe};
type Sample={active:number;mean:number;edge:number};

function MiniChart({values}:{values:number[]}){
 const points=useMemo(()=>values.map((v,i)=>`${(i/Math.max(1,values.length-1))*100},${38-Math.max(0,Math.min(100,v))*0.34}`).join(" "),[values]);
 return <svg className="history-chart" viewBox="0 0 100 40" preserveAspectRatio="none" role="img" aria-label="Recent active field percentage over time"><line x1="0" y1="38" x2="100" y2="38"/><polyline points={points}/></svg>;
}


type PhasePoint={f:number;k:number;active:number;edge:number};
function sampleGrayScott(feed:number,kill:number):{active:number;edge:number}{
 const n=32,len=n*n,du=.16,dv=.08;let u=new Float32Array(len).fill(1),v=new Float32Array(len),nu=new Float32Array(len),nv=new Float32Array(len);
 for(const cy of [16,10,23])for(let y=-2;y<=2;y++)for(let x=-2;x<=2;x++)if(x*x+y*y<=4){const i=((cy+y+n)%n)*n+(16+x+n)%n;u[i]=.5;v[i]=.25;}
 const lap=(a:Float32Array,x:number,y:number,i:number)=>-a[i]+.2*(a[y*n+(x+n-1)%n]+a[y*n+(x+1)%n]+a[((y+n-1)%n)*n+x]+a[((y+1)%n)*n+x])+.05*(a[((y+n-1)%n)*n+(x+n-1)%n]+a[((y+n-1)%n)*n+(x+1)%n]+a[((y+1)%n)*n+(x+n-1)%n]+a[((y+1)%n)*n+(x+1)%n]);
 for(let t=0;t<115;t++){for(let y=0;y<n;y++)for(let x=0;x<n;x++){const i=y*n+x,a=u[i],b=v[i],r=a*b*b;nu[i]=Math.max(0,Math.min(1,a+du*lap(u,x,y,i)-r+feed*(1-a)));nv[i]=Math.max(0,Math.min(1,b+dv*lap(v,x,y,i)+r-(feed+kill)*b));}[u,nu]=[nu,u];[v,nv]=[nv,v];}
 let active=0,edges=0;for(let y=0;y<n;y++)for(let x=0;x<n;x++){const i=y*n+x;if(v[i]>.08)active++;if((v[i]>.08)!==(v[y*n+(x+1)%n]>.08))edges++;}
 return {active:active/len,edge:edges/len};
}
function PhaseExplorer({onSelect}:{onSelect:(f:number,k:number)=>void}){
 const [points,setPoints]=useState<PhasePoint[]>([]),[running,setRunning]=useState(false),[selected,setSelected]=useState(-1);
 const feeds=Array.from({length:7},(_,i)=>.018+i*.007),kills=Array.from({length:7},(_,i)=>.048+i*.004);
 useEffect(()=>{let cancelled=false;setRunning(true);const run=async()=>{const result:PhasePoint[]=[];for(const k of kills){for(const f of feeds){if(cancelled)return;const m=sampleGrayScott(f,k);result.push({f,k,...m});}setPoints([...result]);await new Promise(r=>setTimeout(r,0));}setRunning(false);};run();return()=>{cancelled=true;};},[]);
 const choose=(p:PhasePoint,i:number)=>{setSelected(i);onSelect(p.f,p.k);};
 return <section className="phase-explorer"><div className="phase-head"><div><span className="equation-label">PARAMETER SPACE / COMPUTED SAMPLES</span><h3>Where does behaviour change?</h3><p>Each tile is a separate short run of the same Gray–Scott equations, with the same initial seed and a different feed/kill pair. Select a tile to load those parameters into the live field.</p></div><span className="phase-status">{running?"COMPUTING GRID…":points.length===49?"49 / 49 RUNS":"PREPARING"}</span></div>
 <div className="phase-layout"><div className="phase-map-wrap"><div className="phase-y-label">KILL RATE · k</div><div className="phase-map"><div className="phase-y-ticks">{kills.slice().reverse().map(v=><span key={v}>{v.toFixed(3)}</span>)}</div><div className="phase-cells">{kills.slice().reverse().map(k=><div className="phase-row" key={k}>{feeds.map(f=>{const p=points.find(q=>q.f===f&&q.k===k);const idx=p?points.indexOf(p):-1;const intensity=p?Math.min(1,p.active*3.5):0;const boundary=p?Math.min(1,p.edge*8):0;return <button key={f} disabled={!p} aria-label={p?"Feed "+f.toFixed(3)+", kill "+k.toFixed(3)+", active area "+(p.active*100).toFixed(1)+" percent, boundary density "+(p.edge*100).toFixed(1)+" percent":"Computing sample"} className={selected===idx?"selected":""} style={{background:p?"linear-gradient(135deg, rgba(185,196,255,"+(.08+intensity*.8)+"), rgba(90,115,180,"+(.08+boundary*.75)+"))":"rgba(255,255,255,.035)"}} onClick={()=>p&&choose(p,idx)} />;})}</div>)}</div><div className="phase-x-ticks">{feeds.map(v=><span key={v}>{v.toFixed(3)}</span>)}</div><div className="phase-x-label">FEED RATE · f</div></div><div className="phase-legend"><span/><small>Lower measured activity</small><span/><small>Higher measured activity</small></div></div><div className="phase-detail"><span>MEASUREMENT KEY</span><p><b>Tile brightness</b> encodes the fraction of grid cells where V exceeds 0.08 after 115 simulation steps.</p><p><b>Boundary structure</b> is measured separately as the fraction of horizontal neighbour pairs on opposite sides of that threshold.</p>{selected>=0&&points[selected]&&<div className="phase-selected"><span>SELECTED SAMPLE</span><strong>f {points[selected].f.toFixed(4)} · k {points[selected].k.toFixed(4)}</strong><p>Active area {(points[selected].active*100).toFixed(1)}% · Boundary density {(points[selected].edge*100).toFixed(1)}%</p></div>}<small>This is a finite sampled parameter map, not a mathematically proven phase diagram. Results depend on grid size, seed, threshold and run duration. A tile's metric does not by itself identify a pattern type.</small></div></div>
 </section>;
}


type TrialResult={active:number;edge:number;mean:number};
async function runTrial(feed:number,kill:number):Promise<TrialResult>{
 const n=48,len=n*n;let u=new Float32Array(len).fill(1),v=new Float32Array(len),nu=new Float32Array(len),nv=new Float32Array(len);
 const seed=(cx:number,cy:number,r:number)=>{for(let y=-r;y<=r;y++)for(let x=-r;x<=r;x++)if(x*x+y*y<=r*r){const i=((cy+y+n)%n)*n+(cx+x+n)%n;u[i]=.5;v[i]=.25;}};
 seed(24,24,5);seed(16,29,2);seed(32,18,3);
 const lap=(a:Float32Array,x:number,y:number,i:number)=>-a[i]+.2*(a[y*n+(x+n-1)%n]+a[y*n+(x+1)%n]+a[((y+n-1)%n)*n+x]+a[((y+1)%n)*n+x])+.05*(a[((y+n-1)%n)*n+(x+n-1)%n]+a[((y+n-1)%n)*n+(x+1)%n]+a[((y+1)%n)*n+(x+n-1)%n]+a[((y+1)%n)*n+(x+1)%n]);
 for(let start=0;start<240;start+=20){
  for(let t=0;t<20;t++){for(let y=0;y<n;y++)for(let x=0;x<n;x++){const i=y*n+x,a=u[i],b=v[i],r=a*b*b;nu[i]=Math.max(0,Math.min(1,a+.16*lap(u,x,y,i)-r+feed*(1-a)));nv[i]=Math.max(0,Math.min(1,b+.08*lap(v,x,y,i)+r-(feed+kill)*b));}[u,nu]=[nu,u];[v,nv]=[nv,v];}
  await new Promise<void>(resolve=>setTimeout(resolve,0));
 }
 let active=0,edge=0,total=0;for(let y=0;y<n;y++)for(let x=0;x<n;x++){const i=y*n+x;if(v[i]>.08)active++;total+=v[i];if((v[i]>.08)!==(v[y*n+(x+1)%n]>.08))edge++;}
 return {active:active/len*100,edge:edge/len*100,mean:total/len};
}
function PairedExperiment({baseline,current}:{baseline:{feed:number;kill:number};current:{feed:number;kill:number}}){
 const [busy,setBusy]=useState(false),[result,setResult]=useState<{a:TrialResult;b:TrialResult}|null>(null),[error,setError]=useState("");
 const run=async()=>{setBusy(true);setError("");setResult(null);try{const a=await runTrial(baseline.feed,baseline.kill);const b=await runTrial(current.feed,current.kill);setResult({a,b});}catch{setError("The comparison could not finish. Try again.");}finally{setBusy(false);}};
 const diff=(a:number,b:number)=>{const d=b-a;return (d>0?"+":"")+d.toFixed(2)+" percentage points";};
 return <section className="paired-experiment" id="emergence-experiment"><div className="paired-intro"><span className="equation-label">CONTROLLED EXPERIMENT / SAME STARTING FIELD</span><h3>Change one condition. Measure the difference.</h3><p>This runs two independent simulations from identical initial conditions. The reference uses your saved baseline; the second uses the current feed and kill settings. Both use the same 48 × 48 grid and 240 update steps.</p><button onClick={run} disabled={busy}>{busy?"RUNNING TWO TRIALS…":"RUN PAIRED EXPERIMENT"}</button></div><div className="paired-settings"><div><span>REFERENCE</span><b>f {baseline.feed.toFixed(4)} · k {baseline.kill.toFixed(4)}</b></div><div><span>CURRENT</span><b>f {current.feed.toFixed(4)} · k {current.kill.toFixed(4)}</b></div></div>{result&&<div className="paired-results"><div className="paired-result-grid"><div><span>REFERENCE / ACTIVE AREA</span><strong>{result.a.active.toFixed(2)}%</strong><small>Boundary density {result.a.edge.toFixed(2)}%</small></div><div><span>CURRENT / ACTIVE AREA</span><strong>{result.b.active.toFixed(2)}%</strong><small>Boundary density {result.b.edge.toFixed(2)}%</small></div></div><p><b>Measured change:</b> active area {diff(result.a.active,result.b.active)}. Boundary density {diff(result.a.edge,result.b.edge)}.</p><small>These are outcomes from this finite numerical experiment, not a universal prediction. The reduced grid and short run can produce different results from the live 176 × 176 field.</small></div>}{error&&<p className="paired-error">{error}</p>}</section>;
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
 const [brush,setBrush]=useState(5);
 const [probe,setProbe]=useState<Probe|null>(null);
 const painting=useRef(false);
 const [prediction,setPrediction]=useState("more");
 const [predictionRevealed,setPredictionRevealed]=useState(false);
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
  const inject=(x:number,y:number,radius:number)=>{const cx=Math.floor(x*N),cy=Math.floor(y*N);seed(cx,cy,radius);};
  const lap=(a:Float32Array,x:number,y:number,i:number)=>{const l=y*N+(x+N-1)%N,r=y*N+(x+1)%N,t=((y+N-1)%N)*N+x,b=((y+1)%N)*N+x;const tl=((y+N-1)%N)*N+(x+N-1)%N,tr=((y+N-1)%N)*N+(x+1)%N,bl=((y+1)%N)*N+(x+N-1)%N,br=((y+1)%N)*N+(x+1)%N;return -a[i]+.2*(a[l]+a[r]+a[t]+a[b])+.05*(a[tl]+a[tr]+a[bl]+a[br]);};
  const render=()=>{let active=0,total=0,edges=0;for(let y=0;y<N;y++)for(let x=0;x<N;x++){const i=y*N+x,z=v[i],q=Math.max(0,Math.min(1,z*3.1));if(z>.08)active++;total+=z;if((z>.08)!==(v[y*N+(x+1)%N]>.08))edges++;const p=i*4,t=Math.pow(q,.72);const ink=Math.round(12+t*224);pixels.data[p]=ink;pixels.data[p+1]=Math.round(15+t*222);pixels.data[p+2]=Math.round(22+t*210);pixels.data[p+3]=255;}ctx.putImageData(pixels,0,0);if(frame%20===0){const a=active/count*100,m=total/count,e=edges/(N*N)*100;setStats({active:a,mean:m,edge:e});setStep(iteration);setHistory(old=>[...old.slice(-59),a]);}};
  const inspect=(x:number,y:number):Probe=>{const cx=Math.max(0,Math.min(N-1,Math.floor(x*N))),cy=Math.max(0,Math.min(N-1,Math.floor(y*N))),i=cy*N+cx,a=u[i],b=v[i],reaction=a*b*b,diffU=DU*lap(u,cx,cy,i),diffV=DV*lap(v,cx,cy,i),rateU=diffU-reaction+params.current.feed*(1-a),rateV=diffV+reaction-(params.current.feed+params.current.kill)*b;return{x:cx,y:cy,u:a,v:b,reaction,diffU,diffV,rateU,rateV};};
  const tick=()=>{if(!params.current.paused){for(let pass=0;pass<2;pass++){const {feed:f,kill:k}=params.current;for(let y=0;y<N;y++)for(let x=0;x<N;x++){const i=y*N+x,a=u[i],b=v[i],reaction=a*b*b;nu[i]=Math.max(0,Math.min(1,a+DU*lap(u,x,y,i)-reaction+f*(1-a)));nv[i]=Math.max(0,Math.min(1,b+DV*lap(v,x,y,i)+reaction-(f+k)*b));}[u,nu]=[nu,u];[v,nv]=[nv,v];iteration++;}}if(frame++%2===0)render();raf=requestAnimationFrame(tick);};
  resetField();render();sim.current={reset:resetField,inject,inspect};raf=requestAnimationFrame(tick);return()=>{cancelAnimationFrame(raf);sim.current=null;};
 },[]);
 const pointerPosition=(e:PointerEvent<HTMLCanvasElement>)=>{const r=e.currentTarget.getBoundingClientRect();return{x:(e.clientX-r.left)/r.width,y:(e.clientY-r.top)/r.height};};
 const pointerDown=(e:PointerEvent<HTMLCanvasElement>)=>{const p=pointerPosition(e);painting.current=true;e.currentTarget.setPointerCapture(e.pointerId);sim.current?.inject(p.x,p.y,brush);if(sim.current)setProbe(sim.current.inspect(p.x,p.y));};
 const pointerMove=(e:PointerEvent<HTMLCanvasElement>)=>{const p=pointerPosition(e);if(painting.current)sim.current?.inject(p.x,p.y,brush);if(sim.current)setProbe(sim.current.inspect(p.x,p.y));};
 const pointerUp=()=>{painting.current=false;};
 const activePreset=presets[preset] ?? {name:"Custom experiment",description:"You changed the model parameters. The original preset label no longer applies.",question:"Change one variable at a time, then compare the response.",hypothesis:"The pattern is determined by the interaction of feed, kill, diffusion and the starting conditions."};
 const delta=feed-baseline.feed,deltaK=kill-baseline.kill;
 return <section className="emergence-section" id="emergence">
  <div className="emergence-heading"><span className="eyebrow"><Waves size={13}/> BEYOND FIELD NOTE / 001</span><h2>How does <em>order emerge?</em></h2><p>Start with a simple question: how can two invisible substances, following local rules, create patterns across an entire surface? Watch it happen, change the conditions and inspect the mathematics behind it.</p></div>
  <nav className="discovery-path" aria-label="Explore this experiment"><a href="#emergence-observe"><span>01</span> Observe</a><a href="#emergence-understand"><span>02</span> Understand</a><a href="#emergence-math"><span>03</span> Mathematics</a><a href="#emergence-experiment"><span>04</span> Experiment</a><a href="#emergence-create"><span>05</span> Create</a></nav>
  <div className="emergence-lab" id="emergence-observe">
   <div className="emergence-visual"><canvas ref={canvasRef} onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerUp} onPointerCancel={pointerUp} onPointerLeave={pointerUp} aria-label="Interactive Gray Scott reaction diffusion simulation. Touch and drag to paint disturbances; move to inspect local values."/><span className="simulation-label">GRAY–SCOTT MODEL / LIVE FIELD</span><span className="simulation-hint">DRAG TO PAINT · MOVE TO INSPECT</span><span className="field-scale">V CONCENTRATION · LOW → HIGH</span><div className="field-inspector"><div className="field-inspector-head"><span>LOCAL FIELD PROBE</span><span>{probe?`CELL ${probe.x}, ${probe.y}`:"MOVE OVER THE FIELD"}</span></div>{probe?<><div className="probe-values"><span>U <b>{probe.u.toFixed(3)}</b></span><span>V <b>{probe.v.toFixed(3)}</b></span><span>UV² <b>{probe.reaction.toFixed(4)}</b></span><span>Dᵤ∇²U <b>{probe.diffU>=0?"+":""}{probe.diffU.toFixed(4)}</b></span><span>Dᵥ∇²V <b>{probe.diffV>=0?"+":""}{probe.diffV.toFixed(4)}</b></span></div><div className="probe-rates"><span>U change / step <b>{probe.rateU>=0?"+":""}{probe.rateU.toFixed(4)}</b></span><span>V change / step <b>{probe.rateV>=0?"+":""}{probe.rateV.toFixed(4)}</b></span></div></>:<p>Touch or move across the field to inspect one cell.</p>}</div></div>
   <div className="emergence-controls">
    <div className="controls-top"><span>01 / SELECT A REGIME</span><span>2D · PERIODIC</span></div>
    <div className="regime-picker">{presets.map((p,i)=><button key={p.name} className={preset===i?"active":""} onClick={()=>choose(i)}>{p.name}</button>)}</div>
    <div className="regime-explanation"><strong>{activePreset.name}</strong><p>{activePreset.description}</p><small>TEST THIS: {activePreset.question}</small></div>
    <div className="parameter-control brush-control"><span><span>Disturbance brush <small>Radius of each injected seed</small></span><output>{brush} cells</output></span><input aria-label="Disturbance brush radius" type="range" min="2" max="12" step="1" value={brush} onChange={e=>setBrush(+e.target.value)}/></div>
    <div className="parameter-control"><span><span>Feed rate <i>f</i><small>How quickly U is replenished</small></span><output>{feed.toFixed(4)}</output></span><input aria-label="Feed rate" type="range" min=".010" max=".070" step=".0005" value={feed} onChange={e=>{setFeed(+e.target.value);setPreset(-1);}}/></div>
    <div className="parameter-control"><span><span>Kill rate <i>k</i><small>How quickly V is removed</small></span><output>{kill.toFixed(4)}</output></span><input aria-label="Kill rate" type="range" min=".045" max=".070" step=".0005" value={kill} onChange={e=>{setKill(+e.target.value);setPreset(-1);}}/></div>
    <div className="live-readout"><div><span>ITERATIONS</span><b>{step.toLocaleString()}</b></div><div><span>ACTIVE AREA</span><b>{stats.active.toFixed(1)}%</b></div><div><span>BOUNDARY DENSITY</span><b>{stats.edge.toFixed(1)}%</b></div></div>
    <div className="history-panel"><div><span>ACTIVE AREA THROUGH TIME</span><b>{history.length>1?"LIVE TRACE":"COLLECTING"}</b></div><MiniChart values={history}/><p>Does the amount of patterned area stabilise, grow or collapse?</p></div>
    <div className="baseline-panel"><div><span>YOUR REFERENCE POINT</span><button onClick={()=>setBaseline({feed,kill})}><Bookmark size={12}/> SET BASELINE</button></div><p>Feed {baseline.feed.toFixed(4)} · Kill {baseline.kill.toFixed(4)}</p><small>Since baseline: Δf {delta>=0?"+":""}{delta.toFixed(4)} · Δk {deltaK>=0?"+":""}{deltaK.toFixed(4)}</small></div>
    <div className="simulation-actions"><button onClick={()=>setPaused(x=>!x)}>{paused?<Play size={14}/>:<Pause size={14}/>} {paused?"RESUME":"PAUSE"}</button><button onClick={reset}><RotateCcw size={14}/> RESET FIELD</button></div>
   </div>
  </div>
  <section className="prediction-lab" id="emergence-understand"><div className="prediction-copy"><span className="equation-label">BEFORE YOU CHANGE ANYTHING</span><h3>Make a prediction.</h3><p>Feed replenishes U. Kill removes V. What do you think happens if the kill rate increases while everything else stays the same?</p></div><div className="prediction-actions"><button className={prediction==="more"?"chosen":""} onClick={()=>{setPrediction("more");setPredictionRevealed(false);}}>More V survives</button><button className={prediction==="less"?"chosen":""} onClick={()=>{setPrediction("less");setPredictionRevealed(false);}}>Less V survives</button><button className={prediction==="depends"?"chosen":""} onClick={()=>{setPrediction("depends");setPredictionRevealed(false);}}>It depends on the system</button><button className="prediction-check" onClick={()=>setPredictionRevealed(true)}>CHECK MY THINKING</button>{predictionRevealed&&<p className="prediction-feedback">{prediction==="less"?"Correct direction: increasing k directly increases V removal. The full pattern can still respond nonlinearly because reaction and diffusion interact.":prediction==="depends"?"Good qualification. Increasing k directly removes V faster, but the resulting spatial pattern also depends on feed, diffusion and the starting field.":"The direct effect goes the other way: a higher kill rate removes V faster. The final pattern is more complicated than concentration alone."}</p>}</div></section>
  <div className="experiment-reading"><div className="reading-title"><FlaskConical size={15}/><span>UNDERSTAND THE MECHANISM</span></div><div className="reading-grid"><article><span>THE MECHANISM</span><p>{activePreset.hypothesis}</p></article><article><span>WHAT THE METRICS MEAN</span><p><b>Active area</b> counts cells where V exceeds a threshold. <b>Boundary density</b> counts neighbouring cells on opposite sides of that threshold. They are measurements of this simulation, not universal quantities.</p></article><article><span>AN EXPERIMENT</span><p>Pause the field. Set a baseline. Change only feed or kill. Resume and compare the active-area trace and boundary density. Reset to repeat from the same initial condition.</p></article></div></div>
  <PhaseExplorer onSelect={(f,k)=>{setFeed(f);setKill(k);setPreset(-1);setPaused(false);sim.current?.reset();}} />
  <PairedExperiment baseline={baseline} current={{feed,kill}} />
  <div className="model-explainer" id="emergence-math"><div><span className="equation-label">THE MATHEMATICS UNDER THE IMAGE</span><div className="equation-line">∂u/∂t = Dᵤ∇²u − uv² + f(1 − u)</div><div className="equation-line">∂v/∂t = Dᵥ∇²v + uv² − (f + k)v</div><button className="model-toggle" onClick={()=>setShowModel(x=>!x)}>{showModel?"HIDE NUMERICAL METHOD":"HOW DOES THE COMPUTER SOLVE THIS"} <span>{showModel?"−":"＋"}</span></button>{showModel&&<p className="numerical-note">The continuous equations are approximated on a 176 × 176 grid. A weighted 8-neighbour discrete Laplacian estimates diffusion. Each animation frame advances two explicit Euler steps. The edges wrap around, creating periodic boundary conditions. This is a qualitative exploratory model, not a quantitatively calibrated biological simulation.</p>}</div><div className="term-grid"><p><b>∂u/∂t and ∂v/∂t</b><br/>How quickly each concentration changes over time.</p><p><b>D∇²</b><br/>Diffusion: substances spread from high concentration toward neighbouring cells.</p><p><b>uv²</b><br/>Autocatalytic reaction: existing V helps produce more V while consuming U.</p><p><b>f and k</b><br/>Feed replenishes U; kill removes V. These are control parameters.</p></div><p className="model-caveat">The Gray–Scott model is a simplified mathematical system. The named regimes are illustrative parameter regions, not guaranteed outcomes. Pattern formation also depends on initial conditions, discretisation and runtime. Similar-looking patterns in nature do not prove that the same mechanism produced them.</p></div>
  <section className="create-challenge" id="emergence-create"><div><span className="equation-label">MAKE SOMETHING / 05</span><h3>Now disturb the rules.</h3><p>Choose a starting regime, inject a disturbance into the field, and see whether the system absorbs it, spreads it or reorganises around it. Your creation is a set of conditions, not a picture drawn by hand.</p></div><div className="create-actions"><button onClick={()=>choose(0)}>START WITH SPOTS</button><button onClick={()=>choose(1)}>START WITH LABYRINTHS</button><button onClick={()=>choose(2)}>START WITH WAVES</button><button onClick={()=>choose(3)}>START WITH SPLITTING</button><button onClick={reset}>RESET TO INITIAL CONDITIONS</button></div></section>
  <div className="emergence-footnote"><span>GRAY–SCOTT REACTION–DIFFUSION</span><span>176 × 176 GRID · EXPLICIT EULER · PERIODIC BOUNDARY</span></div>
 </section>;
}
