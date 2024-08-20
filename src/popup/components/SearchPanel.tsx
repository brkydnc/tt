import React from "react";
import { Dictionary } from "@/api/types";
import { Pronunciation, PronunciationProps } from "@/components/Pronunciation";

import styles from '../styles/SearchPanel.module.scss';

export interface SearchInputProps {
  phrase: string,
  setPhrase: (value: string) => void,
  dictionary: Dictionary,
  setDictionary: (dictionary: Dictionary) => void,
  pronunciations: PronunciationProps[],
}

export function SearchPanel(props: SearchInputProps): JSX.Element {
  return (
    <div className={styles.container}>
      <input
        className={styles.input}
        autoComplete="off"
        placeholder="Translate..."
        value={props.phrase}
        onChange={e => props.setPhrase(e.target.value)}
      />

      <div className={styles.pronunciationContainer}>
        {/* TODO: Use "accent" as key. */}
        {props.pronunciations.map(props => <Pronunciation {...props} />)}
      </div>

      <select
        className={styles.dictionary}
        value={props.dictionary}
        onChange={e => props.setDictionary(e.target.value as Dictionary)}
      >
        <option value={Dictionary.Turkish}>EN-TR</option>
        <option value={Dictionary.German}>EN-DE</option>
        <option value={Dictionary.Spanish}>EN-ES</option>
        <option value={Dictionary.French}>EN-FR</option>
      </select>
    </div>
  )
}