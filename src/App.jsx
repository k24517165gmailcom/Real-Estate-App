import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Home from './pages/Home'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Gallery from './pages/Gallery'
import AboutPage from './pages/AboutPage'
import Signup from './pages/Signup'
//import WorkspacePricing from './pages/WorkspacePricing'

const App = () => {
  return (
    <Router>
      <div className='w-full overflow-hidden'>
        <ToastContainer />
        <Header />

        <Routes>
          {/* Home page shows all sections */}
          <Route path='/' element={<Home />} />
          <Route path="/signup" element={<Signup />} /> {/* 👈 signup route */}
   
          {/* Add future routes here if needed */}
          <Route path='/gallery' element={<Gallery />} /> 
          <Route path='/about' element={<AboutPage />} /> 
          {/* <Route path='/workspace-pricing' element={<WorkspacePricing />} /> */}
        </Routes>
      </div>
    </Router>
  )
}

export default App
