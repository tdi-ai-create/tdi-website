// Prioritize This -- rank tasks in order of impact

export interface PrioritizeRound {
  en: { situation: string }
  es: { situation: string }
  tasks: {
    en: string
    es: string
    rank: number // 1 = highest priority
    explanation: { en: string; es: string }
  }[]
}

export const PRIORITIZE_ROUNDS: PrioritizeRound[] = [
  {
    en: { situation: 'It is Monday morning, 15 minutes before students arrive. You just found out a fire drill is at 10 AM, a parent wants to meet at lunch, and your printer is jammed.' },
    es: { situation: 'Es lunes por la manana, 15 minutos antes de que lleguen los estudiantes. Acabas de enterarte que hay un simulacro de incendio a las 10 AM, un padre quiere reunirse a la hora del almuerzo y tu impresora esta atascada.' },
    tasks: [
      { en: 'Adjust your 10 AM lesson plan around the fire drill', es: 'Ajustar tu plan de leccion de las 10 AM para el simulacro', rank: 1, explanation: { en: 'This directly impacts student learning and happens first. Everything else can wait.', es: 'Esto impacta directamente el aprendizaje y sucede primero.' } },
      { en: 'Reply to the parent to confirm the lunch meeting', es: 'Responder al padre para confirmar la reunion del almuerzo', rank: 2, explanation: { en: 'A quick reply keeps the relationship strong. Takes 30 seconds.', es: 'Una respuesta rapida mantiene la relacion. Toma 30 segundos.' } },
      { en: 'Fix the printer', es: 'Arreglar la impresora', rank: 4, explanation: { en: 'Can you teach without it today? Probably. This is not urgent.', es: 'Puedes ensenar sin ella hoy? Probablemente. Esto no es urgente.' } },
      { en: 'Greet students at the door', es: 'Recibir a los estudiantes en la puerta', rank: 3, explanation: { en: 'Connection matters more than logistics. But if the lesson plan is not ready, that stress shows. Handle the plan first, then be present.', es: 'La conexion importa mas que la logistica. Pero si el plan no esta listo, ese estres se nota.' } },
    ],
  },
  {
    en: { situation: 'A student is crying in the hallway. You have a class of 28 waiting inside. Your co-teacher is absent today.' },
    es: { situation: 'Un estudiante esta llorando en el pasillo. Tienes una clase de 28 esperando adentro. Tu co-maestro esta ausente hoy.' },
    tasks: [
      { en: 'Acknowledge the crying student: "I see you. Give me 30 seconds."', es: 'Reconocer al estudiante que llora: "Te veo. Dame 30 segundos."', rank: 1, explanation: { en: 'A brief acknowledgment costs nothing and tells the student they matter. They do not need a full conversation right now -- just to know you see them.', es: 'Un breve reconocimiento no cuesta nada y le dice al estudiante que importa.' } },
      { en: 'Get your class started on an independent task', es: 'Poner a tu clase a trabajar en una tarea independiente', rank: 2, explanation: { en: 'Get the 28 settled so you can give the 1 your attention. This is triage, not neglect.', es: 'Acomoda a los 28 para poder darle atencion al 1. Esto es triaje, no descuido.' } },
      { en: 'Call the office for support', es: 'Llamar a la oficina para apoyo', rank: 3, explanation: { en: 'If available, a counselor or admin can help. But do not wait for them -- start with steps 1 and 2.', es: 'Si esta disponible, un consejero puede ayudar. Pero no esperes -- comienza con los pasos 1 y 2.' } },
      { en: 'Bring the student into the classroom', es: 'Traer al estudiante al salon', rank: 4, explanation: { en: 'A crying student may not want 28 peers watching. Let them compose themselves first or find a quieter space.', es: 'Un estudiante llorando puede no querer que 28 companeros lo vean.' } },
    ],
  },
  {
    en: { situation: 'You have 2 hours on Sunday to prep for the week. You are behind on grading, need to plan Tuesday\'s lesson, and have 15 unread parent emails.' },
    es: { situation: 'Tienes 2 horas el domingo para prepararte para la semana. Estas atrasado en calificaciones, necesitas planificar la leccion del martes y tienes 15 correos de padres sin leer.' },
    tasks: [
      { en: 'Plan Tuesday\'s lesson', es: 'Planificar la leccion del martes', rank: 1, explanation: { en: 'Teaching is your core job. Walking in prepared on Tuesday reduces stress all week. Grading can be caught up but a bad lesson cannot be undone.', es: 'Ensenar es tu trabajo principal. Llegar preparado el martes reduce el estres de toda la semana.' } },
      { en: 'Scan parent emails for anything urgent', es: 'Revisar correos de padres por algo urgente', rank: 2, explanation: { en: 'A quick scan (not full replies) takes 5 minutes and catches anything that cannot wait. Respond to urgent ones only.', es: 'Un vistazo rapido toma 5 minutos y detecta lo que no puede esperar.' } },
      { en: 'Catch up on grading', es: 'Ponerse al dia con las calificaciones', rank: 3, explanation: { en: 'Important but not as time-sensitive as tomorrow\'s lesson. Can you grade during a planning period this week instead?', es: 'Importante pero no tan urgente como la leccion de manana.' } },
      { en: 'Reply to all 15 parent emails', es: 'Responder los 15 correos de padres', rank: 4, explanation: { en: 'Full replies to all 15 will eat your entire 2 hours. Scan for urgent, batch the rest for a school-hours block.', es: 'Respuestas completas a los 15 consumiran tus 2 horas.' } },
    ],
  },
  {
    en: { situation: 'End of the school year. You need to finish report cards, return textbooks, pack your room, and say proper goodbyes to students.' },
    es: { situation: 'Fin del ano escolar. Necesitas terminar las boletas, devolver los libros de texto, empacar tu salon y despedirte adecuadamente de los estudiantes.' },
    tasks: [
      { en: 'Say proper goodbyes to students', es: 'Despedirte adecuadamente de los estudiantes', rank: 1, explanation: { en: 'This is the one thing you cannot redo. Report cards have a deadline but goodbyes have a moment. Your students will remember how you made them feel on the last day.', es: 'Esto es lo unico que no puedes rehacer. Las boletas tienen fecha limite pero las despedidas tienen un momento.' } },
      { en: 'Finish report cards', es: 'Terminar las boletas', rank: 2, explanation: { en: 'These have a hard deadline and other people are waiting on them. Get them done right after the goodbyes.', es: 'Estas tienen una fecha limite firme y otras personas las esperan.' } },
      { en: 'Return textbooks', es: 'Devolver los libros de texto', rank: 3, explanation: { en: 'Administrative but necessary. Can often be done during non-instructional time or delegated to student helpers.', es: 'Administrativo pero necesario. Se puede hacer durante tiempo no instruccional.' } },
      { en: 'Pack your room', es: 'Empacar tu salon', rank: 4, explanation: { en: 'This can happen over several days. It is tedious but has the most flexible timeline of everything on this list.', es: 'Esto puede suceder durante varios dias. Es tedioso pero tiene el cronograma mas flexible.' } },
    ],
  },
  {
    en: { situation: 'Mid-lesson, you realize your activity is way too easy for most students but two students are struggling. You have 20 minutes left.' },
    es: { situation: 'A mitad de la leccion, te das cuenta de que tu actividad es demasiado facil para la mayoria pero dos estudiantes estan luchando. Te quedan 20 minutos.' },
    tasks: [
      { en: 'Add a challenge extension for students who finish early', es: 'Agregar una extension de desafio para estudiantes que terminen temprano', rank: 1, explanation: { en: 'Keep the majority engaged and challenged while you free yourself up to help the two who need it.', es: 'Mantiene a la mayoria involucrada mientras te liberas para ayudar a los dos que lo necesitan.' } },
      { en: 'Check in quietly with the two struggling students', es: 'Hablar discretamente con los dos estudiantes que luchan', rank: 2, explanation: { en: 'Once the others are extended, give targeted support. A quick scaffold can get them unstuck without pulling them out.', es: 'Una vez que los demas estan extendidos, da apoyo dirigido.' } },
      { en: 'Pair struggling students with strong partners', es: 'Emparejar a los estudiantes que luchan con companeros fuertes', rank: 3, explanation: { en: 'Peer support works but be careful -- it can feel like a spotlight on who is behind. Frame it as collaboration, not remediation.', es: 'El apoyo entre pares funciona pero ten cuidado -- puede sentirse como un reflector sobre quien esta atras.' } },
      { en: 'Move on to the next activity as planned', es: 'Pasar a la siguiente actividad como fue planeado', rank: 4, explanation: { en: 'Moving on leaves the struggling students further behind and wastes the moment for everyone else. Differentiate on the fly.', es: 'Seguir adelante deja a los estudiantes que luchan aun mas atras.' } },
    ],
  },
  {
    en: { situation: 'Your principal asks you to take on an extra committee. You are already coaching after school, leading a PLC, and barely keeping up.' },
    es: { situation: 'Tu director te pide que te unas a un comite extra. Ya estas dando tutoria despues de clases, liderando un PLC y apenas te mantienes al dia.' },
    tasks: [
      { en: 'Be honest: "I want to help but my plate is full. Can we discuss what I could step back from?"', es: 'Ser honesto: "Quiero ayudar pero estoy al limite. Podemos discutir de que podria retirarme?"', rank: 1, explanation: { en: 'Saying yes to everything leads to burnout. An honest conversation with your principal protects your effectiveness in everything you already do.', es: 'Decir si a todo lleva al agotamiento. Una conversacion honesta protege tu efectividad.' } },
      { en: 'Ask what the time commitment looks like before deciding', es: 'Preguntar cual es el compromiso de tiempo antes de decidir', rank: 2, explanation: { en: 'Good information leads to good decisions. Maybe it is 30 minutes a month -- manageable. Maybe it is 5 hours a week -- not sustainable.', es: 'Buena informacion lleva a buenas decisiones.' } },
      { en: 'Say yes to keep a good relationship with your principal', es: 'Decir que si para mantener una buena relacion con tu director', rank: 3, explanation: { en: 'Your principal would rather have you doing 3 things well than 4 things poorly. Saying yes out of obligation is not loyalty -- it is a path to resentment.', es: 'Tu director prefiere que hagas 3 cosas bien que 4 cosas mal.' } },
      { en: 'Say yes but quietly stop showing up to the PLC', es: 'Decir que si pero dejar de asistir al PLC silenciosamente', rank: 4, explanation: { en: 'Dropping commitments without communicating it damages trust with your team. If something has to give, be transparent about it.', es: 'Dejar compromisos sin comunicarlo dana la confianza con tu equipo.' } },
    ],
  },
  {
    en: { situation: 'You discover a student posted something hurtful about another student on social media. The targeted student does not know yet. It is the last period of the day.' },
    es: { situation: 'Descubres que un estudiante publico algo hiriente sobre otro estudiante en redes sociales. El estudiante afectado no lo sabe todavia. Es el ultimo periodo del dia.' },
    tasks: [
      { en: 'Report it to admin or counselor immediately', es: 'Reportarlo a administracion o consejeria inmediatamente', rank: 1, explanation: { en: 'This is a safety and policy issue. Admin needs to know before the end of the day. Do not try to handle social media situations alone.', es: 'Este es un asunto de seguridad y politica. Admin necesita saberlo antes del final del dia.' } },
      { en: 'Have a private conversation with the student who posted', es: 'Tener una conversacion privada con el estudiante que publico', rank: 2, explanation: { en: 'After reporting, a brief private conversation lets the student know you saw it. Keep it factual, not accusatory.', es: 'Despues de reportar, una conversacion breve y privada le hace saber al estudiante que lo viste.' } },
      { en: 'Check in with the targeted student before they leave', es: 'Hablar con el estudiante afectado antes de que se vaya', rank: 3, explanation: { en: 'They may not know yet, so do not show them the post. But a warm check-in at dismissal plants a seed of support for when they find out.', es: 'Puede que no lo sepan todavia. No les muestres la publicacion. Pero una conversacion calida planta una semilla de apoyo.' } },
      { en: 'Screenshot the post as evidence before it gets deleted', es: 'Capturar la publicacion como evidencia antes de que se borre', rank: 4, explanation: { en: 'Important but not the first move. Report to admin first, then document. Admin may have their own process for evidence collection.', es: 'Importante pero no es el primer paso. Reporta primero, luego documenta.' } },
    ],
  },
  {
    en: { situation: 'You are 10 minutes into your best lesson of the year. The fire alarm goes off. It is a drill, not real. You will lose 20 minutes.' },
    es: { situation: 'Llevas 10 minutos en tu mejor leccion del ano. La alarma de incendio se activa. Es un simulacro, no real. Perderas 20 minutos.' },
    tasks: [
      { en: 'Lead your class out safely and calmly', es: 'Guiar a tu clase afuera de manera segura y tranquila', rank: 1, explanation: { en: 'Safety first, always. Your calm sets the tone. Students who see you relaxed during a drill learn to be relaxed during a real emergency.', es: 'La seguridad primero, siempre. Tu calma establece el tono.' } },
      { en: 'Use the outdoor time for a quick discussion related to the lesson', es: 'Usar el tiempo afuera para una discusion rapida relacionada con la leccion', rank: 2, explanation: { en: 'The learning does not have to stop. A turn-and-talk outside can actually deepen engagement because the setting change resets attention.', es: 'El aprendizaje no tiene que detenerse. Una conversacion rapida afuera puede profundizar la participacion.' } },
      { en: 'Plan how to pick up the lesson when you return', es: 'Planear como retomar la leccion cuando regresen', rank: 3, explanation: { en: 'Use the walk back to mentally identify the one key point you need to land. You probably cannot finish the whole lesson, so pick the essential.', es: 'Usa la caminata de regreso para identificar mentalmente el punto clave que necesitas aterrizar.' } },
      { en: 'Let students have free time since the lesson is ruined', es: 'Dar tiempo libre a los estudiantes ya que la leccion se arruino', rank: 4, explanation: { en: 'The lesson is not ruined -- it is interrupted. Treat it as a pivot, not a loss. Students take their cue from you.', es: 'La leccion no esta arruinada -- esta interrumpida. Tratala como un cambio, no como una perdida.' } },
    ],
  },
  {
    en: { situation: 'You are a new para. The lead teacher gives you conflicting instructions throughout the day. You are confused about your role and where you should be.' },
    es: { situation: 'Eres un para nuevo. La maestra principal te da instrucciones contradictorias durante el dia. Estas confundido sobre tu rol y donde deberias estar.' },
    tasks: [
      { en: 'Ask for a 5-minute planning conversation at a natural break', es: 'Pedir una conversacion de 5 minutos en un descanso natural', rank: 1, explanation: { en: 'A quick clarifying conversation solves this. Frame it as "I want to support you well" not "you are confusing me." Timing matters -- find a calm moment.', es: 'Una conversacion rapida de aclaracion resuelve esto. Enmarcalo como "quiero apoyarte bien."' } },
      { en: 'Follow the most recent instruction and adapt', es: 'Seguir la instruccion mas reciente y adaptarse', rank: 2, explanation: { en: 'In the moment, default to the latest direction. This keeps things moving while you work toward a longer-term solution.', es: 'En el momento, sigue la direccion mas reciente. Esto mantiene las cosas en movimiento.' } },
      { en: 'Write down each instruction so you have a record', es: 'Anotar cada instruccion para tener un registro', rank: 3, explanation: { en: 'Good practice for your own clarity. It also gives you something concrete to reference during your planning conversation.', es: 'Buena practica para tu propia claridad. Tambien te da algo concreto para referenciar.' } },
      { en: 'Go to admin and explain the situation', es: 'Ir a administracion y explicar la situacion', rank: 4, explanation: { en: 'Skipping straight to admin without talking to the teacher first creates a triangle. Direct communication first, always.', es: 'Ir directo a admin sin hablar con la maestra primero crea un triangulo. Comunicacion directa primero, siempre.' } },
    ],
  },
  {
    en: { situation: 'Three parents have emailed you this morning. One is angry about a grade, one is asking about a field trip, and one is reporting their child is being bullied. You have 15 minutes before students arrive.' },
    es: { situation: 'Tres padres te enviaron correo esta manana. Uno esta enojado por una calificacion, otro pregunta sobre una excursion, y otro reporta que su hijo esta siendo acosado. Tienes 15 minutos antes de que lleguen los estudiantes.' },
    tasks: [
      { en: 'Reply to the bullying report and loop in admin', es: 'Responder al reporte de acoso e incluir a administracion', rank: 1, explanation: { en: 'Safety concern gets first response. A brief acknowledgment ("I received this and am looking into it. I have also notified admin.") takes 60 seconds.', es: 'La preocupacion de seguridad recibe la primera respuesta. Un reconocimiento breve toma 60 segundos.' } },
      { en: 'Quick reply to the field trip question', es: 'Respuesta rapida a la pregunta de la excursion', rank: 2, explanation: { en: 'This is a factual, easy reply. Knock it out in 30 seconds so it does not sit in your inbox all day taking up mental space.', es: 'Esta es una respuesta factual y facil. Eliminala en 30 segundos.' } },
      { en: 'Draft a thoughtful reply to the angry parent about the grade', es: 'Redactar una respuesta pensada al padre enojado por la calificacion', rank: 3, explanation: { en: 'Angry emails deserve thoughtful responses, not rushed ones. Draft it now but do not send until you have re-read it after lunch.', es: 'Los correos enojados merecen respuestas pensadas, no apresuradas. Redactalo ahora pero no lo envies hasta despues del almuerzo.' } },
      { en: 'Greet students at the door', es: 'Recibir a los estudiantes en la puerta', rank: 4, explanation: { en: 'Connection matters but 15 minutes of email triage keeps your afternoon clear. Greet them when they walk in -- you do not need to be at the door every single day.', es: 'La conexion importa pero 15 minutos de triaje de correo mantiene tu tarde libre.' } },
    ],
  },
]

export const PRIORITIZE_ROUND_COUNT = 6
