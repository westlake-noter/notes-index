import test from 'node:test';
import assert from 'node:assert/strict';
import {updateNavbarState} from '../src/theme/Navbar/Layout/scroll-state.mjs';

const update = (previous, scrollY, options = {}) =>
  updateNavbarState(previous, {scrollY, desktop: true, ...options});

test('navbar expands only at the top, not when scrolling upward away from it', () => {
  let state = update(undefined, 0);
  assert.equal(state.compact, false);
  state = update(state, 1);
  assert.equal(state.compact, true);
  state = update(state, 400);
  assert.equal(state.compact, true);
  state = update(state, 200);
  assert.equal(state.compact, true);
  assert.equal(update(state, 0).compact, false);
  assert.equal(update(state, -20).compact, false);
});

test('manual expansion survives no-op events but ends on the next real scroll', () => {
  const compact = update(undefined, 400);
  const expanded = update(compact, 400, {expand: true});
  assert.equal(expanded.compact, false);
  assert.equal(update(expanded, 400).compact, false);
  assert.equal(update(expanded, 399).compact, true);
  assert.equal(update(expanded, 401).compact, true);
  assert.equal(update(expanded, 0).compact, false);
});

test('restored scroll and route/viewport changes reset manual expansion', () => {
  assert.equal(update(undefined, 300).compact, true);
  const expanded = update(undefined, 300, {expand: true});
  assert.equal(update(expanded, 300, {reset: true}).compact, true);
  assert.equal(update(expanded, 0, {reset: true}).compact, false);
});

test('manual expansion stays open while scrolling upward within 160px of the top', () => {
  let state = update(undefined, 160, {expand: true});
  for (const position of [159, 120, 120, 40, 1, 0]) {
    state = update(state, position);
    assert.equal(state.compact, false, `should stay expanded at ${position}px`);
  }
  assert.equal(update(state, 1).compact, true);
});

test('near-top buffer does not expand compact navigation or override downward scroll', () => {
  const compact = update(undefined, 120);
  assert.equal(update(compact, 100).compact, true);
  const expanded = update(compact, 120, {expand: true});
  assert.equal(update(expanded, 121).compact, true);
  assert.equal(update(expanded, 119, {reset: true}).compact, true);
  assert.equal(update(update(undefined, 200, {expand: true}), 160).compact, false);
  assert.equal(update(update(undefined, 200, {expand: true}), 161).compact, true);
});

test('mobile never compacts and switching back to desktop resyncs position', () => {
  const mobile = update(undefined, 300, {desktop: false});
  assert.equal(mobile.compact, false);
  assert.equal(update(mobile, 301, {desktop: false}).compact, false);
  assert.equal(update(mobile, 300, {reset: true}).compact, true);
});
