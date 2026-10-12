import React, { useState } from 'react';
import {
  Repeat,
  PlusCircle,
  Heart,
  MapPin,
  Clock,
  CheckCircle2,
  Sparkles,
  MessageCircle,
  Tag,
  User,
  Share2,
  X,
  Send,
  ShieldCheck,
  Package,
} from 'lucide-react';
import { SwapItem } from '../../types/ecoapp';
import { INITIAL_SWAP_ITEMS } from '../../data/mockEcoData';
import { subscribeToDonations, addDonation, auth } from '../../lib/firebase';

interface DonationsViewProps {
  onEarnPoints: (pts: number, reason: string) => void;
}

export const DonationsView: React.FC<DonationsViewProps> = ({ onEarnPoints }) => {
  const [items, setItems] = useState<SwapItem[]>(INITIAL_SWAP_ITEMS);
  const [filterType, setFilterType] = useState<'todos' | 'doacao' | 'troca'>('todos');
  const [filterCategory, setFilterCategory] = useState<string>('todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  React.useEffect(() => {
    const unsubscribe = subscribeToDonations((liveDonations) => {
      if (liveDonations && liveDonations.length > 0) {
        setItems(liveDonations);
      }
    });
    return () => unsubscribe();
  }, []);

  // Direct Message Chat Modal state
  const [activeChatItem, setActiveChatItem] = useState<SwapItem | null>(null);
  const [chatMessages, setChatMessages] = useState<{ sender: 'user' | 'owner'; text: string; time: string }[]>([]);
  const [chatInput, setChatInput] = useState('');

  // New item form states
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<SwapItem['category']>('moveis');
  const [newType, setNewType] = useState<'doacao' | 'troca'>('doacao');
  const [newCondition, setNewCondition] = useState<SwapItem['condition']>('Seminovo em ótimo estado');
  const [newDescription, setNewDescription] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [newNeighborhood, setNewNeighborhood] = useState('Bairro Cidade Nobre, Ipatinga');
  const [newImage, setNewImage] = useState('');

  const categories = [
    { id: 'todos', label: 'Todas as Categorias' },
    { id: 'moveis', label: 'Móveis & Decoração' },
    { id: 'eletronicos', label: 'Eletrônicos & Tech' },
    { id: 'livros', label: 'Livros & Estudos' },
    { id: 'plantas', label: 'Mudas & Jardinagem' },
    { id: 'roupas', label: 'Roupas & Calçados' },
  ];

  const filteredItems = items.filter((item) => {
    const matchType = filterType === 'todos' || item.type === filterType;
    const matchCategory = filterCategory === 'todos' || item.category === filterCategory;
    return matchType && matchCategory;
  });

  const handleOpenChat = (item: SwapItem) => {
    setActiveChatItem(item);
    setChatMessages([
      {
        sender: 'owner',
        text: `Olá! Sou o(a) ${item.authorName}. O item "${item.title}" está disponível para retirada em ${item.authorNeighborhood.split('—')[0]}.`,
        time: 'Agora',
      },
    ]);
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || !activeChatItem) return;

    const userText = chatInput.trim();
    const newMsgList = [
      ...chatMessages,
      { sender: 'user' as const, text: userText, time: 'Agora mesmo' },
    ];
    setChatMessages(newMsgList);
    setChatInput('');

    // Simulated quick reply from owner
    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'owner',
          text: `Combinado! Podemos marcar a entrega no Parque Ipanema ou no endereço do Cidade Nobre. Obrigado por fazer a economia circular acontecer!`,
          time: 'Agora mesmo',
        },
      ]);
    }, 1200);
  };

  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDescription.trim()) return;

    const defaultImages = {
      moveis: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=600&q=80',
      eletronicos: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=600&q=80',
      livros: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=600&q=80',
      plantas: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=600&q=80',
      roupas: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=600&q=80',
      outros: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=600&q=80',
    };

    const newItem: SwapItem = {
      id: `swap-${Date.now()}`,
      title: newTitle,
      category: newCategory,
      type: newType,
      condition: newCondition,
      description: newDescription,
      authorName: newAuthor || 'Você (Morador)',
      authorNeighborhood: newNeighborhood,
      imageUrl: newImage || defaultImages[newCategory],
      publishedAt: 'Agora mesmo',
      available: true,
      distance: '0 m (Seu Anúncio)',
    };

    setItems([newItem, ...items]);
    addDonation(newItem, auth.currentUser?.uid || 'cidadao-ipatinga').catch((err) =>
      console.warn('Firestore donation sync error:', err)
    );
    setIsModalOpen(false);
    onEarnPoints(50, `Publicou "${newTitle}" para circular na comunidade`);
    setToastMessage(`Item anunciado com sucesso! Você recebeu +50 EcoPontos por incentivar a economia circular.`);
    setTimeout(() => setToastMessage(null), 5000);

    setNewTitle('');
    setNewDescription('');
    setNewImage('');
  };

  const handleToggleReserve = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, available: !item.available } : item
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <section className="bg-white rounded-2xl border border-stone-200/90 p-5 sm:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-stone-500 mb-1.5">
              <span>Economia Circular entre Vizinhos</span>
              <span aria-hidden="true">·</span>
              <span className="text-[#1B5223] font-semibold">Ipatinga - MG</span>
              <span aria-hidden="true">·</span>
              <span>Descarte Zero</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#142816] tracking-tight">
              Vitrine de Doações & Trocas Sustentáveis
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-2xl leading-relaxed">
              O que não serve mais para você pode ser o tesouro do seu vizinho. Doe móveis, eletrônicos, livros e mudas antes de descartar, diminuindo o lixo urbano e fortalecendo a comunidade.
            </p>
          </div>

          {/* New Item Button */}
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#143D1A] hover:bg-[#1B5223] text-white text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0"
          >
            <PlusCircle className="w-4 h-4 text-[#8CE28A]" />
            <span>Anunciar Doação ou Troca (+50 pts)</span>
          </button>
        </div>

        {/* Toast Feedback */}
        {toastMessage && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2 animate-in fade-in duration-150">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Segmented Filter Bar: Type (Doação / Troca) & Categories */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 mt-4 border-t border-stone-100">
          {/* Type tabs */}
          <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-xl">
            {[
              { id: 'todos', label: 'Todos os Itens' },
              { id: 'doacao', label: 'Doações Gratuitas' },
              { id: 'troca', label: 'Trocas Sustentáveis' },
            ].map((tab) => {
              const isSelected = filterType === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFilterType(tab.id as typeof filterType)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white text-stone-900 shadow-xs font-semibold'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {categories.map((cat) => {
              const isSelected = filterCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setFilterCategory(cat.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[#143D1A] text-white font-semibold'
                      : 'bg-stone-50 hover:bg-stone-100 text-stone-600 border border-stone-200/80'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Modern Marketplace Cards Grid (Olio/Vinted Style) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filteredItems.map((item) => {
          const isDoacao = item.type === 'doacao';

          return (
            <article
              key={item.id}
              className="bg-white rounded-2xl border border-stone-200/90 overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between group hover:border-[#143D1A] transition-all"
            >
              <div>
                {/* Image container with badges */}
                <div className="relative aspect-[4/3] w-full bg-stone-100 overflow-hidden">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  {/* Overlay gradient scrim for legibility */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

                  {/* Top tags */}
                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between text-[10px] font-bold">
                    <span
                      className={`px-2.5 py-1 rounded-lg backdrop-blur-md shadow-xs ${
                        isDoacao
                          ? 'bg-emerald-600/90 text-white'
                          : 'bg-amber-600/90 text-white'
                      }`}
                    >
                      {isDoacao ? 'Doação Gratuita' : 'Troca Sustentável'}
                    </span>

                    {item.distance && (
                      <span className="px-2 py-0.5 rounded-lg bg-black/60 text-white backdrop-blur-md font-mono-code font-normal">
                        {item.distance}
                      </span>
                    )}
                  </div>

                  {/* Bottom title scrim */}
                  <div className="absolute bottom-2 left-2.5 right-2.5 text-white">
                    <span className="text-[10px] text-white/80 block uppercase tracking-wider font-semibold font-mono-code">
                      {item.condition}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-2">
                  <h3 className="text-sm font-bold text-stone-900 leading-snug line-clamp-1 group-hover:text-[#143D1A] transition-colors">
                    {item.title}
                  </h3>

                  <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>

                  <div className="pt-2 border-t border-stone-100 text-xs text-stone-500 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-stone-400" />
                      <span className="font-medium text-stone-700">{item.authorName}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <MapPin className="w-3.5 h-3.5 text-stone-400" />
                      <span className="truncate">{item.authorNeighborhood}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action footer */}
              <div className="p-4 pt-0">
                {item.available ? (
                  <button
                    type="button"
                    onClick={() => handleOpenChat(item)}
                    className="w-full py-2.5 rounded-xl bg-stone-100 hover:bg-[#143D1A] text-stone-800 hover:text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Tenho Interesse · Combinar</span>
                  </button>
                ) : (
                  <div className="w-full py-2 rounded-xl bg-stone-100 text-stone-400 font-semibold text-xs text-center">
                    Item Já Reservado
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {/* Direct Message Chat Modal (Mobbin Chat Pattern) */}
      {activeChatItem && (
        <div className="fixed inset-0 z-50 bg-[#142816]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-stone-200 flex flex-col h-[520px] animate-in fade-in zoom-in-95 duration-150 overflow-hidden">
            {/* Header */}
            <div className="px-5 py-3.5 border-b border-stone-100 flex items-center justify-between bg-stone-50/70">
              <div className="flex items-center gap-3">
                <img
                  src={activeChatItem.imageUrl}
                  alt={activeChatItem.title}
                  className="w-10 h-10 rounded-xl object-cover border border-stone-200"
                />
                <div>
                  <h4 className="text-xs font-bold text-stone-900 leading-tight">
                    {activeChatItem.title}
                  </h4>
                  <p className="text-[11px] text-stone-500">
                    Conversando com <span className="font-semibold text-stone-700">{activeChatItem.authorName}</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveChatItem(null)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#FAFBF9]">
              <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 text-[11px] text-emerald-800 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <p>
                  Dica de Segurança: Combine a retirada em locais públicos movimentados de Ipatinga (ex: Parque Ipanema, portaria do condomínio ou comércio próximo).
                </p>
              </div>

              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex flex-col ${
                    msg.sender === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-[#143D1A] text-white rounded-br-xs'
                        : 'bg-white text-stone-800 border border-stone-200 shadow-xs rounded-bl-xs'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[10px] text-stone-400 mt-0.5 px-1 font-mono-code">
                    {msg.time}
                  </span>
                </div>
              ))}
            </div>

            {/* Suggested quick replies */}
            <div className="p-2 border-t border-stone-100 bg-white flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
              {[
                'Ainda está disponível?',
                'Posso retirar hoje no Cidade Nobre?',
                'Combinamos no Parque Ipanema?',
              ].map((quick) => (
                <button
                  key={quick}
                  type="button"
                  onClick={() => {
                    setChatInput(quick);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-[11px] whitespace-nowrap transition-colors cursor-pointer"
                >
                  {quick}
                </button>
              ))}
            </div>

            {/* Message input */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-stone-100 bg-white flex items-center gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Escreva uma mensagem respeitosa..."
                className="flex-1 px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#143D1A]"
              />
              <button
                type="submit"
                className="p-2 bg-[#143D1A] text-white rounded-xl hover:bg-[#1B5223] transition-colors cursor-pointer shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* New Donation Item Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#142816]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#143D1A] text-white flex items-center justify-center font-bold">
                  <Package className="w-4 h-4 text-[#8CE28A]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#142816]">Anunciar Item</h3>
                  <p className="text-xs text-stone-500">Incentive a economia circular em Ipatinga</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateItem} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-stone-700 block mb-1">Título do Item:</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ex: Escrivaninha de estudos em madeira"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#143D1A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Tipo:</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as 'doacao' | 'troca')}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#143D1A]"
                  >
                    <option value="doacao">Doação Gratuita</option>
                    <option value="troca">Troca Sustentável</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Categoria:</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as SwapItem['category'])}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#143D1A]"
                  >
                    <option value="moveis">Móveis & Decoração</option>
                    <option value="eletronicos">Eletrônicos & Tech</option>
                    <option value="livros">Livros & Estudos</option>
                    <option value="plantas">Mudas & Jardinagem</option>
                    <option value="roupas">Roupas & Calçados</option>
                    <option value="outros">Outros</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Condição:</label>
                  <select
                    value={newCondition}
                    onChange={(e) => setNewCondition(e.target.value as SwapItem['condition'])}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#143D1A]"
                  >
                    <option value="Novo">Novo</option>
                    <option value="Seminovo em ótimo estado">Seminovo em ótimo estado</option>
                    <option value="Bom estado">Bom estado</option>
                    <option value="Com pequenos reparos">Com pequenos reparos</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Bairro em Ipatinga:</label>
                  <input
                    type="text"
                    required
                    value={newNeighborhood}
                    onChange={(e) => setNewNeighborhood(e.target.value)}
                    placeholder="Ex: Cidade Nobre, Ipatinga"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#143D1A]"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Descrição do Item:</label>
                <textarea
                  required
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Conte medidas, motivo do desapego e disponibilidade de horário para retirada..."
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#143D1A]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#143D1A] hover:bg-[#1B5223] text-white font-bold shadow-xs cursor-pointer"
                >
                  Publicar Item (+50 EcoPontos)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
