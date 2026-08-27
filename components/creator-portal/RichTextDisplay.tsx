'use client';

import DOMPurify from 'isomorphic-dompurify';

interface RichTextDisplayProps {
  content: string;
  className?: string;
}

/**
 * Displays note content, auto-detecting what it actually is.
 *
 * - HTML: sanitised and rendered with prose styling
 * - Markdown: bold, italic and links only, then sanitised
 * - Anything else: rendered as typed, with line breaks preserved
 *
 * The markdown case exists because notes are written by people in a plain
 * textarea, not an editor. A quarter of the creator-visible notes on 27 Aug 2026
 * used **bold** and contained no HTML, so they were reaching creators with the
 * asterisks showing.
 */
export function RichTextDisplay({ content, className = '' }: RichTextDisplayProps) {
  // Detect if content is HTML (contains tags)
  const isHTML = /<[a-z][\s\S]*>/i.test(content);

  if (isHTML) {
    const sanitized = DOMPurify.sanitize(content, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'b', 'i', 'u', 'a', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'blockquote', 'code', 'pre', 'span', 'div'],
      ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'style'],
    });
    return (
      <div
        className={`prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0 prose-a:text-blue-600 prose-a:underline hover:prose-a:text-blue-800 ${className}`}
        dangerouslySetInnerHTML={{ __html: sanitized }}
      />
    );
  }

  // Plain text, but a good deal of it is markdown.
  //
  // 25 of the 99 creator-visible notes use **bold** and contain no HTML at all,
  // so a quarter of everything written to creators was rendering with the
  // asterisks showing. These notes are typed by people, not by an editor, so
  // markdown is what they naturally reach for.
  //
  // Deliberately narrow: bold, italic and links, nothing else. A full markdown
  // parser here would start interpreting things a person did not mean, and the
  // result still goes through DOMPurify either way.
  const asHtml = escapeHtml(content)
    .replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, '$1<em>$2</em>')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

  if (asHtml === escapeHtml(content)) {
    // Nothing markdown about it. Leave it exactly as written.
    return <p className={`whitespace-pre-wrap ${className}`}>{content}</p>;
  }

  const safe = DOMPurify.sanitize(asHtml, {
    ALLOWED_TAGS: ['strong', 'em', 'a', 'br'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
  });

  return (
    <p
      className={`whitespace-pre-wrap ${className}`}
      dangerouslySetInnerHTML={{ __html: safe }}
    />
  );
}

/**
 * Escapes first, so anything a person typed that looks like a tag stays visible
 * as text rather than becoming markup. The markdown replacements below then add
 * the only tags this function will ever produce.
 */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
