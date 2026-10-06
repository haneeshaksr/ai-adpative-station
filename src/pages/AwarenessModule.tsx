import React, { useState, useEffect } from 'react';
import {
  Leaf,
  ShieldAlert,
  HeartPulse,
  Users,
  CheckCircle2,
  XCircle,
  Sparkles,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';
import { api } from '../services/api';
import { AwarenessCard } from '../types';

export const AwarenessModule: React.FC = () => {
  const [cards, setCards] = useState<AwarenessCard[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [quizAnswers, setQuizAnswers] = useState<{ [cardId: string]: number }>({});
  const [showExplanation, setShowExplanation] = useState<{ [cardId: string]: boolean }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getAwareness()
      .then((res) => setCards(res.awareness || []))
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Leaf':
        return <Leaf className="h-5 w-5 text-emerald-600" />;
      case 'ShieldAlert':
        return <ShieldAlert className="h-5 w-5 text-sky-600" />;
      case 'HeartPulse':
        return <HeartPulse className="h-5 w-5 text-rose-500" />;
      default:
        return <Users className="h-5 w-5 text-purple-600" />;
    }
  };

  const handleSelectQuizOption = (cardId: string, optIndex: number) => {
    setQuizAnswers((prev) => ({ ...prev, [cardId]: optIndex }));
    setShowExplanation((prev) => ({ ...prev, [cardId]: true }));
  };

  const categories = [
    'ALL',
    'Environmental Awareness',
    'Cyber Safety',
    'Health & Wellbeing',
    'Social Responsibility',
  ];

  const filteredCards = cards.filter((c) =>
    selectedCategory === 'ALL' ? true : c.category === selectedCategory
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <span className="text-xs font-bold uppercase tracking-wider text-cyan-700">
          Holistic Student Development
        </span>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight sm:text-3xl">
          Student Awareness & Wellbeing
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          Education beyond academics: environmental stewardship, digital safety, cyber hygiene, and
          mental rest
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`rounded-xl px-4 py-2 text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {filteredCards.map((card) => {
          const userAns = quizAnswers[card._id];
          const isAnswered = userAns !== undefined;
          const isCorrect = userAns === card.quiz.correctAnswer;
          const hasExplanation = showExplanation[card._id];

          return (
            <div
              key={card._id}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="rounded-xl bg-slate-50 p-2 border border-slate-100">
                      {getIcon(card.iconName)}
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {card.category}
                      </span>
                      <h2 className="text-base font-bold text-slate-900">{card.title}</h2>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{card.description}</p>

                {/* Key Takeaways */}
                <div className="rounded-2xl bg-slate-50 p-3.5 space-y-1.5 border border-slate-100 text-xs">
                  <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
                    Core Insights:
                  </span>
                  <ul className="space-y-1 text-slate-600 list-disc pl-4 text-[11px]">
                    {card.keyPoints.map((pt, i) => (
                      <li key={i}>{pt}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Micro Quiz */}
              <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 space-y-3 mt-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <HelpCircle className="h-3.5 w-3.5 text-cyan-600" />
                  <span>Micro Check: {card.quiz.question}</span>
                </div>

                <div className="space-y-1.5">
                  {card.quiz.options.map((opt, optIdx) => {
                    const isSelected = userAns === optIdx;
                    return (
                      <button
                        key={optIdx}
                        disabled={isAnswered}
                        onClick={() => handleSelectQuizOption(card._id, optIdx)}
                        className={`w-full text-left rounded-xl p-2.5 text-xs font-medium transition-all flex items-center justify-between ${
                          isAnswered
                            ? optIdx === card.quiz.correctAnswer
                              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold'
                              : isSelected
                              ? 'bg-rose-100 text-rose-900 border border-rose-300'
                              : 'bg-white text-slate-400 border border-slate-100 opacity-60'
                            : 'bg-white text-slate-700 border border-slate-200 hover:border-cyan-400 hover:bg-cyan-50/50'
                        }`}
                      >
                        <span>{opt}</span>
                        {isAnswered && optIdx === card.quiz.correctAnswer && (
                          <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0" />
                        )}
                        {isAnswered && isSelected && !isCorrect && (
                          <XCircle className="h-4 w-4 text-rose-700 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {hasExplanation && (
                  <div
                    className={`rounded-xl p-3 text-[11px] leading-relaxed animate-in fade-in ${
                      isCorrect
                        ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                        : 'bg-amber-50 text-amber-900 border border-amber-200'
                    }`}
                  >
                    <strong>{isCorrect ? 'Correct! ' : 'Explanation: '}</strong>
                    {card.quiz.explanation}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
