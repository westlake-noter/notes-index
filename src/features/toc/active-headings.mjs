// Adapted from Fumadocs core/src/toc.tsx's multi-anchor observer (MIT).
export function activeHeadingIds(headings, visibleIds, viewportTop) {
  const visible = headings.filter((heading) => visibleIds.has(heading.id));
  if (visible.length) return visible.map((heading) => heading.id);

  let nearest;
  let distance = Infinity;
  for (const heading of headings) {
    const nextDistance = Math.abs(heading.top - viewportTop);
    if (nextDistance < distance) {
      nearest = heading;
      distance = nextDistance;
    }
  }
  return nearest ? [nearest.id] : [];
}
