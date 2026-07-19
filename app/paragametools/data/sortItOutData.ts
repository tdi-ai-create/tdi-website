// Sort It Out -- Drag items into the correct category bucket

export interface SortBucket {
  id: string
  label: { en: string; es: string }
  description: { en: string; es: string }
  color: string
}

export interface SortItem {
  text: { en: string; es: string }
  correctBucket: string
  explanation: { en: string; es: string }
}

export interface SortSet {
  id: string
  title: { en: string; es: string }
  instruction: { en: string; es: string }
  buckets: SortBucket[]
  items: SortItem[]
  research: { en: string; es: string }
}

export const SORT_SETS: SortSet[] = [
  {
    id: 'sort-feedback-praise',
    title: { en: 'Feedback or Praise?', es: 'Retroalimentacion o Elogio?' },
    instruction: { en: 'Drag each statement into the correct bucket', es: 'Arrastra cada frase al cubo correcto' },
    buckets: [
      { id: 'feedback', label: { en: 'Feedback', es: 'Retroalimentacion' }, description: { en: 'Actionable, specific, teaches', es: 'Accionable, especifica, ensena' }, color: '#27AE60' },
      { id: 'praise', label: { en: 'Praise', es: 'Elogio' }, description: { en: 'Feels good but teaches nothing', es: 'Se siente bien pero no ensena nada' }, color: '#E74C3C' },
    ],
    items: [
      { text: { en: 'Good job!', es: 'Buen trabajo!' }, correctBucket: 'praise', explanation: { en: 'No specifics. Student cannot replicate what they did.', es: 'Sin detalles. El estudiante no puede replicar lo que hizo.' } },
      { text: { en: 'I notice you used three details about the setting. That is descriptive writing. Now try adding what the character hears.', es: 'Noto que usaste tres detalles sobre el escenario. Eso es escritura descriptiva. Ahora intenta agregar lo que el personaje escucha.' }, correctBucket: 'feedback', explanation: { en: 'Notice + Name + Next Step. All three parts.', es: 'Observar + Nombrar + Siguiente Paso. Las tres partes.' } },
      { text: { en: 'You are so smart!', es: 'Eres tan inteligente!' }, correctBucket: 'praise', explanation: { en: 'Labels the person, not the behavior. Fixed mindset.', es: 'Etiqueta a la persona, no al comportamiento. Mentalidad fija.' } },
      { text: { en: 'Your handwriting is improving. Keep it up!', es: 'Tu letra esta mejorando. Sigue asi!' }, correctBucket: 'praise', explanation: { en: 'Mentions skill but gives no specific example or next step.', es: 'Menciona la habilidad pero no da ejemplo especifico ni siguiente paso.' } },
      { text: { en: 'I see you lined up the decimal points. That is called alignment. Now explain to your partner why it matters.', es: 'Veo que alineaste los puntos decimales. Eso se llama alineacion. Ahora explica a tu companero por que importa.' }, correctBucket: 'feedback', explanation: { en: 'Specific + Named + Actionable + Extension.', es: 'Especifico + Nombrado + Accionable + Extension.' } },
      { text: { en: 'Nice work today!', es: 'Buen trabajo hoy!' }, correctBucket: 'praise', explanation: { en: 'Which work? What was nice about it?', es: 'Cual trabajo? Que tuvo de bueno?' } },
      { text: { en: 'You broke this problem into two steps. That is decomposing. Can you explain why you split it there?', es: 'Dividiste este problema en dos pasos. Eso es descomponer. Puedes explicar por que lo dividiste ahi?' }, correctBucket: 'feedback', explanation: { en: 'All three parts plus metacognitive extension.', es: 'Las tres partes mas extension metacognitiva.' } },
      { text: { en: 'Almost there!', es: 'Casi lo logras!' }, correctBucket: 'praise', explanation: { en: 'Almost where? No path forward.', es: 'Casi donde? Sin camino adelante.' } },
      { text: { en: 'I notice you asked a clarifying question before starting. That is active listening. How did that change your approach?', es: 'Noto que hiciste una pregunta aclaratoria antes de empezar. Eso es escucha activa. Como cambio eso tu enfoque?' }, correctBucket: 'feedback', explanation: { en: 'Notice + Name + Reflection prompt.', es: 'Observar + Nombrar + Pregunta de reflexion.' } },
      { text: { en: 'Love it!', es: 'Me encanta!' }, correctBucket: 'praise', explanation: { en: 'Teaches nothing. Cannot be repeated.', es: 'No ensena nada. No puede repetirse.' } },
    ],
    research: { en: 'Hattie and Timperley\'s research on feedback shows that task-level feedback (specific, actionable) has an effect size of 0.73, while praise has an effect size near zero. The difference between "Good job" and "I notice you used evidence" is the difference between feeling good and actually learning.', es: 'La investigacion de Hattie y Timperley sobre retroalimentacion muestra que la retroalimentacion a nivel de tarea (especifica, accionable) tiene un tamano de efecto de 0.73, mientras que el elogio tiene un efecto cercano a cero.' },
  },
  {
    id: 'sort-proactive-reactive',
    title: { en: 'Proactive or Reactive?', es: 'Proactivo o Reactivo?' },
    instruction: { en: 'Is this preventing problems or responding to them?', es: 'Esto previene problemas o responde a ellos?' },
    buckets: [
      { id: 'proactive', label: { en: 'Proactive', es: 'Proactivo' }, description: { en: 'Prevents problems before they happen', es: 'Previene problemas antes de que sucedan' }, color: '#27AE60' },
      { id: 'reactive', label: { en: 'Reactive', es: 'Reactivo' }, description: { en: 'Responds after a problem occurs', es: 'Responde despues de que ocurre un problema' }, color: '#E74C3C' },
    ],
    items: [
      { text: { en: 'Greeting students at the door by name', es: 'Recibir a los estudiantes en la puerta por su nombre' }, correctBucket: 'proactive', explanation: { en: 'Sets tone, builds connection before class starts.', es: 'Establece el tono, construye conexion antes de que empiece la clase.' } },
      { text: { en: 'Sending a student to the office after a blow-up', es: 'Enviar a un estudiante a la oficina despues de una explosion' }, correctBucket: 'reactive', explanation: { en: 'Responding to a crisis that already happened.', es: 'Respondiendo a una crisis que ya sucedio.' } },
      { text: { en: 'Teaching and practicing routines the first two weeks', es: 'Ensenar y practicar rutinas las primeras dos semanas' }, correctBucket: 'proactive', explanation: { en: 'Investment now saves hundreds of redirections later.', es: 'La inversion ahora ahorra cientos de redirecciones despues.' } },
      { text: { en: 'Taking away recess for not finishing work', es: 'Quitar el recreo por no terminar el trabajo' }, correctBucket: 'reactive', explanation: { en: 'Punishing after the fact instead of preventing the problem.', es: 'Castigar despues del hecho en lugar de prevenir el problema.' } },
      { text: { en: 'Strategic seating chart based on student needs', es: 'Diagrama de asientos estrategico basado en necesidades' }, correctBucket: 'proactive', explanation: { en: 'Prevents conflicts and distractions before they start.', es: 'Previene conflictos y distracciones antes de que empiecen.' } },
      { text: { en: 'Calling a parent after a bad day', es: 'Llamar a un padre despues de un mal dia' }, correctBucket: 'reactive', explanation: { en: 'Important but responding to something that already happened.', es: 'Importante pero respondiendo a algo que ya paso.' } },
      { text: { en: 'Posted visual schedule students can reference', es: 'Horario visual publicado que los estudiantes pueden consultar' }, correctBucket: 'proactive', explanation: { en: 'Reduces "what are we doing?" questions before they happen.', es: 'Reduce las preguntas de "que estamos haciendo?" antes de que sucedan.' } },
      { text: { en: 'Raising your voice to get the room quiet', es: 'Levantar la voz para que el salon se calle' }, correctBucket: 'reactive', explanation: { en: 'Responding to noise instead of having a system for transitions.', es: 'Respondiendo al ruido en lugar de tener un sistema para transiciones.' } },
      { text: { en: 'Establishing a calm-down corner with tools', es: 'Establecer un rincon de calma con herramientas' }, correctBucket: 'proactive', explanation: { en: 'System in place before dysregulation happens.', es: 'Sistema en su lugar antes de que ocurra la desregulacion.' } },
      { text: { en: 'Writing a behavior referral', es: 'Escribir un reporte de comportamiento' }, correctBucket: 'reactive', explanation: { en: 'Documentation of something that already occurred.', es: 'Documentacion de algo que ya ocurrio.' } },
    ],
    research: { en: 'Research on Positive Behavioral Interventions and Supports (PBIS) shows that schools implementing proactive strategies see a 20-60% reduction in office discipline referrals. The ratio should be 4:1 proactive to reactive.', es: 'La investigacion sobre PBIS muestra que las escuelas que implementan estrategias proactivas ven una reduccion del 20-60% en reportes disciplinarios.' },
  },
  {
    id: 'sort-accommodation-modification',
    title: { en: 'Accommodation or Modification?', es: 'Acomodacion o Modificacion?' },
    instruction: { en: 'Same content with different access, or different content entirely?', es: 'Mismo contenido con acceso diferente, o contenido completamente diferente?' },
    buckets: [
      { id: 'accommodation', label: { en: 'Accommodation', es: 'Acomodacion' }, description: { en: 'Same content, different access', es: 'Mismo contenido, acceso diferente' }, color: '#3498DB' },
      { id: 'modification', label: { en: 'Modification', es: 'Modificacion' }, description: { en: 'Different content or expectations', es: 'Contenido o expectativas diferentes' }, color: '#9333EA' },
    ],
    items: [
      { text: { en: 'Extended time on a test', es: 'Tiempo extendido en un examen' }, correctBucket: 'accommodation', explanation: { en: 'Same test, more time to access it.', es: 'Mismo examen, mas tiempo para acceder a el.' } },
      { text: { en: 'Fewer questions on a test', es: 'Menos preguntas en un examen' }, correctBucket: 'modification', explanation: { en: 'Different assessment, reduced content expectations.', es: 'Evaluacion diferente, expectativas de contenido reducidas.' } },
      { text: { en: 'Text-to-speech software for reading', es: 'Software de texto a voz para lectura' }, correctBucket: 'accommodation', explanation: { en: 'Same content, different way to access it.', es: 'Mismo contenido, diferente forma de acceder.' } },
      { text: { en: 'Alternative assignment on a different topic', es: 'Tarea alternativa sobre un tema diferente' }, correctBucket: 'modification', explanation: { en: 'Entirely different content and expectations.', es: 'Contenido y expectativas completamente diferentes.' } },
      { text: { en: 'Preferential seating near the teacher', es: 'Asiento preferencial cerca del maestro' }, correctBucket: 'accommodation', explanation: { en: 'Same lesson, better position to access it.', es: 'Misma leccion, mejor posicion para acceder.' } },
      { text: { en: 'Simplified vocabulary in word problems', es: 'Vocabulario simplificado en problemas escritos' }, correctBucket: 'modification', explanation: { en: 'Changed the content itself to reduce language demand.', es: 'Cambio el contenido para reducir la demanda de lenguaje.' } },
      { text: { en: 'Graphic organizer for essay writing', es: 'Organizador grafico para escritura de ensayos' }, correctBucket: 'accommodation', explanation: { en: 'Same writing task, structured support to access it.', es: 'Misma tarea de escritura, apoyo estructurado para acceder.' } },
      { text: { en: 'Grade-level reading replaced with below-grade text', es: 'Lectura de nivel reemplazada con texto de nivel inferior' }, correctBucket: 'modification', explanation: { en: 'Different content level entirely.', es: 'Nivel de contenido completamente diferente.' } },
      { text: { en: 'Frequent check-ins during independent work', es: 'Revisiones frecuentes durante trabajo independiente' }, correctBucket: 'accommodation', explanation: { en: 'Same work, additional support to stay on track.', es: 'Mismo trabajo, apoyo adicional para mantenerse en curso.' } },
      { text: { en: 'Pass/fail grading instead of letter grade', es: 'Calificacion aprobado/reprobado en lugar de letra' }, correctBucket: 'modification', explanation: { en: 'Different evaluation criteria.', es: 'Criterios de evaluacion diferentes.' } },
    ],
    research: { en: 'Understanding the difference between accommodations and modifications is critical for IEP implementation. Accommodations provide access without changing expectations. Modifications change what the student is expected to learn. Both are valid but serve different purposes under IDEA.', es: 'Entender la diferencia entre acomodaciones y modificaciones es critico para la implementacion del IEP. Las acomodaciones proveen acceso sin cambiar expectativas. Las modificaciones cambian lo que se espera que el estudiante aprenda.' },
  },
  {
    id: 'sort-growth-fixed',
    title: { en: 'Growth or Fixed Mindset?', es: 'Mentalidad de Crecimiento o Fija?' },
    instruction: { en: 'Would Carol Dweck call this growth or fixed?', es: 'Carol Dweck llamaria a esto crecimiento o fijo?' },
    buckets: [
      { id: 'growth', label: { en: 'Growth', es: 'Crecimiento' }, description: { en: 'Ability grows through effort', es: 'La habilidad crece con esfuerzo' }, color: '#27AE60' },
      { id: 'fixed', label: { en: 'Fixed', es: 'Fija' }, description: { en: 'Ability is innate and unchangeable', es: 'La habilidad es innata e inmutable' }, color: '#E74C3C' },
    ],
    items: [
      { text: { en: 'You worked really hard on this.', es: 'Trabajaste muy duro en esto.' }, correctBucket: 'growth', explanation: { en: 'Praises effort, not innate ability.', es: 'Elogia el esfuerzo, no la habilidad innata.' } },
      { text: { en: 'You are a natural at math.', es: 'Eres un natural en matematicas.' }, correctBucket: 'fixed', explanation: { en: 'Implies ability is innate, not developed.', es: 'Implica que la habilidad es innata, no desarrollada.' } },
      { text: { en: 'What strategy did you use?', es: 'Que estrategia usaste?' }, correctBucket: 'growth', explanation: { en: 'Focuses on process, not outcome.', es: 'Se enfoca en el proceso, no en el resultado.' } },
      { text: { en: 'Some kids just get it and some do not.', es: 'Algunos ninos simplemente lo entienden y otros no.' }, correctBucket: 'fixed', explanation: { en: 'Implies ability is unchangeable.', es: 'Implica que la habilidad es inmutable.' } },
      { text: { en: 'This is challenging, but you are building the skill.', es: 'Esto es desafiante, pero estas construyendo la habilidad.' }, correctBucket: 'growth', explanation: { en: 'Normalizes struggle as part of learning.', es: 'Normaliza la lucha como parte del aprendizaje.' } },
      { text: { en: 'You are not a math person.', es: 'No eres una persona de matematicas.' }, correctBucket: 'fixed', explanation: { en: 'Labels the person as incapable.', es: 'Etiqueta a la persona como incapaz.' } },
      { text: { en: 'Your brain is growing every time you practice.', es: 'Tu cerebro crece cada vez que practicas.' }, correctBucket: 'growth', explanation: { en: 'Frames effort as building capacity.', es: 'Enmarca el esfuerzo como construccion de capacidad.' } },
      { text: { en: 'If you do not get it by now, you probably never will.', es: 'Si no lo entiendes ahora, probablemente nunca lo haras.' }, correctBucket: 'fixed', explanation: { en: 'Declares a ceiling on learning.', es: 'Declara un limite al aprendizaje.' } },
      { text: { en: 'What would you do differently next time?', es: 'Que harias diferente la proxima vez?' }, correctBucket: 'growth', explanation: { en: 'Assumes improvement is possible.', es: 'Asume que la mejora es posible.' } },
      { text: { en: 'You either have it or you do not.', es: 'Lo tienes o no lo tienes.' }, correctBucket: 'fixed', explanation: { en: 'Binary thinking about ability.', es: 'Pensamiento binario sobre la habilidad.' } },
    ],
    research: { en: 'Carol Dweck\'s research at Stanford shows that students praised for effort outperform students praised for intelligence by 30% on subsequent challenges. The language educators use shapes whether students see their abilities as fixed or growable.', es: 'La investigacion de Carol Dweck en Stanford muestra que los estudiantes elogiados por su esfuerzo superan a los elogiados por su inteligencia en un 30% en desafios posteriores.' },
  },
  {
    id: 'sort-para-responsibilities',
    title: { en: 'Your Job or Not? (Para Edition)', es: 'Tu Trabajo o No? (Edicion Para)' },
    instruction: { en: 'As a paraprofessional, is this your responsibility?', es: 'Como paraprofesional, es esto tu responsabilidad?' },
    buckets: [
      { id: 'para', label: { en: 'Para Job', es: 'Trabajo del Para' }, description: { en: 'Your core responsibility', es: 'Tu responsabilidad principal' }, color: '#2563EB' },
      { id: 'teacher', label: { en: 'Teacher Job', es: 'Trabajo del Maestro' }, description: { en: 'Teacher responsibility', es: 'Responsabilidad del maestro' }, color: '#9333EA' },
      { id: 'shared', label: { en: 'Shared', es: 'Compartido' }, description: { en: 'Both contribute', es: 'Ambos contribuyen' }, color: '#E8B84B' },
    ],
    items: [
      { text: { en: 'Writing lesson plans', es: 'Escribir planes de leccion' }, correctBucket: 'teacher', explanation: { en: 'Paras support instruction, they do not design it.', es: 'Los paras apoyan la instruccion, no la disenan.' } },
      { text: { en: 'Reinforcing a skill with a small group', es: 'Reforzar una habilidad con un grupo pequeno' }, correctBucket: 'para', explanation: { en: 'Core para function: targeted support.', es: 'Funcion central del para: apoyo dirigido.' } },
      { text: { en: 'Deciding a student\'s grade', es: 'Decidir la calificacion de un estudiante' }, correctBucket: 'teacher', explanation: { en: 'Grading is a teacher responsibility.', es: 'Calificar es responsabilidad del maestro.' } },
      { text: { en: 'Collecting data on student behavior', es: 'Recopilar datos sobre el comportamiento del estudiante' }, correctBucket: 'shared', explanation: { en: 'Both observe, but the teacher interprets and decides.', es: 'Ambos observan, pero el maestro interpreta y decide.' } },
      { text: { en: 'Communicating with parents about academics', es: 'Comunicarse con padres sobre temas academicos' }, correctBucket: 'teacher', explanation: { en: 'Teacher owns the parent relationship for academic content.', es: 'El maestro maneja la relacion con los padres para contenido academico.' } },
      { text: { en: 'Helping a student with daily living skills', es: 'Ayudar a un estudiante con habilidades de la vida diaria' }, correctBucket: 'para', explanation: { en: 'Direct student support is core para work.', es: 'El apoyo directo al estudiante es trabajo central del para.' } },
      { text: { en: 'Modifying materials for a student with an IEP', es: 'Modificar materiales para un estudiante con IEP' }, correctBucket: 'shared', explanation: { en: 'Teacher decides the modification, para may help create it.', es: 'El maestro decide la modificacion, el para puede ayudar a crearla.' } },
      { text: { en: 'Attending IEP meetings', es: 'Asistir a reuniones de IEP' }, correctBucket: 'shared', explanation: { en: 'Both perspectives are valuable. Para provides daily observation data.', es: 'Ambas perspectivas son valiosas. El para provee datos de observacion diaria.' } },
      { text: { en: 'Managing classroom behavior for the whole class', es: 'Manejar el comportamiento del salon completo' }, correctBucket: 'teacher', explanation: { en: 'Whole-class management is the teacher\'s responsibility.', es: 'El manejo de toda la clase es responsabilidad del maestro.' } },
      { text: { en: 'Redirecting a student during independent work', es: 'Redirigir a un estudiante durante trabajo independiente' }, correctBucket: 'para', explanation: { en: 'In-the-moment support during instruction.', es: 'Apoyo en el momento durante la instruccion.' } },
    ],
    research: { en: 'Research on paraprofessional roles (Giangreco) shows that clearly defined responsibilities lead to better student outcomes and lower para burnout. The most common source of frustration is ambiguity about what falls in their lane vs the teacher\'s.', es: 'La investigacion sobre roles de paraprofesionales (Giangreco) muestra que responsabilidades claramente definidas llevan a mejores resultados estudiantiles y menor agotamiento del para.' },
  },
]

export const SORT_SET_COUNT = 5
