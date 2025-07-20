import { Card, Button, Row, Col, Typography, Space, Avatar } from 'antd'
import {
  UserOutlined,
  HomeOutlined,
  CreditCardOutlined,
  EnvironmentOutlined
} from '@ant-design/icons'
import { 
  Plane
} from 'lucide-react'
const { Title, Text } = Typography

interface BottomNavigationProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  const tabs = [
    { key: 'home', label: 'Home', icon: HomeOutlined, route: '/home' },
    { key: 'destinations', label: 'Spots', icon: EnvironmentOutlined, route: '/destinations' },
    { key: 'bookings', label: 'Orders', icon: CreditCardOutlined, route: '/bookings' },
    { key: 'profile', label: 'Profile', icon: UserOutlined, route: '/profile' }
  ]

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
                type={activeTab === tab.key ? 'primary' : 'text'}
                onClick={() => onTabChange(tab.key)}
                style={{ 
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  height: 'auto',
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

export default BottomNavigation
