import { useState as f, useEffect as u } from "react";
function h(e = {}) {
  if (e.override) return e.override;
  const t = e.now ? e.now() : /* @__PURE__ */ new Date(), n = t.getMonth() + 1, r = t.getDate();
  for (const a of e.rules ?? []) {
    const o = a(t);
    if (o) return o;
  }
  return n === 10 ? "halloween" : n === 11 && r >= 15 && r <= 30 ? "thanksgiving" : n === 12 && r <= 26 ? "christmas" : n === 4 && t.getDay() === 0 ? "easter" : "default";
}
function g(e) {
  document.documentElement.dataset.season = e;
}
async function v(e = 8e3) {
  return "geolocation" in navigator ? new Promise((t) => {
    navigator.geolocation.getCurrentPosition(
      (n) => t({ lat: n.coords.latitude, lon: n.coords.longitude }),
      () => t(null),
      { enableHighAccuracy: !0, timeout: e }
    );
  }) : null;
}
async function S(e = {}) {
  if (e.override) return e.override;
  const t = e.lat, n = e.lon;
  let r = t && n ? { lat: t, lon: n } : await v(e.timeoutMs ?? 8e3);
  r || (r = { lat: 40.7128, lon: -74.006 });
  const a = `https://api.open-meteo.com/v1/forecast?latitude=${r.lat}&longitude=${r.lon}&current=weather_code,precipitation,wind_speed_10m`, l = await (await fetch(a)).json(), c = l?.current?.weather_code ?? 0, w = l?.current?.wind_speed_10m ?? 0;
  return [71, 73, 75, 77, 85, 86].includes(c) ? "snow" : [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(c) ? "rain" : [95, 96, 99].includes(c) ? "storm" : [45, 48].includes(c) ? "fog" : w >= 12 && [0, 1, 2, 3].includes(c) ? "wind" : [1, 2, 3].includes(c) ? "cloudy" : "clear";
}
function i(e) {
  document.documentElement.dataset.wx = e;
}
const y = "season";
function E(e) {
  const [t, n] = f("default");
  return u(() => {
    const r = new URLSearchParams(location.search).get(y), a = h({ override: e?.override ?? r });
    g(a), n(a);
  }, []), t;
}
const p = "weather", s = "seasonal-ui:wx", d = 15 * 60 * 1e3;
function m() {
  try {
    return JSON.parse(localStorage.getItem(s) || "null");
  } catch {
    return null;
  }
}
function _() {
  const [e, t] = f("clear");
  return u(() => {
    const n = new URLSearchParams(location.search).get(p);
    if (n) {
      i(n), t(n);
      return;
    }
    const r = m();
    if (r && Date.now() - r.t < d) {
      i(r.wx), t(r.wx);
      return;
    }
    (async () => {
      const o = await S();
      i(o), t(o), localStorage.setItem(s, JSON.stringify({ wx: o, t: Date.now() }));
    })();
    const a = () => {
      if (document.visibilityState === "visible") {
        const o = m();
        (!o || Date.now() - o.t > d) && (localStorage.removeItem(s), location.reload());
      }
    };
    return document.addEventListener("visibilitychange", a), () => document.removeEventListener("visibilitychange", a);
  }, []), e;
}
function P({ children: e }) {
  return u(() => {
    const t = matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.documentElement.dataset.motion = t ? "reduce" : "ok";
  }, []), e;
}
export {
  P as SeasonalUIProvider,
  g as applySeason,
  i as applyWeather,
  h as detectSeason,
  S as detectWeatherState,
  v as getCoords,
  E as useSeasonalTheme,
  _ as useWeatherTheme
};
//# sourceMappingURL=index.esm.js.map
