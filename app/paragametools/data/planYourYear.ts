// Plan Your Year: Monthly priority game for the school year
// Category: Time Savers

export interface MonthDemand {
  id: string
  task: string
  description: string
  priority: boolean
  insight: string
}

export interface MonthRound {
  month: string
  en: {
    context: string
    demands: MonthDemand[]
    monthInsight: string
    burnoutRisk: 'low' | 'medium' | 'high'
  }
  es: {
    context: string
    demands: MonthDemand[]
    monthInsight: string
    burnoutRisk: 'low' | 'medium' | 'high'
  }
}

export const YEAR_ROUNDS: MonthRound[] = [
  // SEPTEMBER
  {
    month: 'September',
    en: {
      context: 'First month. Everything feels urgent.',
      demands: [
        {
          id: 'sep_lessons',
          task: 'Perfect your lesson plans for the first unit',
          description: 'Spend extra hours polishing every detail of your opening unit before students arrive.',
          priority: false,
          insight: 'Good enough is good enough in September. Relationships matter more than perfect content.',
        },
        {
          id: 'sep_names',
          task: 'Learn every student\'s name and one thing about them',
          description: 'Use name tents, photos, and genuine conversations to know every student by Week 3.',
          priority: true,
          insight: 'Students who feel known by Week 3 have better outcomes all year.',
        },
        {
          id: 'sep_data',
          task: 'Set up all your data tracking systems',
          description: 'Build spreadsheets, trackers, and documentation templates before the first assessment.',
          priority: false,
          insight: 'Start with one simple tracker. Build systems after you know your students.',
        },
        {
          id: 'sep_routines',
          task: 'Establish consistent daily routines',
          description: 'Teach, model, and practice entry, transitions, and dismissal until they are automatic.',
          priority: true,
          insight: 'Routines set in September hold through May. This is your highest-leverage month for structure.',
        },
      ],
      monthInsight: 'September is for planting. Relationships and routines. Everything else can wait.',
      burnoutRisk: 'low',
    },
    es: {
      context: 'Primer mes. Todo se siente urgente.',
      demands: [
        {
          id: 'sep_lessons',
          task: 'Perfecciona tus planes de leccion para la primera unidad',
          description: 'Dedica horas extra puliendo cada detalle de tu unidad de apertura antes de que lleguen los estudiantes.',
          priority: false,
          insight: 'Suficientemente bueno es suficiente en septiembre. Las relaciones importan mas que el contenido perfecto.',
        },
        {
          id: 'sep_names',
          task: 'Aprende el nombre de cada estudiante y una cosa sobre ellos',
          description: 'Usa tarjetas de nombres, fotos y conversaciones genuinas para conocer a cada estudiante para la Semana 3.',
          priority: true,
          insight: 'Los estudiantes que se sienten conocidos para la Semana 3 tienen mejores resultados todo el ano.',
        },
        {
          id: 'sep_data',
          task: 'Configura todos tus sistemas de seguimiento de datos',
          description: 'Construye hojas de calculo, rastreadores y plantillas de documentacion antes de la primera evaluacion.',
          priority: false,
          insight: 'Empieza con un rastreador simple. Construye sistemas despues de conocer a tus estudiantes.',
        },
        {
          id: 'sep_routines',
          task: 'Establece rutinas diarias consistentes',
          description: 'Ensena, modela y practica la entrada, transiciones y salida hasta que sean automaticas.',
          priority: true,
          insight: 'Las rutinas establecidas en septiembre se mantienen hasta mayo. Este es tu mes de mayor impacto para la estructura.',
        },
      ],
      monthInsight: 'Septiembre es para sembrar. Relaciones y rutinas. Todo lo demas puede esperar.',
      burnoutRisk: 'low',
    },
  },

  // OCTOBER
  {
    month: 'October',
    en: {
      context: 'The honeymoon is over. Real challenges emerge.',
      demands: [
        {
          id: 'oct_emails',
          task: 'Respond to every parent email within 24 hours',
          description: 'Stay on top of every message from families as soon as it comes in.',
          priority: false,
          insight: 'Set communication expectations, not reaction speed. Batch responses during planning time.',
        },
        {
          id: 'oct_boundaries',
          task: 'Address the 3 students who are testing boundaries',
          description: 'Have direct, compassionate conversations with students who are pushing limits.',
          priority: true,
          insight: 'October boundary-testing is normal. How you respond now sets the standard for the year.',
        },
        {
          id: 'oct_pd',
          task: 'Attend every optional PD and committee meeting',
          description: 'Say yes to every professional opportunity that comes your way.',
          priority: false,
          insight: 'Protect your energy. Say yes to what matters, no to what drains.',
        },
        {
          id: 'oct_refine',
          task: 'Refine your routines based on what is actually working',
          description: 'Observe which September systems are holding and which need adjustment.',
          priority: true,
          insight: 'September routines need October adjustments. Iterate, do not overhaul.',
        },
      ],
      monthInsight: 'October separates the sustainable from the sprint. Pace yourself.',
      burnoutRisk: 'medium',
    },
    es: {
      context: 'La luna de miel termino. Los verdaderos desafios emergen.',
      demands: [
        {
          id: 'oct_emails',
          task: 'Responde a cada correo de padres dentro de 24 horas',
          description: 'Mantente al dia con cada mensaje de las familias tan pronto como llegue.',
          priority: false,
          insight: 'Establece expectativas de comunicacion, no velocidad de reaccion. Agrupa respuestas durante tu tiempo de planificacion.',
        },
        {
          id: 'oct_boundaries',
          task: 'Aborda a los 3 estudiantes que estan probando limites',
          description: 'Ten conversaciones directas y compasivas con los estudiantes que estan presionando los limites.',
          priority: true,
          insight: 'Las pruebas de limites en octubre son normales. Como respondas ahora establece el estandar para el ano.',
        },
        {
          id: 'oct_pd',
          task: 'Asiste a cada PD y reunion de comite opcional',
          description: 'Di que si a cada oportunidad profesional que se te presente.',
          priority: false,
          insight: 'Protege tu energia. Di que si a lo que importa, no a lo que te drena.',
        },
        {
          id: 'oct_refine',
          task: 'Refina tus rutinas basandote en lo que realmente esta funcionando',
          description: 'Observa cuales sistemas de septiembre se mantienen y cuales necesitan ajuste.',
          priority: true,
          insight: 'Las rutinas de septiembre necesitan ajustes de octubre. Itera, no revises todo.',
        },
      ],
      monthInsight: 'Octubre separa lo sostenible del sprint. Controla tu ritmo.',
      burnoutRisk: 'medium',
    },
  },

  // NOVEMBER
  {
    month: 'November',
    en: {
      context: 'Short month. Holidays. Conference season.',
      demands: [
        {
          id: 'nov_conferences',
          task: 'Prepare thorough conference notes for every student',
          description: 'Document progress, challenges, and goals for each family conversation.',
          priority: true,
          insight: 'Conferences build parent trust that carries through spring. Invest here.',
        },
        {
          id: 'nov_content',
          task: 'Push through new content before Thanksgiving break',
          description: 'Try to cover as much curriculum as possible before the holiday week.',
          priority: false,
          insight: 'Students retain almost nothing the week before a break. Use that time for relationship and review.',
        },
        {
          id: 'nov_energy',
          task: 'Check in on your own energy and boundaries',
          description: 'Notice your sleep, stress levels, and whether you are saying yes to too much.',
          priority: true,
          insight: 'November is when burnout seeds get planted. Notice your patterns now.',
        },
        {
          id: 'nov_holiday',
          task: 'Volunteer for the holiday event planning committee',
          description: 'Sign up to help organize the school holiday celebration.',
          priority: false,
          insight: 'Someone else can do this. Guard your prep time.',
        },
      ],
      monthInsight: 'November is survival. Protect yourself so you can show up in December.',
      burnoutRisk: 'high',
    },
    es: {
      context: 'Mes corto. Dias festivos. Temporada de conferencias.',
      demands: [
        {
          id: 'nov_conferences',
          task: 'Prepara notas detalladas de conferencia para cada estudiante',
          description: 'Documenta el progreso, desafios y metas para cada conversacion con las familias.',
          priority: true,
          insight: 'Las conferencias construyen confianza con los padres que se mantiene hasta la primavera. Invierte aqui.',
        },
        {
          id: 'nov_content',
          task: 'Avanza con contenido nuevo antes del receso de Accion de Gracias',
          description: 'Intenta cubrir la mayor cantidad de curriculo posible antes de la semana festiva.',
          priority: false,
          insight: 'Los estudiantes retienen casi nada la semana antes de un receso. Usa ese tiempo para relaciones y repaso.',
        },
        {
          id: 'nov_energy',
          task: 'Revisa tu propia energia y limites',
          description: 'Observa tu sueno, niveles de estres y si estas diciendo que si a demasiado.',
          priority: true,
          insight: 'Noviembre es cuando se siembran las semillas del agotamiento. Nota tus patrones ahora.',
        },
        {
          id: 'nov_holiday',
          task: 'Ofrece ser voluntario para el comite de planificacion del evento festivo',
          description: 'Inscribete para ayudar a organizar la celebracion festiva de la escuela.',
          priority: false,
          insight: 'Alguien mas puede hacer esto. Protege tu tiempo de preparacion.',
        },
      ],
      monthInsight: 'Noviembre es supervivencia. Protegete para poder presentarte en diciembre.',
      burnoutRisk: 'high',
    },
  },

  // DECEMBER
  {
    month: 'December',
    en: {
      context: 'End of semester. Energy is low. Expectations are high.',
      demands: [
        {
          id: 'dec_exam',
          task: 'Create an elaborate final exam or project',
          description: 'Design a complex, multi-part assessment that covers everything from the semester.',
          priority: false,
          insight: 'A simple, meaningful reflection assessment works better than a complex final when everyone is exhausted.',
        },
        {
          id: 'dec_notes',
          task: 'Write personal notes to 5 students who need encouragement',
          description: 'Handwrite short, specific notes for students who are struggling or overlooked.',
          priority: true,
          insight: 'A handwritten note in December can carry a student through January.',
        },
        {
          id: 'dec_gradebook',
          task: 'Close out your gradebook with precision',
          description: 'Ensure every grade is accurate, every missing assignment is documented, and records are clean.',
          priority: true,
          insight: 'Clean data now prevents January headaches. This is a professional obligation.',
        },
        {
          id: 'dec_party',
          task: 'Plan a class celebration or fun day',
          description: 'Organize a party, movie day, or special event for the last day before break.',
          priority: false,
          insight: 'Nice but not essential. If it adds stress, skip it. Your presence is the gift.',
        },
      ],
      monthInsight: 'December tests your boundaries. Do less, but do it with intention.',
      burnoutRisk: 'high',
    },
    es: {
      context: 'Fin del semestre. La energia esta baja. Las expectativas son altas.',
      demands: [
        {
          id: 'dec_exam',
          task: 'Crea un examen o proyecto final elaborado',
          description: 'Disena una evaluacion compleja de multiples partes que cubra todo el semestre.',
          priority: false,
          insight: 'Una evaluacion de reflexion simple y significativa funciona mejor que un examen complejo cuando todos estan agotados.',
        },
        {
          id: 'dec_notes',
          task: 'Escribe notas personales a 5 estudiantes que necesitan animo',
          description: 'Escribe a mano notas cortas y especificas para estudiantes que estan luchando o pasados por alto.',
          priority: true,
          insight: 'Una nota escrita a mano en diciembre puede llevar a un estudiante hasta enero.',
        },
        {
          id: 'dec_gradebook',
          task: 'Cierra tu libro de calificaciones con precision',
          description: 'Asegurate de que cada calificacion sea precisa, cada tarea faltante este documentada y los registros esten limpios.',
          priority: true,
          insight: 'Datos limpios ahora previenen dolores de cabeza en enero. Esta es una obligacion profesional.',
        },
        {
          id: 'dec_party',
          task: 'Planifica una celebracion de clase o dia divertido',
          description: 'Organiza una fiesta, dia de pelicula o evento especial para el ultimo dia antes del receso.',
          priority: false,
          insight: 'Agradable pero no esencial. Si agrega estres, saltalo. Tu presencia es el regalo.',
        },
      ],
      monthInsight: 'Diciembre pone a prueba tus limites. Haz menos, pero hazlo con intencion.',
      burnoutRisk: 'high',
    },
  },

  // JANUARY
  {
    month: 'January',
    en: {
      context: 'New semester energy. Fresh start opportunity.',
      demands: [
        {
          id: 'jan_redesign',
          task: 'Redesign your entire classroom layout',
          description: 'Rearrange desks, stations, and displays for a completely new look.',
          priority: false,
          insight: 'Small adjustments beat overhauls. Change one thing, not everything.',
        },
        {
          id: 'jan_reset',
          task: 'Reset expectations and routines for the new semester',
          description: 'Re-teach and re-practice the routines that have slipped since September.',
          priority: true,
          insight: 'January is your second September. Use it.',
        },
        {
          id: 'jan_goals',
          task: 'Set personal goals for the spring semester',
          description: 'Reflect on fall and choose 2 to 3 intentional growth areas for spring.',
          priority: true,
          insight: 'Educators who set intentional spring goals report higher satisfaction by May.',
        },
        {
          id: 'jan_grading',
          task: 'Catch up on all the grading from December',
          description: 'Power through the stack of ungraded work that piled up before break.',
          priority: false,
          insight: 'Let December go. Start fresh. Students have moved on.',
        },
      ],
      monthInsight: 'January is a gift. A real reset. Use it to rebuild, not to catch up.',
      burnoutRisk: 'low',
    },
    es: {
      context: 'Energia de nuevo semestre. Oportunidad de empezar de nuevo.',
      demands: [
        {
          id: 'jan_redesign',
          task: 'Redisena todo el layout de tu salon',
          description: 'Reorganiza escritorios, estaciones y exhibiciones para un aspecto completamente nuevo.',
          priority: false,
          insight: 'Los ajustes pequenos superan a las renovaciones. Cambia una cosa, no todo.',
        },
        {
          id: 'jan_reset',
          task: 'Restablece expectativas y rutinas para el nuevo semestre',
          description: 'Re-ensena y re-practica las rutinas que se han relajado desde septiembre.',
          priority: true,
          insight: 'Enero es tu segundo septiembre. Usalo.',
        },
        {
          id: 'jan_goals',
          task: 'Establece metas personales para el semestre de primavera',
          description: 'Reflexiona sobre el otono y elige 2 a 3 areas de crecimiento intencional para la primavera.',
          priority: true,
          insight: 'Los educadores que establecen metas intencionales para la primavera reportan mayor satisfaccion para mayo.',
        },
        {
          id: 'jan_grading',
          task: 'Ponte al dia con todas las calificaciones de diciembre',
          description: 'Avanza con la pila de trabajo sin calificar que se acumulo antes del receso.',
          priority: false,
          insight: 'Deja ir diciembre. Empieza fresco. Los estudiantes ya siguieron adelante.',
        },
      ],
      monthInsight: 'Enero es un regalo. Un reinicio real. Usalo para reconstruir, no para ponerte al dia.',
      burnoutRisk: 'low',
    },
  },

  // FEBRUARY
  {
    month: 'February',
    en: {
      context: 'The long stretch. No breaks in sight.',
      demands: [
        {
          id: 'feb_strategy',
          task: 'Implement a new instructional strategy you have been wanting to try',
          description: 'Take advantage of established routines to experiment with something new.',
          priority: true,
          insight: 'February is stable enough to experiment. Try something new while routines are solid.',
        },
        {
          id: 'feb_mentor',
          task: 'Take on a mentoring role for a struggling colleague',
          description: 'Offer to support another educator who is having a tough year.',
          priority: false,
          insight: 'You cannot pour from an empty cup in February. Help if you have margin, not obligation.',
        },
        {
          id: 'feb_breaks',
          task: 'Build in micro-breaks for yourself every day',
          description: 'Schedule 5 minute resets between classes or during transitions.',
          priority: true,
          insight: 'February through March is the highest burnout window of the year. Daily resets are not optional.',
        },
        {
          id: 'feb_clean',
          task: 'Deep-clean and reorganize your classroom',
          description: 'Sort supplies, purge old papers, and restore order to your space.',
          priority: false,
          insight: 'Your room is fine. Your energy is more valuable than an organized supply closet.',
        },
      ],
      monthInsight: 'February is the marathon mile where people quit. Daily resets. Small wins. Keep going.',
      burnoutRisk: 'high',
    },
    es: {
      context: 'El tramo largo. Ningun receso a la vista.',
      demands: [
        {
          id: 'feb_strategy',
          task: 'Implementa una nueva estrategia de instruccion que has querido probar',
          description: 'Aprovecha las rutinas establecidas para experimentar con algo nuevo.',
          priority: true,
          insight: 'Febrero es lo suficientemente estable para experimentar. Prueba algo nuevo mientras las rutinas son solidas.',
        },
        {
          id: 'feb_mentor',
          task: 'Asume un rol de mentor para un colega que esta luchando',
          description: 'Ofrece apoyar a otro educador que esta teniendo un ano dificil.',
          priority: false,
          insight: 'No puedes dar de una taza vacia en febrero. Ayuda si tienes margen, no por obligacion.',
        },
        {
          id: 'feb_breaks',
          task: 'Incorpora micro-descansos para ti todos los dias',
          description: 'Programa reinicios de 5 minutos entre clases o durante transiciones.',
          priority: true,
          insight: 'De febrero a marzo es la ventana de mayor agotamiento del ano. Los reinicios diarios no son opcionales.',
        },
        {
          id: 'feb_clean',
          task: 'Limpia a fondo y reorganiza tu salon',
          description: 'Ordena materiales, purga papeles viejos y restaura el orden en tu espacio.',
          priority: false,
          insight: 'Tu salon esta bien. Tu energia es mas valiosa que un armario de materiales organizado.',
        },
      ],
      monthInsight: 'Febrero es la milla del maraton donde la gente se rinde. Reinicios diarios. Pequenas victorias. Sigue adelante.',
      burnoutRisk: 'high',
    },
  },

  // MARCH
  {
    month: 'March',
    en: {
      context: 'Testing season approaches. Spring break is close.',
      demands: [
        {
          id: 'mar_testprep',
          task: 'Start test prep and review sessions',
          description: 'Shift instruction toward standardized test preparation and practice exams.',
          priority: false,
          insight: 'Good teaching all year is the best test prep. Last-minute cramming increases anxiety without improving scores.',
        },
        {
          id: 'mar_checkins',
          task: 'Have individual check-ins with students who are struggling',
          description: 'Sit down one-on-one with students who are falling behind or disengaging.',
          priority: true,
          insight: 'March is when struggling students decide if they will try in April or give up. Reach them now.',
        },
        {
          id: 'mar_lookforward',
          task: 'Plan something you are looking forward to for spring break',
          description: 'Book a trip, schedule a rest day, or plan something that fills your cup.',
          priority: true,
          insight: 'Having something to look forward to is a research-backed burnout prevention strategy.',
        },
        {
          id: 'mar_event',
          task: 'Volunteer to lead the spring event or fundraiser',
          description: 'Take charge of organizing a school-wide spring event.',
          priority: false,
          insight: 'March is not the month to add things. It is the month to protect what you have.',
        },
      ],
      monthInsight: 'March is about endurance. Focus on the students in front of you, not the test behind you.',
      burnoutRisk: 'high',
    },
    es: {
      context: 'La temporada de examenes se acerca. El receso de primavera esta cerca.',
      demands: [
        {
          id: 'mar_testprep',
          task: 'Comienza la preparacion para examenes y sesiones de repaso',
          description: 'Cambia la instruccion hacia la preparacion de examenes estandarizados y examenes de practica.',
          priority: false,
          insight: 'La buena ensenanza durante todo el ano es la mejor preparacion para examenes. El repaso de ultimo minuto aumenta la ansiedad sin mejorar los puntajes.',
        },
        {
          id: 'mar_checkins',
          task: 'Ten conversaciones individuales con estudiantes que estan luchando',
          description: 'Sientate uno a uno con estudiantes que se estan quedando atras o desconectando.',
          priority: true,
          insight: 'Marzo es cuando los estudiantes que luchan deciden si lo intentaran en abril o se rendiran. Alcanzalos ahora.',
        },
        {
          id: 'mar_lookforward',
          task: 'Planifica algo que esperes con ganas para el receso de primavera',
          description: 'Reserva un viaje, programa un dia de descanso o planifica algo que te llene.',
          priority: true,
          insight: 'Tener algo que esperar con ganas es una estrategia de prevencion de agotamiento respaldada por la investigacion.',
        },
        {
          id: 'mar_event',
          task: 'Ofrece liderar el evento de primavera o recaudacion de fondos',
          description: 'Toma la iniciativa de organizar un evento de primavera para toda la escuela.',
          priority: false,
          insight: 'Marzo no es el mes para agregar cosas. Es el mes para proteger lo que tienes.',
        },
      ],
      monthInsight: 'Marzo es sobre resistencia. Enfocate en los estudiantes frente a ti, no en el examen detras de ti.',
      burnoutRisk: 'high',
    },
  },

  // APRIL
  {
    month: 'April',
    en: {
      context: 'Post-break re-entry. Testing. Spring energy.',
      demands: [
        {
          id: 'apr_routines',
          task: 'Re-establish routines after spring break',
          description: 'Spend the first days back re-teaching expectations and rebuilding momentum.',
          priority: true,
          insight: 'Post-break re-entry needs the same intentionality as September. Do not assume students remember.',
        },
        {
          id: 'apr_testing',
          task: 'Administer and analyze standardized assessments',
          description: 'Complete required testing and review the data to understand student needs.',
          priority: true,
          insight: 'This is a professional requirement. Do it well, but do not let it consume everything else.',
        },
        {
          id: 'apr_nextyear',
          task: 'Start planning for next year\'s curriculum',
          description: 'Begin mapping out units, resources, and pacing for the following school year.',
          priority: false,
          insight: 'April is for finishing this year strong, not starting next year early.',
        },
        {
          id: 'apr_fieldtrip',
          task: 'Organize an end-of-year field trip or celebration',
          description: 'Start planning a big end-of-year event for your students.',
          priority: false,
          insight: 'Fun matters, but April is not the time to plan it. May is.',
        },
      ],
      monthInsight: 'April is re-entry plus testing. Stay grounded. This too shall pass.',
      burnoutRisk: 'medium',
    },
    es: {
      context: 'Re-entrada despues del receso. Examenes. Energia de primavera.',
      demands: [
        {
          id: 'apr_routines',
          task: 'Restablece las rutinas despues del receso de primavera',
          description: 'Dedica los primeros dias de regreso a re-ensenar expectativas y reconstruir el impulso.',
          priority: true,
          insight: 'La re-entrada despues del receso necesita la misma intencionalidad que septiembre. No asumas que los estudiantes recuerdan.',
        },
        {
          id: 'apr_testing',
          task: 'Administra y analiza las evaluaciones estandarizadas',
          description: 'Completa los examenes requeridos y revisa los datos para entender las necesidades de los estudiantes.',
          priority: true,
          insight: 'Este es un requisito profesional. Hazlo bien, pero no dejes que consuma todo lo demas.',
        },
        {
          id: 'apr_nextyear',
          task: 'Comienza a planificar el curriculo del proximo ano',
          description: 'Empieza a mapear unidades, recursos y ritmo para el siguiente ano escolar.',
          priority: false,
          insight: 'Abril es para terminar este ano fuerte, no para comenzar el proximo temprano.',
        },
        {
          id: 'apr_fieldtrip',
          task: 'Organiza una excursion o celebracion de fin de ano',
          description: 'Comienza a planificar un gran evento de fin de ano para tus estudiantes.',
          priority: false,
          insight: 'La diversion importa, pero abril no es el momento de planificarlo. Mayo si.',
        },
      ],
      monthInsight: 'Abril es re-entrada mas examenes. Mantente firme. Esto tambien pasara.',
      burnoutRisk: 'medium',
    },
  },

  // MAY
  {
    month: 'May',
    en: {
      context: 'The finish line. Emotions are high.',
      demands: [
        {
          id: 'may_closure',
          task: 'Create meaningful closure activities for your students',
          description: 'Design reflection activities, letters, or rituals that honor the year together.',
          priority: true,
          insight: 'How students leave your classroom matters as much as how they entered it. Close with intention.',
        },
        {
          id: 'may_admin',
          task: 'Complete all administrative end-of-year tasks',
          description: 'Finish records, reports, inventory, and everything required before you leave for summer.',
          priority: true,
          insight: 'Finishing strong professionally protects your reputation and your summer peace of mind.',
        },
        {
          id: 'may_plan',
          task: 'Plan next year\'s classroom setup in detail',
          description: 'Design your room layout, order supplies, and create a full plan for August.',
          priority: false,
          insight: 'You will be a different educator in August. Let future you make those decisions.',
        },
        {
          id: 'may_events',
          task: 'Attend every end-of-year event and ceremony',
          description: 'Show up to every awards night, concert, picnic, and graduation.',
          priority: false,
          insight: 'Pick the ones that matter to you. You do not owe your presence to every event.',
        },
      ],
      monthInsight: 'May is for closure. Close the year with the same care you opened it.',
      burnoutRisk: 'medium',
    },
    es: {
      context: 'La linea de meta. Las emociones estan altas.',
      demands: [
        {
          id: 'may_closure',
          task: 'Crea actividades significativas de cierre para tus estudiantes',
          description: 'Disena actividades de reflexion, cartas o rituales que honren el ano juntos.',
          priority: true,
          insight: 'Como los estudiantes dejan tu salon importa tanto como como entraron. Cierra con intencion.',
        },
        {
          id: 'may_admin',
          task: 'Completa todas las tareas administrativas de fin de ano',
          description: 'Termina registros, reportes, inventario y todo lo requerido antes de irte de verano.',
          priority: true,
          insight: 'Terminar fuerte profesionalmente protege tu reputacion y tu tranquilidad de verano.',
        },
        {
          id: 'may_plan',
          task: 'Planifica la configuracion del salon del proximo ano en detalle',
          description: 'Disena el layout de tu salon, pide materiales y crea un plan completo para agosto.',
          priority: false,
          insight: 'Seras un educador diferente en agosto. Deja que tu yo futuro tome esas decisiones.',
        },
        {
          id: 'may_events',
          task: 'Asiste a cada evento y ceremonia de fin de ano',
          description: 'Presentate a cada noche de premios, concierto, picnic y graduacion.',
          priority: false,
          insight: 'Elige los que te importan. No le debes tu presencia a cada evento.',
        },
      ],
      monthInsight: 'Mayo es para el cierre. Cierra el ano con el mismo cuidado con el que lo abriste.',
      burnoutRisk: 'medium',
    },
  },
]
