import React, { useState } from 'react';
import {
  Building2,
  Users,
  Recycle,
  AlertTriangle,
  PlusCircle,
  Edit,
  Trash2,
  CheckCircle2,
  Clock,
  TrendingUp,
  MapPin,
  X,
  Phone,
  ArrowLeft,
  ShieldAlert,
  Search,
} from 'lucide-react';
import { DISPOSAL_POINTS } from '../../data/mockEcoData';
import { DisposalPoint, WasteCategory } from '../../types/ecoapp';

interface AdminViewProps {
  onBackToApp: () => void;
}

export const AdminView: React.FC<AdminViewProps> = ({ onBackToApp }) => {
  const [points, setPoints] = useState<DisposalPoint[]>(DISPOSAL_POINTS);
  const [activeAdminTab, setActiveAdminTab] = useState<'metrics' | 'points' | 'reports'>('metrics');
  const [searchTerm, setSearchTerm] = useState('');

  // New point form state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newHours, setNewHours] = useState('Seg a Sáb: 07h às 19h');
  const [newPhone, setNewPhone] = useState('(31) 3829-8135');
  const [newType, setNewType] = useState<DisposalPoint['type']>('ecoponto');

  const handleToggleActive = (id: string) => {
    setPoints(
      points.map((p) => (p.id === id ? { ...p, openNow: !p.openNow } : p))
    );
  };

  const handleAddPoint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newAddress.trim()) return;

    const newPoint: DisposalPoint = {
      id: `eco-admin-${Date.now()}`,
      name: newName,
      type: newType,
      category: ['moveis_entulho', 'podas', 'reciclavel_comum'],
      address: newAddress,
      distance: '1.5 km',
      hours: newHours,
      phone: newPhone,
      accepts: ['Móveis', 'Entulho', 'Podas', 'Recicláveis comuns'],
      tips: 'Ponto cadastrado via Painel Administrativo SESUMA.',
      lat: -19.4600,
      lng: -42.5400,
      rating: 5.0,
      openNow: true,
      isOfficial: true,
      responsible: 'Prefeitura Municipal de Ipatinga',
    };

    setPoints([newPoint, ...points]);
    setIsAddModalOpen(false);
    setNewName('');
    setNewAddress('');
  };

  const filteredPoints = points.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-150">
      {/* Top Banner with back button */}
      <section className="bg-stone-900 text-white rounded-3xl p-6 sm:p-7 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBackToApp}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar ao App</span>
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px] font-mono-code uppercase tracking-wider text-stone-300">
                  Painel de Gestão Municipal
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-0.5">
                SESUMA · Zeladoria & Resíduos de Ipatinga
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 bg-[#8CE28A] text-[#142816] rounded-xl text-xs font-bold hover:bg-[#7BD479] transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Novo Ponto de Coleta</span>
            </button>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-2 pt-3 border-t border-white/10 text-xs">
          {[
            { id: 'metrics', label: 'Métricas da Cidade', icon: TrendingUp },
            { id: 'points', label: `Gerenciar Pontos (${points.length})`, icon: Building2 },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeAdminTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveAdminTab(tab.id as typeof activeAdminTab)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-white text-stone-900 font-bold'
                    : 'bg-white/10 text-stone-300 hover:bg-white/20'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Admin Tab 1: Métricas Globais */}
      {activeAdminTab === 'metrics' && (
        <section className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl bg-white border border-stone-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-1">
              <span className="text-xs text-stone-500 font-medium">Moradores Ativos</span>
              <div className="text-2xl font-bold text-stone-900 font-mono-code tabular-nums">
                1.780
              </div>
              <span className="text-[11px] text-emerald-700 font-semibold">+14% este mês</span>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-stone-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-1">
              <span className="text-xs text-stone-500 font-medium">Descartes Registrados</span>
              <div className="text-2xl font-bold text-[#143D1A] font-mono-code tabular-nums">
                4.250
              </div>
              <span className="text-[11px] text-stone-400">Total acumulado</span>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-stone-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-1">
              <span className="text-xs text-stone-500 font-medium">Recicláveis Coletados</span>
              <div className="text-2xl font-bold text-stone-900 font-mono-code tabular-nums">
                14.280 kg
              </div>
              <span className="text-[11px] text-stone-400">Destinados à COOPERCAVA</span>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-stone-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-1">
              <span className="text-xs text-stone-500 font-medium">Taxa de Resolução</span>
              <div className="text-2xl font-bold text-emerald-800 font-mono-code tabular-nums">
                87.5%
              </div>
              <span className="text-[11px] text-stone-400">Denúncias atendidas</span>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-stone-200/90 p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-3">
            <h3 className="text-sm font-bold text-stone-900">
              Descarte por Região de Ipatinga (Toneladas)
            </h3>
            <div className="space-y-2">
              {[
                { name: 'Região 1: Cidade Nobre / Esperança / Bom Jardim', pct: 36 },
                { name: 'Região 2: Horto / Cariru / Iguaçu', pct: 28 },
                { name: 'Região 3: Canaã / Bethânia / Vila Celeste', pct: 24 },
                { name: 'Região 4: Centro / Veneza', pct: 12 },
              ].map((r, i) => (
                <div key={i} className="space-y-1 text-xs">
                  <div className="flex items-center justify-between text-stone-600">
                    <span>{r.name}</span>
                    <span className="font-mono-code font-bold text-stone-900">{r.pct}%</span>
                  </div>
                  <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#143D1A] rounded-full" style={{ width: `${r.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Admin Tab 2: Gestão de Pontos */}
      {activeAdminTab === 'points' && (
        <section className="bg-white rounded-3xl border border-stone-200/90 p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Filtrar instalações..."
                className="w-full pl-9 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="space-y-2.5">
            {filteredPoints.map((point) => (
              <div
                key={point.id}
                className="p-4 rounded-2xl border border-stone-200 bg-stone-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2 font-mono-code text-[11px] text-stone-500 mb-0.5">
                    <span className="font-bold uppercase text-stone-800">{point.type}</span>
                    <span>·</span>
                    <span>{point.address.split('—')[0]}</span>
                  </div>
                  <h4 className="font-bold text-stone-900">{point.name}</h4>
                  <p className="text-[11px] text-stone-500 mt-0.5">{point.hours}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleToggleActive(point.id)}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
                      point.openNow
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        : 'bg-stone-200 text-stone-600 hover:bg-stone-300'
                    }`}
                  >
                    {point.openNow ? 'Ativo / Aberto' : 'Inativo / Fechado'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Add Point Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="text-base font-bold text-stone-900">Cadastrar Ponto de Coleta SESUMA</h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddPoint} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-stone-700 block mb-1">Nome da Instalação:</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ex: Ecoponto Municipal Bairro Iguaçu"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Endereço Completo em Ipatinga:</label>
                <input
                  type="text"
                  required
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  placeholder="Rua, número e bairro..."
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Horário de Funcionamento:</label>
                  <input
                    type="text"
                    value={newHours}
                    onChange={(e) => setNewHours(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Telefone da Unidade:</label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold cursor-pointer"
                >
                  Salvar Instalação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
