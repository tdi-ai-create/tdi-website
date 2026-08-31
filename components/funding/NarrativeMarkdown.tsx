'use client';

import React from 'react';

// ---------------------------------------------------------------------------
// Grant narratives are written in Markdown. Show them as prose, not as source.
//
// The agents write real Markdown: "# Program Narrative", "## Statement of Need",
// "**Applicant:**", numbered lists, blockquoted internal notes. The reader
// printed the string as-is with pre-wrap, so every hash, asterisk and angle
// bracket landed on screen. Rae's words: only code showing up and it is so
// messy. That is the whole bug.
//
// Written here rather than pulled in, for two reasons. There is no Markdown
// dependency in this project and adding one to render five block types is a
// poor trade. And this returns React elements rather than an HTML string, so
// there is no dangerouslySetInnerHTML and no path from agent-authored text to
// executable markup. Anything it does not recognise falls through as plain
// text, which is the safe direction to fail in for a document a human is about
// to send to a funder.
// ---------------------------------------------------------------------------

/** Inline: **bold**, *italic*, `code`. Everything else is literal text. */
function inline(text: string, keyPrefix: string): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  const pattern = /(\*\*[^*]+\*\*|\*[^*\n]+\*|`[^`]+`)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;

  while ((m = pattern.exec(text)) !== null) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const tok = m[0];
    const key = `${keyPrefix}-i${i++}`;

    if (tok.startsWith('**')) {
      out.push(<strong key={key} style={{ fontWeight: 700, color: '#1e2749' }}>{tok.slice(2, -2)}</strong>);
    } else if (tok.startsWith('`')) {
      out.push(
        <code key={key} style={{ fontFamily: 'ui-monospace, Menlo, monospace', fontSize: '0.92em', background: '#F3F4F6', padding: '1px 4px', borderRadius: 3 }}>
          {tok.slice(1, -1)}
        </code>
      );
    } else {
      out.push(<em key={key}>{tok.slice(1, -1)}</em>);
    }
    last = m.index + tok.length;
  }

  if (last < text.length) out.push(text.slice(last));
  return out;
}

const H_SIZES: Record<number, number> = { 1: 17, 2: 15, 3: 13.5 };

export function NarrativeMarkdown({ content }: { content: string }) {
  return <>{parseBlocks((content || '').replace(/\r\n/g, '\n').split('\n'), 'r')}</>;
}

/**
 * Blocks from lines. Recursive so a blockquote can hold headings and lists
 * rather than flattening them into one run-on sentence: the agents' internal
 * notes are written as a quoted numbered list, and flattening those was the
 * difference between a readable objection and a wall of text.
 */
function parseBlocks(lines: string[], idPrefix: string): React.ReactNode[] {
  const blocks: React.ReactNode[] = [];

  // Consecutive list items and paragraph lines are gathered before emitting, so
  // a wrapped sentence does not become three paragraphs and a five item list
  // does not become five lists.
  let listItems: { ordered: boolean; text: string }[] = [];
  let para: string[] = [];
  let quote: string[] = [];
  let k = 0;

  const flushList = () => {
    if (!listItems.length) return;
    const ordered = listItems[0].ordered;
    const items = listItems.map((li, n) => (
      <li key={`${idPrefix}li-${k}-${n}`} style={{ marginBottom: 4 }}>{inline(li.text, `${idPrefix}li-${k}-${n}`)}</li>
    ));
    blocks.push(
      ordered
        ? <ol key={`${idPrefix}b${k++}`} style={{ margin: '6px 0 10px', paddingLeft: 22 }}>{items}</ol>
        : <ul key={`${idPrefix}b${k++}`} style={{ margin: '6px 0 10px', paddingLeft: 22 }}>{items}</ul>
    );
    listItems = [];
  };

  const flushPara = () => {
    if (!para.length) return;
    const text = para.join(' ');
    blocks.push(<p key={`${idPrefix}b${k++}`} style={{ margin: '0 0 10px' }}>{inline(text, `${idPrefix}p${k}`)}</p>);
    para = [];
  };

  const flushQuote = () => {
    if (!quote.length) return;
    // The id is taken before the element is built. Incrementing inside the JSX
    // reads the counter after the children have already advanced it, which
    // handed the blockquote the same key as the block after it.
    const id = k++;
    blocks.push(
      <blockquote key={`${idPrefix}b${id}`} style={{ margin: '8px 0 12px', padding: '8px 12px', borderLeft: '3px solid #ffba06', background: '#FFFBEB', color: '#4B5563' }}>
        {parseBlocks(quote, `${idPrefix}q${id}`)}
      </blockquote>
    );
    quote = [];
  };

  const flushAll = () => { flushList(); flushPara(); flushQuote(); };

  for (const raw of lines) {
    const line = raw.trimEnd();

    if (!line.trim()) { flushAll(); continue; }

    const heading = /^(#{1,6})\s+(.*)$/.exec(line);
    if (heading) {
      flushAll();
      const level = Math.min(heading[1].length, 3);
      blocks.push(
        <div
          key={`${idPrefix}b${k++}`}
          style={{
            fontSize: H_SIZES[level], fontWeight: 700, color: '#1e2749',
            margin: level === 1 ? '4px 0 10px' : '14px 0 6px',
            lineHeight: 1.35,
          }}
        >
          {inline(heading[2], `${idPrefix}h${k}`)}
        </div>
      );
      continue;
    }

    if (/^\s*(---|\*\*\*|___)\s*$/.test(line)) {
      flushAll();
      blocks.push(<hr key={`${idPrefix}b${k++}`} style={{ border: 0, borderTop: '1px solid #E5E7EB', margin: '14px 0' }} />);
      continue;
    }

    const bq = /^>\s?(.*)$/.exec(line);
    if (bq) { flushList(); flushPara(); quote.push(bq[1]); continue; }

    const ol = /^\s*(\d+)[.)]\s+(.*)$/.exec(line);
    if (ol) { flushPara(); flushQuote(); listItems.push({ ordered: true, text: ol[2] }); continue; }

    const ul = /^\s*[-*+]\s+(.*)$/.exec(line);
    if (ul) { flushPara(); flushQuote(); listItems.push({ ordered: false, text: ul[1] }); continue; }

    flushList(); flushQuote();
    para.push(line.trim());
  }

  flushAll();

  return blocks;
}
