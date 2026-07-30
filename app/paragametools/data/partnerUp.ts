// Partner Up — dual-perspective scenario data (EN/ES)

export interface PartnerUpScenario {
  en: {
    context: string;
    paraView: {
      setup: string;
      choices: { text: string; best: boolean }[];
    };
    teacherView: {
      setup: string;
      choices: { text: string; best: boolean }[];
    };
    insight: string;
    partnershipSkill: string;
  };
  es: {
    context: string;
    paraView: {
      setup: string;
      choices: { text: string; best: boolean }[];
    };
    teacherView: {
      setup: string;
      choices: { text: string; best: boolean }[];
    };
    insight: string;
    partnershipSkill: string;
  };
}

export const PARTNER_SCENARIO_COUNT = 10;

export const PARTNER_SCENARIOS: PartnerUpScenario[] = [
  // 1. Teacher changes the lesson plan last minute without telling the para
  {
    en: {
      context: 'Monday morning, 8:50 AM. First period is about to start.',
      paraView: {
        setup: 'You spent 20 minutes before school setting up the stations the teacher planned on Friday. Students are walking in. The teacher looks at you and says, "Actually, we are doing whole group today. Can you just sit with Marcus?" Nobody told you the plan changed.',
        choices: [
          { text: 'Say nothing, take down the stations, and sit with Marcus. Bring it up later if it keeps happening.', best: false },
          { text: 'After the lesson, privately tell the teacher: "I set up stations based on Friday\'s plan. Can we find a way to communicate changes before school?"', best: true },
          { text: 'Leave the stations up and say, "I already set these up. Can we still use them?"', best: false },
        ],
      },
      teacherView: {
        setup: 'You decided late last night to switch from stations to whole group because half the class bombed the exit ticket on Friday. You forgot to tell your para, who clearly set up stations already. She looks frustrated but is not saying anything.',
        choices: [
          { text: 'Acknowledge it now: "I should have told you I changed the plan. I appreciate you setting up. Let me explain why I pivoted."', best: true },
          { text: 'Move on and focus on teaching. You can explain later if she asks about it.', best: false },
          { text: 'Say, "Sorry about the stations. The data made me change direction." Then start teaching.', best: false },
        ],
      },
      insight: 'When plan changes happen without communication, the para feels invisible. A 30-second text or morning check-in prevents this entirely. The strongest partnerships have a shared communication channel, even if it is just a sticky note on the desk before school.',
      partnershipSkill: 'Communication Timing',
    },
    es: {
      context: 'Lunes por la manana, 8:50 AM. El primer periodo esta por comenzar.',
      paraView: {
        setup: 'Pasaste 20 minutos antes de la escuela preparando las estaciones que la maestra planeo el viernes. Los estudiantes estan entrando. La maestra te mira y dice: "En realidad, hoy haremos grupo completo. Puedes sentarte con Marcus?" Nadie te dijo que el plan cambio.',
        choices: [
          { text: 'No decir nada, quitar las estaciones y sentarte con Marcus. Mencionarlo despues si sigue pasando.', best: false },
          { text: 'Despues de la leccion, decirle a la maestra en privado: "Prepare las estaciones basandome en el plan del viernes. Podemos encontrar una forma de comunicar cambios antes de la escuela?"', best: true },
          { text: 'Dejar las estaciones y decir: "Ya las prepare. Podemos usarlas todavia?"', best: false },
        ],
      },
      teacherView: {
        setup: 'Decidiste anoche cambiar de estaciones a grupo completo porque la mitad de la clase fallo la evaluacion de salida del viernes. Olvidaste decirle a tu para, quien claramente ya preparo las estaciones. Se ve frustrada pero no dice nada.',
        choices: [
          { text: 'Reconocerlo ahora: "Deberia haberte dicho que cambie el plan. Aprecio que hayas preparado todo. Dejame explicarte por que cambie de direccion."', best: true },
          { text: 'Seguir adelante y enfocarte en ensenar. Puedes explicar despues si ella pregunta.', best: false },
          { text: 'Decir: "Perdon por las estaciones. Los datos me hicieron cambiar de direccion." Luego empezar a ensenar.', best: false },
        ],
      },
      insight: 'Cuando los cambios de plan ocurren sin comunicacion, la para se siente invisible. Un mensaje de 30 segundos o una revision matutina previene esto por completo. Las alianzas mas fuertes tienen un canal de comunicacion compartido, aunque sea una nota adhesiva en el escritorio antes de la escuela.',
      partnershipSkill: 'Comunicacion Oportuna',
    },
  },

  // 2. Para notices a student struggling but teacher is mid-instruction
  {
    en: {
      context: 'Wednesday, 10:20 AM. Math block, whole group instruction.',
      paraView: {
        setup: 'You are sitting next to Jaylen during whole group. He has been staring at his paper for four minutes and has not written anything. You can see he does not understand the directions. The teacher is explaining step three of a multi-step problem to the class. Do you intervene?',
        choices: [
          { text: 'Quietly lean over and re-explain the directions to Jaylen using simpler language, keeping your voice low.', best: true },
          { text: 'Wait until the teacher finishes and then raise your hand to ask if you can pull Jaylen to reteach.', best: false },
          { text: 'Write a note to the teacher saying Jaylen needs help and pass it forward.', best: false },
        ],
      },
      teacherView: {
        setup: 'You are mid-instruction explaining step three of a multi-step problem. From the corner of your eye, you notice your para leaning over to quietly help Jaylen, who has clearly been lost. You had not noticed he was stuck.',
        choices: [
          { text: 'Feel grateful. Make a mental note to check in with Jaylen later and thank the para after class.', best: true },
          { text: 'Pause instruction and say, "Jaylen, are you following? Let me back up." to address it yourself.', best: false },
          { text: 'Keep teaching and assume the para has it handled. No need to change your plan.', best: false },
        ],
      },
      insight: 'The para is closest to the students who need the most support. When a para quietly redirects or re-explains without disrupting instruction, that is exactly the role working as designed. The teacher noticing and acknowledging that catch builds a culture where the para feels empowered to act.',
      partnershipSkill: 'Student Advocacy',
    },
    es: {
      context: 'Miercoles, 10:20 AM. Bloque de matematicas, instruccion de grupo completo.',
      paraView: {
        setup: 'Estas sentado/a junto a Jaylen durante la instruccion de grupo. Ha estado mirando su papel durante cuatro minutos y no ha escrito nada. Puedes ver que no entiende las instrucciones. La maestra esta explicando el paso tres de un problema de varios pasos a la clase. Intervienes?',
        choices: [
          { text: 'Inclinarte tranquilamente y re-explicar las instrucciones a Jaylen usando lenguaje mas simple, manteniendo tu voz baja.', best: true },
          { text: 'Esperar hasta que la maestra termine y luego levantar la mano para preguntar si puedes llevar a Jaylen a re-ensenar.', best: false },
          { text: 'Escribir una nota a la maestra diciendo que Jaylen necesita ayuda y pasarla hacia adelante.', best: false },
        ],
      },
      teacherView: {
        setup: 'Estas en medio de la instruccion explicando el paso tres de un problema de varios pasos. Por el rabillo del ojo, notas que tu para se inclina para ayudar tranquilamente a Jaylen, quien claramente ha estado perdido. No te habias dado cuenta de que estaba atascado.',
        choices: [
          { text: 'Sentir gratitud. Hacer una nota mental para hablar con Jaylen despues y agradecer a la para despues de clase.', best: true },
          { text: 'Pausar la instruccion y decir: "Jaylen, estas siguiendo? Dejame retroceder." para abordarlo tu misma.', best: false },
          { text: 'Seguir ensenando y asumir que la para lo tiene bajo control. No hay necesidad de cambiar tu plan.', best: false },
        ],
      },
      insight: 'La para esta mas cerca de los estudiantes que necesitan mas apoyo. Cuando una para redirige o re-explica tranquilamente sin interrumpir la instruccion, ese es exactamente el rol funcionando como fue disenado. Que la maestra lo note y reconozca esa intervencion construye una cultura donde la para se siente empoderada para actuar.',
      partnershipSkill: 'Apoyo al Estudiante',
    },
  },

  // 3. Teacher gives directions that contradict what the para was told
  {
    en: {
      context: 'Thursday, 9:15 AM. Reading block just started.',
      paraView: {
        setup: 'This morning the teacher told you to pull the blue group for guided reading at the kidney table. But now she just told the whole class that blue group is staying at their seats for independent reading today. Three students in the blue group are looking at you confused because you already told them to come with you.',
        choices: [
          { text: 'Quietly redirect the blue group students back to their seats and follow the teacher\'s new directions without saying anything.', best: false },
          { text: 'Walk over to the teacher and quietly ask: "I have the blue group ready at the table. Did the plan change? I want to make sure I am doing what you need."', best: true },
          { text: 'Go ahead and pull the blue group since that was the original plan and the teacher probably just forgot.', best: false },
        ],
      },
      teacherView: {
        setup: 'You told the para this morning to pull the blue group for guided reading, but after looking at their running records, you realized they need independent practice instead. You announced the change to the whole class without thinking to tell the para first. Now you see three blue group students half out of their seats, looking confused.',
        choices: [
          { text: 'Walk over to the para and say: "My mistake. I changed the plan for blue group but forgot to tell you first. Let me fill you in on the new setup."', best: true },
          { text: 'Address the class again, saying "Blue group, stay at your seats" and hope the para adjusts.', best: false },
          { text: 'After the block, apologize to the para and make a plan for how you will communicate changes going forward.', best: false },
        ],
      },
      insight: 'Contradicting directions in front of students puts the para in an impossible position. The students do not know who to listen to, and the para looks like they gave wrong information. A 10-second sidebar before the announcement prevents confusion for everyone.',
      partnershipSkill: 'Role Clarity',
    },
    es: {
      context: 'Jueves, 9:15 AM. El bloque de lectura acaba de comenzar.',
      paraView: {
        setup: 'Esta manana la maestra te dijo que llevaras al grupo azul para lectura guiada en la mesa. Pero ahora acaba de decirle a toda la clase que el grupo azul se queda en sus asientos para lectura independiente hoy. Tres estudiantes del grupo azul te estan mirando confundidos porque ya les dijiste que vinieran contigo.',
        choices: [
          { text: 'Redirigir tranquilamente a los estudiantes del grupo azul de vuelta a sus asientos y seguir las nuevas instrucciones sin decir nada.', best: false },
          { text: 'Acercarte a la maestra y preguntar tranquilamente: "Tengo al grupo azul listo en la mesa. Cambio el plan? Quiero asegurarme de hacer lo que necesitas."', best: true },
          { text: 'Seguir adelante y llevar al grupo azul ya que ese era el plan original y la maestra probablemente solo se olvido.', best: false },
        ],
      },
      teacherView: {
        setup: 'Le dijiste a la para esta manana que llevara al grupo azul para lectura guiada, pero despues de revisar sus registros de lectura, te diste cuenta de que necesitan practica independiente. Anunciaste el cambio a toda la clase sin pensar en decirle a la para primero. Ahora ves a tres estudiantes del grupo azul medio parados, confundidos.',
        choices: [
          { text: 'Acercarte a la para y decir: "Error mio. Cambie el plan para el grupo azul pero olvide decirte primero. Dejame ponerte al dia con la nueva organizacion."', best: true },
          { text: 'Dirigirte a la clase de nuevo diciendo "Grupo azul, quedense en sus asientos" y esperar que la para se ajuste.', best: false },
          { text: 'Despues del bloque, disculparte con la para y hacer un plan para como comunicaras cambios en el futuro.', best: false },
        ],
      },
      insight: 'Contradecir instrucciones frente a los estudiantes pone a la para en una posicion imposible. Los estudiantes no saben a quien escuchar, y la para parece que dio informacion incorrecta. Un comentario de 10 segundos antes del anuncio previene la confusion para todos.',
      partnershipSkill: 'Claridad de Roles',
    },
  },

  // 4. Para overhears teacher talking about "their para"
  {
    en: {
      context: 'Friday, lunch time. Teachers\' lounge.',
      paraView: {
        setup: 'You walk into the teachers\' lounge to heat up your lunch and hear your teacher saying to another teacher: "My para just does not get the math curriculum. I end up re-teaching everything she does with the small group." They have not seen you yet.',
        choices: [
          { text: 'Walk away quietly and decide not to bring it up. You will just try harder with the math groups.', best: false },
          { text: 'After lunch, ask the teacher privately: "I want to make sure I am teaching the math groups the way you need. Can we spend a few minutes going over the approach together?"', best: true },
          { text: 'Walk in and say, "I heard what you said. If you have a problem with my teaching, tell me directly."', best: false },
        ],
      },
      teacherView: {
        setup: 'You were venting to a colleague about how your para struggles with the math curriculum. You genuinely like her, but you are frustrated because you feel like you are doing double the work. You realize you have never actually sat down and taught her the curriculum approach. You have just expected her to figure it out.',
        choices: [
          { text: 'Schedule 15 minutes this week to walk through the math curriculum approach with your para, including the specific language and steps you want her to use.', best: true },
          { text: 'Keep venting to colleagues when you need to. Everyone does it. It does not affect your working relationship.', best: false },
          { text: 'Create a detailed written guide for the para so she can follow it without you having to explain everything.', best: false },
        ],
      },
      insight: 'Venting about a colleague behind their back always damages the relationship, even when they never hear it. The real issue here is a training gap. If the teacher never taught the para the curriculum approach, the frustration is a leadership gap, not a competence gap. Investing 15 minutes in teaching saves hours of re-teaching.',
      partnershipSkill: 'Mutual Respect',
    },
    es: {
      context: 'Viernes, hora del almuerzo. Salon de maestros.',
      paraView: {
        setup: 'Entras al salon de maestros para calentar tu almuerzo y escuchas a tu maestra diciendole a otra maestra: "Mi para simplemente no entiende el curriculo de matematicas. Termino re-ensenando todo lo que ella hace con el grupo pequeno." No te han visto todavia.',
        choices: [
          { text: 'Irte tranquilamente y decidir no mencionarlo. Simplemente intentaras mas con los grupos de matematicas.', best: false },
          { text: 'Despues del almuerzo, preguntarle a la maestra en privado: "Quiero asegurarme de ensenar los grupos de matematicas de la forma que necesitas. Podemos pasar unos minutos repasando el enfoque juntas?"', best: true },
          { text: 'Entrar y decir: "Escuche lo que dijiste. Si tienes un problema con mi ensenanza, dimelo directamente."', best: false },
        ],
      },
      teacherView: {
        setup: 'Estabas desahogandote con una colega sobre como tu para tiene dificultades con el curriculo de matematicas. Genuinamente te cae bien, pero estas frustrada porque sientes que estas haciendo el doble de trabajo. Te das cuenta de que nunca te sentaste a ensenarle el enfoque del curriculo. Solo esperabas que lo descubriera sola.',
        choices: [
          { text: 'Programar 15 minutos esta semana para repasar el enfoque del curriculo de matematicas con tu para, incluyendo el lenguaje especifico y los pasos que quieres que use.', best: true },
          { text: 'Seguir desahogandote con colegas cuando lo necesites. Todos lo hacen. No afecta tu relacion laboral.', best: false },
          { text: 'Crear una guia escrita detallada para la para para que pueda seguirla sin que tengas que explicar todo.', best: false },
        ],
      },
      insight: 'Desahogarse sobre un/a colega a sus espaldas siempre dana la relacion, incluso cuando nunca lo escuchan. El verdadero problema aqui es una brecha de capacitacion. Si la maestra nunca le enseno a la para el enfoque del curriculo, la frustracion es una brecha de liderazgo, no de competencia. Invertir 15 minutos en ensenar ahorra horas de re-ensenanza.',
      partnershipSkill: 'Respeto Mutuo',
    },
  },

  // 5. Student goes to para for everything instead of the teacher
  {
    en: {
      context: 'Tuesday, 11:00 AM. Writing workshop.',
      paraView: {
        setup: 'Sofia comes to you every single time she needs help, even when you are working with another student. She has never once raised her hand for the teacher. Today she walked past the teacher to find you at the back table. The teacher is watching this happen.',
        choices: [
          { text: 'Help Sofia like you always do. She trusts you and that is what matters.', best: false },
          { text: 'Say warmly: "I love that you come to me, Sofia. But Mrs. Chen is the expert on this writing lesson. Let me walk you over to her so she can help you with this part."', best: true },
          { text: 'Tell Sofia she needs to ask the teacher first from now on before coming to you.', best: false },
        ],
      },
      teacherView: {
        setup: 'Sofia walks past you to get help from the para again. This is the fifth time this week. You are starting to feel like Sofia does not see you as her teacher. Part of you is frustrated, but you also know that Sofia has a strong bond with the para and you do not want to disrupt that.',
        choices: [
          { text: 'Talk with the para about building a shared redirect system: "When Sofia comes to you, can we try redirecting her to me first for new content, and you take over for practice support?"', best: true },
          { text: 'Tell Sofia directly that she needs to come to you first before going to the para.', best: false },
          { text: 'Let it go. Sofia is getting help and that is what matters. It does not matter who she goes to.', best: false },
        ],
      },
      insight: 'When a student bypasses the teacher for the para, it often means the student feels safer with the para. That bond is valuable. The goal is not to break it but to expand it so the student also builds a relationship with the teacher. A shared redirect system keeps the para as a bridge, not a replacement.',
      partnershipSkill: 'Role Clarity',
    },
    es: {
      context: 'Martes, 11:00 AM. Taller de escritura.',
      paraView: {
        setup: 'Sofia viene a ti cada vez que necesita ayuda, incluso cuando estas trabajando con otro estudiante. Nunca ha levantado la mano para la maestra. Hoy paso al lado de la maestra para encontrarte en la mesa de atras. La maestra esta observando esto.',
        choices: [
          { text: 'Ayudar a Sofia como siempre. Ella confia en ti y eso es lo que importa.', best: false },
          { text: 'Decir con carino: "Me encanta que vengas a mi, Sofia. Pero la Sra. Chen es la experta en esta leccion de escritura. Dejame llevarte con ella para que te ayude con esta parte."', best: true },
          { text: 'Decirle a Sofia que necesita preguntarle a la maestra primero de ahora en adelante antes de venir a ti.', best: false },
        ],
      },
      teacherView: {
        setup: 'Sofia pasa a tu lado para pedir ayuda a la para de nuevo. Esta es la quinta vez esta semana. Empiezas a sentir que Sofia no te ve como su maestra. Parte de ti esta frustrada, pero tambien sabes que Sofia tiene un vinculo fuerte con la para y no quieres interrumpir eso.',
        choices: [
          { text: 'Hablar con la para sobre construir un sistema de redireccion compartido: "Cuando Sofia venga a ti, podemos intentar redirigirla a mi primero para contenido nuevo, y tu tomas el control para apoyo de practica?"', best: true },
          { text: 'Decirle a Sofia directamente que necesita venir a ti primero antes de ir con la para.', best: false },
          { text: 'Dejarlo ir. Sofia esta recibiendo ayuda y eso es lo que importa. No importa a quien acuda.', best: false },
        ],
      },
      insight: 'Cuando un estudiante pasa por alto a la maestra para ir con la para, a menudo significa que el estudiante se siente mas seguro con la para. Ese vinculo es valioso. El objetivo no es romperlo sino expandirlo para que el estudiante tambien construya una relacion con la maestra. Un sistema de redireccion compartido mantiene a la para como puente, no como reemplazo.',
      partnershipSkill: 'Claridad de Roles',
    },
  },

  // 6. Teacher asks para to do personal tasks
  {
    en: {
      context: 'Wednesday, 7:30 AM. Before students arrive.',
      paraView: {
        setup: 'The teacher hands you a stack of papers and asks you to run to the copy room. You look at them and realize half are for her son\'s birthday party invitations, not school materials. This is not the first time she has asked you to do personal tasks. Last week it was returning a library book that was not school-related.',
        choices: [
          { text: 'Make the copies without saying anything. It is not worth the conflict and it only takes a few minutes.', best: false },
          { text: 'Say: "I am happy to make the school copies. For the personal ones, I want to make sure I am using my prep time for student work. Can those wait?"', best: true },
          { text: 'Report it to the principal. This is not in your job description and it keeps happening.', best: false },
        ],
      },
      teacherView: {
        setup: 'You asked your para to make copies and realized after she left that you accidentally included your son\'s birthday invitations in the stack. You have been so overwhelmed this week that the line between school tasks and personal tasks has blurred. Looking back, you asked her to return a personal library book last week too.',
        choices: [
          { text: 'When she comes back, say: "I just realized I put personal copies in that stack. That was not fair to you. I will grab those myself. I am sorry."', best: true },
          { text: 'Do not say anything. She probably did not even notice and it is not a big deal.', best: false },
          { text: 'Make a mental note to keep things separate going forward but do not address the past instances.', best: false },
        ],
      },
      insight: 'Paras are professionals, not personal assistants. When the line blurs, it erodes the professional respect that makes the partnership work. The teacher catching the mistake and naming it directly rebuilds that respect. The para setting a kind boundary protects the relationship long term.',
      partnershipSkill: 'Boundary Setting',
    },
    es: {
      context: 'Miercoles, 7:30 AM. Antes de que lleguen los estudiantes.',
      paraView: {
        setup: 'La maestra te entrega un monton de papeles y te pide que vayas al cuarto de copias. Los miras y te das cuenta de que la mitad son invitaciones para la fiesta de cumpleanos de su hijo, no materiales escolares. No es la primera vez que te pide hacer tareas personales. La semana pasada fue devolver un libro de la biblioteca que no era escolar.',
        choices: [
          { text: 'Hacer las copias sin decir nada. No vale la pena el conflicto y solo toma unos minutos.', best: false },
          { text: 'Decir: "Con gusto hago las copias de la escuela. Para las personales, quiero asegurarme de usar mi tiempo de preparacion para trabajo de estudiantes. Pueden esperar?"', best: true },
          { text: 'Reportarlo al director. Esto no esta en tu descripcion de trabajo y sigue pasando.', best: false },
        ],
      },
      teacherView: {
        setup: 'Le pediste a tu para que hiciera copias y te diste cuenta despues de que se fue que accidentalmente incluiste las invitaciones de cumpleanos de tu hijo en el monton. Has estado tan abrumada esta semana que la linea entre tareas escolares y personales se ha difuminado. Pensandolo bien, le pediste que devolviera un libro personal de la biblioteca la semana pasada tambien.',
        choices: [
          { text: 'Cuando regrese, decir: "Me acabo de dar cuenta de que puse copias personales en ese monton. No fue justo para ti. Yo las agarro. Lo siento."', best: true },
          { text: 'No decir nada. Probablemente ni se dio cuenta y no es gran cosa.', best: false },
          { text: 'Hacer una nota mental para mantener las cosas separadas en el futuro pero no abordar los casos pasados.', best: false },
        ],
      },
      insight: 'Las paras son profesionales, no asistentes personales. Cuando la linea se difumina, erosiona el respeto profesional que hace funcionar la alianza. Que la maestra reconozca el error y lo nombre directamente reconstruye ese respeto. Que la para establezca un limite amable protege la relacion a largo plazo.',
      partnershipSkill: 'Establecer Limites',
    },
  },

  // 7. Para has a great idea for a lesson modification
  {
    en: {
      context: 'Monday, co-planning period (rare). Teacher and para have 20 minutes together.',
      paraView: {
        setup: 'The teacher is planning a science lesson about ecosystems. You have been thinking about how the small group you work with always does better with hands-on activities, and you have an idea for a sorting activity using real photos that could replace the worksheet. But you are not sure if suggesting lesson changes is your place.',
        choices: [
          { text: 'Keep the idea to yourself. The teacher already has a plan and you do not want to overstep.', best: false },
          { text: 'Say: "I have noticed that my small group really responds to hands-on activities. I had an idea for a photo sorting activity for the ecosystem lesson. Would you want to hear it?"', best: true },
          { text: 'Just do the sorting activity with your small group instead of the worksheet without asking first.', best: false },
        ],
      },
      teacherView: {
        setup: 'Your para, who has been with these students for three years, just offered an idea for your science lesson. She suggested replacing the worksheet with a photo sorting activity for her small group. You had not considered this approach and you can tell she is nervous about suggesting it.',
        choices: [
          { text: 'Say: "That is a great idea. You know this group better than I do for hands-on learning. Let us try it and see how they respond."', best: true },
          { text: 'Say: "Let me think about it. I already have the worksheets printed so we should probably stick with the plan for now."', best: false },
          { text: 'Say: "Sure, go for it!" without discussing how it fits into the overall lesson objectives.', best: false },
        ],
      },
      insight: 'Paras who have been with students for years carry deep knowledge about what works. When a para frames their idea as an observation tied to student needs, it makes the suggestion feel collaborative rather than overstepping. When a teacher validates that knowledge and says yes, it sends a clear message: your expertise matters here.',
      partnershipSkill: 'Initiative',
    },
    es: {
      context: 'Lunes, periodo de co-planificacion (raro). La maestra y la para tienen 20 minutos juntas.',
      paraView: {
        setup: 'La maestra esta planificando una leccion de ciencias sobre ecosistemas. Has estado pensando en como el grupo pequeno con el que trabajas siempre responde mejor a actividades practicas, y tienes una idea para una actividad de clasificacion usando fotos reales que podria reemplazar la hoja de trabajo. Pero no estas segura si sugerir cambios en la leccion es tu lugar.',
        choices: [
          { text: 'Guardar la idea para ti. La maestra ya tiene un plan y no quieres sobrepasar.', best: false },
          { text: 'Decir: "He notado que mi grupo pequeno realmente responde a actividades practicas. Tuve una idea para una actividad de clasificacion con fotos para la leccion de ecosistemas. Te gustaria escucharla?"', best: true },
          { text: 'Simplemente hacer la actividad de clasificacion con tu grupo pequeno en lugar de la hoja de trabajo sin preguntar primero.', best: false },
        ],
      },
      teacherView: {
        setup: 'Tu para, que ha estado con estos estudiantes por tres anos, acaba de ofrecer una idea para tu leccion de ciencias. Sugirio reemplazar la hoja de trabajo con una actividad de clasificacion con fotos para su grupo pequeno. No habias considerado este enfoque y puedes notar que esta nerviosa por sugerirlo.',
        choices: [
          { text: 'Decir: "Esa es una gran idea. Tu conoces mejor a este grupo para aprendizaje practico. Intentemoslo y veamos como responden."', best: true },
          { text: 'Decir: "Dejame pensarlo. Ya tengo las hojas de trabajo impresas asi que probablemente deberiamos seguir con el plan por ahora."', best: false },
          { text: 'Decir: "Claro, hazlo!" sin discutir como encaja en los objetivos generales de la leccion.', best: false },
        ],
      },
      insight: 'Las paras que han estado con estudiantes por anos tienen un conocimiento profundo sobre lo que funciona. Cuando una para enmarca su idea como una observacion ligada a las necesidades del estudiante, hace que la sugerencia se sienta colaborativa en vez de sobrepasar. Cuando una maestra valida ese conocimiento y dice que si, envia un mensaje claro: tu experiencia importa aqui.',
      partnershipSkill: 'Iniciativa',
    },
  },

  // 8. Teacher takes over para's small group without explanation
  {
    en: {
      context: 'Thursday, 1:15 PM. Afternoon literacy block.',
      paraView: {
        setup: 'You are working with your small group on fluency practice when the teacher walks over and says, "I will take over here. Can you go monitor the rest of the class?" No explanation, no context. The students look confused. You have been building momentum with this group all week and you were about to try a new strategy you prepared.',
        choices: [
          { text: 'Step away immediately without question. The teacher is the lead and this is her call.', best: false },
          { text: 'Say: "Sure. I had a fluency strategy ready for them today. Can I share it with you quickly before I step away so nothing gets lost?"', best: true },
          { text: 'Say: "I was just getting to the good part. Can I finish this activity and then you can take over?"', best: false },
        ],
      },
      teacherView: {
        setup: 'You just pulled your para off her small group because you noticed three students across the room completely off task and you need someone to redirect them. You did not explain why because you were reacting quickly. Now your para looks deflated and the small group looks confused about the switch.',
        choices: [
          { text: 'Pause for 10 seconds and say: "Sorry, let me explain. I need help with three students off task over there. Can you redirect them? I will pick up where you left off here."', best: true },
          { text: 'Just start working with the small group. You will explain later when things calm down.', best: false },
          { text: 'Call out to the off-task students from where you are instead of pulling the para away.', best: false },
        ],
      },
      insight: 'Ten seconds of explanation changes everything. "I need you over there because..." turns a confusing pullback into a team decision. When a para is pulled off a group without context, they lose ownership of the work they have been investing in. When they feel like a chess piece being moved, engagement drops.',
      partnershipSkill: 'Communication Timing',
    },
    es: {
      context: 'Jueves, 1:15 PM. Bloque de lectura de la tarde.',
      paraView: {
        setup: 'Estas trabajando con tu grupo pequeno en practica de fluidez cuando la maestra se acerca y dice: "Yo tomo el control aqui. Puedes ir a monitorear al resto de la clase?" Sin explicacion, sin contexto. Los estudiantes se ven confundidos. Has estado construyendo impulso con este grupo toda la semana y estabas por intentar una nueva estrategia que preparaste.',
        choices: [
          { text: 'Alejarte inmediatamente sin preguntar. La maestra es la lider y esta es su decision.', best: false },
          { text: 'Decir: "Claro. Tenia una estrategia de fluidez lista para ellos hoy. Puedo compartirla contigo rapidamente antes de irme para que no se pierda nada?"', best: true },
          { text: 'Decir: "Estaba llegando a la parte buena. Puedo terminar esta actividad y luego tu puedes tomar el control?"', best: false },
        ],
      },
      teacherView: {
        setup: 'Acabas de sacar a tu para de su grupo pequeno porque notaste que tres estudiantes al otro lado del salon estaban completamente fuera de tarea y necesitas a alguien que los redirija. No explicaste por que porque estabas reaccionando rapido. Ahora tu para se ve desanimada y el grupo pequeno se ve confundido por el cambio.',
        choices: [
          { text: 'Pausar por 10 segundos y decir: "Perdon, dejame explicar. Necesito ayuda con tres estudiantes fuera de tarea alla. Puedes redirigirlos? Yo continuare donde tu dejaste aqui."', best: true },
          { text: 'Simplemente empezar a trabajar con el grupo pequeno. Explicaras despues cuando las cosas se calmen.', best: false },
          { text: 'Llamar a los estudiantes fuera de tarea desde donde estas en lugar de sacar a la para.', best: false },
        ],
      },
      insight: 'Diez segundos de explicacion cambian todo. "Te necesito alla porque..." convierte una retirada confusa en una decision de equipo. Cuando una para es sacada de un grupo sin contexto, pierde propiedad del trabajo en el que ha estado invirtiendo. Cuando se sienten como una pieza de ajedrez siendo movida, la motivacion baja.',
      partnershipSkill: 'Comunicacion Oportuna',
    },
  },

  // 9. No co-planning time and the para is always winging it
  {
    en: {
      context: 'Every day. There is no scheduled co-planning time.',
      paraView: {
        setup: 'For the third week in a row, you walk into the classroom with no idea what is happening today. The teacher is busy with students as they arrive and there is no written plan anywhere. You stand near the door, waiting to be told what to do. A student asks you, "What are we doing today?" and you have to say, "Let me check with Mrs. Rivera."',
        choices: [
          { text: 'Accept it. This is just how it works. Not every teacher plans ahead and that is not your problem to solve.', best: false },
          { text: 'Ask the teacher: "Can we try a quick system? Even a shared note on your phone or a five-minute morning check-in would help me be ready for students when they walk in."', best: true },
          { text: 'Start creating your own plans based on what you think the students need and do your own thing with your group.', best: false },
        ],
      },
      teacherView: {
        setup: 'Your para has been standing by the door every morning waiting to be told what to do. You know you should be sharing plans with her, but there is literally no co-planning time in the schedule and you are barely keeping your own head above water. You feel guilty but also overwhelmed.',
        choices: [
          { text: 'Create a simple shared document or daily text message with the plan. Even three bullet points the night before gives your para what she needs to show up ready.', best: true },
          { text: 'Ask administration for co-planning time. Until they give it, there is not much you can do.', best: false },
          { text: 'Tell the para to just follow your lead each day. She will pick up on the routine eventually.', best: false },
        ],
      },
      insight: 'Co-planning time is a systemic failure, not a teacher failure. But the solution does not require a full planning period. Three bullet points sent the night before, a shared Google Doc, or a five-minute morning routine can replace formal co-planning. The para should not have to guess what is happening every day.',
      partnershipSkill: 'Shared Planning',
    },
    es: {
      context: 'Todos los dias. No hay tiempo de co-planificacion programado.',
      paraView: {
        setup: 'Por tercera semana seguida, llegas al salon sin idea de lo que pasa hoy. La maestra esta ocupada con los estudiantes cuando llegan y no hay plan escrito en ninguna parte. Te paras cerca de la puerta, esperando que te digan que hacer. Un estudiante te pregunta: "Que vamos a hacer hoy?" y tienes que decir: "Dejame verificar con la Sra. Rivera."',
        choices: [
          { text: 'Aceptarlo. Asi es como funciona. No todos los maestros planifican con anticipacion y ese no es tu problema para resolver.', best: false },
          { text: 'Preguntarle a la maestra: "Podemos intentar un sistema rapido? Incluso una nota compartida en tu telefono o una revision matutina de cinco minutos me ayudaria a estar lista para los estudiantes cuando lleguen."', best: true },
          { text: 'Empezar a crear tus propios planes basados en lo que crees que los estudiantes necesitan y hacer lo tuyo con tu grupo.', best: false },
        ],
      },
      teacherView: {
        setup: 'Tu para ha estado parada cerca de la puerta cada manana esperando que le digan que hacer. Sabes que deberias compartir planes con ella, pero literalmente no hay tiempo de co-planificacion en el horario y apenas puedes mantener la cabeza fuera del agua. Te sientes culpable pero tambien abrumada.',
        choices: [
          { text: 'Crear un documento compartido simple o un mensaje de texto diario con el plan. Incluso tres puntos la noche anterior le dan a tu para lo que necesita para llegar preparada.', best: true },
          { text: 'Pedir a la administracion tiempo de co-planificacion. Hasta que lo den, no hay mucho que puedas hacer.', best: false },
          { text: 'Decirle a la para que simplemente siga tu ejemplo cada dia. Eventualmente captara la rutina.', best: false },
        ],
      },
      insight: 'El tiempo de co-planificacion es una falla sistemica, no una falla de la maestra. Pero la solucion no requiere un periodo completo de planificacion. Tres puntos enviados la noche anterior, un Google Doc compartido, o una rutina matutina de cinco minutos pueden reemplazar la co-planificacion formal. La para no deberia tener que adivinar lo que pasa cada dia.',
      partnershipSkill: 'Planificacion Compartida',
    },
  },

  // 10. Teacher sends detailed plan but assumes skills students don't have
  {
    en: {
      context: 'Tuesday night, 9:45 PM. The teacher texts the plan for tomorrow.',
      paraView: {
        setup: 'The teacher sends you a detailed plan for tomorrow\'s small group. It says: "Have students use the T-chart to compare character traits and cite text evidence in complete sentences." You know for a fact that two of the four students in your group do not know what a T-chart is, and one cannot write complete sentences independently yet.',
        choices: [
          { text: 'Try the plan as written and help the students through it, even if it takes the whole block.', best: false },
          { text: 'Text back: "Love the plan. Heads up that two students have not used T-charts before and one needs sentence frames. Can I modify for them or do you want to adjust?"', best: true },
          { text: 'Modify the plan on your own to fit what the students can actually do without telling the teacher.', best: false },
        ],
      },
      teacherView: {
        setup: 'Your para texts you back about tomorrow\'s small group plan. She says two of the students have never used a T-chart and one needs sentence frames. You did not know this. You wrote the plan based on grade-level expectations without thinking about where those specific students actually are.',
        choices: [
          { text: 'Thank her and say: "Good catch. Let us use a Venn diagram instead and I will make sentence frames tonight. Can you pre-teach the graphic organizer before they start?"', best: true },
          { text: 'Say: "Just do your best with the plan. They need to be exposed to grade-level work even if they struggle."', best: false },
          { text: 'Rewrite the whole plan from scratch and send a new version at 10:30 PM.', best: false },
        ],
      },
      insight: 'The para often knows the students\' actual skill levels better than the teacher because they are sitting next to them every day. When a para flags a mismatch between the plan and the students, that is high-value information. The teacher who treats that input as essential data, not pushback, gets better outcomes for students.',
      partnershipSkill: 'Shared Planning',
    },
    es: {
      context: 'Martes por la noche, 9:45 PM. La maestra envia el plan para manana por mensaje.',
      paraView: {
        setup: 'La maestra te envia un plan detallado para el grupo pequeno de manana. Dice: "Haz que los estudiantes usen el cuadro T para comparar rasgos de personajes y citar evidencia textual en oraciones completas." Sabes con certeza que dos de los cuatro estudiantes de tu grupo no saben que es un cuadro T, y uno no puede escribir oraciones completas de forma independiente todavia.',
        choices: [
          { text: 'Intentar el plan como esta escrito y ayudar a los estudiantes a completarlo, aunque tome todo el bloque.', best: false },
          { text: 'Responder por mensaje: "Me encanta el plan. Te aviso que dos estudiantes no han usado cuadros T antes y uno necesita marcos de oraciones. Puedo modificar para ellos o quieres ajustar?"', best: true },
          { text: 'Modificar el plan por tu cuenta para que se ajuste a lo que los estudiantes realmente pueden hacer sin decirle a la maestra.', best: false },
        ],
      },
      teacherView: {
        setup: 'Tu para te responde por mensaje sobre el plan del grupo pequeno de manana. Dice que dos de los estudiantes nunca han usado un cuadro T y uno necesita marcos de oraciones. No lo sabias. Escribiste el plan basandote en expectativas de nivel de grado sin pensar en donde estan realmente esos estudiantes especificos.',
        choices: [
          { text: 'Agradecerle y decir: "Buena observacion. Usemos un diagrama de Venn en su lugar y hare marcos de oraciones esta noche. Puedes pre-ensenar el organizador grafico antes de que empiecen?"', best: true },
          { text: 'Decir: "Haz lo mejor que puedas con el plan. Necesitan estar expuestos a trabajo de nivel de grado aunque les cueste."', best: false },
          { text: 'Reescribir todo el plan desde cero y enviar una nueva version a las 10:30 PM.', best: false },
        ],
      },
      insight: 'La para a menudo conoce los niveles reales de habilidad de los estudiantes mejor que la maestra porque esta sentada junto a ellos todos los dias. Cuando una para senala una discrepancia entre el plan y los estudiantes, esa es informacion de alto valor. La maestra que trata esa informacion como datos esenciales, no como resistencia, obtiene mejores resultados para los estudiantes.',
      partnershipSkill: 'Planificacion Compartida',
    },
  },

  // 11. Para has been with students longer and knows things the teacher doesn't
  {
    en: {
      context: 'September, second week of school. New teacher, experienced para.',
      paraView: {
        setup: 'The new teacher is planning to use a loud buzzer as a transition signal. You have been with three of these students for two years and you know that Marcus has a trauma response to sudden loud noises, and that Kayla will shut down completely. The teacher seems excited about the buzzer system she used at her last school.',
        choices: [
          { text: 'Wait to see what happens. Maybe it will be fine and you are overthinking it.', best: false },
          { text: 'Say: "I want to share something about Marcus and Kayla before you try the buzzer. Marcus has a trauma response to sudden loud noises, and Kayla tends to shut down. Could we use a chime or visual signal instead?"', best: true },
          { text: 'Mention it casually: "Just so you know, some of these kids are sensitive to loud noises."', best: false },
        ],
      },
      teacherView: {
        setup: 'Your para, who has been with these students for two years, just told you that your planned buzzer transition signal could trigger a trauma response in one student and cause another to shut down. She suggested a chime or visual signal instead. You feel a little embarrassed because you were so excited about the buzzer system from your last school.',
        choices: [
          { text: 'Say: "Thank you for telling me that. I had no idea. A chime is an easy switch. What else should I know about these students that might not be in their files?"', best: true },
          { text: 'Say: "Good to know. Let me try the buzzer at a lower volume first and see how they react."', best: false },
          { text: 'Switch to the chime but feel annoyed that you have to change your plans because of the para\'s input.', best: false },
        ],
      },
      insight: 'Paras who have been with students for years are a living archive of what works and what harms. A new teacher who sees the para as a source of critical knowledge, not a challenge to their authority, avoids preventable harm. The follow-up question, "What else should I know?" signals that the teacher sees this as a partnership, not a hierarchy.',
      partnershipSkill: 'Student Advocacy',
    },
    es: {
      context: 'Septiembre, segunda semana de clases. Maestra nueva, para con experiencia.',
      paraView: {
        setup: 'La nueva maestra planea usar un timbre fuerte como senal de transicion. Has estado con tres de estos estudiantes por dos anos y sabes que Marcus tiene una respuesta de trauma a ruidos fuertes repentinos, y que Kayla se cierra completamente. La maestra parece emocionada con el sistema de timbre que usaba en su escuela anterior.',
        choices: [
          { text: 'Esperar a ver que pasa. Tal vez este bien y estas pensando demasiado.', best: false },
          { text: 'Decir: "Quiero compartir algo sobre Marcus y Kayla antes de que pruebes el timbre. Marcus tiene una respuesta de trauma a ruidos fuertes repentinos, y Kayla tiende a cerrarse. Podriamos usar una campanilla o senal visual en su lugar?"', best: true },
          { text: 'Mencionarlo casualmente: "Para que sepas, algunos de estos ninos son sensibles a los ruidos fuertes."', best: false },
        ],
      },
      teacherView: {
        setup: 'Tu para, que ha estado con estos estudiantes por dos anos, acaba de decirte que tu senal de transicion con timbre podria provocar una respuesta de trauma en un estudiante y hacer que otra se cierre. Sugirio una campanilla o senal visual en su lugar. Te sientes un poco avergonzada porque estabas tan emocionada con el sistema de timbre de tu escuela anterior.',
        choices: [
          { text: 'Decir: "Gracias por decirme. No tenia idea. Una campanilla es un cambio facil. Que mas deberia saber sobre estos estudiantes que tal vez no este en sus expedientes?"', best: true },
          { text: 'Decir: "Bueno saberlo. Dejame probar el timbre a un volumen mas bajo primero y ver como reaccionan."', best: false },
          { text: 'Cambiar a la campanilla pero sentirte molesta de que tienes que cambiar tus planes por la opinion de la para.', best: false },
        ],
      },
      insight: 'Las paras que han estado con estudiantes por anos son un archivo viviente de lo que funciona y lo que causa dano. Una maestra nueva que ve a la para como fuente de conocimiento critico, no un desafio a su autoridad, evita dano prevenible. La pregunta de seguimiento, "Que mas deberia saber?" senala que la maestra ve esto como una alianza, no una jerarquia.',
      partnershipSkill: 'Apoyo al Estudiante',
    },
  },

  // 12. Teacher wants para to collect data but never explained the form
  {
    en: {
      context: 'Monday, 9:00 AM. The teacher drops a clipboard on the para\'s desk.',
      paraView: {
        setup: 'The teacher puts a data collection form on your desk and says, "Can you track how many times each student in the blue group responds during the lesson today?" The form has columns you do not recognize: "prompted," "unprompted," "approximation," and "mastery." Nobody has explained what any of these mean or how to mark them.',
        choices: [
          { text: 'Fill it out based on your best guess and hope you are doing it right.', best: false },
          { text: 'Say: "I want to make sure I get this right. Can you walk me through what \'prompted\' versus \'unprompted\' means and what counts as \'approximation\'? It will take two minutes."', best: true },
          { text: 'Leave the form blank and tell the teacher after the lesson that you did not understand it.', best: false },
        ],
      },
      teacherView: {
        setup: 'You gave your para a data collection form for the blue group and she just asked you to explain the categories. You realized you handed her a form the special education team uses without explaining the terms. You assumed she would know what "prompted" and "unprompted" meant because she has been working with these students.',
        choices: [
          { text: 'Take two minutes to walk through each column with examples: "Prompted means you had to ask them or point. Unprompted means they did it on their own. Approximation means they tried but were not fully correct."', best: true },
          { text: 'Say: "Just mark a tally when they respond and I will sort out the categories later."', best: false },
          { text: 'Say: "It is the standard form. Just do your best with it."', best: false },
        ],
      },
      insight: 'Data collection is only useful when everyone collecting it understands the definitions. Two minutes of explanation prevents an entire day of bad data. When a para asks for clarification, that is professionalism, not weakness. The teacher should treat it as a sign that the para cares about doing the job right.',
      partnershipSkill: 'Shared Planning',
    },
    es: {
      context: 'Lunes, 9:00 AM. La maestra deja un portapapeles en el escritorio de la para.',
      paraView: {
        setup: 'La maestra pone un formulario de recoleccion de datos en tu escritorio y dice: "Puedes rastrear cuantas veces cada estudiante del grupo azul responde durante la leccion de hoy?" El formulario tiene columnas que no reconoces: "con indicacion," "sin indicacion," "aproximacion," y "dominio." Nadie ha explicado que significa nada de esto o como marcarlo.',
        choices: [
          { text: 'Llenarlo basandote en tu mejor suposicion y esperar que lo estes haciendo bien.', best: false },
          { text: 'Decir: "Quiero asegurarme de hacerlo bien. Puedes explicarme que significa \'con indicacion\' versus \'sin indicacion\' y que cuenta como \'aproximacion\'? Tomara dos minutos."', best: true },
          { text: 'Dejar el formulario en blanco y decirle a la maestra despues de la leccion que no lo entendiste.', best: false },
        ],
      },
      teacherView: {
        setup: 'Le diste a tu para un formulario de recoleccion de datos para el grupo azul y ella acaba de pedirte que le expliques las categorias. Te diste cuenta de que le entregaste un formulario que usa el equipo de educacion especial sin explicar los terminos. Asumiste que sabria lo que "con indicacion" y "sin indicacion" significaban porque ha estado trabajando con estos estudiantes.',
        choices: [
          { text: 'Tomar dos minutos para repasar cada columna con ejemplos: "Con indicacion significa que tuviste que preguntarles o senalar. Sin indicacion significa que lo hicieron solos. Aproximacion significa que lo intentaron pero no fue completamente correcto."', best: true },
          { text: 'Decir: "Solo marca una tally cuando respondan y yo organizare las categorias despues."', best: false },
          { text: 'Decir: "Es el formulario estandar. Solo haz lo mejor que puedas."', best: false },
        ],
      },
      insight: 'La recoleccion de datos solo es util cuando todos los que la recolectan entienden las definiciones. Dos minutos de explicacion previenen un dia entero de datos malos. Cuando una para pide aclaracion, eso es profesionalismo, no debilidad. La maestra deberia tratarlo como una senal de que la para se preocupa por hacer bien el trabajo.',
      partnershipSkill: 'Planificacion Compartida',
    },
  },

  // 13. Para feels micromanaged, teacher feels para is not following through
  {
    en: {
      context: 'Wednesday after school. The teacher asks to "chat for a minute."',
      paraView: {
        setup: 'The teacher checks in on you multiple times during every lesson. She watches what you write on the board with your small group, corrects your wording in front of students, and sends you follow-up texts after school about things she wants done differently. You feel like you cannot make a single decision without being watched.',
        choices: [
          { text: 'Accept it as part of the job. She is the teacher and she has the right to direct your work.', best: false },
          { text: 'Say: "I appreciate that you want things done well. Can we talk about which decisions I can own and where you want me to check in with you first? That way I know your expectations clearly."', best: true },
          { text: 'Start doing things differently when she is not watching and go back to her way when she is nearby.', best: false },
        ],
      },
      teacherView: {
        setup: 'You have been checking on your para more than usual because last week she taught a concept incorrectly to the small group and you did not catch it until two days later. You overcorrected by monitoring everything. Now you notice she seems tense whenever you walk by, and she stopped making eye contact during transitions.',
        choices: [
          { text: 'Say: "I realize I have been hovering. Last week\'s mix-up made me nervous, but I should have talked to you about it instead of watching everything. Can we figure out a check-in system that works for both of us?"', best: true },
          { text: 'Keep monitoring but try to be less obvious about it.', best: false },
          { text: 'Pull back completely and give her full autonomy. If something goes wrong, address it then.', best: false },
        ],
      },
      insight: 'Micromanagement is almost always a response to a specific trust break, not a personality flaw. The teacher had a valid concern but chose surveillance over conversation. When both sides name the real issue and co-create a check-in system, the para gets autonomy with guardrails and the teacher gets confidence without hovering.',
      partnershipSkill: 'Giving Feedback',
    },
    es: {
      context: 'Miercoles despues de la escuela. La maestra pide "hablar un minuto."',
      paraView: {
        setup: 'La maestra te revisa varias veces durante cada leccion. Observa lo que escribes en el pizarron con tu grupo pequeno, corrige tu redaccion frente a los estudiantes y te envia mensajes de seguimiento despues de la escuela sobre cosas que quiere que se hagan diferente. Sientes que no puedes tomar una sola decision sin ser observada.',
        choices: [
          { text: 'Aceptarlo como parte del trabajo. Ella es la maestra y tiene derecho a dirigir tu trabajo.', best: false },
          { text: 'Decir: "Aprecio que quieras que las cosas se hagan bien. Podemos hablar sobre cuales decisiones puedo tomar yo y donde quieres que consulte contigo primero? Asi conozco tus expectativas claramente."', best: true },
          { text: 'Empezar a hacer las cosas diferente cuando ella no esta mirando y volver a su forma cuando esta cerca.', best: false },
        ],
      },
      teacherView: {
        setup: 'Has estado revisando a tu para mas de lo normal porque la semana pasada enseno un concepto incorrectamente al grupo pequeno y no te diste cuenta hasta dos dias despues. Sobrecorregiste monitoreando todo. Ahora notas que parece tensa cada vez que pasas cerca, y dejo de hacer contacto visual durante las transiciones.',
        choices: [
          { text: 'Decir: "Me doy cuenta de que he estado encima. El error de la semana pasada me puso nerviosa, pero deberia haber hablado contigo en lugar de vigilar todo. Podemos crear un sistema de revision que funcione para ambas?"', best: true },
          { text: 'Seguir monitoreando pero intentar ser menos obvia al respecto.', best: false },
          { text: 'Retirarte completamente y darle autonomia total. Si algo sale mal, abordarlo entonces.', best: false },
        ],
      },
      insight: 'El micromanejo es casi siempre una respuesta a una ruptura especifica de confianza, no un defecto de personalidad. La maestra tenia una preocupacion valida pero eligio vigilancia sobre conversacion. Cuando ambas partes nombran el problema real y co-crean un sistema de revision, la para obtiene autonomia con limites y la maestra obtiene confianza sin acosar.',
      partnershipSkill: 'Dar Retroalimentacion',
    },
  },

  // 14. Student meltdown, teacher and para disagree about response in the moment
  {
    en: {
      context: 'Friday, 2:15 PM. A student is in crisis.',
      paraView: {
        setup: 'Deshawn has flipped his desk and is throwing materials. You know from experience that he needs space and a calm voice. The teacher is walking toward him saying, "Deshawn, you need to pick that up right now. Everyone is watching." You can see his body getting more tense with every step she takes closer.',
        choices: [
          { text: 'Step between them and say firmly to the teacher: "Stop. You are making it worse."', best: false },
          { text: 'Position yourself near Deshawn, lower your body, and say to the teacher: "I have got him. Can you take the class to the rug for a few minutes?"', best: true },
          { text: 'Do nothing. The teacher is the lead and this is her call, even if you disagree.', best: false },
        ],
      },
      teacherView: {
        setup: 'Deshawn has flipped his desk. You are walking toward him to set a clear expectation. Your para moves in and says, "I have got him. Can you take the class to the rug?" Part of you feels undermined because you were handling it. But you notice Deshawn\'s shoulders relax slightly when your para crouches near him.',
        choices: [
          { text: 'Take the class to the rug. Talk with the para after the crisis is over about what worked and build a shared crisis plan for Deshawn.', best: true },
          { text: 'Stay and continue addressing Deshawn. The para should have let you lead.', best: false },
          { text: 'Take the class to the rug but feel frustrated that the para overstepped your authority.', best: false },
        ],
      },
      insight: 'In a student crisis, the only priority is the student. Who leads should be based on who the student responds to, not job titles. The debrief afterward is where the team aligns on strategy. A shared crisis plan created in calm moments prevents real-time disagreements when a student is in distress.',
      partnershipSkill: 'Conflict Repair',
    },
    es: {
      context: 'Viernes, 2:15 PM. Un estudiante esta en crisis.',
      paraView: {
        setup: 'Deshawn volteo su escritorio y esta lanzando materiales. Sabes por experiencia que necesita espacio y una voz calmada. La maestra camina hacia el diciendo: "Deshawn, necesitas recoger eso ahora mismo. Todos estan mirando." Puedes ver que su cuerpo se pone mas tenso con cada paso que ella da.',
        choices: [
          { text: 'Ponerte entre ellos y decirle firmemente a la maestra: "Para. Lo estas empeorando."', best: false },
          { text: 'Posicionarte cerca de Deshawn, bajar tu cuerpo, y decirle a la maestra: "Yo me encargo. Puedes llevar a la clase al tapete por unos minutos?"', best: true },
          { text: 'No hacer nada. La maestra es la lider y esta es su decision, aunque no estes de acuerdo.', best: false },
        ],
      },
      teacherView: {
        setup: 'Deshawn volteo su escritorio. Caminas hacia el para establecer una expectativa clara. Tu para se acerca y dice: "Yo me encargo. Puedes llevar a la clase al tapete?" Parte de ti se siente socavada porque tu lo estabas manejando. Pero notas que los hombros de Deshawn se relajan ligeramente cuando tu para se agacha cerca de el.',
        choices: [
          { text: 'Llevar a la clase al tapete. Hablar con la para despues de que pase la crisis sobre lo que funciono y construir un plan de crisis compartido para Deshawn.', best: true },
          { text: 'Quedarte y seguir dirigiendote a Deshawn. La para debio haberte dejado liderar.', best: false },
          { text: 'Llevar a la clase al tapete pero sentirte frustrada de que la para sobrepaso tu autoridad.', best: false },
        ],
      },
      insight: 'En una crisis de un estudiante, la unica prioridad es el estudiante. Quien lidera deberia basarse en a quien responde el estudiante, no en titulos de trabajo. La conversacion posterior es donde el equipo se alinea en estrategia. Un plan de crisis compartido creado en momentos de calma previene desacuerdos en tiempo real cuando un estudiante esta en angustia.',
      partnershipSkill: 'Reparacion de Conflictos',
    },
  },

  // 15. Teacher gives para feedback that feels like criticism
  {
    en: {
      context: 'Thursday, 3:45 PM. End of the day, students are gone.',
      paraView: {
        setup: 'The teacher says: "I noticed you did not use the sentence starters I put out for the writing group today. They are there for a reason." Her tone is flat and you cannot tell if she is angry or just tired. You actually did not see the sentence starters because they were under a stack of papers. Now you feel like you did something wrong.',
        choices: [
          { text: 'Apologize and say you will use them tomorrow. Do not explain why you missed them.', best: false },
          { text: 'Say: "I did not see them. They were under a stack of papers. Next time, can you point them out to me in the morning? I want to make sure I use what you prepare."', best: true },
          { text: 'Feel frustrated and say: "If you want me to use specific materials, you need to tell me directly instead of assuming I will find them."', best: false },
        ],
      },
      teacherView: {
        setup: 'You just told your para that she did not use the sentence starters you prepared. She explains that they were buried under papers and she did not see them. You realize your feedback sounded like criticism when you actually just wanted to make sure the materials got used. She looks hurt.',
        choices: [
          { text: 'Say: "That makes sense. I should have pointed them out this morning. Going forward, I will make sure materials for you are in a specific spot on the table. And I appreciate you telling me that."', best: true },
          { text: 'Say: "Okay, just check the table more carefully next time."', best: false },
          { text: 'Drop it. She knows now and it will be fine tomorrow.', best: false },
        ],
      },
      insight: 'Feedback without context sounds like criticism. "You did not use the sentence starters" hits differently than "I noticed the sentence starters were not used today. Did you see them?" The first assumes a choice. The second assumes a breakdown. When the teacher adjusts the delivery and creates a system, both people leave the conversation feeling respected.',
      partnershipSkill: 'Receiving Feedback',
    },
    es: {
      context: 'Jueves, 3:45 PM. Fin del dia, los estudiantes se fueron.',
      paraView: {
        setup: 'La maestra dice: "Note que no usaste los iniciadores de oraciones que puse para el grupo de escritura hoy. Estan ahi por una razon." Su tono es plano y no puedes decir si esta enojada o solo cansada. En realidad no viste los iniciadores de oraciones porque estaban debajo de un monton de papeles. Ahora sientes que hiciste algo mal.',
        choices: [
          { text: 'Disculparte y decir que los usaras manana. No explicar por que no los viste.', best: false },
          { text: 'Decir: "No los vi. Estaban debajo de un monton de papeles. La proxima vez, puedes senalarmelos en la manana? Quiero asegurarme de usar lo que preparas."', best: true },
          { text: 'Sentirte frustrada y decir: "Si quieres que use materiales especificos, necesitas decirmelo directamente en lugar de asumir que los encontrare."', best: false },
        ],
      },
      teacherView: {
        setup: 'Acabas de decirle a tu para que no uso los iniciadores de oraciones que preparaste. Ella explica que estaban enterrados bajo papeles y no los vio. Te das cuenta de que tu retroalimentacion sono como critica cuando en realidad solo querias asegurarte de que los materiales se usaran. Se ve herida.',
        choices: [
          { text: 'Decir: "Tiene sentido. Deberia habertelos senalado esta manana. De ahora en adelante, me asegurare de que los materiales para ti esten en un lugar especifico en la mesa. Y aprecio que me lo digas."', best: true },
          { text: 'Decir: "Bueno, solo revisa la mesa con mas cuidado la proxima vez."', best: false },
          { text: 'Dejarlo ir. Ya lo sabe y estara bien manana.', best: false },
        ],
      },
      insight: 'La retroalimentacion sin contexto suena como critica. "No usaste los iniciadores de oraciones" suena diferente que "Note que los iniciadores de oraciones no se usaron hoy. Los viste?" La primera asume una eleccion. La segunda asume una falla de proceso. Cuando la maestra ajusta la entrega y crea un sistema, ambas personas salen de la conversacion sintiendose respetadas.',
      partnershipSkill: 'Recibir Retroalimentacion',
    },
  },

  // 16. Para is late consistently and teacher is frustrated but hasn't said anything
  {
    en: {
      context: 'Every morning this week. The para arrives 5 to 10 minutes after students.',
      paraView: {
        setup: 'You have been getting to school late every day this week because your own child\'s daycare opens at the same time school starts and there is no wiggle room. You know the teacher notices because she is handling morning routines alone, but she has not said anything. You feel guilty but do not know what to do because the daycare will not open earlier.',
        choices: [
          { text: 'Keep coming in late and hope the teacher understands. Eventually the daycare situation will work itself out.', best: false },
          { text: 'Talk to the teacher: "I know I have been late this week and I am sorry it is affecting our morning. My daycare opens at the same time school starts. Can we figure out a system where I do something specific to make up for those first 10 minutes?"', best: true },
          { text: 'Ask the principal for a schedule change without telling the teacher about the issue.', best: false },
        ],
      },
      teacherView: {
        setup: 'Your para has been 5 to 10 minutes late every day this week. You have been handling morning arrival alone, which means three students with IEP accommodations are not getting their morning check-ins. You are frustrated but you have not said anything because you do not want to come across as harsh.',
        choices: [
          { text: 'Say: "I have noticed you have been getting here a bit later this week. Is everything okay? I want to figure this out together because the morning check-ins for Marcus, Sofia, and Jaylen need to happen."', best: true },
          { text: 'Send an email documenting the late arrivals so there is a paper trail, just in case.', best: false },
          { text: 'Mention it to the principal and let them handle it.', best: false },
        ],
      },
      insight: 'Avoiding the conversation does not make the problem go away. It makes resentment grow. Leading with curiosity instead of frustration opens the door to problem-solving. The para naming the issue and offering a solution shows professionalism. The teacher asking with genuine concern keeps the relationship intact.',
      partnershipSkill: 'Giving Feedback',
    },
    es: {
      context: 'Cada manana esta semana. La para llega 5 a 10 minutos despues de los estudiantes.',
      paraView: {
        setup: 'Has estado llegando tarde a la escuela todos los dias esta semana porque la guarderia de tu hijo abre a la misma hora que empieza la escuela y no hay margen. Sabes que la maestra lo nota porque esta manejando las rutinas matutinas sola, pero no ha dicho nada. Te sientes culpable pero no sabes que hacer porque la guarderia no abrira mas temprano.',
        choices: [
          { text: 'Seguir llegando tarde y esperar que la maestra entienda. Eventualmente la situacion de la guarderia se resolvera sola.', best: false },
          { text: 'Hablar con la maestra: "Se que he llegado tarde esta semana y lamento que este afectando nuestra manana. Mi guarderia abre a la misma hora que empieza la escuela. Podemos crear un sistema donde yo haga algo especifico para compensar esos primeros 10 minutos?"', best: true },
          { text: 'Pedirle al director un cambio de horario sin decirle a la maestra sobre el problema.', best: false },
        ],
      },
      teacherView: {
        setup: 'Tu para ha llegado 5 a 10 minutos tarde todos los dias esta semana. Has estado manejando la llegada matutina sola, lo que significa que tres estudiantes con acomodaciones del IEP no estan recibiendo sus revisiones matutinas. Estas frustrada pero no has dicho nada porque no quieres parecer dura.',
        choices: [
          { text: 'Decir: "He notado que has estado llegando un poco mas tarde esta semana. Esta todo bien? Quiero resolver esto juntas porque las revisiones matutinas de Marcus, Sofia y Jaylen necesitan ocurrir."', best: true },
          { text: 'Enviar un correo documentando las llegadas tardias para tener un registro, por si acaso.', best: false },
          { text: 'Mencionarselo al director y dejar que ellos lo manejen.', best: false },
        ],
      },
      insight: 'Evitar la conversacion no hace que el problema desaparezca. Hace que el resentimiento crezca. Liderar con curiosidad en lugar de frustracion abre la puerta a la resolucion de problemas. La para que nombra el problema y ofrece una solucion muestra profesionalismo. La maestra que pregunta con preocupacion genuina mantiene la relacion intacta.',
      partnershipSkill: 'Dar Retroalimentacion',
    },
  },

  // 17. Para does something brilliant and nobody notices
  {
    en: {
      context: 'Thursday, 1:30 PM. During independent work time.',
      paraView: {
        setup: 'You noticed that Amir, who never participates in class discussions, lit up when the topic was about animals. During small group, you connected the reading comprehension passage to animal habitats and he answered every question. He even volunteered to read aloud for the first time all year. The teacher did not see it because she was conferencing with other students.',
        choices: [
          { text: 'Enjoy the moment privately. That is the reward of the job and you do not need recognition.', best: false },
          { text: 'After school, tell the teacher: "Something amazing happened with Amir today. He volunteered to read aloud for the first time. I connected the passage to animal habitats and it unlocked something. I thought you would want to know so we can build on it."', best: true },
          { text: 'Tell another para about it. At least someone will appreciate what happened.', best: false },
        ],
      },
      teacherView: {
        setup: 'Your para tells you after school that Amir volunteered to read aloud for the first time all year during small group. She connected the reading passage to animal habitats because she noticed his interest. You had no idea Amir liked animals. This is the kind of breakthrough moment you have been hoping for all year.',
        choices: [
          { text: 'Say: "This is huge. Thank you for telling me, and thank you for doing that. Can you keep connecting to animals when you can? I will build it into his reading conference goals too. You made that happen."', best: true },
          { text: 'Say: "That is great. I will try to work animals into future lessons."', best: false },
          { text: 'Email the parent about Amir\'s breakthrough moment, mentioning the teacher and para partnership.', best: false },
        ],
      },
      insight: 'Paras create breakthroughs that nobody sees because they happen in small groups while the teacher is elsewhere. When a para shares a win, the teacher who names the para\'s contribution and builds on the strategy sends a powerful message: what you do matters, and I see it.',
      partnershipSkill: 'Mutual Respect',
    },
    es: {
      context: 'Jueves, 1:30 PM. Durante tiempo de trabajo independiente.',
      paraView: {
        setup: 'Notaste que Amir, quien nunca participa en discusiones de clase, se ilumino cuando el tema era sobre animales. Durante el grupo pequeno, conectaste el pasaje de comprension lectora con habitats de animales y el respondio cada pregunta. Incluso se ofrecio a leer en voz alta por primera vez en todo el ano. La maestra no lo vio porque estaba conferenciando con otros estudiantes.',
        choices: [
          { text: 'Disfrutar el momento en privado. Esa es la recompensa del trabajo y no necesitas reconocimiento.', best: false },
          { text: 'Despues de la escuela, decirle a la maestra: "Algo increible paso con Amir hoy. Se ofrecio a leer en voz alta por primera vez. Conecte el pasaje con habitats de animales y desbloqueo algo. Pense que querrias saber para que podamos construir sobre eso."', best: true },
          { text: 'Contarselo a otra para. Al menos alguien apreciara lo que paso.', best: false },
        ],
      },
      teacherView: {
        setup: 'Tu para te dice despues de la escuela que Amir se ofrecio a leer en voz alta por primera vez en todo el ano durante el grupo pequeno. Ella conecto el pasaje de lectura con habitats de animales porque noto su interes. No tenias idea de que a Amir le gustaban los animales. Este es el tipo de avance que has estado esperando todo el ano.',
        choices: [
          { text: 'Decir: "Esto es enorme. Gracias por decirmelo, y gracias por hacer eso. Puedes seguir conectando con animales cuando puedas? Yo lo incorporare en sus metas de conferencia de lectura tambien. Tu hiciste que eso pasara."', best: true },
          { text: 'Decir: "Que bueno. Intentare incorporar animales en futuras lecciones."', best: false },
          { text: 'Enviar un correo al padre sobre el momento de avance de Amir, mencionando la alianza entre maestra y para.', best: false },
        ],
      },
      insight: 'Las paras crean avances que nadie ve porque suceden en grupos pequenos mientras la maestra esta en otro lugar. Cuando una para comparte un logro, la maestra que nombra la contribucion de la para y construye sobre la estrategia envia un mensaje poderoso: lo que haces importa, y lo veo.',
      partnershipSkill: 'Respeto Mutuo',
    },
  },

  // 18. Teacher wants to recommend para for a leadership role
  {
    en: {
      context: 'Friday afternoon. End of a strong week.',
      paraView: {
        setup: 'The teacher tells you the district is looking for paras to join a new professional development committee. She says: "I think you would be perfect for it. You have a perspective that teachers on the committee do not have." You are surprised because no one has ever asked your opinion on PD before, let alone recommended you for a leadership role.',
        choices: [
          { text: 'Say no. You are just a para and that kind of committee is for teachers and administrators.', best: false },
          { text: 'Say: "That means a lot. Can you tell me more about what it involves? I would be interested if you think my experience with students in small groups would actually be useful there."', best: true },
          { text: 'Say yes immediately without asking what it involves because you do not want to miss the opportunity.', best: false },
        ],
      },
      teacherView: {
        setup: 'You just recommended your para for the district PD committee. She looked shocked, then asked you to tell her more about it. You realize this might be the first time anyone has recognized her professional expertise outside the classroom. She has been doing this work for eight years and has never been asked to lead anything.',
        choices: [
          { text: 'Walk her through the committee details, offer to help her prepare for the first meeting, and tell the PD coordinator specifically what your para brings to the table.', best: true },
          { text: 'Forward her the committee email and let her figure it out from there. She is capable.', best: false },
          { text: 'Tell her she would be great but do not follow up. She will figure out the next steps if she wants to do it.', best: false },
        ],
      },
      insight: 'Paras are rarely asked to lead. When a teacher actively sponsors a para for a leadership role, it changes the para\'s trajectory. But the recommendation alone is not enough. Walking the para through the process, advocating for them by name, and providing ongoing support is what turns a suggestion into a real opportunity.',
      partnershipSkill: 'Initiative',
    },
    es: {
      context: 'Viernes por la tarde. Fin de una buena semana.',
      paraView: {
        setup: 'La maestra te dice que el distrito esta buscando paras para unirse a un nuevo comite de desarrollo profesional. Dice: "Creo que serias perfecta para ello. Tienes una perspectiva que los maestros del comite no tienen." Estas sorprendida porque nadie te ha pedido tu opinion sobre desarrollo profesional antes, mucho menos recomendarte para un rol de liderazgo.',
        choices: [
          { text: 'Decir que no. Solo eres una para y ese tipo de comite es para maestros y administradores.', best: false },
          { text: 'Decir: "Eso significa mucho. Puedes decirme mas sobre lo que implica? Me interesaria si crees que mi experiencia con estudiantes en grupos pequenos realmente seria util ahi."', best: true },
          { text: 'Decir que si inmediatamente sin preguntar que implica porque no quieres perder la oportunidad.', best: false },
        ],
      },
      teacherView: {
        setup: 'Acabas de recomendar a tu para para el comite de desarrollo profesional del distrito. Se vio sorprendida, luego te pidio que le contaras mas. Te das cuenta de que esta podria ser la primera vez que alguien ha reconocido su experiencia profesional fuera del salon. Ha estado haciendo este trabajo por ocho anos y nunca le han pedido que lidere nada.',
        choices: [
          { text: 'Explicarle los detalles del comite, ofrecerte a ayudarla a prepararse para la primera reunion, y decirle al coordinador de PD especificamente lo que tu para aporta.', best: true },
          { text: 'Reenviarle el correo del comite y dejar que ella lo resuelva. Es capaz.', best: false },
          { text: 'Decirle que seria genial pero no dar seguimiento. Ella averiguara los proximos pasos si quiere hacerlo.', best: false },
        ],
      },
      insight: 'A las paras rara vez se les pide que lideren. Cuando una maestra activamente patrocina a una para para un rol de liderazgo, cambia la trayectoria de la para. Pero la recomendacion sola no es suficiente. Guiar a la para a traves del proceso, abogar por ella por nombre y proporcionar apoyo continuo es lo que convierte una sugerencia en una oportunidad real.',
      partnershipSkill: 'Iniciativa',
    },
  },

  // 19. Parent thanks teacher for something the para actually did
  {
    en: {
      context: 'Tuesday morning drop-off. A parent approaches the teacher.',
      paraView: {
        setup: 'A parent walks up to the teacher at drop-off and says: "Thank you so much for the way you have been working with Mia on her reading. She is finally starting to enjoy books at home." You are standing right there. You are the one who has been reading with Mia every day during small group, using the book choices she picked, and building her confidence. The teacher says, "Thank you, I appreciate that."',
        choices: [
          { text: 'Say nothing. This happens all the time and it is not worth the awkwardness.', best: false },
          { text: 'After the parent leaves, tell the teacher privately: "It felt tough to hear that. I have been the one working with Mia on reading every day. I know you did not mean anything by it, but I want you to know that moment stung."', best: true },
          { text: 'Jump in while the parent is still there and say: "Actually, I have been working with Mia on her reading in small group."', best: false },
        ],
      },
      teacherView: {
        setup: 'A parent just thanked you for Mia\'s reading progress. You accepted the thanks, but the truth is your para has been doing all the direct reading work with Mia in small group. Your para is standing right there and did not say anything, but you noticed her expression change. You realize you took credit without correcting the parent.',
        choices: [
          { text: 'Find the parent before they leave and say: "I should have mentioned that Mrs. Torres has been the one working directly with Mia on reading every day. She deserves the credit." Then tell your para: "I should have said something in the moment. I am sorry."', best: true },
          { text: 'Tell the para privately: "I know that was your work. I am sorry I did not correct the parent." But do not follow up with the parent.', best: false },
          { text: 'Make a mental note to redirect credit next time but do not address this specific incident.', best: false },
        ],
      },
      insight: 'When a teacher accepts credit for work the para did, it erodes trust faster than almost anything else. The repair is not just apologizing to the para. It is going back to the parent and naming the para by name. That one sentence tells the para: your work is visible and I will make sure others see it too.',
      partnershipSkill: 'Mutual Respect',
    },
    es: {
      context: 'Martes en la manana, hora de llegada. Un padre/madre se acerca a la maestra.',
      paraView: {
        setup: 'Un padre/madre se acerca a la maestra durante la llegada y dice: "Muchas gracias por la forma en que has estado trabajando con Mia en su lectura. Finalmente esta empezando a disfrutar los libros en casa." Tu estas parada justo ahi. Tu eres quien ha estado leyendo con Mia todos los dias durante el grupo pequeno, usando las opciones de libros que ella eligio, y construyendo su confianza. La maestra dice: "Gracias, lo aprecio."',
        choices: [
          { text: 'No decir nada. Esto pasa todo el tiempo y no vale la pena la incomodidad.', best: false },
          { text: 'Despues de que se vaya el padre/madre, decirle a la maestra en privado: "Fue dificil escuchar eso. Yo soy quien ha estado trabajando con Mia en lectura todos los dias. Se que no lo dijiste con mala intencion, pero quiero que sepas que ese momento dolio."', best: true },
          { text: 'Intervenir mientras el padre/madre todavia esta ahi y decir: "En realidad, yo he estado trabajando con Mia en su lectura en el grupo pequeno."', best: false },
        ],
      },
      teacherView: {
        setup: 'Un padre/madre acaba de agradecerte por el progreso de Mia en lectura. Aceptaste el agradecimiento, pero la verdad es que tu para ha estado haciendo todo el trabajo directo de lectura con Mia en el grupo pequeno. Tu para esta parada justo ahi y no dijo nada, pero notaste que su expresion cambio. Te das cuenta de que tomaste el credito sin corregir al padre/madre.',
        choices: [
          { text: 'Encontrar al padre/madre antes de que se vaya y decir: "Deberia haber mencionado que la Sra. Torres ha sido quien trabaja directamente con Mia en lectura todos los dias. Ella merece el credito." Luego decirle a tu para: "Deberia haber dicho algo en el momento. Lo siento."', best: true },
          { text: 'Decirle a la para en privado: "Se que ese fue tu trabajo. Lamento no haber corregido al padre/madre." Pero no dar seguimiento con el padre/madre.', best: false },
          { text: 'Hacer una nota mental para redirigir el credito la proxima vez pero no abordar este incidente especifico.', best: false },
        ],
      },
      insight: 'Cuando una maestra acepta credito por trabajo que hizo la para, erosiona la confianza mas rapido que casi cualquier otra cosa. La reparacion no es solo disculparse con la para. Es regresar con el padre/madre y nombrar a la para por nombre. Esa sola oracion le dice a la para: tu trabajo es visible y me asegurare de que otros lo vean tambien.',
      partnershipSkill: 'Respeto Mutuo',
    },
  },

  // 20. Teacher and para finally have a great day after weeks of tension
  {
    en: {
      context: 'Friday, 3:30 PM. The best day they have had in weeks.',
      paraView: {
        setup: 'Today everything clicked. The teacher shared the plan before school. You ran the small group seamlessly. She gave you a thumbs up during the lesson. Students transitioned smoothly. For the first time in weeks, you do not feel invisible or uncertain. The day is ending and part of you wants to say something, but you do not want to make it weird.',
        choices: [
          { text: 'Leave without saying anything. Good days speak for themselves.', best: false },
          { text: 'Say: "Today felt really good. I knew what was happening, I knew my role, and the students responded. I just wanted you to know that when we are on the same page, I can do my best work."', best: true },
          { text: 'Say: "See? This is what happens when you actually tell me the plan."', best: false },
        ],
      },
      teacherView: {
        setup: 'Today was the first day in weeks that felt like a real partnership. You shared the plan early, your para crushed it with the small group, and the students were regulated and productive. You are packing up and your para is about to leave. You realize you have spent weeks giving corrective feedback but have not once told her what she does well.',
        choices: [
          { text: 'Before she leaves, say: "Today was great. You ran that small group like a pro. When I give you the plan early, you bring things I would not have thought of. I want more days like this."', best: true },
          { text: 'Send a text later tonight saying the day went well.', best: false },
          { text: 'Do not say anything. You do not want to set an expectation that every day needs to be celebrated.', best: false },
        ],
      },
      insight: 'Good days are data too. Naming what went right is just as important as naming what went wrong. When both the teacher and para name the conditions that made the day work (shared plan, clear roles, early communication), they create a blueprint they can return to on the hard days.',
      partnershipSkill: 'Conflict Repair',
    },
    es: {
      context: 'Viernes, 3:30 PM. El mejor dia que han tenido en semanas.',
      paraView: {
        setup: 'Hoy todo encajo. La maestra compartio el plan antes de la escuela. Tu dirigiste el grupo pequeno sin problemas. Ella te dio un pulgar arriba durante la leccion. Los estudiantes hicieron transiciones sin problemas. Por primera vez en semanas, no te sientes invisible o insegura. El dia esta terminando y parte de ti quiere decir algo, pero no quieres que sea incomodo.',
        choices: [
          { text: 'Irte sin decir nada. Los buenos dias hablan por si mismos.', best: false },
          { text: 'Decir: "Hoy se sintio muy bien. Sabia lo que estaba pasando, sabia mi rol, y los estudiantes respondieron. Solo queria que supieras que cuando estamos en la misma pagina, puedo hacer mi mejor trabajo."', best: true },
          { text: 'Decir: "Ves? Esto es lo que pasa cuando realmente me dices el plan."', best: false },
        ],
      },
      teacherView: {
        setup: 'Hoy fue el primer dia en semanas que se sintio como una verdadera alianza. Compartiste el plan temprano, tu para lo hizo increible con el grupo pequeno, y los estudiantes estaban regulados y productivos. Estas empacando y tu para esta por irse. Te das cuenta de que has pasado semanas dando retroalimentacion correctiva pero no le has dicho ni una vez lo que hace bien.',
        choices: [
          { text: 'Antes de que se vaya, decir: "Hoy fue genial. Dirigiste ese grupo pequeno como una profesional. Cuando te doy el plan temprano, tu traes cosas que yo no habria pensado. Quiero mas dias como este."', best: true },
          { text: 'Enviar un mensaje esta noche diciendo que el dia salio bien.', best: false },
          { text: 'No decir nada. No quieres establecer la expectativa de que cada dia necesita ser celebrado.', best: false },
        ],
      },
      insight: 'Los buenos dias tambien son datos. Nombrar lo que salio bien es tan importante como nombrar lo que salio mal. Cuando tanto la maestra como la para nombran las condiciones que hicieron funcionar el dia (plan compartido, roles claros, comunicacion temprana), crean un modelo al que pueden volver en los dias dificiles.',
      partnershipSkill: 'Reparacion de Conflictos',
    },
  },
];
