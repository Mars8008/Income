export type Kind = 'income' | 'expense' | 'saving';

export type Category = {
  id: string;
  name: string;
  emoji: string;
  kind: Kind;
  color: string;
};

export type Transaction = {
  id: string;
  kind: Kind;
  categoryId: string;
  /** Хуримтлалаас мөнгө хасвал сөрөг дүн байна. */
  amount: number;
  /** YYYY-MM-DD */
  date: string;
  note: string;
  createdAt: number;
};

export type DebtType = 'receivable' | 'payable';

export type Debt = {
  id: string;
  type: DebtType;
  person: string;
  amount: number;
  note: string;
  settled: boolean;
  createdAt: number;
};

export type AppState = {
  profile: { name: string; openingBalance: number };
  categories: Category[];
  transactions: Transaction[];
  /** budgets[YYYY-MM][categoryId] = төлөвлөсөн дүн */
  budgets: Record<string, Record<string, number>>;
  debts: Debt[];
};
