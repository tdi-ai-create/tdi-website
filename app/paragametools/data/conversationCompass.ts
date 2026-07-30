// Conversation Compass — scenario data (EN/ES)

export interface CompassScenario {
  en: {
    context: string
    scenario: string
    choices: { direction: string; text: string; best: boolean }[]
    experienced: string
    commSkill: string
  }
  es: {
    context: string
    scenario: string
    choices: { direction: string; text: string; best: boolean }[]
    experienced: string
    commSkill: string
  }
}

export const COMPASS_SCENARIOS: CompassScenario[] = [
  // 1. Parent emails at 9pm saying their child "hates your class"
  {
    en: {
      context: 'Tuesday, 9:14 PM. Your phone buzzes with a parent email.',
      scenario:
        'A parent emails you at 9 PM: "My daughter comes home crying every day. She says she hates your class and you never help her. I need to know what is going on." You feel a rush of defensiveness. Your fingers hover over the keyboard.',
      choices: [
        { direction: 'Respond Now', text: 'Write a detailed reply tonight explaining everything you have done for the student, with specific examples.', best: false },
        { direction: 'Wait', text: 'Close the email. Draft a response in the morning when you can be thoughtful, and invite the parent to a conversation.', best: true },
        { direction: 'Redirect', text: 'Forward the email to your principal and let them handle it.', best: false },
        { direction: 'Escalate', text: 'Reply immediately asking the parent to come in tomorrow so you can discuss face to face.', best: false },
      ],
      experienced:
        'Responding to emotionally charged emails at night rarely goes well. The 12 hour rule gives you time to move past defensiveness and craft a response that opens a door rather than builds a wall. A morning reply that acknowledges the parent concern and invites partnership ("I want to hear more about what your daughter is experiencing. Can we set up a time to talk this week?") almost always leads to a better outcome than a late night defense.',
      commSkill: 'Timing',
    },
    es: {
      context: 'Martes, 9:14 PM. Tu telefono vibra con un correo de un padre/madre.',
      scenario:
        'Un padre/madre te envia un correo a las 9 PM: "Mi hija llega llorando a casa todos los dias. Dice que odia tu clase y que nunca la ayudas. Necesito saber que esta pasando." Sientes una oleada de defensividad. Tus dedos flotan sobre el teclado.',
      choices: [
        { direction: 'Responder Ahora', text: 'Escribir una respuesta detallada esta noche explicando todo lo que has hecho por la estudiante, con ejemplos especificos.', best: false },
        { direction: 'Esperar', text: 'Cerrar el correo. Redactar una respuesta en la manana cuando puedas ser mas reflexivo/a, e invitar al padre/madre a una conversacion.', best: true },
        { direction: 'Redirigir', text: 'Reenviar el correo a tu director/a y dejar que lo manejen.', best: false },
        { direction: 'Escalar', text: 'Responder inmediatamente pidiendo al padre/madre que venga manana para hablar en persona.', best: false },
      ],
      experienced:
        'Responder a correos emocionalmente cargados por la noche rara vez sale bien. La regla de las 12 horas te da tiempo para superar la defensividad y redactar una respuesta que abra una puerta en lugar de construir un muro. Una respuesta por la manana que reconozca la preocupacion del padre/madre e invite a la colaboracion casi siempre lleva a un mejor resultado que una defensa nocturna.',
      commSkill: 'Timing',
    },
  },

  // 2. Parent asks you to change their child's grade during pickup
  {
    en: {
      context: 'Friday, 3:20 PM. Dismissal line, other parents within earshot.',
      scenario:
        'A parent pulls you aside during pickup and says, "My son got a C on that project but he worked really hard. Can you bump it up? It is going to tank his average." Other parents are nearby and students are filtering out the door.',
      choices: [
        { direction: 'Respond Now', text: 'Explain your grading rubric right there in the pickup line so the parent understands the score.', best: false },
        { direction: 'Wait', text: 'Acknowledge their concern, tell them you want to give this a proper conversation, and offer to meet or call during planning time next week.', best: true },
        { direction: 'Redirect', text: 'Suggest the parent email you so there is a written record of the request.', best: false },
        { direction: 'Escalate', text: 'Tell the parent that grades are final and the policy does not allow changes.', best: false },
      ],
      experienced:
        'The pickup line is never the right venue for a grading conversation. It is public, rushed, and emotionally loaded. Experienced educators protect both the parent relationship and their professional boundaries by moving the conversation to a private, scheduled setting. Saying "I can hear this matters to you, and I want to give it the attention it deserves" validates the parent without making a promise or a public decision.',
      commSkill: 'Boundary Setting',
    },
    es: {
      context: 'Viernes, 3:20 PM. Linea de salida, otros padres/madres al alcance del oido.',
      scenario:
        'Un padre/madre te detiene durante la salida y dice: "Mi hijo saco una C en ese proyecto pero trabajo muy duro. ¿Puedes subirle la nota? Le va a arruinar su promedio." Otros padres/madres estan cerca y los estudiantes estan saliendo.',
      choices: [
        { direction: 'Responder Ahora', text: 'Explicar tu rubrica de calificacion alli mismo en la linea de salida para que el padre/madre entienda la nota.', best: false },
        { direction: 'Esperar', text: 'Reconocer su preocupacion, decirle que quieres darle una conversacion adecuada, y ofrecer reunirse o llamar durante tu tiempo de planificacion la proxima semana.', best: true },
        { direction: 'Redirigir', text: 'Sugerir que el padre/madre te envie un correo para que haya un registro escrito de la solicitud.', best: false },
        { direction: 'Escalar', text: 'Decirle al padre/madre que las calificaciones son finales y la politica no permite cambios.', best: false },
      ],
      experienced:
        'La linea de salida nunca es el lugar adecuado para una conversacion sobre calificaciones. Es publica, apresurada y emocionalmente cargada. Los educadores experimentados protegen tanto la relacion con el padre/madre como sus limites profesionales al mover la conversacion a un entorno privado y programado.',
      commSkill: 'Establecimiento de Limites',
    },
  },

  // 3. Parent shows up unannounced wanting to observe your classroom
  {
    en: {
      context: 'Wednesday, 10:30 AM. A knock at your classroom door.',
      scenario:
        'A parent shows up at your classroom door during instruction and says, "I want to sit in and watch. I have heard some things and I want to see for myself." You have 26 students mid-activity and the office did not notify you anyone was coming.',
      choices: [
        { direction: 'Respond Now', text: 'Welcome them in and let them observe, since saying no could escalate things.', best: false },
        { direction: 'Wait', text: 'Step into the hall briefly, thank them for caring, and explain that classroom visits go through the office so you can be prepared to show your best work.', best: true },
        { direction: 'Redirect', text: 'Walk them to the office yourself and let admin handle the scheduling.', best: false },
        { direction: 'Escalate', text: 'Tell them the school policy does not allow unannounced visits and close the door.', best: false },
      ],
      experienced:
        'An unannounced visit is almost always rooted in worry, not hostility. The educator who steps into the hallway, acknowledges the parent concern, and redirects to a proper channel ("I would love for you to see our classroom. Let me work with the office to set up a time where I can really walk you through what we are doing") turns a tense moment into a relationship builder. Letting them in unannounced disrupts the class. Sending them away coldly confirms their suspicion that something is wrong.',
      commSkill: 'Boundary Setting',
    },
    es: {
      context: 'Miercoles, 10:30 AM. Un golpe en la puerta de tu salon.',
      scenario:
        'Un padre/madre aparece en la puerta de tu salon durante la instruccion y dice: "Quiero sentarme y observar. He escuchado algunas cosas y quiero ver por mi mismo/a." Tienes 26 estudiantes en medio de una actividad y la oficina no te notifico que alguien vendria.',
      choices: [
        { direction: 'Responder Ahora', text: 'Darle la bienvenida y dejarle observar, ya que decir que no podria escalar las cosas.', best: false },
        { direction: 'Esperar', text: 'Salir al pasillo brevemente, agradecerle por su interes, y explicar que las visitas al salon se coordinan a traves de la oficina para que puedas estar preparado/a.', best: true },
        { direction: 'Redirigir', text: 'Llevarlo/a a la oficina personalmente y dejar que la administracion maneje la programacion.', best: false },
        { direction: 'Escalar', text: 'Decirle que la politica de la escuela no permite visitas sin cita y cerrar la puerta.', best: false },
      ],
      experienced:
        'Una visita sin aviso casi siempre tiene su raiz en la preocupacion, no en la hostilidad. El educador que sale al pasillo, reconoce la preocupacion del padre/madre y redirige a un canal apropiado convierte un momento tenso en un constructor de relaciones.',
      commSkill: 'Establecimiento de Limites',
    },
  },

  // 4. Parent complains to you about another teacher
  {
    en: {
      context: 'Thursday, 4:00 PM. Parent conference, just the two of you.',
      scenario:
        'During a parent conference about their child, the parent suddenly shifts topics: "Honestly, the real problem is Mrs. Garcia. She lets the kids run wild and my son comes to your class wound up because of her." They are clearly expecting you to agree or at least validate their frustration.',
      choices: [
        { direction: 'Respond Now', text: 'Validate their frustration by sharing that transitions from other classrooms can be tough.', best: false },
        { direction: 'Wait', text: 'Listen fully, then redirect by saying, "I hear your concern. I can only speak to what happens in my classroom. For concerns about another class, the best path is to talk directly with that teacher or with our principal."', best: true },
        { direction: 'Redirect', text: 'Suggest they bring it up at the next PTA meeting so it can be addressed publicly.', best: false },
        { direction: 'Escalate', text: 'Tell the parent you will mention their concern to Mrs. Garcia yourself.', best: false },
      ],
      experienced:
        'Agreeing with a parent complaint about a colleague, even subtly, damages trust across the building and creates triangulation. Experienced educators draw a clear, kind boundary: "I appreciate you sharing that. I can only speak to my classroom, but I want to help you get that concern to the right person." This protects the colleague, models professional communication, and keeps the conference focused.',
      commSkill: 'Confidentiality',
    },
    es: {
      context: 'Jueves, 4:00 PM. Conferencia con padre/madre, solo ustedes dos.',
      scenario:
        'Durante una conferencia sobre su hijo/a, el padre/madre cambia de tema repentinamente: "Honestamente, el verdadero problema es la Sra. Garcia. Ella deja que los ninos hagan lo que quieran y mi hijo llega a tu clase alterado por su culpa." Claramente esperan que estes de acuerdo o al menos valides su frustracion.',
      choices: [
        { direction: 'Responder Ahora', text: 'Validar su frustracion compartiendo que las transiciones de otros salones pueden ser dificiles.', best: false },
        { direction: 'Esperar', text: 'Escuchar completamente, luego redirigir diciendo: "Escucho su preocupacion. Solo puedo hablar de lo que sucede en mi salon. Para preocupaciones sobre otra clase, lo mejor es hablar directamente con esa maestra o con nuestro/a director/a."', best: true },
        { direction: 'Redirigir', text: 'Sugerir que lo mencionen en la proxima reunion de la PTA para que se aborde publicamente.', best: false },
        { direction: 'Escalar', text: 'Decirle al padre/madre que tu mismo/a le mencionaras su preocupacion a la Sra. Garcia.', best: false },
      ],
      experienced:
        'Estar de acuerdo con la queja de un padre/madre sobre un/a colega, incluso sutilmente, dana la confianza en todo el edificio y crea triangulacion. Los educadores experimentados trazan un limite claro y amable que protege al colega y modela la comunicacion profesional.',
      commSkill: 'Confidencialidad',
    },
  },

  // 5. Parent says "my child would never do that"
  {
    en: {
      context: 'Monday, 2:45 PM. Phone call with a parent.',
      scenario:
        'You call a parent to report that their child pushed another student during recess. The parent immediately responds, "My child would never do that. Someone must have provoked him. Are you sure you saw it yourself?" Their tone is accusatory.',
      choices: [
        { direction: 'Respond Now', text: 'Describe exactly what you witnessed in detail to prove your account is accurate.', best: false },
        { direction: 'Wait', text: 'Pause, then say, "I understand this is hard to hear. I called because I care about your child. Can I share what I observed, and then we can talk about how to support him together?"', best: true },
        { direction: 'Redirect', text: 'Tell the parent you will send an incident report in writing so they can review the details.', best: false },
        { direction: 'Escalate', text: 'Let the parent know that if the behavior continues, it may result in a referral to the office.', best: false },
      ],
      experienced:
        'When a parent says "my child would never do that," they are protecting their child, not attacking you. Leading with empathy ("I understand this is hard to hear") and shared purpose ("I called because I care about your child") disarms the defensiveness. Trying to prove your case escalates the conversation into a courtroom dynamic. Starting with care and partnership almost always opens the door to a productive exchange.',
      commSkill: 'Empathy First',
    },
    es: {
      context: 'Lunes, 2:45 PM. Llamada telefonica con un padre/madre.',
      scenario:
        'Llamas a un padre/madre para reportar que su hijo empujo a otro estudiante durante el recreo. El padre/madre responde inmediatamente: "Mi hijo nunca haria eso. Alguien debe haberlo provocado. ¿Estas seguro/a de que lo viste tu mismo/a?" Su tono es acusatorio.',
      choices: [
        { direction: 'Responder Ahora', text: 'Describir exactamente lo que presenciaste en detalle para demostrar que tu relato es preciso.', best: false },
        { direction: 'Esperar', text: 'Hacer una pausa, luego decir: "Entiendo que esto es dificil de escuchar. Llame porque me importa su hijo. ¿Puedo compartir lo que observe, y luego hablamos de como apoyarlo juntos?"', best: true },
        { direction: 'Redirigir', text: 'Decirle al padre/madre que enviaras un informe de incidente por escrito para que puedan revisar los detalles.', best: false },
        { direction: 'Escalar', text: 'Hacerle saber al padre/madre que si el comportamiento continua, puede resultar en una referencia a la oficina.', best: false },
      ],
      experienced:
        'Cuando un padre/madre dice "mi hijo nunca haria eso," estan protegiendo a su hijo, no atacandote. Liderar con empatia y proposito compartido desarma la defensividad. Intentar probar tu caso escala la conversacion a una dinamica de tribunal.',
      commSkill: 'Empatia Primero',
    },
  },

  // 6. Parent only communicates through the student
  {
    en: {
      context: 'Ongoing pattern. Third week of the semester.',
      scenario:
        'A parent has never responded to your emails, calls, or app messages. Instead, their child delivers verbal messages: "My mom says I should not have homework on Wednesdays" or "My dad wants to know why I got a low grade." The student seems uncomfortable being the messenger.',
      choices: [
        { direction: 'Respond Now', text: 'Send the student home with a written note asking the parent to contact you directly.', best: false },
        { direction: 'Wait', text: 'Try a different communication channel. Send a brief, warm text or handwritten note home saying you would love to connect and asking what method works best for them.', best: true },
        { direction: 'Redirect', text: 'Ask the school counselor to reach out to the family and establish communication.', best: false },
        { direction: 'Escalate', text: 'Document the lack of communication and report it to administration as a concern.', best: false },
      ],
      experienced:
        'Before assuming a parent does not care, check your assumptions about access. They may not have reliable email, may work multiple jobs, may have had negative school experiences themselves, or may speak a different language at home. Trying a different channel with warmth ("I would love to find a way to stay connected. What works best for you?") opens the door without judgment. Involving admin or counselors before trying direct outreach can feel institutional and create distance.',
      commSkill: 'Active Listening',
    },
    es: {
      context: 'Patron recurrente. Tercera semana del semestre.',
      scenario:
        'Un padre/madre nunca ha respondido a tus correos, llamadas o mensajes en la aplicacion. En cambio, su hijo/a entrega mensajes verbales: "Mi mama dice que no deberia tener tarea los miercoles" o "Mi papa quiere saber por que saque una nota baja." El/la estudiante parece incomodo/a siendo el mensajero.',
      choices: [
        { direction: 'Responder Ahora', text: 'Enviar al estudiante a casa con una nota escrita pidiendo al padre/madre que te contacte directamente.', best: false },
        { direction: 'Esperar', text: 'Probar un canal de comunicacion diferente. Enviar un mensaje de texto breve y calido o una nota escrita a mano diciendo que te encantaria conectarte y preguntando que metodo les funciona mejor.', best: true },
        { direction: 'Redirigir', text: 'Pedir al consejero escolar que se comunique con la familia y establezca comunicacion.', best: false },
        { direction: 'Escalar', text: 'Documentar la falta de comunicacion y reportarla a la administracion como una preocupacion.', best: false },
      ],
      experienced:
        'Antes de asumir que un padre/madre no le importa, revisa tus suposiciones sobre el acceso. Pueden no tener correo electronico confiable, trabajar multiples empleos, haber tenido experiencias escolares negativas, o hablar un idioma diferente en casa. Probar un canal diferente con calidez abre la puerta sin juzgar.',
      commSkill: 'Escucha Activa',
    },
  },

  // 7. Non-custodial parent demands information
  {
    en: {
      context: 'Tuesday, 8:00 AM. Phone call before school starts.',
      scenario:
        'A parent calls and says, "I am Jayden\'s father. His mother and I are separated. I need his grades, attendance records, and his teacher\'s notes. She will not share anything with me." You are not sure what the custody arrangement is or what you are legally allowed to share.',
      choices: [
        { direction: 'Respond Now', text: 'Share the information since both parents have a right to know about their child.', best: false },
        { direction: 'Wait', text: 'Thank the father for reaching out, let him know you want to help, and explain that you need to check with the office on the proper process for sharing records before you can provide anything.', best: true },
        { direction: 'Redirect', text: 'Give him the school office number and tell him they handle records requests.', best: false },
        { direction: 'Escalate', text: 'Tell the father you cannot share anything without the mother\'s permission.', best: false },
      ],
      experienced:
        'Custody and records access is a legal matter that varies by district and situation. Experienced educators never guess on this. They are warm and validating ("I am glad you reached out, and I want to help") while being honest about the process ("Let me check with our office to make sure I follow the right steps for you"). This protects the child, protects you, and keeps the door open with the parent.',
      commSkill: 'Confidentiality',
    },
    es: {
      context: 'Martes, 8:00 AM. Llamada telefonica antes de que empiece la escuela.',
      scenario:
        'Un padre llama y dice: "Soy el papa de Jayden. Su madre y yo estamos separados. Necesito sus calificaciones, registros de asistencia y las notas de su maestra. Ella no comparte nada conmigo." No estas seguro/a de cual es el acuerdo de custodia o que puedes compartir legalmente.',
      choices: [
        { direction: 'Responder Ahora', text: 'Compartir la informacion ya que ambos padres tienen derecho a saber sobre su hijo.', best: false },
        { direction: 'Esperar', text: 'Agradecer al padre por comunicarse, hacerle saber que quieres ayudar, y explicar que necesitas consultar con la oficina sobre el proceso adecuado para compartir registros.', best: true },
        { direction: 'Redirigir', text: 'Darle el numero de la oficina escolar y decirle que ellos manejan las solicitudes de registros.', best: false },
        { direction: 'Escalar', text: 'Decirle al padre que no puedes compartir nada sin el permiso de la madre.', best: false },
      ],
      experienced:
        'La custodia y el acceso a registros es un asunto legal que varia por distrito y situacion. Los educadores experimentados nunca adivinan en esto. Son calidos y validadores mientras son honestos sobre el proceso.',
      commSkill: 'Confidencialidad',
    },
  },

  // 8. Parent sends angry group text about homework policy
  {
    en: {
      context: 'Saturday morning. A colleague forwards you a screenshot.',
      scenario:
        'A colleague texts you a screenshot of a parent group chat where one parent is ripping apart your homework policy. Other parents are piling on. Comments include "this is ridiculous" and "my kid is up until 10 PM every night." You were not included in the chat but now you know about it.',
      choices: [
        { direction: 'Respond Now', text: 'Send a class-wide email this weekend clarifying your homework policy and the reasoning behind it.', best: false },
        { direction: 'Wait', text: 'Do nothing over the weekend. On Monday, proactively send a warm note to families explaining your homework philosophy and inviting anyone with concerns to talk with you directly.', best: true },
        { direction: 'Redirect', text: 'Ask the colleague who sent the screenshot to respond in the group chat on your behalf.', best: false },
        { direction: 'Escalate', text: 'Forward the screenshot to your principal so they are aware of the parent complaints.', best: false },
      ],
      experienced:
        'You were not invited to that conversation, and responding to it directly signals that you are monitoring parent communications. A reactive weekend email looks defensive. Instead, use Monday as a natural moment to proactively share your homework philosophy with all families. Frame it as information, not defense. This gives frustrated parents a direct channel to you and takes the conversation out of the group chat without acknowledging you saw it.',
      commSkill: 'Professional Assertiveness',
    },
    es: {
      context: 'Sabado por la manana. Un/a colega te reenvia una captura de pantalla.',
      scenario:
        'Un/a colega te envia una captura de pantalla de un chat grupal de padres/madres donde un padre/madre esta criticando tu politica de tareas. Otros padres/madres se estan uniendo. Los comentarios incluyen "esto es ridiculo" y "mi hijo esta despierto hasta las 10 PM cada noche." No fuiste incluido/a en el chat pero ahora lo sabes.',
      choices: [
        { direction: 'Responder Ahora', text: 'Enviar un correo a toda la clase este fin de semana aclarando tu politica de tareas y el razonamiento detras.', best: false },
        { direction: 'Esperar', text: 'No hacer nada durante el fin de semana. El lunes, enviar proactivamente una nota calida a las familias explicando tu filosofia de tareas e invitando a cualquiera con preocupaciones a hablar contigo directamente.', best: true },
        { direction: 'Redirigir', text: 'Pedirle al colega que envio la captura de pantalla que responda en el chat grupal en tu nombre.', best: false },
        { direction: 'Escalar', text: 'Reenviar la captura de pantalla a tu director/a para que esten al tanto de las quejas.', best: false },
      ],
      experienced:
        'No fuiste invitado/a a esa conversacion, y responder directamente senala que estas monitoreando las comunicaciones de los padres. Un correo reactivo de fin de semana se ve defensivo. Usa el lunes como un momento natural para compartir proactivamente tu filosofia de tareas con todas las familias.',
      commSkill: 'Asertividad Profesional',
    },
  },

  // 9. Colleague takes credit for your idea
  {
    en: {
      context: 'Wednesday, 3:30 PM. PLC meeting, eight colleagues present.',
      scenario:
        'During a team meeting, a colleague presents an activity you designed and shared with them last week as their own idea. They even say, "I came up with this over the weekend." Your other teammates are impressed and complimenting them. You feel a mix of anger and disbelief.',
      choices: [
        { direction: 'Respond Now', text: 'Speak up in the meeting and say, "Actually, I shared that with you last Tuesday."', best: false },
        { direction: 'Wait', text: 'Let the meeting finish. Afterward, talk to the colleague privately: "I noticed you shared the activity I designed. I am glad it resonated, but I want to make sure my contributions are credited. Can we talk about how to handle that going forward?"', best: true },
        { direction: 'Redirect', text: 'Do not say anything but make sure to send an email to the team later with the original document showing your name and date.', best: false },
        { direction: 'Escalate', text: 'Bring it up to your team lead or principal as an integrity concern.', best: false },
      ],
      experienced:
        'Calling someone out publicly, even when justified, creates a defensive dynamic that damages the whole team. Passive aggressive documentation feels good in the moment but erodes trust sideways. Going to admin before talking to the person directly skips a critical step. A private, direct conversation ("I want to make sure my work is credited") is assertive without being aggressive. Most of the time, the colleague did not realize the impact and a direct conversation resolves it.',
      commSkill: 'Professional Assertiveness',
    },
    es: {
      context: 'Miercoles, 3:30 PM. Reunion PLC, ocho colegas presentes.',
      scenario:
        'Durante una reunion de equipo, un/a colega presenta una actividad que tu disenaste y compartiste con el/ella la semana pasada como si fuera su propia idea. Incluso dice: "Se me ocurrio esto durante el fin de semana." Tus otros companeros/as estan impresionados y felicitandolo/a. Sientes una mezcla de enojo e incredulidad.',
      choices: [
        { direction: 'Responder Ahora', text: 'Hablar en la reunion y decir: "En realidad, yo te comparti eso el martes pasado."', best: false },
        { direction: 'Esperar', text: 'Dejar que termine la reunion. Despues, hablar con el/la colega en privado: "Note que compartiste la actividad que yo disene. Me alegra que haya resonado, pero quiero asegurarme de que mis contribuciones sean reconocidas."', best: true },
        { direction: 'Redirigir', text: 'No decir nada pero asegurarte de enviar un correo al equipo despues con el documento original mostrando tu nombre y fecha.', best: false },
        { direction: 'Escalar', text: 'Mencionarselo a tu lider de equipo o director/a como una preocupacion de integridad.', best: false },
      ],
      experienced:
        'Senalar a alguien publicamente, incluso cuando esta justificado, crea una dinamica defensiva que dana a todo el equipo. La documentacion pasivo-agresiva erosiona la confianza. Una conversacion privada y directa es asertiva sin ser agresiva.',
      commSkill: 'Asertividad Profesional',
    },
  },

  // 10. Co-teacher disagrees in front of student
  {
    en: {
      context: 'Thursday, 10:15 AM. Co-taught classroom, student at the table.',
      scenario:
        'You and your co-teacher are meeting with a student about a behavior plan. You suggest removing a privilege as a consequence. Your co-teacher immediately says, in front of the student, "I do not think that is the right approach. That feels punitive." The student looks between you both, confused.',
      choices: [
        { direction: 'Respond Now', text: 'Defend your approach and explain why removing the privilege makes sense.', best: false },
        { direction: 'Wait', text: 'Say to the student, "We are going to take a minute to align on this. Give us a moment and we will come back to you with a plan." Then step aside with your co-teacher.', best: true },
        { direction: 'Redirect', text: 'Defer to your co-teacher in front of the student to avoid conflict and discuss it later.', best: false },
        { direction: 'Escalate', text: 'Suggest involving the school counselor to mediate the disagreement about the behavior plan.', best: false },
      ],
      experienced:
        'Disagreeing in front of a student undermines both educators and gives the student a way to play one against the other. Experienced co-teachers have a rule: present a united front in the moment, debate the approach in private. Saying "We are going to align on this" is honest, models healthy communication for the student, and preserves both educators\' authority.',
      commSkill: 'Conflict Resolution',
    },
    es: {
      context: 'Jueves, 10:15 AM. Salon co-ensenado, estudiante en la mesa.',
      scenario:
        'Tu y tu co-maestro/a estan reunidos con un estudiante sobre un plan de comportamiento. Sugieres quitar un privilegio como consecuencia. Tu co-maestro/a dice inmediatamente, frente al estudiante: "No creo que ese sea el enfoque correcto. Se siente punitivo." El estudiante mira entre ustedes dos, confundido.',
      choices: [
        { direction: 'Responder Ahora', text: 'Defender tu enfoque y explicar por que quitar el privilegio tiene sentido.', best: false },
        { direction: 'Esperar', text: 'Decirle al estudiante: "Vamos a tomarnos un minuto para alinear esto. Danos un momento y regresaremos con un plan." Luego apartarte con tu co-maestro/a.', best: true },
        { direction: 'Redirigir', text: 'Ceder ante tu co-maestro/a frente al estudiante para evitar conflicto y discutirlo despues.', best: false },
        { direction: 'Escalar', text: 'Sugerir involucrar al consejero escolar para mediar el desacuerdo sobre el plan de comportamiento.', best: false },
      ],
      experienced:
        'Estar en desacuerdo frente a un estudiante socava a ambos educadores y le da al estudiante una forma de enfrentar a uno contra el otro. Los co-maestros experimentados tienen una regla: presentar un frente unido en el momento, debatir el enfoque en privado.',
      commSkill: 'Resolucion de Conflictos',
    },
  },

  // 11. Veteran teacher gives unsolicited advice
  {
    en: {
      context: 'Monday, 7:30 AM. Teachers\' lounge, before the day starts.',
      scenario:
        'A veteran teacher with 20 years of experience sits down next to you and says, "I saw your lesson plan in the copier. You should not be doing group work with those kids. Trust me, I tried it years ago and it does not work with this population. Just do direct instruction." Their tone is authoritative and final.',
      choices: [
        { direction: 'Respond Now', text: 'Push back and explain the research supporting collaborative learning structures.', best: false },
        { direction: 'Wait', text: 'Say, "I appreciate you looking out for me. I am going to try it and see what happens. If it does not work, I would love to hear how you would adjust it."', best: true },
        { direction: 'Redirect', text: 'Thank them and change the subject to avoid the conversation entirely.', best: false },
        { direction: 'Escalate', text: 'Mention the interaction to your instructional coach and ask them to talk to the veteran.', best: false },
      ],
      experienced:
        'Veteran teachers often give advice from a place of genuine care, even when the advice itself is outdated. Debating research in the teachers\' lounge before 8 AM rarely changes minds. Thanking them sincerely, maintaining your approach, and leaving the door open for future collaboration ("If it does not work, I would love your perspective") is respectful without being deferential. It also models the growth mindset you want your students to have.',
      commSkill: 'Professional Assertiveness',
    },
    es: {
      context: 'Lunes, 7:30 AM. Sala de maestros, antes de que empiece el dia.',
      scenario:
        'Un/a maestro/a veterano/a con 20 anos de experiencia se sienta a tu lado y dice: "Vi tu plan de leccion en la copiadora. No deberias hacer trabajo en grupo con esos estudiantes. Creeme, lo intente hace anos y no funciona con esta poblacion. Solo haz instruccion directa." Su tono es autoritario y definitivo.',
      choices: [
        { direction: 'Responder Ahora', text: 'Responder y explicar la investigacion que respalda las estructuras de aprendizaje colaborativo.', best: false },
        { direction: 'Esperar', text: 'Decir: "Agradezco que te preocupes por mi. Voy a intentarlo y ver que pasa. Si no funciona, me encantaria escuchar como lo ajustarias."', best: true },
        { direction: 'Redirigir', text: 'Agradecerle y cambiar de tema para evitar la conversacion por completo.', best: false },
        { direction: 'Escalar', text: 'Mencionar la interaccion a tu coach instruccional y pedirle que hable con el/la veterano/a.', best: false },
      ],
      experienced:
        'Los maestros veteranos a menudo dan consejos desde un lugar de genuina preocupacion, incluso cuando el consejo en si esta desactualizado. Debatir investigacion en la sala de maestros antes de las 8 AM rara vez cambia opiniones. Agradecer sinceramente, mantener tu enfoque y dejar la puerta abierta para colaboracion futura es respetuoso sin ser sumiso.',
      commSkill: 'Asertividad Profesional',
    },
  },

  // 12. Colleague vents and wants you to agree
  {
    en: {
      context: 'Friday, 12:15 PM. Lunch break, faculty room.',
      scenario:
        'A colleague sits down at lunch visibly frustrated and says, "Can you believe what the principal said in that meeting? She clearly does not understand what it is like in the classroom. I am so done." They look at you, waiting for validation. Two other teachers are listening.',
      choices: [
        { direction: 'Respond Now', text: 'Agree with them to be supportive. "Yeah, that was really frustrating."', best: false },
        { direction: 'Wait', text: 'Validate the emotion without joining the complaint: "It sounds like that really got to you. What specifically bothered you the most?" Then listen.', best: true },
        { direction: 'Redirect', text: 'Change the subject completely to avoid getting pulled into the negativity.', best: false },
        { direction: 'Escalate', text: 'Encourage them to go talk to the principal directly about their frustration.', best: false },
      ],
      experienced:
        'Agreeing with venting about leadership in a shared space normalizes a complaint culture and puts you in a position you did not choose. Changing the subject feels dismissive and damages the relationship. Pushing them to go to the principal right now, while they are heated, is setting them up for a conversation they are not ready for. Validating the emotion ("It sounds like that really got to you") without co-signing the narrative gives them space to process while keeping you professionally safe.',
      commSkill: 'Active Listening',
    },
    es: {
      context: 'Viernes, 12:15 PM. Hora de almuerzo, sala de profesores.',
      scenario:
        'Un/a colega se sienta a almorzar visiblemente frustrado/a y dice: "¿Puedes creer lo que dijo la directora en esa reunion? Claramente no entiende como es estar en el salon. Ya no aguanto." Te mira, esperando validacion. Otros dos maestros/as estan escuchando.',
      choices: [
        { direction: 'Responder Ahora', text: 'Estar de acuerdo para ser solidario/a. "Si, eso fue realmente frustrante."', best: false },
        { direction: 'Esperar', text: 'Validar la emocion sin unirse a la queja: "Parece que eso realmente te afecto. ¿Que fue lo que mas te molesto especificamente?" Luego escuchar.', best: true },
        { direction: 'Redirigir', text: 'Cambiar de tema completamente para evitar ser arrastrado/a a la negatividad.', best: false },
        { direction: 'Escalar', text: 'Animarle a ir a hablar con la directora directamente sobre su frustracion.', best: false },
      ],
      experienced:
        'Estar de acuerdo con desahogos sobre el liderazgo en un espacio compartido normaliza una cultura de queja y te pone en una posicion que no elegiste. Validar la emocion sin co-firmar la narrativa les da espacio para procesar mientras te mantiene profesionalmente seguro/a.',
      commSkill: 'Escucha Activa',
    },
  },

  // 13. Teaching partner always cancels co-planning
  {
    en: {
      context: 'Third cancellation this month. Your shared Google Calendar.',
      scenario:
        'Your teaching partner has canceled co-planning for the third time this month. Each time they have a different reason: a meeting, a parent call, paperwork. You are carrying the planning load alone and starting to resent it. You see them in the hallway heading to the workroom.',
      choices: [
        { direction: 'Respond Now', text: 'Stop them in the hallway and say, "We really need to talk about co-planning. This is not working."', best: false },
        { direction: 'Wait', text: 'Send a brief, direct message: "I have noticed we have missed our last three planning sessions and I am feeling the weight of planning solo. Can we find 20 minutes this week to reset our schedule? I want this to work for both of us."', best: true },
        { direction: 'Redirect', text: 'Start planning independently and stop relying on them for co-planning.', best: false },
        { direction: 'Escalate', text: 'Mention the pattern to your team lead or principal so they can address it.', best: false },
      ],
      experienced:
        'Hallway confrontations feel urgent but rarely produce good outcomes because neither person is prepared. Planning alone solves the short term problem but creates long term resentment and an inequitable workload. Going to admin before talking to the person directly bypasses a relationship skill you both need. A written message that names the pattern, shares your experience ("I am feeling the weight"), and proposes a solution ("Can we find 20 minutes?") is direct, kind, and actionable.',
      commSkill: 'Professional Assertiveness',
    },
    es: {
      context: 'Tercera cancelacion este mes. Tu calendario compartido de Google.',
      scenario:
        'Tu companero/a de ensenanza ha cancelado la co-planificacion por tercera vez este mes. Cada vez tiene una razon diferente: una reunion, una llamada de padres, papeleo. Estas llevando la carga de planificacion solo/a y empezando a sentir resentimiento. Lo/la ves en el pasillo camino a la sala de trabajo.',
      choices: [
        { direction: 'Responder Ahora', text: 'Detenerlo/a en el pasillo y decir: "Realmente necesitamos hablar sobre la co-planificacion. Esto no esta funcionando."', best: false },
        { direction: 'Esperar', text: 'Enviar un mensaje breve y directo: "He notado que hemos perdido nuestras ultimas tres sesiones de planificacion y estoy sintiendo el peso de planificar solo/a. ¿Podemos encontrar 20 minutos esta semana para reorganizar nuestro horario?"', best: true },
        { direction: 'Redirigir', text: 'Empezar a planificar independientemente y dejar de depender de ellos para la co-planificacion.', best: false },
        { direction: 'Escalar', text: 'Mencionar el patron a tu lider de equipo o director/a para que lo aborden.', best: false },
      ],
      experienced:
        'Las confrontaciones en el pasillo se sienten urgentes pero rara vez producen buenos resultados porque ninguna persona esta preparada. Planificar solo/a resuelve el problema a corto plazo pero crea resentimiento a largo plazo. Un mensaje escrito que nombre el patron, comparta tu experiencia e invite a una solucion es directo, amable y accionable.',
      commSkill: 'Asertividad Profesional',
    },
  },

  // 14. Colleague makes a biased comment about a student
  {
    en: {
      context: 'Tuesday, 3:00 PM. Grade-level data meeting.',
      scenario:
        'During a data meeting, a colleague looks at a student\'s test scores and says, "Well, what do you expect? Look at where he comes from. Those kids just do not have the support at home." The room goes quiet. No one says anything. You feel uncomfortable.',
      choices: [
        { direction: 'Respond Now', text: 'Call it out directly: "That comment feels like a deficit-based assumption about the student and their family."', best: false },
        { direction: 'Wait', text: 'Redirect to the data: "I want to make sure we stay focused on what WE can do. What does his data tell us about where to target instruction? What is within our control?"', best: true },
        { direction: 'Redirect', text: 'Stay quiet in the meeting but talk to the colleague privately afterward.', best: false },
        { direction: 'Escalate', text: 'Report the comment to administration as a bias concern.', best: false },
      ],
      experienced:
        'Silence in this moment is complicity. But a direct callout in a group setting ("that is biased") often triggers defensiveness and shuts down the learning. Experienced educators interrupt the pattern by redirecting to student-centered, asset-based thinking: "What does his data tell us about where to target instruction?" This shifts the conversation without attacking the person. If the pattern continues, a private follow up conversation or involving instructional leadership is appropriate.',
      commSkill: 'Redirecting',
    },
    es: {
      context: 'Martes, 3:00 PM. Reunion de datos por grado.',
      scenario:
        'Durante una reunion de datos, un/a colega mira las puntuaciones de un estudiante y dice: "Bueno, ¿que esperas? Mira de donde viene. Esos ninos simplemente no tienen apoyo en casa." La sala queda en silencio. Nadie dice nada. Te sientes incomodo/a.',
      choices: [
        { direction: 'Responder Ahora', text: 'Senalarlo directamente: "Ese comentario parece una suposicion basada en deficit sobre el estudiante y su familia."', best: false },
        { direction: 'Esperar', text: 'Redirigir a los datos: "Quiero asegurarme de que nos mantengamos enfocados en lo que NOSOTROS podemos hacer. ¿Que nos dicen sus datos sobre donde enfocar la instruccion? ¿Que esta dentro de nuestro control?"', best: true },
        { direction: 'Redirigir', text: 'Quedarte en silencio en la reunion pero hablar con el/la colega en privado despues.', best: false },
        { direction: 'Escalar', text: 'Reportar el comentario a la administracion como una preocupacion de sesgo.', best: false },
      ],
      experienced:
        'El silencio en este momento es complicidad. Pero un senalamiento directo en grupo a menudo desencadena defensividad y cierra el aprendizaje. Los educadores experimentados interrumpen el patron redirigiendo hacia un pensamiento centrado en el estudiante y basado en fortalezas.',
      commSkill: 'Redireccion',
    },
  },

  // 15. Overhear staff gossip about a student's family
  {
    en: {
      context: 'Wednesday, 11:45 AM. Hallway near the main office.',
      scenario:
        'Walking to the office, you overhear two staff members talking about a student\'s family situation: "Did you hear about Marcus\'s mom? She just got out of jail. No wonder that kid acts the way he does." They do not see you, but a student aide is nearby and may have heard.',
      choices: [
        { direction: 'Respond Now', text: 'Walk up immediately and tell them that conversation is inappropriate and needs to stop.', best: false },
        { direction: 'Wait', text: 'Make your presence known casually, then privately pull one of them aside: "I know you probably did not mean harm, but student family information in the hallway puts us in a tough spot. Especially with students nearby."', best: true },
        { direction: 'Redirect', text: 'Ignore it since confronting colleagues about gossip creates conflict.', best: false },
        { direction: 'Escalate', text: 'Report the conversation to your principal as a FERPA and professionalism concern.', best: false },
      ],
      experienced:
        'Student privacy is not optional, and hallway conversations about family situations can cause real harm. But a public correction in the moment creates enemies. Experienced educators address it privately, lead with the assumption of good intent ("I know you probably did not mean harm"), and name the specific risk ("with students nearby"). If the behavior is a pattern, escalation is appropriate. But the first step is always a direct, private conversation.',
      commSkill: 'Confidentiality',
    },
    es: {
      context: 'Miercoles, 11:45 AM. Pasillo cerca de la oficina principal.',
      scenario:
        'Caminando hacia la oficina, escuchas a dos miembros del personal hablando sobre la situacion familiar de un estudiante: "¿Escuchaste sobre la mama de Marcus? Acaba de salir de la carcel. Con razon ese nino se comporta como lo hace." No te ven, pero un asistente estudiantil esta cerca y puede haber escuchado.',
      choices: [
        { direction: 'Responder Ahora', text: 'Acercarte inmediatamente y decirles que esa conversacion es inapropiada y necesita detenerse.', best: false },
        { direction: 'Esperar', text: 'Hacer notar tu presencia casualmente, luego apartar a uno/a de ellos en privado: "Se que probablemente no fue con mala intencion, pero la informacion familiar de estudiantes en el pasillo nos pone en una posicion dificil. Especialmente con estudiantes cerca."', best: true },
        { direction: 'Redirigir', text: 'Ignorarlo ya que confrontar a colegas sobre chismes crea conflicto.', best: false },
        { direction: 'Escalar', text: 'Reportar la conversacion a tu director/a como una preocupacion de FERPA y profesionalismo.', best: false },
      ],
      experienced:
        'La privacidad del estudiante no es opcional, y las conversaciones en el pasillo sobre situaciones familiares pueden causar dano real. Pero una correccion publica en el momento crea enemigos. Los educadores experimentados lo abordan en privado, lideran con la presuncion de buena intencion y nombran el riesgo especifico.',
      commSkill: 'Confidencialidad',
    },
  },

  // 16. Colleague borrows materials and returns them damaged
  {
    en: {
      context: 'Friday, 2:30 PM. Your classroom, after students leave.',
      scenario:
        'A colleague borrowed your set of 30 math manipulatives for the week. They just returned them with 6 missing and several broken. This is the second time this has happened. They drop them off with a casual "Thanks!" and start walking away.',
      choices: [
        { direction: 'Respond Now', text: 'Stop them and say, "Six are missing and some are broken. This is the second time this has happened."', best: false },
        { direction: 'Wait', text: 'Catch them before they leave and say warmly, "Hey, I noticed a few are missing and some are damaged. I want to keep sharing, but I need them returned in the same condition. Can we figure out a system that works for both of us?"', best: true },
        { direction: 'Redirect', text: 'Stop lending materials to this colleague and make an excuse next time they ask.', best: false },
        { direction: 'Escalate', text: 'Ask your principal to send a building-wide reminder about shared resource responsibility.', best: false },
      ],
      experienced:
        'The direct confrontation approach names the problem but not the path forward, and can feel accusatory. Avoiding the conversation entirely builds resentment and means you either lose materials or lose the relationship. Asking the principal to send a building-wide email is a passive way to address one person. The best approach is warm and direct in the moment: name it, share what you need, and propose a solution together.',
      commSkill: 'Boundary Setting',
    },
    es: {
      context: 'Viernes, 2:30 PM. Tu salon, despues de que se van los estudiantes.',
      scenario:
        'Un/a colega tomo prestado tu set de 30 manipulativos de matematicas por la semana. Acaban de devolverlos con 6 faltantes y varios rotos. Esta es la segunda vez que esto pasa. Los dejan con un casual "¡Gracias!" y empiezan a irse.',
      choices: [
        { direction: 'Responder Ahora', text: 'Detenerlo/a y decir: "Faltan seis y algunos estan rotos. Esta es la segunda vez que pasa."', best: false },
        { direction: 'Esperar', text: 'Alcanzarlo/a antes de que se vaya y decir calidamente: "Oye, note que faltan algunos y otros estan danados. Quiero seguir compartiendo, pero necesito que me los devuelvan en la misma condicion. ¿Podemos encontrar un sistema que funcione para ambos?"', best: true },
        { direction: 'Redirigir', text: 'Dejar de prestar materiales a este/a colega y poner una excusa la proxima vez que pidan.', best: false },
        { direction: 'Escalar', text: 'Pedirle a tu director/a que envie un recordatorio a todo el edificio sobre la responsabilidad con recursos compartidos.', best: false },
      ],
      experienced:
        'La confrontacion directa nombra el problema pero no el camino a seguir. Evitar la conversacion por completo genera resentimiento. El mejor enfoque es calido y directo en el momento: nombralo, comparte lo que necesitas y propone una solucion juntos.',
      commSkill: 'Establecimiento de Limites',
    },
  },

  // 17. Student says "I don't care" when given feedback
  {
    en: {
      context: 'Thursday, 1:30 PM. Your desk, one-on-one with a 7th grader.',
      scenario:
        'You pull a student aside to give them specific, positive feedback on their writing improvement. They shrug and say, "I do not care. It does not matter anyway." Their body language is closed off: arms crossed, looking away. You know they have been struggling at home.',
      choices: [
        { direction: 'Respond Now', text: 'Press the point: "But you should care. You have improved so much and I want you to see that."', best: false },
        { direction: 'Wait', text: 'Acknowledge what you see: "I hear you. And I am not going to argue with you about it. I just want you to know that I noticed." Then give them space.', best: true },
        { direction: 'Redirect', text: 'Move on to instruction and do not bring up the feedback again to avoid making them uncomfortable.', best: false },
        { direction: 'Escalate', text: 'Refer the student to the school counselor because their response suggests they need emotional support.', best: false },
      ],
      experienced:
        '"I do not care" is almost never about not caring. It is a shield. Pushing harder makes the shield thicker. Dropping it entirely sends the message that you agree it does not matter. The most powerful move is the one that does not require anything from them: "I am not going to argue. I just want you to know I noticed." Plant the seed and walk away. Consistency over time matters more than any single conversation.',
      commSkill: 'Empathy First',
    },
    es: {
      context: 'Jueves, 1:30 PM. Tu escritorio, uno a uno con un estudiante de 7mo grado.',
      scenario:
        'Apartas a un estudiante para darle retroalimentacion especifica y positiva sobre su mejora en escritura. Se encoge de hombros y dice: "No me importa. De todos modos no importa." Su lenguaje corporal esta cerrado: brazos cruzados, mirando hacia otro lado. Sabes que ha estado luchando en casa.',
      choices: [
        { direction: 'Responder Ahora', text: 'Insistir en el punto: "Pero deberia importarte. Has mejorado mucho y quiero que lo veas."', best: false },
        { direction: 'Esperar', text: 'Reconocer lo que ves: "Te escucho. Y no voy a discutir contigo al respecto. Solo quiero que sepas que lo note." Luego darle espacio.', best: true },
        { direction: 'Redirigir', text: 'Pasar a la instruccion y no volver a mencionar la retroalimentacion para evitar incomodarlo/a.', best: false },
        { direction: 'Escalar', text: 'Referir al estudiante al consejero escolar porque su respuesta sugiere que necesita apoyo emocional.', best: false },
      ],
      experienced:
        '"No me importa" casi nunca se trata de no importarle. Es un escudo. Presionar mas hace el escudo mas grueso. Dejarlo por completo envia el mensaje de que estas de acuerdo en que no importa. El movimiento mas poderoso es el que no requiere nada de ellos: "No voy a discutir. Solo quiero que sepas que lo note."',
      commSkill: 'Empatia Primero',
    },
  },

  // 18. Student discloses something concerning
  {
    en: {
      context: 'Wednesday, 11:00 AM. Quiet moment during independent work.',
      scenario:
        'A student leans over during independent work and quietly says, "I do not want to go home today." When you ask why, they say, "Things are bad. My mom\'s boyfriend is scary when he drinks." The student looks at you with wide eyes. The rest of the class is still working.',
      choices: [
        { direction: 'Respond Now', text: 'Ask follow-up questions to get more details about what is happening at home.', best: false },
        { direction: 'Wait', text: 'Say, "Thank you for trusting me. I am going to make sure someone who can help knows about this. You did the right thing by telling me." Then follow your mandatory reporting protocol immediately.', best: true },
        { direction: 'Redirect', text: 'Tell the student, "That sounds hard. Let me know if you need anything" and continue with the lesson.', best: false },
        { direction: 'Escalate', text: 'Walk the student to the counselor\'s office right now so they can share their story with a professional.', best: false },
      ],
      experienced:
        'When a student discloses, your job is to listen, validate, and report. Not to investigate, counsel, or determine whether it is "serious enough." Asking detailed follow-up questions can re-traumatize the student and is not your role. Dismissing it or delaying reporting puts the child at risk. Walking them to a counselor mid-class draws attention they did not ask for. The best response is brief, warm, clear, and followed by immediate action through proper channels.',
      commSkill: 'Confidentiality',
    },
    es: {
      context: 'Miercoles, 11:00 AM. Momento tranquilo durante trabajo independiente.',
      scenario:
        'Un estudiante se inclina durante el trabajo independiente y dice en voz baja: "No quiero ir a casa hoy." Cuando preguntas por que, dice: "Las cosas estan mal. El novio de mi mama da miedo cuando toma." El estudiante te mira con ojos grandes. El resto de la clase sigue trabajando.',
      choices: [
        { direction: 'Responder Ahora', text: 'Hacer preguntas de seguimiento para obtener mas detalles sobre lo que esta pasando en casa.', best: false },
        { direction: 'Esperar', text: 'Decir: "Gracias por confiar en mi. Voy a asegurarme de que alguien que pueda ayudar sepa sobre esto. Hiciste lo correcto al decirmelo." Luego seguir tu protocolo de reporte obligatorio inmediatamente.', best: true },
        { direction: 'Redirigir', text: 'Decirle al estudiante: "Eso suena dificil. Dejame saber si necesitas algo" y continuar con la leccion.', best: false },
        { direction: 'Escalar', text: 'Llevar al estudiante a la oficina del consejero ahora mismo para que compartan su historia con un profesional.', best: false },
      ],
      experienced:
        'Cuando un estudiante revela algo, tu trabajo es escuchar, validar y reportar. No investigar, aconsejar o determinar si es "suficientemente serio." La mejor respuesta es breve, calida, clara y seguida de accion inmediata a traves de los canales apropiados.',
      commSkill: 'Confidencialidad',
    },
  },

  // 19. Student accuses you of being unfair in front of the class
  {
    en: {
      context: 'Tuesday, 9:45 AM. Full class, 28 students watching.',
      scenario:
        'You redirect a student for talking during instruction. The student stands up and says loudly, "You always pick on me! You never say anything to anyone else. This is not fair!" Every student in the room is now watching you. The room is completely silent.',
      choices: [
        { direction: 'Respond Now', text: 'Firmly explain that you treat all students the same and give specific examples of times you have redirected others.', best: false },
        { direction: 'Wait', text: 'Lower your voice and say calmly, "I hear you, and I want to talk about this. Right now is not the moment. Let us connect at the break so I can actually listen." Then resume instruction.', best: true },
        { direction: 'Redirect', text: 'Ignore the outburst completely and continue teaching as if nothing happened.', best: false },
        { direction: 'Escalate', text: 'Send the student to the office for being disruptive and disrespectful.', best: false },
      ],
      experienced:
        'Public power struggles have no winners. Defending yourself in front of the class turns it into a debate where both of you lose credibility. Ignoring it signals to every student that they can challenge you without consequence. Sending the student out removes the tension but damages the relationship and teaches nothing. Lowering your voice, acknowledging the feeling ("I hear you"), and deferring to a private moment ("Let us connect at the break") de-escalates while preserving both your authority and the student\'s dignity.',
      commSkill: 'De-escalation',
    },
    es: {
      context: 'Martes, 9:45 AM. Clase completa, 28 estudiantes mirando.',
      scenario:
        'Rediriges a un estudiante por hablar durante la instruccion. El estudiante se pone de pie y dice en voz alta: "¡Siempre me senala a mi! Nunca le dice nada a nadie mas. ¡Esto no es justo!" Cada estudiante en la sala te esta mirando. La sala esta completamente en silencio.',
      choices: [
        { direction: 'Responder Ahora', text: 'Explicar firmemente que tratas a todos los estudiantes igual y dar ejemplos especificos de veces que has redirigido a otros.', best: false },
        { direction: 'Esperar', text: 'Bajar la voz y decir con calma: "Te escucho, y quiero hablar sobre esto. Ahora no es el momento. Conectemos en el descanso para que pueda realmente escucharte." Luego reanudar la instruccion.', best: true },
        { direction: 'Redirigir', text: 'Ignorar el arrebato completamente y continuar ensenando como si nada hubiera pasado.', best: false },
        { direction: 'Escalar', text: 'Enviar al estudiante a la oficina por ser disruptivo e irrespetuoso.', best: false },
      ],
      experienced:
        'Las luchas de poder publicas no tienen ganadores. Defenderte frente a la clase lo convierte en un debate donde ambos pierden credibilidad. Bajar la voz, reconocer el sentimiento y diferir a un momento privado desescala mientras preserva tu autoridad y la dignidad del estudiante.',
      commSkill: 'Desescalada',
    },
  },

  // 20. Two students in a heated argument, both want you to take sides
  {
    en: {
      context: 'Monday, 12:50 PM. Cafeteria transition, hallway.',
      scenario:
        'Two students are in a heated argument in the hallway after lunch. Both rush to you at the same time: "She started it!" "No, HE started it!" "Tell him he is wrong!" They are both talking over each other, voices rising. Other students are gathering to watch.',
      choices: [
        { direction: 'Respond Now', text: 'Listen to both sides right there in the hallway and make a judgment about who is right.', best: false },
        { direction: 'Wait', text: 'Separate them physically, lower your voice, and say, "I want to hear both of you. But not like this and not here. Take a breath. I am going to talk to each of you one at a time." Then move them to a private space.', best: true },
        { direction: 'Redirect', text: 'Tell both students to drop it and get to class, and deal with it later if it comes up again.', best: false },
        { direction: 'Escalate', text: 'Send both students to the office and let the dean sort it out.', best: false },
      ],
      experienced:
        'Trying to mediate a hallway argument with an audience guarantees escalation. Telling them to "just drop it" teaches them that conflict resolution means avoidance. Sending both to the office removes your opportunity to teach. Separating them, lowering the emotional temperature, and creating a private, structured space to hear each person individually models exactly what you want them to learn: how to handle conflict without an audience.',
      commSkill: 'De-escalation',
    },
    es: {
      context: 'Lunes, 12:50 PM. Transicion de cafeteria, pasillo.',
      scenario:
        'Dos estudiantes estan en una discusion acalorada en el pasillo despues del almuerzo. Ambos corren hacia ti al mismo tiempo: "¡Ella empezo!" "¡No, EL empezo!" "¡Dile que esta equivocado!" Ambos hablan al mismo tiempo, las voces subiendo. Otros estudiantes se estan reuniendo para mirar.',
      choices: [
        { direction: 'Responder Ahora', text: 'Escuchar ambos lados alli mismo en el pasillo y hacer un juicio sobre quien tiene razon.', best: false },
        { direction: 'Esperar', text: 'Separarlos fisicamente, bajar la voz y decir: "Quiero escucharlos a ambos. Pero no asi y no aqui. Respiren. Voy a hablar con cada uno por separado." Luego moverlos a un espacio privado.', best: true },
        { direction: 'Redirigir', text: 'Decirle a ambos estudiantes que lo dejen y vayan a clase, y lidiar con ello despues si surge de nuevo.', best: false },
        { direction: 'Escalar', text: 'Enviar a ambos estudiantes a la oficina y dejar que el decano lo resuelva.', best: false },
      ],
      experienced:
        'Tratar de mediar una discusion en el pasillo con audiencia garantiza la escalada. Separarlos, bajar la temperatura emocional y crear un espacio privado y estructurado para escuchar a cada persona individualmente modela exactamente lo que quieres que aprendan.',
      commSkill: 'Desescalada',
    },
  },

  // 21. Student asks a personal question you are not comfortable answering
  {
    en: {
      context: 'Friday, 1:00 PM. Small group work, casual conversation.',
      scenario:
        'During small group time, a student asks, "Do you have kids? Are you married? How old are you?" Other students in the group lean in, curious. The questions feel innocent, but you are not comfortable sharing personal details with students.',
      choices: [
        { direction: 'Respond Now', text: 'Answer the questions honestly since building relationships with students means being open.', best: false },
        { direction: 'Wait', text: 'Smile and say, "I appreciate the curiosity! I keep some things private because that is my boundary. But I will tell you this: my favorite book right now is..." Redirect to something you are comfortable sharing.', best: true },
        { direction: 'Redirect', text: 'Tell them firmly, "That is not appropriate to ask your teacher."', best: false },
        { direction: 'Escalate', text: 'Use it as a teachable moment about privacy and personal boundaries for the whole class.', best: false },
      ],
      experienced:
        'Students ask personal questions because they are building connection, not crossing lines. Shutting them down harshly damages the relationship. Oversharing can blur professional boundaries. The experienced move is to honor the curiosity, name your boundary with warmth, and redirect to something you can share. This models healthy boundary setting, which is a skill you want your students to develop too.',
      commSkill: 'Boundary Setting',
    },
    es: {
      context: 'Viernes, 1:00 PM. Trabajo en grupos pequenos, conversacion casual.',
      scenario:
        'Durante el tiempo de grupo pequeno, un estudiante pregunta: "¿Tienes hijos? ¿Estas casado/a? ¿Cuantos anos tienes?" Otros estudiantes del grupo se inclinan, curiosos. Las preguntas parecen inocentes, pero no te sientes comodo/a compartiendo detalles personales con estudiantes.',
      choices: [
        { direction: 'Responder Ahora', text: 'Responder las preguntas honestamente ya que construir relaciones con estudiantes significa ser abierto/a.', best: false },
        { direction: 'Esperar', text: 'Sonreir y decir: "¡Aprecio la curiosidad! Mantengo algunas cosas privadas porque ese es mi limite. Pero te dire esto: mi libro favorito ahora mismo es..." Redirigir a algo que te sientas comodo/a compartiendo.', best: true },
        { direction: 'Redirigir', text: 'Decirles firmemente: "Eso no es apropiado preguntarle a tu maestro/a."', best: false },
        { direction: 'Escalar', text: 'Usarlo como un momento de ensenanza sobre la privacidad y los limites personales para toda la clase.', best: false },
      ],
      experienced:
        'Los estudiantes hacen preguntas personales porque estan construyendo conexion, no cruzando lineas. Cortarlos bruscamente dana la relacion. Compartir de mas puede difuminar los limites profesionales. El movimiento experimentado es honrar la curiosidad, nombrar tu limite con calidez y redirigir a algo que puedas compartir.',
      commSkill: 'Establecimiento de Limites',
    },
  },

  // 22. Principal gives critical feedback you disagree with
  {
    en: {
      context: 'Thursday, 4:00 PM. Post-observation debrief in the principal\'s office.',
      scenario:
        'Your principal just observed your lesson and says, "I noticed you spent too long on the warm-up and did not get to the main activity. You need to tighten your pacing." You disagree. The warm-up ran long because students were deeply engaged in a discussion that connected to the lesson objective. You feel the feedback misses the point.',
      choices: [
        { direction: 'Respond Now', text: 'Explain immediately why the warm-up ran long and why the student engagement was more valuable than strict pacing.', best: false },
        { direction: 'Wait', text: 'Listen fully, take a breath, and say, "I hear you on pacing. Can I share my thinking? The discussion connected directly to the objective, and students were doing the thinking I wanted. I would love your take on when engagement like that is worth protecting versus when to cut it."', best: true },
        { direction: 'Redirect', text: 'Accept the feedback verbally but do not change anything in your practice.', best: false },
        { direction: 'Escalate', text: 'Ask to see the formal observation rubric so you can review the criteria they used.', best: false },
      ],
      experienced:
        'Jumping to defend yourself before fully hearing the feedback signals that you are not coachable. Accepting it passively when you disagree breeds resentment and does not grow either of you. Pulling out the rubric feels adversarial. The experienced move is to acknowledge the observation, share your pedagogical reasoning, and invite dialogue. "Can I share my thinking?" turns a one-way evaluation into a two-way professional conversation.',
      commSkill: 'Professional Assertiveness',
    },
    es: {
      context: 'Jueves, 4:00 PM. Debriefing post-observacion en la oficina del director.',
      scenario:
        'Tu director/a acaba de observar tu leccion y dice: "Note que pasaste demasiado tiempo en la actividad de calentamiento y no llegaste a la actividad principal. Necesitas ajustar tu ritmo." No estas de acuerdo. El calentamiento se extendio porque los estudiantes estaban profundamente involucrados en una discusion conectada al objetivo de la leccion.',
      choices: [
        { direction: 'Responder Ahora', text: 'Explicar inmediatamente por que el calentamiento se extendio y por que la participacion estudiantil fue mas valiosa que el ritmo estricto.', best: false },
        { direction: 'Esperar', text: 'Escuchar completamente, respirar y decir: "Escucho tu punto sobre el ritmo. ¿Puedo compartir mi pensamiento? La discusion se conecto directamente con el objetivo, y los estudiantes estaban haciendo el pensamiento que yo queria. Me encantaria tu opinion sobre cuando ese tipo de participacion vale la pena proteger."', best: true },
        { direction: 'Redirigir', text: 'Aceptar la retroalimentacion verbalmente pero no cambiar nada en tu practica.', best: false },
        { direction: 'Escalar', text: 'Pedir ver la rubrica formal de observacion para revisar los criterios que usaron.', best: false },
      ],
      experienced:
        'Saltar a defenderte antes de escuchar completamente la retroalimentacion senala que no eres receptivo/a al coaching. El movimiento experimentado es reconocer la observacion, compartir tu razonamiento pedagogico e invitar al dialogo.',
      commSkill: 'Asertividad Profesional',
    },
  },

  // 23. Push back on a new policy without burning bridges
  {
    en: {
      context: 'Monday, 3:30 PM. Staff meeting, new policy announcement.',
      scenario:
        'Your principal announces that all teachers must submit detailed lesson plans every Friday for the following week. You and several colleagues feel this is micromanagement and does not improve teaching. The principal asks, "Any questions?" The room is quiet. You want to speak up.',
      choices: [
        { direction: 'Respond Now', text: 'Raise your hand and say this feels like micromanagement and ask what problem it is trying to solve.', best: false },
        { direction: 'Wait', text: 'Raise your hand and say, "I want to make sure I understand the goal behind this. Can you help me see what problem this solves? I want to support it, and knowing the why will help me and my team get there."', best: true },
        { direction: 'Redirect', text: 'Say nothing in the meeting but organize colleagues to push back together privately.', best: false },
        { direction: 'Escalate', text: 'Bring the concern to the union representative as a workload issue.', best: false },
      ],
      experienced:
        'Using the word "micromanagement" in a public meeting is a conversation ender. Organizing a backdoor coalition damages trust with leadership. Going straight to the union before talking to the principal skips a critical step. Asking "What problem does this solve?" in a genuinely curious way is the most powerful pushback tool an educator has. It forces the principal to articulate the why, which either reveals a legitimate purpose or exposes that the policy needs revision.',
      commSkill: 'Professional Assertiveness',
    },
    es: {
      context: 'Lunes, 3:30 PM. Reunion de personal, anuncio de nueva politica.',
      scenario:
        'Tu director/a anuncia que todos los maestros deben entregar planes de leccion detallados cada viernes para la siguiente semana. Tu y varios colegas sienten que esto es microgestion y no mejora la ensenanza. El/la director/a pregunta: "¿Alguna pregunta?" La sala esta en silencio. Quieres hablar.',
      choices: [
        { direction: 'Responder Ahora', text: 'Levantar la mano y decir que esto se siente como microgestion y preguntar que problema intenta resolver.', best: false },
        { direction: 'Esperar', text: 'Levantar la mano y decir: "Quiero asegurarme de entender el objetivo detras de esto. ¿Puedes ayudarme a ver que problema resuelve? Quiero apoyarlo, y conocer el por que me ayudara a mi y a mi equipo a llegar ahi."', best: true },
        { direction: 'Redirigir', text: 'No decir nada en la reunion pero organizar a los colegas para hacer presion juntos en privado.', best: false },
        { direction: 'Escalar', text: 'Llevar la preocupacion al representante sindical como un tema de carga laboral.', best: false },
      ],
      experienced:
        'Usar la palabra "microgestion" en una reunion publica es un finalizador de conversaciones. Preguntar "¿Que problema resuelve esto?" de una manera genuinamente curiosa es la herramienta de resistencia mas poderosa que tiene un educador.',
      commSkill: 'Asertividad Profesional',
    },
  },

  // 24. IEP team member dismisses your observations
  {
    en: {
      context: 'Wednesday, 2:00 PM. IEP meeting, six team members present.',
      scenario:
        'During an IEP meeting, you share your observation that a student needs more support with executive functioning. The special education coordinator waves their hand and says, "That is not really your area. Let us focus on the academic goals." You know the executive functioning challenges are directly affecting the academic performance.',
      choices: [
        { direction: 'Respond Now', text: 'Push back firmly: "With all due respect, I am in the classroom every day and I see the connection."', best: false },
        { direction: 'Wait', text: 'Ground it in evidence: "I understand. Let me share a specific example. Last week, the student could not start the assignment because they could not organize their materials. The academic gap is connected to the executive functioning piece. Can we look at that connection together?"', best: true },
        { direction: 'Redirect', text: 'Let it go in the meeting and bring it up with the coordinator privately later.', best: false },
        { direction: 'Escalate', text: 'Request that your concern be formally documented in the meeting notes even if the team disagrees.', best: false },
      ],
      experienced:
        'When someone dismisses your observation in an IEP meeting, getting defensive rarely changes minds. But letting it go means the student misses a support they need. The most effective approach is to anchor your point in a concrete, observable example that connects your observation to the academic outcome. Data and specifics are harder to dismiss than general impressions. "Let me share a specific example" reframes you as a data source, not an opinion.',
      commSkill: 'Professional Assertiveness',
    },
    es: {
      context: 'Miercoles, 2:00 PM. Reunion IEP, seis miembros del equipo presentes.',
      scenario:
        'Durante una reunion IEP, compartes tu observacion de que un estudiante necesita mas apoyo con funciones ejecutivas. La coordinadora de educacion especial agita la mano y dice: "Eso no es realmente tu area. Enfoquemonos en los objetivos academicos." Sabes que los desafios de funciones ejecutivas estan afectando directamente el rendimiento academico.',
      choices: [
        { direction: 'Responder Ahora', text: 'Resistir firmemente: "Con todo respeto, estoy en el salon todos los dias y veo la conexion."', best: false },
        { direction: 'Esperar', text: 'Fundamentarlo en evidencia: "Entiendo. Dejame compartir un ejemplo especifico. La semana pasada, el estudiante no pudo comenzar la tarea porque no podia organizar sus materiales. La brecha academica esta conectada con las funciones ejecutivas. ¿Podemos ver esa conexion juntos?"', best: true },
        { direction: 'Redirigir', text: 'Dejarlo pasar en la reunion y mencionarlo con la coordinadora en privado despues.', best: false },
        { direction: 'Escalar', text: 'Solicitar que tu preocupacion sea documentada formalmente en las notas de la reunion aunque el equipo no este de acuerdo.', best: false },
      ],
      experienced:
        'Cuando alguien desestima tu observacion en una reunion IEP, ponerse a la defensiva rara vez cambia opiniones. Pero dejarlo pasar significa que el estudiante pierde un apoyo que necesita. El enfoque mas efectivo es anclar tu punto en un ejemplo concreto y observable.',
      commSkill: 'Asertividad Profesional',
    },
  },

  // 25. Harsh email from colleague, want to respond immediately
  {
    en: {
      context: 'Thursday, 7:45 AM. Your inbox, before students arrive.',
      scenario:
        'You open an email from a colleague that reads: "I am tired of picking up the slack on shared duties. It is clear that some people on this team do not pull their weight. I have documented everything." You feel your face flush. You are certain the email is aimed at you. Your instinct is to fire back.',
      choices: [
        { direction: 'Respond Now', text: 'Reply immediately, defending yourself and asking them to specify what they mean by "some people."', best: false },
        { direction: 'Wait', text: 'Close the email. Do not respond for at least a few hours. When you do, write something like: "I read your email and I can tell you are frustrated. I would rather talk about this in person than over email. Can we find time today?"', best: true },
        { direction: 'Redirect', text: 'Forward the email to your principal and let them know you feel targeted.', best: false },
        { direction: 'Escalate', text: 'Reply-all to the team to address the accusations publicly and set the record straight.', best: false },
      ],
      experienced:
        'Email is the worst medium for conflict. Tone is lost, words are permanent, and escalation happens fast. Responding when your face is flushed guarantees you will say something you cannot take back. Forwarding to admin before talking to the person directly makes it a formal issue before it needs to be. Reply-all turns a two person conflict into a team explosion. The experienced move is to pause, let the adrenaline pass, and move the conversation to a medium where tone and nuance can be read: face to face.',
      commSkill: 'Timing',
    },
    es: {
      context: 'Jueves, 7:45 AM. Tu bandeja de entrada, antes de que lleguen los estudiantes.',
      scenario:
        'Abres un correo de un/a colega que dice: "Estoy cansado/a de cargar con el trabajo de las responsabilidades compartidas. Es claro que algunas personas en este equipo no hacen su parte. He documentado todo." Sientes que tu cara se enrojece. Estas seguro/a de que el correo va dirigido a ti. Tu instinto es responder con fuerza.',
      choices: [
        { direction: 'Responder Ahora', text: 'Responder inmediatamente, defendiendote y pidiendoles que especifiquen que quieren decir con "algunas personas."', best: false },
        { direction: 'Esperar', text: 'Cerrar el correo. No responder por al menos unas horas. Cuando lo hagas, escribir algo como: "Lei tu correo y puedo ver que estas frustrado/a. Preferiria hablar de esto en persona que por correo. ¿Podemos encontrar tiempo hoy?"', best: true },
        { direction: 'Redirigir', text: 'Reenviar el correo a tu director/a y hacerle saber que te sientes atacado/a.', best: false },
        { direction: 'Escalar', text: 'Responder a todos en el equipo para abordar las acusaciones publicamente y aclarar las cosas.', best: false },
      ],
      experienced:
        'El correo electronico es el peor medio para el conflicto. El tono se pierde, las palabras son permanentes y la escalada sucede rapido. Responder cuando tu cara esta roja garantiza que diras algo que no puedes retirar. El movimiento experimentado es pausar, dejar que pase la adrenalina y mover la conversacion a un medio donde el tono y los matices se puedan leer: cara a cara.',
      commSkill: 'Timing',
    },
  },
]

export const COMPASS_SCENARIO_COUNT = 10
