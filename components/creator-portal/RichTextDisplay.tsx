'use client';

interface RichTextDisplayProps {
  content: string;
  className?: string;
}

/**
 * Displays note content - auto-detects HTML vs plain text for backward compatibility.
 * - HTML content: Rendered with prose styling
 * - Plain text: Rendered with preserved line breaks
 */
export function RichTextDisplay({ content, className = '' }: RichTextDisplayProps) {
  // Detect if content is HTML (contains tags)
  const isHTML = /<[a-z][\s\S]*>/i.test(content);

  if (isHTML) {
    return (
      <div
        className={`prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0 prose-a:text-blue-600 prose-a:underline hover:prose-a:text-blue-800 ${className}`}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }

  // Plain text: preserve line breaks (backward compatibility)
  return <p className={`whitespace-pre-wrap ${className}`}>{content}</p>;
}
