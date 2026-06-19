import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ Intercepteur REQUEST - Ajoute le token à CHAQUE requête
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    console.error('Erreur intercepteur request:', error);
    return Promise.reject(error);
  }
);

// ✅ Intercepteur RESPONSE - Gère les erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('RÉPONSE ERREUR:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
    });
    return Promise.reject(error);
  }
);

// ── Types ─────────────────────────────────────────────────────────────────
export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'ADMIN' | 'MANAGER' | 'EMPLOYEE';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Asset {
  id: string;
  name: string;
  description: string | null;
  serial_number: string;
  category_id: string;
  category?: { id: string; name: string };
  purchase_value: number;
  purchase_date: string | null;
  status: 'AVAILABLE' | 'ASSIGNED' | 'DAMAGED' | 'MAINTENANCE' | 'RETIRED';
  is_deleted: boolean;
  created_at: string;
  updated_at: string | null;
}

export interface Category {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

export interface Assignment {
  id: string;
  asset_id: string;
  employee_id: string;
  assigned_by: string;
  assigned_at: string;
  returned_at: string | null;
  return_condition: string | null;
  notes: string | null;
}

export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  before_data: Record<string, any> | null;
  after_data: Record<string, any> | null;
  ip_address: string | null;
  created_at: string;
}

// ── Auth API ───────────────────────────────────────────────────────────────
export const authApi = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    if (typeof window !== 'undefined' && response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
    }
    return response.data;
  },
  
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  },
  
  me: async () => {
    const response = await api.get<User>('/auth/me');
    return response.data;
  },
};

// ── Users API ──────────────────────────────────────────────────────────────
export const userApi = {
  list: async () => {
    const response = await api.get<User[]>('/users');
    return response.data;
  },
  
  getEmployees: async () => {
    const users = await userApi.list();
    return users.filter(user => user.role === 'EMPLOYEE');
  },
  
  create: async (data: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    role: 'ADMIN' | 'MANAGER' | 'EMPLOYEE';
  }) => {
    const response = await api.post<User>('/users', data);
    return response.data;
  },
  
  update: async (id: string, data: Partial<{
    email: string;
    first_name: string;
    last_name: string;
    role: string;
    is_active: boolean;
    password: string;
  }>) => {
    const response = await api.put<User>(`/users/${id}`, data);
    return response.data;
  },
  
  delete: async (id: string) => {
    const response = await api.delete<{message: string; assets_returned: number}>(`/users/${id}`);
    return response.data;
  },
  
  getById: async (id: string) => {
    const response = await api.get<User>(`/users/${id}`);
    return response.data;
  },
};

// ── Assets API ─────────────────────────────────────────────────────────────
export const assetApi = {
  list: async (params?: { 
    skip?: number; 
    limit?: number; 
    search?: string; 
    status?: string;
    status_filter?: string;
    category_id?: string;
    employee_id?: string;
  }) => {
    const response = await api.get<Asset[]>('/assets', { params });
    return response.data;
  },

  getHistory: async (assetId: string): Promise<Assignment[]> => {
    const response = await api.get<Assignment[]>(`/assets/${assetId}/history`);
    return response.data;
  },
  
  getById: async (id: string) => {
    const response = await api.get<Asset>(`/assets/${id}`);
    return response.data;
  },
  
  create: async (data: {
    name: string;
    serial_number: string;
    category_id: string;
    purchase_value: number | string;
    description?: string;
  }) => {
    const payload = {
      name: data.name.trim(),
      serial_number: data.serial_number.trim(),
      category_id: data.category_id,
      purchase_value: typeof data.purchase_value === 'string' 
        ? parseFloat(data.purchase_value) 
        : data.purchase_value,
      description: data.description?.trim() || null,
    };
    const response = await api.post<Asset>('/assets', payload);
    return response.data;
  },
  
  update: async (id: string, data: Partial<Asset>) => {
    const response = await api.put<Asset>(`/assets/${id}`, data);
    return response.data;
  },
  
  delete: async (id: string) => {
    await api.delete(`/assets/${id}`);
  },
  
  assign: async (assetId: string, employeeId: string, notes?: string) => {
    const response = await api.post<Asset>(`/assets/${assetId}/assign`, {
      employee_id: employeeId.trim(),
      notes: notes || null,
    });
    return response.data;
  },
  
  return: async (assetId: string, returnCondition: string = 'GOOD', notes?: string) => {
    const response = await api.post<Asset>(`/assets/${assetId}/return`, {
      return_condition: returnCondition,
      notes: notes || null,
    });
    return response.data;
  },
};

// ── Categories API ─────────────────────────────────────────────────────────
export const categoryApi = {
  list: async () => {
    const response = await api.get<Category[]>('/categories');
    return response.data;
  },
  
  create: async (name: string, description: string | null = null) => {
    const response = await api.post<Category>('/categories', { name, description });
    return response.data;
  },
};

// ── Assignments API ────────────────────────────────────────────────────────
export const assignmentApi = {
  list: async (params?: {
    skip?: number;
    limit?: number;
    employee_id?: string;
    asset_id?: string;
    active_only?: boolean;
  }) => {
    const response = await api.get<Assignment[]>('/assignments', { params });
    return response.data;
  },
  
  myAssets: async () => {
    const response = await api.get<any[]>('/assignments/my-assets');
    return response.data;
  },
  
  myHistory: async () => {
    const response = await api.get<Assignment[]>('/assignments/my-history');
    return response.data;
  },
  
  stats: async () => {
    const response = await api.get<any>('/assignments/stats');
    return response.data;
  },
};

// ── Audit Logs API ─────────────────────────────────────────────────────────
export const auditApi = {
  list: async (params?: { 
    skip?: number; 
    limit?: number; 
    entity_type?: string; 
    action?: string;
    user_id?: string;
  }) => {
    const response = await api.get<AuditLog[]>('/audit-logs', { params });
    return response.data;
  },
  
  stats: async () => {
    const response = await api.get<any>('/audit-logs/stats');
    return response.data;
  },
};

export default api;