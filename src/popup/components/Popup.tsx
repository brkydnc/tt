import { Tureng, TurengAPI } from "@api/tureng";
import { Dictionary, SearchResult, SearchResultKind } from "@api/types";
import { SuggestionTable as RawSuggestionTable, SuggestionTableProps } from "@/components/SuggestionTable";
import { TranslationTable } from "@/components/TranslationTable";
import React, { useEffect, useState } from "react";
import { SearchPanel } from "./SearchPanel";
import styles from '../styles/Popup.module.scss';

const TYPING_DELAY = 200;

// TODO: This might fail. Use MessagePort instead.
const tureng = new Tureng() as TurengAPI;

export default function Popup(): JSX.Element {
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [phrase, setPhrase] = useState('asdf');
  const [dictionary, setDictionary] = useState(Dictionary.Spanish);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);

  // FIXME: If a request is slow enough, a second request may overlap with it.
  // this means that setLoading() and setFailed() calls will overlap. And this
  // behavior will cause a buggy view.
  const search = () => {
    const trimmedPhrase = phrase.trim();

    if (!trimmedPhrase) {
      setLoading(false);
      setFailed(false);
      return;
    };

    setFailed(false);
    setLoading(true);

    tureng.search(trimmedPhrase, dictionary)
      .then(setSearchResult)
      .catch(error => {
        setFailed(true);
        console.log(error);
      })
      .finally(() => {
        setLoading(false);
      })
  }

  useEffect(() => {
    search()
  }, [dictionary]);

  useEffect(() => {
    const delay = setTimeout(search, TYPING_DELAY);
    return () => { clearTimeout(delay) }
  }, [phrase]);

  return (
    <div className={styles.popup}>
      <SearchPanel
        phrase={phrase}
        setPhrase={setPhrase}
        dictionary={dictionary}
        setDictionary={setDictionary}
        pronunciations={(searchResult?.kind === SearchResultKind.Translation) ? searchResult.data.pronunciations : []}
      />

      {loading && <span>Loading...</span>}
      {failed && <span>Error: couldn't load translations.</span>}

      {
        // If a request is loading, has failed, do not render the previous search result.
        (!loading || failed) && <>
          {searchResult?.kind === SearchResultKind.Translation && <TranslationTable variant="popup" {...searchResult.data} />}
          {searchResult?.kind === SearchResultKind.Suggestion && <SuggestionTable {...{ ...searchResult.data, setPhrase }} />}
          {searchResult?.kind === SearchResultKind.NotFound && <NotFound />}
        </>
      }
    </div>
  );
}

function SuggestionTable(props: SuggestionTableProps): JSX.Element {
  return (
    <>
      <h4 className={styles.feedback}>Maybe the correct one is:</h4>
      <RawSuggestionTable {...props} />
    </>
  );
}

function NotFound(): JSX.Element {
  return (
    <h4 className={styles.feedback}>Phrase not found</h4>
  );
}