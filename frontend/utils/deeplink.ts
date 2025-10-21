/**
 * Deep link utilities for Bible Chat
 */

// Book name aliases (EN)
const EN_ALIASES: Record<string, string> = {
  'Jn': 'John',
  'Mt': 'Matthew',
  'Mk': 'Mark',
  'Lk': 'Luke',
  'Ps': 'Psalms',
  'Phil': 'Philippians',
  'Rom': 'Romans',
  'Prov': 'Proverbs',
  'Isa': 'Isaiah',
  'Jer': 'Jeremiah',
  'Jas': 'James',
  'Tim': 'Timothy',
  'Cor': 'Corinthians',
};

// Book name aliases (RU)
const RU_ALIASES: Record<string, string> = {
  'Ин': 'Иоанна',
  'Мф': 'Матфея',
  'Мк': 'Марка',
  'Лк': 'Луки',
  'Пс': 'Псалом',
  'Флп': 'Филиппийцам',
  'Рим': 'Римлянам',
  'Прит': 'Притчи',
  'Ис': 'Исайя',
  'Иер': 'Иеремия',
  'Иак': 'Иакова',
};

/**
 * Normalize book name aliases
 */
const normalizeBookName = (book: string, locale: 'en' | 'ru'): string => {
  const aliases = locale === 'en' ? EN_ALIASES : RU_ALIASES;
  return aliases[book] || book;
};

/**
 * Build deep link for passage viewer
 * Format: app://passage/{ref}
 */
export const buildPassageDeeplink = (ref: string, locale: 'en' | 'ru'): string => {
  // Parse ref (e.g., "John 3:16" or "Иоанна 3:16")
  const parts = ref.split(' ');
  if (parts.length >= 2) {
    const book = normalizeBookName(parts[0], locale);
    const rest = parts.slice(1).join(' ');
    const normalizedRef = `${book} ${rest}`;
    return `app://passage/${encodeURIComponent(normalizedRef)}`;
  }
  return `app://passage/${encodeURIComponent(ref)}`;
};

/**
 * Parse citations from text using regex
 * Supports EN and RU formats
 */
export const parseCitations = (text: string, locale: 'en' | 'ru'): string[] => {
  const citations: string[] = [];
  
  // EN regex: "John 3:16", "1 Corinthians 10:13", "Psalm 23:1-4"
  const enRegex = /([1-3]?\s?[A-Za-z]+)\s+(\d{1,3}):(\d{1,3}(?:-\d{1,3})?)/g;
  
  // RU regex: "Иоанна 3:16", "1 Коринфянам 10:13", "Псалом 23:1-4"
  const ruRegex = /([1-3]?\s?[А-ЯЁ][а-яё]+)\s+(\d{1,3}):(\d{1,3}(?:-\d{1,3})?)/g;
  
  const regex = locale === 'en' ? enRegex : ruRegex;
  const matches = text.matchAll(regex);
  
  for (const match of matches) {
    citations.push(match[0]);
  }
  
  // Deduplicate and limit to max 5
  return [...new Set(citations)].slice(0, 5);
};

/**
 * Truncate long citation text
 */
export const truncateCitation = (ref: string, maxLength: number = 25): string => {
  if (ref.length <= maxLength) return ref;
  return ref.substring(0, maxLength - 1) + '…';
};
