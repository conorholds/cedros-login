import { describe, expect, it } from 'vitest';

import registerCedrosLoginWebSurface from '../web/register';

interface SeedLike {
  routePath: string;
  seo?: { noindex?: boolean; canonicalPath?: string };
}

const AUTH_NOINDEX_PATHS = [
  '/login',
  '/register',
  '/password-recovery',
  '/reset-password',
  '/verify-email',
  '/instant-link/verify',
  '/accept-invite',
  '/profile',
];

function assertSeedsNoindex(seeds: SeedLike[], requiredNoindexPaths: string[]): string[] {
  return requiredNoindexPaths.filter((path) => {
    const seed = seeds.find((candidate) => candidate.routePath === path);
    return !seed || seed.seo?.noindex !== true;
  });
}

describe('cedros-login public SEO contract', () => {
  it('declares all auth-sensitive page seeds noindex', () => {
    const bootstrap = registerCedrosLoginWebSurface();
    const seeds = bootstrap.manifest.pageSeeds ?? [];

    expect(assertSeedsNoindex(seeds, AUTH_NOINDEX_PATHS)).toEqual([]);
    for (const seed of seeds.filter((seed) => AUTH_NOINDEX_PATHS.includes(seed.routePath))) {
      expect(seed.seo).toEqual({ noindex: true });
    }
  });

  it('declares exactly one noindex profile workspace and no account page', () => {
    const bootstrap = registerCedrosLoginWebSurface();
    const seeds = bootstrap.manifest.pageSeeds ?? [];
    const profileSeeds = seeds.filter((seed) => seed.routePath === '/profile');

    expect(profileSeeds).toHaveLength(1);
    expect(profileSeeds[0]).toMatchObject({
      id: 'cedros-login:public-profile-page',
      autoCreateOnEnable: true,
      publishOnEnable: true,
      seo: { noindex: true },
    });
    expect(seeds.some((seed) => seed.routePath === '/account')).toBe(false);
  });

  it('catches an indexable login fixture', () => {
    expect(assertSeedsNoindex([{ routePath: '/login' }], ['/login'])).toEqual(['/login']);
  });
});
