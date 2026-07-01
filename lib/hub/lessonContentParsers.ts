// Parsers for the three new Learning Hub lesson types seeded by TEA-7325.
// Content lives in hub_lessons.content as { format, markdown } jsonb.
// These parsers extract structured data out of the markdown so the front-end
// can render real interactive experiences instead of raw text.

export type LessonContentJson = {
  format?: string;
  markdown?: string;
} | null;

// -----------------------------------------------------------------------------
// Shared helpers
// -----------------------------------------------------------------------------

const stripEmphasis = (s: string) =>
  s
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/(^|[\s(])\*(.+?)\*([\s.,;:)!?]|$)/g, '$1$2$3')
    .replace(/`([^`]+)`/g, '$1')
    .trim();

const collapseWs = (s: string) => s.replace(/\s+/g, ' ').trim();

const cleanLine = (s: string) => collapseWs(stripEmphasis(s));

// -----------------------------------------------------------------------------
// Interactive lessons — multiple choice + matching
// -----------------------------------------------------------------------------

export type InteractiveOption = {
  label: string;         // "A" | "B" | ...
  text: string;
  isCorrect: boolean;
};

export type InteractiveQuestion = {
  id: string;
  prompt: string;
  options: InteractiveOption[];
  coachingNote?: string;
  correctFeedback?: string;
};

export type InteractiveLesson = {
  intro: string;                 // header + instructions text (rich)
  questions: InteractiveQuestion[];
  format: 'multiple-choice' | 'matching' | 'sequence' | 'reveal';
  fallbackMarkdown?: string;     // used when structured parse yields nothing
};

const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

function shuffle<T>(arr: T[], seed = 0): T[] {
  // deterministic Fisher-Yates using a simple LCG so re-renders don't reshuffle
  const out = arr.slice();
  let s = seed || 1;
  for (let i = out.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Detect and split the intro/instructions block from the first "**Pair N**",
 * "**Vignette N:**", "**Dialogue N:**", or "**Scenario Setup:**" heading.
 */
function splitIntro(md: string, blockRe: RegExp): { intro: string; body: string } {
  const m = blockRe.exec(md);
  if (!m) return { intro: md, body: '' };
  return { intro: md.slice(0, m.index).trim(), body: md.slice(m.index) };
}

/**
 * Parse "Pair N" / "Situation / Correct Strategy / Coaching Note" style
 * matching lessons (match-the-strategy style).
 */
function parsePairBlocks(md: string): InteractiveQuestion[] {
  const blockRe = /\*\*Pair\s+\d+\*\*/g;
  const matches = [...md.matchAll(blockRe)];
  if (!matches.length) return [];
  const blocks: string[] = [];
  for (let i = 0; i < matches.length; i++) {
    const start = matches[i].index!;
    const end = i + 1 < matches.length ? matches[i + 1].index! : md.length;
    blocks.push(md.slice(start, end));
  }

  const pairs: { situation: string; correct: string; note: string }[] = [];
  for (const block of blocks) {
    const situation = /\*Situation:\*\s*([^\n]+(?:\n(?!\*[A-Z])[^\n]*)*)/i.exec(block)?.[1];
    const correct = /\*Correct Strategy:\*\s*([^\n]+(?:\n(?!\*[A-Z])[^\n]*)*)/i.exec(block)?.[1]
      || /\*Correct(?: Response| Answer)?:\*\s*([^\n]+(?:\n(?!\*[A-Z])[^\n]*)*)/i.exec(block)?.[1];
    const note = /\*Coaching Note:\*\s*([^\n]+(?:\n(?!\*[A-Z])[^\n]*)*)/i.exec(block)?.[1]
      || /\*Coaching Feedback:\*\s*([^\n]+(?:\n(?!\*[A-Z])[^\n]*)*)/i.exec(block)?.[1];
    if (situation && correct) {
      pairs.push({
        situation: cleanLine(situation),
        correct: cleanLine(correct),
        note: note ? cleanLine(note) : '',
      });
    }
  }
  return matchingToQuestions(pairs);
}

/**
 * Parse markdown table style matching lessons
 * (match-the-scaffold / right-words-right-time).
 */
function parseTablePairs(md: string): InteractiveQuestion[] {
  const lines = md.split('\n');
  const rows: string[][] = [];
  let inTable = false;
  let sawHeader = false;
  for (const raw of lines) {
    const line = raw.trim();
    if (!line.startsWith('|') || !line.endsWith('|')) {
      if (inTable && sawHeader) break;
      continue;
    }
    const cells = line.slice(1, -1).split('|').map((c) => c.trim());
    if (cells.every((c) => /^-+$/.test(c) || /^:?-+:?$/.test(c))) {
      sawHeader = true;
      continue;
    }
    if (!inTable) {
      inTable = true;
      continue; // header row
    }
    if (sawHeader && cells.length >= 2) rows.push(cells);
  }
  const pairs = rows
    .map((r) => ({
      situation: cleanLine(r[0]),
      correct: cleanLine(r[1]),
      note: '',
    }))
    .filter((p) => p.situation && p.correct);
  return matchingToQuestions(pairs);
}

/**
 * Turn a list of (situation, correct-strategy) pairs into multiple-choice
 * questions where distractors come from other pairs' strategies.
 */
function matchingToQuestions(
  pairs: { situation: string; correct: string; note: string }[]
): InteractiveQuestion[] {
  if (pairs.length < 2) return [];
  const strategies = pairs.map((p) => p.correct);
  return pairs.map((p, i) => {
    const distractors = strategies.filter((s) => s !== p.correct);
    const picks = shuffle(distractors, i + 1).slice(0, Math.min(3, distractors.length));
    const optionTexts = shuffle([p.correct, ...picks], i * 7 + 3);
    const options: InteractiveOption[] = optionTexts.map((text, idx) => ({
      label: OPTION_LETTERS[idx],
      text,
      isCorrect: text === p.correct,
    }));
    return {
      id: `pair-${i + 1}`,
      prompt: p.situation,
      options,
      coachingNote: p.note || undefined,
    };
  });
}

/**
 * Parse Vignette-style spot-the-error lessons.
 * Options look like:
 *   - A) text
 *   - **B) correct text** ✓
 *   - C) text
 * Correct answer is bolded and/or marked with ✓.
 */
function parseVignetteMC(md: string): InteractiveQuestion[] {
  const blockRe = /\*\*(?:Vignette|Dialogue|Question|Scenario)\s+\d+[:.]?\*\*/g;
  const matches = [...md.matchAll(blockRe)];
  if (!matches.length) return [];

  const questions: InteractiveQuestion[] = [];
  for (let i = 0; i < matches.length; i++) {
    const start = matches[i].index!;
    const end = i + 1 < matches.length ? matches[i + 1].index! : md.length;
    const block = md.slice(start, end);

    // First line after the label = prompt (until first "\n- ")
    const afterLabel = block.replace(/^\*\*[^*]+\*\*\s*/, '');
    const promptMatch = /^([\s\S]*?)(?=\n\s*-\s)/.exec(afterLabel);
    if (!promptMatch) continue;
    const prompt = cleanLine(promptMatch[1]);

    const optionLines = [...afterLabel.matchAll(/\n\s*-\s*([^\n]+)/g)].map((m) => m[1]);
    if (optionLines.length < 2) continue;

    const options: InteractiveOption[] = [];
    for (let idx = 0; idx < optionLines.length; idx++) {
      const raw = optionLines[idx];
      const isCorrect = /\*\*.+\*\*/.test(raw) || /✓/.test(raw) || /^\s*Error:/i.test(stripEmphasis(raw));
      // Strip "A) " / "**B) ...** ✓" / "Error: " prefixes
      let text = stripEmphasis(raw).replace(/✓/g, '').trim();
      text = text.replace(/^[A-Z]\)\s*/, '').replace(/^Error:\s*/i, '').trim();
      options.push({
        label: OPTION_LETTERS[idx],
        text,
        isCorrect,
      });
    }

    // If NO option was flagged correct (or ALL were), fall back to a "reveal" style
    // where every option is treated as informational — skip this block.
    const correctCount = options.filter((o) => o.isCorrect).length;
    if (correctCount === 0 || correctCount === options.length) continue;

    // Coaching note: "*Correct Feedback:* ..." or "*Rationale:* ..."
    const noteMatch =
      /\*Correct Feedback:\*\s*([^\n]+)/i.exec(block) ||
      /\*Rationale:\*\s*([^\n]+)/i.exec(block);

    questions.push({
      id: `q-${i + 1}`,
      prompt,
      options,
      coachingNote: noteMatch ? cleanLine(noteMatch[1]) : undefined,
    });
  }
  return questions;
}

/**
 * Parse "**Scenario N:** prompt / - A ... / - B ..." blocks used by escape-room
 * digit-code and word-lock stages. Handles both:
 *   1. `- A (digit = 3): text` + `**Correct Answer: A (digit = 3)**`   (digit lock)
 *   2. `- A. text` / `- B. **P**text` + `**Correct: B — Proximity (P)**` (word lock)
 * Returns the correct letter/digit stream so the caller can assemble the code.
 */
function parseScenarioBlocks(md: string): {
  questions: InteractiveQuestion[];
  digits: string[];    // one digit per scenario, if digit-lock format detected
  letters: string[];   // one letter per scenario, if word-lock format detected
} {
  const blockRe = /\*\*Scenario\s+\d+[:.]?\*\*/g;
  const matches = [...md.matchAll(blockRe)];
  if (!matches.length) return { questions: [], digits: [], letters: [] };

  const questions: InteractiveQuestion[] = [];
  const digits: string[] = [];
  const letters: string[] = [];

  for (let i = 0; i < matches.length; i++) {
    const start = matches[i].index!;
    const end = i + 1 < matches.length ? matches[i + 1].index! : md.length;
    const block = md.slice(start, end);
    const afterLabel = block.replace(/^\*\*[^*]+\*\*\s*/, '');

    // Prompt = text between label and first "- A" / "- 1." bullet
    const promptMatch = /^([\s\S]*?)(?=\n\s*-\s)/.exec(afterLabel);
    if (!promptMatch) continue;
    const prompt = cleanLine(promptMatch[1]);

    // Try both delimiters:  "- A) ..."  "- A. ..."  "- A: ..."  "- A (digit = N): ..."
    const optionRe = /\n\s*-\s*([A-Z])(?:\s*\(digit\s*=\s*(\d+)\))?\s*[).:]\s*([^\n]+)/g;
    const rawOptions = [...afterLabel.matchAll(optionRe)];
    if (rawOptions.length < 2) continue;

    // Find the correct answer letter — several styles used across stages
    const correctMatch =
      /\*\*Correct Answer:\s*([A-Z])(?:\s*\(digit\s*=\s*(\d+)\))?/i.exec(block) ||
      /\*\*Correct:\s*([A-Z])/i.exec(block);
    const correctLetter = correctMatch?.[1];
    if (!correctLetter) continue;
    const explicitDigit = correctMatch?.[2];

    const options: InteractiveOption[] = rawOptions.map(([, letter, , text]) => ({
      label: letter,
      text: cleanLine(text),
      isCorrect: letter === correctLetter,
    }));

    // Record digit/letter for combination code assembly
    if (explicitDigit) {
      digits.push(explicitDigit);
    } else {
      // Try to extract digit from option text like "(digit = 3)"
      const embedded = /\(digit\s*=\s*(\d+)\)/.exec(rawOptions.find((r) => r[1] === correctLetter)?.[3] || '');
      if (embedded) digits.push(embedded[1]);
    }
    letters.push(correctLetter);

    const rationale =
      /\*\*Rationale:\*\*\s*([^\n]+)/i.exec(block)?.[1] ||
      /\*Rationale:\*\s*([^\n]+)/i.exec(block)?.[1];

    questions.push({
      id: `s-${i + 1}`,
      prompt,
      options,
      coachingNote: rationale ? cleanLine(rationale) : undefined,
    });
  }

  return { questions, digits, letters };
}

export function parseInteractiveLesson(md: string): InteractiveLesson {
  const introRe = /\*\*(?:Pair|Vignette|Dialogue|Scenario|Question)\s+\d+/;
  const { intro: labelIntro, body } = splitIntro(md, introRe);

  let questions = parsePairBlocks(body);
  let winner: 'pair' | 'table' | 'vignette' | null = questions.length ? 'pair' : null;
  if (!winner) {
    questions = parseTablePairs(md);
    if (questions.length) winner = 'table';
  }
  if (!winner) {
    questions = parseVignetteMC(body);
    if (questions.length) winner = 'vignette';
  }

  if (questions.length >= 2) {
    // Choose an intro that stops before the structured content the questions
    // came from, so we don't render the questions twice.
    let intro = labelIntro;
    if (winner === 'table') {
      // Cut everything from the first table row onward
      const idx = md.search(/^\s*\|/m);
      intro = idx > -1 ? md.slice(0, idx).trim() : md.split('\n\n')[0];
    } else if (!intro) {
      intro = md.split('\n\n')[0];
    }
    const isMatching = winner === 'pair' || winner === 'table';
    return {
      intro,
      questions,
      format: isMatching ? 'matching' : 'multiple-choice',
    };
  }

  // Fallback: no structured questions found. Sequence / reveal-only.
  return {
    intro: '',
    questions: [],
    format: /Drag-to-sequence/i.test(md) ? 'sequence' : 'reveal',
    fallbackMarkdown: md,
  };
}

// -----------------------------------------------------------------------------
// Branching scenarios — decision points and outcome paths
// -----------------------------------------------------------------------------

export type BranchOption = {
  label: string;         // "A" | "B" | "C"
  text: string;
  outcome?: string;
  feedback?: string;
  nextPointId?: string;  // resolved after all points parsed
  isOptimal?: boolean;
  isBestPath?: boolean;
};

export type DecisionPoint = {
  id: string;            // slugified heading, e.g. "decision-point-1"
  heading: string;       // "Decision Point 1"
  prompt: string;        // paragraph immediately after heading
  options: BranchOption[];
};

export type BranchingLesson = {
  intro: string;
  setup: string;
  points: DecisionPoint[];
  startPointId: string;
  takeaways: string[];
  reflectionPrompt?: string;
  fallbackMarkdown?: string;
};

function slugifyHeading(h: string): string {
  return h.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function parseBranchingLesson(md: string): BranchingLesson {
  // Intro = everything before the first "---" divider or first "###"
  const firstDiv = md.indexOf('\n---');
  const firstHeading = md.search(/\n###\s/);
  const introEnd = firstHeading > -1 ? firstHeading : (firstDiv > -1 ? firstDiv : md.length);
  const intro = md.slice(0, introEnd).trim();

  const setupMatch = /\*\*Setup:\*\*\s*([^\n]+(?:\n(?!\*\*)[^\n]*)*)/i.exec(intro);
  const setup = setupMatch ? cleanLine(setupMatch[1]) : '';

  // Split by ### headings
  const headingRe = /\n###\s+([^\n]+)/g;
  const headings = [...md.matchAll(headingRe)];
  const points: DecisionPoint[] = [];

  for (let i = 0; i < headings.length; i++) {
    const rawHeading = cleanLine(headings[i][1]);
    if (!/Decision Point|Recovery Decision Point|Reflection Decision Point/i.test(rawHeading)) continue;
    // Split "Decision Point 1: What do you do first?" into heading + inline prompt
    const colonIdx = rawHeading.indexOf(':');
    const headingText = colonIdx > -1 ? rawHeading.slice(0, colonIdx).trim() : rawHeading;
    const inlinePrompt = colonIdx > -1 ? rawHeading.slice(colonIdx + 1).trim() : '';

    const start = headings[i].index! + headings[i][0].length;
    const end = i + 1 < headings.length ? headings[i + 1].index! : md.length;
    const body = md.slice(start, end);

    // Body prompt = text between heading and first "**Option" (some points have
    // both an inline heading question and a body paragraph)
    const promptMatch = /^([\s\S]*?)(?=\n\s*\*\*Option)/.exec(body);
    const bodyPrompt = promptMatch ? cleanLine(stripEmphasis(promptMatch[1])) : '';
    const prompt = bodyPrompt || inlinePrompt || rawHeading;

    // Split by **Option X:**
    const optionRe = /\*\*Option\s+([A-Z0-9]+)[:.]?\*\*\s*([^\n]+)/g;
    const rawOptions = [...body.matchAll(optionRe)];
    const options: BranchOption[] = rawOptions.map((m, idx) => {
      const label = m[1];
      const openText = cleanLine(m[2]);
      // Grab lines after this option until next Option or heading
      const optStart = m.index! + m[0].length;
      const nextIdx = idx + 1 < rawOptions.length ? rawOptions[idx + 1].index! : body.length;
      const optBody = body.slice(optStart, nextIdx);
      const outcome = /→\s*\*Outcome:\*\s*([^\n]+)/i.exec(optBody)?.[1];
      const feedback = /→\s*\*Coaching Feedback:\*\s*([^\n]+)/i.exec(optBody)?.[1];
      const pathText = /→\s*\*Path:\*\s*([^\n]+)/i.exec(optBody)?.[1];
      const isOptimal = /Optimal|Best Path/i.test(pathText || '');
      return {
        label,
        text: openText,
        outcome: outcome ? cleanLine(outcome) : undefined,
        feedback: feedback ? cleanLine(feedback) : undefined,
        nextPointId: pathText ? slugifyHeading(pathText) : undefined,
        isOptimal,
        isBestPath: /Best Path Conclusion/i.test(pathText || ''),
      };
    });

    points.push({
      id: slugifyHeading(headingText),
      heading: headingText,
      prompt,
      options,
    });
  }

  // Resolve nextPointId by fuzzy-matching against actual point ids
  for (const point of points) {
    for (const opt of point.options) {
      if (!opt.nextPointId) continue;
      const target = points.find((p) => opt.nextPointId!.includes(p.id) || p.id.includes(opt.nextPointId!));
      opt.nextPointId = target?.id;
    }
  }

  // Takeaways
  const takeawaysBlock = /\*\*Key Takeaways:\*\*\s*([\s\S]*?)(?=\n\*\*|$)/i.exec(md)?.[1] || '';
  const takeaways = [...takeawaysBlock.matchAll(/^\s*\d+\.\s+([^\n]+)/gm)].map((m) => cleanLine(m[1]));

  const reflection = /\*\*Skill Reflection Prompt:\*\*\s*([^\n]+)/i.exec(md)?.[1];

  const start = points[0]?.id || '';
  if (!points.length || !start) {
    return {
      intro, setup,
      points: [],
      startPointId: '',
      takeaways: [],
      reflectionPrompt: undefined,
      fallbackMarkdown: md,
    };
  }

  return {
    intro, setup,
    points,
    startPointId: start,
    takeaways,
    reflectionPrompt: reflection ? cleanLine(reflection) : undefined,
  };
}

// -----------------------------------------------------------------------------
// Escape-room stage — combination unlock code
// -----------------------------------------------------------------------------

export type EscapeRoomStage = {
  intro: string;              // stage heading + lock type + instructions
  scenarios: InteractiveQuestion[];
  unlockCode: string;         // 4+ digit combination
  hint?: string;
  completeMessage?: string;
  fallbackMarkdown?: string;
};

export function parseEscapeRoomStage(md: string): EscapeRoomStage {
  // Explicit unlock lines (either "**Unlock Code:** 3 — 9 — 0 — 7" or "**Unlock Word: PEACE**")
  const codeLine = /\*\*Unlock Code:\*\*\s*([^\n]+)/i.exec(md)?.[1] || '';
  const wordLine =
    /\*\*Unlock Word:\*\*\s*([^\n*]+)/i.exec(md)?.[1] ||
    /\*\*Unlock Word:\s*([^\n*]+)\*\*/i.exec(md)?.[1] ||
    '';
  const digitOnly = codeLine.replace(/[^0-9]/g, '');
  const wordOnly = wordLine.replace(/[^A-Za-z]/g, '').toUpperCase();

  const { questions, digits, letters } = parseScenarioBlocks(md);

  // Pick lock format: prefer parsed per-scenario stream, else explicit line
  let unlockCode = '';
  if (digits.length >= 2) unlockCode = digits.join('');
  else if (letters.length >= 2 && wordOnly) unlockCode = wordOnly;
  else if (digitOnly) unlockCode = digitOnly;
  else if (wordOnly) unlockCode = wordOnly;

  const intro = md.split(/\n\*\*Scenario\s+\d+/)[0].trim();
  const hint = /\*\*Hint System:\*\*\s*([^\n]+)/i.exec(md)?.[1];
  const complete = /\*\*Stage Complete Message:\*\*\s*([^\n]+)/i.exec(md)?.[1];

  if (!questions.length || !unlockCode) {
    return {
      intro,
      scenarios: [],
      unlockCode: unlockCode || '',
      hint: hint ? cleanLine(hint) : undefined,
      completeMessage: complete ? cleanLine(complete) : undefined,
      fallbackMarkdown: md,
    };
  }

  return {
    intro,
    scenarios: questions,
    unlockCode,
    hint: hint ? cleanLine(hint) : undefined,
    completeMessage: complete ? cleanLine(complete) : undefined,
  };
}
