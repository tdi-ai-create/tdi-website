# TDI Creator Portal Database Schema

> **Source of Truth Document**
> Version: 2.1.0
> Last Updated: March 2026
> Database: PostgreSQL (Supabase)
> **UPDATE THIS DOCUMENT WHENEVER DATABASE CHANGES ARE MADE**

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | January 26, 2026 | Initial schema created |
| 2.0.0 | February 2026 | Creator Studio enhancements - stalled flow columns, content path columns |
| 2.1.0 | March 2026 | Migration 013 - publication dates, stalled flow redesign, target timeline tables, Rachel admin access |

---

## Overview

This database powers the TDI Creator Portal and Creator Studio admin (`/tdi-admin/creators`). It manages content creators who develop professional development courses, blogs, and downloads for Teachers Deserve It. The system tracks creators through a milestone-based journey from onboarding through content launch.

**Content Paths:**
- `course` - Full course (27 milestones across 6 phases)
- `blog` - Blog post (4 milestones)
- `download` - Downloadable resource (4 milestones)

---

## Entity Relationship Diagram

```
┌─────────────┐       ┌─────────────┐       ┌──────────────────────┐
│   phases    │───<───│  milestones │───<───│  creator_milestones  │
└─────────────┘       └─────────────┘       └──────────────────────┘
                                                       │
┌─────────────┐       ┌─────────────┐                 │
│ admin_users │       │  creators   │─────────────────┘
└─────────────┘       └─────────────┘
                             │
              ┌──────────────┼──────────────────────┐
              │              │                      │
     ┌────────────────┐  ┌───────────────────┐  ┌──────────────────────┐
     │ creator_notes  │  │creator_target_date│  │ creator_reminder_log │
     └────────────────┘  │    _history       │  └──────────────────────┘
                         └───────────────────┘
```

---

## Table Definitions

---

### 1. `phases`

**Purpose:** Defines the major stages of the creator journey.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `text` | PRIMARY KEY | Human-readable ID (e.g., 'onboarding', 'production') |
| `name` | `text` | NOT NULL | Display name |
| `description` | `text` | nullable | What happens in this phase |
| `sort_order` | `integer` | NOT NULL | Display order (1, 2, 3...) |

**Phase Values (Course path - 6 phases):**
- `onboarding`
- `agreement`
- `prep_resources`
- `production`
- `launch`

---

### 2. `milestones`

**Purpose:** Individual tasks/checkpoints within each phase.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `text` | PRIMARY KEY | Human-readable ID |
| `phase_id` | `text` | FK → phases(id) | Parent phase |
| `name` | `text` | NOT NULL | Display name |
| `description` | `text` | nullable | Instructions |
| `requires_team_action` | `boolean` | DEFAULT false | TDI team must approve |
| `sort_order` | `integer` | NOT NULL | Order within phase |
| `calendly_link` | `text` | nullable | Scheduling link if needed |
| `action_type` | `text` | nullable | 'link', 'upload', 'calendly', 'checkbox', 'form' |
| `action_config` | `jsonb` | nullable | Configuration for the action |

---

### 3. `creators`

**Purpose:** All content creator profiles, course info, and status tracking.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier |
| `name` | `text` | NOT NULL | Creator full name |
| `email` | `text` | NOT NULL, UNIQUE | Login email |
| `content_path` | `text` | nullable | 'course', 'blog', 'download', or null |
| `current_phase` | `text` | FK → phases(id), nullable | Current phase ID |
| `status` | `text` | DEFAULT 'active' | See Status Values below |
| `course_title` | `text` | nullable | Working title of content |
| `course_description` | `text` | nullable | Content description |
| `target_audience` | `text` | nullable | Who the content is for |
| `application_date` | `timestamptz` | nullable | When they applied |
| `created_at` | `timestamptz` | DEFAULT now() | Record creation |
| `updated_at` | `timestamptz` | DEFAULT now() | Last update |
| `last_active_at` | `timestamptz` | nullable | Last portal login or milestone action |
| `magic_link_token` | `text` | nullable | Auth token for magic link login |
| `magic_link_expires_at` | `timestamptz` | nullable | Token expiry |

**[Migration 013 - March 2026] Publication Date Columns:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `blog_publish_date` | `date` | nullable | Date blog content published |
| `blog_publish_overview` | `text` | nullable | 1-2 sentence description of published blog |
| `course_publish_date` | `date` | nullable | Date course published |
| `course_publish_overview` | `text` | nullable | 1-2 sentence description of published course |
| `download_publish_date` | `date` | nullable | Date download published (Download path only) |
| `download_publish_overview` | `text` | nullable | 1-2 sentence description of published download |

**[Migration 013 - March 2026] Stalled Flow Columns:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `last_followed_up_at` | `timestamptz` | nullable | When TDI last followed up |
| `followed_up_by` | `text` | nullable | Email of admin who marked as followed up |

**[Migration 013 - March 2026] Target Timeline Columns:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `target_completion_date` | `date` | nullable | Creator's self-set launch goal date |
| `target_date_set_at` | `timestamptz` | nullable | When the target date was most recently set |
| `target_date_set_by` | `text` | nullable | Email of who set the date (creator or TDI admin) |

**Status Values:**
- `active` - Currently working in the portal
- `stalled` - No activity for 14+ days
- `followed_up` - TDI has followed up; re-stalls after 14 more days of inactivity
- `launched` - Content is live
- `paused` - Temporarily on hold
- `inactive` - No longer participating

**Stalled Flow Logic:**
1. Creator has no activity for 14 days → status becomes `stalled`
2. Admin clicks "Mark as Followed Up" → status becomes `followed_up`, logs `last_followed_up_at` and `followed_up_by`
3. If 14 more days pass with no activity → status returns to `stalled`
4. If creator completes a milestone while in `followed_up` → status returns to `active`

**Publication Date Display Rules (by content_path):**
- `course` path: show `course_publish_date` + `blog_publish_date` fields
- `blog` path: show `blog_publish_date` only
- `download` path: show `download_publish_date` + `blog_publish_date` fields

---

### 4. `creator_milestones`

**Purpose:** Junction table tracking each creator's progress through milestones.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier |
| `creator_id` | `uuid` | FK → creators(id) ON DELETE CASCADE | Which creator |
| `milestone_id` | `text` | FK → milestones(id) | Which milestone |
| `status` | `text` | DEFAULT 'locked' | locked / available / in_progress / pending_review / completed |
| `completed_at` | `timestamptz` | nullable | When completed |
| `approved_by` | `text` | nullable | Admin who approved |
| `created_at` | `timestamptz` | DEFAULT now() | Record creation |
| `updated_at` | `timestamptz` | DEFAULT now() | Last status change |
| `metadata` | `jsonb` | nullable | Uploaded files, form responses, etc. |

---

### 5. `creator_notes`

**Purpose:** Internal and creator-visible notes, organized by phase.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier |
| `creator_id` | `uuid` | FK → creators(id) ON DELETE CASCADE | Which creator |
| `phase_id` | `text` | FK → phases(id), nullable | Optional phase association |
| `content` | `text` | NOT NULL | Note content |
| `author` | `text` | NOT NULL | Who wrote it (admin email) |
| `visible_to_creator` | `boolean` | DEFAULT true | false = internal team only |
| `created_at` | `timestamptz` | DEFAULT now() | Created timestamp |

---

### 6. `admin_users`

**Purpose:** TDI team members who manage the Creator Studio.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier |
| `email` | `text` | NOT NULL, UNIQUE | Admin email |
| `name` | `text` | NOT NULL | Display name |
| `role` | `text` | DEFAULT 'admin' | 'admin', 'viewer', 'super_admin' |
| `created_at` | `timestamptz` | DEFAULT now() | Account creation |

**Current Admin Users:**
- `rae@teachersdeserveit.com` - Rae Hughart (super_admin)
- `rachel@teachersdeserveit.com` - Rachel Patragas (admin) - added Migration 013

**Role Permissions:**
- `super_admin` - Full access including managing other admins
- `admin` - Full access to all creators and settings, all Creator Studio features
- `viewer` - Read-only access

---

### 7. `creator_target_date_history` [Added Migration 013]

**Purpose:** Audit log of every target completion date change.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier |
| `creator_id` | `uuid` | FK → creators(id) ON DELETE CASCADE | Which creator |
| `target_date` | `date` | NOT NULL | The date that was set |
| `set_at` | `timestamptz` | DEFAULT now() | When it was set |
| `set_by` | `text` | NOT NULL | Email of who set it (creator or admin) |
| `notes` | `text` | nullable | Optional context for why date changed |

---

### 8. `creator_reminder_log` [Added Migration 013]

**Purpose:** Tracks which email reminders have been sent to prevent duplicates.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier |
| `creator_id` | `uuid` | FK → creators(id) ON DELETE CASCADE | Which creator |
| `reminder_type` | `text` | NOT NULL | '60_days', '30_days', '14_days', '7_days', '3_days' |
| `sent_at` | `timestamptz` | DEFAULT now() | When the email was sent |
| `target_date` | `date` | NOT NULL | The target date this reminder was sent for |

**Cron schedule:** Daily at 9am UTC via Vercel cron (`/api/cron/creator-reminders`)

---

## API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/admin/dashboard-data` | GET | Main dashboard stats, stalled/followed_up lists |
| `/api/admin/mark-followed-up` | POST | Move creator from stalled to followed_up |
| `/api/admin/target-date-history` | GET | Fetch date change history for a creator |
| `/api/creator-portal/set-target-date` | POST | Creator or admin sets target completion date |
| `/api/cron/creator-reminders` | GET | Daily cron - sends reminder emails via Resend |

---

## Key Files

| File | Purpose |
|------|---------|
| `types/creator-portal.ts` | TypeScript types for all Creator Portal data |
| `lib/creator-portal-data.ts` | Data fetching functions |
| `app/tdi-admin/creators/page.tsx` | Creator Studio dashboard |
| `app/tdi-admin/creators/[id]/page.tsx` | Creator detail page |
| `app/creator-portal/dashboard/page.tsx` | Creator-facing dashboard |
| `vercel.json` | Cron job configuration |
| `supabase/migrations/013_creator_studio_enhancements.sql` | Migration 013 SQL |

---

## Common Queries

### Get all stalled creators (excluding followed_up)
```sql
SELECT * FROM creators
WHERE status = 'stalled'
ORDER BY last_active_at ASC;
```

### Get creators needing reminders today
```sql
SELECT c.id, c.name, c.email, c.target_completion_date, c.content_path
FROM creators c
WHERE c.target_completion_date IS NOT NULL
  AND c.status != 'launched'
  AND c.target_completion_date >= CURRENT_DATE
  AND (c.target_completion_date - CURRENT_DATE) IN (60, 30, 14, 7, 3);
```

### Check if reminder already sent
```sql
SELECT id FROM creator_reminder_log
WHERE creator_id = $1
  AND reminder_type = $2
  AND target_date = $3
LIMIT 1;
```

---

*This document lives at `/docs/TDI-CREATOR-PORTAL-DATABASE-SCHEMA.md` in the GitHub repo.*
*Update it every time a migration runs. Bump the version. Add a row to Version History.*
*Last updated: March 2026 - Migration 013*
