export async function fetchDocument(term, dictionary, parseDom) {
  const res = await fetch(`https://tureng.com/en/${dictionary}/${term}`);
  const text = await res.text();
  const doc = parseDom(text, 'text/html');
  return doc;
}

// TranslationContext {
//    term: string
//    separator: Separator
//    pronunciations: Pronunciation[]
// }
//
// ScrapeResult {
//   type: "translation"       | "suggestion" | "notFound"
//   data: TranslationContext  | string[]     | null
// }
export function scrape([term, doc]) {
  // First of all, test if the page contains the "container of everything".
  const [searchResults] = doc.getElementsByClassName("tureng-searchresults-content");

  // If we don't have it, return not found.
  if (!searchResults) return { type: "notFound", data: null };

  // Tureng does not insert "tureng-page-suggest" class to "the container of
  // everything" when there are some translations.
  const thereAreTranslations = !searchResults.classList.contains("tureng-page-suggest");

  // If we have translations, parse them.
  if (thereAreTranslations) {
    // Tureng puts translations inside `tbody` tags, we extract them.
    const [...tableBodies] = searchResults.getElementsByTagName("tbody");
    const [...audioContainers] = searchResults.getElementsByClassName("tureng-voice");

    // Each `tbody` tag represents a list of translations, primary or
    // secondary. We separate them here.
    const separator = separateTranslations(tableBodies);
    const pronunciations = createPronunciationArray(audioContainers)
    const translationContext = { term, separator, pronunciations }

    return { type: "translation", data: translationContext };
  }

  // TODO: Check with suggestion-list
  const [feedback] = searchResults.getElementsByTagName("h1");

  if (feedback.textContent === "Maybe the correct one is") {
    const [list] = searchResults.getElementsByClassName('suggestion-list');
    const [...listElements] = list.getElementsByTagName('li');
    const suggestions = listElements.map(li => li.firstElementChild.textContent);

    return { type: "suggestion", data: suggestions };
  }

  return { type: "notFound", data: null };
}

// Separator {
//   primary: Translation[]
//   other: Translation[]
// }
export function separateTranslations(tbodyArray) {
  return tbodyArray.reduce((separator, tbody) => {
    const header = tbody.parentElement.previousElementSibling;
    // Remove <b> (term) tag insde <h2> for no confusion.
    header.firstElementChild.remove();

    // Determine if the table contains "other" translations
    const isOther = header.textContent.search("other") > -1

    const translations = [...tbody.children]      // <tr> array
      .slice(1)                                 // Remove column headers
      .filter(tr => tr.childElementCount === 5) // Remove hidden rows
      .map(createTranslation)

    if (isOther)
      separator.other.push(...translations)
    else
      separator.primary.push(...translations);

    return separator
  }, { primary: [], other: [] });
}

// Translation {
//   context: string,
//   phrase: Phrase {
//     content: string,
//     class: string | null,
//     badges: string[],
//   }
//   meaning: Phrase {
//     content: string,
//     class: string | null,
//     badges: string[],
//   }
// }
export function createTranslation(tr) {
  const [ctxEl, phraseEl, meaningEl] = [...tr.children].slice(1, 4);

  const ctx = ctxEl.textContent;

  const phraseContent = phraseEl.firstElementChild.textContent;
  const phraseClassEl = phraseEl.getElementsByTagName("i")[0];
  const phraseClass = (phraseClassEl) ? phraseClassEl.textContent.trim() : null;
  const phraseBadges = [...phraseEl.getElementsByClassName("badge")]
    .map(e => e.textContent);

  const meaningContent = meaningEl.firstElementChild.textContent;
  const meaningClassEl = meaningEl.getElementsByTagName("i")[0];
  const meaningClass = (meaningClassEl) ? meaningClassEl.textContent.trim() : null;
  const meaningBadges = [...meaningEl.getElementsByClassName("badge")]
    .map(e => e.textContent);

  return {
    context: ctx,
    phrase: {
      content: phraseContent,
      class: phraseClass,
      badges: phraseBadges,
    },
    meaning: {
      content: meaningContent,
      class: meaningClass,
      badges: meaningBadges,
    }
  }
}

// Pronunciation {
//   audio: URL,
//   flag: URL,
// }
export function createPronunciationArray(audioContainers) {
  return audioContainers
    .map(container => {
      const [audioElement, flagElement] = container.children;
      const flag = getFlagURLByFlagElement(flagElement);
      const audio = getAudioURLFromAudioElement(audioElement);
      return { audio, flag }
    });
}

// A flag element has the attribute "data-accent".
// A data accent has the format FROM_TO_FROM_accent (without underscores).
// Examples: ENTRENus, ENTRENuk, ENFRFRfr, ENFRFRca.
function getFlagURLByFlagElement(flagElement) {
  const dataAccent = flagElement.getAttribute("data-accent");
  const accent = dataAccent.substr(6, 2);
  return `https://asset.tureng.co/images/flag-${accent}.png`
}

// An audio element has a <source> in it, which is the first element child.
//
// If an element has a `src` attribute without a protocol at the beginning,
// access to that attribute gives a URL which has "moz-extension" as the
// protocol at the beginning. To prevent this we use `getAttribute("src")` to
// get the URL without a protocol and then we append "https:" manually.
function getAudioURLFromAudioElement(audioElement) {
  const URL = audioElement.firstElementChild.getAttribute("src");
  return "https:" + URL;
}