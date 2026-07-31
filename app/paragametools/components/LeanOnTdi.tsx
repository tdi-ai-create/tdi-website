'use client';

import { useState } from 'react';
import { ArrowLeft, ExternalLink, Handshake, Users, Monitor, MessageCircle } from 'lucide-react';
import { COLORS } from '../data/gameConfig';
import { useLanguage } from '../context/LanguageContext';
import { LEAN_SCENARIOS, LEAN_SCENARIO_COUNT, type LeanScenario, type EducatorRole } from '../data/leanOnTdi';
import { GameWrapper } from './GameWrapper';
import { ConfettiBurst } from './ConfettiBurst';
import { useGameTracking } from '@/lib/hub/useGameTracking';
import { useGameBadgeCheck } from '@/components/hub/useGameBadgeCheck';
import { CommunityNudge } from './CommunityNudge';

type Screen = 'roleSelect' | 'play' | 'results';

const GOLD = COLORS.gold;

const ROLE_LABELS = {
  leader: { en: 'Leader', es: 'Lider' },
  teacher: { en: 'Teacher', es: 'Maestro/a' },
  para: { en: 'Para', es: 'Para' },
  coach: { en: 'Coach', es: 'Coach' },
} as const;

const SERVICE_TYPE_LABELS = {
  team: { en: 'TDI Team', es: 'Equipo TDI', color: '#E8B84B' },
  platform: { en: 'Platform', es: 'Plataforma', color: '#27AE60' },
  community: { en: 'Community', es: 'Comunidad', color: '#3498DB' },
} as const;

const SERVICE_TYPE_ICONS = {
  team: Users,
  platform: Monitor,
  community: MessageCircle,
} as const;

export function LeanOnTdi({ onBack }: { onBack: () => void }) {
  const { language } = useLanguage();
  const { logCompletion, startSession, logGameResponse, completeSession } = useGameTracking();
  const [screen, setScreen] = useState<Screen>('roleSelect');
  const [selectedRole, setSelectedRole] = useState<EducatorRole>('teacher');
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [leanCount, setLeanCount] = useState(0);
  const [serviceBreakdown, setServiceBreakdown] = useState<Record<string, number>>({ team: 0, platform: 0, community: 0 });
  const [gameScenarios, setGameScenarios] = useState<LeanScenario[]>([]);

  const shuffleScenarios = (role: EducatorRole) => {
    const roleScenarios = LEAN_SCENARIOS.filter((s) => s.role === role);
    const shuffled = [...roleScenarios];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setGameScenarios(shuffled.slice(0, LEAN_SCENARIO_COUNT));
  };

  const scenario = gameScenarios[current];
  const data = scenario ? scenario[language] : null;
  const isLast = current === LEAN_SCENARIO_COUNT - 1;

  const handleSelect = (idx: number) => {
    if (selected !== null || !data) return;
    setSelected(idx);
    const isTdi = !data.choices[idx].diy;
    if (isTdi) {
      setLeanCount((c) => c + 1);
      setServiceBreakdown((prev) => ({
        ...prev,
        [data.service.type]: (prev[data.service.type] || 0) + 1,
      }));
    }

    logGameResponse('lean-on-tdi', {
      itemId: `leanontdi_${selectedRole}_${current}`,
      roundNumber: current + 1,
      userAnswer: data.choices[idx].diy ? 'diy' : 'tdi',
      correctAnswer: 'tdi',
      isCorrect: isTdi,
    });
  };

  const handleNext = async () => {
    if (isLast) {
      setScreen('results');
      logCompletion({ tool: 'lean-on-tdi', score: leanCount, totalRounds: LEAN_SCENARIO_COUNT });
      await completeSession(leanCount, leanCount);
    } else {
      setCurrent((c) => c + 1);
      setSelected(null);
    }
  };

  const handlePlayAgain = async () => {
    setCurrent(0);
    setSelected(null);
    setLeanCount(0);
    setServiceBreakdown({ team: 0, platform: 0, community: 0 });
    setScreen('roleSelect');
  };

  const handleStartWithRole = async (role: EducatorRole) => {
    setSelectedRole(role);
    shuffleScenarios(role);
    setCurrent(0);
    setSelected(null);
    setLeanCount(0);
    setServiceBreakdown({ team: 0, platform: 0, community: 0 });
    setScreen('play');
    await startSession('lean-on-tdi', LEAN_SCENARIO_COUNT, { language, role });
  };

  const gameTitle = language === 'es' ? 'Apoyate en Tu Equipo TDI' : 'Lean on Your TDI Team';
  const badgeCelebration = useGameBadgeCheck(screen === 'results');

  return (
    <GameWrapper gameId="leanontdi" title={gameTitle} color="gold" onBack={onBack}>
      {badgeCelebration}
      {screen === 'roleSelect' && (
        <RoleSelectScreen onSelectRole={handleStartWithRole} language={language} />
      )}
      {screen === 'play' && data && (
        <PlayScreen
          language={language}
          current={current}
          data={data}
          selected={selected}
          onSelect={handleSelect}
          onNext={handleNext}
          isLast={isLast}
          role={selectedRole}
        />
      )}
      {screen === 'results' && (
        <ResultsScreen
          language={language}
          leanCount={leanCount}
          serviceBreakdown={serviceBreakdown}
          role={selectedRole}
          onPlayAgain={handlePlayAgain}
          onBack={onBack}
        />
      )}
    </GameWrapper>
  );
}

// Role Select Screen
function RoleSelectScreen({
  onSelectRole,
  language,
}: {
  onSelectRole: (role: EducatorRole) => void;
  language: 'en' | 'es';
}) {
  const roles: EducatorRole[] = ['leader', 'teacher', 'para', 'coach'];

  return (
    <div className="flex flex-col items-center text-center animate-fade-in">
      <div
        className="w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center mb-4"
        style={{ backgroundColor: GOLD.bg, border: `2px solid ${GOLD.accent}` }}
      >
        <Handshake size={40} style={{ color: GOLD.accent }} />
      </div>
      <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
        {language === 'es' ? 'Apoyate en Tu Equipo TDI' : 'Lean on Your TDI Team'}
      </h2>
      <p className="text-lg mb-2" style={{ color: GOLD.accent }}>
        {language === 'es'
          ? 'Ya tienes un equipo. Descubre cuando usarlo.'
          : 'You already have a team. Discover when to use it.'}
      </p>

      <div
        className="w-full max-w-lg rounded-xl p-6 mb-6"
        style={{ backgroundColor: GOLD.bg, border: `1px solid ${GOLD.border}` }}
      >
        <p className="text-white text-base leading-relaxed mb-4">
          {language === 'es'
            ? '8 escenarios donde podrias hacerlo solo, o podrias apoyarte en las herramientas y las personas que ya estan en su lugar. Elige tu rol y descubre lo que ya tienes.'
            : '8 scenarios where you could do it yourself, or you could lean on the tools and people already in place. Pick your role and discover what you already have.'}
        </p>
        <ul className="space-y-2 text-left">
          {(language === 'es'
            ? [
                'Lee un escenario real para tu rol.',
                'Elige: hacerlo tu mismo o apoyarte en TDI.',
                'Descubre el servicio que ya esta listo para ti.',
              ]
            : [
                'Read a real scenario for your role.',
                'Choose: do it yourself or lean on TDI.',
                'Discover the service already in place for you.',
              ]
          ).map((rule, i) => (
            <li key={i} className="flex items-start gap-3 text-white text-sm">
              <span style={{ color: GOLD.accent }}>*</span>
              <span>{rule}</span>
            </li>
          ))}
        </ul>
      </div>

      <p className="text-sm mb-4" style={{ color: '#8899aa' }}>
        {language === 'es' ? 'Selecciona tu rol:' : 'Select your role:'}
      </p>

      <div className="grid grid-cols-2 gap-3 w-full max-w-md mb-4">
        {roles.map((role) => (
          <button
            key={role}
            onClick={() => onSelectRole(role)}
            className="px-6 py-4 rounded-xl font-bold text-base transition-all hover:scale-105 active:scale-95"
            style={{
              backgroundColor: GOLD.bg,
              border: `2px solid ${GOLD.border}`,
              color: GOLD.accent,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = GOLD.accent;
              e.currentTarget.style.backgroundColor = GOLD.bgHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = GOLD.border;
              e.currentTarget.style.backgroundColor = GOLD.bg;
            }}
          >
            {ROLE_LABELS[role][language]}
          </button>
        ))}
      </div>
    </div>
  );
}

// Play Screen
function PlayScreen({
  language,
  current,
  data,
  selected,
  onSelect,
  onNext,
  isLast,
  role,
}: {
  language: 'en' | 'es';
  current: number;
  data: {
    context: string;
    scenario: string;
    choices: { text: string; diy: boolean }[];
    tdiSolution: string;
    service: {
      name: string;
      description: string;
      type: 'team' | 'platform' | 'community';
    };
    leanType: string;
  };
  selected: number | null;
  onSelect: (idx: number) => void;
  onNext: () => void;
  isLast: boolean;
  role: EducatorRole;
}) {
  return (
    <div className="animate-fade-in">
      {/* Progress pips */}
      <div className="flex items-center justify-center gap-2 mb-4">
        {Array.from({ length: LEAN_SCENARIO_COUNT }).map((_, i) => (
          <div
            key={i}
            className="w-3 h-3 rounded-full transition-all duration-300"
            style={{
              backgroundColor: i <= current ? GOLD.accent : 'rgba(255,255,255,0.15)',
            }}
          />
        ))}
      </div>

      {/* Counter + role badge */}
      <div className="flex items-center justify-center gap-3 mb-2">
        <span
          className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide"
          style={{
            backgroundColor: GOLD.bg,
            border: `1px solid ${GOLD.border}`,
            color: GOLD.accent,
          }}
        >
          {ROLE_LABELS[role][language]}
        </span>
        <p className="text-sm" style={{ color: '#8899aa' }}>
          {language === 'es'
            ? `Escenario ${current + 1} de ${LEAN_SCENARIO_COUNT}`
            : `Scenario ${current + 1} of ${LEAN_SCENARIO_COUNT}`}
        </p>
      </div>

      {/* Context line */}
      <p className="text-center text-sm mb-4 italic" style={{ color: GOLD.accent, opacity: 0.8 }}>
        {data.context}
      </p>

      {/* Scenario card */}
      <div
        className="rounded-xl p-6 mb-6"
        style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
      >
        <p className="text-white text-base md:text-lg leading-relaxed">{data.scenario}</p>
      </div>

      {/* Choices */}
      <div className="flex flex-col gap-3 mb-6">
        {data.choices.map((choice, idx) => {
          const isSelected = selected === idx;
          const isTdi = !choice.diy;
          const isRevealed = selected !== null;

          let bg = 'rgba(255,255,255,0.06)';
          let border = 'rgba(255,255,255,0.15)';
          let opacity = 1;

          if (isRevealed) {
            if (isTdi) {
              bg = 'rgba(39, 174, 96, 0.2)';
              border = '#27AE60';
            } else if (isSelected && choice.diy) {
              bg = 'rgba(232, 184, 75, 0.15)';
              border = '#E8B84B';
            } else {
              opacity = 0.4;
            }
          }

          return (
            <button
              key={idx}
              onClick={() => onSelect(idx)}
              disabled={isRevealed}
              className="w-full text-left rounded-xl p-4 transition-all duration-200"
              style={{
                backgroundColor: bg,
                border: `2px solid ${border}`,
                opacity,
                cursor: isRevealed ? 'default' : 'pointer',
              }}
            >
              <span className="text-white text-base">{choice.text}</span>
              {isRevealed && isTdi && (
                <span
                  className="inline-block ml-2 px-2 py-0.5 rounded text-xs font-bold"
                  style={{ backgroundColor: 'rgba(39, 174, 96, 0.3)', color: '#27AE60' }}
                >
                  {language === 'es' ? 'Tu equipo TDI se encarga' : 'Your TDI team handles this'}
                </span>
              )}
              {isRevealed && isSelected && choice.diy && (
                <span
                  className="inline-block ml-2 px-2 py-0.5 rounded text-xs font-bold"
                  style={{ backgroundColor: 'rgba(232, 184, 75, 0.2)', color: '#E8B84B' }}
                >
                  {language === 'es' ? 'Podrias... pero no tienes que hacerlo' : 'You could... but you don\'t have to'}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TDI Solution reveal */}
      {selected !== null && (
        <div className="animate-reveal-bounce mb-6">
          <div
            className="rounded-xl p-6"
            style={{
              backgroundColor: 'rgba(232, 184, 75, 0.08)',
              borderLeft: `4px solid ${GOLD.accent}`,
              border: `1px solid rgba(232, 184, 75, 0.3)`,
              borderLeftWidth: '4px',
              borderLeftColor: GOLD.accent,
            }}
          >
            <p className="text-white text-base leading-relaxed mb-4">{data.tdiSolution}</p>

            {/* Service info */}
            <div
              className="rounded-lg p-4 mb-3"
              style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <div className="flex items-center gap-2 mb-2">
                {(() => {
                  const IconComp = SERVICE_TYPE_ICONS[data.service.type];
                  const typeInfo = SERVICE_TYPE_LABELS[data.service.type];
                  return (
                    <>
                      <IconComp size={16} style={{ color: typeInfo.color }} />
                      <span
                        className="text-xs font-bold uppercase tracking-wide"
                        style={{ color: typeInfo.color }}
                      >
                        {typeInfo[language]}
                      </span>
                    </>
                  );
                })()}
              </div>
              <p className="font-bold text-white text-sm mb-1">{data.service.name}</p>
              <p className="text-sm" style={{ color: '#8899aa' }}>{data.service.description}</p>
            </div>

            {/* Lean type pill */}
            <div className="flex items-center gap-2">
              <span
                className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide"
                style={{
                  backgroundColor: GOLD.bg,
                  border: `1px solid ${GOLD.border}`,
                  color: GOLD.accent,
                }}
              >
                {data.leanType}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Next button */}
      {selected !== null && (
        <div className="flex justify-center">
          <button
            onClick={onNext}
            className="px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 active:scale-95"
            style={{ backgroundColor: GOLD.accent, color: '#0a1628' }}
          >
            {isLast
              ? language === 'es'
                ? 'Ver Resultados'
                : 'See Results'
              : language === 'es'
                ? 'Siguiente Escenario \u2192'
                : 'Next Scenario \u2192'}
          </button>
        </div>
      )}
    </div>
  );
}

// Results Screen
function ResultsScreen({
  language,
  leanCount,
  serviceBreakdown,
  role,
  onPlayAgain,
  onBack,
}: {
  language: 'en' | 'es';
  leanCount: number;
  serviceBreakdown: Record<string, number>;
  role: EducatorRole;
  onPlayAgain: () => void;
  onBack: () => void;
}) {
  const confettiColors = [GOLD.accent, '#FFD700', '#FFFFFF'];
  const { title, message } = getScoreContent(leanCount, language);

  return (
    <div className="flex flex-col items-center text-center">
      {leanCount >= 6 && <ConfettiBurst colors={confettiColors} particleCount={60} />}

      {/* Score ring */}
      <div
        className="w-28 h-28 md:w-32 md:h-32 rounded-full flex flex-col items-center justify-center mb-6 animate-scale-in"
        style={{ backgroundColor: GOLD.bg, border: `3px solid ${GOLD.accent}` }}
      >
        <span className="text-4xl md:text-5xl font-black text-white">{leanCount}</span>
        <span className="text-sm" style={{ color: GOLD.accent }}>
          {language === 'es' ? `de ${LEAN_SCENARIO_COUNT}` : `of ${LEAN_SCENARIO_COUNT}`}
        </span>
      </div>

      <p className="text-sm mb-1" style={{ color: '#8899aa' }}>
        {language === 'es'
          ? `veces que te apoyaste en tu equipo (${ROLE_LABELS[role].es})`
          : `times you leaned on your team (${ROLE_LABELS[role].en})`}
      </p>

      <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">{title}</h2>
      <p className="text-lg text-white mb-8 max-w-lg leading-relaxed">{message}</p>

      {/* Service Type Breakdown */}
      <div
        className="w-full max-w-lg rounded-xl p-5 mb-6"
        style={{ backgroundColor: GOLD.bg, border: `1px solid ${GOLD.border}` }}
      >
        <p className="text-sm uppercase tracking-wider mb-3 font-bold" style={{ color: GOLD.accent }}>
          {language === 'es' ? 'Tipos de apoyo que elegiste' : 'Support types you chose'}
        </p>
        <div className="flex flex-col gap-3">
          {(['team', 'platform', 'community'] as const).map((type) => {
            const typeInfo = SERVICE_TYPE_LABELS[type];
            const IconComp = SERVICE_TYPE_ICONS[type];
            const count = serviceBreakdown[type] || 0;
            return (
              <div key={type} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <IconComp size={16} style={{ color: typeInfo.color }} />
                  <span className="text-white text-sm">{typeInfo[language]}</span>
                </div>
                <span
                  className="text-sm font-bold"
                  style={{ color: count > 0 ? typeInfo.color : '#8899aa' }}
                >
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reflection card */}
      <div
        className="w-full max-w-lg rounded-xl p-5 mb-6"
        style={{ backgroundColor: 'rgba(232, 184, 75, 0.1)', border: '1px solid rgba(232, 184, 75, 0.4)' }}
      >
        <p className="text-white text-base">
          {language === 'es'
            ? 'No hay respuestas incorrectas aqui. Cada escenario "hazlo tu mismo" es algo que un educador real ha hecho. La diferencia es saber que no tienes que hacerlo todo solo. Ya tienes un equipo.'
            : 'There are no wrong answers here. Every "do it yourself" scenario is something a real educator has done. The difference is knowing you do not have to do it all alone. You already have a team.'}
        </p>
      </div>

      {/* Resource links */}
      <div className="w-full max-w-lg flex flex-col gap-3 mb-8">
        <a
          href="https://teachersdeserveit.com/paragametools"
          className="flex items-center justify-center gap-2 rounded-xl py-3 px-6 font-medium transition-all hover:brightness-110"
          style={{ backgroundColor: GOLD.bg, border: `1px solid ${GOLD.border}`, color: GOLD.accent }}
        >
          <ExternalLink size={16} />
          {language === 'es' ? 'Mas Juegos de Practica' : 'More Practice Games'}
        </a>
        <a
          href="https://www.teachersdeserveit.com/hub"
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
        style={{ backgroundColor: GOLD.accent, color: '#0a1628' }}
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
      <CommunityNudge gameSlug="lean-on-tdi" score={leanCount} totalRounds={LEAN_SCENARIO_COUNT} />
    </div>
  );
}

// Score content helper
function getScoreContent(leanCount: number, lang: 'en' | 'es') {
  if (leanCount >= 7) {
    return lang === 'es'
      ? {
          title: 'Sabes apoyarte.',
          message: 'Reconoces cuando tienes un equipo y lo usas. Eso no es debilidad. Es saber lo que esta disponible y dejar que funcione para ti.',
        }
      : {
          title: 'You know how to lean.',
          message: 'You recognize when you have a team and you use it. That is not weakness. It is knowing what is available and letting it work for you.',
        };
  }
  if (leanCount >= 4) {
    return lang === 'es'
      ? {
          title: 'Empezando a confiar.',
          message: 'Te apoyaste en tu equipo varias veces, pero tambien elegiste hacerlo solo. Ahora sabes que servicios existen. La proxima vez que te atasques, sabras a donde ir.',
        }
      : {
          title: 'Starting to trust.',
          message: 'You leaned on your team several times, but also chose to go it alone. Now you know what services exist. Next time you hit a wall, you will know where to go.',
        };
  }
  return lang === 'es'
    ? {
        title: 'Eres independiente.',
        message: 'Prefieres resolver las cosas por tu cuenta. Eso es admirable. Pero ahora sabes que hay un equipo, una plataforma y una comunidad listos para cuando los necesites. No tienes que hacer todo solo.',
      }
    : {
        title: 'You are independent.',
        message: 'You prefer to figure things out on your own. That is admirable. But now you know there is a team, a platform, and a community ready for when you need them. You do not have to do it all yourself.',
      };
}
