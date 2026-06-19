'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { assetApi, Asset, categoryApi, Category, authApi, User, userApi } from '../../lib/api';

// ── Icons ──────────────────────────────────────────────────────────────────
const IconBox = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
);
const IconCheck = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const IconAssign = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);
const IconX = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);
const IconPlus = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
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
const IconUsers = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zM13 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
  </svg>
);
const IconHistory = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const IconAudit = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);
const IconSearch = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);
const IconFilter = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
  </svg>
);
const IconChevronLeft = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);
const IconChevronRight = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);
const IconDownload = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
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

// ── Helper: Valider un UUID ────────────────────────────────────────────────
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

// ─ Constants ──────────────────────────────────────────────────────────────
const ITEMS_PER_PAGE = 5;
const STATUS_OPTIONS = [
  { value: '', label: 'Tous les statuts' },
  { value: 'AVAILABLE', label: 'Disponible' },
  { value: 'ASSIGNED', label: 'Affecté' },
  { value: 'DAMAGED', label: 'Endommagé' },
  { value: 'MAINTENANCE', label: 'Maintenance' },
  { value: 'RETIRED', label: 'Réformé' },
];

// ── Main Component ─────────────────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [employees, setEmployees] = useState<User[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  // ✅ NOUVEAU: État pour les statistiques
  const [stats, setStats] = useState({
    total: 0,
    available: 0,
    assigned: 0,
    total_value: 0
  });

  // Filtres et recherche (EF-22, EF-23, EF-24, EF-25)
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [employeeFilter, setEmployeeFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalAssets, setTotalAssets] = useState(0);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const [formData, setFormData] = useState({
    name: '', description: '', serial_number: '',
    category_id: '', purchase_value: '', status: 'AVAILABLE',
  });

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

    fetchData();
    fetchStats(); // ✅ Appel pour récupérer les stats
  }, []);

  // Re-fetch quand les filtres changent
  useEffect(() => {
    if (categories.length > 0) {
      fetchData();
    }
  }, [searchQuery, statusFilter, categoryFilter, employeeFilter, currentPage]);

  // ✅ NOUVELLE FONCTION: Récupérer les statistiques
  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const response = await fetch('http://localhost:8000/assets/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Erreur fetch stats:', error);
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

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

const fetchData = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      return;
    }

    // Calculer skip pour la pagination (EF-25)
    const skip = (currentPage - 1) * ITEMS_PER_PAGE;

    const [assetsResponse, categoriesData, employeesData] = await Promise.all([
      assetApi.list({
        skip,
        limit: ITEMS_PER_PAGE,
        search: searchQuery || undefined,
        status_filter: statusFilter || undefined,
        category_id: categoryFilter || undefined,
        employee_id: employeeFilter || undefined,
      }).catch(() => ({ items: [], total: 0 })),
      categoryApi.list().catch(() => []),
      userApi.getEmployees().catch(() => []),
    ]);

    // ✅ Utiliser le nouveau format de réponse
      console.log('assetsResponse:', assetsResponse);
    console.log('Type:', typeof assetsResponse);
    console.log('Is Array?', Array.isArray(assetsResponse));

    let assetsData: Asset[] = [];
    let total = 0;


        if (assetsResponse && typeof assetsResponse === 'object' && 'items' in assetsResponse) {
      // Nouveau format: { items: [...], total: 12 }
      assetsData = assetsResponse.items || [];
      total = assetsResponse.total || 0;
    } else if (Array.isArray(assetsResponse)) {
      // Ancien format: [...]
      assetsData = assetsResponse;
      total = assetsResponse.length;
    }
    
    
    setAssets(Array.isArray(assetsData) ? assetsData : []);
    setCategories(Array.isArray(categoriesData) ? categoriesData : []);
    setEmployees(Array.isArray(employeesData) ? employeesData : []);
    setTotalAssets(total);
    
    // ✅ Utiliser le vrai total retourné par l'API
    setTotalAssets(total);

    try {
      const userData = await authApi.me();
      setUser(userData);
    } catch (userErr) {
      console.warn('Impossible de charger les infos utilisateur');
      setUser({
        id: 'unknown',
        email: 'admin@test.com',
        first_name: 'Admin',
        last_name: 'User',
        role: 'ADMIN',
        is_active: true,
        created_at: '',
        updated_at: '',
      });
    }
  } catch (err: any) {
    console.error('Erreur de chargement:', err);
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
      return;
    }
    showToast('Erreur de connexion au serveur', 'error');
  } finally {
    setLoading(false);
  }
};

  const resetFilters = () => {
    setSearchQuery('');
    setStatusFilter('');
    setCategoryFilter('');
    setEmployeeFilter('');
    setCurrentPage(1);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.category_id || !isValidUUID(formData.category_id)) {
      showToast('Catégorie invalide. Veuillez recharger la page.', 'error');
      return;
    }
    setActionLoading(true);
    try {
      await assetApi.create({
        name: formData.name,
        serial_number: formData.serial_number,
        category_id: formData.category_id,
        purchase_value: formData.purchase_value,
        description: formData.description,
      });
      setFormData({ name: '', description: '', serial_number: '', category_id: '', purchase_value: '', status: 'AVAILABLE' });
      setShowCreateModal(false);
      setCurrentPage(1);
      await fetchData();
      showToast('Actif créé avec succès !', 'success');
    } catch (err: any) {
      console.error('Erreur création:', err);
      const errorMsg = err.response?.data?.detail || 'Erreur lors de la création';
      showToast(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg), 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAsset || !formData.category_id || !isValidUUID(formData.category_id)) {
      showToast('Données invalides', 'error');
      return;
    }
    setActionLoading(true);
    try {
      await assetApi.update(selectedAsset.id, {
        name: formData.name.trim(),
        serial_number: formData.serial_number.trim(),
        category_id: formData.category_id,
        purchase_value: parseFloat(formData.purchase_value),
        description: formData.description?.trim() || null,
      });
      setShowEditModal(false);
      await fetchData();
      showToast('Actif modifié avec succès !', 'success');
    } catch (err: any) {
      console.error('Erreur modification:', err);
      const errorMsg = err.response?.data?.detail || 'Erreur lors de la modification';
      showToast(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg), 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedAsset) return;
    setActionLoading(true);
    try {
      await assetApi.delete(selectedAsset.id);
      setShowDeleteModal(false);
      await fetchData();
      showToast('Actif supprimé avec succès !', 'success');
    } catch (err) {
      console.error('Erreur suppression:', err);
      showToast('Impossible de supprimer l\'actif', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedAsset || !selectedEmployeeId) {
      showToast('Veuillez sélectionner un employé', 'error');
      return;
    }
    setActionLoading(true);
    try {
      await assetApi.assign(selectedAsset.id, selectedEmployeeId);
      setShowAssignModal(false);
      setSelectedEmployeeId('');
      await fetchData();
      showToast('Actif affecté avec succès !');
    } catch (err: any) {
      console.error('Erreur affectation:', err);
      const errorMsg = err.response?.data?.detail || 'Erreur lors de l\'affectation';
      showToast(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg), 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReturn = async () => {
    if (!selectedAsset) return;
    setActionLoading(true);
    try {
      await assetApi.return(selectedAsset.id, 'GOOD');
      setShowReturnModal(false);
      await fetchData();
      showToast('Actif retourné avec succès !');
    } catch (err: any) {
      console.error('Erreur retour:', err);
      const errorMsg = err.response?.data?.detail || 'Erreur lors du retour';
      showToast(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg), 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const inputClass = `w-full ${darkMode ? 'bg-[#1e2029] border-white/10 text-white placeholder-gray-600' : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'} border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition`;
  const labelClass = `block text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1.5`;

  // Calcul de la pagination
  const totalPages = Math.ceil(totalAssets / ITEMS_PER_PAGE);

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

      {/* Header */}
      <header className={`border-b ${darkMode ? 'border-white/10 bg-[#16181f]/80' : 'border-gray-200 bg-white/80'} backdrop-blur-sm sticky top-0 z-30`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg ${darkMode ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'bg-blue-100 border-blue-200 text-blue-600'} border flex items-center justify-center`}>
              <IconBox />
            </div>
            <span className={`font-bold tracking-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>Asset Management</span>
          </div>
          <div className="flex items-center gap-3">
            {user?.role === 'EMPLOYEE' && (
              <button 
                onClick={() => router.push('/my-assets')} 
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition text-sm ${
                  darkMode 
                    ? 'bg-blue-500/10 border-blue-500/20 text-blue-400 hover:bg-blue-500/20' 
                    : 'bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100'
                }`}
              >
                <IconBox /> Mes Actifs
              </button>
            )}
            <button 
              onClick={() => router.push('/audit-logs')} 
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition text-sm ${
                darkMode 
                  ? 'bg-gray-500/10 border-gray-500/20 text-gray-300 hover:bg-gray-500/20' 
                  : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
              }`}
            >
              <IconAudit /> Audit Logs
            </button>
            <button 
              onClick={() => router.push('/users')} 
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition text-sm ${
                darkMode 
                  ? 'bg-gray-500/10 border-gray-500/20 text-gray-300 hover:bg-gray-500/20' 
                  : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
              }`}
            >
              <IconUsers /> Utilisateurs
            </button>
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

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Stats Cards - Utilise les stats de l'API */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Actifs', value: stats.total, color: 'blue', icon: <IconBox /> },
            { label: 'Disponibles', value: stats.available, color: 'green', icon: <IconCheck /> },
            { label: 'Affectés', value: stats.assigned, color: 'indigo', icon: <IconAssign /> },
            { label: 'Valeur Totale', value: `${stats.total_value.toLocaleString('fr-FR')} MAD`, color: 'amber', icon: <IconBox /> },
          ].map(({ label, value, color, icon }) => (
            <div key={label} className={`${darkMode ? 'bg-[#16181f] border-white/10' : 'bg-white border-gray-200'} rounded-2xl p-5 flex items-center gap-4 border`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${color === 'blue' ? (darkMode ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-blue-100 text-blue-600') : color === 'green' ? (darkMode ? 'bg-green-500/10 text-green-400' : 'bg-green-100 text-green-600') : color === 'indigo' ? (darkMode ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-100 text-indigo-600') : (darkMode ? 'bg-amber-500/10 text-amber-400' : 'bg-amber-100 text-amber-600')}`}>
                {icon}
              </div>
              <div>
                <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{value}</p>
                <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ✅ SECTION RECHERCHE & FILTRAGE (EF-22, EF-23, EF-24) */}
        <div className={`${darkMode ? 'bg-[#16181f] border-white/10' : 'bg-white border-gray-200'} rounded-2xl border p-6`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} flex items-center gap-2`}>
              <IconFilter /> Recherche & Filtres
            </h3>
            {(searchQuery || statusFilter || categoryFilter || employeeFilter) && (
              <button 
                onClick={resetFilters}
                className="text-xs text-blue-500 hover:text-blue-400 transition"
              >
                Réinitialiser les filtres
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Recherche par nom/n° série (EF-22) */}
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <IconSearch />
              </div>
              <input
                type="text"
                placeholder="Rechercher par nom ou n° série..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className={`w-full pl-10 ${darkMode ? 'bg-[#1e2029] border-white/10 text-white placeholder-gray-600' : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'} border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition`}
              />
            </div>

            {/* Filtre par statut (EF-23) */}
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className={inputClass}
            >
              {STATUS_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

            {/* Filtre par catégorie (EF-22) */}
            <select
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
              className={inputClass}
            >
              <option value="">Toutes les catégories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>

            {/* Filtre par employé affecté (EF-24) */}
            <select
              value={employeeFilter}
              onChange={(e) => { setEmployeeFilter(e.target.value); setCurrentPage(1); }}
              className={inputClass}
            >
              <option value="">Tous les employés</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.first_name} {emp.last_name}
                </option>
              ))}
            </select>
          </div>

          {/* Indicateur de filtres actifs */}
          {(searchQuery || statusFilter || categoryFilter || employeeFilter) && (
            <div className="mt-4 flex flex-wrap gap-2">
              {searchQuery && (
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs ${darkMode ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-blue-100 text-blue-700'} border`}>
                  Recherche: "{searchQuery}"
                  <button onClick={() => setSearchQuery('')} className="ml-1 hover:opacity-70">×</button>
                </span>
              )}
              {statusFilter && (
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs ${darkMode ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-purple-100 text-purple-700'} border`}>
                  Statut: {STATUS_OPTIONS.find(s => s.value === statusFilter)?.label}
                  <button onClick={() => setStatusFilter('')} className="ml-1 hover:opacity-70">×</button>
                </span>
              )}
              {categoryFilter && (
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs ${darkMode ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-amber-100 text-amber-700'} border`}>
                  Catégorie: {categories.find(c => c.id === categoryFilter)?.name}
                  <button onClick={() => setCategoryFilter('')} className="ml-1 hover:opacity-70">×</button>
                </span>
              )}
              {employeeFilter && (
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs ${darkMode ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' : 'bg-cyan-100 text-cyan-700'} border`}>
                  Employé: {employees.find(e => e.id === employeeFilter)?.first_name} {employees.find(e => e.id === employeeFilter)?.last_name}
                  <button onClick={() => setEmployeeFilter('')} className="ml-1 hover:opacity-70">×</button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Assets Table */}
        <div className={`${darkMode ? 'bg-[#16181f] border-white/10' : 'bg-white border-gray-200'} rounded-2xl overflow-hidden border`}>
          <div className={`px-6 py-4 border-b ${darkMode ? 'border-white/10' : 'border-gray-200'} flex justify-between items-center`}>
            <div>
              <h2 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Liste des Actifs</h2>
              <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'} mt-1`}>
                {assets.length} résultat{assets.length > 1 ? 's' : ''} affiché{assets.length > 1 ? 's' : ''}
              </p>
            </div>
            {/* ✅ CORRECTION : Structure correcte avec div flex */}
            <div className="flex gap-2">
<button 
  onClick={async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showToast('Non authentifié', 'error');
        return;
      }
      
      // Appel API avec le token
      const response = await fetch('http://localhost:8000/assets/export/csv', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Échec de l\'export');
      }
      
      // Créer un blob et déclencher le téléchargement
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `assets_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      showToast('Export CSV téléchargé avec succès', 'success');
    } catch (error) {
      console.error('Erreur export:', error);
      showToast('Erreur lors de l\'export CSV', 'error');
    }
  }}
  className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition text-sm ${
    darkMode 
      ? 'bg-green-500/10 border-green-500/20 text-green-400 hover:bg-green-500/20' 
      : 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'
  }`}
>
  <IconDownload /> Export CSV
</button>
              
              <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-xl transition">
                <IconPlus /> Nouvel Actif
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`${darkMode ? 'bg-[#1e2029]' : 'bg-gray-50'}`}>
                <tr>
                  {['Nom', 'N° Série', 'Catégorie', 'Statut', 'Valeur', 'Actions'].map(h => (
                    <th key={h} className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className={`divide-y ${darkMode ? 'divide-white/5' : 'divide-gray-200'}`}>
                {assets.length === 0 ? (
                  <tr>
                    <td colSpan={6} className={`px-6 py-12 text-center ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                      {searchQuery || statusFilter || categoryFilter || employeeFilter
                        ? 'Aucun actif ne correspond aux filtres' 
                        : 'Aucun actif trouvé'}
                    </td>
                  </tr>
                ) : assets.map((asset) => (
                  <tr key={asset.id} className={`${darkMode ? 'hover:bg-white/[0.02]' : 'hover:bg-gray-50'} transition`}>
                    <td className={`px-6 py-4 text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{asset.name}</td>
                    <td className={`px-6 py-4 text-sm font-mono ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{asset.serial_number}</td>
                    <td className={`px-6 py-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{asset.category?.name || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border ${
                        asset.status === 'AVAILABLE' ? (darkMode ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-green-100 text-green-700') :
                        asset.status === 'ASSIGNED' ? (darkMode ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-blue-100 text-blue-700') :
                        asset.status === 'DAMAGED' ? (darkMode ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-red-100 text-red-700') :
                        (darkMode ? 'bg-gray-500/10 text-gray-400 border-gray-500/20' : 'bg-gray-100 text-gray-700')
                      }`}>
                        {asset.status === 'AVAILABLE' ? 'Disponible' :
                         asset.status === 'ASSIGNED' ? 'Affecté' :
                         asset.status === 'DAMAGED' ? 'Endommagé' :
                         asset.status === 'MAINTENANCE' ? 'Maintenance' : 'Réformé'}
                      </span>
                    </td>
                    <td className={`px-6 py-4 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{asset.purchase_value?.toLocaleString('fr-FR')} MAD</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {asset.status === 'AVAILABLE' ? (
                          <button onClick={() => { setSelectedAsset(asset); setShowAssignModal(true); }} className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition ${darkMode ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-blue-100 text-blue-700'}`}>Affecter</button>
                        ) : asset.status === 'ASSIGNED' ? (
                          <button onClick={() => { setSelectedAsset(asset); setShowReturnModal(true); }} className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition ${darkMode ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-amber-100 text-amber-700'}`}>Retourner</button>
                        ) : null}
                        <button
                          onClick={() => router.push(`/assets/${asset.id}/history`)}
                          className={`p-1.5 rounded-lg border transition ${darkMode ? 'text-gray-400 hover:text-indigo-400 border-white/10 hover:border-indigo-500/30' : 'text-gray-500 hover:text-indigo-600 border-gray-200 hover:border-indigo-300'}`}
                          title="Voir l'historique"
                        >
                          <IconHistory />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedAsset(asset);
                            setFormData({
                              name: asset.name,
                              serial_number: asset.serial_number,
                              category_id: asset.category?.id || '',
                              purchase_value: asset.purchase_value?.toString() || '',
                              description: asset.description || '',
                              status: asset.status
                            });
                            setShowEditModal(true);
                          }}
                          className={`p-1.5 rounded-lg border transition ${darkMode ? 'text-gray-400 hover:text-blue-400 border-white/10 hover:border-blue-500/30' : 'text-gray-500 hover:text-blue-600 border-gray-200 hover:border-blue-300'}`}
                          title="Modifier"
                        >
                          <IconEdit />
                        </button>
                        <button
                          onClick={() => { setSelectedAsset(asset); setShowDeleteModal(true); }}
                          className={`p-1.5 rounded-lg border transition ${darkMode ? 'text-gray-400 hover:text-red-400 border-white/10 hover:border-red-500/30' : 'text-gray-500 hover:text-red-600 border-gray-200 hover:border-red-300'}`}
                          title="Supprimer"
                        >
                          <IconDelete />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ✅ PAGINATION (EF-25) */}
          <div className={`px-6 py-4 border-t ${darkMode ? 'border-white/10 bg-[#1e2029]' : 'border-gray-200 bg-gray-50'} flex items-center justify-between`}>
            <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Page {currentPage} sur {Math.max(1, totalPages)} ({assets.length} éléments)
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className={`p-2 rounded-lg border transition disabled:opacity-30 ${darkMode ? 'border-white/10 hover:bg-white/5' : 'border-gray-300 hover:bg-gray-100'}`}
              >
                <IconChevronLeft />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded-lg border text-xs font-medium transition ${
                    currentPage === page
                      ? 'bg-blue-600 text-white border-blue-600'
                      : darkMode 
                        ? 'border-white/10 hover:bg-white/5 text-gray-400' 
                        : 'border-gray-300 hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className={`p-2 rounded-lg border transition disabled:opacity-30 ${darkMode ? 'border-white/10 hover:bg-white/5' : 'border-gray-300 hover:bg-gray-100'}`}
              >
                <IconChevronRight />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      {showCreateModal && (
        <Modal title="Nouvel Actif" onClose={() => setShowCreateModal(false)} darkMode={darkMode}>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Nom *</label>
                <input required placeholder="MacBook Pro M3" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>N° de série *</label>
                <input required placeholder="MBP-2024-001" value={formData.serial_number} onChange={e => setFormData({ ...formData, serial_number: e.target.value })} className={inputClass} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Catégorie *</label>
                <select required value={formData.category_id} onChange={e => setFormData({ ...formData, category_id: e.target.value })} className={inputClass}>
                  <option value="">Choisir une catégorie...</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Valeur (MAD) *</label>
                <input type="number" step="0.01" required placeholder="1999.99" value={formData.purchase_value} onChange={e => setFormData({ ...formData, purchase_value: e.target.value })} className={inputClass} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Description</label>
              <textarea placeholder="Optionnel..." value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className={inputClass + ' resize-none'} rows={2} />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowCreateModal(false)} className={`flex-1 px-4 py-2.5 rounded-xl border ${darkMode ? 'border-white/10 text-gray-400' : 'border-gray-300 text-gray-700'} transition text-sm`}>Annuler</button>
              <button type="submit" disabled={actionLoading || !isValidUUID(formData.category_id)} className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium text-sm transition">{actionLoading ? 'Création...' : 'Créer l\'actif'}</button>
            </div>
          </form>
        </Modal>
      )}

      {showEditModal && selectedAsset && (
        <Modal title="Modifier l'actif" onClose={() => setShowEditModal(false)} darkMode={darkMode}>
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Nom *</label>
                <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>N° de série *</label>
                <input required value={formData.serial_number} onChange={e => setFormData({ ...formData, serial_number: e.target.value })} className={inputClass} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Catégorie *</label>
                <select required value={formData.category_id} onChange={e => setFormData({ ...formData, category_id: e.target.value })} className={inputClass}>
                  <option value="">Choisir une catégorie...</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Valeur (MAD) *</label>
                <input type="number" step="0.01" required value={formData.purchase_value} onChange={e => setFormData({ ...formData, purchase_value: e.target.value })} className={inputClass} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Description</label>
              <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className={inputClass + ' resize-none'} rows={2} />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowEditModal(false)} className={`flex-1 px-4 py-2.5 rounded-xl border ${darkMode ? 'border-white/10 text-gray-400' : 'border-gray-300 text-gray-700'} transition text-sm`}>Annuler</button>
              <button type="submit" disabled={actionLoading || !isValidUUID(formData.category_id)} className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium text-sm transition">{actionLoading ? 'Modification...' : 'Enregistrer'}</button>
            </div>
          </form>
        </Modal>
      )}

      {showDeleteModal && selectedAsset && (
        <Modal title="Supprimer l'actif" onClose={() => setShowDeleteModal(false)} darkMode={darkMode}>
          <div className="space-y-4">
            <div className={`${darkMode ? 'bg-red-500/5 border-red-500/20' : 'bg-red-50 border-red-200'} rounded-xl p-4 border`}>
              <p className={`text-sm ${darkMode ? 'text-red-400' : 'text-red-700'}`}>Confirmer la suppression de :</p>
              <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{selectedAsset.name}</p>
              <p className={`text-xs font-mono ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>{selectedAsset.serial_number}</p>
            </div>
            <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>Cette action est <span className={darkMode ? 'text-red-400' : 'text-red-600'}>irréversible</span>.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteModal(false)} className={`flex-1 px-4 py-2.5 rounded-xl border ${darkMode ? 'border-white/10 text-gray-400' : 'border-gray-300 text-gray-700'} transition text-sm`}>Annuler</button>
              <button onClick={handleDelete} disabled={actionLoading} className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-medium text-sm transition">{actionLoading ? 'Suppression...' : 'Supprimer'}</button>
            </div>
          </div>
        </Modal>
      )}

      {showAssignModal && selectedAsset && (
        <Modal title="Affecter l'actif" onClose={() => { setShowAssignModal(false); setSelectedEmployeeId(''); }} darkMode={darkMode}>
          <div className="space-y-4">
            <div className={`${darkMode ? 'bg-[#1e2029] border-white/5' : 'bg-gray-100 border-gray-200'} rounded-xl p-3 border`}>
              <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Actif sélectionné</p>
              <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{selectedAsset.name}</p>
              <p className={`text-xs font-mono ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>{selectedAsset.serial_number}</p>
            </div>
            <div>
              <label className={labelClass}>Employé *</label>
              <select
                value={selectedEmployeeId}
                onChange={(e) => setSelectedEmployeeId(e.target.value)}
                className={inputClass}
              >
                <option value="">Choisir un employé...</option>
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.first_name} {employee.last_name} ({employee.email})
                  </option>
                ))}
              </select>
              {employees.length === 0 && (
                <p className="text-xs text-amber-400 mt-1">
                  Aucun employé disponible. Créez d'abord des comptes employés.
                </p>
              )}
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => { setShowAssignModal(false); setSelectedEmployeeId(''); }} className={`flex-1 px-4 py-2.5 rounded-xl border ${darkMode ? 'border-white/10 text-gray-400' : 'border-gray-300 text-gray-700'} transition text-sm`}>Annuler</button>
              <button onClick={handleAssign} disabled={!selectedEmployeeId || actionLoading} className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium text-sm transition">{actionLoading ? 'Affectation...' : 'Confirmer'}</button>
            </div>
          </div>
        </Modal>
      )}

      {showReturnModal && selectedAsset && (
        <Modal title="Retourner l'actif" onClose={() => setShowReturnModal(false)} darkMode={darkMode}>
          <div className="space-y-4">
            <div className={`${darkMode ? 'bg-amber-500/5 border-amber-500/20' : 'bg-amber-50 border-amber-200'} rounded-xl p-4 border`}>
              <p className={`text-sm ${darkMode ? 'text-amber-400' : 'text-amber-700'}`}>Confirmer le retour de :</p>
              <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{selectedAsset.name}</p>
              <p className={`text-xs font-mono ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>{selectedAsset.serial_number}</p>
            </div>
            <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>Statut sera : <span className={darkMode ? 'text-green-400' : 'text-green-600'}>Disponible</span></p>
            <div className="flex gap-3">
              <button onClick={() => setShowReturnModal(false)} className={`flex-1 px-4 py-2.5 rounded-xl border ${darkMode ? 'border-white/10 text-gray-400' : 'border-gray-300 text-gray-700'} transition text-sm`}>Annuler</button>
              <button onClick={handleReturn} disabled={actionLoading} className="flex-1 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-medium text-sm transition">{actionLoading ? 'Retour...' : 'Confirmer'}</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}