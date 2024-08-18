export interface Translation {
  phrase: string,
  primary: TranslationEntry[],
  other: TranslationEntry[],
  pronunciations: Pronunciation[],
}

export interface Suggestion {
  list: string[],
}

export enum SearchResultKind {
  Translation = "translation",
  Suggestion = "suggestion",
  NotFound = "not-found",
}

export type SearchResult = {
  kind: SearchResultKind.Translation,
  data: Translation,
} | {
  kind: SearchResultKind.Suggestion,
  data: Suggestion,
} | {
  kind: SearchResultKind.NotFound,
}

export interface TranslationEntry {
  context: string,
  original: Phrase,
  translated: Phrase,
}

export interface Phrase {
  content: string,
  class?: string,
  badges: string[],
}

export interface Pronunciation {
  audio: URL,
  flag: URL,
}

export enum Dictionary {
  Turkish = "turkish-english",
  French = "french-english",
  Spanish = "spanish-english",
  German = "german-english",
}

export enum Accent {
  // English accents
  US = "us",
  UK = "uk",
  AU = "au",
  // French accents
  FR = "fr",
  CA = "ca",
  // Spanish accents
  ES = "es",
  MX = "mx",
  // German accent
  DE = "de",
}