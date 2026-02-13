// Question Knockout scenarios - 20 total, shuffle and show 10

export interface KnockoutScenario {
  en: string;
  es: string;
}

export const KNOCKOUT_SCENARIOS: KnockoutScenario[] = [
  {
    en: "Maria is staring at her blank paper during writing time. She hasn't written a word in 5 minutes.",
    es: "María está mirando su papel en blanco durante el tiempo de escritura. No ha escrito ni una palabra en 5 minutos.",
  },
  {
    en: "David just got 3 out of 10 on his math worksheet. He puts his head down on his desk.",
    es: "David acaba de sacar 3 de 10 en su hoja de matemáticas. Pone su cabeza sobre el escritorio.",
  },
  {
    en: "A student says 'I don't get it' for the third time today.",
    es: "Un estudiante dice 'No lo entiendo' por tercera vez hoy.",
  },
  {
    en: "You notice a student copied the answer directly from their neighbor's paper.",
    es: "Notas que un estudiante copió la respuesta directamente del papel de su compañero.",
  },
  {
    en: "A student raises their hand and asks 'Is this right?' - for the 6th time today.",
    es: "Un estudiante levanta la mano y pregunta '¿Está bien esto?' - por sexta vez hoy.",
  },
  {
    en: "A student rushes through their work and says 'I'm done!' but it's messy and half the answers are blank.",
    es: "Un estudiante hace su trabajo rápidamente y dice '¡Ya terminé!' pero está desordenado y la mitad de las respuestas están en blanco.",
  },
  {
    en: "A student is reading aloud and skips every word they don't know.",
    es: "Un estudiante está leyendo en voz alta y se salta cada palabra que no conoce.",
  },
  {
    en: "Two students are arguing about what the answer is. Both are getting frustrated.",
    es: "Dos estudiantes están discutiendo sobre cuál es la respuesta. Ambos se están frustrando.",
  },
  {
    en: "A student says 'This is stupid. Why do we even have to do this?'",
    es: "Un estudiante dice 'Esto es estúpido. ¿Por qué tenemos que hacer esto?'",
  },
  {
    en: "A student has been working for 10 minutes but is still on the first problem.",
    es: "Un estudiante ha estado trabajando 10 minutos pero todavía está en el primer problema.",
  },
  {
    en: "An EL student nods when you ask if they understand, but their work shows they don't.",
    es: "Un estudiante de inglés asiente cuando le preguntas si entiende, pero su trabajo muestra que no.",
  },
  {
    en: "A student erases their work for the fourth time and is starting to shut down.",
    es: "Un estudiante borra su trabajo por cuarta vez y está empezando a cerrarse.",
  },
  {
    en: "A student finishes early and starts distracting others at their table.",
    es: "Un estudiante termina temprano y empieza a distraer a otros en su mesa.",
  },
  {
    en: "A student writes one sentence for a paragraph assignment and says they're done.",
    es: "Un estudiante escribe una oración para una tarea de párrafo y dice que terminó.",
  },
  {
    en: "A student keeps asking you to check every single step before moving on.",
    es: "Un estudiante sigue pidiéndote que revises cada paso antes de continuar.",
  },
  {
    en: "A student opens their Chromebook, immediately goes to Cool Math Games, and says 'I'm researching.'",
    es: "Un estudiante abre su Chromebook, va inmediatamente a juegos y dice 'Estoy investigando.'",
  },
  {
    en: "A student writes their name in 6 different fonts instead of starting the assignment.",
    es: "Un estudiante escribe su nombre en 6 fuentes diferentes en lugar de empezar la tarea.",
  },
  {
    en: "A student says 'I'm so cooked' when they see the math worksheet and puts their head down.",
    es: "Un estudiante dice 'Estoy perdido' cuando ve la hoja de matemáticas y pone la cabeza sobre el escritorio.",
  },
  {
    en: "A student says 'bet' when you explain the directions, but they're clearly looking at the wrong page.",
    es: "Un estudiante dice 'ok' cuando explicas las instrucciones, pero claramente está mirando la página equivocada.",
  },
  {
    en: "A student raises their hand. You walk over. They say 'never mind, I forgot.'",
    es: "Un estudiante levanta la mano. Caminas hacia él. Dice 'no importa, lo olvidé.'",
  },
];

export const KNOCKOUT_TIMER_SECONDS = 90;
export const KNOCKOUT_ROUNDS = 10;
