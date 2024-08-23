import { Dictionary } from "@/api/types";

const DEFAULT_DICTIONARY = Dictionary.Turkish;
const LOCAL_STORAGE_DICTIONARY_KEY = "dictionary";

export function getLocalStorageDictionary(): Dictionary | null {
  const item = localStorage.getItem(LOCAL_STORAGE_DICTIONARY_KEY);
  if (!item) return null;
  const result = JSON.parse(item);
  return result as Dictionary;
}

export function getLocalStorageOrDefaultDictionary() {
  return getLocalStorageDictionary() || DEFAULT_DICTIONARY;
}

export function setLocalStorageDictionary(dictionary: Dictionary) {
  const str = JSON.stringify(dictionary);
  localStorage.setItem(LOCAL_STORAGE_DICTIONARY_KEY, str);
}

export function makeSearchPhrase(str?: string): string {
  return str?.trim() || "";
}

export function isPhraseWorthSearching(str: string): boolean {
  return str.trim() !== "";
}
