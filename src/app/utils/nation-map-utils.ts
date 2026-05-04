/*
 * Copyright (c) 2026 Tom Papaioannou. All rights reserved.
 * Licensed under the MIT License
 */

import { INation } from '../models/nation.model';

export interface MappedNation extends INation {
  code: string;
  flagUrl: string;
  latitude: number;
  longitude: number;
}

const nationCoordinates: Record<string, { latitude: number; longitude: number }> = {
  AR: { latitude: -38.42, longitude: -63.62 },
  BR: { latitude: -14.24, longitude: -51.93 },
  CA: { latitude: 56.13, longitude: -106.35 },
  DE: { latitude: 51.17, longitude: 10.45 },
  FR: { latitude: 46.23, longitude: 2.21 },
  GB: { latitude: 52.36, longitude: -1.17 },
  GR: { latitude: 39.07, longitude: 21.82 },
  IT: { latitude: 41.87, longitude: 12.57 },
  MX: { latitude: 23.63, longitude: -102.55 },
  US: { latitude: 37.09, longitude: -95.71 }
};

export function getNationCode(nation: INation): string {
  return (
    nation.iso2 ??
    nation.iSO2 ??
    nation.isO2 ??
    nation.code ??
    ''
  ).toUpperCase();
}

export function getNationFlagUrl(nation: INation): string {
  const code = getNationCode(nation).toLowerCase();

  if (nation.name.toLowerCase() === 'england') {
    return nation.flagUrl ?? 'https://flagcdn.com/w40/gb-eng.png';
  }

  return nation.flagUrl ?? (code ? `https://flagcdn.com/w40/${code}.png` : '');
}

export function toMappedNation(nation: INation): MappedNation | null {
  const code = getNationCode(nation);
  const fallbackCoordinates = nationCoordinates[code];
  const latitude = nation.latitude ?? fallbackCoordinates?.latitude;
  const longitude = nation.longitude ?? fallbackCoordinates?.longitude;
  const flagUrl = getNationFlagUrl(nation);

  if (!code || latitude == null || longitude == null || !flagUrl) {
    return null;
  }

  return {
    ...nation,
    code,
    flagUrl,
    latitude,
    longitude
  };
}

export function getCompetitionTypeLabel(type: number | undefined): string {
  switch (type) {
    case 1:
      return 'League';
    case 2:
      return 'Cup';
    case 3:
      return 'Continental';
    default:
      return '-';
  }
}
