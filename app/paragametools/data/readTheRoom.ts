// Read the Room: Observation skills for educators
// Walk into a situation mid-stream. Read the cues. Choose your response.

export type Role = 'teacher' | 'para' | 'coach' | 'leader'
export type GradeBand = 'pk-2' | '3-5' | '6-8' | '9-12'

export type CueCategory = 'escalation' | 'disengagement' | 'positive_energy' | 'group_dynamics' | 'emotional_state' | 'environmental'

export interface Observation {
  text: string
  isKey: boolean
  explanation: string
}

export interface ResponseOption {
  text: string
  quality: 'strong' | 'okay' | 'miss'
  why: string
}

export interface Scenario {
  id: string
  roles: Role[]
  gradeBands: GradeBand[]
  cueCategory: CueCategory
  en: {
    setting: string
    scene: string
    observations: Observation[]
    responses: ResponseOption[]
    research: string
    expertEye: string
    missedCueStat: string
  }
  es: {
    setting: string
    scene: string
    observations: Observation[]
    responses: ResponseOption[]
    research: string
    expertEye: string
    missedCueStat: string
  }
}

export const SCENARIO_COUNT = 8
export const OBSERVATION_TIME = 10 // seconds to read the scene

export const CUE_LABELS: Record<CueCategory, { en: string; es: string; color: string }> = {
  escalation: { en: 'Escalation Signals', es: 'Senales de Escalada', color: '#E74C3C' },
  disengagement: { en: 'Disengagement Cues', es: 'Senales de Desconexion', color: '#F59E0B' },
  positive_energy: { en: 'Positive Energy', es: 'Energia Positiva', color: '#27AE60' },
  group_dynamics: { en: 'Group Dynamics', es: 'Dinamicas de Grupo', color: '#3498DB' },
  emotional_state: { en: 'Emotional State', es: 'Estado Emocional', color: '#9333EA' },
  environmental: { en: 'Environmental Cues', es: 'Senales Ambientales', color: '#22b8bd' },
}

export const SCENARIOS: Scenario[] = [
  // ─── SCENARIO 1: Hallway before first bell ──────────────────────────────
  {
    id: 'rtr-hallway-morning',
    roles: ['teacher', 'para', 'coach', 'leader'],
    gradeBands: ['6-8', '9-12'],
    cueCategory: 'escalation',
    en: {
      setting: 'You are walking through the hallway 5 minutes before first bell.',
      scene: 'Two students are standing face to face near the lockers. One has their backpack still on. The other dropped theirs on the floor. A third student is recording on their phone from about ten feet away. Two other students have stopped walking and are watching. The hallway monitor is at the far end, facing the other direction. The student without the backpack has their jaw clenched and is speaking quietly. The one with the backpack is leaning slightly backward.',
      observations: [
        { text: 'A student is recording on their phone from a distance', isKey: true, explanation: 'A phone out and recording from a distance is one of the strongest escalation indicators. It means the observer expects something worth recording. This is the cue most adults miss.' },
        { text: 'Two students are standing face to face', isKey: false, explanation: 'Two students face to face is common and not necessarily a concern. Context matters more than proximity.' },
        { text: 'One student dropped their backpack on the floor', isKey: true, explanation: 'Dropping a backpack is a physical preparation signal. It frees the hands and reduces weight. Experienced educators recognize this as a readiness cue, not carelessness.' },
        { text: 'The hallway monitor is facing the other direction', isKey: false, explanation: 'Relevant but not a student behavior cue. This is an environmental factor, not an observation about the situation itself.' },
      ],
      responses: [
        { text: 'Walk toward the two students calmly and say their names. Position yourself between them at an angle, not directly between. Ask one of them to walk with you.', quality: 'strong', why: 'Name usage disrupts the tunnel vision of conflict. Approaching at an angle is non-threatening. Asking one to walk with you separates without commanding. You did not mention the conflict or ask "what is going on" because that escalates.' },
        { text: 'Call out from where you are: "Hey, break it up. Get to class."', quality: 'miss', why: 'Distance commands in front of an audience create a stage. The students now have to choose between obeying you publicly or saving face. Most adolescents choose face. You also just told the phone-recording student that this is a show worth watching.' },
        { text: 'Walk over to the student with the phone first and tell them to put it away, then address the two students.', quality: 'okay', why: 'Removing the audience is smart instinct. But approaching the phone student first delays your proximity to the actual conflict. In the seconds it takes to redirect the phone, the situation between the two students can escalate. Address the primary situation first.' },
      ],
      research: 'Kounin\'s research on "withitness" (1970) found that effective classroom managers demonstrate awareness of multiple simultaneous events. The key finding: teachers who noticed peripheral cues (the phone, the backpack) before addressing the central event prevented 85% more escalations than those who focused only on the obvious conflict.',
      expertEye: 'Experienced educators scan for the audience before the actors. The phone is the most dangerous element here because it transforms a private moment into a public performance. The backpack on the floor tells you the timeline: this has moved past words.',
      missedCueStat: '73% of educators focus on the two students first and miss the phone entirely',
    },
    es: {
      setting: 'Caminas por el pasillo 5 minutos antes del primer timbre.',
      scene: 'Dos estudiantes estan parados cara a cara cerca de los casilleros. Uno tiene su mochila puesta. El otro la dejo en el piso. Un tercer estudiante esta grabando con su telefono desde unos tres metros. Otros dos estudiantes dejaron de caminar y estan mirando. El monitor del pasillo esta al otro extremo, mirando en la otra direccion. El estudiante sin mochila tiene la mandibula apretada y esta hablando en voz baja. El de la mochila se inclina ligeramente hacia atras.',
      observations: [
        { text: 'Un estudiante esta grabando con su telefono desde lejos', isKey: true, explanation: 'Un telefono grabando desde lejos es uno de los indicadores mas fuertes de escalada. Significa que el observador espera algo que vale la pena grabar.' },
        { text: 'Dos estudiantes estan parados cara a cara', isKey: false, explanation: 'Dos estudiantes cara a cara es comun y no necesariamente preocupante. El contexto importa mas que la proximidad.' },
        { text: 'Un estudiante dejo su mochila en el piso', isKey: true, explanation: 'Dejar la mochila es una senal de preparacion fisica. Libera las manos y reduce peso. Los educadores experimentados reconocen esto como una senal de preparacion.' },
        { text: 'El monitor del pasillo esta mirando en la otra direccion', isKey: false, explanation: 'Relevante pero no es una senal de comportamiento estudiantil. Es un factor ambiental.' },
      ],
      responses: [
        { text: 'Camina hacia los dos estudiantes con calma y di sus nombres. Posicionate entre ellos en angulo, no directamente. Pide a uno que camine contigo.', quality: 'strong', why: 'Usar nombres interrumpe la vision de tunel del conflicto. Acercarse en angulo no es amenazante. Pedir a uno que camine contigo separa sin ordenar.' },
        { text: 'Grita desde donde estas: "Oigan, separense. Vayan a clase."', quality: 'miss', why: 'Ordenes a distancia frente a una audiencia crean un escenario. Los estudiantes tienen que elegir entre obedecerte publicamente o salvar las apariencias.' },
        { text: 'Ve primero al estudiante con el telefono y dile que lo guarde, luego atiende a los dos estudiantes.', quality: 'okay', why: 'Quitar la audiencia es buen instinto. Pero acercarse al del telefono primero retrasa tu proximidad al conflicto real.' },
      ],
      research: 'La investigacion de Kounin sobre "withitness" (1970) encontro que los maestros que notaban senales perifericas (el telefono, la mochila) antes de abordar el evento central prevenian 85% mas escaladas.',
      expertEye: 'Los educadores experimentados buscan la audiencia antes que los actores. El telefono es el elemento mas peligroso aqui porque transforma un momento privado en una actuacion publica.',
      missedCueStat: '73% de los educadores se enfocan en los dos estudiantes primero y no ven el telefono',
    },
  },

  // ─── SCENARIO 2: Walking into a classroom mid-lesson ────────────────────
  {
    id: 'rtr-classroom-midlesson',
    roles: ['coach', 'leader', 'para'],
    gradeBands: ['3-5', '6-8'],
    cueCategory: 'disengagement',
    en: {
      setting: 'You walk into a classroom during a group activity. The teacher does not see you yet.',
      scene: 'Four table groups are working. Table 1 is animated, leaning in, papers spread out. Table 2 has one student doing all the writing while three others watch. Table 3 has two students working and two on their Chromebooks with screens angled away from the teacher. Table 4 has a student with their head down on the desk, hoodie pulled up. The teacher is kneeling at Table 1, deeply engaged in their conversation. The whiteboard timer shows 4 minutes remaining.',
      observations: [
        { text: 'Table 2 has one student doing all the work while others watch', isKey: true, explanation: 'This is the most common form of hidden disengagement. It looks like a functioning group but only one student is learning. The others are socially present but cognitively absent.' },
        { text: 'Table 3 students have Chromebook screens angled away from the teacher', isKey: true, explanation: 'Screen angle is an intentional choice. Students who are on task do not hide their screens. The angle tells you they know they are off task and are managing the teacher\'s sightline.' },
        { text: 'The teacher is kneeling at Table 1', isKey: false, explanation: 'Kneeling at student level is good practice. The issue is not what the teacher is doing. It is what the teacher is not seeing because they are absorbed in one group.' },
        { text: 'A student at Table 4 has their head down with a hoodie up', isKey: false, explanation: 'Head down is visible and will likely be addressed. The hidden disengagement at Tables 2 and 3 is the bigger concern because it looks like compliance from across the room.' },
      ],
      responses: [
        { text: 'Quietly sit at Table 2 and ask the group: "Tell me about your thinking so far. What has each person contributed?" Then move to Table 3.', quality: 'strong', why: 'Sitting at the group makes you a participant, not an authority. Asking what each person contributed surfaces the imbalance without calling anyone out. Starting with Table 2 addresses the most hidden problem first.' },
        { text: 'Go to the teacher and quietly point out that Tables 2, 3, and 4 need attention.', quality: 'okay', why: 'Helpful intent but undermines the teacher in front of students. Even a quiet redirect from a coach or admin during instruction changes the power dynamic. The teacher may feel surveilled rather than supported.' },
        { text: 'Walk the room making eye contact and proximity passes at each table to get everyone back on track.', quality: 'miss', why: 'Proximity passes are a band-aid. Students will sit up, angle screens forward, and look busy until you move to the next table. You addressed the symptom (off-task behavior) without diagnosing the cause (unclear roles, low cognitive demand, no individual accountability).' },
      ],
      research: 'Marzano\'s research on "withitness" found that the highest-impact classroom managers maintain awareness of all groups simultaneously. But the deeper finding: visible off-task behavior (head down) gets addressed 90% of the time. Hidden disengagement (passive group members, concealed screens) gets addressed only 23% of the time.',
      expertEye: 'The head-down student is the distraction. Everyone sees them. The real story is at Tables 2 and 3 where disengagement is disguised as participation. One student carrying a group and hidden screens are the cues that separate experienced observers from new ones.',
      missedCueStat: '81% of observers notice the head-down student first. Only 34% identify the single-writer group as the bigger problem.',
    },
    es: {
      setting: 'Entras a un salon durante una actividad grupal. El maestro aun no te ve.',
      scene: 'Cuatro grupos de mesa estan trabajando. La Mesa 1 esta animada, inclinados, papeles desplegados. La Mesa 2 tiene un estudiante haciendo toda la escritura mientras tres observan. La Mesa 3 tiene dos estudiantes trabajando y dos en sus Chromebooks con las pantallas inclinadas lejos del maestro. La Mesa 4 tiene un estudiante con la cabeza en el escritorio, capucha puesta. El maestro esta arrodillado en la Mesa 1, profundamente involucrado en su conversacion. El temporizador del pizarron muestra 4 minutos restantes.',
      observations: [
        { text: 'La Mesa 2 tiene un estudiante haciendo todo el trabajo mientras otros miran', isKey: true, explanation: 'Esta es la forma mas comun de desconexion oculta. Parece un grupo funcionando pero solo un estudiante esta aprendiendo.' },
        { text: 'Los estudiantes de la Mesa 3 tienen las pantallas inclinadas lejos del maestro', isKey: true, explanation: 'El angulo de la pantalla es una eleccion intencional. Los estudiantes que estan en la tarea no esconden sus pantallas.' },
        { text: 'El maestro esta arrodillado en la Mesa 1', isKey: false, explanation: 'Arrodillarse al nivel del estudiante es buena practica. El problema no es lo que hace el maestro sino lo que no ve.' },
        { text: 'Un estudiante en la Mesa 4 tiene la cabeza en el escritorio con la capucha puesta', isKey: false, explanation: 'La cabeza baja es visible y probablemente sera atendida. La desconexion oculta en las Mesas 2 y 3 es la mayor preocupacion.' },
      ],
      responses: [
        { text: 'Sientate en la Mesa 2 y pregunta al grupo: "Cuentenme sobre lo que han pensado. Que ha contribuido cada persona?" Luego ve a la Mesa 3.', quality: 'strong', why: 'Sentarte en el grupo te hace participante, no autoridad. Preguntar que contribuyo cada persona saca a la luz el desequilibrio sin senalar a nadie.' },
        { text: 'Ve al maestro y senala discretamente que las Mesas 2, 3 y 4 necesitan atencion.', quality: 'okay', why: 'Buena intencion pero socava al maestro frente a los estudiantes. Incluso una redireccion silenciosa de un coach cambia la dinamica de poder.' },
        { text: 'Camina por el salon haciendo contacto visual y pasadas de proximidad en cada mesa para que todos vuelvan a la tarea.', quality: 'miss', why: 'Las pasadas de proximidad son una curacion temporal. Los estudiantes se sentaran, enderezaran pantallas y se veran ocupados hasta que te muevas.' },
      ],
      research: 'La investigacion de Marzano sobre "withitness" encontro que el comportamiento visible fuera de tarea se atiende el 90% de las veces. La desconexion oculta se atiende solo el 23% de las veces.',
      expertEye: 'El estudiante con la cabeza baja es la distraccion. Todos lo ven. La historia real esta en las Mesas 2 y 3 donde la desconexion se disfraza de participacion.',
      missedCueStat: '81% de los observadores notan al estudiante con la cabeza baja primero. Solo 34% identifican al grupo con un solo escritor como el problema mayor.',
    },
  },

  // ─── SCENARIO 3: Staff meeting energy ───────────────────────────────────
  {
    id: 'rtr-staff-meeting',
    roles: ['leader', 'coach'],
    gradeBands: ['pk-2', '3-5', '6-8', '9-12'],
    cueCategory: 'group_dynamics',
    en: {
      setting: 'You are facilitating a staff meeting. You just asked teams to discuss a proposed schedule change.',
      scene: 'The math team immediately starts talking, voices overlapping. The ELA team has one person talking while everyone else nods. The special education team has two people whispering to each other while a third stares at the ceiling. The PE teacher is grading papers. A first-year teacher at the corner table is typing notes rapidly but has not said a word. The veteran teacher across from them is leaning back with arms crossed, watching you instead of their group.',
      observations: [
        { text: 'The ELA team has one person talking while everyone else nods', isKey: true, explanation: 'Unanimous nodding without pushback in a discussion about change is a red flag. It usually means the team has a dominant voice and others have learned not to disagree. You are seeing compliance, not consensus.' },
        { text: 'A veteran teacher is leaning back with arms crossed, watching you', isKey: true, explanation: 'This teacher is not checked out. They are evaluating you. Arms crossed and eye contact with the facilitator instead of the group means they have an opinion they are choosing not to share in this format. They will share it in the parking lot later.' },
        { text: 'The math team is talking with voices overlapping', isKey: false, explanation: 'Overlapping voices are often read as chaos but can indicate high engagement. The math team may be the healthiest group in the room. Energy is not the same as dysfunction.' },
        { text: 'The PE teacher is grading papers', isKey: false, explanation: 'Visible disengagement. Easy to spot, easy to address. But not the most important cue in the room.' },
      ],
      responses: [
        { text: 'Pause the discussion. Say: "Before we go further, I want to hear from people who have not spoken yet. Take 60 seconds to write your honest reaction on a sticky note. Anonymous. I will read them."', quality: 'strong', why: 'Anonymous written input bypasses the group dynamics that silence dissent. The quiet first-year teacher and the crossed-arms veteran both get a voice without the social risk of speaking first. You also just told the room that silence is not agreement.' },
        { text: 'Walk over to the quiet tables and ask: "What is your team thinking?"', quality: 'okay', why: 'Good instinct to check on quiet groups but "what is your team thinking" invites the dominant voice to summarize. Ask individuals, not groups, if you want honest responses. Better: "What is one concern you have not voiced yet?"' },
        { text: 'Let the discussion continue for the allotted time, then ask for a show of hands on the proposal.', quality: 'miss', why: 'A show of hands after a dominated discussion just ratifies the loudest voices. The ELA team will vote yes because their leader said yes. The veteran will vote no publicly because they feel unheard. The first-year teacher will vote with the majority because they do not feel safe disagreeing. You will get a number but not the truth.' },
      ],
      research: 'Edmondson\'s research on psychological safety found that in meetings where one voice dominates, team members self-censor 68% of their concerns. Anonymous input mechanisms (sticky notes, digital polls) recover 40-60% of those suppressed perspectives. The truth is in the room. The format just is not letting it out.',
      expertEye: 'The noisiest group is not the problem. The quietest group is not the problem. The problem is the groups where someone is talking but nobody is actually saying anything. The ELA team\'s nodding is the most concerning signal in this room.',
      missedCueStat: '62% of facilitators address the PE teacher grading papers. Only 28% notice the one-voice dynamic at the ELA table.',
    },
    es: {
      setting: 'Estas facilitando una reunion de personal. Acabas de pedir a los equipos que discutan un cambio de horario propuesto.',
      scene: 'El equipo de matematicas empieza a hablar inmediatamente, voces superpuestas. El equipo de lengua tiene una persona hablando mientras todos los demas asienten. El equipo de educacion especial tiene dos personas susurrando mientras un tercero mira al techo. El maestro de educacion fisica esta calificando trabajos. Un maestro de primer ano en la mesa de la esquina esta escribiendo notas rapidamente pero no ha dicho una palabra. El maestro veterano frente a ellos esta reclinado con los brazos cruzados, mirandote a ti en lugar de a su grupo.',
      observations: [
        { text: 'El equipo de lengua tiene una persona hablando mientras todos asienten', isKey: true, explanation: 'Asentimiento unanime sin objecion en una discusion sobre cambios es una bandera roja. Usualmente significa que el equipo tiene una voz dominante.' },
        { text: 'Un maestro veterano esta reclinado con brazos cruzados, mirandote', isKey: true, explanation: 'Este maestro no esta desconectado. Te esta evaluando. Brazos cruzados y contacto visual contigo en lugar del grupo significa que tienen una opinion que eligen no compartir en este formato.' },
        { text: 'El equipo de matematicas habla con voces superpuestas', isKey: false, explanation: 'Las voces superpuestas pueden indicar alto compromiso. El equipo de matematicas puede ser el grupo mas saludable del salon.' },
        { text: 'El maestro de educacion fisica esta calificando trabajos', isKey: false, explanation: 'Desconexion visible. Facil de detectar, facil de abordar. Pero no la senal mas importante del salon.' },
      ],
      responses: [
        { text: 'Pausa la discusion. Di: "Antes de continuar, quiero escuchar de personas que no han hablado. Tomen 60 segundos para escribir su reaccion honesta en una nota adhesiva. Anonima. Las leere."', quality: 'strong', why: 'Las notas anonimas pasan por alto las dinamicas de grupo que silencian la disidencia.' },
        { text: 'Camina a las mesas calladas y pregunta: "Que esta pensando su equipo?"', quality: 'okay', why: 'Buen instinto pero "que piensa su equipo" invita a la voz dominante a resumir.' },
        { text: 'Deja que la discusion continue por el tiempo asignado, luego pide una votacion a mano alzada.', quality: 'miss', why: 'Una votacion a mano alzada despues de una discusion dominada solo ratifica las voces mas fuertes.' },
      ],
      research: 'La investigacion de Edmondson sobre seguridad psicologica encontro que en reuniones donde una voz domina, los miembros autocensuran el 68% de sus preocupaciones. Los mecanismos de participacion anonima recuperan el 40-60% de esas perspectivas.',
      expertEye: 'El grupo mas ruidoso no es el problema. El mas callado tampoco. El problema son los grupos donde alguien habla pero nadie realmente dice nada.',
      missedCueStat: '62% de los facilitadores atienden al maestro calificando. Solo 28% notan la dinamica de una sola voz en la mesa de lengua.',
    },
  },

  // ─── SCENARIO 4: Recess / lunch observation ─────────────────────────────
  {
    id: 'rtr-recess',
    roles: ['teacher', 'para', 'coach'],
    gradeBands: ['pk-2', '3-5'],
    cueCategory: 'emotional_state',
    en: {
      setting: 'You are on recess duty. It is the second week of school.',
      scene: 'Most students are playing in groups. A student is sitting alone on the bench near the building, watching others play. They are not crying. They are not asking to go inside. They have their lunch box next to them, still closed. Another student is running between groups, trying to join games but leaving each one after 30 seconds. A third student is walking the perimeter of the playground by themselves, picking up rocks and examining them closely. A group of four students is huddled together, whispering and looking at a fifth student who is playing alone near the swings.',
      observations: [
        { text: 'A student is running between groups, leaving each after 30 seconds', isKey: true, explanation: 'This student is actively trying to connect and failing. They are not choosing to be alone. They are being excluded or do not know how to sustain entry. This is the most urgent social-emotional need on this playground.' },
        { text: 'Four students are whispering and looking at a student playing alone', isKey: true, explanation: 'Targeted whispering with directed glances is the architecture of exclusion. The student at the swings may not know it is happening yet. By the time they do, the damage is done.' },
        { text: 'A student is sitting alone on the bench with a closed lunch box', isKey: false, explanation: 'Alone on a bench is visible and will get adult attention. But the closed lunch box matters more than the sitting. It may mean they have not eaten. Check in, but this child may also just need a quiet moment.' },
        { text: 'A student is walking the perimeter examining rocks', isKey: false, explanation: 'Solitary play is not the same as loneliness. Some children recharge through independent exploration. The rock examiner may be perfectly content. Watch for signs of distress before intervening.' },
      ],
      responses: [
        { text: 'Walk over to the group-hopper and casually say: "Hey, want to help me with something? I need someone to be my partner for this game." Then include them in a nearby group naturally.', quality: 'strong', why: 'You gave the student a role and a bridge into a group without labeling their struggle. "Help me with something" gives them status instead of pity. Facilitating their entry into a group teaches the social skill they are missing: how to join, not just how to approach.' },
        { text: 'Go to the whispering group and redirect: "Hey, find something kind to do or find something else to play."', quality: 'okay', why: 'Addresses the exclusion behavior but "find something kind" is vague. More effective: redirect with a specific task that includes the excluded student. Also, the group-hopper needs intervention more urgently because they are in active distress.' },
        { text: 'Check on the student sitting alone on the bench since they look the most isolated.', quality: 'miss', why: 'The bench student is the most visibly alone but may be the least distressed. The group-hopper is in active social pain, attempting connection and being rejected repeatedly. Visible isolation gets adult attention. Invisible struggle does not.' },
      ],
      research: 'Ladd\'s research on peer relationships found that children who repeatedly attempt and fail to join groups develop rejection sensitivity within 2-3 weeks. Early intervention (facilitating group entry, teaching joining skills) prevents the pattern from becoming internalized. By week 4, the child stops trying. That is harder to reverse.',
      expertEye: 'The playground tells you everything about a classroom\'s social structure. The bench sitter will get checked on. The rock walker is fine. The whisperers need redirection. But the group-hopper is the child who will cry in the car on the way home and not be able to explain why.',
      missedCueStat: '77% of recess supervisors check on the visibly alone student. Only 19% notice the group-hopping pattern.',
    },
    es: {
      setting: 'Estas de turno en el recreo. Es la segunda semana de clases.',
      scene: 'La mayoria de los estudiantes juegan en grupos. Un estudiante esta sentado solo en la banca cerca del edificio, mirando a otros jugar. No esta llorando. No pide entrar. Tiene su lonchera al lado, aun cerrada. Otro estudiante corre entre grupos, tratando de unirse a juegos pero saliendo de cada uno despues de 30 segundos. Un tercer estudiante camina por el perimetro del patio solo, recogiendo piedras y examinandolas de cerca. Un grupo de cuatro estudiantes esta reunido, susurrando y mirando a un quinto estudiante que juega solo cerca de los columpios.',
      observations: [
        { text: 'Un estudiante corre entre grupos, saliendo de cada uno despues de 30 segundos', isKey: true, explanation: 'Este estudiante esta intentando activamente conectar y fallando. No elige estar solo. Esta siendo excluido o no sabe como mantener la entrada.' },
        { text: 'Cuatro estudiantes susurran y miran a un estudiante jugando solo', isKey: true, explanation: 'Susurros dirigidos con miradas es la arquitectura de la exclusion. El estudiante en los columpios puede no saberlo aun.' },
        { text: 'Un estudiante esta sentado solo en la banca con la lonchera cerrada', isKey: false, explanation: 'Solo en una banca es visible y recibira atencion adulta. Pero la lonchera cerrada importa mas que el estar sentado.' },
        { text: 'Un estudiante camina por el perimetro examinando piedras', isKey: false, explanation: 'El juego solitario no es lo mismo que la soledad. Algunos ninos recargan energia a traves de la exploracion independiente.' },
      ],
      responses: [
        { text: 'Camina al que salta de grupo y di casualmente: "Oye, quieres ayudarme con algo? Necesito un companero para este juego." Luego incluyelo en un grupo cercano naturalmente.', quality: 'strong', why: 'Le diste al estudiante un rol y un puente hacia un grupo sin etiquetar su lucha.' },
        { text: 'Ve al grupo que susurra y redirige: "Oigan, encuentren algo amable que hacer o encuentren otro juego."', quality: 'okay', why: 'Aborda el comportamiento de exclusion pero "algo amable" es vago.' },
        { text: 'Ve a ver al estudiante sentado solo en la banca ya que parece el mas aislado.', quality: 'miss', why: 'El estudiante de la banca es el mas visiblemente solo pero puede ser el menos angustiado. El que salta de grupo esta en dolor social activo.' },
      ],
      research: 'La investigacion de Ladd sobre relaciones entre pares encontro que los ninos que intentan repetidamente y fallan al unirse a grupos desarrollan sensibilidad al rechazo en 2-3 semanas. La intervencion temprana previene que el patron se internalice.',
      expertEye: 'El patio te dice todo sobre la estructura social del salon. El de la banca recibira atencion. El de las piedras esta bien. Los que susurran necesitan redireccion. Pero el que salta de grupo es el nino que llorara en el carro camino a casa.',
      missedCueStat: '77% de los supervisores de recreo atienden al estudiante visiblemente solo. Solo 19% notan el patron de saltar de grupo.',
    },
  },

  // ─── SCENARIO 5: PD session you are presenting ──────────────────────────
  {
    id: 'rtr-pd-presenting',
    roles: ['coach', 'leader', 'teacher'],
    gradeBands: ['pk-2', '3-5', '6-8', '9-12'],
    cueCategory: 'disengagement',
    en: {
      setting: 'You are 20 minutes into a PD session you are leading. You just asked participants to try a strategy with a partner.',
      scene: 'About half the room is engaged. Two teachers in the front row are doing exactly what you asked, practicing with enthusiasm. A group in the middle is talking but not about the activity. They are planning a birthday party for a colleague. In the back row, a teacher has their laptop open and is clearly answering emails. The teacher next to them is staring at the slides with a flat expression. A newer teacher near the window is practicing alone because their partner went to the bathroom.',
      observations: [
        { text: 'A teacher in the back is staring at the slides with a flat expression', isKey: true, explanation: 'Flat expression while facing forward is the most commonly missed disengagement cue. This person looks like they are paying attention but they checked out ten minutes ago. They may disagree with the content, feel it is irrelevant, or have personal stress. The flat stare is not boredom. It is absence.' },
        { text: 'A group in the middle is planning a birthday party instead of practicing', isKey: false, explanation: 'Off-topic conversation during partner work is common and mildly concerning. But it is also visible and addressable. A proximity pass will fix it. The flat-stare teacher will not be fixed by proximity.' },
        { text: 'A teacher in the back has their laptop open answering emails', isKey: false, explanation: 'Visible and deliberate disengagement. This teacher has decided your PD is not worth their time. Addressing it publicly creates a confrontation. Note it, but it is not the most important signal.' },
        { text: 'A newer teacher is practicing alone because their partner left', isKey: true, explanation: 'This teacher is trying to engage but has been stranded. They are doing the right thing with no support. If you do not notice them, they will internalize that effort does not get recognized. That is a loyalty moment.' },
      ],
      responses: [
        { text: 'Walk to the newer teacher practicing alone, partner with them for 90 seconds, then casually move to the flat-expression teacher and ask: "What is landing for you so far? And what is not?"', quality: 'strong', why: 'You addressed the stranded new teacher (loyalty moment) and then went to the hardest read in the room (the flat stare) with an open question. "What is not landing" gives them permission to be honest without making it a confrontation.' },
        { text: 'Stop the activity and do a quick pulse check: "Thumbs up if this feels useful, sideways if you are unsure, down if this is missing the mark."', quality: 'okay', why: 'Pulse checks are good facilitation. But mid-activity pulse checks interrupt the people who ARE engaged. Better to gather that data from the disengaged individuals directly.' },
        { text: 'Address the whole room: "I know PD can feel like a lot. Let us push through this last activity and then we will wrap up early."', quality: 'miss', why: '"Push through" signals that even you think this is not worth the time. Promising to end early devalues your own content. The engaged teachers now feel their effort was pointless. The disengaged teachers learned that checking out gets rewarded with less PD.' },
      ],
      research: 'Knight\'s research on professional development found that 74% of teachers report PD as "not applicable" to their practice. But follow-up studies show the issue is rarely content. It is format. PD that includes partner practice with facilitator feedback has 3.2x higher implementation rates than presentation-only PD. The people practicing in your room right now are the ones who will implement.',
      expertEye: 'The laptop and the birthday party are noise. The flat stare and the stranded new teacher are the signals. One is silently disagreeing and will never tell you unless you ask. The other is silently trying and will stop if nobody notices.',
      missedCueStat: '88% of presenters notice the laptop and party planning. Only 22% identify the flat-stare teacher as the most important read in the room.',
    },
    es: {
      setting: 'Llevas 20 minutos en una sesion de PD que estas liderando. Acabas de pedir a los participantes que practiquen una estrategia con un companero.',
      scene: 'Aproximadamente la mitad del salon esta comprometida. Dos maestros en la primera fila hacen exactamente lo que pediste. Un grupo en el medio habla pero no sobre la actividad, estan planeando una fiesta de cumpleanos. En la fila de atras, un maestro tiene su laptop abierta contestando correos. El maestro junto a ellos mira las diapositivas con expresion plana. Un maestro mas nuevo cerca de la ventana practica solo porque su companero fue al bano.',
      observations: [
        { text: 'Un maestro en la fila de atras mira las diapositivas con expresion plana', isKey: true, explanation: 'Expresion plana mirando al frente es la senal de desconexion que mas se pierde. Esta persona parece que esta prestando atencion pero se desconecto hace diez minutos.' },
        { text: 'Un grupo en el medio esta planeando una fiesta en lugar de practicar', isKey: false, explanation: 'Conversacion fuera de tema durante trabajo en parejas es comun. Visible y abordable con proximidad.' },
        { text: 'Un maestro tiene su laptop abierta contestando correos', isKey: false, explanation: 'Desconexion visible y deliberada. Este maestro decidio que tu PD no vale su tiempo.' },
        { text: 'Un maestro mas nuevo practica solo porque su companero se fue', isKey: true, explanation: 'Este maestro esta intentando comprometerse pero fue abandonado. Estan haciendo lo correcto sin apoyo. Ese es un momento de lealtad.' },
      ],
      responses: [
        { text: 'Camina al maestro nuevo practicando solo, se su companero por 90 segundos, luego ve casualmente al de la expresion plana y pregunta: "Que te esta funcionando hasta ahora? Y que no?"', quality: 'strong', why: 'Atendiste al maestro nuevo abandonado y luego fuiste a la lectura mas dificil del salon con una pregunta abierta.' },
        { text: 'Para la actividad y haz un pulso rapido: "Pulgar arriba si esto es util, al lado si no estan seguros, abajo si no esta dando en el blanco."', quality: 'okay', why: 'Los chequeos de pulso son buena facilitacion pero interrumpen a los que SI estan comprometidos.' },
        { text: 'Aborda a todo el salon: "Se que el PD puede sentirse pesado. Terminemos esta actividad y salimos temprano."', quality: 'miss', why: '"Terminar temprano" devalua tu propio contenido. Los maestros comprometidos sienten que su esfuerzo fue inutil. Los desconectados aprenden que desconectarse se recompensa.' },
      ],
      research: 'La investigacion de Knight encontro que el PD que incluye practica con companero y retroalimentacion del facilitador tiene 3.2 veces mayor tasa de implementacion que el PD solo de presentacion.',
      expertEye: 'La laptop y la fiesta son ruido. La mirada plana y el maestro nuevo abandonado son las senales. Uno esta silenciosamente en desacuerdo. El otro esta silenciosamente intentando y dejara de hacerlo si nadie lo nota.',
      missedCueStat: '88% de los presentadores notan la laptop y la fiesta. Solo 22% identifican al maestro de mirada plana como la lectura mas importante.',
    },
  },

  // ─── SCENARIO 6: Classroom after a long weekend ─────────────────────────
  {
    id: 'rtr-after-weekend',
    roles: ['teacher', 'para'],
    gradeBands: ['pk-2', '3-5', '6-8'],
    cueCategory: 'emotional_state',
    en: {
      setting: 'It is Tuesday after a long holiday weekend. Students are arriving for first period.',
      scene: 'The energy is low. Three students came in wearing the same clothes from Friday. A student who is usually loud and social is sitting quietly at their desk, drawing. Another student walked in, made eye contact with you, then immediately looked away and sat in the back instead of their usual seat. Two students are arguing over a pencil. A student you have never seen cry before has red, puffy eyes. The school counselor walks past your door, makes eye contact with you, and gives a subtle nod toward the student with red eyes.',
      observations: [
        { text: 'A usually loud student is sitting quietly, drawing', isKey: true, explanation: 'A behavior change is always a signal. Quiet from a loud student is more concerning than quiet from a quiet student. Drawing may be self-regulation. It may be avoidance. It is definitely not their baseline. Something happened over the weekend.' },
        { text: 'Three students are wearing the same clothes from Friday', isKey: true, explanation: 'Same clothes after a three-day weekend can indicate instability at home. No laundry access, no change of clothes, possibly did not go home. This is not a hygiene observation. It is a welfare observation.' },
        { text: 'Two students are arguing over a pencil', isKey: false, explanation: 'A pencil argument after a long weekend is low-level dysregulation, not a crisis. It resolves with a pencil, not a conversation.' },
        { text: 'The counselor nodded toward the student with red eyes', isKey: false, explanation: 'The counselor signal is important but it is an adult cue, not a student behavior observation. The counselor already knows. Your job is to notice the things the counselor does not know about yet.' },
      ],
      responses: [
        { text: 'Start class with a low-demand entry: "Take 3 minutes. Draw, write, or just breathe. I am glad you are here." Then quietly check in with the clothes-repeat students and the quiet student individually during independent work time.', quality: 'strong', why: 'Low-demand entry gives everyone a soft landing. "I am glad you are here" is the most powerful sentence in a teacher\'s toolkit on hard days. Individual check-ins during work time are private and non-threatening. You prioritized the signals that nobody else will catch.' },
        { text: 'Start class normally to provide structure and routine. Students need consistency after a long break.', quality: 'okay', why: 'Structure is stabilizing. But jumping straight into content on a day when multiple students are showing distress signals ignores what the room is telling you. Routine is important. But reading the room is more important than the lesson plan.' },
        { text: 'Address the room: "It looks like some of us had a tough weekend. If anyone needs to talk, my door is always open."', quality: 'miss', why: 'Public announcements about tough weekends spotlight the students who are struggling. The ones in repeat clothes. The one with red eyes. You just told the whole class to look at them. Well-meaning but it removes the privacy that vulnerable students need most.' },
      ],
      research: 'Perry\'s neurosequential model shows that dysregulated students cannot access their learning brain until they feel safe. A 3-minute soft entry costs you 3 minutes of instruction and gains you the rest of the period. Students who are met with warmth after hard weekends show 47% higher engagement for the remainder of the day (Masten, 2001).',
      expertEye: 'The pencil fight and the red eyes will get addressed. The counselor is already on it. Your unique contribution is noticing the repeat clothes and the behavior change in the loud student. Those are the signals that fall through the cracks because they are not dramatic enough to trigger a referral.',
      missedCueStat: '69% of teachers start class normally after a long weekend. Only 31% adjust their opening based on the room\'s energy.',
    },
    es: {
      setting: 'Es martes despues de un fin de semana largo. Los estudiantes llegan para el primer periodo.',
      scene: 'La energia esta baja. Tres estudiantes llegaron con la misma ropa del viernes. Un estudiante que usualmente es ruidoso y social esta sentado tranquilo en su escritorio, dibujando. Otro estudiante entro, hizo contacto visual contigo, luego inmediatamente miro hacia otro lado y se sento atras en lugar de su asiento usual. Dos estudiantes discuten por un lapiz. Un estudiante que nunca has visto llorar tiene los ojos rojos e hinchados. La consejera escolar pasa por tu puerta, hace contacto visual contigo y asiente sutilmente hacia el estudiante con ojos rojos.',
      observations: [
        { text: 'Un estudiante usualmente ruidoso esta sentado tranquilo, dibujando', isKey: true, explanation: 'Un cambio de comportamiento siempre es una senal. Silencio de un estudiante ruidoso es mas preocupante que silencio de uno callado.' },
        { text: 'Tres estudiantes traen la misma ropa del viernes', isKey: true, explanation: 'La misma ropa despues de tres dias puede indicar inestabilidad en casa. Sin acceso a lavanderia, sin cambio de ropa, posiblemente no fueron a casa.' },
        { text: 'Dos estudiantes discuten por un lapiz', isKey: false, explanation: 'Una discusion por un lapiz es desregulacion de bajo nivel, no una crisis. Se resuelve con un lapiz, no una conversacion.' },
        { text: 'La consejera asintio hacia el estudiante con ojos rojos', isKey: false, explanation: 'La senal de la consejera es importante pero es una senal de adulto. La consejera ya sabe. Tu trabajo es notar lo que la consejera aun no sabe.' },
      ],
      responses: [
        { text: 'Empieza la clase con una entrada de baja demanda: "Tomen 3 minutos. Dibujen, escriban o solo respiren. Me alegra que esten aqui." Luego habla individualmente con los de la ropa repetida y el estudiante callado durante el trabajo independiente.', quality: 'strong', why: 'La entrada de baja demanda da a todos un aterrizaje suave. "Me alegra que esten aqui" es la oracion mas poderosa en dias dificiles.' },
        { text: 'Empieza la clase normalmente para dar estructura y rutina.', quality: 'okay', why: 'La estructura estabiliza. Pero ir directo al contenido cuando multiples estudiantes muestran senales de angustia ignora lo que el salon te esta diciendo.' },
        { text: 'Habla al salon: "Parece que algunos tuvieron un fin de semana dificil. Si alguien necesita hablar, mi puerta siempre esta abierta."', quality: 'miss', why: 'Anuncios publicos sobre fines de semana dificiles ponen el foco en los estudiantes que estan luchando.' },
      ],
      research: 'El modelo neurosecuencial de Perry muestra que los estudiantes desregulados no pueden acceder a su cerebro de aprendizaje hasta que se sienten seguros. Una entrada suave de 3 minutos cuesta 3 minutos de instruccion y gana el resto del periodo.',
      expertEye: 'La pelea por el lapiz y los ojos rojos seran atendidos. La consejera ya esta en eso. Tu contribucion unica es notar la ropa repetida y el cambio de comportamiento en el estudiante ruidoso.',
      missedCueStat: '69% de los maestros empiezan la clase normalmente despues de un fin de semana largo. Solo 31% ajustan su apertura basandose en la energia del salon.',
    },
  },

  // ─── SCENARIO 7: Walking through the parking lot at dismissal ───────────
  {
    id: 'rtr-dismissal',
    roles: ['teacher', 'para', 'leader'],
    gradeBands: ['pk-2', '3-5', '6-8'],
    cueCategory: 'environmental',
    en: {
      setting: 'You are helping with dismissal in the car pickup line.',
      scene: 'Cars are lined up. A parent in a minivan is honking repeatedly even though the line is moving. A student runs out of the building past you without their backpack. Another student is standing at the curb, looking left and right, but no car is coming. They have been standing there for 10 minutes. A teacher comes out the door looking stressed and says to you: "Have you seen Jordan? They were supposed to go to aftercare but they are not on the list." A kindergartner is walking toward a car you do not recognize, and the driver is waving them over.',
      observations: [
        { text: 'A kindergartner is walking toward a car you do not recognize, and the driver is waving them over', isKey: true, explanation: 'This is the highest-priority observation. An unfamiliar car with a waving driver and a young child is a safety protocol trigger. Everything else can wait.' },
        { text: 'A student has been standing at the curb for 10 minutes with no car coming', isKey: true, explanation: 'Ten minutes past the pickup window is a welfare concern. The student may not have a ride. They may have a parent who forgot. Or they may have a situation at home that is making pickup unpredictable. This needs adult attention now.' },
        { text: 'A student ran out without their backpack', isKey: false, explanation: 'Concerning but low-priority compared to safety and welfare issues. The backpack will be in lost and found tomorrow.' },
        { text: 'A parent in a minivan is honking repeatedly', isKey: false, explanation: 'Annoying but not a safety concern. The honking parent can wait. Every adult instinct wants to address the noise. Resist it.' },
      ],
      responses: [
        { text: 'Immediately walk to the kindergartner and say: "Hold on, sweetie, let me check your pickup card." Then radio the office about the unfamiliar car. After that, check on the 10-minute curb student.', quality: 'strong', why: 'Safety first, always. The kindergartner and the unfamiliar car is a non-negotiable protocol trigger. The curb student is second priority. Everything else is noise. You triaged correctly.' },
        { text: 'Help the teacher find Jordan first since they seem panicked, then check on the other situations.', quality: 'okay', why: 'The teacher\'s urgency is real but Jordan is in the building. The kindergartner and the unfamiliar car are outside and happening right now. Inside the building is safer than outside in a parking lot. Triage by location and vulnerability.' },
        { text: 'Address the honking parent first to keep the line moving, then deal with the other situations.', quality: 'miss', why: 'The honking is the loudest signal but the lowest priority. A frustrated parent in a car is safe. A kindergartner approaching an unknown vehicle is not. Noise is not urgency. Learn to ignore the loudest thing in the room when the quietest thing is the most dangerous.' },
      ],
      research: 'National Safety Council data shows that 94% of school safety incidents during dismissal involve vehicle-related situations. Schools that train staff to prioritize unfamiliar vehicles over noise complaints reduce dismissal incidents by 67%. The instinct to address the loudest problem first is the most dangerous instinct in dismissal duty.',
      expertEye: 'Dismissal is the highest-risk 15 minutes of the school day. The honking parent trains your attention toward frustration. The kindergartner walking toward an unfamiliar car is the actual emergency. Experienced dismissal staff scan for vehicle mismatches before anything else.',
      missedCueStat: '56% of dismissal staff address the honking parent first. Only 38% immediately prioritize the unfamiliar vehicle.',
    },
    es: {
      setting: 'Estas ayudando con la salida en la fila de recogida de autos.',
      scene: 'Los autos estan en fila. Un padre en una minivan toca la bocina repetidamente aunque la fila se mueve. Un estudiante sale corriendo del edificio sin su mochila. Otro estudiante esta parado en la acera, mirando a izquierda y derecha, pero no viene ningun auto. Lleva 10 minutos ahi. Un maestro sale por la puerta estresado y te dice: "Has visto a Jordan? Deberian ir al programa despues de clases pero no estan en la lista." Un nino de kinder camina hacia un auto que no reconoces, y el conductor les hace senas.',
      observations: [
        { text: 'Un nino de kinder camina hacia un auto que no reconoces, y el conductor les hace senas', isKey: true, explanation: 'Esta es la observacion de mayor prioridad. Un auto desconocido con un conductor haciendo senas y un nino pequeno es un protocolo de seguridad.' },
        { text: 'Un estudiante lleva 10 minutos parado en la acera sin que venga un auto', isKey: true, explanation: 'Diez minutos pasada la ventana de recogida es una preocupacion de bienestar.' },
        { text: 'Un estudiante salio corriendo sin su mochila', isKey: false, explanation: 'Preocupante pero baja prioridad comparado con seguridad y bienestar.' },
        { text: 'Un padre en una minivan toca la bocina repetidamente', isKey: false, explanation: 'Molesto pero no es una preocupacion de seguridad. El padre puede esperar.' },
      ],
      responses: [
        { text: 'Inmediatamente camina al nino de kinder y di: "Espera, carinito, dejame verificar tu tarjeta de recogida." Luego reporta el auto desconocido. Despues, atiende al estudiante de 10 minutos en la acera.', quality: 'strong', why: 'Seguridad primero, siempre. El nino de kinder y el auto desconocido es un protocolo no negociable.' },
        { text: 'Ayuda al maestro a encontrar a Jordan primero ya que parecen estar en panico.', quality: 'okay', why: 'La urgencia del maestro es real pero Jordan esta dentro del edificio. El nino de kinder y el auto desconocido estan afuera. Dentro del edificio es mas seguro.' },
        { text: 'Atiende al padre que toca la bocina primero para mantener la fila en movimiento.', quality: 'miss', why: 'La bocina es la senal mas fuerte pero la menor prioridad. Ruido no es urgencia.' },
      ],
      research: 'Los datos del Consejo Nacional de Seguridad muestran que el 94% de los incidentes de seguridad escolar durante la salida involucran situaciones con vehiculos. Las escuelas que entrenan al personal a priorizar vehiculos desconocidos reducen incidentes en un 67%.',
      expertEye: 'La salida son los 15 minutos de mayor riesgo del dia escolar. El padre tocando la bocina entrena tu atencion hacia la frustracion. El nino caminando hacia un auto desconocido es la emergencia real.',
      missedCueStat: '56% del personal de salida atiende al padre de la bocina primero. Solo 38% priorizan inmediatamente el vehiculo desconocido.',
    },
  },

  // ─── SCENARIO 8: Coach observing a struggling teacher ───────────────────
  {
    id: 'rtr-struggling-teacher',
    roles: ['coach', 'leader'],
    gradeBands: ['pk-2', '3-5', '6-8', '9-12'],
    cueCategory: 'emotional_state',
    en: {
      setting: 'You are a coach doing a scheduled observation. The teacher knows you are coming.',
      scene: 'The lesson plan on the desk is clearly printed from the internet, not the teacher\'s usual handwritten plans. The teacher is standing behind their desk instead of circulating. Their voice is monotone. Students are compliant but not engaged. The classroom that was covered in student work last month now has bare walls. A coffee cup on the desk has been refilled at least three times based on the ring stains. The teacher glances at the clock twice in the first five minutes. When a student asks a question, the teacher answers with: "Just follow the directions on the sheet."',
      observations: [
        { text: 'The classroom walls that were covered in student work are now bare', isKey: true, explanation: 'Bare walls in a previously decorated classroom is one of the strongest teacher burnout signals. Taking down student work means the teacher has stopped investing in the environment. This is not a decoration issue. It is a depletion signal.' },
        { text: 'The lesson plan is clearly printed from the internet, not their usual handwritten plans', isKey: true, explanation: 'A shift from original planning to downloaded plans indicates the teacher is in survival mode. They are meeting the requirement (lesson plan exists) without the investment (it is not theirs). This is the professional equivalent of going through the motions.' },
        { text: 'The teacher is standing behind their desk instead of circulating', isKey: false, explanation: 'Standing behind the desk is a symptom, not the root signal. It reflects the same withdrawal pattern as the bare walls and downloaded plan, but the desk is the most visible sign and the one most coaches address first. It is the least useful to comment on.' },
        { text: 'The coffee cup has multiple ring stains from refills', isKey: false, explanation: 'Caffeine dependency is common among educators and not diagnostic on its own. But combined with the other signals, it suggests the teacher is physically depleted and using caffeine to compensate.' },
      ],
      responses: [
        { text: 'After the observation, skip the instructional feedback. Start with: "How are you doing? Not your teaching. You." Then listen. Do not offer solutions. Do not reference what you saw. Just listen.', quality: 'strong', why: 'This teacher does not need coaching right now. They need to be seen. Instructional feedback on a survival-mode teacher adds weight to someone who is already sinking. "How are you doing" is the only question that matters today. Everything else can wait.' },
        { text: 'After the observation, provide gentle feedback: "I noticed the lesson was more teacher-directed today. Want to collaborate on something more student-centered for next week?"', quality: 'okay', why: 'Well-intentioned but tone-deaf. You are offering to fix the lesson when the person is breaking. The downloaded plan is not a skill gap. It is a capacity gap. Coaching the instruction right now is like correcting someone\'s grammar while they are drowning.' },
        { text: 'Document the observation formally and share areas for growth. The teacher agreed to be observed and needs honest feedback to improve.', quality: 'miss', why: 'Formal documentation of a teacher in crisis creates a paper trail that can feel punitive. The bare walls, the downloaded plan, the monotone voice are not performance issues. They are distress signals. Formal feedback right now will accelerate the burnout, not reverse it.' },
      ],
      research: 'Santoro\'s research distinguishes between burnout (exhaustion from overwork) and demoralization (loss of purpose from moral injury). Downloaded plans and bare walls suggest demoralization, not laziness. Aguilar\'s coaching framework states that trust must precede feedback. In the absence of trust, feedback is experienced as criticism regardless of intent.',
      expertEye: 'New coaches see a lesson to fix. Experienced coaches see a person to support. The bare walls are the signal. A teacher who stops decorating has stopped believing that what happens in their room matters. That is not an instructional problem. That is a human problem.',
      missedCueStat: '71% of coaches lead with instructional feedback after observing a struggling teacher. Only 24% ask about the person before the performance.',
    },
    es: {
      setting: 'Eres un coach haciendo una observacion programada. El maestro sabe que vienes.',
      scene: 'El plan de leccion en el escritorio esta claramente impreso de internet, no los planes escritos a mano usuales del maestro. El maestro esta parado detras de su escritorio en lugar de circular. Su voz es monotona. Los estudiantes son obedientes pero no estan comprometidos. El salon que estaba cubierto de trabajos de estudiantes el mes pasado ahora tiene paredes vacias. Una taza de cafe en el escritorio ha sido rellenada al menos tres veces segun las marcas de anillos. El maestro mira el reloj dos veces en los primeros cinco minutos. Cuando un estudiante hace una pregunta, el maestro responde: "Solo sigue las instrucciones de la hoja."',
      observations: [
        { text: 'Las paredes del salon que estaban cubiertas de trabajos de estudiantes ahora estan vacias', isKey: true, explanation: 'Paredes vacias en un salon previamente decorado es una de las senales mas fuertes de agotamiento docente. Quitar los trabajos de estudiantes significa que el maestro dejo de invertir en el ambiente.' },
        { text: 'El plan de leccion esta impreso de internet, no es su estilo usual', isKey: true, explanation: 'Un cambio de planificacion original a planes descargados indica que el maestro esta en modo de supervivencia.' },
        { text: 'El maestro esta parado detras del escritorio en lugar de circular', isKey: false, explanation: 'Estar detras del escritorio es un sintoma, no la senal raiz. Es la senal mas visible y la que la mayoria de los coaches abordan primero. Es la menos util para comentar.' },
        { text: 'La taza de cafe tiene multiples marcas de anillos de rellenos', isKey: false, explanation: 'La dependencia de cafeina es comun y no es diagnostica por si sola.' },
      ],
      responses: [
        { text: 'Despues de la observacion, omite la retroalimentacion instruccional. Empieza con: "Como estas? No tu ensenanza. Tu." Luego escucha. No ofrezcas soluciones. Solo escucha.', quality: 'strong', why: 'Este maestro no necesita coaching ahora. Necesita ser visto. La retroalimentacion instruccional a un maestro en modo de supervivencia agrega peso a alguien que ya se esta hundiendo.' },
        { text: 'Despues de la observacion, da retroalimentacion suave: "Note que la leccion fue mas dirigida por el maestro hoy. Quieres colaborar en algo mas centrado en el estudiante?"', quality: 'okay', why: 'Bien intencionado pero fuera de tono. Estas ofreciendo arreglar la leccion cuando la persona se esta quebrando.' },
        { text: 'Documenta la observacion formalmente y comparte areas de crecimiento.', quality: 'miss', why: 'La documentacion formal de un maestro en crisis crea un expediente que puede sentirse punitivo. Las paredes vacias y el plan descargado no son problemas de rendimiento. Son senales de angustia.' },
      ],
      research: 'La investigacion de Santoro distingue entre agotamiento (de exceso de trabajo) y desmoralizacion (perdida de proposito). Planes descargados y paredes vacias sugieren desmoralizacion, no pereza. El marco de coaching de Aguilar establece que la confianza debe preceder a la retroalimentacion.',
      expertEye: 'Los coaches nuevos ven una leccion que arreglar. Los coaches experimentados ven una persona que apoyar. Las paredes vacias son la senal. Un maestro que deja de decorar ha dejado de creer que lo que pasa en su salon importa.',
      missedCueStat: '71% de los coaches lideran con retroalimentacion instruccional despues de observar a un maestro en dificultades. Solo 24% preguntan por la persona antes del rendimiento.',
    },
  },

  // ─── SCENARIO 9: Entering a new classroom as a para ─────────────────────
  {
    id: 'rtr-para-new-room',
    roles: ['para', 'teacher'],
    gradeBands: ['pk-2', '3-5', '6-8', '9-12'],
    cueCategory: 'environmental',
    en: {
      setting: 'You are a para walking into a new classroom assignment for the first time.',
      scene: 'There is no desk or chair for you. The teacher\'s desk has stacks of papers covering every surface. Student desks are arranged in rows facing forward. The small group table in the back has textbooks piled on it. The daily schedule on the board does not mention your name or your role. A student sees you and says: "Are you the new helper?" The teacher is writing on the board and has not acknowledged your arrival.',
      observations: [
        { text: 'The daily schedule does not mention your name or role', isKey: true, explanation: 'Your absence from the schedule means the teacher has not planned for your presence. You are not integrated into the instructional design. This is the most important signal because it tells you whether you are expected to be a partner or a warm body.' },
        { text: 'The small group table has textbooks piled on it', isKey: true, explanation: 'The small group table is your workspace. Textbooks on it means it has not been cleared for you. This is not about tidiness. It is about whether the teacher sees your work (small group instruction) as a priority or an afterthought.' },
        { text: 'There is no desk or chair for you', isKey: false, explanation: 'Visible and easy to solve. But a missing desk is a symptom of the larger pattern: the teacher did not prepare for a co-educator. Fixing the desk does not fix the partnership.' },
        { text: 'A student called you "the helper"', isKey: false, explanation: 'The student is reflecting the language and framing they have been given. If the teacher introduced you as "our helper," that is how the class will see you. Language shapes role perception for students and adults alike.' },
      ],
      responses: [
        { text: 'Clear the small group table yourself. When the teacher finishes with the board, introduce yourself: "I am excited to be here. When you have a minute, I would love to hear how I can best support your students today."', quality: 'strong', why: 'You took initiative (cleared the table) without asking permission for something you should not need permission for. Then you opened a conversation that positions you as a partner, not a subordinate. "How I can best support your students" is collaborative language.' },
        { text: 'Wait for the teacher to notice you and give you directions. They are busy and will get to you when they can.', quality: 'miss', why: 'Waiting sets the pattern for the entire year. If you wait to be told what to do on Day 1, you will wait to be told what to do every day. The teacher is not being rude. They are overwhelmed. But your silence teaches them that you do not need direction, and then they will stop giving it.' },
        { text: 'Introduce yourself to the students: "Hi everyone, I am [name] and I am going to be working with some of you this year."', quality: 'okay', why: 'Good instinct to establish yourself with students. But introducing yourself before the teacher introduces you can feel like overstepping. Better: let the teacher introduce you, and if they do not, ask them to. "Could you introduce me to the class? I want them to know I am part of the team."' },
      ],
      research: 'Giangreco\'s research on paraprofessional roles found that 64% of paras report feeling "unclear about their role" in the first month. Classrooms where the para\'s role is explicitly stated on the schedule and introduced to students show 40% higher para job satisfaction and 28% better student outcomes in supported groups.',
      expertEye: 'The missing desk is the distraction. The schedule is the story. If your name is not on the board, you are invisible in the system. Everything else (the desk, the textbooks, the "helper" label) flows from that invisibility. Fix the visibility first.',
      missedCueStat: '82% of new paras focus on the missing desk. Only 29% notice that the schedule does not include their role.',
    },
    es: {
      setting: 'Eres un para entrando a una nueva asignacion de salon por primera vez.',
      scene: 'No hay escritorio ni silla para ti. El escritorio del maestro tiene pilas de papeles en cada superficie. Los escritorios de los estudiantes estan en filas mirando al frente. La mesa de grupo pequeno en la parte de atras tiene libros de texto apilados. El horario diario en el pizarron no menciona tu nombre ni tu rol. Un estudiante te ve y dice: "Eres la nueva ayudante?" El maestro esta escribiendo en el pizarron y no ha reconocido tu llegada.',
      observations: [
        { text: 'El horario diario no menciona tu nombre ni tu rol', isKey: true, explanation: 'Tu ausencia del horario significa que el maestro no planeo tu presencia. No estas integrado/a en el diseno instruccional.' },
        { text: 'La mesa de grupo pequeno tiene libros de texto apilados', isKey: true, explanation: 'La mesa de grupo pequeno es tu espacio de trabajo. Los libros apilados significan que no fue despejada para ti.' },
        { text: 'No hay escritorio ni silla para ti', isKey: false, explanation: 'Visible y facil de resolver. Pero un escritorio faltante es un sintoma del patron mayor.' },
        { text: 'Un estudiante te llamo "la ayudante"', isKey: false, explanation: 'El estudiante refleja el lenguaje y el marco que les han dado.' },
      ],
      responses: [
        { text: 'Despeja la mesa de grupo pequeno tu mismo/a. Cuando el maestro termine con el pizarron, presentate: "Estoy emocionado/a de estar aqui. Cuando tengas un minuto, me encantaria saber como puedo apoyar mejor a tus estudiantes hoy."', quality: 'strong', why: 'Tomaste iniciativa y abriste una conversacion que te posiciona como socio, no subordinado.' },
        { text: 'Espera a que el maestro te note y te de instrucciones. Estan ocupados y te atenderan cuando puedan.', quality: 'miss', why: 'Esperar establece el patron para todo el ano. Si esperas que te digan que hacer el Dia 1, esperaras que te digan que hacer todos los dias.' },
        { text: 'Presentate a los estudiantes: "Hola a todos, soy [nombre] y voy a estar trabajando con algunos de ustedes este ano."', quality: 'okay', why: 'Buen instinto pero presentarte antes de que el maestro te presente puede sentirse como sobrepasar.' },
      ],
      research: 'La investigacion de Giangreco encontro que el 64% de los paras reportan sentirse "poco claros sobre su rol" en el primer mes. Los salones donde el rol del para esta explicitamente en el horario muestran 40% mayor satisfaccion laboral del para.',
      expertEye: 'El escritorio faltante es la distraccion. El horario es la historia. Si tu nombre no esta en el pizarron, eres invisible en el sistema.',
      missedCueStat: '82% de los paras nuevos se enfocan en el escritorio faltante. Solo 29% notan que el horario no incluye su rol.',
    },
  },

  // ─── SCENARIO 10: Positive energy in a classroom ────────────────────────
  {
    id: 'rtr-positive-energy',
    roles: ['coach', 'leader', 'teacher', 'para'],
    gradeBands: ['pk-2', '3-5', '6-8', '9-12'],
    cueCategory: 'positive_energy',
    en: {
      setting: 'You walk past an open classroom door and something makes you stop.',
      scene: 'The noise level is high. Students are out of their seats. Papers are on the floor. It looks chaotic at first glance. But then you notice: every student is engaged. Two students are debating at a whiteboard, gesturing at a diagram they drew. Three students are on the floor with markers, building a timeline on butcher paper. A student who usually struggles is explaining something to a peer, and the peer is actually listening. The teacher is sitting on the floor with a group, asking questions, not giving answers. A student who usually avoids participation is standing at the front of the room presenting to two classmates who chose to listen.',
      observations: [
        { text: 'A usually struggling student is explaining something to a peer who is listening', isKey: true, explanation: 'Role reversal is one of the highest indicators of deep learning. When a student who usually receives help becomes the explainer, and the peer genuinely listens, the cognitive demand has shifted. This is the moment learning becomes visible.' },
        { text: 'A usually avoidant student is presenting to classmates who chose to listen', isKey: true, explanation: 'Voluntary participation from an avoidant student means the classroom culture has created enough safety for risk-taking. The "chose to listen" detail matters. These are not assigned partners. These are students who opted in to hearing their peer. That is community.' },
        { text: 'The noise level is high and students are out of their seats', isKey: false, explanation: 'Volume and movement are often misread as disorder. But volume with purpose and movement with direction are signs of engagement, not chaos. The difference is whether the energy is productive or dispersed.' },
        { text: 'Papers are on the floor', isKey: false, explanation: 'Papers on the floor during active work is a sign that students are prioritizing the work over the tidiness. This is not disorder. This is immersion. The floor will be cleaned. The learning is happening now.' },
      ],
      responses: [
        { text: 'Stay and watch for 3 minutes without saying anything. After class, tell the teacher exactly what you saw: "The student who usually struggles was teaching. The avoidant student was presenting. Whatever you are doing, it is working."', quality: 'strong', why: 'Specific positive feedback on the things that matter (student role reversal, voluntary participation) tells the teacher you saw what they built, not just what the room looked like. Naming the specific students and behaviors validates the invisible work that created this culture.' },
        { text: 'Walk in, give the teacher a thumbs up, and say: "Great energy in here!"', quality: 'okay', why: '"Great energy" is generic praise. It is better than nothing but it does not tell the teacher what specifically is working. They will not know which choices led to this moment, so they can not replicate it intentionally. Specific beats general every time.' },
        { text: 'Note that the room is loud and messy, and plan to check in with the teacher about classroom management expectations.', quality: 'miss', why: 'This is the most damaging response. You are about to coach a teacher away from one of the most effective learning environments in the building because it does not look like traditional compliance. The struggling student is teaching. The avoidant student is presenting. If you redirect this teacher toward quieter, neater instruction, you will get compliance. You will lose the learning.' },
      ],
      research: 'Hattie\'s research identifies "visible learning" as the goal of effective instruction: learning that is observable, measurable, and driven by student agency. The effect size of student-led discussion is 0.82, nearly twice the threshold for significant impact. The effect size of peer tutoring is 0.55. Both are happening in this room simultaneously.',
      expertEye: 'Inexperienced observers see chaos. Experienced observers see learning. The test is simple: are students doing the cognitive work, or is the teacher? In this room, students are debating, explaining, presenting, and building. The teacher is sitting on the floor asking questions. That is not a management failure. That is instructional design at its highest level.',
      missedCueStat: '43% of observers who walk past this room would flag it for management concerns. Only 31% would recognize it as one of the strongest learning environments in the building.',
    },
    es: {
      setting: 'Pasas por la puerta abierta de un salon y algo te hace detenerte.',
      scene: 'El nivel de ruido es alto. Los estudiantes estan fuera de sus asientos. Hay papeles en el piso. Parece caotico a primera vista. Pero luego notas: cada estudiante esta comprometido. Dos estudiantes debaten en un pizarron, senalando un diagrama que dibujaron. Tres estudiantes estan en el piso con marcadores, construyendo una linea de tiempo en papel. Un estudiante que usualmente tiene dificultades esta explicando algo a un companero, y el companero realmente esta escuchando. El maestro esta sentado en el piso con un grupo, haciendo preguntas, no dando respuestas. Un estudiante que usualmente evita participar esta presentando al frente del salon a dos companeros que eligieron escuchar.',
      observations: [
        { text: 'Un estudiante que usualmente tiene dificultades esta explicando algo a un companero que esta escuchando', isKey: true, explanation: 'La inversion de roles es uno de los indicadores mas altos de aprendizaje profundo.' },
        { text: 'Un estudiante usualmente evasivo esta presentando a companeros que eligieron escuchar', isKey: true, explanation: 'Participacion voluntaria de un estudiante evasivo significa que la cultura del salon ha creado suficiente seguridad para tomar riesgos.' },
        { text: 'El nivel de ruido es alto y los estudiantes estan fuera de sus asientos', isKey: false, explanation: 'Volumen y movimiento a menudo se interpretan como desorden. Pero volumen con proposito y movimiento con direccion son senales de compromiso.' },
        { text: 'Hay papeles en el piso', isKey: false, explanation: 'Papeles en el piso durante trabajo activo es una senal de que los estudiantes priorizan el trabajo sobre el orden.' },
      ],
      responses: [
        { text: 'Quedate y observa 3 minutos sin decir nada. Despues de clase, dile al maestro exactamente lo que viste: "El estudiante que usualmente tiene dificultades estaba ensenando. El estudiante evasivo estaba presentando. Lo que sea que estes haciendo, esta funcionando."', quality: 'strong', why: 'Retroalimentacion positiva especifica sobre lo que importa dice al maestro que viste lo que construyeron, no solo como se veia el salon.' },
        { text: 'Entra, dale al maestro un pulgar arriba y di: "Gran energia aqui!"', quality: 'okay', why: '"Gran energia" es elogio generico. No le dice al maestro que especificamente esta funcionando.' },
        { text: 'Nota que el salon esta ruidoso y desordenado, y planea hablar con el maestro sobre expectativas de manejo del salon.', quality: 'miss', why: 'Estas a punto de alejar con coaching a un maestro de uno de los ambientes de aprendizaje mas efectivos del edificio porque no parece cumplimiento tradicional.' },
      ],
      research: 'La investigacion de Hattie identifica el "aprendizaje visible" como la meta de la instruccion efectiva. El tamano de efecto de la discusion dirigida por estudiantes es 0.82. El de la tutoria entre pares es 0.55. Ambos estan sucediendo en este salon simultaneamente.',
      expertEye: 'Los observadores sin experiencia ven caos. Los experimentados ven aprendizaje. La prueba es simple: estan los estudiantes haciendo el trabajo cognitivo, o el maestro?',
      missedCueStat: '43% de los observadores que pasan por este salon lo marcarian por preocupaciones de manejo. Solo 31% lo reconocerian como uno de los ambientes de aprendizaje mas fuertes del edificio.',
    },
  },
]
