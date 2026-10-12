import React, { useState, useMemo } from 'react';
import {
  MapPin,
  Search,
  Clock,
  Phone,
  Navigation,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Info,
  Maximize2,
  Minimize2,
  Compass,
  Building2,
  Recycle,
  Droplet,
  Smartphone,
  Sofa,
  Pill,
  Leaf,
  Layers,
  List,
  Map,
  Filter,
  Heart,
  Check,
} from 'lucide-react';
import { DisposalPoint, WasteCategory } from '../../types/ecoapp';
import { DISPOSAL_POINTS } from '../../data/mockEcoData';
import { EcopointDetailSheet } from '../modals/EcopointDetailSheet';

interface MapViewProps {
  onConfirmDisposal: (point: DisposalPoint) => void;
  favorites: string[];
  onToggleFavorite: (pointId: string) => void;
  initialSelectedPoint?: DisposalPoint | null;
}

export const MapView: React.FC<MapViewProps> = ({
  onConfirmDisposal,
  favorites,
  onToggleFavorite,
  initialSelectedPoint,
}) => {
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [selectedFilter, setSelectedFilter] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyOpenNow, setOnlyOpenNow] = useState(false);
  const [onlyOfficial, setOnlyOfficial] = useState(false);
  const [activeSheetPoint, setActiveSheetPoint] = useState<DisposalPoint | null>(
    initialSelectedPoint || DISPOSAL_POINTS[0]
  );
  const [mapZoom, setMapZoom] = useState(1);

  const filterChips = [
    { id: 'todos', label: 'Todos', icon: Layers },
    { id: 'ecoponto', label: 'Ecopontos', icon: Building2 },
    { id: 'reciclavel_comum', label: 'Reciclagem', icon: Recycle },
    { id: 'oleo', label: 'Óleo', icon: Droplet },
    { id: 'eletronicos', label: 'Eletrônicos', icon: Smartphone },
    { id: 'medicamentos', label: 'Medicamentos', icon: Pill },
    { id: 'instituicao', label: 'Doação', icon: Heart },
    { id: 'cooperativa', label: 'Coleta/Cooperativa', icon: Navigation },
  ];

  const filteredPoints = useMemo(() => {
    return DISPOSAL_POINTS.filter((point) => {
      // Type / Category match
      let matchTypeOrCat = true;
      if (selectedFilter !== 'todos') {
        if (selectedFilter === 'ecoponto') {
          matchTypeOrCat = point.type === 'ecoponto';
        } else if (selectedFilter === 'cooperativa') {
          matchTypeOrCat = point.type === 'cooperativa';
        } else if (selectedFilter === 'instituicao') {
          matchTypeOrCat = point.type === 'instituicao';
        } else {
          matchTypeOrCat = point.category.includes(selectedFilter as WasteCategory);
        }
      }

      // Open now filter
      const matchOpen = !onlyOpenNow || point.openNow;

      // Official ecopoint filter
      const matchOfficial = !onlyOfficial || point.isOfficial;

      // Query search
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        point.name.toLowerCase().includes(q) ||
        point.address.toLowerCase().includes(q) ||
        point.accepts.some((mat) => mat.toLowerCase().includes(q));

      return matchTypeOrCat && matchOpen && matchOfficial && matchSearch;
    });
  }, [selectedFilter, onlyOpenNow, onlyOfficial, searchQuery]);

  // Convert GPS coordinates to normalized relative SVG canvas coordinates (Ipatinga bounding box)
  const getMapPosition = (lat: number, lng: number) => {
    const minLat = -19.49;
    const maxLat = -19.44;
    const minLng = -42.57;
    const maxLng = -42.51;

    const x = ((lng - minLng) / (maxLng - minLng)) * 100;
    const y = ((maxLat - lat) / (maxLat - minLat)) * 100;

    return {
      left: `${Math.max(8, Math.min(92, x))}%`,
      top: `${Math.max(8, Math.min(92, y))}%`,
    };
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto animate-in fade-in duration-150">
      {/* Search Header & Segmented Filter Bar */}
      <section className="bg-white rounded-3xl border border-stone-200/90 p-4 sm:p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Top Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="O que você quer descartar? (Ex: sofá, óleo, bateria)..."
              className="w-full pl-10 pr-9 py-2 bg-stone-50 border border-stone-200 rounded-2xl text-xs placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-[#143D1A] font-medium"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-700 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Toggle Mapa vs Lista + Quick open filters */}
          <div className="flex items-center gap-2 shrink-0">
            {/* View Mode Toggle */}
            <div className="flex items-center p-1 bg-stone-100 rounded-xl">
              <button
                type="button"
                onClick={() => setViewMode('map')}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  viewMode === 'map'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Map className="w-3.5 h-3.5" />
                <span>Mapa</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>Lista ({filteredPoints.length})</span>
              </button>
            </div>

            {/* Aberto agora checkbox chip */}
            <button
              type="button"
              onClick={() => setOnlyOpenNow(!onlyOpenNow)}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-colors cursor-pointer flex items-center gap-1.5 ${
                onlyOpenNow
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-semibold'
                  : 'bg-stone-50 border-stone-200 text-stone-600'
              }`}
            >
              <Clock className="w-3 h-3 text-emerald-600" />
              <span className="hidden sm:inline">Aberto agora</span>
            </button>
          </div>
        </div>

        {/* Horizontal Chips Carousel */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-stone-100 no-scrollbar">
          {filterChips.map((chip) => {
            const Icon = chip.icon;
            const isSelected = selectedFilter === chip.id;
            return (
              <button
                key={chip.id}
                type="button"
                onClick={() => setSelectedFilter(chip.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#143D1A] text-white font-semibold shadow-xs'
                    : 'bg-stone-100 hover:bg-stone-200/70 text-stone-700 border border-stone-200/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-[#8CE28A]' : 'text-stone-400'}`} />
                <span>{chip.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Main Content: Map Mode or List Mode */}
      {viewMode === 'map' ? (
        <div className="space-y-4">
          {/* Map Canvas */}
          <div className="bg-white rounded-3xl border border-stone-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.02)] overflow-hidden">
            {/* Top Toolbar */}
            <div className="px-4 py-2.5 border-b border-stone-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-semibold text-stone-800">Mapa Geográfico de Ipatinga</span>
                <span className="text-stone-400 font-mono-code text-[11px] hidden sm:inline">
                  · {filteredPoints.length} pontos encontrados
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setMapZoom((z) => Math.max(0.8, z - 0.15))}
                  className="p-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-600"
                  title="Diminuir Zoom"
                >
                  <Minimize2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setMapZoom(1)}
                  className="px-2 py-0.5 rounded-lg bg-stone-100 text-[10px] font-mono-code text-stone-600"
                >
                  {Math.round(mapZoom * 100)}%
                </button>
                <button
                  type="button"
                  onClick={() => setMapZoom((z) => Math.min(1.4, z + 0.15))}
                  className="p-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-600"
                  title="Aumentar Zoom"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Stylized SVG Interactive Map */}
            <div className="relative w-full h-[400px] sm:h-[460px] bg-[#EBF0E8] overflow-hidden select-none">
              <div
                className="w-full h-full relative transition-transform duration-200 ease-out origin-center"
                style={{ transform: `scale(${mapZoom})` }}
              >
                {/* SVG Landmarks */}
                <svg
                  className="w-full h-full absolute inset-0 pointer-events-none opacity-85"
                  viewBox="0 0 800 600"
                  preserveAspectRatio="none"
                >
                  {/* Terrain */}
                  <path d="M 50,40 Q 180,20 280,80 T 400,60 L 380,220 L 120,200 Z" fill="#DFE9DC" opacity="0.6" />
                  <path d="M 450,280 Q 560,250 680,300 T 780,450 L 520,520 Z" fill="#DFE9DC" opacity="0.5" />

                  {/* Parque Ipanema Grounds */}
                  <rect x="370" y="240" width="140" height="120" rx="24" fill="#C4DEC0" stroke="#A0C69A" strokeWidth="2" />
                  <ellipse cx="440" cy="300" rx="36" ry="22" fill="#9CC5DB" opacity="0.8" />
                  <text x="440" y="304" textAnchor="middle" fill="#1F4D66" fontSize="10" fontWeight="700">
                    Lago Parque Ipanema
                  </text>

                  {/* Ribeirão Ipanema Axis */}
                  <path d="M 50,160 Q 220,180 340,240 T 480,340 T 640,430 T 780,500" fill="none" stroke="#9CC5DB" strokeWidth="8" strokeLinecap="round" />

                  {/* Avenues */}
                  <path d="M 120,50 L 320,230" stroke="#D0DCD0" strokeWidth="5" strokeDasharray="6,4" />
                  <path d="M 330,80 L 460,240" stroke="#D0DCD0" strokeWidth="5" />
                  <path d="M 280,260 L 520,380" stroke="#D0DCD0" strokeWidth="6" />
                  <path d="M 110,320 L 320,460" stroke="#D0DCD0" strokeWidth="5" />
                </svg>

                {/* Neighborhood labels */}
                <span className="absolute top-[12%] left-[18%] text-[11px] font-bold text-stone-500/70 select-none tracking-wider pointer-events-none">
                  CIDADE NOBRE
                </span>
                <span className="absolute top-[20%] left-[52%] text-[11px] font-bold text-stone-500/70 select-none tracking-wider pointer-events-none">
                  HORTO
                </span>
                <span className="absolute top-[42%] left-[62%] text-[11px] font-bold text-stone-500/70 select-none tracking-wider pointer-events-none">
                  CARIRU
                </span>
                <span className="absolute top-[52%] left-[44%] text-[11px] font-bold text-stone-500/70 select-none tracking-wider pointer-events-none">
                  IGUAÇU
                </span>
                <span className="absolute top-[60%] left-[16%] text-[11px] font-bold text-stone-500/70 select-none tracking-wider pointer-events-none">
                  CANAÃ / BETHÂNIA
                </span>
                <span className="absolute bottom-[10%] right-[22%] text-[11px] font-bold text-stone-500/70 select-none tracking-wider pointer-events-none">
                  CENTRO
                </span>

                {/* Interactive Points on Map */}
                {filteredPoints.map((point) => {
                  const pos = getMapPosition(point.lat, point.lng);
                  const isSelected = activeSheetPoint?.id === point.id;
                  const isFav = favorites.includes(point.id);

                  return (
                    <button
                      key={point.id}
                      type="button"
                      onClick={() => setActiveSheetPoint(point)}
                      style={{ left: pos.left, top: pos.top }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200 z-20 group focus:outline-none"
                      title={`${point.name} (${point.distance})`}
                    >
                      {isSelected && (
                        <span className="absolute -inset-2 rounded-full bg-[#143D1A]/20 animate-ping pointer-events-none" />
                      )}

                      <div
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-2xl shadow-md border transition-all ${
                          isSelected
                            ? 'bg-[#143D1A] text-white border-white scale-110 ring-2 ring-[#8CE28A]'
                            : 'bg-white text-stone-800 border-stone-300 hover:scale-105'
                        }`}
                      >
                        <MapPin className={`w-3.5 h-3.5 ${isSelected ? 'text-[#8CE28A]' : 'text-[#143D1A]'}`} />
                        <span className="text-[10px] font-bold whitespace-nowrap max-w-[90px] truncate">
                          {point.name.replace('Ecoponto Municipal ', '')}
                        </span>
                        {isFav && <span className="text-[9px]">❤️</span>}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Horizontally Scrollable Drawer Preview Cards (Mobbin Hybrid Pattern) */}
          <div className="bg-white rounded-3xl border border-stone-200/90 p-4 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-2">
            <div className="flex items-center justify-between text-xs px-1">
              <span className="font-bold text-stone-800">
                Deslize para ver os {filteredPoints.length} pontos encontrados:
              </span>
              <span className="text-stone-400">Toque para abrir a ficha completa</span>
            </div>

            <div className="flex items-stretch gap-3 overflow-x-auto pb-1 no-scrollbar">
              {filteredPoints.map((point) => {
                const isSelected = activeSheetPoint?.id === point.id;
                const isFav = favorites.includes(point.id);

                return (
                  <div
                    key={point.id}
                    onClick={() => setActiveSheetPoint(point)}
                    className={`min-w-[270px] sm:min-w-[300px] p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 shrink-0 ${
                      isSelected
                        ? 'bg-[#143D1A]/5 border-[#143D1A] ring-1 ring-[#143D1A]'
                        : 'bg-stone-50 hover:bg-stone-100/70 border-stone-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between text-[11px] text-stone-500 mb-1 font-mono-code">
                        <span className="font-semibold uppercase text-emerald-800">{point.type}</span>
                        <div className="flex items-center gap-1 font-bold text-stone-800">
                          <span>{point.distance}</span>
                          {isFav && <span>❤️</span>}
                        </div>
                      </div>

                      <h4 className="text-xs font-bold text-stone-900 leading-snug line-clamp-1">
                        {point.name}
                      </h4>

                      <p className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">
                        {point.address}
                      </p>

                      <div className="flex flex-wrap gap-1 mt-2">
                        {point.accepts.slice(0, 3).map((mat, i) => (
                          <span
                            key={i}
                            className="text-[10px] bg-white border border-stone-200/80 px-2 py-0.5 rounded-md text-stone-600 truncate max-w-[120px]"
                          >
                            ✓ {mat}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between text-[11px]">
                      <span className="text-emerald-700 font-semibold flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Aberto até 19h
                      </span>

                      <span className="text-xs font-bold text-[#143D1A] flex items-center gap-1">
                        <span>Ficha</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* List Mode View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPoints.map((point) => (
            <div
              key={point.id}
              onClick={() => setActiveSheetPoint(point)}
              className="bg-white rounded-3xl border border-stone-200/90 p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:border-[#143D1A] transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-stone-500 mb-1 font-mono-code">
                  <span className="font-semibold uppercase text-emerald-800">{point.type}</span>
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-stone-800">{point.distance}</span>
                    {favorites.includes(point.id) && <span>❤️</span>}
                  </div>
                </div>

                <h3 className="text-sm font-bold text-stone-900 group-hover:text-[#143D1A] transition-colors leading-snug">
                  {point.name}
                </h3>

                <p className="text-xs text-stone-500 mt-1 leading-relaxed line-clamp-2">
                  {point.address}
                </p>

                <div className="space-y-1 mt-3 pt-3 border-t border-stone-100 text-xs">
                  <span className="text-[11px] font-semibold text-stone-700 block">
                    Aceita para descarte:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {point.accepts.map((mat, i) => (
                      <span
                        key={i}
                        className="text-[10px] bg-stone-50 border border-stone-200 px-2 py-0.5 rounded-md text-stone-600"
                      >
                        ✓ {mat}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  Aberto agora
                </span>
                <span className="font-bold text-[#143D1A] flex items-center gap-1">
                  <span>Ver Detalhes</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bottom Sheet Detail Modal */}
      {activeSheetPoint && (
        <EcopointDetailSheet
          point={activeSheetPoint}
          onClose={() => setActiveSheetPoint(null)}
          onConfirmDisposal={(pt) => {
            onConfirmDisposal(pt);
            setActiveSheetPoint(null);
          }}
          isFavorite={favorites.includes(activeSheetPoint.id)}
          onToggleFavorite={onToggleFavorite}
        />
      )}
    </div>
  );
};
