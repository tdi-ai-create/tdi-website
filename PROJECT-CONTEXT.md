# TDI Website Project Context
## Last Updated: January 4, 2026

Use this document to maintain continuity across Claude threads. Read this ENTIRE document before making any changes.

---

## PROJECT OVERVIEW

**Repository:** tdi-website (GitHub: tdi-ai-create/tdi-website)
**Deployment:** Vercel at teachersdeserveit.vercel.app
**Framework:** Next.js with TypeScript, Tailwind CSS
**Local Dev:** `npm run dev` → http://localhost:3000

---

## BRAND STYLE GUIDE (STRICT)

### Colors (Use ONLY these)
- Navy: #1e2749 (primary text, dark backgrounds)
- Yellow: #ffba06 (CTAs, accents, highlights)
- Blue: #80a4ed (secondary backgrounds, icons)
- White: #ffffff (text on dark, card backgrounds)
- Gray: #f5f5f5 (section backgrounds)
- Light Blue: #E8F0FD (testimonial cards, subtle backgrounds)

### Typography
- Headings: Bold, navy or white depending on background
- Body: Regular weight, navy with 0.7-0.8 opacity for secondary text

### Formatting Rules (STRICT - NO EXCEPTIONS)
- NO emojis anywhere on the site
- NO em-dashes (—) - use commas or regular dashes
- NO underlines on text (except actual links on hover)
- NO bullet points in prose - write naturally
- Minimal formatting - clean and modern

### Component Patterns

**Hero Sections:**
- Background image with navy gradient overlay (60-80% opacity)
- White centered text
- Yellow primary CTA, white outline secondary CTA

**Icon Cards (Established Pattern):**
```
┌─────────────────┐
│ [ICON/IMAGE]    │ ← Colored background or grayscale image
├─────────────────┤
│ TITLE           │ ← White box with navy text
│ Description     │
│ CTA link →      │
└─────────────────┘
```

**Section Color Alternation:**
Navy → Blue → White → Gray → Blue → Navy (creates visual rhythm)

**Dual CTA Pattern (for school leaders):**
```tsx
<div className="flex flex-col sm:flex-row gap-4 justify-center">
  <a href="/free-pd-plan" style={{ backgroundColor: '#ffba06', color: '#1e2749' }}>
    Get Your Free PD Plan
  </a>
  <a href="/contact" style={{ borderColor: '#ffffff', color: '#ffffff' }}>
    Schedule a Call
  </a>
</div>
```

---

## PAGE STATUS

### COMPLETED PAGES

**Homepage (app/page.tsx)**
- Hero with Rae's photo, parallax background
- Stats section, features, testimonials
- Calculator section

**For Schools (app/for-schools/page.tsx)**
- Hero with parallax background
- Stats (blue background)
- Pain points (centered text, gray boxes)
- What Schools Get (navy bg, white cards, yellow borders)
- Testimonials (white bg, light blue cards)
- Built for Every Leader (navy bg, 4 photo cards - grayscale, 11px titles)
- Partnership Journey (timeline with IGNITE detailed, phases 2-3 as teasers)
- Final CTA (light blue #80a4ed background)

**Join (app/join/page.tsx)**
- Hero with parallax
- Free ways section (yellow icon cards)
- For Teachers section
- For School Leaders section (blue icon cards)

**Free PD Plan (app/free-pd-plan/page.tsx)**
- Hero with background image
- 5-step multi-step form with progress bar
- Step icons and labels
- Sidebar with "What You'll Get" checklist + testimonial
- Web3Forms integration (key: c5ce0165-a022-418f-92d4-9bdcfbd60a37)
- Emails to: Rae@TeachersDeserveIt.com
- Scroll-to-top on step change

**About (app/about/page.tsx)**
- Hero with background image
- How It Started (background image with left-right gradient, 2-column: story + TDI Blueprint)
- Stats section (blue background)
- Meet the Founder (Rae bio, TEDx, Amazon book, social links with TikTok)
- Team section (integrated below Rae with yellow/blue icons)
- Final CTA (dual buttons)

### KEY IMAGE FILES

Located in /public/images/:
- hero-join.png (women at cafe)
- hero-for-schools.png (woman in green beanie)
- hero-about.png (woman at computer)
- hero-pd-plan.png (woman in black)
- rae-headshot.png (B&W photo of Rae)
- leader-principal.png
- leader-superintendent.png
- leader-curriculum.png
- leader-hr.png
- about-teacher-pointing.png (How It Started background)

---

## PENDING TASKS

### SITE-WIDE CLEANUP
- Verify all em-dashes removed
- Verify all emojis removed
- Verify Free PD Plan CTAs on all school-leader pages

### DEPLOYMENT
- Vercel deployment limit resets daily
- After reset: redeploy to push all changes live

---

## CRITICAL DECISIONS MADE (DO NOT CHANGE)

1. **Dual audience approach** - Teachers AND administrators through unified experience
2. **IGNITE-first pricing** - Only show ~$33,600 entry point, tease phases 2-3
3. **Timeline design** - Partnership Journey uses 1→2→3 connected timeline
4. **Photo cards grayscale** - Leader photos use CSS filter: grayscale(100%)
5. **11px titles on leader cards** - Hardcoded font size to prevent overflow
6. **Free PD Plan as primary CTA** - For school leaders, not "Schedule a Call"
7. **No separate pricing page** - Removed /for-schools/pricing
8. **Form submissions to Rae** - Not Info@teachersdeserveit.com

---

## SOCIAL LINKS (Rae's handles)

- Instagram: @raehughart
- TikTok: @raehughartedu
- LinkedIn: /in/raehughart
- Twitter/X: @raehughart
- Facebook: /raehughart
- TEDx Talk: https://www.youtube.com/watch?v=OLzaa7Hv3mo
- Amazon Book: https://www.amazon.com/dp/1951600401

---

## TEAM MEMBERS

Leadership:
- Rae Hughart - CEO & Founder
- Omar Garcia - CFO
- Kristin Williams - CMO
- Rachel Patragas - Director of Creative Solutions

Content Creators:
- Ian R Bowen
- Erin Light
- Katie Welch
- Sue Thompson
- Tyson Gardin
- Walter Cullin Jr
- Paige Roberts

---

## STATS TO USE (Verified)

- 87,000+ educators in community
- 21 states with partner schools
- 38% increase in strategy implementation
- 95% of teachers saved planning time
- Planning hours: 12 → 6-8 hours weekly
- Stress levels: 9 → 5-7 (10-point scale)

---

## PRICING (Reference Only)

- IGNITE: ~$33,600/year (Leadership + Pilot)
- ACCELERATE: ~$54,240/year (Full Staff)
- SUSTAIN: ~$84,240/year (Embedded Systems)

Only show IGNITE pricing on For Schools page. Others are teasers.

---

## PROMPT TEMPLATE FOR NEW THREADS

Start new threads with:

```
I'm continuing work on the TDI website. Please read PROJECT-CONTEXT.md in the root directory before making any changes. This contains our style guide, completed work, and decisions that should NOT be changed.

Current task: [describe what you want to do]

Important reminders:
- NO emojis
- NO em-dashes
- Use only brand colors
- Follow established component patterns
- Do NOT change designs that are already working
```
