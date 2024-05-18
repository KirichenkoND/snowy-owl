import React from 'react'
import './App.scss'
import { Provider } from "react-redux";
import { store } from "./store/store";
import { Outlet } from "react-router-dom";
import { Header } from './components/Header/Header'
import { Footer } from './components/Footer/Footer';

const App: React.FC = () => {
  return (
    <>
      <Provider store={store}>
        <Header />
        <div className='app-container'>
          <Outlet />
        </div>
        <Footer />
      </Provider>
    </>
  )
}

export default App;