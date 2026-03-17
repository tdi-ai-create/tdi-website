-- Migration: Rich Milestone Card Content
-- Run this SQL in Supabase SQL Editor

-- =============================================================
-- PART 1: Add new columns to milestones table
-- =============================================================

-- Add rich_content JSONB column for expandable sections
ALTER TABLE milestones ADD COLUMN IF NOT EXISTS rich_content jsonb;

-- Add milestone meeting columns
ALTER TABLE milestones ADD COLUMN IF NOT EXISTS is_milestone_meeting boolean DEFAULT false;
ALTER TABLE milestones ADD COLUMN IF NOT EXISTS milestone_meeting_note text;

-- =============================================================
-- PART 2: Mark milestone meetings and add notes
-- =============================================================

UPDATE milestones SET is_milestone_meeting = true
WHERE id IN (
  'outline_meeting_scheduled',
  'final_outline_meeting_scheduled',
  'test_video_recorded',
  'launched'
);

UPDATE milestones SET milestone_meeting_note = 'This is your first live touchpoint with the TDI team. Come ready to talk through your idea, your audience, and your vision. By the end, you will have a clear direction for your course structure.'
  WHERE id = 'outline_meeting_scheduled';

UPDATE milestones SET milestone_meeting_note = 'Your outline gets officially approved at this meeting. Come with your Google Doc open and your questions ready.'
  WHERE id = 'final_outline_meeting_scheduled';

UPDATE milestones SET milestone_meeting_note = 'This is a go/no-go checkpoint before full recording begins. We will review your test video and send written feedback within 5 business days.'
  WHERE id = 'test_video_recorded';

UPDATE milestones SET milestone_meeting_note = 'This is the finish line — and it is worth celebrating. Your content is officially live on the TDI Hub and available to educators everywhere.'
  WHERE id = 'launched';

-- =============================================================
-- PART 3: Populate rich_content for each milestone
-- =============================================================

-- ONBOARDING

UPDATE milestones SET rich_content = '{
  "what_to_do": [
    "Complete the intake form in full — every field helps us understand your vision and set you up for success.",
    "Be as specific as you can about your topic, your audience, and the problem you are solving for teachers.",
    "If you have a working title or a framework you already teach, share it here."
  ],
  "why_it_matters": [
    "This form is how we get to know you and your idea before anything else happens. Creators who are specific in their intake form move through the process faster — because we already understand what they are building."
  ],
  "examples": [
    "Weak: I want to help teachers with behavior management.",
    "Strong: I have spent 8 years developing a 3-step reset routine for K-2 classrooms with emotionally dysregulated students. I have used it with 500+ students and want to turn it into a course with a printable toolkit for teachers.",
    "Notice the difference: the strong version tells us who you teach, what you have built, who it is for, and what format you are imagining."
  ],
  "watch_out_for": [
    "Listing 3-4 different topics you could teach — pick the one you are most passionate about and most qualified to teach. You can always come back for another project later.",
    "Being vague about your audience — all teachers is hard to serve. Third grade teachers in high-poverty schools is a community we can reach.",
    "Skipping fields or writing TBD — the more we know now, the less back-and-forth later."
  ],
  "whats_next": "Once we review your intake form, we will reach out to confirm your content path and welcome you into the portal. Most creators hear from us within 2 business days."
}'::jsonb WHERE id = 'intake_completed';

UPDATE milestones SET rich_content = '{
  "what_to_do": [
    "Review the three content path options and select the one that best fits what you want to create.",
    "If you are building a video course with lessons, downloads, and a structured curriculum — choose Learning Hub Course.",
    "If you have a ready-made resource like a guide, template, or toolkit — choose Digital Download.",
    "If you want to share expertise, a story, or a practical strategy through writing — choose Blog Post.",
    "Not sure? Think about how you naturally share your knowledge. Do you teach step-by-step? Course. Do you hand people a resource? Download. Do you write or share on social? Blog."
  ],
  "why_it_matters": [
    "Choosing the right path from the start makes everything else smoother. Each path has a different set of steps, a different timeline, and a different kind of support from us.",
    "This is not a permanent decision — many creators start with a blog or download and come back to build a full course using the Create With Us Again feature."
  ],
  "examples": [
    "Blog: A school counselor shares her story of using restorative circles to replace suspensions. 900 words, personal and practical.",
    "Download: A reading coach creates a laminated phonics reference card and an editable lesson planning template. Two files, immediately usable.",
    "Course: A veteran co-teaching specialist builds a 5-module video course with a companion workbook — the kind of PD that used to cost $500 a seat."
  ],
  "watch_out_for": [
    "Choosing Course because it feels like the most impressive option — only choose course if you are genuinely ready to record video content and commit to the full journey.",
    "Trying to do all three at once — pick one, do it well, and expand from there."
  ],
  "whats_next": "Once you select your path, your milestone list will update to show the exact steps for your content type. Every step from here is specific to your path."
}'::jsonb WHERE id = 'content_path_selection';

UPDATE milestones SET rich_content = '{
  "what_to_do": [
    "Submit your bio, a headshot, and your social media handles using the form on this step.",
    "Write your bio in third person — about yourself, not to yourself. Aim for 3-5 sentences.",
    "Your headshot does not need to be professional — a clear, well-lit phone photo with a clean background works great.",
    "Include at least 2 social handles. Instagram and LinkedIn are the most valuable for reaching educator audiences."
  ],
  "why_it_matters": [
    "Your creator profile on the TDI Hub is one of the first things potential learners see. It builds trust before they even look at your course or download.",
    "Educators buy from people they believe in. A strong bio and a warm photo go a long way."
  ],
  "examples": [
    "Strong bio: Katie Welch is a licensed school counselor with 12 years of experience supporting K-8 students in urban and suburban settings. She specializes in building proactive social-emotional learning systems that reduce the need for reactive interventions. When she is not in the counseling office, you will find her hiking with her dogs or hosting dinner parties for her favorite people.",
    "What makes it work: specific experience, clear specialty, and a real human moment at the end."
  ],
  "watch_out_for": [
    "Writing your bio in first person — third person reads as more credible on a Hub profile.",
    "Using a cropped group photo or a low-light selfie — one warm, clear photo makes a huge difference.",
    "Listing your social handles but having a private account — make sure your public presence reflects the expertise you are sharing here."
  ],
  "whats_next": "Once your details are submitted, we will build your creator profile on the Hub. You will be able to preview it before anything goes live."
}'::jsonb WHERE id = 'creator_details';

-- AGREEMENT

UPDATE milestones SET rich_content = '{
  "what_to_do": [
    "Review the TDI Creator Agreement and sign it electronically.",
    "Read it fully before signing — it is straightforward and designed to protect both you and TDI.",
    "If you have any questions about specific terms, reach out before signing. We are happy to walk you through anything."
  ],
  "why_it_matters": [
    "The agreement is what makes this official. It outlines how revenue sharing works, how your content is used, and what both sides are responsible for.",
    "Having this in place means you are protected. Your content, your ideas, and your expertise are respected throughout the entire process."
  ],
  "examples": [
    "The most common question: What does the 30% mean in practice?",
    "TDI handles everything — marketing, the platform, customer support, editing, branding, and promotion. You earn 30% on every enrollment with zero overhead.",
    "A course priced at $97 earns you $29.10 per student. A course with 100 students earns you $2,910."
  ],
  "watch_out_for": [
    "Signing without reading — take 10 minutes to go through it. It is clear and jargon-free.",
    "Waiting too long on this step — the agreement unlocks everything else. If you have questions, ask them quickly so you can keep moving."
  ],
  "whats_next": "Once your agreement is signed, your next steps unlock and we officially begin building together. Welcome to the TDI Creator family."
}'::jsonb WHERE id = 'agreement_sign';

-- COURSE DESIGN

UPDATE milestones SET rich_content = '{
  "what_to_do": [
    "Use the TDI outline template (linked below) to draft your course structure in a Google Doc.",
    "Your outline should include: a working course title, 3-6 module names, 2-4 lesson ideas per module, and one resource or download idea per module.",
    "Do not overthink it — a working outline is meant to be messy. This is a draft, not a finished curriculum.",
    "Share the Google Doc link in the portal when you are ready for review."
  ],
  "why_it_matters": [
    "Your outline is the architecture of your course. Getting this right before you record a single video saves hours of rework later.",
    "A well-structured outline also makes recording feel easy — you always know exactly what comes next and why it matters."
  ],
  "examples": [
    "Course: Executive Functioning Made Simple",
    "Module 1 — Why Executive Functioning Breaks Down in the Classroom",
    "Module 2 — The 3 EF Skills Every Teacher Can Directly Impact",
    "Module 3 — Environmental Setups That Do the Heavy Lifting",
    "Module 4 — Routines and Rituals That Build Student Capacity",
    "Module 5 — What To Do When a Student Still Struggles",
    "Each module stands alone AND builds on the one before it."
  ],
  "watch_out_for": [
    "Module titles like Introduction or Getting Started — these tell learners nothing. Every title should make a promise.",
    "Designing more than 6 modules in your first pass — a focused 4-module course that educators finish is more valuable than an 8-module course they abandon.",
    "Trying to include everything you know — your course is one powerful transformation, not your entire career."
  ],
  "whats_next": "Once you submit your outline, we will review it and schedule your Outline Review Meeting to finalize the structure together."
}'::jsonb WHERE id = 'outline_drafted';

UPDATE milestones SET rich_content = '{
  "what_to_do": [
    "Use the scheduling link below to book your Outline Review Meeting.",
    "Before the call, re-read your outline and note anywhere you feel uncertain or where you have questions.",
    "Be ready for us to push on your module titles and lesson ideas — we want every part of your outline to be as strong as possible."
  ],
  "why_it_matters": [
    "This meeting is the final quality check before you start building content. Getting explicit approval here means you will not be second-guessing your structure while you are recording.",
    "It is also where we talk through your downloadable resources so they are designed alongside your content, not as an afterthought."
  ],
  "watch_out_for": [
    "Canceling or rescheduling more than once — momentum matters. The longer the gap between planning and doing, the harder it is to keep going.",
    "Trying to have your whole course figured out before the call — that is what the call is for."
  ],
  "whats_next": "After your outline is approved, your next steps are to review the Course Creation Guide and start designing your downloads."
}'::jsonb WHERE id = 'outline_meeting_scheduled';

UPDATE milestones SET rich_content = '{
  "what_to_do": [
    "Read through the TDI Course Creation Guide (linked below) before you record anything.",
    "Pay special attention to the sections on audio quality, lesson length, and how to structure individual videos.",
    "Watch 1-2 examples of existing TDI courses so you can hear and see the standard before you start."
  ],
  "why_it_matters": [
    "The guide exists because we have seen what works — and what costs creators time in re-recording. Five minutes of reading now can save hours of frustration later."
  ],
  "examples": [
    "What makes a great lesson video:",
    "5-12 minutes long. Anything longer should become two lessons.",
    "Structured as: Hook (what you will learn) > Content > Application (how to use this tomorrow) > Quick recap.",
    "Taught like you are talking to one teacher in your kitchen, not presenting to an auditorium.",
    "Simple slides. One idea per slide. Real classroom images whenever possible."
  ],
  "watch_out_for": [
    "Skipping this step — the guide is short and worth every minute.",
    "Watching zero example courses before recording — seeing is more powerful than reading a spec sheet."
  ],
  "whats_next": "Once you have reviewed the guide, you are ready to begin designing your downloads and recording your test video."
}'::jsonb WHERE id = 'course_guide_reviewed';

-- TEST PREP

UPDATE milestones SET rich_content = '{
  "what_to_do": [
    "Record a short sample lesson (5-10 minutes) from one of your modules.",
    "Use your actual setup — the same mic, camera, lighting, and background you plan to use for the full course.",
    "Teach the lesson as if your real audience is watching. Do not add a disclaimer that it is a test.",
    "Upload the video to a Google Drive folder and submit the link in the portal."
  ],
  "why_it_matters": [
    "The test video protects your time. It takes one short recording now to make sure your setup and delivery are solid before you record 20+ lessons.",
    "We have seen creators re-record entire courses because of audio or framing issues that could have been caught in a test video. This step exists so that does not happen to you."
  ],
  "examples": [
    "What we look for: Can we hear you clearly? Is there distracting background noise? Can we see your face? Is your energy warm and engaging? Are your slides readable?",
    "Your test video does not need to be perfect — it needs to be representative. Record a real lesson exactly the way you plan to record the full course."
  ],
  "watch_out_for": [
    "Recording in a room with an echo — bathrooms and large empty rooms create echo. A bedroom with soft furnishings works much better.",
    "Reading directly from your slides — your slides should be a visual aid, not a script.",
    "Waiting for a perfect setup — clear audio and good lighting matter. Everything else is secondary."
  ],
  "whats_next": "We will review your test video and send written feedback within 5 business days. Once approved, you are cleared to record your full course."
}'::jsonb WHERE id = 'test_video_recorded';

UPDATE milestones SET rich_content = '{
  "what_to_do": [
    "Decide what downloadable resource or resources will accompany your content.",
    "Think about what an educator would actually use during their school day — something they would print, laminate, or open every week.",
    "Write a short description of each resource: what it is, who it is for, and how a teacher would use it.",
    "Submit your download concept through the portal for TDI review."
  ],
  "why_it_matters": [
    "Downloads are the most shared and most talked-about part of any course or resource pack. A teacher who uses your checklist every Monday morning is a walking advertisement for your work.",
    "For download-only creators, this IS your product. The value you put into it is the value educators experience directly."
  ],
  "examples": [
    "K-5 Teachers: Editable behavior charts, visual schedules, parent communication templates, morning meeting slides",
    "Secondary Teachers: Discussion protocols, unit planning guides, bell-ringer templates, essay feedback rubrics",
    "Instructional Coaches: Observation forms, coaching conversation frameworks, PD planning templates",
    "School Counselors: SEL lesson plans, small group activity guides, check-in/check-out logs",
    "The best download saves a teacher 20+ minutes of prep time every single week."
  ],
  "watch_out_for": [
    "Creating a 20-page guide that teachers read once — the most valuable downloads are things people return to again and again.",
    "Spending hours designing it yourself — just write the content. TDI will brand it beautifully. Your job is the substance, not the design.",
    "Making it too general — a kindergarten morning meeting template is far more useful than a generic morning routine resource."
  ],
  "whats_next": "After your download concept is approved, you will move into drafting and then handoff to TDI for professional branding."
}'::jsonb WHERE id = 'download_defined';

UPDATE milestones SET rich_content = '{
  "what_to_do": [
    "Build out your download content in a simple Google Doc or unformatted Canva draft.",
    "Focus entirely on the content — what goes on each section, what the educator reads or fills out, what makes it useful.",
    "Do not spend time on fonts, colors, or design. TDI will handle all of that.",
    "Submit the draft link in the portal when it is content-complete."
  ],
  "why_it_matters": [
    "Separating content from design is one of the best decisions you can make at this stage. It lets you focus on what only you can do — create the substance — while TDI handles what we do best."
  ],
  "examples": [
    "What to include in your draft submission:",
    "Every section or field that will appear in the final resource",
    "Instructions or headers exactly as you want them worded",
    "Any notes for the design team — for example: this section should be fillable, or this is meant to be laminated",
    "A note on format: is this a single page? A multi-page workbook? A set of cards?"
  ],
  "watch_out_for": [
    "Submitting something half-finished — if a section is labeled TBD, it will come back to you for revision.",
    "Over-designing it yourself before handing off — we have seen creators spend hours in Canva on something TDI will rebuild from scratch anyway. Just get the content right."
  ],
  "whats_next": "After handoff, TDI will return your professionally branded download within 10 business days. You will see a preview before anything goes live."
}'::jsonb WHERE id = 'download_drafted';

-- PRODUCTION

UPDATE milestones SET rich_content = '{
  "what_to_do": [
    "Start recording your course modules using the setup from your approved test video.",
    "Record in blocks of 2-3 hours when your energy is high — do not try to record an entire module in one marathon session.",
    "Name your video files clearly: Module-1-Lesson-1-Title, Module-1-Lesson-2-Title, and so on.",
    "Upload files to your Google Drive folder as you go — do not wait until everything is recorded."
  ],
  "why_it_matters": [
    "Recording is where your course becomes real. Everything before this was planning — now you are building the thing teachers will actually learn from.",
    "The creators who finish fastest are the ones who record consistently in shorter sessions rather than waiting for a perfect block of free time that never quite arrives."
  ],
  "examples": [
    "A recording rhythm that works: record 2-3 lessons per session (60-90 minutes of recording time).",
    "Do a 1-minute warmup before each session — say your name, what you are recording, and one thing you love about this topic.",
    "If you stumble, keep going. Do not stop to re-record every time. Your best teaching often happens in takes 2 and 3 when the nervousness has worn off."
  ],
  "watch_out_for": [
    "Waiting until you have enough time to record — record one lesson today. Momentum is everything.",
    "Re-recording endlessly because it was not perfect — done is better than perfect. Real teachers do not want a polished performance; they want authentic expertise.",
    "Forgetting to name your files clearly — it creates significant delays when assets arrive unorganized."
  ],
  "whats_next": "Once recording is complete, your next step is to submit all assets to TDI. We handle the rest — editing, marketing materials, and platform upload."
}'::jsonb WHERE id = 'recording_started';

UPDATE milestones SET rich_content = '{
  "what_to_do": [
    "Confirm your Google Drive folder contains: all video files named clearly, all download drafts, and any additional resources or slide decks.",
    "Mark this milestone complete in the portal once everything is uploaded.",
    "We will do a folder audit within 48 hours and confirm receipt."
  ],
  "why_it_matters": [
    "This is the handoff moment. Once assets are submitted, TDI takes the wheel — editing, branding, platform setup, and marketing are all in our hands.",
    "A clean, organized submission means faster turnaround. Anything missing adds days to the timeline."
  ],
  "examples": [
    "What a complete asset submission looks like:",
    "Module-1 folder: Lesson-1-Why-This-Topic-Matters.mp4, Lesson-2-The-Framework.mp4, Lesson-3-Classroom-Application.mp4",
    "Downloads folder: Checklist-DRAFT.docx, Planning-Template-DRAFT.docx",
    "Extras: Course-Slides.pptx if applicable"
  ],
  "watch_out_for": [
    "Submitting videos with generic names like Video1.mp4 — it takes significantly longer to match files to the right lessons.",
    "Forgetting to include download drafts in the same submission — if downloads are missing, the whole package goes on hold."
  ],
  "whats_next": "After assets are submitted, TDI handles editing, branding, and platform setup. We will share a timeline and let you know when a preview is ready."
}'::jsonb WHERE id = 'assets_submitted';

-- LAUNCH

UPDATE milestones SET rich_content = '{
  "what_to_do": [
    "Review the visual preview of your Hub profile — cover image, color palette, and layout.",
    "Check that your name, bio, headshot, and course description are accurate.",
    "Submit any revision requests through the portal. You have two revision rounds before final approval.",
    "Confirm your approval in the portal when you are happy with how everything looks."
  ],
  "why_it_matters": [
    "Your Hub profile is the first thing a potential learner sees. It builds trust before they read a single lesson title.",
    "This is your chance to make sure your voice comes through in the course description — it should sound like you, not a generic product page."
  ],
  "examples": [
    "What to look for in your profile review:",
    "Does your course title clearly communicate who it is for and what they will learn?",
    "Does your bio feel like you — specific, credible, and real?",
    "Does the course description make a teacher want to enroll today?",
    "Do the module titles make promises that your lessons deliver on?"
  ],
  "watch_out_for": [
    "Using your revision rounds on design preferences — focus feedback on accuracy and voice, not font choices.",
    "Approving without reading your course description carefully — this is what learners read before they buy. Every sentence should earn its place."
  ],
  "whats_next": "Once branding is confirmed, the next step is pitching your launch blog — the piece of content that drives your first wave of learners to the Hub."
}'::jsonb WHERE id = 'branding_confirmed';

UPDATE milestones SET rich_content = '{
  "what_to_do": [
    "Submit a blog topic idea that connects to your course, download, or area of expertise.",
    "Your pitch should include: a working title, 2-3 sentences about what the post will cover, and who you are writing it for.",
    "Think about what a teacher would search for or share on social media — that is the sweet spot."
  ],
  "why_it_matters": [
    "Your blog is not a sales pitch — it is a genuine gift to the educator community that happens to point them toward your work.",
    "Teachers share things that make other teachers lives better. A great post will reach educators you have never met, in schools you have never visited."
  ],
  "examples": [
    "Strong blog topic formulas:",
    "The [Number] [Things] That Changed How I [Topic] — example: The 3 Phrases That Changed How I Handle Classroom Conflict",
    "Why [Common Belief] Is Actually Holding Teachers Back — contrarian, generates curiosity",
    "What I Wish Someone Had Told Me About [Topic] Before My First Year — vulnerability-driven, highly shareable",
    "The [Framework] I Use Every [Time Period] to [Result] — practical, outcome-focused"
  ],
  "watch_out_for": [
    "Pitching something that is basically an advertisement for your course — the post should stand alone as valuable. The course is the next step, not the point.",
    "Picking a topic that is too broad — Tips for New Teachers will not find its audience. How I Survived My First Year Teaching 5th Grade Fractions will."
  ],
  "whats_next": "Once your topic is approved, you will move into drafting. We will share the writing guide and examples to help you write a post you are proud of."
}'::jsonb WHERE id = 'blog_pitch';

UPDATE milestones SET rich_content = '{
  "what_to_do": [
    "Write your blog post draft in a Google Doc using the TDI writing guide (linked below).",
    "Aim for 800-1200 words. Write the way you talk — warm, specific, and practical.",
    "End with a clear, natural call to action that points readers toward your course or download.",
    "Submit the Google Doc link in the portal when your draft is ready for review."
  ],
  "why_it_matters": [
    "This is your voice reaching teachers you have never met. Write the post you wish someone had written for you earlier in your career.",
    "The best TDI blog posts do not feel like marketing. They feel like a colleague sharing something genuinely useful in the teachers lounge."
  ],
  "examples": [
    "What a strong TDI blog post looks like:",
    "Opens with a specific classroom scene or a moment a teacher will immediately recognize.",
    "Builds to one clear insight that reframes how teachers think about the topic.",
    "Gives 2-3 specific, actionable takeaways — things a teacher could try tomorrow.",
    "Ends with a warm invitation: If this resonated, my course goes much deeper — here is the link."
  ],
  "watch_out_for": [
    "Opening with a generic statement like Teaching is hard — your first sentence needs to make a teacher nod, laugh, or feel seen.",
    "Writing in a formal, academic tone — you are a practitioner, not a researcher. Talk like one.",
    "Forgetting the call to action — every post should end by pointing readers somewhere specific."
  ],
  "whats_next": "Once you submit your draft, TDI will review it, edit for clarity and flow, and share a formatted preview before it goes live."
}'::jsonb WHERE id = 'blog_drafted';
