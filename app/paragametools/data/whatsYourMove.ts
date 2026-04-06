// What's Your Move? — scenario data (EN/ES)

export interface Scenario {
  en: {
    scenario: string;
    choices: { text: string; correct: boolean }[];
    move: string;
    explanation: string;
  };
  es: {
    scenario: string;
    choices: { text: string; correct: boolean }[];
    move: string;
    explanation: string;
  };
}

export const SCENARIOS: Scenario[] = [
  // Scenario 1 — K, Move Don't Stay
  {
    en: {
      scenario:
        "You're in a kindergarten classroom during center time. You've been sitting at the Play-Doh table for 10 minutes helping two students. Across the room, a student at the writing center has been staring at a blank page the whole time. The teacher is reading with a small group.",
      choices: [
        { text: "Stay at the Play-Doh table — the writing center isn't your assigned station.", correct: false },
        { text: "Stand up, scan the room, and walk toward the writing center. Kneel down and ask: 'What are you thinking about writing today?'", correct: true },
        { text: "Call across the room: 'You need to start writing something!'", correct: false },
      ],
      move: 'Move, Don\u2019t Stay',
      explanation:
        "Your job isn't to stay at one station — it's to circulate and catch students who need a nudge. Walking to the writing center and asking a question (not giving a command) redirects without creating a scene. The student with the blank page needs you more than the students already engaged with Play-Doh.",
    },
    es: {
      scenario:
        'Estás en un salón de kindergarten durante el tiempo de centros. Has estado sentado/a en la mesa de Play-Doh durante 10 minutos ayudando a dos estudiantes. Al otro lado del salón, un estudiante en el centro de escritura ha estado mirando una página en blanco todo el tiempo. La maestra está leyendo con un grupo pequeño.',
      choices: [
        { text: 'Quédate en la mesa de Play-Doh — el centro de escritura no es tu estación asignada.', correct: false },
        { text: "Levántate, observa el salón, y camina hacia el centro de escritura. Arrodíllate y pregunta: '¿Qué estás pensando escribir hoy?'", correct: true },
        { text: '¡Llama desde lejos: \'¡Necesitas escribir algo!\'', correct: false },
      ],
      move: 'Muévete, No Te Quedes',
      explanation:
        'Tu trabajo no es quedarte en una estación — es circular y ayudar a los estudiantes que necesitan un empuje. Caminar hacia el centro de escritura y hacer una pregunta (no dar una orden) redirige sin crear un escándalo. El estudiante con la página en blanco te necesita más que los estudiantes que ya están ocupados con el Play-Doh.',
    },
  },

  // Scenario 2 — HS IEP, Step Back to Build Forward
  {
    en: {
      scenario:
        "You support a high school student with an IEP in an algebra class. You've been sitting next to him for the entire period, every day, for weeks. He's capable of the work, but he won't start a problem unless you're right there. Today he solved three problems independently while you were getting a pencil.",
      choices: [
        { text: "Stay next to him — his IEP says he gets support, and you don't want him to fall behind.", correct: false },
        { text: "Move to a desk across the room without saying anything so he doesn't get anxious.", correct: false },
        { text: "Say: 'You just solved three on your own. I'm going to sit a few seats away — if you get stuck, raise your hand and I'll come right over.'", correct: true },
      ],
      move: 'Step Back to Build Forward',
      explanation:
        "Supporting a student doesn't mean sitting next to them permanently — it means building their independence. Naming what he did well (three on his own), telling him your plan (a few seats away), and giving him a way to re-engage you (raise your hand) makes the fade feel safe, not sudden. An IEP supports independence goals, not dependency.",
    },
    es: {
      scenario:
        'Apoyas a un estudiante de preparatoria con un IEP en una clase de álgebra. Has estado sentado/a a su lado durante todo el período, todos los días, por semanas. Él es capaz de hacer el trabajo, pero no empieza un problema a menos que estés a su lado. Hoy resolvió tres problemas de manera independiente mientras ibas por un lápiz.',
      choices: [
        { text: 'Quédate a su lado — su IEP dice que recibe apoyo, y no quieres que se quede atrás.', correct: false },
        { text: 'Muévete a un escritorio al otro lado del salón sin decir nada para que no se ponga ansioso.', correct: false },
        { text: "Di: 'Acabas de resolver tres por tu cuenta. Voy a sentarme a unos escritorios de distancia — si te atascas, levanta la mano y vengo enseguida.'", correct: true },
      ],
      move: 'Da un Paso Atrás para Avanzar',
      explanation:
        'Apoyar a un estudiante no significa sentarse permanentemente a su lado — significa desarrollar su independencia. Nombrar lo que hizo bien (tres por su cuenta), decirle tu plan (a unos escritorios de distancia) y darle una manera de volver a conectar contigo (levantar la mano) hace que el alejamiento se sienta seguro, no repentino. Un IEP apoya metas de independencia, no dependencia.',
    },
  },

  // Scenario 3 — EBD self-contained, Redirect Without the Spotlight
  {
    en: {
      scenario:
        'You work in a self-contained classroom for students with emotional-behavioral disabilities. A student who has been calm all morning suddenly shoves his materials off his desk. Other students are watching. The lead teacher is across the room.',
      choices: [
        { text: 'Firmly say his name and tell him to pick up his materials.', correct: false },
        { text: "Walk calmly to his area, position yourself between him and the audience, and say quietly: 'I can see something\u2019s going on. Let\u2019s take a minute — just you and me.'", correct: true },
        { text: 'Ignore the behavior and wait for the lead teacher to handle it.', correct: false },
      ],
      move: 'Redirect Without the Spotlight',
      explanation:
        'When a student is escalating, an audience makes it worse. Positioning yourself between the student and the rest of the class removes the spotlight. Speaking quietly and acknowledging the emotion — without naming the behavior — de-escalates instead of adding fuel. Using his name publicly or demanding compliance can trigger a bigger episode.',
    },
    es: {
      scenario:
        'Trabajas en un salón autónomo para estudiantes con discapacidades emocionales y conductuales. Un estudiante que ha estado tranquilo toda la mañana de repente empuja sus materiales fuera de su escritorio. Otros estudiantes están mirando. La maestra principal está al otro lado del salón.',
      choices: [
        { text: 'Di su nombre firmemente y dile que recoja sus materiales.', correct: false },
        { text: "Camina tranquilamente hacia su área, colócate entre él y la audiencia, y di en voz baja: 'Veo que algo está pasando. Tomemos un momento — solo tú y yo.'", correct: true },
        { text: 'Ignora el comportamiento y espera a que la maestra principal lo maneje.', correct: false },
      ],
      move: 'Redirige Sin el Reflector',
      explanation:
        'Cuando un estudiante está escalando, una audiencia empeora las cosas. Colocarte entre el estudiante y el resto de la clase elimina el reflector. Hablar en voz baja y reconocer la emoción — sin nombrar el comportamiento — desescala en lugar de echar más leña al fuego. Usar su nombre públicamente o exigir cumplimiento puede desencadenar un episodio mayor.',
    },
  },

  // Scenario 4 — MS resource room, Step Back to Build Forward
  {
    en: {
      scenario:
        "You're in a middle school resource room working 1:1 with a student on reading comprehension. She's been getting answers right for the past five minutes but keeps looking at you for confirmation before circling each answer. She says 'Is this right?' after every question.",
      choices: [
        { text: 'Keep confirming each answer — she needs the confidence boost.', correct: false },
        { text: "Say: 'You\u2019ve gotten every single one right so far. Try the next three without checking with me — then we\u2019ll look at them together.'", correct: true },
        { text: "Say: 'You need to stop asking me and just trust yourself.'", correct: false },
      ],
      move: 'Step Back to Build Forward',
      explanation:
        "She's ready to fade — she's proving it by getting every answer right. Setting a specific target (try three) gives her a runway that feels manageable, not overwhelming. 'We\u2019ll look at them together' preserves the safety net without camping out. Telling her to stop asking dismisses her need for connection.",
    },
    es: {
      scenario:
        "Estás en un salón de recursos de escuela media trabajando 1:1 con una estudiante en comprensión de lectura. Ha estado respondiendo correctamente durante los últimos cinco minutos, pero sigue mirándote para confirmar antes de marcar cada respuesta. Dice '¿Está bien?' después de cada pregunta.",
      choices: [
        { text: 'Sigue confirmando cada respuesta — necesita el impulso de confianza.', correct: false },
        { text: "Di: 'Has respondido correctamente todas hasta ahora. Intenta las próximas tres sin consultarme — luego las revisamos juntos.'", correct: true },
        { text: "Di: 'Necesitas dejar de preguntarme y confiar en ti misma.'", correct: false },
      ],
      move: 'Da un Paso Atrás para Avanzar',
      explanation:
        'Está lista para el alejamiento — lo demuestra al responder correctamente. Establecer un objetivo específico (intenta tres) le da una pista que se siente manejable, no abrumadora. \u2018Las revisamos juntos\u2019 preserva la red de seguridad sin acampar a su lado. Decirle que deje de preguntar descarta su necesidad de conexión.',
    },
  },

  // Scenario 5 — 1st grade bilingual, Move Don't Stay + Redirect
  {
    en: {
      scenario:
        "You're in a first grade bilingual classroom. A student who recently arrived from Guatemala is sitting quietly at his desk during independent work time, not disruptive but not engaging with the worksheet either. The teacher is working with a small group and glances at you.",
      choices: [
        { text: "Walk to his desk, point to the first problem, and say: 'Let\u2019s try this one — can you show me the picture?' Use gestures and visuals alongside your words.", correct: true },
        { text: 'Leave him alone — he might just need time to adjust to the new environment.', correct: false },
        { text: "Bring him to the teacher's small group so the teacher can handle the language barrier.", correct: false },
      ],
      move: 'Move, Don\u2019t Stay + Redirect Without the Spotlight',
      explanation:
        "Going to the student, meeting him where he is, and using visuals and gestures alongside language brings the learning to him without putting him on stage. Waiting for him to 'adjust' means he loses learning time every day. Pulling him to the teacher's group disrupts both the student and the group — and sends the message that only the teacher can help.",
    },
    es: {
      scenario:
        'Estás en un salón bilingüe de primer grado. Un estudiante que llegó recientemente de Guatemala está sentado tranquilamente en su escritorio durante el tiempo de trabajo independiente, sin ser disruptivo pero tampoco participando en la hoja de trabajo. La maestra está trabajando con un grupo pequeño y te mira.',
      choices: [
        { text: "Ve a su escritorio, señala el primer problema y di: '¿Intentamos este juntos? ¿Puedes mostrarme la imagen?' Usa gestos y materiales visuales junto con tus palabras.", correct: true },
        { text: 'Déjalo solo — quizás solo necesita tiempo para adaptarse al nuevo entorno.', correct: false },
        { text: 'Llévalo al grupo pequeño de la maestra para que ella pueda manejar la barrera del idioma.', correct: false },
      ],
      move: 'Muévete, No Te Quedes + Redirige Sin el Reflector',
      explanation:
        "Ir hacia el estudiante, encontrarlo donde está y usar visuales y gestos junto con el lenguaje lleva el aprendizaje hacia él sin ponerlo en evidencia. Esperar a que se 'adapte' significa que pierde tiempo de aprendizaje todos los días. Llevarlo al grupo de la maestra interrumpe tanto al estudiante como al grupo — y envía el mensaje de que solo la maestra puede ayudar.",
    },
  },

  // Scenario 6 — HS Socratic seminar / ADHD, Redirect + Move
  {
    en: {
      scenario:
        "You're supporting a high school English class. During a Socratic seminar, you're standing against the back wall. You notice a student with ADHD (who you support) has stopped participating and is picking at the edge of her notebook. She's not disrupting anyone.",
      choices: [
        { text: "Walk behind her chair and quietly place a sticky note on her desk that says: 'Great point earlier about the author\u2019s tone — can you add to that?'", correct: true },
        { text: "Raise your hand and say: 'I think she had something to say about that.'", correct: false },
        { text: "Stay at the wall — she's in a discussion-based class and needs to learn to participate on her own.", correct: false },
      ],
      move: 'Redirect Without the Spotlight + Move, Don\u2019t Stay',
      explanation:
        'A written prompt is a private, low-pressure redirect that also scaffolds re-entry into the discussion. It references something she already said, which builds confidence. Speaking for her publicly is embarrassing. Staying at the wall when you have a tool to help is a missed opportunity — your movement matters even in a discussion-based class.',
    },
    es: {
      scenario:
        'Estás apoyando una clase de inglés de preparatoria. Durante un seminario socrático, estás parado/a contra la pared del fondo. Notas que una estudiante con TDAH (a quien apoyas) ha dejado de participar y está pellizcando el borde de su cuaderno. No está molestando a nadie.',
      choices: [
        { text: "Camina detrás de su silla y coloca silenciosamente una nota adhesiva en su escritorio que diga: 'Hiciste un buen punto antes sobre el tono del autor — ¿puedes agregar algo más?'", correct: true },
        { text: "Levanta la mano y di: 'Creo que ella tenía algo que decir sobre eso.'", correct: false },
        { text: 'Quédate en la pared — está en una clase basada en discusión y necesita aprender a participar por su cuenta.', correct: false },
      ],
      move: 'Redirige Sin el Reflector + Muévete, No Te Quedes',
      explanation:
        'Una indicación escrita es una redirección privada y de bajo estrés que también facilita la reincorporación a la discusión. Hace referencia a algo que ella ya dijo, lo que genera confianza. Hablar por ella públicamente es embarazoso. Quedarte en la pared cuando tienes una herramienta para ayudar es una oportunidad perdida — tu movimiento importa incluso en una clase basada en discusión.',
    },
  },
];

export const SCENARIO_COUNT = 6;
