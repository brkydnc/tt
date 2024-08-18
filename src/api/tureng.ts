import { fetchDocument, scrapeDocument } from "./functions";
import { Dictionary, SearchResult } from "./types";

// In the future, we might want to add stateful features (i.e. caching).
// So, exposing the API through an object in the first place will be
// better than just declaring functions for maintenance purposes.
export interface TurengAPI {
  search(phrase: string, dictionary: Dictionary): Promise<SearchResult>;
}

// The default Tureng API class. Implements a naive search method. 
export class Tureng implements TurengAPI {
  constructor() { }

  async search(phrase: string, dictionary: Dictionary): Promise<SearchResult> {
    const document = await fetchDocument(phrase, dictionary);
    const searchResult = scrapeDocument(phrase, document);
    return searchResult;
  }
}