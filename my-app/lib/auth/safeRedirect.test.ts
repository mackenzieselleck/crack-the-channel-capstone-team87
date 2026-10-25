//Unit tests for safeNext(), the open-redirect guard on the post-login ?next= param.

import { describe, expect, it } from 'vitest';
import { DEFAULT_REDIRECT, safeNext } from './safeRedirect';

const ORIGIN = 'https://crackthechannel.example';

describe('safeNext()', () => {
  it('returns the fallback when nextParam is null', () => {
    expect(safeNext(null, ORIGIN)).toBe(DEFAULT_REDIRECT);
  });

  it('returns the fallback when nextParam is undefined', () => {
    expect(safeNext(undefined, ORIGIN)).toBe(DEFAULT_REDIRECT);
  });

  it('returns the fallback when nextParam is an empty string', () => {
    expect(safeNext('', ORIGIN)).toBe(DEFAULT_REDIRECT);
  });

  it('passes through a same-origin absolute URL as a relative path', () => {
    expect(safeNext(`${ORIGIN}/dashboard`, ORIGIN)).toBe('/dashboard');
  });

  it('passes through a bare relative path', () => {
    expect(safeNext('/profile', ORIGIN)).toBe('/profile');
  });

  it('preserves query string and hash', () => {
    expect(safeNext('/learn/bb84?step=2#top', ORIGIN)).toBe(
      '/learn/bb84?step=2#top',
    );
  });

  it('falls back for a cross-origin absolute URL (open-redirect attempt)', () => {
    expect(safeNext('https://evil.example/phish', ORIGIN)).toBe(
      DEFAULT_REDIRECT,
    );
  });

  it('falls back for a protocol-relative URL pointing off-site', () => {
    expect(safeNext('//evil.example/phish', ORIGIN)).toBe(DEFAULT_REDIRECT);
  });

  it('falls back for an unparsable value', () => {
    // e.g. javascript: URLs, control characters, etc. all throw in the URL
    // constructor when resolved against a well-formed base
    expect(safeNext('http://', ORIGIN)).toBe(DEFAULT_REDIRECT);
  });

  it('honors a caller-supplied fallback', () => {
    expect(safeNext(null, ORIGIN, '/custom-landing')).toBe('/custom-landing');
    expect(safeNext('https://evil.example', ORIGIN, '/custom-landing')).toBe(
      '/custom-landing',
    );
  });
});