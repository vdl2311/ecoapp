import React, { useState } from 'react';
import {
  Home,
  MapPin,
  Recycle,
  Gift,
  User,
  Search,
  Bell,
  ChevronDown,
  Check,
  Bot,
  Truck,
  AlertTriangle,
  BookOpen,
  Award,
} from 'lucide-react';
import { EcoMainTab, UserProfile } from '../types/ecoapp';
import { PWAInstallPrompt } from './PWAInstallPrompt';

interface NavbarProps {
  currentTab: EcoMainTab;
  onSelectTab: (tab: EcoMainTab) => void;
  userPoints: number;
  neighborhood: string;
  onSelectNeighborhood: (nh: string) => void;
  unreadAlertsCount: number;
  onOpenNotifications: () => void;
  onOpenAI: () => void;
  currentUser: UserProfile;
  onOpenLogin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  userPoints,
  neighborhood,
  onSelectNeighborhood,
  unreadAlertsCount,
  onOpenNotifications,
  onOpenAI,
  currentUser,
  onOpenLogin,
}) => {
  const [neighborhoodDropdown, setNeighborhoodDropdown] = useState(false);
  const [searchNeighborhood, setSearchNeighborhood] = useState('');

  const neighborhoods = [
    'Bairro Cidade Nobre — Ipatinga, MG',
    'Bairro Horto — Ipatinga, MG',
    'Bairro Cariru — Ipatinga, MG',
    'Bairro Canaã — Ipatinga, MG',
    'Bairro Bethânia — Ipatinga, MG',
    'Bairro Iguaçu — Ipatinga, MG',
    'Bairro Bom Jardim — Ipatinga, MG',
    'Centro — Ipatinga, MG',
    'Bairro Veneza — Ipatinga, MG',
    'Bairro Esperança — Ipatinga, MG',
    'Bairro Ideal — Ipatinga, MG',
    'Bairro Vila Celeste — Ipatinga, MG',
    'Bairro Limoeiro — Ipatinga, MG',
    'Bairro Imbaúbas — Ipatinga, MG',
  ];

  const filteredNeighborhoods = neighborhoods.filter((n) =>
    n.toLowerCase().includes(searchNeighborhood.toLowerCase().trim())
  );

  return (
    <>
      {/* Top Application Bar */}
      <header className="sticky top-0 sm:top-2 z-40 max-w-7xl mx-auto px-2 sm:px-6 w-full pt-[max(0.25rem,env(safe-area-inset-top,0px))] sm:pt-1">
        <div className="bg-white/95 backdrop-blur-xl border border-stone-200/90 rounded-2xl sm:rounded-3xl shadow-[0_2px_12px_rgba(0,0,0,0.03)] px-3 sm:px-5 py-2 sm:py-2.5 transition-all">
          <div className="flex items-center justify-between gap-1.5 sm:gap-3 min-w-0">
            {/* Brand Logo & Location */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 shrink">
              <button
                type="button"
                onClick={() => onSelectTab('home')}
                className="flex items-center gap-2 sm:gap-2.5 text-left group cursor-pointer focus:outline-none min-w-0"
              >
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl bg-[#143D1A] text-[#8CE28A] flex items-center justify-center font-bold text-base shadow-xs group-hover:bg-[#1B5223] transition-colors shrink-0">
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
                    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1 sm:gap-1.5 truncate">
                    <span className="text-sm sm:text-base font-extrabold tracking-tight text-[#142816]">
                      EcoApp
                    </span>
                    <span className="text-stone-300">·</span>
                    <span className="text-[10px] sm:text-[11px] font-semibold text-[#143D1A] truncate">
                      Ipatinga
                    </span>
                  </div>
                  <p className="text-[10px] text-stone-500 font-mono-code hidden sm:block">
                    Gestão Sustentável & Resíduos
                  </p>
                </div>
              </button>

              <div className="h-5 w-px bg-stone-200 hidden md:block mx-1 shrink-0" />

              {/* Neighborhood switcher */}
              <div className="relative hidden sm:block">
                <button
                  type="button"
                  onClick={() => setNeighborhoodDropdown(!neighborhoodDropdown)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200/80 text-stone-700 hover:text-stone-900 border border-stone-200/80 text-xs font-medium transition-colors cursor-pointer"
                  aria-expanded={neighborhoodDropdown}
                >
                  <MapPin className="w-3.5 h-3.5 text-[#143D1A] shrink-0" />
                  <span className="max-w-[150px] sm:max-w-[180px] truncate">
                    {neighborhood.split('—')[0].trim()}
                  </span>
                  <ChevronDown className="w-3 h-3 text-stone-400 shrink-0" />
                </button>

                {neighborhoodDropdown && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setNeighborhoodDropdown(false)}
                    />
                    <div className="absolute left-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-stone-200/90 py-2 z-50 animate-in fade-in duration-150">
                      <div className="px-3 pb-2 pt-1 border-b border-stone-100">
                        <div className="text-[11px] font-semibold text-stone-500 mb-1.5 flex items-center justify-between">
                          <span>Localidade em Ipatinga</span>
                          <span className="text-[10px] text-stone-400">14 regiões</span>
                        </div>
                        <div className="relative">
                          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
                          <input
                            type="text"
                            value={searchNeighborhood}
                            onChange={(e) => setSearchNeighborhood(e.target.value)}
                            placeholder="Buscar bairro..."
                            className="w-full pl-8 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#143D1A]"
                            autoFocus
                          />
                        </div>
                      </div>

                      <div className="max-h-56 overflow-y-auto py-1">
                        {filteredNeighborhoods.map((nh) => {
                          const isSelected = nh === neighborhood;
                          return (
                            <button
                              key={nh}
                              type="button"
                              onClick={() => {
                                onSelectNeighborhood(nh);
                                setNeighborhoodDropdown(false);
                              }}
                              className={`w-full text-left px-3.5 py-2 text-xs transition-colors flex items-center justify-between cursor-pointer ${
                                isSelected
                                  ? 'bg-[#143D1A]/5 text-[#143D1A] font-bold'
                                  : 'text-stone-700 hover:bg-stone-50'
                              }`}
                            >
                              <span className="truncate">{nh}</span>
                              {isSelected && <Check className="w-3.5 h-3.5 text-[#143D1A] shrink-0" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              {[
                { id: 'home' as EcoMainTab, label: 'Início', icon: Home },
                { id: 'map' as EcoMainTab, label: 'Mapa', icon: MapPin },
                { id: 'dispose' as EcoMainTab, label: 'Descartar', icon: Recycle, highlight: true },
                { id: 'donate' as EcoMainTab, label: 'Doar', icon: Gift },
                { id: 'calendar' as EcoMainTab, label: 'Coleta', icon: Truck },
                { id: 'report' as EcoMainTab, label: 'Fiscalizar', icon: AlertTriangle },
                { id: 'guide' as EcoMainTab, label: 'Guia', icon: BookOpen },
                { id: 'profile' as EcoMainTab, label: 'Perfil', icon: User },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = currentTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => onSelectTab(tab.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#143D1A] text-white shadow-xs'
                        : tab.highlight
                        ? 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200'
                        : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#8CE28A]' : ''}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Right Tools: PWA Install + EcoIA + Points + Notifications */}
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              {/* Install PWA Button */}
              <PWAInstallPrompt variant="button" />

              {/* EcoIA Button */}
              <button
                type="button"
                onClick={onOpenAI}
                className="flex items-center gap-1 sm:gap-1.5 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#143D1A] border border-emerald-200 text-xs font-bold transition-colors cursor-pointer shadow-xs shrink-0"
                title="Abrir assistente EcoIA"
                aria-label="Abrir assistente EcoIA"
              >
                <Bot className="w-3.5 h-3.5 text-[#143D1A] shrink-0" />
                <span className="hidden sm:inline">EcoIA</span>
              </button>

              {/* EcoPoints wallet button */}
              <button
                type="button"
                onClick={() => onSelectTab('profile')}
                className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl bg-[#143D1A] text-white hover:bg-[#1B5223] transition-colors cursor-pointer text-xs font-semibold shadow-xs shrink-0"
                title="Ver meus EcoPontos"
              >
                <Award className="w-3.5 h-3.5 text-[#8CE28A] shrink-0" />
                <span className="font-mono-code tabular-nums text-xs">{userPoints}</span>
                <span className="hidden sm:inline text-white/80 font-normal">pts</span>
              </button>

              {/* Notification bell */}
              <button
                type="button"
                onClick={onOpenNotifications}
                className="relative p-1.5 sm:p-2 rounded-xl bg-stone-100 hover:bg-stone-200/80 text-stone-700 hover:text-stone-900 border border-stone-200/80 transition-colors cursor-pointer shrink-0"
                aria-label="Abrir notificações municipais"
              >
                <Bell className="w-4 h-4 text-stone-600 shrink-0" />
                {unreadAlertsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center font-mono-code shadow-xs">
                    {unreadAlertsCount}
                  </span>
                )}
              </button>

              {/* User Account / Login Button */}
              <button
                type="button"
                onClick={onOpenLogin}
                className={`flex items-center gap-1 sm:gap-1.5 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer shrink-0 shadow-2xs ${
                  currentUser.isLoggedIn
                    ? 'bg-stone-100 hover:bg-stone-200/90 text-stone-800 border-stone-200/80'
                    : 'bg-[#143D1A] hover:bg-[#1B5223] text-white border-[#143D1A]'
                }`}
                title={
                  currentUser.isLoggedIn
                    ? `Conta: ${currentUser.name} (${currentUser.role === 'agent' ? 'SESUMA' : currentUser.role === 'merchant' ? 'Comércio' : 'Cidadão'}) - Clique para gerenciar`
                    : 'Entrar na sua conta'
                }
                aria-label="Acessar área de login e conta"
              >
                {currentUser.isLoggedIn ? (
                  <>
                    <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#143D1A] text-[#8CE28A] text-[9px] sm:text-[10px] font-extrabold flex items-center justify-center shrink-0">
                      {currentUser.name.charAt(0)}
                    </div>
                    <span className="hidden xl:inline max-w-[70px] truncate text-[11px] font-medium text-stone-700">
                      {currentUser.name.split(' ')[0]}
                    </span>
                  </>
                ) : (
                  <>
                    <User className="w-3.5 h-3.5 shrink-0" />
                    <span className="hidden sm:inline">Entrar</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile-First Bottom Navigation (5 Core Tabs with 'Descartar' Highlighted) */}
      <nav
        aria-label="Navegação Principal Mobile"
        className="md:hidden fixed bottom-[calc(0.5rem+env(safe-area-inset-bottom,0px))] left-3 right-3 z-40 bg-white/95 backdrop-blur-xl border border-stone-200/90 rounded-3xl px-2 py-1.5 flex items-center justify-around shadow-2xl"
      >
        {/* 1. Início */}
        <button
          type="button"
          onClick={() => onSelectTab('home')}
          className={`flex flex-col items-center py-1 px-2.5 rounded-2xl transition-all cursor-pointer min-h-[44px] min-w-[48px] justify-center ${
            currentTab === 'home'
              ? 'text-[#143D1A] font-bold bg-[#143D1A]/10'
              : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          <Home className={`w-4 h-4 ${currentTab === 'home' ? 'text-[#143D1A] stroke-[2.5]' : ''}`} />
          <span className="text-[10px] mt-0.5">Início</span>
        </button>

        {/* 2. Mapa */}
        <button
          type="button"
          onClick={() => onSelectTab('map')}
          className={`flex flex-col items-center py-1 px-2.5 rounded-2xl transition-all cursor-pointer min-h-[44px] min-w-[48px] justify-center ${
            currentTab === 'map'
              ? 'text-[#143D1A] font-bold bg-[#143D1A]/10'
              : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          <MapPin className={`w-4 h-4 ${currentTab === 'map' ? 'text-[#143D1A] stroke-[2.5]' : ''}`} />
          <span className="text-[10px] mt-0.5">Mapa</span>
        </button>

        {/* 3. Descartar (HERO CENTER BUTTON COM DESTAQUE VISUAL) */}
        <button
          type="button"
          onClick={() => onSelectTab('dispose')}
          className="relative -top-4 flex flex-col items-center justify-center w-14 h-14 rounded-full bg-[#143D1A] text-white shadow-lg ring-4 ring-white cursor-pointer active:scale-95 transition-transform"
          aria-label="Descartar Resíduo"
        >
          <Recycle className="w-6 h-6 text-[#8CE28A] animate-pulse" />
          <span className="text-[9px] font-bold mt-0.5">Descartar</span>
        </button>

        {/* 4. Doar */}
        <button
          type="button"
          onClick={() => onSelectTab('donate')}
          className={`flex flex-col items-center py-1 px-2.5 rounded-2xl transition-all cursor-pointer min-h-[44px] min-w-[48px] justify-center ${
            currentTab === 'donate'
              ? 'text-[#143D1A] font-bold bg-[#143D1A]/10'
              : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          <Gift className={`w-4 h-4 ${currentTab === 'donate' ? 'text-[#143D1A] stroke-[2.5]' : ''}`} />
          <span className="text-[10px] mt-0.5">Doar</span>
        </button>

        {/* 5. Perfil */}
        <button
          type="button"
          onClick={() => onSelectTab('profile')}
          className={`flex flex-col items-center py-1 px-2.5 rounded-2xl transition-all cursor-pointer min-h-[44px] min-w-[48px] justify-center ${
            currentTab === 'profile'
              ? 'text-[#143D1A] font-bold bg-[#143D1A]/10'
              : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          <User className={`w-4 h-4 ${currentTab === 'profile' ? 'text-[#143D1A] stroke-[2.5]' : ''}`} />
          <span className="text-[10px] mt-0.5">Perfil</span>
        </button>
      </nav>
    </>
  );
};
