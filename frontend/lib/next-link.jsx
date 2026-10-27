import React from 'react';
import { useRouter } from './next-navigation.jsx';

export default function Link({ href, children, className = '', onClick, target, rel, ...rest }) {
  const router = useRouter();

  const handleClick = (e) => {
    if (onClick) {
      onClick(e);
    }

    if (e.defaultPrevented) return;

    // Check if target is _blank or external link
    if (target === '_blank' || (typeof href === 'string' && (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('mailto:') || href.startsWith('tel:')))) {
      return;
    }

    // Standard client navigation
    if (!e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) {
      e.preventDefault();
      router.push(href);
    }
  };

  return (
    <a href={href} className={className} onClick={handleClick} target={target} rel={rel} {...rest}>
      {children}
    </a>
  );
}
