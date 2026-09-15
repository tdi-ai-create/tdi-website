# TDI Content Calendar, a Paperclip plugin

The approval surface for the content queue. Lives inside Paperclip, at
`/TEA/content-calendar`, reachable from a Content calendar entry in the left
sidebar.

It shows every channel by month, reads the full draft, renders Instagram
carousels as actual slides, and lets Rae or Kristin approve, send back with a
reason, set a date, move a date, plan a month as empty slots, and name what good
looks like for a channel.

It is **not** built from this repo's toolchain. It has its own `package.json`,
its own TypeScript config and its own tests, and it is excluded from the
website's `tsconfig.json` and from knip. Running `npm run typecheck` at the repo
root will not compile it, on purpose: it imports `@paperclipai/plugin-sdk`,
which is not a dependency of the website.

## Where the pieces live

| Thing | Where |
|---|---|
| Source | here |
| Built bundle | `/paperclip/plugins/tdi-content-calendar` on the Railway volume |
| Queue API it talks to | `app/api/content-queue` and `app/api/content-queue/plan` in this repo |
| Its key | `plugin_config.config_json.calendarKey` in Paperclip's own database |

## Working on it

```
cd paperclip-plugins/tdi-content-calendar
npm install
npm test          # vitest, no network
npx tsc --noEmit  # check the exit code, not the output
npm run build     # writes dist/
```

## Shipping a change

Ship any API change **first**, so a new button never appears before the endpoint
will accept it.

1. Bump the version in **both** `package.json` and `src/manifest.ts`. They have
   to match, and the version is what tells the host something changed.
2. `npm run build`.
3. Copy `dist/` and `package.json` onto the Railway volume at
   `/paperclip/plugins/tdi-content-calendar`. Check the checksums on both sides
   before you touch the running plugin.
4. In Paperclip, go to Settings, Instance settings, Plugins, and press
   **Disable**, wait for it to actually say disabled, then **Enable**. Enabling
   re-reads the manifest and the bundle from disk and bumps the recorded version.

Do not rush step 4. Clicking disable and enable quickly enough that they overlap
leaves the plugin enabled on the old bundle and the version unchanged, which
looks exactly like a deploy that worked.

## Never uninstall it

`plugin_config.plugin_id` is `ON DELETE CASCADE`. Uninstalling deletes the
plugins row and takes the calendar key with it, and the Plugin Manager cannot
create a fresh config row on this Paperclip build because `setConfig`'s insert
omits `company_id`, which is `NOT NULL`. Recovering means seeding a row directly
in the database before the settings form will save anything.

Disable and enable does none of that. It is the only redeploy path.

## Who it lets decide

Approving is recorded under the person the **host** says is signed in, never
under anything the page claims. `APPROVER_BY_USER_ID` in `src/worker.ts` maps
Paperclip user ids to queue actor names, and anyone not in it can read the
calendar and change nothing. The legacy admin account is deliberately absent.

## What it deliberately cannot do

Place briefs, pass gates, publish, verify, or fill a slot. The calendar key is
restricted to `approve`, `request_changes` and `schedule` on the queue, and to
planning actions on `/plan`. Filling a slot is the pipeline saying "this brief is
the work for that intention", which is an agent's step, not a person's.

Publishing is absent by Rae's decision: the queue never writes to Buffer,
because a post written into Buffer goes out on its own, and that is publishing
without anyone pressing anything.
