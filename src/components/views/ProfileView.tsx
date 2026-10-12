import React, { useState } from 'react';
import {
  User,
  Award,
  Leaf,
  ShieldCheck,
  Heart,
  AlertTriangle,
  Settings,
  ChevronRight,
  TrendingUp,
  MapPin,
  Clock,
  Sparkles,
  Trophy,
  CheckCircle2,
  Lock,
  Download,
  Trash2,
  Bell,
  Eye,
  FileText,
  Target,
  Store,
  LogIn,
  LogOut,
  UserCheck,
} from 'lucide-react';
import {
  USER_LEVELS,
  NEIGHBORHOOD_RANKINGS,
  SUSTAINABILITY_CHALLENGES,
  DISPOSAL_POINTS,
} from '../../data/mockEcoData';
import { DisposalPoint, EnvironmentalReport, PointsTransaction, UserProfile } from '../../types/ecoapp';

interface ProfileViewProps {
  userPoints: number;
  neighborhood: string;
  onSelectNeighborhood: (nh: string) => void;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onSelectPoint: (point: DisposalPoint) => void;
  transactions: PointsTransaction[];
  reports: EnvironmentalReport[];
  onOpenAdmin: () => void;
  currentUser: UserProfile;
  onOpenLogin: () => void;
  onLogout: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  userPoints,
  neighborhood,
  onSelectNeighborhood,
  favorites,
  onToggleFavorite,
  onSelectPoint,
  transactions,
  reports,
  onOpenAdmin,
  currentUser,
  onOpenLogin,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<
    'impact' | 'challenges' | 'ranking' | 'favorites' | 'reports' | 'settings'
  >('impact');

  const [isAnonymousInRanking, setIsAnonymousInRanking] = useState(false);
  const [allowLocation, setAllowLocation] = useState(true);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const userName = currentUser.name;

  // Compute Level
  const currentLevel =
    [...USER_LEVELS].reverse().find((l) => userPoints >= l.minPoints) || USER_LEVELS[0];
  const nextLevel = USER_LEVELS.find((l) => l.minPoints > userPoints);
  const pointsToNext = nextLevel ? nextLevel.minPoints - userPoints : 0;
  const progressToNext = nextLevel
    ? Math.min(
        100,
        Math.round(
          ((userPoints - currentLevel.minPoints) / (nextLevel.minPoints - currentLevel.minPoints)) *
            100
        )
      )
    : 100;

  // Favorite Ecopoints objects
  const favoritePoints = DISPOSAL_POINTS.filter((p) => favorites.includes(p.id));

  // Impact calculations based on transactions
  const totalDisposals = transactions.filter((t) => t.category === 'Descarte').length + 8;
  const totalRecycledKg = totalDisposals * 15;
  const totalOilLiters = 6;
  const co2AvoidedKg = Math.round(totalRecycledKg * 1.8 + totalOilLiters * 2.5);

  const handleExportData = () => {
    const userData = {
      user: userName,
      neighborhood,
      points: userPoints,
      level: currentLevel.name,
      disposalsCount: totalDisposals,
      co2AvoidedKg,
      transactions,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ecoapp-dados-lgpd-${Date.now()}.json`;
    a.click();

    setToastMsg('Seus dados foram exportados com segurança conforme a LGPD.');
    setTimeout(() => setToastMsg(null), 4000);
  };

  const handleResetData = () => {
    if (window.confirm('Deseja realmente limpar seus dados locais de descarte do navegador?')) {
      localStorage.removeItem('ecoapp_points');
      setToastMsg('Dados locais redefinidos.');
      setTimeout(() => setToastMsg(null), 3000);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-150">
      {/* Guest Notice if not logged in */}
      {!currentUser.isLoggedIn && (
        <section className="bg-gradient-to-r from-emerald-900 to-[#143D1A] text-white rounded-3xl p-5 sm:p-6 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-[#8CE28A] text-[11px] font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Modo Visitante</span>
            </span>
            <h2 className="text-base sm:text-lg font-extrabold text-white">
              Conecte sua conta para salvar seus EcoPontos
            </h2>
            <p className="text-xs text-white/80 max-w-xl">
              Entre como morador, comércio parceiro ou agente público de Ipatinga para sincronizar seus descartes e resgatar descontos locais.
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenLogin}
            className="px-4 py-2.5 rounded-xl bg-white text-[#143D1A] hover:bg-stone-100 font-extrabold text-xs flex items-center gap-2 cursor-pointer shadow-md shrink-0 transition-transform active:scale-95"
          >
            <LogIn className="w-4 h-4 text-[#143D1A]" />
            <span>Fazer Login / Cadastrar</span>
          </button>
        </section>
      )}

      {/* Profile Card Header */}
      <section className="bg-white rounded-3xl border border-stone-200/90 p-6 sm:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Avatar with Badge */}
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-[#143D1A] text-white flex items-center justify-center font-bold text-xl shadow-md">
                {userName.charAt(0)}
              </div>
              <span className="absolute -bottom-1 -right-1 text-lg" title={currentLevel.name}>
                {currentLevel.badge}
              </span>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold text-stone-900 tracking-tight">{userName}</h1>
                <span
                  className={`text-[10px] font-mono-code font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                    currentUser.role === 'agent'
                      ? 'bg-blue-100 text-blue-900'
                      : currentUser.role === 'merchant'
                      ? 'bg-amber-100 text-amber-900'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {currentUser.role === 'agent'
                    ? 'Agente SESUMA'
                    : currentUser.role === 'merchant'
                    ? 'Comércio Parceiro'
                    : currentLevel.name}
                </span>
              </div>
              {currentUser.businessName && (
                <p className="text-xs font-semibold text-amber-900 flex items-center gap-1 mt-0.5">
                  <Store className="w-3.5 h-3.5 text-amber-700" />
                  <span>{currentUser.businessName}</span>
                </p>
              )}
              <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500 mt-0.5">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#143D1A]" />
                  <span>{neighborhood.split('—')[0].trim()}</span>
                </span>
                <span aria-hidden="true">·</span>
                <span className="text-stone-400 text-[11px] truncate">{currentUser.email}</span>
              </div>
            </div>
          </div>

          {/* Quick Points & Account Actions */}
          <div className="flex items-center gap-2">
            <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200/80 flex items-center gap-3 text-xs">
              <div>
                <span className="text-[10px] text-stone-400 font-mono-code uppercase block">
                  Saldo Atual
                </span>
                <div className="text-lg font-bold text-[#143D1A] font-mono-code tabular-nums">
                  {userPoints} pts
                </div>
              </div>
              <div className="h-7 w-px bg-stone-200" />
              <div>
                <span className="text-[10px] text-stone-400 font-mono-code uppercase block">
                  Nível
                </span>
                <span className="font-bold text-stone-800 text-xs">{currentLevel.name}</span>
              </div>
            </div>

            {/* Quick Login / Switch button */}
            <button
              type="button"
              onClick={onOpenLogin}
              className="p-3 rounded-2xl bg-stone-100 hover:bg-stone-200/90 text-stone-700 border border-stone-200/80 text-xs font-bold flex flex-col items-center justify-center cursor-pointer transition-colors"
              title="Gerenciar conta ou alternar perfil"
            >
              <UserCheck className="w-4 h-4 text-[#143D1A]" />
              <span className="text-[10px] mt-0.5">Conta</span>
            </button>
          </div>
        </div>

        {/* Level Progress */}
        <div className="p-4 rounded-2xl bg-[#143D1A]/5 border border-[#143D1A]/10 space-y-1.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-stone-800">
              {currentLevel.badge} Benefício Atual: {currentLevel.perk}
            </span>
            {nextLevel && (
              <span className="text-[11px] font-mono-code text-stone-500">
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

        {/* Feedback message */}
        {toastMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Profile Tabs Navigation */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-stone-100 no-scrollbar">
          {[
            { id: 'impact', label: 'Meu Impacto', icon: Leaf },
            { id: 'challenges', label: 'Desafios & Metas', icon: Target },
            { id: 'ranking', label: 'Ranking Bairros', icon: Trophy },
            { id: 'favorites', label: `Favoritos (${favorites.length})`, icon: Heart },
            { id: 'reports', label: `Minhas Denúncias (${reports.length})`, icon: AlertTriangle },
            { id: 'settings', label: 'Privacidade & LGPD', icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#143D1A] text-white font-semibold shadow-xs'
                    : 'bg-stone-100 hover:bg-stone-200/70 text-stone-700 border border-stone-200/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-[#8CE28A]' : 'text-stone-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Tab 1: Meu Impacto */}
      {activeTab === 'impact' && (
        <section className="bg-white rounded-3xl border border-stone-200/90 p-6 sm:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-5">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-stone-900 tracking-tight">
              Balanço do Seu Impacto Ecológico em Ipatinga
            </h2>
            <p className="text-xs text-stone-500">
              Estimativa do volume preservado pelo descarte correto e participação ativa
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-1">
              <span className="text-[11px] text-stone-500 block font-medium">Descartes Feitos</span>
              <div className="text-2xl font-bold text-stone-900 font-mono-code tabular-nums">
                {totalDisposals}
              </div>
              <span className="text-[10px] text-stone-400">Em ecopontos e coletas</span>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-1">
              <span className="text-[11px] text-stone-500 block font-medium">Recicláveis</span>
              <div className="text-2xl font-bold text-emerald-800 font-mono-code tabular-nums">
                {totalRecycledKg} kg
              </div>
              <span className="text-[10px] text-stone-400">Para COOPERCAVA</span>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-1">
              <span className="text-[11px] text-stone-500 block font-medium">Óleo Entregue</span>
              <div className="text-2xl font-bold text-amber-700 font-mono-code tabular-nums">
                {totalOilLiters} L
              </div>
              <span className="text-[10px] text-stone-400">150 mil L de água salvos</span>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-1">
              <span className="text-[11px] text-stone-500 block font-medium">CO₂ Evitado</span>
              <div className="text-2xl font-bold text-[#143D1A] font-mono-code tabular-nums">
                {co2AvoidedKg} kg
              </div>
              <span className="text-[10px] text-stone-400">Cálculo metodológico</span>
            </div>
          </div>

          {/* Level Hierarchy Table */}
          <div className="pt-3 border-t border-stone-100 space-y-3">
            <h3 className="text-xs font-bold text-stone-800">
              Plano de Níveis & Benefícios do Cidadão (Configurável pela SESUMA):
            </h3>
            <div className="space-y-2">
              {USER_LEVELS.map((lvl) => {
                const isCurrent = lvl.name === currentLevel.name;
                return (
                  <div
                    key={lvl.id}
                    className={`p-3 rounded-2xl border text-xs flex items-center justify-between ${
                      isCurrent
                        ? 'bg-emerald-50/70 border-emerald-300 font-semibold'
                        : 'bg-stone-50 border-stone-200 text-stone-600'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg">{lvl.badge}</span>
                      <div>
                        <span className="font-bold text-stone-900 block">{lvl.name}</span>
                        <span className="text-[11px] text-stone-500">{lvl.perk}</span>
                      </div>
                    </div>
                    <span className="font-mono-code font-bold text-stone-700 text-xs">
                      {lvl.minPoints}+ pts
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Tab 2: Desafios & Metas */}
      {activeTab === 'challenges' && (
        <section className="bg-white rounded-3xl border border-stone-200/90 p-6 sm:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-stone-900 tracking-tight">
              Desafios Mensais Ativos
            </h2>
            <p className="text-xs text-stone-500">
              Complete as metas do seu bairro para ganhar pontos extras
            </p>
          </div>

          <div className="space-y-3">
            {SUSTAINABILITY_CHALLENGES.map((ch) => {
              const pct = Math.min(100, Math.round((ch.progress / ch.target) * 100));
              return (
                <div
                  key={ch.id}
                  className="p-4 rounded-2xl border border-stone-200 bg-stone-50/60 space-y-2 text-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-stone-900">{ch.title}</h4>
                      <p className="text-[11px] text-stone-500 leading-relaxed mt-0.5">
                        {ch.description}
                      </p>
                    </div>
                    <span className="font-mono-code font-bold text-emerald-800 text-[11px] bg-emerald-100 px-2 py-0.5 rounded-md shrink-0">
                      +{ch.points} pts
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-[10px] text-stone-500 font-mono-code mb-1">
                      <span>
                        Progresso: {ch.progress} de {ch.target} {ch.unit}
                      </span>
                      <span className="font-bold text-stone-700">{pct}%</span>
                    </div>
                    <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#143D1A] rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Tab 3: Ranking Comunitário */}
      {activeTab === 'ranking' && (
        <section className="bg-white rounded-3xl border border-stone-200/90 p-6 sm:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-stone-900 tracking-tight">
                Ranking de Bairros Sustentáveis (Ipatinga)
              </h2>
              <p className="text-xs text-stone-500">
                Bairros com maior engajamento em reciclagem e descarte consciente neste ciclo
              </p>
            </div>
            <Trophy className="w-5 h-5 text-amber-500" />
          </div>

          <div className="space-y-2.5">
            {NEIGHBORHOOD_RANKINGS.map((rank) => (
              <div
                key={rank.neighborhood}
                className={`p-3.5 rounded-2xl border text-xs flex items-center justify-between ${
                  rank.rank === 1
                    ? 'bg-amber-50/60 border-amber-300 font-semibold'
                    : 'bg-stone-50 border-stone-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-7 h-7 rounded-xl flex items-center justify-center font-mono-code font-bold text-xs ${
                      rank.rank === 1
                        ? 'bg-amber-400 text-stone-900'
                        : rank.rank === 2
                        ? 'bg-stone-300 text-stone-800'
                        : rank.rank === 3
                        ? 'bg-amber-200 text-amber-900'
                        : 'bg-stone-200 text-stone-600'
                    }`}
                  >
                    #{rank.rank}
                  </span>
                  <div>
                    <h4 className="font-bold text-stone-900 leading-tight">{rank.neighborhood}</h4>
                    <span className="text-[11px] text-stone-500">
                      {rank.participantsCount} moradores ativos
                    </span>
                  </div>
                </div>

                <div className="text-right font-mono-code text-[11px]">
                  <span className="font-bold text-emerald-800 block">{rank.recycledKg} kg</span>
                  <span className="text-stone-400">{rank.oilLiters} L óleo</span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200/80 text-[11px] text-stone-600 flex items-center justify-between">
            <span>Privacidade no ranking: usar apelido em vez de nome real</span>
            <input
              type="checkbox"
              checked={isAnonymousInRanking}
              onChange={(e) => setIsAnonymousInRanking(e.target.checked)}
              className="w-4 h-4 text-[#143D1A] rounded cursor-pointer"
            />
          </div>
        </section>
      )}

      {/* Tab 4: Meus Favoritos */}
      {activeTab === 'favorites' && (
        <section className="bg-white rounded-3xl border border-stone-200/90 p-6 sm:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-stone-900 tracking-tight">
              Ecopontos & Parceiros Salvos ({favoritePoints.length})
            </h2>
            <p className="text-xs text-stone-500">
              Acesso rápido aos locais que você mais utiliza em Ipatinga
            </p>
          </div>

          {favoritePoints.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {favoritePoints.map((point) => (
                <div
                  key={point.id}
                  onClick={() => onSelectPoint(point)}
                  className="p-4 rounded-2xl border border-stone-200 bg-stone-50 hover:bg-white hover:border-[#143D1A] transition-all cursor-pointer flex flex-col justify-between space-y-2"
                >
                  <div className="flex items-center justify-between text-[11px] text-stone-500 font-mono-code">
                    <span className="uppercase font-semibold text-emerald-800">{point.type}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(point.id);
                      }}
                      className="text-rose-500 hover:scale-110 transition-transform"
                      title="Remover favorito"
                    >
                      ❤️
                    </button>
                  </div>
                  <h4 className="text-xs font-bold text-stone-900">{point.name}</h4>
                  <p className="text-[11px] text-stone-500 line-clamp-1">{point.address}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-stone-400 space-y-2">
              <Heart className="w-8 h-8 mx-auto text-stone-300" />
              <p>Você ainda não favoritou nenhum ecoponto.</p>
              <p className="text-[11px] text-stone-500">
                Toque no ícone de coração ❤️ na ficha de qualquer ecoponto para salvá-lo aqui.
              </p>
            </div>
          )}
        </section>
      )}

      {/* Tab 5: Minhas Denúncias */}
      {activeTab === 'reports' && (
        <section className="bg-white rounded-3xl border border-stone-200/90 p-6 sm:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-stone-900 tracking-tight">
              Minhas Comunicações de Fiscalização ({reports.length})
            </h2>
            <p className="text-xs text-stone-500">
              Protocolos oficiais registrados perante a Prefeitura de Ipatinga
            </p>
          </div>

          <div className="space-y-3">
            {reports.map((rep) => (
              <div
                key={rep.id}
                className="p-4 rounded-2xl border border-stone-200 bg-stone-50/70 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono-code font-bold text-stone-900">#{rep.protocol}</span>
                  <span className="capitalize font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md text-[10px]">
                    {rep.status.replace('_', ' ')}
                  </span>
                </div>
                <h4 className="font-bold text-stone-900">{rep.title}</h4>
                <p className="text-[11px] text-stone-500">{rep.address}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Tab 6: Privacidade, LGPD & Conta */}
      {activeTab === 'settings' && (
        <section className="bg-white rounded-3xl border border-stone-200/90 p-6 sm:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-5">
          {/* User Account & Login Management Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#143D1A]/5 border border-[#143D1A]/15 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#143D1A] font-mono-code block">
                  Autenticação & Identidade
                </span>
                <h3 className="text-sm sm:text-base font-extrabold text-stone-900">
                  {currentUser.isLoggedIn ? currentUser.name : 'Navegando como Visitante'}
                </h3>
                <p className="text-xs text-stone-600 mt-0.5">
                  {currentUser.isLoggedIn
                    ? `${currentUser.email} · ${currentUser.role === 'agent' ? 'Servidor SESUMA' : currentUser.role === 'merchant' ? 'Comércio Parceiro' : 'Cidadão de Ipatinga'}`
                    : 'Faça login para salvar seus registros e resgatar descontos no comércio local.'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onOpenLogin}
                  className="px-3.5 py-2 rounded-xl bg-[#143D1A] text-white hover:bg-[#1B5223] font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>{currentUser.isLoggedIn ? 'Trocar de Conta' : 'Fazer Login'}</span>
                </button>
                {currentUser.isLoggedIn && (
                  <button
                    type="button"
                    onClick={onLogout}
                    className="px-3 py-2 rounded-xl bg-white text-stone-700 hover:text-rose-700 hover:bg-rose-50 border border-stone-200 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                    title="Desconectar"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sair</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-base sm:text-lg font-bold text-stone-900 tracking-tight">
              Privacidade, LGPD & Gestão de Dados
            </h2>
            <p className="text-xs text-stone-500">
              Controle de consentimento e titularidade de informações conforme a Lei Geral de Proteção de Dados
            </p>
          </div>

          <div className="space-y-3 text-xs text-stone-700">
            {/* Geolocation consent toggle */}
            <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/80 flex items-center justify-between">
              <div>
                <span className="font-bold text-stone-900 block">Acesso à Localização</span>
                <span className="text-[11px] text-stone-500">
                  Usado apenas para ordenar ecopontos mais próximos em Ipatinga
                </span>
              </div>
              <input
                type="checkbox"
                checked={allowLocation}
                onChange={(e) => setAllowLocation(e.target.checked)}
                className="w-4 h-4 text-[#143D1A] rounded cursor-pointer"
              />
            </div>

            {/* Export data button */}
            <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/80 flex items-center justify-between">
              <div>
                <span className="font-bold text-stone-900 block">Exportar Meus Dados (Art. 18 LGPD)</span>
                <span className="text-[11px] text-stone-500">
                  Baixe cópia em JSON dos seus descartes e pontos cadastrados
                </span>
              </div>
              <button
                type="button"
                onClick={handleExportData}
                className="px-3 py-1.5 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Exportar</span>
              </button>
            </div>

            {/* Reset data */}
            <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/80 flex items-center justify-between">
              <div>
                <span className="font-bold text-rose-900 block">Excluir Registros Locais</span>
                <span className="text-[11px] text-stone-500">
                  Apaga histórico salvo neste navegador
                </span>
              </div>
              <button
                type="button"
                onClick={handleResetData}
                className="px-3 py-1.5 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Limpar</span>
              </button>
            </div>

            {/* Admin access trigger */}
            <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
              <span className="text-stone-400 text-[11px]">
                Acesso institucional reservado à equipe municipal
              </span>
              <button
                type="button"
                onClick={onOpenAdmin}
                className="px-3.5 py-1.5 rounded-xl bg-[#143D1A] text-white hover:bg-[#1B5223] font-bold text-xs cursor-pointer shadow-xs"
              >
                Painel Administrativo SESUMA &rarr;
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
