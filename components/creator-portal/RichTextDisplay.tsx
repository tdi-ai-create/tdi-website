'use client';

import DOMPurify from 'isomorphic-dompurify';

interface RichTextDisplayProps {
  content: string;
  className?: string;
}

/**
 * Displays note content - auto-detects HTML vs plain text for backward compatibility.
 * - HTML content: Sanitized and rendered with prose styling
 * - Plain text: Rendered with preserved line breaks
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

  // Plain text: preserve line breaks (backward compatibility)
  return <p className={`whitespace-pre-wrap ${className}`}>{content}</p>;
}
