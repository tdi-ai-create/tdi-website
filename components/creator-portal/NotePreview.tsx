'use client';

import { RichTextDisplay } from './RichTextDisplay';

interface NotePreviewProps {
  content: string;
  maxLines?: number;
  onReadMore?: () => void;
}

/**
 * Displays a truncated preview of note content with "Read more" button.
 * Shows first 2-3 lines and truncates longer content.
 */
export function NotePreview({
  content,
  maxLines = 3,
  onReadMore,
}: NotePreviewProps) {
  // Calculate if content is likely to need truncation
  // Heuristic: check for multiple paragraphs, list items, or long content
  const isLong =
    content.length > 200 ||
    (content.match(/<p>/gi)?.length || 0) > 2 ||
    (content.match(/<li>/gi)?.length || 0) > 3 ||
    content.split('\n').filter((line) => line.trim()).length > 3;

  return (
    <div className="relative">
      <div
        className="overflow-hidden"
        style={{
          maxHeight: isLong ? `${maxLines * 1.6}em` : 'none',
          lineHeight: '1.6em',
        }}
      >
        <RichTextDisplay content={content} className="text-sm text-gray-700" />
      </div>
      {isLong && onReadMore && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onReadMore();
          }}
          className="text-[#80a4ed] hover:text-[#5c8ad9] text-sm font-medium mt-1 focus:outline-none focus:underline"
        >
          Read more...
        </button>
      )}
    </div>
  );
}
