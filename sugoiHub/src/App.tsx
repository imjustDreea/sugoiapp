import './index.css'
import './App.css'
import FollowCard from './followCard.tsx'

export function App() {
  return (
   <section className="flex flex-col items-center justify-center gap-4">
          <FollowCard userName="ruben.silgado" >
          Ruben Silgado
          </FollowCard>
          <FollowCard userName="imjustDreea" >
          Anda Andreea
          </FollowCard>
          <FollowCard userName="alexclara_09">
          Alex Clara
          </FollowCard>
  </section>
  )
}
