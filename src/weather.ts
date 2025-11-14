export type WeatherState = 'clear' | 'cloudy' | 'rain' | 'snow' | 'storm' | 'fog' | 'wind';

export interface WeatherOptions {
  lat?: number;
  lon?: number;
  override?: WeatherState | null;  // e.g., ?weather=snow
  timeoutMs?: number;              // geolocation timeout
}

export async function getCoords(timeoutMs = 8000): Promise<{lat:number; lon:number} | null> {
  if (!('geolocation' in navigator)) return null;
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: timeoutMs }
    );
  });
}

export async function detectWeatherState(opts: WeatherOptions = {}): Promise<WeatherState> {
  if (opts.override) return opts.override;

  const lat = opts.lat;
  const lon = opts.lon;

  let coords = (lat && lon) ? {lat, lon} : (await getCoords(opts.timeoutMs ?? 8000));
  if (!coords) coords = { lat: 40.7128, lon: -74.0060 }; // NYC fallback

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=weather_code,precipitation,wind_speed_10m`;
  const r = await fetch(url);
  const j = await r.json();
  const code: number = j?.current?.weather_code ?? 0;
  const wind: number = j?.current?.wind_speed_10m ?? 0;

  if ([71,73,75,77,85,86].includes(code)) return 'snow';
  if ([51,53,55,56,57,61,63,65,66,67,80,81,82].includes(code)) return 'rain';
  if ([95,96,99].includes(code)) return 'storm';
  if ([45,48].includes(code)) return 'fog';
  if (wind >= 12 && [0,1,2,3].includes(code)) return 'wind';
  if ([1,2,3].includes(code)) return 'cloudy';
  return 'clear';
}

export function applyWeather(wx: WeatherState) {
  document.documentElement.dataset.wx = wx;
}
