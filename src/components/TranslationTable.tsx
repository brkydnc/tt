import React from "react";
import { Phrase as PhraseProps, Translation } from "@api/types";

import styles from '@styles/TranslationTable.module.scss';

export interface TranslationTableProps extends Translation {
  variant: "popup" | "content",
}

export function TranslationTable(props: TranslationTableProps): JSX.Element {
  return (
    <table className={styles.table}>
      {[...props.primary, ...props.other].map((entry, index) =>
        <tr key={index} className={styles.row}>
          <td className={styles.cell}>{entry.context}</td>
          {props.variant === "popup" && <Phrase {...entry.original} />}
          <Phrase {...entry.translated} />
        </tr>
      )}
    </ table>
  )
}

function Phrase(props: PhraseProps): JSX.Element {
  return (
    <td className={styles.cell}>
      <span>{props.content}</span>
      {props.class && <i>{props.class}</i>}
      {props.badges.map(b => <span key={b} className={styles.badge}>{b}</span>)}
    </td>
  );
}