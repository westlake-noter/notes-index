import React, {useRef} from 'react';
import styles from './documents.module.css';
import {documentViews} from './documents.mjs';

export default function DocumentTabs({view, views = documentViews, onChange}) {
  const buttons = useRef([]);
  const onKeyDown = (event, index) => {
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % views.length;
    else if (event.key === 'ArrowLeft') next = (index + views.length - 1) % views.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = views.length - 1;
    else return;
    event.preventDefault();
    onChange(views[next].value);
    buttons.current[next]?.focus();
  };
  return (
    <div role="tablist" aria-label="Repository document" className={styles.tabs}>
      {views.map(({value, label}, index) => (
        <button
          ref={(element) => { buttons.current[index] = element; }}
          key={value}
          type="button"
          role="tab"
          id={`repository-tab-${value}`}
          aria-controls="repository-document-panel"
          aria-selected={view === value}
          tabIndex={view === value ? 0 : -1}
          onKeyDown={(event) => onKeyDown(event, index)}
          onClick={() => onChange(value)}>
          {label}
        </button>
      ))}
    </div>
  );
}
