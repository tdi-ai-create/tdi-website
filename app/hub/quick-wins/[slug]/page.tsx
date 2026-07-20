'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useHub } from '@/components/hub/HubContext';
import { getHubSupabase as getSupabase } from '@/lib/supabase-hub';
import { useLanguage } from '@/lib/hub/useLanguage';
import { useTranslation } from '@/lib/hub/useTranslation';
import {
  ArrowLeft,
  Clock,
  Zap,
  Play,
  Download,
  Check,
  CheckCircle,
  Share2,
  BookOpen,
  Bookmark,
  ExternalLink,
  Info,
} from 'lucide-react';
import CapacityFeedbackPrompt, { shouldShowCapacityFeedback } from '@/components/hub/CapacityFeedbackPrompt';
import CommunityTabs from '@/components/hub/CommunityTabs';
import CommunityNudge from '@/components/hub/CommunityNudge';
import LessonQA from '@/components/hub/LessonQA';
import AchievementInsights from '@/components/hub/AchievementInsights';

// ─── Practice Game imports ──────────────────────────────────────────────────
import { LanguageProvider } from '@/app/paragametools/context/LanguageContext';
import { QuestionKnockout } from '@/app/paragametools/components/QuestionKnockout';
import { TellOrAsk } from '@/app/paragametools/components/TellOrAsk';
import { FeedbackLevelUp } from '@/app/paragametools/components/FeedbackLevelUp';
import { FeedbackMadlibs } from '@/app/paragametools/components/FeedbackMadlibs';
import { FeedbackMakeover } from '@/app/paragametools/components/FeedbackMakeover';
import { WhatsYourMove } from '@/app/paragametools/components/WhatsYourMove';
import { ClassroomShuffle } from '@/app/paragametools/components/ClassroomShuffle';
import { PrioritizeThis } from '@/app/paragametools/components/PrioritizeThis';
import { EnergyBudget } from '@/app/paragametools/components/EnergyBudget';
import { ThisOrThat } from '@/app/paragametools/components/ThisOrThat';
import { SortItOut } from '@/app/paragametools/components/SortItOut';
import { Gamepad2, Users, Timer, Target, Lock } from 'lucide-react';
import { useMembership, type MembershipTier, canAccessContent } from '@/lib/hub/use-membership';

type Bilingual = { en: string; es: string };

interface PracticeGameConfig {
  component: React.ComponentType<{ onBack: () => void }>;
  id: string;
  contentUuid: string;
  title: Bilingual;
  description: Bilingual;
  howToPlay: Bilingual[];
  whatYouNeed: Bilingual[];
  bestFor: Bilingual;
  time: string;
  rounds: Bilingual;
  color: string;
  format: 'solo' | 'group' | 'both';
  requiredTier: MembershipTier;
}

const PRACTICE_GAME_MAP: Record<string, PracticeGameConfig> = {
  'question-knockout': {
    component: QuestionKnockout,
    id: 'practice-question-knockout',
    contentUuid: 'a1000001-0000-0000-0000-000000000001',
    title: { en: 'Question Knockout', es: 'Nocaut de Preguntas' },
    description: { en: 'You see a real classroom scenario. Your only tool? Questions. No telling, no directing, no hinting. Just questions. If you slip and tell, hit the buzzer. It is harder than you think.', es: 'Ves un escenario real del salon. Tu unica herramienta? Preguntas. Sin decir, sin dirigir, sin insinuar. Solo preguntas. Si se te escapa una orden, presiona el timbre. Es mas dificil de lo que crees.' },
    howToPlay: [
      { en: 'Read each classroom scenario', es: 'Lee cada escenario del salon' },
      { en: 'Respond using ONLY questions', es: 'Responde usando SOLO preguntas' },
      { en: 'You have 90 seconds per scenario', es: 'Tienes 90 segundos por escenario' },
      { en: 'If you catch yourself telling, hit the buzzer', es: 'Si te descubres dando ordenes, presiona el timbre' },
      { en: 'At round 5, switch roles with your partner', es: 'En la ronda 5, cambia de rol con tu companero' },
    ],
    whatYouNeed: [
      { en: 'A partner (or play solo to practice internally)', es: 'Un companero (o juega solo para practicar internamente)' },
      { en: 'A quiet space to think out loud', es: 'Un espacio tranquilo para pensar en voz alta' },
    ],
    bestFor: { en: 'Paraprofessionals, teachers, coaches -- anyone who works directly with students', es: 'Paraprofesionales, maestros, coaches -- cualquiera que trabaje directamente con estudiantes' },
    time: '~15 min',
    rounds: { en: '10 rounds', es: '10 rondas' },
    color: '#FF7847',
    format: 'both',
    requiredTier: 'professional',
  },
  'tell-or-ask': {
    component: TellOrAsk,
    id: 'practice-tell-or-ask',
    contentUuid: 'a1000002-0000-0000-0000-000000000002',
    title: { en: 'Tell or Ask?', es: 'Decir o Preguntar?' },
    description: { en: 'You will see statements educators say every day. Some are real questions that open thinking. Others are commands disguised with a question mark. Can you spot the difference? It is trickier than it sounds.', es: 'Veras frases que los educadores dicen todos los dias. Algunas son preguntas reales que abren el pensamiento. Otras son ordenes disfrazadas con un signo de interrogacion. Puedes notar la diferencia? Es mas complicado de lo que parece.' },
    howToPlay: [
      { en: 'Read each statement an educator might say', es: 'Lee cada frase que un educador podria decir' },
      { en: 'Rate your confidence (1-5) before answering', es: 'Califica tu confianza (1-5) antes de responder' },
      { en: 'Decide: is this a TELL (command) or an ASK (real question)?', es: 'Decide: es DECIR (orden) o PREGUNTAR (pregunta real)?' },
      { en: 'See the reveal and learn why', es: 'Ve la respuesta y aprende por que' },
      { en: 'Build a streak of correct answers', es: 'Construye una racha de respuestas correctas' },
    ],
    whatYouNeed: [
      { en: 'Just yourself -- this is a solo game', es: 'Solo tu -- este es un juego individual' },
      { en: 'Optional: play with a partner and debate before revealing', es: 'Opcional: juega con un companero y debatan antes de revelar' },
    ],
    bestFor: { en: 'All educators -- especially powerful for paraprofessionals learning questioning techniques', es: 'Todos los educadores -- especialmente poderoso para paraprofesionales aprendiendo tecnicas de cuestionamiento' },
    time: '~10 min',
    rounds: { en: '14 rounds', es: '14 rondas' },
    color: '#F1C40F',
    format: 'both',
    requiredTier: 'free',
  },
  'feedback-level-up': {
    component: FeedbackLevelUp,
    id: 'practice-feedback-level-up',
    contentUuid: 'a1000003-0000-0000-0000-000000000003',
    title: { en: 'Feedback Level Up', es: 'Sube de Nivel tu Retroalimentacion' },
    description: { en: 'Not all feedback is created equal. You will see real examples of feedback given to students and categorize them from Level 1 (vague) to Level 4 (exceptional). Watch out for the Level 2 trap -- it catches most people.', es: 'No toda la retroalimentacion es igual. Veras ejemplos reales de retroalimentacion dada a estudiantes y los categorizaras del Nivel 1 (vago) al Nivel 4 (excepcional). Cuidado con la trampa del Nivel 2 -- atrapa a la mayoria.' },
    howToPlay: [
      { en: 'Read each piece of student feedback', es: 'Lee cada ejemplo de retroalimentacion' },
      { en: 'Categorize it: Level 1 (Vague), 2 (Partial), 3 (Complete), or 4 (Exceptional)', es: 'Clasificalo: Nivel 1 (Vago), 2 (Parcial), 3 (Completo) o 4 (Excepcional)' },
      { en: 'See the correct level and learn why', es: 'Ve el nivel correcto y aprende por que' },
      { en: 'Watch for the "Level 2 trap" -- vague praise that feels specific', es: 'Cuidado con la "trampa del Nivel 2" -- elogios vagos que parecen especificos' },
    ],
    whatYouNeed: [
      { en: 'Just yourself', es: 'Solo tu' },
      { en: 'Optional: play at a table group and debate levels before revealing', es: 'Opcional: juega en grupo y debatan los niveles antes de revelar' },
    ],
    bestFor: { en: 'Teachers and paras who give feedback to students daily', es: 'Maestros y paraprofesionales que dan retroalimentacion a estudiantes diariamente' },
    time: '~12 min',
    rounds: { en: '12 rounds', es: '12 rondas' },
    color: '#27AE60',
    format: 'both',
    requiredTier: 'essentials',
  },
  'feedback-madlibs': {
    component: FeedbackMadlibs,
    id: 'practice-feedback-madlibs',
    contentUuid: 'a1000004-0000-0000-0000-000000000004',
    title: { en: 'Feedback Madlibs', es: 'Retroalimentacion Loca' },
    description: { en: 'Learn the Notice + Name + Next Step feedback formula through play. First, you fill in blanks blindly for laughs. Then you practice the real formula with actual student scenarios. Silly first, serious second.', es: 'Aprende la formula de retroalimentacion Observar + Nombrar + Siguiente Paso a traves del juego. Primero, llenas espacios en blanco a ciegas para reir. Luego practicas la formula real con escenarios de estudiantes.' },
    howToPlay: [
      { en: 'Silly rounds: fill in blanks WITHOUT seeing the sentence', es: 'Rondas divertidas: llena los espacios SIN ver la oracion' },
      { en: 'Reveal your silly version and laugh', es: 'Revela tu version divertida y rie' },
      { en: 'Then see the real Level 3 feedback version', es: 'Luego ve la version real de retroalimentacion Nivel 3' },
      { en: 'Real rounds: practice writing Notice + Name + Next Step feedback', es: 'Rondas reales: practica escribir retroalimentacion Observar + Nombrar + Siguiente Paso' },
      { en: 'Compare your version to the expert example', es: 'Compara tu version con el ejemplo experto' },
    ],
    whatYouNeed: [
      { en: 'Just yourself', es: 'Solo tu' },
      { en: 'Best played in a group for the silly rounds -- more laughs', es: 'Mejor en grupo para las rondas divertidas -- mas risas' },
    ],
    bestFor: { en: 'Educators learning the feedback formula for the first time, or anyone who wants a refresher', es: 'Educadores aprendiendo la formula de retroalimentacion por primera vez, o cualquiera que quiera repasarla' },
    time: '~10 min',
    rounds: { en: '6 rounds (3 silly + 3 real)', es: '6 rondas (3 divertidas + 3 reales)' },
    color: '#9333EA',
    format: 'both',
    requiredTier: 'all_access',
  },
  'feedback-makeover': {
    component: FeedbackMakeover,
    id: 'practice-feedback-makeover',
    contentUuid: 'a1000005-0000-0000-0000-000000000005',
    title: { en: 'Feedback Makeover', es: 'Transformacion de Retroalimentacion' },
    description: { en: 'You get terrible feedback and the real context behind it. Your job: transform it into Level 3 feedback using Notice + Name + Next Step. You are on the clock -- 120 seconds per makeover.', es: 'Recibes retroalimentacion terrible y el contexto real detras de ella. Tu trabajo: transformarla en retroalimentacion Nivel 3 usando Observar + Nombrar + Siguiente Paso. Tienes 120 segundos por transformacion.' },
    howToPlay: [
      { en: 'Read the bad feedback an educator gave', es: 'Lee la mala retroalimentacion que dio un educador' },
      { en: 'Read the context of what the student actually did', es: 'Lee el contexto de lo que el estudiante realmente hizo' },
      { en: 'Start the timer -- you have 120 seconds', es: 'Inicia el temporizador -- tienes 120 segundos' },
      { en: 'Write your Level 3 makeover (Notice + Name + Next Step)', es: 'Escribe tu transformacion Nivel 3 (Observar + Nombrar + Siguiente Paso)' },
      { en: 'Use the hint if you get stuck', es: 'Usa la pista si te atascas' },
      { en: 'View your before/after transformation', es: 'Ve tu transformacion antes/despues' },
    ],
    whatYouNeed: [
      { en: 'A device to type on', es: 'Un dispositivo para escribir' },
      { en: 'Best solo, but can be done as a table challenge', es: 'Mejor individual, pero puede hacerse como desafio en mesa' },
    ],
    bestFor: { en: 'Educators who know the feedback formula and want to practice applying it under pressure', es: 'Educadores que conocen la formula y quieren practicar aplicandola bajo presion' },
    time: '~15 min',
    rounds: { en: '6 rounds', es: '6 rondas' },
    color: '#E74C3C',
    format: 'both',
    requiredTier: 'professional',
  },
  'whats-your-move': {
    component: WhatsYourMove,
    id: 'practice-whats-your-move',
    contentUuid: 'a1000006-0000-0000-0000-000000000006',
    title: { en: "What's Your Move?", es: 'Cual Es Tu Movimiento?' },
    description: { en: 'Real classroom scenarios with three response options. Only one is the best move. Choose wisely, get instant feedback on why it works (or why it does not), and sharpen your instincts for the moments that matter.', es: 'Escenarios reales del salon con tres opciones de respuesta. Solo una es el mejor movimiento. Elige sabiamente, recibe retroalimentacion instantanea sobre por que funciona (o no), y afila tus instintos para los momentos que importan.' },
    howToPlay: [
      { en: 'Read a real classroom scenario', es: 'Lee un escenario real del salon' },
      { en: 'Choose the best response from three options', es: 'Elige la mejor respuesta de tres opciones' },
      { en: 'See instant feedback on your choice', es: 'Ve retroalimentacion instantanea sobre tu eleccion' },
      { en: 'Learn the reasoning behind the best move', es: 'Aprende el razonamiento detras del mejor movimiento' },
    ],
    whatYouNeed: [
      { en: 'Just yourself', es: 'Solo tu' },
      { en: 'Great for table discussions in PD sessions', es: 'Excelente para discusiones en mesa durante sesiones de PD' },
    ],
    bestFor: { en: 'Paraprofessionals and new teachers building classroom instincts', es: 'Paraprofesionales y maestros nuevos construyendo instintos del salon' },
    time: '~10 min',
    rounds: { en: '6 scenarios', es: '6 escenarios' },
    color: '#22b8bd',
    format: 'both',
    requiredTier: 'free',
  },
  'classroom-shuffle': {
    component: ClassroomShuffle,
    id: 'practice-classroom-shuffle',
    contentUuid: 'a1000007-0000-0000-0000-000000000007',
    title: { en: 'Classroom Scenario Shuffle', es: 'Escenarios del Salon' },
    description: { en: 'Realistic classroom management scenarios drawn from real schools. Read the situation, choose your response, and learn why the best move works. Covers everything from student behavior to parent communication to colleague dynamics.', es: 'Escenarios realistas de manejo del salon tomados de escuelas reales. Lee la situacion, elige tu respuesta, y aprende por que funciona el mejor movimiento. Cubre desde comportamiento estudiantil hasta comunicacion con padres y dinamicas con colegas.' },
    howToPlay: [
      { en: 'Read the classroom scenario', es: 'Lee el escenario del salon' },
      { en: 'Choose the best response from three options', es: 'Elige la mejor respuesta de tres opciones' },
      { en: 'See whether you were right and learn why', es: 'Ve si acertaste y aprende por que' },
      { en: 'Track your score across all scenarios', es: 'Sigue tu puntuacion en todos los escenarios' },
    ],
    whatYouNeed: [
      { en: 'Just yourself', es: 'Solo tu' },
      { en: 'Powerful as a group discussion tool in PD', es: 'Poderoso como herramienta de discusion grupal en PD' },
    ],
    bestFor: { en: 'All educators -- scenarios range from K-2 to high school, teacher to admin', es: 'Todos los educadores -- escenarios desde K-2 hasta preparatoria, maestros hasta administradores' },
    time: '~12 min',
    rounds: { en: '8 scenarios', es: '8 escenarios' },
    color: '#3498DB',
    format: 'both',
    requiredTier: 'essentials',
  },
  'prioritize-this': {
    component: PrioritizeThis,
    id: 'practice-prioritize-this',
    contentUuid: 'a1000008-0000-0000-0000-000000000008',
    title: { en: 'Prioritize This', es: 'Prioriza Esto' },
    description: { en: 'You are given a real school situation and four tasks that all need to happen. Rank them from most to least urgent. Then see how experienced educators would prioritize and learn why order matters.', es: 'Te dan una situacion real de escuela y cuatro tareas que todas necesitan hacerse. Ordenalas de mas a menos urgente. Luego ve como educadores experimentados priorizarian y aprende por que el orden importa.' },
    howToPlay: [
      { en: 'Read the situation', es: 'Lee la situacion' },
      { en: 'Use the up/down arrows to rank 4 tasks by priority', es: 'Usa las flechas arriba/abajo para ordenar 4 tareas por prioridad' },
      { en: 'Lock in your ranking', es: 'Confirma tu orden' },
      { en: 'See the expert ranking with explanations for each position', es: 'Ve el orden experto con explicaciones para cada posicion' },
    ],
    whatYouNeed: [
      { en: 'Just yourself', es: 'Solo tu' },
      { en: 'Great debate starter for team meetings', es: 'Excelente para iniciar debates en reuniones de equipo' },
    ],
    bestFor: { en: 'Teachers, paras, and leaders practicing triage and decision-making', es: 'Maestros, paraprofesionales y lideres practicando triaje y toma de decisiones' },
    time: '~10 min',
    rounds: { en: '3 rounds', es: '3 rondas' },
    color: '#9333EA',
    format: 'both',
    requiredTier: 'all_access',
  },
  'energy-budget': {
    component: EnergyBudget,
    id: 'practice-energy-budget',
    contentUuid: 'a1000009-0000-0000-0000-000000000009',
    title: { en: 'Energy Budget', es: 'Presupuesto de Energia' },
    description: { en: 'You have 100 energy points to spend across your day. How do you allocate them? Distribute your energy across competing demands, then see how experienced educators would budget theirs. The gaps reveal your growth areas.', es: 'Tienes 100 puntos de energia para gastar en tu dia. Como los distribuyes? Reparte tu energia entre demandas competidoras, luego ve como educadores experimentados distribuirian la suya. Las diferencias revelan tus areas de crecimiento.' },
    howToPlay: [
      { en: 'Read the day scenario', es: 'Lee el escenario del dia' },
      { en: 'Distribute 100 energy points across the tasks using + and - buttons', es: 'Distribuye 100 puntos de energia entre las tareas usando los botones + y -' },
      { en: 'Use all 100 points (no leftovers)', es: 'Usa todos los 100 puntos (sin sobrantes)' },
      { en: 'Lock in your budget', es: 'Confirma tu presupuesto' },
      { en: 'Compare your allocation to the expert recommendation', es: 'Compara tu distribucion con la recomendacion experta' },
    ],
    whatYouNeed: [
      { en: 'Just yourself', es: 'Solo tu' },
      { en: 'Helpful for self-care and sustainability conversations in PD', es: 'Util para conversaciones de autocuidado y sostenibilidad en PD' },
    ],
    bestFor: { en: 'All educators -- especially those struggling with burnout or overcommitment', es: 'Todos los educadores -- especialmente quienes luchan con el agotamiento o el exceso de compromisos' },
    time: '~10 min',
    rounds: { en: '3 rounds', es: '3 rondas' },
    color: '#22b8bd',
    format: 'both',
    requiredTier: 'essentials',
  },
  'this-or-that': {
    component: ThisOrThat,
    id: 'practice-this-or-that',
    contentUuid: 'a1000010-0000-0000-0000-000000000010',
    title: { en: 'This or That', es: 'Esto o Aquello' },
    description: { en: 'Two approaches to the same classroom moment. No right answer. Pick yours, then see how other educators respond. The splits reveal what your instincts say about your teaching.', es: 'Dos enfoques para el mismo momento en el salon. Sin respuesta correcta. Elige el tuyo, luego ve como responden otros educadores. Las divisiones revelan lo que tus instintos dicen sobre tu ensenanza.' },
    howToPlay: [
      { en: 'Choose your grade band to compare with similar educators', es: 'Elige tu nivel de grado para comparar con educadores similares' },
      { en: 'Read a real classroom scenario', es: 'Lee un escenario real del salon' },
      { en: 'Pick between two legitimate approaches', es: 'Elige entre dos enfoques legitimos' },
      { en: 'See how other educators responded', es: 'Ve como respondieron otros educadores' },
      { en: 'Read research and reflection for each round', es: 'Lee investigacion y reflexion para cada ronda' },
      { en: 'Discover your educator profile at the end', es: 'Descubre tu perfil de educador al final' },
    ],
    whatYouNeed: [
      { en: 'Just yourself', es: 'Solo tu' },
      { en: 'Powerful for group PD -- discuss the rounds where the room is most split', es: 'Poderoso para PD grupal -- discutan las rondas donde el grupo esta mas dividido' },
    ],
    bestFor: { en: 'All educators. The peer compare data makes every play unique. Great conversation starter for PD sessions.', es: 'Todos los educadores. Los datos de comparacion hacen cada partida unica. Excelente para iniciar conversaciones en sesiones de PD.' },
    time: '~12 min',
    rounds: { en: '8 rounds', es: '8 rondas' },
    color: '#E8B84B',
    format: 'both',
    requiredTier: 'all_access',
  },
  'sort-it-out': {
    component: SortItOut,
    id: 'practice-sort-it-out',
    contentUuid: 'a1000011-0000-0000-0000-000000000011',
    title: { en: 'Sort It Out', es: 'Clasifica Esto' },
    description: { en: 'Items appear. Buckets wait. Drag each one into the right category. Sounds simple until you hit the tricky ones. Covers feedback, mindset, management strategies, accommodations, and para responsibilities.', es: 'Aparecen items. Los cubos esperan. Arrastra cada uno a la categoria correcta. Suena simple hasta que llegas a los complicados. Cubre retroalimentacion, mentalidad, estrategias de manejo, acomodaciones y responsabilidades del para.' },
    howToPlay: [
      { en: 'Read each item carefully', es: 'Lee cada item con cuidado' },
      { en: 'Tap to select, then tap a bucket to place it', es: 'Toca para seleccionar, luego toca un cubo para colocarlo' },
      { en: 'You can move items between buckets before submitting', es: 'Puedes mover items entre cubos antes de enviar' },
      { en: 'Submit when all items are sorted', es: 'Envia cuando todos los items esten clasificados' },
      { en: 'See which ones you got right, with explanations for wrong placements', es: 'Ve cuales acertaste, con explicaciones para los que no' },
    ],
    whatYouNeed: [
      { en: 'Just yourself', es: 'Solo tu' },
      { en: 'Great for team discussions about where items belong and why', es: 'Excelente para discusiones en equipo sobre donde pertenecen los items y por que' },
    ],
    bestFor: { en: 'All educators. The para responsibilities set is specifically designed for paraprofessionals. Accommodation vs modification set is essential for anyone supporting IEP students.', es: 'Todos los educadores. El set de responsabilidades del para esta especificamente disenado para paraprofesionales.' },
    time: '~15 min',
    rounds: { en: '5 categories, 10 items each', es: '5 categorias, 10 items cada una' },
    color: '#2563EB',
    format: 'both',
    requiredTier: 'all_access',
  },
};

// ─── Game Testimonials ──────────────────────────────────────────────────────

const GAME_TESTIMONIALS: Record<string, { quote: string; role: string }[]> = {
  'question-knockout': [
    { quote: "As a para, this completely changed how I talk to students during small group. I catch myself redirecting without telling now.", role: "Paraprofessional, K-2" },
    { quote: "I thought I was good at asking questions until this game humbled me. I was telling disguised as asking the whole time.", role: "3rd grade teacher" },
    { quote: "We played this at our PLC and it got SO competitive. My AP kept hitting the buzzer on herself.", role: "Instructional coach" },
  ],
  'tell-or-ask': [
    { quote: "I do redirects all day in small groups. This game made me realize half of them are tells. Working on flipping that.", role: "Paraprofessional, 3-5" },
    { quote: "The confidence meter is what got me. I was SO sure 'Sound it out' was an ask. It's not.", role: "1st grade teacher" },
    { quote: "I use this in every new teacher training now. The reveals always spark the best discussions.", role: "Instructional coach" },
  ],
  'feedback-level-up': [
    { quote: "I support a high school math class and thought the feedback I give in small groups was solid. This game showed me I was stuck at Level 2.", role: "Paraprofessional, 9-12" },
    { quote: "The Level 2 trap is REAL. I fell for it 4 times. Now I catch myself giving vague praise in class.", role: "Middle school math teacher" },
    { quote: "Our team played this and then rewrote our report card comments. Night and day difference.", role: "Grade-level lead" },
  ],
  'feedback-madlibs': [
    { quote: "As a para who works with the same small group every day, this formula is gold. The kids remember it because they laughed through it first.", role: "Paraprofessional, K-2" },
    { quote: "The silly rounds had us crying laughing. Then the real rounds hit different because we already had the formula in our heads.", role: "4th grade teacher" },
    { quote: "Notice, Name, Next Step. I say it in my sleep now. This game drilled it in without feeling like a drill.", role: "New teacher, year 1" },
  ],
  'feedback-makeover': [
    { quote: "I started doing these during my planning breaks. 120 seconds to transform 'Good job' into real feedback. Harder than it sounds but SO good.", role: "Paraprofessional, middle school" },
    { quote: "The timer makes it real. You can't overthink it. Just Notice, Name, Next Step. Go.", role: "8th grade ELA teacher" },
    { quote: "I started screenshotting my before/afters and sharing them with my team. We turned it into a weekly challenge.", role: "Department head" },
  ],
  'whats-your-move': [
    { quote: "First year as a para and this game gave me more confidence for Monday morning than anything else. The scenarios are realistic.", role: "Paraprofessional, 9-12" },
    { quote: "Every scenario felt like something that happened to me last week. The explanations for why the wrong answers don't work -- that's where the real learning is.", role: "Paraprofessional, 3-5" },
    { quote: "I got 4 out of 6 right and the two I missed completely changed how I think about proximity.", role: "First-year teacher" },
  ],
  'classroom-shuffle': [
    { quote: "I work with a middle school team as a para. The staff meeting scenario tripped me up but now I know -- redirect to private is always the move.", role: "Paraprofessional, 6-8" },
    { quote: "The parent email scenario -- I've literally been in that exact situation. Wish I had this game before I responded.", role: "6th grade teacher" },
    { quote: "We use the scenarios as discussion prompts at our staff meetings. The debates are incredible.", role: "Instructional coach" },
  ],
  'prioritize-this': [
    { quote: "Played this with the other paras at lunch. We each ranked silently then compared. The disagreements showed how differently we support our classrooms.", role: "Paraprofessional, K-2" },
    { quote: "I ranked 'greet students at the door' as #1 every time. The game showed me why that's not always right. Context matters.", role: "High school teacher" },
    { quote: "We used this at our leadership team retreat. The debates were incredible.", role: "Principal" },
  ],
  'energy-budget': [
    { quote: "Been a para for 20 years. I scored 42% alignment with the experts. Turns out I have been over investing in everyone else's needs for decades.", role: "Paraprofessional, 3-5" },
    { quote: "I gave personal reset 5 points. The expert gave it 15. That one number told me everything about why I'm burned out.", role: "7th grade science teacher" },
    { quote: "This is the game that made me actually take a lunch break. Not joking.", role: "3rd grade teacher" },
  ],
  'this-or-that': [
    { quote: "No right answer means no pressure. I was more honest about my instincts than in any other PD I have done.", role: "Paraprofessional, K-2" },
    { quote: "The 50/50 splits started the best team conversations. We realized we approach the same situations completely differently.", role: "Instructional coach" },
    { quote: "Seeing that 70% of K-2 teachers agreed with me but only 40% of high school teachers did. That gap taught me more than any lecture.", role: "3rd grade teacher" },
  ],
  'sort-it-out': [
    { quote: "The para responsibilities set should be required for every new para orientation. Finally someone made it clear.", role: "Paraprofessional, K-2" },
    { quote: "The accommodation vs modification set finally made the difference click. I have been confusing them for years.", role: "Special education teacher" },
    { quote: "Used the Feedback or Praise set with my lead teacher. We had the best conversation about what we actually say to kids in small group.", role: "Paraprofessional, 3-5" },
  ],
};

function getGameTestimonials(slug: string): { quote: string; role: string }[] {
  return GAME_TESTIMONIALS[slug] || [
    { quote: "This game changed how I think about my classroom practice.", role: "Educator" },
  ];
}

// ─── Breathing Exercise Component ───────────────────────────────────────────

function BreathingExercise() {
  const [phase, setPhase] = useState(0);
  const [count, setCount] = useState(4);
  const [round, setRound] = useState(1);
  const [isRunning, setIsRunning] = useState(false);

  const phases = [
    { label: 'Breathe in',  sub: 'Slowly fill your lungs',    size: 160, innerSize: 100, color: '#4ecdc4' },
    { label: 'Hold',        sub: 'Stay still, let it settle',  size: 160, innerSize: 100, color: '#FFBA06' },
    { label: 'Breathe out', sub: 'Release slowly and fully',   size: 120, innerSize: 76,  color: '#4ecdc4' },
    { label: 'Hold',        sub: 'Empty and at ease',          size: 120, innerSize: 76,  color: '#38618C' },
  ];

  useEffect(() => {
    if (!isRunning) return;
    const timer = setInterval(() => {
      setCount(prev => {
        if (prev <= 1) {
          setPhase(p => {
            const next = (p + 1) % 4;
            if (next === 0) setRound(r => r < 3 ? r + 1 : 1);
            return next;
          });
          return 4;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isRunning]);

  const current = phases[phase];

  return (
    <div className="text-center py-6">
      {!isRunning ? (
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-32 h-32 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(78,205,196,0.12)', border: '2px solid rgba(78,205,196,0.3)' }}
          >
            <div style={{ fontSize: '32px', color: '#4ecdc4', fontWeight: 700 }}>4</div>
          </div>
          <button
            onClick={() => setIsRunning(true)}
            className="px-8 py-2.5 rounded-full text-sm font-semibold text-white"
            style={{ background: '#1e2749' }}
          >
            Start breathing exercise
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <div
            className="rounded-full flex items-center justify-center transition-all duration-1000"
            style={{
              width: current.size,
              height: current.size,
              background: `${current.color}20`,
              border: `2px solid ${current.color}50`,
            }}
          >
            <div
              className="rounded-full flex items-center justify-center transition-all duration-1000"
              style={{
                width: current.innerSize,
                height: current.innerSize,
                background: `${current.color}30`,
              }}
            >
              <span style={{ fontSize: '28px', fontWeight: 700, color: '#1e2749' }}>{count}</span>
            </div>
          </div>
          <div className="text-base font-semibold" style={{ color: '#1e2749' }}>{current.label}</div>
          <div className="text-sm" style={{ color: '#9CA3AF' }}>{current.sub}</div>
          <div className="flex gap-2 mt-1">
            {phases.map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full transition-all"
                style={{ background: i === phase ? current.color : '#E5E7EB' }}
              />
            ))}
          </div>
          <div className="text-xs mt-1" style={{ color: '#9CA3AF' }}>Round {round} of 3</div>
          <button
            onClick={() => { setIsRunning(false); setPhase(0); setCount(4); setRound(1); }}
            className="text-xs mt-1"
            style={{ color: '#9CA3AF', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            Reset
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Constants ──────────────────────────────────────────────────────────────

const CATEGORY_COLORS: Record<string, string> = {
  'Stress Relief': '#7C9CBF',
  'Time Savers': '#6BA368',
  'Classroom Tools': '#ffba06',
  'Communication': '#E8927C',
  'Self-Care': '#9B7CB8',
  'Stress & Wellness': '#7C9CBF',
  'Classroom Management': '#ffba06',
  'Leadership': '#9B7CB8',
  'New Teacher': '#5BBEC4',
};

// Testimonials pool - varied roles across K-12
const TESTIMONIALS = [
  { quote: "I printed this out and taped it to my desk. It's the first thing I look at every morning now.", role: "3rd grade teacher", time: "2 days ago" },
  { quote: "Shared this with my whole team at our PLC meeting. Three of them started using it that same week.", role: "Instructional coach", time: "4 days ago" },
  { quote: "As a para, I don't always get tools made for me. This one actually fits how I work.", role: "Paraprofessional, K-2", time: "1 week ago" },
  { quote: "Simple but powerful. I used this during my first year and it helped me survive December.", role: "1st-year teacher", time: "3 days ago" },
  { quote: "I adapted this for my high school students and it worked even better than expected.", role: "9th grade ELA teacher", time: "5 days ago" },
  { quote: "Our AP used this in a faculty meeting. Changed the tone of the whole conversation.", role: "Assistant principal", time: "1 week ago" },
  { quote: "I've been teaching 18 years and this is the first checklist that didn't feel like busywork.", role: "5th grade teacher", time: "6 days ago" },
  { quote: "Downloaded it on my phone and use it on my commute. Quick and actually useful.", role: "Middle school counselor", time: "3 days ago" },
  { quote: "My co-teacher and I use this to plan our week. Game changer for our inclusion classroom.", role: "Special education teacher", time: "4 days ago" },
  { quote: "Wish I had this when I started. Would have saved me months of figuring things out alone.", role: "2nd-year teacher", time: "1 week ago" },
  { quote: "I keep coming back to this one. It's become part of my routine.", role: "4th grade teacher", time: "2 days ago" },
  { quote: "Used this to coach a struggling teacher. She said it was the most helpful thing anyone gave her.", role: "Literacy coach", time: "5 days ago" },
  { quote: "Finally something I can use in 5 minutes between classes. That's real.", role: "High school math teacher", time: "3 days ago" },
  { quote: "I brought this to our district PD day. People were asking where to find more.", role: "District curriculum specialist", time: "1 week ago" },
  { quote: "As a building sub, I need tools that work anywhere. This delivers.", role: "Substitute teacher", time: "4 days ago" },
];

// Pick 1-3 testimonials deterministically based on quick win ID
function getTestimonials(id: string): typeof TESTIMONIALS {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = ((hash << 5) - hash + id.charCodeAt(i)) | 0;
  const idx = Math.abs(hash) % TESTIMONIALS.length;
  const count = (Math.abs(hash) % 3) + 1; // 1-3 testimonials
  const result = [];
  for (let i = 0; i < count; i++) {
    result.push(TESTIMONIALS[(idx + i) % TESTIMONIALS.length]);
  }
  return result;
}

// ─── Interfaces ─────────────────────────────────────────────────────────────

interface QuickWin {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  content: string | null;
  category: string | null;
  estimated_minutes: number;
  content_type: string;
  video_url: string | null;
  download_url: string | null;
  capacity?: 'low' | 'medium' | 'high' | null;
  title_es?: string | null;
  description_es?: string | null;
  content_es?: string | null;
  access_tier?: string;
  is_free_rotating?: boolean;
}

interface QuickWinPageProps {
  params: Promise<{ slug: string }>;
}


// ─── Helpers ────────────────────────────────────────────────────────────────


// ─── Main Component ─────────────────────────────────────────────────────────

export default function QuickWinPage({ params }: QuickWinPageProps) {
  const resolvedParams = use(params);
  const { slug } = resolvedParams;
  const router = useRouter();
  const { user } = useHub();
  const { language, t } = useLanguage();
  const lang = language === 'es' ? 'es' : 'en';

  // ─── Practice Game Route ─────────────────────────────────────────────────
  const gameConfig = PRACTICE_GAME_MAP[slug];
  const [isPlaying, setIsPlaying] = useState(false);
  const { canAccess: canAccessGame, effectiveTier } = useMembership();

  if (gameConfig) {
    const GameComponent = gameConfig.component;
    const hasAccess = canAccessGame({ access_tier: gameConfig.requiredTier });

    // Full-screen game mode
    if (isPlaying && hasAccess) {
      return (
        <LanguageProvider>
          <GameComponent onBack={() => setIsPlaying(false)} />
        </LanguageProvider>
      );
    }

    // Game landing page
    const FormatIcon = gameConfig.format === 'solo' ? Target : gameConfig.format === 'group' ? Users : Users;
    const formatLabel = gameConfig.format === 'solo' ? 'Solo' : gameConfig.format === 'group' ? (lang === 'es' ? 'Actividad grupal' : 'Group activity') : (lang === 'es' ? 'Solo o en grupo' : 'Solo or group');

    return (
      <div className="min-h-screen" style={{ backgroundColor: '#F5F7FA', fontFamily: "'DM Sans', sans-serif" }}>
        <div className="max-w-[1100px] mx-auto px-4 md:px-8 pt-6 md:pt-10">
          {/* Back link */}
          <Link
            href="/hub/quick-wins?filter=Games"
            className="inline-flex items-center gap-2 text-sm mb-6 transition-colors"
            style={{ color: '#6B7280' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#1e2749')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#6B7280')}
          >
            <ArrowLeft size={16} />
            {lang === 'es' ? 'Juegos' : 'Games'}
          </Link>

          {/* Hero */}
          <div
            className="relative mb-8"
            style={{ backgroundColor: '#1e2749', borderRadius: '20px' }}
          >
            <div className="flex flex-col md:flex-row">
              <div className="flex-1 p-6 md:p-10">
                <p
                  style={{
                    fontSize: '11px', fontWeight: 600, letterSpacing: '0.15em',
                    textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginBottom: 8,
                  }}
                >
                  {lang === 'es' ? 'JUEGO DE PRACTICA' : 'PRACTICE GAME'}
                </p>
                <h1
                  className="font-bold mb-3"
                  style={{
                    fontFamily: "'Source Serif 4', Georgia, serif",
                    fontSize: 'clamp(26px, 3.5vw, 34px)', color: 'white', lineHeight: '1.2',
                  }}
                >
                  {gameConfig.title[lang]}
                </h1>
                <p className="mb-5" style={{ fontSize: '15px', color: 'rgba(255,255,255,0.65)', lineHeight: '1.6' }}>
                  {gameConfig.description[lang]}
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.8)' }}>
                    <Timer size={12} />
                    {gameConfig.time}
                  </div>
                  <div className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.8)' }}>
                    <Gamepad2 size={12} />
                    {gameConfig.rounds[lang]}
                  </div>
                  <div className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.8)' }}>
                    <FormatIcon size={12} />
                    {formatLabel}
                  </div>
                </div>
              </div>

              {/* Play button column */}
              <div className="md:w-[280px] flex-shrink-0 p-6 md:p-8 flex flex-col justify-center gap-3">
                {hasAccess ? (
                  <button
                    onClick={() => setIsPlaying(true)}
                    className="flex items-center justify-center gap-2 py-4 px-4 font-bold text-lg rounded-xl transition-all hover:scale-105 active:scale-95"
                    style={{ backgroundColor: gameConfig.color, color: 'white' }}
                  >
                    <Play size={22} />
                    {lang === 'es' ? 'Jugar Ahora' : 'Play Now'}
                  </button>
                ) : (
                  <Link
                    href="/hub/membership"
                    className="flex items-center justify-center gap-2 py-4 px-4 font-bold text-lg rounded-xl transition-all hover:scale-105 active:scale-95 bg-gray-200 text-gray-600"
                  >
                    <Lock size={18} />
                    {lang === 'es' ? 'Actualizar para Jugar' : 'Upgrade to Play'}
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Two-column layout */}
        <div className="max-w-[1100px] mx-auto px-4 md:px-8 pb-12">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left column */}
            <div className="w-full lg:w-[62%]">
              {/* How to Play */}
              <div className="bg-white p-6 md:p-8 mb-6" style={{ border: '0.5px solid rgba(0,0,0,0.06)', borderRadius: '16px' }}>
                <h3 className="font-semibold mb-4" style={{ fontSize: '16px', color: '#1e2749' }}>
                  {lang === 'es' ? 'Como Jugar' : 'How to Play'}
                </h3>
                <div className="space-y-3">
                  {gameConfig.howToPlay.map((step, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ backgroundColor: `${gameConfig.color}15`, color: gameConfig.color, fontSize: 12, fontWeight: 700 }}
                      >
                        {i + 1}
                      </div>
                      <p className="text-sm" style={{ color: '#374151', lineHeight: 1.6 }}>{step[lang]}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* What You Need */}
              <div className="bg-white p-6 md:p-8 mb-6" style={{ border: '0.5px solid rgba(0,0,0,0.06)', borderRadius: '16px' }}>
                <h3 className="font-semibold mb-3" style={{ fontSize: '16px', color: '#1e2749' }}>
                  {lang === 'es' ? 'Lo Que Necesitas' : 'What You Need'}
                </h3>
                <ul className="space-y-2">
                  {gameConfig.whatYouNeed.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm" style={{ color: '#374151' }}>
                      <span style={{ color: gameConfig.color }}>--</span>
                      {item[lang]}
                    </li>
                  ))}
                </ul>
                <div className="mt-4 px-4 py-3 rounded-xl" style={{ backgroundColor: '#FFF8E7' }}>
                  <p className="text-sm" style={{ color: '#92400E' }}>
                    <strong>{lang === 'es' ? 'Ideal para:' : 'Best for:'}</strong> {gameConfig.bestFor[lang]}
                  </p>
                </div>
              </div>

              {/* Community: Conversation + Q&A */}
              <CommunityTabs
                contentId={gameConfig.contentUuid}
                userId={user?.id}
                isAdmin={!!user?.email?.toLowerCase().endsWith('@teachersdeserveit.com')}
                conversationApiPath={`/api/hub/quick-wins/${gameConfig.contentUuid}/conversation`}
                qaApiPath={`/api/hub/quick-wins/${gameConfig.contentUuid}/qa`}
              />
            </div>

            {/* Right column */}
            <div className="w-full lg:w-[38%]">
              <div className="lg:sticky lg:top-24 space-y-6">
                {/* Play card */}
                <div className="bg-white p-6" style={{ border: '0.5px solid rgba(0,0,0,0.06)', borderRadius: '16px' }}>
                  {hasAccess ? (
                  <button
                    onClick={() => setIsPlaying(true)}
                    className="flex items-center justify-center gap-2 w-full py-3 text-sm font-bold rounded-xl transition-all hover:scale-105 active:scale-95"
                    style={{ backgroundColor: gameConfig.color, color: 'white' }}
                  >
                    <Play size={18} />
                    {lang === 'es' ? 'Jugar Ahora' : 'Play Now'}
                  </button>
                  ) : (
                  <Link
                    href="/hub/membership"
                    className="flex items-center justify-center gap-2 w-full py-3 text-sm font-bold rounded-xl transition-all hover:scale-105 active:scale-95 bg-gray-200 text-gray-600"
                  >
                    <Lock size={18} />
                    {lang === 'es' ? 'Actualizar para Jugar' : 'Upgrade to Play'}
                  </Link>
                  )}
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2 text-xs" style={{ color: '#9CA3AF' }}>
                      <Timer size={14} /> {gameConfig.time} {lang === 'es' ? 'para jugar' : 'to play'}
                    </div>
                    <div className="flex items-center gap-2 text-xs" style={{ color: '#9CA3AF' }}>
                      <Gamepad2 size={14} /> {gameConfig.rounds[lang]}
                    </div>
                    <div className="flex items-center gap-2 text-xs" style={{ color: '#9CA3AF' }}>
                      <FormatIcon size={14} /> {formatLabel}
                    </div>
                  </div>
                </div>

                {/* Testimonials */}
                <div className="bg-white rounded-2xl p-5" style={{ border: '0.5px solid rgba(0,0,0,0.06)' }}>
                  <p
                    className="mb-3"
                    style={{ color: '#9CA3AF', fontFamily: "'DM Sans', sans-serif", letterSpacing: '0.05em', textTransform: 'uppercase' as const, fontSize: '11px', fontWeight: 600 }}
                  >
                    {lang === 'es' ? 'Lo que dicen los educadores' : 'What educators are saying'}
                  </p>
                  <div className="space-y-4">
                    {getGameTestimonials(slug).map((testimonial, i) => (
                      <div key={i} className="pl-3" style={{ borderLeft: `3px solid ${gameConfig.color}` }}>
                        <p className="text-sm mb-1" style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontStyle: 'italic', color: '#374151', lineHeight: 1.5 }}>
                          &ldquo;{testimonial.quote}&rdquo;
                        </p>
                        <p className="text-xs" style={{ color: '#9CA3AF' }}>
                          {testimonial.role}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const [quickWin, setQuickWin] = useState<QuickWin | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showCapacityFeedback, setShowCapacityFeedback] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const { tUI } = useTranslation();

  // For "do" type - action step checkboxes
  const [checkedSteps, setCheckedSteps] = useState<Set<number>>(new Set());

  // For "reflect" type - journal entry
  const [reflection, setReflection] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [reflectionSaved, setReflectionSaved] = useState(false);

  // Sidebar state
  const [isSaved, setIsSaved] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [recommendations, setRecommendations] = useState<QuickWin[]>([]);
  const [moreQuickWins, setMoreQuickWins] = useState<QuickWin[]>([]);


  // ─── Data Loading ─────────────────────────────────────────────────────────

  // Fetch quick win data
  useEffect(() => {
    async function loadQuickWin() {
      const supabase = getSupabase();
      setIsLoading(true);

      try {
        const { data, error } = await supabase
          .from('hub_quick_wins')
          .select('*')
          .eq('slug', slug)
          .eq('is_published', true)
          .single();

        if (error || !data) {
          console.error('Error fetching quick win:', error);
          router.push('/hub/quick-wins');
          return;
        }

        // Map hub_quick_wins fields to QuickWin interface
        const quickWinData: QuickWin = {
          id: data.id,
          slug: data.slug,
          title: data.title,
          description: data.description || '',
          content: data.content || null,
          category: data.category || 'Classroom Tools',
          estimated_minutes: data.duration_minutes || 5,
          content_type: data.quick_win_type || 'activity',
          video_url: null,
          download_url: data.file_url || null,
          capacity: data.lift === 'LOW' ? 'low' : data.lift === 'MED' ? 'medium' : data.lift === 'HIGH' ? 'high' : null,
          title_es: data.title_es || null,
          description_es: data.description_es || null,
          content_es: data.content_es || null,
          access_tier: data.access_tier || 'all_access',
          is_free_rotating: data.is_free_rotating || false,
        };

        setQuickWin(quickWinData);
        setStartTime(new Date());
      } catch (error) {
        console.error('Error loading quick win:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadQuickWin();
  }, [slug, router]);

  // Auto-translate quick win when Spanish is selected and content is missing
  useEffect(() => {
    if (language !== 'es' || !quickWin) return;
    if (quickWin.content_es && quickWin.title_es) return; // Already translated

    fetch('/api/hub/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contentType: 'quick_win',
        contentId: quickWin.id,
        lang: 'es',
      }),
    }).then(res => {
      if (res.ok) return res.json();
    }).then(data => {
      if (data) {
        // Update local state with translated content
        setQuickWin(prev => prev ? {
          ...prev,
          title_es: data.title_es || prev.title_es,
          description_es: data.description_es || prev.description_es,
          content_es: data.content_es || prev.content_es,
        } : prev);
      }
    }).catch(() => {});
  }, [language, quickWin?.id]);

  // Log view on mount after data loads
  useEffect(() => {
    if (!quickWin || !user) return;
    const supabase = getSupabase();
    supabase.from('hub_activity_log').insert({
      user_id: user.id,
      action: 'quick_win_viewed',
      metadata: {
        quick_win_id: quickWin.id,
        quick_win_title: quickWin.title,
        viewed_at: new Date().toISOString(),
      },
    }).then(() => {});
  }, [quickWin?.id, user?.id]);

  // Load recommendations (same category) and more quick wins
  useEffect(() => {
    if (!quickWin) return;
    const supabase = getSupabase();

    // Fetch same-category recommendations
    supabase
      .from('hub_quick_wins')
      .select('*')
      .eq('is_published', true)
      .eq('category', quickWin.category || '')
      .neq('id', quickWin.id)
      .limit(3)
      .then(({ data }) => {
        const mapped = (data || []).map((d: Record<string, unknown>) => ({
          id: d.id as string,
          slug: d.slug as string,
          title: d.title as string,
          description: (d.description as string) || null,
          content: (d.content as string) || null,
          category: (d.category as string) || 'Classroom Tools',
          estimated_minutes: (d.duration_minutes as number) || 5,
          content_type: (d.quick_win_type as string) || 'activity',
          video_url: null,
          download_url: (d.file_url as string) || null,
        }));

        if (mapped.length < 3) {
          // Fill remaining slots from other categories
          supabase
            .from('hub_quick_wins')
            .select('*')
            .eq('is_published', true)
            .neq('id', quickWin.id)
            .neq('category', quickWin.category || '')
            .limit(3 - mapped.length)
            .then(({ data: extraData }) => {
              const extra = (extraData || []).map((d: Record<string, unknown>) => ({
                id: d.id as string,
                slug: d.slug as string,
                title: d.title as string,
                description: (d.description as string) || null,
                content: (d.content as string) || null,
                category: (d.category as string) || 'Classroom Tools',
                estimated_minutes: (d.duration_minutes as number) || 5,
                content_type: (d.quick_win_type as string) || 'activity',
                video_url: null,
                download_url: (d.file_url as string) || null,
              }));
              setRecommendations([...mapped, ...extra]);
            });
        } else {
          setRecommendations(mapped);
        }
      });

    // Fetch 6 random quick wins for bottom section
    supabase
      .from('hub_quick_wins')
      .select('*')
      .eq('is_published', true)
      .neq('id', quickWin.id)
      .limit(6)
      .then(({ data }) => {
        setMoreQuickWins(
          (data || []).map((d: Record<string, unknown>) => ({
            id: d.id as string,
            slug: d.slug as string,
            title: d.title as string,
            description: (d.description as string) || null,
            content: (d.content as string) || null,
            category: (d.category as string) || 'Classroom Tools',
            estimated_minutes: (d.duration_minutes as number) || 5,
            content_type: (d.quick_win_type as string) || 'activity',
            video_url: null,
            download_url: (d.file_url as string) || null,
          }))
        );
      });
  }, [quickWin?.id]);


  // ─── Handlers ─────────────────────────────────────────────────────────────

  const handleSaveToLibrary = async () => {
    if (!quickWin || !user) return;
    const supabase = getSupabase();
    await supabase.from('hub_activity_log').insert({
      user_id: user.id,
      action: 'quick_win_saved',
      metadata: {
        quick_win_id: quickWin.id,
        quick_win_title: quickWin.title,
        saved_at: new Date().toISOString(),
      },
    });
    setIsSaved(true);
  };

  const handleShareLink = () => {
    setShowShareModal(true);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      // Fallback for older browsers or insecure contexts
      try {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2000);
      } catch {
        // Silent fail
      }
    }
  };

  // Rotating share messages
  const getShareMessages = () => {
    if (!quickWin) return { short: '', medium: '' };
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const title = quickWin.title;
    const shorts = [
      `Just found "${title}" and honestly my lesson plans just wrote themselves`,
      `Ok but "${title}" is the tool I didnt know I needed until 10 minutes ago`,
      `Teacher friends. "${title}". You are welcome.`,
      `Consider my evening FREE. Just grabbed "${title}" and my planning is done`,
      `"${title}" just saved me an hour. Feet up, PJs on.`,
      `Forwarding this before I even finish reading it because its that good: "${title}"`,
      `The group chat needs to know about "${title}" immediately`,
      `POV: you find "${title}" and suddenly teaching feels possible again`,
      `Not gatekeeping "${title}". Everyone in the lounge is getting this link.`,
      `Grabbed "${title}" during lunch. Used it by 5th period. Thats the vibe.`,
    ];
    const mediums = [
      `Just found "${title}" on Teachers Deserve It and I am not keeping this to myself. 5 minutes, zero prep, actually useful. My Sunday scaries just evaporated. ${url}`,
      `OK so "${title}" just cut my planning time in half and I am telling everyone. PJs on, feet up, grading can wait. You need this. ${url}`,
      `"${title}" is the kind of thing you find and immediately text your teacher bestie about. So here I am, texting you. Grab it before you forget. ${url}`,
      `Found "${title}" on Teachers Deserve It and honestly I wish someone had sent me this my first year. Sharing it forward. ${url}`,
      `Not being dramatic but "${title}" just changed my whole Monday. Its free, its fast, and its actually practical. Unlike most PD. ${url}`,
      `Sending this to every educator I know. "${title}" is a 5-minute download that actually respects your time. Revolutionary concept. ${url}`,
      `My co-teacher just asked why I was smiling at my phone. Its because I found "${title}" and my week just got 10x easier. Sharing the joy. ${url}`,
      `"${title}" from Teachers Deserve It. Downloaded it, used it, loved it, sharing it. In that order. ${url}`,
    ];
    // Rotate based on a hash of the title so each tool gets different messages
    const hash = title.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    return { short: shorts[hash % shorts.length], medium: mediums[hash % mediums.length] };
  };

  const handleMarkDone = async () => {
    if (!quickWin || !user) return;

    const supabase = getSupabase();
    const endTime = new Date();
    const minutesTaken = startTime
      ? Math.round((endTime.getTime() - startTime.getTime()) / 60000)
      : quickWin.estimated_minutes;

    // Log completion to activity log
    await supabase.from('hub_activity_log').insert({
      user_id: user.id,
      action: 'quick_win_completed',
      metadata: {
        quick_win_id: quickWin.id,
        quick_win_title: quickWin.title,
        minutes_taken: minutesTaken,
        content_type: quickWin.content_type,
        completed_at: endTime.toISOString(),
      },
    });

    setIsCompleted(true);

    if (quickWin.capacity && user && shouldShowCapacityFeedback('quick_win', quickWin.id)) {
      setShowCapacityFeedback(true);
    }
  };

  const handleSaveReflection = async () => {
    if (!quickWin || !user || !reflection.trim()) return;

    setIsSaving(true);
    const supabase = getSupabase();

    await supabase.from('hub_activity_log').insert({
      user_id: user.id,
      action: 'quick_win_reflection',
      metadata: {
        quick_win_id: quickWin.id,
        quick_win_title: quickWin.title,
        reflection: reflection.trim(),
        saved_at: new Date().toISOString(),
      },
    });

    setReflectionSaved(true);
    setIsSaving(false);
  };

  const toggleStep = (index: number) => {
    const newChecked = new Set(checkedSteps);
    if (newChecked.has(index)) {
      newChecked.delete(index);
    } else {
      newChecked.add(index);
    }
    setCheckedSteps(newChecked);
  };


  // Parse action steps from content (for "do" type)
  const parseActionSteps = (content: string | null): string[] => {
    if (!content) return [];
    const lines = content.split('\n').filter((line) => line.trim());
    return lines.map((line) => line.replace(/^[\d\.\-\*\•]\s*/, '').trim()).filter(Boolean);
  };

  // ─── Derived values ───────────────────────────────────────────────────────

  const categoryColor = quickWin ? CATEGORY_COLORS[quickWin.category || ''] || '#ffba06' : '#ffba06';

  // ─── Loading state ────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="min-h-screen p-4 md:p-8" style={{ backgroundColor: '#F5F7FA' }}>
        <div className="max-w-[600px] mx-auto">
          <div className="h-4 bg-gray-200 rounded w-32 mb-8 animate-pulse" />
          <div className="h-6 bg-gray-100 rounded w-24 mb-4 animate-pulse" />
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4 animate-pulse" />
          <div className="h-20 bg-gray-100 rounded mb-6 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!quickWin) {
    return (
      <div className="min-h-screen p-4 md:p-8" style={{ backgroundColor: '#F5F7FA' }}>
        <div className="max-w-[600px] mx-auto text-center py-16">
          <p className="text-gray-500">{tUI('Quick Win not found.')}</p>
          <Link href="/hub/quick-wins" className="text-[#ffba06] hover:underline mt-4 inline-block">
            {tUI('Browse Quick Wins')}
          </Link>
        </div>
      </div>
    );
  }

  // ─── Tier Access Check ────────────────────────────────────────────────────
  const canAccessQuickWin = canAccessGame({
    access_tier: quickWin.access_tier || 'all_access',
    is_free_rotating: quickWin.is_free_rotating,
  });

  if (!canAccessQuickWin) {
    const title = lang === 'es' ? (quickWin.title_es || quickWin.title) : quickWin.title;
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#F5F7FA', fontFamily: "'DM Sans', sans-serif" }}>
        <div className="max-w-[600px] mx-auto px-4 md:px-8 pt-10 pb-16 text-center">
          <Link
            href="/hub/quick-wins"
            className="inline-flex items-center gap-2 text-sm mb-8 transition-colors"
            style={{ color: '#6B7280' }}
          >
            <ArrowLeft size={16} />
            {lang === 'es' ? 'Herramientas' : 'Quick Wins'}
          </Link>
          <div className="bg-white p-8 md:p-12" style={{ borderRadius: '16px', border: '0.5px solid rgba(0,0,0,0.06)' }}>
            <Lock size={48} className="mx-auto mb-4 text-gray-300" />
            <h2 className="text-xl font-bold mb-2" style={{ color: '#1e2749' }}>{title}</h2>
            <p className="text-sm mb-6" style={{ color: '#6B7280' }}>
              {lang === 'es'
                ? 'Este recurso requiere una membresia superior. Actualiza tu plan para acceder a esta herramienta y muchas mas.'
                : 'This resource is available on a higher plan. Upgrade to unlock this tool and many more.'}
            </p>
            <a
              href="/hub/membership"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 py-3 px-8 font-bold rounded-xl transition-all hover:scale-105 active:scale-95"
              style={{ backgroundColor: '#ffba06', color: '#1e2749' }}
            >
              {lang === 'es' ? 'Ver Planes' : 'View Plans'}
            </a>
          </div>
        </div>
      </div>
    );
  }

  const actionSteps = quickWin.content_type === 'activity' ? parseActionSteps(quickWin.content) : [];
  const allStepsChecked = actionSteps.length > 0 && checkedSteps.size === actionSteps.length;

  const liftLabel = quickWin.capacity === 'low' ? tUI('Low Lift') : quickWin.capacity === 'medium' ? tUI('Medium Lift') : quickWin.capacity === 'high' ? tUI('High Lift') : null;
  const liftColor = quickWin.capacity === 'low' ? '#6BA368' : quickWin.capacity === 'medium' ? '#ffba06' : quickWin.capacity === 'high' ? '#E8927C' : '#9CA3AF';


  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F7FA', fontFamily: "'DM Sans', sans-serif" }}>
      {/* ─── HERO HEADER ───────────────────────────────────────────────── */}
      <div className="max-w-[1100px] mx-auto px-4 md:px-8 pt-6 md:pt-10">
        {/* Back link */}
        <Link
          href="/hub/quick-wins"
          className="inline-flex items-center gap-2 text-sm mb-6 transition-colors"
          style={{ color: '#6B7280' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#1e2749')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#6B7280')}
        >
          <ArrowLeft size={16} />
          {tUI('Back to Quick Wins')}
        </Link>

        <div
          className="relative mb-8"
          style={{
            backgroundColor: '#1e2749',
            borderRadius: '20px',
          }}
        >
          <div className="flex flex-col md:flex-row">
            {/* Left: content */}
            <div className="flex-1 p-6 md:p-10">
              {/* Top row: branding + effort level badge */}
              <div className="flex items-center gap-3 mb-3">
                <p
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase' as const,
                    color: 'rgba(255,255,255,0.5)',
                  }}
                >
                  {tUI('TEACHERS DESERVE IT')}
                </p>
                {liftLabel && (
                  <div className="inline-flex items-center gap-1.5">
                    <div
                      className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full"
                      style={{ background: `${liftColor}30`, color: liftColor }}
                    >
                      <Zap size={10} />
                      {liftLabel}
                    </div>
                    <span className="relative group" style={{ display: 'inline-flex' }}>
                      <Info size={13} style={{ color: 'rgba(255,255,255,0.4)', cursor: 'help' }} />
                      <span className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-72 p-3 rounded-lg text-left pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50"
                        style={{ background: '#1B2A4A', color: 'white', fontSize: 12, fontWeight: 400, lineHeight: 1.5, boxShadow: '0 4px 12px rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <strong style={{ display: 'block', marginBottom: 6, fontSize: 13 }}>Lift = how action-ready a resource is.</strong>
                        <span style={{ display: 'block', marginBottom: 4 }}><strong>Low lift</strong> -- Grab and go. Open it, use it, done.</span>
                        <span style={{ display: 'block', marginBottom: 4 }}><strong>Medium lift</strong> -- A planning period. A few moments to think, then implement.</span>
                        <span style={{ display: 'block' }}><strong>High lift</strong> -- Grab a coffee. Deeper reflection and planning, then action.</span>
                      </span>
                    </span>
                  </div>
                )}
              </div>

              {/* Category */}
              {quickWin.category && (
                <p
                  className="mb-1"
                  style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#ffba06',
                    letterSpacing: '0.03em',
                  }}
                >
                  {quickWin.category}
                </p>
              )}

              {/* Title */}
              <h1
                className="font-bold mb-3"
                style={{
                  fontFamily: "'Source Serif 4', Georgia, serif",
                  fontSize: 'clamp(26px, 3.5vw, 34px)',
                  color: 'white',
                  lineHeight: '1.2',
                }}
              >
                {t(quickWin.title, quickWin.title_es)}
              </h1>

              {/* Description */}
              {quickWin.description && (
                <p
                  className="mb-4"
                  style={{
                    fontSize: '15px',
                    color: 'rgba(255,255,255,0.65)',
                    lineHeight: '1.6',
                  }}
                >
                  {t(quickWin.description, quickWin.description_es)}
                </p>
              )}

              {/* Meta row */}
              <div className="flex flex-wrap items-center gap-3">
                <div
                  className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full"
                  style={{ background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.8)' }}
                >
                  <Clock size={12} />
                  {quickWin.estimated_minutes} {tUI('min')}
                </div>
                <div
                  className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full"
                  style={{ background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.8)' }}
                >
                  <BookOpen size={12} />
                  {tUI('PDF Download')}
                </div>
                <div className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>
                  {tUI('by Teachers Deserve It')}
                </div>
              </div>
            </div>

            {/* Right: action card inside hero */}
            <div className="md:w-[280px] flex-shrink-0 p-6 md:p-8 flex flex-col justify-center gap-3">
              {/* Download button */}
              {quickWin.download_url ? (
                <a
                  href={quickWin.download_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-3 px-4 font-semibold text-sm rounded-xl transition-opacity hover:opacity-90"
                  style={{ backgroundColor: '#ffba06', color: '#1e2749' }}
                >
                  <Download size={16} />
                  {tUI('Download Tool')}
                </a>
              ) : (
                <div
                  className="flex items-center justify-center gap-2 py-3 px-4 text-sm rounded-xl"
                  style={{ backgroundColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.35)' }}
                >
                  <Download size={16} />
                  {tUI('Download coming soon')}
                </div>
              )}
              {/* Save */}
              <button
                onClick={handleSaveToLibrary}
                className="flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-medium rounded-xl transition-colors"
                style={{
                  backgroundColor: isSaved ? 'rgba(255,255,255,0.15)' : 'transparent',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: isSaved ? '#ffba06' : 'rgba(255,255,255,0.8)',
                }}
              >
                <Bookmark size={14} fill={isSaved ? '#ffba06' : 'none'} />
                {isSaved ? tUI('Saved') : tUI('Save to Library')}
              </button>
              {/* Share */}
              <button
                onClick={handleShareLink}
                className="flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-medium rounded-xl transition-colors"
                style={{
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: linkCopied ? '#ffba06' : 'rgba(255,255,255,0.8)',
                }}
              >
                <Share2 size={14} />
                {linkCopied ? tUI('Copied!') : tUI('Share')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── TWO-COLUMN LAYOUT ─────────────────────────────────────────── */}
      <div className="max-w-[1100px] mx-auto px-4 md:px-8 pb-6 md:pb-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* ─── LEFT COLUMN ─────────────────────────────────────────── */}
          <div className="w-full lg:w-[62%]">

            {/* ─── MAIN CONTENT CARD ──────────────────────────────────── */}
            <div
              className="bg-white p-6 md:p-8 mb-6"
              style={{ border: '0.5px solid rgba(0,0,0,0.06)', borderRadius: '16px' }}
            >
              {/* Breathing Visual */}
              {/* Breathing exercise removed - all quick wins are PDF downloads */}

              {/* Download button (for download type) */}
              {quickWin.content_type === 'download' && (
                <div className="mb-6">
                  {quickWin.download_url ? (
                    <a
                      href={quickWin.download_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-3 w-full py-4 font-semibold text-lg transition-opacity hover:opacity-90"
                      style={{ backgroundColor: '#ffba06', color: '#1e2749', borderRadius: '12px' }}
                    >
                      <Download size={22} />
                      {tUI('Download Resource')}
                    </a>
                  ) : (
                    <div
                      className="flex items-center justify-center gap-3 w-full py-4 font-semibold text-lg"
                      style={{ backgroundColor: '#E5E7EB', color: '#9CA3AF', borderRadius: '12px', cursor: 'not-allowed' }}
                    >
                      <Download size={22} />
                      {tUI('Download coming soon')}
                    </div>
                  )}
                </div>
              )}

              {/* Read type */}
              {(quickWin.content_type === 'read' || (!quickWin.video_url && !quickWin.download_url && actionSteps.length === 0 && quickWin.content_type !== 'reflection')) && (
                <div>
                  {quickWin.content && (
                    <div
                      className="prose prose-gray max-w-none"
                      style={{ fontSize: '15px', color: '#374151', lineHeight: '1.7' }}
                      dangerouslySetInnerHTML={{ __html: t(quickWin.content, quickWin.content_es) || '' }}
                    />
                  )}
                </div>
              )}

              {/* Video type */}
              {quickWin.content_type === 'video' && (
                <div>
                  <div
                    className="w-full aspect-video mb-6 flex flex-col items-center justify-center"
                    style={{ backgroundColor: '#E5E7EB', borderRadius: '12px' }}
                  >
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                      style={{ backgroundColor: 'rgba(27, 42, 74, 0.1)' }}
                    >
                      <Play size={32} style={{ color: '#1e2749', marginLeft: '4px' }} />
                    </div>
                    <p style={{ color: '#6B7280' }}>{tUI('Video player coming soon')}</p>
                  </div>
                  {quickWin.content && (
                    <div>
                      <h3 className="font-semibold mb-3" style={{ fontSize: '16px', color: '#1e2749' }}>
                        {tUI('Key Takeaways')}
                      </h3>
                      <div
                        className="prose prose-gray max-w-none"
                        style={{ fontSize: '15px', color: '#374151', lineHeight: '1.7' }}
                        dangerouslySetInnerHTML={{ __html: quickWin.content }}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Activity type */}
              {quickWin.content_type === 'activity' && actionSteps.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-4" style={{ fontSize: '16px', color: '#1e2749' }}>
                    {tUI('Complete these steps:')}
                  </h3>
                  <div className="space-y-3">
                    {actionSteps.map((step, index) => (
                      <label
                        key={index}
                        className="flex items-start gap-3 p-4 border cursor-pointer transition-all min-h-[56px]"
                        style={{
                          borderColor: checkedSteps.has(index) ? '#10B981' : '#E5E5E5',
                          backgroundColor: checkedSteps.has(index) ? '#D1FAE5' : 'white',
                          borderRadius: '12px',
                        }}
                      >
                        <div
                          className="w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all"
                          style={{
                            borderColor: checkedSteps.has(index) ? '#10B981' : '#D1D5DB',
                            backgroundColor: checkedSteps.has(index) ? '#10B981' : 'white',
                          }}
                        >
                          {checkedSteps.has(index) && <Check size={14} className="text-white" />}
                        </div>
                        <input
                          type="checkbox"
                          checked={checkedSteps.has(index)}
                          onChange={() => toggleStep(index)}
                          className="sr-only"
                        />
                        <span
                          className="flex-1 text-sm"
                          style={{
                            color: checkedSteps.has(index) ? '#065F46' : '#374151',
                            textDecoration: checkedSteps.has(index) ? 'line-through' : 'none',
                          }}
                        >
                          <span className="font-medium mr-2" style={{ color: '#9CA3AF' }}>{index + 1}.</span>
                          {step}
                        </span>
                      </label>
                    ))}
                  </div>
                  {allStepsChecked && (
                    <div className="mt-6 p-4 text-center" style={{ backgroundColor: '#D1FAE5', borderRadius: '12px' }}>
                      <CheckCircle size={24} className="text-green-600 mx-auto mb-2" />
                      <p className="font-medium text-green-700">{tUI("All steps completed! You're doing great.")}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Download content description */}
              {quickWin.content_type === 'download' && quickWin.content && (
                <div
                  className="prose prose-gray max-w-none"
                  style={{ fontSize: '15px', color: '#374151', lineHeight: '1.7' }}
                  dangerouslySetInnerHTML={{ __html: quickWin.content }}
                />
              )}

              {/* Reflection type */}
              {quickWin.content_type === 'reflection' && (
                <div>
                  <div className="p-4 mb-4" style={{ backgroundColor: '#FFF8E7', borderRadius: '12px' }}>
                    <p
                      className="font-medium"
                      style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '18px', color: '#1e2749' }}
                    >
                      {quickWin.content || tUI('What is on your mind today?')}
                    </p>
                  </div>
                  <textarea
                    value={reflection}
                    onChange={(e) => setReflection(e.target.value)}
                    placeholder={tUI('Write your thoughts here...')}
                    className="w-full p-4 border resize-none focus:outline-none focus:border-[#ffba06]"
                    style={{ minHeight: '200px', borderColor: '#E5E5E5', fontSize: '15px', borderRadius: '8px' }}
                  />
                  <p className="text-xs mt-2 mb-4 flex items-center gap-1" style={{ color: '#9CA3AF' }}>
                    {tUI('This is private. Just for you.')}
                  </p>
                  {reflectionSaved ? (
                    <div className="p-4 text-center" style={{ backgroundColor: '#D1FAE5', borderRadius: '12px' }}>
                      <CheckCircle size={24} className="text-green-600 mx-auto mb-2" />
                      <p className="font-medium text-green-700">{tUI('Reflection saved!')}</p>
                    </div>
                  ) : (
                    <button
                      onClick={handleSaveReflection}
                      disabled={!reflection.trim() || isSaving}
                      className="w-full py-3 font-medium transition-colors disabled:opacity-50"
                      style={{
                        backgroundColor: reflection.trim() ? '#ffba06' : '#E5E5E5',
                        color: reflection.trim() ? '#1e2749' : '#9CA3AF',
                        borderRadius: '12px',
                      }}
                    >
                      {isSaving ? tUI('Saving...') : tUI('Save Reflection')}
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* How to use this section (for non-download types with content) */}
            {quickWin.content_type !== 'download' && quickWin.content_type !== 'read' && quickWin.content_type !== 'reflection' && quickWin.content && (
              <div
                className="bg-white p-6 md:p-8 mb-6"
                style={{ border: '0.5px solid rgba(0,0,0,0.06)', borderRadius: '16px' }}
              >
                <h3 className="font-semibold mb-3" style={{ fontSize: '16px', color: '#1e2749' }}>
                  {tUI('How to use this')}
                </h3>
                <div
                  className="prose prose-gray max-w-none"
                  style={{ fontSize: '15px', color: '#374151', lineHeight: '1.7' }}
                  dangerouslySetInnerHTML={{ __html: quickWin.content }}
                />
              </div>
            )}

            {/* ─── COMMUNITY ───────────────────────────────────────── */}
            <CommunityTabs
              contentId={quickWin.id}
              userId={user?.id}
              isAdmin={!!user?.email?.toLowerCase().endsWith('@teachersdeserveit.com')}
              conversationApiPath={`/api/hub/quick-wins/${quickWin.id}/conversation`}
              qaApiPath={`/api/hub/quick-wins/${quickWin.id}/qa`}
            />

            {/* Community nudge after marking as done */}
            {isCompleted && (
              <div className="mt-4">
                <CommunityNudge contentSlug={quickWin.slug} contentType="quick_win" />
              </div>
            )}

            {/* AI Growth Insights */}
            <div className="mt-8">
              <AchievementInsights
                data={{
                  name: user?.user_metadata?.display_name || 'Educator',
                  role: 'Educator',
                  toolsExplored: 0,
                  hoursSaved: '0',
                  daysActive: 0,
                  recognitionsEarned: 0,
                  earnedNames: [],
                  topCategories: [quickWin.category || ''],
                  communityPosts: 0,
                  coursesCompleted: 0,
                  pdHours: 0,
                }}
              />
            </div>
          </div>

          {/* ─── RIGHT COLUMN SIDEBAR ────────────────────────────────── */}
          <div className="w-full lg:w-[38%]">
            <div className="lg:sticky lg:top-24 space-y-6">
              {/* Action card */}
              <div
                className="bg-white p-6"
                style={{ border: '0.5px solid rgba(0,0,0,0.06)', borderRadius: '16px' }}
              >
                <div className="space-y-3">
                  {/* Download Resource (if download type) */}
                  {quickWin.content_type === 'download' && quickWin.download_url && (
                    <a
                      href={quickWin.download_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-3 text-sm font-semibold transition-opacity hover:opacity-90"
                      style={{ backgroundColor: '#ffba06', color: '#1e2749', borderRadius: '12px' }}
                    >
                      <Download size={18} />
                      {tUI('Download Resource')}
                    </a>
                  )}

                  {/* Save to My Library */}
                  <button
                    onClick={handleSaveToLibrary}
                    disabled={isSaved}
                    className="flex items-center justify-center gap-2 w-full py-3 text-sm font-semibold border-2 transition-all"
                    style={{
                      borderColor: isSaved ? '#10B981' : '#1e2749',
                      color: isSaved ? '#10B981' : '#1e2749',
                      background: isSaved ? '#D1FAE5' : 'transparent',
                      borderRadius: '12px',
                    }}
                  >
                    {isSaved ? <CheckCircle size={18} /> : <Bookmark size={18} />}
                    {isSaved ? tUI('Saved to Library') : tUI('Save to My Library')}
                  </button>

                  {/* Share button */}
                  <button
                    onClick={handleShareLink}
                    className="flex items-center justify-center gap-2 w-full py-3 text-sm font-medium border transition-colors"
                    style={{ borderColor: '#E5E7EB', color: '#6B7280', borderRadius: '12px', background: 'transparent' }}
                  >
                    <Share2 size={16} />
                    {linkCopied ? tUI('Copied!') : tUI('Share this Quick Win')}
                  </button>
                </div>
              </div>

              {/* Testimonials */}
              {quickWin && (
                <div
                  className="bg-white rounded-2xl p-5 mb-4"
                  style={{ border: '0.5px solid rgba(0,0,0,0.06)' }}
                >
                  <p
                    className="mb-3"
                    style={{ color: '#9CA3AF', fontFamily: "'DM Sans', sans-serif", letterSpacing: '0.05em', textTransform: 'uppercase' as const, fontSize: '11px', fontWeight: 600 }}
                  >
                    {tUI('What educators are saying')}
                  </p>
                  <div className="space-y-4">
                    {getTestimonials(quickWin.id).map((t, i) => (
                      <div
                        key={i}
                        className="pl-3"
                        style={{ borderLeft: '3px solid #ffba06' }}
                      >
                        <p
                          className="text-sm mb-1"
                          style={{
                            fontFamily: "'Source Serif 4', Georgia, serif",
                            fontStyle: 'italic',
                            color: '#374151',
                            lineHeight: '1.5',
                          }}
                        >
                          &ldquo;{t.quote}&rdquo;
                        </p>
                        <p
                          className="text-xs"
                          style={{ color: '#9CA3AF' }}
                        >
                          -- {t.role}, {t.time}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* You might also like */}
              {recommendations.length > 0 && (
                <div
                  className="bg-white p-6"
                  style={{ border: '0.5px solid rgba(0,0,0,0.06)', borderRadius: '16px' }}
                >
                  <h3 className="font-semibold mb-1" style={{ fontSize: '15px', color: '#1e2749' }}>
                    {tUI('You might also like')}
                  </h3>
                  <p className="text-xs mb-4" style={{ color: '#9CA3AF' }}>
                    {tUI("Based on this tool's category")}
                  </p>
                  <div className="space-y-3">
                    {recommendations.map((rec) => {
                      const recColor = CATEGORY_COLORS[rec.category || ''] || '#ffba06';
                      return (
                        <Link
                          key={rec.id}
                          href={`/hub/quick-wins/${rec.slug}`}
                          className="flex items-start gap-3 p-3 transition-colors group"
                          style={{ borderRadius: '12px', border: '0.5px solid rgba(0,0,0,0.06)' }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F9FAFB')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                          {/* Thumbnail placeholder */}
                          <div
                            className="w-12 h-12 rounded-lg flex-shrink-0 flex items-center justify-center"
                            style={{ backgroundColor: `${recColor}18` }}
                          >
                            <Zap size={18} style={{ color: recColor }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium leading-tight mb-1" style={{ color: '#1e2749' }}>
                              {rec.title}
                            </p>
                            <div className="flex items-center gap-2">
                              <span
                                className="text-xs px-2 py-0.5 rounded-full"
                                style={{ background: `${recColor}18`, color: recColor, fontSize: '10px' }}
                              >
                                {rec.category}
                              </span>
                              <span className="text-xs flex items-center gap-1" style={{ color: '#ffba06' }}>
                                {tUI('Try it')} <ExternalLink size={10} />
                              </span>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ─── BOTTOM: EXPLORE MORE ──────────────────────────────────── */}
        {moreQuickWins.length > 0 && (
          <div className="mt-12 mb-8">
            <h2 className="font-bold mb-1" style={{ fontSize: '22px', color: '#1e2749', fontFamily: "'Source Serif 4', Georgia, serif" }}>
              {tUI('Explore more Quick Wins')}
            </h2>
            <p className="text-sm mb-6" style={{ color: '#9CA3AF' }}>
              {tUI('Browse the full library of tools for your classroom')}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {moreQuickWins.map((qw) => {
                const qwColor = CATEGORY_COLORS[qw.category || ''] || '#ffba06';
                return (
                  <Link
                    key={qw.id}
                    href={`/hub/quick-wins/${qw.slug}`}
                    className="flex flex-row overflow-hidden bg-white transition-shadow hover:shadow-md"
                    style={{ border: '0.5px solid rgba(0,0,0,0.06)', borderRadius: '12px' }}
                  >
                    {/* Left: colored block */}
                    <div
                      className="w-[80px] flex-shrink-0"
                      style={{ backgroundColor: `${qwColor}25` }}
                    />
                    {/* Right: details */}
                    <div className="p-3 flex-1 flex flex-col justify-center min-w-0">
                      <span
                        className="text-[10px] font-bold px-1.5 py-0.5 rounded self-start mb-1"
                        style={{ backgroundColor: `${qwColor}18`, color: qwColor, textTransform: 'uppercase' as const, letterSpacing: '0.04em' }}
                      >
                        {qw.category}
                      </span>
                      <p className="text-sm font-semibold mb-1 leading-snug" style={{ color: '#1e2749' }}>
                        {qw.title}
                      </p>
                      <span className="text-xs" style={{ color: '#9CA3AF' }}>
                        {qw.estimated_minutes} {tUI('min')} · {tUI('Download')}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
            <div className="text-center mt-6">
              <Link
                href="/hub/quick-wins"
                className="text-sm font-medium px-6 py-2.5 rounded-lg inline-block transition-colors hover:opacity-90"
                style={{ backgroundColor: '#1e2749', color: 'white' }}
              >
                {tUI('View all Quick Wins')}
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* ─── SHARE MODAL ─────────────────────────────────────────────── */}
      {showShareModal && quickWin && (() => {
        const msgs = getShareMessages();
        const url = typeof window !== 'undefined' ? window.location.href : '';
        const encodedMsg = encodeURIComponent(msgs.medium);
        const encodedUrl = encodeURIComponent(url);
        const encodedShort = encodeURIComponent(msgs.short);

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowShareModal(false)} />
            <div
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {/* Header */}
              <div className="p-5 pb-3" style={{ background: '#1e2749' }}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base font-bold text-white">{tUI('Share this tool')}</h3>
                  <button
                    onClick={() => setShowShareModal(false)}
                    className="text-white/60 hover:text-white text-lg leading-none"
                  >
                    x
                  </button>
                </div>
                <p className="text-sm text-white/60">{tUI('Help another educator find something great')}</p>
              </div>

              {/* Pre-written message */}
              <div className="p-5">
                <div
                  className="p-4 rounded-xl mb-4 text-sm leading-relaxed"
                  style={{ backgroundColor: '#FAFAF5', color: '#374151', border: '1px solid #E5E7EB' }}
                >
                  {msgs.medium}
                </div>

                <button
                  onClick={() => copyToClipboard(msgs.medium)}
                  className="w-full py-2.5 rounded-lg text-sm font-medium mb-4 transition-colors"
                  style={{
                    backgroundColor: linkCopied ? '#D1FAE5' : '#F3F4F6',
                    color: linkCopied ? '#065F46' : '#374151',
                  }}
                >
                  {linkCopied ? tUI('Copied to clipboard!') : tUI('Copy message + link')}
                </button>

                {/* Email options */}
                <p className="text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: '#9CA3AF' }}>
                  {tUI('Email it')}
                </p>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <a
                    href={`mailto:?subject=${encodeURIComponent(msgs.short)}&body=${encodedMsg}`}
                    className="flex flex-col items-center gap-1 py-2.5 px-2 rounded-lg text-xs font-medium transition-colors hover:bg-gray-50"
                    style={{ border: '1px solid #E5E7EB', color: '#374151' }}
                  >
                    <span style={{ fontSize: '18px' }}>@</span>
                    {tUI('Default')}
                  </a>
                  <a
                    href={`https://mail.google.com/mail/?view=cm&su=${encodeURIComponent(msgs.short)}&body=${encodedMsg}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-1 py-2.5 px-2 rounded-lg text-xs font-medium transition-colors hover:bg-gray-50"
                    style={{ border: '1px solid #E5E7EB', color: '#374151' }}
                  >
                    <span style={{ fontSize: '18px', color: '#EA4335' }}>G</span>
                    {tUI('Gmail')}
                  </a>
                  <a
                    href={`https://outlook.live.com/mail/0/deeplink/compose?subject=${encodeURIComponent(msgs.short)}&body=${encodedMsg}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-1 py-2.5 px-2 rounded-lg text-xs font-medium transition-colors hover:bg-gray-50"
                    style={{ border: '1px solid #E5E7EB', color: '#374151' }}
                  >
                    <span style={{ fontSize: '18px', color: '#0078D4' }}>O</span>
                    {tUI('Outlook')}
                  </a>
                </div>

                {/* Social + messaging */}
                <p className="text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: '#9CA3AF' }}>
                  {tUI('Share it')}
                </p>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <a
                    href={`sms:?body=${encodedMsg}`}
                    className="flex flex-col items-center gap-1 py-2.5 px-2 rounded-lg text-xs font-medium transition-colors hover:bg-gray-50"
                    style={{ border: '1px solid #E5E7EB', color: '#374151' }}
                  >
                    <span style={{ fontSize: '18px', color: '#34C759' }}>+</span>
                    {tUI('Text')}
                  </a>
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedShort}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-1 py-2.5 px-2 rounded-lg text-xs font-medium transition-colors hover:bg-gray-50"
                    style={{ border: '1px solid #E5E7EB', color: '#374151' }}
                  >
                    <span style={{ fontSize: '18px', color: '#1877F2' }}>f</span>
                    {tUI('Facebook')}
                  </a>
                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodedShort}&url=${encodedUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-1 py-2.5 px-2 rounded-lg text-xs font-medium transition-colors hover:bg-gray-50"
                    style={{ border: '1px solid #E5E7EB', color: '#374151' }}
                  >
                    <span style={{ fontSize: '18px' }}>X</span>
                    {tUI('Twitter')}
                  </a>
                  <a
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-1 py-2.5 px-2 rounded-lg text-xs font-medium transition-colors hover:bg-gray-50"
                    style={{ border: '1px solid #E5E7EB', color: '#374151' }}
                  >
                    <span style={{ fontSize: '18px', color: '#0A66C2' }}>in</span>
                    {tUI('LinkedIn')}
                  </a>
                  <a
                    href={`https://wa.me/?text=${encodedMsg}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-1 py-2.5 px-2 rounded-lg text-xs font-medium transition-colors hover:bg-gray-50"
                    style={{ border: '1px solid #E5E7EB', color: '#374151' }}
                  >
                    <span style={{ fontSize: '18px', color: '#25D366' }}>W</span>
                    {tUI('WhatsApp')}
                  </a>
                  <button
                    onClick={() => copyToClipboard(url)}
                    className="flex flex-col items-center gap-1 py-2.5 px-2 rounded-lg text-xs font-medium transition-colors hover:bg-gray-50"
                    style={{ border: '1px solid #E5E7EB', color: '#374151' }}
                  >
                    <span style={{ fontSize: '18px' }}>~</span>
                    {tUI('Link')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
