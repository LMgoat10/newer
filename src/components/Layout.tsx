import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Layout as Layoutantd } from 'antd'
import BottomNavigation from './BottomNavigation'
interface LayoutProps {
  children: React.ReactNode
}

function Layout({ children }: LayoutProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const [activeTab, setActiveTab] = useState('home')

  // 根据当前路径设置活跃的tab
  useEffect(() => {
    const path = location.pathname
    if (path === '/' || path === '/home') {
      setActiveTab('home')
    } else if (path === '/search') {
      setActiveTab('search')
    } else if (path === '/bookings') {
      setActiveTab('bookings')
    } else if (path === '/wallet') {
      setActiveTab('wallet')
    } else if (path === '/profile') {
      setActiveTab('profile')
    } else if (path === '/travel') {
      setActiveTab('travel')
    }
  }, [location.pathname])

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    navigate(`/${tab}`)
  }

  return (
    <div className="min-h-screen bg-gray-50 rounded-xl">
      {/* Top Navigation */}
      <BottomNavigation activeTab={activeTab} onTabChange={handleTabChange} />

      <Layoutantd className="min-h-screen bg-gray-50" style={{paddingLeft: '8px', paddingRight: '8px' }}>
        {children}
        
        {/* Add some bottom padding to account for fixed navigation */}
        <div className="h-20"></div>
      </Layoutantd>
    </div>

  )
}

export default Layout
