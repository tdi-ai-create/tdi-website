// The Boundary Game — scenario data (EN/ES)

export interface BoundaryScenario {
  en: {
    context: string;
    scenario: string;
    choices: { text: string; best: boolean }[];
    healthyBoundary: string;
    boundaryType: string;
  };
  es: {
    context: string;
    scenario: string;
    choices: { text: string; best: boolean }[];
    healthyBoundary: string;
    boundaryType: string;
  };
}

export const BOUNDARY_SCENARIO_COUNT = 10;

export const BOUNDARY_SCENARIOS: BoundaryScenario[] = [
  // 1. Parent texts at 10pm about a grade
  {
    en: {
      context: '10:07 PM. You are on the couch. Your phone buzzes.',
      scenario:
        'A parent texts you at 10 PM asking why their child got a C on the last test. They want an explanation tonight. You gave out your number at back-to-school night "for emergencies." This is the third time this parent has texted after 9 PM.',
      choices: [
        { text: 'Reply right now with a full explanation so the parent does not escalate.', best: false },
        { text: 'Wait until the next school day, then respond during work hours and clarify your communication window going forward.', best: true },
        { text: 'Text back "Please only contact me during school hours" and nothing else.', best: false },
      ],
      healthyBoundary:
        'Research on teacher burnout (Maslach, 2003) shows that inability to disconnect from work is a primary driver of emotional exhaustion. Responding immediately trains parents to expect after-hours access. The healthiest move is a warm but firm next-day reply that resets the expectation. A curt text protects your time but damages the relationship. You deserve rest, and the grade will still be there tomorrow.',
      boundaryType: 'Communication',
    },
    es: {
      context: '10:07 PM. Estas en el sofa. Tu telefono vibra.',
      scenario:
        'Un padre/madre te envia un mensaje de texto a las 10 PM preguntando por que su hijo/a saco una C en el ultimo examen. Quiere una explicacion esta noche. Diste tu numero en la noche de regreso a clases "para emergencias." Esta es la tercera vez que este padre/madre te escribe despues de las 9 PM.',
      choices: [
        { text: 'Responder ahora mismo con una explicacion completa para que el padre/madre no escale la situacion.', best: false },
        { text: 'Esperar hasta el siguiente dia escolar, responder durante horas de trabajo y aclarar tu ventana de comunicacion de aqui en adelante.', best: true },
        { text: 'Responder "Por favor solo contacteme durante horas escolares" y nada mas.', best: false },
      ],
      healthyBoundary:
        'La investigacion sobre el agotamiento docente (Maslach, 2003) muestra que la incapacidad de desconectarse del trabajo es un impulsor principal del agotamiento emocional. Responder inmediatamente entrena a los padres a esperar acceso fuera de horario. Lo mas saludable es una respuesta calida pero firme al dia siguiente que restablezca la expectativa. Un mensaje cortante protege tu tiempo pero dana la relacion. Mereces descansar, y la calificacion seguira ahi manana.',
      boundaryType: 'Comunicacion',
    },
  },

  // 2. Colleague asks you to cover duty again
  {
    en: {
      context: 'Friday morning. Hallway outside the teachers\' lounge.',
      scenario:
        'A colleague catches you before first period and asks you to cover their lunch duty. Again. This is the third time this month. They always have a reason. You like this person, but you were planning to use that time to prep for an observation next week.',
      choices: [
        { text: 'Say yes because you do not want to damage the friendship, and figure out prep time later.', best: false },
        { text: 'Say "I am not able to cover today. I have something I need to use that time for. I hope you can find someone."', best: true },
        { text: 'Say yes but make a passive comment like "I guess I am the backup plan again."', best: false },
      ],
      healthyBoundary:
        'Saying yes when you mean no builds resentment over time (Cloud & Townsend, Boundaries, 1992). The passive-aggressive route damages trust without solving the problem. A direct, kind decline protects your time and models healthy professional behavior. You are not responsible for solving a pattern your colleague has created. Saying no to this request is saying yes to your own preparation and your students.',
      boundaryType: 'Workload',
    },
    es: {
      context: 'Viernes por la manana. Pasillo afuera de la sala de maestros.',
      scenario:
        'Un/a colega te alcanza antes de la primera hora y te pide que cubras su turno de supervision del almuerzo. Otra vez. Es la tercera vez este mes. Siempre tiene una razon. Te cae bien esta persona, pero planeabas usar ese tiempo para prepararte para una observacion la proxima semana.',
      choices: [
        { text: 'Decir que si porque no quieres danar la amistad, y buscar tiempo de preparacion despues.', best: false },
        { text: 'Decir "No puedo cubrir hoy. Tengo algo para lo que necesito usar ese tiempo. Espero que puedas encontrar a alguien."', best: true },
        { text: 'Decir que si pero hacer un comentario pasivo como "Supongo que soy el plan de respaldo otra vez."', best: false },
      ],
      healthyBoundary:
        'Decir que si cuando quieres decir que no construye resentimiento con el tiempo (Cloud y Townsend, Boundaries, 1992). La ruta pasivo-agresiva dana la confianza sin resolver el problema. Una negativa directa y amable protege tu tiempo y modela comportamiento profesional saludable. No eres responsable de resolver un patron que tu colega ha creado. Decir no a esta solicitud es decir si a tu propia preparacion y a tus estudiantes.',
      boundaryType: 'Carga de Trabajo',
    },
  },

  // 3. Principal asks you to join another committee
  {
    en: {
      context: 'After school. Principal stops by your classroom.',
      scenario:
        'Your principal asks if you would be willing to join the new equity committee. You are already on the PLC team, the social committee, and the MTSS committee. You care deeply about equity work, but you are stretched thin. The principal says, "You would be perfect for this."',
      choices: [
        { text: 'Say "Thank you for thinking of me. I want to do this well, and right now with three committees, I would not be able to give it the attention it deserves. Can we revisit this when one of my current commitments ends?"', best: true },
        { text: 'Say yes because the principal asked and you do not want to seem uncommitted to equity.', best: false },
        { text: 'Say "I already do enough around here" and walk away.', best: false },
      ],
      healthyBoundary:
        'Overcommitted educators experience significantly higher rates of burnout and lower job satisfaction (Ingersoll, 2001). Saying yes to everything dilutes your impact on everything. A boundary that honors the work by naming your capacity is more professional than a resentful yes or a dismissive no. Leaders who hear honest capacity check-ins actually trust those employees more over time.',
      boundaryType: 'Workload',
    },
    es: {
      context: 'Despues de clases. El/la director/a pasa por tu salon.',
      scenario:
        'Tu director/a te pregunta si estarias dispuesto/a a unirte al nuevo comite de equidad. Ya estas en el equipo PLC, el comite social y el comite MTSS. Te importa profundamente el trabajo de equidad, pero estas al limite. El/la director/a dice: "Serias perfecto/a para esto."',
      choices: [
        { text: 'Decir "Gracias por pensar en mi. Quiero hacer esto bien, y ahora mismo con tres comites, no podria darle la atencion que merece. ¿Podemos revisarlo cuando termine uno de mis compromisos actuales?"', best: true },
        { text: 'Decir que si porque el/la director/a lo pidio y no quieres parecer descomprometido/a con la equidad.', best: false },
        { text: 'Decir "Ya hago suficiente aqui" e irte.', best: false },
      ],
      healthyBoundary:
        'Los educadores sobrecomprometidos experimentan tasas significativamente mas altas de agotamiento y menor satisfaccion laboral (Ingersoll, 2001). Decir que si a todo diluye tu impacto en todo. Un limite que honra el trabajo al nombrar tu capacidad es mas profesional que un si resentido o un no despectivo. Los lideres que escuchan revisiones honestas de capacidad en realidad confian mas en esos empleados con el tiempo.',
      boundaryType: 'Carga de Trabajo',
    },
  },

  // 4. Parent wants your personal phone number
  {
    en: {
      context: 'Parent-teacher conference. 4:45 PM.',
      scenario:
        'During a conference, a parent pulls out their phone and says, "Can I get your cell number? It would just be easier to text you directly when I have questions." You have a school email and a classroom communication app. The parent is friendly and well-meaning.',
      choices: [
        { text: 'Give them your number because they seem respectful and it will make communication faster.', best: false },
        { text: 'Say "I appreciate that. The best way to reach me is through the class app or my school email. I check both daily and respond within 24 hours."', best: true },
        { text: 'Say "We are not allowed to give out personal numbers" even if that is not technically a policy.', best: false },
      ],
      healthyBoundary:
        'The line between personal and professional contact is one of the most important boundaries educators can maintain. Research on role clarity (Katz & Kahn, 1978) shows that blurred personal-professional lines lead to increased stress and boundary violations. Redirecting to school channels protects your personal space while still being responsive. Blaming a fake policy works short-term but erodes trust if discovered. Your personal phone is personal. That is reason enough.',
      boundaryType: 'Personal/Professional Line',
    },
    es: {
      context: 'Conferencia de padres y maestros. 4:45 PM.',
      scenario:
        'Durante una conferencia, un padre/madre saca su telefono y dice: "¿Me puedes dar tu numero de celular? Seria mas facil enviarte mensajes directamente cuando tenga preguntas." Tienes un correo escolar y una aplicacion de comunicacion del salon. El padre/madre es amigable y bien intencionado/a.',
      choices: [
        { text: 'Darles tu numero porque parecen respetuosos y hara la comunicacion mas rapida.', best: false },
        { text: 'Decir "Te lo agradezco. La mejor manera de contactarme es a traves de la app del salon o mi correo escolar. Reviso ambos diariamente y respondo dentro de 24 horas."', best: true },
        { text: 'Decir "No nos permiten dar numeros personales" aunque eso no sea tecnicamente una politica.', best: false },
      ],
      healthyBoundary:
        'La linea entre el contacto personal y profesional es uno de los limites mas importantes que los educadores pueden mantener. La investigacion sobre claridad de roles (Katz y Kahn, 1978) muestra que las lineas difusas entre lo personal y lo profesional conducen a mayor estres y violaciones de limites. Redirigir a canales escolares protege tu espacio personal mientras sigues siendo receptivo. Culpar a una politica falsa funciona a corto plazo pero erosiona la confianza si se descubre. Tu telefono personal es personal. Esa es razon suficiente.',
      boundaryType: 'Linea Personal/Profesional',
    },
  },

  // 5. Colleague venting during your quiet lunch
  {
    en: {
      context: 'Lunchtime. You just sat down in the break room.',
      scenario:
        'You have been looking forward to 15 minutes of quiet all morning. You sit down with your lunch, close your eyes for a second, and a colleague walks in and immediately starts venting about a student. They are upset and clearly need to talk. You care about them, but you are running on empty.',
      choices: [
        { text: 'Listen to the entire vent because they need you right now and your needs can wait.', best: false },
        { text: 'Say "I can tell this is important, and I want to hear it. Right now I really need a few minutes of quiet to reset. Can we talk at 2:00?"', best: true },
        { text: 'Put in your earbuds and pretend you did not hear them come in.', best: false },
      ],
      healthyBoundary:
        'Compassion fatigue research (Figley, 2002) shows that educators who do not protect small recovery windows throughout the day deplete faster and become less effective at supporting others. Naming your need honestly and offering a specific alternative time is not selfish. It is strategic caring. Absorbing the vent when you have nothing left helps neither of you. Ignoring them damages the relationship entirely. You can care about someone and still protect your quiet.',
      boundaryType: 'Emotional Energy',
    },
    es: {
      context: 'Hora del almuerzo. Acabas de sentarte en la sala de descanso.',
      scenario:
        'Has estado esperando 15 minutos de silencio toda la manana. Te sientas con tu almuerzo, cierras los ojos por un segundo, y un/a colega entra e inmediatamente comienza a desahogarse sobre un estudiante. Esta molesto/a y claramente necesita hablar. Te importa, pero estas agotado/a.',
      choices: [
        { text: 'Escuchar todo el desahogo porque te necesita ahora mismo y tus necesidades pueden esperar.', best: false },
        { text: 'Decir "Puedo ver que esto es importante, y quiero escucharlo. Ahora mismo necesito unos minutos de silencio para recargar. ¿Podemos hablar a las 2:00?"', best: true },
        { text: 'Ponerte los audifonos y pretender que no los escuchaste entrar.', best: false },
      ],
      healthyBoundary:
        'La investigacion sobre fatiga por compasion (Figley, 2002) muestra que los educadores que no protegen pequenas ventanas de recuperacion durante el dia se agotan mas rapido y se vuelven menos efectivos apoyando a otros. Nombrar tu necesidad honestamente y ofrecer un horario alternativo especifico no es egoista. Es cuidado estrategico. Absorber el desahogo cuando no te queda nada no ayuda a ninguno. Ignorarlos dana la relacion por completo. Puedes importarte alguien y aun asi proteger tu silencio.',
      boundaryType: 'Energia Emocional',
    },
  },

  // 6. Principal emails at 11pm expecting a reply
  {
    en: {
      context: '11:14 PM. You see a new email notification from your principal.',
      scenario:
        'Your principal sends an email at 11 PM with a question about tomorrow\'s schedule and adds "please confirm before the morning." You are already in bed. This has become a pattern. The question is not urgent and could easily wait until you arrive at school.',
      choices: [
        { text: 'Get up and reply immediately because the principal asked and you do not want to seem unresponsive.', best: false },
        { text: 'Reply in the morning when you arrive at school, and if it becomes a pattern, have a private conversation about communication expectations.', best: true },
        { text: 'Reply "I do not check email after 8 PM" and go back to sleep.', best: false },
      ],
      healthyBoundary:
        'The expectation of 24/7 availability is one of the fastest paths to burnout in education (Santoro, 2018). Replying at 11 PM normalizes midnight work culture for you and your colleagues. The healthiest approach is responding during contracted hours and, if needed, having a direct conversation about communication norms. A blunt reply may protect your time but can create unnecessary tension. Your sleep matters. The schedule will still be there at 7 AM.',
      boundaryType: 'Time',
    },
    es: {
      context: '11:14 PM. Ves una nueva notificacion de correo de tu director/a.',
      scenario:
        'Tu director/a envia un correo a las 11 PM con una pregunta sobre el horario de manana y agrega "por favor confirma antes de la manana." Ya estas en cama. Esto se ha convertido en un patron. La pregunta no es urgente y facilmente podria esperar hasta que llegues a la escuela.',
      choices: [
        { text: 'Levantarte y responder inmediatamente porque el/la director/a lo pidio y no quieres parecer poco receptivo/a.', best: false },
        { text: 'Responder por la manana cuando llegues a la escuela, y si se convierte en patron, tener una conversacion privada sobre expectativas de comunicacion.', best: true },
        { text: 'Responder "No reviso correo despues de las 8 PM" y volver a dormir.', best: false },
      ],
      healthyBoundary:
        'La expectativa de disponibilidad 24/7 es uno de los caminos mas rapidos al agotamiento en educacion (Santoro, 2018). Responder a las 11 PM normaliza la cultura de trabajo a medianoche para ti y tus colegas. El enfoque mas saludable es responder durante horas contratadas y, si es necesario, tener una conversacion directa sobre normas de comunicacion. Una respuesta brusca puede proteger tu tiempo pero puede crear tension innecesaria. Tu sueno importa. El horario seguira ahi a las 7 AM.',
      boundaryType: 'Tiempo',
    },
  },

  // 7. Parent corners you at a grocery store
  {
    en: {
      context: 'Saturday afternoon. Aisle 7 at the grocery store.',
      scenario:
        'You are buying groceries on a Saturday and a parent of one of your students spots you and walks over. After a quick hello, they start asking detailed questions about their child\'s reading level and whether they should be concerned. You are in shorts and a t-shirt holding a bag of chips.',
      choices: [
        { text: 'Answer all their questions right there in the store because you have the information in your head anyway.', best: false },
        { text: 'Say "I am happy to talk about that. Let me set up a time next week so I can pull their data and give you a thorough answer."', best: true },
        { text: 'Say "I am off the clock" and walk away quickly.', best: false },
      ],
      healthyBoundary:
        'Educators are among the few professionals regularly expected to be "on" in public spaces (Santoro, 2018). Answering detailed academic questions without data in hand risks giving incomplete information. Redirecting warmly to a school meeting protects accuracy, your personal time, and the parent relationship. A dismissive response reinforces the harmful stereotype that teachers do not care. You deserve to buy chips in peace while also being someone who clearly cares about their students.',
      boundaryType: 'Physical Space',
    },
    es: {
      context: 'Sabado por la tarde. Pasillo 7 del supermercado.',
      scenario:
        'Estas comprando viveres un sabado y un padre/madre de uno de tus estudiantes te ve y se acerca. Despues de un saludo rapido, comienza a hacer preguntas detalladas sobre el nivel de lectura de su hijo/a y si deberia preocuparse. Estas en shorts y camiseta sosteniendo una bolsa de papas.',
      choices: [
        { text: 'Responder todas sus preguntas ahi mismo en la tienda porque de todos modos tienes la informacion en tu cabeza.', best: false },
        { text: 'Decir "Con gusto hablamos de eso. Dejame programar un horario la proxima semana para poder revisar sus datos y darte una respuesta completa."', best: true },
        { text: 'Decir "No estoy en horario de trabajo" e irte rapidamente.', best: false },
      ],
      healthyBoundary:
        'Los educadores estan entre los pocos profesionales a quienes regularmente se les espera estar "disponibles" en espacios publicos (Santoro, 2018). Responder preguntas academicas detalladas sin datos en mano arriesga dar informacion incompleta. Redirigir calidamente a una reunion escolar protege la precision, tu tiempo personal y la relacion con el padre/madre. Una respuesta despectiva refuerza el estereotipo danino de que a los maestros no les importa. Mereces comprar papas en paz mientras eres alguien que claramente se preocupa por sus estudiantes.',
      boundaryType: 'Espacio Fisico',
    },
  },

  // 8. Colleague asks you to write their lesson plans
  {
    en: {
      context: 'Planning period. The workroom.',
      scenario:
        'A colleague sits down next to you during your planning period and says, "You always make the best lesson plans. Can you just write mine for this unit? I will owe you one." They have asked variations of this before. You know they are struggling, but writing their plans is not your job.',
      choices: [
        { text: 'Write the plans for them because it is faster than arguing and you feel bad saying no.', best: false },
        { text: 'Say "I appreciate that. I am not able to write your plans, but I am happy to sit with you for 20 minutes and help you outline them."', best: true },
        { text: 'Say "Write your own lesson plans" and go back to your work.', best: false },
      ],
      healthyBoundary:
        'Helping and enabling are different things (Cloud & Townsend, 1992). Writing someone else\'s plans prevents them from developing the skill and creates dependency. Offering structured support with a time limit honors the relationship while protecting your own planning time. A blunt refusal may feel honest but misses the chance to model healthy collaboration. You can be generous with your expertise without giving away your labor.',
      boundaryType: 'Role Clarity',
    },
    es: {
      context: 'Periodo de planificacion. La sala de trabajo.',
      scenario:
        'Un/a colega se sienta a tu lado durante tu periodo de planificacion y dice: "Siempre haces los mejores planes de leccion. ¿Puedes escribir los mios para esta unidad? Te debo una." Ha pedido variaciones de esto antes. Sabes que esta teniendo dificultades, pero escribir sus planes no es tu trabajo.',
      choices: [
        { text: 'Escribir los planes porque es mas rapido que discutir y te sientes mal diciendo que no.', best: false },
        { text: 'Decir "Te lo agradezco. No puedo escribir tus planes, pero con gusto me siento contigo 20 minutos y te ayudo a hacer un esquema."', best: true },
        { text: 'Decir "Escribe tus propios planes de leccion" y volver a tu trabajo.', best: false },
      ],
      healthyBoundary:
        'Ayudar y habilitar son cosas diferentes (Cloud y Townsend, 1992). Escribir los planes de alguien mas les impide desarrollar la habilidad y crea dependencia. Ofrecer apoyo estructurado con un limite de tiempo honra la relacion mientras protege tu propio tiempo de planificacion. Un rechazo brusco puede sentirse honesto pero pierde la oportunidad de modelar colaboracion saludable. Puedes ser generoso/a con tu experiencia sin regalar tu trabajo.',
      boundaryType: 'Claridad de Rol',
    },
  },

  // 9. Asked to stay late for a meeting scheduled past contracted hours
  {
    en: {
      context: '3:15 PM. Your contract day ends at 3:30.',
      scenario:
        'A meeting that was supposed to start at 2:30 just got rescheduled to 3:15. It will run at least 45 minutes, meaning you will be there until 4:00. You have a childcare pickup at 3:45 that cannot be moved. Nobody asked if the new time worked for anyone.',
      choices: [
        { text: 'Stay for the full meeting and scramble to find someone else to pick up your child.', best: false },
        { text: 'Attend until 3:30, let the organizer know you have a hard stop, and ask for notes on anything you miss.', best: true },
        { text: 'Skip the meeting entirely without telling anyone.', best: false },
      ],
      healthyBoundary:
        'Contract hours exist for a reason. Research on work-life boundaries (Clark, 2000) shows that when organizations routinely extend work into personal time without consent, employee satisfaction and retention drop significantly. Attending until your contract time, communicating your stop, and requesting follow-up is professional and protective. Staying and scrambling teaches the system that your personal obligations are negotiable. Disappearing without notice damages your reputation. Your time has an edge, and that edge is allowed to be firm.',
      boundaryType: 'Time',
    },
    es: {
      context: '3:15 PM. Tu dia contractual termina a las 3:30.',
      scenario:
        'Una reunion que se suponia empezaba a las 2:30 se reprogramo a las 3:15. Durara al menos 45 minutos, lo que significa que estaras ahi hasta las 4:00. Tienes que recoger a tu hijo/a de la guarderia a las 3:45 y eso no se puede mover. Nadie pregunto si el nuevo horario funcionaba para alguien.',
      choices: [
        { text: 'Quedarte a toda la reunion y buscar desesperadamente a alguien que recoja a tu hijo/a.', best: false },
        { text: 'Asistir hasta las 3:30, avisar al organizador que tienes un limite fijo, y pedir notas de lo que te pierdas.', best: true },
        { text: 'Faltar a la reunion completamente sin avisar a nadie.', best: false },
      ],
      healthyBoundary:
        'Las horas de contrato existen por una razon. La investigacion sobre limites trabajo-vida (Clark, 2000) muestra que cuando las organizaciones extienden rutinariamente el trabajo al tiempo personal sin consentimiento, la satisfaccion y retencion de empleados bajan significativamente. Asistir hasta tu hora de contrato, comunicar tu limite y solicitar seguimiento es profesional y protector. Quedarte y resolver de emergencia le ensena al sistema que tus obligaciones personales son negociables. Desaparecer sin aviso dana tu reputacion. Tu tiempo tiene un borde, y ese borde tiene permiso de ser firme.',
      boundaryType: 'Tiempo',
    },
  },

  // 10. Student asks deeply personal question
  {
    en: {
      context: 'Mid-lesson. A student raises their hand.',
      scenario:
        'A student asks you in front of the class, "Do you have kids? Are you married? Why not?" The question is innocent and curious, but it crosses into your personal life in a way that makes you uncomfortable. Other students lean in, waiting for your answer.',
      choices: [
        { text: 'Answer honestly and in detail because students deserve to know you as a real person.', best: false },
        { text: 'Smile and say "I love that you are curious. Some things about my personal life I keep private, and that is okay. Now, back to our lesson." Redirect warmly.', best: true },
        { text: 'Say "That is none of your business" firmly.', best: false },
      ],
      healthyBoundary:
        'Students benefit from seeing teachers as human, but that does not mean every question deserves a full answer (Noddings, 2005). Modeling that it is okay to keep some things private is itself a valuable social-emotional lesson. A warm redirect shows students that boundaries can be kind. A harsh shutdown can make students afraid to ask questions at all. You get to choose what parts of your life you share, and that choice is always yours.',
      boundaryType: 'Personal/Professional Line',
    },
    es: {
      context: 'A mitad de la leccion. Un estudiante levanta la mano.',
      scenario:
        'Un estudiante te pregunta frente a la clase: "¿Tiene hijos? ¿Esta casado/a? ¿Por que no?" La pregunta es inocente y curiosa, pero cruza a tu vida personal de una manera que te incomoda. Otros estudiantes se inclinan, esperando tu respuesta.',
      choices: [
        { text: 'Responder honestamente y en detalle porque los estudiantes merecen conocerte como una persona real.', best: false },
        { text: 'Sonreir y decir "Me encanta que seas curioso/a. Algunas cosas sobre mi vida personal las mantengo privadas, y eso esta bien. Ahora, volvamos a nuestra leccion." Redirigir con calidez.', best: true },
        { text: 'Decir "Eso no es asunto tuyo" firmemente.', best: false },
      ],
      healthyBoundary:
        'Los estudiantes se benefician de ver a los maestros como humanos, pero eso no significa que cada pregunta merece una respuesta completa (Noddings, 2005). Modelar que esta bien mantener algunas cosas privadas es en si mismo una leccion socioemocional valiosa. Una redireccion calida muestra a los estudiantes que los limites pueden ser amables. Un cierre brusco puede hacer que los estudiantes tengan miedo de hacer preguntas. Tu eliges que partes de tu vida compartes, y esa eleccion siempre es tuya.',
      boundaryType: 'Linea Personal/Profesional',
    },
  },

  // 11. Group texts on personal phone
  {
    en: {
      context: 'Team meeting. Someone pulls out their phone.',
      scenario:
        'Your grade-level team wants to start a group text for quick communication. "It will be so much easier than email!" one colleague says. Everyone is nodding. You do not want work notifications on your personal phone at all hours. You also do not want to be the one person who says no.',
      choices: [
        { text: 'Join the group text because everyone else is doing it and you will look difficult if you refuse.', best: false },
        { text: 'Say "I would rather keep work communication on our school platform so I can manage my notifications. I will be responsive there during work hours."', best: true },
        { text: 'Join but immediately mute the conversation and never respond.', best: false },
      ],
      healthyBoundary:
        'The blurring of personal devices and work communication is a significant source of after-hours stress (Derks & Bakker, 2014). Group texts have no off switch and no business hours. Joining and muting is passive avoidance that creates confusion about your responsiveness. Naming your preference for a school platform is not difficult; it is professional. One person setting a boundary often gives others permission to do the same.',
      boundaryType: 'Communication',
    },
    es: {
      context: 'Reunion de equipo. Alguien saca su telefono.',
      scenario:
        'Tu equipo de grado quiere iniciar un grupo de texto para comunicacion rapida. "¡Sera mucho mas facil que el correo!" dice un/a colega. Todos estan asintiendo. No quieres notificaciones de trabajo en tu telefono personal a todas horas. Tampoco quieres ser la unica persona que diga que no.',
      choices: [
        { text: 'Unirte al grupo porque todos lo estan haciendo y te veras dificil si te niegas.', best: false },
        { text: 'Decir "Prefiero mantener la comunicacion de trabajo en nuestra plataforma escolar para poder manejar mis notificaciones. Sere receptivo/a ahi durante horas de trabajo."', best: true },
        { text: 'Unirte pero inmediatamente silenciar la conversacion y nunca responder.', best: false },
      ],
      healthyBoundary:
        'La mezcla de dispositivos personales y comunicacion laboral es una fuente significativa de estres fuera de horario (Derks y Bakker, 2014). Los grupos de texto no tienen boton de apagado ni horario laboral. Unirse y silenciar es una evitacion pasiva que crea confusion sobre tu capacidad de respuesta. Nombrar tu preferencia por una plataforma escolar no es ser dificil; es ser profesional. Una persona estableciendo un limite a menudo da permiso a otros para hacer lo mismo.',
      boundaryType: 'Comunicacion',
    },
  },

  // 12. Parent volunteer giving unsolicited feedback
  {
    en: {
      context: 'Mid-morning. A parent volunteer is in your classroom.',
      scenario:
        'A parent who volunteers weekly in your classroom starts correcting a student\'s work and tells them, "That is not how your teacher should have taught you this." The student looks confused. The parent means well, but they are undermining your instruction and overstepping their role.',
      choices: [
        { text: 'Ignore it because the parent is volunteering their time and you do not want to seem ungrateful.', best: false },
        { text: 'Privately and warmly say "I appreciate your help so much. For consistency, I ask that volunteers support what we are working on rather than re-teaching. Let me show you what would be most helpful today."', best: true },
        { text: 'Tell the parent in front of the students that they need to stop giving academic feedback.', best: false },
      ],
      healthyBoundary:
        'Volunteer management research shows that clear role expectations prevent boundary violations and improve both volunteer satisfaction and classroom outcomes (Henderson & Mapp, 2002). Ignoring the behavior lets it escalate. Correcting publicly embarrasses the volunteer and models poor conflict resolution for students. A private, warm redirect with a specific task channels the parent\'s energy productively while protecting your instructional authority.',
      boundaryType: 'Role Clarity',
    },
    es: {
      context: 'Media manana. Un padre/madre voluntario/a esta en tu salon.',
      scenario:
        'Un padre/madre que es voluntario/a semanal en tu salon comienza a corregir el trabajo de un estudiante y le dice: "Asi no es como tu maestro/a debio haberte ensenado esto." El estudiante se ve confundido. El padre/madre tiene buenas intenciones, pero esta socavando tu instruccion y sobrepasando su rol.',
      choices: [
        { text: 'Ignorarlo porque el padre/madre esta donando su tiempo y no quieres parecer desagradecido/a.', best: false },
        { text: 'Decir privada y calidamente "Aprecio mucho tu ayuda. Para mantener consistencia, pido que los voluntarios apoyen lo que estamos trabajando en lugar de re-ensenar. Dejame mostrarte que seria lo mas util hoy."', best: true },
        { text: 'Decirle al padre/madre frente a los estudiantes que necesita dejar de dar retroalimentacion academica.', best: false },
      ],
      healthyBoundary:
        'La investigacion sobre gestion de voluntarios muestra que las expectativas claras de rol previenen violaciones de limites y mejoran tanto la satisfaccion del voluntario como los resultados del salon (Henderson y Mapp, 2002). Ignorar el comportamiento lo deja escalar. Corregir publicamente avergonza al voluntario y modela mala resolucion de conflictos para los estudiantes. Una redireccion privada y calida con una tarea especifica canaliza la energia del padre/madre productivamente mientras protege tu autoridad instruccional.',
      boundaryType: 'Claridad de Rol',
    },
  },

  // 13. Admin asks you to take on a struggling student from another class
  {
    en: {
      context: 'Wednesday. An admin pulls you aside in the hallway.',
      scenario:
        'An administrator asks you to take a struggling student from another teacher\'s class because "they respond to you." You already have the highest class size on your team. The other teacher has not tried the interventions you know work. You feel flattered but also used.',
      choices: [
        { text: 'Take the student because the admin asked and you do care about the kid.', best: false },
        { text: 'Say "I care about this student. Before we move them, can we try implementing the interventions in their current class first? I am happy to share what has worked for me."', best: true },
        { text: 'Say "My class is already full. That is not fair to me or my students."', best: false },
      ],
      healthyBoundary:
        'Moving a student to the "good teacher" bypasses the systemic issue and overloads effective educators (Ingersoll & Strong, 2011). Offering to share strategies supports the other teacher\'s growth and keeps the student in their community. A flat refusal misses the collaborative opportunity. Accepting without question rewards the pattern of dumping challenges on your strongest people. Advocating for a better process is not refusing to help; it is helping more thoughtfully.',
      boundaryType: 'Self-Advocacy',
    },
    es: {
      context: 'Miercoles. Un/a administrador/a te aparta en el pasillo.',
      scenario:
        'Un/a administrador/a te pide que tomes a un estudiante con dificultades de la clase de otro/a maestro/a porque "responde bien contigo." Ya tienes el tamano de clase mas alto de tu equipo. El/la otro/a maestro/a no ha intentado las intervenciones que sabes que funcionan. Te sientes halagado/a pero tambien utilizado/a.',
      choices: [
        { text: 'Tomar al estudiante porque el/la administrador/a lo pidio y te importa el/la nino/a.', best: false },
        { text: 'Decir "Me importa este estudiante. Antes de moverlo, ¿podemos intentar implementar las intervenciones en su clase actual primero? Con gusto comparto lo que ha funcionado para mi."', best: true },
        { text: 'Decir "Mi clase ya esta llena. Eso no es justo para mi ni para mis estudiantes."', best: false },
      ],
      healthyBoundary:
        'Mover a un estudiante al "buen maestro" evita el problema sistemico y sobrecarga a educadores efectivos (Ingersoll y Strong, 2011). Ofrecer compartir estrategias apoya el crecimiento del otro maestro y mantiene al estudiante en su comunidad. Un rechazo plano pierde la oportunidad colaborativa. Aceptar sin cuestionar recompensa el patron de volcar desafios en tu gente mas fuerte. Abogar por un mejor proceso no es negarse a ayudar; es ayudar mas reflexivamente.',
      boundaryType: 'Autodefensa',
    },
  },

  // 14. Guilted for not attending optional weekend event
  {
    en: {
      context: 'Monday morning. Staff lounge.',
      scenario:
        'You did not attend the optional Saturday school carnival. A colleague says in front of others, "We missed you Saturday. The kids kept asking where you were." Another adds, "It really shows the kids we care when we show up to those things." You spent Saturday at your own child\'s birthday party.',
      choices: [
        { text: 'Apologize and promise to attend the next one even though you are not sure you can.', best: false },
        { text: 'Say "It sounds like it was a great event. I had a family commitment. I show my students I care every single day in this building."', best: true },
        { text: 'Say nothing and feel guilty about it for the rest of the week.', best: false },
      ],
      healthyBoundary:
        'Guilt about not attending optional events is a hallmark of toxic school culture (Gruenert & Whitaker, 2015). Your presence during contracted hours is your commitment. Attending every optional event is unsustainable and models poor boundaries for the community. Naming your family commitment without apologizing asserts that your personal life has value. Apologizing when you did nothing wrong teaches your brain that rest is wrong. You showed up for your own family. That matters too.',
      boundaryType: 'Self-Advocacy',
    },
    es: {
      context: 'Lunes por la manana. Sala de maestros.',
      scenario:
        'No asististe al carnaval escolar opcional del sabado. Un/a colega dice frente a otros: "Te extranamos el sabado. Los ninos seguian preguntando donde estabas." Otro/a agrega: "Realmente les muestra a los ninos que nos importa cuando aparecemos en esas cosas." Tu pasaste el sabado en la fiesta de cumpleanos de tu propio/a hijo/a.',
      choices: [
        { text: 'Disculparte y prometer asistir al proximo aunque no estes seguro/a de que puedas.', best: false },
        { text: 'Decir "Suena como que fue un gran evento. Tenia un compromiso familiar. Les muestro a mis estudiantes que me importan todos los dias en este edificio."', best: true },
        { text: 'No decir nada y sentirte culpable por ello el resto de la semana.', best: false },
      ],
      healthyBoundary:
        'La culpa por no asistir a eventos opcionales es una marca de cultura escolar toxica (Gruenert y Whitaker, 2015). Tu presencia durante horas contratadas es tu compromiso. Asistir a cada evento opcional es insostenible y modela limites pobres para la comunidad. Nombrar tu compromiso familiar sin disculparte afirma que tu vida personal tiene valor. Disculparte cuando no hiciste nada malo le ensena a tu cerebro que descansar esta mal. Apareciste para tu propia familia. Eso tambien importa.',
      boundaryType: 'Autodefensa',
    },
  },

  // 15. Colleague borrows supplies without asking
  {
    en: {
      context: 'After school. You open your supply cabinet.',
      scenario:
        'You notice your markers are gone again. A colleague has been borrowing your supplies without asking and not returning them. This is the fourth time. You bought these with your own money. When you mentioned it casually before, they laughed and said "We are all in this together!"',
      choices: [
        { text: 'Buy more markers and do not say anything because it is not worth the conflict.', best: false },
        { text: 'Go to the colleague directly and say "I need my supplies to stay in my room. If you need markers, I am happy to help you find a set, but I need mine returned and I need you to ask first going forward."', best: true },
        { text: 'Put a lock on your cabinet and let them figure it out.', best: false },
      ],
      healthyBoundary:
        'Small boundary violations that go unaddressed tend to escalate (Cloud & Townsend, 1992). Buying replacements silently teaches the other person that the behavior is acceptable. A lock solves the symptom but damages the professional relationship. A direct, specific conversation names the behavior, states your need, and offers a path forward. Teachers spend an average of $479 of their own money on supplies each year (NCES, 2018). Your resources deserve protection.',
      boundaryType: 'Physical Space',
    },
    es: {
      context: 'Despues de clases. Abres tu gabinete de materiales.',
      scenario:
        'Notas que tus marcadores desaparecieron otra vez. Un/a colega ha estado tomando tus materiales sin pedir y no los devuelve. Esta es la cuarta vez. Los compraste con tu propio dinero. Cuando lo mencionaste casualmente antes, se rieron y dijeron "¡Todos estamos juntos en esto!"',
      choices: [
        { text: 'Comprar mas marcadores y no decir nada porque no vale la pena el conflicto.', best: false },
        { text: 'Ir directamente al/la colega y decir "Necesito que mis materiales se queden en mi salon. Si necesitas marcadores, con gusto te ayudo a encontrar un juego, pero necesito que me los devuelvan y que preguntes primero de ahora en adelante."', best: true },
        { text: 'Poner un candado en tu gabinete y dejar que lo descubran.', best: false },
      ],
      healthyBoundary:
        'Las pequenas violaciones de limites que no se abordan tienden a escalar (Cloud y Townsend, 1992). Comprar reemplazos en silencio le ensena a la otra persona que el comportamiento es aceptable. Un candado resuelve el sintoma pero dana la relacion profesional. Una conversacion directa y especifica nombra el comportamiento, establece tu necesidad y ofrece un camino hacia adelante. Los maestros gastan un promedio de $479 de su propio dinero en materiales cada ano (NCES, 2018). Tus recursos merecen proteccion.',
      boundaryType: 'Espacio Fisico',
    },
  },

  // 16. Expected to respond to email over winter break
  {
    en: {
      context: 'December 23. Winter break started yesterday.',
      scenario:
        'You receive three work emails on the second day of winter break. One is from a parent, one from a colleague, and one from an admin with "FYI" in the subject line. None are emergencies. You told yourself you would not check email during break, but here you are.',
      choices: [
        { text: 'Respond to all three because if you wait they will pile up and you will feel anxious.', best: false },
        { text: 'Close your email app. Set an out-of-office auto-reply if you have not already. Respond when you return in January.', best: true },
        { text: 'Respond only to the admin email because you do not want them to think you are ignoring them.', best: false },
      ],
      healthyBoundary:
        'Recovery periods are neurologically necessary for sustained performance (Sonnentag, 2012). Responding during break erases the recovery benefit and signals to others that you are available. An auto-reply removes the emotional labor of deciding email by email. Responding selectively based on hierarchy reinforces the idea that your rest is conditional on someone else\'s rank. Break is break. Your brain needs the full reset, not a partial one.',
      boundaryType: 'Time',
    },
    es: {
      context: '23 de diciembre. Las vacaciones de invierno empezaron ayer.',
      scenario:
        'Recibes tres correos de trabajo en el segundo dia de vacaciones de invierno. Uno es de un padre/madre, uno de un/a colega y uno de un/a administrador/a con "FYI" en el asunto. Ninguno es emergencia. Te dijiste que no revisarias correo durante vacaciones, pero aqui estas.',
      choices: [
        { text: 'Responder a los tres porque si esperas se acumularan y te sentiras ansioso/a.', best: false },
        { text: 'Cerrar la app de correo. Configurar una respuesta automatica de fuera de oficina si no lo has hecho. Responder cuando regreses en enero.', best: true },
        { text: 'Responder solo al correo del/la administrador/a porque no quieres que piensen que los estas ignorando.', best: false },
      ],
      healthyBoundary:
        'Los periodos de recuperacion son neurologicamente necesarios para el rendimiento sostenido (Sonnentag, 2012). Responder durante vacaciones borra el beneficio de recuperacion y senala a otros que estas disponible. Una respuesta automatica elimina el trabajo emocional de decidir correo por correo. Responder selectivamente basado en jerarquia refuerza la idea de que tu descanso esta condicionado al rango de alguien mas. Las vacaciones son vacaciones. Tu cerebro necesita el reinicio completo, no uno parcial.',
      boundaryType: 'Tiempo',
    },
  },

  // 17. Parent wants daily behavior updates
  {
    en: {
      context: 'After school. You read a parent email.',
      scenario:
        'A parent emails you requesting daily written behavior updates for their child. They want a detailed summary of what happened each day, including specific interactions and behaviors. You estimate this would take 15 to 20 minutes per day. You have 27 other students.',
      choices: [
        { text: 'Agree to daily updates because you want the parent to know you are invested in their child.', best: false },
        { text: 'Respond with "I understand your concern. A daily report at that level of detail is not sustainable alongside my other students. I can offer a weekly summary and a quick check-in system we agree on together. Would Thursday be a good day to connect?"', best: true },
        { text: 'Ignore the email and hope they forget about it.', best: false },
      ],
      healthyBoundary:
        'An unsustainable commitment helps no one (Maslach & Leiter, 2016). Fifteen minutes per day for one student equals 75 minutes per week taken from 27 others. Offering a structured, realistic alternative shows the parent you take their concern seriously while protecting your capacity to serve all students. Ignoring the request guarantees escalation. A weekly rhythm with a standing check-in often meets the parent\'s actual need, which is reassurance, not a daily transcript.',
      boundaryType: 'Workload',
    },
    es: {
      context: 'Despues de clases. Lees un correo de un padre/madre.',
      scenario:
        'Un padre/madre te envia un correo solicitando actualizaciones diarias escritas del comportamiento de su hijo/a. Quiere un resumen detallado de lo que paso cada dia, incluyendo interacciones y comportamientos especificos. Estimas que esto tomaria 15 a 20 minutos por dia. Tienes 27 otros estudiantes.',
      choices: [
        { text: 'Aceptar las actualizaciones diarias porque quieres que el padre/madre sepa que estas comprometido/a con su hijo/a.', best: false },
        { text: 'Responder con "Entiendo tu preocupacion. Un reporte diario a ese nivel de detalle no es sostenible junto con mis otros estudiantes. Puedo ofrecer un resumen semanal y un sistema de revision rapida que acordemos juntos. ¿Seria el jueves un buen dia para conectar?"', best: true },
        { text: 'Ignorar el correo y esperar que lo olviden.', best: false },
      ],
      healthyBoundary:
        'Un compromiso insostenible no ayuda a nadie (Maslach y Leiter, 2016). Quince minutos por dia para un estudiante equivale a 75 minutos por semana tomados de otros 27. Ofrecer una alternativa estructurada y realista le muestra al padre/madre que tomas su preocupacion en serio mientras proteges tu capacidad de servir a todos los estudiantes. Ignorar la solicitud garantiza escalacion. Un ritmo semanal con un check-in fijo a menudo satisface la necesidad real del padre/madre, que es tranquilidad, no una transcripcion diaria.',
      boundaryType: 'Carga de Trabajo',
    },
  },

  // 18. Mentor teacher observes too frequently
  {
    en: {
      context: 'Friday afternoon. Your mentor teacher stops by.',
      scenario:
        'Your mentor teacher has been observing your classroom every single week. At first it was helpful, but now it feels suffocating. You feel watched, not supported. They mean well and always offer feedback, but you need room to find your own style. You are afraid that saying something will offend them or make them stop helping entirely.',
      choices: [
        { text: 'Say nothing and continue feeling observed because mentors are supposed to help and you should be grateful.', best: false },
        { text: 'Say "I have grown so much from our work together. I am at a point where I would benefit from trying some things on my own and then checking in with you biweekly. Would that work?"', best: true },
        { text: 'Ask your admin to tell your mentor to back off so you do not have to have the conversation yourself.', best: false },
      ],
      healthyBoundary:
        'Effective mentoring research (Ingersoll & Strong, 2011) shows that the goal of mentorship is teacher independence, not dependence. Asking for space is a sign of growth, not ingratitude. Going through admin avoids the relational work and signals distrust. Suffering in silence leads to resentment and does not model the honest communication we want students to develop. Framing the request as growth shows the mentor that their work mattered.',
      boundaryType: 'Self-Advocacy',
    },
    es: {
      context: 'Viernes por la tarde. Tu maestro/a mentor/a pasa por tu salon.',
      scenario:
        'Tu maestro/a mentor/a ha estado observando tu salon cada semana. Al principio fue util, pero ahora se siente asfixiante. Te sientes observado/a, no apoyado/a. Tienen buenas intenciones y siempre ofrecen retroalimentacion, pero necesitas espacio para encontrar tu propio estilo. Tienes miedo de que decir algo los ofenda o haga que dejen de ayudarte por completo.',
      choices: [
        { text: 'No decir nada y seguir sintiendote observado/a porque los mentores se supone que ayudan y deberias estar agradecido/a.', best: false },
        { text: 'Decir "He crecido mucho con nuestro trabajo juntos. Estoy en un punto donde me beneficiaria intentar algunas cosas por mi cuenta y luego reunirnos cada dos semanas. ¿Funcionaria eso?"', best: true },
        { text: 'Pedirle a tu administrador/a que le diga a tu mentor/a que se aleje para no tener que tener la conversacion tu mismo/a.', best: false },
      ],
      healthyBoundary:
        'La investigacion sobre mentoria efectiva (Ingersoll y Strong, 2011) muestra que el objetivo de la mentoria es la independencia del maestro, no la dependencia. Pedir espacio es una senal de crecimiento, no de ingratitud. Ir a traves de la administracion evita el trabajo relacional y senala desconfianza. Sufrir en silencio lleva al resentimiento y no modela la comunicacion honesta que queremos que los estudiantes desarrollen. Enmarcar la solicitud como crecimiento le muestra al mentor que su trabajo importo.',
      boundaryType: 'Autodefensa',
    },
  },

  // 19. Colleague shares personal information you cannot hold right now
  {
    en: {
      context: 'Hallway. Passing period. 47 seconds until your next class.',
      scenario:
        'A colleague pulls you aside between classes and starts sharing something deeply personal about their home life. You can see they are hurting. But you have 47 seconds before your next class walks in, you are already behind on your lesson setup, and honestly, you do not have the emotional bandwidth right now.',
      choices: [
        { text: 'Listen to the full story even though your students are about to arrive because this person needs you.', best: false },
        { text: 'Say "I can see this is really weighing on you, and I want to give it the attention it deserves. Can we find time after school today? I want to be fully present for this."', best: true },
        { text: 'Say "Sorry, I have to go" and walk into your classroom.', best: false },
      ],
      healthyBoundary:
        'Emotional availability has limits, and pretending it does not serves no one (Figley, 2002). Half-listening while anxious about your next class means your colleague does not get real support and your students do not get your best. Naming that you want to be present, and scheduling a real time, is a deeper act of care than a distracted hallway conversation. Walking away abruptly communicates that you do not care, even if that is not true. You can hold space and have limits at the same time.',
      boundaryType: 'Emotional Energy',
    },
    es: {
      context: 'Pasillo. Periodo de transicion. 47 segundos hasta tu proxima clase.',
      scenario:
        'Un/a colega te aparta entre clases y comienza a compartir algo profundamente personal sobre su vida en casa. Puedes ver que esta sufriendo. Pero tienes 47 segundos antes de que tu proxima clase entre, ya estas atrasado/a en la preparacion de tu leccion, y honestamente, no tienes el ancho de banda emocional ahora mismo.',
      choices: [
        { text: 'Escuchar toda la historia aunque tus estudiantes estan por llegar porque esta persona te necesita.', best: false },
        { text: 'Decir "Puedo ver que esto realmente te esta pesando, y quiero darle la atencion que merece. ¿Podemos encontrar tiempo despues de clases hoy? Quiero estar completamente presente para esto."', best: true },
        { text: 'Decir "Lo siento, tengo que irme" y entrar a tu salon.', best: false },
      ],
      healthyBoundary:
        'La disponibilidad emocional tiene limites, y pretender que no es asi no sirve a nadie (Figley, 2002). Escuchar a medias mientras te preocupas por tu proxima clase significa que tu colega no recibe apoyo real y tus estudiantes no reciben lo mejor de ti. Nombrar que quieres estar presente, y programar un momento real, es un acto mas profundo de cuidado que una conversacion distraida en el pasillo. Irte abruptamente comunica que no te importa, aunque eso no sea verdad. Puedes sostener espacio y tener limites al mismo tiempo.',
      boundaryType: 'Energia Emocional',
    },
  },

  // 20. Asked to tutor for free outside school hours
  {
    en: {
      context: 'End of the day. A parent catches you at dismissal.',
      scenario:
        'A parent approaches you at pickup and says, "My child is falling behind. Could you tutor them a couple days a week after school? We cannot really afford a tutor, and they love you." The child genuinely does need support. You already stay late most days. You are not compensated for after-school time.',
      choices: [
        { text: 'Agree to tutor for free because the child needs help and you feel responsible.', best: false },
        { text: 'Say "I can see how much you care, and I want to help. Let me connect you with some free tutoring resources, and I will also look at what support we can build into the school day for them."', best: true },
        { text: 'Say "I am not a free tutor" and end the conversation.', best: false },
      ],
      healthyBoundary:
        'Teachers who consistently give uncompensated labor normalize the expectation that educator time has no value (Walker, 2014). Redirecting to existing resources and building school-day support actually helps the student more sustainably. Saying yes to free tutoring burns you out and teaches the system it does not need to provide adequate support. A blunt response damages the relationship with a parent who is vulnerable. You can care about a child and also recognize that your time, expertise, and energy are worth protecting.',
      boundaryType: 'Personal/Professional Line',
    },
    es: {
      context: 'Final del dia. Un padre/madre te alcanza en la salida.',
      scenario:
        'Un padre/madre se acerca a ti en la salida y dice: "Mi hijo/a se esta quedando atras. ¿Podrias darle tutoria un par de dias a la semana despues de clases? No podemos pagar un tutor, y a el/ella le encantas." El/la nino/a genuinamente necesita apoyo. Ya te quedas tarde la mayoria de los dias. No recibes compensacion por tiempo despues de la escuela.',
      choices: [
        { text: 'Aceptar dar tutoria gratis porque el/la nino/a necesita ayuda y te sientes responsable.', best: false },
        { text: 'Decir "Puedo ver cuanto te importa, y quiero ayudar. Dejame conectarte con algunos recursos de tutoria gratuitos, y tambien buscare que apoyo podemos construir dentro del dia escolar para el/ella."', best: true },
        { text: 'Decir "No soy un tutor gratis" y terminar la conversacion.', best: false },
      ],
      healthyBoundary:
        'Los maestros que consistentemente dan trabajo no compensado normalizan la expectativa de que el tiempo del educador no tiene valor (Walker, 2014). Redirigir a recursos existentes y construir apoyo dentro del dia escolar en realidad ayuda al estudiante de manera mas sostenible. Decir si a la tutoria gratuita te agota y le ensena al sistema que no necesita proveer apoyo adecuado. Una respuesta brusca dana la relacion con un padre/madre que es vulnerable. Puedes importarte un/a nino/a y tambien reconocer que tu tiempo, experiencia y energia merecen proteccion.',
      boundaryType: 'Linea Personal/Profesional',
    },
  },
];
