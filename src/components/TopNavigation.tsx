import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ShoppingCart, Search, User, Bell } from 'lucide-react'
import { cartService } from '../services/cartService'
import { useAuth } from '../hooks/useAuth'

const TopNavigation: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const [cartItemCount, setCartItemCount] = useState(0)

  useEffect(() => {
    // 更新购物车数量
    const updateCartCount = async () => {
      try {
        const count = await cartService.getCartItemCount()
        setCartItemCount(count)
      } catch (error) {
        console.error('获取购物车数量失败:', error)
        setCartItemCount(0)
      }
    }

    // 初始化购物车数量
    updateCartCount()
    
    // 设置定期更新购物车数量
    const interval = setInterval(updateCartCount, 5000) // 每5秒更新一次

    return () => {
      clearInterval(interval)
    }
  }, [])

  const handleCartClick = () => {
    if (user) {
      navigate('/cart')
    } else {
      navigate('/login')
    }
  }

  const handleSearchClick = () => {
    navigate('/search')
  }

  const handleProfileClick = () => {
    if (user) {
      navigate('/profile')
    } else {
      navigate('/login')
    }
  }

  const getPageTitle = () => {
    const path = location.pathname
    if (path === '/' || path === '/home') return 'TripApp'
    if (path === '/search') return '搜索'
    if (path === '/destinations') return '景点'
    if (path === '/bookings') return '我的订单'
    if (path === '/wallet') return '我的钱包'
    if (path === '/profile') return '个人中心'
    if (path === '/cart') return '购物车'
    if (path === '/travel') return '旅行'
    if (path.startsWith('/spot/')) return '景点详情'
    return 'TripApp'
  }

  // 不在某些页面显示顶部导航栏
  const hiddenPages = ['/login', '/register']
  if (hiddenPages.includes(location.pathname)) {
    return null
  }

  return (
    <div className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* 左侧标题 */}
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900">
              {getPageTitle()}
            </h1>
          </div>

          {/* 右侧操作按钮 */}
          <div className="flex items-center space-x-4">
            {/* 搜索按钮 */}
            <button
              onClick={handleSearchClick}
              className="p-2 rounded-full text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* 通知按钮 */}
            <button className="p-2 rounded-full text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors">
              <Bell className="w-5 h-5" />
            </button>

            {/* 购物车按钮 */}
            <button
              onClick={handleCartClick}
              className="relative p-2 rounded-full text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItemCount > 99 ? '99+' : cartItemCount}
                </span>
              )}
            </button>

            {/* 用户头像 */}
            <button
              onClick={handleProfileClick}
              className="p-2 rounded-full text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              {user ? (
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-semibold">
                  {user.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              ) : (
                <User className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TopNavigation
