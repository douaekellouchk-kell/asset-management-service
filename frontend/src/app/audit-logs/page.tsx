'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  before_data: any;
  after_data: any;
  ip_address: string;
  created_at: string;
}

interface Stats {
  total: number;
  creations: number;
  modifications: number;
  suppressions: number;
  affectations: number;
  retours: number;
}

export default function AuditLogsPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    creations: 0,
    modifications: 0,
    suppressions: 0,
    affectations: 0,
    retours: 0
  });
  const [filterAction, setFilterAction] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [logs, filterAction, filterDate]);

  const fetchAuditLogs = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('http://localhost:8000/audit-logs', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const logsData = data.items || data || [];
        setLogs(logsData);
        calculateStats(logsData);
      }
    } catch (error) {
      console.error('Erreur fetch audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (logsData: AuditLog[]) => {
    const statsData: Stats = {
      total: logsData.length,
      creations: 0,
      modifications: 0,
      suppressions: 0,
      affectations: 0,
      retours: 0
    };

    logsData.forEach(log => {
      switch (log.action) {
        case 'ASSET_CREATED':
          statsData.creations++;
          break;
        case 'ASSET_UPDATED':
          statsData.modifications++;
          break;
        case 'ASSET_DELETED':
          statsData.suppressions++;
          break;
        case 'ASSET_ASSIGNED':
          statsData.affectations++;
          break;
        case 'ASSET_RETURNED':
          statsData.retours++;
          break;
      }
    });

    setStats(statsData);
  };

  const applyFilters = () => {
    let filtered = [...logs];

    if (filterAction) {
      filtered = filtered.filter(log => log.action === filterAction);
    }

    if (filterDate) {
      filtered = filtered.filter(log => 
        log.created_at.startsWith(filterDate)
      );
    }

    setFilteredLogs(filtered);
  };

  const getActionLabel = (action: string) => {
    const labels: { [key: string]: string } = {
      'ASSET_CREATED': 'Actif créé',
      'ASSET_UPDATED': 'Actif modifié',
      'ASSET_DELETED': 'Actif supprimé',
      'ASSET_ASSIGNED': 'Actif affecté',
      'ASSET_RETURNED': 'Actif retourné',
      'USER_CREATED': 'Utilisateur créé',
      'USER_UPDATED': 'Utilisateur modifié'
    };
    return labels[action] || action;
  };

  const getActionColor = (action: string) => {
    const colors: { [key: string]: string } = {
      'ASSET_CREATED': darkMode ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-green-100 text-green-700',
      'ASSET_UPDATED': darkMode ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-blue-100 text-blue-700',
      'ASSET_DELETED': darkMode ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-red-100 text-red-700',
      'ASSET_ASSIGNED': darkMode ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-purple-100 text-purple-700',
      'ASSET_RETURNED': darkMode ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-amber-100 text-amber-700',
      'USER_CREATED': darkMode ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-100 text-emerald-700',
      'USER_UPDATED': darkMode ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' : 'bg-cyan-100 text-cyan-700'
    };
    return colors[action] || (darkMode ? 'bg-gray-500/10 text-gray-400' : 'bg-gray-100 text-gray-700');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-[#0f1117]' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Chargement des logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-[#0f1117] text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <header className={`border-b ${darkMode ? 'border-white/10 bg-[#16181f]/80' : 'border-gray-200 bg-white/80'} backdrop-blur-sm sticky top-0 z-30`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg ${darkMode ? 'bg-purple-500/10 border-purple-500/20 text-purple-400' : 'bg-purple-100 border-purple-200 text-purple-600'} border flex items-center justify-center`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Journal d'Audit</h1>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-xl border transition ${darkMode ? 'bg-[#1e2029] border-white/10 text-gray-400 hover:text-white' : 'bg-gray-100 border-gray-200 text-gray-600 hover:text-gray-900'}`}
            >
              {darkMode ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
            <button 
              onClick={() => router.push('/dashboard')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition text-sm ${darkMode ? 'bg-gray-500/10 border-gray-500/20 text-gray-300 hover:bg-gray-500/20' : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Dashboard
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div className={`${darkMode ? 'bg-[#16181f] border-white/10' : 'bg-white border-gray-200'} rounded-2xl p-5 border`}>
            <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-600'} mb-1`}>Total Logs</p>
            <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{stats.total}</p>
          </div>
          <div className={`${darkMode ? 'bg-[#16181f] border-white/10' : 'bg-white border-gray-200'} rounded-2xl p-5 border`}>
            <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-600'} mb-1`}>Créations</p>
            <p className="text-2xl font-bold text-green-500">{stats.creations}</p>
          </div>
          <div className={`${darkMode ? 'bg-[#16181f] border-white/10' : 'bg-white border-gray-200'} rounded-2xl p-5 border`}>
            <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-600'} mb-1`}>Modifications</p>
            <p className="text-2xl font-bold text-blue-500">{stats.modifications}</p>
          </div>
          <div className={`${darkMode ? 'bg-[#16181f] border-white/10' : 'bg-white border-gray-200'} rounded-2xl p-5 border`}>
            <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-600'} mb-1`}>Suppressions</p>
            <p className="text-2xl font-bold text-red-500">{stats.suppressions}</p>
          </div>
          <div className={`${darkMode ? 'bg-[#16181f] border-white/10' : 'bg-white border-gray-200'} rounded-2xl p-5 border`}>
            <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-600'} mb-1`}>Affectations</p>
            <p className="text-2xl font-bold text-purple-500">{stats.affectations}</p>
          </div>
          <div className={`${darkMode ? 'bg-[#16181f] border-white/10' : 'bg-white border-gray-200'} rounded-2xl p-5 border`}>
            <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-600'} mb-1`}>Retours</p>
            <p className="text-2xl font-bold text-amber-500">{stats.retours}</p>
          </div>
        </div>

        {/* Filters */}
        <div className={`${darkMode ? 'bg-[#16181f] border-white/10' : 'bg-white border-gray-200'} rounded-2xl border p-6`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Filtres</h2>
            <button 
              onClick={() => {
                setFilterAction('');
                setFilterDate('');
              }}
              className="text-xs text-blue-500 hover:text-blue-400 transition"
            >
              Réinitialiser
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={`block text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1.5`}>
                Type d'action
              </label>
              <select
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
                className={`w-full ${darkMode ? 'bg-[#1e2029] border-white/10 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'} border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition`}
              >
                <option value="">Toutes les actions</option>
                <option value="ASSET_CREATED">Création d'actif</option>
                <option value="ASSET_UPDATED">Modification d'actif</option>
                <option value="ASSET_DELETED">Suppression d'actif</option>
                <option value="ASSET_ASSIGNED">Affectation d'actif</option>
                <option value="ASSET_RETURNED">Retour d'actif</option>
                <option value="USER_CREATED">Création d'utilisateur</option>
                <option value="USER_UPDATED">Modification d'utilisateur</option>
              </select>
            </div>
            <div>
              <label className={`block text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1.5`}>
                Date
              </label>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className={`w-full ${darkMode ? 'bg-[#1e2029] border-white/10 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'} border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition`}
              />
            </div>
            <div className="flex items-end">
              <button 
                onClick={fetchAuditLogs}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-xl transition w-full justify-center"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Actualiser
              </button>
            </div>
          </div>
        </div>

        {/* Audit Logs Table */}
        <div className={`${darkMode ? 'bg-[#16181f] border-white/10' : 'bg-white border-gray-200'} rounded-2xl overflow-hidden border`}>
          <div className={`px-6 py-4 border-b ${darkMode ? 'border-white/10' : 'border-gray-200'}`}>
            <h2 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Journal d'Audit</h2>
            <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'} mt-1`}>
              {filteredLogs.length} résultat{filteredLogs.length > 1 ? 's' : ''} affiché{filteredLogs.length > 1 ? 's' : ''}
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`${darkMode ? 'bg-[#1e2029]' : 'bg-gray-50'}`}>
                <tr>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Date/Heure</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Action</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Entité</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Utilisateur</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>IP</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${darkMode ? 'divide-white/5' : 'divide-gray-200'}`}>
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className={`px-6 py-12 text-center ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                      Aucun log d'audit trouvé
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className={`${darkMode ? 'hover:bg-white/[0.02]' : 'hover:bg-gray-50'} transition`}>
                      <td className={`px-6 py-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} font-mono`}>
                        {formatDate(log.created_at)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border ${getActionColor(log.action)}`}>
                          {getActionLabel(log.action)}
                        </span>
                      </td>
                      <td className={`px-6 py-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} uppercase`}>
                        {log.entity_type}
                      </td>
                      <td className={`px-6 py-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} font-mono`}>
                        {log.user_id.substring(0, 8)}...
                      </td>
                      <td className={`px-6 py-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} font-mono`}>
                        {log.ip_address}
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