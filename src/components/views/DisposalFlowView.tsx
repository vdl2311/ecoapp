import React, { useState, useMemo } from 'react';
import {
  Search,
  MapPin,
  Clock,
  Navigation,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Info,
  Calendar,
  Check,
  ChevronRight,
  Layers,
  Truck,
  RotateCcw,
} from 'lucide-react';
import { RECYCLING_GUIDES, DISPOSAL_POINTS } from '../../data/mockEcoData';
import { RecyclingItemGuide, DisposalPoint, WasteCategory } from '../../types/ecoapp';

interface DisposalFlowViewProps {
  onSelectPointOnMap: (point: DisposalPoint) => void;
  onOpenSchedule: () => void;
  onConfirmDisposal: (point: DisposalPoint) => void;
}

export const DisposalFlowView: React.FC<DisposalFlowViewProps> = ({
  onSelectPointOnMap,
  onOpenSchedule,
  onConfirmDisposal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeItem, setActiveItem] = useState<RecyclingItemGuide | null>(null);

  const visualCategories = [
    { id: 'oleo', label: 'Óleo', icon: '🛢️', desc: 'Frituras em garrafa PET' },
    { id: 'eletronico', label: 'Eletrônicos', icon: '💻', desc: 'Computadores, TVs e cabos' },
    { id: 'pilhas', label: 'Pilhas & Baterias', icon: '🔋', desc: 'Lítio e alcalinas' },
    { id: 'medicamento', label: 'Medicamentos', icon: '💊', desc: 'Vencidos e blisters' },
    { id: 'moveis', label: 'Móveis', icon: '🛋️', desc: 'Sofás, estantes e camas' },
    { id: 'entulho', label: 'Entulho', icon: '🧱', desc: 'Obras até 1m³ ensacadas' },
    { id: 'podas', label: 'Podas', icon: '🌿', desc: 'Galhos amarrados e folhas' },
    { id: 'plastico', label: 'Recicláveis', icon: '♻️', desc: 'PET, latinhas, papelão, vidro' },
  ];

  // Natural Language & Keyword matcher
  const matchedGuide = useMemo<RecyclingItemGuide | null>(() => {
    if (!searchQuery.trim()) {
      if (selectedCategory) {
        return (
          RECYCLING_GUIDES.find(
            (g) =>
              g.category === selectedCategory ||
              (selectedCategory === 'pilhas' && g.id === 'rec-pilhas')
          ) || null
        );
      }
      return null;
    }

    const q = searchQuery.toLowerCase().trim();

    // Check alias and name match
    return (
      RECYCLING_GUIDES.find((g) => {
        const matchAlias = g.searchAliases.some((alias) => q.includes(alias));
        const matchName = g.name.toLowerCase().includes(q) || q.includes(g.name.toLowerCase());
        const matchCategory = q.includes(g.category);
        return matchAlias || matchName || matchCategory;
      }) || null
    );
  }, [searchQuery, selectedCategory]);

  // Points that accept the matched category
  const matchingPoints = useMemo<DisposalPoint[]>(() => {
    if (!matchedGuide) return [];

    let targetCategory: WasteCategory = 'reciclavel_comum';

    if (matchedGuide.category === 'moveis' || matchedGuide.category === 'entulho') {
      targetCategory = 'moveis_entulho';
    } else if (matchedGuide.category === 'oleo') {
      targetCategory = 'oleo';
    } else if (matchedGuide.category === 'eletronico') {
      targetCategory = 'eletronicos';
    } else if (matchedGuide.category === 'medicamento') {
      targetCategory = 'medicamentos';
    } else if (matchedGuide.category === 'podas') {
      targetCategory = 'podas';
    }

    return DISPOSAL_POINTS.filter((p) => p.category.includes(targetCategory));
  }, [matchedGuide]);

  const handleSelectCategory = (catId: string) => {
    setSelectedCategory(catId === selectedCategory ? null : catId);
    setSearchQuery('');
  };

  const handleClear = () => {
    setSearchQuery('');
    setSelectedCategory(null);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-150">
      {/* Search Header Banner */}
      <section className="bg-white rounded-3xl border border-stone-200/90 p-6 sm:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-stone-500 font-medium mb-1">
            <span className="text-[#143D1A] font-semibold">Fluxo de Descarte Inteligente</span>
            <span aria-hidden="true">·</span>
            <span>Ipatinga - MG</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#142816] tracking-tight">
            O que você quer descartar?
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Digite em linguagem natural (ex: <em>"tenho um sofá velho"</em>, <em>"onde jogar óleo?"</em>, <em>"remédio vencido"</em>) ou escolha uma categoria abaixo.
          </p>
        </div>

        {/* Big Search Bar */}
        <div className="relative">
          <Search className="w-5 h-5 text-stone-400 absolute left-4 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSelectedCategory(null);
            }}
            placeholder="Ex: sofá, óleo de cozinha, celular, remédio, caixa de pizza..."
            className="w-full pl-12 pr-12 py-3.5 bg-stone-50 border border-stone-300 rounded-2xl text-sm placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#143D1A] transition-all font-medium text-stone-900 shadow-xs"
            autoFocus
          />
          {(searchQuery || selectedCategory) && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-4 top-3 text-stone-400 hover:text-stone-700 text-sm font-semibold p-1"
            >
              ✕
            </button>
          )}
        </div>

        {/* Visual Category Grid */}
        <div className="space-y-2 pt-2">
          <span className="text-xs font-semibold text-stone-600 block">
            Ou selecione uma categoria rápida:
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {visualCategories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleSelectCategory(cat.id)}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                    isSelected
                      ? 'bg-[#143D1A] text-white border-[#143D1A] shadow-xs'
                      : 'bg-stone-50 hover:bg-stone-100/80 border-stone-200/80 text-stone-800'
                  }`}
                >
                  <span className="text-2xl shrink-0">{cat.icon}</span>
                  <div className="min-w-0">
                    <span className="text-xs font-bold block truncate leading-tight">
                      {cat.label}
                    </span>
                    <span
                      className={`text-[10px] block truncate mt-0.5 ${
                        isSelected ? 'text-white/80' : 'text-stone-400'
                      }`}
                    >
                      {cat.desc}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Visual Intelligent Result Card */}
      {matchedGuide ? (
        <section className="bg-white rounded-3xl border border-stone-200/90 p-6 sm:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-200">
          {/* Header match */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-stone-500 mb-1">
                <span className="text-[10px] font-mono-code font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                  Resíduo Identificado
                </span>
                <span>·</span>
                <span className="capitalize font-semibold text-stone-700">
                  {matchedGuide.category}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
                {matchedGuide.name}
              </h2>
            </div>

            {matchedGuide.canSchedulePickup && (
              <button
                type="button"
                onClick={onOpenSchedule}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold hover:bg-amber-100 transition-colors cursor-pointer self-start sm:self-auto"
              >
                <Truck className="w-4 h-4 text-amber-700" />
                <span>Agendar Cata-Treco (Gratuito)</span>
              </button>
            )}
          </div>

          {/* Preparation & Common Mistakes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Como Preparar */}
            <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/70 space-y-2">
              <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Como preparar antes de levar:</span>
              </span>
              <ul className="space-y-1.5">
                {matchedGuide.howToPrepare.map((step, idx) => (
                  <li key={idx} className="text-stone-700 flex items-start gap-1.5 text-[11px] leading-relaxed">
                    <span className="text-emerald-700 font-bold shrink-0">•</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* O que NÃO Fazer */}
            <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-200/70 space-y-2">
              <span className="font-bold text-rose-900 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-700 shrink-0" />
                <span>O que NÃO fazer (Evite multas e contaminação):</span>
              </span>
              <p className="text-stone-700 text-[11px] leading-relaxed">
                {matchedGuide.commonMistakes}
              </p>
            </div>
          </div>

          {/* Where to Dispose: Compatible Points in Ipatinga */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-stone-900">
                  Você pode levar para os seguintes pontos ({matchingPoints.length}):
                </h3>
                <p className="text-xs text-stone-500">
                  Locais credenciados que aceitam este tipo de resíduo em Ipatinga
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {matchingPoints.map((point) => (
                <div
                  key={point.id}
                  className="p-4 rounded-2xl border border-stone-200 bg-stone-50/60 hover:bg-white hover:border-[#143D1A] transition-all flex flex-col justify-between space-y-3 group"
                >
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-stone-500 mb-1 font-mono-code">
                      <span className="uppercase font-semibold text-emerald-800">{point.type}</span>
                      <span className="font-bold text-stone-800">{point.distance}</span>
                    </div>

                    <h4 className="text-xs font-bold text-stone-900 group-hover:text-[#143D1A] transition-colors leading-snug">
                      {point.name}
                    </h4>

                    <p className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">
                      {point.address}
                    </p>

                    <div className="flex items-center gap-1 text-[10px] text-emerald-700 mt-2 font-medium">
                      <Clock className="w-3 h-3" />
                      <span>{point.hours}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => onSelectPointOnMap(point)}
                      className="flex-1 py-1.5 px-2 rounded-xl bg-stone-200/80 hover:bg-stone-300 text-stone-800 text-[11px] font-semibold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <MapPin className="w-3 h-3 text-[#143D1A]" />
                      <span>Ver no Mapa</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onConfirmDisposal(point)}
                      className="flex-1 py-1.5 px-2 rounded-xl bg-[#143D1A] hover:bg-[#1B5223] text-white text-[11px] font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer shadow-xs"
                    >
                      <Sparkles className="w-3 h-3 text-[#8CE28A]" />
                      <span>Descartei Aqui</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : searchQuery ? (
        /* Empty Search State */
        <section className="bg-white rounded-3xl border border-stone-200/90 p-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-stone-100 text-stone-400 flex items-center justify-center mx-auto text-xl">
            🔍
          </div>
          <h3 className="text-base font-bold text-stone-800">
            Não encontramos um resíduo exato para "{searchQuery}"
          </h3>
          <p className="text-xs text-stone-500 max-w-md mx-auto leading-relaxed">
            Tente buscar por termos genéricos como <em>sofá</em>, <em>óleo</em>, <em>eletrônicos</em>, <em>remédio</em>, <em>entulho</em> ou consulte nossa IA especializada.
          </p>
          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleClear}
              className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold"
            >
              Limpar Busca
            </button>
            <button
              type="button"
              onClick={() => handleSelectCategory('moveis')}
              className="px-4 py-2 rounded-xl bg-[#143D1A] text-white text-xs font-bold"
            >
              Ver Móveis & Ecopontos
            </button>
          </div>
        </section>
      ) : null}
    </div>
  );
};
