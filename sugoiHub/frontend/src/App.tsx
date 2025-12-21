import './index.css'
import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useContext } from 'react'
import MainLayout from './layouts/MainLayout'
import HomePage from './components/pages/HomePage'
import AnimePage from './components/pages/AnimePage'
import MangaPage from './components/pages/MangaPage'
import GamesPage from './components/pages/GamesPage'
import DiscoverPage from './components/pages/DiscoverPage'
import CommunityPage from './components/pages/CommunityPage'
import MusicPage from './components/pages/MusicPage'
import ProfilePage from './components/pages/ProfilePage'
import LoginPage from './components/pages/LoginPage'
import RegisterPage from './components/pages/RegisterPage'
import { AuthContext } from './context/AuthContext'

function PrivateRoute({ element }: { element: React.ReactNode }) {
  const auth = useContext(AuthContext);
  return auth?.token ? element : <Navigate to="/login" />;
}

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Rutas protegidas */}
        <Route path="/" element={<PrivateRoute element={<MainLayout />} />}>
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
