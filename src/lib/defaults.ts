import type { AppState, Category, Kind } from './types';

export const PALETTE = [
  '#F97316',
  '#4F6BED',
  '#A855F7',
  '#22A06B',
  '#E5484D',
  '#0EA5E9',
  '#EAB308',
  '#EC4899',
  '#14B8A6',
  '#8B5CF6',
  '#64748B',
  '#F59E0B',
];

const make = (kind: Kind, items: [string, string, string][]): Category[] =>
  items.map(([id, name, emoji], i) => ({
    id,
    name,
    emoji,
    kind,
    color: PALETTE[i % PALETTE.length],
  }));

export const DEFAULT_CATEGORIES: Category[] = [
  ...make('expense', [
    ['food', 'Хүнс', '🛒'],
    ['home', 'Гэр ахуй', '🛋️'],
    ['health', 'Эрүүл мэнд', '🩺'],
    ['edu', 'Боловсрол', '🎓'],
    ['party', 'Баяр ёслол', '🎂'],
    ['leisure', 'Чөлөөт цаг', '🏖️'],
    ['transport', 'Унаа тээвэр', '🚗'],
    ['beauty', 'Үсчин, гоо сайхан', '💇'],
    ['clothes', 'Хувцас', '👕'],
    ['phone', 'Утас, интернэт', '📱'],
    ['loanpay', 'Зээл төлөлт', '🏦'],
    ['utility', 'Тог, ус, СӨХ', '💡'],
    ['other-exp', 'Бусад', '👛'],
  ]),
  ...make('income', [
    ['salary', 'Цалин', '💼'],
    ['child', 'Хүүхдийн мөнгө', '🧸'],
    ['loan', 'Зээл', '💵'],
    ['receivable', 'Авлага', '🤝'],
    ['other-inc', 'Бусад', '🌱'],
  ]),
  ...make('saving', [
    ['stocks', 'Хувьцаа', '📈'],
    ['deposit', 'Хадгаламж', '🐷'],
  ]),
];

export const EMOJI_CHOICES = [
  '🛒', '🍔', '☕', '🍺', '🛋️', '🩺', '💊', '🎓', '📚', '🎂',
  '🎁', '🏖️', '🎮', '🎬', '🚗', '⛽', '🚌', '✈️', '💇', '👕',
  '👟', '📱', '💻', '🏦', '💡', '🏠', '🐶', '👶', '💼', '💵',
  '💰', '📈', '🐷', '🤝', '🌱', '⭐', '🎵', '🏋️', '❤️', '👛',
];

export const initialState = (): AppState => ({
  profile: { name: 'Найз', openingBalance: 0 },
  categories: DEFAULT_CATEGORIES,
  transactions: [],
  budgets: {},
  debts: [],
});
