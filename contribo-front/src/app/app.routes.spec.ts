import { NAVIGATION_PATHS } from '@core/navigation/navigation-paths';
import { routes } from './app.routes';

describe('application routes', () => {
  it('redirects the root to the dashboard only for an authenticated session', () => {
    const rootRoutes = routes.filter((route) => route.path === '');

    expect(rootRoutes).toHaveLength(2);
    expect(rootRoutes[0]?.pathMatch).toBe('full');
    expect(rootRoutes[0]?.redirectTo).toBeTypeOf('function');
    expect(rootRoutes[1]?.loadChildren).toBeTypeOf('function');
  });

  it('lazy-loads the protected dashboard feature at /dashboard', () => {
    const dashboardRoute = routes.find(
      (route) => route.path === NAVIGATION_PATHS.dashboard.slice(1),
    );

    expect(dashboardRoute).toBeDefined();
    expect(dashboardRoute?.canMatch).toHaveLength(1);
    expect(dashboardRoute?.loadChildren).toBeTypeOf('function');
  });

  it('lazy-loads the protected account feature at the account path', () => {
    const accountRoute = routes.find((route) => route.path === NAVIGATION_PATHS.account.slice(1));

    expect(accountRoute).toBeDefined();
    expect(accountRoute?.canMatch).toHaveLength(1);
    expect(accountRoute?.loadChildren).toBeTypeOf('function');
  });
});
