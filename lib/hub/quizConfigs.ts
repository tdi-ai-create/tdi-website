// ── Quiz System Configuration ─────────────────────────────────────────
// Each quiz is a self-contained config: questions, answer mappings,
// result types with colors and descriptions.

export interface QuizAnswer {
  text: string
  types: string[]
}

export interface QuizQuestion {
  question: string
  answers: QuizAnswer[]
}

export interface QuizResult {
  key: string
  title: string
  subtitle: string
  description: string
  color: string
  bg: string
  icon: string  // single character displayed in the result badge
  ctaLabel?: string    // optional call-to-action button text
  ctaLink?: string     // optional call-to-action URL
}

export interface QuizConfig {
  id: string
  title: string
  shortTitle: string           // for cards and tabs
  description: string          // shown before starting
  questionCount: number
  durationLabel: string        // e.g. "2 min"
  category: 'identity' | 'needs' | 'fun'
  accentColor: string          // primary color for card visuals
  accentBg: string             // light background tint for cards
  accentGradient: string       // gradient for card header strips
  results: Record<string, QuizResult>
  questions: QuizQuestion[]
  shareMessage: (resultTitle: string, resultSubtitle: string) => string
}

// ── 1. What Kind of Educator Are You? (existing, now in unified system) ──

export const educatorTypeQuiz: QuizConfig = {
  id: 'educator_type',
  title: 'What Kind of Educator Are You?',
  shortTitle: 'Educator Type',
  description: '5 quick questions. No wrong answers. Just a fun way to see what drives you.',
  questionCount: 5,
  durationLabel: '2 min',
  category: 'identity',
  accentColor: '#1B2A4A',
  accentBg: '#E8EDF4',
  accentGradient: 'linear-gradient(135deg, #1B2A4A 0%, #38618C 100%)',
  results: {
    architect: {
      key: 'architect',
      title: 'The Architect',
      subtitle: 'You build systems that work.',
      description: 'Your classroom runs like a machine and your colleagues want your templates. You see the structure behind the chaos and you cannot help but organize it. The world needs more builders like you.',
      color: '#1B2A4A',
      bg: '#E8EDF4',
      icon: 'A',
    },
    connector: {
      key: 'connector',
      title: 'The Connector',
      subtitle: 'Relationships first, always.',
      description: 'You know every kid by name, their dog by name, and what they had for breakfast. You build trust before you build lessons. Students remember you long after they forget the content -- and that is the point.',
      color: '#2A9D8F',
      bg: '#D1FAE5',
      icon: 'C',
    },
    innovator: {
      key: 'innovator',
      title: 'The Innovator',
      subtitle: 'You tried it before anyone else.',
      description: 'Half your ideas are brilliant. The other half make great stories. You are the one who brings the new thing to the team meeting and somehow makes everyone want to try it. Education needs your restless creativity.',
      color: '#7C3AED',
      bg: '#F3E8FF',
      icon: 'I',
    },
    anchor: {
      key: 'anchor',
      title: 'The Anchor',
      subtitle: 'The one everyone leans on.',
      description: 'Steady, reliable, the person who holds it together when everything is chaos. Your students feel safe because you are safe. Your team functions because you show up. Do not underestimate how rare that is.',
      color: '#DC2626',
      bg: '#FEE2E2',
      icon: 'A',
    },
    spark: {
      key: 'spark',
      title: 'The Spark',
      subtitle: 'Energy. You bring it every day.',
      description: 'Your students do not know how you do it and honestly neither do you. You make hard things feel possible and boring things feel interesting. The room changes when you walk in -- and everyone knows it.',
      color: '#D97706',
      bg: '#FEF3C7',
      icon: 'S',
    },
    strategist: {
      key: 'strategist',
      title: 'The Strategist',
      subtitle: 'You see the big picture.',
      description: 'While everyone else is putting out fires, you are redesigning the system so fires stop starting. You think in frameworks, plan three steps ahead, and your team does not always realize how much you are carrying. They will.',
      color: '#0891B2',
      bg: '#E0F4FF',
      icon: 'S',
    },
  },
  questions: [
    {
      question: 'It is Monday morning. What is the first thing you do?',
      answers: [
        { text: 'Check my to-do list and prep materials for the week', types: ['architect', 'strategist'] },
        { text: 'Greet students at the door and check in on the ones I am worried about', types: ['connector', 'anchor'] },
        { text: 'Try out the new idea I thought of over the weekend', types: ['innovator', 'spark'] },
        { text: 'Rally my team with a quick huddle or a funny meme in the group chat', types: ['spark', 'connector'] },
      ],
    },
    {
      question: 'A new initiative drops from admin. Your reaction?',
      answers: [
        { text: 'Build a system to integrate it into what I already do', types: ['architect', 'strategist'] },
        { text: 'Think about how it will affect my students and talk to them about it', types: ['connector', 'anchor'] },
        { text: 'Get excited -- this could be interesting if I put my spin on it', types: ['innovator', 'spark'] },
        { text: 'Figure out the real goal behind it and find the most efficient path', types: ['strategist', 'architect'] },
      ],
    },
    {
      question: 'A student is struggling. Your instinct?',
      answers: [
        { text: 'Create a structured plan with checkpoints to get them back on track', types: ['architect'] },
        { text: 'Sit with them and ask what is going on outside of school', types: ['connector'] },
        { text: 'Try a completely different approach -- maybe what worked before is not working now', types: ['innovator'] },
        { text: 'Be the calm in their storm -- show up consistently so they know someone is in their corner', types: ['anchor'] },
      ],
    },
    {
      question: 'You have one free hour. You spend it on...',
      answers: [
        { text: 'Organizing my files, templates, or lesson plans', types: ['architect'] },
        { text: 'Writing a note to a student, parent, or colleague', types: ['connector'] },
        { text: 'Browsing ideas, podcasts, or something totally unrelated that might inspire a lesson', types: ['innovator', 'spark'] },
        { text: 'Planning ahead so next week is smoother than this one', types: ['strategist'] },
      ],
    },
    {
      question: 'Your colleagues describe you as...',
      answers: [
        { text: 'The most organized person in the building', types: ['architect'] },
        { text: 'The one who actually cares about every kid', types: ['connector', 'anchor'] },
        { text: 'The one with the wildest ideas that somehow work', types: ['innovator', 'spark'] },
        { text: 'The one who sees what needs to happen before anyone else does', types: ['strategist'] },
      ],
    },
  ],
  shareMessage: (title, subtitle) =>
    `I just took the TDI Educator Quiz and I am "${title}" -- ${subtitle} What kind of educator are you? Find out at teachersdeserveit.com/hub`,
}

// ── 2. What's Your Classroom Superpower? ──────────────────────────────

export const superpowerQuiz: QuizConfig = {
  id: 'superpower',
  title: "What's Your Classroom Superpower?",
  shortTitle: 'Superpower',
  description: 'Every educator has one. Yours might surprise you.',
  questionCount: 5,
  durationLabel: '2 min',
  category: 'identity',
  accentColor: '#D97706',
  accentBg: '#FEF3C7',
  accentGradient: 'linear-gradient(135deg, #D97706 0%, #F59E0B 100%)',
  results: {
    calm_force: {
      key: 'calm_force',
      title: 'The Calm Force',
      subtitle: 'You de-escalate without even trying.',
      description: 'When things get chaotic, something about your presence brings the temperature down. Students feel it. Colleagues feel it. You do not raise your voice -- you do not have to. Your calm is the most powerful tool in the room.',
      color: '#2563EB',
      bg: '#DBEAFE',
      icon: 'C',
    },
    hype_machine: {
      key: 'hype_machine',
      title: 'The Hype Machine',
      subtitle: 'You make everything feel like an event.',
      description: 'A vocab quiz? An event. A read-aloud? A production. You bring energy that makes kids want to show up. Your enthusiasm is contagious and you turn ordinary moments into memories.',
      color: '#E11D48',
      bg: '#FFE4E6',
      icon: 'H',
    },
    translator: {
      key: 'translator',
      title: 'The Translator',
      subtitle: 'You make hard things make sense.',
      description: 'Complex ideas, confusing instructions, abstract concepts -- you break them down so every kid gets it. You find the analogy, the visual, the story that clicks. Understanding is your superpower.',
      color: '#059669',
      bg: '#D1FAE5',
      icon: 'T',
    },
    safe_place: {
      key: 'safe_place',
      title: 'The Safe Place',
      subtitle: 'Kids tell you things they do not tell anyone.',
      description: 'Your classroom is the room where kids exhale. They trust you because you have earned it -- not with grand gestures but with a thousand small ones. You are the adult they will remember.',
      color: '#7C3AED',
      bg: '#F3E8FF',
      icon: 'S',
    },
    improviser: {
      key: 'improviser',
      title: 'The Improviser',
      subtitle: 'Plan B is always better than Plan A.',
      description: 'The projector breaks, a fire drill interrupts, half the class is absent -- and you pivot without missing a beat. You think on your feet and somehow the unplanned moments become the best ones.',
      color: '#D97706',
      bg: '#FEF3C7',
      icon: 'I',
    },
  },
  questions: [
    {
      question: 'The fire alarm goes off mid-lesson. When you get back, you...',
      answers: [
        { text: 'Calmly reset the room and pick up right where we left off', types: ['calm_force'] },
        { text: 'Turn it into a joke and use the energy to launch something fun', types: ['hype_machine'] },
        { text: 'Use it as a teachable moment -- connect it to whatever we were learning', types: ['translator'] },
        { text: 'Check in on the kids who look rattled before doing anything else', types: ['safe_place'] },
      ],
    },
    {
      question: 'A kid says "I don\'t get it" for the third time. You...',
      answers: [
        { text: 'Stay patient -- lower my voice, slow down, try again', types: ['calm_force'] },
        { text: 'Get dramatic -- act it out, draw it, make it ridiculous until it clicks', types: ['hype_machine'] },
        { text: 'Find a totally different way to explain it -- maybe a story or a real-world example', types: ['translator'] },
        { text: 'Pull them aside later and figure out what is really going on', types: ['safe_place'] },
      ],
    },
    {
      question: 'Your tech completely fails five minutes into class. You...',
      answers: [
        { text: 'No stress -- pivot to whiteboard or discussion without skipping a beat', types: ['calm_force', 'improviser'] },
        { text: 'Make it a competition: "Who can solve this without any tech?"', types: ['hype_machine'] },
        { text: 'Grab a marker and explain it old-school -- honestly sometimes that is better anyway', types: ['translator'] },
        { text: 'Use the downtime to have a real conversation with the class', types: ['safe_place'] },
      ],
    },
    {
      question: 'A colleague peeks into your room and says "How do you DO that?" What are they seeing?',
      answers: [
        { text: 'A room full of kids focused and calm, no drama', types: ['calm_force'] },
        { text: 'Kids cheering about... math? Science? Something they should not be this excited about', types: ['hype_machine'] },
        { text: 'A kid explaining a complex concept back to another kid using my exact analogy', types: ['translator'] },
        { text: 'A student opening up about something personal in a way that feels safe', types: ['safe_place'] },
      ],
    },
    {
      question: 'End of the year. A student writes you a note. It probably says...',
      answers: [
        { text: '"Your class was the one place I could breathe."', types: ['calm_force', 'safe_place'] },
        { text: '"I never thought I would actually like this subject."', types: ['hype_machine'] },
        { text: '"You made me feel smart."', types: ['translator'] },
        { text: '"You were the first teacher who really listened."', types: ['safe_place'] },
      ],
    },
  ],
  shareMessage: (title, subtitle) =>
    `My classroom superpower is "${title}" -- ${subtitle} What is yours? Find out at teachersdeserveit.com/hub`,
}

// ── 3. What's Your Professional Growth Style? ─────────────────────────

export const growthStyleQuiz: QuizConfig = {
  id: 'growth_style',
  title: "What's Your Professional Growth Style?",
  shortTitle: 'Growth Style',
  description: 'How do you learn best? This helps us recommend the right resources for you.',
  questionCount: 5,
  durationLabel: '2 min',
  category: 'identity',
  accentColor: '#059669',
  accentBg: '#D1FAE5',
  accentGradient: 'linear-gradient(135deg, #059669 0%, #34D399 100%)',
  results: {
    deep_diver: {
      key: 'deep_diver',
      title: 'The Deep Diver',
      subtitle: 'You go all in on one thing.',
      description: 'When something clicks, you want to know everything. You read the book, take the course, watch the webinar, and try it 10 different ways. Your depth of knowledge in your focus areas is unmatched. You are the person people come to when they want the real answer.',
      color: '#1E40AF',
      bg: '#DBEAFE',
      icon: 'D',
    },
    dabbler: {
      key: 'dabbler',
      title: 'The Explorer',
      subtitle: 'You try everything once.',
      description: 'New app? Downloaded. New strategy? Tried it Tuesday. You collect ideas like some people collect coffee mugs. Not everything sticks, but the breadth of what you have tried gives you a toolkit nobody else has.',
      color: '#059669',
      bg: '#D1FAE5',
      icon: 'E',
    },
    collaborator: {
      key: 'collaborator',
      title: 'The Collaborator',
      subtitle: 'You grow best with others.',
      description: 'A book study, a coaching conversation, a team planning session -- that is where you light up. You process by talking, learn by sharing, and your best ideas come from building on someone else\'s. The group is always smarter with you in it.',
      color: '#DB2777',
      bg: '#FCE7F3',
      icon: 'C',
    },
    reflector: {
      key: 'reflector',
      title: 'The Reflector',
      subtitle: 'You learn by looking back.',
      description: 'You do not just do the thing -- you think about the thing after. Journaling, debriefing, quiet drives home replaying the lesson. You extract more learning from one experience than most people get from five. Your growth is quiet but deep.',
      color: '#7C3AED',
      bg: '#F3E8FF',
      icon: 'R',
    },
    self_starter: {
      key: 'self_starter',
      title: 'The Self-Starter',
      subtitle: 'You do not wait for PD day.',
      description: 'You have a podcast queue, a bookmark folder full of articles, and a list of things to try. You do not need anyone to assign you growth -- you seek it out on your own terms, on your own schedule. You are your own best PD provider.',
      color: '#D97706',
      bg: '#FEF3C7',
      icon: 'S',
    },
  },
  questions: [
    {
      question: 'You just heard about a new teaching strategy. What do you do first?',
      answers: [
        { text: 'Research it -- find the study, read the book, understand the theory', types: ['deep_diver'] },
        { text: 'Try it tomorrow and see what happens', types: ['dabbler'] },
        { text: 'Text a colleague: "Have you heard about this?"', types: ['collaborator'] },
        { text: 'Think about whether it fits with what I already know works', types: ['reflector'] },
      ],
    },
    {
      question: 'Your ideal professional development looks like...',
      answers: [
        { text: 'A deep workshop on one topic with follow-up coaching', types: ['deep_diver'] },
        { text: 'A menu of quick sessions where I can sample different ideas', types: ['dabbler'] },
        { text: 'A team planning day where we learn together and build something', types: ['collaborator'] },
        { text: 'Time to observe, process, and make my own plan', types: ['reflector', 'self_starter'] },
      ],
    },
    {
      question: 'You have a free Saturday morning. How do you recharge professionally?',
      answers: [
        { text: 'Read or listen to something I have been meaning to get to', types: ['deep_diver', 'self_starter'] },
        { text: 'Browse Pinterest, TikTok, or Instagram for classroom ideas', types: ['dabbler'] },
        { text: 'Meet up with teacher friends to swap stories and ideas', types: ['collaborator'] },
        { text: 'Journal or just think -- process the week and plan for the next one', types: ['reflector'] },
      ],
    },
    {
      question: 'A lesson totally flopped. Your next move?',
      answers: [
        { text: 'Figure out exactly why -- was it the content, the delivery, the timing?', types: ['deep_diver', 'reflector'] },
        { text: 'Scrap it and try something completely different', types: ['dabbler'] },
        { text: 'Talk to a colleague: "Has this happened to you? What did you do?"', types: ['collaborator'] },
        { text: 'Sit with it for a day, then come back with a revised plan', types: ['reflector'] },
      ],
    },
    {
      question: 'When you find a resource you love, you...',
      answers: [
        { text: 'Go down the rabbit hole -- read everything by that author or creator', types: ['deep_diver'] },
        { text: 'Save it and move on -- I have 47 other tabs open', types: ['dabbler', 'self_starter'] },
        { text: 'Share it immediately with my team or PLC', types: ['collaborator'] },
        { text: 'Come back to it later when I can really sit with it', types: ['reflector'] },
      ],
    },
  ],
  shareMessage: (title, subtitle) =>
    `My professional growth style is "${title}" -- ${subtitle} What is yours? Find out at teachersdeserveit.com/hub`,
}

// ── 4. What's Your Tech Comfort Zone? ─────────────────────────────────

export const techComfortQuiz: QuizConfig = {
  id: 'tech_comfort',
  title: "What's Your Tech Comfort Zone?",
  shortTitle: 'Tech Style',
  description: 'No judgment. Just helps us know what to recommend.',
  questionCount: 5,
  durationLabel: '2 min',
  category: 'identity',
  accentColor: '#7C3AED',
  accentBg: '#F3E8FF',
  accentGradient: 'linear-gradient(135deg, #7C3AED 0%, #A78BFA 100%)',
  results: {
    analog_heart: {
      key: 'analog_heart',
      title: 'Analog at Heart',
      subtitle: 'Paper, pencils, and real conversations.',
      description: 'Tech is fine but it is not your thing -- and that is completely okay. Your strength is in the human connection, the handwritten note, the face-to-face moment. Some of the best teaching happens without a screen.',
      color: '#92400E',
      bg: '#FEF3C7',
      icon: 'A',
    },
    cautious_curious: {
      key: 'cautious_curious',
      title: 'Cautiously Curious',
      subtitle: 'Show me it works and I am in.',
      description: 'You are not anti-tech -- you just want proof before you invest the time. You have been burned by the "next big thing" before. Once you see something work, though, you commit fully and use it well.',
      color: '#2563EB',
      bg: '#DBEAFE',
      icon: 'C',
    },
    steady_user: {
      key: 'steady_user',
      title: 'The Steady User',
      subtitle: 'You have your tools and they work.',
      description: 'Google Slides, your LMS, maybe a few favorites -- you know what works and you use it consistently. You are not chasing every new app but you are far from a beginner. Reliability is your tech superpower.',
      color: '#059669',
      bg: '#D1FAE5',
      icon: 'S',
    },
    tech_adventurer: {
      key: 'tech_adventurer',
      title: 'The Tech Adventurer',
      subtitle: 'First to try it, first to share it.',
      description: 'New tool? You already have an account. AI update? You tested it at lunch. You love experimenting and you are the person your team calls when they need help with anything digital. Your enthusiasm makes tech approachable for everyone around you.',
      color: '#7C3AED',
      bg: '#F3E8FF',
      icon: 'T',
    },
  },
  questions: [
    {
      question: 'A colleague mentions a new app for the classroom. Your first thought?',
      answers: [
        { text: 'I will stick with what I know -- too many apps, not enough time', types: ['analog_heart'] },
        { text: 'Interesting... but does it actually work? Show me first', types: ['cautious_curious'] },
        { text: 'I will look into it when I have a minute -- maybe it replaces something I already use', types: ['steady_user'] },
        { text: 'Already downloaded it -- want me to show you?', types: ['tech_adventurer'] },
      ],
    },
    {
      question: 'Your school gets a new platform. How do you feel?',
      answers: [
        { text: 'Honestly? A little stressed. Another thing to learn', types: ['analog_heart'] },
        { text: 'Cautiously optimistic -- I will wait and see how others like it first', types: ['cautious_curious'] },
        { text: 'Fine -- I will figure it out and add it to my workflow', types: ['steady_user'] },
        { text: 'Excited -- I love exploring new tools', types: ['tech_adventurer'] },
      ],
    },
    {
      question: 'How do you feel about AI in education?',
      answers: [
        { text: 'Honestly not sure what to think yet -- it feels overwhelming', types: ['analog_heart'] },
        { text: 'Curious but cautious -- I want to see real examples before I try it', types: ['cautious_curious'] },
        { text: 'I have tried a few things -- some useful, some not', types: ['steady_user'] },
        { text: 'I am already using it for lesson planning, feedback, and more', types: ['tech_adventurer'] },
      ],
    },
    {
      question: 'Your go-to way to share something with students is...',
      answers: [
        { text: 'Printed handouts or writing it on the board', types: ['analog_heart'] },
        { text: 'Whatever the school already uses -- I keep it simple', types: ['cautious_curious', 'steady_user'] },
        { text: 'A shared doc or slide deck I have used all year', types: ['steady_user'] },
        { text: 'It depends -- I like mixing it up with different tools', types: ['tech_adventurer'] },
      ],
    },
    {
      question: 'When tech breaks in class, you...',
      answers: [
        { text: 'Secretly relieved -- back to basics', types: ['analog_heart'] },
        { text: 'A little flustered but I have a backup plan', types: ['cautious_curious'] },
        { text: 'Troubleshoot for a minute, then pivot', types: ['steady_user'] },
        { text: 'Fix it on the fly and keep going', types: ['tech_adventurer'] },
      ],
    },
  ],
  shareMessage: (title, subtitle) =>
    `My ed-tech personality is "${title}" -- ${subtitle} What is yours? Find out at teachersdeserveit.com/hub`,
}

// ── 5. What Does Your Classroom Need Right Now? ───────────────────────

export const classroomNeedsQuiz: QuizConfig = {
  id: 'classroom_needs',
  title: 'What Does Your Classroom Need Right Now?',
  shortTitle: 'Classroom Pulse',
  description: 'A quick pulse check to help us point you to the right tools.',
  questionCount: 5,
  durationLabel: '2 min',
  category: 'needs',
  accentColor: '#2563EB',
  accentBg: '#DBEAFE',
  accentGradient: 'linear-gradient(135deg, #2563EB 0%, #60A5FA 100%)',
  results: {
    engagement_boost: {
      key: 'engagement_boost',
      title: 'Engagement Boost',
      subtitle: 'Your kids need a spark.',
      description: 'The energy has dipped and you can feel it. Students are going through the motions but the fire is not there. You need strategies that wake things up -- not gimmicks, but real ways to reignite curiosity and participation.',
      color: '#D97706',
      bg: '#FEF3C7',
      icon: 'E',
    },
    calm_and_structure: {
      key: 'calm_and_structure',
      title: 'Calm and Structure',
      subtitle: 'Things need to settle down.',
      description: 'Behaviors are escalating, transitions are messy, and the vibe is off. You need routines, resets, and strategies that bring the calm back. Not punishment -- just structure that helps everyone breathe.',
      color: '#2563EB',
      bg: '#DBEAFE',
      icon: 'C',
    },
    connection_repair: {
      key: 'connection_repair',
      title: 'Connection Repair',
      subtitle: 'The relationships need attention.',
      description: 'Something feels disconnected -- between you and students, between the students themselves, or between your classroom and families. Right now the most important thing is rebuilding trust and strengthening bonds.',
      color: '#DC2626',
      bg: '#FEE2E2',
      icon: 'R',
    },
    teacher_survival: {
      key: 'teacher_survival',
      title: 'Teacher Survival Mode',
      subtitle: 'You need to take care of YOU.',
      description: 'The classroom might actually be fine -- it is you who is running on empty. Before you can give more to your students, you need tools that help you recover, reset boundaries, and remember why you do this.',
      color: '#7C3AED',
      bg: '#F3E8FF',
      icon: 'S',
    },
    fresh_start: {
      key: 'fresh_start',
      title: 'Fresh Start Energy',
      subtitle: 'Time to shake things up.',
      description: 'Nothing is broken, but nothing is exciting either. You are in a rut and you know it. You need fresh ideas, a new routine, a different angle -- something to make tomorrow feel different from today.',
      color: '#059669',
      bg: '#D1FAE5',
      icon: 'F',
    },
  },
  questions: [
    {
      question: 'When you picture your classroom right now, the first word that comes to mind is...',
      answers: [
        { text: 'Flat -- the energy just is not there', types: ['engagement_boost'] },
        { text: 'Chaotic -- too many fires to put out', types: ['calm_and_structure'] },
        { text: 'Disconnected -- something feels off between us', types: ['connection_repair'] },
        { text: 'Exhausting -- I am the one struggling most', types: ['teacher_survival'] },
      ],
    },
    {
      question: 'If you could wave a magic wand, you would change...',
      answers: [
        { text: 'Student motivation -- I want them to actually care', types: ['engagement_boost'] },
        { text: 'Transitions and behavior -- I need things to run smoother', types: ['calm_and_structure'] },
        { text: 'How students treat each other', types: ['connection_repair'] },
        { text: 'My own energy level -- I am running on fumes', types: ['teacher_survival'] },
      ],
    },
    {
      question: 'Your students would probably say your class is...',
      answers: [
        { text: 'Fine but kind of boring lately', types: ['engagement_boost', 'fresh_start'] },
        { text: 'Loud and a little wild', types: ['calm_and_structure'] },
        { text: 'Okay but we do not really know each other', types: ['connection_repair'] },
        { text: 'Good but our teacher seems tired', types: ['teacher_survival'] },
      ],
    },
    {
      question: 'The hardest part of your day right now is...',
      answers: [
        { text: 'Getting kids to participate or care about the work', types: ['engagement_boost'] },
        { text: 'Managing behaviors and keeping things on track', types: ['calm_and_structure'] },
        { text: 'Dealing with conflicts or students shutting down', types: ['connection_repair'] },
        { text: 'Just getting through it -- I am counting the hours', types: ['teacher_survival'] },
      ],
    },
    {
      question: 'What would help you most right now?',
      answers: [
        { text: 'A fresh activity or strategy that gets everyone involved', types: ['engagement_boost', 'fresh_start'] },
        { text: 'A new routine or system I can start tomorrow', types: ['calm_and_structure'] },
        { text: 'A conversation starter or community-building exercise', types: ['connection_repair'] },
        { text: 'Permission to take a breath and a tool that makes something easier', types: ['teacher_survival'] },
      ],
    },
  ],
  shareMessage: (title, subtitle) =>
    `I just checked in on my classroom needs and got "${title}" -- ${subtitle} Check yours at teachersdeserveit.com/hub`,
}

// ── 6. What Season Are You In? ────────────────────────────────────────

export const careerSeasonQuiz: QuizConfig = {
  id: 'career_season',
  title: 'What Season Are You In?',
  shortTitle: 'Career Season',
  description: 'Your career has seasons. Knowing yours helps you find your next step.',
  questionCount: 5,
  durationLabel: '2 min',
  category: 'identity',
  accentColor: '#DC2626',
  accentBg: '#FEE2E2',
  accentGradient: 'linear-gradient(135deg, #DC2626 0%, #F87171 100%)',
  results: {
    spring: {
      key: 'spring',
      title: 'Spring -- New Growth',
      subtitle: 'Everything is new and that is both exciting and terrifying.',
      description: 'You are in the early years or a brand new role. Every day teaches you something. You are building your identity as an educator and figuring out what kind of teacher you want to be. The learning curve is steep but so is the potential.',
      color: '#059669',
      bg: '#D1FAE5',
      icon: 'S',
    },
    summer: {
      key: 'summer',
      title: 'Summer -- Full Bloom',
      subtitle: 'You are in your groove and it shows.',
      description: 'You have found your rhythm. You know what works, you have your systems, and your confidence is solid. This is the season of mastery -- you are not just surviving, you are thriving. Enjoy this. You earned it.',
      color: '#D97706',
      bg: '#FEF3C7',
      icon: 'S',
    },
    autumn: {
      key: 'autumn',
      title: 'Autumn -- Shifting',
      subtitle: 'Something is changing and you feel it.',
      description: 'Maybe you are eyeing leadership. Maybe you are questioning whether this is still the right fit. Maybe you want to mentor others or try something new. Autumn is not decline -- it is transition. Something beautiful is coming if you let it.',
      color: '#DC2626',
      bg: '#FEE2E2',
      icon: 'A',
    },
    winter: {
      key: 'winter',
      title: 'Winter -- Rest and Renewal',
      subtitle: 'You need to recharge before the next chapter.',
      description: 'You have given a lot. Maybe too much. This season is about restoration -- not quitting, not giving up, but being honest about what you need. The best growth often follows the deepest rest. Take the time.',
      color: '#2563EB',
      bg: '#DBEAFE',
      icon: 'W',
    },
  },
  questions: [
    {
      question: 'When someone asks "How is teaching going?" your honest answer is...',
      answers: [
        { text: 'Overwhelming but exciting -- I am learning so much', types: ['spring'] },
        { text: 'Really good actually -- I feel like I know what I am doing', types: ['summer'] },
        { text: 'Fine... but I have been thinking about what is next', types: ['autumn'] },
        { text: 'Honestly? I am tired. I need something to change', types: ['winter'] },
      ],
    },
    {
      question: 'On Sunday night, you feel...',
      answers: [
        { text: 'Nervous but motivated -- I want to do well', types: ['spring'] },
        { text: 'Ready -- I know what the week looks like and I am prepared', types: ['summer'] },
        { text: 'Restless -- like I should be doing something different', types: ['autumn'] },
        { text: 'Dread -- I need a longer break than a weekend', types: ['winter'] },
      ],
    },
    {
      question: 'Right now you are most focused on...',
      answers: [
        { text: 'Figuring out the basics -- management, planning, surviving', types: ['spring'] },
        { text: 'Refining what I do and mentoring others', types: ['summer'] },
        { text: 'Exploring new roles, certifications, or paths', types: ['autumn'] },
        { text: 'Getting through the day and finding space to breathe', types: ['winter'] },
      ],
    },
    {
      question: 'Your relationship with your job right now feels like...',
      answers: [
        { text: 'A first date -- exciting, awkward, full of potential', types: ['spring'] },
        { text: 'A strong partnership -- we know each other well', types: ['summer'] },
        { text: 'A crossroads -- I love it but I am curious about other paths', types: ['autumn'] },
        { text: 'A long-term relationship that needs some space', types: ['winter'] },
      ],
    },
    {
      question: 'The kind of support you need most right now is...',
      answers: [
        { text: 'A mentor or guide who has been where I am', types: ['spring'] },
        { text: 'A challenge or new responsibility to stretch me', types: ['summer'] },
        { text: 'Someone to help me figure out my next move', types: ['autumn'] },
        { text: 'Permission to rest without guilt', types: ['winter'] },
      ],
    },
  ],
  shareMessage: (title, subtitle) =>
    `I took TDI's Career Season quiz and I am in "${title}" -- ${subtitle} What season are you in? Find out at teachersdeserveit.com/hub`,
}

// ── 7. What's Draining Your Energy? ───────────────────────────────────

export const energyDrainQuiz: QuizConfig = {
  id: 'energy_drain',
  title: "What's Draining Your Energy?",
  shortTitle: 'Energy Check',
  description: 'A self-care check-in disguised as a quiz. Because naming it is the first step.',
  questionCount: 5,
  durationLabel: '2 min',
  category: 'needs',
  accentColor: '#0891B2',
  accentBg: '#E0F4FF',
  accentGradient: 'linear-gradient(135deg, #0891B2 0%, #22D3EE 100%)',
  results: {
    overcommitted: {
      key: 'overcommitted',
      title: 'The Overcommitter',
      subtitle: 'You said yes to everything. Again.',
      description: 'You care deeply and it shows -- in the 47 commitments you are juggling. Committees, extra duties, helping colleagues, staying late. Your heart is huge but your calendar is unsustainable. The bravest thing you can do right now is say no to one thing.',
      color: '#DC2626',
      bg: '#FEE2E2',
      icon: 'O',
    },
    invisible_labor: {
      key: 'invisible_labor',
      title: 'Invisible Labor',
      subtitle: 'You are doing work nobody sees.',
      description: 'The emotional labor, the behind-the-scenes planning, the holding it together for everyone else -- it is exhausting and nobody is counting it. You are not just teaching content; you are carrying people. That work deserves to be seen.',
      color: '#7C3AED',
      bg: '#F3E8FF',
      icon: 'I',
    },
    decision_fatigue: {
      key: 'decision_fatigue',
      title: 'Decision Fatigue',
      subtitle: 'Too many choices, not enough brain.',
      description: 'By 10 AM you have already made 300 decisions. What to teach, how to handle that behavior, which email to answer first. Your brain is full and it is only Tuesday. You need systems that reduce the number of choices, not add more.',
      color: '#2563EB',
      bg: '#DBEAFE',
      icon: 'D',
    },
    isolation: {
      key: 'isolation',
      title: 'Running Solo',
      subtitle: 'You are doing this alone and it shows.',
      description: 'Whether you are the only one in your role, on an island in your building, or just feeling unsupported -- isolation is draining you. Teaching was never meant to be a solo act. You need your people.',
      color: '#059669',
      bg: '#D1FAE5',
      icon: 'R',
    },
    purpose_drift: {
      key: 'purpose_drift',
      title: 'Purpose Drift',
      subtitle: 'You forgot why you started.',
      description: 'Somewhere between the paperwork, the mandates, and the meetings, the thing that made you love this job got buried. It is still there -- you just cannot feel it right now. You do not need a new career. You need to reconnect with the reason you chose this one.',
      color: '#D97706',
      bg: '#FEF3C7',
      icon: 'P',
    },
  },
  questions: [
    {
      question: 'It is 4 PM and you are still at school. Why?',
      answers: [
        { text: 'I said I would help with three different things and now I am stuck', types: ['overcommitted'] },
        { text: 'Doing the stuff nobody else thinks about -- organizing, prepping, cleaning up', types: ['invisible_labor'] },
        { text: 'I cannot figure out what to prioritize so I just... stayed', types: ['decision_fatigue'] },
        { text: 'Nobody else was going to do it, so here I am', types: ['isolation'] },
      ],
    },
    {
      question: 'The thing that makes you most frustrated at work right now is...',
      answers: [
        { text: 'Having no time for the things that actually matter to me', types: ['overcommitted'] },
        { text: 'Doing a ton of work that nobody notices or thanks me for', types: ['invisible_labor'] },
        { text: 'Constantly being asked to figure things out with no guidance', types: ['decision_fatigue'] },
        { text: 'Feeling like I have no one to talk to who really gets it', types: ['isolation'] },
      ],
    },
    {
      question: 'When you get home after a hard day, you...',
      answers: [
        { text: 'Immediately start on the work I brought home', types: ['overcommitted'] },
        { text: 'Vent to someone about how much I did that nobody saw', types: ['invisible_labor'] },
        { text: 'Stare at nothing -- my brain is absolutely fried', types: ['decision_fatigue'] },
        { text: 'Feel lonely even if I am not alone', types: ['isolation', 'purpose_drift'] },
      ],
    },
    {
      question: 'If you are being honest, the hardest part is...',
      answers: [
        { text: 'I do not know how to stop saying yes', types: ['overcommitted'] },
        { text: 'Nobody sees how hard I am working', types: ['invisible_labor'] },
        { text: 'Every single thing requires a decision and I am out of decisions', types: ['decision_fatigue'] },
        { text: 'I have lost touch with why I do this', types: ['purpose_drift'] },
      ],
    },
    {
      question: 'What would actually help you right now?',
      answers: [
        { text: 'A way to cut my to-do list in half without guilt', types: ['overcommitted'] },
        { text: 'Someone to say "I see everything you are doing and it matters"', types: ['invisible_labor'] },
        { text: 'A simple system that makes at least one thing automatic', types: ['decision_fatigue'] },
        { text: 'A community or partner who truly gets this work', types: ['isolation'] },
      ],
    },
  ],
  shareMessage: (title, subtitle) =>
    `I just did TDI's energy check-in and discovered "${title}" -- ${subtitle} Check yours at teachersdeserveit.com/hub`,
}

// ── 8. Should I Become a TDI Creator? ─────────────────────────────────

export const creatorQuiz: QuizConfig = {
  id: 'creator_ready',
  title: 'Should I Become a TDI Creator?',
  shortTitle: 'Creator Ready?',
  description: 'Curious about creating content for educators? Find out if it is your next move.',
  questionCount: 5,
  durationLabel: '2 min',
  category: 'fun',
  accentColor: '#E8B84B',
  accentBg: '#FFF8E7',
  accentGradient: 'linear-gradient(135deg, #E8B84B 0%, #F59E0B 50%, #D97706 100%)',
  results: {
    born_creator: {
      key: 'born_creator',
      title: 'Born Creator',
      subtitle: 'You were made for this.',
      description: 'You have the expertise, the passion, and the voice. You are already the person your colleagues come to for ideas and resources. The only thing missing is a platform -- and TDI has one waiting for you. Seriously. Apply.',
      color: '#D97706',
      bg: '#FEF3C7',
      icon: 'B',
      ctaLabel: 'Apply to Create',
      ctaLink: '/hub/champion',
    },
    hidden_expert: {
      key: 'hidden_expert',
      title: 'The Hidden Expert',
      subtitle: 'You know more than you think.',
      description: 'You probably do not think of yourself as a "content creator" -- but you have been creating things for years. Lesson plans, systems, strategies that work. The stuff in your Google Drive could genuinely help thousands of teachers. You just need someone to say: it is time.',
      color: '#7C3AED',
      bg: '#F3E8FF',
      icon: 'H',
      ctaLabel: 'Learn More About Creating',
      ctaLink: '/hub/champion',
    },
    collaborator_creator: {
      key: 'collaborator_creator',
      title: 'The Collaborator',
      subtitle: 'You create best with others.',
      description: 'Solo content creation is not your thing -- and that is totally fine. You shine when you are co-building, brainstorming, or supporting someone else\'s vision. TDI has collaborative creator opportunities too. If you have a partner in mind, even better.',
      color: '#DB2777',
      bg: '#FCE7F3',
      icon: 'C',
      ctaLabel: 'Explore Creator Options',
      ctaLink: '/hub/champion',
    },
    future_creator: {
      key: 'future_creator',
      title: 'Future Creator',
      subtitle: 'Not yet -- but soon.',
      description: 'You are still building your toolkit and that is a great place to be. Keep exploring, keep learning, keep collecting ideas. When you are ready to share what you know, TDI will be here. In the meantime, keep taking courses and trying tools -- your future content is being shaped right now.',
      color: '#059669',
      bg: '#D1FAE5',
      icon: 'F',
    },
    cheerleader: {
      key: 'cheerleader',
      title: 'The Biggest Fan',
      subtitle: 'You lift up other creators.',
      description: 'Creating is not calling your name right now -- but sharing, recommending, and championing great content absolutely is. You are the person who tells every teacher you know about the thing that changed your practice. That role matters more than you know. Keep sharing.',
      color: '#2563EB',
      bg: '#DBEAFE',
      icon: 'F',
    },
  },
  questions: [
    {
      question: 'A colleague says "How do you do that?" Your reaction?',
      answers: [
        { text: 'I pull up my template and walk them through it step by step', types: ['born_creator', 'hidden_expert'] },
        { text: 'I suggest we sit down together and figure out a version that works for them', types: ['collaborator_creator'] },
        { text: 'I share the resource that helped me learn it in the first place', types: ['cheerleader'] },
        { text: 'I am flattered but honestly still figuring it out myself', types: ['future_creator'] },
      ],
    },
    {
      question: 'What is on your computer right now?',
      answers: [
        { text: 'Folders full of templates, lesson plans, and systems I built myself', types: ['born_creator', 'hidden_expert'] },
        { text: 'Shared docs from projects I have built with teammates', types: ['collaborator_creator'] },
        { text: 'A bookmarks folder of amazing things other people made', types: ['cheerleader'] },
        { text: 'Honestly kind of a mess -- I am still figuring out my workflow', types: ['future_creator'] },
      ],
    },
    {
      question: 'Someone says "You should make a course about that." You think...',
      answers: [
        { text: 'I have actually thought about that -- I even have an outline started', types: ['born_creator'] },
        { text: 'Maybe? I have never thought of myself as a "course creator" but I do know this stuff', types: ['hidden_expert'] },
        { text: 'Only if I could do it with someone -- I would not want to do it alone', types: ['collaborator_creator'] },
        { text: 'That is really nice but I do not think I am there yet', types: ['future_creator'] },
      ],
    },
    {
      question: 'When you find something that works in your classroom, you...',
      answers: [
        { text: 'Document it so I can share it or use it again', types: ['born_creator'] },
        { text: 'Mention it casually but I do not think to package it up', types: ['hidden_expert'] },
        { text: 'Immediately text my team and say "you have to try this"', types: ['collaborator_creator', 'cheerleader'] },
        { text: 'Feel good about it but move on to the next challenge', types: ['future_creator'] },
      ],
    },
    {
      question: 'What excites you most about the idea of creating for TDI?',
      answers: [
        { text: 'Reaching thousands of teachers with something I built', types: ['born_creator'] },
        { text: 'Finally sharing the stuff that has been sitting in my drive for years', types: ['hidden_expert'] },
        { text: 'Working with other passionate educators on something meaningful', types: ['collaborator_creator'] },
        { text: 'Honestly I am more excited about learning from other creators right now', types: ['future_creator', 'cheerleader'] },
      ],
    },
  ],
  shareMessage: (title, subtitle) =>
    `I took TDI's Creator Quiz and got "${title}" -- ${subtitle} Should you become a TDI creator? Find out at teachersdeserveit.com/hub`,
}

// ── 9. What's Your Communication Style? ─────────────────────────────

export const communicationStyleQuiz: QuizConfig = {
  id: 'communication_style',
  title: "What's Your Communication Style?",
  shortTitle: 'Communication Style',
  description: 'How do you handle the tough conversations? 10 questions to find your default mode.',
  questionCount: 10,
  durationLabel: '3 min',
  category: 'identity',
  accentColor: '#22B8BD',
  accentBg: '#E0F7F8',
  accentGradient: 'linear-gradient(135deg, #22B8BD 0%, #5EEAD4 100%)',
  results: {
    fixer: {
      key: 'fixer',
      title: 'The Fixer',
      subtitle: 'You jump to solutions.',
      description: 'Your instinct is to make it better right now. When someone brings you a problem, your brain immediately starts building a plan. Strength: people trust you to act. Growth edge: sometimes people need to be heard before they need help.',
      color: '#0891B2',
      bg: '#E0F7F8',
      icon: 'F',
    },
    listener: {
      key: 'listener',
      title: 'The Listener',
      subtitle: 'You lead with empathy and space.',
      description: 'You are the person people seek out when they need to talk. You do not rush to fill silence and you do not jump to fix. Strength: people feel safe with you. Growth edge: sometimes clarity requires directness, even when it feels uncomfortable.',
      color: '#7C3AED',
      bg: '#F3E8FF',
      icon: 'L',
    },
    redirector: {
      key: 'redirector',
      title: 'The Redirector',
      subtitle: 'You reframe and pivot.',
      description: 'Tension rises and you instinctively find a way to shift the energy. You reframe, ask a different question, or find the angle nobody else saw. Strength: you defuse tension naturally. Growth edge: some conversations need to stay in the discomfort to reach resolution.',
      color: '#D97706',
      bg: '#FEF3C7',
      icon: 'R',
    },
    direct: {
      key: 'direct',
      title: 'The Direct Dealer',
      subtitle: 'You name it clearly.',
      description: 'No sugarcoating, no dancing around the issue. You say what needs to be said because you respect people enough to be honest. Strength: people always know where they stand. Growth edge: delivery matters as much as content.',
      color: '#DC2626',
      bg: '#FEE2E2',
      icon: 'D',
    },
  },
  questions: [
    {
      question: 'A colleague is venting about a frustrating situation. You...',
      answers: [
        { text: 'Start brainstorming solutions before they finish talking', types: ['fixer'] },
        { text: 'Listen quietly and let them get it all out', types: ['listener'] },
        { text: 'Gently reframe the situation to help them see another angle', types: ['redirector'] },
        { text: 'Ask them directly: "What do you actually want to do about it?"', types: ['direct'] },
      ],
    },
    {
      question: 'You need to give tough feedback to someone on your team. Your approach?',
      answers: [
        { text: 'Lead with a specific suggestion for how to fix the issue', types: ['fixer'] },
        { text: 'Start by asking how they think things are going', types: ['listener'] },
        { text: 'Frame the feedback around a shared goal so it feels collaborative', types: ['redirector'] },
        { text: 'Say it clearly, kindly, and without unnecessary padding', types: ['direct'] },
      ],
    },
    {
      question: 'A parent emails you with a complaint. Your first instinct is to...',
      answers: [
        { text: 'Reply with a plan of action and next steps', types: ['fixer'] },
        { text: 'Acknowledge their feelings and ask if they want to talk more', types: ['listener'] },
        { text: 'Reframe the concern to highlight what is going well alongside the issue', types: ['redirector'] },
        { text: 'Address the concern head-on with facts and transparency', types: ['direct'] },
      ],
    },
    {
      question: 'Two colleagues are in a conflict. You step in by...',
      answers: [
        { text: 'Proposing a compromise or solution that could work for both', types: ['fixer'] },
        { text: 'Giving each person space to share their side without interruption', types: ['listener'] },
        { text: 'Shifting the conversation from blame to shared purpose', types: ['redirector'] },
        { text: 'Naming the tension honestly: "Here is what I am seeing"', types: ['direct'] },
      ],
    },
    {
      question: 'In a staff meeting, an unpopular decision is announced. You...',
      answers: [
        { text: 'Immediately think of ways to make it work better for your team', types: ['fixer'] },
        { text: 'Notice who looks upset and check in with them after', types: ['listener'] },
        { text: 'Try to find the reasoning behind the decision and share that perspective', types: ['redirector'] },
        { text: 'Ask the hard question that everyone is thinking but nobody will say', types: ['direct'] },
      ],
    },
    {
      question: 'A student is upset and refusing to work. Your move?',
      answers: [
        { text: 'Offer an alternative task or modified assignment right away', types: ['fixer'] },
        { text: 'Sit near them quietly and wait until they are ready to talk', types: ['listener'] },
        { text: 'Redirect the moment by changing the activity or environment', types: ['redirector'] },
        { text: 'Privately and calmly say: "I can see something is wrong. Talk to me."', types: ['direct'] },
      ],
    },
    {
      question: 'You disagree with your principal about a new policy. You...',
      answers: [
        { text: 'Bring a revised version of the policy that addresses your concerns', types: ['fixer'] },
        { text: 'Ask questions to understand their perspective before sharing yours', types: ['listener'] },
        { text: 'Find common ground and build your case from there', types: ['redirector'] },
        { text: 'Schedule a meeting and state your position respectfully but clearly', types: ['direct'] },
      ],
    },
    {
      question: 'Someone takes credit for your idea in a meeting. You...',
      answers: [
        { text: 'Let it go and focus on making the idea succeed regardless', types: ['fixer'] },
        { text: 'Process it internally and maybe mention it privately later', types: ['listener'] },
        { text: 'Find a natural way to reference your original contribution', types: ['redirector'] },
        { text: 'Say it in the moment: "Thanks for building on what I shared earlier"', types: ['direct'] },
      ],
    },
    {
      question: 'Your team is stuck on a difficult decision. You help by...',
      answers: [
        { text: 'Laying out the options and recommending one', types: ['fixer'] },
        { text: 'Making sure everyone has been heard before anyone decides', types: ['listener'] },
        { text: 'Asking a question that shifts the group toward a new perspective', types: ['redirector'] },
        { text: 'Cutting through the noise: "Here is what I think we should do and why"', types: ['direct'] },
      ],
    },
    {
      question: 'After a tough conversation, you feel most satisfied when...',
      answers: [
        { text: 'We left with a clear action plan', types: ['fixer'] },
        { text: 'The other person felt truly heard', types: ['listener'] },
        { text: 'The tension dissolved and we found a better way to see the issue', types: ['redirector'] },
        { text: 'We said what needed to be said, even though it was hard', types: ['direct'] },
      ],
    },
  ],
  shareMessage: (title, subtitle) =>
    `My communication style is "${title}" -- ${subtitle} What is yours? Find out at teachersdeserveit.com/hub`,
}

// ── 10. Back to School Readiness Check ──────────────────────────────

export const btsReadinessQuiz: QuizConfig = {
  id: 'bts_readiness',
  title: 'Back to School Readiness Check',
  shortTitle: 'BTS Readiness',
  description: 'A quick self-assessment across the domains that matter most for day one.',
  questionCount: 10,
  durationLabel: '3 min',
  category: 'needs',
  accentColor: '#F59E0B',
  accentBg: '#FEF3C7',
  accentGradient: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)',
  results: {
    ready_to_go: {
      key: 'ready_to_go',
      title: 'Ready to Go',
      subtitle: 'You are set for day one.',
      description: 'Your routines are planned, your space is set, and you have a first-week game plan. You have put in the work and it shows. Just remember to leave room for the unexpected. The best first weeks have structure and flexibility.',
      color: '#059669',
      bg: '#D1FAE5',
      icon: 'R',
    },
    almost_there: {
      key: 'almost_there',
      title: 'Almost There',
      subtitle: 'A few key areas need attention.',
      description: 'You have the big things covered but a few key areas need attention before day one. That is normal. Focus there and you will feel solid. Do not try to perfect everything. Nail the essentials and give yourself grace on the rest.',
      color: '#2563EB',
      bg: '#DBEAFE',
      icon: 'A',
    },
    building_momentum: {
      key: 'building_momentum',
      title: 'Building Momentum',
      subtitle: 'Ideas need to become plans.',
      description: 'You have ideas but need to turn them into plans. That gap between thinking and doing is where the stress lives. Pick the 3 most important things and do those well. Everything else can wait. Seriously.',
      color: '#D97706',
      bg: '#FEF3C7',
      icon: 'B',
    },
    fresh_start: {
      key: 'fresh_start',
      title: 'Fresh Start',
      subtitle: 'Starting from scratch is valid.',
      description: 'You are starting from scratch and that is OK. New year, new approach. Maybe new school, new grade, new role. Focus on relationships first, routines second, content third. The curriculum will be there. The kids need you present.',
      color: '#7C3AED',
      bg: '#F3E8FF',
      icon: 'F',
    },
  },
  questions: [
    {
      question: 'Your physical classroom or workspace. Where are you?',
      answers: [
        { text: 'Set up and ready. I could open the doors tomorrow', types: ['ready_to_go'] },
        { text: 'Mostly done. A few things still need organizing', types: ['almost_there'] },
        { text: 'I have a vision but have not started setting up yet', types: ['building_momentum'] },
        { text: 'I do not even have access to my room yet or I am in a new space', types: ['fresh_start'] },
      ],
    },
    {
      question: 'First-week routines and procedures. How confident are you?',
      answers: [
        { text: 'I have my routines planned and practiced in my head', types: ['ready_to_go'] },
        { text: 'I know the big ones. A few still need to be finalized', types: ['almost_there'] },
        { text: 'I have a general idea but nothing written down yet', types: ['building_momentum'] },
        { text: 'I am not sure what routines I even need this year', types: ['fresh_start'] },
      ],
    },
    {
      question: 'Your first week of lesson plans. Status?',
      answers: [
        { text: 'Planned, prepped, and materials are ready', types: ['ready_to_go'] },
        { text: 'Outlined but not fully fleshed out', types: ['almost_there'] },
        { text: 'I know the topics but have not planned the actual lessons', types: ['building_momentum'] },
        { text: 'I am still figuring out what I am teaching', types: ['fresh_start'] },
      ],
    },
    {
      question: 'Relationship-building plans for the first week?',
      answers: [
        { text: 'I have specific activities and get-to-know-you strategies ready', types: ['ready_to_go'] },
        { text: 'I know I want to prioritize it but need to choose my activities', types: ['almost_there'] },
        { text: 'I plan to wing it and just be present', types: ['building_momentum'] },
        { text: 'Honestly this is where I need the most help', types: ['fresh_start'] },
      ],
    },
    {
      question: 'Communication with families. Where do you stand?',
      answers: [
        { text: 'Welcome letters or emails are drafted and ready to send', types: ['ready_to_go'] },
        { text: 'I know what I want to say but have not written it yet', types: ['almost_there'] },
        { text: 'I will get to it once school starts', types: ['building_momentum'] },
        { text: 'I am still figuring out my communication system', types: ['fresh_start'] },
      ],
    },
    {
      question: 'Your own mental and emotional readiness. Be honest.',
      answers: [
        { text: 'Excited and energized. I feel good about this year', types: ['ready_to_go'] },
        { text: 'A mix of excitement and anxiety but mostly positive', types: ['almost_there'] },
        { text: 'Anxious. There is a lot I still need to figure out', types: ['building_momentum'] },
        { text: 'Dreading it or feeling overwhelmed. I need support', types: ['fresh_start'] },
      ],
    },
    {
      question: 'Technology setup. Devices, LMS, apps, logins?',
      answers: [
        { text: 'Everything is set up, tested, and I have backup plans', types: ['ready_to_go'] },
        { text: 'Most things are set up. A few logins or tools need attention', types: ['almost_there'] },
        { text: 'I know what I need but have not set it up yet', types: ['building_momentum'] },
        { text: 'I am still learning the systems my school uses', types: ['fresh_start'] },
      ],
    },
    {
      question: 'Behavior management plan. How solid?',
      answers: [
        { text: 'Clear expectations, consequences, and positive systems are planned', types: ['ready_to_go'] },
        { text: 'I have a general framework but need to work out the details', types: ['almost_there'] },
        { text: 'I know what did not work last year but have not built the new plan', types: ['building_momentum'] },
        { text: 'This is my biggest question mark right now', types: ['fresh_start'] },
      ],
    },
    {
      question: 'Collaboration with your team or partner. Where are things?',
      answers: [
        { text: 'We have already met, planned, and divided responsibilities', types: ['ready_to_go'] },
        { text: 'We have connected but need more planning time together', types: ['almost_there'] },
        { text: 'I know who I am working with but we have not met yet', types: ['building_momentum'] },
        { text: 'I do not know my team yet or I am working solo', types: ['fresh_start'] },
      ],
    },
    {
      question: 'Overall, how would you rate your readiness right now?',
      answers: [
        { text: 'Confident. I have done the prep and I trust my plan', types: ['ready_to_go'] },
        { text: 'Close. A focused weekend could get me there', types: ['almost_there'] },
        { text: 'Behind. I need to pick a few priorities and go', types: ['building_momentum'] },
        { text: 'Honestly starting over. And I need that to be OK', types: ['fresh_start'] },
      ],
    },
  ],
  shareMessage: (title, subtitle) =>
    `I took TDI's Back to School Readiness Check and got "${title}" -- ${subtitle} How ready are you? Find out at teachersdeserveit.com/hub`,
}

// ── 11. What's Your Coaching Stance? ────────────────────────────────

export const coachingStanceQuiz: QuizConfig = {
  id: 'coaching_stance',
  title: "What's Your Coaching Stance?",
  shortTitle: 'Coaching Stance',
  description: 'How do you show up when you are supporting another educator? 8 questions to find out.',
  questionCount: 8,
  durationLabel: '3 min',
  category: 'identity',
  accentColor: '#8B5CF6',
  accentBg: '#F3E8FF',
  accentGradient: 'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)',
  results: {
    consultant: {
      key: 'consultant',
      title: 'The Consultant',
      subtitle: 'You share expertise directly.',
      description: 'You have answers and you give them. When someone is struggling, your instinct is to share what has worked for you. You are efficient, knowledgeable, and people come to you because you deliver. Best for: new teachers who need concrete strategies. Growth edge: shift to questions more often. Let people find their own answers when they are ready.',
      color: '#2563EB',
      bg: '#DBEAFE',
      icon: 'C',
    },
    collaborator: {
      key: 'collaborator',
      title: 'The Collaborator',
      subtitle: 'You think alongside people.',
      description: 'You do not tell people what to do. You sit beside them and figure it out together. You co-create solutions and make people feel like equal partners in the process. Best for: experienced teachers who want a thinking partner. Growth edge: sometimes people need you to just tell them what works. Read the room.',
      color: '#059669',
      bg: '#D1FAE5',
      icon: 'C',
    },
    mirror: {
      key: 'mirror',
      title: 'The Mirror',
      subtitle: 'You reflect back what you see.',
      description: 'You help people see their own patterns by describing what you observe without judgment. You hold up the mirror so they can make their own decisions. Best for: teachers ready for deep reflection. Growth edge: not everyone is ready for this level of vulnerability. Meet people where they are.',
      color: '#7C3AED',
      bg: '#F3E8FF',
      icon: 'M',
    },
    facilitator: {
      key: 'facilitator',
      title: 'The Facilitator',
      subtitle: 'You create conditions for others to find answers.',
      description: 'You design the space, ask the right questions, and trust the process. You believe people have the answers inside them and your job is to create the conditions for those answers to surface. Best for: teams and group learning. Growth edge: individual coaching sometimes needs more direction. Do not be afraid to step in.',
      color: '#D97706',
      bg: '#FEF3C7',
      icon: 'F',
    },
  },
  questions: [
    {
      question: 'A teacher asks you for help with classroom management. You...',
      answers: [
        { text: 'Share three specific strategies that have worked for you', types: ['consultant'] },
        { text: 'Ask what they have tried and brainstorm together', types: ['collaborator'] },
        { text: 'Describe the patterns you noticed during your last visit', types: ['mirror'] },
        { text: 'Ask questions to help them identify the root cause themselves', types: ['facilitator'] },
      ],
    },
    {
      question: 'You are observing a lesson that is going sideways. After, you...',
      answers: [
        { text: 'Name what went wrong and suggest specific fixes', types: ['consultant'] },
        { text: 'Debrief together: "What did you notice? Here is what I noticed."', types: ['collaborator'] },
        { text: 'Share exactly what you saw without interpreting it', types: ['mirror'] },
        { text: 'Ask: "If you could teach that lesson again right now, what would you change?"', types: ['facilitator'] },
      ],
    },
    {
      question: 'A first-year teacher is overwhelmed and near tears. Your instinct?',
      answers: [
        { text: 'Give them a survival toolkit: "Do these 3 things this week"', types: ['consultant'] },
        { text: 'Sit with them and say: "Let us figure this out together"', types: ['collaborator'] },
        { text: 'Acknowledge the emotion and reflect back what you are hearing', types: ['mirror'] },
        { text: 'Help them name one thing they can control and focus there', types: ['facilitator'] },
      ],
    },
    {
      question: 'During a PLC or team meeting, your role tends to be...',
      answers: [
        { text: 'The one with the research and the recommendation', types: ['consultant'] },
        { text: 'The one building on everyone else\'s ideas', types: ['collaborator'] },
        { text: 'The one who names what the group is doing well and where they are stuck', types: ['mirror'] },
        { text: 'The one asking the questions that move the conversation forward', types: ['facilitator'] },
      ],
    },
    {
      question: 'A veteran teacher pushes back on your feedback. You...',
      answers: [
        { text: 'Stand by your recommendation and explain your reasoning', types: ['consultant'] },
        { text: 'Adjust your approach and find a middle ground together', types: ['collaborator'] },
        { text: 'Pause and reflect their concern back: "It sounds like you feel..."', types: ['mirror'] },
        { text: 'Ask what approach would feel right to them and build from there', types: ['facilitator'] },
      ],
    },
    {
      question: 'You believe the best coaching happens when...',
      answers: [
        { text: 'People get clear, actionable guidance they can use immediately', types: ['consultant'] },
        { text: 'Two professionals think through a challenge as equals', types: ['collaborator'] },
        { text: 'Someone sees themselves clearly, maybe for the first time', types: ['mirror'] },
        { text: 'The right questions unlock something the person already knew', types: ['facilitator'] },
      ],
    },
    {
      question: 'A teacher keeps repeating the same mistake. Your approach?',
      answers: [
        { text: 'Be more direct: "Here is specifically what needs to change"', types: ['consultant'] },
        { text: 'Explore the pattern together and co-create a different approach', types: ['collaborator'] },
        { text: 'Name the pattern you are seeing without judgment and let them sit with it', types: ['mirror'] },
        { text: 'Ask: "What do you think is getting in the way?"', types: ['facilitator'] },
      ],
    },
    {
      question: 'Your coaching style in one sentence would be...',
      answers: [
        { text: '"I will tell you what works because I have been there"', types: ['consultant'] },
        { text: '"Let us figure this out side by side"', types: ['collaborator'] },
        { text: '"Let me show you what I see so you can decide what to do"', types: ['mirror'] },
        { text: '"The answer is already in you. I just help you find it"', types: ['facilitator'] },
      ],
    },
  ],
  shareMessage: (title, subtitle) =>
    `My coaching stance is "${title}" -- ${subtitle} What is yours? Find out at teachersdeserveit.com/hub`,
}

// ── 12. Para Partnership Pulse Check ────────────────────────────────

export const paraPartnershipQuiz: QuizConfig = {
  id: 'para_partnership',
  title: 'Para Partnership Pulse Check',
  shortTitle: 'Partnership Pulse',
  description: 'A quick check on the health of your teacher-para partnership. Both roles can take this.',
  questionCount: 10,
  durationLabel: '3 min',
  category: 'needs',
  accentColor: '#10B981',
  accentBg: '#D1FAE5',
  accentGradient: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
  results: {
    thriving: {
      key: 'thriving',
      title: 'Thriving Partnership',
      subtitle: 'You and your partner are in sync.',
      description: 'You and your partner communicate clearly, share responsibility, and genuinely support each other. This is not an accident. It is the result of mutual respect and intentional effort. Keep investing in what is working. Partnerships like this are rare and worth protecting.',
      color: '#059669',
      bg: '#D1FAE5',
      icon: 'T',
    },
    growing: {
      key: 'growing',
      title: 'Growing Partnership',
      subtitle: 'The foundation is there.',
      description: 'The foundation is there but some areas need more intentional communication. You probably get along well but there are moments of confusion about roles or expectations. One honest conversation could unlock the next level. Start with: "How can we make this work even better?"',
      color: '#2563EB',
      bg: '#DBEAFE',
      icon: 'G',
    },
    developing: {
      key: 'developing',
      title: 'Developing Partnership',
      subtitle: 'Some gaps need attention.',
      description: 'There are gaps in how you work together. Maybe roles are unclear, communication is inconsistent, or one person feels underutilized. This is fixable. Start with role clarity: who does what, when, and how you will check in about it. Small agreements make a big difference.',
      color: '#D97706',
      bg: '#FEF3C7',
      icon: 'D',
    },
    needs_reset: {
      key: 'needs_reset',
      title: 'Needs a Reset',
      subtitle: 'An honest starting point.',
      description: 'The partnership is not functioning the way either of you needs it to. No blame. Just an honest starting point. This happens more often than people talk about. A structured conversation with your coach or admin could help. Sometimes a reset is the most productive thing you can do.',
      color: '#DC2626',
      bg: '#FEE2E2',
      icon: 'N',
    },
  },
  questions: [
    {
      question: 'How clearly defined are the roles in your partnership?',
      answers: [
        { text: 'Crystal clear. We both know who does what and when', types: ['thriving'] },
        { text: 'Mostly clear but there are gray areas we have not discussed', types: ['growing'] },
        { text: 'Fuzzy. We figure it out day to day', types: ['developing'] },
        { text: 'Unclear. I am often unsure what I should be doing or what they expect', types: ['needs_reset'] },
      ],
    },
    {
      question: 'When something goes wrong in the classroom, you and your partner...',
      answers: [
        { text: 'Handle it seamlessly. We read each other well', types: ['thriving'] },
        { text: 'Usually manage it but sometimes step on each other', types: ['growing'] },
        { text: 'One of us takes over while the other watches', types: ['developing'] },
        { text: 'It gets tense or we avoid addressing it', types: ['needs_reset'] },
      ],
    },
    {
      question: 'How often do you and your partner check in about how things are going?',
      answers: [
        { text: 'Regularly. We have built-in time to talk', types: ['thriving'] },
        { text: 'Sometimes, usually when something comes up', types: ['growing'] },
        { text: 'Rarely. We just kind of go with it', types: ['developing'] },
        { text: 'Never. We do not have that kind of relationship', types: ['needs_reset'] },
      ],
    },
    {
      question: 'Does your partner know your strengths and how to use them?',
      answers: [
        { text: 'Yes. They lean into what I am good at and I do the same for them', types: ['thriving'] },
        { text: 'Somewhat. They know some of my strengths but not all', types: ['growing'] },
        { text: 'Not really. I feel underutilized or mismatched in my tasks', types: ['developing'] },
        { text: 'No. I do not think they have asked or noticed', types: ['needs_reset'] },
      ],
    },
    {
      question: 'How do you feel walking into the classroom each morning?',
      answers: [
        { text: 'Glad I have a partner. We make each other better', types: ['thriving'] },
        { text: 'Fine. It is a good working relationship most days', types: ['growing'] },
        { text: 'Uncertain. I do not always know what the day will look like', types: ['developing'] },
        { text: 'Stressed. The dynamic adds tension instead of support', types: ['needs_reset'] },
      ],
    },
    {
      question: 'When it comes to planning, your partnership looks like...',
      answers: [
        { text: 'We plan together and both contribute ideas', types: ['thriving'] },
        { text: 'One of us plans and shares with the other, and that works OK', types: ['growing'] },
        { text: 'One of us plans and the other finds out in the moment', types: ['developing'] },
        { text: 'There is no shared planning. We are winging it separately', types: ['needs_reset'] },
      ],
    },
    {
      question: 'How respected do you feel in this partnership?',
      answers: [
        { text: 'Completely. My input is valued and my role matters', types: ['thriving'] },
        { text: 'Mostly. But there are moments I feel overlooked', types: ['growing'] },
        { text: 'Sometimes. I wonder if my contributions are noticed', types: ['developing'] },
        { text: 'Not enough. I feel invisible or undervalued', types: ['needs_reset'] },
      ],
    },
    {
      question: 'If you had a concern about the partnership, would you feel safe raising it?',
      answers: [
        { text: 'Absolutely. We have that kind of trust', types: ['thriving'] },
        { text: 'Probably, but I would be careful about how I said it', types: ['growing'] },
        { text: 'Maybe, but I would worry about how it would be received', types: ['developing'] },
        { text: 'No. It does not feel safe or worth the risk', types: ['needs_reset'] },
      ],
    },
    {
      question: 'Students interact with both of you. How does that look?',
      answers: [
        { text: 'Students see us as a team and go to either of us for help', types: ['thriving'] },
        { text: 'Students mostly go to one of us but respect both', types: ['growing'] },
        { text: 'Students are confused about our roles or only trust one of us', types: ['developing'] },
        { text: 'The dynamic between us is visible to students and it is not positive', types: ['needs_reset'] },
      ],
    },
    {
      question: 'If you could change one thing about the partnership, it would be...',
      answers: [
        { text: 'Honestly nothing major. I would just want more time together', types: ['thriving'] },
        { text: 'More consistent communication about expectations', types: ['growing'] },
        { text: 'Clearer roles so we both know where we stand', types: ['developing'] },
        { text: 'Everything. We need to start over with a real conversation', types: ['needs_reset'] },
      ],
    },
  ],
  shareMessage: (title, subtitle) =>
    `I took TDI's Para Partnership Pulse Check and got "${title}" -- ${subtitle} Check yours at teachersdeserveit.com/hub`,
}

// ── 13. Burnout Early Warning System ────────────────────────────────

export const burnoutWarningQuiz: QuizConfig = {
  id: 'burnout_warning',
  title: 'Burnout Early Warning System',
  shortTitle: 'Burnout Check',
  description: 'An honest check-in on where you are right now. No judgment. Just information.',
  questionCount: 10,
  durationLabel: '3 min',
  category: 'needs',
  accentColor: '#F43F5E',
  accentBg: '#FFE4E6',
  accentGradient: 'linear-gradient(135deg, #F43F5E 0%, #FB7185 100%)',
  results: {
    energized: {
      key: 'energized',
      title: 'Energized',
      subtitle: 'You are in a good place right now.',
      description: 'You are in a good place right now. Protect it. The habits you have are working. Do not let a busy season erode them. Pay attention to what is sustaining you and keep doing those things on purpose. This state is not permanent unless you actively maintain it.',
      color: '#059669',
      bg: '#D1FAE5',
      icon: 'E',
    },
    workload: {
      key: 'workload',
      title: 'Workload Burnout',
      subtitle: 'Too much on your plate.',
      description: 'You are overwhelmed by the volume, not the work itself. You still care but there is too much on your plate. The love is there. The capacity is not. The fix is boundaries and delegation, not motivation. Something has to come off the list and it is OK if you are the one who decides what.',
      color: '#D97706',
      bg: '#FEF3C7',
      icon: 'W',
    },
    emotional: {
      key: 'emotional',
      title: 'Emotional Exhaustion',
      subtitle: 'Giving more than you are getting back.',
      description: 'You are giving more than you are getting back emotionally. The work still matters to you but it is draining you. You feel deeply and that is a gift, but it is also costly. The fix is connection, recognition, and filling your own cup first. You cannot pour from empty.',
      color: '#7C3AED',
      bg: '#F3E8FF',
      icon: 'E',
    },
    disconnect: {
      key: 'disconnect',
      title: 'Growing Disconnect',
      subtitle: 'You are pulling back.',
      description: 'You are pulling back from the work. This is not a character flaw. It is your body protecting you. The passion that brought you here may feel distant and that can be scary. The fix: reconnect with why you started, or give yourself permission to reimagine what is next. Both are valid.',
      color: '#DC2626',
      bg: '#FEE2E2',
      icon: 'D',
    },
  },
  questions: [
    {
      question: 'How do you feel when your alarm goes off on a school day?',
      answers: [
        { text: 'Ready. I may not love mornings but I am looking forward to the day', types: ['energized'] },
        { text: 'Already running through my to-do list before my feet hit the floor', types: ['workload'] },
        { text: 'Heavy. Like I am carrying something before the day even starts', types: ['emotional'] },
        { text: 'Nothing. I just go through the motions', types: ['disconnect'] },
      ],
    },
    {
      question: 'When a student has a breakthrough moment, you feel...',
      answers: [
        { text: 'Genuinely thrilled. This is exactly why I do this', types: ['energized'] },
        { text: 'Happy but I barely have time to enjoy it before the next thing', types: ['workload'] },
        { text: 'Emotional in a way that surprises me. I feel too much lately', types: ['emotional'] },
        { text: 'Less than I used to. I notice it but it does not hit the same way', types: ['disconnect'] },
      ],
    },
    {
      question: 'Your weekends lately look like...',
      answers: [
        { text: 'A real break. I disconnect and come back refreshed', types: ['energized'] },
        { text: 'Catching up on everything I could not finish during the week', types: ['workload'] },
        { text: 'Recovering emotionally from the week that just happened', types: ['emotional'] },
        { text: 'Dreading Monday before Sunday even starts', types: ['disconnect'] },
      ],
    },
    {
      question: 'How do you feel about your colleagues right now?',
      answers: [
        { text: 'Connected. I have people I trust and lean on', types: ['energized'] },
        { text: 'We are all too busy to really connect. Ships passing', types: ['workload'] },
        { text: 'I am absorbing their stress on top of my own', types: ['emotional'] },
        { text: 'Distant. I have been pulling away without meaning to', types: ['disconnect'] },
      ],
    },
    {
      question: 'When someone adds one more thing to your plate, your reaction is...',
      answers: [
        { text: 'I can handle it. My capacity feels manageable right now', types: ['energized'] },
        { text: 'Internal screaming. I am already maxed out', types: ['workload'] },
        { text: 'Resentment that I try to hide because I do not want to seem ungrateful', types: ['emotional'] },
        { text: 'Indifference. Sure. Whatever. Add it to the pile', types: ['disconnect'] },
      ],
    },
    {
      question: 'How often do you do something just for yourself during the week?',
      answers: [
        { text: 'Regularly. I protect that time and it makes a difference', types: ['energized'] },
        { text: 'I try but it keeps getting bumped by work obligations', types: ['workload'] },
        { text: 'Rarely. I feel guilty taking time for myself when others need me', types: ['emotional'] },
        { text: 'I have stopped trying. I do not have the energy for it', types: ['disconnect'] },
      ],
    },
    {
      question: 'When you think about next school year, you feel...',
      answers: [
        { text: 'Excited. I have ideas and plans I want to try', types: ['energized'] },
        { text: 'Tired already. How am I going to do all of this again?', types: ['workload'] },
        { text: 'Anxious. I do not know if I can keep giving at this level', types: ['emotional'] },
        { text: 'Uncertain whether I will even be doing this next year', types: ['disconnect'] },
      ],
    },
    {
      question: 'Your body is telling you...',
      answers: [
        { text: 'I feel mostly good. Normal tired but nothing concerning', types: ['energized'] },
        { text: 'Tension headaches, back pain, or sleep issues from overwork', types: ['workload'] },
        { text: 'Emotional symptoms: crying easily, short fuse, trouble sleeping', types: ['emotional'] },
        { text: 'Numbness or flatness. I do not feel much of anything lately', types: ['disconnect'] },
      ],
    },
    {
      question: 'When someone asks how you are, you say...',
      answers: [
        { text: 'Good! And I mean it', types: ['energized'] },
        { text: 'Busy. Always busy. So, so busy', types: ['workload'] },
        { text: 'Fine. But if they really pushed I might fall apart', types: ['emotional'] },
        { text: 'Fine. And I change the subject', types: ['disconnect'] },
      ],
    },
    {
      question: 'Right now, the thing you need most is...',
      answers: [
        { text: 'To keep doing what I am doing. Things are working', types: ['energized'] },
        { text: 'Someone to take something off my plate. Anything', types: ['workload'] },
        { text: 'Someone to see me and say: "You are doing enough"', types: ['emotional'] },
        { text: 'Permission to step back without it meaning I have failed', types: ['disconnect'] },
      ],
    },
  ],
  shareMessage: (title, subtitle) =>
    `I took TDI's Burnout Early Warning System and got "${title}" -- ${subtitle} Check yours at teachersdeserveit.com/hub`,
}

// ── All Quizzes Registry ──────────────────────────────────────────────

export const ALL_QUIZZES: QuizConfig[] = [
  educatorTypeQuiz,
  superpowerQuiz,
  growthStyleQuiz,
  techComfortQuiz,
  classroomNeedsQuiz,
  careerSeasonQuiz,
  energyDrainQuiz,
  creatorQuiz,
  communicationStyleQuiz,
  btsReadinessQuiz,
  coachingStanceQuiz,
  paraPartnershipQuiz,
  burnoutWarningQuiz,
]

export function getQuizById(id: string): QuizConfig | undefined {
  return ALL_QUIZZES.find(q => q.id === id)
}
