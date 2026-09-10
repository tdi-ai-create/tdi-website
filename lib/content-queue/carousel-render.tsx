import { ImageResponse } from 'next/og'
import { Slide, slideTypeSize, SLIDE_W, SLIDE_H } from './carousel'

// TDI's palette, taken from the Quick Win PDF templates so a carousel and a
// download do not look like they came from two different organisations.
const NAVY = '#1E2749'
const GOLD = '#E8B84B'
const CREAM = '#FEF9EE'

/**
 * One slide as a PNG.
 *
 * Shared by the agent endpoint, which authenticates with the sync key, and the
 * admin preview, which authenticates with a session. Two callers, one drawing,
 * so a reviewer and a writer are never looking at different renderings of the
 * same slide.
 */
export function renderSlide(slide: Slide, total: number): ImageResponse {
  const onNavy = slide.kind === 'hook'
  const size = slideTypeSize(slide.text, slide.kind)

  return new ImageResponse(
    (
      <div
        style={{
          width: SLIDE_W, height: SLIDE_H, display: 'flex', flexDirection: 'column',
          justifyContent: 'space-between',
          background: onNavy ? NAVY : CREAM,
          padding: 88,
        }}
      >
        {/* The hook slide is inverted, so slide one reads as a different beat
            from the ones that follow it. */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 56, height: 8, background: GOLD }} />
          <div style={{
            fontSize: 26, letterSpacing: 3, textTransform: 'uppercase',
            color: onNavy ? GOLD : NAVY, fontWeight: 700,
          }}>
            Teachers Deserve It
          </div>
        </div>

        <div style={{
          display: 'flex', fontSize: size, lineHeight: 1.18, fontWeight: 700,
          color: onNavy ? '#FFFFFF' : NAVY,
        }}>
          {slide.text}
        </div>

        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
          fontSize: 24, color: onNavy ? 'rgba(255,255,255,0.65)' : 'rgba(30,39,73,0.55)',
        }}>
          <div style={{ display: 'flex' }}>
            {slide.kind === 'cta' ? 'teachersdeserveit.com' : ''}
          </div>
          <div style={{ display: 'flex' }}>{slide.index} of {total}</div>
        </div>
      </div>
    ),
    { width: SLIDE_W, height: SLIDE_H },
  )
}
