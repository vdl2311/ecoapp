export type EcoMainTab =
  | 'home'
  | 'map'
  | 'dispose'
  | 'donate'
  | 'profile'
  | 'calendar'
  | 'report'
  | 'guide'
  | 'rewards'
  | 'admin';

export type WasteCategory =
  | 'todos'
  | 'eletronicos'
  | 'oleo'
  | 'moveis_entulho'
  | 'medicamentos'
  | 'reciclavel_comum'
  | 'pilhas_baterias'
  | 'podas';

export interface DisposalPoint {
  id: string;
  name: string;
  type: 'ecoponto' | 'farmacia' | 'supermercado' | 'ponto_comunitario' | 'cooperativa' | 'instituicao';
  category: WasteCategory[];
  address: string;
  distance: string;
  hours: string;
  phone?: string;
  accepts: string[];
  tips: string;
  lat: number;
  lng: number;
  rating: number;
  openNow?: boolean;
  responsible?: string;
  isOfficial?: boolean;
}

export interface CollectionSchedule {
  id: string;
  dayOfWeek: string;
  period: 'Manhã (07h - 12h)' | 'Tarde (13h - 18h)' | 'Noite (19h - 23h)';
  type: 'comum' | 'seletiva' | 'cata_treco';
  title: string;
  description: string;
  allowedItems: string[];
  forbiddenItems: string[];
  isActiveToday?: boolean;
}

export interface RecyclingItemGuide {
  id: string;
  name: string;
  category: 'plastico' | 'papel' | 'vidro' | 'metal' | 'oleo' | 'eletronico' | 'medicamento' | 'organico' | 'moveis' | 'entulho' | 'podas';
  recyclable: boolean;
  howToPrepare: string[];
  whereToDispose: string;
  commonMistakes: string;
  iconName: string;
  destinationBin: 'reciclavel' | 'organico' | 'ecoponto' | 'farmacia';
  searchAliases: string[];
  canSchedulePickup?: boolean;
}

export interface SwapItem {
  id: string;
  title: string;
  category: 'moveis' | 'eletronicos' | 'roupas' | 'livros' | 'plantas' | 'eletrodomesticos' | 'outros';
  type: 'doacao' | 'troca';
  condition: 'Novo' | 'Seminovo em ótimo estado' | 'Bom estado' | 'Com pequenos reparos';
  description: string;
  authorName: string;
  authorNeighborhood: string;
  imageUrl: string;
  publishedAt: string;
  available: boolean;
  distance?: string;
  targetInstitution?: string;
}

export interface EnvironmentalReport {
  id: string;
  protocol: string;
  type: 'descarte_irregular' | 'lixo_acumulado' | 'entulho_calcada' | 'terreno_sujo' | 'bueiro_entupido';
  title: string;
  description: string;
  address: string;
  status: 'recebido' | 'em_analise' | 'equipe_a_caminho' | 'resolvido';
  reportedAt: string;
  imageUrl?: string;
  upvotes: number;
  hasUpvoted?: boolean;
  responseNote?: string;
  timeline?: { step: string; date: string; completed: boolean }[];
}

export interface PickupRequest {
  id: string;
  protocol: string;
  itemType: 'moveis' | 'eletrodomesticos' | 'entulho_ensacado' | 'podas_galhos';
  itemQuantity: string;
  preferredDate: string;
  address: string;
  neighborhood: string;
  phone: string;
  status: 'agendado' | 'confirmado' | 'coletado';
  createdAt: string;
  instructions?: string;
}

export interface RewardCoupon {
  id: string;
  partnerName: string;
  partnerCategory: 'Padaria & Confeitaria' | 'Hortifruti & Feira' | 'Mercado de Bairro' | 'Cafeteria & Lanches' | 'Oficina & Artesanato';
  title: string;
  discount: string;
  pointsCost: number;
  validUntil: string;
  code: string;
  claimed?: boolean;
  address?: string;
}

export interface SustainabilityChallenge {
  id: string;
  title: string;
  description: string;
  points: number;
  progress: number;
  target: number;
  unit: string;
  completed: boolean;
  icon: string;
  deadline?: string;
}

export interface CommunityEvent {
  id: string;
  title: string;
  category: 'feira' | 'mutirao' | 'oficina' | 'alerta';
  date: string;
  time: string;
  location: string;
  description: string;
  participantsCount: number;
  joined?: boolean;
}

export interface PointsTransaction {
  id: string;
  type: 'earned' | 'spent';
  amount: number;
  description: string;
  timestamp: string;
  category: string;
}

export interface UserLevel {
  id: string;
  name: string;
  minPoints: number;
  badge: string;
  perk: string;
}

export interface NeighborhoodRanking {
  neighborhood: string;
  recycledKg: number;
  oilLiters: number;
  participantsCount: number;
  rank: number;
}

export type UserRole = 'citizen' | 'merchant' | 'agent';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  neighborhood: string;
  cpfOrCnpj?: string;
  avatar?: string;
  businessName?: string;
  isLoggedIn: boolean;
  memberSince?: string;
}
