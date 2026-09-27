import { NAVIGATION_PATHS } from '@core/navigation/navigation-paths';
import { routes } from './app.routes';

describe('application routes', () => {
  it('lazy-loads the protected account feature at the account path', () => {
    const accountRoute = routes.find((route) => route.path === NAVIGATION_PATHS.account.slice(1));

    expect(accountRoute).toBeDefined();
    expect(accountRoute?.canMatch).toHaveLength(1);
    expect(accountRoute?.loadChildren).toBeTypeOf('function');
  });
});
