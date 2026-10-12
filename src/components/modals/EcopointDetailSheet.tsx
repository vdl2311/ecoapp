import React, { useState } from 'react';
import {
  X,
  MapPin,
  Clock,
  Phone,
  Navigation,
  Sparkles,
  Heart,
  Share2,
  CheckCircle2,
  Copy,
  Check,
  ChevronDown,
  Building2,
  Info,
} from 'lucide-react';
import { DisposalPoint } from '../../types/ecoapp';

interface EcopointDetailSheetProps {
  point: DisposalPoint | null;
  onClose: () => void;
  onConfirmDisposal: (point: DisposalPoint) => void;
  isFavorite: boolean;
  onToggleFavorite: (pointId: string) => void;
}

export const EcopointDetailSheet: React.FC<EcopointDetailSheetProps> = ({
  point,
  onClose,
  onConfirmDisposal,
  isFavorite,
  onToggleFavorite,
}) => {
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [sharedToast, setSharedToast] = useState(false);
  const [infoOpen, setInfoOpen] = useState(true);

  if (!point) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(point.address);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2500);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: point.name,
        text: `Ecoponto em Ipatinga: ${point.name} (${point.address})`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${point.name} — ${point.address}`);
      setSharedToast(true);
      setTimeout(() => setSharedToast(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#142816]/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative z-10 bg-white rounded-t-3xl sm:rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-stone-200 animate-in slide-in-from-bottom duration-200 flex flex-col">
        {/* Mobile handle indicator */}
        <div className="w-12 h-1.5 bg-stone-300 rounded-full mx-auto mt-3 sm:hidden" />

        {/* Top Header */}
        <div className="p-5 pb-3 border-b border-stone-100 flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[11px] text-stone-500 font-mono-code">
              <span className="font-semibold uppercase tracking-wider text-emerald-800">
                {point.isOfficial ? 'Ecoponto Oficial SESUMA' : point.type.toUpperCase()}
              </span>
              <span>·</span>
              <span>{point.distance}</span>
              <span>·</span>
              <span className="text-stone-800 font-bold">★ {point.rating}</span>
            </div>
            <h2 className="text-lg font-bold text-stone-900 tracking-tight leading-tight">
              {point.name}
            </h2>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 ml-2">
            <button
              type="button"
              onClick={() => onToggleFavorite(point.id)}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                isFavorite
                  ? 'bg-rose-50 border-rose-200 text-rose-600'
                  : 'bg-stone-50 border-stone-200 text-stone-400 hover:text-rose-600'
              }`}
              title={isFavorite ? 'Remover dos favoritos' : 'Salvar nos favoritos'}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="p-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-600 hover:text-stone-900 transition-colors cursor-pointer"
              title="Compartilhar localização"
            >
              <Share2 className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {sharedToast && (
          <div className="mx-5 mt-2 p-2 bg-emerald-50 text-emerald-800 text-xs rounded-xl text-center">
            Link copiado para a área de transferência!
          </div>
        )}

        {/* Content Body */}
        <div className="p-5 space-y-4 text-xs">
          {/* Status & Hours */}
          <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200/80 flex items-start gap-2.5">
            <Clock className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <div className="flex items-center gap-1.5 font-semibold text-stone-900">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Aberto agora</span>
                <span className="text-stone-400 font-normal">· Descarte 100% Gratuito</span>
              </div>
              <p className="text-[11px] text-stone-500 mt-0.5">{point.hours}</p>
            </div>
          </div>

          {/* Address with copy */}
          <div className="space-y-1">
            <span className="font-semibold text-stone-700 block text-[11px]">Endereço:</span>
            <div className="flex items-center justify-between gap-2 p-2.5 bg-stone-50 rounded-xl border border-stone-200/80">
              <div className="flex items-start gap-2 text-stone-700">
                <MapPin className="w-3.5 h-3.5 text-[#143D1A] shrink-0 mt-0.5" />
                <span className="text-[11px] leading-relaxed">{point.address}</span>
              </div>
              <button
                type="button"
                onClick={handleCopy}
                className="p-1 rounded-lg hover:bg-stone-200 text-stone-500 transition-colors shrink-0"
                title="Copiar endereço"
              >
                {copiedAddress ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Materials Accepted */}
          <div className="space-y-2">
            <span className="font-semibold text-stone-700 block text-[11px]">
              Materiais Aceitos para Descarte:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {point.accepts.map((mat, i) => (
                <div
                  key={i}
                  className="flex items-center gap-1.5 p-2 bg-stone-50/70 border border-stone-200/70 rounded-xl text-stone-700 text-[11px]"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="truncate">{mat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Collapsible Municipal Guideline Info */}
          <div className="border border-stone-200/80 rounded-2xl overflow-hidden">
            <button
              type="button"
              onClick={() => setInfoOpen(!infoOpen)}
              className="w-full p-3 bg-stone-50 flex items-center justify-between text-xs font-semibold text-stone-800 text-left"
            >
              <div className="flex items-center gap-2">
                <Info className="w-3.5 h-3.5 text-[#143D1A]" />
                <span>Orientações & Responsável</span>
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 text-stone-400 transition-transform ${
                  infoOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {infoOpen && (
              <div className="p-3 bg-white space-y-2 border-t border-stone-100 text-[11px] text-stone-600 leading-relaxed">
                <p>{point.tips}</p>
                {point.responsible && (
                  <p className="font-medium text-stone-700">
                    <strong>Gestão:</strong> {point.responsible}
                  </p>
                )}
                {point.phone && (
                  <p className="font-medium text-stone-700 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-[#143D1A]" />
                    <span>Contato oficial: {point.phone}</span>
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons Footer */}
        <div className="p-5 pt-3 border-t border-stone-100 bg-stone-50/50 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                `${point.name} Ipatinga MG`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-stone-200/80 hover:bg-stone-300 text-stone-800 font-bold text-xs transition-colors"
            >
              <Navigation className="w-3.5 h-3.5 text-[#143D1A]" />
              <span>Como Chegar</span>
            </a>

            {point.phone ? (
              <a
                href={`tel:${point.phone.replace(/\D/g, '')}`}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-stone-200/80 hover:bg-stone-300 text-stone-800 font-bold text-xs transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-[#143D1A]" />
                <span>Ligar</span>
              </a>
            ) : (
              <div className="flex items-center justify-center py-2.5 px-3 rounded-xl bg-stone-100 text-stone-400 font-medium text-xs">
                <span>Sem telefone</span>
              </div>
            )}
          </div>

          {/* Primary Action: Descartei Aqui */}
          <button
            type="button"
            onClick={() => onConfirmDisposal(point)}
            className="w-full py-3 px-4 rounded-xl bg-[#143D1A] hover:bg-[#1B5223] text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-[#8CE28A]" />
            <span>Descartei Aqui (+30 EcoPontos)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
