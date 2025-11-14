// examples/react/SeasonalUIDemo.tsx
// Demo page showcasing Seasonal-UI + Tailwind token mapping
// - Auto seasons + weather themes
// - Tailwind classes bound to CSS tokens (see src/css/tokens.css)
// - Simple controls for QA (override via query params)

import React, { useEffect, useMemo, useRef, useState } from "react";
import SeasonalUIProvider from "../../../src/provider/SeasonalUIProvider";
import { useSeasonalTheme } from "../../../src/useSeasonalTheme";
import { useWeatherTheme } from "../../../src/useWeatherTheme";

// Styles: core tokens + Tailwind token utilities
import "../../../src/css/seasonal.css"; // Seasonal-UI core tokens/themes
import "../../css/token.css";   // your Tailwind token helpers (bg-card, text-fg, etc.)

// ─────────────────────────────────────────────────────────────────────────────
// Minimal WeatherFX Canvas Overlay — reads html[data-wx] and --fx-opacity
// ─────────────────────────────────────────────────────────────────────────────
function WeatherFX() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    let raf = 0, w = 0, h = 0;
    let particles: {x:number;y:number;vx:number;vy:number;size:number}[] = [];

    function wx() { return document.documentElement.dataset.wx || "clear"; }
    function fxOpacity() {
      const cs = getComputedStyle(document.documentElement);
      const v = parseFloat(cs.getPropertyValue("--fx-opacity"));
      return Number.isFinite(v) ? v : 0;
    }

    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      const count = Math.min(260, Math.floor((w*h)/14000));
      particles = new Array(count).fill(0).map(spawn);
    }
    function spawn(): any {
      const W = wx();
      const base:any = { x: Math.random()*w, y: Math.random()*-h };
      if (W === "rain" || W === "storm") return { ...base, vx: -1 - Math.random()*0.6, vy: 8 + Math.random()*4, size: 1 };
      if (W === "snow") return { ...base, vx: -0.4 + Math.random()*0.8, vy: 1 + Math.random()*1.2, size: 1 + Math.random()*2 };
      return { ...base, vx:0, vy:0, size:0 };
    }
    function draw() {
      const W = wx();
      const alpha = fxOpacity();
      ctx.clearRect(0,0,w,h);
      if (alpha <= 0) { raf = requestAnimationFrame(draw); return; }
      ctx.globalAlpha = alpha;
      if (W === "rain" || W === "storm") {
        ctx.strokeStyle = "rgba(255,255,255,0.8)";
        ctx.lineWidth = 1;
        for (const p of particles) {
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x + p.vx*2, p.y + p.vy*2); ctx.stroke();
          p.x += p.vx; p.y += p.vy;
          if (p.y > h || p.x < -20) Object.assign(p, spawn(), { y: -10 });
        }
      } else if (W === "snow") {
        ctx.fillStyle = "rgba(255,255,255,0.9)";
        for (const p of particles) {
          ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI*2); ctx.fill();
          p.x += p.vx; p.y += p.vy;
          if (p.y > h+10) Object.assign(p, spawn(), { y: -10, x: Math.random()*w });
        }
      }
      raf = requestAnimationFrame(draw);
    }

    const onVis = () => {
      if (document.visibilityState === "hidden") cancelAnimationFrame(raf);
      else draw();
    };

    resize(); draw();
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return <canvas className="wx-layer" aria-hidden ref={ref} />;
}

// ─────────────────────────────────────────────────────────────────────────────
// Utility: mutate query params for quick manual override
// ─────────────────────────────────────────────────────────────────────────────
function useQueryParam(key: string): [string | null, (val: string | null) => void] {
  const [val, setVal] = useState<string | null>(() => new URLSearchParams(location.search).get(key));
  const set = (next: string | null) => {
    const url = new URL(location.href);
    if (next) url.searchParams.set(key, next); else url.searchParams.delete(key);
    history.replaceState(null, "", url.toString());
    setVal(next);
    // force a reload so Seasonal-UI hooks can re-evaluate when using overrides
    location.reload();
  };
  return [val, set];
}

// Simple token badge
function Badge({ children }: { children: React.ReactNode }) {
  return <span className="badge text-accent">{children}</span>;
}

// Navbar with season/weather badges
function Navbar({ season, weather }: { season: string; weather: string }) {
  return (
    <header className="navbar">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-md bg-accent" />
        <div className="text-fg font-semibold">Seasonal-UI</div>
      </div>
      <div className="flex items-center gap-2">
        <span className="badge" title="active season">season: {season}</span>
        <span className="badge" title="active weather">weather: {weather}</span>
      </div>
    </header>
  );
}

// Controls (for demo only — uses query params)
function Controls() {
  const [s, setSeason] = useQueryParam("season");
  const [w, setWeather] = useQueryParam("weather");
  const seasons = ["default","spring","summer","fall","halloween","thanksgiving","christmas","easter","newyear"];
  const weathers = ["clear","cloudy","rain","snow","storm","fog","wind"];

  return (
    <div className="surface border-border p-4 rounded-md flex flex-wrap gap-3 items-center">
      <div className="text-muted">Debug overrides:</div>
      <select value={s ?? ""} onChange={(e)=>setSeason(e.target.value || null)} className="input max-w-[220px]">
        <option value="">season (auto)</option>
        {seasons.map(x => <option key={x} value={x}>{x}</option>)}
      </select>
      <select value={w ?? ""} onChange={(e)=>setWeather(e.target.value || null)} className="input max-w-[220px]">
        <option value="">weather (auto)</option>
        {weathers.map(x => <option key={x} value={x}>{x}</option>)}
      </select>
      <a href="?" className="btn btn-ghost">Reset</a>
    </div>
  );
}

// Cards grid to showcase tokenized UI
function FeatureCards() {
  const items = [
    { title: "Design Tokens", desc: "Colors, borders, and shadows flow from CSS variables bound to seasons & weather." },
    { title: "Tailwind Mapping", desc: "Use bg-card, text-fg, border-border — no custom CSS needed for themes." },
    { title: "Weather FX", desc: "Snow / rain / storm particles layer via canvas. Respects reduced motion." },
    { title: "Accessibility", desc: "Strong focus rings, high-contrast mode, reduced motion support." },
  ];
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
      {items.map((it, i) => (
        <div key={i} className="card">
          <div className="text-fg text-lg font-semibold">{it.title}</div>
          <p className="text-muted mt-2">{it.desc}</p>
          <div className="mt-4 flex gap-2">
            <button className="btn">Primary</button>
            <button className="btn btn-ghost">Ghost</button>
          </div>
        </div>
      ))}
    </div>
  );
}

// Demo table
function DemoTable() {
  return (
    <div className="mt-6">
      <div className="table">
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left">Token</th>
              <th className="text-left">Example</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>--accent</td><td><span className="badge">accent</span></td></tr>
            <tr><td>--bg</td><td className="text-muted">background</td></tr>
            <tr><td>--card</td><td><div className="surface">surface</div></td></tr>
            <tr><td>--border</td><td className="text-muted">border color</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Footer
function Footer() {
  return (
    <footer className="mt-12 text-center text-muted">
      Built with <span className="text-accent font-semibold">Seasonal-UI</span> · CSS that reacts to reality.
    </footer>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────
export default function SeasonalUIDemoPage() {
  const season = useSeasonalTheme();
  const weather = useWeatherTheme();

  return (
    <SeasonalUIProvider>
      <WeatherFX />
      <div className="relative z-[1] min-h-screen bg-bg text-fg">
        <Navbar season={season} weather={weather} />

        <main className="max-w-6xl mx-auto px-4 py-10">
          <section className="card">
            <h1 className="text-3xl font-bold" style={{ color: "var(--accent)" }}>
              Seasonal-UI + Tailwind Demo
            </h1>
            <p className="text-muted mt-2">
              Dark mode was step one. Seasonal & weather-aware UI is the evolution.
              Change your environment — the UI follows.
            </p>
            <div className="mt-4 flex gap-2">
              <a className="btn" href="https://www.npmjs.com/" target="_blank" rel="noreferrer">Install</a>
              <a className="btn btn-ghost" href="https://github.com/" target="_blank" rel="noreferrer">GitHub</a>
            </div>
          </section>

          <div className="mt-6"><Controls /></div>

          <FeatureCards />
          <DemoTable />
          <Footer />
        </main>
      </div>
    </SeasonalUIProvider>
  );
}
