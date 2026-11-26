import React from 'react';
import { styles } from '../styles.js';

// Labeled input with an inline error message.
export default function Field({ label, error, hint, as = 'input', children, ...inputProps }) {
  const Tag = as;
  const id = inputProps.id || inputProps.name;
  return (
    <div style={styles.inputGroup}>
      <label style={styles.label} htmlFor={id}>{label}</label>
      {children || (
        <Tag
          id={id}
          style={{ ...styles.input, ...(as === 'textarea' ? { minHeight: '90px', resize: 'vertical' } : {}), ...(error ? styles.inputInvalid : {}) }}
          aria-invalid={!!error}
          {...inputProps}
        />
      )}
      {error ? <span style={styles.fieldError}>{error}</span> : hint ? <span style={styles.hint}>{hint}</span> : null}
    </div>
  );
}
