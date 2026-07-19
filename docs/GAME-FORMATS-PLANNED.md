# Planned Game Formats

Designs for future Learning Hub games. Each is ready to build when we start a session.

---

## 1. Sort It Out (Drag-to-Category)

**Learning mechanic:** Categorization builds pattern recognition. Educators sort items into buckets, revealing what they know vs. what they assume.

**How it works:**
- You see 8-10 items (statements, behaviors, strategies)
- Drag each into the correct category (2-4 buckets)
- After sorting all items, see which ones you got right and wrong
- Each wrong placement has an explanation of why it belongs where it does

**Screen flow:** `intro` -> `sort` -> `reveal` -> `results`

**Example scenarios:**

*Scenario 1: "Feedback or Praise?"*
- Buckets: Feedback (actionable) | Praise (feels good but teaches nothing)
- Items: "Great job!" (Praise), "I notice you used evidence from the text" (Feedback), "You are so smart" (Praise), "The way you organized your paragraphs shows clear thinking" (Feedback)

*Scenario 2: "Proactive or Reactive Classroom Management?"*
- Buckets: Proactive (prevents problems) | Reactive (responds to problems)
- Items: "Greeting students at the door" (Proactive), "Moving a student's seat after disruption" (Reactive), "Teaching routines the first week" (Proactive), "Taking away recess" (Reactive)

*Scenario 3: "Growth Mindset or Fixed Mindset Language?"*
- Buckets: Growth | Fixed
- Items: "You worked really hard on this" (Growth), "You are a natural at math" (Fixed), "What strategy did you use?" (Growth), "Some kids just get it" (Fixed)

*Scenario 4: "Accommodation or Modification?"*
- Buckets: Accommodation (same content, different access) | Modification (different content)
- Items: "Extended time on test" (Accommodation), "Fewer questions on test" (Modification), "Text-to-speech software" (Accommodation), "Alternative assignment" (Modification)

*Scenario 5: "Your Job or Not Your Job?" (for paras)*
- Buckets: Para responsibility | Teacher responsibility | Shared
- Items vary by context

**Interaction:** Touch-friendly drag and drop. On mobile, tap item then tap bucket. Visual feedback on placement (green flash for correct, amber for wrong bucket).

**Data model:**
```typescript
interface SortScenario {
  id: string
  title: { en: string; es: string }
  instruction: { en: string; es: string }
  buckets: { id: string; label: { en: string; es: string }; color: string }[]
  items: {
    text: { en: string; es: string }
    correctBucket: string
    explanation: { en: string; es: string }
  }[]
  research: { en: string; es: string }
  gradeBands: GradeBand[]
}
```

**Scoring:** Percentage correct. Track which items were mis-sorted for review mode.

**Color:** `#2563EB` (blue, not taken by other games)

**Build estimate:** Medium. New interaction pattern (drag/drop) but standard data model.

---

## 2. Scenario Chain (Branching Path)

**Learning mechanic:** Decisions compound. One choice changes the next situation. Builds systems thinking and consequence awareness.

**How it works:**
- You start with a classroom situation
- Make a decision from 2-3 options
- Your choice changes what happens next (different scenario based on what you picked)
- After 4-5 decisions, see the full chain: what you chose, what happened, and what an experienced educator might have done differently
- No "game over" -- every path is playable, some are just harder

**Screen flow:** `intro` -> `decide` -> `consequence` -> `decide` -> ... -> `debrief`

**Example chain:**

*"Monday Morning" (5 decisions)*

Decision 1: You arrive to find your co-teacher is absent with no sub plans.
- A: Start your normal routine and figure it out as you go
- B: Spend 10 minutes writing emergency plans before students arrive

If A -> Decision 2a: Students arrive and immediately ask "Where is Ms. Johnson?"
If B -> Decision 2b: You have a plan but students are already coming in and you are still writing

Decision 2a options lead to different Decision 3s, etc.

Each decision point shows:
- What happened because of your last choice
- A brief "experienced educator note" about the tradeoff
- Your next decision

**Debrief screen:**
- Full chain visualized as a path with your choices highlighted
- "Moments that mattered" -- the 1-2 decisions that had the biggest downstream impact
- Research reference on compounding decisions
- Reflection: "Which decision would you change if you could go back?"

**Data model:**
```typescript
interface ChainNode {
  id: string
  situation: { en: string; es: string }
  consequence?: { en: string; es: string } // what happened from previous choice
  choices: {
    text: { en: string; es: string }
    nextNodeId: string
    tag: { en: string; es: string }
  }[]
  expertNote?: { en: string; es: string }
}

interface ScenarioChain {
  id: string
  title: { en: string; es: string }
  description: { en: string; es: string }
  startNodeId: string
  nodes: Record<string, ChainNode>
  debrief: {
    research: { en: string; es: string }
    reflection: { en: string; es: string }
  }
  gradeBands: GradeBand[]
}
```

**Chain topics:**
- "Monday Morning" -- cascading decisions from an absent co-teacher
- "The Parent Meeting" -- each response shifts the parent's tone
- "The New Student" -- first week decisions that shape the rest of the year
- "Report Card Week" -- triaging competing deadlines
- "The Observation" -- decisions before, during, and after being observed

**Scoring:** No score. This is reflection, not competition. Track the path taken for profile analysis.

**Color:** `#0F766E` (deep teal, distinctive)

**Build estimate:** High. Branching data structure is more complex. Worth it for differentiation.

---

## 3. Memory Match

**Learning mechanic:** Association strengthens recall. Matching pairs forces educators to connect concepts to applications.

**How it works:**
- Grid of face-down cards (12-16 cards = 6-8 pairs)
- Flip two cards at a time
- If they match (concept + application), they stay face up
- If not, they flip back
- Timer optional
- Completed when all pairs are matched

**Example pair sets:**

*Set 1: "Classroom Strategy Matches"*
- "Proximity" <-> "Move closer to redirect without words"
- "Wait time" <-> "Pause 3-5 seconds after asking a question"
- "Warm demander" <-> "High expectations with genuine care"
- "Scaffolding" <-> "Temporary support removed as skill grows"
- "Formative assessment" <-> "Checking understanding during the lesson"
- "Differentiation" <-> "Same learning goal, different pathways"

*Set 2: "Feedback Formula Matches"*
- "Notice" <-> "I see that you..."
- "Name" <-> "That is called..."
- "Next Step" <-> "Now try..."
- "Level 1" <-> "Good job!"
- "Level 2" <-> "Nice details!"
- "Level 3" <-> "I see you used transition words. That is cohesion. Now vary them."

*Set 3: "De-escalation Matches"*
- "Validate" <-> "I can see you are frustrated"
- "Redirect" <-> "Let us take a walk and talk"
- "Choice" <-> "You can sit here or move to the calm corner"
- "Repair" <-> "When you are ready, let us figure this out together"

**Data model:**
```typescript
interface MatchPair {
  concept: { en: string; es: string }
  application: { en: string; es: string }
}

interface MatchSet {
  id: string
  title: { en: string; es: string }
  pairs: MatchPair[]
  research?: { en: string; es: string }
  gradeBands: GradeBand[]
}
```

**Scoring:** Moves to complete (fewer = better). Time optional. Track which pairs took multiple attempts for review.

**Color:** `#DB2777` (pink, not used)

**Build estimate:** Medium. Standard card flip mechanic. Touch-friendly grid.

---

## 4. Speed Round (Lightning Quiz)

**Learning mechanic:** Automaticity. Timed responses build the fast-twitch decision-making educators need in real classrooms.

**How it works:**
- 15 rapid-fire questions, 10 seconds each
- Multiple choice (2-3 options)
- Score based on speed + accuracy
- Streak multiplier (correct answers in a row boost score)
- Questions get harder as your streak grows
- Final score with leaderboard position (percentile vs other educators)

**Example questions:**

*Category: Questioning*
- "A student says 'I do not get it.' Best first response?" (10 sec)
  - A: "What part is confusing?" B: "Read it again" C: "Let me explain it differently"
- "Which is an open-ended question?" (8 sec)
  - A: "Did you finish?" B: "What did you notice?" C: "Is this correct?"

*Category: Classroom Management*
- "Two students are whispering. Fastest effective response?" (8 sec)
  - A: Proximity B: Stop and wait C: Call them out
- "Student says 'This is stupid.' Best move?" (10 sec)
  - A: "Tell me more about that" B: "That is not appropriate" C: "Just try your best"

*Category: Feedback*
- "Which is Level 3 feedback?" (10 sec)
  - Shows 3 options, one has Notice + Name + Next Step

**Data model:**
```typescript
interface SpeedQuestion {
  question: { en: string; es: string }
  options: { text: { en: string; es: string }; correct: boolean }[]
  timeSeconds: number
  difficulty: 'easy' | 'medium' | 'hard'
  category: string
}
```

**Scoring:** Points per correct answer. Bonus for speed (more points the faster you answer). Streak multiplier (2x at 3, 3x at 5, 5x at 8). Final score as percentile.

**Color:** `#DC2626` (red, energy/speed feel)

**Build estimate:** Low-medium. Simple mechanic, just needs good timer UX and smooth transitions.

---

## 5-8. New Topic Games (use existing formats)

These are not new mechanics. They use existing game formats with new content.

### 5. Parent Communication (use This or That format)
- 8 scenarios about parent interactions
- "How do you respond to this email?" / "What do you say in this conference?"
- Peer compare shows how other educators approach parent relationships
- Research: Joyce Epstein, Karen Mapp

### 6. De-escalation (use Classroom Shuffle format)
- 10 scenarios about student escalation
- Choose the best de-escalation response
- Covers: verbal de-escalation, body language, when to get help, repair after crisis
- Research: Ross Greene, Bruce Perry, trauma-informed practices

### 7. Co-teaching Dynamics (use This or That format)
- 8 scenarios about co-teaching partnerships
- Para vs lead teacher perspectives on the same situation
- Peer compare shows how each role sees the dynamic differently
- Research: Marilyn Friend's co-teaching models

### 8. IEP/Accommodations (use Sort It Out format)
- Sort items into: Accommodation vs Modification vs Neither
- Match IEP goals to appropriate classroom supports
- Separate scenario sets for paras vs teachers
- Research: IDEA, UDL framework

---

## Implementation Priority

| Game | Format | Lift | Impact | Priority |
|------|--------|------|--------|----------|
| Sort It Out | New mechanic | Medium | High (new interaction) | 1 |
| Parent Communication | This or That clone | Low | High (most requested topic) | 2 |
| De-escalation | Classroom Shuffle clone | Low | High (urgent need) | 3 |
| Speed Round | New mechanic | Low-Med | Medium (fun, shareable) | 4 |
| Co-teaching | This or That clone | Low | Medium (para-specific) | 5 |
| IEP/Accommodations | Sort It Out clone | Low | Medium (specialist need) | 6 |
| Memory Match | New mechanic | Medium | Medium (different feel) | 7 |
| Scenario Chain | New mechanic | High | High (most differentiated) | 8 |

---

## Revision History

| Date | Change |
|------|--------|
| 2026-07-19 | Initial draft of all 8 game formats |
