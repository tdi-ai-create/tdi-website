-- SUPERSEDED 23 September 2026 by scripts/whats-inside/score-sections.mjs.
--
-- This file is the first pass and it is kept only as a record of what was done.
-- Do not run it. Its CASE stops at the first matching branch, so the branch
-- ORDER decided everything: a behavior tool carrying one stress tag landed
-- under teacher load, which is how Calm Response Scripts, the most opened tool
-- in the Hub, ended up filed under the reason good teachers leave.
--
-- The replacement scores every section and takes the strongest, refuses to move
-- anything on a tie, and never strips a section a person set by hand.
--
-- First pass assignment of hub_section for /for-schools/whats-inside.
--
-- Run once against the Learning Hub project (asdwpkcsbcnpknklchdq) on
-- 22 September 2026. Kept here so the curation is reviewable, and so a later
-- session can see what was deliberate rather than guessing.
--
-- This is a starting point, not the system. From here on, a person sets the
-- section during QA via content-sync action set_section. Re-running this would
-- overwrite hand corrections, so do not, unless you mean to start over.
--
-- The ordering of the CASE is by specificity, not by the order the sections
-- appear on the page. Para material wins over behavior because a para specific
-- de-escalation guide belongs with paras, not in the general behavior list.

update hub_quick_wins set hub_section = case
  when topic_tags && array['para','paras','para-support','para-teacher-communication','para-schedule','personal-care','caseload-management','sped','special-education'] then 'paras'
  when topic_tags && array['ai-tools','ai-literacy','ai-policy','ai','academic-integrity','digital-citizenship','technology','classroom-technology','device-management','tablets','computers','remote-learning'] then 'ai_technology'
  when topic_tags && array['leadership','school-leadership','coaching','instructional coaching','coaching cycle','observation','instructional-rounds','instructional rounds','walkthrough','plc','staff-meeting','staff-meetings','staff meetings','mentoring','staff-culture','school-improvement','leadership team','facilitation','meeting agenda','retention','morale'] then 'leading'
  when topic_tags && array['family-communication','family communication','parent-communication','parent-conferences','parent conferences','conferences','family-engagement','communication','newsletter','email-templates'] then 'families'
  when topic_tags && array['back-to-school','onboarding','first-week','classroom-setup','room-setup','routines','classroom-routines','daily-routines','orientation','new-teacher','new teacher','new-teacher-support','transitions','procedures','end-of-day-routine','new-student','mid-year-transfer','school-transfer'] then 'first_weeks'
  when topic_tags && array['wellness','self-care','stress-management','stress-relief','burnout','burnout-prevention','time-management','workload','workload-management','boundaries','productivity','time-savers','priorities','efficiency','grading-workflow','sub-plans','substitute-plans','substitute-teacher','testing-season','gratitude','resilience','mindset'] then 'teacher_load'
  when topic_tags && array['classroom-management','behavior','behavior-management','behavior-support','de-escalation','conflict-resolution','restorative-practices','trauma-informed','self-regulation','zones-of-regulation','abc-tracking','peer-mediation','bullying','bullying-prevention','student-shutdown','classroom-environment','classroom-culture','classroom-climate','sel','social-emotional','student-support'] then 'behavior'
  when topic_tags && array['planning','lesson-planning','lesson-design','unit-design','backwards-design','curriculum','pacing','standards-alignment','objectives','mastery-learning','project-based-learning','differentiation','scaffolding','small-group','small-group-instruction','small groups','grouping','stations','rotation','cooperative-learning','direct-instruction','modeling','instructional-strategies','instruction','questioning','discussion','student-talk','student-voice','retrieval-practice','responsive-teaching','student-engagement','engagement','assessment','formative-assessment','formative assessment','formative-checks','exit tickets','progress-monitoring','progress monitoring','data-driven'] then 'instructional_planning'
  else null end
where is_published;

-- Overrides. Tag inference put these in the wrong room.
update hub_quick_wins set hub_section='behavior'
 where is_published and title in ('Behavior Bingo','Behavior Scenario Jenga','The Calm Corner Passport');
update hub_quick_wins set hub_section='instructional_planning'
 where is_published and title in ('The Engagement Relay','Beat the Clock: Transition Challenge','Musical Trust Builders');
update hub_quick_wins set hub_section='families'
 where is_published and title in ('Structured Parent Observation Protocol','Helping Families Navigate the Shift: What to Expect in Middle School');

-- Off the page. Written for people already inside, or too trade specific to
-- represent the library to a district buyer.
update hub_quick_wins set hub_section=null
 where is_published and (
   title in ('Pitch It with Confidence: Recommending TDI to Your Admin',
             'When to Lean on Your TDI Team',
             'Funding PD that Actually Works... with an expert team',
             'Mastery Learning + TDI PD Model (2-Page Explainer)')
   or topic_tags && array['welding','cosmetology','lab-safety','hands-on-lab','chemistry','science-lab','science-fair','CTE','vocational','vocational-education','maker-space','robotics','equipment','equipment-tracking','inventory','cleanup','maintenance','site-supervision','blackboard','chalkboard','whiteboard','construction-paper','chart-paper','sticky-notes','AWS','NIC']
 );

-- Correction, same day. The exclusion above is written around trade and
-- materials tags, and it swallowed the whole Creative Ideas series, which is
-- ordinary low prep teacher content that happens to be tagged by the material
-- it uses: construction paper, chart paper, a whiteboard. The daily health
-- check caught it by naming six items published in the last fortnight with no
-- section, which is exactly the job that check exists to do.
update hub_quick_wins set hub_section='instructional_planning'
 where is_published and hub_section is null and topic_tags && array['creative-ideas-series'];

-- Courses carry exactly one tag each, equal to their category, across only five
-- categories, so the tag tells you almost nothing. Assigned by title instead.
update hub_courses set hub_section = case
  when title ilike 'Calm Classrooms%' or title ilike 'Classroom Management Toolkit%' or title ilike 'De-Escalation Strategies%' then 'behavior'
  when title ilike 'Understanding Student Needs%' or title ilike 'Paraprofessional Foundations%' or title ilike 'Building Strong Teacher-Para%' or title ilike 'From Listening to Helping%' then 'paras'
  when title ilike 'Effective Communication Strategies for Leaders%' or title ilike 'Mentoring Made Simple%' or title ilike 'Your Designation%' or title ilike 'How to Grow Your Personal Brand%' or title ilike 'Connected Educators%' then 'leading'
  when title ilike 'Confident Parent Conversations%' or title ilike 'Explaining Homework%' or title ilike 'Parent Tools That Support%' or title ilike 'Communication that Clicks%' or title ilike 'Smart Communication Choices%' then 'families'
  when title ilike 'Boundaries Without Backlash%' or title ilike 'RINSE Method%' or title ilike 'Streamline Your Inbox%' or title ilike 'Teacher-Tested Hacks%' or title ilike 'Book Club%' then 'teacher_load'
  when title ilike 'Procedures & Daily Routines%' then 'first_weeks'
  else 'instructional_planning' end
where is_published and archived_at is null;
