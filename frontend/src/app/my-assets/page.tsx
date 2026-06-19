'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { assignmentApi, authApi, User } from '../../lib/api';

// ── Icons SVG professionnelles ──────────────────────────────────────────
const IconBox = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
);
const IconCalendar = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);
const IconUser = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);
const IconLogout = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);
const IconMoon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
  </svg>
);
const IconSun = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);
const IconArrowLeft = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);
const IconEmpty = () => (
  <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
  </svg>
);

// ── Type pour les données retournées par myAssets ─────────────────────────
interface MyAsset {
  assignment_id: string;
  asset_id: string;
  asset_name: string;
  asset_serial_number: string;
  category_name: string | null;
  purchase_value: number;
  status: string;
  assigned_at: string;
  notes: string | null;
}

export default function MyAssetsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [myAssets, setMyAssets] = useState<MyAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      return;
    }

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      setDarkMode(false);
      document.documentElement.classList.remove('dark');
    } else {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }

    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Charger les infos utilisateur
      const userData = await authApi.me();
      setUser(userData);

      // Vérifier que c'est bien un employé
      if (userData.role !== 'EMPLOYEE') {
        // Rediriger les non-employés vers le dashboard
        router.push('/dashboard');
        return;
      }

      // Charger les actifs de l'employé
      const assets = await assignmentApi.myAssets();
      setMyAssets(Array.isArray(assets) ? assets : []);
    } catch (err: any) {
      console.error('Erreur de chargement:', err);
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-[#0f1117]' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="flex flex-col items-center gap-3">
          <svg className="w-8 h-8 text-blue-500 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className={`${darkMode ? 'text-gray-500' : 'text-gray-600'} text-sm`}>Chargement...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-[#0f1117] text-white' : 'bg-gray-50 text-gray-900'} transition-colors duration-300`}>
      {/* Header */}
      <header className={`border-b ${darkMode ? 'border-white/10 bg-[#16181f]/80' : 'border-gray-200 bg-white/80'} backdrop-blur-sm sticky top-0 z-30`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.push('/dashboard')}
              className={`p-2 rounded-lg border transition ${darkMode ? 'border-white/10 hover:bg-white/5' : 'border-gray-300 hover:bg-gray-100'}`}
              title="Retour au dashboard"
            >
              <IconArrowLeft />
            </button>
            <div className={`w-8 h-8 rounded-lg ${darkMode ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'bg-blue-100 border-blue-200 text-blue-600'} border flex items-center justify-center`}>
              <IconBox />
            </div>
            <div>
              <h1 className={`font-bold tracking-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>Mes Actifs</h1>
              <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                {myAssets.length} actif{myAssets.length > 1 ? 's' : ''} affecté{myAssets.length > 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={toggleDarkMode} className={`p-2 rounded-xl border transition ${darkMode ? 'bg-[#1e2029] border-white/10 text-gray-400 hover:text-white' : 'bg-gray-100 border-gray-200 text-gray-600 hover:text-gray-900'}`}>
              {darkMode ? <IconSun /> : <IconMoon />}
            </button>
            <div className="text-right hidden sm:block">
              <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {user ? `${user.first_name} ${user.last_name}` : 'Chargement...'}
              </p>
              <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                {user?.role || ''}
              </p>
            </div>
            <button onClick={handleLogout} className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition text-sm ${darkMode ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-red-50 border-red-200 text-red-600'}`}>
              <IconLogout /> Déconnexion
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Stats rapides */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className={`${darkMode ? 'bg-[#16181f] border-white/10' : 'bg-white border-gray-200'} rounded-2xl p-5 border`}>
            <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'} mb-1`}>Total Actifs</p>
            <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{myAssets.length}</p>
          </div>
          <div className={`${darkMode ? 'bg-[#16181f] border-white/10' : 'bg-white border-gray-200'} rounded-2xl p-5 border`}>
            <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'} mb-1`}>Valeur Totale</p>
            <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {myAssets.reduce((sum, a) => sum + (a.purchase_value || 0), 0).toLocaleString('fr-FR')} MAD
            </p>
          </div>
          <div className={`${darkMode ? 'bg-[#16181f] border-white/10' : 'bg-white border-gray-200'} rounded-2xl p-5 border`}>
            <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'} mb-1`}>Catégories</p>
            <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {new Set(myAssets.map(a => a.category_name).filter(Boolean)).size}
            </p>
          </div>
        </div>

        {/* Liste des actifs */}
        <div className={`${darkMode ? 'bg-[#16181f] border-white/10' : 'bg-white border-gray-200'} rounded-2xl border overflow-hidden`}>
          <div className={`px-6 py-4 border-b ${darkMode ? 'border-white/10' : 'border-gray-200'}`}>
            <h2 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Actifs qui me sont affectés
            </h2>
            <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'} mt-1`}>
              Liste de tous les actifs actuellement en ma possession
            </p>
          </div>

          {myAssets.length === 0 ? (
            <div className={`px-6 py-16 text-center ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              <div className="flex justify-center mb-4 opacity-50">
                <IconEmpty />
              </div>
              <p className="text-lg font-medium mb-2">Aucun actif affecté</p>
              <p className="text-sm">
                Vous n'avez actuellement aucun actif affecté.
                <br />
                Contactez votre manager pour plus d'informations.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
              {myAssets.map((asset) => (
                <div 
                  key={asset.assignment_id}
                  className={`${darkMode ? 'bg-[#1e2029] border-white/5 hover:border-blue-500/30' : 'bg-gray-50 border-gray-200 hover:border-blue-300'} border rounded-2xl p-5 transition`}
                >
                  {/* Header de la carte */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${darkMode ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-blue-100 text-blue-600 border-blue-200'}`}>
                        <IconBox />
                      </div>
                      <div>
                        <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {asset.asset_name}
                        </h3>
                        <p className={`text-xs font-mono ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                          {asset.asset_serial_number}
                        </p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border ${
                      darkMode ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-blue-100 text-blue-700 border-blue-200'
                    }`}>
                      Affecté
                    </span>
                  </div>

                  {/* Détails */}
                  <div className="space-y-3">
                    {asset.category_name && (
                      <div className="flex items-center gap-2">
                        <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Catégorie:</span>
                        <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{asset.category_name}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2">
                      <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Valeur:</span>
                      <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {asset.purchase_value?.toLocaleString('fr-FR')} MAD
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <IconCalendar />
                      <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Affecté le:</span>
                      <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {formatDate(asset.assigned_at)}
                      </span>
                    </div>

                    {asset.notes && (
                      <div className={`mt-3 p-3 rounded-lg ${darkMode ? 'bg-[#16181f] border-white/5' : 'bg-white border-gray-200'} border`}>
                        <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'} mb-1`}>Notes</p>
                        <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {asset.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}