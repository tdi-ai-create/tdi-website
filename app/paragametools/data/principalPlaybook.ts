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

  // 11. Teacher wants to skip required PD
  {
    en: {
      context: 'Wednesday, 7:30 AM. Your inbox, one new email.',
      scenario:
        'A math teacher emails you the morning of a required professional development session on culturally responsive teaching. She writes, "I teach algebra. This PD has nothing to do with my content area. Can I use this time to grade instead? I am already behind." Two other math teachers have been CC\'d.',
      choices: [
        { letter: 'A', text: 'Reply that PD is mandatory and she needs to attend. No exceptions.', best: false },
        { letter: 'B', text: 'Grant the exception since she makes a reasonable point about content relevance.', best: false },
        { letter: 'C', text: 'Reply privately, acknowledge the grading pressure, and share a specific example of how the PD connects to her math classroom. Offer to debrief with her afterward.', best: true },
        { letter: 'D', text: 'Forward the email to the PD facilitator and ask them to address the concern.', best: false },
      ],
      researchSays:
        'Hammond (2015) in "Culturally Responsive Teaching and the Brain" demonstrates that culturally responsive practices are not content-specific but apply to every classroom interaction, including how math problems are framed and whose experiences are centered. Mandating attendance without connection breeds compliance theater. Granting exceptions signals the PD is not important. Forwarding the concern makes the facilitator responsible for the principal\'s culture. A private, specific reply that connects the PD to her reality shows instructional leadership and models the learning stance you want from your staff.',
      leadershipLens: 'Instructional Leadership',
    },
    es: {
      context: 'Miercoles, 7:30 AM. Tu bandeja de entrada, un correo nuevo.',
      scenario:
        'Una maestra de matematicas te envia un correo la manana de una sesion obligatoria de desarrollo profesional sobre ensenanza culturalmente responsiva. Escribe: "Yo enseno algebra. Este PD no tiene nada que ver con mi area de contenido. Puedo usar este tiempo para calificar? Ya estoy atrasada." Dos otros maestros de matematicas han sido copiados.',
      choices: [
        { letter: 'A', text: 'Responder que el PD es obligatorio y que necesita asistir. Sin excepciones.', best: false },
        { letter: 'B', text: 'Conceder la excepcion ya que tiene un punto razonable sobre la relevancia del contenido.', best: false },
        { letter: 'C', text: 'Responder en privado, reconocer la presion de calificacion y compartir un ejemplo especifico de como el PD se conecta con su salon de matematicas. Ofrecer conversar con ella despues.', best: true },
        { letter: 'D', text: 'Reenviar el correo al facilitador del PD y pedirle que aborde la preocupacion.', best: false },
      ],
      researchSays:
        'Hammond (2015) en "Culturally Responsive Teaching and the Brain" demuestra que las practicas culturalmente responsivas no son especificas del contenido sino que aplican a cada interaccion en el salon, incluyendo como se enmarcan los problemas de matematicas y de quien son las experiencias que se centran. Mandatar asistencia sin conexion genera teatro de cumplimiento. Conceder excepciones senala que el PD no es importante. Reenviar la preocupacion hace al facilitador responsable de la cultura del director. Una respuesta privada y especifica que conecte el PD con su realidad muestra liderazgo instruccional y modela la postura de aprendizaje que quieres de tu personal.',
      leadershipLens: 'Liderazgo Instruccional',
    },
  },

  // 12. Teacher using sarcasm with a student
  {
    en: {
      context: 'Thursday, 11:20 AM. Hallway outside the cafeteria.',
      scenario:
        'You are walking to the cafeteria when you overhear a teacher say to a sixth grader, "Oh, you forgot your homework again? What a surprise. Maybe if you spent less time on your phone and more time actually trying, we would not be having this conversation every single day." The student looks down and walks away. Three other students witnessed it.',
      choices: [
        { letter: 'A', text: 'Step in immediately and correct the teacher in front of the students.', best: false },
        { letter: 'B', text: 'Check on the student first. Then meet with the teacher privately the same day, name the specific language you heard, and discuss the impact of sarcasm on student trust.', best: true },
        { letter: 'C', text: 'Let it go this time. Teachers get frustrated and it was not that serious.', best: false },
        { letter: 'D', text: 'Send an all-staff email about professional communication expectations without naming the teacher.', best: false },
      ],
      researchSays:
        'Hattie (2009) identifies teacher-student relationships as having a 0.72 effect size on student achievement, among the highest of all factors studied. Sarcasm from an authority figure activates threat responses in the adolescent brain (Jensen & McConchie, 2020), shutting down learning readiness. Public correction of the teacher mirrors the exact behavior you are trying to stop. A generic email avoids accountability entirely. Checking on the student first models the priority (student wellbeing), and a specific, private conversation with the teacher preserves their dignity while making the expectation clear.',
      leadershipLens: 'Culture Setting',
    },
    es: {
      context: 'Jueves, 11:20 AM. Pasillo fuera de la cafeteria.',
      scenario:
        'Estas caminando hacia la cafeteria cuando escuchas a un/a maestro/a decirle a un estudiante de sexto grado: "Oh, olvidaste tu tarea otra vez? Que sorpresa. Tal vez si pasaras menos tiempo en tu telefono y mas tiempo realmente intentando, no estariamos teniendo esta conversacion todos los dias." El estudiante baja la mirada y se aleja. Tres otros estudiantes lo presenciaron.',
      choices: [
        { letter: 'A', text: 'Intervenir inmediatamente y corregir al/la maestro/a frente a los estudiantes.', best: false },
        { letter: 'B', text: 'Verificar primero como esta el estudiante. Luego reunirse con el/la maestro/a en privado el mismo dia, nombrar el lenguaje especifico que escuchaste y discutir el impacto del sarcasmo en la confianza estudiantil.', best: true },
        { letter: 'C', text: 'Dejarlo pasar esta vez. Los maestros/as se frustran y no fue tan serio.', best: false },
        { letter: 'D', text: 'Enviar un correo a todo el personal sobre expectativas de comunicacion profesional sin nombrar al/la maestro/a.', best: false },
      ],
      researchSays:
        'Hattie (2009) identifica las relaciones maestro-estudiante con un tamano de efecto de 0.72 en el rendimiento estudiantil, entre los mas altos de todos los factores estudiados. El sarcasmo de una figura de autoridad activa respuestas de amenaza en el cerebro adolescente (Jensen y McConchie, 2020), apagando la disposicion para aprender. La correccion publica del maestro/a refleja exactamente el comportamiento que intentas detener. Un correo generico evita la rendicion de cuentas por completo. Verificar primero al estudiante modela la prioridad (bienestar estudiantil), y una conversacion especifica y privada con el/la maestro/a preserva su dignidad mientras aclara la expectativa.',
      leadershipLens: 'Establecimiento de Cultura',
    },
  },

  // 13. Custodian reports teacher leaves room trashed
  {
    en: {
      context: 'Friday, 3:45 PM. Custodian catches you in the parking lot.',
      scenario:
        'Your head custodian pulls you aside and says, "I need to talk to you about Room 204. Every single day, that teacher leaves the room like a disaster zone. Food on the floor, chairs not stacked, whiteboard covered in marker. I have asked her three times and she just laughs and says that is what I get paid for. My team is tired of it."',
      choices: [
        { letter: 'A', text: 'Thank the custodian, walk to Room 204 to see it yourself, and schedule a direct conversation with the teacher on Monday that names the specific behaviors and their impact on the custodial team.', best: true },
        { letter: 'B', text: 'Tell the custodian you will send an all-staff reminder about room expectations.', best: false },
        { letter: 'C', text: 'Ask the custodian to document the issue with photos and submit a formal complaint.', best: false },
        { letter: 'D', text: 'Reassign the custodian to a different section of the building so they do not have to deal with that room.', best: false },
      ],
      researchSays:
        'Research on organizational respect (Rogers & Ashforth, 2017) shows that how leaders respond when classified staff report mistreatment defines the real culture of a building, not the mission statement on the wall. A generic email protects the teacher and dismisses the custodian. Asking the custodian to document puts the burden on the person with less power. Reassigning avoids the problem entirely and rewards the bad behavior. Going to see the room yourself and having a direct, private conversation with the teacher communicates that every adult in the building deserves respect, regardless of role.',
      leadershipLens: 'Equity',
    },
    es: {
      context: 'Viernes, 3:45 PM. El conserje principal te encuentra en el estacionamiento.',
      scenario:
        'Tu conserje principal te llama aparte y dice: "Necesito hablarte sobre el salon 204. Todos los dias, esa maestra deja el salon como zona de desastre. Comida en el piso, sillas sin apilar, pizarra cubierta de marcador. Le he pedido tres veces y solo se rie y dice que para eso me pagan. Mi equipo esta cansado."',
      choices: [
        { letter: 'A', text: 'Agradecer al conserje, ir al salon 204 para verlo tu mismo/a y programar una conversacion directa con la maestra el lunes que nombre los comportamientos especificos y su impacto en el equipo de conserjeria.', best: true },
        { letter: 'B', text: 'Decirle al conserje que enviaras un recordatorio a todo el personal sobre las expectativas del salon.', best: false },
        { letter: 'C', text: 'Pedirle al conserje que documente el problema con fotos y presente una queja formal.', best: false },
        { letter: 'D', text: 'Reasignar al conserje a una seccion diferente del edificio para que no tenga que lidiar con ese salon.', best: false },
      ],
      researchSays:
        'La investigacion sobre respeto organizacional (Rogers y Ashforth, 2017) muestra que como los lideres responden cuando el personal clasificado reporta maltrato define la cultura real de un edificio, no la declaracion de mision en la pared. Un correo generico protege a la maestra y descarta al conserje. Pedirle al conserje que documente pone la carga en la persona con menos poder. Reasignar evita el problema por completo y recompensa el mal comportamiento. Ir a ver el salon tu mismo/a y tener una conversacion directa y privada con la maestra comunica que cada adulto en el edificio merece respeto, sin importar su rol.',
      leadershipLens: 'Equidad',
    },
  },

  // 14. Two parents arguing in the front office
  {
    en: {
      context: 'Monday, 7:50 AM. Front office, buses arriving.',
      scenario:
        'Two parents are standing in the front office arguing loudly about a weekend incident between their children. One parent is pointing at the other and saying, "Your kid is a bully and you are the reason why." Students are walking past the office and can hear everything. Your front desk secretary has frozen, unsure what to do.',
      choices: [
        { letter: 'A', text: 'Call school security to escort both parents out of the building.', best: false },
        { letter: 'B', text: 'Step between them, calmly introduce yourself, acknowledge their frustration, and walk each parent to a separate space. Tell them you will meet with each one individually within the hour.', best: true },
        { letter: 'C', text: 'Ask both parents to come to your office together to talk it out right now.', best: false },
        { letter: 'D', text: 'Let the front desk handle it. It is not a principal-level issue yet.', best: false },
      ],
      researchSays:
        'De-escalation research (Crisis Prevention Institute, 2019) emphasizes three principles: remove the audience, separate the parties, and validate emotions before problem-solving. Calling security first escalates the situation and humiliates both parents. Putting two angry people in one room without cooling time invites further conflict. Ignoring it while students watch normalizes aggression and puts your front desk staff in an impossible position. Physical presence from the principal, calm redirection to separate spaces, and a clear timeline for follow-up restores safety and demonstrates that you take both families seriously.',
      leadershipLens: 'Crisis Response',
    },
    es: {
      context: 'Lunes, 7:50 AM. Oficina principal, autobuses llegando.',
      scenario:
        'Dos padres/madres estan parados en la oficina principal discutiendo en voz alta sobre un incidente del fin de semana entre sus hijos. Un padre/madre senala al otro y dice: "Tu hijo/a es un acosador/a y tu eres la razon." Los estudiantes pasan por la oficina y pueden escuchar todo. Tu secretaria de recepcion se ha paralizado, sin saber que hacer.',
      choices: [
        { letter: 'A', text: 'Llamar a seguridad escolar para escoltar a ambos padres fuera del edificio.', best: false },
        { letter: 'B', text: 'Colocarte entre ellos, presentarte con calma, reconocer su frustracion y llevar a cada padre/madre a un espacio separado. Decirles que te reuniras con cada uno individualmente dentro de la hora.', best: true },
        { letter: 'C', text: 'Pedir a ambos padres/madres que vengan a tu oficina juntos para hablar ahora mismo.', best: false },
        { letter: 'D', text: 'Dejar que la recepcion lo maneje. Aun no es un asunto a nivel de director/a.', best: false },
      ],
      researchSays:
        'La investigacion de desescalamiento (Crisis Prevention Institute, 2019) enfatiza tres principios: remover la audiencia, separar a las partes y validar emociones antes de resolver problemas. Llamar a seguridad primero escala la situacion y humilla a ambos padres. Poner a dos personas enojadas en un salon sin tiempo de enfriamiento invita a mas conflicto. Ignorarlo mientras los estudiantes observan normaliza la agresion y pone a tu personal de recepcion en una posicion imposible. La presencia fisica del director/a, la redireccion calmada a espacios separados y un cronograma claro para seguimiento restaura la seguridad y demuestra que tomas a ambas familias en serio.',
      leadershipLens: 'Respuesta a Crisis',
    },
  },

  // 15. Looping controversy with parent objection
  {
    en: {
      context: 'Thursday, 4:00 PM. Conference room, end-of-year planning.',
      scenario:
        'A third-grade team of three teachers wants to loop with their students into fourth grade. They have strong relationships and data showing academic growth. However, one parent has emailed you saying, "My daughter needs a fresh start. This teacher and my child do not click, and I do not want another year of the same." The teachers feel strongly that looping benefits the whole group.',
      choices: [
        { letter: 'A', text: 'Override the parent and approve looping for the whole team since the data supports it.', best: false },
        { letter: 'B', text: 'Cancel looping entirely to avoid conflict with the one parent.', best: false },
        { letter: 'C', text: 'Approve looping for the team, but meet with the parent to discuss options for their child, including a possible class reassignment that respects both the looping structure and the family\'s concerns.', best: true },
        { letter: 'D', text: 'Tell the teachers that looping is too complicated and to just follow the normal class assignment process.', best: false },
      ],
      researchSays:
        'Research on looping (Grant et al., 1996; Cistone et al., 2004) shows consistent benefits including stronger relationships, reduced transition anxiety, and improved achievement, particularly for students from under-resourced backgrounds. However, Epstein (2001) emphasizes that family voice in educational decisions is a predictor of sustained engagement. Overriding the parent damages the relationship and ignores a real concern. Canceling the whole initiative for one objection punishes the majority. A both/and approach that preserves looping while creating a respectful pathway for the family honors the research and the relationship simultaneously.',
      leadershipLens: 'Communication',
    },
    es: {
      context: 'Jueves, 4:00 PM. Sala de conferencias, planificacion de fin de ano.',
      scenario:
        'Un equipo de tres maestras de tercer grado quiere hacer looping con sus estudiantes a cuarto grado. Tienen relaciones fuertes y datos que muestran crecimiento academico. Sin embargo, un padre/madre te ha enviado un correo diciendo: "Mi hija necesita un nuevo comienzo. Esta maestra y mi hija no conectan, y no quiero otro ano de lo mismo." Las maestras sienten firmemente que el looping beneficia a todo el grupo.',
      choices: [
        { letter: 'A', text: 'Anular al padre/madre y aprobar el looping para todo el equipo ya que los datos lo respaldan.', best: false },
        { letter: 'B', text: 'Cancelar el looping por completo para evitar conflicto con ese padre/madre.', best: false },
        { letter: 'C', text: 'Aprobar el looping para el equipo, pero reunirse con el padre/madre para discutir opciones para su hija, incluyendo una posible reasignacion de clase que respete tanto la estructura de looping como las preocupaciones de la familia.', best: true },
        { letter: 'D', text: 'Decirle a las maestras que el looping es muy complicado y que sigan el proceso normal de asignacion de clases.', best: false },
      ],
      researchSays:
        'La investigacion sobre looping (Grant et al., 1996; Cistone et al., 2004) muestra beneficios consistentes incluyendo relaciones mas fuertes, ansiedad de transicion reducida y mejora en el rendimiento, particularmente para estudiantes de contextos con menos recursos. Sin embargo, Epstein (2001) enfatiza que la voz familiar en decisiones educativas es un predictor de compromiso sostenido. Anular al padre/madre dana la relacion e ignora una preocupacion real. Cancelar toda la iniciativa por una objecion castiga a la mayoria. Un enfoque que preserve el looping mientras crea un camino respetuoso para la familia honra la investigacion y la relacion simultaneamente.',
      leadershipLens: 'Comunicacion',
    },
  },

  // 16. AP handles discipline differently than you would
  {
    en: {
      context: 'Tuesday, 1:30 PM. Your office, reviewing discipline logs.',
      scenario:
        'You review the morning discipline log and see that your assistant principal gave a three-day out-of-school suspension to a seventh grader for a verbal altercation with a teacher. The student has an IEP with a behavior plan that calls for restorative conversation first. The AP followed the standard discipline code to the letter, but ignored the IEP protocol. The parent has not been notified yet.',
      choices: [
        { letter: 'A', text: 'Reverse the suspension yourself and notify the parent with the corrected consequence.', best: false },
        { letter: 'B', text: 'Meet with the AP first, walk through the IEP requirement together, let the AP make the correction and call the parent, and use this as a coaching conversation about the intersection of discipline and special education law.', best: true },
        { letter: 'C', text: 'Let the suspension stand. The AP made a judgment call and undermining them hurts their authority.', best: false },
        { letter: 'D', text: 'Email the AP a reminder about IEP protocols and ask them to check the file before future referrals.', best: false },
      ],
      researchSays:
        'IDEA (Individuals with Disabilities Education Act) requires that discipline for students with IEPs considers their behavior intervention plan before applying standard consequences. Ignoring this is not just a leadership concern but a legal compliance issue (Yell et al., 2006). Reversing the decision without involving the AP undermines their development and does not build their capacity. Letting it stand exposes the school to due process complaints. An email is too passive for a compliance issue. Meeting with the AP, coaching through the error, and letting them make the correction builds competence, preserves authority, and protects the student.',
      leadershipLens: 'Coaching Stance',
    },
    es: {
      context: 'Martes, 1:30 PM. Tu oficina, revisando registros de disciplina.',
      scenario:
        'Revisas el registro de disciplina de la manana y ves que tu subdirector/a dio una suspension fuera de la escuela de tres dias a un estudiante de septimo grado por una altercacion verbal con un/a maestro/a. El estudiante tiene un IEP con un plan de comportamiento que requiere una conversacion restaurativa primero. El/la subdirector/a siguio el codigo de disciplina estandar al pie de la letra, pero ignoro el protocolo del IEP. El padre/madre aun no ha sido notificado/a.',
      choices: [
        { letter: 'A', text: 'Revertir la suspension tu mismo/a y notificar al padre/madre con la consecuencia corregida.', best: false },
        { letter: 'B', text: 'Reunirse primero con el/la subdirector/a, revisar juntos el requisito del IEP, dejar que el/la subdirector/a haga la correccion y llame al padre/madre, y usar esto como una conversacion de coaching sobre la interseccion de disciplina y ley de educacion especial.', best: true },
        { letter: 'C', text: 'Dejar que la suspension se mantenga. El/la subdirector/a tomo una decision y desautorizarla dana su autoridad.', best: false },
        { letter: 'D', text: 'Enviar un correo al/la subdirector/a con un recordatorio sobre protocolos de IEP y pedirle que revise el archivo antes de futuras referencias.', best: false },
      ],
      researchSays:
        'IDEA (Ley de Educacion para Individuos con Discapacidades) requiere que la disciplina para estudiantes con IEP considere su plan de intervencion de comportamiento antes de aplicar consecuencias estandar. Ignorar esto no es solo una preocupacion de liderazgo sino un problema de cumplimiento legal (Yell et al., 2006). Revertir la decision sin involucrar al/la subdirector/a socava su desarrollo y no construye su capacidad. Dejar que se mantenga expone a la escuela a quejas de debido proceso. Un correo es demasiado pasivo para un problema de cumplimiento. Reunirse con el/la subdirector/a, entrenar a traves del error y dejarlo/a hacer la correccion construye competencia, preserva la autoridad y protege al estudiante.',
      leadershipLens: 'Postura de Coaching',
    },
  },

  // 17. Student discloses concerning home situation
  {
    en: {
      context: 'Wednesday, 12:15 PM. Hallway near the gym.',
      scenario:
        'A fourth grader stops you in the hallway and says, "My mom\'s boyfriend yells really loud at night and sometimes things break. I did not sleep last night because I was scared." The student is calm but has dark circles under their eyes. The bell rings in 3 minutes and students are flowing past.',
      choices: [
        { letter: 'A', text: 'Tell the student everything will be okay and walk them back to class.', best: false },
        { letter: 'B', text: 'Kneel to the student\'s level, thank them for trusting you, walk them to the counselor, and file a report with your designated child protective services contact within the hour. Document what the student said using their exact words.', best: true },
        { letter: 'C', text: 'Ask the student more detailed questions about what happens at home to determine if a report is necessary.', best: false },
        { letter: 'D', text: 'Call the parent to ask about the home situation before deciding whether to report.', best: false },
      ],
      researchSays:
        'All 50 states designate school administrators as mandated reporters (Child Welfare Information Gateway, 2019). The legal and ethical obligation is to report, not to investigate. Asking probing questions risks re-traumatizing the child and contaminating a potential investigation. Calling the parent alerts a potential perpetrator. Dismissing the disclosure teaches the child that adults cannot be trusted with hard truths. The correct sequence is: validate, secure the child with a trained professional (counselor), report to CPS using the child\'s exact language, and document. This is not discretionary.',
      leadershipLens: 'Student Safety',
    },
    es: {
      context: 'Miercoles, 12:15 PM. Pasillo cerca del gimnasio.',
      scenario:
        'Un estudiante de cuarto grado te detiene en el pasillo y dice: "El novio de mi mama grita muy fuerte en la noche y a veces se rompen cosas. No dormi anoche porque tenia miedo." El estudiante esta tranquilo pero tiene ojeras. El timbre suena en 3 minutos y los estudiantes pasan por el pasillo.',
      choices: [
        { letter: 'A', text: 'Decirle al estudiante que todo estara bien y acompanarlo de regreso a clase.', best: false },
        { letter: 'B', text: 'Arrodillarte al nivel del estudiante, agradecerle por confiar en ti, acompanarlo al consejero y presentar un reporte con tu contacto designado de servicios de proteccion infantil dentro de la hora. Documentar lo que dijo el estudiante usando sus palabras exactas.', best: true },
        { letter: 'C', text: 'Hacerle al estudiante preguntas mas detalladas sobre lo que pasa en casa para determinar si es necesario reportar.', best: false },
        { letter: 'D', text: 'Llamar al padre/madre para preguntar sobre la situacion en casa antes de decidir si reportar.', best: false },
      ],
      researchSays:
        'Los 50 estados designan a los administradores escolares como reporteros obligatorios (Child Welfare Information Gateway, 2019). La obligacion legal y etica es reportar, no investigar. Hacer preguntas detalladas arriesga re-traumatizar al nino/a y contaminar una investigacion potencial. Llamar al padre/madre alerta a un posible perpetrador. Desestimar la revelacion le ensena al nino/a que los adultos no son confiables con verdades dificiles. La secuencia correcta es: validar, asegurar al nino/a con un profesional capacitado (consejero), reportar a CPS usando el lenguaje exacto del nino/a y documentar. Esto no es discrecional.',
      leadershipLens: 'Seguridad Estudiantil',
    },
  },

  // 18. Reporter calls about a school incident
  {
    en: {
      context: 'Friday, 2:45 PM. Your desk phone rings.',
      scenario:
        'A local TV reporter calls and says, "We received a tip that there was a lockdown at your school this morning. Can you confirm what happened and whether any students were harmed?" There was a brief lockdown due to a report of a suspicious person near the building who turned out to be a utility worker. No students were in danger. Parents were notified via the school messaging system. The reporter is pressing for an on-camera interview.',
      choices: [
        { letter: 'A', text: 'Give the reporter a full account to control the narrative before it gets distorted.', best: false },
        { letter: 'B', text: 'Say "no comment" and hang up.', best: false },
        { letter: 'C', text: 'Thank the reporter for calling, confirm the basic facts (brief lockdown, resolved safely, families notified), decline the on-camera interview, and direct them to the district communications office for any further questions.', best: true },
        { letter: 'D', text: 'Refer the reporter to the district communications office without confirming or denying anything.', best: false },
      ],
      researchSays:
        'NSPRA (National School Public Relations Association, 2020) recommends that principals confirm known facts, stay in their lane, and route detailed inquiries to the district. "No comment" invites speculation and looks evasive. A full interview without district coordination risks missteps and inconsistent messaging. Pure deflection without any confirmation forces the reporter to run with unverified tips. Confirming basic facts, expressing that safety is the priority, and routing to the district shows competence and transparency while staying within your authority.',
      leadershipLens: 'Community Relations',
    },
    es: {
      context: 'Viernes, 2:45 PM. Suena tu telefono de escritorio.',
      scenario:
        'Un reportero de TV local llama y dice: "Recibimos un aviso de que hubo un cierre de emergencia en su escuela esta manana. Puede confirmar que paso y si algun estudiante resulto danado?" Hubo un breve cierre debido a un reporte de una persona sospechosa cerca del edificio que resulto ser un trabajador de servicios publicos. Ningun estudiante estuvo en peligro. Los padres fueron notificados via el sistema de mensajeria de la escuela. El reportero insiste en una entrevista ante camara.',
      choices: [
        { letter: 'A', text: 'Darle al reportero un relato completo para controlar la narrativa antes de que se distorsione.', best: false },
        { letter: 'B', text: 'Decir "sin comentarios" y colgar.', best: false },
        { letter: 'C', text: 'Agradecer al reportero por llamar, confirmar los hechos basicos (breve cierre, resuelto de manera segura, familias notificadas), declinar la entrevista ante camara y dirigirlos a la oficina de comunicaciones del distrito para cualquier pregunta adicional.', best: true },
        { letter: 'D', text: 'Referir al reportero a la oficina de comunicaciones del distrito sin confirmar ni negar nada.', best: false },
      ],
      researchSays:
        'NSPRA (Asociacion Nacional de Relaciones Publicas Escolares, 2020) recomienda que los directores confirmen hechos conocidos, se mantengan en su ambito y dirijan consultas detalladas al distrito. "Sin comentarios" invita a la especulacion y se ve evasivo. Una entrevista completa sin coordinacion del distrito arriesga errores y mensajes inconsistentes. La desviacion pura sin ninguna confirmacion obliga al reportero a trabajar con avisos no verificados. Confirmar hechos basicos, expresar que la seguridad es la prioridad y dirigir al distrito muestra competencia y transparencia mientras se mantiene dentro de tu autoridad.',
      leadershipLens: 'Relaciones Comunitarias',
    },
  },

  // 19. High performer who is toxic in the lounge
  {
    en: {
      context: 'Monday, 11:45 AM. Teacher workroom, you walk in to refill your coffee.',
      scenario:
        'You enter the teacher workroom and catch the tail end of a conversation. Your highest performing teacher, the one with the best test scores and the strongest parent reviews, is saying to a group, "The new reading curriculum is a joke. I am just going to keep doing what I have always done. If admin wants to waste our time, that is their problem." Two newer teachers look uncomfortable but nod along. The room goes quiet when they see you.',
      choices: [
        { letter: 'A', text: 'Address it right there in the workroom so everyone hears the expectation.', best: false },
        { letter: 'B', text: 'Ignore it. Her results speak for themselves and you cannot afford to lose her.', best: false },
        { letter: 'C', text: 'Refill your coffee calmly, then schedule a private meeting for later that day. In the meeting, name the specific comment, explain the impact on new teachers, and position her expertise as an asset by asking her to pilot feedback on the curriculum rather than undermine it publicly.', best: true },
        { letter: 'D', text: 'Talk to the two newer teachers privately and tell them not to follow her lead on this.', best: false },
      ],
      researchSays:
        'Grenny et al. (2013) in "Crucial Conversations" document that high performers with toxic influence cause more cultural damage than low performers, because their competence gives their negativity credibility. Ignoring it because of results sends the message that performance buys permission to undermine leadership. Public confrontation creates a martyr. Coaching the junior teachers without addressing the source treats the symptom. A private meeting that names the specific behavior, acknowledges her expertise, and redirects her influence toward constructive channels treats her as a leader worth investing in while drawing a clear line.',
      leadershipLens: 'Trust Building',
    },
    es: {
      context: 'Lunes, 11:45 AM. Sala de maestros, entras a rellenar tu cafe.',
      scenario:
        'Entras a la sala de maestros y escuchas el final de una conversacion. Tu maestra de mayor rendimiento, la que tiene los mejores puntajes en examenes y las resenas de padres mas fuertes, le dice a un grupo: "El nuevo curriculo de lectura es una broma. Voy a seguir haciendo lo que siempre he hecho. Si la administracion quiere perder nuestro tiempo, ese es su problema." Dos maestras nuevas se ven incomodas pero asienten. La sala se queda en silencio cuando te ven.',
      choices: [
        { letter: 'A', text: 'Abordarlo ahi mismo en la sala de maestros para que todos escuchen la expectativa.', best: false },
        { letter: 'B', text: 'Ignorarlo. Sus resultados hablan por si mismos y no puedes permitirte perderla.', best: false },
        { letter: 'C', text: 'Rellenar tu cafe con calma, luego programar una reunion privada para mas tarde ese dia. En la reunion, nombrar el comentario especifico, explicar el impacto en las maestras nuevas y posicionar su experiencia como un activo pidiendole que lidere retroalimentacion piloto sobre el curriculo en lugar de socavarlo publicamente.', best: true },
        { letter: 'D', text: 'Hablar con las dos maestras nuevas en privado y decirles que no sigan su ejemplo en esto.', best: false },
      ],
      researchSays:
        'Grenny et al. (2013) en "Crucial Conversations" documentan que los de alto rendimiento con influencia toxica causan mas dano cultural que los de bajo rendimiento, porque su competencia le da credibilidad a su negatividad. Ignorarlo por los resultados envia el mensaje de que el rendimiento compra permiso para socavar el liderazgo. La confrontacion publica crea un martir. Entrenar a las maestras junior sin abordar la fuente trata el sintoma. Una reunion privada que nombre el comportamiento especifico, reconozca su experiencia y redirija su influencia hacia canales constructivos la trata como una lider que vale la pena invertir en ella mientras traza una linea clara.',
      leadershipLens: 'Construccion de Confianza',
    },
  },

  // 20. Budget cuts force elimination of extracurricular
  {
    en: {
      context: 'Wednesday, 4:30 PM. Your office, budget spreadsheet open.',
      scenario:
        'Budget cuts require you to eliminate one extracurricular program. You must choose between the robotics club (12 students, strong STEM impact, coached by a teacher willing to volunteer), the after-school tutoring program (40 students, mostly free/reduced lunch, run by a paid coordinator), and the school newspaper (8 students, high engagement, coached by your best English teacher). All three coaches are waiting outside your door for your answer.',
      choices: [
        { letter: 'A', text: 'Cut the program with the fewest students since it impacts the least people.', best: false },
        { letter: 'B', text: 'Meet with all three coaches together, share the budget reality transparently, present the enrollment and impact data, and ask them to help you find a solution before you make a unilateral decision. Explore alternatives like shared funding, volunteer conversion, or community sponsorship.', best: true },
        { letter: 'C', text: 'Keep the tutoring program because it serves the most vulnerable students and cut the other two.', best: false },
        { letter: 'D', text: 'Send the decision to the district office and ask them to choose which program to cut.', best: false },
      ],
      researchSays:
        'Leithwood and Riehl (2003) identify transparent decision-making and shared leadership as hallmarks of effective principals. Cutting by headcount alone ignores equity and impact. Making the "right" choice unilaterally robs the community of voice and misses creative solutions. Passing the decision to the district abdicates local leadership. Bringing the coaches into the process with real data, real constraints, and real options builds ownership and often surfaces solutions (community sponsors, grant funding, volunteer transitions) that a solo decision never would. The hardest leadership is not making the call. It is making the process worthy of the people affected.',
      leadershipLens: 'Distributed Leadership',
    },
    es: {
      context: 'Miercoles, 4:30 PM. Tu oficina, hoja de calculo del presupuesto abierta.',
      scenario:
        'Los recortes presupuestarios requieren que elimines un programa extracurricular. Debes elegir entre el club de robotica (12 estudiantes, fuerte impacto STEM, dirigido por un maestro dispuesto a ser voluntario), el programa de tutoria despues de clases (40 estudiantes, mayoria almuerzo gratis/reducido, dirigido por un coordinador pagado) y el periodico escolar (8 estudiantes, alto compromiso, dirigido por tu mejor maestro de ingles). Los tres entrenadores estan esperando fuera de tu puerta por tu respuesta.',
      choices: [
        { letter: 'A', text: 'Cortar el programa con menos estudiantes ya que impacta a menos personas.', best: false },
        { letter: 'B', text: 'Reunirse con los tres entrenadores juntos, compartir la realidad presupuestaria con transparencia, presentar los datos de inscripcion e impacto, y pedirles que ayuden a encontrar una solucion antes de tomar una decision unilateral. Explorar alternativas como financiamiento compartido, conversion a voluntariado o patrocinio comunitario.', best: true },
        { letter: 'C', text: 'Mantener el programa de tutoria porque sirve a los estudiantes mas vulnerables y cortar los otros dos.', best: false },
        { letter: 'D', text: 'Enviar la decision a la oficina del distrito y pedirles que elijan cual programa cortar.', best: false },
      ],
      researchSays:
        'Leithwood y Riehl (2003) identifican la toma de decisiones transparente y el liderazgo compartido como marcas de directores efectivos. Cortar solo por numero de participantes ignora la equidad y el impacto. Tomar la decision "correcta" unilateralmente roba la voz de la comunidad y pierde soluciones creativas. Pasar la decision al distrito abdica del liderazgo local. Traer a los entrenadores al proceso con datos reales, restricciones reales y opciones reales construye propiedad y a menudo revela soluciones (patrocinadores comunitarios, financiamiento por subvenciones, transiciones a voluntariado) que una decision solitaria nunca lograria. El liderazgo mas dificil no es tomar la decision. Es hacer que el proceso sea digno de las personas afectadas.',
      leadershipLens: 'Liderazgo Distribuido',
    },
  },

  // 21. New teacher copies lesson plans from the internet
  {
    en: {
      context: 'Tuesday, 9:00 AM. Your email, parent complaint.',
      scenario:
        'A parent emails you with a screenshot showing that a new teacher\'s lesson plan, which was sent home as a study guide, is copied word for word from a popular teaching website. The parent writes, "I found this in 30 seconds on Google. Is this what we are paying for? Does she even plan her own lessons?" The teacher is in her first year and has been working 12-hour days.',
      choices: [
        { letter: 'A', text: 'Forward the parent\'s email to the teacher so she knows what was reported.', best: false },
        { letter: 'B', text: 'Reply to the parent that using online resources is standard practice and not a concern.', best: false },
        { letter: 'C', text: 'Respond to the parent by acknowledging the concern and committing to following up. Meet with the teacher privately, ask about her planning process without accusation, and connect her with a mentor who can help her adapt resources rather than copy them.', best: true },
        { letter: 'D', text: 'Place the teacher on an improvement plan for insufficient lesson planning.', best: false },
      ],
      researchSays:
        'Feiman-Nemser (2001) identifies the first year of teaching as a survival period where new teachers often lack the skill to adapt curriculum, not the will. Forwarding a parent complaint without context feels like an attack. Dismissing the parent signals you do not value their input. An improvement plan for a first-year teacher who is already working 12 hours a day will break her. The research-aligned response is to treat this as a coaching opportunity: validate the parent, investigate without assumptions, and connect the teacher with mentoring support that builds the capacity she is missing.',
      leadershipLens: 'Staff Development',
    },
    es: {
      context: 'Martes, 9:00 AM. Tu correo, queja de un padre/madre.',
      scenario:
        'Un padre/madre te envia un correo con una captura de pantalla mostrando que el plan de leccion de una maestra nueva, que se envio a casa como guia de estudio, esta copiado palabra por palabra de un sitio web popular de ensenanza. El padre/madre escribe: "Encontre esto en 30 segundos en Google. Es esto por lo que pagamos? Acaso ella planifica sus propias lecciones?" La maestra esta en su primer ano y ha estado trabajando jornadas de 12 horas.',
      choices: [
        { letter: 'A', text: 'Reenviar el correo del padre/madre a la maestra para que sepa lo que se reporto.', best: false },
        { letter: 'B', text: 'Responder al padre/madre que usar recursos en linea es practica estandar y no es una preocupacion.', best: false },
        { letter: 'C', text: 'Responder al padre/madre reconociendo la preocupacion y comprometiendote a dar seguimiento. Reunirse con la maestra en privado, preguntar sobre su proceso de planificacion sin acusacion, y conectarla con un mentor que pueda ayudarla a adaptar recursos en lugar de copiarlos.', best: true },
        { letter: 'D', text: 'Colocar a la maestra en un plan de mejora por planificacion insuficiente de lecciones.', best: false },
      ],
      researchSays:
        'Feiman-Nemser (2001) identifica el primer ano de ensenanza como un periodo de supervivencia donde los maestros nuevos a menudo carecen de la habilidad para adaptar el curriculo, no de la voluntad. Reenviar una queja de un padre/madre sin contexto se siente como un ataque. Desestimar al padre/madre senala que no valoras su aporte. Un plan de mejora para una maestra de primer ano que ya trabaja 12 horas al dia la quebrara. La respuesta alineada con la investigacion es tratar esto como una oportunidad de coaching: validar al padre/madre, investigar sin suposiciones y conectar a la maestra con apoyo de mentoria que construya la capacidad que le falta.',
      leadershipLens: 'Desarrollo del Personal',
    },
  },

  // 22. Staff tradition excludes support staff
  {
    en: {
      context: 'Friday, 8:00 AM. Staff lounge bulletin board.',
      scenario:
        'Your school has a beloved Friday tradition: teachers pay $2 for "jeans day" and the money goes to a student scholarship fund. You notice that custodians, cafeteria workers, and paraprofessionals never participate. When you ask a para why, she says, "We already wear work clothes. Nobody ever invited us. And honestly, two dollars a week adds up when you make what we make." The tradition has been running for three years.',
      choices: [
        { letter: 'A', text: 'Extend the invitation to all staff and keep the $2 fee.', best: false },
        { letter: 'B', text: 'Redesign the tradition with input from all staff groups. Create a version that is inclusive, does not require a fee from lower-paid employees, and recognizes that support staff are equal members of the school community. Use it as a chance to publicly celebrate classified staff.', best: true },
        { letter: 'C', text: 'Cancel jeans day to avoid the equity issue.', best: false },
        { letter: 'D', text: 'Keep the tradition as is. It is optional and teachers enjoy it.', best: false },
      ],
      researchSays:
        'Khalifa (2018) writes that culturally responsive leadership requires examining whose voices are centered and whose are invisible in school traditions and systems. A $2 weekly fee that feels negligible to a teacher earning $55,000 represents a real burden for a para earning $24,000. Simply extending an invitation without changing the structure does not address the underlying exclusion. Canceling removes something people value without replacing it. Redesigning with input from all staff, including classified employees, transforms a well-intentioned tradition into one that actually reflects the values it claims to represent.',
      leadershipLens: 'Equity',
    },
    es: {
      context: 'Viernes, 8:00 AM. Tablero de anuncios de la sala de maestros.',
      scenario:
        'Tu escuela tiene una tradicion querida de los viernes: los maestros pagan $2 por el "dia de jeans" y el dinero va a un fondo de becas estudiantiles. Notas que los conserjes, trabajadores de cafeteria y paraprofesionales nunca participan. Cuando le preguntas a una para por que, dice: "Ya usamos ropa de trabajo. Nadie nos invito nunca. Y honestamente, dos dolares a la semana se acumulan cuando ganas lo que ganamos nosotros." La tradicion ha estado funcionando por tres anos.',
      choices: [
        { letter: 'A', text: 'Extender la invitacion a todo el personal y mantener la cuota de $2.', best: false },
        { letter: 'B', text: 'Redisenar la tradicion con aporte de todos los grupos de personal. Crear una version que sea inclusiva, no requiera una cuota de empleados con salarios mas bajos y reconozca que el personal de apoyo son miembros iguales de la comunidad escolar. Usarlo como una oportunidad para celebrar publicamente al personal clasificado.', best: true },
        { letter: 'C', text: 'Cancelar el dia de jeans para evitar el problema de equidad.', best: false },
        { letter: 'D', text: 'Mantener la tradicion como esta. Es opcional y los maestros la disfrutan.', best: false },
      ],
      researchSays:
        'Khalifa (2018) escribe que el liderazgo culturalmente responsivo requiere examinar cuyas voces estan centradas y cuyas son invisibles en las tradiciones y sistemas escolares. Una cuota semanal de $2 que se siente insignificante para un maestro que gana $55,000 representa una carga real para una para que gana $24,000. Simplemente extender una invitacion sin cambiar la estructura no aborda la exclusion subyacente. Cancelar remueve algo que la gente valora sin reemplazarlo. Redisenar con aporte de todo el personal, incluyendo empleados clasificados, transforma una tradicion bien intencionada en una que realmente refleja los valores que dice representar.',
      leadershipLens: 'Equidad',
    },
  },

  // 23. Teacher wants to observe but colleague says no
  {
    en: {
      context: 'Thursday, 2:00 PM. Hallway conversation.',
      scenario:
        'A second-year teacher asks you for help. She wants to observe a veteran colleague during her prep period to learn classroom management strategies. When she asked the veteran directly, the veteran said, "I would rather not have someone watching me teach. It makes me uncomfortable." The younger teacher is disappointed and says, "How am I supposed to get better if no one will let me learn from them?"',
      choices: [
        { letter: 'A', text: 'Tell the veteran teacher she needs to allow the observation since it is part of being a team.', best: false },
        { letter: 'B', text: 'Validate the younger teacher\'s desire to grow, then work with both teachers separately. Explore what would make the veteran comfortable (a reciprocal observation, a video of her teaching, a co-planning session instead) and find an arrangement that honors both teachers\' needs.', best: true },
        { letter: 'C', text: 'Suggest the younger teacher watch YouTube videos of classroom management instead.', best: false },
        { letter: 'D', text: 'Assign the younger teacher to observe a different teacher who is more open to it.', best: false },
      ],
      researchSays:
        'DuFour and Marzano (2011) emphasize that professional learning communities thrive when observation is normalized, not mandated. Forcing a veteran to open her door breeds resentment, not collaboration. Sending the young teacher to YouTube signals that in-building expertise is unavailable. Simply redirecting to another teacher solves the immediate problem but does not address the cultural barrier. Working with both teachers to find a mutually respectful arrangement (co-planning, video review, reciprocal visits) builds a culture of professional vulnerability that benefits the entire school, not just these two individuals.',
      leadershipLens: 'Staff Development',
    },
    es: {
      context: 'Jueves, 2:00 PM. Conversacion en el pasillo.',
      scenario:
        'Una maestra de segundo ano te pide ayuda. Quiere observar a una colega veterana durante su periodo de preparacion para aprender estrategias de manejo de salon. Cuando le pregunto directamente a la veterana, ella dijo: "Preferiria no tener a alguien viendome ensenar. Me incomoda." La maestra joven esta decepcionada y dice: "Como se supone que mejore si nadie me deja aprender de ellos?"',
      choices: [
        { letter: 'A', text: 'Decirle a la maestra veterana que necesita permitir la observacion ya que es parte de ser un equipo.', best: false },
        { letter: 'B', text: 'Validar el deseo de crecer de la maestra joven, luego trabajar con ambas maestras por separado. Explorar que haria sentir comoda a la veterana (una observacion reciproca, un video de su ensenanza, una sesion de co-planificacion en su lugar) y encontrar un arreglo que honre las necesidades de ambas maestras.', best: true },
        { letter: 'C', text: 'Sugerir que la maestra joven vea videos de YouTube sobre manejo de salon en su lugar.', best: false },
        { letter: 'D', text: 'Asignar a la maestra joven a observar a una maestra diferente que este mas abierta.', best: false },
      ],
      researchSays:
        'DuFour y Marzano (2011) enfatizan que las comunidades de aprendizaje profesional prosperan cuando la observacion se normaliza, no se impone. Forzar a una veterana a abrir su puerta genera resentimiento, no colaboracion. Enviar a la maestra joven a YouTube senala que la experiencia dentro del edificio no esta disponible. Simplemente redirigir a otra maestra resuelve el problema inmediato pero no aborda la barrera cultural. Trabajar con ambas maestras para encontrar un arreglo mutuamente respetuoso (co-planificacion, revision de video, visitas reciprocas) construye una cultura de vulnerabilidad profesional que beneficia a toda la escuela, no solo a estas dos personas.',
      leadershipLens: 'Desarrollo del Personal',
    },
  },

  // 24. Three students report substitute said something inappropriate
  {
    en: {
      context: 'Monday, 1:00 PM. Three students at your office door.',
      scenario:
        'Three fifth graders come to your office together and report that during morning class, the substitute teacher made a comment about one student\'s weight in front of the class, saying, "Maybe if you ran more at recess, you would not need such a big chair." When you call the substitute in, she says, "I was joking. Kids today are too sensitive. I never said that." The three students are consistent in their accounts.',
      choices: [
        { letter: 'A', text: 'Decide it is a he-said-she-said situation and let it go since the sub will be gone tomorrow.', best: false },
        { letter: 'B', text: 'Thank the students for speaking up. Document each student\'s account separately. Remove the substitute from your classroom for the rest of the day, report the incident to the sub coordinator, and check in with the targeted student. Ensure this substitute is flagged in your system.', best: true },
        { letter: 'C', text: 'Ask the substitute to apologize to the class and move on.', best: false },
        { letter: 'D', text: 'Tell the students you believe them but there is nothing you can do about a substitute.', best: false },
      ],
      researchSays:
        'Olweus (1993) and subsequent anti-bullying research establish that adults who use weight-based or appearance-based comments create hostile environments where peer bullying increases. Three consistent student accounts constitute a credible report. Dismissing it because the sub "will be gone tomorrow" teaches students that reporting does not matter. A forced apology without consequence minimizes the harm. Telling students you cannot act teaches learned helplessness. The correct response is documentation, removal from the classroom, system flagging, and direct follow-up with the affected student. Students who report and see action become students who continue to trust adults.',
      leadershipLens: 'Student Safety',
    },
    es: {
      context: 'Lunes, 1:00 PM. Tres estudiantes en la puerta de tu oficina.',
      scenario:
        'Tres estudiantes de quinto grado vienen a tu oficina juntos y reportan que durante la clase de la manana, el/la maestro/a sustituto/a hizo un comentario sobre el peso de un estudiante frente a la clase, diciendo: "Tal vez si corrieras mas en el recreo, no necesitarias una silla tan grande." Cuando llamas al/la sustituto/a, dice: "Estaba bromeando. Los ninos de hoy son muy sensibles. Nunca dije eso." Los tres estudiantes son consistentes en sus relatos.',
      choices: [
        { letter: 'A', text: 'Decidir que es una situacion de el dijo/ella dijo y dejarlo pasar ya que el/la sustituto/a se ira manana.', best: false },
        { letter: 'B', text: 'Agradecer a los estudiantes por hablar. Documentar el relato de cada estudiante por separado. Remover al/la sustituto/a del salon por el resto del dia, reportar el incidente al coordinador de sustitutos y verificar como esta el estudiante afectado. Asegurar que este/a sustituto/a sea marcado/a en tu sistema.', best: true },
        { letter: 'C', text: 'Pedir al/la sustituto/a que se disculpe con la clase y seguir adelante.', best: false },
        { letter: 'D', text: 'Decirle a los estudiantes que les crees pero que no puedes hacer nada con un/a sustituto/a.', best: false },
      ],
      researchSays:
        'Olweus (1993) y la investigacion subsecuente sobre anti-acoso establecen que los adultos que usan comentarios basados en peso o apariencia crean ambientes hostiles donde el acoso entre pares aumenta. Tres relatos estudiantiles consistentes constituyen un reporte creible. Desestimarlo porque el/la sustituto/a "se ira manana" les ensena a los estudiantes que reportar no importa. Una disculpa forzada sin consecuencia minimiza el dano. Decirles a los estudiantes que no puedes actuar ensena indefension aprendida. La respuesta correcta es documentacion, remocion del salon, marcaje en el sistema y seguimiento directo con el estudiante afectado. Los estudiantes que reportan y ven accion se convierten en estudiantes que continuan confiando en los adultos.',
      leadershipLens: 'Seguridad Estudiantil',
    },
  },

  // 25. Test scores dropped, district wants action plan by Friday
  {
    en: {
      context: 'Wednesday, 10:00 AM. Email from the assistant superintendent.',
      scenario:
        'Your school\'s state test scores dropped 8 percentage points in math and 5 in reading compared to last year. The assistant superintendent emails you: "The board is reviewing school performance data on Monday. I need your written action plan on my desk by Friday at noon. What went wrong and what are you going to do about it?" You know the drop is connected to losing four experienced teachers mid-year and absorbing 45 transfer students in January.',
      choices: [
        { letter: 'A', text: 'Write a plan focused on new test prep programs, additional practice assessments, and extended learning time.', best: false },
        { letter: 'B', text: 'Reply that the data is misleading because of circumstances outside your control and ask for the timeline to be extended.', best: false },
        { letter: 'C', text: 'Draft a plan that honestly names the contributing factors (staffing turnover, mid-year transfers), presents disaggregated data showing where the real gaps are, outlines specific instructional responses, and includes teacher voice by convening your team before Friday. Send the draft to the assistant superintendent Thursday evening with a request for a brief conversation before the board meeting.', best: true },
        { letter: 'D', text: 'Convene your leadership team and assign each person a section of the action plan to write before Friday.', best: false },
      ],
      researchSays:
        'Elmore (2004) argues that school improvement plans fail when they focus on programs rather than the instructional core. A plan built around test prep without addressing root causes (staffing instability, integration of new students) will look responsive but change nothing. Blaming circumstances without proposing solutions makes you look defensive. Delegating the writing without your leadership voice produces a fragmented document. The strongest approach names reality without making excuses, shows you understand your data deeply enough to disaggregate it, includes your staff in the response, and positions you as a partner with the district rather than a target. Requesting a conversation before the board meeting shows confidence, not weakness.',
      leadershipLens: 'Systems Thinking',
    },
    es: {
      context: 'Miercoles, 10:00 AM. Correo del superintendente asistente.',
      scenario:
        'Los puntajes de los examenes estatales de tu escuela bajaron 8 puntos porcentuales en matematicas y 5 en lectura comparado con el ano pasado. El superintendente asistente te envia un correo: "La junta esta revisando los datos de rendimiento escolar el lunes. Necesito tu plan de accion por escrito en mi escritorio para el viernes al mediodia. Que salio mal y que vas a hacer al respecto?" Sabes que la baja esta conectada con la perdida de cuatro maestros experimentados a mitad de ano y la absorcion de 45 estudiantes transferidos en enero.',
      choices: [
        { letter: 'A', text: 'Escribir un plan enfocado en nuevos programas de preparacion para examenes, evaluaciones de practica adicionales y tiempo de aprendizaje extendido.', best: false },
        { letter: 'B', text: 'Responder que los datos son enganosos debido a circunstancias fuera de tu control y pedir que se extienda el plazo.', best: false },
        { letter: 'C', text: 'Redactar un plan que nombre honestamente los factores contribuyentes (rotacion de personal, transferencias a mitad de ano), presente datos desagregados mostrando donde estan las brechas reales, describa respuestas instruccionales especificas e incluya la voz del maestro convocando a tu equipo antes del viernes. Enviar el borrador al superintendente asistente el jueves por la noche con una solicitud de una breve conversacion antes de la reunion de la junta.', best: true },
        { letter: 'D', text: 'Convocar a tu equipo de liderazgo y asignar a cada persona una seccion del plan de accion para escribir antes del viernes.', best: false },
      ],
      researchSays:
        'Elmore (2004) argumenta que los planes de mejora escolar fracasan cuando se enfocan en programas en lugar del nucleo instruccional. Un plan construido alrededor de preparacion para examenes sin abordar las causas raiz (inestabilidad de personal, integracion de nuevos estudiantes) se vera receptivo pero no cambiara nada. Culpar a las circunstancias sin proponer soluciones te hace ver a la defensiva. Delegar la escritura sin tu voz de liderazgo produce un documento fragmentado. El enfoque mas fuerte nombra la realidad sin excusas, muestra que entiendes tus datos lo suficientemente profundo para desagregarlos, incluye a tu personal en la respuesta y te posiciona como un socio del distrito en lugar de un objetivo. Solicitar una conversacion antes de la reunion de la junta muestra confianza, no debilidad.',
      leadershipLens: 'Pensamiento Sistemico',
    },
  },
];

export const PLAYBOOK_SCENARIO_COUNT = 10;
