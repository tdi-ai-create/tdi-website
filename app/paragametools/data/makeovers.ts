// Feedback Makeover data - 6 total, all shown (shuffled)

export interface Makeover {
  bad: { en: string; es: string };
  context: { en: string; es: string };
  hint: { en: string; es: string };
}

export const FEEDBACK_MAKEOVERS: Makeover[] = [
  {
    bad: {
      en: "Good job!",
      es: "¡Buen trabajo!",
    },
    context: {
      en: "A student wrote a paragraph with 3 specific details about their character's appearance.",
      es: "Un estudiante escribió un párrafo con 3 detalles específicos sobre la apariencia de su personaje.",
    },
    hint: {
      en: "What did they do? (3 details) What's it called? (descriptive detail) What's next?",
      es: "¿Qué hicieron? (3 detalles) ¿Cómo se llama? (detalle descriptivo) ¿Qué sigue?",
    },
  },
  {
    bad: {
      en: "That's wrong.",
      es: "Eso está mal.",
    },
    context: {
      en: "A student solved 7 × 8 = 54. They used repeated addition but miscounted.",
      es: "Un estudiante resolvió 7 × 8 = 54. Usó suma repetida pero contó mal.",
    },
    hint: {
      en: "What DID they do right? (used a strategy) What happened? (miscount) What should they try?",
      es: "¿Qué SÍ hicieron bien? (usaron una estrategia) ¿Qué pasó? (error al contar) ¿Qué deberían intentar?",
    },
  },
  {
    bad: {
      en: "Try harder.",
      es: "Esfuérzate más.",
    },
    context: {
      en: "A student's handwriting is difficult to read. Some letters are sitting above the line.",
      es: "La letra de un estudiante es difícil de leer. Algunas letras están por encima de la línea.",
    },
    hint: {
      en: "Which letters are good? What's the issue? (letter placement) One specific fix?",
      es: "¿Cuáles letras están bien? ¿Cuál es el problema? (ubicación de letras) ¿Un arreglo específico?",
    },
  },
  {
    bad: {
      en: "Almost!",
      es: "¡Casi!",
    },
    context: {
      en: "A student correctly solved 4 out of 5 steps in a long division problem. They forgot to bring down the last digit.",
      es: "Un estudiante resolvió correctamente 4 de 5 pasos en un problema de división larga. Olvidó bajar el último dígito.",
    },
    hint: {
      en: "Name the 4 steps they got right. What's the skill? What's the specific next move?",
      es: "Nombra los 4 pasos que hicieron bien. ¿Cuál es la habilidad? ¿Cuál es el siguiente movimiento específico?",
    },
  },
  {
    bad: {
      en: "Fix this.",
      es: "Arregla esto.",
    },
    context: {
      en: "A student wrote a full paragraph but forgot to capitalize proper nouns (names of people and places).",
      es: "Un estudiante escribió un párrafo completo pero olvidó usar mayúsculas en nombres propios (nombres de personas y lugares).",
    },
    hint: {
      en: "What's working? (full paragraph!) What's the rule? Which words specifically?",
      es: "¿Qué está funcionando? (¡párrafo completo!) ¿Cuál es la regla? ¿Cuáles palabras específicamente?",
    },
  },
  {
    bad: {
      en: "Needs more work.",
      es: "Necesita más trabajo.",
    },
    context: {
      en: "A student drew a detailed diagram of the water cycle but didn't label any of the stages.",
      es: "Un estudiante dibujó un diagrama detallado del ciclo del agua pero no etiquetó ninguna de las etapas.",
    },
    hint: {
      en: "What's strong about the diagram? What's missing? (labels) Where to start?",
      es: "¿Qué tiene de bueno el diagrama? ¿Qué falta? (etiquetas) ¿Por dónde empezar?",
    },
  },
];

export const MAKEOVER_TIMER_SECONDS = 120;
