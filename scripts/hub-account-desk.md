# Hub account desk

Fixing a Hub login while the person is still in the room.

All commands run from the repo root and talk to the Learning Hub project
directly. Read commands are safe to run any time.

```
node scripts/hub-account-desk.mjs look <email or fragment>
node scripts/hub-account-desk.mjs roster glen-ellyn-d41
node scripts/hub-account-desk.mjs seat <email>
node scripts/hub-account-desk.mjs password <email> --yes
node scripts/hub-account-desk.mjs create <email> --first <f> --last <l> --seat
node scripts/hub-account-desk.mjs fixemail <old> <new> --yes
node scripts/hub-account-desk.mjs selftest
```

## Start here, always

`look <name fragment>` before doing anything. It prints the auth record, the
seat, the partnership link and the activity, then says in plain words what is
wrong and which command fixes it. Most "I cannot log in" reports at Glen Ellyn
will turn out to be a first-ever login, not a broken account.

## The four things that actually happen

**"I log in but I do not see the courses."** They are on the free tier. Sign-in
is fine; the Hub is just showing them the free shelf. `seat <email>`, then have
them refresh. Six Glen Ellyn people are in this state right now.

**"It will not let me in."** Ask them to use *Forgot password* on
teachersdeserveit.com/hub/login first, since that needs nothing from us. If they
cannot receive mail or you need it solved on the spot, `password <email> --yes`
prints a password you can read out loud and proves it works by signing in with
it before it shows you. Tell them to change it after.

**"I am not in the system at all."** `create <email> --first <f> --last <l>
--seat`. Never add the account with SQL. A row written that way looks perfect in
the table and fails every sign-in path silently, which is what locked Hillary
Russell out for three weeks in August.

**"My email is wrong on the list."** `fixemail <old> <new> --yes`. It refuses if
the new address already has an account, because that is two people or two
accounts, not a rename, and the seat has to be moved deliberately.

## Two traps

**Do not grant seats through the admin portal.**
`/api/admin/hub-memberships` resolves its client from `NEXT_PUBLIC_SUPABASE_URL`,
which is the Creator Portal, whose copy of `hub_memberships` holds one row. It
returns success and changes nothing on the Hub. Use `seat` here instead.

**A seat has two halves.** `hub_memberships` decides what they can open;
`hub_profiles.partnership_id` decides whether they show up in the school's
reports. `seat` writes both. Granting only the first gives you a person with
access who is invisible on the dashboard.

## Seat count

Glen Ellyn is contracted for 10 and holds 9 live seats, so there is one spare.
Six more people are attached to the school on the free tier. Putting all six on
paid seats takes them to 15 against 10 contracted. That is Rae's call, the same
shape as the St. Peter Chanel write-off, not something to do quietly.
