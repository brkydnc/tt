import { getLocalStorageOrDefaultDictionary, isPhraseWorthSearching, makeSearchPhrase, setLocalStorageDictionary } from "@/common/functions";
import { SuggestionTable } from "@/components/SuggestionTable";
import { TranslationTable } from "@/components/TranslationTable";
import { Tureng, TurengAPI } from "@api/tureng";
import { Dictionary, SearchResult, SearchResultKind } from "@api/types";
import React, { ReactNode, useEffect, useState } from "react";
import styles from '../styles/Popup.module.scss';
import { SearchPanel } from "./SearchPanel";

const TYPING_DELAY = 200;

// TODO: This might fail. Use MessagePort instead.
const tureng = new Tureng() as TurengAPI;

export default function Popup(): JSX.Element {
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [phrase, setPhrase] = useState('test');
  const [dictionary, setDictionary] = useState(Dictionary.Turkish);
  const [failed, setFailed] = useState(false);

  const search = () => {
    const searchPhrase = makeSearchPhrase(phrase);
    if (!isPhraseWorthSearching(searchPhrase)) return;

    setFailed(false);

    tureng.search(searchPhrase, dictionary)
      .then(setSearchResult)
      .catch(error => {
        setFailed(true);
        console.log(error);
      });
  }

  useEffect(() => {
    const initialDictionary = getLocalStorageOrDefaultDictionary();
    setDictionary(initialDictionary);
  }, []);

  useEffect(() => {
    setLocalStorageDictionary(dictionary);
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

      {
        failed &&
        <Feedback>Error: couldn't load translations.</Feedback>
      }

      {
        !failed &&
        <>
          {
            searchResult?.kind === SearchResultKind.Translation &&
            <TranslationTable variant="popup" {...searchResult.data} />
          }
          {
            searchResult?.kind === SearchResultKind.Suggestion &&
            <>
              <Feedback>Maybe the correct one is:</Feedback>
              <SuggestionTable {...{ ...searchResult.data, setPhrase }} />
            </>
          }
          {
            searchResult?.kind === SearchResultKind.NotFound &&
            <Feedback>Phrase not found.</Feedback>
          }
        </>
      }
    </div>
  );
}

function Feedback(props: { children: ReactNode }): JSX.Element {
  return (
    <h4 className={styles.feedback}>
      {props.children}
    </h4>
  );
}