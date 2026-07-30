// Principal Playbook — scenario data (EN/ES)

export interface PlaybookScenario {
  en: {
    context: string;
    scenario: string;
    choices: { letter: string; text: string; best: boolean }[];
    researchSays: string;
    leadershipLens: string;
  };
  es: {
    context: string;
    scenario: string;
    choices: { letter: string; text: string; best: boolean }[];
    researchSays: string;
    leadershipLens: string;
  };
}

export const PLAYBOOK_SCENARIOS: PlaybookScenario[] = [
  // 1. Two teachers, same conflict
  {
    en: {
      context: 'Tuesday morning, 7:45 AM. Your office.',
      scenario:
        'Two teachers come to you separately within 20 minutes, each telling a different version of the same conflict over shared supply closet access. Both want you to "handle it." The second teacher is visibly upset and says, "If you don\'t do something, I\'m going to HR."',
      choices: [
        { letter: 'A', text: 'Side with the teacher who came to you first since they set the narrative.', best: false },
        { letter: 'B', text: 'Tell both teachers you will make a decision by end of day and email them the resolution.', best: false },
        { letter: 'C', text: 'Bring both teachers together, set ground rules for the conversation, and facilitate a solution they co-own.', best: true },
        { letter: 'D', text: 'Assign each teacher designated times for the supply closet so neither has to interact.', best: false },
      ],
      researchSays:
        'Mediation research (Johnson & Johnson, 2009) shows that when leaders facilitate joint problem-solving rather than imposing solutions, the resolution is 3x more likely to hold long term. Siding with one party or separating them avoids the root cause. Emailing a ruling removes teacher voice entirely. The discomfort of a facilitated conversation builds relational trust, which Bryk and Schneider (2002) identify as the single strongest predictor of school improvement.',
      leadershipLens: 'Trust Building',
    },
    es: {
      context: 'Martes por la manana, 7:45 AM. Tu oficina.',
      scenario:
        'Dos maestros/as vienen a tu oficina por separado en 20 minutos, cada uno contando una version diferente del mismo conflicto sobre el acceso al closet de materiales compartido. Ambos quieren que tu "lo resuelvas." El/la segundo/a maestro/a esta visiblemente molesto/a y dice: "Si no haces algo, voy a Recursos Humanos."',
      choices: [
        { letter: 'A', text: 'Ponerte del lado del maestro/a que vino primero porque establecio la narrativa.', best: false },
        { letter: 'B', text: 'Decirle a ambos maestros/as que tomaras una decision antes del final del dia y les enviaras la resolucion por correo.', best: false },
        { letter: 'C', text: 'Reunir a ambos maestros/as, establecer reglas para la conversacion y facilitar una solucion que ambos construyan juntos.', best: true },
        { letter: 'D', text: 'Asignar a cada maestro/a horarios designados para el closet de materiales para que no tengan que interactuar.', best: false },
      ],
      researchSays:
        'La investigacion sobre mediacion (Johnson y Johnson, 2009) muestra que cuando los lideres facilitan la resolucion conjunta de problemas en lugar de imponer soluciones, la resolucion tiene 3 veces mas probabilidades de mantenerse a largo plazo. Tomar partido o separarlos evita la causa raiz. Enviar una decision por correo elimina la voz del maestro. La incomodidad de una conversacion facilitada construye confianza relacional, que Bryk y Schneider (2002) identifican como el predictor mas fuerte de mejora escolar.',
      leadershipLens: 'Construccion de Confianza',
    },
  },

  // 2. Parent shows up unannounced
  {
    en: {
      context: 'Wednesday, 10:15 AM. Front office.',
      scenario:
        'A parent walks into the front office without an appointment, demanding to see their child\'s teacher immediately. The teacher is mid-lesson with 24 students. The parent says, "I pay taxes. I have a right to be in that classroom right now." The front desk staff looks at you for direction.',
      choices: [
        { letter: 'A', text: 'Walk the parent directly to the classroom so they can observe the lesson and talk with the teacher at the next break.', best: false },
        { letter: 'B', text: 'Tell the parent they need to schedule an appointment and cannot enter the building without one.', best: false },
        { letter: 'C', text: 'Invite the parent into your office, acknowledge their urgency, listen to the concern, and offer to set up a same-day meeting with the teacher during a planning period.', best: true },
        { letter: 'D', text: 'Call the teacher out of the classroom to meet with the parent right now.', best: false },
      ],
      researchSays:
        'Henderson and Mapp (2002) found that schools with high family engagement treat every parent interaction as a relationship deposit, not a policy enforcement moment. Turning a parent away cold damages trust permanently. Pulling a teacher mid-lesson disrupts 24 students. Walking a frustrated parent into a live classroom creates a volatile situation. Inviting them in, validating the emotion, and creating a same-day pathway honors their concern while protecting instructional time.',
      leadershipLens: 'Communication',
    },
    es: {
      context: 'Miercoles, 10:15 AM. Oficina principal.',
      scenario:
        'Un padre/madre llega a la oficina principal sin cita, exigiendo ver al maestro/a de su hijo/a inmediatamente. El/la maestro/a esta en medio de una leccion con 24 estudiantes. El padre/madre dice: "Yo pago impuestos. Tengo derecho a estar en ese salon ahora mismo." El personal de recepcion te mira buscando direccion.',
      choices: [
        { letter: 'A', text: 'Llevar al padre/madre directamente al salon para que observe la leccion y hable con el/la maestro/a en el proximo descanso.', best: false },
        { letter: 'B', text: 'Decirle al padre/madre que necesita programar una cita y no puede entrar al edificio sin una.', best: false },
        { letter: 'C', text: 'Invitar al padre/madre a tu oficina, reconocer su urgencia, escuchar la preocupacion y ofrecer programar una reunion el mismo dia con el/la maestro/a durante su periodo de planificacion.', best: true },
        { letter: 'D', text: 'Llamar al maestro/a fuera del salon para reunirse con el padre/madre ahora mismo.', best: false },
      ],
      researchSays:
        'Henderson y Mapp (2002) encontraron que las escuelas con alto compromiso familiar tratan cada interaccion con los padres como un deposito relacional, no un momento de aplicacion de politicas. Rechazar a un padre/madre de manera fria dana la confianza permanentemente. Sacar a un/a maestro/a a mitad de leccion interrumpe a 24 estudiantes. Llevar a un padre/madre frustrado/a a un salon activo crea una situacion volatil. Invitarlos, validar la emocion y crear un camino el mismo dia honra su preocupacion mientras protege el tiempo de instruccion.',
      leadershipLens: 'Comunicacion',
    },
  },

  // 3. Best teacher wants to transfer
  {
    en: {
      context: 'Thursday, 3:30 PM. After dismissal, your office door.',
      scenario:
        'Your strongest teacher, the one other teachers go to for help, asks to meet privately. She tells you she has been offered a position at a neighboring school and is seriously considering it. She says, "I love this school, but I feel like I have hit a ceiling here. There is nothing left for me to grow into."',
      choices: [
        { letter: 'A', text: 'Immediately offer her a department chair or team lead title to make her stay.', best: false },
        { letter: 'B', text: 'Ask her what growth would look like for her and co-design a leadership pathway that did not exist before.', best: true },
        { letter: 'C', text: 'Tell her you understand and wish her well at the new school.', best: false },
        { letter: 'D', text: 'Remind her of everything the school has done for her and how much the students need her.', best: false },
      ],
      researchSays:
        'Ingersoll (2001) and the Learning Policy Institute identify lack of growth opportunities as a top-3 driver of teacher attrition. Throwing a title at someone without understanding their actual need is a band-aid. Guilt-tripping erodes trust and guarantees she leaves. Wishing her well without exploring options signals you do not value her enough to fight. Asking what growth means to her and building something new together signals investment in her as a professional. Distributed leadership research (Spillane, 2006) shows this is also how you build capacity for the whole building.',
      leadershipLens: 'Distributed Leadership',
    },
    es: {
      context: 'Jueves, 3:30 PM. Despues de la salida, la puerta de tu oficina.',
      scenario:
        'Tu mejor maestra, la persona a quien otros maestros/as acuden por ayuda, pide reunirse en privado. Te dice que le ofrecieron un puesto en una escuela vecina y lo esta considerando seriamente. Dice: "Me encanta esta escuela, pero siento que he llegado a un techo aqui. No me queda nada en lo que crecer."',
      choices: [
        { letter: 'A', text: 'Ofrecerle inmediatamente un titulo de coordinadora de departamento o lider de equipo para que se quede.', best: false },
        { letter: 'B', text: 'Preguntarle como seria el crecimiento para ella y co-disenar un camino de liderazgo que no existia antes.', best: true },
        { letter: 'C', text: 'Decirle que la entiendes y desearle lo mejor en la nueva escuela.', best: false },
        { letter: 'D', text: 'Recordarle todo lo que la escuela ha hecho por ella y cuanto la necesitan los estudiantes.', best: false },
      ],
      researchSays:
        'Ingersoll (2001) y el Learning Policy Institute identifican la falta de oportunidades de crecimiento como uno de los 3 principales impulsores de la rotacion docente. Lanzar un titulo a alguien sin entender su necesidad real es una curacion superficial. Hacerla sentir culpable erosiona la confianza y garantiza que se vaya. Desearle lo mejor sin explorar opciones senala que no la valoras lo suficiente como para luchar. Preguntar que significa el crecimiento para ella y construir algo nuevo juntos senala inversion en ella como profesional. La investigacion sobre liderazgo distribuido (Spillane, 2006) muestra que asi es tambien como se construye capacidad para todo el edificio.',
      leadershipLens: 'Liderazgo Distribuido',
    },
  },

  // 4. First-year teacher crying in the copy room
  {
    en: {
      context: 'Monday, 9:50 AM. Copy room, between first and second period.',
      scenario:
        'You walk into the copy room and find a first-year teacher wiping tears. She says a student told her "You are the worst teacher I have ever had" in front of the whole class. She has 22 students waiting for her return in 4 minutes. She says, "Maybe they are right."',
      choices: [
        { letter: 'A', text: 'Tell her to shake it off, remind her she is doing great, and get back to class.', best: false },
        { letter: 'B', text: 'Validate the emotion, ask if she needs 5 more minutes, cover her class yourself, and schedule a debrief for her planning period.', best: true },
        { letter: 'C', text: 'Go to her classroom and address the student who made the comment immediately.', best: false },
        { letter: 'D', text: 'Suggest she take a personal day and get a sub for the rest of the day.', best: false },
      ],
      researchSays:
        'Kraft and Papay (2014) found that the professional environment during a teacher\'s first 3 years predicts whether they stay in education permanently. "Shake it off" dismisses real pain and teaches her to hide instead of seek support. Addressing the student first makes it about discipline, not her development. Sending her home sends the message that she cannot handle the job. Covering her class, validating the moment, and scheduling a real debrief models what she should do for her own students: acknowledge, support, and follow up.',
      leadershipLens: 'Coaching Stance',
    },
    es: {
      context: 'Lunes, 9:50 AM. Cuarto de copias, entre el primer y segundo periodo.',
      scenario:
        'Entras al cuarto de copias y encuentras a una maestra de primer ano secandose las lagrimas. Dice que un estudiante le dijo "Eres la peor maestra que he tenido" frente a toda la clase. Tiene 22 estudiantes esperando su regreso en 4 minutos. Dice: "Tal vez tienen razon."',
      choices: [
        { letter: 'A', text: 'Decirle que se sobreponga, recordarle que lo esta haciendo bien y que regrese a clase.', best: false },
        { letter: 'B', text: 'Validar la emocion, preguntarle si necesita 5 minutos mas, cubrir su clase tu mismo/a y programar una conversacion para su periodo de planificacion.', best: true },
        { letter: 'C', text: 'Ir a su salon y hablar con el estudiante que hizo el comentario inmediatamente.', best: false },
        { letter: 'D', text: 'Sugerirle que tome un dia personal y conseguir un sustituto para el resto del dia.', best: false },
      ],
      researchSays:
        'Kraft y Papay (2014) encontraron que el ambiente profesional durante los primeros 3 anos de un/a maestro/a predice si permanecera en la educacion permanentemente. "Sobreponte" descarta el dolor real y le ensena a esconderse en lugar de buscar apoyo. Abordar al estudiante primero lo convierte en un tema de disciplina, no de su desarrollo. Enviarla a casa envia el mensaje de que no puede manejar el trabajo. Cubrir su clase, validar el momento y programar una conversacion real modela lo que ella deberia hacer con sus propios estudiantes: reconocer, apoyar y dar seguimiento.',
      leadershipLens: 'Postura de Coaching',
    },
  },

  // 5. Para on their phone
  {
    en: {
      context: 'Wednesday, 11:00 AM. Second grade classroom walkthrough.',
      scenario:
        'During a walkthrough, you see a paraprofessional sitting at the teacher\'s desk scrolling their phone while students work independently at their seats. The lead teacher is at a small group table and does not appear to notice. Two students near the para have stopped working and are drawing on their folders.',
      choices: [
        { letter: 'A', text: 'Walk over to the para, take their phone, and tell them to get up and circulate.', best: false },
        { letter: 'B', text: 'Quietly walk to the two off-task students and re-engage them yourself, modeling the behavior you want to see from the para.', best: false },
        { letter: 'C', text: 'Catch the para\'s eye, gesture toward the two students, and follow up privately after the lesson to reset expectations.', best: true },
        { letter: 'D', text: 'Email the lead teacher after the walkthrough and ask them to manage the para more closely.', best: false },
      ],
      researchSays:
        'Giangreco (2010) found that the most effective paraprofessional management happens through clear expectations, proximity, and private follow-up. Public correction in front of students damages the para\'s authority and the classroom dynamic. Modeling the behavior yourself helps the students but does not address the pattern. Emailing the teacher puts the accountability on the wrong person and avoids direct leadership. A discreet redirect in the moment, followed by a private, specific conversation about expectations, preserves dignity while changing behavior.',
      leadershipLens: 'Culture Setting',
    },
    es: {
      context: 'Miercoles, 11:00 AM. Recorrido por un salon de segundo grado.',
      scenario:
        'Durante un recorrido, ves a un/a paraprofesional sentado/a en el escritorio del maestro/a revisando su telefono mientras los estudiantes trabajan independientemente en sus asientos. La maestra principal esta en una mesa de grupo pequeno y no parece notarlo. Dos estudiantes cerca del/la para han dejado de trabajar y estan dibujando en sus carpetas.',
      choices: [
        { letter: 'A', text: 'Caminar hacia el/la para, quitarle el telefono y decirle que se levante y circule.', best: false },
        { letter: 'B', text: 'Caminar silenciosamente hacia los dos estudiantes fuera de tarea y re-involucrarlos tu mismo/a, modelando el comportamiento que quieres ver del/la para.', best: false },
        { letter: 'C', text: 'Captar la mirada del/la para, senalar hacia los dos estudiantes y dar seguimiento en privado despues de la leccion para reestablecer expectativas.', best: true },
        { letter: 'D', text: 'Enviar un correo a la maestra principal despues del recorrido y pedirle que maneje al/la para mas de cerca.', best: false },
      ],
      researchSays:
        'Giangreco (2010) encontro que el manejo mas efectivo de paraprofesionales ocurre a traves de expectativas claras, proximidad y seguimiento privado. La correccion publica frente a los estudiantes dana la autoridad del/la para y la dinamica del salon. Modelar el comportamiento tu mismo/a ayuda a los estudiantes pero no aborda el patron. Enviar correo a la maestra pone la responsabilidad en la persona equivocada y evita el liderazgo directo. Una redireccion discreta en el momento, seguida de una conversacion privada y especifica sobre expectativas, preserva la dignidad mientras cambia el comportamiento.',
      leadershipLens: 'Establecimiento de Cultura',
    },
  },

  // 6. Veteran teacher pushes back publicly
  {
    en: {
      context: 'Tuesday, 3:15 PM. Staff meeting, full faculty present.',
      scenario:
        'You just announced a new data review protocol that teachers will use during PLCs. A veteran teacher with 22 years of experience raises her hand and says, "This is just another initiative that will be gone in two years. I am not doing more paperwork that does not help my kids." Several teachers nod.',
      choices: [
        { letter: 'A', text: 'Thank her for her honesty, acknowledge the initiative fatigue is real, and ask the group what would make this protocol actually useful instead of performative.', best: true },
        { letter: 'B', text: 'Firmly redirect and say, "This is a district requirement and it is not optional."', best: false },
        { letter: 'C', text: 'Move on without acknowledging the comment to avoid giving it more airtime.', best: false },
        { letter: 'D', text: 'Meet with the veteran teacher privately after the meeting to ask her to support you publicly even if she disagrees.', best: false },
      ],
      researchSays:
        'Fullan (2007) found that implementation resistance is often a signal of legitimate concern, not insubordination. Shutting down a veteran in front of colleagues destroys psychological safety for the whole staff. Ignoring the comment makes you look weak and confirms her point. Pulling her aside after feels punitive and does not address the 10 other teachers who nodded. Thanking her publicly for honesty, naming the real concern (initiative fatigue), and inviting the group to shape the solution turns resistance into co-ownership. That is how lasting change takes root.',
      leadershipLens: 'Systems Thinking',
    },
    es: {
      context: 'Martes, 3:15 PM. Reunion de personal, todo el profesorado presente.',
      scenario:
        'Acabas de anunciar un nuevo protocolo de revision de datos que los maestros/as usaran durante los PLCs. Una maestra veterana con 22 anos de experiencia levanta la mano y dice: "Esta es solo otra iniciativa que desaparecera en dos anos. No voy a hacer mas papeleo que no ayuda a mis estudiantes." Varios maestros/as asienten con la cabeza.',
      choices: [
        { letter: 'A', text: 'Agradecerle su honestidad, reconocer que la fatiga de iniciativas es real, y preguntar al grupo que haria que este protocolo sea realmente util en lugar de performativo.', best: true },
        { letter: 'B', text: 'Redirigir firmemente y decir: "Este es un requisito del distrito y no es opcional."', best: false },
        { letter: 'C', text: 'Continuar sin reconocer el comentario para evitar darle mas atencion.', best: false },
        { letter: 'D', text: 'Reunirse con la maestra veterana en privado despues de la reunion para pedirle que te apoye publicamente aunque no este de acuerdo.', best: false },
      ],
      researchSays:
        'Fullan (2007) encontro que la resistencia a la implementacion es a menudo una senal de preocupacion legitima, no de insubordinacion. Silenciar a una veterana frente a colegas destruye la seguridad psicologica de todo el personal. Ignorar el comentario te hace ver debil y confirma su punto. Hablar con ella aparte despues se siente punitivo y no aborda a los otros 10 maestros/as que asintieron. Agradecerle publicamente por su honestidad, nombrar la preocupacion real (fatiga de iniciativas) e invitar al grupo a dar forma a la solucion convierte la resistencia en co-propiedad. Asi es como el cambio duradero echa raices.',
      leadershipLens: 'Pensamiento Sistemico',
    },
  },

  // 7. Three teachers call in sick, no subs
  {
    en: {
      context: 'Friday, 6:30 AM. Your phone, three missed calls.',
      scenario:
        'Three teachers called in sick on the same day. Your sub system shows zero available substitutes. The three classrooms serve a combined 72 students. Buses arrive in 45 minutes. Your AP is already covering morning duty.',
      choices: [
        { letter: 'A', text: 'Split the 72 students across other classrooms for the day.', best: false },
        { letter: 'B', text: 'Cancel specials (art, music, PE) and reassign those teachers to cover the three rooms.', best: false },
        { letter: 'C', text: 'Pull from multiple sources: you cover one class first period, combine two classes for a shared activity in the gym, rotate coverage using specials teachers, instructional coaches, and yourself throughout the day so no single person or class absorbs the full impact.', best: true },
        { letter: 'D', text: 'Send a mass email asking for teacher volunteers to give up their planning periods.', best: false },
      ],
      researchSays:
        'Research on teacher working conditions (Ladd, 2011) shows that how a principal handles coverage crises is one of the strongest signals of whether they protect or exploit their staff. Splitting 72 students into already full rooms guarantees no learning happens anywhere. Canceling specials punishes specialists and students who rely on those classes. Asking teachers to volunteer their planning period sounds optional but creates guilt pressure. A distributed coverage plan where the principal personally takes a classroom sends the most powerful message: we are in this together, and your planning time matters.',
      leadershipLens: 'Crisis Response',
    },
    es: {
      context: 'Viernes, 6:30 AM. Tu telefono, tres llamadas perdidas.',
      scenario:
        'Tres maestros/as llamaron enfermos/as el mismo dia. Tu sistema de sustitutos muestra cero sustitutos disponibles. Los tres salones atienden a un combinado de 72 estudiantes. Los autobuses llegan en 45 minutos. Tu subdirector/a ya esta cubriendo el deber de la manana.',
      choices: [
        { letter: 'A', text: 'Dividir a los 72 estudiantes entre otros salones por el dia.', best: false },
        { letter: 'B', text: 'Cancelar clases especiales (arte, musica, educacion fisica) y reasignar a esos maestros/as para cubrir los tres salones.', best: false },
        { letter: 'C', text: 'Recurrir a multiples fuentes: tu cubres una clase el primer periodo, combinas dos clases para una actividad compartida en el gimnasio, rotas la cobertura usando maestros/as de especialidades, coaches instruccionales y tu mismo/a durante el dia para que ninguna persona o clase absorba todo el impacto.', best: true },
        { letter: 'D', text: 'Enviar un correo masivo pidiendo voluntarios entre los maestros/as para que cedan sus periodos de planificacion.', best: false },
      ],
      researchSays:
        'La investigacion sobre condiciones laborales docentes (Ladd, 2011) muestra que como un/a director/a maneja las crisis de cobertura es una de las senales mas fuertes de si protege o explota a su personal. Dividir 72 estudiantes en salones ya llenos garantiza que no ocurra aprendizaje en ningun lado. Cancelar clases especiales castiga a los especialistas y estudiantes que dependen de esas clases. Pedir voluntarios para ceder su periodo de planificacion suena opcional pero crea presion por culpa. Un plan de cobertura distribuido donde el/la director/a personalmente toma un salon envia el mensaje mas poderoso: estamos juntos en esto, y tu tiempo de planificacion importa.',
      leadershipLens: 'Respuesta a Crisis',
    },
  },

  // 8. Negative social media post
  {
    en: {
      context: 'Thursday evening, 8:30 PM. Your phone notification.',
      scenario:
        'A parent posted a one-star review of your school on social media, tagging the district account. The post says, "My child is being bullied and the principal does NOTHING." It has 47 comments and 200+ shares. Three board members have already texted you. You know this parent. You have met with them twice about the situation and have an active safety plan in place.',
      choices: [
        { letter: 'A', text: 'Post a public response defending the school and outlining the steps you have taken.', best: false },
        { letter: 'B', text: 'Call the parent tonight to express concern, avoid discussing specifics online, and brief your superintendent first thing in the morning with a timeline of actions taken.', best: true },
        { letter: 'C', text: 'Ignore the post. Social media drama blows over and responding only amplifies it.', best: false },
        { letter: 'D', text: 'Forward the post to the district communications office and let them handle the response.', best: false },
      ],
      researchSays:
        'NASSP (2019) guidance on crisis communication emphasizes: respond to the person, not the platform. Posting publicly risks violating student privacy (FERPA) and invites more commentary. Ignoring it signals indifference to a parent in pain and lets the narrative grow unchecked. Handing it entirely to the district removes your voice as the building leader. Calling the parent directly shows you care about the child, not the optics. Briefing your superintendent with a clear action timeline protects you and demonstrates competence under pressure.',
      leadershipLens: 'Communication',
    },
    es: {
      context: 'Jueves por la noche, 8:30 PM. Notificacion en tu telefono.',
      scenario:
        'Un padre/madre publico una resena de una estrella de tu escuela en redes sociales, etiquetando la cuenta del distrito. La publicacion dice: "Mi hijo/a esta siendo acosado/a y el/la director/a NO HACE NADA." Tiene 47 comentarios y mas de 200 compartidos. Tres miembros de la junta ya te han enviado mensajes. Conoces a este padre/madre. Te has reunido con ellos dos veces sobre la situacion y tienes un plan de seguridad activo.',
      choices: [
        { letter: 'A', text: 'Publicar una respuesta publica defendiendo la escuela y describiendo los pasos que has tomado.', best: false },
        { letter: 'B', text: 'Llamar al padre/madre esta noche para expresar preocupacion, evitar discutir detalles en linea, e informar a tu superintendente a primera hora de la manana con un cronograma de acciones tomadas.', best: true },
        { letter: 'C', text: 'Ignorar la publicacion. El drama de redes sociales pasa y responder solo lo amplifica.', best: false },
        { letter: 'D', text: 'Reenviar la publicacion a la oficina de comunicaciones del distrito y dejar que ellos manejen la respuesta.', best: false },
      ],
      researchSays:
        'La guia de NASSP (2019) sobre comunicacion en crisis enfatiza: responde a la persona, no a la plataforma. Publicar publicamente arriesga violar la privacidad del estudiante (FERPA) e invita mas comentarios. Ignorarlo senala indiferencia hacia un padre/madre en dolor y deja que la narrativa crezca sin control. Entregarlo completamente al distrito elimina tu voz como lider del edificio. Llamar al padre/madre directamente muestra que te importa el/la nino/a, no la optica. Informar a tu superintendente con un cronograma claro de acciones te protege y demuestra competencia bajo presion.',
      leadershipLens: 'Comunicacion',
    },
  },

  // 9. Teacher giving everyone A's
  {
    en: {
      context: 'Monday, 2:00 PM. Your office, grade audit report on your desk.',
      scenario:
        'While reviewing quarterly grades, you discover that a popular teacher has given every student in all four sections an A, regardless of work completion or quality. Parent satisfaction surveys for this teacher are the highest in the building. Students love the class. When you look at the gradebook, half the assignments show no scores entered at all.',
      choices: [
        { letter: 'A', text: 'Confront the teacher in front of the grade-level team so everyone understands the expectation.', best: false },
        { letter: 'B', text: 'Meet privately, share the data without judgment, ask the teacher to explain their grading philosophy, and collaboratively build a plan that preserves rigor while honoring relationships.', best: true },
        { letter: 'C', text: 'Override the grades yourself and enter what you believe the students earned based on available work.', best: false },
        { letter: 'D', text: 'Let it go this quarter since parents are happy and student behavior in the class is excellent.', best: false },
      ],
      researchSays:
        'Brookhart (2011) and Guskey (2015) both document that grade inflation actively harms students by hiding skill gaps that compound over time. Ignoring it because parents are happy prioritizes comfort over student outcomes. Public confrontation destroys a teacher who may have good relational instincts but needs coaching on assessment. Overriding grades unilaterally removes teacher professional judgment and creates an adversarial relationship. A private, data-driven conversation that starts with curiosity ("tell me about your grading philosophy") is far more likely to produce lasting change than a mandate.',
      leadershipLens: 'Equity',
    },
    es: {
      context: 'Lunes, 2:00 PM. Tu oficina, reporte de auditoria de calificaciones en tu escritorio.',
      scenario:
        'Al revisar las calificaciones trimestrales, descubres que un/a maestro/a popular le ha dado a cada estudiante en las cuatro secciones una A, sin importar la finalizacion o calidad del trabajo. Las encuestas de satisfaccion de padres para este/a maestro/a son las mas altas del edificio. A los estudiantes les encanta la clase. Cuando revisas el libro de calificaciones, la mitad de las tareas no tienen calificaciones registradas.',
      choices: [
        { letter: 'A', text: 'Confrontar al/la maestro/a frente al equipo de grado para que todos entiendan la expectativa.', best: false },
        { letter: 'B', text: 'Reunirse en privado, compartir los datos sin juicio, pedir al/la maestro/a que explique su filosofia de calificacion, y construir colaborativamente un plan que preserve el rigor mientras honra las relaciones.', best: true },
        { letter: 'C', text: 'Anular las calificaciones tu mismo/a e ingresar lo que crees que los estudiantes ganaron basandote en el trabajo disponible.', best: false },
        { letter: 'D', text: 'Dejarlo pasar este trimestre ya que los padres estan contentos y el comportamiento estudiantil en la clase es excelente.', best: false },
      ],
      researchSays:
        'Brookhart (2011) y Guskey (2015) documentan que la inflacion de calificaciones dana activamente a los estudiantes al ocultar brechas de habilidades que se acumulan con el tiempo. Ignorarlo porque los padres estan contentos prioriza la comodidad sobre los resultados estudiantiles. La confrontacion publica destruye a un/a maestro/a que puede tener buenos instintos relacionales pero necesita coaching en evaluacion. Anular calificaciones unilateralmente elimina el juicio profesional del maestro/a y crea una relacion adversarial. Una conversacion privada, basada en datos, que comienza con curiosidad ("cuentame sobre tu filosofia de calificacion") tiene mucho mas probabilidades de producir cambio duradero que un mandato.',
      leadershipLens: 'Equidad',
    },
  },

  // 10. Superintendent wants new program by Monday
  {
    en: {
      context: 'Thursday, 4:15 PM. Phone call from central office.',
      scenario:
        'Your superintendent calls and says the district needs your building to pilot a new social-emotional learning program starting Monday. You receive a 40-page curriculum guide via email. Your teachers have had no training, no input, and no warning. The superintendent says, "I need you to make this happen. The board is watching."',
      choices: [
        { letter: 'A', text: 'Say yes, stay late to read the guide, and email teachers over the weekend with the new expectation.', best: false },
        { letter: 'B', text: 'Push back completely and tell the superintendent your building is not doing it.', best: false },
        { letter: 'C', text: 'Commit to launching by Monday, but negotiate the scope: start with one grade level, one component, and a 30-day feedback loop. Communicate to teachers with honesty about the timeline and your plan to protect their capacity.', best: true },
        { letter: 'D', text: 'Agree to the timeline but privately tell your teachers to just check the boxes and not worry about real implementation.', best: false },
      ],
      researchSays:
        'Implementation science (Fixsen et al., 2005) consistently shows that programs launched without staff buy-in, training, or staged rollout fail within the first year. Saying yes to everything protects your relationship with central office but burns your staff. Saying no outright is career-limiting and does not solve the problem. Telling teachers to fake it destroys integrity and models compliance theater. Negotiating scope (one grade, one component, feedback loop) demonstrates that you are both responsive to your superintendent and protective of your teachers. This is the leadership skill that separates managers from principals.',
      leadershipLens: 'Systems Thinking',
    },
    es: {
      context: 'Jueves, 4:15 PM. Llamada de la oficina central.',
      scenario:
        'Tu superintendente llama y dice que el distrito necesita que tu edificio sea piloto de un nuevo programa de aprendizaje socioemocional comenzando el lunes. Recibes una guia curricular de 40 paginas por correo electronico. Tus maestros/as no han tenido capacitacion, ni aporte, ni aviso previo. El superintendente dice: "Necesito que hagas que esto suceda. La junta esta observando."',
      choices: [
        { letter: 'A', text: 'Decir que si, quedarte tarde para leer la guia y enviar correo a los maestros/as durante el fin de semana con la nueva expectativa.', best: false },
        { letter: 'B', text: 'Rechazar completamente y decirle al superintendente que tu edificio no lo va a hacer.', best: false },
        { letter: 'C', text: 'Comprometerse a lanzar para el lunes, pero negociar el alcance: comenzar con un grado, un componente y un ciclo de retroalimentacion de 30 dias. Comunicar a los maestros/as con honestidad sobre el cronograma y tu plan para proteger su capacidad.', best: true },
        { letter: 'D', text: 'Aceptar el cronograma pero decirle en privado a tus maestros/as que solo marquen las casillas y no se preocupen por la implementacion real.', best: false },
      ],
      researchSays:
        'La ciencia de implementacion (Fixsen et al., 2005) muestra consistentemente que los programas lanzados sin aceptacion del personal, capacitacion o implementacion gradual fracasan dentro del primer ano. Decir si a todo protege tu relacion con la oficina central pero quema a tu personal. Decir no completamente limita tu carrera y no resuelve el problema. Decirle a los maestros/as que finjan destruye la integridad y modela teatro de cumplimiento. Negociar el alcance (un grado, un componente, ciclo de retroalimentacion) demuestra que eres receptivo/a a tu superintendente y protector/a de tus maestros/as. Esta es la habilidad de liderazgo que separa a los administradores de los directores.',
      leadershipLens: 'Pensamiento Sistemico',
    },
  },
];

export const PLAYBOOK_SCENARIO_COUNT = 10;
