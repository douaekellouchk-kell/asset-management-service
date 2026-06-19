'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { userApi, User } from '../../lib/api';

// ── Icons ──────────────────────────────────────────────────────────────────
const IconPlus = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);
const IconEdit = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);
const IconDelete = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);
const IconX = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);
const IconUsers = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
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

// ── Modal wrapper ──────────────────────────────────────────────────────────
interface ModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  darkMode: boolean;
}

function Modal({ title, onClose, children, darkMode }: ModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full max-w-lg ${darkMode ? 'bg-[#16181f] border-white/10' : 'bg-white border-gray-200'} border rounded-2xl shadow-2xl overflow-hidden`}>
        <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-400" />
        <div className="px-6 py-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{title}</h2>
            <button onClick={onClose} className={`${darkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'} transition`}>
              <IconX />
            </button>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────
export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    role: 'EMPLOYEE' as 'ADMIN' | 'MANAGER' | 'EMPLOYEE',
    is_active: true,
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      return;
    }

    // ✅ Initialiser le thème depuis localStorage (synchronisé avec dashboard)
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      setDarkMode(false);
      document.documentElement.classList.remove('dark');
    } else {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }

    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const fetchUsers = async () => {
    try {
      const data = await userApi.list();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Erreur de chargement:', err);
      showToast('Erreur de connexion au serveur', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await userApi.create(formData);
      setFormData({ email: '', password: '', first_name: '', last_name: '', role: 'EMPLOYEE', is_active: true });
      setShowCreateModal(false);
      await fetchUsers();
      showToast('Utilisateur créé avec succès !', 'success');
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Erreur lors de la création';
      showToast(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg), 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setActionLoading(true);
    try {
      const updateData: any = {
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
        role: formData.role,
        is_active: formData.is_active,
      };
      // N'envoyer le mot de passe que s'il a été modifié
      if (formData.password) {
        updateData.password = formData.password;
      }
      await userApi.update(selectedUser.id, updateData);
      setShowEditModal(false);
      await fetchUsers();
      showToast('Utilisateur modifié avec succès !', 'success');
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Erreur lors de la modification';
      showToast(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg), 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    setActionLoading(true);
    try {
      const result = await userApi.delete(selectedUser.id);
      setShowDeleteModal(false);
      await fetchUsers();
      showToast(`${result.message} - ${result.assets_returned} actif(s) retourné(s)`, 'success');
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Erreur lors de la suppression';
      showToast(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg), 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const inputClass = `w-full ${darkMode ? 'bg-[#1e2029] border-white/10 text-white placeholder-gray-600' : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'} border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition`;
  const labelClass = `block text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1.5`;

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
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-sm font-medium shadow-lg border transition-all
          ${toast.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
          {toast.msg}
        </div>
      )}

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header className={`border-b ${darkMode ? 'border-white/10 bg-[#16181f]/80' : 'border-gray-200 bg-white/80'} backdrop-blur-sm sticky top-0 z-30`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg ${darkMode ? 'bg-purple-500/10 border-purple-500/20 text-purple-400' : 'bg-purple-100 border-purple-200 text-purple-600'} border flex items-center justify-center`}>
              <IconUsers />
            </div>
            <span className={`font-bold tracking-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>Gestion des Utilisateurs</span>
          </div>
          <div className="flex items-center gap-3">
            {/* ✅ Toggle Dark/Light Mode */}
            <button 
              onClick={toggleDarkMode} 
              className={`p-2 rounded-xl border transition ${darkMode ? 'bg-[#1e2029] border-white/10 text-gray-400 hover:text-white' : 'bg-gray-100 border-gray-200 text-gray-600 hover:text-gray-900'}`}
              title={darkMode ? 'Passer en mode clair' : 'Passer en mode sombre'}
            >
              {darkMode ? <IconSun /> : <IconMoon />}
            </button>

            {/* ✅ Retour au Dashboard */}
            <button 
              onClick={() => router.push('/dashboard')} 
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm transition ${darkMode ? 'border-white/10 hover:bg-white/5 text-gray-300' : 'border-gray-300 hover:bg-gray-100 text-gray-700'}`}
            >
              ← Dashboard
            </button>
          </div>
        </div>
      </header>

      {/* ── Main Content ────────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Statistiques */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Utilisateurs', value: users.length, color: 'blue' },
            { label: 'Admins', value: users.filter(u => u.role === 'ADMIN').length, color: 'purple' },
            { label: 'Managers', value: users.filter(u => u.role === 'MANAGER').length, color: 'indigo' },
            { label: 'Employés', value: users.filter(u => u.role === 'EMPLOYEE').length, color: 'green' },
          ].map(({ label, value, color }) => (
            <div key={label} className={`${darkMode ? 'bg-[#16181f] border-white/10' : 'bg-white border-gray-200'} rounded-2xl p-5 border`}>
              <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'} mb-1`}>{label}</p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Liste des utilisateurs */}
        <div className={`${darkMode ? 'bg-[#16181f] border-white/10' : 'bg-white border-gray-200'} rounded-2xl overflow-hidden border`}>
          <div className={`px-6 py-4 border-b ${darkMode ? 'border-white/10' : 'border-gray-200'} flex justify-between items-center`}>
            <h2 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Liste des Utilisateurs</h2>
            <button 
              onClick={() => {
                setFormData({ email: '', password: '', first_name: '', last_name: '', role: 'EMPLOYEE', is_active: true });
                setShowCreateModal(true);
              }} 
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-xl transition"
            >
              <IconPlus /> Nouvel Utilisateur
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`${darkMode ? 'bg-[#1e2029]' : 'bg-gray-50'}`}>
                <tr>
                  {['Email', 'Nom complet', 'Rôle', 'Statut', 'Actions'].map(h => (
                    <th key={h} className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className={`divide-y ${darkMode ? 'divide-white/5' : 'divide-gray-200'}`}>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className={`px-6 py-12 text-center ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                      Aucun utilisateur trouvé
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className={`${darkMode ? 'hover:bg-white/[0.02]' : 'hover:bg-gray-50'} transition`}>
                      <td className={`px-6 py-4 text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>{user.email}</td>
                      <td className={`px-6 py-4 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {user.first_name} {user.last_name}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border ${
                          user.role === 'ADMIN' ? (darkMode ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-purple-100 text-purple-700 border-purple-200') :
                          user.role === 'MANAGER' ? (darkMode ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-blue-100 text-blue-700 border-blue-200') :
                          (darkMode ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-green-100 text-green-700 border-green-200')
                        }`}>
                          {user.role === 'ADMIN' ? 'Administrateur' : user.role === 'MANAGER' ? 'Manager' : 'Employé'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${
                          user.is_active 
                            ? (darkMode ? 'bg-green-500/10 text-green-400' : 'bg-green-100 text-green-700') 
                            : (darkMode ? 'bg-gray-500/10 text-gray-400' : 'bg-gray-100 text-gray-700')
                        }`}>
                          {user.is_active ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => { 
                              setSelectedUser(user); 
                              setFormData({ 
                                email: user.email, 
                                password: '', 
                                first_name: user.first_name, 
                                last_name: user.last_name, 
                                role: user.role as any, 
                                is_active: user.is_active 
                              }); 
                              setShowEditModal(true); 
                            }} 
                            className={`p-1.5 rounded-lg border transition ${darkMode ? 'text-gray-400 hover:text-blue-400 border-white/10 hover:border-blue-500/30' : 'text-gray-500 hover:text-blue-600 border-gray-200 hover:border-blue-300'}`}
                            title="Modifier"
                          >
                            <IconEdit />
                          </button>
                          <button 
                            onClick={() => { setSelectedUser(user); setShowDeleteModal(true); }} 
                            className={`p-1.5 rounded-lg border transition ${darkMode ? 'text-gray-400 hover:text-red-400 border-white/10 hover:border-red-500/30' : 'text-gray-500 hover:text-red-600 border-gray-200 hover:border-red-300'}`}
                            title="Supprimer"
                          >
                            <IconDelete />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* ── Modals ──────────────────────────────────────────────────────── */}
      {showCreateModal && (
        <Modal title="Nouvel Utilisateur" onClose={() => setShowCreateModal(false)} darkMode={darkMode}>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Prénom *</label>
                <input required value={formData.first_name} onChange={e => setFormData({...formData, first_name: e.target.value})} className={inputClass} placeholder="Jean" />
              </div>
              <div>
                <label className={labelClass}>Nom *</label>
                <input required value={formData.last_name} onChange={e => setFormData({...formData, last_name: e.target.value})} className={inputClass} placeholder="Dupont" />
              </div>
            </div>
            <div>
              <label className={labelClass}>Email *</label>
              <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className={inputClass} placeholder="jean.dupont@test.com" />
            </div>
            <div>
              <label className={labelClass}>Mot de passe *</label>
              <input type="password" required minLength={6} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className={inputClass} placeholder="••••••••" />
            </div>
            <div>
              <label className={labelClass}>Rôle *</label>
              <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as any})} className={inputClass}>
                <option value="EMPLOYEE">Employé</option>
                <option value="MANAGER">Manager</option>
                <option value="ADMIN">Administrateur</option>
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowCreateModal(false)} className={`flex-1 px-4 py-2.5 rounded-xl border ${darkMode ? 'border-white/10 text-gray-400' : 'border-gray-300 text-gray-700'} transition text-sm`}>
                Annuler
              </button>
              <button type="submit" disabled={actionLoading} className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium text-sm transition">
                {actionLoading ? 'Création...' : 'Créer'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {showEditModal && selectedUser && (
        <Modal title="Modifier l'Utilisateur" onClose={() => setShowEditModal(false)} darkMode={darkMode}>
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Prénom *</label>
                <input required value={formData.first_name} onChange={e => setFormData({...formData, first_name: e.target.value})} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Nom *</label>
                <input required value={formData.last_name} onChange={e => setFormData({...formData, last_name: e.target.value})} className={inputClass} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Email *</label>
              <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Nouveau mot de passe (laisser vide pour garder l'ancien)</label>
              <input type="password" minLength={6} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className={inputClass} placeholder="••••••••" />
            </div>
            <div>
              <label className={labelClass}>Rôle *</label>
              <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as any})} className={inputClass}>
                <option value="EMPLOYEE">Employé</option>
                <option value="MANAGER">Manager</option>
                <option value="ADMIN">Administrateur</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                id="is_active" 
                checked={formData.is_active} 
                onChange={e => setFormData({...formData, is_active: e.target.checked})} 
                className="w-4 h-4"
              />
              <label htmlFor="is_active" className={labelClass + ' mb-0'}>Compte actif</label>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowEditModal(false)} className={`flex-1 px-4 py-2.5 rounded-xl border ${darkMode ? 'border-white/10 text-gray-400' : 'border-gray-300 text-gray-700'} transition text-sm`}>
                Annuler
              </button>
              <button type="submit" disabled={actionLoading} className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium text-sm transition">
                {actionLoading ? 'Modification...' : 'Enregistrer'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {showDeleteModal && selectedUser && (
        <Modal title="Supprimer l'Utilisateur" onClose={() => setShowDeleteModal(false)} darkMode={darkMode}>
          <div className="space-y-4">
            <div className={`${darkMode ? 'bg-red-500/5 border-red-500/20' : 'bg-red-50 border-red-200'} rounded-xl p-4 border`}>
              <p className={`text-sm ${darkMode ? 'text-red-400' : 'text-red-700'}`}>Confirmer la suppression de :</p>
              <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {selectedUser.first_name} {selectedUser.last_name}
              </p>
              <p className={`text-xs font-mono ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                {selectedUser.email}
              </p>
            </div>
            <div className={`${darkMode ? 'bg-amber-500/5 border-amber-500/20' : 'bg-amber-50 border-amber-200'} rounded-xl p-3 border`}>
              <p className={`text-xs ${darkMode ? 'text-amber-400' : 'text-amber-700'}`}>
                <strong>Important :</strong> Tous les actifs affectés à cet utilisateur seront automatiquement retournés et marqués comme "Disponibles".
              </p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowDeleteModal(false)} 
                className={`flex-1 px-4 py-2.5 rounded-xl border ${darkMode ? 'border-white/10 text-gray-400' : 'border-gray-300 text-gray-700'} transition text-sm`}
              >
                Annuler
              </button>
              <button 
                onClick={handleDelete} 
                disabled={actionLoading} 
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-medium text-sm transition"
              >
                {actionLoading ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}