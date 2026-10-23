import React from 'react';
import clsx from 'clsx';
import useIsBrowser from '@docusaurus/useIsBrowser';
import { useColorMode } from '@docusaurus/theme-common';
import IconLightMode from '@theme/Icon/LightMode';
import IconDarkMode from '@theme/Icon/DarkMode';
import styles from './styles.module.css';

export default function ColorModeToggle({ className, buttonClassName, onChange }) {
  const isBrowser = useIsBrowser();
  const { colorMode } = useColorMode();
  const nextMode = colorMode === 'dark' ? 'light' : 'dark';
  const label = `Switch to ${nextMode} mode`;

  return (
    <div className={clsx(styles.toggle, className)}>
      <button
        className={clsx('clean-btn', styles.button, buttonClassName)}
        type="button"
        onClick={() => onChange(nextMode)}
        disabled={!isBrowser}
        title={label}
        aria-label={label}
      >
        <IconLightMode aria-hidden="true" className={styles.lightIcon} />
        <IconDarkMode aria-hidden="true" className={styles.darkIcon} />
      </button>
    </div>
  );
}
