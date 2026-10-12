import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Search,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Droplet,
  Smartphone,
  FileText,
  Package,
  Pill,
  Wine,
  Apple,
  Cpu,
  HelpCircle,
  ArrowRight,
  RefreshCw,
  Info,
  Recycle,
} from 'lucide-react';
import { RECYCLING_GUIDES } from '../../data/mockEcoData';
import { RecyclingItemGuide } from '../../types/ecoapp';

interface GuideViewProps {
  onEarnPoints: (pts: number, reason: string) => void;
}

export const GuideView: React.FC<GuideViewProps> = ({ onEarnPoints }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeItemModal, setActiveItemModal] = useState<RecyclingItemGuide | null>(null);

  // Interactive Triage Simulator state
  const simulatorItems = [
    {
      name: 'Caixa de Pizza Engordurada',
      correctBin: 'organico',
      explanation: 'A gordura do queijo e do molho adere às fibras e contamina os tanques de polpação na reciclagem de papel. Deve ir no Lixo Comum / Orgânico!',
    },
    {
      name: 'Pote de Conserva de Vidro com Tampa',
      correctBin: 'reciclavel',
      explanation: 'Vidros de conserva e suas tampas metálicas são 100% recicláveis infinitas vezes. Lave com um pouco de água de reúso.',
    },
    {
      name: 'Cartela Vazia de Medicamento (Blister)',
      correctBin: 'farmacia',
      explanation: 'O plástico colado ao alumínio com traços de princípios ativos químicos requer destinação em farmácias ou UBS credenciadas.',
    },
    {
      name: 'Pilhas e Baterias de Celular',
      correctBin: 'ecoponto',
      explanation: 'Contêm metais pesados tóxicos (cádmio, chumbo, mercúrio). Devem ser entregues em Ecopontos SESUMA ou totens de supermercado.',
    },
    {
      name: 'Garrafa PET de Refrigerante',
      correctBin: 'reciclavel',
      explanation: 'Plástico nobre (PET). Amasse para economizar espaço e coloque no saco da Coleta Seletiva às terças e quintas!',
    },
  ];

  const [currentSimIndex, setCurrentSimIndex] = useState(0);
  const [simAnswerResult, setSimAnswerResult] = useState<{ isCorrect: boolean; text: string } | null>(null);
  const [simStreak, setSimStreak] = useState(0);

  const categories = [
    { id: 'todos', label: 'Todos os Materiais' },
    { id: 'plastico', label: 'Plásticos' },
    { id: 'papel', label: 'Papel & Papelão' },
    { id: 'vidro', label: 'Vidros' },
    { id: 'metal', label: 'Metais' },
    { id: 'oleo', label: 'Óleo de Cozinha' },
    { id: 'eletronico', label: 'Eletrônicos & Pilhas' },
    { id: 'medicamento', label: 'Medicamentos' },
    { id: 'organico', label: 'Orgânicos & Compostagem' },
  ];

  const quickQueries = [
    'Caixa de pizza',
    'Óleo de cozinha',
    'Vidro quebrado',
    'Pilhas',
    'Cartela de remédio',
    'Lata de sardinha',
  ];

  const filteredGuides = useMemo(() => {
    return RECYCLING_GUIDES.filter((guide) => {
      const matchCategory = selectedCategory === 'todos' || guide.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        guide.name.toLowerCase().includes(q) ||
        guide.whereToDispose.toLowerCase().includes(q) ||
        guide.commonMistakes.toLowerCase().includes(q);
      return matchCategory && matchSearch;
    });
  }, [selectedCategory, searchQuery]);

  const handleSimulateTriage = (bin: 'reciclavel' | 'organico' | 'ecoponto' | 'farmacia') => {
    const currentItem = simulatorItems[currentSimIndex];
    if (bin === currentItem.correctBin) {
      setSimStreak((s) => s + 1);
      setSimAnswerResult({
        isCorrect: true,
        text: `Correto! ${currentItem.explanation}`,
      });
      onEarnPoints(25, `Acertou a triagem de "${currentItem.name}" no simulador`);
    } else {
      setSimAnswerResult({
        isCorrect: false,
        text: `Não é aí! ${currentItem.explanation}`,
      });
    }
  };

  const handleNextSimItem = () => {
    setSimAnswerResult(null);
    setCurrentSimIndex((idx) => (idx + 1) % simulatorItems.length);
  };

  const getIconForCategory = (cat: string) => {
    switch (cat) {
      case 'plastico':
        return <Package className="w-4 h-4 text-emerald-700" />;
      case 'papel':
        return <FileText className="w-4 h-4 text-blue-700" />;
      case 'vidro':
        return <Wine className="w-4 h-4 text-amber-700" />;
      case 'metal':
        return <Cpu className="w-4 h-4 text-slate-700" />;
      case 'oleo':
        return <Droplet className="w-4 h-4 text-amber-600" />;
      case 'eletronico':
        return <Smartphone className="w-4 h-4 text-purple-700" />;
      case 'medicamento':
        return <Pill className="w-4 h-4 text-rose-700" />;
      case 'organico':
        return <Apple className="w-4 h-4 text-green-700" />;
      default:
        return <BookOpen className="w-4 h-4 text-stone-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Instant Search Bar */}
      <section className="bg-white rounded-2xl border border-stone-200/90 p-5 sm:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-stone-500 mb-1.5">
              <span>Manual Prático de Triagem Doméstica</span>
              <span aria-hidden="true">·</span>
              <span className="text-[#1B5223] font-semibold">Ipatinga Sustentável</span>
              <span aria-hidden="true">·</span>
              <span>COOPERCAVA</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#142816] tracking-tight">
              Guia de Triagem & Descarte Correto
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-2xl leading-relaxed">
              Descubra se aquele item do seu dia a dia pode ser reciclado, como prepará-lo para evitar contaminar o lote e onde entregar com responsabilidade em Ipatinga.
            </p>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-80 shrink-0">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Pesquisar material ou embalagem..."
              className="w-full pl-9 pr-8 py-2 bg-stone-50 text-stone-900 border border-stone-200 rounded-xl text-xs placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-[#143D1A] transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Quick query chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-4 mt-4 border-t border-stone-100 text-xs">
          <span className="text-[11px] text-stone-400 shrink-0 font-medium">Dúvidas Frequentes:</span>
          {quickQueries.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => setSearchQuery(q)}
              className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-[11px] whitespace-nowrap transition-colors cursor-pointer"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-3 border-t border-stone-100 mt-3 no-scrollbar">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#143D1A] text-white font-semibold shadow-xs'
                    : 'bg-stone-100 hover:bg-stone-200/70 text-stone-600 hover:text-stone-900 border border-stone-200/60'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Interactive Triage Simulator (Mobbin Learning Pattern) */}
      <section className="bg-[#143D1A] text-white rounded-2xl p-5 sm:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] text-[#8CE28A] uppercase font-bold tracking-wider font-mono-code">
                Desafio Interativo · Aprenda Praticando
              </span>
              <span className="text-white/40">·</span>
              <span className="text-[11px] text-white/80">Acertos: {simStreak}</span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white">
              Simulador de Descarte: Para onde vai este resíduo?
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleNextSimItem}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Outro Resíduo</span>
            </button>
          </div>
        </div>

        {/* Current challenge card */}
        <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-xl p-4 sm:p-5 mb-4">
          <div className="flex items-center justify-between text-xs text-white/70 mb-1">
            <span>Item a ser descartado agora:</span>
            <span className="font-mono-code text-[11px]">
              Item {currentSimIndex + 1} de {simulatorItems.length}
            </span>
          </div>
          <div className="text-lg sm:text-xl font-bold text-white tracking-tight">
            {simulatorItems[currentSimIndex].name}
          </div>
          <p className="text-xs text-white/80 mt-1">
            Toque na lixeira ou ponto correto para destinar este resíduo:
          </p>

          {/* 4 Bins Choices */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4">
            <button
              type="button"
              onClick={() => handleSimulateTriage('reciclavel')}
              className="p-3 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-400/40 text-left transition-all cursor-pointer group"
            >
              <Recycle className="w-5 h-5 text-emerald-400 mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-white block">Reciclável Seco</span>
              <span className="text-[10px] text-white/70 block">Coleta Seletiva</span>
            </button>

            <button
              type="button"
              onClick={() => handleSimulateTriage('organico')}
              className="p-3 rounded-xl bg-amber-700/30 hover:bg-amber-700/50 border border-amber-400/40 text-left transition-all cursor-pointer group"
            >
              <Apple className="w-5 h-5 text-amber-400 mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-white block">Comum / Orgânico</span>
              <span className="text-[10px] text-white/70 block">Coleta Domiciliar</span>
            </button>

            <button
              type="button"
              onClick={() => handleSimulateTriage('ecoponto')}
              className="p-3 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-400/40 text-left transition-all cursor-pointer group"
            >
              <Smartphone className="w-5 h-5 text-purple-300 mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-white block">Ecoponto SESUMA</span>
              <span className="text-[10px] text-white/70 block">Eletrônicos / Entulho</span>
            </button>

            <button
              type="button"
              onClick={() => handleSimulateTriage('farmacia')}
              className="p-3 rounded-xl bg-rose-600/30 hover:bg-rose-600/50 border border-rose-400/40 text-left transition-all cursor-pointer group"
            >
              <Pill className="w-5 h-5 text-rose-300 mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-white block">Farmácia / UBS</span>
              <span className="text-[10px] text-white/70 block">Totem Verde</span>
            </button>
          </div>

          {/* Feedback banner */}
          {simAnswerResult && (
            <div
              className={`mt-4 p-3.5 rounded-xl border flex items-start gap-2.5 text-xs animate-in fade-in duration-200 ${
                simAnswerResult.isCorrect
                  ? 'bg-emerald-950/60 border-emerald-400 text-emerald-100'
                  : 'bg-rose-950/60 border-rose-400 text-rose-100'
              }`}
            >
              {simAnswerResult.isCorrect ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p className="leading-relaxed font-medium">{simAnswerResult.text}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[11px] text-white/80 font-mono-code">
                    {simAnswerResult.isCorrect ? '+25 EcoPontos Conquistados!' : 'Tente novamente no próximo.'}
                  </span>
                  <button
                    type="button"
                    onClick={handleNextSimItem}
                    className="px-3 py-1 bg-white text-[#142816] rounded-lg text-xs font-bold hover:bg-stone-100 cursor-pointer"
                  >
                    Próximo Resíduo &rarr;
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Materials Directory Grid */}
      <section className="space-y-3">
        <div className="flex items-center justify-between text-xs text-stone-500">
          <span className="font-semibold text-stone-800">
            Catálogo de Resíduos ({filteredGuides.length} materiais)
          </span>
          <span>Clique em um cartão para ver como preparar</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGuides.map((guide) => {
            return (
              <article
                key={guide.id}
                onClick={() => setActiveItemModal(guide)}
                className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:border-[#143D1A] transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] text-stone-500 mb-2">
                    <span className="capitalize font-medium flex items-center gap-1.5">
                      {getIconForCategory(guide.category)}
                      <span>{guide.category}</span>
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        guide.recyclable
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-stone-100 text-stone-700 border border-stone-200'
                      }`}
                    >
                      {guide.recyclable ? '100% Reciclável' : 'Resíduo Especial'}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-stone-900 group-hover:text-[#143D1A] transition-colors leading-tight mb-2">
                    {guide.name}
                  </h4>

                  <p className="text-xs text-stone-500 leading-relaxed line-clamp-2">
                    {guide.howToPrepare[0]}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-100 text-xs flex items-center justify-between text-stone-600">
                  <span className="text-[11px] text-stone-500 truncate max-w-[200px]">
                    Destino: {guide.whereToDispose.split('(')[0]}
                  </span>
                  <span className="text-[#143D1A] font-bold text-xs group-hover:translate-x-0.5 transition-transform">
                    &rarr;
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Item Detail Modal */}
      {activeItemModal && (
        <div className="fixed inset-0 z-50 bg-[#142816]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#143D1A]/10 text-[#143D1A] flex items-center justify-center font-bold">
                  {getIconForCategory(activeItemModal.category)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#142816]">{activeItemModal.name}</h3>
                  <span className="text-xs text-stone-500 capitalize">
                    Categoria: {activeItemModal.category}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveItemModal(null)}
                className="text-stone-400 hover:text-stone-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <span className="font-semibold text-stone-800 block mb-1">
                  Passo a Passo de Preparação:
                </span>
                <ul className="space-y-1.5">
                  {activeItemModal.howToPrepare.map((step, idx) => (
                    <li
                      key={idx}
                      className="p-2 rounded-lg bg-stone-50 border border-stone-200/80 text-stone-700 flex items-start gap-2"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <span className="font-semibold text-stone-800 block mb-1">Onde Descartar:</span>
                <p className="p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-200 text-emerald-900 leading-relaxed">
                  {activeItemModal.whereToDispose}
                </p>
              </div>

              <div>
                <span className="font-semibold text-rose-800 block mb-1">
                  Erros Comuns a Evitar:
                </span>
                <p className="p-2.5 rounded-lg bg-rose-50/60 border border-rose-200 text-rose-900 leading-relaxed">
                  {activeItemModal.commonMistakes}
                </p>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setActiveItemModal(null)}
                className="w-full py-2.5 bg-[#143D1A] text-white rounded-xl font-bold hover:bg-[#1B5223] transition-colors cursor-pointer text-xs shadow-xs"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
