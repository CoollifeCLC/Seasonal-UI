import { useEffect, useState } from 'react';
import { detectWeatherState, applyWeather, WeatherState } from './weather';

const PARAM = 'weather';
const CACHE_KEY = 'seasonal-ui:wx';
const TTL_MS = 15 * 60 * 1000;

function getCached(): {wx: WeatherState; t: number} | null {
  try { return JSON.parse(localStorage.getItem(CACHE_KEY) || 'null'); } catch { return null; }
}

export function useWeatherTheme() {
  const [wx, setWx] = useState<WeatherState>('clear');

  useEffect(() => {
    const manual = new URLSearchParams(location.search).get(PARAM) as WeatherState | null;
    if (manual) {
      applyWeather(manual);
      setWx(manual);
      return;
    }

    const cached = getCached();
    if (cached && Date.now() - cached.t < TTL_MS) {
      applyWeather(cached.wx);
      setWx(cached.wx);
      return;
    }

    (async () => {
      const state = await detectWeatherState();
      applyWeather(state);
      setWx(state);
      localStorage.setItem(CACHE_KEY, JSON.stringify({ wx: state, t: Date.now() }));
    })();

    const vis = () => {
      if (document.visibilityState === 'visible') {
        const c = getCached();
        if (!c || Date.now() - c.t > TTL_MS) {
          localStorage.removeItem(CACHE_KEY);
          location.reload();
        }
      }
    };
    document.addEventListener('visibilitychange', vis);
    return () => document.removeEventListener('visibilitychange', vis);
  }, []);

  return wx;
}
