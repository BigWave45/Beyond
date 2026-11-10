import { useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw, Waves } from "lucide-react";
import "./emergence.css";

const SIZE = 176;
const DU = 0.16;
const DV = 0.08;

type Parameters = { feed: number; kill: number; paused: boolean };
type Simulation = { reset: () => void; inject: (x: number, y: number) => void };

export default function Emergence() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const simulationRef = useRef<Simulation | null>(null);
  const parametersRef = useRef<Parameters>({ feed: 0.055, kill: 0.062, paused: false });
  const [feed, setFeed] = useState(0.055);
  const [kill, setKill] = useState(0.062);
  const [paused, setPaused] = useState(false);

  parametersRef.current = { feed, kill, paused };

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d", { alpha: false });
    if (!canvas || !context) return;

    canvas.width = SIZE;
    canvas.height = SIZE;
    const count = SIZE * SIZE;
    let u = new Float32Array(count);
    let v = new Float32Array(count);
    let nextU = new Float32Array(count);
    let nextV = new Float32Array(count);
    const pixels = context.createImageData(SIZE, SIZE);
    let frame = 0;

    const reset = () => {
      u.fill(1);
      v.fill(0);
      nextU.fill(1);
      nextV.fill(0);
      const seed = (cx: number, cy: number, radius: number) => {
        for (let y = -radius; y <= radius; y++) {
          for (let x = -radius; x <= radius; x++) {
            if (x * x + y * y > radius * radius) continue;
            const px = (cx + x + SIZE) % SIZE;
            const py = (cy + y + SIZE) % SIZE;
            const index = py * SIZE + px;
            u[index] = 0.5;
            v[index] = 0.25;
          }
        }
      };
      seed(SIZE / 2, SIZE / 2, 10);
      seed(SIZE / 2 - 24, SIZE / 2 + 17, 4);
      seed(SIZE / 2 + 29, SIZE / 2 - 20, 5);
    };

    const inject = (x: number, y: number) => {
      const cx = Math.floor(x * SIZE);
      const cy = Math.floor(y * SIZE);
      for (let oy = -5; oy <= 5; oy++) {
        for (let ox = -5; ox <= 5; ox++) {
          if (ox * ox + oy * oy > 25) continue;
          const px = (cx + ox + SIZE) % SIZE;
          const py = (cy + oy + SIZE) % SIZE;
          const index = py * SIZE + px;
          u[index] = 0.5;
          v[index] = 0.25;
        }
      }
    };

    const laplacian = (field: Float32Array, x: number, y: number, index: number) => {
      const left = x === 0 ? index + SIZE - 1 : index - 1;
      const right = x === SIZE - 1 ? index - SIZE + 1 : index + 1;
      const up = y === 0 ? index + (SIZE - 1) * SIZE : index - SIZE;
      const down = y === SIZE - 1 ? index - (SIZE - 1) * SIZE : index + SIZE;
      const ul = up - (x === 0 ? 0 : 1) + (x === 0 ? SIZE - 1 : 0);
      const ur = up + (x === SIZE - 1 ? 0 : 1) - (x === SIZE - 1 ? SIZE - 1 : 0);
      const dl = down - (x === 0 ? 0 : 1) + (x === 0 ? SIZE - 1 : 0);
      const dr = down + (x === SIZE - 1 ? 0 : 1) - (x === SIZE - 1 ? SIZE - 1 : 0);
      return -field[index] + 0.2 * (field[left] + field[right] + field[up] + field[down]) +
        0.05 * (field[ul] + field[ur] + field[dl] + field[dr]);
    };

    const render = () => {
      const data = pixels.data;
      for (let i = 0; i < count; i++) {
        const value = Math.max(0, Math.min(1, v[i] * 3.2));
        const glow = Math.pow(value, 0.72);
        const offset = i * 4;
        data[offset] = 7 + glow * 174;
        data[offset + 1] = 10 + glow * 181;
        data[offset + 2] = 17 + glow * 218;
        data[offset + 3] = 255;
      }
      context.putImageData(pixels, 0, 0);
    };

    const tick = () => {
      const params = parametersRef.current;
      if (!params.paused) {
        for (let pass = 0; pass < 2; pass++) {
          for (let y = 0; y < SIZE; y++) {
            for (let x = 0; x < SIZE; x++) {
              const i = y * SIZE + x;
              const a = u[i];
              const b = v[i];
              const reaction = a * b * b;
              const du = DU * laplacian(u, x, y, i) - reaction + params.feed * (1 - a);
              const dv = DV * laplacian(v, x, y, i) + reaction - (params.feed + params.kill) * b;
              nextU[i] = Math.max(0, Math.min(1, a + du));
              nextV[i] = Math.max(0, Math.min(1, b + dv));
            }
          }
          [u, nextU] = [nextU, u];
          [v, nextV] = [nextV, v];
        }
      }
      if (frame++ % 2 === 0) render();
      animation = requestAnimationFrame(tick);
    };

    reset();
    render();
    simulationRef.current = { reset, inject };
    let animation = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(animation);
      simulationRef.current = null;
    };
  }, []);

  const handlePointer = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    simulationRef.current?.inject((event.clientX - rect.left) / rect.width, (event.clientY - rect.top) / rect.height);
  };

  return (
    <section className="emergence-section" id="emergence">
      <div className="emergence-heading">
        <span className="eyebrow"><Waves size={13} /> A STUDY IN EMERGENCE</span>
        <h2>Complexity has <em>rules.</em></h2>
        <p>Two interacting substances. A handful of parameters. Patterns that were never drawn by hand.</p>
      </div>
      <div className="emergence-lab">
        <div className="emergence-visual">
          <canvas ref={canvasRef} onPointerDown={handlePointer} aria-label="Interactive reaction-diffusion simulation. Touch or click to introduce a new disturbance." />
          <span className="simulation-label">LIVE SYSTEM / GRAY–SCOTT MODEL</span>
          <span className="simulation-hint">TOUCH THE FIELD TO INTRODUCE A DISTURBANCE</span>
        </div>
        <div className="emergence-controls">
          <div className="controls-top"><span>PARAMETERS</span><span>01 / 03</span></div>
          <label className="parameter-control">
            <span><span>Feed rate <i>f</i></span><output>{feed.toFixed(3)}</output></span>
            <input type="range" min="0.020" max="0.070" step="0.001" value={feed} onChange={e => setFeed(Number(e.target.value))} />
          </label>
          <label className="parameter-control">
            <span><span>Kill rate <i>k</i></span><output>{kill.toFixed(3)}</output></span>
            <input type="range" min="0.045" max="0.070" step="0.001" value={kill} onChange={e => setKill(Number(e.target.value))} />
          </label>
          <div className="simulation-actions">
            <button onClick={() => setPaused(value => !value)}>{paused ? <Play size={14} /> : <Pause size={14} />}{paused ? "RESUME" : "PAUSE"}</button>
            <button onClick={() => simulationRef.current?.reset()}><RotateCcw size={14} /> RESET</button>
          </div>
          <div className="equation-block">
            <span className="equation-label">THE GOVERNING EQUATIONS</span>
            <div>∂u/∂t = Dᵤ∇²u − uv² + f(1 − u)</div>
            <div>∂v/∂t = Dᵥ∇²v + uv² − (f + k)v</div>
            <p>Diffusion, reaction and feed/kill rates determine how the system evolves. Adjust <i>f</i> and <i>k</i> to change its behaviour.</p>
          </div>
        </div>
      </div>
      <div className="emergence-footnote"><span>MODEL: GRAY–SCOTT REACTION–DIFFUSION</span><span>SIMPLIFIED 2D NUMERICAL APPROXIMATION</span></div>
    </section>
  );
}
