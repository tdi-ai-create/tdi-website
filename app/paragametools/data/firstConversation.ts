// The First Conversation: Opening-week interactions that set the tone
// Every scenario shows a ripple effect across 3 timeframes

export type Role = 'teacher' | 'para' | 'coach' | 'leader'
export type GradeBand = 'pk-2' | '3-5' | '6-8' | '9-12'
export type Season = 'first_year' | '2-5' | '6-15' | '16+'

export interface RippleEffect {
  moment: string
  week: string
  month: string
}

export interface Choice {
  text: string
  ripple: RippleEffect
  score: 'strong' | 'okay' | 'miss'
  why: string
  research: string
}

export interface Scenario {
  id: string
  roles: Role[]
  gradeBands: GradeBand[]
  en: {
    setup: string
    context: string
    choices: Choice[]
    beenThereStat: string
    skillTag: string
  }
  es: {
    setup: string
    context: string
    choices: Choice[]
    beenThereStat: string
    skillTag: string
  }
}

export const SCENARIO_COUNT = 8

export const SKILL_TAGS = {
  en: {
    relational_trust: 'Relational Trust',
    first_impression: 'First Impression',
    tone_setting: 'Tone Setting',
    repair: 'Repair',
    boundary: 'Boundary',
    partnership: 'Partnership',
    vulnerability: 'Vulnerability',
    presence: 'Presence',
  },
  es: {
    relational_trust: 'Confianza Relacional',
    first_impression: 'Primera Impresion',
    tone_setting: 'Establecer el Tono',
    repair: 'Reparacion',
    boundary: 'Limite',
    partnership: 'Alianza',
    vulnerability: 'Vulnerabilidad',
    presence: 'Presencia',
  },
}

export const SCENARIOS: Scenario[] = [
  // ─── SCENARIO 1: First parent email ──────────────────────────────────────
  {
    id: 'fc-parent-email',
    roles: ['teacher', 'para', 'coach', 'leader'],
    gradeBands: ['pk-2', '3-5', '6-8', '9-12'],
    en: {
      setup: 'A parent emails you the night before school starts.',
      context: '"Hi, I just wanted to let you know that my child had a really hard year last year. Their previous teacher and I did not see eye to eye. I am hoping this year will be different."',
      choices: [
        {
          text: 'Reply immediately with a warm, detailed message about your classroom and how much you care about every student.',
          ripple: {
            moment: 'The parent reads your message and feels relieved. They text their spouse: "This teacher seems great."',
            week: 'The parent volunteers to help with a classroom project. They mention your email to other parents at pickup.',
            month: 'This parent becomes your biggest advocate. When a tough situation comes up in October, they give you the benefit of the doubt because trust was built early.',
          },
          score: 'strong',
          why: 'Leading with warmth before the first day signals that you see the parent as a partner, not a problem. The speed of your response matters. Within 24 hours says "you are a priority."',
          research: 'Bryk and Schneider found that relational trust is the single strongest predictor of school improvement. Trust is built through respect, competence, personal regard, and integrity. This email hits three of four.',
        },
        {
          text: 'Reply briefly: "Thanks for reaching out. Looking forward to a great year!"',
          ripple: {
            moment: 'The parent reads it and thinks: "Okay, short but positive. We will see."',
            week: 'The parent drops off their child but does not introduce themselves. They are still in wait-and-see mode.',
            month: 'When a small issue comes up in October, the parent emails with a slightly defensive tone. The relationship never fully warmed up because the opening was surface-level.',
          },
          score: 'okay',
          why: 'Brief is not bad, but this parent gave you a vulnerable opening. A surface reply to a vulnerable message communicates "I did not really hear you." The door is still open but the moment was not fully used.',
          research: 'Epstein\'s framework for school-family partnerships identifies two-way communication as the foundation. A brief reply is one-way. It closes the loop without opening a relationship.',
        },
        {
          text: 'Wait until after the first week to reply so you can speak to their child\'s actual experience in your class.',
          ripple: {
            moment: 'The parent checks their email three times that night. No reply. They start worrying.',
            week: 'The parent shows up on Day 1 guarded. They watch your every move at pickup. A week of silence after a vulnerable email feels like being ignored.',
            month: 'By October, this parent has already decided you are "just like last year." Every interaction starts from a deficit. You spend the rest of the year trying to rebuild trust you never built.',
          },
          score: 'miss',
          why: 'Waiting makes logical sense but misses the emotional reality. This parent took a risk by emailing before school even started. Silence after vulnerability feels like rejection. The data you wanted to gather does not matter if the relationship is already damaged.',
          research: 'Hattie\'s research shows teacher-student relationships have an effect size of 0.72. But those relationships are mediated through parent trust. Henderson and Mapp found that schools that proactively engage families see a 25-30% increase in student achievement.',
        },
      ],
      beenThereStat: '78% of educators have received a "last year was hard" email from a parent',
      skillTag: 'relational_trust',
    },
    es: {
      setup: 'Un padre te envia un correo la noche antes del inicio de clases.',
      context: '"Hola, solo queria hacerle saber que mi hijo tuvo un ano muy dificil el ano pasado. Su maestra anterior y yo no nos entendimos bien. Espero que este ano sea diferente."',
      choices: [
        {
          text: 'Responde inmediatamente con un mensaje calido y detallado sobre tu salon y cuanto te importa cada estudiante.',
          ripple: {
            moment: 'El padre lee tu mensaje y siente alivio. Le escribe a su pareja: "Esta maestra parece genial."',
            week: 'El padre se ofrece como voluntario para un proyecto del salon. Menciona tu correo a otros padres en la recogida.',
            month: 'Este padre se convierte en tu mayor aliado. Cuando surge una situacion dificil en octubre, te dan el beneficio de la duda porque la confianza se construyo temprano.',
          },
          score: 'strong',
          why: 'Liderar con calidez antes del primer dia senala que ves al padre como un aliado, no un problema. La velocidad de tu respuesta importa. Dentro de 24 horas dice "eres una prioridad."',
          research: 'Bryk y Schneider encontraron que la confianza relacional es el predictor mas fuerte de mejora escolar. La confianza se construye a traves del respeto, competencia, consideracion personal e integridad.',
        },
        {
          text: 'Responde brevemente: "Gracias por escribir. Esperamos un gran ano!"',
          ripple: {
            moment: 'El padre lo lee y piensa: "Bueno, corto pero positivo. Ya veremos."',
            week: 'El padre deja a su hijo pero no se presenta. Sigue en modo de esperar y ver.',
            month: 'Cuando surge un pequeno problema en octubre, el padre escribe con un tono ligeramente defensivo. La relacion nunca se calento porque la apertura fue superficial.',
          },
          score: 'okay',
          why: 'Breve no es malo, pero este padre te dio una apertura vulnerable. Una respuesta superficial a un mensaje vulnerable comunica "realmente no te escuche."',
          research: 'El marco de Epstein para alianzas escuela-familia identifica la comunicacion bidireccional como la base. Una respuesta breve es unidireccional.',
        },
        {
          text: 'Espera hasta despues de la primera semana para responder y poder hablar sobre la experiencia real de su hijo en tu clase.',
          ripple: {
            moment: 'El padre revisa su correo tres veces esa noche. Sin respuesta. Empieza a preocuparse.',
            week: 'El padre llega el Dia 1 a la defensiva. Te observa en cada recogida. Una semana de silencio despues de un correo vulnerable se siente como ser ignorado.',
            month: 'Para octubre, este padre ya decidio que eres "igual que el ano pasado." Cada interaccion comienza desde un deficit.',
          },
          score: 'miss',
          why: 'Esperar tiene logica pero pierde la realidad emocional. Este padre tomo un riesgo al escribir antes de que empezaran las clases. El silencio despues de la vulnerabilidad se siente como rechazo.',
          research: 'La investigacion de Hattie muestra que las relaciones maestro-estudiante tienen un tamano de efecto de 0.72. Henderson y Mapp encontraron que las escuelas que involucran proactivamente a las familias ven un aumento del 25-30% en el rendimiento estudiantil.',
        },
      ],
      beenThereStat: '78% de los educadores han recibido un correo de "el ano pasado fue dificil" de un padre',
      skillTag: 'relational_trust',
    },
  },

  // ─── SCENARIO 2: Student tests you on Day 1 ─────────────────────────────
  {
    id: 'fc-student-test',
    roles: ['teacher', 'para'],
    gradeBands: ['3-5', '6-8', '9-12'],
    en: {
      setup: 'It is Day 1. During your intro activity, a student says loudly enough for the class to hear:',
      context: '"This is boring. Are we going to do real stuff or just play games all year?"',
      choices: [
        {
          text: 'Pause, make eye contact, and say calmly: "I hear you. Tell me what real stuff looks like to you. I genuinely want to know."',
          ripple: {
            moment: 'The room goes quiet. The student was expecting a power struggle. Your curiosity disarms them. They mumble something about wanting to do hands-on projects.',
            week: 'That student approaches you after class on Day 3 to ask about an assignment. They would not have done that if Day 1 had gone differently.',
            month: 'By October, this student is one of your most engaged. They tell a friend: "That teacher actually listens." You did not win them over with a lesson plan. You won them over by not reacting.',
          },
          score: 'strong',
          why: 'The student was testing whether you would react like every other adult. Curiosity instead of authority breaks the pattern. Asking "what does real stuff look like to you" gives them voice without surrendering control.',
          research: 'Marzano\'s research on classroom management identifies the quality of teacher-student relationships as the foundational element. Students who feel heard in the first interaction are 31% more likely to engage in the first month.',
        },
        {
          text: 'Smile and say: "Fair enough. Let\'s get through the intro and then we will get into the good stuff. Trust me."',
          ripple: {
            moment: 'The student shrugs. A few other students laugh. The energy moves on.',
            week: 'The student is neutral toward you. Not hostile, not engaged. They are watching to see if the "good stuff" actually comes.',
            month: 'If your lessons deliver, this student slowly warms up. If not, they become quietly disengaged by October. The "trust me" created a promise you now have to keep.',
          },
          score: 'okay',
          why: 'This deflects the moment without escalating, which is fine. But "trust me" puts the burden on future performance instead of building connection now. The student still does not feel heard.',
          research: 'Curwin, Mendler, and Mendler found that students who feel unheard in early interactions require 2-3x more effort to re-engage later. A missed connection on Day 1 is recoverable but costly.',
        },
        {
          text: 'Address it directly: "In this class, we respect the activities I plan. If you give it a chance, you might be surprised."',
          ripple: {
            moment: 'The student crosses their arms. A few classmates exchange looks. You won the moment but lost the student.',
            week: 'That student does the minimum. They do not disrupt, but they do not engage. They have categorized you as another adult who prioritizes control over connection.',
            month: 'By October, this student is a ghost. Present but not participating. When a behavior issue comes up later, they refuse to talk to you about it. "She does not listen anyway."',
          },
          score: 'miss',
          why: 'This response prioritizes your authority over the relationship. It works in the moment but signals to the whole class that disagreement is not welcome. The student was not being disrespectful. They were being honest.',
          research: 'Kleinfeld\'s research on warm demanders shows that the most effective educators combine high expectations with personal warmth. Leading with authority before relationship creates compliance, not engagement.',
        },
      ],
      beenThereStat: '84% of educators have had a student publicly challenge an activity on Day 1',
      skillTag: 'tone_setting',
    },
    es: {
      setup: 'Es el Dia 1. Durante tu actividad de introduccion, un estudiante dice lo suficientemente fuerte para que la clase escuche:',
      context: '"Esto es aburrido. Vamos a hacer cosas de verdad o solo vamos a jugar todo el ano?"',
      choices: [
        {
          text: 'Pausa, haz contacto visual y di con calma: "Te escucho. Dime como se ve lo de verdad para ti. De verdad quiero saber."',
          ripple: {
            moment: 'El salon se queda en silencio. El estudiante esperaba una lucha de poder. Tu curiosidad los desarma. Murmuran algo sobre querer hacer proyectos practicos.',
            week: 'Ese estudiante se acerca despues de clase el Dia 3 para preguntar sobre una tarea. No lo habria hecho si el Dia 1 hubiera sido diferente.',
            month: 'Para octubre, este estudiante es uno de los mas comprometidos. Le dice a un amigo: "Esa maestra realmente escucha."',
          },
          score: 'strong',
          why: 'El estudiante estaba probando si reaccionarias como todos los demas adultos. La curiosidad en lugar de la autoridad rompe el patron.',
          research: 'La investigacion de Marzano sobre manejo del salon identifica la calidad de las relaciones maestro-estudiante como el elemento fundamental. Los estudiantes que se sienten escuchados en la primera interaccion tienen un 31% mas de probabilidad de comprometerse en el primer mes.',
        },
        {
          text: 'Sonrie y di: "Punto valido. Terminemos la intro y despues vamos con lo bueno. Confien en mi."',
          ripple: {
            moment: 'El estudiante se encoge de hombros. Algunos rien. La energia sigue.',
            week: 'El estudiante es neutral contigo. No hostil, no comprometido. Estan viendo si "lo bueno" realmente llega.',
            month: 'Si tus lecciones cumplen, este estudiante se abre lentamente. Si no, se desconectan silenciosamente para octubre.',
          },
          score: 'okay',
          why: 'Esto desvía el momento sin escalar, lo cual esta bien. Pero "confien en mi" pone la carga en el rendimiento futuro en lugar de construir conexion ahora.',
          research: 'Curwin, Mendler y Mendler encontraron que los estudiantes que no se sienten escuchados en las primeras interacciones requieren 2-3 veces mas esfuerzo para re-involucrarlos despues.',
        },
        {
          text: 'Abordalo directamente: "En esta clase, respetamos las actividades que planeo. Si le das una oportunidad, te podrias sorprender."',
          ripple: {
            moment: 'El estudiante cruza los brazos. Algunos companeros intercambian miradas. Ganaste el momento pero perdiste al estudiante.',
            week: 'Ese estudiante hace lo minimo. No interrumpe, pero no participa. Te han categorizado como otro adulto que prioriza el control sobre la conexion.',
            month: 'Para octubre, este estudiante es un fantasma. Presente pero no participando.',
          },
          score: 'miss',
          why: 'Esta respuesta prioriza tu autoridad sobre la relacion. Funciona en el momento pero senala a toda la clase que el desacuerdo no es bienvenido.',
          research: 'La investigacion de Kleinfeld sobre demandantes calidos muestra que los educadores mas efectivos combinan altas expectativas con calidez personal.',
        },
      ],
      beenThereStat: '84% de los educadores han tenido un estudiante que desafio publicamente una actividad el Dia 1',
      skillTag: 'tone_setting',
    },
  },

  // ─── SCENARIO 3: First hallway interaction with a colleague ─────────────
  {
    id: 'fc-colleague-hallway',
    roles: ['teacher', 'para', 'coach', 'leader'],
    gradeBands: ['pk-2', '3-5', '6-8', '9-12'],
    en: {
      setup: 'You are walking to your room on Day 1. A colleague you do not know well stops you in the hallway and says:',
      context: '"Hey, just so you know, the kid in 4B? Total nightmare last year. Good luck with that one."',
      choices: [
        {
          text: '"Thanks for the heads up. I like to start fresh with every kid though. We will see how it goes."',
          ripple: {
            moment: 'The colleague nods, maybe a little surprised. You kept it light without being preachy.',
            week: 'You meet the student with no preconceptions. They sense it. On Day 3, the student smiles at you in the hallway, something they rarely did last year.',
            month: 'By October, this student has had zero major incidents in your class. The colleague asks you: "What are you doing differently?" The answer is: you started without a story about who they were.',
          },
          score: 'strong',
          why: 'You acknowledged the colleague without adopting their bias. "I like to start fresh" is firm but not judgmental. It protects the student and the relationship with the colleague.',
          research: 'Rosenthal and Jacobson\'s Pygmalion Effect research showed that teacher expectations directly shape student outcomes. Students who are expected to succeed outperform those who are expected to fail, even when ability levels are identical. Starting fresh is not naive. It is evidence-based.',
        },
        {
          text: '"Oh really? What happened?" and listen to the full story.',
          ripple: {
            moment: 'You now have a detailed narrative about this student. Every behavior they showed last year. Every call home. Every suspension.',
            week: 'On Day 2, this student bumps another student in line. Your brain immediately connects it to the story you heard. You intervene faster and more firmly than you would have otherwise.',
            month: 'By October, the student has confirmed the narrative. Not because they were destined to, but because you were watching for it. Confirmation bias shaped every interaction.',
          },
          score: 'miss',
          why: 'Listening feels like being informed. But absorbing a colleague\'s entire negative narrative creates a lens you cannot unsee. You will watch this student differently than every other student from Day 1.',
          research: 'Confirmation bias research (Nickerson, 1998) shows that once we form an expectation, we unconsciously seek evidence that confirms it and dismiss evidence that contradicts it. A pre-loaded narrative about a student is almost impossible to override.',
        },
        {
          text: '"I appreciate you looking out for me, but I would rather not know. I want to meet them myself."',
          ripple: {
            moment: 'The colleague looks slightly offended. They were trying to help. There is an awkward beat.',
            week: 'The colleague avoids you a little. They told another teacher you were "one of those." The relationship is slightly strained.',
            month: 'You meet the student without bias and the relationship goes well. But the colleague tension lingers. In November, when you need a favor, they are less willing to help.',
          },
          score: 'okay',
          why: 'The instinct is right but the delivery is too blunt. "I would rather not know" can sound like a rejection of the colleague\'s experience. The first option accomplished the same thing without creating friction.',
          research: 'Bryk and Schneider\'s work on relational trust in schools shows that professional relationships depend on mutual respect. Dismissing a colleague\'s input, even when the input is harmful, damages trust networks that educators rely on for support.',
        },
      ],
      beenThereStat: '91% of educators have been warned about a student by a colleague before meeting them',
      skillTag: 'first_impression',
    },
    es: {
      setup: 'Caminas a tu salon el Dia 1. Un colega que no conoces bien te detiene en el pasillo y dice:',
      context: '"Oye, solo para que sepas, el nino de 4B? Una pesadilla total el ano pasado. Buena suerte con ese."',
      choices: [
        {
          text: '"Gracias por el aviso. Pero me gusta empezar de cero con cada nino. Ya veremos como va."',
          ripple: {
            moment: 'El colega asiente, quizas un poco sorprendido. Lo mantuviste ligero sin ser moralista.',
            week: 'Conoces al estudiante sin preconcepciones. Lo perciben. El Dia 3, el estudiante te sonrie en el pasillo.',
            month: 'Para octubre, este estudiante ha tenido cero incidentes mayores en tu clase. El colega te pregunta: "Que estas haciendo diferente?"',
          },
          score: 'strong',
          why: 'Reconociste al colega sin adoptar su sesgo. "Me gusta empezar de cero" es firme pero no critico.',
          research: 'La investigacion del Efecto Pigmalion de Rosenthal y Jacobson mostro que las expectativas del maestro moldean directamente los resultados del estudiante. Empezar de cero no es ingenuo. Esta basado en evidencia.',
        },
        {
          text: '"Ah si? Que paso?" y escuchas toda la historia.',
          ripple: {
            moment: 'Ahora tienes una narrativa detallada sobre este estudiante. Cada comportamiento del ano pasado.',
            week: 'El Dia 2, este estudiante empuja a otro en la fila. Tu cerebro inmediatamente lo conecta con la historia que escuchaste.',
            month: 'Para octubre, el estudiante ha confirmado la narrativa. No porque estuviera destinado, sino porque lo estabas buscando.',
          },
          score: 'miss',
          why: 'Escuchar se siente como estar informado. Pero absorber toda la narrativa negativa de un colega crea un lente que no puedes dejar de ver.',
          research: 'La investigacion sobre sesgo de confirmacion (Nickerson, 1998) muestra que una vez que formamos una expectativa, inconscientemente buscamos evidencia que la confirme.',
        },
        {
          text: '"Aprecio que me cuides, pero preferiria no saber. Quiero conocerlos yo mismo."',
          ripple: {
            moment: 'El colega se ve ligeramente ofendido. Estaban tratando de ayudar. Hay un momento incomodo.',
            week: 'El colega te evita un poco. Le dijeron a otro maestro que eras "de esos." La relacion esta algo tensa.',
            month: 'Conoces al estudiante sin sesgo y la relacion va bien. Pero la tension con el colega persiste.',
          },
          score: 'okay',
          why: 'El instinto es correcto pero la entrega es muy directa. "Preferiria no saber" puede sonar como un rechazo a la experiencia del colega.',
          research: 'El trabajo de Bryk y Schneider sobre confianza relacional muestra que las relaciones profesionales dependen del respeto mutuo.',
        },
      ],
      beenThereStat: '91% de los educadores han sido advertidos sobre un estudiante por un colega antes de conocerlo',
      skillTag: 'first_impression',
    },
  },

  // ─── SCENARIO 4: First team meeting ─────────────────────────────────────
  {
    id: 'fc-team-meeting',
    roles: ['teacher', 'para', 'coach', 'leader'],
    gradeBands: ['pk-2', '3-5', '6-8', '9-12'],
    en: {
      setup: 'It is the first team meeting of the year. The agenda is packed. A veteran colleague says:',
      context: '"Can we skip the icebreaker? We all know each other. Let\'s just get to the real work."',
      choices: [
        {
          text: '"I hear you. What if we do a 2-minute version? Quick check-in: one word for how you are feeling about the year. Then we move."',
          ripple: {
            moment: 'The veteran agrees. Everyone shares one word. Three people say "anxious." The room softens. Nobody expected that level of honesty in under 2 minutes.',
            week: 'At the second meeting, the veteran is the first one to speak during the check-in. Without being asked.',
            month: 'By October, this team has the strongest communication in the building. Other teams ask what you are doing differently. The answer: you made space for honesty in the first 2 minutes.',
          },
          score: 'strong',
          why: 'You honored the veteran\'s concern (time matters) while protecting the purpose (connection matters). Offering a compressed version shows you are not rigid about the format, just committed to the intent.',
          research: 'Google\'s Project Aristotle found that psychological safety is the number one predictor of high-performing teams. Teams that check in emotionally before diving into tasks outperform those that skip connection by 40% on collaborative problem-solving.',
        },
        {
          text: '"You know what, you are right. Let\'s dive in." and skip the icebreaker.',
          ripple: {
            moment: 'The team gets straight to business. The meeting is efficient. A few newer members sit quietly, feeling like outsiders.',
            week: 'The newer team members hesitate to share ideas at the next meeting. The veteran dominates. The dynamic is set.',
            month: 'By October, two newer members stop coming to optional meetings. "I do not feel like I belong on this team." The efficiency you gained in September cost you in October.',
          },
          score: 'miss',
          why: 'Deferring to the loudest voice in the room signals that seniority equals authority. The newer members needed the icebreaker the most. Skipping it told them this team is not for them.',
          research: 'Edmondson\'s research on psychological safety shows that teams where one voice dominates produce 60% fewer ideas than teams where contributions are distributed. Who speaks first sets the pattern for who speaks at all.',
        },
        {
          text: '"I think the icebreaker is important for setting the tone. Let\'s do the full version as planned."',
          ripple: {
            moment: 'The veteran rolls their eyes. The icebreaker happens but feels forced. The veteran disengages.',
            week: 'The veteran makes a comment to another colleague: "New teachers and their icebreakers." You have been categorized.',
            month: 'The team functions but there is an undercurrent. The veteran respects your content knowledge but questions your facilitation. Every meeting has a low-level tension.',
          },
          score: 'okay',
          why: 'Your instinct to protect the icebreaker is right, but overriding a veteran in front of the group creates a power dynamic. You won the activity but lost the relationship. The first option achieved both.',
          research: 'Fullan\'s work on educational change shows that veteran buy-in is essential for sustainable team culture. Mandating activities that veterans resist creates surface compliance without genuine engagement.',
        },
      ],
      beenThereStat: '72% of educators have been in a meeting where someone wanted to skip the relationship-building activity',
      skillTag: 'tone_setting',
    },
    es: {
      setup: 'Es la primera reunion de equipo del ano. La agenda esta llena. Un colega veterano dice:',
      context: '"Podemos saltarnos el rompehielos? Todos nos conocemos. Vamos directo al trabajo real."',
      choices: [
        {
          text: '"Te escucho. Que tal una version de 2 minutos? Check-in rapido: una palabra de como se sienten sobre el ano. Luego avanzamos."',
          ripple: {
            moment: 'El veterano acepta. Todos comparten una palabra. Tres personas dicen "ansioso." El salon se suaviza.',
            week: 'En la segunda reunion, el veterano es el primero en hablar durante el check-in. Sin que se lo pidan.',
            month: 'Para octubre, este equipo tiene la comunicacion mas fuerte del edificio.',
          },
          score: 'strong',
          why: 'Honraste la preocupacion del veterano (el tiempo importa) mientras protegias el proposito (la conexion importa).',
          research: 'El Proyecto Aristotle de Google encontro que la seguridad psicologica es el predictor numero uno de equipos de alto rendimiento. Los equipos que hacen check-in emocional superan a los que lo omiten en un 40%.',
        },
        {
          text: '"Sabes que, tienes razon. Vamos directo." y te saltas el rompehielos.',
          ripple: {
            moment: 'El equipo va directo al negocio. La reunion es eficiente. Los miembros mas nuevos se sientan en silencio.',
            week: 'Los miembros mas nuevos dudan en compartir ideas en la siguiente reunion. El veterano domina.',
            month: 'Para octubre, dos miembros nuevos dejan de asistir a reuniones opcionales. "No siento que pertenezco a este equipo."',
          },
          score: 'miss',
          why: 'Ceder ante la voz mas fuerte del salon senala que la antiguedad equivale a autoridad.',
          research: 'La investigacion de Edmondson sobre seguridad psicologica muestra que los equipos donde una voz domina producen 60% menos ideas.',
        },
        {
          text: '"Creo que el rompehielos es importante para establecer el tono. Hagamos la version completa como estaba planeado."',
          ripple: {
            moment: 'El veterano pone los ojos en blanco. El rompehielos sucede pero se siente forzado.',
            week: 'El veterano comenta a otro colega: "Maestros nuevos y sus rompehielos." Te han categorizado.',
            month: 'El equipo funciona pero hay una corriente subterranea. El veterano respeta tu contenido pero cuestiona tu facilitacion.',
          },
          score: 'okay',
          why: 'Tu instinto de proteger el rompehielos es correcto, pero anular a un veterano frente al grupo crea una dinamica de poder.',
          research: 'El trabajo de Fullan sobre cambio educativo muestra que la aceptacion de los veteranos es esencial para una cultura de equipo sostenible.',
        },
      ],
      beenThereStat: '72% de los educadores han estado en una reunion donde alguien quiso saltarse la actividad de construccion de relaciones',
      skillTag: 'tone_setting',
    },
  },

  // ─── SCENARIO 5: Crying student before school starts ────────────────────
  {
    id: 'fc-crying-student',
    roles: ['teacher', 'para'],
    gradeBands: ['pk-2', '3-5'],
    en: {
      setup: 'It is the first morning. A student arrives crying and clinging to their parent at the door.',
      context: 'The parent looks at you and mouths: "This is their first time away from me all day. Please help."',
      choices: [
        {
          text: 'Kneel to the student\'s level. "I can see this is hard. Your person will be back. Want to come see something cool at my desk while we wait for the day to start?"',
          ripple: {
            moment: 'The student sniffles but takes your hand. The parent exhales. You just took the weight off their shoulders without making it a scene.',
            week: 'By Day 3, this student runs to your desk every morning to check for the "something cool." The crying stopped on Day 2. The ritual replaced the fear.',
            month: 'In October, this student draws a picture of you for their parent. The parent sends you a photo with the message: "You made school safe for my baby." That picture stays on your fridge all year.',
          },
          score: 'strong',
          why: 'You validated the emotion ("I can see this is hard"), gave a concrete comfort ("your person will be back"), and redirected with curiosity, not force. You also gave the parent an exit that did not feel like abandonment.',
          research: 'Dr. Bruce Perry\'s neurosequential model shows that a dysregulated child cannot process logic until they feel safe. Regulate, then relate, then reason. Kneeling to their level activates co-regulation. Redirection to curiosity engages the cortex.',
        },
        {
          text: '"It is going to be okay! We are going to have so much fun today!" with big energy.',
          ripple: {
            moment: 'The student cries harder. Your excitement feels like you do not understand their fear. The parent winces.',
            week: 'The student calms down eventually but not because of you. They calmed down because another student befriended them at recess. You missed the window.',
            month: 'The student is fine by October but does not have a strong connection with you. They go to the other student for comfort, not you. You are the teacher. They needed you to be the safe adult.',
          },
          score: 'okay',
          why: 'Enthusiasm feels like the right move but it dismisses the child\'s emotion. "It is going to be okay" is an adult comfort, not a child comfort. Kids need to feel that their big feelings are allowed before they can move past them.',
          research: 'Gottman\'s research on emotional coaching shows that dismissing a child\'s emotions ("It will be fine!") teaches them that their feelings are wrong. Labeling the emotion first ("I see you are scared") helps them process it 40% faster.',
        },
        {
          text: 'Look at the parent and say: "The best thing is a quick goodbye. They usually stop crying within 5 minutes."',
          ripple: {
            moment: 'The parent pulls away. The student screams. Other parents are watching. The hallway feels chaotic.',
            week: 'The student cries every morning for the first week. They eventually stop, but not because they feel safe. They stop because they gave up expecting comfort.',
            month: 'This student is compliant but not connected. They follow rules but do not seek you out. When asked "Do you like school?" they say: "It is okay." That "okay" should have been "I love it."',
          },
          score: 'miss',
          why: 'You were right about the data. Most kids do stop crying within 5 minutes. But the question is not how fast they stop crying. It is why they stop. Giving up is not the same as feeling safe.',
          research: 'Attachment theory research (Bowlby, Ainsworth) shows that children who experience consistent, responsive care develop secure attachment. Children who learn that their distress is met with efficiency rather than empathy develop avoidant attachment patterns.',
        },
      ],
      beenThereStat: '89% of PK-5 educators have had a crying child at drop-off in the first week',
      skillTag: 'presence',
    },
    es: {
      setup: 'Es la primera manana. Un estudiante llega llorando y aferrandose a su padre en la puerta.',
      context: 'El padre te mira y articula sin sonido: "Es la primera vez que esta lejos de mi todo el dia. Por favor ayuda."',
      choices: [
        {
          text: 'Arrodillate al nivel del estudiante. "Puedo ver que esto es dificil. Tu persona va a regresar. Quieres venir a ver algo genial en mi escritorio mientras esperamos que empiece el dia?"',
          ripple: {
            moment: 'El estudiante sorbe pero toma tu mano. El padre exhala. Tomaste el peso de sus hombros sin hacer una escena.',
            week: 'Para el Dia 3, este estudiante corre a tu escritorio cada manana a buscar lo "genial." El llanto paro el Dia 2.',
            month: 'En octubre, este estudiante dibuja una foto tuya para su padre. El padre te envia una foto: "Hiciste que la escuela fuera segura para mi bebe."',
          },
          score: 'strong',
          why: 'Validaste la emocion, diste un consuelo concreto y redirigiste con curiosidad, no fuerza.',
          research: 'El modelo neurosecuencial del Dr. Bruce Perry muestra que un nino desregulado no puede procesar logica hasta que se siente seguro. Regular, luego relacionar, luego razonar.',
        },
        {
          text: '"Va a estar bien! Vamos a divertirnos mucho hoy!" con mucha energia.',
          ripple: {
            moment: 'El estudiante llora mas fuerte. Tu entusiasmo se siente como que no entiendes su miedo.',
            week: 'El estudiante se calma eventualmente pero no por ti. Se calmaron porque otro estudiante los hizo amigos en el recreo.',
            month: 'El estudiante esta bien para octubre pero no tiene una conexion fuerte contigo.',
          },
          score: 'okay',
          why: 'El entusiasmo se siente como el movimiento correcto pero desestima la emocion del nino.',
          research: 'La investigacion de Gottman sobre coaching emocional muestra que desestimar las emociones de un nino les ensena que sus sentimientos estan mal. Nombrar la emocion primero les ayuda a procesarla 40% mas rapido.',
        },
        {
          text: 'Mira al padre y di: "Lo mejor es una despedida rapida. Generalmente dejan de llorar en 5 minutos."',
          ripple: {
            moment: 'El padre se aleja. El estudiante grita. Otros padres estan mirando.',
            week: 'El estudiante llora cada manana durante la primera semana. Eventualmente paran, pero no porque se sientan seguros. Paran porque dejaron de esperar consuelo.',
            month: 'Este estudiante es obediente pero no conectado. Sigue reglas pero no te busca.',
          },
          score: 'miss',
          why: 'Tenias razon sobre los datos. Pero la pregunta no es que tan rapido dejan de llorar. Es por que dejan de llorar. Rendirse no es lo mismo que sentirse seguro.',
          research: 'La investigacion de teoria del apego (Bowlby, Ainsworth) muestra que los ninos que experimentan cuidado consistente y receptivo desarrollan apego seguro.',
        },
      ],
      beenThereStat: '89% de los educadores PK-5 han tenido un nino llorando en la llegada durante la primera semana',
      skillTag: 'presence',
    },
  },

  // ─── SCENARIO 6: New para meets their lead teacher ──────────────────────
  {
    id: 'fc-para-meets-teacher',
    roles: ['para', 'teacher'],
    gradeBands: ['pk-2', '3-5', '6-8', '9-12'],
    en: {
      setup: 'You are a para starting in a new classroom. The lead teacher walks in, drops a binder on the table, and says:',
      context: '"Here is the schedule. Students arrive in 20 minutes. Any questions, ask me later. It is going to be a crazy day."',
      choices: [
        {
          text: '"Got it. I will follow your lead today. If there is one thing you want me to own right away, tell me and I am on it."',
          ripple: {
            moment: 'The teacher pauses. They were expecting you to either freeze or start asking a hundred questions. Your confidence without overstepping surprises them.',
            week: 'By Day 3, the teacher gives you your own small group. "You clearly know what you are doing." That one sentence on Day 1 earned you trust faster than a week of proving yourself.',
            month: 'By October, you and this teacher have a real partnership. They introduce you to parents as "my co-teacher." That started with showing up ready on Day 1.',
          },
          score: 'strong',
          why: 'You matched their energy without adding stress. "I will follow your lead" shows humility. "Tell me one thing to own" shows initiative. That combination is exactly what an overwhelmed teacher needs from a new para on Day 1.',
          research: 'Giangreco\'s research on paraprofessional effectiveness shows that the strongest para-teacher partnerships form when paras demonstrate initiative within the teacher\'s framework. Asking "what should I own" signals both competence and respect for the teacher\'s system.',
        },
        {
          text: '"Wait, can we talk about roles first? I want to make sure we are on the same page."',
          ripple: {
            moment: 'The teacher looks at the clock. "We have 20 minutes. Can we do this later?" You feel dismissed. They feel stressed.',
            week: 'The role conversation happens on Day 4, but it feels forced. The teacher already formed an impression: you need a lot of hand-holding.',
            month: 'The partnership is functional but never becomes collaborative. The teacher assigns tasks rather than sharing ownership. You feel like an aide, not a partner.',
          },
          score: 'okay',
          why: 'The instinct to clarify roles is correct. The timing is wrong. Day 1 morning with students arriving is not the time for a systems conversation. That conversation needs to happen, just not in the chaos of the first 20 minutes.',
          research: 'French and Bell\'s research on team formation shows that roles need to be clarified, but timing matters. Teams that try to establish norms during crisis underperform teams that establish norms during calm. Find the right 15 minutes later in the week.',
        },
        {
          text: 'Say nothing. Take the binder, read it, and figure things out on your own.',
          ripple: {
            moment: 'The teacher does not notice you. You fade into the background. On Day 1, that feels safe.',
            week: 'By Day 3, you are standing in the back of the room unsure of when to jump in. The teacher has not given you direction because they think you are fine.',
            month: 'By October, you are underutilized and frustrated. "Nobody tells me what to do." But nobody was going to. You needed to claim space early.',
          },
          score: 'miss',
          why: 'Silence on Day 1 does not protect you. It makes you invisible. The teacher is not ignoring you. They are drowning. If you do not say anything, they will assume you do not need anything. Then the pattern sets.',
          research: 'Research on paraprofessional retention (Ghere & York-Barr, 2007) shows that paras who feel underutilized leave at 3x the rate. The pattern of underutilization almost always starts in the first week when the para waits to be told what to do instead of offering.',
        },
      ],
      beenThereStat: '76% of paras have been handed a schedule with no context on their first day',
      skillTag: 'partnership',
    },
    es: {
      setup: 'Eres un para comenzando en un salon nuevo. El maestro principal entra, deja una carpeta en la mesa y dice:',
      context: '"Aqui esta el horario. Los estudiantes llegan en 20 minutos. Cualquier pregunta, preguntame despues. Va a ser un dia loco."',
      choices: [
        {
          text: '"Entendido. Te sigo hoy. Si hay una cosa que quieres que yo me encargue de inmediato, dime y lo hago."',
          ripple: {
            moment: 'El maestro pausa. Esperaban que te congelaras o hicieras cien preguntas. Tu confianza sin sobrepasar los sorprende.',
            week: 'Para el Dia 3, el maestro te da tu propio grupo pequeno. "Claramente sabes lo que haces."',
            month: 'Para octubre, tu y este maestro tienen una alianza real. Te presentan a los padres como "mi co-maestro."',
          },
          score: 'strong',
          why: 'Igualaste su energia sin agregar estres. "Te sigo" muestra humildad. "Dime una cosa que deba manejar" muestra iniciativa.',
          research: 'La investigacion de Giangreco sobre efectividad del paraprofesional muestra que las alianzas para-maestro mas fuertes se forman cuando los paras demuestran iniciativa dentro del marco del maestro.',
        },
        {
          text: '"Espera, podemos hablar de roles primero? Quiero asegurarme de que estemos en la misma pagina."',
          ripple: {
            moment: 'El maestro mira el reloj. "Tenemos 20 minutos. Podemos hacerlo despues?" Te sientes rechazado. Ellos se sienten estresados.',
            week: 'La conversacion de roles sucede el Dia 4, pero se siente forzada.',
            month: 'La alianza es funcional pero nunca se vuelve colaborativa. Te sientes como un asistente, no un socio.',
          },
          score: 'okay',
          why: 'El instinto de aclarar roles es correcto. El momento es incorrecto. La manana del Dia 1 con estudiantes llegando no es el momento para una conversacion de sistemas.',
          research: 'La investigacion de French y Bell sobre formacion de equipos muestra que los roles necesitan aclararse, pero el momento importa.',
        },
        {
          text: 'No dices nada. Tomas la carpeta, la lees e intentas resolver las cosas por tu cuenta.',
          ripple: {
            moment: 'El maestro no te nota. Te desvaneces en el fondo. El Dia 1, eso se siente seguro.',
            week: 'Para el Dia 3, estas parado al fondo del salon sin saber cuando intervenir.',
            month: 'Para octubre, estas subutilizado y frustrado. "Nadie me dice que hacer." Pero nadie iba a hacerlo.',
          },
          score: 'miss',
          why: 'El silencio el Dia 1 no te protege. Te hace invisible.',
          research: 'La investigacion sobre retencion de paraprofesionales (Ghere y York-Barr, 2007) muestra que los paras que se sienten subutilizados se van a una tasa 3 veces mayor.',
        },
      ],
      beenThereStat: '76% de los paras han recibido un horario sin contexto en su primer dia',
      skillTag: 'partnership',
    },
  },

  // ─── SCENARIO 7: Leader's opening day all-staff message ─────────────────
  {
    id: 'fc-leader-opening',
    roles: ['leader', 'coach'],
    gradeBands: ['pk-2', '3-5', '6-8', '9-12'],
    en: {
      setup: 'You are the building leader. It is the first all-staff meeting. You have 5 minutes for your opening remarks. You planned a polished speech about vision and goals. But you can feel the room. People are tired. Anxious. Some are already looking at their phones.',
      context: 'Do you stick with the plan or pivot?',
      choices: [
        {
          text: 'Ditch the speech. Say: "Before I talk about where we are going, I want to know how you are arriving. Take 30 seconds. Write one word on your notecard. How are you actually feeling right now?" Collect them. Read a few out loud. Then give a 2-minute version of your speech.',
          ripple: {
            moment: 'The room shifts. Someone wrote "terrified." Someone wrote "excited." Someone wrote "exhausted and it has not even started." You read them without commentary. People look around and realize they are not alone.',
            week: 'Three teachers mention the notecard moment to you independently. "That was the most real thing an admin has ever done in an opening meeting."',
            month: 'By October, when you ask for honest feedback, people actually give it. You trained them on Day 1 that honesty is safe here. That five minutes was worth more than any strategic plan.',
          },
          score: 'strong',
          why: 'Your staff does not need your vision on Day 1. They need to know you see them. A polished speech says "I prepared." A pivot says "I am paying attention to this room right now." Leaders who read the room earn more trust than leaders who deliver the plan.',
          research: 'Edmondson\'s research on psychological safety in organizations shows that leaders who model vulnerability in the first interaction create teams where error reporting increases by 26% and innovation increases by 19%. The notecard is not a gimmick. It is a signal: your feelings are data here.',
        },
        {
          text: 'Give the polished speech as planned. It is well-written and sets clear expectations for the year.',
          ripple: {
            moment: 'People listen politely. A few nod. Most are thinking about their classrooms. The speech is good but it does not land because the room was not ready to receive it.',
            week: 'Nobody quotes your speech back to you. Nobody brings it up. It was professional and forgettable.',
            month: 'When challenges arise in October, teachers do not come to you first. They go to each other. The opening meeting did not build a bridge between you and them. It reinforced the distance.',
          },
          score: 'okay',
          why: 'There is nothing wrong with this speech. It is just poorly timed. A room full of anxious, tired people cannot absorb a vision statement. They need to be met where they are before they can be led somewhere new.',
          research: 'Heath and Heath\'s research on communication (Made to Stick) shows that messages land when they connect to the audience\'s current emotional state. A prepared speech targets where you want them to go. An adaptive opening meets them where they are.',
        },
        {
          text: 'Open with a high-energy team-building activity to get the energy up in the room.',
          ripple: {
            moment: 'Some people participate. The introverts cringe. The exhausted teachers go through the motions. The energy feels manufactured, not genuine.',
            week: 'A veteran teacher tells a colleague: "If I have to do one more forced activity before 8 AM, I am retiring." The activity became a joke, not a bonding moment.',
            month: 'Your staff humors your activities but does not trust your read of the room. You tried to change how they felt instead of acknowledging how they felt. That matters.',
          },
          score: 'miss',
          why: 'High energy is not the same as high connection. Forcing energy into a tired room tells people their actual state is wrong. Meeting people where they are, even if "where they are" is exhausted, builds more trust than manufacturing enthusiasm.',
          research: 'Brown\'s research on vulnerability in leadership shows that authentic leadership creates 3x more follower commitment than performance-based leadership. Starting with "how are you really" outperforms "let me get you excited" every time.',
        },
      ],
      beenThereStat: '68% of building leaders have given an opening speech that did not land the way they hoped',
      skillTag: 'vulnerability',
    },
    es: {
      setup: 'Eres el lider del edificio. Es la primera reunion con todo el personal. Tienes 5 minutos para tus palabras de apertura. Planeaste un discurso pulido sobre vision y metas. Pero puedes sentir el salon. La gente esta cansada. Ansiosa. Algunos ya estan mirando sus telefonos.',
      context: 'Te quedas con el plan o pivotas?',
      choices: [
        {
          text: 'Olvida el discurso. Di: "Antes de hablar de hacia donde vamos, quiero saber como estan llegando. Tomen 30 segundos. Escriban una palabra en su tarjeta. Como se sienten realmente ahora mismo?" Recogelas. Lee algunas en voz alta. Luego da una version de 2 minutos de tu discurso.',
          ripple: {
            moment: 'El salon cambia. Alguien escribio "aterrorizado." Alguien escribio "emocionado." Alguien escribio "agotado y ni ha empezado." Las lees sin comentario. La gente se mira y se da cuenta de que no estan solos.',
            week: 'Tres maestros te mencionan el momento de la tarjeta independientemente. "Fue lo mas real que un administrador ha hecho en una reunion de apertura."',
            month: 'Para octubre, cuando pides retroalimentacion honesta, la gente realmente la da.',
          },
          score: 'strong',
          why: 'Tu personal no necesita tu vision el Dia 1. Necesitan saber que los ves.',
          research: 'La investigacion de Edmondson sobre seguridad psicologica muestra que los lideres que modelan vulnerabilidad en la primera interaccion crean equipos donde el reporte de errores aumenta un 26% y la innovacion un 19%.',
        },
        {
          text: 'Da el discurso pulido como estaba planeado. Esta bien escrito y establece expectativas claras para el ano.',
          ripple: {
            moment: 'La gente escucha cortesmente. Algunos asienten. La mayoria esta pensando en sus salones.',
            week: 'Nadie cita tu discurso. Nadie lo menciona. Fue profesional y olvidable.',
            month: 'Cuando surgen desafios en octubre, los maestros no vienen a ti primero. Van entre ellos.',
          },
          score: 'okay',
          why: 'No hay nada malo con este discurso. Solo esta mal cronometrado. Un salon lleno de personas ansiosas y cansadas no puede absorber una declaracion de vision.',
          research: 'La investigacion de Heath y Heath sobre comunicacion muestra que los mensajes aterrizan cuando conectan con el estado emocional actual de la audiencia.',
        },
        {
          text: 'Abre con una actividad de alta energia para subir la energia del salon.',
          ripple: {
            moment: 'Algunos participan. Los introvertidos se estremecen. Los maestros agotados siguen los movimientos.',
            week: 'Un maestro veterano le dice a un colega: "Si tengo que hacer otra actividad forzada antes de las 8 AM, me jubilo."',
            month: 'Tu personal sigue tus actividades pero no confia en tu lectura del salon.',
          },
          score: 'miss',
          why: 'Alta energia no es lo mismo que alta conexion. Forzar energia en un salon cansado les dice que su estado actual esta mal.',
          research: 'La investigacion de Brown sobre vulnerabilidad en el liderazgo muestra que el liderazgo autentico crea 3 veces mas compromiso que el liderazgo basado en rendimiento.',
        },
      ],
      beenThereStat: '68% de los lideres han dado un discurso de apertura que no aterrizo como esperaban',
      skillTag: 'vulnerability',
    },
  },

  // ─── SCENARIO 8: A student you had last year returns ────────────────────
  {
    id: 'fc-returning-student',
    roles: ['teacher', 'para'],
    gradeBands: ['3-5', '6-8', '9-12'],
    en: {
      setup: 'A student you had last year walks past your room on Day 1. They had a tough year with you. Grades slipped. There were some hard conversations. They do not make eye contact.',
      context: 'You have about 3 seconds before they pass your door.',
      choices: [
        {
          text: 'Step into the hallway. "Hey, [name]. Good to see you. I hope this year is a great one for you." Nothing more.',
          ripple: {
            moment: 'The student looks surprised. A small nod. They keep walking. But they heard you.',
            week: 'On Day 4, this student waves at you in the hallway. It is the first time they have acknowledged you voluntarily in months.',
            month: 'In October, this student stops by your room after school. "Can I talk to you about something?" They chose you. Not because last year was easy, but because you showed up on Day 1 when you did not have to.',
          },
          score: 'strong',
          why: 'Three seconds. Five words of genuine warmth. No agenda. You did not try to fix last year or pretend it did not happen. You just reminded them that they matter to you regardless of what happened before. That is repair without pressure.',
          research: 'Noddings\' ethic of care research shows that students measure whether adults care by whether they show up in moments when they do not have to. A hallway greeting to a student who is no longer "yours" is one of the most powerful signals of unconditional regard.',
        },
        {
          text: 'Let them pass. They are not your student anymore. Give them space.',
          ripple: {
            moment: 'The student glances at your door as they walk by. You are looking down. They keep moving.',
            week: 'The student tells a friend: "I walked right past [your name]\'s room and they did not even say hi." They are not angry. They are unsurprised. That is worse.',
            month: 'This student avoids your hallway for the rest of the year. The story they tell themselves: "When things got hard, that teacher moved on." That story follows them.',
          },
          score: 'miss',
          why: '"Give them space" sounds respectful but reads as avoidance. The student is not asking for space. They are testing whether you still see them after a hard year. Silence confirms their fear: adults only care when you are succeeding.',
          research: 'Resilience research (Masten, 2001) shows that the single most important factor in a child\'s ability to recover from difficulty is the presence of at least one stable, caring adult. You do not have to be their teacher to be that adult. You just have to show up.',
        },
        {
          text: 'Call them over. "Hey, can we talk for a sec? I have been thinking about last year and I want you to know..."',
          ripple: {
            moment: 'The student\'s face closes. They were not ready for a heavy conversation at 7:45 AM on Day 1. They feel ambushed.',
            week: 'The student actively avoids your hallway. They told a friend: "That teacher tried to have a whole conversation about last year. It was so awkward."',
            month: 'You meant well. But the student experienced it as you needing to process YOUR feelings about last year, not theirs. The repair attempt became about your comfort, not their healing.',
          },
          score: 'okay',
          why: 'The desire to repair is good. The timing and intensity are wrong. Day 1 hallway is not the time for a deep conversation about a hard year. A heavy opener on a fresh start day puts the weight of the past on a moment that should feel light.',
          research: 'Restorative practices research (Wachtel, 2016) shows that repair must be initiated by the harmed party, not the authority figure. Creating an opening ("good to see you") is different from forcing a conversation. One invites. The other imposes.',
        },
      ],
      beenThereStat: '67% of educators have avoided eye contact with a student they had a hard year with',
      skillTag: 'repair',
    },
    es: {
      setup: 'Un estudiante que tuviste el ano pasado pasa por tu salon el Dia 1. Tuvieron un ano dificil contigo. Las calificaciones bajaron. Hubo conversaciones dificiles. No hacen contacto visual.',
      context: 'Tienes unos 3 segundos antes de que pasen tu puerta.',
      choices: [
        {
          text: 'Sal al pasillo. "Oye, [nombre]. Que bueno verte. Espero que este ano sea genial para ti." Nada mas.',
          ripple: {
            moment: 'El estudiante se ve sorprendido. Un pequeno asentimiento. Siguen caminando. Pero te escucharon.',
            week: 'El Dia 4, este estudiante te saluda con la mano en el pasillo. Es la primera vez que te reconocen voluntariamente en meses.',
            month: 'En octubre, este estudiante pasa por tu salon despues de clases. "Puedo hablar contigo de algo?" Te eligieron a ti.',
          },
          score: 'strong',
          why: 'Tres segundos. Cinco palabras de calidez genuina. Sin agenda. No intentaste arreglar el ano pasado ni pretender que no paso.',
          research: 'La investigacion de Noddings sobre etica del cuidado muestra que los estudiantes miden si los adultos se preocupan por si aparecen en momentos cuando no tienen que hacerlo.',
        },
        {
          text: 'Dejalos pasar. Ya no son tu estudiante. Dales espacio.',
          ripple: {
            moment: 'El estudiante mira tu puerta al pasar. Estas mirando hacia abajo. Siguen caminando.',
            week: 'El estudiante le dice a un amigo: "Pase frente al salon de [tu nombre] y ni me saludo."',
            month: 'Este estudiante evita tu pasillo el resto del ano. La historia que se cuentan: "Cuando las cosas se pusieron dificiles, ese maestro siguio adelante."',
          },
          score: 'miss',
          why: '"Darles espacio" suena respetuoso pero se lee como evasion. El estudiante no esta pidiendo espacio. Esta probando si todavia los ves.',
          research: 'La investigacion de resiliencia (Masten, 2001) muestra que el factor mas importante en la capacidad de un nino para recuperarse es la presencia de al menos un adulto estable y carinoso.',
        },
        {
          text: 'Llamalos. "Oye, podemos hablar un segundo? He estado pensando sobre el ano pasado y quiero que sepas..."',
          ripple: {
            moment: 'La cara del estudiante se cierra. No estaban listos para una conversacion pesada a las 7:45 AM del Dia 1.',
            week: 'El estudiante evita activamente tu pasillo. Le dijeron a un amigo: "Ese maestro intento tener toda una conversacion sobre el ano pasado. Fue tan incomodo."',
            month: 'Tenias buenas intenciones. Pero el estudiante lo experimento como que necesitabas procesar TUS sentimientos, no los de ellos.',
          },
          score: 'okay',
          why: 'El deseo de reparar es bueno. El momento y la intensidad estan mal.',
          research: 'La investigacion de practicas restaurativas (Wachtel, 2016) muestra que la reparacion debe ser iniciada por la parte afectada, no por la figura de autoridad.',
        },
      ],
      beenThereStat: '67% de los educadores han evitado el contacto visual con un estudiante con quien tuvieron un ano dificil',
      skillTag: 'repair',
    },
  },

  // ─── SCENARIO 9: Coach's first classroom visit ─────────────────────────
  {
    id: 'fc-coach-first-visit',
    roles: ['coach', 'leader'],
    gradeBands: ['pk-2', '3-5', '6-8', '9-12'],
    en: {
      setup: 'You are a coach doing your first informal classroom visit of the year. You walk in and the teacher immediately stiffens. They glance at you, then at the door, then at the students.',
      context: 'You can feel it: they think you are there to evaluate them.',
      choices: [
        {
          text: 'Walk in, sit down at an empty student desk, and start observing the students, not the teacher. After class, say: "I loved watching [student name] work through that problem. What did you do to set that up?"',
          ripple: {
            moment: 'The teacher exhales when they realize you are watching students, not them. The power dynamic shifts instantly.',
            week: 'The teacher tells another colleague: "The new coach actually watched the kids. They asked me about my strategies. Nobody has done that before."',
            month: 'By October, this teacher invites you into their room. Voluntarily. "I am trying something new. Can you come watch?" You are no longer the evaluator. You are the thought partner.',
          },
          score: 'strong',
          why: 'Sitting at a student desk changes everything. You are not standing at the back with a clipboard. You are in the room at their level. Asking about a specific student by name proves you were paying attention to what matters: the learning, not the performance.',
          research: 'Knight\'s research on instructional coaching shows that coaches who position themselves as learning partners rather than evaluators increase teacher willingness to try new strategies by 56%. The first visit sets the entire coaching relationship.',
        },
        {
          text: 'Stand at the back of the room, take notes, and plan to share feedback later.',
          ripple: {
            moment: 'The teacher performs. Every move is calculated. You are seeing their best act, not their real teaching.',
            week: 'The teacher is polite but guarded. They agree with your feedback but do not implement it. They are managing you, not learning from you.',
            month: 'By October, your coaching conversations are surface-level. The teacher shares what is going well but never what they are struggling with. You have data but no relationship.',
          },
          score: 'miss',
          why: 'Standing at the back with notes replicates the evaluation posture. Even if you have the best intentions, your body language says "I am here to judge." Teachers who feel judged perform. Teachers who feel safe grow.',
          research: 'Aguilar\'s coaching research shows that trust must be established before any instructional feedback can land. In the absence of trust, feedback is experienced as criticism regardless of intent. Position and posture are trust signals.',
        },
        {
          text: 'Pop your head in, wave, and say: "Just wanted to say hi. I will come back when it is a good time." and leave.',
          ripple: {
            moment: 'The teacher relaxes. No pressure today. But they are still unsure about what you want.',
            week: 'The teacher wonders when you are coming back. The uncertainty is its own kind of stress. "When is the coach going to actually observe me?"',
            month: 'You avoided creating a negative first impression but you also did not create a positive one. By October, the teacher still does not know what your role is. You are friendly but irrelevant.',
          },
          score: 'okay',
          why: 'Leaving feels respectful but communicates uncertainty. If the teacher is anxious about your visit, postponing does not reduce the anxiety. It extends it. The first option removed the anxiety by changing the dynamic entirely.',
          research: 'Toll\'s research on coaching cycles shows that coaches who avoid entering classrooms in the first two weeks take 4-6 weeks longer to establish productive coaching relationships. Early, low-stakes presence beats delayed formal observation.',
        },
      ],
      beenThereStat: '82% of coaches have walked into a room and felt the teacher freeze',
      skillTag: 'presence',
    },
    es: {
      setup: 'Eres un coach haciendo tu primera visita informal al salon del ano. Entras y el maestro se pone rigido inmediatamente. Te mira, luego a la puerta, luego a los estudiantes.',
      context: 'Puedes sentirlo: creen que estas ahi para evaluarlos.',
      choices: [
        {
          text: 'Entra, sientate en un escritorio de estudiante vacio, y empieza a observar a los estudiantes, no al maestro. Despues de clase, di: "Me encanto ver a [nombre del estudiante] trabajar en ese problema. Que hiciste para preparar eso?"',
          ripple: {
            moment: 'El maestro exhala cuando se dan cuenta de que estas observando a los estudiantes, no a ellos.',
            week: 'El maestro le dice a otro colega: "El nuevo coach realmente observo a los ninos. Me pregunto sobre mis estrategias. Nadie ha hecho eso antes."',
            month: 'Para octubre, este maestro te invita a su salon. Voluntariamente. "Estoy probando algo nuevo. Puedes venir a observar?"',
          },
          score: 'strong',
          why: 'Sentarte en un escritorio de estudiante cambia todo. No estas parado al fondo con un portapapeles.',
          research: 'La investigacion de Knight sobre coaching instruccional muestra que los coaches que se posicionan como socios de aprendizaje aumentan la disposicion del maestro a probar nuevas estrategias en un 56%.',
        },
        {
          text: 'Parate al fondo del salon, toma notas, y planea compartir retroalimentacion despues.',
          ripple: {
            moment: 'El maestro actua. Cada movimiento es calculado. Estas viendo su mejor acto, no su ensenanza real.',
            week: 'El maestro es cortes pero cauteloso. Aceptan tu retroalimentacion pero no la implementan.',
            month: 'Para octubre, tus conversaciones de coaching son superficiales.',
          },
          score: 'miss',
          why: 'Pararte al fondo con notas replica la postura de evaluacion.',
          research: 'La investigacion de coaching de Aguilar muestra que la confianza debe establecerse antes de que cualquier retroalimentacion instruccional pueda aterrizar.',
        },
        {
          text: 'Asoma la cabeza, saluda y di: "Solo queria saludar. Regreso cuando sea buen momento." y te vas.',
          ripple: {
            moment: 'El maestro se relaja. Sin presion hoy. Pero todavia no estan seguros de lo que quieres.',
            week: 'El maestro se pregunta cuando vas a regresar. La incertidumbre es su propio tipo de estres.',
            month: 'Evitaste crear una primera impresion negativa pero tampoco creaste una positiva.',
          },
          score: 'okay',
          why: 'Irte se siente respetuoso pero comunica incertidumbre. Posponer no reduce la ansiedad. La extiende.',
          research: 'La investigacion de Toll sobre ciclos de coaching muestra que los coaches que evitan entrar a los salones en las primeras dos semanas tardan 4-6 semanas mas en establecer relaciones de coaching productivas.',
        },
      ],
      beenThereStat: '82% de los coaches han entrado a un salon y sentido al maestro congelarse',
      skillTag: 'presence',
    },
  },

  // ─── SCENARIO 10: First interaction with a quiet student ────────────────
  {
    id: 'fc-quiet-student',
    roles: ['teacher', 'para'],
    gradeBands: ['pk-2', '3-5', '6-8', '9-12'],
    en: {
      setup: 'It is Day 2. Most students are settling in. But one student has not said a single word. They do their work. They follow directions. They make no trouble. They also make no connections.',
      context: 'Nobody has noticed them yet. You are the first person who could.',
      choices: [
        {
          text: 'Walk past their desk. Without stopping, quietly say: "I noticed you finished that faster than most people. That is impressive." Keep walking.',
          ripple: {
            moment: 'The student\'s eyes widen for half a second. They look back down. But the corner of their mouth moves.',
            week: 'On Day 4, you walk past again. This time the student looks up before you say anything. They are waiting for you. That is connection forming.',
            month: 'By October, this student is still quiet. But they chose a seat closer to your desk. When you give directions, they look at you instead of at the floor. You did not change their personality. You made the room safe enough for them to be themselves in it.',
          },
          score: 'strong',
          why: 'You noticed without spotlighting. A quiet student who is singled out in front of the class will retreat further. But a drive-by compliment that nobody else hears? That is a private signal: I see you, and I am not going to make it weird.',
          research: 'Cain\'s research on introversion (Quiet, 2012) shows that introverted students perform best when they feel seen without being spotlighted. Public recognition triggers threat responses in quiet students. Private, specific acknowledgment builds trust without triggering withdrawal.',
        },
        {
          text: 'During a group activity, say to the class: "I want to hear from everyone today, especially people we have not heard from yet."',
          ripple: {
            moment: 'The quiet student sinks lower. Everyone knows who you mean. The spotlight finds them without saying their name.',
            week: 'The student starts sitting in the back corner. They have identified you as a teacher who will call on them. Your classroom is now a place where being quiet is a problem to solve.',
            month: 'By October, this student participates when forced but never voluntarily. They learned that silence is not acceptable in your room. They did not learn that silence is respected.',
          },
          score: 'miss',
          why: 'This approach treats quietness as a deficit. "I want to hear from everyone" sounds inclusive but communicates: your way of being in this room is not enough. Quiet students contribute through work quality, observation, and written reflection. Those are valid forms of participation.',
          research: 'Dweck and Leggett\'s research on classroom environment shows that students who feel their natural learning style is valued perform 23% better than students who feel they must conform to a participation norm. Quiet is not disengaged.',
        },
        {
          text: 'Pull them aside at the end of class: "Hey, I noticed you have been really quiet. Everything okay?"',
          ripple: {
            moment: 'The student nods. "I am fine." They are not going to open up to someone they met yesterday. You have just labeled their quietness as a concern.',
            week: 'The student is now self-conscious about being quiet. They start forcing small talk that feels unnatural. You solved a problem that was not a problem.',
            month: 'The student performs "engagement" for you but it is not real. They are managing your perception of them instead of being themselves. You meant well but made their quietness feel like something to fix.',
          },
          score: 'okay',
          why: 'Checking in is good instinct. But "Everything okay?" frames quietness as a symptom of something wrong. On Day 2, you do not know this student well enough to know if their quiet is distress or just who they are. The first option gathers that data without pathologizing.',
          research: 'Ladd\'s research on peer relationships shows that quiet students who are pressured to socialize show increased anxiety, not decreased. The role of the adult is to create safety, not to prescribe a socialization timeline.',
        },
      ],
      beenThereStat: '74% of educators have a quiet student they are unsure how to reach in the first week',
      skillTag: 'presence',
    },
    es: {
      setup: 'Es el Dia 2. La mayoria de los estudiantes se estan acomodando. Pero un estudiante no ha dicho una sola palabra. Hacen su trabajo. Siguen instrucciones. No causan problemas. Tampoco hacen conexiones.',
      context: 'Nadie los ha notado todavia. Tu eres la primera persona que podria.',
      choices: [
        {
          text: 'Pasa por su escritorio. Sin detenerte, di en voz baja: "Note que terminaste eso mas rapido que la mayoria. Eso es impresionante." Sigue caminando.',
          ripple: {
            moment: 'Los ojos del estudiante se abren por medio segundo. Miran hacia abajo de nuevo. Pero la esquina de su boca se mueve.',
            week: 'El Dia 4, pasas de nuevo. Esta vez el estudiante levanta la mirada antes de que digas algo. Estan esperandote.',
            month: 'Para octubre, este estudiante sigue siendo callado. Pero eligieron un asiento mas cerca de tu escritorio.',
          },
          score: 'strong',
          why: 'Notaste sin poner el foco. Un estudiante callado que es senalado frente a la clase se retrae mas.',
          research: 'La investigacion de Cain sobre introversion muestra que los estudiantes introvertidos rinden mejor cuando se sienten vistos sin ser el centro de atencion. El reconocimiento privado y especifico construye confianza sin activar la retirada.',
        },
        {
          text: 'Durante una actividad grupal, di a la clase: "Quiero escuchar de todos hoy, especialmente de personas de las que no hemos escuchado."',
          ripple: {
            moment: 'El estudiante callado se hunde mas. Todos saben a quien te refieres.',
            week: 'El estudiante empieza a sentarse en la esquina de atras. Te han identificado como un maestro que los va a llamar.',
            month: 'Para octubre, este estudiante participa cuando es forzado pero nunca voluntariamente.',
          },
          score: 'miss',
          why: 'Este enfoque trata la tranquilidad como un deficit. Los estudiantes callados contribuyen a traves de la calidad del trabajo, la observacion y la reflexion escrita.',
          research: 'La investigacion de Dweck y Leggett sobre ambiente del salon muestra que los estudiantes que sienten que su estilo natural de aprendizaje es valorado rinden un 23% mejor.',
        },
        {
          text: 'Llévalos aparte al final de clase: "Oye, note que has estado muy callado/a. Todo bien?"',
          ripple: {
            moment: 'El estudiante asiente. "Estoy bien." No van a abrirse con alguien que conocieron ayer.',
            week: 'El estudiante ahora es consciente de ser callado. Empiezan a forzar conversacion que se siente artificial.',
            month: 'El estudiante actua "compromiso" para ti pero no es real.',
          },
          score: 'okay',
          why: 'Verificar es buen instinto. Pero "Todo bien?" enmarca la tranquilidad como un sintoma de algo mal.',
          research: 'La investigacion de Ladd sobre relaciones entre pares muestra que los estudiantes callados que son presionados a socializar muestran mayor ansiedad, no menor.',
        },
      ],
      beenThereStat: '74% de los educadores tienen un estudiante callado que no saben como alcanzar en la primera semana',
      skillTag: 'presence',
    },
  },
]
