import './index.css'
import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import HomePage from './components/pages/HomePage'
import AnimePage from './components/pages/AnimePage'
import MangaPage from './components/pages/MangaPage'
import GamesPage from './components/pages/GamesPage'
import DiscoverPage from './components/pages/DiscoverPage'
import CommunityPage from './components/pages/CommunityPage'
import MusicPage from './components/pages/MusicPage'
import ProfilePage from './components/pages/ProfilePage'

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="home" element={<HomePage />} />
          <Route path="anime" element={<AnimePage />} />
          <Route path="manga" element={<MangaPage />} />
          <Route path="games" element={<GamesPage />} />
          <Route path="discover" element={<DiscoverPage />} />
          <Route path="community" element={<CommunityPage />} />
          <Route path="music" element={<MusicPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
