import { TranslatePipe } from './translate.pipe';

describe('TranslatePipe', () => {
  it('resolves a known key to its French translation', () => {
    const pipe = new TranslatePipe();

    expect(pipe.transform('auth.login.submit')).toBe('Se connecter');
  });
});
