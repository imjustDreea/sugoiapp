import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'default';
export type ButtonSize = 'sm' | 'md' | 'icon' | 'icon-sm';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  children: React.ReactNode;
}

export default function Button({
  variant = 'default',
  size = 'md',
  fullWidth = false,
  className = '',
  children,
  ...props
}: ButtonProps) {
  const baseClasses = 'pixel-btn';
  
  const variantClasses = {
    primary: 'pixel-btn-primary',
    secondary: 'pixel-btn-secondary',
    danger: 'pixel-btn-danger',
    default: '',
  };

  const sizeClasses = {
    sm: 'pixel-btn-sm',
    md: '',
    icon: 'pixel-btn-icon',
    'icon-sm': 'pixel-btn-icon-sm',
  };

  const classes = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    fullWidth ? 'pixel-btn-full' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
