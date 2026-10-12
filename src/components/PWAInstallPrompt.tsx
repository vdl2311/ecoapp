import React, { useState } from 'react';
import { Smartphone, Download, Share, PlusSquare, X, CheckCircle2, Sparkles, ShieldCheck } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallPromptProps {
  variant?: 'button' | 'banner';
}

export const PWAInstallPrompt: React.FC<PWAInstallPromptProps> = ({ variant = 'button' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  // If running as standalone app, don't show install buttons
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      await install();
    } else if (isIOS) {
      setShowIOSModal(true);
    } else {
      // Fallback for browsers without beforeinstallprompt or desktop
      setShowIOSModal(true);
    }
  };

  if (variant === 'button') {
    return (
      <>
        <button
          onClick={handleInstallClick}
          className="inline-flex items-center gap-1 sm:gap-1.5 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-[#1B4D3E] hover:bg-[#143c30] text-white text-xs font-semibold tracking-tight shadow-xs transition active:scale-95 shrink-0"
          title="Instalar EcoApp no Celular"
          aria-label="Instalar EcoApp no Celular"
        >
          <Smartphone className="w-3.5 h-3.5 text-[#A4D65E] shrink-0" />
          <span className="hidden md:inline">Instalar App</span>
        </button>

        {/* Modal with instructions for iOS or manual install */}
        {showIOSModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-stone-100 text-stone-900">
              <button
                onClick={() => setShowIOSModal(false)}
                className="absolute top-4 right-4 p-1 rounded-full text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <img
                  src="/pwa-192x192.png"
                  alt="EcoApp"
                  className="w-12 h-12 rounded-xl shadow-md border border-stone-200"
                />
                <div>
                  <h3 className="text-base font-bold text-stone-900 leading-tight">EcoApp no Celular</h3>
                  <p className="text-xs text-stone-500">Ipatinga Sustentável</p>
                </div>
              </div>

              <div className="space-y-3 my-4 text-xs text-stone-700 bg-stone-50 p-4 rounded-xl border border-stone-100">
                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-[#1B4D3E]/10 text-[#1B4D3E] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <p className="font-semibold text-stone-900">No navegador do seu celular:</p>
                    <p className="text-stone-500">
                      Toque no botão de <strong>Compartilhar</strong> (<Share className="w-3.5 h-3.5 inline text-blue-600" />) na barra do Safari ou nos três pontos (<strong>⋮</strong>) no Chrome.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-[#1B4D3E]/10 text-[#1B4D3E] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <p className="font-semibold text-stone-900">Adicionar à Tela de Início:</p>
                    <p className="text-stone-500">
                      Selecione <PlusSquare className="w-3.5 h-3.5 inline text-[#1B4D3E]" /> <strong>"Adicionar à Tela de Início"</strong> ou <strong>"Instalar aplicativo"</strong>.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="font-semibold text-emerald-900">Pronto para usar!</p>
                    <p className="text-emerald-700">O ícone do EcoApp abrirá em tela cheia como um app nativo, sem barras de navegador.</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowIOSModal(false)}
                className="w-full py-2.5 rounded-xl bg-[#1B4D3E] text-white text-xs font-semibold hover:bg-[#143c30] transition active:scale-98"
              >
                Entendido, vou instalar
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Variant === 'banner'
  if (bannerDismissed) return null;

  return (
    <>
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1B4D3E] via-[#245C4B] to-[#1B4D3E] text-white p-4 sm:p-5 shadow-lg border border-emerald-900/30">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              <img
                src="/pwa-192x192.png"
                alt="Ícone EcoApp"
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl shadow-md border border-white/20"
              />
              <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#88B04B] text-[9px] text-[#0F2D24] font-bold">
                ✓
              </span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="inline-flex items-center gap-1 rounded bg-[#88B04B]/20 text-[#A4D65E] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                  <Sparkles className="w-2.5 h-2.5" /> App Móvel
                </span>
                <span className="text-[11px] text-emerald-200">100% Nativo no Celular</span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white mt-0.5 leading-snug">
                Instale o EcoApp no seu celular
              </h3>
              <p className="text-xs text-emerald-100/80 mt-0.5 line-clamp-1 sm:line-clamp-none">
                Acesse ecopontos, notificações de coleta e pontos sem abrir o navegador.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleInstallClick}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#88B04B] hover:bg-[#97C555] active:scale-95 text-[#0F2D24] font-bold text-xs px-3.5 py-2 shadow-md transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Instalar</span>
            </button>
            <button
              onClick={() => setBannerDismissed(true)}
              className="p-1.5 text-emerald-300 hover:text-white rounded-lg hover:bg-white/10 transition"
              title="Dispensar aviso"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal with instructions for iOS or manual install */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-stone-100 text-stone-900">
            <button
              onClick={() => setShowIOSModal(false)}
              className="absolute top-4 right-4 p-1 rounded-full text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <img
                src="/pwa-192x192.png"
                alt="EcoApp"
                className="w-12 h-12 rounded-xl shadow-md border border-stone-200"
              />
              <div>
                <h3 className="text-base font-bold text-stone-900 leading-tight">EcoApp no Celular</h3>
                <p className="text-xs text-stone-500">Ipatinga Sustentável</p>
              </div>
            </div>

            <div className="space-y-3 my-4 text-xs text-stone-700 bg-stone-50 p-4 rounded-xl border border-stone-100">
              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-full bg-[#1B4D3E]/10 text-[#1B4D3E] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <p className="font-semibold text-stone-900">No navegador do celular:</p>
                  <p className="text-stone-500">
                    Toque no ícone de <strong>Compartilhar</strong> (<Share className="w-3.5 h-3.5 inline text-blue-600" />) no Safari ou menu de opções (<strong>⋮</strong>) no Chrome.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-full bg-[#1B4D3E]/10 text-[#1B4D3E] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <p className="font-semibold text-stone-900">Adicionar à Tela de Início:</p>
                  <p className="text-stone-500">
                    Role e toque em <PlusSquare className="w-3.5 h-3.5 inline text-[#1B4D3E]" /> <strong>"Adicionar à Tela de Início"</strong>.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                </div>
                <div>
                  <p className="font-semibold text-emerald-900">Instalação Leve e Rápida</p>
                  <p className="text-emerald-700">Não consome memória do aparelho e atualiza sozinho sempre que houver novidades em Ipatinga.</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full py-2.5 rounded-xl bg-[#1B4D3E] text-white text-xs font-semibold hover:bg-[#143c30] transition active:scale-98"
            >
              Fechar Instruções
            </button>
          </div>
        </div>
      )}
    </>
  );
};
