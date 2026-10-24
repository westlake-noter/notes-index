const TOP_EXPANSION_BUFFER = 160;

export function updateNavbarState(previous, {scrollY, desktop, expand = false, reset = false}) {
  const position = Math.max(0, scrollY);
  const moved = previous?.position !== position;
  const approachingTop = position < previous?.position && position <= TOP_EXPANSION_BUFFER;
  const keepExpanded = previous?.compact === false && (!moved || approachingTop);
  const compact = desktop && position > 0 && !expand
    && (reset || !keepExpanded);
  return {position, compact};
}
