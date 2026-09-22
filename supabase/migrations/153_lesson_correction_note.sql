-- A place to correct a video we cannot re-record.
--
-- Five course videos tell Hub members that a private Facebook group and weekly
-- office hours are part of their membership. TDI runs neither. The transcripts
-- and quiz questions can be rewritten; Rae's recorded voice cannot.
--
-- Fixing only the text would be worse than leaving it: a member would hear the
-- promise and then take a quiz that pretends it was never made. So the lesson
-- carries a visible correction instead, and points at something that actually
-- exists.
--
-- Nullable and empty by default, so this changes nothing until a note is set.

alter table hub_lessons add column if not exists correction_note text;

comment on column hub_lessons.correction_note is
  'Shown above the video when set. For correcting a claim in a recording that cannot be re-cut. Plain text, no markup.';
