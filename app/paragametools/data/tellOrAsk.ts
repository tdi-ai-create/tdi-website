// Tell or Ask statements - 22 total, shuffle and show 14

import type { Difficulty, GradeBand, EducatorRole } from './gameSettings';

export interface TellOrAskStatement {
  statement: { en: string; es: string };
  type: 'TELL' | 'ASK';
  why: { en: string; es: string };
  difficulty?: Difficulty;
  gradeBand?: GradeBand | GradeBand[];
  roles?: EducatorRole | EducatorRole[];
}

export const TELL_OR_ASK_STATEMENTS: TellOrAskStatement[] = [
  {
    statement: { en: "The answer is 7.", es: "La respuesta es 7." },
    type: "TELL",
    why: { en: "Gives the answer - no thinking required.", es: "Da la respuesta - no requiere pensar." },
    difficulty: "easy",
    gradeBand: "all",
  },
  {
    statement: { en: "You need to add a period here.", es: "Necesitas agregar un punto aquí." },
    type: "TELL",
    why: { en: "Tells them exactly what to do.", es: "Les dice exactamente qué hacer." },
    difficulty: "easy",
    gradeBand: ["k-2", "3-5"],
  },
  {
    statement: { en: "Sound it out.", es: "Deletréalo." },
    type: "TELL",
    why: { en: "Sounds like help, but it's a command. Try: 'What strategy could you use?'", es: "Suena como ayuda, pero es una orden. Intenta: '¿Qué estrategia podrías usar?'" },
    difficulty: "medium",
    gradeBand: ["k-2", "3-5"],
  },
  {
    statement: { en: "What do you notice about your answer?", es: "¿Qué notas sobre tu respuesta?" },
    type: "ASK",
    why: { en: "Opens thinking - student has to look and analyze.", es: "Abre el pensamiento - el estudiante tiene que mirar y analizar." },
    difficulty: "easy",
    gradeBand: "all",
  },
  {
    statement: { en: "Don't you think you should check your work?", es: "¿No crees que deberías revisar tu trabajo?" },
    type: "TELL",
    why: { en: "Disguised as a question, but it's a command with a question mark.", es: "Disfrazada de pregunta, pero es una orden con signo de interrogación." },
    difficulty: "hard",
    gradeBand: "all",
  },
  {
    statement: { en: "Where are you getting stuck?", es: "¿Dónde te estás atorando?" },
    type: "ASK",
    why: { en: "Reveals the student's thinking so you can help strategically.", es: "Revela el pensamiento del estudiante para que puedas ayudar estratégicamente." },
    difficulty: "easy",
    gradeBand: "all",
  },
  {
    statement: { en: "Write neater.", es: "Escribe más ordenado." },
    type: "TELL",
    why: { en: "Vague command. Try: 'Which letters could you form more clearly?'", es: "Orden vaga. Intenta: '¿Cuáles letras podrías formar más claramente?'" },
    difficulty: "easy",
    gradeBand: ["k-2", "3-5"],
  },
  {
    statement: { en: "How is this problem similar to the last one?", es: "¿En qué se parece este problema al anterior?" },
    type: "ASK",
    why: { en: "Builds connections between concepts.", es: "Construye conexiones entre conceptos." },
    difficulty: "medium",
    gradeBand: "all",
  },
  {
    statement: { en: "You forgot to carry the one.", es: "Olvidaste llevar el uno." },
    type: "TELL",
    why: { en: "Points out the error AND the fix. Student learns nothing.", es: "Señala el error Y la solución. El estudiante no aprende nada." },
    difficulty: "easy",
    gradeBand: ["k-2", "3-5"],
  },
  {
    statement: { en: "Can you show me what you've tried so far?", es: "¿Puedes mostrarme lo que has intentado hasta ahora?" },
    type: "ASK",
    why: { en: "Reveals their process without judgment.", es: "Revela su proceso sin juzgar." },
    difficulty: "easy",
    gradeBand: "all",
  },
  {
    statement: { en: "Read it again.", es: "Léelo de nuevo." },
    type: "TELL",
    why: { en: "A command. Try: 'What part is confusing you?'", es: "Una orden. Intenta: '¿Qué parte te confunde?'" },
    difficulty: "medium",
    gradeBand: "all",
  },
  {
    statement: { en: "Shouldn't you be showing your work?", es: "¿No deberías mostrar tu trabajo?" },
    type: "TELL",
    why: { en: "Another command disguised as a question.", es: "Otra orden disfrazada de pregunta." },
    difficulty: "hard",
    gradeBand: ["3-5", "6-8", "9-12"],
  },
  {
    statement: { en: "What would happen if you tried it a different way?", es: "¿Qué pasaría si lo intentaras de otra manera?" },
    type: "ASK",
    why: { en: "Encourages risk-taking and flexible thinking.", es: "Fomenta tomar riesgos y pensar de manera flexible." },
    difficulty: "medium",
    gradeBand: "all",
  },
  {
    statement: { en: "Use your finger to track the words.", es: "Usa tu dedo para seguir las palabras." },
    type: "TELL",
    why: { en: "Gives the strategy instead of letting them choose one.", es: "Da la estrategia en lugar de dejarlos elegir una." },
    difficulty: "medium",
    gradeBand: ["k-2"],
    roles: ["teacher", "para"],
  },
  {
    statement: { en: "What do you think the next step is?", es: "¿Cuál crees que es el siguiente paso?" },
    type: "ASK",
    why: { en: "Student has to plan ahead - real thinking!", es: "El estudiante tiene que planificar - ¡pensamiento real!" },
    difficulty: "easy",
    gradeBand: "all",
  },
  {
    statement: { en: "Can you please sit down and focus?", es: "¿Puedes sentarte y concentrarte, por favor?" },
    type: "TELL",
    why: { en: "Looks like a question but it's a directive.", es: "Parece una pregunta pero es una directiva." },
    difficulty: "hard",
    gradeBand: "all",
  },
  {
    statement: { en: "Walk me through your thinking.", es: "Explícame tu razonamiento." },
    type: "ASK",
    why: { en: "The gold standard - makes thinking visible.", es: "El estándar de oro - hace visible el pensamiento." },
    difficulty: "medium",
    gradeBand: "all",
  },
  {
    statement: { en: "You're not following directions.", es: "No estás siguiendo las instrucciones." },
    type: "TELL",
    why: { en: "Labels the problem without helping. Try: 'What step are you on?'", es: "Etiqueta el problema sin ayudar. Intenta: '¿En qué paso estás?'" },
    difficulty: "easy",
    gradeBand: "all",
  },
  {
    statement: { en: "Didn't we just go over this?", es: "¿No acabamos de ver esto?" },
    type: "TELL",
    why: { en: "Guilt trip disguised as a question. Try: 'What do you remember about this?'", es: "Culpa disfrazada de pregunta. Intenta: '¿Qué recuerdas sobre esto?'" },
    difficulty: "expert",
    gradeBand: "all",
  },
  {
    statement: { en: "What strategy did you use to get that answer?", es: "¿Qué estrategia usaste para obtener esa respuesta?" },
    type: "ASK",
    why: { en: "Makes thinking visible - works whether the answer is right OR wrong.", es: "Hace visible el pensamiento - funciona si la respuesta es correcta O incorrecta." },
    difficulty: "medium",
    gradeBand: "all",
  },
  {
    statement: { en: "Just try your best.", es: "Solo haz tu mejor esfuerzo." },
    type: "TELL",
    why: { en: "Well-meaning but gives zero direction. Try: 'What's one part you could start with?'", es: "Bien intencionado pero no da dirección. Intenta: '¿Con qué parte podrías empezar?'" },
    difficulty: "hard",
    gradeBand: "all",
  },
  {
    statement: { en: "Tell me about what you're working on right now.", es: "Cuéntame qué estás trabajando ahora mismo." },
    type: "ASK",
    why: { en: "Despite using the word 'tell,' this invites the student to explain and think.", es: "A pesar de usar la palabra 'cuenta,' esto invita al estudiante a explicar y pensar." },
    difficulty: "expert",
    gradeBand: "all",
  },
  { statement: { en: "What did you do differently this time?", es: "Que hiciste diferente esta vez?" }, type: "ASK", why: { en: "Builds metacognition -- student has to compare their current approach to a previous one.", es: "Construye metacognicion -- el estudiante tiene que comparar su enfoque actual con uno anterior." }, difficulty: "medium", gradeBand: "all" },
  { statement: { en: "You should have started with the directions.", es: "Deberias haber empezado con las instrucciones." }, type: "TELL", why: { en: "Tells them what they should have done instead of helping them figure out what went wrong.", es: "Les dice lo que deberian haber hecho en lugar de ayudarles a descubrir que salio mal." }, difficulty: "easy", gradeBand: "all" },
  { statement: { en: "Why do you think the author chose that word?", es: "Por que crees que el autor eligio esa palabra?" }, type: "ASK", why: { en: "Pushes into analysis and inference -- no single right answer.", es: "Lleva al analisis y la inferencia -- no hay una sola respuesta correcta." }, difficulty: "medium", gradeBand: ["3-5", "6-8", "9-12"] },
  { statement: { en: "Do you want me to help you or not?", es: "Quieres que te ayude o no?" }, type: "TELL", why: { en: "Frustration disguised as a question. Shuts down the student rather than opening thinking.", es: "Frustracion disfrazada de pregunta. Cierra al estudiante en lugar de abrir el pensamiento." }, difficulty: "hard", gradeBand: "all" },
  { statement: { en: "If you were teaching this to a friend, where would you start?", es: "Si le estuvieras ensenando esto a un amigo, por donde empezarias?" }, type: "ASK", why: { en: "Forces the student to organize their understanding -- teaching is the deepest form of learning.", es: "Obliga al estudiante a organizar su comprension -- ensenar es la forma mas profunda de aprender." }, difficulty: "hard", gradeBand: ["3-5", "6-8", "9-12"] },
  { statement: { en: "Look at number 3 again.", es: "Mira el numero 3 otra vez." }, type: "TELL", why: { en: "Tells them WHERE to look but not WHAT to look for. Try: 'What do you notice about number 3?'", es: "Les dice DONDE mirar pero no QUE buscar. Intenta: 'Que notas sobre el numero 3?'" }, difficulty: "medium", gradeBand: "all" },
  { statement: { en: "Could you help your table partner with that?", es: "Podrias ayudar a tu companero de mesa con eso?" }, type: "TELL", why: { en: "Looks collaborative but it is a directive. The student has no real choice here.", es: "Parece colaborativo pero es una directiva. El estudiante no tiene opcion real." }, difficulty: "expert", gradeBand: "all", roles: ["teacher", "para"] },
  { statement: { en: "What part of this feels the hardest?", es: "Que parte de esto se siente mas dificil?" }, type: "ASK", why: { en: "Validates the struggle and pinpoints the exact barrier. Student feels heard and you get diagnostic information.", es: "Valida la dificultad y localiza la barrera exacta. El estudiante se siente escuchado y tu obtienes informacion diagnostica." }, difficulty: "easy", gradeBand: "all" },
  { statement: { en: "Stop erasing and just go with it.", es: "Deja de borrar y solo hazlo." }, type: "TELL", why: { en: "Dismisses their perfectionism without understanding it. Try: 'What are you trying to change?'", es: "Desestima su perfeccionismo sin entenderlo. Intenta: 'Que estas tratando de cambiar?'" }, difficulty: "easy", gradeBand: ["k-2", "3-5"] },
  { statement: { en: "Is there another way you could represent that?", es: "Hay otra forma en que podrias representar eso?" }, type: "ASK", why: { en: "Opens creative problem-solving. Student has to think beyond their first approach.", es: "Abre la resolucion creativa de problemas. El estudiante tiene que pensar mas alla de su primer enfoque." }, difficulty: "medium", gradeBand: "all" },
  { statement: { en: "I already explained this. Were you listening?", es: "Ya explique esto. Estabas escuchando?" }, type: "TELL", why: { en: "Blame and shame disguised as a question. The student shuts down. Try: 'What do you remember from when we talked about this?'", es: "Culpa y verguenza disfrazadas de pregunta. El estudiante se cierra. Intenta: 'Que recuerdas de cuando hablamos de esto?'" }, difficulty: "hard", gradeBand: "all" },
  { statement: { en: "What would you do differently if you started over?", es: "Que harias diferente si empezaras de nuevo?" }, type: "ASK", why: { en: "Builds reflection without requiring them to actually start over. Powerful for growth mindset.", es: "Construye reflexion sin requerir que realmente empiecen de nuevo. Poderoso para mentalidad de crecimiento." }, difficulty: "medium", gradeBand: ["3-5", "6-8", "9-12"] },
  { statement: { en: "Let me show you a trick for this.", es: "Dejame mostrarte un truco para esto." }, type: "TELL", why: { en: "Well-intentioned but steals the discovery. The trick becomes something memorized, not understood.", es: "Bien intencionado pero roba el descubrimiento. El truco se vuelve algo memorizado, no entendido." }, difficulty: "hard", gradeBand: "all", roles: ["teacher", "para"] },
  { statement: { en: "What evidence from the text supports your answer?", es: "Que evidencia del texto apoya tu respuesta?" }, type: "ASK", why: { en: "Requires the student to ground their thinking in proof. Moves from opinion to analysis.", es: "Requiere que el estudiante fundamente su pensamiento en pruebas. Pasa de opinion a analisis." }, difficulty: "medium", gradeBand: ["3-5", "6-8", "9-12"] },
  { statement: { en: "You are so smart!", es: "Eres tan inteligente!" }, type: "TELL", why: { en: "Fixed mindset praise. Labels the person, not the effort. Try: 'The strategy you used to solve that was really effective.'", es: "Elogio de mentalidad fija. Etiqueta a la persona, no al esfuerzo. Intenta: 'La estrategia que usaste para resolver eso fue muy efectiva.'" }, difficulty: "expert", gradeBand: "all" },
];

export const TELL_OR_ASK_ROUNDS = 14;
