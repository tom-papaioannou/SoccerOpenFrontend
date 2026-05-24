/*
 * Copyright (c) 2026 Tom Papaioannou. All rights reserved.
 * Licensed under the MIT License
 */

import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { Login } from './components/login/login';
import { authenticationGuard } from './guards/authentication.guard';
import { Team } from './components/team/team';
import { Squad } from './components/team/squad/squad';
import { Tactics } from './components/team/tactics/tactics';
import { TacticsDetail } from './components/team/tactics-detail/tactics-detail';
import { Fixtures } from './components/team/fixtures/fixtures';
import { PlayerDetails } from './components/team/player-details/player-details';
import { Information } from './components/team/information/information';
import { CompetitionsManagement } from './components/competitions-management/competitions-management';
import { CompetitionDetails } from './components/competition-details/competition-details';
import { Register } from './components/register/register';
import { Servers } from './components/servers/servers';
import { ServerDetails } from './components/server-details/server-details';
import { guestsGuard } from './guards/guests-guard';
import { AdminPanel } from './components/admin-panel/admin-panel';
import { defaultLandingGuard } from './guards/default-landing.guard';

export const routes: Routes = [
    { path: '', pathMatch: 'full', canActivate: [defaultLandingGuard], component: Home },
    { path: 'home', canActivate: [authenticationGuard], component: Home },
    // { path: 'error', component: Home },
    { path: 'login', canActivate: [guestsGuard], component: Login },
    { path: 'register', canActivate: [authenticationGuard], component: Register },
    { path: 'servers', canActivate: [authenticationGuard], component: Servers },
    { path: 'server/:id', canActivate: [authenticationGuard], component: ServerDetails },
    { path: 'adminpanel', canActivate: [authenticationGuard], component: AdminPanel },
    { path: 'competitions-management', canActivate: [authenticationGuard], component: CompetitionsManagement },
    { path: 'competition/:id', canActivate: [authenticationGuard], component: CompetitionDetails },
    { path: 'player/:id', canActivate: [authenticationGuard], component: PlayerDetails },
    {
        path: 'competitions',
        canActivate: [authenticationGuard],
        loadComponent: () => import('./components/world-map/world-map').then(m => m.WorldMap)
    },
    {
        path: 'nations/:nationId/competitions',
        canActivate: [authenticationGuard],
        loadComponent: () => import('./components/nation-competitions/nation-competitions').then(m => m.NationCompetitions)
    },
    { path: 'team', canActivate: [authenticationGuard], component: Team,
        children:[
            { path: '', redirectTo: 'squad', pathMatch: "prefix" },
            { path: 'squad', component: Squad },
            { path: 'tactics', component: Tactics },
            { path: 'tactics/:id', component: TacticsDetail },
            { path: 'fixtures', component: Fixtures },
            { path: 'information', component: Information }
        ]
    },
    { path: '**', redirectTo: '/home' },
];
