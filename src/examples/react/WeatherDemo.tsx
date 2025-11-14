import React from "react";
import SeasonalUIProvider from "../../provider/SeasonalUIProvider";
import { useSeasonalTheme } from "../../useSeasonalTheme";
import { useWeatherTheme } from "../../useWeatherTheme";
import "../../css/seasonal.css";
import "../../css/token.css";
import WeatherFX from "./fx/WeatherFX"; // new file below

export default function WeatherDemo() {
  const season = useSeasonalTheme();
  const weather = useWeatherTheme();
  return (
    <SeasonalUIProvider>
      <WeatherFX />
      <div className="relative z-[1] min-h-screen bg-bg text-fg">
        <header className="navbar">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-accent" />
            <div className="text-fg font-semibold">Seasonal-UI • FX Demo</div>
          </div>
          <div className="flex items-center gap-2">
            <span className="badge">season: {season}</span>
            <span className="badge">weather: {weather}</span>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-4 py-8">
          <section className="card">
            <h1 className="text-2xl font-bold" style={{color: "var(--accent)"}}>Weather Presets</h1>
            <p className="text-muted mt-2">Use query params to override, e.g. <code>?weather=storm</code>.</p>
            <div className="mt-4 flex gap-2">
              {["clear","cloudy","fog","wind","rain","snow","storm"].map(w => (
                <a key={w} className="btn btn-ghost" href={`?weather=${w}`}>{w}</a>
              ))}
              <a className="btn" href="?" >auto</a>
            </div>
          </section>
        </main>
      </div>
    </SeasonalUIProvider>
  );
}
