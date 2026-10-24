import test from 'node:test';
import assert from 'node:assert/strict';
import {compileOutline} from '../lib/course-outline.mjs';

const source = {label: 'PDF v1', url: 'https://example.com/notes.pdf', pageOffset: 3};
const entry = (number, title = 'Topic', page = 1) => ({number, title, page});
const compile = (changes = {}) => compileOutline(JSON.stringify({
  title: 'Table of Contents', source, entries: [entry('1'), entry('1.1'), entry('1.1.1'), entry('2')],
  ...changes,
}), 'owner/repo', 'toc');

test('outline JSON builds chapter groups and stable scoped anchors without compiling Markdown', () => {
  const {outline, toc, html} = compile();
  assert.equal(outline.chapters.length, 2);
  assert.equal(outline.chapters[0].entries[1].depth, 2);
  assert.equal(outline.chapters[0].id, 'toc-owner-repo-1-topic');
  assert.equal(outline.titleId, 'toc-owner-repo-table-of-contents');
  assert.equal(outline.source.pageOffset, 3);
  assert.equal(toc.length, 3);
  assert.equal(html, undefined);
});

test('outline rejects malformed JSON, invalid page data, numbering, duplicates, and misplaced children', () => {
  assert.throws(() => compileOutline('{', 'owner/repo', 'toc'), /valid JSON/);
  for (const changes of [
    {title: ''}, {entries: []}, {entries: [entry('1', '', 1)]},
    {entries: [entry('1', 'A', 0)]}, {entries: [entry('1', 'A', 1.5)]},
    {entries: [entry('1', 'A', Number.MAX_SAFE_INTEGER)]},
    {entries: [entry('2')]}, {entries: [entry('01')]},
    {entries: [entry('1'), entry('1')]}, {entries: [entry('1'), entry('1.2.1')]},
    {entries: [entry('1'), entry('2'), entry('1.1')]},
  ]) assert.throws(() => compile(changes), /Invalid course outline/);
});

test('outline validates source URLs and escapes TOC labels while keeping React text as text', () => {
  for (const changes of [
    {source: null}, {source: {...source, url: 'javascript:alert(1)'}},
    {source: {...source, url: 'https://user:password@example.com/notes.pdf'}},
    {source: {...source, pageOffset: -1}}, {source: {...source, pageOffset: '3'}},
  ]) assert.throws(() => compile(changes), /Invalid course outline/);
  const {outline, toc} = compile({entries: [entry('1', '<img src=x> & Notes')]});
  assert.equal(outline.chapters[0].title, '<img src=x> & Notes');
  assert.equal(toc[1].value, '1. &lt;img src=x&gt; &amp; Notes');
});
