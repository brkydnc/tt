import { Tureng, TurengAPI } from "@/api/tureng";
import { Dictionary, SearchResultKind, Translation } from "@/api/types";
import { getLocalStorageOrDefaultDictionary, isPhraseWorthSearching, makeSearchPhrase } from "@/common/functions";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "./Button";
import { Panel } from "./Panel";

export type Position = {
  x: number,
  y: number,
}

type SelectionContext = {
  id: number,
  phrase: string,
  position: Position,
}

type ButtonClosedPanelClosedState = {
  button: false,
  panel: false,
}

type ButtonOpenPanelClosedState = {
  translation: Translation,
  position: Position,
  button: true,
  panel: false
}

type ButtonClosedPanelOpenState = {
  translation: Translation,
  position: Position,
  button: false,
  panel: true,
}

type ButtonAndPanelState =
  ButtonClosedPanelClosedState
  | ButtonOpenPanelClosedState
  | ButtonClosedPanelOpenState;

const transitionToClosedState = (): ButtonClosedPanelClosedState =>
  ({ button: false, panel: false });
const transitionToButtonOpenState = (translation: Translation, position: Position): ButtonOpenPanelClosedState =>
  ({ translation, position, button: true, panel: false });
const transitionToPanelOpenState = (translation: Translation, position: Position): ButtonClosedPanelOpenState =>
  ({ translation, position, button: false, panel: true });


// Returns a phrase if there is a valid selection worth searching.
function getSelectedPhraseWorthSearching(): string | null {
  const selection = document.getSelection();
  const phrase = makeSearchPhrase(selection?.toString());
  if (!isPhraseWorthSearching(phrase) || selection?.type !== "Range") return null;
  return phrase;
}

// TODO: Maybe use this with useRef() and pass it as a 
// dependency argument for useCallback?
const tureng: TurengAPI = new Tureng();

export default function Content(): JSX.Element {
  const [state, setState] = useState<ButtonAndPanelState>(transitionToClosedState());
  const lastSelectionIdRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const searchSelection = useCallback(async (context: SelectionContext) => {
    const dictionary: Dictionary = getLocalStorageOrDefaultDictionary();
    const result = await tureng.search(context.phrase, dictionary);
    // If selection ids are not equal, this means that user made another
    // selection right after this one, so cancel the current call.
    if (lastSelectionIdRef.current !== context.id) return;
    if (result.kind !== SearchResultKind.Translation) return;

    setState(transitionToButtonOpenState(result.data, context.position));
  }, [setState, lastSelectionIdRef])

  useEffect(() => {
    const handleMouseUp = (event: MouseEvent) => {
      if (containerRef.current?.contains(event.target as (Node | null))) {
        // Do not run this handler if clicked on the button or the panel.
        return;
      } else {
        // Otherwise, hide the panel and the button.
        setState(transitionToClosedState());
      }

      // If there is no phrase worth searching, do not run this handler.
      const phrase = getSelectedPhraseWorthSearching();
      if (!phrase) return;

      // Increment the selection id to get a new one.
      lastSelectionIdRef.current += 1;
      const id = lastSelectionIdRef.current;
      const position = { x: event.clientX, y: event.clientY };
      const context = { id, phrase, position };
      searchSelection(context).catch(console.error);
    }

    document.addEventListener('mouseup', handleMouseUp);
    return () => document.removeEventListener('mouseup', handleMouseUp);
  }, []);

  const handleButtonClick = useCallback(() => {
    if (!state.button) return;
    setState(transitionToPanelOpenState(state.translation, state.position));
  }, [state, setState]);

  return (
    <div ref={containerRef}>
      {state.button && <Button onClick={handleButtonClick} position={state.position} />}
      {state.panel && <Panel translation={state.translation} />}
    </div>
  )
}

