export function updateNavbarState(previous, {scrollY, desktop, expand = false, reset = false}) {
  const position = Math.max(0, scrollY);
  const moved = previous?.position !== position;
  const compact = desktop && position > 0 && !expand
    && (reset || moved || previous?.compact !== false);
  return {position, compact};
}
