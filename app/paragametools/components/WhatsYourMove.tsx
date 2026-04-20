'use client';

import { useState } from 'react';
import { ArrowLeft, Check, X, ExternalLink } from 'lucide-react';
import { COLORS } from '../data/gameConfig';
import { useLanguage } from '../context/LanguageContext';
import { SCENARIOS, SCENARIO_COUNT } from '../data/whatsYourMove';
import { GameWrapper } from './GameWrapper';
import { ConfettiBurst } from './ConfettiBurst';

// ── Toggle: set to false to hide survey for general community use ──
const SURVEY_ACTIVE = true;

type Screen = 'intro' | 'play' | 'results';

const TEAL = COLORS.teal;
const LETTERS = ['A', 'B', 'C'] as const;

// ─── Survey types ───
interface SurveyResponse {
  timestamp: string;
  language: 'en' | 'es';
  quizScore: number;
  confidence: number | null;
  implementation: string | null;
  valued: number | null;
  impact: string | null;
  retention: number | null;
  continuePD: string | null;
  openText: string;
}

// ─── Main component ───
export function WhatsYourMove({ onBack }: { onBack: () => void }) {
  const { language } = useLanguage();
  const [screen, setScreen] = useState<Screen>('intro');
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);

  const scenario = SCENARIOS[current];
  const data = scenario[language];
  const isLast = current === SCENARIO_COUNT - 1;

  const handleSelect = (idx: number) => {
    if (selected !== null) return; // locked
    setSelected(idx);
    if (data.choices[idx].correct) setScore((s) => s + 1);
  };

  const handleNext = () => {
    if (isLast) {
      setScreen('results');
    } else {
      setCurrent((c) => c + 1);
      setSelected(null);
    }
  };

  const handlePlayAgain = () => {
    setCurrent(0);
    setSelected(null);
    setScore(0);
    setScreen('intro');
  };

  const gameTitle = language === 'es' ? '¿Cuál Es Tu Movimiento?' : "What's Your Move?";

  return (
    <GameWrapper gameId="whatsyourmove" title={gameTitle} color="teal" onBack={onBack}>
      {screen === 'intro' && (
        <IntroScreen onStart={() => setScreen('play')} language={language} />
      )}
      {screen === 'play' && (
        <PlayScreen
          language={language}
          current={current}
          data={data}
          selected={selected}
          onSelect={handleSelect}
          onNext={handleNext}
          isLast={isLast}
        />
      )}
      {screen === 'results' && (
        <ResultsScreen
          language={language}
          score={score}
          onPlayAgain={handlePlayAgain}
          onBack={onBack}
        />
      )}
    </GameWrapper>
  );
}

// ─── Intro Screen ───
function IntroScreen({ onStart, language }: { onStart: () => void; language: 'en' | 'es' }) {
  const rules =
    language === 'es'
      ? [
          'Lee cada escenario del salón de clases.',
          'Elige la mejor respuesta de tres opciones.',
          'Recibe retroalimentación instantánea sobre tu elección.',
        ]
      : [
          'Read each classroom scenario.',
          'Choose the best response from three options.',
          'Get instant feedback on your choice.',
        ];

  return (
    <div className="flex flex-col items-center text-center animate-fade-in">
      <div
        className="w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center mb-4"
        style={{ backgroundColor: TEAL.bg, border: `2px solid ${TEAL.accent}` }}
      >
        <span className="text-5xl">🎯</span>
      </div>
      <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
        {language === 'es' ? '¿Cuál Es Tu Movimiento?' : "What's Your Move?"}
      </h2>

      <div
        className="w-full max-w-lg rounded-xl p-6 mb-6"
        style={{ backgroundColor: TEAL.bg, border: `1px solid ${TEAL.border}` }}
      >
        <ul className="space-y-3 text-left">
          {rules.map((rule, i) => (
            <li key={i} className="flex items-start gap-3 text-white">
              <span style={{ color: TEAL.accent }}>•</span>
              <span>{rule}</span>
            </li>
          ))}
        </ul>
      </div>

      <button
        onClick={onStart}
        className="px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 active:scale-95 animate-glow-pulse"
        style={{
          backgroundColor: TEAL.accent,
          color: '#ffffff',
          ['--glow-color' as string]: TEAL.accent + '40',
        }}
      >
        {language === 'es' ? '¡Vamos! →' : "Let's Go →"}
      </button>
    </div>
  );
}

// ─── Play Screen ───
function PlayScreen({
  language,
  current,
  data,
  selected,
  onSelect,
  onNext,
  isLast,
}: {
  language: 'en' | 'es';
  current: number;
  data: { scenario: string; choices: { text: string; correct: boolean }[]; move: string; explanation: string };
  selected: number | null;
  onSelect: (idx: number) => void;
  onNext: () => void;
  isLast: boolean;
}) {
  return (
    <div className="animate-fade-in">
      {/* Progress pips */}
      <div className="flex items-center justify-center gap-2 mb-4">
        {Array.from({ length: SCENARIO_COUNT }).map((_, i) => (
          <div
            key={i}
            className="w-3 h-3 rounded-full transition-all duration-300"
            style={{
              backgroundColor: i <= current ? TEAL.accent : 'rgba(255,255,255,0.15)',
            }}
          />
        ))}
      </div>

      {/* Counter */}
      <p className="text-center text-sm mb-6" style={{ color: '#8899aa' }}>
        {language === 'es' ? `Escenario ${current + 1} de ${SCENARIO_COUNT}` : `Scenario ${current + 1} of ${SCENARIO_COUNT}`}
      </p>

      {/* Scenario card */}
      <div
        className="rounded-xl p-6 mb-6"
        style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: `1px solid rgba(255,255,255,0.1)` }}
      >
        <p className="text-white text-base md:text-lg leading-relaxed">{data.scenario}</p>
      </div>

      {/* Choices */}
      <div className="flex flex-col gap-3 mb-6">
        {data.choices.map((choice, idx) => {
          const isSelected = selected === idx;
          const isCorrect = choice.correct;
          const isRevealed = selected !== null;

          let bg = 'rgba(255,255,255,0.06)';
          let border = 'rgba(255,255,255,0.15)';
          let opacity = 1;

          if (isRevealed) {
            if (isCorrect) {
              bg = 'rgba(39, 174, 96, 0.2)';
              border = '#27AE60';
            } else if (isSelected && !isCorrect) {
              bg = 'rgba(231, 76, 60, 0.2)';
              border = '#E74C3C';
            } else {
              opacity = 0.4;
            }
          }

          return (
            <button
              key={idx}
              onClick={() => onSelect(idx)}
              disabled={isRevealed}
              className="w-full text-left rounded-xl p-4 transition-all duration-200 flex items-start gap-3"
              style={{
                backgroundColor: bg,
                border: `2px solid ${border}`,
                opacity,
                cursor: isRevealed ? 'default' : 'pointer',
              }}
            >
              <span
                className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
                style={{
                  backgroundColor: isRevealed && isCorrect ? '#27AE60' : isRevealed && isSelected ? '#E74C3C' : TEAL.accent,
                  color: '#fff',
                }}
              >
                {isRevealed && isCorrect ? <Check size={16} /> : isRevealed && isSelected ? <X size={16} /> : LETTERS[idx]}
              </span>
              <span className="text-white text-base">{choice.text}</span>
            </button>
          );
        })}
      </div>

      {/* Feedback panel */}
      {selected !== null && (
        <div className="animate-reveal-bounce mb-6">
          <div
            className="rounded-xl p-6"
            style={{
              backgroundColor: data.choices[selected].correct ? 'rgba(39, 174, 96, 0.12)' : 'rgba(231, 76, 60, 0.12)',
              border: `1px solid ${data.choices[selected].correct ? 'rgba(39, 174, 96, 0.4)' : 'rgba(231, 76, 60, 0.4)'}`,
            }}
          >
            <p
              className="font-bold text-lg mb-1"
              style={{ color: data.choices[selected].correct ? '#27AE60' : '#E74C3C' }}
            >
              {data.choices[selected].correct
                ? language === 'es' ? '✓ ¡Correcto!' : '✓ Correct!'
                : language === 'es' ? '✗ No exactamente' : '✗ Not quite'}
            </p>
            <p className="text-sm font-semibold mb-2" style={{ color: TEAL.accent }}>
              {language === 'es' ? 'El movimiento: ' : 'The move: '}
              {data.move}
            </p>
            <p className="text-white text-base leading-relaxed">{data.explanation}</p>
          </div>
        </div>
      )}

      {/* Next button */}
      {selected !== null && (
        <div className="flex justify-center">
          <button
            onClick={onNext}
            className="px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 active:scale-95"
            style={{ backgroundColor: TEAL.accent, color: '#ffffff' }}
          >
            {isLast
              ? language === 'es' ? 'Ver Resultados' : 'See Results'
              : language === 'es' ? 'Siguiente Escenario →' : 'Next Scenario →'}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Results Screen ───
function ResultsScreen({
  language,
  score,
  onPlayAgain,
  onBack,
}: {
  language: 'en' | 'es';
  score: number;
  onPlayAgain: () => void;
  onBack: () => void;
}) {
  const confettiColors = [TEAL.accent, '#FFD700', '#FFFFFF'];

  const { title, message } = getScoreContent(score, language);

  return (
    <div className="flex flex-col items-center text-center">
      {score >= 4 && <ConfettiBurst colors={confettiColors} particleCount={60} />}

      {/* Score ring */}
      <div
        className="w-28 h-28 md:w-32 md:h-32 rounded-full flex flex-col items-center justify-center mb-6 animate-scale-in"
        style={{ backgroundColor: TEAL.bg, border: `3px solid ${TEAL.accent}` }}
      >
        <span className="text-4xl md:text-5xl font-black text-white">{score}</span>
        <span className="text-sm" style={{ color: TEAL.accent }}>
          {language === 'es' ? `de ${SCENARIO_COUNT}` : `of ${SCENARIO_COUNT}`}
        </span>
      </div>

      <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">{title}</h2>
      <p className="text-lg text-white mb-8 max-w-lg leading-relaxed">{message}</p>

      {/* Chat prompt card */}
      <div
        className="w-full max-w-lg rounded-xl p-5 mb-6"
        style={{ backgroundColor: 'rgba(241, 196, 15, 0.1)', border: '1px solid rgba(241, 196, 15, 0.4)' }}
      >
        <p className="text-white text-base">
          {language === 'es'
            ? '¿En una sesión en vivo? Comparte tu puntaje en el chat para que tu facilitador/a pueda ver cómo le fue al grupo.'
            : 'In a live session? Drop your score in the chat so your facilitator can see how the group did.'}
        </p>
      </div>

      {/* Survey */}
      {SURVEY_ACTIVE && <Survey language={language} score={score} />}

      {/* Resource links */}
      <div className="w-full max-w-lg flex flex-col gap-3 mb-8">
        <a
          href="https://teachersdeserveit.com/paragametools"
          className="flex items-center justify-center gap-2 rounded-xl py-3 px-6 font-medium transition-all hover:brightness-110"
          style={{ backgroundColor: TEAL.bg, border: `1px solid ${TEAL.border}`, color: TEAL.accent }}
        >
          <ExternalLink size={16} />
          {language === 'es' ? 'Más Juegos de Práctica' : 'More Practice Games'}
        </a>
        <a
          href="https://tdi.thinkific.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 rounded-xl py-3 px-6 font-medium transition-all hover:brightness-110"
          style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', color: '#8899aa' }}
        >
          <ExternalLink size={16} />
          {language === 'es' ? 'Centro de Aprendizaje' : 'Learning Hub'}
        </a>
      </div>

      {/* Play again */}
      <button
        onClick={onPlayAgain}
        className="px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 active:scale-95 mb-4"
        style={{ backgroundColor: TEAL.accent, color: '#ffffff' }}
      >
        {language === 'es' ? 'Jugar de Nuevo' : 'Play Again'}
      </button>

      <button
        onClick={onBack}
        className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all hover:scale-105 active:scale-95"
        style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: '#ffffff' }}
      >
        <ArrowLeft size={18} />
        {language === 'es' ? 'Volver a Juegos' : 'Back to Games'}
      </button>
    </div>
  );
}

// ─── Survey ───
function Survey({ language, score }: { language: 'en' | 'es'; score: number }) {
  const [confidence, setConfidence] = useState<number | null>(null);
  const [implementation, setImplementation] = useState<string | null>(null);
  const [valued, setValued] = useState<number | null>(null);
  const [impact, setImpact] = useState<string | null>(null);
  const [retention, setRetention] = useState<number | null>(null);
  const [continuePD, setContinuePD] = useState<string | null>(null);
  const [openText, setOpenText] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    const response: SurveyResponse = {
      timestamp: new Date().toISOString(),
      language,
      quizScore: score,
      confidence,
      implementation,
      valued,
      impact,
      retention,
      continuePD,
      openText,
    };

    console.log('=== TDI SURVEY RESPONSE ===', JSON.stringify(response, null, 2));

    // Persist to localStorage as fallback
    try {
      const existing = JSON.parse(localStorage.getItem('tdi_quiz_surveys') || '[]');
      existing.push(response);
      localStorage.setItem('tdi_quiz_surveys', JSON.stringify(existing));
    } catch {
      // localStorage may be unavailable
    }

    // Insert into Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (supabaseUrl && supabaseKey) {
      fetch(`${supabaseUrl}/rest/v1/quiz_surveys`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({
          timestamp: response.timestamp,
          language: response.language,
          quiz_score: response.quizScore,
          confidence: response.confidence,
          implementation: response.implementation,
          valued: response.valued,
          impact: response.impact,
          retention: response.retention,
          continue_pd: response.continuePD,
          open_text: response.openText,
        }),
      })
        .then((res) => {
          if (!res.ok) {
            return res.text().then((body) => {
              console.error('Supabase quiz_surveys insert failed:', res.status, body);
            });
          }
          console.log('Supabase quiz_surveys insert succeeded');
        })
        .catch((err) => {
          console.error('Supabase quiz_surveys network error:', err);
        });
    }

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div
        className="w-full max-w-lg rounded-xl p-6 mb-6 text-center animate-fade-in"
        style={{ backgroundColor: TEAL.bg, border: `1px solid ${TEAL.border}` }}
      >
        <h3 className="text-2xl font-bold text-white mb-2">
          {language === 'es' ? '¡Gracias!' : 'Thank you!'}
        </h3>
        <p className="text-base" style={{ color: '#8899aa' }}>
          {language === 'es'
            ? 'Tu opinión importa — esto nos ayuda a brindarte un mejor apoyo.'
            : 'Your voice matters — this helps us build better support for you.'}
        </p>
      </div>
    );
  }

  // Survey question data
  const q2Options =
    language === 'es'
      ? ['Sí, las uso regularmente', 'Sí, las he intentado algunas veces', 'Todavía no, pero planeo hacerlo', 'No estoy seguro/a qué estrategias usar']
      : ['Yes, I use them regularly', "Yes, I've tried them a few times", 'Not yet, but I plan to', "I'm not sure which strategies to use"];

  const q4Options =
    language === 'es'
      ? ['Sí, significativamente', 'Sí, en pequeñas formas', 'Todavía no, pero veo cómo podría', 'Realmente no']
      : ['Yes, significantly', 'Yes, in small ways', 'Not yet, but I see how it could', 'Not really'];

  const q6Options =
    language === 'es'
      ? ['Sí, definitivamente', 'Sí, con algunos cambios', 'No estoy seguro/a', 'No']
      : ['Yes, definitely', 'Yes, with some changes', "I'm not sure", 'No'];

  return (
    <div
      className="w-full max-w-lg rounded-xl p-6 mb-6"
      style={{ backgroundColor: 'rgba(34, 184, 189, 0.06)', border: `1px solid ${TEAL.border}` }}
    >
      <h3 className="text-xl font-bold text-white mb-1">
        {language === 'es' ? 'Revisión Rápida' : 'Quick Check-In'}
      </h3>
      <p className="text-sm mb-6" style={{ color: '#8899aa' }}>
        {language === 'es' ? '7 preguntas rápidas' : '7 quick questions'}
      </p>

      <div className="flex flex-col gap-6 text-left">
        {/* Q1 — Confidence 1-5 */}
        <ScaleQuestion
          question={
            language === 'es'
              ? '¿Qué tan seguro/a te sientes usando estrategias de instrucción (como hacer preguntas en vez de decir las respuestas, o dar retroalimentación específica) con tus estudiantes en este momento?'
              : 'How confident do you feel using instructional strategies (like asking questions instead of telling, or giving specific feedback) with your students right now?'
          }
          lowLabel={language === 'es' ? 'Sin confianza' : 'Not confident'}
          highLabel={language === 'es' ? 'Muy seguro/a' : 'Very confident'}
          value={confidence}
          onChange={setConfidence}
        />

        {/* Q2 — Implementation */}
        <OptionQuestion
          question={
            language === 'es'
              ? 'Desde el entrenamiento presencial de principios de año, ¿has intentado alguna de las estrategias que aprendiste?'
              : 'Since the in-person training earlier this year, have you tried any of the strategies you learned?'
          }
          options={q2Options}
          value={implementation}
          onChange={setImplementation}
        />

        {/* Q3 — Valued 1-5 */}
        <ScaleQuestion
          question={
            language === 'es'
              ? 'Desde enero, ¿te sientes más apoyado/a y valorado/a en tu rol como paraprofesional?'
              : 'Since January, do you feel more supported and valued in your role as a paraprofessional?'
          }
          lowLabel={language === 'es' ? 'Igual que antes' : 'About the same'}
          highLabel={language === 'es' ? 'Mucho más apoyado/a' : 'Much more supported'}
          value={valued}
          onChange={setValued}
        />

        {/* Q4 — Impact */}
        <OptionQuestion
          question={
            language === 'es'
              ? '¿Este desarrollo profesional ha cambiado cómo interactúas con los estudiantes?'
              : 'Has this professional development changed how you interact with students?'
          }
          options={q4Options}
          value={impact}
          onChange={setImpact}
        />

        {/* Q5 — Retention 1-5 */}
        <ScaleQuestion
          question={
            language === 'es'
              ? '¿Qué tan probable es que continúes en tu rol como paraprofesional el próximo año escolar?'
              : 'How likely are you to continue in your role as a paraprofessional next school year?'
          }
          lowLabel={language === 'es' ? 'Poco probable' : 'Unlikely'}
          highLabel={language === 'es' ? 'Definitivamente regresaré' : 'Definitely returning'}
          value={retention}
          onChange={setRetention}
        />

        {/* Q6 — Continue PD */}
        <OptionQuestion
          question={
            language === 'es'
              ? '¿Te gustaría seguir recibiendo desarrollo profesional como este el próximo año?'
              : 'Would you like to continue receiving professional development like this next year?'
          }
          options={q6Options}
          value={continuePD}
          onChange={setContinuePD}
        />

        {/* Q7 — Open text */}
        <div>
          <p className="text-white text-sm font-medium mb-2">
            {language === 'es'
              ? '¿Qué ha sido lo más valioso para ti este año?'
              : 'What has been most valuable to you this year?'}
          </p>
          <textarea
            value={openText}
            onChange={(e) => setOpenText(e.target.value)}
            placeholder={
              language === 'es'
                ? 'Una estrategia, un momento, un recurso — cualquier cosa que haya marcado una diferencia.'
                : 'A strategy, a moment, a resource — anything that made a difference.'
            }
            className="w-full rounded-lg p-3 text-white text-sm resize-none placeholder-gray-500"
            style={{
              backgroundColor: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.15)',
              minHeight: '80px',
              color: '#ffffff',
            }}
          />
        </div>
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        className="w-full mt-6 py-3 rounded-xl font-bold text-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
        style={{ backgroundColor: TEAL.accent, color: '#ffffff' }}
      >
        {language === 'es' ? 'Enviar' : 'Submit'}
      </button>
    </div>
  );
}

// ─── Reusable survey sub-components ───

function ScaleQuestion({
  question,
  lowLabel,
  highLabel,
  value,
  onChange,
}: {
  question: string;
  lowLabel: string;
  highLabel: string;
  value: number | null;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <p className="text-white text-sm font-medium mb-3">{question}</p>
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            onClick={() => onChange(n)}
            className="flex-1 py-2 rounded-lg font-bold text-sm transition-all"
            style={{
              backgroundColor: value === n ? TEAL.accent : 'rgba(255,255,255,0.06)',
              border: `1px solid ${value === n ? TEAL.accent : 'rgba(255,255,255,0.15)'}`,
              color: value === n ? '#fff' : '#8899aa',
            }}
          >
            {n}
          </button>
        ))}
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-xs" style={{ color: '#667788' }}>{lowLabel}</span>
        <span className="text-xs" style={{ color: '#667788' }}>{highLabel}</span>
      </div>
    </div>
  );
}

function OptionQuestion({
  question,
  options,
  value,
  onChange,
}: {
  question: string;
  options: string[];
  value: string | null;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <p className="text-white text-sm font-medium mb-3">{question}</p>
      <div className="flex flex-col gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className="w-full text-left rounded-lg py-2.5 px-4 text-sm transition-all"
            style={{
              backgroundColor: value === opt ? TEAL.bg : 'rgba(255,255,255,0.06)',
              border: `1px solid ${value === opt ? TEAL.accent : 'rgba(255,255,255,0.15)'}`,
              color: value === opt ? TEAL.accent : '#8899aa',
            }}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Score content helper ───
function getScoreContent(score: number, lang: 'en' | 'es') {
  if (score === 6) {
    return lang === 'es'
      ? {
          title: 'Lo lograste.',
          message: 'Cada escenario, el movimiento correcto. Desde kínder hasta preparatoria, educación general hasta salones especializados — estás leyendo los salones como un profesional.',
        }
      : {
          title: 'You nailed it.',
          message: 'Every scenario, the right move. From kindergarten to high school, gen ed to self-contained — you\u2019re reading classrooms like a pro.',
        };
  }
  if (score >= 4) {
    return lang === 'es'
      ? {
          title: 'Buenos instintos.',
          message: 'Estás identificando los movimientos correctos la mayor parte del tiempo. ¿Los que te perdiste? Ahí es donde está el aprendizaje real. Intenta de nuevo o explora las herramientas de juego para más práctica.',
        }
      : {
          title: 'Strong instincts.',
          message: 'You\u2019re spotting the right moves most of the time. The ones you missed? That\u2019s where the real learning is. Try again or explore the Game Tools for more practice.',
        };
  }
  return lang === 'es'
    ? {
        title: 'Buen comienzo.',
        message: 'Estos escenarios son difíciles a propósito — las respuestas incorrectas a menudo suenan razonables. Ese es el punto. Inténtalo de nuevo y observa si las explicaciones cambian tu forma de pensar.',
      }
    : {
        title: 'Good start.',
        message: 'These scenarios are tricky on purpose — the wrong answers often sound reasonable. That\u2019s the whole point. Try again and see if the explanations shift your thinking.',
      };
}
