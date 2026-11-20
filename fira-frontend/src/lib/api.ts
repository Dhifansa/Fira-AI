import type {
  ApiResponse,
  AuthResponseData,
  BudgetItem,
  Category,
  CategoryType,
  CreateBudgetInput,
  CreateFinancialGoalInput,
  CreateTransactionInput,
  FinancialGoalItem,
  FinancialTwinData,
  FinancialWeatherData,
  SmartAuditorData,
  TransactionItem,
  TwinChatMessage,
  UpdateBudgetInput,
  UpdateFinancialGoalInput,
  UpdateTransactionInput,
  User,
  WeatherStressTestResult,
  WhatIfSimulationData,
  WhatIfSimulationInput,
} from '@/types';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

const TOKEN_STORAGE_KEY = 'fira_auth_token';
const USER_STORAGE_KEY = 'fira_auth_user';
const GOAL_DEPOSITS_STORAGE_KEY = 'fira_goal_deposits';

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function getStoredUser(): User | null {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(USER_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function setAuthSession(token: string, user: User): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
  window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event('fira-auth-change'));
}

export function updateStoredUser(user: User): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event('fira-auth-change'));
}

export function clearAuthSession(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(TOKEN_STORAGE_KEY);
  window.localStorage.removeItem(USER_STORAGE_KEY);
  window.dispatchEvent(new Event('fira-auth-change'));
}

/** Simpan nominal dana terkumpul tambahan per goal di sisi client karena tabel financial_goals belum memiliki kolom current_amount */
export function getGoalDepositMap(): Record<string, number> {
  if (typeof window === 'undefined') return {};
  const raw = window.localStorage.getItem(GOAL_DEPOSITS_STORAGE_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Record<string, number>;
  } catch {
    return {};
  }
}

export function setGoalDeposit(goalId: string, amount: number): void {
  if (typeof window === 'undefined') return;
  const map = getGoalDepositMap();
  map[goalId] = Math.max(0, amount);
  window.localStorage.setItem(GOAL_DEPOSITS_STORAGE_KEY, JSON.stringify(map));
}

/** Bersihkan string format Rupiah seperti "Rp 1.750.000" menjadi angka 1750000 */
export function parseNominalInput(raw: string | number): number {
  if (typeof raw === 'number') return raw;
  const trimmed = raw.trim();
  if (!trimmed) return 0;
  // Jika sudah format angka desimal standar (misal "150000" atau "150000.50")
  if (/^\d+(\.\d{1,2})?$/.test(trimmed)) {
    return Number(trimmed);
  }
  // Hapus semua karakter non-digit (seperti "Rp", ".", ",", spasi)
  const digitsOnly = trimmed.replace(/[^\d]/g, '');
  return digitsOnly ? Number(digitsOnly) : 0;
}

/** Konversi berbagai input tanggal menjadi YYYY-MM-DD untuk backend */
export function normalizeDateToYMD(raw?: string | Date | null): string {
  if (!raw) {
    return new Date().toISOString().slice(0, 10);
  }
  if (raw instanceof Date) {
    return raw.toISOString().slice(0, 10);
  }
  const str = String(raw).trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
    return str.slice(0, 10);
  }
  const parsed = new Date(str);
  if (!Number.isNaN(parsed.getTime())) {
    const year = parsed.getFullYear();
    const month = String(parsed.getMonth() + 1).padStart(2, '0');
    const day = String(parsed.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  return new Date().toISOString().slice(0, 10);
}

/** Client REST API terpusat. Tidak ada akses database langsung dari frontend. */
export async function apiRequest<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  if (!API_BASE_URL) {
    throw new Error(
      'NEXT_PUBLIC_API_BASE_URL belum dikonfigurasi. Isi file .env.local.'
    );
  }

  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string> | undefined),
  };

  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
    credentials: 'include',
  });

  const payload = (await response
    .json()
    .catch(() => null)) as ApiResponse<T> | null;

  if (!response.ok) {
    const detail =
      payload?.errors && payload.errors.length > 0
        ? payload.errors.join(' ')
        : payload?.message;
    throw new Error(detail ?? `Request gagal (${response.status})`);
  }

  if (!payload) {
    throw new Error('Response backend tidak dapat dibaca.');
  }

  return payload.data;
}

export const authApi = {
  async register(input: {
    name: string;
    email: string;
    password: string;
  }): Promise<AuthResponseData> {
    const data = await apiRequest<AuthResponseData>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    if (data.token && data.user) {
      setAuthSession(data.token, data.user);
    }
    return data;
  },

  async login(input: {
    email: string;
    password: string;
  }): Promise<AuthResponseData> {
    const data = await apiRequest<AuthResponseData>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    if (data.token && data.user) {
      setAuthSession(data.token, data.user);
    }
    return data;
  },

  async getMe(): Promise<User> {
    const data = await apiRequest<{ user: User }>('/auth/me', {
      method: 'GET',
    });
    if (data.user) {
      updateStoredUser(data.user);
    }
    return data.user;
  },
};

export const categoryApi = {
  async getAll(): Promise<Category[]> {
    const data = await apiRequest<{ categories: Category[] }>('/categories', {
      method: 'GET',
    });
    return data.categories ?? [];
  },

  async create(input: { name: string; type: CategoryType }): Promise<Category> {
    const data = await apiRequest<{ category: Category }>('/categories', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    return data.category;
  },

  async update(
    categoryId: string,
    input: { name?: string; type?: CategoryType }
  ): Promise<Category> {
    const data = await apiRequest<{ category: Category }>(
      `/categories/${categoryId}`,
      {
        method: 'PATCH',
        body: JSON.stringify(input),
      }
    );
    return data.category;
  },

  async remove(categoryId: string): Promise<void> {
    await apiRequest<unknown>(`/categories/${categoryId}`, {
      method: 'DELETE',
    });
  },
};

export const transactionApi = {
  async getAll(): Promise<TransactionItem[]> {
    const data = await apiRequest<{ transactions: TransactionItem[] }>(
      '/transactions',
      {
        method: 'GET',
      }
    );
    return data.transactions ?? [];
  },

  async getById(transactionId: string): Promise<TransactionItem> {
    const data = await apiRequest<{ transaction: TransactionItem }>(
      `/transactions/${transactionId}`,
      {
        method: 'GET',
      }
    );
    return data.transaction;
  },

  async create(input: CreateTransactionInput): Promise<TransactionItem> {
    const data = await apiRequest<{ transaction: TransactionItem }>(
      '/transactions',
      {
        method: 'POST',
        body: JSON.stringify({
          ...input,
          amount: String(parseNominalInput(input.amount)),
          transaction_date: normalizeDateToYMD(input.transaction_date),
        }),
      }
    );
    return data.transaction;
  },

  async update(
    transactionId: string,
    input: UpdateTransactionInput
  ): Promise<TransactionItem> {
    const payload: Record<string, unknown> = { ...input };
    if (input.amount !== undefined) {
      payload.amount = String(parseNominalInput(input.amount));
    }
    if (input.transaction_date !== undefined) {
      payload.transaction_date = normalizeDateToYMD(input.transaction_date);
    }
    const data = await apiRequest<{ transaction: TransactionItem }>(
      `/transactions/${transactionId}`,
      {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }
    );
    return data.transaction;
  },

  async remove(transactionId: string): Promise<void> {
    await apiRequest<unknown>(`/transactions/${transactionId}`, {
      method: 'DELETE',
    });
  },
};

export const budgetApi = {
  async getAll(): Promise<BudgetItem[]> {
    const data = await apiRequest<BudgetItem[]>('/budgets', {
      method: 'GET',
    });
    return Array.isArray(data) ? data : [];
  },

  async getById(budgetId: string): Promise<BudgetItem> {
    return apiRequest<BudgetItem>(`/budgets/${budgetId}`, {
      method: 'GET',
    });
  },

  async create(input: CreateBudgetInput): Promise<BudgetItem> {
    return apiRequest<BudgetItem>('/budgets', {
      method: 'POST',
      body: JSON.stringify({
        category_id: input.category_id,
        amount: String(parseNominalInput(input.amount)),
        start_date: normalizeDateToYMD(input.start_date),
        end_date: normalizeDateToYMD(input.end_date),
      }),
    });
  },

  async update(
    budgetId: string,
    input: UpdateBudgetInput
  ): Promise<BudgetItem> {
    const payload: Record<string, unknown> = { ...input };
    if (input.amount !== undefined) {
      payload.amount = String(parseNominalInput(input.amount));
    }
    if (input.start_date !== undefined) {
      payload.start_date = normalizeDateToYMD(input.start_date);
    }
    if (input.end_date !== undefined) {
      payload.end_date = normalizeDateToYMD(input.end_date);
    }
    return apiRequest<BudgetItem>(`/budgets/${budgetId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  async remove(budgetId: string): Promise<void> {
    await apiRequest<unknown>(`/budgets/${budgetId}`, {
      method: 'DELETE',
    });
  },
};

export const financialGoalApi = {
  async getAll(): Promise<FinancialGoalItem[]> {
    const data = await apiRequest<FinancialGoalItem[]>('/financial-goals', {
      method: 'GET',
    });
    return Array.isArray(data) ? data : [];
  },

  async getById(goalId: string): Promise<FinancialGoalItem> {
    return apiRequest<FinancialGoalItem>(`/financial-goals/${goalId}`, {
      method: 'GET',
    });
  },

  async create(input: CreateFinancialGoalInput): Promise<FinancialGoalItem> {
    return apiRequest<FinancialGoalItem>('/financial-goals', {
      method: 'POST',
      body: JSON.stringify({
        name: input.name,
        target_amount: String(parseNominalInput(input.target_amount)),
        start_date: normalizeDateToYMD(input.start_date),
        end_date: normalizeDateToYMD(input.end_date),
        status: input.status ?? 'active',
      }),
    });
  },

  async update(
    goalId: string,
    input: UpdateFinancialGoalInput
  ): Promise<FinancialGoalItem> {
    const payload: Record<string, unknown> = { ...input };
    if (input.target_amount !== undefined) {
      payload.target_amount = String(parseNominalInput(input.target_amount));
    }
    if (input.start_date !== undefined) {
      payload.start_date = normalizeDateToYMD(input.start_date);
    }
    if (input.end_date !== undefined) {
      payload.end_date = normalizeDateToYMD(input.end_date);
    }
    return apiRequest<FinancialGoalItem>(`/financial-goals/${goalId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  async remove(goalId: string): Promise<void> {
    await apiRequest<unknown>(`/financial-goals/${goalId}`, {
      method: 'DELETE',
    });
  },
};

export const aiApi = {
  async getSmartAuditor(): Promise<SmartAuditorData> {
    return apiRequest<SmartAuditorData>('/ai/smart-auditor', {
      method: 'GET',
    });
  },

  async syncAuditorToBudgets(): Promise<{
    syncedCount: number;
    budgets: BudgetItem[];
    message: string;
  }> {
    return apiRequest<{
      syncedCount: number;
      budgets: BudgetItem[];
      message: string;
    }>('/ai/smart-auditor/sync-budgets', {
      method: 'POST',
    });
  },

  async applyAnomalyCap(input: {
    category_id?: string | null;
    amount: number;
  }): Promise<{ budget: BudgetItem; message: string }> {
    return apiRequest<{ budget: BudgetItem; message: string }>(
      '/ai/smart-auditor/apply-cap',
      {
        method: 'POST',
        body: JSON.stringify(input),
      }
    );
  },

  async createSubscription(input: {
    name: string;
    monthlyCost: number;
    icon: string;
    utilizationPct: number;
    recordAsTransaction?: boolean;
  }): Promise<{
    subscription: SmartAuditorData['subscriptions'][number];
    message: string;
  }> {
    return apiRequest<{
      subscription: SmartAuditorData['subscriptions'][number];
      message: string;
    }>('/ai/smart-auditor/subscriptions', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  async deleteSubscription(
    subscriptionId: string
  ): Promise<{ subscription_id: string; message: string }> {
    return apiRequest<{ subscription_id: string; message: string }>(
      `/ai/smart-auditor/subscriptions/${subscriptionId}`,
      {
        method: 'DELETE',
      }
    );
  },

  async getFinancialTwin(risk?: string): Promise<FinancialTwinData> {
    const query = risk ? `?risk=${encodeURIComponent(risk)}` : '';
    return apiRequest<FinancialTwinData>(`/ai/financial-twin${query}`, {
      method: 'GET',
    });
  },

  async chatFinancialTwin(
    message: string,
    history?: TwinChatMessage[]
  ): Promise<{ reply: TwinChatMessage }> {
    return apiRequest<{ reply: TwinChatMessage }>('/ai/financial-twin/chat', {
      method: 'POST',
      body: JSON.stringify({ message, history }),
    });
  },

  async runWhatIfSimulation(
    input: WhatIfSimulationInput
  ): Promise<WhatIfSimulationData> {
    return apiRequest<WhatIfSimulationData>('/ai/what-if-simulator', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  async saveWhatIfScenario(
    input: WhatIfSimulationInput
  ): Promise<{ goal: FinancialGoalItem; message: string }> {
    return apiRequest<{ goal: FinancialGoalItem; message: string }>(
      '/ai/what-if-simulator/save-scenario',
      {
        method: 'POST',
        body: JSON.stringify(input),
      }
    );
  },

  async getFinancialWeather(): Promise<FinancialWeatherData> {
    return apiRequest<FinancialWeatherData>('/ai/financial-weather', {
      method: 'GET',
    });
  },

  async runWeatherStressTest(
    scenario: string
  ): Promise<WeatherStressTestResult> {
    return apiRequest<WeatherStressTestResult>(
      '/ai/financial-weather/stress-test',
      {
        method: 'POST',
        body: JSON.stringify({ scenario }),
      }
    );
  },
};
