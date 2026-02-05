'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { HowWePartnerTabs } from '@/components/HowWePartnerTabs';
import { Tooltip } from '@/components/Tooltip';
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

  // Needs Attention completion state with localStorage persistence
  // Items that are permanently complete (scheduled/done server-side)
  const permanentlyComplete = ['observation-day-1'];
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

  // Needs Attention items data
  const needsAttentionItems = [
    {
      id: 'partner-data-form',
      title: 'Complete Partner Data Form',
      description: 'Help us customize your dashboard',
      deadline: 'FEB 2026',
      actionLabel: 'Complete Your Form',
      actionUrl: '/asd4-dashboard/partner-data',
      icon: ClipboardList,
      priority: 'now'
    },
    {
      id: 'pilot-group',
      title: 'Identify Pilot Group',
      description: 'Select 10-20 paras for focused coaching',
      deadline: 'FEB 2026',
      actionLabel: 'Choose Your Pilot Paras',
      actionUrl: '/asd4-dashboard/pilot-selection',
      icon: Users,
      priority: 'now'
    },
    {
      id: 'observation-day-1',
      title: 'Schedule Observation Day 1',
      description: 'February 13, 2026 · 1:00 - 3:00 PM',
      deadline: 'FEB 2026',
      actionLabel: 'Book Observation Day',
      actionUrl: 'https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-partnership-school-clone',
      icon: Eye,
      priority: 'now',
      external: true,
      showCalendar: true
    },
    {
      id: 'virtual-session-1',
      title: 'Virtual Session 1 · 45 min',
      description: 'Flexible session -  schedule when it works for you. Suggested uses: observation debriefs, strategy check-ins, Growth Group planning, or progress celebrations.',
      deadline: 'FEB 2026',
      actionLabel: 'Book Your Session',
      actionUrl: 'https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat-clone',
      icon: Monitor,
      priority: 'upcoming',
      external: true,
      showCalendar: true
    },
    {
      id: 'observation-day-2',
      title: 'Schedule Observation Day 2',
      description: 'Follow-up on-site observation',
      deadline: 'MAR 2026',
      actionLabel: 'Book Observation Day',
      actionUrl: 'https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-partnership-school-clone',
      icon: Eye,
      priority: 'upcoming',
      external: true,
      showCalendar: true
    },
    {
      id: 'virtual-session-2',
      title: 'Virtual Session 2 · 45 min',
      description: 'Flexible session -  schedule when it works for you. Suggested uses: observation debriefs, strategy check-ins, Growth Group planning, or progress celebrations.',
      deadline: 'MAR 2026',
      actionLabel: 'Book Your Session',
      actionUrl: 'https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat-clone',
      icon: Monitor,
      priority: 'upcoming',
      external: true,
      showCalendar: true
    },
    {
      id: 'virtual-session-3',
      title: 'Virtual Session 3 · 45 min',
      description: 'Flexible session -  schedule when it works for you. Suggested uses: observation debriefs, strategy check-ins, Growth Group planning, or progress celebrations.',
      deadline: 'APR 2026',
      actionLabel: 'Book Your Session',
      actionUrl: 'https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat-clone',
      icon: Monitor,
      priority: 'upcoming',
      external: true,
      showCalendar: true
    },
    {
      id: 'virtual-session-4',
      title: 'Virtual Session 4 · 45 min',
      description: 'Flexible session -  schedule when it works for you. Suggested uses: observation debriefs, strategy check-ins, Growth Group planning, or progress celebrations.',
      deadline: 'APR 2026',
      actionLabel: 'Book Your Session',
      actionUrl: 'https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat-clone',
      icon: Monitor,
      priority: 'upcoming',
      external: true,
      showCalendar: true
    },
    {
      id: 'executive-session-2',
      title: 'Schedule Executive Session 2',
      description: 'Results review with leadership',
      deadline: 'APR 2026',
      actionLabel: 'Book Your Session',
      actionUrl: 'https://calendly.com/rae-teachersdeserveit/partnership-school-observation-day-request-clone',
      icon: Briefcase,
      priority: 'upcoming',
      external: true,
      showCalendar: true
    }
  ];

  // Completed sessions data
  const completedSessions = [
    {
      title: "Partnership Kickoff",
      date: "January 5, 2026",
      format: "In-Person",
      duration: "Multi-Hour Session",
      focusAreas: [
        "Feedback models for paraprofessional support",
        "Questioning techniques in the classroom",
        "Learning Hub onboarding and login walkthrough"
      ],
      status: "complete" as const
    }
    // Future sessions will be added here
  ];

  // Upcoming sessions data
  const upcomingSessions = [
    {
      title: 'Observation Day 1: "The Moves That Matter: Part 2"',
      date: "February 13, 2026",
      time: "1:00 - 3:00 PM",
      format: "In-Person",
      location: "Gym 1",
      participants: "70-90 paraprofessionals",
      focusAreas: [
        "Ask, Don\u2019t Tell \u2014 10+ questioning scenarios with partner role-play and real student situations",
        "Feedback That Builds Capacity \u2014 Using the Notice. Name. Next Step. formula (6+ practice reps)"
      ],
      additionalNotes: [
        "Initial survey data collection (baseline metrics)",
        "Learning Hub goal updates",
        "Game-based practice tool introduction (teachersdeserveit.com/paragametools)"
      ],
      highlightStat: "44 total practice reps (5.5x more than January kickoff)",
      status: "scheduled" as const
    }
    // Future sessions will be added here
  ];

  // Progress tab data
  const topEngagedParas = [
    { name: "Melissa Velazquez", email: "mvelazquez@asd4.org", coursesStarted: 9, avgCompletion: 91 },
    { name: "Scott Nyquist", email: "snyquist@asd4.org", coursesStarted: 6, avgCompletion: 81 },
    { name: "J Perez", email: "jperez@asd4.org", coursesStarted: 5, avgCompletion: 100 },
    { name: "Tracy Wojnicki", email: "twojnicki@asd4.org", coursesStarted: 4, avgCompletion: 100 },
    { name: "Ingrid Balbuena", email: "ibalbuena@asd4.org", coursesStarted: 4, avgCompletion: 100 },
    { name: "Ruby Medina", email: "rmedina@asd4.org", coursesStarted: 4, avgCompletion: 100 },
    { name: "Sandra DeLaGarza", email: "sdelagarza@asd4.org", coursesStarted: 4, avgCompletion: 100 }
  ];

  const topCourses = [
    { name: "Paraprofessional Foundations", started: 19, completed70: 9, inProgress: 10, completionRate: 47 },
    { name: "Differentiated Choice Boards", started: 9, completed70: 3, inProgress: 6, completionRate: 33 },
    { name: "Streamline Your Inbox", started: 9, completed70: 3, inProgress: 6, completionRate: 33 },
    { name: "Understanding Student Needs & Modifications", started: 9, completed70: 5, inProgress: 4, completionRate: 56 },
    { name: "Classroom Management Toolkit", started: 8, completed70: 5, inProgress: 3, completionRate: 63 },
    { name: "Building Strong Teacher-Para Partnerships", started: 6, completed70: 4, inProgress: 2, completionRate: 67 },
    { name: "Effective Small-Group & One-on-One Instruction", started: 6, completed70: 3, inProgress: 3, completionRate: 50 },
    { name: "Calm Classrooms, Not Chaos", started: 5, completed70: 5, inProgress: 0, completionRate: 100 },
    { name: "Connected Educators", started: 5, completed70: 1, inProgress: 4, completionRate: 20 },
    { name: "How to Get the MOST out of the TDI Learning Hub", started: 5, completed70: 1, inProgress: 4, completionRate: 20 },
    { name: "Maximize Impact: One-on-One Student Conferences", started: 5, completed70: 3, inProgress: 2, completionRate: 60 },
    { name: "De-Escalation Strategies for Unstructured Environments", started: 3, completed70: 3, inProgress: 0, completionRate: 100 },
    { name: "Communication that Clicks", started: 2, completed70: 2, inProgress: 0, completionRate: 100 },
    { name: "Effective Communication Strategies for Leaders", started: 1, completed70: 0, inProgress: 1, completionRate: 0 },
    { name: "Parent Tools That Support Student Success", started: 1, completed70: 0, inProgress: 1, completionRate: 0 },
    { name: "Procedures & Daily Routines for Art Teachers", started: 1, completed70: 0, inProgress: 1, completionRate: 0 },
    { name: "Supporting Students Through Their Daily Schedule", started: 1, completed70: 1, inProgress: 0, completionRate: 100 },
    { name: "The Differentiation Fix", started: 1, completed70: 1, inProgress: 0, completionRate: 100 },
    { name: "Your Designation Isn\u2019t Your Destiny", started: 1, completed70: 1, inProgress: 0, completionRate: 100 },
  ];

  // School-level engagement data (with real course metrics)
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
      paras: [
        { name: 'Delgado, Beatriz', email: 'bdelgado@asd4.org', loggedIn: true },
        { name: 'Garcia, Claudia', email: 'cgarcia@asd4.org', loggedIn: true },
        { name: 'Mendiola, Georjina', email: 'gmendiola@asd4.org', loggedIn: false },
        { name: 'Simone, Patricia', email: 'psimone@asd4.org', loggedIn: false },
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
      paras: [
        { name: 'Gorostieta, Michele', email: 'mgorostieta@asd4.org', loggedIn: true },
        { name: 'Beahan, Linda', email: 'lbeahan@asd4.org', loggedIn: true },
        { name: 'Magnuson, Karen', email: 'kmagnuson@asd4.org', loggedIn: true },
        { name: 'Pajova, Albana', email: 'apajova@asd4.org', loggedIn: true },
        { name: 'Hodo, Mirela', email: 'mhodo@asd4.org', loggedIn: false },
        { name: 'Miller, Paula', email: 'pmiller@asd4.org', loggedIn: true },
        { name: 'Judd, Marisa', email: 'mjudd@asd4.org', loggedIn: true },
        { name: 'Juarez, Alexia', email: 'ajuarez@asd4.org', loggedIn: false },
        { name: 'Salerno, Cori', email: 'csalerno@asd4.org', loggedIn: true },
        { name: 'Zarate, Claudia', email: 'czarate@asd4.org', loggedIn: true },
        { name: 'Sanchez, Maria', email: 'msanchez@asd4.org', loggedIn: true },
        { name: 'Zaborowski, Samantha', email: 'szaborowski@asd4.org', loggedIn: true },
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
      paras: [
        { name: 'Hawkins, Michelina', email: 'mhawkins@asd4.org', loggedIn: true },
        { name: 'Aguilar, Denys', email: 'daguilar@asd4.org', loggedIn: true },
        { name: 'Chavez, Carlos', email: 'cchavez@asd4.org', loggedIn: true },
        { name: 'Lopez-Castaneda, Victoria', email: 'vcastaneda@asd4.org', loggedIn: true },
        { name: 'Montalvo, Jazzleen', email: 'jmontalvo@asd4.org', loggedIn: true },
        { name: 'Ortiz, Maria', email: 'mortiz@asd4.org', loggedIn: false },
        { name: 'Torres, Manuela', email: 'matorres@asd4.org', loggedIn: true },
        { name: 'Bezdicek, Michelle', email: 'mbezdicek@asd4.org', loggedIn: false },
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
        { name: 'Hendricks, Sarah', email: 'shendricks@asd4.org', loggedIn: false },
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
      paras: [
        { name: 'Zaragoza Aguilar, Ana', email: 'azaragoza@asd4.org', loggedIn: true },
        { name: 'Cantu, Imelda', email: 'icantu@asd4.org', loggedIn: true },
        { name: 'Anweiler-Stanford, Nicole', email: 'nstanford@asd4.org', loggedIn: true },
        { name: 'Colbert, Kristine', email: 'kcolbert@asd4.org', loggedIn: false },
        { name: 'Hoppensteadt, Emilia', email: 'ehoppensteadt@asd4.org', loggedIn: true },
        { name: 'Marquez, Maribel', email: 'mmarquez@asd4.org', loggedIn: false },
        { name: 'Martinez, Giselle', email: 'gmartinez@asd4.org', loggedIn: true },
        { name: 'Nicieja, Monika', email: 'mnicieja@asd4.org', loggedIn: false },
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
      paras: [
        { name: 'Mondragon, Sugey', email: 'smondragon@asd4.org', loggedIn: false },
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
      paras: [
        { name: 'Tinajero Monroy, Melany', email: 'mtinajero@asd4.org', loggedIn: false },
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
        { name: 'Nuvia Rodriguez Luna', email: 'nurodriguez@asd4.org', loggedIn: false },
        { name: 'Marie Cano', email: 'mcano@asd4.org', loggedIn: false },
        { name: 'Anahi Carrera', email: 'ancarrera@asd4.org', loggedIn: false },
        { name: 'Yesenia Perez', email: 'yperez@asd4.org', loggedIn: true },
        { name: 'Michelle Samples', email: 'msamples@asd4.org', loggedIn: false },
        { name: 'Daniela Juarez', email: 'djuarez@asd4.org', loggedIn: false },
        { name: 'Mayra Saucedo', email: 'msaucedo@asd4.org', loggedIn: false },
        { name: 'Katherine Ruffolo', email: 'kruffolo@asd4.org', loggedIn: true },
        { name: 'Maria Lopez', email: 'mlopez@asd4.org', loggedIn: true },
        { name: 'Ruby Valois-Suarez', email: 'rvalois@asd4.org', loggedIn: true },
        { name: 'Kimberly Martinez', email: 'kmartinez@asd4.org', loggedIn: true },
        { name: 'Kayla Carrillo', email: 'kcarrillo@asd4.org', loggedIn: false },
      ],
    },
  ];

  const notLoggedInParas = [
    { name: "Michelle Bezdicek", email: "mbezdicek@asd4.org" },
    { name: "Aysha Chaudary", email: "achaudary@asd4.org" },
    { name: "Kristine Colbert", email: "kcolbert@asd4.org" },
    { name: "Daniela Cova Gonzalez", email: "dcgonzalez@asd4.org" },
    { name: "Mary Falco", email: "mfalco@asd4.org" },
    { name: "Jessica Gonzalez", email: "jesgonzalez@asd4.org" },
    { name: "Nancy Gremo", email: "ngremo@asd4.org" },
    { name: "Sarah Hendricks", email: "shendricks@asd4.org" },
    { name: "Mirela Hodo", email: "mhodo@asd4.org" },
    { name: "Alexia Juarez", email: "ajuarez@asd4.org" },
    { name: "Brittany Lanzo", email: "blanzo@asd4.org" },
    { name: "Maribel Marquez", email: "mmarquez@asd4.org" },
    { name: "Irma Martinez", email: "imartinez@asd4.org" },
    { name: "Georjina Mendiola", email: "gmendiola@asd4.org" },
    { name: "Sugey Mondragon", email: "smondragon@asd4.org" },
    { name: "Monika Nicieja", email: "mnicieja@asd4.org" },
    { name: "Leslie Olvera", email: "lolvera@asd4.org" },
    { name: "Maribel Ontiveros", email: "montiveros@asd4.org" },
    { name: "Maria Ortiz", email: "mortiz@asd4.org" },
    { name: "Patricia Schlesser", email: "pschlesser@asd4.org" },
    { name: "Patricia Simone", email: "psimone@asd4.org" },
    { name: "Melany Tinajero Monroy", email: "mtinajero@asd4.org" },
    { name: "Natalia Villalobos", email: "nvillalobos@asd4.org" }
  ];

  // Generate individual nudge email
  const generateNudgeEmail = (para: { name: string; email: string }) => {
    const firstName = para.name.split(' ')[0];

    const subject = encodeURIComponent('Quick help getting into the TDI Learning Hub');

    const body = encodeURIComponent(
`Hi ${firstName},

I noticed you haven't had a chance to log into the TDI Learning Hub yet -  no worries, just wanted to make sure you have what you need.

This isn't like typical PD -  it's short, practical stuff you can actually use. No 3-hour sessions, no sitting and listening. Just strategies from real educators.

Here's how to get in:
1. Go to: tdi.thinkific.com
2. Log in with your @asd4.org email
3. Try "Paraprofessional Foundations" -  it's a quick win

Let me know if you run into any issues and I'll help you out.`
    );

    return `mailto:${para.email}?subject=${subject}&body=${body}`;
  };

  // Generate "Nudge All" bulk email (BCC for privacy)
  const generateNudgeAllEmail = () => {
    const allEmails = notLoggedInParas.map(p => p.email).join(',');

    const subject = encodeURIComponent('A quick note about the TDI Learning Hub');

    const body = encodeURIComponent(
`Hi team,

Quick check-in -  some of you haven't had a chance to log into the TDI Learning Hub yet, and I wanted to make sure you have what you need to get started.

I know "professional development" can feel like one more thing on your plate. But this one's different -  short, practical strategies you can actually use. No sitting through hours of slides.

Here's how to get in:
1. Go to: tdi.thinkific.com
2. Log in with your @asd4.org email
3. Start with "Paraprofessional Foundations" -  it's a good first step

If you'd like, we can do a quick 15-minute walkthrough at our next meeting. Just let me know.

Thanks for everything you do.`
    );

    // Using BCC for privacy so recipients don't see each other's emails
    return `mailto:?bcc=${allEmails}&subject=${subject}&body=${body}`;
  };

  // Generate "High Five" celebration email for top performers
  const generateHighFiveEmail = (para: { name: string; email: string; coursesStarted: number; avgCompletion: number }) => {
    const firstName = para.name.split(' ')[0];

    const subject = encodeURIComponent('Thank you for leading the way');

    const bodyText = [
      `Hi ${firstName},`,
      '',
      'I was looking at our TDI Learning Hub progress and wanted to reach out personally.',
      '',
      `You've completed ${para.coursesStarted} courses with a ${para.avgCompletion}% average -  that puts you at the top of our team. That kind of dedication doesn't go unnoticed.`,
      '',
      'I know your time is limited and there\'s always more to do. The fact that you\'re investing in your own growth shows real commitment to our students and to yourself.',
      '',
      'Thank you for setting the example. It matters more than you know.'
    ].join('\n');

    const body = encodeURIComponent(bodyText);

    return `mailto:${para.email}?subject=${subject}&body=${body}`;
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
    { id: 'journey', label: 'Journey', icon: TrendingUp },
    { id: 'progress', label: 'Progress', icon: Users },
    { id: 'schools', label: 'Schools', icon: School },
    { id: 'blueprint', label: 'Blueprint', icon: Star },
    { id: 'year2', label: '2026-27', icon: Sparkles, badge: 'Preview' },
    { id: 'team', label: 'Team', icon: User },
    { id: 'billing', label: 'Billing', icon: CreditCard, alert: true },
  ];

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
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
              href="https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat-clone"
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
                    : tab.alert
                    ? 'bg-red-50 text-red-700 border border-red-200 ring-2 ring-red-500 ring-offset-2'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                <tab.icon className={`w-4 h-4 ${tab.alert && activeTab !== tab.id ? 'text-red-600' : ''}`} />
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
                <div className="text-2xl font-bold text-[#1e2749]">123/123</div>
                <div className="text-xs text-[#38618C] font-medium">Hub Access</div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-[#38618C]">
                <div className="flex items-center gap-2 mb-1">
                  <LogIn className="w-4 h-4 text-[#38618C]" />
                  <span className="text-xs text-gray-500 uppercase">Hub Logins</span>
                  <Tooltip text="Percentage of enrolled paras who have logged into the Learning Hub at least once. Industry average is ~40%." position="bottom" iconSize={12} />
                </div>
                <div className="text-2xl font-bold text-[#1e2749]">74%</div>
                <div className="text-xs text-[#38618C] font-medium">91/123 logged in</div>
                <div className="text-xs text-gray-400 mt-1">Goal: 100% before Observation Day 1</div>
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
                <div className="text-2xl font-bold text-[#E07A5F]">8</div>
                <div className="text-xs text-[#E07A5F] font-medium">Items pending</div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-[#ffba06]">
                <div className="flex items-center gap-2 mb-1">
                  <Flame className="w-4 h-4 text-[#ffba06]" />
                  <span className="text-xs text-gray-500 uppercase">Current Phase</span>
                  <Tooltip text="IGNITE focuses on building foundation and identifying your pilot group." position="bottom" iconSize={12} />
                </div>
                <div className="text-2xl font-bold text-[#1e2749]">IGNITE</div>
                <div className="text-xs text-[#ffba06] font-medium">Phase 1</div>
              </div>
            </div>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Card 1: Wins */}
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-sm font-semibold text-green-800">Kickoff Complete</p>
                <p className="text-xs text-green-600">Obs Day 1 scheduled · 91+ paras logged in</p>
              </div>

              {/* Card 2: Action Needed */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
                <Lightbulb className="w-8 h-8 text-amber-600 mx-auto mb-2" />
                <p className="text-sm font-semibold text-amber-800">32 Paras Remaining</p>
                <p className="text-xs text-amber-600">Try a walkthrough at your next meeting</p>
              </div>

              {/* Card 3: TDI Impact */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                <TrendingUp className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-sm font-semibold text-blue-800">65% Implementation</p>
                <p className="text-xs text-blue-600">vs 10% industry average</p>
              </div>
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
                          className="flex items-center justify-between p-4 rounded-xl border-l-4 border-[#E07A5F] bg-gray-50"
                        >
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
                            <span className="text-xs text-gray-400 hidden sm:inline">SCHEDULE BY {item.deadline}</span>
                            <a
                              href={item.actionUrl}
                              target={item.external ? '_blank' : undefined}
                              rel={item.external ? 'noopener noreferrer' : undefined}
                              className="bg-[#1e2749] text-white px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap flex items-center gap-2 hover:bg-[#2d3a5c] transition-colors"
                            >
                              {item.showCalendar && <Calendar className="w-4 h-4" />}
                              {item.actionLabel}
                              {!item.showCalendar && <ArrowRight className="w-4 h-4" />}
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
              <div className="mt-4 bg-[#35A7FF]/10 border border-[#35A7FF]/30 rounded-lg p-4 flex items-start gap-3">
                <Info className="w-5 h-5 text-[#35A7FF] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-[#1e2749] text-sm mb-1">Virtual Sessions are Flexible</p>
                  <p className="text-sm text-gray-600">
                    Schedule by dates indicate when sessions should be scheduled by. You have flexibility in how you use them -  combine sessions back-to-back, spread them out, whatever works best for your team.
                  </p>
                </div>
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
                    Districts that build in 15-30 minutes of protected time during para meetings see 3x higher implementation rates.
                  </p>
                  <p className="text-gray-600 text-sm mb-3">
                    <strong className="text-[#38618C]">TDI partners see 65% strategy implementation</strong> vs 10% industry average.
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
                  <h3 className="text-lg font-bold mt-2">2026-27 Partnership Plan</h3>
                  <p className="text-sm opacity-80 mt-1">
                    Continue building on your pilot group success.
                  </p>
                  <p className="text-sm mt-1">
                    <span className="text-[#ffba06] font-medium">TDI partners see 65% implementation</span>
                    <span className="opacity-70"> vs 10% industry average.</span>
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

        {/* ==================== JOURNEY TAB ==================== */}
        {activeTab === 'journey' && (
          <div className="space-y-6">

            {/* Section 1: Partnership Goal */}
            <div className="bg-white rounded-xl p-8 shadow-sm text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Target className="w-5 h-5 text-[#38618C]" />
                <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Your Partnership Goal</span>
              </div>
              <p className="text-xl md:text-2xl font-semibold text-[#1e2749] max-w-2xl mx-auto leading-relaxed">
                &ldquo;Equip paraprofessionals with practical strategies and resources to confidently support students and teachers.&rdquo;
              </p>
            </div>

            {/* Section 2: Implementation Equation */}
            <div className="bg-gradient-to-r from-[#ffba06]/10 to-white rounded-xl p-6 border border-[#ffba06]/30">
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

            {/* Section 3: Phase Timeline */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
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

            {/* Section 4: What Success Looks Like */}
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
        )}

        {/* ==================== PROGRESS TAB ==================== */}
        {activeTab === 'progress' && (
          <div className="space-y-6">

            {/* Section 1: Hero Win Stat */}
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-8 text-white text-center">
              <div className="text-5xl font-bold mb-2 flex items-center justify-center gap-3">
                <Trophy className="w-10 h-10" />
                50
              </div>
              <div className="text-xl font-medium mb-1">Courses Completed</div>
              <div className="text-emerald-100 text-sm">
                by your paraprofessionals -  and counting!
              </div>
              <div className="text-emerald-100 text-sm mt-2">
                That&apos;s 50 strategies ready to use in classrooms tomorrow.
              </div>
            </div>

            {/* Sessions Completed */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                Sessions Completed ({completedSessions.length})
              </h3>
              <div className="space-y-3">
                {completedSessions.map((session, idx) => (
                  <div key={idx} className="bg-white rounded-xl border border-emerald-200 shadow-sm overflow-hidden">
                    <div className="border-l-4 border-emerald-500 p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Check className="w-4 h-4 text-emerald-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{session.title}</h4>
                            <p className="text-sm text-gray-500 mt-0.5">
                              {session.date} · {session.format} · {session.duration}
                            </p>
                            <div className="mt-3">
                              <p className="text-sm font-medium text-gray-700 mb-1">Focus Areas:</p>
                              <ul className="space-y-1">
                                {session.focusAreas.map((area, i) => (
                                  <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                                    <span className="text-emerald-400 mt-1">&#8226;</span>
                                    {area}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                        <span className="text-xs font-medium bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full flex-shrink-0">
                          Complete
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Sessions */}
            {upcomingSessions.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <CalendarClock className="w-5 h-5 text-blue-500" />
                  Upcoming Sessions
                </h3>
                <div className="space-y-3">
                  {upcomingSessions.map((session, idx) => (
                    <div key={idx} className="bg-white rounded-xl border border-blue-200 shadow-sm overflow-hidden">
                      <div className="border-l-4 border-blue-500 p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <Calendar className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">{session.title}</h4>
                              <p className="text-sm text-gray-500 mt-0.5">
                                {session.date} · {session.time} · {session.format} · {session.location}
                              </p>
                              <p className="text-sm text-gray-500 mt-0.5">
                                Participants: {session.participants}
                              </p>

                              <div className="mt-3">
                                <p className="text-sm font-medium text-gray-700 mb-1">What We&apos;re Practicing:</p>
                                <ul className="space-y-1.5">
                                  {session.focusAreas.map((area, i) => (
                                    <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                                      <span className="text-blue-400 mt-1">&#8226;</span>
                                      {area}
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              <div className="mt-3">
                                <p className="text-sm font-medium text-gray-500 mb-1">Also This Session:</p>
                                <ul className="space-y-1">
                                  {session.additionalNotes.map((note, i) => (
                                    <li key={i} className="text-sm text-gray-500 flex items-start gap-2">
                                      <span className="text-gray-300 mt-1">&#8226;</span>
                                      {note}
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              <div className="mt-3 bg-blue-50 rounded-lg px-3 py-2 inline-block">
                                <p className="text-sm text-blue-700 font-medium">
                                  {session.highlightStat}
                                </p>
                              </div>
                            </div>
                          </div>
                          <span className="text-xs font-medium bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full flex-shrink-0">
                            Scheduled
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Section 2: Progress Snapshot (3 Cards with Progress Bars) */}
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
                <div className="text-3xl font-bold text-gray-900">91<span className="text-lg text-gray-400">/123</span></div>
                <div className="text-sm text-gray-500 mb-3">74% logged in</div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-teal-500 h-2 rounded-full" style={{width: '74%'}}></div>
                </div>
              </div>

              {/* Courses Started Card */}
              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-500 text-sm">Course Enrollments</span>
                  <div className="relative group">
                    <Info className="w-4 h-4 text-gray-400 cursor-help" />
                    <div className="absolute z-10 w-48 p-2 text-xs text-white bg-gray-900 rounded-lg shadow-lg -top-2 left-6 hidden group-hover:block">
                      Total course enrollments with engagement across the Learning Hub
                    </div>
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900">97</div>
                <div className="text-sm text-gray-500 mb-3">engaged enrollments across 19 courses</div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{width: '58%'}}></div>
                </div>
              </div>

              {/* Deep Engagement Card */}
              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-500 text-sm">Courses Completed</span>
                  <div className="relative group">
                    <Info className="w-4 h-4 text-gray-400 cursor-help" />
                    <div className="absolute z-10 w-48 p-2 text-xs text-white bg-gray-900 rounded-lg shadow-lg -top-2 left-6 hidden group-hover:block">
                      Course completions at 100% -  fully finished courses
                    </div>
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900">50</div>
                <div className="text-sm text-gray-500 mb-3">courses fully completed</div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{width: '52%'}}></div>
                </div>
                <div className="text-xs text-emerald-600 mt-2">52% of enrollments completed!</div>
              </div>
            </div>

            {/* Section 3: TDI Benchmark Callout */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
              <div className="flex items-start gap-3">
                <BarChart3 className="w-5 h-5 text-slate-600 mt-0.5" />
                <div>
                  <div className="font-medium text-slate-700 mb-1">How ASD4 compares</div>
                  <div className="text-sm text-slate-600">
                    <span className="font-semibold text-teal-600">Your implementation rate: 65%</span>
                    <span className="mx-2">·</span>
                    <span>Industry average: 10%</span>
                  </div>
                  <div className="text-sm text-slate-500 mt-1">
                    Your paras are <span className="font-medium text-slate-700">6x more likely</span> to use what they learn than the national average.
                  </div>
                </div>
              </div>
            </div>

            {/* Section 4: Top Engaged Paras (Recognition Section) */}
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
                        {para.coursesStarted} courses · {para.avgCompletion}% avg
                      </span>
                      <a
                        href={generateHighFiveEmail(para)}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 text-xs font-medium rounded-full transition-colors"
                      >
                        <Award className="w-3 h-3" />
                        High Five
                      </a>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-start gap-2 text-sm text-slate-600 bg-amber-50 rounded-lg p-3">
                  <Lightbulb className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <span>These paras could mentor peers who need support getting started.</span>
                </div>
              </div>
            </div>

            {/* Section 5: What's Resonating (Top Courses, Expandable) */}
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-500" />
                  <h3 className="text-lg font-semibold text-gray-900">What&apos;s Resonating</h3>
                </div>
                <span className="text-xs text-gray-500">19 of 33 courses with engagement</span>
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
            </div>

            {/* Section 6: Needs Attention (Collapsible, Soft Tone) */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
              <button
                onClick={() => setShowNotLoggedIn(!showNotLoggedIn)}
                className="w-full flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                    <Users className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-gray-900">32 paras haven&apos;t logged in yet</div>
                    <div className="text-sm text-amber-700">They may need a quick walkthrough to get started</div>
                  </div>
                </div>
                <ChevronDown className={`w-5 h-5 text-amber-600 transform transition-transform ${showNotLoggedIn ? 'rotate-180' : ''}`} />
              </button>

              {showNotLoggedIn && (
                <div className="mt-4 pt-4 border-t border-amber-200">
                  <div className="bg-white rounded-lg p-4 mb-4">
                    <div className="flex items-start gap-2 text-sm text-slate-600">
                      <Lightbulb className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                      <span>
                        <strong>Tip:</strong> Districts that build in 15 minutes of protected Hub time during para meetings see <strong>3x higher engagement</strong>.
                      </span>
                    </div>
                  </div>

                  {/* Nudge All Button */}
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm text-gray-500">Click &quot;Nudge&quot; to send a friendly reminder email</span>
                    <a
                      href={generateNudgeAllEmail()}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      <Mail className="w-4 h-4" />
                      Nudge All ({notLoggedInParas.length})
                    </a>
                  </div>

                  <div className="bg-white rounded-lg overflow-hidden">
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
                              <a
                                href={generateNudgeEmail(para)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-amber-600 hover:text-white hover:bg-amber-500 border border-amber-300 hover:border-amber-500 rounded-lg text-xs font-medium transition-colors"
                              >
                                <Send className="w-3 h-3" />
                                Nudge
                              </a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Section 7: Suggested Next Steps */}
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="flex items-center gap-2 mb-4">
                <ClipboardList className="w-5 h-5 text-teal-600" />
                <h3 className="text-lg font-semibold text-gray-900">Suggested Next Steps</h3>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50/50">
                  <div className="w-5 h-5 rounded bg-emerald-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-400 line-through">Schedule Observation Day 1</div>
                    <div className="text-sm text-emerald-600">February 13, 2026 · 1:00 - 3:00 PM</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="w-5 h-5 rounded border-2 border-gray-300 flex-shrink-0 mt-0.5"></div>
                  <div>
                    <div className="font-medium text-gray-900">Recognize your top engaged paras</div>
                    <div className="text-sm text-gray-500">A quick shout-out at your next meeting goes a long way</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="w-5 h-5 rounded border-2 border-gray-300 flex-shrink-0 mt-0.5"></div>
                  <div>
                    <div className="font-medium text-gray-900">Try a 15-min Hub walkthrough</div>
                    <div className="text-sm text-gray-500">For paras who haven&apos;t logged in -  we can help facilitate</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="w-5 h-5 rounded border-2 border-gray-300 flex-shrink-0 mt-0.5"></div>
                  <div>
                    <div className="font-medium text-gray-900">Share &quot;Paraprofessional Foundations&quot; as the starting course</div>
                    <div className="text-sm text-gray-500">It&apos;s your most popular course with 19 paras already engaged</div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100">
                <a
                  href="mailto:rae@teachersdeserveit.com"
                  className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium text-sm"
                >
                  Questions? Reach out to Rae
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>

          </div>
        )}

        {/* ==================== SCHOOLS TAB ==================== */}
        {activeTab === 'schools' && (
          <div className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <div className="text-2xl font-bold text-gray-900">9</div>
                <div className="text-sm text-gray-500">Schools</div>
              </div>
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <div className="text-2xl font-bold text-blue-600">49</div>
                <div className="text-sm text-gray-500">Paras Engaged</div>
              </div>
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <div className="text-2xl font-bold text-emerald-600">89</div>
                <div className="text-sm text-gray-500">Course Activities</div>
              </div>
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <div className="text-2xl font-bold text-red-600">2</div>
                <div className="text-sm text-gray-500">Need Attention</div>
              </div>
            </div>

            {/* Alert for schools with no engagement */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-800">ELC and Ardmore have zero course engagement</p>
                  <p className="text-sm text-amber-700 mt-1">
                    These teams have logged in but haven&apos;t started any courses yet. Consider a Hub walkthrough
                    or recommending a specific starting point.
                  </p>
                </div>
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

                          {/* Chevron */}
                          <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${
                            isExpanded ? 'rotate-180' : ''
                          }`} />
                        </div>
                      </button>

                      {/* Expanded Content */}
                      {isExpanded && (
                        <div className="px-4 pb-4 border-t border-gray-100">

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

                          {/* Action Buttons Row */}
                          <div className="flex flex-wrap items-center gap-3 py-3 border-t border-gray-100">
                            {notLoggedInParas.length > 0 && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const emails = notLoggedInParas.map(p => p.email).join(',');
                                  const subject = encodeURIComponent(`Getting Started with the TDI Learning Hub`);
                                  const body = encodeURIComponent(
                                    `Hi ${school.name.split('(')[0].trim()} Team,\n\n` +
                                    `I wanted to reach out because I noticed you haven't had a chance to log into the TDI Learning Hub yet.\n\n` +
                                    `No pressure -  I know things get busy! But when you have 10-15 minutes, the Hub has some really practical resources.\n\n` +
                                    `Here's how to get started:\n` +
                                    `1. Go to tdi.thinkific.com\n` +
                                    `2. Log in with your school email\n` +
                                    `3. Start with "Paraprofessional Foundations" -  it's quick and practical\n\n` +
                                    `Let me know if you need help!\n\n` +
                                    `Leslie`
                                  );
                                  window.open(`mailto:${emails}?subject=${subject}&body=${body}`);
                                }}
                                className="inline-flex items-center gap-2 px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-lg transition-colors"
                              >
                                <Mail className="w-4 h-4" />
                                Nudge {notLoggedInParas.length} Not Logged In
                              </button>
                            )}

                            {loggedInParas.length > 0 && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const emails = loggedInParas.map(p => p.email).join(',');
                                  const subject = encodeURIComponent(`Keep up the great work! 🎉`);
                                  const body = encodeURIComponent(
                                    `Hi ${school.name.split('(')[0].trim()} Team,\n\n` +
                                    `Just a quick note to say thank you for engaging with the TDI Learning Hub!\n\n` +
                                    `Your growth mindset makes a difference for the students you support every day.\n\n` +
                                    `Keep it up!\n` +
                                    `Leslie`
                                  );
                                  window.open(`mailto:?bcc=${emails}&subject=${subject}&body=${body}`);
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
                                const emails = school.paras.map(p => p.email).join(',');
                                window.open(`mailto:?bcc=${emails}&subject=${encodeURIComponent(`A note for the ${school.name.split('(')[0].trim()} team`)}`);
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

                                {/* Not Logged In */}
                                {notLoggedInParas.length > 0 ? (
                                  <div className="bg-amber-50 rounded-lg p-4">
                                    <h6 className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-3 flex items-center gap-2">
                                      <AlertCircle className="w-3 h-3" />
                                      Not Logged In ({notLoggedInParas.length})
                                    </h6>
                                    <div className="space-y-1 max-h-40 overflow-y-auto">
                                      {notLoggedInParas.map((para, i) => (
                                        <div key={i} className="text-sm text-gray-700 flex justify-between items-center">
                                          <span>{para.name}</span>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              const subject = encodeURIComponent(`Quick help getting into the TDI Learning Hub`);
                                              const body = encodeURIComponent(
                                                `Hi ${para.name.split(',')[0].split(' ')[0]},\n\n` +
                                                `I noticed you haven't had a chance to log into the TDI Learning Hub yet.\n\n` +
                                                `Here's how:\n` +
                                                `1. Go to tdi.thinkific.com\n` +
                                                `2. Log in with ${para.email}\n` +
                                                `3. Start with "Paraprofessional Foundations"\n\n` +
                                                `Let me know if you need help!\n\n` +
                                                `Leslie`
                                              );
                                              window.open(`mailto:${para.email}?subject=${subject}&body=${body}`);
                                            }}
                                            className="text-xs text-amber-600 hover:text-amber-800 font-medium underline"
                                          >
                                            Nudge
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="bg-emerald-50 rounded-lg p-4 flex items-center justify-center">
                                    <p className="text-emerald-600 font-medium">🎉 Everyone&apos;s logged in!</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
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
                  href="https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat-clone"
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
                    href="https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat-clone"
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
                  <p className="text-2xl font-bold text-[#1e2749]">123</p>
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

            {/* Section 2: Overdue Status Banner */}
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-red-800">Payment Overdue</div>
                    <div className="text-sm text-red-600">Please contact our billing team to resolve</div>
                  </div>
                </div>
                <a
                  href="mailto:jevon@secureplusfinancial.com?subject=Payment Resolution - Addison School District 4"
                  className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
                >
                  <Mail className="w-4 h-4" />
                  Contact Jevon Suralie
                </a>
              </div>
            </div>

            {/* Section 3: Your Agreements (NO amounts shown) */}
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
                  <div className="font-medium text-[#1e2749]">Jevon Suralie</div>
                  <div className="text-sm text-gray-600 mb-3">Secure Plus Financial</div>
                  <a
                    href="mailto:jevon@secureplusfinancial.com?subject=Billing Question - Addison School District 4"
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
            href="https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat-clone"
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
