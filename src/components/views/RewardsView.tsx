import React, { useState } from 'react';
import {
  Award,
  Sparkles,
  Ticket,
  CheckCircle2,
  Lock,
  Gift,
  Store,
  Clock,
  TrendingUp,
  Target,
  QrCode,
  X,
  Copy,
  Check,
  Building2,
  ShieldCheck,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react';
import { RewardCoupon, SustainabilityChallenge, PointsTransaction } from '../../types/ecoapp';
import {
  REWARD_COUPONS,
  SUSTAINABILITY_CHALLENGES,
  INITIAL_POINTS_TRANSACTIONS,
} from '../../data/mockEcoData';

interface RewardsViewProps {
  userPoints: number;
  onSpendPoints: (points: number, reason: string) => boolean;
}

export const RewardsView: React.FC<RewardsViewProps> = ({ userPoints, onSpendPoints }) => {
  const [coupons, setCoupons] = useState<RewardCoupon[]>(REWARD_COUPONS);
  const [challenges, setChallenges] = useState<SustainabilityChallenge[]>(SUSTAINABILITY_CHALLENGES);
  const [transactions, setTransactions] = useState<PointsTransaction[]>(INITIAL_POINTS_TRANSACTIONS);
  const [activeCouponModal, setActiveCouponModal] = useState<RewardCoupon | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  const handleClaimCoupon = (coupon: RewardCoupon) => {
    if (coupon.claimed) {
      setActiveCouponModal(coupon);
      return;
    }

    if (userPoints < coupon.pointsCost) {
      setErrorMessage(
        `Você precisa de ${coupon.pointsCost} EcoPontos para resgatar este benefício. Continue separando recicláveis e fazendo descarte consciente!`
      );
      setTimeout(() => setErrorMessage(null), 5000);
      return;
    }

    const success = onSpendPoints(coupon.pointsCost, `Resgatou benefício em ${coupon.partnerName}`);
    if (success) {
      const updatedCoupons = coupons.map((c) =>
        c.id === coupon.id ? { ...c, claimed: true } : c
      );
      setCoupons(updatedCoupons);

      // Add to transactions ledger
      const newTx: PointsTransaction = {
        id: `tx-${Date.now()}`,
        type: 'spent',
        amount: coupon.pointsCost,
        description: `Resgate: ${coupon.title}`,
        timestamp: 'Agora mesmo',
        category: 'Recompensas',
      };
      setTransactions([newTx, ...transactions]);

      setActiveCouponModal({ ...coupon, claimed: true });
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header & Digital Membership Card (Mobbin Fintech / Loyalty Pattern) */}
      <section className="bg-white rounded-2xl border border-stone-200/90 p-5 sm:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left Text */}
          <div className="lg:col-span-7">
            <div className="flex items-center gap-2 text-xs text-stone-500 mb-1.5">
              <span>Clube de Benefícios Sustentáveis</span>
              <span aria-hidden="true">·</span>
              <span className="text-[#1B5223] font-semibold">Comércio de Ipatinga</span>
              <span aria-hidden="true">·</span>
              <span>Economia Local</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#142816] tracking-tight">
              Seu Impacto Positivo Vira Descontos
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 mt-1 leading-relaxed">
              Cada atitude ecológica em Ipatinga — entrega de recicláveis à COOPERCAVA, descarte de óleo vegetal, doações de móveis e fiscalização cidadã — rende EcoPontos que você troca por benefícios reais no comércio do seu bairro.
            </p>

            {/* Error notification */}
            {errorMessage && (
              <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs animate-in fade-in duration-150">
                {errorMessage}
              </div>
            )}
          </div>

          {/* Right: Digital Member Card (Apple Wallet / Revolut style) */}
          <div className="lg:col-span-5">
            <div className="bg-gradient-to-br from-[#143D1A] via-[#1A4D23] to-[#0E2812] text-white p-5 rounded-2xl shadow-lg border border-white/10 relative overflow-hidden flex flex-col justify-between min-h-[190px]">
              {/* Subtle mesh background decoration */}
              <div className="absolute top-0 right-0 w-36 h-36 bg-[#8CE28A]/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-start justify-between relative z-10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-white/15 backdrop-blur-md flex items-center justify-center font-bold text-sm text-[#8CE28A]">
                    E
                  </div>
                  <div>
                    <span className="text-[10px] text-white/70 block uppercase font-mono-code tracking-wider">
                      EcoApp Ipatinga
                    </span>
                    <span className="text-xs font-bold text-white">Cartão Cidadão Verde</span>
                  </div>
                </div>
                <span className="text-[10px] bg-white/15 backdrop-blur-md px-2.5 py-0.5 rounded-full font-mono-code text-[#8CE28A] font-semibold border border-white/20">
                  NÍVEL 3 · GUARDIÃO
                </span>
              </div>

              <div className="my-3 relative z-10">
                <span className="text-[11px] text-white/70 block font-medium">Saldo Disponível</span>
                <div className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2 font-mono-code tabular-nums">
                  <span>{userPoints}</span>
                  <span className="text-sm font-normal text-[#8CE28A]">EcoPontos</span>
                </div>
              </div>

              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-white/70 relative z-10 font-mono-code">
                <span>ID: IPA-ECO-7729</span>
                <span>38 kg CO₂ Evitados</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Local Partner Vouchers Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#142816]">
              Cupons & Vantagens nos Bairros de Ipatinga
            </h2>
            <p className="text-xs text-stone-500">
              Descontos válidos em padarias, quitandas, mercados e feiras parceiras
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {coupons.map((coupon) => (
            <article
              key={coupon.id}
              className={`bg-white rounded-2xl border p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between transition-all ${
                coupon.claimed
                  ? 'border-emerald-300 bg-emerald-50/20'
                  : 'border-stone-200/90 hover:border-[#143D1A]'
              }`}
            >
              <div>
                {/* Header: Category + Discount */}
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-[11px] font-medium text-stone-500">
                    {coupon.partnerCategory}
                  </span>
                  <span className="font-mono-code font-bold text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">
                    {coupon.discount}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-stone-900 leading-snug mb-1">
                  {coupon.title}
                </h3>

                <p className="text-xs text-stone-600 font-medium flex items-center gap-1.5 mt-2">
                  <Store className="w-3.5 h-3.5 text-[#143D1A] shrink-0" />
                  <span>{coupon.partnerName}</span>
                </p>

                {coupon.address && (
                  <p className="text-[11px] text-stone-400 mt-1 pl-5 truncate">
                    {coupon.address}
                  </p>
                )}

                <div className="mt-3 pt-2 border-t border-stone-100 text-[11px] text-stone-500 flex items-center justify-between font-mono-code">
                  <span>Válido até: {coupon.validUntil}</span>
                  <span className="font-semibold text-stone-700">{coupon.pointsCost} pts</span>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-4 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => handleClaimCoupon(coupon)}
                  className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    coupon.claimed
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                      : userPoints >= coupon.pointsCost
                      ? 'bg-[#143D1A] hover:bg-[#1B5223] text-white shadow-xs'
                      : 'bg-stone-100 text-stone-400 cursor-not-allowed'
                  }`}
                >
                  {coupon.claimed ? (
                    <>
                      <QrCode className="w-4 h-4" />
                      <span>Ver QR Code / Cupom Ativo</span>
                    </>
                  ) : (
                    <>
                      <Ticket className="w-4 h-4" />
                      <span>Resgatar por {coupon.pointsCost} EcoPontos</span>
                    </>
                  )}
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Two columns: Sustainability Challenges & Points Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Challenges (6 cols) */}
        <section className="lg:col-span-6 bg-white rounded-2xl border border-stone-200/90 p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#142816]">Metas Mensais de Sustentabilidade</h3>
              <p className="text-xs text-stone-500">Conquiste bônus de pontos completando missões</p>
            </div>
            <Target className="w-4 h-4 text-stone-400" />
          </div>

          <div className="space-y-3">
            {challenges.map((ch) => {
              const progressPct = Math.min(100, Math.round((ch.progress / ch.target) * 100));

              return (
                <div
                  key={ch.id}
                  className="p-3.5 rounded-xl border border-stone-200/80 bg-stone-50/70 text-xs space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-stone-900 leading-snug">{ch.title}</h4>
                      <p className="text-[11px] text-stone-500 mt-0.5 leading-relaxed">
                        {ch.description}
                      </p>
                    </div>
                    <span className="font-mono-code font-bold text-emerald-800 text-[11px] shrink-0 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                      +{ch.points} pts
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div>
                    <div className="flex items-center justify-between text-[10px] text-stone-500 font-mono-code mb-1">
                      <span>
                        Progresso: {ch.progress} de {ch.target} {ch.unit}
                      </span>
                      <span className="font-bold text-stone-700">{progressPct}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#143D1A] rounded-full transition-all duration-300"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Right Column: Points Ledger (6 cols) */}
        <section className="lg:col-span-6 bg-white rounded-2xl border border-stone-200/90 p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#142816]">Extrato Recente de EcoPontos</h3>
              <p className="text-xs text-stone-500">Histórico de ações sustentáveis e resgates</p>
            </div>
            <Clock className="w-4 h-4 text-stone-400" />
          </div>

          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {transactions.map((tx) => {
              const isEarned = tx.type === 'earned';
              return (
                <div
                  key={tx.id}
                  className="p-3 rounded-xl border border-stone-100 bg-stone-50/50 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        isEarned ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-700'
                      }`}
                    >
                      {isEarned ? (
                        <ArrowDownLeft className="w-3.5 h-3.5" />
                      ) : (
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-medium text-stone-900 truncate text-[11px]">
                        {tx.description}
                      </h4>
                      <span className="text-[10px] text-stone-400 font-mono-code block">
                        {tx.timestamp} · {tx.category}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`font-mono-code font-bold text-xs shrink-0 ${
                      isEarned ? 'text-emerald-700' : 'text-stone-700'
                    }`}
                  >
                    {isEarned ? `+${tx.amount}` : `-${tx.amount}`} pts
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* In-Store Coupon Redemption Modal with QR Code */}
      {activeCouponModal && (
        <div className="fixed inset-0 z-50 bg-[#142816]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-stone-200 text-center space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100 text-left">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#143D1A] font-mono-code">
                  Cupom Ativo
                </span>
                <h3 className="text-sm font-bold text-stone-900 leading-tight">
                  {activeCouponModal.partnerName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveCouponModal(null)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Benefit info */}
            <div className="py-2">
              <span className="text-2xl font-bold text-[#143D1A] block">
                {activeCouponModal.discount}
              </span>
              <p className="text-xs text-stone-600 mt-1 leading-snug">
                {activeCouponModal.title}
              </p>
            </div>

            {/* Realistic QR Code Box */}
            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 flex flex-col items-center justify-center space-y-2">
              {/* Stylized QR Code SVG */}
              <div className="w-36 h-36 bg-white p-2.5 rounded-xl border border-stone-200 shadow-xs flex items-center justify-center">
                <svg
                  className="w-full h-full text-stone-900"
                  viewBox="0 0 100 100"
                  fill="currentColor"
                >
                  {/* Top-left position block */}
                  <rect x="5" y="5" width="28" height="28" fill="currentColor" />
                  <rect x="9" y="9" width="20" height="20" fill="white" />
                  <rect x="13" y="13" width="12" height="12" fill="currentColor" />

                  {/* Top-right position block */}
                  <rect x="67" y="5" width="28" height="28" fill="currentColor" />
                  <rect x="71" y="9" width="20" height="20" fill="white" />
                  <rect x="75" y="13" width="12" height="12" fill="currentColor" />

                  {/* Bottom-left position block */}
                  <rect x="5" y="67" width="28" height="28" fill="currentColor" />
                  <rect x="9" y="71" width="20" height="20" fill="white" />
                  <rect x="13" y="75" width="12" height="12" fill="currentColor" />

                  {/* Simulated QR data pixels */}
                  <rect x="40" y="8" width="6" height="6" />
                  <rect x="52" y="8" width="8" height="6" />
                  <rect x="40" y="20" width="8" height="8" />
                  <rect x="54" y="22" width="6" height="6" />
                  <rect x="8" y="40" width="6" height="6" />
                  <rect x="22" y="40" width="6" height="8" />
                  <rect x="36" y="38" width="10" height="10" />
                  <rect x="52" y="42" width="6" height="6" />
                  <rect x="66" y="40" width="8" height="6" />
                  <rect x="82" y="42" width="6" height="8" />
                  <rect x="40" y="56" width="8" height="6" />
                  <rect x="54" y="58" width="6" height="8" />
                  <rect x="68" y="56" width="6" height="6" />
                  <rect x="82" y="60" width="6" height="6" />
                  <rect x="38" y="72" width="8" height="8" />
                  <rect x="52" y="74" width="8" height="6" />
                  <rect x="68" y="72" width="6" height="10" />
                  <rect x="80" y="78" width="8" height="6" />
                </svg>
              </div>

              {/* Code with Copy */}
              <div className="flex items-center gap-1.5 pt-1">
                <span className="font-mono-code font-bold text-sm tracking-wider text-stone-900 bg-white px-2.5 py-1 rounded-lg border border-stone-200">
                  {activeCouponModal.code}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyCode(activeCouponModal.code)}
                  className="p-1.5 rounded-lg bg-white border border-stone-200 text-stone-600 hover:text-stone-900"
                  title="Copiar Código"
                >
                  {copiedCode ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            <p className="text-[11px] text-stone-500 leading-relaxed">
              Apresente esta tela ou informe o código alfanumérico ao operador de caixa do estabelecimento parceiro em Ipatinga.
            </p>

            <button
              type="button"
              onClick={() => setActiveCouponModal(null)}
              className="w-full py-2.5 bg-[#143D1A] text-white rounded-xl text-xs font-bold hover:bg-[#1B5223] transition-colors cursor-pointer shadow-xs"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
