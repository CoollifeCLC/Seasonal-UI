import { useEffect, useState } from 'react';
import { detectSeason, applySeason, SeasonKey } from './seasonal';

const PARAM = 'season';

export function useSeasonalTheme(init?: {override?: SeasonKey | null}) {
  const [season, setSeason] = useState<SeasonKey>('default');

  useEffect(() => {
    const qs = new URLSearchParams(location.search).get(PARAM) as SeasonKey | null;
    const s = detectSeason({ override: init?.override ?? qs });
    applySeason(s);
    setSeason(s);
  }, []);

  return season;
}
