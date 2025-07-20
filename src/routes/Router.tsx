import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import ProtectedRoute from '../components/ProtectedRoute'
import SpotDetail from '../components/SpotDetail'
import Cart from '../components/Cart'
import Destinations from '../components/Destinations'
import Layout from '../components/Layout'
import AdminRoutes from './AdminRoutes'
import { useAuth } from '../hooks/useAuth'
import { 
  HomePage, 
  BookingsPage, 
  WalletPage, 
  ProfilePage,
  LoginPage,
  RegisterPage,
  DestinationDetailPage,
  BookingPage
} from '../pages'

const Router = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const { user, isLoading } = useAuth()

    const handleNavigate = (route: string, params?: Record<string, unknown>) => {
        if (params) {
        navigate(route, { state: params })
        } else {
        navigate(route)
        }
    }

    // 检查是否是管理员路由
    const isAdminRoute = location.pathname.startsWith('/admin')
    
    // 检查是否是管理员用户
    const isAdminUser = user?.role === 'ADMIN' || 
                       (user?.email === 'admin@admin.com' || user?.name === 'admin')

    // 当用户状态加载完成后，检查是否需要重定向管理员
    useEffect(() => {
        if (!isLoading && isAdminUser && !isAdminRoute && location.pathname !== '/login') {
            console.log('检测到管理员用户，重定向到管理员面板')
            navigate('/admin/dashboard', { replace: true })
        }
    }, [isLoading, isAdminUser, isAdminRoute, location.pathname, navigate])

    // 如果是管理员用户但不在管理员路由，重定向到管理员面板
    if (isAdminUser && !isAdminRoute && location.pathname !== '/login' && !isLoading) {
        return <Navigate to="/admin/dashboard" replace />
    }

    // 如果是管理员路由，使用AdminRoutes（已包含保护逻辑），不使用Layout
    if (isAdminRoute) {
        return <AdminRoutes />
    }

    // 普通用户路由使用Layout包裹
    return (
        <Layout>
            <Routes>
                <Route path="/" element={<Navigate to="/home" replace />} />
                <Route 
                path="/home" 
                element={<HomePage onNavigate={handleNavigate} />} 
                />
                <Route 
                path="/destinations" 
                element={<Destinations />} 
                />
                <Route 
                path="/destination/:id" 
                element={<DestinationDetailPage onNavigate={handleNavigate} />} 
                />
                <Route 
                path="/spot/:id" 
                element={<SpotDetail />} 
                />
                <Route 
                path="/cart" 
                element={
                  <ProtectedRoute>
                    <Cart />
                  </ProtectedRoute>
                } 
                />
                <Route 
                path="/booking" 
                element={<BookingPage onNavigate={handleNavigate} />} 
                />
                <Route 
                path="/bookings" 
                element={
                  <ProtectedRoute>
                    <BookingsPage onNavigate={handleNavigate} />
                  </ProtectedRoute>
                } 
                />
                <Route 
                path="/wallet" 
                element={
                  <ProtectedRoute>
                    <WalletPage onNavigate={handleNavigate} />
                  </ProtectedRoute>
                } 
                />
                <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <ProfilePage onNavigate={handleNavigate} />
                  </ProtectedRoute>
                } 
                />
                <Route 
                path="/login" 
                element={
                  <ProtectedRoute requireAuth={false}>
                    <LoginPage onNavigate={handleNavigate} />
                  </ProtectedRoute>
                } 
                />
                <Route 
                path="/register" 
                element={
                  <ProtectedRoute requireAuth={false}>
                    <RegisterPage onNavigate={handleNavigate} />
                  </ProtectedRoute>
                } 
                />
            </Routes>
        </Layout>
    )
}

export default Router
