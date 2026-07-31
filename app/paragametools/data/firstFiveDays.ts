// First Five Days: Priority selection game for back-to-school week
// Category: Classroom Setup

export interface PriorityItem {
  id: string
  en: {
    task: string
    description: string
    priority: 'essential' | 'important' | 'can_wait'
    rationale: string
    day: string
  }
  es: {
    task: string
    description: string
    priority: 'essential' | 'important' | 'can_wait'
    rationale: string
    day: string
  }
}

export interface PrioritySet {
  role: 'teacher' | 'para' | 'leader'
  en: { title: string; context: string }
  es: { title: string; context: string }
  items: PriorityItem[]
}

export const PRIORITY_SETS: PrioritySet[] = [
  // TEACHER SET
  {
    role: 'teacher',
    en: {
      title: 'Teacher: First Five Days',
      context: 'It is the week before students arrive. You have 12 things on your list but only time for 8. What matters most?',
    },
    es: {
      title: 'Maestro/a: Primeros Cinco Dias',
      context: 'Es la semana antes de que lleguen los estudiantes. Tienes 12 cosas en tu lista pero solo tiempo para 8. Que es lo mas importante?',
    },
    items: [
      {
        id: 'teacher_names',
        en: {
          task: 'Learn every student\'s name by Day 3',
          description: 'Use name tents, photos, repetition, and practice until you can greet every student by name.',
          priority: 'essential',
          rationale: 'A student who hears their name from you in the first three days feels seen. Research from Hattie shows that teacher-student relationships have an effect size of 0.72, nearly double the threshold for significant impact. Names are the first step.',
          day: 'Day 1 through Day 3',
        },
        es: {
          task: 'Aprende el nombre de cada estudiante para el Dia 3',
          description: 'Usa tarjetas de nombres, fotos, repeticion y practica hasta que puedas saludar a cada estudiante por su nombre.',
          priority: 'essential',
          rationale: 'Un estudiante que escucha su nombre de parte tuya en los primeros tres dias se siente visto. La investigacion de Hattie muestra que las relaciones maestro-estudiante tienen un tamano de efecto de 0.72, casi el doble del umbral de impacto significativo. Los nombres son el primer paso.',
          day: 'Dia 1 a Dia 3',
        },
      },
      {
        id: 'teacher_routines',
        en: {
          task: 'Establish 3 core classroom routines (entry, transitions, dismissal)',
          description: 'Teach, model, and practice the three moments where chaos is most likely: walking in, switching tasks, and leaving.',
          priority: 'essential',
          rationale: 'Wong and Wong found that classrooms with practiced routines gained up to 20 additional instructional days per year. Entry, transitions, and dismissal are the three highest-risk moments. Get those right and everything else calms down.',
          day: 'Day 1',
        },
        es: {
          task: 'Establece 3 rutinas esenciales (entrada, transiciones, salida)',
          description: 'Ensena, modela y practica los tres momentos donde el caos es mas probable: al entrar, al cambiar de tarea y al salir.',
          priority: 'essential',
          rationale: 'Wong y Wong encontraron que las aulas con rutinas practicadas ganaron hasta 20 dias adicionales de instruccion por ano. Entrada, transiciones y salida son los tres momentos de mayor riesgo. Si dominas esos, todo lo demas se calma.',
          day: 'Dia 1',
        },
      },
      {
        id: 'teacher_conversations',
        en: {
          task: 'Build relationships: 2 minute individual conversations with 5 students per day',
          description: 'Short, genuine check-ins that are not about academics. What do they like? Who do they sit with at lunch? What are they good at?',
          priority: 'essential',
          rationale: 'The "2x10" strategy (2 minutes, 10 days) has been shown to reduce behavioral incidents by up to 85%. You do not need 30 minutes. You need 2 minutes of being fully present. Five students a day means your whole class feels known by Week 2.',
          day: 'Day 1 through Day 5',
        },
        es: {
          task: 'Construye relaciones: conversaciones individuales de 2 minutos con 5 estudiantes por dia',
          description: 'Charlas breves y genuinas que no son sobre lo academico. Que les gusta? Con quien se sientan en el almuerzo? En que son buenos?',
          priority: 'essential',
          rationale: 'La estrategia "2x10" (2 minutos, 10 dias) ha demostrado reducir incidentes de comportamiento hasta en un 85%. No necesitas 30 minutos. Necesitas 2 minutos de estar completamente presente. Cinco estudiantes al dia significa que toda tu clase se siente conocida para la Semana 2.',
          day: 'Dia 1 a Dia 5',
        },
      },
      {
        id: 'teacher_para_plan',
        en: {
          task: 'Co-plan with your para (if you have one) for the first week',
          description: 'Sit down together before Day 1. Clarify roles, routines, communication, and what to do when things go sideways.',
          priority: 'essential',
          rationale: 'Paras who start the year without a planning meeting report feeling invisible and underutilized. One 30 minute conversation prevents weeks of confusion. This is not about hierarchy. It is about making sure two adults in the room are pulling in the same direction.',
          day: 'Before Day 1',
        },
        es: {
          task: 'Planifica con tu para (si tienes uno) para la primera semana',
          description: 'Sientense juntos antes del Dia 1. Aclaren roles, rutinas, comunicacion y que hacer cuando las cosas se compliquen.',
          priority: 'essential',
          rationale: 'Los paras que comienzan el ano sin una reunion de planificacion reportan sentirse invisibles y subutilizados. Una conversacion de 30 minutos previene semanas de confusion. No se trata de jerarquia. Se trata de asegurar que dos adultos en el salon esten trabajando en la misma direccion.',
          day: 'Antes del Dia 1',
        },
      },
      {
        id: 'teacher_welcome_families',
        en: {
          task: 'Send a welcome message to families introducing yourself',
          description: 'A short, warm email or note home. Who you are, how to reach you, and one thing you are excited about this year.',
          priority: 'essential',
          rationale: 'Family engagement in the first week predicts communication patterns for the whole year. A proactive, positive first contact (not about behavior) sets the tone. Epstein found that teacher-initiated contact before problems arise increases family trust by 40%.',
          day: 'Day 1 or Day 2',
        },
        es: {
          task: 'Envia un mensaje de bienvenida a las familias presentandote',
          description: 'Un correo o nota breve y calida para casa. Quien eres, como contactarte y una cosa que te emociona de este ano.',
          priority: 'essential',
          rationale: 'La participacion familiar en la primera semana predice los patrones de comunicacion para todo el ano. Un primer contacto proactivo y positivo (no sobre comportamiento) establece el tono. Epstein encontro que el contacto iniciado por el maestro antes de que surjan problemas aumenta la confianza familiar en un 40%.',
          day: 'Dia 1 o Dia 2',
        },
      },
      {
        id: 'teacher_expectations',
        en: {
          task: 'Set behavioral expectations through practice, not lecture',
          description: 'Instead of reading a list of rules, have students practice the routines. Walk through them. Model them. Repeat.',
          priority: 'essential',
          rationale: 'Students remember 10% of what they hear and 75% of what they practice. A 20 minute lecture about rules on Day 1 is forgotten by Day 3. But practicing how to enter the room, how to ask for help, and how to transition between tasks builds muscle memory that lasts.',
          day: 'Day 1 and Day 2',
        },
        es: {
          task: 'Establece expectativas de comportamiento a traves de la practica, no de un discurso',
          description: 'En lugar de leer una lista de reglas, haz que los estudiantes practiquen las rutinas. Recorranlas. Modelalas. Repite.',
          priority: 'essential',
          rationale: 'Los estudiantes recuerdan el 10% de lo que escuchan y el 75% de lo que practican. Un discurso de 20 minutos sobre reglas el Dia 1 se olvida para el Dia 3. Pero practicar como entrar al salon, como pedir ayuda y como hacer transiciones entre tareas construye memoria muscular que perdura.',
          day: 'Dia 1 y Dia 2',
        },
      },
      {
        id: 'teacher_ieps',
        en: {
          task: 'Review IEPs and 504s for your roster',
          description: 'Read through accommodation plans for every student who has one so you know what supports are legally required.',
          priority: 'important',
          rationale: 'This is legally required and matters deeply. But it does not have to happen before Day 1. Most experienced teachers review these in the first two weeks, prioritizing the students who arrive on Day 1. Start with the names you recognize from last year or from team meetings.',
          day: 'Day 2 or Day 3',
        },
        es: {
          task: 'Revisa los IEPs y 504s de tu lista de estudiantes',
          description: 'Lee los planes de acomodaciones para cada estudiante que tenga uno para saber que apoyos son legalmente requeridos.',
          priority: 'important',
          rationale: 'Esto es legalmente requerido e importa profundamente. Pero no tiene que suceder antes del Dia 1. La mayoria de los maestros experimentados los revisan en las primeras dos semanas, priorizando a los estudiantes que llegan el Dia 1. Comienza con los nombres que reconoces del ano pasado o de reuniones de equipo.',
          day: 'Dia 2 o Dia 3',
        },
      },
      {
        id: 'teacher_assess',
        en: {
          task: 'Assess where students are academically (informal, not a test)',
          description: 'Quick conversations, observations, or low stakes activities to understand what students know and can do.',
          priority: 'important',
          rationale: 'You need baseline data, but a formal test on Day 1 sends the wrong message. Informal assessment through conversation and observation gives you the same information without the anxiety. Students who feel tested before they feel welcomed disengage quickly.',
          day: 'Day 3 through Day 5',
        },
        es: {
          task: 'Evalua donde estan los estudiantes academicamente (informal, no un examen)',
          description: 'Conversaciones rapidas, observaciones o actividades de baja presion para entender que saben y pueden hacer los estudiantes.',
          priority: 'important',
          rationale: 'Necesitas datos de referencia, pero un examen formal el Dia 1 envia el mensaje equivocado. La evaluacion informal a traves de conversacion y observacion te da la misma informacion sin la ansiedad. Los estudiantes que se sienten evaluados antes de sentirse bienvenidos se desconectan rapidamente.',
          day: 'Dia 3 a Dia 5',
        },
      },
      {
        id: 'teacher_bulletin',
        en: {
          task: 'Decorate your bulletin boards',
          description: 'Put up welcome displays, subject area posters, and make the room look inviting.',
          priority: 'can_wait',
          rationale: 'A decorated room feels good, but students do not remember bulletin boards. They remember how you made them feel. Better yet, leave some boards blank and let students fill them in the first two weeks. Co-created spaces build ownership.',
          day: 'Week 2',
        },
        es: {
          task: 'Decora tus tableros de anuncios',
          description: 'Pon exhibiciones de bienvenida, carteles de materias y haz que el salon se vea acogedor.',
          priority: 'can_wait',
          rationale: 'Un salon decorado se siente bien, pero los estudiantes no recuerdan los tableros. Recuerdan como los hiciste sentir. Mejor aun, deja algunos tableros en blanco y deja que los estudiantes los llenen en las primeras dos semanas. Los espacios co-creados construyen sentido de pertenencia.',
          day: 'Semana 2',
        },
      },
      {
        id: 'teacher_supplies',
        en: {
          task: 'Organize your supply closet',
          description: 'Sort materials, label bins, create a system for distributing supplies.',
          priority: 'can_wait',
          rationale: 'An organized closet is satisfying but has zero impact on student learning in Week 1. This is productive procrastination. Your students will not know or care whether the markers are sorted by color. Do this on a Saturday in September.',
          day: 'Week 2',
        },
        es: {
          task: 'Organiza tu armario de materiales',
          description: 'Ordena los materiales, etiqueta contenedores, crea un sistema para distribuir suministros.',
          priority: 'can_wait',
          rationale: 'Un armario organizado es satisfactorio pero tiene cero impacto en el aprendizaje de los estudiantes en la Semana 1. Esto es procrastinacion productiva. Tus estudiantes no van a saber ni les va a importar si los marcadores estan ordenados por color. Haz esto un sabado en septiembre.',
          day: 'Semana 2',
        },
      },
      {
        id: 'teacher_seating',
        en: {
          task: 'Create a detailed seating chart (let them choose seats the first week)',
          description: 'Design a permanent seating arrangement based on behavior predictions and learning needs.',
          priority: 'can_wait',
          rationale: 'You do not know these students yet. Any seating chart you make before Day 1 is based on assumptions, last year\'s reputation, or someone else\'s opinion. Let them choose for the first week. Watch the dynamics. Then build a seating chart based on what you actually observe.',
          day: 'Week 2',
        },
        es: {
          task: 'Crea un plan de asientos detallado (dejalos elegir la primera semana)',
          description: 'Disena una disposicion permanente de asientos basada en predicciones de comportamiento y necesidades de aprendizaje.',
          priority: 'can_wait',
          rationale: 'Aun no conoces a estos estudiantes. Cualquier plan de asientos que hagas antes del Dia 1 esta basado en suposiciones, la reputacion del ano pasado o la opinion de alguien mas. Dejalos elegir la primera semana. Observa las dinamicas. Luego construye un plan basado en lo que realmente observas.',
          day: 'Semana 2',
        },
      },
      {
        id: 'teacher_content',
        en: {
          task: 'Plan content-heavy lessons for Week 1',
          description: 'Jump into the curriculum on Day 1 with full academic lessons and homework assignments.',
          priority: 'can_wait',
          rationale: 'Content can wait five days. Culture cannot. Classrooms that rush into academics before establishing routines and relationships spend the rest of the year fighting fires. The research is clear: invest the first week in community, and you get more instructional time for the rest of the year.',
          day: 'Week 2',
        },
        es: {
          task: 'Planifica lecciones con mucho contenido para la Semana 1',
          description: 'Salta directamente al curriculo el Dia 1 con lecciones academicas completas y tareas.',
          priority: 'can_wait',
          rationale: 'El contenido puede esperar cinco dias. La cultura no. Las aulas que se apresuran a lo academico antes de establecer rutinas y relaciones pasan el resto del ano apagando incendios. La investigacion es clara: invierte la primera semana en comunidad y obtendras mas tiempo de instruccion el resto del ano.',
          day: 'Semana 2',
        },
      },
    ],
  },

  // PARA SET
  {
    role: 'para',
    en: {
      title: 'Para: First Five Days',
      context: 'You are starting the year in a new classroom (or a new role). You have 12 things on your list but only time for 8. What matters most?',
    },
    es: {
      title: 'Para: Primeros Cinco Dias',
      context: 'Estas comenzando el ano en un nuevo salon (o un nuevo rol). Tienes 12 cosas en tu lista pero solo tiempo para 8. Que es lo mas importante?',
    },
    items: [
      {
        id: 'para_introductions',
        en: {
          task: 'Introduce yourself to every student in your assigned groups',
          description: 'Make sure every student you work with knows your name, your role, and that you are there for them.',
          priority: 'essential',
          rationale: 'Students who do not know why an additional adult is in the room often feel confused or surveilled. A warm, clear introduction ("I am here to help you succeed") removes the stigma and builds trust from Day 1.',
          day: 'Day 1',
        },
        es: {
          task: 'Presentate a cada estudiante en tus grupos asignados',
          description: 'Asegurate de que cada estudiante con quien trabajas sepa tu nombre, tu rol y que estas ahi para ellos.',
          priority: 'essential',
          rationale: 'Los estudiantes que no saben por que hay un adulto adicional en el salon a menudo se sienten confundidos o vigilados. Una presentacion calida y clara ("Estoy aqui para ayudarte a tener exito") elimina el estigma y construye confianza desde el Dia 1.',
          day: 'Dia 1',
        },
      },
      {
        id: 'para_teacher_meeting',
        en: {
          task: 'Meet with your lead teacher about expectations, schedule, and communication preferences',
          description: 'Have a real conversation about how the teacher wants you to support the classroom. Not assumptions. Actual planning.',
          priority: 'essential',
          rationale: 'The number one frustration paras report is not knowing what the teacher expects. And the number one frustration teachers report is paras who guess instead of ask. One 20 minute meeting prevents months of misalignment. Ask: What should I do during whole group? How do you want me to handle behavior? How should we communicate during class?',
          day: 'Before Day 1',
        },
        es: {
          task: 'Reunete con tu maestro/a principal sobre expectativas, horario y preferencias de comunicacion',
          description: 'Ten una conversacion real sobre como el maestro quiere que apoyes el salon. No suposiciones. Planificacion real.',
          priority: 'essential',
          rationale: 'La frustracion numero uno que reportan los paras es no saber que espera el maestro. Y la frustracion numero uno que reportan los maestros es que los paras adivinen en lugar de preguntar. Una reunion de 20 minutos previene meses de desalineacion. Pregunta: Que debo hacer durante grupo completo? Como quieres que maneje el comportamiento? Como debemos comunicarnos durante clase?',
          day: 'Antes del Dia 1',
        },
      },
      {
        id: 'para_routines',
        en: {
          task: 'Learn the daily routine so you can support transitions independently',
          description: 'Know the schedule cold. Entry, specials, lunch, recess, dismissal. If you have to ask "What is next?" students notice.',
          priority: 'essential',
          rationale: 'A para who knows the routine becomes a co-leader. A para who does not know the routine becomes a follower. Students take cues from the adults in the room. If you look uncertain, they feel uncertain. Memorize the schedule before Day 1.',
          day: 'Before Day 1',
        },
        es: {
          task: 'Aprende la rutina diaria para poder apoyar las transiciones de manera independiente',
          description: 'Conoce el horario de memoria. Entrada, especiales, almuerzo, recreo, salida. Si tienes que preguntar "Que sigue?" los estudiantes se dan cuenta.',
          priority: 'essential',
          rationale: 'Un para que conoce la rutina se convierte en co-lider. Un para que no conoce la rutina se convierte en seguidor. Los estudiantes toman senales de los adultos en el salon. Si te ves inseguro, ellos se sienten inseguros. Memoriza el horario antes del Dia 1.',
          day: 'Antes del Dia 1',
        },
      },
      {
        id: 'para_iep_goals',
        en: {
          task: 'Read IEP goals for your assigned students',
          description: 'Know what each student is working toward so you can support the right skills, not just manage behavior.',
          priority: 'essential',
          rationale: 'You cannot support a goal you do not know exists. Too many paras spend the year managing behavior without understanding the academic and social goals written into the IEP. Reading the goals before Day 1 transforms you from a behavior manager to an instructional partner.',
          day: 'Before Day 1',
        },
        es: {
          task: 'Lee las metas del IEP de tus estudiantes asignados',
          description: 'Conoce hacia que esta trabajando cada estudiante para que puedas apoyar las habilidades correctas, no solo manejar el comportamiento.',
          priority: 'essential',
          rationale: 'No puedes apoyar una meta que no sabes que existe. Demasiados paras pasan el ano manejando comportamiento sin entender las metas academicas y sociales escritas en el IEP. Leer las metas antes del Dia 1 te transforma de un manejador de comportamiento a un companero de instruccion.',
          day: 'Antes del Dia 1',
        },
      },
      {
        id: 'para_workspace',
        en: {
          task: 'Set up your small group workspace',
          description: 'Organize the table, materials, and tools you need for pull-out or push-in small group instruction.',
          priority: 'essential',
          rationale: 'A prepared workspace signals professionalism and readiness. Students who arrive at a cluttered, unorganized small group table feel like an afterthought. A clean, intentional space says "this time matters."',
          day: 'Day 1',
        },
        es: {
          task: 'Prepara tu espacio de trabajo para grupo pequeno',
          description: 'Organiza la mesa, materiales y herramientas que necesitas para instruccion de grupo pequeno.',
          priority: 'essential',
          rationale: 'Un espacio de trabajo preparado senala profesionalismo y disposicion. Los estudiantes que llegan a una mesa de grupo pequeno desordenada se sienten como una idea de ultimo momento. Un espacio limpio e intencional dice "este tiempo importa."',
          day: 'Dia 1',
        },
      },
      {
        id: 'para_observe',
        en: {
          task: 'Observe before jumping in. Watch how the teacher runs the room for the first 2 days.',
          description: 'Resist the urge to immediately fix, redirect, or intervene. Watch first. Learn the teacher\'s style, signals, and systems.',
          priority: 'essential',
          rationale: 'Every teacher runs their room differently. What one teacher calls "off task," another teacher calls "thinking time." If you jump in with your own approach before understanding the teacher\'s system, you create confusion for students who now have two sets of expectations. Observe first. Align second.',
          day: 'Day 1 and Day 2',
        },
        es: {
          task: 'Observa antes de intervenir. Mira como el maestro maneja el salon los primeros 2 dias.',
          description: 'Resiste la urgencia de inmediatamente corregir, redirigir o intervenir. Observa primero. Aprende el estilo, las senales y los sistemas del maestro.',
          priority: 'essential',
          rationale: 'Cada maestro maneja su salon de manera diferente. Lo que un maestro llama "fuera de tarea," otro maestro llama "tiempo de pensar." Si te lanzas con tu propio enfoque antes de entender el sistema del maestro, creas confusion para los estudiantes que ahora tienen dos conjuntos de expectativas. Observa primero. Alineate despues.',
          day: 'Dia 1 y Dia 2',
        },
      },
      {
        id: 'para_supplies_location',
        en: {
          task: 'Learn where supplies, materials, and resources are kept',
          description: 'Know where the extra pencils, paper, scissors, manipulatives, and emergency supplies live.',
          priority: 'important',
          rationale: 'You will need materials mid-lesson, and stopping to ask the teacher interrupts instruction. Knowing where things are lets you support students seamlessly. But this can happen over the first week. You do not need a full inventory on Day 1.',
          day: 'Day 2 or Day 3',
        },
        es: {
          task: 'Aprende donde se guardan los materiales y recursos',
          description: 'Conoce donde estan los lapices extra, papel, tijeras, manipulativos y materiales de emergencia.',
          priority: 'important',
          rationale: 'Vas a necesitar materiales a mitad de la leccion, y detenerte para preguntarle al maestro interrumpe la instruccion. Saber donde estan las cosas te permite apoyar a los estudiantes sin interrupciones. Pero esto puede suceder durante la primera semana. No necesitas un inventario completo el Dia 1.',
          day: 'Dia 2 o Dia 3',
        },
      },
      {
        id: 'para_family_intro',
        en: {
          task: 'Introduce yourself to families at pickup or dropoff',
          description: 'Be visible. Say hello. Let parents know who you are and that their child is supported.',
          priority: 'important',
          rationale: 'Families who know the para by name feel more confident about their child\'s support team. A quick introduction at pickup builds trust. But this is a "when you can" task, not a Day 1 mandate.',
          day: 'Day 3 through Day 5',
        },
        es: {
          task: 'Presentate a las familias en la recogida o la llegada',
          description: 'Se visible. Saluda. Deja que los padres sepan quien eres y que su hijo tiene apoyo.',
          priority: 'important',
          rationale: 'Las familias que conocen al para por su nombre se sienten mas seguras sobre el equipo de apoyo de su hijo. Una presentacion rapida en la recogida construye confianza. Pero esta es una tarea de "cuando puedas," no un mandato del Dia 1.',
          day: 'Dia 3 a Dia 5',
        },
      },
      {
        id: 'para_data_tracking',
        en: {
          task: 'Create elaborate data tracking systems (start simple)',
          description: 'Build color-coded spreadsheets, tracking binders, and detailed documentation templates.',
          priority: 'can_wait',
          rationale: 'Data tracking matters, but you do not need a perfect system on Day 1. Start with a simple tally sheet or sticky note system. Build complexity over time once you know which data actually gets used. Many paras spend hours building tracking systems that no one ever reviews.',
          day: 'Week 2',
        },
        es: {
          task: 'Crea sistemas elaborados de seguimiento de datos (empieza simple)',
          description: 'Construye hojas de calculo con codigos de color, carpetas de seguimiento y plantillas detalladas de documentacion.',
          priority: 'can_wait',
          rationale: 'El seguimiento de datos importa, pero no necesitas un sistema perfecto el Dia 1. Comienza con una hoja simple de conteo o un sistema de notas adhesivas. Agrega complejidad con el tiempo una vez que sepas que datos realmente se usan. Muchos paras pasan horas construyendo sistemas de seguimiento que nadie revisa.',
          day: 'Semana 2',
        },
      },
      {
        id: 'para_rearrange',
        en: {
          task: 'Rearrange the small group area furniture',
          description: 'Move tables, reorganize the reading corner, and set up the space exactly how you want it.',
          priority: 'can_wait',
          rationale: 'It is not your room to rearrange without the teacher\'s input. And even if the teacher says "go for it," you do not yet know how the space will be used. Wait until you see how students actually move through the room, then adjust based on real data, not guesses.',
          day: 'Week 2',
        },
        es: {
          task: 'Reorganiza los muebles del area de grupo pequeno',
          description: 'Mueve mesas, reorganiza el rincon de lectura y configura el espacio exactamente como lo quieres.',
          priority: 'can_wait',
          rationale: 'No es tu salon para reorganizar sin la opinion del maestro. E incluso si el maestro dice "adelante," aun no sabes como se usara el espacio. Espera hasta que veas como los estudiantes realmente se mueven por el salon, luego ajusta basandote en datos reales, no suposiciones.',
          day: 'Semana 2',
        },
      },
      {
        id: 'para_supply_kit',
        en: {
          task: 'Build a personal supply kit',
          description: 'Assemble your own set of pencils, highlighters, fidgets, timers, and organizational tools.',
          priority: 'can_wait',
          rationale: 'A personal kit is convenient but not urgent. Use what the classroom already has for the first week. Once you see what students actually need, you can build a targeted kit instead of a generic one. Save this for a weekend project.',
          day: 'Week 2',
        },
        es: {
          task: 'Construye un kit personal de materiales',
          description: 'Arma tu propio set de lapices, resaltadores, fidgets, temporizadores y herramientas organizativas.',
          priority: 'can_wait',
          rationale: 'Un kit personal es conveniente pero no urgente. Usa lo que el salon ya tiene la primera semana. Una vez que veas lo que los estudiantes realmente necesitan, puedes construir un kit especifico en lugar de uno generico. Guarda esto para un proyecto de fin de semana.',
          day: 'Semana 2',
        },
      },
      {
        id: 'para_early_finishers',
        en: {
          task: 'Plan independent activities for early finishers',
          description: 'Create a library of worksheets, games, or extension tasks for students who finish work early.',
          priority: 'can_wait',
          rationale: 'You do not know yet which students finish early, what they are interested in, or what level they are working at. Any early finisher activity you plan right now is a guess. Wait until you know the students, then build activities that actually connect to what they are learning.',
          day: 'Week 2',
        },
        es: {
          task: 'Planifica actividades independientes para los que terminan temprano',
          description: 'Crea una biblioteca de hojas de trabajo, juegos o tareas de extension para estudiantes que terminan el trabajo temprano.',
          priority: 'can_wait',
          rationale: 'Aun no sabes cuales estudiantes terminan temprano, que les interesa o en que nivel estan trabajando. Cualquier actividad para los que terminan temprano que planees ahora es una suposicion. Espera hasta que conozcas a los estudiantes, luego construye actividades que realmente se conecten con lo que estan aprendiendo.',
          day: 'Semana 2',
        },
      },
    ],
  },

  // LEADER SET
  {
    role: 'leader',
    en: {
      title: 'Leader: First Five Days',
      context: 'School starts Monday. You have 12 things on your leadership to-do list but only bandwidth for 8. What matters most?',
    },
    es: {
      title: 'Lider: Primeros Cinco Dias',
      context: 'La escuela comienza el lunes. Tienes 12 cosas en tu lista de liderazgo pero solo capacidad para 8. Que es lo mas importante?',
    },
    items: [
      {
        id: 'leader_visible',
        en: {
          task: 'Be visible in hallways and classrooms the first 3 days. Not in your office.',
          description: 'Greet students at the door, walk the halls during transitions, be present in the cafeteria.',
          priority: 'essential',
          rationale: 'Marzano found that visible leadership in the first week sets the behavioral and cultural tone for the entire year. Every minute you spend in your office during the first three days is a missed opportunity to build trust with students and staff. Your presence says "this school matters to me."',
          day: 'Day 1 through Day 3',
        },
        es: {
          task: 'Se visible en los pasillos y salones los primeros 3 dias. No en tu oficina.',
          description: 'Saluda a los estudiantes en la puerta, camina por los pasillos durante las transiciones, estate presente en la cafeteria.',
          priority: 'essential',
          rationale: 'Marzano encontro que el liderazgo visible en la primera semana establece el tono conductual y cultural para todo el ano. Cada minuto que pasas en tu oficina durante los primeros tres dias es una oportunidad perdida para construir confianza con estudiantes y personal. Tu presencia dice "esta escuela me importa."',
          day: 'Dia 1 a Dia 3',
        },
      },
      {
        id: 'leader_new_staff_names',
        en: {
          task: 'Learn every new staff member\'s name and one personal detail',
          description: 'Go beyond the name tag. Know something about each new hire that is not on their resume.',
          priority: 'essential',
          rationale: 'New staff decide in the first week whether they belong. A principal who knows their name (and asks about their dog, their commute, their previous school) signals "I see you as a person, not a position." This is the beginning of retention.',
          day: 'Day 1 and Day 2',
        },
        es: {
          task: 'Aprende el nombre de cada nuevo miembro del personal y un detalle personal',
          description: 'Ve mas alla de la etiqueta con el nombre. Conoce algo sobre cada nueva contratacion que no este en su curriculum.',
          priority: 'essential',
          rationale: 'El nuevo personal decide en la primera semana si pertenece. Un director que sabe su nombre (y pregunta sobre su perro, su viaje al trabajo, su escuela anterior) senala "te veo como persona, no como un puesto." Este es el comienzo de la retencion.',
          day: 'Dia 1 y Dia 2',
        },
      },
      {
        id: 'leader_staff_meeting',
        en: {
          task: 'Set the tone at the first all-staff meeting (culture over logistics)',
          description: 'Spend more time on why than on what. Share your vision, tell a story, connect to purpose. Save the handbook for an email.',
          priority: 'essential',
          rationale: 'The first staff meeting either inspires or deflates. If you spend 45 minutes on parking procedures and dress code, you have told your staff what you value. If you spend 45 minutes on why this work matters and what you are excited about, you have given them a reason to care. Logistics can be an email.',
          day: 'Before Day 1',
        },
        es: {
          task: 'Establece el tono en la primera reunion de todo el personal (cultura sobre logistica)',
          description: 'Pasa mas tiempo en el por que que en el que. Comparte tu vision, cuenta una historia, conecta con el proposito. Guarda el manual para un correo.',
          priority: 'essential',
          rationale: 'La primera reunion de personal o inspira o desinfla. Si pasas 45 minutos en procedimientos de estacionamiento y codigo de vestimenta, le has dicho a tu personal lo que valoras. Si pasas 45 minutos en por que este trabajo importa y que te emociona, les has dado una razon para importarles. La logistica puede ser un correo.',
          day: 'Antes del Dia 1',
        },
      },
      {
        id: 'leader_walkthroughs',
        en: {
          task: 'Walk every classroom in the first 2 days. Brief, warm, not evaluative.',
          description: 'Pop in, smile, greet students, give a thumbs up to the teacher. Three minutes max. This is not an observation.',
          priority: 'essential',
          rationale: 'Teachers who see their principal in the first two days feel supported. Teachers who do not see their principal until October feel abandoned. A brief, warm walkthrough is not about evaluation. It is about presence. You are saying "I know you are here and I care how it is going."',
          day: 'Day 1 and Day 2',
        },
        es: {
          task: 'Visita cada salon en los primeros 2 dias. Breve, calido, no evaluativo.',
          description: 'Entra, sonrie, saluda a los estudiantes, dale un pulgar arriba al maestro. Tres minutos maximo. Esto no es una observacion.',
          priority: 'essential',
          rationale: 'Los maestros que ven a su director en los primeros dos dias se sienten apoyados. Los maestros que no ven a su director hasta octubre se sienten abandonados. Una visita breve y calida no se trata de evaluacion. Se trata de presencia. Estas diciendo "se que estas aqui y me importa como te va."',
          day: 'Dia 1 y Dia 2',
        },
      },
      {
        id: 'leader_first_year',
        en: {
          task: 'Check in with first-year teachers individually',
          description: 'A private, 10 minute conversation. How are you feeling? What do you need? I am here.',
          priority: 'essential',
          rationale: 'Nearly 50% of teachers leave the profession within five years, and most of them decide in the first semester. A principal who checks in personally during Week 1 reduces that risk. This is not a meeting. It is a human moment. Ask how they are doing, not what they are doing.',
          day: 'Day 2 or Day 3',
        },
        es: {
          task: 'Habla individualmente con los maestros de primer ano',
          description: 'Una conversacion privada de 10 minutos. Como te sientes? Que necesitas? Estoy aqui.',
          priority: 'essential',
          rationale: 'Casi el 50% de los maestros dejan la profesion dentro de cinco anos, y la mayoria decide en el primer semestre. Un director que habla personalmente durante la Semana 1 reduce ese riesgo. Esto no es una reunion. Es un momento humano. Pregunta como estan, no que estan haciendo.',
          day: 'Dia 2 o Dia 3',
        },
      },
      {
        id: 'leader_schedules',
        en: {
          task: 'Ensure every student is in the right class with the right schedule',
          description: 'Check for scheduling errors, missing students, and kids sitting in the wrong room on Day 1.',
          priority: 'essential',
          rationale: 'A student who shows up on Day 1 and is told "you are not on my list" feels like they do not belong. Scheduling errors on Day 1 create chaos that ripples for weeks. This is a logistical task that has emotional impact. Get it right before the doors open.',
          day: 'Before Day 1',
        },
        es: {
          task: 'Asegurate de que cada estudiante este en la clase correcta con el horario correcto',
          description: 'Verifica errores de horario, estudiantes faltantes y ninos sentados en el salon equivocado el Dia 1.',
          priority: 'essential',
          rationale: 'Un estudiante que llega el Dia 1 y le dicen "no estas en mi lista" siente que no pertenece. Los errores de horario el Dia 1 crean caos que repercute durante semanas. Esta es una tarea logistica que tiene impacto emocional. Hazlo bien antes de que se abran las puertas.',
          day: 'Antes del Dia 1',
        },
      },
      {
        id: 'leader_operations',
        en: {
          task: 'Review bus routes, lunch schedules, and dismissal procedures with staff',
          description: 'Make sure every adult in the building knows the operational flow of the day.',
          priority: 'important',
          rationale: 'Operations matter, but they are not what makes or breaks the year. A smooth bus line is important. A warm, connected school culture is essential. Handle operations in a shared document or quick email. Do not let logistics consume your leadership bandwidth in Week 1.',
          day: 'Before Day 1',
        },
        es: {
          task: 'Revisa las rutas de autobus, horarios de almuerzo y procedimientos de salida con el personal',
          description: 'Asegurate de que cada adulto en el edificio conozca el flujo operativo del dia.',
          priority: 'important',
          rationale: 'Las operaciones importan, pero no son lo que hace o deshace el ano. Una fila de autobus fluida es importante. Una cultura escolar calida y conectada es esencial. Maneja las operaciones en un documento compartido o un correo rapido. No dejes que la logistica consuma tu capacidad de liderazgo en la Semana 1.',
          day: 'Antes del Dia 1',
        },
      },
      {
        id: 'leader_welcome_families',
        en: {
          task: 'Send a welcome message to families from you personally',
          description: 'Not a mass email from the district. A message from you, the principal, welcoming families to this school, this year.',
          priority: 'important',
          rationale: 'Families who hear from the principal directly feel valued. But this can be a short video, a postcard, or a brief email sent in the first week. It does not have to happen before Day 1. The key is that it comes from you, not the front office.',
          day: 'Day 1 through Day 3',
        },
        es: {
          task: 'Envia un mensaje de bienvenida a las familias de tu parte personalmente',
          description: 'No un correo masivo del distrito. Un mensaje de ti, el director, dando la bienvenida a las familias a esta escuela, este ano.',
          priority: 'important',
          rationale: 'Las familias que escuchan directamente del director se sienten valoradas. Pero esto puede ser un video corto, una postal o un correo breve enviado en la primera semana. No tiene que suceder antes del Dia 1. Lo clave es que venga de ti, no de la oficina principal.',
          day: 'Dia 1 a Dia 3',
        },
      },
      {
        id: 'leader_pd_calendar',
        en: {
          task: 'Finalize the PD calendar for the semester',
          description: 'Lock in professional development dates, topics, and facilitators for the next four months.',
          priority: 'can_wait',
          rationale: 'PD planning is important but not urgent in Week 1. Your teachers are not thinking about October PD right now. They are thinking about the 25 students walking through their door tomorrow. Finalize the PD calendar in September when you know what your staff actually needs.',
          day: 'Week 2',
        },
        es: {
          task: 'Finaliza el calendario de desarrollo profesional para el semestre',
          description: 'Confirma fechas, temas y facilitadores de desarrollo profesional para los proximos cuatro meses.',
          priority: 'can_wait',
          rationale: 'La planificacion de desarrollo profesional es importante pero no urgente en la Semana 1. Tus maestros no estan pensando en el PD de octubre ahora. Estan pensando en los 25 estudiantes que caminaran por su puerta manana. Finaliza el calendario de PD en septiembre cuando sepas lo que tu personal realmente necesita.',
          day: 'Semana 2',
        },
      },
      {
        id: 'leader_formal_obs',
        en: {
          task: 'Schedule formal observations',
          description: 'Set up the observation calendar and assign evaluation timelines for each teacher.',
          priority: 'can_wait',
          rationale: 'If the first thing teachers hear about is your observation schedule, you have told them what you prioritize: compliance over connection. Formal observations belong in September at the earliest. Week 1 is for being human, not being an evaluator.',
          day: 'Week 2',
        },
        es: {
          task: 'Programa observaciones formales',
          description: 'Configura el calendario de observaciones y asigna los plazos de evaluacion para cada maestro.',
          priority: 'can_wait',
          rationale: 'Si lo primero que los maestros escuchan es sobre tu calendario de observaciones, les has dicho lo que priorizas: cumplimiento sobre conexion. Las observaciones formales pertenecen a septiembre como minimo. La Semana 1 es para ser humano, no para ser evaluador.',
          day: 'Semana 2',
        },
      },
      {
        id: 'leader_front_office',
        en: {
          task: 'Reorganize the front office workflow',
          description: 'Redesign the check-in process, visitor procedures, and front desk systems.',
          priority: 'can_wait',
          rationale: 'The front office will survive another week with the current system. Your time in Week 1 is better spent with students and teachers than redesigning sign-in sheets. If the current system works (even imperfectly), leave it alone until you have bandwidth.',
          day: 'Week 2',
        },
        es: {
          task: 'Reorganiza el flujo de trabajo de la oficina principal',
          description: 'Redisena el proceso de registro, procedimientos de visitantes y sistemas de la recepcion.',
          priority: 'can_wait',
          rationale: 'La oficina principal sobrevivira otra semana con el sistema actual. Tu tiempo en la Semana 1 se aprovecha mejor con estudiantes y maestros que redisenando hojas de registro. Si el sistema actual funciona (aunque imperfectamente), dejalo hasta que tengas capacidad.',
          day: 'Semana 2',
        },
      },
      {
        id: 'leader_committees',
        en: {
          task: 'Set up committee structures',
          description: 'Form grade-level teams, PLC structures, and leadership committees for the year.',
          priority: 'can_wait',
          rationale: 'Committees are important for the long game but irrelevant in Week 1. Your staff is in survival mode right now. Asking them to sign up for committees before they have met their students is tone-deaf. Wait until Week 3 or 4 when they have found their rhythm.',
          day: 'Week 2',
        },
        es: {
          task: 'Establece estructuras de comites',
          description: 'Forma equipos por grado, estructuras de PLC y comites de liderazgo para el ano.',
          priority: 'can_wait',
          rationale: 'Los comites son importantes para el largo plazo pero irrelevantes en la Semana 1. Tu personal esta en modo de supervivencia ahora. Pedirles que se inscriban en comites antes de que hayan conocido a sus estudiantes es inapropiado. Espera hasta la Semana 3 o 4 cuando hayan encontrado su ritmo.',
          day: 'Semana 2',
        },
      },
    ],
  },
]
