// This or That -- Peer Compare scenarios
// No correct answer. Two legitimate approaches. Educators pick one,
// then see how peers in their grade band responded.

import type { GradeBand } from './gameSettings'

export interface ThisOrThatOption {
  en: string
  es: string
  tag: { en: string; es: string }
}

export interface ThisOrThatInsight {
  nuance: { en: string; es: string }
  research: { en: string; es: string }
  choiceReveals: { a: { en: string; es: string }; b: { en: string; es: string } }
  reflection: { en: string; es: string }
}

export interface ThisOrThatScenario {
  id: string
  context: { en: string; es: string }
  question: { en: string; es: string }
  optionA: ThisOrThatOption
  optionB: ThisOrThatOption
  insight: ThisOrThatInsight
  gradeBands: GradeBand[] // which bands this scenario is relevant for
  // Seeded baseline distributions per grade band (percentage choosing A)
  seedData: Record<string, number>
  profileTags: { a: string; b: string } // tag keys for final profile
}

// Profile tag definitions -- accumulated across rounds for final screen
export interface ProfileTag {
  id: string
  title: { en: string; es: string }
  description: { en: string; es: string }
  color: string
}

export const PROFILE_TAGS: Record<string, ProfileTag> = {
  relationship_first: {
    id: 'relationship_first',
    title: { en: 'Relationship-First', es: 'Relacion Primero' },
    description: { en: 'You lead with connection before correction', es: 'Lideras con conexion antes de correccion' },
    color: '#3498DB',
  },
  structure_first: {
    id: 'structure_first',
    title: { en: 'Structure-First', es: 'Estructura Primero' },
    description: { en: 'You build the system, then the relationship follows', es: 'Construyes el sistema, luego la relacion sigue' },
    color: '#9333EA',
  },
  coach_in_moment: {
    id: 'coach_in_moment',
    title: { en: 'Coach-in-the-Moment', es: 'Coach en el Momento' },
    description: { en: 'You teach through real-time situations', es: 'Ensenas a traves de situaciones en tiempo real' },
    color: '#27AE60',
  },
  plan_ahead: {
    id: 'plan_ahead',
    title: { en: 'Plan-Ahead Thinker', es: 'Pensador Preventivo' },
    description: { en: 'You set up systems to prevent problems', es: 'Configuras sistemas para prevenir problemas' },
    color: '#E8B84B',
  },
  student_autonomy: {
    id: 'student_autonomy',
    title: { en: 'Student Autonomy Builder', es: 'Constructor de Autonomia' },
    description: { en: 'You give students ownership of their learning', es: 'Das a los estudiantes propiedad de su aprendizaje' },
    color: '#22b8bd',
  },
  teacher_directed: {
    id: 'teacher_directed',
    title: { en: 'Intentional Director', es: 'Director Intencional' },
    description: { en: 'You steer the learning with clear purpose', es: 'Diriges el aprendizaje con proposito claro' },
    color: '#FF7847',
  },
  warm_demander: {
    id: 'warm_demander',
    title: { en: 'Warm Demander', es: 'Exigente Calido' },
    description: { en: 'High expectations wrapped in genuine care', es: 'Altas expectativas envueltas en cuidado genuino' },
    color: '#E74C3C',
  },
  flexible_responder: {
    id: 'flexible_responder',
    title: { en: 'Flexible Responder', es: 'Respondedor Flexible' },
    description: { en: 'Context drives your decisions', es: 'El contexto impulsa tus decisiones' },
    color: '#F1C40F',
  },
}

export const THIS_OR_THAT_SCENARIOS: ThisOrThatScenario[] = [
  {
    id: 'tot-1',
    context: {
      en: 'A student finishes their work early and asks "Can I help other students?" You have seen this student give answers instead of helping peers think through problems.',
      es: 'Un estudiante termina su trabajo temprano y pregunta "Puedo ayudar a otros estudiantes?" Has visto que este estudiante da respuestas en lugar de ayudar a sus companeros a pensar.',
    },
    question: { en: 'Which approach do you take?', es: 'Que enfoque tomas?' },
    optionA: {
      en: 'Say yes and coach them on how to help without giving answers: "Ask them questions instead of telling them the answer."',
      es: 'Decir que si y ensenarlo a ayudar sin dar respuestas: "Hazles preguntas en lugar de decirles la respuesta."',
      tag: { en: 'Coach in the moment', es: 'Ensenar en el momento' },
    },
    optionB: {
      en: 'Redirect them to an extension activity: "I have a challenge problem that will stretch your thinking."',
      es: 'Redirigirlo a una actividad de extension: "Tengo un problema desafiante que estirara tu pensamiento."',
      tag: { en: 'Redirect to growth', es: 'Redirigir al crecimiento' },
    },
    insight: {
      nuance: { en: 'Both work. Option A builds leadership skills but requires follow-through. Option B protects peers but misses a chance to teach collaboration. Many educators start with B early in the year and shift to A once trust is built.', es: 'Ambos funcionan. La opcion A construye habilidades de liderazgo pero requiere seguimiento. La opcion B protege a los companeros pero pierde una oportunidad de ensenar colaboracion.' },
      research: { en: 'Vygotsky\'s Zone of Proximal Development suggests peer teaching deepens understanding for both students -- but only when the helper is coached on HOW to help, not just told to help.', es: 'La Zona de Desarrollo Proximo de Vygotsky sugiere que la ensenanza entre pares profundiza la comprension para ambos estudiantes -- pero solo cuando el ayudante recibe orientacion sobre COMO ayudar.' },
      choiceReveals: {
        a: { en: 'You see students as capable leaders who can grow through teaching others.', es: 'Ves a los estudiantes como lideres capaces que pueden crecer ensenando a otros.' },
        b: { en: 'You prioritize individual growth and protect the learning environment for all.', es: 'Priorizas el crecimiento individual y proteges el ambiente de aprendizaje para todos.' },
      },
      reflection: { en: 'Think of a student in your class right now who finishes early. Which approach would work better for THAT specific kid?', es: 'Piensa en un estudiante en tu clase que termina temprano. Que enfoque funcionaria mejor para ESE nino especifico?' },
    },
    gradeBands: ['all'],
    seedData: { 'all': 62, 'k-2': 55, '3-5': 60, '6-8': 65, '9-12': 70 },
    profileTags: { a: 'coach_in_moment', b: 'plan_ahead' },
  },
  {
    id: 'tot-2',
    context: {
      en: 'A student is clearly upset when they walk into your room. They are not disruptive, but they are not engaged either. They have their head on their desk.',
      es: 'Un estudiante esta claramente molesto cuando entra a tu salon. No esta causando problemas, pero tampoco esta participando. Tiene la cabeza sobre el escritorio.',
    },
    question: { en: 'What do you do first?', es: 'Que haces primero?' },
    optionA: {
      en: 'Go to them quietly and check in: "I see you. Take whatever time you need. I am here when you are ready."',
      es: 'Acercarte en silencio: "Te veo. Toma el tiempo que necesites. Estoy aqui cuando estes listo."',
      tag: { en: 'Connect first', es: 'Conectar primero' },
    },
    optionB: {
      en: 'Give them space and start the lesson. Check in after 5-10 minutes once things are rolling.',
      es: 'Darles espacio y empezar la leccion. Hablar con ellos despues de 5-10 minutos cuando todo este en marcha.',
      tag: { en: 'Space first', es: 'Espacio primero' },
    },
    insight: {
      nuance: { en: 'Option A shows immediate care but can put a spotlight on a student who wants to be invisible. Option B respects their space but risks the student feeling unseen. The best educators read the specific child -- some need the check-in, others need the breathing room.', es: 'La opcion A muestra cuidado inmediato pero puede poner en evidencia a un estudiante que quiere ser invisible. La opcion B respeta su espacio pero arriesga que el estudiante se sienta ignorado.' },
      research: { en: 'Dr. Bruce Perry\'s neurosequential model shows that dysregulated students cannot access their thinking brain until they feel safe. But "safe" looks different for every child -- some need words, others need silence.', es: 'El modelo neurosecuencial del Dr. Bruce Perry muestra que los estudiantes desregulados no pueden acceder a su cerebro pensante hasta que se sienten seguros. Pero "seguro" se ve diferente para cada nino.' },
      choiceReveals: {
        a: { en: 'You lead with relationship. You believe being seen is the first step to regulation.', es: 'Lideras con la relacion. Crees que ser visto es el primer paso hacia la regulacion.' },
        b: { en: 'You trust that space is a form of care. You give them agency to self-regulate.', es: 'Confias en que el espacio es una forma de cuidado. Les das agencia para autorregularse.' },
      },
      reflection: { en: 'Think of the last time a student came in upset. Did you check in or give space? What happened next?', es: 'Piensa en la ultima vez que un estudiante llego molesto. Lo buscaste o le diste espacio? Que paso despues?' },
    },
    gradeBands: ['all'],
    seedData: { 'all': 58, 'k-2': 72, '3-5': 60, '6-8': 50, '9-12': 42 },
    profileTags: { a: 'relationship_first', b: 'student_autonomy' },
  },
  {
    id: 'tot-3',
    context: {
      en: 'You notice two students are best friends and always want to sit together. When they sit together, they talk more but they also produce better work because they push each other.',
      es: 'Notas que dos estudiantes son mejores amigos y siempre quieren sentarse juntos. Cuando se sientan juntos, hablan mas pero tambien producen mejor trabajo porque se impulsan mutuamente.',
    },
    question: { en: 'Do you let them sit together?', es: 'Los dejas sentarse juntos?' },
    optionA: {
      en: 'Yes. The quality of work matters more than the noise level. Manage the talking, not the seating.',
      es: 'Si. La calidad del trabajo importa mas que el nivel de ruido. Maneja las conversaciones, no los asientos.',
      tag: { en: 'Trust the outcome', es: 'Confiar en el resultado' },
    },
    optionB: {
      en: 'No. Separate them so they learn to work independently and with different peers.',
      es: 'No. Separarlos para que aprendan a trabajar independientemente y con diferentes companeros.',
      tag: { en: 'Build independence', es: 'Construir independencia' },
    },
    insight: {
      nuance: { en: 'This is the classic autonomy vs structure debate. Option A trusts student judgment and accepts productive noise. Option B prioritizes skill-building (working with anyone) over comfort. Many teachers compromise -- together for collaborative work, separate for independent work.', es: 'Este es el debate clasico de autonomia vs estructura. La opcion A confia en el juicio del estudiante. La opcion B prioriza la construccion de habilidades sobre la comodidad.' },
      research: { en: 'Research on cooperative learning (Johnson & Johnson) shows that strategic grouping improves outcomes, but student choice in grouping increases intrinsic motivation. The tension between these two findings is real.', es: 'La investigacion sobre aprendizaje cooperativo (Johnson & Johnson) muestra que la agrupacion estrategica mejora los resultados, pero la eleccion del estudiante aumenta la motivacion intrinseca.' },
      choiceReveals: {
        a: { en: 'You value student agency and trust that productive noise is a sign of engagement.', es: 'Valoras la agencia del estudiante y confias en que el ruido productivo es senal de participacion.' },
        b: { en: 'You value adaptability and want students to build the skill of working with anyone.', es: 'Valoras la adaptabilidad y quieres que los estudiantes construyan la habilidad de trabajar con cualquiera.' },
      },
      reflection: { en: 'Is there a student pair in your class right now where this tension exists? What have you tried?', es: 'Hay una pareja de estudiantes en tu clase donde esta tension existe? Que has intentado?' },
    },
    gradeBands: ['all'],
    seedData: { 'all': 54, 'k-2': 45, '3-5': 50, '6-8': 58, '9-12': 65 },
    profileTags: { a: 'student_autonomy', b: 'structure_first' },
  },
  {
    id: 'tot-4',
    context: {
      en: 'A parent sends you an email saying their child "hates your class." You know this student has been struggling with the content but you have been working hard to support them.',
      es: 'Un padre te envia un correo diciendo que su hijo "odia tu clase." Sabes que este estudiante ha estado luchando con el contenido pero has estado trabajando duro para apoyarlo.',
    },
    question: { en: 'How do you respond?', es: 'Como respondes?' },
    optionA: {
      en: 'Lead with empathy: "Thank you for telling me. I want [student] to feel good about learning. Can we schedule a call to talk about what would help?"',
      es: 'Liderar con empatia: "Gracias por decirme. Quiero que [estudiante] se sienta bien aprendiendo. Podemos programar una llamada para hablar sobre que ayudaria?"',
      tag: { en: 'Open the door', es: 'Abrir la puerta' },
    },
    optionB: {
      en: 'Share specific evidence of your support: "Here is what I have been doing to help [student], including X, Y, and Z. I would love to partner on next steps."',
      es: 'Compartir evidencia especifica de tu apoyo: "Esto es lo que he estado haciendo para ayudar a [estudiante], incluyendo X, Y, y Z. Me encantaria colaborar en los siguientes pasos."',
      tag: { en: 'Show your work', es: 'Mostrar tu trabajo' },
    },
    insight: {
      nuance: { en: 'Option A builds the relationship but does not address the parent\'s concern directly. Option B shows competence but can feel defensive if the tone is not right. The best response often combines both -- empathy first, then evidence, then partnership.', es: 'La opcion A construye la relacion pero no aborda la preocupacion del padre directamente. La opcion B muestra competencia pero puede sentirse defensiva si el tono no es el correcto.' },
      research: { en: 'Joyce Epstein\'s framework for school-family partnerships identifies "two-way communication" as the foundation. Leading with questions (A) invites collaboration. Leading with evidence (B) builds credibility. The order matters more than the content.', es: 'El marco de Joyce Epstein para asociaciones escuela-familia identifica la "comunicacion bidireccional" como la base.' },
      choiceReveals: {
        a: { en: 'You prioritize the relationship with the parent before proving your effectiveness.', es: 'Priorizas la relacion con el padre antes de demostrar tu efectividad.' },
        b: { en: 'You want the parent to see the full picture before drawing conclusions.', es: 'Quieres que el padre vea el panorama completo antes de sacar conclusiones.' },
      },
      reflection: { en: 'When was the last time a parent pushed back on something? Did you lead with empathy or evidence? How did it land?', es: 'Cuando fue la ultima vez que un padre te cuestiono? Lideraste con empatia o evidencia? Como fue recibido?' },
    },
    gradeBands: ['all'],
    seedData: { 'all': 67, 'k-2': 75, '3-5': 68, '6-8': 60, '9-12': 55 },
    profileTags: { a: 'relationship_first', b: 'teacher_directed' },
  },
  {
    id: 'tot-5',
    context: {
      en: 'You have a lesson planned that you spent hours on. Ten minutes in, you can tell it is not landing. Students are confused, energy is low, and your co-teacher gives you "the look."',
      es: 'Tienes una leccion planeada en la que invertiste horas. Diez minutos despues, puedes ver que no esta funcionando. Los estudiantes estan confundidos, la energia es baja, y tu co-maestro te da "la mirada."',
    },
    question: { en: 'What do you do?', es: 'Que haces?' },
    optionA: {
      en: 'Pivot immediately. Scrap the plan, pull out a discussion or hands-on activity, and save the content for tomorrow when you can rethink the approach.',
      es: 'Cambiar inmediatamente. Dejar el plan, sacar una discusion o actividad practica, y guardar el contenido para manana cuando puedas repensar el enfoque.',
      tag: { en: 'Pivot now', es: 'Cambiar ahora' },
    },
    optionB: {
      en: 'Push through with adjustments. Slow down, add more scaffolding, check for understanding more frequently. The content is important and you prepared it for a reason.',
      es: 'Continuar con ajustes. Reducir el ritmo, agregar mas apoyo, verificar la comprension mas frecuentemente. El contenido es importante y lo preparaste por una razon.',
      tag: { en: 'Adjust and push', es: 'Ajustar y continuar' },
    },
    insight: {
      nuance: { en: 'Option A shows responsiveness but can become a habit that lets you off the hook for tough content. Option B shows persistence but risks losing students further. The real skill is reading the room -- is this a delivery problem (pivot) or a difficulty problem (scaffold)?', es: 'La opcion A muestra capacidad de respuesta pero puede convertirse en un habito. La opcion B muestra persistencia pero arriesga perder mas a los estudiantes.' },
      research: { en: 'Doug Lemov\'s "Teach Like a Champion" emphasizes the importance of "planned purpose" -- but also acknowledges that the best teachers pivot without guilt. John Hattie\'s research shows that teacher responsiveness (adjusting in real-time) has an effect size of 0.90, one of the highest in education.', es: 'Doug Lemov enfatiza la importancia del "proposito planeado" pero tambien reconoce que los mejores maestros cambian sin culpa. La investigacion de John Hattie muestra que la capacidad de respuesta del maestro tiene un tamano de efecto de 0.90.' },
      choiceReveals: {
        a: { en: 'You trust your instincts over your plan. You believe learning should feel alive, not forced.', es: 'Confias en tus instintos sobre tu plan. Crees que el aprendizaje debe sentirse vivo, no forzado.' },
        b: { en: 'You honor your preparation and believe persistence through difficulty builds resilience.', es: 'Honras tu preparacion y crees que la persistencia a traves de la dificultad construye resiliencia.' },
      },
      reflection: { en: 'Think of a lesson that bombed. Did you pivot or push through? Would you make the same call today?', es: 'Piensa en una leccion que fallo. Cambiaste o continuaste? Harias la misma decision hoy?' },
    },
    gradeBands: ['all'],
    seedData: { 'all': 56, 'k-2': 62, '3-5': 55, '6-8': 52, '9-12': 48 },
    profileTags: { a: 'flexible_responder', b: 'plan_ahead' },
  },
  {
    id: 'tot-6',
    context: {
      en: 'A student who rarely participates raises their hand for the first time all week. Their answer is wrong.',
      es: 'Un estudiante que raramente participa levanta la mano por primera vez en toda la semana. Su respuesta es incorrecta.',
    },
    question: { en: 'How do you respond?', es: 'Como respondes?' },
    optionA: {
      en: '"I love that you raised your hand. You are on the right track with your thinking. Let me ask it a different way..." Then rephrase to help them get there.',
      es: '"Me encanta que levantaste la mano. Vas por buen camino con tu pensamiento. Dejame preguntarlo de otra manera..." Luego reformula para ayudarle a llegar.',
      tag: { en: 'Protect and scaffold', es: 'Proteger y apoyar' },
    },
    optionB: {
      en: '"Not quite. The answer is [X]. But I noticed you used [strategy Y] which shows good thinking. Keep raising that hand."',
      es: '"No exactamente. La respuesta es [X]. Pero note que usaste [estrategia Y] que muestra buen pensamiento. Sigue levantando esa mano."',
      tag: { en: 'Honest and encouraging', es: 'Honesto y alentador' },
    },
    insight: {
      nuance: { en: 'Option A avoids saying "wrong" but takes more class time. Option B is direct but names what was RIGHT about their thinking. Both validate the courage it took to participate. The wrong move is the one nobody mentioned -- just saying "no" and moving on.', es: 'La opcion A evita decir "incorrecto" pero toma mas tiempo de clase. La opcion B es directa pero nombra lo que ERA CORRECTO sobre su pensamiento. Ambas validan el coraje que tomo participar.' },
      research: { en: 'Carol Dweck\'s growth mindset research shows that praising effort and strategy (both options do this) matters more than praising intelligence. Amanda Ripley\'s research on high-performing classrooms shows that normalizing mistakes accelerates learning.', es: 'La investigacion de Carol Dweck sobre mentalidad de crecimiento muestra que elogiar el esfuerzo y la estrategia importa mas que elogiar la inteligencia.' },
      choiceReveals: {
        a: { en: 'You prioritize emotional safety. You want this student to raise their hand again tomorrow.', es: 'Priorizas la seguridad emocional. Quieres que este estudiante levante la mano manana de nuevo.' },
        b: { en: 'You value honesty and believe students can handle correction when it comes with encouragement.', es: 'Valoras la honestidad y crees que los estudiantes pueden manejar la correccion cuando viene con animo.' },
      },
      reflection: { en: 'How do you handle wrong answers in your room? Do students feel safe being wrong?', es: 'Como manejas las respuestas incorrectas en tu salon? Los estudiantes se sienten seguros estando equivocados?' },
    },
    gradeBands: ['all'],
    seedData: { 'all': 61, 'k-2': 70, '3-5': 62, '6-8': 55, '9-12': 50 },
    profileTags: { a: 'relationship_first', b: 'warm_demander' },
  },
  {
    id: 'tot-7',
    context: {
      en: 'Your school just adopted a new curriculum. You think some of it is good but parts of it do not work for your students. You have your own materials that you know are effective.',
      es: 'Tu escuela acaba de adoptar un nuevo curriculo. Piensas que parte es bueno pero partes no funcionan para tus estudiantes. Tienes tus propios materiales que sabes que son efectivos.',
    },
    question: { en: 'What do you do?', es: 'Que haces?' },
    optionA: {
      en: 'Teach the new curriculum as designed for a full unit before making changes. Give it a fair chance with fidelity, then adapt based on data.',
      es: 'Ensenar el nuevo curriculo como fue disenado por una unidad completa antes de hacer cambios. Darle una oportunidad justa con fidelidad, luego adaptar basado en datos.',
      tag: { en: 'Trust the process', es: 'Confiar en el proceso' },
    },
    optionB: {
      en: 'Blend the new curriculum with your proven materials from day one. You know your students best and should use your professional judgment.',
      es: 'Mezclar el nuevo curriculo con tus materiales probados desde el primer dia. Tu conoces mejor a tus estudiantes y deberias usar tu juicio profesional.',
      tag: { en: 'Trust your expertise', es: 'Confiar en tu experiencia' },
    },
    insight: {
      nuance: { en: 'Option A shows team alignment and gives the curriculum a fair evaluation. Option B honors teacher expertise but can undermine school-wide coherence. The sweet spot: teach it with fidelity first, collect evidence, then have a data-driven conversation with your team about adaptations.', es: 'La opcion A muestra alineacion de equipo y da una evaluacion justa al curriculo. La opcion B honra la experiencia del maestro pero puede socavar la coherencia escolar.' },
      research: { en: 'Research on curriculum implementation (Fullan) shows that fidelity in the first year leads to better long-term outcomes than immediate adaptation. But teachers with high self-efficacy (Bandura) produce better results regardless of curriculum -- because they adapt intelligently.', es: 'La investigacion sobre implementacion curricular (Fullan) muestra que la fidelidad en el primer ano lleva a mejores resultados a largo plazo. Pero maestros con alta autoeficacia (Bandura) producen mejores resultados independientemente del curriculo.' },
      choiceReveals: {
        a: { en: 'You are a team player who values data over instinct. You want to evaluate before you adapt.', es: 'Eres un jugador de equipo que valora los datos sobre el instinto. Quieres evaluar antes de adaptar.' },
        b: { en: 'You trust your classroom experience. You believe professional judgment is a form of expertise.', es: 'Confias en tu experiencia en el salon. Crees que el juicio profesional es una forma de experiencia.' },
      },
      reflection: { en: 'Has your school adopted something new recently? How did you handle the tension between compliance and autonomy?', es: 'Tu escuela ha adoptado algo nuevo recientemente? Como manejaste la tension entre cumplimiento y autonomia?' },
    },
    gradeBands: ['all'],
    seedData: { 'all': 42, 'k-2': 38, '3-5': 40, '6-8': 45, '9-12': 50 },
    profileTags: { a: 'structure_first', b: 'flexible_responder' },
  },
  {
    id: 'tot-8',
    context: {
      en: 'It is 3:15 PM on a Friday. You have a stack of ungraded work, emails to respond to, and next week to plan. You also promised yourself you would leave by 4:00.',
      es: 'Son las 3:15 PM de un viernes. Tienes un monton de trabajo sin calificar, correos que responder, y la proxima semana que planear. Tambien te prometiste que saldrias a las 4:00.',
    },
    question: { en: 'What gets your attention?', es: 'Que recibe tu atencion?' },
    optionA: {
      en: 'Grading. Students need feedback before Monday. Emails and planning can wait until Sunday night.',
      es: 'Calificar. Los estudiantes necesitan retroalimentacion antes del lunes. Los correos y la planeacion pueden esperar hasta el domingo por la noche.',
      tag: { en: 'Students first', es: 'Estudiantes primero' },
    },
    optionB: {
      en: 'Planning. A well-planned Monday means a better week for everyone. Grade during planning period next week.',
      es: 'Planear. Un lunes bien planeado significa una mejor semana para todos. Calificar durante el periodo de planeacion la proxima semana.',
      tag: { en: 'Set up the week', es: 'Preparar la semana' },
    },
    insight: {
      nuance: { en: 'Neither is wrong and both sacrifice something. Option A gives students timely feedback but steals your weekend for planning. Option B sets up a smooth Monday but delays feedback. The real question: which one will you regret NOT doing on Monday morning?', es: 'Ninguna es incorrecta y ambas sacrifican algo. La opcion A da retroalimentacion oportuna pero roba tu fin de semana para planear. La opcion B prepara un lunes fluido pero retrasa la retroalimentacion.' },
      research: { en: 'Research on teacher burnout (Maslach) shows that the teachers who last are the ones who protect their boundaries. The "right" answer changes based on your season. Early career: planning reduces anxiety. Mid-career: feedback builds relationships. Late career: protecting your 4:00 exit IS the right answer.', es: 'La investigacion sobre el agotamiento docente (Maslach) muestra que los maestros que duran son los que protegen sus limites.' },
      choiceReveals: {
        a: { en: 'You prioritize student impact over your own comfort. Your students feel your investment.', es: 'Priorizas el impacto estudiantil sobre tu propia comodidad. Tus estudiantes sienten tu inversion.' },
        b: { en: 'You think systemically. A prepared teacher is a better teacher, and that benefits everyone.', es: 'Piensas sistematicamente. Un maestro preparado es un mejor maestro, y eso beneficia a todos.' },
      },
      reflection: { en: 'Be honest: when was the last time you actually left at the time you promised yourself? What would it take to protect that boundary?', es: 'Se honesto: cuando fue la ultima vez que realmente saliste a la hora que te prometiste? Que se necesitaria para proteger ese limite?' },
    },
    gradeBands: ['all'],
    seedData: { 'all': 48, 'k-2': 52, '3-5': 50, '6-8': 45, '9-12': 42 },
    profileTags: { a: 'warm_demander', b: 'plan_ahead' },
  },
]

export const THIS_OR_THAT_ROUNDS = 8
