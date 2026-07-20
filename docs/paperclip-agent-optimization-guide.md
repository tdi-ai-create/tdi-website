# Paperclip Agent Optimization Guide
## How to write agent instructions that minimize token burn and maximize performance

---

## The Problem

Every time an agent runs, it loads its full instruction set + task history + skill documents into context. Verbose instructions mean higher token costs per action and slower responses. Agents with bloated instructions also lose focus -- important rules get buried.

## Instruction File Structure

Every agent's MD file should follow this exact structure, in this order:

```
1. Identity (1-2 lines)
2. Scope boundaries (what you own, what you don't)
3. Never rules (hard stops -- highest priority)
4. Always rules (required behaviors)
5. Tools & skills (what APIs/skills you can invoke)
6. Escalation rules (when and where to route)
7. Voice/tone (only if agent drafts external content)
```

**Why this order matters:** Agents read top-down. If context gets truncated, you want identity and boundaries first, never rules second. Voice/tone is last because it only matters when generating output.

## Token Optimization Rules

### 1. Bullets over paragraphs
Bad (47 tokens):
> You are responsible for managing the sales pipeline. When you encounter a lead that has been in the targeting stage for more than 14 days without activity, you should flag it as stale and notify the CRO.

Good (23 tokens):
> - Flag leads stale after 14 days in targeting
> - Notify CRO on stale leads

### 2. No motivational language
Cut entirely:
- "You are a helpful and dedicated..."
- "Your goal is to provide excellent..."
- "Think carefully and thoroughly about..."
- "You should always strive to..."

Agents don't need encouragement. They need rules.

### 3. Tables over lists for structured data
Use tables when mapping conditions to actions:

| Condition | Action |
|---|---|
| Lead in Targeting > 14 days | Flag stale, notify CRO |
| Lead replies to email | Move to Engaged, log note |
| Lead requests PD plan | Move to Qualified at $18K |

### 4. Reference skills by name, don't inline
Bad: Pasting an entire API reference (500+ tokens) into agent instructions

Good: "Use the `tdi-funding-sync` skill to read/write grant data."

Skills are loaded separately. The instruction file just needs to say when to use them.

### 5. Separate "never" from "always"
**Never:** (hard stops that prevent damage)
- Never send an email without human approval
- Never delete data -- only archive
- Never commit to pricing or contract terms

**Always:** (required behaviors)
- Always log activity to the timeline
- Always CC rae@ on outreach drafts
- Always check for existing records before creating new ones

### 6. One sentence per rule
Bad: "When you encounter a situation where a school leader has submitted a PD Plan Request through the website form, you should create a new opportunity in the CRM at the Qualified stage with a default value of $18,000 and then notify Jim via email with the details."

Good: "New PD Plan Requests: create CRM opportunity at Qualified/$18K, email Jim the details."

### 7. Cut duplicate rules across agents
If every agent has the same 10-line safety preamble, move it to an org-level instruction that Paperclip loads automatically. Don't repeat it in every agent's MD.

### 8. Prune task history
Agents accumulate task history that inflates context. Periodically:
- Cancel stale/blocked tasks (they still load into context)
- Archive completed tasks older than 30 days
- Keep active task count under 20 per agent

### 9. Keep total instruction length under 2,000 tokens
Measure with a token counter. If an agent's instructions exceed 2,000 tokens, it's too verbose. Target:
- Identity + scope: 100 tokens
- Never/always rules: 300 tokens
- Tools/skills: 200 tokens  
- Escalation: 100 tokens
- Voice/tone: 200 tokens (only for outreach agents)
- **Total: ~900 tokens ideal, 2,000 max**

## Routine Optimization

Routines create recurring tasks. Each routine description also burns tokens.

- Keep routine descriptions under 3 sentences
- Put detailed instructions in the task template, not the routine description
- Set realistic frequencies -- a routine that runs hourly but only has daily work wastes 23 runs per day

## Skill Document Optimization

Skills are markdown files agents load when they need to call an API.

- Lead with "When to use this skill" (3 bullets max)
- Include ONE sample cURL per endpoint, not five
- Use a table for endpoint reference, not prose
- Omit response schemas unless the agent needs to parse specific fields

## Template: Agent Instruction File

```markdown
# [Agent Name] -- [Role Title]

## Scope
- Own: [2-3 bullet points of what this agent handles]
- Not yours: [1-2 things that are explicitly someone else's job]

## Never
- [Hard stop 1]
- [Hard stop 2]
- [Hard stop 3]

## Always
- [Required behavior 1]
- [Required behavior 2]
- [Required behavior 3]

## Tools
- Skill: `[skill-name]` -- [when to use, 5 words]
- Skill: `[skill-name]` -- [when to use, 5 words]

## Escalation
- Blocked? Route to [Agent Name]
- Needs human approval? Create task in [Project], assign to [Person]

## Voice (if drafting external content)
- Tone: [2-3 adjectives]
- Never say: [list of banned phrases]
- Sign as: [name and title]
```

## Measuring Success

After optimizing, track:
- **Token cost per agent per day** -- should drop 30-50%
- **Task completion rate** -- should stay the same or improve (less confusion)
- **Escalation volume** -- should decrease (clearer boundaries)
- **Restart frequency** -- should decrease (less memory pressure)
