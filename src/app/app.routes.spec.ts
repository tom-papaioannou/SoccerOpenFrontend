import { routes } from './app.routes';
import { authenticationGuard } from './guards/authentication.guard';
import { guestsGuard } from './guards/guests-guard';

describe('App Routes', () => {
  it('should have authenticationGuard on home route', () => {
    const homeRoute = routes.find(r => r.path === 'home');
    expect(homeRoute?.canActivate).toContain(authenticationGuard);
  });

  it('should have guestsGuard on login route', () => {
    const loginRoute = routes.find(r => r.path === 'login');
    expect(loginRoute?.canActivate).toContain(guestsGuard);
  });

  it('should have guestsGuard on register route', () => {
    const registerRoute = routes.find(r => r.path === 'register');
    expect(registerRoute?.canActivate).toContain(guestsGuard);
  });

  it('should have authenticationGuard on competitions-management route', () => {
    const route = routes.find(r => r.path === 'competitions-management');
    expect(route?.canActivate).toContain(authenticationGuard);
  });

  it('should have authenticationGuard on competition/:id route', () => {
    const route = routes.find(r => r.path === 'competition/:id');
    expect(route?.canActivate).toContain(authenticationGuard);
  });

  it('should have authenticationGuard on competitions route', () => {
    const route = routes.find(r => r.path === 'competitions');
    expect(route?.canActivate).toContain(authenticationGuard);
  });

  it('should have authenticationGuard on team route', () => {
    const teamRoute = routes.find(r => r.path === 'team');
    expect(teamRoute?.canActivate).toContain(authenticationGuard);
  });

  it('should have all routes except login and register protected', () => {
    const routesWithComponents = routes.filter(r => 
      r.component !== undefined && 
      r.path !== 'login' && 
      r.path !== 'register'
    );
    
    // All routes with components (except login and register) should have authenticationGuard
    routesWithComponents.forEach(route => {
      expect(route.canActivate).toContain(authenticationGuard);
    });
    
    // Verify we're checking the expected number of protected routes
    expect(routesWithComponents.length).toBeGreaterThan(0);
  });
});
