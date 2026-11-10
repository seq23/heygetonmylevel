// Meta descriptions have to land in 120–160 characters on every page, and the
// curriculum band pages are generated from data whose module names change length.
// Hand-written strings drift out of the band the moment a module is renamed
// (five band pages were 164–183 characters on 3 Nov 2026), so the band pages
// assemble their description here instead (the central Boss OS search audit
// reports any route that still falls outside it).

export const DESCRIPTION_MIN = 120;
export const DESCRIPTION_MAX = 160;

/**
 * Fit `lead` + as many of `items` as will fit + `tail` into DESCRIPTION_MAX.
 * Items left out are counted ("and 2 more") rather than dropped silently, so the
 * sentence stays true however many items there are.
 */
export function fitDescription(lead: string, items: string[], tail: string, max = DESCRIPTION_MAX): string {
  const assemble = (n: number) => {
    const rest = items.length - n;
    return `${lead}${items.slice(0, n).join(", ")}${rest > 0 ? ` and ${rest} more` : ""}. ${tail}`;
  };
  for (let n = items.length; n >= 1; n -= 1) {
    const s = assemble(n);
    if (s.length <= max) return s;
  }
  // Even one item overflows: keep the shortest true sentence rather than lie by omission.
  return assemble(1);
}
