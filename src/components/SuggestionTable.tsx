import React from "react";
import { Suggestion } from "@api/types";

import styles from "@styles/SuggestionTable.module.scss";

export interface SuggestionTableProps extends Suggestion {
  setPhrase: (phrase: string) => void,
}

export function SuggestionTable({ list, setPhrase }: SuggestionTableProps): JSX.Element {
  return (
    <div className={styles.container}>
      <ol type="a" className={styles.list}>
        {list.map(phrase =>
          <li
            className={styles.suggestion}
            tabIndex={0}
            onClick={() => setPhrase(phrase)}
            onKeyDown={e => { if (e.key === "Enter") setPhrase(phrase) }}
          >
            {phrase}
          </li>
        )}
      </ol>
    </div>
  );
}