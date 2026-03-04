/*
 * Copyright (c) 2026 Tom Papaioannou. All rights reserved.
 * Licensed under the MIT License
 */

export interface IServer {
  serverID: string;
  name: string;
}

export interface IServerInfo extends IServer {
  persons: IServerPerson[];
  competitions: IServerCompetition[];
}

export interface IServerPerson {
  personID: string;
  name?: string;
  age?: number | null;
}

export interface IServerCompetition {
  competitionID: string;
  competitionName?: string;
  competitionParentName: string;
}