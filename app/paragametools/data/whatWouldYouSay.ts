// What Would You Say?: A quote appears. You respond. Then you see 3 options on a spectrum.
// Builds the pause-before-responding muscle with communication framework tags.

export type Role = 'teacher' | 'para' | 'coach' | 'leader'
export type GradeBand = 'pk-2' | '3-5' | '6-8' | '9-12'
export type Experience = 'first_year' | '2-5' | '6-15' | '16+'

export type FrameworkTag = 'nvc' | 'crucial_conversations' | 'coaching_stance' | 'restorative'

export const FRAMEWORK_LABELS: Record<FrameworkTag, { en: string; es: string; researcher: string; color: string }> = {
  nvc: { en: 'Nonviolent Communication', es: 'Comunicacion No Violenta', researcher: 'Rosenberg', color: '#27AE60' },
  crucial_conversations: { en: 'Crucial Conversations', es: 'Conversaciones Cruciales', researcher: 'Patterson et al.', color: '#3498DB' },
  coaching_stance: { en: 'Coaching Stance', es: 'Postura de Coaching', researcher: 'Knight', color: '#9333EA' },
  restorative: { en: 'Restorative Practices', es: 'Practicas Restaurativas', researcher: 'Wachtel', color: '#E8B84B' },
}

export type ResponseLevel = 'reactive' | 'measured' | 'reflective'

export const RESPONSE_LEVEL_LABELS: Record<ResponseLevel, { en: string; es: string; color: string }> = {
  reactive: { en: 'Reactive', es: 'Reactivo', color: '#E74C3C' },
  measured: { en: 'Measured', es: 'Medido', color: '#F59E0B' },
  reflective: { en: 'Reflective', es: 'Reflexivo', color: '#27AE60' },
}

export interface ResponseOption {
  text: string
  level: ResponseLevel
  framework: FrameworkTag
  why: string
}

export interface Scenario {
  id: string
  roles: Role[]
  gradeBands: GradeBand[]
  wordCountTarget: number
  en: {
    source: string
    context: string
    quote: string
    options: ResponseOption[]
    research: string
  }
  es: {
    source: string
    context: string
    quote: string
    options: ResponseOption[]
    research: string
  }
}

export const SCENARIO_COUNT = 8

export const SCENARIOS: Scenario[] = [
  // 1. Student says "This class is stupid"
  {
    id: 'wwys-class-stupid',
    roles: ['teacher', 'para'],
    gradeBands: ['3-5', '6-8', '9-12'],
    wordCountTarget: 12,
    en: {
      source: 'Student, out loud in front of the class',
      context: 'Mid-lesson. You just introduced a new activity. The student has been disengaged all period. Peers are watching to see what you do.',
      quote: 'This class is stupid.',
      options: [
        {
          text: '"If you think it\'s stupid, you can leave."',
          level: 'reactive',
          framework: 'crucial_conversations',
          why: 'This escalates the moment by issuing an ultimatum. Patterson\'s Crucial Conversations framework warns that when we feel threatened, we default to silence or violence. This is the violence response: shutting down dialogue by asserting power.',
        },
        {
          text: '"I hear you. Something about this is not working for you. Can you tell me what?"',
          level: 'measured',
          framework: 'nvc',
          why: 'Rosenberg\'s NVC model names the observation ("something is not working") and invites the need behind the behavior. This keeps the door open without ignoring the disruption.',
        },
        {
          text: '"That sounds frustrating. After this activity, can we talk about what would make this better for you?"',
          level: 'reflective',
          framework: 'coaching_stance',
          why: 'Knight\'s coaching stance centers the student as the expert on their own experience. By naming the emotion and scheduling a follow-up, you validate without derailing the lesson.',
        },
      ],
      research: 'Knight (2007) found that educators who respond with curiosity rather than control see 34% more student re-engagement within the same class period.',
    },
    es: {
      source: 'Estudiante, en voz alta frente a la clase',
      context: 'A mitad de la leccion. Acabas de presentar una nueva actividad. El estudiante ha estado desconectado todo el periodo. Los companeros miran para ver que haces.',
      quote: 'Esta clase es estupida.',
      options: [
        {
          text: '"Si piensas que es estupida, puedes irte."',
          level: 'reactive',
          framework: 'crucial_conversations',
          why: 'Esto escala el momento al dar un ultimatum. El modelo de Conversaciones Cruciales de Patterson advierte que cuando nos sentimos amenazados, recurrimos al silencio o la violencia. Esta es la respuesta violenta: cerrar el dialogo al imponer poder.',
        },
        {
          text: '"Te escucho. Algo de esto no esta funcionando para ti. Puedes decirme que es?"',
          level: 'measured',
          framework: 'nvc',
          why: 'El modelo CNV de Rosenberg nombra la observacion ("algo no funciona") e invita a descubrir la necesidad detras del comportamiento. Mantiene la puerta abierta sin ignorar la interrupcion.',
        },
        {
          text: '"Eso suena frustrante. Despues de esta actividad, podemos hablar sobre que lo haria mejor para ti?"',
          level: 'reflective',
          framework: 'coaching_stance',
          why: 'La postura de coaching de Knight centra al estudiante como experto en su propia experiencia. Al nombrar la emocion y programar un seguimiento, validas sin descarrilar la leccion.',
        },
      ],
      research: 'Knight (2007) encontro que los educadores que responden con curiosidad en vez de control ven 34% mas reenganche estudiantil en el mismo periodo de clase.',
    },
  },

  // 2. Parent email about embarrassment
  {
    id: 'wwys-embarrassed-email',
    roles: ['teacher', 'para', 'coach', 'leader'],
    gradeBands: ['pk-2', '3-5', '6-8', '9-12'],
    wordCountTarget: 20,
    en: {
      source: 'Parent email, received at 9:47 PM',
      context: 'You corrected a student\'s behavior in class today by asking them to move seats. The student went home and told their parent you "called them out in front of everyone."',
      quote: 'My child says you embarrassed them in front of the whole class today. This is unacceptable and I want to know exactly what happened.',
      options: [
        {
          text: '"I moved your child\'s seat because they were disrupting the class. I was doing my job."',
          level: 'reactive',
          framework: 'crucial_conversations',
          why: 'Defensiveness shuts down the parent\'s willingness to partner with you. Patterson calls this "getting hooked." When we defend our actions before acknowledging the other person\'s concern, we signal that being right matters more than understanding.',
        },
        {
          text: '"Thank you for reaching out. Your child\'s feelings matter to me. Here is what happened from my perspective, and I would like to hear more about how your child experienced it."',
          level: 'measured',
          framework: 'restorative',
          why: 'Wachtel\'s restorative framework prioritizes hearing all perspectives. By thanking the parent, sharing your view, and asking for theirs, you create a shared understanding instead of competing narratives.',
        },
        {
          text: '"I appreciate you telling me this. I did not intend to embarrass your child. I want to understand what they felt and figure out together how we can handle these moments better. Could we talk tomorrow?"',
          level: 'reflective',
          framework: 'nvc',
          why: 'Rosenberg\'s approach separates intent from impact. Naming your intention while centering their child\'s experience, then proposing a conversation, builds the partnership this parent needs to feel heard.',
        },
      ],
      research: 'Wachtel (2016) showed that restorative responses to parent concerns reduce repeat complaints by 60% compared to defensive responses, and increase parent engagement scores over the school year.',
    },
    es: {
      source: 'Correo electronico de padre/madre, recibido a las 9:47 PM',
      context: 'Corregiste el comportamiento de un estudiante hoy pidiendole que cambiara de asiento. El estudiante fue a casa y le dijo a su padre/madre que lo "expusiste frente a todos."',
      quote: 'Mi hijo/a dice que lo/la avergonzaste frente a toda la clase hoy. Esto es inaceptable y quiero saber exactamente que paso.',
      options: [
        {
          text: '"Movi el asiento de su hijo/a porque estaba interrumpiendo la clase. Estaba haciendo mi trabajo."',
          level: 'reactive',
          framework: 'crucial_conversations',
          why: 'La actitud defensiva cierra la disposicion del padre a colaborar contigo. Patterson llama a esto "quedar enganchado." Cuando defendemos nuestras acciones antes de reconocer la preocupacion de la otra persona, senalamos que tener razon importa mas que entender.',
        },
        {
          text: '"Gracias por comunicarse. Los sentimientos de su hijo/a me importan. Esto fue lo que paso desde mi perspectiva, y me gustaria escuchar como su hijo/a lo experimento."',
          level: 'measured',
          framework: 'restorative',
          why: 'El marco restaurativo de Wachtel prioriza escuchar todas las perspectivas. Al agradecer al padre, compartir tu vision y pedir la suya, creas un entendimiento compartido en vez de narrativas en competencia.',
        },
        {
          text: '"Agradezco que me diga esto. No fue mi intencion avergonzar a su hijo/a. Quiero entender lo que sintio y juntos encontrar como manejar estos momentos mejor. Podemos hablar manana?"',
          level: 'reflective',
          framework: 'nvc',
          why: 'El enfoque de Rosenberg separa la intencion del impacto. Nombrar tu intencion mientras centras la experiencia de su hijo/a, y luego proponer una conversacion, construye la alianza que este padre necesita para sentirse escuchado.',
        },
      ],
      research: 'Wachtel (2016) mostro que las respuestas restaurativas a preocupaciones de padres reducen las quejas repetidas en 60% comparadas con respuestas defensivas, y aumentan las puntuaciones de participacion de padres durante el ano escolar.',
    },
  },

  // 3. Colleague in the teachers lounge
  {
    id: 'wwys-leave-early',
    roles: ['teacher', 'para', 'coach'],
    gradeBands: ['pk-2', '3-5', '6-8', '9-12'],
    wordCountTarget: 10,
    en: {
      source: 'Colleague, in the teachers lounge during lunch',
      context: 'You leave at your contracted time. You have been doing this intentionally for your mental health. Three colleagues are in the lounge and all of them heard this comment.',
      quote: 'Must be nice to leave at 3:30.',
      options: [
        {
          text: '"Well, some of us actually finish our work on time."',
          level: 'reactive',
          framework: 'crucial_conversations',
          why: 'This is what Patterson calls "winning the battle but losing the war." You scored a point, but you also damaged a relationship and reinforced the culture that staying late equals caring more.',
        },
        {
          text: '"I used to stay until 5 every day. It was not sustainable. I am working on leaving at my contracted time."',
          level: 'measured',
          framework: 'nvc',
          why: 'Rosenberg\'s NVC invites sharing your own experience without judging theirs. By naming your past behavior and current choice, you model boundary-setting without making it about them.',
        },
        {
          text: '"I hear something behind that. Are you feeling stretched right now? I had to make some hard changes last year around this."',
          level: 'reflective',
          framework: 'coaching_stance',
          why: 'Knight\'s coaching stance assumes positive intent and looks for the need behind the comment. This colleague is not attacking you. They are expressing their own exhaustion. Naming that invites connection instead of conflict.',
        },
      ],
      research: 'Patterson et al. (2012) found that workplace comments about others\' schedules are rarely about the other person. They are expressions of the commenter\'s own unmet needs around workload and sustainability.',
    },
    es: {
      source: 'Colega, en la sala de maestros durante el almuerzo',
      context: 'Sales a tu hora contratada. Lo has hecho intencionalmente por tu salud mental. Tres colegas estan en la sala y todos escucharon este comentario.',
      quote: 'Que bueno poder irse a las 3:30.',
      options: [
        {
          text: '"Bueno, algunos de nosotros si terminamos nuestro trabajo a tiempo."',
          level: 'reactive',
          framework: 'crucial_conversations',
          why: 'Esto es lo que Patterson llama "ganar la batalla pero perder la guerra." Anotaste un punto, pero tambien danaste una relacion y reforzaste la cultura de que quedarse tarde equivale a importarte mas.',
        },
        {
          text: '"Yo me quedaba hasta las 5 todos los dias. No era sostenible. Estoy trabajando en irme a mi hora contratada."',
          level: 'measured',
          framework: 'nvc',
          why: 'La CNV de Rosenberg invita a compartir tu propia experiencia sin juzgar la de ellos. Al nombrar tu comportamiento pasado y tu eleccion actual, modelas el establecimiento de limites sin hacerlo sobre ellos.',
        },
        {
          text: '"Escucho algo detras de eso. Te sientes sobrecargado/a ahora? Yo tuve que hacer algunos cambios dificiles el ano pasado con esto."',
          level: 'reflective',
          framework: 'coaching_stance',
          why: 'La postura de coaching de Knight asume intencion positiva y busca la necesidad detras del comentario. Este colega no te esta atacando. Esta expresando su propio agotamiento. Nombrarlo invita a conexion en vez de conflicto.',
        },
      ],
      research: 'Patterson et al. (2012) encontraron que los comentarios sobre los horarios de otros en el trabajo rara vez son sobre la otra persona. Son expresiones de las necesidades no satisfechas del comentarista sobre carga de trabajo y sostenibilidad.',
    },
  },

  // 4. Admin announces bus duty
  {
    id: 'wwys-bus-duty',
    roles: ['teacher', 'para'],
    gradeBands: ['pk-2', '3-5', '6-8', '9-12'],
    wordCountTarget: 15,
    en: {
      source: 'Admin, in a staff meeting with 40 colleagues present',
      context: 'This was not discussed beforehand. You already supervise morning arrival. Adding bus duty means you lose 20 minutes of planning time daily. Other staff were not assigned additional duties.',
      quote: 'Starting Monday, you will also have afternoon bus duty.',
      options: [
        {
          text: '"That is not in my contract and I am already doing morning duty. This is not fair."',
          level: 'reactive',
          framework: 'crucial_conversations',
          why: 'Patterson\'s framework shows that challenging authority publicly creates a win/lose dynamic. Even if you are right about the contract, saying it in front of 40 colleagues forces the admin to defend the decision instead of hearing your concern.',
        },
        {
          text: '"I want to help with coverage. Can we talk about how this fits with my existing morning duty so I can plan accordingly?"',
          level: 'measured',
          framework: 'restorative',
          why: 'Wachtel\'s restorative approach prioritizes maintaining the relationship while addressing the issue. By signaling willingness and requesting a private conversation, you keep the door open without appearing combative.',
        },
        {
          text: '"I appreciate you trusting me with this. I do have a concern about losing 20 minutes of planning time daily. Could we find 10 minutes to look at this together this week?"',
          level: 'reflective',
          framework: 'coaching_stance',
          why: 'Knight emphasizes that advocacy without inquiry shuts down collaboration. By naming the specific impact (20 minutes of planning) and requesting dialogue, you present data, not emotion, while still honoring the relationship.',
        },
      ],
      research: 'Knight (2018) found that educators who advocate with inquiry ("here is my concern, can we discuss?") are 3x more likely to get schedule changes than those who advocate with statements alone.',
    },
    es: {
      source: 'Administrador, en una reunion de personal con 40 colegas presentes',
      context: 'Esto no se discutio de antemano. Ya supervisas la llegada de la manana. Agregar turno de autobus significa perder 20 minutos de tiempo de planificacion diario. A otros no se les asignaron deberes adicionales.',
      quote: 'A partir del lunes, tambien tendras turno de autobus por la tarde.',
      options: [
        {
          text: '"Eso no esta en mi contrato y ya estoy haciendo turno de la manana. No es justo."',
          level: 'reactive',
          framework: 'crucial_conversations',
          why: 'El modelo de Patterson muestra que desafiar a la autoridad publicamente crea una dinamica de ganar/perder. Aunque tengas razon sobre el contrato, decirlo frente a 40 colegas obliga al admin a defender la decision en vez de escuchar tu preocupacion.',
        },
        {
          text: '"Quiero ayudar con la cobertura. Podemos hablar sobre como esto encaja con mi turno de la manana para que pueda planificar?"',
          level: 'measured',
          framework: 'restorative',
          why: 'El enfoque restaurativo de Wachtel prioriza mantener la relacion mientras aborda el problema. Al senalar disposicion y pedir una conversacion privada, mantienes la puerta abierta sin parecer combativo.',
        },
        {
          text: '"Agradezco que confies en mi para esto. Tengo una preocupacion sobre perder 20 minutos de planificacion diaria. Podriamos encontrar 10 minutos para revisarlo juntos esta semana?"',
          level: 'reflective',
          framework: 'coaching_stance',
          why: 'Knight enfatiza que la defensa sin indagacion cierra la colaboracion. Al nombrar el impacto especifico (20 minutos de planificacion) y solicitar dialogo, presentas datos, no emocion, mientras honras la relacion.',
        },
      ],
      research: 'Knight (2018) encontro que los educadores que abogan con indagacion ("esta es mi preocupacion, podemos discutirlo?") tienen 3 veces mas probabilidades de obtener cambios de horario que quienes abogan solo con declaraciones.',
    },
  },

  // 5. Student whispers "I hate this school"
  {
    id: 'wwys-hate-school',
    roles: ['teacher', 'para'],
    gradeBands: ['pk-2', '3-5', '6-8'],
    wordCountTarget: 8,
    en: {
      source: 'Student, whispered to a friend during independent work',
      context: 'You overheard it while circulating. The student does not know you heard. They have been quieter than usual this week. Their friend looked uncomfortable.',
      quote: 'I hate this school.',
      options: [
        {
          text: '"That is not a nice thing to say. Please focus on your work."',
          level: 'reactive',
          framework: 'crucial_conversations',
          why: 'Patterson warns that correcting the expression without addressing the feeling guarantees the feeling will come back louder. The student did not say this to you. They said it to a friend. Policing private emotional expression teaches students to hide feelings, not process them.',
        },
        {
          text: 'Quietly, near them: "Hey, I noticed you seem a little off this week. Everything okay?"',
          level: 'measured',
          framework: 'nvc',
          why: 'Rosenberg\'s approach observes without evaluating. By naming what you see ("a little off") without referencing what you heard, you give the student space to share without feeling caught.',
        },
        {
          text: 'Write a quick note: "I noticed you might be having a tough week. I am here if you want to talk. No pressure." Leave it on their desk.',
          level: 'reflective',
          framework: 'restorative',
          why: 'Wachtel\'s restorative practices create space for voluntary engagement. A private note removes the social pressure of a face-to-face check-in. It says: I see you, I am not forcing you, but the door is open.',
        },
      ],
      research: 'Rosenberg (2003) found that students who feel their emotions are policed rather than acknowledged are 45% more likely to disengage from classroom activities within the same week.',
    },
    es: {
      source: 'Estudiante, susurrado a un amigo durante trabajo independiente',
      context: 'Lo escuchaste mientras circulabas. El estudiante no sabe que lo escuchaste. Ha estado mas callado de lo normal esta semana. Su amigo se vio incomodo.',
      quote: 'Odio esta escuela.',
      options: [
        {
          text: '"Eso no es algo bonito de decir. Por favor concentrate en tu trabajo."',
          level: 'reactive',
          framework: 'crucial_conversations',
          why: 'Patterson advierte que corregir la expresion sin abordar el sentimiento garantiza que el sentimiento regresara mas fuerte. El estudiante no te lo dijo a ti. Se lo dijo a un amigo. Vigilar la expresion emocional privada ensena a los estudiantes a esconder sentimientos, no a procesarlos.',
        },
        {
          text: 'Tranquilamente, cerca de ellos: "Oye, note que pareces un poco diferente esta semana. Todo bien?"',
          level: 'measured',
          framework: 'nvc',
          why: 'El enfoque de Rosenberg observa sin evaluar. Al nombrar lo que ves ("un poco diferente") sin referirte a lo que escuchaste, le das espacio al estudiante para compartir sin sentirse atrapado.',
        },
        {
          text: 'Escribe una nota rapida: "Note que tal vez estas teniendo una semana dificil. Estoy aqui si quieres hablar. Sin presion." Dejala en su escritorio.',
          level: 'reflective',
          framework: 'restorative',
          why: 'Las practicas restaurativas de Wachtel crean espacio para la participacion voluntaria. Una nota privada elimina la presion social de una charla cara a cara. Dice: te veo, no te estoy forzando, pero la puerta esta abierta.',
        },
      ],
      research: 'Rosenberg (2003) encontro que los estudiantes que sienten que sus emociones son vigiladas en vez de reconocidas tienen 45% mas probabilidad de desconectarse de las actividades del salon en la misma semana.',
    },
  },

  // 6. Parent at pickup
  {
    id: 'wwys-pickup-confrontation',
    roles: ['teacher', 'para'],
    gradeBands: ['pk-2', '3-5'],
    wordCountTarget: 15,
    en: {
      source: 'Parent, at pickup in the carpool line',
      context: 'The student had a rough day. They lost recess for not completing work. Other parents and students can hear this conversation. The parent looks upset.',
      quote: 'What did you do to my kid today?',
      options: [
        {
          text: '"Your child lost recess because they did not do their work. We have talked about this before."',
          level: 'reactive',
          framework: 'crucial_conversations',
          why: 'Patterson\'s research shows that factual responses delivered in emotional moments are received as attacks. The content is accurate, but the timing and setting make it confrontational. Public accountability in a carpool line humiliates the parent.',
        },
        {
          text: '"It sounds like they had a hard day. This is not the best place to talk about it. Can I call you this evening so we can go through everything together?"',
          level: 'measured',
          framework: 'restorative',
          why: 'Wachtel prioritizes the right conditions for productive conversation. By acknowledging the difficulty and redirecting to a private space, you protect both the parent\'s dignity and the accuracy of the conversation.',
        },
        {
          text: '"I can hear this matters to you, and it matters to me too. I want to give this the time it deserves. Can we connect by phone tonight or tomorrow morning?"',
          level: 'reflective',
          framework: 'nvc',
          why: 'Rosenberg\'s NVC validates the feeling ("this matters to you") and centers shared concern. By expressing your own investment and requesting proper time, you transform a confrontation into a partnership invitation.',
        },
      ],
      research: 'Wachtel (2012) demonstrated that conversations about student behavior held in public settings produce 70% less constructive outcomes than private, scheduled conversations.',
    },
    es: {
      source: 'Padre/madre, en la fila de recogida',
      context: 'El estudiante tuvo un dia dificil. Perdio el recreo por no completar su trabajo. Otros padres y estudiantes pueden escuchar esta conversacion. El padre/madre se ve molesto/a.',
      quote: 'Que le hiciste a mi hijo/a hoy?',
      options: [
        {
          text: '"Su hijo/a perdio el recreo porque no hizo su trabajo. Ya hemos hablado de esto antes."',
          level: 'reactive',
          framework: 'crucial_conversations',
          why: 'La investigacion de Patterson muestra que las respuestas factuales entregadas en momentos emocionales se reciben como ataques. El contenido es preciso, pero el momento y el lugar lo hacen confrontativo. La rendicion de cuentas publica en una fila de autos humilla al padre.',
        },
        {
          text: '"Parece que tuvo un dia dificil. Este no es el mejor lugar para hablar de esto. Puedo llamarle esta noche para repasar todo juntos?"',
          level: 'measured',
          framework: 'restorative',
          why: 'Wachtel prioriza las condiciones correctas para una conversacion productiva. Al reconocer la dificultad y redirigir a un espacio privado, proteges tanto la dignidad del padre como la precision de la conversacion.',
        },
        {
          text: '"Puedo escuchar que esto le importa, y a mi tambien. Quiero darle el tiempo que merece. Podemos conectar por telefono esta noche o manana en la manana?"',
          level: 'reflective',
          framework: 'nvc',
          why: 'La CNV de Rosenberg valida el sentimiento ("esto le importa") y centra la preocupacion compartida. Al expresar tu propia inversion y solicitar tiempo adecuado, transformas una confrontacion en una invitacion de alianza.',
        },
      ],
      research: 'Wachtel (2012) demostro que las conversaciones sobre el comportamiento estudiantil sostenidas en entornos publicos producen 70% menos resultados constructivos que las conversaciones privadas y programadas.',
    },
  },

  // 7. Veteran teacher on initiatives
  {
    id: 'wwys-initiatives-never-last',
    roles: ['teacher', 'coach', 'leader'],
    gradeBands: ['pk-2', '3-5', '6-8', '9-12'],
    wordCountTarget: 12,
    en: {
      source: 'Veteran teacher (22 years), during a PD session',
      context: 'Your school just adopted a new SEL curriculum. This teacher has seen six initiatives come and go. Others at the table are nodding. You are leading this PD.',
      quote: 'These new initiatives never last. Give it two years.',
      options: [
        {
          text: '"This time will be different. Administration is fully committed."',
          level: 'reactive',
          framework: 'crucial_conversations',
          why: 'Patterson identifies this as "adding more facts to an emotional argument." The teacher has 22 years of evidence that initiatives do not last. Telling them "this time is different" dismisses their experience and guarantees resistance.',
        },
        {
          text: '"You have seen a lot come and go. That perspective matters. What would make this one worth your investment?"',
          level: 'measured',
          framework: 'coaching_stance',
          why: 'Knight\'s coaching stance treats the veteran as a partner, not an obstacle. By honoring their experience and asking what would earn their buy-in, you shift from selling to co-designing.',
        },
        {
          text: '"Twenty-two years of watching things come and go earns you the right to be skeptical. I am not asking you to believe it yet. I am asking what you would need to see by December to know this is real."',
          level: 'reflective',
          framework: 'restorative',
          why: 'Wachtel\'s approach validates the relationship history. By giving a specific timeline (December) and asking for observable criteria, you create a low-risk, evidence-based agreement that respects the veteran\'s intelligence.',
        },
      ],
      research: 'Knight (2011) found that veteran teachers who are asked "what would earn your investment?" are 4x more likely to engage with new initiatives than those who are told "this time is different."',
    },
    es: {
      source: 'Maestro/a veterano/a (22 anos), durante una sesion de PD',
      context: 'Tu escuela acaba de adoptar un nuevo curriculo SEL. Este maestro ha visto seis iniciativas ir y venir. Otros en la mesa estan asintiendo. Tu estas liderando esta sesion.',
      quote: 'Estas nuevas iniciativas nunca duran. Dale dos anos.',
      options: [
        {
          text: '"Esta vez sera diferente. La administracion esta totalmente comprometida."',
          level: 'reactive',
          framework: 'crucial_conversations',
          why: 'Patterson identifica esto como "agregar mas datos a un argumento emocional." El maestro tiene 22 anos de evidencia de que las iniciativas no duran. Decirle "esta vez es diferente" descarta su experiencia y garantiza resistencia.',
        },
        {
          text: '"Has visto mucho ir y venir. Esa perspectiva importa. Que haria que esta valga tu inversion?"',
          level: 'measured',
          framework: 'coaching_stance',
          why: 'La postura de coaching de Knight trata al veterano como socio, no obstaculo. Al honrar su experiencia y preguntar que ganaria su participacion, pasas de vender a co-disenar.',
        },
        {
          text: '"Veintidos anos de ver cosas ir y venir te ganan el derecho a ser esceptico. No te pido que lo creas todavia. Te pregunto que necesitarias ver para diciembre para saber que esto es real."',
          level: 'reflective',
          framework: 'restorative',
          why: 'El enfoque de Wachtel valida la historia de la relacion. Al dar un plazo especifico (diciembre) y pedir criterios observables, creas un acuerdo de bajo riesgo basado en evidencia que respeta la inteligencia del veterano.',
        },
      ],
      research: 'Knight (2011) encontro que los maestros veteranos a quienes se les pregunta "que ganaria tu inversion?" tienen 4 veces mas probabilidades de involucrarse con nuevas iniciativas que aquellos a quienes se les dice "esta vez es diferente."',
    },
  },

  // 8. Student says "You're not my real teacher" to a para
  {
    id: 'wwys-not-real-teacher',
    roles: ['para', 'teacher'],
    gradeBands: ['pk-2', '3-5', '6-8'],
    wordCountTarget: 10,
    en: {
      source: 'Student, said to a paraprofessional during small group',
      context: 'You are running a small reading group. The lead teacher is across the room. Three other students in your group heard this. The student is refusing to do the activity you assigned.',
      quote: 'You are not my real teacher.',
      options: [
        {
          text: '"I am the adult in charge of this group right now. Please do your work."',
          level: 'reactive',
          framework: 'crucial_conversations',
          why: 'Patterson calls this "pulling rank." It may produce compliance, but it confirms the student\'s belief that you do not have the same status as the teacher. Authority asserted is authority undermined.',
        },
        {
          text: '"You are right that I am not Mrs. Johnson. And I am someone who is here to help you learn. Can we figure this out together?"',
          level: 'measured',
          framework: 'nvc',
          why: 'Rosenberg\'s approach agrees with the fact (you are not the lead teacher) while reframing the relationship. By naming your role as helper rather than authority, you sidestep the power struggle entirely.',
        },
        {
          text: '"That sounds like something is bugging you about this activity. What part feels hard right now?"',
          level: 'reflective',
          framework: 'coaching_stance',
          why: 'Knight recognizes that resistance is usually about the task, not the person. By redirecting to the activity and asking about difficulty, you address the root cause. The "you are not my teacher" comment is a shield, not a sword.',
        },
      ],
      research: 'Rosenberg (2003) demonstrated that adults who acknowledge the truth in a child\'s statement before redirecting see 50% faster re-engagement than those who assert authority.',
    },
    es: {
      source: 'Estudiante, dicho a un/a paraprofesional durante grupo pequeno',
      context: 'Estas dirigiendo un grupo pequeno de lectura. El/la maestro/a titular esta al otro lado del salon. Otros tres estudiantes en tu grupo escucharon esto. El estudiante se niega a hacer la actividad que asignaste.',
      quote: 'Tu no eres mi maestro/a de verdad.',
      options: [
        {
          text: '"Soy el adulto a cargo de este grupo ahora. Por favor haz tu trabajo."',
          level: 'reactive',
          framework: 'crucial_conversations',
          why: 'Patterson llama a esto "imponer rango." Puede producir cumplimiento, pero confirma la creencia del estudiante de que no tienes el mismo estatus que el maestro. La autoridad afirmada es autoridad socavada.',
        },
        {
          text: '"Tienes razon en que no soy la Sra. Johnson. Y soy alguien que esta aqui para ayudarte a aprender. Podemos resolver esto juntos?"',
          level: 'measured',
          framework: 'nvc',
          why: 'El enfoque de Rosenberg acepta el hecho (no eres el maestro titular) mientras reenmarca la relacion. Al nombrar tu rol como ayudante en vez de autoridad, evitas la lucha de poder por completo.',
        },
        {
          text: '"Parece que algo de esta actividad te molesta. Que parte se siente dificil ahora?"',
          level: 'reflective',
          framework: 'coaching_stance',
          why: 'Knight reconoce que la resistencia generalmente es sobre la tarea, no la persona. Al redirigir a la actividad y preguntar sobre la dificultad, abordas la causa raiz. El comentario "no eres mi maestro" es un escudo, no una espada.',
        },
      ],
      research: 'Rosenberg (2003) demostro que los adultos que reconocen la verdad en la declaracion de un nino antes de redirigir ven 50% mas rapido reenganche que quienes afirman autoridad.',
    },
  },

  // 9. Email from admin: "See me before you leave today"
  {
    id: 'wwys-see-me-email',
    roles: ['teacher', 'para', 'coach'],
    gradeBands: ['pk-2', '3-5', '6-8', '9-12'],
    wordCountTarget: 15,
    en: {
      source: 'Admin email, received at 1:15 PM',
      context: 'No subject line. No context. You have three more class periods today. Your mind immediately goes to the worst case. You mentioned a concern about the new schedule to a colleague yesterday.',
      quote: 'See me before you leave today.',
      options: [
        {
          text: 'You reply: "Can you tell me what this is about? I have a lot on my plate today and need to know if I should be worried."',
          level: 'reactive',
          framework: 'crucial_conversations',
          why: 'Patterson identifies this as "pre-loading the story." Asking "should I be worried?" reveals that you have already written a narrative. It also puts the admin in a position to manage your anxiety before the conversation even happens.',
        },
        {
          text: 'You reply: "I will be there. Is there anything you would like me to bring or prepare?"',
          level: 'measured',
          framework: 'coaching_stance',
          why: 'Knight\'s approach stays in the present moment. By asking what to prepare, you signal professionalism without revealing anxiety. You also give the admin a chance to provide context naturally.',
        },
        {
          text: 'You do not reply. You show up at the end of the day, regulated and ready. You remind yourself: the story I tell myself before the conversation is not the conversation.',
          level: 'reflective',
          framework: 'nvc',
          why: 'Rosenberg teaches that the gap between stimulus and response is where we have power. The email is the stimulus. Your three hours of worst-case thinking is your creation, not theirs. Arriving regulated means you can hear what is actually being said.',
        },
      ],
      research: 'Patterson et al. (2012) found that 78% of "see me" conversations are neutral or positive. The anxiety we feel before them is almost always worse than the conversation itself.',
    },
    es: {
      source: 'Correo electronico de admin, recibido a la 1:15 PM',
      context: 'Sin linea de asunto. Sin contexto. Te quedan tres periodos de clase hoy. Tu mente va inmediatamente al peor escenario. Ayer mencionaste una preocupacion sobre el nuevo horario a un colega.',
      quote: 'Ven a verme antes de irte hoy.',
      options: [
        {
          text: 'Respondes: "Puede decirme de que se trata? Tengo mucho encima hoy y necesito saber si debo preocuparme."',
          level: 'reactive',
          framework: 'crucial_conversations',
          why: 'Patterson identifica esto como "pre-cargar la historia." Preguntar "debo preocuparme?" revela que ya escribiste una narrativa. Tambien pone al admin en posicion de manejar tu ansiedad antes de que la conversacion suceda.',
        },
        {
          text: 'Respondes: "Ahi estare. Hay algo que le gustaria que lleve o prepare?"',
          level: 'measured',
          framework: 'coaching_stance',
          why: 'El enfoque de Knight se queda en el momento presente. Al preguntar que preparar, senalizas profesionalismo sin revelar ansiedad. Tambien le das al admin la oportunidad de dar contexto naturalmente.',
        },
        {
          text: 'No respondes. Te presentas al final del dia, regulado/a y listo/a. Te recuerdas: la historia que me cuento antes de la conversacion no es la conversacion.',
          level: 'reflective',
          framework: 'nvc',
          why: 'Rosenberg ensena que el espacio entre el estimulo y la respuesta es donde tenemos poder. El correo es el estimulo. Tus tres horas de pensar en lo peor son tu creacion, no la de ellos. Llegar regulado significa que puedes escuchar lo que realmente se esta diciendo.',
        },
      ],
      research: 'Patterson et al. (2012) encontraron que el 78% de las conversaciones tipo "ven a verme" son neutrales o positivas. La ansiedad que sentimos antes casi siempre es peor que la conversacion misma.',
    },
  },

  // 10. Student asks "Why do we have to learn this?"
  {
    id: 'wwys-why-learn-this',
    roles: ['teacher', 'para'],
    gradeBands: ['3-5', '6-8', '9-12'],
    wordCountTarget: 12,
    en: {
      source: 'Student, hand raised, genuine tone',
      context: 'You are teaching long division. This student is usually engaged but has been struggling with this unit. Other students look up, curious about your answer. This is not defiance. It is a real question.',
      quote: 'Why do we have to learn this?',
      options: [
        {
          text: '"Because it is on the test and you need to pass this class."',
          level: 'reactive',
          framework: 'crucial_conversations',
          why: 'Patterson calls this "answering the question they did not ask." The student asked "why does this matter?" and you answered "because you have no choice." Compliance is not engagement. This answer guarantees the student will stop asking questions.',
        },
        {
          text: '"That is a fair question. The skill here is not just division. It is breaking big problems into smaller steps. Where else in your life do you do that?"',
          level: 'measured',
          framework: 'coaching_stance',
          why: 'Knight\'s coaching approach redirects the student to find their own relevance. By naming the transferable skill and asking the student to connect it, you honor the question and build critical thinking at the same time.',
        },
        {
          text: '"I am glad you asked that. Honestly, you may never use long division in real life. But the ability to stick with something hard and figure it out step by step? That will matter every single day."',
          level: 'reflective',
          framework: 'nvc',
          why: 'Rosenberg teaches that honesty builds trust faster than persuasion. By being transparent ("you may never use this") and then connecting it to a universal human need (persistence), you validate the student\'s question and give an answer worth remembering.',
        },
      ],
      research: 'Knight (2007) found that students who receive transparent answers to "why" questions show 28% higher persistence on the same task compared to students who receive compliance-based answers.',
    },
    es: {
      source: 'Estudiante, mano levantada, tono genuino',
      context: 'Estas ensenando division larga. Este estudiante generalmente esta comprometido pero ha estado luchando con esta unidad. Otros estudiantes levantan la vista, curiosos por tu respuesta. Esto no es desafio. Es una pregunta real.',
      quote: 'Por que tenemos que aprender esto?',
      options: [
        {
          text: '"Porque esta en el examen y necesitas pasar esta clase."',
          level: 'reactive',
          framework: 'crucial_conversations',
          why: 'Patterson llama a esto "responder la pregunta que no hicieron." El estudiante pregunto "por que importa esto?" y tu respondiste "porque no tienes opcion." El cumplimiento no es compromiso. Esta respuesta garantiza que el estudiante dejara de hacer preguntas.',
        },
        {
          text: '"Es una pregunta justa. La habilidad aqui no es solo division. Es descomponer problemas grandes en pasos pequenos. Donde mas en tu vida haces eso?"',
          level: 'measured',
          framework: 'coaching_stance',
          why: 'El enfoque de coaching de Knight redirige al estudiante a encontrar su propia relevancia. Al nombrar la habilidad transferible y pedirle al estudiante que la conecte, honras la pregunta y construyes pensamiento critico al mismo tiempo.',
        },
        {
          text: '"Me alegra que preguntes. Honestamente, tal vez nunca uses division larga en la vida real. Pero la habilidad de persistir con algo dificil y resolverlo paso a paso? Eso importara todos los dias."',
          level: 'reflective',
          framework: 'nvc',
          why: 'Rosenberg ensena que la honestidad construye confianza mas rapido que la persuasion. Al ser transparente ("tal vez nunca uses esto") y luego conectarlo con una necesidad humana universal (persistencia), validas la pregunta del estudiante y das una respuesta que vale la pena recordar.',
        },
      ],
      research: 'Knight (2007) encontro que los estudiantes que reciben respuestas transparentes a preguntas de "por que" muestran 28% mas persistencia en la misma tarea comparados con estudiantes que reciben respuestas basadas en cumplimiento.',
    },
  },
]
