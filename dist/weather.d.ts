export type WeatherState = 'clear' | 'cloudy' | 'rain' | 'snow' | 'storm' | 'fog' | 'wind';
export interface WeatherOptions {
    lat?: number;
    lon?: number;
    override?: WeatherState | null;
    timeoutMs?: number;
}
export declare function getCoords(timeoutMs?: number): Promise<{
    lat: number;
    lon: number;
} | null>;
export declare function detectWeatherState(opts?: WeatherOptions): Promise<WeatherState>;
export declare function applyWeather(wx: WeatherState): void;
//# sourceMappingURL=weather.d.ts.map