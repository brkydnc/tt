import { Accent, Pronunciation as PronunciationProps } from "@api/types";
import au from '@assets/flags/au.png';
import ca from '@assets/flags/ca.png';
import de from '@assets/flags/de.png';
import es from '@assets/flags/es.png';
import fr from '@assets/flags/fr.png';
import mx from '@assets/flags/mx.png';
import uk from '@assets/flags/uk.png';
import us from '@assets/flags/us.png';
import styles from '@styles/Pronunciation.module.scss';
import React, { createRef } from "react";
export { Pronunciation as PronunciationProps } from '@api/types';

const accentFlags: Record<Accent, string> = {
  [Accent.AU]: au,
  [Accent.CA]: ca,
  [Accent.DE]: de,
  [Accent.ES]: es,
  [Accent.FR]: fr,
  [Accent.MX]: mx,
  [Accent.UK]: uk,
  [Accent.US]: us,
}

export function Pronunciation({ accent, audioSrc }: PronunciationProps): JSX.Element {
  const audioRef = createRef<HTMLAudioElement>();

  const handleClick = () => {
    audioRef.current?.play();
  }

  return (
    <div className={styles.container}>
      <img className={styles.flag} src={accentFlags[accent]} onClick={handleClick} />
      <audio ref={audioRef} itemType="audio/mpgeg" preload="none" src={audioSrc.toString()} />
    </div >
  );
}