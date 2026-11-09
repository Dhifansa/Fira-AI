export type TransactionType = 'INCOME' | 'EXPENSE';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  description?: string;
  date: string;
}

export interface ApiError {
  message: string;
  statusCode?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}
