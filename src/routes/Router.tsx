import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import ProtectedRoute from '../components/ProtectedRoute'
import SpotDetail from '../components/SpotDetail'
import Cart from '../pages/CartPage'
import SpotsPage from '../pages/SpotsPage'
import OrderConfirmPage from '../pages/OrderConfirmPage'
import OrderDetail from '../components/OrderDetail'
import BookingsPage from '../pages/BookingsPage'
import { 
  HomePage, 
  SearchPage, 
  SearchResultsPage, 
  WalletPage, 
  ProfilePage,
  LoginPage,
  RegisterPage,
  DestinationDetailPage,
  TravelHomepage,
  BookingPage
} from '../pages'
import AdminRoutes from './AdminRoutes'
import { useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'

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

    return (
        <Routes>
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route 
            path="/home" 
            element={<HomePage onNavigate={handleNavigate} />} 
            />
            <Route 
            path="/travel" 
            element={<TravelHomepage onNavigate={handleNavigate} />} 
            />
            <Route 
            path="/search" 
            element={<SearchPage onNavigate={handleNavigate} />} 
            />
            <Route 
            path="/search-results" 
            element={<SearchResultsPage onNavigate={handleNavigate} />} 
            />
            <Route 
            path="/spots" 
            element={<SpotsPage />} 
            />
            <Route 
            path="/travel/:id" 
            element={<DestinationDetailPage onNavigate={handleNavigate} />} 
            />
            <Route 
            path="/spots/:id" 
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
            path="/order-confirm" 
            element={
              <ProtectedRoute>
                <OrderConfirmPage />
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
                <BookingsPage />
              </ProtectedRoute>
            } 
            />
            <Route 
            path="/order/:orderNumber" 
            element={
              <ProtectedRoute>
                <OrderDetail />
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
    )
}

export default Router
