'use client';

import { FileText, Download, MessageSquare, Heart, Target, Users } from 'lucide-react';

const TOOLS = [
  {
    title: '5 Questions to Ask Your Team This Week',
    description: 'Quick pulse check questions that build trust and surface real needs.',
    icon: MessageSquare,
    color: '#2A9D8F',
    content: `5 QUESTIONS TO ASK YOUR TEAM THIS WEEK

1. "What is one thing that worked well for you this week?"
   (Celebrates wins before diving into problems)

2. "What is taking more time than it should?"
   (Identifies systemic issues you can actually fix)

3. "Is there a student who is on your mind right now?"
   (Shows you care about what they care about)

4. "What is one thing I could do differently to support you?"
   (Models vulnerability and invites honest feedback)

5. "On a scale of 1-5, how are you really doing today?"
   (Simple wellness check -- follow up if they say 1-2)

TIP: Ask these in hallway conversations, not formal meetings.
The best data comes from informal moments.

-- Teachers Deserve It | teachersdeserveit.com/hub`,
  },
  {
    title: 'Observation Debrief Template',
    description: 'A structured framework for turning observations into growth conversations.',
    icon: Target,
    color: '#E8B84B',
    content: `OBSERVATION DEBRIEF TEMPLATE

BEFORE THE CONVERSATION:
- Review your notes within 24 hours
- Identify 2-3 specific positives (with timestamps)
- Identify 1 growth area (frame as a question, not a correction)

OPENING (2 min):
"Thank you for letting me be in your room. I want to start by
telling you what I noticed that was strong..."

STRENGTHS (5 min):
- Be SPECIFIC: "At 9:14, when [student] was disengaged, you..."
- Connect to impact: "...and that resulted in..."
- Name the skill: "That is [proximity/redirection/relationship-building]"

GROWTH QUESTION (3 min):
"I am curious about [moment]. What were you thinking in that moment?"
(Let them reflect before you offer suggestions)

NEXT STEP (2 min):
"Based on what we talked about, what is one thing you want to try
before I come back?"

CLOSE:
"I am genuinely impressed by [specific thing]. Your students are
lucky to have you."

-- Teachers Deserve It | teachersdeserveit.com/hub`,
  },
  {
    title: 'Teacher Appreciation Note Templates',
    description: '10 ready-to-personalize notes that make teachers feel seen.',
    icon: Heart,
    color: '#EC4899',
    content: `TEACHER APPRECIATION NOTE TEMPLATES

1. THE SPECIFIC NOTICE
"I saw you [specific action] with [student/class] and it reminded
me why I wanted you on this team. That moment mattered."

2. THE GROWTH RECOGNIZER
"I have watched you grow in [area] this year. The difference between
September-you and now is remarkable. You should be proud."

3. THE QUIET HERO
"I know you do things that nobody sees -- the extra prep, the
parent calls, the staying late. I see it. Thank you."

4. THE TEAM PLAYER
"When you [helped colleague/covered class/shared resource], you
did not just help one person. You set the tone for our whole team."

5. THE INNOVATOR
"I love that you tried [new strategy/tool]. Whether it worked
perfectly or not, the willingness to try is what moves us forward."

6. THE WELLNESS CHECK
"I wanted to check in -- not about school, just about you. How
are you really doing? This job asks a lot. I want to make sure
you know someone is in your corner."

7. THE HUB SHOUT-OUT
"I noticed you have been exploring the TDI Learning Hub -- [X]
tools this month! What have you found most useful?"

8. THE END OF YEAR
"This year was not easy. But you showed up, every day, for kids
who needed you. That is not nothing. That is everything."

9. THE PARENT FEEDBACK
"A parent reached out to say [positive thing]. I wanted you to
hear it directly -- your impact extends beyond the classroom."

10. THE SIMPLE TRUTH
"You deserve to know: you are a good teacher. Not because of
test scores or evaluations, but because you care. And kids know."

TIP: Handwrite these. The 2 minutes it takes means more than
any formal evaluation.

-- Teachers Deserve It | teachersdeserveit.com/hub`,
  },
  {
    title: 'Staff Meeting in 5 Minutes',
    description: 'A quick-start template for meaningful 5-minute staff touchpoints.',
    icon: Users,
    color: '#2563EB',
    content: `STAFF MEETING IN 5 MINUTES

This is not a "meeting." It is a 5-minute team moment.

MINUTE 1: WIN OF THE WEEK
"Before anything else -- what is one good thing that happened
in your classroom this week?" (Let 2-3 people share)

MINUTE 2: SPOTLIGHT
Highlight one specific teacher/para moment you observed. Be
specific. Name the person. Name the impact.

MINUTE 3: TOOL OF THE WEEK
"On the TDI Learning Hub, the most popular tool this week was
[tool name]. Has anyone tried it? What did you think?"

MINUTE 4: PULSE CHECK
"Quick show of hands -- how is our energy today?
Thumbs up / sideways / down." (No judgment, just awareness)

MINUTE 5: ONE THING
"Before we go -- one thing I want you to know this week:
[insert genuine, specific message]."

THAT IS IT. Five minutes. No agenda document. No PowerPoint.
Just humans checking in with humans.

-- Teachers Deserve It | teachersdeserveit.com/hub`,
  },
];

export default function LeadershipToolkit() {
  const handleDownload = (tool: typeof TOOLS[0]) => {
    const blob = new Blob([tool.content], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `TDI-${tool.title.replace(/\s+/g, '-')}.txt`;
    link.click();
  };

  return (
    <div className="bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-gray-100">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#FFF8E7' }}>
          <FileText className="w-5 h-5" style={{ color: '#E8B84B' }} />
        </div>
        <div>
          <h3 className="text-base font-bold" style={{ color: '#1e2749' }}>Leadership Toolkit</h3>
          <p className="text-xs text-gray-500">Printable tools built for school leaders</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {TOOLS.map((tool, i) => {
          const Icon = tool.icon;
          return (
            <button
              key={i}
              onClick={() => handleDownload(tool)}
              className="flex items-start gap-3 p-4 rounded-xl text-left hover:shadow-md transition-all border border-gray-100 hover:border-gray-200"
            >
              <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${tool.color}15` }}>
                <Icon size={18} style={{ color: tool.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold" style={{ color: '#1e2749' }}>{tool.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{tool.description}</p>
              </div>
              <Download size={14} className="text-gray-300 flex-shrink-0 mt-1" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
