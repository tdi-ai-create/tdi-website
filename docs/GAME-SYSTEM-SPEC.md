# TDI Learning Hub -- Practice Game System Spec

**Version:** 1.0
**Last updated:** 2026-07-19
**Status:** Live (v1 shipped)

---

## 1. Purpose

Practice Games are interactive, scenario-based learning tools embedded in the TDI Learning Hub. They provide deliberate practice for classroom skills -- questioning, feedback, prioritization, classroom management, and energy management. Games support solo play, group PD facilitation, and spaced repetition for long-term retention.

Games are NOT gamified wrappers around static content. The game mechanic IS the learning activity.

---

## 2. System Architecture

### 2.1 File Structure

```
app/paragametools/
  page.tsx                          # Redirects to /hub/quick-wins
  layout.tsx                        # Metadata wrapper
  context/
    LanguageContext.tsx              # EN/ES toggle (shared across all games)
  components/
    GameWrapper.tsx                  # Base layout: header, back nav, content area
    GameSettingsPanel.tsx            # Difficulty / grade band / role selector
    HomeScreen.tsx                   # Game selection grid (player mode)
    FacilitatorHome.tsx             # Game selection grid (facilitator mode)
    FacilitatorDashboard.tsx        # Room timer, tips, group moments
    Timer.tsx                       # Countdown timer + controls
    StreakCounter.tsx                # "N in a row!" display (shows at streak >= 2)
    ConfettiBurst.tsx               # Particle celebration animation
    [GameName].tsx                  # One component per game (9 total)
  data/
    gameConfig.ts                   # GameId type, GAMES array, COLORS, shuffle utils
    gameSettings.ts                 # Difficulty/GradeBand/Role types, filter logic
    translations.ts                 # UI_TRANSLATIONS (all game UI strings, EN/ES)
    tips.ts                         # Facilitator tips per game
    groupMoments.ts                 # Facilitator group discussion prompts
    [gameName].ts                   # Scenario/question data per game

lib/hub/
    useGameTracking.ts              # React hook: session lifecycle, response logging, stats, badges
    gameBadges.ts                   # Badge definitions with check functions
    gameBadgeEngine.ts              # Evaluates badges, persists to DB
    gameReviewMode.ts               # Spaced repetition item prioritization

components/hub/
    GameStatsCard.tsx               # Profile: per-game play history + accuracy
    GameBadgeGrid.tsx               # Profile: earned + in-progress badges
    GameBadgeCelebration.tsx        # Full-screen badge unlock overlay
    useGameBadgeCheck.tsx           # Hook: fires badge check on game done screen
    gameBadgeIcons.ts               # Maps icon name strings to Lucide components
```

### 2.2 Database Tables

All tables live in the **Learning Hub Supabase project** (not Creator Portal).

| Table | Purpose | RLS |
|-------|---------|-----|
| `hub_game_sessions` | One row per game play-through | User reads/writes own |
| `hub_game_responses` | One row per answer within a session | User reads/writes own |
| `hub_game_badges` | One row per earned badge (unique per user+badge) | User reads/inserts own |
| `hub_activity_log` | Legacy completion log (`practice_tool_completed`) | User reads/writes own |

**hub_game_sessions columns:**
- `id` (UUID PK)
- `user_id` (FK auth.users)
- `game_id` (text, e.g. `'tell-or-ask'`)
- `started_at`, `completed_at` (timestamptz)
- `score`, `total_rounds`, `best_streak` (int)
- `time_spent_seconds` (int)
- `language` (text: `'en'` | `'es'`)
- `difficulty`, `grade_band`, `role` (text, settings used)
- `is_review_mode` (boolean)

**hub_game_responses columns:**
- `id` (UUID PK)
- `session_id` (FK hub_game_sessions)
- `user_id` (FK auth.users)
- `game_id` (text)
- `item_id` (text, stable identifier e.g. `'tellorask_4'`)
- `round_number` (int)
- `user_answer`, `correct_answer` (text)
- `is_correct` (boolean)
- `confidence` (int 1-5, nullable)
- `time_spent_seconds` (int, nullable)
- `answered_at` (timestamptz)

### 2.3 Game ID Convention

Games use **kebab-case** IDs in the database and tracking layer:

| Game | DB game_id | Config id |
|------|-----------|-----------|
| Question Knockout | `question-knockout` | `knockout` |
| Tell or Ask? | `tell-or-ask` | `tellorask` |
| Feedback Level Up | `feedback-level-up` | `levelup` |
| Feedback Madlibs | `feedback-madlibs` | `madlibs` |
| Feedback Makeover | `feedback-makeover` | `makeover` |
| What's Your Move? | `whats-your-move` | `whatsyourmove` |
| Classroom Shuffle | `classroom-shuffle` | `classroomshuffle` |
| Prioritize This | `prioritize-this` | `prioritize` |
| Energy Budget | `energy-budget` | `energybudget` |

---

## 3. Game Component Pattern

Every game follows a three-screen state machine:

```
INTRO  -->  PLAY  -->  DONE/RESULTS
```

### 3.1 Required Integration Points

Every game component MUST:

1. **Import and call `useGameTracking()`**
   - `startSession()` on game start (intro -> play transition)
   - `logGameResponse()` on each answer (for scoreable games)
   - `logCompletion()` on finish (backward compat with activity log)
   - `completeSession()` on finish (structured session data)

2. **Import and render `useGameBadgeCheck()`**
   - Call with `screen === 'done'` (or `'results'`)
   - Render returned element inside `<GameWrapper>` as first child

3. **Preserve original item indices** for stable `item_id` values
   - When shuffling data arrays, map items with `_origIndex` before shuffle
   - Use `{gameprefix}_{origIndex}` as the item_id (e.g. `tellorask_4`)

4. **Use bilingual data** -- all user-facing text must have `{ en, es }` shape

### 3.2 Template for a New Game

```tsx
'use client';
import { useState, useMemo } from 'react';
import { GameWrapper, IntroScreen, DoneScreen } from './GameWrapper';
import { COLORS, shuffleAndPick } from '../data/gameConfig';
import { useLanguage } from '../context/LanguageContext';
import { UI_TRANSLATIONS } from '../data/translations';
import { useGameTracking } from '@/lib/hub/useGameTracking';
import { useGameBadgeCheck } from '@/components/hub/useGameBadgeCheck';
import { GameSettingsPanel } from './GameSettingsPanel';
import { type GameSettings, DEFAULT_SETTINGS, filterBySettings } from '../data/gameSettings';
import { MY_GAME_DATA, MY_GAME_ROUNDS } from '../data/myGameData';

type Screen = 'intro' | 'play' | 'done';

export function MyGame({ onBack }: { onBack: () => void }) {
  const [screen, setScreen] = useState<Screen>('intro');
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);
  // ... game state ...

  const { logCompletion, startSession, logGameResponse, completeSession } = useGameTracking();
  const { language } = useLanguage();
  const t = UI_TRANSLATIONS;

  const items = useMemo(() => {
    const indexed = MY_GAME_DATA.map((item, i) => ({ ...item, _origIndex: i }));
    const filtered = filterBySettings(indexed, settings);
    const pool = filtered.length >= 6 ? filtered : indexed;
    return shuffleAndPick(pool, Math.min(MY_GAME_ROUNDS, pool.length));
  }, [settings]);

  const handleStart = async () => {
    setScreen('play');
    await startSession('my-game', items.length, {
      language,
      difficulty: settings.difficulty,
      gradeBand: settings.gradeBand,
      role: settings.role,
    });
  };

  // On each answer:
  const handleAnswer = (userAnswer: string, correctAnswer: string, isCorrect: boolean) => {
    logGameResponse('my-game', {
      itemId: `mygame_${items[currentRound]._origIndex}`,
      roundNumber: currentRound + 1,
      userAnswer,
      correctAnswer,
      isCorrect,
    });
  };

  // On game complete:
  const handleFinish = async () => {
    setScreen('done');
    logCompletion({ tool: 'my-game', score, totalRounds: items.length, streak });
    await completeSession(score, bestStreak);
  };

  const badgeCelebration = useGameBadgeCheck(screen === 'done');

  return (
    <GameWrapper gameId="mygame" title="My Game" color="orange" onBack={onBack}>
      {badgeCelebration}
      {screen === 'intro' && (
        <IntroScreen
          gameId="mygame"
          title="My Game"
          color="orange"
          rules={['Rule 1', 'Rule 2']}
          onStart={handleStart}
          extraContent={
            <GameSettingsPanel
              settings={settings}
              onChange={setSettings}
              language={language}
              accentColor="#FF7847"
            />
          }
        />
      )}
      {/* ... play screen ... */}
      {screen === 'done' && (
        <DoneScreen title="Done!" message="..." tableTalk="..." color="orange" onBack={onBack} />
      )}
    </GameWrapper>
  );
}
```

---

## 4. Settings System

### 4.1 Difficulty Levels

| Level | Label (EN) | Description | Accent |
|-------|-----------|-------------|--------|
| `all` | All Levels | Mix of everything | `#7C9CBF` |
| `easy` | Warm Up | Clear-cut scenarios | `#27AE60` |
| `medium` | Game On | Requires some nuance | `#F1C40F` |
| `hard` | Challenge | Ambiguous, tricky calls | `#E74C3C` |
| `expert` | Expert | Real gray areas | `#9333EA` |

### 4.2 Grade Bands

`k-2`, `3-5`, `6-8`, `9-12`, `all`

### 4.3 Educator Roles

`teacher`, `para`, `coach`, `leader`, `all`

### 4.4 Tagging Data Items

Each scenario/question in a data file can include optional tags:

```typescript
{
  statement: { en: "...", es: "..." },
  type: "TELL",
  why: { en: "...", es: "..." },
  difficulty: "hard",           // optional
  gradeBand: ["6-8", "9-12"],   // optional, string or string[]
  roles: ["teacher", "para"],   // optional, string or string[]
}
```

Items without tags pass all filters (backward-compatible).

### 4.5 Filtering Logic

`filterBySettings()` in `gameSettings.ts`:
- If setting is `'all'`, that dimension is skipped
- If item has no tag for that dimension, it passes
- If item's tag is `'all'`, it passes
- Array tags: item passes if ANY tag matches the setting
- **Minimum pool rule:** If filtered pool < 6 items, fall back to unfiltered pool

### 4.6 Benchmarks for New Content

When adding scenarios to a game, ensure:
- Minimum **6 items per difficulty level** for the settings filter to work
- Minimum **4 items per grade band** for grade filtering
- Each item tagged with at least `difficulty` and `gradeBand`
- Role tags only when the scenario is genuinely role-specific

---

## 5. Badge System

### 5.1 Badge Categories

| Category | What It Rewards | Examples |
|----------|----------------|---------|
| `explorer` | Trying different games | Player One, Variety Pack, Full Roster |
| `mastery` | Accuracy thresholds | Sharp Eye (80%), Perfectionist (100%), game-specific 90% badges |
| `streak` | Consecutive correct | On a Roll (3), Hot Streak (7), Unstoppable (12) |
| `dedication` | Volume and consistency | Getting Reps (5), Practice Makes (15), Deep Practice (5x same) |

### 5.2 Badge Tiers

| Tier | Visual | Typical Threshold |
|------|--------|-------------------|
| 1 (Bronze) | Copper gradient ring | Entry-level (1 game, 3 streak, 80% accuracy) |
| 2 (Silver) | Silver gradient ring | Intermediate (90% game-specific, 7 streak, 15 sessions) |
| 3 (Gold) | Gold gradient ring | Advanced (100%, 12 streak, 30 sessions, all 9 games) |

### 5.3 Adding a New Badge

Add to `GAME_BADGES` array in `lib/hub/gameBadges.ts`:

```typescript
{
  id: 'unique_badge_id',           // snake_case, unique across all badges
  title: 'Badge Title',            // short, 2-3 words
  description: 'What you did',     // one sentence, user-facing
  personalNote: 'Why it matters',  // italic message on celebration screen
  category: 'mastery',             // explorer | mastery | streak | dedication
  icon: 'LucideIconName',          // must be registered in gameBadgeIcons.ts
  accent: '#hexcolor',             // ring/accent color
  tier: 2,                         // 1 | 2 | 3
  check: (ctx) => ({               // evaluation function
    earned: ctx.perGame.get('game-id')?.bestAccuracy >= 0.9,
    current: Math.round((ctx.perGame.get('game-id')?.bestAccuracy ?? 0) * 100),
    target: 90,
  }),
}
```

If the badge uses a new Lucide icon, add it to `components/hub/gameBadgeIcons.ts`.

### 5.4 Badge Evaluation Flow

```
Game completes
  -> completeSession() writes to hub_game_sessions
  -> useGameBadgeCheck hook fires (500ms delay for DB settle)
  -> checkGameBadges() queries all sessions + existing badges
  -> Evaluates each badge definition against session data
  -> Inserts newly earned badges to hub_game_badges (UNIQUE constraint)
  -> Returns newlyEarned[] for celebration UI
  -> GameBadgeCelebration renders overlay with confetti
```

---

## 6. Spaced Repetition

### 6.1 How It Works

`getWeakItems()` in `useGameTracking`:
1. Queries all `hub_game_responses` for the user + game
2. Groups by `item_id`
3. Calculates accuracy per item (correct / total seen)
4. Filters to items with at least one wrong answer
5. Sorts by lowest accuracy first, then least recently seen

`buildReviewPool()` in `gameReviewMode.ts`:
1. Takes full item pool + weak items
2. Puts weak items first (up to target count)
3. Fills remainder with unseen/other items
4. Shuffles final selection so weak items aren't always first
5. Returns `{ items, isReviewMode: true }`

### 6.2 Future: Review Mode Entry Point (Not Yet Built)

Games should offer a "Review Mode" button on the intro screen when the user has weak items. This button would:
- Call `getWeakItems()` on intro screen mount
- Show count: "You missed 4 items last time"
- On click, use `buildReviewPool()` instead of random shuffle
- Pass `isReviewMode: true` to `startSession()`

---

## 7. Discoverability

Games surface in three places:

| Location | How | Implementation |
|----------|-----|----------------|
| Quick Wins tab | "Games" filter category + discovery banner | Banner clicks `setActiveFilter('Games')` |
| Courses tab | "Practice Games" section at bottom | Links to `/hub/quick-wins?filter=Games` |
| Profile > My Growth | GameStatsCard + GameBadgeGrid | Components query `hub_game_sessions` |

The Quick Wins page accepts `?filter=Games` query parameter to auto-select the Games category on load.

---

## 8. Facilitator Mode

### 8.1 Current State

- `FacilitatorHome.tsx` shows game cards in grid with duration badges
- `FacilitatorDashboard.tsx` provides room timer, rotating tips, group moments, pause overlay
- Toggle between Player / Facilitator mode on HomeScreen

### 8.2 Gap: Facilitator Instructions

Games that work well for group PD need clear, self-contained "How to Run This" instructions. A facilitator with no prior knowledge should be able to:
1. Read the instructions on-screen
2. Understand the format (solo vs pairs vs whole-room)
3. Know timing expectations
4. Have 2-3 debrief questions ready

**Benchmark:** Every group-capable game should have a facilitator instruction card accessible from its intro screen, separate from the game rules (which are player-facing).

---

## 9. Benchmarks for Future Game Builds

### 9.1 Before Starting

- [ ] Define the learning mechanic (what skill does the game build?)
- [ ] Identify game type: scoreable (has correct answers) or open-ended (practice-based)
- [ ] Write 15+ scenarios minimum (to support difficulty filtering)
- [ ] Tag all scenarios with `difficulty` and `gradeBand` at minimum
- [ ] Choose a color from `COLORS` in `gameConfig.ts`

### 9.2 Code Checklist

- [ ] Component follows three-screen pattern (`intro` -> `play` -> `done`)
- [ ] Uses `GameWrapper` for layout
- [ ] Uses `IntroScreen` or custom intro with `GameSettingsPanel`
- [ ] Calls `startSession()` on game start
- [ ] Calls `logGameResponse()` per round (if scoreable)
- [ ] Calls `logCompletion()` + `completeSession()` on finish
- [ ] Calls `useGameBadgeCheck()` and renders celebration
- [ ] Preserves `_origIndex` for stable item IDs
- [ ] All user-facing text is bilingual `{ en, es }`
- [ ] All translations added to `UI_TRANSLATIONS` in `translations.ts`
- [ ] Game added to `PRACTICE_TOOLS` array in `quick-wins/page.tsx`
- [ ] Game added to `GAMES` array in `gameConfig.ts`
- [ ] Game added to `GAME_DISPLAY` map in `GameStatsCard.tsx`
- [ ] Game icon added to `GAME_ICONS` in `GameWrapper.tsx`
- [ ] TypeScript compiles with no new errors

### 9.3 Content Quality Checklist

- [ ] Scenarios are realistic and drawn from actual classroom situations
- [ ] Difficulty distribution: ~30% easy, ~35% medium, ~25% hard, ~10% expert
- [ ] Grade bands represented: at least 3 items per band, or tagged `'all'`
- [ ] Wrong answers are plausible (not obviously wrong)
- [ ] Explanations teach, not just judge ("This works because..." not just "Wrong!")
- [ ] Reviewed by at least one practicing educator

### 9.4 Community Content Requirement (MANDATORY)

Every new tool published to the Learning Hub MUST have seeded community content within 24-48 hours. No exceptions. Empty community sections discourage participation.

- [ ] **Games:** 5 seeded `quick_win_responses` posts from varied roles and grade levels
- [ ] **Games:** 3 hardcoded testimonials on the landing page (in `GAME_TESTIMONIALS`)
- [ ] **Quick Wins:** 3-5 seeded `quick_win_responses` posts from varied educator personas
- [ ] **Courses:** Seeded Q&A posts on key lessons
- [ ] Posts include realistic roles (teacher, para, coach, admin), grade levels (K-2 through 9-12), and timestamps spread across recent weeks
- [ ] Posts model the type of engagement we want (sharing experiences, adaptations, questions)
- [ ] No post should read as AI-generated (no dashes, natural voice, specific details)

**QA Gate:** Julie Lynn (QA agent) should verify community content exists before marking any new tool as launch-ready. This is a blocking requirement, not optional.

### 9.4 Scalability Notes

- Data arrays are static TypeScript (no DB fetch needed for game content)
- Adding items to existing games requires only editing data files -- no component changes
- New badge definitions require only editing `gameBadges.ts` -- engine handles evaluation
- Settings panel is plug-and-play: import + add to intro screen `extraContent`
- `filterBySettings()` works generically on any array with optional tags

---

## 10. Topic Coverage (Current + Planned)

| Topic | Current Games | Gap |
|-------|--------------|-----|
| Questioning techniques | Question Knockout, Tell or Ask | Covered well |
| Feedback quality | Feedback Level Up, Makeover, Madlibs | Strong (3 games) |
| Scenario response | What's Your Move, Classroom Shuffle | Needs more scenarios |
| Prioritization | Prioritize This | Needs more rounds |
| Self-management | Energy Budget | Needs more rounds |
| Parent communication | -- | **Gap: no game exists** |
| De-escalation | -- | **Gap: no game exists** |
| Co-teaching dynamics | -- | **Gap: no game exists** |
| IEP/accommodations | -- | **Gap: no game exists** |
| Culturally responsive practice | -- | **Gap: no game exists** |

---

## 11. Revision History

| Date | Change | Author |
|------|--------|--------|
| 2026-07-19 | v1.0 -- Initial spec covering full game system | Claude |
