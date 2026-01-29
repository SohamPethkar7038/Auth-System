import React from 'react'
import {assets} from "../assets/assets"
import { useNavigate } from 'react-router-dom'
const Navbar = () => {

    const navigate=useNavigate();

  return (
    <div className='w-full flex justify-between items-center p-4 sm:p-6 sm:px-24 absolute top-0'>
        <img className='w-32 sm:w-40 md:w-48' src={assets.logo} alt="" />
        
        
        <button onClick={()=>navigate('/login')} className='flex items-center gap-2 border border-gray-500 bg-gray-300 rounded-full px-6 py-2 text-gray-800 hover:bg-gray-100 transition-all cursor-pointer'>Login <img src={assets.arrow_icon} alt="" /></button>
    </div>
  )
}

export default Navbar