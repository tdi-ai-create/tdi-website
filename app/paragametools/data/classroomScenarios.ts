// Classroom Scenario Shuffle -- general classroom management scenarios for all educators

import type { Difficulty, GradeBand, EducatorRole } from './gameSettings'

export interface ScenarioChoice {
  en: string
  es: string
  correct: boolean
  explanation: { en: string; es: string }
}

export interface ClassroomScenario {
  en: { context: string; question: string }
  es: { context: string; question: string }
  choices: ScenarioChoice[]
  difficulty?: Difficulty
  gradeBand?: GradeBand | GradeBand[]
  roles?: EducatorRole | EducatorRole[]
}

export const CLASSROOM_SCENARIOS: ClassroomScenario[] = [
  {
    en: {
      context: 'A student who is usually engaged suddenly puts their head down and refuses to participate. It is only 10 minutes into class.',
      question: 'What is your best first move?',
    },
    es: {
      context: 'Un estudiante que generalmente participa de repente baja la cabeza y se niega a participar. Solo han pasado 10 minutos de clase.',
      question: 'Cual es tu mejor primer movimiento?',
    },
    difficulty: 'easy',
    gradeBand: 'all',
    choices: [
      {
        en: 'Quietly approach and say "I notice you are having a tough moment. I am here when you are ready."',
        es: 'Acercarse en silencio y decir "Noto que estas teniendo un momento dificil. Estoy aqui cuando estes listo."',
        correct: true,
        explanation: {
          en: 'Acknowledging without demanding shows the student they are seen without putting them on the spot. This builds trust and gives them space to self-regulate.',
          es: 'Reconocer sin exigir le muestra al estudiante que es visto sin ponerlo en evidencia.',
        },
      },
      {
        en: 'Call on them to answer a question to get them re-engaged.',
        es: 'Llamarlos para responder una pregunta para que se reintegren.',
        correct: false,
        explanation: {
          en: 'Putting a struggling student on the spot can escalate the situation and damage trust. They need space first.',
          es: 'Poner a un estudiante que esta pasandola mal en evidencia puede empeorar la situacion.',
        },
      },
      {
        en: 'Ignore it and move on -- they will come around eventually.',
        es: 'Ignorarlo y seguir adelante -- eventualmente se recuperaran.',
        correct: false,
        explanation: {
          en: 'Ignoring sends a message that you do not notice or care. A brief acknowledgment takes seconds and can change their whole day.',
          es: 'Ignorar envia el mensaje de que no notas o no te importa.',
        },
      },
    ],
  },
  {
    en: {
      context: 'Two students are whispering and giggling during your lesson. It is distracting other students nearby.',
      question: 'What do you do?',
    },
    es: {
      context: 'Dos estudiantes estan susurrando y riendose durante tu leccion. Esta distrayendo a otros estudiantes cercanos.',
      question: 'Que haces?',
    },
    difficulty: 'easy',
    gradeBand: 'all',
    choices: [
      {
        en: 'Move closer to them while continuing to teach (proximity).',
        es: 'Acercarse a ellos mientras continuas ensenando (proximidad).',
        correct: true,
        explanation: {
          en: 'Proximity is the lowest-intervention strategy that works. You redirect without interrupting the flow of learning for everyone else.',
          es: 'La proximidad es la estrategia de menor intervencion que funciona. Rediriges sin interrumpir el flujo de aprendizaje.',
        },
      },
      {
        en: 'Stop the lesson and say "I will wait until everyone is ready."',
        es: 'Detener la leccion y decir "Voy a esperar hasta que todos esten listos."',
        correct: false,
        explanation: {
          en: 'This stops learning for everyone because of two students. It also puts those students on the spot publicly, which can create resentment.',
          es: 'Esto detiene el aprendizaje de todos por dos estudiantes y los pone en evidencia publicamente.',
        },
      },
      {
        en: 'Separate them immediately and assign new seats.',
        es: 'Separarlos inmediatamente y asignar nuevos asientos.',
        correct: false,
        explanation: {
          en: 'Jumping to seat changes is a big move for a small behavior. Try proximity and a quiet redirect first. Save seat changes for patterns, not single incidents.',
          es: 'Cambiar asientos es una respuesta grande para un comportamiento pequeno. Intenta proximidad primero.',
        },
      },
    ],
  },
  {
    en: {
      context: 'A parent emails you upset because their child says "the teacher does not like me." You know you have been firm with this student about behavior.',
      question: 'How do you respond?',
    },
    es: {
      context: 'Un padre te envia un correo molesto porque su hijo dice "la maestra no me quiere." Sabes que has sido firme con este estudiante sobre su comportamiento.',
      question: 'Como respondes?',
    },
    difficulty: 'hard',
    gradeBand: 'all',
    roles: ['teacher', 'coach'],
    choices: [
      {
        en: 'Acknowledge the parent\'s concern, share something positive about the student, then explain the behavior expectations.',
        es: 'Reconocer la preocupacion del padre, compartir algo positivo sobre el estudiante, luego explicar las expectativas de comportamiento.',
        correct: true,
        explanation: {
          en: 'Leading with empathy and a positive builds the parent as an ally. They are more likely to hear you on the behavior piece if they feel you genuinely care about their child.',
          es: 'Comenzar con empatia y algo positivo construye al padre como aliado.',
        },
      },
      {
        en: 'List specific behavior incidents so the parent understands why you have been firm.',
        es: 'Listar incidentes especificos de comportamiento para que el padre entienda por que has sido firme.',
        correct: false,
        explanation: {
          en: 'Starting with a list of problems puts the parent on the defensive. They came with an emotional concern -- meet them there first.',
          es: 'Comenzar con una lista de problemas pone al padre a la defensiva.',
        },
      },
      {
        en: 'Tell the parent their child is not being truthful about what happens in class.',
        es: 'Decirle al padre que su hijo no esta siendo sincero sobre lo que pasa en clase.',
        correct: false,
        explanation: {
          en: 'Calling a child a liar to their parent destroys trust instantly. The child\'s feeling is valid even if their interpretation is incomplete.',
          es: 'Llamar a un nino mentiroso a sus padres destruye la confianza instantaneamente.',
        },
      },
    ],
  },
  {
    en: {
      context: 'You planned a group activity but half your class is absent today because of a field trip for another grade.',
      question: 'What do you do?',
    },
    es: {
      context: 'Planeaste una actividad grupal pero la mitad de tu clase esta ausente hoy por una excursion de otro grado.',
      question: 'Que haces?',
    },
    difficulty: 'medium',
    gradeBand: 'all',
    choices: [
      {
        en: 'Pivot to a meaningful independent or partner activity that does not require the full class.',
        es: 'Cambiar a una actividad independiente o en parejas que no requiera toda la clase.',
        correct: true,
        explanation: {
          en: 'Flexibility is a superpower. Save the group activity for when everyone is back and use today for something that still moves learning forward. Your students will respect the pivot.',
          es: 'La flexibilidad es un superpoder. Guarda la actividad grupal para cuando todos regresen.',
        },
      },
      {
        en: 'Do the group activity anyway with smaller groups.',
        es: 'Hacer la actividad grupal de todos modos con grupos mas pequenos.',
        correct: false,
        explanation: {
          en: 'If the activity was designed for full-class dynamics, forcing it with half the students can feel incomplete and you will have to redo it anyway for the absent students.',
          es: 'Si la actividad fue disenada para toda la clase, forzarla con la mitad puede sentirse incompleta.',
        },
      },
      {
        en: 'Show a video or give a free period since the lesson cannot happen as planned.',
        es: 'Mostrar un video o dar un periodo libre ya que la leccion no puede suceder como se planeo.',
        correct: false,
        explanation: {
          en: 'Every minute of class time is valuable. A pivot takes more effort but sends the message that learning happens every day, not just when everything goes perfectly.',
          es: 'Cada minuto de clase es valioso. Un cambio de plan requiere mas esfuerzo pero envia el mensaje de que se aprende todos los dias.',
        },
      },
    ],
  },
  {
    en: {
      context: 'A student turns in work that is clearly copied from the internet. This is the first time it has happened with this student.',
      question: 'How do you handle it?',
    },
    es: {
      context: 'Un estudiante entrega un trabajo que claramente fue copiado de internet. Es la primera vez que sucede con este estudiante.',
      question: 'Como lo manejas?',
    },
    difficulty: 'hard',
    gradeBand: ['6-8', '9-12'],
    choices: [
      {
        en: 'Have a private conversation: "I noticed this matches something online. What happened? Let us figure out a plan."',
        es: 'Tener una conversacion privada: "Note que esto coincide con algo en linea. Que paso? Encontremos un plan."',
        correct: true,
        explanation: {
          en: 'A private, curious conversation finds the root cause (confused? overwhelmed? did not understand the assignment?) without shaming. First offenses are teaching moments, not punishment moments.',
          es: 'Una conversacion privada y curiosa encuentra la causa raiz sin avergonzar.',
        },
      },
      {
        en: 'Give them a zero and explain the plagiarism policy.',
        es: 'Darles un cero y explicar la politica de plagio.',
        correct: false,
        explanation: {
          en: 'A zero on a first offense teaches the student to hide better, not to learn better. Understand why it happened before jumping to consequences.',
          es: 'Un cero en la primera ofensa ensena al estudiante a esconderse mejor, no a aprender mejor.',
        },
      },
      {
        en: 'Let it go this time but keep an eye on future work.',
        es: 'Dejarlo pasar esta vez pero vigilar el trabajo futuro.',
        correct: false,
        explanation: {
          en: 'Ignoring it sends the message that copying is acceptable. The student needs to know you noticed AND that you care enough to help them do it right.',
          es: 'Ignorarlo envia el mensaje de que copiar es aceptable.',
        },
      },
    ],
  },
  {
    en: {
      context: 'You are in a staff meeting and a colleague publicly criticizes your teaching approach in front of the team.',
      question: 'What is your move?',
    },
    es: {
      context: 'Estas en una reunion de personal y un colega critica publicamente tu enfoque de ensenanza frente al equipo.',
      question: 'Cual es tu movimiento?',
    },
    difficulty: 'expert',
    gradeBand: 'all',
    roles: ['teacher', 'coach', 'leader'],
    choices: [
      {
        en: 'Stay calm. Say "I appreciate the feedback. I would love to talk more about this one-on-one after the meeting."',
        es: 'Mantener la calma. Decir "Agradezco los comentarios. Me encantaria hablar mas sobre esto uno a uno despues de la reunion."',
        correct: true,
        explanation: {
          en: 'Redirecting to a private conversation is powerful. It shows professionalism, avoids a public conflict, and gives you time to process before responding emotionally.',
          es: 'Redirigir a una conversacion privada es poderoso. Muestra profesionalismo y evita un conflicto publico.',
        },
      },
      {
        en: 'Defend your approach and explain why it works for your students.',
        es: 'Defender tu enfoque y explicar por que funciona para tus estudiantes.',
        correct: false,
        explanation: {
          en: 'Defending publicly can turn into a debate that derails the meeting. Even if you are right, the audience dynamics work against you.',
          es: 'Defenderse publicamente puede convertirse en un debate que descarrila la reunion.',
        },
      },
      {
        en: 'Say nothing and move on, but bring it up with your administrator later.',
        es: 'No decir nada y seguir adelante, pero mencionarlo a tu administrador despues.',
        correct: false,
        explanation: {
          en: 'Going to admin without addressing your colleague first creates a triangle. A direct, private conversation is almost always the better first step.',
          es: 'Ir al administrador sin hablar primero con tu colega crea un triangulo.',
        },
      },
    ],
  },
  {
    en: {
      context: 'It is Friday afternoon and your students are completely checked out. You still have 30 minutes of content to cover.',
      question: 'What do you do?',
    },
    es: {
      context: 'Es viernes por la tarde y tus estudiantes estan completamente desconectados. Todavia tienes 30 minutos de contenido que cubrir.',
      question: 'Que haces?',
    },
    difficulty: 'medium',
    gradeBand: 'all',
    choices: [
      {
        en: 'Shift the format -- turn the content into a quick game, discussion, or partner challenge.',
        es: 'Cambiar el formato -- convertir el contenido en un juego rapido, discusion o desafio en parejas.',
        correct: true,
        explanation: {
          en: 'The content still matters but the delivery method needs to match the energy in the room. Same learning target, different vehicle. This is not giving up -- it is being responsive.',
          es: 'El contenido sigue importando pero el metodo de entrega necesita coincidir con la energia del salon.',
        },
      },
      {
        en: 'Push through the lesson as planned -- they need to learn this material.',
        es: 'Continuar con la leccion como fue planeada -- necesitan aprender este material.',
        correct: false,
        explanation: {
          en: 'Teaching to a room that is not listening is not actually teaching. The material will not stick if they are mentally gone. Meet them where they are.',
          es: 'Ensenar a un salon que no escucha no es realmente ensenar.',
        },
      },
      {
        en: 'Give them free time since they clearly cannot focus.',
        es: 'Darles tiempo libre ya que claramente no pueden concentrarse.',
        correct: false,
        explanation: {
          en: 'Free time feels like a reward for checking out. A format shift keeps the learning happening while honoring the energy reality of a Friday afternoon.',
          es: 'El tiempo libre se siente como una recompensa por desconectarse.',
        },
      },
    ],
  },
  {
    en: {
      context: 'A new student joins your class mid-year. They seem anxious, sit alone, and have not spoken to anyone after two days.',
      question: 'What is your approach?',
    },
    es: {
      context: 'Un nuevo estudiante se une a tu clase a mitad de ano. Parece ansioso, se sienta solo y no ha hablado con nadie despues de dos dias.',
      question: 'Cual es tu enfoque?',
    },
    difficulty: 'medium',
    gradeBand: 'all',
    choices: [
      {
        en: 'Quietly assign a trusted student buddy and check in with the new student privately.',
        es: 'Asignar discretamente a un companero de confianza y hablar con el nuevo estudiante en privado.',
        correct: true,
        explanation: {
          en: 'A buddy gives them a safe connection without the pressure of a whole-class introduction. A private check-in shows you see them as a person, not just a new name on your roster.',
          es: 'Un companero les da una conexion segura sin la presion de una presentacion ante toda la clase.',
        },
      },
      {
        en: 'Have the class do a get-to-know-you activity so everyone can welcome them.',
        es: 'Hacer que la clase haga una actividad para conocerse para que todos los reciban.',
        correct: false,
        explanation: {
          en: 'A whole-class spotlight on an anxious new student can be overwhelming. It puts all the social pressure on the person least equipped to handle it right now.',
          es: 'Poner a un estudiante ansioso en el centro de atencion de toda la clase puede ser abrumador.',
        },
      },
      {
        en: 'Give them time and space -- they will open up when they are ready.',
        es: 'Darles tiempo y espacio -- se abriran cuando esten listos.',
        correct: false,
        explanation: {
          en: 'Some students need a bridge, not just time. Two days of silence can feel like an eternity to a new student. Small, intentional moves make a huge difference.',
          es: 'Algunos estudiantes necesitan un puente, no solo tiempo.',
        },
      },
    ],
  },
]

export const SCENARIO_COUNT = 8
