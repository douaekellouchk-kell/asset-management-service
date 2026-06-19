'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auditApi, AuditLog } from '../../lib/api';

// ── Icônes SVG professionnelles ──────────────────────────────────────────
const IconSun = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const IconMoon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
  </svg>
);

const IconAudit = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const IconRefresh = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const IconArrowLeft = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

// ── Composant principal ──────────────────────────────────────────────────
export default function AuditLogsPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<AuditLog[]>([]);
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
    }

    fetchLogs();
  }, []);

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

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await auditApi.list();
      setLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Erreur de chargement:', err);
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action: string) => {
    if (action.includes('CREATED')) return 'bg-green-500/10 text-green-400 border-green-500/20';
    if (action.includes('UPDATED')) return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    if (action.includes('DELETED')) return 'bg-red-500/10 text-red-400 border-red-500/20';
    if (action.includes('ASSIGNED')) return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
    if (action.includes('RETURNED')) return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      'ASSET_CREATED': 'Actif créé',
      'ASSET_UPDATED': 'Actif modifié',
      'ASSET_DELETED': 'Actif supprimé',
      'ASSET_ASSIGNED': 'Actif affecté',
      'ASSET_RETURNED': 'Actif retourné',
      'USER_CREATED': 'Utilisateur créé',
      'USER_UPDATED': 'Utilisateur modifié',
      'USER_DELETED': 'Utilisateur supprimé',
    };
    return labels[action] || action;
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
            <div className={`w-8 h-8 rounded-lg ${darkMode ? 'bg-purple-500/10 border-purple-500/20 text-purple-400' : 'bg-purple-100 border-purple-200 text-purple-600'} border flex items-center justify-center`}>
              <IconAudit />
            </div>
            <span className={`font-bold tracking-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>Journal d'Audit</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={toggleDarkMode} className={`p-2 rounded-xl border transition ${darkMode ? 'bg-[#1e2029] border-white/10 text-gray-400 hover:text-white' : 'bg-gray-100 border-gray-200 text-gray-600 hover:text-gray-900'}`}>
              {darkMode ? <IconSun /> : <IconMoon />}
            </button>
            <button onClick={() => router.push('/dashboard')} className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm ${darkMode ? 'border-white/10 hover:bg-white/5' : 'border-gray-300 hover:bg-gray-100'}`}>
              <IconArrowLeft /> Dashboard
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className={`${darkMode ? 'bg-[#16181f] border-white/10' : 'bg-white border-gray-200'} rounded-2xl p-5 border`}>
            <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'} mb-1`}>Total Logs</p>
            <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{logs.length}</p>
          </div>
          <div className={`${darkMode ? 'bg-[#16181f] border-white/10' : 'bg-white border-gray-200'} rounded-2xl p-5 border`}>
            <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'} mb-1`}>Créations</p>
            <p className="text-2xl font-bold text-green-400">{logs.filter(l => l.action.includes('CREATED')).length}</p>
          </div>
          <div className={`${darkMode ? 'bg-[#16181f] border-white/10' : 'bg-white border-gray-200'} rounded-2xl p-5 border`}>
            <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'} mb-1`}>Modifications</p>
            <p className="text-2xl font-bold text-blue-400">{logs.filter(l => l.action.includes('UPDATED')).length}</p>
          </div>
        </div>

        {/* Logs Table */}
        <div className={`${darkMode ? 'bg-[#16181f] border-white/10' : 'bg-white border-gray-200'} rounded-2xl border overflow-hidden`}>
          <div className={`px-6 py-4 border-b ${darkMode ? 'border-white/10' : 'border-gray-200'} flex justify-between items-center`}>
            <h2 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Journal d'Audit</h2>
            <button 
              onClick={fetchLogs}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs ${darkMode ? 'border-white/10 hover:bg-white/5' : 'border-gray-300 hover:bg-gray-100'}`}
            >
              <IconRefresh /> Actualiser
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`${darkMode ? 'bg-[#1e2029]' : 'bg-gray-50'}`}>
                <tr>
                  {['Date/Heure', 'Action', 'Entité', 'Utilisateur', 'IP'].map(h => (
                    <th key={h} className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className={`divide-y ${darkMode ? 'divide-white/5' : 'divide-gray-200'}`}>
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className={`px-6 py-12 text-center ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                      Aucun log d'audit trouvé
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className={`${darkMode ? 'hover:bg-white/[0.02]' : 'hover:bg-gray-50'} transition`}>
                      <td className={`px-6 py-4 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {new Date(log.created_at).toLocaleString('fr-FR')}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border ${getActionColor(log.action)}`}>
                          {getActionLabel(log.action)}
                        </span>
                      </td>
                      <td className={`px-6 py-4 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {log.entity_type}
                      </td>
                      <td className={`px-6 py-4 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {log.user_id ? log.user_id.substring(0, 8) + '...' : 'Système'}
                      </td>
                      <td className={`px-6 py-4 text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                        {log.ip_address || '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}