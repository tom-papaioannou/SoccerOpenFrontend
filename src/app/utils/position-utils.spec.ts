/*
 * Copyright (c) 2026 Tom Papaioannou. All rights reserved.
 * Licensed under the MIT License
 */

import { PlayerPosition } from '../models/player-enums.model';
import { getGroupedPlayerPositionLabel } from './position-utils';

describe('getGroupedPlayerPositionLabel', () => {
  it('collapses central triplets to their generic labels', () => {
    expect(getGroupedPlayerPositionLabel(PlayerPosition.LeftCenterMidfielder)).toBe('CM');
    expect(getGroupedPlayerPositionLabel(PlayerPosition.CentralCenterMidfielder)).toBe('CM');
    expect(getGroupedPlayerPositionLabel(PlayerPosition.RightCenterMidfielder)).toBe('CM');
    expect(getGroupedPlayerPositionLabel(PlayerPosition.LeftStriker)).toBe('ST');
  });

  it('keeps non-triplet wide positions distinct', () => {
    expect(getGroupedPlayerPositionLabel(PlayerPosition.LeftWinger)).toBe('LW');
    expect(getGroupedPlayerPositionLabel(PlayerPosition.RightBack)).toBe('RB');
  });
});
