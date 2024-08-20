import React from "react";
import { Suggestion } from "@api/types";

export interface SuggestionTableProps extends Suggestion {
  setPhrase: (phrase: string) => void,
}

export function SuggestionTable({ list, setPhrase }: SuggestionTableProps): JSX.Element {
  return (
    <ol className="suggestion-list">
      {list.map(phrase =>
        <li
          className="suggestion"
          tabIndex={0}
          onClick={() => setPhrase(phrase)}
          onKeyDown={e => { if (e.key === "Enter") setPhrase(phrase) }}
        >
          {phrase}
        </li>
      )}
    </ol>
  );
}