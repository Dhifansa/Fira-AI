export type TransactionType = 'INCOME' | 'EXPENSE' | 'income' | 'expense';
export type CategoryType = 'income' | 'expense';
export type FinancialGoalStatus = 'active' | 'completed' | 'cancelled';

export interface User {
  user_id: string;
  name: string;
  email: string;
  created_at?: string;
  updated_at?: string;
}

export interface AuthResponseData {
  user: User;
  token?: string;
}

export interface Category {
  category_id: string;
  name: string;
  type: CategoryType;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  description?: string;
  date: string;
}

export interface TransactionItem {
  transaction_id: string;
  user_id: string;
  category_id: string;
  category_name: string;
  type: CategoryType;
  amount: string;
  description: string | null;
  transaction_date: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateTransactionInput {
  category_id: string;
  type: CategoryType;
  amount: number | string;
  description?: string | null;
  transaction_date: string;
}

export interface UpdateTransactionInput {
  category_id?: string;
  type?: CategoryType;
  amount?: number | string;
  description?: string | null;
  transaction_date?: string;
}

export interface BudgetItem {
  budget_id: string;
  user_id: string;
  category_id: string;
  category_name: string;
  amount: string;
  spent: string;
  start_date: string;
  end_date: string;
}

export interface CreateBudgetInput {
  category_id: string;
  amount: number | string;
  start_date: string;
  end_date: string;
}

export interface UpdateBudgetInput {
  category_id?: string;
  amount?: number | string;
  start_date?: string;
  end_date?: string;
}

export interface FinancialGoalItem {
  financial_goal_id: string;
  user_id: string;
  name: string;
  target_amount: string;
  start_date: string;
  end_date: string;
  status: FinancialGoalStatus;
  created_at?: string;
}

export interface CreateFinancialGoalInput {
  name: string;
  target_amount: number | string;
  start_date: string;
  end_date: string;
  status?: FinancialGoalStatus;
}

export interface UpdateFinancialGoalInput {
  name?: string;
  target_amount?: number | string;
  start_date?: string;
  end_date?: string;
  status?: FinancialGoalStatus;
}

export interface ApiError {
  message: string;
  statusCode?: number;
  errors?: string[];
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  errors?: string[];
  data: T;
}

// ============================================
// AI INTELLIGENCE TYPES
// ============================================

export interface SmartAuditorData {
  auditedAt: string;
  periodLabel: string;
  hasRealData: boolean;
  metrics: {
    efficiencyScore: number;
    efficiencyLabel: string;
    potentialSavingsMonthly: number;
    potentialSavingsYearly: number;
    leaksCount: number;
    leaksSubtitle: string;
    auditedTransactionsCount: number;
  };
  spendingConcentration: {
    totalExpense: number;
    top4SharePct: number;
    categories: {
      category_id: string | null;
      name: string;
      amount: number;
      pct: number;
    }[];
    auditorNote: string;
  };
  anomaly: {
    category_id: string | null;
    spikePct: number;
    dateLabel: string;
    title: string;
    normalDailyAvg: number;
    currentDailyAvg: number;
    explanation: string;
    recommendation: string;
    recommendedMonthlyCap: number;
    severityLabel: string;
  };
  subscriptions: {
    id: string;
    icon: string;
    name: string;
    monthlyCost: number;
    utilizationPct: number;
    utilizationLabel: string;
    utilizationValue: string;
    advice: string;
    potentialSaving: number;
    actionLabel: string;
    isCritical: boolean;
    isCustom?: boolean;
  }[];
  quickWins: {
    id: string;
    badge: string;
    badgeType: 'warning' | 'normal';
    title: string;
    description: string;
    actionLabel: string;
    savingAmount: number;
  }[];
  budgetSyncPreview: string[];
}

export interface TwinChatMessage {
  sender: 'user' | 'twin';
  time: string;
  text: string;
  isRich: boolean;
  metrics: {
    pemasukan: string;
    pengeluaran: string;
    ketahanan: string;
    healthScore?: string;
    status?: string;
  } | null;
}

export interface FinancialTwinData {
  syncedAt: string;
  periodLabel: string;
  hasRealData: boolean;
  analyzedTransactionsCount: number;
  accuracyLabel: string;
  archetype: {
    title: string;
    badge: string;
    similarityScore: number;
    description: string;
    savingsRate: string;
    cashStability: string;
    riskProfile: string;
  };
  habits: {
    id: string;
    type: 'normal' | 'warning';
    title: string;
    description: string;
  }[];
  leakAlert: {
    title: string;
    badge: string;
    description: string;
  };
  initialMessages: TwinChatMessage[];
}

export interface WhatIfSimulationInput {
  scenarioType?: string;
  scenarioName?: string;
  totalAmount?: number;
  paymentMethod?: 'tunai' | 'cicilan12';
  downPayment?: number;
  tenorMonths?: number;
  autoCompensate?: boolean;
}

export interface WhatIfSimulationData {
  hasRealData: boolean;
  parameters: {
    scenarioType: string;
    scenarioName: string;
    totalAmount: number;
    paymentMethod: 'tunai' | 'cicilan12';
    downPayment: number;
    tenorMonths: number;
    autoCompensate: boolean;
    monthlyInstallment: number;
    compensationCut: number;
  };
  baseline: {
    actualNetCashflow: number;
    actualIncome: number;
    actualExpense: number;
    actualEmergencyMonths: number;
    actualHealthScore: number;
  };
  impact: {
    projectedNetCashflow: number;
    cashflowDelta: number;
    cashflowDeltaPct: number;
    projectedEmergencyMonths: number;
    emergencyDelta: number;
    dsrPercentage: number;
    dsrStatus: string;
    projectedHealthScore: number;
    healthDelta: number;
  };
  projectionBars: {
    label: string;
    surplus: number;
    heightPct: number;
  }[];
  evaluation: {
    badge: string;
    level: 'safe' | 'warning' | 'danger';
    points: string[];
  };
  comparisonMatrix: {
    optionA_Cash: {
      upfront: string;
      monthlyLoad: string;
      emergencyImpact: string;
      emergencySeverity: 'safe' | 'warning' | 'danger';
      totalCost: string;
      verdict: string;
    };
    optionB_Installment: {
      upfront: string;
      monthlyLoad: string;
      emergencyImpact: string;
      emergencySeverity: 'safe' | 'warning' | 'danger';
      totalCost: string;
      verdict: string;
    };
    optionC_SaveFirst: {
      upfront: string;
      monthlyLoad: string;
      emergencyImpact: string;
      emergencySeverity: 'safe' | 'warning' | 'danger';
      totalCost: string;
      verdict: string;
    };
  };
}

export interface FinancialWeatherData {
  updatedAt: string;
  periodLabel: string;
  hasRealData: boolean;
  weatherScore: number;
  zone: 'cerah' | 'berawan' | 'hujan' | 'badai';
  statusTitle: string;
  categoryLabel: string;
  aiNarrative: string;
  summaryMetrics: {
    netCashflow: number;
    cashCushionMonths: number;
    debtRatioPct: number;
    savingsRatePct: number;
  };
  barometers: {
    spendingPressure: {
      badge: string;
      score: number;
      realizedAmount: number;
      limitAmount: number;
    };
    liquidityHumidity: {
      badge: string;
      score: number;
      liquidCashAmount: number;
      statusText: string;
    };
    cashflowVolatility: {
      badge: string;
      stdDevPct: number;
      statusText: string;
      thresholdPct: number;
    };
    stormVulnerability: {
      badge: string;
      probabilityLabel: string;
      probabilityPct: number;
      debtLoadPct: number;
      zoneText: string;
    };
  };
  forecasts: {
    monthLabel: string;
    badge: string;
    iconType: 'sparkles' | 'sun' | 'cloud-sun';
    predictedScore: number;
    projectedSurplus: number;
    note: string;
  }[];
  mitigations: {
    id: string;
    badge: string;
    badgeType: 'warning' | 'normal';
    title: string;
    description: string;
    actionType: 'apply-budget' | 'open-simulator';
    actionLabel: string;
    recommendedCap?: number;
    category_id?: string | null;
  }[];
  extremeSimulation: {
    maxSurvivalMonths: number;
    cashCondition: string;
  };
}

export interface WeatherStressTestResult {
  scenario: string;
  title: string;
  survivalMonths: number;
  extendedSurvivalMonths: number;
  postShockScore: number;
  status: string;
  recommendation: string;
}
