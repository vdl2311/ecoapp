import React from 'react';
import { CheckCircle2, Sparkles, Award, ArrowRight, X, Leaf, ShieldCheck } from 'lucide-react';
import { USER_LEVELS } from '../../data/mockEcoData';

interface DisposalSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  pointName: string;
  pointsEarned: number;
  totalPoints: number;
  onViewImpact: () => void;
}

export const DisposalSuccessModal: React.FC<DisposalSuccessModalProps> = ({
  isOpen,
  onClose,
  pointName,
  pointsEarned,
  totalPoints,
  onViewImpact,
}) => {
  if (!isOpen) return null;

  // Determine user level based on totalPoints
  const currentLevel = [...USER_LEVELS].reverse().find((l) => totalPoints >= l.minPoints) || USER_LEVELS[0];
  const nextLevel = USER_LEVELS.find((l) => l.minPoints > totalPoints);
  const pointsToNext = nextLevel ? nextLevel.minPoints - totalPoints : 0;
  const progressToNext = nextLevel
    ? Math.min(100, Math.round(((totalPoints - currentLevel.minPoints) / (nextLevel.minPoints - currentLevel.minPoints)) * 100))
    : 100;

  return (
    <div className="fixed inset-0 z-50 bg-[#142816]/65 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 sm:p-7 shadow-2xl border border-stone-200 text-center space-y-4 animate-in fade-in zoom-in-95 duration-200 relative overflow-hidden">
        {/* Glow ambient circle */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-[#8CE28A]/20 rounded-full blur-2xl pointer-events-none" />

        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          aria-label="Fechar"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Celebration Glyph */}
        <div className="w-16 h-16 rounded-2xl bg-[#143D1A] text-[#8CE28A] mx-auto flex items-center justify-center text-3xl shadow-md ring-4 ring-[#8CE28A]/20 animate-bounce">
          🎉
        </div>

        <div>
          <span className="text-[10px] font-mono-code font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/70 px-2.5 py-0.5 rounded-md">
            Descarte Registrado com Sucesso
          </span>
          <h2 className="text-xl font-bold text-stone-900 mt-2 tracking-tight">
            +{pointsEarned} EcoPontos Conquistados!
          </h2>
          <p className="text-xs text-stone-500 mt-1 leading-relaxed">
            Parabéns! Seu descarte responsável em <strong className="text-stone-800">{pointName}</strong> foi validado no sistema municipal de Ipatinga.
          </p>
        </div>

        {/* Impact Message Card */}
        <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80 text-left space-y-2 text-xs">
          <div className="flex items-center gap-2 text-emerald-800 font-semibold">
            <Leaf className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Impacto Ambiental Garantido</span>
          </div>
          <p className="text-stone-600 text-[11px] leading-relaxed">
            Você ajudou a manter resíduos fora do descarte irregular e protegeu o solo, os bueiros e a bacia do Ribeirão Ipanema.
          </p>

          <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between text-[11px]">
            <span className="text-stone-500">Saldo Atual:</span>
            <span className="font-mono-code font-bold text-[#143D1A]">{totalPoints} pts</span>
          </div>
        </div>

        {/* Level Progression */}
        <div className="p-3 rounded-2xl bg-[#143D1A]/5 border border-[#143D1A]/10 text-left space-y-1.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-stone-800 flex items-center gap-1.5">
              <span>{currentLevel.badge}</span>
              <span>{currentLevel.name}</span>
            </span>
            {nextLevel && (
              <span className="text-[10px] font-mono-code text-stone-500">
                Faltam {pointsToNext} pts para {nextLevel.name}
              </span>
            )}
          </div>
          <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#143D1A] rounded-full transition-all duration-500"
              style={{ width: `${progressToNext}%` }}
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-2 pt-1">
          <button
            type="button"
            onClick={() => {
              onClose();
              onViewImpact();
            }}
            className="w-full py-3 px-4 rounded-xl bg-[#143D1A] hover:bg-[#1B5223] text-white font-bold text-xs transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
          >
            <span>Ver Meu Impacto & Nível</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 text-stone-500 hover:text-stone-800 text-xs font-medium cursor-pointer"
          >
            Continuar Navegando
          </button>
        </div>
      </div>
    </div>
  );
};
