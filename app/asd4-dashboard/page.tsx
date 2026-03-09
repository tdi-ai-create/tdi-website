'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { HowWePartnerTabs } from '@/components/HowWePartnerTabs';
import { Tooltip } from '@/components/Tooltip';
import { openGmail } from '@/lib/openGmail';
import {
  Calendar,
  CheckCircle,
  Clock,
  Users,
  BookOpen,
  Target,
  Star,
  Lightbulb,
  ClipboardList,
  TrendingUp,
  ArrowRight,
  AlertCircle,
  AlertTriangle,
  Lock,
  Eye,
  MessageCircle,
  Phone,
  Mail,
  MapPin,
  Building,
  User,
  Sparkles,
  Headphones,
  Info,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Heart,
  Smile,
  Activity,
  UserCheck,
  Rocket,
  School,
  Monitor,
  Briefcase,
  Sprout,
  Circle,
  LogIn,
  Flame,
  Construction,
  Thermometer,
  RefreshCw,
  BarChart,
  BarChart3,
  TrendingDown,
  Shield,
  Award,
  Quote,
  Trophy,
  CreditCard,
  HelpCircle,
  FileText,
  Send,
  Check,
  CheckCircle2,
  CalendarClock
} from 'lucide-react';

export default function ASD4Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [showAllItems, setShowAllItems] = useState(false);
  const [showAllCourses, setShowAllCourses] = useState(false);
  const [showNotLoggedIn, setShowNotLoggedIn] = useState(false);
  const [showPolicy, setShowPolicy] = useState(false);
  const tabContentRef = useRef<HTMLDivElement>(null);
  const [expandedSchool, setExpandedSchool] = useState<string | null>(null);
  const [showRoster, setShowRoster] = useState<string | null>(null);
  const [observationExpanded, setObservationExpanded] = useState(false);
  const [expandedObsBuilding, setExpandedObsBuilding] = useState<string | null>('fullerton');

  // Needs Attention completion state with localStorage persistence
  // Only 1 item remains in Needs Attention - Virtual Session 4
  const permanentlyComplete: string[] = [];
  const [completedItems, setCompletedItems] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('asd4-completed-items');
      const parsed = saved ? JSON.parse(saved) : [];
      // Merge permanently complete items
      return [...new Set([...parsed, ...permanentlyComplete])];
    }
    return [...permanentlyComplete];
  });

  // Save to localStorage whenever completedItems changes
  useEffect(() => {
    localStorage.setItem('asd4-completed-items', JSON.stringify(completedItems));
  }, [completedItems]);

  // Toggle completion
  const toggleComplete = (itemId: string) => {
    setCompletedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  // Check if item is complete
  const isComplete = (itemId: string) => completedItems.includes(itemId);

  // Needs Attention items - only items that actually need action
  // Completed/scheduled items are shown in Progress tab, not here
  const needsAttentionItems = [
    {
      id: 'virtual-session-4',
      title: 'Schedule Virtual Session 4',
      description: 'Final coaching check-in — schedule after April 20',
      deadline: 'MAY 2026',
      actionLabel: 'Book Your Session',
      actionUrl: 'https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat',
      icon: Monitor,
      priority: 'now',
      external: true,
      showCalendar: true
    }
  ];

  // Completed sessions data
  const completedSessions = [
    {
      title: "The Moves That Matter: Part 1",
      date: "January 5, 2026",
      format: "In-Person",
      duration: "Multi-Hour Session",
      focusAreas: [
        "Feedback models for paraprofessional support",
        "Questioning techniques in the classroom",
        "Learning Hub onboarding and login walkthrough"
      ],
      status: "complete" as const,
      practiceReps: 8
    },
    {
      title: "Executive Impact Session 1",
      date: "January 2026",
      format: "Leadership Meeting",
      duration: "Executive Briefing",
      focusAreas: [
        "Partnership overview and goals alignment",
        "Baseline metrics and success criteria",
        "Implementation roadmap review"
      ],
      status: "complete" as const,
      reportUrl: "https://drive.google.com/file/d/1XfzJGTyb60kp3t8MbcGtN8ro-psBBnbj/view?usp=sharing",
      reportLabel: "View Executive Summary Report →"
    },
    {
      title: "The Moves That Matter: Part 2",
      date: "February 13, 2026",
      format: "In-Person",
      duration: "2-Hour Session",
      focusAreas: [
        "Ask, Don't Tell — Questioning scenarios with partner role-play",
        "Feedback That Builds Capacity — Notice. Name. Next Step. formula",
        "Game-based practice tool introduction"
      ],
      status: "complete" as const,
      practiceReps: 54
    },
    {
      title: "Virtual Session 1",
      date: "March 2, 2026",
      format: "Virtual",
      duration: "45-Minute Session",
      focusAreas: [
        "Partnership check-in and progress review",
        "Strategy adjustments based on observation data",
        "Growth Group formation planning"
      ],
      status: "complete" as const
    },
    {
      title: "Observation Day",
      date: "March 3, 2026",
      format: "In-Person",
      duration: "Full Day (7:30 AM - 3:00 PM)",
      focusAreas: [
        "Classroom observation of para-student interactions",
        "Strategy implementation check-ins",
        "Real-time coaching feedback"
      ],
      status: "complete" as const,
      observationStats: {
        buildingsVisited: 3,
        parasObserved: 4,
        informalObservations: 2,
        appreciationVisits: 2,
        followUpEmails: 7,
        principalEmails: 1,
        sameDayResponses: 1,
        sameDayResponseRate: 14,
        hubResourcesMatched: 7
      },
      highlightQuote: {
        text: "I wish I could meet all my students' many needs every day.",
        author: "Scott Nyquist",
        school: "Fullerton",
        context: "Replied 5 minutes after receiving observation follow-up email"
      }
    }
  ];

  // Upcoming/Scheduled sessions data
  const upcomingSessions = [
    {
      title: "Observation Day 2",
      date: "March 19, 2026",
      time: "Half Day",
      format: "In-Person",
      focusAreas: [
        "Follow-up observations",
        "Check on growth areas",
        "Additional para connections"
      ],
      status: "scheduled" as const
    },
    {
      title: "Virtual Session 2",
      date: "April 6, 2026",
      time: "7:30 - 8:15 AM",
      format: "Virtual",
      focusAreas: [
        "Mid-partnership progress review",
        "Growth Group updates and wins",
        "Implementation support"
      ],
      status: "scheduled" as const
    },
    {
      title: "Executive Impact Session 2",
      date: "April 9, 2026",
      time: "8:00 - 9:00 AM",
      format: "Leadership Meeting",
      focusAreas: [
        "Current outcomes review",
        "End-of-year metrics discussion",
        "Partnership continuation conversation"
      ],
      status: "scheduled" as const
    },
    {
      title: "Virtual Session 3 (Late Start Days Support)",
      date: "April 20, 2026",
      time: "7:30 - 8:15 AM",
      format: "Virtual",
      focusAreas: [
        "Strategy refinement",
        "Success metrics check-in",
        "Preparation for end-of-year review"
      ],
      status: "scheduled" as const
    }
  ];

  // Observation Day Schedule - March 3, 2026
  const observationSchedule = [
    {
      school: "Fullerton",
      timeRange: "8:30 - 10:25 AM",
      stopNumber: 1,
      observations: [
        { time: "8:30 - 8:50", para: "Para 1", teacher: "TBD", note: "Schedule pending" },
        { time: "8:50 - 9:10", para: "Para 2", teacher: "TBD", note: "Schedule pending" },
        { time: "9:10 - 9:30", para: "Para 3", teacher: "TBD", note: "Schedule pending" },
        { time: "9:30 - 9:50", para: "Para 4", teacher: "TBD", note: "Schedule pending" },
        { time: "9:50 - 10:10", para: "Para 5", teacher: "TBD", note: "Schedule pending" },
        { time: "10:10 - 10:25", para: "Para 6", teacher: "TBD", note: "Quick pop-in" },
      ]
    },
    {
      school: "Lake Park",
      timeRange: "10:30 - 11:40 AM",
      stopNumber: 2,
      observations: [
        { time: "10:35 - 10:55", para: "Maribel Ontiveros", teacher: "Arroyo", note: "With Arroyo 10:15-10:45, transitions to Garcia at 11:00" },
        { time: "10:55 - 11:15", para: "Sandi DeLaGarza", teacher: "Goodman", note: "With Goodman 10:15-11:15 - confirmed schedule" },
        { time: "11:15 - 11:25", para: "Mary Falco", teacher: "Marshall", note: "With Marshall 11:00-11:30 - confirmed schedule" },
        { time: "11:25 - 11:35", para: "Shelly Mayer", teacher: "Lukic", note: "Rotations - flex slot" },
        { time: "11:35 - 11:40", para: "Natalia Villalobos", teacher: "Room 62", note: "Quick pop-in" },
      ]
    },
    {
      school: "Lincoln",
      timeRange: "12:20 - 3:00 PM",
      stopNumber: 3,
      observations: [
        { time: "12:20 - 12:40", para: "Para 1", teacher: "TBD", note: "Schedule pending" },
        { time: "12:40 - 1:00", para: "Para 2", teacher: "TBD", note: "Schedule pending" },
        { time: "1:00 - 1:20", para: "Para 3", teacher: "TBD", note: "Schedule pending" },
        { time: "1:20 - 1:40", para: "Para 4", teacher: "TBD", note: "Schedule pending" },
        { time: "1:40 - 2:00", para: "Para 5", teacher: "TBD", note: "Schedule pending" },
        { time: "2:00 - 2:20", para: "Para 6", teacher: "TBD", note: "Schedule pending" },
        { time: "2:20 - 2:40", para: "Para 7", teacher: "TBD", note: "Schedule pending" },
        { time: "2:40 - 3:00", para: "Para 8", teacher: "TBD", note: "Quick pop-in" },
      ]
    }
  ];

  // Observation Day Results - March 3, 2026
  const observationResults = {
    fullerton: {
      school: "Fullerton",
      status: "complete",
      stats: {
        parasObserved: 4,
        informalObservations: 2,
        appreciationVisits: 2,
        followUpEmails: 7,
        principalEmail: true,
        principalName: "Bryan Bolton",
        sameDayResponses: 5
      },
      movesObserved: [
        {
          move: "Ask Don't Tell",
          color: "orange",
          examples: [
            { para: "Jonnathan Roeglin", example: "Asked \"How do we make this into a fraction?\" during small group math — guiding students to think through the problem instead of giving the answer" },
            { para: "Fatema Bakhrani", example: "Asked \"What letter is missing from 'house'?\" — direct questioning to get student thinking while re-reading worksheet directions together" },
            { para: "Esperanza Garcia", example: "Reading directions and asking questions in Spanish to get her student thinking, not just translating answers" }
          ]
        },
        {
          move: "Feedback & Encouragement",
          color: "teal",
          examples: [
            { para: "Kristina Orellana", example: "Encouraged a sleepy, disengaged student with repeated questions, then guided him to raise his hand and answer for the full class — building confidence, not just compliance" },
            { para: "Kristina Orellana", example: "\"There you go!\" — positive reinforcement during counting activity, encouraging participation" }
          ]
        },
        {
          move: "Positioning & Proximity",
          color: "blue",
          examples: [
            { para: "Jonnathan Roeglin", example: "Crouching down to student level during small group work instead of standing over — sending the message \"I'm here WITH you\"" },
            { para: "Esperanza Garcia", example: "Working in the back of the room with quiet voice — supporting her student without disrupting whole-class instruction" },
            { para: "Kristina Orellana", example: "Sat with disengaged student in back of room rather than calling him out — proximity as a redirection tool" }
          ]
        },
        {
          move: "Redirection",
          color: "purple",
          examples: [
            { para: "Jonnathan Roeglin", example: "Scanning the room and redirecting off-task students to keep them on track during independent work time, even while running his own small group" },
            { para: "Esperanza Garcia", example: "Patiently redirecting a distracted student back to questions on the screen — persistence without frustration" },
            { para: "Kristina Orellana", example: "Quietly redirecting during math transition by sitting alongside the student" }
          ]
        },
        {
          move: "Teacher-Para Collaboration",
          color: "green",
          examples: [
            { para: "Jonnathan Roeglin", example: "Positioned in back during whole-class lesson to listen, support, and interact with teacher — \"thumbs up if...\" — seamless classroom partnership" },
            { para: "Kristina Orellana", example: "Checked in with classroom teacher quietly during a video to get an update without disrupting the lesson flow" }
          ]
        },
        {
          move: "Bilingual Support",
          color: "pink",
          examples: [
            { para: "Esperanza Garcia", example: "Reading and speaking entirely in Spanish with 1:1 student in a fully Spanish classroom — meeting the student in their language to make content accessible" }
          ]
        }
      ],
      hubResources: [
        { para: "Jonnathan Roeglin", resource: "Feedback Framework Quick Reference + No-Hands-Up Help Systems*", reason: "Strong questioning already — next step is pairing questions with Notice → Name → Next Step feedback" },
        { para: "Esperanza Garcia", resource: "Supporting English Learners + Bilingual Reference Cards", reason: "Directly connects to the bilingual scaffolding work she's already doing" },
        { para: "Kristina Orellana", resource: "PA Quick Wins Menu", reason: "Already doing high-impact moves naturally — quick-grab reference for more" },
        { para: "Fatema Bakhrani", resource: "Feedback Framework Quick Reference + 'One Step at a Time' Chunking Strategy*", reason: "Good guiding questions observed — feedback formula is the natural next layer" },
        { para: "Mary Dunkel", resource: "Para Quick-Start Confidence Kit", reason: "Clean starting point for Hub engagement" },
        { para: "Scott Nyquist", resource: "\"What Should I Be Doing Right Now?\" Para Guide", reason: "Practical role-affirming reference" },
        { para: "Evely Castillo", resource: "De-Escalation Strategies + Calm Response Scripts", reason: "Updated same-day after she replied requesting de-escalation support" }
      ],
      quotes: [
        { text: "I wish I could meet all my students' many needs every day.", author: "Scott Nyquist", context: "Replied 5 minutes after receiving observation follow-up email" },
        { text: "One thing I wish was easier is helping a student de-escalate instead of escalating the situation more. I still struggle somewhat in that aspect.", author: "Evely Castillo", context: "Reached out on her own — was not formally observed but replied with a specific skill request after receiving an appreciation email", selfInitiated: true },
        { text: "Thank you for taking your time to come by and stop to observe me. Thank you for your comments and suggestions. I will take a look at the resources you shared with me.", author: "Esperanza Garcia, Fullerton (Bilingual Support)", context: "Replied next morning. Committed to exploring Hub resources." },
        { text: "I'm glad that you were able to stop by and observe. One thing I wish was easier is being able to bounce around between groups of students who all need help at the same time.", author: "Jonnathan Roeglin, Fullerton (Formally Observed)", context: "Replied next morning with a specific growth request: managing multiple groups simultaneously. Matched with No-Hands-Up Help Systems resource.", growthRequest: true },
        { text: "Could we try to maybe break the work into smaller steps to help make the student understand it better? What is an easier strategy to help them understand?", author: "Fatema Bakhrani, Fullerton (Informal Observation)", context: "Replied with a specific strategy request: chunking and scaffolding. Matched with 'One Step at a Time' chunking strategy.", growthRequest: true }
      ],
      themes: {
        strengths: [
          "Strong questioning skills across multiple paras — Move #1 is landing",
          "Patience and persistence with disengaged or distracted students",
          "Natural teacher-para collaboration happening without prompting",
          "Bilingual scaffolding actively supporting EL students",
          "Paras positioning themselves intentionally (crouching, back of room, sitting alongside)"
        ],
        growthOpportunity: "Feedback specificity — paras are encouraging (\"There you go!\") but can level up to Notice → Name → Next Step for more targeted student growth"
      },
      teacherHighlights: [
        { teacher: "Seidenfuss", note: "Well-paced, student-centered lesson that created real space for meaningful small group para work alongside whole-class instruction." },
        { teacher: "Roseberg", note: "Warm, structured classroom environment where students were engaged and systems were in place for the para to jump right in and support." }
      ],
      parasHighlighted: [
        { name: "Jonnathan Roeglin", highlights: ["Guiding questions in small group math", "Strong room awareness"] },
        { name: "Esperanza Garcia", highlights: ["Bilingual 1:1 support", "Patient redirection"] },
        { name: "Kristina Orellana", highlights: ["Encouraged disengaged student to answer for full class"] },
        { name: "Fatema Bakhrani", highlights: ["Direct questioning during worksheet support"] },
        { name: "Mary Dunkel", highlights: ["Engaged, present support with student"] },
        { name: "Scott Nyquist", highlights: ["\"I wish I could meet all my students' many needs every day\""] },
        { name: "Evely Castillo", highlights: ["Appreciated for commitment to team"] }
      ]
    },
    lakePark: {
      school: "Lake Park",
      status: "complete",
      stats: {
        parasObserved: 4,
        informalObservations: 1,
        appreciationVisits: 0,
        followUpEmails: 5,
        principalEmail: true,
        principalName: "Cristina Villalobos",
        sameDayResponses: 3
      },
      movesObserved: [
        {
          move: "Ask Don't Tell",
          color: "orange",
          examples: [
            { para: "Maribel Ontiveros", example: "Asked guiding questions in Spanish and English to clarify directions and encourage effort - questioning to build understanding, not just translating answers" },
            { para: "Natalia Villalobos", example: "\"Are you ready to paint?\" and playful prompts like \"Hop hop with your sponge!\" - using questions and engagement cues to keep students active" }
          ]
        },
        {
          move: "Feedback & Encouragement",
          color: "teal",
          examples: [
            { para: "Maribel Ontiveros", example: "\"Oh very nice!\" \"Muy bonito!\" - frequent, genuine affirmations that students visibly responded to" },
            { para: "Mary Falco", example: "\"See! Easy! Easy peasy lemon squeezy!\" followed by \"Nice job!\" - made practice feel doable, not overwhelming" },
            { para: "Natalia Villalobos", example: "\"Good working, Julian!\" \"Yea! Keep going!\" - specific, timely praise tied to student effort" },
            { para: "Ruby Medina", example: "Modeled painting by holding student's hand and walking through it - encouragement through guided practice" }
          ]
        },
        {
          move: "Positioning & Proximity",
          color: "blue",
          examples: [
            { para: "Maribel Ontiveros", example: "Sitting with students during activity instead of hovering - communicating partnership, not surveillance" },
            { para: "Mary Falco", example: "Actively involved during OT transition - walking, participating, rolling the large wheel with student. Not supervising; engaged alongside." },
            { para: "Ruby Medina", example: "Working closely with Angelo, individualized and intentional support at his level" },
            { para: "Shelly Mayer", example: "Moved to table to read with student who connected with a book - met the student where his interest was" }
          ]
        },
        {
          move: "Redirection",
          color: "purple",
          examples: [
            { para: "Mary Falco", example: "Steady redirection without frustration - consistency that builds independence over time" },
            { para: "Natalia Villalobos", example: "Patient with student struggling to sit still - calm redirection without escalation" },
            { para: "Ruby Medina", example: "\"Do you want to sit over here?\" - offered choice while still guiding the situation. Respectful redirection." },
            { para: "Shelly Mayer", example: "\"Please put that back\" - clear, calm re-engagement during a behavior choice. No escalation in an intensive intervention setting." }
          ]
        },
        {
          move: "Proactive Regulation",
          color: "green",
          examples: [
            { para: "Maribel Ontiveros", example: "Paused the group for a quick stretch when hands got tired during coloring - prevented dysregulation before it started" },
            { para: "Mary Falco", example: "Used timer + motivating words during practice activities - structure and positivity combined to keep students focused" },
            { para: "Shelly Mayer", example: "Comforted an upset student across the room with \"You're okay\" and a hand hold - calm, physical reassurance for a dysregulated student" }
          ]
        },
        {
          move: "Bilingual Support",
          color: "pink",
          examples: [
            { para: "Maribel Ontiveros", example: "Seamlessly switching between English and Spanish to clarify directions, encourage effort, and ensure understanding - bilingual scaffolding in a Resource setting" }
          ]
        },
        {
          move: "Teacher-Para Collaboration",
          color: "cyan",
          examples: [
            { para: "Maribel Ontiveros", example: "Checked in with teacher to clarify activity questions before redirecting students - ensured accurate information before guiding" },
            { para: "Mary Falco", example: "Quiet voice in hallway and during transitions - awareness of the larger learning environment beyond her own group" }
          ]
        }
      ],
      hubResources: [
        { para: "Maribel Ontiveros", resource: "Directions & Redirection Quick Reference", reason: "Pairs with the bilingual support she's already giving - streamline reminders" },
        { para: "Mary Falco", resource: "Practice & Feedback Quick Reference", reason: "Connects to her literacy center work - tighten practice moments" },
        { para: "Natalia Villalobos", resource: "Engagement & Active Participation Quick Reference", reason: "Pairs with hands-on learning facilitation - build on balance of fun and focus" },
        { para: "Shelly Mayer", resource: "SpEd Para Toolkit", reason: "Built for intensive intervention work - engagement, redirection, building independence" }
      ],
      quotes: [
        { text: "Thank you so much for taking the time to observe me and give me such wonderful feedback. I'm really enjoying the learning tools and can't wait to try them with my students!", author: "Maribel Ontiveros", context: "Email reply after receiving observation follow-up" },
        { text: "Our staff is truly committed to our students and works very well together as a team. It means a great deal to have that work acknowledged.", author: "Cristina Villalobos, Principal, Lake Park Elementary", context: "Replied same day after receiving observation highlights email" },
        { text: "Your message genuinely encouraged me and reminded me why this work is so important. I care deeply about meeting students where they are and helping them feel supported without being overwhelmed.", author: "Ruby Medina", context: "Was not a scheduled observation. Saw her in action and sent an encouragement note.", selfInitiated: true }
      ],
      themes: {
        strengths: [
          "Strong bilingual support - seamless English/Spanish scaffolding in Resource settings",
          "Patience and calm regulation across every observation - no escalation, even with challenging behaviors",
          "Proactive behavior management - stretching, choice-based redirection, timers, proximity",
          "Encouragement is frequent and genuine across the building",
          "Clear, chunked directions - especially strong in Resource and small group settings",
          "Active engagement - paras are IN it with students, not passively supervising"
        ],
        growthOpportunity: "Feedback specificity - lots of genuine encouragement that could level up to Notice → Name → Next Step. Also: initiative with disengaged students - leading with a question before giving space."
      },
      teacherHighlights: [
        { teacher: "Blue Pod Teachers", note: "Well-structured, student-centered classroom environments that allowed paras to jump in and do meaningful work alongside instruction." },
        { teacher: "Resource Team Culture", note: "Multiple Resource rooms showed strong systems already in place - paras could engage immediately because routines and expectations were established." }
      ],
      parasHighlighted: [
        { name: "Maribel Ontiveros", highlights: ["Bilingual scaffolding", "Proactive regulation", "Teacher collaboration"] },
        { name: "Mary Falco", highlights: ["Literacy center engagement", "Timer use", "Quiet voice awareness"] },
        { name: "Natalia Villalobos", highlights: ["Chunked directions", "Playful engagement", "Calm patience"] },
        { name: "Ruby Medina", highlights: ["Individualized support", "Choice-based redirection", "Hands-on modeling"] },
        { name: "Shelly Mayer", highlights: ["Comforted dysregulated student", "Read with student at interest"] }
      ]
    },
    lincoln: {
      school: "Lincoln",
      status: "complete",
      stats: {
        parasObserved: 4,
        informalObservations: 3,
        appreciationVisits: 2,
        followUpEmails: 8,
        principalEmail: true,
        principalName: "Kara Dohman",
        sameDayResponses: 2
      },
      movesObserved: [
        {
          move: "Ask Don't Tell",
          color: "orange",
          examples: [
            { para: "Rose Marinelli", example: "Repeated the question rather than giving the answer during math work — \"What do we do first?\" — guiding student thinking" },
            { para: "Gregoria Arredondo", example: "Asked clarifying questions during reading support to check comprehension before moving on" }
          ]
        },
        {
          move: "Feedback & Encouragement",
          color: "teal",
          examples: [
            { para: "Rose Marinelli", example: "\"You got it!\" after student self-corrected — celebrating effort, not just accuracy" },
            { para: "Carlos Chavez", example: "High-fives and verbal praise throughout small group math — consistent, genuine encouragement" },
            { para: "Michelina Hawkins", example: "\"I like how you're thinking through this\" — process-focused feedback during 1:1 support" }
          ]
        },
        {
          move: "Positioning & Proximity",
          color: "blue",
          examples: [
            { para: "Rose Marinelli", example: "Kneeling beside student desk during independent work — at their level, not hovering" },
            { para: "Carlos Chavez", example: "Circulating during math centers, checking in with multiple groups while staying mobile" },
            { para: "Gregoria Arredondo", example: "Positioned at small table in back corner to minimize distraction while providing support" }
          ]
        },
        {
          move: "Redirection",
          color: "purple",
          examples: [
            { para: "Rose Marinelli", example: "Gentle tap on desk to refocus wandering student — non-verbal, non-disruptive" },
            { para: "Michelina Hawkins", example: "\"Let's come back to this\" when student went off-topic — calm, consistent re-engagement" }
          ]
        },
        {
          move: "Teacher-Para Collaboration",
          color: "green",
          examples: [
            { para: "Carlos Chavez", example: "Quick whispered check-in with teacher during transition — ensuring alignment without disrupting flow" },
            { para: "Gregoria Arredondo", example: "Picked up seamlessly when teacher shifted to whole-class instruction — no verbal cue needed" }
          ]
        },
        {
          move: "Bilingual Support",
          color: "pink",
          examples: [
            { para: "Gregoria Arredondo", example: "Clarified directions in Spanish for EL student, then switched back to English for follow-up questions — seamless code-switching" }
          ]
        },
        {
          move: "Leading Under Pressure",
          color: "cyan",
          examples: [
            { para: "Rose Marinelli", example: "Principal Dohman observed Rose leading a student group during an unexpected fire drill transition — calm, organized, students followed her lead without hesitation" }
          ]
        }
      ],
      hubResources: [
        { para: "Rose Marinelli", resource: "Feedback Framework Quick Reference", reason: "Already encouraging — next step is Notice → Name → Next Step specificity" },
        { para: "Carlos Chavez", resource: "Small Group Facilitation Guide + Differentiated Choice Boards*", reason: "Strong circulation — formalize small group check-in strategies" },
        { para: "Gregoria Arredondo", resource: "Supporting English Learners + Bilingual Reference Cards", reason: "Connects directly to the bilingual scaffolding she's already providing" },
        { para: "Michelina Hawkins", resource: "1:1 Student Support Toolkit", reason: "Process-focused feedback is strong — build out 1:1 repertoire" }
      ],
      quotes: [
        { text: "They are great people and hard workers! So glad you got to visit!", author: "Kara Dohman, Principal, Lincoln Elementary", context: "Replied same day after receiving observation highlights email" },
        { text: "I would not be such a good paraeducator without the support of my coworkers and staff, Lincoln is such an amazing place!", author: "Carlos Chavez, Lincoln (Standout Observation)", context: "Replied next morning with a specific growth request: differentiating support for students with varying needs", standout: true }
      ],
      themes: {
        strengths: [
          "Strong questioning skills — paras guiding thinking rather than giving answers",
          "Genuine encouragement throughout building — high-fives, verbal praise, process-focused feedback",
          "Effective positioning — paras at student level, circulating, minimizing distraction",
          "Seamless teacher-para collaboration — transitions happen without verbal cues",
          "Calm leadership under pressure — Rose's fire drill moment was exceptional"
        ],
        growthOpportunity: "Feedback specificity — transition from general praise to Notice → Name → Next Step. Some paras could also benefit from more proactive engagement with disengaged students."
      },
      teacherHighlights: [
        { teacher: "Savaglio", note: "Classroom structured to give the para real ownership of small group instruction. The reading group felt like a master class because the design trusted the para with meaningful work." },
        { teacher: "Valdes", note: "Well-paced fraction lesson that created natural space for the para to sit with students, support with real-world examples, and redirect quietly without disrupting the flow." },
        { teacher: "Para Leadership Moment (Gillen)", note: "Two paras ran the classroom independently while the teacher was in a meeting. Managed transitions, gave bilingual directions, redirected students, and problem-solved in real time." }
      ],
      parasHighlighted: [
        { name: "Rose Marinelli", highlights: ["Guiding questions", "Fire drill leadership", "Non-verbal redirection"] },
        { name: "Carlos Chavez", highlights: ["High-fives and praise", "Math center circulation", "Teacher collaboration"] },
        { name: "Gregoria Arredondo", highlights: ["Bilingual scaffolding", "Seamless transitions", "Back-corner positioning"] },
        { name: "Michelina Hawkins", highlights: ["Process-focused feedback", "1:1 support", "Calm redirection"] }
      ]
    }
  };

  // Progress tab data
  const topEngagedParas = [
    { name: "Sandra DeLaGarza", email: "sdelagarza@asd4.org", logins: 4, lastActive: "Jan 23" },
    { name: "Michele Gorostieta", email: "mgorostieta@asd4.org", logins: 3, lastActive: "Jan 30" },
    { name: "Carmen Tirado", email: "ctirado@asd4.org", logins: 3, lastActive: "Jan 23" },
    { name: "Michelle Alecksen", email: "malecksen@asd4.org", logins: 3, lastActive: "Jan 23" },
    { name: "Leslie Olvera", email: "lolvera@asd4.org", logins: 3, lastActive: "Jan 20" },
    { name: "J Perez", email: "jperez@asd4.org", logins: 3, lastActive: "Jan 23" },
    { name: "Jonathan Roeglin", email: "jroeglin@asd4.org", logins: 2, lastActive: "Feb 2" },
  ];

  const topCourses = [
    { name: "Paraprofessional Foundations – Understanding Your Role & Impact", started: 27, completed70: 13, inProgress: 14, completionRate: 48, avgProgress: 15 },
    { name: "Classroom Management Toolkit", started: 16, completed70: 7, inProgress: 9, completionRate: 44, avgProgress: 7 },
    { name: "Differentiated Choice Boards: Empowering Student Choice and Mastery", started: 16, completed70: 5, inProgress: 11, completionRate: 31, avgProgress: 6 },
    { name: "Streamline Your Inbox: Effective Email Management for Educators", started: 16, completed70: 5, inProgress: 11, completionRate: 31, avgProgress: 6 },
    { name: "Boundaries Without Backlash", started: 15, completed70: 9, inProgress: 6, completionRate: 60, avgProgress: 8 },
    { name: "How to get the MOST out of the Teachers Deserve It Learning Hub", started: 13, completed70: 2, inProgress: 11, completionRate: 15, avgProgress: 2 },
    { name: "Building Strong Teacher-Para Partnerships", started: 12, completed70: 4, inProgress: 8, completionRate: 33, avgProgress: 4 },
    { name: "Connected Educators: Building Networks for Bite-Sized Professional Growth", started: 9, completed70: 2, inProgress: 7, completionRate: 22, avgProgress: 3 },
    { name: "Understanding Student Needs & Modifications", started: 9, completed70: 5, inProgress: 4, completionRate: 56, avgProgress: 5 },
    { name: "Maximize Impact: One-on-One Student Conferences", started: 8, completed70: 4, inProgress: 4, completionRate: 50, avgProgress: 4 },
  ];

  // School-level engagement data (with real course metrics and survey data)
  const schoolData = [
    {
      id: 'wesley',
      name: 'Wesley',
      engagement: {
        engagedParas: 11,
        totalActivities: 26,
        topCourses: [
          { name: 'Understanding Student Needs & Modifications', count: 5, avgProgress: 66 },
          { name: 'Paraprofessional Foundations', count: 4, avgProgress: 100 },
          { name: 'Streamline Your Inbox: Email Management', count: 4, avgProgress: 65 },
        ],
      },
      survey: { responses: 2, asking: null, feedback: null, limitedData: true },
      implementation: { asking: null, feedback: null },
      medals: [
        { type: 'gold', label: 'Above 90% Club' },
        { type: 'bronze', label: 'Strong Login Rate' },
      ],
      paras: [
        { name: 'Delgado, Beatriz', email: 'bdelgado@asd4.org', loggedIn: true },
        { name: 'Garcia, Claudia', email: 'cgarcia@asd4.org', loggedIn: true },
        { name: 'Simone, Patricia', email: 'psimone@asd4.org', loggedIn: true },
        { name: 'Padilla, Jayla', email: 'japadilla@asd4.org', loggedIn: true },
        { name: 'Tirado, Carmen', email: 'ctirado@asd4.org', loggedIn: true },
        { name: 'Reyes, Kelly', email: 'kreyes@asd4.org', loggedIn: true },
        { name: 'Velazquez, Melissa', email: 'mvelazquez@asd4.org', loggedIn: true },
        { name: 'Alecksen, Michelle', email: 'malecksen@asd4.org', loggedIn: true },
        { name: 'Balbuena, Ingrid', email: 'ibalbuena@asd4.org', loggedIn: true },
        { name: 'Baumgartner, Allison', email: 'abaumgartner@asd4.org', loggedIn: true },
        { name: 'Boucekkine, Beata', email: 'bboucekkine@asd4.org', loggedIn: true },
        { name: 'Figueroa, Iliana', email: 'ifsanchez@asd4.org', loggedIn: true },
        { name: 'Padilla, Jackie', email: 'jpadilla@asd4.org', loggedIn: true },
        { name: 'Perez, Jennifer', email: 'jperez@asd4.org', loggedIn: true },
      ],
    },
    {
      id: 'indian-trail',
      name: 'Indian Trail',
      engagement: {
        engagedParas: 9,
        totalActivities: 16,
        topCourses: [
          { name: 'Effective Small-Group & One-on-One Instruction', count: 4, avgProgress: 54 },
          { name: 'Paraprofessional Foundations', count: 4, avgProgress: 52 },
          { name: 'Classroom Management Toolkit', count: 2, avgProgress: 28 },
        ],
      },
      survey: { responses: 12, asking: 3.75, feedback: 3.83, limitedData: false },
      implementation: { asking: 83, feedback: 67 },
      medals: [
        { type: 'gold', label: '100% Survey Response' },
        { type: 'gold', label: 'Above 90% Club' },
        { type: 'silver', label: 'Engaged Team' },
      ],
      paras: [
        { name: 'Gorostieta, Michele', email: 'mgorostieta@asd4.org', loggedIn: true },
        { name: 'Beahan, Linda', email: 'lbeahan@asd4.org', loggedIn: true },
        { name: 'Magnuson, Karen', email: 'kmagnuson@asd4.org', loggedIn: true },
        { name: 'Pajova, Albana', email: 'apajova@asd4.org', loggedIn: true },
        { name: 'Hodo, Mirela', email: 'mhodo@asd4.org', loggedIn: false },
        { name: 'Miller, Paula', email: 'pmiller@asd4.org', loggedIn: true },
        { name: 'Judd, Marisa', email: 'mjudd@asd4.org', loggedIn: true },
        { name: 'Juarez, Alexia', email: 'ajuarez@asd4.org', loggedIn: true },
        { name: 'Salerno, Cori', email: 'csalerno@asd4.org', loggedIn: true },
        { name: 'Zarate, Claudia', email: 'czarate@asd4.org', loggedIn: true },
        { name: 'Sanchez, Maria', email: 'msanchez@asd4.org', loggedIn: true },
        { name: 'Zaborowski, Samantha', email: 'szaborowski@asd4.org', loggedIn: true },
        { name: 'Herrera, Elizabeth', email: 'eherrera@asd4.org', loggedIn: true },
        { name: 'Cortez, Maria', email: 'mcortez@asd4.org', loggedIn: false },
      ],
    },
    {
      id: 'lincoln',
      name: 'Lincoln',
      engagement: {
        engagedParas: 9,
        totalActivities: 13,
        topCourses: [
          { name: 'Paraprofessional Foundations', count: 3, avgProgress: 51 },
          { name: 'Connected Educators: Building Networks', count: 2, avgProgress: 25 },
          { name: 'Maximize Impact: One-on-One Conferences', count: 2, avgProgress: 55 },
        ],
      },
      survey: { responses: 10, asking: 4.10, feedback: 4.00, limitedData: false },
      implementation: { asking: 89, feedback: 56 },
      medals: [
        { type: 'gold', label: '100% Login Rate' },
        { type: 'gold', label: 'Confidence Leader: Feedback (4.00)' },
        { type: 'gold', label: 'Above 90% Club' },
        { type: 'silver', label: 'High Confidence: Asking (4.10)' },
      ],
      note: 'Lincoln has 100% login rate and the highest feedback confidence across all schools.',
      paras: [
        { name: 'Hawkins, Michelina', email: 'mhawkins@asd4.org', loggedIn: true },
        { name: 'Aguilar, Denys', email: 'daguilar@asd4.org', loggedIn: true },
        { name: 'Chavez, Carlos', email: 'cchavez@asd4.org', loggedIn: true },
        { name: 'Lopez-Castaneda, Victoria', email: 'vcastaneda@asd4.org', loggedIn: true },
        { name: 'Montalvo, Jazzleen', email: 'jmontalvo@asd4.org', loggedIn: true },
        { name: 'Ortiz, Maria', email: 'mortiz@asd4.org', loggedIn: true },
        { name: 'Torres, Manuela', email: 'matorres@asd4.org', loggedIn: true },
        { name: 'Arredondo, Gregoria', email: 'garredondo@asd4.org', loggedIn: true },
        { name: 'Marinelli, Rosemarie', email: 'rmarinelli@asd4.org', loggedIn: true },
        { name: 'Iturbe Vaszquez, Xochitl', email: 'xiturbevazquez@asd4.org', loggedIn: true },
      ],
    },
    {
      id: 'stone',
      name: 'Stone',
      engagement: {
        engagedParas: 7,
        totalActivities: 10,
        topCourses: [
          { name: 'Paraprofessional Foundations', count: 5, avgProgress: 67 },
          { name: 'Building Strong Teacher-Para Partnerships', count: 1, avgProgress: 100 },
          { name: 'Differentiated Choice Boards', count: 1, avgProgress: 100 },
        ],
      },
      survey: { responses: 8, asking: 3.25, feedback: 3.50, limitedData: false },
      implementation: { asking: 88, feedback: 38 },
      medals: [
        { type: 'silver', label: 'Strong Login Rate' },
        { type: 'bronze', label: 'Implementing Questions (88%)' },
      ],
      note: 'Stone has the lowest confidence in asking questions and feedback implementation. This building may benefit from targeted support during Late Start Days.',
      paras: [
        { name: 'Castro, Caprice', email: 'ccastro@asd4.org', loggedIn: true },
        { name: 'Gorostieta, Jessica', email: 'jgorostieta@asd4.org', loggedIn: true },
        { name: 'Vairo, Danielle', email: 'dvairo@asd4.org', loggedIn: true },
        { name: 'Wojnicki, Tracy', email: 'twojnicki@asd4.org', loggedIn: true },
        { name: 'Camaci, Franchesca', email: 'fcamaci@asd4.org', loggedIn: true },
        { name: 'Dourlain, Karen', email: 'kdourlain@asd4.org', loggedIn: true },
        { name: 'Lanzo, Brittany', email: 'blanzo@asd4.org', loggedIn: false },
        { name: 'Navarrete, Ericka', email: 'enavarrete@asd4.org', loggedIn: true },
        { name: 'Umana, Melvi', email: 'mumana@asd4.org', loggedIn: true },
        { name: 'Wheeler, Michelle', email: 'mwheeler@asd4.org', loggedIn: true },
        { name: 'Schlesser, Patricia', email: 'pschlesser@asd4.org', loggedIn: false },
        { name: 'Leveille, Amanda', email: 'aleveille@asd4.org', loggedIn: true },
      ],
    },
    {
      id: 'fullerton',
      name: 'Fullerton',
      engagement: {
        engagedParas: 5,
        totalActivities: 10,
        topCourses: [
          { name: 'Building Strong Teacher-Para Partnerships', count: 2, avgProgress: 76 },
          { name: 'Paraprofessional Foundations', count: 2, avgProgress: 86 },
          { name: 'Differentiated Choice Boards', count: 1, avgProgress: 5 },
        ],
      },
      survey: { responses: 12, asking: 4.08, feedback: 3.67, limitedData: false },
      implementation: { asking: 90, feedback: 80 },
      medals: [
        { type: 'gold', label: 'Above 90% Club' },
        { type: 'silver', label: 'High Confidence: Asking (4.08)' },
        { type: 'silver', label: 'Feedback Implementation (80%)' },
      ],
      paras: [
        { name: 'Bekhrani, Fatema', email: 'fbakhrani@asd4.org', loggedIn: true },
        { name: 'Guzman, Norma', email: 'nguzman@asd4.org', loggedIn: true },
        { name: 'Gremo, Nancy', email: 'ngremo@asd4.org', loggedIn: false },
        { name: 'Nyquist, Scott', email: 'snyquist@asd4.org', loggedIn: true },
        { name: 'Migas, Paulina', email: 'pmigas@asd4.org', loggedIn: true },
        { name: 'Roeglin, Jonathan', email: 'jroeglin@asd4.org', loggedIn: true },
        { name: 'Castillo, Evelyn', email: 'evcastillo@asd4.org', loggedIn: true },
        { name: 'Dunkel, Mary', email: 'mdunkel@asd4.org', loggedIn: true },
        { name: 'Garcia, Esperanza', email: 'egarcia@asd4.org', loggedIn: true },
        { name: 'Garcia, Maria', email: 'msgarcia@asd4.org', loggedIn: true },
        { name: 'Hendricks, Sarah', email: 'shendricks@asd4.org', loggedIn: true },
        { name: 'Garica, Jacquelynn', email: 'jagarcia@asd4.org', loggedIn: true },
        { name: 'Orellana, Kristina', email: 'korellana@asd4.org', loggedIn: true },
      ],
    },
    {
      id: 'lake-park',
      name: 'Lake Park',
      engagement: {
        engagedParas: 4,
        totalActivities: 10,
        topCourses: [
          { name: 'Maximize Impact: One-on-One Conferences', count: 3, avgProgress: 76 },
          { name: 'Classroom Management Toolkit', count: 2, avgProgress: 100 },
          { name: 'Differentiated Choice Boards', count: 2, avgProgress: 100 },
        ],
      },
      survey: { responses: 4, asking: 4.50, feedback: 3.50, limitedData: true },
      implementation: { asking: 75, feedback: 50 },
      medals: [
        { type: 'silver', label: 'Highest Asking Confidence (4.50)' },
        { type: 'bronze', label: 'Growing Team' },
      ],
      note: 'Lake Park paras who responded show the highest asking confidence in the district. Login rate and survey participation need attention — a targeted walkthrough at the next staff meeting is recommended.',
      paras: [
        { name: 'Alvarado, Patricia', email: 'palvarado@asd4.org', loggedIn: true },
        { name: 'Marquez, Claudia', email: 'cmarquez@asd4.org', loggedIn: true },
        { name: 'Ontiveros, Maribel', email: 'montiveros@asd4.org', loggedIn: false },
        { name: 'Villalobos, Natalia', email: 'nvillalobos@asd4.org', loggedIn: false },
        { name: 'Chairez Rodriguez, Sabina', email: 'schairez@asd4.org', loggedIn: true },
        { name: 'DeLaGarza, Sandra', email: 'sdelagarza@asd4.org', loggedIn: true },
        { name: 'Chaudary, Aysha', email: 'achaudary@asd4.org', loggedIn: false },
        { name: 'Falco, Mary', email: 'mfalco@asd4.org', loggedIn: false },
        { name: 'Martinez, Eriana', email: 'ermartinez@asd4.org', loggedIn: true },
        { name: 'Mayer, Shelly', email: 'smayer@asd4.org', loggedIn: true },
        { name: 'Medina, Ruby', email: 'rmedina@asd4.org', loggedIn: true },
        { name: 'Trujillo, Fabiola', email: 'ftrujillo@asd4.org', loggedIn: true },
      ],
    },
    {
      id: 'army-trail',
      name: 'Army Trail',
      engagement: {
        engagedParas: 4,
        totalActivities: 4,
        topCourses: [
          { name: 'Classroom Management Toolkit', count: 1, avgProgress: 36 },
          { name: 'Connected Educators: Building Networks', count: 1, avgProgress: 38 },
          { name: 'Effective Communication Strategies', count: 1, avgProgress: 28 },
        ],
      },
      survey: { responses: 6, asking: 3.83, feedback: 3.67, limitedData: false },
      implementation: { asking: 100, feedback: 67 },
      medals: [
        { type: 'gold', label: 'Ask Implementation (100%)' },
        { type: 'bronze', label: 'Growing Login Rate' },
      ],
      paras: [
        { name: 'Zaragoza Aguilar, Ana', email: 'azaragoza@asd4.org', loggedIn: true },
        { name: 'Cantu, Imelda', email: 'icantu@asd4.org', loggedIn: true },
        { name: 'Anweiler-Stanford, Nicole', email: 'nstanford@asd4.org', loggedIn: true },
        { name: 'Colbert, Kristine', email: 'kcolbert@asd4.org', loggedIn: false },
        { name: 'Hoppensteadt, Emilia', email: 'ehoppensteadt@asd4.org', loggedIn: true },
        { name: 'Marquez, Maribel', email: 'mmarquez@asd4.org', loggedIn: false },
        { name: 'Martinez, Giselle', email: 'gmartinez@asd4.org', loggedIn: true },
        { name: 'Perez, Mariela', email: 'maperez@asd4.org', loggedIn: true },
        { name: 'Roman, Abigail', email: 'aroman@asd4.org', loggedIn: true },
        { name: 'Samayoa, Yadira', email: 'ysamayoa@asd4.org', loggedIn: true },
        { name: 'Villegas, Giovanni', email: 'gvillegas@asd4.org', loggedIn: true },
        { name: 'Lugo Saldivar, Selene', email: 'slugo@asd4.org', loggedIn: true },
      ],
    },
    {
      id: 'ardmore',
      name: 'Ardmore',
      engagement: {
        engagedParas: 0,
        totalActivities: 0,
        topCourses: [],
      },
      survey: { responses: 3, asking: 3.33, feedback: 3.67, limitedData: true },
      implementation: { asking: 100, feedback: 67 },
      medals: [
        { type: 'gold', label: 'First to 100% Login' },
        { type: 'gold', label: 'Ask Implementation (100%)' },
        { type: 'silver', label: 'All In (100% survey response)' },
      ],
      paras: [
        { name: 'Mondragon, Sugey', email: 'smondragon@asd4.org', loggedIn: true },
        { name: 'Peters, Maddalena', email: 'mpeters@asd4.org', loggedIn: true },
        { name: 'Weissgerber, Sara', email: 'sweissgerber@asd4.org', loggedIn: true },
      ],
    },
    {
      id: 'elc',
      name: 'ELC (Early Learning Center)',
      engagement: {
        engagedParas: 0,
        totalActivities: 0,
        topCourses: [],
      },
      survey: { responses: 20, asking: 3.90, feedback: 3.75, limitedData: false },
      implementation: { asking: 95, feedback: 90 },
      medals: [
        { type: 'gold', label: 'Feedback Implementation Leader (90%)' },
        { type: 'gold', label: 'Most Represented (20 survey responses)' },
        { type: 'silver', label: 'Strong Confidence' },
      ],
      note: 'ELC has the strongest feedback implementation in the district at 90%. Login rate is lower — a dedicated walkthrough session would help close the gap.',
      paras: [
        { name: 'Katherine De La Cruz', email: 'kdelacruz@asd4.org', loggedIn: true },
        { name: 'Melanie Diaz', email: 'mdiaz@asd4.org', loggedIn: true },
        { name: 'Rosa Torres', email: 'rtorres@asd4.org', loggedIn: true },
        { name: 'Yasmin Villa Casillas', email: 'yvillacasillas@asd4.org', loggedIn: false },
        { name: 'Esmeralda Calderon', email: 'ecalderon@asd4.org', loggedIn: true },
        { name: 'Marcela Lara Ruiz', email: 'mruiz@asd4.org', loggedIn: true },
        { name: 'Giselle Galvan', email: 'ggalvan@asd4.org', loggedIn: false },
        { name: 'Irma Robles', email: 'irobles@asd4.org', loggedIn: false },
        { name: 'Jacqueline Vazquez', email: 'jvazquez@asd4.org', loggedIn: true },
        { name: 'Miriam Carbajal', email: 'mcarbajal@asd4.org', loggedIn: true },
        { name: 'Leslie Olvera', email: 'lolvera@asd4.org', loggedIn: true },
        { name: 'Nuvia Rodriguez Luna', email: 'nurodriguez@asd4.org', loggedIn: true },
        { name: 'Marie Cano', email: 'mcano@asd4.org', loggedIn: false },
        { name: 'Anahi Carrera', email: 'ancarrera@asd4.org', loggedIn: true },
        { name: 'Yesenia Perez', email: 'yperez@asd4.org', loggedIn: true },
        { name: 'Michelle Samples', email: 'msamples@asd4.org', loggedIn: true },
        { name: 'Daniela Juarez', email: 'djuarez@asd4.org', loggedIn: false },
        { name: 'Mayra Saucedo', email: 'msaucedo@asd4.org', loggedIn: true },
        { name: 'Katherine Ruffolo', email: 'kruffolo@asd4.org', loggedIn: true },
        { name: 'Maria Lopez', email: 'mlopez@asd4.org', loggedIn: true },
        { name: 'Ruby Valois-Suarez', email: 'rvalois@asd4.org', loggedIn: true },
        { name: 'Kimberly Martinez', email: 'kmartinez@asd4.org', loggedIn: true },
        { name: 'Kayla Carrillo', email: 'kcarrillo@asd4.org', loggedIn: true },
      ],
    },
  ];

  const notLoggedInParas = [
    // ELC (5)
    { name: "Yasmin Villa Casillas", email: "yvillacasillas@asd4.org", school: "ELC" },
    { name: "Giselle Galvan", email: "ggalvan@asd4.org", school: "ELC" },
    { name: "Irma Robles", email: "irobles@asd4.org", school: "ELC" },
    { name: "Marie Cano", email: "mcano@asd4.org", school: "ELC" },
    { name: "Daniela Juarez", email: "djuarez@asd4.org", school: "ELC" },
    // Lake Park (4)
    { name: "Maribel Ontiveros", email: "montiveros@asd4.org", school: "Lake Park" },
    { name: "Natalia Villalobos", email: "nvillalobos@asd4.org", school: "Lake Park" },
    { name: "Aysha Chaudary", email: "achaudary@asd4.org", school: "Lake Park" },
    { name: "Mary Falco", email: "mfalco@asd4.org", school: "Lake Park" },
    // Army Trail (2)
    { name: "Kristine Colbert", email: "kcolbert@asd4.org", school: "Army Trail" },
    { name: "Maribel Marquez", email: "mmarquez@asd4.org", school: "Army Trail" },
    // Stone (2)
    { name: "Brittany Lanzo", email: "blanzo@asd4.org", school: "Stone" },
    { name: "Patricia Schlesser", email: "pschlesser@asd4.org", school: "Stone" },
    // Fullerton (1)
    { name: "Nancy Gremo", email: "ngremo@asd4.org", school: "Fullerton" },
    // Indian Trail (2)
    { name: "Mirela Hodo", email: "mhodo@asd4.org", school: "Indian Trail" },
    { name: "Maria Cortez", email: "mcortez@asd4.org", school: "Indian Trail" },
  ];

  // Send individual nudge email via Gmail
  const sendNudgeEmail = (para: { name: string; email: string }) => {
    const firstName = para.name.split(' ')[0];

    const subject = 'Quick help getting into the TDI Learning Hub';

    const body = `Hi ${firstName},

I noticed you haven't had a chance to log into the TDI Learning Hub yet -  no worries, just wanted to make sure you have what you need.

This isn't like typical PD -  it's short, practical stuff you can actually use. No 3-hour sessions, no sitting and listening. Just strategies from real educators.

Here's how to get in:
1. Go to: tdi.thinkific.com
2. Log in with your @asd4.org email
3. Try "Paraprofessional Foundations" -  it's a quick win

Let me know if you run into any issues and I'll help you out.`;

    openGmail({ to: para.email, subject, body });
  };

  // Generate "Nudge All" bulk email (BCC for privacy)
  const sendNudgeAllEmail = () => {
    const allEmails = notLoggedInParas.map(p => p.email);

    const subject = 'A quick note about the TDI Learning Hub';

    const body = `Hi team,

Quick check-in -  some of you haven't had a chance to log into the TDI Learning Hub yet, and I wanted to make sure you have what you need to get started.

I know "professional development" can feel like one more thing on your plate. But this one's different -  short, practical strategies you can actually use. No sitting through hours of slides.

Here's how to get in:
1. Go to: tdi.thinkific.com
2. Log in with your @asd4.org email
3. Start with "Paraprofessional Foundations" -  it's a good first step

If you'd like, we can do a quick 15-minute walkthrough at our next meeting. Just let me know.

Thanks for everything you do.`;

    // Using BCC for privacy so recipients don't see each other's emails
    openGmail({ bcc: allEmails, subject, body });
  };

  // Generate "High Five" celebration email for top performers
  const sendHighFiveEmail = (para: { name: string; email: string; logins: number; lastActive: string }) => {
    const firstName = para.name.split(' ')[0];

    const subject = 'Thank you for leading the way';

    const body = `Hi ${firstName},

I was looking at our TDI Learning Hub progress and wanted to reach out personally.

You've logged in ${para.logins} times and are one of our most active paras on the platform. That kind of dedication doesn't go unnoticed.

I know your time is limited and there's always more to do. The fact that you're investing in your own growth shows real commitment to our students and to yourself.

Thank you for setting the example. It matters more than you know.`;

    openGmail({ to: para.email, subject, body });
  };

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    // Scroll to tab content area so user sees the tab they selected
    tabContentRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Eye },
    { id: 'partnership', label: 'Our Partnership', icon: Heart },
    { id: 'schools', label: 'Schools', icon: School },
    { id: 'blueprint', label: 'Blueprint', icon: Star },
    { id: 'year2', label: '2026-27', icon: Sparkles, badge: 'Preview' },
    { id: 'team', label: 'Team', icon: User },
    { id: 'billing', label: 'Billing', icon: CreditCard },
  ];

  // March 2, 2026 Check-In Survey Data (95 of 114 paras responded - 83%)
  const marchSurveyData = {
    responseRate: { responded: 95, total: 114, percentage: 83 },
    confidence: {
      asking: { average: 3.92, rated4or5: 75 },
      feedback: { average: 3.71, rated4or5: 67 }
    },
    retention: {
      planToReturn: { count: 67, percentage: 71 },
      notSure: { count: 22, percentage: 23 },
      notReturning: { count: 6, percentage: 6 }
    },
    challenges: [
      { category: 'Workload / Time', count: 28, percentage: 29 },
      { category: 'Student Behavior', count: 24, percentage: 25 },
      { category: 'Communication with Teachers', count: 18, percentage: 19 },
      { category: 'Feeling Valued', count: 15, percentage: 16 },
      { category: 'None / Doing Great', count: 10, percentage: 11 }
    ],
    hubUsage: {
      usedRecently: { count: 31, percentage: 33 },
      planToUse: { count: 42, percentage: 44 },
      notUsed: { count: 22, percentage: 23 }
    }
  };

  // School-level retention risk data
  const schoolRetentionData = [
    { school: 'Ardmore', total: 8, returning: 7, notSure: 1, notReturning: 0, riskLevel: 'low' },
    { school: 'ELC', total: 24, returning: 15, notSure: 6, notReturning: 3, riskLevel: 'high' },
    { school: 'Fullerton', total: 12, returning: 9, notSure: 2, notReturning: 1, riskLevel: 'medium' },
    { school: 'Indian Trail', total: 13, returning: 10, notSure: 3, notReturning: 0, riskLevel: 'low' },
    { school: 'Lake Park', total: 9, returning: 5, notSure: 3, notReturning: 1, riskLevel: 'high' },
    { school: 'Lincoln', total: 10, returning: 7, notSure: 2, notReturning: 1, riskLevel: 'medium' },
    { school: 'Stone', total: 14, returning: 10, notSure: 3, notReturning: 1, riskLevel: 'medium' },
    { school: 'Westfield', total: 10, returning: 8, notSure: 2, notReturning: 0, riskLevel: 'low' },
    { school: 'Wesley', total: 14, returning: 11, notSure: 2, notReturning: 1, riskLevel: 'low' }
  ];

  return (
    <div className="min-h-screen bg-[#F5F5F5] overflow-x-hidden">
      {/* Compact Navigation */}
      <nav className="bg-[#1e2749] sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            <div className="flex items-center gap-3">
              <span className="bg-white text-[#1e2749] px-2 py-1 rounded text-xs font-extrabold tracking-wide">TDI</span>
              <span className="text-white font-semibold hidden sm:inline">Teachers Deserve It</span>
              <span className="text-white/60 hidden md:inline">| Partner Dashboard</span>
            </div>
            <a
              href="https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#35A7FF] hover:bg-[#2589db] text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Schedule Session</span>
            </a>
          </div>
        </div>
      </nav>

      {/* Compact Hero */}
      <section className="relative text-white py-6 px-4 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/images/asd4-hero.jpg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1e2749]/95 via-[#1e2749]/90 to-[#1e2749]/85" />

        <div className="relative max-w-5xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Addison School District 4</h1>
            <p className="text-white/80 text-sm">Addison, Illinois | Paraprofessional Partnership</p>
          </div>
          <div className="text-sm">
            <div className="bg-white/10 px-3 py-2 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-white/60">Status:</span>
                <span
                  className="font-semibold text-[#1e2749] bg-white px-2 py-0.5 rounded cursor-help"
                  title="Building your foundation with a pilot group"
                >
                  Phase 1 - IGNITE
                </span>
              </div>
              <p className="text-white/70 text-xs mt-1">Building your foundation with a pilot group</p>
              <button
                onClick={() => handleTabClick('blueprint')}
                className="text-[#35A7FF] hover:text-[#5bb8ff] text-xs mt-1 hover:underline"
              >
                See full Blueprint →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-14 z-40 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex justify-center gap-2 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`relative flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-[#1e2749] text-white shadow-md'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="text-xs bg-[#35A7FF] text-white px-2 py-0.5 rounded-full">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div ref={tabContentRef} className="max-w-5xl mx-auto px-4 py-6">

        {/* ==================== OVERVIEW TAB ==================== */}
        {activeTab === 'overview' && (
          <div className="space-y-6">

            {/* Section 1: Stats Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-[#38618C]">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="w-4 h-4 text-[#38618C]" />
                  <span className="text-xs text-gray-500 uppercase">Paras Enrolled</span>
                  <Tooltip text="Total paraprofessionals with Learning Hub access." position="bottom" iconSize={12} />
                </div>
                <div className="text-2xl font-bold text-[#1e2749]">114/114</div>
                <div className="text-xs text-[#38618C] font-medium">Hub Access</div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-[#38618C]">
                <div className="flex items-center gap-2 mb-1">
                  <LogIn className="w-4 h-4 text-[#38618C]" />
                  <span className="text-xs text-gray-500 uppercase">Hub Logins</span>
                  <Tooltip text="Percentage of enrolled paras who have logged into the Learning Hub at least once. Industry average is ~40%." position="bottom" iconSize={12} />
                </div>
                <div className="text-2xl font-bold text-[#1e2749]">85%</div>
                <div className="text-xs text-[#38618C] font-medium">97/114 logged in</div>
                <div className="text-xs text-gray-400 mt-1">Goal: 100% — Observation Day 1 is March 3</div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-emerald-500">
                <div className="flex items-center gap-2 mb-1">
                  <Trophy className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs text-gray-500 uppercase">Course Completions</span>
                  <Tooltip text="Total courses completed by paras — each one represents strategies ready to use in classrooms." position="bottom" iconSize={12} />
                </div>
                <div className="text-2xl font-bold text-emerald-600">91</div>
                <div className="text-xs text-emerald-600 font-medium">courses completed</div>
                <div className="text-xs text-gray-400 mt-1">27+ paras exploring courses</div>
              </div>

              <div
                onClick={() => {
                  document.getElementById('needs-attention-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-[#E07A5F] cursor-pointer hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-2 mb-1">
                  <AlertCircle className="w-4 h-4 text-[#E07A5F]" />
                  <span className="text-xs text-gray-500 uppercase">Needs Attention</span>
                  <Tooltip text="Action items to complete for your partnership. Click to view details." position="bottom" iconSize={12} />
                </div>
                <div className="text-2xl font-bold text-[#E07A5F]">{needsAttentionItems.filter(item => !isComplete(item.id)).length}</div>
                <div className="text-xs text-[#E07A5F] font-medium">Items pending</div>
              </div>
            </div>

            {/* Current Phase - Compact Inline */}
            <div className="flex items-center gap-3 bg-[#ffba06]/10 border border-[#ffba06]/30 rounded-lg px-4 py-2">
              <Flame className="w-5 h-5 text-[#ffba06]" />
              <span className="text-sm font-semibold text-[#1e2749]">Current Phase:</span>
              <span className="text-sm font-bold text-[#ffba06]">IGNITE</span>
              <span className="text-xs text-gray-500">(Phase 1 — Building Foundation)</span>
            </div>

            {/* HERO: Implementation Card - FULL WIDTH with Tiered Comparison */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-5 h-5 text-[#38618C]" />
                <h3 className="text-lg font-bold text-[#1e2749]">ASD4 Implementation — After 2 Sessions</h3>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                {/* Move #1 */}
                <div className="bg-[#ffba06]/10 rounded-xl p-4 border border-[#ffba06]/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-[#1e2749]">Move #1: Questions Instead of Telling</span>
                    <span className="text-3xl font-bold text-[#ffba06]">91%</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">69 of 76 paras who attended Part 1 are implementing</p>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="bg-[#ffba06] h-3 rounded-full" style={{width: '91%'}}></div>
                  </div>
                </div>

                {/* Move #2 */}
                <div className="bg-teal-50 rounded-xl p-4 border border-teal-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-[#1e2749]">Move #2: Feedback Formula</span>
                    <span className="text-3xl font-bold text-teal-600">70%</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">53 of 76 paras who attended Part 1 are implementing</p>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="bg-teal-500 h-3 rounded-full" style={{width: '70%'}}></div>
                  </div>
                </div>
              </div>

              {/* Tiered Comparison */}
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">How this compares:</p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600 w-28">Industry Avg</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div className="bg-gray-400 h-2 rounded-full" style={{width: '10%'}}></div>
                    </div>
                    <span className="text-sm font-medium text-gray-500 w-12 text-right">10%</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600 w-28">TDI Partners</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div className="bg-[#ffba06]/50 h-2 rounded-full" style={{width: '65%'}}></div>
                    </div>
                    <span className="text-sm font-medium text-[#ffba06] w-12 text-right">65%</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-[#1e2749] w-28">ASD4 Paras</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div className="bg-gradient-to-r from-[#ffba06] to-teal-500 h-2 rounded-full" style={{width: '91%'}}></div>
                    </div>
                    <span className="text-sm font-bold text-[#1e2749] w-12 text-right">91%</span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-gray-400 mt-4 text-center">Self-reported after 2 in-person sessions · 62 practice reps · Survey Feb 13, 2026</p>
            </div>

            {/* Two-Card Row: Status Indicators */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Card 1: Wins */}
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-green-800">Exec Session 1 Complete</p>
                  <p className="text-sm text-green-600">1/2 Exec · 5 sessions scheduled · 97 paras logged in</p>
                </div>
              </div>

              {/* Card 2: 17 Paras Remaining */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Lightbulb className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <p className="font-semibold text-amber-800">17 Paras Remaining</p>
                  <p className="text-sm text-amber-600">Try a walkthrough at your next meeting</p>
                </div>
              </div>
            </div>

            {/* What Your Paras Are Saying */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <Quote className="w-5 h-5 text-[#38618C]" />
                <h3 className="text-lg font-bold text-[#1e2749]">What Your Paras Are Saying</h3>
              </div>
              <div className="space-y-4">
                <div className="border-l-2 border-[#38618C]/30 pl-4">
                  <p className="text-sm text-gray-700 italic">&ldquo;It was helpful collaborating with my peers and hearing their responses to different situations.&rdquo;</p>
                  <p className="text-xs text-gray-500 mt-1">— Lincoln Elementary</p>
                </div>
                <div className="border-l-2 border-[#38618C]/30 pl-4">
                  <p className="text-sm text-gray-700 italic">&ldquo;A lot of these games are relatable to our students that we work with. It&apos;s nice to also chat and discuss these students/situations together with our co-workers. Since we don&apos;t get time to discuss or chat about work. Thank you!&rdquo;</p>
                  <p className="text-xs text-gray-500 mt-1">— Stone Elementary</p>
                </div>
                <div className="border-l-2 border-[#38618C]/30 pl-4">
                  <p className="text-sm text-gray-700 italic">&ldquo;I really enjoyed the session because you guide us how we can help our students better.&rdquo;</p>
                  <p className="text-xs text-gray-500 mt-1">— Fullerton Elementary</p>
                </div>
                <div className="border-l-2 border-[#38618C]/30 pl-4">
                  <p className="text-sm text-gray-700 italic">&ldquo;Me encanta este tipo de sesiones de gran aprendizaje y practica para luego llevarlo a cabo a los estudiantes.&rdquo;</p>
                  <p className="text-xs text-gray-500 mt-1">I love this type of session — great learning and practice to carry out with students.</p>
                  <p className="text-xs text-gray-500">— Lincoln Elementary</p>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-4 text-center">From post-session survey · February 13, 2026</p>
            </div>

            {/* Section 2: Needs Attention */}
            <div id="needs-attention-section" className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center gap-2 mb-5">
                <AlertCircle className="w-5 h-5 text-[#E07A5F]" />
                <h3 className="text-lg font-bold text-[#1e2749]">Needs Attention</h3>
                <span className="bg-[#E07A5F]/10 text-[#E07A5F] text-xs font-medium px-2 py-0.5 rounded-full">
                  {needsAttentionItems.filter(item => !isComplete(item.id)).length} items
                </span>
              </div>

              {/* Priority Now Section */}
              {needsAttentionItems.filter(item => item.priority === 'now' && !isComplete(item.id)).length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-semibold text-[#E07A5F] uppercase tracking-wide mb-3">
                    Priority Now ({needsAttentionItems.filter(item => item.priority === 'now' && !isComplete(item.id)).length})
                  </p>
                  <div className="space-y-3">
                    {needsAttentionItems
                      .filter(item => item.priority === 'now' && !isComplete(item.id))
                      .map(item => (
                        <div
                          key={item.id}
                          className="p-4 rounded-xl border-l-4 border-[#E07A5F] bg-gray-50"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-[#E07A5F]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                <item.icon className="w-5 h-5 text-[#E07A5F]" />
                              </div>
                              <div>
                                <div className="font-medium text-[#1e2749]">{item.title}</div>
                                <p className="text-sm text-gray-500">{item.description}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-xs text-gray-400 hidden sm:inline">RESPOND BY {item.deadline}</span>
                              <a
                                href={item.actionUrl}
                                target={item.external ? '_blank' : undefined}
                                rel={item.external ? 'noopener noreferrer' : undefined}
                                className="bg-[#1e2749] text-white px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap flex items-center gap-2 hover:bg-[#2d3a5c] transition-colors"
                              >
                                {item.showCalendar && <Calendar className="w-4 h-4" />}
                                {!item.showCalendar && <Mail className="w-4 h-4" />}
                                {item.actionLabel}
                              </a>
                              <button
                                onClick={() => toggleComplete(item.id)}
                                className="inline-flex items-center gap-1 px-3 py-2 bg-gray-100 hover:bg-emerald-100 text-gray-600 hover:text-emerald-700 text-sm font-medium rounded-lg transition-colors"
                                title="Mark as complete"
                              >
                                <Check className="w-4 h-4" />
                                Done
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Accordion Toggle */}
              {needsAttentionItems.filter(item => item.priority === 'upcoming' && !isComplete(item.id)).length > 0 && (
                <button
                  onClick={() => setShowAllItems(!showAllItems)}
                  className="w-full flex items-center justify-center gap-2 py-3 text-sm font-medium text-[#38618C] hover:text-[#2d4a6d] transition-colors border-t border-gray-100"
                >
                  <ChevronDown className={`w-4 h-4 transition-transform ${showAllItems ? 'rotate-180' : ''}`} />
                  {showAllItems ? 'Hide Additional Items' : `View All ${needsAttentionItems.filter(item => !isComplete(item.id)).length} Items`}
                </button>
              )}

              {/* Accordion Content - Upcoming Items */}
              {showAllItems && needsAttentionItems.filter(item => item.priority === 'upcoming' && !isComplete(item.id)).length > 0 && (
                <div className="space-y-3 pt-3 border-t border-gray-100">
                  {needsAttentionItems
                    .filter(item => item.priority === 'upcoming' && !isComplete(item.id))
                    .map(item => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-4 rounded-xl border-l-4 border-[#ffba06] bg-gray-50"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-[#ffba06]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                            <item.icon className="w-5 h-5 text-[#ffba06]" />
                          </div>
                          <div>
                            <div className="font-medium text-[#1e2749]">{item.title}</div>
                            <p className="text-sm text-gray-500">{item.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-400 hidden sm:inline">SCHEDULE BY {item.deadline}</span>
                          <a
                            href={item.actionUrl}
                            target={item.external ? '_blank' : undefined}
                            rel={item.external ? 'noopener noreferrer' : undefined}
                            className="bg-[#1e2749] text-white px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap flex items-center gap-2 hover:bg-[#2d3a5c] transition-colors"
                          >
                            {item.showCalendar && <Calendar className="w-4 h-4" />}
                            {item.actionLabel}
                          </a>
                          <button
                            onClick={() => toggleComplete(item.id)}
                            className="inline-flex items-center gap-1 px-3 py-2 bg-gray-100 hover:bg-emerald-100 text-gray-600 hover:text-emerald-700 text-sm font-medium rounded-lg transition-colors"
                            title="Mark as complete"
                          >
                            <Check className="w-4 h-4" />
                            Done
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}

              {/* Completed Items */}
              {needsAttentionItems.filter(item => isComplete(item.id)).length > 0 && (
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                    Completed ({needsAttentionItems.filter(item => isComplete(item.id)).length})
                  </div>
                  <div className="space-y-2">
                    {needsAttentionItems
                      .filter(item => isComplete(item.id))
                      .map(item => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg opacity-60"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
                              <Check className="w-4 h-4 text-emerald-600" />
                            </div>
                            <span className="text-gray-500 line-through">{item.title}</span>
                          </div>
                          <button
                            onClick={() => toggleComplete(item.id)}
                            className="text-xs text-gray-400 hover:text-gray-600 underline"
                          >
                            Undo
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Virtual Sessions Flexibility Note */}
              <div className="mt-4 pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-500 italic">
                  <span className="font-medium">Note:</span> Virtual sessions are flexible — combine them back-to-back, spread them out, whatever works best for your team.
                </p>
              </div>
            </div>

            {/* Section 3: Recommendation Card */}
            <div className="bg-white border-l-4 border-[#38618C] rounded-r-xl p-5 shadow-sm">
              <div className="flex flex-col gap-4">
                <div className="flex-1">
                  <h3 className="text-[#1e2749] font-bold mb-2 flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-[#ffba06]" />
                    Recommendation: Dedicated Hub Time
                  </h3>
                  <p className="text-gray-600 text-sm mb-2">
                    Your paras are already at <strong className="text-[#38618C]">91% implementation</strong> — well above the TDI partner average of 65% and the industry average of 10%.
                  </p>
                  <p className="text-gray-600 text-sm mb-3">
                    Districts that build in 15-30 minutes of protected Hub time see these gains sustain and grow through the rest of the school year.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <a
                      href="#"
                      className="inline-flex items-center gap-2 text-[#38618C] hover:text-[#2d4a6d] font-medium text-sm transition-colors"
                    >
                      View Hub Walkthrough Guide
                      <ArrowRight className="w-4 h-4" />
                    </a>
                    <a
                      href="mailto:rae@teachersdeserveit.com"
                      className="inline-flex items-center gap-2 text-[#38618C] hover:text-[#2d4a6d] font-medium text-sm transition-colors"
                    >
                      Questions? Reach out to Rae →
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* 2026-27 Teaser */}
            <div
              className="bg-gradient-to-r from-[#1e2749] to-[#38618C] rounded-xl p-6 text-white cursor-pointer hover:shadow-lg transition-all hover:scale-[1.01]"
              onClick={() => handleTabClick('year2')}
            >
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-xs bg-white/20 px-3 py-1 rounded-full">Looking Ahead</span>
                  <h3 className="text-lg font-bold mt-2">2026-27 Partnership Plan — Year 2: ACCELERATE</h3>
                  <p className="text-sm opacity-80 mt-1">
                    Build on your <span className="text-[#ffba06] font-medium">91% implementation rate</span> with observation-based coaching cycles, building-level TDI Champions, and expanded teacher-para collaboration training.
                  </p>
                  <p className="text-sm mt-2">
                    <span className="text-[#ffba06] font-medium">72% of Year 1 TDI partners</span>
                    <span className="opacity-70"> continue to Year 2.</span>
                  </p>
                </div>
                <div className="text-right flex flex-col items-center">
                  <ArrowRight className="w-8 h-8" />
                  <p className="text-xs opacity-70">See Your 2026-27 Options</p>
                </div>
              </div>
            </div>

            {/* Partnership Period Footer */}
            <div className="text-center text-xs text-gray-400 mt-8 pt-4 border-t border-gray-100">
              Partnership Period: January 2026 -  May 2026 · Hub Access: Through January 2027
            </div>
          </div>
        )}

        {/* ==================== OUR PARTNERSHIP TAB ==================== */}
        {activeTab === 'partnership' && (
          <div className="space-y-8">

            {/* ===== SECTION 1: THE BIG PICTURE ===== */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-[#38618C]" />
                <h2 className="text-xl font-bold text-[#1e2749]">The Big Picture</h2>
              </div>

              {/* Partnership Goal */}
              <div className="bg-white rounded-xl p-8 shadow-sm text-center mb-6">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Target className="w-5 h-5 text-[#38618C]" />
                  <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Your Partnership Goal</span>
                </div>
                <p className="text-xl md:text-2xl font-semibold text-[#1e2749] max-w-2xl mx-auto leading-relaxed">
                  &ldquo;Empower paraprofessionals across all 9 buildings with immediate, actionable strategies — so every para supporting IEP, EL, and behavioral needs feels confident, valued, and making measurable impact.&rdquo;
                </p>
              </div>

              {/* Implementation Equation */}
              <div className="bg-gradient-to-r from-[#ffba06]/10 to-white rounded-xl p-6 border border-[#ffba06]/30 mb-6">
                <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-[#38618C] rounded-full flex items-center justify-center mx-auto mb-2">
                      <Users className="w-8 h-8 text-white" />
                    </div>
                    <p className="font-semibold text-[#1e2749]">Strong Paras</p>
                  </div>
                  <ArrowRight className="w-6 h-6 text-[#ffba06] rotate-90 md:rotate-0" />
                  <div className="text-center">
                    <div className="w-16 h-16 bg-[#38618C] rounded-full flex items-center justify-center mx-auto mb-2">
                      <Heart className="w-8 h-8 text-white" />
                    </div>
                    <p className="font-semibold text-[#1e2749]">Strong Support</p>
                  </div>
                  <ArrowRight className="w-6 h-6 text-[#ffba06] rotate-90 md:rotate-0" />
                  <div className="text-center">
                    <div className="w-16 h-16 bg-[#ffba06] rounded-full flex items-center justify-center mx-auto mb-2">
                      <Star className="w-8 h-8 text-[#1e2749]" />
                    </div>
                    <p className="font-semibold text-[#1e2749]">Student Success</p>
                  </div>
                </div>
              </div>

              {/* Phase Timeline */}
              <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
                <h3 className="text-lg font-bold text-[#1e2749] mb-6 text-center">Your Partnership Journey</h3>

                <div className="grid md:grid-cols-3 gap-4">
                  {/* Phase 1 - IGNITE (Current) */}
                  <div className="relative bg-gradient-to-br from-[#ffba06]/20 to-[#ffba06]/5 rounded-xl p-5 border-2 border-[#ffba06]">
                    <div className="absolute -top-3 left-4">
                      <span className="bg-[#ffba06] text-[#1e2749] text-xs font-bold px-3 py-1 rounded-full">YOU ARE HERE</span>
                    </div>
                    <div className="mt-2">
                      <div className="flex items-center gap-2 mb-2">
                        <Flame className="w-5 h-5 text-[#ffba06]" />
                        <h4 className="font-bold text-[#1e2749]">IGNITE</h4>
                      </div>
                      <p className="text-sm text-gray-500 mb-3">Phase 1 · Spring 2026</p>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-[#ffba06] flex-shrink-0 mt-0.5" />
                          Pilot group identification
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-[#ffba06] flex-shrink-0 mt-0.5" />
                          Baseline data collection
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-[#ffba06] flex-shrink-0 mt-0.5" />
                          First observations
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-[#ffba06] flex-shrink-0 mt-0.5" />
                          Growth Group formation
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* Phase 2 - ACCELERATE */}
                  <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 opacity-75">
                    <div className="flex items-center gap-2 mb-2">
                      <Rocket className="w-5 h-5 text-gray-400" />
                      <h4 className="font-bold text-gray-500">ACCELERATE</h4>
                    </div>
                    <p className="text-sm text-gray-400 mb-3">Phase 2 · Fall 2026</p>
                    <ul className="text-sm text-gray-400 space-y-1">
                      <li className="flex items-start gap-2">
                        <Circle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        Expand to full para team
                      </li>
                      <li className="flex items-start gap-2">
                        <Circle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        Multiple observation cycles
                      </li>
                      <li className="flex items-start gap-2">
                        <Circle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        Deeper implementation
                      </li>
                    </ul>
                  </div>

                  {/* Phase 3 - SUSTAIN */}
                  <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 opacity-75">
                    <div className="flex items-center gap-2 mb-2">
                      <Sprout className="w-5 h-5 text-gray-400" />
                      <h4 className="font-bold text-gray-500">SUSTAIN</h4>
                    </div>
                    <p className="text-sm text-gray-400 mb-3">Phase 3 · 2027+</p>
                    <ul className="text-sm text-gray-400 space-y-1">
                      <li className="flex items-start gap-2">
                        <Circle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        Internal leadership development
                      </li>
                      <li className="flex items-start gap-2">
                        <Circle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        Self-sustaining systems
                      </li>
                      <li className="flex items-start gap-2">
                        <Circle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        Culture embedded
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* District Snapshot - Collapsible */}
              <details className="bg-gradient-to-br from-[#1e2749] to-[#38618C] rounded-xl text-white group">
                <summary className="p-6 cursor-pointer list-none">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Building className="w-5 h-5" />
                      <h3 className="font-bold">District Snapshot</h3>
                      <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">From Partner Data Form</span>
                    </div>
                    <ChevronDown className="w-5 h-5 transition-transform group-open:rotate-180" />
                  </div>
                </summary>
                <div className="px-6 pb-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-white/60 uppercase tracking-wide mb-1">Para Types Served</p>
                      <p className="text-sm font-medium">Special Education/IEP · English Learners · Behavioral Support</p>
                    </div>
                    <div>
                      <p className="text-xs text-white/60 uppercase tracking-wide mb-1">Buildings</p>
                      <p className="text-sm font-medium">All 9 Schools</p>
                    </div>
                    <div>
                      <p className="text-xs text-white/60 uppercase tracking-wide mb-1">Success Metrics</p>
                      <p className="text-sm font-medium">Surveys + Para Retention</p>
                    </div>
                    <div>
                      <p className="text-xs text-white/60 uppercase tracking-wide mb-1">Quick Win Goal</p>
                      <p className="text-sm font-medium">&ldquo;Helping staff feel instructionally empowered&rdquo;</p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-white/20">
                    <p className="text-xs text-white/60 uppercase tracking-wide mb-1">Top Priority</p>
                    <p className="text-sm italic">&ldquo;Ensuring trainings include strategies paras can take away immediately and carry out the next day&rdquo;</p>
                  </div>
                </div>
              </details>
            </div>

            {/* ===== SECTION 2: PROGRESS SNAPSHOT ===== */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                <h2 className="text-xl font-bold text-[#1e2749]">Progress Snapshot</h2>
              </div>

              {/* Dual Hero Stats */}
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                {/* Implementation Rate - THE BIG WIN */}
                <div className="bg-gradient-to-br from-[#ffba06] to-amber-500 rounded-2xl p-6 text-white text-center">
                  <div className="text-5xl font-bold mb-2">91%</div>
                  <div className="text-lg font-medium mb-1">Implementation Rate</div>
                  <div className="text-amber-100 text-sm">
                    Paras are using what they learned
                  </div>
                  <div className="mt-3 pt-3 border-t border-white/20">
                    <div className="text-xs text-amber-100">Industry average: 10%</div>
                    <div className="text-sm font-semibold text-white mt-1">Your paras are 9x more likely to apply learning</div>
                  </div>
                </div>

                {/* Courses Completed */}
                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white text-center">
                  <div className="text-5xl font-bold mb-2 flex items-center justify-center gap-2">
                    <Trophy className="w-8 h-8" />
                    63
                  </div>
                  <div className="text-lg font-medium mb-1">Courses Completed</div>
                  <div className="text-emerald-100 text-sm">
                    63 strategies ready for classrooms
                  </div>
                  <div className="mt-3 pt-3 border-t border-white/20">
                    <div className="text-xs text-emerald-100">83% of paras logged in</div>
                    <div className="text-sm font-semibold text-white mt-1">Strong foundation built</div>
                  </div>
                </div>
              </div>

              {/* 3 Progress Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Hub Access Card */}
                <div className="bg-white rounded-xl p-6 shadow-sm border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-500 text-sm">Hub Access</span>
                    <div className="relative group">
                      <Info className="w-4 h-4 text-gray-400 cursor-help" />
                      <div className="absolute z-10 w-48 p-2 text-xs text-white bg-gray-900 rounded-lg shadow-lg -top-2 left-6 hidden group-hover:block">
                        Paras who have logged into the Learning Hub at least once
                      </div>
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-gray-900">94<span className="text-lg text-gray-400">/113</span></div>
                  <div className="text-sm text-gray-500 mb-3">83% logged in</div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-teal-500 h-2 rounded-full" style={{width: '83%'}}></div>
                  </div>
                </div>

                {/* Self-Directed Learning Card */}
                <div className="bg-white rounded-xl p-6 shadow-sm border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-500 text-sm">Self-Directed Learning</span>
                    <div className="relative group">
                      <Info className="w-4 h-4 text-gray-400 cursor-help" />
                      <div className="absolute z-10 w-48 p-2 text-xs text-white bg-gray-900 rounded-lg shadow-lg -top-2 left-6 hidden group-hover:block">
                        Paras exploring courses beyond required training
                      </div>
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-gray-900">25+</div>
                  <div className="text-sm text-gray-500 mb-3">paras exploring additional courses</div>
                  <div className="flex items-center gap-2 mt-2">
                    <Sparkles className="w-4 h-4 text-blue-500" />
                    <span className="text-xs text-blue-600">Going above and beyond</span>
                  </div>
                </div>

                {/* Deep Engagement Card */}
                <div className="bg-white rounded-xl p-6 shadow-sm border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-500 text-sm">Courses Completed</span>
                    <div className="relative group">
                      <Info className="w-4 h-4 text-gray-400 cursor-help" />
                      <div className="absolute z-10 w-48 p-2 text-xs text-white bg-gray-900 rounded-lg shadow-lg -top-2 left-6 hidden group-hover:block">
                        Course completions at 100% — fully finished courses
                      </div>
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-gray-900">63</div>
                  <div className="text-sm text-gray-500 mb-3">total course completions</div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-emerald-500 h-2 rounded-full" style={{width: '64%'}}></div>
                  </div>
                  <div className="text-xs text-emerald-600 mt-2">across 24 courses</div>
                </div>
              </div>

            </div>

            {/* ===== SECTION 3: TEAM PULSE ===== */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Activity className="w-5 h-5 text-purple-600" />
                <h2 className="text-xl font-bold text-[#1e2749]">Team Pulse</h2>
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full ml-2">March 2, 2026 Check-In</span>
              </div>

              {/* Survey Response Rate */}
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{marchSurveyData.responseRate.responded} of {marchSurveyData.responseRate.total} paras responded</div>
                      <div className="text-sm text-purple-600">{marchSurveyData.responseRate.percentage}% response rate</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Confidence Scores */}
                <div className="bg-white rounded-xl p-6 shadow-sm border">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="w-5 h-5 text-emerald-500" />
                    <h3 className="font-semibold text-gray-900">Confidence in Key Moves</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-[#ffba06]/10 rounded-lg p-4 border border-[#ffba06]/30">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Asking Questions</span>
                        <span className="text-2xl font-bold text-[#ffba06]">{marchSurveyData.confidence.asking.average}</span>
                      </div>
                      <div className="text-xs text-gray-500">{marchSurveyData.confidence.asking.rated4or5}% rated 4 or 5 out of 5</div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div className="bg-[#ffba06] h-2 rounded-full" style={{width: `${(marchSurveyData.confidence.asking.average / 5) * 100}%`}}></div>
                      </div>
                    </div>
                    <div className="bg-teal-50 rounded-lg p-4 border border-teal-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Giving Feedback</span>
                        <span className="text-2xl font-bold text-teal-600">{marchSurveyData.confidence.feedback.average}</span>
                      </div>
                      <div className="text-xs text-gray-500">{marchSurveyData.confidence.feedback.rated4or5}% rated 4 or 5 out of 5</div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div className="bg-teal-500 h-2 rounded-full" style={{width: `${(marchSurveyData.confidence.feedback.average / 5) * 100}%`}}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Team Stability - Positive framing */}
                <div className="bg-white rounded-xl p-6 shadow-sm border">
                  <div className="flex items-center gap-2 mb-4">
                    <Shield className="w-5 h-5 text-emerald-500" />
                    <h3 className="font-semibold text-gray-900">Team Stability</h3>
                  </div>
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-200">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-emerald-600 mb-1">71%</div>
                      <div className="text-sm font-medium text-gray-700">confirmed returning next year</div>
                      <div className="text-xs text-gray-500 mt-2">67 paras planning to stay</div>
                    </div>
                  </div>
                  <details className="mt-4 text-sm">
                    <summary className="text-gray-500 cursor-pointer hover:text-gray-700">View details for admin</summary>
                    <div className="mt-3 space-y-2 text-xs">
                      <div className="flex justify-between p-2 bg-gray-50 rounded">
                        <span>Still deciding</span>
                        <span className="text-gray-600">22 paras</span>
                      </div>
                      <div className="flex justify-between p-2 bg-gray-50 rounded">
                        <span>Moving on</span>
                        <span className="text-gray-600">6 paras</span>
                      </div>
                    </div>
                  </details>
                </div>

                {/* What Paras Are Telling Us */}
                <div className="bg-white rounded-xl p-6 shadow-sm border">
                  <div className="flex items-center gap-2 mb-4">
                    <MessageCircle className="w-5 h-5 text-blue-500" />
                    <h3 className="font-semibold text-gray-900">What Paras Are Telling Us</h3>
                  </div>
                  <div className="space-y-3">
                    {marchSurveyData.challenges.map((challenge, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <span className="text-sm text-gray-600 w-48 flex-shrink-0">{challenge.category}</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-3">
                          <div
                            className={`h-3 rounded-full ${idx === 4 ? 'bg-emerald-400' : 'bg-blue-400'}`}
                            style={{width: `${challenge.percentage}%`}}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-500 w-12 text-right">{challenge.percentage}%</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-4">This helps us tailor support to what matters most</p>
                </div>

                {/* Hub Usage - Positive framing */}
                <div className="bg-white rounded-xl p-6 shadow-sm border">
                  <div className="flex items-center gap-2 mb-4">
                    <BookOpen className="w-5 h-5 text-emerald-500" />
                    <h3 className="font-semibold text-gray-900">Learning Hub Engagement</h3>
                  </div>
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-200">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-emerald-600 mb-1">77%</div>
                      <div className="text-sm font-medium text-gray-700">of paras are engaging with the Hub</div>
                      <div className="text-xs text-gray-500 mt-2">73 paras actively using or planning to use</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ===== SECTION 4: WHAT WE'RE LEARNING ===== */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="w-5 h-5 text-amber-500" />
                <h2 className="text-xl font-bold text-[#1e2749]">What We&apos;re Learning</h2>
              </div>

              {/* Implementation Data from Part 2 */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <Activity className="w-5 h-5 text-[#38618C]" />
                  <h3 className="text-lg font-bold text-[#1e2749]">After 2 Sessions: What the Data Shows</h3>
                </div>

                {/* Implementation Rates */}
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  {/* Move #1 */}
                  <div className="bg-[#ffba06]/10 rounded-xl p-5 border border-[#ffba06]/30">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold text-[#1e2749]">Move #1: Questions Instead of Telling</span>
                      <span className="text-3xl font-bold text-[#ffba06]">91%</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">69 of 76 paras tried this strategy</p>
                    <div className="text-xs text-gray-500 space-y-1">
                      <div className="flex justify-between"><span>Using regularly:</span><span className="font-medium text-emerald-600">31</span></div>
                      <div className="flex justify-between"><span>Tried it out:</span><span className="font-medium">38</span></div>
                      <div className="flex justify-between"><span>Ready to try:</span><span className="font-medium">7</span></div>
                    </div>
                  </div>

                  {/* Move #2 */}
                  <div className="bg-teal-50 rounded-xl p-5 border border-teal-200">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold text-[#1e2749]">Move #2: Feedback Formula</span>
                      <span className="text-3xl font-bold text-teal-600">70%</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">53 of 76 paras tried this strategy</p>
                    <div className="text-xs text-gray-500 space-y-1">
                      <div className="flex justify-between"><span>Using regularly:</span><span className="font-medium text-emerald-600">20</span></div>
                      <div className="flex justify-between"><span>Tried it out:</span><span className="font-medium">33</span></div>
                      <div className="flex justify-between"><span>Ready to try:</span><span className="font-medium">23</span></div>
                    </div>
                  </div>
                </div>

                {/* Post-Session Confidence - Positive framing */}
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Feeling confident asking questions</span>
                      <span className="text-xl font-bold text-emerald-600">70%</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">of paras feel ready to use this</p>
                  </div>
                  <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Feeling confident giving feedback</span>
                      <span className="text-xl font-bold text-emerald-600">62%</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">of paras feel ready to use this</p>
                  </div>
                </div>

                <p className="text-xs text-gray-500">After just 2 sessions and 62 practice reps. Confidence continues to build with each touchpoint.</p>
              </div>

              {/* Sessions - Always Open */}
              <details open className="bg-white rounded-xl shadow-sm border group">
                <summary className="p-6 cursor-pointer list-none">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      <h3 className="text-lg font-semibold text-gray-900">Sessions ({completedSessions.length} completed · {upcomingSessions.length} upcoming)</h3>
                    </div>
                    <ChevronDown className="w-5 h-5 text-gray-400 transition-transform group-open:rotate-180" />
                  </div>
                </summary>
                <div className="px-6 pb-6 space-y-6">
                  {/* Completed Sessions */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-500" />
                      Completed
                    </h4>
                    <div className="space-y-3">
                      {completedSessions.map((session, idx) => (
                        <div key={idx}>
                          {session.title === "Observation Day" ? (
                            /* ===== EXPANDABLE OBSERVATION DAY CARD ===== */
                            <div className="bg-emerald-50 rounded-xl border border-emerald-300 overflow-hidden">
                              {/* Collapsed Header - Always Visible */}
                              <button
                                onClick={() => setObservationExpanded(!observationExpanded)}
                                className="w-full p-4 text-left hover:bg-emerald-100 transition-colors"
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <Check className="w-5 h-5 text-emerald-600" />
                                      <h5 className="font-semibold text-gray-900">{session.title}</h5>
                                      <span className="text-sm text-gray-500">— {session.date}</span>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-2">
                                      3 Buildings Visited · 17 Paras Contacted · 20 Follow-Up Emails Sent · 10 Same-Day Replies (50% response rate)
                                    </p>
                                    <blockquote className="text-sm italic text-gray-600 border-l-2 border-emerald-400 pl-3">
                                      &quot;I wish I could meet all my students&apos; many needs every day.&quot;
                                      <span className="block text-xs text-gray-500 mt-1 not-italic">— Scott Nyquist, Fullerton</span>
                                    </blockquote>
                                  </div>
                                  <div className="flex items-center gap-1 text-emerald-600">
                                    <span className="text-xs font-medium">{observationExpanded ? 'Close' : 'View details'}</span>
                                    <ChevronDown className={`w-4 h-4 transition-transform ${observationExpanded ? 'rotate-180' : ''}`} />
                                  </div>
                                </div>
                              </button>

                              {/* Expanded Content */}
                              {observationExpanded && (
                                <div className="border-t border-emerald-200 p-4 space-y-6 bg-white">
                                  {/* Day at a Glance */}
                                  <div>
                                    <h6 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                      <BarChart3 className="w-4 h-4 text-emerald-600" />
                                      Day at a Glance
                                    </h6>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                      <div className="bg-emerald-50 rounded-lg p-3 text-center">
                                        <p className="text-2xl font-bold text-emerald-700">3</p>
                                        <p className="text-xs text-gray-600">Buildings Visited</p>
                                      </div>
                                      <div className="bg-emerald-50 rounded-lg p-3 text-center">
                                        <p className="text-2xl font-bold text-emerald-700">17</p>
                                        <p className="text-xs text-gray-600">Paras Contacted</p>
                                        <p className="text-[10px] text-gray-400">12 formal · 3 informal · 2 appreciation</p>
                                      </div>
                                      <div className="bg-emerald-50 rounded-lg p-3 text-center">
                                        <p className="text-2xl font-bold text-emerald-700">20</p>
                                        <p className="text-xs text-gray-600">Follow-Up Emails</p>
                                        <p className="text-[10px] text-gray-400">17 para + 3 principal</p>
                                      </div>
                                      <div className="bg-emerald-50 rounded-lg p-3 text-center">
                                        <p className="text-2xl font-bold text-emerald-700">15</p>
                                        <p className="text-xs text-gray-600">Hub Resources Matched</p>
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
                                      <div className="bg-blue-50 rounded-lg p-3 text-center">
                                        <p className="text-2xl font-bold text-blue-700">3</p>
                                        <p className="text-xs text-gray-600">Principals</p>
                                        <p className="text-[10px] text-gray-400">Bolton · Villalobos · Dohman</p>
                                      </div>
                                      <div className="bg-amber-50 rounded-lg p-3 text-center">
                                        <p className="text-2xl font-bold text-amber-700">10</p>
                                        <p className="text-xs text-gray-600">Same-Day Replies (50%)</p>
                                        <p className="text-[10px] text-gray-400">Scott · Evely · Maribel · Ruby · Cristina · Kara · Carlos · Esperanza · Jonnathan · Fatema</p>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Internal Amplification Highlight */}
                                  <div className="bg-gradient-to-r from-teal-50 to-emerald-50 rounded-xl p-5 border-2 border-teal-200">
                                    <h6 className="font-bold text-teal-800 mb-3 flex items-center gap-2">
                                      <span className="text-lg">🔄</span>
                                      INTERNAL AMPLIFICATION — The Partnership Loop in Action
                                    </h6>
                                    <p className="text-sm text-gray-700 mb-4">
                                      After Rae sent Carlos Chavez&apos;s observation follow-up email, here&apos;s what happened organically — without TDI prompting it:
                                    </p>
                                    <ol className="space-y-3 mb-4">
                                      <li className="flex items-start gap-3 text-sm">
                                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs font-bold">1</span>
                                        <span className="text-gray-700"><strong className="text-gray-900">Janet Diaz</strong> (district admin) forwarded the email to Principal Kara Dohman with a note: <em>&quot;I will be sharing the specific emails from Rae in terms of the observations she completed of paras today.&quot;</em></span>
                                      </li>
                                      <li className="flex items-start gap-3 text-sm">
                                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs font-bold">2</span>
                                        <span className="text-gray-700"><strong className="text-gray-900">Kara</strong> forwarded it to Carlos with: <em>&quot;Way to go Carlos! Keep up the amazing work!!&quot;</em></span>
                                      </li>
                                      <li className="flex items-start gap-3 text-sm">
                                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs font-bold">3</span>
                                        <span className="text-gray-700"><strong className="text-gray-900">Carlos</strong> replied to all three — Rae, Janet, AND Kara — with pride, gratitude, and a specific growth request.</span>
                                      </li>
                                    </ol>
                                    <div className="bg-white/60 rounded-lg p-3 border border-teal-100">
                                      <p className="text-sm text-teal-800 font-medium mb-2">
                                        This is the loop: TDI observes → TDI celebrates → District amplifies → Principal celebrates → Para feels seen → Para engages deeper.
                                      </p>
                                      <p className="text-xs text-teal-700">
                                        <strong>Janet is forwarding observation emails to principals on her own.</strong> The partnership is embedded, not just tolerated.
                                      </p>
                                    </div>
                                  </div>

                                  {/* Emerging Coaching Themes */}
                                  <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl p-5 border-2 border-amber-200">
                                    <h6 className="font-bold text-amber-800 mb-3 flex items-center gap-2">
                                      <span className="text-lg">💡</span>
                                      WHAT PARAS ARE ASKING FOR — Themes from Observation Day Replies
                                    </h6>
                                    <p className="text-sm text-gray-700 mb-4">
                                      When asked &quot;What&apos;s on your &apos;I wish this was easier&apos; list?&quot;, paras responded with specific, coachable requests:
                                    </p>
                                    <div className="space-y-4">
                                      <div className="bg-white/70 rounded-lg p-4 border border-amber-100">
                                        <p className="text-xs font-bold text-amber-700 uppercase mb-2">De-Escalation</p>
                                        <p className="text-sm italic text-gray-700 mb-2">&quot;Helping a student de-escalate instead of escalating the situation more.&quot;</p>
                                        <p className="text-xs text-gray-500">— Evely Castillo, Fullerton</p>
                                        <p className="text-xs text-amber-600 mt-1 font-medium">Matched: De-Escalation Strategies + Calm Response Scripts</p>
                                      </div>
                                      <div className="bg-white/70 rounded-lg p-4 border border-amber-100">
                                        <p className="text-xs font-bold text-amber-700 uppercase mb-2">Differentiating Support</p>
                                        <p className="text-sm italic text-gray-700 mb-2">&quot;Having a more concrete plan. I have a wide range of students that all have varying needs.&quot;</p>
                                        <p className="text-xs text-gray-500">— Carlos Chavez, Lincoln</p>
                                        <p className="text-xs text-amber-600 mt-1 font-medium">Matched: Effective Small-Group Instruction + Differentiated Choice Boards</p>
                                      </div>
                                      <div className="bg-white/70 rounded-lg p-4 border border-amber-100">
                                        <p className="text-xs font-bold text-amber-700 uppercase mb-2">Managing Multiple Groups</p>
                                        <p className="text-sm italic text-gray-700 mb-2">&quot;Being able to bounce around between groups of students who all need help at the same time.&quot;</p>
                                        <p className="text-xs text-gray-500">— Jonnathan Roeglin, Fullerton</p>
                                        <p className="text-xs text-amber-600 mt-1 font-medium">Matched: No-Hands-Up Help Systems</p>
                                      </div>
                                      <div className="bg-white/70 rounded-lg p-4 border border-amber-100">
                                        <p className="text-xs font-bold text-amber-700 uppercase mb-2">Chunking &amp; Scaffolding</p>
                                        <p className="text-sm italic text-gray-700 mb-2">&quot;Could we try to break the work into smaller steps to help make the student understand it better?&quot;</p>
                                        <p className="text-xs text-gray-500">— Fatema Bakhrani, Fullerton</p>
                                        <p className="text-xs text-amber-600 mt-1 font-medium">Matched: &quot;One Step at a Time&quot; chunking strategy + Hub scaffolding resources</p>
                                      </div>
                                    </div>
                                    <div className="bg-white/60 rounded-lg p-3 border border-amber-100 mt-4">
                                      <p className="text-sm text-amber-800 font-medium">
                                        These themes are being used to shape content for Virtual Sessions 2 (April 6) and 3 (April 20).
                                      </p>
                                    </div>
                                  </div>

                                  {/* Building Sections */}
                                  <div>
                                    <h6 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                      <Building className="w-4 h-4 text-blue-600" />
                                      Building Details
                                    </h6>

                                    {/* Building Tabs */}
                                    <div className="flex gap-2 mb-4 border-b border-gray-200">
                                      <button
                                        onClick={() => setExpandedObsBuilding('fullerton')}
                                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                                          expandedObsBuilding === 'fullerton'
                                            ? 'border-emerald-600 text-emerald-700'
                                            : 'border-transparent text-gray-500 hover:text-gray-700'
                                        }`}
                                      >
                                        Fullerton
                                      </button>
                                      <button
                                        onClick={() => setExpandedObsBuilding('lakePark')}
                                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                                          expandedObsBuilding === 'lakePark'
                                            ? 'border-emerald-600 text-emerald-700'
                                            : 'border-transparent text-gray-500 hover:text-gray-700'
                                        }`}
                                      >
                                        Lake Park
                                      </button>
                                      <button
                                        onClick={() => setExpandedObsBuilding('lincoln')}
                                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                                          expandedObsBuilding === 'lincoln'
                                            ? 'border-emerald-600 text-emerald-700'
                                            : 'border-transparent text-gray-500 hover:text-gray-700'
                                        }`}
                                      >
                                        Lincoln
                                      </button>
                                    </div>

                                    {/* Fullerton Content */}
                                    {expandedObsBuilding === 'fullerton' && (
                                      <div className="space-y-6">
                                        {/* Overview Stats */}
                                        <div className="bg-gray-50 rounded-lg p-4">
                                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                            <div><span className="text-gray-500">Paras Observed:</span> <span className="font-medium">4 formal, 2 informal, 2 appreciation</span></div>
                                            <div><span className="text-gray-500">Follow-Ups:</span> <span className="font-medium">7 personalized emails</span></div>
                                            <div><span className="text-gray-500">Principal Email:</span> <span className="font-medium">Bryan Bolton</span></div>
                                            <div><span className="text-gray-500">Same-Day Replies:</span> <span className="font-medium">5 (Scott, Evely, Esperanza, Jonnathan, Fatema)</span></div>
                                          </div>
                                        </div>

                                        {/* Moves Observed */}
                                        <div>
                                          <h6 className="font-semibold text-gray-800 mb-3">Moves Observed in Action</h6>
                                          <div className="space-y-4">
                                            {observationResults.fullerton.movesObserved.map((move, moveIdx) => (
                                              <div key={moveIdx} className="border border-gray-200 rounded-lg overflow-hidden">
                                                <div className={`px-4 py-2 font-medium text-sm flex items-center gap-2 ${
                                                  move.color === 'orange' ? 'bg-orange-50 text-orange-800' :
                                                  move.color === 'teal' ? 'bg-teal-50 text-teal-800' :
                                                  move.color === 'blue' ? 'bg-blue-50 text-blue-800' :
                                                  move.color === 'purple' ? 'bg-purple-50 text-purple-800' :
                                                  move.color === 'green' ? 'bg-green-50 text-green-800' :
                                                  'bg-pink-50 text-pink-800'
                                                }`}>
                                                  <Check className="w-4 h-4" />
                                                  {move.move}
                                                </div>
                                                <div className="p-3 space-y-2">
                                                  {move.examples.map((ex, exIdx) => (
                                                    <div key={exIdx} className="text-sm border-b border-gray-100 last:border-0 pb-2 last:pb-0">
                                                      <span className="font-medium text-gray-900">{ex.para}:</span>
                                                      <span className="text-gray-600 ml-1">{ex.example}</span>
                                                    </div>
                                                  ))}
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        </div>

                                        {/* Hub Resources */}
                                        <div>
                                          <h6 className="font-semibold text-gray-800 mb-3">Hub Resources Recommended</h6>
                                          <div className="overflow-x-auto">
                                            <table className="w-full text-sm">
                                              <thead>
                                                <tr className="border-b border-gray-200 bg-gray-50">
                                                  <th className="text-left py-2 px-3 font-medium text-gray-700">Para</th>
                                                  <th className="text-left py-2 px-3 font-medium text-gray-700">Resource</th>
                                                  <th className="text-left py-2 px-3 font-medium text-gray-700">Why</th>
                                                </tr>
                                              </thead>
                                              <tbody>
                                                {observationResults.fullerton.hubResources.map((r, rIdx) => (
                                                  <tr key={rIdx} className="border-b border-gray-100">
                                                    <td className="py-2 px-3 font-medium text-gray-900">{r.para}</td>
                                                    <td className="py-2 px-3 text-blue-600">{r.resource}</td>
                                                    <td className="py-2 px-3 text-gray-600">{r.reason}</td>
                                                  </tr>
                                                ))}
                                              </tbody>
                                            </table>
                                            <p className="text-xs text-gray-500 italic mt-2 border-t border-gray-100 pt-2">* Jonnathan Roeglin&apos;s resource was expanded after his reply — added No-Hands-Up Help Systems alongside the original Feedback Framework Quick Reference, based on his request for help managing multiple groups of students simultaneously.<br/>* Fatema Bakhrani&apos;s resource was expanded after her reply — added &quot;One Step at a Time&quot; chunking strategy based on her request for help breaking work into smaller steps.</p>
                                          </div>
                                        </div>

                                        {/* Voices from the Field */}
                                        <div>
                                          <h6 className="font-semibold text-gray-800 mb-3">Voices from the Field</h6>
                                          <div className="space-y-3">
                                            {observationResults.fullerton.quotes.map((q: { text: string; author: string; context: string; selfInitiated?: boolean; growthRequest?: boolean }, qIdx: number) => (
                                              <blockquote key={qIdx} className={`rounded-lg p-4 border-l-4 ${
                                                q.selfInitiated ? 'bg-purple-50 border-purple-400' :
                                                q.growthRequest ? 'bg-emerald-50 border-emerald-400 ring-1 ring-emerald-100' :
                                                'bg-emerald-50 border-emerald-400'
                                              }`}>
                                                {q.selfInitiated && (
                                                  <span className="inline-block text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full mb-2">💬 Reached out on her own</span>
                                                )}
                                                {q.growthRequest && (
                                                  <span className="inline-block text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full mb-2">🎯 Specific growth request</span>
                                                )}
                                                <p className="text-sm text-gray-700 italic">&quot;{q.text}&quot;</p>
                                                <p className="text-xs text-gray-500 mt-2">— {q.author}</p>
                                                <p className={`text-xs mt-1 ${q.selfInitiated ? 'text-purple-600' : q.growthRequest ? 'text-emerald-600' : 'text-gray-500'}`}>{q.context}</p>
                                              </blockquote>
                                            ))}
                                          </div>
                                        </div>

                                        {/* Building Themes */}
                                        <div>
                                          <h6 className="font-semibold text-gray-800 mb-3">Building-Level Themes</h6>
                                          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                                            <div>
                                              <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Strengths</p>
                                              <ul className="space-y-1">
                                                {observationResults.fullerton.themes.strengths.map((s, sIdx) => (
                                                  <li key={sIdx} className="text-sm text-gray-700 flex items-start gap-2">
                                                    <Check className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                                                    {s}
                                                  </li>
                                                ))}
                                              </ul>
                                            </div>
                                            <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
                                              <p className="text-xs font-semibold text-amber-700 uppercase mb-1">Growth Opportunity</p>
                                              <p className="text-sm text-gray-700">{observationResults.fullerton.themes.growthOpportunity}</p>
                                            </div>
                                          </div>
                                        </div>

                                        {/* Teacher Highlights */}
                                        <div>
                                          <h6 className="font-semibold text-gray-800 mb-3">Teacher Collaboration Highlights</h6>
                                          <div className="bg-blue-50 rounded-lg p-4 space-y-3">
                                            {observationResults.fullerton.teacherHighlights.map((t, tIdx) => (
                                              <div key={tIdx} className="border-b border-blue-100 last:border-0 pb-2 last:pb-0">
                                                <p className="font-medium text-gray-900">{t.teacher}</p>
                                                <p className="text-sm text-gray-600">{t.note}</p>
                                              </div>
                                            ))}
                                            <p className="text-xs text-gray-500 mt-2">Principal Bryan Bolton was emailed same-day with these highlights and provided the Staff Celebration Playbook resource.</p>
                                          </div>
                                        </div>
                                      </div>
                                    )}

                                    {/* Lake Park Content */}
                                    {expandedObsBuilding === 'lakePark' && (
                                      <div className="space-y-6">
                                        {/* Overview Stats */}
                                        <div className="bg-gray-50 rounded-lg p-4">
                                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                            <div><span className="text-gray-500">Paras Observed:</span> <span className="font-medium">4 formal, 1 informal</span></div>
                                            <div><span className="text-gray-500">Follow-Ups:</span> <span className="font-medium">5 personalized emails</span></div>
                                            <div><span className="text-gray-500">Principal Email:</span> <span className="font-medium">Cristina Villalobos</span></div>
                                            <div><span className="text-gray-500">Same-Day Replies:</span> <span className="font-medium">3 (Maribel, Ruby, Cristina)</span></div>
                                          </div>
                                        </div>

                                        {/* Moves Observed */}
                                        <div>
                                          <h6 className="font-semibold text-gray-800 mb-3">Moves Observed in Action</h6>
                                          <div className="space-y-4">
                                            {observationResults.lakePark.movesObserved.map((move, moveIdx) => (
                                              <div key={moveIdx} className="border border-gray-200 rounded-lg overflow-hidden">
                                                <div className={`px-4 py-2 font-medium text-sm flex items-center gap-2 ${
                                                  move.color === 'orange' ? 'bg-orange-50 text-orange-800' :
                                                  move.color === 'teal' ? 'bg-teal-50 text-teal-800' :
                                                  move.color === 'blue' ? 'bg-blue-50 text-blue-800' :
                                                  move.color === 'purple' ? 'bg-purple-50 text-purple-800' :
                                                  move.color === 'green' ? 'bg-green-50 text-green-800' :
                                                  move.color === 'pink' ? 'bg-pink-50 text-pink-800' :
                                                  'bg-cyan-50 text-cyan-800'
                                                }`}>
                                                  <Check className="w-4 h-4" />
                                                  {move.move}
                                                </div>
                                                <div className="p-3 space-y-2">
                                                  {move.examples.map((ex, exIdx) => (
                                                    <div key={exIdx} className="text-sm border-b border-gray-100 last:border-0 pb-2 last:pb-0">
                                                      <span className="font-medium text-gray-900">{ex.para}:</span>
                                                      <span className="text-gray-600 ml-1">{ex.example}</span>
                                                    </div>
                                                  ))}
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        </div>

                                        {/* Hub Resources */}
                                        <div>
                                          <h6 className="font-semibold text-gray-800 mb-3">Hub Resources Recommended</h6>
                                          <div className="overflow-x-auto">
                                            <table className="w-full text-sm">
                                              <thead>
                                                <tr className="border-b border-gray-200 bg-gray-50">
                                                  <th className="text-left py-2 px-3 font-medium text-gray-700">Para</th>
                                                  <th className="text-left py-2 px-3 font-medium text-gray-700">Resource</th>
                                                  <th className="text-left py-2 px-3 font-medium text-gray-700">Why</th>
                                                </tr>
                                              </thead>
                                              <tbody>
                                                {observationResults.lakePark.hubResources.map((r, rIdx) => (
                                                  <tr key={rIdx} className="border-b border-gray-100">
                                                    <td className="py-2 px-3 font-medium text-gray-900">{r.para}</td>
                                                    <td className="py-2 px-3 text-blue-600">{r.resource}</td>
                                                    <td className="py-2 px-3 text-gray-600">{r.reason}</td>
                                                  </tr>
                                                ))}
                                              </tbody>
                                            </table>
                                          </div>
                                        </div>

                                        {/* Voices from the Field */}
                                        <div>
                                          <h6 className="font-semibold text-gray-800 mb-3">Voices from the Field</h6>
                                          <div className="space-y-3">
                                            {observationResults.lakePark.quotes.map((q: { text: string; author: string; context: string; selfInitiated?: boolean }, qIdx: number) => (
                                              <blockquote key={qIdx} className={`rounded-lg p-4 border-l-4 ${
                                                q.selfInitiated ? 'bg-purple-50 border-purple-400' :
                                                q.author.includes('Principal') ? 'bg-blue-50 border-blue-400' :
                                                'bg-emerald-50 border-emerald-400'
                                              }`}>
                                                {q.selfInitiated && (
                                                  <span className="inline-block text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full mb-2">💬 Unsolicited response</span>
                                                )}
                                                <p className="text-sm italic text-gray-700">&quot;{q.text}&quot;</p>
                                                <p className="text-xs text-gray-500 mt-2">— {q.author}, Lake Park</p>
                                                <p className={`text-xs mt-1 ${
                                                  q.selfInitiated ? 'text-purple-600' :
                                                  q.author.includes('Principal') ? 'text-blue-600' :
                                                  'text-emerald-600'
                                                }`}>{q.context}</p>
                                              </blockquote>
                                            ))}
                                          </div>
                                        </div>

                                        {/* Building Themes */}
                                        <div>
                                          <h6 className="font-semibold text-gray-800 mb-3">Building-Level Themes</h6>
                                          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                                            <div>
                                              <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Strengths</p>
                                              <ul className="space-y-1">
                                                {observationResults.lakePark.themes.strengths.map((s, sIdx) => (
                                                  <li key={sIdx} className="text-sm text-gray-700 flex items-start gap-2">
                                                    <Check className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                                                    {s}
                                                  </li>
                                                ))}
                                              </ul>
                                            </div>
                                            <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
                                              <p className="text-xs font-semibold text-amber-700 uppercase mb-1">Growth Opportunity</p>
                                              <p className="text-sm text-gray-700">{observationResults.lakePark.themes.growthOpportunity}</p>
                                            </div>
                                          </div>
                                        </div>

                                        {/* Teacher Highlights */}
                                        <div>
                                          <h6 className="font-semibold text-gray-800 mb-3">Teacher Collaboration Highlights</h6>
                                          <div className="bg-blue-50 rounded-lg p-4 space-y-3">
                                            {observationResults.lakePark.teacherHighlights.map((t, tIdx) => (
                                              <div key={tIdx} className="border-b border-blue-100 last:border-0 pb-2 last:pb-0">
                                                <p className="font-medium text-gray-900">{t.teacher}</p>
                                                <p className="text-sm text-gray-600">{t.note}</p>
                                              </div>
                                            ))}
                                            <p className="text-xs text-gray-500 mt-2">Principal Cristina Villalobos was emailed same-day with these highlights and provided the Staff Celebration Playbook resource.</p>
                                          </div>
                                        </div>
                                      </div>
                                    )}

                                    {/* Lincoln Content */}
                                    {expandedObsBuilding === 'lincoln' && (
                                      <div className="space-y-6">
                                        {/* Overview Stats */}
                                        <div className="bg-gray-50 rounded-lg p-4">
                                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                            <div><span className="text-gray-500">Paras Observed:</span> <span className="font-medium">4 formal, 3 informal, 2 appreciation</span></div>
                                            <div><span className="text-gray-500">Follow-Ups:</span> <span className="font-medium">8 personalized emails</span></div>
                                            <div><span className="text-gray-500">Principal Email:</span> <span className="font-medium">Kara Dohman</span></div>
                                            <div><span className="text-gray-500">Same-Day Response:</span> <span className="font-medium">1 (Kara Dohman — Principal)</span></div>
                                          </div>
                                        </div>

                                        {/* Moves Observed */}
                                        <div>
                                          <h6 className="font-semibold text-gray-800 mb-3">Moves Observed in Action</h6>
                                          <div className="space-y-4">
                                            {observationResults.lincoln.movesObserved.map((move, moveIdx) => (
                                              <div key={moveIdx} className="border border-gray-200 rounded-lg overflow-hidden">
                                                <div className={`px-4 py-2 font-medium text-sm flex items-center gap-2 ${
                                                  move.color === 'orange' ? 'bg-orange-50 text-orange-800' :
                                                  move.color === 'teal' ? 'bg-teal-50 text-teal-800' :
                                                  move.color === 'blue' ? 'bg-blue-50 text-blue-800' :
                                                  move.color === 'purple' ? 'bg-purple-50 text-purple-800' :
                                                  move.color === 'green' ? 'bg-green-50 text-green-800' :
                                                  move.color === 'pink' ? 'bg-pink-50 text-pink-800' :
                                                  'bg-cyan-50 text-cyan-800'
                                                }`}>
                                                  <Check className="w-4 h-4" />
                                                  {move.move}
                                                </div>
                                                <div className="p-3 space-y-2">
                                                  {move.examples.map((ex, exIdx) => (
                                                    <div key={exIdx} className="text-sm border-b border-gray-100 last:border-0 pb-2 last:pb-0">
                                                      <span className="font-medium text-gray-900">{ex.para}:</span>
                                                      <span className="text-gray-600 ml-1">{ex.example}</span>
                                                    </div>
                                                  ))}
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        </div>

                                        {/* Hub Resources */}
                                        <div>
                                          <h6 className="font-semibold text-gray-800 mb-3">Hub Resources Recommended</h6>
                                          <div className="overflow-x-auto">
                                            <table className="w-full text-sm">
                                              <thead>
                                                <tr className="border-b border-gray-200 bg-gray-50">
                                                  <th className="text-left py-2 px-3 font-medium text-gray-700">Para</th>
                                                  <th className="text-left py-2 px-3 font-medium text-gray-700">Resource</th>
                                                  <th className="text-left py-2 px-3 font-medium text-gray-700">Why</th>
                                                </tr>
                                              </thead>
                                              <tbody>
                                                {observationResults.lincoln.hubResources.map((r, rIdx) => (
                                                  <tr key={rIdx} className="border-b border-gray-100">
                                                    <td className="py-2 px-3 font-medium text-gray-900">{r.para}</td>
                                                    <td className="py-2 px-3 text-blue-600">{r.resource}</td>
                                                    <td className="py-2 px-3 text-gray-600">{r.reason}</td>
                                                  </tr>
                                                ))}
                                              </tbody>
                                            </table>
                                            <p className="text-xs text-gray-500 italic mt-2 border-t border-gray-100 pt-2">* Carlos Chavez&apos;s resource was expanded after his reply — added Differentiated Choice Boards alongside the original Small Group Facilitation Guide, based on his request for help differentiating support across varying student needs.</p>
                                          </div>
                                        </div>

                                        {/* Quotes - only show if there are any */}
                                        {observationResults.lincoln.quotes.length > 0 && (
                                          <div>
                                            <h6 className="font-semibold text-gray-800 mb-3">Voices from the Field</h6>
                                            <div className="space-y-3">
                                              {observationResults.lincoln.quotes.map((q: { text: string; author: string; context: string; standout?: boolean }, qIdx: number) => (
                                                <blockquote key={qIdx} className={`rounded-lg p-4 border-l-4 ${
                                                  q.standout ? 'bg-emerald-50 border-emerald-400 ring-1 ring-emerald-100' :
                                                  q.author.includes('Principal') ? 'bg-blue-50 border-blue-400' :
                                                  'bg-emerald-50 border-emerald-400'
                                                }`}>
                                                  {q.standout && (
                                                    <span className="inline-block text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full mb-2">⭐ Standout Observation</span>
                                                  )}
                                                  <p className="text-sm italic text-gray-700">&quot;{q.text}&quot;</p>
                                                  <p className="text-xs text-gray-500 mt-2">— {q.author}</p>
                                                  <p className={`text-xs mt-1 ${q.standout ? 'text-emerald-600' : q.author.includes('Principal') ? 'text-blue-600' : 'text-gray-500'}`}>{q.context}</p>
                                                </blockquote>
                                              ))}
                                            </div>
                                          </div>
                                        )}

                                        {/* Building Themes */}
                                        <div>
                                          <h6 className="font-semibold text-gray-800 mb-3">Building-Level Themes</h6>
                                          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                                            <div>
                                              <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Strengths</p>
                                              <ul className="space-y-1">
                                                {observationResults.lincoln.themes.strengths.map((s, sIdx) => (
                                                  <li key={sIdx} className="text-sm text-gray-700 flex items-start gap-2">
                                                    <Check className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                                                    {s}
                                                  </li>
                                                ))}
                                              </ul>
                                            </div>
                                            <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
                                              <p className="text-xs font-semibold text-amber-700 uppercase mb-1">Growth Opportunity</p>
                                              <p className="text-sm text-gray-700">{observationResults.lincoln.themes.growthOpportunity}</p>
                                            </div>
                                          </div>
                                        </div>

                                        {/* Teacher Highlights */}
                                        <div>
                                          <h6 className="font-semibold text-gray-800 mb-3">Teacher Collaboration Highlights</h6>
                                          <div className="bg-blue-50 rounded-lg p-4 space-y-3">
                                            {observationResults.lincoln.teacherHighlights.map((t, tIdx) => (
                                              <div key={tIdx} className="border-b border-blue-100 last:border-0 pb-2 last:pb-0">
                                                <p className="font-medium text-gray-900">{t.teacher}</p>
                                                <p className="text-sm text-gray-600">{t.note}</p>
                                              </div>
                                            ))}
                                            <p className="text-xs text-gray-500 mt-2">Principal Kara Dohman was emailed same-day with these highlights and provided the Staff Celebration Playbook resource.</p>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            /* Standard completed session card */
                            <div className={`bg-emerald-50 rounded-lg p-4 border ${
                              session.reportUrl ? 'border-emerald-300' : 'border-emerald-200'
                            }`}>
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <h5 className="font-semibold text-gray-900">{session.title}</h5>
                                  <p className="text-sm text-gray-500">{session.date} · {session.format}</p>
                                </div>
                                {session.reportUrl && (
                                  <a
                                    href={session.reportUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                                  >
                                    <FileText className="w-3 h-3" />
                                    View Report
                                  </a>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Upcoming Sessions */}
                  {upcomingSessions.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                        <CalendarClock className="w-4 h-4 text-blue-500" />
                        Upcoming
                      </h4>
                      <div className="space-y-3">
                        {upcomingSessions.map((session, idx) => (
                          <div key={idx} className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                            <h5 className="font-semibold text-gray-900">{session.title}</h5>
                            <p className="text-sm text-blue-600">{session.date} · {session.time} · {session.format}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </details>

              {/* Top Engaged Paras */}
              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <div className="flex items-center gap-2 mb-4">
                  <Trophy className="w-5 h-5 text-amber-500" />
                  <h3 className="text-lg font-semibold text-gray-900">Your Para Champions</h3>
                </div>

                <div className="space-y-3">
                  {topEngagedParas.map((para, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 font-medium text-sm">
                          {index + 1}
                        </div>
                        <span className="font-medium text-gray-900">{para.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-500">
                          {para.logins} logins · Last active {para.lastActive}
                        </span>
                        {para.lastActive === 'Feb 2' && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Recently Active</span>
                        )}
                        <button
                          onClick={() => sendHighFiveEmail(para)}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 text-xs font-medium rounded-full transition-colors"
                        >
                          <Award className="w-3 h-3" />
                          High Five
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                  <div className="flex items-start gap-2 text-sm text-slate-600 bg-emerald-50 rounded-lg p-3">
                    <TrendingUp className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span><strong>19 paras</strong> have returned to the Hub multiple times — nearly 1 in 5 logged-in paras came back on their own.</span>
                  </div>
                </div>
              </div>

              {/* What's Resonating */}
              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-blue-500" />
                    <h3 className="text-lg font-semibold text-gray-900">What&apos;s Resonating</h3>
                  </div>
                  <span className="text-xs text-gray-500">Top 10 courses by engagement</span>
                </div>

                <div className="space-y-3">
                  {topCourses.slice(0, showAllCourses ? topCourses.length : 5).map((course, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                      <div className="flex items-center gap-3">
                        <span className="text-gray-400 text-sm w-4">{index + 1}.</span>
                        <span className="text-gray-700">{course.name}</span>
                        {course.completionRate === 100 && course.started > 1 && (
                          <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                            <Star className="w-3 h-3" />
                            100% Finish Rate
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500 whitespace-nowrap">
                        {course.started} started · {course.completed70} completed
                      </div>
                    </div>
                  ))}
                </div>

                {topCourses.length > 5 && (
                  <button
                    onClick={() => setShowAllCourses(!showAllCourses)}
                    className="mt-4 text-sm text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1"
                  >
                    {showAllCourses ? 'Show less' : `View all ${topCourses.length} courses`}
                    <ChevronDown className={`w-4 h-4 transform transition-transform ${showAllCourses ? 'rotate-180' : ''}`} />
                  </button>
                )}
                <div className="mt-4 pt-3 border-t border-gray-100 text-xs text-gray-400">
                  29 courses explored · 91 total completions · Data as of March 1, 2026
                </div>
              </div>

              {/* Ready to Welcome (Collapsible) */}
              <details className="bg-slate-50 border border-slate-200 rounded-xl group">
                <summary className="p-6 cursor-pointer list-none">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <UserCheck className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-gray-900">Ready to Welcome: 19 paras</div>
                        <div className="text-sm text-slate-600">Opportunity for personalized onboarding</div>
                      </div>
                    </div>
                    <ChevronDown className="w-5 h-5 text-slate-400 transition-transform group-open:rotate-180" />
                  </div>
                </summary>
                <div className="px-6 pb-6 border-t border-slate-200 mt-0 pt-4">

                  <div className="bg-white rounded-lg p-4 mb-4">
                    <div className="flex items-start gap-2 text-sm text-slate-600">
                      <Lightbulb className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span>
                        <strong>Tip:</strong> A quick walkthrough during para meetings can help these team members get started.
                      </span>
                    </div>
                  </div>

                  {/* Invite All Button */}
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm text-gray-500">Send a friendly welcome email</span>
                    <button
                      onClick={() => sendNudgeAllEmail()}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      <Mail className="w-4 h-4" />
                      Welcome All ({notLoggedInParas.length})
                    </button>
                  </div>

                  <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left py-2 px-3 font-medium text-gray-600">#</th>
                          <th className="text-left py-2 px-3 font-medium text-gray-600">Name</th>
                          <th className="text-left py-2 px-3 font-medium text-gray-600">Email</th>
                          <th className="text-right py-2 px-3 font-medium text-gray-600">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {notLoggedInParas.map((para, index) => (
                          <tr key={index} className="border-t border-gray-100 hover:bg-gray-50">
                            <td className="py-2 px-3 text-gray-400">{index + 1}</td>
                            <td className="py-2 px-3 text-gray-900">{para.name}</td>
                            <td className="py-2 px-3 text-gray-500">{para.email}</td>
                            <td className="py-2 px-3 text-right">
                              <button
                                onClick={() => sendNudgeEmail(para)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-blue-600 hover:text-white hover:bg-blue-500 border border-blue-300 hover:border-blue-500 rounded-lg text-xs font-medium transition-colors"
                              >
                                <Send className="w-3 h-3" />
                                Invite
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </details>

              {/* Hub Barriers - Collapsible */}
              <details className="bg-white rounded-xl shadow-sm border group">
                <summary className="p-6 cursor-pointer list-none">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <HelpCircle className="w-5 h-5 text-[#38618C]" />
                      <h3 className="text-lg font-semibold text-gray-900">What Would Help Paras Use the Hub</h3>
                    </div>
                    <ChevronDown className="w-5 h-5 text-gray-400 transition-transform group-open:rotate-180" />
                  </div>
                </summary>
                <div className="px-6 pb-6">
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-600 w-48 flex-shrink-0">Dedicated time during work hours</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-4">
                        <div className="bg-[#38618C] h-4 rounded-full flex items-center justify-end pr-2" style={{width: '53%'}}>
                          <span className="text-xs text-white font-medium">53%</span>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500 w-20 text-right">43 responses</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-600 w-48 flex-shrink-0">Reminders / accountability</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-4">
                        <div className="bg-[#38618C]/30 h-4 rounded-full" style={{width: '9%'}}></div>
                      </div>
                      <span className="text-sm text-gray-500 w-20 text-right">7 responses</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-600 w-48 flex-shrink-0">Already using it regularly</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-4">
                        <div className="bg-emerald-500 h-4 rounded-full" style={{width: '2%'}}></div>
                      </div>
                      <span className="text-sm text-gray-500 w-20 text-right">2 responses</span>
                    </div>
                  </div>

                  {/* Recommended Actions */}
                  <div className="bg-[#ffba06]/10 border border-[#ffba06]/30 rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Lightbulb className="w-5 h-5 text-[#ffba06]" />
                      <span className="font-semibold text-[#1e2749]">Recommended Actions for Admin</span>
                    </div>
                    <div className="space-y-3 text-sm text-gray-700">
                      <div className="flex items-start gap-2">
                        <span className="font-bold text-[#1e2749]">1.</span>
                        <div>
                          <span className="font-medium">Dedicate 15-30 min of Late Start Day time for Hub exploration</span>
                          <span className="text-gray-500 ml-1">→ 53% of paras say this is the #1 thing that would help</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </details>
            </div>

            {/* ===== SECTION 5: END-OF-PARTNERSHIP TARGETS ===== */}
            <div>
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Target className="w-5 h-5 text-[#38618C]" />
                  <h3 className="text-lg font-bold text-[#1e2749]">End-of-Partnership Targets</h3>
                </div>
                <p className="text-gray-600 mb-4">By May 2026, we aim to see:</p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[#38618C] flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Pilot group paras report increased confidence in classroom strategies</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[#38618C] flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Measurable improvement in feeling valued by teachers and admin</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[#38618C] flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Reduced stress levels compared to baseline</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[#38618C] flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Clear implementation of Hub strategies observed in classrooms</span>
                  </li>
                </ul>
              </div>
            </div>

          </div>
        )}

        {/* ==================== SCHOOLS TAB ==================== */}
        {activeTab === 'schools' && (
          <div className="space-y-6">
            {/* Summary Stats - Lead with wins */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-200 mb-4">
              <div className="text-lg font-bold text-gray-900">9 schools · 114 paras · 85% logged in</div>
              <div className="text-sm text-emerald-600 mt-1 font-medium">Standout buildings: Ardmore (100%), Wesley (93%), Fullerton & Indian Trail (92%)</div>
            </div>

            {/* Team Retention Strength */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-5 h-5 text-emerald-500" />
                <h3 className="text-lg font-bold text-gray-900">Team Retention Strength</h3>
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full ml-2">March 2026 Survey</span>
              </div>

              {/* Hero stat */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-200 mb-6 text-center">
                <div className="text-4xl font-bold text-emerald-600 mb-1">71%</div>
                <div className="text-sm font-medium text-gray-700">of paras confirmed returning next year</div>
                <div className="text-xs text-gray-500 mt-1">67 team members planning to stay</div>
              </div>

              {/* School breakdown table - Simplified positive framing */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 pr-4 font-medium text-gray-500">Building</th>
                      <th className="text-center py-2 px-2 font-medium text-gray-500">Team Size</th>
                      <th className="text-center py-2 px-2 font-medium text-emerald-600">Returning</th>
                      <th className="text-center py-2 pl-2 font-medium text-gray-500">Retention Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schoolRetentionData.map((school, idx) => {
                      const retentionRate = Math.round((school.returning / school.total) * 100);
                      return (
                        <tr key={idx} className="border-b border-gray-100">
                          <td className="py-3 pr-4 font-medium text-gray-900">{school.school}</td>
                          <td className="py-3 px-2 text-center text-gray-500">{school.total}</td>
                          <td className="py-3 px-2 text-center">
                            <span className="text-emerald-600 font-medium">{school.returning}</span>
                          </td>
                          <td className="py-3 pl-2 text-center">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              retentionRate >= 80 ? 'bg-emerald-100 text-emerald-700' :
                              retentionRate >= 60 ? 'bg-blue-100 text-blue-700' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              {retentionRate}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <details className="mt-4 pt-4 border-t border-gray-100">
                <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">View admin details</summary>
                <div className="mt-3 text-sm text-slate-600 bg-slate-50 rounded-lg p-3">
                  <p><strong>For leadership follow-up:</strong> 22 paras are still deciding, 6 have shared they&apos;re moving on. 1:1 conversations can help understand concerns.</p>
                </div>
              </details>
            </div>

            {/* Next Focus Areas - Reframed from "Needs Attention" */}
            <details className="bg-slate-50 border border-slate-200 rounded-xl group">
              <summary className="p-4 cursor-pointer list-none">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-blue-500" />
                    <span className="font-medium text-gray-900">Next Focus Areas</span>
                  </div>
                  <ChevronDown className="w-5 h-5 text-gray-400 transition-transform group-open:rotate-180" />
                </div>
              </summary>
              <div className="px-4 pb-4">
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Lake Park</strong> and <strong>ELC</strong> have the most opportunity for growth.
                  A quick walkthrough at the next staff meeting could help onboard remaining team members.
                </p>
              </div>
            </details>

            {/* Building Spotlight Intro */}
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">Building Spotlight — Here&apos;s What We&apos;re Noticing</h3>
              <p className="text-sm text-gray-500 mt-1">Celebrating wins and sharing progress across your district</p>
            </div>

            {/* District-Wide Top Courses */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="w-5 h-5 text-blue-500" />
                <h3 className="text-lg font-bold text-gray-900">Learning Hub — Top Courses Across the District</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 pr-4 font-medium text-gray-500">Course</th>
                      <th className="text-right py-2 px-2 font-medium text-gray-500">Started</th>
                      <th className="text-right py-2 pl-2 font-medium text-gray-500">Completed</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100">
                      <td className="py-2 pr-4 text-gray-700">Paraprofessional Foundations</td>
                      <td className="py-2 px-2 text-right text-gray-600">27</td>
                      <td className="py-2 pl-2 text-right text-emerald-600 font-medium">13</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-2 pr-4 text-gray-700">Classroom Management Toolkit</td>
                      <td className="py-2 px-2 text-right text-gray-600">16</td>
                      <td className="py-2 pl-2 text-right text-emerald-600 font-medium">7</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-2 pr-4 text-gray-700">Differentiated Choice Boards</td>
                      <td className="py-2 px-2 text-right text-gray-600">16</td>
                      <td className="py-2 pl-2 text-right text-emerald-600 font-medium">5</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-2 pr-4 text-gray-700">Streamline Your Inbox</td>
                      <td className="py-2 px-2 text-right text-gray-600">16</td>
                      <td className="py-2 pl-2 text-right text-emerald-600 font-medium">5</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4 text-gray-700">Boundaries Without Backlash</td>
                      <td className="py-2 px-2 text-right text-gray-600">15</td>
                      <td className="py-2 pl-2 text-right text-emerald-600 font-medium">9</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100 text-xs text-gray-400">
                Top 5 courses by engagement across all 9 schools · 91 total completions district-wide · Per-school course data coming soon · Data as of March 1, 2026
              </div>
            </div>

            {/* Schools Accordion */}
            <div className="space-y-3">
              {schoolData
                .map(school => {
                  const loggedIn = school.paras.filter(p => p.loggedIn).length;
                  const total = school.paras.length;
                  const loginRate = Math.round((loggedIn / total) * 100);
                  return { ...school, loggedIn, total, notLoggedIn: total - loggedIn, loginRate };
                })
                .sort((a, b) => b.engagement.totalActivities - a.engagement.totalActivities)
                .map(school => {
                  const isExpanded = expandedSchool === school.id;
                  const isRosterOpen = showRoster === school.id;
                  const loggedInParas = school.paras.filter(p => p.loggedIn);
                  const notLoggedInParas = school.paras.filter(p => !p.loggedIn);
                  const hasEngagement = school.engagement.totalActivities > 0;

                  return (
                    <div
                      key={school.id}
                      className={`bg-white rounded-xl border overflow-hidden transition-all ${
                        isExpanded ? 'border-blue-300 shadow-md' : 'border-gray-200'
                      }`}
                    >
                      {/* Accordion Header */}
                      <button
                        onClick={() => setExpandedSchool(isExpanded ? null : school.id)}
                        className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          {/* Engagement Indicator */}
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            hasEngagement ? 'bg-blue-100' : 'bg-gray-100'
                          }`}>
                            <BookOpen className={`w-5 h-5 ${hasEngagement ? 'text-blue-600' : 'text-gray-400'}`} />
                          </div>

                          <div className="text-left">
                            <h4 className="font-semibold text-gray-900">{school.name}</h4>
                            <p className="text-sm text-gray-500">
                              {hasEngagement ? (
                                <>
                                  <span className="text-blue-600 font-medium">{school.engagement.engagedParas} paras</span>
                                  {' · '}
                                  <span className="text-emerald-600 font-medium">{school.engagement.totalActivities} course activities</span>
                                </>
                              ) : (
                                <span className="text-amber-600">No course engagement yet</span>
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          {/* Login Rate Badge */}
                          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                            school.loginRate >= 80 ? 'bg-emerald-100 text-emerald-700' :
                            school.loginRate >= 60 ? 'bg-amber-100 text-amber-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {school.loginRate}% logged in
                          </div>

                          {/* Survey Confidence Badge */}
                          {school.survey && (
                            <div className="hidden md:flex items-center gap-2 text-xs">
                              {school.survey.limitedData ? (
                                <span className="text-gray-400">{school.survey.responses} responses</span>
                              ) : (
                                <>
                                  <span className={`px-1.5 py-0.5 rounded ${
                                    school.survey.asking && school.survey.asking >= 4.0 ? 'bg-emerald-100 text-emerald-700' :
                                    school.survey.asking && school.survey.asking >= 3.5 ? 'bg-gray-100 text-gray-600' :
                                    'bg-amber-100 text-amber-700'
                                  }`}>
                                    Ask: {school.survey.asking?.toFixed(2) || '—'}
                                  </span>
                                  <span className={`px-1.5 py-0.5 rounded ${
                                    school.survey.feedback && school.survey.feedback >= 4.0 ? 'bg-emerald-100 text-emerald-700' :
                                    school.survey.feedback && school.survey.feedback >= 3.5 ? 'bg-gray-100 text-gray-600' :
                                    'bg-amber-100 text-amber-700'
                                  }`}>
                                    Feedback: {school.survey.feedback?.toFixed(2) || '—'}
                                  </span>
                                </>
                              )}
                            </div>
                          )}

                          {/* Chevron */}
                          <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${
                            isExpanded ? 'rotate-180' : ''
                          }`} />
                        </div>
                      </button>

                      {/* Expanded Content */}
                      {isExpanded && (
                        <div className="px-4 pb-4 border-t border-gray-100">

                          {/* Medal Badges - First Thing Visible */}
                          {school.medals && school.medals.length > 0 && (
                            <div className="py-3 flex flex-wrap gap-2">
                              {school.medals.map((medal: { type: string; label: string }, i: number) => (
                                <span
                                  key={i}
                                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                                    medal.type === 'gold' ? 'bg-amber-100 text-amber-800' :
                                    medal.type === 'silver' ? 'bg-gray-200 text-gray-700' :
                                    'bg-orange-100 text-orange-700'
                                  }`}
                                >
                                  {medal.type === 'gold' ? '🥇' : medal.type === 'silver' ? '🥈' : '🥉'} {medal.label}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Observation Day Notes - Fullerton */}
                          {school.name === 'Fullerton' && observationResults.fullerton.status === 'complete' && (
                            <details className="py-3 border-b border-gray-100">
                              <summary className="cursor-pointer">
                                <div className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900">
                                  <ClipboardList className="w-4 h-4 text-emerald-600" />
                                  Observation Day — March 3, 2026
                                  <span className="ml-2 text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">Complete</span>
                                  <ChevronDown className="w-4 h-4 ml-auto transition-transform group-open:rotate-180" />
                                </div>
                                <p className="text-xs text-gray-500 mt-1 ml-6">7 paras contacted · 7 emails sent · 5 replies with specific growth requests</p>
                              </summary>
                              <div className="mt-4 space-y-4">
                                {/* 1. At a Glance */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                  <p className="text-xs font-semibold text-gray-500 uppercase mb-3">At a Glance</p>
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                    <div><span className="text-gray-500">Paras Observed:</span> <span className="font-medium">4 formal, 2 informal, 2 appreciation</span></div>
                                    <div><span className="text-gray-500">Follow-Up Emails:</span> <span className="font-medium">7 personalized same-day</span></div>
                                    <div><span className="text-gray-500">Principal Email:</span> <span className="font-medium">Bryan Bolton</span></div>
                                    <div><span className="text-gray-500">Same-Day Replies:</span> <span className="font-medium text-emerald-600">5 (Scott, Evely, Esperanza, Jonnathan, Fatema)</span></div>
                                  </div>
                                </div>

                                {/* 2. Standout Moments */}
                                <div>
                                  <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Standout Moments</p>
                                  <div className="space-y-3">
                                    <div className="bg-white border border-gray-200 rounded-lg p-3">
                                      <p className="font-semibold text-gray-900">Jonnathan Roeglin</p>
                                      <p className="text-sm text-gray-600 mt-1">Asked &quot;How do we make this into a fraction?&quot; during small group work — guiding students to think, not giving answers. Crouched down to student level. Scanned and redirected other students while running his own group. Positioned in back during whole-class instruction to support teacher — seamless partnership.</p>
                                    </div>
                                    <div className="bg-white border border-gray-200 rounded-lg p-3">
                                      <p className="font-semibold text-gray-900">Esperanza Garcia <span className="text-xs font-normal text-gray-500">(Bilingual)</span></p>
                                      <p className="text-sm text-gray-600 mt-1">Working 1:1 in Spanish with a student in a fully Spanish classroom. Quiet voice, non-disruptive. Reading directions and asking questions to get her student thinking. Patient and kind when student seemed distracted — redirected back to slides without frustration.</p>
                                    </div>
                                    <div className="bg-white border border-gray-200 rounded-lg p-3">
                                      <p className="font-semibold text-gray-900">Kristina Orellana</p>
                                      <p className="text-sm text-gray-600 mt-1">Prepped materials before the lesson. Encouraged students during counting: &quot;There you go!&quot; Checked in with teacher quietly during a video. <span className="font-medium text-emerald-700">THE MOMENT:</span> A sleepy, disengaged student — she sat with him, quietly redirected, repeated questions until he had an answer, then guided him to raise his hand and share with the full class. Building confidence.</p>
                                    </div>
                                    <div className="bg-white border border-gray-200 rounded-lg p-3">
                                      <p className="font-semibold text-gray-900">Fatema Bakhrani <span className="text-xs font-normal text-gray-500">(Informal)</span></p>
                                      <p className="text-sm text-gray-600 mt-1">Guiding questions: &quot;What letter is missing from &apos;house&apos;?&quot; Re-reading worksheet directions step by step. Grabbed a new pencil mid-transition to keep momentum.</p>
                                    </div>
                                  </div>
                                </div>

                                {/* 3. Voices from the Field */}
                                <div>
                                  <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Voices from the Field</p>
                                  <div className="space-y-3">
                                    <blockquote className="bg-emerald-50 rounded-lg p-4 border-l-4 border-emerald-400">
                                      <p className="text-sm italic text-gray-700">&quot;I wish I could meet all my students&apos; many needs every day.&quot;</p>
                                      <p className="text-xs text-gray-500 mt-2">— Scott Nyquist, Fullerton</p>
                                      <p className="text-xs text-emerald-600 mt-1">Replied 5 minutes after receiving email</p>
                                    </blockquote>
                                    <blockquote className="bg-purple-50 rounded-lg p-4 border-l-4 border-purple-400">
                                      <span className="inline-block text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full mb-2">💬 Reached out on her own</span>
                                      <p className="text-sm italic text-gray-700">&quot;One thing I wish was easier is helping a student de-escalate instead of escalating the situation more. I still struggle somewhat in that aspect.&quot;</p>
                                      <p className="text-xs text-gray-500 mt-2">— Evely Castillo, Fullerton</p>
                                      <p className="text-xs text-purple-600 mt-1">Was not formally observed but reached out with a specific skill request after receiving an appreciation email. Matched with De-Escalation Strategies + Calm Response Scripts.</p>
                                    </blockquote>
                                    <blockquote className="bg-emerald-50 rounded-lg p-4 border-l-4 border-emerald-400">
                                      <p className="text-sm italic text-gray-700">&quot;Thank you for taking your time to come by and stop to observe me. Thank you for your comments and suggestions. I will take a look at the resources you shared with me.&quot;</p>
                                      <p className="text-xs text-gray-500 mt-2">— Esperanza Garcia, Fullerton (Bilingual Support)</p>
                                      <p className="text-xs text-emerald-600 mt-1">Replied next morning. Committed to exploring Hub resources.</p>
                                    </blockquote>
                                    <blockquote className="bg-emerald-50 rounded-lg p-4 border-l-4 border-emerald-400 ring-1 ring-emerald-100">
                                      <span className="inline-block text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full mb-2">🎯 Specific growth request</span>
                                      <p className="text-sm italic text-gray-700">&quot;I&apos;m glad that you were able to stop by and observe. One thing I wish was easier is being able to bounce around between groups of students who all need help at the same time.&quot;</p>
                                      <p className="text-xs text-gray-500 mt-2">— Jonnathan Roeglin, Fullerton</p>
                                      <p className="text-xs text-emerald-600 mt-1">Replied next morning with a specific growth request: managing multiple groups simultaneously. Matched with No-Hands-Up Help Systems resource.</p>
                                    </blockquote>
                                    <blockquote className="bg-emerald-50 rounded-lg p-4 border-l-4 border-emerald-400 ring-1 ring-emerald-100">
                                      <span className="inline-block text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full mb-2">🎯 Specific growth request</span>
                                      <p className="text-sm italic text-gray-700">&quot;Could we try to maybe break the work into smaller steps to help make the student understand it better? What is an easier strategy to help them understand?&quot;</p>
                                      <p className="text-xs text-gray-500 mt-2">— Fatema Bakhrani, Fullerton (Informal Observation)</p>
                                      <p className="text-xs text-emerald-600 mt-1">Replied with a specific strategy request: chunking and scaffolding. Matched with &quot;One Step at a Time&quot; chunking strategy.</p>
                                    </blockquote>
                                  </div>
                                </div>

                                {/* 4. Building Themes */}
                                <div>
                                  <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Building Themes</p>
                                  <div className="bg-emerald-50 rounded-lg p-4 mb-3">
                                    <p className="text-xs font-semibold text-emerald-700 uppercase mb-2">Strengths</p>
                                    <ul className="text-sm text-gray-700 space-y-1">
                                      <li className="flex items-start gap-1.5">
                                        <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                                        Strong questioning skills (Move #1) across multiple paras
                                      </li>
                                      <li className="flex items-start gap-1.5">
                                        <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                                        Patient, persistent support with disengaged students
                                      </li>
                                      <li className="flex items-start gap-1.5">
                                        <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                                        Natural teacher-para collaboration
                                      </li>
                                      <li className="flex items-start gap-1.5">
                                        <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                                        Bilingual scaffolding with EL students
                                      </li>
                                      <li className="flex items-start gap-1.5">
                                        <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                                        Intentional positioning — crouching, proximity, quiet voice
                                      </li>
                                    </ul>
                                  </div>
                                  <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
                                    <p className="text-xs font-semibold text-amber-700 uppercase mb-1">Growth Opportunity</p>
                                    <p className="text-sm text-gray-700">Feedback specificity — paras are encouraging (&quot;There you go!&quot;) but can level up to Notice → Name → Next Step for more targeted student growth</p>
                                  </div>
                                </div>

                                {/* 5. Teacher Shoutouts */}
                                <div>
                                  <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Teacher Shoutouts</p>
                                  <div className="bg-blue-50 rounded-lg p-4 space-y-3">
                                    <div>
                                      <p className="font-semibold text-gray-900">Seidenfuss</p>
                                      <p className="text-sm text-gray-600">Student-centered math lesson that created real space for meaningful small group para work alongside whole-class instruction.</p>
                                    </div>
                                    <div>
                                      <p className="font-semibold text-gray-900">Roseberg</p>
                                      <p className="text-sm text-gray-600">Warm, structured environment with systems in place for para support to happen immediately.</p>
                                    </div>
                                    <p className="text-xs text-gray-500 italic pt-2 border-t border-blue-100">Principal Bryan Bolton emailed same-day with highlights and Staff Celebration Playbook resource.</p>
                                  </div>
                                </div>
                              </div>
                            </details>
                          )}

                          {/* Lake Park Observation Notes */}
                          {school.name === 'Lake Park' && observationResults.lakePark.status === 'complete' && (
                            <details className="py-3 border-b border-gray-100">
                              <summary className="cursor-pointer">
                                <div className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900">
                                  <ClipboardList className="w-4 h-4 text-emerald-600" />
                                  Observation Day — March 3, 2026
                                  <span className="ml-2 text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">Complete</span>
                                  <ChevronDown className="w-4 h-4 ml-auto transition-transform group-open:rotate-180" />
                                </div>
                                <p className="text-xs text-gray-500 mt-1 ml-6">5 paras contacted · 5 emails sent · &quot;I feel appreciated and continue to give my best to help my kiddos.&quot;</p>
                              </summary>
                              <div className="mt-4 space-y-4">
                                {/* 1. At a Glance */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                  <p className="text-xs font-semibold text-gray-500 uppercase mb-3">At a Glance</p>
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                    <div><span className="text-gray-500">Paras Observed:</span> <span className="font-medium">4 formal, 1 informal encouragement</span></div>
                                    <div><span className="text-gray-500">Follow-Up Emails:</span> <span className="font-medium">5 personalized same-day</span></div>
                                    <div><span className="text-gray-500">Principal Email:</span> <span className="font-medium">Cristina Villalobos</span></div>
                                    <div><span className="text-gray-500">Same-Day Replies:</span> <span className="font-medium text-emerald-600">3 (Maribel, Ruby, Cristina)</span></div>
                                  </div>
                                </div>

                                {/* 2. Standout Moments */}
                                <div>
                                  <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Standout Moments</p>
                                  <div className="space-y-3">
                                    <div className="bg-white border border-gray-200 rounded-lg p-3">
                                      <p className="font-semibold text-gray-900">Maribel Ontiveros <span className="text-xs font-normal text-gray-500">(Resource)</span></p>
                                      <p className="text-sm text-gray-600 mt-1">Sitting WITH students during activity, not hovering. Seamlessly switching between English and Spanish to clarify directions and encourage effort. Checked in with teacher before redirecting. Paused group for a stretch when hands got tired — preventing dysregulation before it started. &quot;Oh very nice!&quot; &quot;Muy bonito!&quot;</p>
                                    </div>
                                    <div className="bg-white border border-gray-200 rounded-lg p-3">
                                      <p className="font-semibold text-gray-900">Mary Falco <span className="text-xs font-normal text-gray-500">(Resource)</span></p>
                                      <p className="text-sm text-gray-600 mt-1">Jumped into literacy centers with zero downtime. &quot;See! Easy! Easy peasy lemon squeezy!&quot; Made practice feel doable. Used timer + motivating words. Actively participated during OT transition — walking, rolling the wheel WITH the student. Quiet voice in hallways.</p>
                                    </div>
                                    <div className="bg-white border border-gray-200 rounded-lg p-3">
                                      <p className="font-semibold text-gray-900">Natalia Villalobos <span className="text-xs font-normal text-gray-500">(Small Group Art)</span></p>
                                      <p className="text-sm text-gray-600 mt-1">Clear expectations: &quot;We are going to do dots in the corner for snow!&quot; Sweet, calm voice. &quot;Hop hop with your sponge!&quot; Playful engagement without losing structure. Chunked directions. Patient with student struggling to sit still.</p>
                                    </div>
                                    <div className="bg-white border border-gray-200 rounded-lg p-3">
                                      <p className="font-semibold text-gray-900">Ruby Medina <span className="text-xs font-normal text-gray-500">(Informal)</span></p>
                                      <p className="text-sm text-gray-600 mt-1">Working closely with Angelo — intentional, individualized support. &quot;Do you want to sit over here?&quot; — choice-based redirection. Modeled painting by holding student&apos;s hand. Patient and calm throughout.</p>
                                    </div>
                                    <div className="bg-white border border-gray-200 rounded-lg p-3">
                                      <p className="font-semibold text-gray-900">Shelly Mayer <span className="text-xs font-normal text-gray-500">(Intensive Intervention)</span></p>
                                      <p className="text-sm text-gray-600 mt-1">Comforted upset student across room: &quot;You&apos;re okay&quot; with hand hold. Noticed student connected with a book — moved to table to read together. Growth area: leading with a question before giving space with disengaged students.</p>
                                    </div>
                                  </div>
                                </div>

                                {/* 3. Voices from the Field */}
                                <div>
                                  <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Voices from the Field</p>
                                  <div className="space-y-3">
                                    <blockquote className="bg-emerald-50 rounded-lg p-4 border-l-4 border-emerald-400">
                                      <p className="text-sm italic text-gray-700">&quot;Thank you so much for taking the time to observe me and for such kind and encouraging words. I feel appreciated and continue to give my best to help my kiddos.&quot;</p>
                                      <p className="text-xs text-gray-500 mt-2">— Maribel Ontiveros, Lake Park (Resource)</p>
                                      <p className="text-xs text-emerald-600 mt-1">Replied same day</p>
                                    </blockquote>
                                    <blockquote className="bg-purple-50 rounded-lg p-4 border-l-4 border-purple-400">
                                      <span className="inline-block text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full mb-2">💬 Unsolicited response</span>
                                      <p className="text-sm italic text-gray-700">&quot;Your message genuinely encouraged me and reminded me why this work is so important. I care deeply about meeting students where they are and helping them feel supported without being overwhelmed.&quot;</p>
                                      <p className="text-xs text-gray-500 mt-2">— Ruby Medina, Lake Park</p>
                                      <p className="text-xs text-purple-600 mt-1">Was not a scheduled observation. Saw her in action and sent an encouragement note.</p>
                                    </blockquote>
                                    <blockquote className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-400">
                                      <p className="text-sm italic text-gray-700">&quot;Our staff is truly committed to our students and works very well together as a team. It means a great deal to have that work acknowledged.&quot;</p>
                                      <p className="text-xs text-gray-500 mt-2">— Cristina Villalobos, Principal, Lake Park Elementary</p>
                                      <p className="text-xs text-blue-600 mt-1">Replied same day after receiving observation highlights email</p>
                                    </blockquote>
                                  </div>
                                </div>

                                {/* 4. Building Themes */}
                                <div>
                                  <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Building Themes</p>
                                  <div className="bg-emerald-50 rounded-lg p-4 mb-3">
                                    <p className="text-xs font-semibold text-emerald-700 uppercase mb-2">Strengths</p>
                                    <ul className="text-sm text-gray-700 space-y-1">
                                      <li className="flex items-start gap-1.5">
                                        <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                                        Strong bilingual support — seamless English/Spanish scaffolding
                                      </li>
                                      <li className="flex items-start gap-1.5">
                                        <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                                        Patience and calm regulation across every observation
                                      </li>
                                      <li className="flex items-start gap-1.5">
                                        <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                                        Proactive behavior management — stretching, choice-based redirection, timers
                                      </li>
                                      <li className="flex items-start gap-1.5">
                                        <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                                        Encouragement is frequent and genuine building-wide
                                      </li>
                                      <li className="flex items-start gap-1.5">
                                        <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                                        Clear, chunked directions — especially in Resource and small group
                                      </li>
                                      <li className="flex items-start gap-1.5">
                                        <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                                        Active engagement — paras IN it with students, not supervising
                                      </li>
                                    </ul>
                                  </div>
                                  <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
                                    <p className="text-xs font-semibold text-amber-700 uppercase mb-1">Growth Opportunities</p>
                                    <ul className="text-sm text-gray-700 space-y-1">
                                      <li>→ Feedback specificity — level up from &quot;Nice job!&quot; to Notice → Name → Next Step</li>
                                      <li>→ Initiative with disengaged students — lead with a question before giving space</li>
                                    </ul>
                                  </div>
                                </div>

                                {/* 5. Teaching Staff Highlights */}
                                <div>
                                  <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Teaching Staff Highlights</p>
                                  <div className="bg-blue-50 rounded-lg p-4 space-y-3">
                                    <div>
                                      <p className="font-semibold text-gray-900">Blue Pod Teachers</p>
                                      <p className="text-sm text-gray-600">Well-structured, student-centered environments that allowed paras to do meaningful work alongside instruction. Classroom design was clearly intentional.</p>
                                    </div>
                                    <div>
                                      <p className="font-semibold text-gray-900">Resource Team Culture</p>
                                      <p className="text-sm text-gray-600">Strong systems already in place. Paras could engage immediately because routines and expectations were established.</p>
                                    </div>
                                    <p className="text-xs text-gray-500 italic pt-2 border-t border-blue-100">Principal Cristina Villalobos emailed same-day with highlights and Staff Celebration Playbook resource.</p>
                                  </div>
                                </div>
                              </div>
                            </details>
                          )}

                          {/* Lincoln Observation Notes */}
                          {school.name === 'Lincoln' && observationResults.lincoln.status === 'complete' && (
                            <details className="py-3 border-b border-gray-100">
                              <summary className="cursor-pointer">
                                <div className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900">
                                  <ClipboardList className="w-4 h-4 text-emerald-600" />
                                  Observation Day — March 3, 2026
                                  <span className="ml-2 text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">Complete</span>
                                  <ChevronDown className="w-4 h-4 ml-auto transition-transform group-open:rotate-180" />
                                </div>
                                <p className="text-xs text-gray-500 mt-1 ml-6">4 paras observed · 4 emails sent · Carlos Chavez reading group &quot;felt like a master class&quot;</p>
                              </summary>
                              <div className="mt-4 space-y-4">
                                {/* 1. At a Glance */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                  <p className="text-xs font-semibold text-gray-500 uppercase mb-3">At a Glance</p>
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                    <div><span className="text-gray-500">Paras Observed:</span> <span className="font-medium">4 formal</span></div>
                                    <div><span className="text-gray-500">Follow-Up Emails:</span> <span className="font-medium">4 personalized same-day</span></div>
                                    <div><span className="text-gray-500">Principal Email:</span> <span className="font-medium">Kara Dohman</span></div>
                                    <div><span className="text-gray-500">Same-Day Replies:</span> <span className="font-medium text-emerald-600">2 (Kara Dohman — Principal, Carlos Chavez)</span></div>
                                  </div>
                                </div>

                                {/* 2. Standout Moments */}
                                <div>
                                  <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Standout Moments</p>
                                  <div className="space-y-3">
                                    <div className="bg-white border border-gray-200 rounded-lg p-3">
                                      <p className="font-semibold text-gray-900">Rose Marinelli <span className="text-xs font-normal text-gray-500">(w/ Valdes)</span></p>
                                      <p className="text-sm text-gray-600 mt-1">Sitting on the floor with students during the lesson — right there with them. &quot;See, if you have a pizza...&quot; — made fractions real. Nodding along as students answered. Whispering redirections. Asked teacher about shading rule for accuracy. Got supplies during transition before students needed them. &quot;Let&apos;s work for 10 minutes, and then we can take a break. Does that sound good?&quot; <span className="italic text-gray-500">Also: her granddaughter was born later that day. She showed up fully anyway.</span></p>
                                    </div>
                                    <div className="bg-white border border-emerald-200 rounded-lg p-3 ring-1 ring-emerald-100">
                                      <p className="font-semibold text-gray-900">Carlos Chavez <span className="text-xs font-normal text-gray-500">(w/ Savaglio)</span> <span className="ml-2 text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">⭐ STANDOUT</span></p>
                                      <p className="text-sm text-gray-600 mt-1">Running a small reading group that felt like a real lesson. &quot;Let&apos;s read the title and make a prediction.&quot; Questions everywhere — the right kind. &quot;And then we end our sentence with a what?&quot; Validated thinking: &quot;Good idea!&quot; &quot;I like that thought!&quot; Sounded out words alongside students. Summarized sections to check understanding — a strategy many certified teachers don&apos;t do consistently. <span className="font-medium text-emerald-700">This wasn&apos;t support. This was teaching.</span></p>
                                    </div>
                                    <div className="bg-white border border-gray-200 rounded-lg p-3">
                                      <p className="font-semibold text-gray-900">Gregoria Arredondo <span className="text-xs font-normal text-gray-500">(Teacher in Meeting)</span></p>
                                      <p className="text-sm text-gray-600 mt-1">Teacher in meeting, other para at lunch. Running the room solo. &quot;Do you want me to help you with...?&quot; Turned casual play into language-building. Managed transitions: &quot;OK students, we can have 5 minutes of free time before we...&quot; Bilingual directions. Handled nurse visit. Facilitated art activity. Problem-solving in real time. <span className="text-amber-600">Growth: go-to questions for redirecting disengaged students.</span></p>
                                    </div>
                                    <div className="bg-white border border-gray-200 rounded-lg p-3">
                                      <p className="font-semibold text-gray-900">Michelina (Lina) Hawkins <span className="text-xs font-normal text-gray-500">(Post-Lunch)</span></p>
                                      <p className="text-sm text-gray-600 mt-1">Returned from lunch, immediately checked in with other para for handoff. &quot;How&apos;s Alise doing? She was tired earlier.&quot; Strong rapport: &quot;6, 7? That was from last year!&quot; &quot;Who wants to sit at my table?&quot; — students chose her. Asked real questions: &quot;What do you think we should do with these?&quot; <span className="text-amber-600">Growth: anchoring strategies for whole-group redirection.</span></p>
                                    </div>
                                  </div>
                                </div>

                                {/* 3. Voices from the Field */}
                                <div>
                                  <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Voices from the Field</p>
                                  <div className="space-y-3">
                                    <blockquote className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-400">
                                      <p className="text-sm italic text-gray-700">&quot;They are great people and hard workers! So glad you got to visit!&quot;</p>
                                      <p className="text-xs text-gray-500 mt-2">— Kara Dohman, Principal, Lincoln Elementary</p>
                                      <p className="text-xs text-blue-600 mt-1">Replied same day after receiving observation highlights email</p>
                                    </blockquote>
                                    <blockquote className="bg-emerald-50 rounded-lg p-4 border-l-4 border-emerald-400 ring-1 ring-emerald-100">
                                      <span className="inline-block text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full mb-2">⭐ Standout Observation</span>
                                      <p className="text-sm italic text-gray-700">&quot;I would not be such a good paraeducator without the support of my coworkers and staff, Lincoln is such an amazing place!&quot;</p>
                                      <p className="text-xs text-gray-500 mt-2">— Carlos Chavez, Lincoln</p>
                                      <p className="text-xs text-emerald-600 mt-1">Replied next morning with a specific growth request: differentiating support for students with varying needs</p>
                                    </blockquote>
                                  </div>
                                </div>

                                {/* 4. Building Themes */}
                                <div>
                                  <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Building Themes</p>
                                  <div className="bg-emerald-50 rounded-lg p-4 mb-3">
                                    <p className="text-xs font-semibold text-emerald-700 uppercase mb-2">Strengths</p>
                                    <ul className="text-sm text-gray-700 space-y-1">
                                      <li className="flex items-start gap-1.5">
                                        <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                                        Strong questioning — real-world examples, predictions, comprehension checks
                                      </li>
                                      <li className="flex items-start gap-1.5">
                                        <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                                        Genuine student relationships — trust, humor, students choosing to work with paras
                                      </li>
                                      <li className="flex items-start gap-1.5">
                                        <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                                        Paras stepping into leadership when teachers unavailable
                                      </li>
                                      <li className="flex items-start gap-1.5">
                                        <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                                        Positioning and proximity — sitting on floors, working alongside students
                                      </li>
                                      <li className="flex items-start gap-1.5">
                                        <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                                        Investment in content accuracy — paras asking teachers clarifying questions
                                      </li>
                                    </ul>
                                  </div>
                                  <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
                                    <p className="text-xs font-semibold text-amber-700 uppercase mb-1">Growth Opportunities</p>
                                    <ul className="text-sm text-gray-700 space-y-1">
                                      <li>→ Classroom management support for paras leading rooms independently — go-to questions for whole-group redirection</li>
                                      <li>→ Feedback specificity — ready to level up from encouragement to Notice → Name → Next Step</li>
                                    </ul>
                                  </div>
                                </div>

                                {/* 5. Teaching Staff Highlights */}
                                <div>
                                  <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Teaching Staff Highlights</p>
                                  <div className="bg-blue-50 rounded-lg p-4 space-y-3">
                                    <div>
                                      <p className="font-semibold text-gray-900">Savaglio</p>
                                      <p className="text-sm text-gray-600">Classroom structured to give the para real ownership of instruction. The reading group felt like a master class because the design trusted the para with meaningful work.</p>
                                    </div>
                                    <div>
                                      <p className="font-semibold text-gray-900">Valdes</p>
                                      <p className="text-sm text-gray-600">Well-paced lesson that created natural space for the para to sit with students, support with real-world examples, and redirect quietly.</p>
                                    </div>
                                    <div>
                                      <p className="font-semibold text-gray-900">Para Leadership Moment (Gillen)</p>
                                      <p className="text-sm text-gray-600">Two paras ran the classroom independently while the teacher was in a meeting. Managed transitions, gave bilingual directions, redirected students. An enormous ask — and they stepped up.</p>
                                    </div>
                                    <p className="text-xs text-gray-500 italic pt-2 border-t border-blue-100">Principal Kara Dohman emailed same-day with highlights and Staff Celebration Playbook resource.</p>
                                  </div>
                                </div>
                              </div>
                            </details>
                          )}

                          {/* HERO: What This School Is Learning */}
                          <div className="py-4">
                            <h5 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4 flex items-center gap-2">
                              <TrendingUp className="w-4 h-4" />
                              What {school.name.split(' ')[0].split('(')[0]} Is Exploring
                            </h5>

                            {hasEngagement ? (
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {school.engagement.topCourses.map((course, i) => (
                                  <div
                                    key={i}
                                    className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100"
                                  >
                                    <div className="text-2xl font-bold text-blue-600 mb-1">{course.count}</div>
                                    <div className="text-sm font-medium text-gray-900 mb-2 line-clamp-2">{course.name}</div>
                                    <div className="flex items-center gap-2">
                                      <div className="flex-1 h-2 bg-blue-100 rounded-full overflow-hidden">
                                        <div
                                          className="h-full bg-blue-500 rounded-full"
                                          style={{ width: `${course.avgProgress}%` }}
                                        />
                                      </div>
                                      <span className="text-xs text-gray-500">{course.avgProgress}%</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="bg-gray-50 rounded-xl p-6 text-center">
                                <BookOpen className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                <p className="text-gray-500">No courses started yet</p>
                                <p className="text-sm text-gray-400 mt-1">
                                  {school.loggedIn} paras have logged in -  they just need a nudge to get started
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Survey Confidence Section */}
                          {school.survey && (
                            <div className="py-4 border-t border-gray-100">
                              <h5 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                                Survey Confidence ({school.survey.responses} responses{school.survey.limitedData ? ' - limited data' : ''})
                              </h5>
                              {school.survey.limitedData ? (
                                <p className="text-sm text-gray-500">
                                  Not enough survey responses to show reliable confidence data.
                                </p>
                              ) : (
                                <div className="flex gap-6">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-600">Asking Questions:</span>
                                    <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                                      school.survey.asking && school.survey.asking >= 4.0 ? 'bg-emerald-100 text-emerald-700' :
                                      school.survey.asking && school.survey.asking >= 3.5 ? 'bg-gray-100 text-gray-600' :
                                      'bg-amber-100 text-amber-700'
                                    }`}>
                                      {school.survey.asking?.toFixed(2) || '—'}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-600">Giving Feedback:</span>
                                    <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                                      school.survey.feedback && school.survey.feedback >= 4.0 ? 'bg-emerald-100 text-emerald-700' :
                                      school.survey.feedback && school.survey.feedback >= 3.5 ? 'bg-gray-100 text-gray-600' :
                                      'bg-amber-100 text-amber-700'
                                    }`}>
                                      {school.survey.feedback?.toFixed(2) || '—'}
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Implementation Data Section */}
                          {school.implementation && (school.implementation.asking !== null || school.implementation.feedback !== null) && (
                            <div className="py-4 border-t border-gray-100">
                              <h5 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                                Implementation
                              </h5>
                              <div className="flex flex-wrap gap-4 text-sm">
                                {school.implementation.asking !== null && (
                                  <span className="text-gray-700">
                                    <span className="font-medium text-[#ffba06]">{school.implementation.asking}%</span> tried asking questions
                                  </span>
                                )}
                                {school.implementation.feedback !== null && (
                                  <span className="text-gray-700">
                                    <span className="font-medium text-teal-600">{school.implementation.feedback}%</span> tried feedback formula
                                  </span>
                                )}
                              </div>
                            </div>
                          )}

                          {/* School Note */}
                          {school.note && (
                            <div className="py-3 border-t border-gray-100">
                              <p className="text-sm text-gray-600 italic">{school.note}</p>
                            </div>
                          )}

                          {/* Action Buttons Row */}
                          <div className="flex flex-wrap items-center gap-3 py-3 border-t border-gray-100">
                            {loggedInParas.length > 0 && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const emails = loggedInParas.map(p => p.email);
                                  openGmail({
                                    bcc: emails,
                                    subject: 'Keep up the great work! 🎉',
                                    body: `Hi ${school.name.split('(')[0].trim()} Team,\n\nJust a quick note to say thank you for engaging with the TDI Learning Hub!\n\nYour growth mindset makes a difference for the students you support every day.\n\nKeep it up!\nLeslie`,
                                  });
                                }}
                                className="inline-flex items-center gap-2 px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg transition-colors"
                              >
                                <Heart className="w-4 h-4" />
                                High Five {loggedInParas.length}
                              </button>
                            )}

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const emails = school.paras.map(p => p.email);
                                openGmail({
                                  bcc: emails,
                                  subject: `A note for the ${school.name.split('(')[0].trim()} team`,
                                });
                              }}
                              className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors"
                            >
                              <Mail className="w-4 h-4" />
                              Email All
                            </button>

                            {/* Spacer */}
                            <div className="flex-1" />

                            {/* View Roster Toggle */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowRoster(isRosterOpen ? null : school.id);
                              }}
                              className="inline-flex items-center gap-2 px-3 py-2 text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors"
                            >
                              <Users className="w-4 h-4" />
                              {isRosterOpen ? 'Hide' : 'View'} Roster
                              <ChevronRight className={`w-4 h-4 transition-transform ${isRosterOpen ? 'rotate-90' : ''}`} />
                            </button>
                          </div>

                          {/* Collapsible Roster (Secondary) */}
                          {isRosterOpen && (
                            <div className="pt-3 border-t border-gray-100">
                              <div className="grid md:grid-cols-2 gap-4">
                                {/* Logged In */}
                                <div className="bg-emerald-50 rounded-lg p-4">
                                  <h6 className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-3 flex items-center gap-2">
                                    <Check className="w-3 h-3" />
                                    Logged In ({loggedInParas.length})
                                  </h6>
                                  <div className="space-y-1 max-h-40 overflow-y-auto">
                                    {loggedInParas.map((para, i) => (
                                      <div key={i} className="text-sm text-gray-700 flex justify-between">
                                        <span>{para.name}</span>
                                        <span className="text-gray-400 text-xs">{para.email}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>

            {/* Building Spotlight Footer */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 text-center">
              <p className="text-sm text-gray-600">
                Every building has paras implementing new strategies. Share these wins at staff meetings and board presentations!
              </p>
            </div>
          </div>
        )}

        {/* ==================== BLUEPRINT TAB ==================== */}
        {activeTab === 'blueprint' && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-bold text-[#1e2749] mb-2">The Full TDI Blueprint</h2>
              <p className="text-gray-600">What becomes available when we continue our partnership</p>
            </div>

            {/* Embedded How We Partner Content - excludes Leadership Dashboard tab */}
            <HowWePartnerTabs excludeTabs={['dashboard', 'calculator']} showCTAs={false} />

            {/* Learn more link */}
            <div className="text-center mt-6">
              <a
                href="https://teachersdeserveit.com/how-we-partner"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#38618C] hover:text-[#2d4e73] font-medium underline underline-offset-4 transition-colors"
              >
                View full details on our website →
              </a>
            </div>
          </div>
        )}

        {/* ==================== 2026-27 TAB ==================== */}
        {activeTab === 'year2' && (
          <div className="space-y-6">

            {/* Section 1: Header */}
            <div className="bg-gradient-to-r from-[#1e2749] to-[#38618C] rounded-xl p-6 text-white">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs bg-white/20 px-3 py-1 rounded-full">Year 2 Preview</span>
              </div>
              <h2 className="text-2xl font-bold">Continue Building Momentum in 2026-27</h2>
              <p className="text-white/80 mt-2">
                This spring, you&apos;re laying the groundwork. Year 2 is where transformation becomes culture.
              </p>
            </div>

            {/* Section 2: What Continuing Looks Like */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-[#1e2749] mb-4">What Continuing Looks Like</h3>
              <div className="grid md:grid-cols-2 gap-6">
                {/* This Spring Column */}
                <div className="bg-gray-50 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Sprout className="w-5 h-5 text-[#38618C]" />
                    <span className="font-semibold text-[#1e2749]">This Spring (Phase 1)</span>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-[#38618C] flex-shrink-0 mt-0.5" />
                      <span>Pilot group of 10-20 paras</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-[#38618C] flex-shrink-0 mt-0.5" />
                      <span>2 observation days</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-[#38618C] flex-shrink-0 mt-0.5" />
                      <span>4 virtual sessions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-[#38618C] flex-shrink-0 mt-0.5" />
                      <span>Baseline + mid-point data</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-[#38618C] flex-shrink-0 mt-0.5" />
                      <span>Growth Groups begin</span>
                    </li>
                  </ul>
                </div>

                {/* Next Phase Column */}
                <div className="bg-[#ffba06]/10 rounded-xl p-5 border border-[#ffba06]/30">
                  <div className="flex items-center gap-2 mb-3">
                    <Rocket className="w-5 h-5 text-[#ffba06]" />
                    <span className="font-semibold text-[#1e2749]">2026-27 (Phase 2)</span>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <Star className="w-4 h-4 text-[#ffba06] flex-shrink-0 mt-0.5" />
                      <span>Paras get continued personalized coaching</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="w-4 h-4 text-[#ffba06] flex-shrink-0 mt-0.5" />
                      <span>Full year of support</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="w-4 h-4 text-[#ffba06] flex-shrink-0 mt-0.5" />
                      <span>Multiple observation cycles</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="w-4 h-4 text-[#ffba06] flex-shrink-0 mt-0.5" />
                      <span>Year-over-year data comparison</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="w-4 h-4 text-[#ffba06] flex-shrink-0 mt-0.5" />
                      <span>Para leadership development</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Section 3: Testimonial */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <Quote className="w-8 h-8 text-[#ffba06] mb-3" />
              <blockquote className="text-lg text-[#1e2749] italic mb-4">
                &ldquo;Year 1 got our paras excited. Year 2 made it part of who we are. Our turnover dropped from 25% to 8%, and paras are now leading their own professional learning.&rdquo;
              </blockquote>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#38618C] rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-[#1e2749]">Sarah M.</p>
                  <p className="text-sm text-gray-500">Director of Special Education, TDI Partner</p>
                </div>
              </div>
            </div>

            {/* Section 4: TDI Proven Results */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <BarChart className="w-5 h-5 text-[#38618C]" />
                <h3 className="font-bold text-[#1e2749]">TDI Proven Results</h3>
              </div>
              <p className="text-gray-600 text-sm mb-5">What our partner schools experience after a full year:</p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <p className="text-3xl font-bold text-[#38618C]">41%</p>
                  <p className="text-sm text-gray-600 mt-1">increase in job satisfaction</p>
                  <p className="text-xs text-gray-400 mt-1">5.1 → 7.2 avg</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <p className="text-3xl font-bold text-[#38618C]">71%</p>
                  <p className="text-sm text-gray-600 mt-1">increase in feeling valued</p>
                  <p className="text-xs text-gray-400 mt-1">3.8 → 6.5 avg</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <p className="text-3xl font-bold text-[#38618C]">30%</p>
                  <p className="text-sm text-gray-600 mt-1">reduction in stress</p>
                  <p className="text-xs text-gray-400 mt-1">7.9 → 5.5 avg</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <p className="text-3xl font-bold text-[#38618C]">90%</p>
                  <p className="text-sm text-gray-600 mt-1">increase in retention intent</p>
                  <p className="text-xs text-gray-400 mt-1">4.1 → 7.8 avg</p>
                </div>
              </div>

              <p className="text-xs text-gray-400 text-center mt-4">
                Data from TDI partner surveys · Industry averages from RAND, NCTQ, Learning Policy Institute
              </p>
            </div>

            {/* Section 5: What Your Paras Get */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-[#38618C]" />
                <h3 className="font-bold text-[#1e2749]">What Your Paras Get in Year 2</h3>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <Heart className="w-5 h-5 text-[#E07A5F] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-[#1e2749]">Personalized Love Notes</p>
                    <p className="text-sm text-gray-600">Every para receives individual feedback after each observation</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <BookOpen className="w-5 h-5 text-[#38618C] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-[#1e2749]">Continued Hub Access</p>
                    <p className="text-sm text-gray-600">150+ on-demand micro-courses built specifically for paras</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <Users className="w-5 h-5 text-[#38618C] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-[#1e2749]">Growth Groups</p>
                    <p className="text-sm text-gray-600">Targeted support with peers who share similar growth areas</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <Award className="w-5 h-5 text-[#ffba06] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-[#1e2749]">Leadership Pathway</p>
                    <p className="text-sm text-gray-600">Opportunity to become a para leader or mentor</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 6: What You Get as a Leader */}
            <div className="bg-[#1e2749] rounded-xl p-6 text-white">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-5 h-5 text-[#ffba06]" />
                <h3 className="font-bold">What You Get as a Leader</h3>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-[#ffba06] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Board-ready data</p>
                    <p className="text-sm text-white/70">Year-over-year metrics that prove ROI</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-[#ffba06] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Retention strategy</p>
                    <p className="text-sm text-white/70">Keep your best paras from leaving</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-[#ffba06] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Executive partnership</p>
                    <p className="text-sm text-white/70">Regular check-ins with your TDI team</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-[#ffba06] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Culture transformation</p>
                    <p className="text-sm text-white/70">Move from program to embedded practice</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 7: Risk of Stopping */}
            <div className="bg-[#E07A5F]/10 border border-[#E07A5F]/30 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-[#E07A5F]" />
                <h3 className="font-bold text-[#1e2749]">What Happens If We Stop After Phase 1?</h3>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <TrendingDown className="w-5 h-5 text-[#E07A5F] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-[#1e2749]">Momentum fades</p>
                    <p className="text-sm text-gray-600">Research shows PD impact drops 80% within 6 months without follow-up</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-[#E07A5F] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-[#1e2749]">Only your pilot benefits</p>
                    <p className="text-sm text-gray-600">97 other paras miss out on transformative support</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <BarChart className="w-5 h-5 text-[#E07A5F] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-[#1e2749]">Hard to measure ROI</p>
                    <p className="text-sm text-gray-600">One semester of data isn&apos;t enough to prove long-term impact</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Heart className="w-5 h-5 text-[#E07A5F] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-[#1e2749]">Culture doesn&apos;t stick</p>
                    <p className="text-sm text-gray-600">True culture change requires sustained investment</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Funding Support CTA */}
            <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="text-amber-600 mt-0.5">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">We Find the Funding. You Focus on Teaching.</p>
                  <p className="text-gray-600 text-sm mt-1">80% of schools we partner with find over $35K in funding for TDI. Tell us about your school. We&apos;ll handle the rest.</p>
                  <a
                    href="https://www.teachersdeserveit.com/funding"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-amber-700 hover:text-amber-800 font-medium text-sm mt-2"
                  >
                    Explore Funding Options
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>

            {/* Section 8: Renewal CTA */}
            <div className="bg-gradient-to-r from-[#1e2749] to-[#38618C] rounded-xl p-6 text-white">
              <h3 className="text-xl font-bold mb-2">Let&apos;s Talk About 2026-27</h3>
              <p className="text-white/80 mb-5">
                No pressure. We&apos;ll walk through your options and answer any questions about continuing your partnership.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href="https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-[#ffba06] hover:bg-[#e5a805] text-[#1e2749] px-6 py-3 rounded-xl font-semibold transition-all"
                >
                  <Calendar className="w-5 h-5" />
                  Schedule Renewal Conversation
                </a>
                <a
                  href="mailto:rae@teachersdeserveit.com?subject=2026-27 Partnership Question - ASD4"
                  className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl font-semibold transition-all border border-white/30"
                >
                  <Mail className="w-5 h-5" />
                  Email Rae Instead
                </a>
              </div>
              <p className="text-xs text-white/60 mt-4">
                85% of partners continue to Year 2 · Early renewal ensures continuity for your team
              </p>
            </div>

          </div>
        )}

        {/* ==================== TEAM TAB ==================== */}
        {activeTab === 'team' && (
          <div className="space-y-6">
            {/* Header */}
            <div className="text-center">
              <h2 className="text-xl font-bold text-[#1e2749] mb-2">Your TDI Team</h2>
              <p className="text-gray-600">Your dedicated partner for this journey</p>
            </div>

            {/* Rae's Contact Card */}
            <div className="bg-white rounded-xl p-6 shadow-sm max-w-2xl mx-auto">
              <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
                {/* Rae's Photo */}
                <div className="w-32 h-32 rounded-xl overflow-hidden bg-[#F5F5F5] flex-shrink-0">
                  <Image
                    src="/images/rae-headshot.png"
                    alt="Rae Hughart"
                    width={128}
                    height={128}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Rae's Info */}
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-xl font-bold text-[#1e2749]">Rae Hughart</h3>
                  <p className="text-[#38618C] font-medium mb-3">Lead Partner, Addison School District 4 Account</p>

                  <p className="text-gray-600 text-sm mb-4">
                    Rae is the co-founder of Teachers Deserve It and your dedicated partner throughout this journey. She is here to support your school&apos;s success every step of the way.
                  </p>

                  <div className="space-y-2 mb-4">
                    <a
                      href="mailto:rae@teachersdeserveit.com"
                      className="flex items-center gap-2 text-gray-600 hover:text-[#38618C] transition-colors justify-center md:justify-start"
                    >
                      <Mail className="w-4 h-4 text-[#38618C]" />
                      rae@teachersdeserveit.com
                    </a>
                    <a
                      href="tel:8477215503"
                      className="flex items-center gap-2 text-gray-600 hover:text-[#38618C] transition-colors justify-center md:justify-start"
                    >
                      <Phone className="w-4 h-4 text-[#38618C]" />
                      847-721-5503
                      <span className="text-xs bg-[#F5F5F5] px-2 py-0.5 rounded-full text-gray-500">Text is great!</span>
                    </a>
                  </div>

                  <a
                    href="https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-[#35A7FF] hover:bg-[#2589db] text-white px-6 py-3 rounded-xl font-semibold transition-all"
                  >
                    <Calendar className="w-5 h-5" />
                    Schedule Time with Rae
                  </a>
                </div>
              </div>
            </div>

            {/* Meet the Full Team Button */}
            <a
              href="https://teachersdeserveit.com/about"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full max-w-2xl mx-auto bg-[#F5F5F5] hover:bg-gray-200 text-[#1e2749] text-center py-4 rounded-xl font-semibold transition-all border border-gray-200"
            >
              Meet the Full TDI Team →
            </a>

            {/* School Information */}
            <div className="bg-white rounded-xl p-5 shadow-sm max-w-2xl mx-auto">
              <h3 className="font-bold text-[#1e2749] mb-4 flex items-center gap-2">
                <Building className="w-5 h-5 text-[#38618C]" />
                School Information
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <div className="font-semibold text-gray-800">Addison School District 4</div>
                  <div className="text-sm text-gray-600 mt-2 flex items-start gap-2">
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-[#38618C]" />
                    <div>
                      222 N. Kennedy Dr.<br />
                      Addison, IL 60101
                    </div>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-4 h-4 text-[#38618C]" />
                    (630) 458-2425
                  </div>
                  <a
                    href="https://asd4.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-[#35A7FF] hover:underline"
                  >
                    <ExternalLink className="w-4 h-4" />
                    asd4.org
                  </a>
                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Primary Contact</p>
                    <p className="font-medium text-gray-800">Janet Diaz</p>
                    <a href="mailto:jdiaz@asd4.org" className="text-[#35A7FF] hover:underline">
                      jdiaz@asd4.org
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Partnership Summary (Moved from Progress) */}
            <div className="bg-white rounded-xl p-6 shadow-sm max-w-2xl mx-auto">
              <h3 className="font-bold text-[#1e2749] mb-4">Your Partnership Includes</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-[#1e2749]">113</p>
                  <p className="text-xs text-gray-500">Paras Enrolled</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-[#1e2749]">2</p>
                  <p className="text-xs text-gray-500">Observation Days</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-[#1e2749]">4</p>
                  <p className="text-xs text-gray-500">Virtual Sessions</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-[#1e2749]">2</p>
                  <p className="text-xs text-gray-500">Exec Sessions</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#38618C]" />
                  <span><strong>Partnership Period:</strong> January 2026 -  May 2026</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#38618C]" />
                  <span><strong>Hub Access Until:</strong> January 2027</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== BILLING TAB ==================== */}
        {activeTab === 'billing' && (
          <div className="space-y-6">

            {/* Section 1: Thank You Banner */}
            <div className="bg-[#1e2749] rounded-xl p-4">
              <div className="flex items-center gap-3">
                <Heart className="w-6 h-6 text-[#ffba06] fill-[#ffba06] flex-shrink-0" />
                <p className="text-white">
                  <span className="font-medium">Thank you for investing in your team.</span>
                  <span className="text-white/80 ml-1">Partnerships like yours help us support 87,000+ educators nationwide.</span>
                </p>
              </div>
            </div>

            {/* Section 2: Your Agreements (NO amounts shown) */}
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <h3 className="font-semibold text-[#1e2749] mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Your Agreements
              </h3>

              <div className="space-y-4">

                {/* Agreement 1: Keynote */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="font-medium text-[#1e2749]">Keynote</div>
                      <div className="text-sm text-gray-500">Signed October 28, 2025</div>
                    </div>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                      Unpaid
                    </span>
                  </div>
                  <a
                    href="https://my.anchor.sh/notification/ng-notification-z26iTfxrGsja-02XKxObaAoLgCP2p"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-[#35A7FF] hover:underline"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View Agreement & Invoice Details
                  </a>
                </div>

                {/* Agreement 2: Partnership Services */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-medium text-[#1e2749]">Partnership Services (IGNITE Phase)</div>
                      <div className="text-sm text-gray-500">Signed December 9, 2025</div>
                    </div>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                      Unpaid
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mb-3">
                    Includes: 2 On-Campus Observations, 4 Virtual Sessions, 2 Executive Sessions, 94 Hub Memberships
                  </div>
                  <a
                    href="https://my.anchor.sh/notification/ng-notification-z26iTfR37lyk-wqykbBVowcAkXsBr"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-[#35A7FF] hover:underline"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View Agreement & Invoice Details
                  </a>
                </div>

              </div>
            </div>

            {/* Section 4: Impact Callout */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <p className="text-amber-900">
                  <span className="font-medium">Did you know?</span> TDI partners see a 65% implementation rate (vs. 10% industry average).
                </p>
              </div>
            </div>

            {/* Section 5: Payment Policy */}
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <button
                onClick={() => setShowPolicy(!showPolicy)}
                className="w-full flex items-center justify-between"
              >
                <h3 className="font-semibold text-[#1e2749] flex items-center gap-2">
                  <Info className="w-5 h-5" />
                  Payment Policy
                </h3>
                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showPolicy ? 'rotate-180' : ''}`} />
              </button>

              {showPolicy && (
                <div className="mt-4 pt-4 border-t border-gray-100 text-sm text-gray-600 space-y-2">
                  <p>Payment is due within 30 days of signing and is processed automatically through your saved payment method on file.</p>
                  <p>Any changes to your agreement require written approval from both parties.</p>
                  <p>Questions about billing? Contact our billing team using the information below.</p>
                </div>
              )}
            </div>

            {/* Section 6: Questions + Testimonial */}
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <h3 className="font-semibold text-[#1e2749] mb-4 flex items-center gap-2">
                <HelpCircle className="w-5 h-5" />
                Questions?
              </h3>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="text-sm text-gray-500 mb-1">Billing & Payment Questions</div>
                  <div className="font-medium text-[#1e2749]">TDI Billing Team</div>
                  <div className="text-sm text-gray-600 mb-3">Teachers Deserve It</div>
                  <a
                    href="mailto:Billing@Teachersdeserveit.com?subject=Billing Question - Addison School District 4"
                    className="inline-flex items-center gap-2 bg-[#1e2749] hover:bg-[#2a3a5c] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    Email Billing Team
                  </a>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="text-sm text-gray-500 mb-1">Contract & Fulfillment Questions</div>
                  <div className="font-medium text-[#1e2749]">Rae Hughart</div>
                  <div className="text-sm text-gray-600 mb-3">Teachers Deserve It</div>
                  <a
                    href="mailto:rae@teachersdeserveit.com?subject=Partnership Question - Addison School District 4"
                    className="inline-flex items-center gap-2 bg-[#ffba06] hover:bg-[#e5a805] text-[#1e2749] px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    Email Rae
                  </a>
                </div>
              </div>

              <div className="mt-6 pt-5 border-t border-gray-100">
                <p className="text-gray-600 italic">
                  &quot;TDI changed the way our teachers approach their day. The strategies actually stick.&quot;
                </p>
                <p className="text-sm text-gray-400 mt-1"> -  Partner School Administrator</p>
              </div>
            </div>

          </div>
        )}
      </div>

      {/* Compact Footer */}
      <footer className="bg-[#1e2749] text-white py-6 px-4">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div>
            <div className="font-bold">Teachers Deserve It</div>
            <p className="text-white/60 text-sm">Partner Dashboard for Addison School District 4</p>
          </div>
          <a
            href="https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#35A7FF] hover:bg-[#2589db] text-white px-4 py-2 rounded-lg font-semibold transition-all text-sm"
          >
            <Calendar className="w-4 h-4" />
            Schedule a Call
          </a>
        </div>
      </footer>
    </div>
  );
}
