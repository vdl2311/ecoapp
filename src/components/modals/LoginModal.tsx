import React, { useState } from 'react';
import {
  X,
  User,
  Store,
  ShieldCheck,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle2,
  Phone,
  ArrowRight,
  LogOut,
  MapPin,
  Building2,
  KeyRound,
  AlertCircle,
  Globe,
} from 'lucide-react';
import { UserProfile, UserRole } from '../../types/ecoapp';
import { DEMO_USERS } from '../../data/mockEcoData';
import { auth, googleProvider, signInWithPopup, syncUserProfile } from '../../lib/firebase';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onLogin: (user: UserProfile) => void;
  onLogout: () => void;
}

const IPATINGA_NEIGHBORHOODS = [
  'Bairro Cidade Nobre — Ipatinga, MG',
  'Bairro Canaã — Ipatinga, MG',
  'Bairro Horto — Ipatinga, MG',
  'Bairro Bethânia — Ipatinga, MG',
  'Bairro Cariru — Ipatinga, MG',
  'Bairro Centro — Ipatinga, MG',
  'Bairro Iguaçu — Ipatinga, MG',
  'Bairro Esperança — Ipatinga, MG',
  'Bairro Bom Retiro — Ipatinga, MG',
  'Bairro Veneza — Ipatinga, MG',
  'Bairro Vila Celeste — Ipatinga, MG',
  'Bairro Ideal — Ipatinga, MG',
  'Bairro Bom Jardim — Ipatinga, MG',
  'Bairro Limoeiro — Ipatinga, MG',
];

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLogin,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [role, setRole] = useState<UserRole>('citizen');
  const [emailOrLogin, setEmailOrLogin] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Register form states
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regNeighborhood, setRegNeighborhood] = useState(IPATINGA_NEIGHBORHOODS[0]);
  const [regBusinessName, setRegBusinessName] = useState('');
  const [regPassword, setRegPassword] = useState('');

  // Status & feedback
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [forgotPasswordStep, setForgotPasswordStep] = useState(false);
  const [forgotInput, setForgotInput] = useState('');

  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;
      const googleProfile: UserProfile = {
        id: fbUser.uid,
        name: fbUser.displayName || 'Morador de Ipatinga',
        email: fbUser.email || 'cidadao@ipatinga.mg.gov.br',
        phone: fbUser.phoneNumber || undefined,
        role: role || 'citizen',
        neighborhood: regNeighborhood || IPATINGA_NEIGHBORHOODS[0],
        avatar: fbUser.photoURL || undefined,
        isLoggedIn: true,
        memberSince: 'Outubro de 2026',
      };
      await syncUserProfile(googleProfile).catch((err) =>
        console.warn('Firestore sync notice:', err)
      );
      onLogin(googleProfile);
      setFeedback({
        type: 'success',
        message: `Autenticado com sucesso via Google! Olá, ${googleProfile.name}.`,
      });
      setTimeout(() => {
        setFeedback(null);
        onClose();
      }, 850);
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user') {
        setFeedback({
          type: 'info',
          message: 'Janela de autenticação Google fechada.',
        });
      } else {
        setFeedback({
          type: 'error',
          message: `Falha ao autenticar com Google: ${err.message || 'Verifique sua conexão.'}`,
        });
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleQuickDemoLogin = (demoUser: typeof DEMO_USERS[0]) => {
    const userToLogin = {
      ...demoUser,
      isLoggedIn: true,
    };
    syncUserProfile(userToLogin).catch(() => {});
    onLogin(userToLogin);
    setFeedback({
      type: 'success',
      message: `Bem-vindo de volta, ${demoUser.name}! Sessão autenticada com sucesso.`,
    });
    setTimeout(() => {
      setFeedback(null);
      onClose();
    }, 900);
  };

  const handleStandardLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrLogin.trim()) {
      setFeedback({ type: 'error', message: 'Informe seu e-mail, CPF ou número de celular/WhatsApp.' });
      return;
    }
    if (!password.trim() || password.length < 4) {
      setFeedback({ type: 'error', message: 'A senha deve conter ao menos 4 dígitos.' });
      return;
    }

    // Find match or construct user
    const matched = DEMO_USERS.find(
      (u) =>
        u.email.toLowerCase() === emailOrLogin.trim().toLowerCase() ||
        u.phone === emailOrLogin.trim()
    );

    const loggedUser: UserProfile = matched || {
      id: `user-${Date.now()}`,
      name: emailOrLogin.includes('@') ? emailOrLogin.split('@')[0].replace('.', ' ') : 'Cidadão Conectado',
      email: emailOrLogin.includes('@') ? emailOrLogin.trim() : `${emailOrLogin.replace(/\D/g, '')}@ipatinga.cidadao.br`,
      phone: emailOrLogin.includes('@') ? '(31) 98800-2026' : emailOrLogin,
      role,
      neighborhood: IPATINGA_NEIGHBORHOODS[0],
      isLoggedIn: true,
      memberSince: 'Outubro de 2026',
    };

    onLogin(loggedUser);
    setFeedback({
      type: 'success',
      message: `Login realizado com sucesso! Olá, ${loggedUser.name}.`,
    });
    setTimeout(() => {
      setFeedback(null);
      onClose();
    }, 850);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || regName.length < 3) {
      setFeedback({ type: 'error', message: 'Por favor, informe seu nome completo.' });
      return;
    }
    if (!regEmail.trim() || !regEmail.includes('@')) {
      setFeedback({ type: 'error', message: 'Informe um endereço de e-mail válido.' });
      return;
    }
    if (role === 'merchant' && !regBusinessName.trim()) {
      setFeedback({ type: 'error', message: 'Informe a razão social ou nome fantasia do comércio de Ipatinga.' });
      return;
    }
    if (!regPassword || regPassword.length < 4) {
      setFeedback({ type: 'error', message: 'Defina uma senha segura com pelo menos 4 caracteres.' });
      return;
    }

    const newUser: UserProfile = {
      id: `user-${Date.now()}`,
      name: regName.trim(),
      email: regEmail.trim().toLowerCase(),
      phone: regPhone.trim() || '(31) 99000-0000',
      role,
      neighborhood: regNeighborhood,
      businessName: role === 'merchant' ? regBusinessName.trim() : undefined,
      isLoggedIn: true,
      memberSince: 'Outubro de 2026',
    };

    onLogin(newUser);
    setFeedback({
      type: 'success',
      message: `Conta criada com sucesso! Você ganhou 50 EcoPontos de boas-vindas para usar em Ipatinga.`,
    });
    setTimeout(() => {
      setFeedback(null);
      onClose();
    }, 1100);
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotInput.trim()) {
      setFeedback({ type: 'error', message: 'Informe seu e-mail cadastrado ou WhatsApp para receber o código.' });
      return;
    }
    setFeedback({
      type: 'info',
      message: `Instruções de redefinição de acesso enviadas para ${forgotInput}. Verifique sua caixa de entrada ou WhatsApp!`,
    });
    setTimeout(() => {
      setForgotPasswordStep(false);
      setFeedback(null);
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-stone-200/90 overflow-hidden max-h-[92vh] flex flex-col animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-modal-title"
      >
        {/* Top Header */}
        <div className="px-5 sm:px-6 pt-5 pb-4 border-b border-stone-100 flex items-start justify-between bg-[#143D1A] text-white relative">
          <div className="pr-8">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/15 text-[#8CE28A] text-[11px] font-bold tracking-tight mb-1">
              <Sparkles className="w-3 h-3" />
              <span>Acesso Cidadão & Parceiros</span>
            </div>
            <h2 id="login-modal-title" className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              {currentUser.isLoggedIn ? 'Minha Conta EcoApp' : 'Entrar no EcoApp'}
            </h2>
            <p className="text-xs text-white/80 mt-0.5">
              Gestão de resíduos, cupons do comércio e cidadania em Ipatinga
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
            aria-label="Fechar modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Feedback message banner */}
        {feedback && (
          <div
            className={`px-5 py-3 text-xs flex items-center gap-2 border-b animate-in fade-in ${
              feedback.type === 'success'
                ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                : feedback.type === 'error'
                ? 'bg-rose-50 text-rose-900 border-rose-200'
                : 'bg-amber-50 text-amber-900 border-amber-200'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span className="font-medium">{feedback.message}</span>
          </div>
        )}

        <div className="overflow-y-auto p-5 sm:p-6 space-y-5 flex-1">
          {/* Active Session Status if already logged in */}
          {currentUser.isLoggedIn ? (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/90 flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-full bg-[#143D1A] text-[#8CE28A] font-extrabold text-lg flex items-center justify-center shrink-0 border-2 border-white shadow-xs">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-stone-900 text-sm truncate">{currentUser.name}</h3>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        currentUser.role === 'agent'
                          ? 'bg-blue-100 text-blue-800'
                          : currentUser.role === 'merchant'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-[#143D1A]'
                      }`}
                    >
                      {currentUser.role === 'agent'
                        ? 'Servidor SESUMA'
                        : currentUser.role === 'merchant'
                        ? 'Comércio Parceiro'
                        : 'Morador de Ipatinga'}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 truncate">{currentUser.email}</p>
                  <p className="text-[11px] text-stone-600 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-[#143D1A]" />
                    <span>{currentUser.neighborhood.split('—')[0].trim()}</span>
                  </p>
                </div>
              </div>

              <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-3.5 text-xs text-emerald-900 space-y-1">
                <span className="font-bold block flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  Conta Ativa e Sincronizada
                </span>
                <p className="text-[11px] text-emerald-800">
                  Seus pontos, descartes e ocorrências estão salvos e vinculados a este aparelho.
                </p>
              </div>

              {/* Fast switch to other accounts */}
              <div>
                <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block mb-2">
                  Trocar para outro perfil de teste (1 clique)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {DEMO_USERS.map((demo) => {
                    const isCurrent = demo.id === currentUser.id;
                    return (
                      <button
                        key={demo.id}
                        type="button"
                        onClick={() => handleQuickDemoLogin(demo)}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          isCurrent
                            ? 'bg-[#143D1A] text-white border-[#143D1A]'
                            : 'bg-stone-50 hover:bg-stone-100 text-stone-800 border-stone-200'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          {demo.role === 'agent' ? (
                            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                          ) : demo.role === 'merchant' ? (
                            <Store className="w-3.5 h-3.5 text-amber-400" />
                          ) : (
                            <User className="w-3.5 h-3.5 text-emerald-400" />
                          )}
                          <span className="text-[11px] font-bold truncate">{demo.name.split(' ')[0]}</span>
                        </div>
                        <span className="text-[10px] block opacity-80 truncate">
                          {demo.role === 'agent' ? 'SESUMA' : demo.role === 'merchant' ? 'Comércio' : 'Cidadão'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Logout button */}
              <div className="pt-2 flex items-center justify-between border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => {
                    onLogout();
                    setFeedback({ type: 'info', message: 'Você desconectou. Navegando como visitante.' });
                  }}
                  className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-rose-50 text-stone-700 hover:text-rose-700 font-bold text-xs flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Desconectar desta Conta</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-[#143D1A] text-white hover:bg-[#1B5223] font-bold text-xs cursor-pointer shadow-xs"
                >
                  Continuar Usando
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Profile Demo 1-Click Fast Access */}
              <div className="bg-stone-50 border border-stone-200/80 rounded-2xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-stone-600 uppercase tracking-wider">
                    Acesso Rápido para Demonstração (1 Clique)
                  </span>
                  <span className="text-[10px] text-stone-400 font-medium">Ipatinga/MG</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {DEMO_USERS.map((demo) => (
                    <button
                      key={demo.id}
                      type="button"
                      onClick={() => handleQuickDemoLogin(demo)}
                      className="p-2.5 rounded-xl bg-white hover:bg-stone-100 border border-stone-200/90 text-left transition-all cursor-pointer shadow-2xs group"
                    >
                      <div className="flex items-center gap-1.5 mb-0.5">
                        {demo.role === 'agent' ? (
                          <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                        ) : demo.role === 'merchant' ? (
                          <Store className="w-3.5 h-3.5 text-amber-600" />
                        ) : (
                          <User className="w-3.5 h-3.5 text-emerald-600" />
                        )}
                        <span className="text-[11px] font-bold text-stone-900 group-hover:text-[#143D1A] truncate">
                          {demo.name.split(' ')[0]}
                        </span>
                      </div>
                      <span className="text-[10px] text-stone-500 block truncate">
                        {demo.role === 'agent'
                          ? 'Agente SESUMA'
                          : demo.role === 'merchant'
                          ? 'Comerciante'
                          : 'Morador Cidade Nobre'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Forgot password sub-screen */}
              {forgotPasswordStep ? (
                <form onSubmit={handleForgotPassword} className="space-y-4 pt-1">
                  <div>
                    <h3 className="font-bold text-stone-900 text-sm">Recuperação de Acesso</h3>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Informe o e-mail ou número de telefone cadastrado no município de Ipatinga.
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      E-mail ou WhatsApp
                    </label>
                    <input
                      type="text"
                      value={forgotInput}
                      onChange={(e) => setForgotInput(e.target.value)}
                      placeholder="Ex: joaquim@gmail.com ou (31) 99999-9999"
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#143D1A] text-stone-900"
                    />
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setForgotPasswordStep(false)}
                      className="text-xs text-stone-600 hover:text-stone-900 font-medium cursor-pointer"
                    >
                      &larr; Voltar ao login
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#143D1A] text-white hover:bg-[#1B5223] font-bold text-xs rounded-xl cursor-pointer"
                    >
                      Enviar Instruções
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  {/* Tabs Switcher: Entrar vs Cadastrar */}
                  <div className="flex p-1 bg-stone-100 rounded-2xl border border-stone-200/80">
                    <button
                      type="button"
                      onClick={() => setActiveTab('login')}
                      className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                        activeTab === 'login'
                          ? 'bg-white text-stone-900 shadow-xs'
                          : 'text-stone-500 hover:text-stone-800'
                      }`}
                    >
                      Entrar na Conta
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('register')}
                      className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                        activeTab === 'register'
                          ? 'bg-white text-stone-900 shadow-xs'
                          : 'text-stone-500 hover:text-stone-800'
                      }`}
                    >
                      Criar Nova Conta
                    </button>
                  </div>

                  {/* Google Sign-in button powered by Firebase */}
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={handleGoogleLogin}
                      disabled={isGoogleLoading}
                      className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-stone-50 border border-stone-300 text-stone-800 font-bold text-xs flex items-center justify-center gap-2.5 shadow-2xs hover:shadow-xs transition-all cursor-pointer disabled:opacity-50"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                      <span>{isGoogleLoading ? 'Conectando ao Google...' : 'Entrar com Google (Firebase Auth)'}</span>
                    </button>
                    <div className="relative my-3 text-center">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-stone-200"></div>
                      </div>
                      <span className="relative px-3 bg-white text-[10px] uppercase font-bold text-stone-400">
                        ou utilize seu login
                      </span>
                    </div>
                  </div>

                  {/* Form: LOGIN */}
                  {activeTab === 'login' && (
                    <form onSubmit={handleStandardLogin} className="space-y-3.5">
                      {/* Role selection pill buttons */}
                      <div>
                        <label className="block text-[11px] font-semibold text-stone-500 mb-1.5 uppercase tracking-wider">
                          Tipo de Acesso
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            type="button"
                            onClick={() => setRole('citizen')}
                            className={`p-2 rounded-xl text-center border text-xs font-semibold cursor-pointer transition-all ${
                              role === 'citizen'
                                ? 'bg-emerald-50 text-[#143D1A] border-[#143D1A]'
                                : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                            }`}
                          >
                            <User className="w-3.5 h-3.5 mx-auto mb-1 text-emerald-600" />
                            <span>Cidadão</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setRole('merchant')}
                            className={`p-2 rounded-xl text-center border text-xs font-semibold cursor-pointer transition-all ${
                              role === 'merchant'
                                ? 'bg-amber-50 text-amber-900 border-amber-600'
                                : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                            }`}
                          >
                            <Store className="w-3.5 h-3.5 mx-auto mb-1 text-amber-600" />
                            <span>Comércio</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setRole('agent')}
                            className={`p-2 rounded-xl text-center border text-xs font-semibold cursor-pointer transition-all ${
                              role === 'agent'
                                ? 'bg-blue-50 text-blue-900 border-blue-600'
                                : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                            }`}
                          >
                            <ShieldCheck className="w-3.5 h-3.5 mx-auto mb-1 text-blue-600" />
                            <span>SESUMA</span>
                          </button>
                        </div>
                      </div>

                      {/* Username / Email field */}
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">
                          E-mail, CPF ou WhatsApp
                        </label>
                        <div className="relative">
                          <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                          <input
                            type="text"
                            value={emailOrLogin}
                            onChange={(e) => setEmailOrLogin(e.target.value)}
                            placeholder="exemplo@ipatinga.mg.gov.br ou (31) 98888-8888"
                            className="w-full pl-9 pr-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#143D1A] text-stone-900"
                            required
                          />
                        </div>
                      </div>

                      {/* Password field */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-xs font-semibold text-stone-700">Senha</label>
                          <button
                            type="button"
                            onClick={() => setForgotPasswordStep(true)}
                            className="text-[11px] text-[#143D1A] hover:underline font-semibold cursor-pointer"
                          >
                            Esqueci a senha
                          </button>
                        </div>
                        <div className="relative">
                          <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Digite sua senha de acesso"
                            className="w-full pl-9 pr-10 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#143D1A] text-stone-900"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-600 cursor-pointer"
                            aria-label={showPassword ? 'Ocultar senha' : 'Exibir senha'}
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Remember me toggle */}
                      <div className="flex items-center justify-between pt-1">
                        <label className="flex items-center gap-2 cursor-pointer text-xs text-stone-600">
                          <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="w-4 h-4 rounded text-[#143D1A] focus:ring-[#143D1A]"
                          />
                          <span>Salvar login no celular / PWA</span>
                        </label>
                      </div>

                      {/* Submit button */}
                      <button
                        type="submit"
                        className="w-full py-3 px-4 rounded-xl bg-[#143D1A] hover:bg-[#1B5223] text-white font-extrabold text-xs shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer mt-2"
                      >
                        <span>Acessar Minha Conta</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </form>
                  )}

                  {/* Form: REGISTER */}
                  {activeTab === 'register' && (
                    <form onSubmit={handleRegister} className="space-y-3.5">
                      {/* Role selection */}
                      <div>
                        <label className="block text-[11px] font-semibold text-stone-500 mb-1.5 uppercase tracking-wider">
                          Cadastrar como
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setRole('citizen')}
                            className={`p-2 rounded-xl text-center border text-xs font-semibold cursor-pointer transition-all ${
                              role === 'citizen'
                                ? 'bg-emerald-50 text-[#143D1A] border-[#143D1A]'
                                : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                            }`}
                          >
                            <User className="w-3.5 h-3.5 mx-auto mb-1 text-emerald-600" />
                            <span>Cidadão / Morador</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setRole('merchant')}
                            className={`p-2 rounded-xl text-center border text-xs font-semibold cursor-pointer transition-all ${
                              role === 'merchant'
                                ? 'bg-amber-50 text-amber-900 border-amber-600'
                                : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                            }`}
                          >
                            <Store className="w-3.5 h-3.5 mx-auto mb-1 text-amber-600" />
                            <span>Comércio de Ipatinga</span>
                          </button>
                        </div>
                      </div>

                      {/* Name */}
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">
                          {role === 'merchant' ? 'Nome do Responsável' : 'Nome Completo'}
                        </label>
                        <input
                          type="text"
                          value={regName}
                          onChange={(e) => setRegName(e.target.value)}
                          placeholder="Ex: Maria Clara Souza"
                          className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#143D1A] text-stone-900"
                          required
                        />
                      </div>

                      {/* Business name if merchant */}
                      {role === 'merchant' && (
                        <div>
                          <label className="block text-xs font-semibold text-stone-700 mb-1">
                            Nome Fantasia do Estabelecimento
                          </label>
                          <div className="relative">
                            <Building2 className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                            <input
                              type="text"
                              value={regBusinessName}
                              onChange={(e) => setRegBusinessName(e.target.value)}
                              placeholder="Ex: Padaria & Cafeteria Bela Vista"
                              className="w-full pl-9 pr-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#143D1A] text-stone-900"
                              required
                            />
                          </div>
                        </div>
                      )}

                      {/* Email & Phone */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-xs font-semibold text-stone-700 mb-1">E-mail</label>
                          <input
                            type="email"
                            value={regEmail}
                            onChange={(e) => setRegEmail(e.target.value)}
                            placeholder="seuemail@exemplo.com"
                            className="w-full px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#143D1A] text-stone-900"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-stone-700 mb-1">Celular / WhatsApp</label>
                          <input
                            type="tel"
                            value={regPhone}
                            onChange={(e) => setRegPhone(e.target.value)}
                            placeholder="(31) 99999-9999"
                            className="w-full px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#143D1A] text-stone-900"
                          />
                        </div>
                      </div>

                      {/* Neighborhood in Ipatinga */}
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">
                          Bairro de Residência / Atuação em Ipatinga
                        </label>
                        <select
                          value={regNeighborhood}
                          onChange={(e) => setRegNeighborhood(e.target.value)}
                          className="w-full px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#143D1A] text-stone-900"
                        >
                          {IPATINGA_NEIGHBORHOODS.map((nh) => (
                            <option key={nh} value={nh}>
                              {nh}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Password */}
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">Criar Senha</label>
                        <input
                          type="password"
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          placeholder="Mínimo de 4 caracteres"
                          className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#143D1A] text-stone-900"
                          required
                        />
                      </div>

                      {/* Benefits incentive */}
                      <div className="p-3 bg-[#8CE28A]/15 border border-[#8CE28A]/40 rounded-xl text-[11px] text-[#143D1A] flex items-center gap-2">
                        <Sparkles className="w-4 h-4 shrink-0 text-[#143D1A]" />
                        <span>Novo usuário ganha <strong>+50 EcoPontos de boas-vindas</strong> automaticamente!</span>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3 px-4 rounded-xl bg-[#143D1A] hover:bg-[#1B5223] text-white font-extrabold text-xs shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <span>Concluir Cadastro & Ganhar 50 pts</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </form>
                  )}
                </>
              )}
            </>
          )}
        </div>

        {/* Footer info note */}
        <div className="px-5 py-3 bg-stone-50 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#143D1A]" />
            <span>Dados protegidos pela LGPD municipal</span>
          </span>
          <span className="font-mono-code text-[10px]">Ipatinga/MG · Vale do Aço</span>
        </div>
      </div>
    </div>
  );
};
