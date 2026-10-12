import React, { useState } from 'react';
import {
  AlertTriangle,
  Camera,
  MapPin,
  Clock,
  ThumbsUp,
  CheckCircle2,
  Truck,
  PlusCircle,
  FileText,
  Sparkles,
  ShieldCheck,
  X,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { EnvironmentalReport } from '../../types/ecoapp';
import { INITIAL_REPORTS } from '../../data/mockEcoData';
import { subscribeToReports, addReport, upvoteReportInDb, auth } from '../../lib/firebase';

interface ReportsViewProps {
  onEarnPoints: (pts: number, reason: string) => void;
  neighborhood: string;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ onEarnPoints, neighborhood }) => {
  const [reports, setReports] = useState<EnvironmentalReport[]>(INITIAL_REPORTS);
  const [filterStatus, setFilterStatus] = useState<'todos' | 'em_andamento' | 'resolvido'>('todos');
  const [activeReportDetails, setActiveReportDetails] = useState<EnvironmentalReport | null>(null);

  React.useEffect(() => {
    const unsubscribe = subscribeToReports((liveReports) => {
      if (liveReports && liveReports.length > 0) {
        setReports(liveReports);
      }
    });
    return () => unsubscribe();
  }, []);

  // New report modal state
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportTitle, setReportTitle] = useState('');
  const [reportType, setReportType] = useState<EnvironmentalReport['type']>('descarte_irregular');
  const [reportAddress, setReportAddress] = useState('');
  const [reportDesc, setReportDesc] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [reportPhoto, setReportPhoto] = useState('');

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const filteredReports = reports.filter((r) => {
    if (filterStatus === 'em_andamento') {
      return r.status === 'recebido' || r.status === 'em_analise' || r.status === 'equipe_a_caminho';
    }
    if (filterStatus === 'resolvido') {
      return r.status === 'resolvido';
    }
    return true;
  });

  const handleUpvote = (id: string) => {
    setReports((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const alreadyUpvoted = r.hasUpvoted;
          const delta = alreadyUpvoted ? -1 : 1;
          if (!alreadyUpvoted) {
            onEarnPoints(10, 'Apoiou uma ocorrência ambiental do bairro');
            setToastMessage('Apoio registrado! Mais vizinhos corroborando aumentam a prioridade na SESUMA (+10 pts).');
            upvoteReportInDb(id).catch(() => {});
          }
          return {
            ...r,
            upvotes: r.upvotes + delta,
            hasUpvoted: !alreadyUpvoted,
          };
        }
        return r;
      })
    );
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleCreateReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportTitle.trim() || !reportAddress.trim()) return;

    const protocol = `IPA-2026-${Math.floor(100 + Math.random() * 900)}`;
    const newReport: EnvironmentalReport = {
      id: `rep-${Date.now()}`,
      protocol,
      type: reportType,
      title: reportTitle,
      description: reportDesc || 'Ocorrência registrada via aplicativo EcoApp Ipatinga.',
      address: reportAddress,
      status: 'recebido',
      reportedAt: 'Agora mesmo',
      imageUrl:
        reportPhoto ||
        'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=600&q=80',
      upvotes: 1,
      hasUpvoted: true,
      responseNote:
        'Protocolo acolhido pelo Departamento de Limpeza Urbana e Fiscalização de Posturas da SESUMA.',
      timeline: [
        { step: 'Denúncia registrada pelo cidadão', date: 'Agora mesmo', completed: true },
        { step: 'Triagem e vistoria de campo', date: 'Previsão: 24h', completed: false },
        { step: 'Despacho da equipe de limpeza', date: 'Pendente', completed: false },
        { step: 'Limpeza e autuação concluída', date: 'Pendente', completed: false },
      ],
    };

    setReports([newReport, ...reports]);
    addReport(
      {
        type: newReport.type,
        title: newReport.title,
        description: newReport.description,
        address: newReport.address,
        status: 'recebido',
        reportedAt: 'Hoje',
        imageUrl: newReport.imageUrl,
        upvotes: 1,
      },
      auth.currentUser?.uid || 'cidadao-ipatinga'
    ).catch((err) => console.warn('Firestore report sync error:', err));

    setIsReportModalOpen(false);
    onEarnPoints(40, `Registrou denúncia cidadã #${protocol}`);
    setToastMessage(`Ocorrência #${protocol} cadastrada com sucesso! Você ganhou +40 EcoPontos como fiscal.`);
    setTimeout(() => setToastMessage(null), 5000);

    setReportTitle('');
    setReportAddress('');
    setReportDesc('');
    setReportPhoto('');
  };

  const getStatusBadge = (status: EnvironmentalReport['status']) => {
    switch (status) {
      case 'resolvido':
        return (
          <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100/70 px-2.5 py-0.5 rounded-lg flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Resolvido</span>
          </span>
        );
      case 'equipe_a_caminho':
        return (
          <span className="text-[11px] font-semibold text-blue-800 bg-blue-100/70 px-2.5 py-0.5 rounded-lg flex items-center gap-1">
            <Truck className="w-3 h-3 text-blue-600" />
            <span>Equipe Enviada</span>
          </span>
        );
      case 'em_analise':
        return (
          <span className="text-[11px] font-semibold text-amber-800 bg-amber-100/70 px-2.5 py-0.5 rounded-lg flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-600" />
            <span>Em Vistoria</span>
          </span>
        );
      default:
        return (
          <span className="text-[11px] font-semibold text-stone-700 bg-stone-100 px-2.5 py-0.5 rounded-lg flex items-center gap-1">
            <span>Recebido</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <section className="bg-white rounded-2xl border border-stone-200/90 p-5 sm:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-stone-500 mb-1.5">
              <span>Zeladoria Urbana Participativa</span>
              <span aria-hidden="true">·</span>
              <span className="text-[#1B5223] font-semibold">SESUMA Ipatinga</span>
              <span aria-hidden="true">·</span>
              <span>Canal Oficial de Ocorrências</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#142816] tracking-tight">
              Fiscal Cidadão & Denúncias Ambientais
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-2xl leading-relaxed">
              Fotografe e reporte descarte irregular de entulho em calçadas, terrenos sujos ou bueiros obstruídos em Ipatinga. Acompanhe a linha do tempo do atendimento da prefeitura em tempo real.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsReportModalOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#143D1A] hover:bg-[#1B5223] text-white text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0"
          >
            <Camera className="w-4 h-4 text-[#8CE28A]" />
            <span>Reportar Ocorrência (+40 pts)</span>
          </button>
        </div>

        {/* Feedback banner */}
        {toastMessage && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2 animate-in fade-in duration-150">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Filter status tabs */}
        <div className="flex items-center gap-1.5 pt-4 mt-4 border-t border-stone-100 overflow-x-auto">
          {[
            { id: 'todos', label: 'Todas as Ocorrências' },
            { id: 'em_andamento', label: 'Em Atendimento' },
            { id: 'resolvido', label: 'Concluídas & Limpas' },
          ].map((tab) => {
            const isSelected = filterStatus === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterStatus(tab.id as typeof filterStatus)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'bg-[#143D1A] text-white font-semibold shadow-xs'
                    : 'bg-stone-100 hover:bg-stone-200/70 text-stone-600 hover:text-stone-900 border border-stone-200/60'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Reports Feed Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {filteredReports.map((report) => (
          <article
            key={report.id}
            className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between space-y-4 hover:border-[#143D1A] transition-all"
          >
            <div>
              {/* Header: Protocol + Status + Date */}
              <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono-code font-bold text-stone-900 text-[11px]">
                    #{report.protocol}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="text-[11px]">{report.reportedAt}</span>
                </div>
                {getStatusBadge(report.status)}
              </div>

              {/* Title & Description */}
              <h3 className="text-sm sm:text-base font-bold text-stone-900 leading-snug mb-1">
                {report.title}
              </h3>
              <p className="text-xs text-stone-500 leading-relaxed mb-3">
                {report.description}
              </p>

              {/* Location */}
              <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/80 text-xs text-stone-700 flex items-start gap-2 mb-3">
                <MapPin className="w-3.5 h-3.5 text-[#143D1A] shrink-0 mt-0.5" />
                <span className="text-[11px] font-medium leading-relaxed">{report.address}</span>
              </div>

              {/* Timeline Preview (Mobbin Audit Trail Pattern) */}
              {report.timeline && (
                <div className="space-y-1.5 pt-2 border-t border-stone-100">
                  <span className="text-[10px] uppercase font-bold text-stone-400 font-mono-code block">
                    Linha do Tempo SESUMA
                  </span>
                  <div className="space-y-1">
                    {report.timeline.map((step, idx) => (
                      <div
                        key={idx}
                        className={`text-[11px] flex items-center justify-between px-2.5 py-1 rounded-lg ${
                          step.completed
                            ? 'bg-emerald-50/70 text-emerald-900 font-medium'
                            : 'bg-stone-50 text-stone-400'
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              step.completed ? 'bg-emerald-600' : 'bg-stone-300'
                            }`}
                          />
                          <span>{step.step}</span>
                        </span>
                        <span className="font-mono-code text-[10px] text-stone-500">
                          {step.date}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action Bar: Upvote button & Municipal Note */}
            <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => handleUpvote(report.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  report.hasUpvoted
                    ? 'bg-[#143D1A] text-white shadow-xs'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                }`}
              >
                <ThumbsUp className={`w-3.5 h-3.5 ${report.hasUpvoted ? 'text-[#8CE28A]' : ''}`} />
                <span>{report.upvotes} Apoios de Moradores</span>
              </button>

              <span className="text-[11px] text-stone-400 font-medium">
                Prioridade no Bairro
              </span>
            </div>
          </article>
        ))}
      </div>

      {/* New Report Modal */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#142816]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-800 flex items-center justify-center font-bold">
                  <AlertTriangle className="w-4 h-4 text-amber-700" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#142816]">Reportar Irregularidade</h3>
                  <p className="text-xs text-stone-500">Zeladoria Urbana · SESUMA Ipatinga</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsReportModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateReport} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-stone-700 block mb-1">
                  Tipo de Irregularidade:
                </label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value as EnvironmentalReport['type'])}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#143D1A]"
                >
                  <option value="descarte_irregular">Descarte clandestino de entulho ou sofás</option>
                  <option value="lixo_acumulado">Lixo doméstico fora do horário / rasgado na calçada</option>
                  <option value="bueiro_entupido">Bueiro entupido com risco de alagamento</option>
                  <option value="entulho_calcada">Obstrução total de calçada para pedestres</option>
                  <option value="terreno_sujo">Lote vago com acúmulo de lixo e risco de dengue</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Título Resumido:</label>
                <input
                  type="text"
                  required
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                  placeholder="Ex: Sofá e carcaças de TV jogados na calçada"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#143D1A]"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">
                  Local Exato em Ipatinga:
                </label>
                <input
                  type="text"
                  required
                  value={reportAddress}
                  onChange={(e) => setReportAddress(e.target.value)}
                  placeholder="Rua, número próximo ou esquina de referência..."
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#143D1A]"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">
                  Descrição dos Fatos:
                </label>
                <textarea
                  rows={3}
                  value={reportDesc}
                  onChange={(e) => setReportDesc(e.target.value)}
                  placeholder="Descreva detalhes como horário do despejo, placa se houver, ou risco imediato para bueiro/trânsito..."
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#143D1A]"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="anon"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="w-4 h-4 text-[#143D1A] rounded"
                />
                <label htmlFor="anon" className="text-stone-700 cursor-pointer">
                  Manter meu nome anônimo perante a vizinhança (somente a SESUMA terá o protocolo)
                </label>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#143D1A] hover:bg-[#1B5223] text-white font-bold shadow-xs cursor-pointer"
                >
                  Enviar Ocorrência (+40 pts)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
