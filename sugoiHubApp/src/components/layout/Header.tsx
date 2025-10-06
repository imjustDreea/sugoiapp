import React from 'react';

const Header: React.FC = () => {
  return (
    <nav
      style={{
        height: '60px',
        background: '#222',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px',
        fontSize: '1.2rem',
        fontWeight: 'bold',
      }}
    >
      SugoiHub
    </nav>
  );
};

export default Header;
