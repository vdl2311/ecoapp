import React, { useState } from 'react';
import {
  Users,
  Calendar,
  MapPin,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Send,
  Heart,
  Share2,
  CalendarCheck,
  Check,
} from 'lucide-react';
import { CommunityEvent } from '../../types/ecoapp';
import { COMMUNITY_EVENTS } from '../../data/mockEcoData';

interface CommunityViewProps {
  onEarnPoints: (pts: number, reason: string) => void;
  neighborhood: string;
}

export const CommunityView: React.FC<CommunityViewProps> = ({ onEarnPoints, neighborhood }) => {
  const [events, setEvents] = useState<CommunityEvent[]>(COMMUNITY_EVENTS);
  const [toast, setToast] = useState<string | null>(null);

  // Community tips forum
  const [tips, setTips] = useState([
    {
      id: 'tip-1',
      author: 'Luciana M. (Moradora no Cidade Nobre)',
      text: 'A Feirarte dos sábados no Parque Ipanema agora tem um estande que recolhe embalagens plásticas limpas de ovos para pequenos produtores rurais reutilizarem!',
      time: 'Há 2 horas',
      likes: 14,
      hasLiked: false,
    },
    {
      id: 'tip-2',
      author: 'Seu Agenor (Horta Comunitária do Cariru)',
      text: 'Temos adubo orgânico pronto e peneirado da compostagem da praça para quem quiser buscar neste fim de semana. Tragam seus baldinhos de casa!',
      time: 'Ontem',
      likes: 22,
      hasLiked: true,
    },
  ]);
  const [newTipText, setNewTipText] = useState('');

  const handleToggleJoin = (id: string, title: string) => {
    setEvents((prev) =>
      prev.map((ev) => {
        if (ev.id === id) {
          const nextJoined = !ev.joined;
          if (nextJoined) {
            onEarnPoints(30, `Confirmou presença no evento: ${title}`);
            setToast(`Presença confirmada em "${title}"! +30 EcoPontos conquistados.`);
          } else {
            setToast(`Inscrição cancelada para "${title}".`);
          }
          return {
            ...ev,
            joined: nextJoined,
            participantsCount: nextJoined ? ev.participantsCount + 1 : ev.participantsCount - 1,
          };
        }
        return ev;
      })
    );
    setTimeout(() => setToast(null), 4000);
  };

  const handleAddTip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTipText.trim()) return;

    const newTip = {
      id: `tip-${Date.now()}`,
      author: `Você (${neighborhood.split('—')[0].trim()})`,
      text: newTipText.trim(),
      time: 'Agora mesmo',
      likes: 1,
      hasLiked: true,
    };

    setTips([newTip, ...tips]);
    setNewTipText('');
    onEarnPoints(15, 'Compartilhou dica sustentável com a comunidade');
    setToast('Dica compartilhada no mural de Ipatinga! (+15 EcoPontos)');
    setTimeout(() => setToast(null), 4000);
  };

  const handleLikeTip = (id: string) => {
    setTips((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const nextLiked = !t.hasLiked;
          return {
            ...t,
            likes: nextLiked ? t.likes + 1 : t.likes - 1,
            hasLiked: nextLiked,
          };
        }
        return t;
      })
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <section className="bg-white rounded-2xl border border-stone-200/90 p-5 sm:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-stone-500 mb-1.5">
              <span>Mobilização Ecológica do Vale do Aço</span>
              <span aria-hidden="true">·</span>
              <span className="text-[#1B5223] font-semibold">Parque Ipanema & Bairros</span>
              <span aria-hidden="true">·</span>
              <span>Comunidade Ativa</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#142816] tracking-tight">
              Eventos, Feirarte & Mural do Bairro
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-2xl leading-relaxed">
              Encontros ecológicos no Parque Ipanema, mutirões de preservação nas margens do Ribeirão Ipanema e troca de experiências sustentáveis entre moradores de Ipatinga.
            </p>
          </div>
        </div>

        {/* Feedback message */}
        {toast && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2 animate-in fade-in duration-150">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{toast}</span>
          </div>
        )}
      </section>

      {/* Events Agenda Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#142816]">
              Próximos Eventos & Mutirões Comunitários
            </h2>
            <p className="text-xs text-stone-500">Participe e acumule pontos enquanto cuida da nossa cidade</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {events.map((ev) => (
            <article
              key={ev.id}
              className={`bg-white rounded-2xl border p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between transition-all ${
                ev.joined
                  ? 'border-[#143D1A] bg-[#143D1A]/5 ring-1 ring-[#143D1A]/20'
                  : 'border-stone-200/90 hover:border-[#143D1A]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
                  <span className="capitalize font-mono-code font-bold text-[#143D1A] text-[11px]">
                    {ev.category.toUpperCase()}
                  </span>
                  <span className="font-mono-code text-[11px] text-stone-600 font-semibold">
                    {ev.participantsCount} confirmados
                  </span>
                </div>

                <h3 className="text-sm sm:text-base font-bold text-stone-900 leading-snug mb-2">
                  {ev.title}
                </h3>

                <p className="text-xs text-stone-500 leading-relaxed mb-4">{ev.description}</p>

                <div className="space-y-1.5 pt-3 border-t border-stone-100 text-xs text-stone-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-[#143D1A] shrink-0" />
                    <span className="font-medium text-stone-800">{ev.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    <span>{ev.time}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                    <span className="text-[11px] leading-relaxed">{ev.location}</span>
                  </div>
                </div>
              </div>

              {/* RSVP Action */}
              <div className="mt-5 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => handleToggleJoin(ev.id, ev.title)}
                  className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    ev.joined
                      ? 'bg-emerald-700 text-white shadow-xs hover:bg-emerald-800'
                      : 'bg-[#143D1A] text-white hover:bg-[#1B5223] shadow-xs'
                  }`}
                >
                  {ev.joined ? (
                    <>
                      <Check className="w-4 h-4 text-[#8CE28A]" />
                      <span>Presença Confirmada (+30 pts)</span>
                    </>
                  ) : (
                    <>
                      <CalendarCheck className="w-4 h-4 text-[#8CE28A]" />
                      <span>Confirmar Presença (+30 pts)</span>
                    </>
                  )}
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Community Notice Board (Mural do Bairro) */}
      <section className="bg-white rounded-2xl border border-stone-200/90 p-5 sm:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-5">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-[#142816]">
            Mural Comunitário: Dicas & Conexões
          </h2>
          <p className="text-xs text-stone-500">
            Compartilhe práticas sustentáveis, doação de recipientes ou feiras locais
          </p>
        </div>

        {/* Form to submit a tip */}
        <form onSubmit={handleAddTip} className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={newTipText}
            onChange={(e) => setNewTipText(e.target.value)}
            placeholder="Escreva uma dica sustentável para os moradores de Ipatinga..."
            className="flex-1 px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-[#143D1A]"
          />
          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-[#143D1A] hover:bg-[#1B5223] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
          >
            <Send className="w-3.5 h-3.5 text-[#8CE28A]" />
            <span>Publicar Dica (+15 pts)</span>
          </button>
        </form>

        {/* Tips list */}
        <div className="space-y-3 pt-2">
          {tips.map((tip) => (
            <div
              key={tip.id}
              className="p-4 rounded-xl border border-stone-200/80 bg-stone-50/50 flex flex-col justify-between space-y-2 text-xs"
            >
              <div className="flex items-center justify-between text-[11px] text-stone-500">
                <span className="font-semibold text-stone-800">{tip.author}</span>
                <span className="font-mono-code text-[10px] text-stone-400">{tip.time}</span>
              </div>

              <p className="text-stone-700 leading-relaxed text-xs">{tip.text}</p>

              <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleLikeTip(tip.id)}
                  className={`flex items-center gap-1.5 text-[11px] transition-colors cursor-pointer ${
                    tip.hasLiked ? 'text-rose-600 font-semibold' : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  <Heart
                    className={`w-3.5 h-3.5 ${
                      tip.hasLiked ? 'fill-rose-500 text-rose-500' : 'text-stone-400'
                    }`}
                  />
                  <span>{tip.likes} curtidas de vizinhos</span>
                </button>

                <span className="text-[10px] text-stone-400">Ipatinga Sustentável</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
