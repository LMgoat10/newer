import React from 'react'
import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { Spin } from 'antd'
import { useAuth } from '../hooks/useAuth'
import UnauthorizedPage from './UnauthorizedPage'

interface AdminProtectedRouteProps {
  children: ReactNode
}

// 管理员路由保护组件
const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ children }) => {
  const { user, isLoading, isAuthenticated } = useAuth()
  const location = useLocation()

  // 如果正在加载，显示加载状态
  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <Spin size="large" />
      </div>
    )
  }

  // 如果用户未登录，重定向到登录页
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location, isAdmin: true }} replace />
  }

  // 检查是否是管理员账户
  // 这里我们检查用户角色是否为ADMIN，或者用户名是否为admin
  const isAdmin = user?.role === 'ADMIN' || 
                  (user?.email === 'admin@admin.com' || user?.name === 'admin')

  // 如果不是管理员，显示无权限页面
  if (!isAdmin) {
    return <UnauthorizedPage />
  }

  return <>{children}</>
}

export default AdminProtectedRoute
