import { useEffect, useRef, useState, type PointerEvent } from "react";
import { Pause, Play, RotateCcw, Waves } from "lucide-react";
import "./emergence.css";

const N = 176, DU = 0.16, DV = 0.08;
const presets = [
  {name:"Spots",f:0.055,k:0.062,description:"Localised activator regions compete. Some persist, split or disappear.",question:"Increase kill slowly. At what point do spots fade?"},
  {name:"Mazes",f:0.029,k:0.057,description:"Connected labyrinth-like bands emerge from local reactions and diffusion.",question:"Can you find where connected bands break apart?"},
  {name:"Waves",f:0.018,k:0.051,description:"Excitation can travel through the field as moving fronts.",question:"Tap the field. How far does the disturbance travel?"},
  {name:"Splitting",f:0.0367,k:0.0649,description:"Some parameter regions produce growing spots that split. This is a model pattern, not literal cell division.",question:"Can one spot become two?"}
];
type Params={feed:number;kill:number;paused:boolean};
type Sim={reset:()=>void;inject:(x:number,y:number)=>void};

export default function Emergence(){
 const canvasRef=useRef<HTMLCanvasElement>(null);
 const sim=useRef<Sim|null>(null);
 const params=useRef<Params>({feed:0.055,kill:0.062,paused:false});
 const [feed,setFeed]=useState(0.055),[kill,setKill]=useState(0.062),[paused,setPaused]=useState(false);
 const [preset,setPreset]=useState(0),[stats,setStats]=useState({step:0,active:0,mean:0});
 params.current={feed,kill,paused};
 const choose=(i:number)=>{setPreset(i);setFeed(presets[i].f);setKill(presets[i].k);setPaused(false);sim.current?.reset();};
 useEffect(()=>{
  const canvas=canvasRef.current,ctx=canvas?.getContext("2d",{alpha:false}); if(!canvas||!ctx)return;
  canvas.width=N;canvas.height=N;const count=N*N;
  let u=new Float32Array(count),v=new Float32Array(count),nu=new Float32Array(count),nv=new Float32Array(count);
  const pixels=ctx.createImageData(N,N);let frame=0,step=0,raf=0;
  const seed=(cx:number,cy:number,r:number)=>{for(let y=-r;y<=r;y++)for(let x=-r;x<=r;x++){if(x*x+y*y>r*r)continue;const i=((cy+y+N)%N)*N+(cx+x+N)%N;u[i]=.5;v[i]=.25;}};
  const reset=()=>{u.fill(1);v.fill(0);nu.fill(1);nv.fill(0);step=0;seed(88,88,10);seed(64,105,4);seed(117,68,5);setStats({step:0,active:0,mean:0});};
  const inject=(x:number,y:number)=>{const cx=Math.floor(x*N),cy=Math.floor(y*N);seed(cx,cy,5);};
  const lap=(a:Float32Array,x:number,y:number,i:number)=>{const l=y*N+(x+N-1)%N,r=y*N+(x+1)%N,t=((y+N-1)%N)*N+x,b=((y+1)%N)*N+x;const tl=((y+N-1)%N)*N+(x+N-1)%N,tr=((y+N-1)%N)*N+(x+1)%N,bl=((y+1)%N)*N+(x+N-1)%N,br=((y+1)%N)*N+(x+1)%N;return -a[i]+.2*(a[l]+a[r]+a[t]+a[b])+.05*(a[tl]+a[tr]+a[bl]+a[br]);};
  const render=()=>{let active=0,total=0;for(let i=0;i<count;i++){const z=v[i],q=Math.max(0,Math.min(1,z*2.7));if(z>.08)active++;total+=z;const p=i*4,t=Math.pow(q,.8);pixels.data[p]=10+t*220;pixels.data[p+1]=13+t*220;pixels.data[p+2]=18+t*210;pixels.data[p+3]=255;}ctx.putImageData(pixels,0,0);if(frame%24===0)setStats({step,active:active/count*100,mean:total/count});};
  const tick=()=>{if(!params.current.paused){for(let pass=0;pass<2;pass++){const {feed:f,kill:k}=params.current;for(let y=0;y<N;y++)for(let x=0;x<N;x++){const i=y*N+x,a=u[i],b=v[i],reaction=a*b*b;nu[i]=Math.max(0,Math.min(1,a+DU*lap(u,x,y,i)-reaction+f*(1-a)));nv[i]=Math.max(0,Math.min(1,b+DV*lap(v,x,y,i)+reaction-(f+k)*b));}[u,nu]=[nu,u];[v,nv]=[nv,v];step++;}}if(frame++%2===0)render();raf=requestAnimationFrame(tick);};
  reset();render();sim.current={reset,inject};raf=requestAnimationFrame(tick);return()=>{cancelAnimationFrame(raf);sim.current=null;};
 },[]);
 const pointer=(e:PointerEvent<HTMLCanvasElement>)=>{const r=e.currentTarget.getBoundingClientRect();sim.current?.inject((e.clientX-r.left)/r.width,(e.clientY-r.top)/r.height);};
 const activePreset=presets[preset];
 return <section className="emergence-section" id="emergence">
  <div className="emergence-heading"><span className="eyebrow"><Waves size={13}/> A STUDY IN EMERGENCE</span><h2>Complexity has <em>rules.</em></h2><p>Two substances interact, spread and change. No one draws the final pattern. It emerges from local rules.</p></div>
  <div className="emergence-lab">
   <div className="emergence-visual"><canvas ref={canvasRef} onPointerDown={pointer} aria-label="Interactive Gray Scott reaction diffusion simulation"/><span className="simulation-label">GRAY–SCOTT / LIVE FIELD</span><span className="simulation-hint">TAP THE FIELD TO ADD A DISTURBANCE</span></div>
   <div className="emergence-controls">
    <div className="controls-top"><span>CHOOSE A BEHAVIOUR</span><span>MODEL 01</span></div>
    <div className="regime-picker">{presets.map((p,i)=><button key={p.name} className={preset===i?"active":""} onClick={()=>choose(i)}>{p.name}</button>)}</div>
    <div className="regime-explanation"><strong>{activePreset.name} regime</strong><p>{activePreset.description}</p><small>INVESTIGATE: {activePreset.question}</small></div>
    <label className="parameter-control"><span><span>Feed rate <i>f</i><small>Replenishes U</small></span><output>{feed.toFixed(4)}</output></span><input type="range" min=".010" max=".070" step=".0005" value={feed} onChange={e=>{setFeed(+e.target.value);setPreset(-1);}}/></label>
    <label className="parameter-control"><span><span>Kill rate <i>k</i><small>Removes V</small></span><output>{kill.toFixed(4)}</output></span><input type="range" min=".045" max=".070" step=".0005" value={kill} onChange={e=>{setKill(+e.target.value);setPreset(-1);}}/></label>
    <div className="live-readout"><div><span>STEPS</span><b>{stats.step.toLocaleString()}</b></div><div><span>ACTIVE FIELD</span><b>{stats.active.toFixed(1)}%</b></div><div><span>MEAN V</span><b>{stats.mean.toFixed(3)}</b></div></div>
    <div className="simulation-actions"><button onClick={()=>setPaused(x=>!x)}>{paused?<Play size={14}/>:<Pause size={14}/>} {paused?"RESUME":"PAUSE"}</button><button onClick={()=>{sim.current?.reset();setPaused(false);}}><RotateCcw size={14}/> RESET</button></div>
   </div>
  </div>
  <div className="model-explainer"><div><span className="equation-label">THE GOVERNING RULES</span><div className="equation-line">∂u/∂t = Dᵤ∇²u − uv² + f(1 − u)</div><div className="equation-line">∂v/∂t = Dᵥ∇²v + uv² − (f + k)v</div></div><div className="term-grid"><p><b>Diffusion ∇²</b><br/>Both substances spread to neighbouring space.</p><p><b>Reaction uv²</b><br/>V helps convert U into more V: an autocatalytic loop.</p><p><b>Feed f</b><br/>Replenishes U, keeping the system supplied.</p><p><b>Kill k</b><br/>Removes V, counteracting the reaction.</p></div><p className="model-caveat">This is a simplified numerical model on a 2D periodic grid. The named regimes are approximate, not guaranteed outcomes; initial conditions and runtime matter. It illustrates pattern formation, not a complete model of biological development.</p></div>
  <div className="emergence-footnote"><span>GRAY–SCOTT REACTION–DIFFUSION</span><span>2D NUMERICAL APPROXIMATION</span></div>
 </section>;
}
