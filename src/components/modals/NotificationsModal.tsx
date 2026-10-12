import React, { useState } from 'react';
import { Bell, X, Calendar, AlertTriangle, CheckCircle2, Sparkles, Truck, Check } from 'lucide-react';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  neighborhood: string;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  neighborhood,
}) => {
  const [filter, setFilter] = useState<'todos' | 'coleta' | 'campanhas'>('todos');

  if (!isOpen) return null;

  const notifications = [
    {
      id: 1,
      title: 'Coleta Seletiva Passa Hoje à Tarde!',
      desc: 'Caminhão da cooperativa COOPERCAVA no seu bairro a partir das 13h. Coloque os sacos azuis ou transparentes na calçada.',
      time: 'Há 1 hora',
      category: 'coleta',
      unread: true,
    },
    {
      id: 2,
      title: 'Campanha Óleo Limpo Vale do Aço',
      desc: 'Entregue 2 litros de óleo usado no ponto parceiro do Hipermercado Iguaçu e receba 30 EcoPontos mais barra de sabão ecológico.',
      time: 'Hoje cedo',
      category: 'campanhas',
      unread: true,
    },
    {
      id: 3,
      title: 'Mutirão Verde no Parque Ipanema',
      desc: 'Plantio de ipês e limpeza comunitária das margens do Ribeirão Ipanema neste domingo às 08h30. Luvas e sacos fornecidos.',
      time: 'Ontem',
      category: 'campanhas',
      unread: false,
    },
    {
      id: 4,
      title: 'Operação Cata-Treco Municipal',
      desc: 'Agendamentos da semana abertos para retirada gratuita de sofás velhos, eletrodomésticos e restos de podas na sua região.',
      time: 'Há 2 dias',
      category: 'coleta',
      unread: false,
    },
  ];

  const filtered = notifications.filter(
    (n) => filter === 'todos' || n.category === filter
  );

  return (
    <div className="fixed inset-0 z-50 bg-[#142816]/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-150 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-stone-100 text-[#143D1A] flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#142816]">Notificações Municipais</h3>
              <p className="text-xs text-stone-500">{neighborhood.split('—')[0].trim()}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl text-xs">
          {[
            { id: 'todos', label: 'Todas' },
            { id: 'coleta', label: 'Coletas' },
            { id: 'campanhas', label: 'Campanhas' },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setFilter(t.id as typeof filter)}
              className={`flex-1 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                filter === t.id
                  ? 'bg-white text-stone-900 shadow-xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Notification Items */}
        <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
          {filtered.map((notif) => (
            <div
              key={notif.id}
              className={`p-3.5 rounded-xl border text-xs transition-colors space-y-1 ${
                notif.unread
                  ? 'bg-emerald-50/40 border-emerald-200/80'
                  : 'bg-stone-50/70 border-stone-200/70'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-stone-900 flex items-center gap-1.5">
                  {notif.unread && (
                    <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
                  )}
                  <span>{notif.title}</span>
                </span>
                <span className="text-[10px] text-stone-400 font-mono-code">{notif.time}</span>
              </div>
              <p className="text-stone-600 leading-relaxed text-[11px]">{notif.desc}</p>
            </div>
          ))}
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 bg-[#143D1A] hover:bg-[#1B5223] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
          >
            Fechar Notificações
          </button>
        </div>
      </div>
    </div>
  );
};
