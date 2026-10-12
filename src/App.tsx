import React, { useState, useEffect } from 'react';
import {
  PhoneCall,
  CheckCircle2,
  AlertTriangle,
  Bot,
  Truck,
  Heart,
  Recycle,
} from 'lucide-react';
import { EcoMainTab, DisposalPoint, EnvironmentalReport, PointsTransaction, UserProfile } from './types/ecoapp';
import { Navbar } from './components/Navbar';
import { HomeView } from './components/views/HomeView';
import { DisposalFlowView } from './components/views/DisposalFlowView';
import { MapView } from './components/views/MapView';
import { DonationsView } from './components/views/DonationsView';
import { CalendarView } from './components/views/CalendarView';
import { ReportsView } from './components/views/ReportsView';
import { GuideView } from './components/views/GuideView';
import { RewardsView } from './components/views/RewardsView';
import { ProfileView } from './components/views/ProfileView';
import { AdminView } from './components/views/AdminView';
import { NotificationsModal } from './components/modals/NotificationsModal';
import { EcoAIModal } from './components/modals/EcoAIModal';
import { DisposalSuccessModal } from './components/modals/DisposalSuccessModal';
import { LoginModal } from './components/modals/LoginModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import {
  INITIAL_REPORTS,
  INITIAL_POINTS_TRANSACTIONS,
  DISPOSAL_POINTS,
  DEMO_USERS,
} from './data/mockEcoData';
import confetti from 'canvas-confetti';
import {
  auth,
  testConnection,
  onAuthStateChanged,
  firebaseSignOut,
  subscribeToReports,
  recordPointsTransaction,
} from './lib/firebase';

export default function App() {
  const [currentTab, setCurrentTab] = useState<EcoMainTab>('home');
  const [neighborhood, setNeighborhood] = useState<string>('Bairro Cidade Nobre — Ipatinga, MG');

  // Authenticated user state
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('ecoapp_current_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return DEMO_USERS[0]; // Joaquim Morador by default
  });

  // EcoPoints persistent state
  const [userPoints, setUserPoints] = useState<number>(() => {
    const saved = localStorage.getItem('ecoapp_points');
    return saved ? parseInt(saved, 10) : 380;
  });

  // Favorites state
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('ecoapp_favorites');
    return saved ? JSON.parse(saved) : ['eco-01', 'eco-04'];
  });

  // Transactions ledger state
  const [transactions, setTransactions] = useState<PointsTransaction[]>(
    INITIAL_POINTS_TRANSACTIONS
  );

  // Environmental reports state
  const [reports, setReports] = useState<EnvironmentalReport[]>(INITIAL_REPORTS);

  // Modals state
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [successModalData, setSuccessModalData] = useState<{
    point: DisposalPoint;
    pointsWon: number;
  } | null>(null);

  // Map focused point state
  const [focusedMapPoint, setFocusedMapPoint] = useState<DisposalPoint | null>(null);

  useEffect(() => {
    localStorage.setItem('ecoapp_points', userPoints.toString());
  }, [userPoints]);

  useEffect(() => {
    localStorage.setItem('ecoapp_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('ecoapp_current_user', JSON.stringify(currentUser));
  }, [currentUser]);

  // Firebase initial connection test and listeners
  useEffect(() => {
    testConnection();

    // Subscribe to real-time reports from Firestore
    const unsubscribeReports = subscribeToReports((liveReports) => {
      if (liveReports && liveReports.length > 0) {
        setReports(liveReports);
      }
    });

    // Subscribe to Firebase Auth state
    const unsubscribeAuth = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        setCurrentUser((prev) => {
          if (prev.isLoggedIn && prev.id === fbUser.uid) return prev;
          return {
            id: fbUser.uid,
            name: fbUser.displayName || prev.name || 'Morador de Ipatinga',
            email: fbUser.email || prev.email,
            role: prev.role || 'citizen',
            neighborhood: prev.neighborhood || 'Bairro Cidade Nobre — Ipatinga, MG',
            avatar: fbUser.photoURL || prev.avatar,
            isLoggedIn: true,
            memberSince: prev.memberSince || 'Outubro de 2026',
          };
        });
      }
    });

    return () => {
      unsubscribeReports();
      unsubscribeAuth();
    };
  }, []);

  const handleLogin = (user: UserProfile) => {
    setCurrentUser(user);
    if (user.neighborhood) {
      setNeighborhood(user.neighborhood);
    }
  };

  const handleLogout = () => {
    firebaseSignOut(auth).catch(() => {});
    const guestUser: UserProfile = {
      id: 'guest',
      name: 'Visitante',
      email: 'visitante@ipatinga.cidadao.br',
      role: 'citizen',
      neighborhood: neighborhood,
      isLoggedIn: false,
    };
    setCurrentUser(guestUser);
  };

  const handleEarnPoints = (points: number, reason: string) => {
    setUserPoints((prev) => prev + points);

    // Register transaction
    const newTx: PointsTransaction = {
      id: `tx-${Date.now()}`,
      type: 'earned',
      amount: points,
      description: reason,
      timestamp: 'Hoje',
      category: reason.includes('descarte') ? 'Descarte' : 'Comunidade',
    };
    setTransactions((prev) => [newTx, ...prev]);

    // Persist to Firestore if user is authenticated
    if (currentUser.isLoggedIn && currentUser.id !== 'guest') {
      recordPointsTransaction(currentUser.id, {
        type: 'earned',
        amount: points,
        description: reason,
        timestamp: 'Hoje',
        category: reason.includes('descarte') ? 'Descarte' : 'Comunidade',
      }).catch((err) => console.warn('Points Firestore sync:', err));
    }

    try {
      confetti({
        particleCount: 45,
        spread: 70,
        origin: { y: 0.8 },
        colors: ['#143D1A', '#22C55E', '#8CE28A', '#F59E0B'],
      });
    } catch {
      // Safe fallback
    }
  };

  const handleSpendPoints = (points: number, reason: string): boolean => {
    if (userPoints < points) return false;
    setUserPoints((prev) => prev - points);

    const newTx: PointsTransaction = {
      id: `tx-${Date.now()}`,
      type: 'spent',
      amount: points,
      description: reason,
      timestamp: 'Hoje',
      category: 'Recompensas',
    };
    setTransactions((prev) => [newTx, ...prev]);

    // Persist to Firestore if user is authenticated
    if (currentUser.isLoggedIn && currentUser.id !== 'guest') {
      recordPointsTransaction(currentUser.id, {
        type: 'spent',
        amount: points,
        description: reason,
        timestamp: 'Hoje',
        category: 'Recompensas',
      }).catch((err) => console.warn('Points spend Firestore sync:', err));
    }
    return true;
  };

  const handleToggleFavorite = (pointId: string) => {
    setFavorites((prev) =>
      prev.includes(pointId) ? prev.filter((id) => id !== pointId) : [...prev, pointId]
    );
  };

  // Called when user clicks "Descartei Aqui"
  const handleConfirmDisposal = (point: DisposalPoint) => {
    handleEarnPoints(30, `Descarte responsável em ${point.name}`);
    setSuccessModalData({
      point,
      pointsWon: 30,
    });
  };

  const handleSelectPointOnMap = (point: DisposalPoint) => {
    setFocusedMapPoint(point);
    setCurrentTab('map');
  };

  return (
    <div className="min-h-screen bg-[#F7F9F6] text-[#142816] flex flex-col font-sans-body antialiased selection:bg-[#8CE28A]/40 selection:text-[#142816] pb-[calc(6.5rem+env(safe-area-inset-bottom,0px))] md:pb-12">
      {/* Top Application Bar with Navigation & Quick Actions */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        userPoints={userPoints}
        neighborhood={neighborhood}
        onSelectNeighborhood={setNeighborhood}
        unreadAlertsCount={2}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenAI={() => setIsAIOpen(true)}
        currentUser={currentUser}
        onOpenLogin={() => setIsLoginModalOpen(true)}
      />

      {/* Main Screen Views Switcher */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-3.5 sm:py-5">
        {currentTab === 'home' && (
          <HomeView
            neighborhood={neighborhood}
            onNavigate={setCurrentTab}
            onSelectPoint={handleSelectPointOnMap}
            onOpenAI={() => setIsAIOpen(true)}
            favorites={favorites}
            currentUser={currentUser}
            onOpenLogin={() => setIsLoginModalOpen(true)}
          />
        )}

        {currentTab === 'dispose' && (
          <DisposalFlowView
            onSelectPointOnMap={handleSelectPointOnMap}
            onOpenSchedule={() => setCurrentTab('calendar')}
            onConfirmDisposal={handleConfirmDisposal}
          />
        )}

        {currentTab === 'map' && (
          <MapView
            onConfirmDisposal={handleConfirmDisposal}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            initialSelectedPoint={focusedMapPoint}
          />
        )}

        {currentTab === 'donate' && (
          <DonationsView onEarnPoints={handleEarnPoints} />
        )}

        {currentTab === 'calendar' && (
          <CalendarView neighborhood={neighborhood} />
        )}

        {currentTab === 'report' && (
          <ReportsView onEarnPoints={handleEarnPoints} neighborhood={neighborhood} />
        )}

        {currentTab === 'guide' && (
          <GuideView onEarnPoints={handleEarnPoints} />
        )}

        {currentTab === 'rewards' && (
          <RewardsView userPoints={userPoints} onSpendPoints={handleSpendPoints} />
        )}

        {currentTab === 'profile' && (
          <ProfileView
            userPoints={userPoints}
            neighborhood={neighborhood}
            onSelectNeighborhood={setNeighborhood}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            onSelectPoint={handleSelectPointOnMap}
            transactions={transactions}
            reports={reports}
            onOpenAdmin={() => setCurrentTab('admin')}
            currentUser={currentUser}
            onOpenLogin={() => setIsLoginModalOpen(true)}
            onLogout={handleLogout}
          />
        )}

        {currentTab === 'admin' && (
          <AdminView onBackToApp={() => setCurrentTab('home')} />
        )}
      </main>

      {/* Municipal Footer (Clean & Professional) */}
      {currentTab !== 'admin' && (
        <footer className="mt-12 max-w-7xl w-full mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-3xl border border-stone-200/90 p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#143D1A] text-[#8CE28A] flex items-center justify-center font-bold text-sm">
                E
              </div>
              <div>
                <span className="font-bold text-stone-900 block">
                  EcoApp · Ipatinga Sustentável
                </span>
                <span className="text-[11px] text-stone-500">
                  Prefeitura Municipal de Ipatinga · SESUMA & COOPERCAVA
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-stone-600 text-[11px]">
              <span className="bg-stone-50 px-3 py-1 rounded-xl border border-stone-200/80 flex items-center gap-1.5 font-medium">
                <PhoneCall className="w-3 h-3 text-[#143D1A]" />
                <span>SESUMA: (31) 3829-8135</span>
              </span>
              <button
                type="button"
                onClick={() => setCurrentTab('calendar')}
                className="bg-stone-50 hover:bg-stone-100 px-3 py-1 rounded-xl border border-stone-200/80 font-medium cursor-pointer"
              >
                Cata-Treco Gratuito
              </button>
              <button
                type="button"
                onClick={() => setCurrentTab('admin')}
                className="bg-stone-50 hover:bg-stone-100 px-3 py-1 rounded-xl border border-stone-200/80 font-medium text-stone-500 cursor-pointer"
              >
                Acesso SESUMA
              </button>
            </div>
          </div>
        </footer>
      )}

      {/* Notifications Modal */}
      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        neighborhood={neighborhood}
      />

      {/* EcoAI Assistant Modal */}
      <EcoAIModal
        isOpen={isAIOpen}
        onClose={() => setIsAIOpen(false)}
        onSelectPointOnMap={handleSelectPointOnMap}
        onOpenSchedule={() => {
          setIsAIOpen(false);
          setCurrentTab('calendar');
        }}
        neighborhood={neighborhood}
      />

      {/* Disposal Celebration Success Modal */}
      {successModalData && (
        <DisposalSuccessModal
          isOpen={true}
          onClose={() => setSuccessModalData(null)}
          pointName={successModalData.point.name}
          pointsEarned={successModalData.pointsWon}
          totalPoints={userPoints}
          onViewImpact={() => {
            setSuccessModalData(null);
            setCurrentTab('profile');
          }}
        />
      )}

      {/* User Login & Authentication Area Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        currentUser={currentUser}
        onLogin={handleLogin}
        onLogout={handleLogout}
      />

      {/* Offline Connectivity Indicator */}
      <OfflineIndicator />
    </div>
  );
}
