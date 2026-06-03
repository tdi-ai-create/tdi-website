// Energy Budget -- allocate 100 energy points across a day's tasks

export interface EnergyTask {
  en: string
  es: string
  expertAllocation: number  // what experienced educators would give
  explanation: { en: string; es: string }
}

export interface EnergyRound {
  en: { situation: string }
  es: { situation: string }
  tasks: EnergyTask[]
}

export const ENERGY_ROUNDS: EnergyRound[] = [
  {
    en: { situation: 'It is a typical Tuesday. You have a full teaching day ahead, a stack of ungraded work, a team meeting after school, and you promised yourself you would leave by 4:30.' },
    es: { situation: 'Es un martes tipico. Tienes un dia completo de ensenanza, un monton de trabajo sin calificar, una reunion de equipo despues de clases y te prometiste salir a las 4:30.' },
    tasks: [
      { en: 'Lesson delivery and student interaction', es: 'Impartir lecciones e interactuar con estudiantes', expertAllocation: 40, explanation: { en: 'This is the core of your job and the thing only you can do. Give it the biggest share -- nothing else matters if this falls apart.', es: 'Este es el nucleo de tu trabajo y lo unico que solo tu puedes hacer.' } },
      { en: 'Grading and feedback', es: 'Calificar y dar retroalimentacion', expertAllocation: 20, explanation: { en: 'Important but can be batched. Give enough energy to make meaningful progress, not to finish everything today.', es: 'Importante pero se puede agrupar. Da suficiente energia para avanzar significativamente.' } },
      { en: 'Team meeting prep and participation', es: 'Preparacion y participacion en reunion de equipo', expertAllocation: 15, explanation: { en: 'Show up prepared but do not over-invest. A focused 15 minutes of prep beats an hour of anxiety about it.', es: 'Llega preparado pero no inviertas demasiado.' } },
      { en: 'Email and parent communication', es: 'Correo electronico y comunicacion con padres', expertAllocation: 10, explanation: { en: 'Batch it. Two focused email blocks (morning and after lunch) beat checking every 10 minutes all day.', es: 'Agrupalo. Dos bloques de correo al dia ganan a revisar cada 10 minutos.' } },
      { en: 'Personal reset (lunch, walk, breathing)', es: 'Recarga personal (almuerzo, caminata, respiracion)', expertAllocation: 15, explanation: { en: 'This is not optional -- it is what makes everything else sustainable. Skipping this is borrowing from tomorrow.', es: 'Esto no es opcional -- es lo que hace todo lo demas sostenible.' } },
    ],
  },
  {
    en: { situation: 'It is the week before winter break. Students are checked out, you have report cards due Friday, and three parents want conferences this week.' },
    es: { situation: 'Es la semana antes de las vacaciones de invierno. Los estudiantes estan desconectados, tienes boletas para el viernes y tres padres quieren conferencias esta semana.' },
    tasks: [
      { en: 'Keeping students engaged despite low motivation', es: 'Mantener a los estudiantes involucrados a pesar de la baja motivacion', expertAllocation: 25, explanation: { en: 'Lower the bar on rigor, raise the bar on connection. Fun, meaningful activities beat fighting a losing battle against holiday brain.', es: 'Baja la barra del rigor, sube la barra de la conexion.' } },
      { en: 'Report cards and grades', es: 'Boletas y calificaciones', expertAllocation: 35, explanation: { en: 'This has a hard deadline and cannot be delegated. Give it the biggest share this week -- it is temporary.', es: 'Esto tiene una fecha limite firme y no se puede delegar.' } },
      { en: 'Parent conferences', es: 'Conferencias con padres', expertAllocation: 20, explanation: { en: 'These matter but keep them focused. 15-minute blocks, clear agenda, actionable takeaways. Do not let them expand into therapy sessions.', es: 'Estas importan pero mantenlas enfocadas. Bloques de 15 minutos con agenda clara.' } },
      { en: 'Holiday classroom activities and celebrations', es: 'Actividades y celebraciones navidenas del salon', expertAllocation: 10, explanation: { en: 'A small investment here pays off in student goodwill and memories. But it should not consume your week.', es: 'Una pequena inversion aqui da frutos en buena voluntad y recuerdos.' } },
      { en: 'Your own rest and boundaries', es: 'Tu propio descanso y limites', expertAllocation: 10, explanation: { en: 'You cannot pour from an empty cup, especially going into break. Protect at least something here.', es: 'No puedes dar de una copa vacia, especialmente antes de vacaciones.' } },
    ],
  },
  {
    en: { situation: 'You are a new teacher in your first year. Today you have a formal observation by your principal during 3rd period.' },
    es: { situation: 'Eres un maestro nuevo en tu primer ano. Hoy tienes una observacion formal de tu director durante el 3er periodo.' },
    tasks: [
      { en: 'Preparing the observed lesson', es: 'Preparar la leccion observada', expertAllocation: 30, explanation: { en: 'Important but do not over-prepare to the point of anxiety. A well-structured, authentic lesson beats a perfect performance that does not reflect your real teaching.', es: 'Importante pero no te prepares en exceso hasta el punto de la ansiedad.' } },
      { en: 'Teaching your other classes well', es: 'Ensenar bien tus otras clases', expertAllocation: 25, explanation: { en: 'Your other students deserve your presence too. Do not sacrifice 4 classes for 1 observation.', es: 'Tus otros estudiantes merecen tu presencia tambien.' } },
      { en: 'Managing your nerves and mindset', es: 'Manejar tus nervios y mentalidad', expertAllocation: 20, explanation: { en: 'A calm teacher teaches better than a prepared-but-panicking one. Take 5 minutes before 3rd period to breathe. This is not wasted time.', es: 'Un maestro tranquilo ensena mejor que uno preparado pero en panico.' } },
      { en: 'Documenting your lesson plan for the principal', es: 'Documentar tu plan de leccion para el director', expertAllocation: 15, explanation: { en: 'Helpful context for the observer but should not eat into teaching prep. A clear one-page plan beats a 10-page binder.', es: 'Contexto util para el observador pero no debe consumir tu preparacion.' } },
      { en: 'Worrying about what your mentor will think', es: 'Preocuparte por lo que pensara tu mentor', expertAllocation: 10, explanation: { en: 'Natural but unproductive. Channel this energy into something you can control, like your opening activity or transitions.', es: 'Natural pero improductivo. Canaliza esta energia en algo que puedas controlar.' } },
    ],
  },
  {
    en: { situation: 'A fight broke out between two students yesterday. Today you need to rebuild the classroom culture, teach your content, and document the incident for admin.' },
    es: { situation: 'Hubo una pelea entre dos estudiantes ayer. Hoy necesitas reconstruir la cultura del salon, ensenar tu contenido y documentar el incidente para la administracion.' },
    tasks: [
      { en: 'Rebuilding classroom safety and trust', es: 'Reconstruir la seguridad y confianza del salon', expertAllocation: 35, explanation: { en: 'Nothing else works until students feel safe. A restorative circle, a direct conversation, or even just acknowledging what happened takes priority over content today.', es: 'Nada mas funciona hasta que los estudiantes se sientan seguros.' } },
      { en: 'Teaching the planned content', es: 'Ensenar el contenido planeado', expertAllocation: 20, explanation: { en: 'Adjust expectations. Maybe today is a lighter lesson, a review, or a collaborative activity. The content can flex -- the culture cannot.', es: 'Ajusta las expectativas. Quizas hoy es una leccion mas ligera.' } },
      { en: 'Checking in with the students involved', es: 'Hablar con los estudiantes involucrados', expertAllocation: 20, explanation: { en: 'Both students need to know you care about them as people, not just about the incident. Separate conversations, not a public mediation.', es: 'Ambos estudiantes necesitan saber que te importan como personas.' } },
      { en: 'Incident documentation for admin', es: 'Documentacion del incidente para la administracion', expertAllocation: 15, explanation: { en: 'Important for the record but it can wait until your planning period or after school. Students first, paperwork second.', es: 'Importante para el registro pero puede esperar hasta tu periodo de planificacion.' } },
      { en: 'Maintaining your own emotional regulation', es: 'Mantener tu propia regulacion emocional', expertAllocation: 10, explanation: { en: 'If you are dysregulated, you cannot regulate the room. Even 5 minutes of intentional calm-down before class changes everything.', es: 'Si tu estas desregulado, no puedes regular el salon.' } },
    ],
  },
  {
    en: { situation: 'It is the first week of school. You have 30 new students, none of whom know your routines, your classroom layout, or each other.' },
    es: { situation: 'Es la primera semana de clases. Tienes 30 estudiantes nuevos, ninguno de los cuales conoce tus rutinas, tu salon o a los demas.' },
    tasks: [
      { en: 'Building relationships and community', es: 'Construir relaciones y comunidad', expertAllocation: 35, explanation: { en: 'This is THE investment. Everything else -- routines, content, management -- works 10x better when students feel connected to you and each other.', es: 'Esta es LA inversion. Todo lo demas funciona 10 veces mejor cuando los estudiantes se sienten conectados.' } },
      { en: 'Teaching routines and procedures', es: 'Ensenar rutinas y procedimientos', expertAllocation: 30, explanation: { en: 'The first week sets the tone for the year. Routines taught well now save hundreds of hours later. But teach them through relationship, not drill.', es: 'La primera semana establece el tono del ano.' } },
      { en: 'Covering academic content', es: 'Cubrir contenido academico', expertAllocation: 10, explanation: { en: 'Controversial but true: very little content should happen week 1. The foundation you build now IS the curriculum.', es: 'Controversial pero verdadero: muy poco contenido deberia pasar en la semana 1.' } },
      { en: 'Setting up your classroom space', es: 'Organizar tu espacio de salon', expertAllocation: 10, explanation: { en: 'Good enough is good enough for week 1. A perfectly decorated room does not teach kids your name or make them feel welcome.', es: 'Suficientemente bueno es suficiente para la semana 1.' } },
      { en: 'Assessing where students are academically', es: 'Evaluar donde estan los estudiantes academicamente', expertAllocation: 15, explanation: { en: 'Informal observation this week, formal assessment next. Watch, listen, and take notes. Standardized pre-tests can wait.', es: 'Observacion informal esta semana, evaluacion formal la siguiente.' } },
    ],
  },
]

export const ENERGY_ROUND_COUNT = 5
export const TOTAL_ENERGY = 100
