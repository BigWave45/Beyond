import { useEffect, useState } from "react";
import Emergence from "./Emergence";
import { ArrowDown, ArrowRight, ArrowUpRight, Menu, X, Sparkles } from "lucide-react";

type World = {
  id: string;
  number: string;
  name: string;
  line: string;
  description: string;
  category: string;
  className: string;
  detail: string;
};

const worlds: World[] = [
  { id: "infinity", number: "01", name: "Infinity", line: "Where the end never arrives.", description: "Explore mathematical universes, recursive forms and patterns that reveal new worlds the closer you look.", category: "MATHEMATICS", className: "art-infinity", detail: "A simple equation can generate a universe of extraordinary complexity. Begin with z → z² + c, then follow the shape as it unfolds. Our first interactive study will let you navigate the Mandelbrot set, discover its self-similar structures and see how tiny changes in a rule transform the whole." },
  { id: "dimensions", number: "02", name: "Dimensions", line: "More than the eye can hold.", description: "Move beyond familiar space and investigate the geometry of higher dimensions.", category: "GEOMETRY", className: "art-dimensions", detail: "We know how to move through three dimensions. But how might a fourth spatial dimension be represented? Explore projections, rotations and the geometry of a tesseract: a four-dimensional analogue of a cube." },
  { id: "perception", number: "03", name: "Perception", line: "Seeing is not the same as knowing.", description: "Test the boundaries of sight, attention, memory and the mind's interpretation of reality.", category: "COGNITION", className: "art-perception", detail: "Your brain does not passively record the world. It interprets signals, fills gaps and makes predictions. This room will bring those processes into view through optical illusions and perception experiments." },
  { id: "patterns", number: "04", name: "Patterns", line: "Order hiding in plain sight.", description: "Create living forms from symmetry, repetition, algorithms and natural systems.", category: "GENERATIVE ART", className: "art-patterns", detail: "A few rules can create astonishing forms. Adjust symmetry, repetition, colour and mathematical parameters to make a composition that has never existed before." },
  { id: "consciousness", number: "05", name: "Consciousness", line: "The mystery looking back.", description: "Enter questions of awareness, identity, dreams, memory and subjective experience.", category: "PHILOSOPHY", className: "art-consciousness", detail: "Why is there something it feels like to be you? Explore the hard problem of consciousness, personal identity, attention and the relationship between brain, mind and experience. Scientific findings, philosophical arguments and spiritual interpretations will be clearly distinguished." },
  { id: "art", number: "06", name: "Art", line: "A world made of possibility.", description: "Meet visual experiments, expressive forms and tools for making something of your own.", category: "CREATION", className: "art-art", detail: "Art is not an ornament around discovery. It is a way of discovering. This room will bring together digital installations, generative canvases, visual studies and experiments made by visitors." }
];

function FractalMark() {
  return <div className="fractal-mark" aria-hidden="true"><span /><span /><span /><span /><span /></div>;
}

function WorldArtwork({ className }: { className: string }) {
  return <div className={`world-art ${className}`} aria-hidden="true">
    <div className="art-orb" /><div className="art-ring ring-one" /><div className="art-ring ring-two" /><div className="art-grid" />
    <div className="art-grain" />
  </div>;
}

export default function App() {
  const [active, setActive] = useState<World | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [entered, setEntered] = useState(false);
  const [showEmergence, setShowEmergence] = useState(false);

  useEffect(() => {
    document.body.style.overflow = active || menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [active, menuOpen]);

  const openWorld = (world: World) => { setActive(world); setMenuOpen(false); };
  const scrollToWorlds = () => document.getElementById("worlds")?.scrollIntoView({ behavior: "smooth" });

  if (showEmergence) return <main className="experience-shell">
    <header className="topbar">
      <a className="wordmark" href="#top" onClick={(e) => { e.preventDefault(); setShowEmergence(false); }} aria-label="Return to Beyond home"><span className="wordmark-symbol">B</span><span>BEYOND</span></a>
      <span className="topbar-note">PATTERNS / FIELD STUDY 001</span>
      <button className="explore-button" onClick={() => setShowEmergence(false)}><span>BACK TO THE WORLDS</span><ArrowRight size={17} /></button>
    </header>
    <Emergence />
  </main>;

  return <main>
    <header className="topbar">
      <a className="wordmark" href="#top" aria-label="Beyond home"><span className="wordmark-symbol">B</span><span>BEYOND</span></a>
      <span className="topbar-note">AN ATLAS OF THE UNSEEN</span>
      <button className="menu-toggle" onClick={() => setMenuOpen(true)} aria-label="Open navigation"><Menu size={21} /></button>
      <nav className="desktop-nav"><a href="#worlds">EXPLORE</a><a href="#manifesto">ABOUT</a><span className="status-dot" /> <span className="nav-status">A WORK IN PROGRESS</span></nav>
    </header>

    {menuOpen && <div className="mobile-menu"><button className="close-menu" onClick={() => setMenuOpen(false)} aria-label="Close navigation"><X /></button><span className="eyebrow">NAVIGATE</span><a onClick={() => { setMenuOpen(false); scrollToWorlds(); }}>Explore the worlds <ArrowUpRight /></a><a onClick={() => { setMenuOpen(false); document.getElementById("manifesto")?.scrollIntoView({ behavior: "smooth" }); }}>About BEYOND <ArrowUpRight /></a><p>Six doors. No final destination.</p></div>}

    <section className="hero" id="top">
      <div className="hero-noise" />
      <div className="hero-copy">
        <div className="eyebrow hero-eyebrow"><span className="eyebrow-line" /> AN INTERACTIVE UNIVERSE <span className="eyebrow-line" /></div>
        <h1>There is more<br /> <em>to everything.</em></h1>
        <p className="hero-description">A space to explore the strange, the beautiful and the not-yet-understood — through art, science, mathematics and ideas.</p>
        <button className="explore-button" onClick={() => { setEntered(true); scrollToWorlds(); }}><span>{entered ? "CONTINUE EXPLORING" : "ENTER THE UNKNOWN"}</span><ArrowRight size={17} /></button>
      </div>
      <div className="hero-visual"><div className="hero-halo halo-a" /><div className="hero-halo halo-b" /><div className="hero-core"><FractalMark /></div><div className="hero-coordinate coordinate-a">0.000 / ∞</div><div className="hero-coordinate coordinate-b">FIG. 001 — THE BEGINNING</div><div className="hero-vertical">OBSERVE · QUESTION · DISCOVER</div></div>
      <div className="hero-footer"><span>01 — 06 / WORLDS</span><span className="scroll-cue"><ArrowDown size={14} /> SCROLL TO DISCOVER</span><span>EST. IN CURIOSITY</span></div>
    </section>

    <section className="intro-strip" id="manifesto"><span className="eyebrow">A DIFFERENT KIND OF EXPLORATION</span><p>Not everything meaningful can be explained.<br /><em>Some things have to be experienced.</em></p><span className="intro-aside">ART × SCIENCE × WONDER</span></section>

    <section className="worlds-section" id="worlds">
      <div className="section-heading"><div><span className="eyebrow">CHOOSE YOUR FIRST DOOR</span><h2>Six ways <em>in.</em></h2></div><span className="section-count">01 / 06<br />THE WORLDS</span></div>
      <div className="world-grid">{worlds.map((world) => <button className="world-card" key={world.id} onClick={() => openWorld(world)}>
        <WorldArtwork className={world.className} />
        <span className="card-top"><span>{world.number} / 06</span><span>{world.category}</span></span>
        <span className="card-bottom"><span><strong>{world.name}</strong><small>{world.line}</small></span><span className="card-arrow"><ArrowUpRight size={19} /></span></span>
      </button>)}</div>
    </section>

    <section className="closing-note"><Sparkles size={17} /><p>The map is not the territory.<br /><em>And this is only the beginning.</em></p><button onClick={scrollToWorlds}>WANDER A LITTLE LONGER <ArrowRight size={15} /></button></section>
    <footer><a className="wordmark" href="#top"><span className="wordmark-symbol">B</span><span>BEYOND</span></a><span>AN OPEN-ENDED EXPLORATION</span><span>© 2026 — MADE OF QUESTIONS</span></footer>

    {active && <div className="world-overlay" role="dialog" aria-modal="true" aria-labelledby="world-title" onClick={() => setActive(null)}>
      <div className="world-detail" onClick={e => e.stopPropagation()}><button className="detail-close" onClick={() => setActive(null)} aria-label="Close world"><X /></button><WorldArtwork className={active.className} /><div className="detail-content"><span className="eyebrow">{active.number} / 06 — {active.category}</span><h2 id="world-title">{active.name}<em>.</em></h2><p className="detail-line">{active.line}</p><p className="detail-description">{active.detail}</p>{active.id === "patterns" && <button className="detail-next" onClick={() => { setActive(null); setShowEmergence(true); }}>OPEN FIELD STUDY 001 — HOW DOES ORDER EMERGE? <ArrowRight size={16} /></button>}<div className="detail-foot"><span>THIS WORLD IS GROWING</span><span>EXPERIENCE COMING INTO FOCUS <span className="pulse-dot" /></span></div></div><button className="detail-next" onClick={() => setActive(worlds[(worlds.findIndex(w => w.id === active.id) + 1) % worlds.length])}>NEXT WORLD <ArrowRight size={16} /></button></div>
    </div>}
  </main>;
}