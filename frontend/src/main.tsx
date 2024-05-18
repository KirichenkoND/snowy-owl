import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.scss'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import MainPage from './pages/MainPage/MainPage'
import AuthPage from './pages/AuthPage/AuthPage'
import ClassesPage from './pages/ClassesPage/ClassesPage'
import SubjectsPage from './pages/SubjectsPage/SubjectsPage'
import RoomsPage from './pages/RoomsPage/RoomsPage'
import TeachersPage from './pages/TeachersPage/TeachersPage'
import StudentsPage from './pages/StudentsPage/StudentsPage'
import MarksPage from './pages/MarksPage/MarksPage'
import SettingsPage from './pages/SettingsPage/SettingsPage'
import App from './App'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: '/',
        element: <MainPage />,
      },
      {
        path: '/auth',
        element: <AuthPage />,
      },
      {
        path: '/classes',
        element: <ClassesPage />,
      },
      {
        path: '/subjects',
        element: <SubjectsPage />,
      },
      {
        path: '/rooms',
        element: <RoomsPage />,
      },
      {
        path: '/teachers',
        element: <TeachersPage />,
      },
      {
        path: '/students',
        element: <StudentsPage />,
      },
      {
        path: '/marks',
        element: <MarksPage />,
      },
      {
        path: '/settings',
        element: <SettingsPage />,
      }
    ]
  }
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
