import React, { useState } from 'react';
import {
  Sparkles,
  X,
  Send,
  Bot,
  MapPin,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { RECYCLING_GUIDES, DISPOSAL_POINTS } from '../../data/mockEcoData';
import { DisposalPoint } from '../../types/ecoapp';

interface EcoAIModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPointOnMap: (point: DisposalPoint) => void;
  onOpenSchedule: () => void;
  neighborhood?: string;
}

export const EcoAIModal: React.FC<EcoAIModalProps> = ({
  isOpen,
  onClose,
  onSelectPointOnMap,
  onOpenSchedule,
  neighborhood,
}) => {
  const [messages, setMessages] = useState<
    {
      id: string;
      sender: 'user' | 'ai';
      text: string;
      matchedPoints?: DisposalPoint[];
      scheduleAction?: boolean;
      preparationTip?: string;
    }[]
  >([
    {
      id: 'init-1',
      sender: 'ai',
      text: 'Olá! Sou a EcoIA, sua inteligência artificial oficial de sustentabilidade e descarte em Ipatinga. Pode me perguntar qualquer dúvida sobre reciclagem, descarte de móveis, eletrônicos, óleo, podas, ou regras da cidade.',
    },
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  if (!isOpen) return null;

  const handleQuery = async (queryText: string) => {
    if (!queryText.trim() || isTyping) return;

    const userMsgId = `user-${Date.now()}`;
    const cleanQ = queryText.trim();

    setMessages((prev) => [
      ...prev,
      { id: userMsgId, sender: 'user', text: cleanQ },
    ]);
    setInputQuery('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: cleanQ,
          neighborhood: neighborhood || 'Ipatinga - MG',
          history: messages.slice(-6),
        }),
      });

      if (!res.ok) {
        throw new Error(`Falha no servidor: ${res.status}`);
      }

      const data = await res.json();

      let matchedPoints: DisposalPoint[] = [];
      if (Array.isArray(data.recommendedPointIds) && data.recommendedPointIds.length > 0) {
        matchedPoints = DISPOSAL_POINTS.filter((p) =>
          data.recommendedPointIds.includes(p.id)
        );
      }

      if (matchedPoints.length === 0) {
        const lower = cleanQ.toLowerCase();
        if (lower.includes('oleo') || lower.includes('óleo')) {
          matchedPoints = DISPOSAL_POINTS.filter((p) => p.category.includes('oleo'));
        } else if (lower.includes('remedio') || lower.includes('remédio')) {
          matchedPoints = DISPOSAL_POINTS.filter((p) => p.category.includes('medicamentos'));
        } else if (lower.includes('moveis') || lower.includes('sofá') || lower.includes('sofa') || lower.includes('entulho')) {
          matchedPoints = DISPOSAL_POINTS.filter((p) => p.category.includes('moveis_entulho'));
        } else {
          matchedPoints = DISPOSAL_POINTS.slice(0, 2);
        }
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: data.reply || 'Informação processada com sucesso.',
          matchedPoints,
          scheduleAction: Boolean(data.suggestSchedule),
          preparationTip: data.preparationTip || undefined,
        },
      ]);
    } catch (err) {
      console.warn('Fallback ativado para EcoIA:', err);
      // Resilient fallback with municipal database
      const cleanLower = cleanQ.toLowerCase();
      const matchedGuide = RECYCLING_GUIDES.find(
        (g) =>
          g.searchAliases.some((alias) => cleanLower.includes(alias)) ||
          cleanLower.includes(g.name.toLowerCase()) ||
          cleanLower.includes(g.category)
      );

      let responseText = '';
      let matchedPoints: DisposalPoint[] = [];
      let scheduleAction = false;
      let preparationTip = '';

      if (matchedGuide) {
        if (matchedGuide.category === 'moveis' || cleanLower.includes('sofa') || cleanLower.includes('colchao')) {
          responseText = `Móveis volumosos como ${matchedGuide.name} não devem ser colocados na calçada sem agendamento. Você pode solicitar o Cata-Treco gratuito da SESUMA ou levar a um Ecoponto Municipal.`;
          matchedPoints = DISPOSAL_POINTS.filter((p) => p.category.includes('moveis_entulho')).slice(0, 2);
          scheduleAction = true;
          preparationTip = matchedGuide.howToPrepare[0];
        } else if (matchedGuide.category === 'oleo' || cleanLower.includes('oleo') || cleanLower.includes('gordura')) {
          responseText = `Óleo de cozinha NUNCA deve ir na pia ou vaso para não poluir o Ribeirão Ipanema. Armazene frio em garrafa PET transparente e leve a um dos pontos parceiros em Ipatinga (cada 2L rende 30 EcoPontos).`;
          matchedPoints = DISPOSAL_POINTS.filter((p) => p.category.includes('oleo')).slice(0, 2);
          preparationTip = matchedGuide.howToPrepare.join(' ');
        } else if (matchedGuide.category === 'eletronico' || cleanLower.includes('tv') || cleanLower.includes('celular')) {
          responseText = `${matchedGuide.name} contém componentes recicláveis e metais pesados. Deve ser entregue nos Ecopontos SESUMA ou na cooperativa COOPERCAVA.`;
          matchedPoints = DISPOSAL_POINTS.filter((p) => p.category.includes('eletronicos')).slice(0, 2);
          preparationTip = matchedGuide.howToPrepare[0];
        } else if (matchedGuide.category === 'medicamento' || cleanLower.includes('remedio')) {
          responseText = `Remédios vencidos e cartelas devem ser descartados exclusivamente nos Totens Verdes em farmácias ou Unidades Básicas de Saúde (UBS) de Ipatinga.`;
          matchedPoints = DISPOSAL_POINTS.filter((p) => p.category.includes('medicamentos')).slice(0, 2);
          preparationTip = matchedGuide.howToPrepare[0];
        } else {
          responseText = `${matchedGuide.name} pode ser descartado na Coleta Seletiva ou entregue diretamente no Ecoponto/COOPERCAVA em Ipatinga.`;
          matchedPoints = DISPOSAL_POINTS.filter((p) => p.category.includes('reciclavel_comum')).slice(0, 2);
          preparationTip = matchedGuide.howToPrepare[0];
        }
      } else {
        responseText = `Compreendi sua dúvida sobre "${cleanQ}". Para materiais diversos em Ipatinga, os Ecopontos Municipais (Cidade Nobre, Bethânia e Esperança) e a COOPERCAVA no Planalto/Limoeiro são os locais recomendados.`;
        matchedPoints = [DISPOSAL_POINTS[0], DISPOSAL_POINTS[1]];
        preparationTip = 'Mantenha os resíduos separados, limpos e secos antes do descarte.';
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: responseText,
          matchedPoints,
          scheduleAction,
          preparationTip,
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const quickPrompts = [
    'Tenho um sofá velho',
    'Onde jogar óleo de cozinha?',
    'Onde levar televisão quebrada?',
    'Como descartar remédio vencido?',
    'Tenho entulho de obra',
  ];

  return (
    <div className="fixed inset-0 z-50 bg-[#142816]/65 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-stone-200 flex flex-col h-[560px] animate-in fade-in zoom-in-95 duration-150 overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#143D1A] text-[#8CE28A] flex items-center justify-center shadow-xs">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-bold text-stone-900">EcoIA · Assistente de Descarte</h3>
                <span className="text-[10px] font-mono-code font-bold bg-[#8CE28A]/20 text-[#143D1A] px-2 py-0.2 rounded-full">
                  OFICIAL
                </span>
              </div>
              <p className="text-[11px] text-stone-500">
                Base de conhecimento municipal · SESUMA Ipatinga
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages Body */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-[#F9FAF8]">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[88%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-[#143D1A] text-white rounded-br-xs shadow-xs font-medium'
                    : 'bg-white text-stone-800 border border-stone-200/80 rounded-bl-xs shadow-xs space-y-2.5'
                }`}
              >
                <p>{m.text}</p>

                {/* Preparation Tip if provided */}
                {m.preparationTip && (
                  <div className="p-2 rounded-xl bg-stone-50 border border-stone-200/70 text-[11px] text-stone-600 flex items-start gap-1.5">
                    <Info className="w-3.5 h-3.5 text-[#143D1A] shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-stone-800">Como preparar:</strong> {m.preparationTip}
                    </span>
                  </div>
                )}

                {/* Suggested Points Cards */}
                {m.matchedPoints && m.matchedPoints.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] uppercase font-bold text-stone-400 font-mono-code block">
                      Opções Próximas em Ipatinga:
                    </span>
                    {m.matchedPoints.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          onClose();
                          onSelectPointOnMap(p);
                        }}
                        className="w-full text-left p-2.5 rounded-xl border border-stone-200 bg-stone-50/70 hover:bg-[#143D1A]/5 hover:border-[#143D1A] transition-all flex items-center justify-between cursor-pointer group"
                      >
                        <div className="min-w-0 pr-2">
                          <span className="font-bold text-stone-900 block truncate text-xs group-hover:text-[#143D1A]">
                            {p.name}
                          </span>
                          <span className="text-[11px] text-stone-500 font-mono-code">
                            {p.distance} · {p.hours.split('·')[0]}
                          </span>
                        </div>
                        <span className="text-xs font-semibold text-[#143D1A] shrink-0 flex items-center gap-1">
                          <span>Ver no Mapa</span>
                          <ArrowRight className="w-3 h-3" />
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Direct Cata-Treco shortcut button if applicable */}
                {m.scheduleAction && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenSchedule();
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-[#143D1A] text-white font-bold text-[11px] flex items-center justify-center gap-1.5 cursor-pointer hover:bg-[#1B5223]"
                  >
                    <span>Agendar Retirada pelo Cata-Treco (SESUMA)</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-1.5 p-3 max-w-[120px] rounded-2xl bg-white border border-stone-200 text-stone-400 text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-stone-400 animate-pulse" />
              <span className="w-1.5 h-1.5 rounded-full bg-stone-400 animate-pulse delay-75" />
              <span className="w-1.5 h-1.5 rounded-full bg-stone-400 animate-pulse delay-150" />
              <span className="text-[11px]">Consultando...</span>
            </div>
          )}
        </div>

        {/* Suggested Quick Prompts */}
        <div className="px-4 py-2 border-t border-stone-100 bg-white flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
          {quickPrompts.map((qp) => (
            <button
              key={qp}
              type="button"
              onClick={() => handleQuery(qp)}
              className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-[11px] whitespace-nowrap transition-colors cursor-pointer"
            >
              {qp}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleQuery(inputQuery);
          }}
          className="p-3 border-t border-stone-100 bg-white flex items-center gap-2"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Ex: Tenho uma geladeira velha, onde levar?..."
            className="flex-1 px-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#143D1A]"
          />
          <button
            type="submit"
            disabled={!inputQuery.trim()}
            className="p-2.5 bg-[#143D1A] text-white rounded-xl hover:bg-[#1B5223] transition-colors cursor-pointer shrink-0 disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
