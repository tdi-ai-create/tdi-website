import { type QuizQuestion } from './quiz';

/**
 * Represents one piece of the interleaved lesson flow.
 * Either a chunk of HTML content or a quiz question.
 */
export type LessonFlowItem =
  | { type: 'content'; html: string; sectionIndex: number }
  | { type: 'question'; question: QuizQuestion };

/**
 * Split lesson HTML content into sections at heading boundaries
 * (<h2>, <h3>) or explicit <!-- section-break --> markers.
 *
 * Returns an array of HTML strings, one per section.
 * If the content has no headings or markers, returns a single section.
 */
export function splitContentIntoSections(html: string): string[] {
  if (!html || !html.trim()) return [];

  // Split on heading tags or explicit break markers.
  // We split *before* the heading so the heading stays with its section.
  const breakPattern = /(?=<h[23][^>]*>)|(?:<!--\s*section-break\s*-->)/gi;
  const sections = html.split(breakPattern).filter((s) => s.trim().length > 0);

  return sections;
}

/**
 * Build an interleaved flow of content sections and quiz questions.
 *
 * Questions with `content_position` set are placed after that section index.
 * Questions with `content_position = null` are placed after all content.
 * Questions are ordered by sort_order within each position group.
 */
export function buildLessonFlow(
  contentHtml: string | null,
  questions: QuizQuestion[]
): LessonFlowItem[] {
  const sections = contentHtml ? splitContentIntoSections(contentHtml) : [];
  const flow: LessonFlowItem[] = [];

  // Group questions by their content_position
  const positionedQuestions = new Map<number, QuizQuestion[]>();
  const trailingQuestions: QuizQuestion[] = [];

  for (const q of questions) {
    if (q.content_position !== null && q.content_position !== undefined) {
      const group = positionedQuestions.get(q.content_position) || [];
      group.push(q);
      positionedQuestions.set(q.content_position, group);
    } else {
      trailingQuestions.push(q);
    }
  }

  // Sort each position group by sort_order
  for (const [, qs] of positionedQuestions) {
    qs.sort((a, b) => a.sort_order - b.sort_order);
  }
  trailingQuestions.sort((a, b) => a.sort_order - b.sort_order);

  // Interleave: content section, then any questions positioned after it
  const processedPositions = new Set<number>();
  sections.forEach((html, index) => {
    flow.push({ type: 'content', html, sectionIndex: index });

    const questionsAfterThis = positionedQuestions.get(index);
    if (questionsAfterThis) {
      for (const q of questionsAfterThis) {
        flow.push({ type: 'question', question: q });
      }
      processedPositions.add(index);
    }
  });

  // Append questions positioned beyond available sections
  for (const [pos, qs] of positionedQuestions) {
    if (!processedPositions.has(pos)) {
      for (const q of qs) {
        flow.push({ type: 'question', question: q });
      }
    }
  }

  // Append trailing questions (content_position = null)
  for (const q of trailingQuestions) {
    flow.push({ type: 'question', question: q });
  }

  return flow;
}
