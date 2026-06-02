/**
 * Seed hub_qa_posts with realistic community Q&A across courses and quick wins.
 * Run with: npx tsx scripts/seed-qa-posts.ts
 */

import { config } from 'dotenv';
config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_LEARNING_HUB_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.LEARNING_HUB_SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const PERSONAS = [
  { id: 'a1111111-1111-1111-1111-111111111111' },
  { id: 'a2222222-2222-2222-2222-222222222222' },
  { id: 'a3333333-3333-3333-3333-333333333333' },
  { id: 'a4444444-4444-4444-4444-444444444444' },
  { id: 'a5555555-5555-5555-5555-555555555555' },
  { id: 'a6666666-6666-6666-6666-666666666666' },
  { id: 'a7777777-7777-7777-7777-777777777777' },
  { id: 'a8888888-8888-8888-8888-888888888888' },
  { id: 'a9999999-9999-9999-9999-999999999999' },
  { id: 'ab111111-1111-1111-1111-111111111111' },
];

const QUESTIONS = [
  "Has anyone tried this with a co-taught classroom? Wondering how to split responsibilities with my co-teacher.",
  "What age group does this work best for? I teach 6th grade and I am not sure if it will land the same way.",
  "How do you handle the timing if your periods are only 40 minutes? Feels like it needs more room to breathe.",
  "My admin is asking me to share this with our PLC. Any tips for presenting it to a group who has not seen it yet?",
  "Does anyone have a modified version of this for students with IEPs? I want to make sure it is accessible.",
  "I tried this last week and my students loved it but I am struggling with the follow-up. What do you do the day after?",
  "How do you keep this going long-term? I always start strong with new strategies but fade out after a few weeks.",
  "Would this work in a virtual or hybrid setting? Half my students are remote on Fridays.",
  "What supplies or materials do I actually need to get started? I want to make sure I have everything before I begin.",
  "Has anyone used this with kindergarteners? The language seems geared toward older students.",
  "How do you handle students who refuse to participate? I have a few who shut down with anything new.",
  "Can I combine this with station rotations or does it work better as a whole-group activity?",
  "My team wants to try this building-wide. Has anyone done that? How did you coordinate across classrooms?",
  "What is the biggest mistake you made the first time you tried this? I want to avoid the common pitfalls.",
  "Does this align with any specific standards? My district requires us to map everything back to state standards.",
  "How long did it take before you saw real results? I need to set realistic expectations for myself.",
  "I am a first-year teacher. Is this too advanced for someone just getting started or is it beginner-friendly?",
  "Any suggestions for adapting this for English Language Learners? I have several students who are still developing English.",
  "How does this work with block scheduling? We have 90-minute periods and I am not sure how to pace it.",
  "Can paras lead this or does it need to be the classroom teacher driving it?",
];

const REPLIES = [
  "We do this in our co-taught room and it actually works better with two adults. One can monitor while the other facilitates. Highly recommend.",
  "I use this with 2nd graders and it works great. I just simplified the language a bit and added more visual supports.",
  "Honestly it took me about two weeks to find my rhythm. Do not give up after the first try. The second week was completely different.",
  "I presented this at our last staff meeting and the key was showing a short video of it in action first. People need to see it, not just hear about it.",
  "I modified it for my small group by reducing the number of steps and giving more processing time. Worked really well.",
  "The follow-up is key. I do a quick 2-minute reflection the next day - just a thumbs up/down and one sentence about what they remember.",
  "I keep a simple tracking sheet on my clipboard. When I can see my own consistency it motivates me to keep going.",
  "Used this on Zoom with my remote students and it actually translated well. I just used the chat feature for the interactive parts.",
  "You really do not need much. I started with just a whiteboard and sticky notes. Do not overthink the materials.",
  "My kindergartener team adapted this and it works if you shorten the time frames and add more movement breaks between steps.",
  "For the kids who resist, I give them the option to observe first. Nine times out of ten they join in by the second round.",
  "I run this as a station and it is honestly my smoothest rotation. The structure keeps students on track even without me there.",
  "We rolled this out across our grade level and the biggest lesson was to let each teacher adapt it to their style. One size does not fit all.",
  "My biggest mistake was trying to do too much the first time. Start with just the core piece and add layers as you get comfortable.",
  "I mapped it to our SEL standards and my admin was thrilled. It checks multiple boxes without feeling forced.",
  "I saw a shift in student engagement within the first week but the deeper impact took about a month. Worth the patience.",
  "I am a second-year teacher and I found this very approachable. The step-by-step format made it easy to follow even without much experience.",
  "For my ELL students I pre-teach the key vocabulary and pair them with a bilingual buddy. That small change made a huge difference.",
  "With block scheduling I split it into two parts with an independent practice section in between. Keeps the energy up for 90 minutes.",
  "Our paras lead this during small group time and it has been amazing. They appreciated having a clear structure to follow.",
  "Same here - I think the magic is in the simplicity. Do not add too many bells and whistles.",
  "I would also add that involving students in the setup helps with buy-in. Let them help create the materials or choose the order.",
  "Great question. I had the same concern and ended up just jumping in. Learned more from doing it than from planning it.",
  "This is one of those things that sounds harder than it is. Once you try it once you will wonder why you waited.",
];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickPersona(exclude: string[] = []) {
  const available = PERSONAS.filter(p => !exclude.includes(p.id));
  return pickRandom(available.length > 0 ? available : PERSONAS);
}

function randomDate(daysBack: number = 30): string {
  const daysAgo = Math.floor(Math.random() * daysBack) + 1;
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(Math.floor(Math.random() * 12) + 7);
  date.setMinutes(Math.floor(Math.random() * 60));
  return date.toISOString();
}

function replyDate(questionDate: string): string {
  const qDate = new Date(questionDate);
  const hoursLater = Math.floor(Math.random() * 72) + 2; // 2-74 hours later
  qDate.setHours(qDate.getHours() + hoursLater);
  return qDate.toISOString();
}

async function main() {
  // Check if already seeded
  const { count } = await supabase
    .from('hub_qa_posts')
    .select('id', { count: 'exact', head: true });

  if ((count || 0) > 10) {
    console.log(`Already have ${count} Q&A posts. Delete first to re-seed.`);
    console.log("Run: DELETE FROM hub_qa_posts WHERE user_id::text LIKE 'a%';");
    return;
  }

  // Get published courses
  const { data: courses } = await supabase
    .from('hub_courses')
    .select('id, title')
    .eq('is_published', true);

  // Get published quick wins
  const { data: quickWins } = await supabase
    .from('hub_quick_wins')
    .select('id, title')
    .eq('is_published', true);

  console.log(`Found ${courses?.length} courses, ${quickWins?.length} quick wins`);

  let totalInserted = 0;
  const usedQuestions = new Set<string>();

  // Seed courses
  for (const course of courses || []) {
    const qCount = 2 + Math.floor(Math.random() * 3); // 2-4 questions per course
    const usedPersonas: string[] = [];

    for (let i = 0; i < qCount; i++) {
      let question: string;
      do { question = pickRandom(QUESTIONS); } while (usedQuestions.has(course.id + question));
      usedQuestions.add(course.id + question);

      const qPersona = pickPersona(usedPersonas);
      usedPersonas.push(qPersona.id);
      const qDate = randomDate();

      const { data: qPost, error: qError } = await supabase
        .from('hub_qa_posts')
        .insert({
          content_type: 'course',
          content_id: course.id,
          parent_id: null,
          user_id: qPersona.id,
          body: question,
          helpful_count: Math.floor(Math.random() * 15),
          created_at: qDate,
        })
        .select('id')
        .single();

      if (qError) {
        console.error(`Error inserting question for ${course.title}:`, qError.message);
        continue;
      }
      totalInserted++;

      // Add 1-3 replies
      const rCount = 1 + Math.floor(Math.random() * 3);
      const replyPersonas: string[] = [qPersona.id];

      for (let j = 0; j < rCount; j++) {
        const rPersona = pickPersona(replyPersonas);
        replyPersonas.push(rPersona.id);

        const { error: rError } = await supabase
          .from('hub_qa_posts')
          .insert({
            content_type: 'course',
            content_id: course.id,
            parent_id: qPost.id,
            user_id: rPersona.id,
            body: pickRandom(REPLIES),
            helpful_count: Math.floor(Math.random() * 10),
            created_at: replyDate(qDate),
          });

        if (!rError) totalInserted++;
      }
    }
    process.stdout.write('.');
  }

  // Seed quick wins
  for (const qw of quickWins || []) {
    const qCount = 1 + Math.floor(Math.random() * 3); // 1-3 questions per quick win
    const usedPersonas: string[] = [];

    for (let i = 0; i < qCount; i++) {
      let question: string;
      do { question = pickRandom(QUESTIONS); } while (usedQuestions.has(qw.id + question));
      usedQuestions.add(qw.id + question);

      const qPersona = pickPersona(usedPersonas);
      usedPersonas.push(qPersona.id);
      const qDate = randomDate();

      const { data: qPost, error: qError } = await supabase
        .from('hub_qa_posts')
        .insert({
          content_type: 'quick_win',
          content_id: qw.id,
          parent_id: null,
          user_id: qPersona.id,
          body: question,
          helpful_count: Math.floor(Math.random() * 15),
          created_at: qDate,
        })
        .select('id')
        .single();

      if (qError) {
        console.error(`Error inserting question for ${qw.title}:`, qError.message);
        continue;
      }
      totalInserted++;

      // Add 0-2 replies
      const rCount = Math.floor(Math.random() * 3);
      const replyPersonas: string[] = [qPersona.id];

      for (let j = 0; j < rCount; j++) {
        const rPersona = pickPersona(replyPersonas);
        replyPersonas.push(rPersona.id);

        const { error: rError } = await supabase
          .from('hub_qa_posts')
          .insert({
            content_type: 'quick_win',
            content_id: qw.id,
            parent_id: qPost.id,
            user_id: rPersona.id,
            body: pickRandom(REPLIES),
            helpful_count: Math.floor(Math.random() * 10),
            created_at: replyDate(qDate),
          });

        if (!rError) totalInserted++;
      }
    }
    process.stdout.write('.');
  }

  console.log(`\nDone! Inserted ${totalInserted} Q&A posts.`);

  const { count: finalCount } = await supabase
    .from('hub_qa_posts')
    .select('id', { count: 'exact', head: true });
  console.log(`Total hub_qa_posts in table: ${finalCount}`);
}

main().catch(console.error);
