/*
 * Copyright (c) 2026 Tom Papaioannou. All rights reserved.
 * Licensed under the MIT License
 */

export interface INation {
  nationID: string;
  name: string;
  iso2?: string;
  iso3?: string;
  iSO2?: string;
  iSO3?: string;
  isO2?: string;
  isO3?: string;
  code?: string;
  flagUrl: string | null;
  latitude?: number | null;
  longitude?: number | null;
  continentID: string;
}
