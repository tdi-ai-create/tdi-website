// Feedback Level Up data - 12 total, all shown (shuffled)

import type { Difficulty, GradeBand, EducatorRole } from './gameSettings';

export interface FeedbackLevel {
  feedback: { en: string; es: string };
  level: 1 | 2 | 3 | 4;
  why: { en: string; es: string };
  difficulty?: Difficulty;
  gradeBand?: GradeBand | GradeBand[];
  roles?: EducatorRole | EducatorRole[];
}

export const FEEDBACK_LEVELS: FeedbackLevel[] = [
  {
    feedback: { en: "Good job!", es: "¡Buen trabajo!" },
    level: 1,
    why: { en: "No specifics. What did they do well? They have no idea.", es: "Sin detalles. ¿Qué hicieron bien? No tienen idea." },
    difficulty: "easy",
    gradeBand: "all",
  },
  {
    feedback: { en: "Your handwriting is really improving. Keep it up!", es: "Tu letra está mejorando mucho. ¡Sigue así!" },
    level: 2,
    why: { en: "Mentions the skill but no specific example or next step.", es: "Menciona la habilidad pero sin ejemplo específico ni siguiente paso." },
    difficulty: "medium",
    gradeBand: ["k-2", "3-5"],
  },
  {
    feedback: { en: "I see you used a capital letter at the start of each sentence. That's correct capitalization. Now check your proper nouns too.", es: "Veo que usaste mayúscula al inicio de cada oración. Eso es uso correcto de mayúsculas. Ahora revisa también tus nombres propios." },
    level: 3,
    why: { en: "Notice + Name + Next Step. All 3 parts!", es: "Observar + Nombrar + Siguiente Paso. ¡Las 3 partes!" },
    difficulty: "medium",
    gradeBand: ["k-2", "3-5"],
  },
  {
    feedback: { en: "Try again.", es: "Inténtalo de nuevo." },
    level: 1,
    why: { en: "Try WHAT again? HOW? Student is lost.", es: "¿Intentar QUÉ de nuevo? ¿CÓMO? El estudiante está perdido." },
    difficulty: "easy",
    gradeBand: "all",
  },
  {
    feedback: { en: "Nice details in your writing!", es: "¡Lindos detalles en tu escritura!" },
    level: 2,
    why: { en: "Which details? What makes them nice? Vague praise.", es: "¿Cuáles detalles? ¿Qué los hace lindos? Elogio vago." },
    difficulty: "hard",
    gradeBand: "all",
  },
  {
    feedback: { en: "I notice you broke this word problem into two steps. That's called decomposing. Can you explain why you split it there?", es: "Noto que dividiste este problema en dos pasos. Eso se llama descomponer. ¿Puedes explicar por qué lo dividiste ahí?" },
    level: 4,
    why: { en: "All 3 parts PLUS asks student to explain their reasoning.", es: "Las 3 partes MÁS pide al estudiante que explique su razonamiento." },
    difficulty: "expert",
    gradeBand: ["3-5", "6-8"],
  },
  {
    feedback: { en: "Almost there!", es: "¡Casi lo logras!" },
    level: 1,
    why: { en: "Almost WHERE? What's missing? No information.", es: "¿Casi DÓNDE? ¿Qué falta? Sin información." },
    difficulty: "easy",
    gradeBand: "all",
  },
  {
    feedback: { en: "I see you drew arrows connecting each step of the life cycle. That's showing sequence. Add labels to each arrow describing the change.", es: "Veo que dibujaste flechas conectando cada paso del ciclo de vida. Eso muestra secuencia. Agrega etiquetas a cada flecha describiendo el cambio." },
    level: 3,
    why: { en: "Specific notice + names the skill + clear next step.", es: "Observación específica + nombra la habilidad + siguiente paso claro." },
    difficulty: "medium",
    gradeBand: ["3-5", "6-8"],
  },
  {
    feedback: { en: "Good thinking on that math problem.", es: "Buen razonamiento en ese problema de matemáticas." },
    level: 2,
    why: { en: "What thinking specifically? Student can't repeat what they don't know they did.", es: "¿Qué razonamiento específicamente? El estudiante no puede repetir lo que no sabe que hizo." },
    difficulty: "hard",
    gradeBand: "all",
  },
  {
    feedback: { en: "I notice you added three details about the setting. That's descriptive writing. Now try adding a detail about what the character hears.", es: "Noto que agregaste tres detalles sobre el escenario. Eso es escritura descriptiva. Ahora intenta agregar un detalle sobre lo que el personaje escucha." },
    level: 3,
    why: { en: "Specific + named + actionable. Student knows exactly what to do.", es: "Específico + nombrado + accionable. El estudiante sabe exactamente qué hacer." },
    difficulty: "hard",
    gradeBand: ["3-5", "6-8", "9-12"],
  },
  {
    feedback: { en: "This needs more work.", es: "Esto necesita más trabajo." },
    level: 1,
    why: { en: "More work on WHAT? This creates frustration, not learning.", es: "¿Más trabajo en QUÉ? Esto crea frustración, no aprendizaje." },
    difficulty: "easy",
    gradeBand: "all",
  },
  {
    feedback: { en: "I see you lined up the decimal points before adding. That's called decimal alignment. Now explain to your partner why that matters.", es: "Veo que alineaste los puntos decimales antes de sumar. Eso se llama alineación decimal. Ahora explica a tu compañero por qué eso importa." },
    level: 4,
    why: { en: "Notice + Name + Next Step + student teaches back.", es: "Observar + Nombrar + Siguiente Paso + el estudiante enseña." },
    difficulty: "expert",
    gradeBand: ["3-5", "6-8", "9-12"],
  },
  { feedback: { en: "You're getting there.", es: "Vas por buen camino." }, level: 1, why: { en: "Getting WHERE? What specifically is improving? Student has no idea what to keep doing.", es: "Hacia DONDE? Que esta mejorando especificamente? El estudiante no sabe que seguir haciendo." }, difficulty: "easy", gradeBand: "all" },
  { feedback: { en: "Great participation today!", es: "Gran participacion hoy!" }, level: 2, why: { en: "Names the behavior (participation) but not what made it great or what to do next.", es: "Nombra el comportamiento (participacion) pero no que lo hizo genial ni que hacer despues." }, difficulty: "medium", gradeBand: "all" },
  { feedback: { en: "I notice you used transition words between each paragraph. That's called cohesion. Now try varying which transitions you use so they don't repeat.", es: "Noto que usaste palabras de transicion entre cada parrafo. Eso se llama cohesion. Ahora intenta variar que transiciones usas para que no se repitan." }, level: 3, why: { en: "Specific observation + academic vocabulary + clear next step.", es: "Observacion especifica + vocabulario academico + siguiente paso claro." }, difficulty: "hard", gradeBand: ["6-8", "9-12"] },
  { feedback: { en: "Love it!", es: "Me encanta!" }, level: 1, why: { en: "Feels good but teaches nothing. The student cannot replicate whatever they did.", es: "Se siente bien pero no ensena nada. El estudiante no puede replicar lo que hizo." }, difficulty: "easy", gradeBand: "all" },
  { feedback: { en: "Your reading is getting more fluent.", es: "Tu lectura es cada vez mas fluida." }, level: 2, why: { en: "Names the skill (fluency) but gives no evidence of what improved or what to work on next.", es: "Nombra la habilidad (fluidez) pero no da evidencia de que mejoro ni que trabajar despues." }, difficulty: "medium", gradeBand: ["k-2", "3-5"] },
  { feedback: { en: "I notice you asked your partner a clarifying question before starting. That's called active listening. How did that change your approach to the problem?", es: "Noto que le hiciste a tu companero una pregunta aclaratoria antes de empezar. Eso se llama escucha activa. Como cambio eso tu enfoque del problema?" }, level: 4, why: { en: "Notice + Name + pushes student to reflect on the impact of their own strategy.", es: "Observar + Nombrar + lleva al estudiante a reflexionar sobre el impacto de su propia estrategia." }, difficulty: "expert", gradeBand: ["3-5", "6-8", "9-12"] },
  { feedback: { en: "You need to proofread more carefully.", es: "Necesitas revisar con mas cuidado." }, level: 1, why: { en: "Vague directive. What should they look for? Spelling? Grammar? Punctuation? Student is guessing.", es: "Directiva vaga. Que deben buscar? Ortografia? Gramatica? Puntuacion? El estudiante esta adivinando." }, difficulty: "medium", gradeBand: "all" },
  { feedback: { en: "I see you used three different colors to organize your notes by topic. That's a categorization strategy. Try adding a key at the top so anyone could follow your system.", es: "Veo que usaste tres colores diferentes para organizar tus notas por tema. Esa es una estrategia de categorizacion. Intenta agregar una clave arriba para que cualquiera pueda seguir tu sistema." }, level: 3, why: { en: "Notices the specific behavior, names the strategy, gives a concrete extension task.", es: "Nota el comportamiento especifico, nombra la estrategia, da una tarea de extension concreta." }, difficulty: "hard", gradeBand: ["3-5", "6-8"] },
  { feedback: { en: "That's not quite right but you're close.", es: "No esta del todo bien pero estas cerca." }, level: 1, why: { en: "What is not right? What IS close? Student is stuck between wrong and almost-right with no path forward.", es: "Que no esta bien? Que SI esta cerca? El estudiante esta atascado sin camino adelante." }, difficulty: "hard", gradeBand: "all" },
  { feedback: { en: "I notice you used a number line to solve this subtraction problem. That's called a visual model. Now try explaining to your partner why you started where you did on the number line.", es: "Noto que usaste una recta numerica para resolver este problema de resta. Eso se llama un modelo visual. Ahora intenta explicar a tu companero por que empezaste donde empezaste en la recta numerica." }, level: 4, why: { en: "All 3 parts plus metacognitive extension -- student explains their reasoning.", es: "Las 3 partes mas extension metacognitiva -- el estudiante explica su razonamiento." }, difficulty: "expert", gradeBand: ["k-2", "3-5"] },
];

export const LEVEL_INFO = {
  1: { name: { en: 'VAGUE', es: 'VAGO' }, color: '#E74C3C', star: false },
  2: { name: { en: 'PARTIAL', es: 'PARCIAL' }, color: '#F1C40F', star: false },
  3: { name: { en: 'COMPLETE', es: 'COMPLETO' }, color: '#27AE60', star: true },
  4: { name: { en: 'EXCEPTIONAL', es: 'EXCEPCIONAL' }, color: '#3498DB', star: false },
} as const;
