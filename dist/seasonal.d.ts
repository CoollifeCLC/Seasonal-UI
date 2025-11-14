export type SeasonKey = 'default' | 'halloween' | 'christmas' | 'thanksgiving' | 'easter';
export interface SeasonalConfig {
    override?: SeasonKey | null;
    now?: () => Date;
    rules?: Array<(d: Date) => SeasonKey | null>;
}
export declare function detectSeason(config?: SeasonalConfig): SeasonKey;
export declare function applySeason(season: SeasonKey): void;
//# sourceMappingURL=seasonal.d.ts.map