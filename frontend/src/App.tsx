import React from 'react'
import { Route, Routes } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import MainPage from './pages/MainPage'

const App = () => {
  return (
    <div>
      <Routes>
        <Route path='/' element={<LandingPage />} />
        <Route path='/chat' element={<MainPage />} />
      </Routes>
    </div>
  )
}

export default App
