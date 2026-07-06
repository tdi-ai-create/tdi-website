# Paperclip Skill: Send Email to Rae via TDI API

## When to Use
- You need to email Rae (rae@teachersdeserveit.com) any report, draft, or content
- The n8n email system is unavailable
- You have content ready to deliver

## Endpoint
```
POST https://www.teachersdeserveit.com/api/paperclip/send-report
```

## Auth
```
Authorization: Bearer ${PAPERCLIP_SYNC_KEY}
```

## Request Body
```json
{
  "subject": "Social Engagement Drafts - July 7, 2026",
  "content": "Plain text or markdown content here. The API converts it to styled HTML automatically."
}
```

## Example cURL
```bash
curl -X POST "https://www.teachersdeserveit.com/api/paperclip/send-report" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${PAPERCLIP_SYNC_KEY}" \
  -d '{"subject": "Social Engagement Drafts - July 7, 2026", "content": "LINKEDIN (https://linkedin.com/feed)\n\nProfile: https://linkedin.com/in/example\nTopic: Post about teacher retention\nComment: This is exactly why I started TDI. What does retention look like in your district this year?\n\n..."}'
```

## Response
```json
{"success": true, "emailId": "abc123"}
```

## Rules
- Always use this endpoint instead of n8n for email delivery
- Subject line format: "Social Engagement Drafts - [date]" or "Weekly Reel Scripts - [date]" etc.
- Content should be plain text -- the API handles HTML formatting
- Email sends from: Olivia Smith - TDI <noreply@teachersdeserveit.com>
- Email delivers to: rae@teachersdeserveit.com
- Do NOT include markdown formatting (no ** bold **, no # headers) in the content body for social drafts -- keep it plain text and machine-readable
