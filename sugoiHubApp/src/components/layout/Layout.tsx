import React from 'react';
import Header from './Header';
import Footer from './Footer';

export type LayoutProps = React.PropsWithChildren<{}>;

const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* Barra de navegación superior */}
            <Header />

            {/* Contenido principal */}
            <div style={{ flex: 1, display: 'flex', background: '#f5f6fa' }}>
                {/* Centro: contenido pasado como children */}
                <main style={{ flex: 2, padding: '24px', minWidth: 0 }}>
                    {children}
                </main>

                {/* Sidebar derecha: Perfil */}
                <aside
                    style={{
                        flex: 1,
                        maxWidth: '320px',
                        background: '#fff',
                        borderLeft: '1px solid #e0e0e0',
                        padding: '24px',
                        boxSizing: 'border-box',
                    }}
                >
                    {/* Aquí va el perfil del usuario */}
                    <div style={{ textAlign: 'center' }}>
                        <div
                            style={{
                                width: 80,
                                height: 80,
                                borderRadius: '50%',
                                background: '#ccc',
                                margin: '0 auto 16px',
                            }}
                        />
                        <h3>Nombre de Usuario</h3>
                        <p>Perfil breve o información adicional</p>
                    </div>
                </aside>
            </div>

            {/* Footer */}
            <Footer />
        </div>
    );
};

export default Layout;