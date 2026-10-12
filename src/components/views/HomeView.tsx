import React from 'react';
import {
  MapPin,
  Calendar,
  Gift,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Leaf,
  Clock,
  ChevronRight,
  TrendingUp,
  Search,
  Droplet,
  Recycle,
  Truck,
  Heart,
  Bot,
} from 'lucide-react';
import { DisposalPoint, EcoMainTab, UserProfile } from '../../types/ecoapp';
import { DISPOSAL_POINTS } from '../../data/mockEcoData';
import { PWAInstallPrompt } from '../PWAInstallPrompt';

interface HomeViewProps {
  neighborhood: string;
  onNavigate: (tab: EcoMainTab) => void;
  onSelectPoint: (point: DisposalPoint) => void;
  onOpenAI: () => void;
  favorites: string[];
  currentUser?: UserProfile;
  onOpenLogin?: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  neighborhood,
  onNavigate,
  onSelectPoint,
  onOpenAI,
  favorites,
  currentUser,
  onOpenLogin,
}) => {
  // Show 3 nearest drop-off points
  const nearbyPoints = DISPOSAL_POINTS.slice(0, 3);

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-150">
      {/* Welcome Hero: Clean & Direct */}
      <section className="bg-white rounded-3xl border border-stone-200/90 p-6 sm:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.02)] relative overflow-hidden">
        {/* Soft background ambient gradient */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#8CE28A]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs text-stone-500 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[#143D1A] font-semibold">{neighborhood.split('—')[0].trim()}</span>
              <span aria-hidden="true">·</span>
              <span>Ipatinga, Vale do Aço</span>
            </div>

            {onOpenLogin && (
              <button
                type="button"
                onClick={onOpenLogin}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-stone-100 hover:bg-stone-200/80 text-stone-700 text-xs font-semibold cursor-pointer border border-stone-200/80 transition-colors"
              >
                {currentUser?.isLoggedIn ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="truncate max-w-[120px]">
                      {currentUser.name.split(' ')[0]} ({currentUser.role === 'agent' ? 'SESUMA' : currentUser.role === 'merchant' ? 'Comércio' : 'Morador'})
                    </span>
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span>Entrar / Login</span>
                  </>
                )}
              </button>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#142816] tracking-tight">
            {currentUser?.isLoggedIn ? `Olá, ${currentUser.name.split(' ')[0]}!` : 'Como podemos ajudar você hoje?'}
          </h1>
          {currentUser?.isLoggedIn && (
            <p className="text-xs text-emerald-800 font-semibold">
              {currentUser.role === 'merchant'
                ? `Painel de Comerciante: ${currentUser.businessName || 'Estabelecimento Parceiro'}`
                : currentUser.role === 'agent'
                ? 'Painel Institucional SESUMA · Fiscalização & Coletas'
                : 'Como podemos ajudar você hoje com seus resíduos?'}
            </p>
          )}

          <p className="text-xs sm:text-sm text-stone-500 leading-relaxed">
            Selecione uma ação rápida para descartar resíduos no local correto, solicitar o caminhão de cata-treco ou doar objetos reutilizáveis aos seus vizinhos.
          </p>

          {/* Quick AI search trigger banner */}
          <div className="pt-3">
            <button
              type="button"
              onClick={onOpenAI}
              className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-[#143D1A]/5 hover:bg-[#143D1A]/10 border border-[#143D1A]/15 text-[#143D1A] text-xs font-semibold flex items-center justify-between sm:justify-start gap-2.5 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-[#143D1A]" />
                <span>Dúvida sobre algum resíduo? Consulte a EcoIA oficial</span>
              </div>
              <span className="text-[10px] bg-[#143D1A] text-white px-2 py-0.5 rounded-md font-mono-code font-bold group-hover:translate-x-0.5 transition-transform">
                Perguntar &rarr;
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Mobile PWA Install Banner (Hides automatically once installed or dismissed) */}
      <PWAInstallPrompt variant="banner" />

      {/* 4 Main Action Cards Grid (Central Core of New Home) */}
      <section aria-label="Ações Principais">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
          {/* Action 1: Descartar (Featured Core Button) */}
          <button
            type="button"
            onClick={() => onNavigate('dispose')}
            className="p-5 sm:p-6 rounded-3xl bg-[#143D1A] text-white shadow-md hover:bg-[#1B5223] transition-all text-left flex flex-col justify-between group cursor-pointer ring-2 ring-[#8CE28A]/30 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#8CE28A]/15 rounded-full blur-xl pointer-events-none" />

            <div className="relative z-10 flex items-start justify-between">
              <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-2xl shadow-xs">
                ♻️
              </div>
              <span className="text-[10px] font-mono-code font-bold uppercase tracking-wider bg-[#8CE28A] text-[#143D1A] px-2.5 py-0.5 rounded-full">
                Mais Usado
              </span>
            </div>

            <div className="relative z-10 mt-5">
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center justify-between">
                <span>Descartar Resíduo</span>
                <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
              </h2>
              <p className="text-xs text-white/80 mt-1 leading-relaxed">
                Descubra onde levar sofá, óleo, eletrônicos, pilhas, remédios e recicláveis com mapa e rota.
              </p>
            </div>
          </button>

          {/* Action 2: Solicitar Coleta (Cata-Treco SESUMA) */}
          <button
            type="button"
            onClick={() => onNavigate('calendar')}
            className="p-5 sm:p-6 rounded-3xl bg-white text-stone-900 border border-stone-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:border-[#143D1A] transition-all text-left flex flex-col justify-between group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-2xl flex items-center justify-center shadow-xs">
              🚛
            </div>

            <div className="mt-5">
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-stone-900 flex items-center justify-between group-hover:text-[#143D1A] transition-colors">
                <span>Solicitar Coleta</span>
                <span className="group-hover:translate-x-1 transition-transform text-stone-400 group-hover:text-[#143D1A]">
                  &rarr;
                </span>
              </h2>
              <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                Agende a retirada gratuita do Cata-Treco ou consulte o calendário semanal do seu bairro.
              </p>
            </div>
          </button>

          {/* Action 3: Doar (Economia Circular) */}
          <button
            type="button"
            onClick={() => onNavigate('donate')}
            className="p-5 sm:p-6 rounded-3xl bg-white text-stone-900 border border-stone-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:border-[#143D1A] transition-all text-left flex flex-col justify-between group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-2xl flex items-center justify-center shadow-xs">
              🎁
            </div>

            <div className="mt-5">
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-stone-900 flex items-center justify-between group-hover:text-[#143D1A] transition-colors">
                <span>Doar & Trocar</span>
                <span className="group-hover:translate-x-1 transition-transform text-stone-400 group-hover:text-[#143D1A]">
                  &rarr;
                </span>
              </h2>
              <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                Encontre vizinhos ou instituições beneficentes (como a APAE) para doar objetos ainda utilizáveis.
              </p>
            </div>
          </button>

          {/* Action 4: Fiscalizar (Zeladoria Cidadã) */}
          <button
            type="button"
            onClick={() => onNavigate('report')}
            className="p-5 sm:p-6 rounded-3xl bg-white text-stone-900 border border-stone-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:border-[#143D1A] transition-all text-left flex flex-col justify-between group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-2xl flex items-center justify-center shadow-xs">
              🚨
            </div>

            <div className="mt-5">
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-stone-900 flex items-center justify-between group-hover:text-[#143D1A] transition-colors">
                <span>Fiscalizar & Reportar</span>
                <span className="group-hover:translate-x-1 transition-transform text-stone-400 group-hover:text-[#143D1A]">
                  &rarr;
                </span>
              </h2>
              <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                Fotografe e comunique descarte irregular de entulho, queima de podas ou bueiros obstruídos à SESUMA.
              </p>
            </div>
          </button>
        </div>
      </section>

      {/* Impact of the Neighborhood & Community Progress */}
      <section className="bg-white rounded-3xl border border-stone-200/90 p-5 sm:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
          <div>
            <div className="flex items-center gap-2 text-xs text-stone-500">
              <span className="font-mono-code font-bold uppercase tracking-wider text-stone-600">
                Painel Cidadão
              </span>
              <span>·</span>
              <span className="text-[#143D1A] font-semibold">{neighborhood.split('—')[0].trim()}</span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-stone-900 tracking-tight mt-0.5">
              Impacto Ambiental do seu Bairro
            </h2>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('profile')}
            className="text-xs font-semibold text-[#143D1A] hover:underline cursor-pointer flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Ver ranking dos bairros</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 3 Visual Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/70 space-y-1">
            <div className="flex items-center justify-between text-stone-500 text-xs">
              <span className="font-medium">Reciclados no Mês</span>
              <Recycle className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-stone-900 font-mono-code tabular-nums">
              3.840 kg
            </div>
            <span className="text-[11px] text-stone-500 block">
              Entregues à cooperativa COOPERCAVA
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/70 space-y-1">
            <div className="flex items-center justify-between text-stone-500 text-xs">
              <span className="font-medium">Óleo Coletado</span>
              <Droplet className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-stone-900 font-mono-code tabular-nums">
              185 Litros
            </div>
            <span className="text-[11px] text-stone-500 block">
              4,6 milhões de litros de água preservados
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/70 space-y-1">
            <div className="flex items-center justify-between text-stone-500 text-xs">
              <span className="font-medium">Meta Mensal</span>
              <TrendingUp className="w-4 h-4 text-[#143D1A]" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-[#143D1A] font-mono-code tabular-nums">
              68%
            </div>
            <span className="text-[11px] text-stone-500 block">
              1º lugar regional no Vale do Aço
            </span>
          </div>
        </div>

        {/* Community Goal Progress Bar */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-xs text-stone-600 font-medium">
            <span>Meta da Comunidade: 10.000 kg neste ciclo</span>
            <span className="font-mono-code font-bold text-[#143D1A]">6.840 / 10.000 kg</span>
          </div>
          <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-600 rounded-full transition-all duration-500"
              style={{ width: '68%' }}
            />
          </div>
        </div>
      </section>

      {/* Pontos Próximos (Few Points with 'Ver Todos') */}
      <section className="bg-white rounded-3xl border border-stone-200/90 p-5 sm:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-stone-900 tracking-tight">
              Ecopontos Próximos de Você
            </h2>
            <p className="text-xs text-stone-500">
              Locais verificados e gratuitos em Ipatinga
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('map')}
            className="text-xs font-bold text-[#143D1A] hover:underline cursor-pointer flex items-center gap-1"
          >
            <span>Ver todos no mapa</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {nearbyPoints.map((point) => (
            <div
              key={point.id}
              onClick={() => onSelectPoint(point)}
              className="p-4 rounded-2xl border border-stone-200/80 bg-stone-50/60 hover:bg-[#143D1A]/5 hover:border-[#143D1A] transition-all cursor-pointer flex flex-col justify-between group space-y-3"
            >
              <div>
                <div className="flex items-center justify-between text-[11px] text-stone-500 mb-1 font-mono-code">
                  <span className="uppercase font-semibold text-emerald-800">{point.type}</span>
                  <span className="font-bold text-stone-700">{point.distance}</span>
                </div>
                <h3 className="text-xs font-bold text-stone-900 group-hover:text-[#143D1A] transition-colors leading-snug line-clamp-1">
                  {point.name}
                </h3>
                <p className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">
                  {point.address.split('—')[0]}
                </p>
              </div>

              <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between text-[11px]">
                <span className="text-emerald-700 font-medium flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Aberto agora
                </span>
                <span className="font-semibold text-stone-800">★ {point.rating}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
