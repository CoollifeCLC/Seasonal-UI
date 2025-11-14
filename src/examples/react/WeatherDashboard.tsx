import React, { useMemo } from "react";
import SeasonalUIProvider from "../../provider/SeasonalUIProvider";
import { useSeasonalTheme } from "../../useSeasonalTheme";
import { useWeatherTheme } from "../../useWeatherTheme";
import "../../css/seasonal.css";
import "../../css/token.css";
import WeatherFX from "./fx/WeatherFX";

/* ───────────────────── helpers ───────────────────── */
const WXS = ["clear","cloudy","fog","wind","rain","snow","storm"] as const;
type Wx = typeof WXS[number];

function qset(key: string, val: string | null) {
  const url = new URL(location.href);
  if (val) url.searchParams.set(key, val); else url.searchParams.delete(key);
  history.replaceState(null, "", url.toString());
  location.reload();
}

/* ───────────────────── small charts (SVG) ───────────────────── */
function MiniBarChart({ values }: { values: number[] }) {
  const max = Math.max(...values, 1);
  const h = 80, w = 280, bw = w / values.length;
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      {values.map((v, i) => {
        const barH = (v / max) * (h - 10);
        return (
          <rect key={i}
            x={i * bw + 2} y={h - barH}
            width={bw - 4} height={barH}
            rx="3"
            fill="var(--accent)" opacity="0.85" />
        );
      })}
    </svg>
  );
}

function Sparkline({ values }: { values: number[] }) {
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const h = 60, w = 280;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w;
    const y = h - ((v - min) / (max - min || 1)) * (h - 4) - 2;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <polyline fill="none" stroke="var(--accent)" strokeWidth="2.5" points={pts} />
    </svg>
  );
}

function Donut({ value, label }: { value: number; label: string }) {
  const r = 38, c = 2 * Math.PI * r, pct = Math.max(0, Math.min(100, value));
  return (
    <div className="flex items-center gap-3">
      <svg width="90" height="90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={r} fill="none" stroke="var(--border)" strokeWidth="10" />
        <circle cx="50" cy="50" r={r} fill="none" stroke="var(--accent)" strokeWidth="10"
                strokeDasharray={`${(pct/100)*c} ${c}`} transform="rotate(-90 50 50)" />
        <text x="50" y="54" textAnchor="middle" fill="var(--fg)" fontSize="16" fontWeight="700">{pct}%</text>
      </svg>
      <div>
        <div className="text-fg font-semibold">{label}</div>
        <div className="text-muted text-sm">Chance</div>
      </div>
    </div>
  );
}

/* ───────────────────── UI Primitives ───────────────────── */
function Card(props: React.HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={`card glass ${props.className || ""}`} />;
}
function KPI({ title, value, hint }: { title: string; value: string; hint?: string }) {
  return (
    <div className="surface kpi">
      <div className="text-muted text-sm">{title}</div>
      <div className="text-fg text-2xl font-bold mt-1">{value}</div>
      {hint && <div className="text-muted text-xs mt-1">{hint}</div>}
    </div>
  );
}

/* ───────────────────── Dashboard ───────────────────── */
export default function WeatherDashboard() {
  const season = useSeasonalTheme();
  const weather = useWeatherTheme() as Wx;

  // mock data (stable but “live-ish”)
  const bars = useMemo(() => Array.from({length: 24}, (_,i)=> (Math.sin(i/3)+1)*50 + (Math.random()*20)), []);
  const spark = useMemo(() => Array.from({length: 30}, () => 30 + Math.random()*70), []);
  const chance = { rain: 42, snow: 15, wind: 63 };

  return (
    <SeasonalUIProvider>
      <WeatherFX />
      <div className="relative z-[1] min-h-screen bg-bg text-fg">
        {/* Top bar */}
        <header className="navbar py-6">
          <div className="flex items-center py-6 gap-3">
            <div className="w-8 h-8 rounded-md bg-accent" />
            <div className="text-fg font-semibold">Seasonal-UI • Weather Dashboard</div>
          </div>
          <div className="flex items-center py-6 gap-2">
            <span className="badge">season: {season}</span>
            <span className="badge">weather: {weather}</span>
          </div>
        </header>

        <main className="container mx-auto px-4 py-6 max-w-7xl">
          {/* Controls row */}
          <Card className="mb-6">
            <div className="flex flex-wrap items-center gap-2">
              <div className="text-muted mr-2">Weather:</div>
              {WXS.map(w => (
                <button key={w}
                        className={`btn ${w===weather ? "" : "btn-ghost"}`}
                        onClick={()=>qset("weather", w)}>
                  {w}
                </button>
              ))}
              <button className="btn btn-ghost" onClick={()=>qset("weather", null)}>auto</button>
              <div className="h-6 w-px bg-[var(--border)] mx-2" />
              <div className="text-muted mr-2">Season:</div>
              {["default","halloween","thanksgiving","christmas","easter"].map(s => (
                <button key={s} className="btn btn-ghost" onClick={()=>qset("season", s)}>{s}</button>
              ))}
              <button className="btn btn-ghost" onClick={()=>qset("season", null)}>auto</button>
            </div>
          </Card>

          {/* Grid */}
          <div className="dash grid p-2 gap-4">
            {/* Left rail – KPIs */}
            <div className="rail">
              <KPI title="Temp (feels like)" value="42°F" hint="Norfolk, VA" />
              <KPI title="Humidity" value="72%" />
              <KPI title="Wind" value="14 mph" hint="Gusts 22 mph" />
              <KPI title="Pressure" value="1016 hPa" />
            </div>

            {/* Center – bars then sparkline */}
            <Card className="panel">
              <div className="panel-title">Hourly precipitation</div>
              <MiniBarChart values={bars} />
              <div className="panel-sub">Next 24h (mock)</div>
            </Card>

            {/* Right – donuts */}
            <Card className="panel">
              <div className="panel-title">Event probability</div>
              <div className="donuts">
                <Donut value={42} label="Rain" />
                <Donut value={15} label="Snow" />
                <Donut value={63} label="Wind" />
              </div>
            </Card>

            {/* Full-width – sparkline */}
            <Card className="panel panel-wide">
              <div className="panel-title">7-day temperature trend</div>
              <Sparkline values={spark} />
              <div className="panel-sub">High/low averaged (mock)</div>
            </Card>

            {/* Controls – compact */}
          </div>
        </main>
      </div>
    </SeasonalUIProvider>
  );
}
/* ───────────────────── end ───────────────────── */