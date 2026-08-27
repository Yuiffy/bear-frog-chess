import React from 'react';

export default function IconButton({
  label, children, className = '', ...buttonProps
}) {
  return (
    <button
      type="button"
      className={`icon-button ${className}`}
      aria-label={label}
      title={label}
      {...buttonProps}
    >
      {children}
    </button>
  );
}
