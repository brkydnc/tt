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
  const [phrase, setPhrase] = useState('');
  const [dictionary, setDictionary] = useState(Dictionary.Turkish);
  const [failed, setFailed] = useState(false);

  // FIXME: If a request is slow enough, a second request may overlap with it.
  // this means that setLoading() and setFailed() calls will overlap. And this
  // behavior will cause a buggy view.
  const search = () => {
    const trimmedPhrase = phrase.trim();

    if (!trimmedPhrase) {
      setFailed(false);
      return;
    };

    setFailed(false);

    tureng.search(trimmedPhrase, dictionary)
      .then(setSearchResult)
      .catch(error => {
        setFailed(true);
        console.log(error);
      });
  }

  useEffect(() => {
    const storedDictionaryValue = localStorage.getItem("dictionary");
    if (!storedDictionaryValue) return;

    const storedDictionary = JSON.parse(storedDictionaryValue);
    setDictionary(storedDictionary);
  }, []);

  useEffect(() => {
    localStorage.setItem('dictionary', JSON.stringify(dictionary));
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