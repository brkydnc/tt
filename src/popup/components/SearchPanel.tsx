import React from "react";
import { Dictionary, Pronunciation as PronunciationProps } from "../../api/types";

interface SearchInputProps {
  phrase: string,
  setPhrase: (value: string) => void,
  dictionary: Dictionary,
  setDictionary: (dictionary: Dictionary) => void,
  pronunciations: PronunciationProps[],
}

export function SearchPanel(props: SearchInputProps): JSX.Element {
  return (
    <div id="input-container">
      <input
        id="input"
        autoComplete="off"
        placeholder="Translate..."
        value={props.phrase}
        onChange={e => props.setPhrase(e.target.value)}
      />

      <div id="pronunciation-container">
        {/* TODO: Use "accent" as key. */}
        {props.pronunciations.map(props => <Pronunciation {...props} />)}
      </div>

      <select
        id="dictionary"
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

function Pronunciation(props: PronunciationProps): JSX.Element {
  return (
    <div
      className="pronunciation"
      style={{ backgroundImage: `url(${props.flagSrc})` }}
    >
      {/* TODO: Actually play the audio. */}
      <audio src={props.audioSrc.toString()} />
    </div >
  );
}