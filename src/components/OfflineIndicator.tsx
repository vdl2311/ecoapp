import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 left-4 right-4 md:right-auto md:max-w-md z-50 flex items-center gap-2.5 rounded-xl bg-[#1B4D3E] text-white px-4 py-3 shadow-xl border border-white/10 animate-fade-in">
      <span className="flex h-2.5 w-2.5 relative">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
      </span>
      <WifiOff className="w-4 h-4 text-emerald-300 shrink-0" />
      <div className="text-xs">
        <p className="font-semibold text-white">Modo Offline Ativo</p>
        <p className="text-emerald-100/80">Ecopontos, calendários e guias continuam disponíveis em cache no seu celular.</p>
      </div>
    </div>
  );
};
