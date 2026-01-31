import { Routes,Route } from 'react-router-dom'
import './App.css'
import { ToastContainer } from 'react-toastify';

import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import ResetPassword from './pages/ResetPassword.jsx'
import VerifyEmail from './pages/VerifyEmail'

function App() {
  

  return (
    <div>
      <ToastContainer/>
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/login' element={<Login/>}/>
        <Route path='/reset-password' element={<ResetPassword/>}/>
        <Route path='/verify-email' element={<VerifyEmail/>}/>

      </Routes>
    </div>
  )
}

export default App
