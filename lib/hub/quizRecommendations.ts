// Maps quiz results to Quick Win categories and specific recommendations
// Used on quiz result screens and dashboard to close the loop: quiz → action

export interface QuizRecommendation {
  categories: string[]        // Quick Win categories to surface
  message: string             // personalized reason shown to user
  message_es: string
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
