# Paperclip Skill: TDI Funding Sync API

## Purpose

This skill enables Paperclip AI agents to read and write funding data (grant pursuits, opportunities, action items, timelines, draft emails) for TDI partner schools via the Funding Sync API.

## Base Configuration

- **Endpoint:** `https://www.teachersdeserveit.com/api/funding/sync`
- **Auth:** `Authorization: Bearer ${PAPERCLIP_SYNC_KEY}`
- **Content-Type:** `application/json` (POST requests)

---

## When to Use This API

Invoke this API when any of the following conditions are true:

1. You discover a new grant opportunity relevant to a TDI partner school.
2. You draft or update a grant narrative for an opportunity.
3. You complete an action item or need to create/assign one.
4. Something notable happens that should be logged to the pursuit timeline.
5. You need to look up existing funding work for a school.
6. You need to draft an email for human review (deadline reminder, follow-up, etc.).

---

## GET Endpoints (Read)

All GET requests use query parameters. No request body.

### 1. Find Pursuit by School Name

Fuzzy-searches pursuits by school name. Use this FIRST before any write operation to obtain the `pursuitId`.

```
GET /api/funding/sync?action=find_pursuit&school=SchoolName
```

```bash
curl -s -X GET \
  "https://www.teachersdeserveit.com/api/funding/sync?action=find_pursuit&school=Lincoln%20Elementary" \
  -H "Authorization: Bearer ${PAPERCLIP_SYNC_KEY}"
```

**Response:** Array of matching pursuits with `id`, `schoolName`, and summary fields. Use the `id` value as `pursuitId` in subsequent calls.

### 2. Get Full Pursuit

Returns the complete pursuit record including all opportunities, action items, and timeline events.

```
GET /api/funding/sync?action=get_pursuit&pursuitId=UUID
```

```bash
curl -s -X GET \
  "https://www.teachersdeserveit.com/api/funding/sync?action=get_pursuit&pursuitId=abc123-def456" \
  -H "Authorization: Bearer ${PAPERCLIP_SYNC_KEY}"
```

**Response:** Full pursuit object with nested `opportunities`, `actions`, and `timeline` arrays.

### 3. Get Status Overview

Returns a summary of all pursuits, active opportunities, and open action items across the entire portfolio.

```
GET /api/funding/sync?action=get_status
```

```bash
curl -s -X GET \
  "https://www.teachersdeserveit.com/api/funding/sync?action=get_status" \
  -H "Authorization: Bearer ${PAPERCLIP_SYNC_KEY}"
```

**Response:** Aggregated status with counts and lists of active items.

### 4. Find Actionable Work

Returns ONLY items that need agent work right now — filtered by request type and window status. Use this to discover what to work on next.

```
GET /api/funding/sync?action=find_work
GET /api/funding/sync?action=find_work&agent=elena
```

```bash
curl -s -X GET \
  "https://www.teachersdeserveit.com/api/funding/sync?action=find_work&agent=elena" \
  -H "Authorization: Bearer ${PAPERCLIP_SYNC_KEY}"
```

**Parameters:**

| Param | Required | Description |
|---|---|---|
| `agent` | no | Filter by `assigned_agent` on the opportunity. Omit to see all work. |

**Response:**

```json
{
  "work": [
    {
      "request_type": "draft_narrative",
      "id": "opp-uuid",
      "pursuit_id": "pursuit-uuid",
      "name": "Title II-A ESSA",
      "plan_category": "A",
      "amount": 50000,
      "narrative_status": "requested",
      "narrative_url": null,
      "assigned_agent": "elena",
      "window_status": "open",
      "window_opens": "2026-01-15",
      "window_closes": "2026-09-30",
      "application_opens": "2026-01-15",
      "application_closes": "2026-06-01",
      "contact_name": "Dr. Martinez",
      "contact_email": "martinez@lincoln.edu",
      "waiting_on": "tdi",
      "pursuit": {
        "id": "pursuit-uuid",
        "pursuit_name": "Lincoln Elementary - Grant Funded Funding",
        "district_name": "Lincoln Elementary",
        "client_contact_name": "Dr. Martinez"
      }
    },
    {
      "request_type": "research_funders",
      "id": "opp-uuid-2",
      "pursuit_id": "pursuit-uuid",
      "name": "Local foundation research",
      "plan_category": "D",
      "amount": null,
      "research_status": "requested",
      "assigned_agent": "elena",
      "window_status": "unknown",
      "contact_name": null,
      "pursuit": {
        "id": "pursuit-uuid",
        "pursuit_name": "Lincoln Elementary - Grant Funded Funding",
        "district_name": "Lincoln Elementary"
      }
    }
  ],
  "count": 2,
  "filters": {
    "agent": "elena",
    "draft_narrative_count": 1,
    "research_funders_count": 1
  }
}
```

**Work types returned:**

| `request_type` | Source filter | Window-gated? | What the agent should do |
|---|---|---|---|
| `draft_narrative` | `narrative_status = 'requested'` | YES — `window_status = 'open'` AND `gate_open = true` | Draft or update the grant narrative for this opportunity |
| `research_funders` | `research_status = 'requested'` | NO — research finds new paths | Research available funding sources for this pursuit |

**Window gate rule:** `draft_narrative` work is only returned when `window_status = 'open'`. Agents should not draft narratives for paths whose funding window is unknown or closed — that work would be wasted. Research work (`research_funders`) is exempt because research is how we discover and verify open paths.

**Alignment gate rule:** `draft_narrative` work also requires the pursuit's `gate_open = true` (all 5 conditions met: submitter named, backup named, admin sponsor named, both contracts signed). An opportunity whose pursuit hasn't satisfied the alignment gate will not appear in draft work — even if its window is open. This ensures agents don't draft for pursuits where the submission path isn't confirmed. Research work is exempt from the gate.

---

## POST Endpoints (Write)

All POST requests send a JSON body. Every body MUST include an `"action"` field.

### 1. Create Opportunity

Adds a new grant opportunity to a pursuit.

| Field | Required | Description |
|---|---|---|
| `pursuitId` | YES | UUID of the parent pursuit |
| `name` | YES | Name of the grant/opportunity |
| `amount` | no | Dollar amount (number) |
| `planCategory` | no | One of: `A`, `B`, `C`, `D` |
| `status` | no | Opportunity status string |
| `contactName` | no | Grant contact person |
| `contactEmail` | no | Grant contact email |
| `applicationOpens` | no | ISO date string |
| `applicationCloses` | no | ISO date string |
| `waitingOn` | no | What/who the opportunity is waiting on |
| `narrativeStatus` | no | One of: `drafting`, `review`, `ready` |
| `notes` | no | Free-text notes |

```bash
curl -s -X POST \
  "https://www.teachersdeserveit.com/api/funding/sync" \
  -H "Authorization: Bearer ${PAPERCLIP_SYNC_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "create_opportunity",
    "pursuitId": "abc123-def456",
    "name": "Title IV-A Innovation Grant",
    "amount": 50000,
    "planCategory": "B",
    "applicationCloses": "2026-09-15",
    "notes": "Discovered via federal grants database"
  }'
```

**Important:** The API returns `409 Conflict` if an opportunity with the same name already exists on that pursuit. Always check existing opportunities via `get_pursuit` before creating.

### 2. Update Opportunity

Updates fields on an existing opportunity.

| Field | Required | Description |
|---|---|---|
| `opportunityId` | YES | UUID of the opportunity to update |
| _(any field from create_opportunity)_ | no | Fields to update |

```bash
curl -s -X POST \
  "https://www.teachersdeserveit.com/api/funding/sync" \
  -H "Authorization: Bearer ${PAPERCLIP_SYNC_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "update_opportunity",
    "opportunityId": "opp-789-xyz",
    "status": "submitted",
    "waitingOn": "District review board"
  }'
```

### 3. Update Narrative

Shortcut for updating narrative-specific fields on an opportunity. Agents can now push the actual narrative text (`narrativeContent`) for inline reading in the portal, in addition to or instead of an external URL.

| Field | Required | Description |
|---|---|---|
| `opportunityId` | YES | UUID of the opportunity |
| `narrativeStatus` | no | One of: `drafting`, `review`, `qa_review`, `ready` |
| `narrativeUrl` | no | URL to the narrative document (external link) |
| `narrativeContent` | no | Full narrative text for inline portal reading |
| `note` | no | Note about the narrative update (logged to timeline) |

**Narrative lifecycle:** `not_started` → `requested` → `drafting` → `review` → `qa_review` → `ready`. Agents set status up to `review`. QA reviewers pass/fail during `qa_review`. Only humans approve to `ready`. Agents must NEVER set `qa_review` or `ready`.

```bash
curl -s -X POST \
  "https://www.teachersdeserveit.com/api/funding/sync" \
  -H "Authorization: Bearer ${PAPERCLIP_SYNC_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "update_narrative",
    "opportunityId": "opp-789-xyz",
    "narrativeStatus": "review",
    "narrativeUrl": "https://docs.google.com/document/d/abc123",
    "narrativeContent": "Teachers Deserve It delivers a multi-phase...",
    "note": "First draft complete. Ready for QA review."
  }'
```

### 4. Create Action Item

Creates a task assigned to TDI staff or a client contact.

| Field | Required | Description |
|---|---|---|
| `pursuitId` | YES | UUID of the parent pursuit |
| `title` | YES | Short description of the action |
| `opportunityId` | no | UUID linking to a specific opportunity |
| `ownerType` | no | `tdi` or `client` |
| `ownerEmail` | no | Email of the assigned person |
| `ownerName` | no | Name of the assigned person |
| `dueDate` | no | ISO date string |
| `category` | no | One of: `research`, `writing`, `submission`, `follow_up`, `approval`, `documentation` |
| `description` | no | Detailed description |
| `preparedMaterials` | no | Description of materials prepared |
| `preparedDocumentUrl` | no | URL to prepared document |

```bash
curl -s -X POST \
  "https://www.teachersdeserveit.com/api/funding/sync" \
  -H "Authorization: Bearer ${PAPERCLIP_SYNC_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "create_action",
    "pursuitId": "abc123-def456",
    "title": "Gather enrollment data for Title IV-A narrative",
    "opportunityId": "opp-789-xyz",
    "ownerType": "client",
    "ownerName": "Dr. Martinez",
    "ownerEmail": "martinez@lincoln.edu",
    "dueDate": "2026-07-15",
    "category": "research",
    "description": "Need 3 years of enrollment data and demographic breakdown for the narrative."
  }'
```

### 5. Update Action Item

Updates the status or details of an existing action item.

| Field | Required | Description |
|---|---|---|
| `actionId` | YES | UUID of the action item |
| `status` | no | One of: `pending`, `in_progress`, `done`, `blocked`, `skipped` |
| `completedBy` | no | Name/email of who completed it |
| `note` | no | Note about the status change |

```bash
curl -s -X POST \
  "https://www.teachersdeserveit.com/api/funding/sync" \
  -H "Authorization: Bearer ${PAPERCLIP_SYNC_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "update_action",
    "actionId": "act-456-abc",
    "status": "done",
    "completedBy": "paperclip-agent",
    "note": "Data compiled from public records. Document linked in opportunity."
  }'
```

### 6. Add Timeline Event

Logs a milestone or notable event to the pursuit timeline.

| Field | Required | Description |
|---|---|---|
| `pursuitId` | YES | UUID of the pursuit |
| `title` | YES | Short event description |
| `detail` | no | Longer description |
| `eventStatus` | no | One of: `complete`, `active`, `upcoming` |

```bash
curl -s -X POST \
  "https://www.teachersdeserveit.com/api/funding/sync" \
  -H "Authorization: Bearer ${PAPERCLIP_SYNC_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "add_timeline_event",
    "pursuitId": "abc123-def456",
    "title": "Title IV-A narrative submitted",
    "detail": "Submitted via grants.gov portal. Confirmation #GR-2026-4421.",
    "eventStatus": "complete"
  }'
```

### 7. Draft Email

Creates an email draft for human review. Agents MUST NOT send emails directly -- this creates a draft that Rae or Bella will review and send.

| Field | Required | Description |
|---|---|---|
| `pursuitId` | YES | UUID of the pursuit |
| `subject` | YES | Email subject line |
| `emailBody` | YES | Full email body text |
| `toEmail` | YES | Recipient email address |
| `opportunityId` | no | UUID linking to a specific opportunity |
| `toName` | no | Recipient name |
| `emailType` | no | One of: `nudge`, `submission_instructions`, `deadline_reminder`, `status_update`, `follow_up`, `custom` |

```bash
curl -s -X POST \
  "https://www.teachersdeserveit.com/api/funding/sync" \
  -H "Authorization: Bearer ${PAPERCLIP_SYNC_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "draft_email",
    "pursuitId": "abc123-def456",
    "opportunityId": "opp-789-xyz",
    "subject": "Reminder: Title IV-A Application Deadline Sept 15",
    "emailBody": "Hi Dr. Martinez,\n\nThis is a reminder that the Title IV-A Innovation Grant application closes on September 15, 2026. We have the narrative ready and just need the signed superintendent approval form to complete the submission.\n\nPlease let us know if you need anything from our team.\n\nBest,\nTDI Team",
    "toEmail": "martinez@lincoln.edu",
    "toName": "Dr. Martinez",
    "emailType": "deadline_reminder"
  }'
```

---

## Agent Rules

Follow these rules strictly when using this API:

1. **Always look up first.** Call `find_pursuit` to get the `pursuitId` before making any write calls. Never guess or hardcode pursuit IDs.

2. **Check before creating.** Before `create_opportunity`, call `get_pursuit` and verify no opportunity with the same name exists. The API returns `409` on duplicates, but checking first avoids unnecessary errors.

3. **Narrative status permissions.**
   - Agents may set `narrativeStatus` to `drafting` (when starting work) or `review` (when draft is complete).
   - Only humans (Rae or Bella) may set `narrativeStatus` to `ready`. Never set this value as an agent.

4. **Default TDI action owner.** When creating action items with `ownerType: "tdi"` and no specific owner, default to:
   - `ownerName`: `"Bella"`
   - `ownerEmail`: `"hello@teachersdeserveit.com"`

5. **Log timeline events.** Always add a timeline event for significant milestones: opportunity discovered, narrative drafted, application submitted, funding awarded/denied, deadlines passed.

6. **Draft emails only.** Use `draft_email` to create emails for human review. Agents must NEVER send emails directly to external contacts. All outbound communication goes through Rae or Bella.

7. **Error handling.** If any API call returns an error, log the error details and do not retry more than once. Report the failure to the task context so a human can investigate.

---

## Standard Workflow

A typical agent workflow for a new grant discovery:

```
1. find_pursuit(school="Lincoln Elementary")       -> get pursuitId
2. get_pursuit(pursuitId)                          -> check existing opportunities
3. create_opportunity(pursuitId, name, amount, ...) -> add the new opportunity
4. add_timeline_event(pursuitId, "New opportunity discovered: ...")
5. create_action(pursuitId, title="Research eligibility requirements", category="research")
6. create_action(pursuitId, title="Draft narrative", category="writing")
```

A typical workflow for completing a narrative:

```
1. find_pursuit(school="Lincoln Elementary")       -> get pursuitId
2. get_pursuit(pursuitId)                          -> get opportunityId
3. update_narrative(opportunityId, narrativeStatus="drafting")
4. [... agent drafts the narrative ...]
5. update_narrative(opportunityId, narrativeStatus="review", narrativeUrl="...")
6. add_timeline_event(pursuitId, "Narrative drafted for [grant name]")
7. create_action(pursuitId, title="Review narrative draft", ownerType="tdi")
8. draft_email(pursuitId, subject="Narrative ready for review", ...)
```
