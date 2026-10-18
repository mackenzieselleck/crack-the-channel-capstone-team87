// prevents open redirects from user-controlled `next` parameters

export const DEFAULT_REDIRECT = '/learn/testModule'

export function safeNext(
  nextParam: string | null | undefined,
  origin: string,
  fallback: string = DEFAULT_REDIRECT,
): string {
  if (!nextParam) return fallback

  try {
    const url = new URL(nextParam, origin)
    if (url.origin !== origin) return fallback
    return url.pathname + url.search + url.hash
  } catch {
    return fallback
  }
}
