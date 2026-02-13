// Feedback Madlibs game data - TRUE BLIND MADLIBS VERSION

export interface MadlibScenario {
  id: number;
  text: { en: string; es: string };
  context: { en: string; es: string };
  realFeedback: {
    notice: { en: string; es: string };
    name: { en: string; es: string };
    nextStep: { en: string; es: string };
  };
}

// Scenarios for comparison (used in silly rounds to show "real" version)
export const MADLIBS_SCENARIOS: MadlibScenario[] = [
  {
    id: 1,
    text: {
      en: "Jayden created a self-portrait using macaroni, glitter, and what appears to be their entire collection of superhero stickers",
      es: "Jayden creó un autorretrato usando macarrones, brillantina y lo que parece ser toda su colección de calcomanías de superhéroes",
    },
    context: {
      en: "Mixed media art project with creative material choices",
      es: "Proyecto de arte mixto con elección creativa de materiales",
    },
    realFeedback: {
      notice: {
        en: "I see that you combined different materials to show your ideas",
        es: "Veo que combinaste diferentes materiales para mostrar tus ideas",
      },
      name: {
        en: "That's called mixed media art",
        es: "Eso se llama arte de medios mixtos",
      },
      nextStep: {
        en: "Now try organizing your materials by texture to create even more contrast",
        es: "Ahora intenta organizar tus materiales por textura para crear aún más contraste",
      },
    },
  },
  {
    id: 2,
    text: {
      en: "Sam read their story about a dog who becomes mayor with full character voices and interpretive hand gestures",
      es: "Sam leyó su historia sobre un perro que se convierte en alcalde con voces de personajes y gestos interpretativos",
    },
    context: {
      en: "Dramatic reading with vocal and physical expression",
      es: "Lectura dramática con expresión vocal y física",
    },
    realFeedback: {
      notice: {
        en: "I see that you used your voice and body to bring the story to life",
        es: "Veo que usaste tu voz y tu cuerpo para dar vida a la historia",
      },
      name: {
        en: "That's called dramatic interpretation",
        es: "Eso se llama interpretación dramática",
      },
      nextStep: {
        en: "Now try matching your gestures to the story's most important moments",
        es: "Ahora intenta hacer coincidir tus gestos con los momentos más importantes de la historia",
      },
    },
  },
  {
    id: 3,
    text: {
      en: "Maya figured out the word problem by acting it out with pencils as the main characters",
      es: "Maya resolvió el problema matemático actuándolo con lápices como los personajes principales",
    },
    context: {
      en: "Mathematical problem-solving through concrete modeling",
      es: "Resolución de problemas matemáticos mediante modelado concreto",
    },
    realFeedback: {
      notice: {
        en: "I see that you used objects to represent the problem",
        es: "Veo que usaste objetos para representar el problema",
      },
      name: {
        en: "That's called concrete modeling",
        es: "Eso se llama modelado concreto",
      },
      nextStep: {
        en: "Now try drawing your thinking to show each step of the process",
        es: "Ahora intenta dibujar tu pensamiento para mostrar cada paso del proceso",
      },
    },
  },
  {
    id: 4,
    text: {
      en: "Alex asked seven follow-up questions about the volcano experiment, including 'What would happen if we used hot sauce instead of baking soda?'",
      es: "Alex hizo siete preguntas de seguimiento sobre el experimento del volcán, incluyendo '¿Qué pasaría si usáramos salsa picante en lugar de bicarbonato?'",
    },
    context: {
      en: "Scientific curiosity with creative experimental thinking",
      es: "Curiosidad científica con pensamiento experimental creativo",
    },
    realFeedback: {
      notice: {
        en: "I see that you thought of ways to extend our experiment",
        es: "Veo que pensaste en formas de extender nuestro experimento",
      },
      name: {
        en: "That's called scientific inquiry",
        es: "Eso se llama indagación científica",
      },
      nextStep: {
        en: "Now try writing down your prediction before we test your hot sauce idea",
        es: "Ahora intenta escribir tu predicción antes de probar tu idea de la salsa picante",
      },
    },
  },
  {
    id: 5,
    text: {
      en: "River created a filing system for their pencils based on 'how tired they look' and 'which ones have attitude'",
      es: "River creó un sistema de archivo para sus lápices basado en 'qué tan cansados se ven' y 'cuáles tienen actitud'",
    },
    context: {
      en: "Personal organization system with creative categorization",
      es: "Sistema de organización personal con categorización creativa",
    },
    realFeedback: {
      notice: {
        en: "I see that you created categories that make sense to you",
        es: "Veo que creaste categorías que tienen sentido para ti",
      },
      name: {
        en: "That's called personal organization",
        es: "Eso se llama organización personal",
      },
      nextStep: {
        en: "Now try using that same system to organize your thoughts when you write",
        es: "Ahora intenta usar ese mismo sistema para organizar tus pensamientos cuando escribes",
      },
    },
  },
  {
    id: 6,
    text: {
      en: "Jordan figured out what would happen next in the story by looking at the pictures and connecting them to what the character wanted",
      es: "Jordan descubrió qué pasaría después en la historia mirando las imágenes y conectándolas con lo que el personaje quería",
    },
    context: {
      en: "Reading comprehension through visual clues and character motivation",
      es: "Comprensión lectora a través de pistas visuales y motivación del personaje",
    },
    realFeedback: {
      notice: {
        en: "I see that you used clues from the pictures and text",
        es: "Veo que usaste pistas de las imágenes y el texto",
      },
      name: {
        en: "That's called making predictions",
        es: "Eso se llama hacer predicciones",
      },
      nextStep: {
        en: "Now try explaining your thinking to see if other clues support your idea",
        es: "Ahora intenta explicar tu pensamiento para ver si otras pistas apoyan tu idea",
      },
    },
  },
];

// BLIND PROMPTS - Different for each silly round so it stays fresh
// These are shown WITHOUT any context about the sentence template
export interface BlindPromptSet {
  prompts: {
    id: string;
    label: { en: string; es: string };
    placeholder: { en: string; es: string };
  }[];
}

export const SILLY_ROUND_PROMPTS: BlindPromptSet[] = [
  // Round 1
  {
    prompts: [
      {
        id: "verb",
        label: {
          en: "A weird thing someone does with their body",
          es: "Algo raro que alguien hace con su cuerpo",
        },
        placeholder: {
          en: "wiggled your ears independently",
          es: "moviste tus orejas independientemente",
        },
      },
      {
        id: "skill",
        label: {
          en: "A subject nobody actually studies",
          es: "Una materia que nadie estudia realmente",
        },
        placeholder: {
          en: "advanced chicken psychology",
          es: "psicología avanzada de pollos",
        },
      },
      {
        id: "action",
        label: {
          en: "Something you'd never tell a student to try",
          es: "Algo que nunca le dirías a un estudiante que intente",
        },
        placeholder: {
          en: "licking the flagpole during winter",
          es: "lamer el poste de la bandera en invierno",
        },
      },
    ],
  },
  // Round 2
  {
    prompts: [
      {
        id: "verb",
        label: {
          en: "Something gross a kid might do in class",
          es: "Algo asqueroso que un niño podría hacer en clase",
        },
        placeholder: {
          en: "picked your nose with a crayon",
          es: "te picaste la nariz con un crayón",
        },
      },
      {
        id: "skill",
        label: {
          en: "A skill that would be useless in real life",
          es: "Una habilidad que sería inútil en la vida real",
        },
        placeholder: {
          en: "professional cloud yelling",
          es: "gritar a las nubes profesionalmente",
        },
      },
      {
        id: "action",
        label: {
          en: "An activity that would get you sent to the principal",
          es: "Una actividad que te mandaría a la dirección",
        },
        placeholder: {
          en: "teaching the class hamster to drive",
          es: "enseñar al hámster de la clase a manejar",
        },
      },
    ],
  },
  // Round 3
  {
    prompts: [
      {
        id: "verb",
        label: {
          en: "Something your pet does that students shouldn't",
          es: "Algo que hace tu mascota que los estudiantes no deberían",
        },
        placeholder: {
          en: "licked the whiteboard",
          es: "lamiste el pizarrón",
        },
      },
      {
        id: "skill",
        label: {
          en: "A made-up name for a school rule",
          es: "Un nombre inventado para una regla escolar",
        },
        placeholder: {
          en: "competitive eraser throwing",
          es: "lanzamiento competitivo de borradores",
        },
      },
      {
        id: "action",
        label: {
          en: "Something that sounds like homework but isn't",
          es: "Algo que suena como tarea pero no lo es",
        },
        placeholder: {
          en: "alphabetizing your snacks by crunchiness",
          es: "ordenar tus bocadillos alfabéticamente por crujido",
        },
      },
    ],
  },
];

// Total rounds: 6 (first 3 are silly madlibs, last 3 are real practice)
export const MADLIBS_TOTAL_ROUNDS = 6;
export const MADLIBS_SILLY_ROUNDS = 3;
