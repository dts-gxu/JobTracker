/**
 * JobTracker v2.0 - React 前端应用入口
 * 
 * @author dts
 * @version 2.0.0
 */
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './store/authStore'
import Layout from './components/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Applications from './pages/Applications'
import AddApplication from './pages/AddApplication'
import EditApplication from './pages/EditApplication'
import Resumes from './pages/Resumes'
import Calendar from './pages/Calendar'
import SalaryCompare from './pages/SalaryCompare'
import Templates from './pages/Templates'

const queryClient = new QueryClient()

function PrivateRoute({ children }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  return isAuthenticated ? children : <Navigate to="/login" />
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="applications" element={<Applications />} />
            <Route path="applications/add" element={<AddApplication />} />
            <Route path="applications/:id/edit" element={<EditApplication />} />
            <Route path="resumes" element={<Resumes />} />
            <Route path="calendar" element={<Calendar />} />
            <Route path="salary-compare" element={<SalaryCompare />} />
            <Route path="templates" element={<Templates />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" toastOptions={{ duration: 3000, style: { borderRadius: '12px', padding: '16px' } }} />
    </QueryClientProvider>
  )
}
