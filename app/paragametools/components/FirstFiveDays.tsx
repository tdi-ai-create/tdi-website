'use client';

import { useState } from 'react';
import { ArrowLeft, ExternalLink, Calendar, Check, RotateCcw } from 'lucide-react';
import { COLORS } from '../data/gameConfig';
import { useLanguage } from '../context/LanguageContext';
import { PRIORITY_SETS, type PrioritySet, type PriorityItem } from '../data/firstFiveDays';
import { GameWrapper } from './GameWrapper';
import { ConfettiBurst } from './ConfettiBurst';
import { useGameTracking } from '@/lib/hub/useGameTracking';
import { useGameBadgeCheck } from '@/components/hub/useGameBadgeCheck';
import { CommunityNudge } from './CommunityNudge';
import { shuffle } from '../data/gameConfig';

type Screen = 'intro' | 'select' | 'results';
type Role = 'teacher' | 'para' | 'leader';

const AMBER = COLORS.amber;
const MAX_SELECTIONS = 8;
const ESSENTIAL_COUNT = 6;

const ROLE_LABELS = {
  teacher: { en: 'Teacher', es: 'Maestro/a' },
  para: { en: 'Para', es: 'Para' },
  leader: { en: 'Leader', es: 'Lider' },
} as const;

const PRIORITY_COLORS = {
  essential: { border: '#27AE60', bg: 'rgba(39, 174, 96, 0.15)', label: { en: 'Essential', es: 'Esencial' } },
  important: { border: '#F59E0B', bg: 'rgba(245, 158, 11, 0.15)', label: { en: 'Important', es: 'Importante' } },
  can_wait: { border: '#6B7280', bg: 'rgba(107, 114, 128, 0.15)', label: { en: 'Can Wait', es: 'Puede Esperar' } },
} as const;

export function FirstFiveDays({ onBack }: { onBack: () => void }) {
  const { language } = useLanguage();
  const { logCompletion, startSession, logGameResponse, completeSession } = useGameTracking();
  const [screen, setScreen] = useState<Screen>('intro');
  const [selectedRole, setSelectedRole] = useState<Role>('teacher');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [shuffledItems, setShuffledItems] = useState<PriorityItem[]>([]);

  const prioritySet = PRIORITY_SETS.find((s) => s.role === selectedRole)!;

  const handleStartGame = (role: Role) => {
    setSelectedRole(role);
    setSelectedItems(new Set());
    const set = PRIORITY_SETS.find((s) => s.role === role)!;
    setShuffledItems(shuffle(set.items));
    setScreen('select');
    startSession('first-five-days', MAX_SELECTIONS, { language, role });
  };

  const handleToggleItem = (id: string) => {
    setSelectedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else if (next.size < MAX_SELECTIONS) {
        next.add(id);
      }
      return next;
    });
  };

  const handleSeeResults = async () => {
    const essentialCount = prioritySet.items.filter(
      (item) => item[language].priority === 'essential' && selectedItems.has(item.id)
    ).length;

    setScreen('results');

    // Log each selection
    prioritySet.items.forEach((item, idx) => {
      logGameResponse('first-five-days', {
        itemId: item.id,
        roundNumber: idx + 1,
        userAnswer: selectedItems.has(item.id) ? 'selected' : 'skipped',
        correctAnswer: item[language].priority === 'essential' ? 'selected' : 'skipped',
        isCorrect: item[language].priority === 'essential' ? selectedItems.has(item.id) : !selectedItems.has(item.id),
      });
    });

    logCompletion({ tool: 'first-five-days', score: essentialCount, totalRounds: ESSENTIAL_COUNT });
    await completeSession(essentialCount, essentialCount);
  };

  const handlePlayAgain = () => {
    setSelectedItems(new Set());
    setScreen('intro');
  };

  const gameTitle = language === 'es' ? 'Primeros Cinco Dias' : 'First Five Days';
  const badgeCelebration = useGameBadgeCheck(screen === 'results');

  return (
    <GameWrapper gameId="firstfivedays" title={gameTitle} color="amber" onBack={onBack}>
      {badgeCelebration}
      {screen === 'intro' && (
        <IntroScreen onStart={handleStartGame} language={language} />
      )}
      {screen === 'select' && (
        <SelectScreen
          language={language}
          items={shuffledItems}
          selectedItems={selectedItems}
          onToggle={handleToggleItem}
          onSeeResults={handleSeeResults}
          context={prioritySet[language].context}
          title={prioritySet[language].title}
        />
      )}
      {screen === 'results' && (
        <ResultsScreen
          language={language}
          items={prioritySet.items}
          selectedItems={selectedItems}
          onPlayAgain={handlePlayAgain}
          onBack={onBack}
        />
      )}
    </GameWrapper>
  );
}

// Intro Screen with Role Selector
function IntroScreen({ onStart, language }: { onStart: (role: Role) => void; language: 'en' | 'es' }) {
  return (
    <div className="flex flex-col items-center text-center animate-fade-in">
      <div
        className="w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center mb-4"
        style={{ backgroundColor: AMBER.bg, border: `2px solid ${AMBER.accent}` }}
      >
        <Calendar size={48} style={{ color: AMBER.accent }} />
      </div>
      <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
        {language === 'es' ? 'Primeros Cinco Dias' : 'First Five Days'}
      </h2>
      <p className="text-lg mb-6" style={{ color: AMBER.accent }}>
        {language === 'es'
          ? 'No puedes hacerlo todo. Haz lo correcto.'
          : 'You cannot do everything. Do the right things.'}
      </p>

      <div
        className="w-full max-w-lg rounded-xl p-6 mb-6"
        style={{ backgroundColor: AMBER.bg, border: `1px solid ${AMBER.border}` }}
      >
        <p className="text-white text-base leading-relaxed mb-4">
          {language === 'es'
            ? 'Tienes 12 cosas que hacer en tu primera semana. Solo tienes tiempo para 8. Selecciona tus 8 prioridades principales y descubre lo que los educadores experimentados y la investigacion dicen sobre lo que realmente importa.'
            : 'You have 12 things to do in your first week. You only have time for 8. Select your top 8 priorities and see what experienced educators and research say about what actually matters most.'}
        </p>
        <ul className="space-y-2 text-left">
          {(language === 'es'
            ? [
                'Elige tu rol: Maestro, Para o Lider.',
                'Revisa 12 tareas de regreso a la escuela.',
                'Selecciona solo 8. Las que mas importan.',
                'Descubre lo que dice la investigacion.',
              ]
            : [
                'Choose your role: Teacher, Para, or Leader.',
                'Review 12 back-to-school tasks.',
                'Select only 8. The ones that matter most.',
                'See what research says.',
              ]
          ).map((rule, i) => (
            <li key={i} className="flex items-start gap-3 text-white text-sm">
              <span style={{ color: AMBER.accent }}>*</span>
              <span>{rule}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Role selector */}
      <p className="text-sm mb-3" style={{ color: '#8899aa' }}>
        {language === 'es' ? 'Selecciona tu rol:' : 'Select your role:'}
      </p>
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-lg">
        {(['teacher', 'para', 'leader'] as Role[]).map((role) => (
          <button
            key={role}
            onClick={() => onStart(role)}
            className="flex-1 px-6 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 active:scale-95"
            style={{
              backgroundColor: AMBER.accent,
              color: '#0a1628',
            }}
          >
            {ROLE_LABELS[role][language]}
          </button>
        ))}
      </div>
    </div>
  );
}

// Selection Screen
function SelectScreen({
  language,
  items,
  selectedItems,
  onToggle,
  onSeeResults,
  context,
  title,
}: {
  language: 'en' | 'es';
  items: PriorityItem[];
  selectedItems: Set<string>;
  onToggle: (id: string) => void;
  onSeeResults: () => void;
  context: string;
  title: string;
}) {
  const selectionCount = selectedItems.size;
  const canSubmit = selectionCount === MAX_SELECTIONS;

  return (
    <div className="animate-fade-in">
      {/* Title and context */}
      <h3 className="text-xl font-bold text-white text-center mb-2">{title}</h3>
      <p className="text-center text-sm mb-4 italic" style={{ color: AMBER.accent, opacity: 0.8 }}>
        {context}
      </p>

      {/* Selection counter */}
      <div
        className="rounded-xl p-3 mb-6 text-center"
        style={{ backgroundColor: AMBER.bg, border: `1px solid ${AMBER.border}` }}
      >
        <p className="text-white font-bold text-lg">
          <span style={{ color: canSubmit ? '#27AE60' : AMBER.accent }}>{selectionCount}</span>
          {' '}{language === 'es' ? 'de' : 'of'} {MAX_SELECTIONS} {language === 'es' ? 'seleccionados' : 'selected'}
        </p>
        {selectionCount < MAX_SELECTIONS && (
          <p className="text-xs mt-1" style={{ color: '#8899aa' }}>
            {language === 'es'
              ? `Selecciona ${MAX_SELECTIONS - selectionCount} mas`
              : `Select ${MAX_SELECTIONS - selectionCount} more`}
          </p>
        )}
      </div>

      {/* Item cards */}
      <div className="flex flex-col gap-3 mb-6">
        {items.map((item) => {
          const data = item[language];
          const isSelected = selectedItems.has(item.id);
          const isDisabled = !isSelected && selectionCount >= MAX_SELECTIONS;

          return (
            <button
              key={item.id}
              onClick={() => !isDisabled && onToggle(item.id)}
              disabled={isDisabled}
              className="w-full text-left rounded-xl p-4 transition-all duration-200"
              style={{
                backgroundColor: isSelected ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255,255,255,0.06)',
                border: isSelected ? `2px solid ${AMBER.accent}` : '2px solid rgba(255,255,255,0.15)',
                opacity: isDisabled ? 0.4 : 1,
                cursor: isDisabled ? 'not-allowed' : 'pointer',
              }}
            >
              <div className="flex items-start gap-3">
                {/* Checkbox */}
                <div
                  className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center mt-0.5 transition-all"
                  style={{
                    backgroundColor: isSelected ? AMBER.accent : 'rgba(255,255,255,0.1)',
                    border: isSelected ? 'none' : '2px solid rgba(255,255,255,0.3)',
                  }}
                >
                  {isSelected && <Check size={18} style={{ color: '#0a1628' }} />}
                </div>
                <div className="flex-1">
                  <p className="text-white font-semibold text-base">{data.task}</p>
                  <p className="text-sm mt-1" style={{ color: '#8899aa' }}>{data.description}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* See Results button */}
      <div className="flex justify-center">
        <button
          onClick={onSeeResults}
          disabled={!canSubmit}
          className="px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 active:scale-95"
          style={{
            backgroundColor: canSubmit ? AMBER.accent : 'rgba(255,255,255,0.1)',
            color: canSubmit ? '#0a1628' : '#666',
            cursor: canSubmit ? 'pointer' : 'not-allowed',
          }}
        >
          {language === 'es' ? 'Ver Resultados' : 'See Results'}
        </button>
      </div>
    </div>
  );
}

// Results Screen
function ResultsScreen({
  language,
  items,
  selectedItems,
  onPlayAgain,
  onBack,
}: {
  language: 'en' | 'es';
  items: PriorityItem[];
  selectedItems: Set<string>;
  onPlayAgain: () => void;
  onBack: () => void;
}) {
  const essentialItems = items.filter((i) => i[language].priority === 'essential');
  const importantItems = items.filter((i) => i[language].priority === 'important');
  const canWaitItems = items.filter((i) => i[language].priority === 'can_wait');

  const essentialsSelected = essentialItems.filter((i) => selectedItems.has(i.id)).length;
  const confettiColors = [AMBER.accent, '#FFD700', '#FFFFFF'];

  const { title, message } = getScoreContent(essentialsSelected, language);

  return (
    <div className="flex flex-col items-center text-center animate-fade-in">
      {essentialsSelected >= 5 && <ConfettiBurst colors={confettiColors} particleCount={60} />}

      {/* Score ring */}
      <div
        className="w-28 h-28 md:w-32 md:h-32 rounded-full flex flex-col items-center justify-center mb-6 animate-scale-in"
        style={{ backgroundColor: AMBER.bg, border: `3px solid ${AMBER.accent}` }}
      >
        <span className="text-4xl md:text-5xl font-black text-white">{essentialsSelected}</span>
        <span className="text-sm" style={{ color: AMBER.accent }}>
          {language === 'es' ? `de ${ESSENTIAL_COUNT} esenciales` : `of ${ESSENTIAL_COUNT} essentials`}
        </span>
      </div>

      <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">{title}</h2>
      <p className="text-lg text-white mb-8 max-w-lg leading-relaxed">{message}</p>

      {/* Overall insight */}
      <div
        className="w-full max-w-lg rounded-xl p-5 mb-8"
        style={{ backgroundColor: AMBER.bg, border: `1px solid ${AMBER.border}` }}
      >
        <p className="text-white text-base font-medium leading-relaxed">
          {language === 'es'
            ? 'Las relaciones y las rutinas le ganan al contenido y la decoracion. Siempre.'
            : 'Relationships and routines beat content and decoration. Every time.'}
        </p>
      </div>

      {/* Priority groups */}
      <div className="w-full max-w-lg space-y-6 mb-8 text-left">
        {[
          { label: language === 'es' ? 'Esencial' : 'Essential', items: essentialItems, config: PRIORITY_COLORS.essential },
          { label: language === 'es' ? 'Importante' : 'Important', items: importantItems, config: PRIORITY_COLORS.important },
          { label: language === 'es' ? 'Puede Esperar' : 'Can Wait', items: canWaitItems, config: PRIORITY_COLORS.can_wait },
        ].map((group) => (
          <div key={group.label}>
            <h3 className="text-lg font-bold mb-3" style={{ color: group.config.border }}>
              {group.label}
            </h3>
            <div className="flex flex-col gap-3">
              {group.items.map((item) => {
                const data = item[language];
                const wasSelected = selectedItems.has(item.id);
                const verdict = getVerdict(data.priority, wasSelected, language);

                return (
                  <div
                    key={item.id}
                    className="rounded-xl p-4"
                    style={{
                      backgroundColor: group.config.bg,
                      borderLeft: `4px solid ${group.config.border}`,
                      border: `1px solid ${group.config.border}30`,
                      borderLeftWidth: '4px',
                      borderLeftColor: group.config.border,
                    }}
                  >
                    <div className="flex items-start gap-3 mb-2">
                      <div
                        className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5"
                        style={{
                          backgroundColor: wasSelected ? AMBER.accent : 'rgba(255,255,255,0.1)',
                        }}
                      >
                        {wasSelected && <Check size={14} style={{ color: '#0a1628' }} />}
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-semibold text-sm">{data.task}</p>
                        <p className="text-xs mt-1 font-bold" style={{ color: group.config.border }}>
                          {verdict}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm leading-relaxed mt-2" style={{ color: '#c0c8d4' }}>
                      {data.rationale}
                    </p>
                    <p className="text-xs mt-2 font-medium" style={{ color: '#8899aa' }}>
                      {language === 'es' ? 'Sugerido:' : 'Suggested:'} {data.day}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Play again / back */}
      <button
        onClick={onPlayAgain}
        className="flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 active:scale-95 mb-4"
        style={{ backgroundColor: AMBER.accent, color: '#0a1628' }}
      >
        <RotateCcw size={20} />
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

      <CommunityNudge gameSlug="first-five-days" score={essentialsSelected} totalRounds={ESSENTIAL_COUNT} />
    </div>
  );
}

function getVerdict(priority: string, wasSelected: boolean, lang: 'en' | 'es'): string {
  if (priority === 'essential') {
    return wasSelected
      ? (lang === 'es' ? 'Buena decision.' : 'Great call.')
      : (lang === 'es' ? 'Esta importa mas de lo que piensas.' : 'This one matters more than you think.');
  }
  if (priority === 'important') {
    return wasSelected
      ? (lang === 'es' ? 'Eleccion solida.' : 'Solid choice.')
      : (lang === 'es' ? 'Vale la pena hacerlo, pero tienes razon en que puede flexionar.' : 'Worth doing, but you are right it can flex.');
  }
  // can_wait
  return wasSelected
    ? (lang === 'es' ? 'Esto realmente puede esperar. Mira por que.' : 'This can actually wait. Here is why.')
    : (lang === 'es' ? 'Inteligente. Esto puede esperar.' : 'Smart. This can wait.');
}

function getScoreContent(essentials: number, lang: 'en' | 'es') {
  if (essentials >= 6) {
    return lang === 'es'
      ? {
          title: 'Instinto perfecto.',
          message: 'Identificaste todas las prioridades esenciales. Sabes que las relaciones y las rutinas son lo primero. El contenido y la decoracion pueden esperar.',
        }
      : {
          title: 'Perfect instinct.',
          message: 'You identified every essential priority. You know that relationships and routines come first. Content and decoration can wait.',
        };
  }
  if (essentials >= 4) {
    return lang === 'es'
      ? {
          title: 'Base fuerte.',
          message: 'Captaste la mayoria de las esenciales. Las que te faltaron revelan suposiciones comunes sobre lo que importa en la primera semana. Mira abajo para ver lo que dice la investigacion.',
        }
      : {
          title: 'Strong foundation.',
          message: 'You caught most of the essentials. The ones you missed reveal common assumptions about what matters in the first week. See below for what research says.',
        };
  }
  return lang === 'es'
    ? {
        title: 'Reflexion valiosa.',
        message: 'Muchos educadores priorizan logistica y estetica sobre relaciones y rutinas. No estas solo. La primera semana es sobre personas, no sobre cosas. Mira abajo para ver por que.',
      }
    : {
        title: 'Valuable reflection.',
        message: 'Many educators prioritize logistics and aesthetics over relationships and routines. You are not alone. The first week is about people, not things. See below for why.',
      };
}
