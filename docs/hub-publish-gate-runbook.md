# Hub publish gate: rollout runbook

The QA gate is built but deliberately switched **off**. It turns on in a specific
order. Turning it on early breaks publishing for everyone, which is exactly what
happened on 2026-08-13 and is why this document exists.

## Current state

| | |
|---|---|
| `hub_config.qa_gate_enforced` | `false` |
| Migrations applied to Learning Hub | 108, 109, 110, 111 |
| Code implementing `mark_reviewed` | committed, **not deployed** |
| Updated Jasmine / Julie Lynn skills | committed, **not on Railway** |

While the flag is `false` the database accepts what the currently deployed code
produces. Publishing works normally. The only always-on behavior is the
status/`is_published` normalization and the tag checks that predate this work.

## Turn-on order

Each step must be verified before the next. Do not batch them.

**1. Merge and deploy the website branch**

`fix/hub-publish-integrity` carries the `mark_reviewed` action, the `qaBlockers`
checklist, the heartbeat check, and alert escalation.

Verify after deploy:

```bash
curl -s -X POST https://www.teachersdeserveit.com/api/hub/content-sync \
  -H "Authorization: Bearer $PAPERCLIP_SYNC_KEY" \
  -H 'Content-Type: application/json' \
  -d '{"action":"mark_reviewed"}'
```

Expect `{"error":"id is required"}`. Anything mentioning `Unknown action` means
the deploy has not landed and you must stop here.

**2. Deploy the agent skills to Railway**

`fix/hub-publish-integrity-skills` updates Jasmine (two PDFs, `generate_tool`)
and Julie Lynn (`mark_reviewed` then `publish`, exact value vocabularies).

Agents must know the new workflow *before* the database starts rejecting the old
one. Confirm the running Paperclip instance has the updated files.

**3. Confirm no unpublished content would be blocked**

```sql
select title, quick_win_type, lift, danielson_domains,
       (file_url is not null) guide, (tool_file_url is not null) tool
from hub_quick_wins
where is_published = false
  and (lift not in ('LOW','MED','HIGH')
       or exists (select 1 from unnest(danielson_domains) d
                  where d not in ('1-planning','2-environment','3-instruction','4-professional'))
       or (quick_win_type = 'download' and tool_file_url is null));
```

Zero rows means the queue is clean. Fix anything returned before proceeding, or
it will jam the moment the flag flips.

**4. Flip the flag**

```sql
update hub_config
set value = 'true', updated_at = now()
where key = 'qa_gate_enforced';
```

**5. Verify both directions**

Publishing an unreviewed item must fail with "QA has not passed". Running
`mark_reviewed` then `publish` must succeed. Test on a real draft, not a probe
row, and confirm `is_published` actually became true rather than trusting a 200.

## Rolling back

One statement, takes effect immediately, no deploy required:

```sql
update hub_config set value = 'false' where key = 'qa_gate_enforced';
```

This is the entire reason the flag exists. If content shipping jams, flip it off,
publish what is stuck, then diagnose without pressure.

## The rule this encodes

**Schema enforcement must never outrun the code that satisfies it.**

A database constraint applies the instant it is created, to every client, with no
deploy and no gradual rollout. Application code reaches production minutes to days
later. Any constraint added ahead of its code is a window where correct callers
fail. Ship the constraint dark, deploy the code, then enable.

The same applies to agent skills. An agent running last week's instructions
against this week's constraints will fail in ways it cannot explain, and those
failures surface as silence rather than as errors anyone reads.
