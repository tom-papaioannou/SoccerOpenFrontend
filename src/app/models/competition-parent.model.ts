/*
 * Copyright (c) 2026 Tom Papaioannou. All rights reserved.
 * Licensed under the MIT License
 */

// Competition Parent Models with unique structure
export interface IParentOrganization {
  competitionParentID?: string;
  name: string;
  type: string;
}

export interface IParentOrgPayload {
  Name: string;
  Type: string;
}

export const parentOrgScopes = ['Nation', 'Continent', 'World'] as const;
