import { useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";
import "./consciousness.css";

type Study="access"|"identity"|"explanations";
const nodes=[{x:18,y:48},{x:35,y:23},{x:35,y:72},{x:54,y:48},{x:72,y:23},{x:72,y:72},{x:88,y:48}];
export default function ConsciousnessExperience(){
 const [study,setStudy]=useState<Study>("access");
 const [signal,setSignal]=useState(55);
 const [recurrent,setRecurrent]=useState(60);
 const [report,setReport]=useState(false);
 const [body,setBody]=useState<"same"|"different">("same");
 const [memory,setMemory]=useState<"intact"|"partial"|"lost">("intact");
 const [values,setValues]=useState(false);
 const activation=useMemo(()=>Math.min(100,Math.round(signal*(.35+recurrent/100))),[signal,recurrent]);
 const broadcast=activation>=55;
 const reset=()=>{setSignal(55);setRecurrent(60);setReport(false);};
 return <section className="consciousness-experience">
  <header className="consciousness-heading"><span className="equation-label">BEYOND FIELD NOTE / 006</span><h1>Why is there<br/><em>something it feels like?</em></h1><p>Consciousness is the fact that experience is present at all. We can measure neural activity and behaviour. Explaining why either should be accompanied by subjective experience remains a deeper question.</p></header>
  <nav className="consciousness-tabs" aria-label="Consciousness studies">
   <button className={study==="access"?"active":""} onClick={()=>setStudy("access")}><span>01</span> ACCESS</button>
   <button className={study==="identity"?"active":""} onClick={()=>setStudy("identity")}><span>02</span> IDENTITY</button>
   <button className={study==="explanations"?"active":""} onClick={()=>setStudy("explanations")}><span>03</span> THE HARD PROBLEM</button>
  </nav>
  {study==="access"&&<div className="consciousness-study">
   <div className="consciousness-copy"><span className="equation-label">MODEL 01 / GLOBAL ACCESS</span><h2>When does a signal<br/><em>become available?</em></h2><p>Some theories propose that information becomes consciously accessible when activity is amplified and made broadly available to multiple systems. This simplified model lets you vary signal strength and recurrent amplification.</p>
    <label className="consciousness-slider"><span>INPUT SIGNAL <output>{signal}%</output></span><input type="range" min="0" max="100" value={signal} onChange={e=>{setSignal(+e.target.value);setReport(false);}}/></label>
    <label className="consciousness-slider"><span>RECURRENT AMPLIFICATION <output>{recurrent}%</output></span><input type="range" min="0" max="100" value={recurrent} onChange={e=>{setRecurrent(+e.target.value);setReport(false);}}/></label>
    <div className="consciousness-equation">A = I × (0.35 + 0.01R)</div><p className="consciousness-small">A = model activation · I = input · R = recurrent amplification. A threshold of 55 is chosen for this demonstration, not measured from a brain.</p>
    <button className="consciousness-reset" onClick={reset}><RefreshCw size={13}/> RESET PARAMETERS</button>
   </div>
   <div className="consciousness-network">
    <div className="network-caption"><span>ILLUSTRATIVE INFORMATION FLOW</span><span>{broadcast?"BROADCAST":"LOCAL ACTIVITY"}</span></div>
    <svg viewBox="0 0 100 95" role="img" aria-label="Illustrative network of connected processing nodes">
     <g stroke="rgba(174,185,214,.32)" strokeWidth=".65">{nodes.slice(0,-1).map((n,i)=><line key={i} x1={n.x} y1={n.y} x2={nodes[i+1].x} y2={nodes[i+1].y}/>)}<line x1="18" y1="48" x2="35" y2="72"/><line x1="35" y1="23" x2="54" y2="48"/><line x1="35" y1="72" x2="54" y2="48"/><line x1="54" y1="48" x2="72" y2="23"/><line x1="54" y1="48" x2="72" y2="72"/><line x1="72" y1="23" x2="88" y2="48"/><line x1="72" y1="72" x2="88" y2="48"/></g>
     {nodes.map((n,i)=><g key={i}><circle cx={n.x} cy={n.y} r="4.1" fill={activation>i*13?"#b7c4e4":"#202532"} stroke={activation>i*13?"#dce4fa":"#667087"} strokeWidth=".7"/>{activation>i*13&&<circle cx={n.x} cy={n.y} r="7" fill="none" stroke="#aeb9d6" strokeOpacity=".25" strokeWidth=".6"/>}</g>)}
    </svg>
    <div className="network-meter"><span>MODEL ACTIVATION</span><b>{activation}%</b><div><i style={{width:activation+"%"}}/></div></div>
    <div className={"broadcast-state "+(broadcast?"reached":"not-reached")}><b>{broadcast?"THRESHOLD CROSSED":"BELOW THRESHOLD"}</b><p>{broadcast?"In this toy model, the signal is globally available for report and further processing.":"Activity remains local in this toy model. Increase input or recurrent amplification to cross the chosen threshold."}</p></div>
    <button className="consciousness-report" onClick={()=>setReport(v=>!v)}>{report?"HIDE MODEL REPORT":"TEST REPORTABILITY"}</button>
    {report&&<p className="consciousness-report-result">{broadcast?"The model predicts that this information can be reported. That is a claim about access and report, not proof of subjective feeling.":"The model predicts that this information is not globally available for report. It cannot establish whether any experience is present."}</p>}
   </div>
   <div className="consciousness-note"><b>IMPORTANT LIMIT</b><p>This is a teaching diagram inspired by global-workspace ideas. It is not a neural simulation, does not reproduce a published equation, and cannot detect or generate consciousness. Crossing its threshold only changes the model's information-access state.</p></div>
  </div>}
  {study==="identity"&&<div className="consciousness-study identity-study">
   <div className="consciousness-copy"><span className="equation-label">THOUGHT EXPERIMENT 02 / PERSONAL IDENTITY</span><h2>If everything changes,<br/><em>what stays you?</em></h2><p>Imagine waking tomorrow with a different body, but your memories and psychological dispositions remain. Now change the scenario: keep the body, but remove most autobiographical memory. Which kind of continuity matters most to your judgement?</p>
    <label className="identity-control"><span>BODY CONTINUITY</span><div><button className={body==="same"?"active":""} onClick={()=>setBody("same")}>SAME BODY</button><button className={body==="different"?"active":""} onClick={()=>setBody("different")}>DIFFERENT BODY</button></div></label>
    <label className="identity-control"><span>MEMORY CONTINUITY</span><div><button className={memory==="intact"?"active":""} onClick={()=>setMemory("intact")}>MOSTLY INTACT</button><button className={memory==="partial"?"active":""} onClick={()=>setMemory("partial")}>PARTIAL</button><button className={memory==="lost"?"active":""} onClick={()=>setMemory("lost")}>MOSTLY LOST</button></div></label>
   </div>
   <div className="identity-result"><span className="equation-label">YOUR CURRENT SCENARIO</span><div className="identity-diagram"><div><small>BODY</small><b>{body==="same"?"CONTINUES":"CHANGES"}</b></div><span>+</span><div><small>MEMORY</small><b>{memory==="intact"?"MOSTLY CONTINUES":memory==="partial"?"PARTLY CONTINUES":"MOSTLY LOST"}</b></div></div><p>{body==="same"&&memory==="intact"?"Both bodily and psychological continuity are preserved in this scenario.":body==="different"&&memory==="intact"?"Psychological continuity is preserved while bodily continuity is interrupted.":body==="same"&&memory==="lost"?"Bodily continuity remains, while much autobiographical memory is absent.":"Both bodily and autobiographical continuity are substantially disrupted."}</p><div className="identity-question">Would you regard the person who wakes up as the same person?</div><p className="consciousness-small">There is no hidden correct answer. Philosophers disagree about which criteria matter, and real-world identity involves more than these two variables.</p></div>
   <div className="consciousness-note"><b>WHAT THIS EXAMINES</b><p>Psychological-continuity accounts emphasise memory, intentions and connected mental states. Biological accounts emphasise continuity of the living organism. This thought experiment exposes competing criteria; it does not settle the debate.</p></div>
  </div>}
  {study==="explanations"&&<div className="consciousness-study hard-problem-study">
   <div className="consciousness-copy"><span className="equation-label">QUESTION 03 / EXPLANATORY GAP</span><h2>Explaining what the brain does<br/><em>is not yet explaining experience.</em></h2><p>Consider the difference between a third-person description of a process and the first-person fact that it feels like something. The distinction is easy to state. Its implications are difficult.</p></div>
   <div className="explanation-columns"><article><span>01 / FUNCTION</span><h3>What can be investigated?</h3><p>Neuroscience can study neural correlates, sensory processing, attention, wakefulness, report, memory and behaviour. These are empirical targets with methods, evidence and limitations.</p></article><article><span>02 / EXPERIENCE</span><h3>What needs explaining?</h3><p>Why should any physical process be accompanied by a subjective point of view? Why is seeing red experienced, rather than merely processed? This is often called the hard problem.</p></article></div>
   <div className="position-list"><span className="equation-label">THREE FAMILIAR POSITIONS</span><article><b>PHYSICALISM</b><p>Consciousness is wholly physical, even if the explanation is not yet complete.</p></article><article><b>DUALISM</b><p>Mind and physical matter are fundamentally distinct in some respect.</p></article><article><b>IDEALISM</b><p>Mind or experience is fundamental to reality, rather than derived from matter.</p></article><p className="consciousness-small">These labels cover diverse positions. Listing them does not imply they are equally supported or equally coherent. Each faces serious objections.</p></div>
   <div className="consciousness-note"><b>KEEP THE CATEGORIES SEPARATE</b><p>A neural correlate is not automatically an explanation. A philosophical argument is not an experimental result. A spiritual interpretation may be meaningful to someone without being established by neuroscience. BEYOND will label these kinds of claims separately.</p></div>
  </div>}
  <section className="consciousness-reading"><span className="equation-label">A DISCIPLINE OF QUESTIONS</span><h2>Stay precise where<br/><em>certainty runs out.</em></h2><div className="consciousness-reading-grid"><div><b>OBSERVATION</b><p>What can be measured, repeated and independently checked?</p></div><div><b>INTERPRETATION</b><p>What model best explains the observations, and what alternatives remain?</p></div><div><b>OPEN QUESTION</b><p>What does the evidence leave unresolved? Do not fill the gap with confidence.</p></div></div></section>
  <footer className="consciousness-foot"><span>CONSCIOUSNESS / MIND & PHILOSOPHY</span><span>MODEL ≠ MIND · REPORT ≠ EXPERIENCE</span></footer>
 </section>;
}
