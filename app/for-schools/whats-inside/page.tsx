import '../for-schools.css';
import './whats-inside.css';

import PrintButton from './PrintButton';
import { getWhatsInside } from './data';
import { SECTIONS } from './sections';

/**
 * What's inside the Hub. A buyer facing catalogue of the Learning Hub.
 *
 * Written to a district buyer, not to a teacher, which is why it is linked
 * from /for-schools and the quote flow rather than from global navigation.
 * Its real job is to survive being forwarded internally with two lines of
 * context on top, so it has to stand alone with no meeting attached.
 *
 * Deliberate omissions, all decided with Rae on 22 September 2026:
 *   no counts of anything, anywhere
 *   no links on items and nothing that opens a document
 *   no cover images, since the stored thumbnails are generic art
 *   no community activity
 *
 * Styling comes from for-schools.css. The root element carries .fs-page so the
 * palette, type and buttons are the same objects the sales page uses, not a
 * copy that can drift.
 */

export const revalidate = 3600;

const BOOKING_LINK = 'https://calendar.app.google/zmoXT65rpHK9nyvS7';

export default async function WhatsInsidePage() {
  const content = await getWhatsInside();
  const bySlug = new Map(content.map((section) => [section.slug, section]));

  return (
    <div className="fs-page wi-page">
      <header className="fs-hero wi-hero">
        <div className="fs-wrap">
          <p className="fs-kicker" style={{ color: '#a9becd' }}>The Learning Hub</p>
          <h1>What your staff would actually get</h1>
          <p className="fs-sub">
            The Hub is the library behind every TDI offering. This page shows what is in it before
            you sign anything, sorted by the problem it solves rather than by the department it
            came from.
          </p>
          <div className="fs-btnrow wi-hero-actions">
            <a className="fs-btn fs-btn-gold" href={BOOKING_LINK}>Book twenty minutes</a>
            <a className="fs-btn fs-btn-ghost" href="#areas">See what is in there</a>
          </div>
          <p className="wi-printlink">Book twenty minutes at {BOOKING_LINK}</p>
        </div>
      </header>

      {/* The eight areas as their own band. They were in the hero and it read as
          clutter, partly because every blurb said again what the section below
          says properly. Label only here, and they behave like buttons. */}
      <nav className="wi-jump" aria-label="Jump to an area">
        <div className="fs-wrap">
          <p className="wi-jump-lead">What schools keep asking us for</p>
          <ul className="wi-tiles">
            {SECTIONS.map((section) => (
              <li key={section.slug}>
                <a
                  className="wi-tile"
                  href={`#${section.slug}`}
                  style={{ ['--a' as string]: section.accent }}
                >
                  {section.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <section className="fs-sec fs-sec-white">
        <div className="fs-wrap">
          <div className="fs-head-narrow">
            <p className="fs-kicker">How to read this page</p>
            <h2>Sorted by the problem, because that is how the work arrives</h2>
            <p className="fs-lede">
              Nobody wakes up needing a classroom management module. They wake up because two
              students have been clashing for a week, a para has been guessing at her role since
              August, and the new teacher in room 12 has stopped speaking up in meetings. Each
              section opens with those situations and shows the tools underneath.
            </p>
          </div>

          <div className="wi-requestband">
            <h4>Every tool is two documents</h4>
            <p>
              A short guide that explains the thinking, and the tool itself, built to print. The
              guide is what makes it work the second time, when the person who went to the training
              is not in the room.
            </p>
          </div>

          <PrintButton />
        </div>
      </section>

      <section className="fs-sec" id="areas">
        <div className="fs-wrap">
          {SECTIONS.map((section) => {
            const items = bySlug.get(section.slug);
            if (!items || items.featured.length === 0) return null;

            return (
              <div
                key={section.slug}
                className="wi-block"
                id={section.slug}
                style={{ ['--c' as string]: section.accent }}
              >
                <div className="wi-block-grid">
                  <div>
                    <h3>{section.headline}</h3>
                    <p className="wi-why">{section.standfirst}</p>
                    <p className="wi-via">
                      <b>Where this shows up</b>
                      {section.offering}
                    </p>
                  </div>

                  <div>
                    <div className="wi-items">
                      <ul>
                        {items.featured.map((item) => (
                          <li key={item.id}>
                            <div className="wi-title-row">
                              <b>{item.title}</b>
                              {item.badge ? <span className="wi-badge">{item.badge}</span> : null}
                            </div>
                            {item.description ? <p>{item.description}</p> : null}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {items.everything.length > 0 ? (
                      <details className="wi-more">
                        <summary>Everything in this section</summary>
                        <ul className="wi-full">
                          {items.everything.map((item) => (
                            <li key={item.id}>
                              <span>{item.title}</span>
                              <span
                                className={
                                  item.kind === 'Course' ? 'wi-kind wi-kind-course' : 'wi-kind'
                                }
                              >
                                {item.kind}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </details>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}

          <div className="wi-requestband">
            <h4>Partners ask for what is not here yet</h4>
            <p>
              When a partner needs something the library does not have, we build it and it joins the
              Hub for everyone. Most of what is on this page started as a school telling us what was
              missing.
            </p>
          </div>
        </div>
      </section>

      <section className="wi-finale">
        <div className="fs-wrap">
          <h2>Seeing it beats reading about it</h2>
          <p>
            Twenty minutes is enough to look at the section that matches what your building is
            actually dealing with this year, and to say whether the tools are any good.
          </p>
          <div className="fs-btnrow wi-hero-actions">
            <a className="fs-btn fs-btn-gold" href={BOOKING_LINK}>Book twenty minutes</a>
            <a className="fs-btn fs-btn-ghost" href="/for-schools">See the four offerings</a>
          </div>
          <p className="wi-legend">
            Tool, a guide plus the printable document itself. Course, a self paced course with
            lessons. Quiz, a self assessment that returns a result you can act on. Activity and Game,
            short practice that makes professional learning feel less like a slideshow. The library
            grows most weeks and this page grows with it.
          </p>
        </div>
      </section>
    </div>
  );
}
