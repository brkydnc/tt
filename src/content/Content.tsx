import React from "react";
import { Translation as PanelProps } from "@api/types";

export default function Content(): JSX.Element {
  return (<p>Content script has been injected.</p>);
}

function Panel(props: PanelProps): JSX.Element {
  return (
    <div className="tureng-translate-panel">
      <div className="tureng-translate-container">
        <div className="tureng-translate-title">
          {props.phrase}
        </div>
        <div className="tureng-translate-pronunciation-container">
          Pronunciations
        </div>
      </div>
      <div className="tureng-translate-table">
      </div>
    </div>
  )
}