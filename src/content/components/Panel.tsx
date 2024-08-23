import { Translation } from "@/api/types";
import React from "react";

export interface PanelProps {
  translation: Translation,
}

export function Panel({ translation }: PanelProps): JSX.Element {
  return (
    <div className="tureng-translate-panel">
      <div className="tureng-translate-container">
        <div className="tureng-translate-title">
          {/* {props.phrase} */}
          Phrase
        </div>
        <div className="tureng-translate-pronunciation-container">
          Pronunciations
        </div>
      </div>
      <div className="tureng-translate-table">
        Table
      </div>
    </div>
  )
}