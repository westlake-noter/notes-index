import React from 'react';
import AnimatedIcon from '@site/src/components/AnimatedIcon';

export default function DocCardHeadingIcon({ item }) {
  return (
    <AnimatedIcon
      name={item.type === 'category' ? 'folder' : 'file'}
      size={22}
      className="theme-doc-card-icon"
    />
  );
}
