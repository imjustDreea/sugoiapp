import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const Input: React.FC<InputProps> = ({ label, className = '', ...rest }) => {
  return (
    <label style={{ display: 'block' }}>
      {label && <div style={{ marginBottom: 6 }}>{label}</div>}
      <input className={`border px-3 py-2 rounded ${className}`} {...rest} />
    </label>
  );
};

export default Input;
