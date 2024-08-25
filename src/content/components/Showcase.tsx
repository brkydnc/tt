import { Dictionary, SearchResultKind, Translation } from "@/api/types";
import React, { useEffect, useState } from "react";
import { Button } from "./Button";
import { Position } from "./Content";
import { Panel } from "./Panel";
import { Tureng, TurengAPI } from "@/api/tureng";

const tureng: TurengAPI = new Tureng();
const searchPhrase = "test";

export function Showcase(): JSX.Element {
  const [translation, setTranslation] = useState<Translation>();
  const [buttonPosition] = useState<Position>({ x: 0, y: 0 });
  const [panelPosition] = useState<Position>({ x: 0, y: 0 });

  useEffect(() => {
    tureng.search(searchPhrase, Dictionary.Turkish)
      .then(results => {
        if (results.kind !== SearchResultKind.Translation)
          throw new Error("Search result is not of type translation");

        setTranslation(results.data);
      })
      .catch(console.error);
  }, []);

  return (
    <div>
      <Button onClick={() => { }} position={buttonPosition} />
      {translation && <Panel translation={translation} />}
    </div>
  )
}