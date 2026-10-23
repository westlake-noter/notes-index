import React, { useEffect, useRef } from 'react';
import { BookOpenIcon } from '@animateicons/react/lucide/book-open-icon';
import { WrenchIcon } from '@animateicons/react/lucide/wrench-icon';
import { GithubIcon } from '@animateicons/react/lucide/github-icon';
import { FolderOpenIcon } from '@animateicons/react/lucide/folder-open-icon';
import { FileTextIcon } from '@animateicons/react/lucide/file-text-icon';
import { SunIcon } from '@animateicons/react/lucide/sun-icon';
import { MoonIcon } from '@animateicons/react/lucide/moon-icon';

const icons = {
  book: BookOpenIcon,
  tools: WrenchIcon,
  github: GithubIcon,
  folder: FolderOpenIcon,
  file: FileTextIcon,
  sun: SunIcon,
  moon: MoonIcon,
};

export default function AnimatedIcon({ name, size = 20, className = '' }) {
  const container = useRef(null);
  const animation = useRef(null);
  const Icon = icons[name];

  useEffect(() => {
    // Animate from the whole interactive target, not just the SVG hit area.
    const target = container.current?.closest('a, button');
    if (!target) return undefined;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const start = () => {
      if (!reducedMotion.matches) animation.current?.startAnimation();
    };
    const stop = () => animation.current?.stopAnimation();
    const events = [
      ['pointerenter', start],
      ['pointerleave', stop],
      ['focus', start],
      ['blur', stop],
      ['click', start],
    ];
    events.forEach(([event, handler]) => target.addEventListener(event, handler));
    reducedMotion.addEventListener('change', stop);
    return () => {
      events.forEach(([event, handler]) => target.removeEventListener(event, handler));
      reducedMotion.removeEventListener('change', stop);
    };
  }, []);

  return (
    <span
      ref={container}
      className={`animated-icon ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <Icon ref={animation} size={size} duration={0.75} />
    </span>
  );
}
