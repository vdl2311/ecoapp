import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  Bell,
  CheckCircle2,
  AlertTriangle,
  Recycle,
  Trash2,
  Truck,
  Download,
  PlusCircle,
  X,
  Phone,
  MapPin,
  Info,
  CalendarCheck,
} from 'lucide-react';
import { CollectionSchedule, PickupRequest } from '../../types/ecoapp';
import { COLLECTION_SCHEDULES, INITIAL_PICKUP_REQUESTS } from '../../data/mockEcoData';

interface CalendarViewProps {
  neighborhood: string;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ neighborhood }) => {
  const [filterType, setFilterType] = useState<'todos' | 'seletiva' | 'comum' | 'cata_treco'>('todos');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  // Cata-Treco scheduling modal state
  const [isPickupModalOpen, setIsPickupModalOpen] = useState(false);
  const [pickupList, setPickupList] = useState<PickupRequest[]>(INITIAL_PICKUP_REQUESTS);
  const [itemType, setItemType] = useState<PickupRequest['itemType']>('moveis');
  const [itemQty, setItemQty] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [preferredDate, setPreferredDate] = useState('Próximo Sábado (10/10)');
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);

  const filtered = COLLECTION_SCHEDULES.filter((s) => {
    if (filterType === 'todos') return true;
    return s.type === filterType;
  });

  const handleToggleNotifications = () => {
    setNotificationsEnabled(!notificationsEnabled);
    if (!notificationsEnabled) {
      setNotificationMsg('Lembretes ativados! Você receberá aviso 30 minutos antes do caminhão passar.');
    } else {
      setNotificationMsg('Lembretes desativados.');
    }
    setTimeout(() => setNotificationMsg(null), 4000);
  };

  const handleExportICS = () => {
    const icsData = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//EcoApp Ipatinga//Coleta Seletiva//PT',
      'BEGIN:VEVENT',
      `SUMMARY:Coleta Seletiva em Ipatinga (${neighborhood})`,
      'DESCRIPTION:Coloque os sacos de recicláveis secos na calçada até as 12h30.',
      'RRULE:FREQ=WEEKLY;BYDAY=TU,TH',
      'DTSTART:20261006T130000Z',
      'DTEND:20261006T180000Z',
      'LOCATION:Ipatinga, MG',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `ecoapp-coleta-ipatinga.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setNotificationMsg('Arquivo de calendário (.ics) baixado! Importe no Google Agenda ou Apple Calendar.');
    setTimeout(() => setNotificationMsg(null), 5000);
  };

  const handleSchedulePickup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemQty.trim() || !address.trim() || !phone.trim()) return;

    const protocol = `IPA-TRECO-2026-${Math.floor(100 + Math.random() * 900)}`;
    const newReq: PickupRequest = {
      id: `pickup-${Date.now()}`,
      protocol,
      itemType,
      itemQuantity: itemQty,
      preferredDate,
      address,
      neighborhood: neighborhood.split('—')[0].trim(),
      phone,
      status: 'confirmado',
      createdAt: 'Hoje',
      instructions: 'Disponibilizar na calçada até as 07h da manhã da data confirmada.',
    };

    setPickupList([newReq, ...pickupList]);
    setIsPickupModalOpen(false);
    setBookingSuccess(`Agendamento #${protocol} confirmado com sucesso pela SESUMA Ipatinga!`);
    setItemQty('');
    setAddress('');
    setPhone('');
    setTimeout(() => setBookingSuccess(null), 6000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner (Mobbin Editorial Card) */}
      <section className="bg-white rounded-2xl border border-stone-200/90 p-5 sm:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-xs text-stone-500 mb-1.5">
              <span>Cronograma Oficial de Limpeza Urbana</span>
              <span aria-hidden="true">·</span>
              <span className="text-[#1B5223] font-semibold">{neighborhood.split('—')[0].trim()}</span>
              <span aria-hidden="true">·</span>
              <span>Vital Ambiental & COOPERCAVA</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#142816] tracking-tight">
              Calendário de Coleta & Cata-Treco
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 mt-1 leading-relaxed">
              Consulte os dias e turnos da coleta convencional e seletiva no seu bairro. Agende a retirada gratuita de sofás velhos, eletrodomésticos e podas pelo Cata-Treco Municipal.
            </p>
          </div>

          {/* Quick utility buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleToggleNotifications}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                notificationsEnabled
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold'
                  : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
              }`}
            >
              <Bell className="w-3.5 h-3.5 text-stone-600" />
              <span>{notificationsEnabled ? 'Lembretes Ativos' : 'Ativar Lembretes'}</span>
            </button>

            <button
              type="button"
              onClick={handleExportICS}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200 text-xs font-medium transition-all cursor-pointer"
              title="Baixar arquivo .ics para Google Calendar ou Apple Agenda"
            >
              <Download className="w-3.5 h-3.5 text-stone-600" />
              <span>Sincronizar Agenda</span>
            </button>

            <button
              type="button"
              onClick={() => setIsPickupModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#143D1A] hover:bg-[#1B5223] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5 text-[#8CE28A]" />
              <span>Agendar Cata-Treco</span>
            </button>
          </div>
        </div>

        {/* Feedback message banner */}
        {(notificationMsg || bookingSuccess) && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2 animate-in fade-in duration-150">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{notificationMsg || bookingSuccess}</span>
          </div>
        )}

        {/* Live Next Collection Highlight Box */}
        <div className="mt-5 p-4 sm:p-5 rounded-xl bg-[#143D1A] text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#8CE28A] text-[#143D1A] flex items-center justify-center font-bold shrink-0">
              <Recycle className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <span className="text-[11px] text-[#8CE28A] font-semibold tracking-wide uppercase font-mono-code block">
                Próxima Coleta em Seu Bairro
              </span>
              <h3 className="text-sm sm:text-base font-bold text-white mt-0.5">
                Terça-feira · Coleta Seletiva Porta a Porta (COOPERCAVA)
              </h3>
              <p className="text-xs text-white/80 mt-0.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#8CE28A]" />
                <span>Turno da Tarde (13h às 18h) · Colocar sacos na calçada até as 12h30</span>
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-white/10 w-full sm:w-auto">
            <span className="text-[11px] text-white/70 block">Bairro de Referência</span>
            <span className="text-xs font-semibold text-white">{neighborhood.split('—')[0]}</span>
          </div>
        </div>

        {/* Filter Tabs (Segmented Buttons) */}
        <div className="flex items-center gap-1.5 pt-4 mt-4 border-t border-stone-100 overflow-x-auto">
          {[
            { id: 'todos', label: 'Todos os Dias' },
            { id: 'seletiva', label: 'Apenas Coleta Seletiva' },
            { id: 'comum', label: 'Apenas Coleta Comum' },
            { id: 'cata_treco', label: 'Operação Cata-Treco' },
          ].map((tab) => {
            const isSelected = filterType === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterType(tab.id as typeof filterType)}
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

      {/* Weekly Matrix Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((sched) => {
          const isSeletiva = sched.type === 'seletiva';
          const isCataTreco = sched.type === 'cata_treco';

          return (
            <article
              key={sched.id}
              className={`bg-white rounded-2xl border p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between transition-all ${
                sched.isActiveToday
                  ? 'border-[#143D1A] ring-1 ring-[#143D1A]/30'
                  : 'border-stone-200/90'
              }`}
            >
              <div>
                {/* Header row */}
                <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
                  <span className="font-bold text-[#142816] text-sm">{sched.dayOfWeek}</span>
                  <div className="flex items-center gap-1 font-mono-code text-[11px]">
                    <Clock className="w-3 h-3 text-stone-400" />
                    <span>{sched.period}</span>
                  </div>
                </div>

                {/* Badge title */}
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                      isSeletiva
                        ? 'bg-emerald-100 text-emerald-800'
                        : isCataTreco
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-stone-100 text-stone-700'
                    }`}
                  >
                    {isSeletiva ? (
                      <Recycle className="w-3.5 h-3.5" />
                    ) : isCataTreco ? (
                      <Truck className="w-3.5 h-3.5" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                  </div>
                  <h4 className="text-xs font-bold text-stone-900 leading-snug">{sched.title}</h4>
                </div>

                <p className="text-xs text-stone-500 leading-relaxed mb-4">{sched.description}</p>

                {/* Allowed vs Forbidden Items */}
                <div className="space-y-3 pt-3 border-t border-stone-100 text-xs">
                  <div>
                    <span className="text-[11px] font-semibold text-emerald-800 block mb-1">
                      O que colocar para recolhimento:
                    </span>
                    <ul className="space-y-1">
                      {sched.allowedItems.map((item, i) => (
                        <li key={i} className="text-[11px] text-stone-600 flex items-start gap-1.5">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <span className="text-[11px] font-semibold text-rose-800 block mb-1">
                      Não colocar neste dia:
                    </span>
                    <ul className="space-y-1">
                      {sched.forbiddenItems.map((item, i) => (
                        <li key={i} className="text-[11px] text-stone-600 flex items-start gap-1.5">
                          <AlertTriangle className="w-3 h-3 text-rose-500 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {sched.isActiveToday && (
                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-[#143D1A] font-semibold">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Em andamento hoje
                  </span>
                  <span className="text-[11px] text-stone-500 font-normal">Acompanhe na rua</span>
                </div>
              )}
            </article>
          );
        })}
      </div>

      {/* User's Scheduled Pickups Ledger */}
      <section className="bg-white rounded-2xl border border-stone-200/90 p-5 sm:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-[#142816]">
              Seus Agendamentos de Cata-Treco (SESUMA)
            </h3>
            <p className="text-xs text-stone-500">
              Solicitações cadastradas para recolhimento residencial gratuito em Ipatinga
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsPickupModalOpen(true)}
            className="text-xs font-semibold text-[#143D1A] hover:underline cursor-pointer"
          >
            + Nova Solicitação
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {pickupList.map((req) => (
            <div
              key={req.id}
              className="p-3.5 rounded-xl border border-stone-200/90 bg-stone-50/70 text-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-[11px] text-stone-500 mb-1">
                  <span className="font-mono-code font-bold text-[#143D1A]">#{req.protocol}</span>
                  <span className="capitalize font-semibold text-emerald-800 bg-emerald-100/60 px-2 py-0.5 rounded-md">
                    {req.status}
                  </span>
                </div>
                <h4 className="font-bold text-stone-900 mt-1">{req.itemQuantity}</h4>
                <p className="text-[11px] text-stone-500 mt-0.5 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-stone-400" />
                  <span>
                    {req.address} · {req.neighborhood}
                  </span>
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-stone-200/60 text-[11px] text-stone-600 flex items-center justify-between">
                <span className="flex items-center gap-1 font-medium">
                  <CalendarCheck className="w-3.5 h-3.5 text-stone-400" />
                  <span>Data: {req.preferredDate}</span>
                </span>
                <span className="text-stone-400">SESUMA Ipatinga</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Agendamento Cata-Treco Interactive Modal */}
      {isPickupModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#142816]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#143D1A] text-white flex items-center justify-center font-bold">
                  <Truck className="w-4 h-4 text-[#8CE28A]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#142816]">Agendar Cata-Treco</h3>
                  <p className="text-xs text-stone-500">Prefeitura Municipal de Ipatinga · SESUMA</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPickupModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSchedulePickup} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-stone-700 block mb-1">
                  Tipo de Resíduo Volumoso:
                </label>
                <select
                  value={itemType}
                  onChange={(e) => setItemType(e.target.value as PickupRequest['itemType'])}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#143D1A]"
                >
                  <option value="moveis">Móveis velhos, sofás, armários desmontados</option>
                  <option value="eletrodomesticos">Eletrodomésticos grandes (fogão, geladeira, máquina)</option>
                  <option value="podas_galhos">Restos de poda e galhos amarrados</option>
                  <option value="entulho_ensacado">Entulho de pequena reforma em sacos (até 1m³)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">
                  Descrição e Quantidade de Itens:
                </label>
                <input
                  type="text"
                  required
                  value={itemQty}
                  onChange={(e) => setItemQty(e.target.value)}
                  placeholder="Ex: 1 sofá de 3 lugares e 1 colchão de casal"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#143D1A]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Endereço de Retirada:</label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Rua e número..."
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#143D1A]"
                  />
                </div>

                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Telefone para Contato:</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(31) 9...."
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#143D1A]"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Data Preferencial:</label>
                <select
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#143D1A]"
                >
                  <option value="Próxima Sexta-feira">Próxima Sexta-feira (Manhã: 07h às 12h)</option>
                  <option value="Próximo Sábado">Próximo Sábado (Manhã: 07h às 12h)</option>
                  <option value="Segunda-feira seguinte">Segunda-feira seguinte (Tarde: 13h às 18h)</option>
                </select>
              </div>

              <div className="bg-stone-50 p-3 rounded-xl border border-stone-200/80 text-[11px] text-stone-600 flex items-start gap-2">
                <Info className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
                <p>
                  O serviço é gratuito para moradores de Ipatinga. O caminhão recolherá os itens na calçada. Não deixe os materiais obstruindo garagens ou travessias.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPickupModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#143D1A] hover:bg-[#1B5223] text-white font-bold shadow-xs cursor-pointer"
                >
                  Confirmar Agendamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
