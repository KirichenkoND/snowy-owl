import React, { useEffect } from 'react'
import './App.scss'
import { useAppDispatch } from "./store/store";
import { Outlet } from "react-router-dom";
import { Header } from './components/Header/Header'
import { Footer } from './components/Footer/Footer';
import { setUser } from './store/Slices/userSlice';
import { useMeQuery } from './api/authApi';


const App: React.FC = () => {
  const dispatch = useAppDispatch();
  const { data, isError, isLoading, isSuccess } = useMeQuery();

  useEffect(() => {
    if (isSuccess && data) {
      dispatch(setUser({ phone: data.phone, role: data.role }));
    }
  }, [isSuccess, data, dispatch]);

  if (isError) {
    console.log("Error fetching profile data");
  }

  if (isLoading) {
    console.log("Loading profile data");
  }

  return (
    <>
      <Header />
      <div className='app-container'>
        <Outlet />
      </div>
      <Footer />
    </>
  )
}

export default App;