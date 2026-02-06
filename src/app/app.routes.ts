import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { Login } from './components/login/login';
import { authenticationGuard } from './guards/authentication.guard';
import { Team } from './components/team/team';
import { Squad } from './components/team/squad/squad';
import { Tactics } from './components/team/tactics/tactics';
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
    { path: 'register', component: Register },
    { path: 'competitions-management', component: CompetitionsManagement },
    { path: 'competition/:id', component: CompetitionDetails },
    { path: 'competitions', component: Competitions },
    { path: 'team', component: Team,
        children:[
            { path: '', redirectTo: 'squad', pathMatch: "prefix" },
            { path: 'squad', component: Squad },
            { path: 'tactics', component: Tactics },
            { path: 'fixtures', component: Fixtures }
        ]
    },
    { path: '**', redirectTo: '/home' },
];