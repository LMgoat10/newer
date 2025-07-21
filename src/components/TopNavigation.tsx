import { Card, Button, Row, Col, Typography, Space, Avatar } from 'antd'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  UserOutlined,
  HomeOutlined,
  CreditCardOutlined,
  EnvironmentOutlined,
  ShoppingCartOutlined,
  WalletOutlined
} from '@ant-design/icons'
import { 
  Plane
} from 'lucide-react'
const { Title, Text } = Typography

interface TopNavigationProps {
  activeTab?: string
  onTabChange?: (tab: string) => void
}

function TopNavigation({ activeTab, onTabChange }: TopNavigationProps) {
  const location = useLocation()
  const navigate = useNavigate()
  
  const tabs = [
    { key: 'home', label: 'Home', icon: HomeOutlined, route: '/home' },
    { key: 'spots', label: 'Spots', icon: EnvironmentOutlined, route: '/spots' },
    { key: 'cart', label: 'Cart', icon: ShoppingCartOutlined, route: '/cart' },
    { key: 'wallet', label: 'Wallet', icon: WalletOutlined, route: '/wallet' },
    { key: 'bookings', label: 'Orders', icon: CreditCardOutlined, route: '/bookings' },
    { key: 'profile', label: 'Profile', icon: UserOutlined, route: '/profile' }
  ]

  // 根据当前路径确定活跃的标签
  const getCurrentActiveTab = () => {
    const currentPath = location.pathname
    
    // 如果传入了 activeTab，优先使用
    if (activeTab) {
      return activeTab
    }
    
    // 根据路径匹配对应的标签
    const matchedTab = tabs.find(tab => {
      if (tab.route === currentPath) {
        return true
      }
      // 对于动态路由，检查路径是否以该路由开头
      if (tab.key === 'destinations' && currentPath.startsWith('/spot/')) {
        return true
      }
      return false
    })
    
    return matchedTab?.key || 'home'
  }

  const currentActiveTab = getCurrentActiveTab()

  const handleTabClick = (tabKey: string) => {
    const tab = tabs.find(t => t.key === tabKey)
    if (tab) {
      navigate(tab.route)
    }
    // 如果传入了 onTabChange 回调，也调用它
    if (onTabChange) {
      onTabChange(tabKey)
    }
  }

  return (
    <Card 
      className="fixed top-0 left-0 w-full rounded-2xl border-t"
      style={{ zIndex: 1000 }}
    >
      <Row justify="space-around" align="middle" gutter={[16, 0]}>
         <Space>
            <Avatar 
              size={32} 
              style={{ backgroundColor: '#1890ff' }}
              icon={<Plane size={16} />}
            />
            <Title level={4} style={{ margin: 0, color: '#1f2937' }}>TripApp</Title>
          </Space>
        {tabs.map((tab) => {
          const IconComponent = tab.icon
          return (
            <Col key={tab.key}>
              <Button 
                type={currentActiveTab === tab.key ? 'primary' : 'text'}
                onClick={() => handleTabClick(tab.key)}
                style={{ 
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  height: 'auto',
                  minWidth: '80px',
                  padding: '8px 12px',
                  border: 'none',
                  boxShadow: 'none'
                }}
              >
                <IconComponent style={{ fontSize: '20px', marginBottom: '2px' }} />
                <Text style={{ fontSize: '12px', fontWeight: 500 }}>{tab.label}</Text>
              </Button>
            </Col>
          )
        })}
      </Row>
    </Card>
  )
}

export default TopNavigation
