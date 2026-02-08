import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { Login } from './components/login/login';
import { authenticationGuard } from './guards/authentication.guard';
import { Team } from './components/team/team';
import { Squad } from './components/team/squad/squad';
import { Tactics } from './components/team/tactics/tactics';
import { TacticsDetail } from './components/team/tactics-detail/tactics-detail';
import { Fixtures } from './components/team/fixtures/fixtures';
import { Competitions } from './components/competitions/competitions';
import { CompetitionsManagement } from './components/competitions-management/competitions-management';
import { CompetitionDetails } from './components/competition-details/competition-details';
import { Register } from './components/register/register';
import { guestsGuard } from './guards/guests-guard';

export const routes: Routes = [
    { path: 'home', canActivate: [authenticationGuard], component: Home },
    // { path: 'error', component: Home },
    { path: 'login', canActivate: [guestsGuard], component: Login },
    { path: 'register', canActivate: [guestsGuard], component: Register },
    { path: 'competitions-management', canActivate: [authenticationGuard], component: CompetitionsManagement },
    { path: 'competition/:id', canActivate: [authenticationGuard], component: CompetitionDetails },
    { path: 'competitions', canActivate: [authenticationGuard], component: Competitions },
    { path: 'team', canActivate: [authenticationGuard], component: Team,
        children:[
            { path: '', redirectTo: 'squad', pathMatch: "prefix" },
            { path: 'squad', component: Squad },
            { path: 'tactics', component: Tactics },
            { path: 'tactics/:id', component: TacticsDetail },
            { path: 'fixtures', component: Fixtures }
        ]
    },
    { path: '**', redirectTo: '/home' },
];