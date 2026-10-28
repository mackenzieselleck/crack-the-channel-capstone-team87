// Routes allow 60 seconds. Stop model work after 40 seconds from request entry
// so retries share one budget and leave time for fallback and persistence.
export function createLlmDeadline(): number {
  return Date.now() + 40_000;
}
