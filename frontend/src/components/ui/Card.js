// src/components/ui/Card.js
import React from 'react';

const Card = ({ children, style }) => (
  <div style={{
    background: 'var(--bg4)',
    border: '1px solid var(--br)',
    borderRadius: 'var(--r3)',
    padding: 22,
    ...style
  }}>
    {children}
  </div>
);

export default Card;