export type SeasonKey = 'default' | 'halloween' | 'christmas' | 'thanksgiving' | 'easter';

export interface SeasonalConfig {
  /** force a season (e.g., for screenshots) */
  override?: SeasonKey | null;
  /** timezone offset or explicit Date provider if you need server time */
  now?: () => Date;
  /** optional custom rules */
  rules?: Array<(d: Date) => SeasonKey | null>;
}

/** Simple US-centric defaults; override via config.rules as needed. */
export function detectSeason(config: SeasonalConfig = {}): SeasonKey {
  if (config.override) return config.override;
  const now = (config.now ? config.now() : new Date());
  const m = now.getMonth() + 1;
  const day = now.getDate();

  for (const r of config.rules ?? []) {
    const res = r(now);
    if (res) return res;
  }

  // Halloween: Oct 1–31
  if (m === 10) return 'halloween';
  // Thanksgiving: Nov 15–30
  if (m === 11 && day >= 15 && day <= 30) return 'thanksgiving';
  // Christmas: Dec 1–26
  if (m === 12 && day <= 26) return 'christmas';

  // Easter (approx): any Sunday in April → 'easter' (you can replace with real calc via config.rules)
  if (m === 4) {
    if (now.getDay() === 0) return 'easter';
  }

  return 'default';
}

/** Apply to <html data-season="..."> */
export function applySeason(season: SeasonKey) {
  document.documentElement.dataset.season = season;
}
