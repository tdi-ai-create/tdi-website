// Lean on Your TDI Team — scenario data (EN/ES)

export type EducatorRole = 'leader' | 'teacher' | 'para' | 'coach'

export interface LeanScenario {
  role: EducatorRole
  en: {
    context: string
    scenario: string
    choices: { text: string; diy: boolean }[]
    tdiSolution: string
    service: {
      name: string
      description: string
      type: 'team' | 'platform' | 'community'
    }
    leanType: string
  }
  es: {
    context: string
    scenario: string
    choices: { text: string; diy: boolean }[]
    tdiSolution: string
    service: {
      name: string
      description: string
      type: 'team' | 'platform' | 'community'
    }
    leanType: string
  }
}

export const LEAN_SCENARIO_COUNT = 8

export const LEAN_SCENARIOS: LeanScenario[] = [
  // =====================
  // LEADER SCENARIOS (10)
  // =====================
  {
    role: 'leader',
    en: {
      context: 'Board meeting is in two weeks. You need data.',
      scenario: 'The superintendent wants a report showing PD impact across your building. You need engagement numbers, completion data, and classroom observation trends. You have two weeks.',
      choices: [
        { text: 'Spend 4 hours pulling data from spreadsheets and formatting slides yourself.', diy: true },
        { text: 'Ask department chairs to send you their own PD logs by Friday.', diy: true },
        { text: 'Pull your Board Summary report from the Partner Dashboard. It is already there.', diy: false },
      ],
      tdiSolution: 'Your Partner Dashboard generates board-ready impact reports with real engagement data. No spreadsheets. No chasing department chairs.',
      service: {
        name: 'Partner Dashboard Board Summary',
        description: 'Auto-generated reports showing PD engagement, completion rates, and trends across your building.',
        type: 'platform',
      },
      leanType: 'I don\'t have time for this',
    },
    es: {
      context: 'La reunion de la junta es en dos semanas. Necesitas datos.',
      scenario: 'El superintendente quiere un informe que muestre el impacto del desarrollo profesional en tu edificio. Necesitas numeros de participacion, datos de completacion y tendencias de observaciones. Tienes dos semanas.',
      choices: [
        { text: 'Pasar 4 horas sacando datos de hojas de calculo y formateando diapositivas tu mismo.', diy: true },
        { text: 'Pedir a los jefes de departamento que te envien sus propios registros de PD para el viernes.', diy: true },
        { text: 'Sacar tu informe de resumen para la junta del Panel de Socios. Ya esta ahi.', diy: false },
      ],
      tdiSolution: 'Tu Panel de Socios genera informes listos para la junta con datos reales de participacion. Sin hojas de calculo. Sin perseguir a los jefes de departamento.',
      service: {
        name: 'Resumen para la Junta del Panel de Socios',
        description: 'Informes auto-generados que muestran la participacion en PD, tasas de completacion y tendencias en todo tu edificio.',
        type: 'platform',
      },
      leanType: 'No tengo tiempo para esto',
    },
  },
  {
    role: 'leader',
    en: {
      context: 'New school year. 14 new hires need access.',
      scenario: 'You just hired 14 new staff members. They all need Hub accounts with the right access levels before orientation week. IT says it will take them three days to process one-by-one.',
      choices: [
        { text: 'Create accounts one by one yourself over the weekend.', diy: true },
        { text: 'Wait for IT to process them and hope they finish before orientation.', diy: true },
        { text: 'Upload your roster file. Auto-provisioning handles the rest.', diy: false },
      ],
      tdiSolution: 'Roster upload with auto-provisioning creates all accounts at once with the correct access levels. Upload a file, walk away.',
      service: {
        name: 'Roster Upload with Auto-Provisioning',
        description: 'Bulk account creation from a roster file. Correct access levels, instant setup, no manual entry.',
        type: 'platform',
      },
      leanType: 'I don\'t have time for this',
    },
    es: {
      context: 'Nuevo ano escolar. 14 nuevas contrataciones necesitan acceso.',
      scenario: 'Acabas de contratar 14 nuevos miembros del personal. Todos necesitan cuentas del Hub con los niveles de acceso correctos antes de la semana de orientacion. TI dice que les tomara tres dias procesarlos uno por uno.',
      choices: [
        { text: 'Crear cuentas una por una tu mismo durante el fin de semana.', diy: true },
        { text: 'Esperar a que TI los procese y esperar que terminen antes de la orientacion.', diy: true },
        { text: 'Subir tu archivo de lista. El aprovisionamiento automatico se encarga del resto.', diy: false },
      ],
      tdiSolution: 'La carga de lista con aprovisionamiento automatico crea todas las cuentas a la vez con los niveles de acceso correctos. Sube un archivo y listo.',
      service: {
        name: 'Carga de Lista con Aprovisionamiento Automatico',
        description: 'Creacion masiva de cuentas desde un archivo de lista. Niveles de acceso correctos, configuracion instantanea, sin entrada manual.',
        type: 'platform',
      },
      leanType: 'No tengo tiempo para esto',
    },
  },
  {
    role: 'leader',
    en: {
      context: 'Post-observation week. You want to celebrate what you saw.',
      scenario: 'You just finished a round of classroom observations and saw some incredible teaching. You want to send personalized recognition to 12 educators, but writing 12 thoughtful emails will take your entire Sunday.',
      choices: [
        { text: 'Write all 12 emails yourself over the weekend.', diy: true },
        { text: 'Send a generic "great job everyone" email to the whole staff.', diy: true },
        { text: 'Use the Observation Tool. It drafts Love Notes from your notepad photos.', diy: false },
      ],
      tdiSolution: 'The Observation Tool reads your notepad photos and drafts personalized Love Notes that celebrate exactly what you saw. You review and send.',
      service: {
        name: 'Observation Tool Love Notes',
        description: 'AI-assisted recognition drafts generated from your observation notes. Personal, specific, and fast.',
        type: 'platform',
      },
      leanType: 'I don\'t have time for this',
    },
    es: {
      context: 'Semana post-observacion. Quieres celebrar lo que viste.',
      scenario: 'Acabas de terminar una ronda de observaciones y viste ensenanza increible. Quieres enviar reconocimiento personalizado a 12 educadores, pero escribir 12 correos reflexivos te tomara todo el domingo.',
      choices: [
        { text: 'Escribir los 12 correos tu mismo durante el fin de semana.', diy: true },
        { text: 'Enviar un correo generico de "buen trabajo a todos" a todo el personal.', diy: true },
        { text: 'Usar la Herramienta de Observacion. Redacta Notas de Reconocimiento desde tus fotos de notas.', diy: false },
      ],
      tdiSolution: 'La Herramienta de Observacion lee tus fotos de notas y redacta Notas de Reconocimiento personalizadas que celebran exactamente lo que viste. Tu revisas y envias.',
      service: {
        name: 'Notas de Reconocimiento de la Herramienta de Observacion',
        description: 'Borradores de reconocimiento asistidos por IA generados a partir de tus notas de observacion. Personales, especificos y rapidos.',
        type: 'platform',
      },
      leanType: 'No tengo tiempo para esto',
    },
  },
  {
    role: 'leader',
    en: {
      context: 'Staff meeting. Someone asks: "Is anyone actually using this PD?"',
      scenario: 'A veteran teacher pushes back during a staff meeting, asking if anyone is really engaging with the professional development tools. You suspect usage is strong, but you do not have data in front of you.',
      choices: [
        { text: 'Ask department chairs to survey their teams and report back next week.', diy: true },
        { text: 'Defend the PD program based on your gut feeling.', diy: true },
        { text: 'Pull up the Hub engagement dashboard. Logins, completions, and trends are all there.', diy: false },
      ],
      tdiSolution: 'The Hub engagement dashboard shows real-time data: who is logging in, what they are completing, and usage trends over time. No surveys needed.',
      service: {
        name: 'Hub Engagement Dashboard',
        description: 'Real-time usage data showing logins, completions, and engagement trends for your entire staff.',
        type: 'platform',
      },
      leanType: 'I don\'t have time for this',
    },
    es: {
      context: 'Reunion de personal. Alguien pregunta: "Alguien realmente esta usando este PD?"',
      scenario: 'Un maestro veterano cuestiona durante una reunion de personal si alguien realmente esta participando con las herramientas de desarrollo profesional. Sospechas que el uso es fuerte, pero no tienes datos frente a ti.',
      choices: [
        { text: 'Pedir a los jefes de departamento que encuesten a sus equipos y reporten la proxima semana.', diy: true },
        { text: 'Defender el programa de PD basandote en tu instinto.', diy: true },
        { text: 'Abrir el panel de participacion del Hub. Inicios de sesion, completaciones y tendencias estan ahi.', diy: false },
      ],
      tdiSolution: 'El panel de participacion del Hub muestra datos en tiempo real: quien inicia sesion, que estan completando y tendencias de uso a lo largo del tiempo. Sin encuestas necesarias.',
      service: {
        name: 'Panel de Participacion del Hub',
        description: 'Datos de uso en tiempo real que muestran inicios de sesion, completaciones y tendencias de participacion de todo tu personal.',
        type: 'platform',
      },
      leanType: 'No tengo tiempo para esto',
    },
  },
  {
    role: 'leader',
    en: {
      context: 'Budget season. You need more PD days but there is no money.',
      scenario: 'You want to add two more professional development days next year, but the budget is locked. You heard there might be grant funding available, but researching grants is not how you want to spend your evenings.',
      choices: [
        { text: 'Google grant databases and spend your evenings reading eligibility requirements.', diy: true },
        { text: 'Give up on the extra PD days and work with what you have.', diy: true },
        { text: 'Reach out to the TDI funding team. They research and write grants for you.', diy: false },
      ],
      tdiSolution: 'The TDI funding team researches grant opportunities, checks eligibility, and writes the applications. You approve. They submit.',
      service: {
        name: 'TDI Funding Team',
        description: 'Grant research, eligibility checks, and application writing handled by your TDI team.',
        type: 'team',
      },
      leanType: 'I can\'t solve this',
    },
    es: {
      context: 'Temporada de presupuesto. Necesitas mas dias de PD pero no hay dinero.',
      scenario: 'Quieres agregar dos dias mas de desarrollo profesional el proximo ano, pero el presupuesto esta cerrado. Escuchaste que podria haber financiamiento de subvenciones disponible, pero investigar subvenciones no es como quieres pasar tus noches.',
      choices: [
        { text: 'Buscar en bases de datos de subvenciones y pasar tus noches leyendo requisitos de elegibilidad.', diy: true },
        { text: 'Renunciar a los dias extra de PD y trabajar con lo que tienes.', diy: true },
        { text: 'Contactar al equipo de financiamiento de TDI. Ellos investigan y escriben subvenciones para ti.', diy: false },
      ],
      tdiSolution: 'El equipo de financiamiento de TDI investiga oportunidades de subvencion, verifica elegibilidad y escribe las solicitudes. Tu apruebas. Ellos envian.',
      service: {
        name: 'Equipo de Financiamiento de TDI',
        description: 'Investigacion de subvenciones, verificacion de elegibilidad y redaccion de solicitudes manejadas por tu equipo de TDI.',
        type: 'team',
      },
      leanType: 'No puedo resolver esto',
    },
  },
  {
    role: 'leader',
    en: {
      context: 'End of semester. You want to know if PD is changing practice.',
      scenario: 'You have invested in professional development all semester and the board wants evidence that it is actually changing classroom practice. You need before-and-after data, not just attendance numbers.',
      choices: [
        { text: 'Design your own pre/post assessment and ask teachers to fill it out.', diy: true },
        { text: 'Compile anecdotal evidence from walkthroughs and hope it is convincing.', diy: true },
        { text: 'Check the Observation Impact Scorecard. It shows before-and-after engagement data.', diy: false },
      ],
      tdiSolution: 'The Observation Impact Scorecard compares engagement data over time, showing measurable shifts in classroom practice connected to PD participation.',
      service: {
        name: 'Observation Impact Scorecard',
        description: 'Before-and-after engagement data showing how PD participation connects to changes in classroom practice.',
        type: 'platform',
      },
      leanType: 'I don\'t have time for this',
    },
    es: {
      context: 'Fin de semestre. Quieres saber si el PD esta cambiando la practica.',
      scenario: 'Has invertido en desarrollo profesional todo el semestre y la junta quiere evidencia de que realmente esta cambiando la practica en el salon. Necesitas datos de antes y despues, no solo numeros de asistencia.',
      choices: [
        { text: 'Disenar tu propia evaluacion pre/post y pedir a los maestros que la llenen.', diy: true },
        { text: 'Compilar evidencia anecdotica de recorridos y esperar que sea convincente.', diy: true },
        { text: 'Revisar el Cuadro de Impacto de Observacion. Muestra datos de participacion antes y despues.', diy: false },
      ],
      tdiSolution: 'El Cuadro de Impacto de Observacion compara datos de participacion a lo largo del tiempo, mostrando cambios medibles en la practica del salon conectados a la participacion en PD.',
      service: {
        name: 'Cuadro de Impacto de Observacion',
        description: 'Datos de participacion antes y despues que muestran como la participacion en PD se conecta con cambios en la practica del salon.',
        type: 'platform',
      },
      leanType: 'No tengo tiempo para esto',
    },
  },
  {
    role: 'leader',
    en: {
      context: 'A first-year teacher is struggling. Your coaching playbook is empty.',
      scenario: 'A first-year teacher is drowning. You have tried mentoring, check-ins, and adjusting their schedule. Nothing is working. You are running out of strategies and they are running out of patience.',
      choices: [
        { text: 'Keep trying the same approach and hope something clicks.', diy: true },
        { text: 'Move the teacher to a different grade level to see if a fresh start helps.', diy: true },
        { text: 'Schedule a virtual coaching session. Your TDI team designs custom support plans.', diy: false },
      ],
      tdiSolution: 'Your TDI team can design a custom coaching plan for struggling teachers, including specific tools, check-in cadences, and targeted Hub resources.',
      service: {
        name: 'Virtual Coaching Sessions',
        description: 'Custom support plans designed by your TDI team for specific teacher needs.',
        type: 'team',
      },
      leanType: 'I can\'t solve this',
    },
    es: {
      context: 'Un maestro de primer ano esta luchando. Tu manual de coaching esta vacio.',
      scenario: 'Un maestro de primer ano se esta ahogando. Has intentado mentoria, reuniones de seguimiento y ajustar su horario. Nada funciona. Te estas quedando sin estrategias y ellos se estan quedando sin paciencia.',
      choices: [
        { text: 'Seguir intentando el mismo enfoque y esperar que algo funcione.', diy: true },
        { text: 'Mover al maestro a un grado diferente para ver si un nuevo comienzo ayuda.', diy: true },
        { text: 'Programar una sesion de coaching virtual. Tu equipo de TDI disena planes de apoyo personalizados.', diy: false },
      ],
      tdiSolution: 'Tu equipo de TDI puede disenar un plan de coaching personalizado para maestros que estan luchando, incluyendo herramientas especificas, cadencias de seguimiento y recursos del Hub dirigidos.',
      service: {
        name: 'Sesiones de Coaching Virtual',
        description: 'Planes de apoyo personalizados disenados por tu equipo de TDI para necesidades especificas de maestros.',
        type: 'team',
      },
      leanType: 'No puedo resolver esto',
    },
  },
  {
    role: 'leader',
    en: {
      context: 'Contract renewal is next month. You need to justify the investment.',
      scenario: 'Your contract renewal is coming up and the business office wants justification for the PD investment. You need more than anecdotes. You need data that tells a story.',
      choices: [
        { text: 'Compile anecdotes from teachers and hope they are convincing enough.', diy: true },
        { text: 'Ask the business office for an extension while you figure out what data to pull.', diy: true },
        { text: 'Generate a renewal-ready impact report from the Partner Dashboard.', diy: false },
      ],
      tdiSolution: 'The Partner Dashboard generates renewal-ready impact reports that show engagement data, usage trends, and staff growth over time.',
      service: {
        name: 'Partner Dashboard Impact Reports',
        description: 'Renewal-ready reports with engagement data, usage trends, and staff growth metrics.',
        type: 'platform',
      },
      leanType: 'I don\'t have time for this',
    },
    es: {
      context: 'La renovacion del contrato es el proximo mes. Necesitas justificar la inversion.',
      scenario: 'Tu renovacion de contrato se acerca y la oficina de finanzas quiere justificacion para la inversion en PD. Necesitas mas que anecdotas. Necesitas datos que cuenten una historia.',
      choices: [
        { text: 'Compilar anecdotas de maestros y esperar que sean lo suficientemente convincentes.', diy: true },
        { text: 'Pedir a la oficina de finanzas una extension mientras descifras que datos sacar.', diy: true },
        { text: 'Generar un informe de impacto listo para renovacion desde el Panel de Socios.', diy: false },
      ],
      tdiSolution: 'El Panel de Socios genera informes de impacto listos para renovacion que muestran datos de participacion, tendencias de uso y crecimiento del personal a lo largo del tiempo.',
      service: {
        name: 'Informes de Impacto del Panel de Socios',
        description: 'Informes listos para renovacion con datos de participacion, tendencias de uso y metricas de crecimiento del personal.',
        type: 'platform',
      },
      leanType: 'No tengo tiempo para esto',
    },
  },
  {
    role: 'leader',
    en: {
      context: 'PD attendance is declining. Staff are checking out.',
      scenario: 'Staff attendance at professional development sessions has dropped for the third month in a row. Teachers call it "one more thing." You are considering making it mandatory, but you know that will backfire.',
      choices: [
        { text: 'Make PD attendance mandatory and tie it to evaluations.', diy: true },
        { text: 'Cancel PD sessions and redirect the time to planning periods.', diy: true },
        { text: 'Introduce Hub games and quick wins that make PD feel chosen, not forced.', diy: false },
      ],
      tdiSolution: 'Hub games and quick wins turn PD into something educators choose. 5 to 15 minute tools that fit into any schedule, with community and recognition built in.',
      service: {
        name: 'Hub Games and Quick Wins',
        description: 'Short, engaging PD tools that educators choose to use. Games, quizzes, and downloadable resources.',
        type: 'platform',
      },
      leanType: 'I can\'t solve this',
    },
    es: {
      context: 'La asistencia al PD esta disminuyendo. El personal se esta desconectando.',
      scenario: 'La asistencia del personal a las sesiones de desarrollo profesional ha caido por tercer mes consecutivo. Los maestros lo llaman "una cosa mas." Estas considerando hacerlo obligatorio, pero sabes que eso sera contraproducente.',
      choices: [
        { text: 'Hacer la asistencia al PD obligatoria y vincularla a las evaluaciones.', diy: true },
        { text: 'Cancelar las sesiones de PD y redirigir el tiempo a periodos de planificacion.', diy: true },
        { text: 'Introducir juegos del Hub y recursos rapidos que hagan que el PD se sienta elegido, no forzado.', diy: false },
      ],
      tdiSolution: 'Los juegos del Hub y recursos rapidos convierten el PD en algo que los educadores eligen. Herramientas de 5 a 15 minutos que se adaptan a cualquier horario, con comunidad y reconocimiento integrados.',
      service: {
        name: 'Juegos del Hub y Recursos Rapidos',
        description: 'Herramientas de PD cortas y atractivas que los educadores eligen usar. Juegos, cuestionarios y recursos descargables.',
        type: 'platform',
      },
      leanType: 'No puedo resolver esto',
    },
  },
  {
    role: 'leader',
    en: {
      context: 'New assistant principal starts Monday. They have never heard of TDI.',
      scenario: 'Your new AP starts Monday and you need to get them up to speed on what TDI does, how the Hub works, and what your partnership includes. You could explain it yourself, but honestly you are not sure you could cover everything.',
      choices: [
        { text: 'Block an hour on Monday to walk them through everything yourself.', diy: true },
        { text: 'Forward them a bunch of emails and hope they piece it together.', diy: true },
        { text: 'Share this game. It walks them through every TDI service by role.', diy: false },
      ],
      tdiSolution: 'This game is the onboarding. Share the link. They discover every TDI service through real scenarios, not a slide deck.',
      service: {
        name: 'When to Lean on Your TDI Team (This Game)',
        description: 'Product onboarding through role-specific scenarios. Share the link as a training tool.',
        type: 'platform',
      },
      leanType: 'I don\'t have time for this',
    },
    es: {
      context: 'El nuevo subdirector empieza el lunes. Nunca ha oido hablar de TDI.',
      scenario: 'Tu nuevo subdirector empieza el lunes y necesitas ponerlo al dia sobre lo que hace TDI, como funciona el Hub y que incluye tu asociacion. Podrias explicarlo tu mismo, pero honestamente no estas seguro de poder cubrir todo.',
      choices: [
        { text: 'Bloquear una hora el lunes para explicarles todo tu mismo.', diy: true },
        { text: 'Reenviarles un monton de correos y esperar que lo armen.', diy: true },
        { text: 'Compartir este juego. Los guia a traves de cada servicio de TDI por rol.', diy: false },
      ],
      tdiSolution: 'Este juego es la incorporacion. Comparte el enlace. Descubren cada servicio de TDI a traves de escenarios reales, no una presentacion.',
      service: {
        name: 'Cuando Apoyarte en Tu Equipo TDI (Este Juego)',
        description: 'Incorporacion de producto a traves de escenarios especificos por rol. Comparte el enlace como herramienta de capacitacion.',
        type: 'platform',
      },
      leanType: 'No tengo tiempo para esto',
    },
  },

  // =====================
  // TEACHER SCENARIOS (10)
  // =====================
  {
    role: 'teacher',
    en: {
      context: 'Sunday night. You need something for Monday morning.',
      scenario: 'You are staring at tomorrow\'s lesson plan and need a classroom management strategy that actually works. You have 45 minutes before you need to be in bed.',
      choices: [
        { text: 'Spend 45 minutes scrolling Pinterest and hope something looks good.', diy: true },
        { text: 'Reuse last year\'s lesson plan even though it did not work well.', diy: true },
        { text: 'Open Hub Quick Wins. Filter by category and lift level. Download something ready to use.', diy: false },
      ],
      tdiSolution: 'Hub Quick Wins are downloadable, role-filtered tools organized by category and difficulty. Find what you need in under 5 minutes.',
      service: {
        name: 'Hub Quick Wins',
        description: 'Downloadable PD tools filtered by category, role, and lift level. Ready to use immediately.',
        type: 'platform',
      },
      leanType: 'I don\'t have time for this',
    },
    es: {
      context: 'Domingo por la noche. Necesitas algo para el lunes por la manana.',
      scenario: 'Estas mirando el plan de leccion de manana y necesitas una estrategia de manejo de salon que realmente funcione. Tienes 45 minutos antes de tener que ir a dormir.',
      choices: [
        { text: 'Pasar 45 minutos navegando Pinterest y esperar que algo se vea bien.', diy: true },
        { text: 'Reutilizar el plan de leccion del ano pasado aunque no funciono bien.', diy: true },
        { text: 'Abrir Recursos Rapidos del Hub. Filtrar por categoria y nivel de esfuerzo. Descargar algo listo para usar.', diy: false },
      ],
      tdiSolution: 'Los Recursos Rapidos del Hub son herramientas descargables filtradas por rol, organizadas por categoria y dificultad. Encuentra lo que necesitas en menos de 5 minutos.',
      service: {
        name: 'Recursos Rapidos del Hub',
        description: 'Herramientas de PD descargables filtradas por categoria, rol y nivel de esfuerzo. Listas para usar inmediatamente.',
        type: 'platform',
      },
      leanType: 'No tengo tiempo para esto',
    },
  },
  {
    role: 'teacher',
    en: {
      context: 'Third week with the same student challenge. Nothing is working.',
      scenario: 'You have a student who is pushing every boundary and nothing in your toolkit is working. You have tried proximity, redirection, parent contact, and adjusted seating. You feel stuck and a little defeated.',
      choices: [
        { text: 'Keep trying the same strategies and hope something eventually clicks.', diy: true },
        { text: 'Refer the student to the office and let admin handle it.', diy: true },
        { text: 'Post your situation in the Hub community. Get ideas from educators who have been there.', diy: false },
      ],
      tdiSolution: 'The Hub community connects you with educators who have faced similar situations. Real strategies from real classrooms, not textbook advice.',
      service: {
        name: 'Hub Community',
        description: 'Peer support from educators across roles and buildings. Post a challenge, get real strategies.',
        type: 'community',
      },
      leanType: 'I need connection',
    },
    es: {
      context: 'Tercera semana con el mismo desafio con un estudiante. Nada funciona.',
      scenario: 'Tienes un estudiante que esta presionando cada limite y nada en tu caja de herramientas funciona. Has intentado proximidad, redireccion, contacto con padres y ajuste de asientos. Te sientes estancado y un poco derrotado.',
      choices: [
        { text: 'Seguir intentando las mismas estrategias y esperar que algo eventualmente funcione.', diy: true },
        { text: 'Referir al estudiante a la oficina y dejar que la administracion se encargue.', diy: true },
        { text: 'Publicar tu situacion en la comunidad del Hub. Obtener ideas de educadores que han estado ahi.', diy: false },
      ],
      tdiSolution: 'La comunidad del Hub te conecta con educadores que han enfrentado situaciones similares. Estrategias reales de salones reales, no consejos de libro de texto.',
      service: {
        name: 'Comunidad del Hub',
        description: 'Apoyo entre pares de educadores de diferentes roles y edificios. Publica un desafio, obtiene estrategias reales.',
        type: 'community',
      },
      leanType: 'Necesito conexion',
    },
  },
  {
    role: 'teacher',
    en: {
      context: 'You want PD, but not the kind that wastes your time.',
      scenario: 'The last three PD sessions felt like a waste of time. You want to grow, but you want to do it on your schedule, at your pace, on topics you actually care about.',
      choices: [
        { text: 'Wait for the next in-service day and hope the topic is relevant.', diy: true },
        { text: 'Buy a book on Amazon and read it during lunch for the next month.', diy: true },
        { text: 'Use Hub courses and games. 5 to 15 minutes, any time, topics you pick.', diy: false },
      ],
      tdiSolution: 'Hub courses and games are self-paced, role-relevant, and designed to fit into real schedules. No full-day sit-and-get required.',
      service: {
        name: 'Hub Courses and Games',
        description: 'Self-paced professional development in 5 to 15 minute sessions. You choose the topic and timing.',
        type: 'platform',
      },
      leanType: 'I don\'t have time for this',
    },
    es: {
      context: 'Quieres PD, pero no del tipo que pierde tu tiempo.',
      scenario: 'Las ultimas tres sesiones de PD se sintieron como una perdida de tiempo. Quieres crecer, pero quieres hacerlo en tu horario, a tu ritmo, en temas que realmente te importan.',
      choices: [
        { text: 'Esperar el proximo dia de servicio y esperar que el tema sea relevante.', diy: true },
        { text: 'Comprar un libro en Amazon y leerlo durante el almuerzo durante el proximo mes.', diy: true },
        { text: 'Usar cursos y juegos del Hub. 5 a 15 minutos, cuando quieras, temas que tu eliges.', diy: false },
      ],
      tdiSolution: 'Los cursos y juegos del Hub son a tu ritmo, relevantes para tu rol y disenados para encajar en horarios reales. No se requiere un dia completo de sentarse y recibir.',
      service: {
        name: 'Cursos y Juegos del Hub',
        description: 'Desarrollo profesional a tu ritmo en sesiones de 5 a 15 minutos. Tu eliges el tema y el momento.',
        type: 'platform',
      },
      leanType: 'No tengo tiempo para esto',
    },
  },
  {
    role: 'teacher',
    en: {
      context: 'The para partnership is not working. You do not know how to fix it.',
      scenario: 'Your paraprofessional and you are not on the same page. Communication is stiff, roles are unclear, and it is making both of you uncomfortable. You know it needs to be addressed but you do not know where to start.',
      choices: [
        { text: 'Avoid the conversation and hope it gets better on its own.', diy: true },
        { text: 'Go to your admin and ask them to mediate.', diy: true },
        { text: 'Play Partner Up together to explore both perspectives, then try the Para Partnership Pulse Check.', diy: false },
      ],
      tdiSolution: 'Partner Up shows the same scenario from both the teacher and para perspective. The Para Partnership Pulse Check gives you structured conversation starters.',
      service: {
        name: 'Partner Up Game + Para Partnership Pulse Check',
        description: 'Perspective-building game and structured conversation tool for teacher-para relationships.',
        type: 'platform',
      },
      leanType: 'I can\'t solve this',
    },
    es: {
      context: 'La relacion con tu para no esta funcionando. No sabes como arreglarla.',
      scenario: 'Tu paraprofesional y tu no estan en la misma pagina. La comunicacion es rigida, los roles no estan claros y los hace incomodos a ambos. Sabes que necesita abordarse pero no sabes por donde empezar.',
      choices: [
        { text: 'Evitar la conversacion y esperar que mejore sola.', diy: true },
        { text: 'Ir a tu administrador y pedirle que medie.', diy: true },
        { text: 'Jugar Partner Up juntos para explorar ambas perspectivas, luego intentar el Chequeo de Pulso de la Asociacion Para.', diy: false },
      ],
      tdiSolution: 'Partner Up muestra el mismo escenario desde la perspectiva del maestro y del para. El Chequeo de Pulso de la Asociacion Para te da iniciadores de conversacion estructurados.',
      service: {
        name: 'Juego Partner Up + Chequeo de Pulso de la Asociacion Para',
        description: 'Juego de construccion de perspectivas y herramienta de conversacion estructurada para relaciones maestro-para.',
        type: 'platform',
      },
      leanType: 'No puedo resolver esto',
    },
  },
  {
    role: 'teacher',
    en: {
      context: 'You are burning out. But admitting it feels risky.',
      scenario: 'You are exhausted. You dread Monday mornings. Your patience is thin and your enthusiasm is gone. But saying "I am burned out" feels like admitting failure, especially in a building where everyone seems fine.',
      choices: [
        { text: 'Push through and tell yourself it will get better after winter break.', diy: true },
        { text: 'Call in sick for a mental health day and feel guilty about it.', diy: true },
        { text: 'Take the Burnout Early Warning quiz. Try the Boundary Game and Vibe Check.', diy: false },
      ],
      tdiSolution: 'The Burnout Early Warning quiz helps you name what you are feeling without judgment. The Boundary Game and Vibe Check give you actionable next steps.',
      service: {
        name: 'Burnout Early Warning + Boundary Game + Vibe Check',
        description: 'Self-assessment tools for recognizing burnout, setting boundaries, and checking in with yourself.',
        type: 'platform',
      },
      leanType: 'I can\'t solve this',
    },
    es: {
      context: 'Te estas quemando. Pero admitirlo se siente arriesgado.',
      scenario: 'Estas agotado. Temes los lunes por la manana. Tu paciencia es delgada y tu entusiasmo se fue. Pero decir "estoy quemado" se siente como admitir un fracaso, especialmente en un edificio donde todos parecen estar bien.',
      choices: [
        { text: 'Aguantar y decirte que mejorara despues de las vacaciones de invierno.', diy: true },
        { text: 'Llamar enfermo para un dia de salud mental y sentirte culpable por ello.', diy: true },
        { text: 'Tomar el cuestionario de Alerta Temprana de Agotamiento. Probar el Juego de Limites y el Chequeo de Estado de Animo.', diy: false },
      ],
      tdiSolution: 'El cuestionario de Alerta Temprana de Agotamiento te ayuda a nombrar lo que sientes sin juicio. El Juego de Limites y el Chequeo de Estado de Animo te dan pasos de accion concretos.',
      service: {
        name: 'Alerta Temprana de Agotamiento + Juego de Limites + Chequeo de Estado de Animo',
        description: 'Herramientas de autoevaluacion para reconocer el agotamiento, establecer limites y chequearte a ti mismo.',
        type: 'platform',
      },
      leanType: 'No puedo resolver esto',
    },
  },
  {
    role: 'teacher',
    en: {
      context: 'You want to try something new but need a starting point.',
      scenario: 'You heard about a new instructional strategy at a conference and want to try it, but you need a template or framework to get started. Creating one from scratch will take hours you do not have.',
      choices: [
        { text: 'Spend your planning period building a template from scratch.', diy: true },
        { text: 'Decide it is not worth the effort and stick with what you know.', diy: true },
        { text: 'Search Hub Quick Wins for ready-to-use templates with community reviews.', diy: false },
      ],
      tdiSolution: 'Quick Wins include ready-to-use templates with descriptions, community reviews, and implementation guidance. Try something new without starting from zero.',
      service: {
        name: 'Hub Quick Wins Templates',
        description: 'Ready-to-use instructional templates with community reviews and implementation guidance.',
        type: 'platform',
      },
      leanType: 'I don\'t have time for this',
    },
    es: {
      context: 'Quieres probar algo nuevo pero necesitas un punto de partida.',
      scenario: 'Escuchaste sobre una nueva estrategia instruccional en una conferencia y quieres probarla, pero necesitas una plantilla o marco para empezar. Crear uno desde cero tomara horas que no tienes.',
      choices: [
        { text: 'Pasar tu periodo de planificacion construyendo una plantilla desde cero.', diy: true },
        { text: 'Decidir que no vale la pena el esfuerzo y quedarte con lo que conoces.', diy: true },
        { text: 'Buscar en Recursos Rapidos del Hub plantillas listas para usar con resenas de la comunidad.', diy: false },
      ],
      tdiSolution: 'Los Recursos Rapidos incluyen plantillas listas para usar con descripciones, resenas de la comunidad y guia de implementacion. Prueba algo nuevo sin empezar de cero.',
      service: {
        name: 'Plantillas de Recursos Rapidos del Hub',
        description: 'Plantillas instruccionales listas para usar con resenas de la comunidad y guia de implementacion.',
        type: 'platform',
      },
      leanType: 'No tengo tiempo para esto',
    },
  },
  {
    role: 'teacher',
    en: {
      context: 'Recertification is coming. You need PD hours.',
      scenario: 'Your teaching license is up for renewal and you need to document your PD hours. You have been doing professional development all year but tracking it has been inconsistent at best.',
      choices: [
        { text: 'Dig through old emails trying to find certificates and sign-in sheets.', diy: true },
        { text: 'Start a manual spreadsheet and backfill everything you can remember.', diy: true },
        { text: 'Check the Hub. It tracks your completions and generates PD hour reports.', diy: false },
      ],
      tdiSolution: 'The Hub automatically tracks every course, game, and quick win you complete. Generate a PD hour report when you need it.',
      service: {
        name: 'Hub PD Hour Tracking',
        description: 'Automatic tracking of all completed Hub activities with downloadable PD hour reports.',
        type: 'platform',
      },
      leanType: 'I don\'t have time for this',
    },
    es: {
      context: 'La recertificacion se acerca. Necesitas horas de PD.',
      scenario: 'Tu licencia de ensenanza esta por renovarse y necesitas documentar tus horas de PD. Has estado haciendo desarrollo profesional todo el ano pero el seguimiento ha sido inconsistente en el mejor de los casos.',
      choices: [
        { text: 'Buscar en correos viejos tratando de encontrar certificados y hojas de asistencia.', diy: true },
        { text: 'Empezar una hoja de calculo manual y rellenar todo lo que puedas recordar.', diy: true },
        { text: 'Revisar el Hub. Rastrea tus completaciones y genera informes de horas de PD.', diy: false },
      ],
      tdiSolution: 'El Hub rastrea automaticamente cada curso, juego y recurso rapido que completas. Genera un informe de horas de PD cuando lo necesites.',
      service: {
        name: 'Seguimiento de Horas de PD del Hub',
        description: 'Seguimiento automatico de todas las actividades del Hub completadas con informes de horas de PD descargables.',
        type: 'platform',
      },
      leanType: 'No tengo tiempo para esto',
    },
  },
  {
    role: 'teacher',
    en: {
      context: 'You have an idea. But you do not know who to tell.',
      scenario: 'You have been thinking about a tool that would help other educators in your role. A checklist, a framework, something you wish existed. But you do not know if anyone would listen or how to get it made.',
      choices: [
        { text: 'Keep the idea in your head and move on with your day.', diy: true },
        { text: 'Post about it on social media and see if anyone agrees.', diy: true },
        { text: 'Submit a content idea through the Hub. The content team builds it.', diy: false },
      ],
      tdiSolution: 'The Hub has a content submission pipeline. Submit your idea, the content team reviews it, and the best ideas become real tools for the whole community.',
      service: {
        name: 'Hub Content Idea Submission',
        description: 'Submit tool ideas directly through the Hub. The content team builds the best ones for the community.',
        type: 'platform',
      },
      leanType: 'I need connection',
    },
    es: {
      context: 'Tienes una idea. Pero no sabes a quien decirsela.',
      scenario: 'Has estado pensando en una herramienta que ayudaria a otros educadores en tu rol. Una lista de verificacion, un marco, algo que desearias que existiera. Pero no sabes si alguien escucharia o como hacerla realidad.',
      choices: [
        { text: 'Mantener la idea en tu cabeza y seguir con tu dia.', diy: true },
        { text: 'Publicar sobre ello en redes sociales y ver si alguien esta de acuerdo.', diy: true },
        { text: 'Enviar una idea de contenido a traves del Hub. El equipo de contenido la construye.', diy: false },
      ],
      tdiSolution: 'El Hub tiene un canal de envio de contenido. Envia tu idea, el equipo de contenido la revisa y las mejores ideas se convierten en herramientas reales para toda la comunidad.',
      service: {
        name: 'Envio de Ideas de Contenido del Hub',
        description: 'Envia ideas de herramientas directamente a traves del Hub. El equipo de contenido construye las mejores para la comunidad.',
        type: 'platform',
      },
      leanType: 'Necesito conexion',
    },
  },
  {
    role: 'teacher',
    en: {
      context: 'Staff meeting tomorrow. You are leading the icebreaker.',
      scenario: 'Your principal asked you to lead a 10-minute activity at tomorrow\'s staff meeting. It needs to be engaging, not cringeworthy. You do not want to search YouTube for icebreaker videos.',
      choices: [
        { text: 'Search YouTube for "staff meeting icebreakers" and pray something good shows up.', diy: true },
        { text: 'Do a basic "two truths and a lie" and get it over with.', diy: true },
        { text: 'Use a Hub game with facilitator mode. Built for group play, projector-ready.', diy: false },
      ],
      tdiSolution: 'Hub games have facilitator mode designed for group play. Project it on screen, run the timer, and let the game do the work.',
      service: {
        name: 'Hub Games Facilitator Mode',
        description: 'Group-play mode for Hub games. Projector-ready with built-in timers and discussion prompts.',
        type: 'platform',
      },
      leanType: 'I don\'t have time for this',
    },
    es: {
      context: 'Reunion de personal manana. Tu lideras la actividad de apertura.',
      scenario: 'Tu director te pidio que lideres una actividad de 10 minutos en la reunion de personal de manana. Necesita ser atractiva, no vergonzosa. No quieres buscar en YouTube videos de dinamicas.',
      choices: [
        { text: 'Buscar en YouTube "dinamicas para reuniones de personal" y rezar que algo bueno aparezca.', diy: true },
        { text: 'Hacer un basico "dos verdades y una mentira" y salir del paso.', diy: true },
        { text: 'Usar un juego del Hub con modo facilitador. Disenado para juego grupal, listo para proyector.', diy: false },
      ],
      tdiSolution: 'Los juegos del Hub tienen modo facilitador disenado para juego grupal. Proyectalo en pantalla, activa el temporizador y deja que el juego haga el trabajo.',
      service: {
        name: 'Modo Facilitador de Juegos del Hub',
        description: 'Modo de juego grupal para los juegos del Hub. Listo para proyector con temporizadores integrados y preguntas de discusion.',
        type: 'platform',
      },
      leanType: 'No tengo tiempo para esto',
    },
  },
  {
    role: 'teacher',
    en: {
      context: 'You feel isolated. Nobody outside your building gets it.',
      scenario: 'Your school is small and you are the only one teaching your subject. You want to connect with other educators who understand your challenges, but your building does not have anyone in the same role.',
      choices: [
        { text: 'Scroll social media hoping to find teacher accounts that resonate.', diy: true },
        { text: 'Accept that isolation is part of the job.', diy: true },
        { text: 'Join the Hub community, subscribe to the Substack, and connect through TDI social channels.', diy: false },
      ],
      tdiSolution: 'The Hub community, Substack newsletter, and TDI social channels connect you with educators across buildings and roles. You are not alone in this.',
      service: {
        name: 'Hub Community + Substack + TDI Social',
        description: 'Multi-channel educator network for connection, ideas, and support beyond your building.',
        type: 'community',
      },
      leanType: 'I need connection',
    },
    es: {
      context: 'Te sientes aislado. Nadie fuera de tu edificio lo entiende.',
      scenario: 'Tu escuela es pequena y eres el unico ensenando tu materia. Quieres conectar con otros educadores que entiendan tus desafios, pero tu edificio no tiene a nadie en el mismo rol.',
      choices: [
        { text: 'Navegar redes sociales esperando encontrar cuentas de maestros que resuenen.', diy: true },
        { text: 'Aceptar que el aislamiento es parte del trabajo.', diy: true },
        { text: 'Unirte a la comunidad del Hub, suscribirte al Substack y conectar a traves de los canales sociales de TDI.', diy: false },
      ],
      tdiSolution: 'La comunidad del Hub, el boletin Substack y los canales sociales de TDI te conectan con educadores de diferentes edificios y roles. No estas solo en esto.',
      service: {
        name: 'Comunidad del Hub + Substack + Social de TDI',
        description: 'Red de educadores multicanal para conexion, ideas y apoyo mas alla de tu edificio.',
        type: 'community',
      },
      leanType: 'Necesito conexion',
    },
  },

  // =====================
  // PARA SCENARIOS (10)
  // =====================
  {
    role: 'para',
    en: {
      context: 'New lead teacher. No one explained how they want you to work.',
      scenario: 'Your lead teacher changed over the summer and the new one has not given you any orientation. You do not know their expectations, their routines, or how they want you to support students. You are figuring it out by watching.',
      choices: [
        { text: 'Keep watching and figuring it out as you go.', diy: true },
        { text: 'Ask the teacher directly, but you are nervous about coming across wrong.', diy: true },
        { text: 'Play Partner Up together. It shows both perspectives. Then try the Para Partnership Pulse Check to start the conversation.', diy: false },
      ],
      tdiSolution: 'Partner Up shows the same scenarios from both the teacher and para perspective, building mutual understanding. The Pulse Check gives you a safe, structured way to start the conversation about expectations.',
      service: {
        name: 'Partner Up + Para Partnership Pulse Check',
        description: 'Dual-perspective game and structured conversation tool for building teacher-para partnerships.',
        type: 'platform',
      },
      leanType: 'I can\'t solve this',
    },
    es: {
      context: 'Nuevo maestro lider. Nadie explico como quiere que trabajes.',
      scenario: 'Tu maestro lider cambio durante el verano y el nuevo no te ha dado ninguna orientacion. No conoces sus expectativas, sus rutinas, ni como quiere que apoyes a los estudiantes. Lo estas descubriendo observando.',
      choices: [
        { text: 'Seguir observando y descubriendolo sobre la marcha.', diy: true },
        { text: 'Preguntar directamente al maestro, pero estas nervioso de parecer fuera de lugar.', diy: true },
        { text: 'Jugar Partner Up juntos. Muestra ambas perspectivas. Luego usar el Chequeo de Pulso de la Asociacion Para para iniciar la conversacion.', diy: false },
      ],
      tdiSolution: 'Partner Up muestra los mismos escenarios desde la perspectiva del maestro y del para, construyendo entendimiento mutuo. El Chequeo de Pulso te da una forma segura y estructurada de iniciar la conversacion sobre expectativas.',
      service: {
        name: 'Partner Up + Chequeo de Pulso de la Asociacion Para',
        description: 'Juego de perspectiva dual y herramienta de conversacion estructurada para construir asociaciones maestro-para.',
        type: 'platform',
      },
      leanType: 'No puedo resolver esto',
    },
  },
  {
    role: 'para',
    en: {
      context: 'Another PD that was not built for you.',
      scenario: 'The district scheduled a professional development day. The entire agenda is designed for teachers. Classroom management for whole-group instruction. Lesson planning templates. Nothing addresses your role in small groups, one-on-one support, or transitions.',
      choices: [
        { text: 'Sit through the teacher-focused training and try to adapt what you can.', diy: true },
        { text: 'Mentally check out and use the time to organize your materials.', diy: true },
        { text: 'Open the Hub and filter for tools tagged specifically for paras.', diy: false },
      ],
      tdiSolution: 'Hub tools are tagged by role. Filter for para-specific content and find PD that actually addresses your responsibilities.',
      service: {
        name: 'Hub Role-Filtered Content',
        description: 'PD tools tagged and filterable by educator role. Content designed specifically for paraprofessionals.',
        type: 'platform',
      },
      leanType: 'I can\'t solve this',
    },
    es: {
      context: 'Otro PD que no fue disenado para ti.',
      scenario: 'El distrito programo un dia de desarrollo profesional. Toda la agenda esta disenada para maestros. Manejo de salon para instruccion de grupo completo. Plantillas de planificacion de lecciones. Nada aborda tu rol en grupos pequenos, apoyo uno a uno, o transiciones.',
      choices: [
        { text: 'Sentarte durante la capacitacion enfocada en maestros e intentar adaptar lo que puedas.', diy: true },
        { text: 'Desconectarte mentalmente y usar el tiempo para organizar tus materiales.', diy: true },
        { text: 'Abrir el Hub y filtrar herramientas etiquetadas especificamente para paras.', diy: false },
      ],
      tdiSolution: 'Las herramientas del Hub estan etiquetadas por rol. Filtra contenido especifico para paras y encuentra PD que realmente aborde tus responsabilidades.',
      service: {
        name: 'Contenido Filtrado por Rol del Hub',
        description: 'Herramientas de PD etiquetadas y filtrables por rol de educador. Contenido disenado especificamente para paraprofesionales.',
        type: 'platform',
      },
      leanType: 'No puedo resolver esto',
    },
  },
  {
    role: 'para',
    en: {
      context: 'You want to grow. But nobody has asked you about your goals.',
      scenario: 'You have been a paraprofessional for three years. You are good at what you do, but no one has ever asked about your professional goals. You want to grow but do not know what the path looks like.',
      choices: [
        { text: 'Hope someone notices your work and offers you an opportunity.', diy: true },
        { text: 'Look into certification programs on your own, but get overwhelmed by options.', diy: true },
        { text: 'Take Hub quizzes to build your educator profile. Track your growth through achievements.', diy: false },
      ],
      tdiSolution: 'Hub quizzes help you understand your strengths and growth areas. Your profile builds over time and achievements track your progress visibly.',
      service: {
        name: 'Hub Educator Profile + Achievements',
        description: 'Self-assessment quizzes that build your professional profile. Achievements track your growth over time.',
        type: 'platform',
      },
      leanType: 'I can\'t solve this',
    },
    es: {
      context: 'Quieres crecer. Pero nadie te ha preguntado sobre tus metas.',
      scenario: 'Has sido paraprofesional por tres anos. Eres bueno en lo que haces, pero nadie ha preguntado sobre tus metas profesionales. Quieres crecer pero no sabes como es el camino.',
      choices: [
        { text: 'Esperar que alguien note tu trabajo y te ofrezca una oportunidad.', diy: true },
        { text: 'Buscar programas de certificacion por tu cuenta, pero sentirte abrumado por las opciones.', diy: true },
        { text: 'Tomar cuestionarios del Hub para construir tu perfil de educador. Rastrear tu crecimiento a traves de logros.', diy: false },
      ],
      tdiSolution: 'Los cuestionarios del Hub te ayudan a entender tus fortalezas y areas de crecimiento. Tu perfil se construye con el tiempo y los logros rastrean tu progreso de manera visible.',
      service: {
        name: 'Perfil de Educador del Hub + Logros',
        description: 'Cuestionarios de autoevaluacion que construyen tu perfil profesional. Los logros rastrean tu crecimiento a lo largo del tiempo.',
        type: 'platform',
      },
      leanType: 'No puedo resolver esto',
    },
  },
  {
    role: 'para',
    en: {
      context: 'Small group is struggling. You need a strategy right now.',
      scenario: 'Your small group is not focusing. The activity is not landing and you can see students checking out. You need a different approach but the lead teacher is with the whole class and you are on your own.',
      choices: [
        { text: 'Wing it and try to improvise something on the spot.', diy: true },
        { text: 'Push through the planned activity even though it is not working.', diy: true },
        { text: 'Open Quick Wins filtered for para, classroom management, and grab-and-go.', diy: false },
      ],
      tdiSolution: 'Quick Wins filtered for your role and category give you strategies you can implement immediately. No prep time required.',
      service: {
        name: 'Hub Quick Wins (Para-Filtered)',
        description: 'Grab-and-go strategies filtered by para role and classroom management category.',
        type: 'platform',
      },
      leanType: 'I don\'t have time for this',
    },
    es: {
      context: 'El grupo pequeno esta luchando. Necesitas una estrategia ahora.',
      scenario: 'Tu grupo pequeno no se esta enfocando. La actividad no esta funcionando y puedes ver a los estudiantes desconectandose. Necesitas un enfoque diferente pero el maestro lider esta con toda la clase y tu estas solo.',
      choices: [
        { text: 'Improvisar algo en el momento.', diy: true },
        { text: 'Continuar con la actividad planificada aunque no este funcionando.', diy: true },
        { text: 'Abrir Recursos Rapidos filtrados para para, manejo de salon y listos para usar.', diy: false },
      ],
      tdiSolution: 'Recursos Rapidos filtrados para tu rol y categoria te dan estrategias que puedes implementar inmediatamente. Sin tiempo de preparacion requerido.',
      service: {
        name: 'Recursos Rapidos del Hub (Filtrados para Para)',
        description: 'Estrategias listas para usar filtradas por rol de para y categoria de manejo de salon.',
        type: 'platform',
      },
      leanType: 'No tengo tiempo para esto',
    },
  },
  {
    role: 'para',
    en: {
      context: 'You feel undervalued. Again.',
      scenario: 'You were left off the staff appreciation email. Again. No one acknowledged your contribution to the student who finally had a breakthrough in your small group. You feel invisible.',
      choices: [
        { text: 'Vent to another para during lunch and move on.', diy: true },
        { text: 'Tell yourself it is just part of the job and lower your expectations.', diy: true },
        { text: 'Try the Boundary Game, the Burnout Warning quiz, and the Hub community where paras support each other.', diy: false },
      ],
      tdiSolution: 'The Boundary Game helps you name what you need. The Burnout Warning quiz checks your wellbeing. The Hub community connects you with paras who understand.',
      service: {
        name: 'Boundary Game + Burnout Warning + Hub Community',
        description: 'Self-care tools and a peer community built specifically for paraprofessionals.',
        type: 'community',
      },
      leanType: 'I need connection',
    },
    es: {
      context: 'Te sientes infravalorado. Otra vez.',
      scenario: 'Te dejaron fuera del correo de aprecio al personal. Otra vez. Nadie reconocio tu contribucion al estudiante que finalmente tuvo un avance en tu grupo pequeno. Te sientes invisible.',
      choices: [
        { text: 'Desahogarte con otro para durante el almuerzo y seguir adelante.', diy: true },
        { text: 'Decirte que es solo parte del trabajo y bajar tus expectativas.', diy: true },
        { text: 'Probar el Juego de Limites, el cuestionario de Alerta de Agotamiento y la comunidad del Hub donde los paras se apoyan mutuamente.', diy: false },
      ],
      tdiSolution: 'El Juego de Limites te ayuda a nombrar lo que necesitas. El cuestionario de Alerta de Agotamiento chequea tu bienestar. La comunidad del Hub te conecta con paras que entienden.',
      service: {
        name: 'Juego de Limites + Alerta de Agotamiento + Comunidad del Hub',
        description: 'Herramientas de autocuidado y una comunidad de pares construida especificamente para paraprofesionales.',
        type: 'community',
      },
      leanType: 'Necesito conexion',
    },
  },
  {
    role: 'para',
    en: {
      context: 'Feedback from the lead teacher stings. You are not sure what to do with it.',
      scenario: 'Your lead teacher pulled you aside and gave you feedback about how you are running small groups. It was not delivered kindly and it stings. You are not sure if they are right, wrong, or just having a bad day.',
      choices: [
        { text: 'Take it personally and shut down for the rest of the day.', diy: true },
        { text: 'Ignore it and hope they do not bring it up again.', diy: true },
        { text: 'Take the Communication Style quiz and try the Conversation Compass game to process it.', diy: false },
      ],
      tdiSolution: 'The Communication Style quiz helps you understand how you receive feedback. The Conversation Compass game gives you practice with navigating difficult conversations.',
      service: {
        name: 'Communication Style Quiz + Conversation Compass',
        description: 'Self-awareness tools for understanding your communication style and practicing tough conversations.',
        type: 'platform',
      },
      leanType: 'I can\'t solve this',
    },
    es: {
      context: 'La retroalimentacion del maestro lider duele. No estas seguro de que hacer con ella.',
      scenario: 'Tu maestro lider te llevo aparte y te dio retroalimentacion sobre como estas manejando los grupos pequenos. No fue entregada amablemente y duele. No estas seguro si tiene razon, esta equivocado o solo tiene un mal dia.',
      choices: [
        { text: 'Tomarlo personal y cerrarte por el resto del dia.', diy: true },
        { text: 'Ignorarlo y esperar que no lo mencione de nuevo.', diy: true },
        { text: 'Tomar el cuestionario de Estilo de Comunicacion e intentar el juego Brujula de Conversacion para procesarlo.', diy: false },
      ],
      tdiSolution: 'El cuestionario de Estilo de Comunicacion te ayuda a entender como recibes retroalimentacion. El juego Brujula de Conversacion te da practica para navegar conversaciones dificiles.',
      service: {
        name: 'Cuestionario de Estilo de Comunicacion + Brujula de Conversacion',
        description: 'Herramientas de autoconocimiento para entender tu estilo de comunicacion y practicar conversaciones dificiles.',
        type: 'platform',
      },
      leanType: 'No puedo resolver esto',
    },
  },
  {
    role: 'para',
    en: {
      context: 'You want new strategies for small group instruction.',
      scenario: 'You have been using the same small group activities for months. Students are getting bored and so are you. You want fresh strategies but the PD available is all designed for whole-group instruction.',
      choices: [
        { text: 'Watch random YouTube videos during your lunch break.', diy: true },
        { text: 'Keep repeating the same activities because at least they are familiar.', diy: true },
        { text: 'Open Hub courses and Quick Wins designed for small group settings.', diy: false },
      ],
      tdiSolution: 'The Hub has courses and Quick Wins specifically designed for small group instruction. Strategies built for the work you actually do.',
      service: {
        name: 'Hub Small Group Resources',
        description: 'Courses and quick wins designed specifically for small group instruction and one-on-one support.',
        type: 'platform',
      },
      leanType: 'I don\'t have time for this',
    },
    es: {
      context: 'Quieres nuevas estrategias para instruccion en grupo pequeno.',
      scenario: 'Has estado usando las mismas actividades de grupo pequeno por meses. Los estudiantes se estan aburriendo y tu tambien. Quieres estrategias frescas pero el PD disponible esta todo disenado para instruccion de grupo completo.',
      choices: [
        { text: 'Ver videos aleatorios de YouTube durante tu hora de almuerzo.', diy: true },
        { text: 'Seguir repitiendo las mismas actividades porque al menos son familiares.', diy: true },
        { text: 'Abrir cursos del Hub y Recursos Rapidos disenados para entornos de grupo pequeno.', diy: false },
      ],
      tdiSolution: 'El Hub tiene cursos y Recursos Rapidos especificamente disenados para instruccion en grupo pequeno. Estrategias construidas para el trabajo que realmente haces.',
      service: {
        name: 'Recursos de Grupo Pequeno del Hub',
        description: 'Cursos y recursos rapidos disenados especificamente para instruccion en grupo pequeno y apoyo uno a uno.',
        type: 'platform',
      },
      leanType: 'No tengo tiempo para esto',
    },
  },
  {
    role: 'para',
    en: {
      context: 'You have an idea that could help your classroom. But should you share it?',
      scenario: 'You noticed something that would make transitions smoother for a specific student. It is a small change, but you are not sure if sharing it will be seen as overstepping. You have been told "just follow the plan" before.',
      choices: [
        { text: 'Stay quiet and follow the existing plan.', diy: true },
        { text: 'Mention it casually and hope the teacher does not take it the wrong way.', diy: true },
        { text: 'Submit it as a content idea through the Hub. The best tools come from educators in the room.', diy: false },
      ],
      tdiSolution: 'Your perspective matters. Submit ideas through the Hub content pipeline. The tools that help the most often come from the people closest to the students.',
      service: {
        name: 'Hub Content Idea Submission',
        description: 'A pipeline for educators of any role to submit tool ideas. Your experience becomes a resource for others.',
        type: 'platform',
      },
      leanType: 'I need connection',
    },
    es: {
      context: 'Tienes una idea que podria ayudar a tu salon. Pero deberiaa compartirla?',
      scenario: 'Notaste algo que haria las transiciones mas suaves para un estudiante especifico. Es un cambio pequeno, pero no estas seguro si compartirlo sera visto como sobrepasar tus limites. Te han dicho "solo sigue el plan" antes.',
      choices: [
        { text: 'Quedarte callado y seguir el plan existente.', diy: true },
        { text: 'Mencionarlo casualmente y esperar que el maestro no lo tome a mal.', diy: true },
        { text: 'Enviarlo como una idea de contenido a traves del Hub. Las mejores herramientas vienen de los educadores en el salon.', diy: false },
      ],
      tdiSolution: 'Tu perspectiva importa. Envia ideas a traves del canal de contenido del Hub. Las herramientas que mas ayudan frecuentemente vienen de las personas mas cercanas a los estudiantes.',
      service: {
        name: 'Envio de Ideas de Contenido del Hub',
        description: 'Un canal para educadores de cualquier rol para enviar ideas de herramientas. Tu experiencia se convierte en un recurso para otros.',
        type: 'platform',
      },
      leanType: 'Necesito conexion',
    },
  },
  {
    role: 'para',
    en: {
      context: 'Same pull-out group. Same activities. Every week.',
      scenario: 'You run the same pull-out group three times a week and the activities have not changed in two months. Students are disengaged and you are running on autopilot. You need something new but do not know where to look.',
      choices: [
        { text: 'Repeat the same activities because changing feels like too much work.', diy: true },
        { text: 'Ask the lead teacher for new ideas, but they are busy with their own planning.', diy: true },
        { text: 'Browse the Hub library. New tools are added regularly, filtered for your role.', diy: false },
      ],
      tdiSolution: 'The Hub library is continuously updated with new tools, filtered by role. Fresh strategies without asking anyone for permission or help.',
      service: {
        name: 'Hub Tool Library (Continuously Updated)',
        description: 'A growing library of PD tools with new content added regularly. Filtered by role, category, and difficulty.',
        type: 'platform',
      },
      leanType: 'I don\'t have time for this',
    },
    es: {
      context: 'Mismo grupo de extraccion. Mismas actividades. Cada semana.',
      scenario: 'Manejas el mismo grupo de extraccion tres veces a la semana y las actividades no han cambiado en dos meses. Los estudiantes estan desconectados y tu estas en piloto automatico. Necesitas algo nuevo pero no sabes donde buscar.',
      choices: [
        { text: 'Repetir las mismas actividades porque cambiar se siente como demasiado trabajo.', diy: true },
        { text: 'Pedir al maestro lider nuevas ideas, pero estan ocupados con su propia planificacion.', diy: true },
        { text: 'Explorar la biblioteca del Hub. Se agregan nuevas herramientas regularmente, filtradas para tu rol.', diy: false },
      ],
      tdiSolution: 'La biblioteca del Hub se actualiza continuamente con nuevas herramientas, filtradas por rol. Estrategias frescas sin pedir permiso o ayuda a nadie.',
      service: {
        name: 'Biblioteca de Herramientas del Hub (Actualizada Continuamente)',
        description: 'Una biblioteca creciente de herramientas de PD con nuevo contenido agregado regularmente. Filtrada por rol, categoria y dificultad.',
        type: 'platform',
      },
      leanType: 'No tengo tiempo para esto',
    },
  },
  {
    role: 'para',
    en: {
      context: 'You want to belong to a professional community. But most are not for you.',
      scenario: 'You see teachers talking about their PLCs, their cohorts, their professional networks. You want that too, but every professional community you have found is designed for teachers or administrators. Paras are an afterthought.',
      choices: [
        { text: 'Accept feeling isolated as part of the job.', diy: true },
        { text: 'Join a teacher community and hope they are inclusive enough.', diy: true },
        { text: 'Join the Hub community and subscribe to the Substack. Built for all educators, including paras.', diy: false },
      ],
      tdiSolution: 'The Hub community, Substack, and community posts are built for educators across all roles. Paras are not an afterthought. They are part of the design.',
      service: {
        name: 'Hub Community + Substack (Para-Inclusive)',
        description: 'Professional community and newsletter designed for all educator roles, with para-specific content and connection.',
        type: 'community',
      },
      leanType: 'I need connection',
    },
    es: {
      context: 'Quieres pertenecer a una comunidad profesional. Pero la mayoria no son para ti.',
      scenario: 'Ves a los maestros hablando de sus PLCs, sus cohortes, sus redes profesionales. Tu quieres eso tambien, pero cada comunidad profesional que has encontrado esta disenada para maestros o administradores. Los paras son una ocurrencia tardia.',
      choices: [
        { text: 'Aceptar sentirte aislado como parte del trabajo.', diy: true },
        { text: 'Unirte a una comunidad de maestros y esperar que sean lo suficientemente inclusivos.', diy: true },
        { text: 'Unirte a la comunidad del Hub y suscribirte al Substack. Construido para todos los educadores, incluyendo paras.', diy: false },
      ],
      tdiSolution: 'La comunidad del Hub, Substack y publicaciones de comunidad estan construidos para educadores de todos los roles. Los paras no son una ocurrencia tardia. Son parte del diseno.',
      service: {
        name: 'Comunidad del Hub + Substack (Inclusivo para Paras)',
        description: 'Comunidad profesional y boletin disenados para todos los roles de educadores, con contenido y conexion especifica para paras.',
        type: 'community',
      },
      leanType: 'Necesito conexion',
    },
  },

  // =====================
  // COACH SCENARIOS (10)
  // =====================
  {
    role: 'coach',
    en: {
      context: 'The coaching cycle is stuck. Implementation is not happening.',
      scenario: 'You have been coaching a teacher for six weeks. They nod during meetings, agree to the plan, and then nothing changes in the classroom. You are starting to wonder if the problem is your approach.',
      choices: [
        { text: 'Give one more strategy and hope this time it sticks.', diy: true },
        { text: 'Escalate to the principal and let them handle the accountability.', diy: true },
        { text: 'Take the Coaching Stance quiz to check your default mode. Then try Conversation Compass for practice.', diy: false },
      ],
      tdiSolution: 'The Coaching Stance quiz reveals whether you are defaulting to consulting, collaborating, or coaching. Conversation Compass gives you practice shifting your approach in real time.',
      service: {
        name: 'Coaching Stance Quiz + Conversation Compass',
        description: 'Self-assessment for coaching approach and practice tool for navigating coaching conversations.',
        type: 'platform',
      },
      leanType: 'I can\'t solve this',
    },
    es: {
      context: 'El ciclo de coaching esta estancado. La implementacion no esta sucediendo.',
      scenario: 'Has estado coaching a un maestro por seis semanas. Asiente durante las reuniones, acepta el plan y luego nada cambia en el salon. Empiezas a preguntarte si el problema es tu enfoque.',
      choices: [
        { text: 'Dar una estrategia mas y esperar que esta vez funcione.', diy: true },
        { text: 'Escalar al director y dejar que el maneje la responsabilidad.', diy: true },
        { text: 'Tomar el cuestionario de Postura de Coaching para verificar tu modo predeterminado. Luego probar Brujula de Conversacion para practicar.', diy: false },
      ],
      tdiSolution: 'El cuestionario de Postura de Coaching revela si estas predeterminando a consultar, colaborar o coaching. Brujula de Conversacion te da practica para cambiar tu enfoque en tiempo real.',
      service: {
        name: 'Cuestionario de Postura de Coaching + Brujula de Conversacion',
        description: 'Autoevaluacion del enfoque de coaching y herramienta de practica para navegar conversaciones de coaching.',
        type: 'platform',
      },
      leanType: 'No puedo resolver esto',
    },
  },
  {
    role: 'coach',
    en: {
      context: 'A teacher needs a specific resource. You do not have time to build one.',
      scenario: 'The teacher you are coaching needs a strategy for managing student transitions. You know exactly what they need, but creating a custom resource packet will take you 2 hours you do not have.',
      choices: [
        { text: 'Spend 2 hours building a custom packet from scratch.', diy: true },
        { text: 'Tell the teacher to Google it and come back with what they find.', diy: true },
        { text: 'Share a specific Hub Quick Win. Filtered by their exact need, ready to use.', diy: false },
      ],
      tdiSolution: 'Hub Quick Wins are searchable by category and need. Find the right tool in under a minute and share the direct link with your teacher.',
      service: {
        name: 'Hub Quick Wins (Shareable Links)',
        description: 'Shareable, direct-link PD tools filtered by specific teacher needs.',
        type: 'platform',
      },
      leanType: 'I don\'t have time for this',
    },
    es: {
      context: 'Un maestro necesita un recurso especifico. No tienes tiempo para construir uno.',
      scenario: 'El maestro al que estas coaching necesita una estrategia para manejar las transiciones de estudiantes. Sabes exactamente lo que necesitan, pero crear un paquete de recursos personalizado te tomara 2 horas que no tienes.',
      choices: [
        { text: 'Pasar 2 horas construyendo un paquete personalizado desde cero.', diy: true },
        { text: 'Decirle al maestro que busque en Google y regrese con lo que encuentre.', diy: true },
        { text: 'Compartir un Recurso Rapido especifico del Hub. Filtrado por su necesidad exacta, listo para usar.', diy: false },
      ],
      tdiSolution: 'Los Recursos Rapidos del Hub son buscables por categoria y necesidad. Encuentra la herramienta correcta en menos de un minuto y comparte el enlace directo con tu maestro.',
      service: {
        name: 'Recursos Rapidos del Hub (Enlaces Compartibles)',
        description: 'Herramientas de PD compartibles con enlace directo, filtradas por necesidades especificas del maestro.',
        type: 'platform',
      },
      leanType: 'No tengo tiempo para esto',
    },
  },
  {
    role: 'coach',
    en: {
      context: 'PLC day. You are facilitating. You need a protocol.',
      scenario: 'You are facilitating a PLC meeting tomorrow and the team needs a discussion protocol that actually generates real conversation, not just people taking turns reading data aloud.',
      choices: [
        { text: 'Google "PLC protocols" and scan the first three results.', diy: true },
        { text: 'Use the same protocol you always use even though it has gotten stale.', diy: true },
        { text: 'Search Hub Quick Wins in the Leadership category for facilitator-ready tools.', diy: false },
      ],
      tdiSolution: 'Quick Wins in the Leadership category include facilitator-ready protocols, discussion frameworks, and group activities designed for PLC settings.',
      service: {
        name: 'Hub Quick Wins (Leadership/Facilitator)',
        description: 'Discussion protocols and facilitator-ready tools for PLC meetings and group conversations.',
        type: 'platform',
      },
      leanType: 'I don\'t have time for this',
    },
    es: {
      context: 'Dia de PLC. Tu estas facilitando. Necesitas un protocolo.',
      scenario: 'Estas facilitando una reunion de PLC manana y el equipo necesita un protocolo de discusion que realmente genere conversacion real, no solo personas turnandose para leer datos en voz alta.',
      choices: [
        { text: 'Buscar en Google "protocolos de PLC" y escanear los primeros tres resultados.', diy: true },
        { text: 'Usar el mismo protocolo que siempre usas aunque ya se ha vuelto aburrido.', diy: true },
        { text: 'Buscar Recursos Rapidos del Hub en la categoria de Liderazgo para herramientas listas para facilitadores.', diy: false },
      ],
      tdiSolution: 'Los Recursos Rapidos en la categoria de Liderazgo incluyen protocolos listos para facilitadores, marcos de discusion y actividades grupales disenadas para entornos de PLC.',
      service: {
        name: 'Recursos Rapidos del Hub (Liderazgo/Facilitador)',
        description: 'Protocolos de discusion y herramientas listas para facilitadores para reuniones de PLC y conversaciones grupales.',
        type: 'platform',
      },
      leanType: 'No tengo tiempo para esto',
    },
  },
  {
    role: 'coach',
    en: {
      context: 'You want data on coaching impact. Not anecdotes.',
      scenario: 'Your principal asks: "Is coaching making a difference?" You know it is, but you do not have data to prove it. You have anecdotes, but the principal wants numbers.',
      choices: [
        { text: 'Design your own tracking system and spend a weekend building it in a spreadsheet.', diy: true },
        { text: 'Tell the principal that coaching impact is hard to quantify and ask for patience.', diy: true },
        { text: 'Pull Hub engagement data showing which teachers are using tools after coaching conversations.', diy: false },
      ],
      tdiSolution: 'Hub engagement data shows which teachers are engaging with tools after coaching conversations. Usage patterns tell a story that anecdotes cannot.',
      service: {
        name: 'Hub Engagement Data (Post-Coaching)',
        description: 'Usage tracking that shows teacher engagement with tools following coaching sessions.',
        type: 'platform',
      },
      leanType: 'I can\'t solve this',
    },
    es: {
      context: 'Quieres datos sobre el impacto del coaching. No anecdotas.',
      scenario: 'Tu director pregunta: "El coaching esta haciendo una diferencia?" Sabes que si, pero no tienes datos para probarlo. Tienes anecdotas, pero el director quiere numeros.',
      choices: [
        { text: 'Disenar tu propio sistema de seguimiento y pasar un fin de semana construyendolo en una hoja de calculo.', diy: true },
        { text: 'Decirle al director que el impacto del coaching es dificil de cuantificar y pedir paciencia.', diy: true },
        { text: 'Sacar datos de participacion del Hub que muestren que maestros estan usando herramientas despues de conversaciones de coaching.', diy: false },
      ],
      tdiSolution: 'Los datos de participacion del Hub muestran que maestros estan interactuando con herramientas despues de conversaciones de coaching. Los patrones de uso cuentan una historia que las anecdotas no pueden.',
      service: {
        name: 'Datos de Participacion del Hub (Post-Coaching)',
        description: 'Seguimiento de uso que muestra la participacion de maestros con herramientas despues de sesiones de coaching.',
        type: 'platform',
      },
      leanType: 'No puedo resolver esto',
    },
  },
  {
    role: 'coach',
    en: {
      context: 'The teacher you are coaching is burned out. Coaching feels like the wrong move.',
      scenario: 'You can see it. The teacher you are coaching is burned out. Their eyes are tired, their responses are short, and they seem to be just surviving each day. You are not sure if adding coaching to their plate is helping or hurting.',
      choices: [
        { text: 'Keep coaching because that is your job and they signed up for it.', diy: true },
        { text: 'Stop coaching and just check in casually until they seem better.', diy: true },
        { text: 'Suggest the Burnout Early Warning quiz for the teacher. Redirect to wellness resources first.', diy: false },
      ],
      tdiSolution: 'The Burnout Early Warning quiz gives the teacher language for what they are feeling. Sometimes the best coaching move is redirecting to wellness resources before pushing for instructional growth.',
      service: {
        name: 'Burnout Early Warning Quiz',
        description: 'Self-assessment tool that helps educators identify and name burnout before it becomes a crisis.',
        type: 'platform',
      },
      leanType: 'I can\'t solve this',
    },
    es: {
      context: 'El maestro que estas coaching esta agotado. El coaching se siente como el movimiento equivocado.',
      scenario: 'Puedes verlo. El maestro al que estas coaching esta agotado. Sus ojos estan cansados, sus respuestas son cortas y parece que solo esta sobreviviendo cada dia. No estas seguro si agregar coaching a su carga esta ayudando o danando.',
      choices: [
        { text: 'Seguir coaching porque ese es tu trabajo y ellos se inscribieron.', diy: true },
        { text: 'Dejar de coaching y solo hacer seguimiento casual hasta que parezcan mejor.', diy: true },
        { text: 'Sugerir el cuestionario de Alerta Temprana de Agotamiento para el maestro. Redirigir a recursos de bienestar primero.', diy: false },
      ],
      tdiSolution: 'El cuestionario de Alerta Temprana de Agotamiento le da al maestro lenguaje para lo que esta sintiendo. A veces el mejor movimiento de coaching es redirigir a recursos de bienestar antes de empujar por crecimiento instruccional.',
      service: {
        name: 'Cuestionario de Alerta Temprana de Agotamiento',
        description: 'Herramienta de autoevaluacion que ayuda a los educadores a identificar y nombrar el agotamiento antes de que se convierta en crisis.',
        type: 'platform',
      },
      leanType: 'No puedo resolver esto',
    },
  },
  {
    role: 'coach',
    en: {
      context: 'Difficult conversation ahead. You need to facilitate, not fix.',
      scenario: 'A team of teachers needs to have a conversation about inequitable grading practices. The topic is charged and you have been asked to facilitate. You want it to be productive, not a venting session.',
      choices: [
        { text: 'Wing the facilitation and rely on your instincts to manage the room.', diy: true },
        { text: 'Create an elaborate agenda with slides, norms, and exit tickets.', diy: true },
        { text: 'Use Conversation Compass as a group warm-up. Then use a Quick Win facilitation framework.', diy: false },
      ],
      tdiSolution: 'Conversation Compass warms up the group to navigating tough conversations. Quick Win facilitation frameworks give you a tested structure for the actual discussion.',
      service: {
        name: 'Conversation Compass + Quick Win Facilitation Frameworks',
        description: 'Warm-up game and structured frameworks for facilitating difficult team conversations.',
        type: 'platform',
      },
      leanType: 'I can\'t solve this',
    },
    es: {
      context: 'Conversacion dificil por delante. Necesitas facilitar, no arreglar.',
      scenario: 'Un equipo de maestros necesita tener una conversacion sobre practicas de calificacion inequitativas. El tema es delicado y te han pedido que facilites. Quieres que sea productivo, no una sesion de desahogo.',
      choices: [
        { text: 'Improvisar la facilitacion y confiar en tus instintos para manejar el grupo.', diy: true },
        { text: 'Crear una agenda elaborada con diapositivas, normas y boletos de salida.', diy: true },
        { text: 'Usar Brujula de Conversacion como calentamiento grupal. Luego usar un marco de facilitacion de Recursos Rapidos.', diy: false },
      ],
      tdiSolution: 'Brujula de Conversacion calienta al grupo para navegar conversaciones dificiles. Los marcos de facilitacion de Recursos Rapidos te dan una estructura probada para la discusion real.',
      service: {
        name: 'Brujula de Conversacion + Marcos de Facilitacion de Recursos Rapidos',
        description: 'Juego de calentamiento y marcos estructurados para facilitar conversaciones dificiles en equipo.',
        type: 'platform',
      },
      leanType: 'No puedo resolver esto',
    },
  },
  {
    role: 'coach',
    en: {
      context: 'You want to get better at coaching. But you are coaching alone.',
      scenario: 'You want to improve your own coaching practice, but there is no coach for the coach. You read books, but theory without practice does not stick. You need something that lets you practice the actual skills.',
      choices: [
        { text: 'Read another coaching book alone and hope the ideas transfer.', diy: true },
        { text: 'Watch coaching videos on YouTube and take notes.', diy: true },
        { text: 'Use Hub courses, the Coaching Stance quiz, and games that practice your skills in scenarios.', diy: false },
      ],
      tdiSolution: 'Hub courses, the Coaching Stance quiz, and interactive games give you practice reps, not just theory. Build your coaching muscles through scenarios, not just reading.',
      service: {
        name: 'Hub Courses + Coaching Stance Quiz + Games',
        description: 'Practice-based PD for coaches. Scenarios, quizzes, and interactive games that build coaching skills.',
        type: 'platform',
      },
      leanType: 'I can\'t solve this',
    },
    es: {
      context: 'Quieres mejorar en coaching. Pero estas coaching solo.',
      scenario: 'Quieres mejorar tu propia practica de coaching, pero no hay coach para el coach. Lees libros, pero la teoria sin practica no se queda. Necesitas algo que te permita practicar las habilidades reales.',
      choices: [
        { text: 'Leer otro libro de coaching solo y esperar que las ideas se transfieran.', diy: true },
        { text: 'Ver videos de coaching en YouTube y tomar notas.', diy: true },
        { text: 'Usar cursos del Hub, el cuestionario de Postura de Coaching y juegos que practican tus habilidades en escenarios.', diy: false },
      ],
      tdiSolution: 'Los cursos del Hub, el cuestionario de Postura de Coaching y los juegos interactivos te dan repeticiones de practica, no solo teoria. Construye tus musculos de coaching a traves de escenarios, no solo leyendo.',
      service: {
        name: 'Cursos del Hub + Cuestionario de Postura de Coaching + Juegos',
        description: 'PD basado en practica para coaches. Escenarios, cuestionarios y juegos interactivos que construyen habilidades de coaching.',
        type: 'platform',
      },
      leanType: 'No puedo resolver esto',
    },
  },
  {
    role: 'coach',
    en: {
      context: 'Five teachers need the same strategy. You do not have time for five meetings.',
      scenario: 'Five different teachers you are coaching all need the same classroom management strategy. Scheduling five individual coaching sessions to share the same resource feels like an inefficient use of everyone\'s time.',
      choices: [
        { text: 'Copy-paste the same email to all five teachers and hope they read it.', diy: true },
        { text: 'Schedule five separate meetings because individual coaching is the gold standard.', diy: true },
        { text: 'Share a Hub Quick Win link. They all get the same tool with community support built in.', diy: false },
      ],
      tdiSolution: 'Share a single Quick Win link with all five teachers. They each get the same resource with community support, discussion, and follow-up activities built in.',
      service: {
        name: 'Hub Quick Wins (Scalable Sharing)',
        description: 'Share one link with multiple teachers. Same resource, built-in community support, no duplicate meetings.',
        type: 'platform',
      },
      leanType: 'I don\'t have time for this',
    },
    es: {
      context: 'Cinco maestros necesitan la misma estrategia. No tienes tiempo para cinco reuniones.',
      scenario: 'Cinco maestros diferentes a los que estas coaching necesitan la misma estrategia de manejo de salon. Programar cinco sesiones individuales de coaching para compartir el mismo recurso se siente como un uso ineficiente del tiempo de todos.',
      choices: [
        { text: 'Copiar y pegar el mismo correo a los cinco maestros y esperar que lo lean.', diy: true },
        { text: 'Programar cinco reuniones separadas porque el coaching individual es el estandar de oro.', diy: true },
        { text: 'Compartir un enlace de Recurso Rapido del Hub. Todos obtienen la misma herramienta con apoyo comunitario integrado.', diy: false },
      ],
      tdiSolution: 'Comparte un solo enlace de Recurso Rapido con los cinco maestros. Cada uno obtiene el mismo recurso con apoyo comunitario, discusion y actividades de seguimiento integradas.',
      service: {
        name: 'Recursos Rapidos del Hub (Compartir Escalable)',
        description: 'Comparte un enlace con multiples maestros. Mismo recurso, apoyo comunitario integrado, sin reuniones duplicadas.',
        type: 'platform',
      },
      leanType: 'No tengo tiempo para esto',
    },
  },
  {
    role: 'coach',
    en: {
      context: 'New to coaching. Feeling like a fraud.',
      scenario: 'You just transitioned from teaching to coaching and you feel like an imposter. The teachers you are coaching have more experience than you. You are not sure you have the credibility to guide them.',
      choices: [
        { text: 'Fake it until you make it and hope no one calls you out.', diy: true },
        { text: 'Over-prepare for every conversation to compensate for feeling unsure.', diy: true },
        { text: 'Take the Educator Type quiz and Growth Style quiz. Join the Hub community with other coaches.', diy: false },
      ],
      tdiSolution: 'The Educator Type and Growth Style quizzes help you understand your strengths as a coach. The Hub community connects you with other coaches navigating the same transition.',
      service: {
        name: 'Educator Type + Growth Style + Hub Coach Community',
        description: 'Self-discovery quizzes and peer community for coaches building confidence in their new role.',
        type: 'community',
      },
      leanType: 'I need connection',
    },
    es: {
      context: 'Nuevo en coaching. Sintiendote como un fraude.',
      scenario: 'Acabas de transicionar de ensenanza a coaching y te sientes como un impostor. Los maestros a los que estas coaching tienen mas experiencia que tu. No estas seguro de tener la credibilidad para guiarlos.',
      choices: [
        { text: 'Fingir hasta lograrlo y esperar que nadie te descubra.', diy: true },
        { text: 'Sobre-prepararte para cada conversacion para compensar sentirte inseguro.', diy: true },
        { text: 'Tomar el cuestionario de Tipo de Educador y el de Estilo de Crecimiento. Unirte a la comunidad del Hub con otros coaches.', diy: false },
      ],
      tdiSolution: 'Los cuestionarios de Tipo de Educador y Estilo de Crecimiento te ayudan a entender tus fortalezas como coach. La comunidad del Hub te conecta con otros coaches navegando la misma transicion.',
      service: {
        name: 'Tipo de Educador + Estilo de Crecimiento + Comunidad de Coaches del Hub',
        description: 'Cuestionarios de autodescubrimiento y comunidad de pares para coaches construyendo confianza en su nuevo rol.',
        type: 'community',
      },
      leanType: 'Necesito conexion',
    },
  },
  {
    role: 'coach',
    en: {
      context: 'Principal wants a coaching impact report. You have notes, not data.',
      scenario: 'End of semester. The principal wants a report on coaching impact across the building. You have detailed notes from coaching sessions, but compiling them into something presentable will take hours.',
      choices: [
        { text: 'Spend 3 hours compiling your notes into a report format.', diy: true },
        { text: 'Send the principal your raw coaching notes and let them interpret.', diy: true },
        { text: 'Reach out to your TDI team. They help pull engagement data for coached teachers.', diy: false },
      ],
      tdiSolution: 'Your TDI team can pull Hub engagement data specific to the teachers you have coached, showing usage patterns, growth trends, and tool adoption.',
      service: {
        name: 'TDI Team Coaching Reports',
        description: 'Your TDI team pulls engagement data for coached teachers, showing impact through usage patterns.',
        type: 'team',
      },
      leanType: 'I can\'t solve this',
    },
    es: {
      context: 'El director quiere un informe de impacto de coaching. Tienes notas, no datos.',
      scenario: 'Fin de semestre. El director quiere un informe sobre el impacto del coaching en todo el edificio. Tienes notas detalladas de las sesiones de coaching, pero compilarlas en algo presentable tomara horas.',
      choices: [
        { text: 'Pasar 3 horas compilando tus notas en un formato de informe.', diy: true },
        { text: 'Enviar al director tus notas crudas de coaching y dejar que las interprete.', diy: true },
        { text: 'Contactar a tu equipo de TDI. Ellos ayudan a extraer datos de participacion para los maestros que has coaching.', diy: false },
      ],
      tdiSolution: 'Tu equipo de TDI puede extraer datos de participacion del Hub especificos para los maestros que has coaching, mostrando patrones de uso, tendencias de crecimiento y adopcion de herramientas.',
      service: {
        name: 'Informes de Coaching del Equipo TDI',
        description: 'Tu equipo de TDI extrae datos de participacion para maestros coaching, mostrando impacto a traves de patrones de uso.',
        type: 'team',
      },
      leanType: 'No puedo resolver esto',
    },
  },
]
