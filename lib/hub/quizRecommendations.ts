// Maps quiz results to Quick Win categories and specific recommendations
// Used on quiz result screens and dashboard to close the loop: quiz → action

export interface QuizRecommendation {
  categories: string[]        // Quick Win categories to surface
  message: string             // personalized reason shown to user
  message_es: string
}

// Maps QW categories to course-relevant search terms
const CATEGORY_TO_COURSE_KEYWORDS: Record<string, string[]> = {
  'Classroom Tools': ['classroom', 'management', 'teaching', 'instruction'],
  'Stress Relief': ['stress', 'wellbeing', 'burnout', 'self-care', 'mindfulness'],
  'Time Savers': ['productivity', 'efficiency', 'planning', 'time'],
  'Communication': ['communication', 'parent', 'leadership', 'feedback', 'coaching'],
  'Self-Care': ['self-care', 'wellbeing', 'burnout', 'balance', 'wellness'],
  'Games': ['engagement', 'interactive', 'practice'],
}

// Each quiz result maps to relevant Quick Win categories + a reason
export const RESULT_RECOMMENDATIONS: Record<string, Record<string, QuizRecommendation>> = {
  // Classroom Needs quiz
  classroom_needs: {
    engagement_boost: {
      categories: ['Classroom Tools', 'Games'],
      message: 'Based on your Engagement Boost result, these tools can help reignite participation.',
      message_es: 'Basado en tu resultado de Impulso de Participacion, estas herramientas pueden ayudar.',
    },
    calm_and_structure: {
      categories: ['Classroom Tools', 'Time Savers'],
      message: 'Your classroom needs calm and structure. These tools help build routines that stick.',
      message_es: 'Tu salon necesita calma y estructura. Estas herramientas ayudan a construir rutinas.',
    },
    connection_repair: {
      categories: ['Communication', 'Classroom Tools'],
      message: 'Connections need attention. These tools help rebuild trust and community.',
      message_es: 'Las conexiones necesitan atencion. Estas herramientas ayudan a reconstruir la confianza.',
    },
    teacher_survival: {
      categories: ['Self-Care', 'Stress Relief'],
      message: 'You are in survival mode. These are for YOU, not your classroom.',
      message_es: 'Estas en modo supervivencia. Estas son para TI, no para tu salon.',
    },
    fresh_start: {
      categories: ['Classroom Tools', 'Games'],
      message: 'Fresh start energy! These tools can shake up your routine in the best way.',
      message_es: 'Energia de nuevo comienzo! Estas herramientas pueden renovar tu rutina.',
    },
  },

  // Energy Drain quiz
  energy_drain: {
    overcommitted: {
      categories: ['Time Savers', 'Self-Care'],
      message: 'You are overcommitted. These tools help you reclaim time without guilt.',
      message_es: 'Estas sobrecomprometido. Estas herramientas te ayudan a recuperar tiempo.',
    },
    invisible_labor: {
      categories: ['Communication', 'Time Savers'],
      message: 'Your invisible labor deserves tools that make it visible and easier.',
      message_es: 'Tu trabajo invisible merece herramientas que lo hagan visible y mas facil.',
    },
    decision_fatigue: {
      categories: ['Time Savers', 'Classroom Tools'],
      message: 'Decision fatigue is real. These tools automate the small stuff so you can think about the big stuff.',
      message_es: 'La fatiga de decisiones es real. Estas herramientas automatizan lo pequeno.',
    },
    isolation: {
      categories: ['Communication', 'Self-Care'],
      message: 'You are running solo. These tools help you connect and feel less alone in this work.',
      message_es: 'Estas trabajando solo. Estas herramientas te ayudan a conectar.',
    },
    purpose_drift: {
      categories: ['Self-Care', 'Stress Relief'],
      message: 'Reconnecting with your purpose starts here. Small moments of meaning, not big overhauls.',
      message_es: 'Reconectarte con tu proposito empieza aqui.',
    },
  },

  // Career Season quiz
  career_season: {
    spring: {
      categories: ['Classroom Tools', 'Communication'],
      message: 'You are in Spring -- everything is new. These foundational tools will help you build your toolkit.',
      message_es: 'Estas en Primavera -- todo es nuevo. Estas herramientas fundamentales te ayudaran.',
    },
    summer: {
      categories: ['Games', 'Communication'],
      message: 'You are in your prime. These tools help you level up and share what you know.',
      message_es: 'Estas en tu mejor momento. Estas herramientas te ayudan a crecer.',
    },
    autumn: {
      categories: ['Self-Care', 'Communication'],
      message: 'You are in a season of transition. These tools support reflection and new directions.',
      message_es: 'Estas en una temporada de transicion. Estas herramientas apoyan la reflexion.',
    },
    winter: {
      categories: ['Self-Care', 'Stress Relief'],
      message: 'Winter is for rest. These tools are gentle, restorative, and focused on you.',
      message_es: 'El invierno es para descansar. Estas herramientas son suaves y restauradoras.',
    },
  },

  // Superpower quiz
  superpower: {
    calm_force: {
      categories: ['Stress Relief', 'Self-Care'],
      message: 'Your calm is your superpower. These tools help you recharge so you can keep being the steady one.',
      message_es: 'Tu calma es tu superpoder. Estas herramientas te ayudan a recargarte.',
    },
    hype_machine: {
      categories: ['Classroom Tools', 'Games'],
      message: 'You bring the energy! These tools give you fresh ways to keep the room alive.',
      message_es: 'Tu traes la energia! Estas herramientas te dan nuevas formas de mantener el salon vivo.',
    },
    translator: {
      categories: ['Classroom Tools', 'Communication'],
      message: 'You make hard things make sense. These tools help you explain even better.',
      message_es: 'Tu haces que las cosas dificiles tengan sentido. Estas herramientas te ayudan.',
    },
    safe_place: {
      categories: ['Communication', 'Self-Care'],
      message: 'You are the safe place. These tools help you hold space for others while protecting your own.',
      message_es: 'Tu eres el lugar seguro. Estas herramientas te ayudan a cuidar de ti.',
    },
    improviser: {
      categories: ['Classroom Tools', 'Time Savers'],
      message: 'You pivot like a pro. These tools give you more cards to play when plans change.',
      message_es: 'Tu pivoteas como un profesional. Estas herramientas te dan mas opciones.',
    },
  },

  // Communication Style quiz
  communication_style: {
    fixer: {
      categories: ['Communication', 'Time Savers'],
      message: 'You jump to solutions. These tools help you act quickly and effectively.',
      message_es: 'Tu saltas a las soluciones. Estas herramientas te ayudan a actuar rapido.',
    },
    listener: {
      categories: ['Communication', 'Self-Care'],
      message: 'You lead with empathy. These tools support the deep relational work you do.',
      message_es: 'Tu lideras con empatia. Estas herramientas apoyan tu trabajo relacional.',
    },
    redirector: {
      categories: ['Communication', 'Classroom Tools'],
      message: 'You reframe and redirect. These tools give you more ways to shift the energy.',
      message_es: 'Tu reencuadras y redireccionas. Estas herramientas te dan mas opciones.',
    },
    direct: {
      categories: ['Communication', 'Classroom Tools'],
      message: 'You name it clearly. These tools help you deliver with impact and care.',
      message_es: 'Tu lo nombras claramente. Estas herramientas te ayudan a comunicar con impacto.',
    },
  },

  // BTS Readiness quiz
  bts_readiness: {
    ready_to_go: {
      categories: ['Classroom Tools', 'Games'],
      message: 'You are ready! These tools add the finishing touches to an already strong plan.',
      message_es: 'Estas listo! Estas herramientas agregan los toques finales a un plan solido.',
    },
    almost_there: {
      categories: ['Classroom Tools', 'Time Savers'],
      message: 'Almost there. These tools can help you close the gaps before day one.',
      message_es: 'Casi listo. Estas herramientas te ayudan a cerrar las brechas antes del primer dia.',
    },
    building_momentum: {
      categories: ['Classroom Tools', 'Time Savers'],
      message: 'You need plans, not ideas. These tools turn thinking into doing.',
      message_es: 'Necesitas planes, no ideas. Estas herramientas convierten el pensar en hacer.',
    },
    fresh_start: {
      categories: ['Classroom Tools', 'Communication'],
      message: 'Fresh start energy. Focus on relationships first. These tools help.',
      message_es: 'Energia de nuevo comienzo. Enfocate en relaciones primero. Estas herramientas ayudan.',
    },
  },

  // Coaching Stance quiz
  coaching_stance: {
    consultant: {
      categories: ['Communication', 'Classroom Tools'],
      message: 'You lead with expertise. These tools give you more strategies to share.',
      message_es: 'Tu lideras con experiencia. Estas herramientas te dan mas estrategias.',
    },
    collaborator: {
      categories: ['Communication', 'Games'],
      message: 'You co-create solutions. These tools are great to explore with a partner.',
      message_es: 'Tu co-creas soluciones. Estas herramientas son ideales para explorar con un colega.',
    },
    mirror: {
      categories: ['Communication', 'Self-Care'],
      message: 'You reflect what you see. These tools support deep reflection and growth.',
      message_es: 'Tu reflejas lo que ves. Estas herramientas apoyan la reflexion profunda.',
    },
    facilitator: {
      categories: ['Communication', 'Classroom Tools'],
      message: 'You create the conditions. These tools help you design better learning spaces.',
      message_es: 'Tu creas las condiciones. Estas herramientas te ayudan a disenar mejores espacios.',
    },
  },

  // Para Partnership quiz
  para_partnership: {
    thriving: {
      categories: ['Communication', 'Games'],
      message: 'Your partnership is thriving. These tools help you keep growing together.',
      message_es: 'Tu asociacion prospera. Estas herramientas les ayudan a seguir creciendo juntos.',
    },
    growing: {
      categories: ['Communication', 'Classroom Tools'],
      message: 'Your partnership is growing. These tools support better communication and teamwork.',
      message_es: 'Tu asociacion esta creciendo. Estas herramientas apoyan mejor comunicacion.',
    },
    developing: {
      categories: ['Communication', 'Time Savers'],
      message: 'Your partnership needs clarity. These tools help define roles and routines.',
      message_es: 'Tu asociacion necesita claridad. Estas herramientas ayudan a definir roles.',
    },
    needs_reset: {
      categories: ['Communication', 'Self-Care'],
      message: 'Your partnership needs a reset. These tools support honest conversations and fresh starts.',
      message_es: 'Tu asociacion necesita un reinicio. Estas herramientas apoyan conversaciones honestas.',
    },
  },

  // Burnout Warning quiz
  burnout_warning: {
    energized: {
      categories: ['Games', 'Classroom Tools'],
      message: 'You are energized. These tools help you maintain what is working.',
      message_es: 'Estas energizado. Estas herramientas te ayudan a mantener lo que funciona.',
    },
    workload: {
      categories: ['Time Savers', 'Self-Care'],
      message: 'Workload burnout. These tools help you reclaim time and set boundaries.',
      message_es: 'Agotamiento por carga de trabajo. Estas herramientas te ayudan a recuperar tiempo.',
    },
    emotional: {
      categories: ['Self-Care', 'Stress Relief'],
      message: 'Emotional exhaustion. These tools are for you, not your classroom.',
      message_es: 'Agotamiento emocional. Estas herramientas son para ti, no para tu salon.',
    },
    disconnect: {
      categories: ['Self-Care', 'Stress Relief'],
      message: 'Growing disconnect. These tools help you reconnect or reimagine what is next.',
      message_es: 'Desconexion creciente. Estas herramientas te ayudan a reconectar.',
    },
  },

  // Growth Style quiz
  growth_style: {
    deep_diver: {
      categories: ['Classroom Tools'],
      message: 'You go deep. Here are tools worth mastering.',
      message_es: 'Tu vas a profundidad. Aqui hay herramientas que vale la pena dominar.',
    },
    dabbler: {
      categories: ['Games', 'Classroom Tools'],
      message: 'You love trying new things. Here is your next experiment.',
      message_es: 'Te encanta probar cosas nuevas. Aqui esta tu proximo experimento.',
    },
    collaborator: {
      categories: ['Communication', 'Games'],
      message: 'You grow best with others. Try these with a colleague.',
      message_es: 'Tu creces mejor con otros. Prueba estos con un colega.',
    },
    reflector: {
      categories: ['Self-Care', 'Stress Relief'],
      message: 'You learn by reflecting. These tools give you space to think.',
      message_es: 'Tu aprendes reflexionando. Estas herramientas te dan espacio para pensar.',
    },
    self_starter: {
      categories: ['Classroom Tools', 'Time Savers'],
      message: 'You do not wait for PD day. Here is your next move.',
      message_es: 'Tu no esperas el dia de desarrollo profesional. Aqui esta tu proximo paso.',
    },
  },
}

// Get recommendations for a specific quiz result
export function getQuizRecommendations(quizId: string, resultKey: string): QuizRecommendation | null {
  return RESULT_RECOMMENDATIONS[quizId]?.[resultKey] || null
}

// Get all recommendations based on all quiz results a user has
export function getAllRecommendations(quizResults: Record<string, string>): QuizRecommendation[] {
  const recs: QuizRecommendation[] = []
  for (const [quizId, resultKey] of Object.entries(quizResults)) {
    const rec = getQuizRecommendations(quizId, resultKey)
    if (rec) recs.push(rec)
  }
  return recs
}

// Get course keywords for a specific quiz result
export function getCourseKeywords(quizId: string, resultKey: string): string[] {
  const rec = getQuizRecommendations(quizId, resultKey)
  if (!rec) return []
  const keywords = new Set<string>()
  for (const cat of rec.categories) {
    const kws = CATEGORY_TO_COURSE_KEYWORDS[cat]
    if (kws) kws.forEach(k => keywords.add(k))
  }
  return Array.from(keywords)
}

// Get all course keywords across all quiz results
export function getAllCourseKeywords(quizResults: Record<string, string>): string[] {
  const keywords = new Set<string>()
  for (const [quizId, resultKey] of Object.entries(quizResults)) {
    getCourseKeywords(quizId, resultKey).forEach(k => keywords.add(k))
  }
  return Array.from(keywords)
}

// Get top recommended categories across all quiz results
export function getTopCategories(quizResults: Record<string, string>): string[] {
  const categoryCounts: Record<string, number> = {}
  const recs = getAllRecommendations(quizResults)
  for (const rec of recs) {
    for (const cat of rec.categories) {
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1
    }
  }
  return Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([cat]) => cat)
}
