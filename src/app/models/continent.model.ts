/*
 * Copyright (c) 2026 Tom Papaioannou. All rights reserved.
 * Licensed under the MIT License
 */

import { INation } from './nation.model';

export interface IContinent {
  continentID: string;
  name: string;
  code: string | null;
  symbolUrl: string | null;
  nations: INation[];
}
