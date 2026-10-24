import test from 'node:test';
import assert from 'node:assert/strict';
import {activeHeadingIds} from '../src/features/toc/active-headings.mjs';

const headings = [
  {id: 'first', top: -200},
  {id: 'second', top: 120},
  {id: 'third', top: 400},
  {id: 'fourth', top: 1400},
];

test('highlights every visible heading in document order', () => {
  assert.deepEqual(activeHeadingIds(headings, new Set(['third', 'second']), 80), [
    'second', 'third',
  ]);
});

test('does not add an offscreen fallback when visible headings exist', () => {
  assert.deepEqual(activeHeadingIds(headings, new Set(['third']), 80), ['third']);
});

test('selects the nearest heading when a long text section has no visible heading', () => {
  assert.deepEqual(activeHeadingIds(headings, new Set(), 80), ['second']);
});

test('keeps the final heading highlighted after scrolling past it', () => {
  assert.deepEqual(activeHeadingIds([
    {id: 'first', top: -2400}, {id: 'last', top: -300},
  ], new Set(), 80), ['last']);
});

test('ignores stale observer entries and handles an empty TOC', () => {
  assert.deepEqual(activeHeadingIds(headings, new Set(['previous-page']), 80), ['second']);
  assert.deepEqual(activeHeadingIds([], new Set(), 80), []);
});

test('uses document order to resolve equally distant fallback headings', () => {
  assert.deepEqual(activeHeadingIds([
    {id: 'previous', top: 0}, {id: 'next', top: 160},
  ], new Set(), 80), ['previous']);
});
