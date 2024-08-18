import React from "react";
import { Suggestion as SuggestionDataProps } from "../../api/types";

export interface SuggestionProps extends SuggestionDataProps {
  setPhrase: (phrase: string) => void,
}

export function Suggestion(props: SuggestionProps): JSX.Element {
  return (
    <div className="suggestion-container">
      <h4 className="suggestion-header">
        Maybe the correct one is:
      </h4>
      <ol className="suggestion-list">
        {props.list.map(phrase => <SuggestionEntry key={phrase} phrase={phrase} setPhrase={props.setPhrase} />)}
      </ol>
    </div>
  );
}

interface SuggestionEntryProps {
  phrase: string,
  setPhrase: (phrase: string) => void,
}

function SuggestionEntry(props: SuggestionEntryProps): JSX.Element {
  return (
    <li
      className="suggestion"
      tabIndex={0}
      onClick={() => props.setPhrase(props.phrase)}
      onKeyDown={e => { if (e.key === "Enter") props.setPhrase(props.phrase) }}
    >
      {props.phrase}
    </li>
  );
}