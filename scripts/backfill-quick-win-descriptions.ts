/**
 * Backfill descriptions for published quick wins that are missing them.
 * Run with: npx tsx scripts/backfill-quick-win-descriptions.ts
 */

import { config } from 'dotenv';
config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_LEARNING_HUB_SUPABASE_URL!;
const supabaseKey = process.env.LEARNING_HUB_SUPABASE_SERVICE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Generate a description based on title and category
function generateDescription(title: string, category: string): string {
  const descriptions: Record<string, string> = {
    '"What to do When" Simple Pocket Guide for Paras & Teachers': 'A quick-reference guide for paras and teachers covering common classroom situations. Print it, keep it close, and know exactly what to do when things come up.',
    '10 Low-Lift Ways to Be Part of the Solution': 'Ten practical, low-effort actions any educator can take to make a positive impact in their building. No extra prep, no extra time - just intentional small moves.',
    '2x10 Strategy PA Edition': 'The 2x10 relationship-building strategy adapted specifically for paraprofessionals. Two minutes a day, ten days in a row - a simple framework for connecting with students.',
    '3 Tiny Wellness Habits That Actually Help Educators Feel Better': 'Three evidence-based wellness habits designed for the reality of an educator\'s schedule. Small enough to actually stick, impactful enough to actually feel.',
    'Accommodation vs. Modification Quick-Guide': 'A clear, one-page breakdown of the difference between accommodations and modifications. Great for IEP meetings, parent conversations, and quick team reference.',
    'Autism Acceptance Month Organization Directory + School Partnership Guide': 'A curated directory of autism acceptance organizations plus a guide for building meaningful school partnerships. Ready to share with your team or families.',
    'Autism Acceptance Month Toolkit: Teacher Guide + Parent Handouts': 'A complete toolkit for Autism Acceptance Month including a teacher guide and ready-to-send parent handouts. Everything you need to lead with awareness and action.',
    'Back from Break Toolbox: Three High-Leverage Moves for Every Classroom': 'Three proven strategies to help students (and teachers) transition back after any school break. Works for winter, spring, summer - any re-entry moment.',
    'Beyond "Stop That": A Para\'s Pocket Guide': 'Practical redirection language for paraprofessionals that goes beyond "stop that." Real phrases for real moments that de-escalate and build trust.',
    'Bilingual Reference Cards - Spanish-English': 'Ready-to-print bilingual reference cards in Spanish and English. Designed for classrooms serving multilingual families and students.',
    'BIP Data Collection: Ideas for Success': 'Practical ideas and templates for collecting Behavior Intervention Plan data efficiently. Less paperwork stress, better data for your team.',
    'Calm Response Scripts': 'Pre-written scripts for responding calmly in heated classroom moments. Practice these before you need them so they come naturally when you do.',
    'Canva Bulk Create': 'A step-by-step guide to using Canva\'s bulk create feature for classroom materials. Save hours on repetitive design work.',
    'Class Skipping Intervention Plan': 'A structured intervention plan for addressing class skipping. Includes root cause analysis, conversation starters, and follow-up tracking.',
    'Classroom Systems Starter Pack': 'A starter pack of essential classroom systems including routines, procedures, and management structures. The foundation every classroom needs.',
    'Conversation Starter Cheat Sheet': 'A cheat sheet of conversation starters for building relationships with students, parents, and colleagues. Never wonder what to say first.',
    'Copy-Paste Messages for Partnering with Parents': 'Ready-to-use message templates for common parent communication scenarios. Copy, paste, personalize, send. Professional and warm every time.',
    'December Bingo Challenge': 'A fun December bingo challenge designed to keep staff morale high during the busiest month. Light, easy, and surprisingly effective.',
    'Early Literacy Essentials: A Teacher Checklist': 'A practical checklist of early literacy essentials every teacher should have in place. Quick self-assessment with actionable next steps.',
    'Emergency Lesson Plans for Survival Week': 'Pre-built emergency lesson plans for those weeks when everything falls apart. No prep required - just print and teach.',
    'Executive Functioning Educator Guide': 'A comprehensive guide to understanding and supporting executive functioning skills in students. Practical strategies organized by skill area.',
    'Executive Functioning: PA Guide': 'Executive functioning strategies tailored specifically for paraprofessionals. Know what to look for and how to support students in real time.',
    'Family Communication Log': 'A structured log for tracking family communication. Keep a clear record of calls, emails, and conferences all in one place.',
    'Feedback Framework Quick Reference': 'A quick-reference card for delivering effective feedback to students and colleagues. The right framework makes feedback feel like support, not criticism.',
    'Funding PD that Actually Works... with an expert team': 'A guide to finding and securing funding for high-quality professional development. Includes grant sources, talking points for admin, and budget templates.',
    'Funding your Dream Classroom': 'A practical guide to funding classroom projects through grants, donors, and creative sourcing. Your dream classroom is more affordable than you think.',
    'Helping Families Navigate the Shift: What to Expect in Middle School': 'A parent-facing guide to the middle school transition. Share this with families to ease anxiety and build partnership during a big change.',
    'Holiday Break Protection Bundle': 'A bundle of tools to protect your time, energy, and boundaries during holiday break. Because educators deserve actual rest.',
    'K-2 Station Rotation Routines: Smooth Transitions Made Simple': 'Step-by-step station rotation routines designed for K-2 classrooms. Smooth transitions, less chaos, more learning time.',
    'Kindergarten ELL Quick Communication Tool': 'A quick communication tool designed for kindergarten teachers working with English Language Learners. Visual supports and simple phrases that bridge the gap.',
    'Lesson Flow Checklist': 'A checklist for designing lessons that flow naturally from opening to close. Use it during planning to catch gaps before they happen.',
    'Mastery Learning + TDI PD Model (2-Page Explainer)': 'A two-page explainer connecting mastery learning principles with the TDI professional development model. Great for sharing with leadership.',
    'No-Hands-Up Help Systems': 'Alternative systems for students to signal they need help without raising their hand. Reduces anxiety and keeps the room flowing.',
    'PA Observation Guide': 'An observation guide designed for paraprofessional classroom walkthroughs. Know what to look for and how to document what you see.',
    'PA Onboarding Protocol': 'A structured onboarding protocol for new paraprofessionals. Covers the first 30 days with clear expectations and support checkpoints.',
    'PA Quick Wins Menu': 'A menu of quick-win strategies specifically for paras. Pick one, try it today, see the difference by Friday.',
    'Para Quick-Start Confidence Kit': 'A confidence-building kit for new or returning paraprofessionals. Covers classroom basics, communication tips, and self-advocacy tools.',
    'Parent Homework Support Strategies for Teachers': 'Strategies teachers can share with parents to support homework at home. Practical, judgment-free, and easy to implement.',
    'Personalized PD Plan: Goal Setting + Course Selection Tool': 'A tool for creating your own personalized professional development plan. Set goals, select courses, and track your growth intentionally.',
    'Phone Call & Meeting Preparation Checklist': 'A preparation checklist for parent phone calls and meetings. Walk in organized, confident, and ready for any conversation.',
    'Pitch It with Confidence: Recommending TDI to Your Admin': 'Talking points and a simple pitch framework for recommending TDI to your administrator. Data, testimonials, and funding options all in one place.',
    'Pre-K Para Toolkit': 'A toolkit of essential strategies and resources for Pre-K paraprofessionals. Everything you need for your first week and beyond.',
    'Pre-K Scenario Pack: Tell or Ask + Feedback Level Up': 'Scenario-based practice cards for Pre-K educators. Work through real situations using the Tell or Ask and Feedback Level Up frameworks.',
    'Pre-K Teaching Moves Quick Reference Card': 'A quick-reference card of high-impact teaching moves for Pre-K. Keep it on your lanyard or posted at your station.',
    'Professional Email Practices Quick Reference Guide': 'A reference guide for writing clear, professional emails. Templates, tone tips, and examples for every common school scenario.',
    'Reset Without the Guilt: 3 Tools to Reclaim Your Time and Energy': 'Three practical tools for reclaiming your time and energy without feeling guilty about it. You cannot pour from an empty cup.',
    'Small Group Support Toolkit (For Paras)': 'A complete toolkit for paras running small group instruction. Includes planning templates, engagement strategies, and progress tracking.',
    'SpEd Feedback Formula Quick Reference Card': 'A quick-reference card for delivering feedback in special education settings. The right formula for clear, supportive, actionable feedback.',
    'SpEd Para Toolkit': 'A comprehensive toolkit for special education paraprofessionals. Covers IEP basics, behavior support, data collection, and communication.',
    'SpEd Scenario Pack: Tell or Ask + Feedback Level Up': 'Scenario-based practice for special education teams. Real situations, real language, using the Tell or Ask and Feedback Level Up frameworks.',
    'Standards Clarity Toolkit: From Overwhelm to Aligned Instruction': 'A toolkit for making sense of standards without the overwhelm. Break them down, align your instruction, and teach with clarity.',
    'Strategic Planning: A Teacher-First Tool': 'A strategic planning tool that puts teachers at the center. Plan your year, semester, or unit with intention - not just compliance.',
    'Structured Parent Observation Protocol': 'A structured protocol for when parents observe in the classroom. Sets expectations, guides the visit, and supports productive follow-up.',
    'Supporting English Learners': 'A practical guide to supporting English Learners in any classroom. Strategies that work alongside your existing instruction.',
    'Sustainable Teaching Reset Guide': 'A reset guide for educators feeling burned out or stuck. Practical steps to reconnect with your purpose and rebuild sustainable habits.',
    'Teacher + Para Communication Kit': 'A communication kit for building strong teacher-para partnerships. Includes planning templates, role clarity tools, and check-in structures.',
    'The 7-Day Sustainable Sleep Challenge': 'A seven-day challenge designed to help educators improve their sleep habits. Small nightly adjustments that add up to real rest.',
    'The AI Brainstorm Buddy Template': 'A template for using AI tools as a brainstorming partner for lesson planning and classroom problem-solving. Work smarter, not harder.',
    'The Awesome Audit': 'A self-reflection audit that helps you identify what is already working in your practice. Start from strength, not deficit.',
    'The Campus Friction Map': 'A mapping tool to identify points of friction in your school\'s daily operations. See the bottlenecks, then fix them one at a time.',
    'The Connection Builder\'s Daily Checklist': 'A daily checklist for intentional relationship-building with students. Small daily actions that create lasting trust.',
    'The Culture-First Leadership Framework': 'A leadership framework that puts school culture before programs. Build the foundation first and everything else gets easier.',
    'The ELL Empathy Audit': 'An empathy audit designed to help educators understand the daily experience of English Language Learners. Walk in their shoes, then adjust your practice.',
    'The End-of-Day Educator Reset Checklist': 'A checklist for closing out your school day with intention. Leave the building with a clear mind and a clean start for tomorrow.',
    'The Equity-Centered Classroom Audit': 'A classroom audit tool centered on equity. Examine your space, materials, language, and systems through an equity lens.',
    'The Feedback Openness Audit': 'A self-assessment for how open you are to giving and receiving feedback. Honest reflection that leads to growth.',
    'The Friction-Free Leadership Framework': 'A framework for school leaders to reduce friction in daily operations. Less unnecessary stress, more time for what matters.',
    'The Friend Audit': 'A reflection tool for evaluating the relationships in your life. Surround yourself with people who fill your cup.',
    'The Instant Relevance Lesson Audit': 'An audit tool for making your lessons instantly relevant to students. Check your content against what actually matters to them.',
    'The Language Playbook': 'A playbook of precise language for common classroom situations. The right words at the right time change everything.',
    'The Procedure Builder': 'A step-by-step tool for building classroom procedures that stick. Design them once, teach them well, and watch your room run itself.',
    'The Pushback Script Card': 'Pre-written scripts for handling pushback from students, parents, or colleagues. Stay professional, stay calm, stay firm.',
    'The Retrieval Practice Checklist': 'A checklist for implementing retrieval practice in your classroom. The research-backed strategy that strengthens long-term learning.',
    'The Sentence Starter Guide: Effective Communication for Every Classroom': 'A guide packed with sentence starters for student discussions, writing prompts, and peer feedback. Scaffolding that empowers every learner.',
    'The Shared Load Planner': 'A planning tool for distributing workload across your team. Stop doing everything alone - share the load intentionally.',
    'The Shift Kit': 'A toolkit for navigating change in your school or role. Whether it is a new position, new team, or new initiative - this kit helps you land on your feet.',
    'The Staff Celebration Playbook: 40+ Ways to Make Your People Feel Seen': 'Over 40 ideas for celebrating staff that go beyond pizza parties. Real recognition that makes people feel genuinely seen and valued.',
    'The Sustainable Leadership Weekly Planning Template': 'A weekly planning template for school leaders who want to lead sustainably. Protect your time, prioritize what matters, and model balance.',
    'The Sustainable Teaching Self-Check': 'A self-check tool for evaluating the sustainability of your teaching habits. Catch burnout patterns before they catch you.',
    'The Teacher-Para Partnership Planner': 'A planning tool for building an intentional teacher-para partnership. Clarify roles, align expectations, and work as a real team.',
    'The Two Rabbits Audit': 'A focus audit based on the proverb about chasing two rabbits. Identify where you are spread too thin and reclaim your focus.',
    'The Virtual Connection Card': 'A digital connection card for building relationships in virtual or hybrid learning environments. Stay connected even through a screen.',
    'The Whiteboard Playbook: Visual Management Strategies That Actually Work': 'A playbook of visual management strategies using your whiteboard. Simple, effective systems that keep your classroom running smoothly.',
    'Time-Saving Prompts for Teachers': 'A collection of time-saving AI prompts designed specifically for teachers. Generate lesson ideas, emails, and materials in minutes.',
    'Toileting & Personal Care Support': 'A practical guide for paraprofessionals supporting students with toileting and personal care needs. Dignity-first strategies and clear protocols.',
    'Visual Cue Card Starter Pack': 'A starter pack of printable visual cue cards for classroom use. Support non-verbal communication, transitions, and routines visually.',
    'Volume Awareness: PA Guide': 'A guide for paraprofessionals on managing voice volume in the classroom. Practical awareness strategies that keep the learning environment calm.',
    'Weekly Communication Checklist': 'A weekly checklist for staying on top of parent, team, and admin communication. Never let an important message slip through the cracks.',
    'What should I be doing right now? A Para Guide for Teacher Support': 'A practical guide for paras who wonder what they should be doing during instruction. Clear expectations for every part of the lesson cycle.',
    'Your End-of-Year Checklist for a Guilt-Free Summer': 'An end-of-year checklist that helps you close out the school year completely so you can enjoy summer without the lingering guilt.',
  };

  return descriptions[title] || `A practical, ready-to-use ${category.toLowerCase()} resource for educators. Download it, use it today, and see the difference in your practice.`;
}

async function main() {
  const { data: quickWins, error } = await supabase
    .from('hub_quick_wins')
    .select('id, title, category')
    .eq('is_published', true)
    .or('description.is.null,description.eq.');

  if (error) {
    console.error('Error fetching quick wins:', error.message);
    return;
  }

  console.log(`Found ${quickWins?.length} quick wins needing descriptions`);

  let updated = 0;
  for (const qw of quickWins || []) {
    const description = generateDescription(qw.title, qw.category || 'Classroom Tools');
    const { error: updateError } = await supabase
      .from('hub_quick_wins')
      .update({ description })
      .eq('id', qw.id);

    if (updateError) {
      console.error(`Error updating ${qw.title}:`, updateError.message);
    } else {
      updated++;
      process.stdout.write('.');
    }
  }

  console.log(`\nDone! Updated ${updated} descriptions.`);
}

main().catch(console.error);
