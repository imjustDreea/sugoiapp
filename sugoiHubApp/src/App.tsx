import "./index.css";
import "./App.css";
import Layout from "./components/layout/Layout";
import { Button, Card } from './components/ui';
import Input from './components/form/Input';

function App() {

  return (
    <>
     
    <Layout>
      <div>
        <h1>Bienvenido a SugoiHub</h1>
        <p>Este es el contenido principal de la aplicación.</p>

        <section style={{ marginTop: 20 }}>
          <Card title="Ejemplo de tarjeta">
            <p>Contenido de la tarjeta. Usa los componentes reutilizables creados.</p>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <Button onClick={() => alert('Click primario')}>Primario</Button>
              <Button variant="secondary">Secundario</Button>
              <Button variant="ghost">Ghost</Button>
            </div>
          </Card>

          <div style={{ marginTop: 16 }}>
            <Input label="Nombre" placeholder="Escribe tu nombre" />
          </div>
        </section>
      </div>
    </Layout>
    </>
  )
}

export default App
