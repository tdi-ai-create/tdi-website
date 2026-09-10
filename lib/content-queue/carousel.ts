/**
 * Carousel slides, and the shape a carousel has to be in to be rendered.
 *
 * There is no structural contract for carousels yet; Kristin is deciding that
 * from real work rather than from a spec. This is the minimum needed to turn
 * text into images at all, and it is derived from standards TDI already has
 * rather than invented:
 *
 *   Izzy's reel contract is Hook, Body, CTA. Zara's post standards say the first
 *   line must stop the scroll and the body is flowing prose, never bullets. The
 *   brand-voice skill calls social the most culturally disruptive version of the
 *   voice. So: slide one is the hook, the middle slides carry one idea each, and
 *   the last slide is the ask.
 *
 * Slides are separated by a blank line. Deliberately not "---": the database
 * refuses a double hyphen anywhere in a body, so a dash separator would make
 * every carousel unsavable.
 */

export const SLIDE_W = 1080
export const SLIDE_H = 1350 // 4:5, which Instagram now favours over square

export const MIN_SLIDES = 3
export const MAX_SLIDES = 10 // Instagram's own limit

/** Longest a slide can be and still be readable at thumb size. */
export const MAX_SLIDE_CHARS = 220
export const MAX_HOOK_CHARS = 120

export type Slide = {
  index: number
  kind: 'hook' | 'idea' | 'cta'
  text: string
}

export function parseSlides(body: string | null): Slide[] {
  const paras = (body ?? '')
    .split(/\n\s*\n/)
    .map(p => p.replace(/\s+/g, ' ').trim())
    .filter(Boolean)

  return paras.map((text, i) => ({
    index: i + 1,
    kind: i === 0 ? 'hook' : i === paras.length - 1 ? 'cta' : 'idea',
    text,
  }))
}

/**
 * What is wrong with this carousel, in the order a person would care.
 *
 * Returns reasons rather than a boolean, because Lily's gate has to be able to
 * say what she would have wanted and a boolean cannot. An empty array means it
 * can be rendered, not that it is good.
 */
export function carouselProblems(slides: Slide[]): string[] {
  const out: string[] = []
  if (slides.length === 0) return ['There are no slides. Separate each slide with a blank line.']
  if (slides.length < MIN_SLIDES) {
    out.push(`Only ${slides.length} slide${slides.length === 1 ? '' : 's'}. A carousel needs at least ${MIN_SLIDES}: a hook, at least one idea, and an ask.`)
  }
  if (slides.length > MAX_SLIDES) {
    out.push(`${slides.length} slides. Instagram allows ${MAX_SLIDES}, so the last ${slides.length - MAX_SLIDES} would never be seen.`)
  }
  const hook = slides[0]
  if (hook && hook.text.length > MAX_HOOK_CHARS) {
    out.push(`The hook is ${hook.text.length} characters. Over ${MAX_HOOK_CHARS} it stops being a hook and becomes a paragraph, and it will not stop the scroll.`)
  }
  for (const s of slides) {
    if (s.text.length > MAX_SLIDE_CHARS) {
      out.push(`Slide ${s.index} is ${s.text.length} characters. Over ${MAX_SLIDE_CHARS} it is unreadable at the size people actually see it.`)
    }
  }
  return out
}

/** Type sizes that keep a slide readable without measuring text. */
export function slideTypeSize(text: string, kind: Slide['kind']): number {
  const n = text.length
  if (kind === 'hook') return n <= 40 ? 96 : n <= 80 ? 76 : 60
  if (kind === 'cta') return n <= 60 ? 64 : 52
  return n <= 60 ? 72 : n <= 120 ? 58 : 46
}
