import React from 'react';

export interface CardProps {
  title?: React.ReactNode;
  image?: string;
  children?: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ title, image, children, className = '' }) => {
  return (
    <div className={`bg-white shadow-sm rounded-md overflow-hidden ${className}`}>
      {image && (
        <div style={{ width: '100%', height: 180, backgroundImage: `url(${image})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
      )}
      <div style={{ padding: 16 }}>
        {title && <h3 style={{ margin: '0 0 8px 0' }}>{title}</h3>}
        <div>{children}</div>
      </div>
    </div>
  );
};

export default Card;
