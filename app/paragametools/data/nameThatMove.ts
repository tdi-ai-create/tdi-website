// Name That Move: Identify the strategy behind the educator's action.
// Build your personal playbook of moves.

export type Role = 'teacher' | 'para' | 'coach' | 'leader'
export type GradeBand = 'pk-2' | '3-5' | '6-8' | '9-12'
export type Experience = 'first_year' | '2-5' | '6-15' | '16+'

export type MoveCategory =
  | 'de_escalation'
  | 'relationship_building'
  | 'instructional'
  | 'redirect'
  | 'coaching'
  | 'wellness'

export interface MoveOption {
  text: string
  isCorrect: boolean
}

export interface MoveScenario {
  id: string
  roles: Role[]
  gradeBands: GradeBand[]
  category: MoveCategory
  en: {
    vignette: string
    options: MoveOption[]
    correctName: string
    description: string
    research: string
  }
  es: {
    vignette: string
    options: MoveOption[]
    correctName: string
    description: string
    research: string
  }
}

export const SCENARIO_COUNT = 10

export const CATEGORY_LABELS: Record<MoveCategory, { en: string; es: string; color: string }> = {
  de_escalation: { en: 'De-escalation', es: 'Desescalamiento', color: '#3498DB' },
  relationship_building: { en: 'Relationship Building', es: 'Construccion de Relaciones', color: '#27AE60' },
  instructional: { en: 'Instructional', es: 'Instruccional', color: '#9333EA' },
  redirect: { en: 'Redirect', es: 'Redireccion', color: '#F59E0B' },
  coaching: { en: 'Coaching', es: 'Coaching', color: '#22b8bd' },
  wellness: { en: 'Wellness', es: 'Bienestar', color: '#F43F5E' },
}

export const SCENARIOS: MoveScenario[] = [
  // ─── 1: Proximity ─────────────────────────────────────────────────────────
  {
    id: 'ntm-proximity',
    roles: ['teacher', 'para'],
    gradeBands: ['pk-2', '3-5', '6-8', '9-12'],
    category: 'de_escalation',
    en: {
      vignette: 'During independent work time, a student starts tapping their pencil and looking around the room. The educator does not say anything. Instead, they walk over and stand near the student\'s desk while continuing to scan the room. Within 30 seconds, the student picks up their pencil and starts writing.',
      options: [
        { text: 'Proximity', isCorrect: true },
        { text: 'Strategic Ignoring', isCorrect: false },
        { text: 'Nonverbal Cue', isCorrect: false },
        { text: 'Wait Time', isCorrect: false },
      ],
      correctName: 'Proximity',
      description: 'Moving physically closer to a student to redirect behavior without verbal intervention. The educator\'s presence communicates awareness and expectation without disrupting the learning environment.',
      research: 'Marzano (2003) found that proximity-based interventions reduced off-task behavior by up to 70% without interrupting instruction.',
    },
    es: {
      vignette: 'Durante el trabajo independiente, un estudiante comienza a golpear su lapiz y mirar alrededor del salon. El educador no dice nada. En cambio, camina y se para cerca del escritorio del estudiante mientras sigue observando el salon. En 30 segundos, el estudiante toma su lapiz y comienza a escribir.',
      options: [
        { text: 'Proximidad', isCorrect: true },
        { text: 'Ignorar Estrategico', isCorrect: false },
        { text: 'Senal No Verbal', isCorrect: false },
        { text: 'Tiempo de Espera', isCorrect: false },
      ],
      correctName: 'Proximidad',
      description: 'Acercarse fisicamente a un estudiante para redirigir el comportamiento sin intervencion verbal. La presencia del educador comunica conciencia y expectativa sin interrumpir el ambiente de aprendizaje.',
      research: 'Marzano (2003) encontro que las intervenciones basadas en proximidad redujeron el comportamiento fuera de tarea hasta un 70% sin interrumpir la instruccion.',
    },
  },
  // ─── 2: Greeting Ritual ───────────────────────────────────────────────────
  {
    id: 'ntm-greeting-ritual',
    roles: ['teacher', 'para', 'leader'],
    gradeBands: ['pk-2', '3-5', '6-8', '9-12'],
    category: 'relationship_building',
    en: {
      vignette: 'Every morning, the educator stands at the classroom door. As each student walks in, they say the student\'s name, make eye contact, and offer a choice: fist bump, handshake, or wave. They do this for every student, every day, even on their hardest days.',
      options: [
        { text: 'Morning Meeting', isCorrect: false },
        { text: 'Greeting at the Door', isCorrect: true },
        { text: 'Check-in Protocol', isCorrect: false },
        { text: '2x10 Strategy', isCorrect: false },
      ],
      correctName: 'Greeting at the Door',
      description: 'Intentionally welcoming each student by name at the classroom entrance. This brief interaction sets the emotional tone for the period and communicates that every student is seen before instruction begins.',
      research: 'Cook et al. (2018) found that greeting students at the door increased academic engagement by 20 percentage points and decreased disruptive behavior by 9 percentage points.',
    },
    es: {
      vignette: 'Cada manana, el educador se para en la puerta del salon. Cuando cada estudiante entra, dice su nombre, hace contacto visual y ofrece una opcion: choque de punos, apreton de manos u ola. Hace esto con cada estudiante, cada dia, incluso en sus dias mas dificiles.',
      options: [
        { text: 'Reunion Matutina', isCorrect: false },
        { text: 'Saludo en la Puerta', isCorrect: true },
        { text: 'Protocolo de Registro', isCorrect: false },
        { text: 'Estrategia 2x10', isCorrect: false },
      ],
      correctName: 'Saludo en la Puerta',
      description: 'Dar la bienvenida intencionalmente a cada estudiante por su nombre en la entrada del salon. Esta breve interaccion establece el tono emocional del periodo y comunica que cada estudiante es visto antes de que comience la instruccion.',
      research: 'Cook et al. (2018) encontraron que saludar a los estudiantes en la puerta aumento el compromiso academico en 20 puntos porcentuales y disminuyo el comportamiento disruptivo en 9 puntos.',
    },
  },
  // ─── 3: Redirect Without Spotlight ────────────────────────────────────────
  {
    id: 'ntm-redirect-no-spotlight',
    roles: ['teacher', 'para'],
    gradeBands: ['3-5', '6-8', '9-12'],
    category: 'redirect',
    en: {
      vignette: 'A student is drawing in their notebook instead of following the lesson. The educator walks over during independent work, crouches next to the student\'s desk, and whispers a brief correction. No one else in the class notices. The student flips to the right page without any visible embarrassment.',
      options: [
        { text: 'Proximity', isCorrect: false },
        { text: 'Private Signal', isCorrect: false },
        { text: 'Redirect Without Spotlight', isCorrect: true },
        { text: 'Planned Ignoring', isCorrect: false },
      ],
      correctName: 'Redirect Without Spotlight',
      description: 'Addressing off-task behavior quietly and privately so the student can correct course without public embarrassment. The key is that no audience exists for the correction.',
      research: 'Curwin and Mendler (1999) showed that public corrections increase defiance in adolescents by 40%. Private redirects preserve dignity and increase compliance.',
    },
    es: {
      vignette: 'Un estudiante esta dibujando en su cuaderno en vez de seguir la leccion. El educador camina durante el trabajo independiente, se agacha al lado del escritorio del estudiante y susurra una breve correccion. Nadie mas en la clase se da cuenta. El estudiante cambia a la pagina correcta sin ninguna verguenza visible.',
      options: [
        { text: 'Proximidad', isCorrect: false },
        { text: 'Senal Privada', isCorrect: false },
        { text: 'Redireccion Sin Reflector', isCorrect: true },
        { text: 'Ignorar Planeado', isCorrect: false },
      ],
      correctName: 'Redireccion Sin Reflector',
      description: 'Abordar el comportamiento fuera de tarea de manera tranquila y privada para que el estudiante pueda corregir el rumbo sin verguenza publica. La clave es que no existe audiencia para la correccion.',
      research: 'Curwin y Mendler (1999) mostraron que las correcciones publicas aumentan la resistencia en adolescentes en un 40%. Las redirecciones privadas preservan la dignidad y aumentan el cumplimiento.',
    },
  },
  // ─── 4: Coaching Stance / Paraphrase ──────────────────────────────────────
  {
    id: 'ntm-coaching-stance',
    roles: ['coach', 'leader'],
    gradeBands: ['pk-2', '3-5', '6-8', '9-12'],
    category: 'coaching',
    en: {
      vignette: 'A teacher comes to the coach after a rough lesson. They say, "Nothing I do works with this class." Instead of offering advice, the coach leans forward and says, "Tell me more about that. What does \'nothing works\' look like for you?" The teacher pauses, then starts describing specific moments. The conversation shifts from venting to problem-solving.',
      options: [
        { text: 'Active Listening', isCorrect: false },
        { text: 'Coaching Stance', isCorrect: true },
        { text: 'Reflective Practice', isCorrect: false },
        { text: 'Solution-Focused Questioning', isCorrect: false },
      ],
      correctName: 'Coaching Stance',
      description: 'Resisting the urge to solve and instead using open-ended questions to help the other person think deeper. "Tell me more" and "What does that look like?" move someone from global frustration to specific, solvable problems.',
      research: 'Knight (2007) found that coaches who adopt a partnership stance rather than an expert stance see 3x more implementation of new strategies.',
    },
    es: {
      vignette: 'Un maestro va con el coach despues de una leccion dificil. Dice, "Nada de lo que hago funciona con esta clase." En vez de ofrecer consejo, el coach se inclina hacia adelante y dice, "Cuentame mas sobre eso. Como se ve \'nada funciona\' para ti?" El maestro hace una pausa, luego comienza a describir momentos especificos. La conversacion cambia de desahogo a resolucion de problemas.',
      options: [
        { text: 'Escucha Activa', isCorrect: false },
        { text: 'Postura de Coaching', isCorrect: true },
        { text: 'Practica Reflexiva', isCorrect: false },
        { text: 'Preguntas Enfocadas en Soluciones', isCorrect: false },
      ],
      correctName: 'Postura de Coaching',
      description: 'Resistir el impulso de resolver y en su lugar usar preguntas abiertas para ayudar a la otra persona a pensar mas profundamente. "Cuentame mas" y "Como se ve eso?" mueven a alguien de la frustracion global a problemas especificos y resolvibles.',
      research: 'Knight (2007) encontro que los coaches que adoptan una postura de companerismo en vez de experto ven 3 veces mas implementacion de nuevas estrategias.',
    },
  },
  // ─── 5: Wait Time ────────────────────────────────────────────────────────
  {
    id: 'ntm-wait-time',
    roles: ['teacher', 'para', 'coach'],
    gradeBands: ['pk-2', '3-5', '6-8', '9-12'],
    category: 'instructional',
    en: {
      vignette: 'The educator asks the class a question. Silence. Five seconds pass. Seven seconds. The educator does not rephrase, does not call on anyone, does not fill the silence. At the 8-second mark, a student who rarely participates raises their hand. Then two more hands go up.',
      options: [
        { text: 'Think Time', isCorrect: false },
        { text: 'Cold Call', isCorrect: false },
        { text: 'Wait Time', isCorrect: true },
        { text: 'No Opt Out', isCorrect: false },
      ],
      correctName: 'Wait Time',
      description: 'Intentionally pausing 5 to 10 seconds after asking a question before accepting responses. This silence gives all students time to process, not just the fastest thinkers.',
      research: 'Rowe (1986) found that increasing wait time from 1 second to 3+ seconds increased the length of student responses by 300% and the number of students volunteering by 400%.',
    },
    es: {
      vignette: 'El educador hace una pregunta a la clase. Silencio. Pasan cinco segundos. Siete segundos. El educador no reformula, no llama a nadie, no llena el silencio. A los 8 segundos, un estudiante que raramente participa levanta la mano. Luego dos manos mas se levantan.',
      options: [
        { text: 'Tiempo para Pensar', isCorrect: false },
        { text: 'Llamada en Frio', isCorrect: false },
        { text: 'Tiempo de Espera', isCorrect: true },
        { text: 'Sin Opcion de Salir', isCorrect: false },
      ],
      correctName: 'Tiempo de Espera',
      description: 'Pausar intencionalmente 5 a 10 segundos despues de hacer una pregunta antes de aceptar respuestas. Este silencio da a todos los estudiantes tiempo para procesar, no solo a los pensadores mas rapidos.',
      research: 'Rowe (1986) encontro que aumentar el tiempo de espera de 1 segundo a 3+ segundos aumento la longitud de las respuestas de los estudiantes en un 300% y el numero de voluntarios en un 400%.',
    },
  },
  // ─── 6: 2x10 Strategy ────────────────────────────────────────────────────
  {
    id: 'ntm-2x10',
    roles: ['teacher', 'para'],
    gradeBands: ['pk-2', '3-5', '6-8', '9-12'],
    category: 'relationship_building',
    en: {
      vignette: 'A student has been refusing to engage for weeks. The educator starts a new routine: every day for 10 consecutive days, they spend exactly 2 minutes talking to this student about anything except academics. Video games, pets, weekend plans. By day 7, the student is smiling when the educator approaches. By day 10, the student starts their work without being asked.',
      options: [
        { text: 'Mentoring Protocol', isCorrect: false },
        { text: 'Interest Inventory', isCorrect: false },
        { text: 'Positive Behavior Intervention', isCorrect: false },
        { text: '2x10 Strategy', isCorrect: true },
      ],
      correctName: '2x10 Strategy',
      description: 'Spending 2 minutes per day for 10 consecutive days in personal conversation with a student. The non-academic focus communicates that the educator values the student as a person, not just as a learner.',
      research: 'Wlodkowski (1983) documented that the 2x10 approach improved the target student\'s behavior by 85% and had a ripple effect on the entire class.',
    },
    es: {
      vignette: 'Un estudiante se ha negado a participar durante semanas. El educador comienza una nueva rutina: cada dia durante 10 dias consecutivos, pasa exactamente 2 minutos hablando con este estudiante sobre cualquier cosa excepto lo academico. Videojuegos, mascotas, planes del fin de semana. Para el dia 7, el estudiante sonrie cuando el educador se acerca. Para el dia 10, el estudiante comienza su trabajo sin que se lo pidan.',
      options: [
        { text: 'Protocolo de Mentoria', isCorrect: false },
        { text: 'Inventario de Intereses', isCorrect: false },
        { text: 'Intervencion de Comportamiento Positivo', isCorrect: false },
        { text: 'Estrategia 2x10', isCorrect: true },
      ],
      correctName: 'Estrategia 2x10',
      description: 'Pasar 2 minutos por dia durante 10 dias consecutivos en conversacion personal con un estudiante. El enfoque no academico comunica que el educador valora al estudiante como persona, no solo como aprendiz.',
      research: 'Wlodkowski (1983) documento que el enfoque 2x10 mejoro el comportamiento del estudiante objetivo en un 85% y tuvo un efecto domino en toda la clase.',
    },
  },
  // ─── 7: Strategic Ignoring + Proximity Praise ─────────────────────────────
  {
    id: 'ntm-strategic-ignoring',
    roles: ['teacher', 'para'],
    gradeBands: ['pk-2', '3-5'],
    category: 'de_escalation',
    en: {
      vignette: 'A student is tapping their ruler on the desk repeatedly during a read-aloud. The educator does not look at them, does not name the behavior, and does not pause. Instead, they walk toward that side of the room and say to the student sitting next to them, "I love how you are following along with your eyes on the page." The tapping stops within 15 seconds.',
      options: [
        { text: 'Positive Reinforcement', isCorrect: false },
        { text: 'Strategic Ignoring with Proximity Praise', isCorrect: true },
        { text: 'Peer Modeling', isCorrect: false },
        { text: 'Redirect Without Spotlight', isCorrect: false },
      ],
      correctName: 'Strategic Ignoring with Proximity Praise',
      description: 'Deliberately not attending to minor disruptive behavior while simultaneously praising the desired behavior in a nearby student. This avoids giving the disruptive student attention for the wrong behavior while clearly modeling expectations.',
      research: 'Madsen, Becker, and Thomas (1968) demonstrated that combining planned ignoring with praise for peers reduced disruptive behavior more effectively than reprimands alone.',
    },
    es: {
      vignette: 'Un estudiante esta golpeando su regla en el escritorio repetidamente durante una lectura en voz alta. El educador no los mira, no nombra el comportamiento y no hace pausa. En cambio, camina hacia ese lado del salon y dice al estudiante sentado al lado, "Me encanta como estas siguiendo con los ojos en la pagina." El golpeteo se detiene en 15 segundos.',
      options: [
        { text: 'Refuerzo Positivo', isCorrect: false },
        { text: 'Ignorar Estrategico con Elogio de Proximidad', isCorrect: true },
        { text: 'Modelado de Pares', isCorrect: false },
        { text: 'Redireccion Sin Reflector', isCorrect: false },
      ],
      correctName: 'Ignorar Estrategico con Elogio de Proximidad',
      description: 'Deliberadamente no atender al comportamiento disruptivo menor mientras se elogia simultaneamente el comportamiento deseado en un estudiante cercano. Esto evita dar atencion al estudiante disruptivo por el comportamiento incorrecto mientras se modelan claramente las expectativas.',
      research: 'Madsen, Becker y Thomas (1968) demostraron que combinar ignorar planeado con elogio a los pares redujo el comportamiento disruptivo mas efectivamente que las reprimendas solas.',
    },
  },
  // ─── 8: Emotional Check-in ────────────────────────────────────────────────
  {
    id: 'ntm-emotional-checkin',
    roles: ['teacher', 'para', 'coach'],
    gradeBands: ['pk-2', '3-5', '6-8', '9-12'],
    category: 'wellness',
    en: {
      vignette: 'A student slams their chromebook shut and puts their head down. Their body is tense and their breathing is fast. Instead of asking what happened or telling them to get back to work, the educator crouches beside them and quietly asks, "What do you need right now?" The student does not answer immediately. The educator waits. After a moment, the student whispers, "Can I go get water?"',
      options: [
        { text: 'De-escalation Protocol', isCorrect: false },
        { text: 'Restorative Check-in', isCorrect: false },
        { text: 'Emotional Check-in', isCorrect: true },
        { text: 'Calm Corner Redirect', isCorrect: false },
      ],
      correctName: 'Emotional Check-in',
      description: 'Asking a student what they need in a moment of distress instead of asking what happened or demanding compliance. This approach centers the student\'s agency and co-regulation instead of control.',
      research: 'Jennings and Greenberg (2009) found that educators who use emotionally responsive language reduce classroom stress and increase student emotional regulation capacity.',
    },
    es: {
      vignette: 'Un estudiante cierra su chromebook de golpe y pone la cabeza sobre el escritorio. Su cuerpo esta tenso y respira rapido. En vez de preguntar que paso o decirle que vuelva al trabajo, el educador se agacha a su lado y pregunta tranquilamente, "Que necesitas ahora mismo?" El estudiante no responde inmediatamente. El educador espera. Despues de un momento, el estudiante susurra, "Puedo ir por agua?"',
      options: [
        { text: 'Protocolo de Desescalamiento', isCorrect: false },
        { text: 'Registro Restaurativo', isCorrect: false },
        { text: 'Registro Emocional', isCorrect: true },
        { text: 'Redireccion a Rincon de Calma', isCorrect: false },
      ],
      correctName: 'Registro Emocional',
      description: 'Preguntar a un estudiante que necesita en un momento de angustia en vez de preguntar que paso o exigir cumplimiento. Este enfoque centra la agencia del estudiante y la co-regulacion en vez del control.',
      research: 'Jennings y Greenberg (2009) encontraron que los educadores que usan lenguaje emocionalmente receptivo reducen el estres en el salon y aumentan la capacidad de regulacion emocional del estudiante.',
    },
  },
  // ─── 9: Private Signal ────────────────────────────────────────────────────
  {
    id: 'ntm-private-signal',
    roles: ['teacher', 'para'],
    gradeBands: ['pk-2', '3-5', '6-8'],
    category: 'redirect',
    en: {
      vignette: 'During a whole-class discussion, a student starts fidgeting and whispering to a neighbor. Without pausing the lesson or looking directly at the student, the educator taps twice on the student\'s desk as they walk past. The student straightens up. No one else noticed anything happened.',
      options: [
        { text: 'Nonverbal Warning', isCorrect: false },
        { text: 'Proximity', isCorrect: false },
        { text: 'Private Signal', isCorrect: true },
        { text: 'Planned Ignoring', isCorrect: false },
      ],
      correctName: 'Private Signal',
      description: 'A pre-arranged, non-verbal cue between the educator and a specific student that communicates a redirect without public attention. The student knows what the signal means because it was established in advance.',
      research: 'Simonsen et al. (2008) found that non-verbal, pre-established signals are among the most effective low-intensity behavior supports, maintaining instruction flow while reducing disruption.',
    },
    es: {
      vignette: 'Durante una discusion de toda la clase, un estudiante comienza a inquietarse y susurrar con un vecino. Sin pausar la leccion ni mirar directamente al estudiante, el educador toca dos veces el escritorio del estudiante mientras pasa. El estudiante se endereza. Nadie mas noto que algo paso.',
      options: [
        { text: 'Advertencia No Verbal', isCorrect: false },
        { text: 'Proximidad', isCorrect: false },
        { text: 'Senal Privada', isCorrect: true },
        { text: 'Ignorar Planeado', isCorrect: false },
      ],
      correctName: 'Senal Privada',
      description: 'Una senal pre-establecida y no verbal entre el educador y un estudiante especifico que comunica una redireccion sin atencion publica. El estudiante sabe lo que significa la senal porque se establecio de antemano.',
      research: 'Simonsen et al. (2008) encontraron que las senales no verbales pre-establecidas estan entre los apoyos conductuales de baja intensidad mas efectivos, manteniendo el flujo de instruccion mientras reducen la disrupcion.',
    },
  },
  // ─── 10: Presume Positive Intent ──────────────────────────────────────────
  {
    id: 'ntm-presume-positive',
    roles: ['coach', 'leader'],
    gradeBands: ['pk-2', '3-5', '6-8', '9-12'],
    category: 'coaching',
    en: {
      vignette: 'A coach walks into a classroom and sees that the teacher skipped the collaborative activity and went straight to a worksheet. In the debrief, the coach does not say, "You skipped the activity we planned." Instead, they say, "I noticed you made a shift during the lesson. I wonder what you were seeing in the moment that led you to adjust." The teacher relaxes and explains that three students were dysregulated and the worksheet bought time to stabilize the room.',
      options: [
        { text: 'Reflective Questioning', isCorrect: false },
        { text: 'Motivational Interviewing', isCorrect: false },
        { text: 'Presume Positive Intent', isCorrect: true },
        { text: 'Appreciative Inquiry', isCorrect: false },
      ],
      correctName: 'Presume Positive Intent',
      description: 'Starting from the assumption that the other person had a valid reason for their choices. Using "I noticed... I wonder..." frames curiosity rather than judgment. This builds trust and opens honest dialogue about decision-making.',
      research: 'Aguilar (2013) identified presuming positive intent as one of the foundational coaching dispositions that predicts whether a coaching relationship will produce change.',
    },
    es: {
      vignette: 'Un coach entra al salon y ve que el maestro se salto la actividad colaborativa y fue directo a una hoja de trabajo. En la retroalimentacion, el coach no dice, "Te saltaste la actividad que planeamos." En cambio, dice, "Note que hiciste un ajuste durante la leccion. Me pregunto que estabas viendo en el momento que te llevo a ajustar." El maestro se relaja y explica que tres estudiantes estaban desregulados y la hoja de trabajo le dio tiempo para estabilizar el salon.',
      options: [
        { text: 'Preguntas Reflexivas', isCorrect: false },
        { text: 'Entrevista Motivacional', isCorrect: false },
        { text: 'Presumir Intencion Positiva', isCorrect: true },
        { text: 'Indagacion Apreciativa', isCorrect: false },
      ],
      correctName: 'Presumir Intencion Positiva',
      description: 'Comenzar desde la suposicion de que la otra persona tenia una razon valida para sus decisiones. Usar "Note... Me pregunto..." enmarca la curiosidad en vez del juicio. Esto construye confianza y abre dialogo honesto sobre la toma de decisiones.',
      research: 'Aguilar (2013) identifico presumir intencion positiva como una de las disposiciones fundamentales de coaching que predice si una relacion de coaching producira cambio.',
    },
  },
  // ─── 11: Micro-Reset ─────────────────────────────────────────────────────
  {
    id: 'ntm-micro-reset',
    roles: ['teacher', 'para', 'coach', 'leader'],
    gradeBands: ['pk-2', '3-5', '6-8', '9-12'],
    category: 'wellness',
    en: {
      vignette: 'A teacher has just finished a difficult parent phone call during their planning period. Instead of immediately jumping to grading or lesson prep, they step into the hallway for 30 seconds. They close their eyes, take three deep breaths, roll their shoulders, and walk back in. They start their next task with noticeably calmer energy.',
      options: [
        { text: 'Self-Care Routine', isCorrect: false },
        { text: 'Micro-Reset', isCorrect: true },
        { text: 'Mindfulness Practice', isCorrect: false },
        { text: 'Stress Response Protocol', isCorrect: false },
      ],
      correctName: 'Micro-Reset',
      description: 'A brief (30 seconds to 2 minutes), intentional pause to reset the nervous system between tasks or after stressful moments. Unlike a full break, a micro-reset is designed to fit into the workday without requiring time away.',
      research: 'Bremner (2016) showed that even 30-second breathing exercises activate the parasympathetic nervous system and reduce cortisol levels, improving decision-making quality for the next task.',
    },
    es: {
      vignette: 'Un maestro acaba de terminar una llamada dificil con un padre durante su periodo de planificacion. En vez de saltar inmediatamente a calificar o preparar lecciones, sale al pasillo por 30 segundos. Cierra los ojos, toma tres respiraciones profundas, gira los hombros y regresa. Comienza su siguiente tarea con energia notablemente mas calmada.',
      options: [
        { text: 'Rutina de Autocuidado', isCorrect: false },
        { text: 'Micro-Reinicio', isCorrect: true },
        { text: 'Practica de Mindfulness', isCorrect: false },
        { text: 'Protocolo de Respuesta al Estres', isCorrect: false },
      ],
      correctName: 'Micro-Reinicio',
      description: 'Una pausa breve (30 segundos a 2 minutos) e intencional para reiniciar el sistema nervioso entre tareas o despues de momentos estresantes. A diferencia de un descanso completo, un micro-reinicio esta disenado para caber en el dia laboral sin requerir tiempo fuera.',
      research: 'Bremner (2016) mostro que incluso ejercicios de respiracion de 30 segundos activan el sistema nervioso parasimpatico y reducen los niveles de cortisol, mejorando la calidad de las decisiones para la siguiente tarea.',
    },
  },
  // ─── 12: Movement Redirect ────────────────────────────────────────────────
  {
    id: 'ntm-movement-redirect',
    roles: ['teacher', 'para'],
    gradeBands: ['pk-2', '3-5', '6-8'],
    category: 'de_escalation',
    en: {
      vignette: 'A student is visibly upset. Their fists are clenched, they are breathing hard, and their eyes are filling with tears. The room is watching. Instead of asking what is wrong or directing them to a calm corner, the educator simply says, "Walk with me." They walk together down the hallway in silence for about 20 seconds before the educator speaks again.',
      options: [
        { text: 'Escort to Cool Down', isCorrect: false },
        { text: 'Movement Redirect', isCorrect: true },
        { text: 'Hallway Conference', isCorrect: false },
        { text: 'Sensory Break', isCorrect: false },
      ],
      correctName: 'Movement Redirect',
      description: 'Using physical movement to change a student\'s emotional state before attempting verbal processing. Walking activates bilateral stimulation, regulates the nervous system, and removes the student from the audience that amplifies dysregulation.',
      research: 'Van der Kolk (2014) documented that rhythmic bilateral movement (like walking) helps regulate the limbic system, making verbal processing possible where it was not before.',
    },
    es: {
      vignette: 'Un estudiante esta visiblemente molesto. Sus punos estan cerrados, respira fuerte y sus ojos se llenan de lagrimas. El salon esta observando. En vez de preguntar que pasa o dirigirlo a un rincon de calma, el educador simplemente dice, "Camina conmigo." Caminan juntos por el pasillo en silencio por unos 20 segundos antes de que el educador hable de nuevo.',
      options: [
        { text: 'Escolta a Calmarse', isCorrect: false },
        { text: 'Redireccion por Movimiento', isCorrect: true },
        { text: 'Conferencia en el Pasillo', isCorrect: false },
        { text: 'Descanso Sensorial', isCorrect: false },
      ],
      correctName: 'Redireccion por Movimiento',
      description: 'Usar el movimiento fisico para cambiar el estado emocional de un estudiante antes de intentar el procesamiento verbal. Caminar activa la estimulacion bilateral, regula el sistema nervioso y remueve al estudiante de la audiencia que amplifica la desregulacion.',
      research: 'Van der Kolk (2014) documento que el movimiento bilateral ritmico (como caminar) ayuda a regular el sistema limbico, haciendo posible el procesamiento verbal donde antes no lo era.',
    },
  },
  // ─── 13: Praise-Prompt-Leave ──────────────────────────────────────────────
  {
    id: 'ntm-praise-prompt-leave',
    roles: ['teacher', 'para'],
    gradeBands: ['pk-2', '3-5', '6-8', '9-12'],
    category: 'instructional',
    en: {
      vignette: 'During independent work, the educator stops at a student\'s desk. They say, "You labeled both axes on your graph correctly, which shows you understand the data structure. For your next step, try writing one sentence that explains what the graph is telling us." Then they walk away without waiting for the student to respond or start.',
      options: [
        { text: 'Scaffolded Feedback', isCorrect: false },
        { text: 'Check for Understanding', isCorrect: false },
        { text: 'Targeted Praise', isCorrect: false },
        { text: 'Praise-Prompt-Leave', isCorrect: true },
      ],
      correctName: 'Praise-Prompt-Leave',
      description: 'Giving specific praise for what was done well, prompting a clear next step, then physically leaving the student to work independently. The "leave" is the critical part. It communicates trust and prevents learned helplessness.',
      research: 'Fisher and Frey (2014) found that educators who walk away after feedback see higher rates of independent follow-through than those who hover and monitor.',
    },
    es: {
      vignette: 'Durante el trabajo independiente, el educador se detiene en el escritorio de un estudiante. Dice, "Etiquetaste ambos ejes en tu grafica correctamente, lo cual muestra que entiendes la estructura de datos. Para tu siguiente paso, intenta escribir una oracion que explique lo que la grafica nos esta diciendo." Luego se aleja sin esperar a que el estudiante responda o comience.',
      options: [
        { text: 'Retroalimentacion Escalonada', isCorrect: false },
        { text: 'Verificacion de Comprension', isCorrect: false },
        { text: 'Elogio Dirigido', isCorrect: false },
        { text: 'Elogiar-Indicar-Partir', isCorrect: true },
      ],
      correctName: 'Elogiar-Indicar-Partir',
      description: 'Dar elogio especifico por lo que se hizo bien, indicar un siguiente paso claro, y luego irse fisicamente dejando al estudiante trabajar independientemente. El "partir" es la parte critica. Comunica confianza y previene la indefension aprendida.',
      research: 'Fisher y Frey (2014) encontraron que los educadores que se alejan despues de la retroalimentacion ven tasas mas altas de seguimiento independiente que los que se quedan observando.',
    },
  },
  // ─── 14: Voice Matching ───────────────────────────────────────────────────
  {
    id: 'ntm-voice-matching',
    roles: ['teacher', 'para'],
    gradeBands: ['pk-2', '3-5', '6-8'],
    category: 'de_escalation',
    en: {
      vignette: 'A student is yelling about how unfair a group assignment is. The educator does not whisper or stay calm in a way that contrasts the student\'s energy. Instead, they match the student\'s volume (not content) and say firmly, "I hear you. That feels unfair." Then they gradually lower their own voice with each sentence. The student\'s volume drops to match. Within 45 seconds, both are speaking at a normal level.',
      options: [
        { text: 'Mirroring', isCorrect: false },
        { text: 'Voice Matching', isCorrect: true },
        { text: 'Co-regulation', isCorrect: false },
        { text: 'Validation Technique', isCorrect: false },
      ],
      correctName: 'Voice Matching',
      description: 'Briefly matching a dysregulated student\'s volume level to communicate that you hear them, then gradually lowering your voice to guide theirs down. This works because the brain unconsciously mirrors the volume of the person it is communicating with.',
      research: 'Porges\' Polyvagal Theory (2011) explains that prosody and volume cues signal safety or threat. Matching, then lowering, activates the student\'s social engagement system more effectively than an immediate calm voice.',
    },
    es: {
      vignette: 'Un estudiante esta gritando sobre lo injusto de una tarea grupal. El educador no susurra ni se mantiene calmado de una manera que contraste la energia del estudiante. En cambio, iguala el volumen del estudiante (no el contenido) y dice firmemente, "Te escucho. Eso se siente injusto." Luego gradualmente baja su propia voz con cada oracion. El volumen del estudiante baja para igualar. En 45 segundos, ambos estan hablando a un nivel normal.',
      options: [
        { text: 'Reflejo', isCorrect: false },
        { text: 'Igualacion de Voz', isCorrect: true },
        { text: 'Co-regulacion', isCorrect: false },
        { text: 'Tecnica de Validacion', isCorrect: false },
      ],
      correctName: 'Igualacion de Voz',
      description: 'Igualar brevemente el nivel de volumen de un estudiante desregulado para comunicar que los escuchas, luego gradualmente bajar tu voz para guiar la de ellos. Funciona porque el cerebro inconscientemente refleja el volumen de la persona con la que se comunica.',
      research: 'La Teoria Polivagal de Porges (2011) explica que las senales de prosodia y volumen indican seguridad o amenaza. Igualar, luego bajar, activa el sistema de compromiso social del estudiante mas efectivamente que una voz calmada inmediata.',
    },
  },
  // ─── 15: Coaching Stance with Parent ──────────────────────────────────────
  {
    id: 'ntm-coaching-parent',
    roles: ['teacher', 'leader'],
    gradeBands: ['pk-2', '3-5', '6-8', '9-12'],
    category: 'coaching',
    en: {
      vignette: 'A parent arrives at a conference visibly frustrated. They say, "My child says you never call on them." Instead of defending or explaining, the educator pauses, then says, "That matters to me. What would you like me to do differently?" The parent\'s posture changes. They lean forward and start problem-solving instead of accusing.',
      options: [
        { text: 'Conflict Resolution', isCorrect: false },
        { text: 'Active Listening', isCorrect: false },
        { text: 'Parent Partnership Protocol', isCorrect: false },
        { text: 'Coaching Stance', isCorrect: true },
      ],
      correctName: 'Coaching Stance',
      description: 'Using curiosity and genuine inquiry rather than defense when faced with a complaint. "What would you like me to do differently?" shifts the dynamic from adversarial to collaborative. The coaching stance works with anyone, not just in formal coaching relationships.',
      research: 'Epstein (2018) found that parent-teacher relationships improve most when educators respond to criticism with curiosity rather than justification.',
    },
    es: {
      vignette: 'Un padre llega a una conferencia visiblemente frustrado. Dice, "Mi hijo dice que nunca lo llamas." En vez de defenderse o explicar, el educador hace una pausa, luego dice, "Eso me importa. Que le gustaria que hiciera diferente?" La postura del padre cambia. Se inclina hacia adelante y comienza a resolver problemas en vez de acusar.',
      options: [
        { text: 'Resolucion de Conflictos', isCorrect: false },
        { text: 'Escucha Activa', isCorrect: false },
        { text: 'Protocolo de Alianza con Padres', isCorrect: false },
        { text: 'Postura de Coaching', isCorrect: true },
      ],
      correctName: 'Postura de Coaching',
      description: 'Usar curiosidad e indagacion genuina en vez de defensa cuando se enfrenta una queja. "Que le gustaria que hiciera diferente?" cambia la dinamica de adversarial a colaborativa. La postura de coaching funciona con cualquiera, no solo en relaciones formales de coaching.',
      research: 'Epstein (2018) encontro que las relaciones padre-maestro mejoran mas cuando los educadores responden a las criticas con curiosidad en vez de justificacion.',
    },
  },
  // ─── 16: Boundary Setting ─────────────────────────────────────────────────
  {
    id: 'ntm-boundary-setting',
    roles: ['teacher', 'para', 'coach', 'leader'],
    gradeBands: ['pk-2', '3-5', '6-8', '9-12'],
    category: 'wellness',
    en: {
      vignette: 'A colleague asks the educator to cover their lunch duty for the third time this month. The educator pauses, then says, "I am not able to cover today. I need my lunch break to reset before the afternoon." They say it kindly, without apologizing or offering an alternative. The colleague nods and asks someone else.',
      options: [
        { text: 'Assertive Communication', isCorrect: false },
        { text: 'Professional Distance', isCorrect: false },
        { text: 'Boundary Setting', isCorrect: true },
        { text: 'Self-Advocacy', isCorrect: false },
      ],
      correctName: 'Boundary Setting',
      description: 'Clearly stating a limit without over-explaining, apologizing, or offering alternatives. Effective boundary setting is brief, kind, and complete. The educator names what they need without making the other person wrong.',
      research: 'Maslach and Leiter (2016) found that educators who set consistent boundaries around their non-instructional time report 34% lower burnout rates than those who routinely accommodate requests at their own expense.',
    },
    es: {
      vignette: 'Un colega le pide al educador cubrir su turno de almuerzo por tercera vez este mes. El educador hace una pausa, luego dice, "No puedo cubrir hoy. Necesito mi descanso de almuerzo para reiniciarme antes de la tarde." Lo dice amablemente, sin disculparse ni ofrecer una alternativa. El colega asiente y le pregunta a otra persona.',
      options: [
        { text: 'Comunicacion Asertiva', isCorrect: false },
        { text: 'Distancia Profesional', isCorrect: false },
        { text: 'Establecer Limites', isCorrect: true },
        { text: 'Auto-defensa', isCorrect: false },
      ],
      correctName: 'Establecer Limites',
      description: 'Declarar claramente un limite sin sobre-explicar, disculparse u ofrecer alternativas. Establecer limites efectivamente es breve, amable y completo. El educador nombra lo que necesita sin hacer que la otra persona este mal.',
      research: 'Maslach y Leiter (2016) encontraron que los educadores que establecen limites consistentes alrededor de su tiempo no instruccional reportan tasas de agotamiento 34% mas bajas que los que rutinariamente acomodan solicitudes a su propio costo.',
    },
  },
  // ─── 17: Think-Pair-Share ─────────────────────────────────────────────────
  {
    id: 'ntm-think-pair-share',
    roles: ['teacher', 'para', 'coach'],
    gradeBands: ['pk-2', '3-5', '6-8', '9-12'],
    category: 'instructional',
    en: {
      vignette: 'The educator asks a complex question, then says, "Take 30 seconds to think about your answer silently." After the think time, they say, "Now turn to your partner and share your thinking for 60 seconds each." Finally, they call on pairs to share out. Every student in the room has processed the question before any hand goes up.',
      options: [
        { text: 'Collaborative Discussion', isCorrect: false },
        { text: 'Think-Pair-Share', isCorrect: true },
        { text: 'Turn and Talk', isCorrect: false },
        { text: 'Accountable Talk Protocol', isCorrect: false },
      ],
      correctName: 'Think-Pair-Share',
      description: 'A three-step cooperative structure: individual think time, partner discussion, then whole-group sharing. The structure ensures that every student has formulated and rehearsed a response before being asked to share publicly.',
      research: 'Lyman (1981) developed Think-Pair-Share as a response to the finding that traditional questioning only engages the 3 to 5 fastest-processing students in a class of 30.',
    },
    es: {
      vignette: 'El educador hace una pregunta compleja, luego dice, "Toma 30 segundos para pensar tu respuesta en silencio." Despues del tiempo de pensar, dice, "Ahora voltea con tu companero y comparte tu pensamiento por 60 segundos cada uno." Finalmente, llama a las parejas a compartir. Cada estudiante en el salon ha procesado la pregunta antes de que una mano se levante.',
      options: [
        { text: 'Discusion Colaborativa', isCorrect: false },
        { text: 'Pensar-Compartir-Discutir', isCorrect: true },
        { text: 'Voltear y Hablar', isCorrect: false },
        { text: 'Protocolo de Conversacion Responsable', isCorrect: false },
      ],
      correctName: 'Pensar-Compartir-Discutir',
      description: 'Una estructura cooperativa de tres pasos: tiempo individual para pensar, discusion con companero, luego compartir en grupo completo. La estructura asegura que cada estudiante ha formulado y ensayado una respuesta antes de que se le pida compartir publicamente.',
      research: 'Lyman (1981) desarrollo Pensar-Compartir-Discutir como respuesta al hallazgo de que las preguntas tradicionales solo involucran a los 3 a 5 estudiantes de procesamiento mas rapido en una clase de 30.',
    },
  },
]
