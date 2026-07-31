// Reset Roulette: Guided wellness activities for educator stress relief

export type ResetCategory = 'breathwork' | 'movement' | 'gratitude' | 'grounding' | 'laugh' | 'reframe';

export interface ResetActivity {
  category: ResetCategory;
  en: {
    name: string;
    instruction: string;
    duration: number;
    tip: string;
  };
  es: {
    name: string;
    instruction: string;
    duration: number;
    tip: string;
  };
}

export const CATEGORY_INFO: Record<ResetCategory, { en: { label: string; description: string }; es: { label: string; description: string }; color: string }> = {
  breathwork: {
    en: { label: 'Breathwork', description: 'Slow down your nervous system with intentional breathing.' },
    es: { label: 'Respiracion', description: 'Desacelera tu sistema nervioso con respiracion intencional.' },
    color: '#3B82F6',
  },
  movement: {
    en: { label: 'Movement', description: 'Release physical tension your body has been holding all day.' },
    es: { label: 'Movimiento', description: 'Libera la tension fisica que tu cuerpo ha estado acumulando todo el dia.' },
    color: '#F59E0B',
  },
  gratitude: {
    en: { label: 'Gratitude', description: 'Redirect your brain toward something good.' },
    es: { label: 'Gratitud', description: 'Redirige tu cerebro hacia algo bueno.' },
    color: '#10B981',
  },
  grounding: {
    en: { label: 'Grounding', description: 'Come back to the present moment using your senses.' },
    es: { label: 'Anclaje', description: 'Regresa al momento presente usando tus sentidos.' },
    color: '#8B5CF6',
  },
  laugh: {
    en: { label: 'Laugh Break', description: 'Laughter is a reset button. Use it.' },
    es: { label: 'Pausa para Reir', description: 'La risa es un boton de reinicio. Usalo.' },
    color: '#F43F5E',
  },
  reframe: {
    en: { label: 'Reframe', description: 'Shift your perspective on a hard moment.' },
    es: { label: 'Reencuadre', description: 'Cambia tu perspectiva sobre un momento dificil.' },
    color: '#22B8BD',
  },
};

export const RESET_ACTIVITIES: ResetActivity[] = [
  // BREATHWORK (5)
  {
    category: 'breathwork',
    en: {
      name: 'Box Breathing',
      instruction: 'Inhale 4 seconds. Hold 4. Exhale 4. Hold 4. Three full cycles. Focus on making each phase the same length.',
      duration: 90,
      tip: 'If facilitating, count out loud for the first cycle so the group syncs up.',
    },
    es: {
      name: 'Respiracion Cuadrada',
      instruction: 'Inhala 4 segundos. Manten 4. Exhala 4. Manten 4. Tres ciclos completos. Enfocate en que cada fase tenga la misma duracion.',
      duration: 90,
      tip: 'Si estas facilitando, cuenta en voz alta durante el primer ciclo para que el grupo se sincronice.',
    },
  },
  {
    category: 'breathwork',
    en: {
      name: '4-7-8 Breathing',
      instruction: 'Inhale through your nose for 4 seconds. Hold for 7. Exhale through your mouth for 8. Three rounds. The extended exhale is what calms you.',
      duration: 90,
      tip: 'This one works well right before a difficult conversation or observation.',
    },
    es: {
      name: 'Respiracion 4-7-8',
      instruction: 'Inhala por la nariz durante 4 segundos. Manten 7. Exhala por la boca durante 8. Tres rondas. La exhalacion prolongada es lo que te calma.',
      duration: 90,
      tip: 'Esta funciona bien justo antes de una conversacion dificil u observacion.',
    },
  },
  {
    category: 'breathwork',
    en: {
      name: 'Physiological Sigh',
      instruction: 'Two quick inhales through the nose, then one long exhale through the mouth. Five times. This is the fastest known way to calm your nervous system in real time.',
      duration: 60,
      tip: 'Developed by Stanford researchers. Great for mid-meeting resets.',
    },
    es: {
      name: 'Suspiro Fisiologico',
      instruction: 'Dos inhalaciones rapidas por la nariz, luego una exhalacion larga por la boca. Cinco veces. Esta es la forma mas rapida conocida para calmar tu sistema nervioso en tiempo real.',
      duration: 60,
      tip: 'Desarrollado por investigadores de Stanford. Ideal para reinicios a mitad de reunion.',
    },
  },
  {
    category: 'breathwork',
    en: {
      name: 'Belly Breathing',
      instruction: 'Place one hand on your chest, one on your belly. Breathe so only the belly hand moves. Keep your chest still. 60 seconds of slow, deep belly breaths.',
      duration: 60,
      tip: 'If your chest is moving, you are breathing too shallow. Redirect to the belly.',
    },
    es: {
      name: 'Respiracion Abdominal',
      instruction: 'Coloca una mano en tu pecho, otra en tu abdomen. Respira de modo que solo se mueva la mano del abdomen. Manten el pecho quieto. 60 segundos de respiraciones lentas y profundas.',
      duration: 60,
      tip: 'Si tu pecho se mueve, estas respirando muy superficialmente. Redirige al abdomen.',
    },
  },
  {
    category: 'breathwork',
    en: {
      name: 'Counted Exhale',
      instruction: 'Inhale naturally. Exhale and count slowly to 8. Repeat 5 times. The long exhale activates your parasympathetic nervous system.',
      duration: 75,
      tip: 'If 8 feels too long, start at 6 and build up. The length of the exhale matters more than the inhale.',
    },
    es: {
      name: 'Exhalacion Contada',
      instruction: 'Inhala naturalmente. Exhala y cuenta lentamente hasta 8. Repite 5 veces. La exhalacion larga activa tu sistema nervioso parasimpatico.',
      duration: 75,
      tip: 'Si 8 se siente muy largo, comienza en 6 y ve aumentando. La duracion de la exhalacion importa mas que la inhalacion.',
    },
  },

  // MOVEMENT (5)
  {
    category: 'movement',
    en: {
      name: 'Desk Stretch Sequence',
      instruction: 'Roll your neck slowly 3 times each direction. Shrug shoulders to ears, hold 5 seconds, drop. Reach both arms overhead and lean left, then right.',
      duration: 90,
      tip: 'Do this one standing if possible. The shoulder shrug and drop is the key release moment.',
    },
    es: {
      name: 'Secuencia de Estiramiento',
      instruction: 'Gira tu cuello lentamente 3 veces en cada direccion. Sube los hombros a las orejas, manten 5 segundos, suelta. Estira ambos brazos hacia arriba e inclinate a la izquierda, luego a la derecha.',
      duration: 90,
      tip: 'Haz esta de pie si es posible. El encoger y soltar los hombros es el momento clave de liberacion.',
    },
  },
  {
    category: 'movement',
    en: {
      name: 'Standing Reset',
      instruction: 'Stand up. Shake your hands vigorously for 10 seconds. Roll your ankles. Take 3 deep breaths with your feet firmly on the floor.',
      duration: 60,
      tip: 'The hand shaking literally dispels nervous energy. It looks silly and it works.',
    },
    es: {
      name: 'Reinicio de Pie',
      instruction: 'Levantate. Sacude tus manos vigorosamente por 10 segundos. Gira tus tobillos. Toma 3 respiraciones profundas con los pies firmemente en el piso.',
      duration: 60,
      tip: 'Sacudir las manos literalmente disipa la energia nerviosa. Se ve gracioso y funciona.',
    },
  },
  {
    category: 'movement',
    en: {
      name: 'Wall Push',
      instruction: 'Place your palms flat against a wall at shoulder height. Push hard for 10 seconds. Release. Repeat 3 times. The isometric push releases physical tension.',
      duration: 60,
      tip: 'Great for anger or frustration. The physical exertion gives your body somewhere to put the energy.',
    },
    es: {
      name: 'Empuje de Pared',
      instruction: 'Coloca las palmas contra una pared a la altura de los hombros. Empuja fuerte durante 10 segundos. Suelta. Repite 3 veces. El empuje isometrico libera la tension fisica.',
      duration: 60,
      tip: 'Ideal para enojo o frustracion. El esfuerzo fisico le da a tu cuerpo un lugar para poner la energia.',
    },
  },
  {
    category: 'movement',
    en: {
      name: 'Jaw Release',
      instruction: 'Unclench your jaw. Open your mouth wide. Move your jaw left, right, and in circles. Most people hold stress in their jaw without realizing it.',
      duration: 60,
      tip: 'Ask the group: "Were you clenching right now?" Most will say yes. That is the point.',
    },
    es: {
      name: 'Liberacion de Mandibula',
      instruction: 'Destensa tu mandibula. Abre la boca bien grande. Mueve la mandibula a la izquierda, derecha, y en circulos. La mayoria de las personas acumulan estres en la mandibula sin darse cuenta.',
      duration: 60,
      tip: 'Pregunta al grupo: "Estaban apretando la mandibula ahora mismo?" La mayoria dira que si. Ese es el punto.',
    },
  },
  {
    category: 'movement',
    en: {
      name: 'Walking Reset',
      instruction: 'Walk slowly to the end of the hallway and back. Focus on the sensation of each foot hitting the ground. No phone. No talking. Just walking.',
      duration: 120,
      tip: 'This one requires leaving the room. For staff meetings, give everyone 2 minutes to walk and return.',
    },
    es: {
      name: 'Reinicio Caminando',
      instruction: 'Camina lentamente hasta el final del pasillo y regresa. Enfocate en la sensacion de cada pie tocando el piso. Sin telefono. Sin hablar. Solo caminar.',
      duration: 120,
      tip: 'Esta requiere salir del salon. Para reuniones de personal, dale a todos 2 minutos para caminar y regresar.',
    },
  },

  // GRATITUDE (5)
  {
    category: 'gratitude',
    en: {
      name: 'Three Good Things',
      instruction: 'Name three things that went well today. They can be small. Say them out loud or write them down.',
      duration: 60,
      tip: 'In a group, have each person share one. It shifts the energy of the whole room.',
    },
    es: {
      name: 'Tres Cosas Buenas',
      instruction: 'Nombra tres cosas que salieron bien hoy. Pueden ser pequenas. Dilas en voz alta o escribelas.',
      duration: 60,
      tip: 'En grupo, pide que cada persona comparta una. Cambia la energia de todo el salon.',
    },
  },
  {
    category: 'gratitude',
    en: {
      name: 'Micro Thank You',
      instruction: 'Text one person right now and thank them for something specific. Not a generic "thanks." Something real.',
      duration: 60,
      tip: 'The specificity is what makes it meaningful. "Thanks for covering my lunch duty Tuesday" hits different.',
    },
    es: {
      name: 'Micro Agradecimiento',
      instruction: 'Envia un mensaje a una persona ahora mismo y agradecele algo especifico. No un "gracias" generico. Algo real.',
      duration: 60,
      tip: 'La especificidad es lo que lo hace significativo. "Gracias por cubrir mi turno del almuerzo el martes" impacta diferente.',
    },
  },
  {
    category: 'gratitude',
    en: {
      name: 'Student Win',
      instruction: 'Think of one student who surprised you recently. What did they do? Hold that image for 30 seconds.',
      duration: 60,
      tip: 'This one reconnects you to the reason you teach. Use it on the hardest days.',
    },
    es: {
      name: 'Victoria Estudiantil',
      instruction: 'Piensa en un estudiante que te sorprendio recientemente. Que hizo? Manten esa imagen por 30 segundos.',
      duration: 60,
      tip: 'Esta te reconecta con la razon por la que ensenas. Usala en los dias mas dificiles.',
    },
  },
  {
    category: 'gratitude',
    en: {
      name: 'Body Gratitude',
      instruction: 'Thank your body for getting through today. Seriously. Your legs stood for hours. Your voice projected all day. Your hands graded papers. Acknowledge it.',
      duration: 60,
      tip: 'Educators rarely stop to appreciate what their body does for them. This one lands hard.',
    },
    es: {
      name: 'Gratitud Corporal',
      instruction: 'Agradece a tu cuerpo por superar el dia de hoy. En serio. Tus piernas estuvieron de pie por horas. Tu voz proyecto todo el dia. Tus manos calificaron trabajos. Reconocelo.',
      duration: 60,
      tip: 'Los educadores rara vez se detienen a apreciar lo que su cuerpo hace por ellos. Esta impacta fuerte.',
    },
  },
  {
    category: 'gratitude',
    en: {
      name: 'Future Gratitude',
      instruction: 'Think of one thing you are looking forward to this week. Not work. Something for you.',
      duration: 60,
      tip: 'If someone cannot name one thing, that is important information. Encourage them to create one.',
    },
    es: {
      name: 'Gratitud Futura',
      instruction: 'Piensa en una cosa que esperas con entusiasmo esta semana. No trabajo. Algo para ti.',
      duration: 60,
      tip: 'Si alguien no puede nombrar una cosa, esa es informacion importante. Animalos a crear una.',
    },
  },

  // GROUNDING (5)
  {
    category: 'grounding',
    en: {
      name: '5-4-3-2-1 Senses',
      instruction: 'Name 5 things you see. 4 you can touch. 3 you hear. 2 you smell. 1 you taste. Do it slowly.',
      duration: 90,
      tip: 'This is a clinically validated grounding technique. It works because it forces present-moment awareness.',
    },
    es: {
      name: '5-4-3-2-1 Sentidos',
      instruction: 'Nombra 5 cosas que ves. 4 que puedes tocar. 3 que escuchas. 2 que hueles. 1 que saboreas. Hazlo lentamente.',
      duration: 90,
      tip: 'Esta es una tecnica de anclaje clinicamente validada. Funciona porque fuerza la conciencia del momento presente.',
    },
  },
  {
    category: 'grounding',
    en: {
      name: 'Cold Water Reset',
      instruction: 'Run cold water over your wrists for 30 seconds. The temperature change activates your vagus nerve and slows your heart rate.',
      duration: 60,
      tip: 'Not always possible in a group setting. For staff meetings, substitute with holding a cold water bottle.',
    },
    es: {
      name: 'Reinicio con Agua Fria',
      instruction: 'Deja correr agua fria sobre tus munecas por 30 segundos. El cambio de temperatura activa tu nervio vago y desacelera tu ritmo cardiaco.',
      duration: 60,
      tip: 'No siempre es posible en grupo. Para reuniones de personal, sustituye con sostener una botella de agua fria.',
    },
  },
  {
    category: 'grounding',
    en: {
      name: 'Feet on Floor',
      instruction: 'Press your feet flat on the floor. Feel the weight. Push down slightly. Notice the temperature of the floor through your shoes. Stay here for 60 seconds.',
      duration: 60,
      tip: 'This is the most discreet reset. You can do it during a meeting without anyone knowing.',
    },
    es: {
      name: 'Pies en el Piso',
      instruction: 'Presiona tus pies planos en el piso. Siente el peso. Empuja ligeramente hacia abajo. Nota la temperatura del piso a traves de tus zapatos. Quedate aqui por 60 segundos.',
      duration: 60,
      tip: 'Este es el reinicio mas discreto. Puedes hacerlo durante una reunion sin que nadie lo note.',
    },
  },
  {
    category: 'grounding',
    en: {
      name: 'Texture Touch',
      instruction: 'Pick up 3 objects near you. Hold each one for 10 seconds. Notice the weight, temperature, and texture. Name what you feel out loud.',
      duration: 60,
      tip: 'Naming sensations out loud engages a different part of the brain than thinking them. It is more effective.',
    },
    es: {
      name: 'Toque de Texturas',
      instruction: 'Toma 3 objetos cerca de ti. Sostén cada uno por 10 segundos. Nota el peso, la temperatura y la textura. Nombra lo que sientes en voz alta.',
      duration: 60,
      tip: 'Nombrar sensaciones en voz alta activa una parte diferente del cerebro que pensarlas. Es mas efectivo.',
    },
  },
  {
    category: 'grounding',
    en: {
      name: 'Color Scan',
      instruction: 'Pick a color. Scan the room and count every object that is that color. This simple task redirects your brain from stress to observation.',
      duration: 60,
      tip: 'Make it a quick game in groups. "How many blue objects can you find in 30 seconds? Go."',
    },
    es: {
      name: 'Escaneo de Color',
      instruction: 'Elige un color. Escanea el salon y cuenta cada objeto de ese color. Esta tarea simple redirige tu cerebro del estres a la observacion.',
      duration: 60,
      tip: 'Hazlo un juego rapido en grupos. "Cuantos objetos azules pueden encontrar en 30 segundos? Ya."',
    },
  },

  // LAUGH BREAK (5)
  {
    category: 'laugh',
    en: {
      name: 'Worst Lesson Story',
      instruction: 'Think of the worst lesson you ever taught. The one that went completely sideways. Find the humor. If you are with someone, tell them.',
      duration: 90,
      tip: 'Model vulnerability by sharing your own worst lesson first. The room opens up fast.',
    },
    es: {
      name: 'Historia de la Peor Leccion',
      instruction: 'Piensa en la peor leccion que hayas dado. La que salio completamente mal. Encuentra el humor. Si estas con alguien, cuentasela.',
      duration: 90,
      tip: 'Modela vulnerabilidad compartiendo tu propia peor leccion primero. El salon se abre rapido.',
    },
  },
  {
    category: 'laugh',
    en: {
      name: 'Student Quotes Wall',
      instruction: 'What is the funniest thing a student has said to you? If you do not have one saved, you will after today.',
      duration: 60,
      tip: 'Start a shared document where staff can add student quotes throughout the year. It becomes a treasure.',
    },
    es: {
      name: 'Muro de Frases Estudiantiles',
      instruction: 'Cual es la cosa mas graciosa que un estudiante te ha dicho? Si no tienes una guardada, la tendras despues de hoy.',
      duration: 60,
      tip: 'Comienza un documento compartido donde el personal pueda agregar frases de estudiantes durante el ano. Se convierte en un tesoro.',
    },
  },
  {
    category: 'laugh',
    en: {
      name: 'Absurd Prompt',
      instruction: 'If your classroom were a reality TV show, what would it be called? Give it a tagline. If with a group, share.',
      duration: 60,
      tip: 'This works great as a quick table share. Give 30 seconds to think, 30 seconds to share.',
    },
    es: {
      name: 'Pregunta Absurda',
      instruction: 'Si tu salon fuera un reality show, como se llamaria? Dale un eslogan. Si estas en grupo, compartelo.',
      duration: 60,
      tip: 'Esto funciona genial como compartir rapido en mesa. Da 30 segundos para pensar, 30 segundos para compartir.',
    },
  },
  {
    category: 'laugh',
    en: {
      name: 'Fake Award',
      instruction: 'Give yourself an award for something ridiculous you did today. "Best performance while running on 4 hours of sleep." "Most creative excuse for being 2 minutes late to duty."',
      duration: 60,
      tip: 'In a group, have people announce their awards like an Oscar speech. Applause required.',
    },
    es: {
      name: 'Premio Falso',
      instruction: 'Date un premio por algo ridiculo que hiciste hoy. "Mejor actuacion con solo 4 horas de sueno." "Excusa mas creativa por llegar 2 minutos tarde al turno."',
      duration: 60,
      tip: 'En grupo, pide que anuncien sus premios como un discurso de los Oscar. Aplausos obligatorios.',
    },
  },
  {
    category: 'laugh',
    en: {
      name: 'Two Truths and a Lie (Solo Edition)',
      instruction: 'Think of three wild things that happened at school this year. One is made up. Could anyone tell which one?',
      duration: 60,
      tip: 'In education, the truth is almost always stranger than the lie. That is the fun part.',
    },
    es: {
      name: 'Dos Verdades y una Mentira (Edicion Solo)',
      instruction: 'Piensa en tres cosas locas que pasaron en la escuela este ano. Una es inventada. Alguien podria adivinar cual?',
      duration: 60,
      tip: 'En educacion, la verdad casi siempre es mas extrana que la mentira. Esa es la parte divertida.',
    },
  },

  // REFRAME (5)
  {
    category: 'reframe',
    en: {
      name: 'Flip the Narrative',
      instruction: 'Think of the hardest moment from today. Now find one thing that went right inside that hard moment. There is always one.',
      duration: 60,
      tip: 'This is not toxic positivity. It is training your brain to see the full picture, not just the hard part.',
    },
    es: {
      name: 'Voltea la Narrativa',
      instruction: 'Piensa en el momento mas dificil de hoy. Ahora encuentra una cosa que salio bien dentro de ese momento dificil. Siempre hay una.',
      duration: 60,
      tip: 'Esto no es positividad toxica. Es entrenar tu cerebro para ver el panorama completo, no solo la parte dificil.',
    },
  },
  {
    category: 'reframe',
    en: {
      name: 'Zoom Out',
      instruction: 'Will this matter in a week? A month? A year? Most daily stress evaporates when you zoom out far enough.',
      duration: 60,
      tip: 'Do not dismiss real problems. But help distinguish between "this is hard" and "this is catastrophic."',
    },
    es: {
      name: 'Alejate',
      instruction: 'Esto importara en una semana? En un mes? En un ano? La mayoria del estres diario se evapora cuando te alejas lo suficiente.',
      duration: 60,
      tip: 'No descartes problemas reales. Pero ayuda a distinguir entre "esto es dificil" y "esto es catastrofico."',
    },
  },
  {
    category: 'reframe',
    en: {
      name: 'What Would I Tell a Friend',
      instruction: 'If a colleague told you about the exact day you just had, what would you say to them? Now say it to yourself.',
      duration: 60,
      tip: 'We are always kinder to others than we are to ourselves. This activity surfaces that gap.',
    },
    es: {
      name: 'Que le Diria a un Amigo',
      instruction: 'Si un colega te contara sobre el dia exacto que acabas de tener, que le dirias? Ahora ditelo a ti mismo.',
      duration: 60,
      tip: 'Siempre somos mas amables con otros que con nosotros mismos. Esta actividad revela esa brecha.',
    },
  },
  {
    category: 'reframe',
    en: {
      name: 'One Win',
      instruction: 'Name one thing you did well today. Not "okay." Well. Say it without qualifying it.',
      duration: 60,
      tip: 'The "without qualifying it" part is the hardest part for educators. Hold them to it.',
    },
    es: {
      name: 'Una Victoria',
      instruction: 'Nombra una cosa que hiciste bien hoy. No "mas o menos." Bien. Dilo sin minimizarlo.',
      duration: 60,
      tip: 'La parte de "sin minimizarlo" es la mas dificil para los educadores. Mantente firme.',
    },
  },
  {
    category: 'reframe',
    en: {
      name: 'Tomorrow is New',
      instruction: 'Whatever happened today does not carry forward. Tomorrow every student walks in and you get a fresh start. So do you.',
      duration: 60,
      tip: 'This is a good closer for a staff meeting. Let people leave with a clean mental slate.',
    },
    es: {
      name: 'Manana es Nuevo',
      instruction: 'Lo que sea que haya pasado hoy no se lleva al manana. Manana cada estudiante entra y tienes un nuevo comienzo. Tu tambien.',
      duration: 60,
      tip: 'Este es un buen cierre para una reunion de personal. Deja que la gente se vaya con una pizarra mental limpia.',
    },
  },
];

export const RESET_ACTIVITY_COUNT = 30;
