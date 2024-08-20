import React from "react";
import { Pronunciation as PronunciationProps } from "@api/types";

export { Pronunciation as PronunciationProps } from '@api/types';

export function Pronunciation(props: PronunciationProps): JSX.Element {
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