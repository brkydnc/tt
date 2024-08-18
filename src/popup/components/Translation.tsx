import React from "react";
import { Phrase as PhraseProps, Translation as TranslationProps } from "../../api/types";

export function Translation(props: TranslationProps): JSX.Element {
  return (
    <table className="table" >
      {[...props.primary, ...props.other].map((entry, index) =>
        <tr key={index} className="table-row">
          <td className="table-cell">{entry.context}</td>
          <Phrase {...entry.original} />
          <Phrase {...entry.translated} />
        </tr>
      )}
    </table>
  )
}

function Phrase(props: PhraseProps): JSX.Element {
  return (
    <td className="table-cell">
      <span>{props.content}</span>
      {props.class && <i>{props.class}</i>}
      {props.badges.map(b => <span key={b} className="badge">{b}</span>)}
    </td>
  );
}