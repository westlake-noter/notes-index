import React, {useEffect, useRef, useState} from 'react';
import {ThemedComponent} from '@docusaurus/theme-common';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './styles.module.css';

function MapVariant({src, className}) {
  const image = useRef(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const element = image.current;
    let active = true;
    const reveal = async () => {
      if (!element.complete || !element.naturalWidth) return;
      // Cached images may finish before hydration attaches the load listener.
      try {
        await element.decode();
      } catch {
        // A loaded image can still render when explicit decoding is unavailable.
      }
      if (active) setReady(true);
    };
    const fail = () => setFailed(true);
    element.addEventListener('load', reveal);
    element.addEventListener('error', fail);
    if (element.complete) {
      if (element.naturalWidth) reveal();
      else fail();
    }
    return () => {
      active = false;
      element.removeEventListener('load', reveal);
      element.removeEventListener('error', fail);
    };
  }, [src]);

  return (
    <div
      className={`${styles.media} ${className}`}
      data-state={ready ? 'ready' : failed ? 'error' : 'loading'}
      role="img"
      aria-label="Map of Westlake University's Yungu Campus"
      aria-busy={!ready && !failed}
    >
      <div className={styles.skeleton} aria-hidden="true" />
      <img
        ref={image}
        className={styles.image}
        src={src}
        alt=""
        width="3543"
        height="1476"
        fetchPriority="high"
      />
    </div>
  );
}

export default function CampusMap() {
  const sources = {
    light: useBaseUrl('/img/campus-light.webp'),
    dark: useBaseUrl('/img/campus-dark.webp'),
  };
  return (
    <ThemedComponent>
      {({theme, className}) => <MapVariant src={sources[theme]} className={className} />}
    </ThemedComponent>
  );
}
