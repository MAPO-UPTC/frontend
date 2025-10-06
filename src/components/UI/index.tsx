import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'outline';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  loading = false,
  children,
  disabled,
  className = '',
  ...props
}) => {
  const baseClass = 'btn';
  const variantClass = `btn-${variant}`;
  const sizeClass = `btn-${size}`;
  
  const finalClass = [baseClass, variantClass, sizeClass, className]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      className={finalClass}
      disabled={disabled || loading}
      style={{
        padding: size === 'small' ? '8px 12px' : size === 'large' ? '12px 24px' : '10px 16px',
        fontSize: size === 'small' ? '12px' : size === 'large' ? '16px' : '14px',
        backgroundColor: variant === 'outline' ? 'transparent' : 
                        variant === 'secondary' ? '#6b7280' :
                        variant === 'danger' ? '#ef4444' :
                        variant === 'success' ? '#10b981' : '#0066cc',
        color: variant === 'outline' ? '#0066cc' : 'white',
        border: `1px solid ${variant === 'outline' ? '#0066cc' : 'transparent'}`,
        borderRadius: '6px',
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled || loading ? 0.6 : 1,
        transition: 'all 0.2s ease'
      }}
      {...props}
    >
      {loading && '⏳ '}
      {children}
    </button>
  );
};