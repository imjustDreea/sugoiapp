import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer style={{ height: 60, background: '#111', color: '#fff', display: 'flex', alignItems: 'center', padding: '0 24px' }}>
      <div style={{ width: '100%', textAlign: 'center' }}>© {new Date().getFullYear()} SugoiHub</div>
    </footer>
  );
};

export default Footer;
