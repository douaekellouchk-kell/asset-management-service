'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { assetApi, Assignment } from '../../../lib/api';

// Icons
const IconHistory = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const IconArrowLeft = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);
const IconUser = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);
const IconCalendar = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);
const IconCheck = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);
const IconReturn = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
  </svg>
);

export default function AssetHistoryPage() {
  const router = useRouter();
  const params = useParams();
  const assetId = params.id as string;
  
  const [history, setHistory] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [assetName, setAssetName] = useState('');

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
    }

    fetchHistory();
  }, [assetId]);

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

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const data = await assetApi.getHistory(assetId);
      setHistory(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Erreur de chargement:', err);
    } finally {
      setLoading(false);
    }
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
        <div className="text-sm">Chargement...</div>
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
              onClick={() => router.back()}
              className={`p-2 rounded-lg border transition ${darkMode ? 'border-white/10 hover:bg-white/5' : 'border-gray-300 hover:bg-gray-100'}`}
            >
              <IconArrowLeft />
            </button>
            <div className={`w-8 h-8 rounded-lg ${darkMode ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' : 'bg-indigo-100 border-indigo-200 text-indigo-600'} border flex items-center justify-center`}>
              <IconHistory />
            </div>
            <div>
              <h1 className={`font-bold tracking-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>Historique de l'actif</h1>
              <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                {history.length} affectation{history.length > 1 ? 's' : ''} enregistrée{history.length > 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <button onClick={toggleDarkMode} className={`p-2 rounded-xl border transition ${darkMode ? 'bg-[#1e2029] border-white/10 text-gray-400 hover:text-white' : 'bg-gray-100 border-gray-200 text-gray-600 hover:text-gray-900'}`}>
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        {history.length === 0 ? (
          <div className={`${darkMode ? 'bg-[#16181f] border-white/10' : 'bg-white border-gray-200'} rounded-2xl p-12 text-center border`}>
            <IconHistory />
            <p className={`mt-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Aucun historique d'affectation pour cet actif
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((assignment, index) => {
              const isActive = !assignment.returned_at;
              const isReturned = !!assignment.returned_at;
              
              return (
                <div 
                  key={assignment.id}
                  className={`${darkMode ? 'bg-[#16181f] border-white/10' : 'bg-white border-gray-200'} rounded-2xl border overflow-hidden transition hover:shadow-lg`}
                >
                  {/* Header de l'affectation */}
                  <div className={`px-6 py-4 border-b ${darkMode ? 'border-white/10' : 'border-gray-200'} flex items-center justify-between`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        isActive 
                          ? (darkMode ? 'bg-green-500/10 text-green-400' : 'bg-green-100 text-green-600')
                          : (darkMode ? 'bg-gray-500/10 text-gray-400' : 'bg-gray-100 text-gray-600')
                      }`}>
                        {isActive ? <IconCheck /> : <IconReturn />}
                      </div>
                      <div>
                        <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          Affectation #{index + 1}
                        </h3>
                        <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                          {formatDate(assignment.assigned_at)}
                        </p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium border ${
                      isActive
                        ? (darkMode ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-green-100 text-green-700 border-green-200')
                        : (darkMode ? 'bg-gray-500/10 text-gray-400 border-gray-500/20' : 'bg-gray-100 text-gray-700 border-gray-200')
                    }`}>
                      {isActive ? 'En cours' : 'Terminée'}
                    </span>
                  </div>

                  {/* Détails */}
                  <div className="px-6 py-4 space-y-3">
                    {/* Employé */}
                    <div className="flex items-start gap-3">
                      <div className={`mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                        <IconUser />
                      </div>
                      <div className="flex-1">
                        <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'} mb-1`}>Employé</p>
                        <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {assignment.employee_id}
                        </p>
                      </div>
                    </div>

                    {/* Date d'affectation */}
                    <div className="flex items-start gap-3">
                      <div className={`mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                        <IconCalendar />
                      </div>
                      <div className="flex-1">
                        <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'} mb-1`}>Date d'affectation</p>
                        <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {formatDate(assignment.assigned_at)}
                        </p>
                      </div>
                    </div>

                    {/* Date de retour (si applicable) */}
                    {isReturned && (
                      <div className="flex items-start gap-3">
                        <div className={`mt-1 ${darkMode ? 'text-amber-500' : 'text-amber-600'}`}>
                          <IconReturn />
                        </div>
                        <div className="flex-1">
                          <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'} mb-1`}>Date de retour</p>
                          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {formatDate(assignment.returned_at!)}
                          </p>
                          {assignment.return_condition && (
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs mt-1 ${
                              assignment.return_condition === 'GOOD'
                                ? (darkMode ? 'bg-green-500/10 text-green-400' : 'bg-green-100 text-green-700')
                                : assignment.return_condition === 'DAMAGED'
                                ? (darkMode ? 'bg-red-500/10 text-red-400' : 'bg-red-100 text-red-700')
                                : (darkMode ? 'bg-amber-500/10 text-amber-400' : 'bg-amber-100 text-amber-700')
                            }`}>
                              État: {assignment.return_condition}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Notes */}
                    {assignment.notes && (
                      <div className={`mt-3 p-3 rounded-lg ${darkMode ? 'bg-[#1e2029] border-white/5' : 'bg-gray-50 border-gray-200'} border`}>
                        <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'} mb-1`}>Notes</p>
                        <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {assignment.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}