# Paperclip Tasks: Substack Subscriber Hub Account Setup + Communication
## Created June 1, 2026 (Launch Day)
## Project: Learning Hub

NOTE: These tasks cover ONLY account creation and communication. Substack page/copy/tier updates will be handled separately by Rae.

---

## TASK 1: Import Engaged International Substack Subscribers to Hub
**Assignee:** Engineering agent (Izzy Reeves or Chris Copypaste)
**Due:** June 3, 2026 (Tuesday EOD)
**Priority:** High
**Milestone approval:** None needed -- follow existing pattern

### Context
The TDI Learning Hub launched June 1. We have already imported:
- 432 existing Thinkific users (all_access memberships)
- 2,171 Thinkific leads (free accounts)
- 565 engaged US free Substack subscribers (free accounts)
- 31 paid Substack subscribers (essentials/professional/all_access memberships)

Remaining: ~46,000 engaged international free Substack subscribers who opened at least 1 email in the last 6 months. These are real readers who should have free Hub accounts.

### Source data
- CSV: /Users/raehughart/Downloads/subscriber-export-2026-06-01-19-33-53.csv
- Columns: Email (0), Name (1), Country (38), Emails opened 6mo (10), Type (41)

### Filter criteria
- Type = "Free"
- Country != "US" (US already imported)
- Emails opened (6mo) >= 1
- Valid email (contains @, valid domain)
- Deduplicate against existing hub_profiles by email (case-insensitive)

### Technical implementation
Use the Hub Supabase client. Env vars:
- NEXT_PUBLIC_LEARNING_HUB_SUPABASE_URL
- LEARNING_HUB_SUPABASE_SERVICE_KEY

For each subscriber:
```javascript
// Create auth user
const { data: authUser } = await sb.auth.admin.createUser({
  email: email,
  email_confirm: true,
  user_metadata: { display_name: name, source: 'substack_free' },
});

// Create hub profile (no membership row = free tier)
await sb.from('hub_profiles').insert({
  id: authUser.user.id,
  email: email,
  display_name: name,
  onboarding_completed: false,
  role: 'classroom_teacher',
});
```

### Rate limiting
- 2 accounts per second maximum (avoid Supabase rate limits)
- Process in sequential batches, not parallel
- Expected runtime: ~6 hours for ~46K accounts
- Run as background script, log progress every 500 accounts

### Verification
After completion, run:
```sql
SELECT COUNT(*) FROM hub_profiles;
```
Expected total: ~49,000+

Post the following on this task when done:
- Total accounts created
- Total errors/skipped
- Total hub_profiles count
- Any email domains that had high error rates

---

## TASK 2: Draft "Your Hub Account is Ready" Email for Substack Free Subscribers
**Assignee:** Holly Scott
**Due:** June 3, 2026 (Tuesday EOD)
**Priority:** High
**Milestone approval:** Rae must approve copy before any emails are sent

### Context
After Task 1 completes, approximately 47,000 Substack subscribers will have new free Hub accounts. They do not know these accounts exist yet. We need to send a one-time notification email telling them their account is ready and inviting them to log in.

This is NOT a marketing blast. It is a warm, personal note from the TDI community letting people know we built something for them.

### Audience
All Substack subscribers imported to the Hub as free accounts. This includes:
- 565 engaged US free subscribers (imported June 1)
- ~46,000 engaged international free subscribers (imported by Task 1)
- 2,171 Thinkific leads (imported June 1)

Exclude:
- Anyone with an all_access or essentials/professional membership (district partners, paid subscribers) -- they get separate communication
- Team emails (@teachersdeserveit.com)

### Email specifications
- From: Teachers Deserve It <noreply@teachersdeserveit.com>
- Subject: Draft 2-3 options for Rae to choose from. Direction: warm, community-focused, not salesy. Examples:
  - "We built something for you"
  - "Something new from the TDI community"
  - "Your free toolkit is ready"

### Body copy guidelines
- Rae's voice. Always "we" and "our" -- never "I" unless quoting Rae directly
- Frame around the TDI Movement and community, not a product launch
- Short -- 4-5 sentences max. These are busy educators
- One clear CTA: visit teachersdeserveit.com/hub
- Mention it is free, no credit card, no commitment
- Do NOT mention Substack, tiers, or upgrading. This is just "your account is ready"
- No emojis. No em dashes (use " -- " instead). No bullet lists in the email body.
- Include "-- The TDI Team" sign-off

### Deliverable
Post draft on this task with 2-3 subject line options and the body copy. Tag Rae for approval. Do not proceed to Task 3 until Rae approves.

---

## TASK 3: Send "Your Hub Account is Ready" Email to All Imported Subscribers
**Assignee:** Engineering agent (Izzy Reeves or Chris Copypaste)
**Due:** June 5, 2026 (Thursday EOD)
**Priority:** High
**Milestone approval:** None -- email copy will be pre-approved by Rae in Task 2
**Depends on:** Task 1 (import complete) + Task 2 (copy approved by Rae)

### Context
Send the approved email from Task 2 to all imported free Hub accounts.

### Technical implementation
Send via Resend API.
- API key name: "Hub Launch" (or use RESEND_API_KEY from Vercel)
- From: Teachers Deserve It <noreply@teachersdeserveit.com>
- Rate: 2 emails per second (Resend rate limit on current plan)
- Expected send time: ~6.5 hours for ~49K emails
- Run as background script

### Recipient list
Query hub_profiles for all free accounts (no hub_membership row OR hub_membership with tier = 'free'):
```javascript
// Get all profile IDs that have a membership
const { data: members } = await sb.from('hub_memberships').select('user_id');
const memberIds = new Set(members.map(m => m.user_id));

// Get all profiles WITHOUT a membership = free users
const { data: freeProfiles } = await sb.from('hub_profiles').select('id, email, display_name');
const recipients = freeProfiles.filter(p => !memberIds.has(p.id) && p.email);
```

Also exclude:
- @teachersdeserveit.com emails
- Any email that already received the June 1 launch email (check hub_activity_log for 'launch_email_sent' if tracked, otherwise skip this check)

### Error handling
- If Resend returns a rate limit error, wait 2 seconds and retry
- Log failed emails to a file for manual retry
- Do not retry more than 3 times per email

### Deliverable
Post the following on this task when done:
- Total emails sent
- Total failed
- Any notable patterns in failures (bad domains, bounces)
- Screenshot of Resend dashboard showing delivery stats

---

## TASK 4: Build Automated Substack-to-Hub Account Sync
**Assignee:** Engineering agent (Chris Copypaste)
**Due:** June 6, 2026 (Friday EOD)
**Priority:** Medium
**Milestone approval:** Rae approves the approach before implementation

### Context
Going forward, new Substack subscribers should automatically get Hub accounts. This task creates a recurring sync so we do not have to manually import CSVs.

### Recommended approach: Weekly sync script
Run every Monday at 6am CT as a scheduled job (cron or Paperclip routine):

1. Export Substack subscribers (manual CSV or API if available)
2. Compare emails against hub_profiles
3. For new free subscribers: create free Hub account
4. For new paid subscribers: create Hub account + essentials membership
5. For canceled paid subscribers: delete hub_membership row (reverts to free)
6. Log results to hub_activity_log

### Decision needed from Rae
Before building, post the following on this task for Rae's approval:
- Recommended approach (weekly sync vs real-time webhook)
- How to handle the Substack CSV export (manual vs automated)
- Whether canceled Substack paid subscribers should keep Essentials access for a grace period or immediately revert to free

Tag Rae and wait for approval before implementing.

### Deliverable
Working automation deployed, tested with a small batch, and confirmed functional. Post confirmation on this task.

---

## TIMELINE SUMMARY

| Date | Task | Owner | Rae Approval Needed? |
|------|------|-------|----------------------|
| June 3 (Tue) EOD | Task 1: International subscriber import complete | Engineering | No |
| June 3 (Tue) EOD | Task 2: Email copy drafted and posted | Holly | YES -- must approve before send |
| June 5 (Thu) EOD | Task 3: Email sent to all imported subscribers | Engineering | No (pre-approved in Task 2) |
| June 5 (Thu) | Task 4: Sync approach posted for approval | Engineering | YES -- must approve approach |
| June 6 (Fri) EOD | Task 4: Auto-sync deployed | Engineering | No (pre-approved) |

---

## IMPORTANT CONTEXT FOR ALL TASKS

- The Hub is LIVE at https://www.teachersdeserveit.com/hub
- Free Hub accounts need no membership row in the database. No row = free tier.
- Free users see 7 rotating Quick Wins. Essentials users see the full Quick Wins library. Professional and All-Access see everything.
- All email copy must use Rae's voice: "we" language, TDI Movement framing, warm but direct, no corporate speak, no emojis, no em dashes (use " -- ")
- Resend sends from noreply@teachersdeserveit.com. Holly drafts copy, Olivia coordinates timing, engineering handles bulk sends.
- DO NOT update anything on Substack itself (page copy, tiers, welcome emails, Vault references). Rae will handle those changes separately.
- All email copy requires Rae's approval before sending. No exceptions.
