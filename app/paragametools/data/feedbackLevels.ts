// Feedback Level Up data - 12 total, all shown (shuffled)

export interface FeedbackLevel {
  feedback: { en: string; es: string };
  level: 1 | 2 | 3 | 4;
  why: { en: string; es: string };
}

export const FEEDBACK_LEVELS: FeedbackLevel[] = [
  {
    feedback: {
      en: "Good job!",
      es: "¡Buen trabajo!",
    },
    level: 1,
    why: {
      en: "No specifics. What did they do well? They have no idea.",
      es: "Sin detalles. ¿Qué hicieron bien? No tienen idea.",
    },
  },
  {
    feedback: {
      en: "Your handwriting is really improving. Keep it up!",
      es: "Tu letra está mejorando mucho. ¡Sigue así!",
    },
    level: 2,
    why: {
      en: "Mentions the skill but no specific example or next step.",
      es: "Menciona la habilidad pero sin ejemplo específico ni siguiente paso.",
    },
  },
  {
    feedback: {
      en: "I see you used a capital letter at the start of each sentence. That's correct capitalization. Now check your proper nouns too.",
      es: "Veo que usaste mayúscula al inicio de cada oración. Eso es uso correcto de mayúsculas. Ahora revisa también tus nombres propios.",
    },
    level: 3,
    why: {
      en: "Notice + Name + Next Step. All 3 parts!",
      es: "Observar + Nombrar + Siguiente Paso. ¡Las 3 partes!",
    },
  },
  {
    feedback: {
      en: "Try again.",
      es: "Inténtalo de nuevo.",
    },
    level: 1,
    why: {
      en: "Try WHAT again? HOW? Student is lost.",
      es: "¿Intentar QUÉ de nuevo? ¿CÓMO? El estudiante está perdido.",
    },
  },
  {
    feedback: {
      en: "Nice details in your writing!",
      es: "¡Lindos detalles en tu escritura!",
    },
    level: 2,
    why: {
      en: "Which details? What makes them nice? Vague praise.",
      es: "¿Cuáles detalles? ¿Qué los hace lindos? Elogio vago.",
    },
  },
  {
    feedback: {
      en: "I notice you broke this word problem into two steps. That's called decomposing. Can you explain why you split it there?",
      es: "Noto que dividiste este problema en dos pasos. Eso se llama descomponer. ¿Puedes explicar por qué lo dividiste ahí?",
    },
    level: 4,
    why: {
      en: "All 3 parts PLUS asks student to explain their reasoning.",
      es: "Las 3 partes MÁS pide al estudiante que explique su razonamiento.",
    },
  },
  {
    feedback: {
      en: "Almost there!",
      es: "¡Casi lo logras!",
    },
    level: 1,
    why: {
      en: "Almost WHERE? What's missing? No information.",
      es: "¿Casi DÓNDE? ¿Qué falta? Sin información.",
    },
  },
  {
    feedback: {
      en: "I see you drew arrows connecting each step of the life cycle. That's showing sequence. Add labels to each arrow describing the change.",
      es: "Veo que dibujaste flechas conectando cada paso del ciclo de vida. Eso muestra secuencia. Agrega etiquetas a cada flecha describiendo el cambio.",
    },
    level: 3,
    why: {
      en: "Specific notice + names the skill + clear next step.",
      es: "Observación específica + nombra la habilidad + siguiente paso claro.",
    },
  },
  {
    feedback: {
      en: "Good thinking on that math problem.",
      es: "Buen razonamiento en ese problema de matemáticas.",
    },
    level: 2,
    why: {
      en: "What thinking specifically? Student can't repeat what they don't know they did.",
      es: "¿Qué razonamiento específicamente? El estudiante no puede repetir lo que no sabe que hizo.",
    },
  },
  {
    feedback: {
      en: "I notice you added three details about the setting. That's descriptive writing. Now try adding a detail about what the character hears.",
      es: "Noto que agregaste tres detalles sobre el escenario. Eso es escritura descriptiva. Ahora intenta agregar un detalle sobre lo que el personaje escucha.",
    },
    level: 3,
    why: {
      en: "Specific + named + actionable. Student knows exactly what to do.",
      es: "Específico + nombrado + accionable. El estudiante sabe exactamente qué hacer.",
    },
  },
  {
    feedback: {
      en: "This needs more work.",
      es: "Esto necesita más trabajo.",
    },
    level: 1,
    why: {
      en: "More work on WHAT? This creates frustration, not learning.",
      es: "¿Más trabajo en QUÉ? Esto crea frustración, no aprendizaje.",
    },
  },
  {
    feedback: {
      en: "I see you lined up the decimal points before adding. That's called decimal alignment. Now explain to your partner why that matters.",
      es: "Veo que alineaste los puntos decimales antes de sumar. Eso se llama alineación decimal. Ahora explica a tu compañero por qué eso importa.",
    },
    level: 4,
    why: {
      en: "Notice + Name + Next Step + student teaches back.",
      es: "Observar + Nombrar + Siguiente Paso + el estudiante enseña.",
    },
  },
];

export const LEVEL_INFO = {
  1: { name: { en: 'VAGUE', es: 'VAGO' }, color: '#E74C3C', star: false },
  2: { name: { en: 'PARTIAL', es: 'PARCIAL' }, color: '#F1C40F', star: false },
  3: { name: { en: 'COMPLETE', es: 'COMPLETO' }, color: '#27AE60', star: true },
  4: { name: { en: 'EXCEPTIONAL', es: 'EXCEPCIONAL' }, color: '#3498DB', star: false },
} as const;
