// The Comeback: Things went wrong. No redo. Only forward.
// Recovery is the skill, not perfection.

export type Role = 'teacher' | 'para' | 'coach' | 'leader'
export type GradeBand = 'pk-2' | '3-5' | '6-8' | '9-12'

export type RecoveryType = 'relational_repair' | 'instructional_pivot' | 'emotional_reset' | 'professional_recalibration'

export interface ForwardMove {
  text: string
  quality: 'strong' | 'okay' | 'miss'
  why: string
  recoveryScore: { speed: number; relationship: number } // 1-5 each
}

export interface Scenario {
  id: string
  roles: Role[]
  gradeBands: GradeBand[]
  recoveryType: RecoveryType
  en: {
    whatHappened: string
    theAftershock: string
    forwardMoves: ForwardMove[]
    research: string
    realStory: string
    realStoryRole: string
  }
  es: {
    whatHappened: string
    theAftershock: string
    forwardMoves: ForwardMove[]
    research: string
    realStory: string
    realStoryRole: string
  }
}

export const SCENARIO_COUNT = 8

export const RECOVERY_LABELS: Record<RecoveryType, { en: string; es: string; color: string }> = {
  relational_repair: { en: 'Relational Repair', es: 'Reparacion Relacional', color: '#E8B84B' },
  instructional_pivot: { en: 'Instructional Pivot', es: 'Giro Instruccional', color: '#3498DB' },
  emotional_reset: { en: 'Emotional Reset', es: 'Reinicio Emocional', color: '#27AE60' },
  professional_recalibration: { en: 'Professional Recalibration', es: 'Recalibracion Profesional', color: '#9333EA' },
}

export const SCENARIOS: Scenario[] = [
  // ─── SCENARIO 1: Called a student the wrong name for 3 days ─────────────
  {
    id: 'tc-wrong-name',
    roles: ['teacher', 'para'],
    gradeBands: ['pk-2', '3-5', '6-8', '9-12'],
    recoveryType: 'relational_repair',
    en: {
      whatHappened: 'You called a student by their sibling\'s name for the first three days of school. Another student corrected you in front of the class. The student whose name you got wrong laughed it off, but you saw their face before the laugh.',
      theAftershock: 'It is now Day 4. You know the correct name. But the damage is not the name. It is what getting the name wrong communicated: you did not see them as an individual.',
      forwardMoves: [
        {
          text: 'Before class starts, walk to their desk, crouch to their level, and say: "I owe you an apology. I called you [sibling\'s name] for three days. That was not okay. You are [correct name], and I want you to know I see YOU, not your sibling. I am sorry."',
          quality: 'strong',
          why: 'Private, direct, and specific. You named what you did, why it mattered, and who they are. Crouching to their level removes the authority dynamic. This is not a passing comment. It is a deliberate act of repair that tells the student: your identity matters enough for me to stop and say this.',
          recoveryScore: { speed: 4, relationship: 5 },
        },
        {
          text: 'Make a point to use their correct name loudly and often throughout the day. "Great answer, [correct name]!" Let the correction happen through repetition.',
          quality: 'okay',
          why: 'Using the name correctly going forward is necessary but not sufficient. Repetition without acknowledgment says "I fixed the behavior" but not "I understand the impact." The student knows you know. They are waiting to see if you will address it or pretend it did not happen.',
          recoveryScore: { speed: 3, relationship: 2 },
        },
        {
          text: 'Move on. It was an honest mistake. Making a big deal out of it will only make the student more uncomfortable.',
          quality: 'miss',
          why: '"Moving on" is what adults say when they do not want to feel uncomfortable. The student already felt uncomfortable for three days. Your discomfort for 30 seconds of an apology is the smallest price for the trust you need to rebuild. Not addressing it teaches the student that their feelings are less important than your convenience.',
          recoveryScore: { speed: 1, relationship: 1 },
        },
      ],
      research: 'Noddings\' ethic of care research shows that students assess adult care through specific, personalized actions. A name is the most personal identifier a person has. Research on identity-safe classrooms (Steele & Cohn-Vargas, 2013) found that students whose names are consistently mispronounced or confused show 22% lower sense of belonging by week 3.',
      realStory: 'My first year, I called a student "Marcus" for a week. His name was Michael. His older brother Marcus had been in my class the year before. Michael never corrected me. A parent did, at conferences. "He comes home every day and says his teacher does not know his name." I cried in my car. I apologized to Michael the next day. He hugged me. That hug taught me more about teaching than my entire credential program.',
      realStoryRole: '1st-year teacher, now 8 years in',
    },
    es: {
      whatHappened: 'Llamaste a un estudiante por el nombre de su hermano/a durante los primeros tres dias de clases. Otro estudiante te corrigio frente a la clase. El estudiante cuyo nombre confundiste se rio, pero viste su cara antes de la risa.',
      theAftershock: 'Es el Dia 4. Sabes el nombre correcto. Pero el dano no es el nombre. Es lo que confundir el nombre comunico: no los viste como un individuo.',
      forwardMoves: [
        {
          text: 'Antes de que empiece la clase, camina a su escritorio, agachate a su nivel y di: "Te debo una disculpa. Te llame [nombre del hermano] por tres dias. Eso no estuvo bien. Tu eres [nombre correcto], y quiero que sepas que te veo a TI, no a tu hermano/a. Lo siento."',
          quality: 'strong',
          why: 'Privado, directo y especifico. Nombraste lo que hiciste, por que importo y quien son. Agacharte a su nivel elimina la dinamica de autoridad.',
          recoveryScore: { speed: 4, relationship: 5 },
        },
        {
          text: 'Usa su nombre correcto fuerte y seguido durante todo el dia. "Gran respuesta, [nombre correcto]!" Deja que la correccion pase por repeticion.',
          quality: 'okay',
          why: 'Usar el nombre correctamente de ahora en adelante es necesario pero no suficiente. La repeticion sin reconocimiento dice "corregi el comportamiento" pero no "entiendo el impacto."',
          recoveryScore: { speed: 3, relationship: 2 },
        },
        {
          text: 'Sigue adelante. Fue un error honesto. Hacer un gran drama solo hara al estudiante mas incomodo.',
          quality: 'miss',
          why: '"Seguir adelante" es lo que los adultos dicen cuando no quieren sentirse incomodos. El estudiante ya se sintio incomodo por tres dias.',
          recoveryScore: { speed: 1, relationship: 1 },
        },
      ],
      research: 'La investigacion de Noddings sobre etica del cuidado muestra que los estudiantes evaluan el cuidado adulto a traves de acciones especificas y personalizadas. La investigacion sobre salones seguros para la identidad (Steele y Cohn-Vargas, 2013) encontro que los estudiantes cuyos nombres son confundidos muestran 22% menor sentido de pertenencia para la semana 3.',
      realStory: 'Mi primer ano, llame a un estudiante "Marcus" por una semana. Su nombre era Michael. Su hermano mayor Marcus habia estado en mi clase el ano anterior. Michael nunca me corrigio. Un padre lo hizo, en conferencias. "Llega a casa todos los dias y dice que su maestra no sabe su nombre." Llore en mi auto. Me disculpe con Michael al dia siguiente. Me abrazo.',
      realStoryRole: 'Maestra de 1er ano, ahora con 8 anos de experiencia',
    },
  },

  // ─── SCENARIO 2: Lesson bombed completely ──────────────────────────────
  {
    id: 'tc-lesson-bombed',
    roles: ['teacher', 'para', 'coach'],
    gradeBands: ['3-5', '6-8', '9-12'],
    recoveryType: 'instructional_pivot',
    en: {
      whatHappened: 'You planned a collaborative activity that you were excited about. Students were supposed to work in groups to solve a real-world problem. Instead, half the groups argued, two groups did nothing, and one student said: "This is confusing. Can you just teach it normal?"',
      theAftershock: 'The lesson is over. Students leave looking frustrated. You have the same content to teach to another section in 45 minutes. Your instinct is to scrap the whole thing and go back to direct instruction.',
      forwardMoves: [
        {
          text: 'Keep the activity but restructure it. Add a 3-minute teacher model at the start showing exactly what group work should look like. Assign specific roles (reader, recorder, presenter, questioner). Reduce the problem to one clear question instead of an open-ended task. Run the revised version with the next section.',
          quality: 'strong',
          why: 'The activity did not fail. The scaffolding did. Students who have never done structured group work need to see what it looks like before they do it. Roles prevent the one-person-does-everything problem. A focused question prevents the "this is confusing" response. You kept the learning goal and fixed the vehicle.',
          recoveryScore: { speed: 5, relationship: 4 },
        },
        {
          text: 'Go back to direct instruction for the next section. The activity was not ready. Reteach the content the traditional way and try the activity again later once you have refined it.',
          quality: 'okay',
          why: 'Direct instruction will cover the content. But abandoning the activity teaches you nothing about why it failed. More importantly, it trains your instinct to retreat to safety when something does not work. The best teachers are not the ones who never fail. They are the ones who iterate between classes.',
          recoveryScore: { speed: 4, relationship: 2 },
        },
        {
          text: 'Run the exact same activity with the next section to see if it was the students or the lesson. Maybe this group just was not ready for it.',
          quality: 'miss',
          why: 'Repeating an unchanged lesson that just failed is not data collection. It is denial. The lesson told you exactly what was wrong: unclear directions, no roles, too much ambiguity. Running it identically will produce identical results and now two sections will be frustrated instead of one.',
          recoveryScore: { speed: 1, relationship: 1 },
        },
      ],
      research: 'Hattie\'s research on feedback loops shows that the most effective teachers make instructional adjustments within the same day, not the next unit. Teachers who revise between sections show 0.40 higher effect sizes than those who wait until the next week. The 45-minute gap between sections is the most valuable planning time in a teacher\'s day.',
      realStory: 'I designed a Socratic seminar for my 8th graders that I was so proud of. Three students talked. Twenty-two stared at me. I went home and ugly-cried. The next day, I gave every student a sentence starter card and a "phone a friend" option. It was a completely different class. Same kids, different scaffold. The content was never the problem. The access was.',
      realStoryRole: '8th grade ELA teacher, 4th year',
    },
    es: {
      whatHappened: 'Planeaste una actividad colaborativa que te entusiasmaba. Los estudiantes debian trabajar en grupos para resolver un problema del mundo real. En cambio, la mitad de los grupos discutio, dos no hicieron nada, y un estudiante dijo: "Esto es confuso. Puedes ensenarlo normal?"',
      theAftershock: 'La leccion termino. Los estudiantes se van frustrados. Tienes el mismo contenido para ensenar a otra seccion en 45 minutos. Tu instinto es desechar todo y volver a la instruccion directa.',
      forwardMoves: [
        {
          text: 'Manten la actividad pero reestructurala. Agrega un modelo de maestro de 3 minutos al inicio mostrando exactamente como debe verse el trabajo en grupo. Asigna roles especificos (lector, registrador, presentador, cuestionador). Reduce el problema a una pregunta clara. Ejecuta la version revisada con la siguiente seccion.',
          quality: 'strong',
          why: 'La actividad no fallo. El andamiaje fallo. Los estudiantes que nunca han hecho trabajo grupal estructurado necesitan ver como se ve antes de hacerlo.',
          recoveryScore: { speed: 5, relationship: 4 },
        },
        {
          text: 'Vuelve a la instruccion directa para la siguiente seccion. La actividad no estaba lista.',
          quality: 'okay',
          why: 'La instruccion directa cubrira el contenido. Pero abandonar la actividad no te ensena nada sobre por que fallo.',
          recoveryScore: { speed: 4, relationship: 2 },
        },
        {
          text: 'Haz la misma actividad exacta con la siguiente seccion para ver si fueron los estudiantes o la leccion.',
          quality: 'miss',
          why: 'Repetir una leccion sin cambios que acaba de fallar no es recoleccion de datos. Es negacion.',
          recoveryScore: { speed: 1, relationship: 1 },
        },
      ],
      research: 'La investigacion de Hattie sobre ciclos de retroalimentacion muestra que los maestros mas efectivos hacen ajustes instruccionales dentro del mismo dia. Los maestros que revisan entre secciones muestran un tamano de efecto 0.40 mayor que los que esperan hasta la siguiente semana.',
      realStory: 'Disene un seminario socratico para mis alumnos de 8vo que me enorgullecia mucho. Tres estudiantes hablaron. Veintidos me miraron fijamente. Fui a casa y llore. Al dia siguiente, le di a cada estudiante una tarjeta con inicios de oracion y una opcion de "llamar a un amigo." Fue una clase completamente diferente.',
      realStoryRole: 'Maestra de ELA de 8vo grado, 4to ano',
    },
  },

  // ─── SCENARIO 3: Lost your temper with a student ────────────────────────
  {
    id: 'tc-lost-temper',
    roles: ['teacher', 'para'],
    gradeBands: ['pk-2', '3-5', '6-8', '9-12'],
    recoveryType: 'relational_repair',
    en: {
      whatHappened: 'A student pushed your last button at the worst possible moment. You raised your voice. Not screaming, but sharp enough that the room went quiet. The student looked down. Other students looked at each other. You immediately knew you crossed a line.',
      theAftershock: 'The period ended. The student left without making eye contact. You replayed it in your head during your prep period. You know you need to fix this, but you are embarrassed and part of you still feels like the student deserved it.',
      forwardMoves: [
        {
          text: 'Find the student before the next time you see them in class. Pull them aside privately. Say: "I raised my voice at you, and that was not okay. You deserved better from me in that moment. I am sorry. It will not happen again." Do not explain why you were frustrated. Do not add "but you also need to..." Just apologize.',
          quality: 'strong',
          why: 'An apology with a "but" is not an apology. "I am sorry BUT you were being disruptive" puts the responsibility back on the student. A clean apology without justification models accountability. The student knows what they did. What they do not know is whether adults take responsibility for their own behavior. Now they do.',
          recoveryScore: { speed: 5, relationship: 5 },
        },
        {
          text: 'Start the next class by addressing the whole room: "Yesterday I raised my voice and I should not have. I hold myself to the same standards I hold you to, and I did not meet them. I am sorry to the whole class."',
          quality: 'okay',
          why: 'Public accountability is brave and models vulnerability. But it puts the spotlight on the student who was yelled at. They did not ask for a public moment. A private apology to the student and a brief public acknowledgment to the class (without naming the student) is more protective.',
          recoveryScore: { speed: 4, relationship: 3 },
        },
        {
          text: 'Move forward and be extra kind to the student in the coming days. Actions speak louder than words. They will see that you care through how you treat them.',
          quality: 'miss',
          why: 'Being kind after being harmful without naming what happened is gaslighting. The student knows what you did. If you never acknowledge it, they learn that adults can hurt you and then act like nothing happened. That is not repair. That is avoidance wearing a kind face.',
          recoveryScore: { speed: 1, relationship: 1 },
        },
      ],
      research: 'Restorative practices research (Wachtel, 2016) shows that repair must include three elements: acknowledgment of the harm, expression of genuine remorse, and a commitment to change. Skipping any one of the three makes the repair incomplete. Zehr\'s foundational work on restorative justice found that harmed parties rank "being heard" above "getting an apology" in importance. The student needs to hear you name what you did.',
      realStory: 'I snapped at a 4th grader during indoor recess. He was throwing markers and I had already asked him three times to stop. I yelled: "SIT DOWN." The room froze. I was mortified. I found him at lunch and said, "I yelled at you and I should not have. I am sorry. You deserve a teacher who stays calm even when they are frustrated." He said, "It is okay, everyone yells." And that sentence broke me. Because it should NOT be okay. And "everyone" should NOT yell. I apologized not just to fix it but to show him a different model.',
      realStoryRole: 'Para, 6 years in elementary',
    },
    es: {
      whatHappened: 'Un estudiante presiono tu ultimo boton en el peor momento posible. Levantaste la voz. No gritando, pero lo suficientemente fuerte para que el salon se quedara en silencio. El estudiante miro hacia abajo. Otros estudiantes se miraron entre si. Inmediatamente supiste que cruzaste una linea.',
      theAftershock: 'El periodo termino. El estudiante se fue sin hacer contacto visual. Lo repasaste en tu cabeza durante tu periodo de preparacion. Sabes que necesitas arreglarlo, pero te da verguenza y parte de ti siente que el estudiante se lo merecia.',
      forwardMoves: [
        {
          text: 'Encuentra al estudiante antes de la proxima vez que lo veas en clase. Llevalo aparte en privado. Di: "Levante la voz contigo, y eso no estuvo bien. Merecias algo mejor de mi en ese momento. Lo siento. No volvera a pasar." No expliques por que estabas frustrado. No agregues "pero tu tambien necesitas..." Solo disculpate.',
          quality: 'strong',
          why: 'Una disculpa con un "pero" no es una disculpa. Una disculpa limpia sin justificacion modela la responsabilidad.',
          recoveryScore: { speed: 5, relationship: 5 },
        },
        {
          text: 'Empieza la siguiente clase dirigiendote a todo el salon: "Ayer levante la voz y no debi hacerlo. Me exijo los mismos estandares que les exijo a ustedes, y no los cumpli. Lo siento."',
          quality: 'okay',
          why: 'La rendicion de cuentas publica es valiente. Pero pone el foco en el estudiante al que le gritaste. No pidieron un momento publico.',
          recoveryScore: { speed: 4, relationship: 3 },
        },
        {
          text: 'Sigue adelante y se extra amable con el estudiante los proximos dias. Las acciones hablan mas que las palabras.',
          quality: 'miss',
          why: 'Ser amable despues de dañar sin nombrar lo que paso es invalidar. El estudiante sabe lo que hiciste. Si nunca lo reconoces, aprenden que los adultos pueden lastimarte y luego actuar como si nada pasara.',
          recoveryScore: { speed: 1, relationship: 1 },
        },
      ],
      research: 'La investigacion de practicas restaurativas (Wachtel, 2016) muestra que la reparacion debe incluir tres elementos: reconocimiento del dano, expresion de remordimiento genuino, y un compromiso de cambio. El trabajo de Zehr sobre justicia restaurativa encontro que las personas afectadas clasifican "ser escuchadas" por encima de "recibir una disculpa" en importancia.',
      realStory: 'Le grite a un alumno de 4to durante el recreo interior. Estaba tirando marcadores y ya le habia pedido tres veces que parara. Grite: "SIENTATE." El salon se congelo. Me horrorice. Lo encontre en el almuerzo y dije: "Te grite y no debi hacerlo. Lo siento. Mereces un maestro que se mantenga calmado incluso cuando esta frustrado." Dijo: "Esta bien, todos gritan." Y esa oracion me rompio. Porque NO deberia estar bien.',
      realStoryRole: 'Para, 6 anos en primaria',
    },
  },

  // ─── SCENARIO 4: Mishandled a parent interaction ────────────────────────
  {
    id: 'tc-parent-mishandle',
    roles: ['teacher', 'para', 'leader'],
    gradeBands: ['pk-2', '3-5', '6-8', '9-12'],
    recoveryType: 'professional_recalibration',
    en: {
      whatHappened: 'A parent confronted you at pickup about their child\'s grade. You were caught off guard and got defensive. You said something like: "Your child does not turn in homework. That is why the grade is low." The parent\'s face hardened. They left without responding.',
      theAftershock: 'You realize that what you said was factually true but relationally destructive. You led with the child\'s failure instead of the child\'s potential. The parent did not hear data. They heard blame.',
      forwardMoves: [
        {
          text: 'Email the parent that evening. "I want to follow up on our conversation today. I did not handle it the way I should have. I care about [child\'s name] and I want to work with you to help them succeed. Can we schedule a call this week to talk about a plan together?"',
          quality: 'strong',
          why: 'Speed matters after a parent conflict. Same-day follow-up says this relationship matters to you. "I did not handle it well" is accountability without over-apologizing. "Work with you" positions the parent as a partner. "A plan together" shifts from blame to collaboration. You cannot unsay what you said, but you can change the direction of the relationship.',
          recoveryScore: { speed: 5, relationship: 5 },
        },
        {
          text: 'Wait a few days for things to cool down, then send a positive note home about something the child did well. Build the relationship back gradually.',
          quality: 'okay',
          why: 'A positive note is a good relationship tool in general. But after a conflict, it feels strategic rather than sincere. The parent is not thinking about a positive note. They are thinking about what you said about their child. Sending a positive note without addressing the interaction is deflection, not repair.',
          recoveryScore: { speed: 2, relationship: 2 },
        },
        {
          text: 'Document the interaction and notify your administrator in case the parent complains. Cover your bases.',
          quality: 'miss',
          why: 'Documentation is self-protection, not relationship repair. If your first instinct after a bad interaction is to protect yourself rather than repair the relationship, the parent\'s perception of you will be confirmed: you care about the grade, not the child. Documentation may be necessary, but it should never be the first step.',
          recoveryScore: { speed: 1, relationship: 1 },
        },
      ],
      research: 'Epstein\'s research on family partnerships found that after negative school interactions, parents decide within 48 hours whether to re-engage or withdraw. Parents who receive a follow-up within 24 hours re-engage 73% of the time. Parents who do not hear back within a week withdraw 81% of the time and become adversarial in future interactions.',
      realStory: 'A mom asked me why her son was failing science. I said, "He sleeps in class every day." She stared at me and said: "He sleeps because he is up all night with his baby sister so I can work the night shift." I went home and threw up. I emailed her at 9 PM: "I owe you an apology. I made an assumption and I was wrong. Can we talk about how to support him?" She called me the next morning. We cried together. That family became my strongest partnership all year.',
      realStoryRole: '7th grade science teacher',
    },
    es: {
      whatHappened: 'Un padre te confronto en la recogida sobre la calificacion de su hijo. Te tomaron desprevenido y te pusiste a la defensiva. Dijiste algo como: "Su hijo no entrega la tarea. Por eso la calificacion es baja." La cara del padre se endurecio. Se fueron sin responder.',
      theAftershock: 'Te das cuenta de que lo que dijiste era factualmente cierto pero relacionalmente destructivo. Lideraste con el fracaso del nino en lugar del potencial del nino. El padre no escucho datos. Escucho culpa.',
      forwardMoves: [
        {
          text: 'Envia un correo al padre esa noche. "Quiero dar seguimiento a nuestra conversacion de hoy. No lo maneje como debi. Me importa [nombre del nino] y quiero trabajar contigo para ayudarle a tener exito. Podemos programar una llamada esta semana para hablar de un plan juntos?"',
          quality: 'strong',
          why: 'La velocidad importa despues de un conflicto con los padres. Seguimiento el mismo dia dice que esta relacion te importa.',
          recoveryScore: { speed: 5, relationship: 5 },
        },
        {
          text: 'Espera unos dias para que las cosas se calmen, luego envia una nota positiva a casa sobre algo que el nino hizo bien.',
          quality: 'okay',
          why: 'Una nota positiva es buena herramienta relacional. Pero despues de un conflicto, se siente estrategica en lugar de sincera.',
          recoveryScore: { speed: 2, relationship: 2 },
        },
        {
          text: 'Documenta la interaccion y notifica a tu administrador en caso de que el padre se queje.',
          quality: 'miss',
          why: 'La documentacion es autoproteccion, no reparacion de relaciones. Si tu primer instinto es protegerte en lugar de reparar la relacion, la percepcion del padre se confirmara.',
          recoveryScore: { speed: 1, relationship: 1 },
        },
      ],
      research: 'La investigacion de Epstein sobre alianzas familiares encontro que despues de interacciones negativas, los padres deciden en 48 horas si reengancharse o retirarse. Los padres que reciben seguimiento dentro de 24 horas se reenganchan el 73% de las veces.',
      realStory: 'Una mama me pregunto por que su hijo estaba reprobando ciencias. Dije: "Se duerme en clase todos los dias." Me miro fijamente y dijo: "Se duerme porque esta despierto toda la noche con su hermanita para que yo pueda trabajar el turno nocturno." Fui a casa y vomite. Le envie un correo a las 9 PM: "Le debo una disculpa. Asumi algo y estaba equivocada." Llamo a la manana siguiente. Lloramos juntas.',
      realStoryRole: 'Maestra de ciencias de 7mo grado',
    },
  },

  // ─── SCENARIO 5: A colleague misunderstood you ──────────────────────────
  {
    id: 'tc-colleague-misunderstood',
    roles: ['teacher', 'para', 'coach', 'leader'],
    gradeBands: ['pk-2', '3-5', '6-8', '9-12'],
    recoveryType: 'professional_recalibration',
    en: {
      whatHappened: 'In a team meeting, you made a comment about needing better structure for group work. A colleague took it personally, thinking you were criticizing their teaching. After the meeting, they made a passive-aggressive comment to another teacher in the hallway. It got back to you.',
      theAftershock: 'You did not mean it as a critique. But intent does not matter as much as impact. This colleague is now distant, and two other teachers are watching to see how you handle it.',
      forwardMoves: [
        {
          text: 'Go to the colleague directly. Say: "I heard my comment landed differently than I intended. I was not talking about your teaching. I was thinking about my own practice. But I understand why it felt that way, and I am sorry for the impact."',
          quality: 'strong',
          why: '"I was not talking about your teaching" clarifies intent. "I understand why it felt that way" validates their perception. "I am sorry for the impact" takes responsibility without over-apologizing. You addressed the person directly instead of letting the hallway narrative grow. Speed and directness prevent small misunderstandings from becoming permanent fractures.',
          recoveryScore: { speed: 5, relationship: 5 },
        },
        {
          text: 'Let it blow over. It was a misunderstanding and getting into it will only make things awkward. Be extra friendly and it will sort itself out.',
          quality: 'miss',
          why: 'Professional misunderstandings do not blow over. They calcify. What starts as a misread comment becomes "that person always criticizes me" within two weeks. The hallway conversation already happened. Other teachers already formed a narrative. If you do not insert your version directly, the colleague\'s version becomes the truth.',
          recoveryScore: { speed: 1, relationship: 1 },
        },
        {
          text: 'Send a group email to the whole team clarifying what you meant. That way everyone hears the correct version.',
          quality: 'okay',
          why: 'Public clarification addresses the rumor but bypasses the person who felt hurt. The colleague does not need to see their reaction corrected in front of the team. That feels humiliating, not clarifying. A direct conversation first, then a casual team clarification if needed, protects the relationship while addressing the narrative.',
          recoveryScore: { speed: 3, relationship: 2 },
        },
      ],
      research: 'Bryk and Schneider\'s research on relational trust found that unaddressed professional misunderstandings reduce team collaboration by 34% within one month. The critical window for repair is 48 hours. After that, the narrative becomes "who that person is" rather than "what they said." Patterson\'s Crucial Conversations research shows that direct, private conversations resolve 89% of professional conflicts. Avoidance resolves 0%.',
      realStory: 'I said "we need more consistency with behavior expectations" at a PLC meeting. My co-teacher thought I was saying her classroom management was bad. She stopped talking to me for two weeks. I finally knocked on her door during prep and said: "I think I hurt your feelings and I need you to know that was not my intent." She cried. She had been carrying it for 14 days. We resolved it in 10 minutes. Fourteen days of tension. Ten minutes of honesty.',
      realStoryRole: '5th grade teacher',
    },
    es: {
      whatHappened: 'En una reunion de equipo, hiciste un comentario sobre necesitar mejor estructura para el trabajo grupal. Un colega se lo tomo personal, pensando que estabas criticando su ensenanza. Despues de la reunion, hicieron un comentario pasivo-agresivo a otro maestro en el pasillo. Te llego la informacion.',
      theAftershock: 'No lo dijiste como critica. Pero la intencion no importa tanto como el impacto. Este colega ahora esta distante, y otros dos maestros estan observando como lo manejas.',
      forwardMoves: [
        {
          text: 'Ve al colega directamente. Di: "Supe que mi comentario aterrizo diferente a como lo intente. No estaba hablando de tu ensenanza. Estaba pensando en mi propia practica. Pero entiendo por que se sintio asi, y lamento el impacto."',
          quality: 'strong',
          why: 'Aclaraste la intencion, validaste su percepcion y tomaste responsabilidad por el impacto. Abordaste a la persona directamente en lugar de dejar que la narrativa del pasillo creciera.',
          recoveryScore: { speed: 5, relationship: 5 },
        },
        {
          text: 'Deja que pase. Fue un malentendido y meterse solo hara las cosas incomodas.',
          quality: 'miss',
          why: 'Los malentendidos profesionales no se resuelven solos. Se calcifican. Lo que empieza como un comentario mal interpretado se convierte en "esa persona siempre me critica" en dos semanas.',
          recoveryScore: { speed: 1, relationship: 1 },
        },
        {
          text: 'Envia un correo grupal a todo el equipo aclarando lo que quisiste decir.',
          quality: 'okay',
          why: 'La clarificacion publica aborda el rumor pero pasa por alto a la persona que se sintio herida.',
          recoveryScore: { speed: 3, relationship: 2 },
        },
      ],
      research: 'La investigacion de Bryk y Schneider encontro que los malentendidos profesionales sin resolver reducen la colaboracion del equipo en un 34% dentro de un mes. La ventana critica para reparacion es 48 horas. La investigacion de Patterson sobre Conversaciones Cruciales muestra que las conversaciones directas y privadas resuelven el 89% de los conflictos profesionales. La evasion resuelve el 0%.',
      realStory: 'Dije "necesitamos mas consistencia con las expectativas de comportamiento" en una reunion PLC. Mi co-maestra penso que estaba diciendo que su manejo del salon era malo. Dejo de hablarme por dos semanas. Finalmente toque su puerta y dije: "Creo que te lastime y necesito que sepas que esa no fue mi intencion." Lloro. Lo habia cargado por 14 dias. Lo resolvimos en 10 minutos.',
      realStoryRole: 'Maestro de 5to grado',
    },
  },

  // ─── SCENARIO 6: A student shut down and you do not know why ────────────
  {
    id: 'tc-student-shutdown',
    roles: ['teacher', 'para'],
    gradeBands: ['pk-2', '3-5', '6-8'],
    recoveryType: 'emotional_reset',
    en: {
      whatHappened: 'A student who was fine all morning suddenly put their head down, stopped working, and refused to talk. You asked what was wrong. They said "nothing." You tried giving them space. You tried offering choices. Nothing worked. The class moved on. They did not.',
      theAftershock: 'The period ended and the student left silently. You have no idea what happened. You feel helpless. You also feel guilty for moving on with the lesson while they sat there.',
      forwardMoves: [
        {
          text: 'Write them a short note and leave it on their desk before they arrive tomorrow. "I noticed you had a hard time today. You do not have to tell me why. I just want you to know that I noticed, and I am here if you need me. You matter to me." Do not bring it up verbally unless they do.',
          quality: 'strong',
          why: 'A note is private, low-pressure, and permanent. The student can read it without performing a response. "You do not have to tell me why" removes the interrogation. "I noticed" is the most important sentence because it tells them they are seen. Some students will never tell you what happened. The note tells them it is safe to, if they ever want to.',
          recoveryScore: { speed: 4, relationship: 5 },
        },
        {
          text: 'Pull them aside first thing tomorrow and ask: "Can you help me understand what happened yesterday? I want to make sure you are okay."',
          quality: 'okay',
          why: 'Checking in is the right instinct. But asking them to explain what happened puts the burden of emotional labor on the student. If they could have told you yesterday, they would have. Tomorrow they may be fine and not want to revisit it. Or they may still not be ready. The note gives them agency over the timeline. The pull-aside does not.',
          recoveryScore: { speed: 3, relationship: 3 },
        },
        {
          text: 'Talk to the counselor and let them handle it. This is beyond your expertise and you do not want to make it worse.',
          quality: 'miss',
          why: 'The counselor should be informed, yes. But referring without connecting first tells the student: "I noticed you were struggling and sent someone else to deal with it." The counselor handles the intervention. You handle the relationship. Both matter. Referring without personally acknowledging the student\'s experience removes you from the equation, and the student needed YOU to see them, not just a professional.',
          recoveryScore: { speed: 2, relationship: 1 },
        },
      ],
      research: 'Masten\'s resilience research (2001) found that the single most protective factor for children experiencing adversity is at least one stable, caring adult who notices. Not one who fixes, diagnoses, or refers. One who notices. The simple act of acknowledgment ("I saw you were hurting") has a measurable impact on a child\'s cortisol levels and emotional recovery time.',
      realStory: 'A 3rd grader put her head down in October and would not move. I tried everything. At the end of the day I wrote her a note: "I do not know what happened today, but I saw you, and I am glad you were here." The next morning she walked in holding the note. She had taped it inside her folder. She never told me what happened. But she never shut down in my class again. The note was enough.',
      realStoryRole: '3rd grade teacher, 12 years in',
    },
    es: {
      whatHappened: 'Un estudiante que estuvo bien toda la manana de repente puso la cabeza en el escritorio, dejo de trabajar y se nego a hablar. Preguntaste que pasaba. Dijeron "nada." Intentaste darles espacio. Intentaste ofrecer opciones. Nada funciono. La clase siguio. Ellos no.',
      theAftershock: 'El periodo termino y el estudiante se fue en silencio. No tienes idea de que paso. Te sientes impotente. Tambien te sientes culpable por continuar con la leccion mientras estaban ahi sentados.',
      forwardMoves: [
        {
          text: 'Escribeles una nota corta y dejala en su escritorio antes de que lleguen manana. "Note que tuviste un momento dificil hoy. No tienes que decirme por que. Solo quiero que sepas que lo note, y estoy aqui si me necesitas. Me importas." No lo menciones verbalmente a menos que ellos lo hagan.',
          quality: 'strong',
          why: 'Una nota es privada, sin presion, y permanente. El estudiante puede leerla sin tener que actuar una respuesta. "No tienes que decirme por que" elimina el interrogatorio. "Lo note" es la oracion mas importante.',
          recoveryScore: { speed: 4, relationship: 5 },
        },
        {
          text: 'Llevalos aparte a primera hora manana y pregunta: "Puedes ayudarme a entender que paso ayer? Quiero asegurarme de que estes bien."',
          quality: 'okay',
          why: 'Verificar es el instinto correcto. Pero pedirles que expliquen pone la carga del trabajo emocional en el estudiante.',
          recoveryScore: { speed: 3, relationship: 3 },
        },
        {
          text: 'Habla con el consejero y dejalo en sus manos. Esto esta fuera de tu experiencia y no quieres empeorarlo.',
          quality: 'miss',
          why: 'El consejero debe ser informado, si. Pero referir sin conectar primero le dice al estudiante: "Note que estabas luchando y envie a alguien mas a encargarse."',
          recoveryScore: { speed: 2, relationship: 1 },
        },
      ],
      research: 'La investigacion de resiliencia de Masten (2001) encontro que el factor protector mas importante para ninos experimentando adversidad es al menos un adulto estable y carinoso que nota. No uno que arregla, diagnostica o refiere. Uno que nota.',
      realStory: 'Una alumna de 3ero puso la cabeza en el escritorio en octubre y no se movia. Intente todo. Al final del dia le escribi una nota: "No se que paso hoy, pero te vi, y me alegra que estuvieras aqui." A la manana siguiente entro sosteniendo la nota. La habia pegado dentro de su folder. Nunca me dijo que paso. Pero nunca se apago en mi clase de nuevo.',
      realStoryRole: 'Maestra de 3er grado, 12 anos de experiencia',
    },
  },

  // ─── SCENARIO 7: You froze during a crisis ──────────────────────────────
  {
    id: 'tc-froze-crisis',
    roles: ['teacher', 'para', 'leader'],
    gradeBands: ['pk-2', '3-5', '6-8', '9-12'],
    recoveryType: 'emotional_reset',
    en: {
      whatHappened: 'A student had a meltdown in class. Throwing things, screaming, flipping a desk. Other students were scared. You froze. Another adult (a para, a neighboring teacher, an admin) came in and handled it. They de-escalated the student, cleared the room, and resolved the situation. You stood there.',
      theAftershock: 'The crisis is over. But you cannot stop thinking about the fact that you did not move. You feel like you failed your students. You feel like everyone saw you freeze.',
      forwardMoves: [
        {
          text: 'Go to the adult who stepped in and say: "Thank you for handling that. I froze and I know it. I want to be better prepared. Can you walk me through what you did and why?" Then, the next morning, address your class: "Yesterday was scary. I want you to know that you are safe in this room. If something like that happens again, here is what we will do together."',
          quality: 'strong',
          why: 'You did three things. You thanked the person who helped (humility). You asked them to teach you (growth). You addressed your students\' safety (leadership). Freezing is a normal trauma response. It is not a character flaw. But the recovery is what your students and colleagues will remember.',
          recoveryScore: { speed: 5, relationship: 5 },
        },
        {
          text: 'Sign up for crisis response training so you are better prepared next time.',
          quality: 'okay',
          why: 'Training is valuable and responsible. But it addresses the next crisis, not this one. Your students are processing what happened right now. They need to hear from you right now. Training and immediate recovery are not either/or. Do both.',
          recoveryScore: { speed: 2, relationship: 2 },
        },
        {
          text: 'Do not bring it up. The crisis is over and revisiting it will only upset the students again.',
          quality: 'miss',
          why: 'Not talking about a scary event does not make students forget it. It makes them feel alone with it. Students are already processing: "What if it happens again? Will my teacher protect me?" If you do not address those questions directly, students answer them themselves. And their answers are usually worse than reality.',
          recoveryScore: { speed: 1, relationship: 1 },
        },
      ],
      research: 'Perry\'s neurosequential model explains the freeze response as a survival mechanism, not a failure. Under perceived threat, the brain bypasses the cortex (thinking) and activates the brainstem (survival). Freezing is as involuntary as flinching. The recovery research (van der Kolk, 2014) shows that naming the experience ("I froze and here is what I will do differently") reduces shame by 60% and increases future crisis response capability.',
      realStory: 'A 1st grader threw a chair. I did not move. The para ran in and got the other kids out while I stood there like a statue. I went home and cried for two hours. The next day I told my class: "Something scary happened yesterday. I want you to know that if it happens again, here is our plan: I will say the code word and you will line up and walk to Mrs. Rodriguez\'s room. Let us practice." We practiced. The kids felt safe. And honestly, so did I.',
      realStoryRole: 'Teacher, 2nd year',
    },
    es: {
      whatHappened: 'Un estudiante tuvo una crisis en clase. Tirando cosas, gritando, volteando un escritorio. Otros estudiantes estaban asustados. Te congelaste. Otro adulto (un para, un maestro vecino, un administrador) entro y lo manejo. Desescalaron al estudiante, despejaron el salon y resolvieron la situacion. Tu te quedaste ahi parado.',
      theAftershock: 'La crisis paso. Pero no puedes dejar de pensar en que no te moviste. Sientes que les fallaste a tus estudiantes. Sientes que todos te vieron congelarte.',
      forwardMoves: [
        {
          text: 'Ve al adulto que intervino y di: "Gracias por manejar eso. Me congele y lo se. Quiero estar mejor preparado/a. Puedes explicarme lo que hiciste y por que?" Luego, a la manana siguiente, habla con tu clase: "Lo de ayer fue aterrador. Quiero que sepan que estan seguros en este salon. Si algo asi pasa de nuevo, esto es lo que haremos juntos."',
          quality: 'strong',
          why: 'Hiciste tres cosas. Agradeciste a quien ayudo (humildad). Les pediste que te ensenaran (crecimiento). Abordaste la seguridad de tus estudiantes (liderazgo). Congelarse es una respuesta normal al trauma. No es un defecto de caracter.',
          recoveryScore: { speed: 5, relationship: 5 },
        },
        {
          text: 'Inscribete en un entrenamiento de respuesta a crisis para estar mejor preparado la proxima vez.',
          quality: 'okay',
          why: 'El entrenamiento es valioso. Pero aborda la proxima crisis, no esta. Tus estudiantes estan procesando lo que paso ahora mismo.',
          recoveryScore: { speed: 2, relationship: 2 },
        },
        {
          text: 'No lo menciones. La crisis paso y revisitarla solo molestara a los estudiantes de nuevo.',
          quality: 'miss',
          why: 'No hablar de un evento aterrador no hace que los estudiantes lo olviden. Los hace sentirse solos con ello.',
          recoveryScore: { speed: 1, relationship: 1 },
        },
      ],
      research: 'El modelo neurosecuencial de Perry explica la respuesta de congelamiento como un mecanismo de supervivencia, no un fracaso. La investigacion de recuperacion (van der Kolk, 2014) muestra que nombrar la experiencia reduce la verguenza en un 60%.',
      realStory: 'Un alumno de 1ero tiro una silla. No me movi. La para entro y saco a los ninos mientras yo estaba como estatua. Fui a casa y llore dos horas. Al dia siguiente le dije a mi clase: "Algo aterrador paso ayer. Quiero que sepan que si pasa de nuevo, este es nuestro plan." Practicamos. Los ninos se sintieron seguros. Y honestamente, yo tambien.',
      realStoryRole: 'Maestro/a, 2do ano',
    },
  },

  // ─── SCENARIO 8: Gave a student the wrong consequence ──────────────────
  {
    id: 'tc-wrong-consequence',
    roles: ['teacher', 'para', 'leader'],
    gradeBands: ['3-5', '6-8', '9-12'],
    recoveryType: 'relational_repair',
    en: {
      whatHappened: 'You gave a consequence to the wrong student. Two students were talking. You assumed the one with a history of behavior issues was the instigator. You sent them to the hall. The other student (the actual instigator) stayed in class. A third student came to you after class and said: "That was not fair. [Student name] was not the one talking."',
      theAftershock: 'The student you sent out has a pattern of being blamed first. You just confirmed their belief that adults do not see them fairly. The third student who spoke up is watching to see if you do anything about it.',
      forwardMoves: [
        {
          text: 'Find the student you sent out. Say: "I made a mistake. I assumed you were the one talking, and I was wrong. I sent you out and you did not deserve that. I am sorry. I am going to work on not making assumptions." Then thank the student who spoke up: "Thank you for telling me the truth. That took courage."',
          quality: 'strong',
          why: 'You did three things right: admitted the specific mistake, apologized to the harmed student, and validated the student who spoke up. The student with a history needs to hear that YOU see the pattern ("I am going to work on not making assumptions"). The student who spoke up needs to know that truth-telling is valued, not risky.',
          recoveryScore: { speed: 5, relationship: 5 },
        },
        {
          text: 'Reverse the consequence quietly. Let the student back in class and move on without making it a big deal.',
          quality: 'okay',
          why: 'Reversing the consequence is the minimum. But doing it quietly means the student never hears "I was wrong." They get the outcome (back in class) without the acknowledgment (I assumed, and I should not have). Quiet correction without named accountability teaches the student that adults fix mistakes but do not own them.',
          recoveryScore: { speed: 3, relationship: 2 },
        },
        {
          text: 'Stick with the consequence. Both students were talking, so technically the student who was sent out was also at fault. Changing it now would undermine your authority.',
          quality: 'miss',
          why: '"Technically at fault" is a technicality, not justice. You chose one student to punish based on their history, not their behavior. That is bias, and the whole class saw it. Protecting your authority by maintaining an unfair consequence teaches students that authority matters more than fairness. That lesson lasts longer than any consequence.',
          recoveryScore: { speed: 1, relationship: 1 },
        },
      ],
      research: 'Gregory and Weinstein\'s research on racial discipline disparities found that students with prior behavioral records receive consequences 2.6x faster than peers for identical behaviors. Rosenthal\'s Pygmalion Effect applies to discipline: students who are expected to misbehave are "caught" more often, creating a self-reinforcing cycle. Breaking the cycle requires adults to name their bias when they catch it in action.',
      realStory: 'I sent a kid to the office for throwing a paper airplane. Turned out it was the kid behind him. Another student told me after class. I went to the office, got the kid, walked him back to class, and said in front of everyone: "I owe you an apology. I assumed, and I was wrong. You did nothing wrong." A girl in the front row whispered to her friend: "Did a teacher just apologize to a student?" That moment changed my classroom culture more than any rule I ever posted.',
      realStoryRole: '6th grade math teacher',
    },
    es: {
      whatHappened: 'Diste una consecuencia al estudiante equivocado. Dos estudiantes estaban hablando. Asumiste que el que tenia historial de problemas de comportamiento era el instigador. Lo enviaste al pasillo. El otro estudiante (el verdadero instigador) se quedo en clase. Un tercer estudiante vino despues de clase y dijo: "Eso no fue justo. [Nombre] no era el que estaba hablando."',
      theAftershock: 'El estudiante que enviaste fuera tiene un patron de ser culpado primero. Acabas de confirmar su creencia de que los adultos no los ven justamente. El tercer estudiante que hablo esta observando si haces algo al respecto.',
      forwardMoves: [
        {
          text: 'Encuentra al estudiante que enviaste fuera. Di: "Cometi un error. Asumi que tu eras el que estaba hablando, y estaba equivocado/a. Te envie fuera y no lo merecias. Lo siento. Voy a trabajar en no hacer suposiciones." Luego agradece al estudiante que hablo: "Gracias por decirme la verdad. Eso tomo valentia."',
          quality: 'strong',
          why: 'Hiciste tres cosas bien: admitiste el error especifico, te disculpaste con el estudiante afectado, y validaste al que hablo.',
          recoveryScore: { speed: 5, relationship: 5 },
        },
        {
          text: 'Revierte la consecuencia silenciosamente. Deja que el estudiante regrese a clase y sigue adelante sin hacer gran cosa.',
          quality: 'okay',
          why: 'Revertir la consecuencia es el minimo. Pero hacerlo silenciosamente significa que el estudiante nunca escucha "estaba equivocado/a."',
          recoveryScore: { speed: 3, relationship: 2 },
        },
        {
          text: 'Manten la consecuencia. Ambos estudiantes estaban hablando, asi que tecnicamente el que fue enviado tambien tenia culpa.',
          quality: 'miss',
          why: '"Tecnicamente culpable" es una tecnicidad, no justicia. Elegiste a un estudiante para castigar basandote en su historial, no su comportamiento. Eso es sesgo, y toda la clase lo vio.',
          recoveryScore: { speed: 1, relationship: 1 },
        },
      ],
      research: 'La investigacion de Gregory y Weinstein sobre disparidades raciales en disciplina encontro que los estudiantes con registros previos reciben consecuencias 2.6 veces mas rapido que sus pares por comportamientos identicos. Romper el ciclo requiere que los adultos nombren su sesgo cuando lo detectan en accion.',
      realStory: 'Envie a un nino a la oficina por tirar un avion de papel. Resulto que fue el nino detras de el. Otro estudiante me dijo despues de clase. Fui a la oficina, traje al nino de vuelta, y dije frente a todos: "Te debo una disculpa. Asumi, y estaba equivocado. No hiciste nada malo." Una nina en la primera fila susurro a su amiga: "Un maestro acaba de disculparse con un estudiante?" Ese momento cambio la cultura de mi salon mas que cualquier regla.',
      realStoryRole: 'Maestro de matematicas de 6to grado',
    },
  },

  // ─── SCENARIO 9: Your technology failed mid-presentation ────────────────
  {
    id: 'tc-tech-fail',
    roles: ['teacher', 'coach', 'leader'],
    gradeBands: ['3-5', '6-8', '9-12'],
    recoveryType: 'instructional_pivot',
    en: {
      whatHappened: 'You are in the middle of a lesson that depends entirely on your slideshow. The projector dies. The IT person is not available. Your slides are on Google Drive and students do not have devices today. You have 30 minutes of class left and your entire plan was on those slides.',
      theAftershock: 'Twenty-eight students are looking at you. Some are already pulling out their phones. You can feel the lesson slipping away.',
      forwardMoves: [
        {
          text: 'Pause. Smile. Say: "Well, the technology just gave us an opportunity to do something better." Turn the content into a discussion, debate, or whiteboard activity using what students already know. Ask: "Based on what we covered so far, what questions do you still have?" Use their questions to drive the rest of the period.',
          quality: 'strong',
          why: 'You modeled adaptability. "The technology gave us an opportunity" reframes failure as possibility. Student-generated questions produce higher cognitive engagement than slide-based delivery. You just accidentally created a better lesson than the one you planned. The best teachers are not the ones who never lose their slides. They are the ones who do not need them.',
          recoveryScore: { speed: 5, relationship: 4 },
        },
        {
          text: 'Give students independent reading time or a worksheet while you troubleshoot the technology.',
          quality: 'okay',
          why: 'This fills time but wastes learning time. Students will perceive this as "free period" regardless of what you put in front of them. You also just told them that the technology is more important than the teaching. If you spend the remaining 30 minutes troubleshooting, the message is: the slides ARE the lesson. They should never be.',
          recoveryScore: { speed: 3, relationship: 2 },
        },
        {
          text: 'Let students use their phones to access the slides directly from Google Drive.',
          quality: 'miss',
          why: 'Phones + unsupervised slide access = Instagram within 90 seconds for most students. Even the ones who find the slides will not engage with them the way you would have delivered them. The slides were a delivery tool for YOUR instruction. Without you walking them through it, slides are just pictures with words. The lesson was never the slides. It was you.',
          recoveryScore: { speed: 2, relationship: 1 },
        },
      ],
      research: 'Lemov\'s research on instructional agility found that the highest-performing teachers plan for technology failure as a routine event, not a crisis. Teachers who pivot to discussion-based learning during tech failures show 15% higher student engagement than their original slide-based plans. The reason: slides create passive consumption. Discussion creates active thinking. The tech failure accidentally upgraded the lesson.',
      realStory: 'My smartboard died 10 minutes into a science lesson about ecosystems. I panicked for about 5 seconds. Then I said: "New plan. You are the ecosystem. Stand up. I need producers, consumers, and decomposers. Go." We acted out the food web in the middle of the classroom. A student who never participates became the apex predator and had the time of his life. Best lesson I taught all year. I have not used a smartboard for that unit since.',
      realStoryRole: '5th grade science teacher',
    },
    es: {
      whatHappened: 'Estas en medio de una leccion que depende completamente de tu presentacion. El proyector muere. La persona de IT no esta disponible. Tus diapositivas estan en Google Drive y los estudiantes no tienen dispositivos hoy. Te quedan 30 minutos de clase y todo tu plan estaba en esas diapositivas.',
      theAftershock: 'Veintiocho estudiantes te miran. Algunos ya estan sacando sus telefonos. Puedes sentir la leccion escapandose.',
      forwardMoves: [
        {
          text: 'Pausa. Sonrie. Di: "Bueno, la tecnologia nos acaba de dar una oportunidad de hacer algo mejor." Convierte el contenido en una discusion, debate o actividad de pizarron usando lo que los estudiantes ya saben. Pregunta: "Basandose en lo que hemos cubierto, que preguntas tienen todavia?" Usa sus preguntas para el resto del periodo.',
          quality: 'strong',
          why: 'Modelaste adaptabilidad. Las preguntas generadas por estudiantes producen mayor compromiso cognitivo que la entrega por diapositivas. Accidentalmente creaste una mejor leccion que la que planeaste.',
          recoveryScore: { speed: 5, relationship: 4 },
        },
        {
          text: 'Dale a los estudiantes tiempo de lectura independiente o una hoja de trabajo mientras resuelves la tecnologia.',
          quality: 'okay',
          why: 'Esto llena el tiempo pero desperdicia tiempo de aprendizaje. Tambien les dijiste que la tecnologia es mas importante que la ensenanza.',
          recoveryScore: { speed: 3, relationship: 2 },
        },
        {
          text: 'Deja que los estudiantes usen sus telefonos para acceder a las diapositivas directamente desde Google Drive.',
          quality: 'miss',
          why: 'Telefonos + acceso a diapositivas sin supervision = Instagram en 90 segundos. Las diapositivas eran una herramienta de entrega para TU instruccion. Sin ti guiandolos, las diapositivas son solo imagenes con palabras.',
          recoveryScore: { speed: 2, relationship: 1 },
        },
      ],
      research: 'La investigacion de Lemov sobre agilidad instruccional encontro que los maestros de mejor rendimiento planean para fallas tecnologicas como un evento rutinario, no una crisis. Los maestros que pivotan a aprendizaje basado en discusion durante fallas tecnologicas muestran 15% mayor compromiso estudiantil que sus planes originales con diapositivas.',
      realStory: 'Mi pizarra inteligente murio 10 minutos en una leccion de ciencias sobre ecosistemas. Entre en panico por 5 segundos. Luego dije: "Nuevo plan. Ustedes son el ecosistema. Levantense. Necesito productores, consumidores y descomponedores. Vamos." Actuamos la red alimenticia en medio del salon. Mejor leccion que ensene todo el ano.',
      realStoryRole: 'Maestro de ciencias de 5to grado',
    },
  },

  // ─── SCENARIO 10: You were observed and it was bad ──────────────────────
  {
    id: 'tc-bad-observation',
    roles: ['teacher', 'para'],
    gradeBands: ['pk-2', '3-5', '6-8', '9-12'],
    recoveryType: 'professional_recalibration',
    en: {
      whatHappened: 'Your administrator observed your class on the worst possible day. Students were off task. Your transitions were messy. You forgot a whole section of your lesson. The observer wrote notes the entire time. You could feel the evaluation happening in real time.',
      theAftershock: 'The post-observation meeting is tomorrow. You are dreading it. You are also angry because this was NOT your typical class. You want to say: "It is not usually like this." But you know how that sounds.',
      forwardMoves: [
        {
          text: 'Walk into the meeting and say it first: "That was not my best lesson. I know it. Here is what I would do differently." Then list 2-3 specific changes. Do not make excuses. Do not say "it is not usually like this." Show that you already diagnosed the problem and have a plan.',
          quality: 'strong',
          why: 'Leading with self-awareness disarms the evaluator. They came prepared to deliver feedback. Instead, you delivered it to yourself. This positions you as a reflective practitioner, not a defensive one. Administrators care less about the single bad lesson and more about whether you can see it and fix it.',
          recoveryScore: { speed: 5, relationship: 4 },
        },
        {
          text: 'Prepare evidence of your typical teaching: student work samples, lesson plans from better days, data showing student growth. Bring it to the meeting to provide context.',
          quality: 'okay',
          why: 'Evidence of good teaching is valuable in a broader evaluation. But bringing a portfolio to a post-observation meeting feels like a defense attorney bringing exhibits to trial. The observer is not evaluating your career. They are evaluating that lesson. Acknowledge it first. Then, if appropriate, share growth data as part of a forward-looking conversation.',
          recoveryScore: { speed: 3, relationship: 3 },
        },
        {
          text: 'Explain what went wrong: the students were off because of an assembly that morning, you had a migraine, and the copied materials did not arrive on time. Context matters.',
          quality: 'miss',
          why: 'Every reason you listed may be true. And every one of them sounds like an excuse to the person sitting across from you. Context matters, but leading with it signals: "This was not my fault." The strongest response is to own it first, then mention context only if asked. Accountability before explanation. Always.',
          recoveryScore: { speed: 2, relationship: 1 },
        },
      ],
      research: 'Dweck\'s mindset research shows that professionals who lead with self-assessment in evaluative conversations receive 40% higher ratings from supervisors than those who lead with justification. The reason: self-assessment signals growth orientation. Justification signals fixed orientation. Evaluators are looking for the question "What would you do differently?" to come from YOU, not from them.',
      realStory: 'My principal observed me on the day my classroom hamster died. The kids were crying. I was crying. The lesson was a disaster. In the post-observation meeting, I said: "That was the worst lesson I have ever taught and I know exactly why." My principal laughed and said: "I was dreading this meeting because I thought you would be defensive. Instead you just did the reflection for me." She gave me a "developing" on that observation but wrote in the notes: "This teacher knows what good teaching looks like and can self-correct. That matters more than one bad day."',
      realStoryRole: '2nd grade teacher, 3rd year',
    },
    es: {
      whatHappened: 'Tu administrador observo tu clase en el peor dia posible. Los estudiantes estaban fuera de tarea. Tus transiciones fueron desordenadas. Olvidaste toda una seccion de tu leccion. El observador escribio notas todo el tiempo. Podias sentir la evaluacion sucediendo en tiempo real.',
      theAftershock: 'La reunion post-observacion es manana. La temes. Tambien estas enojado/a porque esa NO fue tu clase tipica. Quieres decir: "Usualmente no es asi." Pero sabes como suena.',
      forwardMoves: [
        {
          text: 'Entra a la reunion y dilo primero: "Esa no fue mi mejor leccion. Lo se. Esto es lo que haria diferente." Luego lista 2-3 cambios especificos. No pongas excusas. No digas "usualmente no es asi." Muestra que ya diagnosticaste el problema y tienes un plan.',
          quality: 'strong',
          why: 'Liderar con autoconciencia desarma al evaluador. Vinieron preparados para dar retroalimentacion. En cambio, tu te la diste a ti mismo. Los administradores les importa menos la leccion mala y mas si puedes verla y arreglarla.',
          recoveryScore: { speed: 5, relationship: 4 },
        },
        {
          text: 'Prepara evidencia de tu ensenanza tipica: muestras de trabajo, planes de leccion de mejores dias, datos de crecimiento estudiantil.',
          quality: 'okay',
          why: 'Evidencia de buena ensenanza es valiosa. Pero traer un portafolio a una reunion post-observacion se siente como un abogado trayendo exhibiciones a un juicio.',
          recoveryScore: { speed: 3, relationship: 3 },
        },
        {
          text: 'Explica que salio mal: los estudiantes estaban alterados por una asamblea esa manana, tenias migrania, y los materiales copiados no llegaron a tiempo.',
          quality: 'miss',
          why: 'Cada razon puede ser cierta. Y cada una suena como excusa para la persona sentada frente a ti. Responsabilidad antes de explicacion. Siempre.',
          recoveryScore: { speed: 2, relationship: 1 },
        },
      ],
      research: 'La investigacion de mentalidad de Dweck muestra que los profesionales que lideran con autoevaluacion en conversaciones evaluativas reciben calificaciones 40% mas altas de supervisores que quienes lideran con justificacion.',
      realStory: 'Mi directora me observo el dia que murio el hamster del salon. Los ninos estaban llorando. Yo estaba llorando. La leccion fue un desastre. En la reunion dije: "Esa fue la peor leccion que he dado y se exactamente por que." Mi directora se rio y dijo: "Temia esta reunion porque pense que estarias a la defensiva. En cambio, hiciste la reflexion por mi."',
      realStoryRole: 'Maestra de 2do grado, 3er ano',
    },
  },
]
