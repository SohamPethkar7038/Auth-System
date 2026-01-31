import { createContext, use, useState } from "react";
import axios from 'axios';
import { toast } from 'react-toastify';
import { useEffect } from "react";

axios.defaults.withCredentials=true;

export const AppContext=createContext();

export const AppContextProvider=(props)=>{

    const backendUrl=import.meta.env.VITE_BACKEND_URL;

    const [isLogIn,setIsLogIn]=useState(false);
    const [userData,setUserData]=useState(false);
    

    
    const getUserData=async()=>{
        try {

            const {data}=await axios.get(backendUrl + '/api/v1/user/data');
            data.success ? setUserData(data.data.user) : toast.error(data.message);

        } catch (error) {
             toast.error(error.response?.data?.message || error.message);
        }
    }

    const getAuthState=async()=>{
       try {
         const {data}=await axios.get(backendUrl + '/api/v1/auth/isauth')

         if(data.success){
            setIsLogIn(true);
            getUserData();
         }
        
       } catch (error) {
        toast.error(error.message)
       }
    }


    useEffect(()=>{
        getAuthState();
    },[])

    const value={
        backendUrl,
        isLogIn,setIsLogIn,
        userData,setUserData,
        getUserData,
    }
    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}
