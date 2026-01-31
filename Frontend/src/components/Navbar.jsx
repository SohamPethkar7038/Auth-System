import React from 'react'
import {assets} from "../assets/assets"
import { useNavigate } from 'react-router-dom'
import { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
const Navbar = () => {

    const navigate=useNavigate();

    const {userData,backendUrl,setUserData,setIsLogIn}=useContext(AppContext);

    const logout = async () => {
  try {
    const { data } = await axios.post(backendUrl + '/api/v1/auth/logout');

    if (data.success) {
      setIsLogIn(false);
      setUserData(false);
      navigate('/');
    }
  } catch (error) {
    toast.error(error.response?.data?.message || error.message);
  }
};


  return (
    <div className='w-full flex justify-between items-center p-4 sm:p-6 sm:px-24 absolute top-0'>
        <img onClick={()=>navigate('/')} className='w-32 sm:w-40 md:w-48' src={assets.logo} alt="" />


      {userData ?

      <div className='w-8 h-8 flex justify-center items-center rounded-full bg-indigo-800 text-white font-semibold relative group'>
          {userData.name[0].toUpperCase()}

          <div className='absolute hidden group-hover:block top-0 right-0 z-10 text-black rounded pt-8 text-sm whitespace-nowrap'>

            <ul className='list-none m-0 p-2 bg-gray-100 text-sm'>

              {!userData.isAccountVerified &&  <li className='cursor-pointer py-1 px-2 hover:bg-gray-200'>Verify Email</li>}
             
              <li onClick={logout} className='cursor-pointer py-1 px-2 hover:bg-gray-200 '>Logout</li>
            </ul>
          </div>

      </div> :

      <button onClick={()=>navigate('/login')} className='flex items-center gap-2 border border-gray-500 bg-gray-300 rounded-full px-6 py-2 text-gray-800 hover:bg-gray-100 transition-all cursor-pointer'>Login <img src={assets.arrow_icon} alt="" /></button>
      }
        
        
        
    </div>
  )
}

export default Navbar