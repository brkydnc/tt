import { ElementNotFoundError } from "./errors";
import { SearchResultKind, SearchResult, TranslationEntry, Pronunciation, Dictionary } from "./types";
import { parseFromString } from "../utils/dom";

// Fetches the document from the given dictionary and for the given phrase.
export async function fetchDocument(phrase: string, dictionary: Dictionary): Promise<Document> {
  const res = await fetch(`https://tureng.com/en/${dictionary}/${phrase}`);
  const text = await res.text();
  const document = parseFromString(text);
  return document;
}

// Extracts the useful information from the given document.
export function scrapeDocument(phrase: string, doc: Document): SearchResult {
  // First of all, test if the page contains the "container of everything".
  const [searchResults] = doc.getElementsByClassName("tureng-searchresults-content");

  // If we don't have it, return not found.
  if (!searchResults) return { kind: SearchResultKind.NotFound };

  // Tureng does not insert "tureng-page-suggest" class to "the container of
  // everything" when there are some translations.
  const thereAreTranslations = !searchResults.classList.contains("tureng-page-suggest");

  // If we have translations, parse them.
  if (thereAreTranslations) {
    // Tureng puts translations inside `tbody` tags, we extract them.
    // Each `tbody` tag represents a list of translations, primary or
    // secondary. We separate them here.
    const [...tableBodies] = searchResults.getElementsByTagName("tbody");
    const [primary, other] = extractTranslations(tableBodies);

    const [...audioContainers] = searchResults.getElementsByClassName("tureng-voice");
    const pronunciations = createPronunciations(audioContainers)

    return {
      kind: SearchResultKind.Translation,
      data: {
        phrase,
        primary,
        other,
        pronunciations,
      }
    };
  }

  const [list] = searchResults.getElementsByClassName('suggestion-list');

  // Check if the page contains a suggestion list.
  if (list) {
    const [...listElements] = list.getElementsByTagName('li');
    const suggestions = listElements.map(li => {
      if (!li.firstElementChild?.textContent) throw new ElementNotFoundError();
      return li.firstElementChild.textContent;
    });

    return { kind: SearchResultKind.Suggestion, data: { list: suggestions } };
  }

  return { kind: SearchResultKind.NotFound };
}

// Extracts the primary and the secondary (other) translations.
export function extractTranslations(sections: HTMLTableSectionElement[]): [TranslationEntry[], TranslationEntry[]] {
  const primary: TranslationEntry[] = [];
  const other: TranslationEntry[] = [];

  for (const section of sections) {
    const header = section.parentElement?.previousElementSibling;
    if (!header) throw new ElementNotFoundError();

    // Remove <b> (term) tag insde <h2> for collisions, for example, if the 
    // search term is "other", then determining whether the page contains 
    // other (secondary) translations will be confusing.
    if (!header.firstElementChild) throw new ElementNotFoundError();
    header.firstElementChild.remove();

    // Determine if the table contains "other" translations
    if (!header.textContent) throw new ElementNotFoundError();
    const isOther = header.textContent.search("other") > -1

    const translations = ([...section.children] as HTMLTableRowElement[])
      .slice(1)                                 // Remove column headers
      .filter(tr => tr.childElementCount === 5) // Remove hidden rows
      .map(createTranslation)

    if (isOther)
      other.push(...translations)
    else
      primary.push(...translations);

  }

  return [primary, other]
}

export function createTranslation(rows: HTMLTableRowElement): TranslationEntry {
  const [contextElement, originalElement, translatedElement] = [...rows.children].slice(1, 4);

  if (!contextElement || !originalElement || !translatedElement)
    throw new ElementNotFoundError();

  const context = contextElement.textContent;
  const originalContent = originalElement.firstElementChild?.textContent;
  const translatedContent = translatedElement.firstElementChild?.textContent;

  if (!context || !originalContent || !translatedContent)
    throw new ElementNotFoundError();

  const originalClass = originalElement.getElementsByTagName("i").item(0)?.textContent?.trim();
  const translatedClass = translatedElement.getElementsByTagName("i").item(0)?.textContent?.trim();

  // TODO: "badge" class may be changed in the future, and this will still pass.
  // Write tests that check the badge class is still called "badge".
  const originalBadgeElements = originalElement.getElementsByClassName("badge");
  const originalBadges = [...originalBadgeElements].map(element => {
    if (!element.textContent) throw new ElementNotFoundError();
    return element.textContent;
  });

  const translatedBadgeElements = translatedElement.getElementsByClassName("badge");
  const translatedBadges = [...translatedBadgeElements].map(element => {
    if (!element.textContent) throw new ElementNotFoundError();
    return element.textContent;
  });

  return {
    context,
    original: {
      content: originalContent,
      class: originalClass,
      badges: originalBadges,
    },
    translated: {
      content: translatedContent,
      class: translatedClass,
      badges: translatedBadges,
    }
  }
}

export function createPronunciations(audioContainers: Element[]): Pronunciation[] {
  return audioContainers.map(container => {
    const [audioElement, flagElement] = container.children;
    if (!audioElement || !flagElement) throw new ElementNotFoundError();
    const flagSrc = getFlagURLByFlagElement(flagElement);
    const audioSrc = getAudioURLFromAudioElement(audioElement);
    return { audioSrc, flagSrc }
  });
}

// A flag element has the attribute "data-accent".
// A data accent has the format FROM_TO_FROM_accent (without underscores).
// Examples: ENTRENus, ENTRENuk, ENFRFRfr, ENFRFRca.
function getFlagURLByFlagElement(flagElement: Element): URL {
  const dataAccent = flagElement.getAttribute("data-accent");
  const accent = dataAccent?.substr(6, 2);
  return new URL(`https://asset.tureng.co/images/flag-${accent}.png`);
}

// An audio element has a <source> in it, which is the first element child.
//
// If an element has a `src` attribute without a protocol at the beginning,
// access to that attribute gives a URL which has "moz-extension" as the
// protocol at the beginning. To prevent this we use `getAttribute("src")` to
// get the URL without a protocol and then we append "https:" manually.
function getAudioURLFromAudioElement(audioElement: Element): URL {
  const url = audioElement.firstElementChild?.getAttribute("src");
  return new URL("https:" + url);
}