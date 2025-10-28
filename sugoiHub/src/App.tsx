import './index.css'
import './App.css'
import FollowCard from './FollowCard.tsx'
import { useState } from 'react'

export function App() {
  const [name, setName] = useState('rubenSilgado')
  return (
   <section className="flex flex-col items-center justify-center gap-4">
          <FollowCard userName={name} >
          Ruben Silgado
          </FollowCard>
          <FollowCard userName="imjustDreea" >
          Anda Andreea
          </FollowCard>
          <FollowCard userName="alexclara_09">
          Alex Clara
          </FollowCard>

          <button onClick={() => setName('Jose Morato')}>
            Cambio nombre
          </button>
  </section>
  )
}
